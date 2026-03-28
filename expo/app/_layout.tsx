import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

import Colors, { Brand } from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.light.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" as const },
        headerTitle: Brand.appName,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ title: "Take Photo", presentation: "modal" }} />
      <Stack.Screen name="trash-details" options={{ title: "Trash Details" }} />
      <Stack.Screen name="tracking" options={{ headerShown: false }} />
      <Stack.Screen name="collector-home" options={{ headerShown: false }} />
      <Stack.Screen name="collector-profile" options={{ title: "Collector Profile" }} />
      <Stack.Screen name="wallet" options={{ title: "Earnings" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
