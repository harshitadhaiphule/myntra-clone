import { saveRecentlyViewed } from "../../utils/storage";
import React, { useState, useEffect, useRef } from "react";
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
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/themeContext";

const BASE_URL = "http://localhost:5000"; 

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const productId = Array.isArray(id) ? id[0] : id;

  const router = useRouter();
  const { width } = useWindowDimensions();

  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<any>(null);

  const [product, setProduct] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [isWishlist, setIsWishlist] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  //////////////////////////////////////////////////////
  // FETCH PRODUCT
  //////////////////////////////////////////////////////

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);

      const res = await axios.get(
        `${BASE_URL}/product/${productId}`
      );

      setProduct(res.data);

      saveRecentlyViewed({
        _id: res.data._id,
        name: res.data.name,
        price: res.data.price,
        image: res.data.images?.[0],
      });

      if (user) {
        await axios.post(`${BASE_URL}/history`, {
          userId: user._id,
          productId: res.data._id,
        });
      }

      fetchRecommendations(res.data._id);

    } catch (error) {
      console.log("Product error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // FETCH RECOMMENDATIONS
  //////////////////////////////////////////////////////

  const fetchRecommendations = async (pid: string) => {
    try {
      if (!user) return;

      const res = await axios.get(
        `${BASE_URL}/recommendations/${pid}/${user._id}`
      );

      setRecommendations(res.data);

    } catch (error) {
      console.log("Recommendation error:", error);
    }
  };

  //////////////////////////////////////////////////////
  // AUTO IMAGE SCROLL
  //////////////////////////////////////////////////////

  useEffect(() => {
    if (!product?.images) return;

    autoScrollTimer.current = setInterval(() => {
      const next =
        (currentImageIndex + 1) %
        product.images.length;

      scrollViewRef.current?.scrollTo({
        x: next * width,
        animated: true,
      });

      setCurrentImageIndex(next);

    }, 3000);

    return () => clearInterval(autoScrollTimer.current);

  }, [currentImageIndex, product]);

  //////////////////////////////////////////////////////
  // ADD TO BAG
  //////////////////////////////////////////////////////

  const handleAddToBag = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!selectedSize) {
      alert("Please select size");
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

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // ADD TO WISHLIST
  //////////////////////////////////////////////////////

  const handleWishlist = async () => {
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

    } catch (err) {
      console.log(err);
    }
  };

  //////////////////////////////////////////////////////
  // LOADING
  //////////////////////////////////////////////////////

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary}/>
      </View>
    );
  }

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (
    <View style={styles.container}>

      <ScrollView>

        {/* IMAGE CAROUSEL */}

        <View>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {product.images.map((img: string, index: number) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{ width, height: 420 }}
              />
            ))}
          </ScrollView>

          <View style={styles.dots}>
            {product.images.map((_: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index &&
                  styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* PRODUCT INFO */}

        <View style={styles.content}>

          <View style={styles.header}>

            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>
                {product.brand}
              </Text>

              <Text style={styles.name}>
                {product.name}
              </Text>
            </View>

            <TouchableOpacity onPress={handleWishlist}>
              <Heart
                size={26}
                color={
                  isWishlist
                    ? colors.primary
                    : colors.textSecondary
                }
                fill={
                  isWishlist
                    ? colors.primary
                    : "none"
                }
              />
            </TouchableOpacity>

          </View>

          <Text style={styles.price}>
            ₹{product.price}
          </Text>

          <Text style={styles.description}>
            {product.description}
          </Text>

          {/* SIZE */}

          <Text style={styles.sizeTitle}>
            Select Size
          </Text>

          <View style={styles.sizeGrid}>
            {product.sizes?.map((size: string) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeButton,
                  selectedSize === size &&
                  styles.sizeSelected,
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selectedSize === size &&
                    styles.sizeTextSelected,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* RECOMMENDATIONS */}

          {recommendations.length > 0 && (
            <>
              <Text style={styles.recommendTitle}>
                You May Also Like
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>

                {recommendations.map((item) => (

                  <TouchableOpacity
                    key={item._id}
                    style={styles.card}
                    onPress={() =>
                      router.push(`/product/${item._id}`)
                    }
                  >
                    <Image
                      source={{ uri: item.images[0] }}
                      style={styles.cardImage}
                    />

                    <Text style={styles.cardBrand}>
                      {item.brand}
                    </Text>

                    <Text style={styles.cardName}>
                      {item.name}
                    </Text>

                    <Text style={styles.cardPrice}>
                      ₹{item.price}
                    </Text>

                  </TouchableOpacity>

                ))}

              </ScrollView>
            </>
          )}

        </View>

      </ScrollView>

      {/* FOOTER */}

      <View style={styles.footer}>

        <TouchableOpacity
          style={styles.bagButton}
          onPress={handleAddToBag}
        >
          {loading
            ? <ActivityIndicator color="#fff"/>
            :
            <>
              <ShoppingBag color="#fff"/>
              <Text style={styles.bagText}>
                ADD TO BAG
              </Text>
            </>
          }
        </TouchableOpacity>

      </View>

    </View>
  );
}

////////////////////////////////////////////////////////
// STYLES
////////////////////////////////////////////////////////
const getStyles = (colors: any) =>
StyleSheet.create({

container:{
  flex:1,
  backgroundColor:"#0f1a2e" // dark navy like screenshot
},

loader:{
  flex:1,
  justifyContent:"center",
  alignItems:"center"
},

content:{
  padding:16,
  backgroundColor:"#0f1a2e"
},

header:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center"
},

brand:{
  fontSize:16,
  color:"#9ca3af" // light gray like Myntra
},

name:{
  fontSize:20,
  fontWeight:"bold",
  color:"#ffffff", // WHITE
  marginVertical:4
},

price:{
  fontSize:20,
  fontWeight:"bold",
  marginVertical:6,
  color:"#ffffff" // WHITE
},

description:{
  color:"#9ca3af", // light gray
  marginVertical:10,
  lineHeight:20
},

sizeTitle:{
  fontWeight:"bold",
  marginTop:10,
  marginBottom:10,
  fontSize:16,
  color:"#ffffff" // WHITE
},

sizeGrid:{
  flexDirection:"row",
  flexWrap:"wrap",
  gap:12
},

sizeButton:{
  width:55,
  height:55,
  borderRadius:30,
  borderWidth:1,
  borderColor:"#374151", // subtle dark border
  justifyContent:"center",
  alignItems:"center",
  backgroundColor:"transparent"
},

sizeSelected:{
  borderColor:"#ff3f6c",
  backgroundColor:"#1f2937"
},

sizeText:{
  fontWeight:"bold",
  color:"#ffffff" // WHITE
},

sizeTextSelected:{
  color:"#ff3f6c"
},

recommendTitle:{
  fontSize:18,
  fontWeight:"bold",
  marginTop:20,
  marginBottom:12,
  color:"#ffffff" // WHITE
},

card:{
  width:140,
  marginRight:14
},

cardImage:{
  width:140,
  height:180,
  borderRadius:12
},

cardBrand:{
  fontWeight:"bold",
  marginTop:6,
  color:"#ffffff" // WHITE
},

cardName:{
  color:"#9ca3af"
},

cardPrice:{
  fontWeight:"bold",
  color:"#ffffff"
},

footer:{
  padding:12,
  borderTopWidth:1,
  borderColor:"#1f2937",
  backgroundColor:"#0f1a2e"
},

bagButton:{
  backgroundColor:"#6366f1", // Myntra purple
  padding:16,
  borderRadius:10,
  flexDirection:"row",
  justifyContent:"center",
  alignItems:"center",
  gap:10
},

bagText:{
  color:"#ffffff",
  fontWeight:"bold",
  fontSize:16
},

dots:{
  flexDirection:"row",
  justifyContent:"center",
  marginVertical:10
},

dot:{
  width:6,
  height:6,
  backgroundColor:"#4b5563",
  borderRadius:3,
  margin:4
},

activeDot:{
  backgroundColor:"#6366f1"
}

});
