import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="trash-details" options={{ headerShown: false }} />
      <Stack.Screen name="tracking" options={{ headerShown: false }} />
    </Stack>
  );
}
