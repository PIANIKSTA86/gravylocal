/**
 * GRAVY v2.0 — legal-center.ts
 * Centro Legal, Cumplimiento Normativo, Habeas Data y Marco de Algoritmos Locales.
 * Adaptado bajo el estándar de Términos y Condiciones de plataformas contables líderes (Alegra).
 * Titularidad exclusiva: JULIÁN ESPINOSA ARRUBLA (C.C. 1130636393).
 *
 * Diseñado bajo estándares de Human Interface Design:
 * - Tipografía descansada con medida máxima de 65ch y text-wrap: pretty.
 * - Paleta cálida orgánica con neutros tintados (sin contrastes halógenos).
 * - Arquitectura asimétrica 30/70 (Índice y herramientas / Prosa jurídica).
 * - Cero jerga vacía ni superlativos de IA.
 */

'use strict';

declare var pb: any;
declare var API: any;
declare var esc: any;
declare var showToast: any;
declare var navigate: any;

let currentDeploymentMode: 'local' | 'cloud' = 'local';
let activeSectionIndex: number = 0;

interface LegalSection {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  summary: string;
  localContent: string;
  cloudContent: string;
}

const LEGAL_SECTIONS: LegalSection[] = [
  {
    id: 'aceptacion-definiciones',
    title: '1. Aceptación, Capacidad Legal y Definiciones',
    badge: 'Ley 527 de 1999 / C.Co',
    badgeColor: '#7C3AED',
    summary: 'Perfeccionamiento del contrato electrónico, facultades legales para contratar y glosario técnico de la plataforma.',
    localContent: `
      <h4>1.1. Perfeccionamiento y Consentimiento Electrónico</h4>
      <p>
        El acceso, instalación, descarga, ejecución local o uso continuo de <strong>GRAVY</strong> constituye la celebración de un contrato vinculante entre el Suscriptor y <strong>JULIÁN ESPINOSA ARRUBLA</strong> (C.C. 1130636393), regido por la <strong>Ley 527 de 1999</strong> sobre Comercio Electrónico y Mensajes de Datos. Si el usuario no está de acuerdo con la totalidad de estas estipulaciones, debe abstenerse de instalar y utilizar el software.
      </p>
      <h4>1.2. Capacidad Legal para Contratar</h4>
      <p>
        El servicio está dirigido exclusivamente a personas naturales mayores de edad con plena capacidad legal para contraer obligaciones en Colombia o en su jurisdicción de residencia, y a personas jurídicas a través de sus representantes legales debidamente acreditados mediante certificado de existencia y representación legal de la Cámara de Comercio.
      </p>
      <h4>1.3. Glosario Operativo</h4>
      <ul style="padding-left:20px;margin-bottom:12px;list-style:disc">
        <li><strong>Sistema GRAVY:</strong> Conjunto de programas informáticos, módulos contables, interfaces de usuario, motores de bases de datos PocketBase/SQLite y documentación técnica desarrollada por el titular.</li>
        <li><strong>Suscriptor / Titular de la Licencia:</strong> Persona natural o jurídica que adquiere los derechos de uso sobre una instalación del software.</li>
        <li><strong>Usuarios Autorizados:</strong> Empleados, contadores o colaboradores a quienes el Suscriptor habilita credenciales de acceso bajo su responsabilidad.</li>
        <li><strong>Datos del Cliente:</strong> Toda la información financiera, comercial, inventarios, transacciones contables, registros de nómina y datos de terceros ingresados en el aplicativo.</li>
        <li><strong>Instancia Local-First:</strong> Despliegue donde los ejecutables y la base de datos residen de forma aislada en la infraestructura informática física del Suscriptor.</li>
      </ul>
    `,
    cloudContent: `
      <h4>1.1. Celebración de Contrato SaaS en Línea</h4>
      <p>
        Al registrar una cuenta en la nube de <strong>GRAVY</strong>, seleccionar un plan de suscripción o hacer clic en "Iniciar Sesión", el Suscriptor suscribe un contrato de prestación de servicios de software como servicio (SaaS) con <strong>JULIÁN ESPINOSA ARRUBLA</strong> (C.C. 1130636393), plenamente válido según la <strong>Ley 527 de 1999</strong>.
      </p>
      <h4>1.2. Capacidad y Declaración de Facultades</h4>
      <p>
        El usuario que crea la cuenta manifiesta bajo la gravedad de juramento que ostenta la representación legal y facultades contractuales suficientes para obligar a la entidad mercantil en cuyo nombre contrata la plataforma.
      </p>
      <h4>1.3. Glosario del Servicio Cloud</h4>
      <ul style="padding-left:20px;margin-bottom:12px;list-style:disc">
        <li><strong>Servicio SaaS:</strong> Acceso remoto vía navegador web a las funcionalidades administrativas y contables alojadas en infraestructura centralizada en la nube de Amazon Web Services (AWS).</li>
        <li><strong>Tenant / Inquilino:</strong> Entorno lógico e informático independiente asignado a cada empresa suscriptora en los servidores en la nube.</li>
        <li><strong>Proveedor de Hosting Cloud:</strong> Centros de cómputo de alta seguridad de Amazon Web Services (AWS) utilizados para servir la plataforma.</li>
      </ul>
    `
  },
  {
    id: 'licencia-precios',
    title: '2. Objeto del Servicio, Licencia y Planes',
    badge: 'Ley 23 de 1982 / DNDA',
    badgeColor: '#2563EB',
    summary: 'Alcance de la licencia no exclusiva ("tal como es" / as is), restricciones de explotación y régimen de pagos.',
    localContent: `
      <h4>2.1. Concesión de Licencia de Uso</h4>
      <p>
        El titular concede al Suscriptor una <strong>licencia de uso no exclusiva, intransferible, revocable y no sublicenciable</strong> para instalar y operar GRAVY en sus equipos o red local de negocios. El software se suministra bajo el principio <strong>"tal como es" (as is)</strong> y según disponibilidad técnica.
      </p>
      <h4>2.2. Restricciones Absolutas de Uso</h4>
      <p>
        El Suscriptor se abstendrá terminantemente de:
      </p>
      <ul style="padding-left:20px;margin-bottom:12px;list-style:disc">
        <li>Descompilar, desensamblar, realizar ingeniería inversa o intentar descifrar el código fuente de los módulos o hooks del sistema.</li>
        <li>Remover o alterar las menciones de derechos de autor, firmas criptográficas o nombres comerciales de Julián Espinosa Arrubla.</li>
        <li>Revender, arrendar, distribuir o prestar servicios a terceros bajo la modalidad de marca blanca sin un contrato previo y formal de franquicia de software.</li>
        <li>Vulnerar o eludir los límites de terminales, usuarios o llaves de módulos licenciados.</li>
      </ul>
      <h4>2.3. Precios y Cuotas de Licenciamiento</h4>
      <p>
        El costo de las licencias locales se regirá por la cotización comercial formal aprobada. Las retenciones en la fuente aplicables conforme al Estatuto Tributario colombiano serán asumidas por el Suscriptor en caso de no suministrar el certificado correspondiente.
      </p>
    `,
    cloudContent: `
      <h4>2.1. Concesión de Acceso SaaS Temporal</h4>
      <p>
        El Suscriptor adquiere el derecho de acceder temporalmente al sistema GRAVY Cloud mediante el pago recurrente de una tarifa periódica (mensual o anual). La licencia de acceso concluye inmediatamente si cesan los pagos pactados.
      </p>
      <h4>2.2. Planes, Tarifas y Modificaciones Comerciales</h4>
      <p>
        El Suscriptor selecciona el plan según el número de comprobantes, sucursales y usuarios requeridos. El operador se reserva la facultad de actualizar las tarifas de suscripción previa notificación enviada con al menos treinta (30) días de antelación al correo registrado.
      </p>
      <h4>2.3. Régimen de Pagos y Retenciones Fiscales</h4>
      <p>
        Los pagos de suscripción se efectúan por adelantado mediante los canales habilitados. Todo impuesto indirecto o retención tributaria aplicable corre por cuenta del Suscriptor, garantizando que el operador reciba el valor neto convenido para el sostenimiento de los servidores.
      </p>
    `
  },
  {
    id: 'deslinde-contable',
    title: '3. Exención de Asesoría Contable, Fiscal y Legal',
    badge: 'Ley 43 de 1990 / C.Co',
    badgeColor: '#059669',
    summary: 'La plataforma es una herramienta de cálculo y registro; no reemplaza la fe pública ni el criterio del Contador Público.',
    localContent: `
      <h4>3.1. Naturaleza Tecnológica No Profesional</h4>
      <p>
        Al igual que el estándar legal de las plataformas de software de gestión como Alegra, <strong>GRAVY es una herramienta informática de automatización transaccional y cálculo matemático</strong>. En ningún caso presta servicios de asesoría contable, consultoría tributaria, auditoría financiera ni representación jurídica.
      </p>
      <h4>3.2. Deber Exclusivo del Contador Público y Representante Legal</h4>
      <p>
        Conforme a la <strong>Ley 43 de 1990</strong> y los <strong>Artículos 19, 48 a 60, 200 y 207 del Código de Comercio de Colombia</strong>, la fe pública sobre la razonabilidad de los estados financieros, la liquidación de tributos, la causación con partida doble estricta y los inventarios recae de forma personal e intransferible en el <strong>Contador Público Titulado</strong> y en el <strong>Representante Legal</strong> de la empresa suscriptora.
      </p>
      <h4>3.3. Exoneración por Errores de Parametrización y Liquidación</h4>
      <p>
        El Suscriptor es el único obligado tributario frente a la Dirección de Impuestos y Aduanas Nacionales (DIAN), la UGPP y las secretarías de hacienda distritales o municipales. Julián Espinosa Arrubla queda enteramente exonerado por sanciones, multas, intereses moratorios o pliegos de cargos originados por:
      </p>
      <ul style="padding-left:20px;margin-bottom:12px;list-style:disc">
        <li>Configuración errada de planes de cuentas, tarifas de retención en la fuente, autorretenciones o bases gravables de IVA e ICA.</li>
        <li>Presentación extemporánea o con inconsistencias de declaraciones de impuestos o información exógena distrital o nacional.</li>
        <li>Omisión en el registro de novedades laborales o cálculo incorrecto de prestaciones sociales en el módulo de nómina.</li>
      </ul>
    `,
    cloudContent: `
      <h4>3.1. Delimitación Estricta del Rol Tecnológico</h4>
      <p>
        GRAVY Cloud provee una plataforma tecnológica en la nube para procesar transacciones contables; no emite juicios periciales ni certifica balances. La revisión de los informes contables antes de su firma oficial es deber ineludible del equipo contable del Suscriptor.
      </p>
      <h4>3.2. Inexistencia de Responsabilidad Solidaria Fiscal</h4>
      <p>
        El titular no asume responsabilidad solidaria, subsidiaria ni vicaria ante litigios de índole laboral, tributario o societario que afecten al Suscriptor. El Suscriptor se compromete a mantener a Julián Espinosa Arrubla libre de toda reclamación administrativa, fiscal o judicial.
      </p>
    `
  },
  {
    id: 'documentos-dian',
    title: '4. Documentos Electrónicos e Integración DIAN',
    badge: 'Resoluciones DIAN UBL 2.1',
    badgeColor: '#D97706',
    summary: 'Responsabilidad en facturación electrónica, nómina, documento soporte, certificados digitales y contingencias.',
    localContent: `
      <h4>4.1. Generación de Estándares Electrónicos UBL 2.1</h4>
      <p>
        GRAVY incorpora módulos para estructurar archivos XML validados bajo las directrices del Anexo Técnico de Factura Electrónica, Nómina Electrónica, Documento Soporte a No Obligados y eventos RADIAN de la DIAN.
      </p>
      <h4>4.2. Deberes del Contribuyente respecto a Resoluciones y Certificados</h4>
      <p>
        Es responsabilidad exclusiva del Suscriptor:
      </p>
      <ul style="padding-left:20px;margin-bottom:12px;list-style:disc">
        <li>Tramitar, habilitar y asociar ante el portal Muisca de la DIAN los prefijos, números y claves técnicas de sus resoluciones de facturación.</li>
        <li>Adquirir y custodiar el Certificado Digital de Firma (CD) emitido por una entidad de certificación abierta autorizada por la ONAC.</li>
        <li>Monitorear la fecha de caducidad de sus resoluciones y vigencias de numeración.</li>
      </ul>
      <h4>4.3. Obligación de Contingencia (Tipo 03 y 04 DIAN)</h4>
      <p>
        Si por fallas ajenas a la plataforma (intermitencia de internet o caídas de los servicios de validación previa de la DIAN) no es posible la transmisión en tiempo real, el Suscriptor tiene la obligación legal de emitir facturas en contingencia (talonario o papel) según lo ordena la normativa tributaria.
      </p>
      <h4>4.4. Exclusión de Responsabilidad por Fallas de la DIAN</h4>
      <p>
        El titular no responderá por demoras, rechazos de paquetes XML, suspensiones de servicio o caídas masivas en los servidores informáticos de la DIAN (Muisca / MUISCA II) ni de proveedores de telecomunicaciones.
      </p>
    `,
    cloudContent: `
      <h4>4.1. Integración en la Nube con Entidades de Validación</h4>
      <p>
        La versión Cloud de GRAVY despacha transacciones electrónicas a través de servicios web seguros hacia la DIAN o Proveedores Tecnológicos autorizados.
      </p>
      <h4>4.2. Custodia del Certificado de Firma Digital</h4>
      <p>
        Cuando el Suscriptor carga su certificado digital para la firma automatizada de facturas, autoriza su uso exclusivamente para estampar la firma electrónica de sus propios comprobantes, manteniendo la reserva de la contraseña del contenedor PKCS#12 (.p12).
      </p>
      <h4>4.3. Exclusión por Rechazos de Validación Previa</h4>
      <p>
        Cualquier factura rechazada por el motor de validación previa de la DIAN debido a datos de terceros inválidos, NITs inexistentes o problemas de cálculo imputables al emisor deberá ser corregida por el Suscriptor sin derivar responsabilidad para el operador de GRAVY.
      </p>
    `
  },
  {
    id: 'seguridad-infraestructura',
    title: '5. Seguridad, Cuentas e Infraestructura Cloud (AWS)',
    badge: 'Seguridad & AWS Cloud',
    badgeColor: '#475569',
    summary: 'Custodia de contraseñas, arquitectura de aislamiento multi-inquilino en Amazon Web Services y disponibilidad SLA.',
    localContent: `
      <h4>5.1. Seguridad de Cuentas y Credenciales de Acceso</h4>
      <p>
        El Suscriptor y sus usuarios autorizados son los únicos responsables de salvaguardar la confidencialidad de sus nombres de usuario, contraseñas y llaves de acceso. Cualquier operación efectuada con sus credenciales se entenderá válidamente ejecutada por el titular.
      </p>
      <h4>5.2. Infraestructura Física y Hardware Local</h4>
      <p>
        En la modalidad local, la protección física del servidor, antivirus, cortafuegos (firewalls) y restricciones de puertos en la red local recaen 100% sobre el administrador informático del Suscriptor. Julián Espinosa Arrubla no responde por secuestro de datos (ransomware), fallas de discos o accesos indebidos en las instalaciones del cliente.
      </p>
    `,
    cloudContent: `
      <h4>5.1. Infraestructura Cloud en Amazon Web Services (AWS)</h4>
      <p>
        Los servidores de GRAVY Cloud se encuentran alojados en la infraestructura de <strong>Amazon Web Services (AWS)</strong>, certificada bajo estándares internacionales <strong>ISO 27001, SOC 1, SOC 2 Tipo II y PCI-DSS</strong>.
      </p>
      <h4>5.2. Aislamiento Multi-Inquilino y Cifrado</h4>
      <p>
        Cada empresa suscriptora dispone de una base de datos físicamente segregada o aislada criptográficamente (Database-per-tenant), evitando cualquier riesgo de filtración o cruce de datos contables entre distintas empresas (*Zero Cross-Tenant Leakage*). Los datos se almacenan cifrados en reposo mediante el algoritmo <strong>AES-256</strong> y en tránsito mediante <strong>TLS 1.3 / HTTPS</strong>.
      </p>
      <h4>5.3. Disponibilidad del Servicio (SLA) y Exoneración</h4>
      <p>
        El operador establece una meta de disponibilidad mensual del <strong>99.5%</strong> del servicio, excluyendo paradas por mantenimiento programado. Se exime a Julián Espinosa Arrubla de cualquier indemnización por caídas de red troncal, problemas de enrutamiento BGP mundial, cortes de cables submarinos o fallas generales de los datacenters de AWS o Cloudflare.
      </p>
    `
  },
  {
    id: 'conservacion-backups',
    title: '6. Conservación Mercantil de Libros y Backups',
    badge: 'Arts. 48-60 C.Co / E.T.',
    badgeColor: '#0284C7',
    summary: 'Obligación legal de conservación de libros contables por 5 a 10 años, copias periódicas y 30 días de gracia.',
    localContent: `
      <h4>6.1. Deber Mercantil de Custodia por 5 a 10 Años</h4>
      <p>
        De acuerdo con los <strong>Artículos 48 a 60 del Código de Comercio</strong> y el <strong>Artículo 616-1 del Estatuto Tributario</strong>, los comerciantes colombianos están obligados a conservar los libros de contabilidad, correspondencia comercial y comprobantes justificativos durante al menos <strong>5 años</strong> (término de firmeza tributaria) o <strong>10 años</strong> (código mercantil).
      </p>
      <h4>6.2. El Software No es un Archivo Notarial Perpetuo</h4>
      <p>
        <strong>GRAVY es un sistema informático de procesamiento contable, no un almacén notarial perpetuo</strong>. Es obligación inexcusable del Suscriptor ejecutar copias de seguridad locales periódicas a través del generador de respaldos del sistema (archivos <code>.zip</code> encriptados) y resguardarlas en dispositivos externos seguros.
      </p>
      <h4>6.3. Pérdida de Datos por Omisión de Copias</h4>
      <p>
        El titular queda libre de toda responsabilidad ante pérdidas de información contable causadas por formateo indebido, daños en discos de almacenamiento o ausencia de rutinas preventivas de copia por parte del Suscriptor.
      </p>
    `,
    cloudContent: `
      <h4>6.1. Deber de Exportación Periódica por el Suscriptor</h4>
      <p>
        Aunque la infraestructura en la nube efectúa copias de seguridad automatizadas con fines de recuperación ante desastres (Disaster Recovery), el Suscriptor debe descargar mensualmente sus libros oficiales (Balance de Comprobación, Diario Mayor y Auxiliares) en formatos estándar (PDF y Excel).
      </p>
      <h4>6.2. Política de Suspensión por Mora y 30 Días de Gracia</h4>
      <p>
        En caso de mora superior a los plazos pactados o cancelación voluntaria de la suscripción:
      </p>
      <ul style="padding-left:20px;margin-bottom:12px;list-style:disc">
        <li>Se garantizará al Suscriptor un <strong>período de gracia improrrogable de treinta (30) días calendario</strong> para acceder y exportar la totalidad de su información contable y reportes tributarios.</li>
        <li>Transcurridos los 30 días de gracia sin que se reactive la cuenta, el operador queda plenamente autorizado por la ley para proceder al <strong>borrado seguro y desaprovisionamiento definitivo</strong> de la base de datos y archivos en la nube, sin incurrir en custodia indebida, retención documental ni indemnizaciones por perjuicios.</li>
      </ul>
    `
  },
  {
    id: 'habeas-data-ia',
    title: '7. Tratamiento de Datos (Habeas Data) e IA Local',
    badge: 'Ley 1581 de 2012 / SIC',
    badgeColor: '#9333EA',
    summary: 'Contrato de Transmisión DPA, transmisión internacional a datacenters AWS, derechos ARCO y modelos de cálculo locales.',
    localContent: `
      <h4>7.1. Custodia Hermética en Arquitectura Local-First</h4>
      <p>
        Bajo esta modalidad, <strong>el Suscriptor es el único y exclusivo RESPONSABLE DEL TRATAMIENTO</strong> de los datos personales (clientes, nómina, empleados y proveedores) según la <strong>Ley Estatutaria 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong>.
      </p>
      <p>
        <strong>Julián Espinosa Arrubla NO accede, no recopila ni transfiere los registros almacenados en el servidor local del cliente</strong>. Los derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) deben ser ejercidos directamente ante el departamento de atención del Suscriptor.
      </p>
      <h4>7.2. Algoritmos Locales y Supervisión Humana (Human-in-the-Loop)</h4>
      <p>
        Los módulos inteligentes (compra sugerida, alertas de stock mínimo y predicción de flujo de caja) ejecutan modelos matemáticos y estadísticos estrictamente locales. <strong>Ningún dato contable es enviado a servidores externos de inteligencia artificial pública (como OpenAI ChatGPT o Google Gemini) para entrenamiento comercial</strong>. Toda sugerencia analítica debe ser revisada y aprobada por un operador humano calificado.
      </p>
    `,
    cloudContent: `
      <h4>7.1. Acuerdo de Transmisión de Datos (DPA Obligatorio)</h4>
      <p>
        En la modalidad Cloud SaaS, el Suscriptor actúa como <strong>RESPONSABLE DEL TRATAMIENTO</strong> (Data Controller) y <strong>JULIÁN ESPINOSA ARRUBLA</strong> actúa como <strong>ENCARGADO DEL TRATAMIENTO</strong> (Data Processor) bajo el Artículo 3 de la <strong>Ley 1581 de 2012</strong>.
      </p>
      <h4>7.2. Finalidad Exclusiva y Confidencialidad</h4>
      <p>
        El Encargado se compromete a no monetizar, no transferir ni comercializar los datos contables del Suscriptor, procesándolos únicamente para habilitar el funcionamiento de GRAVY SaaS.
      </p>
      <h4>7.3. Transmisión Internacional hacia Servidores AWS</h4>
      <p>
        El Suscriptor autoriza expresamente la transmisión internacional de los datos hacia los datacenters de <strong>Amazon Web Services (AWS)</strong> en Estados Unidos (regiones como <code>us-east-1</code>), cumpliendo con los estándares de seguridad exigidos por la Superintendencia de Industria y Comercio (SIC).
      </p>
      <h4>7.4. Canal Oficial para Derechos ARCO</h4>
      <p>
        Las peticiones de Habeas Data relativas a la plataforma de software se canalizan a través del correo oficial: <a href="mailto:gravy.legal@gmail.com" style="color:#7C3AED; font-weight:700;">gravy.legal@gmail.com</a>.
      </p>
    `
  },
  {
    id: 'responsabilidad-jurisdiccion',
    title: '8. Limitación de Responsabilidad, Indemnidad y Jurisdicción',
    badge: 'Indemnidad & Cali, Colombia',
    badgeColor: '#E11D48',
    summary: 'Blindaje jurídico integral, cláusula de indemnidad (hold harmless), tope indemnizatorio y sede contractual en Cali.',
    localContent: `
      <h4>8.1. Cláusula de Indemnidad (Hold Harmless)</h4>
      <p>
        El Suscriptor se compromete expresamente a defender, indemnizar y mantener indemne a <strong>JULIÁN ESPINOSA ARRUBLA</strong>, así como a sus dependientes y colaboradores, frente a cualquier investigación, queja, demanda, sanción pecuniaria de la DIAN, Superintendencia de Industria y Comercio (SIC), UGPP o litigios derivados del uso del software, falsedad en documentos, defraudación tributaria o violación de normativas laborales por parte del Suscriptor.
      </p>
      <h4>8.2. Limitación Cuantitativa de Responsabilidad Contractual</h4>
      <p>
        En ningún caso Julián Espinosa Arrubla responderá por <strong>daño emergente indirecto, lucro cesante, pérdida de ingresos, pérdida de oportunidades de negocio ni interrupción comercial</strong>. La responsabilidad económica máxima acumulada del titular por cualquier concepto se limitará estrictamente al valor efectivamente pagado por el Suscriptor por el software en los últimos tres (3) meses de servicio.
      </p>
      <h4>8.3. Reserva de Propiedad Intelectual</h4>
      <p>
        Todos los derechos morales y patrimoniales de autor sobre GRAVY (código fuente, interfaces, esquemas y rutinas) corresponden de forma perpetua a <strong>JULIÁN ESPINOSA ARRUBLA (C.C. 1130636393)</strong>, amparado por la Ley 23 de 1982 y la Decisión Andina 351 de 1993.
      </p>
      <h4>8.4. Ley Aplicable y Domicilio Contractual</h4>
      <p>
        Estos términos se rigen en su totalidad por las leyes de la <strong>República de Colombia</strong>. Para cualquier discrepancia o litigio derivado de la ejecución o interpretación de este acuerdo, las partes fijan como domicilio contractual y judicial exclusivo la ciudad de <strong>Cali / Valle del Cauca, Colombia</strong>. Notificaciones oficiales: <a href="mailto:gravy.legal@gmail.com" style="color:#7C3AED; font-weight:700;">gravy.legal@gmail.com</a>.
      </p>
    `,
    cloudContent: `
      <h4>8.1. Indemnidad Plena por Operaciones del Suscriptor</h4>
      <p>
        El Suscriptor garantiza que las actividades contables y comerciales gestionadas en GRAVY Cloud son lícitas y cumplen con el marco normativo colombiano, obligándose a responder pecuniariamente por cualquier reclamación que un tercero intente contra el titular de la plataforma.
      </p>
      <h4>8.2. Límite Indemnizatorio Acordado</h4>
      <p>
        Conforme al principio de autonomía de la voluntad privada de las partes, el Suscriptor renuncia a exigir indemnizaciones por lucro cesante o pérdidas derivadas de ataques informáticos o caídas de conectividad. Cualquier reclamo procedente no podrá superar el equivalente a tres (3) cánones mensuales de suscripción pagados inmediatamente antes del evento reclamado.
      </p>
      <h4>8.3. Sede Judicial y Resolución de Conflictos</h4>
      <p>
        Cualquier diferencia se someterá prioritariamente a un arreglo directo o centro de conciliación en la ciudad de <strong>Cali / Valle del Cauca, Colombia</strong>, antes de acudir a la jurisdicción ordinaria colombiana.
      </p>
    `
  }
];

