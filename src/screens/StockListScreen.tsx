import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { stockAPI } from '../services/api';
import { colors, radii, spacing } from '../outils/Theme';
import { getLocationsForRoom, getLocationStatus, MAX_PALOX_PER_LOCATION } from '../outils/locations';
import ScreenContainer from '../components/ScreenContainer';
import SelectField, { SelectOption } from '../components/SelectField';

type LoadState = 'loading' | 'ready' | 'error';
type ViewMode = 'list' | 'grid';

interface PaloxItem {
  _id: string;
  barcode?: string;
  productId?: string;
  caliber?: string;
  weight?: number;
  location?: string;
  coldRoomId?: string;
}
interface ColdRoomItem {
  _id: string;
  name?: string;
}

const statusColor = (key: string) => {
  switch (key) {
    case 'full':
      return colors.accentError;
    case 'almost_full':
      return colors.accentWarn;
    default:
      return colors.accentSuccess;
  }
};

// Flexible readers since the exact response shape from getAll isn't confirmed —
// adjust the fallback keys here if your backend uses different field names.
const readPalox = (res: any): PaloxItem[] =>
  res?.data?.palox ?? res?.data?.Palox ?? res?.palox ?? [];
const readColdRooms = (res: any): ColdRoomItem[] =>
  res?.data?.coldRoom ?? res?.data?.coldRooms ?? res?.data?.ColdRooms ?? res?.data?.cold_rooms ?? res?.data?.rooms ?? [];
const readProducts = (res: any): { _id: string; name?: string }[] =>
  res?.data?.product ?? res?.data?.products ?? res?.data?.Products ?? [];

