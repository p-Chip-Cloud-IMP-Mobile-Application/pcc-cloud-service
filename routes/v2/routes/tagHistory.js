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
  const { tagId, createdById, createdLocationId, createdReaderId, action } =
    req.body;

  try {
    const newTagHistory = await prisma.tagHistory.create({
      data: {
        tagId,
        createdById,
        createdLocationId,
        createdReaderId,
        action,
      },
    });
    res.status(201).json(newTagHistory);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get all TagHistories
router.get("/", async (req, res) => {
  try {
    const tagHistories = await prisma.tagHistory.findMany({
      include: {
        tag: true,
        createdBy: true,
        createdLocation: true,
        createdReader: true,
      },
    });
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
  const { tagId, createdById, createdLocationId, createdReaderId, action } =
    req.body;

  try {
    const updatedTagHistory = await prisma.tagHistory.update({
      where: { id },
      data: {
        tagId,
        createdById,
        createdLocationId,
        createdReaderId,
        action,
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
