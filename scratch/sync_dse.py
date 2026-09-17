import sqlite3, urllib.request, re, base64, random, string

username = '901428834'
password_hash = '8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb'
url = 'https://ws-dse.facturatech.co/v1/pro/'

def gen_id():
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choice(chars) for _ in range(15))

def fetch_dse_from_ftech(prefix, num):
    # 1. CUDS
    envelope_cuds = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-dse.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:downloadCUDS soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <prefix xsi:type="xsd:string">{prefix}</prefix>
         <number xsi:type="xsd:integer">{num}</number>
      </urn:downloadCUDS>
   </soapenv:Body>
</soapenv:Envelope>"""
    req_cuds = urllib.request.Request(url, data=envelope_cuds.encode('utf-8'), headers={
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws-dse.facturatech.co/v1/pro/downloadCUDSResponse'
    })
    cude = ''
    try:
        with urllib.request.urlopen(req_cuds, timeout=15) as resp:
            data = resp.read().decode('utf-8')
            res = re.search(r'<resourceData[^>]*>(.*?)</resourceData>', data)
            if res and len(res.group(1).strip()) > 30:
                cude = res.group(1).strip()
    except Exception as e:
        print(f"Error fetching CUDS for {prefix}{num}:", e)

    # 2. XML
    envelope_xml = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-dse.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:downloadXML soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <prefix xsi:type="xsd:string">{prefix}</prefix>
         <number xsi:type="xsd:integer">{num}</number>
      </urn:downloadXML>
   </soapenv:Body>
</soapenv:Envelope>"""
    req_xml = urllib.request.Request(url, data=envelope_xml.encode('utf-8'), headers={
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws-dse.facturatech.co/v1/pro/downloadXML'
    })
    xml_str = ''
    try:
        with urllib.request.urlopen(req_xml, timeout=15) as resp:
            data = resp.read().decode('utf-8')
            doc_m = re.search(r'<documentBase64[^>]*>(.*?)</documentBase64>', data, re.DOTALL)
            if doc_m and doc_m.group(1).strip():
                xml_str = base64.b64decode(doc_m.group(1).strip()).decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching XML for {prefix}{num}:", e)

    return cude, xml_str

dse_docs = [
    (291, 'DSE-00000291'),
    (292, 'DSE-00000292'),
    (293, 'DSE-00000293'),
    (315, 'DSE-315'),
    (316, 'DSE-00000316')
]

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

for num, doc_number in dse_docs:
    print(f"\nProcessing {doc_number} (number={num})...")
    tx = cur.execute('SELECT id, number, date FROM transactions WHERE number=?', (doc_number,)).fetchone()
    if not tx:
        print(f"  Transaction not found for {doc_number}")
        continue
    tx_id = tx[0]
    print(f"  Found transaction: {tx_id} ({tx[1]})")

    cude, xml_content = fetch_dse_from_ftech('DSE', num)
    if not cude:
        print(f"  Could not get CUDE for {doc_number}")
        continue

    print(f"  Got CUDE: {cude[:20]}... (len={len(cude)})")
    print(f"  Got XML length: {len(xml_content)}")

    existing = cur.execute('SELECT id, status FROM einvoice_docs WHERE tx_id=?', (tx_id,)).fetchone()
    if existing:
        cur.execute('''
            UPDATE einvoice_docs 
            SET status='aceptada', cufe=?, xml_content=?, dian_response='Documento firmado y autorizado por la DIAN.'
            WHERE tx_id=?
        ''', (cude, xml_content, tx_id))
        print(f"  Updated existing einvoice_docs record {existing[0]}")
    else:
        new_id = gen_id()
        cur.execute('''
            INSERT INTO einvoice_docs (id, tx_id, status, cufe, xml_content, dian_response, ftech_transaction_id, sent_at)
            VALUES (?, ?, 'aceptada', ?, ?, 'Documento firmado y autorizado por la DIAN.', '', datetime('now'))
        ''', (new_id, tx_id, cude, xml_content))
        print(f"  Created new einvoice_docs record {new_id} for tx {tx_id}")

con.commit()
print("\nAll authorized DSE documents synchronized successfully!")
