import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import StartUp from "@/app/StartUp";

export default function Index() {
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowImage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <View style={styles.container}>
      {showImage && (
        <Image
        source={require("../assets/images/Splash Screen.png")}
        style={styles.image}
        resizeMode="cover"
        />
      )}
      
      {!showImage && <StartUp />}
      </View>
      </>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D8E9F0",

  },
  image: {
    resizeMode:"cover",
  },
});