/**
 * Renderiza la interfaz principal del Centro Legal de GRAVY.
 */
async function renderLegalCenter(container: HTMLElement): Promise<void> {
  const getContainer = (window as any).getPageContainer || ((x: any, k: string) => x || document.getElementById('tab-pane-' + k));
  container = getContainer(container, 'centro-legal');
  if (!container) return;

  // Cargar parámetros dinámicos de settings
  let contactEmail = 'gravy.legal@gmail.com';
  let jurisdictionCity = 'Cali / Valle del Cauca, Colombia';
  let deploymentModeSetting = 'local';

  try {
    if (typeof API !== 'undefined' && API.getSetting) {
      const [emailVal, cityVal, modeVal] = await Promise.all([
        API.getSetting('legal_contact_email').catch(() => ''),
        API.getSetting('legal_jurisdiction_city').catch(() => ''),
        API.getSetting('service_deployment_mode').catch(() => ''),
      ]);
      if (emailVal) contactEmail = emailVal;
      if (cityVal) jurisdictionCity = cityVal;
      if (modeVal === 'cloud' || modeVal === 'local') deploymentModeSetting = modeVal;
    }
  } catch (_) {}

  currentDeploymentMode = deploymentModeSetting as any;

  container.innerHTML = `
    <div class="legal-center-root anim-fade" style="padding: 20px 24px 48px; max-width: 1400px; margin: 0 auto; color: #0F172A;">
      <!-- Cabecera Institucional sobria y editorial -->
      <div class="legal-header" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:18px; padding:28px 32px; margin-bottom:24px; box-shadow:0 4px 16px -2px rgba(15,23,42,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:inline-flex; align-items:center; gap:8px; padding:4px 12px; border-radius:20px; background:#F5F3FF; color:#7C3AED; font-size:11px; font-weight:700; margin-bottom:12px; letter-spacing:0.04em;">
              <i class="fas fa-shield-halved"></i> MARCO LEGAL, SEGURIDAD & COMPLIANCE — ESTÁNDAR ALEGRA
            </div>
            <h2 style="font-family:'Fraunces', Georgia, serif; font-size:26px; font-weight:700; color:#0F172A; margin:0 0 6px; letter-spacing:-0.02em;">
              Centro de Cumplimiento Normativo y Términos de Servicio
            </h2>
            <p style="font-size:13.5px; color:#475569; margin:0; max-width:75ch; line-height:1.6;">
              Términos contractuales vinculantes, deslinde de responsabilidad contable y fiscal, obligaciones de facturación electrónica DIAN, política de Habeas Data y marco de algoritmos de <strong>GRAVY v2.0</strong>.
            </p>
          </div>

          <!-- Botones de Acción: Modo y Descarga PDF -->
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:10px;">
            <div style="display:inline-flex; background:#F1F5F9; padding:3px; border-radius:12px; border:1px solid #CBD5E1;">
              <button type="button" id="btn-mode-local" class="legal-mode-btn ${currentDeploymentMode === 'local' ? 'active' : ''}" style="border:none; padding:7px 14px; font-size:12px; font-weight:600; border-radius:9px; cursor:pointer; transition:all 0.15s ease;">
                <i class="fas fa-hard-drive mr-1"></i> Modo Local-First
              </button>
              <button type="button" id="btn-mode-cloud" class="legal-mode-btn ${currentDeploymentMode === 'cloud' ? 'active' : ''}" style="border:none; padding:7px 14px; font-size:12px; font-weight:600; border-radius:9px; cursor:pointer; transition:all 0.15s ease;">
                <i class="fas fa-cloud mr-1"></i> Modo Cloud SaaS (AWS)
              </button>
            </div>
            <button type="button" id="btn-export-legal-pdf" class="btn btn-outline" style="font-size:12px; font-weight:700; border-color:#CBD5E1; color:#0F172A; padding:8px 16px; border-radius:10px; cursor:pointer;">
              <i class="fas fa-file-pdf mr-1" style="color:#DC2626;"></i> Descargar Manifiesto Legal (PDF)
            </button>
          </div>
        </div>

        <!-- Banner de Titularidad Protegida -->
        <div style="margin-top:20px; padding:12px 18px; border-radius:12px; background:#FAF8F5; border-left:4px solid #7C3AED; font-size:12.5px; color:#334155; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <strong>Titular Exclusivo de Derechos de Autor:</strong> JULIÁN ESPINOSA ARRUBLA (C.C. 1130636393).
            <span style="color:#64748B; margin-left:8px;">Amparado por la Ley 23 de 1982 y Decisión Andina 351 de 1993.</span>
          </div>
          <div style="font-size:11.5px; color:#64748B;">
            Jurisdicción: <strong>${esc(jurisdictionCity)}</strong> | Notificaciones: <strong>${esc(contactEmail)}</strong>
          </div>
        </div>
      </div>

      <!-- Layout Asimétrico 30 / 70 -->
      <div style="display:grid; grid-template-columns:330px 1fr; gap:24px; align-items:start;" id="legal-grid-wrap">
        
        <!-- Columna Izquierda: Índice y Buscador (30%) -->
        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:16px; padding:20px; position:sticky; top:20px;">
          <div style="margin-bottom:14px;">
            <label style="display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#64748B; margin-bottom:6px;">
              Búsqueda en el Manifiesto
            </label>
            <div style="position:relative;">
              <input type="text" id="legal-search-input" placeholder="Filtrar cláusula o normativa..." 
                style="width:100%; font-size:12.5px; padding:8px 12px 8px 32px; border-radius:10px; border:1px solid #CBD5E1; outline:none; background:#F8FAFC;">
              <i class="fas fa-magnifying-glass" style="position:absolute; left:11px; top:10px; font-size:12px; color:#94A3B8;"></i>
            </div>
          </div>

          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#64748B; margin:16px 0 8px;">
            Estructura Contractual (${LEGAL_SECTIONS.length} Capítulos)
          </div>

          <nav id="legal-nav-list" style="display:flex; flex-direction:column; gap:6px;">
            ${LEGAL_SECTIONS.map((sec, idx) => `
              <button type="button" class="legal-nav-btn ${idx === activeSectionIndex ? 'active' : ''}" data-idx="${idx}"
                style="text-align:left; border:none; background:${idx === activeSectionIndex ? '#F5F3FF' : 'transparent'}; color:${idx === activeSectionIndex ? '#6D28D9' : '#334155'}; padding:10px 12px; border-radius:10px; font-size:12px; font-weight:${idx === activeSectionIndex ? '700' : '500'}; cursor:pointer; display:flex; flex-direction:column; gap:3px; transition:all 0.15s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="line-height:1.35;">${esc(sec.title)}</span>
                </div>
                <span style="font-size:9.5px; color:${sec.badgeColor}; font-weight:700;">${esc(sec.badge)}</span>
              </button>
            `).join('')}
          </nav>

          <div style="margin-top:20px; padding-top:16px; border-top:1px solid #F1F5F9; font-size:11px; color:#64748B; line-height:1.5;">
            <i class="fas fa-info-circle mr-1" style="color:#7C3AED;"></i>
            Marco legal redactado conforme a los estándares de plataformas SaaS de facturación y contabilidad en Colombia.
          </div>
        </div>

        <!-- Columna Derecha: Prosa Legal y Cláusulas (70%) -->
        <main id="legal-content-pane" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:16px; padding:32px 40px; box-shadow:0 4px 16px -2px rgba(15,23,42,0.03);">
          <!-- Se inyecta dinámicamente con _renderSectionContent -->
        </main>
      </div>
    </div>
  `;

  // Estilos dedicados inyectados para botones activos y responsive
  _injectLegalStyles();

  // Renderizar la sección activa
  _renderSectionContent(container, contactEmail, jurisdictionCity);

  // Vincular eventos
  _bindLegalEvents(container, contactEmail, jurisdictionCity);
}

