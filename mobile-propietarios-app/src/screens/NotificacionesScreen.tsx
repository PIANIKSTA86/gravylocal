import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppNotification,
  OwnerNotification,
  currentUser,
  getOwnerNotificationsWithReadState,
  logout,
  markAllOwnerNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
} from '../services/pb';
import { colors } from '../theme/colors';

type FilterKey = 'all' | 'unread' | 'billing' | 'reservation' | 'pqrs';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'unread', label: 'No leidas' },
  { key: 'billing', label: 'Cartera' },
  { key: 'reservation', label: 'Reservas' },
  { key: 'pqrs', label: 'PQRS' },
];

function filterStorageKey() {
  const uid = String((currentUser() as any)?.id || 'anon');
  return `gravy_mobile_notifications_filter_${uid}`;
}

function isFilterKey(value: string | null): value is FilterKey {
  return value === 'all' || value === 'unread' || value === 'billing' || value === 'reservation' || value === 'pqrs';
}

function badgeStyle(level: AppNotification['level']) {
  if (level === 'danger') return { bg: '#FEE2E2', fg: '#B91C1C', label: 'Alta' };
  if (level === 'warning') return { bg: '#FEF3C7', fg: '#92400E', label: 'Media' };
  return { bg: '#DBEAFE', fg: '#1D4ED8', label: 'Info' };
}

export function NotificacionesScreen() {
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<OwnerNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getOwnerNotificationsWithReadState();
      setRows(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(filterStorageKey());
        if (isFilterKey(saved)) {
          setActiveFilter(saved);
        }
      } catch {
        // noop
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(filterStorageKey(), activeFilter).catch(() => {
      // noop
    });
  }, [activeFilter]);

  const unreadCount = rows.filter((r) => !r.isRead).length;

  const filteredRows = useMemo(() => {
    if (activeFilter === 'all') return rows;
    if (activeFilter === 'unread') return rows.filter((r) => !r.isRead);
    return rows.filter((r) => r.type === activeFilter);
  }, [activeFilter, rows]);

  const onToggleRead = async (row: OwnerNotification) => {
    if (row.isRead) {
      await markNotificationAsUnread(row.id);
    } else {
      await markNotificationAsRead(row.id);
    }
    setRows((prev) =>
      prev.map((it) => (it.id === row.id ? { ...it, isRead: !row.isRead } : it)),
    );
  };

  const onMarkAllRead = async () => {
    await markAllOwnerNotificationsAsRead();
    setRows((prev) => prev.map((it) => ({ ...it, isRead: true })));
  };

  const onLogout = () => {
    logout();
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificaciones</Text>
      <Text style={styles.subtitle}>Alertas internas de cartera, reservas y PQRS.</Text>
      <View style={styles.toolbar}>
        <Text style={styles.unread}>No leidas: {unreadCount}</Text>
        <Pressable onPress={onMarkAllRead}>
          <Text style={styles.markAll}>Marcar todas como leidas</Text>
        </Pressable>
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredRows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.empty}>No hay alertas por el momento.</Text>}
        renderItem={({ item }) => {
          const badge = badgeStyle(item.level);
          return (
            <View style={[styles.card, item.isRead && styles.cardRead]}>
              <View style={styles.rowTop}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={[styles.badge, { backgroundColor: badge.bg, color: badge.fg }]}>{badge.label}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <View style={styles.actionRow}>
                <Text style={styles.meta}>Fuente: {item.type}</Text>
                <Pressable onPress={() => onToggleRead(item)}>
                  <Text style={styles.toggle}>{item.isRead ? 'Marcar no leida' : 'Marcar leida'}</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      <Pressable style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 12,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 30,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#ECFDF5',
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  unread: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  markAll: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardRead: {
    opacity: 0.65,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '800',
  },
  message: {
    color: colors.textPrimary,
    marginBottom: 4,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  actionRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  logoutBtn: {
    marginTop: 6,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
