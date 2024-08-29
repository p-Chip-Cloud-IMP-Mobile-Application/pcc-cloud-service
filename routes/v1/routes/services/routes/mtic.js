const express = require("express");
const router = express.Router();
const prisma = require("../../../../../config/prisma");
const createResponse = require("../../../../../helpers/createResponse");
const validateMticReader = require("../../../../../helpers/mtic/validateMticReader");
const validateMticArray = require("../../../../../helpers/mtic/validateMticArray");
const { validateHeaderValue } = require("http");

/**
 * @swagger
 * /mtic-requests/start-mtic-session:
 *   post:
 *     summary: Start a new MTIC session
 *     description: >
 *       Initiates a new MTIC session using the provided MTIC reader and location data.
 *       The MTIC reader is validated before starting the session.
 *     tags:
 *       - MTIC Session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mticReaderId:
 *                 type: string
 *                 example: "mtic_reader_12345"
 *                 description: The ID of the MTIC reader.
 *               lat:
 *                 type: number
 *                 format: float
 *                 example: 37.7749
 *                 description: The latitude of the location where the session is started.
 *               lon:
 *                 type: number
 *                 format: float
 *                 example: -122.4194
 *                 description: The longitude of the location where the session is started.
 *     responses:
 *       201:
 *         description: "Session Created Successfully"
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
 *                   example: "Session Created Successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "session_67890"
 *                     mticReaderId:
 *                       type: string
 *                       example: "mtic_reader_12345"
 *                     tenantUserId:
 *                       type: string
 *                       example: "tenant_user_12345"
 *                     lat:
 *                       type: number
 *                       format: float
 *                       example: 37.7749
 *                     lon:
 *                       type: number
 *                       format: float
 *                       example: -122.4194
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-08-01T12:34:56Z"
 *       400:
 *         description: "Bad Request - Invalid input or MTIC reader validation failed"
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
 *                   example: "Missing or malformed request or MTIC reader validation failed"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_INPUT | MTIC_READER_ERROR"
 *                     description:
 *                       type: string
 *                       example: "One or more required fields are missing or malformed, or the MTIC reader could not be validated."
 *       500:
 *         description: "Internal Server Error"
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
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DATABASE_ERROR | VALIDATION_ERROR"
 *                     description:
 *                       type: string
 *                       example: "An error occurred while creating the MTIC session or validating the MTIC reader."
 *                     details:
 *                       type: string
 *                       example: "Error message details"
 */

