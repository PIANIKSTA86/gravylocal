import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getClientes, getCarteraCliente, Cliente, SalesInvoice } from '../services/pb';
import { colors } from '../theme/colors';

export function CarteraScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const list = await getClientes();
        setClientes(list);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectClient = async (client: Cliente) => {
    setSelectedClient(client);
    setLoadingInvoices(true);
    try {
      const data = await getCarteraCliente(client.id);
      setInvoices(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Filtrar clientes por búsqueda
  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.documento.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcular saldo total acumulado de las facturas no pagadas mostradas en el detalle
  const unpaidTotal = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'voided' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  if (selectedClient) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => { setSelectedClient(null); setInvoices([]); }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
            <Text style={styles.backBtnText}>Volver</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>{selectedClient.nombre}</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Saldo Total Pendiente</Text>
          <Text style={styles.kpiVal}>
            ${unpaidTotal.toLocaleString('es-CO')}
          </Text>
          <Text style={styles.kpiSub}>
            Límite de crédito: ${(selectedClient.limite_credito || 0).toLocaleString('es-CO')}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Historial de Pagos y Facturas / RM</Text>

        {loadingInvoices ? (
          <ActivityIndicator color="#0284C7" style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={invoices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.invoiceItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invoiceNum}>{item.number}</Text>
                  <Text style={styles.invoiceDate}>Vence: {new Date(item.due_date).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.invoiceTotal}>${item.total.toLocaleString('es-CO')}</Text>
                  <View style={[
                    styles.badge, 
                    item.status === 'paid' ? styles.paidBadge : styles.unpaidBadge
                  ]}>
                    <Text style={item.status === 'paid' ? styles.paidText : styles.unpaidText}>
                      {item.status === 'paid' ? 'PAGADA' : (item.status === 'draft' ? 'BORRADOR' : 'PENDIENTE')}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No se registran facturas ni remisiones (RM).</Text>}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.titleMain}>Cartera de Clientes</Text>

      {/* Buscador de Clientes */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search-outline" size={20} color="#475569" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o documento..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#0284C7" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={filteredClientes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={styles.clientItem} onPress={() => selectClient(item)}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.clientName}>{item.nombre}</Text>
                <Text style={styles.clientSub}>Doc: {item.documento}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.clientBalance}>
                  ${(item.saldo_actual || 0).toLocaleString('es-CO')}
                </Text>
                <Text style={styles.balanceLabel}>Saldo Pendiente</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No se encontraron clientes.</Text>}
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
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    gap: 4,
  },
  backBtnText: {
    fontWeight: '600',
    color: '#0F172A',
    fontSize: 13,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
  },
  titleMain: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiVal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0284C7',
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 12,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
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
    borderColor: '#E2E8F0',
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  clientSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  clientBalance: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  invoiceNum: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  invoiceDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  invoiceTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  paidBadge: {
    backgroundColor: '#D1FAE5',
  },
  unpaidBadge: {
    backgroundColor: '#FEE2E2',
  },
  paidText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#065F46',
  },
  unpaidText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#991B1B',
  },
  empty: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
  },
});
