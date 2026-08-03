import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { CarteraScreen } from '../screens/CarteraScreen';
import { CatalogoScreen } from '../screens/CatalogoScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Inicio: undefined;
  Cartera: undefined;
  Catalogo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_META: Record<keyof MainTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }> = {
  Inicio: { active: 'home', inactive: 'home-outline', label: 'Inicio' },
  Cartera: { active: 'wallet', inactive: 'wallet-outline', label: 'Cartera' },
  Catalogo: { active: 'cart', inactive: 'cart-outline', label: 'Pedidos' },
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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        sceneStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Cartera" component={CarteraScreen} options={{ title: 'Cartera' }} />
      <Tab.Screen name="Catalogo" component={CatalogoScreen} options={{ title: 'Pedidos' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Auth">
      <Stack.Screen name="Auth" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  tabBarTrack: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 6,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubble: {
    position: 'absolute',
    height: 52,
    backgroundColor: '#F0FDFA',
    borderRadius: 18,
    left: 6,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#0F766E',
    fontWeight: '700',
  },
});
