import { Stack } from "expo-router";

import Colors, { Brand } from "@/constants/colors";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.primaryDark },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" as const },
        headerTitle: `${Brand.appName} Admin`,
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="users" options={{ title: "Users" }} />
      <Stack.Screen name="collectors" options={{ title: "Collectors" }} />
      <Stack.Screen name="requests" options={{ title: "Requests" }} />
    </Stack>
  );
}

