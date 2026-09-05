import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { stockAPI } from '../services/api';
import { colors, radii, spacing } from '../outils/Theme';
import ScreenContainer from '../components/ScreenContainer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

type LoadState = 'loading' | 'ready' | 'notfound' | 'error';

const StockDetailScreen = ({ route }: any) => {
  const { id } = route.params || {};
  const [item, setItem] = useState<any>(null);
  const [state, setState] = useState<LoadState>('loading');

  useEffect(() => {
    const load = async () => {
      setState('loading');
      try {
        const res = await stockAPI.getStockData();
        const found = res?.data?.palox?.find((p: any) => p._id === id) || null;
        if (!found) {
          setState('notfound');
        } else {
          setItem(found);
          setState('ready');
        }
      } catch (err) {
        console.warn('detail load', err);
        setState('error');
      }
    };
    load();
  }, [id]);

  if (state === 'loading') {
    return (
      <ScreenContainer style={styles.centerFlex}>
        <ActivityIndicator size="large" color={colors.accent} />
      </ScreenContainer>
    );
  }

  if (state === 'notfound') {
    return (
      <ScreenContainer style={styles.centerFlex}>
        <MaterialCommunityIcons name="alert-circle-outline" size={42} color={colors.accentWarn} />
        <Text style={styles.notFoundTitle}>Palox introuvable</Text>
        <Text style={styles.notFoundText}>Cet élément n'existe plus ou a été déplacé.</Text>
      </ScreenContainer>
    );
  }

  if (state === 'error') {
    return (
      <ScreenContainer style={styles.centerFlex}>
        <MaterialCommunityIcons name="alert-circle-outline" size={36} color={colors.accentError} />
        <Text style={styles.notFoundTitle}>Erreur de chargement</Text>
        <Text style={styles.notFoundText}>Impossible de récupérer les détails de ce palox.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.flex}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="package-variant-closed" size={26} color={colors.accent} />
        </View>
        <Text style={styles.title}>{item.barcode}</Text>
        <Text style={styles.subtitle}>{item.productId ?? 'Produit inconnu'}</Text>
      </View>

      <View style={styles.card}>
        <DetailRow label="Variété" value={item.productId ?? '—'} />
        <View style={styles.divider} />
        <DetailRow label="Calibre" value={item.caliber ?? '—'} />
        <View style={styles.divider} />
        <DetailRow label="Poids" value={item.weight !== undefined ? `${item.weight} kg` : '—'} />
        <View style={styles.divider} />
        <DetailRow label="Emplacement" value={item.location ?? '—'} />
        <View style={styles.divider} />
        <DetailRow label="Chambre froide" value={item.coldRoomId ?? '—'} />
      </View>
    </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingBottom: 48 },
  centerFlex: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },

  header: { alignItems: 'center', marginBottom: spacing.xl },
  badge: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.accent + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  badgeText: { color: colors.accent, fontSize: 24, fontWeight: '800' },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: colors.textMuted, fontSize: 14 },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border },

  notFoundTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: spacing.sm },
  notFoundText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});

export default StockDetailScreen;