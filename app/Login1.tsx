import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
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
import { auth, db } from "../Firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const STORAGE_KEY = 'signupDraft';

export default function Login1() {
    const Router = useRouter();

    const [showPassword, setShowPassword] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const togglePassword = () => setShowPassword(!showPassword);

    const openGoogle = () => Linking.openURL("https://accounts.google.com");
    const openFacebook = () => Linking.openURL("https://www.facebook.com/login/");

    // Email validation
    useEffect(() => {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!email) setEmailError("");
        else if (!emailRegex.test(email)) setEmailError("Please enter a valid email");
        else setEmailError("");
    }, [email]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    const handleLogin = async () => {
        // Basic validation
        if (!email || !password) {
            Alert.alert("Error", "Please enter your email and password.");
            return;
        }

        setLoading(true);
        try {
            // 1. Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Fetch user name from Firestore
            const docSnap = await getDoc(doc(db, 'users', user.uid));
            let firstName = '';
            let lastName = '';
            if (docSnap.exists()) {
                const data = docSnap.data();
                firstName = data.firstName || '';
                lastName  = data.lastName  || '';
            }

            // 3. Save to AsyncStorage so FirstHomePage shows name instantly
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
                uid:       user.uid,
                email:     user.email,
                firstName,
                lastName,
            }));

            // 4. Navigate to home
            Router.replace("/Screensbar/FirstHomePage");

        } catch (error: any) {
            let message = "Login failed. Please try again.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = "Incorrect email or password.";
            } else if (error.code === 'auth/invalid-email') {
                message = "Please enter a valid email address.";
            } else if (error.code === 'auth/too-many-requests') {
                message = "Too many attempts. Please try again later.";
            }
            Alert.alert("Login Failed", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
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
                    <Text style={styles.label}>Email</Text>
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
                    <Text style={styles.label}>Password</Text>
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

                    <Pressable style={{ marginTop: 10 }} onPress={() => Router.push("/Forgetpassword")}>
                        <Text style={styles.forgetText}>Forget Password?</Text>
                    </Pressable>

                    {/* Login Button */}
                    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 25 }}>
                        <TouchableOpacity
                            onPress={handleLogin}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            disabled={loading}
                            style={[styles.loginBtn, { backgroundColor: loading ? "#7BAFC4" : "#004F7F" }]}
                        >
                            <Text style={styles.loginText}>{loading ? "Logging in..." : "Login"}</Text>
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
});