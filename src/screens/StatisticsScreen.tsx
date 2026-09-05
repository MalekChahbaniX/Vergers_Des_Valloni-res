import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { stockAPI } from '../services/api';
import { colors, radii, spacing } from '../outils/Theme';
import ScreenContainer from '../components/ScreenContainer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface StockStats {
  count?: number;
  weight?: number;
}

type LoadState = 'loading' | 'ready' | 'error';

const StatRow: React.FC<{ label: string; value: string; accent: string }> = ({
  label,
  value,
  accent,
}) => (
  <View style={styles.row}>
    <View style={[styles.dot, { backgroundColor: accent }]} />
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const StatisticsScreen = () => {
  const [stats, setStats] = useState<StockStats | null>(null);
  const [state, setState] = useState<LoadState>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await stockAPI.statistics();
      setStats(res?.data?.stats ?? null);
      setState('ready');
    } catch (err) {
      console.warn(err);
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenContainer style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="chart-bar" size={24} color={colors.accent} />
        <Text style={styles.title}>Statistiques</Text>
      </View>

      {state === 'loading' && (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}

      {state === 'error' && (
        <View style={styles.centerBlock}>
          <Text style={styles.errorText}>Impossible de charger les statistiques.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {state === 'ready' && (
        <View style={styles.card}>
          <StatRow label="Total Palox" value={stats?.count !== undefined ? String(stats.count) : '—'} accent={colors.accent} />
          <View style={styles.divider} />
          <StatRow
            label="Tonnage"
            value={stats?.weight !== undefined ? `${stats.weight.toLocaleString('fr-FR')} kg` : '—'}
            accent={colors.accentSuccess}
          />
        </View>
      )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xl },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.md },
  rowLabel: { flex: 1, color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border },

  centerBlock: { alignItems: 'center', paddingVertical: 48 },
  errorText: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.lg, textAlign: 'center' },
  retryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.md,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default StatisticsScreen;