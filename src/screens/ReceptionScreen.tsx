import React, { useEffect, useMemo, useState } from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import SelectField, { SelectOption } from '../components/SelectField';
import { getLocationsForRoom , MAX_PALOX_PER_LOCATION} from '../outils/locations';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { useAuth } from '../store/AuthContext';
import {
  enqueueReception,
  getPendingReceptionCount,
  readCachedReceptionContext,
  subscribeToReceptionSync,
  writeCachedReceptionContext,
} from '../services/offlineReceptionQueue';

// TODO: no master list of palox formats/sizes was provided by the backend —
// these come straight from the example in the cahier des charges. Replace with
// a real list (or fetch one) once confirmed.
const FORMAT_OPTIONS: SelectOption[] = [
  { label: '120/100 Standard', value: '120/100 Standard' },
  { label: '100/100', value: '100/100' },
  { label: 'Autre', value: 'Autre' },
];

interface PaloxItem {
  _id: string;
  caliber?: string;
  productId?: string;
  location?: string;
  coldRoomId?: string;
}
interface ColdRoomItem {
  _id: string;
  name?: string;
}
interface ProductItem {
  _id: string;
  name?: string;
}

const readPalox = (res: any): PaloxItem[] => res?.data?.palox ?? res?.data?.Palox ?? res?.palox ?? [];
const readColdRooms = (res: any): ColdRoomItem[] =>
  res?.data?.coldRoom ?? res?.data?.coldRooms ?? res?.data?.ColdRooms ?? res?.data?.cold_rooms ?? res?.data?.rooms ?? [];
const readProducts = (res: any): ProductItem[] => res?.data?.product ?? res?.data?.products ?? res?.data?.Products ?? [];

