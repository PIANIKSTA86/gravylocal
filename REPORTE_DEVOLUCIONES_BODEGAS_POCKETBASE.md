# Especificación Técnica de Integración: Módulo de Devoluciones, Averías y Gestión de Bodegas
**Sistema**: GRAVY ERP (Móvil Android <-> PocketBase <-> Aplicación de Escritorio)  
**Versión de Integración**: 2.9 (Mobile GRAVY Ventas - Build Octubre 2026)  
**Destinatarios**: Equipo de Desarrollo Desktop / Backend PocketBase  
**Fecha de Publicación**: 26 de Octubre de 2026  

---

## 1. Resumen Ejecutivo y Objetivo

El presente documento detalla la arquitectura de datos, colecciones de PocketBase, entidades locales (Room SQLite), payloads JSON y flujos de negocio implementados en la aplicación móvil **`mobileGRAVYventas`** para el módulo de **Solicitudes de Devolución, Averías de Mercancía y Gestión de Bodegas**.

El objetivo es garantizar la sincronización bidireccional y la paridad funcional con el ERP de escritorio (**`appescritorio_muestra`**), permitiendo que:
1. El asesor comercial en campo radique solicitudes de devolución física o averías con evidencia fotográfica y firma digital del cliente.
2. Dichas solicitudes se sincronicen en tiempo real con **PocketBase** bajo el estándar de notas de crédito en borrador (`is_credit_note = true`, `status = "draft"`).
3. El equipo de administración y bodega en el ERP de escritorio visualice, audite, apruebe o rechace las solicitudes e impacte el Kardex de inventario en la bodega designada.

---

## 2. Flujo Arquitectónico General

```
[ Asesor Móvil (Android) ]
       │
       ├─ Radica Devolución (Firma, Fotos, Bodega, Concepto DIAN, Avería Sí/No)
       ├─ Guarda en Room SQLite local (v10: sales_returns, sales_return_lines, warehouses)
       ▼
[ PocketBase Central Backend ]
       │
       ├─ 1. Colección `invoices`: Crea encabezado (status='draft', is_credit_note=true)
       ├─ 2. Colección `invoice_lines`: Registra ítems devueltos (is_loss=true/false, warehouse_id)
       ├─ 3. Colección `transaction_types`: Asocia tx_type_id='DEV' y avanza consecutivo atómico
       ├─ 4. Colección `settings`: Lee política de devolución (sales_settings_v2.refund_policy)
       ├─ 5. Colección `warehouses`: Consulta bodegas habilitadas (ej. Bodega Devoluciones)
       ▼
[ ERP de Escritorio (appescritorio_muestra) ]
       │
       ├─ Notificación / Bandeja de "Solicitudes de Devolución Pendientes"
       ├─ Inspección física y validación de averías (is_loss)
       └─ Aprobación final: Cambia status='completed', emite Nota Crédito DIAN e ingresa stock al Kardex
```

---

## 3. Colecciones de PocketBase: Esquema y Especificación

Para este módulo **no se requirió romper compatibilidad** ni crear colecciones redundantes; se reutilizó y estandarizó la arquitectura nativa del ERP GRAVY basada en comprobantes (`invoices`), renglones (`invoice_lines`), parametrización de comprobantes (`transaction_types`) y bodegas (`warehouses`).

---

### 3.1. Colección Principal: `invoices` (Encabezado de la Devolución)

La solicitud se almacena como un registro en la colección `invoices`, con bandera explícita de nota de crédito y estado preliminar.

