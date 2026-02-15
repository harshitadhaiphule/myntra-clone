import * as Notifications from "expo-notifications";

export const setupNotificationListeners = () => {

  // when notification received in foreground
  Notifications.addNotificationReceivedListener(notification => {
    console.log("Notification received:", notification);
  });

  // when user taps notification
  Notifications.addNotificationResponseReceivedListener(response => {
    console.log("Notification clicked:", response);
  });

};
