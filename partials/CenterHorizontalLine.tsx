import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const CenterHorizontalLine = ({ adjustedHeight }) => {
  // Générer les points pour la ligne horizontale centrale
  const dots = Array.from({ length: Math.floor(screenWidth / 20) }, (_, i) => (
    <View key={i} style={styles.dot} />
  ));

  return (
    <View
      style={[
        styles.centerLineHorizontal,
        { top: adjustedHeight / 2 }, // Centré verticalement
      ]}
    >
      {dots}
    </View>
  );
};

const styles = StyleSheet.create({
  centerLineHorizontal: {
    zIndex: 999,
    position: "absolute",
    left: 0, // Début de la ligne à gauche
    width: screenWidth, // S'étend sur toute la largeur de l'écran
    flexDirection: "row", // Points alignés horizontalement
    justifyContent: "space-evenly", // Espacement uniforme des points
    alignItems: "center",
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "black",
  },
});

export default CenterHorizontalLine;
