# -*- coding: utf-8 -*-
"""
Script para extraer y generar la documentación técnica completa de la arquitectura
de base de datos de GRAVY (PocketBase) para aplicaciones móviles.
Genera tanto ARQUITECTURA_BASE_DATOS_MOVIL.txt como ARQUITECTURA_BASE_DATOS_MOVIL.md.
"""
import sqlite3
import json
import os
import sys

def build_mobile_documentation():
    db_path = os.path.join(os.getcwd(), 'pb_data', 'data.db')
    if not os.path.exists(db_path):
        print(f"Error: No se encontró la base de datos en {db_path}")
        return

    con = sqlite3.connect(db_path)
    cur = con.cursor()
    cur.execute("SELECT name, type, fields, indexes, listRule, viewRule, createRule, updateRule, deleteRule FROM _collections ORDER BY name")
    collections_data = cur.fetchall()
    con.close()

    # Map collections
    collections_map = {}
    for row in collections_data:
        name, ctype, fields_json, indexes_json, lrule, vrule, crule, urule, drule = row
        fields = json.loads(fields_json) if fields_json else []
        indexes = json.loads(indexes_json) if indexes_json else []
        collections_map[name] = {
            'name': name,
            'type': ctype,
            'fields': fields,
            'indexes': indexes,
            'rules': {
                'list': lrule,
                'view': vrule,
                'create': crule,
                'update': urule,
                'delete': drule
            }
        }

    # Group collections into logical functional modules
    modules = [
        {
            "id": "MOD_01_AUTH",
            "title": "1. AUTENTICACIÓN, USUARIOS Y CONFIGURACIÓN BASE",
            "description": "Colecciones esenciales para el inicio de sesión del usuario móvil, permisos de sedes/bodegas y parámetros generales.",
            "tables": ["users", "branches", "cost_centers", "settings", "licenses"]
        },
        {
            "id": "MOD_02_CRM",
            "title": "2. TERCEROS, CLIENTES Y CRM MÓVIL",
            "description": "Gestión de clientes, contactos, sucursales del cliente, listas de precios asignadas y seguimiento comercial.",
            "tables": ["third_parties", "third_party_branches", "clientes", "crm_deals", "crm_interactions"]
        },
        {
            "id": "MOD_03_TRACKING",
            "title": "3. FUERZA DE VENTAS EN CAMPO, VISITAS Y GEOLOCALIZACIÓN GPS",
            "description": "Módulo clave para aplicaciones de preventa y vendedores en calle: visitas a clientes, check-in, tracking GPS y telemetría de batería.",
            "tables": ["vendor_visits", "seller_live_locations", "seller_tracking_logs"]
        },
        {
            "id": "MOD_04_CATALOGO",
            "title": "4. PRODUCTOS, CATÁLOGO, PRECIOS E INVENTARIO",
            "description": "Catálogo de artículos, listas de precios, existencias por bodega, movimientos y control de lotes.",
            "tables": [
                "products", "product_components", "listas_precios", "precios_producto",
                "warehouses", "inventory_stock", "inventory_movements", "inventory_movement_lines",
                "inventory_concepts", "inventory_lots", "inventory_pallets"
            ]
        },
        {
            "id": "MOD_05_VENTAS",
            "title": "5. PEDIDOS, FACTURACIÓN Y PUNTO DE VENTA (POS MÓVIL)",
            "description": "Creación y sincronización de pedidos de venta en calle (preventa), facturas POS, turnos de caja y resoluciones DIAN.",
            "tables": [
                "sales_orders", "sales_order_lines", "sales_reservations", "sales_reservation_lines",
                "invoices", "invoice_lines", "pos_registers", "pos_shifts", "dian_resolutions"
            ]
        },
        {
            "id": "MOD_06_CARTERA",
            "title": "6. TESORERÍA, RECAUDOS Y CARTERA (CXC MÓVIL)",
            "description": "Registro de cobros a clientes en ruta, abonos a facturas, cuentas bancarias y conceptos de caja.",
            "tables": ["payments", "bank_accounts", "bank_movements", "cash_concepts", "treasury_settings"]
        },
        {
            "id": "MOD_07_LOGISTICA",
            "title": "7. LOGÍSTICA, RUTAS Y ENTREGAS",
            "description": "Despachos y entregas de pedidos con vehículos asignados, seguimiento de líneas de entrega.",
            "tables": ["logistica_vehicles", "logistica_deliveries", "logistica_delivery_lines"]
        },
        {
            "id": "MOD_08_GEOGRAFIA",
            "title": "8. GEOGRAFÍA Y DIVIPOLA (COLOMBIA)",
            "description": "Tablas maestras de países, departamentos y municipios para georreferenciación de clientes y rutas.",
            "tables": ["geo_countries", "geo_departments", "geo_municipalities"]
        },
        {
            "id": "MOD_09_COMPRAS",
            "title": "9. COMPRAS, PROVEEDORES Y COMERCIO EXTERIOR",
            "description": "Órdenes de compra, facturas de compra, importaciones y liquidaciones de consignación.",
            "tables": [
                "purchase_orders", "purchase_order_lines", "purchase_invoices", "purchase_invoice_lines",
                "imports", "import_lines", "import_invoices", "import_pallet_configs",
                "consignment_settlements", "consignment_settlement_lines"
            ]
        },
        {
            "id": "MOD_10_CONTABILIDAD",
            "title": "10. CONTABILIDAD FINANCIERA, PUC Y TRANSACCIONES",
            "description": "Plan Único de Cuentas (PUC), comprobantes contables y asientos de partida doble.",
            "tables": [
                "accounts", "account_types", "transactions", "tx_lines",
                "transaction_types", "financial_notes", "bank_reconciliations",
                "exogena_concepts", "homologation_rules", "commission_rules"
            ]
        },
        {
            "id": "MOD_11_DIAN",
            "title": "11. FACTURACIÓN ELECTRÓNICA Y NÓMINA ELECTRÓNICA DIAN",
            "description": "Documentos electrónicos DIAN (XML, CUFE, estados de validación) y nómina electrónica.",
            "tables": [
                "electronic_documents", "electronic_document_items", "electronic_document_taxes",
                "einvoice_docs", "electronic_payrolls",
                "payroll_documents", "payroll_lines", "payroll_novelties", "payroll_periods", "payroll_settlements"
            ]
        },
        {
            "id": "MOD_12_VERTICALES",
            "title": "12. MÓDULOS VERTICALES (PROPIEDAD HORIZONTAL, INMOBILIARIA, SERVICIOS)",
            "description": "Esquemas específicos para propiedad horizontal (PH), contratos de arrendamiento y servicios/veterinaria.",
            "tables": [
                "ph_properties", "ph_invoices", "ph_invoice_lines", "ph_billing_concepts",
                "ph_common_areas", "ph_reservations", "ph_individual_charges", "ph_pqrs", "ph_budgets", "ph_budget_lines",
                "inmo_properties", "inmo_contracts", "inmo_invoices", "inmo_invoice_lines", "inmo_property_history",
                "pets", "appointments", "spa_clients",
                "niif_assets", "niif_asset_categories", "niif_asset_events", "niif_asset_inventories",
                "niif_leases", "niif_policies", "niif_settings", "agenda_vencimientos"
            ]
        },
        {
            "id": "MOD_13_SISTEMA",
            "title": "13. TABLAS INTERNAS Y AUDITORÍA",
            "description": "Logs de auditoría del sistema y colecciones de autenticación interna de PocketBase.",
            "tables": ["audit_log", "_superusers", "_authOrigins", "_externalAuths", "_mfas", "_otps"]
        }
    ]

    # Generate Markdown Content
    md = []
    txt = []

    def add_line(line=""):
        md.append(line)
        txt.append(line)

    add_line("================================================================================")
    add_line("   ARQUITECTURA DE BASE DE DATOS Y GUÍA DE INTEGRACIÓN MÓVIL - GRAVY v2.0")
    add_line("   Motor de Base de Datos: PocketBase v0.22+ (SQLite WAL Mode)")
    add_line("================================================================================")
    add_line()
    add_line("Este documento está diseñado específicamente para desarrolladores de aplicaciones móviles")
    add_line("(Flutter, React Native, Kotlin, Swift, Expo, PWA) y agentes de IA. Contiene las especificaciones")
    add_line("técnicas de conexión, protocolos de autenticación, reglas de almacenamiento de datos,")
    add_line("estrategia offline-first y el diccionario completo de las 106 colecciones de la base de datos.")
    add_line()
    add_line("--------------------------------------------------------------------------------")
    add_line("TABLA DE CONTENIDO")
    add_line("--------------------------------------------------------------------------------")
    add_line("1. INFRAESTRUCTURA DE CONEXIÓN Y SERVIDORES")
    add_line("2. PROTOCOLO DE AUTENTICACIÓN Y SEGURIDAD MÓVIL")
    add_line("3. ARQUITECTURA DE COMUNICACIÓN REST Y REALTIME (SSE)")
    add_line("4. CÓMO ALMACENAR DATOS: CONVENCIONES, RELACIONES Y PAYLOADS")
    add_line("5. ESTRATEGIA DE SINCRONIZACIÓN OFFLINE-FIRST EN DISPOSITIVOS MÓVILES")
    add_line("6. FLUJOS OPERATIVOS CLAVE EN RUTA (CASOS DE USO MÓVIL)")
    add_line("7. DICCIONARIO COMPLETO DE COLECCIONES Y ESQUEMA DE CAMPOS")
    add_line("8. PLANTILLAS DE CÓDIGO LISTAS PARA USAR (FLUTTER / REACT NATIVE)")
    add_line("--------------------------------------------------------------------------------")
    add_line()

    # SECTION 1
    add_line("================================================================================")
    add_line("1. INFRAESTRUCTURA DE CONEXIÓN Y SERVIDORES")
    add_line("================================================================================")
    add_line("GRAVY opera con una arquitectura híbrida accesible tanto en red local como por internet:")
    add_line()
    add_line("A) CONEXIÓN EN RED LOCAL (LAN / Wi-Fi):")
    add_line("   - URL Base: http://<IP_LOCAL_DEL_SERVIDOR>:8090")
    add_line("   - Ejemplo: http://192.168.1.150:8090")
    add_line("   - Uso: Dispositivos en el mismo almacén, tienda o red Wi-Fi de la empresa.")
    add_line("   - Latencia: Ultra baja (<5 ms).")
    add_line()
    add_line("B) CONEXIÓN REMOTA / INTERNET (WAN / 4G / 5G vía Cloudflare Tunnel):")
    add_line("   - URL Base: https://<subdominio>.gravy-ms.com (o dominio de cliente configurado)")
    add_line("   - Ejemplo: https://app.gravy-ms.com")
    add_line("   - Protocolo: HTTPS / TLS 1.3 con cifrado de extremo a extremo sin abrir puertos.")
    add_line("   - Uso: Vendedores en calle, supervisores, choferes y clientes remotos.")
    add_line()
    add_line("REGLA PARA LA APP MÓVIL:")
    add_line("Configurar una pantalla de 'Ajustes de Servidor' o 'Selector de Empresa' donde el usuario")
    add_line("pueda definir la URL base (LAN o Cloud) o detectar automáticamente la red disponible.")
    add_line()

    # SECTION 2
    add_line("================================================================================")
    add_line("2. PROTOCOLO DE AUTENTICACIÓN Y SEGURIDAD MÓVIL")
    add_line("================================================================================")
    add_line("El backend maneja autenticación JWT a través de la colección 'users'.")
    add_line()
    add_line("A) LOGIN CON CREDENCIALES (Email / Username + Password):")
    add_line("   - Método: POST")
    add_line("   - Endpoint: /api/collections/users/auth-with-password")
    add_line("   - Headers: Content-Type: application/json")
    add_line("   - Body JSON:")
    add_line('     {')
    add_line('       "identity": "vendedor@empresa.com",')
    add_line('       "password": "Password123*"')
    add_line('     }')
    add_line()
    add_line("   - Respuesta Exitosa (HTTP 200 OK):")
    add_line('     {')
    add_line('       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",')
    add_line('       "record": {')
    add_line('         "id": "u1a2b3c4d5e6f7g",')
    add_line('         "email": "vendedor@empresa.com",')
    add_line('         "name": "Juan Pérez",')
    add_line('         "full_name": "Juan Carlos Pérez",')
    add_line('         "role": ["vendedor"],')
    add_line('         "default_branch_id": "b1a2b3c4d5e6f7g",')
    add_line('         "allowed_branches": ["b1a2b3c4d5e6f7g"],')
    add_line('         "default_warehouse_id": "w1a2b3c4d5e6f7g",')
    add_line('         "allowed_warehouses": ["w1a2b3c4d5e6f7g"],')
    add_line('         "active": true')
    add_line('       }')
    add_line('     }')
    add_line()
    add_line("B) ALMACENAMIENTO SEGURO DEL TOKEN EN EL DISPOSITIVO MÓVIL:")
    add_line("   - Flutter: Usar 'flutter_secure_storage'.")
    add_line("   - React Native: Usar 'expo-secure-store' o 'react-native-keychain'.")
    add_line("   - NUNCA guardar el token en AsyncStorage o SharedPreferences sin cifrar.")
    add_line()
    add_line("C) ENCABEZADO REQUERIDO EN TODAS LAS PETICIONES SUBSECUENTES:")
    add_line("   Authorization: Bearer <token>")
    add_line()
    add_line("D) RENOVACIÓN DE SESIÓN (AUTH REFRESH):")
    add_line("   - Método: POST")
    add_line("   - Endpoint: /api/collections/users/auth-refresh")
    add_line("   - Headers: Authorization: Bearer <token>")
    add_line("   - Permite verificar si la sesión sigue activa y renovar el JWT al iniciar la app.")
    add_line()

    # SECTION 3
    add_line("================================================================================")
    add_line("3. ARQUITECTURA DE COMUNICACIÓN REST Y REALTIME (SSE)")
    add_line("================================================================================")
    add_line("PocketBase expone una API REST uniforme para todas las colecciones:")
    add_line()
    add_line("A) ENDPOINTS REST UNIVERSALES:")
    add_line("   - Listar Registros con paginación, filtros y orden:")
    add_line("     GET /api/collections/{collection}/records?page=1&perPage=50&filter=(...)&sort=-created&expand=(...)")
    add_line("   - Obtener un Registro por ID:")
    add_line("     GET /api/collections/{collection}/records/{id}")
    add_line("   - Crear un Registro:")
    add_line("     POST /api/collections/{collection}/records")
    add_line("   - Actualizar un Registro (parcial):")
    add_line("     PATCH /api/collections/{collection}/records/{id}")
    add_line("   - Eliminar un Registro:")
    add_line("     DELETE /api/collections/{collection}/records/{id}")
    add_line("   - Peticiones en Lote (Batch Transaccional):")
    add_line("     POST /api/batch")
    add_line()
    add_line("B) PARÁMETROS CRÍTICOS PARA LA APP MÓVIL:")
    add_line("   - expand: Permite traer relaciones hijas o padres en una sola petición HTTP.")
    add_line("     Ejemplo en Pedidos: ?expand=customer_id,seller_id")
    add_line("     Ejemplo en Líneas de Pedido: ?expand=product_id")
    add_line("   - filter: Sintaxis de filtrado PocketBase.")
    add_line("     Ejemplo clientes activos: ?filter=(active=true)")
    add_line("     Ejemplo productos con stock: ?filter=(active=true && base_price > 0)")
    add_line("     Ejemplo búsqueda por texto: ?filter=(name ~ 'arroz' || code ~ 'arroz')")
    add_line("     Ejemplo pedidos de hoy: ?filter=(date >= '2026-09-16 00:00:00')")
    add_line("   - sort: Campo de ordenamiento (prefijo '-' para descendente).")
    add_line("     Ejemplo: ?sort=-created,-date")
    add_line()
    add_line("C) SERVICIO DE ARCHIVOS E IMÁGENES (PRODUCTOS, RUT, FOTOS DE VISITAS):")
    add_line("   - URL Estándar: /api/files/{collection_id_or_name}/{record_id}/{filename}")
    add_line("   - Generación de Miniaturas (Thumbnails optimizados para móviles):")
    add_line("     /api/files/{collection}/{recordId}/{filename}?thumb=100x100  (para listados rápidos)")
    add_line("     /api/files/{collection}/{recordId}/{filename}?thumb=300x300  (para detalle de producto)")
    add_line()
    add_line("D) SUSCRIPCIONES EN TIEMPO REAL (SERVER-SENT EVENTS - SSE):")
    add_line("   - Protocolo: Conexión persistente en /api/realtime.")
    add_line("   - La app móvil puede escuchar cambios en tiempo real sin hacer polling:")
    add_line("     pb.collection('sales_orders').subscribe('*', (e) => { ... });")
    add_line("     pb.collection('inventory_stock').subscribe('*', (e) => { ... });")
    add_line()

    # SECTION 4
    add_line("================================================================================")
    add_line("4. CÓMO ALMACENAR DATOS: CONVENCIONES, RELACIONES Y PAYLOADS")
    add_line("================================================================================")
    add_line("Reglas mandatorias para almacenar y estructurar información correctamente:")
    add_line()
    add_line("A) ESTRUCTURA DE LOS IDENTIFICADORES (ID):")
    add_line("   - Todos los registros en PocketBase tienen una columna 'id' que consiste en")
    add_line("     una cadena de exactamente 15 caracteres alfanuméricos en minúsculas (ej: 'k1p8q9w2m4x7z0v').")
    add_line("   - Si no se envía 'id', PocketBase lo genera automáticamente.")
    add_line("   - La app móvil puede pre-generar IDs de 15 caracteres antes de sincronizar,")
    add_line("     o mapear un ID local temporal al ID que devuelva el servidor.")
    add_line()
    add_line("B) MANEJO DE RELACIONES FORÁNEAS (RELATION FIELDS):")
    add_line("   - Relación Simple (1:1 o N:1):")
    add_line("     Se envía un string con el ID de 15 caracteres del registro padre.")
    add_line('     Ejemplo: "customer_id": "9x4k2m8p7q1v0z3"')
    add_line("   - Relación Múltiple (Array):")
    add_line("     Se envía un array de strings.")
    add_line('     Ejemplo: "allowed_branches": ["b1a2b3c4d5e6f7g", "b9x8w7v6u5t4s3r"]')
    add_line()
    add_line("C) PATRÓN DE GUARDADO CABECERA-DETALLE (MASTER-DETAIL):")
    add_line("   La mayoría de transacciones comerciales en GRAVY (Pedidos, Facturas, Movimientos de Inventario)")
    add_line("   se dividen en dos tablas: Cabecera y Líneas de Detalle.")
    add_line()
    add_line("   Paso 1: Guardar la Cabecera.")
    add_line("   POST /api/collections/sales_orders/records")
    add_line('   Payload: { "number": "PED-001", "customer_id": "...", "date": "2026-09-16", ... }')
    add_line("   El servidor responde con el nuevo registro, incluyendo su 'id'.")
    add_line()
    add_line("   Paso 2: Guardar las Líneas vinculadas con el id de la cabecera.")
    add_line("   POST /api/collections/sales_order_lines/records")
    add_line('   Payload: { "sales_order_id": "<id_retornado_en_paso_1>", "product_id": "...", "qty": 5, ... }')
    add_line()
    add_line("   Alternativa Atómica (Recomendada con conexión activa):")
    add_line("   Usar el endpoint POST /api/batch para enviar la cabecera y todas las líneas")
    add_line("   en una única transacción atómica de base de datos.")
    add_line()

    # SECTION 5
    add_line("================================================================================")
    add_line("5. ESTRATEGIA DE SINCRONIZACIÓN OFFLINE-FIRST EN DISPOSITIVOS MÓVILES")
    add_line("================================================================================")
    add_line("En el contexto de vendedores en ruta y transportistas, la app móvil DEBE funcionar")
    add_line("sin internet (modo desconectado en carreteras o bodegas sin señal).")
    add_line()
    add_line("A) ARQUITECTURA DE BASE DE DATOS LOCAL EN EL DISPOSITIVO:")
    add_line("   - Utilizar SQLite local (Drift/Moor en Flutter, WatermelonDB / Expo SQLite en React Native).")
    add_line("   - Replicar localmente las tablas maestras de lectura rápida:")
    add_line("     1. 'products' y 'inventory_stock' (para consultar catálogo y stock offline).")
    add_line("     2. 'third_parties' (para seleccionar clientes y consultar cupo de crédito).")
    add_line("     3. 'listas_precios' y 'precios_producto'.")
    add_line("     4. 'vendor_visits' (ruta de visitas del día).")
    add_line()
    add_line("B) TABLA DE COLA DE SINCRONIZACIÓN LOCAL (PENDING SYNC QUEUE):")
    add_line("   Crear en la base de datos local del móvil una tabla especial:")
    add_line("   CREATE TABLE sync_queue (")
    add_line("     id INTEGER PRIMARY KEY AUTOINCREMENT,")
    add_line("     collection_name TEXT NOT NULL,")
    add_line("     operation TEXT NOT NULL,      -- 'CREATE', 'UPDATE', 'DELETE'")
    add_line("     temp_local_id TEXT NOT NULL,")
    add_line("     payload_json TEXT NOT NULL,")
    add_line("     created_at TEXT NOT NULL,")
    add_line("     status TEXT DEFAULT 'PENDING',-- 'PENDING', 'SYNCING', 'FAILED', 'DONE'")
    add_line("     retry_count INTEGER DEFAULT 0,")
    add_line("     error_message TEXT")
    add_line("   );")
    add_line()
    add_line("C) FLUJO DE SINCRONIZACIÓN EN 2 FASES:")
    add_line("   FASE 1: DESCARGA (PULL - Servidor -> Móvil):")
    add_line("   - Guardar localmente el timestamp de la última sincronización: last_sync_timestamp.")
    add_line("   - Al tener internet, consultar únicamente registros creados o modificados después:")
    add_line("     GET /api/collections/products/records?filter=(updated > '2026-09-15 18:00:00')")
    add_line("   - Aplicar cambios en el SQLite local.")
    add_line()
    add_line("   FASE 2: SUBIDA (PUSH - Móvil -> Servidor):")
    add_line("   - Tomar registros pendientes de 'sync_queue' en orden FIFO (por fecha de creación).")
    add_line("   - Si se creó un pedido offline con ID temporal:")
    add_line("     1. Enviar la cabecera a /api/collections/sales_orders/records.")
    add_line("     2. Obtener el 'id' oficial del servidor.")
    add_line("     3. Actualizar en la cola local las líneas pendientes reemplazando 'temp_id' por el nuevo 'id'.")
    add_line("     4. Enviar las líneas a /api/collections/sales_order_lines/records.")
    add_line("     5. Marcar los registros de la cola como 'DONE'.")
    add_line()

    # SECTION 6
    add_line("================================================================================")
    add_line("6. FLUJOS OPERATIVOS CLAVE EN RUTA (CASOS DE USO MÓVIL)")
    add_line("================================================================================")
    add_line()
    add_line("--- FLUJO A: VISITA A CLIENTE CON CHECK-IN GEORREFERENCIADO ---")
    add_line("Colección: 'vendor_visits'")
    add_line("1. Al llegar al cliente, la app obtiene coordenadas GPS del dispositivo (lat, lng).")
    add_line("2. Registra el Check-in:")
    add_line("   POST /api/collections/vendor_visits/records")
    add_line('   {')
    add_line('     "seller_id": "usr_vendedor123",')
    add_line('     "client_id": "cli_tercero456",')
    add_line('     "visit_date": "2026-09-16",')
    add_line('     "status": "EN_PROCESO",')
    add_line('     "objective": "VENTA",')
    add_line('     "checkin_time": "2026-09-16 09:30:15",')
    add_line('     "geo_lat": 4.60971,')
    add_line('     "geo_lng": -74.08175,')
    add_line('     "notes": "Inicio de gestión comercial"')
    add_line('   }')
    add_line("3. Al terminar la visita, registra el Check-out:")
    add_line("   PATCH /api/collections/vendor_visits/records/{visit_id}")
    add_line('   {')
    add_line('     "status": "EFECTIVA",')
    add_line('     "checkout_time": "2026-09-16 09:55:00",')
    add_line('     "sales_order_id": "ped_9988776655"')
    add_line('   }')
    add_line()
    add_line("--- FLUJO B: TELEMETRÍA EN VIVO DEL VENDEDOR (TRACKING GPS) ---")
    add_line("Colección: 'seller_live_locations' (actualización continua en segundo plano)")
    add_line("1. Cada 30-60 segundos, la app reporta su posición:")
    add_line("   PATCH /api/collections/seller_live_locations/records/{seller_location_id}")
    add_line('   {')
    add_line('     "lat": 4.61025,')
    add_line('     "lng": -74.08210,')
    add_line('     "speed": 18.5,')
    add_line('     "battery_level": 82,')
    add_line('     "is_charging": false,')
    add_line('     "status": "EN_RUTA",')
    add_line('     "last_ping": "2026-09-16 09:35:00"')
    add_line('   }')
    add_line()
    add_line("--- FLUJO C: TOMA DE PEDIDO EN CALLE (PREVENTA / SALES ORDER) ---")
    add_line("Colecciones: 'sales_orders' (Cabecera) y 'sales_order_lines' (Detalle)")
    add_line("1. Enviar Cabecera:")
    add_line("   POST /api/collections/sales_orders/records")
    add_line('   {')
    add_line('     "number": "PED-MOV-0042",')
    add_line('     "customer_id": "cli_tercero456",')
    add_line('     "seller_id": "usr_vendedor123",')
    add_line('     "user_id": "usr_vendedor123",')
    add_line('     "warehouse_id": "bod_principal01",')
    add_line('     "branch_id": "sed_bogota001",')
    add_line('     "date": "2026-09-16",')
    add_line('     "due_date": "2026-09-30",')
    add_line('     "subtotal": 150000,')
    add_line('     "iva_total": 28500,')
    add_line('     "discount_amount": 0,')
    add_line('     "total": 178500,')
    add_line('     "status": "pending",')
    add_line('     "fulfillment_status": "SIN_GESTION",')
    add_line('     "notes": "Entregar en jornada de la mañana"')
    add_line('   }')
    add_line("2. Con el ID retornado (ej: 'ord_abc123xyz789'), enviar cada línea de producto:")
    add_line("   POST /api/collections/sales_order_lines/records")
    add_line('   {')
    add_line('     "sales_order_id": "ord_abc123xyz789",')
    add_line('     "product_id": "prd_cafe100gr45",')
    add_line('     "line_order": 1,')
    add_line('     "description": "Café Especial 500g",')
    add_line('     "qty": 10,')
    add_line('     "unit_price": 15000,')
    add_line('     "iva_rate": 19,')
    add_line('     "iva_amount": 28500,')
    add_line('     "subtotal": 150000,')
    add_line('     "total": 178500')
    add_line('   }')
    add_line()
    add_line("--- FLUJO D: RECAUDO / PAGO EN RUTA (COBRANZA CXC) ---")
    add_line("Colección: 'payments'")
    add_line("1. El vendedor recibe dinero en efectivo o transferencia por una factura existente:")
    add_line("   POST /api/collections/payments/records")
    add_line('   {')
    add_line('     "invoice_id": "fac_fac00123456",')
    add_line('     "amount": 178500,')
    add_line('     "payment_method": "EFECTIVO",')
    add_line('     "date": "2026-09-16 10:15:00"')
    add_line('   }')
    add_line()
    add_line("--- FLUJO E: CREACIÓN DE NUEVO CLIENTE EN RUTA (PROSPECCIÓN / CRM) ---")
    add_line("Colección: 'third_parties'")
    add_line("1. El vendedor registra un nuevo punto de venta en campo:")
    add_line("   POST /api/collections/third_parties/records")
    add_line('   {')
    add_line('     "type": ["CLIENTE"],')
    add_line('     "doc_type": ["CC"],')
    add_line('     "doc_number": "1020304050",')
    add_line('     "name": "Tienda La Esperanza",')
    add_line('     "first_name": "Pedro",')
    add_line('     "last_name": "Gómez",')
    add_line('     "commercial_name": "Tienda La Esperanza",')
    add_line('     "phone": "3109876543",')
    add_line('     "email": "pedro.gomez@gmail.com",')
    add_line('     "address": "Calle 45 # 12-34",')
    add_line('     "city": "Bogotá",')
    add_line('     "department": "Cundinamarca",')
    add_line('     "tax_regime": ["NO_RESP"],')
    add_line('     "credit_limit": 500000,')
    add_line('     "payment_days": 15,')
    add_line('     "active": true')
    add_line('   }')
    add_line()

    # SECTION 7: DETAILED DICTIONARY OF COLLECTIONS
    add_line("================================================================================")
    add_line("7. DICCIONARIO COMPLETO DE COLECCIONES Y ESQUEMA DE CAMPOS")
    add_line("================================================================================")
    add_line("A continuación se detallan todas las colecciones agrupadas por módulo, especificando:")
    add_line("- Nombre de tabla y tipo.")
    add_line("- Lista exhaustiva de campos.")
    add_line("- Tipo de dato PocketBase (text, number, bool, email, relation, select, json, file, autodate).")
    add_line("- Si el campo es Obligatorio (REQ: SI / NO).")
    add_line("- Opciones de enums/selects o tabla relacionada en campos de tipo 'relation'.")
    add_line()

    total_cols = len(collections_map)
    processed_cols = set()

    for mod in modules:
        add_line("--------------------------------------------------------------------------------")
        add_line(f"MÓDULO: {mod['title']}")
        add_line(f"Descripción: {mod['description']}")
        add_line("--------------------------------------------------------------------------------")
        add_line()

        for tname in mod['tables']:
            if tname not in collections_map:
                continue
            processed_cols.add(tname)
            tdata = collections_map[tname]
            ctype = tdata['type']
            fields = tdata['fields']

            add_line(f"==================================================")
            add_line(f"TABLA / COLECCIÓN: {tname} (Tipo: {ctype})")
            add_line(f"Total Campos: {len(fields)}")
            add_line(f"==================================================")

            for f in fields:
                fname = f.get('name')
                ftype = f.get('type')
                freq = "SI" if f.get('required') else "NO"
                fdetail = []

                # Handle relations
                if ftype == 'relation':
                    col_id = f.get('collectionId')
                    # Find target collection name if possible
                    target_name = col_id
                    for c_k, c_v in collections_map.items():
                        # match either internal pb id or name
                        if col_id in [c_k, f.get('options', {}).get('collectionId')]:
                            target_name = c_k
                            break
                    # check if multiple
                    is_multiple = f.get('options', {}).get('maxSelect', 1) != 1
                    mult_str = "Múltiple (Array)" if is_multiple else "Uno (1:1 / N:1)"
                    cascade = " | CascadeDelete" if f.get('options', {}).get('cascadeDelete') else ""
                    fdetail.append(f"Relación -> {target_name} ({mult_str}{cascade})")

                # Handle select / enums
                elif ftype == 'select':
                    values = f.get('options', {}).get('values', [])
                    max_select = f.get('options', {}).get('maxSelect', 1)
                    mult_str = " [Múltiple]" if max_select != 1 else ""
                    fdetail.append(f"Valores: {json.dumps(values)}{mult_str}")

                # Handle files
                elif ftype == 'file':
                    mime = f.get('options', {}).get('mimeTypes', [])
                    max_files = f.get('options', {}).get('maxSelect', 1)
                    fdetail.append(f"Archivo(s): max {max_files} {mime}")

                # Handle autodates
                elif ftype == 'autodate':
                    fdetail.append("Timestamp automático del sistema")

                # Handle json
                elif ftype == 'json':
                    fdetail.append("Objeto o Array JSON estructurado")

                detail_str = f" | {'; '.join(fdetail)}" if fdetail else ""
                add_line(f"  * {fname.ljust(25)} : {ftype.ljust(10)} [REQ: {freq.ljust(2)}]{detail_str}")

            add_line()

    # Any remaining collections not explicitly categorized in modules
    remaining = [c for c in collections_map.keys() if c not in processed_cols]
    if remaining:
        add_line("--------------------------------------------------------------------------------")
        add_line("OTRAS COLECCIONES EN EL SISTEMA")
        add_line("--------------------------------------------------------------------------------")
        add_line()
        for tname in sorted(remaining):
            tdata = collections_map[tname]
            ctype = tdata['type']
            fields = tdata['fields']
            add_line(f"==================================================")
            add_line(f"TABLA / COLECCIÓN: {tname} (Tipo: {ctype})")
            add_line(f"Total Campos: {len(fields)}")
            add_line(f"==================================================")
            for f in fields:
                fname = f.get('name')
                ftype = f.get('type')
                freq = "SI" if f.get('required') else "NO"
                add_line(f"  * {fname.ljust(25)} : {ftype.ljust(10)} [REQ: {freq.ljust(2)}]")
            add_line()

    # SECTION 8: CODE TEMPLATES
    add_line("================================================================================")
    add_line("8. PLANTILLAS DE CÓDIGO LISTAS PARA USAR (FLUTTER / REACT NATIVE)")
    add_line("================================================================================")
    add_line()
    add_line("--- A) IMPLEMENTACIÓN EN FLUTTER / DART ---")
    add_line("Dependencias en pubspec.yaml:")
    add_line("  pocketbase: ^0.19.0")
    add_line("  flutter_secure_storage: ^9.0.0")
    add_line()
    add_line("Código de Servicio PocketBase (pocketbase_service.dart):")
    add_line("```dart")
    add_line("import 'package:pocketbase/pocketbase.dart';")
    add_line("import 'package:flutter_secure_storage/flutter_secure_storage.dart';")
    add_line()
    add_line("class PocketBaseService {")
    add_line("  static final PocketBaseService _instance = PocketBaseService._internal();")
    add_line("  factory PocketBaseService() => _instance;")
    add_line("  PocketBaseService._internal();")
    add_line()
    add_line("  late PocketBase pb;")
    add_line("  final _storage = const FlutterSecureStorage();")
    add_line()
    add_line("  Future<void> init(String baseUrl) async {")
    add_line("    pb = PocketBase(baseUrl);")
    add_line("    // Cargar token previo si existe")
    add_line("    final savedToken = await _storage.read(key: 'pb_auth_token');")
    add_line("    if (savedToken != null) {")
    add_line("      pb.authStore.save(savedToken, null);")
    add_line("      try {")
    add_line("        await pb.collection('users').authRefresh();")
    add_line("      } catch (_) {")
    add_line("        pb.authStore.clear();")
    add_line("        await _storage.delete(key: 'pb_auth_token');")
    add_line("      }")
    add_line("    }")
    add_line("  }")
    add_line()
    add_line("  Future<RecordModel> login(String identity, String password) async {")
    add_line("    final authData = await pb.collection('users').authWithPassword(identity, password);")
    add_line("    await _storage.write(key: 'pb_auth_token', value: pb.authStore.token);")
    add_line("    return authData.record!;")
    add_line("  }")
    add_line()
    add_line("  Future<RecordModel> createSalesOrder({")
    add_line("    required String customerId,")
    add_line("    required String warehouseId,")
    add_line("    required List<Map<String, dynamic>> items,")
    add_line("  }) async {")
    add_line("    final sellerId = pb.authStore.model.id;")
    add_line("    double subtotal = 0;")
    add_line("    double iva = 0;")
    add_line("    for (var it in items) {")
    add_line("      subtotal += (it['qty'] * it['unit_price']);")
    add_line("      iva += (it['qty'] * it['unit_price'] * (it['iva_rate'] ?? 0) / 100);")
    add_line("    }")
    add_line("    final order = await pb.collection('sales_orders').create(body: {")
    add_line("      'number': 'PED-${DateTime.now().millisecondsSinceEpoch}',")
    add_line("      'customer_id': customerId,")
    add_line("      'seller_id': sellerId,")
    add_line("      'user_id': sellerId,")
    add_line("      'warehouse_id': warehouseId,")
    add_line("      'date': DateTime.now().toIso8601String().substring(0, 10),")
    add_line("      'subtotal': subtotal,")
    add_line("      'iva_total': iva,")
    add_line("      'total': subtotal + iva,")
    add_line("      'status': 'pending',")
    add_line("      'fulfillment_status': 'SIN_GESTION',")
    add_line("    });")
    add_line()
    add_line("    for (int i = 0; i < items.length; i++) {")
    add_line("      final it = items[i];")
    add_line("      final lineSubtotal = it['qty'] * it['unit_price'];")
    add_line("      final lineIva = lineSubtotal * (it['iva_rate'] ?? 0) / 100;")
    add_line("      await pb.collection('sales_order_lines').create(body: {")
    add_line("        'sales_order_id': order.id,")
    add_line("        'product_id': it['product_id'],")
    add_line("        'line_order': i + 1,")
    add_line("        'qty': it['qty'],")
    add_line("        'unit_price': it['unit_price'],")
    add_line("        'iva_rate': it['iva_rate'],")
    add_line("        'iva_amount': lineIva,")
    add_line("        'subtotal': lineSubtotal,")
    add_line("        'total': lineSubtotal + lineIva,")
    add_line("      });")
    add_line("    }")
    add_line("    return order;")
    add_line("  }")
    add_line("}")
    add_line("```")
    add_line()
    add_line("--- B) IMPLEMENTACIÓN EN REACT NATIVE / TYPESCRIPT ---")
    add_line("Dependencias:")
    add_line("  npm install pocketbase expo-secure-store")
    add_line()
    add_line("Código de Servicio (pocketbase.ts):")
    add_line("```typescript")
    add_line("import PocketBase, { AsyncAuthStore } from 'pocketbase';")
    add_line("import * as SecureStore from 'expo-secure-store';")
    add_line()
    add_line("const store = new AsyncAuthStore({")
    add_line("  save: async (serialized) => SecureStore.setItemAsync('pb_auth', serialized),")
    add_line("  initial: SecureStore.getItem('pb_auth') || '',")
    add_line("  clear: async () => SecureStore.deleteItemAsync('pb_auth'),")
    add_line("});")
    add_line()
    add_line("export const pb = new PocketBase('https://app.gravy-ms.com', store);")
    add_line()
    add_line("export async function loginMobile(email: string, pass: string) {")
    add_line("  const authData = await pb.collection('users').authWithPassword(email, pass);")
    add_line("  return authData.record;")
    add_line("}")
    add_line()
    add_line("export async function sendGpsPing(lat: number, lng: number, battery: number) {")
    add_line("  const userId = pb.authStore.model?.id;")
    add_line("  if (!userId) return;")
    add_line("  const records = await pb.collection('seller_live_locations').getList(1, 1, {")
    add_line("    filter: `user_id = '${userId}'`")
    add_line("  });")
    add_line("  if (records.items.length > 0) {")
    add_line("    await pb.collection('seller_live_locations').update(records.items[0].id, {")
    add_line("      lat,")
    add_line("      lng,")
    add_line("      battery_level: battery,")
    add_line("      last_ping: new Date().toISOString(),")
    add_line("    });")
    add_line("  }")
    add_line("}")
    add_line("```")
    add_line()
    add_line("================================================================================")
    add_line("FIN DEL DOCUMENTO DE ARQUITECTURA DE BASE DE DATOS PARA APLICACIONES MÓVILES")
    add_line("================================================================================")

    # Write files
    txt_content = "\n".join(txt)
    md_content = "\n".join(md)

    txt_filename = os.path.join(os.getcwd(), "ARQUITECTURA_BASE_DATOS_MOVIL.txt")
    md_filename = os.path.join(os.getcwd(), "ARQUITECTURA_BASE_DATOS_MOVIL.md")

    with open(txt_filename, "w", encoding="utf-8") as f:
        f.write(txt_content)

    with open(md_filename, "w", encoding="utf-8") as f:
        f.write(md_content)

    print(f"Exportación exitosa:")
    print(f"1. Archivo Texto Plano: {txt_filename} ({len(txt_content)} caracteres, {len(txt)} líneas)")
    print(f"2. Archivo Markdown:    {md_filename} ({len(md_content)} caracteres, {len(md)} líneas)")

if __name__ == '__main__':
    build_mobile_documentation()
