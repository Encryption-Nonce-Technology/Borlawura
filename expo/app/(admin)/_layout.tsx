import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="users" options={{ headerShown: false }} />
      <Stack.Screen name="collectors" options={{ headerShown: false }} />
      <Stack.Screen name="requests" options={{ headerShown: false }} />
    </Stack>
  );
}
