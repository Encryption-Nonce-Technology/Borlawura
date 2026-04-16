import { ScrollView, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import AdminShell from "./components/AdminShell";

export default function AdminCollectorsScreen() {
  const collectorsQuery = trpc.admin.listCollectors.useQuery();
  const collectors = collectorsQuery.data ?? [];

  return (
    <AdminShell title="Collectors">
      <ScrollView contentContainerStyle={styles.content}>
        {collectors.map((collector) => (
          <View key={collector.id} style={styles.row}>
            <View style={styles.main}>
              <Text style={styles.name}>{collector.name}</Text>
              <Text style={styles.sub}>{collector.phone}</Text>
            </View>
            <Text style={styles.rating}>★ {collector.rating.toFixed(1)}</Text>
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
  },
  main: {
    flex: 1,
  },
  name: {
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  sub: {
    color: Colors.light.muted,
    marginTop: 4,
    fontSize: 12,
  },
  rating: {
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: "700" as const,
    fontSize: 12,
  },
});

