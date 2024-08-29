const express = require("express");
const router = express.Router();
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const admin = require("../../../../../config/firebase");
const createResponse = require("../../../../../helpers/createResponse");

/**
 * @swagger
 * /authenticate/verify-token:
 *   post:
 *     summary: Verify the provided authentication token
 *     description: >
 *       Verifies the authentication token provided in the request header.
 *       If the token is valid, it returns the associated user profile.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           description: "Bearer token"
 *           example: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: "Token is valid and user is found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Token is valid and user is found"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userProfile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user_12345"
 *                         uid:
 *                           type: string
 *                           example: "UID12345"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *       401:
 *         description: "Unauthorized: Missing or invalid authorization token"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Missing authorization token."
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "MISSING_TOKEN"
 *                     description:
 *                       type: string
 *                       example: "Authorization header is required to access this resource."
 *                     message:
 *                       type: string
 *                       example: "No token provided in the request header."
 *       404:
 *         description: "User not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "USER_NOT_FOUND"
 *                     description:
 *                       type: string
 *                       example: "No user found with the provided UID."
 *       500:
 *         description: "Internal Server Error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_SERVER_ERROR"
 *                     description:
 *                       type: string
 *                       example: "Unexpected error occurred."
 */

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
        userProfile: {
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

/**
 * @swagger
 * /authenticate/update-claims/{tenantUserId}:
 *   post:
 *     summary: Update custom claims for a tenant user
 *     description: >
 *       This endpoint updates the custom claims associated with a tenant user.
 *       The request requires a valid Bearer token in the Authorization header.
 *     tags:
 *       - Claims
 *     parameters:
 *       - in: path
 *         name: tenantUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tenant user whose claims are being updated.
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: The Bearer token for authentication.
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: "Custom claims have been updated. Please refresh your token"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Custom claims have been updated. Please refresh your token"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user_12345"
 *                     tenantId:
 *                       type: string
 *                       example: "tenant_67890"
 *                     tenantUserId:
 *                       type: string
 *                       example: "tenantUser_12345"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *                     tenantOrgs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "org_123"
 *                           name:
 *                             type: string
 *                             example: "Tenant Organization"
 *                           permission:
 *                             type: string
 *                             example: "read-write"
 *       401:
 *         description: "Unauthorized: Missing or invalid authorization token"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Missing or invalid authorization token."
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "MISSING_TOKEN"
 *                     description:
 *                       type: string
 *                       example: "Authorization header is required to access this resource."
 *                     message:
 *                       type: string
 *                       example: "No token provided in the request header."
 *       404:
 *         description: "User not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "USER_NOT_FOUND"
 *                     description:
 *                       type: string
 *                       example: "No user found with the provided token."
 *       500:
 *         description: "Internal Server Error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INTERNAL_SERVER_ERROR"
 *                     description:
 *                       type: string
 *                       example: "Unexpected error occurred."
 */

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
