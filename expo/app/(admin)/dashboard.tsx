import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import AdminShell from "./components/AdminShell";

export default function AdminDashboardScreen() {
  const withdrawals = trpc.wallet.listWithdrawals.useQuery();
  const setWithdrawalStatus = trpc.wallet.setWithdrawalStatus.useMutation({
    onSuccess: () => withdrawals.refetch(),
  });
  const analytics = trpc.admin.analytics.useQuery();
  const collectors = trpc.admin.listCollectors.useQuery();

  return (
    <AdminShell title="Overview">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          <Card label="Total Pickups" value={analytics.data?.totalPickups ?? 0} />
          <Card label="Revenue (₵)" value={analytics.data?.revenue ?? 0} />
          <Card label="Active Users" value={analytics.data?.activeUsers ?? 0} />
          <Card label="Collectors" value={collectors.data?.length ?? 0} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Payouts</Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            {(withdrawals.data ?? []).map((item) => (
              <View key={item.id} style={styles.withdrawRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700" as const }}>
                    {item.method} • ₵{item.amount}
                  </Text>
                  <Text style={{ color: Colors.light.muted, fontSize: 12 }}>
                    {item.status} • {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>
                {item.status === "requested" && (
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: Colors.light.primary }]}
                      onPress={() =>
                        setWithdrawalStatus.mutate({ withdrawalId: item.id, status: "paid" })
                      }
                    >
                      <Text style={styles.actionBtnText}>Mark paid</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#EF4444" }]}
                      onPress={() =>
                        setWithdrawalStatus.mutate({ withdrawalId: item.id, status: "failed" })
                      }
                    >
                      <Text style={styles.actionBtnText}>Fail</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.primaryDark,
  },
  cardLabel: {
    marginTop: 6,
    color: Colors.light.muted,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
  },
  sectionTitle: {
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  withdrawRow: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700" as const,
    fontSize: 12,
  },
});

