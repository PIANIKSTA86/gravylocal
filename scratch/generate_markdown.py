import json
import os

with open('scratch/resolved_collections.json', 'r', encoding='utf-8') as f:
    cols = json.load(f)

# Define Modules and their collections
module_groups = {
    "1. SEGURIDAD, AUTENTICACIÓN Y CONFIGURACIÓN BASE": [
        "users", "_superusers", "audit_log", "licenses", "settings", "branches", "cost_centers"
    ],
    "2. TERCEROS, CONTACTOS Y CRM": [
        "third_parties", "third_party_branches", "clientes", "crm_deals", "crm_interactions", "vendor_visits"
    ],
    "3. GEOGRAFÍA Y DIVIPOLA (COLOMBIA)": [
        "geo_countries", "geo_departments", "geo_municipalities"
    ],
    "4. PRODUCTOS, LISTAS DE PRECIOS E INVENTARIOS": [
        "products", "product_components", "listas_precios", "precios_producto",
        "warehouses", "inventory_stock", "inventory_movements", "inventory_movement_lines",
        "inventory_concepts", "inventory_lots", "inventory_pallets",
        "consignment_settlements", "consignment_settlement_lines"
    ],
    "5. VENTAS, FACTURACIÓN Y PUNTO DE VENTA (POS)": [
        "sales_orders", "sales_order_lines", "sales_reservations", "sales_reservation_lines",
        "invoices", "invoice_lines", "pos_registers", "pos_shifts", "commission_rules"
    ],
    "6. COMPRAS Y CUENTAS POR PAGAR (CXP)": [
        "purchase_orders", "purchase_order_lines", "purchase_invoices", "purchase_invoice_lines"
    ],
    "7. CONTABILIDAD FINANCIERA, PUC Y DIAN (PARTIDA DOBLE)": [
        "accounts", "account_types", "transaction_types", "transactions", "tx_lines",
        "financial_notes", "homologation_rules", "exogena_concepts", "agenda_vencimientos"
    ],
    "8. FACTURACIÓN ELECTRÓNICA Y RESOLUCIONES DIAN": [
        "dian_resolutions", "electronic_documents", "electronic_document_items",
        "electronic_document_taxes", "einvoice_docs"
    ],
    "9. TESORERÍA, BANCOS Y CARTERA (CXC / PAGOS)": [
        "bank_accounts", "bank_movements", "payments", "cash_concepts", "treasury_settings"
    ],
    "10. ACTIVOS FIJOS Y NIIF (NIC 16 / NIIF 16)": [
        "niif_assets", "niif_asset_categories", "niif_asset_events", "niif_asset_inventories",
        "niif_leases", "niif_policies", "niif_settings"
    ],
    "11. NÓMINA ELECTRÓNICA Y RECURSOS HUMANOS": [
        "payroll_periods", "payroll_documents", "payroll_lines", "payroll_novelties", "electronic_payrolls"
    ],
    "12. COMERCIO EXTERIOR E IMPORTACIONES (D.O.)": [
        "imports", "import_invoices", "import_lines", "import_pallet_configs"
    ],
    "13. LOGÍSTICA, DISTRIBUCIÓN Y DESPACHOS": [
        "logistica_vehicles", "logistica_deliveries", "logistica_delivery_lines"
    ],
    "14. MÓDULO VERTICAL: PROPIEDAD HORIZONTAL (PH)": [
        "ph_properties", "ph_budgets", "ph_budget_lines", "ph_billing_concepts",
        "ph_invoices", "ph_invoice_lines", "ph_individual_charges", "ph_common_areas",
        "ph_reservations", "ph_pqrs"
    ],
    "15. MÓDULO VERTICAL: INMOBILIARIA": [
        "inmo_properties", "inmo_contracts", "inmo_invoices", "inmo_invoice_lines", "inmo_property_history"
    ],
    "16. MÓDULO VERTICAL: SERVICIOS, SPA Y VETERINARIA": [
        "pets", "appointments", "spa_clients"
    ],
    "17. COLECCIONES INTERNAS / SISTEMA POCKETBASE": [
        "_authOrigins", "_externalAuths", "_mfas", "_otps"
    ]
}

