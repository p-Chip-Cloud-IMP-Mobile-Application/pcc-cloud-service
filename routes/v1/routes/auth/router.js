const express = require("express");
const prisma = require("../../../../config/prisma");
const admin = require("../../../../config/firebase");
const router = express.Router();

router.post("/refresh-token", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization header missing or malformed" });
    }
    const token = authHeader.split("Bearer ")[1];

    console.log("Token", token);
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      console.log("Decoded token", decodedToken);
      const { uid } = decodedToken;

      const user = await prisma.user.findUnique({
        where: { uid: uid },
        select: {
          id: true,
          uid: true,
          defaultTenantUser: {
            select: {
              id: true,
              tenantId: true,
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
        return res.status(404).json({
          error: "User does not have access to an active tenant.",
        });
      }

      console.log("User", user);

      // Construct new custom claims
      const newCustomClaims = {
        id: user.id,
        tenantId: user.defaultTenantUser.tenantId,
        tenantUserId: user.defaultTenantUser.id,
        role: user.defaultTenantUser.role,
        tenantOrgs: user.defaultTenantUser.tenantOrgUser.map((orgUser) => ({
          tenantOrgId: orgUser.tenantOrgId,
          permission: orgUser.permission,
        })),
      };

      console.log("Custom claims", newCustomClaims);

      try {
        // Set custom claims on Firebase token
        await admin
          .auth()
          .setCustomUserClaims(uid, { customClaims: newCustomClaims });

        return res.status(200).json({
          message:
            "Your access is approved please reauthenticate to get your updated user access",
        });
      } catch (error) {
        return res.status(500).json({
          error:
            "An uncaught error occured authenticating you. Please try again later",
        });
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      return res.status(401).json({ error: "Token is invalid or expired." });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
});

router.post("/verify-token", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization header missing or malformed" });
    }
    const token = authHeader.split("Bearer ")[1];

    console.log("Token", token);
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      console.log("Decoded token", decodedToken);
      const { uid } = decodedToken;

      const user = await prisma.user.findUnique({
        where: { uid: uid },
        select: {
          id: true,
          uid: true,
          defaultTenantUser: {
            where: { isActive: true },
            select: {
              id: true,
              tenantId: true,
              role: true,
              tenantOrgUser: {
                select: {
                  tenantOrgId: true,
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user || !user.defaultTenantUser) {
        return res.status(404).json({
          error: "User does not have access to an active tenant.",
        });
      }

      // Construct new custom claims
      const newCustomClaims = {
        id: user.id,
        tenantId: user.defaultTenantUser.tenantId,
        tenantUserId: user.defaultTenantUser.id,
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

        return res.status(200).json({
          message:
            "Your access is approved please reauthenticate to get your updated user access",
        });
      } catch (error) {
        return res.status(500).json({
          error:
            "An uncaught error occured authenticating you. Please try again later",
        });
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      return res.status(401).json({ error: "Token is invalid or expired." });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
});

router.post("/register", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization header missing or malformed" });
    }
    const token = authHeader.split("Bearer ")[1];

    console.log("Token", token);
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      const { uid } = decodedToken;

      const existingUser = await prisma.user.findFirst({
        where: {
          uid: uid,
        },
      });
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      const newUser = await prisma.user.create({
        data: {
          uid: uid,
          email: decodedToken.email,
          name: decodedToken.name,
        },
      });

      if (!newUser) {
        console.error("Error during authentication:", error);
        return res.status(500).json({ error: "Internal Server Error." });
      }
      return res
        .status(201)
        .json({ message: "New user created", data: newUser });
    } catch (error) {
      console.error("Error during authentication:", error);
      return res.status(401).json({ error: "Token is invalid or expired." });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
});

//A user want to change their current tenant user profile to another available user profile
router.post("/exchange-token", async (req, res) => {});

module.exports = router;
