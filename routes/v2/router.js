const express = require("express");
const router = express.Router();
const profileRouter = require("./routes/profile");
const companyRouter = require("./routes/profile");
const readerRouter = require("./routes/reader");
const locationRouter = require("./routes/location");
const tagRouter = require("./routes/tag");
const tagHistoryRouter = require("./routes/tagHistory");

router.use("/profiles", profileRouter);
router.use("/comapnies", companyRouter);
router.use("/readers", readerRouter);
router.use("/locations", locationRouter);
router.use("/tags", tagRouter);
router.use("/tag-histories", tagHistoryRouter);

module.exports = router;
