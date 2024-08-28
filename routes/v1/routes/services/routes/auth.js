const express = require("express");
const router = express.Router();
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const admin = require("../../../../../config/firebase");
const createResponse = require("../../../../../helpers/createResponse");

router.post("/verify-token", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = {
        code: "MISSING_TOKEN",
        description:
          "Authorization header is required to access this resource.",
        message: "No token provided in the request header.",
      };
      return createResponse(
        res,
        401,
        "Unauthorized: Missing authorization token.",
        null,
        error
      );
    }
    const token = authHeader.split("Bearer ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { uid } = decodedToken;

      const user = await prisma.user.findUnique({
        where: { uid: uid },
      });

      if (!user) {
        return createResponse(res, 404, "User not found", null, {
          code: "USER_NOT_FOUND",
          description: "No user found with the provided UID.",
        });
      }

      const data = {
        user_profile: {
          id: user.id,
          uid: user.uid,
          name: user.name,
          email: user.email,
        },
      };

      return createResponse(res, 200, "Token is valid and user is found", data);
    } catch (error) {
      // Handle the error from Firebase Admin SDK
      const errorDetails = {
        code: error.code || "INVALID_TOKEN",
        description: error.message || "Token verification failed.",
        message: "The provided token is invalid or malformed.",
      };
      return createResponse(
        res,
        401,
        "Token is invalid or malformed",
        null,
        errorDetails
      );
    }
  } catch (error) {
    // Handle Prisma or any other unexpected errors
    const { statusCode, message } = prismaErrorHelper(error);
    return createResponse(res, statusCode, message, null, {
      code: "INTERNAL_SERVER_ERROR",
      description: error.message,
    });
  }
});

router.post("/update-claims/:tenanerUserId", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = {
        code: "MISSING_TOKEN",
        description:
          "Authorization header is required to access this resource.",
        message: "No token provided in the request header.",
      };
      return createResponse(
        res,
        401,
        "Unauthorized: Missing authorization token.",
        null,
        error
      );
    }
    const token = authHeader.split("Bearer ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { uid } = decodedToken;

      const tenantUserId = req.params.tenanerUserId;

      const user = await prisma.user.findUnique({
        where: { uid: uid },
      });

      if (!user) {
        return createResponse(res, 404, "User not found", null, {
          code: "USER_NOT_FOUND",
          description: "No user found with the provided token.",
        });
      }

      const tenantUserProfile = await prisma.tenantUser.findUnique({
        where: {
          userId: user.id,
          id: tenantUserId,
          isActive: true,
        },
        include: {
          tenantOrgUser: {
            include: {
              tenantOrg: true,
            },
          },
        },
      });

      if (!tenantUserProfile) {
        return createResponse(res, 404, "User not found", null, {
          code: "RESOURCE_NOT_FOUND",
          description:
            "No tenant user profile found for the requested user and tenantUserProfileId.",
        });
      }

      const tenantOrgs = tenantUserProfile.tenantOrgUser.map((org) => ({
        id: org.tenantOrg.id,
        name: org.tenantOrg.name,
        permission: org.permission,
      }));

      const customClaims = {
        id: user.id,
        tenantId: tenantUserProfile.tenantId,
        tenantUserId: tenantUserProfile.id,
        role: tenantUserProfile.role,
        tenantOrgs: tenantOrgs,
      };

      try {
        // Set custom claims on Firebase token
        await admin
          .auth()
          .setCustomUserClaims(uid, { customClaims: customClaims });
      } catch (error) {
        return createResponse(
          res,
          401,
          "Token is invalid or malformed",
          null,
          error
        );
      }
      return createResponse(
        res,
        200,
        "Custom claims have been updated. Please refresh your token",
        customClaims,
        null
      );
    } catch (error) {
      // Handle the error from Firebase Admin SDK
      const errorDetails = {
        code: error.code || "INVALID_TOKEN",
        description: error.message || "Token verification failed.",
        message: "The provided token is invalid or malformed.",
      };
      return createResponse(
        res,
        401,
        "Token is invalid or malformed",
        null,
        errorDetails
      );
    }
  } catch (error) {
    // Handle Prisma or any other unexpected errors
    const { statusCode, message } = prismaErrorHelper(error);
    return createResponse(res, statusCode, message, null, {
      code: "INTERNAL_SERVER_ERROR",
      description: error.message,
    });
  }
});

module.exports = router;
