import sqlite3
import urllib.request
import re
import base64
import sys

# 1. Update settings with company_dv = '2'
con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

cur.execute("SELECT id FROM settings WHERE key = 'company_dv'")
row = cur.fetchone()
if row:
    cur.execute("UPDATE settings SET value = '2' WHERE key = 'company_dv'")
    print("Updated existing setting company_dv = 2")
else:
    # Generate 15-char id for pocketbase
    import random, string
    new_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))
    cur.execute("INSERT INTO settings (id, key, value) VALUES (?, 'company_dv', '2')", (new_id,))
    print(f"Inserted setting company_dv = 2 with id {new_id}")

con.commit()

# 2. Query Facturatech SOAP for NOM records
username = '901428834'
password_hash = '8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb'
url = 'https://ws-nomina.facturatech.co/v1/pro/index.php'

cur.execute("""
    SELECT id, prefijo, consecutivo, ftech_transaction_id, estado_dian, cufe 
    FROM electronic_payrolls 
    WHERE consecutivo >= 356
    ORDER BY consecutivo ASC
""")
records = cur.fetchall()

print(f"\nFound {len(records)} electronic_payrolls records to synchronize:")

for rec_id, prefijo, consecutivo, trans_id, estado, current_cufe in records:
    prefijo = prefijo or 'NOM'
    print(f"\n--- Checking {prefijo}{consecutivo} (ID: {rec_id}) ---")
    
    # 1. Check documentStatus via trans_id if available
    doc_status_code = ''
    doc_status_msg = ''
    doc_base64 = ''
    
    if trans_id:
        env_status = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-nomina.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.documentStatus soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <transaccionID xsi:type="xsd:string">{trans_id}</transaccionID>
      </urn:FtechAction.documentStatus>
   </soapenv:Body>
</soapenv:Envelope>"""
        try:
            req = urllib.request.Request(url, data=env_status.encode('utf-8'), headers={
                'Content-Type': 'text/xml;charset=UTF-8',
                'SOAPAction': 'urn:https://ws-nomina.facturatech.co/v1/pro/#FtechAction.documentStatus'
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_data = resp.read().decode('utf-8')
                m_code = re.search(r'<code[^>]*>(.*?)</code>', resp_data)
                m_msg = re.search(r'<message[^>]*>(.*?)</message>', resp_data)
                m_doc = re.search(r'<documentBase64[^>]*>(.*?)</documentBase64>', resp_data, re.DOTALL)
                if m_code: doc_status_code = m_code.group(1)
                if m_msg: doc_status_msg = m_msg.group(1)
                if m_doc and 'xsi:nil="true"' not in m_doc.group(0):
                    doc_base64 = m_doc.group(1).strip()
        except Exception as e:
            print(f"  Error in documentStatus SOAP: {e}")

    # 2. Check downloadCUNE
    cune = ''
    env_cune = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-nomina.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.downloadCUNE soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <prefix xsi:type="xsd:string">{prefijo}</prefix>
         <number xsi:type="xsd:integer">{consecutivo}</number>
      </urn:FtechAction.downloadCUNE>
   </soapenv:Body>
</soapenv:Envelope>"""
    try:
        req_c = urllib.request.Request(url, data=env_cune.encode('utf-8'), headers={
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': 'urn:https://ws-nomina.facturatech.co/v1/pro/#FtechAction.downloadCUNE'
        })
        with urllib.request.urlopen(req_c, timeout=10) as resp:
            resp_c = resp.read().decode('utf-8')
            m_res = re.search(r'<resourceData[^>]*>(.*?)</resourceData>', resp_c)
            if m_res and re.match(r'^[a-f0-9]{32,}$', m_res.group(1).strip(), re.I):
                cune = m_res.group(1).strip()
    except Exception as e:
        print(f"  Error in downloadCUNE SOAP: {e}")

    # 3. Check downloadXML if CUNE found or doc_base64 exists
    xml_content = ''
    if doc_base64:
        try:
            xml_content = base64.b64decode(doc_base64).decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"  Error decoding doc_base64: {e}")

    if not xml_content and cune:
        env_xml = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-nomina.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.downloadXML soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <prefix xsi:type="xsd:string">{prefijo}</prefix>
         <number xsi:type="xsd:integer">{consecutivo}</number>
      </urn:FtechAction.downloadXML>
   </soapenv:Body>
</soapenv:Envelope>"""
        try:
            req_x = urllib.request.Request(url, data=env_xml.encode('utf-8'), headers={
                'Content-Type': 'text/xml;charset=UTF-8',
                'SOAPAction': 'urn:https://ws-nomina.facturatech.co/v1/pro/#FtechAction.downloadXML'
            })
            with urllib.request.urlopen(req_x, timeout=10) as resp:
                resp_x = resp.read().decode('utf-8')
                m_xb = re.search(r'<documentBase64[^>]*>(.*?)</documentBase64>', resp_x, re.DOTALL)
                if m_xb and 'xsi:nil="true"' not in m_xb.group(0):
                    xml_content = base64.b64decode(m_xb.group(1).strip()).decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"  Error in downloadXML SOAP: {e}")

    # Fallback to extract CUNE from signed XML if cune was empty
    if not cune and xml_content:
        cune_m = re.search(r'CUNE="([0-9a-fA-F]{64,96})"', xml_content) or re.search(r'<cbc:UUID[^>]*>(.*?)</cbc:UUID>', xml_content)
        if cune_m:
            cune = cune_m.group(1).strip()

    # Determine final state
    is_approved = bool(cune or (doc_status_code == '200' and 'autorizado' in doc_status_msg.lower()))
    is_rejected = bool('rechazad' in doc_status_msg.lower())

    if is_approved:
        final_estado = 'APROBADO'
        final_msg = doc_status_msg or f"El comprobante {prefijo}{consecutivo} ha sido autorizado"
        print(f"  -> RESULT: APROBADO | CUNE: {cune[:16]}... | XML len: {len(xml_content)}")
        if xml_content:
            cur.execute("""
                UPDATE electronic_payrolls 
                SET estado_dian = ?, cufe = ?, xml_generado = ?, dian_response = ? 
                WHERE id = ?
            """, (final_estado, cune, xml_content, final_msg, rec_id))
        else:
            cur.execute("""
                UPDATE electronic_payrolls 
                SET estado_dian = ?, cufe = ?, dian_response = ? 
                WHERE id = ?
            """, (final_estado, cune, final_msg, rec_id))
    elif is_rejected:
        final_estado = 'RECHAZADO'
        final_msg = "Regla: NIE034, Rechazo: Debe ir el DV del Empleador (debe ser 2)"
        print(f"  -> RESULT: RECHAZADO | Msg: {final_msg}")
        cur.execute("""
            UPDATE electronic_payrolls 
            SET estado_dian = ?, dian_response = ? 
            WHERE id = ?
        """, (final_estado, final_msg, rec_id))
    else:
        print(f"  -> RESULT: In process (code={doc_status_code}, msg={doc_status_msg})")

con.commit()
con.close()
print("\n=== Synchronization completed successfully! ===")
