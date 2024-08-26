const express = require("express");
const prisma = require("../../../../../config/prisma");
const { error } = require("console");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const tenantOrgs = await prisma.tenantOrg.findMany({});
    return res.status(200).json({ message: "Good Request", data: tenantOrgs });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const tenantOrg = await prisma.tenantOrg.findUnique({
      where: {
        id: id,
      },
      include: {
        subOrgs: true,
      },
    });
    if (!tenantOrg) {
      return res.status(404).json({ error: "Requested resource not found" });
    }
    return res.status(200).json({ message: "Good Request", data: tenantOrg });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res, next) => {
  const { tenantId, name, parentId } = req.body;

  if (!tenantId || !name) {
    return res
      .status(400)
      .json({ error: "Bad request. Missing required information" });
  }
  try {
    let parentOrgId;

    if (parentId) {
      const parentOrg = await prisma.tenantOrg.findUnique({
        where: {
          id: parentId,
        },
      });

      if (!parentOrg) {
        return res.status(400).json({
          error:
            "Bad requested. Requested resources related to ParentId could not be found",
        });
      }

      parentOrgId = parentOrg.id;
    }

    const newTenant = await prisma.tenantOrg.create({
      data: {
        name: name,
        tenantId: tenantId,
        parentId: parentOrgId,
      },
    });

    if (!newTenant) {
      return res.status(500).json({
        error: "An uncaught error has occurred. Please try again later",
      });
    }
    return res.status(200).json({ message: "Good Request", data: newTenant });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  console.log("Params", req.params);
  const { name, parentId } = req.body;
  try {
    let data;

    const targetTenantOrg = await prisma.tenantOrg.findUnique({
      where: {
        id: id,
      },
    });

    if (!targetTenantOrg) {
      return res.status(404).json({ error: "Requested resource not found" });
    }

    if (parentId && parentId !== targetTenantOrg.parentId) {
      const parentOrg = await prisma.tenantOrg.findUnique({
        where: {
          id: parentId,
        },
      });

      if (!parentOrg) {
        return res
          .status(404)
          .json({ error: "Requested resource, Parent Id could not be found" });
      }
      const updatedTenantOrg = await prisma.tenantOrg.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          parentId: parentOrg.id,
        },
      });

      data = updatedTenantOrg;
    } else {
      const updatedTenantOrg = await prisma.tenantOrg.update({
        where: {
          id: id,
        },
        data: {
          name: name,
        },
      });

      data = updatedTenantOrg;
    }

    return res.status(200).json({ message: "Good Request", data: data });
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
