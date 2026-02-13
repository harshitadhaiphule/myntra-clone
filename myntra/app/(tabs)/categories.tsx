import {
  StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { Search, X } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("http://localhost:5000/category");
        setCategories(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSearchQuery("");
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setSearchQuery("");
  };

  const filteredCategories = categories?.filter(
    (category: any) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subcategory.some((sub: any) =>
        sub.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      category.productId.some(
        (product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const selectedCategoryData = selectedCategory
    ? categories?.find((cat: any) => cat._id === selectedCategory)
    : null;

  const renderProducts = (products: any) => {
    return products?.map((product: any) => (
      <TouchableOpacity
        key={product._id}
        style={styles.productCard}
        onPress={() => router.push(`/product/${product._id}`)}
      >
        <Image source={{ uri: product.images[0] }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.brandName}>{product.brand}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.discount}>{product.discount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  const styles = getStyles(colors);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!categories?.length) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.text }}>Categories not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products, brands and more"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {!selectedCategory && (
          <View style={styles.categoriesGrid}>
            {filteredCategories?.map((category: any) => (
              <TouchableOpacity
                key={category._id}
                style={styles.categoryCard}
                onPress={() => handleCategorySelect(category._id)}
              >
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                />
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.subcategories}>
                      {category?.subcategory?.map((sub: any, index: number) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.subcategoryTag}
                          onPress={() => handleSubcategorySelect(sub)}
                        >
                          <Text style={styles.subcategoryText}>{sub}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedCategoryData && (
          <View style={styles.categoryDetail}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.backButtonText}>← Back to Categories</Text>
              </TouchableOpacity>
              <Text style={styles.categoryTitle}>
                {selectedCategoryData.name}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedCategoryData.subcategory.map((sub: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.subcategoryButton,
                    selectedSubcategory === sub && styles.selectedSubcategory,
                  ]}
                  onPress={() => handleSubcategorySelect(sub)}
                >
                  <Text
                    style={[
                      styles.subcategoryButtonText,
                      selectedSubcategory === sub && styles.selectedSubcategoryText,
                    ]}
                  >
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.productsGrid}>
              {renderProducts(selectedCategoryData?.productId)}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ---------- THEME-AWARE STYLES ---------- */
const getStyles = (colors: any) =>
  StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 15, paddingTop: 50, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: colors.text },
    searchContainer: { padding: 15, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    searchInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: colors.inputBackground, borderRadius: 10, padding: 10 },
    searchInput: { flex: 1, fontSize: 16, color: colors.text },
    content: { flex: 1, padding: 15 },
    categoriesGrid: { paddingBottom: 15 },
    categoryCard: { backgroundColor: colors.card, borderRadius: 10, marginBottom: 15, overflow: "hidden" },
    categoryImage: { width: "100%", height: 150 },
    categoryInfo: { padding: 15 },
    categoryName: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 10 },
    subcategories: { flexDirection: "row", flexWrap: "wrap" },
    subcategoryTag: { backgroundColor: colors.inputBackground, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 8, marginBottom: 8 },
    subcategoryText: { fontSize: 14, color: colors.textSecondary },
    categoryDetail: { flex: 1, padding: 15 },
    categoryHeader: { marginBottom: 15 },
    backButton: { marginBottom: 10 },
    backButtonText: { color: colors.primary, fontSize: 16 },
    categoryTitle: { fontSize: 24, fontWeight: "bold", color: colors.text },
    subcategoryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.inputBackground, marginRight: 10 },
    selectedSubcategory: { backgroundColor: colors.primary },
    subcategoryButtonText: { fontSize: 14, color: colors.text },
    selectedSubcategoryText: { color: "#fff" },
    productsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    productCard: { width: "48%", backgroundColor: colors.card, borderRadius: 10, marginBottom: 15, overflow: "hidden" },
    productImage: { width: "100%", height: 200, resizeMode: "cover" },
    productInfo: { padding: 10 },
    brandName: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
    productName: { fontSize: 16, color: colors.text, marginBottom: 8 },
    priceRow: { flexDirection: "row", alignItems: "center" },
    price: { fontSize: 16, fontWeight: "bold", color: colors.text, marginRight: 8 },
    discount: { fontSize: 14, color: colors.primary },
  });
