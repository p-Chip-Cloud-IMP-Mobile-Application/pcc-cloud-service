const express = require("express");
const prisma = require("../../../../../../../config/prisma");
const router = express.Router();

router.get("/", async (req, res) => {
  const { customClaims } = req;
  if (!customClaims) {
    return res.status(401).json({ error: "Token is invalid or expired." });
  }

  try {
    const { tenantOrgs } = customClaims;

    if (!tenantOrgs) {
      return res
        .status(404)
        .json({ error: "No resources availabel for your organization" });
    }

    const tenantOrgIds = tenantOrgs.map((org) => org.tenantOrgId);

    const tenantOrgDocTemplates = await prisma.tenantOrgDoc.findMany({
      where: {
        tenantOrgId: {
          in: tenantOrgIds,
        },
      },
    });

    
  } catch (error) {
    console.log("Uncaught error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
