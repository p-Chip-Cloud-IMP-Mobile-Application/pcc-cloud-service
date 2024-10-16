const prisma = require("../config/prisma");
const admin = require("../config/firebase");

const authMiddleware = async (req, res, next) => {
  //console.log("Request headers", req.headers.authorization);
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization header missing or malformed" });
    }

    const token = authHeader.split("Bearer ")[1];

    try {
      // Authenticate the token with Firebase
      const decodedToken = await admin.auth().verifyIdToken(token);

      //console.log("Decoded token", decodedToken);

      const { uid, customClaims } = decodedToken;

      if (!customClaims) {
        // Query to get necessary information for custom claims
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
          return res.status(404).json({
            error: "User does not have access to an active tenant.",
          });
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

        //console.log("New Custom Claims", newCustomClaims);

        // Set custom claims on Firebase token
        await admin
          .auth()
          .setCustomUserClaims(uid, { customClaims: newCustomClaims });

        return res.status(403).json({
          error:
            "Access denied. Please refresh your token to update permissions.",
        });
      }

      // Set the custom claims on the request object
      req.customClaims = customClaims;

      // Pass custom claims to the next route
      next();
    } catch (error) {
      console.error("Error decoding token:", error);
      return res.status(401).json({ error: "Token is invalid or expired." });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

module.exports = authMiddleware;
