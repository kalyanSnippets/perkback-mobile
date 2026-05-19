import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
  TextInput, StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { PB, FONTS } from '../../src/constants/theme';

const MERCHANT_DASHBOARD_URL = 'https://perkback.com.au/dashboard';

function SettingsRow({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={row.wrap} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={row.icon}>{icon}</Text>
      <Text style={row.label}>{label}</Text>
      {onPress && <Text style={row.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  icon: { fontSize: 18, width: 28, textAlign: 'center' },
  label: { flex: 1, fontSize: 15, fontFamily: FONTS.regular, color: PB.fg },
  arrow: { fontSize: 20, color: PB.muted, fontFamily: FONTS.bold },
});

export default function ProfileScreen() {
  const { customer, merchant, user, signOut, refreshCustomer } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(customer?.full_name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const initials = (customer?.full_name ?? user?.email ?? '?')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const memberSince = customer?.created_at
    ? new Date(customer.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
    : '—';

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter your full name.'); return; }
    setSaving(true);
    const { error } = await supabase
      .from('customers')
      .update({ full_name: name.trim(), phone: phone.trim() || null })
      .eq('user_id', user!.id);
    setSaving(false);
    if (error) { Alert.alert('Save failed', error.message); return; }
    await refreshCustomer();
    setEditing(false);
  };

  const handleCancel = () => {
    setName(customer?.full_name ?? '');
    setPhone(customer?.phone ?? '');
    setEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const openMerchant = async () => {
    const supported = await Linking.canOpenURL(MERCHANT_DASHBOARD_URL);
    if (supported) await Linking.openURL(MERCHANT_DASHBOARD_URL);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Avatar + name */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{customer?.full_name ?? user?.email ?? '—'}</Text>
          <Text style={styles.heroCrn}>{customer?.crn ?? ''}</Text>
          <Text style={styles.heroSince}>Member since {memberSince}</Text>
        </View>

        {/* Edit profile */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
            {!editing ? (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={[styles.editBtn, { color: PB.muted }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                  <Text style={[styles.editBtn, saving && { opacity: 0.5 }]}>
                    {saving ? 'Saving…' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {editing ? (
            <View style={styles.editForm}>
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Full name</Text>
                <TextInput
                  style={styles.fieldInput} value={name} onChangeText={setName}
                  placeholder="Your name" placeholderTextColor={PB.muted}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <TextInput
                  style={styles.fieldInput} value={phone} onChangeText={setPhone}
                  placeholder="+61 412 000 000" placeholderTextColor={PB.muted}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldReadOnly}>{user?.email ?? '—'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <SettingsRow icon="✉️" label={user?.email ?? '—'} />
              <View style={styles.divider} />
              <SettingsRow icon="📱" label={customer?.phone ?? 'No phone added'} />
              <View style={styles.divider} />
              <SettingsRow icon="🎂" label={customer?.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString('en-AU') : 'No birthday added'} />
            </View>
          )}
        </View>

        {/* Merchant account switcher */}
        {merchant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Merchant</Text>
            <TouchableOpacity style={styles.merchantCard} onPress={openMerchant} activeOpacity={0.88}>
              <View style={styles.merchantIcon}>
                <Text style={{ fontSize: 22 }}>🏪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.merchantName}>{merchant.name}</Text>
                <Text style={styles.merchantSub}>Open merchant dashboard ↗</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* App links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.card}>
            <SettingsRow icon="❓" label="Help & FAQ" onPress={() => Linking.openURL('https://perkback.com.au/help')} />
            <View style={styles.divider} />
            <SettingsRow icon="📄" label="Terms & Privacy" onPress={() => Linking.openURL('https://perkback.com.au/terms')} />
            <View style={styles.divider} />
            <SettingsRow icon="ℹ️" label="About PerkBack" onPress={() => Linking.openURL('https://perkback.com.au')} />
          </View>
        </View>

        {/* Sign out */}
        <View style={styles.signOutWrap}>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PB.bg },
  hero: { alignItems: 'center', paddingTop: 24, paddingBottom: 20, paddingHorizontal: 20 },
  avatar: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: PB.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: PB.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  avatarText: { fontSize: 28, fontFamily: FONTS.extraBold, color: '#fff' },
  heroName: { fontSize: 22, fontFamily: FONTS.extraBold, color: PB.fg, letterSpacing: -0.3 },
  heroCrn: { fontSize: 13, fontFamily: FONTS.mono, color: PB.secondary, marginTop: 4 },
  heroSince: { fontSize: 12, fontFamily: FONTS.regular, color: PB.muted, marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontFamily: FONTS.bold, color: PB.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  editBtn: { fontSize: 14, fontFamily: FONTS.bold, color: PB.secondary },
  editActions: { flexDirection: 'row', gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: PB.border, paddingHorizontal: 16 },
  divider: { height: 1, backgroundColor: PB.borderSoft },
  editForm: { gap: 14 },
  fieldWrap: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: PB.border, paddingHorizontal: 16, paddingVertical: 12 },
  fieldLabel: { fontSize: 11, fontFamily: FONTS.bold, color: PB.muted, marginBottom: 4 },
  fieldInput: { fontSize: 15, fontFamily: FONTS.regular, color: PB.fg, padding: 0 },
  fieldReadOnly: { fontSize: 15, fontFamily: FONTS.regular, color: PB.muted },
  merchantCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: PB.border, padding: 16,
  },
  merchantIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: PB.borderSoft, alignItems: 'center', justifyContent: 'center' },
  merchantName: { fontSize: 15, fontFamily: FONTS.bold, color: PB.fg },
  merchantSub: { fontSize: 12, fontFamily: FONTS.regular, color: PB.secondary, marginTop: 2 },
  signOutWrap: { paddingHorizontal: 20, paddingBottom: 40 },
  signOutBtn: { height: 52, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1.5, borderColor: PB.danger, alignItems: 'center', justifyContent: 'center' },
  signOutText: { fontFamily: FONTS.bold, fontSize: 15, color: PB.danger },
});
