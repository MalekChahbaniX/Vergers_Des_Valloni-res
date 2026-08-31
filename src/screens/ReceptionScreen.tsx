import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { stockAPI } from '../services/api';

const ReceptionScreen = () => {
  const [barcode, setBarcode] = useState('');
  const [productId, setProductId] = useState('');
  const [caliber, setCaliber] = useState('');
  const [coldRoomId, setColdRoomId] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async () => {
    try {
      const body = { barcode, productId, caliber, coldRoomId, location, dateAdded: new Date().toISOString(), userId: null, roomname: '' };
      const res = await stockAPI.addPalox(body);
      Alert.alert('Succès', 'Palox enregistré');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réception Palox</Text>
      <TextInput placeholder="Code barre" value={barcode} onChangeText={setBarcode} style={styles.input} />
      <TextInput placeholder="ProductId" value={productId} onChangeText={setProductId} style={styles.input} />
      <TextInput placeholder="Calibre" value={caliber} onChangeText={setCaliber} style={styles.input} />
      <TextInput placeholder="Chambre froide Id" value={coldRoomId} onChangeText={setColdRoomId} style={styles.input} />
      <TextInput placeholder="Emplacement" value={location} onChangeText={setLocation} style={styles.input} />
      <Button title="Enregistrer" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '700', marginBottom: 12 }, input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 8 } });

export default ReceptionScreen;
