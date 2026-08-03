import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import {
  CopropiedadInfo,
  currentUser,
  getCopropiedadInfo,
  getCommonAreas,
  getInvoiceSummary,
  getOwnerInvoices,
  getOwnerProperties,
  PhCommonArea,
  getUnreadOwnerNotifications,
} from '../services/pb';
import { colors } from '../theme/colors';

function money(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const user = currentUser();
  const [notificationCount, setNotificationCount] = useState(0);
  const [propertyCount, setPropertyCount] = useState(0);
  const [summaryPending, setSummaryPending] = useState(0);
  const [commonAreas, setCommonAreas] = useState<PhCommonArea[]>([]);
  const [copropiedad, setCopropiedad] = useState<CopropiedadInfo>({
    name: 'Copropiedad',
    nit: 'Sin NIT',
    address: 'Sin direccion registrada',
  });

  const loadNotifications = useCallback(async () => {
    try {
      const list = await getUnreadOwnerNotifications();
      setNotificationCount(list.length);
    } catch {
      setNotificationCount(0);
    }
  }, []);

  const loadHomeData = useCallback(async () => {
    const [infoRes, propertiesRes, invoicesRes, areasRes] = await Promise.allSettled([
      getCopropiedadInfo(),
      getOwnerProperties(),
      getOwnerInvoices(),
      getCommonAreas(),
    ]);

    if (infoRes.status === 'fulfilled') {
      setCopropiedad(infoRes.value);
    }

    if (propertiesRes.status === 'fulfilled') {
      setPropertyCount(propertiesRes.value.length);
    } else {
      setPropertyCount(0);
    }

    if (invoicesRes.status === 'fulfilled') {
      setSummaryPending(getInvoiceSummary(invoicesRes.value).pending);
    } else {
      setSummaryPending(0);
    }

    if (areasRes.status === 'fulfilled') {
      setCommonAreas(areasRes.value);
    } else {
      setCommonAreas([]);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    loadHomeData();
  }, [loadHomeData, loadNotifications]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      loadHomeData();
    }, [loadHomeData, loadNotifications]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola, {user?.full_name || user?.email || 'Propietario'}</Text>
      <Text style={styles.subtitle}>Resumen rapido de tu copropiedad y tus unidades.</Text>

      <View style={styles.companyCard}>
        <Text style={styles.companyName}>{copropiedad.name}</Text>
        <Text style={styles.companyMeta}>NIT: {copropiedad.nit}</Text>
        <Text style={styles.companyMeta}>{copropiedad.address}</Text>
      </View>

      <View style={styles.kpisRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Unidades</Text>
          <Text style={styles.kpiValue}>{propertyCount}</Text>
        </View>
        <View style={[styles.kpiCard, styles.kpiDebt]}>
          <Text style={styles.kpiLabel}>Saldo acumulado</Text>
          <Text style={styles.kpiValue}>{money(summaryPending)}</Text>
        </View>
      </View>

      <View style={styles.areasCard}>
        <Text style={styles.areasTitle}>Zonas comunes disponibles</Text>
        {commonAreas.length ? (
          <View style={styles.areasWrap}>
            {commonAreas.slice(0, 8).map((area) => (
              <View key={area.id} style={styles.areaChip}>
                <Text style={styles.areaChipText}>{area.name || area.code || 'Zona común'}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.areasEmpty}>No hay zonas comunes activas registradas.</Text>
        )}
      </View>

      <Pressable style={styles.alertBtn} onPress={() => navigation.navigate('Notificaciones')}>
        <Text style={styles.alertTitle}>Notificaciones internas</Text>
        <Text style={styles.alertText}>Tienes {notificationCount} alerta(s) no leida(s).</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Accesos rapidos</Text>

        <Pressable style={styles.moduleBtn} onPress={() => navigation.navigate('Cartera')}>
          <Text style={styles.moduleTitle}>Cartera</Text>
          <Text style={styles.moduleText}>Consulta facturas, estado y deuda vencida.</Text>
        </Pressable>

        <Pressable style={styles.moduleBtn} onPress={() => navigation.navigate('Reservas')}>
          <Text style={styles.moduleTitle}>Reservas</Text>
          <Text style={styles.moduleText}>Solicita reservas y revisa tus registros.</Text>
        </Pressable>

        <Pressable style={styles.moduleBtn} onPress={() => navigation.navigate('Pqrs')}>
          <Text style={styles.moduleTitle}>PQRS</Text>
          <Text style={styles.moduleText}>Radica y da seguimiento a tus solicitudes.</Text>
        </Pressable>
      </View>
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
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 16,
  },
  companyCard: {
    borderWidth: 1,
    borderColor: '#D1FAE5',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  companyName: {
    color: '#065F46',
    fontWeight: '800',
    marginBottom: 2,
  },
  companyMeta: {
    color: '#047857',
    fontSize: 12,
  },
  kpisRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  kpiDebt: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
  },
  kpiLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  kpiValue: {
    color: colors.textPrimary,
    fontWeight: '800',
    marginTop: 2,
  },
  areasCard: {
    borderWidth: 1,
    borderColor: '#D1FAE5',
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  areasTitle: {
    color: '#0F766E',
    fontWeight: '800',
    marginBottom: 8,
  },
  areasWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaChip: {
    backgroundColor: '#CCFBF1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  areaChipText: {
    color: '#115E59',
    fontSize: 12,
    fontWeight: '700',
  },
  areasEmpty: {
    color: '#0F766E',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
  },
  alertBtn: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  alertTitle: {
    color: '#312E81',
    fontWeight: '800',
  },
  alertText: {
    color: '#4338CA',
    marginTop: 2,
    fontSize: 12,
  },
  cardTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  item: {
    color: colors.textPrimary,
    marginBottom: 6,
  },
  moduleBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  moduleTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: 2,
  },
  moduleText: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
