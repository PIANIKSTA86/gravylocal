import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { PhInvoice, getInvoiceSummary, getOwnerInvoices } from '../services/pb';

function money(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function normalizeStatus(status: string | undefined) {
  if (status === 'paid') return 'Pagada';
  if (status === 'posted') return 'Contabilizada';
  if (status === 'draft') return 'Borrador';
  if (status === 'voided') return 'Anulada';
  return 'Pendiente';
}

export function SaldosScreen() {
  const [rows, setRows] = useState<PhInvoice[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const invoices = await getOwnerInvoices();
      setRows(invoices);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = getInvoiceSummary(rows);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saldos y cartera</Text>
      <Text style={styles.subtitle}>Resumen de deuda y facturas de tu unidad.</Text>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: '#ECFEFF' }]}>
          <Text style={styles.kpiLabel}>Saldo pendiente</Text>
          <Text style={styles.kpiValue}>{money(summary.pending)}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#FEF2F2' }]}>
          <Text style={styles.kpiLabel}>Cartera vencida</Text>
          <Text style={styles.kpiValue}>{money(summary.overdue)}</Text>
        </View>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Historial de facturas</Text>
        <Pressable onPress={load}>
          <Text style={styles.link}>Actualizar</Text>
        </Pressable>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.empty}>No hay facturas para este propietario.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.number || 'Factura PH'}</Text>
            <Text style={styles.meta}>Período: {item.period || 'N/A'}</Text>
            <Text style={styles.meta}>Unidad: {item.expand?.property_id?.name || item.expand?.property_id?.code || 'N/A'}</Text>
            <Text style={styles.meta}>Vence: {item.due_date || 'N/A'}</Text>
            <View style={styles.bottomRow}>
              <Text style={styles.amount}>{money(Number(item.total || 0))}</Text>
              <Text style={styles.badge}>{normalizeStatus(item.status)}</Text>
            </View>
          </View>
        )}
      />
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
    marginTop: 4,
    color: colors.textMuted,
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
  },
  kpiLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  kpiValue: {
    marginTop: 4,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: 4,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center',
  },
  amount: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  badge: {
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
  },
});
