import { ScrollView, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import AdminShell from "./components/AdminShell";

export default function AdminUsersScreen() {
  const usersQuery = trpc.admin.listUsers.useQuery();
  const users = usersQuery.data ?? [];

  return (
    <AdminShell title="Users">
      <ScrollView contentContainerStyle={styles.content}>
        {users.map((user) => (
          <View key={user.id} style={styles.row}>
            <View style={styles.main}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.sub}>
                {user.phone} • {user.role}
              </Text>
            </View>
            <Text style={[styles.badge, user.isActive ? styles.active : styles.inactive]}>
              {user.isActive ? "active" : "inactive"}
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
  badge: {
    textTransform: "uppercase",
    fontSize: 11,
    fontWeight: "700" as const,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  active: {
    color: "#065F46",
    backgroundColor: "#D1FAE5",
  },
  inactive: {
    color: "#991B1B",
    backgroundColor: "#FEE2E2",
  },
});

