const express = require("express");
const router = express.Router();
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const docFormatHelper = require("../../../../../helpers/docFormatHelper");
const createResponse = require("../../../../../helpers/createResponse");
const validateMticReader = require("../../../../../helpers/mtic/validateMticReader");

/**
 * @swagger
 * /document-requests/org-documents:
 *   get:
 *     summary: Get documents for a specific organization
 *     description: >
 *       Retrieves documents associated with a specific tenant organization.
 *       The results are paginated.
 *     tags:
 *       - Documents
 *     parameters:
 *       - in: query
 *         name: tenantOrgId
 *         required: true
 *         schema:
 *           type: string
 *           example: "org_12345"
 *         description: The ID of the tenant organization whose documents are being retrieved.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 25
 *         description: The number of documents to retrieve per page.
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
 *                   type: object
 *                   properties:
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "doc_12345"
 *                           uid:
 *                             type: string
 *                             example: "DOC-2023-001"
 *                           name:
 *                             type: string
 *                             example: "Document Name"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-08-01T12:34:56Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-08-01T12:34:56Z"
 *                           tenantOrgId:
 *                             type: string
 *                             example: "org_12345"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalDocuments:
 *                           type: integer
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           example: 4
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         perPage:
 *                           type: integer
 *                           example: 25
 *       400:
 *         description: "Bad Request - Missing or invalid tenantOrgId"
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
 *                   example: "Missing or invalid tenantOrgId"
 *       500:
 *         description: "Database error"
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
 *                   example: "Database error"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DATABASE_ERROR"
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while retrieving documents."
 */

