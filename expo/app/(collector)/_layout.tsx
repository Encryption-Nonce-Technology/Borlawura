import { Stack } from "expo-router";

import Colors, { Brand } from "@/constants/colors";

export default function CollectorLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" as const },
        headerTitle: Brand.appName,
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="request-details" options={{ title: "Request Details" }} />
      <Stack.Screen name="active-pickup" options={{ headerShown: false }} />
      <Stack.Screen name="wallet" options={{ title: "Earnings" }} />
    </Stack>
  );
}
