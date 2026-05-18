import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PB, FONTS } from '../../constants/theme';

interface Props {
  size?: 'large' | 'small';
  dark?: boolean; // for use on dark backgrounds (splash)
}

export default function PerkBackLogo({ size = 'small', dark = false }: Props) {
  const isLarge = size === 'large';
  const iconSize = isLarge ? 72 : 40;
  const iconRadius = isLarge ? 18 : 10;
  const wordmarkSize = isLarge ? 30 : 18;
  const textColor = dark ? '#fff' : PB.fg;
  const goldColor = dark ? '#ffd07a' : PB.accentStrong;

  return (
    <View style={[styles.row, isLarge && styles.rowLarge]}>
      {/* Icon: gift box */}
      <View style={[styles.icon, { width: iconSize, height: iconSize, borderRadius: iconRadius }]}>
        <View style={[styles.ribbon, isLarge ? styles.ribbonLg : styles.ribbonSm]} />
        <View style={[styles.ribbonH, isLarge ? styles.ribbonHLg : styles.ribbonHSm]} />
        <View style={[styles.check, isLarge ? styles.checkLg : styles.checkSm]}>
          <Text style={[styles.checkMark, { fontSize: isLarge ? 11 : 7 }]}>✓</Text>
        </View>
      </View>
      {/* Wordmark */}
      <View style={styles.wordmark}>
        <Text style={[styles.perk, { fontSize: wordmarkSize, color: dark ? '#fff' : PB.primary }]}>
          Perk<Text style={{ color: goldColor }}>Back</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLarge: { gap: 14 },
  icon: {
    backgroundColor: PB.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PB.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  ribbon: {
    position: 'absolute',
    backgroundColor: '#ffd07a',
    borderRadius: 2,
  },
  ribbonSm: { width: 2, height: 28, top: 0 },
  ribbonLg: { width: 3, height: 50, top: 0 },
  ribbonH: {
    position: 'absolute',
    backgroundColor: '#ffd07a',
    borderRadius: 2,
  },
  ribbonHSm: { height: 2, width: 28, top: 13 },
  ribbonHLg: { height: 3, width: 50, top: 24 },
  check: {
    position: 'absolute',
    backgroundColor: '#ffd07a',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  checkSm: { width: 14, height: 14, bottom: -3, right: -3 },
  checkLg: { width: 22, height: 22, bottom: -4, right: -4 },
  checkMark: { color: PB.primary, fontFamily: FONTS.bold, lineHeight: 14 },
  wordmark: {},
  perk: { fontFamily: FONTS.extraBold, letterSpacing: -0.5 },
});
