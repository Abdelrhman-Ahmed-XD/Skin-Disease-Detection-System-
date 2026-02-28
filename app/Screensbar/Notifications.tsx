import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import {
  AppNotification,
  defaultNotifications,
  NOTIFICATIONS_ENABLED_KEY,
  NOTIFICATIONS_STORAGE_KEY,
} from './notificationsData';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function NotificationsPage() {
  const [notifications, setNotifications]         = useState<AppNotification[]>([]);
  const [openId, setOpenId]                        = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // ── Load notifications + enabled setting ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        // Check if notifications are enabled
        const enabledVal = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
        const enabled = enabledVal === null ? true : enabledVal === 'true';
        setNotificationsEnabled(enabled);

        // Load notification list
        const saved = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (saved) {
          setNotifications(JSON.parse(saved));
        } else {
          setNotifications(defaultNotifications);
          await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(defaultNotifications));
        }
      } catch {
        setNotifications(defaultNotifications);
      }
    };
    load();
  }, []);

  // ── Save + update state ───────────────────────────────────────────────────
  const saveNotifications = async (updated: AppNotification[]) => {
    setNotifications(updated);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.log('Error saving notifications:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handlePress = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
    setOpenId((prev) => (prev === id ? null : id));
  };

  const markAllRead = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    saveNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // ── Disabled state ────────────────────────────────────────────────────────
  if (!notificationsEnabled) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Empty state */}
        <View style={styles.disabledContainer}>
          <View style={styles.disabledIconWrap}>
            <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.disabledTitle}>Notifications are disabled</Text>
          <Text style={styles.disabledSubtitle}>
            You won't receive any notifications.{'\n'}
            You can enable them from Settings.
          </Text>
          <TouchableOpacity
            style={styles.goToSettingsBtn}
            onPress={() => router.push('/Screensbar/Setting')}
          >
            <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
            <Text style={styles.goToSettingsBtnText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Normal state ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Mark all read */}
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllRow} onPress={markAllRead}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {/* List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {notifications.map((notif) => {
          const isOpen = openId === notif.id;
          return (
            <TouchableOpacity
              key={notif.id}
              activeOpacity={0.85}
              onPress={() => handlePress(notif.id)}
              style={[styles.notifCard, isOpen && styles.notifCardOpen, !notif.read && styles.notifCardUnread]}
            >
              {!notif.read && <View style={styles.unreadDot} />}

              <View style={styles.notifRow}>
                <Image source={{ uri: notif.image }} style={[styles.notifImage, isOpen && styles.notifImageOpen]} resizeMode="cover" />
                <View style={styles.notifTextBlock}>
                  <Text style={styles.notifLabel}>Skin disease detected:</Text>
                  <Text style={[styles.notifDisease, isOpen && styles.notifDiseaseOpen]}>{notif.disease}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
                <View style={[styles.arrowBox, isOpen && styles.arrowBoxOpen]}>
                  <Ionicons name={isOpen ? 'chevron-down' : 'chevron-forward'} size={15} color={isOpen ? '#FFFFFF' : '#2A7DA0'} />
                </View>
              </View>

              {isOpen && (
                <View style={styles.expandedContent}>
                  <View style={styles.expandedDivider} />
                  <View style={styles.confidenceRow}>
                    <Ionicons name="analytics-outline" size={15} color="#2A7DA0" />
                    <Text style={styles.confidenceLabel}>AI Confidence: </Text>
                    <View style={styles.confidenceBadge}>
                      <Text style={styles.confidenceBadgeText}>{notif.details.confidence}</Text>
                    </View>
                  </View>
                  <View style={styles.expandedSection}>
                    <View style={styles.expandedSectionHeader}>
                      <Ionicons name="information-circle-outline" size={15} color="#2A7DA0" />
                      <Text style={styles.expandedSectionTitle}>About this condition</Text>
                    </View>
                    <Text style={styles.expandedText}>{notif.details.description}</Text>
                  </View>
                  <View style={[styles.expandedSection, styles.recommendationBox]}>
                    <View style={styles.expandedSectionHeader}>
                      <Ionicons name="medkit-outline" size={15} color="#2A7DA0" />
                      <Text style={styles.expandedSectionTitle}>Recommendation</Text>
                    </View>
                    <Text style={styles.expandedText}>{notif.details.recommendation}</Text>
                  </View>
                  <TouchableOpacity style={styles.consultButton}>
                    <Ionicons name="person-outline" size={15} color="#FFFFFF" />
                    <Text style={styles.consultButtonText}>Consult a Doctor</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D8E9F0' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, margin: 15,
  },
  backButton: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  badge: { marginLeft: 6, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  markAllRow: { alignSelf: 'flex-end', marginRight: 16, marginBottom: 6, marginTop: -6 },
  markAllText: { fontSize: 12, color: '#2A7DA0', fontWeight: '600', textDecorationLine: 'underline' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 15, paddingTop: 4 },

  // Disabled state
  disabledContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  disabledIconWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  disabledTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 10, textAlign: 'center' },
  disabledSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  goToSettingsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#2A7DA0', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24,
  },
  goToSettingsBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // Cards
  notifCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, overflow: 'hidden' },
  notifCardOpen: { borderColor: '#A8D4E6', elevation: 3 },
  notifCardUnread: { borderColor: '#BEE0F0', backgroundColor: '#F4FBFF' },
  unreadDot: { position: 'absolute', top: 14, left: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#2A7DA0', zIndex: 10 },
  notifRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, paddingLeft: 22 },
  notifImage: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#E5F0F6' },
  notifImageOpen: { borderColor: '#2A7DA0', width: 56, height: 56, borderRadius: 28 },
  notifTextBlock: { flex: 1, marginLeft: 12 },
  notifLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  notifDisease: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  notifDiseaseOpen: { color: '#2A7DA0' },
  notifTime: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  arrowBox: { width: 28, height: 28, borderRadius: 8, borderWidth: 1.5, borderColor: '#2A7DA0', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  arrowBoxOpen: { backgroundColor: '#2A7DA0' },
  expandedContent: { paddingHorizontal: 16, paddingBottom: 14 },
  expandedDivider: { height: 1, backgroundColor: '#E5F0F6', marginBottom: 12 },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  confidenceLabel: { fontSize: 13, color: '#4B5563', marginLeft: 5 },
  confidenceBadge: { backgroundColor: '#E8F4FA', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  confidenceBadgeText: { fontSize: 13, fontWeight: '700', color: '#2A7DA0' },
  expandedSection: { marginBottom: 10 },
  expandedSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  expandedSectionTitle: { fontSize: 13, fontWeight: '700', color: '#1F2937', marginLeft: 5 },
  expandedText: { fontSize: 13, color: '#4B5563', lineHeight: 19, paddingLeft: 20 },
  recommendationBox: { backgroundColor: '#F0F9FF', borderRadius: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: '#2A7DA0' },
  consultButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A7DA0', borderRadius: 10, paddingVertical: 10, marginTop: 6, gap: 6 },
  consultButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});