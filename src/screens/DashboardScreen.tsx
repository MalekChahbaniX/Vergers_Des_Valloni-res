import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { BarChart3, Boxes, CircleAlert, Info, LayoutDashboard, Menu, Package, Plus, Search, UserCircle, LogOut, X, Scale, Sparkles } from 'lucide-react-native';
import { stockAPI } from '../services/api';
import { useAuth } from '../store/AuthContext';
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

type LoadState = 'loading' | 'ready' | 'error';
type MenuIcon = typeof LayoutDashboard;

type MenuItem = {
  screen: string;
  icon: MenuIcon;
  label: string;
};

// ---------- Stat Card ----------

const StatCard: React.FC<{
  label: string;
  value: string;
  accent: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  wide?: boolean;
}> = ({ label, value, accent, icon, wide }) => (
  <View style={[styles.card, wide && styles.cardWide]}>
    <View style={[styles.cardIconWrap, { backgroundColor: accent + '22' }]}>
      {React.createElement(icon, { size: 20, color: accent, strokeWidth: 2.4 })}
    </View>
    <View style={styles.cardTextWrap}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  </View>
);

// ---------- Dashboard Screen ----------

const DashboardScreen = ({ navigation }: any) => {
  const { signout } = useAuth();
  const { width } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [stats, setStats] = useState<StockStats | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setState('loading');
    try {
      const res = await stockAPI.statistics();
      const data = res?.data?.stats;
      setStats(data ?? null);
      setState('ready');
    } catch (err) {
      console.warn('Dashboard load error', err);
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

  const formatWeight = (w?: number) => {
    if (w === undefined || w === null) return '—';
    return `${w.toLocaleString('fr-FR')} kg`;
  };

  const hasNoData =
    state === 'ready' &&
    (!stats || (stats.count === undefined && stats.weight === undefined && !stats.products));

  const isWide = width >= 600;
  const navigateTo = (screen: string) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

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
          <View style={styles.headerTop}>
            <View style={styles.titleWrap}>
              <Text style={styles.title} numberOfLines={1}>Tableau de bord</Text>
              <Text style={styles.subtitle}>Vue d'ensemble du stock</Text>
            </View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Ouvrir le menu"
            >
              <Menu size={22} color={ACCENT} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {state === 'loading' && (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color={ACCENT} />
            <Text style={styles.centerText}>Chargement des statistiques…</Text>
          </View>
        )}

        {state === 'error' && (
          <View style={styles.centerBlock}>
            <View style={[styles.cardIconWrap, { backgroundColor: ACCENT_ERROR + '22' }]}>
              <CircleAlert size={22} color={ACCENT_ERROR} strokeWidth={2.4} />
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
              <Info size={22} color={ACCENT_WARN} strokeWidth={2.4} />
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
              icon={Boxes}
              wide={isWide}
            />
            <StatCard
              label="Tonnage"
              value={formatWeight(stats?.weight)}
              accent={ACCENT_ALT}
              icon={Scale}
              wide={isWide}
            />
            <StatCard
              label="Variétés"
              value={stats?.products?.length !== undefined ? String(stats.products.length) : '—'}
              accent={ACCENT_WARN}
              icon={Sparkles}
              wide={isWide}
            />
          </View>
        )}
      </ScrollView>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)} />
          <View style={styles.menuPanel}>
            <View style={styles.menuHeader}>
              <View>
                <Text style={styles.menuTitle}>Menu</Text>
                <Text style={styles.menuSubtitle}>Gestion du stock</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setMenuVisible(false)}
                accessibilityLabel="Fermer le menu"
              >
                <X size={24} color={TEXT_MUTED} />
              </TouchableOpacity>
            </View>

            {([
              { screen: 'Dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
              { screen: 'StockList', icon: Package, label: 'Stock' },
              { screen: 'Reception', icon: Plus, label: 'Réception' },
              { screen: 'Search', icon: Search, label: 'Recherche' },
              { screen: 'Statistics', icon: BarChart3, label: 'Statistiques' },
              { screen: 'Profile', icon: UserCircle, label: 'Profil' },
            ] as MenuItem[]).map(({ screen, icon: Icon, label }) => (
              <TouchableOpacity
                key={screen}
                style={styles.menuItem}
                onPress={() => navigateTo(screen)}
                accessibilityRole="button"
              >
                <Icon size={20} color={ACCENT} strokeWidth={2.2} />
                <Text style={styles.menuItemText}>{label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuLogout} onPress={signout}>
              <LogOut size={20} color={ACCENT_WARN} strokeWidth={2.2} />
              <Text style={styles.menuLogoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  cardsWrapWide: { flexDirection: 'row', flexWrap: 'wrap' },
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
  cardWide: { width: '31%', minWidth: 180 },
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