const StockListScreen = ({ navigation }: any) => {
  const [state, setState] = useState<LoadState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [palox, setPalox] = useState<PaloxItem[]>([]);
  const [coldRooms, setColdRooms] = useState<ColdRoomItem[]>([]);
  const [products, setProducts] = useState<{ _id: string; name?: string }[]>([]);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [caliberFilter, setCaliberFilter] = useState<string | null>(null);
  const [varietyFilter, setVarietyFilter] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setState('loading');
    try {
      // getAll should return palox + coldRooms + products in one call — falls
      // back to getStockData (palox only) if that endpoint isn't available.
      let res: any;
      try {
        res = await stockAPI.getAll();
      } catch {
        res = await stockAPI.getStockData();
      }
      const paloxData = readPalox(res);
      const roomsData = readColdRooms(res);
      const productsData = readProducts(res);

      setPalox(paloxData);
      setProducts(productsData);

      if (roomsData.length > 0) {
        setColdRooms(roomsData);
      } else {
        // No dedicated cold-room list available: derive room ids from the palox
        // data itself so the screen still functions.
        const derived = Array.from(new Set(paloxData.map((p) => p.coldRoomId).filter(Boolean))).map(
          (id) => ({ _id: id as string, name: id as string })
        );
        setColdRooms(derived);
      }
      setState('ready');
    } catch (err) {
      console.warn('Stock load error', err);
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedRoomId && coldRooms.length > 0) {
      setSelectedRoomId(coldRooms[0]._id);
    }
  }, [coldRooms, selectedRoomId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const resolveProductLabel = (id?: string) => {
    if (!id) return '—';
    const match = products.find((p) => p._id === id);
    return match?.name ?? id;
  };

  const paloxInRoom = useMemo(
    () => (selectedRoomId ? palox.filter((p) => p.coldRoomId === selectedRoomId) : []),
    [palox, selectedRoomId]
  );

  const caliberOptions: SelectOption[] = useMemo(() => {
    const distinct = Array.from(new Set(palox.map((p) => p.caliber).filter(Boolean))) as string[];
    return distinct.map((c) => ({ label: c, value: c }));
  }, [palox]);

  const varietyOptions: SelectOption[] = useMemo(() => {
    if (products.length > 0) {
      return products.map((p) => ({ label: p.name ?? p._id, value: p._id }));
    }
    const distinct = Array.from(new Set(palox.map((p) => p.productId).filter(Boolean))) as string[];
    return distinct.map((id) => ({ label: resolveProductLabel(id), value: id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, palox]);

  const hasActiveFilter = !!search.trim() || !!caliberFilter || !!varietyFilter;

  const matchesFilters = (p: PaloxItem) => {
    if (caliberFilter && p.caliber !== caliberFilter) return false;
    if (varietyFilter && p.productId !== varietyFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = `${p.barcode ?? ''} ${resolveProductLabel(p.productId)} ${p.location ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  };

  const locations = selectedRoomId ? getLocationsForRoom(selectedRoomId) : [];

  const emplacements = useMemo(() => {
    return locations.map((loc) => {
      const itemsHere = paloxInRoom.filter((p) => p.location === loc);
      const matchCount = itemsHere.filter(matchesFilters).length;
      return {
        location: loc,
        count: itemsHere.length,
        matchCount,
        status: getLocationStatus(itemsHere.length),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, paloxInRoom, search, caliberFilter, varietyFilter]);

  const visibleEmplacements = hasActiveFilter
    ? emplacements.filter((e) => e.matchCount > 0)
    : emplacements;

  const totalPalox = paloxInRoom.length;
  const totalWeight = paloxInRoom.reduce((sum, p) => sum + (p.weight ?? 0), 0);
  const occupationPct =
    locations.length > 0
      ? Math.min(100, Math.round((totalPalox / (locations.length * MAX_PALOX_PER_LOCATION)) * 100))
      : 0;

  const resetFilters = () => {
    setSearch('');
    setCaliberFilter(null);
    setVarietyFilter(null);
  };

  const openLocation = (loc: string) => {
    const itemsHere = paloxInRoom.filter((p) => p.location === loc);
    navigation.navigate('LocationDetail', {
      coldRoomId: selectedRoomId,
      roomLabel: coldRooms.find((r) => r._id === selectedRoomId)?.name ?? selectedRoomId,
      location: loc,
      items: itemsHere,
    });
  };

  const goToReception = () => {
    navigation.navigate('Reception', { coldRoomId: selectedRoomId });
  };

  if (state === 'loading') {
    return (
      <ScreenContainer style={styles.centerFlex}>
        <ActivityIndicator size="large" color={colors.accent} />
      </ScreenContainer>
    );
  }

  if (state === 'error') {
    return (
      <ScreenContainer style={styles.centerFlex}>
        <MaterialCommunityIcons name="alert-circle-outline" size={36} color={colors.accentError} />
        <Text style={styles.errorTitle}>Impossible de charger le stock</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.flex}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="package-variant-closed" size={22} color={colors.accent} />
        <Text style={styles.title}>Stock</Text>
      </View>

      {coldRooms.length === 0 ? (
        <View style={styles.centerBlock}>
          <MaterialCommunityIcons name="fridge-outline" size={36} color={colors.textMuted} />
          <Text style={styles.emptyText}>Aucune chambre froide configurée.</Text>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsRow}
            contentContainerStyle={styles.tabsContent}
          >
            {coldRooms.map((room) => {
              const active = room._id === selectedRoomId;
              return (
                <TouchableOpacity
                  key={room._id}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => setSelectedRoomId(room._id)}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {room.name ?? room._id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{totalPalox}</Text>
              <Text style={styles.kpiLabel}>Total Palox</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{totalWeight.toLocaleString('fr-FR')}</Text>
              <Text style={styles.kpiLabel}>Masse (kg)</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{occupationPct}%</Text>
              <Text style={styles.kpiLabel}>Occupation</Text>
            </View>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchInputWrap}>
              <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} />
              <TextInput
                placeholder="Code palox ou variété…"
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity
              style={styles.viewToggle}
              onPress={() => setViewMode((m) => (m === 'list' ? 'grid' : 'list'))}
              accessibilityLabel="Plan cartographie"
            >
              <MaterialCommunityIcons
                name={viewMode === 'list' ? 'view-grid-outline' : 'view-list-outline'}
                size={20}
                color={colors.accent}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.filtersRow}>
            <View style={styles.filterHalf}>
              <SelectField
                label="Calibre"
                placeholder="Tous"
                value={caliberFilter}
                onChange={setCaliberFilter}
                options={caliberOptions}
                emptyMessage="Aucun calibre enregistré"
              />
            </View>
            <View style={styles.filterHalf}>
              <SelectField
                label="Variété"
                placeholder="Toutes"
                value={varietyFilter}
                onChange={setVarietyFilter}
                options={varietyOptions}
                emptyMessage="Aucune variété enregistrée"
              />
            </View>
          </View>

          {hasActiveFilter && (
            <TouchableOpacity onPress={resetFilters} style={styles.resetLink}>
              <MaterialCommunityIcons name="close-circle-outline" size={14} color={colors.accent} />
              <Text style={styles.resetLinkText}>Réinitialiser les filtres</Text>
            </TouchableOpacity>
          )}

          {visibleEmplacements.length === 0 ? (
            <View style={styles.centerBlock}>
              <Text style={styles.emptyText}>Aucun emplacement ne correspond.</Text>
            </View>
          ) : (
            <FlatList
              key={viewMode}
              data={visibleEmplacements}
              keyExtractor={(e) => e.location}
              numColumns={viewMode === 'grid' ? 3 : 1}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.locationCard, viewMode === 'grid' && styles.locationCardGrid]}
                  onPress={() => openLocation(item.location)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.locationCode}>{item.location}</Text>
                  <View style={styles.locationBadgeRow}>
                    <View style={styles.occupancyBadge}>
                      <Text style={styles.occupancyBadgeText}>
                        {item.count}/{MAX_PALOX_PER_LOCATION} MAX
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusColor(item.status.key) + '22' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor(item.status.key) }]} />
                    <Text style={[styles.statusText, { color: statusColor(item.status.key) }]}>
                      {item.status.label}
                    </Text>
                  </View>
                  {hasActiveFilter && item.matchCount > 0 && (
                    <Text style={styles.matchText}>{item.matchCount} correspondance(s)</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}

      <TouchableOpacity style={styles.fab} onPress={goToReception} activeOpacity={0.9}>
        <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        <Text style={styles.fabText}>Réceptionner Palox</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  centerFlex: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },

  tabsRow: { maxHeight: 44, marginBottom: spacing.lg },
  tabsContent: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#fff' },

  kpiRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  kpiValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  kpiLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: 'center' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  viewToggle: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filtersRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl },
  filterHalf: { flex: 1 },

  resetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginLeft: spacing.xl,
    marginBottom: spacing.sm,
  },
  resetLinkText: { color: colors.accent, fontSize: 12, fontWeight: '700' },

  listContent: { padding: spacing.xl, paddingBottom: 120 },
  locationCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: 4,
  },
  locationCardGrid: { maxWidth: '31%' },
  locationCode: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.sm },
  locationBadgeRow: { flexDirection: 'row', marginBottom: spacing.sm },
  occupancyBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  occupancyBadgeText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  matchText: { fontSize: 11, color: colors.accent, marginTop: 6, fontWeight: '600' },

  centerBlock: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: spacing.xl },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: spacing.md },
  errorTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.lg },
  retryButton: { backgroundColor: colors.accent, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, borderRadius: radii.md },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default StockListScreen;