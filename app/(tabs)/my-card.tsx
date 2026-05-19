import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, RefreshControl, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { LoyaltyCard } from '../../src/components/ui/LoyaltyCard';
import { supabase } from '../../src/lib/supabase';
import { PB, FONTS } from '../../src/constants/theme';
import { PointTransaction } from '../../src/types/database';

const { width } = Dimensions.get('window');

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function groupTransactions(txs: PointTransaction[]) {
  const groups: { label: string; data: PointTransaction[] }[] = [];
  const seen: Record<string, number> = {};
  for (const tx of txs) {
    const label = formatDate(tx.created_at);
    if (seen[label] === undefined) {
      seen[label] = groups.length;
      groups.push({ label, data: [] });
    }
    groups[seen[label]].data.push(tx);
  }
  return groups;
}

function QRModal({ visible, crn, onClose }: { visible: boolean; crn: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <StatusBar barStyle="dark-content" />
      <View style={[qr.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={qr.closeBtn} onPress={onClose}>
          <Text style={qr.closeText}>✕  Close</Text>
        </TouchableOpacity>
        <View style={qr.body}>
          <Text style={qr.title}>Your PerkBack Code</Text>
          <Text style={qr.sub}>Show this at the counter to earn points</Text>
          <View style={qr.codeCard}>
            <View style={qr.barsRow}>
              {Array.from({ length: 28 }).map((_, i) => (
                <View
                  key={i}
                  style={[qr.bar, {
                    height: [1,3,5,7,9,11,13,15,17,19,21,23,25,27].includes(i) ? 56 : 40,
                    backgroundColor: i % 4 === 0 ? PB.primary : i % 3 === 0 ? PB.secondary : PB.border,
                  }]}
                />
              ))}
            </View>
            <Text style={qr.crn}>{crn}</Text>
            <Text style={qr.crnLabel}>Loyalty Card Number</Text>
          </View>
          <View style={qr.hintRow}>
            <Text style={qr.hint}>💡 Increase brightness for easier scanning</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const qr = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  closeBtn: { paddingHorizontal: 24, paddingVertical: 12, alignSelf: 'flex-start' },
  closeText: { fontSize: 15, fontFamily: FONTS.bold, color: PB.fg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 22, fontFamily: FONTS.extraBold, color: PB.fg, marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 14, fontFamily: FONTS.regular, color: PB.muted, marginBottom: 36, textAlign: 'center' },
  codeCard: {
    width: width - 64, backgroundColor: PB.bg, borderRadius: 24,
    borderWidth: 2, borderColor: PB.border, alignItems: 'center',
    paddingVertical: 32, paddingHorizontal: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
  },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginBottom: 24, height: 64 },
  bar: { width: 5, borderRadius: 2 },
  crn: { fontSize: 24, fontFamily: FONTS.mono, color: PB.fg, letterSpacing: 2, marginBottom: 6 },
  crnLabel: { fontSize: 11, fontFamily: FONTS.medium, color: PB.muted, letterSpacing: 0.5 },
  hintRow: { marginTop: 24 },
  hint: { fontSize: 12, fontFamily: FONTS.regular, color: PB.muted, textAlign: 'center' },
});

export default function MyCardScreen() {
  const { customer, refreshCustomer } = useAuth();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  const firstName = customer?.full_name?.split(' ')[0] ?? '';
  const nameParts = customer?.full_name?.split(' ') ?? ['', ''];
  const memberSince = customer?.created_at
    ? new Date(customer.created_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
    : '—';

  const fetchTransactions = useCallback(async () => {
    if (!customer?.id) return;
    const { data } = await supabase
      .from('point_transactions')
      .select('*, merchants(name)')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setTransactions(data ?? []);
  }, [customer?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshCustomer(), fetchTransactions()]);
    setRefreshing(false);
  }, [refreshCustomer, fetchTransactions]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const groups = groupTransactions(transactions);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PB.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}{firstName ? `, ${firstName}` : ''} 👋</Text>
            <Text style={styles.greetingSub}>Member since {memberSince}</Text>
          </View>
        </View>

        {/* Loyalty card */}
        <View style={styles.cardWrap}>
          <LoyaltyCard
            firstName={nameParts[0]}
            lastName={nameParts.slice(1).join(' ')}
            crn={customer?.crn ?? '—'}
            cardNumber={customer?.loyalty_card_number ?? '—'}
            points={customer?.points_balance ?? 0}
          />
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(customer?.points_balance ?? 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{transactions.filter(t => t.amount > 0).length}</Text>
            <Text style={styles.statLabel}>Visits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{memberSince}</Text>
            <Text style={styles.statLabel}>Member since</Text>
          </View>
        </View>

        {/* Show QR button */}
        <TouchableOpacity style={styles.qrBtn} onPress={() => setQrVisible(true)} activeOpacity={0.85}>
          <Text style={styles.qrBtnIcon}>📱</Text>
          <Text style={styles.qrBtnText}>Show loyalty code</Text>
          <Text style={styles.qrBtnArrow}>→</Text>
        </TouchableOpacity>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {groups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✦</Text>
              <Text style={styles.emptyText}>No transactions yet.{'\n'}Scan your code at a store to start earning!</Text>
            </View>
          ) : (
            groups.map((g) => (
              <View key={g.label}>
                <Text style={styles.groupLabel}>{g.label}</Text>
                {g.data.map((tx) => (
                  <View key={tx.id} style={styles.txRow}>
                    <View style={[styles.txDot, { backgroundColor: tx.amount > 0 ? PB.success : PB.accentStrong }]} />
                    <View style={styles.txInfo}>
                      <Text style={styles.txMerchant}>{tx.merchants?.name ?? tx.note ?? 'PerkBack'}</Text>
                      <Text style={styles.txTime}>{formatTime(tx.created_at)}</Text>
                    </View>
                    <Text style={[styles.txAmount, { color: tx.amount > 0 ? PB.success : PB.accentStrong }]}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} pts
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <QRModal visible={qrVisible} crn={customer?.crn ?? ''} onClose={() => setQrVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PB.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  greeting: { fontSize: 20, fontFamily: FONTS.extraBold, color: PB.fg, letterSpacing: -0.3 },
  greetingSub: { fontSize: 12, fontFamily: FONTS.regular, color: PB.muted, marginTop: 2 },
  cardWrap: { paddingHorizontal: 20, marginBottom: 16 },
  statsStrip: {
    flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#fff',
    borderRadius: 16, borderWidth: 1, borderColor: PB.border,
    paddingVertical: 16, marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontFamily: FONTS.extraBold, color: PB.fg, marginBottom: 2 },
  statLabel: { fontSize: 10, fontFamily: FONTS.medium, color: PB.muted },
  statDivider: { width: 1, backgroundColor: PB.border },
  qrBtn: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20,
    backgroundColor: PB.primary, borderRadius: 16, padding: 16, marginBottom: 20, gap: 10,
  },
  qrBtnIcon: { fontSize: 20 },
  qrBtnText: { flex: 1, fontSize: 15, fontFamily: FONTS.bold, color: '#fff' },
  qrBtnArrow: { fontSize: 18, color: 'rgba(255,255,255,0.7)', fontFamily: FONTS.bold },
  section: { paddingHorizontal: 20, paddingBottom: 32 },
  sectionTitle: { fontSize: 17, fontFamily: FONTS.extraBold, color: PB.fg, marginBottom: 12 },
  groupLabel: { fontSize: 11, fontFamily: FONTS.bold, color: PB.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: PB.borderSoft, gap: 12 },
  txDot: { width: 10, height: 10, borderRadius: 5 },
  txInfo: { flex: 1 },
  txMerchant: { fontSize: 14, fontFamily: FONTS.bold, color: PB.fg },
  txTime: { fontSize: 11, fontFamily: FONTS.regular, color: PB.muted, marginTop: 1 },
  txAmount: { fontSize: 15, fontFamily: FONTS.extraBold },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 28, color: PB.accent, marginBottom: 12 },
  emptyText: { fontSize: 14, fontFamily: FONTS.regular, color: PB.muted, textAlign: 'center', lineHeight: 21 },
});
