import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect } from "react";
import { auth } from "../Firebase/firebaseConfig";
import { CustomizeProvider } from "./Customize/Customizecontext";
import { ThemeProvider } from "./ThemeContext";

export default function RootLayout() {
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is logged in — send to home, never allow StartUp/Login
                router.replace("/Screensbar/FirstHomePage");
            }
            // If no user, stay on current screen (StartUp/Login/SignUp)
        });
        return unsub;
    }, []);

    return (
        <CustomizeProvider>
            <ThemeProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </ThemeProvider>
        </CustomizeProvider>
    );
}