import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator, Alert, Image, Modal, Platform,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STORAGE_KEY = "signupDraft";

const skinColors = [
  { label: "Very Light", color: "#F5E0D3" },
  { label: "Light",      color: "#EACAA7" },
  { label: "Medium",     color: "#D1A67A" },
  { label: "Tan",        color: "#B57D50" },
  { label: "Brown",      color: "#A05C38" },
  { label: "Dark Brown", color: "#8B4513" },
  { label: "Deep",       color: "#7A3E11" },
  { label: "Ebony",      color: "#603311" },
];

const eyeColorOptions = [
  { name: "Black",       color: "#000000" },
  { name: "Brown",       color: "#7B4B1A" },
  { name: "Light Blue",  color: "#6EB6FF" },
  { name: "Light Green", color: "#6EDB8F" },
  { name: "Grey",        color: "#9AA0A6" },
];

const hairColorOptions = [
  { name: "Black",       color: "#000000" },
  { name: "Brown",       color: "#7B4B1A" },
  { name: "Light Blue",  color: "#6EB6FF" },
  { name: "Light Green", color: "#6EDB8F" },
  { name: "Grey",        color: "#9AA0A6" },
];

export default function EditProfile() {
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [isDirty, setIsDirty]     = useState(false);
  const [photoUri, setPhotoUri]   = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");

  const [birthDay,   setBirthDay]   = useState<number | null>(null);
  const [birthMonth, setBirthMonth] = useState<number | null>(null);
  const [birthYear,  setBirthYear]  = useState<number | null>(null);

  const [gender,     setGender]     = useState<"male" | "female" | null>(null);
  const [genderOpen, setGenderOpen] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [originalEmail,   setOriginalEmail]   = useState("");
  const [emailError,      setEmailError]      = useState("");

  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date(2000, 0, 1));

  // ── الخانات الجديدة ───────────────────────────────────────
  const [skinColor,     setSkinColor]     = useState<string | null>(null);
  const [eyeColor,      setEyeColor]      = useState<string | null>(null);
  const [hairColor,     setHairColor]     = useState<string | null>(null);
  const [skinOpen,      setSkinOpen]      = useState(false);
  const [eyeOpen,       setEyeOpen]       = useState(false);
  const [hairOpen,      setHairOpen]      = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
          if (saved) {
            const data = JSON.parse(saved);
            setFirstName(data.firstName   || "");
            setLastName(data.lastName     || "");
            setEmail(data.email           || "");
            setOriginalEmail(data.email   || "");
            setBirthDay(data.birthDay     ?? null);
            setBirthMonth(data.birthMonth ?? null);
            setBirthYear(data.birthYear   ?? null);
            setGender(data.gender         ?? null);
            setIsEmailVerified(data.isEmailVerified || false);
            setPhotoUri(data.photoUri     || null);
            setSkinColor(data.skinColor   || null);
            setEyeColor(data.eyeColor     || null);
            setHairColor(data.hairColor   || null);
            if (data.birthYear && data.birthMonth && data.birthDay) {
              setPickerDate(new Date(data.birthYear, data.birthMonth - 1, data.birthDay));
            }
          }
        } catch (err) {
          console.log("EditProfile load error:", err);
        } finally {
          setLoading(false);
          setIsDirty(false);
        }
      };
      load();
    }, [])
  );

  const validateEmail = (text: string) => {
    const regex = /^\S+@\S+\.\S+$/;
    if (!text) setEmailError("");
    else if (!regex.test(text)) setEmailError("Please enter a valid email");
    else setEmailError("");
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
    setIsDirty(true);
    const isSameAsOriginal = text === originalEmail;
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      const data = saved ? JSON.parse(saved) : {};
      if (isSameAsOriginal) {
        const wasVerified = data.isEmailVerified || false;
        setIsEmailVerified(wasVerified);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, email: text, isEmailVerified: wasVerified }));
      } else {
        setIsEmailVerified(false);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, email: text, isEmailVerified: false }));
      }
    });
  };

  const showVerifyBtn = !isEmailVerified;
  const canVerify     = !!email && !emailError;

  const onDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (!selected) return;
    setPickerDate(selected);
    setBirthDay(selected.getDate());
    setBirthMonth(selected.getMonth() + 1);
    setBirthYear(selected.getFullYear());
    setIsDirty(true);
  };

  const saveGender = async (value: "male" | "female") => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const data  = saved ? JSON.parse(saved) : {};
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, gender: value }));
    } catch (err) {
      console.log("Gender save error:", err);
    }
  };

  const handlePickImage = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) { Alert.alert("Permission needed", "Camera permission is required."); return; }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
          if (!result.canceled && result.assets[0].uri) {
            const uri = result.assets[0].uri;
            setPhotoUri(uri); setIsDirty(true);
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            const data  = saved ? JSON.parse(saved) : {};
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, photoUri: uri }));
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) { Alert.alert("Permission needed", "Gallery permission is required."); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
          if (!result.canceled && result.assets[0].uri) {
            const uri = result.assets[0].uri;
            setPhotoUri(uri); setIsDirty(true);
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            const data  = saved ? JSON.parse(saved) : {};
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, photoUri: uri }));
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const formatDOB = () => {
    if (!birthDay || !birthMonth || !birthYear) return "Not set";
    const d = String(birthDay).padStart(2, "0");
    const m = String(birthMonth).padStart(2, "0");
    return `${d} / ${m} / ${birthYear}`;
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "First name and last name are required.");
      return;
    }
    if (showVerifyBtn && !isEmailVerified) {
      Alert.alert("Email not verified", "Please verify your new email before saving.");
      return;
    }
    try {
      setSaving(true);
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const data  = saved ? JSON.parse(saved) : {};
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...data, firstName, lastName, email, gender,
        birthDay, birthMonth, birthYear,
        skinColor, eyeColor, hairColor,
      }));
      Alert.alert("Saved", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#004F7F" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar ── */}
        <TouchableOpacity style={styles.avatarWrap} onPress={handlePickImage} activeOpacity={0.8}>
          <View style={styles.avatar}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Ionicons name="person-outline" size={44} color="#004F7F" />
            )}
          </View>
          <View style={styles.avatarEditBtn}>
            <Ionicons name="create-outline" size={14} color="#004F7F" />
          </View>
        </TouchableOpacity>

        {/* ── First Name ── */}
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={(v) => { setFirstName(v); setIsDirty(true); }}
          placeholder="Enter your first name"
          placeholderTextColor="#9CA3AF"
        />

        {/* ── Last Name ── */}
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={(v) => { setLastName(v); setIsDirty(true); }}
          placeholder="Enter your last name"
          placeholderTextColor="#9CA3AF"
        />

        {/* ── Email ── */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.emailRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={email}
            onChangeText={handleEmailChange}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {showVerifyBtn ? (
            <TouchableOpacity
              style={[styles.verifyBtn, { backgroundColor: canVerify ? "#004F7F" : "#BFC6CC" }]}
              disabled={!canVerify}
              onPress={() => router.push({ pathname: "/Verifyemail", params: { source: "editProfile" } })}
            >
              <Text style={styles.verifyBtnText}>Verify</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.verifyBtn, { backgroundColor: "#28A745" }]}>
              <Text style={styles.verifyBtnText}>Verified ✓</Text>
            </View>
          )}
        </View>
        {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

        {/* ── Age / Date of Birth ── */}
        <Text style={styles.label}>Age</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)} activeOpacity={0.8}>
          <View style={styles.dobRow}>
            <Text style={[styles.inputText, !birthDay && { color: "#9CA3AF" }]}>{formatDOB()}</Text>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>

        {Platform.OS === "android" && showPicker && (
          <DateTimePicker value={pickerDate} mode="date" display="default" maximumDate={new Date()} onChange={onDateChange} />
        )}

        {Platform.OS === "ios" && (
          <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.modalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Select Date</Text>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.modalDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker value={pickerDate} mode="date" display="spinner" maximumDate={new Date()} onChange={onDateChange} style={{ height: 200 }} />
              </View>
            </View>
          </Modal>
        )}

        {/* ── Gender ── */}
        <Text style={styles.label}>Gender</Text>
        <TouchableOpacity style={[styles.input, styles.genderTrigger]} onPress={() => setGenderOpen(!genderOpen)} activeOpacity={0.8}>
          <View style={styles.dobRow}>
            {gender ? (
              <View style={styles.genderValueRow}>
                <Ionicons name={gender === "male" ? "male" : "female"} size={18} color={gender === "male" ? "#004F7F" : "#E6007A"} />
                <Text style={styles.inputText}>{gender === "male" ? "Male" : "Female"}</Text>
              </View>
            ) : (
              <Text style={styles.genderPlaceholder}>Choose Your Gender</Text>
            )}
            <View style={styles.genderIconsRow}>
              <Ionicons name="male-female-outline" size={18} color="#6B7280" />
              <Ionicons name={genderOpen ? "chevron-up" : "chevron-down"} size={16} color="#6B7280" />
            </View>
          </View>
        </TouchableOpacity>

        {genderOpen && (
          <View style={styles.dropdownCard}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setGender("male"); setGenderOpen(false); setIsDirty(true); saveGender("male"); }}>
              <Ionicons name="male" size={18} color="#004F7F" />
              <Text style={styles.dropdownItemText}>Male</Text>
              {gender === "male" && <Ionicons name="checkmark" size={18} color="#004F7F" style={{ marginLeft: "auto" }} />}
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setGender("female"); setGenderOpen(false); setIsDirty(true); saveGender("female"); }}>
              <Ionicons name="female" size={18} color="#E6007A" />
              <Text style={styles.dropdownItemText}>Female</Text>
              {gender === "female" && <Ionicons name="checkmark" size={18} color="#E6007A" style={{ marginLeft: "auto" }} />}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Skin Color ── */}
        <Text style={styles.label}>Skin Tone</Text>
        <TouchableOpacity style={[styles.input, styles.genderTrigger]} onPress={() => setSkinOpen(!skinOpen)} activeOpacity={0.8}>
          <View style={styles.dobRow}>
            {skinColor ? (
              <View style={styles.genderValueRow}>
                <View style={[styles.colorCircle, { backgroundColor: skinColor }]} />
                <Text style={styles.inputText}>{skinColors.find(s => s.color === skinColor)?.label || skinColor}</Text>
              </View>
            ) : (
              <Text style={styles.genderPlaceholder}>Choose Your Skin Tone</Text>
            )}
            <Ionicons name={skinOpen ? "chevron-up" : "chevron-down"} size={16} color="#6B7280" />
          </View>
        </TouchableOpacity>

        {skinOpen && (
          <View style={styles.dropdownCard}>
            {skinColors.map((item, index) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => { setSkinColor(item.color); setSkinOpen(false); setIsDirty(true); }}
                >
                  <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
                  <Text style={styles.dropdownItemText}>{item.label}</Text>
                  {skinColor === item.color && <Ionicons name="checkmark" size={18} color="#004F7F" style={{ marginLeft: "auto" }} />}
                </TouchableOpacity>
                {index < skinColors.length - 1 && <View style={styles.dropdownDivider} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* ── Eye Color ── */}
        <Text style={styles.label}>Eye Color</Text>
        <TouchableOpacity style={[styles.input, styles.genderTrigger]} onPress={() => setEyeOpen(!eyeOpen)} activeOpacity={0.8}>
          <View style={styles.dobRow}>
            {eyeColor ? (
              <View style={styles.genderValueRow}>
                <View style={[styles.colorCircle, { backgroundColor: eyeColorOptions.find(e => e.name === eyeColor)?.color }]} />
                <Text style={styles.inputText}>{eyeColor}</Text>
              </View>
            ) : (
              <Text style={styles.genderPlaceholder}>Choose Your Eye Color</Text>
            )}
            <Ionicons name={eyeOpen ? "chevron-up" : "chevron-down"} size={16} color="#6B7280" />
          </View>
        </TouchableOpacity>

        {eyeOpen && (
          <View style={styles.dropdownCard}>
            {eyeColorOptions.map((item, index) => (
              <React.Fragment key={item.name}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => { setEyeColor(item.name); setEyeOpen(false); setIsDirty(true); }}
                >
                  <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                  {eyeColor === item.name && <Ionicons name="checkmark" size={18} color="#004F7F" style={{ marginLeft: "auto" }} />}
                </TouchableOpacity>
                {index < eyeColorOptions.length - 1 && <View style={styles.dropdownDivider} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* ── Hair Color ── */}
        <Text style={styles.label}>Hair Color</Text>
        <TouchableOpacity style={[styles.input, styles.genderTrigger]} onPress={() => setHairOpen(!hairOpen)} activeOpacity={0.8}>
          <View style={styles.dobRow}>
            {hairColor ? (
              <View style={styles.genderValueRow}>
                <View style={[styles.colorCircle, { backgroundColor: hairColorOptions.find(h => h.name === hairColor)?.color }]} />
                <Text style={styles.inputText}>{hairColor}</Text>
              </View>
            ) : (
              <Text style={styles.genderPlaceholder}>Choose Your Hair Color</Text>
            )}
            <Ionicons name={hairOpen ? "chevron-up" : "chevron-down"} size={16} color="#6B7280" />
          </View>
        </TouchableOpacity>

        {hairOpen && (
          <View style={styles.dropdownCard}>
            {hairColorOptions.map((item, index) => (
              <React.Fragment key={item.name}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => { setHairColor(item.name); setHairOpen(false); setIsDirty(true); }}
                >
                  <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                  {hairColor === item.name && <Ionicons name="checkmark" size={18} color="#004F7F" style={{ marginLeft: "auto" }} />}
                </TouchableOpacity>
                {index < hairColorOptions.length - 1 && <View style={styles.dropdownDivider} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* ── Change Password ── */}
        <TouchableOpacity
          style={styles.changePasswordBtn}
          onPress={() => router.push('/Settingsoptions/Changepassword')}
          activeOpacity={0.85}
        >
          <Ionicons name="lock-closed-outline" size={12} color="#fff" />
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>

        {/* ── Confirm ── */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            isDirty ? styles.confirmBtnActive : styles.confirmBtnDisabled,
            saving && { opacity: 0.7 },
          ]}
          onPress={handleSave}
          disabled={!isDirty || saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmText}>Confirm</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#D8E9F0" },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  avatarWrap: { alignSelf: "center", marginBottom: 24, position: "relative" },
  avatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: "#E8F4F8",
    borderWidth: 2, borderColor: "#C5E3ED", justifyContent: "center",
    alignItems: "center", shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08,
    shadowRadius: 6, elevation: 3, overflow: "hidden",
  },
  avatarEditBtn: {
    position: "absolute", bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#C5E3ED",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: "#FFFFFF", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: "#1F2937",
    borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 2,
  },
  inputText: { fontSize: 15, color: "#1F2937" },
  errorText: { color: "red", fontSize: 13, marginTop: 4 },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  verifyBtn: {
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 10, justifyContent: "center", alignItems: "center",
  },
  verifyBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  dobRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  modalCancel: { fontSize: 15, color: "#6B7280" },
  modalDone: { fontSize: 15, color: "#004F7F", fontWeight: "700" },
  genderTrigger: { marginBottom: 0 },
  genderPlaceholder: { fontSize: 15, color: "#9CA3AF" },
  genderValueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  genderIconsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dropdownCard: {
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB",
    marginTop: 4, overflow: "hidden", elevation: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6,
  },
  dropdownItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  dropdownItemText: { fontSize: 15, color: "#1F2937", fontWeight: "500" },
  dropdownDivider: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 12 },
  colorCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  confirmBtn: {
    borderRadius: 14, paddingVertical: 16, marginTop: 16, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  confirmBtnActive:   { backgroundColor: "#004F7F" },
  confirmBtnDisabled: { backgroundColor: "#6B7280" },
  confirmText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  changePasswordBtn: {
    flexDirection: "row", alignSelf: "flex-end",
    alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#004F7F", borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 14, marginTop: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  changePasswordText: { color: "#fff", fontSize: 10, fontWeight: "600" },
});