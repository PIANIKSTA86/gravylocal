================================================================================
   ARQUITECTURA DE BASE DE DATOS Y GUÍA DE INTEGRACIÓN MÓVIL - GRAVY v2.0
   Motor de Base de Datos: PocketBase v0.22+ (SQLite WAL Mode)
================================================================================

Este documento está diseñado específicamente para desarrolladores de aplicaciones móviles
(Flutter, React Native, Kotlin, Swift, Expo, PWA) y agentes de IA. Contiene las especificaciones
técnicas de conexión, protocolos de autenticación, reglas de almacenamiento de datos,
estrategia offline-first y el diccionario completo de las 106 colecciones de la base de datos.

--------------------------------------------------------------------------------
TABLA DE CONTENIDO
--------------------------------------------------------------------------------
1. INFRAESTRUCTURA DE CONEXIÓN Y SERVIDORES
2. PROTOCOLO DE AUTENTICACIÓN Y SEGURIDAD MÓVIL
3. ARQUITECTURA DE COMUNICACIÓN REST Y REALTIME (SSE)
4. CÓMO ALMACENAR DATOS: CONVENCIONES, RELACIONES Y PAYLOADS
5. ESTRATEGIA DE SINCRONIZACIÓN OFFLINE-FIRST EN DISPOSITIVOS MÓVILES
6. FLUJOS OPERATIVOS CLAVE EN RUTA (CASOS DE USO MÓVIL)
7. DICCIONARIO COMPLETO DE COLECCIONES Y ESQUEMA DE CAMPOS
8. PLANTILLAS DE CÓDIGO LISTAS PARA USAR (FLUTTER / REACT NATIVE)
--------------------------------------------------------------------------------

================================================================================
1. INFRAESTRUCTURA DE CONEXIÓN Y SERVIDORES
================================================================================
GRAVY opera con una arquitectura híbrida accesible tanto en red local como por internet:

A) CONEXIÓN EN RED LOCAL (LAN / Wi-Fi):
   - URL Base: http://<IP_LOCAL_DEL_SERVIDOR>:8090
   - Ejemplo: http://192.168.1.150:8090
   - Uso: Dispositivos en el mismo almacén, tienda o red Wi-Fi de la empresa.
   - Latencia: Ultra baja (<5 ms).

B) CONEXIÓN REMOTA / INTERNET (WAN / 4G / 5G vía Cloudflare Tunnel):
   - URL Base: https://<subdominio>.gravy-ms.com (o dominio de cliente configurado)
   - Ejemplo: https://app.gravy-ms.com
   - Protocolo: HTTPS / TLS 1.3 con cifrado de extremo a extremo sin abrir puertos.
   - Uso: Vendedores en calle, supervisores, choferes y clientes remotos.

REGLA PARA LA APP MÓVIL:
Configurar una pantalla de 'Ajustes de Servidor' o 'Selector de Empresa' donde el usuario
pueda definir la URL base (LAN o Cloud) o detectar automáticamente la red disponible.

================================================================================
2. PROTOCOLO DE AUTENTICACIÓN Y SEGURIDAD MÓVIL
================================================================================
El backend maneja autenticación JWT a través de la colección 'users'.

A) LOGIN CON CREDENCIALES (Email / Username + Password):
   - Método: POST
   - Endpoint: /api/collections/users/auth-with-password
   - Headers: Content-Type: application/json
   - Body JSON:
     {
       "identity": "vendedor@empresa.com",
       "password": "Password123*"
     }

   - Respuesta Exitosa (HTTP 200 OK):
     {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
       "record": {
         "id": "u1a2b3c4d5e6f7g",
         "email": "vendedor@empresa.com",
         "name": "Juan Pérez",
         "full_name": "Juan Carlos Pérez",
         "role": ["vendedor"],
         "default_branch_id": "b1a2b3c4d5e6f7g",
         "allowed_branches": ["b1a2b3c4d5e6f7g"],
         "default_warehouse_id": "w1a2b3c4d5e6f7g",
         "allowed_warehouses": ["w1a2b3c4d5e6f7g"],
         "active": true
       }
     }

B) ALMACENAMIENTO SEGURO DEL TOKEN EN EL DISPOSITIVO MÓVIL:
   - Flutter: Usar 'flutter_secure_storage'.
   - React Native: Usar 'expo-secure-store' o 'react-native-keychain'.
   - NUNCA guardar el token en AsyncStorage o SharedPreferences sin cifrar.

C) ENCABEZADO REQUERIDO EN TODAS LAS PETICIONES SUBSECUENTES:
   Authorization: Bearer <token>

D) RENOVACIÓN DE SESIÓN (AUTH REFRESH):
   - Método: POST
   - Endpoint: /api/collections/users/auth-refresh
   - Headers: Authorization: Bearer <token>
   - Permite verificar si la sesión sigue activa y renovar el JWT al iniciar la app.

================================================================================
3. ARQUITECTURA DE COMUNICACIÓN REST Y REALTIME (SSE)
================================================================================
PocketBase expone una API REST uniforme para todas las colecciones:

A) ENDPOINTS REST UNIVERSALES:
   - Listar Registros con paginación, filtros y orden:
     GET /api/collections/{collection}/records?page=1&perPage=50&filter=(...)&sort=-created&expand=(...)
   - Obtener un Registro por ID:
     GET /api/collections/{collection}/records/{id}
   - Crear un Registro:
     POST /api/collections/{collection}/records
   - Actualizar un Registro (parcial):
     PATCH /api/collections/{collection}/records/{id}
   - Eliminar un Registro:
     DELETE /api/collections/{collection}/records/{id}
   - Peticiones en Lote (Batch Transaccional):
     POST /api/batch

B) PARÁMETROS CRÍTICOS PARA LA APP MÓVIL:
   - expand: Permite traer relaciones hijas o padres en una sola petición HTTP.
     Ejemplo en Pedidos: ?expand=customer_id,seller_id
     Ejemplo en Líneas de Pedido: ?expand=product_id
   - filter: Sintaxis de filtrado PocketBase.
     Ejemplo clientes activos: ?filter=(active=true)
     Ejemplo productos con stock: ?filter=(active=true && base_price > 0)
     Ejemplo búsqueda por texto: ?filter=(name ~ 'arroz' || code ~ 'arroz')
     Ejemplo pedidos de hoy: ?filter=(date >= '2026-09-16 00:00:00')
   - sort: Campo de ordenamiento (prefijo '-' para descendente).
     Ejemplo: ?sort=-created,-date

C) SERVICIO DE ARCHIVOS E IMÁGENES (PRODUCTOS, RUT, FOTOS DE VISITAS):
   - URL Estándar: /api/files/{collection_id_or_name}/{record_id}/{filename}
   - Generación de Miniaturas (Thumbnails optimizados para móviles):
     /api/files/{collection}/{recordId}/{filename}?thumb=100x100  (para listados rápidos)
     /api/files/{collection}/{recordId}/{filename}?thumb=300x300  (para detalle de producto)

D) SUSCRIPCIONES EN TIEMPO REAL (SERVER-SENT EVENTS - SSE):
   - Protocolo: Conexión persistente en /api/realtime.
   - La app móvil puede escuchar cambios en tiempo real sin hacer polling:
     pb.collection('sales_orders').subscribe('*', (e) => { ... });
     pb.collection('inventory_stock').subscribe('*', (e) => { ... });

================================================================================
4. CÓMO ALMACENAR DATOS: CONVENCIONES, RELACIONES Y PAYLOADS
================================================================================
Reglas mandatorias para almacenar y estructurar información correctamente:

A) ESTRUCTURA DE LOS IDENTIFICADORES (ID):
   - Todos los registros en PocketBase tienen una columna 'id' que consiste en
     una cadena de exactamente 15 caracteres alfanuméricos en minúsculas (ej: 'k1p8q9w2m4x7z0v').
   - Si no se envía 'id', PocketBase lo genera automáticamente.
   - La app móvil puede pre-generar IDs de 15 caracteres antes de sincronizar,
     o mapear un ID local temporal al ID que devuelva el servidor.

B) MANEJO DE RELACIONES FORÁNEAS (RELATION FIELDS):
   - Relación Simple (1:1 o N:1):
     Se envía un string con el ID de 15 caracteres del registro padre.
     Ejemplo: "customer_id": "9x4k2m8p7q1v0z3"
   - Relación Múltiple (Array):
     Se envía un array de strings.
     Ejemplo: "allowed_branches": ["b1a2b3c4d5e6f7g", "b9x8w7v6u5t4s3r"]

C) PATRÓN DE GUARDADO CABECERA-DETALLE (MASTER-DETAIL):
   La mayoría de transacciones comerciales en GRAVY (Pedidos, Facturas, Movimientos de Inventario)
   se dividen en dos tablas: Cabecera y Líneas de Detalle.

   Paso 1: Guardar la Cabecera.
   POST /api/collections/sales_orders/records
   Payload: { "number": "PED-001", "customer_id": "...", "date": "2026-09-16", ... }
   El servidor responde con el nuevo registro, incluyendo su 'id'.

   Paso 2: Guardar las Líneas vinculadas con el id de la cabecera.
   POST /api/collections/sales_order_lines/records
   Payload: { "sales_order_id": "<id_retornado_en_paso_1>", "product_id": "...", "qty": 5, ... }

   Alternativa Atómica (Recomendada con conexión activa):
   Usar el endpoint POST /api/batch para enviar la cabecera y todas las líneas
   en una única transacción atómica de base de datos.

================================================================================
5. ESTRATEGIA DE SINCRONIZACIÓN OFFLINE-FIRST EN DISPOSITIVOS MÓVILES
================================================================================
En el contexto de vendedores en ruta y transportistas, la app móvil DEBE funcionar
sin internet (modo desconectado en carreteras o bodegas sin señal).

A) ARQUITECTURA DE BASE DE DATOS LOCAL EN EL DISPOSITIVO:
   - Utilizar SQLite local (Drift/Moor en Flutter, WatermelonDB / Expo SQLite en React Native).
   - Replicar localmente las tablas maestras de lectura rápida:
     1. 'products' y 'inventory_stock' (para consultar catálogo y stock offline).
     2. 'third_parties' (para seleccionar clientes y consultar cupo de crédito).
     3. 'listas_precios' y 'precios_producto'.
     4. 'vendor_visits' (ruta de visitas del día).

B) TABLA DE COLA DE SINCRONIZACIÓN LOCAL (PENDING SYNC QUEUE):
   Crear en la base de datos local del móvil una tabla especial:
   CREATE TABLE sync_queue (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     collection_name TEXT NOT NULL,
     operation TEXT NOT NULL,      -- 'CREATE', 'UPDATE', 'DELETE'
     temp_local_id TEXT NOT NULL,
     payload_json TEXT NOT NULL,
     created_at TEXT NOT NULL,
     status TEXT DEFAULT 'PENDING',-- 'PENDING', 'SYNCING', 'FAILED', 'DONE'
     retry_count INTEGER DEFAULT 0,
     error_message TEXT
   );

C) FLUJO DE SINCRONIZACIÓN EN 2 FASES:
   FASE 1: DESCARGA (PULL - Servidor -> Móvil):
   - Guardar localmente el timestamp de la última sincronización: last_sync_timestamp.
   - Al tener internet, consultar únicamente registros creados o modificados después:
     GET /api/collections/products/records?filter=(updated > '2026-09-15 18:00:00')
   - Aplicar cambios en el SQLite local.

   FASE 2: SUBIDA (PUSH - Móvil -> Servidor):
   - Tomar registros pendientes de 'sync_queue' en orden FIFO (por fecha de creación).
   - Si se creó un pedido offline con ID temporal:
     1. Enviar la cabecera a /api/collections/sales_orders/records.
     2. Obtener el 'id' oficial del servidor.
     3. Actualizar en la cola local las líneas pendientes reemplazando 'temp_id' por el nuevo 'id'.
     4. Enviar las líneas a /api/collections/sales_order_lines/records.
     5. Marcar los registros de la cola como 'DONE'.

================================================================================
6. FLUJOS OPERATIVOS CLAVE EN RUTA (CASOS DE USO MÓVIL)
================================================================================

