const express = require("express");
const prisma = require("../../../../../config/prisma");
const documentFieldFormatHelper = require("../../../../../helpers/docFieldFormatHelper");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const documentConfigs = await prisma.documentConfig.findMany({});
    return res
      .status(200)
      .json({ message: "Good Request", data: documentConfigs });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const documentConfig = await prisma.documentConfig.findUnique({
      where: {
        id: id,
      },
    });
    if (!documentConfig) {
      return res.status(404).json({ error: "Requested resource not found" });
    }
    return res
      .status(200)
      .json({ message: "Good Request", data: documentConfig });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res, next) => {
  const { tenantId } = req.customClaims;
  console.log("Tenant Id", tenantId)
  const { name, description, fieldConfig } = req.body;
  console.log("Request Body", req.body);

  if (!tenantId || !name || !description || !fieldConfig) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  const fieldValidation = documentFieldFormatHelper(fieldConfig);
  if (!fieldValidation.isValid) {
    return res.status(400).json({ error: fieldValidation.errors });
  }
  try {
    const newDocumentConfig = await prisma.documentConfig.create({
      data: {
        tenantId: tenantId,
        name: name,
        description: description,
        fieldConfig: fieldConfig,
      },
    });
    return res
      .status(201)
      .json({ message: "Good Request", data: newDocumentConfig });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { name, description, fieldConfig } = req.body;
  if (!name || !description || !fieldConfig) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const fieldValidation = documentFieldFormatHelper(fieldConfig);
    if (!fieldValidation.isValid) {
      return res.status(400).json({ error: fieldValidation.errors });
    }

    const newDocumentConfig = await prisma.documentConfig.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        description: description,
        fieldConfig: fieldConfig,
      },
    });
    return res
      .status(200)
      .json({ message: "Good Request", data: newDocumentConfig });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const documentConfigToDelete = await prisma.documentConfig.delete({
      where: {
        id: id,
      },
    });
    if (!documentConfigToDelete) {
      return res
        .status(404)
        .json({ error: "Requested resource does not exist" });
    }
    return res
      .status(204)
      .json({ message: "Good Request", data: documentConfigToDelete });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

module.exports = router;
