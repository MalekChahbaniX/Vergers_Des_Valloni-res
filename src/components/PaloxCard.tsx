import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../outils/Theme';

interface PaloxCardProps {
  item: {
    _id: string;
    barcode?: string;
    productId?: string;
    caliber?: string;
    weight?: number;
    location?: string;
    coldRoomId?: string;
  };
  onPress?: () => void;
}

const PaloxCard: React.FC<PaloxCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>▣</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.barcode}>{item.barcode || 'Sans code'}</Text>
        <Text style={styles.meta}>
          {item.productId || '—'}
          {item.caliber ? ` · Calibre ${item.caliber}` : ''}
        </Text>
        <View style={styles.tagsRow}>
          {item.location ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.location}</Text>
            </View>
          ) : null}
          {item.coldRoomId ? (
            <View style={[styles.tag, styles.tagAlt]}>
              <Text style={[styles.tagText, styles.tagTextAlt]}>{item.coldRoomId}</Text>
            </View>
          ) : null}
        </View>
      </View>
      {item.weight !== undefined && (
        <View style={styles.weightWrap}>
          <Text style={styles.weightValue}>{item.weight}</Text>
          <Text style={styles.weightUnit}>kg</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.accent + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: { color: colors.accent, fontSize: 18, fontWeight: '800' },
  info: { flex: 1 },
  barcode: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  meta: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
  tagsRow: { flexDirection: 'row', gap: spacing.sm },
  tag: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  tagAlt: { backgroundColor: colors.accentSuccess + '22' },
  tagText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  tagTextAlt: { color: colors.accentSuccess },
  weightWrap: { alignItems: 'flex-end', marginLeft: spacing.sm },
  weightValue: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  weightUnit: { color: colors.textMuted, fontSize: 11 },
});

export default PaloxCard;