| Campo | Tipo PB | Requerido | Descripción / Regla de Negocio |
| :--- | :--- | :--- | :--- |
| `id` | `text (15)` | **Sí** | ID alfanumérico generado por PocketBase o prefijado. |
| `number` | `text` | **Sí** | Consecutivo oficial según `transaction_types` (Ej: `DEV-00000001` o `DEV-202610-000001`). |
| `customer_id` | `relation` | **Sí** | Relación a la colección `third_parties` (Cliente que devuelve). |
| `warehouse_id` | `relation` | **Sí** | Relación a `warehouses` (Bodega de destino de la mercancía). |
| `seller_id` | `relation` | No | Relación a `third_parties` o asesor comercial que tramitó la solicitud. |
| `tx_type_id` | `relation` | **Sí** | Relación a `transaction_types` para el tipo comprobante `DEV`. |
| `is_credit_note`| `bool` | **Sí** | **`true`** para todas las solicitudes de devolución. |
| `is_loss` | `bool` | **Sí** | **`true`** si la devolución corresponde a avería/pérdida total; **`false`** si es mercancía apta. |
| `status` | `select` | **Sí** | **`"draft"`** (Borrador / Pendiente de revisión por auditoría en escritorio). |
| `dian_concept` | `select/text`| No | Código del concepto DIAN (ej. `"1"`, `"2"`, `"3"`, `"4"`, `"5"`). Ver sección 5. |
| `cross_doc_ref`| `text` | No | Número de factura original afectada (ej. `FAC-00012480`) o `"DEVOLUCION_LIBRE"`. |
| `parent_invoice_id`| `relation` | No | ID de la factura original en PocketBase si la devolución fue referenciada. |
| `date` | `text/date` | **Sí** | Fecha de radicación en formato `YYYY-MM-DD` (Zona Horaria Colombia UTC-5). |
| `payment_method` | `text` | No | `"CREDITO"` (genera saldo a favor en cartera para cruce de cuentas). |
| `subtotal` | `number` | **Sí** | Sumatoria antes de impuestos de los ítems devueltos. |
| `iva_total` | `number` | **Sí** | Total IVA de los ítems devueltos. |
| `total` | `number` | **Sí** | Monto total de la solicitud de devolución. |
| `payable_total`| `number` | No | Saldo aplicable (normalmente igual a `total`). |
| `notes` | `text` | No | Motivo de la devolución, observaciones del cliente y reporte técnico de avería. |
| `branch_id` | `relation` | No | Sucursal operativa (si aplica en arquitectura multi-sede). |

---

### 3.2. Colección de Renglones: `invoice_lines` (Detalle de Productos)

Cada producto incluido en la devolución se registra individualmente con su estado físico y bodega de reingreso.

| Campo | Tipo PB | Requerido | Descripción / Regla de Negocio |
| :--- | :--- | :--- | :--- |
| `id` | `text (15)` | **Sí** | Identificador de línea. |
| `invoice_id` | `relation` | **Sí** | Relación al encabezado en `invoices`. |
| `product_id` | `relation` | **Sí** | Relación al producto en `products`. |
| `warehouse_id` | `relation` | **Sí** | Bodega donde ingresará la mercancía física. |
| `qty` | `number` | **Sí** | Cantidad devuelta (número entero o decimal positivo). |
| `unit_price` | `number` | **Sí** | Precio unitario al que se reversa la venta. |
| `iva_rate` | `number` | **Sí** | Porcentaje de IVA del ítem (ej. `0.19`, `0.05` o `0.0`). |
| `iva_amount` | `number` | **Sí** | Valor liquidado de IVA (`qty * unit_price * iva_rate`). |
| `subtotal` | `number` | **Sí** | Valor neto de la línea (`qty * unit_price`). |
| `total` | `number` | **Sí** | Total de la línea con impuestos (`subtotal + iva_amount`). |
| `is_loss` | `bool` | **Sí** | **`true`**: Avería / Daño irreparable (aislar en cuarentena). **`false`**: Mercancía apta para reventa. |
| `description` | `text` | No | Nombre del producto o detalle de la avería. |
| `line_order` | `number` | No | Secuencia del ítem dentro del documento (1, 2, 3...). |

---

### 3.3. Colección de Parametrización: `transaction_types`

Permite que el sistema gestione de forma sincronizada el tipo de comprobante `DEV` entre móvil y escritorio:

| Atributo | Valor para Devoluciones | Descripción |
| :--- | :--- | :--- |
| `code` | `"DEV"` | Código mnemotécnico universal del tipo de comprobante. |
| `name` | `"Devolución de Ventas / Averías"` | Nombre descriptivo en el ERP. |
| `prefix` | `"DEV"` | Prefijo antepuesto al documento. |
| `numbering_mode` | `"continuous"` o `"period"` | Modo de numeración configurado por la empresa. |
| `consecutive` | `Int` (ej. `1`, `2`, `3`...) | Contador global cuando el modo es `continuous`. |
| `period_counters`| `json` (ej. `{"202610": 1}`) | Diccionario de contadores mensuales cuando el modo es `period`. |
| `active` | `true` | Habilitado para emisión. |

