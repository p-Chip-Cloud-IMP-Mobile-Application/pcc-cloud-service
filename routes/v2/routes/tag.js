const express = require("express");
const prisma = require("../../../config/prisma");
const router = express.Router();

const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "An unexpected error occurred" });
};

// CREATE: Add a new Tag
router.post("/", async (req, res) => {
  const {
    id,
    uid,
    name,
    brand,
    description,
    imagePath,
    createdById,
    createdLocationId,
    createdReaderId,
  } = req.body;

  try {
    const newTag = await prisma.tag.create({
      data: {
        id,
        uid,
        name,
        brand,
        description,
        imagePath,
        createdById,
        createdLocationId,
        createdReaderId,
      },
    });
    res.status(201).json(newTag);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get all Tags
router.get("/", async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: { createdBy: true, createdLocation: true, createdReader: true },
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
      include: { createdBy: true, createdLocation: true, createdReader: true },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.status(200).json(tag);
  } catch (error) {
    handleError(res, error);
  }
});

// UPDATE: Update a Tag by mtpId
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    uid,
    name,
    brand,
    description,
    imagePath,
    createdById,
    createdLocationId,
    createdReaderId,
  } = req.body;

  try {
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        uid,
        name,
        brand,
        description,
        imagePath,
        createdById,
        createdLocationId,
        createdReaderId,
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
