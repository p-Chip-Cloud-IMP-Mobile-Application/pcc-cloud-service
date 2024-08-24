// documentRoutes.js

const express = require("express");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    return res.status(200).json("Test ok");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
