import { saveRecentlyViewed } from "../../utils/storage";
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, ShoppingBag } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const BASE_URL = "http://localhost:5000"; // ✅ SINGLE SOURCE

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const productId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<number | null>(null);
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [isWishlist, setIsWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${BASE_URL}/product/${productId}`);
        setProduct(res.data);
      } catch (error) {
        console.log("Product fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (product) {
      saveRecentlyViewed({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
      });
      startAutoScroll();
    }

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [product]);

  const startAutoScroll = () => {
    autoScrollTimer.current = setInterval(() => {
      if (product && scrollViewRef.current) {
        const nextIndex = (currentImageIndex + 1) % product.images.length;
        scrollViewRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        setCurrentImageIndex(nextIndex);
      }
    }, 3000);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Product not available</Text>
      </View>
    );
  }

  const handleAddWishlist = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/wishlist`, {
        userId: user._id,
        productId: product._id,
      });
      setIsWishlist(true);
      router.push("/wishlist");
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToBag = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/bag`, {
        userId: user._id,
        productId: product._id, 
        size: selectedSize,
        quantity: 1,
      });
      router.push("/bag");
    } catch (error) {
      console.log("Add to bag error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / width);
    setCurrentImageIndex(imageIndex);

    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      startAutoScroll();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {product.images.map((image: any, index: any) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={[styles.productImage, { width }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {product.images.map((_: any, index: any) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.name}>{product.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={handleAddWishlist}
            >
              <Heart
                size={24}
                color={isWishlist ? "#ff3f6c" : "#ccc"}
                fill={isWishlist ? "#ff3f6c" : "none"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.discount}>{product.discount}</Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.sizeSection}>
            <Text style={styles.sizeTitle}>Select Size</Text>
            <View style={styles.sizeGrid}>
              {product.sizes.map((size: any) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.selectedSize,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.selectedSizeText,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addToBagButton}
          onPress={handleAddToBag}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ff3f6c" />
          ) : (
            <>
              <ShoppingBag size={20} color="#fff" />
              <Text style={styles.addToBagText}>ADD TO BAG</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  carouselContainer: { position: "relative" },
  productImage: { height: 400 },
  pagination: { position: "absolute", bottom: 16, flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center" },
  paginationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255, 255, 255, 0.5)", marginHorizontal: 4 },
  paginationDotActive: { backgroundColor: "#fff", width: 10, height: 10, borderRadius: 5 },
  content: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 16, color: "#666", marginBottom: 5 },
  name: { fontSize: 20, fontWeight: "bold", color: "#3e3e3e", marginBottom: 10 },
  wishlistButton: { padding: 10 },
  priceContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  price: { fontSize: 20, fontWeight: "bold", color: "#3e3e3e", marginRight: 10 },
  discount: { fontSize: 16, color: "#ff3f6c" },
  description: { fontSize: 16, color: "#666", lineHeight: 24, marginBottom: 20 },
  sizeSection: { marginBottom: 20 },
  sizeTitle: { fontSize: 16, fontWeight: "bold", color: "#3e3e3e", marginBottom: 10 },
  sizeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sizeButton: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: "#ddd", justifyContent: "center", alignItems: "center" },
  selectedSize: { borderColor: "#ff3f6c", backgroundColor: "#fff4f4" },
  sizeText: { fontSize: 16, color: "#3e3e3e" },
  selectedSizeText: { color: "#ff3f6c" },
  footer: { padding: 15, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  addToBagButton: { backgroundColor: "#ff3f6c", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 15, borderRadius: 10, gap: 10 },
  addToBagText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
