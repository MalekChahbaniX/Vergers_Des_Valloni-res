import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { stockAPI } from '../services/api';

const DashboardScreen = () => {
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await stockAPI.statistics();
      setStats(res?.data?.stats || res?.data?.stats);
    } catch (err) {
      console.warn('Dashboard load error', err);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
      <Text style={styles.title}>Tableau de bord</Text>
      <View style={styles.card}><Text>Total Palox: {stats?.count ?? '—'}</Text></View>
      <View style={styles.card}><Text>Tonnage: {stats?.weight ?? '—'}</Text></View>
      <View style={styles.card}><Text>Variétés: {stats?.products?.length ?? '—'}</Text></View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { padding: 16 }, title: { fontSize: 22, fontWeight: '700', marginBottom: 12 }, card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 } });

export default DashboardScreen;
