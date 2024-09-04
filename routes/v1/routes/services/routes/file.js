const express = require("express");
const router = express.Router();
const createResponse = require("../../../../../helpers/createResponse");
const prisma = require("../../../../../config/prisma");
const uploadFileMiddleware = require("../../../../../middleware/fileMiddleware");
const { url } = require("inspector");
const {
  formatFileResponse,
} = require("../../../../../helpers/response/formatResponse");
const containerClient = require("../../../../../config/blobStorageConfig");

/**
 * @swagger
 * /file/{fileId}:
 *   get:
 *     summary: Retrieve a file by its ID
 *     description: Fetches the file details for the specified file ID. The request requires a valid tenant ID to be passed in custom claims.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           example: "abc123"
 *         description: The ID of the file to retrieve.
 *     responses:
 *       200:
 *         description: File details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Resource found"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "abc123"
 *                     name:
 *                       type: string
 *                       example: "example.pdf"
 *                     fileName:
 *                       type: string
 *                       example: "example.pdf"
 *                     url:
 *                       type: string
 *                       example: "https://storage.example.com/abc123/example.pdf"
 *                     contentType:
 *                       type: string
 *                       example: "application/pdf"
 *                     fileSize:
 *                       type: integer
 *                       example: 204800
 *       400:
 *         description: Missing required parameters (tenantId or fileId)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Missing required params"
 *                 error:
 *                   type: object
 *                   example: null
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Requested resource not found"
 *                 error:
 *                   type: object
 *                   example: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An error occurred while processing your request"
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Error details"
 */

router.get("/:fileId", async (req, res, next) => {
  console.log("Inside the file route");
  const { tenantId } = req.customClaims;
  const { fileId } = req.params;
  try {
    if (!tenantId || !fileId) {
      return createResponse(res, 400, "Missing required params", null, null);
    }

    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      return createResponse(
        res,
        404,
        "Requested resource not found",
        null,
        null
      );
    }

    const data = formatFileResponse(file);

    return createResponse(res, 200, "Resource found", data, null);
  } catch (error) {
    console.error("Error creating MTIC file record:", error);
    return createResponse(
      res,
      500,
      "An error occurred while processing your request",
      null,
      error
    );
  }
});

/**
 * @swagger
 * /file/{fileId}:
 *   delete:
 *     summary: Delete a file by its ID
 *     description: Deletes the file identified by the specified file ID. The request requires a valid tenant ID to be passed in custom claims.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           example: "abc123"
 *         description: The ID of the file to delete.
 *     responses:
 *       204:
 *         description: Resource deleted successfully. No content is returned.
 *       400:
 *         description: Missing required parameters (tenantId or fileId)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Missing required params"
 *                 error:
 *                   type: object
 *                   example: null
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Requested resource not found"
 *                 error:
 *                   type: object
 *                   example: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An error occurred while processing your request"
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Error details"
 */

router.delete("/:fileId", async (req, res, next) => {
  const { fileId } = req.params;
  const { tenantId } = req.customClaims;

  if (!tenantId || !fileId) {
    return createResponse(res, 400, "Missing required params", null, null);
  }

  try {
    // Step 1: Retrieve the file record from the database
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
        tenantid: tenantId,
      },
    });

    if (!file) {
      return createResponse(
        res,
        404,
        "Requested resource not found",
        null,
        null
      );
    }

    // Step 2: Delete the file from Azure Blob Storage
    const blockBlobClient = containerClient.getBlockBlobClient(file.blobName);
    await blockBlobClient.deleteIfExists(); // Delete the blob if it exists

    // Step 3: Delete the file record from the database
    await prisma.file.delete({
      where: {
        id: fileId,
      },
    });

    return createResponse(
      res,
      204,
      "Resource deleted successfully",
      null,
      null
    );
  } catch (error) {
    if (error.code === "P2025") {
      return createResponse(res, 404, "File not found", null, null);
    }

    console.error("Error deleting file record:", error);
    return createResponse(
      res,
      500,
      "An error occurred while processing your request",
      null,
      { error: error.message }
    );
  }
});

