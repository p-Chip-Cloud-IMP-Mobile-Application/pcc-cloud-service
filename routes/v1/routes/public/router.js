const express = require("express");
const router = express.Router();
const testRouter = require("./routes/test");

router.use("/test", testRouter);

module.exports = router;
