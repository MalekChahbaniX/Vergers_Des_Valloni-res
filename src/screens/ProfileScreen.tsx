import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { colors, radii, spacing } from '../outils/Theme';
import StatusPopup, { PopupState } from '../components/StatusPopup';
import ScreenContainer from '../components/ScreenContainer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const initials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
};

const ProfileScreen = () => {
  const { user, signout } = useAuth();

  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });
  const closePopup = () => setPopup((p) => ({ ...p, visible: false }));

  const confirmSignout = () => {
    setPopup({
      visible: true,
      type: 'error',
      title: 'Se déconnecter ?',
      message: 'Vous devrez vous reconnecter pour accéder à votre compte.',
      confirmLabel: 'Déconnexion',
      cancelLabel: 'Annuler',
      onConfirm: signout,
      onCancel: () => {},
    });
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account-circle-outline" size={42} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.name ?? '—'}</Text>
        {user?.role ? (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nom</Text>
          <Text style={styles.infoValue}>{user?.name ?? '—'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rôle</Text>
          <Text style={styles.infoValue}>{user?.role ?? '—'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signoutButton} onPress={confirmSignout} activeOpacity={0.85}>
        <MaterialCommunityIcons name="logout" size={18} color={colors.accentError} />
        <Text style={styles.signoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <StatusPopup state={popup} onClose={closePopup} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  header: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.xxl },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  name: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: spacing.sm },
  roleBadge: {
    backgroundColor: colors.accent + '22',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  roleText: { color: colors.accent, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },

  infoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  infoLabel: { color: colors.textMuted, fontSize: 14 },
  infoValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border },

  signoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentError,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  signoutText: { color: colors.accentError, fontSize: 15, fontWeight: '700' },
});

export default ProfileScreen;