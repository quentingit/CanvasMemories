import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const CenterVerticalLine = ({ adjustedHeight }) => {
  // Générer les points pour la ligne centrale verticale
  const dots = Array.from(
    { length: Math.floor(adjustedHeight / 20) },
    (_, i) => <View key={i} style={styles.dot} />
  );

  return (
    <View
      style={[
        styles.centerLine,
        {
          height: adjustedHeight, // Hauteur de la ligne ajustée
        },
      ]}
    >
      {dots}
    </View>
  );
};

const styles = StyleSheet.create({
  centerLine: {
    zIndex: 999,
    position: "absolute",
    top: 0,
    left: screenWidth / 2 - 1, // Centré horizontalement
    justifyContent: "space-evenly", // Espacement uniforme entre les points
    alignItems: "center",
    flexDirection: "column",
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "black",
  },
});

export default CenterVerticalLine;
