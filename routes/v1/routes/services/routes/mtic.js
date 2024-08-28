const express = require("express");
const router = express.Router();
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const createResponse = require("../../../../../helpers/createResponse");

router.post("/start-mtic-session", async (req, res, next) => {
  const { mticReaderId, lat, lon } = req.body;
});

module.exports = router;
