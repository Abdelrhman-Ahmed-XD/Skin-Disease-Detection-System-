import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Label } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Image, Pressable, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import emailjs from '@emailjs/browser';

export default function Verifyemail() {
    const router = useRouter();
    const { source } = useLocalSearchParams<{ source?: string }>();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isFormValid, setIsFormValid] = useState(false);
    const inputs = useRef<(TextInput | null)[]>([]);

    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [email, setEmail] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [userName, setUserName] = useState("");
    const [isSending, setIsSending] = useState(false);

    const EMAILJS_SERVICE_ID = "service_jpaiaeh";
    const EMAILJS_TEMPLATE_ID = "template_me0i6xw";
    const EMAILJS_PUBLIC_KEY = "bdHdQMufusFad9hlO";

    // ── Send OTP Email ────────────────────────────────────────
    const sendOtpEmail = async (userEmail: string, name: string) => {
        try {
            setIsSending(true);
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);

            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    to_name: name || "User",
                    otp_code: newOtp,
                    email: userEmail,
                },
                EMAILJS_PUBLIC_KEY
            );

            Alert.alert("Code Sent ✅", `A verification code has been sent to ${userEmail}`);
        } catch (error) {
            console.log("EmailJS Error:", error);
            Alert.alert("Error", "Failed to send verification code. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    // ── Load email ────────────────────────────────────────────
    useEffect(() => {
        const loadEmail = async () => {
            try {
                const saved = await AsyncStorage.getItem("signupDraft");
                if (saved) {
                    const data = JSON.parse(saved);
                    const loadedEmail = data.email || "";
                    const loadedName = data.firstName || "User";
                    setEmail(loadedEmail);
                    setUserName(loadedName);
                }
            } catch (err) {
                console.log("Load email error:", err);
            }
        };
        loadEmail();
    }, []);

    // ── Send OTP when email is loaded ─────────────────────────
    useEffect(() => {
        if (email) {
            sendOtpEmail(email, userName);
        }
    }, [email]);

    // ── OTP filled check ──────────────────────────────────────
    useEffect(() => {
        setIsFormValid(otp.every((digit) => digit !== ""));
    }, [otp]);

    // ── Timer ─────────────────────────────────────────────────
    useEffect(() => {
        if (timer === 0) { setCanResend(true); return; }
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // ── Resend ────────────────────────────────────────────────
    const handleResend = async () => {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
        await sendOtpEmail(email, userName);
    };

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleBackspace = (key: string, index: number) => {
        if (key === "Backspace" && !otp[index] && index > 0)
            inputs.current[index - 1]?.focus();
    };

    // ── Verify ────────────────────────────────────────────────
    const handleVerify = async () => {
        const enteredOtp = otp.join("");

        if (enteredOtp !== generatedOtp) {
            Alert.alert(
                "Invalid Code ❌",
                "The code you entered is incorrect. Please try again.",
                [
                    {
                        text: "Try Again",
                        onPress: () => {
                            // clear otp boxes and focus first
                            setOtp(["", "", "", "", "", ""]);
                            inputs.current[0]?.focus();
                        }
                    },
                    {
                        text: "Resend Code",
                        onPress: () => handleResend()
                    }
                ]
            );
            return;
        }

        try {
            const saved = await AsyncStorage.getItem("signupDraft");
            const data = saved ? JSON.parse(saved) : {};
            data.isEmailVerified = true;
            await AsyncStorage.setItem("signupDraft", JSON.stringify(data));

            if (source === "editProfile") {
                router.back();
            } else {
                router.push("/SignUp");
            }
        } catch (err) {
            console.log("Error verifying email:", err);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#D8E9F0" }}>
            <View style={{ margin: 20 }}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </Pressable>

                <Text style={{ fontSize: 18, marginTop: 20, textAlign: "center", fontWeight: "bold" }}>
                    Verify Your Email
                </Text>

                <Image
                    source={require("../assets/images/Mail.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={{ marginTop: 15, paddingHorizontal: 5, textAlign: "center", fontSize: 22 }}>
                    We've sent a verification code to
                </Text>
                <Text style={{ marginTop: 2, textAlign: "center", fontSize: 18, fontWeight: "bold" }}>
                    {email}
                </Text>

                {/* Sending indicator */}
                {isSending && (
                    <Text style={{ textAlign: "center", color: "#004F7F", marginTop: 10, fontSize: 13 }}>
                        Sending code...
                    </Text>
                )}

                <Label style={styles.label}>Enter Your Code</Label>
                <View style={styles.otpContainer}>
                    {[0, 1, 2, 3, 4, 5].map((_, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputs.current[index] = ref; }}
                            style={[
                                styles.otpBox,
                                otp[index] ? styles.otpBoxFilled : {}
                            ]}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={otp[index]}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    disabled={!isFormValid || isSending}
                    onPress={handleVerify}
                    style={[styles.verifyBtn, { backgroundColor: isFormValid && !isSending ? "#004F7F" : "#B0B0B0" }]}
                >
                    <Text style={styles.verifyText}>Verify</Text>
                </TouchableOpacity>

                <View style={{ marginTop: 25, alignItems: "center" }}>
                    {canResend ? (
                        <TouchableOpacity onPress={handleResend} disabled={isSending}>
                            <Text style={[styles.resendText, isSending && { color: "#B0B0B0" }]}>
                                {isSending ? "Sending..." : "Send code again"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.timerText}>
                            Send code again in{" "}
                            <Text style={{ fontWeight: "bold" }}>
                                00:{timer < 10 ? `0${timer}` : timer}
                            </Text>
                        </Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    backBtn: {
        width: 42, height: 42, backgroundColor: "#D8E9F0",
        borderRadius: 15, borderColor: "#000", borderWidth: 0.5,
        justifyContent: "center", alignItems: "center", elevation: 3,
    },
    logo: { width: 100, height: 100, alignSelf: "center", marginTop: 20, marginLeft: 20 },
    otpContainer: {
        flexDirection: "row", justifyContent: "space-between",
        marginTop: 15, paddingHorizontal: 10, marginBottom: 80,
    },
    otpBox: {
        width: 45, height: 55, borderRadius: 10, backgroundColor: "#fff",
        textAlign: "center", fontSize: 22, borderWidth: 1, borderColor: "#ccc",
    },
    otpBoxFilled: {
        borderColor: "#004F7F",
        borderWidth: 2,
        backgroundColor: "#E8F4F8",
    },
    timerText: { fontSize: 14, color: "#444" },
    resendText: { fontSize: 14, fontWeight: "bold", color: "#004F7F" },
    verifyBtn: { marginTop: 25, padding: 14, borderRadius: 8, marginBottom: 5 },
    verifyText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
    label: { fontSize: 15, marginTop: 30, alignSelf: "flex-start", marginLeft: 15 },
});