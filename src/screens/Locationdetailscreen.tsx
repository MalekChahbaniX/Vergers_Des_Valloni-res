import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PaloxCard from '../components/PaloxCard';
import { colors, radii, spacing } from '../outils/Theme';
import ScreenContainer from '../components/ScreenContainer';
import { MAX_PALOX_PER_LOCATION } from '../outils/locations';

const LocationDetailScreen = ({ route, navigation }: any) => {
  const { location, roomLabel, coldRoomId, items = [] } = route.params || {};

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="map-marker-outline" size={26} color={colors.accent} />
        </View>
        <Text style={styles.title}>{location}</Text>
        <Text style={styles.subtitle}>{roomLabel ?? coldRoomId}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {items.length}/{MAX_PALOX_PER_LOCATION} MAX
          </Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.centerBlock}>
          <MaterialCommunityIcons name="package-variant" size={36} color={colors.textMuted} />
          <Text style={styles.emptyText}>Cet emplacement est vide.</Text>
          <TouchableOpacity
            style={styles.receptionButton}
            onPress={() => navigation.navigate('Reception', { coldRoomId, location })}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.receptionButtonText}>Réceptionner ici</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i: any) => i._id}
          contentContainerStyle={styles.listContent}
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
  header: { alignItems: 'center', marginBottom: spacing.xl },
  badge: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.accent + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2, marginBottom: spacing.md },
  countBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  countText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },

  listContent: { paddingBottom: 24 },

  centerBlock: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: colors.textMuted, fontSize: 14, marginTop: spacing.md, marginBottom: spacing.xl },
  receptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
  },
  receptionButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default LocationDetailScreen;