const ReceptionScreen = ({ route, navigation }: any) => {
  const presetRoomId: string | undefined = route?.params?.coldRoomId;
  const presetLocation: string | undefined = route?.params?.location;
  const { user } = useAuth();

  const [loadingContext, setLoadingContext] = useState(true);
  const [contextError, setContextError] = useState(false);
  const [palox, setPalox] = useState<PaloxItem[]>([]);
  const [coldRooms, setColdRooms] = useState<ColdRoomItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [caliberChoices, setCaliberChoices] = useState<SelectOption[]>([]);

  const [barcode, setBarcode] = useState('');
  const [productId, setProductId] = useState<string | null>(null);
  const [caliber, setCaliber] = useState<string | null>(null);
  const [coldRoomId, setColdRoomId] = useState<string | null>(presetRoomId ?? null);
  const [location, setLocation] = useState<string | null>(presetLocation ?? null);
  const [format, setFormat] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({ visible: false, type: 'info', title: '', message: '' });
  const closePopup = () => setPopup((p) => ({ ...p, visible: false }));

  useEffect(() => {
    const loadContext = async () => {
      setLoadingContext(true);
      setContextError(false);
      try {
        const res = await stockAPI.getAll();
        const paloxData = readPalox(res);
        const roomsData = readColdRooms(res);
        const productsData = readProducts(res);

        const nextColdRooms = roomsData.length > 0
          ? roomsData
          : Array.from(new Set(paloxData.map((p) => p.coldRoomId).filter(Boolean))).map((id) => ({
              _id: id as string,
              name: id as string,
            }));
        setPalox(paloxData);
        setProducts(productsData);
        setColdRooms(nextColdRooms);
        await writeCachedReceptionContext({ palox: paloxData, coldRooms: nextColdRooms, products: productsData });
        const distinctCalibers = Array.from(new Set(paloxData.map((p) => p.caliber).filter(Boolean))) as string[];
        setCaliberChoices(distinctCalibers.map((c) => ({ label: c, value: c })));
      } catch (err) {
        console.warn('Reception context load error', err);
        const cached = await readCachedReceptionContext();
        if (cached) {
          setPalox(cached.palox);
          setColdRooms(cached.coldRooms);
          setProducts(cached.products);
          setCaliberChoices(Array.from(new Set(cached.palox.map((p) => p.caliber).filter(Boolean))).map((c) => ({ label: c as string, value: c as string })));
        } else {
          setContextError(true);
        }
      } finally {
        setLoadingContext(false);
      }
    };
    loadContext();
    setPendingReceptionCount();
    const unsubscribe = subscribeToReceptionSync(setPendingCount);
    return unsubscribe;
  }, []);

  const setPendingReceptionCount = async () => setPendingCount(await getPendingReceptionCount());

  const productOptions: SelectOption[] = useMemo(
    () => products.map((p) => ({ label: p.name ?? p._id, value: p._id })),
    [products]
  );

  const locationOptions: SelectOption[] = useMemo(() => {
    if (!coldRoomId) return [];
    const all = getLocationsForRoom(coldRoomId);
    return all.map((loc) => {
      const count = palox.filter((p) => p.coldRoomId === coldRoomId && p.location === loc).length;
      const full = count >= MAX_PALOX_PER_LOCATION;
      return {
        label: loc,
        value: loc,
        disabled: full,
        helper: full ? 'Plein' : `${count}/${MAX_PALOX_PER_LOCATION} places occupées`,
      };
    });
  }, [coldRoomId, palox]);

  // Reset the chosen emplacement whenever the destination room changes, since
  // location codes are only meaningful within a given chambre froide.
  const onChangeColdRoom = (val: string) => {
    setColdRoomId(val);
    if (val !== coldRoomId) setLocation(null);
    if (errors.coldRoomId) setErrors((e) => ({ ...e, coldRoomId: '' }));
  };

  const resetForm = () => {
    setBarcode('');
    setProductId(null);
    setCaliber(null);
    setColdRoomId(presetRoomId ?? null);
    setLocation(null);
    setFormat(null);
    setWeight('');
    setErrors({});
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!barcode.trim()) next.barcode = 'Champ requis';
    if (!productId) next.productId = 'Champ requis';
    if (!caliber) next.caliber = 'Champ requis';
    if (!coldRoomId) next.coldRoomId = 'Champ requis';
    if (!location) next.location = 'Champ requis';
    if (!weight.trim()) {
      next.weight = 'Champ requis';
    } else if (Number.isNaN(Number(weight)) || Number(weight) <= 0) {
      next.weight = 'Poids invalide';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
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

    // Guard against a race where the emplacement filled up since this screen loaded.
    const currentOccupancy = palox.filter(
      (p) => p.coldRoomId === coldRoomId && p.location === location
    ).length;
    if (currentOccupancy >= MAX_PALOX_PER_LOCATION) {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Emplacement plein',
        message: "Cet emplacement a atteint sa capacité maximale. Choisissez-en un autre.",
      });
      return;
    }

    setLoading(true);
    try {
      const body = {
        barcode: barcode.trim(),
        productId,
        caliber,
        coldRoomId,
        location,
        size: format,
        weight: Number(weight),
        dateAdded: new Date().toISOString(),
        userId: user?.id ?? null,
        roomname: '',
      };
      try {
        await stockAPI.addPalox(body);
      } catch (error: any) {
        const network = await NetInfo.fetch();
        if (!network.isConnected || !error?.status) {
          const count = await enqueueReception(body);
          setPendingCount(count);
          setPopup({
            visible: true,
            type: 'info',
            title: 'Réception mise en attente',
            message: 'Le réseau est indisponible. La réception sera synchronisée automatiquement.',
            onConfirm: () => {
              resetForm();
              navigation.goBack();
            },
          });
          return;
        }
        throw error;
      }
      setPopup({
        visible: true,
        type: 'success',
        title: 'Palox enregistré',
        message: 'La réception a bien été ajoutée au stock.',
        onConfirm: () => {
          resetForm();
          navigation.goBack();
        },
      });
    } catch (err: any) {
      setPopup({
        visible: true,
        type: 'error',
        title: "Échec de l'enregistrement",
        message: err?.message || 'Une erreur est survenue, merci de réessayer.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingContext) {
    return (
      <ScreenContainer style={styles.centerFlex}>
        <ActivityIndicator size="large" color={colors.accent} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Réception Palox</Text>
          <Text style={styles.subtitle}>Enregistrer une nouvelle entrée de stock</Text>
        </View>

        {pendingCount > 0 && (
          <View style={styles.syncBanner}>
            <MaterialCommunityIcons name="cloud-sync-outline" size={18} color={colors.accentWarn} />
            <Text style={styles.syncBannerText}>{pendingCount} réception(s) en attente de synchronisation</Text>
          </View>
        )}

        {contextError && (
          <View style={styles.warnBanner}>
            <MaterialCommunityIcons name="alert-outline" size={16} color={colors.accentWarn} />
            <Text style={styles.warnBannerText}>
              Impossible de charger les listes (variétés, chambres froides). Vérifiez votre connexion.
            </Text>
          </View>
        )}

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Code barre<Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.barcodeRow}>
            <TextInput
              placeholder="Scanner ou saisir le code"
              placeholderTextColor={colors.textMuted}
              value={barcode}
              onChangeText={(t) => {
                setBarcode(t);
                if (errors.barcode) setErrors((e) => ({ ...e, barcode: '' }));
              }}
              style={[styles.input, styles.barcodeInput, errors.barcode && styles.inputError]}
            />
            <TouchableOpacity style={styles.scanButton} onPress={() => setScannerVisible(true)} accessibilityLabel="Scanner le code-barres">
              <MaterialCommunityIcons name="barcode-scan" size={23} color="#fff" />
            </TouchableOpacity>
          </View>
          {errors.barcode ? <Text style={styles.fieldError}>{errors.barcode}</Text> : null}
        </View>

        <SelectField
          label="Variété de fruit"
          required
          placeholder="Sélectionner une variété"
          value={productId}
          onChange={(v) => {
            setProductId(v);
            if (errors.productId) setErrors((e) => ({ ...e, productId: '' }));
          }}
          options={productOptions}
          error={errors.productId}
          emptyMessage="Aucune variété disponible"
        />

        <SelectField
          label="Calibre"
          required
          placeholder="Sélectionner un calibre"
          value={caliber}
          onChange={(v) => {
            setCaliber(v);
            if (errors.caliber) setErrors((e) => ({ ...e, caliber: '' }));
          }}
          options={caliberChoices}
          error={errors.caliber}
          emptyMessage="Aucun calibre enregistré pour l'instant"
        />

        <SelectField
          label="Chambre froide de destination"
          required
          placeholder="Sélectionner une chambre froide"
          value={coldRoomId}
          onChange={onChangeColdRoom}
          options={coldRooms.map((r) => ({ label: r.name ?? r._id, value: r._id }))}
          error={errors.coldRoomId}
          emptyMessage="Aucune chambre froide configurée"
        />

        <SelectField
          label="Emplacement / Allée-Position"
          required
          placeholder={coldRoomId ? 'Sélectionner un emplacement' : 'Choisissez une chambre froide d’abord'}
          value={location}
          onChange={(v) => {
            setLocation(v);
            if (errors.location) setErrors((e) => ({ ...e, location: '' }));
          }}
          options={locationOptions}
          error={errors.location}
          disabled={!coldRoomId}
          emptyMessage="Aucun emplacement disponible"
        />

        <SelectField
          label="Format / Taille du palox"
          placeholder="Sélectionner un format"
          value={format}
          onChange={setFormat}
          options={FORMAT_OPTIONS}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Poids (kg)<Text style={styles.required}> *</Text>
          </Text>
          <TextInput
            placeholder="Ex: 320"
            placeholderTextColor={colors.textMuted}
            value={weight}
            onChangeText={(t) => {
              setWeight(t);
              if (errors.weight) setErrors((e) => ({ ...e, weight: '' }));
            }}
            keyboardType="numeric"
            style={[styles.input, errors.weight && styles.inputError]}
          />
          {errors.weight ? <Text style={styles.fieldError}>{errors.weight}</Text> : null}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.submitContent}>
                <MaterialCommunityIcons name="content-save-outline" size={18} color="#fff" />
                <Text style={styles.submitText}>Enregistrer et Stocker</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <StatusPopup state={popup} onClose={closePopup} />
        <BarcodeScannerModal
          visible={scannerVisible}
          onClose={() => setScannerVisible(false)}
          onCode={(code) => {
            setBarcode(code);
            setScannerVisible(false);
            if (errors.barcode) setErrors((e) => ({ ...e, barcode: '' }));
          }}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  centerFlex: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.xl, paddingBottom: 48 },
  header: { marginBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted },

  warnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentWarn + '15',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warnBannerText: { flex: 1, color: colors.accentWarn, fontSize: 12, fontWeight: '600' },
  syncBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accentWarn + '15', borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg },
  syncBannerText: { flex: 1, color: colors.accentWarn, fontSize: 12, fontWeight: '700' },

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
  barcodeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barcodeInput: { flex: 1 },
  scanButton: { width: 52, height: 52, borderRadius: radii.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  fieldError: { color: colors.accentError, fontSize: 12, marginTop: 6 },

  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  submitButton: {
    flex: 2,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default ReceptionScreen;