module.exports = router;

router.post("/mtic", uploadFileMiddleware, async (req, res, next) => {
  const { mtic } = req.body;
  const file = req.savedFile;

  // Validate input
  if (!mtic || !file) {
    return createResponse(res, 400, "Missing required parameters", null, null);
  }

  try {
    const newMTICFile = await prisma.mTICFile.create({
      data: {
        mticId: mtic,
        fileId: file.id,
      },
      include: {
        file: true,
      },
    });

    const fileData = formatFileResponse(newMTICFile.file);

    const data = {
      id: newMTICFile.id,
      mticId: newMTICFile.mticId,
      file: fileData,
    };

    return createResponse(
      res,
      201,
      "MTIC file record created successfully",
      data,
      null
    );
  } catch (error) {
    console.error("Error creating MTIC file record:", error);

    if (error.code === "P2002") {
      // Unique constraint error (example)
      return createResponse(
        res,
        409,
        "A file with this ID already exists",
        null,
        error
      );
    }

    return createResponse(
      res,
      500,
      "An internal server error occurred while processing your request",
      null,
      { error: error.message }
    );
  }
});

/**
 * @swagger
 * /file/mtic-document:
 *   post:
 *     summary: Create a new MTIC Document file record
 *     description: Associates an uploaded file with an MTIC Document ID. The file must be uploaded using the provided middleware before being associated.
 *     tags:
 *       - MTIC Documents
 *       - Files
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               mticDocumentId:
 *                 type: string
 *                 description: The ID of the MTIC Document to associate with the file.
 *                 example: "mticDoc_12345"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded and associated with the MTIC Document.
 *     responses:
 *       201:
 *         description: MTIC Document file record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "MTIC Document file record created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "abc123"
 *                     mticDocumentId:
 *                       type: string
 *                       example: "mticDoc_12345"
 *                     file:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "file_12345"
 *                         name:
 *                           type: string
 *                           example: "example.pdf"
 *                         fileName:
 *                           type: string
 *                           example: "example.pdf"
 *                         url:
 *                           type: string
 *                           example: "https://storage.example.com/abc123/example.pdf"
 *                         contentType:
 *                           type: string
 *                           example: "application/pdf"
 *                         fileSize:
 *                           type: integer
 *                           example: 204800
 *       400:
 *         description: Missing required parameters (MTIC Document ID or file)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Missing required parameters"
 *                 error:
 *                   type: object
 *                   example: null
 *       409:
 *         description: Conflict due to unique constraint violation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "A document with this ID already exists"
 *                 error:
 *                   type: object
 *                   example: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An internal server error occurred while processing your request"
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Error details"
 */

router.post("/mtic-document", uploadFileMiddleware, async (req, res, next) => {
  const { mticDocumentId } = req.body;
  const file = req.savedFile;

  // Validate input
  if (!mticDocumentId || !file) {
    return createResponse(res, 400, "Missing required parameters", null, null);
  }

  try {
    const newMTICDocumentFile = await prisma.mTICDocumentFile.create({
      data: {
        id: mticDocumentId,
        fileId: file.id,
      },
      include: {
        file: true,
      },
    });

    const fileData = formatFileResponse(newMTICDocumentFile.file);

    const data = {
      id: newMTICDocumentFile.id,
      mticDocumentId: newMTICDocumentFile.mticDocumentId,
      file: fileData,
    };

    return createResponse(
      res,
      201,
      "MTIC Document file record created successfully",
      data,
      null
    );
  } catch (error) {
    console.error("Error creating MTIC Document file record:", error);

    if (error.code === "P2002") {
      // Prisma unique constraint error example
      return createResponse(
        res,
        409,
        "A document with this ID already exists",
        null,
        error
      );
    }

    return createResponse(
      res,
      500,
      "An internal server error occurred while processing your request",
      null,
      { error: error.message }
    );
  }
});

