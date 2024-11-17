const express = require("express");
const router = express.Router();
const v1Router = require("./routes/v1/router");
const v2Router = require("./routes/v2/router");

router.use("/v1", v1Router);
router.use("/v2", v2Router);

module.exports = router;
