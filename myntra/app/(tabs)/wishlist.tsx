import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { Heart, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/context/themeContext";

const BASE_URL = "http://localhost:5000"; // ✅ SINGLE SOURCE

export default function Wishlist() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchproduct();
  }, [user]);

  const fetchproduct = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/wishlist/${user._id}`);
      setWishlist(res.data || []);
    } catch (error) {
      console.log("Wishlist fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handledelete = async (itemid: any) => {
    try {
      await axios.delete(`${BASE_URL}/wishlist/${itemid}`);
      fetchproduct();
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  const styles = getStyles(colors);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>
        <View style={styles.emptyState}>
          <Heart size={64} color={colors.primary} />
          <Text style={styles.emptyTitle}>
            Please login to view your wishlist
          </Text>
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

  if (wishlist.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>
        <View style={styles.emptyState}>
          <Heart size={64} color={colors.primary} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlist</Text>
      </View>

      <ScrollView style={styles.content}>
        {wishlist.map((item: any) => (
          <View key={item._id} style={styles.wishlistItem}>
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
              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  ₹{item.productId?.price}
                </Text>
                <Text style={styles.discount}>
                  {item.productId?.discount}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handledelete(item._id)}
            >
              <Trash2 size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
    wishlistItem: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 10,
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
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
      marginBottom: 10,
    },
    priceContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    price: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginRight: 10,
    },
    discount: {
      fontSize: 14,
      color: colors.primary,
    },
    removeButton: {
      padding: 15,
      justifyContent: "center",
    },
  });
