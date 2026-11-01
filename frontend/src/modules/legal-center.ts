/**
 * GRAVY v2.0 — legal-center.ts
 * Centro Legal, Cumplimiento Normativo, Habeas Data y Marco de Algoritmos Locales.
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
    id: 'eula',
    title: '1. Titularidad, Derechos de Autor y Licencia (EULA)',
    badge: 'Ley 23 de 1982 / DNDA',
    badgeColor: '#7C3AED',
    summary: 'Propiedad intelectual exclusiva de Julián Espinosa Arrubla, alcance de la licencia y prohibiciones de explotación no autorizada.',
    localContent: `
      <h4>1.1. Titularidad y Reserva de Derechos</h4>
      <p>
        El código fuente, arquitectura de datos, interfaces visuales, rutinas algorítmicas, flujos lógicos y documentación técnica de la plataforma <strong>GRAVY</strong> constituyen una obra de software original amparada por la <strong>Ley 23 de 1982</strong>, la <strong>Ley 44 de 1993</strong> y la <strong>Decisión Andina 351 de 1993</strong> de la Comunidad Andina de Naciones.
      </p>
      <p>
        Todos los derechos morales y patrimoniales de autor sobre esta creación pertenecen de manera exclusiva e intransferible a <strong>JULIÁN ESPINOSA ARRUBLA</strong>, ciudadano colombiano identificado con Cédula de Ciudadanía <strong>C.C. 1130636393</strong>. La adquisición o uso de esta instalación no confiere transferencia de propiedad, cesión de derechos de autor ni derecho a sublicenciar la obra.
      </p>
      <h4>1.2. Alcance de la Licencia en Modalidad Local-First</h4>
      <p>
        Bajo esta modalidad, se otorga al Cliente una licencia de uso personal, no exclusiva, intransferible y revocable en caso de mora o incumplimiento de términos comerciales. La licencia faculta la instalación y ejecución de GRAVY en los servidores físicos o estaciones de trabajo autorizadas dentro de la red local del licenciatario.
      </p>
      <h4>1.3. Restricciones e Inviolabilidad del Código</h4>
      <p>
        Queda expresamente prohibido descompilar, realizar ingeniería inversa, alterar los mecanismos criptográficos de validación de licencias, remover marcas de agua o derechos de autor, o redistribuir el software bajo una denominación comercial distinta sin la autorización previa, expresa y escrita de Julián Espinosa Arrubla.
      </p>
    `,
    cloudContent: `
      <h4>1.1. Titularidad y Reserva de Derechos</h4>
      <p>
        La plataforma <strong>GRAVY</strong>, en su versión Cloud SaaS servida desde infraestructura centralizada (Amazon Web Services / servidores seguros), es propiedad intelectual exclusiva de <strong>JULIÁN ESPINOSA ARRUBLA</strong> (C.C. 1130636393). El acceso a la nube no implica transmisión patrimonial ni cesión de derechos de autor.
      </p>
      <h4>1.2. Términos de Suscripción Cloud SaaS</h4>
      <p>
        El Cliente adquiere el derecho de acceso temporal vía web mediante suscripción periódica (mensual o anual). La continuidad del servicio depende del pago oportuno del canon pactado. Julián Espinosa Arrubla se reserva el derecho de suspender el acceso a la instancia en caso de mora superior a los plazos comerciales acordados.
      </p>
      <h4>1.3. Prohibición de Explotación Masiva y Reventa</h4>
      <p>
        El Cliente no podrá arrendar, revender ni prestar servicios de oficina contable a terceros ajenos a su grupo empresarial utilizando la cuenta de suscripción estándar sin una licencia de distribución o convenio de franquicia tecnológica explícito.
      </p>
    `
  },
  {
    id: 'habeas-data',
    title: '2. Tratamiento de Datos Personales (Habeas Data)',
    badge: 'Ley 1581 de 2012 / SIC',
    badgeColor: '#2563EB',
    summary: 'Delimitación jurídica de roles: Responsable vs. Encargado, derechos ARCO y autorización de transmisión.',
    localContent: `
      <h4>2.1. Custodia Hermética en Arquitectura Local-First</h4>
      <p>
        En la modalidad de instalación local (Local-First con motor PocketBase/SQLite residente en la máquina del Cliente), <strong>el Cliente es el único y exclusivo RESPONSABLE DEL TRATAMIENTO</strong> de los datos personales (terceros, clientes, proveedores, nómina y empleados) conforme a la <strong>Ley Estatutaria 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong>.
      </p>
      <p>
        <strong>Julián Espinosa Arrubla NO almacena, no transfiere ni tiene acceso a las bases de datos locales</strong> de su empresa. La custodia física y lógica de la carpeta de datos (<code>pb_data</code>) y los respaldos generados es responsabilidad absoluta del licenciatario.
      </p>
      <h4>2.2. Atención de Peticiones y Derechos ARCO</h4>
      <p>
        Cualquier solicitud de conocimiento, actualización, rectificación o supresión de datos promovida por titulares vinculados al Cliente debe ser atendida directamente por el departamento administrativo o contable de la empresa licenciada.
      </p>
    `,
    cloudContent: `
      <h4>2.1. Acuerdo de Transmisión de Datos (DPA) Obligatorio</h4>
      <p>
        Cuando GRAVY opera bajo la modalidad Cloud SaaS, la empresa cliente ostenta la calidad jurídica de <strong>RESPONSABLE DEL TRATAMIENTO</strong> (Data Controller), y <strong>JULIÁN ESPINOSA ARRUBLA</strong> actúa en calidad de <strong>ENCARGADO DEL TRATAMIENTO</strong> (Data Processor), en los términos del Artículo 3, literales d) y e) de la <strong>Ley 1581 de 2012</strong>.
      </p>
      <h4>2.2. Compromiso de Confidencialidad y Fines Exclusivos</h4>
      <p>
        El Encargado se compromete a:
      </p>
      <ul style="padding-left:20px;margin-bottom:12px;list-style:disc">
        <li>Tratar la información contable y personal de la empresa únicamente para el funcionamiento operativo de GRAVY SaaS.</li>
        <li>No vender, ceder, monetizar ni utilizar los registros del Cliente para beneficio propio o de terceros.</li>
        <li>Aplicar protocolos de cifrado en reposo (AES-256) y en tránsito (TLS 1.3 / HTTPS).</li>
      </ul>
      <h4>2.3. Transmisión Internacional de Datos (Centros de Cómputo AWS)</h4>
      <p>
        El Cliente autoriza de manera informada y expresa la transmisión internacional de su base de datos hacia los centros de datos de alta seguridad de <strong>Amazon Web Services (AWS)</strong> ubicados en regiones internacionales (como <code>us-east-1</code>), bajo estándares SOC 2 Tipo II e ISO 27001, dando estricto cumplimiento a las directrices de la Superintendencia de Industria y Comercio (SIC).
      </p>
    `
  },
  {
    id: 'responsabilidad-contable',
    title: '3. Deslinde Contable, Fiscal y Normativa DIAN',
    badge: 'Ley 43 de 1990 / DIAN',
    badgeColor: '#059669',
    summary: 'El software es una herramienta de cálculo y procesamiento, no un sustituto de la fe pública contable.',
    localContent: `
      <h4>3.1. Naturaleza Tecnológica No Certificadora</h4>
      <p>
        GRAVY es una herramienta informática de registro, liquidación matemática y gestión comercial. <strong>En ningún caso sustituye el juicio profesional, la firma, la fe pública ni el dictamen de un Contador Público Titulado o Revisor Fiscal</strong>, de conformidad con lo ordenado en la <strong>Ley 43 de 1990</strong> y los <strong>Artículos 19, 48 a 60 y 200 del Código de Comercio de Colombia</strong>.
      </p>
      <h4>3.2. Deber de Parametrización y Validación Tributaria</h4>
      <p>
        La configuración de planes de cuentas, tarifas de retención en la fuente, autorretenciones de renta, bases gravables de IVA, códigos ICA y resoluciones DIAN de facturación o nómina electrónica es responsabilidad exclusiva del Representante Legal y el Contador de la empresa.
      </p>
      <p>
        Ni Julián Espinosa Arrubla ni el software responden ante la DIAN, la UGPP o administraciones municipales por inexactitudes, omisiones o sanciones derivadas de una parametrización contable deficiente o extemporaneidad en la presentación de declaraciones tributarias.
      </p>
    `,
    cloudContent: `
      <h4>3.1. Obligación Legal de Conservación de Libros (Arts. 48-60 C.Co)</h4>
      <p>
        Los comerciantes colombianos tienen el deber legal intransferible de conservar sus libros de contabilidad y comprobantes durante <strong>5 años</strong> (término de firmeza tributaria DIAN) o <strong>10 años</strong> (Código de Comercio).
      </p>
      <p>
        <strong>GRAVY Cloud SaaS es una plataforma de gestión operativa y emisión transaccional, no un archivo notarial perpetuo</strong>. Es obligación inexcusable del Cliente realizar descargas periódicas de sus libros oficiales (Balance de Prueba, Libro Diario, Mayor y Balances) y respaldos digitales.
      </p>
      <h4>3.2. Exención de Sanciones Tributarias</h4>
      <p>
        Cualquier discrepancia o glosa efectuada por la DIAN en procesos de fiscalización respecto a la validez de deducciones, cruces de exógena o liquidaciones de nómina recae sobre el contribuyente. El desarrollador no asume responsabilidad solidaria ni subsidiaria por las obligaciones fiscales de los inquilinos del sistema.
      </p>
    `
  },
  {
    id: 'ia-algoritmos',
    title: '4. Marco Técnico y Ético de Algoritmos Locales',
    badge: 'Transparencia / Human-in-the-Loop',
    badgeColor: '#D97706',
    summary: 'Modelos predictivos matemáticos y estadísticos estrictamente locales sin transferencia transfronteriza.',
    localContent: `
      <h4>4.1. Transparencia Algorítmica y Procesamiento Determinista</h4>
      <p>
        Los módulos analíticos de GRAVY (incluyendo compra sugerida, proyección de inventario de seguridad, detección de variaciones en balance y conciliación heurística) operan mediante <strong>algoritmos matemáticos y modelos estadísticos locales</strong> ejecutados directamente en el entorno de la aplicación.
      </p>
      <h4>4.2. Cero Exposición a Modelos de Lenguaje Externos</h4>
      <p>
        La plataforma certifica que <strong>ningún asiento contable, dato de nómina ni registro comercial es transmitido a modelos de inteligencia artificial públicos (como OpenAI ChatGPT o Google Gemini) para entrenamiento comercial</strong>. Toda la computación ocurre de forma hermética y privada.
      </p>
      <h4>4.3. Principio de Supervisión Humana Indispensable</h4>
      <p>
        Conforme a las recomendaciones del CONPES 3975 de Inteligencia Artificial de Colombia, todas las sugerencias numéricas generadas por los algoritmos deben ser validadas y aprobadas por un operador humano calificado antes de consolidarse en un comprobante contable definitivo.
      </p>
    `,
    cloudContent: `
      <h4>4.1. Privacidad y Procesamiento Aislado por Tenant</h4>
      <p>
        En la nube, los cálculos heurísticos y predictivos se ejecutan de manera aislada por cada empresa inquilina. No existe correlación cruzada de datos financieros entre empresas competidoras ni reutilización de datos para el entrenamiento de algoritmos externos.
      </p>
      <h4>4.2. Carácter Informativo y No Vinculante</h4>
      <p>
        Las proyecciones de flujo de caja, compras sugeridas y análisis predictivos son orientativas y no constituyen asesoría financiera, dictamen pericial ni garantía de rentabilidad comercial. El Cliente es el único responsable de sus decisiones de negocio.
      </p>
    `
  },
  {
    id: 'seguridad-backups',
    title: '5. Seguridad, SLA y Régimen de Copias de Seguridad',
    badge: 'Seguridad & Disponibilidad',
    badgeColor: '#475569',
    summary: 'Protocolos criptográficos, límites de responsabilidad por caídas de infraestructura y política de retención.',
    localContent: `
      <h4>5.1. Protocolo de Respaldo Local Obligatorio</h4>
      <p>
        La integridad de la información depende de la custodia del hardware del Cliente. El administrador del sistema debe implementar rutinas de copia de seguridad periódicas mediante el generador de respaldos de GRAVY (archivos comprimidos <code>.zip</code> encriptados).
      </p>
      <h4>5.2. Exclusión de Responsabilidad por Fallas de Hardware</h4>
      <p>
        Julián Espinosa Arrubla no será responsable por la pérdida, corrupción o secuestro de datos (ransomware) derivado de cortes imprevistos de fluido eléctrico, fallas en discos duros, virus informáticos o accesos no autorizados en la red física del Cliente.
      </p>
    `,
    cloudContent: `
      <h4>5.1. Seguridad en la Infraestructura Cloud (AWS)</h4>
      <p>
        La infraestructura Cloud dispone de monitoreo activo, aislamiento por inquilino y copias de seguridad automáticas diarias. Sin embargo, se aconseja al Cliente realizar exportaciones mensuales de sus libros contables.
      </p>
      <h4>5.2. Acuerdo de Nivel de Servicio (SLA) y Fuerza Mayor</h4>
      <p>
        Se establece una meta de disponibilidad mensual del <strong>99.5%</strong>. Se exonera a Julián Espinosa Arrubla de indemnizaciones por caídas, retrasos o lucro cesante causados por:
      </p>
      <ul style="padding-left:20px;margin-bottom:12px;list-style:disc">
        <li>Interrupciones masivas en Amazon Web Services (AWS) o proveedores de red troncal internacional.</li>
        <li>Indisponibilidad en los servicios web de validación previa de la DIAN.</li>
        <li>Cortes de fibra óptica, desastres naturales o eventos de fuerza mayor ajenos al control del operador.</li>
      </ul>
      <h4>5.3. Política de Gracia y Retención ante Cancelación</h4>
      <p>
        En caso de terminación del contrato de suscripción o mora comercial, se garantiza un <strong>período de gracia de 30 días calendario</strong> para que el Cliente descargue todos sus archivos y comprobantes contables. Finalizado este plazo, el operador queda expresamente autorizado para eliminar definitivamente la instancia y su base de datos.
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
              <i class="fas fa-shield-halved"></i> MARCO LEGAL, SEGURIDAD & COMPLIANCE
            </div>
            <h2 style="font-family:'Fraunces', Georgia, serif; font-size:26px; font-weight:700; color:#0F172A; margin:0 0 6px; letter-spacing:-0.02em;">
              Centro de Cumplimiento Normativo y Términos de Servicio
            </h2>
            <p style="font-size:13.5px; color:#475569; margin:0; max-width:70ch; line-height:1.6;">
              Información legal vinculante, políticas de tratamiento de datos personales, exención de responsabilidad contable y marco técnico de algoritmos de <strong>GRAVY v2.0</strong>.
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
      <div style="display:grid; grid-template-columns:320px 1fr; gap:24px; align-items:start;" id="legal-grid-wrap">
        
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
            Capítulos Normativos
          </div>

          <nav id="legal-nav-list" style="display:flex; flex-direction:column; gap:6px;">
            ${LEGAL_SECTIONS.map((sec, idx) => `
              <button type="button" class="legal-nav-btn ${idx === activeSectionIndex ? 'active' : ''}" data-idx="${idx}"
                style="text-align:left; border:none; background:${idx === activeSectionIndex ? '#F5F3FF' : 'transparent'}; color:${idx === activeSectionIndex ? '#6D28D9' : '#334155'}; padding:10px 12px; border-radius:10px; font-size:12.5px; font-weight:${idx === activeSectionIndex ? '700' : '500'}; cursor:pointer; display:flex; flex-direction:column; gap:3px; transition:all 0.15s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="line-height:1.3;">${esc(sec.title)}</span>
                </div>
                <span style="font-size:10px; color:${sec.badgeColor}; font-weight:700;">${esc(sec.badge)}</span>
              </button>
            `).join('')}
          </nav>

          <div style="margin-top:20px; padding-top:16px; border-top:1px solid #F1F5F9; font-size:11px; color:#64748B; line-height:1.5;">
            <i class="fas fa-info-circle mr-1" style="color:#7C3AED;"></i>
            Este documento se mantiene actualizado conforme a los decretos reglamentarios de la DIAN y la SIC.
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
          Régimen Actual: <strong>${isLocal ? 'Servidor Local (Custodia Propia)' : 'Cloud SaaS (Alojado en AWS)'}</strong>
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
          ¿Dudas sobre esta cláusula? Contáctanos a <a href="mailto:${esc(contactEmail)}" style="color:#7C3AED; font-weight:600; text-decoration:none;">${esc(contactEmail)}</a>
        </div>
        <div>
          ${activeSectionIndex < LEGAL_SECTIONS.length - 1 ? `
            <button type="button" class="btn btn-outline btn-sm" id="btn-next-legal-sec" style="font-weight:600;">
              Siguiente Capítulo <i class="fas fa-arrow-right ml-1"></i>
            </button>
          ` : `
            <span style="font-weight:700; color:#10B981;"><i class="fas fa-check-circle mr-1"></i> Fin del Manifiesto</span>
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

  // Exportar PDF oficial
  const btnPdf = container.querySelector('#btn-export-legal-pdf');
  if (btnPdf) {
    btnPdf.addEventListener('click', () => {
      _exportLegalManifestPDF(contactEmail, jurisdictionCity);
    });
  }
}

/**
 * Genera y descarga el documento oficial de Términos y Manifiesto Legal en PDF con jsPDF.
 */
