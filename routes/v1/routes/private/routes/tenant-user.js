const express = require("express");
const prisma = require("../../../../../config/prisma");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const tenantUsers = await prisma.tenantUser.findMany({});

    if (!tenantUsers) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ message: "Good Request", data: tenantUsers });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const tenantUser = await prisma.tenantUser.findFirst({
      where: {
        id: id,
      },
    });

    console.log("Tenant User Returned", tenantUser);

    if (!tenantUser) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json({ message: "Good Request", data: tenantUser });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res, next) => {
  const { userId, tenantId, role } = req.body;

  if (!userId || !tenantId || !role) {
    if (!name || !website || !logo) {
      return res
        .status(409)
        .json({ error: "Missing required information to create a new tenant" });
    }
  }
  try {
    const newTenantUser = await prisma.tenantUser.create({
      data: {
        userId: userId,
        tenantId: tenantId,
        role: role,
      },
    });

    if (!newTenantUser) {
      return res.status(500).json({
        error: "An uncaught error occurred trying to add the new tenant user",
      });
    }
    return res
      .status(200)
      .json({ message: "Good Request", data: newTenantUser });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { role, isActive } = req.body;

  try {
    const tenantUserToUpdate = await prisma.tenantUser.update({
      where: {
        id: id,
      },
      data: {
        role: role,
        isActive: isActive,
      },
    });

    if (!tenantUserToUpdate) {
      return res.status(404).json({
        error: "Requested tenant user does not exist or cannot be updated",
      });
    }
    return res
      .status(200)
      .json({ message: "Good Request", data: tenantUserToUpdate });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
