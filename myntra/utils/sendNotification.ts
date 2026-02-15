const { Expo } = require("expo-server-sdk");
import type { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
const NotificationToken = require("../models/NotificationToken");

const expo = new Expo();

const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<void> => {
  try {

    const tokens = await NotificationToken.find({ userId });

    if (!tokens || tokens.length === 0) {
      console.log("No tokens found for user:", userId);
      return;
    }

    const messages: ExpoPushMessage[] = [];

    for (const t of tokens) {

      if (!Expo.isExpoPushToken(t.token)) {
        console.log("Invalid Expo push token:", t.token);
        continue;
      }

      messages.push({
        to: t.token,
        sound: "default",
        title,
        body,
        data,
        priority: "high",
      });

    }

    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {

      const tickets: ExpoPushTicket[] =
        await expo.sendPushNotificationsAsync(chunk);

      console.log("Notification sent:", tickets);

    }

  } catch (error) {
    console.log("Push notification error:", error);
  }
};

export default sendPushNotification;