#### Formato de Numeración Oficial Implementado:
1. **Modo Continuo (`continuous`)**:
   - Formato: `${prefix}-${String(next).padStart(8, '0')}`
   - Ejemplo: **`DEV-00000001`**, **`DEV-00000002`** (8 dígitos numéricos).
2. **Modo Período Mensual (`period`)**:
   - Formato: `${prefix}-${AAAAMM}-${String(next).padStart(6, '0')}`
   - Ejemplo: **`DEV-202610-000001`** (6 dígitos numéricos precedidos del período).

---

### 3.4. Colección de Bodegas: `warehouses`

La aplicación móvil descarga el maestro de bodegas activas para permitir que el asesor seleccione a qué bodega física retornará la mercancía o preseleccionar la bodega de averías/devoluciones.

| Campo | Tipo PB | Descripción |
| :--- | :--- | :--- |
| `id` | `text (15)` | ID único en PocketBase (ej. `wh_dev`, `pbc_warehouses_01`). |
| `code` | `text` | Código corto (ej. `"BOD-DEV"`, `"BOD-01"`). |
| `name` | `text` | Nombre visible (ej. `"Bodega Devoluciones y Averías"`, `"Bodega Principal"`). |
| `active`| `bool` | Indicador de disponibilidad operativa. |
| `address`| `text` | Dirección o ubicación física del centro de acopio. |

---

### 3.5. Colección de Parámetros Globales: `settings` (`sales_settings_v2`)

En la colección `settings`, bajo la clave de configuración de ventas:
```json
{
  "key": "sales_settings_v2",
  "value": {
    "refund_policy": {
      "default_warehouse_id": "wh_dev",
      "allow_free_returns": true,
      "require_photo_evidence": true,
      "require_customer_signature": true,
      "max_return_days": 30
    }
  }
}
```
* **Comportamiento en Móvil**: La app descarga este ajuste durante la sincronización y preselecciona automáticamente `default_warehouse_id` al abrir la pantalla de *Nueva Solicitud de Devolución*.

---

## 4. Estructura de Datos Local en Móvil (Room SQLite v10)

Para garantizar la operación offline en zonas sin cobertura, se diseñaron tres entidades Room en Android con sincronización en cola (`sync_queue`):

### 4.1. `WarehouseEntity` (Tabla `warehouses`)
```kotlin
@Entity(tableName = "warehouses")
data class WarehouseEntity(
    @PrimaryKey val id: String,
    val code: String,
    val name: String,
    val active: Boolean = true,
    val address: String = "",
    val notes: String = ""
)
```

### 4.2. `SalesReturnEntity` (Tabla `sales_returns`)
```kotlin
@Entity(tableName = "sales_returns")
data class SalesReturnEntity(
    @PrimaryKey val id: String,
    val returnNumber: String,          // Ej. DEV-00000001
    val clientId: String,              // ID del cliente local / PocketBase
    val clientName: String,
    val originalInvoiceId: String?,    // Nullable si es devolución libre
    val originalInvoiceNumber: String?,
    val warehouseId: String,           // Bodega de destino
    val sellerId: String,
    val dianConcept: String,           // Código DIAN (1 al 5)
    val notes: String,
    val isDamaged: Boolean,            // Mapea a is_loss en PB
    val subtotal: Double,
    val taxTotal: Double,
    val total: Double,
    val status: String,                // "draft" (borrador sincronizado), "pending", "approved"
    val evidencePhotosJson: String,    // Array JSON de rutas a fotos de evidencia tomadas con la cámara
    val signaturePath: String?,        // Ruta al PNG de la firma digital capturada en pantalla
    val createdAt: String,
    val isSynced: Boolean = false
)
```

### 4.3. `SalesReturnLineEntity` (Tabla `sales_return_lines`)
```kotlin
@Entity(
    tableName = "sales_return_lines",
    foreignKeys = [
        ForeignKey(
            entity = SalesReturnEntity::class,
            parentColumns = ["id"],
            childColumns = ["returnId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["returnId"])]
)
data class SalesReturnLineEntity(
    @PrimaryKey val id: String,
    val returnId: String,
    val productId: String,
    val productCode: String,
    val productName: String,
    val quantity: Double,
    val unitPrice: Double,
    val taxRate: Double,
    val taxAmount: Double,
    val total: Double,
    val isDamaged: Boolean,            // Renglón específico en avería (is_loss en PB)
    val notes: String = ""
)
```

---

