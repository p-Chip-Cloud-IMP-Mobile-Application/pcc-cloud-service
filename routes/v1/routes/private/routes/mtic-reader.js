const express = require("express");
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const { error } = require("console");
const router = express.Router();

//Refactor required for post and put requests. Can me changed to an upsert function or user a helper function for simplicity
router.get("/", async (req, res, next) => {
  try {
    const mticReaders = await prisma.mTICReader.findMany({});
    return res.status(200).json({ message: "Good Request", data: mticReaders });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const mticReader = await prisma.mTICReader.findUnique({
      where: {
        id: id,
      },
    });

    if (!mticReader) {
      return res
        .status(404)
        .json({ error: "The requested resource does not exist" });
    }
    return res.status(200).json({ message: "Good Request", data: mticReader });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.post("/", async (req, res, next) => {
  const { tenantId } = req.customClaims;
  const { mticReaderId } = req.body;

  if (!tenantId || !mticReaderId) {
    return res
      .status(400)
      .json({ error: "Bad request. Missing required information" });
  }
  try {
    const existingMticReader = await prisma.mTICReader.findUnique({
      where: {
        id: mticReaderId,
      },
    });

    if (existingMticReader && existingMticReader.tenantId !== undefined) {
      return res
        .status(404)
        .json({ error: "The requested resource is already registered" });
    }

    const newMticReader = await prisma.mTICReader.create({
      data: {
        id: mticReaderId,
        tenantId: tenantId,
      },
    });

    if (!newMticReader) {
      return res
        .status(500)
        .json({ error: "The requested resource was not created" });
    }

    return res
      .status(200)
      .json({ message: "Good Request", data: newMticReader });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.put("/:mticReaderId", async (req, res, next) => {
  const { tenantId } = req.customClaims;
  const { mticReaderId } = req.params;
  const { isActive } = req.body;

  if (!mticReaderId || isActive === undefined) {
    return res.status(400).json({
      error: "Bad Request: Missing request params",
    });
  }

  try {
    const mticReaderToUpdate = await prisma.mTICReader.update({
      where: {
        id: mticReaderId,
        tenantId: tenantId,
      },
      data: {
        isActive: isActive,
      },
    });

    if (!mticReaderToUpdate) {
      return res
        .status(404)
        .json({ error: "Requested resource does not exist" });
    }

    return res
      .status(200)
      .json({ message: "Good Request", data: mticReaderToUpdate });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.delete("/:id", async (req, res, next) => {
  const { tenantId, role } = req.customClaims;
  const { mticReaderId } = req.params;
  try {
    if (!tenantId || !role || !mticReaderId) {
      return res.status(400).json({
        error: "Bad Request: Missing request params",
      });
    }
    if (role !== "administrator") {
      return res.status(401).json({ error: "Not authorized" });
    }
    const mticReaderToDelete = await prisma.mTICReader.delete({
      where: {
        id: mticReaderId,
      },
    });
    return res
      .status(204)
      .json({
        message: "Requested resource has been removed",
        data: mticReaderToDelete,
      });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

module.exports = router;
