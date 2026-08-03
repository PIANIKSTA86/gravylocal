import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getClientes, Cliente } from '../services/pb';
import { colors } from '../theme/colors';

export function DashboardScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await getClientes();
        setClientes(list);
      } catch (err: any) {
        console.log('Error loading clients detailed:', JSON.stringify(err, null, 2));
        console.log('Error loading clients message:', err?.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCartera = clientes.reduce((acc, curr) => acc + (curr.saldo_actual || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Panel de Vendedor</Text>
          <Text style={styles.subtitle}>Resumen y Metas</Text>
        </View>
        <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Clientes Activos</Text>
          <Text style={styles.cardVal}>{clientes.length}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.cardLabel, { color: '#991B1B' }]}>Total Cartera</Text>
          <Text style={[styles.cardVal, { color: '#991B1B' }]}>
            ${totalCartera.toLocaleString('es-CO')}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Ruta de Visitas</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.clientItem}>
              <View>
                <Text style={styles.clientName}>{item.nombre}</Text>
                <Text style={styles.clientDoc}>NIT: {item.documento}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No tienes clientes asignados.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  cardLabel: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#065F46',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  clientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  clientDoc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
  },
});
