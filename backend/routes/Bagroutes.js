const express = require("express");
const Bag = require("../models/Bag");
const router = express.Router();

// ADD TO BAG
router.post("/", async (req, res) => {
  try {
    const { userId, productId, size, quantity } = req.body;

    if (!userId || !productId || !size) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newItem = new Bag({ userId, productId, size, quantity });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error("Add to bag error:", error);
    res.status(500).json({ message: "Failed to add to bag" });
  }
});

// GET USER BAG
router.get("/:userId", async (req, res) => {
  try {
    const bag = await Bag.find({ userId: req.params.userId }).populate(
      "productId"
    );
    res.status(200).json(bag);
  } catch (error) {
    console.error("Fetch bag error:", error);
    res.status(500).json({ message: "Failed to fetch bag" });
  }
});

// DELETE ITEM
router.delete("/:itemId", async (req, res) => {
  try {
    await Bag.findByIdAndDelete(req.params.itemId);
    res.status(200).json({ message: "Item removed from bag" });
  } catch (error) {
    console.error("Delete bag error:", error);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

module.exports = router;
