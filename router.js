const express = require("express");
const router = express.Router();
const v1Router = require("./routes/v1/router");

router.use("/v1", v1Router);

module.exports = router;
