import { Stack } from "expo-router";

export default function CollectorLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#10B981" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" as const },
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="request-details" options={{ title: "Request Details" }} />
      <Stack.Screen name="active-pickup" options={{ headerShown: false }} />
      <Stack.Screen name="wallet" options={{ title: "Earnings" }} />
    </Stack>
  );
}
