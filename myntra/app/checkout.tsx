import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/themeContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { CreditCard, MapPin, Truck } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();

  const handlePlaceOrder = async () => {
    console.log("PLACE ORDER CLICKED");

    if (!user) {
      Alert.alert("Login Required", "Please login to place an order.");
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `http://localhost:5000/order/create/${user._id}`,
        {
          shippingAddress:
            "123 Main Street, Apt 4B, New York, NY, 10001",
          paymentMethod: "Card",
        }
      );

      console.log("Order success:", res.data);
      Alert.alert("Success", "Order placed successfully!");
      router.push("/transactions");
    } catch (error: any) {
      console.log("Order error:", error?.response || error);
      Alert.alert("Error", "Failed to place order. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Checkout
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Shipping Address
            </Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              defaultValue="John Doe"
            />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Address Line 1"
              placeholderTextColor={colors.textSecondary}
              defaultValue="123 Main Street"
            />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Address Line 2"
              placeholderTextColor={colors.textSecondary}
              defaultValue="Apt 4B"
            />
            <View style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
                defaultValue="New York"
              />
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="State"
                placeholderTextColor={colors.textSecondary}
                defaultValue="NY"
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Postal Code"
                placeholderTextColor={colors.textSecondary}
                defaultValue="10001"
              />
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Country"
                placeholderTextColor={colors.textSecondary}
                defaultValue="United States"
              />
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <CreditCard size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Payment Method
            </Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Card Number"
              placeholderTextColor={colors.textSecondary}
              defaultValue="**** **** **** 4242"
            />
            <View style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Expiry Date"
                placeholderTextColor={colors.textSecondary}
                defaultValue="12/25"
              />
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="CVV"
                placeholderTextColor={colors.textSecondary}
                defaultValue="***"
              />
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Truck size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Order Summary
            </Text>
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Subtotal
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ₹3,798
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Shipping
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ₹99
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Tax
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ₹190
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.total]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ₹4,087
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* PLACE ORDER BUTTON */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
          ]}
          onPress={handlePlaceOrder}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.placeOrderButtonText}>
            {loading ? "PLACING ORDER..." : "PLACE ORDER"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 15,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  form: { gap: 10 },
  input: {
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfInput: { width: "48%" },
  summary: { gap: 10 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  summaryLabel: { fontSize: 16 },
  summaryValue: { fontSize: 16 },
  total: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 10,
    paddingTop: 10,
  },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  placeOrderButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