# Verify all collections are accounted for
accounted = set()
for group, list_c in module_groups.items():
    for c in list_c:
        accounted.add(c)

missing = set(cols.keys()) - accounted
if missing:
    print("Warning: Missing collections:", missing)
    module_groups["18. OTRAS COLECCIONES"] = list(missing)

# Generate Markdown Document
doc = []
doc.append("# 🗺️ Mapa Arquitectónico de Datos: PocketBase - ERP GRAVY")
doc.append("\n> **Documento Técnico para Agentes IA y Desarrolladores Full Stack**")
doc.append("> **Especialidad:** Sistemas Contables y Financieros (PUC Colombiano, NIIF, DIAN, Facturación Electrónica, POS, Inventarios y Nómina).")
doc.append(f"> **Total Colecciones en Sistema:** {len(cols)}")
doc.append("\n---\n")

doc.append("## 📌 Índice de Módulos")
for group_name in module_groups.keys():
    anchor = group_name.lower().replace(" ", "-").replace(".", "").replace(":", "").replace("(", "").replace(")", "").replace("/", "")
    doc.append(f"- [{group_name}](#{anchor})")

doc.append("\n---\n")

for group_name, col_list in module_groups.items():
    doc.append(f"## {group_name}\n")
    for c_name in col_list:
        if c_name not in cols:
            continue
        c_info = cols[c_name]
        doc.append(f"### 📦 Colección: `{c_name}`")
        doc.append(f"- **Tipo PocketBase:** `{c_info['type']}` (Colección ID: `{c_info['id']}`)")
        doc.append(f"- **Total de Campos:** {c_info['field_count']}")
        doc.append("\n| Campo | Tipo PB | Obligatorio | Detalle / Relación / Valores Permitidos |")
        doc.append("| :--- | :--- | :---: | :--- |")
        
        for f in c_info['fields']:
            name = f['name']
            ftype = f['type']
            req = "✅ Sí" if f['required'] else "No"
            
            detail = ""
            if ftype == 'relation':
                rel_to = f.get('relation_to', 'Desconocido')
                max_s = f.get('maxSelect', 1)
                mult = "Múltiple (Array)" if max_s != 1 else "Uno (1:1 o N:1)"
                cascade = " | CascadeDelete" if f.get('cascadeDelete') else ""
                detail = f"🔗 Relación a **`{rel_to}`** ({mult}{cascade})"
            elif ftype == 'select':
                vals = f.get('values', [])
                max_s = f.get('maxSelect', 1)
                mult = " [Selección Múltiple]" if max_s != 1 else ""
                val_str = ", ".join([f"`{v}`" for v in vals])
                detail = f"Valores: [{val_str}]{mult}"
            elif ftype == 'file':
                mimes = f.get('mimeTypes', [])
                mime_str = f" ({', '.join(mimes)})" if mimes else ""
                detail = f"Archivo / Binario{mime_str}"
            elif ftype == 'autodate':
                detail = "Timestamp automático del sistema"
            elif ftype == 'json':
                detail = "Objeto JSON o array estructurado"
            else:
                detail = "-"
                
            doc.append(f"| `{name}` | `{ftype}` | {req} | {detail} |")
        doc.append("\n")

final_md = "\n".join(doc)

with open('DOCUMENTACION_ESQUEMA_POCKETBASE.md', 'w', encoding='utf-8') as f:
    f.write(final_md)

# Also write to artifacts
artifact_path = r'C:\Users\JULIAN\.gemini\antigravity-ide\brain\71bb1a6d-46bc-4e71-a637-dab5f739625d\DOCUMENTACION_ESQUEMA_POCKETBASE.md'
with open(artifact_path, 'w', encoding='utf-8') as f:
    f.write(final_md)

print("Generated markdown successfully!")