function _exportLegalManifestPDF(contactEmail: string, jurisdictionCity: string): void {
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

    const isLocal = currentDeploymentMode === 'local';
    const primaryColor = [124, 58, 237]; // #7C3AED
    const darkColor = [15, 23, 42]; // #0F172A

    // Encabezado
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 216, 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('GRAVY v2.0 — MANIFIESTO LEGAL, SEGURIDAD Y COMPLIANCE', 14, 14);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Ley 23/1982 · Ley 1581/2012 · Ley 43/1990 · Decisión Andina 351', 130, 14);

    let y = 32;

    // Subtítulo e Identificación del Titular
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('TÉRMINOS DE LICENCIA, PROTECCIÓN DE DATOS Y DESLINDE CONTABLE', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Titular y Autor Exclusivo: JULIÁN ESPINOSA ARRUBLA (C.C. 1130636393)`, 14, y);
    y += 5;
    doc.text(`Régimen de Operación: ${isLocal ? 'Servidor Local (Local-First On-Premise)' : 'Cloud SaaS Multi-Empresa (AWS Hosting)'}`, 14, y);
    y += 5;
    doc.text(`Jurisdicción Contractual: ${jurisdictionCity} | Canal Oficial: ${contactEmail}`, 14, y);
    y += 5;
    doc.text(`Fecha de Emisión del Documento: ${new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })}`, 14, y);
    y += 8;

    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, 202, y);
    y += 7;

    // Secciones
    LEGAL_SECTIONS.forEach((sec, sIdx) => {
      // Verificar espacio de página
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`${sec.title} [${sec.badge}]`, 14, y);
      y += 5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      const sumLines = doc.splitTextToSize(sec.summary, 185);
      doc.text(sumLines, 14, y);
      y += (sumLines.length * 4) + 3;

      // Limpiar etiquetas HTML básicas para el PDF
      const rawHtml = isLocal ? sec.localContent : sec.cloudContent;
      const plainText = rawHtml
        .replace(/<h4>(.*?)<\/h4>/g, '\n[ $1 ]\n')
        .replace(/<li>(.*?)<\/li>/g, ' • $1\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      const bodyLines = doc.splitTextToSize(plainText, 185);
      for (const line of bodyLines) {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 14, y);
        y += 3.8;
      }

      y += 6;
    });

    // Pie de página final con firma institucional
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    y += 6;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 202, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('CONSTANCIA DE VALIDEZ Y TITULARIDAD:', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const disclaimer = 'Este manifiesto certifica que el licenciamiento de GRAVY v2.0 se realiza bajo la titularidad personal de Julián Espinosa Arrubla, cumpliendo rigurosamente la Ley Estatutaria 1581 de 2012, el Código de Comercio de Colombia y los lineamientos de la DIAN respecto a facturación electrónica e información exógena.';
    const discLines = doc.splitTextToSize(disclaimer, 185);
    doc.text(discLines, 14, y);

    const fileName = `GRAVY_Manifiesto_Legal_${isLocal ? 'Local' : 'Cloud'}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(fileName);

    if (typeof showToast === 'function') showToast('Manifiesto Legal descargado en PDF.', 'success');
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
    <div style="background:#FFFFFF; border-radius:18px; width:100%; max-width:850px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 20px 40px rgba(0,0,0,0.2); overflow:hidden; border:1px solid #E2E8F0;">
      <div style="padding:20px 24px; border-bottom:1px solid #E2E8F0; display:flex; justify-content:space-between; align-items:center; background:#FAF8F5;">
        <div>
          <h3 style="margin:0; font-family:'Fraunces', Georgia, serif; font-size:18px; font-weight:700; color:#0F172A;">
            <i class="fas fa-shield-halved mr-1.5" style="color:#7C3AED;"></i> Marco Legal y Política de Datos — GRAVY
          </h3>
          <p style="margin:2px 0 0; font-size:12px; color:#64748B;">
            Titular: <strong>Julián Espinosa Arrubla (C.C. 1130636393)</strong> · Cali / Valle del Cauca, Colombia · Notificaciones: <a href="mailto:gravy.legal@gmail.com" style="color:#7C3AED; font-weight:600; text-decoration:none;">gravy.legal@gmail.com</a>
          </p>
        </div>
        <button type="button" id="btn-close-legal-modal" style="background:none; border:none; font-size:18px; color:#64748B; cursor:pointer; padding:4px 8px;">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <div style="padding:24px; overflow-y:auto; font-size:13.5px; line-height:1.7; color:#334155; max-height:65vh;">
        <div style="padding:12px 16px; border-radius:10px; background:#F5F3FF; border-left:4px solid #7C3AED; margin-bottom:16px;">
          <strong>Aviso Importante:</strong> El uso de GRAVY constituye aceptación expresa de los Términos de Licencia (Ley 23/1982), la Política de Tratamiento de Datos Personales (Ley 1581/2012) y el Deslinde de Responsabilidad Contable (Ley 43/1990).
        </div>
        ${LEGAL_SECTIONS.map(s => `
          <div style="margin-bottom:20px;">
            <h4 style="font-size:14px; font-weight:700; color:#0F172A; margin-bottom:6px;">${esc(s.title)}</h4>
            <div style="font-size:13px; color:#475569;">${s.localContent}</div>
          </div>
        `).join('')}
      </div>
      <div style="padding:14px 24px; border-top:1px solid #E2E8F0; display:flex; justify-content:flex-end; gap:10px; background:#F8FAFC;">
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

