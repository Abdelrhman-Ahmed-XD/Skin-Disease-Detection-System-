import { Ionicons } from "@expo/vector-icons";
import { Label } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Verifyemail() {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isFormValid, setIsFormValid] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [email, setEmail] = useState("");

  // ✅ LOAD EMAIL FROM FORGET FLOW
  useEffect(() => {
    const loadEmail = async () => {
      try {
        const saved = await AsyncStorage.getItem("forgetPasswordEmail");
        if (saved) {
          setEmail(saved);
        }
      } catch (err) {
        console.log("Load email error:", err);
      }
    };

    loadEmail();
  }, []);

  useEffect(() => {
    const filled = otp.every((digit) => digit !== "");
    setIsFormValid(filled);
  }, [otp]);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    router.push("/Resetpassword");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#D8E9F0" }}>
      <View style={{ margin: 20 }}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </Pressable>

        <Text style={styles.title}>Please check your Email</Text>

        <Text style={styles.subtitle}>
          We’ve sent a code to
        </Text>

        <Text style={styles.emailText}>{email}</Text>

        <Label style={styles.label}>Enter Your Code</Label>

        <View style={styles.otpContainer}>
          {[0, 1, 2, 3, 4, 5].map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleBackspace(nativeEvent.key, index)
              }
            />
          ))}
        </View>

        <TouchableOpacity
          disabled={!isFormValid}
          onPress={handleVerify}
          style={[
            styles.verifyBtn,
            {
              backgroundColor: isFormValid ? "#004F7F" : "#B0B0B0",
            },
          ]}
        >
          <Text style={styles.verifyText}>Verify</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 25, alignItems: "center" }}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Send code again</Text>
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingHorizontal: 10,
    marginBottom: 80,
  },

  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: 22,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  timerText: {
    fontSize: 14,
    color: "#444",
  },

  resendText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#004F7F",
  },

  verifyBtn: {
    marginTop: 25,
    padding: 14,
    borderRadius: 8,
  },

  verifyText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  label: {
    fontSize: 15,
    marginTop: 30,
    alignSelf: "flex-start",
    marginLeft: 15,
  },

  subtitle: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 20,
  },

  emailText: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