## 5. Mapeo de Conceptos DIAN (Notas de Crédito Electrónicas)

La aplicación móvil captura el concepto estandarizado según la resolución DIAN colombiana para notas de crédito:

| Código | Concepto DIAN | Comportamiento en Escritorio |
| :---: | :--- | :--- |
| **`1`** | **Devolución parcial de los bienes y/o no aceptación de servicios** | Reingresa stock al inventario por la cantidad devuelta. |
| **`2`** | **Anulación de factura electrónica previa** | Anula el comprobante previo y reingresa el 100% de los ítems. |
| **`3`** | **Rebaja o descuento total o parcial aplicado** | Ajuste financiero; no altera existencias físicas de inventario. |
| **`4`** | **Ajuste de precio** | Ajuste financiero por diferencia de tarifas. |
| **`5`** | **Otros (Avería física en transporte, mercancía deteriorada)** | Mercancía ingresa a bodega de averías/cuarentena (`is_loss = true`). |

---

## 6. Ejemplos de Payloads JSON Sincronizados

### 6.1. Encabezado en `invoices`:
```json
{
  "number": "DEV-00000001",
  "customer_id": "pbc_client_9941a",
  "warehouse_id": "wh_dev",
  "seller_id": "6v21xfu4abpcba2",
  "tx_type_id": "6up0t7z2ryntecs",
  "is_credit_note": true,
  "is_loss": true,
  "status": "draft",
  "payment_method": "CREDITO",
  "dian_concept": "1",
  "cross_doc_ref": "FAC-00012480",
  "date": "2026-10-26",
  "subtotal": 150000.0,
  "iva_total": 28500.0,
  "total": 178500.0,
  "payable_total": 178500.0,
  "notes": "Cliente reporta 2 unidades con empaque roto y fisura en esmalte cerámico. Solicitud radicada desde móvil."
}
```

### 6.2. Renglón en `invoice_lines`:
```json
{
  "invoice_id": "inv_draft_88291a",
  "product_id": "prod_porcel_60x60",
  "warehouse_id": "wh_dev",
  "qty": 2.0,
  "unit_price": 75000.0,
  "iva_rate": 0.19,
  "iva_amount": 28500.0,
  "subtotal": 150000.0,
  "total": 178500.0,
  "is_loss": true,
  "description": "Porcelanato Gala 60x60 - Roto en esquina",
  "line_order": 1
}
```

### 6.3. Actualización de Consecutivo en `transaction_types` (PATCH):
```json
{
  "consecutive": 2,
  "period_counters": "{\"202610\": 2}"
}
```

---

## 7. Recomendaciones de Implementación para el Equipo Desktop

Para completar el ciclo de negocio en el ERP de escritorio (**`appescritorio_muestra`**), se recomienda implementar los siguientes puntos en el frontend/backend:

1. **Bandeja de Aprobación de Devoluciones**:
   - Consultar la colección `invoices` filtrando por:
     ```js
     pb.collection('invoices').getList(1, 50, {
       filter: 'is_credit_note = true && status = "draft"',
       expand: 'customer_id,seller_id,warehouse_id,invoice_lines_via_invoice_id.product_id',
       sort: '-created'
     });
     ```
2. **Impacto en Kardex e Inventario**:
   - Al aprobar la devolución (`status = "completed"`):
     - Si `invoice_lines.is_loss == false`: Ingresar unidades al inventario disponible de la bodega seleccionada (`warehouse_id`).
     - Si `invoice_lines.is_loss == true`: Enviar las unidades a la sub-bodega o cuenta de **Averías/Pérdidas** (sin sumar a existencias comerciales para venta).
3. **Cruce de Cuentas en Cartera (`transactions`)**:
   - Como la solicitud se radica con `payment_method = "CREDITO"`, al aprobarla se genera automáticamente un saldo a favor que el módulo de cartera de escritorio puede cruzar contra facturas pendientes del cliente.
4. **Emisión de Facturación Electrónica DIAN**:
   - Si la empresa tiene habilitada la transmisión electrónica de notas de crédito, la aplicación de escritorio puede tomar el documento en borrador, firmarlo con el certificado digital y enviarlo al web service de la DIAN utilizando el `dian_concept` precargado por la app móvil.

---

*Documento generado y verificado automáticamente con base en el código fuente de `mobileGRAVYventas` y las definiciones de PocketBase.*
