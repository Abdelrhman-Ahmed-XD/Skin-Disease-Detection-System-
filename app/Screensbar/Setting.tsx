import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { signOut } from "firebase/auth";
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from "../../Firebase/firebaseConfig";
import { useTheme } from "../ThemeContext";

const { isDark, toggleTheme } = useTheme();
const STORAGE_KEY = 'signupDraft';

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>('Settings');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    // ── Profile data ──────────────────────────────────────────
    const [photoUri,     setPhotoUri]     = useState<string | null>(null);
    const [profileName,  setProfileName]  = useState('');
    const [profileEmail, setProfileEmail] = useState('');

    // ── Load profile على كل focus ─────────────────────────────
    useFocusEffect(
        React.useCallback(() => {
            setActiveTab('Settings');

            const loadProfile = async () => {
                try {
                    const saved = await AsyncStorage.getItem(STORAGE_KEY);
                    if (saved) {
                        const data = JSON.parse(saved);
                        setPhotoUri(data.photoUri || null);
                        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
                        setProfileName(fullName || 'No Name');
                        setProfileEmail(data.email || '');
                    }
                } catch (err) {
                    console.log('Settings load error:', err);
                }
            };
            loadProfile();
        }, [])
    );

    const handleLogout = async () => {
        try {
            await signOut(auth);
            await AsyncStorage.clear();
            setLogoutModalVisible(false);
            router.replace('/');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const bottomTabs = [
        { name: 'Home',     icon: 'home-outline' },
        { name: 'Reports',  icon: 'document-text-outline' },
        { name: 'History',  icon: 'time-outline' },
        { name: 'Settings', icon: 'settings-outline' },
        { name: 'Camera',   icon: 'camera-outline' },
    ];

    const handleTabPress = (tabName: string) => {
        setActiveTab(tabName);
        switch (tabName) {
            case 'Home':     router.push('/Screensbar/FirstHomePage'); break;
            case 'Camera':   router.push('/Screensbar/Camera');        break;
            case 'History':  router.push('/Screensbar/History');       break;
            case 'Reports':  router.push('/Screensbar/Reports');       break;
        }
    };

    type SettingsRowProps = {
        icon: string;
        iconColor?: string;
        label: string;
        onPress?: () => void;
        rightElement?: React.ReactNode;
        isLast?: boolean;
    };

    const SettingsRow: React.FC<SettingsRowProps> = ({
              icon,
              iconColor = '#004F7F',
              label,
              onPress,
              rightElement,
              isLast = false,
          }) => ( 
        <TouchableOpacity
            style={[styles.settingsRow, !isLast && styles.settingsRowBorder]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={[styles.settingsIconWrap, { backgroundColor: iconColor + '18' }]}>
                <Ionicons name={icon as any} size={20} color={iconColor} />
            </View>
            <Text style={styles.settingsLabel}>{label}</Text>
            {rightElement ?? (
                onPress ? <Ionicons name="chevron-forward" size={18} color="#C5E3ED" /> : null
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* ── Logout Modal ── */}
            <Modal
                transparent
                visible={logoutModalVisible}
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        {/* Icon */}
                        <View style={styles.modalIconWrap}>
                            <Ionicons name="log-out-outline" size={28} color="#E74C3C" />
                        </View>

                        {/* Text */}
                        <Text style={styles.modalTitle}>
                            Are you sure you want to{'\n'}logout from this account?
                        </Text>
                        <Text style={styles.modalEmail}>{profileEmail}</Text>

                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.stayButton}
                                onPress={() => setLogoutModalVisible(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.stayButtonText}>Stay</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={handleLogout}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.logoutButtonText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Profile Card ── */}
                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => router.push('/Settingsoptions/Editprofile')}
                    activeOpacity={0.8}
                >
                    <View style={styles.profileAvatar}>
                        {photoUri ? (
                            <Image
                                source={{ uri: photoUri }}
                                style={styles.profileAvatarImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={styles.profileAvatarText}>
                                {profileName ? profileName.charAt(0).toUpperCase() : '?'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{profileName || 'No Name'}</Text>
                        <Text style={styles.profileEmail}>{profileEmail || 'No Email'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#C5E3ED" />
                </TouchableOpacity>

                {/* Preferences Section */}
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.card}>
                    <SettingsRow
                        icon="notifications-outline"
                        label="Notifications"
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#E5E7EB', true: '#C5E3ED' }}
                                thumbColor={notificationsEnabled ? '#004F7F' : '#9CA3AF'}
                            />
                        }
                    />
                  <SettingsRow
  icon="moon-outline"
  label="Dark Mode"
  rightElement={
    <Switch
      value={isDark}
      onValueChange={toggleTheme}
      trackColor={{ false: '#E5E7EB', true: '#C5E3ED' }}
      thumbColor={isDark ? '#004F7F' : '#9CA3AF'}
    />
  }
/>
                    <SettingsRow
                        icon="color-palette-outline"
                        label="Customize"
                        onPress={() => router.push('/Settingsoptions/Customize')}
                        isLast
                    />
                </View>

                {/* App Section */}
                <Text style={styles.sectionTitle}>App</Text>
                <View style={styles.card}>
                    <SettingsRow
                        icon="information-circle-outline"
                        label="About"
                        onPress={() => router.push('/Settingsoptions/About')}
                    />
                    <SettingsRow
                        icon="help-circle-outline"
                        label="Help & Support"
                        onPress={() => router.push('/Settingsoptions/Help')}
                    />
                </View>

                {/* Logout */}
                <View style={styles.card}>
                    <SettingsRow
                        icon="log-out-outline"
                        iconColor="#E74C3C"
                        label="Log out"
                        onPress={() => setLogoutModalVisible(true)}
                        isLast
                    />
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNavContainer}>
                <View style={styles.bottomNav}>
                    {['Home', 'Reports'].map((tabName) => {
                        const tab = bottomTabs.find(t => t.name === tabName)!;
                        return (
                            <TouchableOpacity
                                key={tab.name}
                                style={styles.navItem}
                                onPress={() => handleTabPress(tab.name)}
                            >
                                <View style={[styles.navIcon, activeTab === tab.name && styles.navIconActive]}>
                                    <Ionicons
                                        name={tab.icon as any}
                                        size={26}
                                        color={activeTab === tab.name ? '#004F7F' : '#6B7280'}
                                    />
                                </View>
                                <Text style={[styles.navText, activeTab === tab.name && styles.navTextActive]}>
                                    {tab.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                    <View style={styles.navCenterSpacer} />
                    {['History', 'Settings'].map((tabName) => {
                        const tab = bottomTabs.find(t => t.name === tabName)!;
                        return (
                            <TouchableOpacity
                                key={tab.name}
                                style={styles.navItem}
                                onPress={() => handleTabPress(tab.name)}
                            >
                                <View style={[styles.navIcon, activeTab === tab.name && styles.navIconActive]}>
                                    <Ionicons
                                        name={tab.icon as any}
                                        size={26}
                                        color={activeTab === tab.name ? '#004F7F' : '#6B7280'}
                                    />
                                </View>
                                <Text style={[styles.navText, activeTab === tab.name && styles.navTextActive]}>
                                    {tab.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <TouchableOpacity
                    style={[styles.cameraButton, activeTab === 'Camera' && styles.cameraButtonActive]}
                    onPress={() => handleTabPress('Camera')}
                    activeOpacity={0.85}
                >
                    <Ionicons
                        name="camera-outline"
                        size={30}
                        color={activeTab === 'Camera' ? '#004F7F' : '#6B7280'}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D8E9F0',
    },

    // ── Logout Modal ──────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingVertical: 32,
        paddingHorizontal: 28,
        width: '82%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
    modalIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FDECEA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 8,
    },
    modalEmail: {
        fontSize: 14,
        fontWeight: '700',
        color: '#004F7F',
        textDecorationLine: 'underline',
        marginBottom: 28,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    stayButton: {
        flex: 1,
        backgroundColor: '#004F7F',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    stayButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    logoutButton: {
        flex: 1,
        backgroundColor: '#E74C3C',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        margin: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },

    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 110 },

    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    profileAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#C5E3ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        overflow: 'hidden',
    },
    profileAvatarImage: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    profileAvatarText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#004F7F',
    },
    profileInfo: { flex: 1 },
    profileName:  { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    profileEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
        marginLeft: 4,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },

    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    settingsRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    settingsIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    settingsLabel: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },

    bottomNavContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        width: '100%',
        paddingBottom: 16,
    },
    navCenterSpacer: { flex: 1 },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    navIconActive: {
        backgroundColor: '#E8F4F8',
        borderWidth: 2,
        borderColor: '#C5E3ED',
    },
    navText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
    navTextActive: { fontSize: 11, color: '#004F7F', fontWeight: '700' },
    cameraButton: {
        position: 'absolute',
        top: -26,
        alignSelf: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#C5E3ED',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 6,
    },
    cameraButtonActive: {
        borderColor: '#004F7F',
        backgroundColor: '#E8F4F8',
    },
});