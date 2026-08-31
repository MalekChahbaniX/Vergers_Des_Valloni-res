import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { stockAPI } from '../services/api';
import PaloxCard from '../components/PaloxCard';

const StockListScreen = ({ navigation }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await stockAPI.getStockData();
      setItems(res?.data?.palox || []);
    } catch (err) {
      console.warn('Stock load', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock</Text>
      <FlatList data={items} keyExtractor={(i) => i._id} renderItem={({ item }) => <PaloxCard item={item} onPress={() => navigation.navigate('StockDetail', { id: item._id })} />} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '700', marginBottom: 12 } });

export default StockListScreen;
