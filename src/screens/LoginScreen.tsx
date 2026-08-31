import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { authAPI } from '../services/api';
import { useAuth } from '../store/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signin } = useAuth();

  const handleLogin = async () => {
    try {
      const res = await authAPI.signin({ email, password });
      // backend returns token and user? adapt if different
      const token = res?.token || null;
      const user = res?.user || { id: res?.data?._id, name: res?.data?.name };
      if (!token && !user) {
        Alert.alert('Erreur', 'Réponse invalide du serveur');
        return;
      }
      signin(token, user);
    } catch (err: any) {
      Alert.alert('Connexion échouée', err.message || String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <Button title="Se connecter" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 },
});

export default LoginScreen;
