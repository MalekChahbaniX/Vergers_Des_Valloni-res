import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../outils/Theme';
import { useAuth } from '../store/AuthContext';

type MenuIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type MenuItem = {
  screen: string;
  icon: MenuIcon;
  label: string;
  adminOnly?: boolean;
};

const menuItems: MenuItem[] = [
  { screen: 'Dashboard', icon: 'view-dashboard-outline', label: 'Tableau de bord' },
  { screen: 'StockList', icon: 'package-variant-closed', label: 'Stock' },
  { screen: 'Reception', icon: 'plus', label: 'Réception' },
  { screen: 'Search', icon: 'magnify', label: 'Recherche' },
  { screen: 'Statistics', icon: 'chart-bar', label: 'Statistiques', adminOnly: true },
  { screen: 'Profile', icon: 'account-circle-outline', label: 'Profil' },
];

const isAdmin = (role?: string) => (role ?? '').toLowerCase() === 'admin';

const AppMenuHeader = ({ navigation, route }: any) => {
  const { user, signout } = useAuth();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const visibleItems = menuItems.filter((item) => !item.adminOnly || isAdmin(user?.role));

  const navigateTo = (screen: string) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  return (
    <>
      {/* This is a fully custom native-stack header, so React Navigation does
          NOT reserve the status bar / notch height for us — we have to. */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.title} numberOfLines={1}>
          {route?.name === 'Dashboard' ? 'Tableau de bord' : route?.name === 'StockList' ? 'Stock' : route?.name}
        </Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le menu"
        >
          <MaterialCommunityIcons name="menu" size={23} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setMenuVisible(false)} />
          <View style={styles.panel}>
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
                <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {visibleItems.map(({ screen, icon, label }) => (
              <TouchableOpacity
                key={screen}
                style={styles.menuItem}
                onPress={() => navigateTo(screen)}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name={icon} size={20} color={colors.accent} />
                <Text style={styles.menuItemText}>{label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />
            <TouchableOpacity style={styles.logout} onPress={signout}>
              <MaterialCommunityIcons name="logout" size={20} color={colors.accentWarn} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { flex: 1, color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
  menuButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(36,50,37,0.35)' },
  panel: {
    width: 290,
    padding: 18,
    backgroundColor: colors.card,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  menuHeader: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  menuTitle: { color: colors.textPrimary, fontSize: 24, fontWeight: '800' },
  menuSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  closeButton: { padding: 6 },
  menuItem: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  menuItemText: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', marginLeft: 12 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
  logout: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  logoutText: { color: colors.accentWarn, fontSize: 15, fontWeight: '700', marginLeft: 12 },
});

export default AppMenuHeader;