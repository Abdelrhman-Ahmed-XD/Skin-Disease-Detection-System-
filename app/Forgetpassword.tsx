import { Ionicons } from '@expo/vector-icons'
import { Label } from '@react-navigation/elements'
import { router } from 'expo-router'
import React, { useState, useEffect } from 'react'
import { View, Pressable, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Forgetpassword() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9._]*@gmail\.com$/
    if (!email) setEmailError('')
    else if (!regex.test(email)) setEmailError('Please enter a valid Gmail address')
    else setEmailError('')
  }, [email])

  const isFormValid = email && !emailError

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#D8E9F0" }}>
      <View style={{ margin: 20 }}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </Pressable>

        <Text style={styles.title}>Forgot password?</Text>

        <Text style={{ margin: 20, marginTop: 10, fontSize: 16, textAlign: "center" }}>
          Don’t worry! It happens. Please enter the
          <Text style={{ fontWeight: "bold" }}> email address </Text>
          associated with your account.
        </Text>

        <Label style={styles.label}>Email Address</Label>
        <TextInput
          placeholder="Example@gmail.com"
          style={styles.emailInput}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

        <TouchableOpacity
          disabled={!isFormValid}
          onPress={async () => {
            await AsyncStorage.setItem("forgetPasswordEmail", email);
            router.push("/Verifypassword");
          }}
          style={[
            styles.VerifyBtn,
            { backgroundColor: isFormValid ? "#004F7F" : "#B0B0B0" },
          ]}
        >
          <Text style={styles.VerifyText}>Send Code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
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
  emailInput: {
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    paddingRight: 110,
  },
  label: {
    fontSize: 15,
    marginTop: 10,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
  VerifyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  VerifyText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
})
