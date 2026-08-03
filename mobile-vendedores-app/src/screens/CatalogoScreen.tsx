import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator, Image, Alert, TextInput, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getCatalogoProductos, getListasPrecios, getPreciosPorLista, getClientes, crearPedido, Product, ListaPrecio, PrecioProducto, Cliente, PB_URL, pb } from '../services/pb';
import { colors } from '../theme/colors';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export function CatalogoScreen() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [listas, setListas] = useState<ListaPrecio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [selectedList, setSelectedList] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  
  const [customPrecios, setCustomPrecios] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<Record<string, number>>({});
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados para búsqueda y filtrado
  const [productSearch, setProductSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [prodList, lPrecios, clis] = await Promise.all([
          getCatalogoProductos(),
          getListasPrecios(),
          getClientes(),
        ]);
        setProductos(prodList);
        setListas(lPrecios);
        setClientes(clis);
        
        if (lPrecios.length > 0) {
          setSelectedList(lPrecios[0].id);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Almacenar el mapeo completo de [lista_precio_id]: { [producto_id]: precio }
  const [preciosPorListaMap, setPreciosPorListaMap] = useState<Record<string, Record<string, number>>>({});

  // Carga y mapea todos los precios de todas las listas disponibles
  useEffect(() => {
    if (listas.length === 0) return;
    async function loadTodosLosPrecios() {
      try {
        const fullMap: Record<string, Record<string, number>> = {};
        await Promise.all(
          listas.map(async (lista) => {
            const prices = await getPreciosPorLista(lista.id);
            const map: Record<string, number> = {};
            prices.forEach((p) => {
              map[p.producto_id] = p.precio;
            });
            fullMap[lista.id] = map;
          })
        );
        setPreciosPorListaMap(fullMap);
      } catch (e) {
        console.log('Error loading price lists map:', e);
      }
    }
    loadTodosLosPrecios();
  }, [listas]);

  // Al cambiar de cliente, sugiere su lista de precios por defecto
  const handleSelectClient = (client: Cliente) => {
    setSelectedClient(client);
    if (client.lista_precio_defecto) {
      setSelectedList(client.lista_precio_defecto);
    }
    setIsClientModalVisible(false);
    setClientSearch('');
  };

  // Lógica de cálculo de precios del catálogo
  const getPrecioVenta = (producto: Product, listaId?: string) => {
    const listToUse = listaId || selectedList;
    if (preciosPorListaMap[listToUse] && preciosPorListaMap[listToUse][producto.id] !== undefined) {
      return preciosPorListaMap[listToUse][producto.id];
    }
    return producto.base_price;
  };

  // El carrito almacena la llave: "producto_id:lista_precio_id" => cantidad
  const addToCart = (productId: string, priceListId?: string) => {
    const listId = priceListId || selectedList;
    const key = `${productId}:${listId}`;
    setCart((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const removeFromCart = (productId: string, priceListId?: string) => {
    const listId = priceListId || selectedList;
    const key = `${productId}:${listId}`;
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[key] > 1) {
        copy[key] -= 1;
      } else {
        delete copy[key];
      }
      return copy;
    });
  };

  // Helper para sumar las cantidades de un producto independientemente de la lista de precio (para stock y vista rápida)
  const getProductQtyInCart = (productId: string) => {
    return Object.entries(cart).reduce((sum, [key, qty]) => {
      const [pId] = key.split(':');
      return pId === productId ? sum + qty : sum;
    }, 0);
  };

  const totalPedido = Object.entries(cart).reduce((acc, [key, qty]) => {
    const [prodId, listId] = key.split(':');
    const prod = productos.find((p) => p.id === prodId);
    if (!prod) return acc;
    return acc + getPrecioVenta(prod, listId) * qty;
  }, 0);

  const totalItemsInCart = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const enviarPedido = async () => {
    if (!selectedClient) {
      Alert.alert('Falta Cliente', 'Por favor selecciona un cliente para el pedido.');
      return;
    }
    if (Object.keys(cart).length === 0) {
      Alert.alert('Carrito vacío', 'Añade productos antes de enviar.');
      return;
    }

    try {
      setSubmitting(true);
      const detalles = Object.entries(cart).map(([key, qty]) => {
        const [prodId, listId] = key.split(':');
        const prod = productos.find((p) => p.id === prodId)!;
        return {
          producto_id: prodId,
          cantidad: qty,
          precio_unitario: getPrecioVenta(prod, listId),
          lista_precio_id: listId,
        };
      });

      const loggedInUserId = pb.authStore.record?.id || 'vendedor_auth';

      const orderResult = await crearPedido({
        cliente_id: selectedClient.id,
        vendedor_id: loggedInUserId,
        detalles,
        observaciones: 'Pedido tomado desde App Móvil de Vendedores',
      });

      // --- GENERACIÓN DE PDF ---
      const orderNum = orderResult?.number || `PED-${new Date().toISOString().slice(0,10)}`;
      const itemsHtml = detalles.map((d) => {
        const prod = productos.find((p) => p.id === d.producto_id);
        const sub = d.cantidad * d.precio_unitario;
        return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${prod?.name || 'Producto'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: center;">${d.cantidad}</td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">$${d.precio_unitario.toLocaleString('es-CO')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">$${sub.toLocaleString('es-CO')}</td>
          </tr>
        `;
      }).join('');

      const totalVal = detalles.reduce((sum, d) => sum + (d.cantidad * d.precio_unitario), 0);
      const ivaVal = totalVal * 0.19; // 19% IVA
      const grandTotal = totalVal + ivaVal;

      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #1E293B; }
              .header { text-align: center; border-bottom: 3px solid #0F766E; padding-bottom: 12px; margin-bottom: 20px; }
              .title { font-size: 24px; font-weight: bold; color: #0F766E; margin: 0; }
              .subtitle { font-size: 12px; color: #64748B; margin-top: 4px; }
              .info-table { width: 100%; margin-bottom: 20px; font-size: 13px; }
              .info-table td { padding: 4px 0; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
              .items-table th { background-color: #F8FAFC; padding: 10px 8px; border-bottom: 2px solid #E2E8F0; text-align: left; }
              .totals-box { width: 50%; margin-left: auto; font-size: 14px; border-top: 2px solid #0F766E; padding-top: 10px; }
              .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
              .grand-total { font-weight: bold; color: #0F766E; font-size: 16px; border-top: 1px dashed #E2E8F0; padding-top: 6px; }
              .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94A3B8; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">GRAVY PLATFORM</div>
              <div class="subtitle">Comprobante de Pedido de Venta</div>
            </div>
            
            <table class="info-table">
              <tr>
                <td><strong>Nro Pedido:</strong> ${orderNum}</td>
                <td style="text-align: right;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CO')}</td>
              </tr>
              <tr>
                <td><strong>Cliente:</strong> ${selectedClient.nombre}</td>
                <td style="text-align: right;"><strong>NIT/Doc:</strong> ${selectedClient.documento}</td>
              </tr>
              <tr>
                <td><strong>Vendedor ID:</strong> ${loggedInUserId}</td>
                <td></td>
              </tr>
            </table>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 50%;">Producto</th>
                  <th style="text-align: center;">Cant.</th>
                  <th style="text-align: right;">Precio Unit.</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>$${totalVal.toLocaleString('es-CO')}</span>
              </div>
              <div class="totals-row">
                <span>IVA (19%):</span>
                <span>$${ivaVal.toLocaleString('es-CO')}</span>
              </div>
              <div class="totals-row grand-total">
                <span>Total Pedido:</span>
                <span>$${grandTotal.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div class="footer">
              Este documento es un comprobante provisional de pedido. Gravy accounting intelligence platform.
            </div>
          </body>
        </html>
      `;

      // Generar archivo PDF temporal
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      Alert.alert(
        'Pedido Registrado',
        'El pedido se envió y guardó correctamente en el sistema.\n\n¿Deseas compartir el PDF del comprobante por WhatsApp u otro medio?',
        [
          {
            text: 'No, gracias',
            onPress: () => {
              setCart({});
              setIsCartModalVisible(false);
            }
          },
          {
            text: 'Compartir PDF',
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
              } else {
                Alert.alert('Compartir no disponible', 'La funcionalidad de compartir no está disponible en este dispositivo.');
              }
              setCart({});
              setIsCartModalVisible(false);
            }
          }
        ]
      );
    } catch (e: any) {
      console.log('Error al enviar pedido:', JSON.stringify(e, null, 2));
      console.log('Error mensaje:', e?.message);
      
      let validationDetails = '';
      if (e?.response?.data) {
        validationDetails = Object.entries(e.response.data)
          .map(([field, errObj]: [string, any]) => `- ${field}: ${errObj?.message || JSON.stringify(errObj)}`)
          .join('\n');
      } else if (e?.data?.data) {
        validationDetails = Object.entries(e.data.data)
          .map(([field, errObj]: [string, any]) => `- ${field}: ${errObj?.message || JSON.stringify(errObj)}`)
          .join('\n');
      }

      const detailed = validationDetails 
        ? `Campos con error:\n${validationDetails}` 
        : (e?.message || 'Error de conexión o base de datos.');
        
      Alert.alert('Error al Registrar Pedido', detailed);
    } finally {
      setSubmitting(false);
    }
  };

  // Extraer categorías dinámicamente
  const categories = ['Todos', ...Array.from(new Set(productos.map(p => (p as any).category || (p as any).categoria || 'General')))];

  // Filtrar productos
  const filteredProducts = productos.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(productSearch.toLowerCase());
    
    const categoryVal = (p as any).category || (p as any).categoria || 'General';
    const matchesCategory = selectedCategory === 'Todos' || categoryVal === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Filtrar clientes para el buscador
  const filteredClients = clientes.filter(c => 
    c.nombre.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.documento.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Lista de items procesada para renderizar en el carrito
  const cartItemsList = Object.entries(cart).map(([key, qty]) => {
    const [prodId, listId] = key.split(':');
    const prod = productos.find(p => p.id === prodId);
    const price = prod ? getPrecioVenta(prod, listId) : 0;
    const priceListName = listas.find(l => l.id === listId)?.nombre || 'Tarifa';
    return {
      id: key, // usar la llave única compuesta
      qty,
      product: prod,
      price,
      listId,
      priceListName,
    };
  }).filter(item => item.product !== undefined);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Cabecera Clara y Elegante (Estilo Desktop App) */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </Pressable>
          
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#475569" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar en tu catálogo..."
              placeholderTextColor="#94A3B8"
              value={productSearch}
              onChangeText={setProductSearch}
            />
            {productSearch.length > 0 && (
              <Pressable onPress={() => setProductSearch('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          <Pressable 
            style={styles.cartIconContainer}
            onPress={() => setIsCartModalVisible(true)}
          >
            <Ionicons name="cart-outline" size={26} color="#0F172A" />
            {totalItemsInCart > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItemsInCart}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Subheader Suave para Cliente Seleccionado (Azul Claro) */}
      <Pressable 
        style={styles.clientSubheader}
        onPress={() => setIsClientModalVisible(true)}
      >
        <Ionicons name="location-outline" size={16} color="#0284C7" style={{ marginRight: 6 }} />
        <Text style={styles.clientSubheaderText} numberOfLines={1}>
          {selectedClient 
            ? `${selectedClient.nombre} (Doc: ${selectedClient.documento})` 
            : 'Seleccionar cliente para el pedido'}
        </Text>
        <Ionicons name="pencil" size={12} color="#0284C7" style={{ marginLeft: 6 }} />
      </Pressable>

      {/* Subheader de Selección de Tarifa / Lista de Precios */}
      <View style={styles.priceListSubheader}>
        <Ionicons name="pricetag-outline" size={14} color="#475569" style={{ marginRight: 6 }} />
        <Text style={styles.priceListSubheaderLabel}>Tarifa:</Text>
        <FlatList
          horizontal
          data={listas}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingLeft: 6, paddingRight: 16 }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.priceChip, selectedList === item.id && styles.activePriceChip]}
              onPress={() => setSelectedList(item.id)}
            >
              <Text style={[styles.priceChipText, selectedList === item.id && styles.activePriceChipText]}>
                {item.nombre}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Banner de Promociones / Hero Suave y Claro */}
      <View style={styles.promoBanner}>
        <View style={styles.promoTextContainer}>
          <Text style={styles.promoTitle}>Ventas & Despachos</Text>
          <Text style={styles.promoSubtitle}>Sincronización de pedidos en tiempo real con el HUB central</Text>
        </View>
        <Ionicons name="cloud-done-outline" size={44} color="#0284C7" />
      </View>

      {/* Título de Categorías */}
      <Text style={styles.sectionTitle}>Tus categorías favoritas</Text>

      {/* Listado de Categorías horizontal */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.categoryCard, selectedCategory === item && styles.activeCategoryCard]}
              onPress={() => setSelectedCategory(item)}
            >
              <View style={styles.categoryCardIconContainer}>
                <Ionicons 
                  name={item === 'Todos' ? 'grid-outline' : 'cube-outline'} 
                  size={18} 
                  color={selectedCategory === item ? '#0284C7' : '#475569'} 
                />
              </View>
              <Text style={[styles.categoryCardText, selectedCategory === item && styles.activeCategoryCardText]}>
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Listado del Catálogo de Productos */}
      {loading ? (
        <ActivityIndicator size="large" color="#0284C7" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 160 }}
          renderItem={({ item }) => {
            const precioVenta = getPrecioVenta(item);
            const qty = getProductQtyInCart(item.id);
            return (
              <View style={styles.productCard}>
                {item.image ? (
                  <Image 
                    source={{ uri: `${PB_URL}/api/files/pbc_4092854851/${item.id}/${item.image}` }} 
                    style={styles.productImageLarge} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholderLarge}>
                    <Ionicons name="image-outline" size={32} color="#94A3B8" />
                  </View>
                )}
                
                <View style={styles.productDetails}>
                  <Text style={styles.productNameText}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.productDescriptionText} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                  
                  <View style={styles.priceStockRow}>
                    <Text style={styles.productPriceText}>
                      ${precioVenta.toLocaleString('es-CO')}
                    </Text>
                    <Text style={styles.productStockText}>
                      Stock: {item.stock}
                    </Text>
                  </View>

                  <View style={styles.cardActionsRow}>
                    {qty > 0 ? (
                      <View style={styles.quantityContainer}>
                        <Pressable style={styles.qtyBtn} onPress={() => removeFromCart(item.id, selectedList)}>
                          <Ionicons name="remove" size={16} color="#0F172A" />
                        </Pressable>
                        <Text style={styles.qtyVal}>{qty}</Text>
                        <Pressable style={styles.qtyBtn} onPress={() => addToCart(item.id, selectedList)}>
                          <Ionicons name="add" size={16} color="#0F172A" />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable 
                        style={styles.addBtn} 
                        onPress={() => addToCart(item.id, selectedList)}
                      >
                        <Ionicons name="cart-outline" size={16} color="#0284C7" />
                        <Text style={styles.addBtnText}>Agregar</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No se encontraron productos.</Text>
            </View>
          }
        />
      )}

      {/* Confirmación / Footer Rápido */}
      {totalPedido > 0 && (
        <View style={styles.footerContainer}>
          <View>
            <Text style={styles.footerLabelText}>Total Pedido</Text>
            <Text style={styles.footerValueText}>${totalPedido.toLocaleString('es-CO')}</Text>
          </View>
          <Pressable 
            style={[styles.checkoutBtn, !selectedClient && styles.checkoutBtnDisabled]} 
            onPress={() => setIsCartModalVisible(true)}
          >
            <Text style={styles.checkoutBtnText}>Ver Carrito ({totalItemsInCart})</Text>
            <Ionicons name="cart" size={16} color="#FFF" />
          </Pressable>
        </View>
      )}

      {/* MODAL DE BÚSQUEDA Y SELECCIÓN DE CLIENTE */}
      <Modal
        visible={isClientModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsClientModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
              <Pressable onPress={() => setIsClientModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </Pressable>
            </View>

            {/* Buscador de Clientes */}
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Buscar por nombre o documento..."
                placeholderTextColor="#94A3B8"
                value={clientSearch}
                onChangeText={setClientSearch}
                autoFocus={true}
              />
            </View>

            {/* Listado de Clientes */}
            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable 
                  style={[styles.clientListItem, selectedClient?.id === item.id && styles.clientListItemSelected]}
                  onPress={() => handleSelectClient(item)}
                >
                  <View style={styles.clientItemInfo}>
                    <Text style={styles.clientItemName}>{item.nombre}</Text>
                    <Text style={styles.clientItemDoc}>Doc: {item.documento}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={36} color="#94A3B8" />
                  <Text style={styles.emptyText}>No se encontraron clientes.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* MODAL / BOTTOM SHEET DE VISTA DE DETALLE DEL CARRITO */}
      <Modal
        visible={isCartModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCartModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="cart" size={22} color="#0284C7" />
                <Text style={styles.modalTitle}>Detalle del Carrito</Text>
              </View>
              <Pressable onPress={() => setIsCartModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </Pressable>
            </View>

            {/* Advertencia o Info del Cliente */}
            <View style={[styles.cartClientHeader, !selectedClient && styles.cartClientHeaderError]}>
              <Ionicons 
                name={selectedClient ? "person-circle" : "warning-outline"} 
                size={22} 
                color={selectedClient ? "#0369A1" : "#B91C1C"} 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.cartClientHeaderText, !selectedClient && styles.cartClientHeaderTextError]}>
                  {selectedClient ? `Cliente: ${selectedClient.nombre}` : 'Sin Cliente Seleccionado'}
                </Text>
                <Text style={styles.cartClientHeaderSub}>
                  {selectedClient ? `NIT: ${selectedClient.documento}` : 'Debes elegir un cliente para almacenar el pedido.'}
                </Text>
              </View>
              {!selectedClient && (
                <Pressable 
                  style={styles.selectClientBtnMini}
                  onPress={() => { setIsCartModalVisible(false); setIsClientModalVisible(true); }}
                >
                  <Text style={styles.selectClientBtnMiniText}>Elegir</Text>
                </Pressable>
              )}
            </View>

            {/* Listado del Carrito */}
            <FlatList
              data={cartItemsList}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => {
                const subtotal = item.qty * item.price;
                return (
                  <View style={styles.cartListItem}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.cartItemNameText}>{item.product?.name}</Text>
                      <Text style={styles.cartItemPriceLabelText}>
                        ${item.price.toLocaleString('es-CO')} x {item.qty} ({item.priceListName})
                      </Text>
                    </View>
                    
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Text style={styles.cartItemSubtotalText}>
                        ${subtotal.toLocaleString('es-CO')}
                      </Text>
                      
                      <View style={styles.cartItemStepper}>
                        <Pressable style={styles.cartStepperBtn} onPress={() => removeFromCart(item.product?.id || '', item.listId)}>
                          <Ionicons name="remove" size={14} color="#0F172A" />
                        </Pressable>
                        <Text style={styles.cartStepperVal}>{item.qty}</Text>
                        <Pressable style={styles.cartStepperBtn} onPress={() => addToCart(item.product?.id || '', item.listId)}>
                          <Ionicons name="add" size={14} color="#0F172A" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="cart-outline" size={48} color="#94A3B8" />
                  <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
                </View>
              }
            />

            {/* Resumen de totales */}
            <View style={styles.cartTotalsSection}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsValue}>${(totalPedido / 1.19).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>IVA (19% aprox)</Text>
                <Text style={styles.totalsValue}>${(totalPedido - (totalPedido / 1.19)).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</Text>
              </View>
              <View style={[styles.totalsRow, { marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
                <Text style={[styles.totalsLabel, { fontSize: 16, color: '#0F172A', fontWeight: 'bold' }]}>Total Pedido</Text>
                <Text style={[styles.totalsValue, { fontSize: 18, color: '#0284C7', fontWeight: 'bold' }]}>${totalPedido.toLocaleString('es-CO')}</Text>
              </View>
            </View>

            {/* Acciones del carrito */}
            <View style={styles.cartActionsContainer}>
              <Pressable 
                style={styles.cartCancelBtn}
                onPress={() => setIsCartModalVisible(false)}
              >
                <Text style={styles.cartCancelBtnText}>Cerrar</Text>
              </Pressable>

              <Pressable 
                style={[
                  styles.cartSubmitBtn, 
                  (!selectedClient || cartItemsList.length === 0) && styles.cartSubmitBtnDisabled
                ]}
                onPress={enviarPedido}
                disabled={submitting || !selectedClient || cartItemsList.length === 0}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.cartSubmitBtnText}>Confirmar y Enviar</Text>
                    <Ionicons name="cloud-upload" size={16} color="#FFF" />
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    padding: 0,
  },
  cartIconContainer: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#0284C7',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  clientSubheader: {
    backgroundColor: '#F0F9FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2FE',
  },
  clientSubheaderText: {
    color: '#0369A1',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  priceListSubheader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  priceListSubheaderLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginRight: 4,
  },
  priceChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activePriceChip: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  priceChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  activePriceChipText: {
    color: '#0284C7',
  },
  promoBanner: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  promoTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  promoTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  promoSubtitle: {
    color: '#475569',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginLeft: 16,
    marginBottom: 8,
  },
  categoriesContainer: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  activeCategoryCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0284C7',
  },
  categoryCardIconContainer: {
    backgroundColor: '#F1F5F9',
    padding: 6,
    borderRadius: 8,
  },
  categoryCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  activeCategoryCardText: {
    color: '#0284C7',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  productImageLarge: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  imagePlaceholderLarge: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  productDescriptionText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  priceStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  productPriceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0284C7',
  },
  productStockText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0284C7',
    gap: 4,
  },
  addBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
    gap: 6,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    width: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  footerLabelText: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  footerValueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    gap: 6,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#475569',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
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
  modalSearchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
  },
  clientListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  clientListItemSelected: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  clientItemInfo: {
    flex: 1,
  },
  clientItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  clientItemDoc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  cartClientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B9E6FD',
    marginBottom: 16,
    gap: 10,
  },
  cartClientHeaderError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  cartClientHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  cartClientHeaderTextError: {
    color: '#991B1B',
  },
  cartClientHeaderSub: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  selectClientBtnMini: {
    backgroundColor: '#B91C1C',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  selectClientBtnMiniText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cartItemNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  cartItemPriceLabelText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cartItemSubtotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cartItemStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
    gap: 4,
  },
  cartStepperBtn: {
    width: 22,
    height: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartStepperVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
    width: 16,
    textAlign: 'center',
  },
  cartTotalsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 16,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalsLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  totalsValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  cartActionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  cartCancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cartSubmitBtn: {
    flex: 2,
    height: 48,
    flexDirection: 'row',
    backgroundColor: '#0284C7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  cartSubmitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  cartSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
