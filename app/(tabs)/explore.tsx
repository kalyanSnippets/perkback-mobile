import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  RefreshControl, StatusBar, ScrollView, Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { supabase } from '../../src/lib/supabase';
import { PB, FONTS } from '../../src/constants/theme';
import { Merchant } from '../../src/types/database';

const CATEGORIES = ['All', 'Coffee', 'Food', 'Retail', 'Beauty', 'Health', 'Other'];

const CATEGORY_EMOJI: Record<string, string> = {
  coffee: '☕', food: '🍜', retail: '🛍️', beauty: '💅',
  health: '💊', fitness: '🏋️', bakery: '🥐', other: '🏪',
};

function categoryEmoji(cat: string | null) {
  return CATEGORY_EMOJI[(cat ?? 'other').toLowerCase()] ?? '🏪';
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number | null) {
  if (km === null) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function avatarColor(name: string) {
  const colors = ['#7c3aed', '#0a2a6b', '#be185d', '#059669', '#b45309', '#1d4ed8'];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % colors.length;
  return colors[Math.abs(hash)];
}

interface MerchantWithDist extends Merchant { distKm: number | null }

function MerchantDetail({ merchant, onClose }: { merchant: MerchantWithDist; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[detail.sheet, { paddingBottom: insets.bottom + 16 }]}>
      <View style={detail.handle} />
      <View style={detail.header}>
        <View style={[detail.avatar, { backgroundColor: avatarColor(merchant.name) }]}>
          <Text style={detail.avatarText}>{merchant.name[0]}</Text>
        </View>
        <View style={detail.headerText}>
          <Text style={detail.name}>{merchant.name}</Text>
          <Text style={detail.cat}>{categoryEmoji(merchant.category)} {merchant.category ?? 'Store'}</Text>
        </View>
        <TouchableOpacity style={detail.closeBtn} onPress={onClose}>
          <Text style={detail.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      {merchant.address ? (
        <TouchableOpacity
          style={detail.addressRow}
          onPress={() => Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(merchant.address!)}`)}
        >
          <Text style={detail.addressIcon}>📍</Text>
          <Text style={detail.address}>{merchant.address}</Text>
          {merchant.distKm !== null && <Text style={detail.dist}>{formatDist(merchant.distKm)}</Text>}
        </TouchableOpacity>
      ) : null}
      <View style={detail.earnCard}>
        <Text style={detail.earnTitle}>How to earn points</Text>
        <Text style={detail.earnDesc}>Show your PerkBack loyalty code at checkout. Points are added instantly to your balance.</Text>
      </View>
    </View>
  );
}

const detail = StyleSheet.create({
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: PB.border, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatar: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontFamily: FONTS.extraBold, color: '#fff' },
  headerText: { flex: 1 },
  name: { fontSize: 18, fontFamily: FONTS.extraBold, color: PB.fg },
  cat: { fontSize: 13, fontFamily: FONTS.regular, color: PB.muted, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: PB.borderSoft, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 14, color: PB.muted, fontFamily: FONTS.bold },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: PB.bg, borderRadius: 12, padding: 14, marginBottom: 16 },
  addressIcon: { fontSize: 16 },
  address: { flex: 1, fontSize: 13, fontFamily: FONTS.regular, color: PB.fg },
  dist: { fontSize: 12, fontFamily: FONTS.bold, color: PB.secondary },
  earnCard: { backgroundColor: PB.primary + '10', borderRadius: 16, padding: 16 },
  earnTitle: { fontSize: 14, fontFamily: FONTS.bold, color: PB.primary, marginBottom: 6 },
  earnDesc: { fontSize: 13, fontFamily: FONTS.regular, color: PB.fg, lineHeight: 20 },
});

export default function ExploreScreen() {
  const [merchants, setMerchants] = useState<MerchantWithDist[]>([]);
  const [filtered, setFiltered] = useState<MerchantWithDist[]>([]);
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState('Locating…');
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<MerchantWithDist | null>(null);

  const fetchLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationLabel('Location off — showing all stores');
      return;
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = pos.coords;
    setLocation({ lat: latitude, lng: longitude });
    const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
    setLocationLabel(geo?.district ?? geo?.city ?? 'Nearby');
  }, []);

  const fetchMerchants = useCallback(async () => {
    const { data } = await supabase
      .from('merchants')
      .select('*')
      .eq('is_active', true);
    const list = (data ?? []) as Merchant[];
    const withDist: MerchantWithDist[] = list.map(m => ({
      ...m,
      distKm: location && m.lat && m.lng ? haversineKm(location.lat, location.lng, m.lat, m.lng) : null,
    }));
    withDist.sort((a, b) => {
      if (a.distKm === null && b.distKm === null) return a.name.localeCompare(b.name);
      if (a.distKm === null) return 1;
      if (b.distKm === null) return -1;
      return a.distKm - b.distKm;
    });
    setMerchants(withDist);
  }, [location]);

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  useEffect(() => {
    if (category === 'All') {
      setFiltered(merchants);
    } else {
      setFiltered(merchants.filter(m =>
        (m.category ?? 'other').toLowerCase() === category.toLowerCase()
      ));
    }
  }, [merchants, category]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchLocation(), fetchMerchants()]);
    setRefreshing(false);
  }, [fetchLocation, fetchMerchants]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Explore</Text>
        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationLabel}>{locationLabel}</Text>
        </View>
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        style={styles.filterScroll}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, category === cat && styles.filterChipActive]}
            onPress={() => setCategory(cat)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, category === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Merchant list */}
      <FlatList
        data={filtered}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PB.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗺</Text>
            <Text style={styles.emptyTitle}>No stores found</Text>
            <Text style={styles.emptyText}>
              {category !== 'All' ? `No ${category.toLowerCase()} stores nearby.` : 'No stores available right now.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.merchantCard} onPress={() => setSelected(item)} activeOpacity={0.88}>
            <View style={[styles.merchantAvatar, { backgroundColor: avatarColor(item.name) }]}>
              <Text style={styles.merchantAvatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.merchantInfo}>
              <Text style={styles.merchantName}>{item.name}</Text>
              <Text style={styles.merchantCat}>{categoryEmoji(item.category)} {item.category ?? 'Store'}</Text>
            </View>
            {item.distKm !== null && (
              <View style={styles.distBadge}>
                <Text style={styles.distText}>{formatDist(item.distKm)}</Text>
              </View>
            )}
            <Text style={styles.merchantArrow}>›</Text>
          </TouchableOpacity>
        )}
      />

      {/* Merchant detail modal */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelected(null)} />
        {selected && <MerchantDetail merchant={selected} onClose={() => setSelected(null)} />}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PB.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  heading: { fontSize: 26, fontFamily: FONTS.extraBold, color: PB.fg, letterSpacing: -0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationPin: { fontSize: 12 },
  locationLabel: { fontSize: 13, fontFamily: FONTS.regular, color: PB.muted },
  filterScroll: { flexGrow: 0, marginBottom: 8 },
  filterList: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: PB.border },
  filterChipActive: { backgroundColor: PB.primary, borderColor: PB.primary },
  filterText: { fontSize: 13, fontFamily: FONTS.bold, color: PB.muted },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 10 },
  merchantCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: PB.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  merchantAvatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  merchantAvatarText: { fontSize: 20, fontFamily: FONTS.extraBold, color: '#fff' },
  merchantInfo: { flex: 1 },
  merchantName: { fontSize: 15, fontFamily: FONTS.bold, color: PB.fg },
  merchantCat: { fontSize: 12, fontFamily: FONTS.regular, color: PB.muted, marginTop: 2 },
  distBadge: { backgroundColor: PB.borderSoft, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  distText: { fontSize: 11, fontFamily: FONTS.bold, color: PB.secondary },
  merchantArrow: { fontSize: 20, color: PB.muted, fontFamily: FONTS.bold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontFamily: FONTS.bold, color: PB.fg, marginBottom: 8 },
  emptyText: { fontSize: 14, fontFamily: FONTS.regular, color: PB.muted, textAlign: 'center' },
});
