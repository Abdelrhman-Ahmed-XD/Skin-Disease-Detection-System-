import { Ionicons } from "@expo/vector-icons";
import { Label } from "@react-navigation/elements";
import { router, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../Firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";



export default function Login1() {
  const Router = useRouter();

  const [showPassword, setShowPassword] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const togglePassword = () => setShowPassword(!showPassword);

  const openGoogle = () => Linking.openURL("https://accounts.google.com");
  const openFacebook = () => Linking.openURL("https://www.facebook.com/login/");
  const openApple = () => Linking.openURL("https://appleid.apple.com/sign-in");

  // Email validation
  useEffect(() => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email) setEmailError("");
    else if (!emailRegex.test(email)) setEmailError("Please enter a valid email");
    else setEmailError("");
  }, [email]);



  const isFormValid =
    email &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) &&
    !emailError &&
    !passwordError;
    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // Save uid locally
            const saved = await AsyncStorage.getItem("signupDraft");
            const data = saved ? JSON.parse(saved) : {};
            await AsyncStorage.setItem(
                "signupDraft",
                JSON.stringify({ ...data, uid: user.uid })
            );

            Router.push("/Screensbar/FirstHomePage");
        } catch (error: any) {
            Alert.alert("Login Failed", error.message);
        }
    };
  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* KeyboardAvoidingView بترفع المحتوى فوق الكيبورد */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </Pressable>

          {/* Logo */}
          <Image
            source={require("../assets/images/Skinsight.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Log in</Text>

          {/* Email */}
          <Label style={styles.label}>Email</Label>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

          {/* Password */}
          <Label style={styles.label}>Password</Label>
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Enter your password"
              secureTextEntry={showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity onPress={togglePassword} style={styles.eyeIcon}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="black"
              />
            </TouchableOpacity>
          </View>
          {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
          <Pressable style={{ marginTop: 10 }} onPress={() => Router.push("/Forgetpassword")}>
            <Text style={styles.forgetText}>Forget Password?</Text>
          </Pressable>

          {/* Login Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 25 }}>
            <TouchableOpacity
              disabled={!isFormValid}
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[
                styles.loginBtn,
                { backgroundColor: isFormValid ? "#004F7F" : "#B0B0B0" },
              ]}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* OR WITH */}
          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or With</Text>
            <View style={styles.line} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBtn} onPress={openGoogle}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={openFacebook}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={openApple}>
              <Ionicons name="logo-apple" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.signupRow}>
            <Text>Don&#39;t have an account? </Text>
            <TouchableOpacity onPress={() => Router.push("/SignUp")}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D8E9F0",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
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
  logo: {
    width: 250,
    height: 50,
    alignSelf: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 25,
  },
  label: {
    fontSize: 20,
    marginTop: 30,
    alignSelf: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  passwordWrapper: {
    position: "relative",
    marginTop: 10,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    paddingRight: 45,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -11 }],
  },
  errorText: {
    color: "red",
    marginTop: 6,
  },
  forgetText: {
    color: "#004F7F",
    textAlign: "right",
    textDecorationLine: "underline",
  },
  loginBtn: {
    padding: 14,
    borderRadius: 8,
  },
  loginText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#969696",
  },
  orText: {
    marginHorizontal: 10,
    color: "#004F7F",
    fontWeight: "600",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 60,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 50,
  },
  signUpText: {
    color: "#004F7F",
    textDecorationLine: "underline",
  },
  strengthContainer: {
    marginTop: 10,
    gap: 6,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strengthText: {
    fontSize: 13,
  },
});