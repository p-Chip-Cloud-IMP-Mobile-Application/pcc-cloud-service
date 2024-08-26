const express = require("express");
const prisma = require("../../../../../config/prisma");
const router = express.Router();

//Get all tenants that a user has access to
router.get("/", async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        tenantUsers: true,
        tenantOrgs: true,
      },
    });
    if (!tenants) {
      return res.status(204).json({ error: "Not tenants available" });
    }
    return res.status(200).json({ message: "Request accepted", data: tenants });
  } catch (error) {
    console.log("Uncaught error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//Get all tenants that a user has access to
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: {
        id: id,
      },
    });
    if (!tenant) {
      return res.status(204).json({ error: "Tenant does not exist" });
    }
    return res.status(200).json({ message: "Request accepted", data: tenant });
  } catch (error) {
    console.log("Uncaught error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//Get all tenants that a user has access to
router.post("/", async (req, res) => {
  const { id } = req.customClaims;
  const { name, website, logo } = req.body;

  console.log("Request body", req.body);
  try {
    if (!name || !website || !logo) {
      return res
        .status(409)
        .json({ error: "Missing required information to create a new tenant" });
    }
    const tenant = await prisma.tenant.create({
      data: {
        name: name,
        website: website,
        logo: logo,
      },
    });

    if (!tenant) {
      return res.status(409).json({ error: "Tenant could not be created" });
    }

    const newTenantUser = await prisma.tenantUser.create({
      data: {
        tenantId: tenant.id,
        userId: id,
        role: "administrator",
      },
    });

    if (!newTenantUser) {
      console.log("Error creating default tenant user account");
      return res.status(500).json({ error: "Internal server error" });
    }

    const data = {
      tenant: tenant,
      tenantUser: newTenantUser,
    };

    return res
      .status(201)
      .json({ message: "New tenant and default provide created", data: data });
  } catch (error) {
    console.log("Uncaught error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:tenantId", async (req, res) => {
  const { tenantId } = req.params; // Get the tenant ID from the request parameters
  const { id: userId, role } = req.customClaims; // Extract user ID and role from custom claims
  const { name, website, logo } = req.body; // Extract fields from the request body

  try {
    // Ensure the user has the appropriate role to update the tenant
    const tenantUser = await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId: tenantId,
          userId: userId,
        },
      },
    });

    if (!tenantUser || tenantUser.role !== "administrator") {
      return res
        .status(403)
        .json({ error: "You do not have permission to update this tenant" });
    }

    // Check if at least one field is provided for update
    if (!name && !website && !logo) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update" });
    }

    // Create an update object dynamically based on the provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (website) updateData.website = website;
    if (logo) updateData.logo = logo;

    // Update the tenant
    const updatedTenant = await prisma.tenant.update({
      where: {
        id: tenantId,
      },
      data: updateData,
    });

    if (!updatedTenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    return res
      .status(200)
      .json({ message: "Tenant updated successfully", tenant: updatedTenant });
  } catch (error) {
    console.error("Error updating tenant:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
