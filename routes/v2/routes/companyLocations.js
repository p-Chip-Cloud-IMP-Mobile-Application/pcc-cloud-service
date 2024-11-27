const express = require("express");
const prisma = require("../../../config/prisma");
const router = express.Router();

const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "An unexpected error occurred" });
};

router.get("/", async (req, res) => {
  const user = req.user;
  const profile = user?.profile;

  if (!profile || !profile.companyId) {
    // Handle the case where the profile or companyId is missing
    return res.status(400).json({
      error: "Profile is not associated with a company.",
    });
  }

  try {
    const companyLocations = await prisma.companyLocation.findMany({
      where: {
        companyId: profile.companyId,
      },
      include: { location: true, company: true },
    });

    res.status(200).json(companyLocations);
  } catch (error) {
    // Log and handle the error
    console.error("Error fetching company locations:", error);
    res.status(500).json({
      error: "An error occurred while fetching company locations.",
    });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const companyLocation = await prisma.companyLocation.findUnique({
      where: { id },
      include: { location: true, company: true },
    });

    if (!companyLocation) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.status(200).json(companyLocation);
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/", async (req, res) => {
  console.log("Inside company location post route");
  const user = req.user;
  const { id, name, company, location } = req.body;

  try {
    const newCompanyLocation = await prisma.companyLocation.create({
      data: {
        id,
        name,
        company: {
          connectOrCreate: {
            where: {
              id: company.id, // Assuming `company.id` uniquely identifies the company
            },
            create: {
              id: company.id,
              name: company.name,
              website: company.website,
              industry: company.industry,
              // Add other company fields as necessary
            },
          },
        },
        location: {
          connectOrCreate: {
            where: {
              id: location.id, // Assuming `location.id` uniquely identifies the location
            },
            create: {
              id: location.id,
              formattedAddress: location.formattedAddress,
              lat: location.lat,
              lon: location.lon,
              createdBy: {
                connect: {
                  id: user.profile.id, // Directly reference the unique identifier
                },
              },
            },
          },
        },
      },
    });

    res.status(201).json(newCompanyLocation);
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, company, location } = req.body;

  try {
    const updateCompanyLocation = await prisma.companyLocation.update({
      where: { id },
      data: {
        name,
        companyId: company.id,
        locationId: location.id,
      },
    });

    res.status(204).json(updateCompanyLocation);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Company location not found" });
    }
    handleError(res, error);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.companyLocation.delete({
      where: { id },
    });
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Company location not found" });
    }
    handleError(res, error);
  }
});

module.exports = router;
