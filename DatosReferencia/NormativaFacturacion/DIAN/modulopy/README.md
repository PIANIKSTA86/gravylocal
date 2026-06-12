# 🇨🇴 PyDian

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![DIAN](https://img.shields.io/badge/DIAN-Factura%20Electrónica-blue)](https://www.dian.gov.co)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange)]()

> 🇨🇴 Librería Python open source para facturación electrónica en Colombia. Implementa el estándar DIAN: XML UBL 2.1, firma digital, transmisión SOAP y validación. Ideal para desarrollar software contable, SaaS o ERP propio. Uso comercial libre bajo licencia MIT.
>
> ---
>
> ## ✨ Features
>
> - ✅ Generación de Facturas Electrónicas de Venta (XML UBL 2.1)
> - - ✅ Notas Crédito y Notas Débito
>   - - ✅ Documento Soporte de Pago
>     - - ✅ Nómina Electrónica
>       - - ✅ Firma Digital (XAdES-BES)
>         - - ✅ Transmisión a Web Services DIAN (SOAP)
>           - - ✅ Validación de respuestas DIAN (CUFE / CUDE)
>             - - ✅ Ambientes de pruebas y producción
>               - - 🔄 Registro de eventos del documento electrónico *(en desarrollo)*
>                
>                 - ---
>
> ## 🚀 ¿Qué puedes construir con PyDian?
>
> - Tu propio **software contable** o ERP
> - - Un **SaaS de facturación** para vender a empresas
>   - - Una **integración** para e-commerce o punto de venta
>     - - Un **conector** para Odoo, Shopify, WooCommerce, etc.
>      
>       - ---
>
> ## 📦 Instalación
>
> ```bash
> pip install pydian
> ```
>
> ---
>
> ## 🛠️ Stack Tecnológico
>
> | Tecnología | Uso |
> |---|---|
> | Python 3.10+ | Lenguaje principal |
> | lxml | Generación y validación XML |
> | signxml | Firma digital XAdES-BES |
> | zeep | Cliente SOAP para Web Services DIAN |
> | cryptography | Manejo de certificados digitales |
> | FastAPI | API REST opcional |
> | pytest | Testing |
>
> ---
>
> ## 📁 Estructura del Proyecto
>
> ```
> PyDian/
> ├── pydian/
> │   ├── __init__.py
> │   ├── factura/          # Generación de facturas XML UBL 2.1
> │   ├── notas/            # Notas crédito y débito
> │   ├── nomina/           # Nómina electrónica
> │   ├── soporte/          # Documento soporte de pago
> │   ├── firma/            # Firma digital XAdES-BES
> │   ├── ws/               # Web Services DIAN (SOAP)
> │   ├── validacion/       # Validación CUFE / CUDE
> │   └── utils/            # Utilidades generales
> ├── tests/                # Tests unitarios e integración
> ├── examples/             # Ejemplos de uso
> ├── docs/                 # Documentación
> ├── .env.example
> ├── requirements.txt
> ├── setup.py
> └── README.md
> ```
>
> ---
>
> ## ⚖️ Licencia
>
> MIT License — libre para uso personal, comercial y empresarial.
> Solo mantén el aviso de copyright original.
>
> > ⚠️ **Aviso legal:** Para emitir facturas en producción, tu empresa debe estar habilitada como Proveedor Tecnológico o Facturador Electrónico ante la DIAN (Resolución 000042 de 2020). Esta librería es una herramienta técnica y no reemplaza dicho proceso.
> >
> > ---
> >
> > ## 👥 Projects
> >
> > | Developer | GitHub | Role |
> > |---|---|---|
> > | Franklin Caza | [@franklincaza](https://github.com/franklincaza) | Creator & Lead Developer |
> >
> > ---
> >
> > ## 🤝 Contribuciones
> >
> > ¡Las contribuciones son bienvenidas! Abre un issue o pull request.
> >
> > ---
> >
> > ## 📞 Contacto
> >
> > ¿Preguntas o sugerencias? Abre un [issue](https://github.com/Fofimatic/PyDian/issues) en el repositorio.
