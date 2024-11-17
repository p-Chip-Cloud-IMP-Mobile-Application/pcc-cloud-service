const express = require("express");
const prisma = require("../../../config/prisma");
const router = express.Router();

// Helper function for consistent error handling
const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "An unexpected error occurred" });
};

/**
 * GET /companies
 * Fetch all companies with their associated profiles.
 */
router.get("/", async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { profiles: true },
    });
    res.status(200).json(companies);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /companies/:id
 * Fetch a specific company by ID with its profiles.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const company = await prisma.company.findUnique({
      where: { id },
      include: { profiles: true },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /companies
 * Create a new company.
 */
router.post("/", async (req, res) => {
  const { id, name, website, industry } = req.body;
  const user = req.user;
  try {
    const newCompany = await prisma.company.create({
      data: {
        id,
        name,
        website,
        industry,
      },
    });

    try {
      if (newCompany) {
        await prisma.profile.update({
          where: {
            id: user.profileId,
          },
          data: {
            companyId: newCompany.id,
          },
        });
      }
    } catch (error) {
      print(error);
    }

    res.status(201).json(newCompany);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * PUT /companies/:id
 * Update an existing company by ID.
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, website, industry } = req.body;

  try {
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        name,
        website,
        industry: industry._name,
      },
    });

    res.status(204).json(updatedCompany);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Company not found" });
    }
    handleError(res, error);
  }
});

/**
 * DELETE /companies/:id
 * Delete a company by ID.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.company.delete({
      where: { id },
    });
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Company not found" });
    }
    handleError(res, error);
  }
});

module.exports = router;
