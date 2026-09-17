import urllib.request, re, base64

username = '901428834'
password_hash = '8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb'
url = 'https://ws-dse.facturatech.co/v1/pro/'

def check_status(name, trans_id, prefix, number):
    envelope = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-dse.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:documentStatus soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <transaccionID xsi:type="xsd:string">{trans_id}</transaccionID>
      </urn:documentStatus>
   </soapenv:Body>
</soapenv:Envelope>"""
    req = urllib.request.Request(url, data=envelope.encode('utf-8'), headers={
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws-dse.facturatech.co/v1/pro/documentStatus'
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read().decode('utf-8')
            print(f"=== STATUS for {name} ({trans_id}) ===")
            code = re.search(r'<code[^>]*>(.*?)</code>', data)
            msg = re.search(r'<message[^>]*>(.*?)</message>', data)
            msg_err = re.search(r'<messageError[^>]*>(.*?)</messageError>', data)
            print("Code:", code.group(1) if code else None)
            print("Message:", msg.group(1) if msg else None)
            print("MessageError:", msg_err.group(1) if msg_err else None)
            doc_m = re.search(r'<documentBase64[^>]*>(.*?)</documentBase64>', data, re.DOTALL)
            if doc_m and 'xsi:nil="true"' not in doc_m.group(0) and doc_m.group(1).strip():
                raw_b64 = doc_m.group(1).strip()
                print("Has documentBase64! Length:", len(raw_b64))
                decoded = base64.b64decode(raw_b64).decode('utf-8', errors='ignore')
                print("XML starts with:", decoded[:120])
                cude_m = re.search(r'CUDE="([0-9a-fA-F]{64,96})"', decoded) or re.search(r'<cbc:UUID[^>]*>(.*?)</cbc:UUID>', decoded)
                if cude_m:
                    print("CUDE from XML:", cude_m.group(1))
            else:
                print("No documentBase64 in documentStatus response.")
    except Exception as e:
        print("Error checking status:", e)

    # Let's also check downloadCUDS
    envelope_cuds = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-dse.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:downloadCUDS soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <prefix xsi:type="xsd:string">{prefix}</prefix>
         <number xsi:type="xsd:integer">{number}</number>
      </urn:downloadCUDS>
   </soapenv:Body>
</soapenv:Envelope>"""
    req_cuds = urllib.request.Request(url, data=envelope_cuds.encode('utf-8'), headers={
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws-dse.facturatech.co/v1/pro/downloadCUDSResponse'
    })
    try:
        with urllib.request.urlopen(req_cuds, timeout=15) as resp:
            data = resp.read().decode('utf-8')
            print(f"--- downloadCUDS for {prefix}{number} ---")
            code = re.search(r'<code[^>]*>(.*?)</code>', data)
            msg = re.search(r'<message[^>]*>(.*?)</message>', data)
            res = re.search(r'<resourceData[^>]*>(.*?)</resourceData>', data)
            print("CUDS Code:", code.group(1) if code else None)
            print("CUDS Msg:", msg.group(1) if msg else None)
            print("CUDS resourceData:", res.group(1) if res else None)
    except Exception as e:
        print("Error downloading CUDS:", e)

    # Let's also check downloadXML
    envelope_xml = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-dse.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:downloadXML soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <prefix xsi:type="xsd:string">{prefix}</prefix>
         <number xsi:type="xsd:integer">{number}</number>
      </urn:downloadXML>
   </soapenv:Body>
</soapenv:Envelope>"""
    req_xml = urllib.request.Request(url, data=envelope_xml.encode('utf-8'), headers={
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws-dse.facturatech.co/v1/pro/downloadXML'
    })
    try:
        with urllib.request.urlopen(req_xml, timeout=15) as resp:
            data = resp.read().decode('utf-8')
            print(f"--- downloadXML for {prefix}{number} ---")
            code = re.search(r'<code[^>]*>(.*?)</code>', data)
            msg = re.search(r'<message[^>]*>(.*?)</message>', data)
            doc_m = re.search(r'<documentBase64[^>]*>(.*?)</documentBase64>', data, re.DOTALL)
            print("XML Code:", code.group(1) if code else None)
            print("XML Msg:", msg.group(1) if msg else None)
            if doc_m and doc_m.group(1).strip():
                print("XML base64 len:", len(doc_m.group(1).strip()))
    except Exception as e:
        print("Error downloading XML:", e)

print("Starting check...")
check_status("DSE-316", "ed87752e34bebe0240b59ed647d7c292278f53f8e9b58d68b63de90519c4d72d", "DSE", 316)
check_status("DSE-315", "969fc8af7454d3358d003f22468dd3a763b23f966049a0269d288f4e2b2d259a", "DSE", 315)
