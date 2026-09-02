import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { colors, radii, spacing } from '../outils/Theme';

export type PopupType = 'error' | 'success' | 'info';

export interface PopupState {
  visible: boolean;
  type: PopupType;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
}

export const popupAccent = (type: PopupType) => {
  switch (type) {
    case 'error':
      return colors.accentError;
    case 'success':
      return colors.accentSuccess;
    default:
      return colors.accent;
  }
};

const StatusPopup: React.FC<{
  state: PopupState;
  onClose: () => void;
}> = ({ state, onClose }) => {
  const color = popupAccent(state.type);

  const handleConfirm = () => {
    state.onConfirm?.();
    onClose();
  };

  return (
    <Modal visible={state.visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.card, { borderColor: color }]} onPress={() => {}}>
          <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
            <Text style={[styles.icon, { color }]}>
              {state.type === 'error' ? '!' : state.type === 'success' ? '✓' : 'i'}
            </Text>
          </View>
          <Text style={styles.title}>{state.title}</Text>
          <Text style={styles.message}>{state.message}</Text>

          {state.onCancel ? (
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.button, styles.buttonGhost]}
                onPress={() => {
                  state.onCancel?.();
                  onClose();
                }}
              >
                <Text style={styles.buttonGhostText}>{state.cancelLabel ?? 'Annuler'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: color }]}
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>{state.confirmLabel ?? 'OK'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.buttonFull, { backgroundColor: color }]}
              onPress={handleConfirm}
            >
              <Text style={styles.buttonText}>{state.confirmLabel ?? 'OK'}</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 26, fontWeight: '800' },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  row: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  buttonFull: { width: '100%' },
  buttonGhost: { backgroundColor: colors.border, flex: 1 },
  buttonGhostText: { color: colors.textPrimary, fontWeight: '700', fontSize: 15 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default StatusPopup;