router.get("/org-documents", async (req, res, next) => {
  const { tenantOrgId } = req.query;

  // Get pagination parameters from query (default to page 1, limit 10)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;

  try {
    const [documents, totalDocuments] = await Promise.all([
      prisma.document.findMany({
        where: {
          tenantOrgId: tenantOrgId,
        },
        skip: skip,
        take: limit,
      }),
      prisma.document.count({
        where: {
          tenantOrgId: tenantOrgId,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalDocuments / limit);

    const paginationInfo = {
      totalDocuments,
      totalPages,
      currentPage: page,
      perPage: limit,
    };

    return createResponse(res, 200, "Documents retrieved successfully", {
      documents,
      pagination: paginationInfo,
    });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return createResponse(res, statusCode, message, null, {
      code: "DATABASE_ERROR",
      description: error.message,
    });
  }
});

/**
 * @swagger
 * /document-requests/org-document-templates:
 *   get:
 *     summary: Get document templates for a specific organization
 *     description: >
 *       Retrieves document templates associated with a specific tenant organization.
 *       The results are paginated.
 *     tags:
 *       - Document Templates
 *     parameters:
 *       - in: query
 *         name: tenantOrgId
 *         required: true
 *         schema:
 *           type: string
 *           example: "org_12345"
 *         description: The ID of the tenant organization whose document templates are being retrieved.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 25
 *         description: The number of document templates to retrieve per page.
 *     responses:
 *       200:
 *         description: "Document templates retrieved successfully"
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
 *                   example: "Document templates retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "docTemplate_12345"
 *                           name:
 *                             type: string
 *                             example: "Document Template Name"
 *                           description:
 *                             type: string
 *                             example: "A description of the document template."
 *                           headerFields:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 key:
 *                                   type: string
 *                                   example: "header_1"
 *                                 label:
 *                                   type: string
 *                                   example: "Header Label"
 *                                 type:
 *                                   type: string
 *                                   example: "text"
 *                                 value:
 *                                   type: string
 *                                   example: "Header Value"
 *                           bodyFields:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 key:
 *                                   type: string
 *                                   example: "body_1"
 *                                 label:
 *                                   type: string
 *                                   example: "Body Label"
 *                                 type:
 *                                   type: string
 *                                   example: "text"
 *                                 value:
 *                                   type: string
 *                                   example: "Body Value"
 *                           documentConfigId:
 *                             type: string
 *                             example: "docConfig_12345"
 *                           documentConfigName:
 *                             type: string
 *                             example: "Document Config Name"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalDocuments:
 *                           type: integer
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           example: 4
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         perPage:
 *                           type: integer
 *                           example: 25
 *       400:
 *         description: "Bad Request - Missing or invalid tenantOrgId"
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
 *                   example: "Missing or invalid tenantOrgId"
 *       500:
 *         description: "Database error"
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
 *                   example: "Database error"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DATABASE_ERROR"
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while retrieving document templates."
 */

router.get("/org-document-templates", async (req, res, next) => {
  const { tenantOrgId } = req.query;

  // Get pagination parameters from query (default to page 1, limit 10)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;

  try {
    const tenantOrgDocTemplates = await prisma.tenantOrgDoc.findMany({
      where: {
        tenantOrgId: tenantOrgId,
      },
      include: {
        documentTemplate: {
          include: {
            documentConfig: true,
          },
        },
      },
      skip: skip,
      take: limit,
    });

    const formattedDocumentArray = tenantOrgDocTemplates.map((item) => ({
      id: item.documentTemplateId,
      name: item.documentTemplate.name,
      description: item.documentTemplate.description,
      headerFields: item.documentTemplate.templateFieldConfig.templateFields,
      bodyFields: item.documentTemplate.templateFieldConfig.documentFields,
      documentConfigId: item.documentTemplate.documentConfig.id,
      documentConfigName: item.documentTemplate.documentConfig.name,
    }));

    const totalDocuments = formattedDocumentArray.length;
    const totalPages = Math.ceil(totalDocuments / limit);

    const paginationInfo = {
      totalDocuments,
      totalPages,
      currentPage: page,
      perPage: limit,
    };

    return createResponse(res, 200, "Documents retrieved successfully", {
      documents: formattedDocumentArray,
      pagination: paginationInfo,
    });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return createResponse(res, statusCode, message, null, {
      code: "DATABASE_ERROR",
      description: error.message,
    });
  }
});

/**
 * @swagger
 * /document-requests/org-document:
 *   post:
 *     summary: Create a document for a specific organization
 *     description: >
 *       Creates a new document for a specific tenant organization based on the provided document template and field values.
 *     tags:
 *       - Documents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenant_org_id:
 *                 type: string
 *                 example: "org_12345"
 *                 description: The ID of the tenant organization.
 *               uid:
 *                 type: string
 *                 example: "DOC-2023-001"
 *                 description: The unique identifier for the document.
 *               document_data:
 *                 type: object
 *                 properties:
 *                   document_template_id:
 *                     type: string
 *                     example: "template_12345"
 *                     description: The ID of the document template.
 *                   document_field_values:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         key:
 *                           type: string
 *                           example: "field_1"
 *                         value:
 *                           type: string
 *                           example: "Value for field 1"
 *                     description: Array of key-value pairs representing document field values.
 *     responses:
 *       201:
 *         description: "Successful request"
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
 *                   example: "Succesful request"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "doc_67890"
 *                     uid:
 *                       type: string
 *                       example: "DOC-2023-001"
 *                     documentTemplateId:
 *                       type: string
 *                       example: "template_12345"
 *                     tenantId:
 *                       type: string
 *                       example: "tenant_12345"
 *                     tenantOrgId:
 *                       type: string
 *                       example: "org_12345"
 *                     documentFields:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           key:
 *                             type: string
 *                             example: "field_1"
 *                           value:
 *                             type: string
 *                             example: "Value for field 1"
 *                     createdById:
 *                       type: string
 *                       example: "user_67890"
 *       400:
 *         description: "Request body is incomplete or malformed"
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
 *                   example: "Request body is incomplete or malformed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "document_field_values is required"
 *       404:
 *         description: "The requested resource does not exist"
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
 *                   example: "The requested resource does not exist"
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
 *                   example: "Internal server error"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DATABASE_ERROR"
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while creating the document."
 */

router.post("/org-document", async (req, res, next) => {
  const { tenantUserId, tenantId } = req.customClaims;
  const { tenant_org_id, uid, document_data } = req.body;
  const { document_template_id, document_field_values } = document_data;

  if (
    !tenant_org_id ||
    !document_data ||
    !document_template_id ||
    !document_field_values
  ) {
    return createResponse(
      res,
      400,
      "Request body is incomplete or malformed",
      null
    );
  }

  try {
    const tenantOrgDoc = await prisma.tenantOrgDoc.findUnique({
      where: {
        tenantOrgId_documentTemplateId: {
          tenantOrgId: tenant_org_id,
          documentTemplateId: document_template_id,
        },
      },
      select: {
        documentTemplate: {
          select: {
            templateFieldConfig: true,
          },
        },
      },
    });

    console.log("Org Doc returned", tenantOrgDoc);

    if (!tenantOrgDoc) {
      return createResponse(
        res,
        404,
        "The requested resource does not exist",
        null,
        null
      );
    }

    const documentFieldConfig =
      tenantOrgDoc.documentTemplate.templateFieldConfig.documentFields;

    console.log("FieldConfig", documentFieldConfig);

    const validateDocFields = docFormatHelper(
      documentFieldConfig,
      document_field_values
    );

    if (!validateDocFields.isValid) {
      return createResponse(
        res,
        400,
        "Document field values are malformed",
        validateDocFields.errors,
        null
      );
    }

    //Attempt to create the document
    try {
      const document = await prisma.document.create({
        data: {
          uid: uid,
          documentTemplateId: document_template_id,
          tenantId: tenantId,
          tenantOrgId: tenant_org_id,
          documentFields: document_field_values,
          createdById: tenantUserId,
        },
      });

      return createResponse(res, 201, "Succesful request", document, null);
    } catch (error) {
      return createResponse(
        res,
        500,
        "An database error occurred",
        null,
        error
      );
    }

    //const validateDocumentFields =
  } catch (error) {
    return createResponse(res, 500, "Internal server error", null, error);
  }
});

/**
 * @swagger
 * /document-requests/document/{id}:
 *   get:
 *     summary: Get a specific document by ID
 *     description: >
 *       Retrieves a document by its ID, including details about the document template, fields,
 *       the user who created it, and timestamps for when it was created and last updated.
 *     tags:
 *       - Documents
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "doc_12345"
 *         description: The ID of the document to retrieve.
 *     responses:
 *       200:
 *         description: "Requested document found"
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
 *                   example: "Requested document found"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "doc_12345"
 *                     uid:
 *                       type: string
 *                       example: "DOC-2023-001"
 *                     document_template:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "template_12345"
 *                         name:
 *                           type: string
 *                           example: "Document Template Name"
 *                         description:
 *                           type: string
 *                           example: "A description of the document template."
 *                         image:
 *                           type: string
 *                           example: "https://example.com/image.png"
 *                         fields:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               key:
 *                                 type: string
 *                                 example: "field_1"
 *                               label:
 *                                 type: string
 *                                 example: "Field Label"
 *                               type:
 *                                 type: string
 *                                 example: "text"
 *                               value:
 *                                 type: string
 *                                 example: "Field Value"
 *                     fields:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           key:
 *                             type: string
 *                             example: "field_1"
 *                           value:
 *                             type: string
 *                             example: "Field Value"
 *                     created_by:
 *                       type: string
 *                       example: "John Doe"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-08-01T12:34:56Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-08-02T14:34:56Z"
 *       404:
 *         description: "Document not found"
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
 *                   example: "Document not found"
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
 *                   example: "Internal server error"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "DATABASE_ERROR"
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while retrieving the document."
 */

router.get("/document/:id", async (req, res, next) => {
  const { tenantId, tenantUserId } = req.customClaims;
  const { id } = req.params;
  try {
    //Database query

    let requestedDocument;
    try {
      const document = await prisma.document.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          uid: true,
          documentTemplate: true,
          documentFields: true,
          tenant: true,
          tenantOrg: true,
          createdAt: true,
          createdBy: {
            select: {
              user: true,
            },
          },
          updatedAt: true,
        },
      });

      const formattedDocument = {
        id: document.id,
        uid: document.uid,
        document_template: {
          id: document.documentTemplate.id,
          name: document.documentTemplate.name,
          description: document.documentTemplate.name,
          image: document.documentTemplate.image,
          fields: document.documentTemplate.templateFieldConfig.templateFields,
        },
        fields: document.documentFields,
        created_by: document.createdBy.user.name,
        created_at: document.createdAt,
        updated_at: document.updatedAt,
      };

      requestedDocument = formattedDocument;
    } catch (error) {
      return createResponse(res, 500, "Internal server error", null, error);
    }
    return createResponse(
      res,
      200,
      "Requested document found",
      requestedDocument,
      null
    );
  } catch (error) {
    return createResponse(res, 500, "Internal server error", null, error);
  }
});

module.exports = router;
