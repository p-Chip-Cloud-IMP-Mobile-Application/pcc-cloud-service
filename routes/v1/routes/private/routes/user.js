const express = require("express");
const prisma = require("../../../../../config/prisma");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({});

    if (!users) {
      return res.status(204).json({ message: "No users found" });
    }

    console.log("users", users);

    return res.status(200).json({ message: "Good Request", data: users });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    return res.status(200).json({ message: "Good Request", data: "" });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
