import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { loginWithPassword, registerWithPassword } from '../services/pb';
import { RootStackParamList } from '../navigation/RootNavigator';

// Misma paleta que SplashScreen para efecto de continuidad
const NAVY     = '#0A1628';
const NAVY2    = '#0D1F38';
const TEAL     = '#06B6D4';
const TEAL_DIM = '#0E7490';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function LoginScreen({ navigation }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animación de entrada: los campos aparecen sobre el mismo fondo navy del splash
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 1, duration: 450, delay: 80, useNativeDriver: true }),
      Animated.timing(formTranslateY, { toValue: 0, duration: 400, delay: 80, useNativeDriver: true }),
    ]).start();
  }, [formOpacity, formTranslateY]);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Datos incompletos', 'Ingresa correo y contraseña.');
      return;
    }

    if (mode === 'register' && (!fullName.trim() || !documentNumber.trim())) {
      Alert.alert('Datos incompletos', 'Ingresa tu nombre completo y tu identificacion para registrarte.');
      return;
    }

    if (mode === 'register' && password.length < 8) {
      Alert.alert('Clave insegura', 'La contraseña debe tener minimo 8 caracteres.');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'register') {
        try {
          await registerWithPassword({
            fullName,
            documentNumber,
            email,
            password,
          });
        } catch (registerError: any) {
          const msg = String(registerError?.message || '').toLowerCase();
          const looksLikeExistingEmail =
            msg.includes('already exists') ||
            msg.includes('must be unique') ||
            msg.includes('unique') ||
            msg.includes('correo ya') ||
            msg.includes('email already');

          if (!looksLikeExistingEmail) {
            throw registerError;
          }
        }
      }
      await loginWithPassword(email, password);
      navigation.replace('MainTabs');
    } catch (error: any) {
      Alert.alert(
        mode === 'login' ? 'Error de acceso' : 'No fue posible registrarte',
        error?.message || 'Valida tus datos e intenta nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Mismas viñetas del splash */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />
      <View style={styles.gridLine1} />
      <View style={styles.gridLine2} />

      {/* Marca idéntica al splash — da la ilusión de continuidad */}
      <View style={styles.brandArea}>
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/gravy-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brand}>GRAVY</Text>
        <Text style={styles.tagline}>Accounting Intelligence Platform</Text>
      </View>

      {/* Formulario — aparece con fade sobre el mismo fondo */}
      <Animated.View
        style={[styles.form, { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }]}
      >
        <Text style={styles.formTitle}>Propietarios</Text>
        <Text style={styles.formSubtitle}>Cartera · Reservas · PQRS</Text>

        {/* Toggle Ingreso / Registro */}
        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>Ingreso</Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, mode === 'register' && styles.modeBtnActive]}
            onPress={() => setMode('register')}
          >
            <Text style={[styles.modeText, mode === 'register' && styles.modeTextActive]}>Registro</Text>
          </Pressable>
        </View>

        {mode === 'register' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#4A6080"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Número de identificación"
              placeholderTextColor="#4A6080"
              keyboardType="number-pad"
              autoCapitalize="characters"
              value={documentNumber}
              onChangeText={setDocumentNumber}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#4A6080"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.passwordWrap}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Contraseña"
            placeholderTextColor="#4A6080"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            style={styles.passwordToggle}
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={8}
          >
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94A3B8" />
          </Pressable>
        </View>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? mode === 'login' ? 'Ingresando...' : 'Registrando...'
              : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </Text>
        </Pressable>

        <Text style={styles.helper}>
          {mode === 'login'
            ? 'Ingresa con tu usuario existente.'
            : 'Solo se registran propietarios cuya identificación ya exista y tenga unidades asignadas.'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  // ── Viñetas (idénticas al splash) ──────────────────────────────────
  glowTopRight: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 360,
    top: -120,
    right: -140,
    backgroundColor: TEAL_DIM,
    opacity: 0.12,
  },
  glowBottomLeft: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 300,
    bottom: -100,
    left: -120,
    backgroundColor: '#1D4ED8',
    opacity: 0.14,
  },
  gridLine1: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: '30%',
  },
  gridLine2: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: '68%',
  },
  // ── Marca (igual al splash) ─────────────────────────────────────────
  brandArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: NAVY2,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: TEAL,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  logo: {
    width: 54,
    height: 54,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 5,
    marginBottom: 2,
  },
  tagline: {
    color: TEAL,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  // ── Formulario ──────────────────────────────────────────────────────
  form: {
    width: '100%',
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  formSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 16,
  },
  modeRow: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 4,
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 9,
    paddingVertical: 9,
  },
  modeBtnActive: {
    backgroundColor: TEAL,
  },
  modeText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 14,
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  passwordWrap: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 42,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  button: {
    marginTop: 6,
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  helper: {
    textAlign: 'center',
    marginTop: 14,
    color: '#4A6080',
    fontSize: 12,
  },
});