/**
 * Renderiza el cuerpo de la sección activa según el modo seleccionado.
 */
function _renderSectionContent(container: HTMLElement, contactEmail: string, jurisdictionCity: string): void {
  const contentPane = container.querySelector('#legal-content-pane') as HTMLElement;
  if (!contentPane) return;

  const sec = LEGAL_SECTIONS[activeSectionIndex];
  if (!sec) return;

  const isLocal = currentDeploymentMode === 'local';
  const clauseBody = isLocal ? sec.localContent : sec.cloudContent;

  contentPane.innerHTML = `
    <article class="legal-prose-wrap anim-fade" style="max-width:68ch;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; flex-wrap:wrap;">
        <span style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:${sec.badgeColor}; background:${sec.badgeColor}15; padding:4px 10px; border-radius:8px;">
          ${esc(sec.badge)}
        </span>
        <span style="font-size:12px; font-weight:600; color:#64748B;">
          <i class="fas ${isLocal ? 'fa-hard-drive text-slate-500' : 'fa-cloud text-blue-500'} mr-1"></i>
          Régimen Actual: <strong>${isLocal ? 'Servidor Local (Custodia Propia On-Premise)' : 'Cloud SaaS (Alojado en AWS)'}</strong>
        </span>
      </div>

      <h3 style="font-family:'Fraunces', Georgia, serif; font-size:24px; font-weight:700; color:#0F172A; margin:0 0 12px; letter-spacing:-0.02em;">
        ${esc(sec.title)}
      </h3>

      <div style="font-size:13.5px; font-weight:500; color:#475569; background:#FAF8F5; padding:12px 16px; border-radius:10px; margin-bottom:24px; border:1px solid #EAE5DE; line-height:1.6;">
        <i class="fas fa-bookmark mr-1.5" style="color:#7C3AED;"></i>
        ${esc(sec.summary)}
      </div>

      <div class="legal-body-text" style="font-size:14px; line-height:1.75; color:#1E293B;">
        ${clauseBody}
      </div>

      <div style="margin-top:36px; padding-top:20px; border-top:1px solid #F1F5F9; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; font-size:12px; color:#64748B;">
        <div>
          ¿Requieres asistencia legal o contractual? Escríbenos a <a href="mailto:${esc(contactEmail)}" style="color:#7C3AED; font-weight:600; text-decoration:none;">${esc(contactEmail)}</a>
        </div>
        <div>
          ${activeSectionIndex < LEGAL_SECTIONS.length - 1 ? `
            <button type="button" class="btn btn-outline btn-sm" id="btn-next-legal-sec" style="font-weight:600;">
              Siguiente Capítulo <i class="fas fa-arrow-right ml-1"></i>
            </button>
          ` : `
            <span style="font-weight:700; color:#10B981;"><i class="fas fa-check-circle mr-1"></i> Fin del Manifiesto Contractual</span>
          `}
        </div>
      </div>
    </article>
  `;

  // Botón Siguiente
  const nextBtn = contentPane.querySelector('#btn-next-legal-sec');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      activeSectionIndex = Math.min(activeSectionIndex + 1, LEGAL_SECTIONS.length - 1);
      _updateNavButtons(container);
      _renderSectionContent(container, contactEmail, jurisdictionCity);
    });
  }
}

