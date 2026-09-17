import urllib.request, re, base64

username = '901428834'
password_hash = '8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb'
url = 'https://ws-nomina.facturatech.co/v1/pro/index.php'

def check_nomina(prefix, num, trans_id=None):
    print(f"\n=================== Checking {prefix}{num} ===================")
    # 1. downloadCUNE
    envelope_cune = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-nomina.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.downloadCUNE soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <prefix xsi:type="xsd:string">{prefix}</prefix>
         <number xsi:type="xsd:integer">{num}</number>
      </urn:FtechAction.downloadCUNE>
   </soapenv:Body>
</soapenv:Envelope>"""
    req_cune = urllib.request.Request(url, data=envelope_cune.encode('utf-8'), headers={
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws-nomina.facturatech.co/v1/pro/#FtechAction.downloadCUNEResponse'
    })
    try:
        with urllib.request.urlopen(req_cune, timeout=10) as resp:
            data = resp.read().decode('utf-8')
            code = re.search(r'<code[^>]*>(.*?)</code>', data)
            msg = re.search(r'<message[^>]*>(.*?)</message>', data)
            res = re.search(r'<resourceData[^>]*>(.*?)</resourceData>', data)
            c_val = code.group(1) if code else 'err'
            cune = res.group(1) if res else ''
            print(f"downloadCUNE: code={c_val}, msg={msg.group(1) if msg else ''}, cune={cune[:20]}... (len={len(cune)})")
    except Exception as e:
        print(f"downloadCUNE error: {e}")

    # 2. downloadXML
    envelope_xml = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-nomina.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.downloadXML soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <prefix xsi:type="xsd:string">{prefix}</prefix>
         <number xsi:type="xsd:integer">{num}</number>
      </urn:FtechAction.downloadXML>
   </soapenv:Body>
</soapenv:Envelope>"""
    req_xml = urllib.request.Request(url, data=envelope_xml.encode('utf-8'), headers={
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws-nomina.facturatech.co/v1/pro/#FtechAction.downloadXML'
    })
    try:
        with urllib.request.urlopen(req_xml, timeout=10) as resp:
            data = resp.read().decode('utf-8')
            code = re.search(r'<code[^>]*>(.*?)</code>', data)
            msg = re.search(r'<message[^>]*>(.*?)</message>', data)
            doc_m = re.search(r'<documentBase64[^>]*>(.*?)</documentBase64>', data, re.DOTALL)
            c_val = code.group(1) if code else 'err'
            b64_len = len(doc_m.group(1).strip()) if doc_m and doc_m.group(1).strip() else 0
            print(f"downloadXML: code={c_val}, msg={msg.group(1) if msg else ''}, xml_b64_len={b64_len}")
    except Exception as e:
        print(f"downloadXML error: {e}")

    # 3. documentStatus if trans_id
    if trans_id:
        envelope_status = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-nomina.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.documentStatus soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <transaccionID xsi:type="xsd:string">{trans_id}</transaccionID>
      </urn:FtechAction.documentStatus>
   </soapenv:Body>
</soapenv:Envelope>"""
        req_st = urllib.request.Request(url, data=envelope_status.encode('utf-8'), headers={
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': 'urn:https://ws-nomina.facturatech.co/v1/pro/#FtechAction.documentStatus'
        })
        try:
            with urllib.request.urlopen(req_st, timeout=10) as resp:
                data = resp.read().decode('utf-8')
                code = re.search(r'<code[^>]*>(.*?)</code>', data)
                msg = re.search(r'<message[^>]*>(.*?)</message>', data)
                msg_err = re.search(r'<messageError[^>]*>(.*?)</messageError>', data)
                c_val = code.group(1) if code else 'err'
                print(f"documentStatus: code={c_val}, msg={msg.group(1) if msg else ''}, err={msg_err.group(1) if msg_err else ''}")
        except Exception as e:
            print(f"documentStatus error: {e}")

for n in [355, 356, 357, 358, 359, 360, 361, 362, 363]:
    check_nomina('NOM', n)
