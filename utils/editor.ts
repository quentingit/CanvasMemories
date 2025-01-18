import { Alert, Dimensions, Image, Platform } from "react-native";
import RNFS from "react-native-fs";
import { FFmpegKit } from "ffmpeg-kit-react-native";
import { ReturnCode } from "ffmpeg-kit-react-native";
import * as ImagePicker from "expo-image-picker";
import { captureRef } from "react-native-view-shot";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import noLogo from "../../../../../assets/stickers/camera.png";
import { State } from "react-native-gesture-handler";
/**
 * Obtenir les dimensions d'une image
 * @param {string} uri - URI de l'image
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (uri) =>
  new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });

/**
 * Exécuter une commande FFmpeg pour compresser une vidéo
 * @param {string} command - Commande FFmpeg
 * @param {Function} setVideoUri - Fonction pour définir l'URI de la vidéo
 * @param {string} outputFilePath - Chemin du fichier de sortie
 * @returns {Promise<string>}
 */
export const sendCommandVideo = async (
  command,
  setVideoUri,
  outputFilePath
) => {
  try {
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();

    if (ReturnCode.isSuccess(returnCode)) {
      console.log("Compression réussie !");
      setVideoUri(outputFilePath);
      return outputFilePath;
    } else if (ReturnCode.isCancel(returnCode)) {
      console.log("Compression annulée.");
    } else {
      console.error("Erreur lors de la compression vidéo.");
    }
  } catch (error) {
    console.error("Erreur dans sendCommandVideo :", error);
    throw new Error("Erreur lors de l'exécution de la commande FFmpeg");
  } finally {
    try {
      await RNFS.unlink(outputFilePath);
    } catch (cleanupError) {
      console.warn(
        "Erreur lors de la suppression du fichier temporaire :",
        cleanupError
      );
    }
  }
};

/**
 * Compresser une vidéo et appliquer un filtre
 * @param {string} inputUri - URI de la vidéo d'entrée
 * @param {Function} setVideoUri - Fonction pour définir l'URI de la vidéo compressée
 * @param {string} imageUri - URI de l'image à superposer
 * @returns {Promise<string>}
 */
export const compressVideoAsync = async (inputUri, setVideoUri, imageUri) => {
  const inputFilePath =
    Platform.OS === "android" ? `file://${inputUri}` : inputUri;
  const tempDirectoryPath = RNFS.CachesDirectoryPath;
  const outputFileName = `${Date.now()}_compressed.mp4`;
  const outputFilePath = `${tempDirectoryPath}/${outputFileName}`;

  try {
    const { width, height } = await getImageDimensions(imageUri);
    const adjustedWidth = width % 2 === 0 ? width : width - 1;
    const adjustedHeight = height % 2 === 0 ? height : height - 1;

    const command = `-i "${inputFilePath}" -i "${imageUri}" -filter_complex "[0:v]scale=${adjustedWidth}x${adjustedHeight}[video];[video][1:v]overlay=0:0:format=auto,format=yuv420p" -c:v libx264 -c:a copy "${outputFilePath}"`;
    console.log("Commande FFmpeg :", command);

    const uri = await sendCommandVideo(command, setVideoUri, outputFilePath);

    console.log("URI finale après compression :", uri);
    return uri;
  } catch (error) {
    console.error("Erreur dans compressVideoAsync :", error);
    throw error;
  }
};

/**
 * Sélectionner un média depuis la galerie
 * @param {Function} setVideoInputUri - Fonction pour définir l'URI de la vidéo
 * @param {Function} setImageUri - Fonction pour définir l'URI de l'image
 */
export const pickMedia = async (setVideoInputUri, setImageUri) => {
  console.log("Début de la sélection de média...");

  if (Platform.OS !== "web") {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert(
        "Permission refusée : l'application a besoin d'accéder à votre bibliothèque pour importer des médias."
      );
      return;
    }
  }

  try {
    const media = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (media.canceled) {
      console.log("Sélection annulée par l'utilisateur.");
      return;
    }

    console.log(media);
    const selectedMedia = media.assets[0];
    console.log("Média sélectionné :", selectedMedia);

    if (selectedMedia.type === "video") {
      console.log("Média sélectionné : Vidéo");
      setVideoInputUri(selectedMedia.uri);
      setImageUri(null);
    } else if (selectedMedia.type === "image") {
      console.log("Média sélectionné : Image");
      setImageUri(selectedMedia.uri);
      setVideoInputUri(null);
    } else {
      console.error("Type de média inconnu :", selectedMedia.type);
      alert("Type de média non supporté.");
    }
  } catch (error) {
    console.error("Erreur lors de la sélection du média :", error);
    Alert.alert(
      "Erreur",
      "Une erreur est survenue lors de l'importation du média. Veuillez réessayer.",
      [{ text: "Annuler", style: "cancel" }, { text: "OK" }]
    );
  }
};

/**
 * Sauvegarder une image
 * @param {RefObject} tableRef - Référence à la vue contenant l'image
 */
export const handleSaveImage = async (tableRef, setIsSavedModalVisible) => {
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
  }
};

