const express = require("express");
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const validateMticArray = require("../../../../../helpers/mtic/validateMticArray");
const { error } = require("console");
const router = express.Router();

//Refactor required for post and put requests. Can me changed to an upsert function or user a helper function for simplicity
router.get("/", async (req, res, next) => {
  try {
    const mtics = await prisma.mTIC.findMany({});
    return res.status(200).json({ message: "Good Request", data: mtics });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const mtic = await prisma.mTIC.findUnique({
      where: {
        id: id,
      },
    });
    if (!mtic) {
      return res
        .status(404)
        .json({ error: "Requested resource does not exist" });
    }
    return res.status(200).json({ message: "Good Request", data: mtic });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.post("/", async (req, res, next) => {
  const { tenantId, tenantUserId } = req.customClaims;
  const { mticMeta, mtic } = req.body;
  if (!mtic || !mticMeta) {
    return res
      .status(400)
      .json({ error: "Bad request. Missing required parameters" });
  }

  const { mticReaderId, lat, lon } = mticMeta;
  if (!mticReaderId || !lat || !lon) {
    return res.status(400).json({
      error:
        "Bad request: Missing mtic metadata: reader id, lat and lon in request body",
    });
  }
  try {
    //Validate that the MTIC reader is registered and active
    const mticReader = await prisma.mTICReader.findUnique({
      where: {
        id: mticReaderId,
        isActive: true,
      },
      select: {
        tenantId: true,
        tenant: {
          select: {
            tenantUsers: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!mticReader) {
      return res.status(404).json({
        error:
          "The requested mtic reader does not exist or has not been activated",
      });
    }

    //If the mtic reader is registered and active, but the tenant to which it is registered does not match the current tenant, check to make sure that the current user has a tenant profile with the tenant to which it is registered
    if (mticReader.tenantId !== tenantId) {
      const tenantUserExists = mticReader.tenant.tenantUsers.some(
        (tenantUser) => tenantUser.id === tenantUserId
      );

      if (!tenantUserExists) {
        return res.status(403).json({
          error: "You do not have permission to access this resource.",
        });
      }
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Check if the record exists
      const existingMtic = await prisma.mTIC.findUnique({
        where: { id: mtic.id },
        include: {
          mticLogs: true,
        },
      });

      // Step 2: If it doesn't exist, create it
      if (!existingMtic) {
        const createdMtic = await prisma.mTIC.create({
          data: mtic,
        });
        const createdMticLog = await prisma.mTICLog.create({
          data: {
            mticId: mtic.id,
            mticReaderId: mticReaderId,
            lat: lat,
            lon: lon,
            event: "create",
          },
        });
        const response = {
          type: "new",
          mtic: createdMtic,
        };
        return response;
      }

      const response = {
        type: "existing",
        mtic: existingMtic,
      };
      // Step 3: If it exists, return the existing record
      return response;
    });

    console.log("Result", result);

    return res.status(200).json({ message: "Good Request", data: result });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

module.exports = router;
