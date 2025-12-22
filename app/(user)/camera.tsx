import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { Camera, X, RotateCw, Check } from "lucide-react-native";
import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<string[]>([]);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#10B981" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to take photos of your trash for pickup requests
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    console.log("Taking picture...");
    if (photos.length >= 3) {
      Alert.alert("Maximum Photos", "You can only take up to 3 photos");
      return;
    }

    if (Platform.OS === "web") {
      const mockPhoto = `https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop&q=80`;
      console.log("Web: Using mock photo");
      setPhotos([...photos, mockPhoto]);
      return;
    }

    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        console.log("Photo taken:", photo?.uri);
        if (photo) {
          setPhotos([...photos, photo.uri]);
        }
      } catch (error) {
        console.error("Error taking photo:", error);
        Alert.alert("Error", "Failed to take photo");
      }
    }
  };

  const removePhoto = (index: number) => {
    console.log("Removing photo at index:", index);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    console.log("Continue with photos:", photos.length);
    if (photos.length === 0) {
      Alert.alert("No Photos", "Please take at least 1 photo");
      return;
    }
    router.push({
      pathname: "/(user)/trash-details" as any,
      params: { photos: JSON.stringify(photos) },
    });
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <SafeAreaView style={styles.cameraOverlay} edges={["top", "bottom"]}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <X size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>{photos.length}/3 photos</Text>
            </View>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <RotateCw size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            {photos.length > 0 && (
              <ScrollView
                horizontal
                style={styles.photoPreviewScroll}
                contentContainerStyle={styles.photoPreviewContent}
                showsHorizontalScrollIndicator={false}
              >
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoPreviewContainer}>
                    <Image source={{ uri: photo }} style={styles.photoPreview} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.controls}>
              <View style={styles.captureButtonContainer}>
                <TouchableOpacity
                  testID="capture-button"
                  style={styles.captureButton}
                  onPress={takePicture}
                  disabled={photos.length >= 3}
                >
                  <View
                    style={[
                      styles.captureButtonInner,
                      photos.length >= 3 && styles.captureButtonDisabled,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {photos.length > 0 && (
                <TouchableOpacity
                  testID="continue-button"
                  style={styles.continueButton}
                  onPress={handleContinue}
                >
                  <Check size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoCounter: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoCounterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  photoPreviewScroll: {
    marginBottom: 20,
  },
  photoPreviewContent: {
    gap: 12,
  },
  photoPreviewContainer: {
    position: "relative",
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  captureButtonContainer: {
    flex: 1,
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
  },
  captureButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  continueButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
});
