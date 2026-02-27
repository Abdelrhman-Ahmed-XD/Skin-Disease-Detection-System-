import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

const MOLES_STORAGE_KEY = 'savedMoles';
const { width } = Dimensions.get('window');

type Mole = {
    id: string;
    x: number;
    y: number;
    timestamp: number;
    photoUri?: string;
    bodyView: 'front' | 'back';
    analysis?: string;
};

export default function ReportsPage() {
    const router = useRouter();
    const [moles, setMoles] = useState<Mole[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('Reports');

    useEffect(() => {
        loadMoles();
    }, []);

    // ✅ تحديث activeTab عند الرجوع للصفحة
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
                // فقط الصور اللي عندها photoUri
                const molesWithPhotos = allMoles.filter((m: Mole) => m.photoUri);
                setMoles(molesWithPhotos);
            }
        } catch (err) {
            console.log('Error loading moles:', err);
        } finally {
            setLoading(false);
        }
    };

    // تحميل تقرير واحد كـ PDF
    const downloadSingleReport = async (mole: Mole, index: number) => {
        try {
            if (!mole.photoUri) return;

            const date = new Date(mole.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            const analysis = mole.analysis || 'Analysis in progress. The AI system is evaluating the skin area for any notable characteristics or concerns.';

            // إنشاء HTML للـ PDF
            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
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
        .header h1 {
            color: #004F7F;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #6B7280;
            margin: 5px 0 0 0;
            font-size: 14px;
        }
        .image-section {
            text-align: center;
            margin: 30px 0;
        }
        .image-section img {
            max-width: 100%;
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
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #E5E7EB;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            color: #6B7280;
        }
        .analysis-section {
            margin-top: 30px;
        }
        .analysis-section h2 {
            color: #1F2937;
            font-size: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #004F7F;
            padding-left: 12px;
        }
        .analysis-text {
            color: #4B5563;
            line-height: 1.6;
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
            <p>Report #${index + 1}</p>
        </div>

        <div class="image-section">
            <img src="${mole.photoUri}" alt="Skin Analysis Photo" />
        </div>

        <div class="info-section">
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${date}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${mole.bodyView === 'front' ? 'Front' : 'Back'} Body (x: ${mole.x.toFixed(1)}, y: ${mole.y.toFixed(1)})</span>
            </div>
            <div class="info-row">
                <span class="info-label">Report ID:</span>
                <span class="info-value">${mole.id}</span>
            </div>
        </div>

        <div class="analysis-section">
            <h2>Analysis Results</h2>
            <div class="analysis-text">
                ${analysis}
            </div>
        </div>

        <div class="footer">
            <p>This report was generated automatically. For medical advice, please consult a healthcare professional.</p>
        </div>
    </div>
</body>
</html>
            `;

            // توليد PDF
            const { uri } = await Print.printToFileAsync({ html });
            
            // مشاركة/تحميل الملف
            await shareAsync(uri, { 
                UTI: '.pdf', 
                mimeType: 'application/pdf',
                dialogTitle: 'Download Report'
            });

        } catch (error) {
            console.error('Error downloading report:', error);
            Alert.alert('Error', 'Failed to download report');
        }
    };

    // تحميل كل التقارير كـ PDF واحد
    const downloadAllReports = async () => {
        try {
            setDownloadingAll(true);

            if (moles.length === 0) {
                Alert.alert('No Reports', 'There are no reports to download');
                return;
            }

            // بناء HTML لكل التقارير
            let reportsHtml = '';
            
            moles.forEach((mole, index) => {
                const date = new Date(mole.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });

                const analysis = mole.analysis || 'Analysis in progress. The AI system is evaluating the skin area for any notable characteristics or concerns.';

                reportsHtml += `
                    <div class="report-card" ${index < moles.length - 1 ? 'style="page-break-after: always;"' : ''}>
                        <div class="report-header">
                            <h2>Report #${index + 1}</h2>
                            <p class="report-date">${date}</p>
                        </div>

                        <div class="image-section">
                            <img src="${mole.photoUri}" alt="Skin Analysis Photo ${index + 1}" />
                        </div>

                        <div class="info-section">
                            <div class="info-row">
                                <span class="info-label">Location:</span>
                                <span class="info-value">${mole.bodyView === 'front' ? 'Front' : 'Back'} Body (x: ${mole.x.toFixed(1)}, y: ${mole.y.toFixed(1)})</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Report ID:</span>
                                <span class="info-value">${mole.id}</span>
                            </div>
                        </div>

                        <div class="analysis-section">
                            <h3>Analysis Results</h3>
                            <div class="analysis-text">
                                ${analysis}
                            </div>
                        </div>
                    </div>
                `;
            });

            // HTML كامل لكل التقارير
            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 30px;
            background: #f5f5f5;
        }
        .main-header {
            text-align: center;
            background: #004F7F;
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        .main-header h1 {
            margin: 0;
            font-size: 32px;
        }
        .main-header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .report-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .report-header {
            border-bottom: 3px solid #004F7F;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .report-header h2 {
            color: #004F7F;
            margin: 0;
            font-size: 24px;
        }
        .report-date {
            color: #6B7280;
            margin: 8px 0 0 0;
            font-size: 14px;
        }
        .image-section {
            text-align: center;
            margin: 25px 0;
        }
        .image-section img {
            max-width: 100%;
            max-height: 400px;
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
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #E5E7EB;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            color: #6B7280;
        }
        .analysis-section {
            margin-top: 25px;
        }
        .analysis-section h3 {
            color: #1F2937;
            font-size: 18px;
            margin-bottom: 12px;
            border-left: 4px solid #004F7F;
            padding-left: 12px;
        }
        .analysis-text {
            color: #4B5563;
            line-height: 1.6;
            font-size: 14px;
            padding: 15px;
            background: #F9FAFB;
            border-radius: 8px;
        }
        .footer {
            text-align: center;
            color: #9CA3AF;
            font-size: 12px;
            padding: 20px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="main-header">
        <h1>Complete Skin Analysis Report</h1>
        <p>Total Reports: ${moles.length} | Generated: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}</p>
    </div>

    ${reportsHtml}

    <div class="footer">
        <p>This report was generated automatically. For medical advice, please consult a healthcare professional.</p>
    </div>
</body>
</html>
            `;

            // توليد PDF
            const { uri } = await Print.printToFileAsync({ html });
            
            // مشاركة/تحميل الملف
            await shareAsync(uri, { 
                UTI: '.pdf', 
                mimeType: 'application/pdf',
                dialogTitle: 'Download All Reports'
            });

        } catch (error) {
            console.error('Error downloading all reports:', error);
            Alert.alert('Error', 'Failed to download reports');
        } finally {
            setDownloadingAll(false);
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
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
            case 'History': router.push('/Screensbar/History'); break;
            case 'Settings': router.push('/Screensbar/Setting'); break;
        }
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
                <Text style={styles.headerTitle}>Reports</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#004F7F" />
                        <Text style={styles.loadingText}>Loading reports...</Text>
                    </View>
                ) : moles.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={80} color="#C5E3ED" />
                        <Text style={styles.emptyTitle}>No Reports Yet</Text>
                        <Text style={styles.emptyText}>
                            Take photos of skin areas to generate reports
                        </Text>
                    </View>
                ) : (
                    <>
                        {moles.map((mole, index) => (
                            <View key={mole.id} style={styles.reportCard}>
                                {/* الصورة - قابلة للضغط */}
                                <TouchableOpacity
                                    style={styles.imageContainer}
                                    onPress={() => {
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
                                        });
                                    }}
                                    activeOpacity={0.9}
                                >
                                    <Image
                                        source={{ uri: mole.photoUri }}
                                        style={styles.reportImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.imageBadge}>
                                        <Text style={styles.imageBadgeText}>
                                            {mole.bodyView === 'front' ? 'Front' : 'Back'}
                                        </Text>
                                    </View>
                                    {/* أيقونة للإشارة أن الصورة قابلة للضغط */}
                                    <View style={styles.expandIcon}>
                                        <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
                                    </View>
                                </TouchableOpacity>

                                {/* التقرير */}
                                <View style={styles.reportContent}>
                                    <View style={styles.reportHeader}>
                                        <Text style={styles.reportTitle}>
                                            Report #{index + 1}
                                        </Text>
                                        <Text style={styles.reportDate}>
                                            {formatDate(mole.timestamp)}
                                        </Text>
                                    </View>

                                    <Text style={styles.reportText}>
                                        {mole.analysis || 
                                            'Analysis in progress. The AI system is evaluating the skin area for any notable characteristics or concerns.'}
                                    </Text>

                                    {/* زر التحميل */}
                                    <TouchableOpacity
                                        style={styles.downloadButton}
                                        onPress={() => downloadSingleReport(mole, index)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="download-outline" size={18} color="#004F7F" />
                                        <Text style={styles.downloadButtonText}>Download PDF</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {/* زر تحميل كل التقارير */}
                        <TouchableOpacity
                            style={styles.downloadAllButton}
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
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
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
    reportCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
        backgroundColor: '#F3F4F6',
    },
    reportImage: {
        width: '100%',
        height: '100%',
    },
    imageBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 79, 127, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    imageBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    expandIcon: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0, 79, 127, 0.8)',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reportContent: {
        padding: 16,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    reportTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    reportDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    reportText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        marginBottom: 16,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F4F8',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C5E3ED',
        alignSelf: 'flex-end',
    },
    downloadButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#004F7F',
        marginLeft: 6,
    },
    downloadAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#004F7F',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    downloadAllText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 8,
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
    navCenterSpacer: {
        flex: 1,
    },
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