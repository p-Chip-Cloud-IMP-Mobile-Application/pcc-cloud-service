const express = require("express");
const router = express.Router();
const userRouter = require("./routes/user");
const tenantRouter = require("./routes/tenant");
const tenantUserRouter = require("./routes/tenant-user");
const tenantOrgRouter = require("./routes/tenant-org");
const tenantOrgUserRouter = require("./routes/tenant-org-user");
const tenantOrgDocRouter = require("./routes/tenant-org-doc");
const docConfigRouter = require("./routes/doc-config");
const docTemplateRouter = require("./routes/doc-template");

router.use("/user", userRouter);
router.use("/tenant", tenantRouter);
router.use("/tenant-user", tenantUserRouter);
router.use("/tenant-org", tenantOrgRouter);
router.use("/tenant-org-user", tenantOrgUserRouter);
router.use("/tenant-org-doc", tenantOrgDocRouter);
router.use("/doc-config", docConfigRouter);
router.use("/doc-template", docTemplateRouter);

module.exports = router;