router.post("/start-mtic-session", async (req, res, next) => {
  const { tenantId, tenantUserId } = req.customClaims;
  const { mticReaderId, lat, lon } = req.body;

  // Validate input
  if (!tenantId || !tenantUserId || !mticReaderId || !lat || !lon) {
    return createResponse(res, 400, "Missing or malformed request", null, {
      code: "INVALID_INPUT",
      description: "One or more required fields are missing or malformed.",
    });
  }

  try {
    // Validate the MTIC Reader
    const mticReaderValidation = await validateMticReader(
      mticReaderId,
      tenantId
    );

    if (!mticReaderValidation || !mticReaderValidation.isActive) {
      return createResponse(res, 400, "MTIC reader validation failed", null, {
        code: "MTIC_READER_ERROR",
        description:
          "The MTIC reader has been deactivated or could not be registered.",
      });
    }

    try {
      // Attempt to create a new MTIC session
      const newMTICSession = await prisma.mTICSession.create({
        data: {
          mticReaderId: mticReaderId,
          tenantUserId: tenantUserId,
          lat: lat,
          lon: lon,
        },
      });

      return createResponse(
        res,
        201,
        "Session Created Successfully",
        newMTICSession,
        null
      );
    } catch (error) {
      console.error("Error creating MTIC session:", error);
      return createResponse(res, 500, "Internal Server Error", null, {
        code: "DATABASE_ERROR",
        description: "An error occurred while creating the MTIC session.",
        details: error.message,
      });
    }
  } catch (error) {
    console.error("Error validating MTIC reader:", error);
    return createResponse(res, 500, "Internal Server Error", null, {
      code: "VALIDATION_ERROR",
      description: "An error occurred while validating the MTIC reader.",
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /mtic-requests/end-mtic-session/{mticSessionId}:
 *   put:
 *     summary: End an active MTIC session
 *     description: >
 *       Ends the active MTIC session by updating the end time. The session must belong to the authenticated user
 *       and must not have been ended already.
 *     tags:
 *       - MTIC Session
 *     parameters:
 *       - in: path
 *         name: mticSessionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "session_67890"
 *         description: The ID of the MTIC session to end.
 *     responses:
 *       200:
 *         description: "Session ended successfully"
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
 *                   example: "Session ended successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     mticSessionId:
 *                       type: string
 *                       example: "session_67890"
 *       404:
 *         description: "Session not found or already ended"
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
 *                   example: "Session not found or already ended"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "SESSION_NOT_FOUND"
 *                     description:
 *                       type: string
 *                       example: "The MTIC session either does not exist, does not belong to the user, or has already ended."
 *       500:
 *         description: "Internal server error"
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
 *                   example: "Internal server error. Please try again later"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DATABASE_ERROR"
 *                     description:
 *                       type: string
 *                       example: "An error occurred while ending the MTIC session."
 *                     details:
 *                       type: string
 *                       example: "Error message details"
 */

router.put("/end-mtic-session/:mticSessionId", async (req, res, next) => {
  const { tenantUserId } = req.customClaims;
  const { mticSessionId } = req.params;

  try {
    const mticSession = await prisma.mTICSession.update({
      where: {
        id: mticSessionId,
        endDateTime: null,
        tenantUserId: tenantUserId,
      },
      data: {
        endDateTime: new Date(),
      },
    });

    if (!mticSession) {
      return createResponse(
        res,
        404,
        "Session not found or already ended",
        null,
        {
          code: "SESSION_NOT_FOUND",
          description:
            "The MTIC session either does not exist, does not belong to the user, or has already ended.",
        }
      );
    }

    const data = {
      mticSessionId: mticSession.id,
    };

    return createResponse(res, 200, "Session ended successfully", data, null);
  } catch (error) {
    console.error("Error ending MTIC session:", error);
    return createResponse(
      res,
      500,
      "Internal server error. Please try again later",
      null,
      {
        code: "DATABASE_ERROR",
        description: "An error occurred while ending the MTIC session.",
        details: error.message,
      }
    );
  }
});

/**
 * @swagger
 * /mtic-requests/mtic-documents:
 *   post:
 *     summary: Save MTIC records and associate them with a document
 *     description: >
 *       This endpoint saves MTIC records and associates them with an existing document and MTIC session.
 *       The MTIC array must contain objects with id and uid pairs.
 *     tags:
 *       - MTIC Documents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mticSessionId:
 *                 type: string
 *                 example: "session_67890"
 *                 description: The ID of the MTIC session.
 *               documentId:
 *                 type: string
 *                 example: "doc_12345"
 *                 description: The ID of the document to associate with the MTIC records.
 *               mtics:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "mtic_12345"
 *                     uid:
 *                       type: string
 *                       example: "uid_12345"
 *                 description: An array of MTIC objects with id and uid pairs.
 *     responses:
 *       201:
 *         description: "MTIC Records Saved"
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
 *                   example: "MTIC Records Saved"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mticId:
 *                         type: string
 *                         example: "mtic_12345"
 *                       mticSessionId:
 *                         type: string
 *                         example: "session_67890"
 *                       documentId:
 *                         type: string
 *                         example: "doc_12345"
 *       400:
 *         description: "Invalid input or MTIC array structure"
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
 *                   example: "Missing or malformed request parameters or Invalid MTIC array structure"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_INPUT | INVALID_MTIC_ARRAY"
 *                     description:
 *                       type: string
 *                       example: "mticSessionId, documentId, and mtics are required. The mtic array must contain objects with id and uid pairs."
 *       404:
 *         description: "Session or document not found"
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
 *                   example: "Requested session or document does not exist"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "SESSION_NOT_FOUND | DOCUMENT_NOT_FOUND"
 *                     description:
 *                       type: string
 *                       example: "The MTIC session or document with the given ID does not exist."
 *       500:
 *         description: "Internal server error"
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
 *                   example: "Internal server error. Please try again later"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DATABASE_ERROR"
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while processing MTIC documents."
 *                     details:
 *                       type: string
 *                       example: "Error message details"
 */

router.post("/mtic-documents", async (req, res, next) => {
  const { tenantId, tenantUserId } = req.customClaims;
  const { mticSessionId, documentId, mtics } = req.body;

  // Validate input
  if (!mticSessionId || !documentId || !mtics) {
    return createResponse(
      res,
      400,
      "Missing or malformed request parameters",
      null,
      {
        code: "INVALID_INPUT",
        description: "mticSessionId, documentId, and mtics are required.",
      }
    );
  }

  try {
    // Validate MTIC array structure
    const mticArrayValidation = validateMticArray(mtics);
    if (!mticArrayValidation.isValid) {
      return createResponse(res, 400, "Invalid MTIC array structure", null, {
        code: "INVALID_MTIC_ARRAY",
        description:
          "The mtic array must be an array of objects with id and uid value pairs.",
      });
    }

    // Fetch MTIC session
    const mticSession = await prisma.mTICSession.findUnique({
      where: { id: mticSessionId },
    });

    if (!mticSession) {
      return createResponse(
        res,
        404,
        "Requested session does not exist",
        null,
        {
          code: "SESSION_NOT_FOUND",
          description: "The MTIC session with the given ID does not exist.",
        }
      );
    }

    // Fetch document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return createResponse(
        res,
        404,
        "Requested document does not exist",
        null,
        {
          code: "DOCUMENT_NOT_FOUND",
          description: "The document with the given ID does not exist.",
        }
      );
    }

    // Create MTICs
    const createAllMtics = await prisma.mTIC.createMany({
      data: mtics,
      skipDuplicates: true,
    });

    if (!createAllMtics) {
      return createResponse(res, 500, "Failed to save MTIC records", null, {
        code: "MTIC_CREATION_FAILED",
        description: "An error occurred while saving MTIC records.",
      });
    }

    // Map MTICs to MTICDocument records
    const mticDocumentsData = mtics.map((mtic) => ({
      mticId: mtic.id,
      mticSessionId,
      documentId,
    }));

    // Create MTICDocument records
    const newMticsDocuments = await prisma.mTICDocument.createMany({
      data: mticDocumentsData,
    });

    if (!newMticsDocuments) {
      return createResponse(res, 500, "Failed to create MTIC documents", null, {
        code: "MTIC_DOCUMENT_CREATION_FAILED",
        description: "An error occurred while creating MTIC documents.",
      });
    }

    return createResponse(
      res,
      201,
      "MTIC Records Saved",
      newMticsDocuments,
      null
    );
  } catch (error) {
    console.error("Error processing MTIC documents:", error);
    return createResponse(
      res,
      500,
      "Internal server error. Please try again later",
      null,
      {
        code: "DATABASE_ERROR",
        description:
          "An unexpected error occurred while processing MTIC documents.",
        details: error.message,
      }
    );
  }
});

/**
 * @swagger
 * /mtic-requests/mtic-documents/{mticId}:
 *   get:
 *     summary: Get documents associated with a specific MTIC ID
 *     description: >
 *       Retrieves all documents associated with a given MTIC ID. If no documents are found, a 404 error is returned.
 *     tags:
 *       - MTIC Documents
 *     parameters:
 *       - in: path
 *         name: mticId
 *         required: true
 *         schema:
 *           type: string
 *           example: "mtic_12345"
 *         description: The ID of the MTIC to retrieve associated documents for.
 *     responses:
 *       200:
 *         description: "Documents retrieved successfully"
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
 *                   example: "Documents retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "doc_12345"
 *                       mticId:
 *                         type: string
 *                         example: "mtic_12345"
 *                       documentId:
 *                         type: string
 *                         example: "doc_67890"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-08-01T12:34:56Z"
 *       404:
 *         description: "No documents found for the given MTIC ID"
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
 *                   example: "No documents found for the given MTIC ID"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DOCUMENTS_NOT_FOUND"
 *                     description:
 *                       type: string
 *                       example: "No MTIC documents were found for the specified MTIC ID."
 *       500:
 *         description: "Internal server error"
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
 *                   example: "Internal server error. Please try again later"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DATABASE_ERROR"
 *                     description:
 *                       type: string
 *                       example: "An error occurred while retrieving MTIC documents."
 *                     details:
 *                       type: string
 *                       example: "Error message details"
 */

router.get("/mtic-documents/:mticId", async (req, res, next) => {
  const { mticId } = req.params;

  try {
    const mticDocuments = await prisma.mTICDocument.findMany({
      where: {
        mticId: mticId,
      },
      select: {
        mtic: true,
        document: true,
      },
    });

    if (!mticDocuments || mticDocuments.length === 0) {
      return createResponse(
        res,
        404,
        "No documents found for the given MTIC ID",
        null,
        {
          code: "DOCUMENTS_NOT_FOUND",
          description:
            "No MTIC documents were found for the specified MTIC ID.",
        }
      );
    }

    return createResponse(
      res,
      200,
      "Documents retrieved successfully",
      mticDocuments,
      null
    );
  } catch (error) {
    console.error("Error retrieving MTIC documents:", error);
    return createResponse(
      res,
      500,
      "Internal server error. Please try again later",
      null,
      {
        code: "DATABASE_ERROR",
        description: "An error occurred while retrieving MTIC documents.",
        details: error.message,
      }
    );
  }
});

router.get("/mtic/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const mtic = await prisma.mTIC.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        uid: true,
        mticDocuments: {
          select: {
            id: true,
            document: {
              select: {
                documentFields: true,
                documentTemplate: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    image: true,
                    templateFieldConfig: true,
                    documentConfig: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const data = {
      id: mtic.id,
      uid: mtic.uid,
      documents: mtic.mticDocuments.map((doc) => ({
        id: doc.id,
        documentTemplate: {
          id: doc.document.documentTemplate.id,
          name: doc.document.documentTemplate.name,
          description: doc.document.documentTemplate.description,
          image: doc.document.documentTemplate.image,
        },
        headerFields:
          doc.document.documentTemplate.templateFieldConfig.templateFields.map(
            (field) => ({
              key: field.key,
              type: field.type,
              label: field.label,
              value: field.value,
            })
          ),
        bodyFields:
          doc.document.documentTemplate.templateFieldConfig.documentFields.map(
            (field) => ({
              key: field.key,
              type: field.type,
              label: field.label,
              value: field.value,
            })
          ),
      })),
    };

    console.log("Data", data);
    console.log("template data", data.documents);

    return createResponse(res, 200, "Record found", data, null);
  } catch (error) {
    console.error("Error processing MTIC documents:", error);
    return createResponse(
      res,
      500,
      "Internal server error. Please try again later",
      null,
      {
        code: "DATABASE_ERROR",
        description:
          "An unexpected error occurred while processing MTIC documents.",
        details: error.message,
      }
    );
  }
});

module.exports = router;
