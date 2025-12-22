import { TrendingUp, DollarSign, Calendar, CheckCircle } from "lucide-react-native";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mockEarnings = [
  { id: "1", amount: 300, date: "Today, 2:30 PM", type: "Bin collection", status: "completed" },
  { id: "2", amount: 150, date: "Today, 11:15 AM", type: "Sack collection", status: "completed" },
  { id: "3", amount: 50, date: "Yesterday, 4:45 PM", type: "Small bag", status: "completed" },
  { id: "4", amount: 300, date: "Yesterday, 1:20 PM", type: "Bin collection", status: "completed" },
  { id: "5", amount: 150, date: "2 days ago", type: "Sack collection", status: "completed" },
];

export default function WalletScreen() {
  const totalEarnings = mockEarnings.reduce((sum, earning) => sum + earning.amount, 0);
  const todayEarnings = mockEarnings
    .filter((e) => e.date.includes("Today"))
    .reduce((sum, earning) => sum + earning.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₵{totalEarnings.toLocaleString()}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.statValue}>₵{todayEarnings}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Calendar size={20} color="#3B82F6" />
              <Text style={styles.statValue}>{mockEarnings.length}</Text>
              <Text style={styles.statLabel}>Pickups</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => console.log("Withdraw pressed")}
            testID="withdraw-button"
          >
            <DollarSign size={20} color="#fff" />
            <Text style={styles.withdrawButtonText}>Withdraw to Mobile Money</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Earnings</Text>

          {mockEarnings.map((earning) => (
            <View key={earning.id} style={styles.earningCard}>
              <View style={styles.earningIcon}>
                <CheckCircle size={24} color="#10B981" />
              </View>
              <View style={styles.earningInfo}>
                <Text style={styles.earningType}>{earning.type}</Text>
                <Text style={styles.earningDate}>{earning.date}</Text>
              </View>
              <Text style={styles.earningAmount}>+₵{earning.amount}</Text>
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
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: "#10B981",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  earningCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  earningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  earningInfo: {
    flex: 1,
  },
  earningType: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  earningDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  earningAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#10B981",
  },
});
