import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { useFocusEffect, useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomize } from '../Customize/Customizecontext';
import { useTheme } from '../ThemeContext';

const MOLES_STORAGE_KEY = 'savedMoles';
const { width } = Dimensions.get('window');

type Mole = {
    id: string; x: number; y: number; timestamp: number;
    photoUri?: string; bodyView: 'front' | 'back'; analysis?: string;
};

export default function ReportsPage() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { settings } = useCustomize();

    const customText = {
        fontSize:   settings.fontSize,
        color:      settings.textColor,
        fontFamily: settings.fontFamily === 'System' ? undefined : settings.fontFamily,
    };
    const customBg = { backgroundColor: isDark ? colors.background : settings.backgroundColor };

    const [moles, setMoles]               = useState<Mole[]>([]);
    const [loading, setLoading]           = useState(true);
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [activeTab, setActiveTab]       = useState<string>('Reports');

    useEffect(() => { loadMoles(); }, []);

    useFocusEffect(
        React.useCallback(() => {
            setActiveTab('Reports');
            loadMoles();
        }, [])
    );

    const loadMoles = async () => {
        try {
            const saved = await AsyncStorage.getItem(MOLES_STORAGE_KEY);
            if (saved) {
                const allMoles = JSON.parse(saved);
                setMoles(allMoles.filter((m: Mole) => m.photoUri));
            }
        } catch (err) {
            console.log('Error loading moles:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadSingleReport = async (mole: Mole, index: number) => {
        try {
            if (!mole.photoUri) return;
            const date = new Date(mole.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const analysis = mole.analysis || 'Analysis in progress.';
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;padding:40px;background:#f5f5f5}.container{background:white;padding:30px;border-radius:12px}.header{text-align:center;border-bottom:3px solid #004F7F;padding-bottom:20px;margin-bottom:30px}.header h1{color:#004F7F;font-size:28px}.image-section{text-align:center;margin:30px 0}.image-section img{max-width:100%;height:auto;border-radius:8px}.info-section{background:#F9FAFB;padding:20px;border-radius:8px;margin:20px 0}.analysis-text{color:#4B5563;line-height:1.6;font-size:14px;padding:15px;background:#F9FAFB;border-radius:8px}</style></head><body><div class="container"><div class="header"><h1>Skin Analysis Report</h1><p>Report #${index + 1}</p></div><div class="image-section"><img src="${mole.photoUri}" alt="Skin"/></div><div class="info-section"><p><b>Date:</b> ${date}</p><p><b>Location:</b> ${mole.bodyView === 'front' ? 'Front' : 'Back'} Body</p><p><b>Report ID:</b> ${mole.id}</p></div><h2>Analysis</h2><div class="analysis-text">${analysis}</div></div></body></html>`;
            const { uri } = await Print.printToFileAsync({ html });
            await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Download Report' });
        } catch (error) {
            Alert.alert('Error', 'Failed to download report');
        }
    };

    const downloadAllReports = async () => {
        try {
            setDownloadingAll(true);
            if (moles.length === 0) { Alert.alert('No Reports', 'There are no reports to download'); return; }
            let reportsHtml = '';
            moles.forEach((mole, index) => {
                const date = new Date(mole.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                const analysis = mole.analysis || 'Analysis in progress.';
                reportsHtml += `<div class="report-card" ${index < moles.length - 1 ? 'style="page-break-after:always"' : ''}><h2>Report #${index + 1}</h2><p>${date}</p><img src="${mole.photoUri}" style="max-width:100%"/><p><b>Location:</b> ${mole.bodyView}</p><p>${analysis}</p></div>`;
            });
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;padding:30px}.report-card{background:white;padding:30px;margin-bottom:30px;border-radius:12px}img{max-width:100%;height:auto;border-radius:8px}</style></head><body>${reportsHtml}</body></html>`;
            const { uri } = await Print.printToFileAsync({ html });
            await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Download All Reports' });
        } catch (error) {
            Alert.alert('Error', 'Failed to download reports');
        } finally {
            setDownloadingAll(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            case 'Settings': router.push('/Screensbar/Setting');       break;
        }
    };

    return (
        <SafeAreaView style={[styles.container, customBg]} edges={['top']}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={isDark ? colors.background : settings.backgroundColor} />

            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, customText, { color: colors.text }]}>Reports</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, customText, { color: colors.subText }]}>Loading reports...</Text>
                    </View>
                ) : moles.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={80} color={isDark ? '#374151' : '#C5E3ED'} />
                        <Text style={[styles.emptyTitle, customText]}>No Reports Yet</Text>
                        <Text style={[styles.emptyText, customText, { color: colors.subText }]}>Take photos of skin areas to generate reports</Text>
                    </View>
                ) : (
                    <>
                        {moles.map((mole, index) => (
                            <View key={mole.id} style={[styles.reportCard, { backgroundColor: colors.card }]}>
                                <TouchableOpacity
                                    style={styles.imageContainer}
                                    onPress={() => router.push({ pathname: "/Screensbar/Reportdetails", params: { moleId: mole.id, photoUri: mole.photoUri, timestamp: mole.timestamp.toString(), bodyView: mole.bodyView, x: mole.x.toString(), y: mole.y.toString(), analysis: mole.analysis || '', reportIndex: index.toString() } })}
                                    activeOpacity={0.9}
                                >
                                    <Image source={{ uri: mole.photoUri }} style={styles.reportImage} resizeMode="cover" />
                                    <View style={styles.imageBadge}>
                                        <Text style={styles.imageBadgeText}>{mole.bodyView === 'front' ? 'Front' : 'Back'}</Text>
                                    </View>
                                    <View style={styles.expandIcon}>
                                        <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.reportContent}>
                                    <View style={styles.reportHeader}>
                                        <Text style={[styles.reportTitle, customText, { color: colors.text }]}>Report #{index + 1}</Text>
                                        <Text style={[styles.reportDate, customText, { color: colors.subText, fontSize: Math.max(11, settings.fontSize - 3) }]}>{formatDate(mole.timestamp)}</Text>
                                    </View>
                                    <Text style={[styles.reportText, customText, { color: colors.subText }]}>
                                        {mole.analysis || 'Analysis in progress. The AI system is evaluating the skin area.'}
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.downloadButton, { backgroundColor: isDark ? '#1E3A4A' : '#E8F4F8', borderColor: isDark ? '#374151' : '#C5E3ED' }]}
                                        onPress={() => downloadSingleReport(mole, index)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="download-outline" size={18} color={colors.primary} />
                                        <Text style={[styles.downloadButtonText, { color: colors.primary }]}>Download PDF</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.downloadAllButton, { backgroundColor: colors.primary }]}
                            onPress={downloadAllReports}
                            disabled={downloadingAll}
                            activeOpacity={0.8}
                        >
                            {downloadingAll ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="cloud-download-outline" size={22} color="#FFFFFF" />
                                    <Text style={styles.downloadAllText}>Download All as PDF</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            <View style={styles.bottomNavContainer}>
                <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.border }]}>
                    {['Home', 'Reports'].map((tabName) => {
                        const tab = bottomTabs.find(t => t.name === tabName)!;
                        return (
                            <TouchableOpacity key={tab.name} style={styles.navItem} onPress={() => handleTabPress(tab.name)}>
                                <View style={[styles.navIcon, { backgroundColor: isDark ? '#152030' : '#F9FAFB' }, activeTab === tab.name && { backgroundColor: isDark ? '#1E3A4A' : '#E8F4F8', borderWidth: 2, borderColor: isDark ? '#374151' : '#C5E3ED' }]}>
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
                                <View style={[styles.navIcon, { backgroundColor: isDark ? '#152030' : '#F9FAFB' }, activeTab === tab.name && { backgroundColor: isDark ? '#1E3A4A' : '#E8F4F8', borderWidth: 2, borderColor: isDark ? '#374151' : '#C5E3ED' }]}>
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
    container:         { flex: 1 },
    header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, margin: 15 },
    backButton:        { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    headerTitle:       { fontSize:22, fontWeight: 'bold' },
    scrollView:        { flex: 1 },
    scrollContent:     { padding: 16, paddingBottom: 100 },
    loadingContainer:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
    loadingText:       { marginTop: 12, fontSize: 16 },
    emptyContainer:    { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
    emptyTitle:        { fontSize: 20, fontWeight: '700', marginTop: 16 },
    emptyText:         { fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
    reportCard:        { borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    imageContainer:    { position: 'relative', width: '100%', height: 200 },
    reportImage:       { width: '100%', height: '100%' },
    imageBadge:        { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,79,127,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    imageBadgeText:    { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    expandIcon:        { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,79,127,0.8)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    reportContent:     { padding: 16 },
    reportHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    reportTitle:       { fontSize: 18, fontWeight: '700' },
    reportDate:        { fontSize: 12 },
    reportText:        { fontSize: 14, lineHeight: 20, marginBottom: 16 },
    downloadButton:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, alignSelf: 'flex-end' },
    downloadButtonText:{ fontSize: 14, fontWeight: '600', marginLeft: 6 },
    downloadAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,marginBottom:25 },
    downloadAllText:   { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginLeft: 8 },
    bottomNavContainer:{ position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' },
    bottomNav:         { flexDirection: 'row', paddingVertical: 10, borderTopWidth: 1, width: '100%', paddingBottom: 16,borderTopLeftRadius:20,borderTopRightRadius:20 },
    navCenterSpacer:   { flex: 1 },
    navItem:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
    navIcon:           { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    navText:           { fontSize: 11, fontWeight: '500' },
    cameraButton:      { position: 'absolute', top: -26, alignSelf: 'center', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 6 },
});