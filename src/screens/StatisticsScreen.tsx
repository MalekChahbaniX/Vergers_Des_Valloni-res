import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { stockAPI } from '../services/api';

const StatisticsScreen = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await stockAPI.statistics();
        setStats(res?.data?.stats || res?.data?.stats);
      } catch (err) { console.warn(err); }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistiques</Text>
      <Text>Total Palox: {stats?.count ?? '—'}</Text>
      <Text>Tonnage: {stats?.weight ?? '—'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '700', marginBottom: 12 } });

export default StatisticsScreen;
