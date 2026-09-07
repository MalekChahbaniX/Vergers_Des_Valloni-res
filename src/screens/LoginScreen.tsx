import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { authAPI } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { colors } from '../outils/Theme';
import ScreenContainer from '../components/ScreenContainer';

// ---------- Types ----------

type PopupType = 'error' | 'success' | 'info';

interface PopupState {
  visible: boolean;
  type: PopupType;
  title: string;
  message: string;
}

// ---------- Reusable Popup Component ----------

const ACCENT = colors.accent;
const ACCENT_ORANGE = colors.accentOrange;
const ACCENT_ERROR = '#FF4D6D';
const ACCENT_SUCCESS = colors.accentSuccess;
const BG = colors.bg;
const CARD_BG = colors.card;
const BORDER = colors.border;
const TEXT_PRIMARY = colors.textPrimary;
const TEXT_MUTED = colors.textMuted;

const popupAccent = (type: PopupType) => {
  switch (type) {
    case 'error':
      return ACCENT_ERROR;
    case 'success':
      return ACCENT_SUCCESS;
    default:
      return ACCENT;
  }
};

const StatusPopup: React.FC<{
  state: PopupState;
  onClose: () => void;
}> = ({ state, onClose }) => {
  const color = popupAccent(state.type);

  return (
    <Modal
      visible={state.visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.popupOverlay} onPress={onClose}>
        <Pressable style={[styles.popupCard, { borderColor: color }]} onPress={() => {}}>
          <View style={[styles.popupIconWrap, { backgroundColor: color + '22' }]}>
            <MaterialCommunityIcons
              name={state.type === 'error' ? 'alert-circle-outline' : state.type === 'success' ? 'check-circle-outline' : 'information-outline'}
              size={26}
              color={color}
            />
          </View>
          <Text style={styles.popupTitle}>{state.title}</Text>
          <Text style={styles.popupMessage}>{state.message}</Text>
          <TouchableOpacity
            style={[styles.popupButton, { backgroundColor: color }]}
            onPress={onClose}
          >
            <Text style={styles.popupButtonText}>OK</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ---------- Login Screen ----------

interface LoginScreenProps {
  navigation?: {
    navigate: (screen: string) => void;
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const { signin } = useAuth();

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const showPopup = (type: PopupType, title: string, message: string) => {
    setPopup({ visible: true, type, title, message });
  };

  const closePopup = () => setPopup((p) => ({ ...p, visible: false }));

  const validate = (): boolean => {
    let valid = true;
    setLoginError(null);
    setPasswordError(null);

    if (!login.trim()) {
      setLoginError('Identifiant requis');
      valid = false;
    }

    if (!password) {
      setPasswordError('Mot de passe requis');
      valid = false;
    }

    if (!valid) triggerShake();
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authAPI.signin({ Login: login.trim(), Password: password });

      if (!res?.success) {
        showPopup('error', 'Identifiants incorrects', res?.msg || 'Identifiant ou mot de passe invalide.');
        triggerShake();
        return;
      }

      const data = res.data;
      const token = data?.access_token || null;
      // TODO: confirm the exact field name the backend uses for role (Role / role / type…)
      const user = data?.userid
        ? { id: String(data.userid), name: data.Nom || login.trim(), role: data.type ?? data.role ?? data.Role }
        : null;

      if (!token || !user) {
        showPopup('error', 'Réponse invalide', 'Le serveur a renvoyé une réponse inattendue.');
        return;
      }

      await signin(token, user);
      showPopup('success', 'Connexion réussie', 'Bienvenue !');
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      const isNetwork = err?.message === 'Network Error' || !status;

      if (isNetwork) {
        showPopup(
          'error',
          'Problème de connexion',
          'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
        );
      } else if (status === 401 || status === 400) {
        showPopup('error', 'Identifiants incorrects', 'Email ou mot de passe invalide.');
      } else {
        showPopup('error', 'Connexion échouée', err?.message || 'Une erreur est survenue.');
      }
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const translateX = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-10, 10],
  });

  return (
    <ScreenContainer style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoFrame}>
            <Image source={require('../../assets/verg.jpeg')} style={styles.logo} resizeMode="cover" />
          </View>
          <View style={styles.brandRule} />
          <Text style={styles.title}>Bon retour</Text>
          <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
        </View>

        <Animated.View style={[styles.form, { transform: [{ translateX }] }]}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Identifiant</Text>
            <TextInput
              placeholder="Votre identifiant"
              placeholderTextColor={TEXT_MUTED}
              value={login}
              onChangeText={(t) => {
                setLogin(t);
                if (loginError) setLoginError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, loginError && styles.inputError]}
            />
            {loginError && <Text style={styles.fieldError}>{loginError}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordRow}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (passwordError) setPasswordError(null);
                }}
                style={[styles.input, styles.passwordInput, passwordError && styles.inputError]}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((v) => !v)}
              >
                <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={ACCENT} />
              </TouchableOpacity>
            </View>
            {passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}
          </View>

          <TouchableOpacity style={styles.forgotLink}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={TEXT_PRIMARY} />
            ) : (
              <LinearGradient
                colors={[ACCENT, ACCENT_ORANGE]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Signup')}>
            <Text style={styles.footerLink}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
        </View>
      </KeyboardAvoidingView>

      <StatusPopup state={popup} onClose={closePopup} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BG },
  keyboard: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { marginBottom: 32, alignItems: 'center' },
  logoFrame: {
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 5,
    borderColor: ACCENT,
    padding: 4,
    backgroundColor: CARD_BG,
    overflow: 'hidden',
    marginBottom: 14,
  },
  logo: { width: '100%', height: '100%', borderRadius: 64 },
  brandRule: { width: 42, height: 4, borderRadius: 2, backgroundColor: ACCENT_ORANGE, marginBottom: 18 },
  title: { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, marginBottom: 6 },
  subtitle: { fontSize: 15, color: TEXT_MUTED },
  form: { width: '100%' },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: TEXT_MUTED, marginBottom: 8 },
  input: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  inputError: { borderColor: ACCENT_ERROR },
  fieldError: { color: ACCENT_ERROR, fontSize: 12, marginTop: 6 },
  passwordRow: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 90 },
  eyeButton: { position: 'absolute', right: 14 },
  eyeText: { color: ACCENT, fontSize: 13, fontWeight: '600' },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 24, marginTop: 4 },
  forgotText: { color: ACCENT, fontSize: 13, fontWeight: '600' },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  loginButtonGradient: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: TEXT_PRIMARY, fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { color: TEXT_MUTED, fontSize: 14 },
  footerLink: { color: ACCENT, fontSize: 14, fontWeight: '700' },

  // Popup
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  popupCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  popupIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  popupIcon: { fontSize: 26, fontWeight: '800' },
  popupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  popupButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  popupButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default LoginScreen;