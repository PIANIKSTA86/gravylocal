(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function a(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(s){if(s.ep)return;s.ep=!0;const n=a(s);fetch(s.href,n)}})();const ws=[{code:"CO",name:"COLOMBIA"},{code:"AF",name:"AFGANISTAN"},{code:"AX",name:"ALAND"},{code:"AL",name:"ALBANIA"},{code:"DE",name:"ALEMANIA"},{code:"AD",name:"ANDORRA"},{code:"AO",name:"ANGOLA"},{code:"AI",name:"ANGUILA"},{code:"AQ",name:"ANTARTIDA"},{code:"AG",name:"ANTIGUA Y BARBUDA"},{code:"SA",name:"ARABIA SAUDITA"},{code:"DZ",name:"ARGELIA"},{code:"AR",name:"ARGENTINA"},{code:"AM",name:"ARMENIA"},{code:"AW",name:"ARUBA"},{code:"AU",name:"AUSTRALIA"},{code:"AT",name:"AUSTRIA"},{code:"AZ",name:"AZERBAIYAN"},{code:"BS",name:"BAHAMAS"},{code:"BD",name:"BANGLADES"},{code:"BB",name:"BARBADOS"},{code:"BH",name:"BAREIN"},{code:"BE",name:"BELGICA"},{code:"BZ",name:"BELICE"},{code:"BJ",name:"BENIN"},{code:"BM",name:"BERMUDAS"},{code:"BY",name:"BIELORRUSIA"},{code:"BO",name:"BOLIVIA"},{code:"BQ",name:"BONAIRE, SAN EUSTAQUIO Y SABA"},{code:"BA",name:"BOSNIA Y HERZEGOVINA"},{code:"BW",name:"BOTSUANA"},{code:"BR",name:"BRASIL"},{code:"BN",name:"BRUNEI"},{code:"BG",name:"BULGARIA"},{code:"BF",name:"BURKINA FASO"},{code:"BI",name:"BURUNDI"},{code:"BT",name:"BUTAN"},{code:"CV",name:"CABO VERDE"},{code:"KH",name:"CAMBOYA"},{code:"CM",name:"CAMERUN"},{code:"CA",name:"CANADA"},{code:"QA",name:"CATAR"},{code:"TD",name:"CHAD"},{code:"CL",name:"CHILE"},{code:"CN",name:"CHINA"},{code:"CY",name:"CHIPRE"},{code:"KM",name:"COMORAS"},{code:"KP",name:"COREA DEL NORTE"},{code:"KR",name:"COREA DEL SUR"},{code:"CI",name:"COSTA DE MARFIL"},{code:"CR",name:"COSTA RICA"},{code:"HR",name:"CROACIA"},{code:"CU",name:"CUBA"},{code:"CW",name:"CURAZAO"},{code:"DK",name:"DINAMARCA"},{code:"DM",name:"DOMINICA"},{code:"EC",name:"ECUADOR"},{code:"EG",name:"EGIPTO"},{code:"SV",name:"EL SALVADOR"},{code:"AE",name:"EMIRATOS ARABES UNIDOS"},{code:"ER",name:"ERITREA"},{code:"SK",name:"ESLOVAQUIA"},{code:"SI",name:"ESLOVENIA"},{code:"ES",name:"ESPAÑA"},{code:"US",name:"ESTADOS UNIDOS"},{code:"EE",name:"ESTONIA"},{code:"ET",name:"ETIOPIA"},{code:"PH",name:"FILIPINAS"},{code:"FI",name:"FINLANDIA"},{code:"FJ",name:"FIYI"},{code:"FR",name:"FRANCIA"},{code:"GA",name:"GABON"},{code:"GM",name:"GAMBIA"},{code:"GE",name:"GEORGIA"},{code:"GH",name:"GHANA"},{code:"GI",name:"GIBRALTAR"},{code:"GD",name:"GRANADA"},{code:"GR",name:"GRECIA"},{code:"GL",name:"GROENLANDIA"},{code:"GP",name:"GUADALUPE"},{code:"GU",name:"GUAM"},{code:"GT",name:"GUATEMALA"},{code:"GF",name:"GUAYANA FRANCESA"},{code:"GG",name:"GUERNSEY"},{code:"GN",name:"GUINEA"},{code:"GQ",name:"GUINEA ECUATORIAL"},{code:"GW",name:"GUINEA-BISAU"},{code:"GY",name:"GUYANA"},{code:"HT",name:"HAITI"},{code:"HN",name:"HONDURAS"},{code:"HK",name:"HONG KONG"},{code:"HU",name:"HUNGRIA"},{code:"IN",name:"INDIA"},{code:"ID",name:"INDONESIA"},{code:"IQ",name:"IRAK"},{code:"IR",name:"IRAN"},{code:"IE",name:"IRLANDA"},{code:"BV",name:"ISLA BOUVET"},{code:"IM",name:"ISLA DE MAN"},{code:"CX",name:"ISLA DE NAVIDAD"},{code:"IS",name:"ISLANDIA"},{code:"KY",name:"ISLAS CAIMAN"},{code:"CC",name:"ISLAS COCOS"},{code:"CK",name:"ISLAS COOK"},{code:"FO",name:"ISLAS FEROE"},{code:"GS",name:"ISLAS GEORGIAS DEL SUR Y SANDWICH DEL SUR"},{code:"HM",name:"ISLAS HEARD Y MCDONALD"},{code:"FK",name:"ISLAS MALVINAS"},{code:"MP",name:"ISLAS MARIANAS DEL NORTE"},{code:"MH",name:"ISLAS MARSHALL"},{code:"PN",name:"ISLAS PITCAIRN"},{code:"SB",name:"ISLAS SALOMON"},{code:"TC",name:"ISLAS TURCAS Y CAICOS"},{code:"UM",name:"ISLAS ULTRAMARINAS DE ESTADOS UNIDOS"},{code:"VG",name:"ISLAS VIRGENES BRITANICAS"},{code:"VI",name:"ISLAS VIRGENES DE LOS ESTADOS UNIDOS"},{code:"IL",name:"ISRAEL"},{code:"IT",name:"ITALIA"},{code:"JM",name:"JAMAICA"},{code:"JP",name:"JAPON"},{code:"JE",name:"JERSEY"},{code:"JO",name:"JORDANIA"},{code:"KZ",name:"KAZAJISTAN"},{code:"KE",name:"KENIA"},{code:"KG",name:"KIRGUISTAN"},{code:"KI",name:"KIRIBATI"},{code:"KW",name:"KUWAIT"},{code:"LA",name:"LAOS"},{code:"LS",name:"LESOTO"},{code:"LV",name:"LETONIA"},{code:"LB",name:"LIBANO"},{code:"LR",name:"LIBERIA"},{code:"LY",name:"LIBIA"},{code:"LI",name:"LIECHTENSTEIN"},{code:"LT",name:"LITUANIA"},{code:"LU",name:"LUXEMBURGO"},{code:"MO",name:"MACAO"},{code:"MK",name:"MACEDONIA"},{code:"MG",name:"MADAGASCAR"},{code:"MY",name:"MALASIA"},{code:"MW",name:"MALAUI"},{code:"MV",name:"MALDIVAS"},{code:"ML",name:"MALI"},{code:"MT",name:"MALTA"},{code:"MA",name:"MARRUECOS"},{code:"MQ",name:"MARTINICA"},{code:"MU",name:"MAURICIO"},{code:"MR",name:"MAURITANIA"},{code:"YT",name:"MAYOTTE"},{code:"MX",name:"MEXICO"},{code:"FM",name:"MICRONESIA"},{code:"MD",name:"MOLDAVIA"},{code:"MC",name:"MONACO"},{code:"MN",name:"MONGOLIA"},{code:"ME",name:"MONTENEGRO"},{code:"MS",name:"MONTSERRAT"},{code:"MZ",name:"MOZAMBIQUE"},{code:"MM",name:"MYANMAR"},{code:"NA",name:"NAMIBIA"},{code:"NR",name:"NAURU"},{code:"NP",name:"NEPAL"},{code:"NI",name:"NICARAGUA"},{code:"NE",name:"NIGER"},{code:"NG",name:"NIGERIA"},{code:"UN",name:"NIUE"},{code:"NF",name:"NORFOLK"},{code:"NO",name:"NORUEGA"},{code:"NC",name:"NUEVA CALEDONIA"},{code:"NZ",name:"NUEVA ZELANDA"},{code:"OM",name:"OMAN"},{code:"NL",name:"PAISES BAJOS"},{code:"PK",name:"PAKISTAN"},{code:"PW",name:"PALAOS"},{code:"PS",name:"PALESTINA"},{code:"PA",name:"PANAMA"},{code:"PG",name:"PAPUA NUEVA GUINEA"},{code:"PY",name:"PARAGUAY"},{code:"PE",name:"PERU"},{code:"PF",name:"POLINESIA FRANCESA"},{code:"PL",name:"POLONIA"},{code:"PT",name:"PORTUGAL"},{code:"PR",name:"PUERTO RICO"},{code:"GB",name:"REINO UNIDO"},{code:"EH",name:"REPUBLICA ARABE SAHARAUI DEMOCRATICA"},{code:"CF",name:"REPUBLICA CENTROAFRICANA"},{code:"CZ",name:"REPUBLICA CHECA"},{code:"CG",name:"REPUBLICA DEL CONGO"},{code:"CD",name:"REPUBLICA DEMOCRATICA DEL CONGO"},{code:"DO",name:"REPUBLICA DOMINICANA"},{code:"RE",name:"REUNION"},{code:"RW",name:"RUANDA"},{code:"RO",name:"RUMANIA"},{code:"RU",name:"RUSIA"},{code:"WS",name:"SAMOA"},{code:"AS",name:"SAMOA AMERICANA"},{code:"BL",name:"SAN BARTOLOME"},{code:"KN",name:"SAN CRISTOBAL Y NIEVES"},{code:"SM",name:"SAN MARINO"},{code:"MF",name:"SAN MARTIN"},{code:"PM",name:"SAN PEDRO Y MIQUELON"},{code:"VC",name:"SAN VICENTE Y LAS GRANADINAS"},{code:"SH",name:"SANTA ELENA, ASCENSION Y TRISTAN DE ACUÑA"},{code:"LC",name:"SANTA LUCIA"},{code:"ST",name:"SANTO TOME Y PRINCIPE"},{code:"SN",name:"SENEGAL"},{code:"RS",name:"SERBIA"},{code:"SC",name:"SEYCHELLES"},{code:"SL",name:"SIERRA LEONA"},{code:"SG",name:"SINGAPUR"},{code:"SX",name:"SINT MAARTEN"},{code:"SY",name:"SIRIA"},{code:"SO",name:"SOMALIA"},{code:"LK",name:"SRI LANKA"},{code:"SZ",name:"SUAZILANDIA"},{code:"ZA",name:"SUDAFRICA"},{code:"SD",name:"SUDAN"},{code:"SS",name:"SUDAN DEL SUR"},{code:"SE",name:"SUECIA"},{code:"CH",name:"SUIZA"},{code:"SR",name:"SURINAM"},{code:"SJ",name:"SVALBARD Y JAN MAYEN"},{code:"TH",name:"TAILANDIA"},{code:"TW",name:"TAIWAN (REPUBLICA DE CHINA)"},{code:"TZ",name:"TANZANIA"},{code:"TJ",name:"TAYIKISTAN"},{code:"IO",name:"TERRITORIO BRITANICO DEL OCEANO INDICO"},{code:"TF",name:"TIERRAS AUSTRALES Y ANTARTICAS FRANCESAS"},{code:"TL",name:"TIMOR ORIENTAL"},{code:"TG",name:"TOGO"},{code:"TK",name:"TOKELAU"},{code:"TO",name:"TONGA"},{code:"TT",name:"TRINIDAD Y TOBAGO"},{code:"TN",name:"TUNEZ"},{code:"TM",name:"TURKMENISTAN"},{code:"TR",name:"TURQUIA"},{code:"TV",name:"TUVALU"},{code:"UA",name:"UCRANIA"},{code:"UG",name:"UGANDA"},{code:"UY",name:"URUGUAY"},{code:"UZ",name:"UZBEKISTAN"},{code:"VU",name:"VANUATU"},{code:"VA",name:"VATICANO, CIUDAD DEL"},{code:"VE",name:"VENEZUELA"},{code:"VN",name:"VIETNAM"},{code:"WF",name:"WALLIS Y FUTUNA"},{code:"YE",name:"YEMEN"},{code:"DJ",name:"YIBUTI"},{code:"ZM",name:"ZAMBIA"},{code:"ZW",name:"ZIMBABUE"}],Es=[{code:"05",name:"ANTIOQUIA"},{code:"08",name:"ATLANTICO"},{code:"11",name:"BOGOTA"},{code:"13",name:"BOLIVAR"},{code:"15",name:"BOYACA"},{code:"17",name:"CALDAS"},{code:"18",name:"CAQUETA"},{code:"19",name:"CAUCA"},{code:"20",name:"CESAR"},{code:"23",name:"CORDOBA"},{code:"25",name:"CUNDINAMARCA"},{code:"27",name:"CHOCO"},{code:"41",name:"HUILA"},{code:"44",name:"LA GUAJIRA"},{code:"47",name:"MAGDALENA"},{code:"50",name:"META"},{code:"52",name:"NARINO"},{code:"54",name:"NORTE DE SANTANDER"},{code:"63",name:"QUINDIO"},{code:"66",name:"RISARALDA"},{code:"68",name:"SANTANDER"},{code:"70",name:"SUCRE"},{code:"73",name:"TOLIMA"},{code:"76",name:"VALLE DEL CAUCA"},{code:"81",name:"ARAUCA"},{code:"85",name:"CASANARE"},{code:"86",name:"PUTUMAYO"},{code:"88",name:"SAN ANDRES"},{code:"91",name:"AMAZONAS"},{code:"94",name:"GUAINIA"},{code:"95",name:"GUAVIARE"},{code:"97",name:"VAUPES"},{code:"99",name:"VICHADA"}],Co=[{dept_code:"91",code:"91001",name:"LETICIA",postal:"910001"},{dept_code:"91",code:"91263",name:"EL ENCANTO",postal:"913010"},{dept_code:"91",code:"91405",name:"LA CHORRERA",postal:"914057"},{dept_code:"91",code:"91407",name:"LA PEDRERA",postal:"917010"},{dept_code:"91",code:"91430",name:"LA VICTORIA",postal:"916017"},{dept_code:"91",code:"91460",name:"MIRITI _ PARANA",postal:"916057"},{dept_code:"91",code:"91530",name:"PUERTO ALEGRIA",postal:"913050"},{dept_code:"91",code:"91536",name:"PUERTO ARICA",postal:"912010"},{dept_code:"91",code:"91540",name:"PUERTO NARINO",postal:"911017"},{dept_code:"91",code:"91669",name:"PUERTO SANTANDER",postal:"915010"},{dept_code:"91",code:"91798",name:"TARAPACA",postal:"911030"},{dept_code:"05",code:"05001",name:"MEDELLIN",postal:"050013"},{dept_code:"05",code:"05002",name:"ABEJORRAL",postal:"055030"},{dept_code:"05",code:"05004",name:"ABRIAQUI",postal:"057460"},{dept_code:"05",code:"05021",name:"ALEJANDRIA",postal:"053820"},{dept_code:"05",code:"05030",name:"AMAGA",postal:"055840"},{dept_code:"05",code:"05031",name:"AMALFI",postal:"052840"},{dept_code:"05",code:"05034",name:"ANDES",postal:"056068"},{dept_code:"05",code:"05036",name:"ANGELOPOLIS",postal:"055830"},{dept_code:"05",code:"05038",name:"ANGOSTURA",postal:"051810"},{dept_code:"05",code:"05040",name:"ANORI",postal:"052857"},{dept_code:"05",code:"05042",name:"SANTAFE DE ANTIOQUIA",postal:"057050"},{dept_code:"05",code:"05044",name:"ANZA",postal:"056850"},{dept_code:"05",code:"05045",name:"APARTADO",postal:"057841"},{dept_code:"05",code:"05051",name:"ARBOLETES",postal:"057820"},{dept_code:"05",code:"05055",name:"ARGELIA",postal:"054838"},{dept_code:"05",code:"05059",name:"ARMENIA",postal:"055860"},{dept_code:"05",code:"05079",name:"BARBOSA",postal:"051028"},{dept_code:"05",code:"05086",name:"BELMIRA",postal:"051420"},{dept_code:"05",code:"05088",name:"BELLO",postal:"051050"},{dept_code:"05",code:"05091",name:"BETANIA",postal:"056070"},{dept_code:"05",code:"05093",name:"BETULIA",postal:"056860"},{dept_code:"05",code:"05101",name:"CIUDAD BOLIVAR",postal:"056460"},{dept_code:"05",code:"05107",name:"BRICENO",postal:"052060"},{dept_code:"05",code:"05113",name:"BURITICA",postal:"057030"},{dept_code:"05",code:"05120",name:"CACERES",postal:"052450"},{dept_code:"05",code:"05125",name:"CAICEDO",postal:"056840"},{dept_code:"05",code:"05129",name:"CALDAS",postal:"055440"},{dept_code:"05",code:"05134",name:"CAMPAMENTO",postal:"052020"},{dept_code:"05",code:"05138",name:"CANASGORDAS",postal:"057067"},{dept_code:"05",code:"05142",name:"CARACOLI",postal:"053450"},{dept_code:"05",code:"05145",name:"CARAMANTA",postal:"056040"},{dept_code:"05",code:"05147",name:"CAREPA",postal:"057850"},{dept_code:"05",code:"05148",name:"EL CARMEN DE VIBORAL",postal:"054037"},{dept_code:"05",code:"05150",name:"CAROLINA",postal:"051840"},{dept_code:"05",code:"05154",name:"CAUCASIA",postal:"052410"},{dept_code:"05",code:"05172",name:"CHIGORODO",postal:"057410"},{dept_code:"05",code:"05190",name:"CISNEROS",postal:"053050"},{dept_code:"05",code:"05197",name:"COCORNA",postal:"054440"},{dept_code:"05",code:"05206",name:"CONCEPCION",postal:"053810"},{dept_code:"05",code:"05209",name:"CONCORDIA",postal:"056410"},{dept_code:"05",code:"05212",name:"COPACABANA",postal:"051047"},{dept_code:"05",code:"05234",name:"DABEIBA",postal:"057430"},{dept_code:"05",code:"05237",name:"DONMATIAS",postal:"051850"},{dept_code:"05",code:"05240",name:"EBEJICO",postal:"055810"},{dept_code:"05",code:"05250",name:"EL BAGRE",postal:"052437"},{dept_code:"05",code:"05264",name:"ENTRERRIOS",postal:"051430"},{dept_code:"05",code:"05266",name:"ENVIGADO",postal:"055428"},{dept_code:"05",code:"05282",name:"FREDONIA",postal:"055070"},{dept_code:"05",code:"05284",name:"FRONTINO",postal:"057450"},{dept_code:"05",code:"05306",name:"GIRALDO",postal:"057040"},{dept_code:"05",code:"05308",name:"GIRARDOTA",postal:"051038"},{dept_code:"05",code:"05310",name:"GOMEZ PLATA",postal:"051830"},{dept_code:"05",code:"05313",name:"GRANADA",postal:"054410"},{dept_code:"05",code:"05315",name:"GUADALUPE",postal:"051820"},{dept_code:"05",code:"05318",name:"GUARNE",postal:"054050"},{dept_code:"05",code:"05321",name:"GUATAPE",postal:"053840"},{dept_code:"05",code:"05347",name:"HELICONIA",postal:"055820"},{dept_code:"05",code:"05353",name:"HISPANIA",postal:"056450"},{dept_code:"05",code:"05360",name:"ITAGUI",postal:"055411"},{dept_code:"05",code:"05361",name:"ITUANGO",postal:"052070"},{dept_code:"05",code:"05364",name:"JARDIN",postal:"056050"},{dept_code:"05",code:"05368",name:"JERICO",postal:"056010"},{dept_code:"05",code:"05376",name:"LA CEJA",postal:"055017"},{dept_code:"05",code:"05380",name:"LA ESTRELLA",postal:"055467"},{dept_code:"05",code:"05390",name:"LA PINTADA",postal:"055060"},{dept_code:"05",code:"05400",name:"LA UNION",postal:"055020"},{dept_code:"05",code:"05411",name:"LIBORINA",postal:"051460"},{dept_code:"05",code:"05425",name:"MACEO",postal:"053460"},{dept_code:"05",code:"05440",name:"MARINILLA",postal:"054020"},{dept_code:"05",code:"05467",name:"MONTEBELLO",postal:"055040"},{dept_code:"05",code:"05475",name:"MURINDO",postal:"056810"},{dept_code:"05",code:"05480",name:"MUTATA",postal:"057427"},{dept_code:"05",code:"05483",name:"NARINO",postal:"054840"},{dept_code:"05",code:"05490",name:"NECOCLI",postal:"057870"},{dept_code:"05",code:"05495",name:"NECHI",postal:"052420"},{dept_code:"05",code:"05501",name:"OLAYA",postal:"051450"},{dept_code:"05",code:"05541",name:"PENOL",postal:"053850"},{dept_code:"05",code:"05543",name:"PEQUE",postal:"057010"},{dept_code:"05",code:"05576",name:"PUEBLORRICO",postal:"056440"},{dept_code:"05",code:"05579",name:"PUERTO BERRIO",postal:"053420"},{dept_code:"05",code:"05585",name:"PUERTO NARE",postal:"053430"},{dept_code:"05",code:"05591",name:"PUERTO TRIUNFO",postal:"053440"},{dept_code:"05",code:"05604",name:"REMEDIOS",postal:"052820"},{dept_code:"05",code:"05607",name:"RETIRO",postal:"055438"},{dept_code:"05",code:"05615",name:"RIONEGRO",postal:"054040"},{dept_code:"05",code:"05628",name:"SABANALARGA",postal:"057020"},{dept_code:"05",code:"05631",name:"SABANETA",postal:"055450"},{dept_code:"05",code:"05642",name:"SALGAR",postal:"056478"},{dept_code:"05",code:"05647",name:"SAN ANDRES DE CUERQUIA",postal:"052040"},{dept_code:"05",code:"05649",name:"SAN CARLOS",postal:"054420"},{dept_code:"05",code:"05652",name:"SAN FRANCISCO",postal:"054810"},{dept_code:"05",code:"05656",name:"SAN JERONIMO",postal:"051070"},{dept_code:"05",code:"05658",name:"SAN JOSE DE LA MONTANA",postal:"051410"},{dept_code:"05",code:"05659",name:"SAN JUAN DE URABA",postal:"057810"},{dept_code:"05",code:"05660",name:"SAN LUIS",postal:"054430"},{dept_code:"05",code:"05664",name:"SAN PEDRO DE LOS MILAGROS",postal:"051010"},{dept_code:"05",code:"05665",name:"SAN PEDRO DE URABA",postal:"057830"},{dept_code:"05",code:"05667",name:"SAN RAFAEL",postal:"053838"},{dept_code:"05",code:"05670",name:"SAN ROQUE",postal:"053030"},{dept_code:"05",code:"05674",name:"SAN VICENTE",postal:"054010"},{dept_code:"05",code:"05679",name:"SANTA BARBARA",postal:"055050"},{dept_code:"05",code:"05686",name:"SANTA ROSA DE OSOS",postal:"051860"},{dept_code:"05",code:"05690",name:"SANTO DOMINGO",postal:"053040"},{dept_code:"05",code:"05697",name:"EL SANTUARIO",postal:"054450"},{dept_code:"05",code:"05736",name:"SEGOVIA",postal:"052810"},{dept_code:"05",code:"05756",name:"SONSON",postal:"054820"},{dept_code:"05",code:"05761",name:"SOPETRAN",postal:"051440"},{dept_code:"05",code:"05789",name:"TAMESIS",postal:"056020"},{dept_code:"05",code:"05790",name:"TARAZA",postal:"052460"},{dept_code:"05",code:"05792",name:"TARSO",postal:"056430"},{dept_code:"05",code:"05809",name:"TITIRIBI",postal:"055858"},{dept_code:"05",code:"05819",name:"TOLEDO",postal:"052050"},{dept_code:"05",code:"05837",name:"TURBO",postal:"057860"},{dept_code:"05",code:"05842",name:"URAMITA",postal:"057440"},{dept_code:"05",code:"05847",name:"URRAO",postal:"056830"},{dept_code:"05",code:"05854",name:"VALDIVIA",postal:"052010"},{dept_code:"05",code:"05856",name:"VALPARAISO",postal:"056030"},{dept_code:"05",code:"05858",name:"VEGACHI",postal:"052830"},{dept_code:"05",code:"05861",name:"VENECIA",postal:"056420"},{dept_code:"05",code:"05873",name:"VIGIA DEL FUERTE",postal:"056820"},{dept_code:"05",code:"05885",name:"YALI",postal:"053010"},{dept_code:"05",code:"05887",name:"YARUMAL",postal:"052030"},{dept_code:"05",code:"05890",name:"YOLOMBO",postal:"053020"},{dept_code:"05",code:"05893",name:"YONDO",postal:"053410"},{dept_code:"05",code:"05895",name:"ZARAGOZA",postal:"052440"},{dept_code:"81",code:"81001",name:"ARAUCA",postal:"810001"},{dept_code:"81",code:"81065",name:"ARAUQUITA",postal:"816010"},{dept_code:"81",code:"81220",name:"CRAVO NORTE",postal:"812010"},{dept_code:"81",code:"81300",name:"FORTUL",postal:"814050"},{dept_code:"81",code:"81591",name:"PUERTO RONDON",postal:"813010"},{dept_code:"81",code:"81736",name:"SARAVENA",postal:"815010"},{dept_code:"81",code:"81794",name:"TAME",postal:"814018"},{dept_code:"08",code:"08001",name:"BARRANQUILLA",postal:"080010"},{dept_code:"08",code:"08078",name:"BARANOA",postal:"082027"},{dept_code:"08",code:"08137",name:"CAMPO DE LA CRUZ",postal:"084040"},{dept_code:"08",code:"08141",name:"CANDELARIA",postal:"084020"},{dept_code:"08",code:"08296",name:"GALAPA",postal:"082001"},{dept_code:"08",code:"08372",name:"JUAN DE ACOSTA",postal:"081048"},{dept_code:"08",code:"08421",name:"LURUACO",postal:"085060"},{dept_code:"08",code:"08433",name:"MALAMBO",postal:"083027"},{dept_code:"08",code:"08436",name:"MANATI",postal:"085020"},{dept_code:"08",code:"08520",name:"PALMAR DE VARELA",postal:"083087"},{dept_code:"08",code:"08549",name:"PIOJO",postal:"081060"},{dept_code:"08",code:"08558",name:"POLONUEVO",postal:"082040"},{dept_code:"08",code:"08560",name:"PONEDERA",postal:"084001"},{dept_code:"08",code:"08573",name:"PUERTO COLOMBIA",postal:"081008"},{dept_code:"08",code:"08606",name:"REPELON",postal:"085040"},{dept_code:"08",code:"08634",name:"SABANAGRANDE",postal:"083040"},{dept_code:"08",code:"08638",name:"SABANALARGA",postal:"085001"},{dept_code:"08",code:"08675",name:"SANTA LUCIA",postal:"084080"},{dept_code:"08",code:"08685",name:"SANTO TOMAS",postal:"083067"},{dept_code:"08",code:"08758",name:"SOLEDAD",postal:"083007"},{dept_code:"08",code:"08770",name:"SUAN",postal:"084060"},{dept_code:"08",code:"08832",name:"TUBARA",postal:"081027"},{dept_code:"08",code:"08849",name:"USIACURI",postal:"082067"},{dept_code:"11",code:"11001",name:"BOGOTA D.C.",postal:"111511"},{dept_code:"13",code:"13001",name:"CARTAGENA",postal:"130019"},{dept_code:"13",code:"13006",name:"ACHI",postal:"134020"},{dept_code:"13",code:"13030",name:"ALTOS DEL ROSARIO",postal:"133508"},{dept_code:"13",code:"13042",name:"ARENAL",postal:"134520"},{dept_code:"13",code:"13052",name:"ARJONA",postal:"131028"},{dept_code:"13",code:"13062",name:"ARROYOHONDO",postal:"131560"},{dept_code:"13",code:"13074",name:"BARRANCO DE LOBA",postal:"133517"},{dept_code:"13",code:"13140",name:"CALAMAR",postal:"131547"},{dept_code:"13",code:"13160",name:"CANTAGALLO",postal:"135060"},{dept_code:"13",code:"13188",name:"CICUCO",postal:"132550"},{dept_code:"13",code:"13212",name:"CORDOBA",postal:"132507"},{dept_code:"13",code:"13222",name:"CLEMENCIA",postal:"130510"},{dept_code:"13",code:"13244",name:"EL CARMEN DE BOLIVAR",postal:"132058"},{dept_code:"13",code:"13248",name:"EL GUAMO",postal:"132007"},{dept_code:"13",code:"13268",name:"EL PENON",postal:"133550"},{dept_code:"13",code:"13300",name:"HATILLO DE LOBA",postal:"133040"},{dept_code:"13",code:"13430",name:"MAGANGUE",postal:"132518"},{dept_code:"13",code:"13433",name:"MAHATES",postal:"131048"},{dept_code:"13",code:"13440",name:"MARGARITA",postal:"133020"},{dept_code:"13",code:"13442",name:"MARIA LA BAJA",postal:"131060"},{dept_code:"13",code:"13458",name:"MONTECRISTO",postal:"134070"},{dept_code:"13",code:"13468",name:"MOMPOS",postal:"132560"},{dept_code:"13",code:"13473",name:"MORALES",postal:"134540"},{dept_code:"13",code:"13490",name:"NOROSI",postal:"134510"},{dept_code:"13",code:"13549",name:"PINILLOS",postal:"134001"},{dept_code:"13",code:"13580",name:"REGIDOR",postal:"133560"},{dept_code:"13",code:"13600",name:"RIO VIEJO",postal:"134501"},{dept_code:"13",code:"13620",name:"SAN CRISTOBAL",postal:"131520"},{dept_code:"13",code:"13647",name:"SAN ESTANISLAO",postal:"130540"},{dept_code:"13",code:"13650",name:"SAN FERNANDO",postal:"133007"},{dept_code:"13",code:"13654",name:"SAN JACINTO",postal:"132030"},{dept_code:"13",code:"13655",name:"SAN JACINTO DEL CAUCA",postal:"134060"},{dept_code:"13",code:"13657",name:"SAN JUAN NEPOMUCENO",postal:"132010"},{dept_code:"13",code:"13667",name:"SAN MARTIN DE LOBA",postal:"133530"},{dept_code:"13",code:"13670",name:"SAN PABLO",postal:"135040"},{dept_code:"13",code:"13673",name:"SANTA CATALINA",postal:"130501"},{dept_code:"13",code:"13683",name:"SANTA ROSA",postal:"130527"},{dept_code:"13",code:"13688",name:"SANTA ROSA DEL SUR",postal:"135001"},{dept_code:"13",code:"13744",name:"SIMITI",postal:"135020"},{dept_code:"13",code:"13760",name:"SOPLAVIENTO",postal:"131501"},{dept_code:"13",code:"13780",name:"TALAIGUA NUEVO",postal:"132540"},{dept_code:"13",code:"13810",name:"TIQUISIO",postal:"134040"},{dept_code:"13",code:"13836",name:"TURBACO",postal:"131007"},{dept_code:"13",code:"13838",name:"TURBANA",postal:"131010"},{dept_code:"13",code:"13873",name:"VILLANUEVA",postal:"130530"},{dept_code:"13",code:"13894",name:"ZAMBRANO",postal:"132047"},{dept_code:"15",code:"15001",name:"TUNJA",postal:"150003"},{dept_code:"15",code:"15022",name:"ALMEIDA",postal:"153020"},{dept_code:"15",code:"15047",name:"AQUITANIA",postal:"152420"},{dept_code:"15",code:"15051",name:"ARCABUCO",postal:"154201"},{dept_code:"15",code:"15087",name:"BELEN",postal:"150640"},{dept_code:"15",code:"15090",name:"BERBEO",postal:"152617"},{dept_code:"15",code:"15092",name:"BETEITIVA",postal:"150610"},{dept_code:"15",code:"15097",name:"BOAVITA",postal:"151060"},{dept_code:"15",code:"15104",name:"BOYACA",postal:"153610"},{dept_code:"15",code:"15106",name:"BRICENO",postal:"154670"},{dept_code:"15",code:"15109",name:"BUENAVISTA",postal:"154840"},{dept_code:"15",code:"15114",name:"BUSBANZA",postal:"152087"},{dept_code:"15",code:"15131",name:"CALDAS",postal:"154660"},{dept_code:"15",code:"15135",name:"CAMPOHERMOSO",postal:"152640"},{dept_code:"15",code:"15162",name:"CERINZA",postal:"150627"},{dept_code:"15",code:"15172",name:"CHINAVITA",postal:"153287"},{dept_code:"15",code:"15176",name:"CHIQUINQUIRA",postal:"154640"},{dept_code:"15",code:"15180",name:"CHISCAS",postal:"151401"},{dept_code:"15",code:"15183",name:"CHITA",postal:"151601"},{dept_code:"15",code:"15185",name:"CHITARAQUE",postal:"154420"},{dept_code:"15",code:"15187",name:"CHIVATA",postal:"150240"},{dept_code:"15",code:"15189",name:"CIENEGA",postal:"153440"},{dept_code:"15",code:"15204",name:"COMBITA",postal:"150201"},{dept_code:"15",code:"15212",name:"COPER",postal:"154860"},{dept_code:"15",code:"15215",name:"CORRALES",postal:"152060"},{dept_code:"15",code:"15218",name:"COVARACHIA",postal:"151040"},{dept_code:"15",code:"15223",name:"CUBARA",postal:"151420"},{dept_code:"15",code:"15224",name:"CUCAITA",postal:"154060"},{dept_code:"15",code:"15226",name:"CUITIVA",postal:"152230"},{dept_code:"15",code:"15232",name:"CHIQUIZA",postal:"154020"},{dept_code:"15",code:"15236",name:"CHIVOR",postal:"153001"},{dept_code:"15",code:"15238",name:"DUITAMA",postal:"150467"},{dept_code:"15",code:"15244",name:"EL COCUY",postal:"151280"},{dept_code:"15",code:"15248",name:"EL ESPINO",postal:"151240"},{dept_code:"15",code:"15272",name:"FIRAVITOBA",postal:"152250"},{dept_code:"15",code:"15276",name:"FLORESTA",postal:"150601"},{dept_code:"15",code:"15293",name:"GACHANTIVA",postal:"154220"},{dept_code:"15",code:"15296",name:"GAMEZA",postal:"152020"},{dept_code:"15",code:"15299",name:"GARAGOA",postal:"152860"},{dept_code:"15",code:"15317",name:"GUACAMAYAS",postal:"151220"},{dept_code:"15",code:"15322",name:"GUATEQUE",postal:"153050"},{dept_code:"15",code:"15325",name:"GUAYATA",postal:"153040"},{dept_code:"15",code:"15332",name:"GÜICAN",postal:"151440"},{dept_code:"15",code:"15362",name:"IZA",postal:"152240"},{dept_code:"15",code:"15367",name:"JENESANO",postal:"153601"},{dept_code:"15",code:"15368",name:"JERICO",postal:"150840"},{dept_code:"15",code:"15377",name:"LABRANZAGRANDE",postal:"151840"},{dept_code:"15",code:"15380",name:"LA CAPILLA",postal:"153220"},{dept_code:"15",code:"15401",name:"LA VICTORIA",postal:"155001"},{dept_code:"15",code:"15403",name:"LA UVITA",postal:"150860"},{dept_code:"15",code:"15407",name:"VILLA DE LEYVA",postal:"154001"},{dept_code:"15",code:"15425",name:"MACANAL",postal:"152840"},{dept_code:"15",code:"15442",name:"MARIPI",postal:"154820"},{dept_code:"15",code:"15455",name:"MIRAFLORES",postal:"152667"},{dept_code:"15",code:"15464",name:"MONGUA",postal:"152001"},{dept_code:"15",code:"15466",name:"MONGUI",postal:"152201"},{dept_code:"15",code:"15469",name:"MONIQUIRA",postal:"154260"},{dept_code:"15",code:"15476",name:"MOTAVITA",postal:"154080"},{dept_code:"15",code:"15480",name:"MUZO",postal:"154880"},{dept_code:"15",code:"15491",name:"NOBSA",postal:"152280"},{dept_code:"15",code:"15494",name:"NUEVO COLON",postal:"153620"},{dept_code:"15",code:"15500",name:"OICATA",postal:"150220"},{dept_code:"15",code:"15507",name:"OTANCHE",postal:"155060"},{dept_code:"15",code:"15511",name:"PACHAVITA",postal:"153210"},{dept_code:"15",code:"15514",name:"PAEZ",postal:"152620"},{dept_code:"15",code:"15516",name:"PAIPA",postal:"150447"},{dept_code:"15",code:"15518",name:"PAJARITO",postal:"152407"},{dept_code:"15",code:"15522",name:"PANQUEBA",postal:"151260"},{dept_code:"15",code:"15531",name:"PAUNA",postal:"154801"},{dept_code:"15",code:"15533",name:"PAYA",postal:"151827"},{dept_code:"15",code:"15537",name:"PAZ DE RIO",postal:"150680"},{dept_code:"15",code:"15542",name:"PESCA",postal:"152460"},{dept_code:"15",code:"15550",name:"PISBA",postal:"151801"},{dept_code:"15",code:"15572",name:"PUERTO BOYACA",postal:"155208"},{dept_code:"15",code:"15580",name:"QUIPAMA",postal:"155027"},{dept_code:"15",code:"15599",name:"RAMIRIQUI",postal:"153407"},{dept_code:"15",code:"15600",name:"RAQUIRA",postal:"153801"},{dept_code:"15",code:"15621",name:"RONDON",postal:"153420"},{dept_code:"15",code:"15632",name:"SABOYA",postal:"154601"},{dept_code:"15",code:"15638",name:"SACHICA",postal:"153887"},{dept_code:"15",code:"15646",name:"SAMACA",postal:"153660"},{dept_code:"15",code:"15660",name:"SAN EDUARDO",postal:"152601"},{dept_code:"15",code:"15664",name:"SAN JOSE DE PARE",postal:"154460"},{dept_code:"15",code:"15667",name:"SAN LUIS DE GACENO",postal:"152801"},{dept_code:"15",code:"15673",name:"SAN MATEO",postal:"151207"},{dept_code:"15",code:"15676",name:"SAN MIGUEL DE SEMA",postal:"153820"},{dept_code:"15",code:"15681",name:"SAN PABLO DE BORBUR",postal:"155040"},{dept_code:"15",code:"15686",name:"SANTANA",postal:"154440"},{dept_code:"15",code:"15690",name:"SANTA MARIA",postal:"152820"},{dept_code:"15",code:"15693",name:"SANTA ROSA DE VITERBO",postal:"150480"},{dept_code:"15",code:"15696",name:"SANTA SOFIA",postal:"154247"},{dept_code:"15",code:"15720",name:"SATIVANORTE",postal:"150820"},{dept_code:"15",code:"15723",name:"SATIVASUR",postal:"150801"},{dept_code:"15",code:"15740",name:"SIACHOQUE",postal:"153460"},{dept_code:"15",code:"15753",name:"SOATA",postal:"151001"},{dept_code:"15",code:"15755",name:"SOCOTA",postal:"151620"},{dept_code:"15",code:"15757",name:"SOCHA",postal:"151640"},{dept_code:"15",code:"15759",name:"SOGAMOSO",postal:"152217"},{dept_code:"15",code:"15761",name:"SOMONDOCO",postal:"153030"},{dept_code:"15",code:"15762",name:"SORA",postal:"154040"},{dept_code:"15",code:"15763",name:"SOTAQUIRA",postal:"150420"},{dept_code:"15",code:"15764",name:"SORACA",postal:"153480"},{dept_code:"15",code:"15774",name:"SUSACON",postal:"150880"},{dept_code:"15",code:"15776",name:"SUTAMARCHAN",postal:"153867"},{dept_code:"15",code:"15778",name:"SUTATENZA",postal:"153067"},{dept_code:"15",code:"15790",name:"TASCO",postal:"151660"},{dept_code:"15",code:"15798",name:"TENZA",postal:"153207"},{dept_code:"15",code:"15804",name:"TIBANA",postal:"153260"},{dept_code:"15",code:"15806",name:"TIBASOSA",postal:"152260"},{dept_code:"15",code:"15808",name:"TINJACA",postal:"153840"},{dept_code:"15",code:"15810",name:"TIPACOQUE",postal:"151020"},{dept_code:"15",code:"15814",name:"TOCA",postal:"150260"},{dept_code:"15",code:"15816",name:"TOGÜI",postal:"154401"},{dept_code:"15",code:"15820",name:"TOPAGA",postal:"152047"},{dept_code:"15",code:"15822",name:"TOTA",postal:"152440"},{dept_code:"15",code:"15832",name:"TUNUNGUA",postal:"154687"},{dept_code:"15",code:"15835",name:"TURMEQUE",postal:"153630"},{dept_code:"15",code:"15837",name:"TUTA",postal:"150401"},{dept_code:"15",code:"15839",name:"TUTAZA",postal:"150660"},{dept_code:"15",code:"15842",name:"UMBITA",postal:"153240"},{dept_code:"15",code:"15861",name:"VENTAQUEMADA",postal:"153640"},{dept_code:"15",code:"15879",name:"VIRACACHA",postal:"153450"},{dept_code:"15",code:"15897",name:"ZETAQUIRA",postal:"152680"},{dept_code:"17",code:"17001",name:"MANIZALES",postal:"170007"},{dept_code:"17",code:"17013",name:"AGUADAS",postal:"172020"},{dept_code:"17",code:"17042",name:"ANSERMA",postal:"177080"},{dept_code:"17",code:"17050",name:"ARANZAZU",postal:"171040"},{dept_code:"17",code:"17088",name:"BELALCAZAR",postal:"177001"},{dept_code:"17",code:"17174",name:"CHINCHINA",postal:"176020"},{dept_code:"17",code:"17272",name:"FILADELFIA",postal:"171020"},{dept_code:"17",code:"17380",name:"LA DORADA",postal:"175038"},{dept_code:"17",code:"17388",name:"LA MERCED",postal:"172067"},{dept_code:"17",code:"17433",name:"MANZANARES",postal:"173020"},{dept_code:"17",code:"17442",name:"MARMATO",postal:"178007"},{dept_code:"17",code:"17444",name:"MARQUETALIA",postal:"173040"},{dept_code:"17",code:"17446",name:"MARULANDA",postal:"173007"},{dept_code:"17",code:"17486",name:"NEIRA",postal:"171001"},{dept_code:"17",code:"17495",name:"NORCASIA",postal:"175001"},{dept_code:"17",code:"17513",name:"PACORA",postal:"172040"},{dept_code:"17",code:"17524",name:"PALESTINA",postal:"176040"},{dept_code:"17",code:"17541",name:"PENSILVANIA",postal:"173060"},{dept_code:"17",code:"17614",name:"RIOSUCIO",postal:"178057"},{dept_code:"17",code:"17616",name:"RISARALDA",postal:"177060"},{dept_code:"17",code:"17653",name:"SALAMINA",postal:"172001"},{dept_code:"17",code:"17662",name:"SAMANA",postal:"174001"},{dept_code:"17",code:"17665",name:"SAN JOSE",postal:"177040"},{dept_code:"17",code:"17777",name:"SUPIA",postal:"178020"},{dept_code:"17",code:"17867",name:"VICTORIA",postal:"174030"},{dept_code:"17",code:"17873",name:"VILLAMARIA",postal:"176001"},{dept_code:"17",code:"17877",name:"VITERBO",postal:"177020"},{dept_code:"18",code:"18001",name:"FLORENCIA",postal:"180009"},{dept_code:"18",code:"18029",name:"ALBANIA",postal:"186030"},{dept_code:"18",code:"18094",name:"BELEN DE LOS ANDAQUIES",postal:"186010"},{dept_code:"18",code:"18150",name:"CARTAGENA DEL CHAIRA",postal:"183010"},{dept_code:"18",code:"18205",name:"CURILLO",postal:"186050"},{dept_code:"18",code:"18247",name:"EL DONCELLO",postal:"181010"},{dept_code:"18",code:"18256",name:"EL PAUJIL",postal:"181030"},{dept_code:"18",code:"18410",name:"LA MONTANITA",postal:"181059"},{dept_code:"18",code:"18460",name:"MILAN",postal:"185030"},{dept_code:"18",code:"18479",name:"MORELIA",postal:"185010"},{dept_code:"18",code:"18592",name:"PUERTO RICO",postal:"182050"},{dept_code:"18",code:"18610",name:"SAN JOSE DEL FRAGUA",postal:"186070"},{dept_code:"18",code:"18753",name:"SAN VICENTE DEL CAGUAN",postal:"182010"},{dept_code:"18",code:"18756",name:"SOLANO",postal:"184010"},{dept_code:"18",code:"18785",name:"SOLITA",postal:"185070"},{dept_code:"18",code:"18860",name:"VALPARAISO",postal:"185050"},{dept_code:"85",code:"85001",name:"YOPAL",postal:"850009"},{dept_code:"85",code:"85010",name:"AGUAZUL",postal:"856010"},{dept_code:"85",code:"85015",name:"CHAMEZA",postal:"856030"},{dept_code:"85",code:"85125",name:"HATO COROZAL",postal:"852010"},{dept_code:"85",code:"85136",name:"LA SALINA",postal:"851010"},{dept_code:"85",code:"85139",name:"MANI",postal:"854018"},{dept_code:"85",code:"85162",name:"MONTERREY",postal:"855010"},{dept_code:"85",code:"85225",name:"NUNCHIA",postal:"851070"},{dept_code:"85",code:"85230",name:"OROCUE",postal:"853050"},{dept_code:"85",code:"85250",name:"PAZ DE ARIPORO",postal:"852030"},{dept_code:"85",code:"85263",name:"PORE",postal:"852057"},{dept_code:"85",code:"85279",name:"RECETOR",postal:"856050"},{dept_code:"85",code:"85300",name:"SABANALARGA",postal:"855050"},{dept_code:"85",code:"85315",name:"SACAMA",postal:"851038"},{dept_code:"85",code:"85325",name:"SAN LUIS DE PALENQUE",postal:"853030"},{dept_code:"85",code:"85400",name:"TAMARA",postal:"851050"},{dept_code:"85",code:"85410",name:"TAURAMENA",postal:"854030"},{dept_code:"85",code:"85430",name:"TRINIDAD",postal:"853019"},{dept_code:"85",code:"85440",name:"VILLANUEVA",postal:"855039"},{dept_code:"19",code:"19001",name:"POPAYAN",postal:"190001"},{dept_code:"19",code:"19022",name:"ALMAGUER",postal:"194080"},{dept_code:"19",code:"19050",name:"ARGELIA",postal:"195560"},{dept_code:"19",code:"19075",name:"BALBOA",postal:"195530"},{dept_code:"19",code:"19100",name:"BOLIVAR",postal:"195001"},{dept_code:"19",code:"19110",name:"BUENOS AIRES",postal:"191001"},{dept_code:"19",code:"19130",name:"CAJIBIO",postal:"190501"},{dept_code:"19",code:"19137",name:"CALDONO",postal:"192040"},{dept_code:"19",code:"19142",name:"CALOTO",postal:"191070"},{dept_code:"19",code:"19212",name:"CORINTO",postal:"191560"},{dept_code:"19",code:"19256",name:"EL TAMBO",postal:"193570"},{dept_code:"19",code:"19290",name:"FLORENCIA",postal:"195040"},{dept_code:"19",code:"19300",name:"GUACHENE",postal:"191087"},{dept_code:"19",code:"19318",name:"GUAPI",postal:"196001"},{dept_code:"19",code:"19355",name:"INZA",postal:"192548"},{dept_code:"19",code:"19364",name:"JAMBALO",postal:"192029"},{dept_code:"19",code:"19392",name:"LA SIERRA",postal:"194001"},{dept_code:"19",code:"19397",name:"LA VEGA",postal:"194020"},{dept_code:"19",code:"19418",name:"LOPEZ",postal:"196060"},{dept_code:"19",code:"19450",name:"MERCADERES",postal:"195060"},{dept_code:"19",code:"19455",name:"MIRANDA",postal:"191520"},{dept_code:"19",code:"19473",name:"MORALES",postal:"190567"},{dept_code:"19",code:"19513",name:"PADILLA",postal:"191540"},{dept_code:"19",code:"19517",name:"PAEZ",postal:"192501"},{dept_code:"19",code:"19532",name:"PATIA",postal:"195501"},{dept_code:"19",code:"19533",name:"PIAMONTE",postal:"194550"},{dept_code:"19",code:"19548",name:"PIENDAMO",postal:"190530"},{dept_code:"19",code:"19573",name:"PUERTO TEJADA",postal:"191501"},{dept_code:"19",code:"19585",name:"PURACE",postal:"193001"},{dept_code:"19",code:"19622",name:"ROSAS",postal:"193550"},{dept_code:"19",code:"19693",name:"SAN SEBASTIAN",postal:"194501"},{dept_code:"19",code:"19698",name:"SANTANDER DE QUILICHAO",postal:"191030"},{dept_code:"19",code:"19701",name:"SANTA ROSA",postal:"194520"},{dept_code:"19",code:"19743",name:"SILVIA",postal:"192070"},{dept_code:"19",code:"19760",name:"SOTARA",postal:"193501"},{dept_code:"19",code:"19780",name:"SUAREZ",postal:"190580"},{dept_code:"19",code:"19785",name:"SUCRE",postal:"194060"},{dept_code:"19",code:"19807",name:"TIMBIO",postal:"193520"},{dept_code:"19",code:"19809",name:"TIMBIQUI",postal:"196030"},{dept_code:"19",code:"19821",name:"TORIBIO",postal:"192001"},{dept_code:"19",code:"19824",name:"TOTORO",postal:"192570"},{dept_code:"19",code:"19845",name:"VILLA RICA",postal:"191060"},{dept_code:"20",code:"20001",name:"VALLEDUPAR",postal:"200018"},{dept_code:"20",code:"20011",name:"AGUACHICA",postal:"205010"},{dept_code:"20",code:"20013",name:"AGUSTIN CODAZZI",postal:"202050"},{dept_code:"20",code:"20032",name:"ASTREA",postal:"201040"},{dept_code:"20",code:"20045",name:"BECERRIL",postal:"203001"},{dept_code:"20",code:"20060",name:"BOSCONIA",postal:"201027"},{dept_code:"20",code:"20175",name:"CHIMICHAGUA",postal:"201050"},{dept_code:"20",code:"20178",name:"CHIRIGUANA",postal:"203040"},{dept_code:"20",code:"20228",name:"CURUMANI",postal:"203060"},{dept_code:"20",code:"20238",name:"EL COPEY",postal:"201010"},{dept_code:"20",code:"20250",name:"EL PASO",postal:"201030"},{dept_code:"20",code:"20295",name:"GAMARRA",postal:"205001"},{dept_code:"20",code:"20310",name:"GONZALEZ",postal:"205030"},{dept_code:"20",code:"20383",name:"LA GLORIA",postal:"204060"},{dept_code:"20",code:"20400",name:"LA JAGUA DE IBIRICO",postal:"203020"},{dept_code:"20",code:"20443",name:"MANAURE",postal:"202001"},{dept_code:"20",code:"20517",name:"PAILITAS",postal:"204001"},{dept_code:"20",code:"20550",name:"PELAYA",postal:"204047"},{dept_code:"20",code:"20570",name:"PUEBLO BELLO",postal:"201001"},{dept_code:"20",code:"20614",name:"RIO DE ORO",postal:"205040"},{dept_code:"20",code:"20621",name:"LA PAZ",postal:"202010"},{dept_code:"20",code:"20710",name:"SAN ALBERTO",postal:"205070"},{dept_code:"20",code:"20750",name:"SAN DIEGO",postal:"202030"},{dept_code:"20",code:"20770",name:"SAN MARTIN",postal:"205050"},{dept_code:"20",code:"20787",name:"TAMALAMEQUE",postal:"204020"},{dept_code:"27",code:"27001",name:"QUIBDO",postal:"270002"},{dept_code:"27",code:"27006",name:"ACANDI",postal:"278010"},{dept_code:"27",code:"27025",name:"ALTO BAUDO",postal:"276070"},{dept_code:"27",code:"27050",name:"ATRATO",postal:"272010"},{dept_code:"27",code:"27073",name:"BAGADO",postal:"271050"},{dept_code:"27",code:"27075",name:"BAHIA SOLANO",postal:"276030"},{dept_code:"27",code:"27077",name:"BAJO BAUDO",postal:"275030"},{dept_code:"27",code:"27099",name:"BOJAYA",postal:"277050"},{dept_code:"27",code:"27135",name:"EL CANTON DEL SAN PABLO",postal:"272040"},{dept_code:"27",code:"27150",name:"CARMEN DEL DARIEN",postal:"277030"},{dept_code:"27",code:"27160",name:"CERTEGUI",postal:"272020"},{dept_code:"27",code:"27205",name:"CONDOTO",postal:"273030"},{dept_code:"27",code:"27245",name:"EL CARMEN DE ATRATO",postal:"271010"},{dept_code:"27",code:"27250",name:"EL LITORAL DEL SAN JUAN",postal:"275050"},{dept_code:"27",code:"27361",name:"ISTMINA",postal:"274010"},{dept_code:"27",code:"27372",name:"JURADO",postal:"276010"},{dept_code:"27",code:"27413",name:"LLORO",postal:"271030"},{dept_code:"27",code:"27425",name:"MEDIO ATRATO",postal:"270070"},{dept_code:"27",code:"27430",name:"MEDIO BAUDO",postal:"275010"},{dept_code:"27",code:"27450",name:"MEDIO SAN JUAN",postal:"274030"},{dept_code:"27",code:"27491",name:"NOVITA",postal:"273050"},{dept_code:"27",code:"27495",name:"NUQUI",postal:"276050"},{dept_code:"27",code:"27580",name:"RIO IRO",postal:"273010"},{dept_code:"27",code:"27600",name:"RIO QUITO",postal:"272050"},{dept_code:"27",code:"27615",name:"RIOSUCIO",postal:"278050"},{dept_code:"27",code:"27660",name:"SAN JOSE DEL PALMAR",postal:"273070"},{dept_code:"27",code:"27745",name:"SIPI",postal:"274050"},{dept_code:"27",code:"27787",name:"TADO",postal:"271070"},{dept_code:"27",code:"27800",name:"UNGUIA",postal:"278030"},{dept_code:"27",code:"27810",name:"UNION PANAMERICANA",postal:"272030"},{dept_code:"23",code:"23001",name:"MONTERIA",postal:"230017"},{dept_code:"23",code:"23068",name:"AYAPEL",postal:"233530"},{dept_code:"23",code:"23079",name:"BUENAVISTA",postal:"233028"},{dept_code:"23",code:"23090",name:"CANALETE",postal:"235040"},{dept_code:"23",code:"23162",name:"CERETE",postal:"230550"},{dept_code:"23",code:"23168",name:"CHIMA",postal:"232010"},{dept_code:"23",code:"23182",name:"CHINU",postal:"232050"},{dept_code:"23",code:"23189",name:"CIENAGA DE ORO",postal:"232520"},{dept_code:"23",code:"23300",name:"COTORRA",postal:"230501"},{dept_code:"23",code:"23350",name:"LA APARTADA",postal:"233507"},{dept_code:"23",code:"23417",name:"LORICA",postal:"231029"},{dept_code:"23",code:"23419",name:"LOS CORDOBAS",postal:"235020"},{dept_code:"23",code:"23464",name:"MOMIL",postal:"232008"},{dept_code:"23",code:"23466",name:"MONTELIBANO",postal:"234007"},{dept_code:"23",code:"23500",name:"MONITOS",postal:"231007"},{dept_code:"23",code:"23555",name:"PLANETA RICA",postal:"233040"},{dept_code:"23",code:"23570",name:"PUEBLO NUEVO",postal:"233001"},{dept_code:"23",code:"23574",name:"PUERTO ESCONDIDO",postal:"235001"},{dept_code:"23",code:"23580",name:"PUERTO LIBERTADOR",postal:"234038"},{dept_code:"23",code:"23586",name:"PURISIMA",postal:"231540"},{dept_code:"23",code:"23660",name:"SAHAGUN",postal:"232549"},{dept_code:"23",code:"23670",name:"SAN ANDRES SOTAVENTO",postal:"232030"},{dept_code:"23",code:"23672",name:"SAN ANTERO",postal:"231520"},{dept_code:"23",code:"23675",name:"SAN BERNARDO DEL VIENTO",postal:"231501"},{dept_code:"23",code:"23678",name:"SAN CARLOS",postal:"232501"},{dept_code:"23",code:"23682",name:"SAN JOSE DE URE",postal:"234010"},{dept_code:"23",code:"23686",name:"SAN PELAYO",postal:"230538"},{dept_code:"23",code:"23807",name:"TIERRALTA",postal:"234517"},{dept_code:"23",code:"23815",name:"TUCHIN",postal:"232027"},{dept_code:"23",code:"23855",name:"VALENCIA",postal:"234539"},{dept_code:"25",code:"25001",name:"AGUA DE DIOS",postal:"252850"},{dept_code:"25",code:"25019",name:"ALBAN",postal:"253207"},{dept_code:"25",code:"25035",name:"ANAPOIMA",postal:"252647"},{dept_code:"25",code:"25040",name:"ANOLAIMA",postal:"253048"},{dept_code:"25",code:"25053",name:"ARBELAEZ",postal:"252001"},{dept_code:"25",code:"25086",name:"BELTRAN",postal:"253260"},{dept_code:"25",code:"25095",name:"BITUIMA",postal:"253220"},{dept_code:"25",code:"25099",name:"BOJACA",postal:"253001"},{dept_code:"25",code:"25120",name:"CABRERA",postal:"252040"},{dept_code:"25",code:"25123",name:"CACHIPAY",postal:"253020"},{dept_code:"25",code:"25126",name:"CAJICA",postal:"250240"},{dept_code:"25",code:"25148",name:"CAPARRAPI",postal:"253460"},{dept_code:"25",code:"25151",name:"CAQUEZA",postal:"251827"},{dept_code:"25",code:"25154",name:"CARMEN DE CARUPA",postal:"250420"},{dept_code:"25",code:"25168",name:"CHAGUANI",postal:"253240"},{dept_code:"25",code:"25175",name:"CHIA",postal:"250001"},{dept_code:"25",code:"25178",name:"CHIPAQUE",postal:"251801"},{dept_code:"25",code:"25181",name:"CHOACHI",postal:"251620"},{dept_code:"25",code:"25183",name:"CHOCONTA",postal:"250801"},{dept_code:"25",code:"25200",name:"COGUA",postal:"250408"},{dept_code:"25",code:"25214",name:"COTA",postal:"250010"},{dept_code:"25",code:"25224",name:"CUCUNUBA",postal:"250450"},{dept_code:"25",code:"25245",name:"EL COLEGIO",postal:"252630"},{dept_code:"25",code:"25258",name:"EL PENON",postal:"254027"},{dept_code:"25",code:"25260",name:"EL ROSAL",postal:"250210"},{dept_code:"25",code:"25269",name:"FACATATIVA",postal:"253058"},{dept_code:"25",code:"25279",name:"FOMEQUE",postal:"251640"},{dept_code:"25",code:"25281",name:"FOSCA",postal:"251830"},{dept_code:"25",code:"25286",name:"FUNZA",postal:"250020"},{dept_code:"25",code:"25288",name:"FUQUENE",postal:"250620"},{dept_code:"25",code:"25290",name:"FUSAGASUGA",postal:"252219"},{dept_code:"25",code:"25293",name:"GACHALA",postal:"251250"},{dept_code:"25",code:"25295",name:"GACHANCIPA",postal:"251020"},{dept_code:"25",code:"25297",name:"GACHETA",postal:"251230"},{dept_code:"25",code:"25299",name:"GAMA",postal:"251240"},{dept_code:"25",code:"25307",name:"GIRARDOT",postal:"252431"},{dept_code:"25",code:"25312",name:"GRANADA",postal:"252257"},{dept_code:"25",code:"25317",name:"GUACHETA",postal:"250610"},{dept_code:"25",code:"25320",name:"GUADUAS",postal:"253448"},{dept_code:"25",code:"25322",name:"GUASCA",postal:"251210"},{dept_code:"25",code:"25324",name:"GUATAQUI",postal:"252820"},{dept_code:"25",code:"25326",name:"GUATAVITA",postal:"251060"},{dept_code:"25",code:"25328",name:"GUAYABAL DE SIQUIMA",postal:"253210"},{dept_code:"25",code:"25335",name:"GUAYABETAL",postal:"251850"},{dept_code:"25",code:"25339",name:"GUTIERREZ",postal:"251860"},{dept_code:"25",code:"25368",name:"JERUSALEN",postal:"252810"},{dept_code:"25",code:"25372",name:"JUNIN",postal:"251220"},{dept_code:"25",code:"25377",name:"LA CALERA",postal:"251201"},{dept_code:"25",code:"25386",name:"LA MESA",postal:"252601"},{dept_code:"25",code:"25394",name:"LA PALMA",postal:"253808"},{dept_code:"25",code:"25398",name:"LA PENA",postal:"253640"},{dept_code:"25",code:"25402",name:"LA VEGA",postal:"253610"},{dept_code:"25",code:"25407",name:"LENGUAZAQUE",postal:"250601"},{dept_code:"25",code:"25426",name:"MACHETA",postal:"250840"},{dept_code:"25",code:"25430",name:"MADRID",postal:"250038"},{dept_code:"25",code:"25436",name:"MANTA",postal:"250830"},{dept_code:"25",code:"25438",name:"MEDINA",postal:"251420"},{dept_code:"25",code:"25473",name:"MOSQUERA",postal:"250040"},{dept_code:"25",code:"25483",name:"NARINO",postal:"252837"},{dept_code:"25",code:"25486",name:"NEMOCON",postal:"251030"},{dept_code:"25",code:"25488",name:"NILO",postal:"252401"},{dept_code:"25",code:"25489",name:"NIMAIMA",postal:"253630"},{dept_code:"25",code:"25491",name:"NOCAIMA",postal:"253620"},{dept_code:"25",code:"25506",name:"VENECIA",postal:"252037"},{dept_code:"25",code:"25513",name:"PACHO",postal:"254001"},{dept_code:"25",code:"25518",name:"PAIME",postal:"254040"},{dept_code:"25",code:"25524",name:"PANDI",postal:"252010"},{dept_code:"25",code:"25530",name:"PARATEBUENO",postal:"251401"},{dept_code:"25",code:"25535",name:"PASCA",postal:"252201"},{dept_code:"25",code:"25572",name:"PUERTO SALGAR",postal:"253480"},{dept_code:"25",code:"25580",name:"PULI",postal:"252801"},{dept_code:"25",code:"25592",name:"QUEBRADANEGRA",postal:"253427"},{dept_code:"25",code:"25594",name:"QUETAME",postal:"251840"},{dept_code:"25",code:"25596",name:"QUIPILE",postal:"253030"},{dept_code:"25",code:"25599",name:"APULO",postal:"252650"},{dept_code:"25",code:"25612",name:"RICAURTE",postal:"252417"},{dept_code:"25",code:"25645",name:"SAN ANTONIO DEL TEQUENDAMA",postal:"252620"},{dept_code:"25",code:"25649",name:"SAN BERNARDO",postal:"252020"},{dept_code:"25",code:"25653",name:"SAN CAYETANO",postal:"254050"},{dept_code:"25",code:"25658",name:"SAN FRANCISCO",postal:"253601"},{dept_code:"25",code:"25662",name:"SAN JUAN DE RIO SECO",postal:"253250"},{dept_code:"25",code:"25718",name:"SASAIMA",postal:"253401"},{dept_code:"25",code:"25736",name:"SESQUILE",postal:"251050"},{dept_code:"25",code:"25740",name:"SIBATE",postal:"250077"},{dept_code:"25",code:"25743",name:"SILVANIA",postal:"252240"},{dept_code:"25",code:"25745",name:"SIMIJACA",postal:"250647"},{dept_code:"25",code:"25754",name:"SOACHA",postal:"250051"},{dept_code:"25",code:"25758",name:"SOPO",postal:"251001"},{dept_code:"25",code:"25769",name:"SUBACHOQUE",postal:"250228"},{dept_code:"25",code:"25772",name:"SUESCA",postal:"251040"},{dept_code:"25",code:"25777",name:"SUPATA",postal:"253660"},{dept_code:"25",code:"25779",name:"SUSA",postal:"250630"},{dept_code:"25",code:"25781",name:"SUTATAUSA",postal:"250440"},{dept_code:"25",code:"25785",name:"TABIO",postal:"250237"},{dept_code:"25",code:"25793",name:"TAUSA",postal:"250410"},{dept_code:"25",code:"25797",name:"TENA",postal:"252610"},{dept_code:"25",code:"25799",name:"TENJO",postal:"250201"},{dept_code:"25",code:"25805",name:"TIBACUY",postal:"252230"},{dept_code:"25",code:"25807",name:"TIBIRITA",postal:"250820"},{dept_code:"25",code:"25815",name:"TOCAIMA",postal:"252840"},{dept_code:"25",code:"25817",name:"TOCANCIPA",postal:"251010"},{dept_code:"25",code:"25823",name:"TOPAIPI",postal:"253820"},{dept_code:"25",code:"25839",name:"UBALA",postal:"251260"},{dept_code:"25",code:"25841",name:"UBAQUE",postal:"251601"},{dept_code:"25",code:"25843",name:"VILLA DE SAN DIEGO DE UBATE",postal:"250430"},{dept_code:"25",code:"25845",name:"UNE",postal:"251810"},{dept_code:"25",code:"25851",name:"UTICA",postal:"253430"},{dept_code:"25",code:"25862",name:"VERGARA",postal:"253650"},{dept_code:"25",code:"25867",name:"VIANI",postal:"253230"},{dept_code:"25",code:"25871",name:"VILLAGOMEZ",postal:"254030"},{dept_code:"25",code:"25873",name:"VILLAPINZON",postal:"250810"},{dept_code:"25",code:"25875",name:"VILLETA",postal:"253418"},{dept_code:"25",code:"25878",name:"VIOTA",postal:"252660"},{dept_code:"25",code:"25885",name:"YACOPI",postal:"253840"},{dept_code:"25",code:"25898",name:"ZIPACON",postal:"253010"},{dept_code:"25",code:"25899",name:"ZIPAQUIRA",postal:"250251"},{dept_code:"94",code:"94001",name:"INIRIDA",postal:"940017"},{dept_code:"94",code:"94343",name:"BARRANCO MINAS",postal:"944010"},{dept_code:"94",code:"94663",name:"MAPIRIPANA",postal:"944058"},{dept_code:"94",code:"94883",name:"SAN FELIPE",postal:"942010"},{dept_code:"94",code:"94884",name:"PUERTO COLOMBIA",postal:"941039"},{dept_code:"94",code:"94885",name:"LA GUADALUPE",postal:"942057"},{dept_code:"94",code:"94886",name:"CACAHUAL",postal:"941010"},{dept_code:"94",code:"94887",name:"PANA PANA",postal:"943018"},{dept_code:"94",code:"94888",name:"MORICHAL",postal:"943059"},{dept_code:"95",code:"95001",name:"SAN JOSE DEL GUAVIARE",postal:"950001"},{dept_code:"95",code:"95015",name:"CALAMAR",postal:"953001"},{dept_code:"95",code:"95025",name:"EL RETORNO",postal:"951001"},{dept_code:"95",code:"95200",name:"MIRAFLORES",postal:"952001"},{dept_code:"41",code:"41001",name:"NEIVA",postal:"410010"},{dept_code:"41",code:"41006",name:"ACEVEDO",postal:"417079"},{dept_code:"41",code:"41013",name:"AGRADO",postal:"414040"},{dept_code:"41",code:"41016",name:"AIPE",postal:"411001"},{dept_code:"41",code:"41020",name:"ALGECIRAS",postal:"413040"},{dept_code:"41",code:"41026",name:"ALTAMIRA",postal:"416020"},{dept_code:"41",code:"41078",name:"BARAYA",postal:"411060"},{dept_code:"41",code:"41132",name:"CAMPOALEGRE",postal:"413020"},{dept_code:"41",code:"41206",name:"COLOMBIA",postal:"411080"},{dept_code:"41",code:"41244",name:"ELIAS",postal:"417001"},{dept_code:"41",code:"41298",name:"GARZON",postal:"414027"},{dept_code:"41",code:"41306",name:"GIGANTE",postal:"414001"},{dept_code:"41",code:"41319",name:"GUADALUPE",postal:"416040"},{dept_code:"41",code:"41349",name:"HOBO",postal:"413060"},{dept_code:"41",code:"41357",name:"IQUIRA",postal:"412060"},{dept_code:"41",code:"41359",name:"ISNOS",postal:"418048"},{dept_code:"41",code:"41378",name:"LA ARGENTINA",postal:"415080"},{dept_code:"41",code:"41396",name:"LA PLATA",postal:"415078"},{dept_code:"41",code:"41483",name:"NATAGA",postal:"415020"},{dept_code:"41",code:"41503",name:"OPORAPA",postal:"418001"},{dept_code:"41",code:"41518",name:"PAICOL",postal:"415040"},{dept_code:"41",code:"41524",name:"PALERMO",postal:"412001"},{dept_code:"41",code:"41530",name:"PALESTINA",postal:"417067"},{dept_code:"41",code:"41548",name:"PITAL",postal:"414060"},{dept_code:"41",code:"41551",name:"PITALITO",postal:"417038"},{dept_code:"41",code:"41615",name:"RIVERA",postal:"413001"},{dept_code:"41",code:"41660",name:"SALADOBLANCO",postal:"418020"},{dept_code:"41",code:"41668",name:"SAN AGUSTIN",postal:"418060"},{dept_code:"41",code:"41676",name:"SANTA MARIA",postal:"412020"},{dept_code:"41",code:"41770",name:"SUAZA",postal:"416080"},{dept_code:"41",code:"41791",name:"TARQUI",postal:"416001"},{dept_code:"41",code:"41797",name:"TESALIA",postal:"415001"},{dept_code:"41",code:"41799",name:"TELLO",postal:"411040"},{dept_code:"41",code:"41801",name:"TERUEL",postal:"412040"},{dept_code:"41",code:"41807",name:"TIMANA",postal:"417010"},{dept_code:"41",code:"41872",name:"VILLAVIEJA",postal:"411020"},{dept_code:"41",code:"41885",name:"YAGUARA",postal:"412087"},{dept_code:"44",code:"44001",name:"RIOHACHA",postal:"440001"},{dept_code:"44",code:"44035",name:"ALBANIA",postal:"443001"},{dept_code:"44",code:"44078",name:"BARRANCAS",postal:"443040"},{dept_code:"44",code:"44090",name:"DIBULLA",postal:"446001"},{dept_code:"44",code:"44098",name:"DISTRACCION",postal:"444001"},{dept_code:"44",code:"44110",name:"EL MOLINO",postal:"444050"},{dept_code:"44",code:"44279",name:"FONSECA",postal:"444010"},{dept_code:"44",code:"44378",name:"HATONUEVO",postal:"443020"},{dept_code:"44",code:"44420",name:"LA JAGUA DEL PILAR",postal:"445040"},{dept_code:"44",code:"44430",name:"MAICAO",postal:"442001"},{dept_code:"44",code:"44560",name:"MANAURE",postal:"441001"},{dept_code:"44",code:"44650",name:"SAN JUAN DEL CESAR",postal:"444037"},{dept_code:"44",code:"44847",name:"URIBIA",postal:"441020"},{dept_code:"44",code:"44855",name:"URUMITA",postal:"445020"},{dept_code:"44",code:"44874",name:"VILLANUEVA",postal:"445008"},{dept_code:"47",code:"47001",name:"SANTA MARTA",postal:"470009"},{dept_code:"47",code:"47030",name:"ALGARROBO",postal:"472040"},{dept_code:"47",code:"47053",name:"ARACATACA",postal:"472007"},{dept_code:"47",code:"47058",name:"ARIGUANI",postal:"475010"},{dept_code:"47",code:"47161",name:"CERRO SAN ANTONIO",postal:"476020"},{dept_code:"47",code:"47170",name:"CHIVOLO",postal:"476060"},{dept_code:"47",code:"47189",name:"CIENAGA",postal:"478002"},{dept_code:"47",code:"47205",name:"CONCORDIA",postal:"476030"},{dept_code:"47",code:"47245",name:"EL BANCO",postal:"473040"},{dept_code:"47",code:"47258",name:"EL PINON",postal:"476007"},{dept_code:"47",code:"47268",name:"EL RETEN",postal:"478060"},{dept_code:"47",code:"47288",name:"FUNDACION",postal:"472020"},{dept_code:"47",code:"47318",name:"GUAMAL",postal:"473020"},{dept_code:"47",code:"47460",name:"NUEVA GRANADA",postal:"475020"},{dept_code:"47",code:"47541",name:"PEDRAZA",postal:"476040"},{dept_code:"47",code:"47545",name:"PIJINO DEL CARMEN",postal:"474047"},{dept_code:"47",code:"47551",name:"PIVIJAY",postal:"477050"},{dept_code:"47",code:"47555",name:"PLATO",postal:"475030"},{dept_code:"47",code:"47570",name:"PUEBLOVIEJO",postal:"478048"},{dept_code:"47",code:"47605",name:"REMOLINO",postal:"477020"},{dept_code:"47",code:"47660",name:"SABANAS DE SAN ANGEL",postal:"475001"},{dept_code:"47",code:"47675",name:"SALAMINA",postal:"477040"},{dept_code:"47",code:"47692",name:"SAN SEBASTIAN DE BUENAVISTA",postal:"473007"},{dept_code:"47",code:"47703",name:"SAN ZENON",postal:"474060"},{dept_code:"47",code:"47707",name:"SANTA ANA",postal:"474020"},{dept_code:"47",code:"47720",name:"SANTA BARBARA DE PINTO",postal:"474001"},{dept_code:"47",code:"47745",name:"SITIONUEVO",postal:"477001"},{dept_code:"47",code:"47798",name:"TENERIFE",postal:"475057"},{dept_code:"47",code:"47960",name:"ZAPAYAN",postal:"476050"},{dept_code:"47",code:"47980",name:"ZONA BANANERA",postal:"478020"},{dept_code:"50",code:"50001",name:"VILLAVICENCIO",postal:"500004"},{dept_code:"50",code:"50006",name:"ACACIAS",postal:"507008"},{dept_code:"50",code:"50110",name:"BARRANCA DE UPIA",postal:"501007"},{dept_code:"50",code:"50124",name:"CABUYARO",postal:"501011"},{dept_code:"50",code:"50150",name:"CASTILLA LA NUEVA",postal:"507041"},{dept_code:"50",code:"50223",name:"CUBARRAL",postal:"506001"},{dept_code:"50",code:"50226",name:"CUMARAL",postal:"501021"},{dept_code:"50",code:"50245",name:"EL CALVARIO",postal:"501041"},{dept_code:"50",code:"50251",name:"EL CASTILLO",postal:"506047"},{dept_code:"50",code:"50270",name:"EL DORADO",postal:"506021"},{dept_code:"50",code:"50287",name:"FUENTE DE ORO",postal:"504021"},{dept_code:"50",code:"50313",name:"GRANADA",postal:"504001"},{dept_code:"50",code:"50318",name:"GUAMAL",postal:"507051"},{dept_code:"50",code:"50325",name:"MAPIRIPAN",postal:"503021"},{dept_code:"50",code:"50330",name:"MESETAS",postal:"505001"},{dept_code:"50",code:"50350",name:"LA MACARENA",postal:"505021"},{dept_code:"50",code:"50370",name:"URIBE",postal:"505041"},{dept_code:"50",code:"50400",name:"LEJANIAS",postal:"506067"},{dept_code:"50",code:"50450",name:"PUERTO CONCORDIA",postal:"503041"},{dept_code:"50",code:"50568",name:"PUERTO GAITAN",postal:"502058"},{dept_code:"50",code:"50573",name:"PUERTO LOPEZ",postal:"502001"},{dept_code:"50",code:"50577",name:"PUERTO LLERAS",postal:"503001"},{dept_code:"50",code:"50590",name:"PUERTO RICO",postal:"503061"},{dept_code:"50",code:"50606",name:"RESTREPO",postal:"501031"},{dept_code:"50",code:"50680",name:"SAN CARLOS DE GUAROA",postal:"507011"},{dept_code:"50",code:"50683",name:"SAN JUAN DE ARAMA",postal:"504047"},{dept_code:"50",code:"50686",name:"SAN JUANITO",postal:"501051"},{dept_code:"50",code:"50689",name:"SAN MARTIN",postal:"507037"},{dept_code:"50",code:"50711",name:"VISTAHERMOSA",postal:"504061"},{dept_code:"52",code:"52001",name:"PASTO",postal:"520038"},{dept_code:"52",code:"52019",name:"ALBAN",postal:"521050"},{dept_code:"52",code:"52022",name:"ALDANA",postal:"524540"},{dept_code:"52",code:"52036",name:"ANCUYA",postal:"526007"},{dept_code:"52",code:"52051",name:"ARBOLEDA",postal:"520578"},{dept_code:"52",code:"52079",name:"BARBACOAS",postal:"528069"},{dept_code:"52",code:"52083",name:"BELEN",postal:"521087"},{dept_code:"52",code:"52110",name:"BUESACO",postal:"520501"},{dept_code:"52",code:"52203",name:"COLON",postal:"521067"},{dept_code:"52",code:"52207",name:"CONSACA",postal:"522548"},{dept_code:"52",code:"52210",name:"CONTADERO",postal:"523087"},{dept_code:"52",code:"52215",name:"CORDOBA",postal:"524009"},{dept_code:"52",code:"52224",name:"CUASPUD",postal:"524560"},{dept_code:"52",code:"52227",name:"CUMBAL",postal:"525007"},{dept_code:"52",code:"52233",name:"CUMBITARA",postal:"526567"},{dept_code:"52",code:"52240",name:"CHACHAGÜI",postal:"522001"},{dept_code:"52",code:"52250",name:"EL CHARCO",postal:"527537"},{dept_code:"52",code:"52254",name:"EL PENOL",postal:"522088"},{dept_code:"52",code:"52256",name:"EL ROSARIO",postal:"527037"},{dept_code:"52",code:"52258",name:"EL TABLON DE GOMEZ",postal:"520539"},{dept_code:"52",code:"52260",name:"EL TAMBO",postal:"522060"},{dept_code:"52",code:"52287",name:"FUNES",postal:"523520"},{dept_code:"52",code:"52317",name:"GUACHUCAL",postal:"524588"},{dept_code:"52",code:"52320",name:"GUAITARILLA",postal:"525508"},{dept_code:"52",code:"52323",name:"GUALMATAN",postal:"524501"},{dept_code:"52",code:"52352",name:"ILES",postal:"523060"},{dept_code:"52",code:"52354",name:"IMUES",postal:"523028"},{dept_code:"52",code:"52356",name:"IPIALES",postal:"524060"},{dept_code:"52",code:"52378",name:"LA CRUZ",postal:"521028"},{dept_code:"52",code:"52381",name:"LA FLORIDA",postal:"522048"},{dept_code:"52",code:"52385",name:"LA LLANADA",postal:"526507"},{dept_code:"52",code:"52390",name:"LA TOLA",postal:"527547"},{dept_code:"52",code:"52399",name:"LA UNION",postal:"521528"},{dept_code:"52",code:"52405",name:"LEIVA",postal:"527067"},{dept_code:"52",code:"52411",name:"LINARES",postal:"522508"},{dept_code:"52",code:"52418",name:"LOS ANDES",postal:"526527"},{dept_code:"52",code:"52427",name:"MAGÜI",postal:"528001"},{dept_code:"52",code:"52435",name:"MALLAMA",postal:"525068"},{dept_code:"52",code:"52473",name:"MOSQUERA",postal:"527580"},{dept_code:"52",code:"52480",name:"NARINO",postal:"522027"},{dept_code:"52",code:"52490",name:"OLAYA HERRERA",postal:"527569"},{dept_code:"52",code:"52506",name:"OSPINA",postal:"523047"},{dept_code:"52",code:"52520",name:"FRANCISCO PIZARRO",postal:"528560"},{dept_code:"52",code:"52540",name:"POLICARPA",postal:"527001"},{dept_code:"52",code:"52560",name:"POTOSI",postal:"524039"},{dept_code:"52",code:"52565",name:"PROVIDENCIA",postal:"526020"},{dept_code:"52",code:"52573",name:"PUERRES",postal:"523548"},{dept_code:"52",code:"52585",name:"PUPIALES",postal:"524527"},{dept_code:"52",code:"52612",name:"RICAURTE",postal:"525039"},{dept_code:"52",code:"52621",name:"ROBERTO PAYAN",postal:"528037"},{dept_code:"52",code:"52678",name:"SAMANIEGO",postal:"526049"},{dept_code:"52",code:"52683",name:"SANDONA",postal:"522527"},{dept_code:"52",code:"52685",name:"SAN BERNARDO",postal:"521007"},{dept_code:"52",code:"52687",name:"SAN LORENZO",postal:"521548"},{dept_code:"52",code:"52693",name:"SAN PABLO",postal:"521047"},{dept_code:"52",code:"52694",name:"SAN PEDRO DE CARTAGO",postal:"521508"},{dept_code:"52",code:"52696",name:"SANTA BARBARA",postal:"527507"},{dept_code:"52",code:"52699",name:"SANTACRUZ",postal:"525579"},{dept_code:"52",code:"52720",name:"SAPUYES",postal:"525558"},{dept_code:"52",code:"52786",name:"TAMINANGO",postal:"521567"},{dept_code:"52",code:"52788",name:"TANGUA",postal:"523507"},{dept_code:"52",code:"52835",name:"SAN ANDRES DE TUMACO",postal:"528528"},{dept_code:"52",code:"52838",name:"TUQUERRES",postal:"525537"},{dept_code:"52",code:"52885",name:"YACUANQUER",postal:"523008"},{dept_code:"54",code:"54001",name:"CUCUTA",postal:"540019"},{dept_code:"54",code:"54003",name:"ABREGO",postal:"546070"},{dept_code:"54",code:"54051",name:"ARBOLEDAS",postal:"544550"},{dept_code:"54",code:"54099",name:"BOCHALEMA",postal:"543010"},{dept_code:"54",code:"54109",name:"BUCARASICA",postal:"545557"},{dept_code:"54",code:"54125",name:"CACOTA",postal:"544010"},{dept_code:"54",code:"54128",name:"CACHIRA",postal:"546030"},{dept_code:"54",code:"54172",name:"CHINACOTA",postal:"541070"},{dept_code:"54",code:"54174",name:"CHITAGA",postal:"544030"},{dept_code:"54",code:"54206",name:"CONVENCION",postal:"547050"},{dept_code:"54",code:"54223",name:"CUCUTILLA",postal:"544520"},{dept_code:"54",code:"54239",name:"DURANIA",postal:"544517"},{dept_code:"54",code:"54245",name:"EL CARMEN",postal:"547070"},{dept_code:"54",code:"54250",name:"EL TARRA",postal:"548050"},{dept_code:"54",code:"54261",name:"EL ZULIA",postal:"545510"},{dept_code:"54",code:"54313",name:"GRAMALOTE",postal:"545050"},{dept_code:"54",code:"54344",name:"HACARI",postal:"546510"},{dept_code:"54",code:"54347",name:"HERRAN",postal:"542017"},{dept_code:"54",code:"54377",name:"LABATECA",postal:"542050"},{dept_code:"54",code:"54385",name:"LA ESPERANZA",postal:"546050"},{dept_code:"54",code:"54398",name:"LA PLAYA",postal:"546530"},{dept_code:"54",code:"54405",name:"LOS PATIOS",postal:"541010"},{dept_code:"54",code:"54418",name:"LOURDES",postal:"545070"},{dept_code:"54",code:"54480",name:"MUTISCUA",postal:"544070"},{dept_code:"54",code:"54498",name:"OCANA",postal:"546552"},{dept_code:"54",code:"54518",name:"PAMPLONA",postal:"543050"},{dept_code:"54",code:"54520",name:"PAMPLONITA",postal:"543030"},{dept_code:"54",code:"54553",name:"PUERTO SANTANDER",postal:"548030"},{dept_code:"54",code:"54599",name:"RAGONVALIA",postal:"541050"},{dept_code:"54",code:"54660",name:"SALAZAR",postal:"544570"},{dept_code:"54",code:"54670",name:"SAN CALIXTO",postal:"547010"},{dept_code:"54",code:"54673",name:"SAN CAYETANO",postal:"545010"},{dept_code:"54",code:"54680",name:"SANTIAGO",postal:"545030"},{dept_code:"54",code:"54720",name:"SARDINATA",postal:"545530"},{dept_code:"54",code:"54743",name:"SILOS",postal:"544050"},{dept_code:"54",code:"54800",name:"TEORAMA",postal:"547030"},{dept_code:"54",code:"54810",name:"TIBU",postal:"548010"},{dept_code:"54",code:"54820",name:"TOLEDO",postal:"542030"},{dept_code:"54",code:"54871",name:"VILLA CARO",postal:"546010"},{dept_code:"54",code:"54874",name:"VILLA DEL ROSARIO",postal:"541030"},{dept_code:"86",code:"86001",name:"MOCOA",postal:"860001"},{dept_code:"86",code:"86219",name:"COLON",postal:"861040"},{dept_code:"86",code:"86320",name:"ORITO",postal:"862001"},{dept_code:"86",code:"86568",name:"PUERTO ASIS",postal:"862060"},{dept_code:"86",code:"86569",name:"PUERTO CAICEDO",postal:"862080"},{dept_code:"86",code:"86571",name:"PUERTO GUZMAN",postal:"863001"},{dept_code:"86",code:"86573",name:"PUERTO LEGUIZAMO",postal:"864001"},{dept_code:"86",code:"86749",name:"SIBUNDOY",postal:"861020"},{dept_code:"86",code:"86755",name:"SAN FRANCISCO",postal:"861001"},{dept_code:"86",code:"86757",name:"SAN MIGUEL",postal:"862040"},{dept_code:"86",code:"86760",name:"SANTIAGO",postal:"861060"},{dept_code:"86",code:"86865",name:"VALLE DEL GUAMUEZ",postal:"862020"},{dept_code:"86",code:"86885",name:"VILLAGARZON",postal:"861080"},{dept_code:"63",code:"63001",name:"ARMENIA",postal:"630007"},{dept_code:"63",code:"63111",name:"BUENAVISTA",postal:"632040"},{dept_code:"63",code:"63130",name:"CALARCA",postal:"632001"},{dept_code:"63",code:"63190",name:"CIRCASIA",postal:"631001"},{dept_code:"63",code:"63212",name:"CORDOBA",postal:"632020"},{dept_code:"63",code:"63272",name:"FILANDIA",postal:"634001"},{dept_code:"63",code:"63302",name:"GENOVA",postal:"632080"},{dept_code:"63",code:"63401",name:"LA TEBAIDA",postal:"633020"},{dept_code:"63",code:"63470",name:"MONTENEGRO",postal:"633007"},{dept_code:"63",code:"63548",name:"PIJAO",postal:"632060"},{dept_code:"63",code:"63594",name:"QUIMBAYA",postal:"634027"},{dept_code:"63",code:"63690",name:"SALENTO",postal:"631020"},{dept_code:"66",code:"66001",name:"PEREIRA",postal:"660001"},{dept_code:"66",code:"66045",name:"APIA",postal:"663030"},{dept_code:"66",code:"66075",name:"BALBOA",postal:"662010"},{dept_code:"66",code:"66088",name:"BELEN DE UMBRIA",postal:"664047"},{dept_code:"66",code:"66170",name:"DOSQUEBRADAS",postal:"661002"},{dept_code:"66",code:"66318",name:"GUATICA",postal:"664010"},{dept_code:"66",code:"66383",name:"LA CELIA",postal:"662030"},{dept_code:"66",code:"66400",name:"LA VIRGINIA",postal:"662001"},{dept_code:"66",code:"66440",name:"MARSELLA",postal:"661040"},{dept_code:"66",code:"66456",name:"MISTRATO",postal:"664020"},{dept_code:"66",code:"66572",name:"PUEBLO RICO",postal:"663011"},{dept_code:"66",code:"66594",name:"QUINCHIA",postal:"664008"},{dept_code:"66",code:"66682",name:"SANTA ROSA DE CABAL",postal:"661027"},{dept_code:"66",code:"66687",name:"SANTUARIO",postal:"663001"},{dept_code:"88",code:"88001",name:"SAN ANDRES",postal:"880008"},{dept_code:"88",code:"88564",name:"PROVIDENCIA",postal:"880027"},{dept_code:"68",code:"68001",name:"BUCARAMANGA",postal:"680008"},{dept_code:"68",code:"68013",name:"AGUADA",postal:"685521"},{dept_code:"68",code:"68020",name:"ALBANIA",postal:"684531"},{dept_code:"68",code:"68051",name:"ARATOCA",postal:"682051"},{dept_code:"68",code:"68077",name:"BARBOSA",postal:"684517"},{dept_code:"68",code:"68079",name:"BARICHARA",postal:"684041"},{dept_code:"68",code:"68081",name:"BARRANCABERMEJA",postal:"687032"},{dept_code:"68",code:"68092",name:"BETULIA",postal:"686501"},{dept_code:"68",code:"68101",name:"BOLIVAR",postal:"685001"},{dept_code:"68",code:"68121",name:"CABRERA",postal:"683501"},{dept_code:"68",code:"68132",name:"CALIFORNIA",postal:"680511"},{dept_code:"68",code:"68147",name:"CAPITANEJO",postal:"681541"},{dept_code:"68",code:"68152",name:"CARCASI",postal:"681521"},{dept_code:"68",code:"68160",name:"CEPITA",postal:"682061"},{dept_code:"68",code:"68162",name:"CERRITO",postal:"681501"},{dept_code:"68",code:"68167",name:"CHARALA",postal:"682551"},{dept_code:"68",code:"68169",name:"CHARTA",postal:"680551"},{dept_code:"68",code:"68176",name:"CHIMA",postal:"683001"},{dept_code:"68",code:"68179",name:"CHIPATA",postal:"685557"},{dept_code:"68",code:"68190",name:"CIMITARRA",postal:"686041"},{dept_code:"68",code:"68207",name:"CONCEPCION",postal:"681511"},{dept_code:"68",code:"68209",name:"CONFINES",postal:"683531"},{dept_code:"68",code:"68211",name:"CONTRATACION",postal:"683071"},{dept_code:"68",code:"68217",name:"COROMORO",postal:"682531"},{dept_code:"68",code:"68229",name:"CURITI",postal:"682041"},{dept_code:"68",code:"68235",name:"EL CARMEN DE CHUCURI",postal:"686561"},{dept_code:"68",code:"68245",name:"EL GUACAMAYO",postal:"683061"},{dept_code:"68",code:"68250",name:"EL PENON",postal:"685027"},{dept_code:"68",code:"68255",name:"EL PLAYON",postal:"687501"},{dept_code:"68",code:"68264",name:"ENCINO",postal:"682541"},{dept_code:"68",code:"68266",name:"ENCISO",postal:"681561"},{dept_code:"68",code:"68271",name:"FLORIAN",postal:"684541"},{dept_code:"68",code:"68276",name:"FLORIDABLANCA",postal:"681007"},{dept_code:"68",code:"68296",name:"GALAN",postal:"684051"},{dept_code:"68",code:"68298",name:"GAMBITA",postal:"683031"},{dept_code:"68",code:"68307",name:"GIRON",postal:"687558"},{dept_code:"68",code:"68318",name:"GUACA",postal:"681031"},{dept_code:"68",code:"68320",name:"GUADALUPE",postal:"683051"},{dept_code:"68",code:"68322",name:"GUAPOTA",postal:"683017"},{dept_code:"68",code:"68324",name:"GUAVATA",postal:"684501"},{dept_code:"68",code:"68327",name:"GÜEPSA",postal:"685547"},{dept_code:"68",code:"68344",name:"HATO",postal:"683571"},{dept_code:"68",code:"68368",name:"JESUS MARIA",postal:"684551"},{dept_code:"68",code:"68370",name:"JORDAN",postal:"684011"},{dept_code:"68",code:"68377",name:"LA BELLEZA",postal:"685061"},{dept_code:"68",code:"68385",name:"LANDAZURI",postal:"686021"},{dept_code:"68",code:"68397",name:"LA PAZ",postal:"685511"},{dept_code:"68",code:"68406",name:"LEBRIJA",postal:"687571"},{dept_code:"68",code:"68418",name:"LOS SANTOS",postal:"684001"},{dept_code:"68",code:"68425",name:"MACARAVITA",postal:"681531"},{dept_code:"68",code:"68432",name:"MALAGA",postal:"682011"},{dept_code:"68",code:"68444",name:"MATANZA",postal:"680561"},{dept_code:"68",code:"68464",name:"MOGOTES",postal:"682501"},{dept_code:"68",code:"68468",name:"MOLAGAVITA",postal:"682031"},{dept_code:"68",code:"68498",name:"OCAMONTE",postal:"682567"},{dept_code:"68",code:"68500",name:"OIBA",postal:"683021"},{dept_code:"68",code:"68502",name:"ONZAGA",postal:"682521"},{dept_code:"68",code:"68522",name:"PALMAR",postal:"683581"},{dept_code:"68",code:"68524",name:"PALMAS DEL SOCORRO",postal:"683541"},{dept_code:"68",code:"68533",name:"PARAMO",postal:"683527"},{dept_code:"68",code:"68547",name:"PIEDECUESTA",postal:"681012"},{dept_code:"68",code:"68549",name:"PINCHOTE",postal:"683511"},{dept_code:"68",code:"68572",name:"PUENTE NACIONAL",postal:"684521"},{dept_code:"68",code:"68573",name:"PUERTO PARRA",postal:"686001"},{dept_code:"68",code:"68575",name:"PUERTO WILCHES",postal:"687061"},{dept_code:"68",code:"68615",name:"RIONEGRO",postal:"687511"},{dept_code:"68",code:"68655",name:"SABANA DE TORRES",postal:"687007"},{dept_code:"68",code:"68669",name:"SAN ANDRES",postal:"682001"},{dept_code:"68",code:"68673",name:"SAN BENITO",postal:"685531"},{dept_code:"68",code:"68679",name:"SAN GIL",postal:"684031"},{dept_code:"68",code:"68682",name:"SAN JOAQUIN",postal:"682511"},{dept_code:"68",code:"68684",name:"SAN JOSE DE MIRANDA",postal:"682021"},{dept_code:"68",code:"68686",name:"SAN MIGUEL",postal:"681551"},{dept_code:"68",code:"68689",name:"SAN VICENTE DE CHUCURI",postal:"686531"},{dept_code:"68",code:"68705",name:"SANTA BARBARA",postal:"681021"},{dept_code:"68",code:"68720",name:"SANTA HELENA DEL OPON",postal:"685501"},{dept_code:"68",code:"68745",name:"SIMACOTA",postal:"683561"},{dept_code:"68",code:"68755",name:"SOCORRO",postal:"683557"},{dept_code:"68",code:"68770",name:"SUAITA",postal:"683041"},{dept_code:"68",code:"68773",name:"SUCRE",postal:"685041"},{dept_code:"68",code:"68780",name:"SURATA",postal:"680501"},{dept_code:"68",code:"68820",name:"TONA",postal:"680541"},{dept_code:"68",code:"68855",name:"VALLE DE SAN JOSE",postal:"682571"},{dept_code:"68",code:"68861",name:"VELEZ",postal:"685561"},{dept_code:"68",code:"68867",name:"VETAS",postal:"680531"},{dept_code:"68",code:"68872",name:"VILLANUEVA",postal:"684021"},{dept_code:"68",code:"68895",name:"ZAPATOCA",postal:"684069"},{dept_code:"70",code:"70001",name:"SINCELEJO",postal:"700007"},{dept_code:"70",code:"70110",name:"BUENAVISTA",postal:"702030"},{dept_code:"70",code:"70124",name:"CAIMITO",postal:"704010"},{dept_code:"70",code:"70204",name:"COLOSO",postal:"707030"},{dept_code:"70",code:"70215",name:"COROZAL",postal:"705039"},{dept_code:"70",code:"70221",name:"COVENAS",postal:"706057"},{dept_code:"70",code:"70230",name:"CHALAN",postal:"701017"},{dept_code:"70",code:"70233",name:"EL ROBLE",postal:"705058"},{dept_code:"70",code:"70235",name:"GALERAS",postal:"702050"},{dept_code:"70",code:"70265",name:"GUARANDA",postal:"703070"},{dept_code:"70",code:"70400",name:"LA UNION",postal:"704057"},{dept_code:"70",code:"70418",name:"LOS PALMITOS",postal:"701050"},{dept_code:"70",code:"70429",name:"MAJAGUAL",postal:"703050"},{dept_code:"70",code:"70473",name:"MORROA",postal:"701078"},{dept_code:"70",code:"70508",name:"OVEJAS",postal:"701030"},{dept_code:"70",code:"70523",name:"PALMITO",postal:"706030"},{dept_code:"70",code:"70670",name:"SAMPUES",postal:"705079"},{dept_code:"70",code:"70678",name:"SAN BENITO ABAD",postal:"703010"},{dept_code:"70",code:"70702",name:"SAN JUAN DE BETULIA",postal:"705010"},{dept_code:"70",code:"70708",name:"SAN MARCOS",postal:"704037"},{dept_code:"70",code:"70713",name:"SAN ONOFRE",postal:"707018"},{dept_code:"70",code:"70717",name:"SAN PEDRO",postal:"702010"},{dept_code:"70",code:"70742",name:"SAN LUIS DE SINCE",postal:"702070"},{dept_code:"70",code:"70771",name:"SUCRE",postal:"703030"},{dept_code:"70",code:"70820",name:"SANTIAGO DE TOLU",postal:"706018"},{dept_code:"70",code:"70823",name:"TOLU VIEJO",postal:"707050"},{dept_code:"73",code:"73001",name:"IBAGUE",postal:"730010"},{dept_code:"73",code:"73024",name:"ALPUJARRA",postal:"734560"},{dept_code:"73",code:"73026",name:"ALVARADO",postal:"730527"},{dept_code:"73",code:"73030",name:"AMBALEMA",postal:"731001"},{dept_code:"73",code:"73043",name:"ANZOATEGUI",postal:"730540"},{dept_code:"73",code:"73055",name:"ARMERO",postal:"732060"},{dept_code:"73",code:"73067",name:"ATACO",postal:"735050"},{dept_code:"73",code:"73124",name:"CAJAMARCA",postal:"732507"},{dept_code:"73",code:"73148",name:"CARMEN DE APICALA",postal:"733590"},{dept_code:"73",code:"73152",name:"CASABIANCA",postal:"731520"},{dept_code:"73",code:"73168",name:"CHAPARRAL",postal:"735569"},{dept_code:"73",code:"73200",name:"COELLO",postal:"733501"},{dept_code:"73",code:"73217",name:"COYAIMA",postal:"735020"},{dept_code:"73",code:"73226",name:"CUNDAY",postal:"734040"},{dept_code:"73",code:"73236",name:"DOLORES",postal:"734540"},{dept_code:"73",code:"73268",name:"ESPINAL",postal:"733529"},{dept_code:"73",code:"73270",name:"FALAN",postal:"732001"},{dept_code:"73",code:"73275",name:"FLANDES",postal:"733510"},{dept_code:"73",code:"73283",name:"FRESNO",postal:"731560"},{dept_code:"73",code:"73319",name:"GUAMO",postal:"733549"},{dept_code:"73",code:"73347",name:"HERVEO",postal:"731540"},{dept_code:"73",code:"73349",name:"HONDA",postal:"732040"},{dept_code:"73",code:"73352",name:"ICONONZO",postal:"734028"},{dept_code:"73",code:"73408",name:"LERIDA",postal:"731020"},{dept_code:"73",code:"73411",name:"LIBANO",postal:"731048"},{dept_code:"73",code:"73443",name:"SAN SEBASTIAN DE MARIQUITA",postal:"732020"},{dept_code:"73",code:"73449",name:"MELGAR",postal:"734001"},{dept_code:"73",code:"73461",name:"MURILLO",postal:"731060"},{dept_code:"73",code:"73483",name:"NATAGAIMA",postal:"735001"},{dept_code:"73",code:"73504",name:"ORTEGA",postal:"735501"},{dept_code:"73",code:"73520",name:"PALOCABILDO",postal:"731580"},{dept_code:"73",code:"73547",name:"PIEDRAS",postal:"730501"},{dept_code:"73",code:"73555",name:"PLANADAS",postal:"735070"},{dept_code:"73",code:"73563",name:"PRADO",postal:"734520"},{dept_code:"73",code:"73585",name:"PURIFICACION",postal:"734501"},{dept_code:"73",code:"73616",name:"RIOBLANCO",postal:"735580"},{dept_code:"73",code:"73622",name:"RONCESVALLES",postal:"735550"},{dept_code:"73",code:"73624",name:"ROVIRA",postal:"733040"},{dept_code:"73",code:"73671",name:"SALDANA",postal:"733578"},{dept_code:"73",code:"73675",name:"SAN ANTONIO",postal:"735530"},{dept_code:"73",code:"73678",name:"SAN LUIS",postal:"733001"},{dept_code:"73",code:"73686",name:"SANTA ISABEL",postal:"730560"},{dept_code:"73",code:"73770",name:"SUAREZ",postal:"733580"},{dept_code:"73",code:"73854",name:"VALLE DE SAN JUAN",postal:"733020"},{dept_code:"73",code:"73861",name:"VENADILLO",postal:"730580"},{dept_code:"73",code:"73870",name:"VILLAHERMOSA",postal:"731501"},{dept_code:"73",code:"73873",name:"VILLARRICA",postal:"734060"},{dept_code:"76",code:"76001",name:"CALI",postal:"760044"},{dept_code:"76",code:"76020",name:"ALCALA",postal:"762040"},{dept_code:"76",code:"76036",name:"ANDALUCIA",postal:"763010"},{dept_code:"76",code:"76041",name:"ANSERMANUEVO",postal:"762018"},{dept_code:"76",code:"76054",name:"ARGELIA",postal:"761510"},{dept_code:"76",code:"76100",name:"BOLIVAR",postal:"761001"},{dept_code:"76",code:"76109",name:"BUENAVENTURA",postal:"764501"},{dept_code:"76",code:"76111",name:"GUADALAJARA DE BUGA",postal:"763047"},{dept_code:"76",code:"76113",name:"BUGALAGRANDE",postal:"763008"},{dept_code:"76",code:"76122",name:"CAICEDONIA",postal:"762547"},{dept_code:"76",code:"76126",name:"CALIMA",postal:"760537"},{dept_code:"76",code:"76130",name:"CANDELARIA",postal:"763570"},{dept_code:"76",code:"76147",name:"CARTAGO",postal:"762021"},{dept_code:"76",code:"76233",name:"DAGUA",postal:"760520"},{dept_code:"76",code:"76243",name:"EL AGUILA",postal:"762001"},{dept_code:"76",code:"76246",name:"EL CAIRO",postal:"761501"},{dept_code:"76",code:"76248",name:"EL CERRITO",postal:"763520"},{dept_code:"76",code:"76250",name:"EL DOVIO",postal:"761560"},{dept_code:"76",code:"76275",name:"FLORIDA",postal:"763568"},{dept_code:"76",code:"76306",name:"GINEBRA",postal:"763517"},{dept_code:"76",code:"76318",name:"GUACARI",postal:"763501"},{dept_code:"76",code:"76364",name:"JAMUNDI",postal:"764001"},{dept_code:"76",code:"76377",name:"LA CUMBRE",postal:"760510"},{dept_code:"76",code:"76400",name:"LA UNION",postal:"761548"},{dept_code:"76",code:"76403",name:"LA VICTORIA",postal:"762510"},{dept_code:"76",code:"76497",name:"OBANDO",postal:"762501"},{dept_code:"76",code:"76520",name:"PALMIRA",postal:"763537"},{dept_code:"76",code:"76563",name:"PRADERA",postal:"763558"},{dept_code:"76",code:"76606",name:"RESTREPO",postal:"760540"},{dept_code:"76",code:"76616",name:"RIOFRIO",postal:"761030"},{dept_code:"76",code:"76622",name:"ROLDANILLO",postal:"761558"},{dept_code:"76",code:"76670",name:"SAN PEDRO",postal:"763030"},{dept_code:"76",code:"76736",name:"SEVILLA",postal:"762538"},{dept_code:"76",code:"76823",name:"TORO",postal:"761520"},{dept_code:"76",code:"76828",name:"TRUJILLO",postal:"761020"},{dept_code:"76",code:"76834",name:"TULUA",postal:"763029"},{dept_code:"76",code:"76845",name:"ULLOA",postal:"762030"},{dept_code:"76",code:"76863",name:"VERSALLES",postal:"761537"},{dept_code:"76",code:"76869",name:"VIJES",postal:"760550"},{dept_code:"76",code:"76890",name:"YOTOCO",postal:"761040"},{dept_code:"76",code:"76892",name:"YUMBO",postal:"760507"},{dept_code:"76",code:"76895",name:"ZARZAL",postal:"762527"},{dept_code:"97",code:"97001",name:"MITU",postal:"970001"},{dept_code:"97",code:"97161",name:"CARURU",postal:"973001"},{dept_code:"97",code:"97511",name:"PACOA",postal:"972007"},{dept_code:"97",code:"97666",name:"TARAIRA",postal:"972040"},{dept_code:"97",code:"97777",name:"PAPUNAUA",postal:"973047"},{dept_code:"97",code:"97889",name:"YAVARATE",postal:"971007"},{dept_code:"99",code:"99001",name:"PUERTO CARRENO",postal:"990001"},{dept_code:"99",code:"99524",name:"LA PRIMAVERA",postal:"992001"},{dept_code:"99",code:"99624",name:"SANTA ROSALIA",postal:"992050"},{dept_code:"99",code:"99773",name:"CUMARIBO",postal:"991001"}];function pc(e){return Co.filter(t=>t.dept_code===e)}function uc(e){return Es.find(t=>t.code===e)}function mc(e){return ws.find(t=>t.code===e)}function fc(e){return Co.find(t=>t.code===e)}window.geoMunisByDept=pc;window.geoDept=uc;window.GEO_PAISES=ws;window.GEO_MUNIS=Co;window.GEO_DEPTS=Es;window.geoMuni=fc;window.geoPais=mc;const we=e=>document.querySelector(e),Cs=e=>[...document.querySelectorAll(e)],Ya=document.createElement("div");function Na(e){return Ya.textContent=String(e??""),Ya.innerHTML}const Ts=new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}),Is=new Intl.NumberFormat("es-CO");function bc(e){return Ts.format(e??0)}function gc(e){return Is.format(e??0)}function vc(e){return parseFloat(String(e??"").replace(/[^0-9.\-]/g,""))||0}function Ss(){return new Date().toISOString().slice(0,10)}function hc(){return new Date().toISOString().slice(0,19).replace("T"," ")}function yc(e){return e?new Date(e).toLocaleDateString("es-CO",{day:"2-digit",month:"2-digit",year:"numeric"}):"—"}const Ja={success:"fa-check-circle",error:"fa-times-circle",warning:"fa-exclamation-triangle",info:"fa-info-circle"};function _c(e,t="success",a=3500){const o=we("#toast-container");if(!o)return;const s=document.createElement("div");s.className=`toast toast-${t} toast-enter`,s.innerHTML=`<i class="fas ${Ja[t]??Ja.info}"></i><span>${Na(e)}</span>`,o.appendChild(s),setTimeout(()=>{s.style.cssText="opacity:0;transform:translateX(100%);transition:all .3s",setTimeout(()=>s.remove(),300)},a)}function Ns(e,t,a="",o=!1){we("#modal-title").innerHTML=e,we("#modal-body").innerHTML=t,we("#modal-footer").innerHTML=a,we("#modal-box").classList.toggle("wide",o),we("#modal-overlay").classList.add("show")}function Ls(){we("#modal-overlay").classList.remove("show"),we("#modal-body").innerHTML="",we("#modal-footer").innerHTML=""}let Qt=null;function xc(e,t){var i;const a=t==="edit"?typeof TX_EDIT_STATE<"u"?TX_EDIT_STATE:null:typeof TX_STATE<"u"?TX_STATE:null;if(!a)return;const o=((i=a.lines[e])==null?void 0:i.description)||"";Qt={lineIdx:e,ctx:t};const s=document.getElementById("line-comment-textarea");s&&(s.value=o);const n=document.getElementById("line-comment-overlay");n&&(n.style.display="flex",setTimeout(()=>s==null?void 0:s.focus(),50))}function ba(){Qt=null;const e=document.getElementById("line-comment-overlay");e&&(e.style.display="none")}function Ac(){var s;if(!Qt)return ba();const{lineIdx:e,ctx:t}=Qt,a=(((s=document.getElementById("line-comment-textarea"))==null?void 0:s.value)||"").trim(),o=t==="edit"?typeof TX_EDIT_STATE<"u"?TX_EDIT_STATE:null:typeof TX_STATE<"u"?TX_STATE:null;o&&o.lines[e]!==void 0?(o.lines[e].description=a,ba(),t==="edit"&&typeof renderEditTxLines=="function"?renderEditTxLines(!1):typeof renderTxLines=="function"&&renderTxLines(!1)):ba()}function $c(e,t,a,o=!0){Ns(e,`<p class="text-sm" style="color:#374151">${Na(t)}</p>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn ${o?"btn-danger":"btn-primary"}" id="modal-confirm-btn">Confirmar</button>`),setTimeout(()=>{const s=we("#modal-confirm-btn");s&&s.addEventListener("click",()=>{Ls(),a()})},50)}function wc(e,t,a=null,o=""){const s=t.toLowerCase();Cs(`#${e} tbody tr`).forEach(n=>{const i=!s||n.textContent.toLowerCase().includes(s),c=!o||(n.dataset[a]??"")===o;n.style.display=i&&c?"":"none"})}function Ec(e,t,a,o){const s=we(`#${e}`);if(!s||t<=1){s&&(s.innerHTML="");return}let n='<div class="pagination justify-end mt-4">';n+=`<button class="page-btn" onclick="(${o.toString()})(${a-1})" ${a<=1?"disabled":""}><i class="fas fa-chevron-left text-xs"></i></button>`;const i=[];for(let c=1;c<=t;c++)c===1||c===t||Math.abs(c-a)<=2?i.push(c):i[i.length-1]!=="…"&&i.push("…");i.forEach(c=>{c==="…"?n+='<span class="page-btn" style="cursor:default">…</span>':n+=`<button class="page-btn ${c===a?"active":""}" onclick="(${o.toString()})(${c})">${c}</button>`}),n+=`<button class="page-btn" onclick="(${o.toString()})(${a+1})" ${a>=t?"disabled":""}><i class="fas fa-chevron-right text-xs"></i></button>`,n+="</div>",s.innerHTML=n}function Cc(e,t=300){let a;return(...o)=>{clearTimeout(a),a=setTimeout(()=>e(...o),t)}}const Tc=[{code:"NIT",name:"NIT"},{code:"CC",name:"Cédula de Ciudadanía"},{code:"CE",name:"Cédula de Extranjería"},{code:"TI",name:"Tarjeta de Identidad"},{code:"PAS",name:"Pasaporte"},{code:"RC",name:"Registro Civil"}],Ic=[{code:"COMUN",name:"Régimen Común"},{code:"SIMPLIFICADO",name:"Régimen Simplificado"},{code:"NO_RESP",name:"No Responsable IVA"},{code:"GRAN_CONTR",name:"Gran Contribuyente"}],Sc=[{code:"NATURAL",name:"Persona Natural"},{code:"JURIDICA",name:"Persona Jurídica"},{code:"GRAN_CONTRIBUYENTE",name:"Gran Contribuyente"}],Nc=[{code:"CLIENTE",name:"Cliente"},{code:"PROVEEDOR",name:"Proveedor"},{code:"EMPLEADO",name:"Empleado"},{code:"PROPIETARIO",name:"Propietario"},{code:"ACREEDOR",name:"Acreedor"},{code:"TRANSPORTISTA",name:"Transportista"},{code:"OTRO",name:"Otro"}],Lc=typeof GEO_DEPTS<"u"?GEO_DEPTS:[],Ps=[3,7,13,17,19,23,29,37,41,43,47,53,59,67,71];function Pc(e){const t=String(e).replace(/\D/g,"");if(!t)return"";let a=0;for(let s=0;s<t.length;s++)a+=+t[t.length-1-s]*Ps[s];const o=a%11;return String(o<2?o:11-o)}const Fc=["Factura de Venta","Factura de Compra","Recibo de Caja","Comprobante de Egreso","Nota Crédito","Nota Débito","Orden de Compra","Contrato","Otro"],Dc=["Causar","Recaudar","Reportar Cartera"],To={admin:{label:"Administrador",badge:"badge-orange"},contador:{label:"Contador",badge:"badge-blue"},auxiliar:{label:"Auxiliar",badge:"badge-green"},auditor:{label:"Auditor",badge:"badge-gray"},viewer:{label:"Visualizador",badge:"badge-gray"}};function Fs(e){var t;return((t=To[e])==null?void 0:t.label)??e}function Rc(e){var t;return`<span class="badge ${((t=To[e])==null?void 0:t.badge)??"badge-gray"}">${Na(Fs(e))}</span>`}function Oc(e,t,a){const o=XLSX.utils.json_to_sheet(e.map(n=>Object.fromEntries(t.map((i,c)=>[i.label,n[i.key]])))),s=XLSX.utils.book_new();XLSX.utils.book_append_sheet(s,o,"Datos"),XLSX.writeFile(s,`${a}_${Ss()}.xlsx`)}function kc(e){var t;return(((t=we(`#${e}`))==null?void 0:t.value)??"").trim()}function Mc(e){var t;return!!((t=we(`#${e}`))!=null&&t.checked)}function Bc(e){var t;return((t=we(`#${e}`))==null?void 0:t.value)??""}function Uc(e,t){const a=we(`#${e}`);a&&(a.value=t??"")}window.getCheckVal=Mc;window._lineCommentState=Qt;window.fmt=bc;window.exportToExcel=Oc;window.getSelectVal=Bc;window._fmtCOP=Ts;window.esc=Na;window.$=we;window.fmtDate=yc;window.calcDV=Pc;window.nowStr=hc;window.closeModal=Ls;window.renderPagination=Ec;window.debounce=Cc;window.CROSS_PURPOSES=Dc;window.confirmDialog=$c;window.DOC_TYPES=Tc;window.$$=Cs;window.CROSS_DOC_TYPES=Fc;window.COL_DEPTS=Lc;window.getInputVal=kc;window.openModal=Ns;window.TOAST_ICONS=Ja;window.TAX_REGIMES=Ic;window.filterTable=wc;window.openLineComment=xc;window.PERSON_TYPES=Sc;window._NIT_FACTORS=Ps;window.roleLabel=Fs;window.saveLineComment=Ac;window.fmtN=gc;window.closeLineComment=ba;window.TP_TYPES=Nc;window.showToast=_c;window.setInputVal=Uc;window.ROLES=To;window.todayStr=Ss;window.roleBadge=Rc;window.parseNum=vc;window._escDiv=Ya;window._fmtNum=Is;const Me=window.location.origin,O={_token:null,_user:null,get authToken(){return this._token??localStorage.getItem("pb_token")},set authToken(e){this._token=e,e?localStorage.setItem("pb_token",e):localStorage.removeItem("pb_token")},get currentUser(){if(this._user)return this._user;try{return JSON.parse(localStorage.getItem("pb_user")??"null")}catch{return localStorage.removeItem("pb_user"),null}},set currentUser(e){this._user=e,e?localStorage.setItem("pb_user",JSON.stringify(e)):localStorage.removeItem("pb_user")},escapeFilterValue(e){return String(e??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," ").trim()},headers(){const e={"Content-Type":"application/json"};return this.authToken&&(e.Authorization=`Bearer ${this.authToken}`),e},async list(e,{filter:t="",sort:a="",page:o=1,perPage:s=200,expand:n=""}={}){const i=new URLSearchParams({page:o,perPage:s});t&&i.set("filter",t),a&&i.set("sort",a),n&&i.set("expand",n);const c=await fetch(`${Me}/api/collections/${e}/records?${i}`,{headers:this.headers()});if(!c.ok)throw await this._err(c);return c.json()},async listAll(e,t={}){let a=1;const o=[];for(;;){const s=await this.list(e,{...t,page:a,perPage:200});if(o.push(...s.items),a>=s.totalPages)break;a++}return o},async get(e,t,{expand:a=""}={}){const o=a?`?expand=${encodeURIComponent(a)}`:"",s=await fetch(`${Me}/api/collections/${e}/records/${t}${o}`,{headers:this.headers()});if(!s.ok)throw await this._err(s);return s.json()},async create(e,t){const a=await fetch(`${Me}/api/collections/${e}/records`,{method:"POST",headers:this.headers(),body:JSON.stringify(t)});if(!a.ok)throw await this._err(a);return a.json()},async update(e,t,a){const o=await fetch(`${Me}/api/collections/${e}/records/${t}`,{method:"PATCH",headers:this.headers(),body:JSON.stringify(a)});if(!o.ok)throw await this._err(o);return o.json()},async delete(e,t){const a=await fetch(`${Me}/api/collections/${e}/records/${t}`,{method:"DELETE",headers:this.headers()});if(!a.ok&&a.status!==204)throw await this._err(a);return!0},async authWithPassword(e,t){const a=await fetch(`${Me}/api/collections/users/auth-with-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identity:e,password:t})});if(!a.ok)throw await this._err(a);const o=await a.json();return this.authToken=o.token,this.currentUser=o.record,o},async authRefresh(){if(!this.authToken)return null;const e=await fetch(`${Me}/api/collections/users/auth-refresh`,{method:"POST",headers:this.headers()});if(!e.ok)return this.authToken=null,this.currentUser=null,null;const t=await e.json();return this.authToken=t.token,this.currentUser=t.record,t},logout(){this.authToken=null,this.currentUser=null},async ping(){try{return(await fetch(`${Me}/api/health`,{signal:AbortSignal.timeout(3e3)})).ok}catch{return!1}},async _err(e){var n,i;let t={};try{t=await e.json()}catch{t={message:e.statusText}}const a=t!=null&&t.data&&typeof t.data=="object"?Object.values(t.data).map(c=>c==null?void 0:c.message).filter(Boolean):[],o=(t==null?void 0:t.message)??((i=(n=t==null?void 0:t.data)==null?void 0:n.identity)==null?void 0:i.message)??a[0]??"Error desconocido",s=new Error(o);return s.status=e.status,s.data=t,s}},Vc={async getSetting(e){var t;try{const a=O.escapeFilterValue(e);return((t=(await O.list("settings",{filter:`key="${a}"`,perPage:1})).items[0])==null?void 0:t.value)??""}catch{return""}},async setSetting(e,t){try{const a=O.escapeFilterValue(e),o=await O.list("settings",{filter:`key="${a}"`,perPage:1});return o.items.length?await O.update("settings",o.items[0].id,{value:t}):await O.create("settings",{key:e,value:t})}catch(a){const o=String((a==null?void 0:a.message)||"").toLowerCase();throw(a==null?void 0:a.status)===400||(a==null?void 0:a.status)===403||o.includes("allowed")||o.includes("permission")?new Error("No tienes permisos para modificar configuración global."):a}},async logAudit(e,t,a=null,o=""){try{if(!O.authToken)return;await fetch(`${Me}/api/audit-event`,{method:"POST",headers:O.headers(),body:JSON.stringify({action:String(e||""),entity:String(t||""),entity_id:a?String(a):"",details:String(o||"")})})}catch{}},async getAuditLogs(e={}){const{entity:t="",entityId:a="",actions:o=[],sort:s="-event_at",limit:n=100}=e,i=[];if(t&&i.push(`entity="${O.escapeFilterValue(t)}"`),a&&i.push(`entity_id="${O.escapeFilterValue(a)}"`),Array.isArray(o)&&o.length){const c=o.map(r=>`action="${O.escapeFilterValue(r)}"`).join(" || ");i.push(`(${c})`)}return O.listAll("audit_log",{filter:i.join(" && ")||"",sort:s,perPage:Math.max(1,Math.min(200,Number(n)||100))})},async getAccounts(e=!0){const t=e?"active=true":"";return O.listAll("accounts",{filter:t,sort:"code",expand:"account_type_id"})},async getAccountSaldos(){const e=await O.listAll("tx_lines",{expand:"tx_id",filter:'tx_id.status="active"'}),t={};for(const a of e)t[a.account_id]||(t[a.account_id]=0),t[a.account_id]+=(a.debit??0)-(a.credit??0);return t},async getTerceros(e={}){const{type:t="",query:a=""}=e;let o="active=true";if(t){const s=O.escapeFilterValue(t);o+=` && type="${s}"`}if(a){const s=O.escapeFilterValue(a);o+=` && (name~"${s}" || doc_number~"${s}")`}return O.listAll("third_parties",{filter:o,sort:"name"})},async getTxTypes(){return O.listAll("transaction_types",{filter:"active=true",sort:"code"})},async nextConsecutive(e){const a=((await O.get("transaction_types",e)).consecutive??0)+1;return await O.update("transaction_types",e,{consecutive:a}),String(a).padStart(8,"0")},async createTransaction(e,t){const a=await O.create("transactions",{...e,number:e.number||"AUTO",status:e.status||"active"});try{for(const o of t)await O.create("tx_lines",{tx_id:a.id,...o})}catch(o){try{await O.delete("transactions",a.id)}catch{}throw o}return a},async getTransactions(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-id"}=e;try{return await O.list("transactions",{page:t,perPage:a,filter:o,sort:s,expand:"tx_type_id,third_party_id,user_id"})}catch(n){if(s!=="-id")return O.list("transactions",{page:t,perPage:a,filter:o,sort:"-id",expand:"tx_type_id,third_party_id,user_id"});throw n}},async getTxLines(e){return O.listAll("tx_lines",{filter:`tx_id="${e}"`,sort:"line_order",expand:"account_id,third_party_id"})},async voidTransaction(e,t=""){const a=await O.get("transactions",e);return a.status==="voided"||(await O.update("transactions",e,{status:"voided"}),await this.logAudit("VOID","transactions",e,t||`Transacción ${a.number} anulada`)),a},async approveTx(e){const t=await O.get("transactions",e);if(t.status!=="draft")throw new Error("Solo se pueden aprobar transacciones en estado Borrador.");return await O.update("transactions",e,{status:"active"}),await this.logAudit("APPROVE","transactions",e,`Transacción ${t.number} aprobada`),t},async revertTxToDraft(e){const t=await O.get("transactions",e);if(t.status!=="active")throw new Error("Solo se pueden revertir transacciones Activas a Borrador.");return await O.update("transactions",e,{status:"draft"}),await this.logAudit("REVERT_DRAFT","transactions",e,`Transacción ${t.number} revertida a Borrador`),t},async updateTransaction(e,t,a){await O.update("transactions",e,t);const o=O.escapeFilterValue(e),s=await O.listAll("tx_lines",{filter:`tx_id="${o}"`});for(const n of s)await O.delete("tx_lines",n.id);for(const n of a)await O.create("tx_lines",{tx_id:e,...n});await this.logAudit("UPDATE","transactions",e,"Modificación desde consulta de transacciones")},async checkTxDependencies(e){const t=O.escapeFilterValue(e),a=[],o=[],s=await O.list("einvoice_docs",{filter:`tx_id="${t}" && (status="enviada" || status="aceptada")`,perPage:1});if(s.totalItems>0){const l=s.items[0].status==="aceptada"?"Aceptada por DIAN":"Enviada a DIAN";a.push(`Este comprobante tiene un documento electrónico DIAN con estado "${l}". Los documentos fiscales ya transmitidos son inalterables por normativa tributaria.`)}const n=await O.list("payroll_periods",{filter:`tx_id="${t}"`,perPage:1});if(n.totalItems>0){const r=n.items[0],l={draft:"Borrador",approved:"Aprobado",paid:"Pagado"}[r.status]||r.status;o.push(`Este comprobante es el asiento de nómina del período "${r.name}" (${l}). Si lo modificas, el asiento contable de nómina quedará desincronizado con las liquidaciones.`)}const i=await O.listAll("tx_lines",{filter:`tx_id="${t}"`});let c=0;if(i.length>0){const r=i.map(p=>`tx_line_id="${O.escapeFilterValue(p.id)}"`).join(" || ");c=(await O.list("bank_movements",{filter:`(${r}) && reconciled=true`,perPage:1})).totalItems}return c>0&&o.push(`Tiene ${c} movimiento(s) bancario(s) conciliado(s). Revisa la conciliación bancaria después de modificar.`),{blocks:a,warnings:o}},async getProducts(e={}){const{activeOnly:t=!0,query:a="",type:o=""}=e;let s=t?"active=true":"";if(o){const n=O.escapeFilterValue(o);s+=(s?" && ":"")+`type="${n}"`}if(a){const n=O.escapeFilterValue(a);s+=(s?" && ":"")+`(name~"${n}" || code~"${n}")`}return O.listAll("products",{filter:s,sort:"code",expand:"income_account_id,cost_account_id,inventory_account_id"})},async getDashboardKpis(){const[e,t,a]=await Promise.all([O.list("transactions",{perPage:1}),O.list("third_parties",{filter:"active=true",perPage:1}),O.list("accounts",{filter:"active=true",perPage:1})]);return{totalTx:e.totalItems,totalTp:t.totalItems,totalAc:a.totalItems}},async getWarehouses(e=!0){const t=e?"active=true":"";return O.listAll("warehouses",{filter:t,sort:"code"})},async getInventoryStock(e={}){const{warehouseId:t="",productId:a=""}=e;let o="";return t&&(o+=`warehouse_id="${O.escapeFilterValue(t)}"`),a&&(o+=(o?" && ":"")+`product_id="${O.escapeFilterValue(a)}"`),O.listAll("inventory_stock",{filter:o,sort:"product_id",expand:"product_id,warehouse_id"})},async upsertStock(e,t,a,o=null,s=""){const n=O.escapeFilterValue(e),i=O.escapeFilterValue(t),c=await O.list("inventory_stock",{filter:`product_id="${n}" && warehouse_id="${i}"`,perPage:1}),r=s||new Date().toISOString().slice(0,10);if(c.items.length){const l=c.items[0],p=Math.max(0,(l.qty_on_hand??0)+a),f=o!==null?o:l.avg_cost??0;await O.update("inventory_stock",l.id,{qty_on_hand:p,avg_cost:f,last_mov_date:r})}else await O.create("inventory_stock",{product_id:e,warehouse_id:t,qty_on_hand:Math.max(0,a),avg_cost:o??0,last_mov_date:r});o!==null&&o>0&&await O.update("products",e,{cost_price:o})},async getInventoryMovements(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return O.list("inventory_movements",{page:t,perPage:a,filter:o,sort:s,expand:"warehouse_id,dest_warehouse_id,third_party_id"})},async getInventoryMovementLines(e){const t=O.escapeFilterValue(e);return O.listAll("inventory_movement_lines",{filter:`movement_id="${t}"`,sort:"line_order",expand:"product_id"})},async applyInventoryMovement(e){const t=await O.get("inventory_movements",e,{expand:"warehouse_id,dest_warehouse_id"});if(t.status==="applied")throw new Error("El movimiento ya fue aplicado.");if(t.status==="voided")throw new Error("El movimiento está anulado.");const a=await this.getInventoryMovementLines(e);if(!a.length)throw new Error("El movimiento no tiene líneas.");const o=t.date||new Date().toISOString().slice(0,10),s=t.mov_type==="ENTRADA"||t.mov_type==="AJUSTE_POSITIVO",n=t.mov_type==="SALIDA"||t.mov_type==="AJUSTE_NEGATIVO",i=t.mov_type==="TRASLADO";for(const c of a){const r=s?c.qty:n?-c.qty:0;i?(await this.upsertStock(c.product_id,t.warehouse_id,-c.qty,null,o),await this.upsertStock(c.product_id,t.dest_warehouse_id,c.qty,null,o)):await this.upsertStock(c.product_id,t.warehouse_id,r,c.unit_cost??null,o)}return await O.update("inventory_movements",e,{status:"applied"}),await this.logAudit("APPLY","InventoryMovement",e,`${t.mov_type} — ${t.number}`),t},async voidInventoryMovement(e,t=""){const a=await O.get("inventory_movements",e);if(a.status!=="applied")throw new Error("Solo se pueden anular movimientos ya aplicados.");const o=await this.getInventoryMovementLines(e),s=new Date().toISOString().slice(0,10),n=a.mov_type==="ENTRADA"||a.mov_type==="AJUSTE_POSITIVO",i=a.mov_type==="SALIDA"||a.mov_type==="AJUSTE_NEGATIVO",c=a.mov_type==="TRASLADO";for(const r of o){const l=n?-r.qty:i?r.qty:0;c?(await this.upsertStock(r.product_id,a.warehouse_id,r.qty,null,s),await this.upsertStock(r.product_id,a.dest_warehouse_id,-r.qty,null,s)):await this.upsertStock(r.product_id,a.warehouse_id,l,null,s)}await O.update("inventory_movements",e,{status:"voided"}),await this.logAudit("VOID","InventoryMovement",e,`Anulación ${a.mov_type} — ${a.number}${t?` | Motivo: ${t}`:""}`)},async getPurchaseInvoices(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return O.list("purchase_invoices",{page:t,perPage:a,filter:o,sort:s,expand:"supplier_id,warehouse_id,tx_type_id"})},async getPurchaseInvoiceLines(e){const t=O.escapeFilterValue(e);return O.listAll("purchase_invoice_lines",{filter:`invoice_id="${t}"`,sort:"line_order",expand:"product_id,account_id"})},async createPurchaseInvoice(e,t){const a=String((e==null?void 0:e.tx_type_id)||"").trim(),o=String((e==null?void 0:e.tx_number)||"").trim();if(!a)throw new Error("Debes seleccionar el tipo de comprobante contable en la compra.");if(!o)throw new Error("Debes definir la numeración del comprobante contable en la compra.");let s=0,n=0,i=0;for(const p of t)s+=p.subtotal||0,n+=p.iva_amount||0,i+=p.ret_amount||0;const c=s+n-i,r=await O.create("purchase_invoices",{...e,subtotal:s,iva_total:n,total:c,ret_total:i,payable_total:c,status:"draft"});(!r.tx_type_id||!r.tx_number)&&await O.update("purchase_invoices",r.id,{tx_type_id:a,tx_number:o});const l=await O.get("purchase_invoices",r.id);if(!l.tx_type_id||!l.tx_number)throw new Error("No se pudo persistir el comprobante contable de la compra. Reinicia PocketBase para aplicar migraciones y vuelve a intentar.");for(let p=0;p<t.length;p++)await O.create("purchase_invoice_lines",{invoice_id:r.id,line_order:p+1,...t[p]});return await this.logAudit("CREATE","PurchaseInvoice",r.id,`Factura compra ${r.number}`),l},async postPurchaseInvoice(e){var M,B,k,j,Y,W,K;const t=await O.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id,tx_type_id"});if(t.status==="posted")throw new Error("La factura ya fue contabilizada.");if(t.status==="voided")throw new Error("La factura está anulada.");const a=await this.getPurchaseInvoiceLines(e);if(!a.length)throw new Error("La factura no tiene líneas.");let o={};try{const H=await this.getSetting("purchase_config_v1");o=H?JSON.parse(H):{}}catch{o={}}const s=(o==null?void 0:o.accounting)||{},n=(s==null?void 0:s.accounts)||{},i=Array.isArray(s==null?void 0:s.withholding_rules)?s.withholding_rules:[],c=String(n.payable_code||"220505").trim(),r=String(n.expense_fallback_code||"5135").trim(),l=n.iva_by_rate&&typeof n.iva_by_rate=="object"?n.iva_by_rate:{},p={},f={},m=async H=>{const x=String(H||"").trim();if(!x)throw new Error("Cuenta contable inválida en la compra.");return p[x]||(p[x]=await O.get("accounts",x)),p[x]},d=async H=>{if(!String(H||"").trim())throw new Error("Hay una cuenta sin código en la configuración de compras.");const x=String(H).trim();if(f[x])return f[x];const P=O.escapeFilterValue(x),V=await O.list("accounts",{filter:`code="${P}"`,perPage:1});if(!V.items.length)throw new Error(`Cuenta ${x} no encontrada en el plan de cuentas.`);return f[x]=V.items[0],p[V.items[0].id]=V.items[0],V.items[0]},b=async({accountId:H,thirdPartyId:x=null,debit:P=0,credit:V=0,description:U="",crossDocRef:z=""})=>{const J=await m(H),te={account_id:J.id,third_party_id:x,debit:P,credit:V,description:U,line_order:g.length+1};return J.maneja_cruce&&String(z||"").trim()&&(te.cross_doc_ref=String(z||"").trim()),te},u=await d(c),y=await d(r),v={},g=[],h=[],_={},A={};for(const H of a){const x=(M=H.expand)==null?void 0:M.product_id;let P;if(x){if(P=x.type==="BIEN"?x.inventory_account_id:x.cost_account_id||y.id,x.type==="BIEN"&&!P)throw new Error(`El producto ${x.code||""} ${x.name||""} no tiene cuenta de inventario asignada.`.trim())}else{if(!H.account_id)throw new Error(`Línea sin cuenta contable: "${H.description||"?"}"`);P=H.account_id}g.push(await b({accountId:P,thirdPartyId:t.supplier_id,debit:H.subtotal||0,credit:0,description:H.description||((k=(B=t.expand)==null?void 0:B.supplier_id)==null?void 0:k.name)||"",crossDocRef:t.supplier_ref||""})),(x==null?void 0:x.type)==="BIEN"&&h.push({product_id:H.product_id,qty:H.qty,unit_cost:H.unit_price,notes:H.description});const V=String(Number(H.iva_rate||0)),U=Number(H.iva_amount||0);U>0&&(_[V]=(_[V]||0)+U);let z=Number(H.ret_amount||0),J=String(H.ret_account_code||"").trim();if(z<=0&&H.ret_rule_id){const te=i.find(F=>String(F.id||"")===String(H.ret_rule_id||""));if(te){const F=String(H.ret_base_type||te.base_type||"SUBTOTAL").toUpperCase(),D=Number(te.min_base||0)||0,q=Number(H.subtotal||0),G=Number(H.iva_amount||0),ee=Number(H.total||q+G),X=F==="IVA"?G:F==="TOTAL"?ee:q,ne=Number(H.ret_rate||te.rate||0)||0;X>=D&&ne>0&&(z=X*ne/100,J||(J=String(te.account_code||"").trim()))}}if(z>0){if(!J)throw new Error(`La línea "${H.description||"?"}" tiene retención sin cuenta contable configurada.`);A[J]=(A[J]||0)+z}}{const H=a.reduce((U,z)=>U+Number(z.subtotal||0),0),x=a.reduce((U,z)=>U+Number(z.iva_amount||0),0),P=H+x,V=[{id:String(t.ret_rule_renta_id||"").trim(),kind:"renta"},{id:String(t.ret_rule_ica_id||"").trim(),kind:"ica"},{id:String(t.ret_rule_iva_id||"").trim(),kind:"iva"}];for(const{id:U,kind:z}of V){if(!U)continue;const J=i.find(ee=>String(ee.id||"")===U);if(!J)continue;const te=Number(J.min_base||0)||0;let F;if(z==="iva")F=x;else{const ee=String(J.base_type||"SUBTOTAL").toUpperCase();F=ee==="IVA"?x:ee==="TOTAL"?P:H}if(F<=0||F<te)continue;const D=Number(J.rate||0)||0;if(D<=0)continue;const q=F*D/100,G=String(J.account_code||"").trim();if(!G)throw new Error(`La regla de retención "${J.concept}" no tiene cuenta contable configurada.`);A[G]=(A[G]||0)+q}}for(const H of Object.keys(_)){const x=Number(_[H]||0);if(x<=0)continue;let P=String(l[H]||"").trim();if(!P&&Number(H)===19&&(P="233502"),!P)throw new Error(`No hay cuenta IVA configurada para la tarifa ${H}%. Ajusta el engranaje de Compras.`);v[P]||(v[P]=await d(P)),g.push(await b({accountId:v[P].id,thirdPartyId:null,debit:x,credit:0,description:`IVA ${H}% compra ${t.number}`,crossDocRef:t.supplier_ref||""}))}let C=0;for(const H of Object.keys(A)){const x=Number(A[H]||0);x<=0||(C+=x,v[H]||(v[H]=await d(H)),g.push(await b({accountId:v[H].id,thirdPartyId:t.supplier_id,debit:0,credit:x,description:`Retenciones compra ${t.number}`,crossDocRef:t.supplier_ref||""})))}const T=Number(t.subtotal||0)+Number(t.iva_total||0),N=Number(t.payable_total||0),I=Number(t.total||0),S=N>0?N:I>0&&Math.abs(I-T)>.01?I:T-C;g.push(await b({accountId:u.id,thirdPartyId:t.supplier_id,debit:0,credit:S,description:`${t.supplier_ref?`Ref: ${t.supplier_ref} — `:""}${((Y=(j=t.expand)==null?void 0:j.supplier_id)==null?void 0:Y.name)||""}`,crossDocRef:t.supplier_ref||""}));let w=String(t.tx_type_id||"").trim(),E=String(t.tx_number||"").trim();if(!w){const H=[],x=E.split("-")[0]||"",P=String(t.number||"").split("-")[0]||"";x&&H.push(x),P&&P!==x&&H.push(P);for(const V of H){const U=O.escapeFilterValue(V),z=await O.list("transaction_types",{filter:`active=true && (prefix="${U}" || code="${U}")`,perPage:1});if(z.items.length){w=z.items[0].id;break}}}if(!w)throw new Error("La factura no tiene tipo de comprobante contable. Edítala y selecciónalo.");E||(E="AUTO"),(!t.tx_type_id||!t.tx_number)&&await O.update("purchase_invoices",e,{tx_type_id:w,tx_number:E});const L=await this.createTransaction({tx_type_id:w,number:E,date:t.date,description:`Compra ${t.number} — ${((K=(W=t.expand)==null?void 0:W.supplier_id)==null?void 0:K.name)||""}`,third_party_id:t.supplier_id,payment_days:0,cross_enabled:!1,status:"draft"},g);let R=null;if(h.length&&t.warehouse_id){const H=t.date||new Date().toISOString().slice(0,10),x=String(Date.now()).slice(-4),P=`ENT-${H.replaceAll("-","")}-${x}`,V=await O.create("inventory_movements",{number:P,mov_type:"ENTRADA",date:t.date,warehouse_id:t.warehouse_id,third_party_id:t.supplier_id,notes:`Compra ${t.number}`,status:"draft",tx_id:L.id});for(let U=0;U<h.length;U++)await O.create("inventory_movement_lines",{movement_id:V.id,line_order:U+1,...h[U]});await this.applyInventoryMovement(V.id),R=V.id}return await O.update("purchase_invoices",e,{status:"posted",tx_id:L.id,inv_movement_id:R,ret_total:C,payable_total:S}),await this.logAudit("POST","PurchaseInvoice",e,`Contabilizada ${t.number} → TX ${L.number}`),{inv:t,tx:L}},async getPurchaseMutationBlocks(e){var s,n,i;const t=await O.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id"}),a=[],o={crossRefs:[],downstreamTx:[],stockShortages:[]};if(t.tx_id){const c=await this.checkTxDependencies(t.tx_id);a.push(...c.blocks);const r=await this.getTxLines(t.tx_id).catch(()=>[]),l=new Set;if(String(t.supplier_ref||"").trim()&&l.add(String(t.supplier_ref||"").trim()),r.forEach(p=>{const f=String(p.cross_doc_ref||"").trim();f&&l.add(f)}),o.crossRefs=[...l],t.supplier_id&&l.size)for(const p of l){const m=(await O.listAll("tx_lines",{filter:`third_party_id="${O.escapeFilterValue(t.supplier_id)}" && cross_doc_ref="${O.escapeFilterValue(p)}"`,expand:"account_id,tx_id",sort:"-id"})).filter(d=>{var b,u;return!d||d.tx_id===t.tx_id||(((u=(b=d.expand)==null?void 0:b.tx_id)==null?void 0:u.status)||"")==="voided"?!1:String(d.cross_doc_ref||"").trim()===p});m.length&&o.downstreamTx.push(...m.map(d=>{var b,u,y,v,g,h;return{ref:p,txNumber:((u=(b=d.expand)==null?void 0:b.tx_id)==null?void 0:u.number)||d.tx_id,txDate:((v=(y=d.expand)==null?void 0:y.tx_id)==null?void 0:v.date)||"",account:((h=(g=d.expand)==null?void 0:g.account_id)==null?void 0:h.code)||d.account_id,amount:Number(d.debit||0)||Number(d.credit||0)||0}}))}if(o.downstreamTx.length){const p=o.downstreamTx.slice(0,3).map(f=>`${f.txNumber}${f.txDate?` (${f.txDate})`:""}`).join(", ");a.push(`La compra ya tiene pagos o cruces posteriores sobre el documento ${o.crossRefs.join(", ")}. Transacciones detectadas: ${p}${o.downstreamTx.length>3?"…":""}.`)}}if(t.inv_movement_id){const c=await O.get("inventory_movements",t.inv_movement_id).catch(()=>null),r=(c==null?void 0:c.warehouse_id)||t.warehouse_id||"",l=await this.getInventoryMovementLines(t.inv_movement_id).catch(()=>[]);for(const p of l){const f=r?await this.getInventoryStock({warehouseId:r,productId:p.product_id}).catch(()=>[]):[],m=Number(((s=f[0])==null?void 0:s.qty_on_hand)||0),d=Number(p.qty||0);m+1e-4<d&&o.stockShortages.push({product:((i=(n=p.expand)==null?void 0:n.product_id)==null?void 0:i.name)||p.product_id,requiredQty:d,qtyOnHand:m})}if(o.stockShortages.length){const p=o.stockShortages.slice(0,3).map(f=>`${f.product} (disp. ${fmtN(f.qtyOnHand)} / compra ${fmtN(f.requiredQty)})`).join(", ");a.push(`La entrada de inventario ya tuvo efectos posteriores y no se puede revertir sin descuadrar stock. Productos afectados: ${p}${o.stockShortages.length>3?"…":""}.`)}}return{inv:t,blocks:a,details:o}},async rollbackPurchasePosting(e,t="anular",a=""){const o=await O.get("purchase_invoices",e);if(o.status!=="posted")return{inv:o,txVoided:!1,movementVoided:!1};if(typeof isPeriodClosed=="function"&&await isPeriodClosed(o.date))throw new Error(`El período ${(o.date||"").slice(0,7)} está cerrado. No se puede ${t} la compra.`);const s=await this.getPurchaseMutationBlocks(e);if(s.blocks.length)throw new Error(s.blocks[0]);if(o.tx_id){const n=await O.get("transactions",o.tx_id).catch(()=>null);n&&n.status!=="voided"&&await this.voidTransaction(o.tx_id,`${t} compra ${o.number}${a?` | Motivo: ${a}`:""}`)}if(o.inv_movement_id){const n=await O.get("inventory_movements",o.inv_movement_id).catch(()=>null);n&&n.status==="applied"?await this.voidInventoryMovement(o.inv_movement_id,a):n&&n.status!=="voided"&&(await O.update("inventory_movements",o.inv_movement_id,{status:"voided"}),await this.logAudit("VOID","InventoryMovement",o.inv_movement_id,`Anulación ${n.mov_type||"MOV"} — ${n.number||""}${a?` | Motivo: ${a}`:""}`.trim()))}return{inv:o,txVoided:!!o.tx_id,movementVoided:!!o.inv_movement_id}},async reopenPurchaseInvoice(e,t=""){const a=String(t||"").trim();if(!a)throw new Error("Debes indicar el motivo de reapertura.");const s=(await this.rollbackPurchasePosting(e,"reabrir",a)).inv;if(s.status==="voided")throw new Error("La factura está anulada y no se puede reabrir.");if(s.status==="draft")throw new Error("La factura ya está en borrador.");return await O.update("purchase_invoices",e,{status:"draft",tx_id:null,inv_movement_id:null}),await this.logAudit("REOPEN","PurchaseInvoice",e,`Reabierta ${s.number} para corrección | Motivo: ${a}`),O.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id,tx_type_id"})},async voidPurchaseInvoice(e,t=""){const a=String(t||"").trim();if(!a)throw new Error("Debes indicar el motivo de anulación.");const o=await O.get("purchase_invoices",e);if(o.status==="voided")throw new Error("La factura ya está anulada.");o.status==="posted"&&await this.rollbackPurchasePosting(e,"anular",a),await O.update("purchase_invoices",e,{status:"voided"}),await this.logAudit("VOID","PurchaseInvoice",e,`Anulada ${o.number} | Motivo: ${a}`)},async getPhProperties(e=!0){const t=e?"active=true":"";return O.listAll("ph_properties",{filter:t,sort:"code",expand:"owner_id,occupant_id"})},async getPhCommonAreas(e=!0){const t=e?"active=true":"";return O.listAll("ph_common_areas",{filter:t,sort:"code"})},async getPhBillingConcepts(e=!0){const t=e?"active=true":"";return O.listAll("ph_billing_concepts",{filter:t,sort:"code",expand:"account_id"})},async getPhInvoices(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return O.list("ph_invoices",{page:t,perPage:a,filter:o,sort:s,expand:"property_id,property_id.owner_id"})},async getPhInvoiceLines(e){const t=O.escapeFilterValue(e);return O.listAll("ph_invoice_lines",{filter:`invoice_id="${t}"`,sort:"line_order",expand:"concept_id,concept_id.account_id"})},async generatePhInvoices(e,t=""){const a=O.escapeFilterValue(e),[o,s,n]=await Promise.all([this.getPhProperties(!0),this.getPhBillingConcepts(!0),this.getSetting("ph_config_v1")]);if(!o.length)throw new Error("No hay unidades activas registradas.");if(!s.length)throw new Error("No hay conceptos de facturación activos.");let i={};try{i=n?JSON.parse(n):{}}catch{i={}}const c=Number((i==null?void 0:i.late_fee_rate)||0),r=Array.isArray(i==null?void 0:i.late_fee_concepts)?i.late_fee_concepts.map(h=>String(h||"")).filter(Boolean):[],l=new Set(r),p=h=>String(h||"").trim().toLowerCase(),f=new Set((s||[]).filter(h=>l.has(String(h.id||""))).map(h=>p(h.name)).filter(Boolean)),m=`period="${a}"`,d=await O.listAll("ph_invoices",{filter:m,perPage:200}),b=new Set(d.map(h=>h.property_id)),u=o.filter(h=>!b.has(h.id));if(!u.length)throw new Error(`Todas las unidades ya tienen factura para el período ${e}.`);const y=e+"-01",v=t||e+"-10";let g=0;for(const h of u){const _=`${e}-01`,A=new Date(`${_}T00:00:00`),C=[];let T=0,N=1;for(const E of s){let L=Number(E.amount||0);E.applies_coef&&h.coef_participacion>0&&(L=L*(h.coef_participacion/100)),!(L<=0)&&(T+=L,C.push({concept_id:E.id,description:E.name,amount:Math.round(L),line_order:N++}))}if(c>0&&l.size){const E=O.escapeFilterValue(h.id),L=await O.listAll("ph_invoices",{filter:`property_id="${E}" && period!="${a}" && status!="paid" && status!="voided"`,perPage:200});let R=0;for(const M of L){if(!(M!=null&&M.due_date))continue;const B=new Date(`${M.due_date}T00:00:00`);if(Number.isNaN(B.getTime())||B.getTime()>=A.getTime())continue;const k=O.escapeFilterValue(M.id),j=await O.listAll("ph_invoice_lines",{filter:`invoice_id="${k}"`,perPage:200});for(const Y of j){const W=String((Y==null?void 0:Y.concept_id)||""),K=p(Y==null?void 0:Y.description),H=W&&l.has(W),x=!W&&f.has(K);if(!H&&!x)continue;const P=Number(Y.amount||0);P<=0||(R+=P*(c/100))}}if(R>0){const M=Math.round(R);T+=M,C.push({concept_id:null,description:`Interés de mora a ${_}`,amount:M,line_order:N++})}}if(!C.length)continue;const I=String(g+1).padStart(6,"0"),S=`CF-${e.replace("-","")}-${I}`,w=await O.create("ph_invoices",{number:S,period:e,property_id:h.id,date:y,due_date:v,subtotal:Math.round(T),total:Math.round(T),status:"draft",notes:""});for(const E of C)await O.create("ph_invoice_lines",{invoice_id:w.id,...E});g++}return await this.logAudit("GENERATE","PhInvoices",e,`Generadas ${g} facturas PH para ${e}`),g},async getPhPortfolioByConcept(e=""){var n,i;const t=String(e||new Date().toISOString().slice(0,10)).trim(),a=O.escapeFilterValue(t),o=await O.listAll("ph_invoices",{filter:`status!="paid" && status!="voided" && date<="${a}"`,perPage:200,expand:"property_id"}),s=new Map;for(const c of o){const r=O.escapeFilterValue(c.id),l=await O.listAll("ph_invoice_lines",{filter:`invoice_id="${r}"`,perPage:200,expand:"concept_id"}),p=!!c.due_date&&String(c.due_date)<t;for(const f of l){const m=String(f.concept_id||"SIN_CONCEPTO"),d=((i=(n=f.expand)==null?void 0:n.concept_id)==null?void 0:i.name)||f.description||"Sin concepto",b=`${m}`;s.has(b)||s.set(b,{concept_id:m==="SIN_CONCEPTO"?null:m,concept_name:d,total:0,overdue:0,lines:0});const u=s.get(b),y=Number(f.amount||0);u.total+=y,u.lines+=1,p&&(u.overdue+=y)}}return Array.from(s.values()).sort((c,r)=>String(c.concept_name||"").localeCompare(String(r.concept_name||"")))},async postPhInvoicesByPeriod(e){const t=O.escapeFilterValue(e),a=await O.listAll("ph_invoices",{filter:`period="${t}"`,perPage:200});if(!a.length)throw new Error(`No hay facturas para el período ${e}.`);let o=0,s=0,n=0;const i=[];for(const c of a){if(c.status!=="draft"){s++;continue}try{await this.postPhInvoice(c.id),o++}catch(r){n++,i.push(`${c.number||c.id}: ${(r==null?void 0:r.message)||"Error"}`)}}return await this.logAudit("POST_PERIOD","PhInvoices",e,`Período ${e}: contabilizadas ${o}, omitidas ${s}, fallidas ${n}`),{period:e,total:a.length,posted:o,skipped:s,failed:n,failures:i}},async unpostPhInvoice(e){const t=await O.get("ph_invoices",e);if(t.status==="draft")throw new Error("La factura ya está en borrador.");if(t.status==="voided")throw new Error("La factura está anulada y no se puede descontabilizar.");let a="none";if(t.tx_id)try{await O.update("transactions",t.tx_id,{status:"draft"}),a="draft"}catch{await O.update("transactions",t.tx_id,{status:"voided"}),a="voided"}return await O.update("ph_invoices",e,{status:"draft",tx_id:null}),await this.logAudit("UNPOST","PhInvoice",e,`Descontabilizada ${t.number||e} | TX->${a}`),{invoiceId:e,txAction:a}},async unpostPhInvoicesByPeriod(e){const t=O.escapeFilterValue(e),a=await O.listAll("ph_invoices",{filter:`period="${t}"`,perPage:200});if(!a.length)throw new Error(`No hay facturas para el período ${e}.`);let o=0,s=0,n=0,i=0;for(const c of a){if(c.status==="draft"){s++;continue}if(c.status==="voided"){s++;continue}if(c.tx_id)try{await O.update("transactions",c.tx_id,{status:"draft"}),n++}catch{await O.update("transactions",c.tx_id,{status:"voided"}),i++}await O.update("ph_invoices",c.id,{status:"draft",tx_id:null}),o++}return await this.logAudit("UNPOST_PERIOD","PhInvoices",e,`Período ${e}: descontabilizadas ${o}, omitidas ${s}, TX->draft ${n}, TX->voided ${i}`),{period:e,total:a.length,reverted:o,skipped:s,txDraft:n,txVoided:i}},async deletePhInvoicesByPeriod(e){const t=O.escapeFilterValue(e),a=await O.listAll("ph_invoices",{filter:`period="${t}"`,perPage:200});if(!a.length)throw new Error(`No hay facturas para el período ${e}.`);let o=0,s=0,n=0;for(const i of a){if(i.tx_id)try{await O.delete("transactions",i.tx_id),s++}catch{await O.update("transactions",i.tx_id,{status:"voided"}),n++}await O.delete("ph_invoices",i.id),o++}return await this.logAudit("DELETE_PERIOD","PhInvoices",e,`Período ${e}: facturas eliminadas ${o}, TX eliminadas ${s}, TX anuladas ${n}`),{period:e,total:a.length,deleted:o,txDeleted:s,txVoided:n}},async postPhInvoice(e){var T,N,I;const t=await O.get("ph_invoices",e,{expand:"property_id,property_id.owner_id"});if(t.status==="posted")throw new Error("La factura ya fue contabilizada.");if(t.status==="voided")throw new Error("La factura está anulada.");const a=await this.getPhInvoiceLines(e);if(!a.length)throw new Error("La factura no tiene líneas.");let o={};try{const S=await this.getSetting("ph_config_v1");o=S?JSON.parse(S):{}}catch{o={}}const s=String(o.cxc_code||"130505").trim(),n=String(o.income_code||"413505").trim(),i=String(o.late_fee_income_code||n).trim(),c=String(t.number||"").trim(),r=await O.list("transaction_types",{filter:'code="CF" && active=true',perPage:1});if(!r.items.length)throw new Error("Tipo de transacción CF no encontrado. Reinicia PocketBase para aplicar la migración.");const l=r.items[0],p=(T=t.expand)==null?void 0:T.property_id,f=(p==null?void 0:p.owner_id)||null,m={},d={},b=async S=>{const w=String(S||"").trim();if(!w)throw new Error("Cuenta contable inválida.");return m[w]||(m[w]=await O.get("accounts",w)),m[w]},u=async S=>{const w=String(S||"").trim();if(!w)throw new Error("Código de cuenta inválido.");if(d[w])return d[w];const E=O.escapeFilterValue(w),L=await O.list("accounts",{filter:`code="${E}"`,perPage:1});if(!L.items.length)throw new Error(`Cuenta "${w}" no encontrada.`);const R=L.items[0];return d[w]=R,m[R.id]=R,R},y=await u(s),v=await u(n),g=async({accountId:S,debit:w=0,credit:E=0,description:L="",thirdPartyId:R=null,crossDocRef:M=""})=>{const B=await b(S),k={account_id:B.id,debit:Number(w||0),credit:Number(E||0),description:String(L||""),line_order:0};if(B.requires_third_party){const j=R||f||null;if(!j)throw new Error(`La cuenta ${B.code} - ${B.name} requiere tercero y la unidad no tiene propietario.`);k.third_party_id=j}else k.third_party_id=R||null;if(B.maneja_cruce){const j=String(M||c||"").trim();if(!j)throw new Error(`La cuenta ${B.code} - ${B.name} requiere documento de cruce.`);k.cross_doc_ref=j}return k},h=[];for(const S of a){const w=(N=S.expand)==null?void 0:N.concept_id;let E=v.id;S.account_code?E=(await u(S.account_code)).id:w!=null&&w.account_id?E=w.account_id:!S.concept_id&&/inter[eé]s de mora/i.test(String(S.description||""))&&(E=(await u(i)).id),h.push(await g({accountId:E,debit:0,credit:Number(S.amount||0),description:S.description,thirdPartyId:f||null,crossDocRef:c}))}const _=a.reduce((S,w)=>S+Number(w.amount||0),0);h.unshift(await g({accountId:y.id,debit:_,credit:0,description:`Cuota ${t.period} — ${(p==null?void 0:p.name)||(p==null?void 0:p.code)||t.property_id}`,thirdPartyId:f||null,crossDocRef:c})),h.forEach((S,w)=>{S.line_order=w+1});const A=((I=O.currentUser)==null?void 0:I.id)||"",C=await O.create("transactions",{tx_type_id:l.id,number:"AUTO",date:t.date,description:`Factura PH ${t.number} — ${(p==null?void 0:p.name)||t.property_id} — ${t.period}`,third_party_id:f||null,cross_enabled:h.some(S=>!!S.cross_doc_ref),status:"active",user_id:A||void 0});for(const S of h)await O.create("tx_lines",{tx_id:C.id,...S});return await O.update("ph_invoices",e,{status:"posted",tx_id:C.id}),await this.logAudit("POST","PhInvoice",e,`Contabilizada ${t.number} → TX ${C.number}`),O.get("ph_invoices",e,{expand:"property_id"})},async voidPhInvoice(e,t=""){const a=String(t||"").trim();if(!a)throw new Error("Debes indicar el motivo de anulación.");const o=await O.get("ph_invoices",e);if(o.status==="voided")throw new Error("La factura ya está anulada.");o.status==="posted"&&o.tx_id&&await O.update("transactions",o.tx_id,{status:"voided"}),await O.update("ph_invoices",e,{status:"voided",tx_id:null}),await this.logAudit("VOID","PhInvoice",e,`Anulada ${o.number} | Motivo: ${a}`)},async markPhInvoicePaid(e){const t=await O.get("ph_invoices",e);if(t.status!=="posted")throw new Error("Solo se pueden marcar como pagadas las facturas contabilizadas.");await O.update("ph_invoices",e,{status:"paid"}),await this.logAudit("PAID","PhInvoice",e,`Marcada como pagada ${t.number}`)},async getPhReservations(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return O.list("ph_reservations",{page:t,perPage:a,filter:o,sort:s,expand:"area_id,property_id"})},async getPhPqrs(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-created"}=e;try{return await O.list("ph_pqrs",{page:t,perPage:a,filter:o,sort:s,expand:"property_id"})}catch{try{return await O.list("ph_pqrs",{page:t,perPage:a,filter:o,expand:"property_id"})}catch{return{items:[],totalItems:0,page:t,perPage:a}}}},async nextPhPqrNumber(){const e=new Date().toISOString().slice(0,10).replace(/-/g,""),a=((await O.list("ph_pqrs",{perPage:1})).totalItems||0)+1;return`PQR-${e}-${String(a).padStart(4,"0")}`},async addPhIndividualLinesToInvoice(e,t){if((await O.get("ph_invoices",e)).status!=="draft")throw new Error("Solo se pueden modificar facturas en estado Borrador.");const o=await this.getPhInvoiceLines(e);let s=Math.max(0,...o.map(c=>Number(c.line_order||0)))+1;for(const c of t)await O.create("ph_invoice_lines",{invoice_id:e,concept_id:null,description:String(c.description||""),amount:Math.round(Number(c.amount||0)),account_code:String(c.account_code||""),line_order:s++});const i=(await this.getPhInvoiceLines(e)).reduce((c,r)=>c+Number(r.amount||0),0);return await O.update("ph_invoices",e,{subtotal:i,total:i}),i},async updatePhDraftInvoiceLine(e,{description:t="",amount:a=0,account_code:o=""}={}){const s=await O.get("ph_invoice_lines",e),n=await O.get("ph_invoices",s.invoice_id);if(n.status!=="draft")throw new Error("Solo se pueden editar líneas de facturas en borrador.");await O.update("ph_invoice_lines",e,{description:String(t||"").trim(),amount:Math.round(Number(a||0)),account_code:String(o||"").trim()||null});const c=(await this.getPhInvoiceLines(n.id)).reduce((r,l)=>r+Number(l.amount||0),0);return await O.update("ph_invoices",n.id,{subtotal:c,total:c}),{invoiceId:n.id,total:c}},async deletePhDraftInvoiceLine(e){const t=await O.get("ph_invoice_lines",e),a=await O.get("ph_invoices",t.invoice_id);if(a.status!=="draft")throw new Error("Solo se pueden eliminar líneas de facturas en borrador.");await O.delete("ph_invoice_lines",e);const s=(await this.getPhInvoiceLines(a.id)).reduce((n,i)=>n+Number(i.amount||0),0);return await O.update("ph_invoices",a.id,{subtotal:s,total:s}),{invoiceId:a.id,total:s}},async getPhIndividualCharges(e={}){const{page:t=1,perPage:a=100,filter:o="",sort:s=""}=e,n={page:t,perPage:a,filter:o};s&&(n.sort=s);try{return await O.list("ph_individual_charges",n)}catch{try{return await O.list("ph_individual_charges",{page:t,perPage:a,filter:o})}catch{try{return await O.list("ph_individual_charges",{page:t,perPage:a})}catch{return{items:[],totalItems:0,page:t,perPage:a}}}}},calculateDaysOverdue(e,t=null){if(!e)return 0;const a=new Date(`${e}T00:00:00Z`);let o=null;t?o=new Date(`${t}T23:59:59Z`):o=new Date;const s=o.getTime()-a.getTime();return Math.floor(s/(1e3*60*60*24))},normalizePhCarteraConceptLabel(e){const t=String(e||"").trim();return t?/^inter[eé]s\s+de\s+mora\s+a\s+\d{4}-\d{2}-\d{2}$/i.test(t)?"Interés de mora":t:"Concepto"},async _getPhCarteraDataset(e,t="",a=""){const o=O.escapeFilterValue(e),s=O.escapeFilterValue(t),n=O.escapeFilterValue(a);let i='status!="voided"';e&&(i+=` && property_id="${o}"`),t&&(i+=` && period>="${s}"`),a&&(i+=` && period<="${n}"`);let c=[];try{c=(await O.list("ph_invoices",{filter:i,perPage:500,sort:"-date"})).items||[]}catch{try{c=(await O.list("ph_invoices",{filter:i,perPage:500})).items||[]}catch{c=[]}}let r=[];try{r=await this.getPhProperties(!1)}catch{r=[]}const l=new Map((r||[]).map(m=>[String(m.id),m]));let p=null;if(a){if(/^\d{4}-\d{2}-\d{2}$/.test(a))p=a;else if(/^\d{4}-\d{2}$/.test(a)){const[m,d]=a.split("-").map(Number),b=new Date(m,d,0).getDate();p=`${m}-${String(d).padStart(2,"0")}-${String(b).padStart(2,"0")}`}}const f=[];for(const m of c){const d=l.get(String(m.property_id))||null;let b=[];try{b=await this.getPhInvoiceLines(m.id)}catch{b=[]}for(const u of b){const y=Number(u.amount||0),v=this.calculateDaysOverdue(m.due_date,p),g=String(m.date||m.created||"").slice(0,10),h=String(m.due_date||"").slice(0,10),_=g?new Date(`${g}T00:00:00Z`):null,A=h?new Date(`${h}T00:00:00Z`):null,C=_&&A?Math.max(0,Math.floor((A.getTime()-_.getTime())/(1e3*60*60*24))):0;let T="por_vencer";m.status==="paid"?T="cancelado":m.status==="draft"?T="borrador":v>=0&&(T="vencido");const N=Math.max(0,v),I=u.description||u.account_code||"Concepto",S=this.normalizePhCarteraConceptLabel(I),w=u.concept_id?String(u.concept_id):String(S||u.account_code||"OTROS").toUpperCase();f.push({invoice:m,line:u,amount:y,diasMora:N,diasMoraRaw:v,plazoDias:C,fechaDoc:g,dueDate:h,estado:T,propertyId:String(m.property_id||""),propertyCode:String((d==null?void 0:d.code)||""),propertyName:String((d==null?void 0:d.name)||""),conceptoId:w,concepto:S})}}return{invoices:c,rows:f}},async getPhCarteraByUnit(e,t="",a=""){const{rows:o}=await this._getPhCarteraDataset(e,t,a),s={};for(const n of o)s[n.conceptoId]||(s[n.conceptoId]={conceptoId:n.conceptoId,concepto:n.concepto,totalVencido:0,totalPorVencer:0,totalCancelado:0,totalPendiente:0,diasMoraMax:0}),n.estado==="cancelado"?s[n.conceptoId].totalCancelado+=n.amount:n.estado==="vencido"?(s[n.conceptoId].totalVencido+=n.amount,s[n.conceptoId].totalPendiente+=n.amount,s[n.conceptoId].diasMoraMax=Math.max(s[n.conceptoId].diasMoraMax,n.diasMora)):(s[n.conceptoId].totalPorVencer+=n.amount,s[n.conceptoId].totalPendiente+=n.amount);return Object.values(s).sort((n,i)=>String(n.concepto).localeCompare(String(i.concepto),"es"))},async getPhCarteraOpenParties(e,t="",a="",o={}){const{rows:s}=await this._getPhCarteraDataset(e,t,a),n=String(o.conceptoId||"").trim(),i=String(o.estado||"all").trim();return s.filter(r=>!n||String(r.conceptoId)===n).filter(r=>i==="all"||r.estado===i).map(r=>({invoiceId:r.invoice.id,invoiceNumber:r.invoice.number,periodo:r.invoice.period,propertyId:r.propertyId,propertyCode:r.propertyCode,propertyName:r.propertyName,concepto:r.concepto,conceptoId:r.conceptoId,amount:r.amount,fechaDoc:r.fechaDoc,plazoDias:r.plazoDias,dueDate:r.dueDate,diasMora:r.diasMora,estado:r.estado})).sort((r,l)=>{const p=String(r.propertyCode||"").localeCompare(String(l.propertyCode||""));if(p!==0)return p;const f=String(r.periodo||"").localeCompare(String(l.periodo||""));return f!==0?f:String(r.invoiceNumber||"").localeCompare(String(l.invoiceNumber||""))})},async getPhCarteraIntegrity(e,t="",a=""){const{invoices:o,rows:s}=await this._getPhCarteraDataset(e,t,a),n={invoices:o.length,lines:s.length,totalFacturas:0,totalLineas:0,totalPendiente:0,totalCancelado:0,diferenciaGlobal:0};for(const r of o)n.totalFacturas+=Number(r.total||0);for(const r of s)n.totalLineas+=Number(r.amount||0),r.estado==="cancelado"?n.totalCancelado+=Number(r.amount||0):n.totalPendiente+=Number(r.amount||0);n.diferenciaGlobal=Math.round((n.totalFacturas-n.totalLineas)*100)/100;const i={};for(const r of s){const l=r.invoice.id;i[l]||(i[l]={invoiceId:l,number:r.invoice.number,period:r.invoice.period,status:r.invoice.status,totalFactura:Number(r.invoice.total||0),totalLineas:0,diferencia:0}),i[l].totalLineas+=Number(r.amount||0)}const c=Object.values(i).map(r=>(r.diferencia=Math.round((r.totalFactura-r.totalLineas)*100)/100,r)).filter(r=>Math.abs(r.diferencia)>1).sort((r,l)=>Math.abs(l.diferencia)-Math.abs(r.diferencia));return{totals:n,mismatches:c,isBalanced:Math.abs(n.diferenciaGlobal)<=1&&c.length===0}}};window.pb=O;window.API=Vc;window.PB_URL=Me;const Ds={admin:{canWrite:!0,canDelete:!0,canManageUsers:!0,canViewAudit:!0,canExport:!0,canApprove:!0},contador:{canWrite:!0,canDelete:!1,canManageUsers:!1,canViewAudit:!1,canExport:!0,canApprove:!0},auxiliar:{canWrite:!0,canDelete:!1,canManageUsers:!1,canViewAudit:!1,canExport:!1,canApprove:!1},auditor:{canWrite:!1,canDelete:!1,canManageUsers:!1,canViewAudit:!0,canExport:!0,canApprove:!1},viewer:{canWrite:!1,canDelete:!1,canManageUsers:!1,canViewAudit:!1,canExport:!1,canApprove:!1}};function Ka(e){var a,o;const t=((a=pb.currentUser)==null?void 0:a.role)??"viewer";return!!((o=Ds[t])!=null&&o[e])}function jc(...e){var a;const t=((a=pb.currentUser)==null?void 0:a.role)??"viewer";return e.includes(t)}async function Hc(){var s;const e=getInputVal("login-email");getInputVal("login-pass");const t=((s=$("#login-pass"))==null?void 0:s.value)??"",a=$("#login-error");if(a.classList.add("hidden"),!e||!t){a.textContent="Ingresa correo y contraseña",a.classList.remove("hidden");return}const o=$("#btn-login");o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Ingresando...';try{if(await pb.authWithPassword(e,t),!pb.currentUser.active){pb.logout(),a.textContent="Usuario inactivo. Contacta al administrador.",a.classList.remove("hidden");return}Rs()}catch(n){a.textContent=n.status===400?"Correo o contraseña incorrectos.":`Error: ${n.message}`,a.classList.remove("hidden")}finally{o.disabled=!1,o.innerHTML='<i class="fas fa-arrow-right-to-bracket"></i> Ingresar'}}async function Gc(){pb.logout(),Io()}function Io(){var t;$$(".screen").forEach(a=>a.classList.remove("active"));const e=$("#screen-login");e.style.display="",e.classList.add("active"),setInputVal("login-email",""),setInputVal("login-pass",""),$("#login-pass")&&($("#login-pass").value=""),(t=$("#login-error"))==null||t.classList.add("hidden"),$("#login-server-url").textContent=window.location.host}async function Rs(){const e=pb.currentUser;if(!e){Io();return}$("#sidebar-username").textContent=e.full_name||e.email,$("#sidebar-role").textContent=roleLabel(e.role??"viewer"),$("#sidebar-avatar").textContent=(e.full_name||e.email).charAt(0).toUpperCase(),$("#nav-auditoria")&&($("#nav-auditoria").style.display=Ka("canViewAudit")?"":"none"),$("#nav-usuarios")&&($("#nav-usuarios").style.display=Ka("canManageUsers")?"":"none");const t=await API.getSetting("company_name");$("#topbar-company").textContent=t,$("#topbar-date").textContent=new Date().toLocaleDateString("es-CO",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),$$(".screen").forEach(a=>{a.classList.remove("active"),a.style.display=""}),$("#screen-app").style.display="flex",$("#screen-app").classList.add("active"),navigate("dashboard")}function qc(){var a;const e=$("#login-pass"),t=(a=$("#btn-toggle-pass"))==null?void 0:a.querySelector("i");e&&(e.type==="password"?(e.type="text",t&&(t.className="fas fa-eye-slash")):(e.type="password",t&&(t.className="fas fa-eye")))}let ga=null;function zc(){ga&&clearInterval(ga),ga=setInterval(async()=>{const e=await pb.ping(),t=$("#conn-indicator");if(!t)return;const a=t.querySelector("div"),o=t.querySelector("span");e?(a.className="w-2 h-2 rounded-full bg-green-400",o.textContent="En linea"):(a.className="w-2 h-2 rounded-full bg-red-400",o.textContent="Sin conexion")},15e3)}window.can=Ka;window.PERMISSIONS=Ds;window.showLogin=Io;window.requireRole=jc;window.doLogout=Gc;window.startConnCheck=zc;window.doLogin=Hc;window.showApp=Rs;window.togglePassVisibility=qc;window._connCheckInterval=ga;const Os={dashboard:"Dashboard","plan-cuentas":"Plan de Cuentas",terceros:"Terceros","tipos-tx":"Tipos de Transacción","nueva-tx":"Transacciones","consulta-tx":"Consulta de Transacciones",reportes:"Reportes",auditoria:"Auditoría",usuarios:"Usuarios",configuracion:"Configuración",utilidades:"Utilidades",conciliacion:"Conciliación Bancaria",copropiedades:"Copropiedades",nomina:"Nómina","facturacion-dian":"Facturación Electrónica DIAN",cierre:"Cierre Contable",productos:"Productos y Servicios",inventario:"Inventarios",compras:"Compras de Bienes y Servicios",tesoreria:"Tesorería"},Qa={dashboard:()=>typeof renderDashboard=="function"&&renderDashboard($("#page-content")),"plan-cuentas":()=>typeof renderPlanCuentas=="function"&&renderPlanCuentas($("#page-content")),terceros:()=>typeof renderTerceros=="function"&&renderTerceros($("#page-content")),"tipos-tx":()=>typeof renderTiposTx=="function"&&renderTiposTx($("#page-content")),"nueva-tx":()=>Ms("consulta-tx"),"consulta-tx":()=>typeof renderConsultaTx=="function"&&renderConsultaTx($("#page-content")),reportes:()=>typeof renderReportes=="function"&&renderReportes($("#page-content")),auditoria:()=>typeof renderAuditoria=="function"&&renderAuditoria($("#page-content")),usuarios:()=>typeof renderUsuarios=="function"&&renderUsuarios($("#page-content")),configuracion:()=>typeof renderConfiguracion=="function"&&renderConfiguracion($("#page-content")),utilidades:()=>typeof renderUtilidades=="function"&&renderUtilidades($("#page-content")),conciliacion:()=>typeof renderConciliacion=="function"&&renderConciliacion($("#page-content")),nomina:()=>typeof renderNomina=="function"&&renderNomina($("#page-content")),"facturacion-dian":()=>typeof renderFacturacionDIAN=="function"&&renderFacturacionDIAN($("#page-content")),cierre:()=>typeof renderCierre=="function"&&renderCierre($("#page-content")),productos:()=>typeof renderProductos=="function"&&renderProductos($("#page-content")),inventario:()=>typeof renderInventario=="function"&&renderInventario($("#page-content")),compras:()=>typeof renderCompras=="function"&&renderCompras($("#page-content")),copropiedades:()=>typeof renderCopropiedades=="function"&&renderCopropiedades($("#page-content")),tesoreria:()=>typeof showTesoreriaScreen=="function"&&showTesoreriaScreen($("#page-content"))};let ks="dashboard";function Ms(e){var a;if(Qa[e]||(e="dashboard"),e==="usuarios"&&!can("canManageUsers")){showToast("No tienes permiso para acceder a esta sección","error");return}if(e==="auditoria"&&!can("canViewAudit")){showToast("No tienes permiso para acceder a esta sección","error");return}ks=e,$$("#nav-menu .nav-item").forEach(o=>o.classList.toggle("active",o.dataset.page===e)),$("#page-title").textContent=Os[e]??e,(a=$("#sidebar"))==null||a.classList.remove("open");const t=$("#page-content");t&&(t.scrollTop=0);try{Qa[e]()}catch(o){console.error(`[Router] Error renderizando ${e}:`,o),t&&(t.innerHTML=`
        <div class="flex flex-col items-center justify-center" style="height:60vh;gap:16px">
          <i class="fas fa-circle-exclamation text-4xl" style="color:#EF4444"></i>
          <p class="font-semibold" style="color:#374151">Error al cargar el módulo</p>
          <p class="text-sm" style="color:#9CA3AF">${esc(o.message)}</p>
          <button class="btn btn-outline" onclick="navigate('${e}')"><i class="fas fa-rotate-right"></i> Reintentar</button>
        </div>`)}}window.PAGE_RENDERERS=Qa;window.currentPage=ks;window.PAGE_TITLES=Os;window.navigate=Ms;async function Wc(e){e.innerHTML=`
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      ${["#EEF4FF","#FFF8F0","#ECFDF5","#FEF2F2"].map(t=>`
        <div class="rounded-2xl p-4 anim-slide-up" style="background:${t}">
          <div class="h-3 w-20 rounded mb-3" style="background:#E5E7EB;animation:pulse 1.5s ease infinite"></div>
          <div class="h-7 w-28 rounded" style="background:#E5E7EB;animation:pulse 1.5s ease infinite"></div>
        </div>`).join("")}
    </div>`;try{const[t,a]=await Promise.all([API.getDashboardKpis(),API.getAccountSaldos()]),o=await API.getAccounts();let s=0,n=0,i=0,c=0;for(const l of o){const p=a[l.id]??0,f=l.code.charAt(0);f==="1"?s+=p:f==="2"?n+=Math.abs(p):f==="4"?i+=Math.abs(p):(f==="5"||f==="6"||f==="7")&&(c+=p)}const r=await API.getTransactions({page:1,perPage:8});e.innerHTML=`
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      <div class="rounded-2xl p-4 anim-slide-up" style="background:#EEF4FF;animation-delay:.05s">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-building text-sm" style="color:#1A4B8C"></i>
          <span class="text-xs font-semibold" style="color:#1A4B8C">Total Activos</span>
        </div>
        <p class="text-2xl font-extrabold" style="color:#1A4B8C">${fmt(s)}</p>
        <p class="text-xs mt-1" style="color:#1A4B8C;opacity:.7">${fmtN(t.totalAc)} cuentas activas</p>
      </div>
      <div class="rounded-2xl p-4 anim-slide-up" style="background:#FFF8F0;animation-delay:.1s">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-file-invoice-dollar text-sm" style="color:#C46516"></i>
          <span class="text-xs font-semibold" style="color:#C46516">Total Pasivos</span>
        </div>
        <p class="text-2xl font-extrabold" style="color:#C46516">${fmt(n)}</p>
        <p class="text-xs mt-1" style="color:#C46516;opacity:.7">Patrimonio: ${fmt(s-n)}</p>
      </div>
      <div class="rounded-2xl p-4 anim-slide-up" style="background:#ECFDF5;animation-delay:.15s">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-arrow-trend-up text-sm" style="color:#059669"></i>
          <span class="text-xs font-semibold" style="color:#059669">Ingresos del Período</span>
        </div>
        <p class="text-2xl font-extrabold" style="color:#059669">${fmt(i)}</p>
        <p class="text-xs mt-1" style="color:#059669;opacity:.7">Gastos: ${fmt(c)}</p>
      </div>
      <div class="rounded-2xl p-4 anim-slide-up" style="background:#FEF2F2;animation-delay:.2s">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-receipt text-sm" style="color:#DC2626"></i>
          <span class="text-xs font-semibold" style="color:#DC2626">Transacciones</span>
        </div>
        <p class="text-2xl font-extrabold" style="color:#DC2626">${fmtN(t.totalTx)}</p>
        <p class="text-xs mt-1" style="color:#DC2626;opacity:.7">${fmtN(t.totalTp)} terceros registrados</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div class="xl:col-span-2 bg-white rounded-2xl border overflow-hidden anim-slide-up" style="border-color:#F0F0F0;animation-delay:.25s">
        <div class="flex items-center justify-between p-5 pb-3">
          <h3 class="font-bold text-sm" style="color:#0D2137">Últimas Transacciones</h3>
          <button class="btn btn-outline btn-sm" onclick="navigate('consulta-tx')"><i class="fas fa-arrow-right"></i> Ver todas</button>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Tipo / N.°</th><th>Fecha</th><th>Descripción</th><th>Tercero</th></tr></thead>
            <tbody>${r.items.length?r.items.map(l=>{var p,f,m,d;return`
              <tr class="cursor-pointer" onclick="viewTransaction('${esc(l.id)}')">
                <td><span class="font-semibold" style="color:#E87D1E">${esc(((f=(p=l.expand)==null?void 0:p.tx_type_id)==null?void 0:f.prefix)??"")}-${esc(l.number)}</span></td>
                <td>${esc(l.date)}</td>
                <td class="max-w-xs truncate">${esc(l.description??"—")}</td>
                <td>${esc(((d=(m=l.expand)==null?void 0:m.third_party_id)==null?void 0:d.name)??"—")}</td>
              </tr>`}).join(""):'<tr><td colspan="4" class="text-center py-8" style="color:#9CA3AF">No hay transacciones registradas</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-5 anim-slide-up" style="border-color:#F0F0F0;animation-delay:.3s">
        <h3 class="font-bold text-sm mb-4" style="color:#0D2137">Acciones Rápidas</h3>
        <div class="flex flex-col gap-3">
          ${can("canWrite")?`<button onclick="navigate('nueva-tx')" class="btn btn-primary w-full justify-center"><i class="fas fa-plus"></i> Nueva Transacción</button>`:""}
          <button onclick="navigate('plan-cuentas')" class="btn btn-secondary w-full justify-center"><i class="fas fa-sitemap"></i> Plan de Cuentas</button>
          ${can("canWrite")?`<button onclick="navigate('terceros')" class="btn btn-outline w-full justify-center"><i class="fas fa-user-plus"></i> Gestionar Terceros</button>`:""}
          <button onclick="navigate('reportes')" class="btn btn-outline w-full justify-center"><i class="fas fa-chart-pie"></i> Generar Reportes</button>
        </div>
        <div class="mt-6 p-4 rounded-xl" style="background:linear-gradient(135deg,#0D2137,#1A4B8C)">
          <p class="text-xs font-bold mb-1" style="color:rgba(255,255,255,.6)">RESULTADO DEL PERIODO</p>
          <p class="text-xl font-extrabold text-white">${fmt(i-c)}</p>
          <p class="text-xs mt-1" style="color:rgba(255,255,255,.5)">Ingresos − Gastos − Costos</p>
        </div>
      </div>
    </div>`}catch(t){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(t.message)}</div>`}}async function Yc(e){navigate("consulta-tx"),setTimeout(()=>{typeof seeTxDetail=="function"&&seeTxDetail(e)},120)}window.renderDashboard=Wc;window.viewTransaction=Yc;async function So(e){var t,a,o,s;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando plan de cuentas...</div>';try{const[n,i]=await Promise.all([API.getAccounts(!1),pb.listAll("account_types",{sort:"code"})]),c=n.map(l=>{var m;const p=(m=l.expand)==null?void 0:m.account_type_id,f=l.active?'<span class="badge badge-green">Activa</span>':'<span class="badge badge-gray">Inactiva</span>';return`
      <tr data-code="${esc(l.code)}" data-name="${esc(l.name.toLowerCase())}">
        <td><span class="font-semibold" style="color:#1A4B8C">${esc(l.code)}</span></td>
        <td>${esc(l.name)}</td>
        <td>${esc((p==null?void 0:p.name)??"?")}</td>
        <td>${esc(l.parent_code||"?")}</td>
        <td>${l.requires_third_party?'<span class="badge badge-orange">Sí</span>':"No"}</td>
        <td>${f}</td>
        <td>
          <div class="flex gap-2">
            ${can("canWrite")?`<button class="btn btn-outline btn-sm" onclick="editAccount('${esc(l.id)}')"><i class="fas fa-pen"></i></button>`:""}
            ${can("canDelete")?`<button class="btn btn-danger btn-sm" onclick="toggleAccountActive('${esc(l.id)}', ${l.active?"false":"true"})"><i class="fas ${l.active?"fa-ban":"fa-rotate-left"}"></i></button>`:""}
          </div>
        </td>
      </tr>`}).join("");e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Plan de Cuentas</h3>
          <p class="text-sm" style="color:#6B7280">Administra cuentas PUC, naturaleza y estado.</p>
        </div>
        ${can("canWrite")?`
          <div class="flex gap-2">
            <button class="btn btn-primary" id="btn-new-account"><i class="fas fa-plus"></i> Nueva Cuenta</button>
          </div>`:""}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
           <input id="acct-q" class="form-input" placeholder="Buscar por código o nombre...">
          <select id="acct-type" class="form-input">
            <option value="">Todos los tipos</option>
            ${i.map(l=>`<option value="${esc(l.id)}">${esc(l.code)} - ${esc(l.name)}</option>`).join("")}
          </select>
          <select id="acct-status" class="form-input">
            <option value="">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 290px)">
          <table class="data-table" id="accounts-table">
            <thead>
              <tr>
                 <th>Código</th><th>Nombre</th><th>Tipo</th><th>Código Padre</th><th>Req. Tercero</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>${c||'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay cuentas registradas.</td></tr>'}</tbody>
          </table>
        </div>
      </div>`;const r=()=>{const l=getInputVal("acct-q").toLowerCase(),p=getSelectVal("acct-type"),f=getSelectVal("acct-status");$$("#accounts-table tbody tr").forEach(m=>{var _,A,C,T,N,I,S,w;const d=((A=(_=m.children[0])==null?void 0:_.textContent)==null?void 0:A.toLowerCase())||"",b=((T=(C=m.children[1])==null?void 0:C.textContent)==null?void 0:T.toLowerCase())||"",u=((N=m.children[2])==null?void 0:N.textContent)||"",y=(((I=m.children[5])==null?void 0:I.textContent)||"").includes("Activa"),v=!l||d.includes(l)||b.includes(l),g=!p||u.includes(((w=(S=$(`#acct-type option[value="${p}"]`))==null?void 0:S.textContent)==null?void 0:w.split(" - ")[0])||""),h=!f||(f==="active"?y:!y);m.style.display=v&&g&&h?"":"none"})};(t=$("#acct-q"))==null||t.addEventListener("input",debounce(r,200)),(a=$("#acct-type"))==null||a.addEventListener("change",r),(o=$("#acct-status"))==null||o.addEventListener("change",r),(s=$("#btn-new-account"))==null||s.addEventListener("click",()=>No(i))}catch(n){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(n.message)}</div>`}}async function No(e,t=null){var a,o;if(!can("canWrite"))return showToast("No tienes permisos para crear/editar cuentas","error");e||(e=await pb.listAll("account_types",{sort:"code"})),openModal(t?"Editar Cuenta":"Nueva Cuenta",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Código</label><input id="ac-code" class="form-input" value="${esc((t==null?void 0:t.code)||"")}"></div>
      <div class="form-group"><label class="form-label">Nombre</label><input id="ac-name" class="form-input" value="${esc((t==null?void 0:t.name)||"")}"></div>
      <div class="form-group"><label class="form-label">Tipo de Cuenta</label>
        <select id="ac-type" class="form-input">${e.map(s=>`<option value="${esc(s.id)}" ${(t==null?void 0:t.account_type_id)===s.id?"selected":""}>${esc(s.code)} - ${esc(s.name)}</option>`).join("")}</select>
      </div>
      <div class="form-group"><label class="form-label">Naturaleza</label>
        <select id="ac-nature" class="form-input">
           <option value="debit" ${(t==null?void 0:t.nature)==="debit"?"selected":""}>Débito</option>
           <option value="credit" ${(t==null?void 0:t.nature)==="credit"?"selected":""}>Crédito</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Nivel</label><input id="ac-level" type="number" min="1" max="6" class="form-input" value="${esc((t==null?void 0:t.level)??1)}"></div>
      <div class="form-group"><label class="form-label">Código Padre</label><input id="ac-parent" class="form-input" value="${esc((t==null?void 0:t.parent_code)||"")}"></div>
      <div class="form-group"><label class="form-label">¿Requiere Tercero?</label><select id="ac-third" class="form-input"><option value="0" ${t!=null&&t.requires_third_party?"":"selected"}>No</option><option value="1" ${t!=null&&t.requires_third_party?"selected":""}>Sí</option></select></div>
      <div class="form-group"><label class="form-label">Estado</label><select id="ac-active" class="form-input"><option value="1" ${(t==null?void 0:t.active)!==!1?"selected":""}>Activa</option><option value="0" ${(t==null?void 0:t.active)===!1?"selected":""}>Inactiva</option></select></div>
    </div>
    <hr class="my-3" style="border-color:#F0F0F0">
    <p class="text-xs font-semibold mb-2" style="color:#6B7280;text-transform:uppercase;letter-spacing:.05em">Comportamiento contable</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="ac-cruce" ${t!=null&&t.maneja_cruce?"checked":""} class="w-4 h-4" style="accent-color:#1A4B8C">
          <span class="form-label mb-0">Maneja documento de cruce <span class="text-xs" style="color:#6B7280">(CxP / CxC)</span></span>
        </label>
      </div>
      <div class="form-group">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="ac-ret" ${t!=null&&t.maneja_retenciones?"checked":""} class="w-4 h-4" style="accent-color:#D97706" onchange="toggleRetTypes()">
          <span class="form-label mb-0">Maneja retenciones</span>
        </label>
      </div>
      <div id="ret-types-wrap" class="md:col-span-2 ${t!=null&&t.maneja_retenciones?"":"hidden"}">
        <p class="text-xs mb-2" style="color:#6B7280">Selecciona los tipos de retención que aplican:</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #FDE68A">
            <label class="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" id="ac-reterenta" ${((t==null?void 0:t.tipos_retencion)||"").includes("reterenta")?"checked":""} class="w-4 h-4" style="accent-color:#D97706" onchange="toggleRetRateInputs()">
              <span class="text-sm font-semibold">Reterenta</span>
            </label>
            <input id="ac-rate-reterenta" type="number" min="0" step="0.001" class="form-input" placeholder="%" value="${esc((t==null?void 0:t.ret_rate_reterenta)??"")}">
          </div>
          <div class="p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #FDE68A">
            <label class="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" id="ac-reteiva" ${((t==null?void 0:t.tipos_retencion)||"").includes("reteiva")?"checked":""} class="w-4 h-4" style="accent-color:#D97706" onchange="toggleRetRateInputs()">
              <span class="text-sm font-semibold">Reteiva</span>
            </label>
            <input id="ac-rate-reteiva" type="number" min="0" step="0.001" class="form-input" placeholder="%" value="${esc((t==null?void 0:t.ret_rate_reteiva)??"")}">
          </div>
          <div class="p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #FDE68A">
            <label class="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" id="ac-reteica" ${((t==null?void 0:t.tipos_retencion)||"").includes("reteica")?"checked":""} class="w-4 h-4" style="accent-color:#D97706" onchange="toggleRetRateInputs()">
              <span class="text-sm font-semibold">Reteica</span>
            </label>
            <input id="ac-rate-reteica" type="number" min="0" step="0.001" class="form-input" placeholder="%" value="${esc((t==null?void 0:t.ret_rate_reteica)??"")}">
          </div>
        </div>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-account"><i class="fas fa-floppy-disk"></i> Guardar</button>`),window.toggleRetTypes=()=>{var i,c;const s=(i=document.getElementById("ac-ret"))==null?void 0:i.checked,n=document.getElementById("ret-types-wrap");n&&n.classList.toggle("hidden",!s),(c=window.toggleRetRateInputs)==null||c.call(window)},window.toggleRetRateInputs=()=>{var i;const s=[["ac-reterenta","ac-rate-reterenta"],["ac-reteiva","ac-rate-reteiva"],["ac-reteica","ac-rate-reteica"]],n=!!((i=document.getElementById("ac-ret"))!=null&&i.checked);s.forEach(([c,r])=>{const l=document.getElementById(c),p=document.getElementById(r);if(!l||!p)return;const f=n&&l.checked;p.disabled=!f,f||(p.value="")})},(a=window.toggleRetRateInputs)==null||a.call(window),(o=$("#btn-save-account"))==null||o.addEventListener("click",async()=>{var p,f,m,d,b;const s=!!((p=document.getElementById("ac-ret"))!=null&&p.checked),n=[];s&&((f=document.getElementById("ac-reterenta"))!=null&&f.checked&&n.push("reterenta"),(m=document.getElementById("ac-reteiva"))!=null&&m.checked&&n.push("reteiva"),(d=document.getElementById("ac-reteica"))!=null&&d.checked&&n.push("reteica"));const i=parseFloat(getInputVal("ac-rate-reterenta")),c=parseFloat(getInputVal("ac-rate-reteiva")),r=parseFloat(getInputVal("ac-rate-reteica")),l={code:getInputVal("ac-code"),name:getInputVal("ac-name"),account_type_id:getSelectVal("ac-type"),nature:getSelectVal("ac-nature"),level:Number(getInputVal("ac-level")||1),parent_code:getInputVal("ac-parent"),requires_third_party:getSelectVal("ac-third")==="1",active:getSelectVal("ac-active")==="1",maneja_cruce:!!((b=document.getElementById("ac-cruce"))!=null&&b.checked),maneja_retenciones:s,tipos_retencion:n.join(","),ret_rate_reterenta:Number.isFinite(i)?i:0,ret_rate_reteiva:Number.isFinite(c)?c:0,ret_rate_reteica:Number.isFinite(r)?r:0};if(!l.code||!l.name||!l.account_type_id)return showToast("Completa código, nombre y tipo de cuenta","warning");if(!/^\d+$/.test(l.code))return showToast("El código de cuenta debe ser numérico","warning");if(l.parent_code&&!/^\d+$/.test(l.parent_code))return showToast("El código padre debe ser numérico","warning");if(l.parent_code&&l.parent_code===l.code)return showToast("Una cuenta no puede ser su propia cuenta padre","warning");if(s&&!n.length)return showToast("Selecciona al menos un tipo de retención","warning");if(s){if(n.includes("reterenta")&&l.ret_rate_reterenta<=0)return showToast("Ingresa un porcentaje válido para Reterenta","warning");if(n.includes("reteiva")&&l.ret_rate_reteiva<=0)return showToast("Ingresa un porcentaje válido para Reteiva","warning");if(n.includes("reteica")&&l.ret_rate_reteica<=0)return showToast("Ingresa un porcentaje válido para Reteica","warning")}try{if(l.parent_code){const u=await pb.list("accounts",{filter:`code="${l.parent_code}"`,perPage:1});if(!u.items.length)return showToast("El código padre no existe","error");const y=u.items[0];if(Number(y.level||1)>=Number(l.level||1))return showToast("El nivel de la cuenta hija debe ser mayor al nivel de la cuenta padre","warning")}if(t!=null&&t.id)await pb.update("accounts",t.id,l),await API.logAudit("UPDATE","Cuenta",t.id,`${l.code} - ${l.name}`);else{const u=await pb.create("accounts",l);await API.logAudit("CREATE","Cuenta",u.id,`${l.code} - ${l.name}`)}closeModal(),showToast("Cuenta guardada correctamente","success"),So($("#page-content"))}catch(u){showToast(u.message,"error")}})}async function Jc(e){try{const[t,a]=await Promise.all([pb.get("accounts",e),pb.listAll("account_types",{sort:"code"})]);No(a,t)}catch(t){showToast(t.message,"error")}}function Kc(e,t){if(!can("canDelete"))return showToast("No tienes permisos para cambiar estado","error");confirmDialog(t?"Reactivar cuenta":"Inactivar cuenta",t?"¿Deseas reactivar esta cuenta?":"¿Deseas inactivar esta cuenta?",async()=>{try{if(!t){const o=await pb.get("accounts",e);if((await pb.list("accounts",{filter:`parent_code="${o.code}" && active=true`,perPage:1})).totalItems>0)return showToast("No puedes inactivar una cuenta que tiene subcuentas activas","error");if((await pb.list("tx_lines",{filter:`account_id="${e}"`,perPage:1})).totalItems>0)return showToast("No puedes inactivar una cuenta con movimientos contables asociados","error")}await pb.update("accounts",e,{active:t});const a=await pb.get("accounts",e);await API.logAudit("STATUS","Cuenta",e,`${a.code} - ${a.name} => ${t?"Activa":"Inactiva"}`),showToast("Estado actualizado","success"),So($("#page-content"))}catch(a){showToast(a.message,"error")}})}window.openAccountForm=No;window.editAccount=Jc;window.renderPlanCuentas=So;window.toggleAccountActive=Kc;async function Lo(e){var t,a,o,s,n;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando terceros...</div>';try{const i=await pb.listAll("third_parties",{sort:"name"}),c=p=>p==="JURIDICA"?'<span class="badge badge-blue"><i class="fas fa-building mr-1"></i>Jurídica</span>':p==="GRAN_CONTRIBUYENTE"?'<span class="badge badge-orange"><i class="fas fa-landmark mr-1"></i>Gran Contr.</span>':'<span class="badge badge-gray"><i class="fas fa-user mr-1"></i>Natural</span>',r=p=>{var d;const f={CLIENTE:"badge-green",PROVEEDOR:"badge-blue",EMPLEADO:"badge-orange",ACREEDOR:"badge-gray",TRANSPORTISTA:"badge-blue",OTRO:"badge-gray"},m=((d=TP_TYPES.find(b=>b.code===p))==null?void 0:d.name)??p;return`<span class="badge ${f[p]??"badge-gray"}">${esc(m)}</span>`};e.innerHTML=`
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Terceros</h3>
        <p class="text-sm" style="color:#6B7280">Clientes, proveedores, empleados y más.</p>
      </div>
      ${can("canWrite")?'<button class="btn btn-primary" id="btn-new-tp"><i class="fas fa-user-plus"></i> Nuevo Tercero</button>':""}
    </div>

    <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input id="tp-q" class="form-input" placeholder="Buscar por nombre, NIT o correo...">
        <select id="tp-person" class="form-input">
          <option value="">Todos los tipos de persona</option>
          ${PERSON_TYPES.map(p=>`<option value="${esc(p.code)}">${esc(p.name)}</option>`).join("")}
        </select>
        <select id="tp-type" class="form-input">
          <option value="">Todos los roles</option>
          ${TP_TYPES.map(p=>`<option value="${esc(p.code)}">${esc(p.name)}</option>`).join("")}
        </select>
        <select id="tp-status" class="form-input">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto" style="max-height: calc(100vh - 310px)">
        <table class="data-table" id="tp-table">
          <thead>
            <tr>
              <th>Persona</th><th>Documento</th><th>Nombre / Razón Social</th>
              <th>Correo</th><th>Ciudad</th><th>Rol</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${i.length?i.map(p=>`
              <tr data-type="${esc(p.type)}" data-person="${esc(p.person_type||"NATURAL")}">
                <td>${c(p.person_type)}</td>
                <td><span class="font-semibold">${esc(p.doc_type)} ${esc(p.doc_number)}${p.dv?`-${esc(p.dv)}`:""}</span></td>
                <td>${esc(p.name)}</td>
                <td>${esc(p.email||"—")}</td>
                <td>${esc(p.city||"—")}</td>
                <td>${r(p.type)}</td>
                <td>${p.active?'<span class="badge badge-green">Activo</span>':'<span class="badge badge-gray">Inactivo</span>'}</td>
                <td>
                  <div class="flex gap-2">
                    ${can("canWrite")?`<button class="btn btn-outline btn-sm" onclick="editTercero('${esc(p.id)}')"><i class="fas fa-pen"></i></button>`:""}
                    ${can("canDelete")?`<button class="btn btn-danger btn-sm" onclick="toggleTercero('${esc(p.id)}', ${p.active?"false":"true"})"><i class="fas ${p.active?"fa-ban":"fa-rotate-left"}"></i></button>`:""}
                  </div>
                </td>
              </tr>`).join(""):'<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No hay terceros registrados.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;const l=()=>{var b,u,y,v;const p=(((b=$("#tp-q"))==null?void 0:b.value)??"").toLowerCase(),f=((u=$("#tp-person"))==null?void 0:u.value)??"",m=((y=$("#tp-type"))==null?void 0:y.value)??"",d=((v=$("#tp-status"))==null?void 0:v.value)??"";$$("#tp-table tbody tr").forEach(g=>{var _;const h=(_=g.children[6])==null?void 0:_.textContent.includes("Activo");g.style.display=(!p||g.textContent.toLowerCase().includes(p))&&(!f||(g.dataset.person||"")===f)&&(!m||(g.dataset.type||"")===m)&&(!d||(d==="active"?h:!h))?"":"none"})};(t=$("#tp-q"))==null||t.addEventListener("input",debounce(l,200)),(a=$("#tp-person"))==null||a.addEventListener("change",l),(o=$("#tp-type"))==null||o.addEventListener("change",l),(s=$("#tp-status"))==null||s.addEventListener("change",l),(n=$("#btn-new-tp"))==null||n.addEventListener("click",()=>Do())}catch(i){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(i.message)}</div>`}}function Bs(e){const t=(e==null?void 0:e.person_type)||"NATURAL",a=t==="NATURAL",o=(e==null?void 0:e.country)||"CO",s=o==="CO",n=(e==null?void 0:e.dept_code)||"",i=(e==null?void 0:e.department)||"",c=COL_DEPTS.find(l=>l.code===n||l.name===i),r=[{code:"NATURAL",label:"Persona Natural",icon:"fa-user"},{code:"JURIDICA",label:"Persona Jurídica",icon:"fa-building"},{code:"GRAN_CONTRIBUYENTE",label:"Gran Contribuyente",icon:"fa-landmark"}];return`
  <!-- ── Tabs nav ─────────────────────────────────────────────── -->
  <div id="tpf-tab-nav"
    style="display:flex;border-bottom:2px solid #E5E7EB;margin:-4px -4px 16px;overflow-x:auto">
    ${["Identificación","Nombre y Contacto","Ubicación","Crédito"].map((l,p)=>`
      <button type="button" id="tpf-tab-${p}" onclick="_tpfSwitchTab(${p})"
        style="padding:10px 14px;border:none;background:none;cursor:pointer;font-size:13px;
               white-space:nowrap;margin-bottom:-2px;
               border-bottom:2px solid ${p===0?"#E87D1E":"transparent"};
               color:${p===0?"#E87D1E":"#6B7280"};font-weight:${p===0?"600":"400"}">
        ${l}
      </button>`).join("")}
  </div>

  <!-- ══ TAB 0 — Identificación ══════════════════════════════════ -->
  <div id="tpf-panel-0">
    <p class="form-label mb-2">Tipo de Persona <span style="color:#EF4444">*</span></p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${r.map(l=>`
        <label style="display:flex;align-items:center;gap:8px;padding:10px 14px;
               border:2px solid ${t===l.code?"#E87D1E":"#E5E7EB"};border-radius:10px;
               cursor:pointer;flex:1;min-width:130px;
               background:${t===l.code?"#FFF7F0":"#FAFAFA"}">
          <input type="radio" name="tpf-person-type-r" value="${l.code}"
            ${t===l.code?"checked":""} style="accent-color:#E87D1E">
          <i class="fas ${l.icon}"
            style="color:${t===l.code?"#E87D1E":"#9CA3AF"};font-size:15px"></i>
          <span style="font-size:13px;font-weight:${t===l.code?"600":"400"};
                       color:${t===l.code?"#E87D1E":"#374151"}">${l.label}</span>
        </label>`).join("")}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Tipo Tercero <span style="color:#EF4444">*</span></label>
        <select id="tpf-type" class="form-input">
          ${TP_TYPES.map(l=>`<option value="${esc(l.code)}" ${(e==null?void 0:e.type)===l.code?"selected":""}>${esc(l.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="tpf-active" class="form-input">
          <option value="1" ${(e==null?void 0:e.active)!==!1?"selected":""}>Activo</option>
          <option value="0" ${(e==null?void 0:e.active)===!1?"selected":""}>Inactivo</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de Documento <span style="color:#EF4444">*</span></label>
        <select id="tpf-doc-type" class="form-input">
          ${DOC_TYPES.map(l=>`<option value="${esc(l.code)}" ${(e==null?void 0:e.doc_type)===l.code?"selected":""}>${esc(l.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Número de Documento <span style="color:#EF4444">*</span></label>
        <input id="tpf-doc-number" class="form-input" value="${esc((e==null?void 0:e.doc_number)||"")}"
          placeholder="Ej: 900123456" inputmode="numeric">
      </div>
      <div class="form-group" id="tpf-dv-wrap" style="${(e==null?void 0:e.doc_type)==="NIT"?"":"display:none"}">
        <label class="form-label">Dígito de Verificación (DV)
          <span style="font-size:11px;color:#9CA3AF;font-weight:400"> — calculado automáticamente</span>
        </label>
        <input id="tpf-dv" class="form-input" value="${esc((e==null?void 0:e.dv)||"")}" readonly
          style="background:#F9FAFB;font-size:22px;font-weight:700;text-align:center;
                 letter-spacing:6px;color:#E87D1E;max-width:100px">
      </div>
      <div class="form-group">
        <label class="form-label">Régimen Tributario</label>
        <select id="tpf-tax" class="form-input">
          <option value="">Sin especificar</option>
          ${TAX_REGIMES.map(l=>`<option value="${esc(l.code)}" ${(e==null?void 0:e.tax_regime)===l.code?"selected":""}>${esc(l.name)}</option>`).join("")}
        </select>
      </div>
    </div>
  </div>

  <!-- ══ TAB 1 — Nombre y Contacto ════════════════════════════════ -->
  <div id="tpf-panel-1" style="display:none">
    <!-- Persona Natural -->
    <div id="tpf-section-natural" style="${a?"":"display:none"}">
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;margin-bottom:10px">
        Nombre de la persona</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="form-group">
          <label class="form-label">Nombres <span style="color:#EF4444">*</span></label>
          <input id="tpf-first-name" class="form-input" value="${esc((e==null?void 0:e.first_name)||"")}"
            placeholder="JOSE ALVEIRO" style="text-transform:uppercase">
        </div>
        <div class="form-group">
          <label class="form-label">Apellidos <span style="color:#EF4444">*</span></label>
          <input id="tpf-last-name" class="form-input" value="${esc((e==null?void 0:e.last_name)||"")}"
            placeholder="GALLEGO PÉREZ" style="text-transform:uppercase">
        </div>
      </div>
    </div>
    <!-- Persona Jurídica / Gran Contribuyente -->
    <div id="tpf-section-juridica" style="${a?"display:none":""}">
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;margin-bottom:10px">
        Razón social</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="form-group md:col-span-2">
          <label class="form-label">Razón Social <span style="color:#EF4444">*</span></label>
          <input id="tpf-business-name" class="form-input" value="${esc((e==null?void 0:e.business_name)||"")}"
            placeholder="CERAMICAS CONSTRUHOGAR S.A.S." style="text-transform:uppercase">
        </div>
        <div class="form-group md:col-span-2">
          <label class="form-label">Nombre Comercial</label>
          <input id="tpf-commercial-name" class="form-input" value="${esc((e==null?void 0:e.commercial_name)||"")}"
            placeholder="Nombre que usa comercialmente" style="text-transform:uppercase">
        </div>
      </div>
    </div>
    <!-- Contacto -->
    <div style="border-top:1px solid #F0F0F0;padding-top:14px">
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;margin-bottom:10px">
        Información de contacto</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Nombre del Contacto</label>
          <input id="tpf-contact-name" class="form-input" value="${esc((e==null?void 0:e.contact_name)||"")}"
            placeholder="Persona de contacto en la empresa">
        </div>
        <div class="form-group">
          <label class="form-label">Asesor Comercial</label>
          <input id="tpf-advisor" class="form-input" value="${esc((e==null?void 0:e.advisor)||"")}"
            placeholder="Vendedor asignado">
        </div>
        <div class="form-group">
          <label class="form-label">Teléfono 1</label>
          <input id="tpf-phone" class="form-input" value="${esc((e==null?void 0:e.phone)||"")}"
            placeholder="Fijo o móvil" inputmode="tel">
        </div>
        <div class="form-group">
          <label class="form-label">Teléfono 2</label>
          <input id="tpf-phone2" class="form-input" value="${esc((e==null?void 0:e.phone2)||"")}"
            placeholder="Fijo o móvil alternativo" inputmode="tel">
        </div>
        <div class="form-group">
          <label class="form-label">Email 1
            <span style="font-size:11px;color:#3B82F6;font-weight:400">
              <i class="fas fa-info-circle"></i> obligatorio para facturación electrónica
            </span>
          </label>
          <input id="tpf-email" type="email" class="form-input" value="${esc((e==null?void 0:e.email)||"")}"
            placeholder="correo@empresa.com">
        </div>
        <div class="form-group">
          <label class="form-label">Email 2</label>
          <input id="tpf-email2" type="email" class="form-input" value="${esc((e==null?void 0:e.email2)||"")}"
            placeholder="correo.alternativo@empresa.com">
        </div>
      </div>
    </div>
  </div>

  <!-- ══ TAB 2 — Ubicación ════════════════════════════════════════ -->
  <div id="tpf-panel-2" style="display:none">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- ── País ─────────────────────────────────────────── -->
      <div class="form-group md:col-span-2">
        <label class="form-label">País</label>
        <select id="tpf-country" class="form-input">
          <option value="">Seleccionar país...</option>
          ${GEO_PAISES.map(l=>`<option value="${esc(l.code)}" ${o===l.code?"selected":""}>${esc(l.name.charAt(0)+l.name.slice(1).toLowerCase())}</option>`).join("")}
        </select>
      </div>

      <!-- ── Sección Colombia ──────────────────────────────── -->
      <div id="tpf-section-colombia" class="md:col-span-2" style="${s?"":"display:none"}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Departamento -->
          <div class="form-group">
            <label class="form-label">Departamento <span style="color:#EF4444">*</span></label>
            <select id="tpf-dept-select" class="form-input">
              <option value="">Seleccionar departamento...</option>
              ${GEO_DEPTS.map(l=>`<option value="${esc(l.code)}" ${(c==null?void 0:c.code)===l.code?"selected":""}>${esc(l.name)}</option>`).join("")}
            </select>
          </div>
          <!-- Cód DANE Departamento (readonly, auto) -->
          <div class="form-group">
            <label class="form-label">Cód. DANE Departamento</label>
            <input id="tpf-dept-code" class="form-input" value="${esc((c==null?void 0:c.code)||n)}"
              readonly style="background:#F9FAFB;color:#6B7280;font-weight:600" placeholder="Auto">
          </div>
          <input type="hidden" id="tpf-department" value="${esc((c==null?void 0:c.name)||i)}">

          <!-- Ciudad / Municipio (cascada desde departamento) -->
          <div class="form-group">
            <label class="form-label">Ciudad / Municipio <span style="color:#EF4444">*</span></label>
            <select id="tpf-city-select" class="form-input">
              <option value="">— seleccione departamento primero —</option>
              ${c?geoMunisByDept(c.code).map(l=>`<option value="${esc(l.code)}" ${(e==null?void 0:e.city_code)===l.code?"selected":""}>${esc(l.name)}</option>`).join(""):""}
            </select>
          </div>
          <!-- Cód DANE Municipio (readonly, auto) -->
          <div class="form-group">
            <label class="form-label">Cód. DANE Municipio</label>
            <input id="tpf-city-code" class="form-input" value="${esc((e==null?void 0:e.city_code)||"")}"
              readonly style="background:#F9FAFB;color:#6B7280;font-weight:600" placeholder="Auto">
          </div>
          <input type="hidden" id="tpf-city" value="${esc((e==null?void 0:e.city)||"")}">
        </div>
      </div>

      <!-- Dirección -->
      <div class="form-group md:col-span-2">
        <label class="form-label">Dirección</label>
        <input id="tpf-address" class="form-input" value="${esc((e==null?void 0:e.address)||"")}"
          placeholder="CR 8 73-25" style="text-transform:uppercase">
      </div>
    </div>
  </div>

  <!-- ══ TAB 3 — Condiciones de Crédito ══════════════════════════ -->
  <div id="tpf-panel-3" style="display:none">
    <div style="background:#FFF7F0;border:1px solid #FDE8D4;border-radius:10px;
                padding:12px 16px;margin-bottom:16px">
      <p style="font-size:13px;color:#9A3412;margin:0">
        <i class="fas fa-circle-info mr-1"></i>
        Controla la venta a crédito. Con cupo <strong>0</strong> no se permite cartera.
        <em>Máximo de facturas</em> limita cuántas pueden quedar pendientes de cobro.
      </p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Cupo de Crédito (COP)</label>
        <input id="tpf-credit-limit" type="number" min="0" class="form-input"
          value="${esc((e==null?void 0:e.credit_limit)??0)}" placeholder="0">
      </div>
      <div class="form-group">
        <label class="form-label">Máximo de Facturas con Saldo</label>
        <input id="tpf-max-invoices" type="number" min="0" class="form-input"
          value="${esc((e==null?void 0:e.max_invoices)??1)}" placeholder="1">
      </div>
      <div class="form-group">
        <label class="form-label">Plazo de Crédito (días)</label>
        <input id="tpf-payment-days" type="number" min="0" class="form-input"
          value="${esc((e==null?void 0:e.payment_days)??0)}" placeholder="0">
      </div>
    </div>
  </div>
  `}function _t(e){for(let t=0;t<4;t++){const a=$(`#tpf-panel-${t}`),o=$(`#tpf-tab-${t}`);if(!a||!o)continue;const s=t===e;a.style.display=s?"":"none",o.style.borderBottomColor=s?"#E87D1E":"transparent",o.style.color=s?"#E87D1E":"#6B7280",o.style.fontWeight=s?"600":"400"}}function Po(){var e;return((e=document.querySelector('input[name="tpf-person-type-r"]:checked'))==null?void 0:e.value)||"NATURAL"}function Fo(){const e=Po(),t=e==="NATURAL",a=!t,o=$("#tpf-section-natural"),s=$("#tpf-section-juridica");if(o&&(o.style.display=t?"":"none"),s&&(s.style.display=a?"":"none"),$$('input[name="tpf-person-type-r"]').forEach(n=>{const i=n.value===e,c=n.closest("label");if(!c)return;c.style.borderColor=i?"#E87D1E":"#E5E7EB",c.style.background=i?"#FFF7F0":"#FAFAFA";const r=c.querySelector("i"),l=c.querySelector("span");r&&(r.style.color=i?"#E87D1E":"#9CA3AF"),l&&(l.style.color=i?"#E87D1E":"#374151",l.style.fontWeight=i?"600":"400")}),a){const n=$("#tpf-doc-type");n&&n.value!=="NIT"&&(n.value="NIT",Zt())}}function Zt(){const e=getSelectVal("tpf-doc-type"),t=$("#tpf-dv-wrap"),a=$("#tpf-dv");a&&(e==="NIT"?(t&&(t.style.display=""),a.value=calcDV(getInputVal("tpf-doc-number"))):(t&&(t.style.display="none"),a.value=""))}function Us(){const t=getSelectVal("tpf-country")==="CO",a=$("#tpf-section-colombia");if(a&&(a.style.display=t?"":"none"),!t){setInputVal("tpf-dept-code",""),setInputVal("tpf-department","");const o=$("#tpf-city-select");o&&(o.innerHTML='<option value="">—</option>'),setInputVal("tpf-city-code",""),setInputVal("tpf-city","")}}function Vs(){const e=getSelectVal("tpf-dept-select"),t=geoDept(e);setInputVal("tpf-dept-code",e),setInputVal("tpf-department",(t==null?void 0:t.name)||"");const a=$("#tpf-city-select");if(!a)return;const o=e?geoMunisByDept(e):[];a.innerHTML='<option value="">Seleccionar municipio...</option>'+o.map(s=>`<option value="${esc(s.code)}">${esc(s.name)}</option>`).join(""),setInputVal("tpf-city-code",""),setInputVal("tpf-city","")}function js(){const e=getSelectVal("tpf-city-select"),t=geoMuni(e);setInputVal("tpf-city-code",e),setInputVal("tpf-city",(t==null?void 0:t.name)||"")}function Hs(){var e,t,a,o,s;$$('input[name="tpf-person-type-r"]').forEach(n=>n.addEventListener("change",Fo)),(e=$("#tpf-doc-type"))==null||e.addEventListener("change",Zt),(t=$("#tpf-doc-number"))==null||t.addEventListener("input",Zt),(a=$("#tpf-country"))==null||a.addEventListener("change",Us),(o=$("#tpf-dept-select"))==null||o.addEventListener("change",Vs),["tpf-first-name","tpf-last-name","tpf-business-name","tpf-commercial-name","tpf-address"].forEach(n=>{const i=$(`#${n}`);i&&i.addEventListener("input",()=>{const c=i.selectionStart;i.value=i.value.toUpperCase(),i.setSelectionRange(c,c)})}),(s=$("#tpf-city-select"))==null||s.addEventListener("change",js)}function Gs(){const e=Po(),t=e==="NATURAL",a=getInputVal("tpf-first-name").toUpperCase(),o=getInputVal("tpf-last-name").toUpperCase(),s=getInputVal("tpf-business-name").toUpperCase(),n=getInputVal("tpf-commercial-name").toUpperCase(),i=t?[a,o].filter(Boolean).join(" "):s||n,c=getSelectVal("tpf-country")||"CO",r=c==="CO";return{person_type:e,type:getSelectVal("tpf-type"),doc_type:getSelectVal("tpf-doc-type"),doc_number:getInputVal("tpf-doc-number"),dv:getInputVal("tpf-dv"),first_name:a,last_name:o,business_name:s,commercial_name:n,name:i,contact_name:getInputVal("tpf-contact-name"),advisor:getInputVal("tpf-advisor"),phone:getInputVal("tpf-phone"),phone2:getInputVal("tpf-phone2"),email:getInputVal("tpf-email"),email2:getInputVal("tpf-email2"),country:c,department:r?getInputVal("tpf-department"):"",dept_code:r?getInputVal("tpf-dept-code"):"",city:r?getInputVal("tpf-city"):"",city_code:r?getInputVal("tpf-city-code"):"",address:getInputVal("tpf-address").toUpperCase(),tax_regime:getSelectVal("tpf-tax"),credit_limit:parseFloat(getInputVal("tpf-credit-limit"))||0,max_invoices:parseInt(getInputVal("tpf-max-invoices"),10)||1,payment_days:parseInt(getInputVal("tpf-payment-days"),10)||0,active:getSelectVal("tpf-active")==="1"}}function qs(e){if(!e.doc_type||!e.doc_number)return _t(0),showToast("Tipo y número de documento son obligatorios","warning"),!1;const t=e.person_type==="NATURAL";return t&&(!e.first_name||!e.last_name)?(_t(1),showToast("Nombres y Apellidos son obligatorios para persona natural","warning"),!1):!t&&!e.business_name?(_t(1),showToast("La Razón Social es obligatoria","warning"),!1):e.name?e.country==="CO"&&(!e.city||!e.department)?(_t(2),showToast("Departamento y Ciudad son obligatorios para Colombia","warning"),!1):!0:(_t(1),showToast("El nombre no puede quedar vacío","warning"),!1)}function Do(e=null){var t;if(!can("canWrite"))return showToast("No tienes permisos para gestionar terceros","error");openModal(e?"Editar Tercero":"Nuevo Tercero",Bs(e),`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-tp"><i class="fas fa-floppy-disk"></i> Guardar</button>`,!0),setTimeout(()=>{var a;if(Hs(),Zt(),Fo(),e!=null&&e.dept_code){const o=$("#tpf-city-select");if(o){const s=geoMunisByDept(e.dept_code),n=e.city_code||"";o.innerHTML='<option value="">Seleccionar municipio...</option>'+s.map(i=>`<option value="${esc(i.code)}" ${i.code===n?"selected":""}>${esc(i.name)}</option>`).join(""),setInputVal("tpf-city-code",n),setInputVal("tpf-city",((a=s.find(i=>i.code===n))==null?void 0:a.name)||e.city||"")}}},30),(t=$("#btn-save-tp"))==null||t.addEventListener("click",async()=>{const a=Gs();if(!qs(a))return;const o=$("#btn-save-tp");o&&(o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{if(e!=null&&e.id)await pb.update("third_parties",e.id,a),await API.logAudit("UPDATE","Tercero",e.id,`${a.doc_type} ${a.doc_number} - ${a.name}`);else{const s=await pb.create("third_parties",a);await API.logAudit("CREATE","Tercero",s.id,`${a.doc_type} ${a.doc_number} - ${a.name}`)}closeModal(),showToast("Tercero guardado correctamente","success"),Lo($("#page-content"))}catch(s){o&&(o.disabled=!1,o.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar'),showToast(s.message,"error")}})}async function Qc(e){try{const t=await pb.get("third_parties",e);if(!t.first_name&&!t.business_name&&t.name)if((t.person_type||"NATURAL")==="NATURAL"){const o=t.name.trim().split(/\s+/),s=Math.ceil(o.length/2);t.first_name=o.slice(0,s).join(" "),t.last_name=o.slice(s).join(" ")}else t.business_name=t.name;if(!t.country||t.country.length>3){const a=(t.country||"COLOMBIA").toUpperCase(),o=GEO_PAISES.find(s=>s.name===a);t.country=o?o.code:"CO"}if(!t.dept_code&&t.department){const a=t.department.trim().toUpperCase(),o=GEO_DEPTS.find(s=>s.name===a);o&&(t.dept_code=o.code)}if(!t.city_code&&t.city&&t.dept_code){const a=t.city.trim().toUpperCase(),o=geoMunisByDept(t.dept_code).find(s=>s.name===a);o&&(t.city_code=o.code)}Do(t)}catch(t){showToast(t.message,"error")}}function Zc(e,t){if(!can("canDelete"))return showToast("No tienes permisos para cambiar estado","error");confirmDialog(t?"Reactivar tercero":"Inactivar tercero",t?"¿Deseas reactivar este tercero?":"¿Deseas inactivar este tercero?",async()=>{try{await pb.update("third_parties",e,{active:t});const a=await pb.get("third_parties",e);await API.logAudit("STATUS","Tercero",e,`${a.doc_type} ${a.doc_number} - ${a.name} => ${t?"Activo":"Inactivo"}`),showToast("Estado actualizado","success"),Lo($("#page-content"))}catch(a){showToast(a.message,"error")}})}window._tpfSwitchTab=_t;window.renderTerceros=Lo;window._tpfBindEvents=Hs;window.openTerceroForm=Do;window._tpfUpdatePersonType=Fo;window.terceroPayload=Gs;window._tpfUpdateCountry=Us;window.editTercero=Qc;window._tpfUpdateDept=Vs;window._tpfValidate=qs;window.toggleTercero=Zc;window._tpfUpdateCity=js;window._tpfUpdateDV=Zt;window.terceroFormHtml=Bs;window._tpfCurrentPersonType=Po;async function Ro(e){var t;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando tipos de transacción...</div>';try{const a=await pb.listAll("transaction_types",{sort:"code,prefix"}),o=new Map;for(const n of a)o.has(n.code)||o.set(n.code,[]),o.get(n.code).push(n);let s="";for(const[n,i]of o){const c=i.length>1;i.forEach((r,l)=>{s+=`
          <tr>
            ${l===0?`<td rowspan="${i.length}" style="vertical-align:middle;background:#F8FAFC">
                   <span class="font-bold" style="color:#1A4B8C">${esc(n)}</span>
                   ${c?`<span class="badge ml-1" style="background:#EFF6FF;color:#1A4B8C;font-size:10px">${i.length} series</span>`:""}
                 </td>`:""}
            <td>
              <span class="font-mono text-sm font-semibold" style="color:#0D2137">${esc(r.prefix)}</span>
            </td>
            <td>${esc(r.name)}</td>
            <td class="text-right">${fmtN(r.consecutive||0)}</td>
            <td>${r.active?'<span class="badge badge-green">Activo</span>':'<span class="badge badge-gray">Inactivo</span>'}</td>
            <td>
              <div class="flex gap-2">
                ${can("canWrite")?`<button class="btn btn-outline btn-sm" title="Editar serie" onclick="editTxType('${esc(r.id)}')"><i class="fas fa-pen"></i></button>`:""}
                ${can("canWrite")?`<button class="btn btn-outline btn-sm" title="Nueva serie con mismo código" style="border-color:#1A4B8C;color:#1A4B8C" onclick="openTxTypeForm(null,'${esc(n)}')"><i class="fas fa-code-branch"></i></button>`:""}
                ${can("canDelete")?`<button class="btn btn-danger btn-sm" title="${r.active?"Inactivar":"Reactivar"}" onclick="toggleTxType('${esc(r.id)}', ${r.active?"false":"true"})"><i class="fas ${r.active?"fa-ban":"fa-rotate-left"}"></i></button>`:""}
              </div>
            </td>
          </tr>`})}e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Tipos de Transacción</h3>
          <p class="text-sm" style="color:#6B7280">Configura códigos, series/prefijos, consecutivos y resoluciones.</p>
        </div>
        ${can("canWrite")?'<button class="btn btn-primary" id="btn-new-tx-type"><i class="fas fa-plus"></i> Nueva Serie</button>':""}
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 240px)">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Prefijo / Serie</th>
                <th>Nombre</th>
                <th class="text-right">Consecutivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${s||'<tr><td colspan="6" class="text-center py-10" style="color:#9CA3AF">No hay tipos configurados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-3 p-3 rounded-xl text-xs" style="background:#EFF6FF;color:#1D4ED8">
        <i class="fas fa-info-circle mr-1"></i>
        Usa <strong><i class="fas fa-code-branch"></i> Nueva serie</strong> para agregar un nuevo prefijo al mismo código de tipo.
        El número del comprobante tendrá el formato <strong>PREFIJO-00000001</strong> (8 dígitos).
      </div>`,(t=$("#btn-new-tx-type"))==null||t.addEventListener("click",()=>Oo())}catch(a){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(a.message)}</div>`}}function Oo(e=null,t=""){var n;if(!can("canWrite"))return showToast("No tienes permisos para gestionar tipos","error");const a=!!(e!=null&&e.id),o=(e==null?void 0:e.code)??t??"",s=!a&&!!t;openModal(a?"Editar Serie de Transacción":"Nueva Serie de Transacción",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código de tipo
          <span class="text-xs ml-1" style="color:#6B7280">(agrupa series del mismo tipo, ej: FV)</span>
        </label>
        <input id="tt-code" class="form-input" value="${esc(o)}" ${a?'readonly style="background:#F9FAFB"':""}
               placeholder="Ej: FV, EG, RC...">
      </div>
      <div class="form-group">
        <label class="form-label">Prefijo / Serie
          <span class="text-xs ml-1" style="color:#6B7280">(aparece en el número, ej: SETT, FV)</span>
        </label>
        <input id="tt-prefix" class="form-input" value="${esc((e==null?void 0:e.prefix)||"")}"
               placeholder="Ej: SETT, FV, EG...">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Nombre</label>
        <input id="tt-name" class="form-input" value="${esc((e==null?void 0:e.name)||"")}"
               placeholder="Ej: Factura de Venta — Resolución 18764">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Descripción</label>
        <textarea id="tt-desc" class="form-input" rows="2">${esc((e==null?void 0:e.description)||"")}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Consecutivo actual</label>
        <input id="tt-consec" type="number" min="0" class="form-input" value="${esc((e==null?void 0:e.consecutive)??0)}">
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="tt-active" class="form-input">
          <option value="1" ${(e==null?void 0:e.active)!==!1?"selected":""}>Activo</option>
          <option value="0" ${(e==null?void 0:e.active)===!1?"selected":""}>Inactivo</option>
        </select>
      </div>
    </div>
    ${s?`<p class="text-xs mt-3" style="color:#1D4ED8"><i class="fas fa-info-circle mr-1"></i>Estás creando una nueva serie para el código <strong>${esc(t)}</strong>. El prefijo debe ser diferente al de las series existentes.</p>`:""}`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-tt"><i class="fas fa-floppy-disk"></i> Guardar</button>`),(n=$("#btn-save-tt"))==null||n.addEventListener("click",async()=>{var c;const i={code:(getInputVal("tt-code")||"").trim().toUpperCase(),prefix:(getInputVal("tt-prefix")||"").trim().toUpperCase(),name:getInputVal("tt-name"),description:getInputVal("tt-desc"),consecutive:Number(getInputVal("tt-consec")||0),active:getSelectVal("tt-active")==="1"};if(!i.code||!i.prefix||!i.name)return showToast("Código, prefijo y nombre son obligatorios","warning");try{a?await pb.update("transaction_types",e.id,i):await pb.create("transaction_types",i),closeModal(),showToast("Serie guardada correctamente","success"),Ro($("#page-content"))}catch(r){(c=r.message)!=null&&c.toLowerCase().includes("unique")||r.status===400?showToast(`Ya existe una serie con código "${i.code}" y prefijo "${i.prefix}"`,"error"):showToast(r.message,"error")}})}async function Xc(e){try{Oo(await pb.get("transaction_types",e))}catch(t){showToast(t.message,"error")}}function er(e,t){if(!can("canDelete"))return showToast("No tienes permisos para cambiar estado","error");const a=t===!0||t==="true";confirmDialog(a?"Reactivar serie":"Inactivar serie",a?"¿Deseas reactivar esta serie de transacción?":"¿Deseas inactivar esta serie de transacción?",async()=>{try{await pb.update("transaction_types",e,{active:a}),showToast("Estado actualizado","success"),Ro($("#page-content"))}catch(o){showToast(o.message,"error")}})}window.editTxType=Xc;window.openTxTypeForm=Oo;window.toggleTxType=er;window.renderTiposTx=Ro;const Ht={reterenta:3.5,reteiva:15,reteica:.414},ko={reterenta:"ret_rate_reterenta",reteiva:"ret_rate_reteiva",reteica:"ret_rate_reteica"};function mt(e,t=null){for(const a of e){const o=a.trim(),s=ko[o],n=t&&s?Number(t[s]||0):0;if(n>0)return n;if(Ht[o])return Ht[o]}return Ht.reterenta}function zs(e){return{reterenta:"Reterenta",reteiva:"Reteiva",reteica:"Reteica"}[e.trim()]||e}function Mo(e,t=null){const a=String(e||"").trim(),o=ko[a],s=t&&o?Number(t[o]||0):0,n=s>0?s:Ht[a]||0;return`${zs(a)} ${n}%`}let ce={accounts:[],txTypes:[],terceros:[],lines:[],postableAccountIds:new Set,accountMap:new Map};function Lt(e){return`${(e==null?void 0:e.doc_number)||""} - ${(e==null?void 0:e.name)||""}`.trim()}function Xt(e,t){var a;return!t||!((a=e==null?void 0:e.terceros)!=null&&a.length)?null:e.terceros.find(o=>o.id===t)||null}function Bo(e,t){const a=Array.isArray(e==null?void 0:e.terceros)?e.terceros:[],o=String(t||"").toLowerCase().trim();if(!o)return a.slice(0,30);const s=o.split(/\s+/).filter(Boolean);return a.filter(n=>{const i=`${n.doc_number||""} ${n.name||""}`.toLowerCase();return s.every(c=>i.includes(c))}).slice(0,30)}function Uo({state:e,hiddenId:t,inputId:a,resultsId:o,onSelected:s}){const n=document.getElementById(`${a}-wrap`),i=document.getElementById(t),c=document.getElementById(a),r=document.getElementById(o);if(!n||!i||!c||!r)return;const l=(d="")=>{const b=Bo(e,d);if(!b.length){r.innerHTML='<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';return}r.innerHTML=b.map(u=>`
      <button type="button" data-third-id="${esc(u.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
        <div style="font-weight:600">${esc(u.doc_number||"SIN DOC")}</div>
        <div style="font-size:12px;color:#6B7280">${esc(u.name||"")}</div>
      </button>
    `).join("")},p=()=>{l(c.value),r.style.display="block"},f=()=>{r.style.display="none"};(()=>{const d=Xt(e,i.value);c.value=d?Lt(d):""})(),c.onfocus=()=>p(),c.oninput=()=>{i.value="",typeof s=="function"&&s(""),l(c.value),r.style.display="block"},r.onclick=d=>{const b=d.target.closest("[data-third-id]");if(!b)return;const u=b.getAttribute("data-third-id")||"",y=Xt(e,u);i.value=u,c.value=y?Lt(y):"",f(),typeof s=="function"&&s(u)},c._thirdOutsideHandler&&document.removeEventListener("click",c._thirdOutsideHandler),c._thirdOutsideHandler=d=>{n.contains(d.target)||f()},setTimeout(()=>document.addEventListener("click",c._thirdOutsideHandler),0)}function Ws({state:e,hidden:t,input:a,results:o,onSelected:s}){if(!t||!a||!o)return;const n=(c="")=>{const r=Bo(e,c);o.innerHTML=`
      <button type="button" data-third-id="" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer;border-bottom:1px solid #F1F5F9">
        Usar tercero del encabezado
      </button>
      ${r.map(l=>`
        <button type="button" data-third-id="${esc(l.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
          <div style="font-weight:600">${esc(l.doc_number||"SIN DOC")}</div>
          <div style="font-size:12px;color:#6B7280">${esc(l.name||"")}</div>
        </button>
      `).join("")}
    `};(()=>{const c=Xt(e,t.value);a.value=c?Lt(c):""})(),a.onfocus=()=>{n(a.value),o.style.display="block"},a.oninput=()=>{t.value="",typeof s=="function"&&s(""),n(a.value),o.style.display="block"},a.onblur=()=>setTimeout(()=>{o.style.display="none"},120),o.onmousedown=c=>c.preventDefault(),o.onclick=c=>{const r=c.target.closest("[data-third-id]");if(!r)return;const l=r.getAttribute("data-third-id")||"";t.value=l;const p=Xt(e,l);a.value=p?Lt(p):"",o.style.display="none",typeof s=="function"&&s(l)}}function Vo(e="new"){var o;const t=e==="edit",a=t?ae:ce;(o=a==null?void 0:a.lines)!=null&&o.length&&a.lines.forEach((s,n)=>{const i=t?`edit-tx-line-third-${n}`:`tx-line-third-${n}`,c=document.getElementById(i),r=document.getElementById(`${i}-search`),l=document.getElementById(`${i}-results`);Ws({state:a,hidden:c,input:r,results:l,onSelected:p=>{t?nn(n,"third_party_id",p):Ks(n,"third_party_id",p)}})})}async function tr(){if(!can("canWrite"))return showToast("Sin permisos para registrar transacciones","error");openModal("Nueva Transacción",'<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos...</div>',"",!0);try{const[e,t,a]=await Promise.all([API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]),o=new Set(e.map(r=>r.parent_code).filter(Boolean)),s=new Set(e.filter(r=>!o.has(r.code)).map(r=>r.id)),n=new Map(e.map(r=>[r.id,r]));ce={accounts:e,txTypes:t,terceros:a,lines:[],postableAccountIds:s,accountMap:n,inModal:!0};const i=`
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b" style="border-color:#F3F4F6">
        <div class="form-group"><label class="form-label">Tipo / Serie</label><select id="tx-type" class="form-input">${jo(t)}</select></div>
        <div class="form-group"><label class="form-label">Consecutivo</label><input id="tx-number" class="form-input" readonly placeholder="Auto"></div>
        <div class="form-group"><label class="form-label">Fecha</label><input id="tx-date" type="date" class="form-input" value="${todayStr()}"></div>
          <div class="form-group">
          <label class="form-label">Tercero</label>
          <div class="flex gap-2">
            <div id="tx-third-search-wrap" class="relative" style="flex:1">
              <input id="tx-third-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre">
              <input id="tx-third" type="hidden" value="">
              <div id="tx-third-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
            </div>
            <button class="btn btn-outline btn-sm" id="btn-cartera" title="Ver saldo de cartera del tercero" style="white-space:nowrap;border-color:#1A4B8C;color:#1A4B8C" disabled>
              <i class="fas fa-file-invoice-dollar"></i> Cartera
            </button>
          </div>
        </div>
        <div class="form-group md:col-span-3"><label class="form-label">Descripción</label><input id="tx-desc" class="form-input" placeholder="Descripción del comprobante"></div>
        <div class="form-group"><label class="form-label">Plazo (días)</label><input id="tx-payment-days" type="number" min="0" class="form-input" value="0" placeholder="0"></div>
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-bold text-sm" style="color:#0D2137">Líneas contables</h4>
          <button class="btn btn-outline btn-sm" id="btn-add-line"><i class="fas fa-plus"></i> Agregar línea</button>
        </div>
        <div id="tx-lines"></div>
        <div id="tx-balance" class="balance-indicator balance-err mt-3"><i class="fas fa-triangle-exclamation"></i> Descuadrada</div>
      </div>`,c=`
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-outline" onclick="saveTransaction(false)" style="border-color:#D97706;color:#D97706"><i class="fas fa-file-pen"></i> Guardar Borrador</button>
      ${can("canApprove")?'<button class="btn btn-primary" onclick="saveTransaction(true)"><i class="fas fa-check-circle"></i> Guardar y Aprobar</button>':""}`;openModal("Nueva Transacción",i,c,!0),setTimeout(async()=>{La(),await Pa(),lt(),lt()},0)}catch(e){openModal("Error al cargar",`<p class="p-4 text-sm" style="color:#EF4444">${esc(e.message)}</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!1)}}function La(){const e=$("#tx-type"),t=$("#btn-add-line"),a=$("#tx-third"),o=$("#btn-cartera");e&&(e.onchange=Pa),t&&(t.onclick=()=>lt()),Uo({state:ce,hiddenId:"tx-third",inputId:"tx-third-search",resultsId:"tx-third-results",onSelected:s=>{var i;o&&(o.disabled=!s);const n=$("#tx-payment-days");if(n&&s){const c=(i=ce.terceros)==null?void 0:i.find(r=>r.id===s);n.value=Number((c==null?void 0:c.payment_days)||0)}}}),a&&o&&(o.disabled=!a.value),o&&(o.onclick=()=>Da(getSelectVal("tx-third")))}async function Ys(e){var t;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando datos...</div>';try{const[a,o,s]=await Promise.all([API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]),n=new Set(a.map(r=>r.parent_code).filter(Boolean)),i=new Set(a.filter(r=>!n.has(r.code)).map(r=>r.id)),c=new Map(a.map(r=>[r.id,r]));ce={accounts:a,txTypes:o,terceros:s,lines:[],postableAccountIds:i,accountMap:c,inModal:!1},e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Nueva Transacción</h3>
          <p class="text-sm" style="color:#6B7280">Registro contable por partida doble.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group"><label class="form-label">Tipo / Serie</label><select id="tx-type" class="form-input">${jo(o)}</select></div>
          <div class="form-group"><label class="form-label">Consecutivo</label><input id="tx-number" class="form-input" readonly placeholder="Auto"></div>
          <div class="form-group"><label class="form-label">Fecha</label><input id="tx-date" type="date" class="form-input" value="${todayStr()}"></div>
          <div class="form-group md:col-span-1">
            <label class="form-label">Tercero</label>
            <div class="flex gap-2">
              <div id="tx-third-search-wrap" class="relative" style="flex:1">
                <input id="tx-third-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre">
                <input id="tx-third" type="hidden" value="">
                <div id="tx-third-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:20"></div>
              </div>
              <button class="btn btn-outline btn-sm" id="btn-cartera" title="Ver saldo de cartera del tercero" style="white-space:nowrap;border-color:#1A4B8C;color:#1A4B8C" disabled>
                <i class="fas fa-file-invoice-dollar"></i> Cartera
              </button>
            </div>
          </div>
          <div class="form-group md:col-span-3"><label class="form-label">Descripción</label><input id="tx-desc" class="form-input" placeholder="Descripción del comprobante"></div>
          <div class="form-group"><label class="form-label">Plazo (días)</label><input id="tx-payment-days" type="number" min="0" class="form-input" value="0" placeholder="0"></div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-bold" style="color:#0D2137">Líneas contables</h4>
          ${can("canWrite")?'<button class="btn btn-outline btn-sm" id="btn-add-line"><i class="fas fa-plus"></i> Agregar línea</button>':""}
        </div>
        <div id="tx-lines"></div>
        <div class="flex flex-wrap items-center justify-between mt-4 gap-3">
          <div id="tx-balance" class="balance-indicator balance-err"><i class="fas fa-triangle-exclamation"></i> Descuadrada</div>
          ${can("canWrite")?'<button class="btn btn-primary" id="btn-save-tx"><i class="fas fa-floppy-disk"></i> Guardar Transacción</button>':""}
        </div>
      </div>`,La(),(t=$("#btn-save-tx"))==null||t.addEventListener("click",Xs),await Pa(),lt(),lt()}catch(a){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(a.message)}</div>`}}function jo(e){const t=new Map;for(const o of e)t.has(o.code)||t.set(o.code,[]),t.get(o.code).push(o);const a=[];for(const[o,s]of t)if(s.length===1){const n=s[0];a.push(`<option value="${esc(n.id)}">${esc(n.prefix)} — ${esc(n.name)}</option>`)}else{const n=`${esc(o)} — ${esc(s[0].name.replace(/ ?[\-–—].*$/,"").trim())}`;a.push(`<optgroup label="${n}">${s.map(i=>`<option value="${esc(i.id)}">[${esc(i.prefix)}] ${esc(i.name)}</option>`).join("")}</optgroup>`)}return a.join("")}async function Pa(){const e=getSelectVal("tx-type"),t=ce.txTypes.find(a=>a.id===e);t&&setInputVal("tx-number",`${t.prefix}-${String((t.consecutive??0)+1).padStart(8,"0")}`)}function lt(e=null){ce.lines.push(e||{account_id:"",third_party_id:"",debit:0,credit:0,description:"",cross_doc_ref:"",ret_base:"",ret_rate:""}),dt()}function ar(e){ce.lines.splice(e,1),dt()}function Js(e){const t=ce.lines[e];if(!t||!(e===ce.lines.length-1))return;const o=Number(t.debit||0),s=Number(t.credit||0),n=o>0&&s<=0||s>0&&o<=0;!t.account_id||!n||lt()}function or(e){openLineComment(e,"new")}function Ks(e,t,a){if(ce.lines[e][t]=a,t==="debit"&&Number(a)>0&&(ce.lines[e].credit=0),t==="credit"&&Number(a)>0&&(ce.lines[e].debit=0),t==="account_id"){ce.lines[e].cross_doc_ref="",ce.lines[e].ret_base="";const o=ce.accountMap.get(a);if(o!=null&&o.maneja_retenciones){const s=(o.tipos_retencion||"").split(",").filter(Boolean);ce.lines[e].ret_rate=String(mt(s,o))}else ce.lines[e].ret_rate="";dt(!0)}else if(t==="ret_base"||t==="ret_rate"){const o=Number(ce.lines[e].ret_base||0),s=Number(ce.lines[e].ret_rate||0),n=document.getElementById(`ret-calc-${e}`);n&&(n.textContent=o&&s?fmt(o*s/100):"$0")}else if(t==="debit"||t==="credit"){const o=t==="debit"?"credit":"debit",s=document.getElementById(`tx-line-${o}-${e}`);if(s){const n=Number(a)>0;s.disabled=n,n&&(s.value="")}Qs()}else dt(!1)}function sr(e){const t=ce.lines[e],a=Number(t.ret_base||0),o=ce.accountMap.get(t.account_id),s=((o==null?void 0:o.tipos_retencion)||"").split(",").filter(Boolean),n=Number(t.ret_rate||mt(s,o)||0);if(ce.lines[e].ret_rate=n?String(n):"",!a||!n)return showToast("Ingresa la base gravable para calcular la retención","warning");const i=Math.round(a*n/100);(o==null?void 0:o.nature)==="debit"?(ce.lines[e].debit=i,ce.lines[e].credit=0):(ce.lines[e].credit=i,ce.lines[e].debit=0),dt(!0),Js(e),showToast(`Retención aplicada: ${fmt(i)}`,"success")}function Qs(){const e=ce.lines.reduce((o,s)=>(o.d+=Number(s.debit||0),o.c+=Number(s.credit||0),o),{d:0,c:0}),t=Math.abs(e.d-e.c)<1e-4&&e.d>0,a=$("#tx-balance");a&&(a.className=`balance-indicator ${t?"balance-ok":"balance-err"}`,a.innerHTML=t?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(e.d)} = Crédito ${fmt(e.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(e.d-e.c))}`)}function dt(e=!0){if(e){const s=ce.lines.map((n,i)=>{const c=ce.accountMap.get(n.account_id),r=!!(c!=null&&c.requires_third_party),l=!!(c!=null&&c.maneja_cruce),p=!!(c!=null&&c.maneja_retenciones),f=!!String(n.description||"").trim(),m=((c==null?void 0:c.tipos_retencion)||"").split(",").filter(Boolean),d=Number(n.ret_base||0),b=Number(n.ret_rate!==""?n.ret_rate:m.length?mt(m,c):0),u=d&&b?fmt(d*b/100):"$0",y=Number(n.debit||0),v=Number(n.credit||0);return`
      <div class="tx-line-row" data-i="${i}" style="display:grid;grid-template-columns:minmax(250px,320px) minmax(260px,1fr) minmax(160px,190px) minmax(120px,140px) minmax(120px,140px) auto auto;gap:8px;align-items:center">
        <select class="form-input" style="font-size:13px" onchange="updateTxLine(${i}, 'account_id', this.value)">
          <option value="">Seleccione cuenta...</option>
          ${ce.accounts.map(g=>{const h=ce.postableAccountIds.has(g.id);return`<option value="${esc(g.id)}" ${n.account_id===g.id?"selected":""} ${h?"":"disabled"}>${esc(g.code)} - ${esc(g.name)}${h?"":" [MAYOR]"}</option>`}).join("")}
        </select>

        <div style="display:flex;flex-direction:column;gap:3px;min-width:0">
          <div style="display:flex;align-items:center;gap:6px">
            <i class="fas fa-user-tag" style="color:#334155;font-size:11px"></i>
            <span class="text-xs font-semibold" style="color:#334155;white-space:nowrap">Tercero línea</span>
            ${r?'<span class="text-xs" style="color:#B91C1C">Obligatorio</span>':'<span class="text-xs" style="color:#94A3B8">Opcional</span>'}
          </div>
          <div id="tx-line-third-${i}-wrap" class="relative">
            <input id="tx-line-third-${i}-search" class="form-input" style="font-size:13px" autocomplete="off" placeholder="Buscar tercero de la línea">
            <input id="tx-line-third-${i}" type="hidden" value="${esc(n.third_party_id||"")}">
            <div id="tx-line-third-${i}-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:20"></div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:3px">
          <div style="display:flex;align-items:center;gap:6px">
            <i class="fas fa-link" style="color:#1A4B8C;font-size:11px"></i>
            <span class="text-xs font-semibold" style="color:#1A4B8C;white-space:nowrap">Doc. de Cruce</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <input class="form-input" style="font-size:13px" ${l?"":"disabled"} placeholder="N° factura / documento" value="${esc(n.cross_doc_ref||"")}" oninput="updateTxLine(${i}, 'cross_doc_ref', this.value)">
            ${l?`<button class="btn btn-outline btn-sm" style="padding:3px 8px;font-size:11px;border-color:#1A4B8C;color:#1A4B8C;flex-shrink:0" title="Consultar cartera de este tercero" onclick="showCarteraForLine(${i}, 'new')"><i class="fas fa-search"></i></button>`:""}
          </div>
        </div>

        <input id="tx-line-debit-${i}" class="form-input text-right" ${v>0?"disabled":""} value="${n.debit?esc(n.debit):""}" placeholder="Débito" oninput="updateTxLine(${i}, 'debit', parseNum(this.value))" onblur="autoAppendTxLineFrom(${i})">
        <input id="tx-line-credit-${i}" class="form-input text-right" ${y>0?"disabled":""} value="${n.credit?esc(n.credit):""}" placeholder="Crédito" oninput="updateTxLine(${i}, 'credit', parseNum(this.value))" onblur="autoAppendTxLineFrom(${i})">

        <button class="btn btn-outline btn-sm" title="Comentario por registro" style="${f?"border-color:#16A34A;color:#16A34A;background:#F0FDF4":"border-color:#64748B;color:#334155"}" onclick="editTxLineComment(${i})"><i class="fas fa-comment-dots"></i></button>
        <button class="btn btn-danger btn-sm" onclick="removeTxLine(${i})"><i class="fas fa-xmark"></i></button>
      </div>
      ${p?`
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:-2px 0 6px 0;padding:7px 10px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:0 6px 6px 0">
        <i class="fas fa-percent" style="color:#D97706;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#92400E;white-space:nowrap">Calculadora de Retención</span>
         ${m.map(g=>`<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:10px">${Mo(g,c)}</span>`).join("")}
        <span class="text-xs" style="color:#92400E">Base:</span>
        <input class="form-input" style="max-width:140px;font-size:13px" type="number" min="0" step="1" placeholder="Base gravable"
               value="${esc(n.ret_base||"")}" oninput="updateTxLine(${i}, 'ret_base', this.value)">
        <span class="text-xs" style="color:#92400E">×</span>
         <span class="badge" style="background:#FDE68A;color:#92400E;font-size:11px">${esc(b)}%</span>
        <span class="text-xs" style="color:#92400E">=</span>
        <span id="ret-calc-${i}" class="text-sm font-bold" style="color:#D97706;min-width:70px">${u}</span>
        <button class="btn btn-sm" style="background:#D97706;color:#fff;padding:4px 10px;font-size:12px" onclick="applyRetentionCalc(${i})">
          <i class="fas fa-check"></i> Aplicar al comprobante
        </button>
      </div>`:""}`}).join("");$("#tx-lines").innerHTML=s||'<p style="color:#9CA3AF">Agrega al menos una línea.</p>',Vo("new")}const t=ce.lines.reduce((s,n)=>(s.d+=Number(n.debit||0),s.c+=Number(n.credit||0),s),{d:0,c:0}),a=Math.abs(t.d-t.c)<1e-4&&t.d>0,o=$("#tx-balance");o&&(o.className=`balance-indicator ${a?"balance-ok":"balance-err"}`,o.innerHTML=a?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(t.d)} = Crédito ${fmt(t.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(t.d-t.c))}`)}let Ct=null,Fa="new",Tt=null;function va(){if(Tt=null,Ct){const e=Ct;if(Ct=null,openModal(e.title,e.body,e.footer,e.wide),e.editForm){const t=$("#edit-tx-date"),a=$("#edit-tx-third"),o=$("#edit-tx-third-search"),s=$("#edit-tx-desc");t&&(t.value=e.editForm.date||""),a&&(a.value=e.editForm.third||""),o&&(o.value=e.editForm.thirdLabel||""),s&&(s.value=e.editForm.desc||""),ae&&(ae.selectedThird=e.editForm.third||"")}if(e.newForm){const t=$("#tx-type"),a=$("#tx-number"),o=$("#tx-date"),s=$("#tx-third"),n=$("#tx-third-search"),i=$("#tx-desc"),c=$("#tx-payment-days");t&&e.newForm.type&&(t.value=e.newForm.type),a&&(a.value=e.newForm.number||""),o&&(o.value=e.newForm.date||""),s&&e.newForm.third&&(s.value=e.newForm.third),n&&(n.value=e.newForm.thirdLabel||""),i&&(i.value=e.newForm.desc||""),c&&(c.value=e.newForm.payDays||"0");const r=$("#btn-cartera");r&&(r.disabled=!e.newForm.third),La()}Ho();return}closeModal()}function nr(e,t){var s,n;const o=((s=(t==="edit"?ae:ce).lines[e])==null?void 0:s.third_party_id)||(t==="edit"?((n=$("#edit-tx-third"))==null?void 0:n.value)||(ae==null?void 0:ae.selectedThird):getSelectVal("tx-third"));if(!o){showToast("Selecciona un tercero para esta línea o en el encabezado","warning");return}Tt=e,Fa=t,Da(o,{returnToPrevious:!0,skipCtxOverride:!0})}async function Da(e,t={}){var r,l,p,f,m,d,b,u,y,v,g,h,_,A,C,T,N,I,S,w,E,L,R,M,B;const{returnToPrevious:a=!1,skipCtxOverride:o=!1}=t;if(!e)return;const s=!!$("#edit-tx-third")&&!!((r=ae==null?void 0:ae.accountMap)!=null&&r.size);o||(Fa=a||s?"edit":"new");const n=s?ae:ce,i=(n.terceros||[]).find(k=>k.id===e),c=new Set([...((p=(l=n.accountMap)==null?void 0:l.values)==null?void 0:p.call(l))||[]].filter(k=>k.maneja_cruce).map(k=>k.id));a&&((f=$("#modal-overlay"))!=null&&f.classList.contains("show"))?Ct={title:((m=$("#modal-title"))==null?void 0:m.innerHTML)||"",body:((d=$("#modal-body"))==null?void 0:d.innerHTML)||"",footer:((b=$("#modal-footer"))==null?void 0:b.innerHTML)||"",wide:((u=$("#modal-box"))==null?void 0:u.classList.contains("wide"))||!1,editForm:{date:((y=$("#edit-tx-date"))==null?void 0:y.value)||"",third:((v=$("#edit-tx-third"))==null?void 0:v.value)||"",thirdLabel:((g=$("#edit-tx-third-search"))==null?void 0:g.value)||"",desc:((h=$("#edit-tx-desc"))==null?void 0:h.value)||""},newForm:{type:((_=$("#tx-type"))==null?void 0:_.value)||"",number:((A=$("#tx-number"))==null?void 0:A.value)||"",date:((C=$("#tx-date"))==null?void 0:C.value)||"",third:((T=$("#tx-third"))==null?void 0:T.value)||"",thirdLabel:((N=$("#tx-third-search"))==null?void 0:N.value)||"",desc:((I=$("#tx-desc"))==null?void 0:I.value)||"",payDays:((S=$("#tx-payment-days"))==null?void 0:S.value)||"0"}}:Ct=null,openModal(`<i class="fas fa-file-invoice-dollar mr-2" style="color:#1A4B8C"></i>Cartera: ${esc((i==null?void 0:i.name)||e)}`,'<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando movimientos...</div>','<button class="btn btn-outline" onclick="closeCarteraModal()">Cerrar</button>',!0);try{if(!c.size){document.querySelector('#modal-body, .modal-body, [id*="modal"] .p-6')&&(document.querySelector('#modal-body, .modal-body, [id*="modal"] .p-6').innerHTML='<p class="text-center py-6" style="color:#9CA3AF">No hay cuentas configuradas con documento de cruce.</p>');return}const k=pb.escapeFilterValue(e);let j;try{j=await pb.listAll("tx_lines",{filter:`tx_id.third_party_id="${k}" && account_id.maneja_cruce=true`,expand:"account_id,tx_id",sort:"tx_id.date"})}catch{const z=await pb.listAll("tx_lines",{filter:`tx_id.third_party_id="${k}"`,expand:"account_id,tx_id",sort:"-id"});j={items:(Array.isArray(z)?z:(z==null?void 0:z.items)||[]).filter(J=>c.has(J.account_id))}}const Y=j.items??j,W=new Map;for(const U of Y){const z=(U.cross_doc_ref||"").trim();if(!z)continue;W.has(z)||W.set(z,{ref:z,account:((E=(w=U.expand)==null?void 0:w.account_id)==null?void 0:E.name)||U.account_id,firstDate:((R=(L=U.expand)==null?void 0:L.tx_id)==null?void 0:R.date)||"",debit:0,credit:0,txNumbers:new Set});const J=W.get(z);J.debit+=Number(U.debit||0),J.credit+=Number(U.credit||0),(B=(M=U.expand)==null?void 0:M.tx_id)!=null&&B.number&&J.txNumbers.add(U.expand.tx_id.number)}if(!W.size){ha('<p class="text-center py-8" style="color:#9CA3AF"><i class="fas fa-check-circle mr-2" style="color:#22C55E"></i>No hay documentos de cruce pendientes para este tercero.</p>');return}const K=[...W.values()].map(U=>{const z=Number(U.credit||0)-Number(U.debit||0),J=Math.abs(z),te=J<.01;return{...U,saldo:J,esCancelado:te,netOpen:z}}),H=K.filter(U=>!U.esCancelado),x=K.filter(U=>U.esCancelado),P=(U,z)=>`
        <tr style="${z?"opacity:0.45":""}">
          <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(U.ref)}</span></td>
          <td class="text-xs" style="color:#6B7280">${esc(U.firstDate)}</td>
          <td class="text-xs">${esc(U.account)}</td>
          <td class="text-right">${fmt(U.debit)}</td>
          <td class="text-right">${fmt(U.credit)}</td>
          <td class="text-right font-bold" style="color:${U.esCancelado?"#22C55E":"#EF4444"}">
            ${U.esCancelado?'<i class="fas fa-check"></i> Cancelado':fmt(U.saldo)}
          </td>
          <td>
            ${U.esCancelado?"":`<button class="btn btn-outline btn-sm" style="border-color:#1A4B8C;color:#1A4B8C;font-size:11px" onclick="useCrossDoc('${esc(U.ref)}', ${Number(U.netOpen||0)})">
              <i class="fas fa-arrow-down-to-line"></i> Usar
            </button>`}
          </td>
        </tr>`,V=H.reduce((U,z)=>U+z.saldo,0);ha(`
        <div class="mb-3 flex items-center gap-3 flex-wrap">
          <span class="text-sm font-semibold" style="color:#0D2137">Documentos pendientes: <span style="color:#EF4444">${H.length}</span></span>
          <span class="text-sm font-semibold" style="color:#0D2137">Saldo total abierto: <span style="color:#EF4444">${fmt(V)}</span></span>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Doc. Cruce</th><th>Fecha</th><th>Cuenta</th><th>Débito Acum.</th><th>Crédito Acum.</th><th>Saldo</th><th></th></tr></thead>
            <tbody>
              ${H.map(U=>P(U,!1)).join("")}
              ${x.map(U=>P(U,!0)).join("")}
            </tbody>
          </table>
        </div>
        <p class="text-xs mt-3" style="color:#9CA3AF"><i class="fas fa-info-circle mr-1"></i>Haz clic en <strong>Usar</strong> para aplicar el documento de cruce a la línea correspondiente del comprobante actual.</p>
      `)}catch(k){ha(`<p class="text-center py-6" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(k.message)}</p>`)}}function ha(e){const t=$("#modal-body");t&&(t.innerHTML=e)}function Zs(){const e=getSelectVal("tx-type"),t=ce.txTypes.find(o=>o.id===e);if(!t)return null;const a=`${t.code||""} ${t.prefix||""} ${t.name||""} ${t.description||""}`.toLowerCase();return/(recaudo|recibo|ingreso\s+de\s+caja|recaudo\s+de\s+cartera)/.test(a)?"recaudo":/(egreso|pago\s+a\s+proveedores|pago\s+proveedor|pago\s+proveedores|salida\s+de\s+caja)/.test(a)?"egreso":null}function Za(e,t,a=ce){const o=Zs();if(!o)return!1;const s=Number(t||0);if(!Number.isFinite(s)||Math.abs(s)<1e-4)return!1;let n=0,i=0;return o==="recaudo"?s<0?n=Math.abs(s):i=Math.abs(s):s>0?i=Math.abs(s):n=Math.abs(s),a.lines[e].debit=n,a.lines[e].credit=i,!0}function ir(e,t=0){var c;const a=Fa==="edit"||!!$("#edit-tx-lines")&&!!((c=ae==null?void 0:ae.accountMap)!=null&&c.size),o=a?ae:ce,s=a?Ze:dt;if(Tt!==null){const r=Tt;Tt=null,o.lines[r].cross_doc_ref=e;const l=Za(r,t,o);va(),s(!0),l?showToast(`Documento "${e}" aplicado a la línea ${r+1} con valor ${fmt(Math.abs(Number(t||0)))}`,"success"):showToast(`Documento "${e}" aplicado a la línea ${r+1}`,"success");return}const n=o.lines.findIndex(r=>{const l=o.accountMap.get(r.account_id);return(l==null?void 0:l.maneja_cruce)&&!r.cross_doc_ref}),i=r=>{o.lines[r].cross_doc_ref=e;const l=Za(r,t,o);va(),s(!0),l?showToast(`Documento "${e}" aplicado a la línea ${r+1} con valor ${fmt(Math.abs(Number(t||0)))}`,"success"):showToast(`Documento "${e}" aplicado a la línea ${r+1}`,"success")};if(n===-1){const r=o.lines.findIndex(l=>{var p;return(p=o.accountMap.get(l.account_id))==null?void 0:p.maneja_cruce});if(r===-1){va(),showToast("Primero selecciona una cuenta con documento de cruce en las líneas del comprobante","warning");return}i(r);return}i(n)}async function Xs(e=!1){var t;if(!can("canWrite"))return showToast("No tienes permisos para registrar transacciones","error");try{const a=getSelectVal("tx-type"),o=getInputVal("tx-date"),s=getInputVal("tx-desc"),n=getSelectVal("tx-third"),i=ce.lines.filter(f=>f.account_id&&(Number(f.debit)>0||Number(f.credit)>0));if(!a||!o)return showToast("Completa tipo y fecha","warning");if(!s)return showToast("La descripción es obligatoria","warning");if(typeof isPeriodClosed=="function"&&await isPeriodClosed(o))return showToast(`El período ${o.slice(0,7)} no está habilitado o está cerrado. Habilítalo en Cierre Contable antes de registrar.`,"error");if(!i.length)return showToast("Debe existir al menos una línea válida","warning");if(i.length<2)return showToast("Se requieren al menos 2 líneas contables","warning");const c=i.find(f=>!ce.postableAccountIds.has(f.account_id));if(c){const f=ce.accounts.find(m=>m.id===c.account_id);return showToast(`La cuenta ${(f==null?void 0:f.code)||""} es de mayor; usa una cuenta auxiliar para registrar movimientos`,"error")}const r=i.find(f=>{const m=ce.accounts.find(d=>d.id===f.account_id);return!!(m!=null&&m.requires_third_party)&&!(f.third_party_id||n)});if(r){const f=ce.lines.indexOf(r);return showToast(`La línea ${f+1} requiere tercero. Selecciónalo en la línea o en el encabezado.`,"error")}const l=i.reduce((f,m)=>({d:f.d+Number(m.debit||0),c:f.c+Number(m.credit||0)}),{d:0,c:0});if(Math.abs(l.d-l.c)>1e-4||l.d<=0)return showToast("La transacción no está cuadrada","error");const p=await API.createTransaction({tx_type_id:a,number:"",date:o,description:s,third_party_id:n||null,user_id:(t=pb.currentUser)==null?void 0:t.id,payment_days:parseInt(getInputVal("tx-payment-days"),10)||0,cross_enabled:i.some(f=>{var m;return(m=ce.accountMap.get(f.account_id))==null?void 0:m.maneja_cruce}),status:"draft"},i.map((f,m)=>({account_id:f.account_id,third_party_id:f.third_party_id||n||null,debit:Number(f.debit||0),credit:Number(f.credit||0),description:f.description||s,line_order:m+1,cross_doc_ref:f.cross_doc_ref||""})));if(e&&can("canApprove")?(await API.approveTx(p.id),showToast(`Transacción ${p.number} guardada y aprobada.`,"success")):showToast(`Transacción ${p.number} guardada como borrador. Pendiente de aprobación.`,"success"),ce.inModal){closeModal();const f=o.slice(0,7);he.typeIdsByPeriod[f]&&delete he.typeIdsByPeriod[f],$("#ctxq-results")&&(await At(),Oe())}else navigate("consulta-tx")}catch(a){showToast(a.message,"error")}}let he={page:1,perPage:50,total:0,txTypes:[],periods:[],typeIdsByPeriod:{}};function Ra(e){const[t,a]=String(e||"").split("-"),o=Number(t),s=Number(a);if(!Number.isFinite(o)||!Number.isFinite(s)||s<1||s>12)return null;const n=`${t}-${String(s).padStart(2,"0")}-01`,i=s===12?`${String(o+1)}-01-01`:`${t}-${String(s+1).padStart(2,"0")}-01`;return{from:n,next:i}}function en(e){if(!e)return[];let t;try{t=JSON.parse(e)}catch{return[]}return Array.isArray(t)?t.filter(a=>a&&/^\d{4}-\d{2}$/.test(String(a.key||""))&&a.enabled!==!1).map(a=>({key:String(a.key),closed:!!a.closed})).sort((a,o)=>o.key.localeCompare(a.key)):[]}function Xa(){const e=new Date,t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0");return`${t}-${a}`}async function At(){const e=$("#txq-type"),t=getSelectVal("txq-period");if(e){if(!t){e.innerHTML='<option value="">Selecciona tipo de transacción</option>',e.value="",e.disabled=!0;return}e.innerHTML='<option value="">Cargando tipos del período...</option>',e.disabled=!0;try{let a=he.typeIdsByPeriod[t];if(!Array.isArray(a)){const s=Ra(t);if(!s){e.innerHTML='<option value="">Período inválido</option>',e.value="",e.disabled=!0;return}const n=await pb.listAll("transactions",{filter:`date>="${s.from}" && date<"${s.next}"`,fields:"tx_type_id"});a=[...new Set(n.map(i=>i.tx_type_id).filter(Boolean))],he.typeIdsByPeriod[t]=a}const o=he.txTypes.filter(s=>a.includes(s.id)).sort((s,n)=>`${s.prefix||""}${s.name||""}`.localeCompare(`${n.prefix||""}${n.name||""}`));if(!o.length){e.innerHTML='<option value="">Sin tipos usados en este período</option>',e.value="",e.disabled=!0;return}e.innerHTML=`<option value="">Selecciona tipo de transacción</option>${o.map(s=>`<option value="${esc(s.id)}">${esc(s.prefix)} - ${esc(s.name)}</option>`).join("")}`,e.value="",e.disabled=!1}catch(a){e.innerHTML='<option value="">Error cargando tipos</option>',e.value="",e.disabled=!0,showToast(a.message||"No se pudieron cargar los tipos del período.","error")}}}async function tn(e){var t,a,o,s,n,i;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando transacciones...</div>';try{const[c,r]=await Promise.all([API.getTxTypes(),API.getSetting("periodos_cierre")]),l=en(r);he={page:1,perPage:50,total:0,txTypes:c,periods:l,typeIdsByPeriod:{}},e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Consulta de Transacciones</h3>
          <p class="text-sm" style="color:#6B7280">Consulta por período y tipo para mantener rendimiento con alto volumen.</p>
        </div>
        <div class="flex gap-2">
          ${can("canWrite")?'<button class="btn btn-primary" id="btn-nueva-tx" onclick="openNuevaTxModal()"><i class="fas fa-file-circle-plus"></i> Nueva Transacción</button>':""}
          ${can("canExport")?'<button class="btn btn-outline" id="btn-export-tx"><i class="fas fa-file-excel"></i> Exportar</button>':""}
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select id="txq-period-state" class="form-input">
            <option value="">Estado del período</option>
            <option value="open">Abiertos</option>
            <option value="closed">Cerrados</option>
          </select>
          <select id="txq-period" class="form-input" disabled>
            <option value="">Selecciona un período</option>
          </select>
          <select id="txq-type" class="form-input" disabled>
            <option value="">Selecciona tipo de transacción</option>
            ${c.map(d=>`<option value="${esc(d.id)}">${esc(d.prefix)} - ${esc(d.name)}</option>`).join("")}
          </select>
          <input id="txq" class="form-input md:col-span-2" placeholder="Buscar número, tercero, descripción...">
        </div>
        <div class="flex gap-3 mt-3">
          <select id="txq-status" class="form-input" style="max-width:180px">
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="active">Activa</option>
            <option value="voided">Anulada</option>
          </select>
          <button class="btn btn-primary btn-sm" id="btn-txq-search"><i class="fas fa-search"></i> Buscar</button>
          <button class="btn btn-outline btn-sm" id="btn-txq-clear"><i class="fas fa-eraser"></i> Limpiar</button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div id="ctxq-results">
          <div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-filter mr-2"></i>Selecciona estado de período, período y tipo para consultar.</div>
        </div>
        <div id="ctxq-pagination" class="flex items-center justify-between px-4 py-3 border-t" style="border-color:#F0F0F0; display:none!important"></div>
      </div>`;const p=(d="")=>{const b=getSelectVal("txq-period-state"),u=$("#txq-period"),y=$("#txq-type");if(!u||!y)return;const v=he.periods.filter(g=>b==="open"?!g.closed:b==="closed"?g.closed:!1);if(u.innerHTML=`<option value="">Selecciona un período</option>${v.map(g=>`<option value="${esc(g.key)}">${esc(g.key)} (${g.closed?"Cerrado":"Abierto"})</option>`).join("")}`,u.disabled=!b,!b||!v.length)u.value="";else{const g=d&&v.some(h=>h.key===d)?d:v[0].key;u.value=g}y.value="",y.disabled=!0},f=()=>{if(!getSelectVal("txq-period-state"))return showToast("Selecciona el estado del período (abierto/cerrado).","warning");if(!getSelectVal("txq-period"))return showToast("Selecciona un período para filtrar la consulta.","warning");if(!getSelectVal("txq-type"))return showToast("Selecciona el tipo de transacción a consultar.","warning");he.page=1,Oe()};if((t=$("#btn-txq-search"))==null||t.addEventListener("click",f),(a=$("#txq"))==null||a.addEventListener("keydown",d=>{d.key==="Enter"&&f()}),(o=$("#txq-period-state"))==null||o.addEventListener("change",async()=>{p(),await At()}),(s=$("#txq-period"))==null||s.addEventListener("change",async()=>{await At()}),(n=$("#btn-txq-clear"))==null||n.addEventListener("click",async()=>{["txq"].forEach(b=>setInputVal(b,"")),["txq-type","txq-status"].forEach(b=>{const u=$(`#${b}`);u&&(u.value="")});const d=$("#txq-period-state");d&&(d.value="open"),p(Xa()),await At(),$("#ctxq-results").innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-filter mr-2"></i>Selecciona estado de período, período y tipo para consultar.</div>',$("#ctxq-pagination").style.display="none"}),(i=$("#btn-export-tx"))==null||i.addEventListener("click",an),l.filter(d=>!d.closed).length){const d=$("#txq-period-state");d&&(d.value="open"),p(Xa()),await At()}l.length||showToast("No hay períodos configurados. Habilítalos en Cierre Contable para usar esta consulta.","warning")}catch(c){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(c.message)}</div>`}}async function Oe(){var a,o;const e=$("#ctxq-results"),t=$("#ctxq-pagination");if(e){e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const s=getInputVal("txq").trim(),n=getSelectVal("txq-period-state"),i=getSelectVal("txq-period"),c=getSelectVal("txq-type"),r=getSelectVal("txq-status");if(!n||!i||!c){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-filter mr-2"></i>Completa los filtros obligatorios para consultar.</div>',t.style.display="none";return}const l=Ra(i);if(!l){e.innerHTML='<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>Período inválido.</div>',t.style.display="none";return}const p=[],f=pb.escapeFilterValue(c);if(p.push(`tx_type_id="${f}"`),p.push(`date>="${l.from}"`),p.push(`date<"${l.next}"`),r){const v=pb.escapeFilterValue(r);p.push(`status="${v}"`)}if(s){const v=pb.escapeFilterValue(s);p.push(`(number~"${v}" || description~"${v}")`)}const m={page:he.page,perPage:he.perPage,sort:"-id",filter:p.join(" && ")||"",expand:"tx_type_id,third_party_id"},d=await pb.list("transactions",m);he.total=d.totalItems;const b=Math.ceil(d.totalItems/he.perPage)||1,u=new Map,y=d.items.map(v=>v.id).filter(Boolean);if(y.length){const v=y.map(h=>`tx_id="${pb.escapeFilterValue(h)}"`).join(" || ");(await pb.listAll("tx_lines",{filter:v})).forEach(h=>{const _=h.tx_id;u.has(_)||u.set(_,{d:0,c:0});const A=u.get(_);A.d+=Number(h.debit||0),A.c+=Number(h.credit||0)})}if(!d.items.length){e.innerHTML='<div class="p-10 text-center" style="color:#9CA3AF">No se encontraron transacciones con los filtros aplicados.</div>',t.style.display="none";return}e.innerHTML=`
      <div class="overflow-x-auto">
        <table class="data-table" id="tx-table">
          <thead><tr><th>Número</th><th>Fecha</th><th>Tercero</th><th>Descripción</th><th>Débito</th><th>Crédito</th><th>Balance</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            ${d.items.map(v=>{var A,C;const g=u.get(v.id)||{d:0,c:0},h=Math.abs(Number(g.d||0)-Number(g.c||0)),_=h<1e-4;return`
              <tr>
                <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(v.number||"")}</span></td>
                <td>${esc(v.date)}</td>
                <td>${esc(((C=(A=v.expand)==null?void 0:A.third_party_id)==null?void 0:C.name)||"—")}</td>
                <td class="max-w-xs truncate" title="${esc(v.description||"")}">${esc(v.description||"—")}</td>
                <td class="font-semibold" style="color:#065F46">${fmt(g.d||0)}</td>
                <td class="font-semibold" style="color:#1E3A8A">${fmt(g.c||0)}</td>
                <td>
                  ${_?'<span class="badge badge-green">Cuadrada</span>':`<span class="badge badge-red" title="Diferencia entre débito y crédito"><i class="fas fa-triangle-exclamation mr-1"></i>Descuadre ${fmt(h)}</span>`}
                </td>
                <td>${v.status==="voided"?'<span class="badge badge-red">Anulada</span>':v.status==="draft"?'<span class="badge badge-orange">Borrador</span>':'<span class="badge badge-green">Activa</span>'}</td>
                <td>
                  <div class="flex gap-1">
                    <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="seeTxDetail('${esc(v.id)}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-outline btn-sm" title="Imprimir nota contable" style="border-color:#334155;color:#334155" onclick="printTxNotaContable('${esc(v.id)}')"><i class="fas fa-print"></i></button>
                    ${can("canApprove")&&v.status==="draft"?`<button class="btn btn-primary btn-sm" title="Aprobar transacción" onclick="approveTx('${esc(v.id)}', '${esc(v.number||"")}')"><i class="fas fa-check"></i> Aprobar</button>`:""}
                    ${requireRole("admin")&&v.status==="active"?`<button class="btn btn-outline btn-sm" title="Revertir a Borrador" style="border-color:#D97706;color:#D97706" onclick="revertTxToDraft('${esc(v.id)}', '${esc(v.number||"")}')"><i class="fas fa-rotate-left"></i></button>`:""}
                    ${can("canWrite")&&(v.status==="active"||v.status==="draft")?`<button class="btn btn-outline btn-sm" title="Modificar" style="border-color:#1A4B8C;color:#1A4B8C" onclick="editTx('${esc(v.id)}')"><i class="fas fa-pencil"></i></button>`:""}
                    ${can("canDelete")&&v.status!=="voided"?`<button class="btn btn-danger btn-sm" title="Anular" onclick="voidTx('${esc(v.id)}')"><i class="fas fa-ban"></i></button>`:""}
                    ${requireRole("admin")?`<button class="btn btn-sm" title="Eliminar permanentemente" style="background:#7F1D1D;color:#fff;border-color:#7F1D1D" onclick="deleteTxPhysical('${esc(v.id)}','${esc(v.number||"")}')"><i class="fas fa-trash"></i></button>`:""}
                  </div>
                </td>
              </tr>`}).join("")}
          </tbody>
        </table>
      </div>`,t.style.display="flex",t.innerHTML=`
      <span class="text-sm" style="color:#6B7280">
        Mostrando ${(he.page-1)*he.perPage+1}–${Math.min(he.page*he.perPage,he.total)} de ${he.total} registros
      </span>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" id="ctxq-prev" ${he.page<=1?"disabled":""}><i class="fas fa-chevron-left"></i> Ant.</button>
        <span class="text-sm font-medium px-2 flex items-center">Pág. ${he.page} / ${b}</span>
        <button class="btn btn-outline btn-sm" id="ctxq-next" ${he.page>=b?"disabled":""}>Sig. <i class="fas fa-chevron-right"></i></button>
      </div>`,(a=$("#ctxq-prev"))==null||a.addEventListener("click",()=>{he.page--,Oe()}),(o=$("#ctxq-next"))==null||o.addEventListener("click",()=>{he.page++,Oe()})}catch(s){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(s.message)}</div>`}}}async function an(){if(!can("canExport"))return showToast("Sin permisos de exportación","error");try{showToast("Generando exportación...","info");const e=getInputVal("txq").trim(),t=getSelectVal("txq-period-state"),a=getSelectVal("txq-period"),o=getSelectVal("txq-type"),s=getSelectVal("txq-status");if(!t||!a||!o)return showToast("Para exportar debes seleccionar estado de período, período y tipo.","warning");const n=Ra(a);if(!n)return showToast("Período inválido para exportación.","error");const i=[],c=pb.escapeFilterValue(o);if(i.push(`tx_type_id="${c}"`),i.push(`date>="${n.from}"`),i.push(`date<"${n.next}"`),s){const l=pb.escapeFilterValue(s);i.push(`status="${l}"`)}if(e){const l=pb.escapeFilterValue(e);i.push(`(number~"${l}" || description~"${l}")`)}const r=await pb.listAll("transactions",{sort:"-id",filter:i.join(" && ")||"",expand:"tx_type_id,third_party_id"});exportToExcel(r.map(l=>{var p,f,m,d;return{Número:l.number||"",Fecha:l.date,Tipo:((f=(p=l.expand)==null?void 0:p.tx_type_id)==null?void 0:f.name)||"",Tercero:((d=(m=l.expand)==null?void 0:m.third_party_id)==null?void 0:d.name)||"",Descripción:l.description||"",Estado:l.status==="voided"?"Anulada":"Activa"}}),`transacciones_${todayStr()}`)}catch(e){showToast(e.message,"error")}}async function cr(e){var t,a;try{const o=await pb.get("transactions",e,{expand:"tx_type_id,third_party_id,user_id"}),s=await API.getTxLines(e);openModal(`Transacción ${esc(o.number||"")}`,`
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
        <div><strong>Fecha:</strong> ${esc(o.date)}</div>
        <div><strong>Tercero:</strong> ${esc(((a=(t=o.expand)==null?void 0:t.third_party_id)==null?void 0:a.name)||"—")}</div>
        <div><strong>Estado:</strong> ${esc(o.status)}</div>
      </div>
      <p class="mb-4" style="color:#6B7280">${esc(o.description||"")}</p>
      <div class="overflow-x-auto">
        <table class="data-table"><thead><tr><th>Cuenta</th><th>Tercero línea</th><th>Doc. Cruce</th><th>Descripción</th><th>Débito</th><th>Crédito</th></tr></thead>
          <tbody>${s.map(n=>{var i,c,r,l,p,f;return`<tr><td>${esc(((c=(i=n.expand)==null?void 0:i.account_id)==null?void 0:c.code)||"")} - ${esc(((l=(r=n.expand)==null?void 0:r.account_id)==null?void 0:l.name)||"")}</td><td>${esc(((f=(p=n.expand)==null?void 0:p.third_party_id)==null?void 0:f.name)||"—")}</td><td>${n.cross_doc_ref?`<span class="badge" style="background:#EFF6FF;color:#1A4B8C"><i class="fas fa-link mr-1"></i>${esc(n.cross_doc_ref)}</span>`:"—"}</td><td>${esc(n.description||"—")}</td><td>${fmt(n.debit||0)}</td><td>${fmt(n.credit||0)}</td></tr>`}).join("")}</tbody>
        </table>
      </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       <button class="btn btn-outline" style="border-color:#334155;color:#334155" onclick="printTxNotaContable('${esc(e)}')"><i class="fas fa-print mr-1"></i>Imprimir nota contable</button>`,!0)}catch(o){showToast(o.message,"error")}}function rr(e,t){if(!can("canApprove"))return showToast("No tienes permisos para aprobar transacciones","error");confirmDialog("Aprobar transacción",`¿Confirmas aprobar la transacción <strong>${esc(t)}</strong>? Quedará <strong>Activa</strong> y se reflejará en los reportes contables.`,async()=>{try{await API.approveTx(e),showToast(`Transacción ${t} aprobada exitosamente.`,"success"),typeof Oe=="function"&&Oe()}catch(a){showToast(a.message,"error")}})}function lr(e,t){if(!requireRole("admin"))return showToast("Solo el administrador puede revertir transacciones a Borrador","error");confirmDialog("Revertir a Borrador",`¿Confirmas revertir la transacción <strong>${esc(t)}</strong> a estado <strong>Borrador</strong>? Dejará de reflejarse en los reportes hasta ser aprobada nuevamente.`,async()=>{try{await API.revertTxToDraft(e),showToast(`Transacción ${t} revertida a Borrador.`,"success"),typeof Oe=="function"&&Oe()}catch(a){showToast(a.message,"error")}})}function dr(e){if(!can("canDelete"))return showToast("No tienes permisos para anular","error");confirmDialog("Anular transacción","Esta acción cambia el estado a anulada. ¿Deseas continuar?",async()=>{try{if(typeof isPeriodClosed=="function"){const t=await pb.get("transactions",e);if(await isPeriodClosed(t.date))return showToast(`El período ${(t.date||"").slice(0,7)} no está habilitado o está cerrado. No se puede anular.`,"error")}await API.voidTransaction(e,"Anulación desde consulta"),showToast("Transacción anulada","success"),tn($("#page-content"))}catch(t){showToast(t.message,"error")}})}let ae={txId:null,accounts:[],txTypes:[],terceros:[],selectedThird:"",lines:[],postableAccountIds:new Set,accountMap:new Map};async function pr(e){var t,a;if(!can("canWrite"))return showToast("No tienes permisos para modificar transacciones","error");openModal('<i class="fas fa-spinner fa-spin mr-2"></i>Verificando transacción...','<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos...</div>',"",!0);try{const[o,s,n,i,c]=await Promise.all([pb.get("transactions",e,{expand:"tx_type_id,third_party_id"}),API.getTxLines(e),API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]);if(o.status==="voided")return openModal("No permitido",'<p class="text-sm" style="color:#374151">No se puede modificar una transacción anulada.</p>','<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>');if(typeof isPeriodClosed=="function"&&await isPeriodClosed(o.date))return openModal("Período cerrado",`<p class="text-sm" style="color:#374151">El período <strong>${esc((o.date||"").slice(0,7))}</strong> está cerrado. Habilítalo en Cierre Contable para poder modificar esta transacción.</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>');const r=await API.checkTxDependencies(e);if(r.blocks.length){const d=r.blocks.map(b=>`<li class="text-sm py-1"><i class="fas fa-ban mr-2" style="color:#EF4444"></i>${esc(b)}</li>`).join("");return openModal('<i class="fas fa-lock mr-2" style="color:#EF4444"></i>No se puede modificar',`<p class="text-sm mb-3" style="color:#374151">Esta transacción tiene dependencias que impiden su modificación:</p><ul class="space-y-1">${d}</ul>`,'<button class="btn btn-outline" onclick="closeModal()">Entendido</button>')}const l=new Set(n.map(d=>d.parent_code).filter(Boolean)),p=new Set(n.filter(d=>!l.has(d.code)).map(d=>d.id)),f=new Map(n.map(d=>[d.id,d]));ae={txId:e,accounts:n,txTypes:i,terceros:c,postableAccountIds:p,accountMap:f,selectedThird:o.third_party_id||"",lines:s.map(d=>({account_id:d.account_id,third_party_id:d.third_party_id||o.third_party_id||"",debit:d.debit||0,credit:d.credit||0,description:d.description||"",cross_doc_ref:d.cross_doc_ref||"",ret_base:"",ret_rate:"",line_order:d.line_order||0}))};const m=r.warnings.length?`<div class="mb-4 p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #D97706">${r.warnings.map(d=>`<p class="text-sm" style="color:#92400E"><i class="fas fa-triangle-exclamation mr-2"></i>${esc(d)}</p>`).join("")}</div>`:"";openModal(`<i class="fas fa-pencil mr-2" style="color:#1A4B8C"></i>Modificar — ${esc(o.number||"")}`,`${m}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <input class="form-input" value="${esc(((a=(t=o.expand)==null?void 0:t.tx_type_id)==null?void 0:a.name)||"")}" readonly style="background:#F9FAFB">
        </div>
        <div class="form-group">
          <label class="form-label">Número</label>
          <input class="form-input" value="${esc(o.number||"")}" readonly style="background:#F9FAFB">
        </div>
        <div class="form-group">
          <label class="form-label">Fecha</label>
          <input id="edit-tx-date" type="date" class="form-input" value="${esc(o.date||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Tercero</label>
          <div class="flex gap-2">
            <div id="edit-tx-third-search-wrap" class="relative" style="flex:1">
              <input id="edit-tx-third-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre" value="${esc(Lt(c.find(d=>d.id===o.third_party_id)||null))}">
              <input id="edit-tx-third" type="hidden" value="${esc(o.third_party_id||"")}">
              <div id="edit-tx-third-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
            </div>
            <button id="btn-edit-cartera" class="btn btn-outline btn-sm" title="Ver saldo de cartera del tercero" style="white-space:nowrap;border-color:#1A4B8C;color:#1A4B8C" ${o.third_party_id?"":"disabled"}>
              <i class="fas fa-file-invoice-dollar"></i> Cartera
            </button>
          </div>
        </div>
        <div class="form-group md:col-span-3">
          <label class="form-label">Descripción</label>
          <input id="edit-tx-desc" class="form-input" value="${esc(o.description||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Plazo (días)</label>
          <input id="edit-tx-payment-days" type="number" min="0" class="form-input" value="${esc(o.payment_days??0)}" placeholder="0">
        </div>
      </div>
      <div class="border-t pt-4" style="border-color:#F0F0F0">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-bold text-sm" style="color:#0D2137">Líneas contables</h4>
          <button class="btn btn-outline btn-sm" onclick="addEditTxLine()"><i class="fas fa-plus"></i> Agregar línea</button>
        </div>
        <div id="edit-tx-lines"></div>
        <div id="edit-tx-balance" class="balance-indicator balance-err mt-3"><i class="fas fa-triangle-exclamation"></i> Descuadrada</div>
      </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="saveEditTx('${esc(e)}')"><i class="fas fa-floppy-disk"></i> Guardar cambios</button>`,!0),Ze(!0),Ho()}catch(o){openModal("Error",`<p class="text-sm" style="color:#EF4444">${esc(o.message)}</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>')}}function Ho(){const e=$("#edit-tx-third"),t=$("#edit-tx-third-search"),a=$("#btn-edit-cartera");!e||!a||!t||(ae&&(ae.selectedThird=e.value||ae.selectedThird||""),Uo({state:ae,hiddenId:"edit-tx-third",inputId:"edit-tx-third-search",resultsId:"edit-tx-third-results",onSelected:o=>{a.disabled=!o,ae&&(ae.selectedThird=o||"")}}),a.disabled=!e.value,a.onclick=()=>Da(e.value,{returnToPrevious:!0}))}function on(e=null){ae.lines.push(e||{account_id:"",third_party_id:"",debit:0,credit:0,description:"",cross_doc_ref:"",ret_base:"",ret_rate:""}),Ze(!0)}function ur(e){ae.lines.splice(e,1),Ze(!0)}function sn(e){const t=ae.lines[e];if(!t||!(e===ae.lines.length-1))return;const o=Number(t.debit||0),s=Number(t.credit||0),n=o>0&&s<=0||s>0&&o<=0;!t.account_id||!n||on()}function mr(e){openLineComment(e,"edit")}function nn(e,t,a){if(ae.lines[e][t]=a,t==="debit"&&Number(a)>0&&(ae.lines[e].credit=0),t==="credit"&&Number(a)>0&&(ae.lines[e].debit=0),t==="account_id"){ae.lines[e].cross_doc_ref="",ae.lines[e].ret_base="";const o=ae.accountMap.get(a);if(o!=null&&o.maneja_retenciones){const s=(o.tipos_retencion||"").split(",").filter(Boolean);ae.lines[e].ret_rate=String(mt(s,o))}else ae.lines[e].ret_rate="";Ze(!0)}else if(t==="ret_base"||t==="ret_rate"){const o=Number(ae.lines[e].ret_base||0),s=Number(ae.lines[e].ret_rate||0),n=document.getElementById(`edit-ret-calc-${e}`);n&&(n.textContent=o&&s?fmt(o*s/100):"$0")}else if(t==="debit"||t==="credit"){const o=t==="debit"?"credit":"debit",s=document.getElementById(`edit-tx-line-${o}-${e}`);if(s){const n=Number(a)>0;s.disabled=n,n&&(s.value="")}cn()}else Ze(!1)}function fr(e){const t=ae.lines[e],a=Number(t.ret_base||0),o=ae.accountMap.get(t.account_id),s=((o==null?void 0:o.tipos_retencion)||"").split(",").filter(Boolean),n=Number(t.ret_rate||mt(s,o)||0);if(ae.lines[e].ret_rate=n?String(n):"",!a||!n)return showToast("Ingresa la base gravable para calcular la retención","warning");const i=Math.round(a*n/100);(o==null?void 0:o.nature)==="debit"?(ae.lines[e].debit=i,ae.lines[e].credit=0):(ae.lines[e].credit=i,ae.lines[e].debit=0),Ze(!0),sn(e),showToast(`Retención aplicada: ${fmt(i)}`,"success")}function cn(){const e=ae.lines.reduce((o,s)=>(o.d+=Number(s.debit||0),o.c+=Number(s.credit||0),o),{d:0,c:0}),t=Math.abs(e.d-e.c)<1e-4&&e.d>0,a=document.getElementById("edit-tx-balance");a&&(a.className=`balance-indicator ${t?"balance-ok":"balance-err"}`,a.innerHTML=t?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(e.d)} = Crédito ${fmt(e.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(e.d-e.c))}`)}function Ze(e=!0){if(e){const s=ae.lines.map((i,c)=>{const r=ae.accountMap.get(i.account_id),l=!!(r!=null&&r.requires_third_party),p=!!(r!=null&&r.maneja_cruce),f=!!(r!=null&&r.maneja_retenciones),m=!!String(i.description||"").trim(),d=((r==null?void 0:r.tipos_retencion)||"").split(",").filter(Boolean),b=Number(i.ret_base||0),u=Number(i.ret_rate!==""?i.ret_rate:d.length?mt(d,r):0),y=b&&u?fmt(b*u/100):"$0",v=Number(i.debit||0),g=Number(i.credit||0);return`
      <div class="tx-line-row" data-i="${c}" style="display:grid;grid-template-columns:minmax(250px,320px) minmax(260px,1fr) minmax(160px,190px) minmax(120px,140px) minmax(120px,140px) auto auto;gap:8px;align-items:center">
        <select class="form-input" style="font-size:13px" onchange="updateEditTxLine(${c}, 'account_id', this.value)">
          <option value="">Seleccione cuenta...</option>
          ${ae.accounts.map(h=>{const _=ae.postableAccountIds.has(h.id);return`<option value="${esc(h.id)}" ${i.account_id===h.id?"selected":""} ${_?"":"disabled"}>${esc(h.code)} - ${esc(h.name)}${_?"":" [MAYOR]"}</option>`}).join("")}
        </select>
        <div style="display:flex;flex-direction:column;gap:3px;min-width:0">
          <div style="display:flex;align-items:center;gap:6px">
            <i class="fas fa-user-tag" style="color:#334155;font-size:11px"></i>
            <span class="text-xs font-semibold" style="color:#334155;white-space:nowrap">Tercero línea</span>
            ${l?'<span class="text-xs" style="color:#B91C1C">Obligatorio</span>':'<span class="text-xs" style="color:#94A3B8">Opcional</span>'}
          </div>
          <div id="edit-tx-line-third-${c}-wrap" class="relative">
            <input id="edit-tx-line-third-${c}-search" class="form-input" style="font-size:13px" autocomplete="off" placeholder="Buscar tercero de la línea">
            <input id="edit-tx-line-third-${c}" type="hidden" value="${esc(i.third_party_id||"")}">
            <div id="edit-tx-line-third-${c}-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:20"></div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:3px">
          <div style="display:flex;align-items:center;gap:6px">
            <i class="fas fa-link" style="color:#1A4B8C;font-size:11px"></i>
            <span class="text-xs font-semibold" style="color:#1A4B8C;white-space:nowrap">Doc. de Cruce</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <input class="form-input" style="font-size:13px" ${p?"":"disabled"} placeholder="N° factura / documento" value="${esc(i.cross_doc_ref||"")}" oninput="updateEditTxLine(${c}, 'cross_doc_ref', this.value)">
            ${p?`<button class="btn btn-outline btn-sm" style="padding:3px 8px;font-size:11px;border-color:#1A4B8C;color:#1A4B8C;flex-shrink:0" title="Consultar cartera de este tercero" onclick="showCarteraForLine(${c}, 'edit')"><i class="fas fa-search"></i></button>`:""}
          </div>
        </div>

        <input id="edit-tx-line-debit-${c}" class="form-input text-right" ${g>0?"disabled":""} value="${i.debit?esc(i.debit):""}" placeholder="Débito" oninput="updateEditTxLine(${c}, 'debit', parseNum(this.value))" onblur="autoAppendEditTxLineFrom(${c})">
        <input id="edit-tx-line-credit-${c}" class="form-input text-right" ${v>0?"disabled":""} value="${i.credit?esc(i.credit):""}" placeholder="Crédito" oninput="updateEditTxLine(${c}, 'credit', parseNum(this.value))" onblur="autoAppendEditTxLineFrom(${c})">

        <button class="btn btn-outline btn-sm" title="Comentario por registro" style="${m?"border-color:#16A34A;color:#16A34A;background:#F0FDF4":"border-color:#64748B;color:#334155"}" onclick="editEditTxLineComment(${c})"><i class="fas fa-comment-dots"></i></button>
        <button class="btn btn-danger btn-sm" onclick="removeEditTxLine(${c})"><i class="fas fa-xmark"></i></button>
      </div>
      ${f?`
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:-2px 0 6px 0;padding:7px 10px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:0 6px 6px 0">
        <i class="fas fa-percent" style="color:#D97706;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#92400E;white-space:nowrap">Calculadora de Retención</span>
         ${d.map(h=>`<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:10px">${Mo(h,r)}</span>`).join("")}
        <span class="text-xs" style="color:#92400E">Base:</span>
        <input class="form-input" style="max-width:140px;font-size:13px" type="number" min="0" step="1" placeholder="Base gravable"
               value="${esc(i.ret_base||"")}" oninput="updateEditTxLine(${c}, 'ret_base', this.value)">
        <span class="text-xs" style="color:#92400E">×</span>
         <span class="badge" style="background:#FDE68A;color:#92400E;font-size:11px">${esc(u)}%</span>
        <span id="edit-ret-calc-${c}" class="text-sm font-bold" style="color:#D97706;min-width:70px">${y}</span>
        <button class="btn btn-sm" style="background:#D97706;color:#fff;padding:4px 10px;font-size:12px" onclick="applyEditRetentionCalc(${c})">
          <i class="fas fa-check"></i> Aplicar
        </button>
      </div>`:""}`}).join(""),n=document.getElementById("edit-tx-lines");n&&(n.innerHTML=s||'<p style="color:#9CA3AF">Agrega al menos una línea.</p>'),Vo("edit")}const t=ae.lines.reduce((s,n)=>(s.d+=Number(n.debit||0),s.c+=Number(n.credit||0),s),{d:0,c:0}),a=Math.abs(t.d-t.c)<1e-4&&t.d>0,o=document.getElementById("edit-tx-balance");o&&(o.className=`balance-indicator ${a?"balance-ok":"balance-err"}`,o.innerHTML=a?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(t.d)} = Crédito ${fmt(t.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(t.d-t.c))}`)}async function br(e){var l,p,f,m;if(!can("canWrite"))return showToast("No tienes permisos para modificar transacciones","error");const t=((l=document.getElementById("edit-tx-date"))==null?void 0:l.value)||"",a=(((p=document.getElementById("edit-tx-desc"))==null?void 0:p.value)||"").trim(),o=((f=document.getElementById("edit-tx-third"))==null?void 0:f.value)||ae.selectedThird||"";if(!t)return showToast("La fecha es obligatoria","warning");if(!a)return showToast("La descripción es obligatoria","warning");const s=ae.lines.filter(d=>d.account_id&&(Number(d.debit)>0||Number(d.credit)>0));if(s.length<2)return showToast("Se requieren al menos 2 líneas contables","warning");const n=s.find(d=>!ae.postableAccountIds.has(d.account_id));if(n){const d=ae.accounts.find(b=>b.id===n.account_id);return showToast(`La cuenta ${(d==null?void 0:d.code)||""} es de mayor; usa una cuenta auxiliar`,"error")}const i=s.find(d=>{const b=ae.accounts.find(u=>u.id===d.account_id);return!!(b!=null&&b.requires_third_party)&&!(d.third_party_id||o)});if(i){const d=ae.lines.indexOf(i);return showToast(`La línea ${d+1} requiere tercero. Selecciónalo en la línea o en el encabezado.`,"error")}const c=s.reduce((d,b)=>({d:d.d+Number(b.debit||0),c:d.c+Number(b.credit||0)}),{d:0,c:0});if(Math.abs(c.d-c.c)>1e-4||c.d<=0)return showToast("La transacción no está cuadrada","error");if(typeof isPeriodClosed=="function"&&await isPeriodClosed(t))return showToast(`El período ${t.slice(0,7)} está cerrado. No se puede modificar.`,"error");const r=document.querySelector("#modal-footer .btn-primary");r&&(r.disabled=!0,r.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{await API.updateTransaction(e,{date:t,description:a,third_party_id:o||null,payment_days:parseInt((m=document.getElementById("edit-tx-payment-days"))==null?void 0:m.value,10)||0},s.map((d,b)=>({account_id:d.account_id,third_party_id:d.third_party_id||o||null,debit:Number(d.debit||0),credit:Number(d.credit||0),description:d.description||a,line_order:b+1,cross_doc_ref:d.cross_doc_ref||""}))),closeModal(),showToast("Transacción modificada exitosamente","success"),Oe()}catch(d){r&&(r.disabled=!1,r.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar cambios'),showToast(d.message,"error")}}function gr(e,t){if(!requireRole("admin"))return showToast("Solo el administrador puede eliminar transacciones físicamente","error");openModal('<i class="fas fa-spinner fa-spin mr-2"></i>Verificando dependencias...','<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Analizando...</div>',"",!1),API.checkTxDependencies(e).then(a=>{if(a.blocks.length){const s=a.blocks.map(n=>`<li class="text-sm py-1"><i class="fas fa-ban mr-2" style="color:#EF4444"></i>${esc(n)}</li>`).join("");return openModal('<i class="fas fa-lock mr-2" style="color:#EF4444"></i>No se puede eliminar',`<p class="text-sm mb-3" style="color:#374151">Esta transacción no puede eliminarse por las siguientes razones:</p>
         <ul class="space-y-1">${s}</ul>
         <p class="text-sm mt-4" style="color:#6B7280">Usa <strong>Anular</strong> para invalidarla contablemente sin perder la trazabilidad.</p>`,'<button class="btn btn-outline" onclick="closeModal()">Entendido</button>')}const o=a.warnings.length?`<div class="mb-3 p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #D97706">${a.warnings.map(s=>`<p class="text-sm" style="color:#92400E"><i class="fas fa-triangle-exclamation mr-2"></i>${esc(s)}</p>`).join("")}</div>`:"";openModal('<i class="fas fa-trash mr-2" style="color:#991B1B"></i>Eliminar transacción permanentemente',`${o}
       <div class="p-3 rounded-lg mb-4" style="background:#FEF2F2;border:1px solid #FECACA">
         <p class="text-sm font-semibold mb-1" style="color:#991B1B"><i class="fas fa-triangle-exclamation mr-2"></i>Esta acción es IRREVERSIBLE</p>
         <p class="text-sm" style="color:#374151">Se eliminará permanentemente el comprobante <strong>${esc(t)}</strong> y todas sus líneas contables. No podrá recuperarse.</p>
       </div>
       <div class="form-group">
         <label class="form-label">Para confirmar, escribe el número del comprobante: <strong>${esc(t)}</strong></label>
         <input id="delete-tx-confirm-input" class="form-input" placeholder="${esc(t)}" autocomplete="off">
       </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-danger" id="btn-confirm-delete-tx" onclick="_confirmDeleteTx('${esc(e)}','${esc(t)}')">
         <i class="fas fa-trash"></i> Eliminar definitivamente
       </button>`)}).catch(a=>{openModal("Error",`<p class="text-sm" style="color:#EF4444">${esc(a.message)}</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>')})}async function vr(e,t){var s;if((((s=document.getElementById("delete-tx-confirm-input"))==null?void 0:s.value)||"").trim()!==t)return showToast(`Escribe exactamente: ${t}`,"warning");const o=document.getElementById("btn-confirm-delete-tx");o&&(o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Eliminando...');try{await pb.delete("transactions",e),await API.logAudit("DELETE","transactions",e,`Eliminación física del comprobante ${t}`),closeModal(),showToast(`Comprobante ${t} eliminado permanentemente`,"success"),Oe()}catch(n){o&&(o.disabled=!1,o.innerHTML='<i class="fas fa-trash"></i> Eliminar definitivamente'),showToast(n.message,"error")}}async function hr(e){var t,a,o,s,n,i,c,r,l,p,f;try{const[m,d,b,u,y]=await Promise.all([pb.get("transactions",e,{expand:"tx_type_id,third_party_id,user_id"}),API.getTxLines(e),API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>"")]),v=d.reduce((E,L)=>E+Number(L.debit||0),0),g=d.reduce((E,L)=>E+Number(L.credit||0),0),h=((a=(t=m.expand)==null?void 0:t.tx_type_id)==null?void 0:a.name)||((s=(o=m.expand)==null?void 0:o.tx_type_id)==null?void 0:s.prefix)||"",_=((i=(n=m.expand)==null?void 0:n.third_party_id)==null?void 0:i.name)||"",A=((r=(c=m.expand)==null?void 0:c.third_party_id)==null?void 0:r.doc_number)||"",C=((p=(l=m.expand)==null?void 0:l.user_id)==null?void 0:p.name)||"",T=((f=pb.currentUser)==null?void 0:f.name)||"",N=d.map((E,L)=>{var K,H,x,P,V,U;const R=((H=(K=E.expand)==null?void 0:K.account_id)==null?void 0:H.code)||"",M=((P=(x=E.expand)==null?void 0:x.account_id)==null?void 0:P.name)||"",B=((U=(V=E.expand)==null?void 0:V.third_party_id)==null?void 0:U.name)||_||"—",k=E.cross_doc_ref||"",j=Number(E.debit||0),Y=Number(E.credit||0),W=j>0;return`
        <tr class="${L%2===0?"row-even":"row-odd"}">
          <td class="col-num">${L+1}</td>
          <td class="col-code">${esc(R)}</td>
          <td class="col-acct">${esc(M)}</td>
          <td class="col-third">${esc(B)}</td>
          <td class="col-cross">${k?esc(k):""}</td>
          <td class="col-desc">${esc(E.description||m.description||"")}</td>
          <td class="col-money debit">${W?fmt(j):""}</td>
          <td class="col-money credit">${W?"":fmt(Y)}</td>
        </tr>`}).join(""),I=new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"}),S=`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Nota Contable ${esc(m.number||"")}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #111; background: #fff; padding: 18mm 15mm 15mm 15mm; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #0D2137; padding-bottom: 8px; margin-bottom: 10px; }
    .company-block { flex: 1; }
    .company-name { font-size: 13pt; font-weight: bold; color: #0D2137; }
    .company-sub { font-size: 8.5pt; color: #444; margin-top: 2px; }
    .doc-block { text-align: right; min-width: 180px; }
    .doc-number { font-size: 14pt; font-weight: bold; color: #1A4B8C; letter-spacing: 0.5px; }
    .doc-type { font-size: 8.5pt; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
    .doc-date { font-size: 9pt; color: #444; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 12px; font-size: 9pt; }
    .meta-row { display: flex; gap: 6px; }
    .meta-label { font-weight: bold; color: #0D2137; white-space: nowrap; min-width: 90px; }
    .meta-value { color: #333; }
    .section-title { font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; border-bottom: 1px solid #E5E7EB; padding-bottom: 3px; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
    thead tr { background: #0D2137; color: #fff; }
    thead th { padding: 5px 6px; text-align: left; font-weight: 600; border: 1px solid #0D2137; white-space: nowrap; }
    thead th.col-money { text-align: right; }
    tbody tr.row-even { background: #F8FAFC; }
    tbody tr.row-odd  { background: #fff; }
    tbody td { padding: 4px 6px; border: 1px solid #E5E7EB; vertical-align: top; }
    td.debit, td.credit, th.col-money { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    td.debit  { color: #065F46; font-weight: 600; }
    td.credit { color: #1E3A8A; font-weight: 600; }
    .col-num   { width: 26px; text-align: center; }
    .col-code  { width: 90px; font-family: monospace; font-size: 8pt; }
    .col-acct  { min-width: 120px; }
    .col-third { min-width: 100px; }
    .col-cross { width: 80px; font-family: monospace; font-size: 8pt; }
    .col-desc  { min-width: 100px; color: #555; }
    .col-money { width: 95px; }
    tfoot td { border: 1px solid #CBD5E1; padding: 5px 6px; font-weight: bold; font-size: 9pt; }
    .totals-label { text-align: right; color: #0D2137; }
    .totals-debit  { text-align: right; color: #065F46; }
    .totals-credit { text-align: right; color: #1E3A8A; }
    .balanced-ok  { color: #059669; font-weight: bold; font-size: 8pt; }
    .balanced-err { color: #DC2626; font-weight: bold; font-size: 8pt; }
    .footer-bar { margin-top: 18px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8pt; color: #555; border-top: 1px solid #D1D5DB; padding-top: 8px; }
    .sig-block { text-align: center; min-width: 140px; }
    .sig-line  { border-top: 1px solid #888; margin-top: 28px; padding-top: 3px; font-size: 7.5pt; color: #444; }
    @media print {
      body { padding: 0; }
      @page { margin: 14mm 12mm 12mm 12mm; size: letter portrait; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-block">
      <div class="company-name">${esc(b||"GRAVY")}</div>
      ${u?`<div class="company-sub">NIT: ${esc(u)}</div>`:""}
      ${y?`<div class="company-sub">${esc(y)}</div>`:""}
    </div>
    <div class="doc-block">
      <div class="doc-type">${esc(h)}</div>
      <div class="doc-number">${esc(m.number||"")}</div>
      <div class="doc-date">${esc(m.date||"")}</div>
      ${m.status==="voided"?'<div style="color:#DC2626;font-weight:bold;font-size:10pt;margin-top:4px">&#x26D4; ANULADO</div>':""}
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-row">
      <span class="meta-label">Tercero:</span>
      <span class="meta-value">${_?esc(_)+(A?" — "+esc(A):""):"—"}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Impreso por:</span>
      <span class="meta-value">${esc(T||"—")}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Concepto:</span>
      <span class="meta-value">${esc(m.description||"—")}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Fecha impresión:</span>
      <span class="meta-value">${I}</span>
    </div>
  </div>

  <div class="section-title">Partidas contables</div>
  <table>
    <thead>
      <tr>
        <th class="col-num">#</th>
        <th class="col-code">Código</th>
        <th class="col-acct">Cuenta</th>
        <th class="col-third">Tercero</th>
        <th class="col-cross">Doc. Cruce</th>
        <th class="col-desc">Descripción</th>
        <th class="col-money">Débito</th>
        <th class="col-money">Crédito</th>
      </tr>
    </thead>
    <tbody>${N}</tbody>
    <tfoot>
      <tr>
        <td colspan="6" class="totals-label">TOTALES</td>
        <td class="totals-debit">${fmt(v)}</td>
        <td class="totals-credit">${fmt(g)}</td>
      </tr>
      <tr>
        <td colspan="8" style="text-align:right;border-top:none;padding-top:3px">
          ${Math.abs(v-g)<1e-4?'<span class="balanced-ok">&#x2713; Comprobante cuadrado — Débito = Crédito</span>':`<span class="balanced-err">&#x26A0; Descuadre: ${fmt(Math.abs(v-g))}</span>`}
        </td>
      </tr>
    </tfoot>
  </table>

  <div class="footer-bar">
    <div class="sig-block">
      <div style="margin-bottom:32px;font-weight:500;color:#111">${esc(C)}</div>
      <div class="sig-line">elaborado por</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">Revisado por</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">Aprobado por</div>
    </div>
    <div style="text-align:right;font-size:7.5pt;color:#9CA3AF">
      GRAVY &mdash; Plataforma contable inteligente<br>
      ${esc(m.number||"")} &mdash; ${esc(m.date||"")}
    </div>
  </div>

  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`,w=window.open("","_blank","width=900,height=700,scrollbars=yes");if(!w)return showToast("El navegador bloqueó la ventana emergente. Permite ventanas emergentes para imprimir.","warning");w.document.open(),w.document.write(S),w.document.close()}catch(m){showToast("Error al generar la nota contable: "+m.message,"error")}}async function yr(e){return Ys(e)}window.TX_EDIT_STATE=ae;window.editEditTxLineComment=mr;window.renderNuevaTx=Ys;window.getCrossAutoMode=Zs;window.loadConsultaTxPage=Oe;window.RET_RATE_FIELD_BY_TYPE=ko;window.addEditTxLine=on;window.bindNewTxModalEvents=La;window.updateEditTxLine=nn;window.editTxLineComment=or;window._confirmDeleteTx=vr;window.exportConsultaTx=an;window.buildTxTypeOptions=jo;window.closeCarteraModal=va;window.updateTypeOptionsForPeriod=At;window.renderThirdSearchResults=Bo;window.CTXQ_STATE=he;window.seeTxDetail=cr;window.editTx=pr;window.useCrossDoc=ir;window.applyCrossAmountByType=Za;window.saveEditTx=br;window.bindEditCarteraEvents=Ho;window.revertTxToDraft=lr;window.getThirdById=Xt;window.applyRetentionCalc=sr;window._carteraSetContent=ha;window.showCarteraForLine=nr;window.calcPeriodRange=Ra;window.approveTx=rr;window.currentPeriodKey=Xa;window.RET_DEFAULT_RATES=Ht;window.CARTERA_MODAL_PREV=Ct;window.voidTx=dr;window.updateTxBalance=Qs;window.autoAppendTxLineFrom=Js;window.renderTxLines=dt;window.initThirdSearchInput=Uo;window.autoAppendEditTxLineFrom=sn;window.CARTERA_TARGET_LINE=Tt;window.renderEditTxLines=Ze;window.TX_STATE=ce;window.addTxLine=lt;window.bindTxLineThirdSearches=Vo;window.retRateLabel=Mo;window.removeTxLine=ar;window.openNuevaTxModal=tr;window.initLineThirdSearchInput=Ws;window.updateTxLine=Ks;window.CARTERA_CONTEXT=Fa;window.removeEditTxLine=ur;window.updateEditTxBalance=cn;window.retLabel=zs;window.refreshConsecutive=Pa;window.saveTransaction=Xs;window.renderConsultaTx=tn;window.normalizeConsultaPeriods=en;window.showCarteraModal=Da;window.applyEditRetentionCalc=fr;window.defaultRetRate=mt;window.deleteTxPhysical=gr;window.thirdDisplay=Lt;window.printTxNotaContable=hr;window.renderTransacciones=yr;let $e={accounts:null,saldos:null,transactions:null,txLines:null,thirdParties:null};async function _r(e){var t,a,o,s,n,i,c,r;e.innerHTML=`
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Reportes Financieros</h3>
        <p class="text-sm" style="color:#6B7280">Selecciona el reporte a generar. Se carga solo bajo demanda.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5" id="report-cards">
      ${je("trial","Balance de Prueba","Saldos débitos y créditos por cuenta.")}
      ${je("income","Estado de Resultados","Ingresos, gastos y utilidad neta.")}
      ${je("position","Estado de Situación Financiera","Activos, pasivos y patrimonio (Balance General).")}
      ${je("journal","Libro Diario","Detalle cronológico de movimientos contables.")}
      ${je("aux","Libro Auxiliar","Movimientos por Cuenta y Tercero o Tercero y Cuenta.")}
      ${je("ar-bal","Saldos Cuentas por Cobrar","Pendientes por tercero y cuenta de cartera.")}
      ${je("ap-bal","Saldos Cuentas por Pagar","Pendientes por tercero y cuenta por pagar.")}
      ${je("aging","Cartera por Edades","Tramos 0-30-60-90+ para clientes o proveedores.")}
    </div>`,(t=$("#btn-report-trial"))==null||t.addEventListener("click",()=>Ve("Balance de Prueba",()=>mn())),(a=$("#btn-report-income"))==null||a.addEventListener("click",()=>Ve("Estado de Resultados",()=>bn())),(o=$("#btn-report-position"))==null||o.addEventListener("click",()=>Ve("Estado de Situación Financiera",()=>gn())),(s=$("#btn-report-journal"))==null||s.addEventListener("click",()=>Ve("Libro Diario",()=>vn())),(n=$("#btn-report-aux"))==null||n.addEventListener("click",()=>Ve("Libro Auxiliar",()=>hn())),(i=$("#btn-report-ar-bal"))==null||i.addEventListener("click",()=>Ve("Saldos Cuentas por Cobrar",()=>eo("cxc"))),(c=$("#btn-report-ap-bal"))==null||c.addEventListener("click",()=>Ve("Saldos Cuentas por Pagar",()=>eo("cxp"))),(r=$("#btn-report-aging"))==null||r.addEventListener("click",()=>Ve("Cartera por Edades",()=>un()))}function tt(){return $("#report-view-modal")||$("#report-view")}function Ve(e,t){openModal(`<i class="fas fa-chart-column mr-2" style="color:#1A4B8C"></i>${esc(e)}`,'<div id="report-view-modal" class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando reporte...</div>','<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0),setTimeout(()=>{t()},0)}function je(e,t,a){return`
    <div class="bg-white rounded-2xl border p-4" style="border-color:#F0F0F0">
      <h4 class="font-bold mb-1" style="color:#0D2137">${esc(t)}</h4>
      <p class="text-sm mb-3" style="color:#6B7280">${esc(a)}</p>
      <button class="btn btn-primary btn-sm" id="btn-report-${esc(e)}"><i class="fas fa-play"></i> Generar</button>
    </div>`}async function at(){if(!$e.accounts||!$e.saldos){const[e,t]=await Promise.all([API.getAccounts(!1),API.getAccountSaldos()]);$e.accounts=e,$e.saldos=t}return{accounts:$e.accounts,saldos:$e.saldos}}async function ot(){if(!$e.transactions||!$e.txLines||!$e.thirdParties){const[e,t,a]=await Promise.all([pb.listAll("transactions",{sort:"-id",expand:"tx_type_id,third_party_id",filter:'status="active"'}),pb.listAll("tx_lines",{sort:"id",expand:"account_id,tx_id"}),pb.listAll("third_parties",{sort:"name"})]);$e.transactions=e,$e.txLines=t,$e.thirdParties=a}return{transactions:$e.transactions,txLines:$e.txLines,thirdParties:$e.thirdParties}}function xr(e,t){const a={1:0,2:0,3:0,4:0,5:0,6:0,7:0};for(const o of e){const s=(o.code||"").charAt(0);a[s]=(a[s]||0)+Number(t[o.id]||0)}return a}async function Ae(e,t=""){for(const a of e)try{const o=await API.getSetting(a);if(o)return o}catch{}return t}function $t(e){const t=Number(e||0);return t<0?{text:`(${fmt(Math.abs(t))})`,isNegative:!0}:{text:fmt(t),isNegative:!1}}function He(e){const t=Number(e||0);return t<0?`-${fmt(Math.abs(t))}`:fmt(t)}function Ne(e){const t=Number(e||0),a=$t(t);return t<0?{text:a.text,color:"#B91C1C"}:t>0?{text:a.text,color:"#166534"}:{text:a.text,color:"#6B7280"}}function ft(){var t;const e=(t=window.jspdf)==null?void 0:t.jsPDF;return typeof e!="function"?(showToast("No se pudo inicializar el generador PDF.","error"),null):e}function fe(e){return Number(e||0).toLocaleString("es-CO",{minimumFractionDigits:2,maximumFractionDigits:2})}function re(e){const t=Number(e||0),a=fe(Math.abs(t));return t<0?`-${a}`:a}async function bt(){const[e,t,a,o,s,n]=await Promise.all([API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>""),API.getSetting("company_city").catch(()=>""),API.getSetting("company_country").catch(()=>""),API.getSetting("software_name").catch(()=>"")]);return{companyName:String(e||"EMPRESA").trim(),companyNit:String(t||"N/A").trim(),companyAddress:[a,o,s].map(i=>String(i||"").trim()).filter(Boolean).join(" / ")||"Direccion no configurada",softwareName:String(n||"GRAVY v2.0").trim(),userName:String(sessionStorage.getItem("user_name")||"Usuario").trim(),generatedAt:new Date().toLocaleString("es-CO")}}function gt(e,t,a){const o=e.internal.pageSize.getWidth(),s=24,n=o-24,i=String((a==null?void 0:a.title)||"").trim(),c=Array.isArray(a==null?void 0:a.subtitles)?a.subtitles:[];return e.setFont("helvetica","bold"),e.setFontSize(10),e.setTextColor(13,33,55),e.text(t.companyName,s,20),e.setFont("helvetica","normal"),e.setFontSize(8),e.setTextColor(100,100,100),e.text(`NIT: ${t.companyNit}`,s,30),e.text(t.companyAddress,s,40),e.setFont("helvetica","bold"),e.setFontSize(11),e.setTextColor(13,33,55),e.text(i,o/2,20,{align:"center"}),e.setFont("helvetica","normal"),e.setFontSize(8),e.setTextColor(80,80,80),c.slice(0,3).forEach((r,l)=>{e.text(String(r||""),o/2,30+l*10,{align:"center"})}),e.setFont("helvetica","normal"),e.setFontSize(8),e.setTextColor(100,100,100),e.text(t.softwareName,n,20,{align:"right"}),e.text(`Usuario: ${t.userName}`,n,30,{align:"right"}),e.text(`Impreso: ${t.generatedAt}`,n,40,{align:"right"}),e.setDrawColor(180,180,180),e.setLineWidth(.5),e.line(s,58,n,58),{marginLeft:s,marginRight:n,startY:66}}function vt(e,t){const a=e.internal.pageSize.getWidth(),o=e.internal.pageSize.getHeight();e.setFont("helvetica","normal"),e.setFontSize(7),e.setTextColor(120,120,120),e.text("Reporte generado por GRAVY",24,o-10),e.text(`Pagina ${t}`,a-24,o-10,{align:"right"})}function rn(e,t){const a=new Date(`${e}T00:00:00`),o=new Date(`${t}T00:00:00`);if(Number.isNaN(a.getTime())||Number.isNaN(o.getTime()))return 0;const s=o.getTime()-a.getTime();return Math.max(0,Math.floor(s/864e5))}function ln(e,t){const a=new Date(`${e}T00:00:00`),o=new Date(`${t}T00:00:00`);return Number.isNaN(a.getTime())||Number.isNaN(o.getTime())?0:Math.floor((o.getTime()-a.getTime())/864e5)}function dn(e,t){const a=new Date(`${e}T00:00:00`);return a.setDate(a.getDate()+Number(t||0)),a.toISOString().slice(0,10)}function pn(e){return e<0?"por_vencer":e<=30?"b0_30":e<=60?"b31_60":e<=90?"b61_90":"b90p"}async function Go({mode:e="cxc",asOfDate:t=todayStr(),thirdType:a=""}={}){var b,u,y;const[{accounts:o},{transactions:s,txLines:n,thirdParties:i}]=await Promise.all([at(),ot()]),c=new Map(s.map(v=>[v.id,v])),r=new Map(i.map(v=>[v.id,v])),l=new Map(o.map(v=>[v.id,v])),p=new Map,f=String(a||"").trim().toUpperCase();for(const v of n){const g=c.get(v.tx_id);if(!g||g.status!=="active"||!g.date||String(g.date)>t)continue;const h=((b=v.expand)==null?void 0:b.account_id)||l.get(v.account_id);if(!h||!h.maneja_cruce)continue;const _=String(h.nature||"").toLowerCase();if(e==="cxc"&&_!=="debit"||e==="cxp"&&_!=="credit")continue;const A=v.third_party_id||g.third_party_id||"NO_TERCERO",C=r.get(A),T=String((C==null?void 0:C.type)||"").toUpperCase();if(f&&T!==f)continue;const N=(v.cross_doc_ref||"").trim()||"SIN_DOC",I=`${h.id}|${A}|${N}`;p.has(I)||p.set(I,{account_id:h.id,account_code:h.code||"",account_name:h.name||"",nature:_,third_id:A,third_name:(C==null?void 0:C.name)||((y=(u=g.expand)==null?void 0:u.third_party_id)==null?void 0:y.name)||"Sin tercero",third_doc:(C==null?void 0:C.doc_number)||"",third_type:T||"OTRO",doc_ref:N,doc_date:g.date,payment_days:Number(g.payment_days||0),debit:0,credit:0});const S=p.get(I);String(g.date)<String(S.doc_date)&&(S.doc_date=g.date,S.payment_days=Number(g.payment_days||0)),S.debit+=Number(v.debit||0),S.credit+=Number(v.credit||0)}const m=1e-4,d=[];return p.forEach(v=>{const g=v.nature==="debit"?Number(v.debit||0)-Number(v.credit||0):Number(v.credit||0)-Number(v.debit||0);if(g<=m)return;const h=rn(v.doc_date,t),_=dn(v.doc_date,v.payment_days||0),A=ln(_,t);d.push({...v,open:g,days:h,due_date:_,expired_days:A,bucket:pn(A)})}),d.sort((v,g)=>{const h=`${v.third_name}|${v.account_code}|${v.doc_date}|${v.doc_ref}`,_=`${g.third_name}|${g.account_code}|${g.doc_date}|${g.doc_ref}`;return h.localeCompare(_)}),d}async function eo(e){var l,p,f;const t=tt();if(!t)return;const a=e==="cxc",o=a?"Saldos de Cuentas por Cobrar":"Saldos de Cuentas por Pagar",s=a?"CLIENTE":"PROVEEDOR",n=a?"clientes":"proveedores";t.innerHTML=`
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">${esc(o)}</h4>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div class="form-group">
          <label class="form-label">Corte</label>
          <input id="bal-cutoff" type="date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de tercero</label>
          <select id="bal-third-type" class="form-input">
            <option value="">Todos</option>
            <option value="CLIENTE" ${s==="CLIENTE"?"selected":""}>Cliente</option>
            <option value="PROVEEDOR" ${s==="PROVEEDOR"?"selected":""}>Proveedor</option>
            <option value="ACREEDOR">Acreedor</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-bal"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-bal" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can("canExport")?'<button class="btn btn-outline w-full" id="btn-exp-bal" disabled><i class="fas fa-file-excel"></i> Exportar</button>':""}
        </div>
      </div>
      <p class="text-xs mt-3" style="color:#6B7280">Reporte de saldo abierto por documento de cruce, agrupado por tercero y cuenta (${esc(n)}).</p>
    </div>
    <div id="bal-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona filtros y pulsa Generar.
    </div>`;let i=[],c=[];const r=async()=>{const m=$("#bal-results");if(!m)return;const d=getInputVal("bal-cutoff"),b=getSelectVal("bal-third-type");if(!d)return showToast("Selecciona la fecha de corte.","warning");m.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando reporte...</div>';try{const u=await Go({mode:e,asOfDate:d,thirdType:b});if(!u.length){m.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">No hay saldos abiertos para los filtros seleccionados.</div>',i=[],c=[],$("#btn-exp-bal")&&($("#btn-exp-bal").disabled=!0),$("#btn-pdf-bal")&&($("#btn-pdf-bal").disabled=!0);return}const y=new Map;for(const _ of u){const A=`${_.third_id}|${_.account_id}`;y.has(A)||y.set(A,{third_name:_.third_name,third_doc:_.third_doc,third_type:_.third_type,account_code:_.account_code,account_name:_.account_name,docs_count:0,open_total:0,max_days:0});const C=y.get(A);C.docs_count+=1,C.open_total+=Number(_.open||0),C.max_days=Math.max(C.max_days,Number(_.days||0))}const v=[...y.values()].sort((_,A)=>{const C=`${_.third_name}|${_.account_code}`,T=`${A.third_name}|${A.account_code}`;return C.localeCompare(T)}),g=v.reduce((_,A)=>_+Number(A.open_total||0),0),h=v.reduce((_,A)=>_+Number(A.docs_count||0),0);m.innerHTML=`
        <div class="p-4 border-b flex flex-wrap items-center justify-between gap-3" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Terceros/cuentas: <strong>${fmtN(v.length)}</strong> · Documentos: <strong>${fmtN(h)}</strong> · Saldo abierto: <strong>${fmt(g)}</strong></p>
        </div>
        <div class="overflow-x-auto" style="max-height:460px">
          <table class="data-table">
            <thead><tr><th>Tercero</th><th>Cuenta</th><th># Docs</th><th>Antigüedad máx. (días)</th><th>Saldo abierto</th></tr></thead>
            <tbody>
              ${v.map(_=>`<tr>
                <td>${esc(_.third_doc?`${_.third_doc} - ${_.third_name}`:_.third_name)}</td>
                <td>${esc(_.account_code)} - ${esc(_.account_name)}</td>
                <td>${fmtN(_.docs_count)}</td>
                <td>${fmtN(_.max_days)}</td>
                <td class="font-semibold" style="color:${a?"#065F46":"#1E3A8A"}">${fmt(_.open_total)}</td>
              </tr>`).join("")}
            </tbody>
            <tfoot><tr><td colspan="4" class="font-bold">Total saldo abierto</td><td class="font-bold">${fmt(g)}</td></tr></tfoot>
          </table>
        </div>`,i=v.map(_=>({tercero:_.third_name,documento:_.third_doc,tipo_tercero:_.third_type,cuenta_codigo:_.account_code,cuenta_nombre:_.account_name,documentos:_.docs_count,antiguedad_max_dias:_.max_days,saldo_abierto:_.open_total})),c=v.map(_=>({..._})),$("#btn-exp-bal")&&($("#btn-exp-bal").disabled=!i.length),$("#btn-pdf-bal")&&($("#btn-pdf-bal").disabled=!c.length)}catch(u){m.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(u.message)}</div>`,i=[],c=[],$("#btn-exp-bal")&&($("#btn-exp-bal").disabled=!0),$("#btn-pdf-bal")&&($("#btn-pdf-bal").disabled=!0)}};(l=$("#btn-gen-bal"))==null||l.addEventListener("click",r),(p=$("#btn-exp-bal"))==null||p.addEventListener("click",()=>{i.length&&exportToExcel(i,[{key:"tercero",label:"Tercero"},{key:"documento",label:"Documento"},{key:"cuenta_codigo",label:"Código cuenta"},{key:"cuenta_nombre",label:"Nombre cuenta"},{key:"documentos",label:"# Documentos"},{key:"antiguedad_max_dias",label:"Antigüedad máx. (días)"},{key:"saldo_abierto",label:"Saldo abierto"}],e==="cxc"?"saldos_cuentas_por_cobrar":"saldos_cuentas_por_pagar")}),(f=$("#btn-pdf-bal"))==null||f.addEventListener("click",async()=>{if(c.length)try{const m=ft();if(!m)return;const d=getInputVal("bal-cutoff")||todayStr(),b=getSelectVal("bal-third-type")||"TODOS",u=await bt(),y=new m({orientation:"portrait",unit:"pt",format:"letter"}),v=gt(y,u,{title:o,subtitles:[`Corte: ${d}`,`Tipo de tercero: ${b}`]}),g=c.reduce((A,C)=>A+Number(C.open_total||0),0),h=c.reduce((A,C)=>A+Number(C.docs_count||0),0),_=c.map(A=>[A.third_doc?`${A.third_doc} - ${A.third_name}`:A.third_name,`${A.account_code} - ${A.account_name}`.trim(),fmtN(A.docs_count),fmtN(A.max_days),fe(A.open_total||0)]);_.push(["TOTAL","",fmtN(h),"",fe(g)]),y.autoTable({startY:v.startY,head:[["Tercero","Cuenta","# Docs","Antiguedad max. (dias)","Saldo abierto"]],body:_,theme:"plain",margin:{top:v.startY,left:v.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.2,textColor:[55,55,55],cellPadding:2.4,lineWidth:0,overflow:"linebreak"},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:7.3,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:170},1:{cellWidth:195},2:{cellWidth:56,halign:"right"},3:{cellWidth:63,halign:"right"},4:{cellWidth:80,halign:"right"}},didParseCell:A=>{if(A.section!=="body")return;A.row.index===_.length-1&&(A.cell.styles.fontStyle="bold",A.cell.styles.fillColor=[236,236,236],A.cell.styles.textColor=[13,33,55],A.cell.styles.lineWidth={top:.2},A.cell.styles.lineColor=[13,33,55])},didDrawPage:A=>vt(y,A.pageNumber)}),y.save(`${e==="cxc"?"saldos_cuentas_por_cobrar":"saldos_cuentas_por_pagar"}_${d}.pdf`)}catch(m){showToast(`Error al generar PDF: ${m.message}`,"error")}})}async function un(){var l,p,f,m;const e=tt();if(!e)return;const{accounts:t}=await at(),a=t.filter(d=>d.maneja_cruce).sort((d,b)=>(d.code||"").localeCompare(b.code||"")),o=a.map(d=>`<option value="${esc(d.id)}">${esc(d.code)} - ${esc(d.name)}</option>`).join("");e.innerHTML=`
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Cartera por Edades (Por Vencer / 0-30-60-90+)</h4>
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        <div class="form-group">
          <label class="form-label">Corte</label>
          <input id="age-cutoff" type="date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Cartera</label>
          <select id="age-mode" class="form-input">
            <option value="cxc">Clientes (CxC)</option>
            <option value="cxp">Proveedores (CxP)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tipo tercero</label>
          <select id="age-third-type" class="form-input">
            <option value="">Todos</option>
            <option value="CLIENTE" selected>Cliente</option>
            <option value="PROVEEDOR">Proveedor</option>
            <option value="ACREEDOR">Acreedor</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta</label>
          <select id="age-account" class="form-input">
            <option value="">Todas las cuentas</option>
            ${o}
          </select>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-aging"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-aging" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can("canExport")?'<button class="btn btn-outline w-full" id="btn-exp-aging" disabled><i class="fas fa-file-excel"></i> Exportar</button>':""}
        </div>
      </div>
    </div>
    <div id="aging-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-hourglass-half mr-2"></i>Selecciona filtros y pulsa Generar.
    </div>`;const s=()=>{const d=getSelectVal("age-mode"),b=$("#age-third-type");b&&(!b.value||b.value==="CLIENTE"||b.value==="PROVEEDOR")&&(b.value=d==="cxc"?"CLIENTE":"PROVEEDOR")};(l=$("#age-mode"))==null||l.addEventListener("change",s);let n=[],i=[],c={};const r=async()=>{const d=$("#aging-results");if(!d)return;const b=getInputVal("age-cutoff"),u=getSelectVal("age-mode")||"cxc",y=getSelectVal("age-third-type"),v=getSelectVal("age-account");if(!b)return showToast("Selecciona la fecha de corte.","warning");d.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Calculando cartera por edades...</div>';try{const g=await Go({mode:u,asOfDate:b,thirdType:y}),h=v?g.filter(w=>w.account_id===v):g;if(!h.length){d.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">No hay cartera abierta para los filtros seleccionados.</div>',n=[],i=[],$("#btn-exp-aging")&&($("#btn-exp-aging").disabled=!0),$("#btn-pdf-aging")&&($("#btn-pdf-aging").disabled=!0);return}const _=v?a.find(w=>w.id===v):null,A=_?`${_.code} - ${_.name}`:"Todas las cuentas",C=h.map(w=>({tercero:w.third_name,documento_tercero:w.third_doc,cuenta_id:w.account_id,cuenta:`${w.account_code} - ${w.account_name}`.trim(),cuenta_code:w.account_code,documento_cruce:w.doc_ref,fecha_documento:w.doc_date,plazo_dias:Number(w.payment_days||0),vencimiento:w.due_date,expired_days:Number(w.expired_days||0),por_vencer:w.bucket==="por_vencer"?Number(w.open||0):0,de_0_a_30:w.bucket==="b0_30"?Number(w.open||0):0,de_31_a_60:w.bucket==="b31_60"?Number(w.open||0):0,de_61_a_90:w.bucket==="b61_90"?Number(w.open||0):0,mayor_a_90:w.bucket==="b90p"?Number(w.open||0):0,total:Number(w.open||0)})).sort((w,E)=>{const L=`${w.cuenta_code}|${w.tercero}|${w.fecha_documento}|${w.documento_cruce}`,R=`${E.cuenta_code}|${E.tercero}|${E.fecha_documento}|${E.documento_cruce}`;return L.localeCompare(R)}),T=C.reduce((w,E)=>(w.por_vencer+=E.por_vencer,w.de_0_a_30+=E.de_0_a_30,w.de_31_a_60+=E.de_31_a_60,w.de_61_a_90+=E.de_61_a_90,w.mayor_a_90+=E.mayor_a_90,w.total+=E.total,w),{por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0}),N=u==="cxc"?"Clientes (CxC)":"Proveedores (CxP)",I=new Map;for(const w of C)I.has(w.cuenta)||I.set(w.cuenta,[]),I.get(w.cuenta).push(w);const S=[];for(const[w,E]of I){v||S.push(`<tr style="background:#F0F4F8">
            <td colspan="11" style="font-weight:600;padding:5px 10px;font-size:12px;color:#0D2137;border-top:1px solid #D1D5DB">
              <i class="fas fa-bookmark mr-1" style="color:#E87D1E"></i>${esc(w)}
            </td>
          </tr>`);for(const L of E){const R=L.expired_days<0?"#059669":L.expired_days<=30?"#D97706":"#EF4444";S.push(`<tr>
            <td>${esc(L.documento_tercero?`${L.documento_tercero} - ${L.tercero}`:L.tercero)}</td>
            <td><span class="font-mono">${esc(L.documento_cruce)}</span></td>
            <td>${esc(L.fecha_documento)}</td>
            <td style="text-align:right">${fmtN(L.plazo_dias)}</td>
            <td>${esc(L.vencimiento)}</td>
            <td style="color:${R};font-weight:${L.por_vencer>0?"600":"400"}">${fmt(L.por_vencer)}</td>
            <td>${fmt(L.de_0_a_30)}</td>
            <td>${fmt(L.de_31_a_60)}</td>
            <td>${fmt(L.de_61_a_90)}</td>
            <td>${fmt(L.mayor_a_90)}</td>
            <td class="font-semibold" style="color:#0D2137">${fmt(L.total)}</td>
          </tr>`)}}d.innerHTML=`
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Cartera: <strong>${esc(N)}</strong> · Cuenta: <strong>${esc(A)}</strong> · Documentos: <strong>${fmtN(C.length)}</strong> · Total: <strong>${fmt(T.total)}</strong></p>
        </div>
        <div class="overflow-x-auto" style="max-height:480px">
          <table class="data-table">
            <thead><tr>
              <th>Tercero</th><th>Doc. Cruce</th><th>Fecha Doc.</th>
              <th style="text-align:right">Plazo</th><th>Vencimiento</th>
              <th>Por Vencer</th><th>0-30 días</th><th>31-60 días</th><th>61-90 días</th><th>Más de 90</th><th>Total</th>
            </tr></thead>
            <tbody>${S.join("")}</tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="font-bold">Total general</td>
                <td class="font-bold" style="color:#059669">${fmt(T.por_vencer)}</td>
                <td class="font-bold">${fmt(T.de_0_a_30)}</td>
                <td class="font-bold">${fmt(T.de_31_a_60)}</td>
                <td class="font-bold">${fmt(T.de_61_a_90)}</td>
                <td class="font-bold">${fmt(T.mayor_a_90)}</td>
                <td class="font-bold">${fmt(T.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`,n=C.map(w=>({...w})),i=C.map(w=>({...w})),c={asOfDate:b,mode:u,thirdType:y,accountLabel:A,carteraLabel:N},$("#btn-exp-aging")&&($("#btn-exp-aging").disabled=!n.length),$("#btn-pdf-aging")&&($("#btn-pdf-aging").disabled=!i.length)}catch(g){d.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(g.message)}</div>`,n=[],i=[],$("#btn-exp-aging")&&($("#btn-exp-aging").disabled=!0),$("#btn-pdf-aging")&&($("#btn-pdf-aging").disabled=!0)}};(p=$("#btn-gen-aging"))==null||p.addEventListener("click",r),(f=$("#btn-exp-aging"))==null||f.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"tercero",label:"Tercero"},{key:"documento_tercero",label:"Documento tercero"},{key:"cuenta",label:"Cuenta"},{key:"documento_cruce",label:"Doc. Cruce"},{key:"fecha_documento",label:"Fecha documento"},{key:"plazo_dias",label:"Plazo (días)"},{key:"vencimiento",label:"Vencimiento"},{key:"por_vencer",label:"Por Vencer"},{key:"de_0_a_30",label:"0-30 días"},{key:"de_31_a_60",label:"31-60 días"},{key:"de_61_a_90",label:"61-90 días"},{key:"mayor_a_90",label:"Más de 90 días"},{key:"total",label:"Total"}],`cartera_por_edades_${c.mode||"cxc"}`)}),(m=$("#btn-pdf-aging"))==null||m.addEventListener("click",async()=>{if(i.length)try{const d=ft();if(!d)return;const{asOfDate:b,thirdType:u,accountLabel:y,carteraLabel:v}=c,g=i.reduce((E,L)=>(E.por_vencer+=Number(L.por_vencer||0),E.de_0_a_30+=Number(L.de_0_a_30||0),E.de_31_a_60+=Number(L.de_31_a_60||0),E.de_61_a_90+=Number(L.de_61_a_90||0),E.mayor_a_90+=Number(L.mayor_a_90||0),E.total+=Number(L.total||0),E),{por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0}),h=await bt(),_=new d({orientation:"portrait",unit:"pt",format:"letter"}),A=gt(_,h,{title:"Cartera por Edades",subtitles:[`Corte: ${b}`,`Cartera: ${v}`,`Cuenta: ${y}`,`Tipo de tercero: ${u||"Todos"}`]}),C=[],T=new Map;for(const E of i)T.has(E.cuenta)||T.set(E.cuenta,[]),T.get(E.cuenta).push(E);const N=new Set;let I=0;const S=T.size>1;for(const[E,L]of T){S&&(C.push([{content:E,colSpan:11,styles:{fontStyle:"bold",fillColor:[235,240,248],textColor:[13,33,55]}}]),N.add(I++));for(const R of L)C.push([R.documento_tercero?`${R.documento_tercero} - ${R.tercero}`:R.tercero,R.documento_cruce,R.fecha_documento,String(R.plazo_dias||0),R.vencimiento,fe(R.por_vencer),fe(R.de_0_a_30),fe(R.de_31_a_60),fe(R.de_61_a_90),fe(R.mayor_a_90),fe(R.total)]),I++}C.push(["TOTAL","","","","",fe(g.por_vencer),fe(g.de_0_a_30),fe(g.de_31_a_60),fe(g.de_61_a_90),fe(g.mayor_a_90),fe(g.total)]);const w=I;_.autoTable({startY:A.startY,head:[["Tercero","Cruce","Fecha","Plazo","Vencimiento","Por Vencer","0-30","31-60","61-90",">90","Total"]],body:C,theme:"plain",margin:{top:A.startY,left:A.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:6.5,textColor:[55,55,55],cellPadding:2,lineWidth:0,overflow:"linebreak"},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:6.7,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:116},1:{cellWidth:48},2:{cellWidth:46},3:{cellWidth:28,halign:"right"},4:{cellWidth:50},5:{cellWidth:48,halign:"right"},6:{cellWidth:42,halign:"right"},7:{cellWidth:42,halign:"right"},8:{cellWidth:42,halign:"right"},9:{cellWidth:42,halign:"right"},10:{cellWidth:50,halign:"right"}},didParseCell:E=>{E.section==="body"&&E.row.index===w&&(E.cell.styles.fontStyle="bold",E.cell.styles.fillColor=[236,236,236],E.cell.styles.textColor=[13,33,55],E.cell.styles.lineWidth={top:.2},E.cell.styles.lineColor=[13,33,55])},didDrawPage:E=>vt(_,E.pageNumber)}),_.save(`cartera_por_edades_${c.mode||"cxc"}_${b}.pdf`)}catch(d){showToast(`Error al generar PDF: ${d.message}`,"error")}})}async function mn(){var r,l,p;const e=tt();if(!e)return;const t=todayStr(),a=`${t.slice(0,7)}-01`,o=await Ae(["trial_show_signatures_default","show_signatures_default"],"0"),s=String(o).trim()==="1"||String(o).toLowerCase()==="true";e.innerHTML=`
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Balance de Prueba (Detallado)</h4>
      <div class="grid grid-cols-1 md:grid-cols-8 gap-3">
        <div class="form-group">
          <label class="form-label">Desde</label>
          <input id="trial-from" type="date" class="form-input" value="${a}">
        </div>
        <div class="form-group">
          <label class="form-label">Hasta</label>
          <input id="trial-to" type="date" class="form-input" value="${t}">
        </div>
        <div class="form-group">
          <label class="form-label">Nivel de información</label>
          <select id="trial-level" class="form-input">
            <option value="all">Todos</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3" selected>Nivel 3</option>
            <option value="4">Nivel 4</option>
            <option value="5">Nivel 5</option>
            <option value="6">Nivel 6</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="trial-show-third" type="checkbox">
            Mostrar terceros
          </label>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="trial-show-signatures" type="checkbox" ${s?"checked":""}>
            Mostrar firmas
          </label>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-trial"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-trial" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can("canExport")?'<button class="btn btn-outline w-full" id="btn-exp-trial" disabled><i class="fas fa-file-excel"></i> Exportar</button>':""}
        </div>
      </div>
    </div>
    <div id="trial-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona el lapso y pulsa Generar.
    </div>`;let n=[],i=null;const c=async()=>{var g,h;const f=$("#trial-results");if(!f)return;const m=getInputVal("trial-from"),d=getInputVal("trial-to"),b=getSelectVal("trial-level"),u=b==="all"?Number.POSITIVE_INFINITY:Number(b||3),y=getCheckVal("trial-show-third"),v=getCheckVal("trial-show-signatures");if(!m||!d)return showToast("Selecciona el lapso (desde y hasta).","warning");if(m>d)return showToast("La fecha Desde no puede ser mayor que Hasta.","warning");f.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Balance de Prueba...</div>';try{const{accounts:_}=await at(),{transactions:A,txLines:C}=await ot(),T=Object.fromEntries(A.map(x=>[x.id,x])),N=new Map(_.map(x=>[x.id,{id:x.id,code:String(x.code||""),name:String(x.name||""),level:Number(x.level||1),parent_code:String(x.parent_code||""),ownPrev:0,ownDebit:0,ownCredit:0,prev:0,debit:0,credit:0,current:0,third:new Map,children:[]}])),I=new Map;N.forEach(x=>{x.code&&I.set(x.code,x)});for(const x of C){const P=T[x.tx_id];if(!P||P.status!=="active"||!P.date)continue;const V=N.get(x.account_id);if(!V)continue;const U=String(P.date),z=Number(x.debit||0),J=Number(x.credit||0);if(U<m?V.ownPrev+=z-J:U>=m&&U<=d&&(V.ownDebit+=z,V.ownCredit+=J),y){const te=String(P.third_party_id||"NO_TERCERO"),F=((h=(g=P.expand)==null?void 0:g.third_party_id)==null?void 0:h.name)||"Sin tercero";V.third.has(te)||V.third.set(te,{id:te,name:F,prev:0,debit:0,credit:0,current:0});const D=V.third.get(te);U<m?D.prev+=z-J:U>=m&&U<=d&&(D.debit+=z,D.credit+=J),D.current=D.prev+D.debit-D.credit}}const S=[];N.forEach(x=>{const P=x.parent_code?I.get(x.parent_code):null;P?P.children.push(x):S.push(x)});const w=(x,P)=>x.code.localeCompare(P.code);S.sort(w),N.forEach(x=>x.children.sort(w));const E=[],L=1e-4,R=x=>{let P=x.ownPrev,V=x.ownDebit,U=x.ownCredit;for(const J of x.children){const te=R(J);P+=te.prev,V+=te.debit,U+=te.credit}const z=P+V-U;return x.prev=P,x.debit=V,x.credit=U,x.current=z,{prev:P,debit:V,credit:U,current:z}};S.forEach(x=>R(x));const M=(x,P)=>{const V=[];for(const F of x.children)V.push(...M(F,P+1));if(!(Math.abs(x.prev)>L||Math.abs(x.debit)>L||Math.abs(x.credit)>L||Math.abs(x.current)>L||V.length>0))return[];const J=Number(x.level||P+1),te={code:x.code,account:x.name,level:J,depth:P,isGroup:x.children.length>0,prev:x.prev,debit:x.debit,credit:x.credit,current:x.current,node:x};return J<=u?[te,...V]:V};E.length=0,S.forEach(x=>E.push(...M(x,0)));const B=S.reduce((x,P)=>(x.prev+=P.prev,x.debit+=P.debit,x.credit+=P.credit,x.current+=P.current,x),{prev:0,debit:0,credit:0,current:0}),k=$t(B.prev),j=$t(B.debit),Y=$t(B.credit),W=$t(B.current),K=[];for(const x of E)if(K.push({...x,thirdName:""}),y&&x.node&&x.node.third&&x.node.third.size){const P=[...x.node.third.values()].filter(V=>Math.abs(V.prev)>L||Math.abs(V.debit)>L||Math.abs(V.credit)>L||Math.abs(V.current)>L).sort((V,U)=>V.name.localeCompare(U.name));for(const V of P)K.push({code:"",account:"Detalle por tercero",level:x.level,depth:x.depth+1,isGroup:!1,prev:V.prev,debit:V.debit,credit:V.credit,current:V.current,thirdName:V.name,isThirdDetail:!0})}n=K.map(x=>({codigo:x.code,descripcion:`${"  ".repeat(x.depth)}${x.account}`,tercero:x.thirdName||"",nivel:x.level,saldo_anterior:x.prev,mov_debito:x.debit,mov_credito:x.credit,saldo_actual:x.current})),$("#btn-exp-trial")&&($("#btn-exp-trial").disabled=!K.length),$("#btn-pdf-trial")&&($("#btn-pdf-trial").disabled=!K.length),i={fromDate:m,toDate:d,includeThird:y,includeSignatures:v,displayRows:K.map(x=>({...x})),totals:{...B}};let H="";if(v){const[x,P,V,U,z,J,te,F]=await Promise.all([Ae(["representante_legal_name","legal_representative_name","rep_legal_name"]),Ae(["representante_legal_title","legal_representative_title","rep_legal_title"],"Representante Legal"),Ae(["contador_name","accountant_name"]),Ae(["contador_title","accountant_title"],"Contador"),Ae(["contador_license","accountant_license"]),Ae(["revisor_fiscal_name","fiscal_reviewer_name"]),Ae(["revisor_fiscal_title","fiscal_reviewer_title"],"Revisor Fiscal"),Ae(["revisor_fiscal_license","fiscal_reviewer_license"])]);H=`
          <div class="p-4 pt-2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              ${ya(x,P,"")}
              ${ya(V,U,z)}
              ${ya(J,te,F)}
            </div>
          </div>`}f.innerHTML=`
        <div class="px-4 pt-4 text-center">
          <p class="text-xl font-bold" style="color:#0D2137">Balance de Comprobación Detallado</p>
          <p class="text-sm mt-1" style="color:#6B7280">DEL ${esc(m)} AL ${esc(d)}</p>
        </div>
        <div class="overflow-x-auto p-4" style="max-height:520px">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Descripción</th>
                ${y?"<th>Tercero</th>":""}
                <th>Saldo Anterior</th>
                <th>Mov. Débito</th>
                <th>Mov. Crédito</th>
                <th>Saldo Actual</th>
              </tr>
            </thead>
            <tbody>
              ${K.length?K.map(x=>{const P=Ne(x.prev),V=Ne(x.debit),U=Ne(x.credit),z=Ne(x.current);return`
                <tr>
                  <td class="font-mono text-xs ${x.isGroup?"font-bold":""}">${esc(x.code)}</td>
                  <td class="${x.isGroup?"font-bold":""}" style="padding-left:${8+x.depth*18}px">${esc(x.account)}</td>
                  ${y?`<td class="${x.isThirdDetail?"font-medium":""}">${esc(x.thirdName||"—")}</td>`:""}
                  <td class="${x.isGroup?"font-bold":""}" style="color:${P.color}">${P.text}</td>
                  <td class="${x.isGroup?"font-bold":""}" style="color:${V.color}">${V.text}</td>
                  <td class="${x.isGroup?"font-bold":""}" style="color:${U.color}">${U.text}</td>
                  <td class="${x.isGroup?"font-bold":""}" style="color:${z.color}">${z.text}</td>
                </tr>`}).join(""):`<tr><td colspan="${y?"7":"6"}" class="text-center py-10" style="color:#9CA3AF">No hay datos para el lapso seleccionado.</td></tr>`}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="${y?"3":"2"}" class="font-bold">Total</td>
                <td class="font-bold" style="color:${Ne(B.prev).color}">${k.text}</td>
                <td class="font-bold" style="color:${Ne(B.debit).color}">${j.text}</td>
                <td class="font-bold" style="color:${Ne(B.credit).color}">${Y.text}</td>
                <td class="font-bold" style="color:${Ne(B.current).color}">${W.text}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ${H}`}catch(_){f.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(_.message)}</div>`,i=null,$("#btn-pdf-trial")&&($("#btn-pdf-trial").disabled=!0)}};(r=$("#btn-gen-trial"))==null||r.addEventListener("click",c),(l=$("#btn-exp-trial"))==null||l.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"codigo",label:"CUENTA"},{key:"descripcion",label:"DESCRIPCIÓN"},{key:"nivel",label:"NIVEL"},{key:"tercero",label:"TERCERO"},{key:"saldo_anterior",label:"BALANCE ANTERIOR"},{key:"mov_debito",label:"DÉBITOS"},{key:"mov_credito",label:"CRÉDITOS"},{key:"saldo_actual",label:"BALANCE ACTUAL"}],`balance_prueba_n${getSelectVal("trial-level")}_${getInputVal("trial-from")}_${getInputVal("trial-to")}`)}),(p=$("#btn-pdf-trial"))==null||p.addEventListener("click",async()=>{var f;if(!(!i||!i.displayRows.length))try{const m=ft();if(!m)return;const d=await bt(),b=new m({orientation:"landscape",unit:"pt",format:"letter"}),u=gt(b,d,{title:"Balance de Prueba (Detallado)",subtitles:[`Desde: ${i.fromDate}`,`Hasta: ${i.toDate}`,`Detalle por tercero: ${i.includeThird?"Si":"No"}`]}),y=i.includeThird?["Cuenta","Descripcion","Tercero","Saldo Anterior","Mov. Debito","Mov. Credito","Saldo Actual"]:["Cuenta","Descripcion","Saldo Anterior","Mov. Debito","Mov. Credito","Saldo Actual"],v=i.displayRows.map(g=>{const h=`${"  ".repeat(Number(g.depth||0))}${g.account||""}`;return i.includeThird?[g.code||"",h,g.thirdName||"",re(g.prev||0),fe(g.debit||0),fe(g.credit||0),re(g.current||0),g.isGroup?"group":g.isThirdDetail?"third":"detail"]:[g.code||"",h,re(g.prev||0),fe(g.debit||0),fe(g.credit||0),re(g.current||0),g.isGroup?"group":"detail"]});if(i.includeThird?v.push(["TOTAL","","",re(i.totals.prev||0),fe(i.totals.debit||0),fe(i.totals.credit||0),re(i.totals.current||0),"total"]):v.push(["TOTAL","",re(i.totals.prev||0),fe(i.totals.debit||0),fe(i.totals.credit||0),re(i.totals.current||0),"total"]),b.autoTable({startY:u.startY,head:[y],body:v.map(g=>g.slice(0,y.length)),theme:"plain",margin:{top:u.startY,left:u.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.5,textColor:[55,55,55],cellPadding:2.7,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineWidth:{bottom:.25}},columnStyles:i.includeThird?{0:{cellWidth:62},1:{cellWidth:242},2:{cellWidth:140},3:{cellWidth:80,halign:"right"},4:{cellWidth:80,halign:"right"},5:{cellWidth:80,halign:"right"},6:{cellWidth:80,halign:"right"}}:{0:{cellWidth:70},1:{cellWidth:346},2:{cellWidth:88,halign:"right"},3:{cellWidth:88,halign:"right"},4:{cellWidth:88,halign:"right"},5:{cellWidth:88,halign:"right"}},didParseCell:g=>{var _;if(g.section!=="body")return;const h=(_=v[g.row.index])==null?void 0:_[y.length];h==="group"?(g.cell.styles.fontStyle="bold",g.cell.styles.textColor=[13,33,55]):h==="third"?g.cell.styles.fillColor=[248,250,252]:h==="total"&&(g.cell.styles.fontStyle="bold",g.cell.styles.fillColor=[236,236,236],g.cell.styles.textColor=[13,33,55],g.cell.styles.lineWidth={top:.2},g.cell.styles.lineColor=[13,33,55])},didDrawPage:g=>vt(b,g.pageNumber)}),i.includeSignatures){const[g,h,_,A,C,T,N,I]=await Promise.all([Ae(["representante_legal_name","legal_representative_name","rep_legal_name"]),Ae(["representante_legal_title","legal_representative_title","rep_legal_title"],"Representante Legal"),Ae(["contador_name","accountant_name"]),Ae(["contador_title","accountant_title"],"Contador"),Ae(["contador_license","accountant_license"]),Ae(["revisor_fiscal_name","fiscal_reviewer_name"]),Ae(["revisor_fiscal_title","fiscal_reviewer_title"],"Revisor Fiscal"),Ae(["revisor_fiscal_license","fiscal_reviewer_license"])]),S=(((f=b.lastAutoTable)==null?void 0:f.finalY)||u.startY)+34,w=b.internal.pageSize.getWidth(),E=b.internal.pageSize.getHeight();let L=S;L>E-90&&(b.addPage(),L=80);const R=[w*.18,w*.5,w*.82],M=[{name:g||"",title:h||"",extra:""},{name:_||"",title:A||"",extra:C||""},{name:T||"",title:N||"",extra:I||""}];b.setDrawColor(70,70,70),b.setTextColor(60,60,60),M.forEach((B,k)=>{const j=R[k];b.line(j-75,L,j+75,L),b.setFont("helvetica","bold"),b.setFontSize(8),b.text(String(B.name||"________________________"),j,L+12,{align:"center"}),b.setFont("helvetica","normal"),b.setFontSize(7),b.text(String(B.title||""),j,L+22,{align:"center"}),B.extra&&b.text(String(B.extra),j,L+31,{align:"center"})})}b.save(`balance_prueba_${i.fromDate}_${i.toDate}.pdf`)}catch(m){showToast(`Error al generar PDF: ${m.message}`,"error")}})}function ya(e,t,a=""){return`
    <div class="pt-6">
      <div style="border-top:1px solid #111827; margin-bottom:6px"></div>
      <p class="text-sm font-semibold" style="color:#0D2137">${esc(e||"________________________")}</p>
      <p class="text-xs" style="color:#6B7280">${esc(t||"")}</p>
      ${a?`<p class="text-xs" style="color:#6B7280">${esc(a)}</p>`:""}
    </div>`}function fn(e,t){const a=(n,i=!1)=>{const c=Number(String(n||"").slice(0,4)),r=Number(String(n||"").slice(5,7));if(!Number.isFinite(c)||!Number.isFinite(r)||r<1||r>12)return"";if(!i)return`${String(c)}-${String(r).padStart(2,"0")}-01`;const l=new Date(c,r,0);return`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`},o=a(e,!1),s=a(t,!0);return!o||!s||String(o)>String(s)?null:{fromDate:o,toDate:s}}async function bn(){var m,d,b;const e=tt();if(!e)return;const t=todayStr().slice(0,7),a=Number(t.slice(0,4)),o=Number(t.slice(5,7)),s=`${String(a-1)}-${String(o).padStart(2,"0")}`;e.innerHTML=`
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Estado de Resultados</h4>
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        <div class="form-group">
          <label class="form-label">Mes del reporte</label>
          <input id="inc-month" type="month" class="form-input" value="${t}">
        </div>
        <div class="form-group">
          <label class="form-label">Comparar con</label>
          <input id="inc-compare-month" type="month" class="form-input" value="${s}">
        </div>
        <div class="form-group">
          <label class="form-label">Nivel de información</label>
          <select id="inc-level" class="form-input">
            <option value="all">Todos</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3" selected>Nivel 3</option>
            <option value="4">Nivel 4</option>
            <option value="5">Nivel 5</option>
            <option value="6">Nivel 6</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="inc-show-notes" type="checkbox" checked>
            Mostrar nota/revelación
          </label>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-er"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-er" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can("canExport")?'<button class="btn btn-outline w-full" id="btn-exp-er" disabled><i class="fas fa-file-excel"></i> Exportar</button>':""}
        </div>
      </div>
    </div>
    <div id="income-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona mes y comparación para generar el reporte.
    </div>`;let n=[],i=null;const c=u=>{const y=Number(String(u||"").slice(0,4)),v=Number(String(u||"").slice(5,7));if(!Number.isFinite(y)||!Number.isFinite(v)||v<1||v>12)return"";const g=new Date(y,v,0);return`${g.getFullYear()}-${String(g.getMonth()+1).padStart(2,"0")}-${String(g.getDate()).padStart(2,"0")}`},r=u=>{if(!u)return"—";const y=new Date(`${u}T00:00:00`);return Number.isNaN(y.getTime())?u:y.toLocaleDateString("es-CO",{day:"2-digit",month:"long",year:"numeric"})},l=(u,y,v,g)=>{const h=Object.fromEntries(y.map(A=>[A.id,A])),_=Object.fromEntries(u.map(A=>[A.id,0]));for(const A of v){const C=h[A.tx_id];!C||C.status!=="active"||!C.date||String(C.date)>g||(_[A.account_id]=Number(_[A.account_id]||0)+Number(A.debit||0)-Number(A.credit||0))}return _},p=(u,y,v,g)=>{const h=u.filter(I=>String(I.code||"").startsWith(g)),_=new Map(h.map(I=>{const S=Number(y[I.id]||0),w=Number(v[I.id]||0),E=g==="4"?-S:S,L=g==="4"?-w:w;return[I.id,{id:I.id,code:String(I.code||""),name:String(I.name||""),level:Number(I.level||1),parentCode:String(I.parent_code||""),ownNow:E,ownCmp:L,now:0,cmp:0,children:[]}]})),A=new Map;_.forEach(I=>{I.code&&A.set(I.code,I)});const C=[];_.forEach(I=>{const S=I.parentCode?A.get(I.parentCode):null;S?S.children.push(I):C.push(I)});const T=(I,S)=>I.code.localeCompare(S.code);C.sort(T),_.forEach(I=>I.children.sort(T));const N=I=>{let S=I.ownNow,w=I.ownCmp;for(const E of I.children){const L=N(E);S+=L.now,w+=L.cmp}return I.now=S,I.cmp=w,{now:S,cmp:w}};return C.forEach(I=>N(I)),C},f=async()=>{const u=$("#income-results");if(!u)return;const y=getInputVal("inc-month"),v=getInputVal("inc-compare-month"),g=getCheckVal("inc-show-notes"),h=getSelectVal("inc-level"),_=h==="all"?Number.POSITIVE_INFINITY:Number(h||3);if(!y||!v)return showToast("Selecciona ambos meses para el reporte comparativo.","warning");const A=c(y),C=c(v);if(!A||!C)return showToast("Mes inválido. Revisa los filtros.","warning");u.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Estado de Resultados...</div>';try{const{accounts:T}=await at(),{transactions:N,txLines:I}=await ot(),S=l(T,N,I,A),w=l(T,N,I,C),E=p(T,S,w,"4"),L=p(T,S,w,"5"),R=p(T,S,w,"6"),M=p(T,S,w,"7");let B=1;const k=D=>{const G=[],ee=Z=>{const Q=[];for(const be of Z.children)Q.push(...ee(be));if(!(Math.abs(Z.now)>1e-4||Math.abs(Z.cmp)>1e-4)&&!Q.length)return[];const ve=[];return Number(Z.level||1)<=_&&ve.push({note:g?String(B++):"",label:Z.name,now:Z.now,cmp:Z.cmp}),ve.push(...Q),ve};D.forEach(Z=>G.push(...ee(Z)));const X=D.reduce((Z,Q)=>Z+Number(Q.now||0),0),ne=D.reduce((Z,Q)=>Z+Number(Q.cmp||0),0);return{detail:G,totalNow:X,totalCmp:ne}},j=k(E),Y=k(L),W=k(R),K=k(M),H=Y.totalNow+W.totalNow+K.totalNow,x=Y.totalCmp+W.totalCmp+K.totalCmp,P=j.totalNow-H,V=j.totalCmp-x,U=g?4:3,z=g?'<th style="width:90px">Nota</th>':"",J=(D,q="")=>{const G=Ne(D);return`<td class="text-right ${q}" style="color:${G.color}">${G.text}</td>`},te=D=>D.detail.map(q=>`
        <tr>
          <td style="padding-left:24px">${esc(q.label)}</td>
          ${g?`<td class="text-center">${esc(q.note)}</td>`:""}
          ${J(q.now)}
          ${J(q.cmp)}
        </tr>`).join("");u.innerHTML=`
        <div class="px-4 pt-4 text-center">
          <p class="text-xl font-bold" style="color:#0D2137">Estado de Resultados</p>
          <p class="text-sm" style="color:#6B7280">(Expresado en pesos colombianos)</p>
        </div>
        <div class="overflow-x-auto p-4" style="max-height:560px">
          <table class="data-table">
            <thead>
              <tr>
                <th>Rubro</th>
                ${z}
                <th class="text-right">${esc(r(A))}</th>
                <th class="text-right">${esc(r(C))}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="font-bold" colspan="${U}">Ingresos (Clase 4)</td></tr>
              ${te(j)}
              <tr>
                <td class="font-bold">Total ingresos</td>
                ${g?"<td></td>":""}
                ${J(j.totalNow,"font-bold")}
                ${J(j.totalCmp,"font-bold")}
              </tr>

              <tr><td class="font-bold" colspan="${U}">Costos de venta (Clase 5)</td></tr>
              ${te(Y)}
              <tr>
                <td class="font-bold">Total costos</td>
                ${g?"<td></td>":""}
                ${J(Y.totalNow,"font-bold")}
                ${J(Y.totalCmp,"font-bold")}
              </tr>

              <tr><td class="font-bold" colspan="${U}">Gastos operacionales (Clase 6)</td></tr>
              ${te(W)}
              <tr>
                <td class="font-bold">Total gastos operacionales</td>
                ${g?"<td></td>":""}
                ${J(W.totalNow,"font-bold")}
                ${J(W.totalCmp,"font-bold")}
              </tr>

              <tr><td class="font-bold" colspan="${U}">Otros gastos (Clase 7)</td></tr>
              ${te(K)}
              <tr>
                <td class="font-bold">Total otros gastos</td>
                ${g?"<td></td>":""}
                ${J(K.totalNow,"font-bold")}
                ${J(K.totalCmp,"font-bold")}
              </tr>

              <tr>
                <td class="font-bold">Total gastos y costos</td>
                ${g?"<td></td>":""}
                ${J(H,"font-bold")}
                ${J(x,"font-bold")}
              </tr>
              <tr>
                <td class="font-bold">Resultado neto del periodo</td>
                ${g?"<td></td>":""}
                ${J(P,"font-bold")}
                ${J(V,"font-bold")}
              </tr>
            </tbody>
          </table>
        </div>`,n=[];const F=(D,q,G)=>{n.push({rubro:D,nota:"",actual:"",comparativo:""}),q.detail.forEach(ee=>{n.push({rubro:`  ${ee.label}`,nota:ee.note||"",actual:ee.now,comparativo:ee.cmp})}),n.push({rubro:G,nota:"",actual:q.totalNow,comparativo:q.totalCmp})};F("Ingresos (Clase 4)",j,"Total ingresos"),F("Costos de venta (Clase 5)",Y,"Total costos"),F("Gastos operacionales (Clase 6)",W,"Total gastos operacionales"),F("Otros gastos (Clase 7)",K,"Total otros gastos"),n.push({rubro:"Total gastos y costos",nota:"",actual:H,comparativo:x}),n.push({rubro:"Resultado neto del periodo",nota:"",actual:P,comparativo:V}),i={reportMonth:y,compareMonth:v,reportDate:A,compareDate:C,showNotes:g,sections:{ingresos:j,costos:Y,gastos:W,otrosGastos:K},totals:{totalGastosNow:H,totalGastosCmp:x,utilidadNow:P,utilidadCmp:V}},$("#btn-exp-er")&&($("#btn-exp-er").disabled=!n.length),$("#btn-pdf-er")&&($("#btn-pdf-er").disabled=!n.length)}catch(T){u.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(T.message)}</div>`,n=[],i=null,$("#btn-exp-er")&&($("#btn-exp-er").disabled=!0),$("#btn-pdf-er")&&($("#btn-pdf-er").disabled=!0)}};(m=$("#btn-gen-er"))==null||m.addEventListener("click",f),(d=$("#btn-exp-er"))==null||d.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"rubro",label:"Rubro"},{key:"nota",label:"Nota"},{key:"actual",label:getInputVal("inc-month")},{key:"comparativo",label:getInputVal("inc-compare-month")}],`estado_resultados_${getInputVal("inc-month")}_vs_${getInputVal("inc-compare-month")}`)}),(b=$("#btn-pdf-er"))==null||b.addEventListener("click",async()=>{if(i)try{const u=ft();if(!u)return;const{showNotes:y,sections:v,totals:g,reportDate:h,compareDate:_,reportMonth:A,compareMonth:C}=i,T=new u({orientation:"portrait",unit:"pt",format:"letter"}),N=await bt(),I=gt(T,N,{title:"Estado de Resultados",subtitles:[`Periodo mensual comparativo: ${A} vs ${C}`,`Cortes: ${h} / ${_}`]}),S=[],w=(L,R,M)=>{S.push([{content:L,colSpan:y?4:3,styles:{fontStyle:"bold",textColor:[13,33,55],fillColor:[245,245,245]}}]),R.detail.forEach(B=>{y?S.push([B.label,B.note||"",re(B.now),re(B.cmp)]):S.push([B.label,re(B.now),re(B.cmp)])}),y?S.push([M,"",re(R.totalNow),re(R.totalCmp)]):S.push([M,re(R.totalNow),re(R.totalCmp)])};w("Ingresos (Clase 4)",v.ingresos,"Total ingresos"),w("Costos de venta (Clase 5)",v.costos,"Total costos"),w("Gastos operacionales (Clase 6)",v.gastos,"Total gastos operacionales"),w("Otros gastos (Clase 7)",v.otrosGastos,"Total otros gastos"),y?S.push(["Total gastos y costos","",re(g.totalGastosNow),re(g.totalGastosCmp)]):S.push(["Total gastos y costos",re(g.totalGastosNow),re(g.totalGastosCmp)]),y?S.push(["Resultado neto del periodo","",re(g.utilidadNow),re(g.utilidadCmp)]):S.push(["Resultado neto del periodo",re(g.utilidadNow),re(g.utilidadCmp)]);const E=y?[["Rubro","Nota",String(h),String(_)]]:[["Rubro",String(h),String(_)]];T.autoTable({startY:I.startY,head:E,body:S,theme:"plain",margin:{top:I.startY,left:I.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.3,textColor:[55,55,55],cellPadding:2.5,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineWidth:{bottom:.25}},columnStyles:y?{0:{cellWidth:280},1:{cellWidth:54,halign:"center"},2:{cellWidth:110,halign:"right"},3:{cellWidth:110,halign:"right"}}:{0:{cellWidth:334},1:{cellWidth:110,halign:"right"},2:{cellWidth:110,halign:"right"}},didParseCell:L=>{var B;if(L.section!=="body")return;const R=(B=S[L.row.index])==null?void 0:B[0];if(typeof R=="object"&&(R!=null&&R.colSpan))return;const M=String(R||"").toLowerCase();(M.startsWith("total ")||M.startsWith("resultado "))&&(L.cell.styles.fontStyle="bold",L.cell.styles.fillColor=[236,236,236],L.cell.styles.textColor=[13,33,55])},didDrawPage:L=>vt(T,L.pageNumber)}),T.save(`estado_resultados_${A}_vs_${C}.pdf`)}catch(u){showToast(`Error al generar PDF: ${u.message}`,"error")}})}async function gn(){var d,b,u;const e=tt();if(!e)return;const t=todayStr().slice(0,7),a=Number(t.slice(0,4)),o=Number(t.slice(5,7)),s=`${String(a-1)}-${String(o).padStart(2,"0")}`;e.innerHTML=`
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Estado de Situación Financiera (Balance General)</h4>
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        <div class="form-group">
          <label class="form-label">Mes del reporte</label>
          <input id="pos-month" type="month" class="form-input" value="${t}">
        </div>
        <div class="form-group">
          <label class="form-label">Comparar con</label>
          <input id="pos-compare-month" type="month" class="form-input" value="${s}">
        </div>
        <div class="form-group">
          <label class="form-label">Nivel de información</label>
          <select id="pos-level" class="form-input">
            <option value="all">Todos</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3" selected>Nivel 3</option>
            <option value="4">Nivel 4</option>
            <option value="5">Nivel 5</option>
            <option value="6">Nivel 6</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="pos-show-notes" type="checkbox" checked>
            Mostrar nota/revelación
          </label>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-position"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-position" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can("canExport")?'<button class="btn btn-outline w-full" id="btn-exp-position" disabled><i class="fas fa-file-excel"></i> Exportar</button>':""}
        </div>
      </div>
    </div>
    <div id="position-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona mes y comparación para generar el reporte.
    </div>`;let n=[],i=null;const c=y=>{const v=Number(String(y||"").slice(0,4)),g=Number(String(y||"").slice(5,7));if(!Number.isFinite(v)||!Number.isFinite(g)||g<1||g>12)return"";const h=new Date(v,g,0),_=h.getFullYear(),A=String(h.getMonth()+1).padStart(2,"0"),C=String(h.getDate()).padStart(2,"0");return`${_}-${A}-${C}`},r=y=>{if(!y)return"—";const v=new Date(`${y}T00:00:00`);return Number.isNaN(v.getTime())?y:v.toLocaleDateString("es-CO",{day:"2-digit",month:"long",year:"numeric"})},l=(y,v,g,h)=>{const _=Object.fromEntries(v.map(C=>[C.id,C])),A=Object.fromEntries(y.map(C=>[C.id,0]));for(const C of g){const T=_[C.tx_id];!T||T.status!=="active"||!T.date||String(T.date)>h||(A[C.account_id]=Number(A[C.account_id]||0)+Number(C.debit||0)-Number(C.credit||0))}return A},p=(y,v)=>{const g=Number(y||0);return v==="asset"?g:-g},f=(y,v,g,h,_,A,C,T)=>{const I=y.filter(h),S=new Map(I.map(W=>[W.id,{id:W.id,code:String(W.code||""),name:String(W.name||""),level:Number(W.level||1),parentCode:String(W.parent_code||""),ownNow:p(v[W.id],_),ownCmp:p(g[W.id],_),now:0,cmp:0,children:[]}])),w=new Map;S.forEach(W=>{W.code&&w.set(W.code,W)});const E=[];S.forEach(W=>{const K=W.parentCode?w.get(W.parentCode):null;K?K.children.push(W):E.push(W)});const L=(W,K)=>W.code.localeCompare(K.code);E.sort(L),S.forEach(W=>W.children.sort(L));const R=W=>{let K=W.ownNow,H=W.ownCmp;for(const x of W.children){const P=R(x);K+=P.now,H+=P.cmp}return W.now=K,W.cmp=H,{now:K,cmp:H}};E.forEach(W=>R(W));let M=C;const B=W=>{const K=[];for(const V of W.children)K.push(...B(V));if(!(Math.abs(W.now)>1e-4||Math.abs(W.cmp)>1e-4||K.length>0))return[];const P=[];return Number(W.level||1)<=T&&P.push({note:A?String(M++):"",label:W.name,now:W.now,cmp:W.cmp}),P.push(...K),P},k=E.flatMap(W=>B(W)),j=E.reduce((W,K)=>W+K.now,0),Y=E.reduce((W,K)=>W+K.cmp,0);return{detail:k,totalNow:j,totalCmp:Y,nextNote:M}},m=async()=>{const y=$("#position-results");if(!y)return;const v=getInputVal("pos-month"),g=getInputVal("pos-compare-month"),h=getCheckVal("pos-show-notes"),_=getSelectVal("pos-level"),A=_==="all"?Number.POSITIVE_INFINITY:Number(_||3);if(!v||!g)return showToast("Selecciona ambos meses para el reporte comparativo.","warning");const C=c(v),T=c(g);if(!C||!T)return showToast("Mes inválido. Revisa los filtros.","warning");y.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Estado de Situación Financiera...</div>';try{const{accounts:N}=await at(),{transactions:I,txLines:S}=await ot(),w=l(N,I,S,C),E=l(N,I,S,T);let L=1;const R=f(N,w,E,F=>String(F.code||"").startsWith("11"),"asset",h,L,A);L=R.nextNote;const M=f(N,w,E,F=>String(F.code||"").startsWith("1")&&!String(F.code||"").startsWith("11"),"asset",h,L,A);L=M.nextNote;const B=f(N,w,E,F=>String(F.code||"").startsWith("21"),"liability",h,L,A);L=B.nextNote;const k=f(N,w,E,F=>String(F.code||"").startsWith("2")&&!String(F.code||"").startsWith("21"),"liability",h,L,A);L=k.nextNote;const j=f(N,w,E,F=>String(F.code||"").startsWith("3"),"equity",h,L,A),Y=R.totalNow+M.totalNow,W=R.totalCmp+M.totalCmp,K=B.totalNow+k.totalNow,H=B.totalCmp+k.totalCmp,x=K+j.totalNow,P=H+j.totalCmp,V=h?4:3,U=h?'<th style="width:90px">Nota</th>':"",z=(F,D="")=>{const q=Ne(F),G=`color:${q.color}`;return`<td class="text-right ${D}" style="${G}">${q.text}</td>`},J=F=>F.detail.map(D=>`
        <tr>
          <td style="padding-left:24px">${esc(D.label)}</td>
          ${h?`<td class="text-center">${esc(D.note)}</td>`:""}
          ${z(D.now)}
          ${z(D.cmp)}
        </tr>`).join("");y.innerHTML=`
        <div class="px-4 pt-4 text-center">
          <p class="text-xl font-bold" style="color:#0D2137">Estado de Situación Financiera</p>
          <p class="text-sm" style="color:#6B7280">(Expresado en pesos colombianos)</p>
        </div>
        <div class="overflow-x-auto p-4" style="max-height:560px">
          <table class="data-table">
            <thead>
              <tr>
                <th>Rubro</th>
                ${U}
                <th class="text-right">${esc(r(C))}</th>
                <th class="text-right">${esc(r(T))}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="font-bold" colspan="${V}">Activos</td></tr>
              <tr><td class="font-semibold" colspan="${V}" style="padding-left:12px">Activos corrientes</td></tr>
              ${J(R)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total activos corrientes</td>
                ${h?"<td></td>":""}
                ${z(R.totalNow,"font-bold")}
                ${z(R.totalCmp,"font-bold")}
              </tr>
              <tr><td class="font-semibold" colspan="${V}" style="padding-left:12px">Activos no corrientes</td></tr>
              ${J(M)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total activos no corrientes</td>
                ${h?"<td></td>":""}
                ${z(M.totalNow,"font-bold")}
                ${z(M.totalCmp,"font-bold")}
              </tr>
              <tr>
                <td class="font-bold">Total activos</td>
                ${h?"<td></td>":""}
                ${z(Y,"font-bold")}
                ${z(W,"font-bold")}
              </tr>

              <tr><td class="font-bold" colspan="${V}">Pasivos</td></tr>
              <tr><td class="font-semibold" colspan="${V}" style="padding-left:12px">Pasivos corrientes</td></tr>
              ${J(B)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total pasivos corrientes</td>
                ${h?"<td></td>":""}
                ${z(B.totalNow,"font-bold")}
                ${z(B.totalCmp,"font-bold")}
              </tr>
              <tr><td class="font-semibold" colspan="${V}" style="padding-left:12px">Pasivos no corrientes</td></tr>
              ${J(k)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total pasivos no corrientes</td>
                ${h?"<td></td>":""}
                ${z(k.totalNow,"font-bold")}
                ${z(k.totalCmp,"font-bold")}
              </tr>
              <tr>
                <td class="font-bold">Total pasivos</td>
                ${h?"<td></td>":""}
                ${z(K,"font-bold")}
                ${z(H,"font-bold")}
              </tr>

              <tr><td class="font-bold" colspan="${V}">Patrimonio</td></tr>
              ${J(j)}
              <tr>
                <td class="font-bold">Total patrimonio</td>
                ${h?"<td></td>":""}
                ${z(j.totalNow,"font-bold")}
                ${z(j.totalCmp,"font-bold")}
              </tr>

              <tr>
                <td class="font-bold">Total pasivos más patrimonio</td>
                ${h?"<td></td>":""}
                ${z(x,"font-bold")}
                ${z(P,"font-bold")}
              </tr>
            </tbody>
          </table>
        </div>`,n=[];const te=(F,D,q)=>{n.push({rubro:F,nota:"",actual:"",comparativo:""}),D.detail.forEach(G=>{n.push({rubro:`  ${G.label}`,nota:G.note||"",actual:G.now,comparativo:G.cmp})}),n.push({rubro:q,nota:"",actual:D.totalNow,comparativo:D.totalCmp})};te("Activos corrientes",R,"Total activos corrientes"),te("Activos no corrientes",M,"Total activos no corrientes"),n.push({rubro:"Total activos",nota:"",actual:Y,comparativo:W}),te("Pasivos corrientes",B,"Total pasivos corrientes"),te("Pasivos no corrientes",k,"Total pasivos no corrientes"),n.push({rubro:"Total pasivos",nota:"",actual:K,comparativo:H}),te("Patrimonio",j,"Total patrimonio"),n.push({rubro:"Total pasivos más patrimonio",nota:"",actual:x,comparativo:P}),i={reportMonth:v,compareMonth:g,reportDate:C,compareDate:T,showNotes:h,sections:{actCorr:R,actNoCorr:M,pasCorr:B,pasNoCorr:k,patrimonio:j},totals:{totalActivosNow:Y,totalActivosCmp:W,totalPasivosNow:K,totalPasivosCmp:H,totalPyPNow:x,totalPyPCmp:P}},$("#btn-exp-position")&&($("#btn-exp-position").disabled=!n.length),$("#btn-pdf-position")&&($("#btn-pdf-position").disabled=!n.length)}catch(N){y.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(N.message)}</div>`,n=[],i=null,$("#btn-exp-position")&&($("#btn-exp-position").disabled=!0),$("#btn-pdf-position")&&($("#btn-pdf-position").disabled=!0)}};(d=$("#btn-gen-position"))==null||d.addEventListener("click",m),(b=$("#btn-exp-position"))==null||b.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"rubro",label:"Rubro"},{key:"nota",label:"Nota"},{key:"actual",label:getInputVal("pos-month")},{key:"comparativo",label:getInputVal("pos-compare-month")}],`estado_situacion_financiera_${getInputVal("pos-month")}_vs_${getInputVal("pos-compare-month")}`)}),(u=$("#btn-pdf-position"))==null||u.addEventListener("click",async()=>{if(i)try{const y=ft();if(!y)return;const{showNotes:v,sections:g,totals:h,reportDate:_,compareDate:A,reportMonth:C,compareMonth:T}=i,N=new y({orientation:"portrait",unit:"pt",format:"letter"}),I=await bt(),S=gt(N,I,{title:"Estado de Situacion Financiera",subtitles:[`Periodo mensual comparativo: ${C} vs ${T}`,`Cortes: ${_} / ${A}`]}),w=[],E=(R,M,B)=>{w.push([{content:R,colSpan:v?4:3,styles:{fontStyle:"bold",textColor:[13,33,55],fillColor:[245,245,245]}}]),M.detail.forEach(k=>{v?w.push([k.label,k.note||"",re(k.now),re(k.cmp)]):w.push([k.label,re(k.now),re(k.cmp)])}),v?w.push([B,"",re(M.totalNow),re(M.totalCmp)]):w.push([B,re(M.totalNow),re(M.totalCmp)])};E("Activos corrientes",g.actCorr,"Total activos corrientes"),E("Activos no corrientes",g.actNoCorr,"Total activos no corrientes"),v?w.push(["Total activos","",re(h.totalActivosNow),re(h.totalActivosCmp)]):w.push(["Total activos",re(h.totalActivosNow),re(h.totalActivosCmp)]),E("Pasivos corrientes",g.pasCorr,"Total pasivos corrientes"),E("Pasivos no corrientes",g.pasNoCorr,"Total pasivos no corrientes"),v?w.push(["Total pasivos","",re(h.totalPasivosNow),re(h.totalPasivosCmp)]):w.push(["Total pasivos",re(h.totalPasivosNow),re(h.totalPasivosCmp)]),E("Patrimonio",g.patrimonio,"Total patrimonio"),v?w.push(["Total pasivos mas patrimonio","",re(h.totalPyPNow),re(h.totalPyPCmp)]):w.push(["Total pasivos mas patrimonio",re(h.totalPyPNow),re(h.totalPyPCmp)]);const L=v?[["Rubro","Nota",String(_),String(A)]]:[["Rubro",String(_),String(A)]];N.autoTable({startY:S.startY,head:L,body:w,theme:"plain",margin:{top:S.startY,left:S.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.3,textColor:[55,55,55],cellPadding:2.5,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineWidth:{bottom:.25}},columnStyles:v?{0:{cellWidth:280},1:{cellWidth:54,halign:"center"},2:{cellWidth:110,halign:"right"},3:{cellWidth:110,halign:"right"}}:{0:{cellWidth:334},1:{cellWidth:110,halign:"right"},2:{cellWidth:110,halign:"right"}},didParseCell:R=>{var k;if(R.section!=="body")return;const M=(k=w[R.row.index])==null?void 0:k[0];if(typeof M=="object"&&(M!=null&&M.colSpan))return;String(M||"").toLowerCase().startsWith("total ")&&(R.cell.styles.fontStyle="bold",R.cell.styles.fillColor=[236,236,236],R.cell.styles.textColor=[13,33,55])},didDrawPage:R=>vt(N,R.pageNumber)}),N.save(`estado_situacion_financiera_${C}_vs_${T}.pdf`)}catch(y){showToast(`Error al generar PDF: ${y.message}`,"error")}})}async function vn(){var i,c,r;const e=tt();if(!e)return;const t=todayStr().slice(0,7);let a=[];try{a=await API.getTxTypes()}catch{a=[]}e.innerHTML=`
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Libro Diario</h4>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div class="form-group">
          <label class="form-label">Mes desde</label>
          <input id="journal-month-from" type="month" class="form-input" value="${t}">
        </div>
        <div class="form-group">
          <label class="form-label">Mes hasta</label>
          <input id="journal-month-to" type="month" class="form-input" value="${t}">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de transacción</label>
          <select id="journal-tx-type" class="form-input">
            <option value="">Todos</option>
            ${a.map(l=>`<option value="${esc(l.id)}">${esc(l.code||"")} - ${esc(l.name||"")}</option>`).join("")}
          </select>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-journal"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-journal" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can("canExport")?'<button class="btn btn-outline w-full" id="btn-exp-journal" disabled><i class="fas fa-file-excel"></i> Exportar</button>':""}
        </div>
      </div>
    </div>
    <div id="journal-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona rango mensual y filtros para generar el Libro Diario.
    </div>`;let o=[],s=null;const n=async()=>{const l=$("#journal-results");if(!l)return;const p=getInputVal("journal-month-from"),f=getInputVal("journal-month-to"),m=getSelectVal("journal-tx-type"),d=fn(p,f);if(!d)return showToast("Rango mensual inválido. Verifica Desde/Hasta.","warning");l.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Libro Diario...</div>';try{const{transactions:b,txLines:u}=await ot(),y=Object.fromEntries(b.map(_=>[_.id,_])),v=u.map(_=>{var C,T,N,I,S,w;const A=y[_.tx_id];return!A||A.status!=="active"||!A.date||String(A.date)<d.fromDate||String(A.date)>d.toDate||m&&String(A.tx_type_id||"")!==String(m)?null:{fecha:A.date||"",comprobante:A.number||"",descripcion:A.description||"",tercero:((T=(C=A.expand)==null?void 0:C.third_party_id)==null?void 0:T.name)||"—",cuenta:`${((I=(N=_.expand)==null?void 0:N.account_id)==null?void 0:I.code)||""} - ${((w=(S=_.expand)==null?void 0:S.account_id)==null?void 0:w.name)||""}`.trim(),debito:Number(_.debit||0),credito:Number(_.credit||0)}}).filter(Boolean).sort((_,A)=>`${_.fecha}|${_.comprobante}|${_.cuenta}`.localeCompare(`${A.fecha}|${A.comprobante}|${A.cuenta}`)),g=v.reduce((_,A)=>_+Number(A.debito||0),0),h=v.reduce((_,A)=>_+Number(A.credito||0),0);l.innerHTML=`
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Período: <strong>${esc(p)}</strong> a <strong>${esc(f)}</strong> · Registros: <strong>${fmtN(v.length)}</strong> · Débito: <strong>${fmt(g)}</strong> · Crédito: <strong>${fmt(h)}</strong></p>
        </div>
        <div class="overflow-x-auto" style="max-height:420px">
          <table class="data-table">
            <thead><tr><th>Fecha</th><th>Comp.</th><th>Descripción</th><th>Tercero</th><th>Cuenta</th><th>Débito</th><th>Crédito</th></tr></thead>
            <tbody>
              ${v.length?v.map(_=>`<tr><td>${esc(_.fecha)}</td><td>${esc(_.comprobante)}</td><td>${esc(_.descripcion)}</td><td>${esc(_.tercero)}</td><td>${esc(_.cuenta)}</td><td>${fmt(_.debito)}</td><td>${fmt(_.credito)}</td></tr>`).join(""):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay movimientos para reportar.</td></tr>'}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="font-bold">Totales</td>
                <td class="font-bold">${fmt(g)}</td>
                <td class="font-bold">${fmt(h)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`,o=v,s={fromMonth:p,toMonth:f,txTypeId:m,totalDeb:g,totalCre:h},$("#btn-exp-journal")&&($("#btn-exp-journal").disabled=!v.length),$("#btn-pdf-journal")&&($("#btn-pdf-journal").disabled=!v.length)}catch(b){l.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(b.message)}</div>`,o=[],s=null,$("#btn-exp-journal")&&($("#btn-exp-journal").disabled=!0),$("#btn-pdf-journal")&&($("#btn-pdf-journal").disabled=!0)}};(i=$("#btn-gen-journal"))==null||i.addEventListener("click",n),(c=$("#btn-exp-journal"))==null||c.addEventListener("click",()=>{o.length&&exportToExcel(o,[{key:"fecha",label:"Fecha"},{key:"comprobante",label:"Comprobante"},{key:"descripcion",label:"Descripcion"},{key:"tercero",label:"Tercero"},{key:"cuenta",label:"Cuenta"},{key:"debito",label:"Debito"},{key:"credito",label:"Credito"}],`libro_diario_${(s==null?void 0:s.fromMonth)||t}_a_${(s==null?void 0:s.toMonth)||t}`)}),(r=$("#btn-pdf-journal"))==null||r.addEventListener("click",async()=>{if(!(!o.length||!s))try{const l=ft();if(!l)return;const p=new l({orientation:"portrait",unit:"pt",format:"letter"}),f=await bt(),m=a.find(u=>String(u.id)===String(s.txTypeId)),d=gt(p,f,{title:"Libro Diario",subtitles:[`Periodo mensual: ${s.fromMonth} a ${s.toMonth}`,`Tipo de transaccion: ${m?`${m.code||""} - ${m.name||""}`:"Todos"}`]}),b=o.map(u=>[u.fecha,u.comprobante,u.descripcion,u.tercero,u.cuenta,fe(u.debito),fe(u.credito)]);b.push(["TOTAL","","","","",fe(s.totalDeb),fe(s.totalCre)]),p.autoTable({startY:d.startY,head:[["Fecha","Comp.","Descripcion","Tercero","Cuenta","Debito","Credito"]],body:b,theme:"plain",margin:{top:d.startY,left:d.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:6.5,textColor:[55,55,55],cellPadding:2,lineWidth:0,overflow:"linebreak"},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:6.7,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:48},1:{cellWidth:58},2:{cellWidth:126},3:{cellWidth:90},4:{cellWidth:124},5:{cellWidth:56,halign:"right"},6:{cellWidth:56,halign:"right"}},didParseCell:u=>{u.section==="body"&&u.row.index===b.length-1&&(u.cell.styles.fontStyle="bold",u.cell.styles.fillColor=[236,236,236],u.cell.styles.textColor=[13,33,55],u.cell.styles.lineWidth={top:.2},u.cell.styles.lineColor=[13,33,55])},didDrawPage:u=>vt(p,u.pageNumber)}),p.save(`libro_diario_${s.fromMonth}_a_${s.toMonth}.pdf`)}catch(l){showToast(`Error al generar PDF: ${l.message}`,"error")}})}async function hn(){var t;const e=tt();if(e){e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Libro Auxiliar...</div>';try{const[{accounts:a},{thirdParties:o}]=await Promise.all([at(),ot()]);e.innerHTML=`
      <div class="p-4 border-b" style="border-color:#F3F4F6">
        <h4 class="font-bold mb-3" style="color:#0D2137">Libro Auxiliar</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <select id="aux-mode" class="form-input">
            <option value="cuenta-tercero">Cuenta y luego Tercero</option>
            <option value="tercero-cuenta">Tercero y luego Cuenta</option>
          </select>
          <select id="aux-account" class="form-input">
            <option value="">Todas las cuentas</option>
            ${a.map(s=>`<option value="${esc(s.id)}">${esc(s.code)} - ${esc(s.name)}</option>`).join("")}
          </select>
          <select id="aux-third" class="form-input">
            <option value="">Todos los terceros</option>
            ${o.map(s=>`<option value="${esc(s.id)}">${esc(s.doc_number||"")} - ${esc(s.name)}</option>`).join("")}
          </select>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="text-xs font-semibold" style="color:#6B7280">Fecha desde (saldo inicial)</label>
            <input type="date" id="aux-date-from" class="form-input mt-1" />
          </div>
          <div>
            <label class="text-xs font-semibold" style="color:#6B7280">Fecha hasta</label>
            <input type="date" id="aux-date-to" class="form-input mt-1" />
          </div>
          <div class="flex items-end">
            <button class="btn btn-primary w-full" id="btn-gen-aux"><i class="fas fa-filter"></i> Generar</button>
          </div>
        </div>
      </div>
      <div id="aux-results" class="p-4 text-sm" style="color:#6B7280">Configura filtros y pulsa Generar.</div>`,(t=$("#btn-gen-aux"))==null||t.addEventListener("click",yn)}catch(a){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(a.message)}</div>`}}}function to(){const e=$("#aux-tx-detail-overlay");e&&e.remove()}async function Ar(e){var t,a;try{to();const o=document.createElement("div");o.id="aux-tx-detail-overlay",o.style.cssText="position:fixed;inset:0;z-index:1200;background:rgba(13,33,55,.45);display:flex;align-items:center;justify-content:center;padding:20px",o.innerHTML='<div class="rounded-2xl border bg-white p-6 text-center" style="width:min(1080px,96vw);max-height:92vh;overflow:auto;border-color:#D1D5DB;box-shadow:0 24px 60px rgba(0,0,0,.25);color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando comprobante...</div>',document.body.appendChild(o);const s=await pb.get("transactions",e,{expand:"tx_type_id,third_party_id,user_id"}),n=await API.getTxLines(e);o.innerHTML=`
      <div class="rounded-2xl border bg-white" style="width:min(1080px,96vw);max-height:92vh;overflow:auto;border-color:#D1D5DB;box-shadow:0 24px 60px rgba(0,0,0,.25)">
        <div class="flex items-center justify-between px-4 py-3 border-b" style="border-color:#E5E7EB">
          <h4 class="font-bold" style="color:#0D2137">Comprobante ${esc(s.number||"")}</h4>
          <button class="btn btn-outline btn-sm" onclick="closeAuxTxDetailPanel()"><i class="fas fa-xmark"></i> Cerrar</button>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
            <div><strong>Fecha:</strong> ${esc(s.date||"—")}</div>
            <div><strong>Tercero:</strong> ${esc(((a=(t=s.expand)==null?void 0:t.third_party_id)==null?void 0:a.name)||"—")}</div>
            <div><strong>Estado:</strong> ${esc(s.status||"—")}</div>
          </div>
          <p class="mb-3" style="color:#6B7280">${esc(s.description||"")}</p>
          <div class="overflow-x-auto" style="max-height:260px">
            <table class="data-table">
              <thead><tr><th>Cuenta</th><th>Tercero línea</th><th>Doc. Cruce</th><th>Descripción</th><th>Débito</th><th>Crédito</th></tr></thead>
              <tbody>
                ${n.map(i=>{var c,r,l,p,f,m;return`<tr>
                  <td>${esc(((r=(c=i.expand)==null?void 0:c.account_id)==null?void 0:r.code)||"")} - ${esc(((p=(l=i.expand)==null?void 0:l.account_id)==null?void 0:p.name)||"")}</td>
                  <td>${esc(((m=(f=i.expand)==null?void 0:f.third_party_id)==null?void 0:m.name)||"—")}</td>
                  <td>${i.cross_doc_ref?`<span class="badge" style="background:#F3F4F6;color:#374151">${esc(i.cross_doc_ref)}</span>`:"—"}</td>
                  <td>${esc(i.description||"—")}</td>
                  <td>${fmt(i.debit||0)}</td>
                  <td>${fmt(i.credit||0)}</td>
                </tr>`}).join("")}
              </tbody>
            </table>
          </div>
          <div class="flex justify-end mt-3">
            <button class="btn btn-outline btn-sm" style="border-color:#374151;color:#374151" onclick="printTxNotaContable('${esc(e)}')"><i class="fas fa-print"></i> Imprimir nota contable</button>
          </div>
        </div>
      </div>`,o.addEventListener("click",i=>{i.target===o&&to()})}catch(o){const s=$("#aux-tx-detail-overlay");s&&(s.innerHTML=`<div class="rounded-xl border p-4 bg-white" style="width:min(780px,92vw);border-color:#FCA5A5;background:#FEF2F2;color:#991B1B"><div class="flex items-center justify-between gap-2"><div><i class="fas fa-circle-exclamation mr-2"></i>${esc(o.message)}</div><button class="btn btn-outline btn-sm" onclick="closeAuxTxDetailPanel()">Cerrar</button></div></div>`)}}async function yn(){var t,a,o,s;const e=$("#aux-results");if(e){e.innerHTML='<div class="p-4 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando...</div>';try{const[{transactions:n,txLines:i,thirdParties:c},{accounts:r}]=await Promise.all([ot(),at()]),l=getSelectVal("aux-mode"),p=getSelectVal("aux-account"),f=getSelectVal("aux-third"),m=(((t=$("#aux-date-from"))==null?void 0:t.value)||"").trim(),d=(((a=$("#aux-date-to"))==null?void 0:a.value)||"").trim();let b=null;if(p){const x=r.find(P=>P.id===p);if(x){const P=String(x.code||"");b=new Set(r.filter(V=>{const U=String(V.code||"");return U===P||U.startsWith(P)}).map(V=>V.id))}else b=new Set([p])}const u=Object.fromEntries(r.map(x=>[x.id,x])),y=Object.fromEntries(n.map(x=>[x.id,x])),v=Object.fromEntries((c||[]).map(x=>[x.id,x])),g=new Map;if(m)for(const x of i){const P=y[x.tx_id];if(!P||P.status!=="active"||P.date>=m||b&&!b.has(x.account_id))continue;const V=u[x.account_id];if(!V)continue;const U=x.third_party_id||P.third_party_id||"",z=(x.cross_doc_ref||"").trim()||"SIN_DOC",J=V.maneja_cruce?`doc|${x.account_id}|${U||"NO_TERCERO"}|${z}`:`acc|${x.account_id}|${U||"NO_TERCERO"}`,te=g.get(J)||0,F=Number(x.debit||0),D=Number(x.credit||0),q=F-D;g.set(J,te+q)}const h=i.map(x=>{var G,ee,X,ne,Z;const P=y[x.tx_id];if(!P||P.status!=="active")return null;const V=x.third_party_id||P.third_party_id||"";if(b&&!b.has(x.account_id)||f&&V!==f||m&&P.date<m||d&&P.date>d)return null;const U=u[x.account_id],z=(U==null?void 0:U.code)||((ee=(G=x.expand)==null?void 0:G.account_id)==null?void 0:ee.code)||"",J=(U==null?void 0:U.name)||((ne=(X=x.expand)==null?void 0:X.account_id)==null?void 0:ne.name)||"",te=v[V]||((Z=P.expand)==null?void 0:Z.third_party_id)||null,F=(te==null?void 0:te.name)||"Sin tercero",D=(te==null?void 0:te.doc_number)||"",q=D?`${D} - ${F}`:F;return{fecha:P.date||"",comprobante:P.number||"",txId:P.id||"",cuenta:`${z} - ${J}`.trim(),accountCode:z,accountName:J,tercero:q,thirdName:F,thirdDoc:D,doc_cruce:(x.cross_doc_ref||"").trim(),descripcion:x.description||P.description||"",debito:Number(x.debit||0),credito:Number(x.credit||0),keyCuenta:`${z} - ${J}`.trim(),keyTercero:q,accountId:x.account_id,accountNature:(U==null?void 0:U.nature)||"debit",accountManejaCruce:!!(U!=null&&U.maneja_cruce),thirdId:V||"NO_TERCERO"}}).filter(Boolean),_=[...h].sort((x,P)=>`${x.accountId}|${x.thirdId}|${x.fecha}|${x.doc_cruce||"SIN_DOC"}|${x.comprobante}`.localeCompare(`${P.accountId}|${P.thirdId}|${P.fecha}|${P.doc_cruce||"SIN_DOC"}|${P.comprobante}`)),A=new Map;for(const x of _){const P=x.accountManejaCruce?`doc|${x.accountId}|${x.thirdId}|${x.doc_cruce||"SIN_DOC"}`:`acc|${x.accountId}|${x.thirdId}`;x.balanceKey=P;const V=g.get(P)||0,U=A.get(P)||0,z=x.debito-x.credito;x.saldo_anterior=V,x.saldo_actual=V+U+z,A.set(P,U+z)}const C=l==="tercero-cuenta"?"keyTercero":"keyCuenta",T=l==="tercero-cuenta"?"keyCuenta":"keyTercero",N=l==="tercero-cuenta"?"Tercero":"Cuenta",I=l==="tercero-cuenta"?"Cuenta":"Tercero";if(h.sort((x,P)=>{const V=`${x[C]}|${x[T]}|${x.fecha}|${x.doc_cruce||"SIN_DOC"}|${x.comprobante}`,U=`${P[C]}|${P[T]}|${P.fecha}|${P.doc_cruce||"SIN_DOC"}|${P.comprobante}`;return V.localeCompare(U)}),!h.length){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">No hay movimientos para los filtros seleccionados.</div>';return}const S=x=>{const P=new Set;let V=0;for(const U of x){const z=U.balanceKey||"";!z||P.has(z)||(P.add(z),V+=Number(U.saldo_anterior||0))}return V},w=x=>{const P=new Map;for(const U of x){const z=U.balanceKey||"";z&&P.set(z,Number(U.saldo_actual||0))}let V=0;return P.forEach(U=>{V+=U}),V},E=S(h),L=h.reduce((x,P)=>x+P.debito,0),R=h.reduce((x,P)=>x+P.credito,0),M=w(h),B=new Map;for(const x of h){const P=x[C]||"—",V=x[T]||"—";B.has(P)||B.set(P,new Map);const U=B.get(P);U.has(V)||U.set(V,[]),U.get(V).push(x)}const k=[];B.forEach((x,P)=>{const V=[...x.values()].flat(),U=V[0]||{},z=V.reduce((D,q)=>D+q.debito,0),J=V.reduce((D,q)=>D+q.credito,0),te=S(V),F=w(V);l==="cuenta-tercero"?k.push({kind:"primary",cuenta:U.accountCode||P,detalle:(U.accountName||"").toUpperCase()}):k.push({kind:"primary",nit:U.thirdDoc||"",detalle:(U.thirdName||P).toUpperCase()}),x.forEach((D,q)=>{const G=D[0]||{},ee=S(D),X=D.reduce((Q,oe)=>Q+oe.debito,0),ne=D.reduce((Q,oe)=>Q+oe.credito,0),Z=w(D);l==="cuenta-tercero"?k.push({kind:"secondary",nit:G.thirdDoc||"",detalle:(G.thirdName||q).toUpperCase()}):k.push({kind:"secondary",cuenta:G.accountCode||q,detalle:(G.accountName||"").toUpperCase()}),D.forEach(Q=>{k.push({kind:"detail",fecha:Q.fecha,cruce:Q.doc_cruce,detalle:Q.descripcion,comprobante:Q.comprobante,txId:Q.txId,saldo_anterior:Q.saldo_anterior,debito:Q.debito,credito:Q.credito,saldo_actual:Q.saldo_actual})}),k.push({kind:"subtotal-secondary",detalle:`SubTotal ${l==="cuenta-tercero"?G.thirdName||q:G.accountName||q}`,saldo_anterior:ee,debito:X,credito:ne,saldo_actual:Z})}),k.push({kind:"subtotal-primary",detalle:`SubTotal ${l==="cuenta-tercero"?U.accountName||P:U.thirdName||P}`,saldo_anterior:te,debito:z,credito:J,saldo_actual:F})}),k.push({kind:"grand-total",detalle:"GRAN TOTAL LIBRO AUXILIAR",saldo_anterior:E,debito:L,credito:R,saldo_actual:M});const j=l==="tercero-cuenta"?"nit":"cuenta",Y=l==="tercero-cuenta"?"cuenta":"nit",W=l==="tercero-cuenta"?"NIT":"CUENTA",K=l==="tercero-cuenta"?"CUENTA":"NIT",H=k.map(x=>x.kind==="primary"?`<tr style="border-top:1px solid #E5E7EB"><td style="font-weight:700;color:#0D2137">${esc(x[j]||"")}</td><td style="font-weight:700;color:#0D2137">${esc(x[Y]||"")}</td><td></td><td></td><td style="font-weight:700;color:#0D2137">${esc(x.detalle||"")}</td><td></td><td></td><td></td><td></td><td></td></tr>`:x.kind==="secondary"?`<tr><td style="font-weight:700">${esc(x[j]||"")}</td><td style="font-weight:700">${esc(x[Y]||"")}</td><td></td><td></td><td style="font-weight:700;padding-left:10px">${esc(x.detalle||"")}</td><td></td><td></td><td></td><td></td><td></td></tr>`:x.kind==="subtotal-secondary"?`<tr style="background:#F5F5F5;border-top:1px solid #D0D0D0"><td colspan="5" style="font-weight:700;color:#0D2137">${esc(x.detalle||"")}</td><td></td><td style="text-align:right;font-weight:700">${He(x.saldo_anterior||0)}</td><td style="text-align:right;font-weight:700">${fmt(x.debito||0)}</td><td style="text-align:right;font-weight:700">${fmt(x.credito||0)}</td><td style="text-align:right;font-weight:700">${He(x.saldo_actual||0)}</td></tr>`:x.kind==="subtotal-primary"?`<tr style="background:#ECECEC;border-top:1px solid #B0B0B0;border-bottom:1px solid #B0B0B0"><td colspan="5" style="font-weight:800;color:#0D2137">${esc(x.detalle||"")}</td><td></td><td style="text-align:right;font-weight:800">${He(x.saldo_anterior||0)}</td><td style="text-align:right;font-weight:800">${fmt(x.debito||0)}</td><td style="text-align:right;font-weight:800">${fmt(x.credito||0)}</td><td style="text-align:right;font-weight:800">${He(x.saldo_actual||0)}</td></tr>`:x.kind==="grand-total"?`<tr style="background:#E2E2E2;border-top:2px solid #0D2137;border-bottom:2px solid #0D2137"><td colspan="5" style="font-weight:800;color:#0D2137">${esc(x.detalle||"")}</td><td></td><td style="text-align:right;font-weight:800">${He(x.saldo_anterior||0)}</td><td style="text-align:right;font-weight:800">${fmt(x.debito||0)}</td><td style="text-align:right;font-weight:800">${fmt(x.credito||0)}</td><td style="text-align:right;font-weight:800">${He(x.saldo_actual||0)}</td></tr>`:`<tr>
        <td></td>
        <td></td>
        <td>${esc(x.fecha||"")}</td>
        <td style="font-family:monospace">${esc(x.cruce||"")}</td>
        <td>${esc(x.detalle||"")}</td>
        <td>${x.txId?`<a href="#" onclick="event.preventDefault(); openAuxTxDetailInReport('${esc(x.txId)}');" style="color:#333;font-weight:700;text-decoration:underline">${esc(x.comprobante||"")}</a>`:esc(x.comprobante||"")}</td>
        <td style="text-align:right">${He(x.saldo_anterior||0)}</td>
        <td style="text-align:right">${fmt(x.debito||0)}</td>
        <td style="text-align:right">${fmt(x.credito||0)}</td>
        <td style="text-align:right">${He(x.saldo_actual||0)}</td>
      </tr>`).join("");e.innerHTML=`
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm" style="color:#6B7280">Orden actual: <strong>${esc(N)} → ${esc(I)} → Fecha → Doc. Cruce</strong> · Registros: <strong>${fmtN(h.length)}</strong></p>
        <div class="flex items-center gap-2">
          <button class="btn btn-outline btn-sm" id="btn-pdf-aux" style="border-color:#6B7280;color:#374151"><i class="fas fa-file-pdf"></i> PDF</button>
          ${can("canExport")?'<button class="btn btn-outline btn-sm" id="btn-exp-aux"><i class="fas fa-file-excel"></i> Exportar</button>':""}
        </div>
      </div>
      <div class="overflow-x-auto" style="max-height:420px">
        <table class="data-table">
          <thead><tr><th>${W}</th><th>${K}</th><th>FECHA</th><th>CRUCE</th><th>DETALLE DOCTO.</th><th>COMPROBANTE</th><th>SALDO ANTERIOR</th><th>DEBITO</th><th>CREDITO</th><th>NUEVO SALDO</th></tr></thead>
          <tbody>${H}</tbody>
        </table>
      </div>`,(o=$("#btn-exp-aux"))==null||o.addEventListener("click",()=>{const x=k.map(P=>({nit:P.nit||"",cuenta:P.cuenta||"",fecha:P.fecha||"",cruce:P.cruce||"",detalle_docto:P.detalle||"",comprobante:P.comprobante||"",saldo_anterior:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.saldo_anterior||0):"",debito:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.debito||0):"",credito:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.credito||0):"",nuevo_saldo:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.saldo_actual||0):""}));exportToExcel(x,[{key:j,label:W},{key:Y,label:K},{key:"fecha",label:"FECHA"},{key:"cruce",label:"CRUCE"},{key:"detalle_docto",label:"DETALLE DOCTO."},{key:"comprobante",label:"COMPROBANTE"},{key:"saldo_anterior",label:"SALDO ANTERIOR"},{key:"debito",label:"DEBITO"},{key:"credito",label:"CREDITO"},{key:"nuevo_saldo",label:"NUEVO SALDO"}],"libro_auxiliar")}),(s=$("#btn-pdf-aux"))==null||s.addEventListener("click",async()=>{var x;try{const P=(x=window.jspdf)==null?void 0:x.jsPDF;if(typeof P!="function"){showToast("No se pudo inicializar el generador PDF.","error");return}const[V,U,z,J,te,F]=await Promise.all([API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>""),API.getSetting("company_city").catch(()=>""),API.getSetting("company_country").catch(()=>""),API.getSetting("software_name").catch(()=>"")]),D=new P({orientation:"portrait",unit:"pt",format:"letter"}),q=D.internal.pageSize.getWidth(),G=new Date().toLocaleString("es-CO"),ee=24,X=q-24,ne=(V||"EMPRESA").trim(),Z=`NIT: ${(U||"N/A").trim()}`,Q=[z,J,te].map(ie=>String(ie||"").trim()).filter(Boolean).join(" / ")||"Direccion no configurada",oe=`${N} -> ${I}`,ve=`Desde: ${m||"Inicio"}  Hasta: ${d||"Hoy"}`,be=p?r.find(ie=>ie.id===p):null,pe=`Cuentas consultadas: ${be?[be.code,be.name].map(ie=>String(ie||"").trim()).filter(Boolean).join(" - ")||"Cuenta seleccionada":"Todas"}`,de=(F||"GRAVY v2.0").trim(),me=(sessionStorage.getItem("user_name")||"Usuario").trim();D.setFont("helvetica","bold"),D.setFontSize(10),D.setTextColor(13,33,55),D.text(ne,ee,20),D.setFont("helvetica","normal"),D.setFontSize(8),D.setTextColor(100,100,100),D.text(Z,ee,30),D.text(Q,ee,40),D.setFont("helvetica","bold"),D.setFontSize(11),D.setTextColor(13,33,55),D.text("LIBRO AUXILIAR",q/2,20,{align:"center"}),D.setFont("helvetica","normal"),D.setFontSize(8),D.setTextColor(80,80,80),D.text(`Tipo: ${oe}`,q/2,30,{align:"center"}),D.text(ve,q/2,40,{align:"center"}),D.text(pe,q/2,50,{align:"center"}),D.setFont("helvetica","normal"),D.setFontSize(8),D.setTextColor(100,100,100),D.text(de,X,20,{align:"right"}),D.text(`Usuario: ${me}`,X,30,{align:"right"}),D.text(`Impreso: ${G}`,X,40,{align:"right"}),D.setDrawColor(180,180,180),D.setLineWidth(.5),D.line(ee,58,X,58);const ue=ie=>Number(ie||0).toLocaleString("es-CO",{minimumFractionDigits:2,maximumFractionDigits:2}),Ie=ie=>{const le=Number(ie||0),Be=ue(Math.abs(le));return le<0?`-${Be}`:Be},Se=k.map(ie=>{const le=[];return ie.kind==="primary"||ie.kind==="secondary"?le.push(ie[j]||"",ie[Y]||"","","",ie.detalle||"","","","","",""):ie.kind==="subtotal-secondary"||ie.kind==="subtotal-primary"||ie.kind==="grand-total"?le.push("","","","",ie.detalle||"","",Ie(ie.saldo_anterior||0),ue(ie.debito||0),ue(ie.credito||0),Ie(ie.saldo_actual||0)):le.push("","",ie.fecha||"",ie.cruce||"",ie.detalle||"",ie.comprobante||"",Ie(ie.saldo_anterior||0),ue(ie.debito||0),ue(ie.credito||0),Ie(ie.saldo_actual||0)),le._rowKind=ie.kind,le});D.autoTable({startY:66,head:[[W,K,"FECHA","CRUCE","DETALLE DOCTO.","COMPROBANTE","SALDO ANTERIOR","DEBITO","CREDITO","NUEVO SALDO"]],body:Se,theme:"plain",margin:{top:66,left:ee,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.5,textColor:[55,55,55],lineColor:[225,225,225],lineWidth:0,cellPadding:2.8},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineColor:[180,180,180],lineWidth:{top:0,right:0,bottom:.25,left:0}},columnStyles:{0:{cellWidth:44},1:{cellWidth:52},2:{cellWidth:44},3:{cellWidth:34},4:{cellWidth:100},5:{cellWidth:58},6:{cellWidth:58,halign:"right"},7:{cellWidth:56,halign:"right"},8:{cellWidth:56,halign:"right"},9:{cellWidth:58,halign:"right"}},didParseCell:ie=>{var Ce;if(ie.section!=="body")return;const{cell:le,row:Be,column:yt}=ie,Ue=(Ce=Se[Be.index])==null?void 0:Ce._rowKind;Ue==="primary"?(le.styles.fontStyle="bold",le.styles.textColor=[13,33,55],le.styles.fillColor=[255,255,255],le.styles.lineWidth=0):Ue==="secondary"?(le.styles.fontStyle="bold",le.styles.textColor=[20,20,20],le.styles.fillColor=[255,255,255],le.styles.lineWidth=0):Ue==="subtotal-secondary"?(le.styles.fillColor=[245,245,245],le.styles.fontStyle="bold",le.styles.lineWidth={top:.15,right:0,bottom:0,left:0},le.styles.lineColor=[208,208,208]):Ue==="subtotal-primary"?(le.styles.fillColor=[236,236,236],le.styles.fontStyle="bold",le.styles.lineWidth={top:.15,right:0,bottom:.15,left:0},le.styles.lineColor=[176,176,176]):Ue==="grand-total"?(le.styles.fillColor=[226,226,226],le.styles.fontStyle="bold",le.styles.lineWidth={top:.2,right:0,bottom:.2,left:0},le.styles.lineColor=[13,33,55],le.styles.textColor=[13,33,55]):Ue==="detail"&&(le.styles.fontSize=yt.index>=6?6.1:6.4,le.styles.cellPadding=yt.index>=6?2.1:2.6,le.styles.lineWidth=0)},didDrawPage:ie=>{const le=D.internal.pageSize.getHeight();D.setFont("helvetica","normal"),D.setFontSize(7),D.setTextColor(120,120,120),D.text("Reporte generado por GRAVY - Escala de grises",ee,le-10),D.text(`Página ${ie.pageNumber}`,X,le-10,{align:"right"})}}),D.save(`libro_auxiliar_${todayStr()}.pdf`)}catch(P){showToast(`Error al generar PDF: ${P.message}`,"error")}})}catch(n){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(n.message)}</div>`}}}window.launchReportModal=Ve;window.agingBucket=pn;window.renderAgingPortfolio=un;window.renderPortfolioBalances=eo;window.buildOpenPortfolioDocs=Go;window.ensureLedgerData=ot;window.generateAuxiliaryRows=yn;window.drawPdfHeader=gt;window.renderTrialBalance=mn;window.getSettingFirst=Ae;window.monthRangeToDates=fn;window.diffDays=rn;window.getReportViewHost=tt;window.reportCard=je;window.openAuxTxDetailInReport=Ar;window.fmtSignedAmount=$t;window.renderFinancialPosition=gn;window.fmtPolarityAmount=Ne;window.fmtSignedPlain=He;window.diffDaysSigned=ln;window.renderJournalBook=vn;window.closeAuxTxDetailPanel=to;window.renderIncomeStatement=bn;window.ensureAccountsSaldos=at;window.getByClass=xr;window.fmtPdfSignedNum=re;window.renderAuxiliaryBook=hn;window.getPdfHeaderContext=bt;window.addDays=dn;window.fmtPdfNum=fe;window.getPdfCtorOrWarn=ft;window.REPORT_STATE=$e;window.renderReportes=_r;window.drawPdfFooter=vt;window.signatureBlock=ya;const ao=[{key:"company_name",label:"Razón social",placeholder:"Nombre de la empresa"},{key:"company_nit",label:"NIT",placeholder:"900.123.456-7"},{key:"company_address",label:"Dirección",placeholder:"Dirección principal"},{key:"company_phone",label:"Teléfono",placeholder:"601-555-0100"},{key:"company_email",label:"Correo",placeholder:"info@empresa.com",type:"email"},{key:"smv_year",label:"SMV del año",placeholder:"2026",type:"number"}],xe={legalName:["representante_legal_name","legal_representative_name","rep_legal_name"],legalTitle:["representante_legal_title","legal_representative_title","rep_legal_title"],accountantName:["contador_name","accountant_name"],accountantTitle:["contador_title","accountant_title"],accountantLicense:["contador_license","accountant_license"],reviewerName:["revisor_fiscal_name","fiscal_reviewer_name"],reviewerTitle:["revisor_fiscal_title","fiscal_reviewer_title"],reviewerLicense:["revisor_fiscal_license","fiscal_reviewer_license"],defaultEnabled:["trial_show_signatures_default","show_signatures_default"]};async function ke(e,t=""){for(const a of e){const o=await API.getSetting(a);if(o)return o}return t}async function _n(){const[e,t,a,o,s,n,i,c,r]=await Promise.all([ke(xe.legalName,""),ke(xe.legalTitle,"Representante Legal"),ke(xe.accountantName,""),ke(xe.accountantTitle,"Contador"),ke(xe.accountantLicense,""),ke(xe.reviewerName,""),ke(xe.reviewerTitle,"Revisor Fiscal"),ke(xe.reviewerLicense,""),ke(xe.defaultEnabled,"0")]);return{legalName:e,legalTitle:t,accountantName:a,accountantTitle:o,accountantLicense:s,reviewerName:n,reviewerTitle:i,reviewerLicense:c,defaultEnabled:String(r).trim()==="1"||String(r).toLowerCase()==="true"}}async function xn(){if(!can("canWrite"))return showToast("Sin permisos para actualizar firmas","error");try{const e=[[xe.legalName[0],getInputVal("sig-legal-name").trim()],[xe.legalTitle[0],getInputVal("sig-legal-title").trim()||"Representante Legal"],[xe.accountantName[0],getInputVal("sig-acc-name").trim()],[xe.accountantTitle[0],getInputVal("sig-acc-title").trim()||"Contador"],[xe.accountantLicense[0],getInputVal("sig-acc-license").trim()],[xe.reviewerName[0],getInputVal("sig-rev-name").trim()],[xe.reviewerTitle[0],getInputVal("sig-rev-title").trim()||"Revisor Fiscal"],[xe.reviewerLicense[0],getInputVal("sig-rev-license").trim()],[xe.defaultEnabled[0],getCheckVal("sig-default-enabled")?"1":"0"]];await Promise.all(e.map(([t,a])=>API.setSetting(t,a))),showToast("Firmas actualizadas correctamente","success")}catch(e){showToast(e.message||"No se pudieron guardar las firmas","error")}}async function An(e){var t,a;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando configuración...</div>';try{const[o,s]=await Promise.all([pb.listAll("settings",{sort:"key"}),_n()]),n=Object.fromEntries(o.map(c=>[String(c.key||""),c])),i=can("canWrite");e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Configuración General</h3>
          <p class="text-sm" style="color:#6B7280">Administra los parámetros base de la empresa almacenados en la colección settings.</p>
        </div>
        ${i?'<button class="btn btn-primary" id="btn-save-config"><i class="fas fa-floppy-disk"></i> Guardar cambios</button>':""}
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div class="xl:col-span-2 bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
          <h4 class="font-bold mb-4" style="color:#0D2137">Datos generales</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${ao.map(c=>{var r;return`
              <div class="form-group ${c.key==="company_address"?"md:col-span-2":""}">
                <label class="form-label">${esc(c.label)}</label>
                <input
                  id="cfg-${esc(c.key)}"
                  type="${esc(c.type||"text")}"
                  class="form-input"
                  placeholder="${esc(c.placeholder)}"
                  value="${esc(((r=n[c.key])==null?void 0:r.value)||"")}"
                  ${i?"":"readonly"}>
              </div>`}).join("")}
          </div>
        </div>

        <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
          <h4 class="font-bold mb-3" style="color:#0D2137">Flujo de configuración</h4>
          <div class="space-y-3 text-sm" style="color:#6B7280">
            <p>La razón social se refleja en la barra superior de la aplicación.</p>
            <p>Las firmas de reportes ahora se administran aquí, junto con los datos generales de la empresa.</p>
            <p>La preferencia de firmas por defecto impacta el Balance de Prueba al abrir el reporte.</p>
            <p>Si agregas más parámetros en base de datos, aparecerán abajo en la tabla de settings detectados.</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h4 class="font-bold" style="color:#0D2137">Firmas para Reportes</h4>
            <p class="text-sm" style="color:#6B7280">Configura responsables y preferencia visual para los reportes financieros.</p>
          </div>
          ${i?'<button class="btn btn-secondary btn-sm" id="btn-save-signatures"><i class="fas fa-signature"></i> Guardar firmas</button>':""}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group md:col-span-2">
            <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
              <input id="sig-default-enabled" type="checkbox" ${s.defaultEnabled?"checked":""} ${i?"":"disabled"}>
              Activar "Mostrar firmas" por defecto en Balance de Prueba
            </label>
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Representante legal - Nombre</label>
            <input id="sig-legal-name" class="form-input" value="${esc(s.legalName||"")}" placeholder="Nombre completo" ${i?"":"readonly"}>
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Representante legal - Cargo</label>
            <input id="sig-legal-title" class="form-input" value="${esc(s.legalTitle||"Representante Legal")}" placeholder="Representante Legal" ${i?"":"readonly"}>
          </div>

          <div class="form-group">
            <label class="form-label">Contador - Nombre</label>
            <input id="sig-acc-name" class="form-input" value="${esc(s.accountantName||"")}" placeholder="Nombre completo" ${i?"":"readonly"}>
          </div>
          <div class="form-group">
            <label class="form-label">Contador - Cargo</label>
            <input id="sig-acc-title" class="form-input" value="${esc(s.accountantTitle||"Contador")}" placeholder="Contador" ${i?"":"readonly"}>
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Contador - Matrícula profesional (opcional)</label>
            <input id="sig-acc-license" class="form-input" value="${esc(s.accountantLicense||"")}" placeholder="TP 123456-T" ${i?"":"readonly"}>
          </div>

          <div class="form-group">
            <label class="form-label">Revisor fiscal - Nombre</label>
            <input id="sig-rev-name" class="form-input" value="${esc(s.reviewerName||"")}" placeholder="Nombre completo" ${i?"":"readonly"}>
          </div>
          <div class="form-group">
            <label class="form-label">Revisor fiscal - Cargo</label>
            <input id="sig-rev-title" class="form-input" value="${esc(s.reviewerTitle||"Revisor Fiscal")}" placeholder="Revisor Fiscal" ${i?"":"readonly"}>
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Revisor fiscal - Matrícula profesional (opcional)</label>
            <input id="sig-rev-license" class="form-input" value="${esc(s.reviewerLicense||"")}" placeholder="TP 654321-T" ${i?"":"readonly"}>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden mt-4" style="border-color:#F0F0F0">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:#F3F4F6">
          <h4 class="font-bold" style="color:#0D2137">Settings detectados</h4>
          <span class="text-xs" style="color:#9CA3AF">${o.length} registro(s)</span>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Clave</th><th>Valor</th></tr></thead>
            <tbody>
              ${o.length?o.map(c=>`
                <tr>
                  <td class="font-mono text-xs">${esc(c.key||"")}</td>
                  <td>${esc(String(c.value||""))}</td>
                </tr>`).join(""):'<tr><td colspan="2" class="text-center py-10" style="color:#9CA3AF">No hay settings registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`,(t=$("#btn-save-config"))==null||t.addEventListener("click",async()=>{try{const c=ao.map(r=>[r.key,getInputVal(`cfg-${r.key}`).trim()]);await Promise.all(c.map(([r,l])=>API.setSetting(r,l))),$("#topbar-company").textContent=getInputVal("cfg-company_name").trim(),showToast("Configuración actualizada correctamente","success"),An(e)}catch(c){showToast(c.message||"No se pudo guardar la configuración","error")}}),(a=$("#btn-save-signatures"))==null||a.addEventListener("click",xn)}catch(o){e.innerHTML=`<div class="bg-white rounded-2xl border p-8 text-center" style="border-color:#F0F0F0"><i class="fas fa-circle-exclamation text-3xl mb-3" style="color:#EF4444"></i><p class="font-semibold" style="color:#374151">No fue posible cargar la configuración</p><p class="text-sm mt-2" style="color:#6B7280">${esc(o.message)}</p></div>`}}window.loadSignatureSettings=_n;window.SIGNATURE_SETTINGS=xe;window.saveSignatureSettingsFromForm=xn;window.renderConfiguracion=An;window.CONFIG_FIELDS=ao;window.getSettingFirst=ke;let _e={page:1,perPage:100,total:0};function Oa(e){if(!e)return"—";const t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleString("es-CO",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1})}function ka(e){return(e==null?void 0:e.event_at)||(e==null?void 0:e.created)||""}async function $r(e){var t,a,o,s;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando auditoría...</div>';try{const n=await pb.list("audit_log",{page:1,perPage:100,sort:"-event_at"}),i=[...new Set(n.items.map(l=>l.action).filter(Boolean))].sort(),c=[...new Set(n.items.map(l=>l.entity).filter(Boolean))].sort();_e={page:1,perPage:100,total:0},e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Auditoría del Sistema</h3>
          <p class="text-sm" style="color:#6B7280">Trazabilidad completa de acciones de usuarios.</p>
        </div>
        ${can("canExport")?'<button class="btn btn-outline" id="btn-export-audit"><i class="fas fa-file-excel"></i> Exportar</button>':""}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input id="audit-q" class="form-input col-span-2 md:col-span-2" placeholder="Buscar usuario, detalle, ID...">
          <select id="audit-action" class="form-input">
            <option value="">Todas las acciones</option>
            ${i.map(l=>`<option value="${esc(l)}">${esc(l)}</option>`).join("")}
          </select>
          <select id="audit-entity" class="form-input">
            <option value="">Todas las entidades</option>
            ${c.map(l=>`<option value="${esc(l)}">${esc(l)}</option>`).join("")}
          </select>
          <select id="audit-user-filter" class="form-input">
            <option value="">Todos los usuarios</option>
            ${[...new Set(n.items.map(l=>l.username).filter(Boolean))].sort().map(l=>`<option value="${esc(l)}">${esc(l)}</option>`).join("")}
          </select>
        </div>
        <div class="flex gap-3 mt-3 flex-wrap">
          <div class="flex gap-2 items-center">
            <span class="text-sm" style="color:#6B7280">Desde:</span>
            <input id="audit-from" type="date" class="form-input" style="max-width:170px">
          </div>
          <div class="flex gap-2 items-center">
            <span class="text-sm" style="color:#6B7280">Hasta:</span>
            <input id="audit-to" type="date" class="form-input" style="max-width:170px">
          </div>
          <button class="btn btn-primary btn-sm" id="btn-audit-search"><i class="fas fa-search"></i> Buscar</button>
          <button class="btn btn-outline btn-sm" id="btn-audit-clear"><i class="fas fa-eraser"></i> Limpiar</button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div id="audit-results">
          <div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-search mr-2"></i>Aplica filtros y pulsa Buscar</div>
        </div>
        <div id="audit-pagination" class="flex items-center justify-between px-4 py-3 border-t" style="border-color:#F0F0F0; display:none!important"></div>
      </div>`;const r=()=>{_e.page=1,xa()};(t=$("#btn-audit-search"))==null||t.addEventListener("click",r),(a=$("#audit-q"))==null||a.addEventListener("keydown",l=>{l.key==="Enter"&&r()}),(o=$("#btn-audit-clear"))==null||o.addEventListener("click",()=>{["audit-q","audit-from","audit-to"].forEach(l=>setInputVal(l,"")),["audit-action","audit-entity","audit-user-filter"].forEach(l=>{const p=$(`#${l}`);p&&(p.value="")}),$("#audit-results").innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-search mr-2"></i>Aplica filtros y pulsa Buscar</div>',$("#audit-pagination").style.display="none"}),(s=$("#btn-export-audit"))==null||s.addEventListener("click",$n),r()}catch(n){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(n.message)}</div>`}}async function xa(){var a,o;const e=$("#audit-results"),t=$("#audit-pagination");if(e){e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const s=getInputVal("audit-q").trim(),n=getSelectVal("audit-action"),i=getSelectVal("audit-entity"),c=getSelectVal("audit-user-filter"),r=getInputVal("audit-from"),l=getInputVal("audit-to"),p=[];if(n){const u=pb.escapeFilterValue(n);p.push(`action="${u}"`)}if(i){const u=pb.escapeFilterValue(i);p.push(`entity="${u}"`)}if(c){const u=pb.escapeFilterValue(c);p.push(`username="${u}"`)}if(r&&p.push(`event_at>="${r} 00:00:00"`),l&&p.push(`event_at<="${l} 23:59:59"`),s){const u=pb.escapeFilterValue(s);p.push(`(username~"${u}" || details~"${u}" || entity_id~"${u}")`)}const f={page:_e.page,perPage:_e.perPage,sort:"-event_at",filter:p.join(" && ")||""};let m;try{m=await pb.list("audit_log",f)}catch{const y=p.filter(v=>!v.startsWith('event_at>="')&&!v.startsWith('event_at<="')).join(" && ");m=await pb.list("audit_log",{page:_e.page,perPage:_e.perPage,sort:"-id",filter:y||""}),(r||l)&&showToast("Se omitió filtro por fecha en Auditoría.","warning")}_e.total=m.totalItems;const d=Math.ceil(m.totalItems/_e.perPage)||1,b=u=>u&&{CREATE:"badge-green",UPDATE:"badge-blue",DELETE:"badge-red",STATUS:"badge-orange",VOID:"badge-red",LOGIN:"badge-blue",LOGOUT:"badge-blue"}[u.toUpperCase()]||"badge-blue";if(!m.items.length){e.innerHTML='<div class="p-10 text-center" style="color:#9CA3AF">No hay registros para los filtros aplicados.</div>',t.style.display="none";return}e.innerHTML=`
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Fecha y Hora</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>ID Entidad</th><th>Detalle</th><th></th></tr></thead>
          <tbody>
            ${m.items.map(u=>{var y;return`
              <tr>
                <td class="whitespace-nowrap text-xs">${esc(Oa(ka(u)))}</td>
                <td class="font-medium text-sm">${esc(u.username||"—")}</td>
                <td><span class="badge ${b(u.action)}">${esc(u.action||"—")}</span></td>
                <td class="text-sm">${esc(u.entity||"—")}</td>
                <td class="font-mono text-xs max-w-xs truncate" title="${esc(u.entity_id||"")}">${esc((u.entity_id||"—").slice(0,12))}${((y=u.entity_id)==null?void 0:y.length)>12?"…":""}</td>
                <td class="text-sm max-w-xs truncate" title="${esc(u.details||"")}">${esc(u.details||"—")}</td>
                <td><button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewAuditDetail(${JSON.stringify(JSON.stringify(u))})"><i class="fas fa-eye"></i></button></td>
              </tr>`}).join("")}
          </tbody>
        </table>
      </div>`,t.style.display="flex",t.innerHTML=`
      <span class="text-sm" style="color:#6B7280">
        Mostrando ${(_e.page-1)*_e.perPage+1}–${Math.min(_e.page*_e.perPage,_e.total)} de ${_e.total} registros
      </span>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" id="audit-prev" ${_e.page<=1?"disabled":""}><i class="fas fa-chevron-left"></i> Ant.</button>
        <span class="text-sm font-medium px-2 flex items-center">Pág. ${_e.page} / ${d}</span>
        <button class="btn btn-outline btn-sm" id="audit-next" ${_e.page>=d?"disabled":""}>Sig. <i class="fas fa-chevron-right"></i></button>
      </div>`,(a=$("#audit-prev"))==null||a.addEventListener("click",()=>{_e.page--,xa()}),(o=$("#audit-next"))==null||o.addEventListener("click",()=>{_e.page++,xa()})}catch(s){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(s.message)}</div>`}}}function wr(e){try{const t=JSON.parse(e);openModal("Detalle de Registro de Auditoría",`<div class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div><span class="form-label">Fecha y Hora</span><p class="font-medium">${esc(Oa(ka(t)))}</p></div>
          <div><span class="form-label">Usuario</span><p class="font-medium">${esc(t.username||"—")}</p></div>
          <div><span class="form-label">Acción</span><p><span class="badge badge-blue">${esc(t.action||"—")}</span></p></div>
          <div><span class="form-label">Entidad</span><p class="font-medium">${esc(t.entity||"—")}</p></div>
          <div class="col-span-2"><span class="form-label">ID de Entidad</span><p class="font-mono text-xs break-all">${esc(t.entity_id||"—")}</p></div>
          <div class="col-span-2"><span class="form-label">Detalle</span><p class="mt-1 p-3 rounded-lg text-sm break-words" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(t.details||"—")}</p></div>
          <div class="col-span-2"><span class="form-label">ID Registro Auditoría</span><p class="font-mono text-xs break-all" style="color:#9CA3AF">${esc(t.id||"—")}</p></div>
        </div>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch{showToast("No se pudo cargar el detalle","error")}}async function $n(){if(!can("canExport"))return showToast("Sin permisos de exportación","error");try{showToast("Generando exportación completa...","info");const e=getInputVal("audit-q").trim(),t=getSelectVal("audit-action"),a=getSelectVal("audit-entity"),o=getSelectVal("audit-user-filter"),s=getInputVal("audit-from"),n=getInputVal("audit-to"),i=[];if(t){const r=pb.escapeFilterValue(t);i.push(`action="${r}"`)}if(a){const r=pb.escapeFilterValue(a);i.push(`entity="${r}"`)}if(o){const r=pb.escapeFilterValue(o);i.push(`username="${r}"`)}if(s&&i.push(`event_at>="${s} 00:00:00"`),n&&i.push(`event_at<="${n} 23:59:59"`),e){const r=pb.escapeFilterValue(e);i.push(`(username~"${r}" || details~"${r}" || entity_id~"${r}")`)}let c;try{c=await pb.listAll("audit_log",{sort:"-event_at",filter:i.join(" && ")||""})}catch{const l=i.filter(p=>!p.startsWith('event_at>="')&&!p.startsWith('event_at<="')).join(" && ");c=await pb.listAll("audit_log",{sort:"-id",filter:l||""}),(s||n)&&showToast("Exportación sin filtro de fecha en Auditoría.","warning")}exportToExcel(c.map(r=>({"Fecha y Hora":Oa(ka(r)),Usuario:r.username||"",Acción:r.action||"",Entidad:r.entity||"","ID Entidad":r.entity_id||"",Detalle:r.details||""})),`auditoria_${todayStr()}`)}catch(e){showToast(e.message,"error")}}window.renderAuditoria=$r;window.fmtAuditDateTime=Oa;window.AUDIT_STATE=_e;window.getAuditDateValue=ka;window.viewAuditDetail=wr;window.loadAuditPage=xa;window.exportAuditLog=$n;async function qo(e){var t,a,o;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando usuarios...</div>';try{const s=await pb.listAll("users",{sort:"-created"});e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Usuarios</h3>
          <p class="text-sm" style="color:#6B7280">Gestion de acceso, roles y estado.</p>
        </div>
        <button class="btn btn-primary" id="btn-new-user"><i class="fas fa-user-plus"></i> Nuevo Usuario</button>
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <input id="users-q" class="form-input" placeholder="Buscar por nombre, correo o rol...">
      </div>

      ${((t=pb.currentUser)==null?void 0:t.role)==="admin"&&s.length<=1?`
      <div class="mb-4 p-4 rounded-2xl border" style="background:#FFF8F0;border-color:#FED7AA">
        <p class="font-semibold" style="color:#C46516"><i class="fas fa-circle-info mr-2"></i>Solo se visualiza 1 usuario</p>
        <p class="text-sm" style="color:#6B7280">Si ya existen mas usuarios en BD, revisa la regla listRule de la coleccion users en PocketBase.</p>
      </div>`:""}

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 290px)">
          <table class="data-table" id="users-table">
            <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${s.length?s.map(n=>`
                <tr>
                  <td>${esc(n.full_name||"?")}</td>
                  <td>${esc(n.email||"?")}</td>
                  <td>${roleBadge(n.role||"viewer")}</td>
                  <td>${n.active?'<span class="badge badge-green">Activo</span>':'<span class="badge badge-gray">Inactivo</span>'}</td>
                  <td>
                    <div class="flex gap-2">
                      <button class="btn btn-outline btn-sm" onclick="editUser('${esc(n.id)}')"><i class="fas fa-pen"></i></button>
                      <button class="btn btn-danger btn-sm" onclick="toggleUser('${esc(n.id)}', ${n.active?"false":"true"})"><i class="fas ${n.active?"fa-ban":"fa-rotate-left"}"></i></button>
                    </div>
                  </td>
                </tr>`).join(""):'<tr><td colspan="5" class="text-center py-10" style="color:#9CA3AF">No hay usuarios.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`,(a=$("#users-q"))==null||a.addEventListener("input",debounce(()=>filterTable("users-table",getInputVal("users-q")),150)),(o=$("#btn-new-user"))==null||o.addEventListener("click",()=>zo())}catch(s){e.innerHTML=`
      <div class="bg-white rounded-2xl border p-8 text-center" style="border-color:#F0F0F0">
        <i class="fas fa-circle-exclamation text-3xl mb-3" style="color:#EF4444"></i>
        <p class="font-semibold" style="color:#374151">No fue posible acceder a la coleccion de usuarios</p>
        <p class="text-sm mt-2" style="color:#6B7280">${esc(s.message)}</p>
        <p class="text-xs mt-3" style="color:#9CA3AF">Si el backend bloquea este recurso, puedes administrar usuarios desde el panel de PocketBase.</p>
      </div>`}}function zo(e=null){var t;if(!can("canManageUsers"))return showToast("No tienes permisos para gestionar usuarios","error");openModal(e?"Editar Usuario":"Nuevo Usuario",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Nombre completo</label><input id="uf-name" class="form-input" value="${esc((e==null?void 0:e.full_name)||"")}"></div>
      <div class="form-group"><label class="form-label">Correo</label><input id="uf-email" type="email" class="form-input" value="${esc((e==null?void 0:e.email)||"")}" ${e?"readonly":""}></div>
      <div class="form-group"><label class="form-label">Rol</label><select id="uf-role" class="form-input">${Object.keys(ROLES).map(a=>`<option value="${esc(a)}" ${((e==null?void 0:e.role)||"viewer")===a?"selected":""}>${esc(roleLabel(a))}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Estado</label><select id="uf-active" class="form-input"><option value="1" ${(e==null?void 0:e.active)!==!1?"selected":""}>Activo</option><option value="0" ${(e==null?void 0:e.active)===!1?"selected":""}>Inactivo</option></select></div>
      ${e?"":'<div class="form-group"><label class="form-label">Contraseña</label><input id="uf-pass" type="password" class="form-input"></div><div class="form-group"><label class="form-label">Confirmar Contraseña</label><input id="uf-pass2" type="password" class="form-input"></div>'}
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-user"><i class="fas fa-floppy-disk"></i> Guardar</button>'),(t=$("#btn-save-user"))==null||t.addEventListener("click",async()=>{var s;const a=$("#btn-save-user");a&&(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');const o={full_name:getInputVal("uf-name"),role:getSelectVal("uf-role"),active:getSelectVal("uf-active")==="1"};if(!o.full_name)return a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar'),showToast("El nombre es obligatorio","warning");try{if(e!=null&&e.id)await pb.update("users",e.id,o);else{const n=getInputVal("uf-email").toLowerCase(),i=getInputVal("uf-pass"),c=getInputVal("uf-pass2");if(!n||!i||!c)return showToast("Correo y contraseña son obligatorios","warning");if(i!==c)return showToast("Las contraseñas no coinciden","warning");const r=(n.split("@")[0]||"user").replace(/[^a-zA-Z0-9._-]/g,"").slice(0,30)||`user_${Date.now()}`,l=await pb.create("users",{...o,email:n,emailVisibility:!0,name:r,password:i,passwordConfirm:c})}closeModal(),showToast("Usuario guardado correctamente","success"),qo($("#page-content"))}catch(n){const i=(s=n==null?void 0:n.data)!=null&&s.data?Object.values(n.data.data).map(c=>c==null?void 0:c.message).filter(Boolean).join(" | "):"";showToast(i||n.message||"No se pudo guardar el usuario","error")}finally{a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar')}})}async function Er(e){try{zo(await pb.get("users",e))}catch(t){showToast(t.message,"error")}}function Cr(e,t){if(!can("canManageUsers"))return showToast("No tienes permisos para cambiar estado","error");confirmDialog(t?"Reactivar usuario":"Inactivar usuario",t?"¿Deseas reactivar este usuario?":"¿Deseas inactivar este usuario?",async()=>{try{await pb.update("users",e,{active:t}),showToast("Estado actualizado","success"),qo($("#page-content"))}catch(a){showToast(a.message,"error")}})}window.editUser=Er;window.toggleUser=Cr;window.renderUsuarios=qo;window.openUserForm=zo;async function Xe(e){var t,a,o,s,n,i,c,r,l,p,f,m,d;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando conciliaci?n...</div>';try{const[b,u,y]=await Promise.all([pb.listAll("bank_accounts",{sort:"name",expand:"account_id"}),API.getAccounts(!0),pb.listAll("bank_movements",{sort:"-date",expand:"bank_account_id,tx_line_id"})]),v=((t=b[0])==null?void 0:t.id)||"";e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Conciliaci?n Bancaria</h3>
          <p class="text-sm" style="color:#6B7280">Control de extractos y conciliaci?n de movimientos.</p>
        </div>
        ${can("canWrite")?'<div class="flex gap-2"><button class="btn btn-secondary" id="btn-new-bank"><i class="fas fa-building-columns"></i> Nueva Cuenta Bancaria</button><button class="btn btn-secondary" id="btn-import-ext"><i class="fas fa-file-import"></i> Importar Extracto</button><button class="btn btn-primary" id="btn-new-mov"><i class="fas fa-plus"></i> Nuevo Movimiento</button></div>':""}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select id="bank-filter" class="form-input">
            <option value="">Todas las cuentas bancarias</option>
            ${b.map(I=>`<option value="${esc(I.id)}" ${I.id===v?"selected":""}>${esc(I.bank)} - ${esc(I.number)} (${esc(I.name)})</option>`).join("")}
          </select>
          <input id="mov-q" class="form-input" placeholder="Buscar por descripci?n o referencia...">
          <div class="flex items-center gap-2">
            <label style="font-size:11px;font-weight:700;color:#6B7280;white-space:nowrap">Desde</label>
            <input id="filter-from" type="date" class="form-input" style="font-size:12px">
          </div>
          <div class="flex items-center gap-2">
            <label style="font-size:11px;font-weight:700;color:#6B7280;white-space:nowrap">Hasta</label>
            <input id="filter-to" type="date" class="form-input" style="font-size:12px">
          </div>
        </div>
        ${can("canWrite")?`
        <div class="flex flex-wrap gap-2 mt-3">
          <button class="btn btn-secondary" id="btn-suggest-recon"><i class="fas fa-wand-magic-sparkles"></i> Sugerir Conciliaci?n</button>
          <button class="btn btn-primary" id="btn-apply-suggested" disabled><i class="fas fa-check-double"></i> Aplicar Sugeridas (<span id="suggest-count">0</span>)</button>
          <button class="btn btn-outline" id="btn-recon-selected" disabled><i class="fas fa-list-check"></i> Conciliar Seleccionadas</button>
          <button class="btn btn-outline" id="btn-clear-movs" style="border-color:#FECACA;color:#DC2626"><i class="fas fa-trash-can"></i> Limpiar Per?odo</button>
        </div>
        <p class="text-xs mt-2" style="color:#9CA3AF">Sugerencias por monto + fecha (ventana +/- 3 d?as) usando el auxiliar contable de la cuenta bancaria.</p>
        `:""}
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 290px)">
          <table class="data-table" id="mov-table">
            <thead><tr>${can("canWrite")?'<th><input type="checkbox" id="mov-check-all"></th>':""}<th>Fecha</th><th>Cuenta Bancaria</th><th>Descripci?n</th><th>D?bito</th><th>Cr?dito</th><th>Referencia</th><th>Conciliado</th>${can("canWrite")?"<th>Sugerencia</th>":""}<th>Acciones</th></tr></thead>
            <tbody>
              ${y.length?y.map(I=>{var S,w,E,L;return`
                <tr data-bank-id="${esc(I.bank_account_id)}" data-mov-id="${esc(I.id)}" data-reconciled="${I.reconciled?"1":"0"}" data-date="${esc(I.date)}">
                  ${can("canWrite")?`<td>${I.reconciled?"":`<input type="checkbox" class="mov-check" value="${esc(I.id)}">`}</td>`:""}
                  <td>${esc(I.date)}</td>
                  <td>${esc(((w=(S=I.expand)==null?void 0:S.bank_account_id)==null?void 0:w.bank)||"")} - ${esc(((L=(E=I.expand)==null?void 0:E.bank_account_id)==null?void 0:L.number)||"")}</td>
                  <td>${esc(I.description||"?")}</td>
                  <td>${fmt(I.debit||0)}</td>
                  <td>${fmt(I.credit||0)}</td>
                  <td>${esc(I.ref||"?")}</td>
                  <td>${I.reconciled?'<span class="badge badge-green">S?</span>':'<span class="badge badge-orange">No</span>'}</td>
                  ${can("canWrite")?'<td class="mov-suggest"><span class="badge badge-gray">-</span></td>':""}
                  <td>${can("canWrite")?`<button class="btn btn-outline btn-sm" onclick="toggleRecon('${esc(I.id)}', ${I.reconciled?"false":"true"})"><i class="fas fa-check"></i></button>`:""}</td>
                </tr>`}).join(""):`<tr><td colspan="${can("canWrite")?"10":"8"}" class="text-center py-10" style="color:#9CA3AF">No hay movimientos bancarios.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;const g=new Map,h=()=>{const I=$$("#mov-table tbody .mov-check:checked").length,S=$("#btn-recon-selected");S&&(S.disabled=I===0,S.innerHTML=`<i class="fas fa-list-check"></i> Conciliar Seleccionadas${I?` (${I})`:""}`)},_=()=>{const I=getSelectVal("bank-filter"),S=getInputVal("mov-q").toLowerCase(),w=getInputVal("filter-from"),E=getInputVal("filter-to");$$("#mov-table tbody tr").forEach(L=>{const R=!I||L.dataset.bankId===I,M=!S||L.textContent.toLowerCase().includes(S),B=L.dataset.date||"",k=!w||B>=w,j=!E||B<=E;L.style.display=R&&M&&k&&j?"":"none"}),h()},A=I=>{g.clear(),I.forEach(E=>g.set(E.movementId,E));const S=I.length;$("#suggest-count")&&($("#suggest-count").textContent=String(S));const w=$("#btn-apply-suggested");w&&(w.disabled=S===0),$$("#mov-table tbody tr").forEach(E=>{const L=E.dataset.movId,R=E.querySelector(".mov-suggest");if(!R)return;const M=g.get(L);if(!M){R.innerHTML='<span class="badge badge-gray">-</span>';return}const B=M.confidence==="alta"?"badge-green":M.confidence==="media"?"badge-blue":"badge-orange",k=M.confidence==="alta"?"Alta":M.confidence==="media"?"Media":"Baja";R.innerHTML=`<span class="badge ${B}" title="${esc(M.reason)}">${k}</span>`})},C=async()=>{try{const I=getSelectVal("bank-filter");if(!I)return showToast("Selecciona una cuenta bancaria para sugerir conciliaci?n","warning");const S=b.find(L=>L.id===I);if(!(S!=null&&S.account_id))return showToast("La cuenta bancaria no tiene cuenta contable asociada","warning");const w=$("#btn-suggest-recon");w&&(w.disabled=!0,w.innerHTML='<i class="fas fa-spinner fa-spin"></i> Analizando...');const E=await In(S,y,3);A(E),E.length?showToast(`Se generaron ${E.length} sugerencia(s) de conciliaci?n`,"success"):showToast("No se encontraron sugerencias autom?ticas para esa cuenta","info")}catch(I){showToast(I.message||"Error generando sugerencias","error")}finally{const I=$("#btn-suggest-recon");I&&(I.disabled=!1,I.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> Sugerir Conciliaci?n')}},T=async()=>{const I=[...g.values()];if(!I.length)return showToast("No hay sugerencias para aplicar","warning");const S=$("#btn-apply-suggested");S&&(S.disabled=!0,S.innerHTML='<i class="fas fa-spinner fa-spin"></i> Aplicando...');let w=0;for(const E of I)try{await pb.update("bank_movements",E.movementId,{reconciled:!0,tx_line_id:E.txLineId}),w++}catch{}showToast(`Conciliadas ${w} sugerencia(s)`,w?"success":"warning"),Xe($("#page-content"))},N=async()=>{const I=$$("#mov-table tbody .mov-check:checked").map(E=>E.value);if(!I.length)return showToast("No hay movimientos seleccionados","warning");const S=$("#btn-recon-selected");S&&(S.disabled=!0,S.innerHTML='<i class="fas fa-spinner fa-spin"></i> Conciliando...');let w=0;for(const E of I){const L=g.get(E);try{await pb.update("bank_movements",E,L?{reconciled:!0,tx_line_id:L.txLineId}:{reconciled:!0}),w++}catch{}}showToast(`Conciliadas ${w} seleccionada(s)`,w?"success":"warning"),Xe($("#page-content"))};(a=$("#bank-filter"))==null||a.addEventListener("change",_),(o=$("#filter-from"))==null||o.addEventListener("change",_),(s=$("#filter-to"))==null||s.addEventListener("change",_),(n=$("#btn-clear-movs"))==null||n.addEventListener("click",()=>Sn(b,y)),(i=$("#mov-q"))==null||i.addEventListener("input",debounce(_,150)),(c=$("#btn-new-bank"))==null||c.addEventListener("click",()=>wn(u)),(r=$("#btn-new-mov"))==null||r.addEventListener("click",()=>En(b)),(l=$("#btn-import-ext"))==null||l.addEventListener("click",()=>Nn(b)),(p=$("#btn-suggest-recon"))==null||p.addEventListener("click",C),(f=$("#btn-apply-suggested"))==null||f.addEventListener("click",T),(m=$("#btn-recon-selected"))==null||m.addEventListener("click",N),(d=$("#mov-check-all"))==null||d.addEventListener("change",I=>{const S=!!I.target.checked;$$("#mov-table tbody tr").forEach(w=>{if(w.style.display==="none"||w.dataset.reconciled==="1")return;const E=w.querySelector(".mov-check");E&&(E.checked=S)}),h()}),$$("#mov-table tbody .mov-check").forEach(I=>I.addEventListener("change",h)),_()}catch(b){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(b.message)}</div>`}}function wn(e){var t;openModal("Nueva Cuenta Bancaria",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Nombre</label><input id="ba-name" class="form-input"></div>
      <div class="form-group"><label class="form-label">Banco</label><input id="ba-bank" class="form-input"></div>
      <div class="form-group"><label class="form-label">N?mero</label><input id="ba-number" class="form-input"></div>
      <div class="form-group"><label class="form-label">Cuenta contable asociada</label><select id="ba-account" class="form-input">${e.map(a=>`<option value="${esc(a.id)}">${esc(a.code)} - ${esc(a.name)}</option>`).join("")}</select></div>
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-ba">Guardar</button>'),(t=$("#btn-save-ba"))==null||t.addEventListener("click",async()=>{try{const a={name:getInputVal("ba-name"),bank:getInputVal("ba-bank"),number:getInputVal("ba-number"),account_id:getSelectVal("ba-account"),currency:"COP",active:!0};if(!a.name||!a.bank||!a.number||!a.account_id)return showToast("Completa todos los campos","warning");const o=await pb.create("bank_accounts",a);closeModal(),showToast("Cuenta bancaria creada","success"),Xe($("#page-content"))}catch(a){showToast(a.message,"error")}})}function En(e){var t;openModal("Nuevo Movimiento Bancario",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Cuenta Bancaria</label><select id="bm-acc" class="form-input">${e.map(a=>`<option value="${esc(a.id)}">${esc(a.bank)} - ${esc(a.number)}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Fecha</label><input id="bm-date" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Descripci?n</label><input id="bm-desc" class="form-input"></div>
      <div class="form-group"><label class="form-label">D?bito</label><input id="bm-debit" class="form-input" value="0"></div>
      <div class="form-group"><label class="form-label">Cr?dito</label><input id="bm-credit" class="form-input" value="0"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Referencia</label><input id="bm-ref" class="form-input"></div>
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-bm">Guardar</button>'),(t=$("#btn-save-bm"))==null||t.addEventListener("click",async()=>{try{const a={bank_account_id:getSelectVal("bm-acc"),date:getInputVal("bm-date"),description:getInputVal("bm-desc"),debit:parseNum(getInputVal("bm-debit")),credit:parseNum(getInputVal("bm-credit")),balance:0,ref:getInputVal("bm-ref"),reconciled:!1};if(!a.bank_account_id||!a.date)return showToast("Cuenta y fecha son obligatorias","warning");if(!(a.debit>0||a.credit>0))return showToast("Ingresa d?bito o cr?dito","warning");const o=await pb.create("bank_movements",a);closeModal(),showToast("Movimiento registrado","success"),Xe($("#page-content"))}catch(a){showToast(a.message,"error")}})}async function Tr(e,t){try{await pb.update("bank_movements",e,{reconciled:t}),showToast("Estado de conciliación actualizado","success"),Xe($("#page-content"))}catch(a){showToast(a.message,"error")}}function oo(e){if(!e)return null;const t=new Date(String(e).slice(0,10)+"T00:00:00");return isNaN(t)?null:t}function Cn(e,t){const a=oo(e),o=oo(t);return!a||!o?999:Math.round(Math.abs((a-o)/864e5))}function so(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}function Tn(e,t){const a=new Set(["de","la","el","los","las","por","para","con","del","y","en","a","un","una"]),o=new Set(so(e).split(" ").filter(i=>i.length>=4&&!a.has(i))),s=new Set(so(t).split(" ").filter(i=>i.length>=4&&!a.has(i)));if(!o.size||!s.size)return 0;let n=0;return o.forEach(i=>{s.has(i)&&n++}),n/Math.max(o.size,s.size)}async function In(e,t,a=3){const o=e==null?void 0:e.account_id;if(!o)return[];const s=pb.escapeFilterValue(o),n=await pb.listAll("tx_lines",{filter:`account_id="${s}"`,expand:"tx_id",sort:"-created"}),i=new Set(t.filter(f=>f.tx_line_id).map(f=>f.tx_line_id)),c=n.filter(f=>!i.has(f.id)),r=t.filter(f=>f.bank_account_id===e.id&&!f.reconciled),l=new Set,p=[];for(const f of r){const m=+(f.debit>0?f.debit:f.credit||0);if(!m)continue;const d=f.debit>0?"credit":"debit",b=c.filter(_=>!l.has(_.id)).filter(_=>Math.abs(+(_[d]||0)-m)<.01).map(_=>{var I,S,w,E;const A=((S=(I=_.expand)==null?void 0:I.tx_id)==null?void 0:S.date)||"",C=Cn(f.date,A),T=Tn(f.description||f.ref||"",_.description||((E=(w=_.expand)==null?void 0:w.tx_id)==null?void 0:E.description)||""),N=Math.max(0,100-C*12)+T*40;return{line:_,dDiff:C,descScore:T,score:N}}).filter(_=>_.dDiff<=a).sort((_,A)=>A.score-_.score);if(!b.length)continue;const u=b[0],y=b[1],v=!y||u.score-y.score>=20,g=v&&u.dDiff<=1?"alta":v?"media":"baja",h=`Monto exacto ${fmt(m)} · dif fecha ${u.dDiff} día(s)`;p.push({movementId:f.id,txLineId:u.line.id,confidence:g,reason:h}),l.add(u.line.id)}return p}function Sn(e,t){var i,c,r,l;const a=getInputVal("filter-from")||"",o=getInputVal("filter-to")||"",s=getSelectVal("bank-filter")||"";openModal('<i class="fas fa-trash-can mr-2" style="color:#DC2626"></i>Limpiar Per?odo',`<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:12px 14px;font-size:13px;color:#991B1B;margin-bottom:16px">
       <i class="fas fa-triangle-exclamation mr-1"></i>
       Esta acci?n <strong>elimina permanentemente</strong> los movimientos del rango seleccionado.
       Los movimientos ya conciliados se eliminar?n tambi?n y perder?n su v?nculo contable.
     </div>
     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div class="form-group mb-0">
         <label class="form-label">Cuenta bancaria</label>
         <select id="clr-bank" class="form-input">
           <option value="">Todas las cuentas</option>
           ${e.map(p=>`<option value="${esc(p.id)}" ${p.id===s?"selected":""}>${esc(p.bank)} - ${esc(p.number)} (${esc(p.name)})</option>`).join("")}
         </select>
       </div>
       <div></div>
       <div class="form-group mb-0">
         <label class="form-label">Desde <span style="color:#EF4444">*</span></label>
         <input id="clr-from" type="date" class="form-input" value="${esc(a)}">
       </div>
       <div class="form-group mb-0">
         <label class="form-label">Hasta <span style="color:#EF4444">*</span></label>
         <input id="clr-to" type="date" class="form-input" value="${esc(o)}">
       </div>
     </div>
     <div id="clr-preview" class="mt-4" style="font-size:13px;color:#6B7280;min-height:24px"></div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-danger" id="btn-clr-confirm" disabled>
       <i class="fas fa-trash-can mr-1"></i> Eliminar movimientos
     </button>`);const n=()=>{const p=getSelectVal("clr-bank"),f=getInputVal("clr-from"),m=getInputVal("clr-to");if(!f||!m){$("#clr-preview").innerHTML='<span style="color:#9CA3AF">Selecciona ambas fechas para ver cu?ntos registros se eliminar?n.</span>',$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!0);return}if(f>m){$("#clr-preview").innerHTML='<span style="color:#EF4444"><i class="fas fa-circle-exclamation mr-1"></i>La fecha inicial no puede ser mayor que la final.</span>',$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!0);return}const d=t.filter(u=>(!p||u.bank_account_id===p)&&u.date>=f&&u.date<=m),b=d.filter(u=>u.reconciled).length;if(!d.length){$("#clr-preview").innerHTML='<span style="color:#6B7280">Ning?n movimiento coincide con ese rango.</span>',$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!0);return}$("#clr-preview").innerHTML=`
      <span style="color:#DC2626;font-weight:700"><i class="fas fa-triangle-exclamation mr-1"></i>
      Se eliminar?n <strong>${d.length}</strong> movimiento(s)
      ${b?`<span style="color:#92400E"> — de los cuales <strong>${b}</strong> ya est?n conciliados</span>`:""}
      </span>`,$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!1)};(i=$("#clr-bank"))==null||i.addEventListener("change",n),(c=$("#clr-from"))==null||c.addEventListener("change",n),(r=$("#clr-to"))==null||r.addEventListener("change",n),n(),(l=$("#btn-clr-confirm"))==null||l.addEventListener("click",async()=>{const p=getSelectVal("clr-bank"),f=getInputVal("clr-from"),m=getInputVal("clr-to"),d=t.filter(v=>(!p||v.bank_account_id===p)&&v.date>=f&&v.date<=m);if(!d.length)return;const b=$("#btn-clr-confirm");b&&(b.disabled=!0,b.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i> Eliminando...');let u=0,y=0;for(const v of d)try{await pb.delete("bank_movements",v.id),u++}catch{y++}closeModal(),y?showToast(`Eliminados ${u}. ${y} no pudieron borrarse (pueden tener restricciones).`,"warning"):showToast(`${u} movimiento(s) eliminado(s) correctamente`,"success"),Xe($("#page-content"))})}let Ke=[],It="";function Nn(e){openModal('<i class="fas fa-file-import mr-2"></i>Importar Extracto Bancario','<div id="import-wizard"></div>','<div id="import-footer" style="display:contents"></div>',!0),Wo(e)}function Wo(e){var a,o;$("#modal-body").querySelector("#import-wizard").innerHTML=`
    <div class="mb-4">
      <label class="form-label">Cuenta bancaria destino <span style="color:#EF4444">*</span></label>
      <select id="imp-bank-acc" class="form-input">
        ${e.map(s=>`<option value="${esc(s.id)}">${esc(s.bank)} — ${esc(s.number)} (${esc(s.name)})</option>`).join("")}
      </select>
    </div>

    <div style="display:flex;gap:0;border-bottom:2px solid #E5E7EB;margin-bottom:16px">
      <button class="imp-tab" data-tab="excel"
        style="padding:8px 20px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;border-bottom:3px solid #2E6CE6;color:#2E6CE6;margin-bottom:-2px">
        <i class="fas fa-file-excel mr-1"></i> Excel / CSV
      </button>
      <button class="imp-tab" data-tab="paste"
        style="padding:8px 20px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;color:#6B7280">
        <i class="fas fa-paste mr-1"></i> Copiar/Pegar desde PDF
      </button>
    </div>

    <div id="imp-tab-excel">
      <div id="imp-drop-zone"
        style="border:2px dashed #D1D5DB;border-radius:14px;padding:36px;text-align:center;cursor:pointer;background:#F9FAFB;transition:all .2s">
        <i class="fas fa-cloud-upload-alt" style="font-size:2rem;color:#9CA3AF;display:block;margin-bottom:8px"></i>
        <p style="font-weight:600;font-size:14px;color:#374151;margin:0 0 4px">Haz clic o arrastra el archivo aquí</p>
        <p style="font-size:12px;color:#9CA3AF;margin:0">Formatos: .xlsx · .xls · .csv</p>
        <input type="file" id="imp-file-input" accept=".xlsx,.xls,.csv" style="display:none">
      </div>
      <div id="imp-col-map" class="mt-4" style="display:none"></div>
    </div>

    <div id="imp-tab-paste" style="display:none">
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:10px 14px;font-size:13px;color:#92400E;margin-bottom:10px">
        <i class="fas fa-lightbulb mr-1"></i>
        Abre el PDF, selecciona el texto de la tabla de movimientos (<strong>Ctrl+A</strong> en la página del extracto) y pégalo aquí.
        Funciona con <strong>PDFs digitales</strong> (texto seleccionable), no escaneados.
      </div>

      <div style="margin-bottom:10px">
        <label class="form-label" style="margin-bottom:6px">¿Cómo están los valores en el extracto?</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <label style="display:flex;align-items:center;gap:6px;padding:7px 13px;border:1.5px solid #D1D5DB;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#374151;background:#fff">
            <input type="radio" name="imp-format" value="tres" checked style="accent-color:#2E6CE6">
            <span><i class="fas fa-table-columns mr-1" style="color:#6B7280"></i> Débito | Crédito | Saldo <span style="font-size:11px;color:#9CA3AF">(más común)</span></span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;padding:7px 13px;border:1.5px solid #D1D5DB;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#374151;background:#fff">
            <input type="radio" name="imp-format" value="dos" style="accent-color:#2E6CE6">
            <span><i class="fas fa-columns mr-1" style="color:#6B7280"></i> Débito | Crédito (sin saldo)</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;padding:7px 13px;border:1.5px solid #D1D5DB;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#374151;background:#fff">
            <input type="radio" name="imp-format" value="signos" style="accent-color:#2E6CE6">
            <span><i class="fas fa-plus-minus mr-1" style="color:#6B7280"></i> Valor único (+/−)</span>
          </label>
        </div>
      </div>

      <textarea id="imp-paste-area" class="form-input" rows="9"
        style="font-family:monospace;font-size:12px;resize:vertical"
        placeholder="Pega el texto aquí. Ejemplo (formato Déb|Créd|Saldo):&#10;&#10;01/04/2025  TRANSFERENCIA PSE PAGO       1.250.000,00              4.800.000,00&#10;05/04/2025  COMPRA POS EXITO CALLE 80        85.400,00              4.714.600,00&#10;10/04/2025  CONSIGNACION EFECTIVO                        2.000.000,00  6.714.600,00"></textarea>
      <div style="display:flex;align-items:center;gap:12px;margin-top:10px">
        <button class="btn btn-secondary" id="btn-imp-analyze">
          <i class="fas fa-wand-magic-sparkles mr-1"></i> Analizar texto
        </button>
        <span style="font-size:12px;color:#9CA3AF">Se detectan fechas, descripciones y montos automáticamente.</span>
      </div>
    </div>`,$("#modal-footer").innerHTML='<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>',$$(".imp-tab").forEach(s=>{s.addEventListener("click",()=>{$$(".imp-tab").forEach(n=>{n.style.borderBottom="none",n.style.color="#6B7280"}),s.style.borderBottom="3px solid #2E6CE6",s.style.color="#2E6CE6",$("#imp-tab-excel").style.display=s.dataset.tab==="excel"?"":"none",$("#imp-tab-paste").style.display=s.dataset.tab==="paste"?"":"none"})});const t=$("#imp-drop-zone");t==null||t.addEventListener("click",()=>{var s;return(s=$("#imp-file-input"))==null?void 0:s.click()}),t==null||t.addEventListener("dragover",s=>{s.preventDefault(),t.style.borderColor="#2E6CE6",t.style.background="#EFF6FF"}),t==null||t.addEventListener("dragleave",()=>{t.style.borderColor="#D1D5DB",t.style.background="#F9FAFB"}),t==null||t.addEventListener("drop",s=>{var i,c;s.preventDefault(),t.style.borderColor="#D1D5DB",t.style.background="#F9FAFB";const n=(c=(i=s.dataTransfer)==null?void 0:i.files)==null?void 0:c[0];n&&no(n,e)}),(a=$("#imp-file-input"))==null||a.addEventListener("change",s=>{var n;(n=s.target.files)!=null&&n[0]&&no(s.target.files[0],e)}),(o=$("#btn-imp-analyze"))==null||o.addEventListener("click",()=>{var r,l,p;const s=((l=(r=$("#imp-paste-area"))==null?void 0:r.value)==null?void 0:l.trim())||"";if(!s)return showToast("Pega el texto del extracto primero","warning");const n=((p=document.querySelector('input[name="imp-format"]:checked'))==null?void 0:p.value)||"tres",i=Rn(s,n);if(!i.length)return showToast("No se detectaron movimientos. Verifica que el texto incluya fechas (dd/mm/aaaa) y el formato seleccionado sea correcto.","warning");const c=getSelectVal("imp-bank-acc");Yo(i,e,c)})}function no(e,t){const a=new FileReader;a.onload=o=>{try{const s=XLSX.read(new Uint8Array(o.target.result),{type:"array",cellDates:!0}),n=s.Sheets[s.SheetNames[0]],i=XLSX.utils.sheet_to_json(n,{header:1,defval:""});if(i.length<2)return showToast("El archivo no tiene datos suficientes","warning");const c=Ln(i);Pn(i,c,e.name,t)}catch(s){showToast("Error al leer el archivo: "+s.message,"error")}},a.readAsArrayBuffer(e)}const st={date:["fecha","date","dia","fec"],desc:["descripcion","descripción","concepto","detalle","movimiento","transaccion","transacción"],debit:["debito","débito","cargo","egreso","salida","retiro","debit","db"],cred:["credito","crédito","abono","ingreso","deposito","depósito","credit","cr","entrada"],ref:["referencia","ref","numero","número","doc","comprobante","nro","cheque"]};function Ln(e){let t=0;for(let s=0;s<Math.min(e.length,10);s++){const n=e[s].map(c=>String(c).toLowerCase());let i=0;for(const c of Object.values(st))n.some(r=>c.some(l=>r.includes(l)))&&i++;if(i>=2){t=s;break}}const a=e[t].map(s=>String(s).toLowerCase().trim()),o=s=>a.findIndex(n=>s.some(i=>n.includes(i)));return{hRow:t,date:o(st.date),desc:o(st.desc),debit:o(st.debit),cred:o(st.cred),ref:o(st.ref)}}function Pn(e,t,a,o){var l;const s=e[t.hRow],n=e.length-t.hRow-1,i=$("#imp-drop-zone");i&&(i.style.cssText="padding:10px 16px;border:1.5px solid #22C55E;border-radius:12px;background:#F0FDF4;display:flex;align-items:center;gap:10px;cursor:default",i.innerHTML=`<i class="fas fa-file-excel" style="color:#16A34A;font-size:1.3rem"></i>
      <span style="font-size:14px;font-weight:600;color:#15803D">${esc(a)}</span>
      <span style="font-size:12px;color:#6B7280">${n} filas detectadas</span>`,i.onclick=null,["dragover","dragleave","drop"].forEach(p=>i.removeEventListener(p,null)));const c=p=>[-1,...s.keys()].map(f=>`<option value="${f}" ${f===p?"selected":""}>${f<0?"— No usar —":`Col.${f+1}: ${esc(String(s[f]).slice(0,24))}`}</option>`).join(""),r=$("#imp-col-map");r.style.display="",r.innerHTML=`
    <p style="font-size:13px;font-weight:700;color:#374151;margin-bottom:10px">
      Mapeo de columnas <span style="font-weight:400;color:#9CA3AF">(ajusta si es necesario)</span>
    </p>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      <div><label class="form-label">Fecha <span style="color:#EF4444">*</span></label>
           <select id="mc-date"  class="form-input" style="font-size:13px">${c(t.date)}</select></div>
      <div><label class="form-label">Descripción <span style="color:#EF4444">*</span></label>
           <select id="mc-desc"  class="form-input" style="font-size:13px">${c(t.desc)}</select></div>
      <div><label class="form-label">Débito</label>
           <select id="mc-debit" class="form-input" style="font-size:13px">${c(t.debit)}</select></div>
      <div><label class="form-label">Crédito</label>
           <select id="mc-cred"  class="form-input" style="font-size:13px">${c(t.cred)}</select></div>
      <div><label class="form-label">Referencia</label>
           <select id="mc-ref"   class="form-input" style="font-size:13px">${c(t.ref)}</select></div>
    </div>

    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:12px 14px;margin-bottom:12px">
      <p style="font-size:12px;font-weight:700;color:#1D4ED8;margin:0 0 6px">
        <i class="fas fa-info-circle mr-1"></i> ¿El extracto usa una sola columna de valor con positivo/negativo?
      </p>
      <div style="display:flex;align-items:center;gap:10px">
        <select id="mc-valor" class="form-input" style="font-size:13px;max-width:280px">${c(-1)}</select>
        <span style="font-size:12px;color:#6B7280">Selecciona la columna. Positivo → Crédito · Negativo → Débito. <em>Ignora los campos Débito/Crédito de arriba.</em></span>
      </div>
    </div>

    <button class="btn btn-primary" id="btn-imp-preview">
      <i class="fas fa-eye mr-1"></i> Ver vista previa
    </button>`,(l=$("#btn-imp-preview"))==null||l.addEventListener("click",()=>{const p={date:+getSelectVal("mc-date"),desc:+getSelectVal("mc-desc"),debit:+getSelectVal("mc-debit"),cred:+getSelectVal("mc-cred"),ref:+getSelectVal("mc-ref"),valor:+getSelectVal("mc-valor")};if(p.date<0||p.desc<0)return showToast("Las columnas Fecha y Descripción son obligatorias","warning");const f=p.valor>=0;if(!f&&p.debit<0&&p.cred<0)return showToast("Selecciona al menos una columna de valor (Débito, Crédito, o Valor único)","warning");const m=[];for(let b=t.hRow+1;b<e.length;b++){const u=e[b],y=Fn(u[p.date]);if(!y)continue;let v=0,g=0;if(f){const h=Dn(u[p.valor]);h<0?v=Math.abs(h):g=h}else v=p.debit>=0?Pt(u[p.debit]):0,g=p.cred>=0?Pt(u[p.cred]):0;!v&&!g||m.push({date:y,description:String(u[p.desc]??"").trim(),debit:v,credit:g,ref:p.ref>=0?String(u[p.ref]??"").trim():""})}if(!m.length)return showToast("No se encontraron filas válidas con el mapeo seleccionado","warning");const d=getSelectVal("imp-bank-acc");Yo(m,o,d)})}function Fn(e){if(e==null||e==="")return null;if(e instanceof Date&&!isNaN(e))return e.toISOString().slice(0,10);if(typeof e=="number"){const s=new Date(Math.round((e-25569)*864e5));return isNaN(s)?null:s.toISOString().slice(0,10)}const t=String(e).trim(),a=t.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);if(a)return`${a[3]}-${a[2].padStart(2,"0")}-${a[1].padStart(2,"0")}`;const o=t.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);return o?`${o[1]}-${o[2].padStart(2,"0")}-${o[3].padStart(2,"0")}`:null}function Pt(e){if(e==null||e==="")return 0;if(typeof e=="number")return Math.abs(e);const t=String(e).replace(/\s/g,"");let a;return/\d\.\d{3},/.test(t)?a=t.replace(/\./g,"").replace(",","."):/\d,\d{3}\./.test(t)?a=t.replace(/,/g,""):a=t.replace(/[^0-9.\-]/g,""),Math.abs(parseFloat(a))||0}function Dn(e){if(e==null||e==="")return 0;if(typeof e=="number")return e;const t=String(e).trim(),a=/^[-−(]/.test(t)||/\)$/.test(t),o=t.replace(/^[-−(]/,"").replace(/\)$/,"");return a?-Pt(o):Pt(o)}function Rn(e,t="tres"){const a=[],o=/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b|\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b/,s="[-−]?\\d{1,3}(?:[.,\\u00A0\\u2009\\u202F ]\\d{3})+(?:[.,]\\d{1,2})?|[-−]?\\d+[.,]\\d{2}",n=()=>new RegExp(s,"g"),i=e.replace(/\u00A0|\u2009|\u202F/g," ").replace(/\u2212/g,"-"),c=[];for(const l of i.split(`
`)){const p=l.trim();if(!p)continue;const f=p.match(o);if(f){let m;if(f[4])m=`${f[4]}-${f[5]}-${f[6]}`;else{let[,d,b,u]=f;u.length===2&&(u="20"+u),m=`${u}-${b.padStart(2,"0")}-${d.padStart(2,"0")}`}c.push({date:m,lines:[p]})}else c.length>0&&c[c.length-1].lines.push(p)}if(!c.length)return a;let r=null;for(const l of c){const p=l.lines.join(" "),f=[...p.matchAll(n())].map(v=>{const g=v[0].replace(/\s/g,""),h=/^[-]/.test(g),_=Pt(g.replace(/^[-]/,""));return{isNeg:h,abs:_,signed:h?-_:_}}).filter(v=>v.abs>0);if(!f.length)continue;const m=p.match(o);let b=(m?p.slice(m.index+m[0].length):p).replace(new RegExp(s,"g")," ").replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ\-\/]/g," ").replace(/\s+/g," ").trim();(!b||b.length<2)&&(b="Movimiento");let u=0,y=0;if(t==="signos"){const v=f[0];v.isNeg?u=v.abs:y=v.abs}else if(t==="dos")f.length>=2&&(u=f[f.length-2].abs),y=f[f.length-1].abs;else if(f.length>=2){const v=f[f.length-1].abs,g=f[f.length-2].abs;if(!g)continue;r!==null?v-r>=-g*.01?y=g:u=g:y=g,r=v}else f.length===1&&(y=f[0].abs);!u&&!y||a.push({date:l.date,description:b,debit:u,credit:y,ref:""})}return a}function Yo(e,t,a){var n,i;Ke=e.map((c,r)=>({...c,_id:r,_skip:!1})),It=a;const o=t.find(c=>c.id===a),s=o?`${o.bank} — ${o.number}`:a;$("#modal-body").querySelector("#import-wizard").innerHTML=`
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;gap:12px;flex-wrap:wrap">
      <div>
        <p style="font-weight:700;font-size:14px;color:#374151;margin:0 0 2px">Vista previa de importación</p>
        <p style="font-size:12px;color:#6B7280;margin:0">
          Cuenta: <strong>${esc(s)}</strong> &nbsp;·&nbsp;
          Elimina filas incorrectas antes de confirmar.
        </p>
      </div>
      <span id="imp-count-badge" class="badge badge-blue" style="white-space:nowrap">
        ${e.length} movimientos
      </span>
    </div>
    <div style="max-height:340px;overflow-y:auto;border:1px solid #F0F0F0;border-radius:12px">
      <table class="data-table" style="font-size:12px" id="imp-preview-table">
        <thead>
          <tr><th>Fecha</th><th>Descripción</th><th style="text-align:right">Débito</th>
              <th style="text-align:right">Crédito</th><th>Ref.</th><th></th></tr>
        </thead>
        <tbody>
          ${Ke.map(c=>`
            <tr id="imp-row-${c._id}">
              <td>${esc(c.date)}</td>
              <td>${esc(c.description)}</td>
              <td style="text-align:right">${c.debit?fmt(c.debit):'<span style="color:#D1D5DB">—</span>'}</td>
              <td style="text-align:right">${c.credit?fmt(c.credit):'<span style="color:#D1D5DB">—</span>'}</td>
              <td>${esc(c.ref||"—")}</td>
              <td>
                <button class="btn btn-outline btn-sm"
                  style="color:#EF4444;border-color:#FECACA;padding:2px 8px"
                  onclick="_removeImportRow(${c._id})" title="Eliminar fila">
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`,$("#modal-footer").innerHTML=`
    <button class="btn btn-outline" id="btn-imp-back">
      <i class="fas fa-arrow-left mr-1"></i> Volver
    </button>
    <button class="btn btn-primary" id="btn-imp-confirm">
      <i class="fas fa-file-import mr-1"></i>
      Importar <span id="imp-confirm-count">${e.length}</span> movimientos
    </button>`,(n=$("#btn-imp-back"))==null||n.addEventListener("click",()=>{Ke=[],It="",Wo(t)}),(i=$("#btn-imp-confirm"))==null||i.addEventListener("click",()=>On())}function Ir(e){var n;const t=Ke.find(i=>i._id===e);t&&(t._skip=!0),(n=document.getElementById(`imp-row-${e}`))==null||n.remove();const a=Ke.filter(i=>!i._skip).length,o=$("#imp-count-badge"),s=$("#imp-confirm-count");if(o&&(o.textContent=`${a} movimientos`),s&&(s.textContent=a),!a){const i=$("#btn-imp-confirm");i&&(i.disabled=!0,i.style.opacity="0.5")}}async function On(){if(!It)return showToast("Cuenta bancaria no definida","error");const e=Ke.filter(s=>!s._skip);if(!e.length)return showToast("No hay movimientos para importar","warning");const t=$("#btn-imp-confirm");t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i> Importando...');let a=0,o=0;for(const s of e)try{await pb.create("bank_movements",{bank_account_id:It,date:s.date,description:s.description,debit:s.debit||0,credit:s.credit||0,balance:0,ref:s.ref||"",reconciled:!1}),a++}catch{o++}closeModal(),Ke=[],It="",o?showToast(`Importados ${a} movimientos. ${o} no pudieron guardarse.`,"warning"):showToast(`${a} movimientos importados correctamente`,"success"),Xe($("#page-content"))}window.renderConciliacion=Xe;window._normText=so;window._renderColMapper=Pn;window._parseExcelDate=Fn;window._parsePdfText=Rn;window.openBankAccountForm=wn;window._autoMapColumns=Ln;window.openImportModal=Nn;window._handleExcelFile=no;window._parseColNum=Pt;window.buildReconSuggestions=In;window._importRows=Ke;window._renderImportStep1=Wo;window._removeImportRow=Ir;window._COL_KEYS=st;window._renderImportPreview=Yo;window._parseSignedColNum=Dn;window._daysDiff=Cn;window.openClearMovementsModal=Sn;window._doImport=On;window._importBankAccId=It;window._asDateOnly=oo;window.openBankMovementForm=En;window.toggleRecon=Tr;window._textOverlap=Tn;const Je="payroll_accounting_config_v1",Te={core:`${Je}_core`,mappings:`${Je}_mappings`,employee_groups:`${Je}_employee_groups`,group_rules:`${Je}_group_rules`,employee_rules:`${Je}_employee_rules`},Aa=5e3,Ma=[{key:"salary_base",label:"Salario base",default_side:"debit"},{key:"overtime",label:"Horas extra / recargos",default_side:"debit"},{key:"transport_allowance",label:"Auxilio de transporte",default_side:"debit"},{key:"incapacidades",label:"Incapacidades",default_side:"debit"},{key:"licencias",label:"Licencias",default_side:"debit"},{key:"gastos_representacion",label:"Gastos de representacion",default_side:"debit"},{key:"bonificacion",label:"Bonificacion",default_side:"debit"},{key:"aux_no_salariales",label:"Aux no salariales",default_side:"debit"},{key:"comisiones",label:"Comisiones",default_side:"debit"},{key:"dotaciones",label:"Dotaciones",default_side:"debit"},{key:"compensatorios",label:"Compensatorios",default_side:"debit"},{key:"alimentacion",label:"Alimentacion",default_side:"debit"},{key:"deduction_health",label:"Deduccion salud trabajador",default_side:"credit"},{key:"deduction_pension",label:"Deduccion pension trabajador",default_side:"credit"},{key:"solidarity_fund",label:"Fondo de solidaridad",default_side:"credit"},{key:"withholding_tax",label:"Retencion en la fuente",default_side:"credit"},{key:"deduction_other",label:"Otras deducciones trabajador",default_side:"credit"},{key:"embargo",label:"Embargo",default_side:"credit"},{key:"cxc",label:"CxC",default_side:"credit"},{key:"libranza",label:"Libranza",default_side:"credit"},{key:"prestamos",label:"Prestamos",default_side:"credit"},{key:"net_pay",label:"Neto a pagar",default_side:"credit"},{key:"employer_health",label:"Aporte salud empleador",default_side:"debit"},{key:"employer_pension",label:"Aporte pension empleador",default_side:"debit"},{key:"employer_arl",label:"ARL",default_side:"debit"},{key:"sena",label:"SENA",default_side:"debit"},{key:"icbf",label:"ICBF",default_side:"debit"},{key:"caja_comp",label:"Caja de compensacion",default_side:"debit"},{key:"cesantias",label:"Cesantias causadas",default_side:"debit"},{key:"intereses_ces",label:"Intereses cesantias",default_side:"debit"},{key:"prima",label:"Prima de servicios",default_side:"debit"},{key:"vacaciones",label:"Vacaciones causadas",default_side:"debit"}],Re=Ma.reduce((e,t)=>(e[t.key]=t,e),{}),Pe=["incapacidades","licencias","gastos_representacion","bonificacion","aux_no_salariales","comisiones","dotaciones","compensatorios","alimentacion"],Fe=["embargo","cxc","libranza","prestamos"],$a={devengo:"Devengos",descuento:"Descuentos",aportes:"Aportes",provision:"Provisiones"},kn={salary_base:{category:"devengo",allowed_sides:["debit"]},overtime:{category:"devengo",allowed_sides:["debit"]},transport_allowance:{category:"devengo",allowed_sides:["debit"]},incapacidades:{category:"devengo",allowed_sides:["debit"]},licencias:{category:"devengo",allowed_sides:["debit"]},gastos_representacion:{category:"devengo",allowed_sides:["debit"]},bonificacion:{category:"devengo",allowed_sides:["debit"]},aux_no_salariales:{category:"devengo",allowed_sides:["debit"]},comisiones:{category:"devengo",allowed_sides:["debit"]},dotaciones:{category:"devengo",allowed_sides:["debit"]},compensatorios:{category:"devengo",allowed_sides:["debit"]},alimentacion:{category:"devengo",allowed_sides:["debit"]},net_pay:{category:"devengo",allowed_sides:["credit"]},deduction_health:{category:"descuento",allowed_sides:["credit"]},deduction_pension:{category:"descuento",allowed_sides:["credit"]},solidarity_fund:{category:"descuento",allowed_sides:["credit"]},withholding_tax:{category:"descuento",allowed_sides:["credit"]},deduction_other:{category:"descuento",allowed_sides:["credit"]},embargo:{category:"descuento",allowed_sides:["credit"]},cxc:{category:"descuento",allowed_sides:["credit"]},libranza:{category:"descuento",allowed_sides:["credit"]},prestamos:{category:"descuento",allowed_sides:["credit"]},employer_health:{category:"aportes",allowed_sides:["debit","credit"]},employer_pension:{category:"aportes",allowed_sides:["debit","credit"]},employer_arl:{category:"aportes",allowed_sides:["debit","credit"]},sena:{category:"aportes",allowed_sides:["debit","credit"]},icbf:{category:"aportes",allowed_sides:["debit","credit"]},caja_comp:{category:"aportes",allowed_sides:["debit","credit"]},cesantias:{category:"provision",allowed_sides:["debit","credit"]},intereses_ces:{category:"provision",allowed_sides:["debit","credit"]},prima:{category:"provision",allowed_sides:["debit","credit"]},vacaciones:{category:"provision",allowed_sides:["debit","credit"]}};function Gt(e){var t;return kn[e]||{category:"devengo",allowed_sides:[(((t=Re[e])==null?void 0:t.default_side)||"debit")==="credit"?"credit":"debit"]}}function Mn(e){return $a[e]||e||"Sin categoría"}function Bn(e){return Ma.filter(t=>Gt(t.key).category===e)}const qt=[{key:"hed",label:"Extra Diurna (HED)",factor:1.25},{key:"hen",label:"Extra Nocturna (HEN)",factor:1.75},{key:"rno",label:"Recargo Nocturno Ordinario",factor:.35},{key:"heddf",label:"Hora Extra Diurna Dominical/Festiva (HEDDF)",factor:2},{key:"hendf",label:"Hora Extra Nocturna Dominical/Festiva (HENDF)",factor:2.5},{key:"rdfd",label:"Recargo Dominical/Festivo Diurno",factor:.75}],De={1:.00522,2:.01044,3:.02436,4:.0435,5:.0696},se=e=>Math.round((Number(e)||0)*100)/100;function wa(e){return`${(e==null?void 0:e.doc_number)||""} - ${(e==null?void 0:e.name)||""}`.trim()}function Ea(e,t){return t&&(Array.isArray(e)?e:[]).find(a=>a.id===t)||null}function it({terceros:e,hiddenId:t,inputId:a,resultsId:o,onSelected:s}){const n=document.getElementById(t),i=document.getElementById(a),c=document.getElementById(o);if(!n||!i||!c)return;const r=(p="")=>{const f=Array.isArray(e)?e:[],m=String(p||"").toLowerCase().trim(),d=m?m.split(/\s+/).filter(Boolean):[],b=(d.length?f.filter(u=>{const y=`${u.doc_number||""} ${u.name||""}`.toLowerCase();return d.every(v=>y.includes(v))}):f).slice(0,30);c.innerHTML=`
      <button type="button" data-third-id="" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer;border-bottom:1px solid #F1F5F9">Sin tercero</button>
      ${b.map(u=>`
        <button type="button" data-third-id="${esc(u.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
          <div style="font-weight:600">${esc(u.doc_number||"SIN DOC")}</div>
          <div style="font-size:12px;color:#6B7280">${esc(u.name||"")}</div>
        </button>
      `).join("")}
    `};(()=>{const p=Ea(e,n.value);i.value=p?wa(p):""})(),i.onfocus=()=>{r(i.value),c.style.display="block"},i.oninput=()=>{n.value="",typeof s=="function"&&s(""),r(i.value),c.style.display="block"},i.onblur=()=>setTimeout(()=>{c.style.display="none"},120),c.onmousedown=p=>p.preventDefault(),c.onclick=p=>{const f=p.target.closest("[data-third-id]");if(!f)return;const m=f.getAttribute("data-third-id")||"";n.value=m;const d=Ea(e,m);i.value=d?wa(d):"",c.style.display="none",typeof s=="function"&&s(m)}}function ea(){return{balancing_account_id:"",mappings:[],employee_groups:[],group_rules:[],company_rules:{smmlv:1423500,solidarity_threshold_smmlv:3,solidarity_rate:.01,exempt_sena_icbf:!1,weekly_hours:44,tercero_sena_id:"",tercero_icbf_id:""},employee_rules:[]}}function Ft(e){const t=e&&typeof e=="object"?e:{},a=Array.isArray(t.mappings)?t.mappings:[],o=Array.isArray(t.employee_groups)?t.employee_groups:[],s=Array.isArray(t.group_rules)?t.group_rules:[],n=t.company_rules&&typeof t.company_rules=="object"?t.company_rules:{},i=Array.isArray(t.employee_rules)?t.employee_rules:[];return{balancing_account_id:t.balancing_account_id||"",mappings:a.map((c,r)=>({id:c.id||`m-${Date.now()}-${r}`,concept:c.concept||"",side:c.side==="credit"?"credit":"debit",account_id:c.account_id||"",employee_id:c.employee_id||"",group_id:c.group_id||"",active:c.active!==!1})).filter(c=>c.concept&&c.account_id),employee_groups:o.map((c,r)=>({id:c.id||`g-${Date.now()}-${r}`,name:(c.name||"").trim(),active:c.active!==!1})).filter(c=>c.name),group_rules:s.map(c=>({group_id:c.group_id||"",basic_salary:Number(c.basic_salary)>=0?Number(c.basic_salary):0,arl_risk_level:Math.max(1,Math.min(5,parseInt(c.arl_risk_level||1,10)||1)),is_pensioner:!!c.is_pensioner,apply_solidarity_fund:!!c.apply_solidarity_fund,apply_withholding_tax:!!c.apply_withholding_tax,withholding_rate:Number(c.withholding_rate)>=0?Number(c.withholding_rate):0})).filter(c=>c.group_id),company_rules:{smmlv:Number(n.smmlv)>0?Number(n.smmlv):1423500,solidarity_threshold_smmlv:Number(n.solidarity_threshold_smmlv)>0?Number(n.solidarity_threshold_smmlv):3,solidarity_rate:Number(n.solidarity_rate)>=0?Number(n.solidarity_rate):.01,exempt_sena_icbf:!!n.exempt_sena_icbf,weekly_hours:[42,44,46,47,48].includes(Number(n.weekly_hours))?Number(n.weekly_hours):44,tercero_sena_id:n.tercero_sena_id||"",tercero_icbf_id:n.tercero_icbf_id||""},employee_rules:i.map(c=>({employee_id:c.employee_id||"",group_id:c.group_id||"",basic_salary:c.basic_salary===null||c.basic_salary===void 0||c.basic_salary===""?null:Number(c.basic_salary)>=0?Number(c.basic_salary):null,arl_risk_level:c.arl_risk_level===null||c.arl_risk_level===void 0||c.arl_risk_level===""?null:Math.max(1,Math.min(5,parseInt(c.arl_risk_level,10)||1)),is_pensioner:typeof c.is_pensioner=="boolean"?c.is_pensioner:null,apply_solidarity_fund:typeof c.apply_solidarity_fund=="boolean"?c.apply_solidarity_fund:null,apply_withholding_tax:typeof c.apply_withholding_tax=="boolean"?c.apply_withholding_tax:null,withholding_rate:c.withholding_rate===null||c.withholding_rate===void 0||c.withholding_rate===""?null:Number(c.withholding_rate)>=0?Number(c.withholding_rate):null,tercero_salud_id:c.tercero_salud_id||"",tercero_pension_id:c.tercero_pension_id||"",tercero_arl_id:c.tercero_arl_id||"",tercero_caja_id:c.tercero_caja_id||""})).filter(c=>c.employee_id)}}function Un(e){const t=Ft(e);return{balancing_account_id:t.balancing_account_id||"",mappings:(t.mappings||[]).map(a=>({id:a.id||"",concept:a.concept||"",side:a.side==="credit"?"credit":"debit",account_id:a.account_id||"",employee_id:a.employee_id||"",group_id:a.group_id||"",active:a.active!==!1})),employee_groups:(t.employee_groups||[]).map(a=>({id:a.id||"",name:(a.name||"").trim(),active:a.active!==!1})),group_rules:t.group_rules||[],company_rules:t.company_rules||{},employee_rules:(t.employee_rules||[]).map(a=>{const o={employee_id:a.employee_id||""};return a.group_id&&(o.group_id=a.group_id),a.basic_salary!==null&&a.basic_salary!==void 0&&(o.basic_salary=Number(a.basic_salary||0)),a.arl_risk_level!==null&&a.arl_risk_level!==void 0&&(o.arl_risk_level=Number(a.arl_risk_level||1)),typeof a.is_pensioner=="boolean"&&(o.is_pensioner=a.is_pensioner),typeof a.apply_solidarity_fund=="boolean"&&(o.apply_solidarity_fund=a.apply_solidarity_fund),typeof a.apply_withholding_tax=="boolean"&&(o.apply_withholding_tax=a.apply_withholding_tax),a.withholding_rate!==null&&a.withholding_rate!==void 0&&(o.withholding_rate=Number(a.withholding_rate||0)),a.tercero_salud_id&&(o.tercero_salud_id=a.tercero_salud_id),a.tercero_pension_id&&(o.tercero_pension_id=a.tercero_pension_id),a.tercero_arl_id&&(o.tercero_arl_id=a.tercero_arl_id),a.tercero_caja_id&&(o.tercero_caja_id=a.tercero_caja_id),o})}}async function ca(){var i;const e=await pb.list("settings",{perPage:200,page:1,filter:`key~"${pb.escapeFilterValue(Je+"_")}"`}),t={};if(((e==null?void 0:e.items)||[]).forEach(c=>{t[c.key]=c}),Object.keys(Te).some(c=>!!t[Te[c]])){const c=await xt(Te.core,{}),r={balancing_account_id:(c==null?void 0:c.balancing_account_id)||"",company_rules:c!=null&&c.company_rules&&typeof c.company_rules=="object"?c.company_rules:{},mappings:await xt(Te.mappings,[]),employee_groups:await xt(Te.employee_groups,[]),group_rules:await xt(Te.group_rules,[]),employee_rules:await xt(Te.employee_rules,[])};return{row:t[Te.core]||null,config:Ft(r)}}const o=pb.escapeFilterValue(Je),s=await pb.list("settings",{perPage:1,page:1,filter:`key="${o}"`}),n=((i=s==null?void 0:s.items)==null?void 0:i[0])||null;if(!n)return{row:null,config:ea()};try{return{row:n,config:Ft(JSON.parse(n.value||"{}"))}}catch{return{row:n,config:ea()}}}function Vn(e,t=Aa){const a=String(e||"");if(!a)return[""];const o=[];for(let s=0;s<a.length;s+=t)o.push(a.slice(s,s+t));return o}function io(e,t){return`${e}_part_${String(t+1).padStart(3,"0")}`}async function Jo(e){const t=pb.escapeFilterValue(e),a=await pb.list("settings",{perPage:200,page:1,filter:`key~"${t}"`});return(Array.isArray(a==null?void 0:a.items)?a.items:[]).filter(s=>String(s.key||"").startsWith(e))}async function co(e){var s;const t=pb.escapeFilterValue(e),a=await pb.list("settings",{perPage:1,page:1,filter:`key="${t}"`}),o=((s=a==null?void 0:a.items)==null?void 0:s[0])||null;o!=null&&o.id&&await pb.delete("settings",o.id)}async function xt(e,t){var c;const a=`${e}_part_`,o=await Jo(a);if(o.length){const l=o.slice().sort((p,f)=>String(p.key||"").localeCompare(String(f.key||""))).map(p=>String(p.value||"")).join("");try{return JSON.parse(l||"null")??t}catch{return t}}const s=pb.escapeFilterValue(e),n=await pb.list("settings",{perPage:1,page:1,filter:`key="${s}"`}),i=((c=n==null?void 0:n.items)==null?void 0:c[0])||null;if(!(i!=null&&i.value))return t;try{return JSON.parse(i.value)}catch{return t}}async function ro(e,t){var n;const a=pb.escapeFilterValue(e),o=await pb.list("settings",{perPage:1,page:1,filter:`key="${a}"`}),s=((n=o==null?void 0:o.items)==null?void 0:n[0])||null;if(s!=null&&s.id)try{return await pb.update("settings",s.id,{value:t})}catch(i){if((i==null?void 0:i.status)!==400)throw i;return await pb.delete("settings",s.id).catch(()=>{}),pb.create("settings",{key:e,value:t})}return pb.create("settings",{key:e,value:t})}async function jn(e,t){const a=JSON.stringify(t),o=`${e}_part_`,s=await Jo(o);if(a.length<=Aa){await ro(e,a);for(const i of s)await pb.delete("settings",i.id).catch(()=>{});return}const n=Vn(a,Aa);for(let i=0;i<n.length;i++)await ro(io(e,i),n[i]);for(let i=n.length;i<s.length;i++){const c=io(e,i);await co(c).catch(()=>{})}await co(e).catch(()=>{})}async function Ko(e,t=""){const a=Un(e),o={balancing_account_id:a.balancing_account_id||"",company_rules:a.company_rules||{}},s=[[Te.core,o],[Te.mappings,a.mappings||[]],[Te.employee_groups,a.employee_groups||[]],[Te.group_rules,a.group_rules||[]],[Te.employee_rules,a.employee_rules||[]]];for(const[n,i]of s)try{await jn(n,i)}catch(c){const r=c!=null&&c.message?`: ${c.message}`:"";throw new Error(`Error guardando configuración de nómina en ${n}${r}`)}}function Ot(e){if(!(e!=null&&e.notes))return{};try{const t=JSON.parse(e.notes);if(t&&typeof t=="object"&&t.payroll_meta&&typeof t.payroll_meta=="object")return t.payroll_meta}catch{}return{}}function qe(e,t){const o=(Array.isArray(e==null?void 0:e.employee_rules)?e.employee_rules:[]).find(n=>n.employee_id===t),s={employee_id:t||"",group_id:(o==null?void 0:o.group_id)||"",basic_salary:0,arl_risk_level:1,is_pensioner:!1,apply_solidarity_fund:!1,apply_withholding_tax:!1,withholding_rate:0,tercero_salud_id:"",tercero_pension_id:"",tercero_arl_id:"",tercero_caja_id:""};return o&&(o.group_id&&(s.group_id=o.group_id),o.basic_salary!==null&&o.basic_salary!==void 0&&(s.basic_salary=Number(o.basic_salary||0)),o.arl_risk_level!==null&&o.arl_risk_level!==void 0&&(s.arl_risk_level=Math.max(1,Math.min(5,parseInt(o.arl_risk_level||1,10)||1))),typeof o.is_pensioner=="boolean"&&(s.is_pensioner=o.is_pensioner),typeof o.apply_solidarity_fund=="boolean"&&(s.apply_solidarity_fund=o.apply_solidarity_fund),typeof o.apply_withholding_tax=="boolean"&&(s.apply_withholding_tax=o.apply_withholding_tax),o.withholding_rate!==null&&o.withholding_rate!==void 0&&(s.withholding_rate=Number(o.withholding_rate||0)),o.tercero_salud_id&&(s.tercero_salud_id=o.tercero_salud_id),o.tercero_pension_id&&(s.tercero_pension_id=o.tercero_pension_id),o.tercero_arl_id&&(s.tercero_arl_id=o.tercero_arl_id),o.tercero_caja_id&&(s.tercero_caja_id=o.tercero_caja_id)),s}function lo(e,t){return(Array.isArray(e==null?void 0:e.employee_rules)?e.employee_rules:[]).find(o=>o.employee_id===t)||null}function ta(e){return!!e&&Number(e.basic_salary||0)>0}function Dt(e){const t=Ot(e),a=se(t.solidarity_fund||0),o=se(t.withholding_tax||0);return{solidarity:a,withholding:o,total:se(a+o)}}function Qo(e){const t=Ot(e),a=t&&typeof t.concept_amounts=="object"&&t.concept_amounts?t.concept_amounts:{},o={};return[...Pe,...Fe].forEach(s=>{o[s]=se(Number(a[s]||0))}),o}function Ba(e){const t=Ot(e),a=t&&typeof t.overtime_breakdown=="object"&&t.overtime_breakdown?t.overtime_breakdown:{},o=qt.map(i=>{const c=a[i.key]&&typeof a[i.key]=="object"?a[i.key]:{};return{key:i.key,label:i.label,factor:i.factor,hours:se(Number(c.hours||0)),amount:se(Number(c.amount||0))}}),s=se(o.reduce((i,c)=>i+(c.amount||0),0)),n=o.some(i=>i.hours>0||i.amount>0);return{hourly_rate:se(Number(a.hourly_rate||0)),breakdown:o,total_amount:n?s:se(Number((e==null?void 0:e.overtime)||0)),hasBreakdown:n}}function ra(e){const t=Qo(e),a=se(Pe.reduce((s,n)=>s+(t[n]||0),0)),o=se(Fe.reduce((s,n)=>s+(t[n]||0),0));return{conceptAmounts:t,earnings:a,deductions:o}}function Zo(e,t){return!e||!t?0:t==="solidarity_fund"?Dt(e).solidarity:t==="withholding_tax"?Dt(e).withholding:t==="overtime"?Ba(e).total_amount:Pe.includes(t)||Fe.includes(t)?Qo(e)[t]||0:se(e[t]||0)}function pt(e){const t=ra(e);return se(((e==null?void 0:e.salary_base)||0)+((e==null?void 0:e.transport_allowance)||0)+Zo(e,"overtime")+t.earnings)}function Rt(e){const t=Dt(e),a=ra(e);return se(((e==null?void 0:e.deduction_health)||0)+((e==null?void 0:e.deduction_pension)||0)+((e==null?void 0:e.deduction_other)||0)+t.total+a.deductions)}function Sr(e,t,a,o=""){const s=(e||[]).filter(c=>c.active!==!1),n=s.find(c=>c.concept===t&&c.employee_id===a);if(n)return n;const i=o?s.find(c=>c.concept===t&&c.group_id===o&&!c.employee_id):null;return i||s.find(c=>c.concept===t&&!c.employee_id&&!c.group_id)||null}function Hn(e,t,a,o=""){const s=(e||[]).filter(i=>i.active!==!1&&i.concept===t),n=[];for(const i of["debit","credit"]){const c=s.filter(f=>f.side===i);if(!c.length)continue;const r=c.find(f=>f.employee_id===a);if(r){n.push(r);continue}const l=o?c.find(f=>f.group_id===o&&!f.employee_id):null;if(l){n.push(l);continue}const p=c.find(f=>!f.employee_id&&!f.group_id);p&&n.push(p)}return n}function Gn(e,t,a,o){const s=t.employee_id||"";switch(e){case"net_pay":case"cesantias":case"intereses_ces":case"prima":case"vacaciones":return s;case"deduction_health":case"employer_health":return a.tercero_salud_id||"";case"deduction_pension":case"employer_pension":return a.tercero_pension_id||"";case"employer_arl":return a.tercero_arl_id||"";case"caja_comp":return a.tercero_caja_id||"";case"sena":return o.tercero_sena_id||"";case"icbf":return o.tercero_icbf_id||"";default:return s}}function qn(e,t,a){var s,n;const o=((n=(s=a.expand)==null?void 0:s.employee_id)==null?void 0:n.doc_number)||a.employee_id||"";return e==="net_pay"?`NOM-${t}-EMP-${o}`:""}async function zn(e,t,a){var f,m;const o=[],s={},n=a.company_rules||{},i=(e.date_from||e.date_to||"").slice(0,7).replace("-","");for(const d of t){const b=qe(a,d.employee_id);for(const u of Ma){const y=Zo(d,u.key);if(y<=0)continue;const v=Hn(a.mappings,u.key,d.employee_id,b.group_id||"");if(!v.length){o.push({employee:((m=(f=d.expand)==null?void 0:f.employee_id)==null?void 0:m.name)||"Empleado",concept:u.label});continue}const g=Gn(u.key,d,b,n),h=qn(u.key,i,d);for(const _ of v){const A=_.side==="credit"?"credit":"debit",C=`${_.account_id}__${A}__${g}`;s[C]||(s[C]={account_id:_.account_id,third_party_id:g||void 0,cross_doc_ref:h||void 0,debit:0,credit:0,description:`Nómina ${e.name} - ${u.label}`}),A==="debit"?s[C].debit=se(s[C].debit+y):s[C].credit=se(s[C].credit+y)}}}if(o.length){const d=o.slice(0,3).map(b=>`${b.employee}: ${b.concept}`).join(" | ");throw new Error(`Faltan mapeos contables para algunos conceptos de nómina. ${d}`)}const c=Object.values(s).filter(d=>d.debit>0||d.credit>0),r=se(c.reduce((d,b)=>d+(b.debit||0),0)),l=se(c.reduce((d,b)=>d+(b.credit||0),0)),p=se(r-l);if(Math.abs(p)>.01){if(!a.balancing_account_id)throw new Error(`La nómina no está cuadrada (D ${fmt(r)} / C ${fmt(l)}). Configura una cuenta de ajuste en el engranaje de Nómina.`);c.push({account_id:a.balancing_account_id,debit:p<0?Math.abs(p):0,credit:p>0?Math.abs(p):0,description:`Ajuste de cuadre nómina ${e.name}`})}return c}async function Wn(e){var d;const t=await pb.get("payroll_periods",e);if(t.tx_id)return t.tx_id;const a=await pb.listAll("payroll_lines",{filter:`period_id="${pb.escapeFilterValue(e)}"`,expand:"employee_id"});if(!a.length)throw new Error("El período no tiene liquidaciones para contabilizar.");const o=await API.getTxTypes(),s=o.find(b=>b.code==="NM")||o.find(b=>(b.name||"").toLowerCase().includes("nomina"));if(!s)throw new Error("No existe tipo de transacción activo para Nómina (código NM).");const{config:n}=await ca();if(!n.mappings.length)throw new Error("Primero configura los mapeos contables de nómina (botón de engranaje).");const i=await zn(t,a,n);if(!i.length)throw new Error("No hay líneas contables para generar en este período.");const c=[...new Set(i.map(b=>b.account_id).filter(Boolean))],r=await pb.listAll("accounts",{filter:c.map(b=>`id="${pb.escapeFilterValue(b)}"`).join("||")}).catch(()=>[]),l={};r.forEach(b=>{l[b.id]=b});const p=[];if(i.forEach(b=>{const u=l[b.account_id];u&&(u.requires_third_party&&!b.third_party_id&&p.push(`Cuenta ${u.code} - ${u.name}: requiere tercero pero no está asignado.`),u.maneja_cruce&&!b.cross_doc_ref&&p.push(`Cuenta ${u.code} - ${u.name}: requiere cruce pero no tiene referencia.`))}),p.length)throw new Error(`Errores de validación contable:
${p.slice(0,5).join(`
`)}`);const f=((d=a.find(b=>!!b.employee_id))==null?void 0:d.employee_id)||"";return(await API.createTransaction({tx_type_id:s.id,date:t.date_to||todayStr(),description:`Nómina ${t.name}`,third_party_id:f||void 0},i)).id}async function Yn(e=[]){var t,a,o,s,n,i,c,r;try{const[{row:l,config:p},f,m]=await Promise.all([ca(),pb.listAll("accounts",{filter:"active=true",sort:"code"}),pb.listAll("third_parties",{filter:"active=true",sort:"name"})]);if(!f.length)return showToast("No hay cuentas activas para mapear.","warning");const d={rowId:(l==null?void 0:l.id)||"",config:Ft(p)},b=`<option value="">Selecciona cuenta...</option>${f.map(N=>`<option value="${esc(N.id)}">${esc(N.code)} - ${esc(N.name)}</option>`).join("")}`,u=`<option value="">Selecciona categoría...</option>${Object.keys($a).map(N=>`<option value="${esc(N)}">${esc($a[N])}</option>`).join("")}`,y=()=>`<option value="">Selecciona grupo...</option>${(d.config.employee_groups||[]).map(N=>`<option value="${esc(N.id)}">${esc(N.name)}</option>`).join("")}`;openModal("Configuración Contable de Nómina",`
      <div class="space-y-4">
        <div class="rounded-xl p-3 text-sm" style="background:#F8FAFC;border:1px solid #E2E8F0;color:#334155">
          Configura mapeos contables por grupo para reutilizar reglas contables en grandes volúmenes de empleados.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group">
            <label class="form-label">Jornada laboral semanal (Ley 2101/2021)</label>
            <select id="nom-weekly-hours" class="form-input">
              <option value="48" ${(d.config.company_rules.weekly_hours||44)===48?"selected":""}>48 h/sem (antes Jul 2023)</option>
              <option value="47" ${(d.config.company_rules.weekly_hours||44)===47?"selected":""}>47 h/sem (Jul 2023 – Jun 2024)</option>
              <option value="46" ${(d.config.company_rules.weekly_hours||44)===46?"selected":""}>46 h/sem (Jul 2024 – Jun 2025)</option>
              <option value="44" ${(d.config.company_rules.weekly_hours||44)===44?"selected":""}>44 h/sem (Jul 2025 – Jun 2026)</option>
              <option value="42" ${(d.config.company_rules.weekly_hours||44)===42?"selected":""}>42 h/sem (desde Jul 2026)</option>
            </select>
            <p class="text-xs mt-1" style="color:#6B7280">Define el valor hora base para liquidar horas extra y recargos.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Cuenta de Ajuste (opcional)</label>
            <select id="nom-balancing-account" class="form-input">${b}</select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group">
            <label class="form-label">Tercero SENA</label>
            <div class="relative">
              <input id="nom-tercero-sena-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre">
              <input id="nom-tercero-sena" type="hidden" value="${esc(d.config.company_rules.tercero_sena_id||"")}">
              <div id="nom-tercero-sena-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tercero ICBF</label>
            <div class="relative">
              <input id="nom-tercero-icbf-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre">
              <input id="nom-tercero-icbf" type="hidden" value="${esc(d.config.company_rules.tercero_icbf_id||"")}">
              <div id="nom-tercero-icbf-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="form-group">
            <label class="form-label">SMMLV vigente</label>
            <input id="nom-smmlv" class="form-input" type="number" min="1" step="1" value="${esc(String(d.config.company_rules.smmlv||1423500))}">
          </div>
          <div class="form-group">
            <label class="form-label">Umbral fondo solidaridad (SMMLV)</label>
            <input id="nom-sol-threshold" class="form-input" type="number" min="0" step="0.01" value="${esc(String(d.config.company_rules.solidarity_threshold_smmlv||3))}">
          </div>
          <div class="form-group">
            <label class="form-label">Tarifa fondo solidaridad (%)</label>
            <input id="nom-sol-rate" class="form-input" type="number" min="0" step="0.01" value="${esc(String((d.config.company_rules.solidarity_rate||.01)*100))}">
          </div>
          <div class="form-group flex items-end pb-1">
            <label class="inline-flex items-center gap-2 text-sm" style="color:#334155">
              <input id="nom-exempt-sena-icbf" type="checkbox" ${d.config.company_rules.exempt_sena_icbf?"checked":""}>
              Empresa exenta de parafiscales SENA e ICBF
            </label>
          </div>
        </div>

        <div class="rounded-xl p-3" style="border:1px solid #E5E7EB;background:#FFFFFF">
          <p class="font-semibold mb-2" style="color:#0D2137">Grupos de Empleados</p>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <input id="nom-group-name" class="form-input md:col-span-3" placeholder="Ej: Administrativos, Comerciales, Producción">
            <button class="btn btn-primary" id="btn-add-group"><i class="fas fa-plus"></i> Crear Grupo</button>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table text-sm">
              <thead><tr><th>Grupo</th><th></th></tr></thead>
              <tbody id="nom-groups-body"></tbody>
            </table>
          </div>
        </div>

        <div class="rounded-xl p-3" style="border:1px solid #E5E7EB;background:#FFFFFF">
          <p class="font-semibold mb-2" style="color:#0D2137">Nuevo mapeo contable</p>
          <div class="grid grid-cols-1 md:grid-cols-6 gap-2">
            <select id="nom-map-group" class="form-input">${y()}</select>
            <select id="nom-map-category" class="form-input">${u}</select>
            <select id="nom-map-concept" class="form-input"><option value="">Selecciona concepto...</option></select>
            <select id="nom-map-account-debit" class="form-input">${b}</select>
            <select id="nom-map-account-credit" class="form-input">${b}</select>
            <button class="btn btn-primary" id="btn-add-map"><i class="fas fa-plus"></i> Agregar</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table text-sm">
            <thead><tr><th>Grupo</th><th>Categoría</th><th>Concepto</th><th>Cuenta Débito</th><th>Cuenta Crédito</th><th></th></tr></thead>
            <tbody id="nom-map-body"></tbody>
          </table>
        </div>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" id="btn-save-nom-config">Guardar Configuración</button>',!0);const v={};f.forEach(N=>{v[N.id]=N});const g=()=>{const N={};return(d.config.employee_groups||[]).forEach(I=>{N[I.id]=I}),N};$("#nom-balancing-account")&&($("#nom-balancing-account").value=d.config.balancing_account_id||""),it({terceros:m,hiddenId:"nom-tercero-sena",inputId:"nom-tercero-sena-search",resultsId:"nom-tercero-sena-results"}),it({terceros:m,hiddenId:"nom-tercero-icbf",inputId:"nom-tercero-icbf-search",resultsId:"nom-tercero-icbf-results"});const h=()=>{const N=$("#nom-map-group"),I=N?N.value:"";if(N){const S=(d.config.employee_groups||[]).map(w=>`<option value="${esc(w.id)}">${esc(w.name)}</option>`).join("");N.innerHTML=`<option value="">Selecciona grupo...</option>${S}`,I&&(d.config.employee_groups||[]).some(w=>w.id===I)&&(N.value=I)}},_=()=>{const N=getSelectVal("nom-map-category"),I=$("#nom-map-concept");if(!I)return;const S=N?Bn(N).map(w=>`<option value="${esc(w.key)}">${esc(w.label)}</option>`).join(""):"";I.innerHTML=`<option value="">Selecciona concepto...</option>${S}`},A=()=>{const N=getSelectVal("nom-map-concept"),I=$("#nom-map-account-debit"),S=$("#nom-map-account-credit");if(!N){I&&(I.disabled=!0,I.value=""),S&&(S.disabled=!0,S.value="");return}const w=Gt(N),E=Array.isArray(w.allowed_sides)?w.allowed_sides:["debit"];if(I){const L=E.includes("debit");I.disabled=!L,L||(I.value="")}if(S){const L=E.includes("credit");S.disabled=!L,L||(S.value="")}},C=()=>{const N=$("#nom-groups-body");if(!N)return;const I=d.config.employee_groups||[];N.innerHTML=I.length?I.map(S=>`<tr><td>${esc(S.name)}</td><td class="text-right"><button class="btn btn-outline btn-sm btn-del-group" data-id="${esc(S.id)}"><i class="fas fa-trash"></i></button></td></tr>`).join(""):'<tr><td colspan="2" class="text-center py-6" style="color:#9CA3AF">Sin grupos definidos.</td></tr>',h()},T=()=>{const N=$("#nom-map-body");if(!N)return;const I=g(),S={};(d.config.mappings||[]).forEach(E=>{if(E.employee_id)return;const L=E.group_id||"",R=`${L}__${E.concept}`;S[R]||(S[R]={group_id:L,concept:E.concept,debit_account_id:"",credit_account_id:""}),E.side==="credit"?S[R].credit_account_id=E.account_id||"":S[R].debit_account_id=E.account_id||""});const w=Object.values(S).filter(E=>{const L=getSelectVal("nom-map-group")||"";return L?(E.group_id||"")===L:!0}).sort((E,L)=>{var B,k,j,Y;const R=((B=I[E.group_id])==null?void 0:B.name)||"",M=((k=I[L.group_id])==null?void 0:k.name)||"";return R!==M?R.localeCompare(M):(((j=Re[E.concept])==null?void 0:j.label)||E.concept).localeCompare(((Y=Re[L.concept])==null?void 0:Y.label)||L.concept)});N.innerHTML=w.length?w.map(E=>{var j,Y;const L=E.group_id?((j=I[E.group_id])==null?void 0:j.name)||"Grupo no encontrado":"Sin grupo",R=((Y=Re[E.concept])==null?void 0:Y.label)||E.concept,M=Mn(Gt(E.concept).category),B=v[E.debit_account_id]?`${v[E.debit_account_id].code} - ${v[E.debit_account_id].name}`:"—",k=v[E.credit_account_id]?`${v[E.credit_account_id].code} - ${v[E.credit_account_id].name}`:"—";return`<tr>
            <td>${esc(L)}</td>
            <td>${esc(M)}</td>
            <td>${esc(R)}</td>
            <td>${esc(B)}</td>
            <td>${esc(k)}</td>
            <td class="text-right"><button class="btn btn-outline btn-sm btn-del-map" data-group="${esc(E.group_id||"")}" data-concept="${esc(E.concept)}"><i class="fas fa-trash"></i></button></td>
          </tr>`}).join(""):'<tr><td colspan="6" class="text-center py-6" style="color:#9CA3AF">Sin mapeos configurados para el grupo seleccionado.</td></tr>'};C(),T(),(t=$("#btn-add-group"))==null||t.addEventListener("click",()=>{const N=(getInputVal("nom-group-name")||"").trim();if(!N)return showToast("Ingresa un nombre para el grupo.","warning");if((d.config.employee_groups||[]).some(S=>(S.name||"").toLowerCase()===N.toLowerCase()))return showToast("Ya existe un grupo con ese nombre.","info");d.config.employee_groups.push({id:`g-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:N,active:!0}),setInputVal("nom-group-name",""),C(),T()}),(a=$("#nom-groups-body"))==null||a.addEventListener("click",N=>{var w,E;const I=(E=(w=N.target)==null?void 0:w.closest)==null?void 0:E.call(w,".btn-del-group");if(!I)return;const S=I.getAttribute("data-id")||"";d.config.employee_groups=(d.config.employee_groups||[]).filter(L=>L.id!==S),d.config.mappings=(d.config.mappings||[]).filter(L=>L.group_id!==S),d.config.employee_rules=(d.config.employee_rules||[]).map(L=>L.group_id===S?{...L,group_id:""}:L),C(),T()}),(o=$("#btn-add-map"))==null||o.addEventListener("click",()=>{const N=getSelectVal("nom-map-group"),I=getSelectVal("nom-map-category"),S=getSelectVal("nom-map-concept"),w=getSelectVal("nom-map-account-debit"),E=getSelectVal("nom-map-account-credit");if(!N)return showToast("Selecciona un grupo para el mapeo contable.","warning");if(!I)return showToast("Selecciona una categoría.","warning");if(!S)return showToast("Selecciona un concepto.","warning");const L=Gt(S),R=Array.isArray(L.allowed_sides)?L.allowed_sides:["debit"];if(L.category!==I)return showToast("El concepto no pertenece a la categoría seleccionada.","warning");if(R.includes("debit")&&!w)return showToast("Este concepto requiere cuenta débito.","warning");if(R.includes("credit")&&!E)return showToast("Este concepto requiere cuenta crédito.","warning");const M=(B,k)=>{const j=(d.config.mappings||[]).find(Y=>Y.concept===S&&(Y.group_id||"")===(N||"")&&!Y.employee_id&&Y.side===B);if(j){j.account_id=k,j.active=!0;return}d.config.mappings.push({id:`m-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,employee_id:"",group_id:N||"",concept:S,side:B,account_id:k,active:!0})};d.config.mappings=(d.config.mappings||[]).filter(B=>B.employee_id||B.concept!==S||(B.group_id||"")!==(N||"")?!0:R.includes(B.side==="credit"?"credit":"debit")),R.includes("debit")&&M("debit",w),R.includes("credit")&&M("credit",E),T(),showToast("Mapeo actualizado","success")}),(s=$("#nom-map-group"))==null||s.addEventListener("change",()=>{T()}),(n=$("#nom-map-category"))==null||n.addEventListener("change",()=>{_(),A()}),(i=$("#nom-map-concept"))==null||i.addEventListener("change",A),h(),_(),A(),(c=$("#nom-map-body"))==null||c.addEventListener("click",N=>{var E,L;const I=(L=(E=N.target)==null?void 0:E.closest)==null?void 0:L.call(E,".btn-del-map");if(!I)return;const S=I.getAttribute("data-concept")||"",w=I.getAttribute("data-group")||"";d.config.mappings=(d.config.mappings||[]).filter(R=>R.employee_id||R.concept!==S?!0:(R.group_id||"")!==w),T()}),(r=$("#btn-save-nom-config"))==null||r.addEventListener("click",async()=>{var N;try{d.config.balancing_account_id=getSelectVal("nom-balancing-account")||"",d.config.company_rules={smmlv:Math.max(1,parseNum(getInputVal("nom-smmlv"))||1423500),solidarity_threshold_smmlv:Math.max(0,parseNum(getInputVal("nom-sol-threshold"))||3),solidarity_rate:Math.max(0,(parseNum(getInputVal("nom-sol-rate"))||1)/100),exempt_sena_icbf:!!((N=$("#nom-exempt-sena-icbf"))!=null&&N.checked),weekly_hours:[42,44,46,47,48].includes(Number(getInputVal("nom-weekly-hours")))?Number(getInputVal("nom-weekly-hours")):44,tercero_sena_id:getSelectVal("nom-tercero-sena")||"",tercero_icbf_id:getSelectVal("nom-tercero-icbf")||""},await Ko(d.config,d.rowId),closeModal(),showToast("Configuración de nómina guardada","success")}catch(I){showToast(I.message||"No se pudo guardar la configuración","error")}})}catch(l){showToast(l.message||"No se pudo abrir la configuración de nómina","error")}}async function Jn(e=[]){var t,a,o,s,n;try{const[{row:i,config:c},r]=await Promise.all([ca(),pb.listAll("third_parties",{filter:"active=true",sort:"name"})]),l={rowId:(i==null?void 0:i.id)||"",config:Ft(c),editingEmployeeId:""},p=`<option value="">Selecciona empleado...</option>${e.map(g=>`<option value="${esc(g.id)}">${esc(g.doc_number||"")} - ${esc(g.name)}</option>`).join("")}`,f=`<option value="">Sin grupo</option>${(l.config.employee_groups||[]).map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join("")}`,m={};(l.config.employee_groups||[]).forEach(g=>{m[g.id]=g.name});const d=g=>`Nivel ${g} (${se((De[g]||De[1])*100)}%)`;openModal("Parámetros por Empleado — Nómina",`
      <div class="space-y-4">
        <div class="rounded-xl p-3 text-sm" style="background:#F8FAFC;border:1px solid #E2E8F0;color:#334155">
          Asigna un grupo/tipo para mapeo contable y define aquí los parámetros operativos individuales por empleado.
        </div>

        <div id="nom-emp-rules-summary"></div>

        <div class="rounded-xl p-3" style="border:1px solid #E5E7EB;background:#FFFFFF">
          <p class="font-semibold mb-2" style="color:#0D2137">Editar parámetro de empleado</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="form-group">
              <label class="form-label">Empleado</label>
              <select id="nom-emp-rule-employee" class="form-input">${p}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Tipo / Grupo</label>
              <select id="nom-emp-rule-group" class="form-input">${f}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Salario básico mensual</label>
              <input id="nom-emp-rule-salary" class="form-input" type="number" min="0" step="1" value="0">
            </div>
            <div class="form-group">
              <label class="form-label">Categoría ARL</label>
              <select id="nom-emp-rule-arl" class="form-input">
                <option value="1">ARL nivel 1 (0.522%)</option>
                <option value="2">ARL nivel 2 (1.044%)</option>
                <option value="3">ARL nivel 3 (2.436%)</option>
                <option value="4">ARL nivel 4 (4.350%)</option>
                <option value="5">ARL nivel 5 (6.960%)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="inline-flex items-center gap-2 text-sm mt-8" style="color:#334155"><input id="nom-emp-rule-pensioner" type="checkbox"> Es pensionado</label>
            </div>
            <div class="form-group">
              <label class="inline-flex items-center gap-2 text-sm" style="color:#334155"><input id="nom-emp-rule-solidarity" type="checkbox"> Aporta solidaridad</label>
              <label class="inline-flex items-center gap-2 text-sm mt-3" style="color:#334155"><input id="nom-emp-rule-withholding" type="checkbox"> Aplica retefuente</label>
              <input id="nom-emp-rule-withholding-rate" class="form-input mt-2" type="number" min="0" step="0.01" placeholder="Tarifa retefuente %">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3" style="border-top:1px solid #E5E7EB">
            <p class="md:col-span-2 text-xs font-semibold" style="color:#6B7280">TERCEROS ENTIDADES (para contabilización automática)</p>
            <div class="form-group">
              <label class="form-label">EPS (Salud)</label>
              <div class="relative">
                <input id="nom-emp-rule-tercero-salud-search" class="form-input" autocomplete="off" placeholder="Buscar tercero...">
                <input id="nom-emp-rule-tercero-salud" type="hidden" value="">
                <div id="nom-emp-rule-tercero-salud-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">AFP (Pensión)</label>
              <div class="relative">
                <input id="nom-emp-rule-tercero-pension-search" class="form-input" autocomplete="off" placeholder="Buscar tercero...">
                <input id="nom-emp-rule-tercero-pension" type="hidden" value="">
                <div id="nom-emp-rule-tercero-pension-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">ARL</label>
              <div class="relative">
                <input id="nom-emp-rule-tercero-arl-search" class="form-input" autocomplete="off" placeholder="Buscar tercero...">
                <input id="nom-emp-rule-tercero-arl" type="hidden" value="">
                <div id="nom-emp-rule-tercero-arl-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Caja de Compensación</label>
              <div class="relative">
                <input id="nom-emp-rule-tercero-caja-search" class="form-input" autocomplete="off" placeholder="Buscar tercero...">
                <input id="nom-emp-rule-tercero-caja" type="hidden" value="">
                <div id="nom-emp-rule-tercero-caja-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex gap-2">
            <button class="btn btn-primary" id="btn-nom-emp-rule-upsert"><i class="fas fa-floppy-disk"></i> Guardar en Lista</button>
            <button class="btn btn-outline" id="btn-nom-emp-rule-clear">Limpiar</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table text-sm">
            <thead><tr><th>Empleado</th><th>Grupo</th><th>Estado</th><th>Salario básico</th><th>ARL</th><th>Pensionado</th><th>Solidaridad</th><th>Retefuente</th><th></th></tr></thead>
            <tbody id="nom-emp-rules-body"></tbody>
          </table>
        </div>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" id="btn-save-nom-employee-rules">Guardar Cambios</button>',!0);const b=()=>{l.editingEmployeeId="",setInputVal("nom-emp-rule-employee",""),setInputVal("nom-emp-rule-group",""),setInputVal("nom-emp-rule-salary","0"),setInputVal("nom-emp-rule-arl","1"),$("#nom-emp-rule-pensioner")&&($("#nom-emp-rule-pensioner").checked=!1),$("#nom-emp-rule-solidarity")&&($("#nom-emp-rule-solidarity").checked=!1),$("#nom-emp-rule-withholding")&&($("#nom-emp-rule-withholding").checked=!1),setInputVal("nom-emp-rule-withholding-rate","0"),setInputVal("nom-emp-rule-tercero-salud",""),setInputVal("nom-emp-rule-tercero-pension",""),setInputVal("nom-emp-rule-tercero-arl",""),setInputVal("nom-emp-rule-tercero-caja",""),u()},u=()=>{[["nom-emp-rule-tercero-salud","nom-emp-rule-tercero-salud-search"],["nom-emp-rule-tercero-pension","nom-emp-rule-tercero-pension-search"],["nom-emp-rule-tercero-arl","nom-emp-rule-tercero-arl-search"],["nom-emp-rule-tercero-caja","nom-emp-rule-tercero-caja-search"]].forEach(([h,_])=>{const A=document.getElementById(h),C=document.getElementById(_);if(!A||!C)return;const T=Ea(r,A.value||"");C.value=T?wa(T):""})},y=g=>{const h=lo(l.config,g)||{},_=qe(l.config,g);l.editingEmployeeId=g,setInputVal("nom-emp-rule-employee",g),setInputVal("nom-emp-rule-group",h.group_id||_.group_id||""),setInputVal("nom-emp-rule-salary",String(se((h.basic_salary??_.basic_salary)||0))),setInputVal("nom-emp-rule-arl",String(h.arl_risk_level??_.arl_risk_level??1)),$("#nom-emp-rule-pensioner")&&($("#nom-emp-rule-pensioner").checked=!!(h.is_pensioner??_.is_pensioner)),$("#nom-emp-rule-solidarity")&&($("#nom-emp-rule-solidarity").checked=!!(h.apply_solidarity_fund??_.apply_solidarity_fund)),$("#nom-emp-rule-withholding")&&($("#nom-emp-rule-withholding").checked=!!(h.apply_withholding_tax??_.apply_withholding_tax)),setInputVal("nom-emp-rule-withholding-rate",String(se((h.withholding_rate??_.withholding_rate??0)*100))),$("#nom-emp-rule-tercero-salud")&&($("#nom-emp-rule-tercero-salud").value=h.tercero_salud_id||""),$("#nom-emp-rule-tercero-pension")&&($("#nom-emp-rule-tercero-pension").value=h.tercero_pension_id||""),$("#nom-emp-rule-tercero-arl")&&($("#nom-emp-rule-tercero-arl").value=h.tercero_arl_id||""),$("#nom-emp-rule-tercero-caja")&&($("#nom-emp-rule-tercero-caja").value=h.tercero_caja_id||""),u()},v=()=>{const g=$("#nom-emp-rules-summary"),h=$("#nom-emp-rules-body");if(!h)return;const _=[...e].sort((C,T)=>(C.name||"").localeCompare(T.name||"")),A=_.filter(C=>!ta(qe(l.config,C.id)));g&&(g.innerHTML=A.length?`<div class="rounded-xl p-3 text-sm" style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B">
               <p class="font-semibold"><i class="fas fa-triangle-exclamation mr-1"></i>Parámetros incompletos: ${A.length} empleado(s)</p>
               <p class="mt-1">Pendientes de salario básico efectivo: ${esc(A.slice(0,8).map(C=>C.name).join(", "))}${A.length>8?"...":""}</p>
             </div>`:`<div class="rounded-xl p-3 text-sm" style="background:#F0FFF4;border:1px solid #BBF7D0;color:#166534">
               <p class="font-semibold"><i class="fas fa-circle-check mr-1"></i>Todos los empleados activos tienen parámetros completos para liquidación.</p>
             </div>`),h.innerHTML=_.length?_.map(C=>{const T=qe(l.config,C.id),N=lo(l.config,C.id),I=ta(T),S=T.group_id?m[T.group_id]||"Grupo no encontrado":"Sin grupo";return`<tr${I?"":' style="background:#FFF7ED"'}>
            <td>${esc(C.name||"Empleado")}</td>
            <td>${esc(S)}</td>
            <td>${I?'<span class="badge badge-green">Completo</span>':'<span class="badge" style="background:#FEE2E2;color:#991B1B">Pendiente</span>'}</td>
            <td>${fmt(T.basic_salary||0)}</td>
            <td>${esc(d(T.arl_risk_level||1))}</td>
            <td>${T.is_pensioner?"Sí":"No"}</td>
            <td>${T.apply_solidarity_fund?"Sí":"No"}</td>
            <td>${T.apply_withholding_tax?`${se((T.withholding_rate||0)*100)}%`:"No"}</td>
            <td class="text-right">
              <div class="flex gap-1 justify-end">
                <button class="btn btn-outline btn-sm btn-edit-emp-rule" data-emp="${esc(C.id)}" title="Editar"><i class="fas fa-pen"></i></button>
                ${N?`<button class="btn btn-outline btn-sm btn-del-emp-rule" data-emp="${esc(C.id)}" title="Eliminar"><i class="fas fa-trash"></i></button>`:""}
              </div>
            </td>
          </tr>`}).join(""):'<tr><td colspan="9" class="text-center py-6" style="color:#9CA3AF">Sin empleados activos.</td></tr>'};v(),it({terceros:r,hiddenId:"nom-emp-rule-tercero-salud",inputId:"nom-emp-rule-tercero-salud-search",resultsId:"nom-emp-rule-tercero-salud-results"}),it({terceros:r,hiddenId:"nom-emp-rule-tercero-pension",inputId:"nom-emp-rule-tercero-pension-search",resultsId:"nom-emp-rule-tercero-pension-results"}),it({terceros:r,hiddenId:"nom-emp-rule-tercero-arl",inputId:"nom-emp-rule-tercero-arl-search",resultsId:"nom-emp-rule-tercero-arl-results"}),it({terceros:r,hiddenId:"nom-emp-rule-tercero-caja",inputId:"nom-emp-rule-tercero-caja-search",resultsId:"nom-emp-rule-tercero-caja-results"}),u(),(t=$("#nom-emp-rule-employee"))==null||t.addEventListener("change",()=>{const g=getSelectVal("nom-emp-rule-employee");g&&y(g)}),(a=$("#btn-nom-emp-rule-upsert"))==null||a.addEventListener("click",()=>{var C,T,N;const g=getSelectVal("nom-emp-rule-employee");if(!g)return showToast("Selecciona un empleado.","warning");const h=!!((C=$("#nom-emp-rule-withholding"))!=null&&C.checked),_=parseNum(getInputVal("nom-emp-rule-withholding-rate")),A={employee_id:g,group_id:getSelectVal("nom-emp-rule-group")||"",basic_salary:Math.max(0,parseNum(getInputVal("nom-emp-rule-salary"))||0),arl_risk_level:Math.max(1,Math.min(5,parseInt(getSelectVal("nom-emp-rule-arl")||"1",10)||1)),is_pensioner:!!((T=$("#nom-emp-rule-pensioner"))!=null&&T.checked),apply_solidarity_fund:!!((N=$("#nom-emp-rule-solidarity"))!=null&&N.checked),apply_withholding_tax:h,withholding_rate:h?Math.max(0,_/100):0,tercero_salud_id:getSelectVal("nom-emp-rule-tercero-salud")||"",tercero_pension_id:getSelectVal("nom-emp-rule-tercero-pension")||"",tercero_arl_id:getSelectVal("nom-emp-rule-tercero-arl")||"",tercero_caja_id:getSelectVal("nom-emp-rule-tercero-caja")||""};l.config.employee_rules=(l.config.employee_rules||[]).filter(I=>I.employee_id!==g),l.config.employee_rules.push(A),v(),showToast("Parámetro de empleado agregado/actualizado","success")}),(o=$("#btn-nom-emp-rule-clear"))==null||o.addEventListener("click",()=>{b()}),(s=$("#nom-emp-rules-body"))==null||s.addEventListener("click",g=>{var C,T,N,I;const h=(T=(C=g.target)==null?void 0:C.closest)==null?void 0:T.call(C,".btn-edit-emp-rule");if(h){const S=h.getAttribute("data-emp")||"";S&&y(S);return}const _=(I=(N=g.target)==null?void 0:N.closest)==null?void 0:I.call(N,".btn-del-emp-rule");if(!_)return;const A=_.getAttribute("data-emp")||"";l.config.employee_rules=(l.config.employee_rules||[]).filter(S=>S.employee_id!==A),l.editingEmployeeId===A&&b(),v()}),(n=$("#btn-save-nom-employee-rules"))==null||n.addEventListener("click",async()=>{try{await Ko(l.config,l.rowId),closeModal(),showToast("Parámetros por empleado guardados","success")}catch(g){showToast(g.message||"No se pudieron guardar los parámetros por empleado","error")}})}catch(i){showToast(i.message||"No se pudo abrir el panel de empleados de nómina","error")}}async function kt(e){var t,a,o,s,n,i;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando nómina...</div>';try{const c=[],r=await pb.listAll("payroll_periods",{sort:"-date_from"}).catch(u=>(c.push(`periodos: ${u.message}`),[])),l=await pb.listAll("third_parties",{filter:'type="EMPLEADO" && active=true',sort:"name"}).catch(u=>(c.push(`empleados: ${u.message}`),[])),p=await pb.listAll("payroll_lines",{sort:"-id",expand:"period_id,employee_id"}).catch(async u=>{try{return await pb.listAll("payroll_lines",{expand:"period_id,employee_id"})}catch{return c.push(`liquidaciones: ${u.message}`),[]}}),f=l.length===0,m=r.length===0,d={};p.forEach(u=>{const y=u.period_id;d[y]||(d[y]={devengado:0,deducciones:0,neto:0,parafiscales:0,count:0});const v=pt(u),g=Rt(u),h=(u.employer_health||0)+(u.employer_pension||0)+(u.employer_arl||0)+(u.sena||0)+(u.icbf||0)+(u.caja_comp||0);d[y].devengado+=v,d[y].deducciones+=g,d[y].neto+=u.net_pay||0,d[y].parafiscales+=h,d[y].count++});const b=u=>({draft:'<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>',approved:'<span class="badge badge-blue">Aprobada</span>',paid:'<span class="badge badge-green">Pagada</span>'})[u]||'<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>';e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Nómina</h3>
           <p class="text-sm" style="color:#6B7280">Liquidación de períodos, prestaciones y aportes parafiscales.</p>
        </div>
        ${can("canWrite")?`<div class="flex gap-2">${requireRole("admin")?'<button class="btn btn-outline" id="btn-nomina-empleado" title="Parámetros por empleado"><i class="fas fa-user-gear"></i> Empleado</button><button class="btn btn-outline" id="btn-nomina-config" title="Configurar contabilización"><i class="fas fa-gear"></i></button>':""}<button class="btn btn-secondary" id="btn-new-period"><i class="fas fa-calendar-plus"></i> Nuevo Período</button><button class="btn btn-primary" id="btn-new-payline"><i class="fas fa-plus"></i> Nueva Liquidación</button></div>`:""}
      </div>

      ${c.length?`
        <div class="mb-4 p-4 rounded-2xl border" style="background:#FEF2F2;border-color:#FECACA">
          <p class="font-semibold" style="color:#B91C1C"><i class="fas fa-triangle-exclamation mr-2"></i>Se detectaron errores de carga</p>
          <p class="text-sm" style="color:#6B7280">${esc(c.join(" | "))}</p>
        </div>`:""}

      ${f||m?`
        <div class="mb-4 p-4 rounded-2xl border" style="background:#FFF8F0;border-color:#FED7AA">
          <div class="flex flex-wrap items-center gap-3 justify-between">
            <div>
              <p class="font-semibold" style="color:#C46516"><i class="fas fa-triangle-exclamation mr-2"></i>Configuracion inicial requerida</p>
              <p class="text-sm" style="color:#6B7280">
                ${f?"No hay terceros tipo EMPLEADO activos.":""}
                ${f&&m?" ":""}
                ${m?"No hay Periodos de nomina creados.":""}
              </p>
            </div>
            <div class="flex gap-2">
              ${f?'<button class="btn btn-outline btn-sm" id="btn-go-empleados"><i class="fas fa-users"></i> Crear Empleado</button>':""}
              ${m&&can("canWrite")?'<button class="btn btn-primary btn-sm" id="btn-fast-period"><i class="fas fa-calendar-plus"></i> Crear Periodo</button>':""}
            </div>
          </div>
        </div>`:""}

      <!-- Períodos -->
      <div class="bg-white rounded-2xl border overflow-hidden mb-4" style="border-color:#F0F0F0">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:#F3F4F6">
           <h4 class="font-bold" style="color:#0D2137">Períodos de Nómina</h4>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Nombre</th><th>Desde</th><th>Hasta</th><th>Empleados</th><th>Devengado</th><th>Parafiscales</th><th>Neto Pago</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${r.length?r.map(u=>{const y=d[u.id]||{devengado:0,deducciones:0,neto:0,parafiscales:0,count:0};return`<tr>
                  <td class="font-semibold">${esc(u.name)}</td>
                  <td>${esc(u.date_from)}</td><td>${esc(u.date_to)}</td>
                  <td class="text-center">${y.count}</td>
                  <td>${fmt(y.devengado)}</td>
                  <td>${fmt(y.parafiscales)}</td>
                  <td class="font-semibold">${fmt(y.neto)}</td>
                  <td>${b(u.status)}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-outline btn-sm" title="Ver liquidaciones" onclick="viewPeriodLines('${esc(u.id)}','${esc(u.name)}','${esc(u.status||"draft")}')"><i class="fas fa-list-ul"></i></button>
                       ${can("canWrite")&&u.status==="draft"?`<button class="btn btn-primary btn-sm" title="Aprobar período" onclick="setPeriodStatus('${esc(u.id)}','approved')"><i class="fas fa-check"></i></button>`:""}
                      ${can("canWrite")&&u.status==="approved"?`<button class="btn btn-secondary btn-sm" title="Marcar pagada" onclick="setPeriodStatus('${esc(u.id)}','paid')"><i class="fas fa-money-bill-wave"></i></button>`:""}
                      ${can("canDelete")&&u.status==="draft"?`<button class="btn btn-outline btn-sm" title="Eliminar período" onclick="deletePayrollPeriod('${esc(u.id)}','${esc(u.name)}')"><i class="fas fa-trash"></i></button>`:""}
                    </div>
                  </td>
                </tr>`}).join(""):'<tr><td colspan="9" class="text-center py-8" style="color:#9CA3AF">Sin períodos de nómina.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Liquidaciones recientes -->
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <h4 class="font-bold" style="color:#0D2137">Liquidaciones Recientes</h4>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
             <thead><tr><th>Período</th><th>Empleado</th><th>Días</th><th>Devengado</th><th>Salud/Pens.</th><th>Neto</th><th></th></tr></thead>
            <tbody>
              ${p.length?p.slice(0,30).map(u=>{var y,v,g,h,_,A;return`
                <tr>
                  <td>${esc(((v=(y=u.expand)==null?void 0:y.period_id)==null?void 0:v.name)||"?")}</td>
                  <td>${esc(((h=(g=u.expand)==null?void 0:g.employee_id)==null?void 0:h.name)||"?")}</td>
                  <td class="text-center">${esc(String(u.days_worked||30))}</td>
                  <td>${fmt(pt(u))}</td>
                  <td>${fmt(Rt(u))}</td>
                  <td class="font-semibold">${fmt(u.net_pay||0)}</td>
                  <td>
                    <div class="flex gap-1 justify-end">
                      <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewPayrollLineDetail('${esc(u.id)}')"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-outline btn-sm" title="Imprimir volante" onclick="printPayrollSlip('${esc(u.id)}')"><i class="fas fa-print"></i></button>
                      ${can("canWrite")&&(((A=(_=u.expand)==null?void 0:_.period_id)==null?void 0:A.status)||"draft")==="draft"?`<button class="btn btn-outline btn-sm" title="Eliminar liquidación" onclick="deletePayrollLine('${esc(u.id)}')"><i class="fas fa-trash"></i></button>`:""}
                    </div>
                  </td>
                </tr>`}).join(""):'<tr><td colspan="7" class="text-center py-8" style="color:#9CA3AF">Sin liquidaciones.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`,(t=$("#btn-new-period"))==null||t.addEventListener("click",()=>po()),(a=$("#btn-new-payline"))==null||a.addEventListener("click",()=>Kn(r,l)),(o=$("#btn-nomina-empleado"))==null||o.addEventListener("click",()=>Jn(l)),(s=$("#btn-nomina-config"))==null||s.addEventListener("click",()=>Yn(l)),(n=$("#btn-go-empleados"))==null||n.addEventListener("click",()=>navigate("terceros")),(i=$("#btn-fast-period"))==null||i.addEventListener("click",()=>po())}catch(c){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(c.message)}</div>`}}async function Nr(e,t){const a={approved:"Aprobar",paid:"Marcar como Pagada"};confirmDialog(`${a[t]||"Cambiar estado"}`,"¿Confirmas cambiar el estado del período?",async()=>{try{const o={status:t};if(t==="approved"){const s=await Wn(e);s&&(o.tx_id=s)}await pb.update("payroll_periods",e,o),showToast("Estado actualizado","success"),kt($("#page-content"))}catch(o){showToast(o.message,"error")}})}async function Lr(e,t=""){if(!can("canDelete"))return showToast("No tienes permisos para eliminar períodos de nómina","error");try{const a=await pb.get("payroll_periods",e);if((a.status||"draft")!=="draft")return showToast("Solo puedes eliminar períodos en estado borrador.","warning");if(a.tx_id)return showToast("No puedes eliminar un período que ya tiene contabilización asociada.","warning");const o=t||a.name||"este período";confirmDialog("Eliminar período de nómina",`¿Confirmas eliminar el período ${esc(o)}? También se eliminarán sus liquidaciones.`,async()=>{try{await pb.delete("payroll_periods",e),showToast("Período eliminado","success"),kt($("#page-content"))}catch(s){showToast(s.message||"No se pudo eliminar el período","error")}})}catch(a){showToast(a.message||"No se pudo validar el período","error")}}async function Pr(e){var t,a,o,s;if(!can("canWrite"))return showToast("No tienes permisos para eliminar liquidaciones","error");try{const n=await pb.get("payroll_lines",e,{expand:"period_id,employee_id"});if((((a=(t=n.expand)==null?void 0:t.period_id)==null?void 0:a.status)||"draft")!=="draft")return showToast("Solo puedes eliminar liquidaciones de períodos en borrador.","warning");const c=((s=(o=n.expand)==null?void 0:o.employee_id)==null?void 0:s.name)||"este empleado";confirmDialog("Eliminar liquidación",`¿Confirmas eliminar la liquidación de ${esc(c)}?`,async()=>{try{await pb.delete("payroll_lines",e),showToast("Liquidación eliminada","success"),closeModal(),kt($("#page-content"))}catch(r){showToast(r.message||"No se pudo eliminar la liquidación","error")}})}catch(n){showToast(n.message||"No se pudo validar la liquidación","error")}}async function Fr(e,t,a="draft"){try{const o=await pb.listAll("payroll_lines",{filter:`period_id="${e}"`,expand:"employee_id,period_id",sort:"id"});if(!o.length)return showToast("Este período no tiene liquidaciones","info");const s=o.reduce((r,l)=>r+pt(l),0),n=o.reduce((r,l)=>r+(l.net_pay||0),0),i=o.reduce((r,l)=>r+(l.employer_health||0)+(l.employer_pension||0)+(l.employer_arl||0)+(l.sena||0)+(l.icbf||0)+(l.caja_comp||0),0),c=o.reduce((r,l)=>r+(l.cesantias||0)+(l.intereses_ces||0)+(l.prima||0)+(l.vacaciones||0),0);openModal(`Liquidaciones — ${esc(t)}`,`<div class="space-y-4">
        <div class="grid grid-cols-4 gap-3">
          <div class="rounded-xl p-3 text-center" style="background:#F0F7FF"><div class="text-xs" style="color:#6B7280">Total Devengado</div><div class="font-bold text-sm" style="color:#1A4B8C">${fmt(s)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#F0FFF4"><div class="text-xs" style="color:#6B7280">Total Neto</div><div class="font-bold text-sm" style="color:#15803D">${fmt(n)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#FFF8F0"><div class="text-xs" style="color:#6B7280">Parafiscales</div><div class="font-bold text-sm" style="color:#C46516">${fmt(i)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#FEF2F2"><div class="text-xs" style="color:#6B7280">Provisiones</div><div class="font-bold text-sm" style="color:#B91C1C">${fmt(c)}</div></div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table text-xs">
             <thead><tr><th>Empleado</th><th>Días</th><th>Salario</th><th>Devengado</th><th>Deduc.</th><th>Neto</th><th></th></tr></thead>
            <tbody>
              ${o.map(r=>{var l,p;return`<tr>
                <td>${esc(((p=(l=r.expand)==null?void 0:l.employee_id)==null?void 0:p.name)||"?")}</td>
                <td class="text-center">${r.days_worked||30}</td>
                <td>${fmt(r.salary_base||0)}</td>
                <td>${fmt(pt(r))}</td>
                <td>${fmt(Rt(r))}</td>
                <td class="font-semibold">${fmt(r.net_pay||0)}</td>
                <td>
                  <div class="flex gap-1 justify-end">
                    <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewPayrollLineDetail('${esc(r.id)}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-outline btn-sm" title="Imprimir volante" onclick="printPayrollSlip('${esc(r.id)}')"><i class="fas fa-print"></i></button>
                    ${can("canWrite")&&a==="draft"?`<button class="btn btn-outline btn-sm" title="Eliminar liquidación" onclick="deletePayrollLine('${esc(r.id)}')"><i class="fas fa-trash"></i></button>`:""}
                  </div>
                </td>
              </tr>`}).join("")}
            </tbody>
          </table>
        </div>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch(o){showToast(o.message,"error")}}async function Dr(e){var t,a;try{const o=await pb.get("payroll_lines",e,{expand:"period_id,employee_id"}),s=Ot(o),n=Dt(o),i=se((Number(s.arl_rate||De[1])||De[1])*100),c=Ba(o),l=ra(o).conceptAmounts,p=pt(o),f=Rt(o),m=(o.employer_health||0)+(o.employer_pension||0)+(o.employer_arl||0)+(o.sena||0)+(o.icbf||0)+(o.caja_comp||0),d=(o.cesantias||0)+(o.intereses_ces||0)+(o.prima||0)+(o.vacaciones||0),b=Number(s.transport_days||o.days_worked||30),u=(h,_,A=!1)=>`<div class="flex justify-between py-1 border-b" style="border-color:#F3F4F6">
        <span style="color:#6B7280">${h}</span>
        <span class="${A?"font-bold":"font-medium"}">${typeof _=="number"?fmt(_):_}</span>
      </div>`,y=c.hasBreakdown?c.breakdown.map(h=>u(`${h.label} (${h.hours} h)`,h.amount||0)).join(""):u("Horas extra / recargos",o.overtime||0),v=Pe.filter(h=>(l[h]||0)>0).map(h=>{var _;return u(((_=Re[h])==null?void 0:_.label)||h,l[h]||0)}).join(""),g=Fe.filter(h=>(l[h]||0)>0).map(h=>{var _;return u(((_=Re[h])==null?void 0:_.label)||h,l[h]||0)}).join("");openModal(`Detalle Liquidación — ${esc(((a=(t=o.expand)==null?void 0:t.employee_id)==null?void 0:a.name)||"")}`,`<div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Devengos</p>
           ${u("Salario base (30 días)",o.salary_base||0)}
           ${u("Días trabajados",String(o.days_worked||30))}
          ${u("Salario proporcional",(o.salary_base||0)/30*(o.days_worked||30))}
          ${y}
          ${u("Días auxilio transporte",String(b))}
          ${u("Aux. transporte",o.transport_allowance||0)}
          ${v}
          ${u("TOTAL DEVENGADO",p,!0)}
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Deducciones Trabajador</p>
          ${u("Salud (4%)",o.deduction_health||0)}
           ${u("Pensión (4%)",o.deduction_pension||0)}
          ${u("Fondo solidaridad",n.solidarity||0)}
          ${u("Retención en la fuente",n.withholding||0)}
          ${u("Otras deducciones",o.deduction_other||0)}
          ${g}
          ${u("TOTAL DEDUCCIONES",f,!0)}
          <p class="font-bold mt-3 py-2 px-3 rounded-lg text-base" style="background:#F0FFF4;color:#15803D">Neto a pagar: ${fmt(o.net_pay||0)}</p>
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Aportes Empleador</p>
          ${u("Salud (8.5%)",o.employer_health||0)}
           ${u("Pensión (12%)",o.employer_pension||0)}
          ${u(`ARL (${i}%)`,o.employer_arl||0)}
          ${u("SENA (2%)",o.sena||0)}
          ${u("ICBF (3%)",o.icbf||0)}
           ${u("Caja de Compensación (4%)",o.caja_comp||0)}
          ${u("TOTAL PARAFISCALES",m,!0)}
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Provisiones (Causadas)</p>
           ${u("Cesantías (8.33%)",o.cesantias||0)}
           ${u("Intereses cesantías (1%)",o.intereses_ces||0)}
          ${u("Prima de servicios (8.33%)",o.prima||0)}
          ${u("Vacaciones (4.17%)",o.vacaciones||0)}
          ${u("TOTAL PROVISIONES",d,!0)}
        </div>
      </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       <button class="btn btn-primary" onclick="printPayrollSlip('${e}')"><i class="fas fa-print mr-1"></i>Imprimir volante</button>`,!0)}catch(o){showToast(o.message,"error")}}async function Rr(e){var t,a,o,s,n,i,c,r,l,p,f,m;try{const d=await pb.get("payroll_lines",e,{expand:"period_id,employee_id"}),b=Ot(d),u=Dt(d),y=se((Number(b.arl_rate||De[1])||De[1])*100),v=Ba(d),h=ra(d).conceptAmounts,_=pt(d),A=Rt(d),C=Number(b.transport_days||d.days_worked||30),[T,N,I]=await Promise.all([API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>"")]),S=((a=(t=d.expand)==null?void 0:t.employee_id)==null?void 0:a.name)||"",w=((s=(o=d.expand)==null?void 0:o.employee_id)==null?void 0:s.doc_number)||"",E=((i=(n=d.expand)==null?void 0:n.employee_id)==null?void 0:i.notes)||"",L=((r=(c=d.expand)==null?void 0:c.period_id)==null?void 0:r.name)||"",R=((p=(l=d.expand)==null?void 0:l.period_id)==null?void 0:p.date_from)||"",M=((m=(f=d.expand)==null?void 0:f.period_id)==null?void 0:m.date_to)||"",B=x=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}).format(Number(x)||0),k=(x,P,V=!1)=>`<tr>
         <td style="padding:3px 8px;color:#374151;${V?"font-weight:700;":""}">${x}</td>
         <td style="padding:3px 8px;text-align:right;${V?"font-weight:700;":""}">${typeof P=="number"?B(P):P}</td>
       </tr>`,j=v.hasBreakdown?v.breakdown.filter(x=>x.hours>0).map(x=>k(`${x.label} (${x.hours} h)`,x.amount)).join(""):d.overtime?k("Horas extra / recargos",d.overtime||0):"",Y=Pe.filter(x=>(h[x]||0)>0).map(x=>{var P;return k(((P=Re[x])==null?void 0:P.label)||x,h[x])}).join(""),W=Fe.filter(x=>(h[x]||0)>0).map(x=>{var P;return k(((P=Re[x])==null?void 0:P.label)||x,h[x])}).join(""),K=`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Volante de Nómina — ${S}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111827; background: #fff; }
    .page { width: 210mm; margin: 0 auto; padding: 14mm 14mm; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0D2137; padding-bottom: 10px; margin-bottom: 12px; }
    .company-name { font-size: 16px; font-weight: 700; color: #0D2137; }
    .company-sub { font-size: 11px; color: #6B7280; margin-top: 2px; }
    .slip-title { font-size: 14px; font-weight: 700; color: #1A4B8C; text-align: right; }
    .slip-period { font-size: 11px; color: #6B7280; text-align: right; margin-top: 2px; }
    .emp-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; display: flex; gap: 36px; flex-wrap: wrap; }
    .emp-field label { font-size: 10px; color: #6B7280; display: block; }
    .emp-field span { font-size: 12px; font-weight: 600; color: #0D2137; }
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .section { border: 1px solid #E5E7EB; border-radius: 6px; overflow: hidden; }
    .section-title { background: #F1F5F9; font-weight: 700; font-size: 11px; color: #0D2137; padding: 5px 8px; letter-spacing: .4px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; }
    tr:nth-child(even) td { background: #FAFAFA; }
    .neto-bar { background: #ECFDF5; border: 2px solid #6EE7B7; border-radius: 6px; text-align: center; padding: 10px; margin-bottom: 16px; }
    .neto-bar .n-label { font-size: 11px; color: #065F46; }
    .neto-bar .n-value { font-size: 22px; font-weight: 800; color: #059669; }
    .employer-grid { display: grid; grid-template-columns: 1fr 1fr; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; }
    .sig-line { border-top: 1px solid #374151; padding-top: 4px; margin-top: 44px; text-align: center; font-size: 10px; color: #6B7280; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 10mm 12mm; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company-name">${T||"Empresa"}</div>
      ${N?`<div class="company-sub">NIT: ${N}</div>`:""}
      ${I?`<div class="company-sub">${I}</div>`:""}
    </div>
    <div>
      <div class="slip-title">VOLANTE DE PAGO DE NÓMINA</div>
      <div class="slip-period">${L}${R?" &nbsp;·&nbsp; Del "+R:""}${M?" al "+M:""}</div>
    </div>
  </div>

  <div class="emp-card">
    <div class="emp-field"><label>Empleado</label><span>${S}</span></div>
    <div class="emp-field"><label>Documento</label><span>${w||"—"}</span></div>
    ${E?`<div class="emp-field"><label>Cargo / Notas</label><span>${E}</span></div>`:""}
    <div class="emp-field"><label>Días salario</label><span>${d.days_worked||30}</span></div>
    <div class="emp-field"><label>Días aux. transporte</label><span>${C}</span></div>
  </div>

  <div class="cols">
    <div class="section">
      <div class="section-title">Devengado</div>
      <table>
        ${k("Salario base (mensual)",d.salary_base||0)}
        ${k("Salario proporcional",(d.salary_base||0)/30*(d.days_worked||30))}
        ${j}
        ${k("Auxilio de transporte",d.transport_allowance||0)}
        ${Y}
        ${k("TOTAL DEVENGADO",_,!0)}
      </table>
    </div>
    <div class="section">
      <div class="section-title">Deducciones trabajador</div>
      <table>
        ${k("Salud trabajador (4%)",d.deduction_health||0)}
        ${k("Pensión trabajador (4%)",d.deduction_pension||0)}
        ${u.solidarity>0?k("Fondo de solidaridad",u.solidarity):""}
        ${u.withholding>0?k("Retención en la fuente",u.withholding):""}
        ${(d.deduction_other||0)>0?k("Otras deducciones",d.deduction_other):""}
        ${W}
        ${k("TOTAL DEDUCCIONES",A,!0)}
      </table>
    </div>
  </div>

  <div class="neto-bar">
    <div class="n-label">NETO A PAGAR</div>
    <div class="n-value">${B(d.net_pay||0)}</div>
  </div>

  <div class="section" style="margin-bottom:14px">
    <div class="section-title">Aportes empleador y provisiones (referencia — no afectan el neto)</div>
    <div class="employer-grid">
      <table>
        ${k("Salud empleador (8.5%)",d.employer_health||0)}
        ${k("Pensión empleador (12%)",d.employer_pension||0)}
        ${k("ARL ("+y+"%)",d.employer_arl||0)}
        ${k("Caja de Compensación (4%)",d.caja_comp||0)}
        ${k("SENA (2%)",d.sena||0)}
        ${k("ICBF (3%)",d.icbf||0)}
      </table>
      <table>
        ${k("Cesantías (8.33%)",d.cesantias||0)}
        ${k("Intereses cesantías (1%)",d.intereses_ces||0)}
        ${k("Prima de servicios (8.33%)",d.prima||0)}
        ${k("Vacaciones causadas (4.17%)",d.vacaciones||0)}
      </table>
    </div>
  </div>

  <div class="signatures">
    <div><div class="sig-line">Firma empleador / Representante legal</div></div>
    <div><div class="sig-line">Firma empleado — ${S}</div></div>
  </div>
</div>
<script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`,H=window.open("","_blank","width=900,height=720");if(!H){showToast("El navegador bloqueó la ventana emergente. Permite popups para esta página.","warning");return}H.document.write(K),H.document.close()}catch(d){showToast(d.message||"No se pudo generar el volante","error")}}function po(){var e;openModal("Nuevo Período de Nómina",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group md:col-span-2"><label class="form-label">Nombre del Período</label><input id="pp-name" class="form-input" placeholder="Ej: Nómina Mayo 2026"></div>
      <div class="form-group"><label class="form-label">Fecha Desde</label><input id="pp-from" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group"><label class="form-label">Fecha Hasta</label><input id="pp-to" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group"><label class="form-label">Estado Inicial</label><select id="pp-status" class="form-input"><option value="draft">Borrador</option><option value="approved">Aprobada</option></select></div>
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-period">Guardar</button>'),(e=$("#btn-save-period"))==null||e.addEventListener("click",async()=>{try{const t={name:getInputVal("pp-name"),date_from:getInputVal("pp-from"),date_to:getInputVal("pp-to"),status:getSelectVal("pp-status")};if(!t.name||!t.date_from||!t.date_to)return showToast("Completa los campos obligatorios","warning");const a=await pb.create("payroll_periods",t);closeModal(),showToast("Período creado","success"),kt($("#page-content"))}catch(t){showToast(t.message,"error")}})}async function Kn(e,t){var d,b,u,y,v;if(!e.length)return showToast("Primero crea un período de nómina","warning");if(!t.length)return showToast("No hay terceros tipo EMPLEADO activos","warning");const a=e.filter(g=>g.status==="draft"||!g.status);if(!a.length)return showToast("No hay períodos en estado Borrador para liquidar","warning");const{config:o}=await ca(),s=t.filter(g=>{const h=qe(o,g.id);return!ta(h)});if(s.length){const g=s.slice(0,5).map(h=>h.name).join(", ");return showToast(`Debes configurar salario básico en todos los empleados activos antes de liquidar. Pendientes: ${g}${s.length>5?"...":""}`,"warning")}const n=qt.map(g=>`
    <div class="form-group">
      <label class="form-label">${esc(g.label)} (horas)</label>
      <input id="pl-ot-${esc(g.key)}" class="form-input" value="0">
    </div>
  `).join(""),i=Pe.map(g=>{var h;return`
    <div class="form-group">
      <label class="form-label">${esc(((h=Re[g])==null?void 0:h.label)||g)}</label>
      <input id="pl-cpt-${esc(g)}" class="form-input" value="0">
    </div>
  `}).join(""),c=Fe.map(g=>{var h;return`
    <div class="form-group">
      <label class="form-label">${esc(((h=Re[g])==null?void 0:h.label)||g)}</label>
      <input id="pl-cpt-${esc(g)}" class="form-input" value="0">
    </div>
  `}).join("");openModal("Nueva Liquidación de Nómina",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Período</label><select id="pl-period" class="form-input">${a.map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Empleado</label><select id="pl-emp" class="form-input">${t.map(g=>`<option value="${esc(g.id)}">${esc(g.doc_number)} - ${esc(g.name)}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Salario Base (mensual)</label><input id="pl-salary" class="form-input" value="0"><p class="text-xs mt-1" style="color:#6B7280">Se autocompleta según parámetro del empleado.</p></div>
      <div class="form-group"><label class="form-label">Días salario (max 30)</label><input id="pl-days-salary" class="form-input" value="30"></div>
      <div class="form-group"><label class="form-label">Días auxilio transporte (0 a 30)</label><input id="pl-days-transport" class="form-input" value="30"></div>
      <div class="form-group"><label class="form-label">Auxilio de Transporte mensual</label><input id="pl-aux" class="form-input" value="200000" title="2026: $200.000"><p class="text-xs mt-1" style="color:#6B7280">Se liquida proporcional con los días de auxilio.</p></div>
      <div class="form-group"><label class="form-label">Otras Deducciones</label><input id="pl-ded-other" class="form-input" value="0" placeholder="Deducciones varias no clasificadas"></div>
    </div>

    <div class="rounded-xl p-3 mt-4" style="background:#F8FAFC;border:1px solid #E2E8F0">
      <p class="font-semibold mb-2" style="color:#0D2137">Horas extra y recargos — jornada ${((d=o.company_rules)==null?void 0:d.weekly_hours)||44} h/semana (valor hora = salario / ${(((b=o.company_rules)==null?void 0:b.weekly_hours)||44)*5})</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">${n}</div>
    </div>

    <div class="rounded-xl p-3 mt-4" style="background:#F8FAFC;border:1px solid #E2E8F0">
      <p class="font-semibold mb-2" style="color:#0D2137">Devengos adicionales (débito)</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">${i}</div>
    </div>

    <div class="rounded-xl p-3 mt-4" style="background:#F8FAFC;border:1px solid #E2E8F0">
      <p class="font-semibold mb-2" style="color:#0D2137">Deducciones por concepto (crédito)</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${c}</div>
    </div>

    <div id="nomina-preview" class="mt-4 p-3 rounded-xl text-sm" style="background:#F9FAFB;border:1px solid #E5E7EB;display:none"></div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-secondary btn-sm" id="btn-preview-pl"><i class="fas fa-calculator"></i> Calcular</button>
     <button class="btn btn-primary" id="btn-save-pl">Guardar</button>`);const r=()=>{const g={};return[...Pe,...Fe].forEach(h=>{g[h]=se(parseNum(getInputVal(`pl-cpt-${h}`))||0)}),g},l=g=>{var C;const h=((C=o.company_rules)==null?void 0:C.weekly_hours)||44,_=se((g||0)/(h*5)),A=qt.map(T=>{const N=se(parseNum(getInputVal(`pl-ot-${T.key}`))||0),I=se(_*N*T.factor);return{key:T.key,hours:N,amount:I}});return{hourly_rate:_,total_hours:se(A.reduce((T,N)=>T+(N.hours||0),0)),total_amount:se(A.reduce((T,N)=>T+(N.amount||0),0)),breakdown:A}},p=async()=>{const g=parseNum(getInputVal("pl-salary")),h=parseNum(getInputVal("pl-days-salary"))||30,_=parseNum(getInputVal("pl-days-transport"))||0,A=parseNum(getInputVal("pl-aux")),C=se(A/30*_),T=parseNum(getInputVal("pl-ded-other")),N=getSelectVal("pl-emp");if(g<=0)return;const S=l(g).total_amount,w=r(),E=se(Pe.reduce((q,G)=>q+(w[G]||0),0)),L=se(Fe.reduce((q,G)=>q+(w[G]||0),0)),R=qe(o,N),M=o.company_rules||ea().company_rules,B=g/30*h,k=B+S,j=k+C+E,Y=k*.04,W=R.is_pensioner?0:k*.04,K=(M.smmlv||1423500)*(M.solidarity_threshold_smmlv||3),H=R.apply_solidarity_fund&&k>=K?k*(M.solidarity_rate||.01):0,x=R.apply_withholding_tax?k*(R.withholding_rate||0):0,P=Y+W+H+x+T+L,V=j-P,U=De[R.arl_risk_level]||De[1],z=M.exempt_sena_icbf?0:.02,J=M.exempt_sena_icbf?0:.03,te=k*(.085+.12+U+z+J+.04),F=k*(.0833+.01*.0833+.0833+.0417),D=$("#nomina-preview");D&&(D.style.display="",D.innerHTML=`
      <div class="grid grid-cols-3 gap-3 text-center">
        <div><div class="text-xs" style="color:#6B7280">Devengado</div><div class="font-bold" style="color:#1A4B8C">${fmt(j)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Deducciones</div><div class="font-bold" style="color:#B91C1C">${fmt(P)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Neto a Pagar</div><div class="font-bold" style="color:#15803D">${fmt(V)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Parafiscales</div><div class="font-medium" style="color:#C46516">${fmt(te)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Provisiones</div><div class="font-medium" style="color:#7C3AED">${fmt(F)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Costo Total</div><div class="font-bold" style="color:#0D2137">${fmt(j+te+F)}</div></div>
      </div>
      <div class="mt-3 text-xs" style="color:#64748B">
        Salario (${h} días): ${fmt(B)} | Auxilio (${_} días): ${fmt(C)} | Horas extra/recargos: ${fmt(S)} | Devengos adicionales: ${fmt(E)} | Deducciones por concepto: ${fmt(L)}
      </div>`)};(u=$("#btn-preview-pl"))==null||u.addEventListener("click",p),["pl-salary","pl-days-salary","pl-days-transport","pl-aux","pl-ded-other",...qt.map(g=>`pl-ot-${g.key}`),...Pe.map(g=>`pl-cpt-${g}`),...Fe.map(g=>`pl-cpt-${g}`)].forEach(g=>{var h;return(h=$("#"+g))==null?void 0:h.addEventListener("input",debounce(()=>{p()},250))});const m=()=>{const g=getSelectVal("pl-emp"),h=qe(o,g);(h.basic_salary||0)>0&&setInputVal("pl-salary",String(se(h.basic_salary)))};(y=$("#pl-emp"))==null||y.addEventListener("change",()=>{m(),p()}),m(),p(),(v=$("#btn-save-pl"))==null||v.addEventListener("click",async()=>{var h;const g=$("#btn-save-pl");g&&(g.disabled=!0,g.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const _=parseNum(getInputVal("pl-salary")),A=parseNum(getInputVal("pl-days-salary"))||30,C=parseNum(getInputVal("pl-days-transport"))||0,T=parseNum(getInputVal("pl-aux")),N=se(T/30*C),I=parseNum(getInputVal("pl-ded-other")),S=getSelectVal("pl-emp");if(_<=0)return showToast("El salario base debe ser mayor a cero","warning");if(A<=0||A>30)return showToast("Días salario debe estar entre 1 y 30","warning");if(C<0||C>30)return showToast("Días auxilio transporte debe estar entre 0 y 30","warning");const w=getSelectVal("pl-period");if(!w)return showToast("Selecciona un Periodo","warning");if(((await pb.get("payroll_periods",w)).status||"draft")!=="draft")return showToast("El Periodo seleccionado no esta en borrador. No se pueden registrar nuevas liquidaciones.","error");const L=l(_),R=L.total_amount,M=r(),B=se(Pe.reduce((de,me)=>de+(M[me]||0),0)),k=se(Fe.reduce((de,me)=>de+(M[me]||0),0)),Y=_/30*A+R,W=Y+N+B,K=qe(o,S);if(!ta(K))return showToast("El empleado no tiene salario básico configurado en Parámetros por Empleado.","warning");const H=o.company_rules||ea().company_rules,x=Y*.04,P=K.is_pensioner?0:Y*.04,V=(H.smmlv||1423500)*(H.solidarity_threshold_smmlv||3),U=K.apply_solidarity_fund&&Y>=V?Y*(H.solidarity_rate||.01):0,z=K.apply_withholding_tax?Y*(K.withholding_rate||0):0,J=I,te=Y*.085,F=Y*.12,D=De[K.arl_risk_level]||De[1],q=Y*D,G=H.exempt_sena_icbf?0:Y*.02,ee=H.exempt_sena_icbf?0:Y*.03,X=Y*.04,ne=Y*.0833,Z=ne*.01,Q=Y*.0833,oe=Y*.0417,ve=W-x-P-U-z-J-k,be={};L.breakdown.forEach(de=>{be[de.key]={hours:se(de.hours||0),amount:se(de.amount||0)}});const ye={payroll_meta:{arl_risk_level:K.arl_risk_level,arl_rate:D,is_pensioner:!!K.is_pensioner,solidarity_fund:se(U),withholding_tax:se(z),company_exempt_sena_icbf:!!H.exempt_sena_icbf,overtime_breakdown:{hourly_rate:se(L.hourly_rate||0),total_hours:se(L.total_hours||0),total_amount:se(R||0),...be},transport_days:C,transport_monthly:se(T||0),concept_amounts:M}},pe={period_id:w,employee_id:S,salary_base:_,days_worked:A,overtime:R,transport_allowance:N,deduction_health:x,deduction_pension:P,deduction_other:J,net_pay:ve,employer_health:te,employer_pension:F,employer_arl:q,sena:G,icbf:ee,caja_comp:X,cesantias:ne,intereses_ces:Z,prima:Q,vacaciones:oe,notes:JSON.stringify(ye)};await pb.create("payroll_lines",pe),closeModal(),showToast("Liquidación registrada","success"),kt($("#page-content"))}catch(_){const A=(h=_==null?void 0:_.data)!=null&&h.data?Object.values(_.data.data).map(C=>C==null?void 0:C.message).filter(Boolean).join(" | "):"";showToast(A||_.message||"No se pudo registrar la Liquidacion","error")}finally{g&&(g.disabled=!1,g.innerHTML="Guardar")}})}window.ARL_RISK_RATES=De;window.openNominaEmployeeSettings=Jn;window.compactNominaConfigForStorage=Un;window.writeSettingJsonMaybeChunked=jn;window.upsertSettingByKey=ro;window.isEmployeePayrollRuleComplete=ta;window.viewPeriodLines=Fr;window.listSettingsByPrefix=Jo;window.nominaThirdDisplay=wa;window.getEmployeePayrollRule=qe;window.getNominaAdditionalConceptTotals=ra;window.getNominaConfigWithRow=ca;window.deleteSettingByKey=co;window.saveNominaConfig=Ko;window.normalizeNominaConfig=Ft;window.getNominaConceptRule=Gt;window.getNominaDeduccionesTotal=Rt;window.NOMINA_EXTRA_DEDUCTION_KEYS=Fe;window.round2=se;window.nominaFindThirdById=Ea;window.renderNomina=kt;window.setPeriodStatus=Nr;window.openNominaAccountingSettings=Yn;window.initNominaThirdSearchInput=it;window.getExtraDeductionsFromLine=Dt;window.getNominaConceptAmountsFromLine=Qo;window.postNominaPeriodAccounting=Wn;window.viewPayrollLineDetail=Dr;window.NOMINA_CONCEPTS=Ma;window.NOMINA_CATEGORY_LABELS=$a;window.findEmployeePayrollRule=lo;window.getNominaOvertimeMetaFromLine=Ba;window.resolveNominaCrossDocRef=qn;window.NOMINA_OVERTIME_TYPES=qt;window.NOMINA_EXTRA_EARNING_KEYS=Pe;window.deletePayrollPeriod=Lr;window.buildNominaAccountingLines=zn;window.openPayrollLineForm=Kn;window.defaultNominaConfig=ea;window.settingChunkKey=io;window.resolveAllNominaMappings=Hn;window.NOMINA_CONFIG_VALUE_MAX_CHARS=Aa;window.printPayrollSlip=Rr;window.resolveNominaTerceroId=Gn;window.readSettingJsonMaybeChunked=xt;window.deletePayrollLine=Pr;window.NOMINA_CONFIG_KEYS=Te;window.NOMINA_CONCEPT_RULES=kn;window.getNominaConceptAmount=Zo;window.NOMINA_CONFIG_KEY=Je;window.getNominaCategoryConcepts=Bn;window.splitTextInChunks=Vn;window.getNominaCategoryLabel=Mn;window.resolveNominaMapping=Sr;window.getNominaLineMeta=Ot;window.NOMINA_CONCEPT_BY_KEY=Re;window.openPeriodForm=po;window.getNominaDevengadoTotal=pt;async function Xo(e){var t,a,o,s,n;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando facturaci?n DIAN...</div>';try{const i=[],c=await pb.listAll("einvoice_docs",{sort:"-created",expand:"tx_id"}).catch(b=>(i.push(`documentos: ${b.message}`),[])),r=await pb.listAll("transactions",{sort:"-date,-created",filter:'status="active"',expand:"tx_type_id,third_party_id"}).catch(b=>(i.push(`transacciones: ${b.message}`),[])),l={pendiente:{cls:"badge-orange",icon:"fa-clock",label:"Pendiente"},enviada:{cls:"badge-blue",icon:"fa-paper-plane",label:"Enviada"},aceptada:{cls:"badge-green",icon:"fa-circle-check",label:"Aceptada"},rechazada:{cls:"badge-red",icon:"fa-circle-xmark",label:"Rechazada"}},p=b=>l[b]||l.pendiente,f={pendiente:0,enviada:0,aceptada:0,rechazada:0};c.forEach(b=>{const u=b.status||"pendiente";f[u]!==void 0&&f[u]++});const m=r.length===0;e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Facturaci?n Electr?nica DIAN</h3>
          <p class="text-sm" style="color:#6B7280">Gesti?n de estado documental y trazabilidad CUFE.</p>
        </div>
        ${can("canWrite")?'<button class="btn btn-primary" id="btn-new-dian"><i class="fas fa-plus"></i> Nuevo Documento DIAN</button>':""}
      </div>

      ${i.length?`<div class="mb-4 p-4 rounded-2xl border" style="background:#FEF2F2;border-color:#FECACA">
        <p class="font-semibold" style="color:#B91C1C"><i class="fas fa-triangle-exclamation mr-2"></i>Se detectaron errores de carga</p>
        <p class="text-sm" style="color:#6B7280">${esc(i.join(" | "))}</p>
      </div>`:""}

      ${m?`<div class="mb-4 p-4 rounded-2xl border" style="background:#FFF8F0;border-color:#FED7AA">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-semibold" style="color:#C46516"><i class="fas fa-triangle-exclamation mr-2"></i>No hay transacciones activas para facturar</p>
            <p class="text-sm" style="color:#6B7280">Crea primero un comprobante en Nueva transaccion o usa uno existente activo.</p>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-go-nueva-tx"><i class="fas fa-file-circle-plus"></i> Ir a Nueva transaccion</button>
        </div>
      </div>`:""}

      <!-- KPI cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        ${[["pendiente","#FFF8F0","#C46516"],["enviada","#EFF6FF","#1D4ED8"],["aceptada","#F0FFF4","#15803D"],["rechazada","#FEF2F2","#B91C1C"]].map(([b,u,y])=>`
          <div class="rounded-2xl p-4 cursor-pointer dian-kpi" data-status="${b}" style="background:${u};border:2px solid transparent" onclick="filterDianByStatus('${b}')">
            <div class="text-xs font-medium mb-1" style="color:${y}">${p(b).label}</div>
            <div class="text-2xl font-bold" style="color:${y}">${f[b]}</div>
          </div>`).join("")}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap gap-3">
          <input id="dian-q" class="form-input flex-1 min-w-48" placeholder="Buscar comprobante, CUFE, respuesta...">
          <select id="dian-status-filter" class="form-input" style="max-width:200px">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="enviada">Enviada</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
          </select>
          <button class="btn btn-outline btn-sm" id="btn-dian-clear"><i class="fas fa-eraser"></i> Limpiar</button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="dian-table">
            <thead><tr><th>Comprobante</th><th>Tercero</th><th>CUFE</th><th>Estado</th><th>Respuesta DIAN</th><th>Enviado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${c.length?c.map(b=>{var g,h,_;const u=b.status||"pendiente",y=p(u),v=(g=b.expand)==null?void 0:g.tx_id;return`<tr data-status="${u}">
                  <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc((v==null?void 0:v.number)||"?")}</span></td>
                  <td>${esc(((_=(h=v==null?void 0:v.expand)==null?void 0:h.third_party_id)==null?void 0:_.name)||"?")}</td>
                  <td class="font-mono text-xs max-w-xs truncate" title="${esc(b.cufe||"")}">${b.cufe?esc(b.cufe.slice(0,20))+"?":"?"}</td>
                  <td><span class="badge ${y.cls}"><i class="fas ${y.icon} mr-1"></i>${y.label}</span></td>
                  <td class="text-sm max-w-xs truncate" title="${esc(b.dian_response||"")}">${esc(b.dian_response||"?")}</td>
                  <td>${esc(b.sent_at?fmtDate(b.sent_at):"?")}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewDianDetail('${esc(b.id)}')"><i class="fas fa-eye"></i></button>
                      ${can("canWrite")?`<button class="btn btn-outline btn-sm" title="Editar" onclick="editDianDoc('${esc(b.id)}')"><i class="fas fa-pen"></i></button>`:""}
                      ${can("canWrite")&&u==="pendiente"?`<button class="btn btn-secondary btn-sm" title="Enviar a DIAN" onclick="setDianStatus('${esc(b.id)}','enviada')"><i class="fas fa-paper-plane"></i> Enviar</button>`:""}
                      ${can("canWrite")&&u==="enviada"?`<button class="btn btn-primary btn-sm" title="Aceptar" onclick="setDianStatus('${esc(b.id)}','aceptada')"><i class="fas fa-check"></i></button>`:""}
                      ${can("canWrite")&&u==="enviada"?`<button class="btn btn-danger btn-sm" title="Rechazar" onclick="setDianStatus('${esc(b.id)}','rechazada')"><i class="fas fa-xmark"></i></button>`:""}
                    </div>
                  </td>
                </tr>`}).join(""):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay documentos DIAN registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;const d=()=>{const b=getInputVal("dian-q").toLowerCase(),u=getSelectVal("dian-status-filter");$$("#dian-table tbody tr[data-status]").forEach(y=>{const v=!b||y.textContent.toLowerCase().includes(b),g=!u||y.dataset.status===u;y.style.display=v&&g?"":"none"})};(t=$("#dian-q"))==null||t.addEventListener("input",debounce(d,150)),(a=$("#dian-status-filter"))==null||a.addEventListener("change",d),(o=$("#btn-dian-clear"))==null||o.addEventListener("click",()=>{setInputVal("dian-q","");const b=$("#dian-status-filter");b&&(b.value=""),$$("#dian-table tbody tr[data-status]").forEach(u=>u.style.display=""),$$(".dian-kpi").forEach(u=>u.style.borderColor="transparent")}),(s=$("#btn-new-dian"))==null||s.addEventListener("click",()=>es(r)),(n=$("#btn-go-nueva-tx"))==null||n.addEventListener("click",()=>navigate("nueva-tx"))}catch(i){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(i.message)}</div>`}}function Or(e){const t=$("#dian-status-filter");t&&(t.value=e,t.dispatchEvent(new Event("change"))),$$(".dian-kpi").forEach(a=>a.style.borderColor=a.dataset.status===e?"#E87D1E":"transparent")}async function kr(e){var t;try{const a=await pb.get("einvoice_docs",e,{expand:"tx_id"}),o=(t=a.expand)==null?void 0:t.tx_id,s={pendiente:{cls:"badge-orange",label:"Pendiente"},enviada:{cls:"badge-blue",label:"Enviada"},aceptada:{cls:"badge-green",label:"Aceptada"},rechazada:{cls:"badge-red",label:"Rechazada"}},n=s[a.status||"pendiente"]||s.pendiente,i=`<?xml version="1.0" encoding="UTF-8"?>
<!-- Documento Electr?nico DIAN - GRAVY v2 (Simulaci?n) -->
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <UBLVersionID>UBL 2.1</UBLVersionID>
  <ID>${esc((o==null?void 0:o.number)||"N/A")}</ID>
  <IssueDate>${esc((a.sent_at||"").slice(0,10)||"?")}</IssueDate>
  <CUFE>${esc(a.cufe||"Pendiente de generaci?n")}</CUFE>
  <InvoiceTypeCode>01</InvoiceTypeCode>
  <Note>${esc(a.dian_response||"")}</Note>
</Invoice>`;openModal(`Documento DIAN ? ${esc((o==null?void 0:o.number)||e)}`,`<div class="space-y-4 text-sm">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div><span class="form-label">Comprobante</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc((o==null?void 0:o.number)||"?")}</p></div>
          <div><span class="form-label">Estado</span><p><span class="badge ${n.cls}">${n.label}</span></p></div>
          <div><span class="form-label">Fecha Env?o</span><p>${esc(a.sent_at?fmtDate(a.sent_at):"No enviado")}</p></div>
          <div class="col-span-2 md:col-span-3"><span class="form-label">CUFE</span><p class="font-mono text-xs break-all p-2 rounded" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(a.cufe||"Pendiente de generaci?n")}</p></div>
          <div class="col-span-2 md:col-span-3"><span class="form-label">Respuesta DIAN</span><p class="p-2 rounded text-sm" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(a.dian_response||"?")}</p></div>
        </div>
        <div>
          <span class="form-label">Contenido XML (simulaci?n)</span>
          <textarea readonly class="form-input font-mono text-xs mt-1" rows="8" style="resize:vertical">${esc(i)}</textarea>
        </div>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch(a){showToast(a.message,"error")}}function Qn(e,t){const a=`${e}|${t}|${Date.now()}`;try{return btoa(a).replace(/[^A-Za-z0-9]/g,"").slice(0,64).padEnd(64,"0")}catch{return`CUFE${Date.now()}${e}`.slice(0,64)}}async function Mr(e,t){const a={enviada:"Enviar a DIAN",aceptada:"Marcar como Aceptada",rechazada:"Marcar como Rechazada"};confirmDialog(a[t]||"Cambiar estado","?Confirmas el cambio de estado del documento?",async()=>{try{const o=await pb.get("einvoice_docs",e),s=o.status||"pendiente";if(!({pendiente:["enviada"],enviada:["aceptada","rechazada"],aceptada:[],rechazada:[]}[s]||[]).includes(t))return showToast(`Transici?n no permitida: ${s} ? ${t}`,"warning");const i={status:t};t==="enviada"&&(i.sent_at=todayStr(),i.cufe=o.cufe||Qn(o.tx_id,i.sent_at),i.dian_response=o.dian_response||"Documento enviado a DIAN (simulaci?n)."),t==="aceptada"&&(i.dian_response="Documento aceptado por DIAN. Procesado correctamente."),t==="rechazada"&&(i.dian_response="Documento rechazado por DIAN. Verifique inconsistencias."),await pb.update("einvoice_docs",e,i),showToast(`Estado actualizado a: ${t}`,"success"),Xo($("#page-content"))}catch(o){showToast(o.message,"error")}})}function es(e,t=null){var a;if(!t&&(!e||!e.length))return showToast("No hay transacciones activas disponibles para asociar al documento DIAN","warning");openModal(t?"Editar Documento DIAN":"Nuevo Documento DIAN",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group md:col-span-2"><label class="form-label">Transacci?n Contable</label>
        <select id="df-tx" class="form-input" ${t?"disabled":""}>
          <option value="">Seleccione transacci?n...</option>
          ${e.map(o=>{var s,n,i,c;return`<option value="${esc(o.id)}" ${(t==null?void 0:t.tx_id)===o.id?"selected":""}>${esc(o.number)} ? ${esc(((n=(s=o.expand)==null?void 0:s.tx_type_id)==null?void 0:n.name)||"")} | ${esc(((c=(i=o.expand)==null?void 0:i.third_party_id)==null?void 0:c.name)||"Sin tercero")}</option>`}).join("")}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Estado</label>
        <select id="df-status" class="form-input" ${(t==null?void 0:t.status)==="aceptada"||(t==null?void 0:t.status)==="rechazada"?"disabled":""}>
          ${["pendiente","enviada","aceptada","rechazada"].map(o=>`<option value="${o}" ${((t==null?void 0:t.status)||"pendiente")===o?"selected":""}>${o.charAt(0).toUpperCase()+o.slice(1)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Fecha Env?o</label><input id="df-sent" type="date" class="form-input" value="${esc(((t==null?void 0:t.sent_at)||"").slice(0,10))}"></div>
      <div class="form-group md:col-span-2"><label class="form-label">CUFE</label><input id="df-cufe" class="form-input font-mono text-xs" placeholder="Se genera autom?ticamente al enviar" value="${esc((t==null?void 0:t.cufe)||"")}"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Respuesta DIAN</label><textarea id="df-resp" class="form-input" rows="3">${esc((t==null?void 0:t.dian_response)||"")}</textarea></div>
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-dian">Guardar</button>'),(a=$("#btn-save-dian"))==null||a.addEventListener("click",async()=>{var s,n;const o=$("#btn-save-dian");o&&(o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const i={tx_id:(t==null?void 0:t.tx_id)||getSelectVal("df-tx"),cufe:getInputVal("df-cufe"),status:getSelectVal("df-status")||(t==null?void 0:t.status)||"pendiente",dian_response:getInputVal("df-resp"),sent_at:getInputVal("df-sent")||""};if(!i.tx_id)return showToast("Selecciona una transacci?n","warning");if(!(t!=null&&t.id)&&(s=(await pb.list("einvoice_docs",{filter:`tx_id="${i.tx_id}"`,perPage:1})).items)!=null&&s.length)return showToast("Esta transaccion ya tiene documento DIAN asociado. Usa editar.","warning");if(t!=null&&t.id)await pb.update("einvoice_docs",t.id,i);else{const c=await pb.create("einvoice_docs",i)}closeModal(),showToast("Documento DIAN guardado","success"),Xo($("#page-content"))}catch(i){const c=(n=i==null?void 0:i.data)!=null&&n.data?Object.values(i.data.data).map(r=>r==null?void 0:r.message).filter(Boolean).join(" | "):"";showToast(c||i.message||"No se pudo guardar el documento DIAN","error")}finally{o&&(o.disabled=!1,o.innerHTML="Guardar")}})}async function Br(e){try{const[t,a]=await Promise.all([pb.get("einvoice_docs",e),pb.listAll("transactions",{sort:"-date,-created",filter:'status="active"',expand:"tx_type_id,third_party_id"})]);es(a,t)}catch(t){showToast(t.message,"error")}}window.setDianStatus=Mr;window.filterDianByStatus=Or;window.generateMockCufe=Qn;window.viewDianDetail=kr;window.editDianDoc=Br;window.openDianForm=es;window.renderFacturacionDIAN=Xo;const ze="periodos_cierre";async function Ua(e){var t,a,o,s,n;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando asistente de cierre...</div>';try{const[i,c]=await Promise.all([API.getAccounts(!1),API.getAccountSaldos()]),r=await API.getSetting(ze),l=r?JSON.parse(r):[],p={};for(const C of i){const T=(C.code||"").charAt(0);p[T]||(p[T]=0),p[T]+=Number(c[C.id]||0)}const f=Math.abs(p[4]||0),m=Math.abs(p[5]||0)+Math.abs(p[6]||0)+Math.abs(p[7]||0),d=f-m,b=new Set(l.filter(C=>C.closed).map(C=>C.key)),u=new Date().getFullYear(),y=new Date().getMonth()+1,v=`${u}-${String(y).padStart(2,"0")}`,g=b.has(v),_=!!l.find(C=>C.key===v),A=C=>C.closed?'<span class="badge badge-red"><i class="fas fa-lock mr-1"></i>Cerrado</span>':'<span class="badge badge-green"><i class="fas fa-lock-open mr-1"></i>Habilitado</span>';e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Asistente de Cierre Contable</h3>
          <p class="text-sm" style="color:#6B7280">Gestion de Periodos, asientos de cierre y bloqueo de transacciones.</p>
        </div>
        ${can("canWrite")?`
          <div class="flex gap-2 flex-wrap">
            <button class="btn btn-outline" id="btn-enable-period"><i class="fas fa-calendar-plus"></i> Habilitar Período</button>
            <button class="btn btn-primary" id="btn-new-cierre"><i class="fas fa-calendar-check"></i> Realizar Cierre</button>
          </div>`:""}
      </div>

      <!-- Resumen del Periodo actual -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div class="rounded-2xl p-4 border" style="background:#F0F7FF;border-color:#BFDBFE">
          <div class="text-xs font-medium mb-1" style="color:#1D4ED8">Periodo Actual</div>
          <div class="text-lg font-bold" style="color:#1A4B8C">${v}</div>
          <div class="mt-1">${A(g)}</div>
        </div>
        <div class="rounded-2xl p-4 border" style="background:#F0FFF4;border-color:#BBF7D0">
          <div class="text-xs font-medium mb-1" style="color:#15803D">Total Ingresos (Cl.4)</div>
          <div class="text-lg font-bold" style="color:#15803D">${fmt(f)}</div>
        </div>
        <div class="rounded-2xl p-4 border" style="background:#FEF2F2;border-color:#FECACA">
          <div class="text-xs font-medium mb-1" style="color:#B91C1C">Total Gastos (Cl.5/6/7)</div>
          <div class="text-lg font-bold" style="color:#B91C1C">${fmt(m)}</div>
        </div>
        <div class="rounded-2xl p-4 border" style="${d>=0?"background:#F0FFF4;border-color:#BBF7D0":"background:#FEF2F2;border-color:#FECACA"}">
          <div class="text-xs font-medium mb-1" style="color:${d>=0?"#15803D":"#B91C1C"}">${d>=0?"Utilidad":"Perdida"} del Periodo</div>
          <div class="text-lg font-bold" style="color:${d>=0?"#15803D":"#B91C1C"}">${fmt(Math.abs(d))}</div>
        </div>
      </div>

      <!-- Estado del Periodo actual -->
      ${_?g?`<div class="mb-4 p-4 rounded-2xl border flex items-center gap-3" style="background:#FEF2F2;border-color:#FECACA">
            <i class="fas fa-lock text-xl" style="color:#B91C1C"></i>
            <div>
              <p class="font-semibold" style="color:#B91C1C">Período ${v} CERRADO</p>
              <p class="text-sm" style="color:#6B7280">No se pueden crear ni anular transacciones en este período.</p>
            </div>
            ${can("canWrite")?`<button class="btn btn-outline btn-sm ml-auto" onclick="reOpenPeriod('${v}')"><i class="fas fa-lock-open"></i> Re-abrir</button>`:""}
          </div>`:`<div class="mb-4 p-4 rounded-2xl border flex items-center gap-3" style="background:#F0FFF4;border-color:#BBF7D0">
            <i class="fas fa-lock-open text-xl" style="color:#15803D"></i>
            <div>
              <p class="font-semibold" style="color:#15803D">Período ${v} HABILITADO</p>
              <p class="text-sm" style="color:#6B7280">El período actual acepta nuevas transacciones.</p>
            </div>
          </div>`:`<div class="mb-4 p-4 rounded-2xl border flex items-center gap-3" style="background:#FFF8F0;border-color:#FED7AA">
            <i class="fas fa-triangle-exclamation text-xl" style="color:#C46516"></i>
            <div>
              <p class="font-semibold" style="color:#C46516">Período ${v} no está habilitado</p>
              <p class="text-sm" style="color:#6B7280">No se pueden registrar transacciones en este mes hasta que el administrador lo habilite.</p>
            </div>
            ${can("canWrite")?'<button class="btn btn-primary btn-sm ml-auto" id="btn-enable-period-inline"><i class="fas fa-calendar-plus"></i> Habilitar ahora</button>':""}
          </div>`}

      <!-- Historial de Periodos -->
      <div class="bg-white rounded-2xl border overflow-hidden mb-4" style="border-color:#F0F0F0">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:#F3F4F6">
          <h4 class="font-bold" style="color:#0D2137">Períodos Registrados</h4>
          <span class="text-xs" style="color:#9CA3AF">${l.length} período(s) — solo estos aceptan transacciones</span>
        </div>
        ${l.length?`
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Período</th><th>Estado</th><th>Habilitado Por</th><th>Fecha Habilitación</th><th>Fecha Cierre</th><th>Utilidad Registrada</th><th>Nota</th><th>Acciones</th></tr></thead>
            <tbody>
              ${[...l].reverse().map(C=>`
                <tr>
                  <td class="font-mono font-semibold">${esc(C.key)}</td>
                  <td>${A(C)}</td>
                  <td class="text-sm" style="color:#6B7280">${esc(C.enabledBy||C.closedBy||"—")}</td>
                  <td class="text-sm" style="color:#6B7280">${esc(C.enabledAt||"—")}</td>
                  <td>${esc(C.closedAt||"—")}</td>
                  <td class="font-semibold" style="color:${(C.utilidad||0)>=0?"#15803D":"#B91C1C"}">${fmt(C.utilidad||0)}</td>
                  <td class="text-sm" style="color:#6B7280">${esc(C.note||"—")}</td>
                  <td>
                    <div class="flex gap-1">
                      ${C.closed&&can("canWrite")?`<button class="btn btn-outline btn-sm" title="Re-abrir período" onclick="reOpenPeriod('${esc(C.key)}')"><i class="fas fa-lock-open"></i></button>`:""}
                      ${!C.closed&&can("canWrite")?`<button class="btn btn-danger btn-sm" title="Cerrar período" onclick="closePeriod('${esc(C.key)}')"><i class="fas fa-lock"></i></button>`:""}
                    </div>
                  </td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>`:`
          <div class="p-8 text-center">
            <i class="fas fa-calendar-xmark text-3xl mb-3" style="color:#D1D5DB"></i>
            <p class="font-semibold" style="color:#374151">No hay períodos habilitados</p>
            <p class="text-sm mt-1 mb-4" style="color:#9CA3AF">Habilita al menos el período actual para comenzar a registrar transacciones.</p>
            ${can("canWrite")?'<button class="btn btn-primary" id="btn-enable-period-empty"><i class="fas fa-calendar-plus"></i> Habilitar Período Actual</button>':""}
          </div>`}
      </div>

      <!-- Asientos de cierre -->
      <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
        <h4 class="font-bold mb-3" style="color:#0D2137">Asientos de Cierre Sugeridos</h4>
        <p class="text-sm mb-4" style="color:#6B7280">Al cerrar el Periodo, el asistente genera automaticamente los asientos de traslado de ingresos y gastos a la cuenta de resultados (Clase 3).</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${f>0?`<div class="rounded-xl p-4 border" style="background:#F0FFF4;border-color:#BBF7D0">
                <p class="text-xs font-semibold mb-2" style="color:#15803D">1. Cierre de Ingresos (Cl.4 ? Cl.3)</p>
                <p class="text-sm" style="color:#374151">Debito cuentas de ingreso: <strong>${fmt(f)}</strong></p>
                <p class="text-sm" style="color:#374151">Credito resultado del ejercicio: <strong>${fmt(f)}</strong></p>
              </div>`:""}
          ${m>0?`<div class="rounded-xl p-4 border" style="background:#FEF2F2;border-color:#FECACA">
                <p class="text-xs font-semibold mb-2" style="color:#B91C1C">2. Cierre de Gastos (Cl.3 ? Cl.5/6)</p>
                <p class="text-sm" style="color:#374151">Debito resultado del ejercicio: <strong>${fmt(m)}</strong></p>
                <p class="text-sm" style="color:#374151">Credito cuentas de gasto: <strong>${fmt(m)}</strong></p>
              </div>`:""}
        </div>
        ${can("canWrite")&&!g?'<div class="mt-4"><button class="btn btn-primary" id="btn-gen-cierre-entries"><i class="fas fa-magic"></i> Generar Asiento de Cierre</button></div>':""}
      </div>`,(t=$("#btn-new-cierre"))==null||t.addEventListener("click",()=>ts(l,d)),(a=$("#btn-enable-period"))==null||a.addEventListener("click",()=>_a(l)),(o=$("#btn-enable-period-inline"))==null||o.addEventListener("click",()=>_a(l)),(s=$("#btn-enable-period-empty"))==null||s.addEventListener("click",()=>_a(l)),(n=$("#btn-gen-cierre-entries"))==null||n.addEventListener("click",()=>Zn(i,c,d))}catch(i){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(i.message)}</div>`}}function ts(e,t){var s;const a=new Date,o=`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}`;openModal("Realizar Cierre Contable",`<div class="space-y-4">
      <div class="p-4 rounded-xl border" style="background:#FFF8F0;border-color:#FED7AA">
        <p class="text-sm font-semibold" style="color:#C46516"><i class="fas fa-triangle-exclamation mr-2"></i>Accion importante</p>
        <p class="text-sm mt-1" style="color:#374151">El cierre bloquea la creacion de nuevas transacciones en el Periodo seleccionado. Esta Accion se puede revertir si es necesario.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Periodo a Cerrar (YYYY-MM)</label>
          <input id="cierre-key" class="form-input font-mono" placeholder="Ej: 2026-05" value="${o}" pattern="\\d{4}-\\d{2}">
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de Cierre</label>
          <input id="cierre-date" type="date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group md:col-span-2">
          <label class="form-label">Nota del Cierre</label>
          <textarea id="cierre-note" class="form-input" rows="2" placeholder="Observaciones del cierre..."></textarea>
        </div>
      </div>
      <div class="p-3 rounded-xl text-sm" style="background:#F0FFF4;border:1px solid #BBF7D0">
        <strong>Resultado del Periodo:</strong> Utilidad / (Perdida) = <strong>${fmt(t)}</strong>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-danger" id="btn-confirm-cierre"><i class="fas fa-lock"></i> Confirmar Cierre</button>`),(s=$("#btn-confirm-cierre"))==null||s.addEventListener("click",async()=>{var r,l;const n=getInputVal("cierre-key").trim(),i=getInputVal("cierre-date"),c=getInputVal("cierre-note").trim();if(!n||!/^\d{4}-\d{2}$/.test(n))return showToast("El Periodo debe tener formato YYYY-MM","warning");if(!i)return showToast("Ingresa la fecha de cierre","warning");if(e.find(p=>p.key===n&&p.closed))return showToast(`El Periodo ${n} ya esta cerrado`,"warning");try{const p=e.find(d=>d.key===n),f={key:n,enabled:!0,closed:!0,closedAt:i,closedBy:((r=pb.currentUser)==null?void 0:r.email)||"admin",enabledAt:(p==null?void 0:p.enabledAt)||i,enabledBy:(p==null?void 0:p.enabledBy)||((l=pb.currentUser)==null?void 0:l.email)||"admin",note:c,utilidad:t};let m;p?m=e.map(d=>d.key===n?f:d):m=[...e,f],await API.setSetting(ze,JSON.stringify(m)),closeModal(),showToast(`Periodo ${n} cerrado correctamente`,"success"),Ua($("#page-content"))}catch(p){showToast(p.message,"error")}})}async function Ur(e){const t=await API.getSetting(ze),a=t?JSON.parse(t):[],[o,s]=await Promise.all([API.getAccounts(!1),API.getAccountSaldos()]),n={};for(const c of o){const r=(c.code||"").charAt(0);n[r]=(n[r]||0)+Number(s[c.id]||0)}const i=Math.abs(n[4]||0)-(Math.abs(n[5]||0)+Math.abs(n[6]||0)+Math.abs(n[7]||0));ts(a,i),setTimeout(()=>{const c=$("#cierre-key");c&&(c.value=e)},100)}async function Vr(e){confirmDialog("Re-abrir Periodo",`Confirmas re-abrir el Periodo ${e}? Las transacciones volveran a ser posibles.`,async()=>{try{const t=await API.getSetting(ze),o=(t?JSON.parse(t):[]).map(s=>s.key===e?{...s,enabled:!0,closed:!1,closedAt:null}:s);await API.setSetting(ze,JSON.stringify(o)),showToast(`Periodo ${e} re-abierto`,"success"),Ua($("#page-content"))}catch(t){showToast(t.message,"error")}})}async function Zn(e,t,a){var c;if(!can("canWrite"))return showToast("Sin permisos para generar asientos","error");const o=e.filter(r=>(r.code||"").startsWith("3")),s=o.find(r=>r.code==="360505"||r.code==="36050501")||o.find(r=>r.code.startsWith("360")||r.code.startsWith("36"))||o.find(r=>!r.parent_code);if(!s)return showToast("no se encontro la cuenta de Resultado del Ejercicio (Clase 3). Creala en el Plan de Cuentas.","error");const n=e.filter(r=>(r.code||"").startsWith("4")&&Math.abs(Number(t[r.id]||0))>.001),i=e.filter(r=>["5","6","7"].includes((r.code||"").charAt(0))&&Math.abs(Number(t[r.id]||0))>.001);if(!n.length&&!i.length)return showToast("No hay saldos de ingresos ni gastos para cerrar.","warning");openModal("Asiento de Cierre - Vista Previa",`<div class="space-y-4 text-sm">
      <p style="color:#6B7280">Se generaran los siguientes comprobantes contables de cierre:</p>
      <div class="overflow-x-auto">
        <table class="data-table text-xs">
          <thead><tr><th>Cuenta</th><th>Descripcion</th><th>Debito</th><th>Credito</th></tr></thead>
          <tbody>
            ${n.map(r=>{const l=Math.abs(Number(t[r.id]||0));return`<tr><td class="font-mono">${esc(r.code)}</td><td>${esc(r.name)}</td><td>${fmt(l)}</td><td></td></tr>`}).join("")}
            <tr style="background:#F0FFF4"><td class="font-mono">${esc(s.code)}</td><td>${esc(s.name)} (Ingresos)</td><td></td><td>${fmt(Math.abs(Xn(e,t)))}</td></tr>
            ${i.map(r=>{const l=Math.abs(Number(t[r.id]||0));return`<tr><td class="font-mono">${esc(r.code)}</td><td>${esc(r.name)}</td><td></td><td>${fmt(l)}</td></tr>`}).join("")}
            <tr style="background:#FEF2F2"><td class="font-mono">${esc(s.code)}</td><td>${esc(s.name)} (Gastos)</td><td>${fmt(ei(e,t))}</td><td></td></tr>
          </tbody>
        </table>
      </div>
      <p class="p-3 rounded-xl font-semibold text-center" style="background:${a>=0?"#F0FFF4":"#FEF2F2"};color:${a>=0?"#15803D":"#B91C1C"}">
        Resultado neto a trasladar: ${fmt(Math.abs(a))} - ${a>=0?"UTILIDAD":"Perdida"}
      </p>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-post-cierre"><i class="fas fa-floppy-disk"></i> Contabilizar Asiento</button>`),(c=$("#btn-post-cierre"))==null||c.addEventListener("click",async()=>{var r;try{const l=await API.getTxTypes(),p=l.find(u=>{var y;return u.prefix==="CM"||((y=u.name)==null?void 0:y.toLowerCase().includes("cierre"))})||l[0];if(!p)return showToast("No hay tipo de transaccion para el asiento de cierre","error");const f=[];n.forEach(u=>{const y=Math.abs(Number(t[u.id]||0));f.push({account_id:u.id,debit:y,credit:0,description:"Cierre de ingresos",line_order:f.length+1})});const m=n.reduce((u,y)=>u+Math.abs(Number(t[y.id]||0)),0);m>0&&f.push({account_id:s.id,debit:0,credit:m,description:"Traslado de ingresos al resultado",line_order:f.length+1}),i.forEach(u=>{const y=Math.abs(Number(t[u.id]||0));f.push({account_id:u.id,debit:0,credit:y,description:"Cierre de gastos",line_order:f.length+1})});const d=i.reduce((u,y)=>u+Math.abs(Number(t[y.id]||0)),0);d>0&&f.push({account_id:s.id,debit:d,credit:0,description:"Traslado de gastos al resultado",line_order:f.length+1});const b=await API.createTransaction({tx_type_id:p.id,number:"",date:todayStr(),description:`Asiento de cierre ${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`,user_id:(r=pb.currentUser)==null?void 0:r.id,status:"active"},f);closeModal(),showToast(`Asiento de cierre ${b.number} contabilizado. Revisalo en Consulta de Transacciones.`,"success")}catch(l){showToast(l.message,"error")}})}function Xn(e,t){return e.filter(a=>(a.code||"").startsWith("4")).reduce((a,o)=>a+Math.abs(Number(t[o.id]||0)),0)}function ei(e,t){return e.filter(a=>["5","6","7"].includes((a.code||"").charAt(0))).reduce((a,o)=>a+Math.abs(Number(t[o.id]||0)),0)}function _a(e){var o;if(!can("canWrite"))return showToast("No tienes permisos para habilitar períodos","error");const t=new Date,a=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`;openModal('<i class="fas fa-calendar-plus mr-2" style="color:#1A4B8C"></i>Habilitar Período',`<div class="space-y-4">
      <div class="p-4 rounded-xl border" style="background:#EFF6FF;border-color:#BFDBFE">
        <p class="text-sm font-semibold" style="color:#1D4ED8"><i class="fas fa-info-circle mr-2"></i>¿Qué significa habilitar un período?</p>
        <p class="text-sm mt-1" style="color:#374151">Solo los períodos habilitados permiten registrar transacciones. Esto evita digitaciones accidentales en fechas pasadas o futuras no autorizadas.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Período a Habilitar (YYYY-MM)</label>
          <input id="enable-key" class="form-input font-mono" placeholder="Ej: 2026-05" value="${a}" pattern="\\d{4}-\\d{2}">
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de Habilitación</label>
          <input id="enable-date" type="date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group md:col-span-2">
          <label class="form-label">Nota (opcional)</label>
          <textarea id="enable-note" class="form-input" rows="2" placeholder="Ej: Habilitado para digitación del mes de mayo 2026..."></textarea>
        </div>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-confirm-enable"><i class="fas fa-calendar-check"></i> Habilitar Período</button>`),(o=$("#btn-confirm-enable"))==null||o.addEventListener("click",async()=>{var r;const s=getInputVal("enable-key").trim(),n=getInputVal("enable-date"),i=getInputVal("enable-note").trim();if(!s||!/^\d{4}-\d{2}$/.test(s))return showToast("El período debe tener formato YYYY-MM","warning");if(!n)return showToast("Ingresa la fecha de habilitación","warning");const c=Number(s.split("-")[1]);if(c<1||c>12)return showToast("Mes inválido en el período","warning");if(e.find(l=>l.key===s))return showToast(`El período ${s} ya está registrado en el sistema`,"warning");try{const l={key:s,enabled:!0,closed:!1,enabledAt:n,enabledBy:((r=pb.currentUser)==null?void 0:r.email)||"admin",closedAt:null,closedBy:null,note:i,utilidad:0},p=[...e,l].sort((f,m)=>f.key.localeCompare(m.key));await API.setSetting(ze,JSON.stringify(p)),closeModal(),showToast(`Período ${s} habilitado correctamente para digitación`,"success"),Ua($("#page-content"))}catch(l){showToast(l.message,"error")}})}async function jr(e){try{const t=await API.getSetting(ze);if(!t)return!0;const a=JSON.parse(t),o=(e||"").slice(0,7),s=a.find(n=>n.key===o);return!!(!s||s.closed)}catch{return!1}}async function Hr(e){try{const t=await API.getSetting(ze);if(!t)return!1;const a=JSON.parse(t),o=(e||"").slice(0,7);return a.some(s=>s.key===o)}catch{return!1}}window.openEnablePeriodForm=_a;window.reOpenPeriod=Vr;window.closePeriod=Ur;window.isPeriodRegistered=Hr;window.CIERRE_SETTING_KEY=ze;window.generateCierreEntries=Zn;window.isPeriodClosed=jr;window.openCierreForm=ts;window.byClass4=Xn;window.gastoTotal=ei;window.renderCierre=Ua;const ti=[{name:"settings",label:"Configuración"},{name:"account_types",label:"Tipos de cuenta"},{name:"accounts",label:"Plan de cuentas"},{name:"third_parties",label:"Terceros"},{name:"transaction_types",label:"Tipos de transacción"},{name:"transactions",label:"Transacciones"},{name:"tx_lines",label:"Líneas de transacción"},{name:"bank_accounts",label:"Cuentas bancarias"},{name:"bank_movements",label:"Movimientos bancarios"},{name:"payroll_periods",label:"Períodos de nómina"},{name:"payroll_employees",label:"Empleados de nómina"},{name:"payroll_items",label:"Ítems de nómina"},{name:"audit_log",label:"Auditoría"}],as="2.0";let zt=!1,Wt=!1,Yt=!1,wt=!1,nt=!1,Et=!1;async function Gr(e){var t,a,o,s,n,i,c,r,l,p,f;e.innerHTML=`
    <div class="anim-slide-up">
      <!-- Cabecera -->
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
             style="background:linear-gradient(135deg,#E87D1E,#C46516)">
          <i class="fas fa-toolbox text-white text-xl"></i>
        </div>
        <div>
          <h2 class="text-xl font-extrabold" style="color:#0D2137">Utilidades</h2>
          <p class="text-sm" style="color:#6B7280">Herramientas de administración y mantenimiento del sistema</p>
        </div>
      </div>

      <!-- Grid de tarjetas de utilidades -->
      <div class="grid gap-6" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">

        <!-- ── Tarjeta: Backup ──────────────────────────── -->
        <div class="stat-card blue" id="util-card-backup">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(46,107,166,.12)">
                <i class="fas fa-database" style="color:#1A4B8C;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Respaldo de datos</h3>
                <p class="text-xs" style="color:#6B7280">Exportar e importar toda la información</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Genera un archivo de respaldo completo con todos los datos del sistema en formato JSON.
            El archivo puede usarse para restaurar la información en caso de pérdida o migración.
          </p>

          <!-- Info última copia -->
          <div id="backup-last-info" class="hidden mb-4 p-3 rounded-lg text-xs"
               style="background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF">
            <i class="fas fa-clock-rotate-left mr-1"></i>
            <span id="backup-last-text"></span>
          </div>

          <!-- Barra de progreso -->
          <div id="backup-progress-wrap" class="hidden mb-4">
            <div class="flex justify-between text-xs mb-1" style="color:#6B7280">
              <span id="backup-progress-label">Preparando...</span>
              <span id="backup-progress-pct">0%</span>
            </div>
            <div class="w-full rounded-full h-2" style="background:#E5E7EB">
              <div id="backup-progress-bar" class="h-2 rounded-full transition-all"
                   style="background:linear-gradient(90deg,#2E6BA6,#E87D1E);width:0%"></div>
            </div>
          </div>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-backup-create" class="btn btn-secondary btn-sm">
              <i class="fas fa-download"></i> Crear respaldo
            </button>
            <button id="btn-backup-restore" class="btn btn-outline btn-sm">
              <i class="fas fa-upload"></i> Restaurar respaldo
            </button>
          </div>
          <!-- Input oculto para selección de archivo -->
          <input type="file" id="backup-file-input" accept=".json" class="hidden">
        </div>

        <!-- ── Tarjeta: Información del sistema ─────────── -->
        <div class="stat-card orange" id="util-card-sysinfo">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 style="background:rgba(232,125,30,.12)">
              <i class="fas fa-circle-info" style="color:#C46516;font-size:18px"></i>
            </div>
            <div>
              <h3 class="font-bold text-base" style="color:#0D2137">Información del sistema</h3>
              <p class="text-xs" style="color:#6B7280">Estado y estadísticas generales</p>
            </div>
          </div>
          <div id="sysinfo-content">
            <div class="flex items-center gap-2 text-sm" style="color:#9CA3AF">
              <i class="fas fa-spinner fa-spin"></i> Cargando...
            </div>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de transacciones ───── -->
        <div class="stat-card green" id="util-card-mass-tx">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(16,185,129,.12)">
                <i class="fas fa-file-import" style="color:#059669;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de transacciones</h3>
                <p class="text-xs" style="color:#6B7280">Importa comprobantes contables desde CSV o Excel</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Registra comprobantes en lote usando una plantilla estandar. El sistema valida período,
            cuentas de movimiento, tercero obligatorio y balance débito/crédito antes de grabar.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-tx-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-tx-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de cuentas ─────────── -->
        <div class="stat-card purple" id="util-card-mass-acc">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(124,58,237,.12)">
                <i class="fas fa-list-tree" style="color:#6D28D9;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de cuentas</h3>
                <p class="text-xs" style="color:#6B7280">Importa el plan de cuentas desde CSV o Excel</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Crea o actualiza cuentas en lote usando una plantilla estándar. Si el código ya existe
            la cuenta se actualiza; si no existe, se crea automáticamente.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-acc-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-acc-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de terceros ────────── -->
        <div class="stat-card red" id="util-card-mass-tp">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(59,130,246,.12)">
                <i class="fas fa-users" style="color:#1D4ED8;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de terceros</h3>
                <p class="text-xs" style="color:#6B7280">Importa clientes, proveedores y más desde CSV o Excel</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Registra terceros en lote usando una plantilla estándar. El sistema valida documento,
            nombre y tipo antes de grabar. Los duplicados (mismo NIT/documento) se actualizan.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-tp-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-tp-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de unidades PH ─────── -->
        <div class="stat-card blue" id="util-card-mass-ph-units">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(14,116,144,.12)">
                <i class="fas fa-building-user" style="color:#0E7490;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de unidades PH</h3>
                <p class="text-xs" style="color:#6B7280">Importa unidades habitacionales de copropiedades</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Crea o actualiza unidades en lote para el módulo de Copropiedades. Si el código ya existe,
            la unidad se actualiza; si no existe, se crea automáticamente.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-ph-units-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-ph-units-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

      </div>
    </div>`,zt=!1,Wt=!1,Yt=!1,wt=!1,nt=!1,Et=!1,os(),Mt(),(t=$("#btn-backup-create"))==null||t.addEventListener("click",ai),(a=$("#btn-backup-restore"))==null||a.addEventListener("click",()=>{var m;return(m=$("#backup-file-input"))==null?void 0:m.click()}),(o=$("#backup-file-input"))==null||o.addEventListener("change",oi),(s=$("#btn-mass-tx-template"))==null||s.addEventListener("click",ni),(n=$("#btn-mass-tx-open"))==null||n.addEventListener("click",ii),(i=$("#btn-mass-tp-template"))==null||i.addEventListener("click",di),(c=$("#btn-mass-tp-open"))==null||c.addEventListener("click",pi),(r=$("#btn-mass-acc-template"))==null||r.addEventListener("click",ss),(l=$("#btn-mass-acc-open"))==null||l.addEventListener("click",gi),(p=$("#btn-mass-ph-units-template"))==null||p.addEventListener("click",ns),(f=$("#btn-mass-ph-units-open"))==null||f.addEventListener("click",hi)}function os(){const e=localStorage.getItem("gravy_last_backup")||localStorage.getItem("contaco_last_backup");if(e)try{const t=JSON.parse(e),a=$("#backup-last-info"),o=$("#backup-last-text");a&&o&&(o.textContent=`Último respaldo: ${t.label} — ${t.records} registros`,a.classList.remove("hidden"))}catch{}}async function Mt(){const e=$("#sysinfo-content");if(!e)return;const t=await Promise.all(["accounts","third_parties","transactions","tx_lines"].map(async o=>{try{const s=await pb.list(o,{perPage:1,page:1});return{col:o,total:s.totalItems}}catch{return{col:o,total:"—"}}})),a={accounts:"Cuentas contables",third_parties:"Terceros",transactions:"Transacciones",tx_lines:"Líneas contables"};e.innerHTML=t.map(o=>`
    <div class="flex items-center justify-between py-2 border-b last:border-0" style="border-color:#F3F4F6">
      <span class="text-sm" style="color:#374151">${a[o.col]}</span>
      <span class="font-bold text-sm" style="color:#E87D1E">${typeof o.total=="number"?o.total.toLocaleString("es-CO"):o.total}</span>
    </div>
  `).join("")+`
    <div class="flex items-center justify-between pt-3 mt-1">
      <span class="text-xs" style="color:#9CA3AF">Versión GRAVY</span>
      <span class="badge badge-orange">v${as}</span>
    </div>`}async function ai(){var l;if(zt)return;zt=!0;const e=$("#btn-backup-create");e&&(e.disabled=!0,e.innerHTML='<i class="fas fa-spinner fa-spin"></i> Generando...');const t=$("#backup-progress-wrap"),a=$("#backup-progress-bar"),o=$("#backup-progress-label"),s=$("#backup-progress-pct");t&&t.classList.remove("hidden");const n=(p,f)=>{o&&(o.textContent=p),a&&(a.style.width=`${f}%`),s&&(s.textContent=`${Math.round(f)}%`)},i=ti.filter(p=>!(p.name==="audit_log"&&!can("canViewAudit"))),c={_meta:{version:as,created_at:new Date().toISOString(),app:"GRAVY",user:((l=pb.currentUser)==null?void 0:l.email)??"desconocido"},collections:{}};let r=0;try{for(let y=0;y<i.length;y++){const v=i[y],g=y/i.length*95;n(`Exportando: ${v.label}...`,g);try{const h=await pb.listAll(v.name);c.collections[v.name]=h,r+=h.length}catch(h){c.collections[v.name]=[],console.warn(`[Backup] Colección omitida (${v.name}):`,h.message)}}n("Generando archivo...",97);const p=JSON.stringify(c,null,2),f=new Blob([p],{type:"application/json"}),m=URL.createObjectURL(f),d=document.createElement("a"),b=new Date().toISOString().slice(0,16).replace("T","_").replace(":","-");d.href=m,d.download=`GRAVY_backup_${b}.json`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(m),n("Completado",100);const u=JSON.stringify({label:new Date().toLocaleString("es-CO",{dateStyle:"short",timeStyle:"short"}),records:r});localStorage.setItem("gravy_last_backup",u),os(),await API.logAudit("BACKUP_CREATED","sistema",null,`Respaldo manual: ${r} registros exportados`),showToast(`Respaldo creado exitosamente — ${r.toLocaleString("es-CO")} registros`,"success")}catch(p){showToast(`Error al generar respaldo: ${p.message}`,"error"),console.error("[Backup]",p)}finally{zt=!1,e&&(e.disabled=!1,e.innerHTML='<i class="fas fa-download"></i> Crear respaldo'),t&&setTimeout(()=>t==null?void 0:t.classList.add("hidden"),2e3)}}async function oi(e){var i,c;const t=(i=e.target.files)==null?void 0:i[0];if(!t)return;if(e.target.value="",!can("canWrite")||!can("canDelete")){showToast("No tienes permiso para restaurar un respaldo","error");return}let a;try{const r=await t.text();a=JSON.parse(r)}catch{showToast("El archivo no es un respaldo válido (JSON malformado)","error");return}if(!((c=a._meta)!=null&&c.version)||!a.collections){showToast("El archivo no corresponde a un respaldo de GRAVY","error");return}const o=a._meta,s=Object.keys(a.collections).length,n=Object.values(a.collections).reduce((r,l)=>r+((l==null?void 0:l.length)??0),0);Bt("Confirmar restauración",`
    <div class="flex flex-col gap-4">
      <div class="p-4 rounded-xl" style="background:#FEF3C7;border:1px solid #FCD34D">
        <div class="flex items-start gap-3">
          <i class="fas fa-triangle-exclamation mt-0.5" style="color:#D97706;font-size:18px"></i>
          <div>
            <p class="font-bold text-sm mb-1" style="color:#92400E">Advertencia: esta acción no se puede deshacer</p>
            <p class="text-sm" style="color:#78350F;line-height:1.6">
              La restauración <strong>reemplazará</strong> los datos existentes con los del respaldo.
              Los registros actuales que no existan en el respaldo <strong>no serán eliminados</strong>.
            </p>
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4" style="background:#F8F9FB;border:1px solid #E5E7EB">
        <p class="text-xs font-bold uppercase mb-3" style="color:#6B7280;letter-spacing:.5px">Detalles del respaldo</p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <span style="color:#6B7280">Versión:</span><strong style="color:#0D2137">${esc(o.version)}</strong>
          <span style="color:#6B7280">Fecha:</span><strong style="color:#0D2137">${esc(new Date(o.created_at).toLocaleString("es-CO"))}</strong>
          <span style="color:#6B7280">Generado por:</span><strong style="color:#0D2137">${esc(o.user)}</strong>
          <span style="color:#6B7280">Colecciones:</span><strong style="color:#0D2137">${s}</strong>
          <span style="color:#6B7280">Registros totales:</span><strong style="color:#E87D1E">${n.toLocaleString("es-CO")}</strong>
        </div>
      </div>
      <p class="text-sm text-center" style="color:#374151">¿Deseas continuar con la restauración?</p>
    </div>`,[{label:"Cancelar",class:"btn-outline",action:()=>closeModal()},{label:"Restaurar",class:"btn-danger",action:()=>si(a)}])}async function si(e){if(Wt)return;Wt=!0,closeModal(),showToast("Iniciando restauración...","info");const t=["settings","account_types","accounts","third_parties","transaction_types","transactions","tx_lines","bank_accounts","bank_movements","payroll_periods","payroll_employees","payroll_items"];let a=0,o=0,s=0;for(const i of t){const c=e.collections[i];if(!(!Array.isArray(c)||c.length===0))for(const r of c)try{try{await pb.update(i,r.id,r)}catch(l){if(l.status===404)await pb.create(i,r);else throw l}a++}catch(l){o++,l.status!==400&&s++,console.warn(`[Restore] ${i}/${r.id}:`,l.message)}}await API.logAudit("BACKUP_RESTORED","sistema",null,`Restauración desde respaldo: ${a} restaurados, ${o} omitidos`);const n=`Restauración completada — ${a} registros restaurados, ${o} omitidos`;showToast(n,s>10?"warning":"success"),Wt=!1,Mt()}function ni(){const e=["grupo","fecha","tipo","descripcion","tercero","plazo_dias","cuenta","debito","credito","tercero_linea","descripcion_linea","doc_cruce"].join(","),t=["CMP-001,2026-05-01,RC,Registro recaudo factura FV-1001,900123456,0,111005,1500000,0,900123456,Ingreso por recaudo,FV-1001","CMP-001,2026-05-01,RC,Registro recaudo factura FV-1001,900123456,0,130505,0,1500000,900123456,Cruce cartera cliente,FV-1001","CMP-002,2026-05-02,CE,Pago proveedor factura FC-888,901234567,30,220501,450000,0,901234567,Cruce CxP proveedor,FC-888","CMP-002,2026-05-02,CE,Pago proveedor factura FC-888,901234567,30,111005,0,450000,901234567,Salida de caja,FC-888"].join(`
`),a=new Blob([`${e}
${t}`],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_carga_transacciones.csv",s.click(),URL.revokeObjectURL(o)}async function ii(){if(!can("canWrite"))return showToast("No tienes permisos para importar transacciones","error");Bt('<i class="fas fa-file-import mr-2" style="color:#059669"></i>Carga masiva de transacciones',`
    <div class="mb-2">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx/.xls)</strong> con líneas contables agrupadas por comprobante.
        Cada <strong>grupo</strong> representa un comprobante y debe quedar cuadrado (débito = crédito).
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#ECFDF5;border:1px solid #A7F3D0">
        <p class="text-xs font-semibold mb-1" style="color:#047857;text-transform:uppercase;letter-spacing:.05em">Columnas requeridas</p>
        <div class="flex flex-wrap gap-2 mb-2">
          ${["grupo","fecha","tipo","descripcion","cuenta"].map(r=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#D1FAE5;color:#065F46">${r}</code>`).join("")}
          ${["debito","credito","tercero","plazo_dias","tercero_linea","descripcion_linea","doc_cruce"].map(r=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${r} <span style="font-size:.65rem">(opcional)</span></code>`).join("")}
        </div>
        <p class="text-xs" style="color:#065F46">
          <strong>tipo</strong>: prefijo o código del tipo de transacción. <strong>cuenta</strong>: código contable.
          <strong>tercero</strong> y <strong>tercero_linea</strong>: documento/NIT del tercero.
        </p>
      </div>

      <div id="mass-tx-drop-zone" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#1A4B8C;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 8 MB</p>
        <input type="file" id="mass-tx-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>

      <div id="mass-tx-progress-wrap" class="hidden mt-4">
        <div class="w-full rounded-full h-2" style="background:#E5E7EB">
          <div id="mass-tx-progress-bar" class="h-2 rounded-full transition-all" style="background:linear-gradient(90deg,#059669,#1A4B8C);width:0%"></div>
        </div>
        <p id="mass-tx-progress-text" class="text-xs mt-2" style="color:#6B7280">Preparando...</p>
      </div>

      <div id="mass-tx-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa de comprobantes</p>
          <button class="btn btn-outline btn-sm" id="btn-mass-tx-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:320px;overflow-y:auto">
          <table class="data-table text-xs" id="mass-tx-preview-table">
            <thead><tr>
              <th>Grupo</th><th>Fecha</th><th>Tipo</th><th>Líneas</th><th>Débito</th><th>Crédito</th><th>Estado</th><th>Detalle</th>
            </tr></thead>
            <tbody id="mass-tx-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-tx-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-tx-run"><i class="fas fa-bolt mr-1"></i>Ejecutar carga</button>`,!0);let e=[];const t=$("#mass-tx-drop-zone"),a=$("#mass-tx-file-input"),o=$("#btn-mass-tx-run"),s=$("#btn-mass-tx-clear"),n=()=>{var p;e=[],(p=$("#mass-tx-preview"))==null||p.classList.add("hidden"),o==null||o.classList.add("hidden");const r=$("#mass-tx-preview-body");r&&(r.innerHTML="");const l=$("#mass-tx-summary");l&&(l.innerHTML=""),a&&(a.value="")},i=()=>{t&&(t.style.borderColor="#D1D5DB",t.style.background="#FAFAFA")};t==null||t.addEventListener("click",()=>a==null?void 0:a.click()),t==null||t.addEventListener("dragover",r=>{r.preventDefault(),t&&(t.style.borderColor="#1A4B8C",t.style.background="#EFF6FF")}),t==null||t.addEventListener("dragleave",()=>i()),t==null||t.addEventListener("drop",r=>{var p,f;r.preventDefault(),i();const l=(f=(p=r.dataTransfer)==null?void 0:p.files)==null?void 0:f[0];l&&c(l)}),a==null||a.addEventListener("change",()=>{var l;const r=(l=a.files)==null?void 0:l[0];r&&c(r)}),s==null||s.addEventListener("click",n),o==null||o.addEventListener("click",()=>li(e));async function c(r){if(r.size>8*1024*1024)return showToast("El archivo supera el límite de 8 MB","error");const l=String(r.name.split(".").pop()||"").toLowerCase();let p=[];try{if(l==="csv")p=la(await r.text());else if(l==="xlsx"||l==="xls")p=da(await r.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(f){return showToast(`Error al leer el archivo: ${f.message}`,"error")}if(!p.length)return showToast("El archivo no contiene datos","warning");e=await ci(p),ri(e)}}function Va(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"_").trim()}function la(e){const t=String(e||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).filter(s=>s.trim());if(!t.length)return[];const a=s=>{const n=[];let i="",c=!1;for(let r=0;r<s.length;r++){const l=s[r];if(l==='"'){c&&s[r+1]==='"'?(i+='"',r++):c=!c;continue}if(l===","&&!c){n.push(i.trim()),i="";continue}i+=l}return n.push(i.trim()),n},o=a(t[0]).map(Va);return t.slice(1).map(s=>{const n=a(s),i={};return o.forEach((c,r)=>{i[c]=String(n[r]??"").trim()}),i})}function da(e){const t=XLSX.read(e,{type:"array"}),a=t.Sheets[t.SheetNames[0]];return XLSX.utils.sheet_to_json(a,{defval:""}).map(s=>{const n={};return Object.entries(s).forEach(([i,c])=>{n[Va(i)]=String(c??"").trim()}),n})}function ge(e,t){for(const a of t){const o=e[a];if(o!==void 0&&String(o).trim()!=="")return String(o).trim()}return""}function St(e){return String(e||"").replace(/[^0-9a-z]/gi,"").toUpperCase()}function Nt(e){if(e==null||e==="")return 0;let t=String(e).trim();if(!t)return 0;t.includes(",")&&t.includes(".")?t=t.replace(/,/g,""):t.includes(",")&&!t.includes(".")&&(t=t.replace(/,/g,".")),t=t.replace(/[^0-9.\-]/g,"");const a=Number(t);return Number.isFinite(a)?a:0}async function ci(e){var d;const[t,a,o]=await Promise.all([API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]),s=new Set(t.map(b=>b.parent_code).filter(Boolean)),n=new Set(t.filter(b=>!s.has(b.code)).map(b=>b.id)),i=new Map(t.map(b=>[String(b.code||"").trim(),b])),c=new Map;a.forEach(b=>{c.set(String(b.prefix||"").toUpperCase(),b),c.set(String(b.code||"").toUpperCase(),b),c.set(String(b.id||"").toUpperCase(),b)});const r=new Map;o.forEach(b=>{const u=St(b.doc_number);u&&r.set(u,b)});const l=new Map,p=(b,u,y,v,g)=>{if(y){if(!b[u]){b[u]=y;return}b[u]!==y&&b.errors.push(`Fila ${g}: valor inconsistente en ${v} ("${b[u]}" vs "${y}")`)}};for(let b=0;b<e.length;b++){const u=e[b]||{},y=b+2,v=ge(u,["grupo","tx_group","comprobante","grupo_tx"]);if(!v)continue;l.has(v)||l.set(v,{group:v,txDate:"",txType:"",txDesc:"",thirdDoc:"",paymentDays:"0",lines:[],errors:[]});const g=l.get(v);p(g,"txDate",ge(u,["fecha","date","tx_date"]),"fecha",y),p(g,"txType",ge(u,["tipo","tx_type","tipo_tx"]),"tipo",y),p(g,"txDesc",ge(u,["descripcion","description","detalle"]),"descripcion",y),p(g,"thirdDoc",ge(u,["tercero","tercero_doc","nit_tercero","doc_tercero"]),"tercero",y),p(g,"paymentDays",ge(u,["plazo_dias","payment_days","dias_pago"]),"plazo_dias",y);const h=ge(u,["cuenta","account","codigo_cuenta","account_code"]),_=Nt(ge(u,["debito","debit"])),A=Nt(ge(u,["credito","credit"])),C=ge(u,["tercero_linea","line_third","tercero_line"]),T=ge(u,["descripcion_linea","line_description","detalle_linea"]),N=ge(u,["doc_cruce","cross_doc_ref","documento_cruce"]);g.lines.push({rowNo:y,accountCode:h,debit:_,credit:A,lineThirdDoc:C,lineDesc:T,crossDoc:N})}const f=new Map,m=[];for(const b of l.values()){const u=[...b.errors];b.txDate||u.push("Falta fecha del comprobante"),b.txType||u.push("Falta tipo del comprobante"),b.txDesc||u.push("Falta descripción del comprobante");const y=c.get(String(b.txType||"").toUpperCase());y||u.push(`Tipo de transacción no encontrado: ${b.txType||"(vacío)"}`);let v=null;if(b.thirdDoc&&(v=r.get(St(b.thirdDoc)),v||u.push(`Tercero no encontrado (encabezado): ${b.thirdDoc}`)),b.txDate){const _=b.txDate.slice(0,7);if(!f.has(_)){let A=!1;typeof isPeriodClosed=="function"&&(A=await isPeriodClosed(b.txDate)),f.set(_,A)}f.get(_)&&u.push(`El período ${_} no está habilitado o está cerrado`)}const g=[];for(const _ of b.lines){const A=i.get(String(_.accountCode||"").trim());if(!_.accountCode){u.push(`Fila ${_.rowNo}: falta cuenta`);continue}if(!A){u.push(`Fila ${_.rowNo}: cuenta no encontrada (${_.accountCode})`);continue}n.has(A.id)||u.push(`Fila ${_.rowNo}: la cuenta ${A.code} es de mayor; usa una cuenta auxiliar`);const C=Number(_.debit||0)>0,T=Number(_.credit||0)>0;C&&T&&u.push(`Fila ${_.rowNo}: no puede tener débito y crédito al mismo tiempo`),!C&&!T&&u.push(`Fila ${_.rowNo}: debes registrar débito o crédito`);let N=null;_.lineThirdDoc&&(N=r.get(St(_.lineThirdDoc)),N||u.push(`Fila ${_.rowNo}: tercero de línea no encontrado (${_.lineThirdDoc})`)),A.requires_third_party&&!(N!=null&&N.id||v!=null&&v.id)&&u.push(`Fila ${_.rowNo}: la cuenta ${A.code} requiere tercero`),g.push({rowNo:_.rowNo,account_id:A.id,debit:Number(_.debit||0),credit:Number(_.credit||0),third_party_id:(N==null?void 0:N.id)||(v==null?void 0:v.id)||null,description:_.lineDesc||b.txDesc,cross_doc_ref:_.crossDoc||""})}const h=g.reduce((_,A)=>(_.debit+=Number(A.debit||0),_.credit+=Number(A.credit||0),_),{debit:0,credit:0});g.length<2&&u.push("Se requieren al menos 2 líneas contables válidas"),(Math.abs(h.debit-h.credit)>1e-4||h.debit<=0)&&u.push("Comprobante descuadrado: débito y crédito no coinciden"),m.push({group:b.group,txDate:b.txDate,txTypeLabel:y?`${y.prefix} - ${y.name}`:b.txType||"—",linesCount:g.length,debit:h.debit,credit:h.credit,ok:u.length===0,errors:u,payload:u.length?null:{txData:{tx_type_id:y.id,number:"",date:b.txDate,description:b.txDesc,third_party_id:(v==null?void 0:v.id)||null,user_id:(d=pb.currentUser)==null?void 0:d.id,payment_days:parseInt(b.paymentDays,10)||0,cross_enabled:g.some(_=>!!_.cross_doc_ref),status:"active"},lines:g.map((_,A)=>({account_id:_.account_id,third_party_id:_.third_party_id,debit:_.debit,credit:_.credit,description:_.description,line_order:A+1,cross_doc_ref:_.cross_doc_ref}))}})}return m.sort((b,u)=>String(b.group).localeCompare(String(u.group)))}function ri(e){const t=$("#mass-tx-preview"),a=$("#mass-tx-preview-body"),o=$("#mass-tx-summary"),s=$("#btn-mass-tx-run");if(!t||!a||!o||!s)return;const n=e.filter(c=>c.ok),i=e.filter(c=>!c.ok);a.innerHTML=e.map(c=>{const r=c.ok?"Validado":c.errors[0]||"Error de validación";return`
      <tr ${c.ok?"":'style="background:#FFF7F7"'}>
        <td>${esc(c.group)}</td>
        <td>${esc(c.txDate||"—")}</td>
        <td>${esc(c.txTypeLabel||"—")}</td>
        <td>${c.linesCount}</td>
        <td>${fmt(c.debit)}</td>
        <td>${fmt(c.credit)}</td>
        <td>${c.ok?'<span class="badge badge-green">OK</span>':'<span class="badge badge-red">Error</span>'}</td>
        <td class="text-xs" style="max-width:360px;white-space:normal">${esc(r)}</td>
      </tr>`}).join(""),o.innerHTML=`
    <span style="color:${i.length?"#B91C1C":"#166534"}">
      ${e.length} comprobante(s): ${n.length} válido(s), ${i.length} con error.
      ${i.length?"Solo se procesarán los válidos.":"Listo para ejecutar."}
    </span>`,t.classList.remove("hidden"),n.length?s.classList.remove("hidden"):s.classList.add("hidden")}async function li(e){if(Yt||!Array.isArray(e)||!e.length)return;const t=e.filter(l=>l.ok&&l.payload);if(!t.length)return showToast("No hay comprobantes válidos para importar","warning");Yt=!0;const a=$("#btn-mass-tx-run"),o=$("#mass-tx-progress-wrap"),s=$("#mass-tx-progress-bar"),n=$("#mass-tx-progress-text");a&&(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'),o==null||o.classList.remove("hidden");let i=0,c=0;const r=[];try{for(let l=0;l<t.length;l++){const p=t[l],f=l/t.length*100;s&&(s.style.width=`${f}%`),n&&(n.textContent=`Procesando ${l+1} de ${t.length}: ${p.group}`);try{await API.createTransaction(p.payload.txData,p.payload.lines),i++}catch(m){c++,r.push(`${p.group}: ${m.message}`)}}s&&(s.style.width="100%"),n&&(n.textContent="Proceso finalizado"),await API.logAudit("IMPORT","transactions","bulk",`Carga masiva: ${i} creadas, ${c} con error de ${t.length} comprobantes válidos`),r.length&&console.warn("[CargaMasivaTx] Errores:",r),showToast(`Carga masiva finalizada: ${i} comprobante(s) creados${c?`, ${c} con error`:""}`,c?"warning":"success",5500),Mt()}finally{Yt=!1,a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar carga')}}function di(){const e=["doc_type","doc_number","person_type","type","razon_social","nombres","apellidos","email","phone","address","dept_code","city_code","tax_regime","credit_limit","payment_days","active"].join(","),t=["NIT,900123456,JURIDICA,CLIENTE,CERAMICAS CONSTRUHOGAR SAS,,,,3001234567,CR 8 73-25,68,68001,COMUN,5000000,30,Si","CC,1234567890,NATURAL,PROVEEDOR,,JUAN CARLOS,PEREZ GOMEZ,juan@correo.com,3109876543,CL 45 12-30,05,05001,NO_RESP,0,0,Si","NIT,800987654,JURIDICA,EMPLEADO,EMPRESA LOGISTICA SAS,,,,6012345678,AV 68 45-10,11,11001,COMUN,0,0,Si","CC,9876543210,NATURAL,ACREEDOR,,MARIA ELENA,RODRIGUEZ SILVA,,3201112233,KR 15 80-20,76,76001,,0,0,Si"].join(`
`),a=new Blob([`${e}
${t}`],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_carga_terceros.csv",s.click(),URL.revokeObjectURL(o)}async function pi(){if(!can("canWrite"))return showToast("No tienes permisos para importar terceros","error");Bt('<i class="fas fa-users mr-2" style="color:#1D4ED8"></i>Carga masiva de terceros',`
    <div class="mb-2">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx/.xls)</strong> con los terceros a registrar.
        Si el documento ya existe, el tercero será <strong>actualizado</strong>; si no existe, será <strong>creado</strong>.
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#EFF6FF;border:1px solid #BFDBFE">
        <p class="text-xs font-semibold mb-1" style="color:#1D4ED8;text-transform:uppercase;letter-spacing:.05em">Columnas requeridas</p>
        <div class="flex flex-wrap gap-2 mb-2">
          ${["doc_type","doc_number","person_type","type"].map(r=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#DBEAFE;color:#1E40AF">${r}</code>`).join("")}
          ${["razon_social","nombres","apellidos","email","phone","address","dept_code","city_code","tax_regime","credit_limit","payment_days","active"].map(r=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${r} <span style="font-size:.65rem">(opcional)</span></code>`).join("")}
        </div>
        <p class="text-xs" style="color:#1E40AF">
          <strong>doc_type</strong>: NIT, CC, CE, TI, PAS, RC.&nbsp;
          <strong>person_type</strong>: NATURAL, JURIDICA, GRAN_CONTRIBUYENTE.&nbsp;
          <strong>type</strong>: CLIENTE, PROVEEDOR, EMPLEADO, ACREEDOR, TRANSPORTISTA, OTRO.
        </p>
      </div>

      <div id="mass-tp-drop-zone" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#1A4B8C;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 8 MB</p>
        <input type="file" id="mass-tp-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>

      <div id="mass-tp-progress-wrap" class="hidden mt-4">
        <div class="w-full rounded-full h-2" style="background:#E5E7EB">
          <div id="mass-tp-progress-bar" class="h-2 rounded-full transition-all" style="background:linear-gradient(90deg,#1D4ED8,#7C3AED);width:0%"></div>
        </div>
        <p id="mass-tp-progress-text" class="text-xs mt-2" style="color:#6B7280">Preparando...</p>
      </div>

      <div id="mass-tp-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa</p>
          <button class="btn btn-outline btn-sm" id="btn-mass-tp-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:320px;overflow-y:auto">
          <table class="data-table text-xs" id="mass-tp-preview-table">
            <thead><tr>
              <th>#</th><th>Doc</th><th>Nombre / Razón Social</th><th>Tipo Persona</th><th>Rol</th><th>Email</th><th>Estado</th><th>Detalle</th>
            </tr></thead>
            <tbody id="mass-tp-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-tp-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-tp-run"><i class="fas fa-bolt mr-1"></i>Ejecutar carga</button>`,!0);let e=[];const t=$("#mass-tp-drop-zone"),a=$("#mass-tp-file-input"),o=$("#btn-mass-tp-run"),s=$("#btn-mass-tp-clear"),n=()=>{var p;e=[],(p=$("#mass-tp-preview"))==null||p.classList.add("hidden"),o==null||o.classList.add("hidden");const r=$("#mass-tp-preview-body");r&&(r.innerHTML="");const l=$("#mass-tp-summary");l&&(l.innerHTML=""),a&&(a.value="")},i=()=>{t&&(t.style.borderColor="#D1D5DB",t.style.background="#FAFAFA")};t==null||t.addEventListener("click",()=>a==null?void 0:a.click()),t==null||t.addEventListener("dragover",r=>{r.preventDefault(),t&&(t.style.borderColor="#1D4ED8",t.style.background="#EFF6FF")}),t==null||t.addEventListener("dragleave",()=>i()),t==null||t.addEventListener("drop",r=>{var p,f;r.preventDefault(),i();const l=(f=(p=r.dataTransfer)==null?void 0:p.files)==null?void 0:f[0];l&&c(l)}),a==null||a.addEventListener("change",()=>{var l;const r=(l=a.files)==null?void 0:l[0];r&&c(r)}),s==null||s.addEventListener("click",n),o==null||o.addEventListener("click",()=>fi(e));async function c(r){if(r.size>8*1024*1024)return showToast("El archivo supera el límite de 8 MB","error");const l=String(r.name.split(".").pop()||"").toLowerCase();let p=[];try{if(l==="csv")p=la(await r.text());else if(l==="xlsx"||l==="xls")p=da(await r.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(f){return showToast(`Error al leer el archivo: ${f.message}`,"error")}if(!p.length)return showToast("El archivo no contiene datos","warning");e=ui(p),mi(e)}}function ui(e){const t=new Set(["NIT","CC","CE","TI","PAS","RC"]),a=new Set(["NATURAL","JURIDICA","GRAN_CONTRIBUYENTE"]),o=new Set(["CLIENTE","PROVEEDOR","EMPLEADO","ACREEDOR","TRANSPORTISTA","OTRO"]);return e.map((s,n)=>{const i=n+2,c=(...M)=>{for(const B of M){const k=s[Va(B)];if(k!==void 0&&String(k).trim()!=="")return String(k).trim()}return""},r=c("doc_type","tipo_doc","tipo_documento").toUpperCase(),l=c("doc_number","numero_doc","nit","documento","doc").replace(/[^0-9a-zA-Z]/g,""),p=c("person_type","tipo_persona","persona").toUpperCase()||"NATURAL",f=c("type","tipo","rol").toUpperCase()||"CLIENTE",m=c("razon_social","business_name","razon").toUpperCase(),d=c("nombres","first_name","nombre").toUpperCase(),b=c("apellidos","last_name","apellido").toUpperCase(),u=p==="NATURAL",y=u?[d,b].filter(Boolean).join(" "):m,v=c("email","correo"),g=c("phone","telefono","tel"),h=c("address","direccion").toUpperCase(),_=c("dept_code","cod_dept","departamento_cod"),A=c("city_code","cod_mun","municipio_cod","ciudad_cod"),C=c("tax_regime","regimen","tax").toUpperCase(),T=parseFloat(c("credit_limit","cupo_credito","cupo").replace(/[^0-9.]/g,""))||0,N=parseInt(c("payment_days","plazo_dias","plazo"),10)||0,I=c("active","activo","estado").toLowerCase(),S=!/^(no|0|false|inactivo|inactiva)$/.test(I),w=r==="NIT"?calcDV(l):"";if(!r)return{ok:!1,rowNo:i,error:`Fila ${i}: falta doc_type`};if(!t.has(r))return{ok:!1,rowNo:i,error:`Fila ${i}: doc_type inválido (${r})`};if(!l)return{ok:!1,rowNo:i,error:`Fila ${i}: falta doc_number`};if(!a.has(p))return{ok:!1,rowNo:i,error:`Fila ${i}: person_type inválido (${p})`};if(!o.has(f))return{ok:!1,rowNo:i,error:`Fila ${i}: type inválido (${f})`};if(u&&!d&&!b)return{ok:!1,rowNo:i,error:`Fila ${i}: persona natural requiere nombres o apellidos`};if(!u&&!m)return{ok:!1,rowNo:i,error:`Fila ${i}: persona jurídica requiere razon_social`};if(!y)return{ok:!1,rowNo:i,error:`Fila ${i}: no se pudo determinar el nombre`};let E="",L="";if(_){const M=(typeof GEO_DEPTS<"u"?GEO_DEPTS:[]).find(B=>B.code===_);if(!M)return{ok:!1,rowNo:i,error:`Fila ${i}: dept_code "${_}" no encontrado`};if(E=M.name,A){const k=(typeof geoMunisByDept=="function"?geoMunisByDept(_):[]).find(j=>j.code===A);if(!k)return{ok:!1,rowNo:i,error:`Fila ${i}: city_code "${A}" no encontrado en dept ${_}`};L=k.name}}return{ok:!0,rowNo:i,docNumber:l,docType:r,name:y,personType:p,tpType:f,email:v,active:S,payload:{doc_type:r,doc_number:l,dv:w,person_type:p,type:f,first_name:d,last_name:b,business_name:m,commercial_name:"",name:y,email:v,email2:"",phone:g,phone2:"",contact_name:"",advisor:"",address:h,country:_?"CO":"",department:E,dept_code:_,city:L,city_code:A,tax_regime:C,credit_limit:T,max_invoices:1,payment_days:N,active:S}}})}function mi(e){const t=$("#mass-tp-preview"),a=$("#mass-tp-preview-body"),o=$("#mass-tp-summary"),s=$("#btn-mass-tp-run");if(!t||!a||!o||!s)return;const n=e.filter(c=>c.ok),i=e.filter(c=>!c.ok);a.innerHTML=e.map(c=>c.ok?`<tr>
        <td>${c.rowNo}</td>
        <td><span class="font-semibold" style="color:#1D4ED8">${esc(c.docType)} ${esc(c.docNumber)}</span></td>
        <td>${esc(c.name)}</td>
        <td>${esc(c.personType)}</td>
        <td>${esc(c.tpType)}</td>
        <td>${esc(c.email||"—")}</td>
        <td><span class="badge ${c.active?"badge-green":"badge-gray"}">${c.active?"Activo":"Inactivo"}</span></td>
        <td><span class="badge badge-green">OK</span></td>
      </tr>`:`<tr style="background:#FFF7F7">
      <td>${c.rowNo}</td>
      <td colspan="6" class="text-xs" style="color:#EF4444">${esc(c.error||"Error")}</td>
      <td><span class="badge badge-red">Error</span></td>
    </tr>`).join(""),o.innerHTML=`<span style="color:${i.length?"#B91C1C":"#166534"}">
    ${e.length} fila(s): ${n.length} válida(s), ${i.length} con error.
    ${i.length?"Las filas con error serán omitidas.":"Listo para ejecutar."}
  </span>`,t.classList.remove("hidden"),n.length?s.classList.remove("hidden"):s.classList.add("hidden")}async function fi(e){if(wt)return;const t=(e||[]).filter(f=>f.ok&&f.payload);if(!t.length)return showToast("No hay filas válidas para importar","warning");wt=!0;const a=$("#btn-mass-tp-run"),o=$("#mass-tp-progress-wrap"),s=$("#mass-tp-progress-bar"),n=$("#mass-tp-progress-text");a&&(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'),o==null||o.classList.remove("hidden");let i=new Map;try{(await pb.listAll("third_parties",{})).forEach(m=>{const d=`${m.doc_type}|${String(m.doc_number||"").replace(/[^0-9a-zA-Z]/g,"")}`;i.set(d,m.id)})}catch(f){showToast(`Error al cargar terceros existentes: ${f.message}`,"error"),wt=!1,a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar carga');return}let c=0,r=0,l=0;const p=[];try{for(let f=0;f<t.length;f++){const m=t[f],d=f/t.length*100;s&&(s.style.width=`${d}%`),n&&(n.textContent=`Procesando ${f+1} de ${t.length}: ${m.name}`);const b=`${m.payload.doc_type}|${m.payload.doc_number}`,u=i.get(b);try{if(u)await pb.update("third_parties",u,m.payload),r++;else{const y=await pb.create("third_parties",m.payload);i.set(b,y.id),c++}}catch(y){l++,p.push(`Fila ${m.rowNo} (${m.docNumber}): ${y.message}`)}}s&&(s.style.width="100%"),n&&(n.textContent="Proceso finalizado"),await API.logAudit("IMPORT","third_parties","bulk",`Carga masiva: ${c} creados, ${r} actualizados, ${l} con error`),p.length&&console.warn("[CargaMasivaTp] Errores:",p),showToast(`Carga completada: ${c} creados, ${r} actualizados${l?`, ${l} con error`:""}`,l?"warning":"success",5500),Mt()}finally{wt=!1,a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar carga')}}function ss(){const e="codigo,nombre,tipo,naturaleza,nivel,codigo_padre,requiere_tercero,activa",t=["1,ACTIVO,1,debit,1,,No,Si","11,DISPONIBLE,1,debit,2,1,,Si","1105,CAJA,1,debit,3,11,,Si","110505,Caja General,1,debit,4,1105,No,Si"].join(`
`),a=new Blob([e+`
`+t],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_plan_cuentas.csv",s.click(),URL.revokeObjectURL(o)}function bi(e,t){const a=(...v)=>{for(const g of v){const h=e[g];if(h!==void 0&&h!=="")return String(h).trim()}return""},o=a("codigo","code","cod","cuenta"),s=a("nombre","name","descripcion","description"),n=a("tipo","type","tipo_cuenta","account_type"),i=a("naturaleza","nature","nat"),c=a("nivel","level"),r=a("codigo_padre","parent_code","padre","parent"),l=a("requiere_tercero","requires_third_party","tercero","req_tercero"),p=a("activa","active","estado");if(!o)return{ok:!1,error:"Falta el código"};if(!/^\d+$/.test(o))return{ok:!1,error:`Código "${o}" no es numérico`};if(!s)return{ok:!1,error:"Falta el nombre"};if(!n)return{ok:!1,error:"Falta el tipo de cuenta"};const f=n.toLowerCase().trim(),m=t.find(v=>String(v.code).toLowerCase()===f||v.name.toLowerCase().includes(f));if(!m)return{ok:!1,error:`Tipo "${n}" no encontrado`};const d=/^(c|cr|credit|credito|crédito)$/i.test(i)?"credit":"debit",b=c?Math.max(1,parseInt(c,10)||1):o.length,u=/^(s[ií]|yes|1|true)$/i.test(l),y=!/^(no|0|false|inactiva|inactivo)$/i.test(p);return{ok:!0,payload:{code:o,name:s,account_type_id:m.id,nature:d,level:b,parent_code:r,requires_third_party:u,active:y,maneja_cruce:!1,maneja_retenciones:!1,tipos_retencion:""}}}async function gi(){var i,c,r;if(!can("canWrite"))return showToast("No tienes permisos para importar cuentas","error");if(nt)return showToast("Importación en curso, espera...","warning");const e=await pb.listAll("account_types",{sort:"code"});Bt('<i class="fas fa-list-tree mr-2" style="color:#6D28D9"></i>Importar Plan de Cuentas',`
    <div class="mb-4">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx)</strong> con las cuentas.
        Si el código ya existe la cuenta se <strong>actualiza</strong>; si no existe, se <strong>crea</strong>.
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#F5F3FF;border:1px solid #DDD6FE">
        <p class="text-xs font-semibold mb-1" style="color:#6D28D9;text-transform:uppercase;letter-spacing:.05em">Columnas</p>
        <div class="flex flex-wrap gap-2">
          ${["codigo","nombre","tipo"].map(l=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#EDE9FE;color:#6D28D9">${l}</code>`).join("")}
          ${["naturaleza","nivel","codigo_padre","requiere_tercero","activa"].map(l=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${l} <span style="font-size:.65rem">(opcional)</span></code>`).join("")}
        </div>
        <p class="text-xs mt-2" style="color:#6B7280">El campo <strong>tipo</strong> debe ser el código numérico del tipo (ej: <em>1</em>, <em>2</em>).</p>
      </div>
      <button class="btn btn-outline btn-sm mb-4" id="btn-mass-acc-dl-tmpl"><i class="fas fa-download mr-1"></i>Descargar plantilla CSV</button>
      <div id="mass-acc-drop" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#6D28D9;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 5 MB</p>
        <input type="file" id="mass-acc-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>
      <div id="mass-acc-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa — <span id="mass-acc-count"></span></p>
          <button class="btn btn-outline btn-sm" id="btn-mass-acc-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:300px;overflow-y:auto">
          <table class="data-table text-xs">
            <thead><tr><th>#</th><th>Código</th><th>Nombre</th><th>Tipo</th><th>Nat.</th><th>Nivel</th><th>Padre</th><th>Estado</th></tr></thead>
            <tbody id="mass-acc-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-acc-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-acc-run"><i class="fas fa-bolt mr-1"></i>Ejecutar importación</button>`,!0);let t=[];const a=document.getElementById("mass-acc-drop"),o=document.getElementById("mass-acc-file-input");(i=document.getElementById("btn-mass-acc-dl-tmpl"))==null||i.addEventListener("click",ss),a==null||a.addEventListener("click",()=>o==null?void 0:o.click()),a==null||a.addEventListener("dragover",l=>{l.preventDefault(),a.style.borderColor="#6D28D9",a.style.background="#F5F3FF"}),a==null||a.addEventListener("dragleave",()=>{a.style.borderColor="#D1D5DB",a.style.background="#FAFAFA"}),a==null||a.addEventListener("drop",l=>{var f,m;l.preventDefault(),a.style.borderColor="#D1D5DB",a.style.background="#FAFAFA";const p=(m=(f=l.dataTransfer)==null?void 0:f.files)==null?void 0:m[0];p&&s(p)}),o==null||o.addEventListener("change",()=>{var l;(l=o.files)!=null&&l[0]&&s(o.files[0])}),(c=document.getElementById("btn-mass-acc-clear"))==null||c.addEventListener("click",()=>{var l,p;t=[],(l=document.getElementById("mass-acc-preview"))==null||l.classList.add("hidden"),(p=document.getElementById("btn-mass-acc-run"))==null||p.classList.add("hidden"),o&&(o.value="")});async function s(l){if(l.size>5*1024*1024)return showToast("El archivo supera 5 MB","error");const p=l.name.split(".").pop().toLowerCase();let f=[];try{if(p==="csv")f=la(await l.text());else if(p==="xlsx"||p==="xls")f=da(await l.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(m){return showToast("Error al leer el archivo: "+m.message,"error")}if(!f.length)return showToast("El archivo no contiene filas de datos","warning");t=f.map((m,d)=>({idx:d+1,...bi(m,e)})),n(t)}function n(l){const p=document.getElementById("mass-acc-preview-body"),f=document.getElementById("mass-acc-count"),m=document.getElementById("mass-acc-summary"),d=document.getElementById("btn-mass-acc-run"),b=document.getElementById("mass-acc-preview"),u=l.filter(v=>v.ok),y=l.filter(v=>!v.ok);f.textContent=`${l.length} fila(s) — ${u.length} válidas, ${y.length} con error`,p.innerHTML=l.map((v,g)=>{var h;if(v.ok){const _=v.payload,A=((h=e.find(C=>C.id===_.account_type_id))==null?void 0:h.name)??"?";return`<tr>
          <td>${g+1}</td>
          <td><span class="font-semibold" style="color:#6D28D9">${esc(_.code)}</span></td>
          <td>${esc(_.name)}</td>
          <td class="text-xs">${esc(A)}</td>
          <td>${_.nature==="debit"?"Db":"Cr"}</td>
          <td>${_.level}</td>
          <td>${esc(_.parent_code||"—")}</td>
          <td><span class="badge badge-green">OK</span></td>
        </tr>`}return`<tr style="background:#FFF7F7">
        <td>${g+1}</td>
        <td colspan="6" class="text-xs" style="color:#EF4444">${esc(v.error)}</td>
        <td><span class="badge badge-red">Error</span></td>
      </tr>`}).join(""),m.innerHTML=y.length?`<span style="color:#EF4444"><i class="fas fa-triangle-exclamation mr-1"></i>${y.length} fila(s) con error serán omitidas.</span>`:'<span style="color:#22C55E"><i class="fas fa-circle-check mr-1"></i>Todas las filas son válidas.</span>',b.classList.remove("hidden"),u.length?d==null||d.classList.remove("hidden"):d==null||d.classList.add("hidden")}(r=document.getElementById("btn-mass-acc-run"))==null||r.addEventListener("click",async()=>{const l=t.filter(y=>y.ok);if(!l.length||nt)return;nt=!0;const p=document.getElementById("btn-mass-acc-run");p&&(p.disabled=!0,p.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...');let f={};try{(await pb.listAll("accounts",{})).forEach(v=>{f[v.code]=v.id})}catch(y){showToast("Error al cargar cuentas: "+y.message,"error"),nt=!1,p&&(p.disabled=!1,p.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar importación');return}let m=0,d=0,b=0;for(const y of l)try{if(f[y.payload.code])await pb.update("accounts",f[y.payload.code],y.payload),d++;else{const v=await pb.create("accounts",y.payload);f[y.payload.code]=v.id,m++}}catch{b++}await API.logAudit("IMPORT","Cuenta","bulk",`${m} creadas, ${d} actualizadas, ${b} errores`),Mt(),closeModal();let u=`Importación completada: ${m} creadas, ${d} actualizadas.`;b&&(u+=` ${b} con error.`),showToast(u,b?"warning":"success",5e3),nt=!1})}function ns(){const e=["codigo","nombre","tipo","torre","apartamento","coef_participacion","cuota_admin","area_m2","doc_propietario","tipo_doc_propietario","activo","notas"].join(","),t=["101,Apartamento 101,APARTAMENTO,Torre 1,101,2.1500,0,68.50,900123456,CC,Si,Unidad principal","P-12,Parqueadero 12,PARQUEADERO,Torre 1,P-12,0.3200,0,12.00,900123456,CC,Si,Parqueadero cubierto","D-03,Deposito 03,DEPOSITO,Torre 1,D-03,0.1500,0,5.20,900123456,CC,Si,"].join(`
`),a=new Blob([e+`
`+t],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_unidades_copropiedades.csv",s.click(),URL.revokeObjectURL(o)}function vi(e,t,a){var h,_;const o=ge(e,["codigo","code","unidad","unit_code"]),s=ge(e,["nombre","name","descripcion"]),n=ge(e,["tipo","unit_type","tipo_unidad"])||"APARTAMENTO",i=ge(e,["torre","tower"]),c=ge(e,["apartamento","apto","apartment"]),r=Nt(ge(e,["coef_participacion","coef","coeficiente"])),l=Nt(ge(e,["cuota_admin","admin_fee","cuota_administracion"])),p=Nt(ge(e,["area_m2","area"])),f=ge(e,["doc_propietario","owner_doc","documento_propietario"]),m=ge(e,["tipo_doc_propietario","owner_doc_type","doc_type_propietario"]).toUpperCase(),d=ge(e,["activo","active","estado"]),b=ge(e,["notas","nota","notes"]);if(!o)return{ok:!1,error:"Falta el código de la unidad"};if(!s)return{ok:!1,error:`Falta el nombre para la unidad ${o}`};const u=new Set(["APARTAMENTO","PARQUEADERO","DEPOSITO","LOCAL","CASA","OFICINA","OTRO"]),y=String(n).toUpperCase();if(!u.has(y))return{ok:!1,error:`Tipo inválido en ${o}: ${n}`};if(r<0||r>100)return{ok:!1,error:`Coeficiente fuera de rango (0-100) en ${o}`};if(l<0)return{ok:!1,error:`Cuota administración negativa en ${o}`};if(p<0)return{ok:!1,error:`Área negativa en ${o}`};let v=null;if(f){const A=St(f);if(m&&(v=((h=a.get(`${m}|${A}`))==null?void 0:h.id)||null),v||(v=((_=t.get(A))==null?void 0:_.id)||null),!v)return{ok:!1,error:`No existe tercero propietario con documento ${f}`}}const g=!/^(no|0|false|inactiva|inactivo)$/i.test(d);return{ok:!0,payload:{code:o,name:s,unit_type:y,tower:i,apartment:c,coef_participacion:r,admin_fee:l,area_m2:p,owner_id:v,notes:b,active:g}}}async function hi(){var p,f,m;if(!can("canWrite"))return showToast("No tienes permisos para importar unidades","error");if(Et)return showToast("Importación en curso, espera...","warning");Bt('<i class="fas fa-building-user mr-2" style="color:#0E7490"></i>Importar Unidades Copropiedades',`
    <div class="mb-4">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx)</strong> con unidades habitacionales.
        Si el código ya existe se <strong>actualiza</strong>; si no existe se <strong>crea</strong>.
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#F0FDFA;border:1px solid #99F6E4">
        <p class="text-xs font-semibold mb-1" style="color:#0F766E;text-transform:uppercase;letter-spacing:.05em">Columnas</p>
        <div class="flex flex-wrap gap-2">
          ${["codigo","nombre","tipo"].map(d=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#CCFBF1;color:#0F766E">${d}</code>`).join("")}
          ${["torre","apartamento","coef_participacion","cuota_admin","area_m2","doc_propietario","tipo_doc_propietario","activo","notas"].map(d=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${d} <span style="font-size:.65rem">(opcional)</span></code>`).join("")}
        </div>
      </div>
      <button class="btn btn-outline btn-sm mb-4" id="btn-mass-ph-units-dl-tmpl"><i class="fas fa-download mr-1"></i>Descargar plantilla CSV</button>
      <div id="mass-ph-units-drop" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#0E7490;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 5 MB</p>
        <input type="file" id="mass-ph-units-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>

      <div id="mass-ph-units-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa — <span id="mass-ph-units-count"></span></p>
          <button class="btn btn-outline btn-sm" id="btn-mass-ph-units-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:300px;overflow-y:auto">
          <table class="data-table text-xs">
            <thead><tr><th>#</th><th>Código</th><th>Nombre</th><th>Tipo</th><th>Apto</th><th>Propietario</th><th>Operación</th><th>Estado</th></tr></thead>
            <tbody id="mass-ph-units-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-ph-units-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-ph-units-run"><i class="fas fa-bolt mr-1"></i>Ejecutar importación</button>`,!0);let e=[];const[t,a]=await Promise.all([API.getTerceros({}),pb.listAll("ph_properties",{sort:"code"})]),o=new Map,s=new Map;t.forEach(d=>{const b=St(d.doc_number);if(!b)return;o.has(b)||o.set(b,d);const u=`${String(d.doc_type||"").toUpperCase()}|${b}`;s.has(u)||s.set(u,d)});const n=new Map(a.map(d=>[String(d.code||"").trim().toUpperCase(),d])),i=document.getElementById("mass-ph-units-drop"),c=document.getElementById("mass-ph-units-file-input");(p=document.getElementById("btn-mass-ph-units-dl-tmpl"))==null||p.addEventListener("click",ns),i==null||i.addEventListener("click",()=>c==null?void 0:c.click()),i==null||i.addEventListener("dragover",d=>{d.preventDefault(),i.style.borderColor="#0E7490",i.style.background="#ECFEFF"}),i==null||i.addEventListener("dragleave",()=>{i.style.borderColor="#D1D5DB",i.style.background="#FAFAFA"}),i==null||i.addEventListener("drop",d=>{var u,y;d.preventDefault(),i.style.borderColor="#D1D5DB",i.style.background="#FAFAFA";const b=(y=(u=d.dataTransfer)==null?void 0:u.files)==null?void 0:y[0];b&&r(b)}),c==null||c.addEventListener("change",()=>{var b;const d=(b=c.files)==null?void 0:b[0];d&&r(d)}),(f=document.getElementById("btn-mass-ph-units-clear"))==null||f.addEventListener("click",()=>{var d,b;e=[],(d=document.getElementById("mass-ph-units-preview"))==null||d.classList.add("hidden"),(b=document.getElementById("btn-mass-ph-units-run"))==null||b.classList.add("hidden"),c&&(c.value="")});async function r(d){if(d.size>5*1024*1024)return showToast("El archivo supera 5 MB","error");const b=d.name.split(".").pop().toLowerCase();let u=[];try{if(b==="csv")u=la(await d.text());else if(b==="xlsx"||b==="xls")u=da(await d.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(y){return showToast("Error al leer el archivo: "+y.message,"error")}if(!u.length)return showToast("El archivo no contiene filas de datos","warning");e=u.map((y,v)=>{var A;const g=vi(y,o,s);if(!g.ok)return{idx:v+1,...g};const h=String(g.payload.code||"").trim().toUpperCase(),_=n.get(h);return{idx:v+1,ok:!0,mode:_?"update":"create",existingId:(_==null?void 0:_.id)||null,ownerName:g.payload.owner_id&&((A=t.find(C=>C.id===g.payload.owner_id))==null?void 0:A.name)||"—",payload:g.payload}}),l(e)}function l(d){const b=document.getElementById("mass-ph-units-preview-body"),u=document.getElementById("mass-ph-units-count"),y=document.getElementById("mass-ph-units-summary"),v=document.getElementById("btn-mass-ph-units-run"),g=document.getElementById("mass-ph-units-preview"),h=d.filter(A=>A.ok),_=d.filter(A=>!A.ok);u.textContent=`${d.length} fila(s) — ${h.length} válidas, ${_.length} con error`,b.innerHTML=d.map(A=>{if(!A.ok)return`<tr style="background:#FFF7F7">
          <td>${A.idx}</td>
          <td colspan="6" class="text-xs" style="color:#EF4444">${esc(A.error||"Fila inválida")}</td>
          <td><span class="badge badge-red">Error</span></td>
        </tr>`;const C=A.payload,T=A.mode==="update"?'<span class="badge badge-orange">Actualizar</span>':'<span class="badge badge-blue">Crear</span>';return`<tr>
        <td>${A.idx}</td>
        <td><span class="font-semibold" style="color:#0E7490">${esc(C.code)}</span></td>
        <td>${esc(C.name)}</td>
        <td>${esc(C.unit_type||"—")}</td>
        <td>${esc(C.apartment||"—")}</td>
        <td>${esc(A.ownerName||"—")}</td>
        <td>${T}</td>
        <td><span class="badge badge-green">OK</span></td>
      </tr>`}).join(""),y.innerHTML=_.length?`<span style="color:#EF4444"><i class="fas fa-triangle-exclamation mr-1"></i>${_.length} fila(s) con error serán omitidas.</span>`:'<span style="color:#22C55E"><i class="fas fa-circle-check mr-1"></i>Todas las filas son válidas.</span>',g.classList.remove("hidden"),h.length?v==null||v.classList.remove("hidden"):v==null||v.classList.add("hidden")}(m=document.getElementById("btn-mass-ph-units-run"))==null||m.addEventListener("click",async()=>{const d=e.filter(h=>h.ok);if(!d.length||Et)return;Et=!0;const b=document.getElementById("btn-mass-ph-units-run");b&&(b.disabled=!0,b.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...');let u=0,y=0,v=0;const g=[];try{for(const h of d)try{if(h.mode==="update"&&h.existingId)await pb.update("ph_properties",h.existingId,h.payload),y++;else{const _=await pb.create("ph_properties",h.payload);h.existingId=_.id,u++}}catch(_){v++,g.push({code:h.payload.code,error:_.message||"Error desconocido"})}await API.logAudit("IMPORT","PhProperty","bulk",`Carga masiva unidades PH: ${u} creadas, ${y} actualizadas, ${v} con error`),g.length&&console.warn("[CargaMasivaPhUnits] Errores:",g),closeModal(),showToast(`Carga completada: ${u} creadas, ${y} actualizadas${v?`, ${v} con error`:""}`,v?"warning":"success",5500)}finally{Et=!1,b&&(b.disabled=!1,b.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar importación')}})}function Bt(e,t,a=[],o=!1){const s=$("#modal-title"),n=$("#modal-body"),i=$("#modal-footer"),c=$("#modal-box"),r=$("#modal-overlay");s&&(s.innerHTML=e),n&&(n.innerHTML=t),i&&(i.innerHTML="",typeof a=="string"?i.innerHTML=a:(Array.isArray(a)?a:a&&typeof a=="object"?[a]:[]).forEach(({label:p,class:f,action:m})=>{if(typeof m!="function")return;const d=document.createElement("button");d.className=`btn ${f||"btn-outline"}`,d.textContent=p||"Aceptar",d.addEventListener("click",m),i.appendChild(d)})),c==null||c.classList.toggle("wide",!!o),r==null||r.classList.add("show")}window._loadLastBackupInfo=os;window.renderUtilidades=Gr;window._executeMassTxImport=li;window._handleCreateBackup=ai;window._massTxNormHeader=Va;window._massTxParseCsv=la;window._massTxParseExcel=da;window._openMassTxImportModal=ii;window.BACKUP_VERSION=as;window._massTxImportInProgress=Yt;window._massTxDocKey=St;window._openMassAccImportModal=gi;window._massTpBuildDraft=ui;window._massPhUnitsImportInProgress=Et;window._downloadMassTpTemplate=di;window._downloadMassTxTemplate=ni;window._massTpImportInProgress=wt;window.BACKUP_COLLECTIONS=ti;window._massTxNum=Nt;window._downloadMassPhUnitsTemplate=ns;window._massTxPick=ge;window._openMassTpImportModal=pi;window.openModal=Bt;window._massPhUnitsNormalizeRow=vi;window._massAccImportInProgress=nt;window._handleRestoreFileSelected=oi;window._restoreInProgress=Wt;window._massAccNormalizeRow=bi;window._openMassPhUnitsImportModal=hi;window._downloadMassAccTemplate=ss;window._doRestore=si;window._backupInProgress=zt;window._massTpRenderPreview=mi;window._massTxRenderPreview=ri;window._massTxBuildDraft=ci;window._loadSysInfo=Mt;window._executeMassTpImport=fi;const ja=[{value:"BIEN",label:"Bien (producto físico)"},{value:"SERVICIO",label:"Servicio"}],yi=["UND","KG","GR","LT","ML","MT","CM","M2","M3","CJ","BL","GL","PAR","HORA","DIA","MES","SVC"],Ha=[{value:0,label:"0% — Excluido / Exento"},{value:5,label:"5% — Tarifa diferencial"},{value:19,label:"19% — Tarifa general"}];function ct(e){const t=String(e??"").trim();if(!t)return null;const a=Number(t);return Number.isFinite(a)?a:null}function uo(e){const t=[];return e.peso!==null&&t.push(`Peso: ${fmtN(e.peso)}`),e.cajas_en_pallet!==null&&t.push(`Cajas/Pallet: ${fmtN(e.cajas_en_pallet)}`),e.und_empaque!==null&&t.push(`UndEmpaque: ${fmtN(e.und_empaque)}`),e.peso_x_und_empaque!==null&&t.push(`Peso x UndEmpaque: ${fmtN(e.peso_x_und_empaque)}`),t.length?t.join(" | "):"Sin condiciones especiales registradas"}function _i(e,t){var i,c,r;const a="special-conditions-overlay",o=document.getElementById(a);o&&o.remove();const s=document.createElement("div");s.id=a,s.className="modal-overlay show",s.style.zIndex="200",s.innerHTML=`
    <div class="modal-box" style="max-width:640px">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-base font-semibold" style="color:#0D2137">Condiciones especiales</h4>
        <button class="btn btn-outline btn-sm" id="sc-close-btn"><i class="fas fa-xmark"></i></button>
      </div>
      <p class="text-sm mb-4" style="color:#6B7280">Campos opcionales para importacion y logistica.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-group">
          <label class="form-label">Peso</label>
          <input id="sc-peso" type="number" min="0" step="0.0001" class="form-input text-right" value="${e.peso??""}" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">Caja en Pallet</label>
          <input id="sc-cajas-en-pallet" type="number" min="0" step="0.0001" class="form-input text-right" value="${e.cajas_en_pallet??""}" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">UndEmpaque</label>
          <input id="sc-und-empaque" type="number" min="0" step="0.0001" class="form-input text-right" value="${e.und_empaque??""}" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">Peso x UndEmpaque</label>
          <input id="sc-peso-x-und-empaque" type="number" min="0" step="0.0001" class="form-input text-right" value="${e.peso_x_und_empaque??""}" placeholder="0">
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-5">
        <button class="btn btn-outline" id="sc-cancel-btn">Cancelar</button>
        <button class="btn btn-primary" id="sc-apply-btn"><i class="fas fa-check"></i> Aplicar</button>
      </div>
    </div>`;const n=()=>s.remove();document.body.appendChild(s),(i=s.querySelector("#sc-close-btn"))==null||i.addEventListener("click",n),(c=s.querySelector("#sc-cancel-btn"))==null||c.addEventListener("click",n),s.addEventListener("click",l=>{l.target===s&&n()}),(r=s.querySelector("#sc-apply-btn"))==null||r.addEventListener("click",()=>{t({peso:ct(getInputVal("sc-peso")),cajas_en_pallet:ct(getInputVal("sc-cajas-en-pallet")),und_empaque:ct(getInputVal("sc-und-empaque")),peso_x_und_empaque:ct(getInputVal("sc-peso-x-und-empaque"))}),n()})}async function is(){try{const e=await API.getSetting("product_catalog_v1");if(e){const t=JSON.parse(e);return{categories:Array.isArray(t.categories)?t.categories:[],lines:Array.isArray(t.lines)?t.lines:[]}}}catch{}return{categories:[],lines:[]}}async function xi(e){await API.setSetting("product_catalog_v1",JSON.stringify(e))}function cs(e,t){var m,d,b,u,y,v,g;const a="catalog-manager-overlay",o=document.getElementById(a);o&&o.remove();const s={categories:[...e.categories||[]],lines:[...e.lines||[]]};function n(h,_){return h.length?h.map((A,C)=>`
      <div class="flex items-center justify-between gap-2 py-1 border-b" style="border-color:#F5F5F5">
        <span class="text-sm">${esc(A)}</span>
        <button type="button" class="btn btn-danger btn-sm cm-del" data-idx="${C}" data-ltype="${_}"><i class="fas fa-times"></i></button>
      </div>`).join(""):'<p class="text-xs italic py-2" style="color:#9CA3AF">Sin elementos. Agrega el primero.</p>'}const i=document.createElement("div");i.id=a,i.className="modal-overlay show",i.style.zIndex="200",i.innerHTML=`
    <div class="modal-box" style="max-width:680px">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-base font-semibold" style="color:#0D2137"><i class="fas fa-tags mr-2" style="color:#64E1FF"></i>Gestionar Categorías y Líneas</h4>
        <button type="button" class="btn btn-outline btn-sm" id="cm-close-btn"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p class="form-label mb-2">Categorías de producto</p>
          <div id="cm-cat-list" class="min-h-12 mb-3">${n(s.categories,"categories")}</div>
          <div class="flex gap-2">
            <input id="cm-new-cat" class="form-input flex-1" placeholder="Nueva categoría..." maxlength="80">
            <button type="button" class="btn btn-outline btn-sm" id="cm-add-cat-btn"><i class="fas fa-plus"></i></button>
          </div>
        </div>
        <div>
          <p class="form-label mb-2">Líneas de producto</p>
          <div id="cm-line-list" class="min-h-12 mb-3">${n(s.lines,"lines")}</div>
          <div class="flex gap-2">
            <input id="cm-new-line" class="form-input flex-1" placeholder="Nueva línea..." maxlength="80">
            <button type="button" class="btn btn-outline btn-sm" id="cm-add-line-btn"><i class="fas fa-plus"></i></button>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-5">
        <button type="button" class="btn btn-outline" id="cm-cancel-btn">Cancelar</button>
        <button type="button" class="btn btn-primary" id="cm-save-btn"><i class="fas fa-floppy-disk"></i> Guardar</button>
      </div>
    </div>`;const c=()=>i.remove();document.body.appendChild(i);function r(){i.querySelector("#cm-cat-list").innerHTML=n(s.categories,"categories"),i.querySelector("#cm-line-list").innerHTML=n(s.lines,"lines"),l()}function l(){i.querySelectorAll(".cm-del").forEach(h=>{h.addEventListener("click",()=>{s[h.dataset.ltype].splice(Number(h.dataset.idx),1),r()})})}l(),(m=i.querySelector("#cm-close-btn"))==null||m.addEventListener("click",c),(d=i.querySelector("#cm-cancel-btn"))==null||d.addEventListener("click",c),i.addEventListener("click",h=>{h.target===i&&c()});const p=()=>{const h=i.querySelector("#cm-new-cat"),_=((h==null?void 0:h.value)||"").trim();if(_){if(s.categories.includes(_)){showToast("Ya existe esa categoría","warning");return}s.categories.push(_),h.value="",r()}};(b=i.querySelector("#cm-add-cat-btn"))==null||b.addEventListener("click",p),(u=i.querySelector("#cm-new-cat"))==null||u.addEventListener("keydown",h=>{h.key==="Enter"&&(h.preventDefault(),p())});const f=()=>{const h=i.querySelector("#cm-new-line"),_=((h==null?void 0:h.value)||"").trim();if(_){if(s.lines.includes(_)){showToast("Ya existe esa línea","warning");return}s.lines.push(_),h.value="",r()}};(y=i.querySelector("#cm-add-line-btn"))==null||y.addEventListener("click",f),(v=i.querySelector("#cm-new-line"))==null||v.addEventListener("keydown",h=>{h.key==="Enter"&&(h.preventDefault(),f())}),(g=i.querySelector("#cm-save-btn"))==null||g.addEventListener("click",async()=>{const h=i.querySelector("#cm-save-btn");h&&(h.disabled=!0,h.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{await xi(s),showToast("Catálogo guardado","success"),t({categories:[...s.categories],lines:[...s.lines]}),c()}catch(_){showToast(_.message||"No se pudo guardar","error")}finally{h&&(h.disabled=!1,h.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar')}})}async function pa(e){var t,a,o,s,n,i,c,r;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando productos...</div>';try{const[l,p,f]=await Promise.all([API.getProducts({activeOnly:!1}),API.getAccounts(!1),is()]),m=l.filter(g=>g.active).length,d=l.filter(g=>g.type==="BIEN").length,b=l.filter(g=>g.type==="SERVICIO").length,u=[...new Set(l.map(g=>g.categoria).filter(Boolean))].sort(),y=[...new Set(l.map(g=>g.linea).filter(Boolean))].sort();e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Productos y Servicios</h3>
          <p class="text-sm" style="color:#6B7280">Catálogo maestro — base de Facturación, CRM e Inventarios.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          ${can("canWrite")?'<button class="btn btn-outline" id="btn-catalog-manager"><i class="fas fa-tags"></i> Categorías / Líneas</button>':""}
          ${can("canWrite")?'<button class="btn btn-primary" id="btn-new-product"><i class="fas fa-plus"></i> Nuevo Producto/Servicio</button>':""}
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        ${Ut("Total catálogo",l.length,"fas fa-box-open","#1A4B8C","#EEF4FF")}
        ${Ut("Activos",m,"fas fa-circle-check","#059669","#ECFDF5")}
        ${Ut("Bienes",d,"fas fa-boxes-stacked","#C46516","#FFF8F0")}
        ${Ut("Servicios",b,"fas fa-handshake","#7C3AED","#F5F3FF")}
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap gap-3">
          <input id="prod-q" class="form-input flex-1 min-w-48" placeholder="Buscar por código o nombre...">
          <select id="prod-type" class="form-input" style="max-width:200px">
            <option value="">Todos los tipos</option>
            ${ja.map(g=>`<option value="${g.value}">${g.label}</option>`).join("")}
          </select>
          <select id="prod-iva" class="form-input" style="max-width:180px">
            <option value="">Todas las tarifas IVA</option>
            ${Ha.map(g=>`<option value="${g.value}">${g.value}%</option>`).join("")}
          </select>
          <select id="prod-categoria" class="form-input" style="max-width:180px">
            <option value="">Todas las categorías</option>
            ${u.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join("")}
          </select>
          <select id="prod-linea" class="form-input" style="max-width:160px">
            <option value="">Todas las líneas</option>
            ${y.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join("")}
          </select>
          <select id="prod-status" class="form-input" style="max-width:160px">
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="prod-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Línea</th>
                <th>Unidad</th>
                <th class="text-right">IVA %</th>
                <th class="text-right">Precio base</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="prod-tbody">
              ${l.length?Ai(l):$i(10)}
            </tbody>
          </table>
        </div>
      </div>`;const v=()=>wi();(t=$("#prod-q"))==null||t.addEventListener("input",debounce(v,150)),(a=$("#prod-type"))==null||a.addEventListener("change",v),(o=$("#prod-categoria"))==null||o.addEventListener("change",v),(s=$("#prod-linea"))==null||s.addEventListener("change",v),(n=$("#prod-iva"))==null||n.addEventListener("change",v),(i=$("#prod-status"))==null||i.addEventListener("change",v),(c=$("#btn-new-product"))==null||c.addEventListener("click",()=>rs(null,p,f)),(r=$("#btn-catalog-manager"))==null||r.addEventListener("click",()=>{cs(f,g=>{Object.assign(f,g),pa($("#page-content"))})})}catch(l){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(l.message)}</div>`}}function Ut(e,t,a,o,s){return`<div class="rounded-2xl p-4" style="background:${s};border:1px solid ${s}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${a} text-sm" style="color:${o}"></i>
      <span class="text-xs font-semibold" style="color:${o}">${e}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${o}">${fmtN(t)}</p>
  </div>`}function Ai(e){return e.map(t=>{var s;const a=t.type==="BIEN"?'<span class="badge badge-blue">Bien</span>':'<span class="badge" style="background:#F5F3FF;color:#7C3AED">Servicio</span>',o=t.active?'<span class="badge badge-green">Activo</span>':'<span class="badge badge-gray">Inactivo</span>';return(s=t.expand)==null||s.income_account_id,`<tr data-type="${esc(t.type)}" data-iva="${t.iva_rate??""}" data-active="${t.active}" data-categoria="${esc(t.categoria||"")}" data-linea="${esc(t.linea||"")}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(t.code)}</span></td>
      <td class="font-medium">${esc(t.name)}</td>
      <td>${a}</td>
      <td class="text-sm">${esc(t.categoria||"—")}</td>
      <td class="text-sm">${esc(t.linea||"—")}</td>
      <td><span class="font-mono text-xs">${esc(t.unit||"—")}</span></td>
      <td class="text-right">${t.iva_rate??0}%</td>
      <td class="text-right">${t.base_price?fmt(t.base_price):"—"}</td>
      <td>${o}</td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewProductDetail('${esc(t.id)}')"><i class="fas fa-eye"></i></button>
          ${can("canWrite")?`<button class="btn btn-outline btn-sm" title="Editar" onclick="editProduct('${esc(t.id)}')"><i class="fas fa-pen"></i></button>`:""}
          ${can("canWrite")?`<button class="btn btn-outline btn-sm" title="${t.active?"Desactivar":"Activar"}" onclick="toggleProductStatus('${esc(t.id)}', ${!t.active})">
            <i class="fas ${t.active?"fa-toggle-on":"fa-toggle-off"}"></i></button>`:""}
          ${can("canDelete")?`<button class="btn btn-danger btn-sm" title="Eliminar" onclick="deleteProduct('${esc(t.id)}', '${esc(t.name)}')"><i class="fas fa-trash"></i></button>`:""}
        </div>
      </td>
    </tr>`}).join("")}function $i(e){return`<tr><td colspan="${e}" class="text-center py-10" style="color:#9CA3AF">
    <i class="fas fa-box-open mr-2"></i>No hay productos registrados.
  </td></tr>`}function wi(){const e=(getInputVal("prod-q")||"").toLowerCase(),t=getSelectVal("prod-type"),a=getSelectVal("prod-categoria"),o=getSelectVal("prod-linea"),s=getSelectVal("prod-iva"),n=getSelectVal("prod-status");$$("#prod-table tbody tr[data-type]").forEach(i=>{const c=i.textContent.toLowerCase(),r=!e||c.includes(e),l=!t||i.dataset.type===t,p=!a||i.dataset.categoria===a,f=!o||i.dataset.linea===o,m=!s||i.dataset.iva===s,d=!n||i.dataset.active===n;i.style.display=r&&l&&p&&f&&m&&d?"":"none"})}async function qr(e){var t,a,o,s,n;try{const i=await pb.get("products",e,{expand:"income_account_id,cost_account_id,inventory_account_id"}),c=((t=ja.find(m=>m.value===i.type))==null?void 0:t.label)||i.type,r=((a=Ha.find(m=>m.value===i.iva_rate))==null?void 0:a.label)||`${i.iva_rate}%`,l=(o=i.expand)==null?void 0:o.income_account_id,p=(s=i.expand)==null?void 0:s.cost_account_id,f=(n=i.expand)==null?void 0:n.inventory_account_id;openModal(`Producto — ${esc(i.code)}`,`<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div><span class="form-label">Código</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(i.code)}</p></div>
        <div class="md:col-span-2"><span class="form-label">Nombre</span><p class="font-semibold">${esc(i.name)}</p></div>
        <div><span class="form-label">Tipo</span><p>${esc(c)}</p></div>
        <div><span class="form-label">Unidad de medida</span><p class="font-mono">${esc(i.unit||"—")}</p></div>
        <div><span class="form-label">Presentacion</span><p>${esc(i.presentacion||"—")}</p></div>
        <div><span class="form-label">Categoria</span><p>${esc(i.categoria||"—")}</p></div>
        <div><span class="form-label">Linea</span><p>${esc(i.linea||"—")}</p></div>
        <div><span class="form-label">Tarifa IVA</span><p>${esc(r)}</p></div>
        <div><span class="form-label">Precio base venta</span><p>${i.base_price?fmt(i.base_price):"—"}</p></div>
        <div><span class="form-label">Precio venta 2</span><p>${i.precio_venta_2?fmt(i.precio_venta_2):"—"}</p></div>
        <div><span class="form-label">Precio venta 3</span><p>${i.precio_venta_3?fmt(i.precio_venta_3):"—"}</p></div>
        <div><span class="form-label">Costo estimado</span><p>${i.cost_price?fmt(i.cost_price):"—"}</p></div>
        <div><span class="form-label">Estado</span><p>${i.active?'<span class="badge badge-green">Activo</span>':'<span class="badge badge-gray">Inactivo</span>'}</p></div>
        <div><span class="form-label">Cód. UNSPSC (DIAN)</span><p class="font-mono">${esc(i.unspsc_code||"—")}</p></div>
        <div><span class="form-label">Cód. EAN/barras</span><p class="font-mono">${esc(i.ean_code||"—")}</p></div>
        ${i.description?`<div class="col-span-2 md:col-span-3"><span class="form-label">Descripción</span><p>${esc(i.description)}</p></div>`:""}
        <div class="col-span-2 md:col-span-3 border-t pt-3 mt-1" style="border-color:#F0F0F0">
          <span class="form-label">Cuentas contables</span>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            <div><p class="text-xs text-gray-500 mb-1">Ingresos</p>
              <p class="font-mono text-xs">${l?esc(`${l.code} — ${l.name}`):"—"}</p></div>
            <div><p class="text-xs text-gray-500 mb-1">Costo/Gasto</p>
              <p class="font-mono text-xs">${p?esc(`${p.code} — ${p.name}`):"—"}</p></div>
            <div><p class="text-xs text-gray-500 mb-1">Inventario</p>
              <p class="font-mono text-xs">${f?esc(`${f.code} — ${f.name}`):"—"}</p></div>
          </div>
        </div>
        <div class="col-span-2 md:col-span-3 border-t pt-3 mt-1" style="border-color:#F0F0F0">
          <span class="form-label">Condiciones especiales</span>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div><p class="text-xs text-gray-500 mb-1">Peso</p><p class="font-mono text-xs">${i.peso!=null?esc(String(i.peso)):"—"}</p></div>
            <div><p class="text-xs text-gray-500 mb-1">Caja en Pallet</p><p class="font-mono text-xs">${i.cajas_en_pallet!=null?esc(String(i.cajas_en_pallet)):"—"}</p></div>
            <div><p class="text-xs text-gray-500 mb-1">UndEmpaque</p><p class="font-mono text-xs">${i.und_empaque!=null?esc(String(i.und_empaque)):"—"}</p></div>
            <div><p class="text-xs text-gray-500 mb-1">Peso x UndEmpaque</p><p class="font-mono text-xs">${i.peso_x_und_empaque!=null?esc(String(i.peso_x_und_empaque)):"—"}</p></div>
          </div>
        </div>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!1)}catch(i){showToast(i.message,"error")}}async function rs(e=null,t=null,a={}){var n,i,c;t||(t=await API.getAccounts(!1).catch(()=>[]));const o=(r="")=>`<option value="">— Sin asignar —</option>${t.filter(p=>p.active&&Number(p.level)>=3).sort((p,f)=>p.code.localeCompare(f.code)).map(p=>`<option value="${esc(p.id)}" ${p.id===r?"selected":""}>${esc(p.code)} — ${esc(p.name)}</option>`).join("")}`,s={peso:(e==null?void 0:e.peso)??null,cajas_en_pallet:(e==null?void 0:e.cajas_en_pallet)??null,und_empaque:(e==null?void 0:e.und_empaque)??null,peso_x_und_empaque:(e==null?void 0:e.peso_x_und_empaque)??null};openModal(e?`Editar — ${esc(e.code)}`:"Nuevo Producto / Servicio",`<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Fila 1 -->
      <div class="form-group">
        <label class="form-label">Código <span style="color:#EF4444">*</span></label>
        <input id="pf-code" class="form-input font-mono" value="${esc((e==null?void 0:e.code)||"")}" placeholder="P-001" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Nombre <span style="color:#EF4444">*</span></label>
        <input id="pf-name" class="form-input" value="${esc((e==null?void 0:e.name)||"")}" placeholder="Nombre del producto o servicio">
      </div>

      <!-- Fila 2 -->
      <div class="form-group">
        <label class="form-label">Tipo <span style="color:#EF4444">*</span></label>
        <select id="pf-type" class="form-input">
          ${ja.map(r=>`<option value="${r.value}" ${(e==null?void 0:e.type)===r.value?"selected":""}>${r.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Unidad de medida <span style="color:#EF4444">*</span></label>
        <select id="pf-unit" class="form-input">
          ${yi.map(r=>`<option value="${r}" ${(e==null?void 0:e.unit)===r?"selected":""}>${r}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Presentacion</label>
        <input id="pf-presentacion" class="form-input" value="${esc((e==null?void 0:e.presentacion)||"")}" placeholder="Caja x 12, Bolsa 1Kg, etc.">
      </div>

      <!-- Fila 2B -->
      <div class="form-group">
        <label class="form-label">Categoría</label>
        <input id="pf-categoria" class="form-input" list="dl-categorias" value="${esc((e==null?void 0:e.categoria)||"")}" placeholder="Aseo, Alimentos, Repuestos...">
        <datalist id="dl-categorias">${(a.categories||[]).map(r=>`<option value="${esc(r)}">`).join("")}</datalist>
      </div>
      <div class="form-group">
        <label class="form-label">Línea</label>
        <input id="pf-linea" class="form-input" list="dl-lineas" value="${esc((e==null?void 0:e.linea)||"")}" placeholder="Hogar, Industrial, Premium...">
        <datalist id="dl-lineas">${(a.lines||[]).map(r=>`<option value="${esc(r)}">`).join("")}</datalist>
      </div>
      <div class="form-group flex items-end">
        ${can("canWrite")?'<button type="button" class="btn btn-outline btn-sm w-full" id="btn-catalog-form"><i class="fas fa-tags"></i> Gestionar Cat./Líneas</button>':"<span></span>"}
      </div>
      <div class="form-group">
        <label class="form-label">Tarifa IVA <span style="color:#EF4444">*</span></label>
        <select id="pf-iva" class="form-input">
          ${Ha.map(r=>`<option value="${r.value}" ${Number(e==null?void 0:e.iva_rate)===r.value?"selected":""}>${r.label}</option>`).join("")}
        </select>
      </div>

      <!-- Fila 3: precios -->
      <div class="form-group">
        <label class="form-label">Precio base de venta</label>
        <input id="pf-base-price" type="number" min="0" step="0.01" class="form-input text-right" value="${(e==null?void 0:e.base_price)??""}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Costo estimado</label>
        <input id="pf-cost-price" type="number" min="0" step="0.01" class="form-input text-right" value="${(e==null?void 0:e.cost_price)??""}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Precio venta 2</label>
        <input id="pf-sale-price-2" type="number" min="0" step="0.01" class="form-input text-right" value="${(e==null?void 0:e.precio_venta_2)??""}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Precio venta 3</label>
        <input id="pf-sale-price-3" type="number" min="0" step="0.01" class="form-input text-right" value="${(e==null?void 0:e.precio_venta_3)??""}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Activo</label>
        <select id="pf-active" class="form-input">
          <option value="true"  ${(e==null?void 0:e.active)!==!1?"selected":""}>Sí</option>
          <option value="false" ${(e==null?void 0:e.active)===!1?"selected":""}>No</option>
        </select>
      </div>

      <div class="form-group md:col-span-3">
        <label class="form-label">Condiciones especiales</label>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" class="btn btn-outline btn-sm" id="btn-special-conditions">
            <i class="fas fa-sliders"></i> Condiciones especiales
          </button>
          <span id="pf-special-summary" class="text-xs" style="color:#6B7280">${esc(uo(s))}</span>
        </div>
      </div>

      <!-- Fila 4: DIAN -->
      <div class="form-group">
        <label class="form-label">Código UNSPSC <small style="color:#9CA3AF">(DIAN)</small></label>
        <input id="pf-unspsc" class="form-input font-mono" value="${esc((e==null?void 0:e.unspsc_code)||"")}" placeholder="Ej: 44121618">
      </div>
      <div class="form-group">
        <label class="form-label">Código EAN / Barras</label>
        <input id="pf-ean" class="form-input font-mono" value="${esc((e==null?void 0:e.ean_code)||"")}" placeholder="Ej: 7702010123456">
      </div>
      <div class="form-group md:col-span-1"></div>

      <!-- Fila 5: cuentas contables -->
      <div class="form-group col-span-1 md:col-span-3">
        <p class="form-label mb-2" style="border-bottom:1px solid #F0F0F0;padding-bottom:6px">Cuentas contables asociadas</p>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta de ingresos</label>
        <select id="pf-income-acct" class="form-input">${o(e==null?void 0:e.income_account_id)}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta de costo / gasto</label>
        <select id="pf-cost-acct" class="form-input">${o(e==null?void 0:e.cost_account_id)}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta de inventario <small style="color:#9CA3AF">(solo bienes)</small></label>
        <select id="pf-inv-acct" class="form-input">${o(e==null?void 0:e.inventory_account_id)}</select>
      </div>

      <!-- Fila 6: descripción -->
      <div class="form-group md:col-span-3">
        <label class="form-label">Descripción</label>
        <textarea id="pf-desc" class="form-input" rows="2" placeholder="Descripción opcional para documentos comerciales">${esc((e==null?void 0:e.description)||"")}</textarea>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-product"><i class="fas fa-floppy-disk"></i> Guardar</button>`,!0),(n=$("#btn-save-product"))==null||n.addEventListener("click",async()=>{var l;const r=$("#btn-save-product");r&&(r.disabled=!0,r.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const p=getInputVal("pf-code").trim().toUpperCase(),f=getInputVal("pf-name").trim();if(!p)return showToast("El código es obligatorio","warning");if(!f)return showToast("El nombre es obligatorio","warning");if(!(e!=null&&e.id)){const d=pb.escapeFilterValue(p);if((await pb.list("products",{filter:`code="${d}"`,perPage:1})).items.length)return showToast(`Ya existe un producto con el código ${p}`,"warning")}const m={code:p,name:f,description:getInputVal("pf-desc").trim(),type:getSelectVal("pf-type"),unit:getSelectVal("pf-unit"),presentacion:getInputVal("pf-presentacion").trim(),categoria:getInputVal("pf-categoria").trim(),linea:getInputVal("pf-linea").trim(),iva_rate:Number(getSelectVal("pf-iva")||0),base_price:parseFloat(getInputVal("pf-base-price")||"0")||0,precio_venta_2:ct(getInputVal("pf-sale-price-2")),precio_venta_3:ct(getInputVal("pf-sale-price-3")),cost_price:parseFloat(getInputVal("pf-cost-price")||"0")||0,active:getSelectVal("pf-active")==="true",unspsc_code:getInputVal("pf-unspsc").trim(),ean_code:getInputVal("pf-ean").trim(),peso:s.peso,cajas_en_pallet:s.cajas_en_pallet,und_empaque:s.und_empaque,peso_x_und_empaque:s.peso_x_und_empaque,income_account_id:getSelectVal("pf-income-acct")||null,cost_account_id:getSelectVal("pf-cost-acct")||null,inventory_account_id:getSelectVal("pf-inv-acct")||null};if(e!=null&&e.id)await pb.update("products",e.id,m),await API.logAudit("UPDATE","Producto",e.id,`${m.code} — ${m.name}`),showToast("Producto actualizado","success");else{const d=await pb.create("products",m);await API.logAudit("CREATE","Producto",d.id,`${m.code} — ${m.name}`),showToast("Producto creado","success")}closeModal(),pa($("#page-content"))}catch(p){const f=(l=p==null?void 0:p.data)!=null&&l.data?Object.values(p.data.data).map(m=>m==null?void 0:m.message).filter(Boolean).join(" | "):"";showToast(f||p.message||"No se pudo guardar","error")}finally{r&&(r.disabled=!1,r.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar')}}),(i=$("#btn-special-conditions"))==null||i.addEventListener("click",()=>{_i(s,r=>{Object.assign(s,r);const l=$("#pf-special-summary");l&&(l.textContent=uo(s))})}),(c=$("#btn-catalog-form"))==null||c.addEventListener("click",()=>{cs(a,r=>{Object.assign(a,r);const l=document.getElementById("dl-categorias"),p=document.getElementById("dl-lineas");l&&(l.innerHTML=a.categories.map(f=>`<option value="${esc(f)}">`).join("")),p&&(p.innerHTML=a.lines.map(f=>`<option value="${esc(f)}">`).join(""))})})}async function zr(e){try{const[t,a,o]=await Promise.all([pb.get("products",e),API.getAccounts(!1),is()]);rs(t,a,o)}catch(t){showToast(t.message,"error")}}async function Wr(e,t){try{const a=await pb.update("products",e,{active:t});await API.logAudit("STATUS","Producto",e,`${a.code} → ${t?"Activo":"Inactivo"}`),showToast(`Producto ${t?"activado":"desactivado"}`,"success"),pa($("#page-content"))}catch(a){showToast(a.message,"error")}}function Yr(e,t){confirmDialog("Eliminar producto",`¿Confirmas eliminar <strong>${esc(t)}</strong>?<br><small style="color:#6B7280">Esta acción no se puede deshacer. Si el producto está referenciado en documentos, considera desactivarlo en lugar de eliminarlo.</small>`,async()=>{try{await pb.delete("products",e),await API.logAudit("DELETE","Producto",e,`Eliminado: ${t}`),showToast("Producto eliminado","success"),pa($("#page-content"))}catch(a){showToast(a.message,"error")}})}window.openProductForm=rs;window.PRODUCT_TYPES=ja;window.toNullableNumber=ct;window.toggleProductStatus=Wr;window.viewProductDetail=qr;window.saveProductCatalog=xi;window.IVA_RATES=Ha;window.emptyRow=$i;window.deleteProduct=Yr;window.openCatalogManagerModal=cs;window.renderProductos=pa;window.PRODUCT_UNITS=yi;window.editProduct=zr;window.filterProductTable=wi;window.renderProductRows=Ai;window.openSpecialConditionsModal=_i;window.kpiCard=Ut;window.specialConditionsSummary=uo;window.loadProductCatalog=is;const ua=[{value:"ENTRADA",label:"Entrada",icon:"fa-arrow-down",color:"#059669"},{value:"SALIDA",label:"Salida",icon:"fa-arrow-up",color:"#DC2626"},{value:"TRASLADO",label:"Traslado",icon:"fa-right-left",color:"#1A4B8C"},{value:"AJUSTE_POSITIVO",label:"Ajuste +",icon:"fa-plus-circle",color:"#059669"},{value:"AJUSTE_NEGATIVO",label:"Ajuste −",icon:"fa-minus-circle",color:"#C46516"}],ls={draft:{label:"Borrador",badge:"badge-gray"},applied:{label:"Aplicado",badge:"badge-green"},voided:{label:"Anulado",badge:"badge-orange"}};async function ds(e){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando inventario...</div>';try{const[t,a]=await Promise.all([API.getInventoryStock(),API.getWarehouses(!1)]);Ei(e,"stock",{stock:t,warehouses:a})}catch(t){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(t.message)}</div>`}}function Ei(e,t,a={}){const o=[{id:"stock",label:"Stock actual",icon:"fa-boxes-stacked"},{id:"movimientos",label:"Movimientos",icon:"fa-arrows-rotate"},{id:"bodegas",label:"Bodegas",icon:"fa-warehouse"}];e.innerHTML=`
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Gestión de Inventarios</h3>
        <p class="text-sm" style="color:#6B7280">Stock actual, movimientos (entradas/salidas/traslados) y bodegas.</p>
      </div>
    </div>
    <div class="flex gap-1 mb-5 border-b" style="border-color:#E5E7EB">
      ${o.map(i=>`
        <button class="tab-btn px-5 py-2 text-sm font-medium rounded-t-lg${i.id===t?" active":""}" data-tab="${i.id}">
          <i class="fas ${i.icon} mr-2"></i>${i.label}
        </button>`).join("")}
    </div>
    <div id="inv-tab-content"></div>`;const s=e.querySelector("#inv-tab-content");function n(i){e.querySelectorAll(".tab-btn").forEach(c=>c.classList.toggle("active",c.dataset.tab===i)),i==="stock"&&Ci(s,a),i==="movimientos"&&ps(s,a),i==="bodegas"&&Jt(s,a)}e.querySelectorAll(".tab-btn").forEach(i=>i.addEventListener("click",()=>n(i.dataset.tab))),n(t)}async function Ci(e,t={}){var a,o,s;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando stock...</div>';try{const[n,i]=await Promise.all([API.getInventoryStock(),API.getWarehouses(!1)]);t.stock=n,t.warehouses=i;const c=new Set(n.map(m=>m.product_id)).size,r=n.reduce((m,d)=>m+(d.qty_on_hand||0),0),l=n.filter(m=>(m.qty_on_hand||0)<=0).length,p=n.reduce((m,d)=>m+(d.qty_on_hand||0)*(d.avg_cost||0),0);e.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        ${Vt("SKUs en inventario",c,"fas fa-box","#1A4B8C","#EEF4FF")}
        ${Vt("Unidades totales",fmtN(r),"fas fa-cubes","#059669","#ECFDF5")}
        ${Vt("Sin stock",l,"fas fa-triangle-exclamation","#C46516","#FFF8F0")}
        ${Vt("Valor estimado",fmt(p),"fas fa-coins","#7C3AED","#F5F3FF")}
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3" style="border-color:#F0F0F0">
        <input id="st-q" class="form-input flex-1 min-w-48" placeholder="Buscar producto...">
        <select id="st-wh" class="form-input" style="max-width:220px">
          <option value="">Todas las bodegas</option>
          ${i.map(m=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("")}
        </select>
        <select id="st-status" class="form-input" style="max-width:180px">
          <option value="">Todo el stock</option>
          <option value="ok">Con stock</option>
          <option value="zero">Sin stock / Agotado</option>
        </select>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="stock-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Bodega</th>
                <th class="text-right">Stock</th>
                <th class="text-right">Costo prom.</th>
                <th class="text-right">Valor total</th>
                <th>Últ. movimiento</th>
              </tr>
            </thead>
            <tbody id="stock-tbody">
              ${n.length?Ti(n):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-boxes-stacked mr-2"></i>No hay stock registrado.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;const f=()=>Ii();(a=$("#st-q"))==null||a.addEventListener("input",debounce(f,150)),(o=$("#st-wh"))==null||o.addEventListener("change",f),(s=$("#st-status"))==null||s.addEventListener("change",f)}catch(n){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(n.message)}</div>`}}function Ti(e){return e.map(t=>{var r,l;const a=(r=t.expand)==null?void 0:r.product_id,o=(l=t.expand)==null?void 0:l.warehouse_id,s=t.qty_on_hand??0,n=t.avg_cost??0,i=s*n,c=s<=0;return`<tr data-whid="${esc(t.warehouse_id)}" data-qty="${s}">
      <td class="font-medium">${a?esc(a.name):'<span style="color:#9CA3AF">—</span>'}</td>
      <td><span class="font-mono text-xs" style="color:#1A4B8C">${a?esc(a.code):"—"}</span></td>
      <td>${o?esc(o.name):"—"}</td>
      <td class="text-right font-semibold ${c?"text-red-500":""}">${fmtN(s)}</td>
      <td class="text-right">${n?fmt(n):"—"}</td>
      <td class="text-right">${i?fmt(i):"—"}</td>
      <td class="text-sm" style="color:#6B7280">${esc(t.last_mov_date||"—")}</td>
    </tr>`}).join("")}function Ii(){const e=(getInputVal("st-q")||"").toLowerCase(),t=getSelectVal("st-wh"),a=getSelectVal("st-status");$$("#stock-table tbody tr[data-qty]").forEach(o=>{const s=o.textContent.toLowerCase(),n=parseFloat(o.dataset.qty??"0"),i=!e||s.includes(e),c=!t||o.dataset.whid===t,r=!a||(a==="ok"?n>0:n<=0);o.style.display=i&&c&&r?"":"none"})}async function ps(e,t={}){var a,o,s,n;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando movimientos...</div>';try{const[i,c,r]=await Promise.all([API.getInventoryMovements({perPage:100}),t.warehouses?Promise.resolve(t.warehouses):API.getWarehouses(!1),API.getProducts({activeOnly:!0})]);t.warehouses=c,t.products=r;const l=i.items||[];e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div class="flex flex-wrap gap-3">
          <input id="mov-q" class="form-input" style="min-width:200px" placeholder="Buscar número, tipo...">
          <select id="mov-type-f" class="form-input" style="max-width:180px">
            <option value="">Todos los tipos</option>
            ${ua.map(f=>`<option value="${f.value}">${f.label}</option>`).join("")}
          </select>
          <select id="mov-status-f" class="form-input" style="max-width:160px">
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="applied">Aplicado</option>
            <option value="voided">Anulado</option>
          </select>
        </div>
        ${can("canWrite")?'<button class="btn btn-primary" id="btn-new-mov"><i class="fas fa-plus"></i> Nuevo Movimiento</button>':""}
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="mov-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Bodega origen</th>
                <th>Bodega destino</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="mov-tbody">
              ${l.length?Si(l):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-arrows-rotate mr-2"></i>No hay movimientos registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;const p=()=>{const f=(getInputVal("mov-q")||"").toLowerCase(),m=getSelectVal("mov-type-f"),d=getSelectVal("mov-status-f");$$("#mov-table tbody tr[data-movid]").forEach(b=>{b.style.display=(!f||b.textContent.toLowerCase().includes(f))&&(!m||b.dataset.movtype===m)&&(!d||b.dataset.movstatus===d)?"":"none"})};(a=$("#mov-q"))==null||a.addEventListener("input",debounce(p,150)),(o=$("#mov-type-f"))==null||o.addEventListener("change",p),(s=$("#mov-status-f"))==null||s.addEventListener("change",p),(n=$("#btn-new-mov"))==null||n.addEventListener("click",()=>Ni(null,t,()=>ps(e,t)))}catch(i){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(i.message)}</div>`}}function Si(e){return e.map(t=>{var i,c;const a=ua.find(r=>r.value===t.mov_type),o=ls[t.status]||{label:t.status,badge:"badge-gray"},s=(i=t.expand)==null?void 0:i.warehouse_id,n=(c=t.expand)==null?void 0:c.dest_warehouse_id;return`<tr data-movid="${esc(t.id)}" data-movtype="${esc(t.mov_type)}" data-movstatus="${esc(t.status)}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(t.number)}</span></td>
      <td><span style="color:${(a==null?void 0:a.color)||"#6B7280"}"><i class="fas ${(a==null?void 0:a.icon)||"fa-box"} mr-1"></i>${esc((a==null?void 0:a.label)||t.mov_type)}</span></td>
      <td>${esc(t.date)}</td>
      <td>${s?esc(s.name):"—"}</td>
      <td>${n?esc(n.name):"—"}</td>
      <td><span class="badge ${o.badge}">${o.label}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewMovDetail('${esc(t.id)}')"><i class="fas fa-eye"></i></button>
          ${t.status==="draft"&&can("canWrite")?`<button class="btn btn-primary btn-sm" title="Aplicar movimiento" onclick="applyMovement('${esc(t.id)}')"><i class="fas fa-check"></i></button>`:""}
          ${t.status==="applied"&&can("canWrite")?`<button class="btn btn-outline btn-sm" title="Anular" onclick="voidMovement('${esc(t.id)}', '${esc(t.number)}')"><i class="fas fa-ban"></i></button>`:""}
        </div>
      </td>
    </tr>`}).join("")}async function Jr(e){var t,a,o;try{const[s,n]=await Promise.all([pb.get("inventory_movements",e,{expand:"warehouse_id,dest_warehouse_id,third_party_id"}),API.getInventoryMovementLines(e)]),i=ua.find(f=>f.value===s.mov_type),c=ls[s.status]||{label:s.status,badge:"badge-gray"},r=(t=s.expand)==null?void 0:t.warehouse_id,l=(a=s.expand)==null?void 0:a.dest_warehouse_id,p=(o=s.expand)==null?void 0:o.third_party_id;openModal(`Movimiento — ${esc(s.number)}`,`<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
        <div><span class="form-label">Número</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(s.number)}</p></div>
        <div><span class="form-label">Tipo</span><p style="color:${i==null?void 0:i.color}">${esc((i==null?void 0:i.label)||s.mov_type)}</p></div>
        <div><span class="form-label">Fecha</span><p>${esc(s.date)}</p></div>
        <div><span class="form-label">Bodega origen</span><p>${r?esc(r.name):"—"}</p></div>
        <div><span class="form-label">Bodega destino</span><p>${l?esc(l.name):"—"}</p></div>
        <div><span class="form-label">Estado</span><p><span class="badge ${c.badge}">${c.label}</span></p></div>
        ${p?`<div class="md:col-span-3"><span class="form-label">Tercero</span><p>${esc(p.name)}</p></div>`:""}
        ${s.notes?`<div class="md:col-span-3"><span class="form-label">Notas</span><p>${esc(s.notes)}</p></div>`:""}
      </div>
      <div class="border rounded-xl overflow-hidden" style="border-color:#F0F0F0">
        <table class="data-table">
          <thead><tr><th>Producto</th><th>Código</th><th class="text-right">Cantidad</th><th class="text-right">Costo unit.</th><th class="text-right">Total</th></tr></thead>
          <tbody>
            ${n.map(f=>{var d;const m=(d=f.expand)==null?void 0:d.product_id;return`<tr>
                <td>${m?esc(m.name):"—"}</td>
                <td class="font-mono text-xs">${m?esc(m.code):"—"}</td>
                <td class="text-right font-semibold">${fmtN(f.qty)}</td>
                <td class="text-right">${f.unit_cost?fmt(f.unit_cost):"—"}</td>
                <td class="text-right">${f.unit_cost?fmt(f.qty*f.unit_cost):"—"}</td>
              </tr>`}).join("")}
          </tbody>
        </table>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch(s){showToast(s.message,"error")}}async function Kr(e){confirmDialog("Aplicar movimiento","¿Confirmas aplicar este movimiento? Se actualizará el stock de las bodegas y no se podrá deshacer salvo anulación.",async()=>{try{await API.applyInventoryMovement(e),showToast("Movimiento aplicado. Stock actualizado.","success"),ds($("#page-content"))}catch(t){showToast(t.message,"error")}})}function Qr(e,t){confirmDialog("Anular movimiento",`¿Confirmas anular el movimiento <strong>${esc(t)}</strong>? El stock será revertido.`,async()=>{try{await API.voidInventoryMovement(e),showToast("Movimiento anulado. Stock revertido.","success"),ds($("#page-content"))}catch(a){showToast(a.message,"error")}})}async function Ni(e=null,t={},a=null){var r,l,p;const o=t.warehouses||await API.getWarehouses(!0),s=t.products||await API.getProducts({activeOnly:!0});let n=0;function i(f={}){var u;n++;const m=n,d=document.getElementById("mov-lines-body");if(!d)return;const b=document.createElement("tr");if(b.id=`mov-line-${m}`,b.innerHTML=`
      <td>
        <select class="form-input" id="ml-prod-${m}" style="min-width:180px">
          <option value="">— Producto —</option>
          ${s.filter(y=>y.type==="BIEN").map(y=>`<option value="${esc(y.id)}" data-cost="${y.cost_price||0}">${esc(y.code)} — ${esc(y.name)}</option>`).join("")}
        </select>
      </td>
      <td><input id="ml-qty-${m}" type="number" min="0.0001" step="0.0001" class="form-input text-right" style="min-width:90px" placeholder="0" value="${f.qty??""}"></td>
      <td><input id="ml-cost-${m}" type="number" min="0" step="0.01" class="form-input text-right" style="min-width:100px" placeholder="0.00" value="${f.unit_cost??""}"></td>
      <td><input id="ml-notes-${m}" class="form-input" style="min-width:120px" placeholder="Nota" value="${esc(f.notes||"")}"></td>
      <td><button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('mov-line-${m}').remove()"><i class="fas fa-times"></i></button></td>`,d.appendChild(b),(u=document.getElementById(`ml-prod-${m}`))==null||u.addEventListener("change",function(){const y=this.selectedOptions[0],v=document.getElementById(`ml-cost-${m}`);y&&y.dataset.cost&&v&&!v.value&&(v.value=y.dataset.cost)}),f.product_id){const y=document.getElementById(`ml-prod-${m}`);y&&(y.value=f.product_id)}}const c=()=>getSelectVal("mf-type")==="TRASLADO";openModal("Nuevo Movimiento de Inventario",`<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="form-group">
        <label class="form-label">Tipo <span style="color:#EF4444">*</span></label>
        <select id="mf-type" class="form-input">
          ${ua.map(f=>`<option value="${f.value}">${f.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha <span style="color:#EF4444">*</span></label>
        <input id="mf-date" type="date" class="form-input" value="${todayStr()}">
      </div>
      <div class="form-group">
        <label class="form-label">Bodega origen <span style="color:#EF4444">*</span></label>
        <select id="mf-wh" class="form-input">
          <option value="">— Seleccionar —</option>
          ${o.map(f=>`<option value="${esc(f.id)}">${esc(f.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group" id="dest-wh-row" style="display:none">
        <label class="form-label">Bodega destino <span style="color:#EF4444">*</span></label>
        <select id="mf-dest-wh" class="form-input">
          <option value="">— Seleccionar —</option>
          ${o.map(f=>`<option value="${esc(f.id)}">${esc(f.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Notas</label>
        <input id="mf-notes" class="form-input" placeholder="Observaciones del movimiento">
      </div>
    </div>

    <!-- Líneas -->
    <div class="border rounded-xl overflow-hidden mb-3" style="border-color:#E5E7EB">
      <div class="flex items-center justify-between px-4 py-2" style="background:#F9FAFB">
        <span class="text-sm font-semibold" style="color:#0D2137">Productos</span>
        <button type="button" class="btn btn-outline btn-sm" id="btn-add-line"><i class="fas fa-plus"></i> Agregar línea</button>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th class="text-right">Cantidad</th>
              <th class="text-right">Costo unit.</th>
              <th>Nota línea</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="mov-lines-body"></tbody>
        </table>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-mov"><i class="fas fa-floppy-disk"></i> Guardar borrador</button>`,!0),(r=document.getElementById("mf-type"))==null||r.addEventListener("change",()=>{const f=document.getElementById("dest-wh-row");f&&(f.style.display=c()?"":"none")}),(l=document.getElementById("btn-add-line"))==null||l.addEventListener("click",()=>i()),i(),(p=document.getElementById("btn-save-mov"))==null||p.addEventListener("click",async()=>{const f=document.getElementById("btn-save-mov");f&&(f.disabled=!0,f.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const m=getSelectVal("mf-type"),d=getInputVal("mf-date"),b=getSelectVal("mf-wh"),u=getSelectVal("mf-dest-wh"),y=getInputVal("mf-notes");if(!m)return showToast("Selecciona el tipo de movimiento","warning");if(!d)return showToast("La fecha es obligatoria","warning");if(!b)return showToast("Selecciona la bodega origen","warning");if(m==="TRASLADO"&&!u)return showToast("Selecciona la bodega destino","warning");const v=[];let g=1;for(;;){const N=document.getElementById(`ml-prod-${g}`);if(!N){if(g++,g>n+5)break;continue}const I=N.value,S=parseFloat(getInputVal(`ml-qty-${g}`)||"0"),w=parseFloat(getInputVal(`ml-cost-${g}`)||"0"),E=getInputVal(`ml-notes-${g}`)||"";if(I&&S>0&&v.push({product_id:I,qty:S,unit_cost:w||null,notes:E,line_order:v.length+1}),g++,g>n+2)break}if(!v.length)return showToast("Agrega al menos una línea con producto y cantidad","warning");const h=d.replaceAll("-",""),_=String(Date.now()).slice(-4),A=`INV-${h}-${_}`,C={number:A,mov_type:m,date:d,warehouse_id:b,dest_warehouse_id:u||null,notes:y,status:"draft"},T=await pb.create("inventory_movements",C);for(const N of v)await pb.create("inventory_movement_lines",{movement_id:T.id,...N});await API.logAudit("CREATE","InventoryMovement",T.id,`${m} — ${A}`),showToast("Movimiento guardado como borrador. Aplícalo cuando estés listo.","success"),closeModal(),a&&a()}catch(m){showToast(m.message||"No se pudo guardar","error")}finally{f&&(f.disabled=!1,f.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar borrador')}})}async function Jt(e,t={}){var a;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando bodegas...</div>';try{const o=await API.getWarehouses(!1);t.warehouses=o,e.innerHTML=`
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm" style="color:#6B7280">${o.length} bodega(s) registrada(s).</p>
        ${can("canWrite")?'<button class="btn btn-primary" id="btn-new-wh"><i class="fas fa-plus"></i> Nueva Bodega</button>':""}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="wh-cards">
        ${o.length?o.map(s=>Li(s)).join(""):'<div class="md:col-span-3 text-center py-10" style="color:#9CA3AF"><i class="fas fa-warehouse mr-2"></i>No hay bodegas. Crea la primera.</div>'}
      </div>`,(a=$("#btn-new-wh"))==null||a.addEventListener("click",()=>mo(null,()=>Jt(e,t))),$$(".btn-edit-wh").forEach(s=>s.addEventListener("click",()=>{const n=o.find(i=>i.id===s.dataset.id);n&&mo(n,()=>Jt(e,t))})),$$(".btn-toggle-wh").forEach(s=>s.addEventListener("click",async()=>{try{const n=o.find(i=>i.id===s.dataset.id);await pb.update("warehouses",n.id,{active:!n.active}),await API.logAudit("STATUS","Bodega",n.id,`${n.name} → ${n.active?"Inactiva":"Activa"}`),showToast(`Bodega ${n.active?"desactivada":"activada"}`,"success"),Jt(e,t)}catch(n){showToast(n.message,"error")}}))}catch(o){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(o.message)}</div>`}}function Li(e){return`<div class="bg-white rounded-2xl border p-4" style="border-color:#F0F0F0">
    <div class="flex items-start justify-between mb-2">
      <div>
        <p class="font-mono text-xs font-semibold mb-1" style="color:#1A4B8C">${esc(e.code)}</p>
        <h4 class="font-bold text-sm" style="color:#0D2137">${esc(e.name)}</h4>
      </div>
      ${e.active?'<span class="badge badge-green">Activa</span>':'<span class="badge badge-gray">Inactiva</span>'}
    </div>
    ${e.address?`<p class="text-xs mb-2" style="color:#6B7280"><i class="fas fa-location-dot mr-1"></i>${esc(e.address)}</p>`:""}
    ${e.notes?`<p class="text-xs mb-2" style="color:#9CA3AF">${esc(e.notes)}</p>`:""}
    ${can("canWrite")?`<div class="flex gap-2 mt-3">
      <button class="btn btn-outline btn-sm flex-1 btn-edit-wh" data-id="${esc(e.id)}"><i class="fas fa-pen"></i> Editar</button>
      <button class="btn btn-outline btn-sm btn-toggle-wh" data-id="${esc(e.id)}" title="${e.active?"Desactivar":"Activar"}">
        <i class="fas ${e.active?"fa-toggle-on":"fa-toggle-off"}"></i></button>
    </div>`:""}
  </div>`}function mo(e=null,t=null){var a;openModal(e?`Editar bodega — ${esc(e.code)}`:"Nueva Bodega",`<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código <span style="color:#EF4444">*</span></label>
        <input id="wf-code" class="form-input font-mono" value="${esc((e==null?void 0:e.code)||"")}" placeholder="BG-01" oninput="this.value=this.value.toUpperCase()" style="text-transform:uppercase">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span style="color:#EF4444">*</span></label>
        <input id="wf-name" class="form-input" value="${esc((e==null?void 0:e.name)||"")}" placeholder="Bodega principal">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Dirección</label>
        <input id="wf-address" class="form-input" value="${esc((e==null?void 0:e.address)||"")}" placeholder="Cra. 1 #23-45, Bogotá">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Notas</label>
        <textarea id="wf-notes" class="form-input" rows="2" placeholder="Descripción u observaciones">${esc((e==null?void 0:e.notes)||"")}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Activa</label>
        <select id="wf-active" class="form-input">
          <option value="true"  ${(e==null?void 0:e.active)!==!1?"selected":""}>Sí</option>
          <option value="false" ${(e==null?void 0:e.active)===!1?"selected":""}>No</option>
        </select>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-wh"><i class="fas fa-floppy-disk"></i> Guardar</button>`,!1),(a=document.getElementById("btn-save-wh"))==null||a.addEventListener("click",async()=>{const o=document.getElementById("btn-save-wh");o&&(o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const s=getInputVal("wf-code").trim().toUpperCase(),n=getInputVal("wf-name").trim();if(!s)return showToast("El código es obligatorio","warning");if(!n)return showToast("El nombre es obligatorio","warning");if(!(e!=null&&e.id)&&(await pb.list("warehouses",{filter:`code="${pb.escapeFilterValue(s)}"`,perPage:1})).items.length)return showToast(`Ya existe una bodega con el código ${s}`,"warning");const i={code:s,name:n,address:getInputVal("wf-address").trim(),notes:getInputVal("wf-notes").trim(),active:getSelectVal("wf-active")==="true"};if(e!=null&&e.id)await pb.update("warehouses",e.id,i),await API.logAudit("UPDATE","Bodega",e.id,`${s} — ${n}`);else{const c=await pb.create("warehouses",i);await API.logAudit("CREATE","Bodega",c.id,`${s} — ${n}`)}showToast("Bodega guardada","success"),closeModal(),t&&t()}catch(s){showToast(s.message||"No se pudo guardar","error")}finally{o&&(o.disabled=!1,o.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar')}})}function Vt(e,t,a,o,s){return`<div class="rounded-2xl p-4" style="background:${s}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${a} text-sm" style="color:${o}"></i>
      <span class="text-xs font-semibold" style="color:${o}">${e}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${o}">${t}</p>
  </div>`}window.renderStockTab=Ci;window.filterStockTable=Ii;window.openWarehouseForm=mo;window.renderBodegasTab=Jt;window.renderMovimientosTab=ps;window.applyMovement=Kr;window.renderStockRows=Ti;window.voidMovement=Qr;window.whCard=Li;window.invKpi=Vt;window.INV_STATUS_META=ls;window.openMovForm=Ni;window.renderInventario=ds;window.renderMovRows=Si;window.viewMovDetail=Jr;window._renderInvPage=Ei;window.INV_MOV_TYPES=ua;const us={draft:{label:"Borrador",badge:"badge-orange"},posted:{label:"Contabilizada",badge:"badge-green"},voided:{label:"Anulada",badge:"badge-red"}},ms="purchase_config_v1",Pi=[{value:"BIEN",label:"Bien (Inventariable)"},{value:"SERVICIO",label:"Servicio"}],Fi=["UND","KG","L","M","M2","M3","PAQ","CJ","HORA","MES"],fs=[0,5,19];function Di(e){if(!e)return"—";const t=new Date(String(e).replace(" ","T"));return Number.isNaN(t.getTime())?String(e):t.toLocaleString("es-CO",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}function bs(e,t){const{title:a,messageHtml:o,actionLabel:s="Confirmar",actionClass:n="btn-primary",placeholder:i="Describe el motivo..."}=e||{};openModal(a||"Motivo requerido",`<div class="space-y-4 text-sm">
      <div style="color:#374151">${o||""}</div>
      <div>
        <label class="form-label">Motivo obligatorio</label>
        <textarea id="po-action-reason" class="form-input" rows="4" placeholder="${esc(i)}"></textarea>
        <p class="text-xs mt-2" style="color:#6B7280">Este motivo quedará registrado en la auditoría de la compra.</p>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn ${n}" id="po-action-confirm-btn">${s}</button>`),setTimeout(()=>{const c=document.getElementById("po-action-reason"),r=document.getElementById("po-action-confirm-btn");c==null||c.focus(),r==null||r.addEventListener("click",async()=>{const l=String((c==null?void 0:c.value)||"").trim();if(l.length<8){showToast("Indica un motivo claro de al menos 8 caracteres.","warning"),c==null||c.focus();return}r&&(r.disabled=!0,r.textContent="Procesando...");try{await t(l),closeModal()}catch(p){showToast(p.message||"No fue posible completar la acción.","error"),r&&(r.disabled=!1,r.textContent=s)}},{once:!0})},50)}function Ca(){return{operational:{allow_services_without_product:!1,require_warehouse_for_goods:!0,enable_discounts:!0,enable_freight:!0,enable_withholdings:!0,withholdings:{reterenta:!0,reteiva:!1,reteica:!1},default_due_days:30},accounting:{accounts:{payable_code:"220505",expense_fallback_code:"5135",iva_by_rate:{5:"233501",19:"233502"},discount_code:"",freight_code:""},withholding_rules:[{id:"wr-ret-renta-3_5",concept:"RETERENTA",base_type:"SUBTOTAL",min_base:0,rate:3.5,account_code:""}]}}}function gs(e){var l,p,f;const t=Ca(),a=(e==null?void 0:e.operational)||{},o=(e==null?void 0:e.accounting)||{},s=(o==null?void 0:o.accounts)||{},n=s.iva_by_rate&&typeof s.iva_by_rate=="object"?s.iva_by_rate:{},i={};if(Object.keys(n).forEach(m=>{const d=String(m).trim();d&&(i[d]=String(n[m]||"").trim())}),!Object.keys(i).length){const m=String(s.iva_discountable_code||"").trim();m&&(i[19]=m)}const r=(Array.isArray(o.withholding_rules)?o.withholding_rules:[]).map((m,d)=>({id:String((m==null?void 0:m.id)||`wr-${Date.now()}-${d}`).trim(),concept:String((m==null?void 0:m.concept)||"").trim().toUpperCase(),base_type:String((m==null?void 0:m.base_type)||"SUBTOTAL").trim().toUpperCase(),min_base:Math.max(0,Number((m==null?void 0:m.min_base)||0)||0),rate:Math.max(0,Number((m==null?void 0:m.rate)||0)||0),account_code:String((m==null?void 0:m.account_code)||"").trim()})).filter(m=>m.concept&&m.rate>0);if(!r.length){const m=[];[["RETERENTA",s.reterenta_code],["RETEIVA",s.reteiva_code],["RETEICA",s.reteica_code]].forEach(([b,u],y)=>{const v=String(u||"").trim();v&&m.push({id:`wr-legacy-${y}`,concept:b,base_type:"SUBTOTAL",min_base:0,rate:b==="RETEICA"?.414:b==="RETEIVA"?15:3.5,account_code:v})}),m.length&&r.push(...m)}return{operational:{allow_services_without_product:!1,require_warehouse_for_goods:a.require_warehouse_for_goods!==!1,enable_discounts:a.enable_discounts!==!1,enable_freight:a.enable_freight!==!1,enable_withholdings:a.enable_withholdings!==!1,withholdings:{reterenta:((l=a==null?void 0:a.withholdings)==null?void 0:l.reterenta)!==!1,reteiva:!!((p=a==null?void 0:a.withholdings)!=null&&p.reteiva),reteica:!!((f=a==null?void 0:a.withholdings)!=null&&f.reteica)},default_due_days:Math.max(0,Number(a.default_due_days??t.operational.default_due_days)||0)},accounting:{accounts:{payable_code:String(s.payable_code||t.accounting.accounts.payable_code).trim(),expense_fallback_code:String(s.expense_fallback_code||t.accounting.accounts.expense_fallback_code).trim(),iva_by_rate:Object.keys(i).length?i:{...t.accounting.accounts.iva_by_rate},discount_code:String(s.discount_code||"").trim(),freight_code:String(s.freight_code||"").trim()},withholding_rules:r.length?r:[...t.accounting.withholding_rules]}}}async function vs(){try{const e=await API.getSetting(ms);return e?gs(JSON.parse(e)):Ca()}catch{return Ca()}}async function Ri(e){const t=gs(e||{});return await API.setSetting(ms,JSON.stringify(t)),await API.logAudit("CONFIG","PurchaseConfig",null,"Configuracion de compras actualizada"),t}function fo(e,t){if(!e||!t)return e||"";const a=new Date(`${e}T00:00:00`);if(Number.isNaN(a.getTime()))return e;a.setDate(a.getDate()+Number(t||0));const o=a.getFullYear(),s=String(a.getMonth()+1).padStart(2,"0"),n=String(a.getDate()).padStart(2,"0");return`${o}-${s}-${n}`}async function Oi(e=null){var t,a,o;try{const[s,n]=await Promise.all([vs(),API.getAccounts(!0)]),i=(u="")=>`<option value="">— Sin definir —</option>${n.filter(v=>v.active&&Number(v.level)>=3).sort((v,g)=>v.code.localeCompare(g.code)).map(v=>`<option value="${esc(v.code)}"${v.code===u?" selected":""}>${esc(v.code)} — ${esc(v.name)}</option>`).join("")}`,c=Array.from(new Set([...fs.map(u=>String(u)),...Object.keys(s.accounting.accounts.iva_by_rate||{})])).sort((u,y)=>Number(u)-Number(y));openModal("Configuración de Compras",`<div class="space-y-5">
        <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
          <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-sliders mr-2"></i>Parámetros operativos</h4>
          <p class="text-xs mb-3" style="color:#6B7280">Define opciones habilitadas para el registro de compras.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <label class="inline-flex items-center gap-2"><input id="po-cfg-req-wh" type="checkbox" ${s.operational.require_warehouse_for_goods?"checked":""}>Exigir bodega cuando hay bienes</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-discount" type="checkbox" ${s.operational.enable_discounts?"checked":""}>Habilitar descuentos</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-freight" type="checkbox" ${s.operational.enable_freight?"checked":""}>Habilitar fletes</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-withholding" type="checkbox" ${s.operational.enable_withholdings?"checked":""}>Habilitar retenciones</label>
            <div class="form-group mb-0">
              <label class="form-label">Plazo por defecto (días)</label>
              <input id="po-cfg-default-due" class="form-input" type="number" min="0" step="1" value="${esc(String(s.operational.default_due_days||0))}">
            </div>
          </div>
          <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <label class="inline-flex items-center gap-2"><input id="po-cfg-ret-renta" type="checkbox" ${s.operational.withholdings.reterenta?"checked":""}>ReteRenta</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-ret-iva" type="checkbox" ${s.operational.withholdings.reteiva?"checked":""}>ReteIVA</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-ret-ica" type="checkbox" ${s.operational.withholdings.reteica?"checked":""}>ReteICA</label>
          </div>
        </div>

        <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
          <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-book mr-2"></i>Parámetros contables</h4>
          <p class="text-xs mb-3" style="color:#6B7280">Estas cuentas se usan en la contabilización automática de la compra.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="form-group mb-0">
              <label class="form-label">Cuenta proveedores (Cr)</label>
              <select id="po-cfg-payable" class="form-input">${i(s.accounting.accounts.payable_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta gasto fallback (SERVICIO)</label>
              <select id="po-cfg-exp-fallback" class="form-input">${i(s.accounting.accounts.expense_fallback_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta descuentos</label>
              <select id="po-cfg-discount-acct" class="form-input">${i(s.accounting.accounts.discount_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta fletes</label>
              <select id="po-cfg-freight-acct" class="form-input">${i(s.accounting.accounts.freight_code)}</select>
            </div>
          </div>
          <div class="mt-4 rounded-xl border p-3" style="border-color:#E5E7EB;background:#fff">
            <div class="flex items-center justify-between mb-2">
              <label class="form-label" style="margin-bottom:0">Cuentas IVA descontable por tarifa</label>
              <button type="button" class="btn btn-outline btn-sm" id="btn-po-cfg-add-iva-rate"><i class="fas fa-plus"></i> Agregar tarifa</button>
            </div>
            <div id="po-cfg-iva-rates-wrap" class="space-y-2"></div>
            <p class="text-xs mt-2" style="color:#6B7280">La contabilización buscará la cuenta según el IVA % de cada línea.</p>
          </div>
          <div class="mt-4 rounded-xl border p-3" style="border-color:#E5E7EB;background:#fff">
            <div class="flex items-center justify-between mb-2">
              <label class="form-label" style="margin-bottom:0">Reglas de retención (base/tarifa/concepto)</label>
              <button type="button" class="btn btn-outline btn-sm" id="btn-po-cfg-add-ret-rule"><i class="fas fa-plus"></i> Agregar regla</button>
            </div>
            <div id="po-cfg-ret-rules-wrap" class="space-y-2"></div>
            <p class="text-xs mt-2" style="color:#6B7280">Cada regla define concepto, base, base mínima, tarifa y cuenta contable de retención.</p>
          </div>
        </div>
      </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" id="btn-save-po-config"><i class="fas fa-floppy-disk"></i> Guardar configuración</button>`,!0);const r=document.getElementById("po-cfg-iva-rates-wrap"),l=(u="",y="")=>{var g;if(!r)return;const v=document.createElement("div");v.className="grid grid-cols-12 gap-2 items-center",v.innerHTML=`
        <div class="col-span-3">
          <input class="form-input po-cfg-iva-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${esc(String(u||""))}">
        </div>
        <div class="col-span-8">
          <select class="form-input po-cfg-iva-acct">${i(y)}</select>
        </div>
        <div class="col-span-1 text-right">
          <button type="button" class="btn btn-danger btn-sm po-cfg-iva-del"><i class="fas fa-trash"></i></button>
        </div>`,(g=v.querySelector(".po-cfg-iva-del"))==null||g.addEventListener("click",()=>v.remove()),r.appendChild(v)};c.length?c.forEach(u=>{var y;return l(u,((y=s.accounting.accounts.iva_by_rate)==null?void 0:y[u])||"")}):l("19",""),(t=document.getElementById("btn-po-cfg-add-iva-rate"))==null||t.addEventListener("click",()=>l("",""));const p=document.getElementById("po-cfg-ret-rules-wrap"),f=["RETERENTA","RETEIVA","RETEICA","OTRA"],m=["SUBTOTAL","IVA","TOTAL"],d=(u={})=>{var v;if(!p)return;const y=document.createElement("div");y.className="grid grid-cols-12 gap-2 items-center",y.innerHTML=`
        <div class="col-span-2"><select class="form-input po-cfg-ret-concept">${f.map(g=>`<option value="${g}"${String(u.concept||"")===g?" selected":""}>${g}</option>`).join("")}</select></div>
        <div class="col-span-2"><select class="form-input po-cfg-ret-base-type">${m.map(g=>`<option value="${g}"${String(u.base_type||"SUBTOTAL")===g?" selected":""}>${g}</option>`).join("")}</select></div>
        <div class="col-span-2"><input class="form-input po-cfg-ret-min-base" type="number" min="0" step="0.01" placeholder="Base mín." value="${esc(String(u.min_base??0))}"></div>
        <div class="col-span-2"><input class="form-input po-cfg-ret-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${esc(String(u.rate??0))}"></div>
        <div class="col-span-3"><select class="form-input po-cfg-ret-account">${i(u.account_code||"")}</select></div>
        <div class="col-span-1 text-right"><button type="button" class="btn btn-danger btn-sm po-cfg-ret-del"><i class="fas fa-trash"></i></button></div>`,(v=y.querySelector(".po-cfg-ret-del"))==null||v.addEventListener("click",()=>y.remove()),p.appendChild(y)},b=Array.isArray(s.accounting.withholding_rules)?s.accounting.withholding_rules:[];b.length?b.forEach(u=>d(u)):d({concept:"RETERENTA",base_type:"SUBTOTAL",min_base:0,rate:3.5,account_code:""}),(a=document.getElementById("btn-po-cfg-add-ret-rule"))==null||a.addEventListener("click",()=>d({concept:"RETERENTA",base_type:"SUBTOTAL",min_base:0,rate:0,account_code:""})),(o=$("#btn-save-po-config"))==null||o.addEventListener("click",async()=>{try{const u={};(document.querySelectorAll("#po-cfg-iva-rates-wrap .grid")||[]).forEach(g=>{var A,C;const h=String(((A=g.querySelector(".po-cfg-iva-rate"))==null?void 0:A.value)||"").trim(),_=String(((C=g.querySelector(".po-cfg-iva-acct"))==null?void 0:C.value)||"").trim();h&&(u[h]=_)});const y=[];(document.querySelectorAll("#po-cfg-ret-rules-wrap .grid")||[]).forEach((g,h)=>{var I,S,w,E,L;const _=String(((I=g.querySelector(".po-cfg-ret-concept"))==null?void 0:I.value)||"").trim().toUpperCase(),A=String(((S=g.querySelector(".po-cfg-ret-base-type"))==null?void 0:S.value)||"SUBTOTAL").trim().toUpperCase(),C=Math.max(0,Number(((w=g.querySelector(".po-cfg-ret-min-base"))==null?void 0:w.value)||0)||0),T=Math.max(0,Number(((E=g.querySelector(".po-cfg-ret-rate"))==null?void 0:E.value)||0)||0),N=String(((L=g.querySelector(".po-cfg-ret-account"))==null?void 0:L.value)||"").trim();!_||T<=0||y.push({id:`wr-${Date.now()}-${h}`,concept:_,base_type:A,min_base:C,rate:T,account_code:N})});const v={operational:{allow_services_without_product:!1,require_warehouse_for_goods:getCheckVal("po-cfg-req-wh"),enable_discounts:getCheckVal("po-cfg-discount"),enable_freight:getCheckVal("po-cfg-freight"),enable_withholdings:getCheckVal("po-cfg-withholding"),default_due_days:Math.max(0,parseInt(getInputVal("po-cfg-default-due")||"0",10)||0),withholdings:{reterenta:getCheckVal("po-cfg-ret-renta"),reteiva:getCheckVal("po-cfg-ret-iva"),reteica:getCheckVal("po-cfg-ret-ica")}},accounting:{accounts:{payable_code:getSelectVal("po-cfg-payable")||"220505",expense_fallback_code:getSelectVal("po-cfg-exp-fallback")||"5135",iva_by_rate:u,discount_code:getSelectVal("po-cfg-discount-acct")||"",freight_code:getSelectVal("po-cfg-freight-acct")||""},withholding_rules:y}};await Ri(v),showToast("Configuración de compras guardada","success"),closeModal(),typeof e=="function"&&e()}catch(u){showToast(u.message||"No se pudo guardar la configuración","error")}})}catch(s){showToast(s.message||"No se pudo abrir la configuración de compras","error")}}async function ma(e){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando compras...</div>';try{await Ta(e)}catch(t){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(t.message)}</div>`}}async function Ta(e){var r,l,p,f,m,d;const a=(await API.getPurchaseInvoices({perPage:100,sort:"-date"})).items||[],o=a.length,s=a.filter(b=>b.status==="draft").length,n=a.filter(b=>b.status==="posted").length,i=a.filter(b=>b.status!=="voided").reduce((b,u)=>b+(u.total||0),0);e.innerHTML=`
    <!-- KPIs -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Compras de Bienes y Servicios</h3>
        <p class="text-sm" style="color:#6B7280">Facturas de compra con contabilización automática e integración de inventario.</p>
      </div>
      ${can("canWrite")?'<div class="flex gap-2"><button class="btn btn-outline" id="btn-po-config" title="Configuración de compras"><i class="fas fa-gear"></i></button><button class="btn btn-primary" id="btn-new-purchase"><i class="fas fa-plus"></i> Nueva Factura de Compra</button></div>':""}
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      ${jt("Total facturas",o,"fas fa-file-invoice-dollar","#1A4B8C","#EEF4FF")}
      ${jt("Borradores",s,"fas fa-pencil","#C46516","#FFF8F0")}
      ${jt("Contabilizadas",n,"fas fa-check-circle","#059669","#ECFDF5")}
      ${jt("Valor total compras",fmt(i),"fas fa-coins","#7C3AED","#F5F3FF")}
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center" style="border-color:#F0F0F0">
      <input id="po-q" class="form-input flex-1 min-w-48" placeholder="Buscar número, proveedor, referencia...">
      <select id="po-status-f" class="form-input" style="max-width:180px">
        <option value="">Todos los estados</option>
        <option value="draft">Borrador</option>
        <option value="posted">Contabilizada</option>
        <option value="voided">Anulada</option>
      </select>
      <input id="po-from" type="date" class="form-input" style="max-width:160px" title="Desde">
      <input id="po-to"   type="date" class="form-input" style="max-width:160px" title="Hasta">
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto">
        <table class="data-table" id="po-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Ref. proveedor</th>
              <th>Bodega</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">IVA</th>
              <th class="text-right">Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="po-tbody">
            ${a.length?a.map(ki).join(""):'<tr><td colspan="10" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-file-invoice-dollar mr-2"></i>No hay facturas de compra.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`,(r=$("#btn-new-purchase"))==null||r.addEventListener("click",()=>hs(null,()=>Ta(e))),(l=$("#btn-po-config"))==null||l.addEventListener("click",()=>Oi(()=>Ta(e)));const c=()=>Mi();(p=$("#po-q"))==null||p.addEventListener("input",debounce(c,150)),(f=$("#po-status-f"))==null||f.addEventListener("change",c),(m=$("#po-from"))==null||m.addEventListener("change",c),(d=$("#po-to"))==null||d.addEventListener("change",c)}function ki(e){var s,n;const t=us[e.status]||{label:e.status,badge:"badge-gray"},a=(s=e.expand)==null?void 0:s.supplier_id,o=(n=e.expand)==null?void 0:n.warehouse_id;return`<tr data-poid="${esc(e.id)}" data-postatus="${esc(e.status)}" data-podate="${esc(e.date)}">
    <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(e.number)}</span></td>
    <td>${esc(e.date)}</td>
    <td class="font-medium">${a?esc(a.name):"—"}</td>
    <td class="text-sm" style="color:#6B7280">${esc(e.supplier_ref||"—")}</td>
    <td class="text-sm">${o?esc(o.name):"—"}</td>
    <td class="text-right">${fmt(e.subtotal||0)}</td>
    <td class="text-right">${e.iva_total?fmt(e.iva_total):"—"}</td>
    <td class="text-right font-semibold">${fmt(e.total||0)}</td>
    <td><span class="badge ${t.badge}">${t.label}</span></td>
    <td>
      <div class="flex gap-1">
        <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewPurchaseDetail('${esc(e.id)}')"><i class="fas fa-eye"></i></button>
        ${e.status==="draft"&&can("canWrite")?`<button class="btn btn-outline btn-sm" title="Editar" style="border-color:#1A4B8C;color:#1A4B8C" onclick="editPurchase('${esc(e.id)}')"><i class="fas fa-pen"></i></button>`:""}
        ${e.status==="draft"&&can("canApprove")?`<button class="btn btn-primary btn-sm" title="Contabilizar" onclick="contabilizarCompra('${esc(e.id)}', '${esc(e.number)}')"><i class="fas fa-check"></i> Contabilizar</button>`:""}
        ${e.status==="draft"&&can("canDelete")?`<button class="btn btn-danger btn-sm" title="Anular" onclick="voidPurchase('${esc(e.id)}', '${esc(e.number)}', 'draft')"><i class="fas fa-ban"></i></button>`:""}
        ${e.status==="posted"&&requireRole("admin")?`<button class="btn btn-outline btn-sm" title="Reabrir para corregir" style="border-color:#D97706;color:#D97706" onclick="reopenPurchase('${esc(e.id)}', '${esc(e.number)}')"><i class="fas fa-rotate-left"></i></button>`:""}
        ${e.status==="posted"&&can("canDelete")?`<button class="btn btn-danger btn-sm" title="Anular definitivamente" onclick="voidPurchase('${esc(e.id)}', '${esc(e.number)}', 'posted')"><i class="fas fa-ban"></i></button>`:""}
        ${e.status==="posted"&&e.tx_id?`<button class="btn btn-outline btn-sm" title="Ver asiento contable" style="border-color:#7C3AED;color:#7C3AED" onclick="seeTxDetail('${esc(e.tx_id)}')"><i class="fas fa-book-open"></i></button>`:""}
      </div>
    </td>
  </tr>`}function Mi(){const e=(getInputVal("po-q")||"").toLowerCase(),t=getSelectVal("po-status-f"),a=getInputVal("po-from"),o=getInputVal("po-to");$$("#po-table tbody tr[data-poid]").forEach(s=>{const n=s.textContent.toLowerCase(),i=s.dataset.podate;s.style.display=(!e||n.includes(e))&&(!t||s.dataset.postatus===t)&&(!a||i>=a)&&(!o||i<=o)?"":"none"})}async function hs(e=null,t=null){var V,U,z,J,te;let a=null,o=[],[s,n,i,c,r,l]=await Promise.all([vs(),pb.listAll("third_parties",{filter:"active=true",sort:"name"}),API.getWarehouses(!0),API.getProducts({activeOnly:!0}),pb.listAll("accounts",{filter:"active=true && level>=3",sort:"code"}),API.getTxTypes()]);e&&([a,o]=await Promise.all([pb.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id"}),API.getPurchaseInvoiceLines(e)]));let p=0;const f=(a==null?void 0:a.date)||todayStr(),m=(a==null?void 0:a.due_date)||fo(f,s.operational.default_due_days||0),d=l.map(F=>`<option value="${esc(F.id)}"${(a==null?void 0:a.tx_type_id)===F.id?" selected":""}>${esc(F.prefix)} — ${esc(F.name)}</option>`).join("");function b(F){return`${(F==null?void 0:F.doc_number)||(F==null?void 0:F.nit)||""} - ${(F==null?void 0:F.name)||""}`.trim()}const u=()=>c.map(F=>`<option value="${esc(F.id)}" data-type="${esc(F.type)}" data-cost="${F.cost_price||0}" data-iva="${F.iva_rate||0}" data-invacct="${esc(F.inventory_account_id||"")}" data-costacct="${esc(F.cost_account_id||"")}">${esc(F.code)} — ${esc(F.name)}</option>`).join(""),y=(((V=s==null?void 0:s.accounting)==null?void 0:V.withholding_rules)||[]).filter(F=>String(F.account_code||"").trim()&&Number(F.rate||0)>0);window.__poRetRulesCache=y;const v=F=>`${F.concept} ${F.rate}% (${F.base_type}${Number(F.min_base||0)>0?`, base >= ${fmt(F.min_base||0)}`:""})`,g=(F=y,D="")=>`<option value="">— Sin retención —</option>${F.map(q=>`<option value="${esc(q.id)}"${q.id===D?" selected":""}>${esc(v(q))}</option>`).join("")}`,h=F=>String(F||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase(),_=F=>{const D=h(`${(F==null?void 0:F.concept)||""} ${(F==null?void 0:F.name)||""} ${(F==null?void 0:F.account_code)||""}`);return D.includes("ica")?"ica":D.includes("iva")?"iva":D.includes("fuente")||D.includes("renta")||D.includes("rete fuente")?"renta":"other"},A=y.filter(F=>_(F)==="renta"),C=y.filter(F=>_(F)==="ica"),T=y.filter(F=>_(F)==="iva"),N=(F="")=>g(A,F),I=(F="")=>g(C,F),S=(F="")=>g(T,F),w=c.map(F=>({id:F.id,title:`${F.code} — ${F.name}`,sub:F.type}));openModal(e?`Editar Factura — ${esc((a==null?void 0:a.number)||"")}`:"Nueva Factura de Compra",`<!-- Encabezado -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="form-group">
        <label class="form-label">Proveedor <span style="color:#EF4444">*</span></label>
        <div id="po-supplier-search-wrap" class="relative">
          <input id="po-supplier-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre">
          <input id="po-supplier" type="hidden" value="${esc((a==null?void 0:a.supplier_id)||"")}">
          <div id="po-supplier-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha <span style="color:#EF4444">*</span></label>
        <input id="po-date" type="date" class="form-input" value="${esc(f)}">
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de vencimiento</label>
        <input id="po-due-date" type="date" class="form-input" value="${esc(m||"")}">
      </div>
      <div class="form-group">
        <label class="form-label">Ref. factura proveedor</label>
        <input id="po-supplier-ref" class="form-input" placeholder="Ej: FAC-2026-001" value="${esc((a==null?void 0:a.supplier_ref)||"")}">
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de comprobante contable <span style="color:#EF4444">*</span></label>
        <select id="po-tx-type" class="form-input">
          <option value="">— Seleccionar —</option>
          ${d}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Numeración comprobante <span style="color:#EF4444">*</span></label>
        <input id="po-tx-number" class="form-input" placeholder="Ej: FC-00000015" value="${esc((a==null?void 0:a.tx_number)||"")}">
      </div>
      <div class="form-group">
        <label class="form-label">Bodega destino <span style="font-size:10px;color:#9CA3AF">(para bienes)</span></label>
        <select id="po-warehouse" class="form-input">
          <option value="">— Sin bodega —</option>
          ${i.map(F=>`<option value="${esc(F.id)}"${(a==null?void 0:a.warehouse_id)===F.id?" selected":""}>${esc(F.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notas</label>
        <input id="po-notes" class="form-input" placeholder="Observaciones" value="${esc((a==null?void 0:a.notes)||"")}">
      </div>
    </div>

    <!-- Líneas de compra -->
    <div class="border rounded-xl overflow-hidden mb-3" style="border-color:#E5E7EB">
      <!-- Barra de herramientas de la tabla -->
      <div class="flex items-center justify-between px-4 py-2 flex-wrap gap-2" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
        <span class="text-sm font-semibold" style="color:#0D2137">Artículos / Servicios</span>
        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-2 cursor-pointer select-none" style="font-size:12px;font-weight:600;color:#374151" title="Cambiar modo de captura de retenciones">
            <span id="po-ret-mode-lbl-hdr" style="color:#1A4B8C">Global</span>
            <div style="position:relative;display:inline-block;width:38px;height:20px">
              <input type="checkbox" id="po-ret-mode-switch" style="opacity:0;width:0;height:0;position:absolute" onchange="window.poSetRetMode(this.checked)">
              <span id="po-ret-mode-track" onclick="var sw=document.getElementById('po-ret-mode-switch');sw.checked=!sw.checked;window.poSetRetMode(sw.checked)" style="position:absolute;inset:0;background:#1A4B8C;border-radius:10px;cursor:pointer;transition:background .2s"></span>
              <span id="po-ret-mode-knob" style="position:absolute;height:14px;width:14px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform .2s;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.25)"></span>
            </div>
            <span id="po-ret-mode-lbl-line" style="color:#9CA3AF">Por línea</span>
          </label>
          <button type="button" class="btn btn-outline btn-sm" id="btn-new-po-product"><i class="fas fa-box-open"></i> Crear producto</button>
          <button type="button" class="btn btn-primary btn-sm" id="btn-add-po-line"><i class="fas fa-plus"></i> Agregar línea</button>
        </div>
      </div>
      <!-- Tabla con encabezado sticky -->
      <div style="overflow-x:auto;max-height:320px;overflow-y:auto">
        <table class="data-table" id="po-lines-table" style="min-width:740px">
          <thead style="position:sticky;top:0;z-index:10">
            <tr>
              <th style="min-width:220px;background:#F4F8FF">Producto / Servicio</th>
              <th class="text-right" style="width:75px;background:#F4F8FF">Cant.</th>
              <th class="text-right" style="width:115px;background:#F4F8FF">P. unitario</th>
              <th class="text-right" style="width:72px;background:#F4F8FF">IVA %</th>
              <th class="po-ret-col" style="min-width:190px;background:#F4F8FF">Retención</th>
              <th class="po-ret-col text-right" style="width:115px;background:#F4F8FF">Vlr Ret.</th>
              <th class="text-right" style="width:115px;background:#F4F8FF">Total línea</th>
              <th style="width:88px;background:#F4F8FF">Acciones</th>
            </tr>
          </thead>
          <tbody id="po-lines-body"></tbody>
        </table>
      </div>
    </div>
    <!-- Totales -->
    <div class="flex justify-end">
      <div class="text-sm space-y-1 min-w-64">
        <div class="flex justify-between gap-8"><span style="color:#6B7280">Subtotal:</span> <span id="po-total-sub" class="font-semibold">$ 0</span></div>
        <div class="flex justify-between gap-8"><span style="color:#6B7280">IVA:</span>      <span id="po-total-iva" class="font-semibold">$ 0</span></div>
        <div id="po-hdr-ret-wrap" class="space-y-1">
          <div class="flex items-center justify-between gap-2">
            <span style="color:#6B7280;white-space:nowrap">ReteRenta:</span>
            <div class="flex items-center gap-2">
              <select id="po-hdr-ret-rule-renta" class="form-input" style="font-size:12px;padding:4px 8px;min-width:170px" onchange="window.poRecalcLine(0)">
                ${N((a==null?void 0:a.ret_rule_renta_id)||"")}
              </select>
              <span id="po-total-ret-renta" class="font-semibold" style="min-width:90px;text-align:right;color:#C46516">$ 0</span>
            </div>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span style="color:#6B7280;white-space:nowrap">ReteICA:</span>
            <div class="flex items-center gap-2">
              <select id="po-hdr-ret-rule-ica" class="form-input" style="font-size:12px;padding:4px 8px;min-width:170px" onchange="window.poRecalcLine(0)">
                ${I((a==null?void 0:a.ret_rule_ica_id)||"")}
              </select>
              <span id="po-total-ret-ica" class="font-semibold" style="min-width:90px;text-align:right;color:#C46516">$ 0</span>
            </div>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span style="color:#6B7280;white-space:nowrap">ReteIVA:</span>
            <div class="flex items-center gap-2">
              <select id="po-hdr-ret-rule-iva" class="form-input" style="font-size:12px;padding:4px 8px;min-width:170px" onchange="window.poRecalcLine(0)">
                ${S((a==null?void 0:a.ret_rule_iva_id)||"")}
              </select>
              <span id="po-total-ret-iva" class="font-semibold" style="min-width:90px;text-align:right;color:#C46516">$ 0</span>
            </div>
          </div>
        </div>
        <div class="flex justify-between gap-8"><span style="color:#6B7280">Total Retenciones:</span> <span id="po-total-ret" class="font-semibold">$ 0</span></div>
        <div class="flex justify-between gap-8 text-base border-t pt-2" style="border-color:#E5E7EB"><span class="font-bold" style="color:#0D2137">TOTAL CxP:</span> <span id="po-total-net" class="font-bold" style="color:#1A4B8C">$ 0</span></div>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-po"><i class="fas fa-floppy-disk"></i> Guardar borrador</button>`,!0);function E(){const F=document.getElementById("po-supplier-search-wrap"),D=document.getElementById("po-supplier"),q=document.getElementById("po-supplier-search"),G=document.getElementById("po-supplier-results");if(!F||!D||!q||!G)return;const ee=Z=>n.find(Q=>Q.id===Z)||null,X=(Z="")=>{const oe=String(Z||"").toLowerCase().trim().split(/\s+/).filter(Boolean),ve=oe.length?n.filter(be=>{const ye=`${be.doc_number||""} ${be.nit||""} ${be.name||""}`.toLowerCase();return oe.every(pe=>ye.includes(pe))}).slice(0,40):n.slice(0,40);if(!ve.length){G.innerHTML='<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';return}G.innerHTML=ve.map(be=>`<button type="button" data-po-third-id="${esc(be.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer"><div style="font-weight:600">${esc(be.doc_number||be.nit||"SIN DOC")}</div><div style="font-size:12px;color:#6B7280">${esc(be.name||"")}</div></button>`).join("")};(()=>{const Z=ee(D.value);q.value=Z?b(Z):""})(),q.onfocus=()=>{X(q.value),G.style.display="block"},q.oninput=()=>{D.value="",X(q.value),G.style.display="block"},G.onclick=Z=>{const Q=Z.target.closest("[data-po-third-id]");if(!Q)return;const oe=Q.getAttribute("data-po-third-id")||"";D.value=oe;const ve=ee(oe);q.value=ve?b(ve):"",G.style.display="none"},q._poOutsideHandler&&document.removeEventListener("click",q._poOutsideHandler),q._poOutsideHandler=Z=>{F.contains(Z.target)||(G.style.display="none")},setTimeout(()=>document.addEventListener("click",q._poOutsideHandler),0)}function L(){$$('select[id^="pol-prod-"]').forEach(F=>{const D=F.value;F.innerHTML=`<option value="">— Seleccionar —</option>${u()}`,D&&(F.value=D)}),$$('input[id^="pol-prod-search-"]').forEach(F=>{var ee;const D=F.id.replace("pol-prod-search-",""),q=document.getElementById(`pol-prod-${D}`),G=(ee=q==null?void 0:q.selectedOptions)==null?void 0:ee[0];F.value=G&&G.value?G.textContent:""})}function R(F){return y.find(D=>D.id===F)||null}function M(F,D,q,G){if(!G)return{base:0,amount:0};const ee=String(G.base_type||"SUBTOTAL").toUpperCase(),X=ee==="IVA"?D:ee==="TOTAL"?q:F,ne=Number(G.min_base||0)||0;if(X<ne)return{base:X,amount:0};const Z=Number(G.rate||0)||0;return{base:X,amount:X*Z/100}}function B(F,D){const q=F+D,G=R(getSelectVal("po-hdr-ret-rule-renta")),ee=R(getSelectVal("po-hdr-ret-rule-ica")),X=R(getSelectVal("po-hdr-ret-rule-iva")),ne=M(F,D,q,G).amount||0,Z=M(F,D,q,ee).amount||0,Q=X?(()=>{const oe=Number(X.min_base||0)||0;return D<oe?0:D*(Number(X.rate||0)||0)/100})():0;return{reteRenta:ne,reteIca:Z,reteIva:Q,total:ne+Z+Q}}function k({wrapId:F,inputId:D,selectId:q,resultsId:G,dataList:ee,onSelected:X}){const ne=document.getElementById(F),Z=document.getElementById(D),Q=document.getElementById(q),oe=document.getElementById(G);if(!ne||!Z||!Q||!oe)return;const ve=(ye="")=>{const de=String(ye||"").toLowerCase().trim().split(/\s+/).filter(Boolean),me=de.length?ee.filter(ue=>{const Ie=`${ue.title||""} ${ue.sub||""}`.toLowerCase();return de.every(Se=>Ie.includes(Se))}).slice(0,30):ee.slice(0,30);if(!me.length){oe.innerHTML='<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';return}oe.innerHTML=me.map(ue=>`<button type="button" data-lookup-id="${esc(ue.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer"><div style="font-weight:600">${esc(ue.title)}</div><div style="font-size:12px;color:#6B7280">${esc(ue.sub||"")}</div></button>`).join("")};(()=>{var pe;const ye=(pe=Q.selectedOptions)==null?void 0:pe[0];Z.value=ye&&ye.value?ye.textContent:""})(),Z.onfocus=()=>{ve(Z.value),oe.style.display="block"},Z.oninput=()=>{Q.value="",ve(Z.value),oe.style.display="block",typeof X=="function"&&X("")},oe.onclick=ye=>{var ue;const pe=ye.target.closest("[data-lookup-id]");if(!pe)return;const de=pe.getAttribute("data-lookup-id")||"";Q.value=de;const me=(ue=Q.selectedOptions)==null?void 0:ue[0];Z.value=me&&me.value?me.textContent:"",oe.style.display="none",typeof X=="function"&&X(de)},Z._lookupOutsideHandler&&document.removeEventListener("click",Z._lookupOutsideHandler),Z._lookupOutsideHandler=ye=>{ne.contains(ye.target)||(oe.style.display="none")},setTimeout(()=>document.addEventListener("click",Z._lookupOutsideHandler),0)}function j(){var X,ne,Z;if(!can("canWrite"))return showToast("Sin permisos para crear productos","error");const F=()=>`<option value="">— Sin asignar —</option>${r.filter(oe=>oe.active&&Number(oe.level)>=3).sort((oe,ve)=>oe.code.localeCompare(ve.code)).map(oe=>`<option value="${esc(oe.id)}">${esc(oe.code)} — ${esc(oe.name)}</option>`).join("")}`,D="po-quick-product-overlay",q=document.getElementById(D);q&&q.remove();const G=document.createElement("div");G.id=D,G.style.cssText="position:fixed;inset:0;background:rgba(5,8,20,.6);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:12px",G.innerHTML=`
      <div style="background:#fff;border-radius:16px;width:100%;max-width:760px;max-height:92vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.2)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #F0F0F0">
          <h4 style="font-weight:700;color:#0D2137;font-size:15px"><i class="fas fa-box-open mr-2" style="color:#1A4B8C"></i>Crear producto desde compra</h4>
          <button id="po-qp-close" style="background:none;border:none;font-size:18px;color:#9CA3AF;cursor:pointer"><i class="fas fa-xmark"></i></button>
        </div>
        <div style="padding:18px" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group mb-0"><label class="form-label">Codigo *</label><input id="po-qp-code" class="form-input" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" placeholder="P-001"></div>
          <div class="form-group mb-0"><label class="form-label">Nombre *</label><input id="po-qp-name" class="form-input" placeholder="Nombre del producto"></div>
          <div class="form-group mb-0"><label class="form-label">Tipo *</label><select id="po-qp-type" class="form-input">${Pi.map(Q=>`<option value="${esc(Q.value)}">${esc(Q.label)}</option>`).join("")}</select></div>
          <div class="form-group mb-0"><label class="form-label">Unidad *</label><select id="po-qp-unit" class="form-input">${Fi.map(Q=>`<option value="${esc(Q)}">${esc(Q)}</option>`).join("")}</select></div>
          <div class="form-group mb-0"><label class="form-label">IVA %</label><select id="po-qp-iva" class="form-input">${fs.map(Q=>`<option value="${Q}">${Q}%</option>`).join("")}</select></div>
          <div class="form-group mb-0"><label class="form-label">Costo estimado</label><input id="po-qp-cost" type="number" min="0" step="0.01" class="form-input" value="0"></div>
          <div class="form-group mb-0"><label class="form-label">Cuenta costo/gasto</label><select id="po-qp-cost-acct" class="form-input">${F()}</select></div>
          <div class="form-group mb-0"><label class="form-label">Cuenta inventario</label><select id="po-qp-inv-acct" class="form-input">${F()}</select></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;padding:12px 20px;border-top:1px solid #F0F0F0">
          <button class="btn btn-outline" id="po-qp-cancel">Cancelar</button>
          <button class="btn btn-primary" id="po-qp-save"><i class="fas fa-floppy-disk"></i> Crear producto</button>
        </div>
      </div>`,document.body.appendChild(G);const ee=()=>{G.remove()};(X=document.getElementById("po-qp-close"))==null||X.addEventListener("click",ee),(ne=document.getElementById("po-qp-cancel"))==null||ne.addEventListener("click",ee),G.addEventListener("click",Q=>{Q.target===G&&ee()}),(Z=document.getElementById("po-qp-save"))==null||Z.addEventListener("click",async()=>{const Q=document.getElementById("po-qp-save");Q&&(Q.disabled=!0,Q.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const oe=getInputVal("po-qp-code").trim().toUpperCase(),ve=getInputVal("po-qp-name").trim();if(!oe)return showToast("El codigo es obligatorio","warning");if(!ve)return showToast("El nombre es obligatorio","warning");const be=pb.escapeFilterValue(oe);if((await pb.list("products",{filter:`code="${be}"`,perPage:1})).items.length)return showToast(`Ya existe un producto con codigo ${oe}`,"warning");const pe={code:oe,name:ve,description:"",type:getSelectVal("po-qp-type")||"BIEN",unit:getSelectVal("po-qp-unit")||"UND",presentacion:"",categoria:"",linea:"",iva_rate:Number(getSelectVal("po-qp-iva")||0),base_price:0,precio_venta_2:null,precio_venta_3:null,cost_price:parseFloat(getInputVal("po-qp-cost")||"0")||0,active:!0,unspsc_code:"",ean_code:"",peso:null,cajas_en_pallet:null,und_empaque:null,peso_x_und_empaque:null,income_account_id:null,cost_account_id:getSelectVal("po-qp-cost-acct")||null,inventory_account_id:getSelectVal("po-qp-inv-acct")||null},de=await pb.create("products",pe);await API.logAudit("CREATE","Producto",de.id,`${de.code} — ${de.name} (desde compras)`),c.unshift(de),L(),ee(),showToast("Producto creado y disponible en la factura","success")}catch(oe){showToast(oe.message||"No se pudo crear el producto","error")}finally{Q&&(Q.disabled=!1,Q.innerHTML='<i class="fas fa-floppy-disk"></i> Crear producto')}})}function Y(){var ne,Z;let F=0,D=0,q=0,G=1;for(;G<=p+5;){const Q=document.getElementById(`pol-price-${G}`);if(!Q){if(G++,G>p+5)break;continue}const oe=parseFloat(((ne=document.getElementById(`pol-qty-${G}`))==null?void 0:ne.value)||"0")||0,ve=parseFloat(Q.value||"0")||0,be=parseFloat(((Z=document.getElementById(`pol-iva-${G}`))==null?void 0:Z.value)||"0")||0,ye=oe*ve,pe=ye*be/100,de=ye+pe;F+=ye,D+=pe;const me=document.getElementById(`pol-rowtot-${G}`);if(me&&(me.textContent=fmt(de)),window.__poRetMode!=="header"){const ue=getSelectVal(`pol-ret-rule-${G}`),Ie=R(ue),Se=M(ye,pe,de,Ie);q+=Se.amount;const ie=document.getElementById(`pol-retamt-${G}`);ie&&(ie.textContent=Se.amount>0?fmt(Se.amount):"—")}G++}if(window.__poRetMode==="header"){const Q=B(F,D);q=Q.total,$("#po-total-ret-renta")&&($("#po-total-ret-renta").textContent=fmt(Q.reteRenta)),$("#po-total-ret-ica")&&($("#po-total-ret-ica").textContent=fmt(Q.reteIca)),$("#po-total-ret-iva")&&($("#po-total-ret-iva").textContent=fmt(Q.reteIva))}else $("#po-total-ret-renta")&&($("#po-total-ret-renta").textContent=fmt(0)),$("#po-total-ret-ica")&&($("#po-total-ret-ica").textContent=fmt(0)),$("#po-total-ret-iva")&&($("#po-total-ret-iva").textContent=fmt(0));const X=F+D-q;$("#po-total-sub")&&($("#po-total-sub").textContent=fmt(F)),$("#po-total-iva")&&($("#po-total-iva").textContent=fmt(D)),$("#po-total-ret")&&($("#po-total-ret").textContent=fmt(q)),$("#po-total-net")&&($("#po-total-net").textContent=fmt(X))}window.__poRecalcTotals=Y;function W(F){const D=document.getElementById(`pol-row-${F}`),q=document.getElementById(`pol-comment-btn-${F}`);if(!D||!q)return;const G=!!String(D.dataset.comment||"").trim();q.style.borderColor=G?"#1A4B8C":"#D1D5DB",q.style.color=G?"#1A4B8C":"#6B7280",q.style.background=G?"#EEF4FF":"#fff",q.title=G?"Editar comentario":"Agregar comentario"}window.poEditLineComment=function(D){const q=document.getElementById(`pol-row-${D}`);if(!q)return;let G=document.getElementById("po-line-comment-overlay");G||(G=document.createElement("div"),G.id="po-line-comment-overlay",G.style.cssText="display:none;position:fixed;inset:0;background:rgba(5,8,20,.6);backdrop-filter:blur(4px);z-index:220;align-items:center;justify-content:center;padding:16px",G.innerHTML=`
        <div style="background:#fff;border-radius:16px;width:100%;max-width:460px;box-shadow:0 20px 50px rgba(0,0,0,.2);overflow:hidden">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #F0F0F0">
            <h4 style="font-weight:700;color:#0D2137;font-size:15px"><i class="fas fa-comment-dots mr-2" style="color:#1A4B8C"></i>Comentario de línea</h4>
            <button type="button" id="po-line-comment-close" style="background:none;border:none;font-size:18px;color:#9CA3AF;cursor:pointer"><i class="fas fa-xmark"></i></button>
          </div>
          <div style="padding:20px">
            <label class="form-label" for="po-line-comment-text">Descripción personalizada</label>
            <textarea id="po-line-comment-text" class="form-input" rows="4" placeholder="Escribe una descripción o comentario..."></textarea>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px;padding:12px 20px;border-top:1px solid #F0F0F0">
            <button type="button" class="btn btn-outline" id="po-line-comment-cancel">Cancelar</button>
            <button type="button" class="btn btn-primary" id="po-line-comment-save"><i class="fas fa-check mr-1"></i>Guardar</button>
          </div>
        </div>`,document.body.appendChild(G));const ee=document.getElementById("po-line-comment-text"),X=()=>{G.style.display="none"},ne=()=>{const Z=String((ee==null?void 0:ee.value)||"").trim();q.dataset.comment=Z,W(D),X()};ee&&(ee.value=String(q.dataset.comment||"")),G.style.display="flex",setTimeout(()=>ee==null?void 0:ee.focus(),40),document.getElementById("po-line-comment-close").onclick=X,document.getElementById("po-line-comment-cancel").onclick=X,document.getElementById("po-line-comment-save").onclick=ne};function K(F={}){var ee;p++;const D=p,q=document.getElementById("po-lines-body");if(!q)return;const G=document.createElement("tr");if(G.id=`pol-row-${D}`,G.dataset.comment=String(F.description||"").trim(),G.innerHTML=`
      <td>
        <div id="pol-prod-wrap-${D}" class="relative">
          <input id="pol-prod-search-${D}" class="form-input" style="min-width:200px" autocomplete="off" placeholder="Buscar producto...">
          <select class="form-input" id="pol-prod-${D}" style="display:none">
            <option value="">— Seleccionar —</option>
            ${u()}
          </select>
          <div id="pol-prod-results-${D}" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:45"></div>
        </div>
      </td>
      <td><input id="pol-qty-${D}" type="number" min="0.0001" step="0.0001" class="form-input text-right" style="min-width:70px" value="${F.qty||"1"}" oninput="poRecalcLine(${D})"></td>
      <td><input id="pol-price-${D}" type="number" min="0" step="0.01" class="form-input text-right" style="min-width:100px" value="${F.unit_price||""}" oninput="poRecalcLine(${D})"></td>
      <td><input id="pol-iva-${D}" type="number" min="0" max="100" step="1" class="form-input text-right" style="min-width:60px" value="${F.iva_rate||"0"}" oninput="poRecalcLine(${D})"></td>
      <td class="po-ret-col">
        <select id="pol-ret-rule-${D}" class="form-input" style="min-width:180px" onchange="poRecalcLine(${D})">
          ${g()}
        </select>
      </td>
      <td class="po-ret-col text-right font-semibold text-sm" id="pol-retamt-${D}" style="color:#C46516">—</td>
      <td class="text-right font-semibold text-sm" id="pol-rowtot-${D}" style="color:#1A4B8C">—</td>
      <td>
        <div class="flex items-center gap-1">
          <button type="button" class="btn btn-outline btn-sm" id="pol-comment-btn-${D}" onclick="poEditLineComment(${D})"><i class="fas fa-comment"></i></button>
          <button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('pol-row-${D}').remove(); poRecalcLine(0)"><i class="fas fa-times"></i></button>
        </div>
      </td>`,q.appendChild(G),W(D),k({wrapId:`pol-prod-wrap-${D}`,inputId:`pol-prod-search-${D}`,selectId:`pol-prod-${D}`,resultsId:`pol-prod-results-${D}`,dataList:w,onSelected:()=>{var oe;const X=document.getElementById(`pol-prod-${D}`),ne=(oe=X==null?void 0:X.selectedOptions)==null?void 0:oe[0];if(!ne||!ne.value)return;const Z=document.getElementById(`pol-price-${D}`),Q=document.getElementById(`pol-iva-${D}`);Z&&!Z.value&&(Z.value=ne.dataset.cost||""),Q&&(Q.value=ne.dataset.iva||"0"),poRecalcLine(D)}}),F.product_id){const X=document.getElementById(`pol-prod-${D}`);X&&(X.value=F.product_id);const ne=document.getElementById(`pol-prod-search-${D}`),Z=(ee=X==null?void 0:X.selectedOptions)==null?void 0:ee[0];ne&&(Z!=null&&Z.value)&&(ne.value=Z.textContent)}if(F.ret_rule_id){const X=document.getElementById(`pol-ret-rule-${D}`);X&&(X.value=F.ret_rule_id),window.__poRetMode==="header"&&document.querySelectorAll(`#pol-row-${D} .po-ret-col`).forEach(ne=>{ne.style.display="none"})}Y()}if(o.length)for(const F of o)K(F);else K();E(),(U=document.getElementById("btn-add-po-line"))==null||U.addEventListener("click",()=>K()),(z=document.getElementById("btn-new-po-product"))==null||z.addEventListener("click",()=>j()),window.__poRetMode="header",window.poSetRetMode(!1);const H=document.getElementById("po-tx-type"),x=document.getElementById("po-tx-number"),P=()=>{if(!H||!x||e&&x.value)return;const F=l.find(G=>G.id===H.value);if(!F)return;const D=Number(F.consecutive||0)+1,q=F.prefix||F.code||"TX";x.value=`${q}-${String(D).padStart(8,"0")}`};H==null||H.addEventListener("change",P),P(),!e&&(s.operational.default_due_days||0)>0&&((J=document.getElementById("po-date"))==null||J.addEventListener("change",()=>{const F=getInputVal("po-date");$("#po-due-date")&&!getInputVal("po-due-date")&&setInputVal("po-due-date",fo(F,s.operational.default_due_days||0))})),(te=document.getElementById("btn-save-po"))==null||te.addEventListener("click",async()=>{const F=document.getElementById("btn-save-po");F&&(F.disabled=!0,F.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const D=getInputVal("po-supplier"),q=getInputVal("po-date"),G=getSelectVal("po-tx-type"),ee=getInputVal("po-tx-number").trim();if(!D)return showToast("Selecciona el proveedor","warning");if(!q)return showToast("La fecha es obligatoria","warning");if(!G)return showToast("Selecciona el tipo de comprobante contable","warning");if(!ee)return showToast("Define la numeración del comprobante contable","warning");const X=[];let ne=0;for(let pe=1;pe<=p+2;pe++){const de=document.getElementById(`pol-row-${pe}`);if(!de)continue;const me=getSelectVal(`pol-prod-${pe}`),ue=String(de.dataset.comment||"").trim(),Ie=parseFloat(getInputVal(`pol-qty-${pe}`)||"0")||0,Se=parseFloat(getInputVal(`pol-price-${pe}`)||"0")||0,ie=parseFloat(getInputVal(`pol-iva-${pe}`)||"0")||0,le=window.__poRetMode==="header"?"":getSelectVal(`pol-ret-rule-${pe}`)||"";if(!Ie||!Se)continue;if(!me)return showToast(`Línea ${X.length+1}: selecciona un producto`,"warning");const Be=Ie*Se,yt=Be*ie/100,Ue=Be+yt,Ce=R(le),Wa=M(Be,yt,Ue,Ce);ne+=Wa.amount||0,X.push({product_id:me||null,account_id:null,description:ue,qty:Ie,unit_price:Se,iva_rate:ie,subtotal:Be,iva_amount:yt,total:Ue,ret_rule_id:Ce?Ce.id:"",ret_concept:Ce?Ce.concept:"",ret_base_type:Ce?Ce.base_type:"",ret_base:Wa.base||0,ret_rate:Ce?Number(Ce.rate||0):0,ret_amount:Wa.amount||0,ret_account_code:Ce?String(Ce.account_code||""):""})}if(!X.length)return showToast("Agrega al menos una línea válida","warning");if(window.__poRetMode==="header"){const pe=X.reduce((me,ue)=>me+(ue.subtotal||0),0),de=X.reduce((me,ue)=>me+(ue.iva_amount||0),0);ne=B(pe,de).total}if(s.operational.require_warehouse_for_goods&&X.some(de=>{if(!de.product_id)return!1;const me=c.find(ue=>ue.id===de.product_id);return(me==null?void 0:me.type)==="BIEN"})&&!getSelectVal("po-warehouse"))return showToast("Selecciona bodega destino para líneas de bienes","warning");const Z=q.replaceAll("-",""),Q=String(Date.now()).slice(-4),oe=(a==null?void 0:a.number)||`FC-${Z}-${Q}`,be=X.reduce((pe,de)=>pe+(de.total||0),0)-ne,ye={number:oe,date:q,due_date:getInputVal("po-due-date")||null,supplier_id:D,supplier_ref:getInputVal("po-supplier-ref").trim(),tx_type_id:G,tx_number:ee,warehouse_id:getSelectVal("po-warehouse")||null,notes:getInputVal("po-notes").trim(),ret_total:ne,payable_total:be,ret_rule_renta_id:window.__poRetMode==="header"&&getSelectVal("po-hdr-ret-rule-renta")||"",ret_rule_ica_id:window.__poRetMode==="header"&&getSelectVal("po-hdr-ret-rule-ica")||"",ret_rule_iva_id:window.__poRetMode==="header"&&getSelectVal("po-hdr-ret-rule-iva")||""};if(e){let pe=0,de=0;for(const ue of X)pe+=ue.subtotal,de+=ue.iva_amount;await pb.update("purchase_invoices",e,{...ye,subtotal:pe,iva_total:de,total:be});const me=await pb.listAll("purchase_invoice_lines",{filter:`invoice_id="${pb.escapeFilterValue(e)}"`});for(const ue of me)await pb.delete("purchase_invoice_lines",ue.id);for(let ue=0;ue<X.length;ue++)await pb.create("purchase_invoice_lines",{invoice_id:e,line_order:ue+1,...X[ue]});await API.logAudit("UPDATE","PurchaseInvoice",e,`Editada ${oe}`),showToast("Factura actualizada","success")}else await API.createPurchaseInvoice(ye,X),showToast("Factura guardada como borrador","success");closeModal(),t&&t()}catch(D){showToast(D.message||"Error al guardar","error")}finally{F&&(F.disabled=!1,F.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar borrador')}})}window.poRecalcLine=function(){var n,i,c;if(typeof window.__poRecalcTotals=="function"){window.__poRecalcTotals();return}let e=0,t=0,a=0;for(let r=1;r<=100;r++){if(!document.getElementById(`pol-row-${r}`))continue;const p=parseFloat(((n=document.getElementById(`pol-qty-${r}`))==null?void 0:n.value)||"0")||0,f=parseFloat(((i=document.getElementById(`pol-price-${r}`))==null?void 0:i.value)||"0")||0,m=parseFloat(((c=document.getElementById(`pol-iva-${r}`))==null?void 0:c.value)||"0")||0,d=p*f,b=d*m/100;e+=d,t+=b}const s=e+t-a;$("#po-total-sub")&&($("#po-total-sub").textContent=fmt(e)),$("#po-total-iva")&&($("#po-total-iva").textContent=fmt(t)),$("#po-total-ret")&&($("#po-total-ret").textContent=fmt(a)),$("#po-total-net")&&($("#po-total-net").textContent=fmt(s))};window.poSetRetMode=function(e){window.__poRetMode=e?"line":"header",document.querySelectorAll(".po-ret-col").forEach(i=>{i.style.display=e?"":"none"});const t=document.getElementById("po-hdr-ret-wrap");t&&(t.style.display=e?"none":"");const a=document.getElementById("po-ret-mode-knob");a&&(a.style.transform=e?"translateX(18px)":"");const o=document.getElementById("po-ret-mode-track");o&&(o.style.background=e?"#6B7280":"#1A4B8C");const s=document.getElementById("po-ret-mode-lbl-hdr");s&&(s.style.color=e?"#9CA3AF":"#1A4B8C");const n=document.getElementById("po-ret-mode-lbl-line");n&&(n.style.color=e?"#1A4B8C":"#9CA3AF"),window.poRecalcLine(0)};async function Zr(e){var t,a;try{const[o,s,n]=await Promise.all([pb.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id"}),API.getPurchaseInvoiceLines(e),can("canViewAudit")?API.getAuditLogs({entity:"PurchaseInvoice",entityId:e,actions:["REOPEN","VOID"],limit:20}).catch(()=>[]):Promise.resolve([])]),i=o.status==="posted"?await API.getPurchaseMutationBlocks(e).catch(()=>({blocks:[],details:{}})):{blocks:[],details:{}},c=us[o.status]||{label:o.status,badge:"badge-gray"},r=(t=o.expand)==null?void 0:t.supplier_id,l=(a=o.expand)==null?void 0:a.warehouse_id,p=can("canViewAudit")?`
      <div class="mt-5 rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-bold" style="color:#0D2137"><i class="fas fa-clock-rotate-left mr-2"></i>Historial de reaperturas y anulaciones</h4>
          <span class="text-xs" style="color:#6B7280">Auditoría del documento</span>
        </div>
        ${n.length?`<div class="space-y-2">
              ${n.map(m=>`
                <div class="rounded-lg border px-3 py-2" style="border-color:#E5E7EB;background:#fff">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-semibold" style="color:#1A4B8C">${esc(m.action||"EVENTO")}</span>
                    <span class="text-xs" style="color:#6B7280">${esc(Di(m.created||m.createdAt||m.date||""))}</span>
                  </div>
                  <p class="text-sm mt-1" style="color:#374151">${esc(m.description||m.notes||"Sin detalle")}</p>
                </div>`).join("")}
             </div>`:'<p class="text-sm" style="color:#6B7280">No hay reaperturas ni anulaciones registradas para esta compra.</p>'}
      </div>`:"",f=o.status==="posted"&&i.blocks.length?`
      <div class="mt-4 p-4 rounded-xl text-sm" style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B">
        <div class="font-semibold mb-2"><i class="fas fa-shield-halved mr-2"></i>Bloqueo de reapertura/anulación</div>
        ${i.blocks.map(m=>`<p class="mb-1">• ${esc(m)}</p>`).join("")}
      </div>`:"";openModal(`Factura de Compra — ${esc(o.number)}`,`<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-5">
        <div><span class="form-label">Número</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(o.number)}</p></div>
        <div><span class="form-label">Estado</span><p><span class="badge ${c.badge}">${c.label}</span></p></div>
        <div><span class="form-label">Fecha</span><p>${esc(o.date)}</p></div>
        <div><span class="form-label">Proveedor</span><p>${r?esc(r.name):"—"}</p></div>
        <div><span class="form-label">Ref. proveedor</span><p>${esc(o.supplier_ref||"—")}</p></div>
        <div><span class="form-label">Bodega destino</span><p>${l?esc(l.name):"—"}</p></div>
        ${o.due_date?`<div><span class="form-label">Vencimiento</span><p>${esc(o.due_date)}</p></div>`:""}
        ${o.notes?`<div class="md:col-span-3"><span class="form-label">Notas</span><p>${esc(o.notes)}</p></div>`:""}
      </div>

      <div class="border rounded-xl overflow-hidden mb-4" style="border-color:#F0F0F0">
        <table class="data-table">
          <thead><tr><th>Producto / Servicio</th><th>Descripción</th><th class="text-right">Cant.</th><th class="text-right">P. Unit.</th><th class="text-right">IVA %</th><th class="text-right">Total</th></tr></thead>
          <tbody>
            ${s.map(m=>{var u,y;const d=(u=m.expand)==null?void 0:u.product_id,b=(y=m.expand)==null?void 0:y.account_id;return`<tr>
                <td>${d?`<span class="font-mono text-xs mr-1" style="color:#1A4B8C">${esc(d.code)}</span>${esc(d.name)}`:b?`${esc(b.code)} ${esc(b.name)}`:"—"}</td>
                <td class="text-sm" style="color:#6B7280">${esc(m.description||"—")}</td>
                <td class="text-right">${fmtN(m.qty)}</td>
                <td class="text-right">${fmt(m.unit_price)}</td>
                <td class="text-right">${m.iva_rate?m.iva_rate+"%":"—"}</td>
                <td class="text-right font-semibold">${fmt(m.total)}</td>
              </tr>`}).join("")}
          </tbody>
        </table>
      </div>
      <div class="flex justify-end">
        <div class="text-sm space-y-1 min-w-56">
          <div class="flex justify-between gap-8"><span style="color:#6B7280">Subtotal:</span><span class="font-semibold">${fmt(o.subtotal||0)}</span></div>
          <div class="flex justify-between gap-8"><span style="color:#6B7280">IVA:</span>     <span class="font-semibold">${fmt(o.iva_total||0)}</span></div>
          <div class="flex justify-between gap-8"><span style="color:#6B7280">Retenciones:</span><span class="font-semibold">${fmt(o.ret_total||0)}</span></div>
          <div class="flex justify-between gap-8"><span style="color:#6B7280">Bruto (Base + IVA):</span><span class="font-semibold">${fmt((o.subtotal||0)+(o.iva_total||0))}</span></div>
          <div class="flex justify-between gap-8 border-t pt-2 text-base" style="border-color:#E5E7EB"><span class="font-bold" style="color:#0D2137">TOTAL CxP:</span><span class="font-bold" style="color:#1A4B8C">${fmt(o.payable_total||o.total||0)}</span></div>
        </div>
      </div>
      ${o.tx_id?`<div class="mt-4 p-3 rounded-xl text-sm" style="background:#EEF4FF;color:#2446B8"><i class="fas fa-book-open mr-2"></i>Asiento contable generado: <button class="font-semibold underline cursor-pointer" onclick="closeModal(); setTimeout(() => seeTxDetail('${esc(o.tx_id)}'), 300)">Ver asiento</button></div>`:""}
      ${f}
      ${p}`,`<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       ${o.status==="draft"&&can("canApprove")?`<button class="btn btn-primary" onclick="closeModal(); contabilizarCompra('${esc(o.id)}', '${esc(o.number)}')"><i class="fas fa-check"></i> Contabilizar</button>`:""}
       ${o.status==="posted"&&requireRole("admin")?`<button class="btn btn-outline" style="border-color:#D97706;color:#D97706" onclick="closeModal(); reopenPurchase('${esc(o.id)}', '${esc(o.number)}')"><i class="fas fa-rotate-left"></i> Reabrir</button>`:""}
       ${o.status==="posted"&&can("canDelete")?`<button class="btn btn-danger" onclick="closeModal(); voidPurchase('${esc(o.id)}', '${esc(o.number)}', 'posted')"><i class="fas fa-ban"></i> Anular</button>`:""}`,!0)}catch(o){showToast(o.message,"error")}}function Xr(e){hs(e,()=>ma($("#page-content")))}function el(e,t){if(!can("canApprove"))return showToast("Solo el contador o admin pueden contabilizar","error");confirmDialog("Contabilizar Factura de Compra",`¿Confirmas contabilizar la factura <strong>${esc(t)}</strong>?<br><br>
     Se generará automáticamente:<br>
     • Un asiento contable (FC) en estado <em>Borrador</em> para su aprobación<br>
     • Un movimiento de inventario <em>ENTRADA</em> para los bienes comprados`,async()=>{try{const{inv:a,tx:o}=await API.postPurchaseInvoice(e);showToast(`Factura ${a.number} contabilizada. Asiento ${o.number} generado (pendiente aprobación).`,"success"),ma($("#page-content"))}catch(a){showToast(a.message,"error")}})}function tl(e,t){if(!requireRole("admin"))return showToast("Solo el administrador puede reabrir compras contabilizadas","error");bs({title:"Reabrir Compra para Corrección",messageHtml:`
        <p>Se reabrirá la factura <strong>${esc(t)}</strong> y el sistema hará lo siguiente:</p>
        <p class="mt-2">• Anulará el asiento contable vinculado</p>
        <p>• Revertirá el movimiento de inventario asociado</p>
        <p>• Dejará la compra en <em>Borrador</em> para corrección y nueva contabilización</p>`,actionLabel:"Reabrir compra",actionClass:"btn-outline",placeholder:"Explica el motivo de la reapertura aprobada por el administrador"},async a=>{await API.reopenPurchaseInvoice(e,a),showToast(`Factura ${t} reabierta en borrador. Se revirtieron contabilidad e inventario.`,"success"),ma($("#page-content"))})}function al(e,t,a="draft"){if(!can("canDelete"))return showToast("No tienes permisos para anular","error");bs({title:"Anular Factura de Compra",messageHtml:a==="posted"?`
          <p>Se anulará la factura <strong>${esc(t)}</strong>.</p>
          <p class="mt-2">Para conservar trazabilidad el sistema también anulará el asiento contable y revertirá el movimiento de inventario asociado.</p>`:`<p>Vas a anular la factura <strong>${esc(t)}</strong>. Esta acción dejará el documento inválido para operación.</p>`,actionLabel:"Anular compra",actionClass:"btn-danger",placeholder:"Explica el motivo de la anulación"},async o=>{await API.voidPurchaseInvoice(e,o),showToast(a==="posted"?"Factura anulada. Se revirtieron contabilidad e inventario.":"Factura anulada","success"),ma($("#page-content"))})}function jt(e,t,a,o,s){return`<div class="rounded-2xl p-4" style="background:${s}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${a} text-sm" style="color:${o}"></i>
      <span class="text-xs font-semibold" style="color:${o}">${e}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${o}">${t}</p>
  </div>`}window.savePurchaseConfig=Ri;window.defaultPurchaseConfig=Ca;window.contabilizarCompra=el;window.openPurchaseForm=hs;window.voidPurchase=al;window.reopenPurchase=tl;window._loadComprasPage=Ta;window.viewPurchaseDetail=Zr;window.getPurchaseConfig=vs;window.PURCHASE_CONFIG_KEY=ms;window.renderCompras=ma;window.PO_IVA_RATES=fs;window.openPurchaseReasonDialog=bs;window.poKpi=jt;window.addDaysToDateStr=fo;window.editPurchase=Xr;window.normalizePurchaseConfig=gs;window.renderPoRow=ki;window.openPurchaseSettingsModal=Oi;window.PO_PRODUCT_UNITS=Fi;window.PO_STATUS=us;window.PO_PRODUCT_TYPES=Pi;window.fmtPurchaseAuditDate=Di;window.filterPoTable=Mi;const ut={draft:{label:"Borrador",badge:"badge-orange"},posted:{label:"Contabilizada",badge:"badge-green"},paid:{label:"Pagada",badge:"badge-blue"},voided:{label:"Anulada",badge:"badge-red"}},bo={pending:{label:"Pendiente",badge:"badge-orange"},confirmed:{label:"Confirmada",badge:"badge-green"},cancelled:{label:"Cancelada",badge:"badge-red"}},aa={open:{label:"Abierta",badge:"badge-orange"},in_process:{label:"En proceso",badge:"badge-blue"},resolved:{label:"Resuelta",badge:"badge-green"},closed:{label:"Cerrada",badge:"badge-gray"}},oa={baja:{label:"Baja",badge:"badge-gray"},media:{label:"Media",badge:"badge-orange"},alta:{label:"Alta",badge:"badge-red"}},sa=[{value:"PETICION",label:"Petición"},{value:"QUEJA",label:"Queja"},{value:"RECLAMO",label:"Reclamo"},{value:"SUGERENCIA",label:"Sugerencia"},{value:"FELICITACION",label:"Felicitación"}],Bi=["APARTAMENTO","PARQUEADERO","DEPOSITO","LOCAL","CASA","OFICINA","OTRO"];function Ee(e,t,a,o,s){return`<div class="rounded-2xl p-4" style="background:${s}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${a} text-sm" style="color:${o}"></i>
      <span class="text-xs font-semibold" style="color:${o}">${e}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${o}">${t}</p>
  </div>`}function ht(){const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}`}function We(e){if(!e)return"—";const[t,a]=String(e).split("-");return`${["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][(parseInt(a,10)||1)-1]} ${t}`}async function ol(e){e.innerHTML=`<div class="p-8 text-center" style="color:#9CA3AF">
    <i class="fas fa-spinner fa-spin mr-2"></i>Cargando módulo Copropiedades...</div>`,Ui(e,"facturacion")}function Ui(e,t){const a=[{id:"facturacion",label:"Facturación",icon:"fa-file-invoice-dollar"},{id:"cartera",label:"Cartera",icon:"fa-chart-line"},{id:"unidades",label:"Unidades",icon:"fa-building"},{id:"reservas",label:"Reservas",icon:"fa-calendar-check"},{id:"pqrs",label:"PQRs",icon:"fa-comments"},{id:"config",label:"Configuración",icon:"fa-sliders"}];e.innerHTML=`
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-city mr-2" style="color:#7F7CFF"></i>Copropiedades
        </h3>
        <p class="text-sm" style="color:#6B7280">Propiedad Horizontal — Gestión integral de conjuntos residenciales y comerciales.</p>
      </div>
    </div>
    <div class="flex gap-1 mb-5 border-b flex-wrap" style="border-color:#E5E7EB">
      ${a.map(n=>`
        <button class="tab-btn${n.id===t?" active":""}" data-tab="${n.id}">
          <i class="fas ${n.icon} mr-2"></i>${n.label}
        </button>`).join("")}
    </div>
    <div id="ph-tab-content"></div>`;const o=e.querySelector("#ph-tab-content");function s(n){e.querySelectorAll(".tab-btn").forEach(i=>i.classList.toggle("active",i.dataset.tab===n)),n==="facturacion"&&fa(o),n==="cartera"&&Qi(o),n==="unidades"&&qa(o),n==="reservas"&&na(o),n==="pqrs"&&ys(o),n==="config"&&Qe(o)}e.querySelectorAll(".tab-btn").forEach(n=>n.addEventListener("click",()=>s(n.dataset.tab))),s(t)}async function fa(e){var t,a,o,s,n,i;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const c=ht(),r=pb.escapeFilterValue(c),[l,p]=await Promise.all([API.getPhInvoices({filter:`period="${r}"`,perPage:200}),API.getPhInvoices({filter:"",perPage:1})]),f=l.items||[],m=p.totalItems||0,d=f.filter(v=>v.status==="posted").length,b=f.filter(v=>v.status==="paid").length,u=f.filter(v=>v.status==="draft").length,y=f.reduce((v,g)=>v+(g.total||0),0);e.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        ${Ee("Facturas del mes",f.length,"fas fa-file-invoice","#7F7CFF","#F5F3FF")}
        ${Ee("Borradores",u,"fas fa-pen-to-square","#C46516","#FFF8F0")}
        ${Ee("Contabilizadas",d,"fas fa-check-circle","#059669","#ECFDF5")}
        ${Ee("Valor del mes",fmt(y),"fas fa-coins","#1A4B8C","#EEF4FF")}
      </div>

      <!-- Barra de acciones -->
      <div class="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3" style="border-color:#F0F0F0">
        <div>
          <label class="form-label mb-1">Período</label>
          <input id="ph-period-filter" type="month" class="form-input" style="max-width:180px" value="${esc(c)}">
        </div>
        <div class="flex-1"></div>
        ${can("canApprove")?`
          <button class="btn btn-outline" id="ph-post-period-btn" title="Contabilizar todas las facturas en borrador del período"
            style="color:#059669;border-color:#6EE7B7">
            <i class="fas fa-layer-group"></i> Contabilizar período
          </button>
          <button class="btn btn-outline" id="ph-unpost-period-btn" title="Descontabilizar liquidación del período"
            style="color:#1A4B8C;border-color:#93C5FD">
            <i class="fas fa-rotate-left"></i> Descontabilizar período
          </button>
          <button class="btn btn-outline" id="ph-delete-period-btn" title="Eliminar liquidación del período"
            style="color:#DC2626;border-color:#FECACA">
            <i class="fas fa-trash"></i> Eliminar período
          </button>`:""}
        ${can("canWrite")?`
          <button class="btn btn-primary" id="ph-gen-btn">
            <i class="fas fa-wand-magic-sparkles"></i> Generar facturas del período
          </button>`:""}
      </div>

      <!-- Tabla de facturas -->
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="px-5 py-3 border-b flex items-center justify-between" style="border-color:#F0F0F0">
          <span class="font-bold text-sm" style="color:#0D2137">
            Facturas — <span id="ph-period-label">${We(c)}</span>
          </span>
          <input id="ph-inv-search" class="form-input text-sm" placeholder="Buscar unidad..." style="max-width:200px">
        </div>
        <div class="overflow-x-auto">
          <table class="data-table" id="ph-inv-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Unidad</th>
                <th>Propietario</th>
                <th>Período</th>
                <th class="text-right">Total</th>
                <th>Vence</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="ph-inv-tbody">
              ${Ia(f)}
            </tbody>
          </table>
        </div>
        ${f.length===0?`
          <div class="py-12 text-center" style="color:#9CA3AF">
            <i class="fas fa-file-invoice text-3xl mb-3 block"></i>
            No hay facturas para este período. Usa <strong>Generar facturas</strong> para crearlas.
          </div>`:""}
      </div>`,(t=document.getElementById("ph-period-filter"))==null||t.addEventListener("change",async v=>{const g=v.target.value;if(!g)return;document.getElementById("ph-period-label").textContent=We(g);const h=pb.escapeFilterValue(g),_=await API.getPhInvoices({filter:`period="${h}"`,perPage:200});document.getElementById("ph-inv-tbody").innerHTML=Ia(_.items||[]),et()}),(a=document.getElementById("ph-inv-search"))==null||a.addEventListener("input",debounce(()=>{var g;const v=(((g=document.getElementById("ph-inv-search"))==null?void 0:g.value)||"").toLowerCase();document.querySelectorAll("#ph-inv-table tbody tr").forEach(h=>{h.style.display=v&&!h.textContent.toLowerCase().includes(v)?"none":""})},150)),(o=document.getElementById("ph-gen-btn"))==null||o.addEventListener("click",()=>Gi()),(s=document.getElementById("ph-post-period-btn"))==null||s.addEventListener("click",()=>Vi(e)),(n=document.getElementById("ph-unpost-period-btn"))==null||n.addEventListener("click",()=>ji(e)),(i=document.getElementById("ph-delete-period-btn"))==null||i.addEventListener("click",()=>Hi(e)),et()}catch(c){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(c.message)}</div>`}}function Ia(e){return e.length?e.map(t=>{var i,c,r;const a=(i=t.expand)==null?void 0:i.property_id,o=((c=a==null?void 0:a.expand)==null?void 0:c.owner_id)||((r=t.expand)==null?void 0:r["property_id.owner_id"]),s=ut[t.status]||ut.draft,n=t.status==="voided";return`<tr data-id="${esc(t.id)}" style="${n?"opacity:.55":""}">
      <td class="font-mono text-xs">${esc(t.number)}</td>
      <td>
        <span class="font-semibold" style="color:#0D2137">${esc((a==null?void 0:a.name)||(a==null?void 0:a.code)||t.property_id)}</span>
        <br><span class="text-xs" style="color:#9CA3AF">${esc((a==null?void 0:a.unit_type)||"")}</span>
      </td>
      <td class="text-sm">${esc((o==null?void 0:o.name)||"—")}</td>
      <td>${We(t.period)}</td>
      <td class="text-right font-semibold">${fmt(t.total||0)}</td>
      <td class="text-sm">${esc(t.due_date||"—")}</td>
      <td><span class="badge ${s.badge}">${s.label}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(t.id)}" title="Ver detalle">
            <i class="fas fa-eye"></i>
          </button>
          ${t.status==="draft"?`
            <button class="btn btn-outline btn-sm ph-inv-add-individual" data-id="${esc(t.id)}" title="Añadir concepto individual"
              style="color:#7F7CFF;border-color:#C4B5FD">
              <i class="fas fa-plus-circle"></i>
            </button>
            <button class="btn btn-sm ph-inv-post" data-id="${esc(t.id)}" title="Contabilizar"
              style="background:#ECFDF5;color:#059669;border:1.5px solid #6EE7B7">
              <i class="fas fa-check"></i>
            </button>`:""}
          ${t.status==="posted"?`
            <button class="btn btn-sm ph-inv-paid" data-id="${esc(t.id)}" title="Marcar pagada"
              style="background:#EEF4FF;color:#2446B8;border:1.5px solid #93C5FD">
              <i class="fas fa-coins"></i>
            </button>`:""}
          ${can("canApprove")&&(t.status==="posted"||t.status==="paid")?`
            <button class="btn btn-outline btn-sm ph-inv-unpost" data-id="${esc(t.id)}" title="Descontabilizar factura"
              style="color:#1A4B8C;border-color:#93C5FD">
              <i class="fas fa-rotate-left"></i>
            </button>`:""}
          ${t.status==="draft"||t.status==="posted"?`
            <button class="btn btn-outline btn-sm ph-inv-void" data-id="${esc(t.id)}" title="Anular"
              style="color:#DC2626;border-color:#FECACA">
              <i class="fas fa-ban"></i>
            </button>`:""}
        </div>
      </td>
    </tr>`}).join(""):'<tr><td colspan="8" class="text-center py-8" style="color:#9CA3AF">Sin registros</td></tr>'}function et(){document.querySelectorAll(".ph-inv-view").forEach(e=>{e.addEventListener("click",()=>Ga(e.dataset.id))}),document.querySelectorAll(".ph-inv-add-individual").forEach(e=>{e.addEventListener("click",()=>nc(e.dataset.id))}),document.querySelectorAll(".ph-inv-post").forEach(e=>{e.addEventListener("click",()=>Wi(e.dataset.id,e))}),document.querySelectorAll(".ph-inv-paid").forEach(e=>{e.addEventListener("click",()=>Yi(e.dataset.id,e))}),document.querySelectorAll(".ph-inv-unpost").forEach(e=>{e.addEventListener("click",()=>Ji(e.dataset.id,e))}),document.querySelectorAll(".ph-inv-void").forEach(e=>{e.addEventListener("click",()=>Ki(e.dataset.id))})}function Vi(e){var a;const t=((a=document.getElementById("ph-period-filter"))==null?void 0:a.value)||ht();openModal("Contabilizar Liquidación del Período",`<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción contabilizará en lote todas las facturas en estado <strong>Borrador</strong> del período <strong>${We(t)}</strong>.
      </p>
      <ul class="text-sm list-disc pl-5" style="color:#6B7280">
        <li>Las facturas ya contabilizadas o pagadas serán omitidas.</li>
        <li>Si alguna factura falla, el proceso continuará con las demás.</li>
      </ul>
      <div class="form-group mb-0">
        <label class="form-label">Confirma escribiendo el período</label>
        <input id="ph-post-period-confirm" class="form-input" placeholder="${esc(t)}">
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="ph-post-period-confirm-btn"><i class="fas fa-layer-group mr-1"></i>Contabilizar</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-post-period-confirm-btn"))==null||o.addEventListener("click",async()=>{var i;if((((i=document.getElementById("ph-post-period-confirm"))==null?void 0:i.value)||"").trim()!==t){showToast(`Debes escribir exactamente ${t}.`,"warning");return}const n=document.getElementById("ph-post-period-confirm-btn");n&&(n.disabled=!0,n.textContent="Procesando...");try{const c=await API.postPhInvoicesByPeriod(t);showToast(`Período ${t}: ${c.posted} contabilizadas, ${c.skipped} omitidas, ${c.failed} fallidas.`,c.failed?"warning":"success"),closeModal(),fa(e)}catch(c){showToast(c.message||"Error al contabilizar período.","error"),n&&(n.disabled=!1,n.innerHTML='<i class="fas fa-layer-group mr-1"></i>Contabilizar')}},{once:!0})},50)}function ji(e){var a;const t=((a=document.getElementById("ph-period-filter"))==null?void 0:a.value)||ht();openModal("Descontabilizar Liquidación del Período",`<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción quitará la contabilización de todas las facturas del período <strong>${We(t)}</strong>.
      </p>
      <ul class="text-sm list-disc pl-5" style="color:#6B7280">
        <li>Facturas en estado Contabilizada/Pagada pasarán a Borrador.</li>
        <li>Se desvincularán de su asiento contable.</li>
        <li>Los asientos se intentarán pasar a borrador; si no es posible, se anularán.</li>
      </ul>
      <div class="form-group mb-0">
        <label class="form-label">Confirma escribiendo el período</label>
        <input id="ph-unpost-period-confirm" class="form-input" placeholder="${esc(t)}">
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="ph-unpost-period-confirm-btn"><i class="fas fa-rotate-left mr-1"></i>Descontabilizar</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-unpost-period-confirm-btn"))==null||o.addEventListener("click",async()=>{var i;if((((i=document.getElementById("ph-unpost-period-confirm"))==null?void 0:i.value)||"").trim()!==t){showToast(`Debes escribir exactamente ${t}.`,"warning");return}const n=document.getElementById("ph-unpost-period-confirm-btn");n&&(n.disabled=!0,n.textContent="Procesando...");try{const c=await API.unpostPhInvoicesByPeriod(t);showToast(`Período ${t}: ${c.reverted} facturas descontabilizadas.`,"success"),closeModal(),fa(e)}catch(c){showToast(c.message||"Error al descontabilizar período.","error"),n&&(n.disabled=!1,n.innerHTML='<i class="fas fa-rotate-left mr-1"></i>Descontabilizar')}},{once:!0})},50)}function Hi(e){var a;const t=((a=document.getElementById("ph-period-filter"))==null?void 0:a.value)||ht();openModal("Eliminar Liquidación del Período",`<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción eliminará todas las facturas del período <strong>${We(t)}</strong>.
      </p>
      <ul class="text-sm list-disc pl-5" style="color:#DC2626">
        <li>Se eliminarán cabeceras y líneas de factura del período.</li>
        <li>Se intentará eliminar los asientos asociados; si no es posible, se anularán.</li>
        <li>Esta acción no se puede deshacer.</li>
      </ul>
      <div class="form-group mb-0">
        <label class="form-label">Confirma escribiendo <strong>ELIMINAR ${esc(t)}</strong></label>
        <input id="ph-delete-period-confirm" class="form-input" placeholder="ELIMINAR ${esc(t)}">
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-danger" id="ph-delete-period-confirm-btn"><i class="fas fa-trash mr-1"></i>Eliminar Todo</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-delete-period-confirm-btn"))==null||o.addEventListener("click",async()=>{var c;const s=(((c=document.getElementById("ph-delete-period-confirm"))==null?void 0:c.value)||"").trim().toUpperCase(),n=`ELIMINAR ${t}`.toUpperCase();if(s!==n){showToast(`Debes escribir exactamente: ${n}`,"warning");return}const i=document.getElementById("ph-delete-period-confirm-btn");i&&(i.disabled=!0,i.textContent="Eliminando...");try{const r=await API.deletePhInvoicesByPeriod(t);showToast(`Período ${t}: ${r.deleted} facturas eliminadas.`,"success"),closeModal(),fa(e)}catch(r){showToast(r.message||"Error al eliminar período.","error"),i&&(i.disabled=!1,i.innerHTML='<i class="fas fa-trash mr-1"></i>Eliminar Todo')}},{once:!0})},50)}function Gi(){var o;const e=((o=document.getElementById("ph-period-filter"))==null?void 0:o.value)||ht(),[t,a]=e.split("-").map(Number);a===12?t+1:`${t}${String(a+1).padStart(2,"0")}`,openModal("Generar Facturas del Período",`<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Se generará una factura en estado <strong>Borrador</strong> para cada unidad activa que no tenga factura en este período.
        Los conceptos y montos se toman de la configuración de <em>Conceptos de Facturación</em>.
      </p>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group mb-0">
          <label class="form-label">Período</label>
          <input id="ph-gen-period" type="month" class="form-input" value="${esc(e)}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Fecha de Vencimiento</label>
          <input id="ph-gen-due" type="date" class="form-input" value="${esc(e+"-10")}">
        </div>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="ph-gen-confirm-btn">
       <i class="fas fa-wand-magic-sparkles"></i> Generar
     </button>`),setTimeout(()=>{var s;(s=document.getElementById("ph-gen-confirm-btn"))==null||s.addEventListener("click",async()=>{var r,l;const n=(r=document.getElementById("ph-gen-period"))==null?void 0:r.value,i=(l=document.getElementById("ph-gen-due"))==null?void 0:l.value,c=document.getElementById("ph-gen-confirm-btn");if(!n){showToast("Selecciona un período.","warning");return}c.disabled=!0,c.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Generando...';try{const p=await API.generatePhInvoices(n,i);showToast(`${p} facturas generadas para ${We(n)}.`,"success"),closeModal();const f=document.getElementById("ph-period-filter");f&&(f.value=n);const m=document.getElementById("ph-inv-tbody");if(m){const d=pb.escapeFilterValue(n),b=await API.getPhInvoices({filter:`period="${d}"`,perPage:200});m.innerHTML=Ia(b.items||[]),et()}}catch(p){showToast(p.message||"Error al generar facturas.","error"),c.disabled=!1,c.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> Generar'}},{once:!0})},50)}async function Ga(e){var t,a,o,s;try{const[n,i]=await Promise.all([pb.get("ph_invoices",e,{expand:"property_id,property_id.owner_id,tx_id"}),API.getPhInvoiceLines(e)]),c=(t=n.expand)==null?void 0:t.property_id,r=(a=c==null?void 0:c.expand)==null?void 0:a.owner_id,l=ut[n.status]||ut.draft,p=n.status==="draft",f=d=>/inter[eé]s de mora/i.test(String((d==null?void 0:d.description)||"")),m=d=>p&&!(d!=null&&d.concept_id)&&!f(d);openModal(`Factura ${n.number}`,`<div class="space-y-4">
        <div class="grid grid-cols-2 gap-3 p-3 rounded-xl" style="background:#F8FAFF">
          <div><p class="text-xs" style="color:#6B7280">Unidad</p><p class="font-bold" style="color:#0D2137">${esc((c==null?void 0:c.name)||(c==null?void 0:c.code)||n.property_id)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Tipo</p><p class="font-semibold" style="color:#374151">${esc((c==null?void 0:c.unit_type)||"—")}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Propietario</p><p class="font-semibold" style="color:#374151">${esc((r==null?void 0:r.name)||"—")}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Período</p><p class="font-semibold" style="color:#374151">${We(n.period)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Fecha</p><p class="font-semibold" style="color:#374151">${esc(n.date)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Vence</p><p class="font-semibold" style="color:#374151">${esc(n.due_date||"—")}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Estado</p><span class="badge ${l.badge}">${l.label}</span></div>
          ${n.tx_id?`<div><p class="text-xs" style="color:#6B7280">Asiento</p><p class="font-mono text-xs" style="color:#374151">${esc(((s=(o=n.expand)==null?void 0:o.tx_id)==null?void 0:s.number)||n.tx_id)}</p></div>`:""}
        </div>
        <table class="data-table text-sm">
          <thead><tr><th>Concepto</th><th class="text-right">Valor</th>${p?"<th>Acciones</th>":""}</tr></thead>
          <tbody>
            ${i.map(d=>`<tr>
              <td>${esc(d.description)}</td>
              <td class="text-right font-semibold">${fmt(d.amount||0)}</td>
              ${p?`<td>
                ${m(d)?`<div class="flex gap-1">
                  <button class="btn btn-outline btn-sm ph-line-edit" data-line-id="${esc(d.id)}" data-inv-id="${esc(n.id)}" title="Editar línea"><i class="fas fa-pen"></i></button>
                  <button class="btn btn-outline btn-sm ph-line-del" data-line-id="${esc(d.id)}" data-inv-id="${esc(n.id)}" title="Eliminar línea" style="color:#DC2626;border-color:#FECACA"><i class="fas fa-trash"></i></button>
                </div>`:'<span class="text-xs" style="color:#9CA3AF">No editable</span>'}
              </td>`:""}
            </tr>`).join("")}
            <tr style="border-top:2px solid #E5E7EB">
              <td class="font-bold" style="color:#0D2137">TOTAL</td>
              <td class="text-right font-bold text-lg" style="color:#0D2137">${fmt(n.total||0)}</td>
              ${p?"<td></td>":""}
            </tr>
          </tbody>
        </table>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>'),p&&setTimeout(()=>{document.querySelectorAll(".ph-line-edit").forEach(d=>{d.addEventListener("click",()=>qi(d.dataset.lineId,d.dataset.invId))}),document.querySelectorAll(".ph-line-del").forEach(d=>{d.addEventListener("click",()=>zi(d.dataset.lineId,d.dataset.invId))})},30)}catch(n){showToast(n.message||"Error al cargar la factura.","error")}}async function qi(e,t){let a;try{a=await pb.get("ph_invoice_lines",e)}catch{showToast("No se pudo cargar la línea.","error");return}openModal("Editar Concepto Manual",`<div class="space-y-4">
      <div class="form-group mb-0">
        <label class="form-label">Descripción <span class="text-red-500">*</span></label>
        <input id="ph-line-edit-desc" class="form-input" value="${esc(a.description||"")}">
      </div>
      <div class="form-group mb-0">
        <label class="form-label">Valor <span class="text-red-500">*</span></label>
        <input id="ph-line-edit-amount" type="number" min="0" step="1" class="form-input" value="${esc(a.amount||0)}">
      </div>
    </div>`,`<button class="btn btn-outline" onclick="openPhInvoiceDetail('${esc(t)}')">Cancelar</button>
     <button class="btn btn-primary" id="ph-line-edit-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-line-edit-save-btn"))==null||o.addEventListener("click",async()=>{var c,r;const s=(((c=document.getElementById("ph-line-edit-desc"))==null?void 0:c.value)||"").trim(),n=parseFloat(((r=document.getElementById("ph-line-edit-amount"))==null?void 0:r.value)||0)||0;if(!s||n<=0){showToast("Descripción y valor son obligatorios.","warning");return}const i=document.getElementById("ph-line-edit-save-btn");i&&(i.disabled=!0,i.textContent="Guardando...");try{await API.updatePhDraftInvoiceLine(e,{description:s,amount:n,account_code:a.account_code||""}),showToast("Línea actualizada.","success"),Ga(t)}catch(l){showToast(l.message||"Error al actualizar línea.","error"),i&&(i.disabled=!1,i.innerHTML='<i class="fas fa-save mr-1"></i>Guardar')}},{once:!0})},40)}async function zi(e,t){if(confirm("¿Eliminar este concepto manual de la factura?"))try{await API.deletePhDraftInvoiceLine(e),showToast("Línea eliminada.","success"),Ga(t)}catch(a){showToast(a.message||"Error al eliminar línea.","error")}}async function Wi(e,t){if(confirm("¿Contabilizar esta factura? Se generará el asiento contable correspondiente.")){t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i>');try{await API.postPhInvoice(e),showToast("Factura contabilizada correctamente.","success");const a=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);if(a){const o=await pb.get("ph_invoices",e,{expand:"property_id,property_id.owner_id"}),s=ut[o.status];a.querySelector("td:nth-child(7)").innerHTML=`<span class="badge ${s.badge}">${s.label}</span>`,a.querySelector("td:nth-child(8)").innerHTML=`
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(o.id)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          <button class="btn btn-sm ph-inv-paid" data-id="${esc(o.id)}" title="Marcar pagada"
            style="background:#EEF4FF;color:#2446B8;border:1.5px solid #93C5FD"><i class="fas fa-coins"></i></button>
          ${can("canApprove")?`<button class="btn btn-outline btn-sm ph-inv-unpost" data-id="${esc(o.id)}" title="Descontabilizar factura"
            style="color:#1A4B8C;border-color:#93C5FD"><i class="fas fa-rotate-left"></i></button>`:""}
          <button class="btn btn-outline btn-sm ph-inv-void" data-id="${esc(o.id)}" title="Anular"
            style="color:#DC2626;border-color:#FECACA"><i class="fas fa-ban"></i></button>
        </div>`,et()}}catch(a){showToast(a.message||"Error al contabilizar.","error"),t&&(t.disabled=!1,t.innerHTML='<i class="fas fa-check"></i>')}}}async function Yi(e,t){if(confirm("¿Marcar esta factura como pagada?")){t&&(t.disabled=!0);try{await API.markPhInvoicePaid(e),showToast("Factura marcada como pagada.","success");const a=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);a&&(a.querySelector("td:nth-child(7)").innerHTML='<span class="badge badge-blue">Pagada</span>',a.querySelector("td:nth-child(8)").innerHTML=`
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(e)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          ${can("canApprove")?`<button class="btn btn-outline btn-sm ph-inv-unpost" data-id="${esc(e)}" title="Descontabilizar factura"
            style="color:#1A4B8C;border-color:#93C5FD"><i class="fas fa-rotate-left"></i></button>`:""}
        </div>`,et())}catch(a){showToast(a.message||"Error.","error"),t&&(t.disabled=!1)}}}async function Ji(e,t){if(confirm("¿Descontabilizar esta factura? Volverá a estado Borrador y se desligará del asiento.")){t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i>');try{await API.unpostPhInvoice(e),showToast("Factura descontabilizada correctamente.","success");const a=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);if(a){const o=ut.draft||{badge:"badge-orange",label:"Borrador"};a.style.opacity="",a.querySelector("td:nth-child(7)").innerHTML=`<span class="badge ${o.badge}">${o.label}</span>`,a.querySelector("td:nth-child(8)").innerHTML=`
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(e)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm ph-inv-add-individual" data-id="${esc(e)}" title="Añadir concepto individual"
            style="color:#7F7CFF;border-color:#C4B5FD"><i class="fas fa-plus-circle"></i></button>
          <button class="btn btn-sm ph-inv-post" data-id="${esc(e)}" title="Contabilizar"
            style="background:#ECFDF5;color:#059669;border:1.5px solid #6EE7B7"><i class="fas fa-check"></i></button>
          <button class="btn btn-outline btn-sm ph-inv-void" data-id="${esc(e)}" title="Anular"
            style="color:#DC2626;border-color:#FECACA"><i class="fas fa-ban"></i></button>
        </div>`,et()}}catch(a){showToast(a.message||"Error al descontabilizar factura.","error"),t&&(t.disabled=!1,t.innerHTML='<i class="fas fa-rotate-left"></i>')}}}function Ki(e){openModal("Anular Factura PH",`<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        <i class="fas fa-triangle-exclamation text-orange-500 mr-1"></i>
        Si la factura está contabilizada, el asiento contable también será anulado.
      </p>
      <div class="form-group mb-0">
        <label class="form-label">Motivo de anulación <span class="text-red-500">*</span></label>
        <textarea id="ph-void-reason" class="form-input" rows="3" placeholder="Describe el motivo..."></textarea>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-danger" id="ph-void-confirm-btn"><i class="fas fa-ban mr-1"></i>Anular</button>`),setTimeout(()=>{var t;(t=document.getElementById("ph-void-confirm-btn"))==null||t.addEventListener("click",async()=>{var s;const a=(((s=document.getElementById("ph-void-reason"))==null?void 0:s.value)||"").trim();if(a.length<8){showToast("Indica un motivo de al menos 8 caracteres.","warning");return}const o=document.getElementById("ph-void-confirm-btn");o&&(o.disabled=!0,o.textContent="Anulando...");try{await API.voidPhInvoice(e,a),showToast("Factura anulada.","success"),closeModal();const n=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);n&&(n.style.opacity=".55",n.querySelector("td:nth-child(7)").innerHTML='<span class="badge badge-red">Anulada</span>',n.querySelector("td:nth-child(8)").innerHTML=`
            <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(e)}" title="Ver detalle"><i class="fas fa-eye"></i></button>`,et())}catch(n){showToast(n.message||"Error al anular.","error"),o&&(o.disabled=!1,o.textContent="Anular")}},{once:!0})},50)}async function Qi(e){var t,a,o;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando cartera...</div>';try{let s=function(){const m=new Date,d=m.getFullYear(),b=String(m.getMonth()+1).padStart(2,"0"),u=String(m.getDate()).padStart(2,"0");return`${d}${b}${u}`},n=function(m){const d=document.getElementById("ph-cartera-integrity");if(!d)return;if(!m){d.innerHTML="";return}const b=m.isBalanced?{bg:"#ECFDF5",border:"#6EE7B7",color:"#065F46",icon:"fa-circle-check",title:"Integridad OK"}:{bg:"#FFF7ED",border:"#FDBA74",color:"#9A3412",icon:"fa-triangle-exclamation",title:"Descuadres detectados"};d.innerHTML=`
        <div class="rounded-2xl border p-4" style="background:${b.bg};border-color:${b.border}">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div class="font-bold" style="color:${b.color}">
              <i class="fas ${b.icon} mr-2"></i>${b.title}
            </div>
            <div class="text-sm" style="color:${b.color}">
              Facturas: <strong>${m.totals.invoices}</strong> | Líneas: <strong>${m.totals.lines}</strong>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm" style="color:${b.color}">
            <div>Total facturas: <strong>${fmt(m.totals.totalFacturas)}</strong></div>
            <div>Total líneas: <strong>${fmt(m.totals.totalLineas)}</strong></div>
            <div>Pendiente: <strong>${fmt(m.totals.totalPendiente)}</strong></div>
            <div>Cancelado: <strong>${fmt(m.totals.totalCancelado)}</strong></div>
            <div>Diferencia global: <strong>${fmt(m.totals.diferenciaGlobal)}</strong></div>
          </div>
          ${m.mismatches.length?`
            <div class="mt-3 text-sm" style="color:${b.color}">
              <div class="font-semibold mb-1">Facturas descuadradas (Top ${Math.min(5,m.mismatches.length)}):</div>
              ${m.mismatches.slice(0,5).map(u=>`<div>#${esc(u.number)} (${esc(u.period)}): Factura ${fmt(u.totalFactura)} vs Líneas ${fmt(u.totalLineas)} (dif ${fmt(u.diferencia)})</div>`).join("")}
            </div>`:""}
        </div>`};const i=await API.getPhProperties(!1);e.innerHTML=`
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <div>
            <label class="form-label mb-1">Unidad</label>
            <select id="ph-cartera-unit-filter" class="form-input">
              <option value="">— Todas las unidades —</option>
              ${i.map(m=>`<option value="${esc(m.id)}">${esc(m.code)} - ${esc(m.name)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="form-label mb-1">Fecha de corte</label>
            <input id="ph-cartera-to" type="date" class="form-input">
          </div>
          <div>
            <label class="form-label mb-1">Concepto</label>
            <select id="ph-cartera-concept-filter" class="form-input">
              <option value="">— Todos —</option>
            </select>
          </div>
          <div class="flex items-end">
            <button class="btn btn-primary w-full" id="ph-cartera-refresh-btn">
              <i class="fas fa-sync"></i> Actualizar
            </button>
          </div>
        </div>
      </div>

      <div id="ph-cartera-integrity" class="mb-4"></div>

      <div class="flex gap-1 mb-4 border-b" style="border-color:#E5E7EB">
        <button class="cartera-tab-btn active" data-tab="resumen">
          <i class="fas fa-table mr-2"></i>Saldos Cuentas por Cobrar
        </button>
        <button class="cartera-tab-btn" data-tab="detalle">
          <i class="fas fa-hourglass-half mr-2"></i>Cartera por Edades
        </button>
      </div>

      <div id="ph-cartera-resumen" class="cartera-tab-content">
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
          <div class="px-5 py-3 border-b flex items-center justify-between gap-3" style="border-color:#F0F0F0">
            <span class="font-bold text-sm" style="color:#0D2137">Saldos CxC PH por Unidad y Concepto</span>
            <button class="btn btn-outline btn-sm" id="ph-cartera-pdf-bal" disabled>
              <i class="fas fa-file-pdf"></i> PDF
            </button>
          </div>
          <div id="ph-cartera-bal-meta" class="p-4 border-b text-sm" style="border-color:#F3F4F6;color:#6B7280">
            <i class="fas fa-calendar-days mr-1"></i>Selecciona filtros y pulsa Actualizar.
          </div>
          <div class="overflow-x-auto">
            <table class="data-table" id="ph-cartera-resumen-table">
              <colgroup id="ph-cartera-resumen-colgroup">
                <col style="width:260px">
                <col style="width:160px">
              </colgroup>
              <thead id="ph-cartera-resumen-thead">
                <tr>
                  <th>Unidad</th>
                  <th class="text-right">Total general</th>
                </tr>
              </thead>
              <tbody id="ph-cartera-resumen-tbody">
                <tr><td colspan="2" class="text-center py-4" style="color:#9CA3AF">Cargando...</td></tr>
              </tbody>
              <tfoot id="ph-cartera-resumen-tfoot"></tfoot>
            </table>
          </div>
        </div>
      </div>

      <div id="ph-cartera-detalle" class="cartera-tab-content" style="display:none">
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
          <div class="px-5 py-3 border-b flex items-center justify-between gap-3" style="border-color:#F0F0F0">
            <span class="font-bold text-sm" style="color:#0D2137">Cartera por Edades PH por Concepto</span>
            <button class="btn btn-outline btn-sm" id="ph-cartera-pdf-aging" disabled>
              <i class="fas fa-file-pdf"></i> PDF
            </button>
          </div>
          <div id="ph-cartera-aging-meta" class="p-4 border-b text-sm" style="border-color:#F3F4F6;color:#6B7280">
            <i class="fas fa-hourglass-half mr-1"></i>Distribución por vencer / 0-30 / 31-60 / 61-90 / más de 90 días.
          </div>
          <div class="overflow-x-auto">
            <table class="data-table" id="ph-cartera-detalle-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Concepto</th>
                  <th>Doc. Cruce</th>
                  <th>Fecha Doc.</th>
                  <th class="text-right">Plazo</th>
                  <th>Vencimiento</th>
                  <th class="text-right">Por Vencer</th>
                  <th class="text-right">0-30 días</th>
                  <th class="text-right">31-60 días</th>
                  <th class="text-right">61-90 días</th>
                  <th class="text-right">Más de 90</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody id="ph-cartera-detalle-tbody">
                <tr><td colspan="12" class="text-center py-4" style="color:#9CA3AF">Cargando...</td></tr>
              </tbody>
              <tfoot id="ph-cartera-detalle-tfoot"></tfoot>
            </table>
          </div>
        </div>
      </div>`,e.querySelectorAll(".cartera-tab-btn").forEach(m=>{m.addEventListener("click",()=>{e.querySelectorAll(".cartera-tab-btn").forEach(b=>b.classList.toggle("active",b===m));const d=m.dataset.tab;e.querySelectorAll(".cartera-tab-content").forEach(b=>b.style.display="none"),e.querySelector(`#ph-cartera-${d}`).style.display=""})});let c=null,r=null;async function l(){var d,b,u,y,v,g;if(!((d=c==null?void 0:c.rows)!=null&&d.length)){showToast("No hay datos para exportar en Saldos CxC.","warning");return}const m=typeof getPdfCtorOrWarn=="function"?getPdfCtorOrWarn():null;if(m)try{const h=typeof getPdfHeaderContext=="function"?await getPdfHeaderContext():{companyName:"GRAVY",companyNit:"N/A",companyAddress:"",softwareName:"GRAVY v2.0",userName:String(sessionStorage.getItem("user_name")||"Usuario").trim(),generatedAt:new Date().toLocaleString("es-CO")},_=new m({orientation:"landscape",unit:"pt",format:"letter"}),A=document.getElementById("ph-cartera-unit-filter"),C=((y=(u=(b=A==null?void 0:A.selectedOptions)==null?void 0:b[0])==null?void 0:u.textContent)==null?void 0:y.trim())||"Todas las unidades",T=((v=document.getElementById("ph-cartera-from"))==null?void 0:v.value)||"—",N=((g=document.getElementById("ph-cartera-to"))==null?void 0:g.value)||"—",I=typeof drawPdfHeader=="function"?drawPdfHeader(_,h,{title:"Copropiedades - Saldos CxC por Concepto",subtitles:[`Unidad: ${C}`,`Periodo: ${T} a ${N}`]}):{marginLeft:24,marginRight:_.internal.pageSize.getWidth()-24,startY:50},S=[["Unidad",...c.concepts.map(E=>E.label),"Total general"]],w=c.rows.map(E=>[E.unidad,...c.concepts.map(L=>{const R=Number(E.byConcept[L.id]||0);return R?typeof fmtPdfNum=="function"?fmtPdfNum(R):fmt(R):""}),typeof fmtPdfNum=="function"?fmtPdfNum(E.totalGeneral||0):fmt(E.totalGeneral||0)]);w.push(["TOTAL",...c.concepts.map(E=>{const L=Number(c.totalByConcept[E.id]||0);return L?typeof fmtPdfNum=="function"?fmtPdfNum(L):fmt(L):""}),typeof fmtPdfNum=="function"?fmtPdfNum(c.grandTotal||0):fmt(c.grandTotal||0)]),_.autoTable({startY:I.startY,head:S,body:w,theme:"plain",margin:{top:I.startY,left:I.marginLeft,right:24,bottom:24},styles:{font:"helvetica",fontSize:7,textColor:[55,55,55],cellPadding:2.2,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:7.2,lineWidth:{bottom:.25}},didParseCell:E=>{if(E.section!=="body")return;E.row.index===w.length-1&&(E.cell.styles.fontStyle="bold",E.cell.styles.fillColor=[236,236,236],E.cell.styles.textColor=[13,33,55],E.cell.styles.lineWidth={top:.2},E.cell.styles.lineColor=[13,33,55]),E.column.index>0&&(E.cell.styles.halign="right")},didDrawPage:E=>{typeof drawPdfFooter=="function"&&drawPdfFooter(_,E.pageNumber)}}),_.save(`ph_saldos_cxc_${s()}.pdf`)}catch(h){showToast(`Error al generar PDF: ${h.message}`,"error")}}async function p(){var d,b,u,y,v,g,h;if(!((d=r==null?void 0:r.rows)!=null&&d.length)){showToast("No hay datos para exportar en Cartera por Edades.","warning");return}const m=typeof getPdfCtorOrWarn=="function"?getPdfCtorOrWarn():null;if(m)try{const _=typeof getPdfHeaderContext=="function"?await getPdfHeaderContext():{companyName:"GRAVY",companyNit:"N/A",companyAddress:"",softwareName:"GRAVY v2.0",userName:String(sessionStorage.getItem("user_name")||"Usuario").trim(),generatedAt:new Date().toLocaleString("es-CO")},A=new m({orientation:"landscape",unit:"pt",format:"letter"}),C=document.getElementById("ph-cartera-unit-filter"),T=((y=(u=(b=C==null?void 0:C.selectedOptions)==null?void 0:b[0])==null?void 0:u.textContent)==null?void 0:y.trim())||"Todas las unidades",N=((v=document.getElementById("ph-cartera-from"))==null?void 0:v.value)||"—",I=((g=document.getElementById("ph-cartera-to"))==null?void 0:g.value)||"—",S=typeof drawPdfHeader=="function"?drawPdfHeader(A,_,{title:"Copropiedades - Cartera por Edades",subtitles:[`Unidad: ${T}`,`Periodo: ${N} a ${I}`]}):{marginLeft:24,marginRight:A.internal.pageSize.getWidth()-24,startY:50},w=r.rows,E=[];let L=null,R={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0};for(let M=0;M<w.length;M++){const B=w[M];L!==B.unidad&&(L=B.unidad,R={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0}),E.push([B.unidad,B.concepto,"","","","",typeof fmtPdfNum=="function"?fmtPdfNum(B.por_vencer||0):fmt(B.por_vencer||0),typeof fmtPdfNum=="function"?fmtPdfNum(B.de_0_a_30||0):fmt(B.de_0_a_30||0),typeof fmtPdfNum=="function"?fmtPdfNum(B.de_31_a_60||0):fmt(B.de_31_a_60||0),typeof fmtPdfNum=="function"?fmtPdfNum(B.de_61_a_90||0):fmt(B.de_61_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(B.mayor_a_90||0):fmt(B.mayor_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(B.total||0):fmt(B.total||0)]),R.por_vencer+=B.por_vencer,R.de_0_a_30+=B.de_0_a_30,R.de_31_a_60+=B.de_31_a_60,R.de_61_a_90+=B.de_61_a_90,R.mayor_a_90+=B.mayor_a_90,R.total+=B.total,((h=w[M+1])==null?void 0:h.unidad)!==L&&E.push([`Subtotal ${L}`,"","","","","",typeof fmtPdfNum=="function"?fmtPdfNum(R.por_vencer):fmt(R.por_vencer),typeof fmtPdfNum=="function"?fmtPdfNum(R.de_0_a_30):fmt(R.de_0_a_30),typeof fmtPdfNum=="function"?fmtPdfNum(R.de_31_a_60):fmt(R.de_31_a_60),typeof fmtPdfNum=="function"?fmtPdfNum(R.de_61_a_90):fmt(R.de_61_a_90),typeof fmtPdfNum=="function"?fmtPdfNum(R.mayor_a_90):fmt(R.mayor_a_90),typeof fmtPdfNum=="function"?fmtPdfNum(R.total):fmt(R.total)])}E.push(["TOTAL","","","","","",typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.por_vencer||0):fmt(r.totals.por_vencer||0),typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.de_0_a_30||0):fmt(r.totals.de_0_a_30||0),typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.de_31_a_60||0):fmt(r.totals.de_31_a_60||0),typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.de_61_a_90||0):fmt(r.totals.de_61_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.mayor_a_90||0):fmt(r.totals.mayor_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.total||0):fmt(r.totals.total||0)]),A.autoTable({startY:S.startY,head:[["Unidad","Concepto","","","","","Por Vencer","0-30","31-60","61-90","Mas de 90","Total"]],body:E,theme:"plain",margin:{top:S.startY,left:S.marginLeft,right:24,bottom:24},styles:{font:"helvetica",fontSize:6.8,textColor:[55,55,55],cellPadding:2.1,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:7,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:110},1:{cellWidth:95},2:{cellWidth:20},3:{cellWidth:20},4:{cellWidth:20},5:{cellWidth:20},6:{cellWidth:58,halign:"right"},7:{cellWidth:47,halign:"right"},8:{cellWidth:47,halign:"right"},9:{cellWidth:47,halign:"right"},10:{cellWidth:54,halign:"right"},11:{cellWidth:55,halign:"right"}},didParseCell:M=>{var j;if(M.section!=="body")return;const B=M.row.index===E.length-1,k=(j=M.row.raw[0])==null?void 0:j.startsWith("Subtotal ");(B||k)&&(M.cell.styles.fontStyle="bold",M.cell.styles.fillColor=[236,236,236],M.cell.styles.textColor=[13,33,55],M.cell.styles.lineWidth={top:.2},M.cell.styles.lineColor=[13,33,55])},didDrawPage:M=>{typeof drawPdfFooter=="function"&&drawPdfFooter(A,M.pageNumber)}}),A.save(`ph_cartera_edades_${s()}.pdf`)}catch(_){showToast(`Error al generar PDF: ${_.message}`,"error")}}async function f(){var _,A,C;const m=((_=document.getElementById("ph-cartera-unit-filter"))==null?void 0:_.value)||"",d=((A=document.getElementById("ph-cartera-to"))==null?void 0:A.value)||"",b=((C=document.getElementById("ph-cartera-concept-filter"))==null?void 0:C.value)||"",u=document.getElementById("ph-cartera-resumen-thead"),y=document.getElementById("ph-cartera-resumen-colgroup"),v=T=>String(T||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toUpperCase(),h=(await API.getPhCarteraOpenParties(m,"",d,{conceptoId:b,estado:"all"})).filter(T=>T.estado!=="cancelado");try{const[T,N]=await Promise.all([API.getPhCarteraByUnit(m,"",d),API.getPhCarteraIntegrity(m,"",d)]);n(N);const I=document.getElementById("ph-cartera-concept-filter");if(I){const S=I.value;I.innerHTML=`<option value="">— Todos —</option>${T.map(w=>`<option value="${esc(w.conceptoId)}">${esc(w.concepto)}</option>`).join("")}`,I.value=S}if(T.length===0||h.length===0){y&&(y.innerHTML=`
              <col style="width:260px">
              <col style="width:160px">`),u&&(u.innerHTML=`
            <tr>
              <th>Unidad</th>
              <th class="text-right">Total general</th>
            </tr>`),document.getElementById("ph-cartera-resumen-tbody").innerHTML=`
            <tr><td colspan="2" class="text-center py-4" style="color:#9CA3AF">No hay saldos abiertos para los filtros seleccionados.</td></tr>`,document.getElementById("ph-cartera-resumen-tfoot").innerHTML="",document.getElementById("ph-cartera-bal-meta").innerHTML='<i class="fas fa-info-circle mr-1"></i>Sin datos de saldo abierto.',c=null;const S=document.getElementById("ph-cartera-pdf-bal");S&&(S.disabled=!0)}else{const S=new Map;for(const j of h){const Y=String(j.concepto||"Concepto").trim()||"Concepto",W=v(Y);S.has(W)||S.set(W,Y)}const w=[...S.entries()].map(([j,Y])=>({id:j,label:Y})).sort((j,Y)=>j.label.localeCompare(Y.label,"es")),E=new Map;for(const j of h){const Y=[j.propertyCode,j.propertyName].filter(Boolean).join(" - ")||"Unidad",W=`${j.propertyId}|${Y}`;E.has(W)||E.set(W,{unidad:Y,byConcept:{},totalGeneral:0});const K=E.get(W),H=v(j.concepto||"Concepto");K.byConcept[H]=(K.byConcept[H]||0)+Number(j.amount||0),K.totalGeneral+=Number(j.amount||0)}const L=[...E.values()].sort((j,Y)=>j.unidad.localeCompare(Y.unidad,"es")),R={};let M=0;for(const j of L){M+=Number(j.totalGeneral||0);for(const Y of w)R[Y.id]=(R[Y.id]||0)+Number(j.byConcept[Y.id]||0)}const B=new Set(h.map(j=>String(j.invoiceId||""))).size;document.getElementById("ph-cartera-bal-meta").innerHTML=`Unidades: <strong>${fmtN(L.length)}</strong> · Conceptos: <strong>${fmtN(w.length)}</strong> · Documentos: <strong>${fmtN(B)}</strong> · Saldo abierto: <strong>${fmt(M)}</strong>`,y&&(y.innerHTML=`
              <col style="width:260px">
              ${w.map(()=>'<col style="width:150px">').join("")}
              <col style="width:170px">`),u&&(u.innerHTML=`
            <tr>
              <th>Unidad</th>
              ${w.map(j=>`<th class="text-right">${esc(j.label)}</th>`).join("")}
              <th class="text-right">Total general</th>
            </tr>`),document.getElementById("ph-cartera-resumen-tbody").innerHTML=L.map(j=>`
            <tr>
              <td>${esc(j.unidad)}</td>
              ${w.map(Y=>{const W=Number(j.byConcept[Y.id]||0);return`<td class="text-right">${W?fmt(W):""}</td>`}).join("")}
              <td class="text-right font-semibold" style="color:#065F46">${fmt(j.totalGeneral)}</td>
            </tr>`).join(""),document.getElementById("ph-cartera-resumen-tfoot").innerHTML=`
            <tr>
              <td class="font-bold">Total general</td>
              ${w.map(j=>`<td class="font-bold text-right">${R[j.id]?fmt(R[j.id]):""}</td>`).join("")}
              <td class="font-bold text-right">${fmt(M)}</td>
            </tr>`,c={concepts:w,rows:L,totalByConcept:R,grandTotal:M};const k=document.getElementById("ph-cartera-pdf-bal");k&&(k.disabled=!1)}}catch(T){console.error(T),y&&(y.innerHTML=`
            <col style="width:260px">
            <col style="width:160px">`),u&&(u.innerHTML=`
          <tr>
            <th>Unidad</th>
            <th class="text-right">Total general</th>
          </tr>`),document.getElementById("ph-cartera-resumen-tbody").innerHTML=`
          <tr><td colspan="2" class="text-center py-4" style="color:#EF4444">${esc(T.message)}</td></tr>`,document.getElementById("ph-cartera-resumen-tfoot").innerHTML="",n(null),c=null;const N=document.getElementById("ph-cartera-pdf-bal");N&&(N.disabled=!0)}try{if(h.length===0){document.getElementById("ph-cartera-detalle-tbody").innerHTML=`
            <tr><td colspan="12" class="text-center py-4" style="color:#9CA3AF">No hay cartera abierta para los filtros seleccionados.</td></tr>`,document.getElementById("ph-cartera-detalle-tfoot").innerHTML="",document.getElementById("ph-cartera-aging-meta").innerHTML='<i class="fas fa-info-circle mr-1"></i>Sin datos de cartera por edades.',r=null;const T=document.getElementById("ph-cartera-pdf-aging");T&&(T.disabled=!0)}else{const T=L=>{const R=Number(L||0);return R<0?"por_vencer":R<=30?"b0_30":R<=60?"b31_60":R<=90?"b61_90":"b90p"},N={};for(const L of h){const R=T(L.diasMoraRaw!==void 0?L.diasMoraRaw:L.diasMora),M=Number(L.amount||0),B=[L.propertyCode,L.propertyName].filter(Boolean).join(" - ")||"Unidad",k=L.concepto||"Concepto";N[B]||(N[B]={}),N[B][k]||(N[B][k]={unidad:B,concepto:k,por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0});const j=N[B][k];R==="por_vencer"?j.por_vencer+=M:R==="b0_30"?j.de_0_a_30+=M:R==="b31_60"?j.de_31_a_60+=M:R==="b61_90"?j.de_61_a_90+=M:R==="b90p"&&(j.mayor_a_90+=M),j.total+=M}const I=[],S=[];let w={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0};Object.keys(N).sort((L,R)=>L.localeCompare(R,"es")).forEach(L=>{const R=N[L];let M={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0};S.push(`<tr style="background:#F0F4F8">
              <td colspan="12" style="font-weight:600;padding:5px 10px;font-size:12px;color:#0D2137;border-top:1px solid #D1D5DB">
                <i class="fas fa-building mr-1" style="color:#E87D1E"></i>${esc(L)}
              </td>
            </tr>`),Object.keys(R).sort((B,k)=>B.localeCompare(k,"es")).forEach(B=>{const k=R[B];S.push(`<tr>
                <td>${esc(k.unidad)}</td>
                <td>${esc(k.concepto)}</td>
                <td colspan="4"></td>
                <td class="text-right" style="color:#059669">${fmt(k.por_vencer)}</td>
                <td class="text-right">${fmt(k.de_0_a_30)}</td>
                <td class="text-right">${fmt(k.de_31_a_60)}</td>
                <td class="text-right">${fmt(k.de_61_a_90)}</td>
                <td class="text-right font-semibold">${fmt(k.mayor_a_90)}</td>
                <td class="text-right font-semibold" style="color:#0D2137">${fmt(k.total)}</td>
              </tr>`),I.push({...k}),M.por_vencer+=k.por_vencer,M.de_0_a_30+=k.de_0_a_30,M.de_31_a_60+=k.de_31_a_60,M.de_61_a_90+=k.de_61_a_90,M.mayor_a_90+=k.mayor_a_90,M.total+=k.total}),S.push(`<tr style="background:#FDF6E3">
              <td colspan="6" class="font-bold">Subtotal ${esc(L)}</td>
              <td class="font-bold text-right" style="color:#059669">${fmt(M.por_vencer)}</td>
              <td class="font-bold text-right">${fmt(M.de_0_a_30)}</td>
              <td class="font-bold text-right">${fmt(M.de_31_a_60)}</td>
              <td class="font-bold text-right">${fmt(M.de_61_a_90)}</td>
              <td class="font-bold text-right">${fmt(M.mayor_a_90)}</td>
              <td class="font-bold text-right">${fmt(M.total)}</td>
            </tr>`),w.por_vencer+=M.por_vencer,w.de_0_a_30+=M.de_0_a_30,w.de_31_a_60+=M.de_31_a_60,w.de_61_a_90+=M.de_61_a_90,w.mayor_a_90+=M.mayor_a_90,w.total+=M.total}),document.getElementById("ph-cartera-aging-meta").innerHTML=`Unidades: <strong>${Object.keys(N).length}</strong> · Total: <strong>${fmt(w.total)}</strong>`,document.getElementById("ph-cartera-detalle-tbody").innerHTML=S.join(""),document.getElementById("ph-cartera-detalle-tfoot").innerHTML=`
            <tr>
              <td colspan="6" class="font-bold">Total general</td>
              <td class="font-bold text-right" style="color:#059669">${fmt(w.por_vencer)}</td>
              <td class="font-bold text-right">${fmt(w.de_0_a_30)}</td>
              <td class="font-bold text-right">${fmt(w.de_31_a_60)}</td>
              <td class="font-bold text-right">${fmt(w.de_61_a_90)}</td>
              <td class="font-bold text-right">${fmt(w.mayor_a_90)}</td>
              <td class="font-bold text-right">${fmt(w.total)}</td>
            </tr>`,r={rows:I,totals:w};const E=document.getElementById("ph-cartera-pdf-aging");E&&(E.disabled=!1)}}catch(T){console.error(T),document.getElementById("ph-cartera-detalle-tbody").innerHTML=`
          <tr><td colspan="12" class="text-center py-4" style="color:#EF4444">${esc(T.message)}</td></tr>`,document.getElementById("ph-cartera-detalle-tfoot").innerHTML="",r=null;const N=document.getElementById("ph-cartera-pdf-aging");N&&(N.disabled=!0)}}(t=document.getElementById("ph-cartera-refresh-btn"))==null||t.addEventListener("click",f),(a=document.getElementById("ph-cartera-pdf-bal"))==null||a.addEventListener("click",l),(o=document.getElementById("ph-cartera-pdf-aging"))==null||o.addEventListener("click",p)}catch(s){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(s.message)}</div>`}}async function qa(e){var t,a;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const o=await API.getPhProperties(!1),s=can("canWrite"),n=o.filter(c=>c.active!==!1).length,i=o.length-n;e.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        ${Ee("Total unidades",o.length,"fas fa-building","#7F7CFF","#F5F3FF")}
        ${Ee("Activas",n,"fas fa-check-circle","#059669","#ECFDF5")}
        ${Ee("Inactivas",i,"fas fa-pause-circle","#C46516","#FFF8F0")}
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="px-5 py-3 border-b flex items-center justify-between" style="border-color:#F0F0F0">
          <span class="font-bold text-sm" style="color:#0D2137">Unidades Habitacionales</span>
          <div class="flex gap-2">
            <input id="ph-unit-search" class="form-input text-sm" placeholder="Buscar..." style="max-width:200px">
            ${s?`
            <button class="btn btn-primary btn-sm" id="ph-unit-add-btn">
              <i class="fas fa-plus mr-1"></i>Nueva Unidad
            </button>`:""}
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Apartamento</th>
                <th>Coef. %</th>
                <th>Cuota Admin.</th>
                <th>Propietario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="ph-units-tbody">
              ${Zi(o,s)}
            </tbody>
          </table>
        </div>
      </div>`,(t=document.getElementById("ph-unit-search"))==null||t.addEventListener("input",debounce(()=>{var r;const c=(((r=document.getElementById("ph-unit-search"))==null?void 0:r.value)||"").toLowerCase();document.querySelectorAll("#ph-units-tbody tr").forEach(l=>{l.style.display=c&&!l.textContent.toLowerCase().includes(c)?"none":""})},150)),(a=document.getElementById("ph-unit-add-btn"))==null||a.addEventListener("click",()=>go(null,e)),s&&(e.querySelectorAll(".ph-unit-edit").forEach(c=>{c.addEventListener("click",()=>go(c.dataset.id,e))}),e.querySelectorAll(".ph-unit-toggle").forEach(c=>{c.addEventListener("click",()=>Xi(c.dataset.id,c.dataset.active==="true",e))}))}catch(o){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(o.message)}</div>`}}function Zi(e,t=can("canWrite")){return e.length?e.map(a=>{var n;const o=(n=a.expand)==null?void 0:n.owner_id,s=a.active!==!1;return`<tr>
      <td class="font-mono text-xs font-bold">${esc(a.code)}</td>
      <td class="font-semibold" style="color:#0D2137">${esc(a.name)}</td>
      <td><span class="badge badge-gray">${esc(a.unit_type||"—")}</span></td>
      <td class="text-sm font-semibold">${esc(a.apartment||"—")}</td>
      <td class="text-sm text-right">${a.coef_participacion?fmtN(a.coef_participacion)+"%":"—"}</td>
      <td class="text-sm text-right font-semibold" style="color:#E87D1E">${a.admin_fee?fmt(a.admin_fee):"—"}</td>
      <td class="text-sm">${esc((o==null?void 0:o.name)||"—")}</td>
      <td><span class="badge ${s?"badge-green":"badge-gray"}">${s?"Activa":"Inactiva"}</span></td>
      <td>
        ${t?`<div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-unit-edit" data-id="${esc(a.id)}" title="Editar">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-outline btn-sm ph-unit-toggle" data-id="${esc(a.id)}"
            data-active="${s}" title="${s?"Desactivar":"Activar"}"
            style="${s?"color:#DC2626;border-color:#FECACA":"color:#059669;border-color:#6EE7B7"}">
            <i class="fas ${s?"fa-toggle-on":"fa-toggle-off"}"></i>
          </button>
        </div>`:'<span class="text-xs" style="color:#9CA3AF">Solo lectura</span>'}
      </td>
    </tr>`}).join(""):'<tr><td colspan="9" class="text-center py-10" style="color:#9CA3AF">No hay unidades registradas.</td></tr>'}async function go(e,t){if(!can("canWrite")){showToast("No tienes permisos para guardar unidades.","warning");return}let a=null,o=[];try{[o]=await Promise.all([API.getTerceros(),e?pb.get("ph_properties",e).then(n=>{a=n}):Promise.resolve()]),o=o.filter(n=>n.role?String(n.role).toLowerCase()==="propietario":n.type?String(n.type).toLowerCase()==="propietario":!1)}catch{showToast("Error al cargar datos.","error");return}const s=a?"Editar Unidad":"Nueva Unidad";openModal(s,`<div class="grid grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código <span class="text-red-500">*</span></label>
        <input id="pu-code" class="form-input" value="${esc((a==null?void 0:a.code)||"")}" placeholder="Ej: 101, P-02">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span class="text-red-500">*</span></label>
        <input id="pu-name" class="form-input" value="${esc((a==null?void 0:a.name)||"")}" placeholder="Ej: Apartamento 101">
      </div>
      <div class="form-group">
        <label class="form-label">Tipo <span class="text-red-500">*</span></label>
        <select id="pu-type" class="form-input">
          ${Bi.map(n=>`<option value="${n}" ${(a==null?void 0:a.unit_type)===n?"selected":""}>${n}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Torre</label>
        <input id="pu-tower" class="form-input" value="${esc((a==null?void 0:a.tower)||"")}" placeholder="Ej: Torre 1, A, Norte">
      </div>
      <div class="form-group">
        <label class="form-label">Apartamento (número sin torre)</label>
        <input id="pu-apartment" class="form-input" value="${esc((a==null?void 0:a.apartment)||"")}" placeholder="Ej: 101, 305, PB-01">
      </div>
      <div class="form-group">
        <label class="form-label">Coef. Participación (%)</label>
        <input id="pu-coef" type="number" step="0.0001" min="0" max="100" class="form-input"
          value="${esc((a==null?void 0:a.coef_participacion)??"")}" placeholder="0.0000">
      </div>
      <div class="form-group">
        <label class="form-label">Cuota Administración (valor fijo)</label>
        <input id="pu-admin-fee" type="number" min="0" step="0.01" class="form-input"
          value="${esc((a==null?void 0:a.admin_fee)??"")}" placeholder="0.00">
        <p class="text-xs mt-1" style="color:#6B7280">Si se completa, esta unidad pagará este valor fijo en vez del coeficiente.</p>
      </div>
      <div class="form-group">
        <label class="form-label">Área (m²)</label>
        <input id="pu-area" type="number" min="0" step="0.01" class="form-input"
          value="${esc((a==null?void 0:a.area_m2)??"")}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="pu-active" class="form-input">
          <option value="true"  ${(a==null?void 0:a.active)!==!1?"selected":""}>Activa</option>
          <option value="false" ${(a==null?void 0:a.active)===!1?"selected":""}>Inactiva</option>
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Propietario</label>
        <select id="pu-owner" class="form-input">
          <option value="">— Sin asignar —</option>
          ${o.map(n=>`<option value="${esc(n.id)}" ${(a==null?void 0:a.owner_id)===n.id?"selected":""}>${esc(n.name)} (${esc(n.doc_number)})</option>`).join("")}
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Notas</label>
        <textarea id="pu-notes" class="form-input" rows="2" placeholder="Observaciones...">${esc((a==null?void 0:a.notes)||"")}</textarea>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pu-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var n;(n=document.getElementById("pu-save-btn"))==null||n.addEventListener("click",async()=>{var f,m,d,b,u,y,v,g,h,_,A;const i=(((f=document.getElementById("pu-code"))==null?void 0:f.value)||"").trim(),c=(((m=document.getElementById("pu-name"))==null?void 0:m.value)||"").trim(),r=((d=document.getElementById("pu-type"))==null?void 0:d.value)||"APARTAMENTO";if(!i||!c){showToast("Código y nombre son obligatorios.","warning");return}const l={code:i,name:c,unit_type:r,tower:(((b=document.getElementById("pu-tower"))==null?void 0:b.value)||"").trim(),apartment:(((u=document.getElementById("pu-apartment"))==null?void 0:u.value)||"").trim(),coef_participacion:parseFloat(((y=document.getElementById("pu-coef"))==null?void 0:y.value)||0)||0,admin_fee:parseFloat(((v=document.getElementById("pu-admin-fee"))==null?void 0:v.value)||0)||0,area_m2:parseFloat(((g=document.getElementById("pu-area"))==null?void 0:g.value)||0)||0,owner_id:((h=document.getElementById("pu-owner"))==null?void 0:h.value)||null,notes:((_=document.getElementById("pu-notes"))==null?void 0:_.value)||"",active:((A=document.getElementById("pu-active"))==null?void 0:A.value)==="true"},p=document.getElementById("pu-save-btn");p&&(p.disabled=!0,p.textContent="Guardando...");try{if(a)await pb.update("ph_properties",a.id,l),await API.logAudit("UPDATE","PhProperty",a.id,`Unidad ${i} actualizada`),showToast("Unidad actualizada.","success");else{l.active=!0;const C=await pb.create("ph_properties",l);await API.logAudit("CREATE","PhProperty",C.id,`Nueva unidad ${i}`),showToast("Unidad creada.","success")}closeModal(),qa(t)}catch(C){showToast(C.message||"Error al guardar.","error"),p&&(p.disabled=!1,p.textContent="Guardar")}},{once:!0})},50)}async function Xi(e,t,a){if(!can("canWrite")){showToast("No tienes permisos para actualizar unidades.","warning");return}const o=t?"desactivar":"activar";if(confirm(`¿${o.charAt(0).toUpperCase()+o.slice(1)} esta unidad?`))try{await pb.update("ph_properties",e,{active:!t}),showToast(`Unidad ${o}da.`,"success"),qa(a)}catch(s){showToast(s.message||"Error.","error")}}async function na(e){var t,a;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const o=new Date().toISOString().slice(0,10),[s,n]=await Promise.all([API.getPhReservations({filter:`date>="${pb.escapeFilterValue(o)}"`,sort:"date,time_from",perPage:100}),API.getPhCommonAreas(!0)]),i=s.items||[];e.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        ${Ee("Zonas comunes",n.length,"fas fa-map-marked-alt","#1A4B8C","#EEF4FF")}
        ${Ee("Próximas reservas",i.length,"fas fa-calendar-check","#059669","#ECFDF5")}
        ${Ee("Confirmadas",i.filter(c=>c.status==="confirmed").length,"fas fa-circle-check","#7F7CFF","#F5F3FF")}
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="px-5 py-3 border-b flex items-center justify-between" style="border-color:#F0F0F0">
          <span class="font-bold text-sm" style="color:#0D2137">Reservas Próximas (desde hoy)</span>
          <div class="flex gap-2">
            <select id="ph-res-area-filter" class="form-input text-sm" style="max-width:200px">
              <option value="">Todas las zonas</option>
              ${n.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}
            </select>
            <button class="btn btn-primary btn-sm" id="ph-res-add-btn">
              <i class="fas fa-plus mr-1"></i>Nueva Reserva
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr>
              <th>Zona</th><th>Unidad</th><th>Fecha</th><th>Horario</th>
              <th>Asistentes</th><th>Estado</th><th>Acciones</th>
            </tr></thead>
            <tbody id="ph-res-tbody">
              ${vo(i)}
            </tbody>
          </table>
        </div>
      </div>`,(t=document.getElementById("ph-res-area-filter"))==null||t.addEventListener("change",async c=>{const r=c.target.value;let l=`date>="${pb.escapeFilterValue(o)}"`;r&&(l+=` && area_id="${pb.escapeFilterValue(r)}"`);const p=await API.getPhReservations({filter:l,sort:"date,time_from",perPage:100});document.getElementById("ph-res-tbody").innerHTML=vo(p.items||[]),ho(e,n)}),(a=document.getElementById("ph-res-add-btn"))==null||a.addEventListener("click",()=>ec(null,e,n)),ho(e,n)}catch(o){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(o.message)}</div>`}}function vo(e){return e.length?e.map(t=>{var n,i;const a=(n=t.expand)==null?void 0:n.area_id,o=(i=t.expand)==null?void 0:i.property_id,s=bo[t.status]||bo.pending;return`<tr data-res-id="${esc(t.id)}">
      <td class="font-semibold" style="color:#0D2137">${esc((a==null?void 0:a.name)||"—")}</td>
      <td>${esc((o==null?void 0:o.name)||(o==null?void 0:o.code)||"—")}</td>
      <td>${esc(t.date)}</td>
      <td class="text-sm">${esc(t.time_from)} – ${esc(t.time_to)}</td>
      <td class="text-center">${t.attendees||"—"}</td>
      <td><span class="badge ${s.badge}">${s.label}</span></td>
      <td>
        <div class="flex gap-1">
          ${t.status==="pending"?`
            <button class="btn btn-sm ph-res-confirm" data-id="${esc(t.id)}" title="Confirmar"
              style="background:#ECFDF5;color:#059669;border:1.5px solid #6EE7B7">
              <i class="fas fa-check"></i>
            </button>
            <button class="btn btn-sm ph-res-cancel" data-id="${esc(t.id)}" title="Cancelar"
              style="background:#FEF2F2;color:#DC2626;border:1.5px solid #FECACA">
              <i class="fas fa-xmark"></i>
            </button>`:""}
        </div>
      </td>
    </tr>`}).join(""):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay reservas próximas.</td></tr>'}function ho(e,t){e.querySelectorAll(".ph-res-confirm").forEach(a=>{a.addEventListener("click",async()=>{try{await pb.update("ph_reservations",a.dataset.id,{status:"confirmed"}),showToast("Reserva confirmada.","success"),na(e)}catch(o){showToast(o.message||"Error.","error")}})}),e.querySelectorAll(".ph-res-cancel").forEach(a=>{a.addEventListener("click",async()=>{if(confirm("¿Cancelar esta reserva?"))try{await pb.update("ph_reservations",a.dataset.id,{status:"cancelled"}),showToast("Reserva cancelada.","success"),na(e)}catch(o){showToast(o.message||"Error.","error")}})})}async function ec(e,t,a){let o=null,s=a||[],n=[];try{[n]=await Promise.all([API.getPhProperties(!0),e?pb.get("ph_reservations",e,{expand:"area_id,property_id"}).then(c=>{o=c}):Promise.resolve()]),s.length||(s=await API.getPhCommonAreas(!0))}catch{showToast("Error al cargar datos.","error");return}const i=new Date().toISOString().slice(0,10);openModal(o?"Editar Reserva":"Nueva Reserva",`<div class="grid grid-cols-2 gap-4">
      <div class="form-group col-span-2">
        <label class="form-label">Zona Común <span class="text-red-500">*</span></label>
        <select id="pr-area" class="form-input">
          <option value="">Seleccionar zona...</option>
          ${s.map(c=>`<option value="${esc(c.id)}" ${(o==null?void 0:o.area_id)===c.id?"selected":""}>
            ${esc(c.name)}${c.capacity?` (cap: ${c.capacity})`:""}
          </option>`).join("")}
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Unidad <span class="text-red-500">*</span></label>
        <select id="pr-prop" class="form-input">
          <option value="">Seleccionar unidad...</option>
          ${n.map(c=>`<option value="${esc(c.id)}" ${(o==null?void 0:o.property_id)===c.id?"selected":""}>${esc(c.name)} (${esc(c.code)})</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha <span class="text-red-500">*</span></label>
        <input id="pr-date" type="date" class="form-input" min="${i}" value="${esc((o==null?void 0:o.date)||i)}">
      </div>
      <div class="form-group">
        <label class="form-label">Número de asistentes</label>
        <input id="pr-att" type="number" min="0" class="form-input" value="${esc((o==null?void 0:o.attendees)||"")}">
      </div>
      <div class="form-group">
        <label class="form-label">Hora inicio <span class="text-red-500">*</span></label>
        <input id="pr-from" type="time" class="form-input" value="${esc((o==null?void 0:o.time_from)||"08:00")}">
      </div>
      <div class="form-group">
        <label class="form-label">Hora fin <span class="text-red-500">*</span></label>
        <input id="pr-to" type="time" class="form-input" value="${esc((o==null?void 0:o.time_to)||"10:00")}">
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Notas / Observaciones</label>
        <textarea id="pr-notes" class="form-input" rows="2" placeholder="Ej: Reunión de copropietarios...">${esc((o==null?void 0:o.notes)||"")}</textarea>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pr-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var c;(c=document.getElementById("pr-save-btn"))==null||c.addEventListener("click",async()=>{var u,y,v,g,h,_,A;const r=(u=document.getElementById("pr-area"))==null?void 0:u.value,l=(y=document.getElementById("pr-prop"))==null?void 0:y.value,p=(v=document.getElementById("pr-date"))==null?void 0:v.value,f=(g=document.getElementById("pr-from"))==null?void 0:g.value,m=(h=document.getElementById("pr-to"))==null?void 0:h.value;if(!r||!l||!p||!f||!m){showToast("Completa los campos obligatorios.","warning");return}if(m<=f){showToast("La hora fin debe ser posterior a la hora inicio.","warning");return}const d={area_id:r,property_id:l,date:p,time_from:f,time_to:m,attendees:parseInt(((_=document.getElementById("pr-att"))==null?void 0:_.value)||0)||0,notes:((A=document.getElementById("pr-notes"))==null?void 0:A.value)||"",status:"pending"},b=document.getElementById("pr-save-btn");b&&(b.disabled=!0,b.textContent="Guardando...");try{o?(await pb.update("ph_reservations",o.id,d),showToast("Reserva actualizada.","success")):(await pb.create("ph_reservations",d),showToast("Reserva creada.","success")),closeModal(),na(t)}catch(C){showToast(C.message||"Error.","error"),b&&(b.disabled=!1,b.textContent="Guardar")}},{once:!0})},50)}async function ys(e){var t,a,o;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const[s,n]=await Promise.all([API.getPhPqrs({perPage:100}),API.getPhProperties(!0)]),c=(s.items||[]).filter(m=>(m.status||"open")!=="closed"),r=c.filter(m=>m.status==="open").length,l=c.filter(m=>m.status==="in_process").length,p=c.filter(m=>m.priority==="alta").length;e.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        ${Ee("Abiertas",r,"fas fa-inbox","#C46516","#FFF8F0")}
        ${Ee("En proceso",l,"fas fa-arrows-spin","#1A4B8C","#EEF4FF")}
        ${Ee("Prioridad Alta",p,"fas fa-triangle-exclamation","#DC2626","#FEF2F2")}
        ${Ee("Total activas",c.length,"fas fa-comments","#7F7CFF","#F5F3FF")}
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="px-5 py-3 border-b flex items-center justify-between flex-wrap gap-2" style="border-color:#F0F0F0">
          <span class="font-bold text-sm" style="color:#0D2137">PQRs Activas</span>
          <div class="flex gap-2 flex-wrap">
            <select id="ph-pqr-status-filter" class="form-input text-sm" style="max-width:160px">
              <option value="">Todos los estados</option>
              ${Object.entries(aa).map(([m,d])=>`<option value="${m}">${d.label}</option>`).join("")}
            </select>
            <select id="ph-pqr-type-filter" class="form-input text-sm" style="max-width:160px">
              <option value="">Todos los tipos</option>
              ${sa.map(m=>`<option value="${m.value}">${m.label}</option>`).join("")}
            </select>
            <button class="btn btn-primary btn-sm" id="ph-pqr-add-btn">
              <i class="fas fa-plus mr-1"></i>Nueva PQR
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr>
              <th>N°</th><th>Tipo</th><th>Asunto</th><th>Unidad</th>
              <th>Prioridad</th><th>Estado</th><th>Fecha</th><th>Acciones</th>
            </tr></thead>
            <tbody id="ph-pqrs-tbody">
              ${yo(c)}
            </tbody>
          </table>
        </div>
      </div>`;async function f(){var y,v;const m=(y=document.getElementById("ph-pqr-status-filter"))==null?void 0:y.value,d=(v=document.getElementById("ph-pqr-type-filter"))==null?void 0:v.value,u=((await API.getPhPqrs({perPage:100})).items||[]).filter(g=>{const h=g.status||"open";return!(!m&&h==="closed"||m&&h!==m||d&&g.pqrs_type!==d)});document.getElementById("ph-pqrs-tbody").innerHTML=yo(u),_o(e,n)}(t=document.getElementById("ph-pqr-status-filter"))==null||t.addEventListener("change",f),(a=document.getElementById("ph-pqr-type-filter"))==null||a.addEventListener("change",f),(o=document.getElementById("ph-pqr-add-btn"))==null||o.addEventListener("click",()=>_s(null,e,n)),_o(e,n)}catch(s){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(s.message)}</div>`}}function yo(e){return e.length?e.map(t=>{var c,r;const a=(c=t.expand)==null?void 0:c.property_id,o=aa[t.status]||aa.open,s=oa[t.priority]||oa.media,n=((r=sa.find(l=>l.value===t.pqrs_type))==null?void 0:r.label)||t.pqrs_type||"—",i=t.created?new Date(t.created).toLocaleDateString("es-CO"):"—";return`<tr>
      <td class="font-mono text-xs font-bold">${esc(t.number)}</td>
      <td><span class="badge badge-gray">${esc(n)}</span></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
          title="${esc(t.subject)}">${esc(t.subject)}</td>
      <td class="text-sm">${esc((a==null?void 0:a.name)||(a==null?void 0:a.code)||"—")}</td>
      <td><span class="badge ${s.badge}">${s.label}</span></td>
      <td><span class="badge ${o.badge}">${o.label}</span></td>
      <td class="text-xs">${i}</td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-pqr-view" data-id="${esc(t.id)}" title="Ver / Responder">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </td>
    </tr>`}).join(""):'<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No hay PQRs activas.</td></tr>'}function _o(e,t){e.querySelectorAll(".ph-pqr-view").forEach(a=>{a.addEventListener("click",()=>_s(a.dataset.id,e,t))})}async function _s(e,t,a){var c,r,l;let o=null,s=a||[];try{e&&(o=await pb.get("ph_pqrs",e,{expand:"property_id"})),s.length||(s=await API.getPhProperties(!1))}catch{showToast("Error al cargar datos.","error");return}const n=o?`PQR ${o.number}`:"Nueva PQR",i=Object.entries(aa).map(([p,f])=>`<option value="${p}" ${(o==null?void 0:o.status)===p?"selected":""}>${f.label}</option>`).join("");openModal(n,`<div class="space-y-4">
      ${o?`
        <div class="grid grid-cols-3 gap-3 p-3 rounded-xl text-sm" style="background:#F8FAFF">
          <div><p class="text-xs" style="color:#6B7280">Número</p><p class="font-bold font-mono">${esc(o.number)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Tipo</p><p class="font-semibold">${esc(((c=sa.find(p=>p.value===o.pqrs_type))==null?void 0:c.label)||o.pqrs_type)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Prioridad</p>
            <span class="badge ${((r=oa[o.priority])==null?void 0:r.badge)||"badge-gray"}">${((l=oa[o.priority])==null?void 0:l.label)||o.priority||"—"}</span>
          </div>
        </div>`:""}
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Tipo <span class="text-red-500">*</span></label>
          <select id="pq-type" class="form-input" ${o?"disabled":""}>
            ${sa.map(p=>`<option value="${p.value}" ${(o==null?void 0:o.pqrs_type)===p.value?"selected":""}>${p.label}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Prioridad</label>
          <select id="pq-priority" class="form-input">
            <option value="baja"  ${(o==null?void 0:o.priority)==="baja"?"selected":""}>Baja</option>
            <option value="media" ${(o==null?void 0:o.priority)==="media"?"selected":""}>Media</option>
            <option value="alta"  ${(o==null?void 0:o.priority)==="alta"?"selected":""}>Alta</option>
          </select>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Unidad</label>
          <select id="pq-prop" class="form-input" ${o?"disabled":""}>
            <option value="">— Sin unidad específica —</option>
            ${s.map(p=>`<option value="${esc(p.id)}" ${(o==null?void 0:o.property_id)===p.id?"selected":""}>${esc(p.name)} (${esc(p.code)})</option>`).join("")}
          </select>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Asunto <span class="text-red-500">*</span></label>
          <input id="pq-subject" class="form-input" value="${esc((o==null?void 0:o.subject)||"")}" placeholder="Descripción breve del motivo" ${o?"readonly":""}>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Descripción <span class="text-red-500">*</span></label>
          <textarea id="pq-desc" class="form-input" rows="3" placeholder="Detalle completo de la solicitud..." ${o?"readonly":""}>${esc((o==null?void 0:o.description)||"")}</textarea>
        </div>
        ${o?`
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select id="pq-status" class="form-input">${i}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Asignado a</label>
            <input id="pq-assigned" class="form-input" value="${esc(o.assigned_to||"")}" placeholder="Nombre del responsable">
          </div>
          <div class="form-group col-span-2">
            <label class="form-label">Respuesta / Gestión</label>
            <textarea id="pq-response" class="form-input" rows="3" placeholder="Describe las acciones tomadas...">${esc(o.response||"")}</textarea>
          </div>`:""}
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
     <button class="btn btn-primary" id="pq-save-btn">
       <i class="fas fa-save mr-1"></i>${o?"Actualizar":"Crear PQR"}
     </button>`),setTimeout(()=>{var p;(p=document.getElementById("pq-save-btn"))==null||p.addEventListener("click",async()=>{var m,d,b,u,y,v,g,h,_;const f=document.getElementById("pq-save-btn");f&&(f.disabled=!0,f.textContent="Guardando...");try{if(o){const A=(m=document.getElementById("pq-status"))==null?void 0:m.value,C=((d=document.getElementById("pq-response"))==null?void 0:d.value)||"",T=((b=document.getElementById("pq-assigned"))==null?void 0:b.value)||"",N=((u=document.getElementById("pq-priority"))==null?void 0:u.value)||"media",I={status:A,response:C,assigned_to:T,priority:N};(A==="closed"||A==="resolved")&&(I.closed_at=new Date().toISOString().replace("T"," ").slice(0,19)),await pb.update("ph_pqrs",o.id,I),await API.logAudit("UPDATE","PhPqr",o.id,`PQR ${o.number} → ${A}`),showToast("PQR actualizada.","success")}else{const A=(((y=document.getElementById("pq-subject"))==null?void 0:y.value)||"").trim(),C=(((v=document.getElementById("pq-desc"))==null?void 0:v.value)||"").trim(),T=((g=document.getElementById("pq-type"))==null?void 0:g.value)||"PETICION",N=((h=document.getElementById("pq-priority"))==null?void 0:h.value)||"media",I=((_=document.getElementById("pq-prop"))==null?void 0:_.value)||null;if(!A){showToast("El asunto es obligatorio.","warning"),f&&(f.disabled=!1,f.textContent="Crear PQR");return}if(!C){showToast("La descripción es obligatoria.","warning"),f&&(f.disabled=!1,f.textContent="Crear PQR");return}const S=await API.nextPhPqrNumber(),w=await pb.create("ph_pqrs",{number:S,subject:A,description:C,pqrs_type:T,priority:N,property_id:I||null,status:"open",opened_at:new Date().toISOString().replace("T"," ").slice(0,19)});await API.logAudit("CREATE","PhPqr",w.id,`Nueva PQR ${S} — ${A}`),showToast("PQR creada correctamente.","success")}closeModal(),ys(t)}catch(A){showToast(A.message||"Error.","error"),f&&(f.disabled=!1,f.textContent=o?"Actualizar":"Crear PQR")}},{once:!0})},50)}async function Qe(e){var t,a,o,s,n;e.id=e.id||"ph-config-container",e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const[i,c,r,l,p,f]=await Promise.all([API.getPhBillingConcepts(!1),API.getPhCommonAreas(!1),API.getSetting("ph_config_v1"),API.getAccounts(!0),API.getPhProperties(!0),API.getPhIndividualCharges({filter:""}).catch(()=>({items:[]}))]),m=((f==null?void 0:f.items)||[]).slice().sort((T,N)=>{const I=String((T==null?void 0:T.name)||(T==null?void 0:T.description)||"").toLowerCase(),S=String((N==null?void 0:N.name)||(N==null?void 0:N.description)||"").toLowerCase();return I.localeCompare(S)}),d=new Map((p||[]).map(T=>[T.id,T]));let b={};try{b=r?JSON.parse(r):{}}catch{b={}}const u=b.cxc_code||"130505",y=b.income_code||"413505",v=b.late_fee_income_code||y,g=(l||[]).filter(T=>T.active!==!1&&Number(T.level||0)>=3).sort((T,N)=>String(T.code||"").localeCompare(String(N.code||""))),h=new Map(g.map(T=>[String(T.code||""),T])),_=g.filter(T=>String(T.code||"").startsWith("1")),A=g.filter(T=>String(T.code||"").startsWith("4")),C=(T,N="")=>{const I=String(N||""),S=T.some(E=>String(E.code||"")===I);return`${I&&!S?`<option value="${esc(I)}" selected>${esc(I)} — (No encontrada en PUC activo)</option>`:""}<option value="">— Seleccionar cuenta —</option>${T.map(E=>`<option value="${esc(E.code)}"${String(E.code||"")===I?" selected":""}>${esc(E.code)} — ${esc(E.name||"")}</option>`).join("")}`};e.innerHTML=`
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Configuración Contable -->
        <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
          <h4 class="font-bold mb-4" style="color:#0D2137">
            <i class="fas fa-calculator mr-2" style="color:#7F7CFF"></i>Cuentas Contables PH
          </h4>
          <p class="text-sm mb-4" style="color:#6B7280">
            Cuentas utilizadas al contabilizar facturas de copropiedad.
          </p>
          <div class="form-group">
            <label class="form-label">Cuenta CxC Propietarios (Débito)</label>
            <select id="ph-cfg-cxc" class="form-input font-mono">${C(_,u)}</select>
            <p class="text-xs mt-1" style="color:#9CA3AF">Cuenta a debitar al generar la factura (cartera de propietarios).</p>
          </div>
          <div class="form-group">
            <label class="form-label">Cuenta de Ingreso por Defecto (Crédito)</label>
            <select id="ph-cfg-income" class="form-input font-mono">${C(A,y)}</select>
            <p class="text-xs mt-1" style="color:#9CA3AF">Usada cuando el concepto no tiene cuenta propia asignada.</p>
          </div>
          <button class="btn btn-primary" id="ph-cfg-save-btn">
            <i class="fas fa-save mr-1"></i>Guardar Configuración
          </button>
        </div>

        <!-- Zonas Comunes -->
        <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-bold" style="color:#0D2137">
              <i class="fas fa-map-marked-alt mr-2" style="color:#1A4B8C"></i>Zonas Comunes
            </h4>
            <button class="btn btn-primary btn-sm" id="ph-area-add-btn">
              <i class="fas fa-plus mr-1"></i>Nueva zona
            </button>
          </div>
          <div id="ph-areas-list">
            ${tc(c,e)}
          </div>
        </div>

        <!-- Conceptos de Facturación -->
        <div class="bg-white rounded-2xl border p-5 lg:col-span-2" style="border-color:#F0F0F0">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-bold" style="color:#0D2137">
              <i class="fas fa-tags mr-2" style="color:#059669"></i>Conceptos de Facturación
            </h4>
            <button class="btn btn-primary btn-sm" id="ph-concept-add-btn">
              <i class="fas fa-plus mr-1"></i>Nuevo concepto
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table text-sm">
              <thead>
                <tr>
                  <th>Código</th><th>Nombre</th><th>Valor</th>
                  <th>Aplica Coef.</th><th>Cuenta ingreso</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody id="ph-concepts-tbody">
                ${sc(i,l)}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Intereses de Mora -->
        <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
          <h4 class="font-bold mb-4" style="color:#0D2137">
            <i class="fas fa-hourglass-end mr-2" style="color:#DC2626"></i>Configuración de Intereses de Mora
          </h4>
          <p class="text-sm mb-4" style="color:#6B7280">
            Define qué conceptos generan interés de mora y la tasa mensual aplicable sobre saldos vencidos.
          </p>
          <div class="form-group">
            <label class="form-label">Tasa de Mora (% mensual)</label>
            <input id="ph-late-rate" type="number" min="0" max="100" step="0.01" class="form-input" 
              value="${b.late_fee_rate||2}" placeholder="2">
            <p class="text-xs mt-1" style="color:#6B7280">Ingresa el valor entero. Ej: <strong>2</strong> para aplicar el 2% mensual sobre el saldo vencido.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Cuenta de Ingreso para Intereses de Mora</label>
            <select id="ph-late-income" class="form-input font-mono">${C(A,v)}</select>
            <p class="text-xs mt-1" style="color:#6B7280">Cuenta clase 4 donde se contabilizarán los intereses de mora.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Conceptos que generan mora</label>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:8px;margin-top:8px">
              ${i.filter(T=>T.active!==!1).map(T=>`
                <label class="flex items-center gap-2 p-3 rounded-lg" style="background:#F8FAFF;border:1px solid #E5E7EB;cursor:pointer">
                  <input type="checkbox" class="ph-mora-concept" value="${esc(T.id)}" 
                    ${(b.late_fee_concepts||[]).includes(T.id)?"checked":""}>
                  <span class="text-sm font-medium">${esc(T.code)} — ${esc(T.name)}</span>
                </label>`).join("")}
            </div>
          </div>
          <button class="btn btn-primary mt-4" id="ph-mora-save-btn">
            <i class="fas fa-save mr-1"></i>Guardar Configuración de Mora
          </button>
        </div>

        <!-- Conceptos Individuales -->
        <div class="bg-white rounded-2xl border p-5 lg:col-span-2" style="border-color:#F0F0F0">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-bold" style="color:#0D2137">
              <i class="fas fa-receipt mr-2" style="color:#7F7CFF"></i>Conceptos Individuales
            </h4>
            <button class="btn btn-primary btn-sm" id="ph-individual-concept-add-btn">
              <i class="fas fa-plus mr-1"></i>Nuevo concepto individual
            </button>
          </div>
          <p class="text-sm mb-4" style="color:#6B7280">
            Conceptos que se añaden manualmente a facturas individuales en borrador (sanciones, servicios adicionales, etc.).
            No se agregan automáticamente; se seleccionan por unidad luego de generar las facturas del período.
          </p>
          <div class="overflow-x-auto">
            <table class="data-table text-sm">
              <thead>
                <tr>
                  <th>Nombre</th><th>Descripción</th><th class="text-right">Valor ref.</th>
                  <th>Cuenta ingreso</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody id="ph-ind-concepts-tbody">
                ${ac(m,l)}
              </tbody>
            </table>
          </div>
        </div>
      </div>`,(t=document.getElementById("ph-cfg-save-btn"))==null||t.addEventListener("click",async()=>{var S,w;const T=(((S=document.getElementById("ph-cfg-cxc"))==null?void 0:S.value)||"").trim(),N=(((w=document.getElementById("ph-cfg-income"))==null?void 0:w.value)||"").trim();if(!T||!N){showToast("Completa ambas cuentas.","warning");return}if(!h.has(T)||!h.has(N)){showToast("Selecciona cuentas válidas del PUC activo.","warning");return}if(!T.startsWith("1")){showToast("La cuenta CxC debe ser de clase 1 (Activo).","warning");return}if(!N.startsWith("4")){showToast("La cuenta de ingreso debe ser de clase 4 (Ingreso).","warning");return}const I=document.getElementById("ph-cfg-save-btn");I&&(I.disabled=!0,I.textContent="Guardando...");try{const E={...b,cxc_code:T,income_code:N};await API.setSetting("ph_config_v1",JSON.stringify(E)),showToast("Configuración guardada.","success")}catch(E){showToast(E.message||"Error.","error")}finally{I&&(I.disabled=!1,I.innerHTML='<i class="fas fa-save mr-1"></i>Guardar Configuración')}}),(a=document.getElementById("ph-mora-save-btn"))==null||a.addEventListener("click",async()=>{var w,E;const T=parseFloat(((w=document.getElementById("ph-late-rate"))==null?void 0:w.value)||.5)||.5,N=(((E=document.getElementById("ph-late-income"))==null?void 0:E.value)||"").trim(),I=Array.from(document.querySelectorAll(".ph-mora-concept:checked")).map(L=>L.value);if(!N){showToast("Selecciona la cuenta de ingreso para mora.","warning");return}if(!h.has(N)||!N.startsWith("4")){showToast("La cuenta de mora debe existir en el PUC activo y ser clase 4.","warning");return}const S=document.getElementById("ph-mora-save-btn");S&&(S.disabled=!0,S.textContent="Guardando...");try{const L={...b,late_fee_rate:T,late_fee_concepts:I,late_fee_income_code:N};await API.setSetting("ph_config_v1",JSON.stringify(L)),showToast("Configuración de mora guardada.","success")}catch(L){showToast(L.message||"Error.","error")}finally{S&&(S.disabled=!1,S.innerHTML='<i class="fas fa-save mr-1"></i>Guardar Configuración de Mora')}}),(o=document.getElementById("ph-individual-concept-add-btn"))==null||o.addEventListener("click",()=>$o(null,e,l)),e.querySelectorAll(".ph-ind-concept-edit").forEach(T=>{T.addEventListener("click",()=>$o(T.dataset.id,e,l))}),e.querySelectorAll(".ph-ind-concept-toggle").forEach(T=>{T.addEventListener("click",async()=>{const N=T.dataset.active==="true";await pb.update("ph_individual_charges",T.dataset.id,{active:!N}),showToast(`Concepto ${N?"desactivado":"activado"}.`,"success"),Qe(e)})}),(s=document.getElementById("ph-area-add-btn"))==null||s.addEventListener("click",()=>xo(null,e)),e.querySelectorAll(".ph-area-edit").forEach(T=>{T.addEventListener("click",()=>xo(T.dataset.id,e))}),e.querySelectorAll(".ph-area-toggle").forEach(T=>{T.addEventListener("click",async()=>{const N=T.dataset.active==="true";await pb.update("ph_common_areas",T.dataset.id,{active:!N}),showToast(`Zona ${N?"desactivada":"activada"}.`,"success"),Qe(e)})}),(n=document.getElementById("ph-concept-add-btn"))==null||n.addEventListener("click",()=>Ao(null,e,l)),e.querySelectorAll(".ph-concept-edit").forEach(T=>{T.addEventListener("click",()=>Ao(T.dataset.id,e,l))}),e.querySelectorAll(".ph-concept-toggle").forEach(T=>{T.addEventListener("click",async()=>{const N=T.dataset.active==="true";await pb.update("ph_billing_concepts",T.dataset.id,{active:!N}),showToast(`Concepto ${N?"desactivado":"activado"}.`,"success"),Qe(e)})})}catch(i){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(i.message)}</div>`}}function tc(e,t){return e.length?`<div class="space-y-2">
    ${e.map(a=>`
      <div class="flex items-center justify-between p-3 rounded-xl" style="background:#F8FAFF">
        <div>
          <p class="font-semibold text-sm" style="color:#0D2137">${esc(a.name)}</p>
          <p class="text-xs" style="color:#6B7280">${a.capacity?`Cap: ${a.capacity} pers.`:""}${a.description?` · ${esc(a.description)}`:""}</p>
        </div>
        <div class="flex gap-1">
          <span class="badge ${a.active!==!1?"badge-green":"badge-gray"} mr-2">
            ${a.active!==!1?"Activa":"Inactiva"}
          </span>
          <button class="btn btn-outline btn-sm ph-area-edit" data-id="${esc(a.id)}" title="Editar"><i class="fas fa-pen"></i></button>
          <button class="btn btn-outline btn-sm ph-area-toggle" data-id="${esc(a.id)}"
            data-active="${a.active!==!1}"
            style="${a.active!==!1?"color:#DC2626;border-color:#FECACA":"color:#059669;border-color:#6EE7B7"}" title="${a.active!==!1?"Desactivar":"Activar"}">
            <i class="fas ${a.active!==!1?"fa-toggle-on":"fa-toggle-off"}"></i>
          </button>
        </div>
      </div>`).join("")}
  </div>`:'<p class="text-sm text-center py-4" style="color:#9CA3AF">No hay zonas comunes registradas.</p>'}function ac(e,t){if(!e.length)return'<tr><td colspan="6" class="text-center py-8" style="color:#9CA3AF">No hay conceptos individuales. Crea el primero.</td></tr>';const a=new Map((t||[]).map(o=>[String(o.code||""),o]));return e.map(o=>{var c;const s=o.active!==!1,n=za(o),i=n?((c=a.get(n))==null?void 0:c.name)||n:"—";return`<tr>
      <td class="font-semibold" style="color:#0D2137">${esc(o.name||o.description||"—")}</td>
      <td class="text-xs" style="color:#6B7280">${esc(o.description||"")}</td>
      <td class="text-right font-semibold">${o.amount?fmt(o.amount):"—"}</td>
      <td class="font-mono text-xs">${n?esc(n+" — "+i):"—"}</td>
      <td><span class="badge ${s?"badge-green":"badge-gray"}">${s?"Activo":"Inactivo"}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-ind-concept-edit" data-id="${esc(o.id)}" title="Editar"><i class="fas fa-pen"></i></button>
          <button class="btn btn-outline btn-sm ph-ind-concept-toggle" data-id="${esc(o.id)}"
            data-active="${s}"
            style="${s?"color:#DC2626;border-color:#FECACA":"color:#059669;border-color:#6EE7B7"}">
            <i class="fas ${s?"fa-toggle-on":"fa-toggle-off"}"></i>
          </button>
        </div>
      </td>
    </tr>`}).join("")}function za(e){const t=String((e==null?void 0:e.account_code)||"").trim();if(t)return t;const o=String((e==null?void 0:e.notes)||"").match(/\[ACC:([^\]]+)\]/i);return o?String(o[1]||"").trim():""}function oc(e,t){const a=String(e||"").replace(/\[ACC:[^\]]+\]\s*/ig,"").trim(),o=String(t||"").trim();return o?`[ACC:${o}]${a?" "+a:""}`:a}function sc(e,t){return e.length?e.map(a=>{var n;const o=(n=a.expand)==null?void 0:n.account_id,s=a.active!==!1;return`<tr>
      <td class="font-mono text-xs font-bold">${esc(a.code)}</td>
      <td class="font-semibold" style="color:#0D2137">${esc(a.name)}</td>
      <td class="text-right font-semibold">${fmt(a.amount||0)}</td>
      <td class="text-center">${a.applies_coef?'<i class="fas fa-check text-green-500"></i>':'<i class="fas fa-minus text-gray-300"></i>'}</td>
      <td class="font-mono text-xs">${o?esc(o.code+" — "+o.name):"—"}</td>
      <td><span class="badge ${s?"badge-green":"badge-gray"}">${s?"Activo":"Inactivo"}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-concept-edit" data-id="${esc(a.id)}" title="Editar"><i class="fas fa-pen"></i></button>
          <button class="btn btn-outline btn-sm ph-concept-toggle" data-id="${esc(a.id)}"
            data-active="${s}"
            style="${s?"color:#DC2626;border-color:#FECACA":"color:#059669;border-color:#6EE7B7"}">
            <i class="fas ${s?"fa-toggle-on":"fa-toggle-off"}"></i>
          </button>
        </div>
      </td>
    </tr>`}).join(""):'<tr><td colspan="7" class="text-center py-8" style="color:#9CA3AF">No hay conceptos de facturación. Crea el primero.</td></tr>'}async function xo(e,t){let a=null;try{e&&(a=await pb.get("ph_common_areas",e))}catch{showToast("Error al cargar zona.","error");return}openModal(a?"Editar Zona Común":"Nueva Zona Común",`<div class="grid grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código <span class="text-red-500">*</span></label>
        <input id="pa-code" class="form-input" value="${esc((a==null?void 0:a.code)||"")}" placeholder="Ej: SALON, PISCINA">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span class="text-red-500">*</span></label>
        <input id="pa-name" class="form-input" value="${esc((a==null?void 0:a.name)||"")}" placeholder="Ej: Salón Comunal">
      </div>
      <div class="form-group">
        <label class="form-label">Capacidad (personas)</label>
        <input id="pa-cap" type="number" min="0" class="form-input" value="${esc((a==null?void 0:a.capacity)??"")}">
      </div>
      <div class="form-group">
        <label class="form-label">Horas mín. de reserva</label>
        <input id="pa-minhrs" type="number" min="0" step="0.5" class="form-input" value="${esc((a==null?void 0:a.min_hours)??"")}">
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Descripción</label>
        <input id="pa-desc" class="form-input" value="${esc((a==null?void 0:a.description)||"")}" placeholder="Breve descripción de la zona">
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Reglamento / Reglas de uso</label>
        <textarea id="pa-rules" class="form-input" rows="3" placeholder="Reglas de uso de la zona común...">${esc((a==null?void 0:a.rules)||"")}</textarea>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pa-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var o;(o=document.getElementById("pa-save-btn"))==null||o.addEventListener("click",async()=>{var c,r,l,p,f,m;const s=(((c=document.getElementById("pa-code"))==null?void 0:c.value)||"").trim().toUpperCase(),n=(((r=document.getElementById("pa-name"))==null?void 0:r.value)||"").trim();if(!s||!n){showToast("Código y nombre son obligatorios.","warning");return}const i=document.getElementById("pa-save-btn");i&&(i.disabled=!0,i.textContent="Guardando...");try{const d={code:s,name:n,capacity:parseInt(((l=document.getElementById("pa-cap"))==null?void 0:l.value)||0)||0,min_hours:parseFloat(((p=document.getElementById("pa-minhrs"))==null?void 0:p.value)||0)||0,description:((f=document.getElementById("pa-desc"))==null?void 0:f.value)||"",rules:((m=document.getElementById("pa-rules"))==null?void 0:m.value)||"",active:!0};a?(await pb.update("ph_common_areas",a.id,d),showToast("Zona actualizada.","success")):(await pb.create("ph_common_areas",d),showToast("Zona creada.","success")),closeModal(),Qe(t)}catch(d){showToast(d.message||"Error.","error"),i&&(i.disabled=!1,i.textContent="Guardar")}},{once:!0})},50)}async function Ao(e,t,a){let o=null,s=a||[];try{e&&(o=await pb.get("ph_billing_concepts",e,{expand:"account_id"})),s.length||(s=await API.getAccounts(!0))}catch{showToast("Error al cargar datos.","error");return}s.filter(n=>String(n.code||"").startsWith("4")||String(n.code||"").startsWith("41")),openModal(o?"Editar Concepto":"Nuevo Concepto de Facturación",`<div class="grid grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código <span class="text-red-500">*</span></label>
        <input id="pc-code" class="form-input" value="${esc((o==null?void 0:o.code)||"")}" placeholder="Ej: ADM, FIM">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span class="text-red-500">*</span></label>
        <input id="pc-name" class="form-input" value="${esc((o==null?void 0:o.name)||"")}" placeholder="Ej: Cuota de administración">
      </div>
      <div class="form-group">
        <label class="form-label">Valor Base <span class="text-red-500">*</span></label>
        <input id="pc-amount" type="number" min="0" step="1" class="form-input"
          value="${esc((o==null?void 0:o.amount)??"")}" placeholder="0">
      </div>
      <div class="form-group">
        <label class="form-label">¿Aplicar coeficiente de participación?</label>
        <select id="pc-coef" class="form-input">
          <option value="false" ${o!=null&&o.applies_coef?"":"selected"}>No — Valor fijo igual para todos</option>
          <option value="true"  ${o!=null&&o.applies_coef?"selected":""}>Sí — Proporcional al coeficiente</option>
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Cuenta de Ingreso (opcional)</label>
        <select id="pc-account" class="form-input">
          <option value="">— Usar cuenta por defecto —</option>
          ${s.filter(n=>String(n.code||"").startsWith("4")).map(n=>`<option value="${esc(n.id)}" ${(o==null?void 0:o.account_id)===n.id?"selected":""}>
              ${esc(n.code)} — ${esc(n.name)}
            </option>`).join("")}
        </select>
        <p class="text-xs mt-1" style="color:#6B7280">Solo cuentas de ingresos (clase 4). Si no seleccionas, se usa la cuenta por defecto.</p>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Descripción</label>
        <input id="pc-desc" class="form-input" value="${esc((o==null?void 0:o.description)||"")}" placeholder="Descripción del concepto">
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pc-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var n;(n=document.getElementById("pc-save-btn"))==null||n.addEventListener("click",async()=>{var p,f,m,d,b,u;const i=(((p=document.getElementById("pc-code"))==null?void 0:p.value)||"").trim().toUpperCase(),c=(((f=document.getElementById("pc-name"))==null?void 0:f.value)||"").trim(),r=parseFloat(((m=document.getElementById("pc-amount"))==null?void 0:m.value)||0)||0;if(!i||!c||!r){showToast("Código, nombre y valor son obligatorios.","warning");return}const l=document.getElementById("pc-save-btn");l&&(l.disabled=!0,l.textContent="Guardando...");try{const y={code:i,name:c,amount:r,applies_coef:((d=document.getElementById("pc-coef"))==null?void 0:d.value)==="true",account_id:((b=document.getElementById("pc-account"))==null?void 0:b.value)||null,description:((u=document.getElementById("pc-desc"))==null?void 0:u.value)||"",active:!0};o?(await pb.update("ph_billing_concepts",o.id,y),showToast("Concepto actualizado.","success")):(await pb.create("ph_billing_concepts",y),showToast("Concepto creado.","success")),closeModal(),Qe(t)}catch(y){showToast(y.message||"Error.","error"),l&&(l.disabled=!1,l.textContent="Guardar")}},{once:!0})},50)}async function nc(e){var i;let t=null,a=[];try{[t,a]=await Promise.all([pb.get("ph_invoices",e,{expand:"property_id"}),API.getPhIndividualCharges({filter:""})]),a=((a==null?void 0:a.items)||[]).filter(c=>(c==null?void 0:c.active)!==!1)}catch{showToast("Error al cargar datos.","error");return}if(!a.length){showToast("No hay conceptos individuales activos. Crea al menos uno en Configuración.","warning");return}const o=(i=t.expand)==null?void 0:i.property_id,s=o?`${esc(o.name||o.code||"")}`:esc(t.property_id),n=a.slice().sort((c,r)=>{const l=String((c==null?void 0:c.name)||(c==null?void 0:c.description)||"").toLowerCase(),p=String((r==null?void 0:r.name)||(r==null?void 0:r.description)||"").toLowerCase();return l.localeCompare(p)});openModal(`Añadir conceptos individuales — ${s}`,`<div class="space-y-3">
      <p class="text-sm" style="color:#6B7280">
        Selecciona los conceptos a añadir y ajusta el valor si es necesario.
        Solo se puede modificar facturas en estado <strong>Borrador</strong>.
      </p>
      <div class="space-y-2" id="ph-add-ind-list">
        ${n.map((c,r)=>{const l=za(c);return`
          <div class="flex items-center gap-3 p-3 rounded-lg" style="background:#F8FAFF;border:1px solid #E5E7EB">
            <input type="checkbox" class="ph-add-ind-check" id="pic-chk-${r}"
              data-idx="${r}" data-name="${esc(c.name||c.description||"")}"
              data-account="${esc(l||"")}" style="width:18px;height:18px;cursor:pointer">
            <label for="pic-chk-${r}" class="flex-1 cursor-pointer">
              <p class="font-medium text-sm" style="color:#0D2137">${esc(c.name||c.description||"—")}</p>
              ${c.description?`<p class="text-xs" style="color:#9CA3AF">${esc(c.description)}</p>`:""}
            </label>
            <input type="number" class="form-input ph-add-ind-amount" data-idx="${r}"
              min="0" step="1" style="max-width:130px;text-align:right"
              value="${esc(c.amount||"")}" placeholder="Valor">
          </div>`}).join("")}
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="ph-add-ind-confirm-btn">
       <i class="fas fa-plus-circle mr-1"></i>Añadir a factura
     </button>`),setTimeout(()=>{var c;(c=document.getElementById("ph-add-ind-confirm-btn"))==null||c.addEventListener("click",async()=>{const r=[];if(document.querySelectorAll(".ph-add-ind-check:checked").forEach(p=>{const f=p.dataset.idx,m=document.querySelector(`.ph-add-ind-amount[data-idx="${f}"]`),d=parseFloat((m==null?void 0:m.value)||0)||0;d<=0||r.push({description:p.dataset.name,amount:d,account_code:p.dataset.account||""})}),!r.length){showToast("Selecciona al menos un concepto con valor mayor a 0.","warning");return}const l=document.getElementById("ph-add-ind-confirm-btn");l&&(l.disabled=!0,l.textContent="Guardando...");try{const p=await API.addPhIndividualLinesToInvoice(e,r);showToast(`${r.length} concepto(s) añadido(s). Nuevo total: ${fmt(p)}`,"success"),closeModal();const f=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);f&&(f.querySelector("td:nth-child(5)").textContent=fmt(p))}catch(p){showToast(p.message||"Error al añadir conceptos.","error"),l&&(l.disabled=!1,l.innerHTML='<i class="fas fa-plus-circle mr-1"></i>Añadir a factura')}},{once:!0})},50)}async function $o(e,t,a){let o=null,s=a||[],n=[];try{e&&(o=await pb.get("ph_individual_charges",e)),s.length||(s=await API.getAccounts(!0)),n=await API.getPhProperties(!0)}catch{showToast("Error al cargar datos.","error");return}const i=za(o);openModal(o?"Editar Concepto Individual":"Nuevo Concepto Individual",`<div class="grid grid-cols-2 gap-4">
      <div class="form-group col-span-2">
        <label class="form-label">Nombre <span class="text-red-500">*</span></label>
        <input id="pic-name" class="form-input" value="${esc((o==null?void 0:o.name)||(o==null?void 0:o.description)||"")}"
          placeholder="Ej: Sanción de convivencia, Parqueadero extra, Servicio especial">
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Descripción</label>
        <input id="pic-desc" class="form-input" value="${esc((o==null?void 0:o.description)||"")}"
          placeholder="Descripción adicional del concepto">
      </div>
      <div class="form-group">
        <label class="form-label">Valor de referencia</label>
        <input id="pic-amount" type="number" min="0" step="1" class="form-input"
          value="${esc((o==null?void 0:o.amount)||"")}" placeholder="0 (ajustable al aplicar)">
        <p class="text-xs mt-1" style="color:#6B7280">Opcional. Se puede modificar al añadir a cada factura.</p>
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="pic-active" class="form-input">
          <option value="true"  ${(o==null?void 0:o.active)!==!1?"selected":""}>Activo</option>
          <option value="false" ${(o==null?void 0:o.active)===!1?"selected":""}>Inactivo</option>
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Cuenta de Ingreso (opcional)</label>
        <select id="pic-account" class="form-input font-mono">
          <option value="">— Usar cuenta por defecto de la configuración —</option>
          ${s.filter(c=>String(c.code||"").startsWith("4")).map(c=>`<option value="${esc(c.code)}" ${i===c.code?"selected":""}>
              ${esc(c.code)} — ${esc(c.name)}
            </option>`).join("")}
        </select>
        <p class="text-xs mt-1" style="color:#6B7280">Cuenta clase 4. Si no seleccionas, se usa la cuenta de ingreso por defecto al contabilizar.</p>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pic-save-btn"><i class="fas fa-save mr-1"></i>${o?"Actualizar":"Crear"}</button>`),setTimeout(()=>{var c;(c=document.getElementById("pic-save-btn"))==null||c.addEventListener("click",async()=>{var b,u,y,v,g,h;const r=(((b=document.getElementById("pic-name"))==null?void 0:b.value)||"").trim(),l=(((u=document.getElementById("pic-desc"))==null?void 0:u.value)||"").trim(),p=parseFloat(((y=document.getElementById("pic-amount"))==null?void 0:y.value)||0)||0,f=((v=document.getElementById("pic-active"))==null?void 0:v.value)!=="false",m=(((g=document.getElementById("pic-account"))==null?void 0:g.value)||"").trim();if(!r){showToast("El nombre es obligatorio.","warning");return}const d=document.getElementById("pic-save-btn");d&&(d.disabled=!0,d.textContent="Guardando...");try{const _=(o==null?void 0:o.property_id)||((h=n==null?void 0:n[0])==null?void 0:h.id)||null,A={name:r,description:l||r,amount:p||0,active:f,account_code:m||null,period:(o==null?void 0:o.period)||ht(),notes:oc((o==null?void 0:o.notes)||"",m),property_id:_};o?(await pb.update("ph_individual_charges",o.id,A),showToast("Concepto actualizado.","success")):(await pb.create("ph_individual_charges",A),showToast("Concepto creado. Disponible para añadir a facturas en borrador.","success")),closeModal(),Qe(t)}catch(_){showToast(_.message||"Error al guardar. Si persiste, reinicia el servidor para aplicar la migración.","error"),d&&(d.disabled=!1,d.textContent=o?"Actualizar":"Crear")}},{once:!0})},50)}window.postPhInvoiceConfirm=Wi;window.renderPhIndividualConceptRows=ac;window.PH_UNIT_TYPES=Bi;window.renderPhConfig=Qe;window.attachPhInvActions=et;window.PH_PQRS_STATUS=aa;window.phKpi=Ee;window.attachPhPqrActions=_o;window.openPhPostPeriodModal=Vi;window.getIndividualConceptAccountCode=za;window.voidPhInvoiceModal=Ki;window.openPhEditDraftLineModal=qi;window.renderPhFacturacion=fa;window.renderPhUnitRows=Zi;window.removePhDraftLineConfirm=zi;window.renderPhAreasList=tc;window.renderCopropiedades=ol;window.openPhAreaModal=xo;window.openPhResModal=ec;window.openPhIndividualConceptModal=$o;window.openPhUnpostPeriodModal=ji;window.openPhConceptModal=Ao;window.openPhDeletePeriodModal=Hi;window.upsertIndividualConceptAccInNotes=oc;window.openPhGenerateModal=Gi;window.attachPhResActions=ho;window.openPhPqrModal=_s;window.renderPhPqrs=ys;window.PH_RES_STATUS=bo;window.renderPhCartera=Qi;window.renderPhPqrRows=yo;window.openPhAddIndividualLinesModal=nc;window.PH_STATUS=ut;window.renderPhReservas=na;window.PH_PQRS_TYPES=sa;window.markPhPaidConfirm=Yi;window.openPhUnitModal=go;window.fmtPeriod=We;window.openPhInvoiceDetail=Ga;window.renderPhInvRows=Ia;window.renderPhUnidades=qa;window.PH_PQRS_PRIORITY=oa;window.renderPhConceptRows=sc;window.renderPhResRows=vo;window.currentPeriod=ht;window.unpostPhInvoiceConfirm=Ji;window._renderPhPage=Ui;window.togglePhUnit=Xi;const Ye=()=>window.pb,Sa=e=>window.fmt?window.fmt(e):`$${Number(e).toLocaleString("es-CO")}`,Le=e=>window.esc?window.esc(e):String(e||"").replace(/</g,"&lt;").replace(/>/g,"&gt;"),xs=(e,t,a,o)=>window.openModal(e,t,a,o),ic=()=>window.closeModal(),Ge=(e,t)=>window.showToast(e,t);let ia=[];function As(e){return`${e.doc_number||""} — ${e.name||""}`.trim()}function cc(e,t,a,o,s,n){const i=document.getElementById(e),c=document.getElementById(t),r=document.getElementById(a),l=document.getElementById(o);if(!i||!c||!r||!l)return;const p=ia.filter(s),f=(b="")=>{const u=b.toLowerCase().split(/\s+/).filter(Boolean),y=u.length?p.filter(v=>{const g=`${v.doc_number||""} ${v.name||""}`.toLowerCase();return u.every(h=>g.includes(h))}).slice(0,50):p.slice(0,50);if(!y.length){l.innerHTML='<div class="px-3 py-2 text-xs text-gray-500">Sin resultados</div>';return}l.innerHTML=y.map(v=>`<button type="button" data-teso-id="${v.id}" class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 bg-white border-none cursor-pointer text-gray-800">
        <div class="font-semibold">${v.doc_number||"SIN DOC"}</div>
        <div class="text-xs text-gray-500">${v.name||""}</div>
      </button>`).join("")};(()=>{const b=p.find(u=>u.id===r.value);c.value=b?As(b):""})(),c.onfocus=()=>{f(c.value),l.style.display="block"},c.oninput=()=>{r.value="",f(c.value),l.style.display="block"},l.onclick=b=>{const u=b.target.closest("[data-teso-id]");if(!u)return;const y=u.dataset.tesoId||"",v=p.find(g=>g.id===y)||null;r.value=y,c.value=v?As(v):"",l.style.display="none",v&&n(v)};const d=b=>{i.contains(b.target)||(l.style.display="none")};setTimeout(()=>document.addEventListener("click",d),0)}async function wo(e,t){var a,o,s;e.innerHTML='<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando transacciones...</div>';try{const n=Ye(),i=await n.listAll("transaction_types",{filter:`code="${t}"`});if(!i.length)throw new Error(`No existe el tipo de transacción ${t}`);const c=i[0].id,r=await n.listAll("transactions",{filter:`tx_type_id="${c}"`,sort:"-date",expand:"third_party_id"}),l=t==="RC",p=l?"Recibos de Caja (Recaudos)":"Comprobantes de Egreso (Pagos)",f=l?"Nuevo Recibo":"Nuevo Egreso",m=l?"openRecaudoModal()":"openPagoModal()";e.innerHTML=`
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-gray-800">${p}</h3>
          <p class="text-sm text-gray-500">Historial de ${l?"recaudos aplicados":"pagos emitidos"}.</p>
        </div>
        <button class="btn btn-primary" onclick="${m}"><i class="fas fa-plus mr-2"></i>${f}</button>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 p-3 mb-4 flex gap-3 items-center flex-wrap">
        <input id="teso-filter-q" class="form-input flex-1 min-w-48" placeholder="Buscar número, tercero...">
        <input id="teso-filter-from" type="date" class="form-input" title="Desde">
        <input id="teso-filter-to" type="date" class="form-input" title="Hasta">
      </div>

      <div class="overflow-x-auto border border-gray-200 rounded-xl">
        <table class="data-table w-full" id="teso-tx-table">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3 text-left">Número</th>
              <th class="p-3 text-left">Fecha</th>
              <th class="p-3 text-left">Tercero</th>
              <th class="p-3 text-left">Descripción</th>
              <th class="p-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${r.length===0?'<tr><td colspan="5" class="text-center p-6 text-gray-500">No hay registros.</td></tr>':r.map(b=>{var u,y,v,g;return`
              <tr data-q="${Le(b.number)} ${Le(((y=(u=b.expand)==null?void 0:u.third_party_id)==null?void 0:y.name)||"")}" data-date="${Le(b.date)}">
                <td class="p-3 font-mono font-medium text-blue-800">${Le(b.number)}</td>
                <td class="p-3 text-gray-600">${Le(b.date).slice(0,10)}</td>
                <td class="p-3 font-medium">${Le(((g=(v=b.expand)==null?void 0:v.third_party_id)==null?void 0:g.name)||"N/A")}</td>
                <td class="p-3 text-gray-500 text-sm">${Le(b.description)}</td>
                <td class="p-3 text-center"><span class="badge ${b.status==="active"?"badge-green":"badge-gray"}">${Le(b.status)}</span></td>
              </tr>
            `}).join("")}
          </tbody>
        </table>
      </div>
    `;const d=()=>{const b=(document.getElementById("teso-filter-q").value||"").toLowerCase(),u=document.getElementById("teso-filter-from").value,y=document.getElementById("teso-filter-to").value;document.querySelectorAll("#teso-tx-table tbody tr[data-q]").forEach(v=>{var N;const g=v,h=((N=g.dataset.q)==null?void 0:N.toLowerCase())||"",_=(g.dataset.date||"").slice(0,10),A=!b||h.includes(b),C=!u||_>=u,T=!y||_<=y;g.style.display=A&&C&&T?"":"none"})};(a=document.getElementById("teso-filter-q"))==null||a.addEventListener("input",d),(o=document.getElementById("teso-filter-from"))==null||o.addEventListener("change",d),(s=document.getElementById("teso-filter-to"))==null||s.addEventListener("change",d)}catch(n){e.innerHTML=`<div class="p-4 text-red-600">Error: ${n.message}</div>`}}let Kt=[],rt=null;async function rc(e,t){var o,s,n,i,c,r;const a=document.getElementById("teso-modal-items-container");if(a){a.innerHTML='<div class="p-4 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Buscando partidas abiertas...</div>';try{const p=await Ye().listAll("tx_lines",{filter:`third_party_id="${e}"`,expand:"tx_id,account_id"}),f=new Map;for(const m of p){if(!((s=(o=m.expand)==null?void 0:o.account_id)!=null&&s.maneja_cruce))continue;const d=(m.cross_doc_ref||"").trim();if(!d)continue;const b=`${d}|${m.account_id}`;f.has(b)||f.set(b,{key:b,ref:d,accountId:m.account_id,accountName:((i=(n=m.expand)==null?void 0:n.account_id)==null?void 0:i.name)||"",firstDate:((r=(c=m.expand)==null?void 0:c.tx_id)==null?void 0:r.date)||"",debit:0,credit:0});const u=f.get(b);u.debit+=Number(m.debit||0),u.credit+=Number(m.credit||0)}if(Kt=[...f.values()].map(m=>{const d=m.debit-m.credit,b=t?d:-d;return{...m,saldo:b,netOpen:d}}).filter(m=>m.saldo>.01).sort((m,d)=>m.firstDate.localeCompare(d.firstDate)),Kt.length===0){a.innerHTML='<div class="p-4 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">El tercero no presenta saldos pendientes para esta operación.</div>';return}a.innerHTML=`
      <div class="overflow-x-auto border border-gray-200 rounded-lg mt-3 mb-4">
        <table class="w-full text-sm data-table">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 text-left">Documento</th>
              <th class="p-2 text-left">Concepto</th>
              <th class="p-2 text-right">Saldo Pendiente</th>
              <th class="p-2 text-right" style="width: 140px">Abono a Aplicar</th>
            </tr>
          </thead>
          <tbody>
            ${Kt.map(m=>`
              <tr class="border-b border-gray-100 bg-white">
                <td class="p-2 font-medium">${Le(m.ref)} <div class="text-xs text-gray-400">${Le(m.firstDate)}</div></td>
                <td class="p-2 text-gray-600">${Le(m.accountName)}</td>
                <td class="p-2 text-right font-semibold ${t?"text-red-600":"text-blue-600"}">${Sa(m.saldo)}</td>
                <td class="p-2 text-right">
                  <input type="number" min="0" max="${m.saldo}" class="form-input text-right w-full teso-abono-input" data-key="${m.key}" data-ref="${m.ref}" data-account="${m.accountId}" data-max="${m.saldo}" placeholder="0" disabled>
                </td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot class="bg-gray-50">
            <tr>
              <td colspan="2" class="p-2 text-right font-bold">Total a Distribuir:</td>
              <td class="p-2 text-right font-bold" id="teso-modal-total-abonos">$0</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    `,document.querySelectorAll(".teso-abono-input").forEach(m=>{m.addEventListener("input",()=>{let d=0;document.querySelectorAll(".teso-abono-input").forEach(b=>d+=Number(b.value||0)),document.getElementById("teso-modal-total-abonos").textContent=Sa(d)})})}catch(l){a.innerHTML=`<div class="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200"><i class="fas fa-exclamation-triangle mr-2"></i> Error: ${l.message}</div>`}}}function sl(){const e=document.getElementById("teso-modal-modo").value==="manual";document.querySelectorAll(".teso-abono-input").forEach(t=>{const a=t;a.disabled=!e,e||(a.value="")}),e||(document.getElementById("teso-modal-total-abonos").textContent="$0")}async function nl(e){const t=document.getElementById("teso-modal-monto"),a=document.getElementById("teso-modal-modo"),o=document.getElementById("teso-modal-cuenta"),s=Number(t.value),n=a.value,i=o.value;if(!i){Ge("Debes seleccionar la cuenta origen/destino","warning");return}if(!rt){Ge("Debes seleccionar un tercero","warning");return}let c=[];if(n==="manual"){let p=0;if(document.querySelectorAll(".teso-abono-input").forEach(f=>{const m=f,d=Number(m.value);d>0&&(c.push({key:m.dataset.key,cross_doc_ref:m.dataset.ref,account_id:m.dataset.account,monto:d}),p+=d)}),p<=0){Ge("Debes indicar al menos un abono manual mayor a 0","warning");return}}else if(s<=0){Ge("El monto a aplicar debe ser mayor a 0","warning");return}const r=document.getElementById("btn-save-teso-tx");r.disabled=!0,r.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...';const l=e?"RC":"CE";try{const p=Ye(),f=await p.listAll("transaction_types",{filter:`code="${l}"`});if(!f.length)throw new Error(`Falta tipo ${l}`);const m={third_party_id:rt.id,amount:n==="manual"?c.reduce((d,b)=>d+b.monto,0):s,contrapartida_account_id:i};if(n==="manual")m.distribucion=c;else{const d=await p.listAll("treasury_settings");let b={primeroVencido:!0,primeroMora:!0};if(d.length&&d[0].auto_rules)try{b=JSON.parse(d[0].auto_rules)}catch{}m.reglas=b}await p.create("transactions",{tx_type_id:f[0].id,number:`${l}-${Date.now()}`,date:new Date().toISOString().slice(0,10),third_party_id:rt.id,description:`${e?"Recaudo":"Pago"} vía Módulo Tesorería`,status:"active",teso_mode:n,teso_params:JSON.stringify(m)}),Ge(`${l} generado correctamente.`,"success"),ic(),wo(document.getElementById("teso-content"),l)}catch(p){console.error(p);const f=p.data?JSON.stringify(p.data):"";Ge(`Error: ${p.message} ${f}`,"error"),r.disabled=!1,r.innerHTML=`<i class="fas fa-check mr-2"></i>Registrar ${l}`}}async function il(){Kt=[],rt=null,ia.length||(ia=await Ye().listAll("third_parties",{filter:"active=true",sort:"name"}));const t=`
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Tercero (Cliente)</label>
          <div id="modal-rc-wrap" class="relative">
            <input id="modal-rc-search" class="form-input" autocomplete="off" placeholder="Buscar por documento o nombre...">
            <input id="modal-rc-hidden" type="hidden" value="">
            <div id="modal-rc-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:50"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta Destino (Caja/Bancos)</label>
          <select id="teso-modal-cuenta" class="form-input">
            <option value="">— Seleccionar Cuenta —</option>
            ${(await Ye().listAll("accounts",{filter:'level>=3 && (code~"1105" || code~"1110" || code~"1120")',sort:"code"})).map(o=>`<option value="${o.id}">${o.code} - ${o.name}</option>`).join("")}
          </select>
        </div>
      </div>
      
      <div id="teso-modal-items-container" class="min-h-32 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center text-gray-400">
        Busca un tercero para visualizar su cartera abierta.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 border border-blue-100 rounded-lg">
        <div class="form-group mb-0">
          <label class="form-label">Monto Global a Recibir</label>
          <input id="teso-modal-monto" type="number" min="1" class="form-input text-lg font-bold text-green-700" placeholder="$">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Modo de Aplicación</label>
          <select id="teso-modal-modo" class="form-input" onchange="window._toggleModalManualMode()">
            <option value="auto">Automático (Según Reglas Config.)</option>
            <option value="manual">Manual (Distribuir en grilla)</option>
          </select>
        </div>
      </div>
    </div>
  `;xs("Nuevo Recibo de Caja",t,`
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-teso-tx" onclick="window._saveTransaccionTeso(true)">
      <i class="fas fa-check mr-2"></i>Registrar RC
    </button>
  `,!0),setTimeout(()=>{cc("modal-rc-wrap","modal-rc-search","modal-rc-hidden","modal-rc-results",()=>!0,o=>{rt=o,rc(o.id,!0)})},50)}async function cl(){Kt=[],rt=null,ia.length||(ia=await Ye().listAll("third_parties",{filter:"active=true",sort:"name"}));const t=`
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Tercero (Proveedor / Acreedor)</label>
          <div id="modal-eg-wrap" class="relative">
            <input id="modal-eg-search" class="form-input" autocomplete="off" placeholder="Buscar por documento o nombre...">
            <input id="modal-eg-hidden" type="hidden" value="">
            <div id="modal-eg-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:50"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta Origen (Caja/Bancos)</label>
          <select id="teso-modal-cuenta" class="form-input">
            <option value="">— Seleccionar Cuenta —</option>
            ${(await Ye().listAll("accounts",{filter:'level>=3 && (code~"1105" || code~"1110" || code~"1120")',sort:"code"})).map(o=>`<option value="${o.id}">${o.code} - ${o.name}</option>`).join("")}
          </select>
        </div>
      </div>
      
      <div id="teso-modal-items-container" class="min-h-32 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center text-gray-400">
        Busca un proveedor para visualizar sus obligaciones pendientes.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-50 p-4 border border-red-100 rounded-lg">
        <div class="form-group mb-0">
          <label class="form-label">Monto Global a Pagar</label>
          <input id="teso-modal-monto" type="number" min="1" class="form-input text-lg font-bold text-red-700" placeholder="$">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Modo de Aplicación</label>
          <select id="teso-modal-modo" class="form-input" onchange="window._toggleModalManualMode()">
            <option value="auto">Automático (Según Reglas Config.)</option>
            <option value="manual">Manual (Distribuir en grilla)</option>
          </select>
        </div>
      </div>
    </div>
  `;xs("Nuevo Comprobante de Egreso",t,`
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-danger" id="btn-save-teso-tx" onclick="window._saveTransaccionTeso(false)">
      <i class="fas fa-check mr-2"></i>Registrar Egreso
    </button>
  `,!0),setTimeout(()=>{cc("modal-eg-wrap","modal-eg-search","modal-eg-hidden","modal-eg-results",o=>o.type==="PROVEEDOR"||o.type==="ACREEDOR",o=>{rt=o,rc(o.id,!1)})},50)}async function rl(){const e=document.getElementById("teso-content");if(e)try{const t=Ye(),[a,o]=await Promise.all([t.listAll("tx_lines",{filter:"debit > credit"}),t.listAll("tx_lines",{filter:"credit > debit"})]),s=a.reduce((i,c)=>i+(c.debit-c.credit),0),n=o.reduce((i,c)=>i+(c.credit-c.debit),0);e.innerHTML=`
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-sm">
          <div class="text-sm font-semibold text-green-800 mb-1 flex items-center"><i class="fas fa-hand-holding-dollar mr-2"></i> Total Cuentas por Cobrar</div>
          <div class="text-4xl font-bold text-green-900 my-2">${Sa(s)}</div>
          <div class="text-sm text-green-700">${a.length} partidas abiertas a favor</div>
        </div>
        <div class="p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-sm">
          <div class="text-sm font-semibold text-red-800 mb-1 flex items-center"><i class="fas fa-file-invoice-dollar mr-2"></i> Total Cuentas por Pagar</div>
          <div class="text-4xl font-bold text-red-900 my-2">${Sa(n)}</div>
          <div class="text-sm text-red-700">${o.length} obligaciones pendientes</div>
        </div>
      </div>
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900 flex items-start gap-4">
        <i class="fas fa-robot mt-1 text-xl text-blue-600"></i>
        <div>
          <p class="font-bold text-base mb-1">Tesorería Inteligente</p>
          <p class="mb-2">El motor backend aplica automáticamente los pagos cruzando de manera precisa la cuenta de origen contra la cuenta de cartera específica (Capital, Intereses, etc.), asegurando un cuadre contable perfecto.</p>
          <p class="text-xs text-blue-700 font-semibold cursor-pointer hover:underline" onclick="openTesoreriaConfigModal()"><i class="fas fa-cog mr-1"></i> Configurar Reglas de Aplicación Automática</p>
        </div>
      </div>`}catch(t){e.innerHTML=`<div class="text-red-500 p-4">Error cargando dashboard: ${t.message}</div>`}}async function ll(){try{const e=Ye(),t=await e.list("treasury_settings",{perPage:1}),a=await e.listAll("accounts",{filter:"level>=3",sort:"code"});let o={primeroVencido:!0,primeroMora:!0,interesPrioridad:!0,cuentasInteres:[]},s="";if(t.items.length>0&&(s=t.items[0].id,t.items[0].auto_rules))try{o={...o,...JSON.parse(t.items[0].auto_rules)}}catch{}const n=a.map(r=>`<option value="${r.code}">${r.code} - ${r.name}</option>`).join(""),i=`
      <div class="space-y-6">
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h4 class="font-bold text-gray-800 mb-3"><i class="fas fa-sort-amount-down mr-2 text-blue-600"></i>Prioridad de Aplicación Automática</h4>
          <p class="text-xs text-gray-500 mb-4">Cuando se registre un pago o recaudo en modo "Automático", el sistema ordenará las partidas abiertas del tercero siguiendo estas reglas:</p>
          
          <div class="space-y-3">
            <label class="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
              <input type="checkbox" id="teso-cfg-fifo" class="mt-1 w-4 h-4 text-blue-600" ${o.primeroVencido?"checked":""}>
              <div>
                <span class="block font-semibold text-sm text-gray-800">Método FIFO (Facturas más antiguas primero)</span>
                <span class="block text-xs text-gray-500 mt-1">Aplica los abonos comenzando por los saldos cuya fecha de causación sea más antigua.</span>
              </div>
            </label>
            
            <label class="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
              <input type="checkbox" id="teso-cfg-mora" class="mt-1 w-4 h-4 text-blue-600" ${o.primeroMora?"checked":""}>
              <div>
                <span class="block font-semibold text-sm text-gray-800">Priorizar facturas vencidas (En mora)</span>
                <span class="block text-xs text-gray-500 mt-1">Si está activo, se pagarán primero las facturas que ya pasaron su fecha de vencimiento.</span>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200 bg-blue-50/50 cursor-pointer">
              <input type="checkbox" id="teso-cfg-interes" class="mt-1 w-4 h-4 text-blue-600" ${o.interesPrioridad?"checked":""}>
              <div class="w-full">
                <span class="block font-semibold text-sm text-blue-900">Regla Especial: Interés a Capital (Copropiedades)</span>
                <span class="block text-xs text-blue-700 mt-1 mb-2">Aplica el abono primero a las líneas de interés antes que a capital, identificándolas por código contable.</span>
                
                <div class="form-group mt-2 mb-0">
                  <label class="text-xs font-semibold text-gray-600">Códigos contables de cuentas de Intereses (separados por coma)</label>
                  <input id="teso-cfg-cuentas-interes" type="text" class="form-input text-sm" placeholder="Ej: 1345, 134510" value="${(o.cuentasInteres||[]).join(", ")}">
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    `;xs("Configuración de Tesorería Automática",i,`
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-cfg">
        <i class="fas fa-save mr-2"></i>Guardar Reglas
      </button>
    `,!1),document.getElementById("btn-save-cfg").onclick=async()=>{const r=document.getElementById("btn-save-cfg");r.disabled=!0,r.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';const l=document.getElementById("teso-cfg-fifo").checked,p=document.getElementById("teso-cfg-mora").checked,f=document.getElementById("teso-cfg-interes").checked,d=document.getElementById("teso-cfg-cuentas-interes").value.split(",").map(u=>u.trim()).filter(u=>u.length>0),b={auto_rules:JSON.stringify({primeroVencido:l,primeroMora:p,interesPrioridad:f,cuentasInteres:d})};try{s?await e.update("treasury_settings",s,b):await e.create("treasury_settings",b),Ge("Reglas guardadas correctamente","success"),ic()}catch(u){Ge(`Error: ${u.message}`,"error"),r.disabled=!1,r.innerHTML='<i class="fas fa-save mr-2"></i>Guardar Reglas'}}}catch(e){Ge(`Error al abrir configuración: ${e.message}`,"error")}}function lc(e){const t=e||document.getElementById("page-content");t&&(t.innerHTML=`
    <div class="page-header flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Tesorería</h2>
        <p class="text-gray-500 text-sm mt-1">Gestión de recaudos, pagos a proveedores y conciliación.</p>
      </div>
      <button class="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm" onclick="openTesoreriaConfigModal()">
        <i class="fas fa-cog mr-2 text-gray-500"></i>Configuración
      </button>
    </div>

    <div class="flex gap-1 mb-6 border-b border-gray-200">
      <button class="tab-btn teso-tab px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-target="dashboard">Resumen</button>
      <button class="tab-btn teso-tab px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-target="recaudos">Recaudos (RC)</button>
      <button class="tab-btn teso-tab px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-target="pagos">Pagos (CE)</button>
    </div>

    <div id="teso-content" class="min-h-96"></div>
  `,document.querySelectorAll(".teso-tab").forEach(a=>{a.addEventListener("click",o=>{const s=o.target.dataset.target;$s(s)})}),$s("dashboard"))}function $s(e){document.querySelectorAll(".teso-tab").forEach(a=>{a.dataset.target===e?(a.classList.add("text-blue-600","border-blue-600"),a.classList.remove("text-gray-500","border-transparent")):(a.classList.remove("text-blue-600","border-blue-600"),a.classList.add("text-gray-500","border-transparent"))});const t=document.getElementById("teso-content");e==="dashboard"&&rl(),e==="recaudos"&&wo(t,"RC"),e==="pagos"&&wo(t,"CE")}window.registerModule&&window.registerModule("tesoreria",lc);window.showTesoreriaScreen=lc;window.openRecaudoModal=il;window.openPagoModal=cl;window.openTesoreriaConfigModal=ll;window._toggleModalManualMode=sl;window._saveTransaccionTeso=nl;document.addEventListener("DOMContentLoaded",async()=>{var s,n,i,c,r,l,p,f,m,d,b;"serviceWorker"in navigator&&navigator.serviceWorker.register("/sw.js").catch(u=>console.warn("[SW] No se pudo registrar:",u)),(s=$("#modal-close-btn"))==null||s.addEventListener("click",closeModal);let e=!1;(n=$("#modal-overlay"))==null||n.addEventListener("pointerdown",u=>{e=u.target===$("#modal-overlay")}),(i=$("#modal-box"))==null||i.addEventListener("pointerdown",()=>{e=!1}),(c=$("#modal-overlay"))==null||c.addEventListener("click",u=>{u.target===$("#modal-overlay")&&e&&closeModal(),e=!1}),(r=$("#btn-login"))==null||r.addEventListener("click",doLogin),(l=$("#btn-toggle-pass"))==null||l.addEventListener("click",togglePassVisibility),(p=$("#login-pass"))==null||p.addEventListener("keydown",u=>{u.key==="Enter"&&doLogin()}),(f=$("#login-email"))==null||f.addEventListener("keydown",u=>{var y;u.key==="Enter"&&((y=$("#login-pass"))==null||y.focus())}),(m=$("#btn-logout"))==null||m.addEventListener("click",doLogout),$$("#nav-menu .nav-item").forEach(u=>u.addEventListener("click",()=>navigate(u.dataset.page)));const t=$("#sidebar"),a=$("#screen-app");function o(u,y=!0){!t||!a||(y||(t.style.transition="none",requestAnimationFrame(()=>{t.style.transition=""})),t.classList.toggle("collapsed",u),a.classList.toggle("sidebar-collapsed",u),localStorage.setItem("sidebar-collapsed",u?"1":"0"))}o(localStorage.getItem("sidebar-collapsed")==="1",!1),(d=$("#btn-menu-toggle"))==null||d.addEventListener("click",()=>{window.innerWidth<=768?t==null||t.classList.toggle("open"):o(!(t!=null&&t.classList.contains("collapsed")))}),(b=$("#sidebar-hamburger"))==null||b.addEventListener("click",()=>o(!1)),function(){const u=document.createElement("div");u.style.cssText="position:fixed;z-index:400;padding:5px 13px;border-radius:8px;font-size:12px;font-weight:600;font-family:Plus Jakarta Sans,sans-serif;color:#fff;background:#111E43;border:1px solid rgba(100,225,255,.25);box-shadow:0 4px 20px rgba(5,8,20,.5);pointer-events:none;opacity:0;transition:opacity .15s;white-space:nowrap;",document.body.appendChild(u);const y=$("#nav-menu");y==null||y.addEventListener("mouseover",v=>{const g=v.target.closest(".nav-item");if(!g||!(t!=null&&t.classList.contains("collapsed"))||!g.dataset.label)return;const h=g.getBoundingClientRect();u.textContent=g.dataset.label,u.style.left=h.right+10+"px",u.style.top=h.top+h.height/2+"px",u.style.transform="translateY(-50%)",u.style.opacity="1"}),y==null||y.addEventListener("mouseout",v=>{var g,h;(h=(g=v.relatedTarget)==null?void 0:g.closest)!=null&&h.call(g,".nav-item")||(u.style.opacity="0")}),y==null||y.addEventListener("mouseleave",()=>{u.style.opacity="0"})}(),await dc()});async function dc(){const e=$("#loading-msg"),t=s=>{e&&(e.textContent=s)};if(t("Verificando servidor..."),!await pb.ping()){t("No se puede conectar al servidor. ¿Está ejecutando start.bat?");const s=$("#screen-loading");s&&(s.innerHTML=`
        <div class="flex flex-col items-center gap-5 text-center px-8">
          <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background:rgba(239,68,68,.15)">
            <i class="fas fa-server text-2xl" style="color:#EF4444"></i>
          </div>
          <div>
            <h2 class="text-white text-xl font-bold mb-2">Servidor no disponible</h2>
            <p style="color:rgba(255,255,255,.6);font-size:14px;line-height:1.7">
              No se pudo conectar con el servidor GRAVY.<br>
              Asegúrate de haber ejecutado <strong style="color:#64E1FF">start.bat</strong> antes de abrir esta página.
            </p>
          </div>
          <button onclick="window.location.reload()" class="btn btn-primary mt-2">
            <i class="fas fa-rotate-right"></i> Reintentar
          </button>
        </div>`);return}if(t("Verificando sesión..."),pb.currentUser&&pb.authToken)try{await pb.authRefresh(),Eo(),await showApp(),startConnCheck();return}catch{pb.logout()}Eo(),showLogin(),startConnCheck()}function Eo(){const e=$("#screen-loading");e&&(e.classList.add("fade-out"),setTimeout(()=>{e.style.display="none"},500))}window.initApp=dc;window.hideSplash=Eo;
