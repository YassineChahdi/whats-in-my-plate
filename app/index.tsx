import React, { useState, useEffect } from "react";
import { 
  View, 
  TouchableOpacity, 
  Image, 
  Alert, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CameraScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [macros, setMacros] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (!hasPermission) {
      Alert.alert("Permission Required", "Camera access is needed to take pictures.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    setIsLoading(true);
    setMacros(null);
    
    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    try {
      // Here adjust ip to match current
      const response = await axios.post('http://192.168.0.18:5002/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMacros(response.data.macros);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'There was an error analyzing the image');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMacroCards = () => {
    if (!macros) return null;
    
    // Simple parsing logic - adjust based on your actual data format
    const macroText = macros.toString();
    
    if (macroText.includes(',')) {
      // Assuming format like "Protein: 20g, Carbs: 30g, Fat: 10g"
      const macroItems = macroText.split(',').map(item => item.trim());
      
      return (
        <View style={styles.macroCardsContainer}>
          {macroItems.map((item, index) => {
            const [label, value] = item.includes(':') ? item.split(':') : [item, ''];
            return (
              <View key={index} style={styles.macroCard}>
                <Text style={styles.macroCardValue}>{value.trim()}</Text>
                <Text style={styles.macroCardLabel}>{label.trim()}</Text>
              </View>
            );
          })}
        </View>
      );
    } else {
      // Fallback for simple text
      return (
        <View style={styles.macrosContainer}>
          <Text style={styles.macrosText}>{macroText}</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8E1" />
      
      {/* Simple header with title */}
      <SafeAreaView style={styles.safeTop}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Macros Estimator</Text>
        </View>
      </SafeAreaView>

      {/* Main content area */}
      <View style={styles.content}>
        {hasPermission === null ? (
          <View style={styles.messageContainer}>
            <ActivityIndicator size="large" color="#FF9800" />
            <Text style={styles.statusText}>Requesting camera permission...</Text>
          </View>
        ) : hasPermission === false ? (
          <View style={styles.messageContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>!</Text>
            </View>
            <Text style={styles.errorText}>Camera permission is denied</Text>
            <Text style={styles.helpText}>Please enable camera access in your device settings</Text>
          </View>
        ) : (
          <>
            {image ? (
              <View style={styles.imageContainer}>
                <View style={styles.imageCard}>
                  <Image source={{ uri: image }} style={styles.image} />
                  {isLoading && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                      <Text style={styles.loadingText}>Analyzing your food...</Text>
                    </View>
                  )}
                </View>
                
                {!isLoading && macros && (
                  <View style={styles.resultsContainer}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultTitle}>Nutrition Facts</Text>
                    </View>
                    {renderMacroCards()}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.iconCircle}>
                  <Text style={styles.cameraIconText}>📷</Text>
                </View>
                <Text style={styles.emptyTitle}>No Food Analyzed</Text>
                <Text style={styles.emptyText}>Take a photo of your meal to see nutritional info</Text>
              </View>
            )}
          </>
        )}
      </View>
      
      {/* Footer with camera button */}
      <SafeAreaView style={styles.safeBottom}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.cameraButton,
              (!hasPermission || isLoading) && styles.cameraButtonDisabled
            ]}
            onPress={takePicture}
            disabled={!hasPermission || isLoading}
          >
            <LinearGradient
              colors={['#FFA000', '#FF6F00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  safeTop: {
    backgroundColor: "#FFF8E1",
  },
  safeBottom: {
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    borderBottomWidth: 1,
    borderBottomColor: "#FFE0B2",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E65100",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF8E1",
  },
  messageContainer: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "90%",
    shadowColor: "#FB8C00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFB74D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  cameraIconText: {
    fontSize: 30,
  },
  statusText: {
    fontSize: 16,
    color: "#6D4C41",
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    color: "#E65100",
    fontWeight: "bold",
    marginVertical: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#795548",
    textAlign: "center",
    marginTop: 8,
  },
  imageContainer: {
    alignItems: "center",
    width: "100%",
  },
  imageCard: {
    borderRadius: 16,
    overflow: "hidden",
    width: width * 0.9,
    height: width * 0.9 * 0.75, // 4:3 aspect ratio
    backgroundColor: "#FFFFFF",
    shadowColor: "#FB8C00",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.23,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 152, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 16,
    width: "90%",
    shadowColor: "#FB8C00",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.23,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  resultHeader: {
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  macrosContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  macrosText: {
    fontSize: 16,
    textAlign: "center",
    color: "#5D4037",
  },
  macroCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 16,
  },
  macroCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 16,
    minWidth: 90,
    margin: 6,
    alignItems: "center",
  },
  macroCardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E65100",
  },
  macroCardLabel: {
    fontSize: 14,
    color: "#795548",
    marginTop: 4,
  },
  emptyContainer: {
    padding: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    width: "90%",
    shadowColor: "#FB8C00",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.23,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#795548",
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#FFE0B2",
  },
  cameraButton: {
    width: 180,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#FB8C00",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  cameraButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});