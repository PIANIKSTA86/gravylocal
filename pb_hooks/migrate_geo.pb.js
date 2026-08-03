/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 - migrate_geo.pb.js
 * Crea las colecciones geograficas (countries, departments, municipalities)
 * y las siembra con los datos DANE / ISO la primera vez que se ejecuta.
 *
 * IDEMPOTENTE: si ya existen registros, no vuelve a insertar.
 * NOTA: el codigo de siembra esta inlineado en el callback para compatibilidad
 * con PocketBase v0.23+ (cada callback corre en un contexto de runtime aislado).
 */

onBootstrap(function(e) {
  e.next();

  // 1. Crear/verificar coleccion countries
  try {
    $app.findCollectionByNameOrId('geo_countries');
  } catch (_) {
    var col1 = new Collection({
      name: 'geo_countries',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'code', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_geo_country_code ON geo_countries (code)'],
    });
    $app.save(col1);
    console.log('[GRAVY] Coleccion geo_countries creada.');
  }

  // 2. Crear/verificar coleccion departments
  try {
    $app.findCollectionByNameOrId('geo_departments');
  } catch (_) {
    var col2 = new Collection({
      name: 'geo_departments',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'code',         type: 'text', required: true },
        { name: 'name',         type: 'text', required: true },
        { name: 'country_code', type: 'text', required: false },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_geo_dept_code ON geo_departments (code)'],
    });
    $app.save(col2);
    console.log('[GRAVY] Coleccion geo_departments creada.');
  }

  // 3. Crear/verificar coleccion municipalities
  try {
    $app.findCollectionByNameOrId('geo_municipalities');
  } catch (_) {
    var col3 = new Collection({
      name: 'geo_municipalities',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'code',        type: 'text', required: true },
        { name: 'name',        type: 'text', required: true },
        { name: 'dept_code',   type: 'text', required: true },
        { name: 'postal_code', type: 'text', required: false },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_geo_muni_code ON geo_municipalities (code)',
        'CREATE INDEX idx_geo_muni_dept ON geo_municipalities (dept_code)',
      ],
    });
    $app.save(col3);
    console.log('[GRAVY] Coleccion geo_municipalities creada.');
  }

  // 4. Sembrar datos si estan vacias (inlineado para evitar referencia externa)
  try {
    var existing = $app.findRecordsByFilter('geo_countries', '1=1', '', 1, 0);
    if (existing && existing.length > 0) return; // ya sembrado
  } catch (_) {
    return; // coleccion no existe
  }

  console.log('[GRAVY] Sembrando datos geograficos...');

  var PAISES = [
    ["CO","COLOMBIA"],["AF","AFGANISTAN"],["AX","ALAND"],["AL","ALBANIA"],["DE","ALEMANIA"],
    ["AD","ANDORRA"],["AO","ANGOLA"],["AI","ANGUILA"],["AQ","ANTARTIDA"],["AG","ANTIGUA Y BARBUDA"],
    ["SA","ARABIA SAUDITA"],["DZ","ARGELIA"],["AR","ARGENTINA"],["AM","ARMENIA"],["AW","ARUBA"],
    ["AU","AUSTRALIA"],["AT","AUSTRIA"],["AZ","AZERBAIYAN"],["BS","BAHAMAS"],["BH","BAREIN"],
    ["BD","BANGLADESH"],["BB","BARBADOS"],["BY","BIELORUSIA"],["BE","BELGICA"],["BZ","BELICE"],
    ["BJ","BENIN"],["BM","BERMUDAS"],["BT","BUTAN"],["BO","BOLIVIA"],["BA","BOSNIA Y HERZEGOVINA"],
    ["BW","BOTSWANA"],["BV","ISLA BOUVET"],["BR","BRASIL"],["BN","BRUNEI"],["BG","BULGARIA"],
    ["BF","BURKINA FASO"],["BI","BURUNDI"],["CV","CABO VERDE"],["KH","CAMBOYA"],["CM","CAMERUN"],
    ["CA","CANADA"],["KY","ISLAS CAIMAN"],["CF","REPUBLICA CENTROAFRICANA"],["TD","CHAD"],
    ["CL","CHILE"],["CN","CHINA"],["CX","ISLA DE NAVIDAD"],["CC","ISLAS COCOS"],["CG","CONGO"],
    ["CD","REPUBLICA DEMOCRATICA DEL CONGO"],["CK","ISLAS COOK"],["CR","COSTA RICA"],
    ["CI","COSTA DE MARFIL"],["HR","CROACIA"],["CU","CUBA"],["CW","CURAZAO"],["CY","CHIPRE"],
    ["CZ","CHEQUIA"],["DK","DINAMARCA"],["DJ","YIBUTI"],["DM","DOMINICA"],["DO","REPUBLICA DOMINICANA"],
    ["EC","ECUADOR"],["EG","EGIPTO"],["SV","EL SALVADOR"],["AE","EMIRATOS ARABES UNIDOS"],
    ["ER","ERITREA"],["SK","ESLOVAQUIA"],["SI","ESLOVENIA"],["ES","ESPANA"],["US","ESTADOS UNIDOS"],
    ["EE","ESTONIA"],["SZ","ESUATINI"],["ET","ETIOPIA"],["FO","ISLAS FEROE"],["FJ","FIYI"],
    ["FI","FINLANDIA"],["FR","FRANCIA"],["GA","GABON"],["GM","GAMBIA"],["GE","GEORGIA"],
    ["GS","GEORGIA DEL SUR E ISLAS SANDWICH DEL SUR"],["GH","GHANA"],["GI","GIBRALTAR"],
    ["GD","GRANADA"],["GR","GRECIA"],["GL","GROENLANDIA"],["GP","GUADALUPE"],["GU","GUAM"],
    ["GT","GUATEMALA"],["GG","GUERNESEY"],["GN","GUINEA"],["GW","GUINEA-BISAU"],["GQ","GUINEA ECUATORIAL"],
    ["GY","GUYANA"],["GF","GUAYANA FRANCESA"],["HT","HAITI"],["HM","ISLAS HEARD Y MCDONALD"],
    ["HN","HONDURAS"],["HK","HONG KONG"],["HU","HUNGRIA"],["IN","INDIA"],["ID","INDONESIA"],
    ["IQ","IRAK"],["IR","IRAN"],["IE","IRLANDA"],["IM","ISLA DE MAN"],["IS","ISLANDIA"],
    ["IL","ISRAEL"],["IT","ITALIA"],["JM","JAMAICA"],["JP","JAPON"],["JE","JERSEY"],
    ["JO","JORDANIA"],["KZ","KAZAJISTAN"],["KE","KENIA"],["KG","KIRGUISTAN"],["KI","KIRIBATI"],
    ["KW","KUWAIT"],["LA","LAOS"],["LS","LESOTO"],["LV","LETONIA"],["LB","LIBANO"],
    ["LR","LIBERIA"],["LY","LIBIA"],["LI","LIECHTENSTEIN"],["LT","LITUANIA"],["LU","LUXEMBURGO"],
    ["MO","MACAO"],["MG","MADAGASCAR"],["MY","MALASIA"],["MW","MALAUI"],["MV","MALDIVAS"],
    ["ML","MALI"],["MT","MALTA"],["FK","ISLAS MALVINAS"],["MP","ISLAS MARIANAS DEL NORTE"],
    ["MA","MARRUECOS"],["MH","ISLAS MARSHALL"],["MQ","MARTINICA"],["MU","MAURICIO"],
    ["MR","MAURITANIA"],["YT","MAYOTTE"],["MX","MEXICO"],["FM","MICRONESIA"],["MD","MOLDAVIA"],
    ["MC","MONACO"],["MN","MONGOLIA"],["ME","MONTENEGRO"],["MS","MONTSERRAT"],["MZ","MOZAMBIQUE"],
    ["MM","MYANMAR"],["NA","NAMIBIA"],["NR","NAURU"],["NP","NEPAL"],["NI","NICARAGUA"],
    ["NE","NIGER"],["NG","NIGERIA"],["NU","NIUE"],["NF","ISLA NORFOLK"],["NO","NORUEGA"],
    ["NC","NUEVA CALEDONIA"],["NZ","NUEVA ZELANDA"],["OM","OMAN"],["NL","PAISES BAJOS"],
    ["PK","PAKISTAN"],["PW","PALAOS"],["PA","PANAMA"],["PG","PAPUA NUEVA GUINEA"],["PY","PARAGUAY"],
    ["PE","PERU"],["PN","ISLAS PITCAIRN"],["PF","POLINESIA FRANCESA"],["PL","POLONIA"],
    ["PT","PORTUGAL"],["PR","PUERTO RICO"],["QA","CATAR"],["GB","REINO UNIDO"],["RW","RUANDA"],
    ["RO","RUMANIA"],["RU","RUSIA"],["EH","SAHARA OCCIDENTAL"],["WS","SAMOA"],["AS","SAMOA AMERICANA"],
    ["KN","SAN CRISTOBAL Y NIEVES"],["SM","SAN MARINO"],["PM","SAN PEDRO Y MIQUELON"],
    ["VC","SAN VICENTE Y LAS GRANADINAS"],["SH","SANTA ELENA ASCENSION Y TRISTAN DE ACUNA"],
    ["LC","SANTA LUCIA"],["ST","SANTO TOME Y PRINCIPE"],["SN","SENEGAL"],["RS","SERBIA"],
    ["SC","SEYCHELLES"],["SL","SIERRA LEONA"],["SG","SINGAPUR"],["SX","SINT MAARTEN"],
    ["SY","SIRIA"],["SO","SOMALIA"],["LK","SRI LANKA"],["ZA","SUDAFRICA"],["SS","SUDAN DEL SUR"],
    ["SD","SUDAN"],["SE","SUECIA"],["CH","SUIZA"],["SR","SURINAM"],["SJ","SVALBARD Y JAN MAYEN"],
    ["TH","TAILANDIA"],["TW","TAIWAN"],["TZ","TANZANIA"],["TJ","TAYIKISTAN"],["IO","TERRITORIO BRITANICO DEL OCEANO INDICO"],
    ["TF","TIERRAS AUSTRALES FRANCESAS"],["TL","TIMOR ORIENTAL"],["TG","TOGO"],["TK","TOKELAU"],
    ["TO","TONGA"],["TT","TRINIDAD Y TOBAGO"],["TN","TUNEZ"],["TM","TURKMENISTAN"],
    ["TC","ISLAS TURCAS Y CAICOS"],["TR","TURQUIA"],["TV","TUVALU"],["UA","UCRANIA"],
    ["UG","UGANDA"],["UY","URUGUAY"],["UZ","UZBEKISTAN"],["VU","VANUATU"],["VA","CIUDAD DEL VATICANO"],
    ["VE","VENEZUELA"],["VN","VIETNAM"],["WF","WALLIS Y FUTUNA"],["YE","YEMEN"],["ZM","ZAMBIA"],["ZW","ZIMBABUE"]
  ];

  try {
    var colP = $app.findCollectionByNameOrId('geo_countries');
    for (var i = 0; i < PAISES.length; i++) {
      var recP = new Record(colP);
      recP.set('code', PAISES[i][0]);
      recP.set('name', PAISES[i][1]);
      $app.save(recP);
    }
    console.log('[GRAVY] ' + PAISES.length + ' paises sembrados.');
  } catch (err) {
    console.error('[GRAVY] Error sembrando paises: ' + String(err));
  }

  var DEPTS = [
    ["91","AMAZONAS"],["05","ANTIOQUIA"],["81","ARAUCA"],["08","ATLANTICO"],
    ["11","BOGOTA D.C."],["13","BOLIVAR"],["15","BOYACA"],["17","CALDAS"],
    ["18","CAQUETA"],["85","CASANARE"],["19","CAUCA"],["20","CESAR"],
    ["27","CHOCO"],["23","CORDOBA"],["25","CUNDINAMARCA"],["94","GUAINIA"],
    ["95","GUAVIARE"],["41","HUILA"],["44","LA GUAJIRA"],["47","MAGDALENA"],
    ["50","META"],["52","NARINO"],["54","NORTE DE SANTANDER"],["86","PUTUMAYO"],
    ["63","QUINDIO"],["66","RISARALDA"],["88","SAN ANDRES Y PROVIDENCIA"],
    ["68","SANTANDER"],["70","SUCRE"],["73","TOLIMA"],["76","VALLE DEL CAUCA"],
    ["97","VAUPES"],["99","VICHADA"]
  ];

  try {
    var colD = $app.findCollectionByNameOrId('geo_departments');
    for (var j = 0; j < DEPTS.length; j++) {
      var recD = new Record(colD);
      recD.set('code', DEPTS[j][0]);
      recD.set('name', DEPTS[j][1]);
      recD.set('country_code', 'CO');
      $app.save(recD);
    }
    console.log('[GRAVY] ' + DEPTS.length + ' departamentos sembrados.');
  } catch (err) {
    console.error('[GRAVY] Error sembrando departamentos: ' + String(err));
  }

  console.log('[GRAVY] Siembra geografica completada.');
});