const express = require("express");
const Bag = require("../models/Bag");
const router = express.Router();

// ==============================
// ➕ ADD TO BAG
// ==============================
router.post("/", async (req, res) => {
  try {
    const { userId, productId, size, quantity = 1 } = req.body;

    if (!userId || !productId || !size) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingItem = await Bag.findOne({
      userId,
      productId,
      size,
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.savedForLater = false;
      await existingItem.save();
      return res.status(200).json(existingItem);
    }

    const newItem = new Bag({
      userId,
      productId,
      size,
      quantity,
      savedForLater: false,
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);

  } catch (error) {
    console.error("Add to bag error:", error);
    res.status(500).json({ message: "Failed to add to bag" });
  }
});

// ==============================
// 📦 GET USER BAG
// ==============================
router.get("/:userId", async (req, res) => {
  try {
    const bag = await Bag.find({ userId: req.params.userId })
      .populate("productId")
      .sort({ createdAt: -1 });

    res.status(200).json(bag);
  } catch (error) {
    console.error("Fetch bag error:", error);
    res.status(500).json({ message: "Failed to fetch bag" });
  }
});

// ==============================
// 🔄 UPDATE QUANTITY
// ==============================
router.put("/update-quantity/:itemId", async (req, res) => {
  try {
    const { quantity } = req.body;

    const item = await Bag.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    item.quantity = quantity;
    await item.save();

    res.status(200).json(item);
  } catch (error) {
    console.error("Update quantity error:", error);
    res.status(500).json({ message: "Failed to update quantity" });
  }
});

// ==============================
// 🔄 TOGGLE SAVE FOR LATER
// ==============================
router.put("/toggle-save/:itemId", async (req, res) => {
  try {
    const item = await Bag.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.savedForLater = !item.savedForLater;
    await item.save();

    res.status(200).json(item);

  } catch (error) {
    console.error("Toggle save error:", error);
    res.status(500).json({ message: "Failed to update item" });
  }
});

// ==============================
// 🗑 DELETE ITEM
// ==============================
router.delete("/:itemId", async (req, res) => {
  try {
    const deleted = await Bag.findByIdAndDelete(req.params.itemId);

    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item removed from bag" });

  } catch (error) {
    console.error("Delete bag error:", error);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

module.exports = router;
