import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const MenuMemories = ({
  props,
  handleSaveImage,
  handleSaveVideo,
  handleAddSticker,
  handleAddText,
  imageUri,
  videoInputUri,
  pickMedia,
  navigation,
  handleUndo,
  handleRedo,
  onOpenFilterModal,
  onOpenTemplateModal,
  toggleAdvancedMode,
  advancedMode,
  openPreviewModal,
}) => {
  const handlePickMedia = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert(
            "Permission denied: The app needs access to your library to import media."
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });

      if (!result.cancelled) {
        const selectedUri = result.assets[0].uri;
        pickMedia(selectedUri);
      }
    } catch (error) {
      console.error("Error picking image: ", error);
    }
  };

  return (
    <>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.roundButton}
          onPress={() => props.navigation.goBack()}
        >
          <Ionicons name="close" size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundButton} onPress={handleUndo}>
          <Ionicons name="arrow-back" size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundButton} onPress={handleRedo}>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roundButton,
            advancedMode && { backgroundColor: "orange" },
          ]}
          onPress={toggleAdvancedMode}
        >
          <Ionicons name="settings" size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundButton} onPress={openPreviewModal}>
          <Ionicons name="eye" size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundButton} onPress={handleSaveImage}>
          <Ionicons name="save-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.publishButton}
          onPress={() => (imageUri ? handleSaveImage() : handleSaveVideo())}
        >
          <Text style={styles.publishText}>Publier</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomIconButton}
          onPress={handleAddText}
        >
          <MaterialIcons name="text-fields" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomIconButton}
          onPress={handleAddSticker}
        >
          <Ionicons name="happy-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.plusButtonContainer}
          onPress={handlePickMedia}
        >
          <View style={styles.plusButtonBackground}>
            <Ionicons name="add" size={32} color="black" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomIconButton}
          onPress={onOpenFilterModal}
        >
          <Ionicons name="color-filter-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomIconButton}
          onPress={onOpenTemplateModal}
        >
          <Ionicons name="layers-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    width: "100%",
    padding: 10,
    zIndex: 10,
  },
  roundButton: {
    borderRadius: 20,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  publishButton: {
    backgroundColor: "red",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 5,
  },
  publishText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: -40,
    width: "100%",
    padding: 10,
    paddingBottom: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 10,
  },
  bottomIconButton: {
    padding: 10,
  },
  plusButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  plusButtonBackground: {
    backgroundColor: "white",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default MenuMemories;
