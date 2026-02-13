import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Receipt } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Linking from "expo-linking";

type Transaction = {
  _id: string;
  total: number;
  paymentMethod: "Online" | "COD" | "Refund" | string;
  status: string;
  createdAt: string;
};

const BASE_URL = "http://localhost:5000"; // Works on web & laptop

export default function Transactions() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Online" | "COD" | "Refund">("All");
  const [sortNewest, setSortNewest] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/order/user/${user?._id}`
        );
        setTransactions(res.data || []);
      } catch (error) {
        console.log("Fetch transactions error:", error);
        Alert.alert("Error", "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchTransactions();
    }
  }, [user]);

  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    if (filter !== "All") {
      data = data.filter((t) => t.paymentMethod === filter);
    }

    data.sort((a, b) =>
      sortNewest
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return data;
  }, [transactions, filter, sortNewest]);

  const downloadHistory = async (type: "pdf" | "csv") => {
    try {
      const url = `${BASE_URL}/transactions/export/${user?._id}?type=${type}`;

      // 🌐 On web/laptop → open in new tab
      if (Platform.OS === "web") {
        Linking.openURL(url);
        return;
      }

      // 📱 On mobile → download & share
      const fileUri = FileSystem.documentDirectory + `transactions.${type}`;
      const res = await FileSystem.downloadAsync(url, fileUri);
      await Sharing.shareAsync(res.uri);
    } catch (error) {
      console.log("Download error:", error);
      Alert.alert("Download failed", "Please check backend connection.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (filteredTransactions.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No transactions found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filters */}
      <View style={styles.filterRow}>
        {["All", "Online", "COD", "Refund"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(type as any)}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  filter === type ? colors.primary : colors.card,
              },
            ]}
          >
            <Text
              style={{
                color: filter === type ? "#fff" : colors.text,
                fontWeight: "600",
              }}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort + Export */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={() => setSortNewest((prev) => !prev)}>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            Sort: {sortNewest ? "Newest" : "Oldest"}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity onPress={() => downloadHistory("pdf")}>
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              Export PDF
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => downloadHistory("csv")}>
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              Export CSV
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>
                Payment Mode
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {item.paymentMethod}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                ₹{item.total}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>Status</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {item.status}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>Date</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.receiptButton}
              onPress={() => downloadHistory("pdf")}
            >
              <Receipt size={20} color={colors.primary} />
              <Text style={[styles.receiptText, { color: colors.primary }]}>
                Download Receipt
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
  },
  receiptButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  receiptText: {
    fontSize: 14,
    fontWeight: "600",
  },
});


/* import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Receipt } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";

type Transaction = {
  _id: string;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
};

export default function Transactions() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/order/user/${user?._id}`
        );
        setTransactions(res.data);
      } catch (error) {
        console.log("Fetch transactions error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchTransactions();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No transactions found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>
                Payment Mode
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {item.paymentMethod}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                ₹{item.total}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>Status</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {item.status}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>Date</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity style={styles.receiptButton}>
              <Receipt size={20} color={colors.primary} />
              <Text style={[styles.receiptText, { color: colors.primary }]}>
                Download Receipt
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
  },
  receiptButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  receiptText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
 */