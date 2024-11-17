const express = require("express");
const prisma = require("../../../config/prisma");
const authMiddleware = require("../authMiddleware");
const router = express.Router();

// Helper function to handle errors consistently
const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "An unexpected error occurred" });
};

router.get("/:id", authMiddleware, async (req, res) => {
  const params = req.params;
  const user = req.user;

  try {
    const searchedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!searchedUser) {
      return res.status(404).json({ error: "user not found" });
    }

    res.status(200).json(searchedUser);
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/", async (req, res) => {
  const { id, email } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        id,
        email,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    handleError(res, error);
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  if (user.id != id) {
    res.status(404).json({ error: "Not authorized" });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Profile not found" });
    }
    handleError(res, error);
  }
});

module.exports = router;
