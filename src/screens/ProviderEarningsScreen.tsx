import { Feather, Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { ClassicAlertModal } from "../components/ClassicAlertModal";

type ProviderEarningsScreenProps = NativeStackScreenProps<any, "Earnings">;

interface PayoutTransaction {
  id: string;
  amount: string;
  date: string;
  status: "Success" | "Processing" | "Failed";
  txnId: string;
}

const INITIAL_PAYOUTS: PayoutTransaction[] = [
  {
    id: "1",
    amount: "₹3,400",
    date: "08 Jun 2026",
    status: "Success",
    txnId: "TXN-98274102",
  },
  {
    id: "2",
    amount: "₹2,850",
    date: "01 Jun 2026",
    status: "Success",
    txnId: "TXN-98104712",
  },
  {
    id: "3",
    amount: "₹4,100",
    date: "25 May 2026",
    status: "Success",
    txnId: "TXN-97984120",
  },
  {
    id: "4",
    amount: "₹2,100",
    date: "18 May 2026",
    status: "Success",
    txnId: "TXN-97814987",
  },
];

export const ProviderEarningsScreen: React.FC<ProviderEarningsScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(4650);
  const [payouts, setPayouts] = useState<PayoutTransaction[]>(INITIAL_PAYOUTS);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "warning" | "error" | "info";
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const showAlert = (
    type: "success" | "warning" | "error" | "info",
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText?: string
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const handleWithdraw = () => {
    if (balance <= 0) {
      showAlert("error", "Insufficient Balance", "You don't have any funds available to withdraw.");
      return;
    }

    showAlert(
      "warning",
      "Confirm Withdrawal",
      `Are you sure you want to withdraw ₹${balance.toLocaleString()} to your registered bank account?`,
      () => {
        hideAlert();
        setIsWithdrawing(true);
        setTimeout(() => {
          const newPayout: PayoutTransaction = {
            id: (payouts.length + 1).toString(),
            amount: `₹${balance.toLocaleString()}`,
            date: new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            status: "Processing",
            txnId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
          };

          setPayouts([newPayout, ...payouts]);
          setBalance(0);
          setIsWithdrawing(false);
          setTimeout(() => {
            showAlert(
              "success",
              "Withdrawal Requested",
              "Your withdrawal request has been submitted successfully and is being processed."
            );
          }, 100);
        }, 1500);
      },
      "Withdraw"
    );
  };

  const renderItem = ({ item }: { item: PayoutTransaction }) => {
    const statusColors = {
      Success: { bg: "#E8F5E9", text: "#2E7D32" },
      Processing: { bg: "#FFF3E0", text: "#E65100" },
      Failed: { bg: "#FFEBEE", text: "#C62828" },
    }[item.status];

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.txnAmount}>{item.amount}</Text>
            <Text style={styles.txnId}>{item.txnId}</Text>
          </View>
          <View style={styles.rightInfo}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.txnDate}>{item.date}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Banner */}
      <LinearGradient
        colors={COLORS.gradient}
        style={[
          styles.header,
          { paddingTop: insets.top > 0 ? insets.top + 12 : 24 },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Earnings & Payouts</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Balance Showcase */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>₹{balance.toLocaleString()}</Text>
          <TouchableOpacity
            style={[styles.withdrawButton, balance === 0 && styles.disabledButton]}
            onPress={handleWithdraw}
            disabled={balance === 0 || isWithdrawing}
            activeOpacity={0.8}
          >
            <Text style={styles.withdrawButtonText}>
              {isWithdrawing ? "Processing..." : "Withdraw to Bank"}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Summary Rows */}
      <View style={styles.statsSummaryGrid}>
        <View style={styles.statSummaryCard}>
          <Text style={styles.statSummaryLabel}>Total Earnings</Text>
          <Text style={styles.statSummaryValue}>₹17,100</Text>
        </View>
        <View style={styles.statSummaryCard}>
          <Text style={styles.statSummaryLabel}>This Month</Text>
          <Text style={styles.statSummaryValue}>₹6,250</Text>
        </View>
      </View>

      {/* Payout History List */}
      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Payout History</Text>
        <FlatList
          data={payouts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No payout history found</Text>
            </View>
          }
        />
      </View>

      <ClassicAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
  },
  balanceContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  balanceLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.white,
    marginVertical: 6,
  },
  withdrawButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  withdrawButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    elevation: 0,
    shadowOpacity: 0,
  },
  statsSummaryGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: -16,
    zIndex: 10,
    marginBottom: 16,
  },
  statSummaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statSummaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  statSummaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  txnId: {
    fontSize: 11,
    color: COLORS.textHint,
    marginTop: 2,
  },
  rightInfo: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  txnDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textHint,
    marginTop: 10,
  },
});
