import { Stack } from "expo-router";

import Colors, { Brand } from "@/constants/colors";

export default function UserLayout() {
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
      <Stack.Screen name="camera" options={{ title: "Take Photo", presentation: "modal" }} />
      <Stack.Screen name="trash-details" options={{ title: "Trash Details" }} />
      <Stack.Screen name="tracking" options={{ headerShown: false }} />
    </Stack>
  );
}
