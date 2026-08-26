import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, Text, TouchableOpacity } from "react-native";
import { Navigation, ZoomIn, ZoomOut, Compass, RefreshCw } from "lucide-react-native";

export type CollectorMarkerData = {
  id: string;
  name: string;
  vehicle: string;
  latitude: number;
  longitude: number;
  rating?: number;
  status?: string;
};

interface UberMapProps {
  userLocation: { latitude: number; longitude: number };
  collectors?: CollectorMarkerData[];
  collectorLocation?: { latitude: number; longitude: number } | null;
  activeRoute?: boolean;
  onSelectCollector?: (collector: CollectorMarkerData) => void;
  style?: any;
  showRadar?: boolean;
  interactive?: boolean;
}

// Simulated active collectors in Accra nearby coordinates
const DEFAULT_COLLECTORS: CollectorMarkerData[] = [
  { id: "c1", name: "Kwame Mensah", vehicle: "Motor Tricycle", latitude: 5.6067, longitude: -0.1830, rating: 4.92, status: "Available" },
  { id: "c2", name: "Kofi Boateng", vehicle: "Mini Tipper Truck", latitude: 5.6015, longitude: -0.1915, rating: 4.88, status: "Available" },
  { id: "c3", name: "Emmanuel Darko", vehicle: "Electric Tricycle", latitude: 5.6120, longitude: -0.1810, rating: 4.95, status: "Available" },
  { id: "c4", name: "Ibrahim Adams", vehicle: "Compactor Truck", latitude: 5.5980, longitude: -0.1840, rating: 4.85, status: "Available" },
];