/**
 * @swagger
 * /file/document:
 *   post:
 *     summary: Create a new Document file record
 *     description: Associates an uploaded file with a Document ID. The file must be uploaded using the provided middleware before being associated.
 *     tags:
 *       - Documents
 *       - Files
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documentId:
 *                 type: string
 *                 description: The ID of the Document to associate with the file.
 *                 example: "doc_12345"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded and associated with the Document.
 *     responses:
 *       201:
 *         description: Document file record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Document file record created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "abc123"
 *                     documentId:
 *                       type: string
 *                       example: "doc_12345"
 *                     file:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "file_12345"
 *                         name:
 *                           type: string
 *                           example: "example.pdf"
 *                         fileName:
 *                           type: string
 *                           example: "example.pdf"
 *                         url:
 *                           type: string
 *                           example: "https://storage.example.com/abc123/example.pdf"
 *                         contentType:
 *                           type: string
 *                           example: "application/pdf"
 *                         fileSize:
 *                           type: integer
 *                           example: 204800
 *       400:
 *         description: Missing required parameters (Document ID or file)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Document ID and file are required"
 *                 error:
 *                   type: object
 *                   example: null
 *       409:
 *         description: Conflict due to unique constraint violation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "A document with this ID already exists"
 *                 error:
 *                   type: object
 *                   example: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An internal server error occurred while processing your request"
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Error details"
 */

router.post("/document", uploadFileMiddleware, async (req, res, next) => {
  const { documentId } = req.body;
  const file = req.savedFile;

  if (!documentId || !file) {
    return createResponse(
      res,
      400,
      "Document ID and file are required",
      null,
      null
    );
  }

  try {
    const newDocumentFile = await prisma.documentFile.create({
      data: {
        id: documentId,
        fileId: file.id,
      },
      include: {
        file: true,
      },
    });

    const fileData = formatFileResponse(newDocumentFile.file);

    const data = {
      id: newDocumentFile.id,
      documentId: newDocumentFile.documentId,
      file: fileData,
    };

    return createResponse(
      res,
      201,
      "Document file record created successfully",
      data,
      null
    );
  } catch (error) {
    console.error("Error creating document file record:", error);

    if (error.code === "P2002") {
      // Prisma unique constraint error example
      return createResponse(
        res,
        409,
        "A document with this ID already exists",
        null,
        error
      );
    }

    return createResponse(
      res,
      500,
      "An internal server error occurred while processing your request",
      null,
      { error: error.message }
    );
  }
});

router.post(
  "/document-template",
  uploadFileMiddleware,
  async (req, res, next) => {
    const { documentTemplateId } = req.body;
    const file = req.savedFile;

    try {
      if (!documentTemplateId || !file) {
        return createResponse(
          res,
          400,
          "MTIC Document ID and file are required",
          null,
          null
        );
      }

      const newDocumentTemplateFile = await prisma.documentTemplateFile.create({
        data: {
          id: documentTemplateId,
          fileId: file.id,
        },
        include: {
          file: true,
        },
      });

      if (!newDocumentTemplateFile) {
        return createResponse(
          res,
          500,
          "An error occurred while creating the MTIC file record",
          null,
          null
        );
      }

      const fileData = formatFileResponse(newDocumentTemplateFile.file);

      const data = {
        id: newDocumentTemplateFile.id,
        mticDocumentId: newDocumentTemplateFile.documentTemplateId,
        file: fileData,
      };

      return createResponse(
        res,
        200,
        "Document template file record created successfully",
        data,
        null
      );
    } catch (error) {
      console.error("Error creating MTIC file record:", error);
      return createResponse(
        res,
        500,
        "An error occurred while processing your request",
        null,
        error
      );
    }
  }
);

module.exports = router;
