const express = require("express");
const router = express.Router();
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const documentRouter = require("./routes/document");
const tenantRouter = require("./routes/tenant");
const mticRouter = require("./routes/mtic");
const fileRouter = require("./routes/file");
const authMiddleware = require("../../../../middleware/authMiddleware");

router.use("/authenticate", authRouter);
router.use("/user-requests", authMiddleware, userRouter);
router.use("/document-requests", authMiddleware, documentRouter);
router.use("/mtic-requests", authMiddleware, mticRouter);
router.use("/tenant-requests", tenantRouter);
router.use("/file", authMiddleware, fileRouter);

module.exports = router;
