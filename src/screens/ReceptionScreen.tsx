import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { stockAPI } from '../services/api';
import { colors, radii, spacing } from '../outils/Theme';
import StatusPopup, { PopupState } from '../components/StatusPopup';
import ScreenContainer from '../components/ScreenContainer';
import { Save } from 'lucide-react-native';

interface FieldConfig {
  key: 'barcode' | 'productId' | 'caliber' | 'coldRoomId' | 'location';
  label: string;
  placeholder: string;
  required?: boolean;
}

const FIELDS: FieldConfig[] = [
  { key: 'barcode', label: 'Code barre', placeholder: 'Scanner ou saisir le code', required: true },
  { key: 'productId', label: 'Produit', placeholder: 'Identifiant produit', required: true },
  { key: 'caliber', label: 'Calibre', placeholder: 'Ex: 65/70' },
  { key: 'coldRoomId', label: 'Chambre froide', placeholder: 'Identifiant chambre froide', required: true },
  { key: 'location', label: 'Emplacement', placeholder: 'Ex: A-12-3' },
];

const ReceptionScreen = () => {
  const [values, setValues] = useState<Record<string, string>>({
    barcode: '',
    productId: '',
    caliber: '',
    coldRoomId: '',
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });
  const closePopup = () => setPopup((p) => ({ ...p, visible: false }));

  const setValue = (key: string, val: string) => {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const resetForm = () => {
    setValues({ barcode: '', productId: '', caliber: '', coldRoomId: '', location: '' });
    setErrors({});
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    FIELDS.forEach((f) => {
      if (f.required && !values[f.key].trim()) {
        nextErrors[f.key] = 'Champ requis';
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Champs manquants',
        message: 'Merci de renseigner tous les champs obligatoires avant de continuer.',
      });
      return;
    }

    setLoading(true);
    try {
      const body = {
        ...values,
        dateAdded: new Date().toISOString(),
        userId: null,
        roomname: '',
      };
      await stockAPI.addPalox(body);
      setPopup({
        visible: true,
        type: 'success',
        title: 'Palox enregistré',
        message: 'La réception a bien été ajoutée au stock.',
        onConfirm: resetForm,
      });
    } catch (err: any) {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Échec de l\'enregistrement',
        message: err?.message || 'Une erreur est survenue, merci de réessayer.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Réception Palox</Text>
        <Text style={styles.subtitle}>Enregistrer une nouvelle entrée de stock</Text>
      </View>

      {FIELDS.map((f) => (
        <View key={f.key} style={styles.fieldGroup}>
          <Text style={styles.label}>
            {f.label}
            {f.required ? <Text style={styles.required}> *</Text> : null}
          </Text>
          <TextInput
            placeholder={f.placeholder}
            placeholderTextColor={colors.textMuted}
            value={values[f.key]}
            onChangeText={(t) => setValue(f.key, t)}
            style={[styles.input, errors[f.key] && styles.inputError]}
          />
          {errors[f.key] ? <Text style={styles.fieldError}>{errors[f.key]}</Text> : null}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <View style={styles.submitContent}>
            <Save size={18} color={colors.textPrimary} />
            <Text style={styles.submitText}>Enregistrer</Text>
          </View>
        )}
      </TouchableOpacity>

      <StatusPopup state={popup} onClose={closePopup} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingBottom: 48 },
  header: { marginBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted },

  fieldGroup: { marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.sm },
  required: { color: colors.accentError },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.accentError },
  fieldError: { color: colors.accentError, fontSize: 12, marginTop: 6 },

  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  submitText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
});

export default ReceptionScreen;