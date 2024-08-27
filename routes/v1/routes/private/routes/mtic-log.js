const express = require("express");
const prisma = require("../../../../../config/prisma");
const prismaErrorHelper = require("../../../../../helpers/prismaErrorHelper");
const router = express.Router();

//Refactor required for post and put requests. Can me changed to an upsert function or user a helper function for simplicity
router.get("/", async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.post("/", async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    console.log("Error", error);
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    const { statusCode, message } = prismaErrorHelper(error);
    return res.status(statusCode).json({ error: message });
  }
});

module.exports = router;
