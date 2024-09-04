const express = require("express");
const prisma = require("../../../../../config/prisma");
const router = express.Router();

router.get("/search", async (req, res) => {
  const { query } = req.query;
  const { tenantId } = req.customClaims;

  if (!query) {
    return res.status(400).json({
      status: "error",
      message: "Search query is required",
    });
  }

  try {
    const documentTemplatesResults = await prisma.documentTemplate.findMany({
      where: {
        tenantId: tenantId,
        OR: [
          { id: { contains: query, mode: "insensitive" } }, // Partial string matching
          { name: { contains: query, mode: "insensitive" } }, // Partial string matching
        ],
      },
    });

    const documentResults = await prisma.document.findMany({
      where: {
        tenantId: tenantId,
        OR: [
          { uid: { contains: query, mode: "insensitive" } }, // Partial string matching
        ],
      },
    });

    const mticResults = await prisma.mTIC.findMany({
      where: {
        OR: [
          { id: { contains: query, mode: "insensitive" } }, // Partial string matching
          { uid: { contains: query, mode: "insensitive" } }, // Partial string matching
        ],
      },
    });

    const fileResults = await prisma.file.findMany({
      where: {
        tenantid: tenantId,
        OR: [
          { name: { contains: query, mode: "insensitive" } }, // Partial string matching
        ],
      },
    });

    // Combine results
    const results = {
      documentTemplates: documentTemplatesResults,
      documents: documentResults,
      mtics: mticResults,
      files: fileResults,
    };

    return res.status(200).json({
      status: "success",
      message: "Search results",
      data: results,
    });
  } catch (error) {
    console.error("Error performing search:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while performing the search",
      error: error.message,
    });
  }
});

module.exports = router;
