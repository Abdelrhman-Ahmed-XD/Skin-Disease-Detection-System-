import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';

const MOLES_STORAGE_KEY = 'savedMoles';
const { width } = Dimensions.get('window');

type Mole = {
    id: string;
    x: number;
    y: number;
    timestamp: number;
    photoUri?: string;
    bodyView: 'front' | 'back';
};

export default function History() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [moles, setMoles]         = useState<Mole[]>([]);
    const [activeTab, setActiveTab] = useState<string>('History');

    const bottomTabs = [
        { name: 'Home',     icon: 'home-outline' },
        { name: 'Reports',  icon: 'document-text-outline' },
        { name: 'History',  icon: 'time-outline' },
        { name: 'Settings', icon: 'settings-outline' },
        { name: 'Camera',   icon: 'camera-outline' },
    ];

    // ✅ FIX: استخدام router.replace بدل router.push للـ tabs
    const handleTabPress = (tabName: string) => {
        setActiveTab(tabName);
        switch (tabName) {
            case 'Home':     router.replace('/');                          break;
            case 'Camera':   router.push('/Screensbar/Camera');            break;
            case 'Reports':  router.replace('/Screensbar/Reports');        break;
            case 'Settings': router.replace('/Screensbar/Setting');        break;
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            setActiveTab('History');
            const loadMoles = async () => {
                try {
                    const saved = await AsyncStorage.getItem(MOLES_STORAGE_KEY);
                    if (saved) setMoles(JSON.parse(saved));
                    else setMoles([]);
                } catch (err) {
                    console.log('Error loading moles:', err);
                }
            };
            loadMoles();
        }, [])
    );

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderMole = ({ item }: { item: Mole }) => (
        <TouchableOpacity
            style={[styles.moleCard, { backgroundColor: colors.card }]}
            onPress={() => router.push({
                pathname: '/Screensbar/Camera',
                params: { tapX: item.x.toFixed(2), tapY: item.y.toFixed(2), bodyView: item.bodyView, moleId: item.id, existingPhotoUri: item.photoUri || '' }
            })}
            activeOpacity={0.8}
        >
            <View style={styles.moleCardContent}>
                {item.photoUri ? (
                    <Image source={{ uri: item.photoUri }} style={styles.moleThumbnail} />
                ) : (
                    <View style={[styles.molePlaceholder, { backgroundColor: isDark ? '#1E3A4A' : '#E8F4F8' }]}>
                        <Ionicons name="scan-outline" size={24} color={colors.primary} />
                    </View>
                )}
                <View style={styles.moleInfo}>
                    <Text style={[styles.moleTitle, { color: colors.text }]}>
                        Mole — {item.bodyView === 'front' ? 'Front' : 'Back'}
                    </Text>
                    <Text style={[styles.moleDate, { color: colors.subText }]}>
                        {formatDate(item.timestamp)}
                    </Text>
                    <View style={[styles.moleBadge, { backgroundColor: isDark ? '#1E3A4A' : '#E8F4F8' }]}>
                        <Text style={[styles.moleBadgeText, { color: colors.primary }]}>
                            {item.bodyView === 'front' ? '🫀 Front Body' : '🔙 Back Body'}
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color={colors.subText} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                        <Ionicons name="arrow-back-outline" size={26} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>History</Text>
                    <View style={{ width: 36 }} />
                </View>
            </View>

            {/* List */}
            {moles.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="time-outline" size={60} color={colors.subText} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No History Yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
                        Tap on the body map to add your first mole check
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={[...moles].sort((a, b) => b.timestamp - a.timestamp)}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMole}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Bottom Nav */}
            <View style={styles.bottomNavContainer}>
                <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.border }]}>
                    {['Home', 'Reports'].map((tabName) => {
                        const tab = bottomTabs.find(t => t.name === tabName)!;
                        return (
                            <TouchableOpacity key={tab.name} style={styles.navItem} onPress={() => handleTabPress(tab.name)}>
                                <View style={[
                                    styles.navIcon,
                                    { backgroundColor: isDark ? '#152030' : '#F9FAFB' },
                                    activeTab === tab.name && { backgroundColor: isDark ? '#1E3A4A' : '#E8F4F8', borderWidth: 2, borderColor: isDark ? '#374151' : '#C5E3ED' }
                                ]}>
                                    <Ionicons name={tab.icon as any} size={26} color={activeTab === tab.name ? colors.navActive : colors.navText} />
                                </View>
                                <Text style={[
                                    styles.navText,
                                    { color: activeTab === tab.name ? colors.navActive : colors.navText },
                                    activeTab === tab.name && { fontWeight: '700' }
                                ]}>
                                    {tab.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                    <View style={styles.navCenterSpacer} />
                    {['History', 'Settings'].map((tabName) => {
                        const tab = bottomTabs.find(t => t.name === tabName)!;
                        return (
                            <TouchableOpacity key={tab.name} style={styles.navItem} onPress={() => handleTabPress(tab.name)}>
                                <View style={[
                                    styles.navIcon,
                                    { backgroundColor: isDark ? '#152030' : '#F9FAFB' },
                                    activeTab === tab.name && { backgroundColor: isDark ? '#1E3A4A' : '#E8F4F8', borderWidth: 2, borderColor: isDark ? '#374151' : '#C5E3ED' }
                                ]}>
                                    <Ionicons name={tab.icon as any} size={26} color={activeTab === tab.name ? colors.navActive : colors.navText} />
                                </View>
                                <Text style={[
                                    styles.navText,
                                    { color: activeTab === tab.name ? colors.navActive : colors.navText },
                                    activeTab === tab.name && { fontWeight: '700' }
                                ]}>
                                    {tab.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <TouchableOpacity
                    style={[
                        styles.cameraButton,
                        { backgroundColor: colors.navBg, borderColor: isDark ? '#374151' : '#C5E3ED' },
                        activeTab === 'Camera' && { borderColor: colors.navActive, backgroundColor: isDark ? '#1E3A4A' : '#E8F4F8' }
                    ]}
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
    container:           { flex: 1 },
    headerCard:          { marginHorizontal: 16, marginTop: 12, marginBottom: 8, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    headerContent:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backButton:          { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    headerTitle:         { fontSize: 20, fontWeight: '700', textAlign: 'center' },
    listContent:         { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 },
    moleCard:            { borderRadius: 16, marginBottom: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
    moleCardContent:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
    moleThumbnail:       { width: 60, height: 60, borderRadius: 12, backgroundColor: '#ccc' },
    molePlaceholder:     { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    moleInfo:            { flex: 1, gap: 4 },
    moleTitle:           { fontSize: 15, fontWeight: '600' },
    moleDate:            { fontSize: 12 },
    moleBadge:           { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 2 },
    moleBadgeText:       { fontSize: 11, fontWeight: '600' },
    emptyContainer:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingBottom: 100 },
    emptyTitle:          { fontSize: 20, fontWeight: '700' },
    emptySubtitle:       { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
    bottomNavContainer:  { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' },
    bottomNav:           { flexDirection: 'row', paddingVertical: 10, borderTopWidth: 1, width: '100%', paddingBottom: 16 },
    navCenterSpacer:     { flex: 1 },
    navItem:             { flex: 1, alignItems: 'center', justifyContent: 'center' },
    navIcon:             { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    navText:             { fontSize: 11, fontWeight: '500' },
    cameraButton:        { position: 'absolute', top: -26, alignSelf: 'center', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 6 },
});