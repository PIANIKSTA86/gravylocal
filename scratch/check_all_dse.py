import urllib.request, re, base64

username = '901428834'
password_hash = '8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb'
url = 'https://ws-dse.facturatech.co/v1/pro/'

def test_dse_number(prefix, num):
    envelope = f"""<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-dse.facturatech.co/v1/pro/">
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
    req = urllib.request.Request(url, data=envelope.encode('utf-8'), headers={
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws-dse.facturatech.co/v1/pro/downloadCUDSResponse'
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read().decode('utf-8')
            code = re.search(r'<code[^>]*>(.*?)</code>', data)
            res = re.search(r'<resourceData[^>]*>(.*?)</resourceData>', data)
            c_val = code.group(1) if code else 'err'
            cude = res.group(1) if res else ''
            print(f"{prefix}{num}: code={c_val}, cude={cude[:20]}... (len={len(cude)})")
            return c_val == '200' and len(cude) > 30, cude
    except Exception as e:
        print(f"{prefix}{num}: error={e}")
        return False, ''

for n in [291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316]:
    test_dse_number('DSE', n)