/**
 * Actualiza la apariencia visual de los botones del índice.
 */
function _updateNavButtons(container: HTMLElement): void {
  const buttons = container.querySelectorAll('.legal-nav-btn');
  buttons.forEach((btn: any) => {
    const idx = parseInt(btn.dataset.idx || '0', 10);
    const isActive = idx === activeSectionIndex;
    btn.style.background = isActive ? '#F5F3FF' : 'transparent';
    btn.style.color = isActive ? '#6D28D9' : '#334155';
    btn.style.fontWeight = isActive ? '700' : '500';
  });
}

/**
 * Vincula los eventos de interacción.
 */
function _bindLegalEvents(container: HTMLElement, contactEmail: string, jurisdictionCity: string): void {
  // Cambio de modo Local vs Cloud
  const btnLocal = container.querySelector('#btn-mode-local') as HTMLButtonElement;
  const btnCloud = container.querySelector('#btn-mode-cloud') as HTMLButtonElement;

  if (btnLocal && btnCloud) {
    btnLocal.addEventListener('click', () => {
      if (currentDeploymentMode === 'local') return;
      currentDeploymentMode = 'local';
      btnLocal.classList.add('active');
      btnCloud.classList.remove('active');
      _renderSectionContent(container, contactEmail, jurisdictionCity);
      if (typeof showToast === 'function') showToast('Cambiado a régimen de Servidor Local', 'info');
    });

    btnCloud.addEventListener('click', () => {
      if (currentDeploymentMode === 'cloud') return;
      currentDeploymentMode = 'cloud';
      btnCloud.classList.add('active');
      btnLocal.classList.remove('active');
      _renderSectionContent(container, contactEmail, jurisdictionCity);
      if (typeof showToast === 'function') showToast('Cambiado a régimen Cloud SaaS (AWS)', 'info');
    });
  }

  // Navegación por el índice
  const navList = container.querySelector('#legal-nav-list');
  if (navList) {
    navList.addEventListener('click', (e: any) => {
      const btn = e.target.closest('.legal-nav-btn');
      if (!btn) return;
      const idx = parseInt(btn.dataset.idx || '0', 10);
      activeSectionIndex = idx;
      _updateNavButtons(container);
      _renderSectionContent(container, contactEmail, jurisdictionCity);
    });
  }

  // Buscador interno en vivo
  const searchInput = container.querySelector('#legal-search-input') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const navButtons = container.querySelectorAll('.legal-nav-btn');
      navButtons.forEach((btn: any) => {
        const idx = parseInt(btn.dataset.idx || '0', 10);
        const sec = LEGAL_SECTIONS[idx];
        const match = !q || sec.title.toLowerCase().includes(q) || sec.summary.toLowerCase().includes(q) || sec.badge.toLowerCase().includes(q);
        btn.style.display = match ? 'flex' : 'none';
      });
    });
  }

  // Exportar PDF oficial con logo y diseño institucional
  const btnPdf = container.querySelector('#btn-export-legal-pdf') as HTMLButtonElement | null;
  if (btnPdf) {
    btnPdf.addEventListener('click', async () => {
      const origHtml = btnPdf.innerHTML;
      btnPdf.disabled = true;
      btnPdf.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Generando Manifiesto PDF...';
      try {
        await _exportLegalManifestPDF(contactEmail, jurisdictionCity);
      } catch (err: any) {
        console.error('[GRAVY LEGAL] Error en exportación:', err);
      } finally {
        btnPdf.disabled = false;
        btnPdf.innerHTML = origHtml;
      }
    });
  }
}

