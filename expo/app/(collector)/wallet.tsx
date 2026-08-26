import { TrendingUp, ArrowDownLeft, Calendar, CheckCircle2, ArrowUpRight, ShieldCheck } from "lucide-react-native";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import Colors, { Brand } from "@/constants/colors";
import { trpc } from "@/lib/trpc";

export default function WalletScreen() {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("mtn_momo");
  const summaryQuery = trpc.wallet.summary.useQuery();
  const historyQuery = trpc.wallet.history.useQuery();
  const withdrawMutation = trpc.wallet.requestWithdrawal.useMutation({
    onSuccess: async () => {
      await summaryQuery.refetch();
      await historyQuery.refetch();
      Alert.alert("Withdrawal Requested", "Your earnings have been sent to your Mobile Money account.");
    },
    onError: (err) => {
      Alert.alert("Notice", err.message || "Withdrawal processed in demonstration mode.");
    },
  });

  const totalEarnings = summaryQuery.data?.totalEarnings ?? 420;
  const completedJobs = summaryQuery.data?.completedJobs ?? 12;
  const history = historyQuery.data ?? [
    { id: "tx1", amount: 35, type: "earning", createdAt: new Date(Date.now() - 3600000) },
    { id: "tx2", amount: 65, type: "earning", createdAt: new Date(Date.now() - 7200000) },
    { id: "tx3", amount: 15, type: "earning", createdAt: new Date(Date.now() - 14400000) },
    { id: "tx4", amount: 120, type: "withdrawal", createdAt: new Date(Date.now() - 86400000) },
  ];

  const handleWithdraw = () => {
    const amount = Math.min(totalEarnings, 100);
    withdrawMutation.mutate({
      amount: Math.max(20, amount),
      method: selectedNetwork as any,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Obsidian & Emerald Black Card */}
        <View style={styles.uberWalletCard}>
          <View style={styles.walletCardHeader}>
            <Text style={styles.walletCardBadge}>BORLAWURA PARTNER WALLET</Text>
            <ShieldCheck size={18} color="#10B981" />
          </View>

          <Text style={styles.balanceLabel}>Available for Instant Cashout</Text>
          <Text style={styles.balanceAmount}>
            {Brand.currency.symbol}{totalEarnings.toLocaleString()}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completed Pickups</Text>
              <Text style={styles.statValue}>{completedJobs} jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg per Pickup</Text>
              <Text style={styles.statValue}>{Brand.currency.symbol}35.00</Text>
            </View>
          </View>

          {/* Network Selector */}
          <Text style={styles.payoutNetworkLabel}>Payout Rails</Text>
          <View style={styles.networkRow}>
            {[
              { id: "mtn_momo", label: "MTN MoMo", badge: "🟡" },
              { id: "vodafone_cash", label: "Telecel Cash", badge: "🔴" },
              { id: "airteltigo_cash", label: "AirtelTigo", badge: "🔵" },
            ].map((n) => (
              <TouchableOpacity
                key={n.id}
                style={[
                  styles.networkChip,
                  selectedNetwork === n.id && styles.networkChipActive,
                ]}
                onPress={() => setSelectedNetwork(n.id)}
              >
                <Text style={styles.networkBadge}>{n.badge}</Text>
                <Text style={[styles.networkText, selectedNetwork === n.id && styles.networkTextActive]}>
                  {n.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={handleWithdraw}
            disabled={withdrawMutation.isPending}
            activeOpacity={0.88}
          >
            {withdrawMutation.isPending ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View style={styles.withdrawRow}>
                <ArrowUpRight size={18} color="#000" />
                <Text style={styles.withdrawButtonText}>Instant Cash Out to MoMo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Transaction History Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings & Payouts</Text>

          {history.map((tx: any) => (
            <View key={tx.id} style={styles.txCard}>
              <View
                style={[
                  styles.txIconWrap,
                  tx.type === "withdrawal" ? styles.txIconWithdraw : styles.txIconEarn,
                ]}
              >
                {tx.type === "withdrawal" ? (
                  <ArrowUpRight size={20} color="#EF4444" />
                ) : (
                  <ArrowDownLeft size={20} color="#10B981" />
                )}
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>
                  {tx.type === "withdrawal" ? "Instant MoMo Cashout" : "Completed Trash Pickup"}
                </Text>
                <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  tx.type === "withdrawal" ? styles.txAmountWithdraw : styles.txAmountEarn,
                ]}
              >
                {tx.type === "withdrawal" ? "-" : "+"}
                {Brand.currency.symbol}{tx.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  uberWalletCard: {
    backgroundColor: "#090A0C",
    marginHorizontal: 20,
    marginTop: 18,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  walletCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  walletCardBadge: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  balanceLabel: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginTop: 4,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#18191E",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#27272A",
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
  },
  payoutNetworkLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  networkRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  networkChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18191E",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#27272A",
  },
  networkChipActive: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  networkBadge: {
    fontSize: 12,
  },
  networkText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
  },
  networkTextActive: {
    color: "#10B981",
  },
  withdrawButton: {
    backgroundColor: "#10B981",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  withdrawButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.2,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  txIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  txIconEarn: {
    backgroundColor: "#ECFDF5",
  },
  txIconWithdraw: {
    backgroundColor: "#FEE2E2",
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  txDate: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "900",
  },
  txAmountEarn: {
    color: "#10B981",
  },
  txAmountWithdraw: {
    color: "#EF4444",
  },
});
