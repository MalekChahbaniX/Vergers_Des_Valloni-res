import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../outils/Theme';

type BarcodeScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onCode: (code: string) => void;
};

const BarcodeScannerModal = ({ visible, onClose, onCode }: BarcodeScannerModalProps) => {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    let active = true;
    const requestCamera = async () => {
      setRequesting(true);
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (active) {
        setPermissionDenied(granted !== PermissionsAndroid.RESULTS.GRANTED);
        setRequesting(false);
      }
    };
    requestCamera();
    return () => {
      active = false;
    };
  }, [visible]);

  const handleCode = (event: any) => {
    const value = event?.nativeEvent?.codeStringValue?.trim();
    if (value) onCode(value);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scanner un palox</Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Fermer le scanner" style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
        {requesting ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : permissionDenied ? (
          <View style={styles.center}>
            <MaterialCommunityIcons name="camera-off-outline" size={48} color="#fff" />
            <Text style={styles.message}>L'accès à la caméra est nécessaire pour scanner.</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Camera
            style={styles.camera}
            cameraType={CameraType.Back}
            scanBarcode
            onReadCode={handleCode}
            showFrame
            laserColor={colors.accentOrange}
            frameColor="#fff"
          />
        )}
        <Text style={styles.hint}>Placez le code-barres ou le QR code dans le cadre.</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101512' },
  header: { height: 68, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  closeButton: { padding: 8 },
  camera: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 14 },
  secondaryButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.accent },
  secondaryButtonText: { color: '#fff', fontWeight: '700' },
  hint: { color: '#fff', textAlign: 'center', padding: 18, fontSize: 14 },
});

export default BarcodeScannerModal;
