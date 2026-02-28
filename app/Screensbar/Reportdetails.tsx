import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { printToFileAsync } from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Dimensions, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';

const { height } = Dimensions.get('window');

export default function ReportDetailsPage() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const params = useLocalSearchParams();

    const moleId      = params.moleId as string;
    const photoUri    = params.photoUri as string;
    const timestamp   = parseInt(params.timestamp as string);
    const bodyView    = params.bodyView as string;
    const x           = parseFloat(params.x as string);
    const y           = parseFloat(params.y as string);
    const analysis    = params.analysis as string || 'Analysis in progress. The AI system is evaluating the skin area for any notable characteristics or concerns.';
    const reportIndex = parseInt(params.reportIndex as string);

    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getImageBase64 = async (uri: string): Promise<string> => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch { return uri; }
    };

    const downloadReport = async () => {
        try {
            const date = formatDate(timestamp);
            const imageBase64 = await getImageBase64(photoUri);
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;padding:40px;background:#f5f5f5}.container{background:white;padding:30px;border-radius:12px}.header{text-align:center;border-bottom:3px solid #004F7F;padding-bottom:20px;margin-bottom:30px}.header h1{color:#004F7F;font-size:28px}.image-section{text-align:center;margin:30px 0}.image-section img{max-width:80%;max-height:350px;height:auto;border-radius:8px;border:2px solid #E5E7EB}.info-section{background:#F9FAFB;padding:20px;border-radius:8px;margin:20px 0}.analysis-text{color:#4B5563;line-height:1.8;font-size:14px;padding:15px;background:#F9FAFB;border-radius:8px}.footer{margin-top:40px;text-align:center;color:#9CA3AF;font-size:12px;padding-top:20px;border-top:1px solid #E5E7EB}</style></head><body><div class="container"><div class="header"><h1>Skin Analysis Report</h1><p>Report #${reportIndex + 1}</p></div><div class="image-section"><img src="${imageBase64}" alt="Skin Analysis Photo"/></div><div class="info-section"><p><b>Date:</b> ${date}</p><p><b>Location:</b> ${bodyView === 'front' ? 'Front' : 'Back'} Body (x: ${x.toFixed(1)}, y: ${y.toFixed(1)})</p><p><b>Report ID:</b> ${moleId}</p></div><h2>Analysis Results</h2><div class="analysis-text">${analysis}</div><div class="footer"><p>This report was generated automatically. For medical advice, please consult a healthcare professional.</p></div></div></body></html>`;
            const { uri } = await printToFileAsync({ html, base64: false });
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow storage access to save PDF files.'); return; }
            const asset = await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.createAlbumAsync('Download', asset, false);
            Alert.alert('✓ Downloaded Successfully', `Report #${reportIndex + 1} has been saved to your Downloads folder.`, [{ text: 'OK' }]);
        } catch (error) {
            Alert.alert('Error', 'Failed to download the report. Please try again.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Report Details</Text>
                <TouchableOpacity style={[styles.downloadHeaderButton, { backgroundColor: isDark ? '#1A3040' : '#E8F4F8' }]} onPress={downloadReport}>
                    <Ionicons name="download-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.imageContainer}>
                    <Image source={{ uri: photoUri }} style={styles.mainImage} resizeMode="cover" />
                    <View style={styles.imageBadge}>
                        <Text style={styles.imageBadgeText}>{bodyView === 'front' ? 'Front' : 'Back'}</Text>
                    </View>
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.infoHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.reportNumber, { color: colors.primary }]}>Report #{reportIndex + 1}</Text>
                        <Text style={[styles.dateText, { color: colors.subText }]}>{formatDate(timestamp)}</Text>
                    </View>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={20} color={colors.primary} />
                            <View style={styles.infoTextContainer}>
                                <Text style={[styles.infoLabel, { color: colors.subText }]}>Location</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>{bodyView === 'front' ? 'Front' : 'Back'} Body</Text>
                            </View>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="navigate-outline" size={20} color={colors.primary} />
                            <View style={styles.infoTextContainer}>
                                <Text style={[styles.infoLabel, { color: colors.subText }]}>Coordinates</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>x: {x.toFixed(1)}, y: {y.toFixed(1)}</Text>
                            </View>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
                            <View style={styles.infoTextContainer}>
                                <Text style={[styles.infoLabel, { color: colors.subText }]}>Report ID</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>{moleId.substring(0, 12)}...</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.analysisCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.analysisHeader, { borderBottomColor: colors.border }]}>
                        <Ionicons name="document-text" size={24} color={colors.primary} />
                        <Text style={[styles.analysisTitle, { color: colors.text }]}>Analysis Results</Text>
                    </View>
                    <Text style={[styles.analysisText, { color: colors.subText }]}>{analysis}</Text>
                </View>

                <TouchableOpacity style={[styles.downloadButton, { backgroundColor: colors.primary }]} onPress={downloadReport} activeOpacity={0.8}>
                    <Ionicons name="cloud-download-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.downloadButtonText}>Download as PDF</Text>
                </TouchableOpacity>

                <View style={[styles.warningCard, { backgroundColor: isDark ? '#2D2000' : '#FEF3C7', borderColor: isDark ? '#5C4000' : '#FCD34D' }]}>
                    <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
                    <Text style={[styles.warningText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                        This is an automated analysis. For medical advice, please consult a healthcare professional.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:            { flex: 1 },
    header:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, margin: 15 },
    backButton:           { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    downloadHeaderButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    headerTitle:          { fontSize: 20, fontWeight: 'bold' },
    scrollView:           { flex: 1 },
    scrollContent:        { padding: 16, paddingBottom: 40 },
    imageContainer:       { position: 'relative', width: '100%', height: height * 0.45, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
    mainImage:            { width: '100%', height: '100%' },
    imageBadge:           { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,79,127,0.9)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
    imageBadgeText:       { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    infoCard:             { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    infoHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1 },
    reportNumber:         { fontSize: 20, fontWeight: '700' },
    dateText:             { fontSize: 13 },
    infoGrid:             { gap: 16 },
    infoItem:             { flexDirection: 'row', alignItems: 'center', gap: 12 },
    infoTextContainer:    { flex: 1 },
    infoLabel:            { fontSize: 12, marginBottom: 2 },
    infoValue:            { fontSize: 15, fontWeight: '600' },
    analysisCard:         { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    analysisHeader:       { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1 },
    analysisTitle:        { fontSize: 18, fontWeight: '700' },
    analysisText:         { fontSize: 15, lineHeight: 24 },
    downloadButton:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, marginBottom: 16, gap: 10 },
    downloadButtonText:   { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
    warningCard:          { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, gap: 12, borderWidth: 1 },
    warningText:          { flex: 1, fontSize: 13, lineHeight: 18 },
});