import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { stockAPI } from '../services/api';
import { colors } from '../outils/Theme';
import ScreenContainer from '../components/ScreenContainer';

// ---------- Theme ----------

const ACCENT = colors.accent;
const ACCENT_ERROR = '#FF4D6D';
const ACCENT_ALT = colors.accentSuccess;
const ACCENT_WARN = colors.accentOrange;
const BG = colors.bg;
const CARD_BG = colors.card;
const BORDER = colors.border;
const TEXT_PRIMARY = colors.textPrimary;
const TEXT_MUTED = colors.textMuted;

// ---------- Types ----------

interface StockStats {
  count?: number;
  weight?: number;
  products?: { name?: string }[];
}

interface OperationalAlert {
  type: 'capacity' | 'temperature';
  severity: 'warning' | 'critical';
  message: string;
}

type LoadState = 'loading' | 'ready' | 'error';
type MenuIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
// ---------- Stat Card ----------

const StatCard: React.FC<{
  label: string;
  value: string;
  accent: string;
  icon: MenuIcon;
  wide?: boolean;
}> = ({ label, value, accent, icon, wide }) => (
  <View style={[styles.card, wide && styles.cardWide]}>
    <View style={[styles.cardIconWrap, { backgroundColor: accent + '22' }]}>
      <MaterialCommunityIcons name={icon} size={20} color={accent} />
    </View>
    <View style={styles.cardTextWrap}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  </View>
);

// ---------- Dashboard Screen ----------

const DashboardScreen = () => {
  const { width } = useWindowDimensions();
  const [stats, setStats] = useState<StockStats | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setState('loading');
    try {
      const res = await stockAPI.statistics();
      const data = res?.data?.stats;
      setStats(data ?? null);
      try {
        const alertResponse = await stockAPI.alerts();
        setAlerts(alertResponse?.data?.alerts ?? []);
      } catch (alertError) {
        console.warn('Operational alerts unavailable', alertError);
      }
      setState('ready');
    } catch (err) {
      console.warn('Dashboard load error', err);
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const formatWeight = (w?: number) => {
    if (w === undefined || w === null) return '—';
    return `${w.toLocaleString('fr-FR')} kg`;
  };

  const hasNoData =
    state === 'ready' &&
    (!stats || (stats.count === undefined && stats.weight === undefined && !stats.products));

  const isWide = width >= 600;
  return (
    <ScreenContainer style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ACCENT}
            colors={[ACCENT]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.subtitle}>Vue d'ensemble du stock</Text>
        </View>

        {alerts.map((alert, index) => (
          <View key={`${alert.type}-${index}`} style={[styles.alertBanner, alert.severity === 'critical' && styles.alertCritical]}>
            <MaterialCommunityIcons
              name={alert.type === 'temperature' ? 'thermometer-alert' : 'alert-circle-outline'}
              size={19}
              color={alert.severity === 'critical' ? ACCENT_ERROR : ACCENT_WARN}
            />
            <Text style={styles.alertText}>{alert.message}</Text>
          </View>
        ))}

        {state === 'loading' && (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color={ACCENT} />
            <Text style={styles.centerText}>Chargement des statistiques…</Text>
          </View>
        )}

        {state === 'error' && (
          <View style={styles.centerBlock}>
            <View style={[styles.cardIconWrap, { backgroundColor: ACCENT_ERROR + '22' }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={22} color={ACCENT_ERROR} />
            </View>
            <Text style={styles.errorTitle}>Impossible de charger les données</Text>
            <Text style={styles.centerText}>
              Vérifiez votre connexion puis réessayez.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {state === 'ready' && hasNoData && (
          <View style={styles.centerBlock}>
            <View style={[styles.cardIconWrap, { backgroundColor: ACCENT_WARN + '22' }]}>
              <MaterialCommunityIcons name="information-outline" size={22} color={ACCENT_WARN} />
            </View>
            <Text style={styles.errorTitle}>Aucune donnée disponible</Text>
            <Text style={styles.centerText}>
              Les statistiques apparaîtront ici dès qu'il y aura du stock enregistré.
            </Text>
          </View>
        )}

        {state === 'ready' && !hasNoData && (
          <View style={[styles.cardsWrap, isWide && styles.cardsWrapWide]}>
            <StatCard
              label="Total Palox"
              value={stats?.count !== undefined ? String(stats.count) : '—'}
              accent={ACCENT}
              icon="package-variant-closed"
              wide={isWide}
            />
            <StatCard
              label="Tonnage"
              value={formatWeight(stats?.weight)}
              accent={ACCENT_ALT}
              icon="scale-balance"
              wide={isWide}
            />
            <StatCard
              label="Variétés"
              value={stats?.products?.length !== undefined ? String(stats.products.length) : '—'}
              accent={ACCENT_WARN}
              icon="creation-outline"
              wide={isWide}
            />
          </View>
        )}
      </ScrollView>

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BG },
  container: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 24 },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  titleWrap: { flex: 1, minWidth: 0 },
  title: { fontSize: 26, fontWeight: '800', color: TEXT_PRIMARY },
  subtitle: { fontSize: 14, color: TEXT_MUTED },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 10, borderRadius: 12, backgroundColor: ACCENT_WARN + '18' },
  alertCritical: { backgroundColor: ACCENT_ERROR + '18' },
  alertText: { flex: 1, color: TEXT_PRIMARY, fontSize: 13, fontWeight: '700' },
  menuButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    paddingTop: 10,
    zIndex: 1,
  },
  menuIcon: { color: ACCENT, fontSize: 22, fontWeight: '700' },

  cardsWrap: { gap: 12 },
  cardsWrapWide: { flexDirection: 'row', flexWrap: 'nowrap' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardWide: { flex: 1, minWidth: 0, marginBottom: 0 },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardIcon: { fontSize: 20, fontWeight: '800' },
  cardTextWrap: { flex: 1 },
  cardValue: { fontSize: 20, fontWeight: '800', color: TEXT_PRIMARY, marginBottom: 2 },
  cardLabel: { fontSize: 13, color: TEXT_MUTED },

  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  centerText: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  errorTitle: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  retryButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  menuOverlay: { flex: 1, flexDirection: 'row' },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(36,50,37,0.35)' },
  menuPanel: {
    width: 280,
    maxWidth: '82%',
    backgroundColor: CARD_BG,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    borderLeftWidth: 1,
    borderLeftColor: BORDER,
    elevation: 12,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuTitle: { color: TEXT_PRIMARY, fontSize: 24, fontWeight: '800' },
  menuSubtitle: { color: TEXT_MUTED, fontSize: 13, marginTop: 3 },
  closeButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { color: TEXT_MUTED, fontSize: 28, fontWeight: '300' },
  menuItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  menuItemIcon: { width: 30, color: ACCENT, fontSize: 20, textAlign: 'center' },
  menuItemText: { color: TEXT_PRIMARY, fontSize: 15, fontWeight: '600', marginLeft: 10 },
  menuDivider: { height: 1, backgroundColor: BORDER, marginVertical: 18 },
  menuLogout: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 52 },
  menuLogoutIcon: { width: 30, color: ACCENT_WARN, fontSize: 21, textAlign: 'center' },
  menuLogoutText: { color: ACCENT_WARN, fontSize: 15, fontWeight: '700', marginLeft: 10 },
});

export default DashboardScreen;