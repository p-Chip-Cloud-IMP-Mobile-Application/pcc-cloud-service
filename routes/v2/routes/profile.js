const express = require("express");
const prisma = require("../../../config/prisma");
const router = express.Router();

// Helper function to handle errors consistently
const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "An unexpected error occurred" });
};

/**
 * GET /profiles
 * Fetch all profiles with optional company relationship.
 */
router.get("/", async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: { company: true },
    });
    res.status(200).json(profiles);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /profiles/:id
 * Fetch a single profile by ID.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /profiles
 * Create a new profile with optional companyId.
 */
router.post("/", async (req, res) => {
  const { name, picture, email, bio, companyId } = req.body;

  try {
    const newProfile = await prisma.profile.create({
      data: {
        name,
        picture,
        email,
        bio,
        company: companyId ? { connect: { id: companyId } } : undefined,
      },
    });

    res.status(201).json(newProfile);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    handleError(res, error);
  }
});

/**
 * PUT /profiles/:id
 * Update an existing profile by ID.
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, picture, email, bio, companyId } = req.body;

  try {
    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: {
        name,
        picture,
        email,
        bio,
        company: companyId ? { connect: { id: companyId } } : undefined,
      },
    });

    res.status(200).json(updatedProfile);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    } else if (error.code === "P2025") {
      return res.status(404).json({ error: "Profile not found" });
    }
    handleError(res, error);
  }
});

/**
 * DELETE /profiles/:id
 * Delete a profile by ID.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.profile.delete({
      where: { id },
    });
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Profile not found" });
    }
    handleError(res, error);
  }
});

module.exports = router;