export const handleSaveVideo = async (tableRef, videoInputUri, setVideoUri) => {
  try {
    if (!tableRef.current) {
      throw new Error("Référence à la vue introuvable.");
    }

    // Capture de l'image pour fusion
    const filterPicture = await captureRef(tableRef, {
      format: "png",
      quality: 1,
    });
    console.log("Image pour la fusion vidéo :", filterPicture);

    // Compression et récupération de l'URI de la vidéo compressée
    const compressedUri = await compressVideoAsync(
      videoInputUri,
      setVideoUri,
      filterPicture
    );
    console.log("Vidéo compressée sauvegardée :", compressedUri);

    // Vérification que l'URI est valide
    const videoUriWithPrefix = compressedUri.startsWith("file://")
      ? compressedUri
      : `file://${compressedUri}`;
    console.log("URI corrigée :", videoUriWithPrefix);

    // Sauvegarde dans la galerie
    const savedUri = await CameraRoll.save(videoUriWithPrefix, {
      type: "video",
    });
    console.log("Vidéo téléchargée dans la galerie :", savedUri);

    Alert.alert(
      "Succès",
      "La vidéo compressée a été téléchargée dans votre galerie !"
    );
  } catch (error) {
    console.error("Erreur dans handleSaveVideo :", error);
    Alert.alert("Erreur", "Impossible de sauvegarder la vidéo.");
  }
};

//ADD STICKER ELEMENT
export const handleAddSticker = (
  setInteractiveElements,
  setCachedElements,
  updateInteractiveElements
) => {
  const newImageElement = {
    type: "image",
    source: noLogo,
    position: {
      x: Dimensions.get("window").width / 2 - 50,
      y: Dimensions.get("window").height / 2 - 50,
    },
    width: 100,
    height: 100,
  };

  // Mise à jour synchronisée de interactiveElements et cachedElements
  setInteractiveElements((prevElements) => {
    // Faire une copie profonde des cachedElements
    const newElements = JSON.parse(JSON.stringify(prevElements));
    // Mettre à jour l'historique avec le nouvel element
    updateInteractiveElements([...newElements, newImageElement]);

    const updatedElements = [...prevElements, newImageElement];
    setCachedElements(updatedElements); // Synchronisation directe
    return updatedElements;
  });
};

//ADD TEXT ELEMENT
export const handleAddText = (
  setCachedElements,
  setInteractiveElements,
  setEditableIndex,
  setEditableText,
  setTextColor,
  setModalVisible,
  interactiveElements,
  updateInteractiveElements
) => {
  const newTextElement = {
    type: "text",
    text: "", // Texte initial vide
    color: "white", // Couleur par défaut
    fontSize: 25, // Taille par défaut
    position: {
      x: 100,
      y: Dimensions.get("window").height / 2,
    },
  };

  // Faire une copie profonde des cachedElements
  const newElements = JSON.parse(JSON.stringify(interactiveElements));
  // Mettre à jour l'historique avec le nouvel element
  updateInteractiveElements([...newElements, newTextElement]);

  // Mise à jour synchronisée de interactiveElements et cachedElements
  setInteractiveElements((prevElements) => {
    const updatedElements = [...prevElements, newTextElement];
    setCachedElements(updatedElements); // Synchronisation directe
    return updatedElements;
  });
  setEditableIndex(interactiveElements.length); // Index du dernier élément ajouté
  setEditableText(""); // Initialise le texte de la modal
  setTextColor("white"); // Couleur par défaut
  setModalVisible(true); // Ouvre la modal
};

//DELETE ELEMENT
export const handleDeleteElement = (
  index,
  setInteractiveElements,
  setCachedElements
) => {
  setInteractiveElements((prevElements) => {
    const updatedElements = [...prevElements];
    updatedElements.splice(index, 1);
    setCachedElements(updatedElements); // Synchronisation directe
    return updatedElements;
  });
};

//HANDLEGESTUREEVENT
export const handleGestureEventExternal = ({
  event,
  index,
  movedElement,
  translation,
  setInteractiveElements,
  setMovedElement,
  setCurrentPosition,
  setTranslation,
}) => {
  const { translationX, translationY, state } = event.nativeEvent;

  // Étape 1 : Suppression de l'élément si non encore déplacé (gestion du layer)
  if (!movedElement) {
    setInteractiveElements((prevElements) => {
      const updatedElements = [...prevElements];
      updatedElements.splice(index, 1); // Supprime l'élément à l'index donné
      return updatedElements;
    });

    setMovedElement(true); // Marque l'élément comme déplacé
  }

  // Étape 2 : Gestion de la translation lorsque l'état est actif
  if (state === State.ACTIVE) {
    const sensitivityFactor = 1;

    // Mise à jour de la position courante
    setCurrentPosition((prevPosition) => ({
      x: prevPosition.x + (translationX - translation.x) / sensitivityFactor,
      y: prevPosition.y + (translationY - translation.y) / sensitivityFactor,
    }));

    // Mise à jour des valeurs de translation
    setTranslation({
      x: translationX,
      y: translationY,
    });
  }
};
