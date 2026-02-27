import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ChangePassword() {

  return (
    <>
        <SafeAreaView style={styles.container}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/Settingsoptions/Changepassword")}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#D8E9F0" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF",
    borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, margin: 15,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 1, borderColor: "#E5E7EB",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },

});
//tyfytfryryudfytdy