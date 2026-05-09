import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NotificacionesScreen } from '../screens/NotificacionesScreen';
import { PqrsScreen } from '../screens/PqrsScreen';
import { ReservasScreen } from '../screens/ReservasScreen';
import { SaldosScreen } from '../screens/SaldosScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Inicio: undefined;
  Cartera: undefined;
  Reservas: undefined;
  Pqrs: undefined;
  Notificaciones: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_META: Record<keyof MainTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }> = {
  Inicio: { active: 'home', inactive: 'home-outline', label: 'Inicio' },
  Cartera: { active: 'wallet', inactive: 'wallet-outline', label: 'Cartera' },
  Reservas: { active: 'calendar', inactive: 'calendar-outline', label: 'Reservas' },
  Pqrs: { active: 'chatbox-ellipses', inactive: 'chatbox-ellipses-outline', label: 'PQRS' },
  Notificaciones: { active: 'notifications', inactive: 'notifications-outline', label: 'Alertas' },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const bubbleX = useRef(new Animated.Value(0)).current;
  const scales = useRef(state.routes.map(() => new Animated.Value(1))).current;
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const itemWidth = trackWidth / state.routes.length;
    if (!itemWidth) return;

    Animated.spring(bubbleX, {
      toValue: state.index * itemWidth,
      friction: 9,
      tension: 90,
      useNativeDriver: true,
    }).start();

    state.routes.forEach((_, index) => {
      Animated.spring(scales[index], {
        toValue: state.index === index ? 1.1 : 1,
        friction: 7,
        tension: 120,
        useNativeDriver: true,
      }).start();
    });
  }, [bubbleX, scales, state.index, state.routes, trackWidth]);

  return (
    <View style={styles.tabBarWrap}>
      <View style={styles.tabBarTrack} onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}>
        <Animated.View
          style={[
            styles.bubble,
            {
              transform: [{ translateX: bubbleX }],
              width: trackWidth ? trackWidth / state.routes.length - 12 : 0,
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const meta = TAB_META[route.name as keyof MainTabParamList];
          const { options } = descriptors[route.key];
          const label = typeof options.title === 'string' ? options.title : meta.label;

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={styles.tabButton}
            >
              <Animated.View style={{ transform: [{ scale: scales[index] }] }}>
                <Ionicons
                  name={isFocused ? meta.active : meta.inactive}
                  size={22}
                  color={isFocused ? colors.primary : '#64748B'}
                />
              </Animated.View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        sceneStyle: { backgroundColor: '#FFFFFF' },
      })}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Cartera" component={SaldosScreen} options={{ title: 'Cartera' }} />
      <Tab.Screen name="Reservas" component={ReservasScreen} options={{ title: 'Reservas' }} />
      <Tab.Screen name="Pqrs" component={PqrsScreen} options={{ title: 'PQRS' }} />
      <Tab.Screen name="Notificaciones" component={NotificacionesScreen} options={{ title: 'Notificaciones' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Auth" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  tabBarTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 6,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  bubble: {
    position: 'absolute',
    left: 6,
    top: 6,
    bottom: 6,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabLabelActive: {
    color: colors.primary,
  },
});
