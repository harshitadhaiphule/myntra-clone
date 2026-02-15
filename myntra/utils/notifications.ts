import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

export async function registerForPushNotifications(userId: string) {
  try {

    if (!Device.isDevice) {
      console.log("Must use physical device");
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permission not granted");
      return; // silently stop
    }

    const tokenData =
      await Notifications.getExpoPushTokenAsync();

    const token = tokenData.data;

    console.log("Push Token:", token);

    await axios.post(
      `${BASE_URL}/notifications/register`,
      {
        userId,
        token,
      }
    );

  } catch (error) {
    console.log("Notification error:", error);
  }
}
