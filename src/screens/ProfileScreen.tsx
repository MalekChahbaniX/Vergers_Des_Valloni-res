import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../store/AuthContext';

const ProfileScreen = () => {
  const { user, signout } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text>Nom: {user?.name ?? '—'}</Text>
      <Text>Rôle: {user?.role ?? '—'}</Text>
      <Button title="Se déconnecter" onPress={signout} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '700', marginBottom: 12 } });

export default ProfileScreen;
