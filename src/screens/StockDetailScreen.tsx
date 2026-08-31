import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { stockAPI } from '../services/api';

const StockDetailScreen = ({ route }: any) => {
  const { id } = route.params || {};
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await stockAPI.getStockData();
        const found = res?.data?.palox?.find((p: any) => p._id === id) || null;
        setItem(found);
      } catch (err) {
        console.warn('detail load', err);
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (!item) return <View style={styles.container}><Text>Palox introuvable</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.barcode}</Text>
      <Text>Variété: {item.productId}</Text>
      <Text>Calibre: {item.caliber}</Text>
      <Text>Poids: {item.weight}</Text>
      <Text>Emplacement: {item.location}</Text>
      <Text>Chambre froide: {item.coldRoomId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '700', marginBottom: 12 } });

export default StockDetailScreen;
