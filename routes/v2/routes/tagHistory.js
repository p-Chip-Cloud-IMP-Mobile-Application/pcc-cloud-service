const express = require("express");
const prisma = require("../../../config/prisma");
const router = express.Router();

// Default error handling function
function handleError(res, error) {
  console.error("An error occurred:", error);
  if (error.code === "P2025") {
    return res.status(404).json({ error: "Resource not found" });
  }
  res.status(500).json({ error: "An unexpected error occurred" });
}

// CREATE: Add a new TagHistory
router.post("/", async (req, res) => {
  const { tag, createdBy, createdLocation, createdReader, action } = req.body;

  console.log("Tag history in post request", req.body);

  try {
    const newTagHistory = await prisma.tagHistory.create({
      data: {
        tagId: tag.id,
        createdById: createdBy.id,
        createdLocationId: createdLocation.id,
        createdReaderId: createdReader.address,
        action,
      },
      include: {
        tag: {
          include: {
            tagTemplate: {
              include: {
                fields: true,
                image: true,
              },
            },
            createdBy: {
              include: {
                picture: true,
                company: true,
              },
            },
            createdLocation: true,
            createdReader: true,
            companyLocation: {
              include: {
                location: true,
                company: true,
              },
            },
            company: true,
          },
        },
        createdBy: {
          include: {
            picture: true,
            company: true,
          },
        },
        createdLocation: true,
        createdReader: true,
      },
    });
    res.status(201).json(newTagHistory);
  } catch (error) {
    handleError(res, error);
  }
});

// BULK CREATE: Add multiple TagHistory records
router.post("/bulk", async (req, res) => {
  const { tagHistories } = req.body;

  // Validation: Check if `tagHistories` is an array
  if (!Array.isArray(tagHistories) || tagHistories.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid or missing tagHistories array" });
  }

  try {
    // Create multiple TagHistory records using `createMany`
    const createdTagHistories = await prisma.tagHistory.createMany({
      data: tagHistories.map((tagHistory) => ({
        id: tagHistory.id,
        tagId: tagHistory.tag.id,
        createdById: tagHistory.createdBy.id,
        createdLocationId: tagHistory.createdLocation?.id || null, // Optional field
        createdReaderId: tagHistory.createdReader?.address || null, // Optional field
        action: tagHistory.action,
      })),
      skipDuplicates: true, // Optional: Skip duplicates if needed
    });

    res.status(201).json({
      message: "TagHistories created successfully",
      count: createdTagHistories.count,
    });
  } catch (error) {
    console.error("Error creating tag histories:", error);
    res.status(500).json({
      error: "Failed to create tag histories",
      details: error.message,
    });
  }
});

// READ: Get all TagHistories
router.get("/", async (req, res) => {
  const user = req.user;
  const profile = user.profile;
  try {
    const tagHistories = await prisma.tagHistory.findMany({
      where: {
        tag: {
          createdById: profile.id,
        },
      },
      include: {
        tag: {
          include: {
            tagTemplate: {
              include: {
                fields: true,
                image: true,
              },
            },
            createdBy: {
              include: {
                picture: true,
                company: true,
              },
            },
            createdLocation: true,
            createdReader: true,
            companyLocation: {
              include: {
                location: true,
                company: true,
              },
            },
            company: true,
          },
        },
        createdBy: {
          include: {
            picture: true,
            company: true,
          },
        },
        createdLocation: true,
        createdReader: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(tagHistories);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get Tags by optional filters
router.get("/search", async (req, res) => {
  const { tagId, createdById, createdLocationId, createdReaderId } = req.query;

  try {
    const tagHistories = await prisma.tagHistory.findMany({
      where: {
        ...(tagId && { tagId }),
        ...(createdLocationId && { createdLocationId }),
        ...(createdById && { createdById }),
        ...(createdReaderId && { createdReaderId }),
      },
      include: {
        tag: {
          include: {
            tagTemplate: {
              include: {
                fields: true,
                image: true,
              },
            },
            createdBy: {
              include: {
                picture: true,
                company: true,
              },
            },
            createdLocation: true,
            createdReader: true,
            companyLocation: {
              include: {
                location: true,
                company: true,
              },
            },
            company: true,
          },
        },
        createdBy: {
          include: {
            picture: true,
            company: true,
          },
        },
        createdLocation: true,
        createdReader: true,
      },
    });

    if (tagHistories.length === 0) {
      return res
        .status(404)
        .json({ error: "No tag histories found matching the criteria" });
    }

    res.status(200).json(tagHistories);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get a TagHistory by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const tagHistory = await prisma.tagHistory.findUnique({
      where: { id },
      include: {
        tag: true,
        createdBy: true,
        createdLocation: true,
        createdReader: true,
      },
      include: {
        tag: {
          include: {
            tagTemplate: {
              include: {
                fields: true,
                image: true,
              },
            },
            createdBy: {
              include: {
                picture: true,
                company: true,
              },
            },
            createdLocation: true,
            createdReader: true,
            companyLocation: {
              include: {
                location: true,
                company: true,
              },
            },
            company: true,
          },
        },
        createdBy: {
          include: {
            picture: true,
            company: true,
          },
        },
        createdLocation: true,
        createdReader: true,
      },
    });

    if (!tagHistory) {
      return res.status(404).json({ error: "TagHistory not found" });
    }

    res.status(200).json(tagHistory);
  } catch (error) {
    handleError(res, error);
  }
});

// UPDATE: Update a TagHistory by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { tag, createdBy, createdLocation, createdReader, action } = req.body;

  try {
    const updatedTagHistory = await prisma.tagHistory.update({
      where: { id },
      data: {
        tagId: tag.id,
        createdById: createdBy.id,
        createdLocationId: createdLocation.id,
        createdReaderId: createdReader.id,
        action,
      },
      include: {
        tag: {
          include: {
            tagTemplate: {
              include: {
                fields: true,
                image: true,
              },
            },
            createdBy: {
              include: {
                picture: true,
                company: true,
              },
            },
            createdLocation: true,
            createdReader: true,
            companyLocation: {
              include: {
                location: true,
                company: true,
              },
            },
            company: true,
          },
        },
        createdBy: {
          include: {
            picture: true,
            company: true,
          },
        },
        createdLocation: true,
        createdReader: true,
      },
    });

    res.status(200).json(updatedTagHistory);
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE: Delete a TagHistory by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.tagHistory.delete({ where: { id } });
    res.status(204).send(); // No content response for successful delete
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
