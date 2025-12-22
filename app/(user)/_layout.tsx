import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#10B981" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" as const },
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ title: "Take Photo", presentation: "modal" }} />
      <Stack.Screen name="trash-details" options={{ title: "Trash Details" }} />
      <Stack.Screen name="tracking" options={{ headerShown: false }} />
    </Stack>
  );
}
