import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Palox } from '../types';

const PaloxCard = ({ item, onPress }: { item: Palox; onPress?: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.title}>{item.barcode || '—'}</Text>
    <Text>Variété: {item.productId || '—'}</Text>
    <Text>Calibre: {item.caliber || '—'}</Text>
    <Text>Emplacement: {item.location || '—'}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 8, elevation: 1 },
  title: { fontWeight: '700', marginBottom: 4 },
});

export default PaloxCard;
