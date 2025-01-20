import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Animated,
} from "react-native";

import * as Haptics from "expo-haptics";

import {
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";

import * as ImagePicker from "expo-image-picker";
import { captureRef } from "react-native-view-shot";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
// Import de ton MenuMemories (depuis le fichier où tu l'as défini)
import MenuMemories from "./partials/MenuMemories";
import { Slider } from "react-native-elements";
import CenterLine from "./partials/CenterHorizontalLine";
import { Ionicons } from "@expo/vector-icons";
import CenterVerticalLine from "./partials/CenterHorizontalLine";
import CenterHorizontalLine from "./partials/CenterVerticalLine";

const { width, height } = Dimensions.get("window");
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const adjustedHeight = (screenWidth * 16) / 9; // Hauteur selon le ratio 750:1333

const filters = [
  { name: "Normal", style: {} },
  { name: "Sepia", style: { backgroundColor: "rgba(112, 66, 20, 0.3)" } },
  { name: "Warm", style: { backgroundColor: "rgba(255, 165, 0, 0.3)" } },
  { name: "Cool", style: { backgroundColor: "rgba(0, 255, 255, 0.3)" } },
  { name: "Darken", style: { backgroundColor: "rgba(0, 0, 0, 0.4)" } },
  { name: "Brighten", style: { backgroundColor: "rgba(255, 255, 255, 0.1)" } },
  { name: "Vintage", style: { backgroundColor: "rgba(139, 69, 19, 0.2)" } },
  { name: "Night", style: { backgroundColor: "rgba(0, 0, 64, 0.5)" } },
  { name: "Grayscale", style: { backgroundColor: "rgba(128, 128, 128, 0.2)" } },
  { name: "Rosy", style: { backgroundColor: "rgba(255, 182, 193, 0.3)" } },
  { name: "Sunset", style: { backgroundColor: "rgba(255, 99, 71, 0.3)" } },
  { name: "Mint", style: { backgroundColor: "rgba(152, 251, 152, 0.3)" } },
  { name: "Ocean", style: { backgroundColor: "rgba(70, 130, 180, 0.3)" } },
  { name: "Emerald", style: { backgroundColor: "rgba(0, 128, 0, 0.3)" } },
  { name: "Lavender", style: { backgroundColor: "rgba(230, 230, 250, 0.3)" } },
  { name: "Gold", style: { backgroundColor: "rgba(255, 215, 0, 0.2)" } },
  { name: "Purple Haze", style: { backgroundColor: "rgba(128, 0, 128, 0.4)" } },
  { name: "Deep Blue", style: { backgroundColor: "rgba(0, 0, 128, 0.4)" } },
  { name: "Tropical", style: { backgroundColor: "rgba(32, 178, 170, 0.3)" } },
  { name: "Cherry", style: { backgroundColor: "rgba(222, 49, 99, 0.3)" } },
];

const ImageSelectionModal = ({ visible, onClose, loadTemplate }) => {
  const categories = ["Modern"];
  const images = [
    {
      id: 1,
      uri: require("./assets/templates/template1.jpeg"),
      label: "01",
    },
    {
      id: 2,
      uri: require("./assets/templates/template2.jpeg"),
      label: "02",
    },
    { id: 3, uri: "https://via.placeholder.com/750x1333", label: "03" },
    { id: 4, uri: "https://via.placeholder.com/750x1333", label: "04" },
    { id: 5, uri: "https://via.placeholder.com/750x1333", label: "05" },
    { id: 6, uri: "https://via.placeholder.com/750x1333", label: "06" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("Modern");

  const translateY = useRef(new Animated.Value(0)).current;

  // Effet pour réinitialiser translateY lorsque la modal devient visible
  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleGesture = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationY > 100) {
        // Ferme le modal si le glissement dépasse 100px
        onClose();
      } else {
        // Réinitialise la position si le glissement est trop faible
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleLoadTemplate = (index) => {
    loadTemplate(index);
    onClose();
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalTemplateOverlay}>
          <PanGestureHandler
            onGestureEvent={handleGesture}
            onHandlerStateChange={handleStateChange}
          >
            <Animated.View
              style={[
                styles.modalTemplateContainer,
                { transform: [{ translateY: translateY }] },
              ]}
            >
              {/* Drag handle */}
              <View style={styles.dragHandle} />

              {/* Images Grid */}
              <ScrollView contentContainerStyle={styles.imageGrid}>
                {images.map((image, index) => (
                  <TouchableOpacity
                    key={image.id}
                    style={styles.imageContainer}
                    onPress={() => {
                      handleLoadTemplate(index);
                    }}
                  >
                    <Image
                      source={image.uri}
                      style={styles.image}
                      resizeMode="cover"
                    />
                    <Text style={styles.imageLabel}>{image.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Categories */}
              <ScrollView
                horizontal
                contentContainerStyle={styles.categoryContainer}
                showsHorizontalScrollIndicator={false}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.activeCategory,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === category &&
                          styles.activeCategoryText,
                      ]}
                    >
                      {category.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const CanvasMemories = ({ props }) => {
  // Tableau des éléments (textes & stickers)
  const [elements, setElements] = useState([]);

  // Historique "avant" et "après"
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [backgroundMedia, setBackgroundMedia] = useState(null);

  const [isSavedModalVisible, setIsSavedModalVisible] = useState(false);

  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);

  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [currentFilter, setCurrentFilter] = useState("normal");

  const [isElementCenteredHorizontal, setIsElementCenteredHorizontal] =
    useState(false);

  const [isElementCenteredVertical, setIsElementCenteredVertical] =
    useState(false);

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [isDragging, setIsDragging] = useState(false); // Nouvel état pour savoir si on est en plein drag

  const [advancedMode, setAdvancedMode] = useState(false); // pour le mode avancé

  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const rotateRef = useRef(null);

  const [activeElementId, setActiveElementId] = useState(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editableText, setEditableText] = useState("");
  const [editableTextColor, setEditableTextColor] = useState("white");

  const [isHoverTrash, setIsHoverTrash] = useState(false);
  const trashLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const availableFonts = [
    "Poppins_500Medium",
    "Poppins_400Regular_Italic",
    "Poppins_300Light",
    "Poppins_700Bold",
  ];

  //TOOGLE

  const toggleFilterModal = () => {
    setIsFilterModalVisible((prev) => !prev);
  };

  const toggleAdvancedMode = () => {
    setAdvancedMode((prev) => !prev);
  };

  const toggleTemplateModal = () => {
    setIsTemplateModalVisible(true);
  };

  const tableRef = useRef(null);

  const openPreviewModal = async () => {
    // Vérifier et modifier temporairement le borderRadius
    if (tableRef.current) {
      tableRef.current.setNativeProps({
        style: { borderRadius: 0 },
      });
    }

    setAdvancedMode(false);

    try {
      if (!tableRef.current) {
        throw new Error("Référence à la vue introuvable.");
      }
      const resultImage = await captureRef(tableRef, {
        format: "png",
        quality: 1,
      });
      setPreviewImage(resultImage);
      setIsPreviewModalVisible(true);
    } catch (error) {
      console.error(
        "Erreur lors de la capture pour la prévisualisation :",
        error
      );
      Alert.alert("Erreur", "Impossible de générer la prévisualisation.");
    } finally {
      // Rétablir le borderRadius après la capture
      if (tableRef.current) {
        tableRef.current.setNativeProps({
          style: { borderRadius: 15 },
        });
      }
    }
  };

  const pickMediaElement = async (elementId) => {
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.cancelled) {
        const selectedUri = result.assets[0].uri;

        // Récupère les dimensions de l'image
        Image.getSize(
          selectedUri,
          (width, height) => {
            setElements((prevElements) =>
              prevElements.map((el) =>
                el.id === elementId
                  ? {
                      ...el,
                      source: { uri: selectedUri },
                      imageWidth: width,
                      imageHeight: height,
                    }
                  : el
              )
            );
          },
          (error) => {
            console.error(
              "Erreur lors de la récupération des dimensions :",
              error
            );
          }
        );
      }
    } catch (error) {
      console.error("Error picking media for element:", error);
    }
  };

  const pickMedia = (uri) => {
    setBackgroundMedia(uri); // Mettre à jour l'URI du fond
  };

  // --------------------
  // GESTION DES ÉTATS
  // --------------------

  /**
   * Sauvegarde l’état courant des éléments dans l’historique.
   * Réinitialise le redoStack.
   */
  const saveHistory = (newElements) => {
    setHistory((prevHistory) => [...prevHistory, newElements]);
    setRedoStack([]);
  };

  // --------------------
  // AJOUT DES ÉLÉMENTS
  // --------------------

  // Ajoute un texte
  const handleAddText = () => {
    const newText = {
      id: Date.now(),
      type: "text",
      x: screenWidth / 4,
      y: height / 3,
      translationX: 0,
      translationY: 0,
      text: "",
      // Échelle
      scale: 1,
      baseScale: 1, // AJOUT
      // Rotation
      rotation: 0,
      baseRotation: 0, // AJOUT
      width: screenWidth / 2, // Largeur initiale
      baseWidth: screenWidth / 2, // Largeur de base
      padding: 10, // Padding initial
      color: "black",
    };
    // On crée le nouveau tableau d'éléments
    const newElements = [...elements, newText];
    setElements(newElements);
    saveHistory(newElements); // on enregistre dans l'historique

    // Ouvre la modal de texte
    setEditableText(newText.text);
    setEditableTextColor(newText.color);
    setActiveElementId(newText.id);
    setIsEditModalVisible(true);
  };

  const handleTapNewText = useCallback((event) => {
    const { x, y } = event.nativeEvent;

    const newText = {
      id: Date.now(),
      type: "text",
      x: x - screenWidth / 4 - 10, // Centre horizontalement
      y: y - 15, // Ajuster verticalement
      translationX: 0,
      translationY: 0,
      text: "",
      scale: 1,
      baseScale: 1,
      rotation: 0,
      baseRotation: 0,
      width: screenWidth / 2,
      color: "black",
    };

    setActiveElementId(newText.id);
    // On crée le nouveau tableau d'éléments
    setElements((prevElements) => [...prevElements, newText]);
    saveHistory([...elements, newText]); // Sauvegarde dans l'historique

    // Ouvre la modal de texte
    setEditableText(newText.text);
    setEditableTextColor(newText.color);
    setIsEditModalVisible(true);
  }, []);

  //POUR LE SYSTEME TEMPLATE
  const loadTemplate = async (index) => {
    // Gabarit des éléments de base
    const baseLockedImage = (id, x, y, width, height) => ({
      id: id,
      type: "lockedImage",
      x: x,
      y: y,
      translationX: 0,
      translationY: 0,
      imageTranslationX: 0, // Déplacement horizontal de l'image
      imageTranslationY: 0, // Déplacement vertical de l'image
      source: null,
      width: width,
      height: height,
      scale: 1,
      baseScale: 1,
      rotation: 0,
      baseRotation: 0,
      locked: true, // Propriété pour verrouiller
    });

    const baseTextElement = (
      id,
      x,
      y,
      width,
      text,
      fontSize,
      fontFamily,
      locked = false
    ) => ({
      id: id,
      type: "text",
      x: x,
      y: y,
      translationX: 0,
      translationY: 0,
      text: text,
      scale: fontSize,
      baseScale: 1,
      rotation: 0,
      baseRotation: 0,
      locked: locked,
      width: width ?? screenWidth / 2,
      baseWidth: width ?? screenWidth / 2,
      padding: 10,
      fontFamily: fontFamily,
      color: "black",
    });

    let newElements = [];

    switch (index) {
      case 0: // Template 1
        newElements = [
          baseLockedImage(
            Date.now(),
            25,
            25,
            screenWidth - 50,
            (screenWidth - 10) * (4 / 3) // Hauteur proportionnelle (4:3)
          ),
          baseTextElement(
            Date.now() + 1,
            screenWidth / 4,
            screenWidth * (4 / 3) + 20,
            screenWidth / 2,
            "Mon Titre",
            1,
            "Poppins_600SemiBold"
          ),
          baseTextElement(
            Date.now() + 2,
            (screenWidth * (1 / 4)) / 2,
            screenWidth * (4 / 3) + 70,
            screenWidth * (3 / 4),
            "Cette description peut être modifiée en cliquant dessus.",
            0.7,
            "Poppins_400Regular_Italic"
          ),
        ];
        break;

      case 1: // Template 2
        const halfHeight = (screenWidth * (16 / 9)) / 2 - 28;
        newElements = [
          baseLockedImage(Date.now(), 16, 16, screenWidth - 32, halfHeight),
          baseLockedImage(
            Date.now() + 1,
            16,
            halfHeight + 32, // Placement en dessous de la première image
            screenWidth - 32,
            halfHeight
          ),
        ];
        break;

      default:
        console.warn(`Template ${index} non défini`);
        return;
    }

    // Appliquer les changements d'état
    // Réinitialisation des états
    setElements(newElements);
    setHistory([newElements]); // Met à jour l'historique

    setRedoStack([]); // Vide la pile de redo
    setActiveElementId(null); // Aucun élément actif
    setIsDragging(false); // Pas de drag en cours
    setIsHoverTrash(false); // La poubelle est masquée
  };

  // Ajoute un sticker (image)
  const handleAddSticker = () => {
    const stickerWidth = 400;
    const stickerHeight = 400;
    const initialScale = 0.5; // Échelle initiale du sticker

    // Calcule les coordonnées pour centrer le sticker
    const centerX = ((width - stickerWidth) / 2) * initialScale;
    const centerY = ((height - stickerHeight) / 2) * initialScale;

    const newSticker = {
      id: Date.now(),
      type: "sticker",
      x: centerX, // Centre horizontal
      y: centerY, // Centre vertical
      translationX: 0,
      translationY: 0,
      source: require("../../../../../assets/canvasMemories/stickers/camera.png"),
      width: stickerWidth,
      height: stickerHeight,
      scale: initialScale, // Échelle initiale
      baseScale: initialScale, // Échelle de base
      rotation: 0,
      baseRotation: 0, // Rotation initiale
    };

    // Ajoute le nouveau sticker à la liste des éléments
    const newElements = [...elements, newSticker];
    setElements(newElements);
    saveHistory(newElements);
  };

  // --------------------
  // DRAG & DROP
  // --------------------

  const activeElementRef = useRef(null);

  const handleGestureEvent = useCallback((event, id) => {
    // Bloquer les interactions si un autre élément est actif
    if (activeElementRef.current !== id) {
      return;
    }
    const { translationX, translationY } = event.nativeEvent;

    setElements((prev) => {
      const newElements = prev.map((el) => {
        if (el.id !== id) return el; // Si ce n'est pas l'élément actif, on le retourne directement

        if (el.locked) return el; // Si l'élément est verrouillé, on le retourne directement

        //HORIZONTAL  ALIGN
        const newX = el.x + translationX;
        const isCenteredHorizontal =
          Math.abs(newX + el.width / 2 - screenWidth / 2) < 5;

        //VERTICAL ALIGN
        const newY = el.y + translationY;

        const isCenteredVertical =
          Math.abs(newY + el.height / 2 - adjustedHeight / 2) < 5;

        //HAPTICS
        if (isCenteredHorizontal && !isElementCenteredHorizontal) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        if (isCenteredVertical && !isElementCenteredVertical) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }

        setIsElementCenteredVertical(isCenteredVertical);
        setIsElementCenteredHorizontal(isCenteredHorizontal);

        // Retourner l'élément mis à jour
        return { ...el, translationX, translationY };
      });

      const movedEl = newElements.find((el) => el.id === id);
      if (movedEl) {
        const elemData = {
          ...movedEl,
          x: movedEl.x + movedEl.translationX,
          y: movedEl.y + movedEl.translationY,
        };

        // Vérifie si l'élément est dans la hitbox de la poubelle
        if (isInTrashZone(elemData, trashLayoutRef.current)) {
          setIsHoverTrash(true);
        } else {
          setIsHoverTrash(false);
        }
      }

      return newElements;
    });
  }, []);

  function isInTrashZone(el, trashRect) {
    let w, h;
    if (el.type === "text") {
      w = 60 * el.scale; // ou un calcul plus précis pour le texte
      h = 30 * el.scale;
    } else {
      w = el.width * el.scale;
      h = el.height * el.scale;
    }

    // Comme x,y = coin haut-gauche
    const left = el.x;
    const right = el.x + w;
    const top = el.y;
    const bottom = el.y + h;

    const {
      x: trashLeft,
      y: trashTop,
      width: trashW,
      height: trashH,
    } = trashRect;
    const trashRight = trashLeft + trashW;
    const trashBottom = trashTop + trashH;

    // On vérifie si les bounding boxes se chevauchent
    const overlap = !(
      right < trashLeft ||
      left > trashRight ||
      bottom < trashTop ||
      top > trashBottom
    );

    return overlap;
  }

  const handleGestureStateChange = useCallback((event, id) => {
    const { state } = event.nativeEvent;

    if (
      activeElementRef &&
      activeElementRef.current &&
      activeElementRef.current !== id
    ) {
      return;
    }
    if (state === State.BEGAN) {
      // Ne pas afficher la corbeille pour les lockedImage
      const element = elements.find((el) => el.id === id);
      if (element && element.type === "lockedImage") {
        return;
      }

      activeElementRef.current = id;
      setActiveElementId(id);
      setIsDragging(true); // On affiche la poubelle (si on veut)
      // PAS de setIsHoverTrash(true) ici !
    } else if (state === State.END || state === State.CANCELLED) {
      setIsDragging(false); // L'utilisateur relâche
      activeElementRef.current = null; // Réinitialise la ref
      setActiveElementId(null);

      // Réinitialise `isElementCenteredHorizontal` , `isElementCenteredVertical` une fois que l'utilisateur relâche
      setIsElementCenteredHorizontal(false);
      setIsElementCenteredVertical(false);

      // Réinitialise `isHoverTrash` une fois que l'utilisateur relâche
      setIsHoverTrash(false);

      setElements((prevElements) => {
        const updated = prevElements.map((el) => {
          if (el.id === id) {
            return {
              ...el,
              x: el.x + el.translationX,
              y: el.y + el.translationY,
              translationX: 0,
              translationY: 0,
            };
          }
          return el;
        });

        // *** Vérification de la poubelle ***
        const movedEl = updated.find((el) => el.id === id);
        if (movedEl) {
          const elemData = {
            ...movedEl,
            x: movedEl.x + movedEl.translationX,
            y: movedEl.y + movedEl.translationY,
          };

          if (isInTrashZone(elemData, trashLayoutRef.current)) {
            setIsHoverTrash(false);
            return updated.filter((el) => el.id !== id);
          }
        }

        // Sauvegarde dans l’historique à chaque fin de drag
        saveHistory(updated);
        return updated;
      });
    }
  }, []);

  const handleSaveImage = async (tableRef, setIsSavedModalVisible) => {
    // Supprimer temporairement le borderRadius
    if (tableRef.current) {
      tableRef.current.setNativeProps({
        style: { borderRadius: 0 },
      });
    }

    try {
      if (!tableRef.current) {
        throw new Error("Référence à la vue introuvable.");
      }

      const resultImage = await captureRef(tableRef, {
        format: "png",
        quality: 1,
      });

      await CameraRoll.save(resultImage);
      console.log("Image sauvegardée :", resultImage);

      // Affiche la modal pendant 2 secondes
      setIsSavedModalVisible(true);
      setTimeout(() => {
        setIsSavedModalVisible(false);
      }, 2000);
    } catch (error) {
      console.error("Erreur dans handleSaveImage :", error);
      Alert.alert("Erreur", "Impossible de sauvegarder l'image.");
    } finally {
      // Rétablir le borderRadius après la capture
      if (tableRef.current) {
        tableRef.current.setNativeProps({
          style: { borderRadius: 15 },
        });
      }
    }
  };

  // --------------------
  // UNDO / REDO
  // --------------------

  // Retour en arrière (Undo)
  const handleUndo = () => {
    if (history.length > 1) {
      // Le dernier état actuel
      const currentState = history[history.length - 1];
      // L’état précédent
      const prevState = history[history.length - 2];

      // Empiler l'état actuel dans redoStack
      setRedoStack((prevRedo) => [currentState, ...prevRedo]);

      // Retirer le dernier état de l'historique
      setHistory((prev) => prev.slice(0, -1));

      // Revenir à l'état précédent
      setElements(prevState);
    }
  };

  // Aller vers l’avant (Redo)
  const handleRedo = () => {
    if (redoStack.length > 0) {
      // Prochain état à restaurer
      const nextState = redoStack[0];

      // L’état courant est poussé dans l’historique
      setHistory((prevHistory) => [...prevHistory, nextState]);

      // On retire l’état du redoStack
      setRedoStack((prevRedo) => prevRedo.slice(1));

      // On applique le nextState
      setElements(nextState);
    }
  };

  const EditTextModal = ({
    visible,
    onClose,
    onSave,
    text,
    textColor,
    //  setTextColor,
  }) => {
    const [editText, setEditText] = useState(text);
    const [selectedFont, setSelectedFont] = useState("Poppins_500Medium");
    const [editTextColor, setEditTextColor] = useState(textColor);

    const handleClose = () => {
      if (!editText.trim()) {
        // Supprime l'élément si le texte est vide
        setElements((prevElements) =>
          prevElements.filter((el) => el.id !== activeElementId)
        );
        saveHistory(
          elements.filter((el) => el.id !== activeElementId) // Met à jour l'historique
        );
      } else {
        // Sinon, sauvegarde les modifications
        onSave({
          text: editText,
          font: selectedFont,
          color: editTextColor,
        });
      }
      onClose();
    };
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose} accessible={false}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 1)", // Fond sombre
            }}
          >
            <View
              pointerEvents="box-none" // Laisse les enfants interagir directement
              style={{ width: "100%", alignItems: "center" }}
            >
              <TextInput
                style={{
                  color:
                    editTextColor === "black" || editTextColor === "#000"
                      ? "#666"
                      : editTextColor,
                  fontSize: 25, // Taille fixe du texte
                  textAlign: "center",
                  fontFamily: selectedFont,
                  width: "90%",
                  paddingHorizontal: 20,
                }}
                value={editText}
                onChangeText={setEditText}
                placeholder="Saisis ton texte..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                autoFocus
                multiline
              />
            </View>

            {/* Sélecteur de couleurs */}
            <ScrollView
              horizontal
              style={{
                position: "absolute",
                top: 70,
                left: 10,
                right: 0,
              }}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {[
                "white",
                "black",
                "#FF0000",
                "#FF7F00",
                "#FFFF00",
                "#7FFF00",
                "#00FF00",
                "#00FF7F",
                "#00FFFF",
                "#007FFF",
                "#0000FF",
                "#7F00FF",
                "#FF00FF",
                "#FF007F",
                "#FF5050",
                "#50FF50",
                "#FFA500",
                "#800080",
                "#FFC0CB",
              ].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#fff",
                    backgroundColor: color,
                    marginHorizontal: 5,
                    //  borderWidth: textColor === color ? 2 : 0,
                    //  borderColor: "white",
                  }}
                  onPress={() => setEditTextColor(color)} // Met à jour la couleur sélectionnée
                />
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              style={{
                position: "absolute",
                top: 100,
                left: 0,
                right: 0,
                paddingVertical: 10,
              }}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always" // Permet de transmettre les clics
            >
              {availableFonts.map((font) => (
                <TouchableOpacity
                  key={font}
                  style={{
                    padding: 10,
                    marginTop: 20,
                    left: 10,
                    marginRight: 10,
                    backgroundColor: selectedFont === font ? "#fca311" : "#333",
                    borderRadius: 15,
                  }}
                  onPress={() => setSelectedFont(font)}
                >
                  <Text style={{ fontFamily: font, color: "white" }}>
                    Mon Texte
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const openEditModal = (text, color) => {
    setEditableText(text || ""); // Texte actuel ou vide
    setEditableTextColor(color || "white"); // Couleur actuelle ou blanche
    setIsEditModalVisible(true); // Affiche la modal
  };

  const saveEditedText = ({
    text,
    font,
    color,
  }: {
    text: string;
    font: string;
    color: string;
  }) => {
    const updatedElements = elements.map((el) =>
      el.id === activeElementId
        ? {
            ...el,
            text: text,
            color: color,
            fontFamily: font,
          }
        : el
    );
    setElements(updatedElements);
    saveHistory(updatedElements); // Enregistre dans l'historique
  };

  // --------------------
  // RENDU DES ÉLÉMENTS
  // --------------------

  const handleResizeGesture = useCallback((event, id) => {
    const { translationX } = event.nativeEvent;

    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              width: Math.max(
                isNaN(el.baseWidth + translationX)
                  ? 50
                  : el.baseWidth + translationX,
                50
              ), // Évite NaN.
            }
          : el
      )
    );
  }, []);

  const handleResizeStateChange = useCallback((event, id) => {
    if (
      event.nativeEvent.state === State.END ||
      event.nativeEvent.state === State.CANCELLED
    ) {
      setElements((prev) =>
        prev.map((el) =>
          el.id === id
            ? {
                ...el,
                baseWidth: el.width, // Enregistre la nouvelle largeur
              }
            : el
        )
      );
    }
  }, []);

  const handleIsPreviewClose = () => {
    setIsPreviewModalVisible(false);
  };

  const [isInteractingWithLockedImage, setIsInteractingWithLockedImage] =
    useState(false);

  const handleLockedImagePressIn = () => setIsInteractingWithLockedImage(true);
  const handleLockedImagePressOut = () =>
    setIsInteractingWithLockedImage(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isElementCenteredHorizontal && isDragging && (
          <CenterHorizontalLine adjustedHeight={adjustedHeight} />
        )}
        {isElementCenteredVertical && isDragging && (
          <CenterVerticalLine adjustedHeight={adjustedHeight} />
        )}

        {/* MenuMemories en haut et en bas (via les barres) */}
        <MenuMemories
          props={props}
          onOpenFilterModal={toggleFilterModal}
          handleSaveImage={() => {
            handleSaveImage(tableRef, setIsSavedModalVisible);
          }}
          handleSaveVideo={() => {}}
          handleAddSticker={handleAddSticker}
          handleAddText={handleAddText}
          imageUri={null}
          videoInputUri={null}
          pickMedia={pickMedia}
          props={props}
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          onOpenTemplateModal={toggleTemplateModal}
          toggleAdvancedMode={toggleAdvancedMode}
          advancedMode={advancedMode}
          openPreviewModal={openPreviewModal}
        />

        <View
          style={[
            styles.trashContainer,
            {
              opacity: isDragging ? 1 : 0,
              transform: [{ scale: isHoverTrash ? 1 : 0.7 }],
            },
          ]}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            trashLayoutRef.current = { x, y, width, height };
          }}
        >
          <Ionicons
            name="trash"
            size={50}
            color="black"
            style={styles.trashIcon}
          />
        </View>

        {isSavedModalVisible && (
          <View style={styles.successModalOverlay}>
            <View style={styles.successModalContainer}>
              <View style={styles.successModalIconContainer}>
                <Text style={styles.successModalCheck}>✔</Text>
              </View>
              <Text style={styles.successModalText}>
                Enregistrement réussi !
              </Text>
            </View>
          </View>
        )}

        <ImageSelectionModal
          visible={isTemplateModalVisible}
          onClose={() => setIsTemplateModalVisible(false)}
          loadTemplate={loadTemplate}
        />

        <EditTextModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSave={saveEditedText}
          text={editableText}
          textColor={editableTextColor}
          //          setTextColor={setEditableTextColor}
        />

        <Modal
          visible={isPreviewModalVisible}
          animationIn="slideInUp" // Animation d'apparition depuis le bas
          animationOut="slideOutDown" // Animation de disparition vers le bas
          transparent={true}
          onRequestClose={handleIsPreviewClose}
        >
          <TouchableWithoutFeedback onPress={handleIsPreviewClose}>
            <View style={styles.modalOverlayPreview}>
              <View style={styles.previewModalContainer}>
                {previewImage ? (
                  <Image
                    source={{ uri: previewImage }}
                    style={{
                      width: screenWidth,
                      height: adjustedHeight,
                      resizeMode: "contain",
                    }}
                  />
                ) : (
                  <Text style={{ color: "white" }}>Chargement...</Text>
                )}
                <TouchableOpacity
                  onPress={handleIsPreviewClose}
                  style={styles.closeButtonPreview}
                >
                  <Text style={styles.closeButtonTextPreview}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          visible={isFilterModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={toggleFilterModal}
        >
          <TouchableWithoutFeedback onPress={toggleFilterModal}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {filters.map((filter) => (
                      <TouchableOpacity
                        key={filter.name}
                        style={[
                          styles.polaroidContainer,
                          currentFilter === filter.name &&
                            styles.activeFilterBorder,
                        ]}
                        onPress={() => {
                          setCurrentFilter(filter.name);
                        }}
                      >
                        <View style={[styles.polaroidSquare, filter.style]} />
                        <Text style={styles.polaroidText}>{filter.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <TapGestureHandler
        // onHandlerStateChange={(event) => {
        //   if (event.nativeEvent.state === State.ACTIVE) {
        //     const { x, y, target } = event.nativeEvent;
        //     handleTapNewText(event);
        //   }
        // }}
        // shouldCancelWhenOutside={false} // Ne pas annuler quand on interagit avec des enfants
        >
          <RotationGestureHandler
            ref={rotateRef}
            simultaneousHandlers={[pinchRef, panRef]}
            onGestureEvent={(e) => {
              if (!activeElementRef.current) return;
              if (activeElementId) {
                const radians = e.nativeEvent.rotation;
                setElements((prev) =>
                  prev.map((el) => {
                    if (el.id !== activeElementRef.current) return el;
                    const newRotation =
                      el.baseRotation + (radians * 180) / Math.PI;
                    return { ...el, rotation: newRotation };
                  })
                );
              }
            }}
            onHandlerStateChange={(event) => {
              if (!activeElementRef.current) return;

              if (event.nativeEvent.state === State.BEGAN) {
                setElements((prev) =>
                  prev.map((el) =>
                    el.id === activeElementRef.current
                      ? { ...el, baseRotation: el.rotation }
                      : el
                  )
                );
              } else if (
                event.nativeEvent.state === State.END ||
                event.nativeEvent.state === State.CANCELLED
              ) {
                setElements((prev) =>
                  prev.map((el) =>
                    el.id === activeElementRef.current
                      ? { ...el, baseRotation: el.rotation }
                      : el
                  )
                );
              }
            }}
          >
            <PinchGestureHandler
              ref={pinchRef}
              simultaneousHandlers={[panRef, rotateRef]}
              onGestureEvent={(event) => {
                if (!activeElementRef.current) return;

                const pinchScale = event.nativeEvent.scale;

                setElements((prev) =>
                  prev.map((el) =>
                    el.id === activeElementRef.current
                      ? { ...el, scale: el.baseScale * pinchScale }
                      : el
                  )
                );
              }}
              onHandlerStateChange={(event) => {
                if (!activeElementRef.current) return;

                if (event.nativeEvent.state === State.BEGAN) {
                  setElements((prev) =>
                    prev.map((el) =>
                      el.id === activeElementRef.current
                        ? { ...el, baseScale: el.scale }
                        : el
                    )
                  );
                } else if (
                  event.nativeEvent.state === State.END ||
                  event.nativeEvent.state === State.CANCELLED
                ) {
                  setElements((prev) =>
                    prev.map((el) =>
                      el.id === activeElementRef.current
                        ? { ...el, baseScale: el.scale }
                        : el
                    )
                  );
                }
              }}
            >
              <View
                ref={tableRef}
                style={{
                  //  backgroundColor: "red",
                  backgroundColor: "#fff",
                  width: screenWidth,
                  height: adjustedHeight,
                  borderRadius: 15,
                  alignSelf: "center",
                  overflow: "hidden", // Pour appliquer le border-radius uniquement visuellement
                }}
              >
                {backgroundMedia && (
                  <Image
                    source={{ uri: backgroundMedia }}
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      resizeMode: "cover",
                    }}
                  />
                )}

                {/* Layer pour les filtres */}
                <View
                  style={[
                    styles.filterLayer,
                    filters.find((f) => f.name === currentFilter)?.style,
                  ]}
                />

                {/* Affichage des éléments (textes + stickers) */}
                {elements.map((el) => {
                  const {
                    id,
                    type,
                    x,
                    y,
                    translationX,
                    translationY,
                    scale,
                    rotation,
                  } = el;
                  const finalX = x + translationX;
                  const finalY = y + translationY;

                  return (
                    <PanGestureHandler
                      key={id}
                      ref={panRef}
                      simultaneousHandlers={[pinchRef, rotateRef]}
                      onGestureEvent={(e) => handleGestureEvent(e, id)}
                      onHandlerStateChange={(e) => {
                        handleGestureStateChange(e, id);
                        if (e.nativeEvent.state === State.BEGAN) {
                          setActiveElementId(id); // Actif dès qu'on commence à bouger l'élément
                        }
                      }}
                    >
                      <View
                        key={id}
                        style={[
                          styles.elementContainer,
                          {
                            transform: [
                              { translateX: finalX },
                              { translateY: finalY },
                              { scale: scale },
                              { rotate: `${rotation}deg` },
                            ],

                            position: "absolute",

                            // borderWidth:
                            //   translationX !== 0 || translationY !== 0 ? 3 : 3, // plus large

                            // borderColor:
                            //   (translationX !== 0 || translationY !== 0) &&
                            //   advancedMode
                            //     ? "rgba(128, 128, 128, 0.8)" // un peu plus opaque
                            //     : "transparent",

                            left: advancedMode ? -1 : 0,
                            top: advancedMode ? -1 : 0,
                            borderWidth: advancedMode ? 1 : 0,
                            borderColor: advancedMode
                              ? "rgba(128, 128, 128, 0.8)"
                              : "transparent",

                            borderStyle: "dotted",
                            borderRadius: 10, // Coins arrondis si nécessaire
                          },
                        ]}
                      >
                        {/* Si c'est un texte */}
                        {type === "text" && (
                          <TouchableOpacity
                            style={{
                              width: el.width,
                              paddingHorizontal: el.padding,
                              justifyContent: "center",
                              alignItems: "center",
                              position: "relative", // Nécessaire pour positionner le bouton
                            }}
                            onPress={() => {
                              openEditModal(el.text, el.color);
                            }}
                          >
                            <Text
                              style={[
                                styles.textContent,
                                {
                                  fontSize: 25 * el.scale, // Taille du texte ajustée
                                  color: el.color ?? "black",
                                  textAlign: "center",
                                  fontFamily: el.fontFamily,
                                },
                              ]}
                            >
                              {el.text}
                            </Text>
                            {/* Bouton de redimensionnement : mode avancé*/}
                            {advancedMode && (
                              <PanGestureHandler
                                onGestureEvent={(event) =>
                                  handleResizeGesture(event, el.id)
                                }
                                onHandlerStateChange={(event) =>
                                  handleResizeStateChange(event, el.id)
                                }
                              >
                                <View
                                  style={[
                                    styles.resizeHandle,
                                    {
                                      justifyContent: "center",
                                      alignItems: "center",
                                    },
                                  ]}
                                >
                                  {/* Icône de redimensionnement */}
                                  <Ionicons
                                    name="resize-outline" // Icône de redimensionnement
                                    size={18} // Taille de l'icône
                                    color="white" // Couleur de l'icône
                                    style={{
                                      transform: [{ rotate: "45deg" }], // Rotation de 45 degrés
                                    }}
                                  />
                                </View>
                              </PanGestureHandler>
                            )}
                          </TouchableOpacity>
                        )}

                        {/* Si c'est un sticker (image) */}
                        {type === "sticker" && (
                          <Image
                            source={el.source}
                            style={{
                              width: el.width,
                              height: el.height,
                              resizeMode: "contain",
                            }}
                          />
                        )}

                        {type === "lockedImage" && (
                          <TouchableOpacity
                            onPressIn={handleLockedImagePressIn}
                            onPressOut={handleLockedImagePressOut}
                            onPress={() => pickMediaElement(el.id)} // Appel de pickMediaElement avec l'ID de l'élément
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              width: el.width,
                              height: el.height,
                              backgroundColor: "transparent",
                              overflow: "hidden", // Empêche l’image de dépasser visuellement le cadre
                            }}
                          >
                            {el.source ? (
                              <PanGestureHandler
                                onGestureEvent={(event) => {
                                  const { translationX, translationY } =
                                    event.nativeEvent;

                                  // Met à jour les déplacements dans les limites du cadre
                                  setElements((prevElements) =>
                                    prevElements.map((elem) => {
                                      if (elem.id === el.id) {
                                        // Calcul des limites

                                        const maxY = 0; // Bord supérieur
                                        const minY =
                                          elem.height - elem.height * 1.5; // Bord inférieur

                                        return {
                                          ...elem,
                                          imageTranslationY: Math.max(
                                            Math.min(
                                              (elem.imageTranslationY || 0) +
                                                translationY,
                                              maxY
                                            ),
                                            minY
                                          ),
                                        };
                                      }
                                      return elem;
                                    })
                                  );
                                }}
                                onHandlerStateChange={(event) => {
                                  if (
                                    event.nativeEvent.state === State.END ||
                                    event.nativeEvent.state === State.CANCELLED
                                  ) {
                                    // Fixe la position finale
                                    setElements((prevElements) =>
                                      prevElements.map((elem) =>
                                        elem.id === el.id
                                          ? {
                                              ...elem,
                                              baseImageTranslationY:
                                                elem.imageTranslationY || 0,
                                            }
                                          : elem
                                      )
                                    );
                                  }
                                }}
                              >
                                <Animated.Image
                                  source={el.source}
                                  style={{
                                    width: el.width,
                                    height:
                                      el.imageHeight && el.imageWidth
                                        ? el.width *
                                          (el.imageHeight / el.imageWidth)
                                        : el.height,
                                    transform: [
                                      { translateY: el.imageTranslationY || 0 },
                                    ],
                                    resizeMode: "cover",
                                  }}
                                />
                              </PanGestureHandler>
                            ) : (
                              <View
                                style={{
                                  ...styles.placeholder,
                                  width: el.width,
                                  height: el.height,
                                  borderWidth: 1,
                                  borderColor: "#ddd",
                                  justifyContent: "center",
                                  backgroundColor: "#fafafa",
                                  alignItems: "center",
                                }}
                              >
                                <Ionicons
                                  name="image-outline"
                                  size={40}
                                  color="#888"
                                />
                                <Text
                                  style={{
                                    textAlign: "center",
                                    color: "#888", // Couleur du texte gris clair pour correspondre à l'icône
                                    marginTop: 5,
                                    fontSize: 16,
                                  }}
                                >
                                  + Ajouter Image
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </PanGestureHandler>
                  );
                })}
              </View>
            </PinchGestureHandler>
          </RotationGestureHandler>
        </TapGestureHandler>
      </View>
    </SafeAreaView>
  );
};

// ---------------
// STYLES
// ---------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
    padding: 0,
    margin: 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
    margin: 0,
    padding: 0,
  },
  elementContainer: {
    position: "absolute",
    padding: 5,
    borderRadius: 5,
  },
  textContent: {
    color: "#000",
    fontWeight: "bold",
  },

  //MODAL SUCCESS SAVE
  successModalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(0, 0, 0, 0.5)", // Optionnel si tu veux un fond semi-transparent
  },
  successModalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  successModalIconContainer: {
    width: 25,
    height: 25,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  successModalCheck: {
    color: "white",
    fontSize: 20,
  },
  successModalText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600", // ou "bold" si tu préfères
  },
  filterLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    pointerEvents: "none", // Laisse les touches passer à travers
  },
  filterButton: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333", // Couleur de fond par défaut
  },

  filterText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Place le contenu en bas
    //  backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond sombre avec opacité
  },

  modalContainer: {
    backgroundColor: "rgba(0,0,0,1)", // Fond sombre pour le bloc
    paddingBottom: 20,
    paddingHorizontal: 10,
  },

  sliderContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10, // Espacement avec le bloc des filtres
  },

  filterScrollView: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },

  filterPreview: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },

  activeFilter: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap", // Pour s'adapter à plusieurs lignes si nécessaire
    paddingVertical: 10,
  },
  intensityLabel: {
    color: "white",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 5,
  },

  polaroidContainer: {
    backgroundColor: "#FFFFFF", // Fond blanc pour l'effet Polaroid
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Ombre pour Android
    width: 75, // Largeur de chaque Polaroid
    margin: 5, // Espacement entre les Polaroids
    alignItems: "center", // Centrage du contenu
    padding: 5, // Padding pour l'effet bordure
  },

  polaroidSquare: {
    width: 60, // Carré coloré en haut
    height: 60,
  },
  polaroidText: {
    marginTop: 5, // Espacement par rapport au carré
    fontSize: 9,
    color: "#333",
    fontFamily: "Poppins_400Regular",
  },
  activeFilterBorder: {
    borderWidth: 2,
    borderColor: "#fca311", // Couleur d'accent pour le filtre sélectionné
  },
  //trash button
  trashContainer: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)", // Fond opaque pour voir l'ombre
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.3)",
    borderStyle: "dotted",
  },
  trashIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  /**************************************/

  modalTemplateOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalTemplateContainer: {
    height: screenHeight * 0.8, // Modal height 90% of the screen
    backgroundColor: "#000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 10,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  imageContainer: {
    width: (screenWidth - 60) / 2, // Two columns with spacing
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: ((screenWidth - 60) * (16 / 9)) / 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "white",
  },
  imageLabel: {
    color: "#fff",
    textAlign: "center",
    marginTop: 5,
  },
  categoryContainer: {
    flexDirection: "row",
    marginVertical: 10,
    height: 60,
  },
  categoryButton: {
    paddingHorizontal: 15,
    height: 30,
    justifyContent: "center",
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: "#333",
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
  },
  activeCategory: {
    backgroundColor: "#fca311",
  },
  activeCategoryText: {
    color: "#000",
  },
  closeButton: {
    alignSelf: "center",
    marginTop: 15,
    backgroundColor: "#f00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  //resizeHandle
  resizeHandle: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Fond semi-transparent
    borderRadius: 15,
    position: "absolute",
    transform: [{ translateY: -10 }], // Ajuste la position pour le centrer
    right: -20, // Décalage par rapport à l'élément
    top: "50%",
    justifyContent: "center",
    alignItems: "center", // Centre l'icône
  },

  //MODAL PREVIEW

  modalOverlayPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    height: screenHeight,
    width: screenWidth,
  },
  previewModalContainer: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    //  height: screenHeight,
    width: screenWidth,
  },
  closeButtonPreview: {
    marginTop: 20,
    backgroundColor: "#f00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  closeButtonTextPreview: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CanvasMemories;
