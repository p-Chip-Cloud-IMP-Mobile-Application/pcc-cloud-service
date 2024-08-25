const express = require("express");
const router = express.Router();
const templateRouter = require("./routes/template");

router.use("/template", templateRouter);

module.exports = router;
