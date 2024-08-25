const express = require("express");
const router = express.Router();
const tenantRouter = require("./routes/tenant/router");

router.use("/tenant", tenantRouter);

module.exports = router;
