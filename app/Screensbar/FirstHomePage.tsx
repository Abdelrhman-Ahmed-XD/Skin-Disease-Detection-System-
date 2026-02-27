import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STORAGE_KEY      = 'signupDraft';
const MOLES_STORAGE_KEY = 'savedMoles';

const { width, height } = Dimensions.get('window');

function inRect(nx: number, ny: number, x1: number, y1: number, x2: number, y2: number) {
    return nx >= x1 && nx <= x2 && ny >= y1 && ny <= y2;
}

function inEllipse(nx: number, ny: number, cx: number, cy: number, rx: number, ry: number) {
    return ((nx - cx) / rx) ** 2 + ((ny - cy) / ry) ** 2 <= 1;
}

function checkBodyHit(nx: number, ny: number, view: 'front' | 'back'): boolean {
    if (inEllipse(nx, ny, 0.50, 0.09, 0.13, 0.10)) return true;
    if (inRect(nx, ny, 0.43, 0.17, 0.57, 0.22))    return true;
    if (inRect(nx, ny, 0.30, 0.22, 0.70, 0.56))    return true;
    if (inRect(nx, ny, 0.32, 0.54, 0.68, 0.62))    return true;
    if (inRect(nx, ny, 0.08, 0.22, 0.30, 0.52))    return true;
    if (inRect(nx, ny, 0.04, 0.50, 0.22, 0.62))    return true;
    if (inRect(nx, ny, 0.70, 0.22, 0.92, 0.52))    return true;
    if (inRect(nx, ny, 0.78, 0.50, 0.96, 0.62))    return true;
    if (inRect(nx, ny, 0.32, 0.62, 0.50, 0.82))    return true;
    if (inRect(nx, ny, 0.50, 0.62, 0.68, 0.82))    return true;
    if (inRect(nx, ny, 0.33, 0.82, 0.49, 1.00))    return true;
    if (inRect(nx, ny, 0.51, 0.82, 0.67, 1.00))    return true;
    return false;
}

type Mole = {
    id: string;
    x: number;
    y: number;
    timestamp: number;
    photoUri?: string;
    bodyView: 'front' | 'back';
};

type BodyView = 'front' | 'back';

