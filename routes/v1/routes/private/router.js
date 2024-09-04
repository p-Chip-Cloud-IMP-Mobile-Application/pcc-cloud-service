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
const docRouter = require("./routes/doc");
const mticRouter = require("./routes/mtic");
const mticLogRouter = require("./routes/mtic-log");
const mticReaderRouter = require("./routes/mtic-reader");
const mticDocumentRouter = require("./routes/mtic-document");
const fileRouter = require("./routes/files");

router.use("/user", userRouter);
router.use("/tenant", tenantRouter);
router.use("/tenant-user", tenantUserRouter);
router.use("/tenant-org", tenantOrgRouter);
router.use("/tenant-org-user", tenantOrgUserRouter);
router.use("/tenant-org-doc", tenantOrgDocRouter);
router.use("/doc-config", docConfigRouter);
router.use("/doc-template", docTemplateRouter);
router.use("/doc", docRouter); //Not complete
router.use("/mtic", mticRouter); //Not complete
router.use("/mtic-log", mticLogRouter); //Not complete
router.use("/mtic-reader", mticReaderRouter); //Not complete
router.use("/mtic-document", mticDocumentRouter); //Not complete
router.use("/files", fileRouter);

module.exports = router;
