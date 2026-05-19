import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { PB, FONTS } from '../../src/constants/theme';
import { PointTransaction } from '../../src/types/database';

const TYPE_CONFIG = {
  earn:   { color: PB.success,      label: 'Earned',   sign: '+' },
  redeem: { color: PB.accentStrong, label: 'Redeemed', sign: '−' },
  bonus:  { color: PB.secondary,    label: 'Bonus',    sign: '+' },
  expiry: { color: PB.muted,        label: 'Expired',  sign: '−' },
};

function formatDateGroup(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  if (d >= weekAgo) return 'This week';
  return d.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

function groupByDate(txs: PointTransaction[]) {
  const groups: { label: string; data: PointTransaction[] }[] = [];
  const seen: Record<string, number> = {};
  for (const tx of txs) {
    const label = formatDateGroup(tx.created_at);
    if (seen[label] === undefined) {
      seen[label] = groups.length;
      groups.push({ label, data: [] });
    }
    groups[seen[label]].data.push(tx);
  }
  return groups;
}

export default function ActivityScreen() {
  const { customer } = useAuth();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!customer?.id) return;
    const { data } = await supabase
      .from('point_transactions')
      .select('*, merchants(name)')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setTransactions(data ?? []);
  }, [customer?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, [fetchTransactions]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const totalEarned = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalRedeemed = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  const groups = groupByDate(transactions);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PB.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Activity</Text>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{(customer?.points_balance ?? 0).toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Current balance</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardSecondary]}>
            <Text style={[styles.summaryValue, { color: PB.success }]}>+{totalEarned.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total earned</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardSecondary]}>
            <Text style={[styles.summaryValue, { color: PB.accentStrong }]}>−{totalRedeemed.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Redeemed</Text>
          </View>
        </View>

        {/* Transaction list */}
        <View style={styles.listSection}>
          {groups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No activity yet</Text>
              <Text style={styles.emptyText}>Start earning points by scanning your loyalty code at any PerkBack store.</Text>
            </View>
          ) : (
            groups.map((g) => (
              <View key={g.label}>
                <Text style={styles.groupLabel}>{g.label}</Text>
                {g.data.map((tx) => {
                  const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.earn;
                  return (
                    <View key={tx.id} style={styles.txRow}>
                      <View style={[styles.txIconWrap, { backgroundColor: cfg.color + '18' }]}>
                        <Text style={[styles.txIcon, { color: cfg.color }]}>
                          {tx.type === 'earn' ? '✦' : tx.type === 'redeem' ? '🎁' : tx.type === 'bonus' ? '⭐' : '⏱'}
                        </Text>
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={styles.txMerchant} numberOfLines={1}>
                          {tx.merchants?.name ?? tx.note ?? 'PerkBack'}
                        </Text>
                        <Text style={styles.txMeta}>{cfg.label} · {formatTime(tx.created_at)}</Text>
                      </View>
                      <Text style={[styles.txAmount, { color: cfg.color }]}>
                        {cfg.sign}{Math.abs(tx.amount)}
                        <Text style={styles.txPts}> pts</Text>
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PB.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  heading: { fontSize: 26, fontFamily: FONTS.extraBold, color: PB.fg, letterSpacing: -0.5 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1, backgroundColor: PB.primary, borderRadius: 16, padding: 14,
    shadowColor: PB.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  summaryCardSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: PB.border, shadowColor: 'transparent', elevation: 0 },
  summaryValue: { fontSize: 18, fontFamily: FONTS.extraBold, color: '#fff', marginBottom: 2 },
  summaryLabel: { fontSize: 10, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.7)' },
  listSection: { paddingHorizontal: 20, paddingBottom: 32 },
  groupLabel: {
    fontSize: 11, fontFamily: FONTS.bold, color: PB.muted,
    letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 16, marginBottom: 8,
  },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: PB.borderSoft,
  },
  txIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txIcon: { fontSize: 16 },
  txInfo: { flex: 1 },
  txMerchant: { fontSize: 14, fontFamily: FONTS.bold, color: PB.fg },
  txMeta: { fontSize: 11, fontFamily: FONTS.regular, color: PB.muted, marginTop: 1 },
  txAmount: { fontSize: 16, fontFamily: FONTS.extraBold },
  txPts: { fontSize: 11, fontFamily: FONTS.medium },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontFamily: FONTS.bold, color: PB.fg, marginBottom: 8 },
  emptyText: { fontSize: 14, fontFamily: FONTS.regular, color: PB.muted, textAlign: 'center', lineHeight: 21, paddingHorizontal: 24 },
});
