const express = require("express");
const router = express.Router();
const profileRouter = require("./routes/profile");
const companyRouter = require("./routes/profile");
const readerRouter = require("./routes/reader");
const locationRouter = require("./routes/location");
const tagRouter = require("./routes/tag");
const tagHistoryRouter = require("./routes/tagHistory");
const fileRouter = require("./routes/files");

router.use("/profiles", profileRouter);
router.use("/companies", companyRouter);
router.use("/readers", readerRouter);
router.use("/locations", locationRouter);
router.use("/tags", tagRouter);
router.use("/tag-history", tagHistoryRouter);
router.use("/files", fileRouter);

module.exports = router;
