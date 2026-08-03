import sqlite3
import re

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# Get invoice NC-00000451
cursor.execute("SELECT id, number, notes, cross_doc_ref, tx_id FROM invoices WHERE number = 'NC-00000451'")
inv_row = cursor.fetchone()
print("Invoice NC-00000451:", inv_row)

inv_id, inv_number, inv_notes, inv_cross_ref, inv_tx_id = inv_row

# Function to extract crossDocRef
def get_cross_doc_ref(inv_cross_ref, inv_notes, tx_desc=""):
    if "[SIN_REFERENCIA]" in inv_notes or "[SIN_REFERENCIA]" in tx_desc:
        return ""
    if inv_cross_ref and inv_cross_ref.strip():
        return inv_cross_ref.strip()
    
    m = re.search(r'Ajuste a documento\s+([A-Za-z0-9\-]+)', inv_notes, re.IGNORECASE)
    if m: return m.group(1).strip()
    
    m = re.search(r'(?:referente a|referencia a|factura)\s+(?:la\s+)?(?:Factura\s+)?(?:Electrónica\s+)?N[º°]?\s*([A-Za-z0-9\-]+)', inv_notes, re.IGNORECASE)
    if m: return m.group(1).strip()
    
    m = re.search(r'(FV-[0-9]+)', inv_notes, re.IGNORECASE)
    if m: return m.group(1).strip()

    return ""

ref = get_cross_doc_ref(inv_cross_ref, inv_notes)
print("Resolved crossDocRef:", ref)

# Look up origInvoice
cursor.execute("SELECT id, number, date, tx_id FROM invoices WHERE number = ?", (ref,))
orig_inv = cursor.fetchone()
print("Original Invoice:", orig_inv)

orig_cufe = None
if orig_inv:
    orig_tx_id = orig_inv[3]
    cursor.execute("SELECT cufe FROM einvoice_docs WHERE tx_id = ?", (orig_tx_id,))
    doc = cursor.fetchone()
    if doc:
        orig_cufe = doc[0]

if not orig_cufe and inv_notes:
    m = re.search(r'CUFE:\s*([a-fA-F0-9]{64,96})', inv_notes, re.IGNORECASE)
    if m:
        orig_cufe = m.group(1)

print("Original CUFE:", orig_cufe)

# Generate REF tag
ref_prefix = "FE"
ref_folio = re.sub(r'[^0-9]', '', ref)
parts = ref.split("-")
if len(parts) > 1:
    ref_prefix = parts[0]
    ref_folio = re.sub(r'[^0-9]', '', parts[1])

ref_xml = f"""  <REF>
    <REF_1>IV</REF_1>
    <REF_2>{ref_prefix}{ref_folio}</REF_2>
    <REF_3>{orig_inv[2] if orig_inv else '2026-07-31'}</REF_3>
    <REF_4>{orig_cufe}</REF_4>
    <REF_5>CUFE-SHA384</REF_5>
  </REF>"""

print("\nGenerated <REF> XML node:")
print(ref_xml)

conn.close()
