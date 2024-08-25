const express = require("express");
const router = express.Router();
const documentRouter = require("./document/router");

router.use("/document", documentRouter);

module.exports = router;
