const prisma = require("../../config/prisma");
const admin = require("../../config/firebase");

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
      const decodedToken = await admin.auth().verifyIdToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decodedToken.uid },
        include: {
          profile: {
            include: {
              company: true, // Include the company relation within profile
            },
          },
        },
      });

      const profile = await prisma.profile.findUnique({
        where: {
          email: decodedToken.email,
        },
      });

      req.profile = profile;
      req.user = user;

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
