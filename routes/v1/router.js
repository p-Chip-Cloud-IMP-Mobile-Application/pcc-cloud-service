const express = require("express");
const router = express.Router();
const publicRouter = require("./routes/public/router");
const privateRouter = require("./routes/private/router");
const authRouter = require("./routes/auth/router");
const serviceRouter = require("./routes/services/router");
const authMiddleware = require("../../middleware/authMiddleware");

router.use("/public", publicRouter);
router.use("/private", authMiddleware, privateRouter);
router.use("/auth", authRouter);
router.use("/services", serviceRouter);

module.exports = router;
