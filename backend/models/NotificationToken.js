const mongoose = require("mongoose");

const NotificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // ✅ proper reference type
      ref: "User",
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      unique: true, // ✅ prevents duplicate tokens
    },

    device: {
      type: String,
      default: "expo", // optional: android / ios / expo
    },
  },
  {
    timestamps: true, // ✅ adds createdAt and updatedAt
  }
);

module.exports = mongoose.model(
  "NotificationToken",
  NotificationTokenSchema
);
