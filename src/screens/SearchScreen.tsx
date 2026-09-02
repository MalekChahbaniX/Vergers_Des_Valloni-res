import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { stockAPI } from '../services/api';
import PaloxCard from '../components/PaloxCard';
import { colors, radii, spacing } from '../outils/Theme';
import ScreenContainer from '../components/ScreenContainer';
import { Search, X } from 'lucide-react-native';

type SearchState = 'idle' | 'loading' | 'ready' | 'error';

const SearchScreen = ({ navigation }: any) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [state, setState] = useState<SearchState>('idle');

  const doSearch = async () => {
    if (!q.trim()) return;
    setState('loading');
    try {
      const res = await stockAPI.statistics(`search=${encodeURIComponent(q)}`);
      const data = res?.data?.palox || [];
      setResults(data);
      setState('ready');
    } catch (err) {
      console.warn(err);
      setState('error');
    }
  };

  const clear = () => {
    setQ('');
    setResults([]);
    setState('idle');
  };

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>Recherche</Text>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Code barre, produit, emplacement…"
          placeholderTextColor={colors.textMuted}
          value={q}
          onChangeText={setQ}
          onSubmitEditing={doSearch}
          returnKeyType="search"
          style={styles.input}
        />
        {q.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clear}>
            <X size={17} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.searchButton} onPress={doSearch} activeOpacity={0.85}>
        <View style={styles.searchButtonContent}>
          <Search size={18} color="#fff" />
          <Text style={styles.searchButtonText}>Rechercher</Text>
        </View>
      </TouchableOpacity>

      {state === 'loading' && (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}

      {state === 'error' && (
        <View style={styles.centerBlock}>
          <Text style={styles.errorText}>La recherche a échoué. Réessayez.</Text>
        </View>
      )}

      {state === 'ready' && results.length === 0 && (
        <View style={styles.centerBlock}>
          <Text style={styles.emptyText}>Aucun résultat pour « {q} »</Text>
        </View>
      )}

      {state === 'ready' && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(i) => i._id}
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
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },

  searchRow: { position: 'relative', justifyContent: 'center', marginBottom: spacing.md },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    paddingRight: 40,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearButton: { position: 'absolute', right: spacing.md, padding: spacing.xs },
  clearText: { color: colors.textMuted, fontSize: 16 },

  searchButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  searchButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  searchButtonContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },

  listContent: { paddingBottom: 24 },

  centerBlock: { alignItems: 'center', paddingVertical: 40 },
  errorText: { color: colors.accentError, fontSize: 14 },
  emptyText: { color: colors.textMuted, fontSize: 14 },
});

export default SearchScreen;