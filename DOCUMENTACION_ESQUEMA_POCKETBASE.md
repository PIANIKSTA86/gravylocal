# 🗺️ Mapa Arquitectónico de Datos: PocketBase - ERP GRAVY

> **Documento Técnico para Agentes IA y Desarrolladores Full Stack**
> **Especialidad:** Sistemas Contables y Financieros (PUC Colombiano, NIIF, DIAN, Facturación Electrónica, POS, Inventarios y Nómina).
> **Total Colecciones en Sistema:** 102

---

## 📌 Índice de Módulos
- [1. SEGURIDAD, AUTENTICACIÓN Y CONFIGURACIÓN BASE](#1-seguridad,-autenticación-y-configuración-base)
- [2. TERCEROS, CONTACTOS Y CRM](#2-terceros,-contactos-y-crm)
- [3. GEOGRAFÍA Y DIVIPOLA (COLOMBIA)](#3-geografía-y-divipola-colombia)
- [4. PRODUCTOS, LISTAS DE PRECIOS E INVENTARIOS](#4-productos,-listas-de-precios-e-inventarios)
- [5. VENTAS, FACTURACIÓN Y PUNTO DE VENTA (POS)](#5-ventas,-facturación-y-punto-de-venta-pos)
- [6. COMPRAS Y CUENTAS POR PAGAR (CXP)](#6-compras-y-cuentas-por-pagar-cxp)
- [7. CONTABILIDAD FINANCIERA, PUC Y DIAN (PARTIDA DOBLE)](#7-contabilidad-financiera,-puc-y-dian-partida-doble)
- [8. FACTURACIÓN ELECTRÓNICA Y RESOLUCIONES DIAN](#8-facturación-electrónica-y-resoluciones-dian)
- [9. TESORERÍA, BANCOS Y CARTERA (CXC / PAGOS)](#9-tesorería,-bancos-y-cartera-cxc--pagos)
- [10. ACTIVOS FIJOS Y NIIF (NIC 16 / NIIF 16)](#10-activos-fijos-y-niif-nic-16--niif-16)
- [11. NÓMINA ELECTRÓNICA Y RECURSOS HUMANOS](#11-nómina-electrónica-y-recursos-humanos)
- [12. COMERCIO EXTERIOR E IMPORTACIONES (D.O.)](#12-comercio-exterior-e-importaciones-do)
- [13. LOGÍSTICA, DISTRIBUCIÓN Y DESPACHOS](#13-logística,-distribución-y-despachos)
- [14. MÓDULO VERTICAL: PROPIEDAD HORIZONTAL (PH)](#14-módulo-vertical-propiedad-horizontal-ph)
- [15. MÓDULO VERTICAL: INMOBILIARIA](#15-módulo-vertical-inmobiliaria)
- [16. MÓDULO VERTICAL: SERVICIOS, SPA Y VETERINARIA](#16-módulo-vertical-servicios,-spa-y-veterinaria)
- [17. COLECCIONES INTERNAS / SISTEMA POCKETBASE](#17-colecciones-internas--sistema-pocketbase)

---

## 1. SEGURIDAD, AUTENTICACIÓN Y CONFIGURACIÓN BASE

### 📦 Colección: `users`
- **Tipo PocketBase:** `auth` (Colección ID: `_pb_users_auth_`)
- **Total de Campos:** 24

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `password` | `password` | ✅ Sí | - |
| `tokenKey` | `text` | ✅ Sí | - |
| `email` | `email` | ✅ Sí | - |
| `emailVisibility` | `bool` | No | - |
| `verified` | `bool` | No | - |
| `name` | `text` | No | - |
| `avatar` | `file` | No | Archivo / Binario (image/jpeg, image/png, image/svg+xml, image/gif, image/webp) |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `role` | `select` | ✅ Sí | Valores: [`superadmin`, `admin`, `contador`, `auxiliar`, `auditor`, `propietario`, `viewer`, `vendedor`, `cajero`] [Selección Múltiple] |
| `full_name` | `text` | ✅ Sí | - |
| `active` | `bool` | No | - |
| `owner_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `default_branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |
| `allowed_branches` | `relation` | No | 🔗 Relación a **`branches`** (Múltiple (Array)) |
| `topbar_color` | `text` | No | - |
| `can_edit_docs` | `bool` | No | - |
| `default_warehouse_id` | `relation` | No | 🔗 Relación a **`warehouses`** (Uno (1:1 o N:1)) |
| `allowed_warehouses` | `relation` | No | 🔗 Relación a **`warehouses`** (Múltiple (Array)) |
| `active_session_id` | `text` | No | - |
| `last_login_ip` | `text` | No | - |
| `last_login_at` | `text` | No | - |
| `last_activity_at` | `text` | No | - |


### 📦 Colección: `_superusers`
- **Tipo PocketBase:** `auth` (Colección ID: `pbc_3142635823`)
- **Total de Campos:** 8

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `password` | `password` | ✅ Sí | - |
| `tokenKey` | `text` | ✅ Sí | - |
| `email` | `email` | ✅ Sí | - |
| `emailVisibility` | `bool` | No | - |
| `verified` | `bool` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


### 📦 Colección: `audit_log`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2462721645`)
- **Total de Campos:** 9

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `user_id` | `relation` | No | 🔗 Relación a **`users`** (Múltiple (Array)) |
| `username` | `text` | ✅ Sí | - |
| `action` | `text` | ✅ Sí | - |
| `entity` | `text` | ✅ Sí | - |
| `entity_id` | `text` | No | - |
| `details` | `text` | No | - |
| `ip` | `text` | No | - |
| `event_at` | `text` | No | - |


### 📦 Colección: `licenses`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1065113382`)
- **Total de Campos:** 6

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `module_key` | `select` | ✅ Sí | Valores: [`core`, `contabilidad`, `comercial`, `nomina`, `copropiedades`, `full`, `inmobiliarias`, `logistica`, `inventarios`, `tesoreria`, `tienda-virtual`, `spa`, `conciliacion`, `crm`, `niif`, `activos_fijos`] [Selección Múltiple] |
| `enabled` | `bool` | No | - |
| `expires_at` | `text` | No | - |
| `plan` | `select` | No | Valores: [`trial`, `mensual`, `anual`, `perpetua`] [Selección Múltiple] |
| `notes` | `text` | No | - |


### 📦 Colección: `settings`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2769025244`)
- **Total de Campos:** 3

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `key` | `text` | ✅ Sí | - |
| `value` | `text` | No | - |


### 📦 Colección: `branches`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2536409462`)
- **Total de Campos:** 4

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `active` | `bool` | No | - |


### 📦 Colección: `cost_centers`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_cost_centers`)
- **Total de Campos:** 6

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `description` | `text` | No | - |
| `parent_id` | `relation` | No | 🔗 Relación a **`cost_centers`** (Uno (1:1 o N:1)) |
| `active` | `bool` | No | - |


## 2. TERCEROS, CONTACTOS Y CRM

### 📦 Colección: `third_parties`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_955284662`)
- **Total de Campos:** 46

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `type` | `select` | ✅ Sí | Valores: [`CLIENTE`, `PROVEEDOR`, `EMPLEADO`, `PROPIETARIO`, `OTRO`] [Selección Múltiple] |
| `doc_type` | `select` | ✅ Sí | Valores: [`11`, `12`, `13`, `21`, `22`, `31`, `41`, `42`, `47`, `48`, `50`, `91`, `NIT`, `NITPE`, `CC`, `CE`, `TI`, `PAS`, `RC`] [Selección Múltiple] |
| `doc_number` | `text` | ✅ Sí | - |
| `dv` | `text` | No | - |
| `name` | `text` | ✅ Sí | - |
| `commercial_name` | `text` | No | - |
| `email` | `email` | No | - |
| `phone` | `text` | No | - |
| `address` | `text` | No | - |
| `city` | `text` | No | - |
| `department` | `text` | No | - |
| `country` | `text` | No | - |
| `tax_regime` | `select` | No | Valores: [`COMUN`, `SIMPLIFICADO`, `NO_RESP`, `GRAN_CONTR`] [Selección Múltiple] |
| `is_retention_agent` | `bool` | No | - |
| `bank_name` | `text` | No | - |
| `bank_account` | `text` | No | - |
| `contact_name` | `text` | No | - |
| `contact_phone` | `text` | No | - |
| `notes` | `text` | No | - |
| `active` | `bool` | No | - |
| `person_type` | `text` | No | - |
| `first_name` | `text` | No | - |
| `last_name` | `text` | No | - |
| `business_name` | `text` | No | - |
| `city_code` | `text` | No | - |
| `dept_code` | `text` | No | - |
| `advisor` | `text` | No | - |
| `phone2` | `text` | No | - |
| `email2` | `email` | No | - |
| `credit_limit` | `number` | No | - |
| `max_invoices` | `number` | No | - |
| `payment_days` | `number` | No | - |
| `ciiu` | `text` | No | - |
| `tfe` | `text` | No | - |
| `tfc` | `text` | No | - |
| `rf` | `text` | No | - |
| `prf` | `number` | No | - |
| `pi` | `number` | No | - |
| `piv` | `number` | No | - |
| `gc` | `bool` | No | - |
| `ar` | `bool` | No | - |
| `ei` | `bool` | No | - |
| `resp` | `json` | No | Objeto JSON o array estructurado |
| `gcm` | `bool` | No | - |
| `rut_pdf` | `file` | No | Archivo / Binario (application/pdf) |


### 📦 Colección: `third_party_branches`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_tp_branches`)
- **Total de Campos:** 20

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `third_party_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1) | CascadeDelete) |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `is_main` | `bool` | No | - |
| `country` | `text` | No | - |
| `department` | `text` | No | - |
| `dept_code` | `text` | No | - |
| `city` | `text` | No | - |
| `city_code` | `text` | No | - |
| `address` | `text` | No | - |
| `phone` | `text` | No | - |
| `phone2` | `text` | No | - |
| `email` | `email` | No | - |
| `contact_name` | `text` | No | - |
| `advisor` | `text` | No | - |
| `advisor_name` | `text` | No | - |
| `pi` | `number` | No | - |
| `notes` | `text` | No | - |
| `active` | `bool` | No | - |


### 📦 Colección: `clientes`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_279994318`)
- **Total de Campos:** 6

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `nombre` | `text` | ✅ Sí | - |
| `documento` | `text` | ✅ Sí | - |
| `limite_credito` | `number` | No | - |
| `saldo_actual` | `number` | No | - |
| `lista_precio_defecto` | `relation` | No | 🔗 Relación a **`listas_precios`** (Uno (1:1 o N:1)) |


### 📦 Colección: `crm_deals`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_924532027`)
- **Total de Campos:** 14

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `title` | `text` | ✅ Sí | - |
| `client_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `value` | `number` | ✅ Sí | - |
| `stage` | `select` | ✅ Sí | Valores: [`CONTACTO`, `PROPUESTA`, `NEGOCIACION`, `GANADO`, `PERDIDO`] [Selección Múltiple] |
| `expected_close` | `text` | No | - |
| `notes` | `text` | No | - |
| `active` | `bool` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `user_id` | `relation` | No | 🔗 Relación a **`users`** (Uno (1:1 o N:1)) |
| `seller_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `sales_order_id` | `relation` | No | 🔗 Relación a **`sales_orders`** (Uno (1:1 o N:1)) |
| `invoice_id` | `relation` | No | 🔗 Relación a **`invoices`** (Uno (1:1 o N:1)) |


### 📦 Colección: `crm_interactions`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1896089724`)
- **Total de Campos:** 9

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `deal_id` | `relation` | ✅ Sí | 🔗 Relación a **`crm_deals`** (Uno (1:1 o N:1) | CascadeDelete) |
| `user_id` | `relation` | ✅ Sí | 🔗 Relación a **`users`** (Uno (1:1 o N:1)) |
| `type` | `select` | ✅ Sí | Valores: [`LLAMADA`, `CORREO`, `REUNION`, `WHATSAPP`, `COTIZACION`, `OTRO`] [Selección Múltiple] |
| `request_details` | `text` | ✅ Sí | - |
| `response_details` | `text` | No | - |
| `response_at` | `text` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


### 📦 Colección: `vendor_visits`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3686138633`)
- **Total de Campos:** 16

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `seller_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `client_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `visit_date` | `text` | ✅ Sí | - |
| `order_seq` | `number` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`PROGRAMADA`, `EN_CURSO`, `COMPLETADA_PEDIDO`, `COMPLETADA_RECAUDO`, `NO_EFECTIVA`, `REPROGRAMADA`] [Selección Múltiple] |
| `objective` | `select` | No | Valores: [`VENTA`, `COBRO`, `SEGUIMIENTO`, `PROSPECCION`] [Selección Múltiple] |
| `checkin_time` | `text` | No | - |
| `checkout_time` | `text` | No | - |
| `geo_lat` | `number` | No | - |
| `geo_lng` | `number` | No | - |
| `sales_order_id` | `relation` | No | 🔗 Relación a **`sales_orders`** (Uno (1:1 o N:1)) |
| `no_order_reason` | `select` | No | Valores: [`STOCK_SUFICIENTE`, `LOCAL_CERRADO`, `ENCARGADO_NO_DISPONIBLE`, `PRECIO`, `OTRO`] [Selección Múltiple] |
| `notes` | `text` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


## 3. GEOGRAFÍA Y DIVIPOLA (COLOMBIA)

### 📦 Colección: `geo_countries`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_359529685`)
- **Total de Campos:** 3

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |


### 📦 Colección: `geo_departments`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1922795238`)
- **Total de Campos:** 4

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `country_code` | `text` | No | - |


### 📦 Colección: `geo_municipalities`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1164725277`)
- **Total de Campos:** 5

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `dept_code` | `text` | ✅ Sí | - |
| `postal_code` | `text` | No | - |


## 4. PRODUCTOS, LISTAS DE PRECIOS E INVENTARIOS

### 📦 Colección: `products`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4092854851`)
- **Total de Campos:** 51

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `description` | `text` | No | - |
| `type` | `select` | ✅ Sí | Valores: [`BIEN`, `SERVICIO`] [Selección Múltiple] |
| `unit` | `text` | ✅ Sí | - |
| `unspsc_code` | `text` | No | - |
| `ean_code` | `text` | No | - |
| `iva_rate` | `number` | No | - |
| `income_account_id` | `relation` | No | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `cost_account_id` | `relation` | No | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `inventory_account_id` | `relation` | No | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `base_price` | `number` | No | - |
| `cost_price` | `number` | No | - |
| `active` | `bool` | No | - |
| `presentacion` | `text` | No | - |
| `categoria` | `text` | No | - |
| `linea` | `text` | No | - |
| `precio_venta_2` | `number` | No | - |
| `precio_venta_3` | `number` | No | - |
| `peso` | `number` | No | - |
| `cajas_en_pallet` | `number` | No | - |
| `und_empaque` | `number` | No | - |
| `peso_x_und_empaque` | `number` | No | - |
| `is_combo` | `bool` | No | - |
| `posicion_arancelaria` | `text` | No | - |
| `arancel_rate_default` | `number` | No | - |
| `pais_origen` | `text` | No | - |
| `marca` | `text` | No | - |
| `modelo` | `text` | No | - |
| `visto_bueno_required` | `bool` | No | - |
| `visto_bueno_entidad` | `select` | No | Valores: [`ICA`, `INVIMA`, `SIC`, `INDUMIL`, `AUNAP`, `MINCIT`, `OTRO`] [Selección Múltiple] |
| `registro_sanitario` | `text` | No | - |
| `peso_neto` | `number` | No | - |
| `peso_bruto` | `number` | No | - |
| `stock_min` | `number` | No | - |
| `stock_max` | `number` | No | - |
| `manifest_pdf` | `file` | No | Archivo / Binario (application/pdf) |
| `image` | `file` | No | Archivo / Binario (image/jpeg, image/png, image/gif, image/webp, image/svg+xml) |
| `largo_cm` | `number` | No | - |
| `ancho_cm` | `number` | No | - |
| `alto_cm` | `number` | No | - |
| `is_consigned` | `bool` | No | - |
| `consignment_supplier_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `consignment_cost` | `number` | No | - |
| `auto_calc_price` | `bool` | No | - |
| `margin_factor` | `number` | No | - |
| `margin_type` | `select` | No | Valores: [`MARKUP_COST`, `MARGIN_SALE`, `FACTOR`] |
| `rounding_type` | `select` | No | Valores: [`NONE`, `NEAREST_10`, `NEAREST_100`, `NEAREST_1000`, `CEIL_100`, `CEIL_1000`] |
| `track_lots` | `bool` | No | - |
| `track_pallets` | `bool` | No | - |


### 📦 Colección: `product_components`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_386025020`)
- **Total de Campos:** 4

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `parent_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Múltiple (Array) | CascadeDelete) |
| `component_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Múltiple (Array)) |
| `qty` | `number` | ✅ Sí | - |


### 📦 Colección: `listas_precios`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_26262227`)
- **Total de Campos:** 3

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `nombre` | `text` | ✅ Sí | - |
| `activo` | `bool` | No | - |


### 📦 Colección: `precios_producto`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1022633735`)
- **Total de Campos:** 4

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `producto_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Uno (1:1 o N:1) | CascadeDelete) |
| `lista_precio_id` | `relation` | ✅ Sí | 🔗 Relación a **`listas_precios`** (Uno (1:1 o N:1) | CascadeDelete) |
| `precio` | `number` | ✅ Sí | - |


### 📦 Colección: `warehouses`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1364849191`)
- **Total de Campos:** 10

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `address` | `text` | No | - |
| `notes` | `text` | No | - |
| `active` | `bool` | No | - |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |
| `is_consignment` | `bool` | No | - |
| `consignment_type` | `select` | No | Valores: [`INBOUND`, `OUTBOUND`] |
| `linked_third_party_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |


### 📦 Colección: `inventory_stock`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4192604402`)
- **Total de Campos:** 6

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `product_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Múltiple (Array)) |
| `warehouse_id` | `relation` | ✅ Sí | 🔗 Relación a **`warehouses`** (Múltiple (Array)) |
| `qty_on_hand` | `number` | No | - |
| `avg_cost` | `number` | No | - |
| `last_mov_date` | `text` | No | - |


### 📦 Colección: `inventory_movements`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4280990403`)
- **Total de Campos:** 12

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `mov_type` | `select` | ✅ Sí | Valores: [`ENTRADA`, `SALIDA`, `TRASLADO`, `AJUSTE_POSITIVO`, `AJUSTE_NEGATIVO`] [Selección Múltiple] |
| `date` | `text` | ✅ Sí | - |
| `warehouse_id` | `relation` | ✅ Sí | 🔗 Relación a **`warehouses`** (Múltiple (Array)) |
| `dest_warehouse_id` | `relation` | No | 🔗 Relación a **`warehouses`** (Múltiple (Array)) |
| `third_party_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `notes` | `text` | No | - |
| `status` | `select` | No | Valores: [`draft`, `applied`, `voided`] [Selección Múltiple] |
| `tx_id` | `relation` | No | 🔗 Relación a **`transactions`** (Múltiple (Array)) |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |
| `concept_id` | `relation` | No | 🔗 Relación a **`inventory_concepts`** (Uno (1:1 o N:1)) |


### 📦 Colección: `inventory_movement_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1173048170`)
- **Total de Campos:** 13

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `movement_id` | `relation` | ✅ Sí | 🔗 Relación a **`inventory_movements`** (Múltiple (Array) | CascadeDelete) |
| `product_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Múltiple (Array)) |
| `qty` | `number` | ✅ Sí | - |
| `unit_cost` | `number` | No | - |
| `notes` | `text` | No | - |
| `line_order` | `number` | No | - |
| `original_unit_cost` | `number` | No | - |
| `lot_number` | `text` | No | - |
| `pallet_code` | `text` | No | - |
| `boxes_qty` | `number` | No | - |
| `lot_id` | `relation` | No | 🔗 Relación a **`inventory_lots`** (Uno (1:1 o N:1)) |
| `pallet_id` | `relation` | No | 🔗 Relación a **`inventory_pallets`** (Uno (1:1 o N:1)) |


### 📦 Colección: `inventory_concepts`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_inventory_concepts`)
- **Total de Campos:** 7

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `type` | `select` | ✅ Sí | Valores: [`ENTRADA`, `SALIDA`, `AMBOS`] |
| `account_id` | `relation` | ✅ Sí | 🔗 Relación a **`accounts`** (Uno (1:1 o N:1)) |
| `active` | `bool` | No | - |
| `description` | `text` | No | - |


### 📦 Colección: `inventory_lots`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4230823287`)
- **Total de Campos:** 15

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `product_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Uno (1:1 o N:1)) |
| `warehouse_id` | `relation` | ✅ Sí | 🔗 Relación a **`warehouses`** (Uno (1:1 o N:1)) |
| `lot_number` | `text` | ✅ Sí | - |
| `manufacturing_date` | `text` | No | - |
| `expiry_date` | `text` | No | - |
| `initial_qty` | `number` | ✅ Sí | - |
| `qty_on_hand` | `number` | ✅ Sí | - |
| `unit_cost` | `number` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`active`, `depleted`, `quarantine`, `expired`] [Selección Múltiple] |
| `notes` | `text` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `import_id` | `relation` | No | 🔗 Relación a **`imports`** (Uno (1:1 o N:1)) |
| `supplier_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |


### 📦 Colección: `inventory_pallets`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2400528911`)
- **Total de Campos:** 18

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `pallet_code` | `text` | ✅ Sí | - |
| `warehouse_id` | `relation` | ✅ Sí | 🔗 Relación a **`warehouses`** (Uno (1:1 o N:1)) |
| `location_code` | `text` | No | - |
| `product_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Uno (1:1 o N:1)) |
| `boxes_initial` | `number` | ✅ Sí | - |
| `lot_id` | `relation` | No | 🔗 Relación a **`inventory_lots`** (Uno (1:1 o N:1)) |
| `boxes_current` | `number` | ✅ Sí | - |
| `units_per_box` | `number` | ✅ Sí | - |
| `units_available` | `number` | No | - |
| `pallet_type` | `select` | No | Valores: [`ESTANDAR_120x100`, `EURO_120x80`, `ESPECIAL`, `PISO_SUELTO`] [Selección Múltiple] |
| `height_cm` | `number` | No | - |
| `gross_weight_kg` | `number` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`full`, `partial`, `depleted`, `quarantine`] [Selección Múltiple] |
| `notes` | `text` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `import_id` | `relation` | No | 🔗 Relación a **`imports`** (Uno (1:1 o N:1)) |


### 📦 Colección: `consignment_settlements`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_consg_settl`)
- **Total de Campos:** 12

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `type` | `select` | ✅ Sí | Valores: [`INBOUND`, `OUTBOUND`] |
| `third_party_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `date` | `text` | ✅ Sí | - |
| `status` | `select` | ✅ Sí | Valores: [`draft`, `posted`, `voided`] |
| `invoice_id` | `relation` | No | 🔗 Relación a **`invoices`** (Uno (1:1 o N:1)) |
| `purchase_invoice_id` | `relation` | No | 🔗 Relación a **`purchase_invoices`** (Uno (1:1 o N:1)) |
| `warehouse_id` | `relation` | ✅ Sí | 🔗 Relación a **`warehouses`** (Uno (1:1 o N:1)) |
| `return_warehouse_id` | `relation` | No | 🔗 Relación a **`warehouses`** (Uno (1:1 o N:1)) |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |
| `notes` | `text` | No | - |


### 📦 Colección: `consignment_settlement_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_consg_lines`)
- **Total de Campos:** 7

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `settlement_id` | `relation` | ✅ Sí | 🔗 Relación a **`consignment_settlements`** (Uno (1:1 o N:1) | CascadeDelete) |
| `product_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Uno (1:1 o N:1)) |
| `qty_sold` | `number` | ✅ Sí | - |
| `qty_returned` | `number` | ✅ Sí | - |
| `unit_cost` | `number` | ✅ Sí | - |
| `subtotal` | `number` | ✅ Sí | - |


## 5. VENTAS, FACTURACIÓN Y PUNTO DE VENTA (POS)

### 📦 Colección: `sales_orders`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2420370400`)
- **Total de Campos:** 22

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `customer_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `warehouse_id` | `relation` | No | 🔗 Relación a **`warehouses`** (Múltiple (Array)) |
| `date` | `text` | ✅ Sí | - |
| `due_date` | `text` | No | - |
| `notes` | `text` | No | - |
| `subtotal` | `number` | No | - |
| `iva_total` | `number` | No | - |
| `discount_amount` | `number` | No | - |
| `total` | `number` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`pending`, `invoiced`, `cancelled`] [Selección Múltiple] |
| `invoice_id` | `relation` | No | 🔗 Relación a **`invoices`** (Múltiple (Array)) |
| `user_id` | `relation` | ✅ Sí | 🔗 Relación a **`users`** (Múltiple (Array)) |
| `seller_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `has_pending_delivery` | `bool` | No | - |
| `fulfillment_status` | `select` | No | Valores: [`SIN_GESTION`, `RESERVADO_IMPORTACION`, `PENDIENTE_ENTREGA`, `PARCIAL_ENTREGADO`, `ENTREGADO`, `EN_DESPACHO`, `FACTURADO`] [Selección Múltiple] |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |
| `third_party_branch_id` | `relation` | No | 🔗 Relación a **`third_party_branches`** (Uno (1:1 o N:1)) |
| `delivery_id` | `relation` | No | 🔗 Relación a **`logistica_deliveries`** (Uno (1:1 o N:1)) |


### 📦 Colección: `sales_order_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_358150590`)
- **Total de Campos:** 13

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `sales_order_id` | `relation` | ✅ Sí | 🔗 Relación a **`sales_orders`** (Múltiple (Array) | CascadeDelete) |
| `line_order` | `number` | No | - |
| `product_id` | `relation` | No | 🔗 Relación a **`products`** (Múltiple (Array)) |
| `account_id` | `relation` | No | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `description` | `text` | No | - |
| `qty` | `number` | ✅ Sí | - |
| `unit_price` | `number` | ✅ Sí | - |
| `iva_rate` | `number` | No | - |
| `iva_amount` | `number` | No | - |
| `subtotal` | `number` | No | - |
| `total` | `number` | No | - |
| `import_id` | `relation` | No | 🔗 Relación a **`imports`** (Uno (1:1 o N:1)) |


### 📦 Colección: `sales_reservations`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4130161515`)
- **Total de Campos:** 9

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `customer_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `sales_order_id` | `relation` | No | 🔗 Relación a **`sales_orders`** (Uno (1:1 o N:1)) |
| `invoice_id` | `relation` | No | 🔗 Relación a **`invoices`** (Uno (1:1 o N:1)) |
| `status` | `select` | ✅ Sí | Valores: [`active`, `partial`, `completed`, `released`, `cancelled`, `por_confirmar`, `accepted`] [Selección Múltiple] |
| `notes` | `text` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


### 📦 Colección: `sales_reservation_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_710896604`)
- **Total de Campos:** 14

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `reservation_id` | `relation` | ✅ Sí | 🔗 Relación a **`sales_reservations`** (Uno (1:1 o N:1) | CascadeDelete) |
| `line_order` | `number` | No | - |
| `product_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Uno (1:1 o N:1)) |
| `import_id` | `relation` | No | 🔗 Relación a **`imports`** (Uno (1:1 o N:1)) |
| `import_line_id` | `relation` | No | 🔗 Relación a **`import_lines`** (Uno (1:1 o N:1)) |
| `qty_reserved` | `number` | ✅ Sí | - |
| `qty_dispatched` | `number` | No | - |
| `qty_released` | `number` | No | - |
| `eta_snapshot` | `text` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`active`, `partial`, `completed`, `released`, `cancelled`] [Selección Múltiple] |
| `notes` | `text` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


### 📦 Colección: `invoices`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_711030668`)
- **Total de Campos:** 46

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `customer_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `warehouse_id` | `relation` | ✅ Sí | 🔗 Relación a **`warehouses`** (Múltiple (Array)) |
| `date` | `text` | ✅ Sí | - |
| `due_date` | `text` | No | - |
| `notes` | `text` | No | - |
| `subtotal` | `number` | No | - |
| `iva_total` | `number` | No | - |
| `ret_total` | `number` | No | - |
| `total` | `number` | No | - |
| `payable_total` | `number` | No | - |
| `payment_method` | `select` | ✅ Sí | Valores: [`EFECTIVO`, `TRANSFERENCIA`, `CREDITO`, `MIXTO`] [Selección Múltiple] |
| `status` | `select` | ✅ Sí | Valores: [`draft`, `posted`, `voided`] [Selección Múltiple] |
| `tx_type_id` | `relation` | No | 🔗 Relación a **`transaction_types`** (Múltiple (Array)) |
| `tx_number` | `text` | No | - |
| `tx_id` | `relation` | No | 🔗 Relación a **`transactions`** (Múltiple (Array)) |
| `inv_movement_id` | `relation` | No | 🔗 Relación a **`inventory_movements`** (Múltiple (Array)) |
| `pos_shift_id` | `relation` | No | 🔗 Relación a **`pos_shifts`** (Múltiple (Array)) |
| `discount_amount` | `number` | No | - |
| `freight_amount` | `number` | No | - |
| `payment_split` | `text` | No | - |
| `sales_order_id` | `relation` | No | 🔗 Relación a **`sales_orders`** (Uno (1:1 o N:1)) |
| `seller_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `commission_rate` | `number` | No | - |
| `commission_amount` | `number` | No | - |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |
| `has_pending_delivery` | `bool` | No | - |
| `delivery_fulfillment_status` | `select` | No | Valores: [`PENDIENTE`, `PARCIAL`, `ENTREGADO`, `NO_REQUIERE`] [Selección Múltiple] |
| `bank_account_id` | `relation` | No | 🔗 Relación a **`bank_accounts`** (Uno (1:1 o N:1)) |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `po_number` | `text` | No | - |
| `remision_number` | `text` | No | - |
| `payment_form` | `text` | No | - |
| `payment_dian_code` | `text` | No | - |
| `ret_rule_renta_id` | `text` | No | - |
| `ret_rule_ica_id` | `text` | No | - |
| `ret_rule_iva_id` | `text` | No | - |
| `ret_mode` | `text` | No | - |
| `cross_doc_ref` | `text` | No | - |
| `is_electronic` | `bool` | No | - |
| `cost_corrected` | `bool` | No | - |
| `cost_corrected_at` | `text` | No | - |
| `third_party_branch_id` | `relation` | No | 🔗 Relación a **`third_party_branches`** (Uno (1:1 o N:1)) |
| `delivery_id` | `relation` | No | 🔗 Relación a **`logistica_deliveries`** (Uno (1:1 o N:1)) |


### 📦 Colección: `invoice_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2616189266`)
- **Total de Campos:** 21

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `invoice_id` | `relation` | ✅ Sí | 🔗 Relación a **`invoices`** (Múltiple (Array) | CascadeDelete) |
| `line_order` | `number` | No | - |
| `product_id` | `relation` | No | 🔗 Relación a **`products`** (Múltiple (Array)) |
| `account_id` | `relation` | No | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `description` | `text` | No | - |
| `qty` | `number` | ✅ Sí | - |
| `unit_price` | `number` | ✅ Sí | - |
| `iva_rate` | `number` | No | - |
| `iva_amount` | `number` | No | - |
| `subtotal` | `number` | No | - |
| `total` | `number` | No | - |
| `discount_rate` | `number` | No | - |
| `discount_pct` | `number` | No | - |
| `ret_rule_id` | `text` | No | - |
| `is_loss` | `bool` | No | - |
| `lot_number` | `text` | No | - |
| `pallet_code` | `text` | No | - |
| `boxes_qty` | `number` | No | - |
| `lot_id` | `relation` | No | 🔗 Relación a **`inventory_lots`** (Uno (1:1 o N:1)) |
| `pallet_id` | `relation` | No | 🔗 Relación a **`inventory_pallets`** (Uno (1:1 o N:1)) |


### 📦 Colección: `pos_registers`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3459247009`)
- **Total de Campos:** 5

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `terminal_key` | `text` | ✅ Sí | - |
| `active` | `bool` | No | - |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |


### 📦 Colección: `pos_shifts`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_859065514`)
- **Total de Campos:** 18

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `user_id` | `relation` | ✅ Sí | 🔗 Relación a **`users`** (Múltiple (Array)) |
| `opened_at` | `text` | ✅ Sí | - |
| `closed_at` | `text` | No | - |
| `cash_initial` | `number` | ✅ Sí | - |
| `cash_sales` | `number` | No | - |
| `cash_expected` | `number` | No | - |
| `cash_actual` | `number` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`open`, `closed`] [Selección Múltiple] |
| `notes` | `text` | No | - |
| `pos_register_id` | `relation` | No | 🔗 Relación a **`pos_registers`** (Múltiple (Array)) |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `cash_recaudos` | `number` | No | - |
| `cash_egresos` | `number` | No | - |
| `bank_recaudos` | `number` | No | - |
| `bank_egresos` | `number` | No | - |


### 📦 Colección: `commission_rules`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3652465962`)
- **Total de Campos:** 7

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `type` | `select` | ✅ Sí | Valores: [`total_sale`, `per_product`] [Selección Múltiple] |
| `rate` | `number` | ✅ Sí | - |
| `product_id` | `relation` | No | 🔗 Relación a **`products`** (Múltiple (Array)) |
| `seller_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `active` | `bool` | No | - |


## 6. COMPRAS Y CUENTAS POR PAGAR (CXP)

### 📦 Colección: `purchase_orders`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_purchase_orders`)
- **Total de Campos:** 15

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `supplier_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `warehouse_id` | `relation` | No | 🔗 Relación a **`warehouses`** (Uno (1:1 o N:1)) |
| `date` | `text` | ✅ Sí | - |
| `due_date` | `text` | No | - |
| `notes` | `text` | No | - |
| `subtotal` | `number` | No | - |
| `iva_total` | `number` | No | - |
| `discount_amount` | `number` | No | - |
| `total` | `number` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`pending`, `invoiced`, `cancelled`] |
| `invoice_id` | `relation` | No | 🔗 Relación a **`purchase_invoices`** (Uno (1:1 o N:1)) |
| `user_id` | `relation` | No | 🔗 Relación a **`users`** (Uno (1:1 o N:1)) |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |


### 📦 Colección: `purchase_order_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_purchase_order_lines`)
- **Total de Campos:** 11

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `purchase_order_id` | `relation` | ✅ Sí | 🔗 Relación a **`purchase_orders`** (Uno (1:1 o N:1) | CascadeDelete) |
| `line_order` | `number` | No | - |
| `product_id` | `relation` | No | 🔗 Relación a **`products`** (Uno (1:1 o N:1)) |
| `description` | `text` | No | - |
| `qty` | `number` | ✅ Sí | - |
| `unit_price` | `number` | ✅ Sí | - |
| `iva_rate` | `number` | No | - |
| `iva_amount` | `number` | No | - |
| `subtotal` | `number` | No | - |
| `total` | `number` | No | - |


### 📦 Colección: `purchase_invoices`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3726714070`)
- **Total de Campos:** 28

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `date` | `text` | ✅ Sí | - |
| `due_date` | `text` | No | - |
| `supplier_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `supplier_ref` | `text` | No | - |
| `warehouse_id` | `relation` | No | 🔗 Relación a **`warehouses`** (Múltiple (Array)) |
| `notes` | `text` | No | - |
| `status` | `select` | No | Valores: [`draft`, `posted`, `voided`] [Selección Múltiple] |
| `subtotal` | `number` | No | - |
| `iva_total` | `number` | No | - |
| `total` | `number` | No | - |
| `tx_id` | `relation` | No | 🔗 Relación a **`transactions`** (Múltiple (Array)) |
| `inv_movement_id` | `relation` | No | 🔗 Relación a **`inventory_movements`** (Múltiple (Array)) |
| `tx_type_id` | `relation` | No | 🔗 Relación a **`transaction_types`** (Múltiple (Array)) |
| `tx_number` | `text` | No | - |
| `ret_total` | `number` | No | - |
| `payable_total` | `number` | No | - |
| `ret_rule_renta_id` | `text` | No | - |
| `ret_rule_ica_id` | `text` | No | - |
| `ret_rule_iva_id` | `text` | No | - |
| `import_id` | `relation` | No | 🔗 Relación a **`imports`** (Uno (1:1 o N:1)) |
| `dian_resolution_id` | `relation` | No | 🔗 Relación a **`dian_resolutions`** (Uno (1:1 o N:1)) |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |
| `discount_amount` | `number` | No | - |
| `iva_treatment` | `select` | No | Valores: [`DESCONTABLE`, `MAYOR_COSTO`, `POR_LINEA`] [Selección Múltiple] |
| `iva_cost_total` | `number` | No | - |
| `third_party_branch_id` | `relation` | No | 🔗 Relación a **`third_party_branches`** (Uno (1:1 o N:1)) |


### 📦 Colección: `purchase_invoice_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_817774349`)
- **Total de Campos:** 22

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `invoice_id` | `relation` | ✅ Sí | 🔗 Relación a **`purchase_invoices`** (Múltiple (Array) | CascadeDelete) |
| `product_id` | `relation` | No | 🔗 Relación a **`products`** (Múltiple (Array)) |
| `account_id` | `relation` | No | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `description` | `text` | No | - |
| `qty` | `number` | ✅ Sí | - |
| `unit_price` | `number` | ✅ Sí | - |
| `iva_rate` | `number` | No | - |
| `subtotal` | `number` | No | - |
| `iva_amount` | `number` | No | - |
| `total` | `number` | No | - |
| `line_order` | `number` | No | - |
| `ret_rule_id` | `text` | No | - |
| `ret_concept` | `text` | No | - |
| `ret_base_type` | `text` | No | - |
| `ret_base` | `number` | No | - |
| `ret_rate` | `number` | No | - |
| `ret_amount` | `number` | No | - |
| `ret_account_code` | `text` | No | - |
| `discount_rate` | `number` | No | - |
| `discount_pct` | `number` | No | - |
| `iva_as_cost` | `bool` | No | - |


## 7. CONTABILIDAD FINANCIERA, PUC Y DIAN (PARTIDA DOBLE)

### 📦 Colección: `accounts`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2324088501`)
- **Total de Campos:** 19

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `account_type_id` | `relation` | ✅ Sí | 🔗 Relación a **`account_types`** (Múltiple (Array)) |
| `nature` | `select` | ✅ Sí | Valores: [`debit`, `credit`] [Selección Múltiple] |
| `level` | `number` | ✅ Sí | - |
| `parent_code` | `text` | No | - |
| `requires_third_party` | `bool` | No | - |
| `active` | `bool` | No | - |
| `maneja_cruce` | `bool` | No | - |
| `maneja_retenciones` | `bool` | No | - |
| `tipos_retencion` | `text` | No | - |
| `ret_rate_reterenta` | `number` | No | - |
| `ret_rate_reteiva` | `number` | No | - |
| `ret_rate_reteica` | `number` | No | - |
| `niif_classification` | `text` | No | - |
| `niif_standard` | `text` | No | - |
| `niif_statement` | `text` | No | - |
| `niif_cf_category` | `text` | No | - |


### 📦 Colección: `account_types`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2257284400`)
- **Total de Campos:** 5

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `nature` | `select` | ✅ Sí | Valores: [`debit`, `credit`] [Selección Múltiple] |
| `class_code` | `text` | ✅ Sí | - |


### 📦 Colección: `transaction_types`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1708081505`)
- **Total de Campos:** 10

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `prefix` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `description` | `text` | No | - |
| `consecutive` | `number` | No | - |
| `active` | `bool` | No | - |
| `numbering_mode` | `select` | No | Valores: [`continuous`, `period`] |
| `numbering_period_granularity` | `select` | No | Valores: [`monthly`, `yearly`] |
| `period_counters` | `json` | No | Objeto JSON o array estructurado |


### 📦 Colección: `transactions`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3174063690`)
- **Total de Campos:** 19

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `tx_type_id` | `relation` | ✅ Sí | 🔗 Relación a **`transaction_types`** (Múltiple (Array)) |
| `number` | `text` | ✅ Sí | - |
| `date` | `text` | ✅ Sí | - |
| `description` | `text` | No | - |
| `third_party_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `cross_enabled` | `bool` | No | - |
| `cross_type` | `text` | No | - |
| `cross_number` | `text` | No | - |
| `cross_amount` | `number` | No | - |
| `cross_purpose` | `select` | No | Valores: [`Causar`, `Recaudar`, `Reportar Cartera`] [Selección Múltiple] |
| `status` | `select` | No | Valores: [`active`, `voided`, `draft`] [Selección Múltiple] |
| `user_id` | `relation` | No | 🔗 Relación a **`users`** (Múltiple (Array)) |
| `payment_days` | `number` | No | - |
| `teso_mode` | `text` | No | - |
| `teso_params` | `json` | No | Objeto JSON o array estructurado |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |
| `book_type` | `text` | No | - |
| `pos_shift_id` | `relation` | No | 🔗 Relación a **`pos_shifts`** (Múltiple (Array)) |


### 📦 Colección: `tx_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2785691647`)
- **Total de Campos:** 14

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `tx_id` | `relation` | ✅ Sí | 🔗 Relación a **`transactions`** (Múltiple (Array) | CascadeDelete) |
| `account_id` | `relation` | ✅ Sí | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `debit` | `number` | No | - |
| `credit` | `number` | No | - |
| `description` | `text` | No | - |
| `line_order` | `number` | No | - |
| `cross_doc_ref` | `text` | No | - |
| `third_party_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |
| `cost_center_id` | `relation` | No | 🔗 Relación a **`cost_centers`** (Uno (1:1 o N:1)) |
| `cross_doc_date` | `text` | No | - |
| `due_date` | `text` | No | - |
| `is_iva_cost` | `bool` | No | - |


### 📦 Colección: `financial_notes`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_506896689`)
- **Total de Campos:** 10

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `periodo` | `text` | ✅ Sí | - |
| `nota_num` | `number` | ✅ Sí | - |
| `tipo_informe` | `select` | ✅ Sí | Valores: [`ESF`, `ER`] [Selección Múltiple] |
| `titulo` | `text` | ✅ Sí | - |
| `cuenta_codigo` | `text` | No | - |
| `contenido` | `text` | No | - |
| `sugerido` | `text` | No | - |
| `revisado` | `bool` | No | - |
| `updated_by` | `relation` | No | 🔗 Relación a **`users`** (Múltiple (Array)) |


### 📦 Colección: `homologation_rules`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1124988449`)
- **Total de Campos:** 5

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `rule_type` | `select` | ✅ Sí | Valores: [`supplier`, `unspsc`, `keyword`] [Selección Múltiple] |
| `key_value` | `text` | ✅ Sí | - |
| `account_code` | `text` | ✅ Sí | - |
| `description` | `text` | No | - |


### 📦 Colección: `exogena_concepts`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3857520778`)
- **Total de Campos:** 5

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `account_ranges` | `text` | No | - |
| `format_type` | `select` | ✅ Sí | Valores: [`1001`, `1007`, `1008`, `1009`] [Selección Múltiple] |


### 📦 Colección: `agenda_vencimientos`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4049922820`)
- **Total de Campos:** 8

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `type` | `select` | ✅ Sí | Valores: [`cxp_proveedor`, `impuesto_dian_iva`, `impuesto_dian_retencion`, `exogena_dian`, `otro`, `cxp_importacion`, `cxc_cliente`] [Selección Múltiple] |
| `title` | `text` | ✅ Sí | - |
| `description` | `text` | No | - |
| `due_date` | `text` | ✅ Sí | - |
| `amount` | `number` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`pendiente`, `programado`, `pagado`, `vencido`] [Selección Múltiple] |
| `assigned_roles` | `json` | No | Objeto JSON o array estructurado |


