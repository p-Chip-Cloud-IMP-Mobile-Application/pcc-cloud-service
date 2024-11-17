const express = require("express");
const prisma = require("../../../config/prisma");
const router = express.Router();

const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "An unexpected error occurred" });
};

// GET all tag templates
router.get("/", async (req, res) => {
  const user = req.user;
  const profile = user.profile;

  try {
    const tagTemplates = await prisma.tagTemplate.findMany({
      where: {
        companyId: profile.companyId,
      },
      include: {
        image: true,
        fields: {
          include: {
            tagTemplate: true,
          },
        },
        tags: true,
      }, // Include related data
    });

    console.log("Tag templates", tagTemplates);
    res.status(200).json(tagTemplates);
  } catch (error) {
    handleError(res, error);
  }
});

// GET a specific tag template by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tagTemplate = await prisma.tagTemplate.findUnique({
      where: { id },
      include: { image: true, fields: true, tags: true }, // Include related data
    });
    if (!tagTemplate)
      return res.status(404).json({ error: "TagTemplate not found" });
    res.status(200).json(tagTemplate);
  } catch (error) {
    handleError(res, error);
  }
});

// POST a new tag template
router.post("/", async (req, res) => {
  const { id, name, image } = req.body;
  const user = req.user;
  const profile = user.profile;

  if (!name || !image) {
    return res.status(400).json({ error: "Name and imageId are required" });
  }

  try {
    const newTagTemplate = await prisma.tagTemplate.create({
      data: {
        id: id,
        name,
        imageId: image.id,
        createdById: profile.id,
        companyId: profile.company.id,
      },
      include: { image: true, fields: true },
    });
    res.status(201).json(newTagTemplate);
  } catch (error) {
    handleError(res, error);
  }
});

// PUT update an existing tag template by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, imageId, fields } = req.body;
  const user = req.user;
  const profile = user.profile;

  // Validation
  if (!name || !imageId) {
    return res.status(400).json({ error: "Name and imageId are required" });
  }

  try {
    const updatedTagTemplate = await prisma.tagTemplate.update({
      where: { id },
      data: {
        name,
        imageId,
        fields: {
          deleteMany: {}, // Remove existing fields
          create: fields.map((field) => ({
            label: field.label,
            type: field.type,
            value: field.value,
          })),
        },
      },
      include: { image: true, fields: true },
    });
    res.status(200).json(updatedTagTemplate);
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "TagTemplate not found" });
    } else {
      handleError(res, error);
    }
  }
});

// DELETE a tag template by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.tagTemplate.delete({ where: { id } });
    res.status(204).send(); // No content as the resource is deleted
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "TagTemplate not found" });
    } else {
      handleError(res, error);
    }
  }
});

module.exports = router;
