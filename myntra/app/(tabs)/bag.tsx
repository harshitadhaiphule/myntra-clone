import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ShoppingBag, Minus, Plus, Trash2, Heart } from "lucide-react-native";
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useTheme } from "@/context/themeContext";

const BASE_URL = "http://localhost:5000";

export default function Bag() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [bag, setBag] = useState<any[]>([]);

  useEffect(() => {
    fetchproduct();
  }, [user]);

  const fetchproduct = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/bag/${user._id}`);
      setBag(res.data || []);
    } catch (error) {
      console.log("Bag fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===============================
     SPLIT CART & SAVED ITEMS
  =============================== */
  const cartItems = useMemo(
    () => bag.filter((item) => !item.savedForLater),
    [bag]
  );

  const savedItems = useMemo(
    () => bag.filter((item) => item.savedForLater),
    [bag]
  );

  /* ===============================
     TOTAL (EXCLUDES SAVED ITEMS)
  =============================== */
  const total = cartItems.reduce(
    (sum: number, item: any) =>
      sum + (item.productId?.price || 0) * item.quantity,
    0
  );

  /* ===============================
     DELETE ITEM
  =============================== */
  const handledelete = async (itemid: any) => {
    try {
      await axios.delete(`${BASE_URL}/bag/${itemid}`);
      fetchproduct();
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  /* ===============================
     TOGGLE SAVE FOR LATER
  =============================== */
  const toggleSave = async (itemid: string) => {
    try {
      await axios.put(`${BASE_URL}/bag/toggle-save/${itemid}`);
      fetchproduct();
    } catch (error) {
      console.log("Toggle save error:", error);
    }
  };

  /* ===============================
     UPDATE QUANTITY (NEW)
  =============================== */
  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;

    try {
      await axios.put(`${BASE_URL}/bag/update-quantity/${itemId}`, {
        quantity: newQty,
      });
      fetchproduct();
    } catch (error) {
      console.log("Quantity update error:", error);
    }
  };

  const styles = getStyles(colors);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Bag</Text>
        </View>
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={colors.primary} />
          <Text style={styles.emptyTitle}>Please login to view your bag</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (bag.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Bag</Text>
        </View>
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={colors.primary} />
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Shopping Bag ({cartItems.length})
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* ================= CART ITEMS ================= */}
        {cartItems.map((item: any) => (
          <View key={item._id} style={styles.bagItem}>
            <Image
              source={{ uri: item.productId?.images?.[0] }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.brandName}>
                {item.productId?.brand}
              </Text>
              <Text style={styles.itemName}>
                {item.productId?.name}
              </Text>
              <Text style={styles.itemSize}>Size: {item.size}</Text>
              <Text style={styles.itemPrice}>
                ₹{item.productId?.price}
              </Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() =>
                    updateQuantity(item._id, item.quantity - 1)
                  }
                >
                  <Minus size={18} color={colors.primary} />
                </TouchableOpacity>

                <Text style={styles.quantity}>
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    updateQuantity(item._id, item.quantity + 1)
                  }
                >
                  <Plus size={18} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => toggleSave(item._id)}
                  style={styles.saveButton}
                >
                  <Heart size={18} color={colors.primary} />
                  <Text style={styles.saveText}>Save for Later</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handledelete(item._id)}
                >
                  <Trash2 size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* ================= SAVED ITEMS ================= */}
        {savedItems.length > 0 && (
          <>
            <Text style={styles.savedHeader}>
              Saved for Later ({savedItems.length})
            </Text>

            {savedItems.map((item: any) => (
              <View key={item._id} style={styles.bagItem}>
                <Image
                  source={{ uri: item.productId?.images?.[0] }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.brandName}>
                    {item.productId?.brand}
                  </Text>
                  <Text style={styles.itemName}>
                    {item.productId?.name}
                  </Text>
                  <Text style={styles.itemSize}>Size: {item.size}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.productId?.price}
                  </Text>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      onPress={() => toggleSave(item._id)}
                      style={styles.saveButton}
                    >
                      <ShoppingBag size={18} color={colors.primary} />
                      <Text style={styles.saveText}>Move to Bag</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handledelete(item._id)}
                    >
                      <Trash2 size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* ================= FOOTER ================= */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push("/checkout")}
          >
            <Text style={styles.checkoutButtonText}>PLACE ORDER</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
/* ---------- THEME-AWARE STYLES ---------- */
const getStyles = (colors: any) =>
  StyleSheet.create({
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 15,
      paddingTop: 50,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 15,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyTitle: {
      fontSize: 18,
      color: colors.text,
      marginTop: 20,
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 10,
    },
    loginButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    bagItem: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 10,
      marginBottom: 15,
      elevation: 5,
      overflow: "hidden",
    },
    itemImage: {
      width: 100,
      height: 120,
    },
    itemInfo: {
      flex: 1,
      padding: 15,
    },
    brandName: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 5,
    },
    itemName: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 5,
    },
    itemSize: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 5,
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 10,
    },
    quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    quantity: {
      fontSize: 16,
      color: colors.text,
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    saveText: {
      color: colors.primary,
      fontWeight: "600",
    },
    savedHeader: {
      fontSize: 18,
      fontWeight: "bold",
      marginVertical: 10,
      color: colors.text,
    },
    removeButton: {
      marginLeft: "auto",
    },
    footer: {
      padding: 15,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    totalLabel: {
      fontSize: 16,
      color: colors.text,
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    checkoutButton: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
    },
    checkoutButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
