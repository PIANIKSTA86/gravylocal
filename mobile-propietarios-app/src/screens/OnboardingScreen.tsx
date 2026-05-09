import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

const ONBOARDING_KEY = 'gravy_mobile_onboarding_seen_v1';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const slides = [
  {
    title: 'Consulta todo desde tu celular',
    description: 'Saldo, cartera, reservas y PQRS en una sola experiencia clara y rapida.',
    accent: '#0F766E',
  },
  {
    title: 'Acceso rapido con animacion suave',
    description: 'Pantalla inicial de bienvenida, transiciones fluidas y barra inferior con foco activo.',
    accent: '#2563EB',
  },
  {
    title: 'Comunicacion directa con administracion',
    description: 'Recibe alertas y responde a tiempo sin perder el hilo de tu copropiedad.',
    accent: '#B45309',
  },
];

export function OnboardingScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0,
        friction: 8,
        tension: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide, index]);

  const current = slides[index];

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <View style={[styles.badge, { backgroundColor: current.accent }]} />
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.description}>{current.description}</Text>

        <View style={styles.dotsRow}>
          {slides.map((_, dotIndex) => (
            <View
              key={dotIndex}
              style={[
                styles.dot,
                dotIndex === index ? styles.dotActive : undefined,
                dotIndex === index ? { backgroundColor: current.accent } : undefined,
              ]}
            />
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.ghostBtn}
            onPress={() => setIndex((prev) => Math.max(0, prev - 1))}
            disabled={index === 0}
          >
            <Text style={[styles.ghostText, index === 0 && styles.disabledText]}>Anterior</Text>
          </Pressable>

          {index < slides.length - 1 ? (
            <Pressable style={[styles.primaryBtn, { backgroundColor: current.accent }]} onPress={() => setIndex((prev) => prev + 1)}>
              <Text style={styles.primaryText}>Siguiente</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.primaryBtn, { backgroundColor: current.accent }]} onPress={finish}>
              <Text style={styles.primaryText}>Empezar</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>

      <Pressable onPress={finish} style={styles.skipBtn}>
        <Text style={styles.skipText}>Saltar presentacion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    justifyContent: 'center',
  },
  topGlow: {
    position: 'absolute',
    top: -70,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: '#D1FAE5',
    opacity: 0.9,
  },
  bottomGlow: {
    position: 'absolute',
    left: -80,
    bottom: -70,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: '#DBEAFE',
    opacity: 0.85,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  badge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
  },
  ghostBtn: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  ghostText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  disabledText: {
    color: '#94A3B8',
  },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  skipBtn: {
    marginTop: 18,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  skipText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
});
