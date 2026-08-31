import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { stockAPI } from '../services/api';
import PaloxCard from '../components/PaloxCard';

const SearchScreen = ({ navigation }: any) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const doSearch = async () => {
    try {
      const res = await stockAPI.statistics(`search=${encodeURIComponent(q)}`);
      setResults(res?.data?.palox || []);
    } catch (err) { console.warn(err); }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Rechercher" value={q} onChangeText={setQ} style={styles.input} />
      <Button title="Recherche" onPress={doSearch} />
      <FlatList data={results} keyExtractor={(i) => i._id} renderItem={({ item }) => <PaloxCard item={item} onPress={() => navigation.navigate('StockDetail', { id: item._id })} />} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 8 } });

export default SearchScreen;
