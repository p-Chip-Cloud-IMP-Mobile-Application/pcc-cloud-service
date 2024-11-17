const express = require("express");
const prisma = require("../../../config/prisma");
const router = express.Router();

const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "An unexpected error occurred" });
};

// GET all fields
router.get("/", async (req, res) => {
  try {
    const fields = await prisma.field.findMany();
    res.json(fields);
  } catch (error) {
    console.error("Error fetching fields:", error);
    handleError(res, error);
  }
});

// GET a specific field by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const field = await prisma.field.findUnique({ where: { id } });
    if (!field) return res.status(404).json({ error: "Field not found" });
    res.json(field);
  } catch (error) {
    console.error(`Error fetching field with ID ${id}:`, error);
    handleError(res, error);
  }
});

// POST multiple fields
router.post("/", async (req, res) => {
  const { fields } = req.body; // Expecting an array of field objects
  console.log("Fields array", fields);
  try {
    const newArray = fields.map((field) => ({
      label: field.label,
      type: field.type,
      value: field.value,
      tagTemplateId: field.tagTemplateId,
    }));
    console.log("Print array", newArray);
    // Using createMany to insert all fields in one transaction
    const createdFields = await prisma.field.createMany({
      data: newArray,
      skipDuplicates: true, // Optional: skips duplicates if you don't want duplicate entries
    });

    res.status(201).json({
      count: createdFields.count,
      message: "Fields created successfully",
    });
  } catch (error) {
    console.error("Error creating fields:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// PUT update an existing field by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { label, type, value, tagTemplate } = req.body;
  try {
    const updatedField = await prisma.field.update({
      where: { id },
      data: { label, type, value, tagTemplateId: tagTemplate.id },
    });
    res.json(updatedField);
  } catch (error) {
    if (error.code === "P2025") {
      // P2025 is the Prisma error code for "Record to update not found"
      res.status(404).json({ error: "Field not found" });
    } else {
      console.error(`Error updating field with ID ${id}:`, error);
      handleError(res, error);
    }
  }
});

// DELETE a field by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.field.delete({ where: { id } });
    res.status(204).send(); // No content, as the resource is deleted
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Field not found" });
    } else {
      console.error(`Error deleting field with ID ${id}:`, error);
      handleError(res, error);
    }
  }
});

module.exports = router;
