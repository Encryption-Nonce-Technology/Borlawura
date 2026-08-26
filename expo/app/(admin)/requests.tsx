import { ScrollView, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import AdminShell from "./components/AdminShell";

export default function AdminRequestsScreen() {
  const requestsQuery = trpc.admin.listRequests.useQuery();
  const requests = requestsQuery.data ?? [];

  return (
    <AdminShell title="Requests">
      <ScrollView contentContainerStyle={styles.content}>
        {requests.map((request) => (
          <View key={request.id} style={styles.row}>
            <View style={styles.main}>
              <Text style={styles.name}>
                {request.trashType} • {request.quantity} • ₵{request.price}
              </Text>
              <Text style={styles.sub} numberOfLines={1}>
                {request.address}
              </Text>
            </View>
            <Text style={[styles.status, request.status === "collected" ? styles.done : styles.pending]}>
              {request.status}
            </Text>
          </View>
        ))}
      </ScrollView>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingBottom: 20,
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  main: {
    flex: 1,
  },
  name: {
    fontWeight: "700" as const,
    color: Colors.light.text,
    textTransform: "capitalize",
  },
  sub: {
    color: Colors.light.muted,
    marginTop: 4,
    fontSize: 12,
  },
  status: {
    textTransform: "uppercase",
    fontWeight: "700" as const,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  done: {
    color: "#065F46",
    backgroundColor: "#D1FAE5",
  },
  pending: {
    color: "#92400E",
    backgroundColor: "#FEF3C7",
  },
});

