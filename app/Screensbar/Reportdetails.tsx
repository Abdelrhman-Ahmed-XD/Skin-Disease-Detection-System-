import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { printToFileAsync } from 'expo-print';
import * as MediaLibrary from 'expo-media-library';

const { height } = Dimensions.get('window');

export default function ReportDetailsPage() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const moleId = params.moleId as string;
    const photoUri = params.photoUri as string;
    const timestamp = parseInt(params.timestamp as string);
    const bodyView = params.bodyView as string;
    const x = parseFloat(params.x as string);
    const y = parseFloat(params.y as string);
    const analysis = params.analysis as string || 'Analysis in progress. The AI system is evaluating the skin area for any notable characteristics or concerns.';
    const reportIndex = parseInt(params.reportIndex as string);

    const formatDate = (ts: number) => {
        const date = new Date(ts);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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
        } catch (error) {
            console.error('Error converting image:', error);
            return uri;
        }
    };

    const downloadReport = async () => {
        try {
            const date = formatDate(timestamp);
            const imageBase64 = await getImageBase64(photoUri);

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #004F7F;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 { color: #004F7F; font-size: 28px; }
        .header p { color: #6B7280; margin-top: 5px; font-size: 14px; }
        .image-section { text-align: center; margin: 30px 0; }
        .image-section img {
            max-width: 80%;
            max-height: 350px;
            height: auto;
            border-radius: 8px;
            border: 2px solid #E5E7EB;
        }
        .info-section {
            background: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #E5E7EB;
        }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 600; color: #374151; }
        .info-value { color: #6B7280; }
        .analysis-section { margin-top: 30px; }
        .analysis-section h2 {
            color: #1F2937;
            font-size: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #004F7F;
            padding-left: 12px;
        }
        .analysis-text {
            color: #4B5563;
            line-height: 1.8;
            font-size: 14px;
            padding: 15px;
            background: #F9FAFB;
            border-radius: 8px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #9CA3AF;
            font-size: 12px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Skin Analysis Report</h1>
            <p>Report #${reportIndex + 1}</p>
        </div>
        <div class="image-section">
            <img src="${imageBase64}" alt="Skin Analysis Photo" />
        </div>
        <div class="info-section">
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${date}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${bodyView === 'front' ? 'Front' : 'Back'} Body (x: ${x.toFixed(1)}, y: ${y.toFixed(1)})</span>
            </div>
            <div class="info-row">
                <span class="info-label">Report ID:</span>
                <span class="info-value">${moleId}</span>
            </div>
        </div>
        <div class="analysis-section">
            <h2>Analysis Results</h2>
            <div class="analysis-text">${analysis}</div>
        </div>
        <div class="footer">
            <p>This report was generated automatically. For medical advice, please consult a healthcare professional.</p>
        </div>
    </div>
</body>
</html>`;

            // إنشاء الـ PDF
            const { uri } = await printToFileAsync({ html, base64: false });

            // طلب صلاحية الحفظ
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow storage access to save PDF files.');
                return;
            }

            // حفظ في الـ Downloads
            const asset = await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.createAlbumAsync('Download', asset, false);

            Alert.alert(
                '✓ Downloaded Successfully',
                `Report #${reportIndex + 1} has been saved to your Downloads folder.`,
                [{ text: 'OK' }]
            );

        } catch (error) {
            console.error('Error downloading report:', error);
            Alert.alert('Error', 'Failed to download the report. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#D8E9F0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Report Details</Text>
                <TouchableOpacity
                    style={styles.downloadHeaderButton}
                    onPress={downloadReport}
                >
                    <Ionicons name="download-outline" size={24} color="#004F7F" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* الصورة الكبيرة */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: photoUri }}
                        style={styles.mainImage}
                        resizeMode="cover"
                    />
                    <View style={styles.imageBadge}>
                        <Text style={styles.imageBadgeText}>
                            {bodyView === 'front' ? 'Front' : 'Back'}
                        </Text>
                    </View>
                </View>

                {/* معلومات التقرير */}
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <Text style={styles.reportNumber}>Report #{reportIndex + 1}</Text>
                        <Text style={styles.dateText}>{formatDate(timestamp)}</Text>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={20} color="#004F7F" />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Location</Text>
                                <Text style={styles.infoValue}>
                                    {bodyView === 'front' ? 'Front' : 'Back'} Body
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="navigate-outline" size={20} color="#004F7F" />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Coordinates</Text>
                                <Text style={styles.infoValue}>
                                    x: {x.toFixed(1)}, y: {y.toFixed(1)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="finger-print-outline" size={20} color="#004F7F" />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Report ID</Text>
                                <Text style={styles.infoValue}>{moleId.substring(0, 12)}...</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* التشخيص */}
                <View style={styles.analysisCard}>
                    <View style={styles.analysisHeader}>
                        <Ionicons name="document-text" size={24} color="#004F7F" />
                        <Text style={styles.analysisTitle}>Analysis Results</Text>
                    </View>
                    <Text style={styles.analysisText}>{analysis}</Text>
                </View>

                {/* زر التحميل */}
                <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={downloadReport}
                    activeOpacity={0.8}
                >
                    <Ionicons name="cloud-download-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.downloadButtonText}>Download as PDF</Text>
                </TouchableOpacity>

                {/* تحذير */}
                <View style={styles.warningCard}>
                    <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
                    <Text style={styles.warningText}>
                        This is an automated analysis. For medical advice, please consult a healthcare professional.
                    </Text>
                </View>
            </ScrollView>
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
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadHeaderButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#E8F4F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: height * 0.45,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    imageBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0, 79, 127, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    imageBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    infoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    reportNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#004F7F',
    },
    dateText: {
        fontSize: 13,
        color: '#6B7280',
    },
    infoGrid: {
        gap: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '600',
    },
    analysisCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    analysisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    analysisTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    analysisText: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 24,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#004F7F',
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
        gap: 10,
    },
    downloadButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    warningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#92400E',
        lineHeight: 18,
    },
});