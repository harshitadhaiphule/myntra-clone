import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, ChevronRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { getRecentlyViewed } from "../../utils/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@/context/themeContext";

const deals = [
  {
    id: 1,
    title: "Under ₹599",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "40-70% Off",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
  },
];

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme(); // ✅ get theme colors
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const { user } = useAuth();

  const handleProductPress = (productId: string) => {
    if (!user) {
      router.push("/login");
    } else {
      router.push(`/product/${productId}`);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadRecentlyViewed = async () => {
        const data = await getRecentlyViewed();
        setRecentlyViewed(data || []);
      };
      loadRecentlyViewed();
    }, [])
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const cat = await axios.get("http://localhost:5000/category");
        const prod = await axios.get("http://localhost:5000/product");

        setCategories(cat.data || []);
        setProduct(prod.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, []);

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>MYNTRA</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop",
        }}
        style={styles.banner}
      />

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SHOP BY CATEGORY</Text>
          <TouchableOpacity style={styles.viewAll}>
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loader}
            />
          ) : categories.length === 0 ? (
            <Text style={styles.emptyText}>No categories available</Text>
          ) : (
            categories.map((category: any) => (
              <TouchableOpacity key={category._id} style={styles.categoryCard}>
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                />
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Deals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DEALS OF THE DAY</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dealsScroll}
        >
          {deals.map((deal) => (
            <TouchableOpacity key={deal.id} style={styles.dealCard}>
              <Image source={{ uri: deal.image }} style={styles.dealImage} />
              <View style={styles.dealOverlay}>
                <Text style={styles.dealTitle}>{deal.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TRENDING NOW</Text>
        </View>
        <View style={styles.productsGrid}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loader}
            />
          ) : product.length === 0 ? (
            <Text style={styles.emptyText}>No Product available</Text>
          ) : (
            product.map((product: any) => (
              <TouchableOpacity
                key={product._id}
                style={styles.productCard}
                onPress={() => handleProductPress(product._id)}
              >
                <Image
                  source={{ uri: product.images?.[0] }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.brandName}>{product.brand}</Text>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>₹{product.price}</Text>
                    <Text style={styles.discount}>{product.discount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <View style={{ marginTop: 20, paddingHorizontal: 15 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
            Recently Viewed
          </Text>

          <FlatList
            horizontal
            data={recentlyViewed}
            keyExtractor={(item) => item._id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ marginRight: 12 }}
                onPress={() => router.push(`/product/${item._id}`)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 120, height: 160, borderRadius: 8 }}
                />
                <Text numberOfLines={1} style={{ color: colors.text }}>
                  {item.name}
                </Text>
                <Text style={{ fontWeight: "bold", color: colors.text }}>
                  ₹{item.price}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}

/* ---------- THEME-AWARE STYLES ---------- */
const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
      paddingTop: 50,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    emptyText: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 16,
      color: colors.textSecondary,
    },
    logo: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    searchButton: {
      padding: 8,
    },
    banner: {
      width: "100%",
      height: 200,
      resizeMode: "cover",
    },
    section: {
      padding: 15,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    viewAll: {
      flexDirection: "row",
      alignItems: "center",
    },
    viewAllText: {
      color: colors.primary,
      marginRight: 5,
    },
    categoriesScroll: {
      marginHorizontal: -15,
    },
    categoryCard: {
      width: 100,
      marginHorizontal: 8,
    },
    categoryImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    categoryName: {
      textAlign: "center",
      marginTop: 8,
      fontSize: 14,
      color: colors.text,
    },
    dealsScroll: {
      marginHorizontal: -15,
    },
    dealCard: {
      width: 280,
      height: 150,
      marginHorizontal: 8,
      borderRadius: 10,
      overflow: "hidden",
    },
    dealImage: {
      width: "100%",
      height: "100%",
    },
    dealOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      padding: 15,
    },
    dealTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
    productsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -8,
    },
    productCard: {
      width: "48%",
      marginHorizontal: "1%",
      marginBottom: 15,
      backgroundColor: colors.card,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    productImage: {
      width: "100%",
      height: 200,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    productInfo: {
      padding: 10,
    },
    brandName: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    productName: {
      fontSize: 16,
      marginBottom: 5,
      color: colors.text,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    productPrice: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginRight: 8,
    },
    discount: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "500",
    },
    loader: {
      marginTop: 50,
    },
  });
