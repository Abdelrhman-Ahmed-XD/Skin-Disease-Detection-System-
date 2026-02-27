import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = [
  "#F5E0D3",
  "#EACAA7",
  "#D1A67A",
  "#B57D50",
  "#A05C38",
  "#8B4513",
  "#7A3E11",
  "#603311",
];

export default function Skin() {
  const [selectedColor, setSelectedColor] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#DDF0F6" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {/* زر الرجوع */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </Pressable>

        {/* الصف العلوي */}
        <View style={styles.topRow}>
          {!selectedColor && (
            <TouchableOpacity onPress={() => router.push("/EyeScreen")}>
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.percent}>{selectedColor ? "60%" : "40%"}</Text>
        </View>

        {/* شريط التقدم */}
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: selectedColor ? "60%" : "40%" },
            ]}
          />
        </View>

        {/* العنوان */}
        <Text style={styles.title}>Choose your skin tone</Text>
        <Text style={styles.subtitle}>
          Select the skin tone that best matches you.
        </Text>

        {/* منطقة اختيار اللون */}
        <View style={styles.centerArea}>
          <View
            style={[
              styles.selectedBox,
              { backgroundColor: selectedColor || "#eee" },
            ]}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.palette}
          >
            {colors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorBox,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedBorder,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </ScrollView>
        </View>

        {/* زر Continue */}
        <TouchableOpacity
          onPress={() => router.push("/EyeScreen")}
          disabled={!selectedColor}
          style={[
            styles.continueBtn,
            !selectedColor && styles.continueDisabled,
          ]}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  percent: {
    fontWeight: "600",
    marginLeft: "auto",
  },
  skip: {
    color: "#0B4F6C",
    fontWeight: "600",
  },
  progressBg: {
    height: 6,
    backgroundColor: "#ccc",
    borderRadius: 10,
    marginVertical: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0B4F6C",
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
  },
  subtitle: {
    textAlign: "center",
    marginTop: 10,
    color: "#000",
  },

  centerArea: {
    alignItems: "center",
    marginTop: 40,
  },

  selectedBox: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 20,
  },

  palette: {
    paddingHorizontal: 10,
  },

  colorBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 6,
  },

  selectedBorder: {
    borderWidth: 3,
    borderColor: "#007AFF",
  },

  continueBtn: {
    backgroundColor: "#004F7F",
    marginTop: 50,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },

  continueDisabled: {
    backgroundColor: "#aaa",
  },

  continueText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  backBtn: {
    width: 42,
    height: 42,
    backgroundColor: "#D8E9F0",
    borderRadius: 15,
    borderColor: "#000",
    borderWidth: 0.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
});