## 8. FACTURACIÓN ELECTRÓNICA Y RESOLUCIONES DIAN

### 📦 Colección: `dian_resolutions`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4258913350`)
- **Total de Campos:** 11

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `document_type` | `select` | ✅ Sí | Valores: [`FV`, `POS`, `DS`, `NE`, `NC`, `ND`, `NDS`] [Selección Múltiple] |
| `prefix` | `text` | ✅ Sí | - |
| `resolution_number` | `text` | ✅ Sí | - |
| `resolution_date` | `text` | ✅ Sí | - |
| `number_from` | `number` | ✅ Sí | - |
| `number_to` | `number` | ✅ Sí | - |
| `current_number` | `number` | No | - |
| `expiration_date` | `text` | ✅ Sí | - |
| `pos_register_id` | `relation` | No | 🔗 Relación a **`pos_registers`** (Múltiple (Array)) |
| `active` | `bool` | No | - |


### 📦 Colección: `electronic_documents`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1439117088`)
- **Total de Campos:** 24

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `uuid` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `document_type` | `select` | ✅ Sí | Valores: [`invoice_purchase`, `invoice_sale`, `credit_note`, `debit_note`, `support_document`, `payroll`, `payroll_adjust`] [Selección Múltiple] |
| `status` | `select` | ✅ Sí | Valores: [`pendiente`, `homologado`, `contabilizado`, `error`] [Selección Múltiple] |
| `issue_date` | `text` | ✅ Sí | - |
| `reception_date` | `text` | No | - |
| `supplier_nit` | `text` | ✅ Sí | - |
| `supplier_name` | `text` | ✅ Sí | - |
| `customer_nit` | `text` | ✅ Sí | - |
| `customer_name` | `text` | ✅ Sí | - |
| `subtotal` | `number` | ✅ Sí | - |
| `tax_amount` | `number` | No | - |
| `total` | `number` | ✅ Sí | - |
| `xml_file` | `file` | No | Archivo / Binario (text/xml, application/xml) |
| `pdf_file` | `file` | No | Archivo / Binario (application/pdf, image/*) |
| `processed` | `bool` | No | - |
| `transaction_id` | `relation` | No | 🔗 Relación a **`transactions`** (Uno (1:1 o N:1)) |
| `hash` | `text` | No | - |
| `import_date` | `text` | ✅ Sí | - |
| `notes` | `text` | No | - |
| `user_id` | `relation` | ✅ Sí | 🔗 Relación a **`users`** (Uno (1:1 o N:1)) |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |
| `supplier_details` | `text` | No | - |


### 📦 Colección: `electronic_document_items`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4224488888`)
- **Total de Campos:** 8

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `document_id` | `relation` | ✅ Sí | 🔗 Relación a **`electronic_documents`** (Uno (1:1 o N:1) | CascadeDelete) |
| `code` | `text` | No | - |
| `unspsc_code` | `text` | No | - |
| `description` | `text` | ✅ Sí | - |
| `qty` | `number` | ✅ Sí | - |
| `price` | `number` | ✅ Sí | - |
| `subtotal` | `number` | ✅ Sí | - |


### 📦 Colección: `electronic_document_taxes`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3629964045`)
- **Total de Campos:** 6

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `document_id` | `relation` | ✅ Sí | 🔗 Relación a **`electronic_documents`** (Uno (1:1 o N:1) | CascadeDelete) |
| `tax_type` | `select` | ✅ Sí | Valores: [`iva`, `ica`, `inc`, `retefuente`, `reteiva`, `reteica`] [Selección Múltiple] |
| `rate` | `number` | ✅ Sí | - |
| `base` | `number` | ✅ Sí | - |
| `amount` | `number` | ✅ Sí | - |


### 📦 Colección: `einvoice_docs`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3722157315`)
- **Total de Campos:** 9

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `tx_id` | `relation` | ✅ Sí | 🔗 Relación a **`transactions`** (Múltiple (Array)) |
| `cufe` | `text` | No | - |
| `status` | `select` | No | Valores: [`pendiente`, `enviada`, `aceptada`, `rechazada`] [Selección Múltiple] |
| `dian_response` | `text` | No | - |
| `xml_content` | `text` | No | - |
| `sent_at` | `text` | No | - |
| `ftech_transaction_id` | `text` | No | - |
| `zip_filename` | `text` | No | - |


## 9. TESORERÍA, BANCOS Y CARTERA (CXC / PAGOS)

### 📦 Colección: `bank_accounts`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_314358106`)
- **Total de Campos:** 7

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `bank` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `account_id` | `relation` | ✅ Sí | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `currency` | `text` | No | - |
| `active` | `bool` | No | - |


### 📦 Colección: `bank_movements`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1814386223`)
- **Total de Campos:** 10

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `bank_account_id` | `relation` | ✅ Sí | 🔗 Relación a **`bank_accounts`** (Múltiple (Array)) |
| `date` | `text` | ✅ Sí | - |
| `description` | `text` | No | - |
| `debit` | `number` | No | - |
| `credit` | `number` | No | - |
| `balance` | `number` | No | - |
| `ref` | `text` | No | - |
| `reconciled` | `bool` | No | - |
| `tx_line_id` | `relation` | No | 🔗 Relación a **`tx_lines`** (Múltiple (Array)) |


### 📦 Colección: `payments`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_631030571`)
- **Total de Campos:** 5

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `invoice_id` | `relation` | ✅ Sí | 🔗 Relación a **`invoices`** (Uno (1:1 o N:1)) |
| `amount` | `number` | ✅ Sí | - |
| `payment_method` | `text` | ✅ Sí | - |
| `date` | `date` | ✅ Sí | - |


### 📦 Colección: `cash_concepts`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4214560803`)
- **Total de Campos:** 6

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `type` | `select` | ✅ Sí | Valores: [`egreso`, `recaudo`] [Selección Múltiple] |
| `account_id` | `relation` | ✅ Sí | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `description` | `text` | No | - |
| `active` | `bool` | No | - |


### 📦 Colección: `treasury_settings`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1098600856`)
- **Total de Campos:** 4

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `default_bank_account_id` | `relation` | No | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `default_cash_account_id` | `relation` | No | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `auto_rules` | `json` | No | Objeto JSON o array estructurado |


## 10. ACTIVOS FIJOS Y NIIF (NIC 16 / NIIF 16)

### 📦 Colección: `niif_assets`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1340922796`)
- **Total de Campos:** 29

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `cost` | `number` | ✅ Sí | - |
| `useful_life_niif` | `number` | ✅ Sí | - |
| `useful_life_fiscal` | `number` | ✅ Sí | - |
| `depreciation_method` | `select` | ✅ Sí | Valores: [`linea_recta`, `saldos_decrecientes`, `unidades_produccion`] [Selección Múltiple] |
| `residual_value` | `number` | No | - |
| `impairment` | `number` | No | - |
| `revaluation` | `number` | No | - |
| `location` | `text` | No | - |
| `active` | `bool` | No | - |
| `cost_center_id` | `relation` | No | 🔗 Relación a **`cost_centers`** (Uno (1:1 o N:1)) |
| `owner_id` | `relation` | No | 🔗 Relación a **`users`** (Uno (1:1 o N:1)) |
| `category_id` | `relation` | No | 🔗 Relación a **`niif_asset_categories`** (Uno (1:1 o N:1)) |
| `parent_asset_id` | `relation` | No | 🔗 Relación a **`niif_assets`** (Uno (1:1 o N:1)) |
| `status` | `select` | No | Valores: [`active`, `suspended`, `in_repair`, `retired`, `sold`, `lost`, `obsolete`] [Selección Múltiple] |
| `brand` | `text` | No | - |
| `model` | `text` | No | - |
| `serial_number` | `text` | No | - |
| `color` | `text` | No | - |
| `manufacturer` | `text` | No | - |
| `provider_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `invoice_number` | `text` | No | - |
| `invoice_date` | `text` | No | - |
| `purchase_date` | `text` | No | - |
| `start_service_date` | `text` | No | - |
| `qr_code` | `text` | No | - |
| `photo_url` | `text` | No | - |


### 📦 Colección: `niif_asset_categories`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4118764413`)
- **Total de Campos:** 16

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `useful_life_niif_default` | `number` | No | - |
| `useful_life_fiscal_default` | `number` | No | - |
| `depreciation_method_default` | `select` | No | Valores: [`linea_recta`, `saldos_decrecientes`, `unidades_produccion`] [Selección Múltiple] |
| `residual_value_percent_default` | `number` | No | - |
| `active` | `bool` | No | - |
| `account_asset_id` | `relation` | No | 🔗 Relación a **`accounts`** (Uno (1:1 o N:1)) |
| `account_depr_accum_id` | `relation` | No | 🔗 Relación a **`accounts`** (Uno (1:1 o N:1)) |
| `account_depr_expense_id` | `relation` | No | 🔗 Relación a **`accounts`** (Uno (1:1 o N:1)) |
| `account_impairment_accum_id` | `relation` | No | 🔗 Relación a **`accounts`** (Uno (1:1 o N:1)) |
| `account_impairment_expense_id` | `relation` | No | 🔗 Relación a **`accounts`** (Uno (1:1 o N:1)) |
| `account_revaluation_id` | `relation` | No | 🔗 Relación a **`accounts`** (Uno (1:1 o N:1)) |
| `account_disposal_gain_id` | `relation` | No | 🔗 Relación a **`accounts`** (Uno (1:1 o N:1)) |
| `account_disposal_loss_id` | `relation` | No | 🔗 Relación a **`accounts`** (Uno (1:1 o N:1)) |


### 📦 Colección: `niif_asset_events`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_739159810`)
- **Total de Campos:** 14

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `date` | `text` | ✅ Sí | - |
| `event_type` | `select` | ✅ Sí | Valores: [`traslado`, `mejora`, `revaluacion`, `deterioro`, `baja`] [Selección Múltiple] |
| `description` | `text` | No | - |
| `amount` | `number` | No | - |
| `previous_value` | `number` | No | - |
| `new_value` | `number` | No | - |
| `location_from` | `text` | No | - |
| `location_to` | `text` | No | - |
| `cost_center_from_id` | `relation` | No | 🔗 Relación a **`cost_centers`** (Uno (1:1 o N:1)) |
| `cost_center_to_id` | `relation` | No | 🔗 Relación a **`cost_centers`** (Uno (1:1 o N:1)) |
| `owner_from_id` | `relation` | No | 🔗 Relación a **`users`** (Uno (1:1 o N:1)) |
| `owner_to_id` | `relation` | No | 🔗 Relación a **`users`** (Uno (1:1 o N:1)) |
| `transaction_id` | `relation` | No | 🔗 Relación a **`transactions`** (Uno (1:1 o N:1)) |


### 📦 Colección: `niif_asset_inventories`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4269731531`)
- **Total de Campos:** 6

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `date` | `text` | ✅ Sí | - |
| `description` | `text` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`open`, `closed`] [Selección Múltiple] |
| `results` | `json` | No | Objeto JSON o array estructurado |


### 📦 Colección: `niif_leases`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2914044310`)
- **Total de Campos:** 12

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `contract_number` | `text` | ✅ Sí | - |
| `description` | `text` | ✅ Sí | - |
| `start_date` | `text` | ✅ Sí | - |
| `term_months` | `number` | ✅ Sí | - |
| `monthly_canon` | `number` | ✅ Sí | - |
| `implicit_interest_rate` | `number` | ✅ Sí | - |
| `right_of_use_value` | `number` | No | - |
| `lease_liability_value` | `number` | No | - |
| `amortization_table` | `json` | No | Objeto JSON o array estructurado |
| `active` | `bool` | No | - |
| `lessor_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |


### 📦 Colección: `niif_policies`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2022492430`)
- **Total de Campos:** 16

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `standard` | `text` | No | - |
| `objective` | `text` | No | - |
| `scope` | `text` | No | - |
| `recognition` | `text` | No | - |
| `initial_measurement` | `text` | No | - |
| `subsequent_measurement` | `text` | No | - |
| `derecognition` | `text` | No | - |
| `disclosures` | `text` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`borrador`, `aprobada`] [Selección Múltiple] |
| `version` | `text` | No | - |
| `date` | `text` | No | - |
| `owner` | `text` | No | - |
| `history` | `json` | No | Objeto JSON o array estructurado |


### 📦 Colección: `niif_settings`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2101532165`)
- **Total de Campos:** 11

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `grupo_empresa` | `select` | ✅ Sí | Valores: [`Grupo 1`, `Grupo 2`, `Grupo 3`] [Selección Múltiple] |
| `moneda_funcional` | `text` | ✅ Sí | - |
| `moneda_presentacion` | `text` | ✅ Sí | - |
| `fecha_transicion` | `text` | No | - |
| `fecha_adopcion` | `text` | No | - |
| `metodo_depreciacion` | `text` | No | - |
| `metodo_inventarios` | `text` | No | - |
| `materialidad` | `number` | No | - |
| `politicas_aprobadas` | `bool` | No | - |
| `params_adicionales` | `json` | No | Objeto JSON o array estructurado |


## 11. NÓMINA ELECTRÓNICA Y RECURSOS HUMANOS

### 📦 Colección: `payroll_periods`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2682020231`)
- **Total de Campos:** 7

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `date_from` | `text` | ✅ Sí | - |
| `date_to` | `text` | ✅ Sí | - |
| `status` | `select` | No | Valores: [`draft`, `approved`, `paid`] [Selección Múltiple] |
| `tx_id` | `relation` | No | 🔗 Relación a **`transactions`** (Múltiple (Array)) |
| `branch_id` | `relation` | No | 🔗 Relación a **`branches`** (Uno (1:1 o N:1)) |


### 📦 Colección: `payroll_documents`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2384597020`)
- **Total de Campos:** 8

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `employee_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Múltiple (Array) | CascadeDelete) |
| `category` | `select` | ✅ Sí | Valores: [`HOJA_VIDA`, `ESTUDIOS`, `SEGURIDAD_SOCIAL`, `EXAMEN_MEDICO`, `HISTORIA_CLINICA`, `OTRO`] [Selección Múltiple] |
| `file` | `file` | ✅ Sí | Archivo / Binario |
| `name` | `text` | ✅ Sí | - |
| `date` | `text` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


### 📦 Colección: `payroll_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2766340730`)
- **Total de Campos:** 24

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `period_id` | `relation` | ✅ Sí | 🔗 Relación a **`payroll_periods`** (Múltiple (Array) | CascadeDelete) |
| `employee_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `salary_base` | `number` | ✅ Sí | - |
| `days_worked` | `number` | No | - |
| `overtime` | `number` | No | - |
| `transport_allowance` | `number` | No | - |
| `deduction_health` | `number` | No | - |
| `deduction_pension` | `number` | No | - |
| `deduction_other` | `number` | No | - |
| `net_pay` | `number` | No | - |
| `employer_health` | `number` | No | - |
| `employer_pension` | `number` | No | - |
| `employer_arl` | `number` | No | - |
| `sena` | `number` | No | - |
| `icbf` | `number` | No | - |
| `caja_comp` | `number` | No | - |
| `cesantias` | `number` | No | - |
| `intereses_ces` | `number` | No | - |
| `prima` | `number` | No | - |
| `vacaciones` | `number` | No | - |
| `notes` | `text` | No | - |
| `solidarity_fund` | `number` | No | - |
| `withholding_tax` | `number` | No | - |


### 📦 Colección: `payroll_novelties`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2926512047`)
- **Total de Campos:** 13

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `period_id` | `relation` | ✅ Sí | 🔗 Relación a **`payroll_periods`** (Múltiple (Array) | CascadeDelete) |
| `employee_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `type` | `text` | ✅ Sí | - |
| `date_from` | `text` | ✅ Sí | - |
| `date_to` | `text` | No | - |
| `qty` | `number` | No | - |
| `amount` | `number` | No | - |
| `support_number` | `text` | No | - |
| `description` | `text` | No | - |
| `status` | `select` | No | Valores: [`draft`, `processed`] [Selección Múltiple] |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


### 📦 Colección: `electronic_payrolls`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2085274278`)
- **Total de Campos:** 23

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `periodo_id` | `relation` | No | 🔗 Relación a **`payroll_periods`** (Múltiple (Array)) |
| `ano` | `number` | ✅ Sí | - |
| `mes` | `number` | ✅ Sí | - |
| `tipo_ambiente` | `text` | No | - |
| `numero_envio` | `number` | No | - |
| `fecha_envio` | `text` | No | - |
| `xml_generado` | `text` | No | - |
| `estado_dian` | `text` | No | - |
| `cufe` | `text` | No | - |
| `total_devengos` | `number` | No | - |
| `total_deducciones` | `number` | No | - |
| `total_neto` | `number` | No | - |
| `total_empleador` | `number` | No | - |
| `total_empleados` | `number` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `employee_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `consecutivo` | `number` | No | - |
| `prefijo` | `text` | No | - |
| `ftech_transaction_id` | `text` | No | - |
| `dian_response` | `text` | No | - |
| `pdf_base64` | `text` | No | - |


## 12. COMERCIO EXTERIOR E IMPORTACIONES (D.O.)

### 📦 Colección: `imports`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3922105078`)
- **Total de Campos:** 50

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `supplier_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `status` | `select` | ✅ Sí | Valores: [`planeacion`, `transito`, `nacionalizacion`, `recibido`, `anulado`] [Selección Múltiple] |
| `incoterm` | `select` | No | Valores: [`FOB`, `CIF`, `EXW`, `CFR`, `CIP`, `CPT`, `DAP`, `DPU`, `DDP`, `FAS`, `FCA`] [Selección Múltiple] |
| `bl_awb` | `text` | No | - |
| `bl_document` | `file` | No | Archivo / Binario (application/pdf, image/*) |
| `transport_type` | `select` | No | Valores: [`maritimo`, `aereo`, `terrestre`, `courier`] [Selección Múltiple] |
| `estimated_arrival` | `text` | No | - |
| `notes` | `text` | No | - |
| `currency` | `select` | ✅ Sí | Valores: [`USD`, `COP`, `EUR`, `CNY`] [Selección Múltiple] |
| `exchange_rate` | `number` | ✅ Sí | - |
| `fob_total` | `number` | No | - |
| `freight_cost` | `number` | No | - |
| `insurance_cost` | `number` | No | - |
| `arancel_total` | `number` | No | - |
| `gastos_nacionalizacion` | `number` | No | - |
| `transporte_nacional` | `number` | No | - |
| `otros_gastos` | `number` | No | - |
| `total_gastos_cif` | `number` | No | - |
| `total_gastos_locales` | `number` | No | - |
| `total` | `number` | No | - |
| `purchase_invoice_id` | `relation` | No | 🔗 Relación a **`purchase_invoices`** (Uno (1:1 o N:1)) |
| `date_created` | `text` | ✅ Sí | - |
| `user_id` | `relation` | ✅ Sí | 🔗 Relación a **`users`** (Uno (1:1 o N:1)) |
| `tx_fob_id` | `relation` | No | 🔗 Relación a **`transactions`** (Uno (1:1 o N:1)) |
| `tx_freight_id` | `relation` | No | 🔗 Relación a **`transactions`** (Uno (1:1 o N:1)) |
| `tx_insurance_id` | `relation` | No | 🔗 Relación a **`transactions`** (Uno (1:1 o N:1)) |
| `tx_customs_id` | `relation` | No | 🔗 Relación a **`transactions`** (Uno (1:1 o N:1)) |
| `tx_local_carrier_id` | `relation` | No | 🔗 Relación a **`transactions`** (Uno (1:1 o N:1)) |
| `tx_local_other_id` | `relation` | No | 🔗 Relación a **`transactions`** (Uno (1:1 o N:1)) |
| `freight_supplier_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `insurance_supplier_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `customs_supplier_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `local_carrier_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `local_other_supplier_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `supplier_invoice_num` | `text` | No | - |
| `freight_invoice_num` | `text` | No | - |
| `insurance_invoice_num` | `text` | No | - |
| `customs_invoice_num` | `text` | No | - |
| `local_carrier_invoice_num` | `text` | No | - |
| `local_other_invoice_num` | `text` | No | - |
| `vuce_registro_num` | `text` | No | - |
| `dian_declaracion_num` | `text` | No | - |
| `dian_declaracion_date` | `text` | No | - |
| `dian_levante_date` | `text` | No | - |
| `dian_trm` | `number` | No | - |
| `modalidad_importacion` | `select` | No | Valores: [`ORDINARIA`, `FRANQUICIA`, `TEMPORAL_REEXP`, `TEMPORAL_PERF`, `ENSAMBLE`, `URGENTES`] [Selección Múltiple] |
| `canal_inspeccion` | `select` | No | Valores: [`AUTOMATICO`, `DOCUMENTAL`, `FISICO`, `NO_INTRUSIVO`] [Selección Múltiple] |
| `proration_method` | `select` | No | Valores: [`FOB_VALUE`, `GROSS_WEIGHT`, `CUBIC_VOLUME`] [Selección Múltiple] |


### 📦 Colección: `import_invoices`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2915859709`)
- **Total de Campos:** 15

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `import_id` | `relation` | ✅ Sí | 🔗 Relación a **`imports`** (Uno (1:1 o N:1) | CascadeDelete) |
| `supplier_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `invoice_number` | `text` | ✅ Sí | - |
| `invoice_date` | `text` | No | - |
| `currency` | `select` | ✅ Sí | Valores: [`USD`, `COP`, `EUR`, `CNY`] [Selección Múltiple] |
| `exchange_rate` | `number` | No | - |
| `fob_amount` | `number` | No | - |
| `fob_amount_cop` | `number` | No | - |
| `payment_due_date` | `text` | No | - |
| `notes` | `text` | No | - |
| `invoice_file` | `file` | No | Archivo / Binario (application/pdf, image/*) |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `tx_fob_id` | `relation` | No | 🔗 Relación a **`transactions`** (Uno (1:1 o N:1)) |


### 📦 Colección: `import_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4123813726`)
- **Total de Campos:** 29

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `import_id` | `relation` | ✅ Sí | 🔗 Relación a **`imports`** (Uno (1:1 o N:1) | CascadeDelete) |
| `product_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Uno (1:1 o N:1)) |
| `qty` | `number` | ✅ Sí | - |
| `fob_price` | `number` | ✅ Sí | - |
| `arancel_rate` | `number` | No | - |
| `arancel_amount` | `number` | No | - |
| `iva_rate` | `number` | No | - |
| `iva_amount` | `number` | No | - |
| `prorated_cost` | `number` | No | - |
| `unit_cost_cop` | `number` | No | - |
| `total_cop` | `number` | No | - |
| `manifest_number` | `text` | No | - |
| `manifest_file` | `file` | No | Archivo / Binario (application/pdf, image/*) |
| `line_order` | `number` | No | - |
| `pais_origen` | `text` | No | - |
| `certificado_origen_num` | `text` | No | - |
| `posicion_arancelaria` | `text` | No | - |
| `peso_neto_total` | `number` | No | - |
| `peso_bruto_total` | `number` | No | - |
| `largo_cm` | `number` | No | - |
| `ancho_cm` | `number` | No | - |
| `alto_cm` | `number` | No | - |
| `cubic_meters_total` | `number` | No | - |
| `supplier_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `import_invoice_id` | `relation` | No | 🔗 Relación a **`import_invoices`** (Uno (1:1 o N:1)) |
| `lot_number` | `text` | No | - |
| `manufacturing_date` | `text` | No | - |
| `expiry_date` | `text` | No | - |


### 📦 Colección: `import_pallet_configs`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2644222426`)
- **Total de Campos:** 16

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `import_id` | `relation` | ✅ Sí | 🔗 Relación a **`imports`** (Uno (1:1 o N:1) | CascadeDelete) |
| `product_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Uno (1:1 o N:1)) |
| `import_line_id` | `relation` | No | 🔗 Relación a **`import_lines`** (Uno (1:1 o N:1) | CascadeDelete) |
| `pallet_qty` | `number` | ✅ Sí | - |
| `boxes_per_pallet` | `number` | ✅ Sí | - |
| `units_per_box` | `number` | ✅ Sí | - |
| `total_boxes` | `number` | No | - |
| `total_units` | `number` | No | - |
| `pallet_type` | `select` | No | Valores: [`ESTANDAR_120x100`, `EURO_120x80`, `ESPECIAL`, `PISO_SUELTO`] [Selección Múltiple] |
| `height_cm` | `number` | No | - |
| `gross_weight_kg` | `number` | No | - |
| `lot_number` | `text` | No | - |
| `notes` | `text` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


## 13. LOGÍSTICA, DISTRIBUCIÓN Y DESPACHOS

### 📦 Colección: `logistica_vehicles`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3392905230`)
- **Total de Campos:** 14

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `plate` | `text` | ✅ Sí | - |
| `driver` | `text` | ✅ Sí | - |
| `capacity` | `number` | ✅ Sí | - |
| `status` | `select` | ✅ Sí | Valores: [`DISPONIBLE`, `EN_RUTA`, `MANTENIMIENTO`] [Selección Múltiple] |
| `notes` | `text` | No | - |
| `active` | `bool` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `transportista_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `licencia_vence` | `text` | No | - |
| `soat_vence` | `text` | No | - |
| `tecnomecanica_vence` | `text` | No | - |
| `poliza_rc_vence` | `text` | No | - |


### 📦 Colección: `logistica_deliveries`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4251913776`)
- **Total de Campos:** 16

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `client_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `vehicle_id` | `relation` | No | 🔗 Relación a **`logistica_vehicles`** (Múltiple (Array)) |
| `address` | `text` | ✅ Sí | - |
| `date` | `text` | ✅ Sí | - |
| `status` | `select` | ✅ Sí | Valores: [`PENDIENTE`, `DESPACHADO`, `ENTREGADO`, `DEVUELTO`, `CANCELADO`] [Selección Múltiple] |
| `weight` | `number` | No | - |
| `notes` | `text` | No | - |
| `items` | `text` | No | - |
| `sales_order_id` | `relation` | No | 🔗 Relación a **`sales_orders`** (Múltiple (Array)) |
| `invoice_id` | `relation` | No | 🔗 Relación a **`invoices`** (Múltiple (Array)) |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `billing_status` | `select` | No | Valores: [`PENDIENTE_FACTURAR`, `FACTURADO`, `NO_APLICA`] [Selección Múltiple] |
| `delivery_type` | `select` | No | Valores: [`DIRECTO`, `DESDE_PEDIDO`, `DESDE_IMPORTACION`] [Selección Múltiple] |


### 📦 Colección: `logistica_delivery_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_267823855`)
- **Total de Campos:** 14

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `delivery_id` | `relation` | ✅ Sí | 🔗 Relación a **`logistica_deliveries`** (Uno (1:1 o N:1) | CascadeDelete) |
| `line_order` | `number` | No | - |
| `product_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Uno (1:1 o N:1)) |
| `invoice_line_id` | `relation` | No | 🔗 Relación a **`invoice_lines`** (Uno (1:1 o N:1)) |
| `reservation_line_id` | `relation` | No | 🔗 Relación a **`sales_reservation_lines`** (Uno (1:1 o N:1)) |
| `qty_planned` | `number` | ✅ Sí | - |
| `qty_delivered` | `number` | No | - |
| `notes` | `text` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |
| `boxes_qty` | `number` | No | - |
| `lot_id` | `relation` | No | 🔗 Relación a **`inventory_lots`** (Uno (1:1 o N:1)) |
| `pallet_id` | `relation` | No | 🔗 Relación a **`inventory_pallets`** (Uno (1:1 o N:1)) |


## 14. MÓDULO VERTICAL: PROPIEDAD HORIZONTAL (PH)

### 📦 Colección: `ph_properties`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4259671506`)
- **Total de Campos:** 14

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `unit_type` | `select` | ✅ Sí | Valores: [`APARTAMENTO`, `PARQUEADERO`, `DEPOSITO`, `LOCAL`, `CASA`, `OFICINA`, `OTRO`] [Selección Múltiple] |
| `floor` | `text` | No | - |
| `tower` | `text` | No | - |
| `area_m2` | `number` | No | - |
| `coef_participacion` | `number` | No | - |
| `owner_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `occupant_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `notes` | `text` | No | - |
| `active` | `bool` | No | - |
| `apartment` | `text` | No | - |
| `admin_fee` | `number` | No | - |


### 📦 Colección: `ph_budgets`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3238548894`)
- **Total de Campos:** 5

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `year` | `number` | ✅ Sí | - |
| `status` | `select` | ✅ Sí | Valores: [`draft`, `approved`, `archived`] [Selección Múltiple] |
| `total_amount` | `number` | No | - |


### 📦 Colección: `ph_budget_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1903728781`)
- **Total de Campos:** 5

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `budget_id` | `relation` | ✅ Sí | 🔗 Relación a **`ph_budgets`** (Uno (1:1 o N:1)) |
| `account_id` | `relation` | ✅ Sí | 🔗 Relación a **`accounts`** (Uno (1:1 o N:1)) |
| `annual_amount` | `number` | ✅ Sí | - |
| `monthly_distribution` | `json` | No | Objeto JSON o array estructurado |


### 📦 Colección: `ph_billing_concepts`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_446239205`)
- **Total de Campos:** 9

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `description` | `text` | No | - |
| `amount` | `number` | ✅ Sí | - |
| `is_variable` | `bool` | No | - |
| `applies_coef` | `bool` | No | - |
| `account_id` | `relation` | No | 🔗 Relación a **`accounts`** (Múltiple (Array)) |
| `active` | `bool` | No | - |


### 📦 Colección: `ph_invoices`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_92469940`)
- **Total de Campos:** 11

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `period` | `text` | ✅ Sí | - |
| `property_id` | `relation` | ✅ Sí | 🔗 Relación a **`ph_properties`** (Múltiple (Array)) |
| `date` | `text` | ✅ Sí | - |
| `due_date` | `text` | No | - |
| `subtotal` | `number` | No | - |
| `total` | `number` | No | - |
| `status` | `select` | No | Valores: [`draft`, `posted`, `paid`, `voided`] [Selección Múltiple] |
| `tx_id` | `relation` | No | 🔗 Relación a **`transactions`** (Múltiple (Array)) |
| `notes` | `text` | No | - |


### 📦 Colección: `ph_invoice_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2889165415`)
- **Total de Campos:** 7

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `invoice_id` | `relation` | ✅ Sí | 🔗 Relación a **`ph_invoices`** (Múltiple (Array) | CascadeDelete) |
| `concept_id` | `relation` | No | 🔗 Relación a **`ph_billing_concepts`** (Múltiple (Array)) |
| `description` | `text` | ✅ Sí | - |
| `amount` | `number` | ✅ Sí | - |
| `line_order` | `number` | No | - |
| `account_code` | `text` | No | - |


### 📦 Colección: `ph_individual_charges`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2978640734`)
- **Total de Campos:** 10

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `property_id` | `relation` | No | 🔗 Relación a **`ph_properties`** (Múltiple (Array)) |
| `description` | `text` | No | - |
| `amount` | `number` | No | - |
| `period` | `text` | No | - |
| `notes` | `text` | No | - |
| `name` | `text` | No | - |
| `account_code` | `text` | No | - |
| `active` | `bool` | No | - |
| `code` | `text` | No | - |


### 📦 Colección: `ph_common_areas`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2321549435`)
- **Total de Campos:** 9

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `description` | `text` | No | - |
| `capacity` | `number` | No | - |
| `min_hours` | `number` | No | - |
| `max_hours` | `number` | No | - |
| `rules` | `text` | No | - |
| `active` | `bool` | No | - |


### 📦 Colección: `ph_reservations`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1428497364`)
- **Total de Campos:** 9

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `area_id` | `relation` | ✅ Sí | 🔗 Relación a **`ph_common_areas`** (Múltiple (Array)) |
| `property_id` | `relation` | ✅ Sí | 🔗 Relación a **`ph_properties`** (Múltiple (Array)) |
| `date` | `text` | ✅ Sí | - |
| `time_from` | `text` | ✅ Sí | - |
| `time_to` | `text` | ✅ Sí | - |
| `status` | `select` | No | Valores: [`pending`, `confirmed`, `cancelled`] [Selección Múltiple] |
| `attendees` | `number` | No | - |
| `notes` | `text` | No | - |


### 📦 Colección: `ph_pqrs`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1421491355`)
- **Total de Campos:** 13

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `property_id` | `relation` | No | 🔗 Relación a **`ph_properties`** (Múltiple (Array)) |
| `pqrs_type` | `select` | ✅ Sí | Valores: [`PETICION`, `QUEJA`, `RECLAMO`, `SUGERENCIA`, `FELICITACION`] [Selección Múltiple] |
| `priority` | `select` | No | Valores: [`baja`, `media`, `alta`] [Selección Múltiple] |
| `subject` | `text` | ✅ Sí | - |
| `description` | `text` | ✅ Sí | - |
| `status` | `select` | No | Valores: [`open`, `in_process`, `resolved`, `closed`] [Selección Múltiple] |
| `response` | `text` | No | - |
| `opened_at` | `text` | No | - |
| `closed_at` | `text` | No | - |
| `assigned_to` | `text` | No | - |
| `evidences` | `file` | No | Archivo / Binario (image/*, application/pdf, text/plain) |


## 15. MÓDULO VERTICAL: INMOBILIARIA

### 📦 Colección: `inmo_properties`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1451450202`)
- **Total de Campos:** 27

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `code` | `text` | ✅ Sí | - |
| `title` | `text` | ✅ Sí | - |
| `type` | `select` | ✅ Sí | Valores: [`CASA`, `APARTAMENTO`, `LOCAL`, `BODEGA`, `OFICINA`, `LOTE`, `OTRO`] [Selección Múltiple] |
| `address` | `text` | No | - |
| `city` | `text` | No | - |
| `owner_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `rental_price` | `number` | No | - |
| `sale_price` | `number` | No | - |
| `commission_rate` | `number` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`DISPONIBLE`, `ARRENDADO`, `VENDIDO`, `MANTENIMIENTO`] [Selección Múltiple] |
| `notes` | `text` | No | - |
| `active` | `bool` | No | - |
| `neighborhood` | `text` | No | - |
| `social_stratum` | `number` | No | - |
| `area_sqm` | `number` | No | - |
| `rooms` | `number` | No | - |
| `bathrooms` | `number` | No | - |
| `parking_spaces` | `number` | No | - |
| `admon_price` | `number` | No | - |
| `year_built` | `number` | No | - |
| `has_elevator` | `bool` | No | - |
| `has_pool` | `bool` | No | - |
| `has_gym` | `bool` | No | - |
| `has_balcony` | `bool` | No | - |
| `has_storage` | `bool` | No | - |
| `pet_friendly` | `bool` | No | - |


### 📦 Colección: `inmo_contracts`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4065969623`)
- **Total de Campos:** 19

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `property_id` | `relation` | No | 🔗 Relación a **`inmo_properties`** (Múltiple (Array)) |
| `tenant_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Múltiple (Array)) |
| `start_date` | `text` | ✅ Sí | - |
| `end_date` | `text` | No | - |
| `monthly_rent` | `number` | ✅ Sí | - |
| `increment_percentage` | `number` | No | - |
| `status` | `select` | ✅ Sí | Valores: [`VIGENTE`, `FINALIZADO`, `SUSPENDIDO`] [Selección Múltiple] |
| `notes` | `text` | No | - |
| `active` | `bool` | No | - |
| `type` | `select` | ✅ Sí | Valores: [`EMITIDO`, `RECIBIDO`] [Selección Múltiple] |
| `description` | `text` | No | - |
| `term_months` | `number` | No | - |
| `implicit_interest_rate` | `number` | No | - |
| `right_of_use_value` | `number` | No | - |
| `lease_liability_value` | `number` | No | - |
| `amortization_table` | `json` | No | Objeto JSON o array estructurado |
| `lessor_id` | `relation` | No | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |


### 📦 Colección: `inmo_invoices`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_3071274698`)
- **Total de Campos:** 16

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `number` | `text` | ✅ Sí | - |
| `period` | `text` | ✅ Sí | - |
| `contract_id` | `relation` | ✅ Sí | 🔗 Relación a **`inmo_contracts`** (Múltiple (Array)) |
| `date` | `text` | ✅ Sí | - |
| `due_date` | `text` | No | - |
| `rent_amount` | `number` | ✅ Sí | - |
| `other_amount` | `number` | No | - |
| `commission_amount` | `number` | No | - |
| `net_to_owner` | `number` | No | - |
| `total` | `number` | ✅ Sí | - |
| `status` | `select` | ✅ Sí | Valores: [`draft`, `posted`, `paid`, `voided`] [Selección Múltiple] |
| `tx_id` | `relation` | No | 🔗 Relación a **`transactions`** (Múltiple (Array)) |
| `payout_tx_id` | `relation` | No | 🔗 Relación a **`transactions`** (Múltiple (Array)) |
| `notes` | `text` | No | - |
| `tax_amount` | `number` | No | - |


### 📦 Colección: `inmo_invoice_lines`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_179499240`)
- **Total de Campos:** 6

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `invoice_id` | `relation` | ✅ Sí | 🔗 Relación a **`inmo_invoices`** (Múltiple (Array) | CascadeDelete) |
| `description` | `text` | ✅ Sí | - |
| `amount` | `number` | ✅ Sí | - |
| `account_code` | `text` | No | - |
| `line_order` | `number` | No | - |


### 📦 Colección: `inmo_property_history`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4006801848`)
- **Total de Campos:** 7

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `property_id` | `relation` | ✅ Sí | 🔗 Relación a **`inmo_properties`** (Múltiple (Array) | CascadeDelete) |
| `event_type` | `select` | ✅ Sí | Valores: [`MANTENIMIENTO`, `MEJORA_ESTRUCTURAL`, `OTRO`] [Selección Múltiple] |
| `date` | `text` | ✅ Sí | - |
| `title` | `text` | ✅ Sí | - |
| `description` | `text` | No | - |
| `cost` | `number` | No | - |


## 16. MÓDULO VERTICAL: SERVICIOS, SPA Y VETERINARIA

### 📦 Colección: `pets`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2704641423`)
- **Total de Campos:** 8

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `name` | `text` | ✅ Sí | - |
| `owner_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `species` | `select` | ✅ Sí | Valores: [`PERRO`, `GATO`, `AVE`, `ROEDOR`, `REPTIL`, `OTRO`] |
| `breed` | `text` | No | - |
| `birthdate` | `text` | No | - |
| `allergies` | `text` | No | - |
| `behavior_notes` | `text` | No | - |


### 📦 Colección: `appointments`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1037645436`)
- **Total de Campos:** 11

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `pet_id` | `relation` | No | 🔗 Relación a **`pets`** (Uno (1:1 o N:1)) |
| `start_time` | `text` | ✅ Sí | - |
| `end_time` | `text` | ✅ Sí | - |
| `service_id` | `relation` | ✅ Sí | 🔗 Relación a **`products`** (Uno (1:1 o N:1)) |
| `status` | `select` | ✅ Sí | Valores: [`pending`, `in_progress`, `completed`, `cancelled`] |
| `notes` | `text` | No | - |
| `sales_order_id` | `relation` | No | 🔗 Relación a **`sales_orders`** (Uno (1:1 o N:1)) |
| `stylist_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `real_start_time` | `text` | No | - |
| `real_end_time` | `text` | No | - |


### 📦 Colección: `spa_clients`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1346741877`)
- **Total de Campos:** 9

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `client_id` | `relation` | ✅ Sí | 🔗 Relación a **`third_parties`** (Uno (1:1 o N:1)) |
| `skin_type` | `select` | No | Valores: [`GRASA`, `SECA`, `MIXTA`, `SENSIBLE`, `NORMAL`] |
| `allergies` | `text` | No | - |
| `medical_conditions` | `text` | No | - |
| `treatment_notes` | `text` | No | - |
| `birthdate` | `text` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


## 17. COLECCIONES INTERNAS / SISTEMA POCKETBASE

### 📦 Colección: `_authOrigins`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_4275539003`)
- **Total de Campos:** 6

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `collectionRef` | `text` | ✅ Sí | - |
| `recordRef` | `text` | ✅ Sí | - |
| `fingerprint` | `text` | ✅ Sí | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


### 📦 Colección: `_externalAuths`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2281828961`)
- **Total de Campos:** 7

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `collectionRef` | `text` | ✅ Sí | - |
| `recordRef` | `text` | ✅ Sí | - |
| `provider` | `text` | ✅ Sí | - |
| `providerId` | `text` | ✅ Sí | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


### 📦 Colección: `_mfas`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_2279338944`)
- **Total de Campos:** 6

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `collectionRef` | `text` | ✅ Sí | - |
| `recordRef` | `text` | ✅ Sí | - |
| `method` | `text` | ✅ Sí | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |


### 📦 Colección: `_otps`
- **Tipo PocketBase:** `base` (Colección ID: `pbc_1638494021`)
- **Total de Campos:** 7

| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |
| :--- | :--- | :---: | :--- |
| `id` | `text` | ✅ Sí | - |
| `collectionRef` | `text` | ✅ Sí | - |
| `recordRef` | `text` | ✅ Sí | - |
| `password` | `password` | ✅ Sí | - |
| `sentTo` | `text` | No | - |
| `created` | `autodate` | No | Timestamp automático del sistema |
| `updated` | `autodate` | No | Timestamp automático del sistema |

