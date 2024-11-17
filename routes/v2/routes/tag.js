const express = require("express");
const prisma = require("../../../config/prisma");
const router = express.Router();

const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "An unexpected error occurred" });
};

// CREATE: Add a new Tag
router.post("/", async (req, res) => {
  const { id, uid, tagTemplate, createdBy, createdLocation, createdReader } =
    req.body;

  console.log("Tag request body", req.body);

  try {
    const newTag = await prisma.tag.create({
      data: {
        id,
        uid,
        tagTemplateId: tagTemplate.id,
        createdById: createdBy.id,
        createdLocationId: createdLocation.id,
        createdReaderId: createdReader.address,
      },
    });
    res.status(201).json(newTag);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get all Tags
// READ: Get all Tags
router.get("/", async (req, res) => {
  const user = req.user;

  try {
    // Check if the user has a profileId
    if (!user.profileId) {
      return res
        .status(400)
        .json({ error: "User does not have a profile ID." });
    }

    const tags = await prisma.tag.findMany({
      where: {
        createdById: user.profileId,
      },
      include: {
        tagTemplate: {
          include: {
            fields: true,
            image: true,
          },
        },
        createdBy: true,
        createdLocation: true,
        createdReader: true,
        companyLocation: true,
      },
    });

    res.status(200).json(tags);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get a Tag by mtpId
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        tagTemplate: {
          include: {
            fields: true,
            image: true,
          },
        },
        createdBy: true,
        createdLocation: true,
        createdReader: true,
        companyLocation: true,
      },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.status(200).json(tag);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get Tags by optional filters
router.get("/search", async (req, res) => {
  const { tagTemplateId, createdById, createdLocationId, createdReaderId } =
    req.query;

  try {
    const tags = await prisma.tag.findMany({
      where: {
        AND: [
          tagTemplateId ? { tagTemplateId: tagTemplateId } : undefined,
          createdById ? { createdById: createdById } : undefined,
          createdLocationId
            ? { createdLocationId: createdLocationId }
            : undefined,
          createdReaderId ? { createdReaderId: createdReaderId } : undefined,
        ].filter(Boolean), // Filter out any undefined values
      },
      include: {
        tagTemplate: {
          include: {
            fields: true,
            image: true,
          },
        },
        createdBy: true,
        createdLocation: true,
        createdReader: true,
        companyLocation: true,
      },
    });

    if (tags.length === 0) {
      return res
        .status(404)
        .json({ error: "No tags found matching the criteria" });
    }

    res.status(200).json(tags);
  } catch (error) {
    handleError(res, error);
  }
});

// UPDATE: Update a Tag by mtpId
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { uid, tagTemplate, createdBy, createdLocation, createdReader } =
    req.body;

  try {
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        uid,
        tagTemplateId: tagTemplate.id,
        createdById: createdBy.id,
        createdLocationId: createdLocation.id,
        createdReaderId: createdReader.address,
      },
      include: {
        tagTemplate: {
          include: {
            fields: true,
            image: true,
          },
        },
        createdBy: true,
        createdLocation: true,
        createdReader: true,
        companyLocation: true,
      },
    });

    res.status(200).json(updatedTag);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Tag not found" });
    }
    handleError(res, error);
  }
});

// DELETE: Delete a Tag by mtpId
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.tag.delete({ where: { id } });
    res.status(204).send(); // No content response for successful delete
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Tag not found" });
    }
    handleError(res, error);
  }
});

module.exports = router;
