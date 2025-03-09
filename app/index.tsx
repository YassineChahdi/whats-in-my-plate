import React, { useState, useEffect } from "react";
import { View, Button, Image, Alert, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from 'axios';

export default function CameraScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [macros, setMacros] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

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
    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      type: 'image/jpeg',  // You may need to adjust the type based on the image format
      name: 'image.jpg',
    });

    try {
      // Here adjust ip to match current
      const response = await axios.post('http://whats-in-my-plate-production-3a40.up.railway.app/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMacros(response.data.macros);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'There was an error analyzing the image');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {hasPermission === null ? (
        <Text>Requesting camera permission...</Text>
      ) : hasPermission === false ? (
        <Text style={{ color: "red" }}>Camera permission is denied.</Text>
      ) : (
        <Button title="Take a Picture" onPress={takePicture} />
      )}

      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginTop: 20 }} />}
      {macros && (
        <Text style={{ fontSize: 30, fontWeight: "bold", marginTop: 20 }}>
          {macros}
        </Text>
      )}
    </View>
  );
}