import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { PB, FONTS } from '../../src/constants/theme';
import PerkBackLogo from '../../src/components/ui/PerkBackLogo';

const MERCHANT_SIGNUP_URL = 'https://perkback.com.au/signup';

const PERKS = [
  { icon: '💳', title: 'Accept payments', desc: 'Seamlessly process loyalty points at checkout' },
  { icon: '🎁', title: 'Create rewards', desc: 'Design custom offers that keep customers coming back' },
  { icon: '📊', title: 'Track customers', desc: 'See visit patterns, top spenders and campaign results' },
];

export default function MerchantSignupScreen() {
  const router = useRouter();

  const handleGetStarted = async () => {
    const supported = await Linking.canOpenURL(MERCHANT_SIGNUP_URL);
    if (supported) {
      await Linking.openURL(MERCHANT_SIGNUP_URL);
    } else {
      Alert.alert('Could not open', 'Visit perkback.com.au/signup to register your store.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoArea}>
          <PerkBackLogo size="small" />
        </View>

        <Text style={styles.title}>Set up your store{'\n'}on PerkBack</Text>
        <Text style={styles.sub}>
          Join hundreds of local Australian businesses rewarding loyal customers every day.
        </Text>

        <View style={styles.perks}>
          {PERKS.map((p) => (
            <View key={p.icon} style={styles.perkRow}>
              <View style={styles.perkIcon}>
                <Text style={styles.perkEmoji}>{p.icon}</Text>
              </View>
              <View style={styles.perkText}>
                <Text style={styles.perkTitle}>{p.title}</Text>
                <Text style={styles.perkDesc}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.88} style={styles.ctaWrap}>
          <LinearGradient
            colors={[PB.primary, '#1a4699']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Continue at perkback.com.au →</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.hint}>Opens in your browser · Free to get started</Text>

        <TouchableOpacity
          style={styles.signInRow}
          onPress={() => router.push('/(auth)/sign-in')}
        >
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PB.bg },
  topBar: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', borderWidth: 1, borderColor: PB.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: PB.fg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  logoArea: { marginBottom: 28 },
  title: {
    fontSize: 30, fontFamily: FONTS.extraBold, color: PB.fg,
    letterSpacing: -0.5, lineHeight: 36, marginBottom: 12,
  },
  sub: {
    fontSize: 14, fontFamily: FONTS.regular, color: PB.muted,
    lineHeight: 21, marginBottom: 32,
  },
  perks: { gap: 20, marginBottom: 36 },
  perkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  perkIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: PB.borderSoft, alignItems: 'center', justifyContent: 'center',
  },
  perkEmoji: { fontSize: 20 },
  perkText: { flex: 1 },
  perkTitle: { fontSize: 15, fontFamily: FONTS.bold, color: PB.fg, marginBottom: 3 },
  perkDesc: { fontSize: 13, fontFamily: FONTS.regular, color: PB.muted, lineHeight: 18 },
  ctaWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  cta: {
    height: 56, alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff' },
  hint: {
    textAlign: 'center', fontSize: 12, fontFamily: FONTS.regular,
    color: PB.muted, marginBottom: 24,
  },
  signInRow: { alignItems: 'center' },
  signInText: { fontSize: 13, fontFamily: FONTS.regular, color: PB.muted },
  signInLink: { fontFamily: FONTS.bold, color: PB.secondary, textDecorationLine: 'underline' },
});
