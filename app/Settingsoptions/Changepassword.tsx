import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  // ── New Password validation ───────────────────────────────
  useEffect(() => {
    if (!newPassword) { setNewPasswordError(""); return; }
    if (newPassword.length < 8)
      setNewPasswordError("Password must be at least 8 characters");
    else if (!/[A-Z]/.test(newPassword))
      setNewPasswordError("Must contain at least one uppercase letter (A-Z)");
    else if (!/[a-z]/.test(newPassword))
      setNewPasswordError("Must contain at least one lowercase letter (a-z)");
    else if (!/[0-9]/.test(newPassword))
      setNewPasswordError("Must contain at least one number (0-9)");
    else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword))
      setNewPasswordError("Must contain at least one special character (@, #, !...)");
    else setNewPasswordError("");
  }, [newPassword]);

  // ── Confirm Password validation ───────────────────────────
  useEffect(() => {
    if (!confirmPassword) setConfirmError("");
    else if (confirmPassword !== newPassword) setConfirmError("Passwords do not match");
    else setConfirmError("");
  }, [confirmPassword, newPassword]);

  const isNewPasswordValid =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

  const isFormValid =
    !!currentPassword &&
    isNewPasswordValid &&
    confirmPassword === newPassword &&
    !confirmError;

  const strengthChecks = [
    { label: "8+ characters",                 pass: newPassword.length >= 8 },
    { label: "Uppercase letter (A-Z)",         pass: /[A-Z]/.test(newPassword) },
    { label: "Lowercase letter (a-z)",         pass: /[a-z]/.test(newPassword) },
    { label: "Number (0-9)",                   pass: /[0-9]/.test(newPassword) },
    { label: "Special character (@, #, !...)", pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) },
  ];

  // ── Handle Change with Alert ──────────────────────────────
  const handleChange = () => {
  Alert.alert(
    "Change Password",
    "Are you sure you want to change your password?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Change",
        style: "destructive",
        onPress: () => router.push("/Settingsoptions/Editprofile"),
      },
    ]
  );
};

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Current Password */}
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Enter your current password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showCurrent}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIcon}>
            <Ionicons name={showCurrent ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* New Password */}
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Enter your new password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
            <Ionicons name={showNew ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        {!!newPasswordError && <Text style={styles.errorText}>{newPasswordError}</Text>}

        {/* Strength Checklist - تحت New Password */}
        {newPassword.length > 0 && (
          <View style={styles.strengthContainer}>
            {strengthChecks.map((item) => (
              <View key={item.label} style={styles.strengthRow}>
                <Ionicons
                  name={item.pass ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={item.pass ? "#22C55E" : "#9CA3AF"}
                />
                <Text style={[styles.strengthText, { color: item.pass ? "#22C55E" : "#9CA3AF" }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Confirm New Password */}
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Confirm your new password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={[
              styles.passwordInput,
              confirmPassword && newPassword !== confirmPassword
                ? { borderColor: "red" }
                : {},
            ]}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
            <Ionicons name={showConfirm ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        {!!confirmError && <Text style={styles.errorText}>{confirmError}</Text>}

        {/* Strength Checklist - تحت Confirm Password */}
        {confirmPassword.length > 0 && (
          <View style={styles.strengthContainer}>
            {strengthChecks.map((item) => (
              <View key={item.label} style={styles.strengthRow}>
                <Ionicons
                  name={item.pass ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={item.pass ? "#22C55E" : "#9CA3AF"}
                />
                <Text style={[styles.strengthText, { color: item.pass ? "#22C55E" : "#9CA3AF" }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          disabled={!isFormValid}
          onPress={handleChange}
          style={[
            styles.saveBtn,
            { backgroundColor: isFormValid ? "#004F7F" : "#aeaeae" },
          ]}
        >
          <Text style={styles.saveBtnText}>Change</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D8E9F0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    margin: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 22,
    marginBottom: 8,
  },
  passwordWrapper: {
    position: "relative",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 13,
    paddingRight: 45,
    fontSize: 15,
    color: "#1F2937",
  },
  eyeIcon: {
    position: "absolute",
    right: 13,
    top: "50%",
    transform: [{ translateY: -11 }],
  },
  errorText: {
    color: "red",
    marginTop: 6,
    fontSize: 13,
  },
  strengthContainer: {
    marginTop: 10,
    gap: 6,
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  strengthText: {
    fontSize: 13,
  },
  saveBtn: {
    marginTop: 40,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});