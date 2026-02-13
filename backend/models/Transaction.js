const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ["Online", "COD"], required: true },
  status: { type: String, enum: ["Success", "Failed", "Refunded"], required: true },
  date: { type: Date, default: Date.now },
  receiptUrl: { type: String }, // optional PDF link
});

module.exports = mongoose.model("Transaction", transactionSchema);
