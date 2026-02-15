const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");
const UserHistory = require("../models/UserHistory");

// GET recommendations
router.get("/:productId/:userId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.params.userId;

    console.log("Recommendation request:", productId, userId);

    // Get current product
    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Get user history
    const historyDocs = await UserHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("productId");

    const historyCategories = historyDocs
      .map(h => h.productId?.category)
      .filter(Boolean);

    // Get wishlist
    const wishlistDocs = await Wishlist.find({ userId })
      .populate("productId");

    const wishlistCategories = wishlistDocs
      .map(w => w.productId?.category)
      .filter(Boolean);

    // Price range logic
    const minPrice = currentProduct.price * 0.7;
    const maxPrice = currentProduct.price * 1.3;

    // Recommendation query
    const recommendations = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: currentProduct.category },
        { brand: currentProduct.brand },
        { category: { $in: historyCategories } },
        { category: { $in: wishlistCategories } },
        { price: { $gte: minPrice, $lte: maxPrice } }
      ]
    })
    .limit(10)
    .sort({ rating: -1 });

    console.log("Recommendations found:", recommendations.length);

    res.json(recommendations);

  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;
