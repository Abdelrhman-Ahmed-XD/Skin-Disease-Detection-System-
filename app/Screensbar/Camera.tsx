import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// حالات الشاشة
type ScreenMode = 'existing_preview' | 'camera' | 'new_preview';

export default function CameraScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const tapX = params.tapX ? parseFloat(params.tapX as string) : null;
    const tapY = params.tapY ? parseFloat(params.tapY as string) : null;
    const bodyView = (params.bodyView as 'front' | 'back') || 'front';
    const moleId = params.moleId as string | undefined;
    const existingPhotoUri = params.existingPhotoUri as string | undefined;

    const hasPosition = tapX !== null && tapY !== null;
    const isEditing = !!moleId;

    // لو عنده صورة قديمة → ابدأ بـ existing_preview، غير كده → camera
    const [screenMode, setScreenMode] = useState<ScreenMode>(
        isEditing && existingPhotoUri ? 'existing_preview' : 'camera'
    );
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [facing, setFacing] = useState<CameraType>('back');
    const cameraRef = useRef<CameraView>(null);

    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    // ── التقاط صورة ──────────────────────────────────────────
    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
                if (photo) {
                    setCapturedPhoto(photo.uri);
                    setScreenMode('new_preview');
                }
            } catch (err) {
                Alert.alert('Error', 'Failed to take picture');
            }
        }
    };

    // ── اختيار من الغاليري ───────────────────────────────────
    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
            aspect: [1, 1],
        });
        if (!result.canceled && result.assets.length > 0) {
            setCapturedPhoto(result.assets[0].uri);
            setScreenMode('new_preview');
        }
    };

    // ── حفظ الصورة الجديدة ───────────────────────────────────
    const confirmPhoto = async (photoUri: string) => {
        try {
            const existing = await AsyncStorage.getItem(MOLES_STORAGE_KEY);
            const currentMoles: Mole[] = existing ? JSON.parse(existing) : [];

            if (isEditing && moleId) {
                const updated = currentMoles.map((m) =>
                    m.id === moleId ? { ...m, photoUri } : m
                );
                await AsyncStorage.setItem(MOLES_STORAGE_KEY, JSON.stringify(updated));
            } else if (hasPosition) {
                const newMole: Mole = {
                    id: `mole_${Date.now()}`,
                    x: tapX!,
                    y: tapY!,
                    timestamp: Date.now(),
                    photoUri,
                    bodyView,
                };
                await AsyncStorage.setItem(MOLES_STORAGE_KEY, JSON.stringify([...currentMoles, newMole]));
            }
            router.back();
        } catch (err) {
            Alert.alert('Error', 'Failed to save photo');
        }
    };

    // ── Loading ───────────────────────────────────────────────
    if (!permission) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Loading camera...</Text>
            </View>
        );
    }

    // ── Permission مرفوضة ─────────────────────────────────────
    if (!permission.granted && screenMode === 'camera') {
        return (
            <SafeAreaView style={styles.permissionContainer}>
                {/* <Ionicons name="camera-off-outline" size={64} color="#6B7280" /> */}
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionText}>Please allow camera access to use this feature.</Text>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                    <Text style={styles.permissionBtnText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
                    <Text style={styles.backLinkText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ══════════════════════════════════════════════════════════
    // شاشة 1: عرض الصورة الموجودة مع 3 خيارات
    // ══════════════════════════════════════════════════════════
    if (screenMode === 'existing_preview' && existingPhotoUri) {
        return (
            <View style={styles.previewContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <Image source={{ uri: existingPhotoUri }} style={styles.previewImage} />

                {/* Top bar */}
                <View style={styles.previewTopBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.previewTopBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.previewTitle}>Current Photo</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Badge */}
                <View style={styles.previewBadge}>
                    <Ionicons name="eye-outline" size={14} color="#fff" />
                    <Text style={styles.previewBadgeText}>Choose an action below</Text>
                </View>

                {/* 3 خيارات */}
                <View style={styles.existingActions}>
                    {/* Keep */}
                    <TouchableOpacity style={styles.keepBtn} onPress={() => router.back()} activeOpacity={0.8}>
                        <Ionicons name="checkmark-circle-outline" size={22} color="#004F7F" />
                        <Text style={styles.keepBtnText}>Keep</Text>
                    </TouchableOpacity>

                    {/* Gallery */}
                    <TouchableOpacity style={styles.galleryActionBtn} onPress={pickFromGallery} activeOpacity={0.8}>
                        <Ionicons name="images-outline" size={22} color="#fff" />
                        <Text style={styles.galleryActionBtnText}>Gallery</Text>
                    </TouchableOpacity>

                    {/* Camera */}
                    <TouchableOpacity style={styles.cameraActionBtn} onPress={() => setScreenMode('camera')} activeOpacity={0.8}>
                        <Ionicons name="camera-outline" size={22} color="#fff" />
                        <Text style={styles.cameraActionBtnText}>Camera</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ══════════════════════════════════════════════════════════
    // شاشة 2: Preview للصورة الجديدة
    // ══════════════════════════════════════════════════════════
    if (screenMode === 'new_preview' && capturedPhoto) {
        return (
            <View style={styles.previewContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />

                <View style={styles.previewTopBar}>
                    <TouchableOpacity
                        onPress={() => setScreenMode(isEditing && existingPhotoUri ? 'existing_preview' : 'camera')}
                        style={styles.previewTopBtn}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.previewTitle}>Preview</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.previewBadge}>
                    <Ionicons name={isEditing ? 'pencil-outline' : 'location-outline'} size={14} color="#fff" />
                    <Text style={styles.previewBadgeText}>
                        {isEditing ? 'This will replace the existing photo' : 'Will be saved on body map'}
                    </Text>
                </View>

                <View style={styles.previewActions}>
                    <TouchableOpacity
                        style={styles.retakeBtn}
                        onPress={() => setScreenMode(isEditing && existingPhotoUri ? 'existing_preview' : 'camera')}
                    >
                        <Ionicons name="refresh-outline" size={22} color="#004F7F" />
                        <Text style={styles.retakeBtnText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmBtn} onPress={() => confirmPhoto(capturedPhoto)}>
                        <Ionicons name="checkmark-outline" size={22} color="#fff" />
                        <Text style={styles.confirmBtnText}>
                            {isEditing ? 'Update Photo' : 'Save & Mark'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ══════════════════════════════════════════════════════════
    // شاشة 3: الكاميرا
    // ══════════════════════════════════════════════════════════
    return (
        <View style={styles.cameraContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <CameraView ref={cameraRef} style={styles.camera} facing={facing}>

                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.topBtn}
                        onPress={() => {
                            if (isEditing && existingPhotoUri) {
                                setScreenMode('existing_preview');
                            } else {
                                router.back();
                            }
                        }}
                    >
                        <Ionicons name="arrow-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.topTitle}>
                        {isEditing ? 'Take New Photo' : 'Capture Skin Area'}
                    </Text>
                    <TouchableOpacity style={styles.topBtn} onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
                        <Ionicons name="camera-reverse-outline" size={26} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.scanFrameWrapper}>
                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                    </View>
                    <Text style={styles.scanHint}>Position the mole/spot within the frame</Text>
                </View>

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery} activeOpacity={0.8}>
                        <Ionicons name="images-outline" size={26} color="#fff" />
                        <Text style={styles.galleryBtnText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.captureBtn} onPress={takePicture} activeOpacity={0.8}>
                        <View style={styles.captureBtnInner} />
                    </TouchableOpacity>
                    <View style={{ width: 72 }} />
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    loadingText: { color: '#fff', fontSize: 16 },

    permissionContainer: { flex: 1, backgroundColor: '#D8E9F0', justifyContent: 'center', alignItems: 'center', padding: 32 },
    permissionTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginTop: 20, marginBottom: 10 },
    permissionText: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
    permissionBtn: { marginTop: 28, backgroundColor: '#004F7F', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 16 },
    permissionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    backLink: { marginTop: 16 },
    backLinkText: { color: '#00A3A3', fontSize: 14, fontWeight: '600' },

    // Camera
    cameraContainer: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12 },
    topBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    topTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
    scanFrameWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scanFrame: { width: width * 0.7, height: width * 0.7, position: 'relative' },
    corner: { position: 'absolute', width: 28, height: 28, borderColor: '#fff', borderWidth: 3 },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
    scanHint: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 20, textAlign: 'center', paddingHorizontal: 30 },
    bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, paddingBottom: 48, paddingTop: 20 },
    captureBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
    captureBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
    galleryBtn: { width: 72, height: 72, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', gap: 4 },
    galleryBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },

    // Preview (shared)
    previewContainer: { flex: 1, backgroundColor: '#000' },
    previewImage: { flex: 1, width: '100%', resizeMode: 'cover' },
    previewTopBar: { position: 'absolute', top: 52, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    previewTopBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    previewTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
    previewBadge: { position: 'absolute', top: 110, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,79,127,0.85)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    previewBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    // Existing photo actions (3 buttons)
    existingActions: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: 10,
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingVertical: 20, paddingHorizontal: 20,
    },
    keepBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: '#fff', paddingVertical: 14, borderRadius: 14,
    },
    keepBtnText: { color: '#004F7F', fontWeight: '700', fontSize: 14 },
    galleryActionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: '#00A3A3', paddingVertical: 14, borderRadius: 14,
    },
    galleryActionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    cameraActionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: '#004F7F', paddingVertical: 14, borderRadius: 14,
    },
    cameraActionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // New preview actions
    previewActions: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.75)', paddingVertical: 20, paddingHorizontal: 30, gap: 16 },
    retakeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', paddingVertical: 14, borderRadius: 14 },
    retakeBtnText: { color: '#004F7F', fontWeight: '700', fontSize: 15 },
    confirmBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#004F7F', paddingVertical: 14, borderRadius: 14 },
    confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});