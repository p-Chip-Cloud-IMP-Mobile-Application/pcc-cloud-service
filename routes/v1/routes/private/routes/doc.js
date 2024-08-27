const express = require("express");
const prisma = require("../../../../../config/prisma");
const docFormatHelper = require("../../../../../helpers/docFormatHelper");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const router = express.Router();

//Refactor required for post and put requests. Can me changed to an upsert function or user a helper function for simplicity
router.get("/", async (req, res, next) => {
  try {
    const documents = await prisma.document.findMany({});
    return res.status(200).json({ message: "Good Request", data: documents });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const document = await prisma.document.findUnique({
      where: {
        id: id,
      },
    });

    if (!document) {
      return res
        .status(404)
        .json({ error: "Requested resource could not be found" });
    }
    return res.status(200).json({ message: "Good Request", data: document });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.post("/", async (req, res, next) => {
  const { id, tenantId, tenantUserId } = req.customClaims;
  const { uid, documentTemplateId, tenantOrgId, documentFieldValues } =
    req.body;
  if (
    !id ||
    !tenantId ||
    !documentTemplateId ||
    !tenantOrgId ||
    !documentFieldValues
  ) {
    return res
      .status(400)
      .json({ error: "Bad Request. Missing required parameters" });
  }

  try {
    const tenantOrgDoc = await prisma.tenantOrgDoc.findUnique({
      where: {
        tenantOrgId_documentTemplateId: {
          tenantOrgId: tenantOrgId,
          documentTemplateId: documentTemplateId,
        },
      },
      select: {
        documentTemplate: true,
        tenantOrg: {
          select: {
            tenantOrgUsers: true,
          },
        },
      },
    });

    if (!tenantOrgDoc) {
      return res.status(404).json({
        error:
          "Requested document is not available for the defined organization",
      });
    }

    const { tenantOrg } = tenantOrgDoc;
    const { tenantOrgUsers } = tenantOrg;

    const authorTenantOrgUser = tenantOrgUsers.map((tenantOrgUser) =>
      tenantOrgUser.tenantUserId.includes(tenantUserId)
    );

    if (!authorTenantOrgUser) {
      return res.status(404).json({
        error:
          "User is not authorized to perform this action for the requested resource",
      });
    }

    const { documentTemplate } = tenantOrgDoc;
    const { templateFieldConfig } = documentTemplate;
    const { documentFields } = templateFieldConfig;

    const validDoc = docFormatHelper(documentFields, documentFieldValues);

    if (!validDoc.isValid) {
      return res.status(400).json({ error: validDoc.errors });
    }

    const newDocument = await prisma.document.create({
      data: {
        uid: uid,
        tenantOrgId: tenantOrgId,
        documentTemplateId: documentTemplate.id,
        documentFields: validDoc.fields,
        createdById: tenantUserId,
      },
    });

    if (!newDocument) {
      return res
        .status(404)
        .json({ error: "The requested resource could not be created" });
    }
    return res.status(200).json({ message: "Good Request", data: newDocument });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

module.exports = router;
