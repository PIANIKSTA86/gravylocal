import urllib.request, re, base64

username = '901428834'
password_hash = '8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb'
url = 'https://ws-nomina.facturatech.co/v1/pro/index.php'

for num in [359, 360, 362]:
    env_cune = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-nomina.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.downloadCUNE soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <prefix xsi:type="xsd:string">NOM</prefix>
         <number xsi:type="xsd:integer">{num}</number>
      </urn:FtechAction.downloadCUNE>
   </soapenv:Body>
</soapenv:Envelope>"""
    
    req = urllib.request.Request(url, data=env_cune.encode('utf-8'), headers={
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws-nomina.facturatech.co/v1/pro/#FtechAction.downloadCUNE'
    })
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read().decode('utf-8')
            m_code = re.search(r'<code[^>]*>(.*?)</code>', data)
            m_res = re.search(r'<resourceData[^>]*>(.*?)</resourceData>', data)
            m_msg = re.search(r'<message[^>]*>(.*?)</message>', data)
            print(f"NOM{num} CUNE: code={m_code.group(1) if m_code else 'none'}, msg={m_msg.group(1) if m_msg else ''}, cune={m_res.group(1) if m_res else ''}")
    except Exception as e:
        print(f"NOM{num} CUNE Error: {e}")

    # Also test downloadXML
    env_xml = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-nomina.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.downloadXML soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <prefix xsi:type="xsd:string">NOM</prefix>
         <number xsi:type="xsd:integer">{num}</number>
      </urn:FtechAction.downloadXML>
   </soapenv:Body>
</soapenv:Envelope>"""
    req_x = urllib.request.Request(url, data=env_xml.encode('utf-8'), headers={
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws-nomina.facturatech.co/v1/pro/#FtechAction.downloadXML'
    })
    try:
        with urllib.request.urlopen(req_x, timeout=10) as resp_x:
            data_x = resp_x.read().decode('utf-8')
            m_code_x = re.search(r'<code[^>]*>(.*?)</code>', data_x)
            m_doc_x = re.search(r'<documentBase64[^>]*>(.*?)</documentBase64>', data_x, re.DOTALL)
            has_x = bool(m_doc_x and 'xsi:nil="true"' not in m_doc_x.group(0) and m_doc_x.group(1).strip())
            print(f"NOM{num} XML: code={m_code_x.group(1) if m_code_x else 'none'}, hasXml={has_x}")
    except Exception as e:
        print(f"NOM{num} XML Error: {e}")
