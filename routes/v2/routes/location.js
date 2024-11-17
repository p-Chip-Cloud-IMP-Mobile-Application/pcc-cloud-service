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

// CREATE: Add a new Location
router.post("/", async (req, res) => {
  const { id, lat, lon, formattedAddress } = req.body;
  const profile = req.profile;

  try {
    const newLocation = await prisma.location.create({
      data: { id, lat, lon, formattedAddress, createdById: profile.id },
    });
    res.status(201).json(newLocation);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get all Locations
router.get("/", async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: { tags: true, tagHistories: true },
    });
    res.status(200).json(locations);
  } catch (error) {
    handleError(res, error);
  }
});

// READ: Get a Location by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const location = await prisma.location.findUnique({
      where: { id },
      include: { tags: true, tagHistories: true },
    });

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.status(200).json(location);
  } catch (error) {
    handleError(res, error);
  }
});

// UPDATE: Update a Location by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { lat, lon, formattedAddress } = req.body;

  try {
    const updatedLocation = await prisma.location.update({
      where: { id },
      data: { lat, lon, formattedAddress },
    });

    res.status(200).json(updatedLocation);
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE: Delete a Location by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.location.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