/**
 * Obtiene el logotipo oficial de GRAVY en formato Base64 Data URL para incrustarlo en el documento jsPDF.
 * Implementa una estrategia de 3 capas seguras:
 * 1. Elemento <img> presente en el DOM (lectura de canvas offscreen).
 * 2. Petición Fetch directa a /assets/gravy-logo.png con conversión mediante FileReader.
 * 3. Instancia programática de Image() con canvas fallback.
 */
async function getGravyLogoDataUrl(): Promise<string | null> {
  // 1. Detección en elementos ya montados en el DOM
  try {
    const existingImgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
    const logoImg = existingImgs.find(img => img.src && img.src.includes('gravy-logo.png') && img.complete && img.naturalWidth > 0);
    if (logoImg) {
      const canvas = document.createElement('canvas');
      canvas.width = logoImg.naturalWidth;
      canvas.height = logoImg.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(logoImg, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        if (dataUrl && dataUrl.length > 100) return dataUrl;
      }
    }
  } catch (_e) {
    // Si canvas arroja SecurityError por origen, continuamos con fetch
  }

  // 2. Fetch directo al archivo de assets servido por PocketBase
  try {
    const resp = await fetch('/assets/gravy-logo.png');
    if (resp.ok) {
      const blob = await resp.blob();
      const base64 = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') resolve(reader.result);
          else resolve(null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
      if (base64) return base64;
    }
  } catch (_e) {
    // Continuamos a estrategia 3
  }

  // 3. Carga asíncrona mediante objeto Image
  return new Promise<string | null>((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 200;
          canvas.height = img.naturalHeight || 200;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = '/assets/gravy-logo.png';
    } catch {
      resolve(null);
    }
  });
}

