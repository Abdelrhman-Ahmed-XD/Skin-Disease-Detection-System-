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
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from "../../Firebase/firebaseConfig";
import { NOTIFICATIONS_ENABLED_KEY } from '../Screensbar/notificationsData';
import { useTheme } from "../ThemeContext";

const STORAGE_KEY = 'signupDraft';

export default function SettingsPage() {
    const router = useRouter();
    const { isDark, toggleTheme, colors } = useTheme();
    const [activeTab, setActiveTab]                       = useState<string>('Settings');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [logoutModalVisible, setLogoutModalVisible]     = useState(false);

    const [photoUri,     setPhotoUri]     = useState<string | null>(null);
    const [profileName,  setProfileName]  = useState('');
    const [profileEmail, setProfileEmail] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            setActiveTab('Settings');
            const loadData = async () => {
                try {
                    const saved = await AsyncStorage.getItem(STORAGE_KEY);
                    if (saved) {
                        const data = JSON.parse(saved);
                        setPhotoUri(data.photoUri || null);
                        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
                        setProfileName(fullName || 'No Name');
                        setProfileEmail(data.email || '');
                    }
                    const notifSetting = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
                    setNotificationsEnabled(notifSetting === null ? true : notifSetting === 'true');
                } catch (err) {
                    console.log('Settings load error:', err);
                }
            };
            loadData();
        }, [])
    );

    const handleNotificationsToggle = async (value: boolean) => {
        setNotificationsEnabled(value);
        try {
            await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, value.toString());
        } catch (err) {
            console.log('Error saving notifications setting:', err);
        }
    };

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
        icon, iconColor = colors.primary, label, onPress, rightElement, isLast = false,
    }) => (
        <TouchableOpacity
            style={[styles.settingsRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={[styles.settingsIconWrap, { backgroundColor: iconColor + '22' }]}>
                <Ionicons name={icon as any} size={20} color={iconColor} />
            </View>
            <Text style={[styles.settingsLabel, { color: colors.text }]}>{label}</Text>
            {rightElement ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.border} /> : null)}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

            {/* Logout Modal */}
            <Modal
                transparent
                visible={logoutModalVisible}
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
                        <View style={styles.modalIconWrap}>
                            <Ionicons name="log-out-outline" size={28} color="#E74C3C" />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Are you sure you want to{'\n'}logout from this account?
                        </Text>
                        <Text style={styles.modalEmail}>{profileEmail}</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.stayButton, { backgroundColor: colors.primary }]} onPress={() => setLogoutModalVisible(false)} activeOpacity={0.8}>
                                <Text style={styles.stayButtonText}>Stay</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                                <Text style={styles.logoutButtonText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Card */}
                <TouchableOpacity
                    style={[styles.profileCard, { backgroundColor: colors.card }]}
                    onPress={() => router.push('/Settingsoptions/Editprofile')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.profileAvatar, { backgroundColor: isDark ? '#2A3F50' : '#C5E3ED' }]}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.profileAvatarImage} resizeMode="cover" />
                        ) : (
                            <Text style={[styles.profileAvatarText, { color: colors.primary }]}>
                                {profileName ? profileName.charAt(0).toUpperCase() : '?'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: colors.text }]}>{profileName || 'No Name'}</Text>
                        <Text style={[styles.profileEmail, { color: colors.subText }]}>{profileEmail || 'No Email'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.subText} />
                </TouchableOpacity>

                {/* Preferences Section */}
                <Text style={[styles.sectionTitle, { color: colors.subText }]}>Preferences</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <SettingsRow
                        icon="notifications-outline"
                        label="Notifications"
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleNotificationsToggle}
                                trackColor={{ false: colors.border, true: '#C5E3ED' }}
                                thumbColor={notificationsEnabled ? colors.primary : colors.subText}
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
                                trackColor={{ false: colors.border, true: '#C5E3ED' }}
                                thumbColor={isDark ? colors.primary : colors.subText}
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
                <Text style={[styles.sectionTitle, { color: colors.subText }]}>App</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <SettingsRow
                        icon="information-circle-outline"
                        label="About"
                        onPress={() => router.push('/Settingsoptions/About')}
                    />
                    <SettingsRow
                        icon="help-circle-outline"
                        label="Help & Support"
                        onPress={() => router.push('/Settingsoptions/Help')}
                        isLast
                    />
                </View>

                {/* Logout */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
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
                <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.border }]}>
                    {['Home', 'Reports'].map((tabName) => {
                        const tab = bottomTabs.find(t => t.name === tabName)!;
                        return (
                            <TouchableOpacity key={tab.name} style={styles.navItem} onPress={() => handleTabPress(tab.name)}>
                                <View style={[styles.navIcon, activeTab === tab.name && { backgroundColor: isDark ? '#1E3A4A' : '#E8F4F8', borderWidth: 2, borderColor: isDark ? '#374151' : '#C5E3ED' }]}>
                                    <Ionicons name={tab.icon as any} size={26} color={activeTab === tab.name ? colors.navActive : colors.navText} />
                                </View>
                                <Text style={[styles.navText, { color: activeTab === tab.name ? colors.navActive : colors.navText }, activeTab === tab.name && { fontWeight: '700' }]}>{tab.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                    <View style={styles.navCenterSpacer} />
                    {['History', 'Settings'].map((tabName) => {
                        const tab = bottomTabs.find(t => t.name === tabName)!;
                        return (
                            <TouchableOpacity key={tab.name} style={styles.navItem} onPress={() => handleTabPress(tab.name)}>
                                <View style={[styles.navIcon, activeTab === tab.name && { backgroundColor: isDark ? '#1E3A4A' : '#E8F4F8', borderWidth: 2, borderColor: isDark ? '#374151' : '#C5E3ED' }]}>
                                    <Ionicons name={tab.icon as any} size={26} color={activeTab === tab.name ? colors.navActive : colors.navText} />
                                </View>
                                <Text style={[styles.navText, { color: activeTab === tab.name ? colors.navActive : colors.navText }, activeTab === tab.name && { fontWeight: '700' }]}>{tab.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <TouchableOpacity
                    style={[styles.cameraButton, { backgroundColor: colors.navBg, borderColor: isDark ? '#374151' : '#C5E3ED' }, activeTab === 'Camera' && { borderColor: colors.navActive, backgroundColor: isDark ? '#1E3A4A' : '#E8F4F8' }]}
                    onPress={() => handleTabPress('Camera')}
                    activeOpacity={0.85}
                >
                    <Ionicons name="camera-outline" size={30} color={activeTab === 'Camera' ? colors.navActive : colors.navText} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:       { flex: 1 },
    modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
    modalBox:        { borderRadius: 24, paddingVertical: 32, paddingHorizontal: 28, width: '82%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10 },
    modalIconWrap:   { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FDECEA', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    modalTitle:      { fontSize: 16, fontWeight: '600', textAlign: 'center', lineHeight: 24, marginBottom: 8 },
    modalEmail:      { fontSize: 14, fontWeight: '700', color: '#004F7F', textDecorationLine: 'underline', marginBottom: 28 },
    modalButtons:    { flexDirection: 'row', gap: 12, width: '100%' },
    stayButton:      { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    stayButtonText:  { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    logoutButton:    { flex: 1, backgroundColor: '#E74C3C', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    logoutButtonText:{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, margin: 15 },
    backButton:      { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    headerTitle:     { fontSize: 20, fontWeight: 'bold' },
    scrollView:      { flex: 1 },
    scrollContent:   { padding: 16, paddingBottom: 110 },
    profileCard:     { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    profileAvatar:   { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: 14, overflow: 'hidden' },
    profileAvatarImage: { width: 52, height: 52, borderRadius: 26 },
    profileAvatarText:  { fontSize: 22, fontWeight: '700' },
    profileInfo:     { flex: 1 },
    profileName:     { fontSize: 16, fontWeight: '700' },
    profileEmail:    { fontSize: 13, marginTop: 2 },
    sectionTitle:    { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
    card:            { borderRadius: 16, marginBottom: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    settingsRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    settingsIconWrap:{ width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    settingsLabel:   { flex: 1, fontSize: 15, fontWeight: '500' },
    bottomNavContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' },
    bottomNav:       { flexDirection: 'row', paddingVertical: 10, borderTopWidth: 1, width: '100%', paddingBottom: 16 },
    navCenterSpacer: { flex: 1 },
    navItem:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
    navIcon:         { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    navText:         { fontSize: 11, fontWeight: '500' },
    cameraButton:    { position: 'absolute', top: -26, alignSelf: 'center', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 6 },
});