import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator, Alert, Image, Modal, Platform,
  ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";

const STORAGE_KEY = "signupDraft";

const skinColors = [
  { label: "Very Light", color: "#F5E0D3" }, { label: "Light",      color: "#EACAA7" },
  { label: "Medium",     color: "#D1A67A" }, { label: "Tan",        color: "#B57D50" },
  { label: "Brown",      color: "#A05C38" }, { label: "Dark Brown", color: "#8B4513" },
  { label: "Deep",       color: "#7A3E11" }, { label: "Ebony",      color: "#603311" },
];
const eyeColorOptions  = [{ name: "Black", color: "#000000" }, { name: "Brown", color: "#7B4B1A" }, { name: "Light Blue", color: "#6EB6FF" }, { name: "Light Green", color: "#6EDB8F" }, { name: "Grey", color: "#9AA0A6" }];
const hairColorOptions = [{ name: "Black", color: "#000000" }, { name: "Brown", color: "#7B4B1A" }, { name: "Light Blue", color: "#6EB6FF" }, { name: "Light Green", color: "#6EDB8F" }, { name: "Grey", color: "#9AA0A6" }];

export default function EditProfile() {
  const { colors, isDark } = useTheme();
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
  const [skinColor, setSkinColor] = useState<string | null>(null);
  const [eyeColor,  setEyeColor]  = useState<string | null>(null);
  const [hairColor, setHairColor] = useState<string | null>(null);
  const [skinOpen, setSkinOpen] = useState(false);
  const [eyeOpen,  setEyeOpen]  = useState(false);
  const [hairOpen, setHairOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
          if (saved) {
            const data = JSON.parse(saved);
            setFirstName(data.firstName || ""); setLastName(data.lastName || "");
            setEmail(data.email || ""); setOriginalEmail(data.email || "");
            setBirthDay(data.birthDay ?? null); setBirthMonth(data.birthMonth ?? null); setBirthYear(data.birthYear ?? null);
            setGender(data.gender ?? null); setIsEmailVerified(data.isEmailVerified || false);
            setPhotoUri(data.photoUri || null);
            setSkinColor(data.skinColor || null); setEyeColor(data.eyeColor || null); setHairColor(data.hairColor || null);
            if (data.birthYear && data.birthMonth && data.birthDay) setPickerDate(new Date(data.birthYear, data.birthMonth - 1, data.birthDay));
          }
        } catch {} finally { setLoading(false); setIsDirty(false); }
      };
      load();
    }, [])
  );

  const validateEmail = (text: string) => {
    if (!text) setEmailError("");
    else if (!/^\S+@\S+\.\S+$/.test(text)) setEmailError("Please enter a valid email");
    else setEmailError("");
  };

  const handleEmailChange = (text: string) => {
    setEmail(text); validateEmail(text); setIsDirty(true);
    const isSame = text === originalEmail;
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      const data = saved ? JSON.parse(saved) : {};
      if (isSame) { setIsEmailVerified(data.isEmailVerified || false); AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, email: text, isEmailVerified: data.isEmailVerified || false })); }
      else { setIsEmailVerified(false); AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, email: text, isEmailVerified: false })); }
    });
  };

  const onDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (!selected) return;
    setPickerDate(selected);
    setBirthDay(selected.getDate()); setBirthMonth(selected.getMonth() + 1); setBirthYear(selected.getFullYear());
    setIsDirty(true);
  };

  const saveGender = async (value: "male" | "female") => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : {};
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, gender: value }));
  };

  const handlePickImage = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      { text: "Camera", onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return;
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
          if (!result.canceled && result.assets[0].uri) {
            const uri = result.assets[0].uri; setPhotoUri(uri); setIsDirty(true);
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...(saved ? JSON.parse(saved) : {}), photoUri: uri }));
          }
      }},
      { text: "Gallery", onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return;
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
          if (!result.canceled && result.assets[0].uri) {
            const uri = result.assets[0].uri; setPhotoUri(uri); setIsDirty(true);
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...(saved ? JSON.parse(saved) : {}), photoUri: uri }));
          }
      }},
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const formatDOB = () => {
    if (!birthDay || !birthMonth || !birthYear) return "Not set";
    return `${String(birthDay).padStart(2, "0")} / ${String(birthMonth).padStart(2, "0")} / ${birthYear}`;
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) { Alert.alert("Error", "First name and last name are required."); return; }
    if (!isEmailVerified) { Alert.alert("Email not verified", "Please verify your email before saving."); return; }
    try {
      setSaving(true);
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const data  = saved ? JSON.parse(saved) : {};
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, firstName, lastName, email, gender, birthDay, birthMonth, birthYear, skinColor, eyeColor, hairColor }));
      Alert.alert("Saved", "Your profile has been updated.", [{ text: "OK", onPress: () => router.back() }]);
    } catch { Alert.alert("Error", "Failed to save. Please try again."); }
    finally { setSaving(false); }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }];
  const dropdownCardStyle = [styles.dropdownCard, { backgroundColor: colors.card, borderColor: colors.border }];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={[styles.backBtn, { borderColor: colors.border }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.avatarWrap} onPress={handlePickImage} activeOpacity={0.8}>
          <View style={[styles.avatar, { backgroundColor: isDark ? '#2A3F50' : '#E8F4F8', borderColor: isDark ? '#374151' : '#C5E3ED' }]}>
            {photoUri ? <Image source={{ uri: photoUri }} style={styles.avatarImage} resizeMode="cover" /> : <Ionicons name="person-outline" size={44} color={colors.primary} />}
          </View>
          <View style={[styles.avatarEditBtn, { backgroundColor: colors.card, borderColor: isDark ? '#374151' : '#C5E3ED' }]}>
            <Ionicons name="create-outline" size={14} color={colors.primary} />
          </View>
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
        <TextInput style={inputStyle} value={firstName} onChangeText={(v) => { setFirstName(v); setIsDirty(true); }} placeholder="Enter your first name" placeholderTextColor={colors.subText} />

        <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
        <TextInput style={inputStyle} value={lastName} onChangeText={(v) => { setLastName(v); setIsDirty(true); }} placeholder="Enter your last name" placeholderTextColor={colors.subText} />

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <View style={styles.emailRow}>
          <TextInput style={[inputStyle, { flex: 1, marginBottom: 0 }]} value={email} onChangeText={handleEmailChange} placeholder="Enter your email" placeholderTextColor={colors.subText} keyboardType="email-address" autoCapitalize="none" />
          {!isEmailVerified ? (
            <TouchableOpacity style={[styles.verifyBtn, { backgroundColor: email && !emailError ? colors.primary : colors.subText }]} disabled={!email || !!emailError} onPress={() => router.push({ pathname: "/Verifyemail", params: { source: "editProfile" } })}>
              <Text style={styles.verifyBtnText}>Verify</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.verifyBtn, { backgroundColor: "#28A745" }]}>
              <Text style={styles.verifyBtnText}>Verified ✓</Text>
            </View>
          )}
        </View>
        {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

        <Text style={[styles.label, { color: colors.text }]}>Age</Text>
        <TouchableOpacity style={inputStyle} onPress={() => setShowPicker(true)} activeOpacity={0.8}>
          <View style={styles.dobRow}>
            <Text style={[styles.inputText, { color: birthDay ? colors.text : colors.subText }]}>{formatDOB()}</Text>
            <Ionicons name="calendar-outline" size={20} color={colors.subText} />
          </View>
        </TouchableOpacity>

        {Platform.OS === "android" && showPicker && <DateTimePicker value={pickerDate} mode="date" display="default" maximumDate={new Date()} onChange={onDateChange} />}
        {Platform.OS === "ios" && (
          <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}><Text style={[styles.modalCancel, { color: colors.subText }]}>Cancel</Text></TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Select Date</Text>
                  <TouchableOpacity onPress={() => setShowPicker(false)}><Text style={[styles.modalDone, { color: colors.primary }]}>Done</Text></TouchableOpacity>
                </View>
                <DateTimePicker value={pickerDate} mode="date" display="spinner" maximumDate={new Date()} onChange={onDateChange} style={{ height: 200 }} />
              </View>
            </View>
          </Modal>
        )}

        {/* Gender */}
        <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
        <TouchableOpacity style={[inputStyle, { marginBottom: 0 }]} onPress={() => setGenderOpen(!genderOpen)} activeOpacity={0.8}>
          <View style={styles.dobRow}>
            {gender ? <View style={styles.genderValueRow}><Ionicons name={gender === "male" ? "male" : "female"} size={18} color={gender === "male" ? colors.primary : "#E6007A"} /><Text style={[styles.inputText, { color: colors.text }]}>{gender === "male" ? "Male" : "Female"}</Text></View>
              : <Text style={[styles.genderPlaceholder, { color: colors.subText }]}>Choose Your Gender</Text>}
            <Ionicons name={genderOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.subText} />
          </View>
        </TouchableOpacity>
        {genderOpen && (
          <View style={dropdownCardStyle}>
            {["male", "female"].map((g, i) => (
              <React.Fragment key={g}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setGender(g as any); setGenderOpen(false); setIsDirty(true); saveGender(g as any); }}>
                  <Ionicons name={g === "male" ? "male" : "female"} size={18} color={g === "male" ? colors.primary : "#E6007A"} />
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>{g === "male" ? "Male" : "Female"}</Text>
                  {gender === g && <Ionicons name="checkmark" size={18} color={colors.primary} style={{ marginLeft: "auto" }} />}
                </TouchableOpacity>
                {i === 0 && <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Skin Tone */}
        <Text style={[styles.label, { color: colors.text }]}>Skin Tone</Text>
        <TouchableOpacity style={[inputStyle, { marginBottom: 0 }]} onPress={() => setSkinOpen(!skinOpen)} activeOpacity={0.8}>
          <View style={styles.dobRow}>
            {skinColor ? <View style={styles.genderValueRow}><View style={[styles.colorCircle, { backgroundColor: skinColor }]} /><Text style={[styles.inputText, { color: colors.text }]}>{skinColors.find(s => s.color === skinColor)?.label || skinColor}</Text></View>
              : <Text style={[styles.genderPlaceholder, { color: colors.subText }]}>Choose Your Skin Tone</Text>}
            <Ionicons name={skinOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.subText} />
          </View>
        </TouchableOpacity>
        {skinOpen && (
          <View style={dropdownCardStyle}>
            {skinColors.map((item, index) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSkinColor(item.color); setSkinOpen(false); setIsDirty(true); }}>
                  <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>{item.label}</Text>
                  {skinColor === item.color && <Ionicons name="checkmark" size={18} color={colors.primary} style={{ marginLeft: "auto" }} />}
                </TouchableOpacity>
                {index < skinColors.length - 1 && <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Eye Color */}
        <Text style={[styles.label, { color: colors.text }]}>Eye Color</Text>
        <TouchableOpacity style={[inputStyle, { marginBottom: 0 }]} onPress={() => setEyeOpen(!eyeOpen)} activeOpacity={0.8}>
          <View style={styles.dobRow}>
            {eyeColor ? <View style={styles.genderValueRow}><View style={[styles.colorCircle, { backgroundColor: eyeColorOptions.find(e => e.name === eyeColor)?.color }]} /><Text style={[styles.inputText, { color: colors.text }]}>{eyeColor}</Text></View>
              : <Text style={[styles.genderPlaceholder, { color: colors.subText }]}>Choose Your Eye Color</Text>}
            <Ionicons name={eyeOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.subText} />
          </View>
        </TouchableOpacity>
        {eyeOpen && (
          <View style={dropdownCardStyle}>
            {eyeColorOptions.map((item, index) => (
              <React.Fragment key={item.name}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setEyeColor(item.name); setEyeOpen(false); setIsDirty(true); }}>
                  <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>{item.name}</Text>
                  {eyeColor === item.name && <Ionicons name="checkmark" size={18} color={colors.primary} style={{ marginLeft: "auto" }} />}
                </TouchableOpacity>
                {index < eyeColorOptions.length - 1 && <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Hair Color */}
        <Text style={[styles.label, { color: colors.text }]}>Hair Color</Text>
        <TouchableOpacity style={[inputStyle, { marginBottom: 0 }]} onPress={() => setHairOpen(!hairOpen)} activeOpacity={0.8}>
          <View style={styles.dobRow}>
            {hairColor ? <View style={styles.genderValueRow}><View style={[styles.colorCircle, { backgroundColor: hairColorOptions.find(h => h.name === hairColor)?.color }]} /><Text style={[styles.inputText, { color: colors.text }]}>{hairColor}</Text></View>
              : <Text style={[styles.genderPlaceholder, { color: colors.subText }]}>Choose Your Hair Color</Text>}
            <Ionicons name={hairOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.subText} />
          </View>
        </TouchableOpacity>
        {hairOpen && (
          <View style={dropdownCardStyle}>
            {hairColorOptions.map((item, index) => (
              <React.Fragment key={item.name}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setHairColor(item.name); setHairOpen(false); setIsDirty(true); }}>
                  <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>{item.name}</Text>
                  {hairColor === item.name && <Ionicons name="checkmark" size={18} color={colors.primary} style={{ marginLeft: "auto" }} />}
                </TouchableOpacity>
                {index < hairColorOptions.length - 1 && <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        )}

        <TouchableOpacity style={[styles.changePasswordBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/Settingsoptions/Changepassword')} activeOpacity={0.85}>
          <Ionicons name="lock-closed-outline" size={12} color="#fff" />
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmBtn, isDirty ? { backgroundColor: colors.primary } : { backgroundColor: colors.subText }, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={!isDirty || saving}
          activeOpacity={0.85}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirm</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1 },
  loadingWrap:        { flex: 1, justifyContent: "center", alignItems: "center" },
  header:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, margin: 15 },
  backBtn:            { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerTitle:        { fontSize: 20, fontWeight: "bold" },
  scrollContent:      { paddingHorizontal: 20, paddingBottom: 40 },
  avatarWrap:         { alignSelf: "center", marginBottom: 24, position: "relative" },
  avatar:             { width: 90, height: 90, borderRadius: 45, borderWidth: 2, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatarEditBtn:      { position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, justifyContent: "center", alignItems: "center" },
  avatarImage:        { width: 90, height: 90, borderRadius: 45 },
  label:              { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 14 },
  input:              { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, borderWidth: 1, marginBottom: 2 },
  inputText:          { fontSize: 15 },
  errorText:          { color: "red", fontSize: 13, marginTop: 4 },
  emailRow:           { flexDirection: "row", alignItems: "center", gap: 8 },
  verifyBtn:          { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  verifyBtnText:      { color: "#fff", fontWeight: "600", fontSize: 13 },
  dobRow:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalOverlay:       { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard:          { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  modalHeader:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  modalTitle:         { fontSize: 16, fontWeight: "700" },
  modalCancel:        { fontSize: 15 },
  modalDone:          { fontSize: 15, fontWeight: "700" },
  genderPlaceholder:  { fontSize: 15 },
  genderValueRow:     { flexDirection: "row", alignItems: "center", gap: 8 },
  dropdownCard:       { borderRadius: 12, borderWidth: 1, marginTop: 4, overflow: "hidden", elevation: 4 },
  dropdownItem:       { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  dropdownItemText:   { fontSize: 15, fontWeight: "500" },
  dropdownDivider:    { height: 1, marginHorizontal: 12 },
  colorCircle:        { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: "#E5E7EB" },
  confirmBtn:         { borderRadius: 14, paddingVertical: 16, marginTop: 16, alignItems: "center" },
  confirmText:        { color: "#fff", fontSize: 16, fontWeight: "700" },
  changePasswordBtn:  { flexDirection: "row", alignSelf: "flex-end", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginTop: 16 },
  changePasswordText: { color: "#fff", fontSize: 10, fontWeight: "600" },
});