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

// CREATE: Add a new Reader or confirm if it already exists
router.post("/", async (req, res) => {
  const { address, name } = req.body;
  const profile = req.profile;

  try {
    // Check if the reader already exists based on unique field(s), e.g., address
    const existingReader = await prisma.reader.findUnique({
      where: { address }, // Assuming `address` is unique
    });

    if (existingReader) {
      // Reader already exists, respond with OK status and existing reader data
      return res.status(200).json(existingReader);
    }

    // Reader does not exist, create a new one
    const newReader = await prisma.reader.create({
      data: { address, name, createdById: profile.id },
    });

    res.status(201).json(newReader);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get all Readers
router.get("/", async (req, res) => {
  try {
    const readers = await prisma.reader.findMany({
      include: { tags: true, tagHistories: true },
    });
    res.status(200).json(readers);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get a Reader by address
router.get("/:address", async (req, res) => {
  const { address } = req.params;

  try {
    const reader = await prisma.reader.findUnique({
      where: { address },
      include: { tags: true, tagHistories: true },
    });

    if (!reader) {
      return res.status(404).json({ error: "Reader not found" });
    }

    res.status(200).json(reader);
  } catch (error) {
    handleError(res, error);
  }
});

// UPDATE: Update a Reader by address
router.put("/:address", async (req, res) => {
  const { address } = req.params;
  const { name } = req.body;

  try {
    const updatedReader = await prisma.reader.update({
      where: { address },
      data: { name },
    });

    res.status(200).json(updatedReader);
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE: Delete a Reader by address
router.delete("/:address", async (req, res) => {
  const { address } = req.params;

  try {
    await prisma.reader.delete({ where: { address } });
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
