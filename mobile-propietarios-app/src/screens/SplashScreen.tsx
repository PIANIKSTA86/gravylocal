import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { currentUser, pb } from '../services/pb';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

// Splash siempre visible durante este tiempo antes de navegar
const SPLASH_MS = 1800;
const ONBOARDING_KEY = 'gravy_mobile_onboarding_seen_v1';

// Paleta exacta de la app de escritorio Gravy
const NAVY     = '#0A1628';   // fondo principal
const NAVY2    = '#0D1F38';   // fondo secundario / viñetas
const TEAL     = '#06B6D4';   // acento cian/teal
const TEAL_DIM = '#0E7490';   // acento apagado para glow

export function SplashScreen({ navigation }: Props) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.90)).current;
  const lineWidth  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación siempre se ejecuta completa
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Barra de progreso animada
    Animated.timing(lineWidth, {
      toValue: 1,
      duration: SPLASH_MS - 200,
      delay: 300,
      useNativeDriver: false,
    }).start();

    // Decide destino DESPUÉS de que el splash ya se mostró
    const t = setTimeout(async () => {
      try {
        const hasSession    = pb.authStore.isValid && !!currentUser();
        const onboardingSeen = (await AsyncStorage.getItem(ONBOARDING_KEY)) === '1';
        const route: keyof RootStackParamList =
          hasSession ? 'MainTabs' : onboardingSeen ? 'Auth' : 'Onboarding';
        navigation.replace(route);
      } catch {
        navigation.replace('Auth');
      }
    }, SPLASH_MS);

    return () => clearTimeout(t);
  }, [lineWidth, navigation, opacity, scale]);

  return (
    <View style={styles.container}>
      {/* Viñetas de profundidad */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />
      <View style={styles.gridLine1} />
      <View style={styles.gridLine2} />

      <Animated.View style={[styles.center, { opacity, transform: [{ scale }] }]}>
        {/* Badge del logo igual al de escritorio */}
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/gravy-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.brand}>GRAVY</Text>
        <Text style={styles.tagline}>Accounting Intelligence Platform</Text>

        <View style={styles.divider} />

        <Text style={styles.subtitle}>Copropiedades al dia, en tu bolsillo</Text>

        {/* Barra de progreso */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: lineWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Firma inferior */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Gravy Local · v2.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  center: {
    alignItems: 'center',
    zIndex: 2,
    paddingHorizontal: 32,
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 26,
    backgroundColor: NAVY2,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: TEAL,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  logo: {
    width: 72,
    height: 72,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 4,
  },
  tagline: {
    color: TEAL,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: TEAL,
    borderRadius: 2,
    marginBottom: 16,
    opacity: 0.6,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 21,
  },
  progressTrack: {
    width: 180,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  progressBar: {
    height: 2,
    borderRadius: 2,
    backgroundColor: TEAL,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
