const express = require("express");
const prisma = require("../../../../../config/prisma");
const documentFieldFormatHelper = require("../../../../../helpers/docFieldFormatHelper");
const docFormatHelper = require("../../../../../helpers/docFormatHelper");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const { error } = require("console");
const router = express.Router();

//Refactor required for post and put requests. Can me changed to an upsert function or user a helper function for simplicity
router.get("/", async (req, res, next) => {
  try {
    const docTemplates = await prisma.documentTemplate.findMany({});
    if (!docTemplates) {
      return res.status(404).json({ error: "Requested resource not found" });
    }
    return res
      .status(200)
      .json({ message: "Good Request", data: docTemplates });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const documentTemplate = await prisma.documentTemplate.findUnique({
      where: {
        id: id,
      },
    });

    if (!documentTemplate) {
      return res.status(404).json({ error: "Requested resourcenot found" });
    }
    return res
      .status(200)
      .json({ message: "Good Request", data: documentTemplate });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.post("/", async (req, res, next) => {
  const { documentConfigId, name, description, image, templateFieldValues } =
    req.body;
  if ((!documentConfigId, !name, !description, !templateFieldValues)) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const docConfig = await prisma.documentConfig.findUnique({
      where: {
        id: documentConfigId,
      },
    });
    console.log("Document Config", docConfig);
    if (!docConfig) {
      return res
        .status(404)
        .json({ error: "Requested documentConfig not found" });
    }
    const { fieldConfig } = docConfig;
    const { templateFields } = fieldConfig;

    const validDoc = docFormatHelper(templateFields, templateFieldValues);
    if (!validDoc.isValid) {
      return res.status(400).json({ error: validDoc.errors });
    }

    const { fields } = validDoc;
    const { documentFields } = fieldConfig;

    const docTemplateConfigJson = {
      templateFields: fields,
      documentFields: documentFields,
    };

    const newDocumentTemplate = await prisma.documentTemplate.create({
      data: {
        name: name,
        description: description,
        image: image,
        documentConfigId: docConfig.id,
        templateFieldConfig: docTemplateConfigJson,
      },
    });

    if (!newDocumentTemplate) {
      return res
        .status(500)
        .json({ error: "Requested document template could not be created" });
    }

    return res
      .status(200)
      .json({ message: "Good Request", data: newDocumentTemplate });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { name, description, image, documentConfigId, templateFieldValues } =
    req.body;

  if ((!documentConfigId, !name, !description, !templateFieldValues)) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const docConfig = await prisma.documentConfig.findUnique({
      where: {
        id: documentConfigId,
      },
    });
    console.log("Document Config", docConfig);
    if (!docConfig) {
      return res
        .status(404)
        .json({ error: "Requested documentConfig not found" });
    }
    const { fieldConfig } = docConfig;
    const { templateFields } = fieldConfig;

    const validDoc = docFormatHelper(templateFields, templateFieldValues);
    if (!validDoc.isValid) {
      return res.status(400).json({ error: validDoc.errors });
    }

    const { fields } = validDoc;
    const { documentFields } = fieldConfig;

    const docTemplateConfigJson = {
      templateFields: fields,
      documentFields: documentFields,
    };

    const newDocumentTemplate = await prisma.documentTemplate.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        description: description,
        image: image,
        documentConfigId: docConfig.id,
        templateFieldConfig: docTemplateConfigJson,
      },
    });

    if (!newDocumentTemplate) {
      return res
        .status(500)
        .json({ error: "Requested document template could not be created" });
    }

    return res
      .status(200)
      .json({ message: "Good Request", data: newDocumentTemplate });
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
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

module.exports = router;