--- FLUJO A: VISITA A CLIENTE CON CHECK-IN GEORREFERENCIADO ---
Colección: 'vendor_visits'
1. Al llegar al cliente, la app obtiene coordenadas GPS del dispositivo (lat, lng).
2. Registra el Check-in:
   POST /api/collections/vendor_visits/records
   {
     "seller_id": "usr_vendedor123",
     "client_id": "cli_tercero456",
     "visit_date": "2026-09-16",
     "status": "EN_PROCESO",
     "objective": "VENTA",
     "checkin_time": "2026-09-16 09:30:15",
     "geo_lat": 4.60971,
     "geo_lng": -74.08175,
     "notes": "Inicio de gestión comercial"
   }
3. Al terminar la visita, registra el Check-out:
   PATCH /api/collections/vendor_visits/records/{visit_id}
   {
     "status": "EFECTIVA",
     "checkout_time": "2026-09-16 09:55:00",
     "sales_order_id": "ped_9988776655"
   }

--- FLUJO B: TELEMETRÍA EN VIVO DEL VENDEDOR (TRACKING GPS) ---
Colección: 'seller_live_locations' (actualización continua en segundo plano)
1. Cada 30-60 segundos, la app reporta su posición:
   PATCH /api/collections/seller_live_locations/records/{seller_location_id}
   {
     "lat": 4.61025,
     "lng": -74.08210,
     "speed": 18.5,
     "battery_level": 82,
     "is_charging": false,
     "status": "EN_RUTA",
     "last_ping": "2026-09-16 09:35:00"
   }

--- FLUJO C: TOMA DE PEDIDO EN CALLE (PREVENTA / SALES ORDER) ---
Colecciones: 'sales_orders' (Cabecera) y 'sales_order_lines' (Detalle)
1. Enviar Cabecera:
   POST /api/collections/sales_orders/records
   {
     "number": "PED-MOV-0042",
     "customer_id": "cli_tercero456",
     "seller_id": "usr_vendedor123",
     "user_id": "usr_vendedor123",
     "warehouse_id": "bod_principal01",
     "branch_id": "sed_bogota001",
     "date": "2026-09-16",
     "due_date": "2026-09-30",
     "subtotal": 150000,
     "iva_total": 28500,
     "discount_amount": 0,
     "total": 178500,
     "status": "pending",
     "fulfillment_status": "SIN_GESTION",
     "notes": "Entregar en jornada de la mañana"
   }
2. Con el ID retornado (ej: 'ord_abc123xyz789'), enviar cada línea de producto:
   POST /api/collections/sales_order_lines/records
   {
     "sales_order_id": "ord_abc123xyz789",
     "product_id": "prd_cafe100gr45",
     "line_order": 1,
     "description": "Café Especial 500g",
     "qty": 10,
     "unit_price": 15000,
     "iva_rate": 19,
     "iva_amount": 28500,
     "subtotal": 150000,
     "total": 178500
   }

--- FLUJO D: RECAUDO / PAGO EN RUTA (COBRANZA CXC) ---
Colección: 'payments'
1. El vendedor recibe dinero en efectivo o transferencia por una factura existente:
   POST /api/collections/payments/records
   {
     "invoice_id": "fac_fac00123456",
     "amount": 178500,
     "payment_method": "EFECTIVO",
     "date": "2026-09-16 10:15:00"
   }

--- FLUJO E: CREACIÓN DE NUEVO CLIENTE EN RUTA (PROSPECCIÓN / CRM) ---
Colección: 'third_parties'
1. El vendedor registra un nuevo punto de venta en campo:
   POST /api/collections/third_parties/records
   {
     "type": ["CLIENTE"],
     "doc_type": ["CC"],
     "doc_number": "1020304050",
     "name": "Tienda La Esperanza",
     "first_name": "Pedro",
     "last_name": "Gómez",
     "commercial_name": "Tienda La Esperanza",
     "phone": "3109876543",
     "email": "pedro.gomez@gmail.com",
     "address": "Calle 45 # 12-34",
     "city": "Bogotá",
     "department": "Cundinamarca",
     "tax_regime": ["NO_RESP"],
     "credit_limit": 500000,
     "payment_days": 15,
     "active": true
   }

================================================================================
7. DICCIONARIO COMPLETO DE COLECCIONES Y ESQUEMA DE CAMPOS
================================================================================
A continuación se detallan todas las colecciones agrupadas por módulo, especificando:
- Nombre de tabla y tipo.
- Lista exhaustiva de campos.
- Tipo de dato PocketBase (text, number, bool, email, relation, select, json, file, autodate).
- Si el campo es Obligatorio (REQ: SI / NO).
- Opciones de enums/selects o tabla relacionada en campos de tipo 'relation'.

--------------------------------------------------------------------------------
MÓDULO: 1. AUTENTICACIÓN, USUARIOS Y CONFIGURACIÓN BASE
Descripción: Colecciones esenciales para el inicio de sesión del usuario móvil, permisos de sedes/bodegas y parámetros generales.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: users (Tipo: auth)
Total Campos: 24
==================================================
  * id                        : text       [REQ: SI]
  * password                  : password   [REQ: SI]
  * tokenKey                  : text       [REQ: SI]
  * email                     : email      [REQ: SI]
  * emailVisibility           : bool       [REQ: NO]
  * verified                  : bool       [REQ: NO]
  * name                      : text       [REQ: NO]
  * avatar                    : file       [REQ: NO] | Archivo(s): max 1 []
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * role                      : select     [REQ: SI] | Valores: []
  * full_name                 : text       [REQ: SI]
  * active                    : bool       [REQ: NO]
  * owner_id                  : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * default_branch_id         : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * allowed_branches          : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * topbar_color              : text       [REQ: NO]
  * can_edit_docs             : bool       [REQ: NO]
  * default_warehouse_id      : relation   [REQ: NO] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * allowed_warehouses        : relation   [REQ: NO] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * active_session_id         : text       [REQ: NO]
  * last_login_ip             : text       [REQ: NO]
  * last_login_at             : text       [REQ: NO]
  * last_activity_at          : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: branches (Tipo: base)
Total Campos: 4
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * active                    : bool       [REQ: NO]

==================================================
TABLA / COLECCIÓN: cost_centers (Tipo: base)
Total Campos: 6
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * description               : text       [REQ: NO]
  * parent_id                 : relation   [REQ: NO] | Relación -> pbc_cost_centers (Uno (1:1 / N:1))
  * active                    : bool       [REQ: NO]

==================================================
TABLA / COLECCIÓN: settings (Tipo: base)
Total Campos: 3
==================================================
  * id                        : text       [REQ: SI]
  * key                       : text       [REQ: SI]
  * value                     : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: licenses (Tipo: base)
Total Campos: 6
==================================================
  * id                        : text       [REQ: SI]
  * module_key                : select     [REQ: SI] | Valores: []
  * enabled                   : bool       [REQ: NO]
  * expires_at                : text       [REQ: NO]
  * plan                      : select     [REQ: NO] | Valores: []
  * notes                     : text       [REQ: NO]

--------------------------------------------------------------------------------
MÓDULO: 2. TERCEROS, CLIENTES Y CRM MÓVIL
Descripción: Gestión de clientes, contactos, sucursales del cliente, listas de precios asignadas y seguimiento comercial.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: third_parties (Tipo: base)
Total Campos: 49
==================================================
  * id                        : text       [REQ: SI]
  * type                      : select     [REQ: SI] | Valores: []
  * doc_type                  : select     [REQ: SI] | Valores: []
  * doc_number                : text       [REQ: SI]
  * dv                        : text       [REQ: NO]
  * name                      : text       [REQ: SI]
  * commercial_name           : text       [REQ: NO]
  * email                     : email      [REQ: NO]
  * phone                     : text       [REQ: NO]
  * address                   : text       [REQ: NO]
  * city                      : text       [REQ: NO]
  * department                : text       [REQ: NO]
  * country                   : text       [REQ: NO]
  * tax_regime                : select     [REQ: NO] | Valores: []
  * is_retention_agent        : bool       [REQ: NO]
  * bank_name                 : text       [REQ: NO]
  * bank_account              : text       [REQ: NO]
  * contact_name              : text       [REQ: NO]
  * contact_phone             : text       [REQ: NO]
  * notes                     : text       [REQ: NO]
  * active                    : bool       [REQ: NO]
  * person_type               : text       [REQ: NO]
  * first_name                : text       [REQ: NO]
  * last_name                 : text       [REQ: NO]
  * business_name             : text       [REQ: NO]
  * city_code                 : text       [REQ: NO]
  * dept_code                 : text       [REQ: NO]
  * advisor                   : text       [REQ: NO]
  * phone2                    : text       [REQ: NO]
  * email2                    : email      [REQ: NO]
  * credit_limit              : number     [REQ: NO]
  * max_invoices              : number     [REQ: NO]
  * payment_days              : number     [REQ: NO]
  * ciiu                      : text       [REQ: NO]
  * tfe                       : text       [REQ: NO]
  * tfc                       : text       [REQ: NO]
  * rf                        : text       [REQ: NO]
  * prf                       : number     [REQ: NO]
  * pi                        : number     [REQ: NO]
  * piv                       : number     [REQ: NO]
  * gc                        : bool       [REQ: NO]
  * ar                        : bool       [REQ: NO]
  * ei                        : bool       [REQ: NO]
  * resp                      : json       [REQ: NO] | Objeto o Array JSON estructurado
  * gcm                       : bool       [REQ: NO]
  * rut_pdf                   : file       [REQ: NO] | Archivo(s): max 1 []
  * geo_lat                   : number     [REQ: NO]
  * geo_lng                   : number     [REQ: NO]
  * geo_radius                : number     [REQ: NO]

==================================================
TABLA / COLECCIÓN: third_party_branches (Tipo: base)
Total Campos: 20
==================================================
  * id                        : text       [REQ: SI]
  * third_party_id            : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * is_main                   : bool       [REQ: NO]
  * country                   : text       [REQ: NO]
  * department                : text       [REQ: NO]
  * dept_code                 : text       [REQ: NO]
  * city                      : text       [REQ: NO]
  * city_code                 : text       [REQ: NO]
  * address                   : text       [REQ: NO]
  * phone                     : text       [REQ: NO]
  * phone2                    : text       [REQ: NO]
  * email                     : email      [REQ: NO]
  * contact_name              : text       [REQ: NO]
  * advisor                   : text       [REQ: NO]
  * advisor_name              : text       [REQ: NO]
  * pi                        : number     [REQ: NO]
  * notes                     : text       [REQ: NO]
  * active                    : bool       [REQ: NO]

==================================================
TABLA / COLECCIÓN: clientes (Tipo: base)
Total Campos: 6
==================================================
  * id                        : text       [REQ: SI]
  * nombre                    : text       [REQ: SI]
  * documento                 : text       [REQ: SI]
  * limite_credito            : number     [REQ: NO]
  * saldo_actual              : number     [REQ: NO]
  * lista_precio_defecto      : relation   [REQ: NO] | Relación -> pbc_26262227 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: crm_deals (Tipo: base)
Total Campos: 14
==================================================
  * id                        : text       [REQ: SI]
  * title                     : text       [REQ: SI]
  * client_id                 : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * value                     : number     [REQ: SI]
  * stage                     : select     [REQ: SI] | Valores: []
  * expected_close            : text       [REQ: NO]
  * notes                     : text       [REQ: NO]
  * active                    : bool       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * user_id                   : relation   [REQ: NO] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * seller_id                 : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * sales_order_id            : relation   [REQ: NO] | Relación -> pbc_2420370400 (Uno (1:1 / N:1))
  * invoice_id                : relation   [REQ: NO] | Relación -> pbc_711030668 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: crm_interactions (Tipo: base)
Total Campos: 9
==================================================
  * id                        : text       [REQ: SI]
  * deal_id                   : relation   [REQ: SI] | Relación -> pbc_924532027 (Uno (1:1 / N:1))
  * user_id                   : relation   [REQ: SI] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * type                      : select     [REQ: SI] | Valores: []
  * request_details           : text       [REQ: SI]
  * response_details          : text       [REQ: NO]
  * response_at               : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

