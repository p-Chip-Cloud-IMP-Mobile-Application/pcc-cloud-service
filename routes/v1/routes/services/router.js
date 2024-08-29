const express = require("express");
const router = express.Router();
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const documentRouter = require("./routes/document");
const tenantRouter = require("./routes/tenant");
const mticRouter = require("./routes/mtic");
const authMiddleware = require("../../../../middleware/authMiddleware");

router.use("/authenticate", authRouter);
router.use("/user-requests", authMiddleware, userRouter);
router.use("/document-requests", authMiddleware, documentRouter);
router.use("/mtic-requests", authMiddleware, mticRouter);
router.use("/tenant-requests", tenantRouter);

module.exports = router;

//Things I need to do in order

//Authenticate user

//Give users the most recent documents that they have access to based on tenant and tenant organization roles - Done

//Give users the documents that they have access to create