/**
 * Dibuja el encabezado superior para páginas intermedias (páginas 2 en adelante).
 */
function _drawPageHeader(doc: any, logoDataUrl: string | null): void {
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 13, 202, 13);

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 14, 4, 7.5, 7.5);
    } catch (_e) {}
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(124, 58, 237); // #7C3AED
  doc.text('GRAVY v2.0', logoDataUrl ? 24 : 14, 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('— Manifiesto de Términos, Condiciones y Cumplimiento Normativo', logoDataUrl ? 40 : 30, 9);

  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text('JULIÁN ESPINOSA ARRUBLA (C.C. 1130636393)', 202, 9, { align: 'right' });
}

/**
 * Genera y descarga el documento oficial de Términos y Manifiesto Legal en PDF con jsPDF,
 * incorporando el logotipo oficial de GRAVY, estructura capitular y sellos de compliance.
 */
async function _exportLegalManifestPDF(contactEmail: string, jurisdictionCity: string): Promise<void> {
  const jsPDFClass = (window as any).jspdf ? (window as any).jspdf.jsPDF : (window as any).jsPDF;
  if (!jsPDFClass) {
    if (typeof showToast === 'function') showToast('Módulo jsPDF no disponible en este momento.', 'error');
    return;
  }

  try {
    const doc = new jsPDFClass({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    // Carga asíncrona del logo corporativo
    const logoDataUrl = await getGravyLogoDataUrl();

    const isLocal = currentDeploymentMode === 'local';
    const primaryColor = [124, 58, 237]; // #7C3AED
    const darkColor = [15, 23, 42]; // #0F172A

    // 1. ENCABEZADO PRINCIPAL (PÁGINA 1) - Formato editorial limpio sobre fondo blanco (sin relleno violeta)
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', 14, 6.5, 18, 18);
      } catch (_e) {}
    }

    const titleX = logoDataUrl ? 36 : 14;

    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text('GRAVY v2.0 — MANIFIESTO LEGAL & CUMPLIMIENTO NORMATIVO', titleX, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Términos de Servicio, Deslinde de Responsabilidad Contable, DIAN UBL 2.1 y Habeas Data', titleX, 17);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Validez Probatoria Digital amparada por la Ley 527 de 1999 (Mensajes de Datos y Firma Digital)', titleX, 22);

    // Línea divisoria superior sutil
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 27, 202, 27);

    let y = 32;

    // 2. FICHA TÉCNICA Y METADATOS DE TITULARIDAD (PÁGINA 1)
    doc.setFillColor(250, 248, 245);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 188, 30, 2, 2, 'FD');

    // Banda lateral violeta
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(14, y, 2.5, 30, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('FICHA CONTRACTUAL Y CERTIFICACIÓN DE TITULARIDAD', 19, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Titular y Autor Exclusivo: JULIÁN ESPINOSA ARRUBLA (C.C. 1130636393) — Amparado por Ley 23/1982 y Decisión 351/1993`, 19, y + 11);
    doc.text(`Régimen de Operación: ${isLocal ? 'Servidor Local On-Premise (Autonomía y Custodia Propia de Base de Datos)' : 'Cloud SaaS Multi-Empresa (Infraestructura AWS Cloud con Aislamiento Tenant)'}`, 19, y + 16);
    doc.text(`Jurisdicción y Domicilio: ${jurisdictionCity} | Canal Oficial de Notificaciones: ${contactEmail}`, 19, y + 21);
    const dateFormatted = new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' });
    doc.text(`Fecha de Emisión: ${dateFormatted} | Estándar de Referencia: Marco Alegra Colombia / DIAN UBL 2.1`, 19, y + 26);

    y += 36;

    // 3. RECORRIDO POR LOS 8 CAPÍTULOS CONTRACTUALES
    LEGAL_SECTIONS.forEach((sec) => {
      if (y > 230) {
        doc.addPage();
        _drawPageHeader(doc, logoDataUrl);
        y = 22;
      }

      // Pastilla de Capítulo y Badge
      doc.setFillColor(245, 243, 255);
      doc.setDrawColor(221, 214, 254);
      doc.roundedRect(14, y, 188, 6.5, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`${sec.title}`, 17, y + 4.5);

      doc.setFontSize(7.2);
      doc.text(`[ ${sec.badge} ]`, 198, y + 4.5, { align: 'right' });
      y += 9.5;

      // Resumen del capítulo en cursiva
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const sumLines = doc.splitTextToSize(sec.summary, 184);
      doc.text(sumLines, 15, y);
      y += (sumLines.length * 3.4) + 2.5;

      // Limpiar etiquetas HTML y estructurar viñetas legibles
      const rawHtml = isLocal ? sec.localContent : sec.cloudContent;
      const plainText = rawHtml
        .replace(/<h4>(.*?)<\/h4>/g, '\n■ $1\n')
        .replace(/<li>(.*?)<\/li>/g, '  • $1\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      const bodyLines = doc.splitTextToSize(plainText, 184);
      for (const line of bodyLines) {
        if (y > 258) {
          doc.addPage();
          _drawPageHeader(doc, logoDataUrl);
          y = 22;
        }

        if (line.startsWith('■ ')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.8);
          doc.setTextColor(15, 23, 42);
          y += 1.5;
          doc.text(line, 14, y);
          y += 3.8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.4);
          doc.setTextColor(30, 41, 59);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.4);
          doc.setTextColor(30, 41, 59);
          doc.text(line, 14, y);
          y += 3.4;
        }
      }

      y += 5;
    });

    // 4. CONSTANCIA DE VALIDEZ, INDEMNIDAD Y TITULARIDAD FINAL
    if (y > 220) {
      doc.addPage();
      _drawPageHeader(doc, logoDataUrl);
      y = 22;
    }

    y += 4;
    doc.setFillColor(250, 248, 245);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, 188, 26, 2, 2, 'FD');

    // Banda violeta izquierda
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(14, y, 2.5, 26, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(15, 23, 42);
    doc.text('CONSTANCIA DE VALIDEZ JURÍDICA, INDEMNIDAD Y TITULARIDAD EXCLUSIVA', 19, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.9);
    doc.setTextColor(71, 85, 105);
    const certText = `El presente documento constituye el Manifiesto Legal vinculante de GRAVY v2.0, formulado bajo los estándares de plataformas contables y tributarias en Colombia (Alegra), rigiéndose por la Ley 527 de 1999 (Mensajes de Datos y Comercio Electrónico), Ley 23 de 1982 (Derechos de Autor), Ley 1581 de 2012 (Habeas Data), Ley 43 de 1990 (Reglamentación de la Profesión Contable) y el Código de Comercio. El usuario o suscriptor declara conocer y aceptar estas condiciones de indemnidad y exoneración de responsabilidad contable y fiscal a favor del titular exclusivo Julián Espinosa Arrubla.`;
    const certLines = doc.splitTextToSize(certText, 178);
    doc.text(certLines, 19, y + 10.5);

    // 5. NUMERACIÓN DINÁMICA Y PIE DE PÁGINA EN TODAS LAS PÁGINAS
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 270, 202, 270);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.7);
      doc.setTextColor(100, 116, 139);
      doc.text(`GRAVY v2.0 · Titular: Julián Espinosa Arrubla (C.C. 1130636393) · Notificaciones: ${contactEmail} · ${jurisdictionCity}`, 14, 274);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(`Página ${i} de ${totalPages}`, 202, 274, { align: 'right' });
    }

    const fileName = `GRAVY_Terminos_Condiciones_${isLocal ? 'Local' : 'Cloud'}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);

    if (typeof showToast === 'function') showToast('Manifiesto Legal oficial descargado con éxito con logo GRAVY.', 'success');
  } catch (err: any) {
    console.error('[GRAVY LEGAL] Error al generar PDF:', err);
    if (typeof showToast === 'function') showToast('Error al exportar PDF: ' + err.message, 'error');
  }
}

