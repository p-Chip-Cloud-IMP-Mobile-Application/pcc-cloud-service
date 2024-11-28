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
    const templateVariants = await prisma.templateVariant.findMany({
      where: {
        createdById: profile.id,
      },
      include: {
        tagTemplate: {
          include: {
            image: true,
            fields: true,
          },
        },
        tags: true,
        createdBy: {
          include: {
            company: true,
          },
        },
      }, // Include related data
    });
    console.log("Template variants", templateVariants);
    res.status(200).json(templateVariants);
  } catch (error) {
    handleError(res, error);
  }
});

// GET a specific tag template by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tagTemplateVariant = await prisma.templateVariant.findUnique({
      where: { id },
      include: {
        tagTemplate: {
          include: {
            image: true,
            fields: true,
          },
        },
        tags: true,
        createdBy: {
          include: {
            company: true,
          },
        },
      },
    });
    if (!tagTemplateVariant)
      return res.status(404).json({ error: "Template variant not found" });
    res.status(200).json(tagTemplateVariant);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get Tags by optional filters
router.get("/search", async (req, res) => {
  const { tagTemplateId, createdById } = req.query;

  try {
    const tags = await prisma.templateVariant.findMany({
      where: {
        ...(tagTemplateId && { tagTemplateId }),
        ...(createdById && { createdById }),
      },
      include: {
        tagTemplate: {
          include: {
            image: true,
            fields: true,
          },
        },
        tags: true,
        createdBy: {
          include: {
            company: true,
          },
        },
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

// POST a new tag template
router.post("/", async (req, res) => {
  const { id, tagTemplate, fields } = req.body;
  const user = req.user;

  if (!id || !tagTemplate || !fields) {
    return res.status(400).json({ error: "Request is issing required fields" });
  }

  try {
    const newTemplateVariant = await prisma.templateVariant.create({
      data: {
        id: id,
        tagTemplateId: tagTemplate.id,
        fields: fields,
        createdById: user.profile.id,
      },
      include: {
        tagTemplate: {
          include: {
            image: true,
            fields: true,
          },
        },
        tags: true,
        createdBy: {
          include: {
            company: true,
          },
        },
      },
    });
    res.status(201).json(newTemplateVariant);
  } catch (error) {
    handleError(res, error);
  }
});

// PUT update an existing tag template by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { tagTemplate, fields } = req.body;
  const user = req.user;

  // Validation
  if (!id || !tagTemplate || !fields) {
    return res.status(400).json({ error: "Missing required information" });
  }

  try {
    const updatedTemplateVariant = await prisma.templateVariant.update({
      where: { id },
      data: {
        templateVariant,
        fields: fields,
      },
      include: {
        tagTemplate: {
          include: {
            image: true,
            fields: true,
          },
        },
        tags: true,
        createdBy: {
          include: {
            company: true,
          },
        },
      },
    });
    res.status(200).json(updatedTemplateVariant);
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Template variant not found" });
    } else {
      handleError(res, error);
    }
  }
});

// DELETE a tag template by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.templateVariant.delete({ where: { id } });
    res.status(204).send(); // No content as the resource is deleted
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Template variant not found" });
    } else {
      handleError(res, error);
    }
  }
});

module.exports = router;
