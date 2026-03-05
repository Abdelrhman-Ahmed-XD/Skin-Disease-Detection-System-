import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { auth, db } from '../../Firebase/firebaseConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Language   = 'English' | 'Arabic';
export type FontFamily = 'System' | 'Inter' | 'SpaceMono' | 'Roboto';

export interface CustomizeSettings {
  language:            Language;
  fontFamily:          FontFamily;
  fontSize:            number;
  textColor:           string;
  backgroundColor:     string;
  textColorCustomized: boolean; // false = use dark-mode default, true = user picked a color
}

export const DEFAULT_SETTINGS: CustomizeSettings = {
  language:            'English',
  fontFamily:          'System',
  fontSize:            16,
  textColor:           '#1F2937',
  backgroundColor:     '#D8E9F0',
  textColorCustomized: false,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface CustomizeContextValue {
  settings:           CustomizeSettings;
  saveSettings:       (s: CustomizeSettings) => Promise<void>;
  effectiveTextColor: (isDark: boolean) => string;
}

const CustomizeContext = createContext<CustomizeContextValue>({
  settings:           DEFAULT_SETTINGS,
  saveSettings:       async () => {},
  effectiveTextColor: () => DEFAULT_SETTINGS.textColor,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CustomizeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CustomizeSettings>(DEFAULT_SETTINGS);
  const uidRef = useRef<string | null>(null);

  // Per-user AsyncStorage key
  const storageKey = (uid: string | null) =>
      uid ? `appCustomizeSettings_${uid}` : 'appCustomizeSettings_guest';

  // Load from AsyncStorage (instant, no flicker)
  const loadFromStorage = useCallback(async (uid: string | null) => {
    try {
      const raw = await AsyncStorage.getItem(storageKey(uid));
      if (raw) {
        const parsed: CustomizeSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        setSettings(parsed);
        return parsed;
      }
    } catch {}
    return null;
  }, []);

  // Load from Firestore (source of truth after login)
  const loadFromFirestore = useCallback(async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data?.customizeSettings) {
          const merged: CustomizeSettings = { ...DEFAULT_SETTINGS, ...data.customizeSettings };
          setSettings(merged);
          // Keep AsyncStorage in sync
          await AsyncStorage.setItem(storageKey(uid), JSON.stringify(merged));
          console.log('✅ Customize settings loaded from Firestore');
          return merged;
        }
      }
    } catch (e) {
      console.log('⚠️ Could not load customize settings from Firestore:', e);
    }
    return null;
  }, []);

  // Watch auth state — load settings for the right user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        uidRef.current = user.uid;
        // Remove the old shared key so it never bleeds into this user's session
        try { await AsyncStorage.removeItem('appCustomizeSettings'); } catch {}
        // 1. Load from AsyncStorage immediately (no flicker)
        await loadFromStorage(user.uid);
        // 2. Then override with Firestore (latest truth)
        await loadFromFirestore(user.uid);
      } else {
        // Logged out — reset to defaults
        uidRef.current = null;
        setSettings(DEFAULT_SETTINGS);
      }
    });
    return unsub;
  }, [loadFromStorage, loadFromFirestore]);

  // Save settings — AsyncStorage instantly, Firestore in background
  const saveSettings = useCallback(async (newSettings: CustomizeSettings) => {
    setSettings(newSettings);
    const uid = uidRef.current;

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(storageKey(uid), JSON.stringify(newSettings));
    } catch (e) {
      console.log('⚠️ AsyncStorage save failed:', e);
    }

    // Save to Firestore
    if (uid) {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { customizeSettings: newSettings });
        console.log('✅ Customize settings saved to Firestore');
      } catch {
        try {
          // Document might not exist yet
          await setDoc(doc(db, 'users', uid), { customizeSettings: newSettings }, { merge: true });
        } catch (e2) {
          console.log('⚠️ Firestore save failed:', e2);
        }
      }
    }
  }, []);

  // Dark-mode aware text color
  // - If user picked a custom color (textColorCustomized=true) → always use it
  // - If dark mode ON  → white #FFFFFF
  // - If dark mode OFF → dark  #1F2937
  const effectiveTextColor = useCallback((isDark: boolean): string => {
    if (settings.textColorCustomized) return settings.textColor;
    return isDark ? '#FFFFFF' : '#1F2937';
  }, [settings.textColor, settings.textColorCustomized]);

  return (
      <CustomizeContext.Provider value={{ settings, saveSettings, effectiveTextColor }}>
        {children}
      </CustomizeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCustomize() {
  return useContext(CustomizeContext);
}