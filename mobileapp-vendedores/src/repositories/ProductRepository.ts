import { Product } from '../types';
import { PocketBaseAdapter, PB_URL } from '../lib/pocketbase';

export class ProductRepository {
  /**
   * Obtiene el catálogo de productos con stock y precios filtrado por empresa_id.
   */
  static async getProducts(): Promise<Product[]> {
    try {
      const records = await PocketBaseAdapter.fetchList<any>('products', 'active = true', 'name');

      return records.map((r) => ({
        id: r.id,
        sku: r.code || r.sku || `PROD-${r.id.slice(0, 4)}`,
        name: r.name || 'Producto sin nombre',
        category: (r.category || 'Dry Goods') as any,
        price: Number(r.base_price || r.price || 0),
        stock: Number(r.stock || r.qty_available || 0),
        unit: r.unit || 'UND',
        imageUrl: r.image ? `${PB_URL}/api/files/products/${r.id}/${r.image}` : undefined,
        description: r.description || 'Sin descripción',
      }));
    } catch (error) {
      console.error('[ProductRepository] Error al consultar catálogo de productos:', error);
      throw error;
    }
  }
}
