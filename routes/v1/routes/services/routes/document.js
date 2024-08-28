const express = require("express");
const router = express.Router();
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const docFormatHelper = require("../../../../../helpers/docFormatHelper");
const createResponse = require("../../../../../helpers/createResponse");
const validateMticReader = require("../../../../../helpers/mtic/validateMticReader");

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
      header_fields: item.documentTemplate.templateFieldConfig.templateFields,
      body_fields: item.documentTemplate.templateFieldConfig.documentFields,
      document_config_id: item.documentTemplate.documentConfig.id,
      document_config_name: item.documentTemplate.documentConfig.name,
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

router.post("/mtic-document", async (req, res, next) => {
  const { tenantId, tenantUserId } = req.customClaims;
  const { documentId, mticMeta, mtic } = req.body;

  if (!documentId || !mticMeta || !mtic) {
    return createResponse(
      res,
      400,
      "Request body is incomplete or malformed",
      null
    );
  }

  const { mticReaderId, lat, lon } = mticMeta;

  if (!mticReaderId || !lat || !lon) {
    return createResponse(
      res,
      400,
      "MTIC Meta data is malformed. Please provide mticReaderId, lat and lon variables",
      null
    );
  }

  const mticReader = await validateMticReader(mticReaderId, tenantId);

  if (!mticReader || !mticReader.isActive) {
    return createResponse(
      res,
      500,
      "The requested MTIC Reader could not be registered or has been deactivated. Please contact your administrator",
      null,
      null
    );
  }
  try {
  } catch (error) {}
});

module.exports = router;
