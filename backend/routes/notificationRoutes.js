const NotificationToken = require("../models/NotificationToken");
const express = require("express");
const router = express.Router();
const NotificationToken =
  require("../models/NotificationToken");

const { Expo } = require("expo-server-sdk");

const expo = new Expo();

//////////////////////////////////////////////////////
// REGISTER TOKEN
//////////////////////////////////////////////////////

router.post("/register", async (req, res) => {

  const { userId, token } = req.body;

  try {

    await NotificationToken.findOneAndUpdate(
      { userId },
      { token },
      { upsert: true }
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json(err);
  }
});

//////////////////////////////////////////////////////
// SEND NOTIFICATION
//////////////////////////////////////////////////////

router.post("/send", async (req, res) => {

  const { userId, title, body } = req.body;

  try {

    const record =
      await NotificationToken.findOne({ userId });

    if (!record) return res.json({ error: "No token" });

    const message = {
      to: record.token,
      sound: "default",
      title,
      body,
      data: { screen: "orders" },
    };

    await expo.sendPushNotificationsAsync([message]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
