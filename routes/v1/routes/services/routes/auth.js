const express = require("express");
const axios = require("axios");
const router = express.Router();
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const admin = require("../../../../../config/firebase");
const createResponse = require("../../../../../helpers/createResponse");

/**
 * @swagger
 * /authenticate/login:
 *   post:
 *     summary: User login
 *     description: |
 *       Authenticates a user with their email and password using Firebase Authentication.
 *       Verifies the ID token and sets custom claims for the user based on their tenant access and role.
 *       Returns a JWT token and custom claims if authentication is successful.
 *     tags:
 *       - Authentication
 *       - Customer Story
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: "The user's email address."
 *                 example: "api-demo@p-chip.com"
 *               password:
 *                 type: string
 *                 description: "The user's password."
 *                 example: "api-demo"
 *     responses:
 *       200:
 *         description: "Login successful. Returns a JWT token and custom claims."
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
 *                   example: "Login successful and claims set"
 *                 data:
 *                   type: object
 *                   properties:
 *                     idToken:
 *                       type: string
 *                       description: "The Firebase Auth ID token for the authenticated user."
 *                       example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY5M..."
 *                     refreshToken:
 *                       type: string
 *                       description: "The Firebase Auth refresh token for the authenticated user."
 *                       example: "AEu4IL0tUwJY...os4pyHCkVQDQHRa"
 *                     expiresIn:
 *                       type: string
 *                       description: "The number of seconds in which the ID token expires."
 *                       example: "3600"
 *                     customClaims:
 *                       type: object
 *                       description: "Custom claims containing user role and tenant information."
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: "The user's unique ID."
 *                           example: 1
 *                         tenant:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: integer
 *                               description: "The user's tenant-specific ID."
 *                               example: 1
 *                             id:
 *                               type: integer
 *                               description: "The tenant's unique ID."
 *                               example: 1
 *                             name:
 *                               type: string
 *                               description: "The name of the tenant."
 *                               example: "Tenant Name"
 *                         role:
 *                           type: string
 *                           description: "The user's role within the tenant."
 *                           example: "admin"
 *                         tenantOrgs:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               tenantOrgId:
 *                                 type: integer
 *                                 description: "The tenant organization ID."
 *                                 example: 100
 *                               permission:
 *                                 type: string
 *                                 description: "The permission level of the user within the tenant organization."
 *                                 example: "read"
 *       400:
 *         description: "Bad request. Email and password are required."
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
 *                   example: "Email and password are required."
 *       401:
 *         description: |
 *           Unauthorized. Possible reasons:
 *           - Authentication failed
 *           - Invalid token
 *           - Error setting custom claims
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
 *                   example: "Unauthorized: Login failed"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "AUTH_ERROR"
 *                     description:
 *                       type: string
 *                       example: "INVALID_PASSWORD"
 *                     message:
 *                       type: string
 *                       example: "Login failed"
 *                     customClaimsError:
 *                       type: string
 *                       description: "Details if an error occurred while setting custom claims."
 *                       example: "An error occurred while setting custom claims. Please try again later."
 */

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return createResponse(res, 400, "Email and password are required.");
  }

  try {
    // Make the request to Firebase Authentication API
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { idToken } = response.data; // Get the idToken from the response

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("Decoded toen", decodedToken);
      const { uid } = decodedToken;

      const user = await prisma.user.findUnique({
        where: { uid: uid },
        select: {
          id: true,
          uid: true,
          defaultTenantUser: {
            select: {
              id: true,
              tenant: {
                select: {
                  id: true,
                  name: true,
                },
              },
              role: true,
              tenantOrgUser: {
                select: {
                  tenantOrgId: true,
                  permission: true,
                },
              },
            },
            where: {
              isActive: true,
            },
          },
        },
      });

      if (!user || !user.defaultTenantUser) {
        return createResponse(
          res,
          404,
          "User does not have access to an active tenant."
        );
      }

      // Construct new custom claims
      const newCustomClaims = {
        id: user.id,
        tenant: {
          userId: user.defaultTenantUser.id,
          id: user.defaultTenantUser.tenant.id,
          name: user.defaultTenantUser.tenant.name,
        },
        role: user.defaultTenantUser.role,
        tenantOrgs: user.defaultTenantUser.tenantOrgUser.map((orgUser) => ({
          tenantOrgId: orgUser.tenantOrgId,
          permission: orgUser.permission,
        })),
      };

      try {
        // Set custom claims on Firebase token
        await admin
          .auth()
          .setCustomUserClaims(uid, { customClaims: newCustomClaims });

        // Return the response from Firebase to the client with the custom claims
        return createResponse(res, 200, "Login successful and claims set", {
          ...response.data,
          customClaims: newCustomClaims,
        });
      } catch (error) {
        console.error("Error setting custom claims:", error);
        return createResponse(
          res,
          500,
          "An error occurred while setting custom claims. Please try again later.",
          null,
          { code: "CUSTOM_CLAIMS_ERROR", message: error.message }
        );
      }
    } catch (error) {
      console.error("Error during token verification:", error);
      return createResponse(res, 401, "Token is invalid or expired.", null, {
        code: "INVALID_TOKEN",
        message: error.message,
      });
    }
  } catch (error) {
    // Handle errors from Firebase and use createResponse to return the error
    const errorMessage = error.response?.data?.error?.message || "Login failed";
    const errorCode = error.response?.data?.error?.code || "AUTH_ERROR";

    return createResponse(res, 401, "Unauthorized: Login failed", null, {
      code: errorCode,
      message: errorMessage,
      description: error.response?.data?.error?.message || null,
    });
  }
});

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
      console.log("Decoded token", decodedToken);
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
