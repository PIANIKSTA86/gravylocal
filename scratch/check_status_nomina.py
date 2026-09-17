import urllib.request, re, base64

username = '901428834'
password_hash = '8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb'
url = 'https://ws-nomina.facturatech.co/v1/pro/index.php'

docs = [
    (356, 'c9f83d9c8d3290e0b7aecc22fe05a549222649ac5318e83afe6324a07fcb40ed'),
    (357, '932f9a291b00f6f8145566f493bcc0dcf85cd928493395f63ac8a9a9f3521b80'),
    (358, 'd45620545aefd4b890a2d0cc300b3548bfa2b34b9a3904d713482fbc73487423'),
    (359, '7559f7c86df5ea83fd8473d184c8e0fd91e0cfd7b287ff26196bf4d76d9b7e86'),
    (360, '39443fc5dffffd46ff46b2f17d4ee708c9a02e61b5f39b0866b340522d0e62a7'),
    (361, 'fafde8800a32d5b2c5b7a0073102979f3ac6a255c45bb0063d08bdff36011216'),
    (362, '276a1d554bb0a1c6b920bde3fc27d6e40e98c9dee9c680167f521eb19452ac34'),
    (363, '31247e73df63373bcd0a28decaca4c8594ded28686dcab1d0cab18daf05ff528')
]

for num, tx_id in docs:
    envelope = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-nomina.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.documentStatus soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">{username}</username>
         <password xsi:type="xsd:string">{password_hash}</password>
         <transaccionID xsi:type="xsd:string">{tx_id}</transaccionID>
      </urn:FtechAction.documentStatus>
   </soapenv:Body>
</soapenv:Envelope>"""
    req = urllib.request.Request(url, data=envelope.encode('utf-8'), headers={
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws-nomina.facturatech.co/v1/pro/#FtechAction.documentStatus'
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read().decode('utf-8')
            code = re.search(r'<code[^>]*>(.*?)</code>', data)
            msg = re.search(r'<message[^>]*>(.*?)</message>', data)
            msg_err = re.search(r'<messageError[^>]*>(.*?)</messageError>', data)
            doc_m = re.search(r'<documentBase64[^>]*>(.*?)</documentBase64>', data, re.DOTALL)
            has_doc = bool(doc_m and 'xsi:nil="true"' not in doc_m.group(0) and doc_m.group(1).strip())
            c_val = code.group(1) if code else 'err'
            m_val = msg.group(1) if msg else ''
            e_val = msg_err.group(1) if msg_err else ''
            print(f"NOM{num}: code={c_val}, msg={m_val}, err={e_val}, hasDoc={has_doc}")
            if not has_doc:
                print(f"  -> RAW: {data}")
            if has_doc:
                raw_xml = base64.b64decode(doc_m.group(1).strip()).decode('utf-8', errors='ignore')
                cune_m = re.search(r'CUNE="([0-9a-fA-F]{64,96})"', raw_xml) or re.search(r'<cbc:UUID[^>]*>(.*?)</cbc:UUID>', raw_xml)
                print(f"  -> CUNE from XML: {cune_m.group(1) if cune_m else 'none'}, XML len: {len(raw_xml)}")

                # Test downloadCUNE
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
                req_cune = urllib.request.Request(url, data=env_cune.encode('utf-8'), headers={
                    'Content-Type': 'text/xml;charset=UTF-8',
                    'SOAPAction': 'urn:https://ws-nomina.facturatech.co/v1/pro/#FtechAction.downloadCUNE'
                })
                with urllib.request.urlopen(req_cune, timeout=10) as resp_cune:
                    d_cune = resp_cune.read().decode('utf-8')
                    res_cune = re.search(r'<resourceData[^>]*>(.*?)</resourceData>', d_cune)
                    print(f"  -> downloadCUNE result: {res_cune.group(1) if res_cune else d_cune[:150]}")
    except Exception as e:
        print(f"NOM{num}: error={e}")
