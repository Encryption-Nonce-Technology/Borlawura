import { Stack } from "expo-router";

export default function CollectorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="request-details" options={{ headerShown: false }} />
      <Stack.Screen name="active-pickup" options={{ headerShown: false }} />
      <Stack.Screen name="wallet" options={{ headerShown: false }} />
    </Stack>
  );
}