--------------------------------------------------------------------------------
MÓDULO: 3. FUERZA DE VENTAS EN CAMPO, VISITAS Y GEOLOCALIZACIÓN GPS
Descripción: Módulo clave para aplicaciones de preventa y vendedores en calle: visitas a clientes, check-in, tracking GPS y telemetría de batería.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: vendor_visits (Tipo: base)
Total Campos: 16
==================================================
  * id                        : text       [REQ: SI]
  * seller_id                 : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * client_id                 : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * visit_date                : text       [REQ: SI]
  * order_seq                 : number     [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * objective                 : select     [REQ: NO] | Valores: []
  * checkin_time              : text       [REQ: NO]
  * checkout_time             : text       [REQ: NO]
  * geo_lat                   : number     [REQ: NO]
  * geo_lng                   : number     [REQ: NO]
  * sales_order_id            : relation   [REQ: NO] | Relación -> pbc_2420370400 (Uno (1:1 / N:1))
  * no_order_reason           : select     [REQ: NO] | Valores: []
  * notes                     : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: seller_live_locations (Tipo: base)
Total Campos: 16
==================================================
  * id                        : text       [REQ: SI]
  * seller_id                 : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * user_id                   : relation   [REQ: NO] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * seller_name               : text       [REQ: NO]
  * lat                       : number     [REQ: SI]
  * lng                       : number     [REQ: SI]
  * accuracy                  : number     [REQ: NO]
  * speed                     : number     [REQ: NO]
  * heading                   : number     [REQ: NO]
  * battery_level             : number     [REQ: NO]
  * is_charging               : bool       [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * current_visit_id          : relation   [REQ: NO] | Relación -> pbc_3686138633 (Uno (1:1 / N:1))
  * last_ping                 : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: seller_tracking_logs (Tipo: base)
Total Campos: 9
==================================================
  * id                        : text       [REQ: SI]
  * seller_id                 : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * visit_date                : text       [REQ: SI]
  * lat                       : number     [REQ: SI]
  * lng                       : number     [REQ: SI]
  * speed                     : number     [REQ: NO]
  * status                    : text       [REQ: NO]
  * timestamp                 : text       [REQ: SI]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema

--------------------------------------------------------------------------------
MÓDULO: 4. PRODUCTOS, CATÁLOGO, PRECIOS E INVENTARIO
Descripción: Catálogo de artículos, listas de precios, existencias por bodega, movimientos y control de lotes.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: products (Tipo: base)
Total Campos: 51
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * description               : text       [REQ: NO]
  * type                      : select     [REQ: SI] | Valores: []
  * unit                      : text       [REQ: SI]
  * unspsc_code               : text       [REQ: NO]
  * ean_code                  : text       [REQ: NO]
  * iva_rate                  : number     [REQ: NO]
  * income_account_id         : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * cost_account_id           : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * inventory_account_id      : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * base_price                : number     [REQ: NO]
  * cost_price                : number     [REQ: NO]
  * active                    : bool       [REQ: NO]
  * presentacion              : text       [REQ: NO]
  * categoria                 : text       [REQ: NO]
  * linea                     : text       [REQ: NO]
  * precio_venta_2            : number     [REQ: NO]
  * precio_venta_3            : number     [REQ: NO]
  * peso                      : number     [REQ: NO]
  * cajas_en_pallet           : number     [REQ: NO]
  * und_empaque               : number     [REQ: NO]
  * peso_x_und_empaque        : number     [REQ: NO]
  * is_combo                  : bool       [REQ: NO]
  * posicion_arancelaria      : text       [REQ: NO]
  * arancel_rate_default      : number     [REQ: NO]
  * pais_origen               : text       [REQ: NO]
  * marca                     : text       [REQ: NO]
  * modelo                    : text       [REQ: NO]
  * visto_bueno_required      : bool       [REQ: NO]
  * visto_bueno_entidad       : select     [REQ: NO] | Valores: []
  * registro_sanitario        : text       [REQ: NO]
  * peso_neto                 : number     [REQ: NO]
  * peso_bruto                : number     [REQ: NO]
  * stock_min                 : number     [REQ: NO]
  * stock_max                 : number     [REQ: NO]
  * manifest_pdf              : file       [REQ: NO] | Archivo(s): max 1 []
  * image                     : file       [REQ: NO] | Archivo(s): max 1 []
  * largo_cm                  : number     [REQ: NO]
  * ancho_cm                  : number     [REQ: NO]
  * alto_cm                   : number     [REQ: NO]
  * is_consigned              : bool       [REQ: NO]
  * consignment_supplier_id   : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * consignment_cost          : number     [REQ: NO]
  * auto_calc_price           : bool       [REQ: NO]
  * margin_factor             : number     [REQ: NO]
  * margin_type               : select     [REQ: NO] | Valores: []
  * rounding_type             : select     [REQ: NO] | Valores: []
  * track_lots                : bool       [REQ: NO]
  * track_pallets             : bool       [REQ: NO]

==================================================
TABLA / COLECCIÓN: product_components (Tipo: base)
Total Campos: 4
==================================================
  * id                        : text       [REQ: SI]
  * parent_id                 : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * component_id              : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * qty                       : number     [REQ: SI]

==================================================
TABLA / COLECCIÓN: listas_precios (Tipo: base)
Total Campos: 3
==================================================
  * id                        : text       [REQ: SI]
  * nombre                    : text       [REQ: SI]
  * activo                    : bool       [REQ: NO]

==================================================
TABLA / COLECCIÓN: precios_producto (Tipo: base)
Total Campos: 4
==================================================
  * id                        : text       [REQ: SI]
  * producto_id               : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * lista_precio_id           : relation   [REQ: SI] | Relación -> pbc_26262227 (Uno (1:1 / N:1))
  * precio                    : number     [REQ: SI]

==================================================
TABLA / COLECCIÓN: warehouses (Tipo: base)
Total Campos: 10
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * address                   : text       [REQ: NO]
  * notes                     : text       [REQ: NO]
  * active                    : bool       [REQ: NO]
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * is_consignment            : bool       [REQ: NO]
  * consignment_type          : select     [REQ: NO] | Valores: []
  * linked_third_party_id     : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: inventory_stock (Tipo: base)
Total Campos: 6
==================================================
  * id                        : text       [REQ: SI]
  * product_id                : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * warehouse_id              : relation   [REQ: SI] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * qty_on_hand               : number     [REQ: NO]
  * avg_cost                  : number     [REQ: NO]
  * last_mov_date             : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: inventory_movements (Tipo: base)
Total Campos: 12
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * mov_type                  : select     [REQ: SI] | Valores: []
  * date                      : text       [REQ: SI]
  * warehouse_id              : relation   [REQ: SI] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * dest_warehouse_id         : relation   [REQ: NO] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * third_party_id            : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * notes                     : text       [REQ: NO]
  * status                    : select     [REQ: NO] | Valores: []
  * tx_id                     : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * concept_id                : relation   [REQ: NO] | Relación -> pbc_inventory_concepts (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: inventory_movement_lines (Tipo: base)
Total Campos: 13
==================================================
  * id                        : text       [REQ: SI]
  * movement_id               : relation   [REQ: SI] | Relación -> pbc_4280990403 (Uno (1:1 / N:1))
  * product_id                : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * qty                       : number     [REQ: SI]
  * unit_cost                 : number     [REQ: NO]
  * notes                     : text       [REQ: NO]
  * line_order                : number     [REQ: NO]
  * original_unit_cost        : number     [REQ: NO]
  * lot_number                : text       [REQ: NO]
  * pallet_code               : text       [REQ: NO]
  * boxes_qty                 : number     [REQ: NO]
  * lot_id                    : relation   [REQ: NO] | Relación -> pbc_4230823287 (Uno (1:1 / N:1))
  * pallet_id                 : relation   [REQ: NO] | Relación -> pbc_2400528911 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: inventory_concepts (Tipo: base)
Total Campos: 7
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * type                      : select     [REQ: SI] | Valores: []
  * account_id                : relation   [REQ: SI] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * active                    : bool       [REQ: NO]
  * description               : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: inventory_lots (Tipo: base)
Total Campos: 15
==================================================
  * id                        : text       [REQ: SI]
  * product_id                : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * warehouse_id              : relation   [REQ: SI] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * lot_number                : text       [REQ: SI]
  * manufacturing_date        : text       [REQ: NO]
  * expiry_date               : text       [REQ: NO]
  * initial_qty               : number     [REQ: SI]
  * qty_on_hand               : number     [REQ: SI]
  * unit_cost                 : number     [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * notes                     : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * import_id                 : relation   [REQ: NO] | Relación -> pbc_3922105078 (Uno (1:1 / N:1))
  * supplier_id               : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: inventory_pallets (Tipo: base)
Total Campos: 18
==================================================
  * id                        : text       [REQ: SI]
  * pallet_code               : text       [REQ: SI]
  * warehouse_id              : relation   [REQ: SI] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * location_code             : text       [REQ: NO]
  * product_id                : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * boxes_initial             : number     [REQ: SI]
  * lot_id                    : relation   [REQ: NO] | Relación -> pbc_4230823287 (Uno (1:1 / N:1))
  * boxes_current             : number     [REQ: SI]
  * units_per_box             : number     [REQ: SI]
  * units_available           : number     [REQ: NO]
  * pallet_type               : select     [REQ: NO] | Valores: []
  * height_cm                 : number     [REQ: NO]
  * gross_weight_kg           : number     [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * notes                     : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * import_id                 : relation   [REQ: NO] | Relación -> pbc_3922105078 (Uno (1:1 / N:1))

--------------------------------------------------------------------------------
MÓDULO: 5. PEDIDOS, FACTURACIÓN Y PUNTO DE VENTA (POS MÓVIL)
Descripción: Creación y sincronización de pedidos de venta en calle (preventa), facturas POS, turnos de caja y resoluciones DIAN.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: sales_orders (Tipo: base)
Total Campos: 22
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * customer_id               : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * warehouse_id              : relation   [REQ: NO] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * date                      : text       [REQ: SI]
  * due_date                  : text       [REQ: NO]
  * notes                     : text       [REQ: NO]
  * subtotal                  : number     [REQ: NO]
  * iva_total                 : number     [REQ: NO]
  * discount_amount           : number     [REQ: NO]
  * total                     : number     [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * invoice_id                : relation   [REQ: NO] | Relación -> pbc_711030668 (Uno (1:1 / N:1))
  * user_id                   : relation   [REQ: SI] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * seller_id                 : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * has_pending_delivery      : bool       [REQ: NO]
  * fulfillment_status        : select     [REQ: NO] | Valores: []
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * third_party_branch_id     : relation   [REQ: NO] | Relación -> pbc_tp_branches (Uno (1:1 / N:1))
  * delivery_id               : relation   [REQ: NO] | Relación -> pbc_4251913776 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: sales_order_lines (Tipo: base)
Total Campos: 14
==================================================
  * id                        : text       [REQ: SI]
  * sales_order_id            : relation   [REQ: SI] | Relación -> pbc_2420370400 (Uno (1:1 / N:1))
  * line_order                : number     [REQ: NO]
  * product_id                : relation   [REQ: NO] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * account_id                : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * description               : text       [REQ: NO]
  * qty                       : number     [REQ: SI]
  * unit_price                : number     [REQ: SI]
  * iva_rate                  : number     [REQ: NO]
  * iva_amount                : number     [REQ: NO]
  * subtotal                  : number     [REQ: NO]
  * total                     : number     [REQ: NO]
  * import_id                 : relation   [REQ: NO] | Relación -> pbc_3922105078 (Uno (1:1 / N:1))
  * warehouse_id              : relation   [REQ: NO] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: sales_reservations (Tipo: base)
Total Campos: 9
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * customer_id               : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * sales_order_id            : relation   [REQ: NO] | Relación -> pbc_2420370400 (Uno (1:1 / N:1))
  * invoice_id                : relation   [REQ: NO] | Relación -> pbc_711030668 (Uno (1:1 / N:1))
  * status                    : select     [REQ: SI] | Valores: []
  * notes                     : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: sales_reservation_lines (Tipo: base)
Total Campos: 14
==================================================
  * id                        : text       [REQ: SI]
  * reservation_id            : relation   [REQ: SI] | Relación -> pbc_4130161515 (Uno (1:1 / N:1))
  * line_order                : number     [REQ: NO]
  * product_id                : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * import_id                 : relation   [REQ: NO] | Relación -> pbc_3922105078 (Uno (1:1 / N:1))
  * import_line_id            : relation   [REQ: NO] | Relación -> pbc_4123813726 (Uno (1:1 / N:1))
  * qty_reserved              : number     [REQ: SI]
  * qty_dispatched            : number     [REQ: NO]
  * qty_released              : number     [REQ: NO]
  * eta_snapshot              : text       [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * notes                     : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: invoices (Tipo: base)
Total Campos: 47
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * customer_id               : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * warehouse_id              : relation   [REQ: SI] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * date                      : text       [REQ: SI]
  * due_date                  : text       [REQ: NO]
  * notes                     : text       [REQ: NO]
  * subtotal                  : number     [REQ: NO]
  * iva_total                 : number     [REQ: NO]
  * ret_total                 : number     [REQ: NO]
  * total                     : number     [REQ: NO]
  * payable_total             : number     [REQ: NO]
  * payment_method            : select     [REQ: SI] | Valores: []
  * status                    : select     [REQ: SI] | Valores: []
  * tx_type_id                : relation   [REQ: NO] | Relación -> pbc_1708081505 (Uno (1:1 / N:1))
  * tx_number                 : text       [REQ: NO]
  * tx_id                     : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * inv_movement_id           : relation   [REQ: NO] | Relación -> pbc_4280990403 (Uno (1:1 / N:1))
  * pos_shift_id              : relation   [REQ: NO] | Relación -> pbc_859065514 (Uno (1:1 / N:1))
  * discount_amount           : number     [REQ: NO]
  * freight_amount            : number     [REQ: NO]
  * payment_split             : text       [REQ: NO]
  * sales_order_id            : relation   [REQ: NO] | Relación -> pbc_2420370400 (Uno (1:1 / N:1))
  * seller_id                 : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * commission_rate           : number     [REQ: NO]
  * commission_amount         : number     [REQ: NO]
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * has_pending_delivery      : bool       [REQ: NO]
  * delivery_fulfillment_status : select     [REQ: NO] | Valores: []
  * bank_account_id           : relation   [REQ: NO] | Relación -> pbc_314358106 (Uno (1:1 / N:1))
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * po_number                 : text       [REQ: NO]
  * remision_number           : text       [REQ: NO]
  * payment_form              : text       [REQ: NO]
  * payment_dian_code         : text       [REQ: NO]
  * ret_rule_renta_id         : text       [REQ: NO]
  * ret_rule_ica_id           : text       [REQ: NO]
  * ret_rule_iva_id           : text       [REQ: NO]
  * ret_mode                  : text       [REQ: NO]
  * cross_doc_ref             : text       [REQ: NO]
  * is_electronic             : bool       [REQ: NO]
  * cost_corrected            : bool       [REQ: NO]
  * cost_corrected_at         : text       [REQ: NO]
  * third_party_branch_id     : relation   [REQ: NO] | Relación -> pbc_tp_branches (Uno (1:1 / N:1))
  * delivery_id               : relation   [REQ: NO] | Relación -> pbc_4251913776 (Uno (1:1 / N:1))
  * inv_movement_ids          : relation   [REQ: NO] | Relación -> pbc_4280990403 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: invoice_lines (Tipo: base)
Total Campos: 22
==================================================
  * id                        : text       [REQ: SI]
  * invoice_id                : relation   [REQ: SI] | Relación -> pbc_711030668 (Uno (1:1 / N:1))
  * line_order                : number     [REQ: NO]
  * product_id                : relation   [REQ: NO] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * account_id                : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * description               : text       [REQ: NO]
  * qty                       : number     [REQ: SI]
  * unit_price                : number     [REQ: SI]
  * iva_rate                  : number     [REQ: NO]
  * iva_amount                : number     [REQ: NO]
  * subtotal                  : number     [REQ: NO]
  * total                     : number     [REQ: NO]
  * discount_rate             : number     [REQ: NO]
  * discount_pct              : number     [REQ: NO]
  * ret_rule_id               : text       [REQ: NO]
  * is_loss                   : bool       [REQ: NO]
  * lot_number                : text       [REQ: NO]
  * pallet_code               : text       [REQ: NO]
  * boxes_qty                 : number     [REQ: NO]
  * lot_id                    : relation   [REQ: NO] | Relación -> pbc_4230823287 (Uno (1:1 / N:1))
  * pallet_id                 : relation   [REQ: NO] | Relación -> pbc_2400528911 (Uno (1:1 / N:1))
  * warehouse_id              : relation   [REQ: NO] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: pos_registers (Tipo: base)
Total Campos: 5
==================================================
  * id                        : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * terminal_key              : text       [REQ: SI]
  * active                    : bool       [REQ: NO]
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: pos_shifts (Tipo: base)
Total Campos: 18
==================================================
  * id                        : text       [REQ: SI]
  * user_id                   : relation   [REQ: SI] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * opened_at                 : text       [REQ: SI]
  * closed_at                 : text       [REQ: NO]
  * cash_initial              : number     [REQ: SI]
  * cash_sales                : number     [REQ: NO]
  * cash_expected             : number     [REQ: NO]
  * cash_actual               : number     [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * notes                     : text       [REQ: NO]
  * pos_register_id           : relation   [REQ: NO] | Relación -> pbc_3459247009 (Uno (1:1 / N:1))
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * cash_recaudos             : number     [REQ: NO]
  * cash_egresos              : number     [REQ: NO]
  * bank_recaudos             : number     [REQ: NO]
  * bank_egresos              : number     [REQ: NO]

==================================================
TABLA / COLECCIÓN: dian_resolutions (Tipo: base)
Total Campos: 11
==================================================
  * id                        : text       [REQ: SI]
  * document_type             : select     [REQ: SI] | Valores: []
  * prefix                    : text       [REQ: SI]
  * resolution_number         : text       [REQ: SI]
  * resolution_date           : text       [REQ: SI]
  * number_from               : number     [REQ: SI]
  * number_to                 : number     [REQ: SI]
  * current_number            : number     [REQ: NO]
  * expiration_date           : text       [REQ: SI]
  * pos_register_id           : relation   [REQ: NO] | Relación -> pbc_3459247009 (Uno (1:1 / N:1))
  * active                    : bool       [REQ: NO]

--------------------------------------------------------------------------------
MÓDULO: 6. TESORERÍA, RECAUDOS Y CARTERA (CXC MÓVIL)
Descripción: Registro de cobros a clientes en ruta, abonos a facturas, cuentas bancarias y conceptos de caja.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: payments (Tipo: base)
Total Campos: 5
==================================================
  * id                        : text       [REQ: SI]
  * invoice_id                : relation   [REQ: SI] | Relación -> pbc_711030668 (Uno (1:1 / N:1))
  * amount                    : number     [REQ: SI]
  * payment_method            : text       [REQ: SI]
  * date                      : date       [REQ: SI]

==================================================
TABLA / COLECCIÓN: bank_accounts (Tipo: base)
Total Campos: 9
==================================================
  * id                        : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * bank                      : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * account_id                : relation   [REQ: SI] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * currency                  : text       [REQ: NO]
  * active                    : bool       [REQ: NO]
  * third_party_id            : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * default_tx_type_id        : relation   [REQ: NO] | Relación -> pbc_1708081505 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: bank_movements (Tipo: base)
Total Campos: 11
==================================================
  * id                        : text       [REQ: SI]
  * bank_account_id           : relation   [REQ: SI] | Relación -> pbc_314358106 (Uno (1:1 / N:1))
  * date                      : text       [REQ: SI]
  * description               : text       [REQ: NO]
  * debit                     : number     [REQ: NO]
  * credit                    : number     [REQ: NO]
  * balance                   : number     [REQ: NO]
  * ref                       : text       [REQ: NO]
  * reconciled                : bool       [REQ: NO]
  * tx_line_id                : relation   [REQ: NO] | Relación -> pbc_2785691647 (Uno (1:1 / N:1))
  * reconciliation_id         : relation   [REQ: NO] | Relación -> pbc_3284689112 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: cash_concepts (Tipo: base)
Total Campos: 6
==================================================
  * id                        : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * type                      : select     [REQ: SI] | Valores: []
  * account_id                : relation   [REQ: SI] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * description               : text       [REQ: NO]
  * active                    : bool       [REQ: NO]

==================================================
TABLA / COLECCIÓN: treasury_settings (Tipo: base)
Total Campos: 4
==================================================
  * id                        : text       [REQ: SI]
  * default_bank_account_id   : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * default_cash_account_id   : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * auto_rules                : json       [REQ: NO] | Objeto o Array JSON estructurado

--------------------------------------------------------------------------------
MÓDULO: 7. LOGÍSTICA, RUTAS Y ENTREGAS
Descripción: Despachos y entregas de pedidos con vehículos asignados, seguimiento de líneas de entrega.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: logistica_vehicles (Tipo: base)
Total Campos: 14
==================================================
  * id                        : text       [REQ: SI]
  * plate                     : text       [REQ: SI]
  * driver                    : text       [REQ: SI]
  * capacity                  : number     [REQ: SI]
  * status                    : select     [REQ: SI] | Valores: []
  * notes                     : text       [REQ: NO]
  * active                    : bool       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * transportista_id          : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * licencia_vence            : text       [REQ: NO]
  * soat_vence                : text       [REQ: NO]
  * tecnomecanica_vence       : text       [REQ: NO]
  * poliza_rc_vence           : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: logistica_deliveries (Tipo: base)
Total Campos: 16
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * client_id                 : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * vehicle_id                : relation   [REQ: NO] | Relación -> pbc_3392905230 (Uno (1:1 / N:1))
  * address                   : text       [REQ: SI]
  * date                      : text       [REQ: SI]
  * status                    : select     [REQ: SI] | Valores: []
  * weight                    : number     [REQ: NO]
  * notes                     : text       [REQ: NO]
  * items                     : text       [REQ: NO]
  * sales_order_id            : relation   [REQ: NO] | Relación -> pbc_2420370400 (Uno (1:1 / N:1))
  * invoice_id                : relation   [REQ: NO] | Relación -> pbc_711030668 (Uno (1:1 / N:1))
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * billing_status            : select     [REQ: NO] | Valores: []
  * delivery_type             : select     [REQ: NO] | Valores: []

==================================================
TABLA / COLECCIÓN: logistica_delivery_lines (Tipo: base)
Total Campos: 14
==================================================
  * id                        : text       [REQ: SI]
  * delivery_id               : relation   [REQ: SI] | Relación -> pbc_4251913776 (Uno (1:1 / N:1))
  * line_order                : number     [REQ: NO]
  * product_id                : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * invoice_line_id           : relation   [REQ: NO] | Relación -> pbc_2616189266 (Uno (1:1 / N:1))
  * reservation_line_id       : relation   [REQ: NO] | Relación -> pbc_710896604 (Uno (1:1 / N:1))
  * qty_planned               : number     [REQ: SI]
  * qty_delivered             : number     [REQ: NO]
  * notes                     : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * boxes_qty                 : number     [REQ: NO]
  * lot_id                    : relation   [REQ: NO] | Relación -> pbc_4230823287 (Uno (1:1 / N:1))
  * pallet_id                 : relation   [REQ: NO] | Relación -> pbc_2400528911 (Uno (1:1 / N:1))

--------------------------------------------------------------------------------
MÓDULO: 8. GEOGRAFÍA Y DIVIPOLA (COLOMBIA)
Descripción: Tablas maestras de países, departamentos y municipios para georreferenciación de clientes y rutas.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: geo_countries (Tipo: base)
Total Campos: 3
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]

==================================================
TABLA / COLECCIÓN: geo_departments (Tipo: base)
Total Campos: 4
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * country_code              : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: geo_municipalities (Tipo: base)
Total Campos: 5
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * dept_code                 : text       [REQ: SI]
  * postal_code               : text       [REQ: NO]

--------------------------------------------------------------------------------
MÓDULO: 9. COMPRAS, PROVEEDORES Y COMERCIO EXTERIOR
Descripción: Órdenes de compra, facturas de compra, importaciones y liquidaciones de consignación.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: purchase_orders (Tipo: base)
Total Campos: 15
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * supplier_id               : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * warehouse_id              : relation   [REQ: NO] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * date                      : text       [REQ: SI]
  * due_date                  : text       [REQ: NO]
  * notes                     : text       [REQ: NO]
  * subtotal                  : number     [REQ: NO]
  * iva_total                 : number     [REQ: NO]
  * discount_amount           : number     [REQ: NO]
  * total                     : number     [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * invoice_id                : relation   [REQ: NO] | Relación -> pbc_3726714070 (Uno (1:1 / N:1))
  * user_id                   : relation   [REQ: NO] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: purchase_order_lines (Tipo: base)
Total Campos: 11
==================================================
  * id                        : text       [REQ: SI]
  * purchase_order_id         : relation   [REQ: SI] | Relación -> pbc_purchase_orders (Uno (1:1 / N:1))
  * line_order                : number     [REQ: NO]
  * product_id                : relation   [REQ: NO] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * description               : text       [REQ: NO]
  * qty                       : number     [REQ: SI]
  * unit_price                : number     [REQ: SI]
  * iva_rate                  : number     [REQ: NO]
  * iva_amount                : number     [REQ: NO]
  * subtotal                  : number     [REQ: NO]
  * total                     : number     [REQ: NO]

==================================================
TABLA / COLECCIÓN: purchase_invoices (Tipo: base)
Total Campos: 28
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * date                      : text       [REQ: SI]
  * due_date                  : text       [REQ: NO]
  * supplier_id               : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * supplier_ref              : text       [REQ: NO]
  * warehouse_id              : relation   [REQ: NO] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * notes                     : text       [REQ: NO]
  * status                    : select     [REQ: NO] | Valores: []
  * subtotal                  : number     [REQ: NO]
  * iva_total                 : number     [REQ: NO]
  * total                     : number     [REQ: NO]
  * tx_id                     : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * inv_movement_id           : relation   [REQ: NO] | Relación -> pbc_4280990403 (Uno (1:1 / N:1))
  * tx_type_id                : relation   [REQ: NO] | Relación -> pbc_1708081505 (Uno (1:1 / N:1))
  * tx_number                 : text       [REQ: NO]
  * ret_total                 : number     [REQ: NO]
  * payable_total             : number     [REQ: NO]
  * ret_rule_renta_id         : text       [REQ: NO]
  * ret_rule_ica_id           : text       [REQ: NO]
  * ret_rule_iva_id           : text       [REQ: NO]
  * import_id                 : relation   [REQ: NO] | Relación -> pbc_3922105078 (Uno (1:1 / N:1))
  * dian_resolution_id        : relation   [REQ: NO] | Relación -> pbc_4258913350 (Uno (1:1 / N:1))
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * discount_amount           : number     [REQ: NO]
  * iva_treatment             : select     [REQ: NO] | Valores: []
  * iva_cost_total            : number     [REQ: NO]
  * third_party_branch_id     : relation   [REQ: NO] | Relación -> pbc_tp_branches (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: purchase_invoice_lines (Tipo: base)
Total Campos: 22
==================================================
  * id                        : text       [REQ: SI]
  * invoice_id                : relation   [REQ: SI] | Relación -> pbc_3726714070 (Uno (1:1 / N:1))
  * product_id                : relation   [REQ: NO] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * account_id                : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * description               : text       [REQ: NO]
  * qty                       : number     [REQ: SI]
  * unit_price                : number     [REQ: SI]
  * iva_rate                  : number     [REQ: NO]
  * subtotal                  : number     [REQ: NO]
  * iva_amount                : number     [REQ: NO]
  * total                     : number     [REQ: NO]
  * line_order                : number     [REQ: NO]
  * ret_rule_id               : text       [REQ: NO]
  * ret_concept               : text       [REQ: NO]
  * ret_base_type             : text       [REQ: NO]
  * ret_base                  : number     [REQ: NO]
  * ret_rate                  : number     [REQ: NO]
  * ret_amount                : number     [REQ: NO]
  * ret_account_code          : text       [REQ: NO]
  * discount_rate             : number     [REQ: NO]
  * discount_pct              : number     [REQ: NO]
  * iva_as_cost               : bool       [REQ: NO]

==================================================
TABLA / COLECCIÓN: imports (Tipo: base)
Total Campos: 51
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * supplier_id               : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * status                    : select     [REQ: SI] | Valores: []
  * incoterm                  : select     [REQ: NO] | Valores: []
  * bl_awb                    : text       [REQ: NO]
  * bl_document               : file       [REQ: NO] | Archivo(s): max 1 []
  * transport_type            : select     [REQ: NO] | Valores: []
  * estimated_arrival         : text       [REQ: NO]
  * notes                     : text       [REQ: NO]
  * currency                  : select     [REQ: SI] | Valores: []
  * exchange_rate             : number     [REQ: SI]
  * fob_total                 : number     [REQ: NO]
  * freight_cost              : number     [REQ: NO]
  * insurance_cost            : number     [REQ: NO]
  * arancel_total             : number     [REQ: NO]
  * gastos_nacionalizacion    : number     [REQ: NO]
  * transporte_nacional       : number     [REQ: NO]
  * otros_gastos              : number     [REQ: NO]
  * total_gastos_cif          : number     [REQ: NO]
  * total_gastos_locales      : number     [REQ: NO]
  * total                     : number     [REQ: NO]
  * purchase_invoice_id       : relation   [REQ: NO] | Relación -> pbc_3726714070 (Uno (1:1 / N:1))
  * date_created              : text       [REQ: SI]
  * user_id                   : relation   [REQ: SI] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * tx_fob_id                 : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * tx_freight_id             : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * tx_insurance_id           : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * tx_customs_id             : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * tx_local_carrier_id       : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * tx_local_other_id         : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * freight_supplier_id       : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * insurance_supplier_id     : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * customs_supplier_id       : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * local_carrier_id          : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * local_other_supplier_id   : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * supplier_invoice_num      : text       [REQ: NO]
  * freight_invoice_num       : text       [REQ: NO]
  * insurance_invoice_num     : text       [REQ: NO]
  * customs_invoice_num       : text       [REQ: NO]
  * local_carrier_invoice_num : text       [REQ: NO]
  * local_other_invoice_num   : text       [REQ: NO]
  * vuce_registro_num         : text       [REQ: NO]
  * dian_declaracion_num      : text       [REQ: NO]
  * dian_declaracion_date     : text       [REQ: NO]
  * dian_levante_date         : text       [REQ: NO]
  * dian_trm                  : number     [REQ: NO]
  * modalidad_importacion     : select     [REQ: NO] | Valores: []
  * canal_inspeccion          : select     [REQ: NO] | Valores: []
  * proration_method          : select     [REQ: NO] | Valores: []
  * stage_expenses            : json       [REQ: NO] | Objeto o Array JSON estructurado

==================================================
TABLA / COLECCIÓN: import_lines (Tipo: base)
Total Campos: 29
==================================================
  * id                        : text       [REQ: SI]
  * import_id                 : relation   [REQ: SI] | Relación -> pbc_3922105078 (Uno (1:1 / N:1))
  * product_id                : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * qty                       : number     [REQ: SI]
  * fob_price                 : number     [REQ: SI]
  * arancel_rate              : number     [REQ: NO]
  * arancel_amount            : number     [REQ: NO]
  * iva_rate                  : number     [REQ: NO]
  * iva_amount                : number     [REQ: NO]
  * prorated_cost             : number     [REQ: NO]
  * unit_cost_cop             : number     [REQ: NO]
  * total_cop                 : number     [REQ: NO]
  * manifest_number           : text       [REQ: NO]
  * manifest_file             : file       [REQ: NO] | Archivo(s): max 1 []
  * line_order                : number     [REQ: NO]
  * pais_origen               : text       [REQ: NO]
  * certificado_origen_num    : text       [REQ: NO]
  * posicion_arancelaria      : text       [REQ: NO]
  * peso_neto_total           : number     [REQ: NO]
  * peso_bruto_total          : number     [REQ: NO]
  * largo_cm                  : number     [REQ: NO]
  * ancho_cm                  : number     [REQ: NO]
  * alto_cm                   : number     [REQ: NO]
  * cubic_meters_total        : number     [REQ: NO]
  * supplier_id               : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * import_invoice_id         : relation   [REQ: NO] | Relación -> pbc_2915859709 (Uno (1:1 / N:1))
  * lot_number                : text       [REQ: NO]
  * manufacturing_date        : text       [REQ: NO]
  * expiry_date               : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: import_invoices (Tipo: base)
Total Campos: 15
==================================================
  * id                        : text       [REQ: SI]
  * import_id                 : relation   [REQ: SI] | Relación -> pbc_3922105078 (Uno (1:1 / N:1))
  * supplier_id               : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * invoice_number            : text       [REQ: SI]
  * invoice_date              : text       [REQ: NO]
  * currency                  : select     [REQ: SI] | Valores: []
  * exchange_rate             : number     [REQ: NO]
  * fob_amount                : number     [REQ: NO]
  * fob_amount_cop            : number     [REQ: NO]
  * payment_due_date          : text       [REQ: NO]
  * notes                     : text       [REQ: NO]
  * invoice_file              : file       [REQ: NO] | Archivo(s): max 1 []
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * tx_fob_id                 : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: import_pallet_configs (Tipo: base)
Total Campos: 16
==================================================
  * id                        : text       [REQ: SI]
  * import_id                 : relation   [REQ: SI] | Relación -> pbc_3922105078 (Uno (1:1 / N:1))
  * product_id                : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * import_line_id            : relation   [REQ: NO] | Relación -> pbc_4123813726 (Uno (1:1 / N:1))
  * pallet_qty                : number     [REQ: SI]
  * boxes_per_pallet          : number     [REQ: SI]
  * units_per_box             : number     [REQ: SI]
  * total_boxes               : number     [REQ: NO]
  * total_units               : number     [REQ: NO]
  * pallet_type               : select     [REQ: NO] | Valores: []
  * height_cm                 : number     [REQ: NO]
  * gross_weight_kg           : number     [REQ: NO]
  * lot_number                : text       [REQ: NO]
  * notes                     : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: consignment_settlements (Tipo: base)
Total Campos: 12
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * type                      : select     [REQ: SI] | Valores: []
  * third_party_id            : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * date                      : text       [REQ: SI]
  * status                    : select     [REQ: SI] | Valores: []
  * invoice_id                : relation   [REQ: NO] | Relación -> pbc_711030668 (Uno (1:1 / N:1))
  * purchase_invoice_id       : relation   [REQ: NO] | Relación -> pbc_3726714070 (Uno (1:1 / N:1))
  * warehouse_id              : relation   [REQ: SI] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * return_warehouse_id       : relation   [REQ: NO] | Relación -> pbc_1364849191 (Uno (1:1 / N:1))
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * notes                     : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: consignment_settlement_lines (Tipo: base)
Total Campos: 7
==================================================
  * id                        : text       [REQ: SI]
  * settlement_id             : relation   [REQ: SI] | Relación -> pbc_consg_settl (Uno (1:1 / N:1))
  * product_id                : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * qty_sold                  : number     [REQ: SI]
  * qty_returned              : number     [REQ: SI]
  * unit_cost                 : number     [REQ: SI]
  * subtotal                  : number     [REQ: SI]

--------------------------------------------------------------------------------
MÓDULO: 10. CONTABILIDAD FINANCIERA, PUC Y TRANSACCIONES
Descripción: Plan Único de Cuentas (PUC), comprobantes contables y asientos de partida doble.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: accounts (Tipo: base)
Total Campos: 19
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * account_type_id           : relation   [REQ: SI] | Relación -> pbc_2257284400 (Uno (1:1 / N:1))
  * nature                    : select     [REQ: SI] | Valores: []
  * level                     : number     [REQ: SI]
  * parent_code               : text       [REQ: NO]
  * requires_third_party      : bool       [REQ: NO]
  * active                    : bool       [REQ: NO]
  * maneja_cruce              : bool       [REQ: NO]
  * maneja_retenciones        : bool       [REQ: NO]
  * tipos_retencion           : text       [REQ: NO]
  * ret_rate_reterenta        : number     [REQ: NO]
  * ret_rate_reteiva          : number     [REQ: NO]
  * ret_rate_reteica          : number     [REQ: NO]
  * niif_classification       : text       [REQ: NO]
  * niif_standard             : text       [REQ: NO]
  * niif_statement            : text       [REQ: NO]
  * niif_cf_category          : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: account_types (Tipo: base)
Total Campos: 5
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * nature                    : select     [REQ: SI] | Valores: []
  * class_code                : text       [REQ: SI]

==================================================
TABLA / COLECCIÓN: transactions (Tipo: base)
Total Campos: 19
==================================================
  * id                        : text       [REQ: SI]
  * tx_type_id                : relation   [REQ: SI] | Relación -> pbc_1708081505 (Uno (1:1 / N:1))
  * number                    : text       [REQ: SI]
  * date                      : text       [REQ: SI]
  * description               : text       [REQ: NO]
  * third_party_id            : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * cross_enabled             : bool       [REQ: NO]
  * cross_type                : text       [REQ: NO]
  * cross_number              : text       [REQ: NO]
  * cross_amount              : number     [REQ: NO]
  * cross_purpose             : select     [REQ: NO] | Valores: []
  * status                    : select     [REQ: NO] | Valores: []
  * user_id                   : relation   [REQ: NO] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * payment_days              : number     [REQ: NO]
  * teso_mode                 : text       [REQ: NO]
  * teso_params               : json       [REQ: NO] | Objeto o Array JSON estructurado
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * book_type                 : text       [REQ: NO]
  * pos_shift_id              : relation   [REQ: NO] | Relación -> pbc_859065514 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: tx_lines (Tipo: base)
Total Campos: 14
==================================================
  * id                        : text       [REQ: SI]
  * tx_id                     : relation   [REQ: SI] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * account_id                : relation   [REQ: SI] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * debit                     : number     [REQ: NO]
  * credit                    : number     [REQ: NO]
  * description               : text       [REQ: NO]
  * line_order                : number     [REQ: NO]
  * cross_doc_ref             : text       [REQ: NO]
  * third_party_id            : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * cost_center_id            : relation   [REQ: NO] | Relación -> pbc_cost_centers (Uno (1:1 / N:1))
  * cross_doc_date            : text       [REQ: NO]
  * due_date                  : text       [REQ: NO]
  * is_iva_cost               : bool       [REQ: NO]

==================================================
TABLA / COLECCIÓN: transaction_types (Tipo: base)
Total Campos: 10
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * prefix                    : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * description               : text       [REQ: NO]
  * consecutive               : number     [REQ: NO]
  * active                    : bool       [REQ: NO]
  * numbering_mode            : select     [REQ: NO] | Valores: []
  * numbering_period_granularity : select     [REQ: NO] | Valores: []
  * period_counters           : json       [REQ: NO] | Objeto o Array JSON estructurado

==================================================
TABLA / COLECCIÓN: financial_notes (Tipo: base)
Total Campos: 10
==================================================
  * id                        : text       [REQ: SI]
  * periodo                   : text       [REQ: SI]
  * nota_num                  : number     [REQ: SI]
  * tipo_informe              : select     [REQ: SI] | Valores: []
  * titulo                    : text       [REQ: SI]
  * cuenta_codigo             : text       [REQ: NO]
  * contenido                 : text       [REQ: NO]
  * sugerido                  : text       [REQ: NO]
  * revisado                  : bool       [REQ: NO]
  * updated_by                : relation   [REQ: NO] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: bank_reconciliations (Tipo: base)
Total Campos: 17
==================================================
  * id                        : text       [REQ: SI]
  * bank_account_id           : relation   [REQ: SI] | Relación -> pbc_314358106 (Uno (1:1 / N:1))
  * period_start              : text       [REQ: SI]
  * period_end                : text       [REQ: SI]
  * book_balance              : number     [REQ: NO]
  * bank_balance              : number     [REQ: NO]
  * difference                : number     [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * reconciled_count          : number     [REQ: NO]
  * pending_bank_count        : number     [REQ: NO]
  * pending_book_count        : number     [REQ: NO]
  * closed_at                 : text       [REQ: NO]
  * reopened_at               : text       [REQ: NO]
  * notes                     : text       [REQ: NO]
  * snapshot_data             : json       [REQ: NO] | Objeto o Array JSON estructurado
  * closed_by                 : relation   [REQ: NO] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * reopened_by               : relation   [REQ: NO] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: exogena_concepts (Tipo: base)
Total Campos: 5
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * account_ranges            : text       [REQ: NO]
  * format_type               : select     [REQ: SI] | Valores: []

==================================================
TABLA / COLECCIÓN: homologation_rules (Tipo: base)
Total Campos: 5
==================================================
  * id                        : text       [REQ: SI]
  * rule_type                 : select     [REQ: SI] | Valores: []
  * key_value                 : text       [REQ: SI]
  * account_code              : text       [REQ: SI]
  * description               : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: commission_rules (Tipo: base)
Total Campos: 7
==================================================
  * id                        : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * type                      : select     [REQ: SI] | Valores: []
  * rate                      : number     [REQ: SI]
  * product_id                : relation   [REQ: NO] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * seller_id                 : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * active                    : bool       [REQ: NO]

--------------------------------------------------------------------------------
MÓDULO: 11. FACTURACIÓN ELECTRÓNICA Y NÓMINA ELECTRÓNICA DIAN
Descripción: Documentos electrónicos DIAN (XML, CUFE, estados de validación) y nómina electrónica.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: electronic_documents (Tipo: base)
Total Campos: 24
==================================================
  * id                        : text       [REQ: SI]
  * uuid                      : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * document_type             : select     [REQ: SI] | Valores: []
  * status                    : select     [REQ: SI] | Valores: []
  * issue_date                : text       [REQ: SI]
  * reception_date            : text       [REQ: NO]
  * supplier_nit              : text       [REQ: SI]
  * supplier_name             : text       [REQ: SI]
  * customer_nit              : text       [REQ: SI]
  * customer_name             : text       [REQ: SI]
  * subtotal                  : number     [REQ: SI]
  * tax_amount                : number     [REQ: NO]
  * total                     : number     [REQ: SI]
  * xml_file                  : file       [REQ: NO] | Archivo(s): max 1 []
  * pdf_file                  : file       [REQ: NO] | Archivo(s): max 1 []
  * processed                 : bool       [REQ: NO]
  * transaction_id            : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * hash                      : text       [REQ: NO]
  * import_date               : text       [REQ: SI]
  * notes                     : text       [REQ: NO]
  * user_id                   : relation   [REQ: SI] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))
  * supplier_details          : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: electronic_document_items (Tipo: base)
Total Campos: 8
==================================================
  * id                        : text       [REQ: SI]
  * document_id               : relation   [REQ: SI] | Relación -> pbc_1439117088 (Uno (1:1 / N:1))
  * code                      : text       [REQ: NO]
  * unspsc_code               : text       [REQ: NO]
  * description               : text       [REQ: SI]
  * qty                       : number     [REQ: SI]
  * price                     : number     [REQ: SI]
  * subtotal                  : number     [REQ: SI]

==================================================
TABLA / COLECCIÓN: electronic_document_taxes (Tipo: base)
Total Campos: 6
==================================================
  * id                        : text       [REQ: SI]
  * document_id               : relation   [REQ: SI] | Relación -> pbc_1439117088 (Uno (1:1 / N:1))
  * tax_type                  : select     [REQ: SI] | Valores: []
  * rate                      : number     [REQ: SI]
  * base                      : number     [REQ: SI]
  * amount                    : number     [REQ: SI]

==================================================
TABLA / COLECCIÓN: einvoice_docs (Tipo: base)
Total Campos: 9
==================================================
  * id                        : text       [REQ: SI]
  * tx_id                     : relation   [REQ: SI] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * cufe                      : text       [REQ: NO]
  * status                    : select     [REQ: NO] | Valores: []
  * dian_response             : text       [REQ: NO]
  * xml_content               : text       [REQ: NO]
  * sent_at                   : text       [REQ: NO]
  * ftech_transaction_id      : text       [REQ: NO]
  * zip_filename              : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: electronic_payrolls (Tipo: base)
Total Campos: 23
==================================================
  * id                        : text       [REQ: SI]
  * periodo_id                : relation   [REQ: NO] | Relación -> pbc_2682020231 (Uno (1:1 / N:1))
  * ano                       : number     [REQ: SI]
  * mes                       : number     [REQ: SI]
  * tipo_ambiente             : text       [REQ: NO]
  * numero_envio              : number     [REQ: NO]
  * fecha_envio               : text       [REQ: NO]
  * xml_generado              : text       [REQ: NO]
  * estado_dian               : text       [REQ: NO]
  * cufe                      : text       [REQ: NO]
  * total_devengos            : number     [REQ: NO]
  * total_deducciones         : number     [REQ: NO]
  * total_neto                : number     [REQ: NO]
  * total_empleador           : number     [REQ: NO]
  * total_empleados           : number     [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * employee_id               : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * consecutivo               : number     [REQ: NO]
  * prefijo                   : text       [REQ: NO]
  * ftech_transaction_id      : text       [REQ: NO]
  * dian_response             : text       [REQ: NO]
  * pdf_base64                : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: payroll_documents (Tipo: base)
Total Campos: 8
==================================================
  * id                        : text       [REQ: SI]
  * employee_id               : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * category                  : select     [REQ: SI] | Valores: []
  * file                      : file       [REQ: SI] | Archivo(s): max 1 []
  * name                      : text       [REQ: SI]
  * date                      : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: payroll_lines (Tipo: base)
Total Campos: 24
==================================================
  * id                        : text       [REQ: SI]
  * period_id                 : relation   [REQ: SI] | Relación -> pbc_2682020231 (Uno (1:1 / N:1))
  * employee_id               : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * salary_base               : number     [REQ: SI]
  * days_worked               : number     [REQ: NO]
  * overtime                  : number     [REQ: NO]
  * transport_allowance       : number     [REQ: NO]
  * deduction_health          : number     [REQ: NO]
  * deduction_pension         : number     [REQ: NO]
  * deduction_other           : number     [REQ: NO]
  * net_pay                   : number     [REQ: NO]
  * employer_health           : number     [REQ: NO]
  * employer_pension          : number     [REQ: NO]
  * employer_arl              : number     [REQ: NO]
  * sena                      : number     [REQ: NO]
  * icbf                      : number     [REQ: NO]
  * caja_comp                 : number     [REQ: NO]
  * cesantias                 : number     [REQ: NO]
  * intereses_ces             : number     [REQ: NO]
  * prima                     : number     [REQ: NO]
  * vacaciones                : number     [REQ: NO]
  * notes                     : text       [REQ: NO]
  * solidarity_fund           : number     [REQ: NO]
  * withholding_tax           : number     [REQ: NO]

==================================================
TABLA / COLECCIÓN: payroll_novelties (Tipo: base)
Total Campos: 13
==================================================
  * id                        : text       [REQ: SI]
  * period_id                 : relation   [REQ: SI] | Relación -> pbc_2682020231 (Uno (1:1 / N:1))
  * employee_id               : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * type                      : text       [REQ: SI]
  * date_from                 : text       [REQ: SI]
  * date_to                   : text       [REQ: NO]
  * qty                       : number     [REQ: NO]
  * amount                    : number     [REQ: NO]
  * support_number            : text       [REQ: NO]
  * description               : text       [REQ: NO]
  * status                    : select     [REQ: NO] | Valores: []
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: payroll_periods (Tipo: base)
Total Campos: 7
==================================================
  * id                        : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * date_from                 : text       [REQ: SI]
  * date_to                   : text       [REQ: SI]
  * status                    : select     [REQ: NO] | Valores: []
  * tx_id                     : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * branch_id                 : relation   [REQ: NO] | Relación -> pbc_2536409462 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: payroll_settlements (Tipo: base)
Total Campos: 33
==================================================
  * id                        : text       [REQ: SI]
  * employee_id               : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * settlement_date           : text       [REQ: SI]
  * hire_date                 : text       [REQ: NO]
  * contract_type             : text       [REQ: NO]
  * reason                    : text       [REQ: NO]
  * basic_salary              : number     [REQ: NO]
  * transport_allowance       : number     [REQ: NO]
  * base_prestaciones         : number     [REQ: NO]
  * pending_salary_days       : number     [REQ: NO]
  * pending_salary_amount     : number     [REQ: NO]
  * pending_transport_amount  : number     [REQ: NO]
  * severance_days            : number     [REQ: NO]
  * severance_amount          : number     [REQ: NO]
  * severance_interest_amount : number     [REQ: NO]
  * bonus_days                : number     [REQ: NO]
  * bonus_amount              : number     [REQ: NO]
  * vacation_days             : number     [REQ: NO]
  * vacation_amount           : number     [REQ: NO]
  * indemnity_amount          : number     [REQ: NO]
  * other_earnings            : number     [REQ: NO]
  * total_earnings            : number     [REQ: NO]
  * health_deduction          : number     [REQ: NO]
  * pension_deduction         : number     [REQ: NO]
  * other_deductions          : number     [REQ: NO]
  * total_deductions          : number     [REQ: NO]
  * net_pay                   : number     [REQ: NO]
  * provisions_applied        : json       [REQ: NO] | Objeto o Array JSON estructurado
  * notes                     : text       [REQ: NO]
  * status                    : select     [REQ: NO] | Valores: []
  * tx_id                     : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

--------------------------------------------------------------------------------
MÓDULO: 12. MÓDULOS VERTICALES (PROPIEDAD HORIZONTAL, INMOBILIARIA, SERVICIOS)
Descripción: Esquemas específicos para propiedad horizontal (PH), contratos de arrendamiento y servicios/veterinaria.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: ph_properties (Tipo: base)
Total Campos: 14
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * unit_type                 : select     [REQ: SI] | Valores: []
  * floor                     : text       [REQ: NO]
  * tower                     : text       [REQ: NO]
  * area_m2                   : number     [REQ: NO]
  * coef_participacion        : number     [REQ: NO]
  * owner_id                  : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * occupant_id               : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * notes                     : text       [REQ: NO]
  * active                    : bool       [REQ: NO]
  * apartment                 : text       [REQ: NO]
  * admin_fee                 : number     [REQ: NO]

==================================================
TABLA / COLECCIÓN: ph_invoices (Tipo: base)
Total Campos: 11
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * period                    : text       [REQ: SI]
  * property_id               : relation   [REQ: SI] | Relación -> pbc_4259671506 (Uno (1:1 / N:1))
  * date                      : text       [REQ: SI]
  * due_date                  : text       [REQ: NO]
  * subtotal                  : number     [REQ: NO]
  * total                     : number     [REQ: NO]
  * status                    : select     [REQ: NO] | Valores: []
  * tx_id                     : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * notes                     : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: ph_invoice_lines (Tipo: base)
Total Campos: 7
==================================================
  * id                        : text       [REQ: SI]
  * invoice_id                : relation   [REQ: SI] | Relación -> pbc_92469940 (Uno (1:1 / N:1))
  * concept_id                : relation   [REQ: NO] | Relación -> pbc_446239205 (Uno (1:1 / N:1))
  * description               : text       [REQ: SI]
  * amount                    : number     [REQ: SI]
  * line_order                : number     [REQ: NO]
  * account_code              : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: ph_billing_concepts (Tipo: base)
Total Campos: 9
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * description               : text       [REQ: NO]
  * amount                    : number     [REQ: SI]
  * is_variable               : bool       [REQ: NO]
  * applies_coef              : bool       [REQ: NO]
  * account_id                : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * active                    : bool       [REQ: NO]

==================================================
TABLA / COLECCIÓN: ph_common_areas (Tipo: base)
Total Campos: 9
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * description               : text       [REQ: NO]
  * capacity                  : number     [REQ: NO]
  * min_hours                 : number     [REQ: NO]
  * max_hours                 : number     [REQ: NO]
  * rules                     : text       [REQ: NO]
  * active                    : bool       [REQ: NO]

==================================================
TABLA / COLECCIÓN: ph_reservations (Tipo: base)
Total Campos: 9
==================================================
  * id                        : text       [REQ: SI]
  * area_id                   : relation   [REQ: SI] | Relación -> pbc_2321549435 (Uno (1:1 / N:1))
  * property_id               : relation   [REQ: SI] | Relación -> pbc_4259671506 (Uno (1:1 / N:1))
  * date                      : text       [REQ: SI]
  * time_from                 : text       [REQ: SI]
  * time_to                   : text       [REQ: SI]
  * status                    : select     [REQ: NO] | Valores: []
  * attendees                 : number     [REQ: NO]
  * notes                     : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: ph_individual_charges (Tipo: base)
Total Campos: 10
==================================================
  * id                        : text       [REQ: SI]
  * property_id               : relation   [REQ: NO] | Relación -> pbc_4259671506 (Uno (1:1 / N:1))
  * description               : text       [REQ: NO]
  * amount                    : number     [REQ: NO]
  * period                    : text       [REQ: NO]
  * notes                     : text       [REQ: NO]
  * name                      : text       [REQ: NO]
  * account_code              : text       [REQ: NO]
  * active                    : bool       [REQ: NO]
  * code                      : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: ph_pqrs (Tipo: base)
Total Campos: 13
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * property_id               : relation   [REQ: NO] | Relación -> pbc_4259671506 (Uno (1:1 / N:1))
  * pqrs_type                 : select     [REQ: SI] | Valores: []
  * priority                  : select     [REQ: NO] | Valores: []
  * subject                   : text       [REQ: SI]
  * description               : text       [REQ: SI]
  * status                    : select     [REQ: NO] | Valores: []
  * response                  : text       [REQ: NO]
  * opened_at                 : text       [REQ: NO]
  * closed_at                 : text       [REQ: NO]
  * assigned_to               : text       [REQ: NO]
  * evidences                 : file       [REQ: NO] | Archivo(s): max 1 []

==================================================
TABLA / COLECCIÓN: ph_budgets (Tipo: base)
Total Campos: 5
==================================================
  * id                        : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * year                      : number     [REQ: SI]
  * status                    : select     [REQ: SI] | Valores: []
  * total_amount              : number     [REQ: NO]

==================================================
TABLA / COLECCIÓN: ph_budget_lines (Tipo: base)
Total Campos: 5
==================================================
  * id                        : text       [REQ: SI]
  * budget_id                 : relation   [REQ: SI] | Relación -> pbc_3238548894 (Uno (1:1 / N:1))
  * account_id                : relation   [REQ: SI] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * annual_amount             : number     [REQ: SI]
  * monthly_distribution      : json       [REQ: NO] | Objeto o Array JSON estructurado

==================================================
TABLA / COLECCIÓN: inmo_properties (Tipo: base)
Total Campos: 27
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * title                     : text       [REQ: SI]
  * type                      : select     [REQ: SI] | Valores: []
  * address                   : text       [REQ: NO]
  * city                      : text       [REQ: NO]
  * owner_id                  : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * rental_price              : number     [REQ: NO]
  * sale_price                : number     [REQ: NO]
  * commission_rate           : number     [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * notes                     : text       [REQ: NO]
  * active                    : bool       [REQ: NO]
  * neighborhood              : text       [REQ: NO]
  * social_stratum            : number     [REQ: NO]
  * area_sqm                  : number     [REQ: NO]
  * rooms                     : number     [REQ: NO]
  * bathrooms                 : number     [REQ: NO]
  * parking_spaces            : number     [REQ: NO]
  * admon_price               : number     [REQ: NO]
  * year_built                : number     [REQ: NO]
  * has_elevator              : bool       [REQ: NO]
  * has_pool                  : bool       [REQ: NO]
  * has_gym                   : bool       [REQ: NO]
  * has_balcony               : bool       [REQ: NO]
  * has_storage               : bool       [REQ: NO]
  * pet_friendly              : bool       [REQ: NO]

==================================================
TABLA / COLECCIÓN: inmo_contracts (Tipo: base)
Total Campos: 19
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * property_id               : relation   [REQ: NO] | Relación -> pbc_1451450202 (Uno (1:1 / N:1))
  * tenant_id                 : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * start_date                : text       [REQ: SI]
  * end_date                  : text       [REQ: NO]
  * monthly_rent              : number     [REQ: SI]
  * increment_percentage      : number     [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * notes                     : text       [REQ: NO]
  * active                    : bool       [REQ: NO]
  * type                      : select     [REQ: SI] | Valores: []
  * description               : text       [REQ: NO]
  * term_months               : number     [REQ: NO]
  * implicit_interest_rate    : number     [REQ: NO]
  * right_of_use_value        : number     [REQ: NO]
  * lease_liability_value     : number     [REQ: NO]
  * amortization_table        : json       [REQ: NO] | Objeto o Array JSON estructurado
  * lessor_id                 : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: inmo_invoices (Tipo: base)
Total Campos: 16
==================================================
  * id                        : text       [REQ: SI]
  * number                    : text       [REQ: SI]
  * period                    : text       [REQ: SI]
  * contract_id               : relation   [REQ: SI] | Relación -> pbc_4065969623 (Uno (1:1 / N:1))
  * date                      : text       [REQ: SI]
  * due_date                  : text       [REQ: NO]
  * rent_amount               : number     [REQ: SI]
  * other_amount              : number     [REQ: NO]
  * commission_amount         : number     [REQ: NO]
  * net_to_owner              : number     [REQ: NO]
  * total                     : number     [REQ: SI]
  * status                    : select     [REQ: SI] | Valores: []
  * tx_id                     : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * payout_tx_id              : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))
  * notes                     : text       [REQ: NO]
  * tax_amount                : number     [REQ: NO]

==================================================
TABLA / COLECCIÓN: inmo_invoice_lines (Tipo: base)
Total Campos: 6
==================================================
  * id                        : text       [REQ: SI]
  * invoice_id                : relation   [REQ: SI] | Relación -> pbc_3071274698 (Uno (1:1 / N:1))
  * description               : text       [REQ: SI]
  * amount                    : number     [REQ: SI]
  * account_code              : text       [REQ: NO]
  * line_order                : number     [REQ: NO]

==================================================
TABLA / COLECCIÓN: inmo_property_history (Tipo: base)
Total Campos: 7
==================================================
  * id                        : text       [REQ: SI]
  * property_id               : relation   [REQ: SI] | Relación -> pbc_1451450202 (Uno (1:1 / N:1))
  * event_type                : select     [REQ: SI] | Valores: []
  * date                      : text       [REQ: SI]
  * title                     : text       [REQ: SI]
  * description               : text       [REQ: NO]
  * cost                      : number     [REQ: NO]

==================================================
TABLA / COLECCIÓN: pets (Tipo: base)
Total Campos: 8
==================================================
  * id                        : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * owner_id                  : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * species                   : select     [REQ: SI] | Valores: []
  * breed                     : text       [REQ: NO]
  * birthdate                 : text       [REQ: NO]
  * allergies                 : text       [REQ: NO]
  * behavior_notes            : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: appointments (Tipo: base)
Total Campos: 11
==================================================
  * id                        : text       [REQ: SI]
  * pet_id                    : relation   [REQ: NO] | Relación -> pbc_2704641423 (Uno (1:1 / N:1))
  * start_time                : text       [REQ: SI]
  * end_time                  : text       [REQ: SI]
  * service_id                : relation   [REQ: SI] | Relación -> pbc_4092854851 (Uno (1:1 / N:1))
  * status                    : select     [REQ: SI] | Valores: []
  * notes                     : text       [REQ: NO]
  * sales_order_id            : relation   [REQ: NO] | Relación -> pbc_2420370400 (Uno (1:1 / N:1))
  * stylist_id                : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * real_start_time           : text       [REQ: NO]
  * real_end_time             : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: spa_clients (Tipo: base)
Total Campos: 9
==================================================
  * id                        : text       [REQ: SI]
  * client_id                 : relation   [REQ: SI] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * skin_type                 : select     [REQ: NO] | Valores: []
  * allergies                 : text       [REQ: NO]
  * medical_conditions        : text       [REQ: NO]
  * treatment_notes           : text       [REQ: NO]
  * birthdate                 : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: niif_assets (Tipo: base)
Total Campos: 29
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * cost                      : number     [REQ: SI]
  * useful_life_niif          : number     [REQ: SI]
  * useful_life_fiscal        : number     [REQ: SI]
  * depreciation_method       : select     [REQ: SI] | Valores: []
  * residual_value            : number     [REQ: NO]
  * impairment                : number     [REQ: NO]
  * revaluation               : number     [REQ: NO]
  * location                  : text       [REQ: NO]
  * active                    : bool       [REQ: NO]
  * cost_center_id            : relation   [REQ: NO] | Relación -> pbc_cost_centers (Uno (1:1 / N:1))
  * owner_id                  : relation   [REQ: NO] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * category_id               : relation   [REQ: NO] | Relación -> pbc_4118764413 (Uno (1:1 / N:1))
  * parent_asset_id           : relation   [REQ: NO] | Relación -> pbc_1340922796 (Uno (1:1 / N:1))
  * status                    : select     [REQ: NO] | Valores: []
  * brand                     : text       [REQ: NO]
  * model                     : text       [REQ: NO]
  * serial_number             : text       [REQ: NO]
  * color                     : text       [REQ: NO]
  * manufacturer              : text       [REQ: NO]
  * provider_id               : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))
  * invoice_number            : text       [REQ: NO]
  * invoice_date              : text       [REQ: NO]
  * purchase_date             : text       [REQ: NO]
  * start_service_date        : text       [REQ: NO]
  * qr_code                   : text       [REQ: NO]
  * photo_url                 : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: niif_asset_categories (Tipo: base)
Total Campos: 16
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * useful_life_niif_default  : number     [REQ: NO]
  * useful_life_fiscal_default : number     [REQ: NO]
  * depreciation_method_default : select     [REQ: NO] | Valores: []
  * residual_value_percent_default : number     [REQ: NO]
  * active                    : bool       [REQ: NO]
  * account_asset_id          : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * account_depr_accum_id     : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * account_depr_expense_id   : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * account_impairment_accum_id : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * account_impairment_expense_id : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * account_revaluation_id    : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * account_disposal_gain_id  : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))
  * account_disposal_loss_id  : relation   [REQ: NO] | Relación -> pbc_2324088501 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: niif_asset_events (Tipo: base)
Total Campos: 14
==================================================
  * id                        : text       [REQ: SI]
  * date                      : text       [REQ: SI]
  * event_type                : select     [REQ: SI] | Valores: []
  * description               : text       [REQ: NO]
  * amount                    : number     [REQ: NO]
  * previous_value            : number     [REQ: NO]
  * new_value                 : number     [REQ: NO]
  * location_from             : text       [REQ: NO]
  * location_to               : text       [REQ: NO]
  * cost_center_from_id       : relation   [REQ: NO] | Relación -> pbc_cost_centers (Uno (1:1 / N:1))
  * cost_center_to_id         : relation   [REQ: NO] | Relación -> pbc_cost_centers (Uno (1:1 / N:1))
  * owner_from_id             : relation   [REQ: NO] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * owner_to_id               : relation   [REQ: NO] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * transaction_id            : relation   [REQ: NO] | Relación -> pbc_3174063690 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: niif_asset_inventories (Tipo: base)
Total Campos: 6
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * date                      : text       [REQ: SI]
  * description               : text       [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * results                   : json       [REQ: NO] | Objeto o Array JSON estructurado

==================================================
TABLA / COLECCIÓN: niif_leases (Tipo: base)
Total Campos: 12
==================================================
  * id                        : text       [REQ: SI]
  * contract_number           : text       [REQ: SI]
  * description               : text       [REQ: SI]
  * start_date                : text       [REQ: SI]
  * term_months               : number     [REQ: SI]
  * monthly_canon             : number     [REQ: SI]
  * implicit_interest_rate    : number     [REQ: SI]
  * right_of_use_value        : number     [REQ: NO]
  * lease_liability_value     : number     [REQ: NO]
  * amortization_table        : json       [REQ: NO] | Objeto o Array JSON estructurado
  * active                    : bool       [REQ: NO]
  * lessor_id                 : relation   [REQ: NO] | Relación -> pbc_955284662 (Uno (1:1 / N:1))

==================================================
TABLA / COLECCIÓN: niif_policies (Tipo: base)
Total Campos: 16
==================================================
  * id                        : text       [REQ: SI]
  * code                      : text       [REQ: SI]
  * name                      : text       [REQ: SI]
  * standard                  : text       [REQ: NO]
  * objective                 : text       [REQ: NO]
  * scope                     : text       [REQ: NO]
  * recognition               : text       [REQ: NO]
  * initial_measurement       : text       [REQ: NO]
  * subsequent_measurement    : text       [REQ: NO]
  * derecognition             : text       [REQ: NO]
  * disclosures               : text       [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * version                   : text       [REQ: NO]
  * date                      : text       [REQ: NO]
  * owner                     : text       [REQ: NO]
  * history                   : json       [REQ: NO] | Objeto o Array JSON estructurado

==================================================
TABLA / COLECCIÓN: niif_settings (Tipo: base)
Total Campos: 11
==================================================
  * id                        : text       [REQ: SI]
  * grupo_empresa             : select     [REQ: SI] | Valores: []
  * moneda_funcional          : text       [REQ: SI]
  * moneda_presentacion       : text       [REQ: SI]
  * fecha_transicion          : text       [REQ: NO]
  * fecha_adopcion            : text       [REQ: NO]
  * metodo_depreciacion       : text       [REQ: NO]
  * metodo_inventarios        : text       [REQ: NO]
  * materialidad              : number     [REQ: NO]
  * politicas_aprobadas       : bool       [REQ: NO]
  * params_adicionales        : json       [REQ: NO] | Objeto o Array JSON estructurado

==================================================
TABLA / COLECCIÓN: agenda_vencimientos (Tipo: base)
Total Campos: 8
==================================================
  * id                        : text       [REQ: SI]
  * type                      : select     [REQ: SI] | Valores: []
  * title                     : text       [REQ: SI]
  * description               : text       [REQ: NO]
  * due_date                  : text       [REQ: SI]
  * amount                    : number     [REQ: NO]
  * status                    : select     [REQ: SI] | Valores: []
  * assigned_roles            : json       [REQ: NO] | Objeto o Array JSON estructurado

--------------------------------------------------------------------------------
MÓDULO: 13. TABLAS INTERNAS Y AUDITORÍA
Descripción: Logs de auditoría del sistema y colecciones de autenticación interna de PocketBase.
--------------------------------------------------------------------------------

==================================================
TABLA / COLECCIÓN: audit_log (Tipo: base)
Total Campos: 9
==================================================
  * id                        : text       [REQ: SI]
  * user_id                   : relation   [REQ: NO] | Relación -> _pb_users_auth_ (Uno (1:1 / N:1))
  * username                  : text       [REQ: SI]
  * action                    : text       [REQ: SI]
  * entity                    : text       [REQ: SI]
  * entity_id                 : text       [REQ: NO]
  * details                   : text       [REQ: NO]
  * ip                        : text       [REQ: NO]
  * event_at                  : text       [REQ: NO]

==================================================
TABLA / COLECCIÓN: _superusers (Tipo: auth)
Total Campos: 8
==================================================
  * id                        : text       [REQ: SI]
  * password                  : password   [REQ: SI]
  * tokenKey                  : text       [REQ: SI]
  * email                     : email      [REQ: SI]
  * emailVisibility           : bool       [REQ: NO]
  * verified                  : bool       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: _authOrigins (Tipo: base)
Total Campos: 6
==================================================
  * id                        : text       [REQ: SI]
  * collectionRef             : text       [REQ: SI]
  * recordRef                 : text       [REQ: SI]
  * fingerprint               : text       [REQ: SI]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: _externalAuths (Tipo: base)
Total Campos: 7
==================================================
  * id                        : text       [REQ: SI]
  * collectionRef             : text       [REQ: SI]
  * recordRef                 : text       [REQ: SI]
  * provider                  : text       [REQ: SI]
  * providerId                : text       [REQ: SI]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: _mfas (Tipo: base)
Total Campos: 6
==================================================
  * id                        : text       [REQ: SI]
  * collectionRef             : text       [REQ: SI]
  * recordRef                 : text       [REQ: SI]
  * method                    : text       [REQ: SI]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

==================================================
TABLA / COLECCIÓN: _otps (Tipo: base)
Total Campos: 7
==================================================
  * id                        : text       [REQ: SI]
  * collectionRef             : text       [REQ: SI]
  * recordRef                 : text       [REQ: SI]
  * password                  : password   [REQ: SI]
  * sentTo                    : text       [REQ: NO]
  * created                   : autodate   [REQ: NO] | Timestamp automático del sistema
  * updated                   : autodate   [REQ: NO] | Timestamp automático del sistema

================================================================================
8. PLANTILLAS DE CÓDIGO LISTAS PARA USAR (FLUTTER / REACT NATIVE)
================================================================================

--- A) IMPLEMENTACIÓN EN FLUTTER / DART ---
Dependencias en pubspec.yaml:
  pocketbase: ^0.19.0
  flutter_secure_storage: ^9.0.0

Código de Servicio PocketBase (pocketbase_service.dart):
```dart
import 'package:pocketbase/pocketbase.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class PocketBaseService {
  static final PocketBaseService _instance = PocketBaseService._internal();
  factory PocketBaseService() => _instance;
  PocketBaseService._internal();

  late PocketBase pb;
  final _storage = const FlutterSecureStorage();

  Future<void> init(String baseUrl) async {
    pb = PocketBase(baseUrl);
    // Cargar token previo si existe
    final savedToken = await _storage.read(key: 'pb_auth_token');
    if (savedToken != null) {
      pb.authStore.save(savedToken, null);
      try {
        await pb.collection('users').authRefresh();
      } catch (_) {
        pb.authStore.clear();
        await _storage.delete(key: 'pb_auth_token');
      }
    }
  }

  Future<RecordModel> login(String identity, String password) async {
    final authData = await pb.collection('users').authWithPassword(identity, password);
    await _storage.write(key: 'pb_auth_token', value: pb.authStore.token);
    return authData.record!;
  }

  Future<RecordModel> createSalesOrder({
    required String customerId,
    required String warehouseId,
    required List<Map<String, dynamic>> items,
  }) async {
    final sellerId = pb.authStore.model.id;
    double subtotal = 0;
    double iva = 0;
    for (var it in items) {
      subtotal += (it['qty'] * it['unit_price']);
      iva += (it['qty'] * it['unit_price'] * (it['iva_rate'] ?? 0) / 100);
    }
    final order = await pb.collection('sales_orders').create(body: {
      'number': 'PED-${DateTime.now().millisecondsSinceEpoch}',
      'customer_id': customerId,
      'seller_id': sellerId,
      'user_id': sellerId,
      'warehouse_id': warehouseId,
      'date': DateTime.now().toIso8601String().substring(0, 10),
      'subtotal': subtotal,
      'iva_total': iva,
      'total': subtotal + iva,
      'status': 'pending',
      'fulfillment_status': 'SIN_GESTION',
    });

    for (int i = 0; i < items.length; i++) {
      final it = items[i];
      final lineSubtotal = it['qty'] * it['unit_price'];
      final lineIva = lineSubtotal * (it['iva_rate'] ?? 0) / 100;
      await pb.collection('sales_order_lines').create(body: {
        'sales_order_id': order.id,
        'product_id': it['product_id'],
        'line_order': i + 1,
        'qty': it['qty'],
        'unit_price': it['unit_price'],
        'iva_rate': it['iva_rate'],
        'iva_amount': lineIva,
        'subtotal': lineSubtotal,
        'total': lineSubtotal + lineIva,
      });
    }
    return order;
  }
}
```

--- B) IMPLEMENTACIÓN EN REACT NATIVE / TYPESCRIPT ---
Dependencias:
  npm install pocketbase expo-secure-store

Código de Servicio (pocketbase.ts):
```typescript
import PocketBase, { AsyncAuthStore } from 'pocketbase';
import * as SecureStore from 'expo-secure-store';

const store = new AsyncAuthStore({
  save: async (serialized) => SecureStore.setItemAsync('pb_auth', serialized),
  initial: SecureStore.getItem('pb_auth') || '',
  clear: async () => SecureStore.deleteItemAsync('pb_auth'),
});

export const pb = new PocketBase('https://app.gravy-ms.com', store);

export async function loginMobile(email: string, pass: string) {
  const authData = await pb.collection('users').authWithPassword(email, pass);
  return authData.record;
}

export async function sendGpsPing(lat: number, lng: number, battery: number) {
  const userId = pb.authStore.model?.id;
  if (!userId) return;
  const records = await pb.collection('seller_live_locations').getList(1, 1, {
    filter: `user_id = '${userId}'`
  });
  if (records.items.length > 0) {
    await pb.collection('seller_live_locations').update(records.items[0].id, {
      lat,
      lng,
      battery_level: battery,
      last_ping: new Date().toISOString(),
    });
  }
}
```

================================================================================
FIN DEL DOCUMENTO DE ARQUITECTURA DE BASE DE DATOS PARA APLICACIONES MÓVILES
================================================================================