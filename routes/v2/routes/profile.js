const express = require("express");
const prisma = require("../../../config/prisma");
const authMiddleware = require("../authMiddleware");
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
router.get("/", authMiddleware, async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: { company: true, picture: true },
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
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: { company: true, picture: true },
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
router.post("/", authMiddleware, async (req, res) => {
  const { id, name, picture, email, bio, company } = req.body;
  const user = req.user;

  try {
    const newProfile = await prisma.profile.create({
      data: {
        id,
        name,
        pictureId: picture.id,
        email,
        bio,
        companyId: company ? company.id : undefined,
      },
      include: {
        company: true,
        picture: true,
      },
    });

    if (newProfile) {
      try {
        const updatedUser = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            profileId: newProfile.id,
          },
        });
        console.log("Updated User:", updatedUser);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // Handle known Prisma errors
          console.log("Prisma Error Code:", error.code);
          console.log("Prisma Error Message:", error.message);
        } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
          // Handle unknown Prisma errors
          console.log("Unknown Prisma Error:", error.message);
        } else if (error instanceof Prisma.PrismaClientValidationError) {
          // Handle validation errors
          console.log("Validation Error:", error.message);
        } else {
          // General error fallback
          console.log("Unexpected Error:", error);
        }
      }
    }

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
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, picture, email, bio, company } = req.body;

  console.log("Request body", req.body);

  try {
    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: {
        name,
        pictureId: picture.id,
        email,
        bio,
        companyId: company.id,
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
router.delete("/:id", authMiddleware, async (req, res) => {
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
