const express = require("express");
const router = express.Router();
const prisma = require("../../../../../config/prisma");
const createResponse = require("../../../../../helpers/createResponse");
const validateMticReader = require("../../../../../helpers/mtic/validateMticReader");
const validateMticArray = require("../../../../../helpers/mtic/validateMticArray");

router.post("/start-mtic-session", async (req, res, next) => {
  const { tenantId, tenantUserId } = req.customClaims;
  const { mticReaderId, lat, lon } = req.body;

  if (!tenantId || !tenantUserId || !mticReaderId || !lat || !lon) {
    return createResponse(res, 400, "Missing or malformed request");
  }
  try {
    const mticReaderValidation = await validateMticReader(
      mticReaderId,
      tenantId
    );

    if (!mticReaderValidation || !mticReaderValidation.isActive) {
      return createResponse(
        res,
        400,
        "The mtic reader has been deactivated or there was a problem registering your reader with your tenant"
      );
    }

    //Attempt to create a new session
    try {
      const newMTICSession = await prisma.mTICSession.create({
        data: {
          mticReaderId: mticReaderId,
          tenantUserId: tenantUserId,
          lat: lat,
          lon: lon,
        },
      });

      return createResponse(
        res,
        201,
        "Session Created Succesfully",
        newMTICSession,
        null
      );
    } catch (error) {
      return createResponse(res, 500, "Internal Server Error", null, error);
    }
  } catch (error) {
    return createResponse(
      res,
      500,
      "Internal server error. Please try again later"
    );
  }
});

router.put("/end-mtic-session/:mticSessionId", async (req, res, next) => {
  const { tenantUserId } = req.customClaims;
  const { mticSessionId } = req.params;
  //General try catch
  try {
    //Database try catch
    try {
      const mticSession = await prisma.mTICSession.update({
        where: {
          id: mticSessionId,
          endDateTime: null,
          tenantUserId: tenantUserId,
        },
        data: {
          endDateTime: new Date(),
        },
      });
      const data = {
        mticSessionid: mticSession.id,
      };

      return createResponse(res, 200, "Session ended succesfully", data, null);
    } catch (error) {
      return createResponse(
        res,
        500,
        "Internal server error. Please try again later",
        null,
        error
      );
    }
  } catch (error) {
    return createResponse(
      res,
      500,
      "Internal server error. Please try again later",
      null,
      error
    );
  }
});

router.post("/mtic-documents", async (req, res, next) => {
  const { tenantId, tenantUserId } = req.customClaims;
  const { mticSessionId, documentId, mtics } = req.body;
  if (!mticSessionId || !documentId || !mtics) {
    return createResponse(
      res,
      400,
      "Missing or malformed request parameters",
      null,
      null
    );
  }
  //General try catch for route error handling
  try {
    //Databas query try catch

    const mticArrayValidation = validateMticArray(mtics);

    if (!mticArrayValidation.isValid) {
      return createResponse(
        res,
        400,
        "mtic array is not valid. Make sure the structure is an array with id and uid value pairs"
      );
    }

    try {
      //get the mtic session
      const mticSession = prisma.mTICSession.findUnique({
        where: {
          id: mticSessionId,
        },
      });

      if (!mticSession) {
        return createResponse(
          res,
          404,
          "Requested session does not exist",
          null,
          error
        );
      }

      //get the document
      const document = await prisma.document.findUnique({
        where: {
          id: documentId,
        },
      });

      if (!document) {
        return createResponse(
          res,
          404,
          "Requested document does not exist",
          null,
          error
        );
      }

      //const mticIds = mtics.map((mtic) => mtic.id);

      const createAllMtics = await prisma.mTIC.createManyAndReturn({
        data: mtics,
        skipDuplicates: true,
      });

      const input = {
        mticSessionId,
        documentId,
        mtics,
      };

      const mticDocumentsData = input.mtics.map((mtic) => ({
        mticId: mtic.id,
        mticSessionId: input.mticSessionId,
        documentId: input.documentId,
      }));

      const newMticsDocuments = await prisma.mTICDocument.createManyAndReturn({
        data: mticDocumentsData,
      });

      return createResponse(res, 201, "MTIC Records Saved", newMticsDocuments);
    } catch (error) {
      return createResponse(
        res,
        500,
        "Internal server error. Please try again later",
        null,
        error
      );
    }
  } catch (error) {
    return createResponse(
      res,
      500,
      "Internal server error. Please try again later",
      null,
      error
    );
  }
});

router.get("/mtic-documents/:mticId", async (req, res, next) => {
  const { mticId } = req.params;

  try {
    const mticDocument = await prisma.mTICDocument.findMany({
      where: {
        mticId: mticId,
      },
    });

    if(!mticDocument) {
      
    }
  } catch (error) {
    return createResponse(
      res,
      500,
      "Internal server error. Please try again later"
    );
  }
});

module.exports = router;
