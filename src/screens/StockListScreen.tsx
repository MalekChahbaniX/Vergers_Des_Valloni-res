import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { stockAPI } from '../services/api';
import PaloxCard from '../components/PaloxCard';
import { colors, radii, spacing } from '../outils/Theme';
import ScreenContainer from '../components/ScreenContainer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type LoadState = 'loading' | 'ready' | 'error';

const StockListScreen = ({ navigation }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setState('loading');
    try {
      const res = await stockAPI.getStockData();
      setItems(res?.data?.palox || []);
      setState('ready');
    } catch (err) {
      console.warn('Stock load', err);
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  if (state === 'loading') {
    return (
      <ScreenContainer style={styles.centerFlex}>
        <ActivityIndicator size="large" color={colors.accent} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="package-variant-closed" size={24} color={colors.accent} />
        <Text style={styles.title}>Stock</Text>
        {state === 'ready' && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.length}</Text>
          </View>
        )}
      </View>

      {state === 'error' && (
        <View style={styles.centerBlock}>
          <Text style={styles.errorText}>Impossible de charger le stock.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {state === 'ready' && items.length === 0 && (
        <View style={styles.centerBlock}>
          <Text style={styles.emptyText}>Aucun palox enregistré pour le moment.</Text>
        </View>
      )}

      {state === 'ready' && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
          }
          renderItem={({ item }) => (
            <PaloxCard item={item} onPress={() => navigation.navigate('StockDetail', { id: item._id })} />
          )}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  centerFlex: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginRight: spacing.sm },
  countBadge: {
    backgroundColor: colors.accent + '22',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: { color: colors.accent, fontSize: 12, fontWeight: '700' },

  listContent: { paddingBottom: 24 },

  centerBlock: { alignItems: 'center', paddingVertical: 48 },
  errorText: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.lg, textAlign: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  retryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.md,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default StockListScreen;