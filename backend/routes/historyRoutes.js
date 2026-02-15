const express = require("express");
const router = express.Router();
const UserHistory = require("../models/UserHistory");

// Save browsing history
router.post("/", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await UserHistory.create({
      userId,
      productId,
    });

    res.status(200).json({ message: "History saved" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving history" });
  }
});

module.exports = router;
