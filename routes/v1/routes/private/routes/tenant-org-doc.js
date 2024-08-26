const express = require("express");
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const tenantOrgDocs = await prisma.tenantOrgDoc.findMany({});
    if (!tenantOrgDocs) {
      return res
        .status(404)
        .json({ message: "Requested resources could not be found" });
    }
    return res
      .status(200)
      .json({ message: "Good Request", data: tenantOrgDocs });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.get("/query", async (req, res, next) => {
  const { tenantOrgId, documentTemplateId } = req.query;
  if (!tenantOrgId || !documentTemplateId) {
    return res
      .status(404)
      .json({ error: "Missing required search parameters" });
  }
  try {
    const tenantOrgDoc = await prisma.tenantOrgDoc.findUnique({
      where: {
        tenantOrgId_documentTemplateId: {
          tenantOrgId: tenantOrgId,
          documentTemplateId: documentTemplateId,
        },
      },
    });

    if (!tenantOrgDoc) {
      return res
        .status(404)
        .json({ error: "The requested resource could not be found" });
    }

    return res
      .status(200)
      .json({ message: "Good Request", data: tenantOrgDoc });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.post("/", async (req, res, next) => {
  const { tenantOrgId, documentTemplateId, permission } = req.body;

  if (!tenantOrgId || !documentTemplateId || !permission) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const newTenantOrgDoc = await prisma.tenantOrgDoc.create({
      data: {
        tenantOrgId: tenantOrgId,
        documentTemplateId: documentTemplateId,
        permission: permission,
      },
    });

    if (!newTenantOrgDoc) {
      return res.status(500).json({
        error:
          "Requested document template could not be assigned to the tenant organization",
      });
    }
    return res
      .status(200)
      .json({ message: "Good Request", data: newTenantOrgDoc });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.put("/", async (req, res, next) => {
  const { tenantOrgId, documentTemplateId } = req.query;
  const { permission } = req.body;
  if (!tenantOrgId || !documentTemplateId || !permission) {
    return res
      .status(404)
      .json({ error: "Missing required search parameters" });
  }
  try {
    const tenantOrgDocToUpdate = await prisma.tenantOrgDoc.update({
      where: {
        tenantOrgId_documentTemplateId: {
          tenantOrgId: tenantOrgId,
          documentTemplateId: documentTemplateId,
        },
      },
      data: {
        permission: permission,
      },
    });

    if (!tenantOrgDocToUpdate) {
      return res
        .status(404)
        .json({ error: "The requested resource could not be updated" });
    }
    return res
      .status(200)
      .json({ message: "Good Request", data: tenantOrgDocToUpdate });
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