export default function FirstHomePage() {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);   // ← جديد
    const [bodyView, setBodyView] = useState<BodyView>('front');
    const [moles,    setMoles]    = useState<Mole[]>([]);
    const [activeTab, setActiveTab] = useState<string>('Home');

    useEffect(() => {
        bodyViewRef.current = bodyView;
    }, [bodyView]);

    // ── Zoom & Pan ────────────────────────────────────────────
    const scale      = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const scaleVal   = useRef(1);
    const txVal      = useRef(0);
    const tyVal      = useRef(0);
    const bodyViewRef   = useRef<BodyView>('front');
    const bodyWrapperRef = useRef<any>(null);

    useEffect(() => {
        const s = scale.addListener(({ value })      => { scaleVal.current = value; });
        const x = translateX.addListener(({ value }) => { txVal.current    = value; });
        const y = translateY.addListener(({ value }) => { tyVal.current    = value; });
        return () => {
            scale.removeListener(s);
            translateX.removeListener(x);
            translateY.removeListener(y);
        };
    }, []);

    const lastDistance = useRef<number | null>(null);
    const isPinching   = useRef(false);
    const tapStartTime = useRef<number>(0);
    const tapStartPos  = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const panStartTx   = useRef(0);
    const panStartTy   = useRef(0);

    const clampTranslation = (tx: number, ty: number, sc: number) => {
        const maxX = (width  * (sc - 1)) / 2;
        const maxY = (height * (sc - 1)) / 2;
        return {
            x: Math.max(-maxX, Math.min(maxX, tx)),
            y: Math.max(-maxY, Math.min(maxY, ty)),
        };
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder:  () => true,

            onPanResponderGrant: (evt) => {
                const touches = evt.nativeEvent.touches;
                isPinching.current = touches.length >= 2;
                if (touches.length === 1) {
                    tapStartTime.current = Date.now();
                    tapStartPos.current  = { x: touches[0].pageX, y: touches[0].pageY };
                    panStartTx.current   = txVal.current;
                    panStartTy.current   = tyVal.current;
                } else if (touches.length === 2) {
                    const dx = touches[0].pageX - touches[1].pageX;
                    const dy = touches[0].pageY - touches[1].pageY;
                    lastDistance.current = Math.sqrt(dx * dx + dy * dy);
                }
            },

            onPanResponderMove: (evt) => {
                const touches = evt.nativeEvent.touches;

                if (touches.length === 2) {
                    isPinching.current = true;
                    const dx      = touches[0].pageX - touches[1].pageX;
                    const dy      = touches[0].pageY - touches[1].pageY;
                    const newDist = Math.sqrt(dx * dx + dy * dy);
                    if (lastDistance.current !== null) {
                        const ratio    = newDist / lastDistance.current;
                        const newScale = Math.max(1, Math.min(4, scaleVal.current * ratio));
                        scale.setValue(newScale);
                        scaleVal.current = newScale;
                    }
                    lastDistance.current = newDist;
                    return;
                }

                if (touches.length === 1 && scaleVal.current > 1 && !isPinching.current) {
                    const dx      = touches[0].pageX - tapStartPos.current.x;
                    const dy      = touches[0].pageY - tapStartPos.current.y;
                    const clamped = clampTranslation(
                        panStartTx.current + dx,
                        panStartTy.current + dy,
                        scaleVal.current
                    );
                    translateX.setValue(clamped.x);
                    translateY.setValue(clamped.y);
                    txVal.current = clamped.x;
                    tyVal.current = clamped.y;
                }
            },

            onPanResponderRelease: (evt) => {
                const touch = evt.nativeEvent.changedTouches[0];
                lastDistance.current = null;

                if (isPinching.current) {
                    isPinching.current = false;
                    return;
                }

                const elapsed = Date.now() - tapStartTime.current;
                const movedX  = Math.abs(touch.pageX - tapStartPos.current.x);
                const movedY  = Math.abs(touch.pageY - tapStartPos.current.y);

                if (elapsed < 300 && movedX < 10 && movedY < 10) {
                    const doNavigate = (
                        imageLeft: number, imageTop: number,
                        imageWidth: number, imageHeight: number
                    ) => {
                        const imageCenterX = imageLeft + imageWidth  / 2;
                        const imageCenterY = imageTop  + imageHeight / 2;

                        const touchAfterTranslate_X = touch.pageX - txVal.current;
                        const touchAfterTranslate_Y = touch.pageY - tyVal.current;

                        const relX = (touchAfterTranslate_X - imageCenterX) / scaleVal.current + (imageWidth  / 2);
                        const relY = (touchAfterTranslate_Y - imageCenterY) / scaleVal.current + (imageHeight / 2);

                        const nx = relX / imageWidth;
                        const ny = relY / imageHeight;

                        const isOnBody = checkBodyHit(nx, ny, bodyViewRef.current);

                        if (isOnBody) {
                            router.push({
                                pathname: '/Screensbar/Camera',
                                params: {
                                    tapX:     relX.toFixed(2),
                                    tapY:     relY.toFixed(2),
                                    bodyView: bodyViewRef.current,
                                },
                            });
                        }
                    };

                    if (bodyWrapperRef.current) {
                        bodyWrapperRef.current.measure(
                            (_fx: number, _fy: number, fw: number, fh: number, px: number, py: number) => {
                                const imgW    = width * 0.85;
                                const imgH    = height * 0.55;
                                const imgLeft = px + (fw - imgW) / 2;
                                const imgTop  = py + (fh - imgH) / 2;
                                doNavigate(imgLeft, imgTop, imgW, imgH);
                            }
                        );
                    }
                }
            },
        })
    ).current;

    // ── Load user data (name + photo) ─────────────────────────
    useFocusEffect(
        React.useCallback(() => {
            setActiveTab('Home');

            const loadUserData = async () => {
                try {
                    const saved = await AsyncStorage.getItem(STORAGE_KEY);
                    if (saved) {
                        const data = JSON.parse(saved);
                        setUserName(`${data.firstName || ''} ${data.lastName || ''}`.trim());
                        setPhotoUri(data.photoUri || null);
                    }
                } catch (err) {
                    console.log('Error loading user data:', err);
                }
            };
            loadUserData();
        }, [])
    );

    // ── Load moles ────────────────────────────────────────────
    useFocusEffect(
        React.useCallback(() => {
            const loadMoles = async () => {
                try {
                    const saved = await AsyncStorage.getItem(MOLES_STORAGE_KEY);
                    if (saved) setMoles(JSON.parse(saved));
                } catch (err) {
                    console.log('Error loading moles:', err);
                }
            };
            loadMoles();
        }, [])
    );

    const currentMoles = moles.filter((m) => m.bodyView === bodyView);

    const deleteMole = async (moleId: string) => {
        const updated = moles.filter((m) => m.id !== moleId);
        setMoles(updated);
        try {
            await AsyncStorage.setItem(MOLES_STORAGE_KEY, JSON.stringify(updated));
        } catch (err) {
            console.log('Error deleting mole:', err);
        }
    };

    const toggleBodyView = (view: BodyView) => {
        setBodyView(view);
        Animated.parallel([
            Animated.spring(scale,      { toValue: 1, useNativeDriver: true }),
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        ]).start();
        scaleVal.current = 1;
        txVal.current    = 0;
        tyVal.current    = 0;
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
            case 'Camera':   router.push('/Screensbar/Camera');        break;
            case 'History':  router.push('/Screensbar/History');       break;
            case 'Reports':  router.push('/Screensbar/Reports');       break;
            case 'Settings': router.push('/Screensbar/Setting');       break;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#D8E9F0" />

            {/* Header */}
            <View style={styles.headerCard}>
                <View style={styles.headerContent}>
                    {/* ── Profile icon / photo ── */}
                    <TouchableOpacity
                        style={styles.profileIconContainer}
                        onPress={() => router.push('/Settingsoptions/Editprofile')}
                    >
                        {photoUri ? (
                            <Image
                                source={{ uri: photoUri }}
                                style={styles.profilePhoto}
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="person-outline" size={32} color="#004F7F" />
                        )}
                    </TouchableOpacity>

                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeLabel}>Welcome,</Text>
                        <Text style={{ fontWeight: 'bold', marginLeft: 4, marginTop: 3, fontSize: 17 }}>
                            {userName}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={28} color="#00A3A3" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>
                    Let's Check your <Text style={styles.titleBold}>Skin</Text>
                </Text>
            </View>

            {/* Body + Gesture */}
            <View style={styles.bodyMainContainer}>
                <View
                    style={styles.bodyTouchable}
                    {...panResponder.panHandlers}
                    ref={(r) => { bodyWrapperRef.current = r; }}
                >
                    <Animated.View
                        style={[
                            styles.bodyImageWrapper,
                            { transform: [{ scale }, { translateX }, { translateY }] },
                        ]}
                    >
                        <Image
                            source={
                                bodyView === 'front'
                                    ? require('../../assets/images/body-front.png')
                                    : require('../../assets/images/body-back.png')
                            }
                            style={styles.bodyImage}
                            resizeMode="contain"
                        />

                        {/* نقاط الخالات المحفوظة */}
                        {currentMoles.map((mole) => {
                            const MARKER_SIZE = 28;
                            const markerLeft  = mole.x - (MARKER_SIZE / 2);
                            const markerTop   = mole.y - (MARKER_SIZE / 2);

                            return (
                                <View
                                    key={mole.id}
                                    style={[styles.moleContainer, { left: markerLeft, top: markerTop }]}
                                    pointerEvents="box-none"
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        delayLongPress={500}
                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                                        onPress={() => {
                                            router.push({
                                                pathname: '/Screensbar/Camera',
                                                params: {
                                                    tapX:            mole.x.toFixed(2),
                                                    tapY:            mole.y.toFixed(2),
                                                    bodyView:        mole.bodyView,
                                                    moleId:          mole.id,
                                                    existingPhotoUri: mole.photoUri || '',
                                                },
                                            });
                                        }}
                                        onLongPress={() => {
                                            Alert.alert(
                                                'Delete Point',
                                                'Are you sure you want to delete this point?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Delete',
                                                        style: 'destructive',
                                                        onPress: () => deleteMole(mole.id),
                                                    },
                                                ]
                                            );
                                        }}
                                    >
                                        <View style={styles.moleInner}>
                                            <Text style={styles.moleIcon}>+</Text>
                                        </View>
                                        {mole.photoUri && (
                                            <Image
                                                source={{ uri: mole.photoUri }}
                                                style={styles.moleThumbnail}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </Animated.View>
                </View>
            </View>

            {/* Toggle Front/Back */}
            <View style={styles.bottomControls}>
                <View style={styles.toggleWrapper}>
                    <TouchableOpacity
                        onPress={() => toggleBodyView('front')}
                        style={[styles.toggleButton, bodyView === 'front' && styles.toggleButtonActive]}
                    >
                        <Text style={[styles.toggleText, bodyView === 'front' && styles.toggleTextActive]}>
                            Front
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => toggleBodyView('back')}
                        style={[styles.toggleButton, bodyView === 'back' && styles.toggleButtonActive]}
                    >
                        <Text style={[styles.toggleText, bodyView === 'back' && styles.toggleTextActive]}>
                            Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Nav */}
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
    container:           { flex: 1, backgroundColor: '#D8E9F0' },
    titleContainer:      { padding: 20, marginTop: 16 },
    title:               { fontSize: 20, textAlign: 'center', color: '#1F2937' },
    titleBold:           { fontWeight: '700' },
    bodyMainContainer:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginBottom: 200 },
    bodyTouchable:       { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    bodyImageWrapper:    { position: 'relative', width: width * 0.85, height: height * 0.55, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D8E9F0', overflow: 'visible' },
    bodyImage:           { width: '100%', height: '100%', backgroundColor: '#D8E9F0' },
    moleContainer:       { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 4 },
    moleInner:           { width: 28, height: 28, borderRadius: 14, backgroundColor: '#004F7F', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
    moleIcon:            { color: '#FFFFFF', fontSize: 18, fontWeight: '700', lineHeight: 22 },
    moleThumbnail:       { width: 38, height: 38, borderRadius: 8, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#ccc' },
    bottomControls:      { position: 'absolute', bottom: 100, left: 0, right: 0, alignItems: 'center', marginBottom: 35 },
    toggleWrapper:       { flexDirection: 'row', backgroundColor: '#B8D4DE', borderRadius: 25, padding: 4, width: width * 0.45 },
    toggleButton:        { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    toggleButtonActive:  { backgroundColor: '#004F7F' },
    toggleText:          { fontSize: 14, fontWeight: '600', color: '#6B7280' },
    toggleTextActive:    { color: '#FFFFFF', fontWeight: '700' },
    bottomNavContainer:  { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' },
    bottomNav:           { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', width: '100%', paddingBottom: 16 },
    navCenterSpacer:     { flex: 1 },
    navItem:             { flex: 1, alignItems: 'center', justifyContent: 'center' },
    navIcon:             { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    navIconActive:       { backgroundColor: '#E8F4F8', borderWidth: 2, borderColor: '#C5E3ED' },
    navText:             { fontSize: 11, color: '#6B7280', fontWeight: '500' },
    navTextActive:       { fontSize: 11, color: '#004F7F', fontWeight: '700' },
    cameraButton: {
        position: 'absolute', top: -26, alignSelf: 'center',
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
        borderWidth: 3, borderColor: '#C5E3ED',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12, shadowRadius: 6, elevation: 6,
    },
    cameraButtonActive: { borderColor: '#004F7F', backgroundColor: '#E8F4F8' },

    // ── Header ────────────────────────────────────────────────
    headerCard: {
        backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 12, marginBottom: 8,
        borderRadius: 20, paddingVertical: 14, paddingHorizontal: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    },
    headerContent:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    profileIconContainer:  {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#E8F4F8', justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#C5E3ED',
        overflow: 'hidden',   // ← مهم عشان الصورة تتقص دايري
    },
    profilePhoto: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    welcomeContainer:  { flex: 1, marginLeft: 12, flexDirection: 'row', alignItems: 'center' },
    welcomeLabel:      { fontSize: 18, color: '#00A3A3', fontStyle: 'italic' },
    userName:          { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 2 },
    notificationButton: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center',
    },
});