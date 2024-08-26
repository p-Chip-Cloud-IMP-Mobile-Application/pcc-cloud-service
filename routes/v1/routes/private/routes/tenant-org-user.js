const express = require("express");
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const tenantOrgUsers = await prisma.tenantOrgUser.findMany({});
    if (!tenantOrgUsers) {
      return res.status(404).json({
        message: "No tenants users are registered in this organization",
      });
    }
    return res
      .status(200)
      .json({ message: "Good Request", data: tenantOrgUsers });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.get("/query", async (req, res, next) => {
  const { tenantOrgId, tenantUserId } = req.query;

  if ((!tenantOrgId, tenantUserId)) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }
  try {
    const tenantOrgUser = await prisma.tenantOrgUser.findUnique({
      where: {
        tenantOrgId_tenantUserId: {
          tenantOrgId: tenantOrgId,
          tenantUserId: tenantUserId,
        },
      },
    });

    if (!tenantOrgUser) {
      return res
        .status(404)
        .json({ message: "User not found in tenant organization" });
    }

    return res
      .status(200)
      .json({ message: "Good Request", data: tenantOrgUser });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.post("/", async (req, res, next) => {
  const { tenantOrgId, tenantUserId, permission } = req.body;

  if (!tenantOrgId || !tenantUserId || !permission) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const newTenantOrgUser = await prisma.tenantOrgUser.create({
      data: {
        tenantOrgId: tenantOrgId,
        tenantUserId: tenantUserId,
        permission: permission,
      },
    });
    return res
      .status(200)
      .json({ message: "Good Request", data: newTenantOrgUser });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.put("/", async (req, res, next) => {
  const { tenantOrgId, tenantUserId } = req.query;
  const { permission } = req.body;

  if (!tenantOrgId || !tenantUserId || !permission) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const tenantOrgUserToUpdate = await prisma.tenantOrgUser.update({
      where: {
        tenantOrgId_tenantUserId: {
          tenantOrgId: tenantOrgId,
          tenantUserId: tenantUserId,
        },
      },
      data: {
        permission: permission,
      },
    });

    if (!tenantOrgUserToUpdate) {
      return res
        .status(404)
        .json({ error: "Requested resource is unavailable" });
    }

    return res
      .status(200)
      .json({ message: "Good Request", data: tenantOrgUserToUpdate });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.delete("/", async (req, res, next) => {
  const { tenantOrgId, tenantUserId } = req.query;

  if (!tenantOrgId || !tenantUserId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const tenantOrgUserToDelete = await prisma.tenantOrgUser.delete({
      where: {
        tenantOrgId_tenantUserId: {
          tenantOrgId: tenantOrgId,
          tenantUserId: tenantUserId,
        },
      },
    });

    return res
      .status(204)
      .json({ message: "Good Request", data: tenantOrgUserToDelete });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

module.exports = router;
