import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const CenterLine = () => {
  // Générer les points pour la ligne centrale
  const dots = Array.from({ length: Math.floor(screenHeight / 10) }, (_, i) => (
    <View key={i} style={styles.dot} />
  ));

  return <View style={styles.centerLine}>{dots}</View>;
};

const styles = StyleSheet.create({
  centerLine: {
    zIndex: 999,
    position: "absolute",
    top: 0,
    left: screenWidth / 2 - 1, // Place la ligne au centre
    height: "100%", // Pleine hauteur
    justifyContent: "space-between", // Espacement entre les points
    alignItems: "center", // Centrer les points
    flexDirection: "column", // Aligner les points verticalement
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "black", // Couleur des points
    marginBottom: 18, // Espace entre les points
  },
});

export default CenterLine;
