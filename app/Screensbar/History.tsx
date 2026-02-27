import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

const MOLES_STORAGE_KEY = 'savedMoles';

type Mole = {
    id: string;
    x: number;
    y: number;
    timestamp: number;
    photoUri?: string;
    bodyView: 'front' | 'back';
    analysis?: string;
    label?: string; // e.g. "Right leg 1"
};

function getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `One month ago`;
    return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ago`;
}

export default function HistoryPage() {
    const router = useRouter();
    const [moles, setMoles] = useState<Mole[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('History');

    useFocusEffect(
        useCallback(() => {
            setActiveTab('History');
            loadMoles();
        }, [])
    );

    const loadMoles = async () => {
        setLoading(true);
        try {
            const saved = await AsyncStorage.getItem(MOLES_STORAGE_KEY);
            if (saved) {
                const allMoles: Mole[] = JSON.parse(saved);
                const withPhotos = allMoles.filter((m) => m.photoUri);
                // newest first
                withPhotos.sort((a, b) => b.timestamp - a.timestamp);
                setMoles(withPhotos);
            }
        } catch (err) {
            console.log('Error loading moles:', err);
        } finally {
            setLoading(false);
        }
    };

    const bottomTabs = [
        { name: 'Home', icon: 'home-outline' },
        { name: 'Reports', icon: 'document-text-outline' },
        { name: 'History', icon: 'time-outline' },
        { name: 'Settings', icon: 'settings-outline' },
        { name: 'Camera', icon: 'camera-outline' },
    ];

    const handleTabPress = (tabName: string) => {
        setActiveTab(tabName);
        switch (tabName) {
            case 'Home': router.push('/Screensbar/FirstHomePage'); break;
            case 'Camera': router.push('/Screensbar/Camera'); break;
            case 'Reports': router.push('/Screensbar/Reports'); break;
            case 'Settings': router.push('/Screensbar/Setting'); break;
        }
    };

    const getBodyLabel = (mole: Mole, index: number) => {
        if (mole.label) return mole.label;
        return mole.bodyView === 'front' ? `Front body ${index + 1}` : `Back body ${index + 1}`;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerTitleRow}>
                    <Text style={styles.headerTitle}>History</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#004F7F" />
                        <Text style={styles.loadingText}>Loading history...</Text>
                    </View>
                ) : moles.length === 0 ? (
                    <View style={styles.centered}>
                        <Ionicons name="time-outline" size={80} color="#C5E3ED" />
                        <Text style={styles.emptyTitle}>No History Yet</Text>
                        <Text style={styles.emptyText}>
                            Take photos of skin areas to track your history
                        </Text>
                    </View>
                ) : (
                    moles.map((mole, index) => (
                        <TouchableOpacity
                            key={mole.id}
                            style={styles.historyItem}
                            activeOpacity={0.75}
                            onPress={() =>
                                router.push({
                                    pathname: "/Screensbar/Reportdetails",
                                    params: {
                                        moleId: mole.id,
                                        photoUri: mole.photoUri,
                                        timestamp: mole.timestamp.toString(),
                                        bodyView: mole.bodyView,
                                        x: mole.x.toString(),
                                        y: mole.y.toString(),
                                        analysis: mole.analysis || '',
                                        reportIndex: index.toString(),
                                    },
                                })
                            }
                        >
                            {/* Thumbnail */}
                            <View style={styles.thumbnailWrapper}>
                                <Image
                                    source={{ uri: mole.photoUri }}
                                    style={styles.thumbnail}
                                    resizeMode="cover"
                                />
                            </View>

                            {/* Info */}
                            <View style={styles.infoBlock}>
                                <Text style={styles.itemTitle}>{getBodyLabel(mole, index)}</Text>
                                <Text style={styles.itemSub}>
                                    {mole.analysis
                                        ? mole.analysis.length > 40
                                            ? mole.analysis.slice(0, 40) + '…'
                                            : mole.analysis
                                        : 'No complaints'}
                                </Text>
                            </View>

                            {/* Date */}
                            <Text style={styles.itemDate}>{getRelativeTime(mole.timestamp)}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNavContainer}>
                <View style={styles.bottomNav}>
                    {['Home', 'Reports'].map((tabName) => {
                        const tab = bottomTabs.find((t) => t.name === tabName)!;
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
                        const tab = bottomTabs.find((t) => t.name === tabName)!;
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

                {/* Camera center button */}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
borderRadius:15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      elevation: 2,
        margin:15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    scrollView: { flex: 1 },
    scrollContent: {
        padding: 16,
        paddingBottom: 110,
    },
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },

    /* History item */
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    thumbnailWrapper: {
        width: 58,
        height: 58,
        borderRadius: 29,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
        borderWidth: 2,
        borderColor: '#C5E3ED',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    infoBlock: {
        flex: 1,
        marginLeft: 14,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    itemSub: {
        fontSize: 13,
        color: '#6B7280',
    },
    itemDate: {
        fontSize: 12,
        color: '#9CA3AF',
        marginLeft: 8,
        textAlign: 'right',
    },

    /* Bottom nav */
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
    navText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
    },
    navTextActive: {
        fontSize: 11,
        color: '#004F7F',
        fontWeight: '700',
    },
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