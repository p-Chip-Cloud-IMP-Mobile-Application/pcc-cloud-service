const express = require("express");
const router = express.Router();
const profileRouter = require("./routes/profile");
const companyRouter = require("./routes/company");
const readerRouter = require("./routes/reader");
const locationRouter = require("./routes/location");
const tagRouter = require("./routes/tag");
const tagHistoryRouter = require("./routes/tagHistory");
const fileRouter = require("./routes/files");
const fieldsRouter = require("./routes/field");
const tagTemplateRouter = require("./routes/tagTemplate");
const companyLocationsRouter = require("./routes/companyLocations");
const userRouter = require("./routes/user");
const authMiddleware = require("./authMiddleware");

router.use("/users", userRouter);
router.use("/profiles", authMiddleware, profileRouter);
router.use("/companies", authMiddleware, companyRouter);
router.use("/readers", authMiddleware, readerRouter);
router.use("/locations", authMiddleware, locationRouter);
router.use("/tags", authMiddleware, tagRouter);
router.use("/tag-history", authMiddleware, tagHistoryRouter);
router.use("/files", authMiddleware, fileRouter);
router.use("/fields", authMiddleware, fieldsRouter);
router.use("/tag-templates", authMiddleware, tagTemplateRouter);
router.use("/company-locations", authMiddleware, companyLocationsRouter);

module.exports = router;