export default function UberMap({
  userLocation,
  collectors = DEFAULT_COLLECTORS,
  collectorLocation,
  activeRoute = false,
  onSelectCollector,
  style,
  showRadar = false,
  interactive = true,
}: UberMapProps) {
  const [zoom, setZoom] = useState(15);
  const [animatedCollectors, setAnimatedCollectors] = useState(collectors);
  const mapContainerRef = useRef<any>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Real-time subtle vehicle roaming simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedCollectors((prev) =>
        prev.map((c) => {
          const dLat = (Math.random() - 0.5) * 0.0003;
          const dLng = (Math.random() - 0.5) * 0.0003;
          return {
            ...c,
            latitude: c.latitude + dLat,
            longitude: c.longitude + dLng,
          };
        }),
      );
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  // Web Implementation using Leaflet with modern CartoDB Positron tiles
  if (Platform.OS === "web") {
    useEffect(() => {
      // Dynamically load Leaflet if not present
      if (typeof window === "undefined") return;

      const initMap = () => {
        const L = (window as any).L;
        if (!L || !mapContainerRef.current) return;

        if (!leafletMapRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [userLocation.latitude, userLocation.longitude],
            zoom: zoom,
            zoomControl: false,
            attributionControl: false,
          });

          // Modern high-contrast Uber-like CartoDB Positron / OSM style tiles
          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            {
              maxZoom: 19,
              subdomains: "abcd",
            },
          ).addTo(map);

          leafletMapRef.current = map;
        }

        const map = leafletMapRef.current;
        if (!map) return;

        // Clear existing custom markers
        markersRef.current.forEach((m) => map.removeLayer(m));
        markersRef.current = [];

        // 1. User Location Pulse Pin
        const userIcon = L.divIcon({
          className: "user-uber-pin",
          html: `
            <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 44px; height: 44px; background: rgba(16, 185, 129, 0.28); border-radius: 50%; animation: uberPulse 2s infinite ease-out;"></div>
              <div style="position: absolute; width: 26px; height: 26px; background: rgba(16, 185, 129, 0.4); border-radius: 50%;"></div>
              <div style="width: 16px; height: 16px; background: #0F172A; border: 3px solid #10B981; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
          icon: userIcon,
        }).addTo(map);
        markersRef.current.push(userMarker);

        // 2. Add Collector Vehicles
        const displayCollectors = collectorLocation
          ? [
              {
                id: "active-assigned",
                name: "Your Borlawura Collector",
                vehicle: "Assigned Collector",
                latitude: collectorLocation.latitude,
                longitude: collectorLocation.longitude,
                rating: 4.9,
              },
            ]
          : animatedCollectors;

        displayCollectors.forEach((col) => {
          const vehicleIcon = L.divIcon({
            className: "collector-truck-pin",
            html: `
              <div style="background: #090A0C; border: 2px solid #10B981; border-radius: 20px; padding: 4px 10px; display: flex; align-items: center; gap: 6px; box-shadow: 0 8px 20px rgba(0,0,0,0.35); transform: translate(-50%, -50%); cursor: pointer; transition: transform 0.2s;">
                <span style="font-size: 14px;">🚛</span>
                <span style="color: #FFFFFF; font-size: 11px; font-weight: 700; letter-spacing: 0.2px;">${col.name.split(" ")[0]}</span>
                <span style="background: #10B981; color: #000; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 4px;">★${col.rating || 4.9}</span>
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          const m = L.marker([col.latitude, col.longitude], { icon: vehicleIcon }).addTo(map);
          if (onSelectCollector) {
            m.on("click", () => onSelectCollector(col));
          }
          markersRef.current.push(m);
        });

        // 3. Draw Route Polyline if assigned or routing
        if (collectorLocation) {
          const polyline = L.polyline(
            [
              [collectorLocation.latitude, collectorLocation.longitude],
              [userLocation.latitude, userLocation.longitude],
            ],
            {
              color: "#10B981",
              weight: 5,
              opacity: 0.9,
              dashArray: "8, 8",
              lineCap: "round",
            },
          ).addTo(map);
          markersRef.current.push(polyline);
        }
      };

      // Ensure Leaflet styles & script are loaded on web
      if (!(window as any).L) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const styleTag = document.createElement("style");
        styleTag.innerHTML = `
          @keyframes uberPulse {
            0% { transform: scale(0.6); opacity: 0.9; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          .leaflet-container { width: 100%; height: 100%; font-family: inherit; }
        `;
        document.head.appendChild(styleTag);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    }, [userLocation, animatedCollectors, collectorLocation, zoom]);

    const handleZoomIn = () => {
      if (leafletMapRef.current) leafletMapRef.current.zoomIn();
      setZoom((z) => Math.min(z + 1, 19));
    };

    const handleZoomOut = () => {
      if (leafletMapRef.current) leafletMapRef.current.zoomOut();
      setZoom((z) => Math.max(z - 1, 10));
    };

    const handleRecenter = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.setView([userLocation.latitude, userLocation.longitude], 15);
      }
    };

    return (
      <View style={[styles.mapContainer, style]}>
        <div
          ref={mapContainerRef}
          style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 0 }}
        />

        {/* Map Overlays & Floating Quick Controls */}
        <View style={styles.floatingControls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleRecenter} activeOpacity={0.8}>
            <Navigation size={18} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn} activeOpacity={0.8}>
            <ZoomIn size={18} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut} activeOpacity={0.8}>
            <ZoomOut size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Live Collectors Radar Status Pill */}
        <View style={styles.radarStatusPill}>
          <View style={styles.radarLiveDot} />
          <Text style={styles.radarText}>
            {animatedCollectors.length} Active Borlawura Collectors Nearby
          </Text>
        </View>
      </View>
    );
  }

  // Native Fallback / Mobile View (Simplified high-styled native container)
  return (
    <View style={[styles.mapContainer, style, styles.nativeFallback]}>
      <View style={styles.nativeGrid}>
        <View style={styles.nativeUserPin}>
          <Text style={styles.nativePinEmoji}>📍</Text>
          <Text style={styles.nativePinLabel}>You (Pickup)</Text>
        </View>
        {animatedCollectors.slice(0, 3).map((col, idx) => (
          <View key={col.id} style={[styles.nativeCollectorPin, { top: 120 + idx * 80, left: 60 + idx * 100 }]}>
            <Text style={styles.nativeTruckIcon}>🚛</Text>
            <Text style={styles.nativeTruckLabel}>{col.name}</Text>
          </View>
        ))}
      </View>
      <View style={styles.radarStatusPill}>
        <View style={styles.radarLiveDot} />
        <Text style={styles.radarText}>Live GPS Map Active</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
  },
  floatingControls: {
    position: "absolute",
    right: 18,
    bottom: 24,
    gap: 8,
    zIndex: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  radarStatusPill: {
    position: "absolute",
    top: 18,
    left: 18,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 20,
    backdropFilter: "blur(8px)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  } as any,
  radarLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    boxShadow: "0 0 8px #10B981",
  } as any,
  radarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  nativeFallback: {
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  nativeGrid: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  nativeUserPin: {
    position: "absolute",
    top: "45%",
    left: "45%",
    alignItems: "center",
  },
  nativePinEmoji: {
    fontSize: 32,
  },
  nativePinLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  nativeCollectorPin: {
    position: "absolute",
    alignItems: "center",
    backgroundColor: "#090A0C",
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  nativeTruckIcon: {
    fontSize: 18,
  },
  nativeTruckLabel: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
