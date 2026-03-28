import { router } from "expo-router";
import * as Location from "expo-location";
import { Camera, MapPin, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors, { Brand } from "@/constants/colors";

export default function UserHomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      console.log("Requesting location permission...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Permission status:", status);
      setHasPermission(status === "granted");

      if (status === "granted") {
        try {
          const currentLocation = await Location.getCurrentPositionAsync({});
          console.log("Current location:", currentLocation);
          setLocation(currentLocation);
        } catch (error) {
          console.error("Error getting location:", error);
          if (Platform.OS === "web") {
            setLocation({
              coords: {
                latitude: 5.6037,
                longitude: -0.1870,
                altitude: null,
                accuracy: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
              },
              timestamp: Date.now(),
            });
          }
        }
      } else {
        console.log("Location permission denied, using default location");
        setLocation({
          coords: {
            latitude: 5.6037,
            longitude: -0.1870,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      }
    })();
  }, []);

  const handleRequestPickup = () => {
    console.log("Request pickup pressed");
    if (!location) {
      Alert.alert("Location Required", "Please enable location services to request a pickup.");
      return;
    }
    router.push("/(user)/camera" as any);
  };

  const region = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  return (
    <View style={styles.container}>
      {region ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          showsUserLocation={hasPermission}
          showsMyLocationButton={false}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
            >
              <View style={styles.markerContainer}>
                <MapPin size={32} color="#10B981" fill="#10B981" />
              </View>
            </Marker>
          )}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}

      <SafeAreaView style={styles.overlay} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🌱 {Brand.appName}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/" as any)}
            testID="profile-button"
          >
            <User size={24} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.bottomOverlay} edges={["bottom"]}>
        <View style={styles.bottomContent}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Ready to dispose?</Text>
            <Text style={styles.infoText}>
              Take photos of your trash and we&apos;ll match you with a nearby collector
            </Text>
          </View>

          <TouchableOpacity
            testID="request-pickup-button"
            style={styles.requestButton}
            onPress={handleRequestPickup}
            activeOpacity={0.8}
          >
            <Camera size={24} color="#fff" />
            <Text style={styles.requestButtonText}>Request Trash Pickup</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.muted,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.muted,
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  requestButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
    marginLeft: 12,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