/**
 * Inyecta reglas CSS para la interfaz del Centro Legal.
 */
function _injectLegalStyles(): void {
  if (document.getElementById('legal-center-styles')) return;
  const style = document.createElement('style');
  style.id = 'legal-center-styles';
  style.textContent = `
    .legal-mode-btn {
      background: transparent;
      color: #64748B;
    }
    .legal-mode-btn.active {
      background: #FFFFFF !important;
      color: #0F172A !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .legal-nav-btn:hover {
      background: #F8FAFC;
    }
    .legal-body-text h4 {
      font-size: 14.5px;
      font-weight: 700;
      color: #0F172A;
      margin: 18px 0 6px;
    }
    .legal-body-text p {
      margin-bottom: 12px;
      text-wrap: pretty;
    }
    .legal-body-text strong {
      color: #0F172A;
      font-weight: 700;
    }
    .legal-body-text code {
      background: #F1F5F9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      color: #7C3AED;
    }
    @media (max-width: 900px) {
      #legal-grid-wrap {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Abre un modal rápido con el manifiesto legal (útil para la pantalla de Login).
 */
function openLegalModal(): void {
  let modal = document.getElementById('modal-legal-quick') as HTMLElement;
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-legal-quick';
    modal.className = 'modal-backdrop anim-fade';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(4px);';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:#FFFFFF; border-radius:18px; width:100%; max-width:880px; max-height:88vh; display:flex; flex-direction:column; box-shadow:0 20px 40px rgba(0,0,0,0.2); overflow:hidden; border:1px solid #E2E8F0;">
      <div style="padding:20px 24px; border-bottom:1px solid #E2E8F0; display:flex; justify-content:space-between; align-items:center; background:#FAF8F5;">
        <div>
          <h3 style="margin:0; font-family:'Fraunces', Georgia, serif; font-size:18px; font-weight:700; color:#0F172A;">
            <i class="fas fa-scale-balanced mr-1.5" style="color:#7C3AED;"></i> Términos, Condiciones y Política de Datos — GRAVY
          </h3>
          <p style="margin:2px 0 0; font-size:12px; color:#64748B;">
            Titular: <strong>Julián Espinosa Arrubla (C.C. 1130636393)</strong> · Cali / Valle del Cauca, Colombia · Notificaciones: <a href="mailto:gravy.legal@gmail.com" style="color:#7C3AED; font-weight:600; text-decoration:none;">gravy.legal@gmail.com</a>
          </p>
        </div>
        <button type="button" id="btn-close-legal-modal" style="background:none; border:none; font-size:18px; color:#64748B; cursor:pointer; padding:4px 8px;">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <div style="padding:24px; overflow-y:auto; font-size:13.5px; line-height:1.7; color:#334155; max-height:68vh;">
        <div style="padding:12px 16px; border-radius:10px; background:#F5F3FF; border-left:4px solid #7C3AED; margin-bottom:16px;">
          <strong>Aviso Importante:</strong> El uso de GRAVY constituye aceptación expresa de este Acuerdo de Términos y Condiciones, redactado bajo el estándar de la industria contable (Alegra), incluyendo la Exención de Asesoría Contable (Ley 43/1990), la Política de Protección de Datos (Ley 1581/2012) y la Cláusula de Indemnidad a favor de Julián Espinosa Arrubla.
        </div>
        ${LEGAL_SECTIONS.map(s => `
          <div style="margin-bottom:20px; border-bottom:1px solid #F1F5F9; padding-bottom:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; flex-wrap:wrap; gap:8px;">
              <h4 style="font-size:14px; font-weight:700; color:#0F172A; margin:0;">${esc(s.title)}</h4>
              <span style="font-size:10px; font-weight:700; color:${s.badgeColor}; background:${s.badgeColor}15; padding:2px 8px; border-radius:6px;">${esc(s.badge)}</span>
            </div>
            <p style="font-size:12px; color:#64748B; margin:0 0 10px; line-height:1.5;">${esc(s.summary)}</p>
            <div style="font-size:13px; color:#334155; line-height:1.7;">${s.localContent}</div>
          </div>
        `).join('')}
      </div>
      <div style="padding:14px 24px; border-top:1px solid #E2E8F0; display:flex; justify-content:space-between; align-items:center; background:#F8FAFC;">
        <span style="font-size:11.5px; color:#64748B;">Cali / Valle del Cauca, Colombia</span>
        <button type="button" class="btn btn-primary" id="btn-modal-understand" style="font-size:12px;">Entendido y Acepto</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  const closeBtn = modal.querySelector('#btn-close-legal-modal');
  const understandBtn = modal.querySelector('#btn-modal-understand');

  const closeModal = () => { modal.style.display = 'none'; };
  closeBtn?.addEventListener('click', closeModal);
  understandBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// Exportación global
(window as any).renderLegalCenter = renderLegalCenter;
(window as any).openLegalModal = openLegalModal;
