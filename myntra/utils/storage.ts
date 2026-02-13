import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Error saving item:", error);
  }
};

export const getItem = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error("Error getting item:", error);
    return null;
  }
};

export const deleteItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Error deleting item:", error);
  }
};
//changes
export const saveRecentlyViewed = async (product: any) => {
  const existing = await getItem("recently_viewed");
  let items = existing ? JSON.parse(existing) : [];

  // Remove duplicate
  items = items.filter((item: any) => item._id !== product._id);

  // Add to top
  items.unshift(product);

  // Limit to last 10 items
  if (items.length > 10) items = items.slice(0, 10);

  await saveItem("recently_viewed", JSON.stringify(items));
};

export const getRecentlyViewed = async () => {
  const data = await getItem("recently_viewed");
  return data ? JSON.parse(data) : [];
};

