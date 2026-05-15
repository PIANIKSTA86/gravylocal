(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function a(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(s){if(s.ep)return;s.ep=!0;const n=a(s);fetch(s.href,n)}})();const xs=[{code:"CO",name:"COLOMBIA"},{code:"AF",name:"AFGANISTAN"},{code:"AX",name:"ALAND"},{code:"AL",name:"ALBANIA"},{code:"DE",name:"ALEMANIA"},{code:"AD",name:"ANDORRA"},{code:"AO",name:"ANGOLA"},{code:"AI",name:"ANGUILA"},{code:"AQ",name:"ANTARTIDA"},{code:"AG",name:"ANTIGUA Y BARBUDA"},{code:"SA",name:"ARABIA SAUDITA"},{code:"DZ",name:"ARGELIA"},{code:"AR",name:"ARGENTINA"},{code:"AM",name:"ARMENIA"},{code:"AW",name:"ARUBA"},{code:"AU",name:"AUSTRALIA"},{code:"AT",name:"AUSTRIA"},{code:"AZ",name:"AZERBAIYAN"},{code:"BS",name:"BAHAMAS"},{code:"BD",name:"BANGLADES"},{code:"BB",name:"BARBADOS"},{code:"BH",name:"BAREIN"},{code:"BE",name:"BELGICA"},{code:"BZ",name:"BELICE"},{code:"BJ",name:"BENIN"},{code:"BM",name:"BERMUDAS"},{code:"BY",name:"BIELORRUSIA"},{code:"BO",name:"BOLIVIA"},{code:"BQ",name:"BONAIRE, SAN EUSTAQUIO Y SABA"},{code:"BA",name:"BOSNIA Y HERZEGOVINA"},{code:"BW",name:"BOTSUANA"},{code:"BR",name:"BRASIL"},{code:"BN",name:"BRUNEI"},{code:"BG",name:"BULGARIA"},{code:"BF",name:"BURKINA FASO"},{code:"BI",name:"BURUNDI"},{code:"BT",name:"BUTAN"},{code:"CV",name:"CABO VERDE"},{code:"KH",name:"CAMBOYA"},{code:"CM",name:"CAMERUN"},{code:"CA",name:"CANADA"},{code:"QA",name:"CATAR"},{code:"TD",name:"CHAD"},{code:"CL",name:"CHILE"},{code:"CN",name:"CHINA"},{code:"CY",name:"CHIPRE"},{code:"KM",name:"COMORAS"},{code:"KP",name:"COREA DEL NORTE"},{code:"KR",name:"COREA DEL SUR"},{code:"CI",name:"COSTA DE MARFIL"},{code:"CR",name:"COSTA RICA"},{code:"HR",name:"CROACIA"},{code:"CU",name:"CUBA"},{code:"CW",name:"CURAZAO"},{code:"DK",name:"DINAMARCA"},{code:"DM",name:"DOMINICA"},{code:"EC",name:"ECUADOR"},{code:"EG",name:"EGIPTO"},{code:"SV",name:"EL SALVADOR"},{code:"AE",name:"EMIRATOS ARABES UNIDOS"},{code:"ER",name:"ERITREA"},{code:"SK",name:"ESLOVAQUIA"},{code:"SI",name:"ESLOVENIA"},{code:"ES",name:"ESPAÑA"},{code:"US",name:"ESTADOS UNIDOS"},{code:"EE",name:"ESTONIA"},{code:"ET",name:"ETIOPIA"},{code:"PH",name:"FILIPINAS"},{code:"FI",name:"FINLANDIA"},{code:"FJ",name:"FIYI"},{code:"FR",name:"FRANCIA"},{code:"GA",name:"GABON"},{code:"GM",name:"GAMBIA"},{code:"GE",name:"GEORGIA"},{code:"GH",name:"GHANA"},{code:"GI",name:"GIBRALTAR"},{code:"GD",name:"GRANADA"},{code:"GR",name:"GRECIA"},{code:"GL",name:"GROENLANDIA"},{code:"GP",name:"GUADALUPE"},{code:"GU",name:"GUAM"},{code:"GT",name:"GUATEMALA"},{code:"GF",name:"GUAYANA FRANCESA"},{code:"GG",name:"GUERNSEY"},{code:"GN",name:"GUINEA"},{code:"GQ",name:"GUINEA ECUATORIAL"},{code:"GW",name:"GUINEA-BISAU"},{code:"GY",name:"GUYANA"},{code:"HT",name:"HAITI"},{code:"HN",name:"HONDURAS"},{code:"HK",name:"HONG KONG"},{code:"HU",name:"HUNGRIA"},{code:"IN",name:"INDIA"},{code:"ID",name:"INDONESIA"},{code:"IQ",name:"IRAK"},{code:"IR",name:"IRAN"},{code:"IE",name:"IRLANDA"},{code:"BV",name:"ISLA BOUVET"},{code:"IM",name:"ISLA DE MAN"},{code:"CX",name:"ISLA DE NAVIDAD"},{code:"IS",name:"ISLANDIA"},{code:"KY",name:"ISLAS CAIMAN"},{code:"CC",name:"ISLAS COCOS"},{code:"CK",name:"ISLAS COOK"},{code:"FO",name:"ISLAS FEROE"},{code:"GS",name:"ISLAS GEORGIAS DEL SUR Y SANDWICH DEL SUR"},{code:"HM",name:"ISLAS HEARD Y MCDONALD"},{code:"FK",name:"ISLAS MALVINAS"},{code:"MP",name:"ISLAS MARIANAS DEL NORTE"},{code:"MH",name:"ISLAS MARSHALL"},{code:"PN",name:"ISLAS PITCAIRN"},{code:"SB",name:"ISLAS SALOMON"},{code:"TC",name:"ISLAS TURCAS Y CAICOS"},{code:"UM",name:"ISLAS ULTRAMARINAS DE ESTADOS UNIDOS"},{code:"VG",name:"ISLAS VIRGENES BRITANICAS"},{code:"VI",name:"ISLAS VIRGENES DE LOS ESTADOS UNIDOS"},{code:"IL",name:"ISRAEL"},{code:"IT",name:"ITALIA"},{code:"JM",name:"JAMAICA"},{code:"JP",name:"JAPON"},{code:"JE",name:"JERSEY"},{code:"JO",name:"JORDANIA"},{code:"KZ",name:"KAZAJISTAN"},{code:"KE",name:"KENIA"},{code:"KG",name:"KIRGUISTAN"},{code:"KI",name:"KIRIBATI"},{code:"KW",name:"KUWAIT"},{code:"LA",name:"LAOS"},{code:"LS",name:"LESOTO"},{code:"LV",name:"LETONIA"},{code:"LB",name:"LIBANO"},{code:"LR",name:"LIBERIA"},{code:"LY",name:"LIBIA"},{code:"LI",name:"LIECHTENSTEIN"},{code:"LT",name:"LITUANIA"},{code:"LU",name:"LUXEMBURGO"},{code:"MO",name:"MACAO"},{code:"MK",name:"MACEDONIA"},{code:"MG",name:"MADAGASCAR"},{code:"MY",name:"MALASIA"},{code:"MW",name:"MALAUI"},{code:"MV",name:"MALDIVAS"},{code:"ML",name:"MALI"},{code:"MT",name:"MALTA"},{code:"MA",name:"MARRUECOS"},{code:"MQ",name:"MARTINICA"},{code:"MU",name:"MAURICIO"},{code:"MR",name:"MAURITANIA"},{code:"YT",name:"MAYOTTE"},{code:"MX",name:"MEXICO"},{code:"FM",name:"MICRONESIA"},{code:"MD",name:"MOLDAVIA"},{code:"MC",name:"MONACO"},{code:"MN",name:"MONGOLIA"},{code:"ME",name:"MONTENEGRO"},{code:"MS",name:"MONTSERRAT"},{code:"MZ",name:"MOZAMBIQUE"},{code:"MM",name:"MYANMAR"},{code:"NA",name:"NAMIBIA"},{code:"NR",name:"NAURU"},{code:"NP",name:"NEPAL"},{code:"NI",name:"NICARAGUA"},{code:"NE",name:"NIGER"},{code:"NG",name:"NIGERIA"},{code:"UN",name:"NIUE"},{code:"NF",name:"NORFOLK"},{code:"NO",name:"NORUEGA"},{code:"NC",name:"NUEVA CALEDONIA"},{code:"NZ",name:"NUEVA ZELANDA"},{code:"OM",name:"OMAN"},{code:"NL",name:"PAISES BAJOS"},{code:"PK",name:"PAKISTAN"},{code:"PW",name:"PALAOS"},{code:"PS",name:"PALESTINA"},{code:"PA",name:"PANAMA"},{code:"PG",name:"PAPUA NUEVA GUINEA"},{code:"PY",name:"PARAGUAY"},{code:"PE",name:"PERU"},{code:"PF",name:"POLINESIA FRANCESA"},{code:"PL",name:"POLONIA"},{code:"PT",name:"PORTUGAL"},{code:"PR",name:"PUERTO RICO"},{code:"GB",name:"REINO UNIDO"},{code:"EH",name:"REPUBLICA ARABE SAHARAUI DEMOCRATICA"},{code:"CF",name:"REPUBLICA CENTROAFRICANA"},{code:"CZ",name:"REPUBLICA CHECA"},{code:"CG",name:"REPUBLICA DEL CONGO"},{code:"CD",name:"REPUBLICA DEMOCRATICA DEL CONGO"},{code:"DO",name:"REPUBLICA DOMINICANA"},{code:"RE",name:"REUNION"},{code:"RW",name:"RUANDA"},{code:"RO",name:"RUMANIA"},{code:"RU",name:"RUSIA"},{code:"WS",name:"SAMOA"},{code:"AS",name:"SAMOA AMERICANA"},{code:"BL",name:"SAN BARTOLOME"},{code:"KN",name:"SAN CRISTOBAL Y NIEVES"},{code:"SM",name:"SAN MARINO"},{code:"MF",name:"SAN MARTIN"},{code:"PM",name:"SAN PEDRO Y MIQUELON"},{code:"VC",name:"SAN VICENTE Y LAS GRANADINAS"},{code:"SH",name:"SANTA ELENA, ASCENSION Y TRISTAN DE ACUÑA"},{code:"LC",name:"SANTA LUCIA"},{code:"ST",name:"SANTO TOME Y PRINCIPE"},{code:"SN",name:"SENEGAL"},{code:"RS",name:"SERBIA"},{code:"SC",name:"SEYCHELLES"},{code:"SL",name:"SIERRA LEONA"},{code:"SG",name:"SINGAPUR"},{code:"SX",name:"SINT MAARTEN"},{code:"SY",name:"SIRIA"},{code:"SO",name:"SOMALIA"},{code:"LK",name:"SRI LANKA"},{code:"SZ",name:"SUAZILANDIA"},{code:"ZA",name:"SUDAFRICA"},{code:"SD",name:"SUDAN"},{code:"SS",name:"SUDAN DEL SUR"},{code:"SE",name:"SUECIA"},{code:"CH",name:"SUIZA"},{code:"SR",name:"SURINAM"},{code:"SJ",name:"SVALBARD Y JAN MAYEN"},{code:"TH",name:"TAILANDIA"},{code:"TW",name:"TAIWAN (REPUBLICA DE CHINA)"},{code:"TZ",name:"TANZANIA"},{code:"TJ",name:"TAYIKISTAN"},{code:"IO",name:"TERRITORIO BRITANICO DEL OCEANO INDICO"},{code:"TF",name:"TIERRAS AUSTRALES Y ANTARTICAS FRANCESAS"},{code:"TL",name:"TIMOR ORIENTAL"},{code:"TG",name:"TOGO"},{code:"TK",name:"TOKELAU"},{code:"TO",name:"TONGA"},{code:"TT",name:"TRINIDAD Y TOBAGO"},{code:"TN",name:"TUNEZ"},{code:"TM",name:"TURKMENISTAN"},{code:"TR",name:"TURQUIA"},{code:"TV",name:"TUVALU"},{code:"UA",name:"UCRANIA"},{code:"UG",name:"UGANDA"},{code:"UY",name:"URUGUAY"},{code:"UZ",name:"UZBEKISTAN"},{code:"VU",name:"VANUATU"},{code:"VA",name:"VATICANO, CIUDAD DEL"},{code:"VE",name:"VENEZUELA"},{code:"VN",name:"VIETNAM"},{code:"WF",name:"WALLIS Y FUTUNA"},{code:"YE",name:"YEMEN"},{code:"DJ",name:"YIBUTI"},{code:"ZM",name:"ZAMBIA"},{code:"ZW",name:"ZIMBABUE"}],As=[{code:"05",name:"ANTIOQUIA"},{code:"08",name:"ATLANTICO"},{code:"11",name:"BOGOTA"},{code:"13",name:"BOLIVAR"},{code:"15",name:"BOYACA"},{code:"17",name:"CALDAS"},{code:"18",name:"CAQUETA"},{code:"19",name:"CAUCA"},{code:"20",name:"CESAR"},{code:"23",name:"CORDOBA"},{code:"25",name:"CUNDINAMARCA"},{code:"27",name:"CHOCO"},{code:"41",name:"HUILA"},{code:"44",name:"LA GUAJIRA"},{code:"47",name:"MAGDALENA"},{code:"50",name:"META"},{code:"52",name:"NARINO"},{code:"54",name:"NORTE DE SANTANDER"},{code:"63",name:"QUINDIO"},{code:"66",name:"RISARALDA"},{code:"68",name:"SANTANDER"},{code:"70",name:"SUCRE"},{code:"73",name:"TOLIMA"},{code:"76",name:"VALLE DEL CAUCA"},{code:"81",name:"ARAUCA"},{code:"85",name:"CASANARE"},{code:"86",name:"PUTUMAYO"},{code:"88",name:"SAN ANDRES"},{code:"91",name:"AMAZONAS"},{code:"94",name:"GUAINIA"},{code:"95",name:"GUAVIARE"},{code:"97",name:"VAUPES"},{code:"99",name:"VICHADA"}],Eo=[{dept_code:"91",code:"91001",name:"LETICIA",postal:"910001"},{dept_code:"91",code:"91263",name:"EL ENCANTO",postal:"913010"},{dept_code:"91",code:"91405",name:"LA CHORRERA",postal:"914057"},{dept_code:"91",code:"91407",name:"LA PEDRERA",postal:"917010"},{dept_code:"91",code:"91430",name:"LA VICTORIA",postal:"916017"},{dept_code:"91",code:"91460",name:"MIRITI _ PARANA",postal:"916057"},{dept_code:"91",code:"91530",name:"PUERTO ALEGRIA",postal:"913050"},{dept_code:"91",code:"91536",name:"PUERTO ARICA",postal:"912010"},{dept_code:"91",code:"91540",name:"PUERTO NARINO",postal:"911017"},{dept_code:"91",code:"91669",name:"PUERTO SANTANDER",postal:"915010"},{dept_code:"91",code:"91798",name:"TARAPACA",postal:"911030"},{dept_code:"05",code:"05001",name:"MEDELLIN",postal:"050013"},{dept_code:"05",code:"05002",name:"ABEJORRAL",postal:"055030"},{dept_code:"05",code:"05004",name:"ABRIAQUI",postal:"057460"},{dept_code:"05",code:"05021",name:"ALEJANDRIA",postal:"053820"},{dept_code:"05",code:"05030",name:"AMAGA",postal:"055840"},{dept_code:"05",code:"05031",name:"AMALFI",postal:"052840"},{dept_code:"05",code:"05034",name:"ANDES",postal:"056068"},{dept_code:"05",code:"05036",name:"ANGELOPOLIS",postal:"055830"},{dept_code:"05",code:"05038",name:"ANGOSTURA",postal:"051810"},{dept_code:"05",code:"05040",name:"ANORI",postal:"052857"},{dept_code:"05",code:"05042",name:"SANTAFE DE ANTIOQUIA",postal:"057050"},{dept_code:"05",code:"05044",name:"ANZA",postal:"056850"},{dept_code:"05",code:"05045",name:"APARTADO",postal:"057841"},{dept_code:"05",code:"05051",name:"ARBOLETES",postal:"057820"},{dept_code:"05",code:"05055",name:"ARGELIA",postal:"054838"},{dept_code:"05",code:"05059",name:"ARMENIA",postal:"055860"},{dept_code:"05",code:"05079",name:"BARBOSA",postal:"051028"},{dept_code:"05",code:"05086",name:"BELMIRA",postal:"051420"},{dept_code:"05",code:"05088",name:"BELLO",postal:"051050"},{dept_code:"05",code:"05091",name:"BETANIA",postal:"056070"},{dept_code:"05",code:"05093",name:"BETULIA",postal:"056860"},{dept_code:"05",code:"05101",name:"CIUDAD BOLIVAR",postal:"056460"},{dept_code:"05",code:"05107",name:"BRICENO",postal:"052060"},{dept_code:"05",code:"05113",name:"BURITICA",postal:"057030"},{dept_code:"05",code:"05120",name:"CACERES",postal:"052450"},{dept_code:"05",code:"05125",name:"CAICEDO",postal:"056840"},{dept_code:"05",code:"05129",name:"CALDAS",postal:"055440"},{dept_code:"05",code:"05134",name:"CAMPAMENTO",postal:"052020"},{dept_code:"05",code:"05138",name:"CANASGORDAS",postal:"057067"},{dept_code:"05",code:"05142",name:"CARACOLI",postal:"053450"},{dept_code:"05",code:"05145",name:"CARAMANTA",postal:"056040"},{dept_code:"05",code:"05147",name:"CAREPA",postal:"057850"},{dept_code:"05",code:"05148",name:"EL CARMEN DE VIBORAL",postal:"054037"},{dept_code:"05",code:"05150",name:"CAROLINA",postal:"051840"},{dept_code:"05",code:"05154",name:"CAUCASIA",postal:"052410"},{dept_code:"05",code:"05172",name:"CHIGORODO",postal:"057410"},{dept_code:"05",code:"05190",name:"CISNEROS",postal:"053050"},{dept_code:"05",code:"05197",name:"COCORNA",postal:"054440"},{dept_code:"05",code:"05206",name:"CONCEPCION",postal:"053810"},{dept_code:"05",code:"05209",name:"CONCORDIA",postal:"056410"},{dept_code:"05",code:"05212",name:"COPACABANA",postal:"051047"},{dept_code:"05",code:"05234",name:"DABEIBA",postal:"057430"},{dept_code:"05",code:"05237",name:"DONMATIAS",postal:"051850"},{dept_code:"05",code:"05240",name:"EBEJICO",postal:"055810"},{dept_code:"05",code:"05250",name:"EL BAGRE",postal:"052437"},{dept_code:"05",code:"05264",name:"ENTRERRIOS",postal:"051430"},{dept_code:"05",code:"05266",name:"ENVIGADO",postal:"055428"},{dept_code:"05",code:"05282",name:"FREDONIA",postal:"055070"},{dept_code:"05",code:"05284",name:"FRONTINO",postal:"057450"},{dept_code:"05",code:"05306",name:"GIRALDO",postal:"057040"},{dept_code:"05",code:"05308",name:"GIRARDOTA",postal:"051038"},{dept_code:"05",code:"05310",name:"GOMEZ PLATA",postal:"051830"},{dept_code:"05",code:"05313",name:"GRANADA",postal:"054410"},{dept_code:"05",code:"05315",name:"GUADALUPE",postal:"051820"},{dept_code:"05",code:"05318",name:"GUARNE",postal:"054050"},{dept_code:"05",code:"05321",name:"GUATAPE",postal:"053840"},{dept_code:"05",code:"05347",name:"HELICONIA",postal:"055820"},{dept_code:"05",code:"05353",name:"HISPANIA",postal:"056450"},{dept_code:"05",code:"05360",name:"ITAGUI",postal:"055411"},{dept_code:"05",code:"05361",name:"ITUANGO",postal:"052070"},{dept_code:"05",code:"05364",name:"JARDIN",postal:"056050"},{dept_code:"05",code:"05368",name:"JERICO",postal:"056010"},{dept_code:"05",code:"05376",name:"LA CEJA",postal:"055017"},{dept_code:"05",code:"05380",name:"LA ESTRELLA",postal:"055467"},{dept_code:"05",code:"05390",name:"LA PINTADA",postal:"055060"},{dept_code:"05",code:"05400",name:"LA UNION",postal:"055020"},{dept_code:"05",code:"05411",name:"LIBORINA",postal:"051460"},{dept_code:"05",code:"05425",name:"MACEO",postal:"053460"},{dept_code:"05",code:"05440",name:"MARINILLA",postal:"054020"},{dept_code:"05",code:"05467",name:"MONTEBELLO",postal:"055040"},{dept_code:"05",code:"05475",name:"MURINDO",postal:"056810"},{dept_code:"05",code:"05480",name:"MUTATA",postal:"057427"},{dept_code:"05",code:"05483",name:"NARINO",postal:"054840"},{dept_code:"05",code:"05490",name:"NECOCLI",postal:"057870"},{dept_code:"05",code:"05495",name:"NECHI",postal:"052420"},{dept_code:"05",code:"05501",name:"OLAYA",postal:"051450"},{dept_code:"05",code:"05541",name:"PENOL",postal:"053850"},{dept_code:"05",code:"05543",name:"PEQUE",postal:"057010"},{dept_code:"05",code:"05576",name:"PUEBLORRICO",postal:"056440"},{dept_code:"05",code:"05579",name:"PUERTO BERRIO",postal:"053420"},{dept_code:"05",code:"05585",name:"PUERTO NARE",postal:"053430"},{dept_code:"05",code:"05591",name:"PUERTO TRIUNFO",postal:"053440"},{dept_code:"05",code:"05604",name:"REMEDIOS",postal:"052820"},{dept_code:"05",code:"05607",name:"RETIRO",postal:"055438"},{dept_code:"05",code:"05615",name:"RIONEGRO",postal:"054040"},{dept_code:"05",code:"05628",name:"SABANALARGA",postal:"057020"},{dept_code:"05",code:"05631",name:"SABANETA",postal:"055450"},{dept_code:"05",code:"05642",name:"SALGAR",postal:"056478"},{dept_code:"05",code:"05647",name:"SAN ANDRES DE CUERQUIA",postal:"052040"},{dept_code:"05",code:"05649",name:"SAN CARLOS",postal:"054420"},{dept_code:"05",code:"05652",name:"SAN FRANCISCO",postal:"054810"},{dept_code:"05",code:"05656",name:"SAN JERONIMO",postal:"051070"},{dept_code:"05",code:"05658",name:"SAN JOSE DE LA MONTANA",postal:"051410"},{dept_code:"05",code:"05659",name:"SAN JUAN DE URABA",postal:"057810"},{dept_code:"05",code:"05660",name:"SAN LUIS",postal:"054430"},{dept_code:"05",code:"05664",name:"SAN PEDRO DE LOS MILAGROS",postal:"051010"},{dept_code:"05",code:"05665",name:"SAN PEDRO DE URABA",postal:"057830"},{dept_code:"05",code:"05667",name:"SAN RAFAEL",postal:"053838"},{dept_code:"05",code:"05670",name:"SAN ROQUE",postal:"053030"},{dept_code:"05",code:"05674",name:"SAN VICENTE",postal:"054010"},{dept_code:"05",code:"05679",name:"SANTA BARBARA",postal:"055050"},{dept_code:"05",code:"05686",name:"SANTA ROSA DE OSOS",postal:"051860"},{dept_code:"05",code:"05690",name:"SANTO DOMINGO",postal:"053040"},{dept_code:"05",code:"05697",name:"EL SANTUARIO",postal:"054450"},{dept_code:"05",code:"05736",name:"SEGOVIA",postal:"052810"},{dept_code:"05",code:"05756",name:"SONSON",postal:"054820"},{dept_code:"05",code:"05761",name:"SOPETRAN",postal:"051440"},{dept_code:"05",code:"05789",name:"TAMESIS",postal:"056020"},{dept_code:"05",code:"05790",name:"TARAZA",postal:"052460"},{dept_code:"05",code:"05792",name:"TARSO",postal:"056430"},{dept_code:"05",code:"05809",name:"TITIRIBI",postal:"055858"},{dept_code:"05",code:"05819",name:"TOLEDO",postal:"052050"},{dept_code:"05",code:"05837",name:"TURBO",postal:"057860"},{dept_code:"05",code:"05842",name:"URAMITA",postal:"057440"},{dept_code:"05",code:"05847",name:"URRAO",postal:"056830"},{dept_code:"05",code:"05854",name:"VALDIVIA",postal:"052010"},{dept_code:"05",code:"05856",name:"VALPARAISO",postal:"056030"},{dept_code:"05",code:"05858",name:"VEGACHI",postal:"052830"},{dept_code:"05",code:"05861",name:"VENECIA",postal:"056420"},{dept_code:"05",code:"05873",name:"VIGIA DEL FUERTE",postal:"056820"},{dept_code:"05",code:"05885",name:"YALI",postal:"053010"},{dept_code:"05",code:"05887",name:"YARUMAL",postal:"052030"},{dept_code:"05",code:"05890",name:"YOLOMBO",postal:"053020"},{dept_code:"05",code:"05893",name:"YONDO",postal:"053410"},{dept_code:"05",code:"05895",name:"ZARAGOZA",postal:"052440"},{dept_code:"81",code:"81001",name:"ARAUCA",postal:"810001"},{dept_code:"81",code:"81065",name:"ARAUQUITA",postal:"816010"},{dept_code:"81",code:"81220",name:"CRAVO NORTE",postal:"812010"},{dept_code:"81",code:"81300",name:"FORTUL",postal:"814050"},{dept_code:"81",code:"81591",name:"PUERTO RONDON",postal:"813010"},{dept_code:"81",code:"81736",name:"SARAVENA",postal:"815010"},{dept_code:"81",code:"81794",name:"TAME",postal:"814018"},{dept_code:"08",code:"08001",name:"BARRANQUILLA",postal:"080010"},{dept_code:"08",code:"08078",name:"BARANOA",postal:"082027"},{dept_code:"08",code:"08137",name:"CAMPO DE LA CRUZ",postal:"084040"},{dept_code:"08",code:"08141",name:"CANDELARIA",postal:"084020"},{dept_code:"08",code:"08296",name:"GALAPA",postal:"082001"},{dept_code:"08",code:"08372",name:"JUAN DE ACOSTA",postal:"081048"},{dept_code:"08",code:"08421",name:"LURUACO",postal:"085060"},{dept_code:"08",code:"08433",name:"MALAMBO",postal:"083027"},{dept_code:"08",code:"08436",name:"MANATI",postal:"085020"},{dept_code:"08",code:"08520",name:"PALMAR DE VARELA",postal:"083087"},{dept_code:"08",code:"08549",name:"PIOJO",postal:"081060"},{dept_code:"08",code:"08558",name:"POLONUEVO",postal:"082040"},{dept_code:"08",code:"08560",name:"PONEDERA",postal:"084001"},{dept_code:"08",code:"08573",name:"PUERTO COLOMBIA",postal:"081008"},{dept_code:"08",code:"08606",name:"REPELON",postal:"085040"},{dept_code:"08",code:"08634",name:"SABANAGRANDE",postal:"083040"},{dept_code:"08",code:"08638",name:"SABANALARGA",postal:"085001"},{dept_code:"08",code:"08675",name:"SANTA LUCIA",postal:"084080"},{dept_code:"08",code:"08685",name:"SANTO TOMAS",postal:"083067"},{dept_code:"08",code:"08758",name:"SOLEDAD",postal:"083007"},{dept_code:"08",code:"08770",name:"SUAN",postal:"084060"},{dept_code:"08",code:"08832",name:"TUBARA",postal:"081027"},{dept_code:"08",code:"08849",name:"USIACURI",postal:"082067"},{dept_code:"11",code:"11001",name:"BOGOTA D.C.",postal:"111511"},{dept_code:"13",code:"13001",name:"CARTAGENA",postal:"130019"},{dept_code:"13",code:"13006",name:"ACHI",postal:"134020"},{dept_code:"13",code:"13030",name:"ALTOS DEL ROSARIO",postal:"133508"},{dept_code:"13",code:"13042",name:"ARENAL",postal:"134520"},{dept_code:"13",code:"13052",name:"ARJONA",postal:"131028"},{dept_code:"13",code:"13062",name:"ARROYOHONDO",postal:"131560"},{dept_code:"13",code:"13074",name:"BARRANCO DE LOBA",postal:"133517"},{dept_code:"13",code:"13140",name:"CALAMAR",postal:"131547"},{dept_code:"13",code:"13160",name:"CANTAGALLO",postal:"135060"},{dept_code:"13",code:"13188",name:"CICUCO",postal:"132550"},{dept_code:"13",code:"13212",name:"CORDOBA",postal:"132507"},{dept_code:"13",code:"13222",name:"CLEMENCIA",postal:"130510"},{dept_code:"13",code:"13244",name:"EL CARMEN DE BOLIVAR",postal:"132058"},{dept_code:"13",code:"13248",name:"EL GUAMO",postal:"132007"},{dept_code:"13",code:"13268",name:"EL PENON",postal:"133550"},{dept_code:"13",code:"13300",name:"HATILLO DE LOBA",postal:"133040"},{dept_code:"13",code:"13430",name:"MAGANGUE",postal:"132518"},{dept_code:"13",code:"13433",name:"MAHATES",postal:"131048"},{dept_code:"13",code:"13440",name:"MARGARITA",postal:"133020"},{dept_code:"13",code:"13442",name:"MARIA LA BAJA",postal:"131060"},{dept_code:"13",code:"13458",name:"MONTECRISTO",postal:"134070"},{dept_code:"13",code:"13468",name:"MOMPOS",postal:"132560"},{dept_code:"13",code:"13473",name:"MORALES",postal:"134540"},{dept_code:"13",code:"13490",name:"NOROSI",postal:"134510"},{dept_code:"13",code:"13549",name:"PINILLOS",postal:"134001"},{dept_code:"13",code:"13580",name:"REGIDOR",postal:"133560"},{dept_code:"13",code:"13600",name:"RIO VIEJO",postal:"134501"},{dept_code:"13",code:"13620",name:"SAN CRISTOBAL",postal:"131520"},{dept_code:"13",code:"13647",name:"SAN ESTANISLAO",postal:"130540"},{dept_code:"13",code:"13650",name:"SAN FERNANDO",postal:"133007"},{dept_code:"13",code:"13654",name:"SAN JACINTO",postal:"132030"},{dept_code:"13",code:"13655",name:"SAN JACINTO DEL CAUCA",postal:"134060"},{dept_code:"13",code:"13657",name:"SAN JUAN NEPOMUCENO",postal:"132010"},{dept_code:"13",code:"13667",name:"SAN MARTIN DE LOBA",postal:"133530"},{dept_code:"13",code:"13670",name:"SAN PABLO",postal:"135040"},{dept_code:"13",code:"13673",name:"SANTA CATALINA",postal:"130501"},{dept_code:"13",code:"13683",name:"SANTA ROSA",postal:"130527"},{dept_code:"13",code:"13688",name:"SANTA ROSA DEL SUR",postal:"135001"},{dept_code:"13",code:"13744",name:"SIMITI",postal:"135020"},{dept_code:"13",code:"13760",name:"SOPLAVIENTO",postal:"131501"},{dept_code:"13",code:"13780",name:"TALAIGUA NUEVO",postal:"132540"},{dept_code:"13",code:"13810",name:"TIQUISIO",postal:"134040"},{dept_code:"13",code:"13836",name:"TURBACO",postal:"131007"},{dept_code:"13",code:"13838",name:"TURBANA",postal:"131010"},{dept_code:"13",code:"13873",name:"VILLANUEVA",postal:"130530"},{dept_code:"13",code:"13894",name:"ZAMBRANO",postal:"132047"},{dept_code:"15",code:"15001",name:"TUNJA",postal:"150003"},{dept_code:"15",code:"15022",name:"ALMEIDA",postal:"153020"},{dept_code:"15",code:"15047",name:"AQUITANIA",postal:"152420"},{dept_code:"15",code:"15051",name:"ARCABUCO",postal:"154201"},{dept_code:"15",code:"15087",name:"BELEN",postal:"150640"},{dept_code:"15",code:"15090",name:"BERBEO",postal:"152617"},{dept_code:"15",code:"15092",name:"BETEITIVA",postal:"150610"},{dept_code:"15",code:"15097",name:"BOAVITA",postal:"151060"},{dept_code:"15",code:"15104",name:"BOYACA",postal:"153610"},{dept_code:"15",code:"15106",name:"BRICENO",postal:"154670"},{dept_code:"15",code:"15109",name:"BUENAVISTA",postal:"154840"},{dept_code:"15",code:"15114",name:"BUSBANZA",postal:"152087"},{dept_code:"15",code:"15131",name:"CALDAS",postal:"154660"},{dept_code:"15",code:"15135",name:"CAMPOHERMOSO",postal:"152640"},{dept_code:"15",code:"15162",name:"CERINZA",postal:"150627"},{dept_code:"15",code:"15172",name:"CHINAVITA",postal:"153287"},{dept_code:"15",code:"15176",name:"CHIQUINQUIRA",postal:"154640"},{dept_code:"15",code:"15180",name:"CHISCAS",postal:"151401"},{dept_code:"15",code:"15183",name:"CHITA",postal:"151601"},{dept_code:"15",code:"15185",name:"CHITARAQUE",postal:"154420"},{dept_code:"15",code:"15187",name:"CHIVATA",postal:"150240"},{dept_code:"15",code:"15189",name:"CIENEGA",postal:"153440"},{dept_code:"15",code:"15204",name:"COMBITA",postal:"150201"},{dept_code:"15",code:"15212",name:"COPER",postal:"154860"},{dept_code:"15",code:"15215",name:"CORRALES",postal:"152060"},{dept_code:"15",code:"15218",name:"COVARACHIA",postal:"151040"},{dept_code:"15",code:"15223",name:"CUBARA",postal:"151420"},{dept_code:"15",code:"15224",name:"CUCAITA",postal:"154060"},{dept_code:"15",code:"15226",name:"CUITIVA",postal:"152230"},{dept_code:"15",code:"15232",name:"CHIQUIZA",postal:"154020"},{dept_code:"15",code:"15236",name:"CHIVOR",postal:"153001"},{dept_code:"15",code:"15238",name:"DUITAMA",postal:"150467"},{dept_code:"15",code:"15244",name:"EL COCUY",postal:"151280"},{dept_code:"15",code:"15248",name:"EL ESPINO",postal:"151240"},{dept_code:"15",code:"15272",name:"FIRAVITOBA",postal:"152250"},{dept_code:"15",code:"15276",name:"FLORESTA",postal:"150601"},{dept_code:"15",code:"15293",name:"GACHANTIVA",postal:"154220"},{dept_code:"15",code:"15296",name:"GAMEZA",postal:"152020"},{dept_code:"15",code:"15299",name:"GARAGOA",postal:"152860"},{dept_code:"15",code:"15317",name:"GUACAMAYAS",postal:"151220"},{dept_code:"15",code:"15322",name:"GUATEQUE",postal:"153050"},{dept_code:"15",code:"15325",name:"GUAYATA",postal:"153040"},{dept_code:"15",code:"15332",name:"GÜICAN",postal:"151440"},{dept_code:"15",code:"15362",name:"IZA",postal:"152240"},{dept_code:"15",code:"15367",name:"JENESANO",postal:"153601"},{dept_code:"15",code:"15368",name:"JERICO",postal:"150840"},{dept_code:"15",code:"15377",name:"LABRANZAGRANDE",postal:"151840"},{dept_code:"15",code:"15380",name:"LA CAPILLA",postal:"153220"},{dept_code:"15",code:"15401",name:"LA VICTORIA",postal:"155001"},{dept_code:"15",code:"15403",name:"LA UVITA",postal:"150860"},{dept_code:"15",code:"15407",name:"VILLA DE LEYVA",postal:"154001"},{dept_code:"15",code:"15425",name:"MACANAL",postal:"152840"},{dept_code:"15",code:"15442",name:"MARIPI",postal:"154820"},{dept_code:"15",code:"15455",name:"MIRAFLORES",postal:"152667"},{dept_code:"15",code:"15464",name:"MONGUA",postal:"152001"},{dept_code:"15",code:"15466",name:"MONGUI",postal:"152201"},{dept_code:"15",code:"15469",name:"MONIQUIRA",postal:"154260"},{dept_code:"15",code:"15476",name:"MOTAVITA",postal:"154080"},{dept_code:"15",code:"15480",name:"MUZO",postal:"154880"},{dept_code:"15",code:"15491",name:"NOBSA",postal:"152280"},{dept_code:"15",code:"15494",name:"NUEVO COLON",postal:"153620"},{dept_code:"15",code:"15500",name:"OICATA",postal:"150220"},{dept_code:"15",code:"15507",name:"OTANCHE",postal:"155060"},{dept_code:"15",code:"15511",name:"PACHAVITA",postal:"153210"},{dept_code:"15",code:"15514",name:"PAEZ",postal:"152620"},{dept_code:"15",code:"15516",name:"PAIPA",postal:"150447"},{dept_code:"15",code:"15518",name:"PAJARITO",postal:"152407"},{dept_code:"15",code:"15522",name:"PANQUEBA",postal:"151260"},{dept_code:"15",code:"15531",name:"PAUNA",postal:"154801"},{dept_code:"15",code:"15533",name:"PAYA",postal:"151827"},{dept_code:"15",code:"15537",name:"PAZ DE RIO",postal:"150680"},{dept_code:"15",code:"15542",name:"PESCA",postal:"152460"},{dept_code:"15",code:"15550",name:"PISBA",postal:"151801"},{dept_code:"15",code:"15572",name:"PUERTO BOYACA",postal:"155208"},{dept_code:"15",code:"15580",name:"QUIPAMA",postal:"155027"},{dept_code:"15",code:"15599",name:"RAMIRIQUI",postal:"153407"},{dept_code:"15",code:"15600",name:"RAQUIRA",postal:"153801"},{dept_code:"15",code:"15621",name:"RONDON",postal:"153420"},{dept_code:"15",code:"15632",name:"SABOYA",postal:"154601"},{dept_code:"15",code:"15638",name:"SACHICA",postal:"153887"},{dept_code:"15",code:"15646",name:"SAMACA",postal:"153660"},{dept_code:"15",code:"15660",name:"SAN EDUARDO",postal:"152601"},{dept_code:"15",code:"15664",name:"SAN JOSE DE PARE",postal:"154460"},{dept_code:"15",code:"15667",name:"SAN LUIS DE GACENO",postal:"152801"},{dept_code:"15",code:"15673",name:"SAN MATEO",postal:"151207"},{dept_code:"15",code:"15676",name:"SAN MIGUEL DE SEMA",postal:"153820"},{dept_code:"15",code:"15681",name:"SAN PABLO DE BORBUR",postal:"155040"},{dept_code:"15",code:"15686",name:"SANTANA",postal:"154440"},{dept_code:"15",code:"15690",name:"SANTA MARIA",postal:"152820"},{dept_code:"15",code:"15693",name:"SANTA ROSA DE VITERBO",postal:"150480"},{dept_code:"15",code:"15696",name:"SANTA SOFIA",postal:"154247"},{dept_code:"15",code:"15720",name:"SATIVANORTE",postal:"150820"},{dept_code:"15",code:"15723",name:"SATIVASUR",postal:"150801"},{dept_code:"15",code:"15740",name:"SIACHOQUE",postal:"153460"},{dept_code:"15",code:"15753",name:"SOATA",postal:"151001"},{dept_code:"15",code:"15755",name:"SOCOTA",postal:"151620"},{dept_code:"15",code:"15757",name:"SOCHA",postal:"151640"},{dept_code:"15",code:"15759",name:"SOGAMOSO",postal:"152217"},{dept_code:"15",code:"15761",name:"SOMONDOCO",postal:"153030"},{dept_code:"15",code:"15762",name:"SORA",postal:"154040"},{dept_code:"15",code:"15763",name:"SOTAQUIRA",postal:"150420"},{dept_code:"15",code:"15764",name:"SORACA",postal:"153480"},{dept_code:"15",code:"15774",name:"SUSACON",postal:"150880"},{dept_code:"15",code:"15776",name:"SUTAMARCHAN",postal:"153867"},{dept_code:"15",code:"15778",name:"SUTATENZA",postal:"153067"},{dept_code:"15",code:"15790",name:"TASCO",postal:"151660"},{dept_code:"15",code:"15798",name:"TENZA",postal:"153207"},{dept_code:"15",code:"15804",name:"TIBANA",postal:"153260"},{dept_code:"15",code:"15806",name:"TIBASOSA",postal:"152260"},{dept_code:"15",code:"15808",name:"TINJACA",postal:"153840"},{dept_code:"15",code:"15810",name:"TIPACOQUE",postal:"151020"},{dept_code:"15",code:"15814",name:"TOCA",postal:"150260"},{dept_code:"15",code:"15816",name:"TOGÜI",postal:"154401"},{dept_code:"15",code:"15820",name:"TOPAGA",postal:"152047"},{dept_code:"15",code:"15822",name:"TOTA",postal:"152440"},{dept_code:"15",code:"15832",name:"TUNUNGUA",postal:"154687"},{dept_code:"15",code:"15835",name:"TURMEQUE",postal:"153630"},{dept_code:"15",code:"15837",name:"TUTA",postal:"150401"},{dept_code:"15",code:"15839",name:"TUTAZA",postal:"150660"},{dept_code:"15",code:"15842",name:"UMBITA",postal:"153240"},{dept_code:"15",code:"15861",name:"VENTAQUEMADA",postal:"153640"},{dept_code:"15",code:"15879",name:"VIRACACHA",postal:"153450"},{dept_code:"15",code:"15897",name:"ZETAQUIRA",postal:"152680"},{dept_code:"17",code:"17001",name:"MANIZALES",postal:"170007"},{dept_code:"17",code:"17013",name:"AGUADAS",postal:"172020"},{dept_code:"17",code:"17042",name:"ANSERMA",postal:"177080"},{dept_code:"17",code:"17050",name:"ARANZAZU",postal:"171040"},{dept_code:"17",code:"17088",name:"BELALCAZAR",postal:"177001"},{dept_code:"17",code:"17174",name:"CHINCHINA",postal:"176020"},{dept_code:"17",code:"17272",name:"FILADELFIA",postal:"171020"},{dept_code:"17",code:"17380",name:"LA DORADA",postal:"175038"},{dept_code:"17",code:"17388",name:"LA MERCED",postal:"172067"},{dept_code:"17",code:"17433",name:"MANZANARES",postal:"173020"},{dept_code:"17",code:"17442",name:"MARMATO",postal:"178007"},{dept_code:"17",code:"17444",name:"MARQUETALIA",postal:"173040"},{dept_code:"17",code:"17446",name:"MARULANDA",postal:"173007"},{dept_code:"17",code:"17486",name:"NEIRA",postal:"171001"},{dept_code:"17",code:"17495",name:"NORCASIA",postal:"175001"},{dept_code:"17",code:"17513",name:"PACORA",postal:"172040"},{dept_code:"17",code:"17524",name:"PALESTINA",postal:"176040"},{dept_code:"17",code:"17541",name:"PENSILVANIA",postal:"173060"},{dept_code:"17",code:"17614",name:"RIOSUCIO",postal:"178057"},{dept_code:"17",code:"17616",name:"RISARALDA",postal:"177060"},{dept_code:"17",code:"17653",name:"SALAMINA",postal:"172001"},{dept_code:"17",code:"17662",name:"SAMANA",postal:"174001"},{dept_code:"17",code:"17665",name:"SAN JOSE",postal:"177040"},{dept_code:"17",code:"17777",name:"SUPIA",postal:"178020"},{dept_code:"17",code:"17867",name:"VICTORIA",postal:"174030"},{dept_code:"17",code:"17873",name:"VILLAMARIA",postal:"176001"},{dept_code:"17",code:"17877",name:"VITERBO",postal:"177020"},{dept_code:"18",code:"18001",name:"FLORENCIA",postal:"180009"},{dept_code:"18",code:"18029",name:"ALBANIA",postal:"186030"},{dept_code:"18",code:"18094",name:"BELEN DE LOS ANDAQUIES",postal:"186010"},{dept_code:"18",code:"18150",name:"CARTAGENA DEL CHAIRA",postal:"183010"},{dept_code:"18",code:"18205",name:"CURILLO",postal:"186050"},{dept_code:"18",code:"18247",name:"EL DONCELLO",postal:"181010"},{dept_code:"18",code:"18256",name:"EL PAUJIL",postal:"181030"},{dept_code:"18",code:"18410",name:"LA MONTANITA",postal:"181059"},{dept_code:"18",code:"18460",name:"MILAN",postal:"185030"},{dept_code:"18",code:"18479",name:"MORELIA",postal:"185010"},{dept_code:"18",code:"18592",name:"PUERTO RICO",postal:"182050"},{dept_code:"18",code:"18610",name:"SAN JOSE DEL FRAGUA",postal:"186070"},{dept_code:"18",code:"18753",name:"SAN VICENTE DEL CAGUAN",postal:"182010"},{dept_code:"18",code:"18756",name:"SOLANO",postal:"184010"},{dept_code:"18",code:"18785",name:"SOLITA",postal:"185070"},{dept_code:"18",code:"18860",name:"VALPARAISO",postal:"185050"},{dept_code:"85",code:"85001",name:"YOPAL",postal:"850009"},{dept_code:"85",code:"85010",name:"AGUAZUL",postal:"856010"},{dept_code:"85",code:"85015",name:"CHAMEZA",postal:"856030"},{dept_code:"85",code:"85125",name:"HATO COROZAL",postal:"852010"},{dept_code:"85",code:"85136",name:"LA SALINA",postal:"851010"},{dept_code:"85",code:"85139",name:"MANI",postal:"854018"},{dept_code:"85",code:"85162",name:"MONTERREY",postal:"855010"},{dept_code:"85",code:"85225",name:"NUNCHIA",postal:"851070"},{dept_code:"85",code:"85230",name:"OROCUE",postal:"853050"},{dept_code:"85",code:"85250",name:"PAZ DE ARIPORO",postal:"852030"},{dept_code:"85",code:"85263",name:"PORE",postal:"852057"},{dept_code:"85",code:"85279",name:"RECETOR",postal:"856050"},{dept_code:"85",code:"85300",name:"SABANALARGA",postal:"855050"},{dept_code:"85",code:"85315",name:"SACAMA",postal:"851038"},{dept_code:"85",code:"85325",name:"SAN LUIS DE PALENQUE",postal:"853030"},{dept_code:"85",code:"85400",name:"TAMARA",postal:"851050"},{dept_code:"85",code:"85410",name:"TAURAMENA",postal:"854030"},{dept_code:"85",code:"85430",name:"TRINIDAD",postal:"853019"},{dept_code:"85",code:"85440",name:"VILLANUEVA",postal:"855039"},{dept_code:"19",code:"19001",name:"POPAYAN",postal:"190001"},{dept_code:"19",code:"19022",name:"ALMAGUER",postal:"194080"},{dept_code:"19",code:"19050",name:"ARGELIA",postal:"195560"},{dept_code:"19",code:"19075",name:"BALBOA",postal:"195530"},{dept_code:"19",code:"19100",name:"BOLIVAR",postal:"195001"},{dept_code:"19",code:"19110",name:"BUENOS AIRES",postal:"191001"},{dept_code:"19",code:"19130",name:"CAJIBIO",postal:"190501"},{dept_code:"19",code:"19137",name:"CALDONO",postal:"192040"},{dept_code:"19",code:"19142",name:"CALOTO",postal:"191070"},{dept_code:"19",code:"19212",name:"CORINTO",postal:"191560"},{dept_code:"19",code:"19256",name:"EL TAMBO",postal:"193570"},{dept_code:"19",code:"19290",name:"FLORENCIA",postal:"195040"},{dept_code:"19",code:"19300",name:"GUACHENE",postal:"191087"},{dept_code:"19",code:"19318",name:"GUAPI",postal:"196001"},{dept_code:"19",code:"19355",name:"INZA",postal:"192548"},{dept_code:"19",code:"19364",name:"JAMBALO",postal:"192029"},{dept_code:"19",code:"19392",name:"LA SIERRA",postal:"194001"},{dept_code:"19",code:"19397",name:"LA VEGA",postal:"194020"},{dept_code:"19",code:"19418",name:"LOPEZ",postal:"196060"},{dept_code:"19",code:"19450",name:"MERCADERES",postal:"195060"},{dept_code:"19",code:"19455",name:"MIRANDA",postal:"191520"},{dept_code:"19",code:"19473",name:"MORALES",postal:"190567"},{dept_code:"19",code:"19513",name:"PADILLA",postal:"191540"},{dept_code:"19",code:"19517",name:"PAEZ",postal:"192501"},{dept_code:"19",code:"19532",name:"PATIA",postal:"195501"},{dept_code:"19",code:"19533",name:"PIAMONTE",postal:"194550"},{dept_code:"19",code:"19548",name:"PIENDAMO",postal:"190530"},{dept_code:"19",code:"19573",name:"PUERTO TEJADA",postal:"191501"},{dept_code:"19",code:"19585",name:"PURACE",postal:"193001"},{dept_code:"19",code:"19622",name:"ROSAS",postal:"193550"},{dept_code:"19",code:"19693",name:"SAN SEBASTIAN",postal:"194501"},{dept_code:"19",code:"19698",name:"SANTANDER DE QUILICHAO",postal:"191030"},{dept_code:"19",code:"19701",name:"SANTA ROSA",postal:"194520"},{dept_code:"19",code:"19743",name:"SILVIA",postal:"192070"},{dept_code:"19",code:"19760",name:"SOTARA",postal:"193501"},{dept_code:"19",code:"19780",name:"SUAREZ",postal:"190580"},{dept_code:"19",code:"19785",name:"SUCRE",postal:"194060"},{dept_code:"19",code:"19807",name:"TIMBIO",postal:"193520"},{dept_code:"19",code:"19809",name:"TIMBIQUI",postal:"196030"},{dept_code:"19",code:"19821",name:"TORIBIO",postal:"192001"},{dept_code:"19",code:"19824",name:"TOTORO",postal:"192570"},{dept_code:"19",code:"19845",name:"VILLA RICA",postal:"191060"},{dept_code:"20",code:"20001",name:"VALLEDUPAR",postal:"200018"},{dept_code:"20",code:"20011",name:"AGUACHICA",postal:"205010"},{dept_code:"20",code:"20013",name:"AGUSTIN CODAZZI",postal:"202050"},{dept_code:"20",code:"20032",name:"ASTREA",postal:"201040"},{dept_code:"20",code:"20045",name:"BECERRIL",postal:"203001"},{dept_code:"20",code:"20060",name:"BOSCONIA",postal:"201027"},{dept_code:"20",code:"20175",name:"CHIMICHAGUA",postal:"201050"},{dept_code:"20",code:"20178",name:"CHIRIGUANA",postal:"203040"},{dept_code:"20",code:"20228",name:"CURUMANI",postal:"203060"},{dept_code:"20",code:"20238",name:"EL COPEY",postal:"201010"},{dept_code:"20",code:"20250",name:"EL PASO",postal:"201030"},{dept_code:"20",code:"20295",name:"GAMARRA",postal:"205001"},{dept_code:"20",code:"20310",name:"GONZALEZ",postal:"205030"},{dept_code:"20",code:"20383",name:"LA GLORIA",postal:"204060"},{dept_code:"20",code:"20400",name:"LA JAGUA DE IBIRICO",postal:"203020"},{dept_code:"20",code:"20443",name:"MANAURE",postal:"202001"},{dept_code:"20",code:"20517",name:"PAILITAS",postal:"204001"},{dept_code:"20",code:"20550",name:"PELAYA",postal:"204047"},{dept_code:"20",code:"20570",name:"PUEBLO BELLO",postal:"201001"},{dept_code:"20",code:"20614",name:"RIO DE ORO",postal:"205040"},{dept_code:"20",code:"20621",name:"LA PAZ",postal:"202010"},{dept_code:"20",code:"20710",name:"SAN ALBERTO",postal:"205070"},{dept_code:"20",code:"20750",name:"SAN DIEGO",postal:"202030"},{dept_code:"20",code:"20770",name:"SAN MARTIN",postal:"205050"},{dept_code:"20",code:"20787",name:"TAMALAMEQUE",postal:"204020"},{dept_code:"27",code:"27001",name:"QUIBDO",postal:"270002"},{dept_code:"27",code:"27006",name:"ACANDI",postal:"278010"},{dept_code:"27",code:"27025",name:"ALTO BAUDO",postal:"276070"},{dept_code:"27",code:"27050",name:"ATRATO",postal:"272010"},{dept_code:"27",code:"27073",name:"BAGADO",postal:"271050"},{dept_code:"27",code:"27075",name:"BAHIA SOLANO",postal:"276030"},{dept_code:"27",code:"27077",name:"BAJO BAUDO",postal:"275030"},{dept_code:"27",code:"27099",name:"BOJAYA",postal:"277050"},{dept_code:"27",code:"27135",name:"EL CANTON DEL SAN PABLO",postal:"272040"},{dept_code:"27",code:"27150",name:"CARMEN DEL DARIEN",postal:"277030"},{dept_code:"27",code:"27160",name:"CERTEGUI",postal:"272020"},{dept_code:"27",code:"27205",name:"CONDOTO",postal:"273030"},{dept_code:"27",code:"27245",name:"EL CARMEN DE ATRATO",postal:"271010"},{dept_code:"27",code:"27250",name:"EL LITORAL DEL SAN JUAN",postal:"275050"},{dept_code:"27",code:"27361",name:"ISTMINA",postal:"274010"},{dept_code:"27",code:"27372",name:"JURADO",postal:"276010"},{dept_code:"27",code:"27413",name:"LLORO",postal:"271030"},{dept_code:"27",code:"27425",name:"MEDIO ATRATO",postal:"270070"},{dept_code:"27",code:"27430",name:"MEDIO BAUDO",postal:"275010"},{dept_code:"27",code:"27450",name:"MEDIO SAN JUAN",postal:"274030"},{dept_code:"27",code:"27491",name:"NOVITA",postal:"273050"},{dept_code:"27",code:"27495",name:"NUQUI",postal:"276050"},{dept_code:"27",code:"27580",name:"RIO IRO",postal:"273010"},{dept_code:"27",code:"27600",name:"RIO QUITO",postal:"272050"},{dept_code:"27",code:"27615",name:"RIOSUCIO",postal:"278050"},{dept_code:"27",code:"27660",name:"SAN JOSE DEL PALMAR",postal:"273070"},{dept_code:"27",code:"27745",name:"SIPI",postal:"274050"},{dept_code:"27",code:"27787",name:"TADO",postal:"271070"},{dept_code:"27",code:"27800",name:"UNGUIA",postal:"278030"},{dept_code:"27",code:"27810",name:"UNION PANAMERICANA",postal:"272030"},{dept_code:"23",code:"23001",name:"MONTERIA",postal:"230017"},{dept_code:"23",code:"23068",name:"AYAPEL",postal:"233530"},{dept_code:"23",code:"23079",name:"BUENAVISTA",postal:"233028"},{dept_code:"23",code:"23090",name:"CANALETE",postal:"235040"},{dept_code:"23",code:"23162",name:"CERETE",postal:"230550"},{dept_code:"23",code:"23168",name:"CHIMA",postal:"232010"},{dept_code:"23",code:"23182",name:"CHINU",postal:"232050"},{dept_code:"23",code:"23189",name:"CIENAGA DE ORO",postal:"232520"},{dept_code:"23",code:"23300",name:"COTORRA",postal:"230501"},{dept_code:"23",code:"23350",name:"LA APARTADA",postal:"233507"},{dept_code:"23",code:"23417",name:"LORICA",postal:"231029"},{dept_code:"23",code:"23419",name:"LOS CORDOBAS",postal:"235020"},{dept_code:"23",code:"23464",name:"MOMIL",postal:"232008"},{dept_code:"23",code:"23466",name:"MONTELIBANO",postal:"234007"},{dept_code:"23",code:"23500",name:"MONITOS",postal:"231007"},{dept_code:"23",code:"23555",name:"PLANETA RICA",postal:"233040"},{dept_code:"23",code:"23570",name:"PUEBLO NUEVO",postal:"233001"},{dept_code:"23",code:"23574",name:"PUERTO ESCONDIDO",postal:"235001"},{dept_code:"23",code:"23580",name:"PUERTO LIBERTADOR",postal:"234038"},{dept_code:"23",code:"23586",name:"PURISIMA",postal:"231540"},{dept_code:"23",code:"23660",name:"SAHAGUN",postal:"232549"},{dept_code:"23",code:"23670",name:"SAN ANDRES SOTAVENTO",postal:"232030"},{dept_code:"23",code:"23672",name:"SAN ANTERO",postal:"231520"},{dept_code:"23",code:"23675",name:"SAN BERNARDO DEL VIENTO",postal:"231501"},{dept_code:"23",code:"23678",name:"SAN CARLOS",postal:"232501"},{dept_code:"23",code:"23682",name:"SAN JOSE DE URE",postal:"234010"},{dept_code:"23",code:"23686",name:"SAN PELAYO",postal:"230538"},{dept_code:"23",code:"23807",name:"TIERRALTA",postal:"234517"},{dept_code:"23",code:"23815",name:"TUCHIN",postal:"232027"},{dept_code:"23",code:"23855",name:"VALENCIA",postal:"234539"},{dept_code:"25",code:"25001",name:"AGUA DE DIOS",postal:"252850"},{dept_code:"25",code:"25019",name:"ALBAN",postal:"253207"},{dept_code:"25",code:"25035",name:"ANAPOIMA",postal:"252647"},{dept_code:"25",code:"25040",name:"ANOLAIMA",postal:"253048"},{dept_code:"25",code:"25053",name:"ARBELAEZ",postal:"252001"},{dept_code:"25",code:"25086",name:"BELTRAN",postal:"253260"},{dept_code:"25",code:"25095",name:"BITUIMA",postal:"253220"},{dept_code:"25",code:"25099",name:"BOJACA",postal:"253001"},{dept_code:"25",code:"25120",name:"CABRERA",postal:"252040"},{dept_code:"25",code:"25123",name:"CACHIPAY",postal:"253020"},{dept_code:"25",code:"25126",name:"CAJICA",postal:"250240"},{dept_code:"25",code:"25148",name:"CAPARRAPI",postal:"253460"},{dept_code:"25",code:"25151",name:"CAQUEZA",postal:"251827"},{dept_code:"25",code:"25154",name:"CARMEN DE CARUPA",postal:"250420"},{dept_code:"25",code:"25168",name:"CHAGUANI",postal:"253240"},{dept_code:"25",code:"25175",name:"CHIA",postal:"250001"},{dept_code:"25",code:"25178",name:"CHIPAQUE",postal:"251801"},{dept_code:"25",code:"25181",name:"CHOACHI",postal:"251620"},{dept_code:"25",code:"25183",name:"CHOCONTA",postal:"250801"},{dept_code:"25",code:"25200",name:"COGUA",postal:"250408"},{dept_code:"25",code:"25214",name:"COTA",postal:"250010"},{dept_code:"25",code:"25224",name:"CUCUNUBA",postal:"250450"},{dept_code:"25",code:"25245",name:"EL COLEGIO",postal:"252630"},{dept_code:"25",code:"25258",name:"EL PENON",postal:"254027"},{dept_code:"25",code:"25260",name:"EL ROSAL",postal:"250210"},{dept_code:"25",code:"25269",name:"FACATATIVA",postal:"253058"},{dept_code:"25",code:"25279",name:"FOMEQUE",postal:"251640"},{dept_code:"25",code:"25281",name:"FOSCA",postal:"251830"},{dept_code:"25",code:"25286",name:"FUNZA",postal:"250020"},{dept_code:"25",code:"25288",name:"FUQUENE",postal:"250620"},{dept_code:"25",code:"25290",name:"FUSAGASUGA",postal:"252219"},{dept_code:"25",code:"25293",name:"GACHALA",postal:"251250"},{dept_code:"25",code:"25295",name:"GACHANCIPA",postal:"251020"},{dept_code:"25",code:"25297",name:"GACHETA",postal:"251230"},{dept_code:"25",code:"25299",name:"GAMA",postal:"251240"},{dept_code:"25",code:"25307",name:"GIRARDOT",postal:"252431"},{dept_code:"25",code:"25312",name:"GRANADA",postal:"252257"},{dept_code:"25",code:"25317",name:"GUACHETA",postal:"250610"},{dept_code:"25",code:"25320",name:"GUADUAS",postal:"253448"},{dept_code:"25",code:"25322",name:"GUASCA",postal:"251210"},{dept_code:"25",code:"25324",name:"GUATAQUI",postal:"252820"},{dept_code:"25",code:"25326",name:"GUATAVITA",postal:"251060"},{dept_code:"25",code:"25328",name:"GUAYABAL DE SIQUIMA",postal:"253210"},{dept_code:"25",code:"25335",name:"GUAYABETAL",postal:"251850"},{dept_code:"25",code:"25339",name:"GUTIERREZ",postal:"251860"},{dept_code:"25",code:"25368",name:"JERUSALEN",postal:"252810"},{dept_code:"25",code:"25372",name:"JUNIN",postal:"251220"},{dept_code:"25",code:"25377",name:"LA CALERA",postal:"251201"},{dept_code:"25",code:"25386",name:"LA MESA",postal:"252601"},{dept_code:"25",code:"25394",name:"LA PALMA",postal:"253808"},{dept_code:"25",code:"25398",name:"LA PENA",postal:"253640"},{dept_code:"25",code:"25402",name:"LA VEGA",postal:"253610"},{dept_code:"25",code:"25407",name:"LENGUAZAQUE",postal:"250601"},{dept_code:"25",code:"25426",name:"MACHETA",postal:"250840"},{dept_code:"25",code:"25430",name:"MADRID",postal:"250038"},{dept_code:"25",code:"25436",name:"MANTA",postal:"250830"},{dept_code:"25",code:"25438",name:"MEDINA",postal:"251420"},{dept_code:"25",code:"25473",name:"MOSQUERA",postal:"250040"},{dept_code:"25",code:"25483",name:"NARINO",postal:"252837"},{dept_code:"25",code:"25486",name:"NEMOCON",postal:"251030"},{dept_code:"25",code:"25488",name:"NILO",postal:"252401"},{dept_code:"25",code:"25489",name:"NIMAIMA",postal:"253630"},{dept_code:"25",code:"25491",name:"NOCAIMA",postal:"253620"},{dept_code:"25",code:"25506",name:"VENECIA",postal:"252037"},{dept_code:"25",code:"25513",name:"PACHO",postal:"254001"},{dept_code:"25",code:"25518",name:"PAIME",postal:"254040"},{dept_code:"25",code:"25524",name:"PANDI",postal:"252010"},{dept_code:"25",code:"25530",name:"PARATEBUENO",postal:"251401"},{dept_code:"25",code:"25535",name:"PASCA",postal:"252201"},{dept_code:"25",code:"25572",name:"PUERTO SALGAR",postal:"253480"},{dept_code:"25",code:"25580",name:"PULI",postal:"252801"},{dept_code:"25",code:"25592",name:"QUEBRADANEGRA",postal:"253427"},{dept_code:"25",code:"25594",name:"QUETAME",postal:"251840"},{dept_code:"25",code:"25596",name:"QUIPILE",postal:"253030"},{dept_code:"25",code:"25599",name:"APULO",postal:"252650"},{dept_code:"25",code:"25612",name:"RICAURTE",postal:"252417"},{dept_code:"25",code:"25645",name:"SAN ANTONIO DEL TEQUENDAMA",postal:"252620"},{dept_code:"25",code:"25649",name:"SAN BERNARDO",postal:"252020"},{dept_code:"25",code:"25653",name:"SAN CAYETANO",postal:"254050"},{dept_code:"25",code:"25658",name:"SAN FRANCISCO",postal:"253601"},{dept_code:"25",code:"25662",name:"SAN JUAN DE RIO SECO",postal:"253250"},{dept_code:"25",code:"25718",name:"SASAIMA",postal:"253401"},{dept_code:"25",code:"25736",name:"SESQUILE",postal:"251050"},{dept_code:"25",code:"25740",name:"SIBATE",postal:"250077"},{dept_code:"25",code:"25743",name:"SILVANIA",postal:"252240"},{dept_code:"25",code:"25745",name:"SIMIJACA",postal:"250647"},{dept_code:"25",code:"25754",name:"SOACHA",postal:"250051"},{dept_code:"25",code:"25758",name:"SOPO",postal:"251001"},{dept_code:"25",code:"25769",name:"SUBACHOQUE",postal:"250228"},{dept_code:"25",code:"25772",name:"SUESCA",postal:"251040"},{dept_code:"25",code:"25777",name:"SUPATA",postal:"253660"},{dept_code:"25",code:"25779",name:"SUSA",postal:"250630"},{dept_code:"25",code:"25781",name:"SUTATAUSA",postal:"250440"},{dept_code:"25",code:"25785",name:"TABIO",postal:"250237"},{dept_code:"25",code:"25793",name:"TAUSA",postal:"250410"},{dept_code:"25",code:"25797",name:"TENA",postal:"252610"},{dept_code:"25",code:"25799",name:"TENJO",postal:"250201"},{dept_code:"25",code:"25805",name:"TIBACUY",postal:"252230"},{dept_code:"25",code:"25807",name:"TIBIRITA",postal:"250820"},{dept_code:"25",code:"25815",name:"TOCAIMA",postal:"252840"},{dept_code:"25",code:"25817",name:"TOCANCIPA",postal:"251010"},{dept_code:"25",code:"25823",name:"TOPAIPI",postal:"253820"},{dept_code:"25",code:"25839",name:"UBALA",postal:"251260"},{dept_code:"25",code:"25841",name:"UBAQUE",postal:"251601"},{dept_code:"25",code:"25843",name:"VILLA DE SAN DIEGO DE UBATE",postal:"250430"},{dept_code:"25",code:"25845",name:"UNE",postal:"251810"},{dept_code:"25",code:"25851",name:"UTICA",postal:"253430"},{dept_code:"25",code:"25862",name:"VERGARA",postal:"253650"},{dept_code:"25",code:"25867",name:"VIANI",postal:"253230"},{dept_code:"25",code:"25871",name:"VILLAGOMEZ",postal:"254030"},{dept_code:"25",code:"25873",name:"VILLAPINZON",postal:"250810"},{dept_code:"25",code:"25875",name:"VILLETA",postal:"253418"},{dept_code:"25",code:"25878",name:"VIOTA",postal:"252660"},{dept_code:"25",code:"25885",name:"YACOPI",postal:"253840"},{dept_code:"25",code:"25898",name:"ZIPACON",postal:"253010"},{dept_code:"25",code:"25899",name:"ZIPAQUIRA",postal:"250251"},{dept_code:"94",code:"94001",name:"INIRIDA",postal:"940017"},{dept_code:"94",code:"94343",name:"BARRANCO MINAS",postal:"944010"},{dept_code:"94",code:"94663",name:"MAPIRIPANA",postal:"944058"},{dept_code:"94",code:"94883",name:"SAN FELIPE",postal:"942010"},{dept_code:"94",code:"94884",name:"PUERTO COLOMBIA",postal:"941039"},{dept_code:"94",code:"94885",name:"LA GUADALUPE",postal:"942057"},{dept_code:"94",code:"94886",name:"CACAHUAL",postal:"941010"},{dept_code:"94",code:"94887",name:"PANA PANA",postal:"943018"},{dept_code:"94",code:"94888",name:"MORICHAL",postal:"943059"},{dept_code:"95",code:"95001",name:"SAN JOSE DEL GUAVIARE",postal:"950001"},{dept_code:"95",code:"95015",name:"CALAMAR",postal:"953001"},{dept_code:"95",code:"95025",name:"EL RETORNO",postal:"951001"},{dept_code:"95",code:"95200",name:"MIRAFLORES",postal:"952001"},{dept_code:"41",code:"41001",name:"NEIVA",postal:"410010"},{dept_code:"41",code:"41006",name:"ACEVEDO",postal:"417079"},{dept_code:"41",code:"41013",name:"AGRADO",postal:"414040"},{dept_code:"41",code:"41016",name:"AIPE",postal:"411001"},{dept_code:"41",code:"41020",name:"ALGECIRAS",postal:"413040"},{dept_code:"41",code:"41026",name:"ALTAMIRA",postal:"416020"},{dept_code:"41",code:"41078",name:"BARAYA",postal:"411060"},{dept_code:"41",code:"41132",name:"CAMPOALEGRE",postal:"413020"},{dept_code:"41",code:"41206",name:"COLOMBIA",postal:"411080"},{dept_code:"41",code:"41244",name:"ELIAS",postal:"417001"},{dept_code:"41",code:"41298",name:"GARZON",postal:"414027"},{dept_code:"41",code:"41306",name:"GIGANTE",postal:"414001"},{dept_code:"41",code:"41319",name:"GUADALUPE",postal:"416040"},{dept_code:"41",code:"41349",name:"HOBO",postal:"413060"},{dept_code:"41",code:"41357",name:"IQUIRA",postal:"412060"},{dept_code:"41",code:"41359",name:"ISNOS",postal:"418048"},{dept_code:"41",code:"41378",name:"LA ARGENTINA",postal:"415080"},{dept_code:"41",code:"41396",name:"LA PLATA",postal:"415078"},{dept_code:"41",code:"41483",name:"NATAGA",postal:"415020"},{dept_code:"41",code:"41503",name:"OPORAPA",postal:"418001"},{dept_code:"41",code:"41518",name:"PAICOL",postal:"415040"},{dept_code:"41",code:"41524",name:"PALERMO",postal:"412001"},{dept_code:"41",code:"41530",name:"PALESTINA",postal:"417067"},{dept_code:"41",code:"41548",name:"PITAL",postal:"414060"},{dept_code:"41",code:"41551",name:"PITALITO",postal:"417038"},{dept_code:"41",code:"41615",name:"RIVERA",postal:"413001"},{dept_code:"41",code:"41660",name:"SALADOBLANCO",postal:"418020"},{dept_code:"41",code:"41668",name:"SAN AGUSTIN",postal:"418060"},{dept_code:"41",code:"41676",name:"SANTA MARIA",postal:"412020"},{dept_code:"41",code:"41770",name:"SUAZA",postal:"416080"},{dept_code:"41",code:"41791",name:"TARQUI",postal:"416001"},{dept_code:"41",code:"41797",name:"TESALIA",postal:"415001"},{dept_code:"41",code:"41799",name:"TELLO",postal:"411040"},{dept_code:"41",code:"41801",name:"TERUEL",postal:"412040"},{dept_code:"41",code:"41807",name:"TIMANA",postal:"417010"},{dept_code:"41",code:"41872",name:"VILLAVIEJA",postal:"411020"},{dept_code:"41",code:"41885",name:"YAGUARA",postal:"412087"},{dept_code:"44",code:"44001",name:"RIOHACHA",postal:"440001"},{dept_code:"44",code:"44035",name:"ALBANIA",postal:"443001"},{dept_code:"44",code:"44078",name:"BARRANCAS",postal:"443040"},{dept_code:"44",code:"44090",name:"DIBULLA",postal:"446001"},{dept_code:"44",code:"44098",name:"DISTRACCION",postal:"444001"},{dept_code:"44",code:"44110",name:"EL MOLINO",postal:"444050"},{dept_code:"44",code:"44279",name:"FONSECA",postal:"444010"},{dept_code:"44",code:"44378",name:"HATONUEVO",postal:"443020"},{dept_code:"44",code:"44420",name:"LA JAGUA DEL PILAR",postal:"445040"},{dept_code:"44",code:"44430",name:"MAICAO",postal:"442001"},{dept_code:"44",code:"44560",name:"MANAURE",postal:"441001"},{dept_code:"44",code:"44650",name:"SAN JUAN DEL CESAR",postal:"444037"},{dept_code:"44",code:"44847",name:"URIBIA",postal:"441020"},{dept_code:"44",code:"44855",name:"URUMITA",postal:"445020"},{dept_code:"44",code:"44874",name:"VILLANUEVA",postal:"445008"},{dept_code:"47",code:"47001",name:"SANTA MARTA",postal:"470009"},{dept_code:"47",code:"47030",name:"ALGARROBO",postal:"472040"},{dept_code:"47",code:"47053",name:"ARACATACA",postal:"472007"},{dept_code:"47",code:"47058",name:"ARIGUANI",postal:"475010"},{dept_code:"47",code:"47161",name:"CERRO SAN ANTONIO",postal:"476020"},{dept_code:"47",code:"47170",name:"CHIVOLO",postal:"476060"},{dept_code:"47",code:"47189",name:"CIENAGA",postal:"478002"},{dept_code:"47",code:"47205",name:"CONCORDIA",postal:"476030"},{dept_code:"47",code:"47245",name:"EL BANCO",postal:"473040"},{dept_code:"47",code:"47258",name:"EL PINON",postal:"476007"},{dept_code:"47",code:"47268",name:"EL RETEN",postal:"478060"},{dept_code:"47",code:"47288",name:"FUNDACION",postal:"472020"},{dept_code:"47",code:"47318",name:"GUAMAL",postal:"473020"},{dept_code:"47",code:"47460",name:"NUEVA GRANADA",postal:"475020"},{dept_code:"47",code:"47541",name:"PEDRAZA",postal:"476040"},{dept_code:"47",code:"47545",name:"PIJINO DEL CARMEN",postal:"474047"},{dept_code:"47",code:"47551",name:"PIVIJAY",postal:"477050"},{dept_code:"47",code:"47555",name:"PLATO",postal:"475030"},{dept_code:"47",code:"47570",name:"PUEBLOVIEJO",postal:"478048"},{dept_code:"47",code:"47605",name:"REMOLINO",postal:"477020"},{dept_code:"47",code:"47660",name:"SABANAS DE SAN ANGEL",postal:"475001"},{dept_code:"47",code:"47675",name:"SALAMINA",postal:"477040"},{dept_code:"47",code:"47692",name:"SAN SEBASTIAN DE BUENAVISTA",postal:"473007"},{dept_code:"47",code:"47703",name:"SAN ZENON",postal:"474060"},{dept_code:"47",code:"47707",name:"SANTA ANA",postal:"474020"},{dept_code:"47",code:"47720",name:"SANTA BARBARA DE PINTO",postal:"474001"},{dept_code:"47",code:"47745",name:"SITIONUEVO",postal:"477001"},{dept_code:"47",code:"47798",name:"TENERIFE",postal:"475057"},{dept_code:"47",code:"47960",name:"ZAPAYAN",postal:"476050"},{dept_code:"47",code:"47980",name:"ZONA BANANERA",postal:"478020"},{dept_code:"50",code:"50001",name:"VILLAVICENCIO",postal:"500004"},{dept_code:"50",code:"50006",name:"ACACIAS",postal:"507008"},{dept_code:"50",code:"50110",name:"BARRANCA DE UPIA",postal:"501007"},{dept_code:"50",code:"50124",name:"CABUYARO",postal:"501011"},{dept_code:"50",code:"50150",name:"CASTILLA LA NUEVA",postal:"507041"},{dept_code:"50",code:"50223",name:"CUBARRAL",postal:"506001"},{dept_code:"50",code:"50226",name:"CUMARAL",postal:"501021"},{dept_code:"50",code:"50245",name:"EL CALVARIO",postal:"501041"},{dept_code:"50",code:"50251",name:"EL CASTILLO",postal:"506047"},{dept_code:"50",code:"50270",name:"EL DORADO",postal:"506021"},{dept_code:"50",code:"50287",name:"FUENTE DE ORO",postal:"504021"},{dept_code:"50",code:"50313",name:"GRANADA",postal:"504001"},{dept_code:"50",code:"50318",name:"GUAMAL",postal:"507051"},{dept_code:"50",code:"50325",name:"MAPIRIPAN",postal:"503021"},{dept_code:"50",code:"50330",name:"MESETAS",postal:"505001"},{dept_code:"50",code:"50350",name:"LA MACARENA",postal:"505021"},{dept_code:"50",code:"50370",name:"URIBE",postal:"505041"},{dept_code:"50",code:"50400",name:"LEJANIAS",postal:"506067"},{dept_code:"50",code:"50450",name:"PUERTO CONCORDIA",postal:"503041"},{dept_code:"50",code:"50568",name:"PUERTO GAITAN",postal:"502058"},{dept_code:"50",code:"50573",name:"PUERTO LOPEZ",postal:"502001"},{dept_code:"50",code:"50577",name:"PUERTO LLERAS",postal:"503001"},{dept_code:"50",code:"50590",name:"PUERTO RICO",postal:"503061"},{dept_code:"50",code:"50606",name:"RESTREPO",postal:"501031"},{dept_code:"50",code:"50680",name:"SAN CARLOS DE GUAROA",postal:"507011"},{dept_code:"50",code:"50683",name:"SAN JUAN DE ARAMA",postal:"504047"},{dept_code:"50",code:"50686",name:"SAN JUANITO",postal:"501051"},{dept_code:"50",code:"50689",name:"SAN MARTIN",postal:"507037"},{dept_code:"50",code:"50711",name:"VISTAHERMOSA",postal:"504061"},{dept_code:"52",code:"52001",name:"PASTO",postal:"520038"},{dept_code:"52",code:"52019",name:"ALBAN",postal:"521050"},{dept_code:"52",code:"52022",name:"ALDANA",postal:"524540"},{dept_code:"52",code:"52036",name:"ANCUYA",postal:"526007"},{dept_code:"52",code:"52051",name:"ARBOLEDA",postal:"520578"},{dept_code:"52",code:"52079",name:"BARBACOAS",postal:"528069"},{dept_code:"52",code:"52083",name:"BELEN",postal:"521087"},{dept_code:"52",code:"52110",name:"BUESACO",postal:"520501"},{dept_code:"52",code:"52203",name:"COLON",postal:"521067"},{dept_code:"52",code:"52207",name:"CONSACA",postal:"522548"},{dept_code:"52",code:"52210",name:"CONTADERO",postal:"523087"},{dept_code:"52",code:"52215",name:"CORDOBA",postal:"524009"},{dept_code:"52",code:"52224",name:"CUASPUD",postal:"524560"},{dept_code:"52",code:"52227",name:"CUMBAL",postal:"525007"},{dept_code:"52",code:"52233",name:"CUMBITARA",postal:"526567"},{dept_code:"52",code:"52240",name:"CHACHAGÜI",postal:"522001"},{dept_code:"52",code:"52250",name:"EL CHARCO",postal:"527537"},{dept_code:"52",code:"52254",name:"EL PENOL",postal:"522088"},{dept_code:"52",code:"52256",name:"EL ROSARIO",postal:"527037"},{dept_code:"52",code:"52258",name:"EL TABLON DE GOMEZ",postal:"520539"},{dept_code:"52",code:"52260",name:"EL TAMBO",postal:"522060"},{dept_code:"52",code:"52287",name:"FUNES",postal:"523520"},{dept_code:"52",code:"52317",name:"GUACHUCAL",postal:"524588"},{dept_code:"52",code:"52320",name:"GUAITARILLA",postal:"525508"},{dept_code:"52",code:"52323",name:"GUALMATAN",postal:"524501"},{dept_code:"52",code:"52352",name:"ILES",postal:"523060"},{dept_code:"52",code:"52354",name:"IMUES",postal:"523028"},{dept_code:"52",code:"52356",name:"IPIALES",postal:"524060"},{dept_code:"52",code:"52378",name:"LA CRUZ",postal:"521028"},{dept_code:"52",code:"52381",name:"LA FLORIDA",postal:"522048"},{dept_code:"52",code:"52385",name:"LA LLANADA",postal:"526507"},{dept_code:"52",code:"52390",name:"LA TOLA",postal:"527547"},{dept_code:"52",code:"52399",name:"LA UNION",postal:"521528"},{dept_code:"52",code:"52405",name:"LEIVA",postal:"527067"},{dept_code:"52",code:"52411",name:"LINARES",postal:"522508"},{dept_code:"52",code:"52418",name:"LOS ANDES",postal:"526527"},{dept_code:"52",code:"52427",name:"MAGÜI",postal:"528001"},{dept_code:"52",code:"52435",name:"MALLAMA",postal:"525068"},{dept_code:"52",code:"52473",name:"MOSQUERA",postal:"527580"},{dept_code:"52",code:"52480",name:"NARINO",postal:"522027"},{dept_code:"52",code:"52490",name:"OLAYA HERRERA",postal:"527569"},{dept_code:"52",code:"52506",name:"OSPINA",postal:"523047"},{dept_code:"52",code:"52520",name:"FRANCISCO PIZARRO",postal:"528560"},{dept_code:"52",code:"52540",name:"POLICARPA",postal:"527001"},{dept_code:"52",code:"52560",name:"POTOSI",postal:"524039"},{dept_code:"52",code:"52565",name:"PROVIDENCIA",postal:"526020"},{dept_code:"52",code:"52573",name:"PUERRES",postal:"523548"},{dept_code:"52",code:"52585",name:"PUPIALES",postal:"524527"},{dept_code:"52",code:"52612",name:"RICAURTE",postal:"525039"},{dept_code:"52",code:"52621",name:"ROBERTO PAYAN",postal:"528037"},{dept_code:"52",code:"52678",name:"SAMANIEGO",postal:"526049"},{dept_code:"52",code:"52683",name:"SANDONA",postal:"522527"},{dept_code:"52",code:"52685",name:"SAN BERNARDO",postal:"521007"},{dept_code:"52",code:"52687",name:"SAN LORENZO",postal:"521548"},{dept_code:"52",code:"52693",name:"SAN PABLO",postal:"521047"},{dept_code:"52",code:"52694",name:"SAN PEDRO DE CARTAGO",postal:"521508"},{dept_code:"52",code:"52696",name:"SANTA BARBARA",postal:"527507"},{dept_code:"52",code:"52699",name:"SANTACRUZ",postal:"525579"},{dept_code:"52",code:"52720",name:"SAPUYES",postal:"525558"},{dept_code:"52",code:"52786",name:"TAMINANGO",postal:"521567"},{dept_code:"52",code:"52788",name:"TANGUA",postal:"523507"},{dept_code:"52",code:"52835",name:"SAN ANDRES DE TUMACO",postal:"528528"},{dept_code:"52",code:"52838",name:"TUQUERRES",postal:"525537"},{dept_code:"52",code:"52885",name:"YACUANQUER",postal:"523008"},{dept_code:"54",code:"54001",name:"CUCUTA",postal:"540019"},{dept_code:"54",code:"54003",name:"ABREGO",postal:"546070"},{dept_code:"54",code:"54051",name:"ARBOLEDAS",postal:"544550"},{dept_code:"54",code:"54099",name:"BOCHALEMA",postal:"543010"},{dept_code:"54",code:"54109",name:"BUCARASICA",postal:"545557"},{dept_code:"54",code:"54125",name:"CACOTA",postal:"544010"},{dept_code:"54",code:"54128",name:"CACHIRA",postal:"546030"},{dept_code:"54",code:"54172",name:"CHINACOTA",postal:"541070"},{dept_code:"54",code:"54174",name:"CHITAGA",postal:"544030"},{dept_code:"54",code:"54206",name:"CONVENCION",postal:"547050"},{dept_code:"54",code:"54223",name:"CUCUTILLA",postal:"544520"},{dept_code:"54",code:"54239",name:"DURANIA",postal:"544517"},{dept_code:"54",code:"54245",name:"EL CARMEN",postal:"547070"},{dept_code:"54",code:"54250",name:"EL TARRA",postal:"548050"},{dept_code:"54",code:"54261",name:"EL ZULIA",postal:"545510"},{dept_code:"54",code:"54313",name:"GRAMALOTE",postal:"545050"},{dept_code:"54",code:"54344",name:"HACARI",postal:"546510"},{dept_code:"54",code:"54347",name:"HERRAN",postal:"542017"},{dept_code:"54",code:"54377",name:"LABATECA",postal:"542050"},{dept_code:"54",code:"54385",name:"LA ESPERANZA",postal:"546050"},{dept_code:"54",code:"54398",name:"LA PLAYA",postal:"546530"},{dept_code:"54",code:"54405",name:"LOS PATIOS",postal:"541010"},{dept_code:"54",code:"54418",name:"LOURDES",postal:"545070"},{dept_code:"54",code:"54480",name:"MUTISCUA",postal:"544070"},{dept_code:"54",code:"54498",name:"OCANA",postal:"546552"},{dept_code:"54",code:"54518",name:"PAMPLONA",postal:"543050"},{dept_code:"54",code:"54520",name:"PAMPLONITA",postal:"543030"},{dept_code:"54",code:"54553",name:"PUERTO SANTANDER",postal:"548030"},{dept_code:"54",code:"54599",name:"RAGONVALIA",postal:"541050"},{dept_code:"54",code:"54660",name:"SALAZAR",postal:"544570"},{dept_code:"54",code:"54670",name:"SAN CALIXTO",postal:"547010"},{dept_code:"54",code:"54673",name:"SAN CAYETANO",postal:"545010"},{dept_code:"54",code:"54680",name:"SANTIAGO",postal:"545030"},{dept_code:"54",code:"54720",name:"SARDINATA",postal:"545530"},{dept_code:"54",code:"54743",name:"SILOS",postal:"544050"},{dept_code:"54",code:"54800",name:"TEORAMA",postal:"547030"},{dept_code:"54",code:"54810",name:"TIBU",postal:"548010"},{dept_code:"54",code:"54820",name:"TOLEDO",postal:"542030"},{dept_code:"54",code:"54871",name:"VILLA CARO",postal:"546010"},{dept_code:"54",code:"54874",name:"VILLA DEL ROSARIO",postal:"541030"},{dept_code:"86",code:"86001",name:"MOCOA",postal:"860001"},{dept_code:"86",code:"86219",name:"COLON",postal:"861040"},{dept_code:"86",code:"86320",name:"ORITO",postal:"862001"},{dept_code:"86",code:"86568",name:"PUERTO ASIS",postal:"862060"},{dept_code:"86",code:"86569",name:"PUERTO CAICEDO",postal:"862080"},{dept_code:"86",code:"86571",name:"PUERTO GUZMAN",postal:"863001"},{dept_code:"86",code:"86573",name:"PUERTO LEGUIZAMO",postal:"864001"},{dept_code:"86",code:"86749",name:"SIBUNDOY",postal:"861020"},{dept_code:"86",code:"86755",name:"SAN FRANCISCO",postal:"861001"},{dept_code:"86",code:"86757",name:"SAN MIGUEL",postal:"862040"},{dept_code:"86",code:"86760",name:"SANTIAGO",postal:"861060"},{dept_code:"86",code:"86865",name:"VALLE DEL GUAMUEZ",postal:"862020"},{dept_code:"86",code:"86885",name:"VILLAGARZON",postal:"861080"},{dept_code:"63",code:"63001",name:"ARMENIA",postal:"630007"},{dept_code:"63",code:"63111",name:"BUENAVISTA",postal:"632040"},{dept_code:"63",code:"63130",name:"CALARCA",postal:"632001"},{dept_code:"63",code:"63190",name:"CIRCASIA",postal:"631001"},{dept_code:"63",code:"63212",name:"CORDOBA",postal:"632020"},{dept_code:"63",code:"63272",name:"FILANDIA",postal:"634001"},{dept_code:"63",code:"63302",name:"GENOVA",postal:"632080"},{dept_code:"63",code:"63401",name:"LA TEBAIDA",postal:"633020"},{dept_code:"63",code:"63470",name:"MONTENEGRO",postal:"633007"},{dept_code:"63",code:"63548",name:"PIJAO",postal:"632060"},{dept_code:"63",code:"63594",name:"QUIMBAYA",postal:"634027"},{dept_code:"63",code:"63690",name:"SALENTO",postal:"631020"},{dept_code:"66",code:"66001",name:"PEREIRA",postal:"660001"},{dept_code:"66",code:"66045",name:"APIA",postal:"663030"},{dept_code:"66",code:"66075",name:"BALBOA",postal:"662010"},{dept_code:"66",code:"66088",name:"BELEN DE UMBRIA",postal:"664047"},{dept_code:"66",code:"66170",name:"DOSQUEBRADAS",postal:"661002"},{dept_code:"66",code:"66318",name:"GUATICA",postal:"664010"},{dept_code:"66",code:"66383",name:"LA CELIA",postal:"662030"},{dept_code:"66",code:"66400",name:"LA VIRGINIA",postal:"662001"},{dept_code:"66",code:"66440",name:"MARSELLA",postal:"661040"},{dept_code:"66",code:"66456",name:"MISTRATO",postal:"664020"},{dept_code:"66",code:"66572",name:"PUEBLO RICO",postal:"663011"},{dept_code:"66",code:"66594",name:"QUINCHIA",postal:"664008"},{dept_code:"66",code:"66682",name:"SANTA ROSA DE CABAL",postal:"661027"},{dept_code:"66",code:"66687",name:"SANTUARIO",postal:"663001"},{dept_code:"88",code:"88001",name:"SAN ANDRES",postal:"880008"},{dept_code:"88",code:"88564",name:"PROVIDENCIA",postal:"880027"},{dept_code:"68",code:"68001",name:"BUCARAMANGA",postal:"680008"},{dept_code:"68",code:"68013",name:"AGUADA",postal:"685521"},{dept_code:"68",code:"68020",name:"ALBANIA",postal:"684531"},{dept_code:"68",code:"68051",name:"ARATOCA",postal:"682051"},{dept_code:"68",code:"68077",name:"BARBOSA",postal:"684517"},{dept_code:"68",code:"68079",name:"BARICHARA",postal:"684041"},{dept_code:"68",code:"68081",name:"BARRANCABERMEJA",postal:"687032"},{dept_code:"68",code:"68092",name:"BETULIA",postal:"686501"},{dept_code:"68",code:"68101",name:"BOLIVAR",postal:"685001"},{dept_code:"68",code:"68121",name:"CABRERA",postal:"683501"},{dept_code:"68",code:"68132",name:"CALIFORNIA",postal:"680511"},{dept_code:"68",code:"68147",name:"CAPITANEJO",postal:"681541"},{dept_code:"68",code:"68152",name:"CARCASI",postal:"681521"},{dept_code:"68",code:"68160",name:"CEPITA",postal:"682061"},{dept_code:"68",code:"68162",name:"CERRITO",postal:"681501"},{dept_code:"68",code:"68167",name:"CHARALA",postal:"682551"},{dept_code:"68",code:"68169",name:"CHARTA",postal:"680551"},{dept_code:"68",code:"68176",name:"CHIMA",postal:"683001"},{dept_code:"68",code:"68179",name:"CHIPATA",postal:"685557"},{dept_code:"68",code:"68190",name:"CIMITARRA",postal:"686041"},{dept_code:"68",code:"68207",name:"CONCEPCION",postal:"681511"},{dept_code:"68",code:"68209",name:"CONFINES",postal:"683531"},{dept_code:"68",code:"68211",name:"CONTRATACION",postal:"683071"},{dept_code:"68",code:"68217",name:"COROMORO",postal:"682531"},{dept_code:"68",code:"68229",name:"CURITI",postal:"682041"},{dept_code:"68",code:"68235",name:"EL CARMEN DE CHUCURI",postal:"686561"},{dept_code:"68",code:"68245",name:"EL GUACAMAYO",postal:"683061"},{dept_code:"68",code:"68250",name:"EL PENON",postal:"685027"},{dept_code:"68",code:"68255",name:"EL PLAYON",postal:"687501"},{dept_code:"68",code:"68264",name:"ENCINO",postal:"682541"},{dept_code:"68",code:"68266",name:"ENCISO",postal:"681561"},{dept_code:"68",code:"68271",name:"FLORIAN",postal:"684541"},{dept_code:"68",code:"68276",name:"FLORIDABLANCA",postal:"681007"},{dept_code:"68",code:"68296",name:"GALAN",postal:"684051"},{dept_code:"68",code:"68298",name:"GAMBITA",postal:"683031"},{dept_code:"68",code:"68307",name:"GIRON",postal:"687558"},{dept_code:"68",code:"68318",name:"GUACA",postal:"681031"},{dept_code:"68",code:"68320",name:"GUADALUPE",postal:"683051"},{dept_code:"68",code:"68322",name:"GUAPOTA",postal:"683017"},{dept_code:"68",code:"68324",name:"GUAVATA",postal:"684501"},{dept_code:"68",code:"68327",name:"GÜEPSA",postal:"685547"},{dept_code:"68",code:"68344",name:"HATO",postal:"683571"},{dept_code:"68",code:"68368",name:"JESUS MARIA",postal:"684551"},{dept_code:"68",code:"68370",name:"JORDAN",postal:"684011"},{dept_code:"68",code:"68377",name:"LA BELLEZA",postal:"685061"},{dept_code:"68",code:"68385",name:"LANDAZURI",postal:"686021"},{dept_code:"68",code:"68397",name:"LA PAZ",postal:"685511"},{dept_code:"68",code:"68406",name:"LEBRIJA",postal:"687571"},{dept_code:"68",code:"68418",name:"LOS SANTOS",postal:"684001"},{dept_code:"68",code:"68425",name:"MACARAVITA",postal:"681531"},{dept_code:"68",code:"68432",name:"MALAGA",postal:"682011"},{dept_code:"68",code:"68444",name:"MATANZA",postal:"680561"},{dept_code:"68",code:"68464",name:"MOGOTES",postal:"682501"},{dept_code:"68",code:"68468",name:"MOLAGAVITA",postal:"682031"},{dept_code:"68",code:"68498",name:"OCAMONTE",postal:"682567"},{dept_code:"68",code:"68500",name:"OIBA",postal:"683021"},{dept_code:"68",code:"68502",name:"ONZAGA",postal:"682521"},{dept_code:"68",code:"68522",name:"PALMAR",postal:"683581"},{dept_code:"68",code:"68524",name:"PALMAS DEL SOCORRO",postal:"683541"},{dept_code:"68",code:"68533",name:"PARAMO",postal:"683527"},{dept_code:"68",code:"68547",name:"PIEDECUESTA",postal:"681012"},{dept_code:"68",code:"68549",name:"PINCHOTE",postal:"683511"},{dept_code:"68",code:"68572",name:"PUENTE NACIONAL",postal:"684521"},{dept_code:"68",code:"68573",name:"PUERTO PARRA",postal:"686001"},{dept_code:"68",code:"68575",name:"PUERTO WILCHES",postal:"687061"},{dept_code:"68",code:"68615",name:"RIONEGRO",postal:"687511"},{dept_code:"68",code:"68655",name:"SABANA DE TORRES",postal:"687007"},{dept_code:"68",code:"68669",name:"SAN ANDRES",postal:"682001"},{dept_code:"68",code:"68673",name:"SAN BENITO",postal:"685531"},{dept_code:"68",code:"68679",name:"SAN GIL",postal:"684031"},{dept_code:"68",code:"68682",name:"SAN JOAQUIN",postal:"682511"},{dept_code:"68",code:"68684",name:"SAN JOSE DE MIRANDA",postal:"682021"},{dept_code:"68",code:"68686",name:"SAN MIGUEL",postal:"681551"},{dept_code:"68",code:"68689",name:"SAN VICENTE DE CHUCURI",postal:"686531"},{dept_code:"68",code:"68705",name:"SANTA BARBARA",postal:"681021"},{dept_code:"68",code:"68720",name:"SANTA HELENA DEL OPON",postal:"685501"},{dept_code:"68",code:"68745",name:"SIMACOTA",postal:"683561"},{dept_code:"68",code:"68755",name:"SOCORRO",postal:"683557"},{dept_code:"68",code:"68770",name:"SUAITA",postal:"683041"},{dept_code:"68",code:"68773",name:"SUCRE",postal:"685041"},{dept_code:"68",code:"68780",name:"SURATA",postal:"680501"},{dept_code:"68",code:"68820",name:"TONA",postal:"680541"},{dept_code:"68",code:"68855",name:"VALLE DE SAN JOSE",postal:"682571"},{dept_code:"68",code:"68861",name:"VELEZ",postal:"685561"},{dept_code:"68",code:"68867",name:"VETAS",postal:"680531"},{dept_code:"68",code:"68872",name:"VILLANUEVA",postal:"684021"},{dept_code:"68",code:"68895",name:"ZAPATOCA",postal:"684069"},{dept_code:"70",code:"70001",name:"SINCELEJO",postal:"700007"},{dept_code:"70",code:"70110",name:"BUENAVISTA",postal:"702030"},{dept_code:"70",code:"70124",name:"CAIMITO",postal:"704010"},{dept_code:"70",code:"70204",name:"COLOSO",postal:"707030"},{dept_code:"70",code:"70215",name:"COROZAL",postal:"705039"},{dept_code:"70",code:"70221",name:"COVENAS",postal:"706057"},{dept_code:"70",code:"70230",name:"CHALAN",postal:"701017"},{dept_code:"70",code:"70233",name:"EL ROBLE",postal:"705058"},{dept_code:"70",code:"70235",name:"GALERAS",postal:"702050"},{dept_code:"70",code:"70265",name:"GUARANDA",postal:"703070"},{dept_code:"70",code:"70400",name:"LA UNION",postal:"704057"},{dept_code:"70",code:"70418",name:"LOS PALMITOS",postal:"701050"},{dept_code:"70",code:"70429",name:"MAJAGUAL",postal:"703050"},{dept_code:"70",code:"70473",name:"MORROA",postal:"701078"},{dept_code:"70",code:"70508",name:"OVEJAS",postal:"701030"},{dept_code:"70",code:"70523",name:"PALMITO",postal:"706030"},{dept_code:"70",code:"70670",name:"SAMPUES",postal:"705079"},{dept_code:"70",code:"70678",name:"SAN BENITO ABAD",postal:"703010"},{dept_code:"70",code:"70702",name:"SAN JUAN DE BETULIA",postal:"705010"},{dept_code:"70",code:"70708",name:"SAN MARCOS",postal:"704037"},{dept_code:"70",code:"70713",name:"SAN ONOFRE",postal:"707018"},{dept_code:"70",code:"70717",name:"SAN PEDRO",postal:"702010"},{dept_code:"70",code:"70742",name:"SAN LUIS DE SINCE",postal:"702070"},{dept_code:"70",code:"70771",name:"SUCRE",postal:"703030"},{dept_code:"70",code:"70820",name:"SANTIAGO DE TOLU",postal:"706018"},{dept_code:"70",code:"70823",name:"TOLU VIEJO",postal:"707050"},{dept_code:"73",code:"73001",name:"IBAGUE",postal:"730010"},{dept_code:"73",code:"73024",name:"ALPUJARRA",postal:"734560"},{dept_code:"73",code:"73026",name:"ALVARADO",postal:"730527"},{dept_code:"73",code:"73030",name:"AMBALEMA",postal:"731001"},{dept_code:"73",code:"73043",name:"ANZOATEGUI",postal:"730540"},{dept_code:"73",code:"73055",name:"ARMERO",postal:"732060"},{dept_code:"73",code:"73067",name:"ATACO",postal:"735050"},{dept_code:"73",code:"73124",name:"CAJAMARCA",postal:"732507"},{dept_code:"73",code:"73148",name:"CARMEN DE APICALA",postal:"733590"},{dept_code:"73",code:"73152",name:"CASABIANCA",postal:"731520"},{dept_code:"73",code:"73168",name:"CHAPARRAL",postal:"735569"},{dept_code:"73",code:"73200",name:"COELLO",postal:"733501"},{dept_code:"73",code:"73217",name:"COYAIMA",postal:"735020"},{dept_code:"73",code:"73226",name:"CUNDAY",postal:"734040"},{dept_code:"73",code:"73236",name:"DOLORES",postal:"734540"},{dept_code:"73",code:"73268",name:"ESPINAL",postal:"733529"},{dept_code:"73",code:"73270",name:"FALAN",postal:"732001"},{dept_code:"73",code:"73275",name:"FLANDES",postal:"733510"},{dept_code:"73",code:"73283",name:"FRESNO",postal:"731560"},{dept_code:"73",code:"73319",name:"GUAMO",postal:"733549"},{dept_code:"73",code:"73347",name:"HERVEO",postal:"731540"},{dept_code:"73",code:"73349",name:"HONDA",postal:"732040"},{dept_code:"73",code:"73352",name:"ICONONZO",postal:"734028"},{dept_code:"73",code:"73408",name:"LERIDA",postal:"731020"},{dept_code:"73",code:"73411",name:"LIBANO",postal:"731048"},{dept_code:"73",code:"73443",name:"SAN SEBASTIAN DE MARIQUITA",postal:"732020"},{dept_code:"73",code:"73449",name:"MELGAR",postal:"734001"},{dept_code:"73",code:"73461",name:"MURILLO",postal:"731060"},{dept_code:"73",code:"73483",name:"NATAGAIMA",postal:"735001"},{dept_code:"73",code:"73504",name:"ORTEGA",postal:"735501"},{dept_code:"73",code:"73520",name:"PALOCABILDO",postal:"731580"},{dept_code:"73",code:"73547",name:"PIEDRAS",postal:"730501"},{dept_code:"73",code:"73555",name:"PLANADAS",postal:"735070"},{dept_code:"73",code:"73563",name:"PRADO",postal:"734520"},{dept_code:"73",code:"73585",name:"PURIFICACION",postal:"734501"},{dept_code:"73",code:"73616",name:"RIOBLANCO",postal:"735580"},{dept_code:"73",code:"73622",name:"RONCESVALLES",postal:"735550"},{dept_code:"73",code:"73624",name:"ROVIRA",postal:"733040"},{dept_code:"73",code:"73671",name:"SALDANA",postal:"733578"},{dept_code:"73",code:"73675",name:"SAN ANTONIO",postal:"735530"},{dept_code:"73",code:"73678",name:"SAN LUIS",postal:"733001"},{dept_code:"73",code:"73686",name:"SANTA ISABEL",postal:"730560"},{dept_code:"73",code:"73770",name:"SUAREZ",postal:"733580"},{dept_code:"73",code:"73854",name:"VALLE DE SAN JUAN",postal:"733020"},{dept_code:"73",code:"73861",name:"VENADILLO",postal:"730580"},{dept_code:"73",code:"73870",name:"VILLAHERMOSA",postal:"731501"},{dept_code:"73",code:"73873",name:"VILLARRICA",postal:"734060"},{dept_code:"76",code:"76001",name:"CALI",postal:"760044"},{dept_code:"76",code:"76020",name:"ALCALA",postal:"762040"},{dept_code:"76",code:"76036",name:"ANDALUCIA",postal:"763010"},{dept_code:"76",code:"76041",name:"ANSERMANUEVO",postal:"762018"},{dept_code:"76",code:"76054",name:"ARGELIA",postal:"761510"},{dept_code:"76",code:"76100",name:"BOLIVAR",postal:"761001"},{dept_code:"76",code:"76109",name:"BUENAVENTURA",postal:"764501"},{dept_code:"76",code:"76111",name:"GUADALAJARA DE BUGA",postal:"763047"},{dept_code:"76",code:"76113",name:"BUGALAGRANDE",postal:"763008"},{dept_code:"76",code:"76122",name:"CAICEDONIA",postal:"762547"},{dept_code:"76",code:"76126",name:"CALIMA",postal:"760537"},{dept_code:"76",code:"76130",name:"CANDELARIA",postal:"763570"},{dept_code:"76",code:"76147",name:"CARTAGO",postal:"762021"},{dept_code:"76",code:"76233",name:"DAGUA",postal:"760520"},{dept_code:"76",code:"76243",name:"EL AGUILA",postal:"762001"},{dept_code:"76",code:"76246",name:"EL CAIRO",postal:"761501"},{dept_code:"76",code:"76248",name:"EL CERRITO",postal:"763520"},{dept_code:"76",code:"76250",name:"EL DOVIO",postal:"761560"},{dept_code:"76",code:"76275",name:"FLORIDA",postal:"763568"},{dept_code:"76",code:"76306",name:"GINEBRA",postal:"763517"},{dept_code:"76",code:"76318",name:"GUACARI",postal:"763501"},{dept_code:"76",code:"76364",name:"JAMUNDI",postal:"764001"},{dept_code:"76",code:"76377",name:"LA CUMBRE",postal:"760510"},{dept_code:"76",code:"76400",name:"LA UNION",postal:"761548"},{dept_code:"76",code:"76403",name:"LA VICTORIA",postal:"762510"},{dept_code:"76",code:"76497",name:"OBANDO",postal:"762501"},{dept_code:"76",code:"76520",name:"PALMIRA",postal:"763537"},{dept_code:"76",code:"76563",name:"PRADERA",postal:"763558"},{dept_code:"76",code:"76606",name:"RESTREPO",postal:"760540"},{dept_code:"76",code:"76616",name:"RIOFRIO",postal:"761030"},{dept_code:"76",code:"76622",name:"ROLDANILLO",postal:"761558"},{dept_code:"76",code:"76670",name:"SAN PEDRO",postal:"763030"},{dept_code:"76",code:"76736",name:"SEVILLA",postal:"762538"},{dept_code:"76",code:"76823",name:"TORO",postal:"761520"},{dept_code:"76",code:"76828",name:"TRUJILLO",postal:"761020"},{dept_code:"76",code:"76834",name:"TULUA",postal:"763029"},{dept_code:"76",code:"76845",name:"ULLOA",postal:"762030"},{dept_code:"76",code:"76863",name:"VERSALLES",postal:"761537"},{dept_code:"76",code:"76869",name:"VIJES",postal:"760550"},{dept_code:"76",code:"76890",name:"YOTOCO",postal:"761040"},{dept_code:"76",code:"76892",name:"YUMBO",postal:"760507"},{dept_code:"76",code:"76895",name:"ZARZAL",postal:"762527"},{dept_code:"97",code:"97001",name:"MITU",postal:"970001"},{dept_code:"97",code:"97161",name:"CARURU",postal:"973001"},{dept_code:"97",code:"97511",name:"PACOA",postal:"972007"},{dept_code:"97",code:"97666",name:"TARAIRA",postal:"972040"},{dept_code:"97",code:"97777",name:"PAPUNAUA",postal:"973047"},{dept_code:"97",code:"97889",name:"YAVARATE",postal:"971007"},{dept_code:"99",code:"99001",name:"PUERTO CARRENO",postal:"990001"},{dept_code:"99",code:"99524",name:"LA PRIMAVERA",postal:"992001"},{dept_code:"99",code:"99624",name:"SANTA ROSALIA",postal:"992050"},{dept_code:"99",code:"99773",name:"CUMARIBO",postal:"991001"}];function hc(e){return Eo.filter(t=>t.dept_code===e)}function yc(e){return As.find(t=>t.code===e)}function _c(e){return xs.find(t=>t.code===e)}function xc(e){return Eo.find(t=>t.code===e)}window.geoMunisByDept=hc;window.geoDept=yc;window.GEO_PAISES=xs;window.GEO_MUNIS=Eo;window.GEO_DEPTS=As;window.geoMuni=xc;window.geoPais=_c;const we=e=>document.querySelector(e),$s=e=>[...document.querySelectorAll(e)],Ya=document.createElement("div");function Na(e){return Ya.textContent=String(e??""),Ya.innerHTML}const ws=new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}),Es=new Intl.NumberFormat("es-CO");function Ac(e){return ws.format(e??0)}function $c(e){return Es.format(e??0)}function wc(e){return parseFloat(String(e??"").replace(/[^0-9.\-]/g,""))||0}function Cs(){return new Date().toISOString().slice(0,10)}function Ec(){return new Date().toISOString().slice(0,19).replace("T"," ")}function Cc(e){return e?new Date(e).toLocaleDateString("es-CO",{day:"2-digit",month:"2-digit",year:"numeric"}):"—"}const Ja={success:"fa-check-circle",error:"fa-times-circle",warning:"fa-exclamation-triangle",info:"fa-info-circle"};function Tc(e,t="success",a=3500){const o=we("#toast-container");if(!o)return;const s=document.createElement("div");s.className=`toast toast-${t} toast-enter`,s.innerHTML=`<i class="fas ${Ja[t]??Ja.info}"></i><span>${Na(e)}</span>`,o.appendChild(s),setTimeout(()=>{s.style.cssText="opacity:0;transform:translateX(100%);transition:all .3s",setTimeout(()=>s.remove(),300)},a)}function Ts(e,t,a="",o=!1){we("#modal-title").innerHTML=e,we("#modal-body").innerHTML=t,we("#modal-footer").innerHTML=a,we("#modal-box").classList.toggle("wide",o),we("#modal-overlay").classList.add("show")}function Is(){we("#modal-overlay").classList.remove("show"),we("#modal-body").innerHTML="",we("#modal-footer").innerHTML=""}let Kt=null;function Ic(e,t){var i;const a=t==="edit"?typeof TX_EDIT_STATE<"u"?TX_EDIT_STATE:null:typeof TX_STATE<"u"?TX_STATE:null;if(!a)return;const o=((i=a.lines[e])==null?void 0:i.description)||"";Kt={lineIdx:e,ctx:t};const s=document.getElementById("line-comment-textarea");s&&(s.value=o);const n=document.getElementById("line-comment-overlay");n&&(n.style.display="flex",setTimeout(()=>s==null?void 0:s.focus(),50))}function fa(){Kt=null;const e=document.getElementById("line-comment-overlay");e&&(e.style.display="none")}function Sc(){var s;if(!Kt)return fa();const{lineIdx:e,ctx:t}=Kt,a=(((s=document.getElementById("line-comment-textarea"))==null?void 0:s.value)||"").trim(),o=t==="edit"?typeof TX_EDIT_STATE<"u"?TX_EDIT_STATE:null:typeof TX_STATE<"u"?TX_STATE:null;o&&o.lines[e]!==void 0?(o.lines[e].description=a,fa(),t==="edit"&&typeof renderEditTxLines=="function"?renderEditTxLines(!1):typeof renderTxLines=="function"&&renderTxLines(!1)):fa()}function Nc(e,t,a,o=!0){Ts(e,`<p class="text-sm" style="color:#374151">${Na(t)}</p>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn ${o?"btn-danger":"btn-primary"}" id="modal-confirm-btn">Confirmar</button>`),setTimeout(()=>{const s=we("#modal-confirm-btn");s&&s.addEventListener("click",()=>{Is(),a()})},50)}function Lc(e,t,a=null,o=""){const s=t.toLowerCase();$s(`#${e} tbody tr`).forEach(n=>{const i=!s||n.textContent.toLowerCase().includes(s),c=!o||(n.dataset[a]??"")===o;n.style.display=i&&c?"":"none"})}function Pc(e,t,a,o){const s=we(`#${e}`);if(!s||t<=1){s&&(s.innerHTML="");return}let n='<div class="pagination justify-end mt-4">';n+=`<button class="page-btn" onclick="(${o.toString()})(${a-1})" ${a<=1?"disabled":""}><i class="fas fa-chevron-left text-xs"></i></button>`;const i=[];for(let c=1;c<=t;c++)c===1||c===t||Math.abs(c-a)<=2?i.push(c):i[i.length-1]!=="…"&&i.push("…");i.forEach(c=>{c==="…"?n+='<span class="page-btn" style="cursor:default">…</span>':n+=`<button class="page-btn ${c===a?"active":""}" onclick="(${o.toString()})(${c})">${c}</button>`}),n+=`<button class="page-btn" onclick="(${o.toString()})(${a+1})" ${a>=t?"disabled":""}><i class="fas fa-chevron-right text-xs"></i></button>`,n+="</div>",s.innerHTML=n}function Fc(e,t=300){let a;return(...o)=>{clearTimeout(a),a=setTimeout(()=>e(...o),t)}}const Dc=[{code:"NIT",name:"NIT"},{code:"CC",name:"Cédula de Ciudadanía"},{code:"CE",name:"Cédula de Extranjería"},{code:"TI",name:"Tarjeta de Identidad"},{code:"PAS",name:"Pasaporte"},{code:"RC",name:"Registro Civil"}],Rc=[{code:"COMUN",name:"Régimen Común"},{code:"SIMPLIFICADO",name:"Régimen Simplificado"},{code:"NO_RESP",name:"No Responsable IVA"},{code:"GRAN_CONTR",name:"Gran Contribuyente"}],Oc=[{code:"NATURAL",name:"Persona Natural"},{code:"JURIDICA",name:"Persona Jurídica"},{code:"GRAN_CONTRIBUYENTE",name:"Gran Contribuyente"}],kc=[{code:"CLIENTE",name:"Cliente"},{code:"PROVEEDOR",name:"Proveedor"},{code:"EMPLEADO",name:"Empleado"},{code:"PROPIETARIO",name:"Propietario"},{code:"ACREEDOR",name:"Acreedor"},{code:"TRANSPORTISTA",name:"Transportista"},{code:"OTRO",name:"Otro"}],Bc=typeof GEO_DEPTS<"u"?GEO_DEPTS:[],Ss=[3,7,13,17,19,23,29,37,41,43,47,53,59,67,71];function Mc(e){const t=String(e).replace(/\D/g,"");if(!t)return"";let a=0;for(let s=0;s<t.length;s++)a+=+t[t.length-1-s]*Ss[s];const o=a%11;return String(o<2?o:11-o)}const Uc=["Factura de Venta","Factura de Compra","Recibo de Caja","Comprobante de Egreso","Nota Crédito","Nota Débito","Orden de Compra","Contrato","Otro"],Vc=["Causar","Recaudar","Reportar Cartera"],Co={admin:{label:"Administrador",badge:"badge-orange"},contador:{label:"Contador",badge:"badge-blue"},auxiliar:{label:"Auxiliar",badge:"badge-green"},auditor:{label:"Auditor",badge:"badge-gray"},viewer:{label:"Visualizador",badge:"badge-gray"}};function Ns(e){var t;return((t=Co[e])==null?void 0:t.label)??e}function jc(e){var t;return`<span class="badge ${((t=Co[e])==null?void 0:t.badge)??"badge-gray"}">${Na(Ns(e))}</span>`}function Hc(e,t,a){const o=XLSX.utils.json_to_sheet(e.map(n=>Object.fromEntries(t.map((i,c)=>[i.label,n[i.key]])))),s=XLSX.utils.book_new();XLSX.utils.book_append_sheet(s,o,"Datos"),XLSX.writeFile(s,`${a}_${Cs()}.xlsx`)}function Gc(e){var t;return(((t=we(`#${e}`))==null?void 0:t.value)??"").trim()}function qc(e){var t;return!!((t=we(`#${e}`))!=null&&t.checked)}function zc(e){var t;return((t=we(`#${e}`))==null?void 0:t.value)??""}function Wc(e,t){const a=we(`#${e}`);a&&(a.value=t??"")}window.getCheckVal=qc;window._lineCommentState=Kt;window.fmt=Ac;window.exportToExcel=Hc;window.getSelectVal=zc;window._fmtCOP=ws;window.esc=Na;window.$=we;window.fmtDate=Cc;window.calcDV=Mc;window.nowStr=Ec;window.closeModal=Is;window.renderPagination=Pc;window.debounce=Fc;window.CROSS_PURPOSES=Vc;window.confirmDialog=Nc;window.DOC_TYPES=Dc;window.$$=$s;window.CROSS_DOC_TYPES=Uc;window.COL_DEPTS=Bc;window.getInputVal=Gc;window.openModal=Ts;window.TOAST_ICONS=Ja;window.TAX_REGIMES=Rc;window.filterTable=Lc;window.openLineComment=Ic;window.PERSON_TYPES=Oc;window._NIT_FACTORS=Ss;window.roleLabel=Ns;window.saveLineComment=Sc;window.fmtN=$c;window.closeLineComment=fa;window.TP_TYPES=kc;window.showToast=Tc;window.setInputVal=Wc;window.ROLES=Co;window.todayStr=Cs;window.roleBadge=jc;window.parseNum=wc;window._escDiv=Ya;window._fmtNum=Es;const ke=window.location.origin,O={_token:null,_user:null,get authToken(){return this._token??localStorage.getItem("pb_token")},set authToken(e){this._token=e,e?localStorage.setItem("pb_token",e):localStorage.removeItem("pb_token")},get currentUser(){if(this._user)return this._user;try{return JSON.parse(localStorage.getItem("pb_user")??"null")}catch{return localStorage.removeItem("pb_user"),null}},set currentUser(e){this._user=e,e?localStorage.setItem("pb_user",JSON.stringify(e)):localStorage.removeItem("pb_user")},escapeFilterValue(e){return String(e??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," ").trim()},headers(){const e={"Content-Type":"application/json"};return this.authToken&&(e.Authorization=`Bearer ${this.authToken}`),e},async list(e,{filter:t="",sort:a="",page:o=1,perPage:s=200,expand:n=""}={}){const i=new URLSearchParams({page:o,perPage:s});t&&i.set("filter",t),a&&i.set("sort",a),n&&i.set("expand",n);const c=await fetch(`${ke}/api/collections/${e}/records?${i}`,{headers:this.headers()});if(!c.ok)throw await this._err(c);return c.json()},async listAll(e,t={}){let a=1;const o=[];for(;;){const s=await this.list(e,{...t,page:a,perPage:200});if(o.push(...s.items),a>=s.totalPages)break;a++}return o},async get(e,t,{expand:a=""}={}){const o=a?`?expand=${encodeURIComponent(a)}`:"",s=await fetch(`${ke}/api/collections/${e}/records/${t}${o}`,{headers:this.headers()});if(!s.ok)throw await this._err(s);return s.json()},async create(e,t){const a=await fetch(`${ke}/api/collections/${e}/records`,{method:"POST",headers:this.headers(),body:JSON.stringify(t)});if(!a.ok)throw await this._err(a);return a.json()},async update(e,t,a){const o=await fetch(`${ke}/api/collections/${e}/records/${t}`,{method:"PATCH",headers:this.headers(),body:JSON.stringify(a)});if(!o.ok)throw await this._err(o);return o.json()},async delete(e,t){const a=await fetch(`${ke}/api/collections/${e}/records/${t}`,{method:"DELETE",headers:this.headers()});if(!a.ok&&a.status!==204)throw await this._err(a);return!0},async authWithPassword(e,t){const a=await fetch(`${ke}/api/collections/users/auth-with-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identity:e,password:t})});if(!a.ok)throw await this._err(a);const o=await a.json();return this.authToken=o.token,this.currentUser=o.record,o},async authRefresh(){if(!this.authToken)return null;const e=await fetch(`${ke}/api/collections/users/auth-refresh`,{method:"POST",headers:this.headers()});if(!e.ok)return this.authToken=null,this.currentUser=null,null;const t=await e.json();return this.authToken=t.token,this.currentUser=t.record,t},logout(){this.authToken=null,this.currentUser=null},async ping(){try{return(await fetch(`${ke}/api/health`,{signal:AbortSignal.timeout(3e3)})).ok}catch{return!1}},async _err(e){var n,i;let t={};try{t=await e.json()}catch{t={message:e.statusText}}const a=t!=null&&t.data&&typeof t.data=="object"?Object.values(t.data).map(c=>c==null?void 0:c.message).filter(Boolean):[],o=(t==null?void 0:t.message)??((i=(n=t==null?void 0:t.data)==null?void 0:n.identity)==null?void 0:i.message)??a[0]??"Error desconocido",s=new Error(o);return s.status=e.status,s.data=t,s}},Yc={async getSetting(e){var t;try{const a=O.escapeFilterValue(e);return((t=(await O.list("settings",{filter:`key="${a}"`,perPage:1})).items[0])==null?void 0:t.value)??""}catch{return""}},async setSetting(e,t){try{const a=O.escapeFilterValue(e),o=await O.list("settings",{filter:`key="${a}"`,perPage:1});return o.items.length?await O.update("settings",o.items[0].id,{value:t}):await O.create("settings",{key:e,value:t})}catch(a){const o=String((a==null?void 0:a.message)||"").toLowerCase();throw(a==null?void 0:a.status)===400||(a==null?void 0:a.status)===403||o.includes("allowed")||o.includes("permission")?new Error("No tienes permisos para modificar configuración global."):a}},async logAudit(e,t,a=null,o=""){try{if(!O.authToken)return;await fetch(`${ke}/api/audit-event`,{method:"POST",headers:O.headers(),body:JSON.stringify({action:String(e||""),entity:String(t||""),entity_id:a?String(a):"",details:String(o||"")})})}catch{}},async getAuditLogs(e={}){const{entity:t="",entityId:a="",actions:o=[],sort:s="-event_at",limit:n=100}=e,i=[];if(t&&i.push(`entity="${O.escapeFilterValue(t)}"`),a&&i.push(`entity_id="${O.escapeFilterValue(a)}"`),Array.isArray(o)&&o.length){const c=o.map(r=>`action="${O.escapeFilterValue(r)}"`).join(" || ");i.push(`(${c})`)}return O.listAll("audit_log",{filter:i.join(" && ")||"",sort:s,perPage:Math.max(1,Math.min(200,Number(n)||100))})},async getAccounts(e=!0){const t=e?"active=true":"";return O.listAll("accounts",{filter:t,sort:"code",expand:"account_type_id"})},async getAccountSaldos(){const e=await O.listAll("tx_lines",{expand:"tx_id",filter:'tx_id.status="active"'}),t={};for(const a of e)t[a.account_id]||(t[a.account_id]=0),t[a.account_id]+=(a.debit??0)-(a.credit??0);return t},async getTerceros(e={}){const{type:t="",query:a=""}=e;let o="active=true";if(t){const s=O.escapeFilterValue(t);o+=` && type="${s}"`}if(a){const s=O.escapeFilterValue(a);o+=` && (name~"${s}" || doc_number~"${s}")`}return O.listAll("third_parties",{filter:o,sort:"name"})},async getTxTypes(){return O.listAll("transaction_types",{filter:"active=true",sort:"code"})},async nextConsecutive(e){const a=((await O.get("transaction_types",e)).consecutive??0)+1;return await O.update("transaction_types",e,{consecutive:a}),String(a).padStart(8,"0")},async createTransaction(e,t){const a=await O.create("transactions",{...e,number:e.number||"AUTO",status:e.status||"active"});try{for(const o of t)await O.create("tx_lines",{tx_id:a.id,...o})}catch(o){try{await O.delete("transactions",a.id)}catch{}throw o}return a},async getTransactions(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-id"}=e;try{return await O.list("transactions",{page:t,perPage:a,filter:o,sort:s,expand:"tx_type_id,third_party_id,user_id"})}catch(n){if(s!=="-id")return O.list("transactions",{page:t,perPage:a,filter:o,sort:"-id",expand:"tx_type_id,third_party_id,user_id"});throw n}},async getTxLines(e){return O.listAll("tx_lines",{filter:`tx_id="${e}"`,sort:"line_order",expand:"account_id,third_party_id"})},async voidTransaction(e,t=""){const a=await O.get("transactions",e);return a.status==="voided"||(await O.update("transactions",e,{status:"voided"}),await this.logAudit("VOID","transactions",e,t||`Transacción ${a.number} anulada`)),a},async approveTx(e){const t=await O.get("transactions",e);if(t.status!=="draft")throw new Error("Solo se pueden aprobar transacciones en estado Borrador.");return await O.update("transactions",e,{status:"active"}),await this.logAudit("APPROVE","transactions",e,`Transacción ${t.number} aprobada`),t},async revertTxToDraft(e){const t=await O.get("transactions",e);if(t.status!=="active")throw new Error("Solo se pueden revertir transacciones Activas a Borrador.");return await O.update("transactions",e,{status:"draft"}),await this.logAudit("REVERT_DRAFT","transactions",e,`Transacción ${t.number} revertida a Borrador`),t},async updateTransaction(e,t,a){await O.update("transactions",e,t);const o=O.escapeFilterValue(e),s=await O.listAll("tx_lines",{filter:`tx_id="${o}"`});for(const n of s)await O.delete("tx_lines",n.id);for(const n of a)await O.create("tx_lines",{tx_id:e,...n});await this.logAudit("UPDATE","transactions",e,"Modificación desde consulta de transacciones")},async checkTxDependencies(e){const t=O.escapeFilterValue(e),a=[],o=[],s=await O.list("einvoice_docs",{filter:`tx_id="${t}" && (status="enviada" || status="aceptada")`,perPage:1});if(s.totalItems>0){const l=s.items[0].status==="aceptada"?"Aceptada por DIAN":"Enviada a DIAN";a.push(`Este comprobante tiene un documento electrónico DIAN con estado "${l}". Los documentos fiscales ya transmitidos son inalterables por normativa tributaria.`)}const n=await O.list("payroll_periods",{filter:`tx_id="${t}"`,perPage:1});if(n.totalItems>0){const r=n.items[0],l={draft:"Borrador",approved:"Aprobado",paid:"Pagado"}[r.status]||r.status;o.push(`Este comprobante es el asiento de nómina del período "${r.name}" (${l}). Si lo modificas, el asiento contable de nómina quedará desincronizado con las liquidaciones.`)}const i=await O.listAll("tx_lines",{filter:`tx_id="${t}"`});let c=0;if(i.length>0){const r=i.map(p=>`tx_line_id="${O.escapeFilterValue(p.id)}"`).join(" || ");c=(await O.list("bank_movements",{filter:`(${r}) && reconciled=true`,perPage:1})).totalItems}return c>0&&o.push(`Tiene ${c} movimiento(s) bancario(s) conciliado(s). Revisa la conciliación bancaria después de modificar.`),{blocks:a,warnings:o}},async getProducts(e={}){const{activeOnly:t=!0,query:a="",type:o=""}=e;let s=t?"active=true":"";if(o){const n=O.escapeFilterValue(o);s+=(s?" && ":"")+`type="${n}"`}if(a){const n=O.escapeFilterValue(a);s+=(s?" && ":"")+`(name~"${n}" || code~"${n}")`}return O.listAll("products",{filter:s,sort:"code",expand:"income_account_id,cost_account_id,inventory_account_id"})},async getDashboardKpis(){const[e,t,a]=await Promise.all([O.list("transactions",{perPage:1}),O.list("third_parties",{filter:"active=true",perPage:1}),O.list("accounts",{filter:"active=true",perPage:1})]);return{totalTx:e.totalItems,totalTp:t.totalItems,totalAc:a.totalItems}},async getWarehouses(e=!0){const t=e?"active=true":"";return O.listAll("warehouses",{filter:t,sort:"code"})},async getInventoryStock(e={}){const{warehouseId:t="",productId:a=""}=e;let o="";return t&&(o+=`warehouse_id="${O.escapeFilterValue(t)}"`),a&&(o+=(o?" && ":"")+`product_id="${O.escapeFilterValue(a)}"`),O.listAll("inventory_stock",{filter:o,sort:"product_id",expand:"product_id,warehouse_id"})},async upsertStock(e,t,a,o=null,s=""){const n=O.escapeFilterValue(e),i=O.escapeFilterValue(t),c=await O.list("inventory_stock",{filter:`product_id="${n}" && warehouse_id="${i}"`,perPage:1}),r=s||new Date().toISOString().slice(0,10);if(c.items.length){const l=c.items[0],p=Math.max(0,(l.qty_on_hand??0)+a),m=o!==null?o:l.avg_cost??0;await O.update("inventory_stock",l.id,{qty_on_hand:p,avg_cost:m,last_mov_date:r})}else await O.create("inventory_stock",{product_id:e,warehouse_id:t,qty_on_hand:Math.max(0,a),avg_cost:o??0,last_mov_date:r});o!==null&&o>0&&await O.update("products",e,{cost_price:o})},async getInventoryMovements(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return O.list("inventory_movements",{page:t,perPage:a,filter:o,sort:s,expand:"warehouse_id,dest_warehouse_id,third_party_id"})},async getInventoryMovementLines(e){const t=O.escapeFilterValue(e);return O.listAll("inventory_movement_lines",{filter:`movement_id="${t}"`,sort:"line_order",expand:"product_id"})},async applyInventoryMovement(e){const t=await O.get("inventory_movements",e,{expand:"warehouse_id,dest_warehouse_id"});if(t.status==="applied")throw new Error("El movimiento ya fue aplicado.");if(t.status==="voided")throw new Error("El movimiento está anulado.");const a=await this.getInventoryMovementLines(e);if(!a.length)throw new Error("El movimiento no tiene líneas.");const o=t.date||new Date().toISOString().slice(0,10),s=t.mov_type==="ENTRADA"||t.mov_type==="AJUSTE_POSITIVO",n=t.mov_type==="SALIDA"||t.mov_type==="AJUSTE_NEGATIVO",i=t.mov_type==="TRASLADO";for(const c of a){const r=s?c.qty:n?-c.qty:0;i?(await this.upsertStock(c.product_id,t.warehouse_id,-c.qty,null,o),await this.upsertStock(c.product_id,t.dest_warehouse_id,c.qty,null,o)):await this.upsertStock(c.product_id,t.warehouse_id,r,c.unit_cost??null,o)}return await O.update("inventory_movements",e,{status:"applied"}),await this.logAudit("APPLY","InventoryMovement",e,`${t.mov_type} — ${t.number}`),t},async voidInventoryMovement(e,t=""){const a=await O.get("inventory_movements",e);if(a.status!=="applied")throw new Error("Solo se pueden anular movimientos ya aplicados.");const o=await this.getInventoryMovementLines(e),s=new Date().toISOString().slice(0,10),n=a.mov_type==="ENTRADA"||a.mov_type==="AJUSTE_POSITIVO",i=a.mov_type==="SALIDA"||a.mov_type==="AJUSTE_NEGATIVO",c=a.mov_type==="TRASLADO";for(const r of o){const l=n?-r.qty:i?r.qty:0;c?(await this.upsertStock(r.product_id,a.warehouse_id,r.qty,null,s),await this.upsertStock(r.product_id,a.dest_warehouse_id,-r.qty,null,s)):await this.upsertStock(r.product_id,a.warehouse_id,l,null,s)}await O.update("inventory_movements",e,{status:"voided"}),await this.logAudit("VOID","InventoryMovement",e,`Anulación ${a.mov_type} — ${a.number}${t?` | Motivo: ${t}`:""}`)},async getPurchaseInvoices(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return O.list("purchase_invoices",{page:t,perPage:a,filter:o,sort:s,expand:"supplier_id,warehouse_id,tx_type_id"})},async getPurchaseInvoiceLines(e){const t=O.escapeFilterValue(e);return O.listAll("purchase_invoice_lines",{filter:`invoice_id="${t}"`,sort:"line_order",expand:"product_id,account_id"})},async createPurchaseInvoice(e,t){const a=String((e==null?void 0:e.tx_type_id)||"").trim(),o=String((e==null?void 0:e.tx_number)||"").trim();if(!a)throw new Error("Debes seleccionar el tipo de comprobante contable en la compra.");if(!o)throw new Error("Debes definir la numeración del comprobante contable en la compra.");let s=0,n=0,i=0;for(const p of t)s+=p.subtotal||0,n+=p.iva_amount||0,i+=p.ret_amount||0;const c=s+n-i,r=await O.create("purchase_invoices",{...e,subtotal:s,iva_total:n,total:c,ret_total:i,payable_total:c,status:"draft"});(!r.tx_type_id||!r.tx_number)&&await O.update("purchase_invoices",r.id,{tx_type_id:a,tx_number:o});const l=await O.get("purchase_invoices",r.id);if(!l.tx_type_id||!l.tx_number)throw new Error("No se pudo persistir el comprobante contable de la compra. Reinicia PocketBase para aplicar migraciones y vuelve a intentar.");for(let p=0;p<t.length;p++)await O.create("purchase_invoice_lines",{invoice_id:r.id,line_order:p+1,...t[p]});return await this.logAudit("CREATE","PurchaseInvoice",r.id,`Factura compra ${r.number}`),l},async postPurchaseInvoice(e){var B,M,k,j,Y,W,K;const t=await O.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id,tx_type_id"});if(t.status==="posted")throw new Error("La factura ya fue contabilizada.");if(t.status==="voided")throw new Error("La factura está anulada.");const a=await this.getPurchaseInvoiceLines(e);if(!a.length)throw new Error("La factura no tiene líneas.");let o={};try{const H=await this.getSetting("purchase_config_v1");o=H?JSON.parse(H):{}}catch{o={}}const s=(o==null?void 0:o.accounting)||{},n=(s==null?void 0:s.accounts)||{},i=Array.isArray(s==null?void 0:s.withholding_rules)?s.withholding_rules:[],c=String(n.payable_code||"220505").trim(),r=String(n.expense_fallback_code||"5135").trim(),l=n.iva_by_rate&&typeof n.iva_by_rate=="object"?n.iva_by_rate:{},p={},m={},f=async H=>{const x=String(H||"").trim();if(!x)throw new Error("Cuenta contable inválida en la compra.");return p[x]||(p[x]=await O.get("accounts",x)),p[x]},d=async H=>{if(!String(H||"").trim())throw new Error("Hay una cuenta sin código en la configuración de compras.");const x=String(H).trim();if(m[x])return m[x];const P=O.escapeFilterValue(x),V=await O.list("accounts",{filter:`code="${P}"`,perPage:1});if(!V.items.length)throw new Error(`Cuenta ${x} no encontrada en el plan de cuentas.`);return m[x]=V.items[0],p[V.items[0].id]=V.items[0],V.items[0]},g=async({accountId:H,thirdPartyId:x=null,debit:P=0,credit:V=0,description:U="",crossDocRef:z=""})=>{const J=await f(H),te={account_id:J.id,third_party_id:x,debit:P,credit:V,description:U,line_order:b.length+1};return J.maneja_cruce&&String(z||"").trim()&&(te.cross_doc_ref=String(z||"").trim()),te},u=await d(c),y=await d(r),v={},b=[],h=[],_={},A={};for(const H of a){const x=(B=H.expand)==null?void 0:B.product_id;let P;if(x){if(P=x.type==="BIEN"?x.inventory_account_id:x.cost_account_id||y.id,x.type==="BIEN"&&!P)throw new Error(`El producto ${x.code||""} ${x.name||""} no tiene cuenta de inventario asignada.`.trim())}else{if(!H.account_id)throw new Error(`Línea sin cuenta contable: "${H.description||"?"}"`);P=H.account_id}b.push(await g({accountId:P,thirdPartyId:t.supplier_id,debit:H.subtotal||0,credit:0,description:H.description||((k=(M=t.expand)==null?void 0:M.supplier_id)==null?void 0:k.name)||"",crossDocRef:t.supplier_ref||""})),(x==null?void 0:x.type)==="BIEN"&&h.push({product_id:H.product_id,qty:H.qty,unit_cost:H.unit_price,notes:H.description});const V=String(Number(H.iva_rate||0)),U=Number(H.iva_amount||0);U>0&&(_[V]=(_[V]||0)+U);let z=Number(H.ret_amount||0),J=String(H.ret_account_code||"").trim();if(z<=0&&H.ret_rule_id){const te=i.find(F=>String(F.id||"")===String(H.ret_rule_id||""));if(te){const F=String(H.ret_base_type||te.base_type||"SUBTOTAL").toUpperCase(),D=Number(te.min_base||0)||0,q=Number(H.subtotal||0),G=Number(H.iva_amount||0),ee=Number(H.total||q+G),X=F==="IVA"?G:F==="TOTAL"?ee:q,ne=Number(H.ret_rate||te.rate||0)||0;X>=D&&ne>0&&(z=X*ne/100,J||(J=String(te.account_code||"").trim()))}}if(z>0){if(!J)throw new Error(`La línea "${H.description||"?"}" tiene retención sin cuenta contable configurada.`);A[J]=(A[J]||0)+z}}{const H=a.reduce((U,z)=>U+Number(z.subtotal||0),0),x=a.reduce((U,z)=>U+Number(z.iva_amount||0),0),P=H+x,V=[{id:String(t.ret_rule_renta_id||"").trim(),kind:"renta"},{id:String(t.ret_rule_ica_id||"").trim(),kind:"ica"},{id:String(t.ret_rule_iva_id||"").trim(),kind:"iva"}];for(const{id:U,kind:z}of V){if(!U)continue;const J=i.find(ee=>String(ee.id||"")===U);if(!J)continue;const te=Number(J.min_base||0)||0;let F;if(z==="iva")F=x;else{const ee=String(J.base_type||"SUBTOTAL").toUpperCase();F=ee==="IVA"?x:ee==="TOTAL"?P:H}if(F<=0||F<te)continue;const D=Number(J.rate||0)||0;if(D<=0)continue;const q=F*D/100,G=String(J.account_code||"").trim();if(!G)throw new Error(`La regla de retención "${J.concept}" no tiene cuenta contable configurada.`);A[G]=(A[G]||0)+q}}for(const H of Object.keys(_)){const x=Number(_[H]||0);if(x<=0)continue;let P=String(l[H]||"").trim();if(!P&&Number(H)===19&&(P="233502"),!P)throw new Error(`No hay cuenta IVA configurada para la tarifa ${H}%. Ajusta el engranaje de Compras.`);v[P]||(v[P]=await d(P)),b.push(await g({accountId:v[P].id,thirdPartyId:null,debit:x,credit:0,description:`IVA ${H}% compra ${t.number}`,crossDocRef:t.supplier_ref||""}))}let C=0;for(const H of Object.keys(A)){const x=Number(A[H]||0);x<=0||(C+=x,v[H]||(v[H]=await d(H)),b.push(await g({accountId:v[H].id,thirdPartyId:t.supplier_id,debit:0,credit:x,description:`Retenciones compra ${t.number}`,crossDocRef:t.supplier_ref||""})))}const I=Number(t.subtotal||0)+Number(t.iva_total||0),N=Number(t.payable_total||0),T=Number(t.total||0),S=N>0?N:T>0&&Math.abs(T-I)>.01?T:I-C;b.push(await g({accountId:u.id,thirdPartyId:t.supplier_id,debit:0,credit:S,description:`${t.supplier_ref?`Ref: ${t.supplier_ref} — `:""}${((Y=(j=t.expand)==null?void 0:j.supplier_id)==null?void 0:Y.name)||""}`,crossDocRef:t.supplier_ref||""}));let w=String(t.tx_type_id||"").trim(),E=String(t.tx_number||"").trim();if(!w){const H=[],x=E.split("-")[0]||"",P=String(t.number||"").split("-")[0]||"";x&&H.push(x),P&&P!==x&&H.push(P);for(const V of H){const U=O.escapeFilterValue(V),z=await O.list("transaction_types",{filter:`active=true && (prefix="${U}" || code="${U}")`,perPage:1});if(z.items.length){w=z.items[0].id;break}}}if(!w)throw new Error("La factura no tiene tipo de comprobante contable. Edítala y selecciónalo.");E||(E="AUTO"),(!t.tx_type_id||!t.tx_number)&&await O.update("purchase_invoices",e,{tx_type_id:w,tx_number:E});const L=await this.createTransaction({tx_type_id:w,number:E,date:t.date,description:`Compra ${t.number} — ${((K=(W=t.expand)==null?void 0:W.supplier_id)==null?void 0:K.name)||""}`,third_party_id:t.supplier_id,payment_days:0,cross_enabled:!1,status:"draft"},b);let R=null;if(h.length&&t.warehouse_id){const H=t.date||new Date().toISOString().slice(0,10),x=String(Date.now()).slice(-4),P=`ENT-${H.replaceAll("-","")}-${x}`,V=await O.create("inventory_movements",{number:P,mov_type:"ENTRADA",date:t.date,warehouse_id:t.warehouse_id,third_party_id:t.supplier_id,notes:`Compra ${t.number}`,status:"draft",tx_id:L.id});for(let U=0;U<h.length;U++)await O.create("inventory_movement_lines",{movement_id:V.id,line_order:U+1,...h[U]});await this.applyInventoryMovement(V.id),R=V.id}return await O.update("purchase_invoices",e,{status:"posted",tx_id:L.id,inv_movement_id:R,ret_total:C,payable_total:S}),await this.logAudit("POST","PurchaseInvoice",e,`Contabilizada ${t.number} → TX ${L.number}`),{inv:t,tx:L}},async getPurchaseMutationBlocks(e){var s,n,i;const t=await O.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id"}),a=[],o={crossRefs:[],downstreamTx:[],stockShortages:[]};if(t.tx_id){const c=await this.checkTxDependencies(t.tx_id);a.push(...c.blocks);const r=await this.getTxLines(t.tx_id).catch(()=>[]),l=new Set;if(String(t.supplier_ref||"").trim()&&l.add(String(t.supplier_ref||"").trim()),r.forEach(p=>{const m=String(p.cross_doc_ref||"").trim();m&&l.add(m)}),o.crossRefs=[...l],t.supplier_id&&l.size)for(const p of l){const f=(await O.listAll("tx_lines",{filter:`third_party_id="${O.escapeFilterValue(t.supplier_id)}" && cross_doc_ref="${O.escapeFilterValue(p)}"`,expand:"account_id,tx_id",sort:"-id"})).filter(d=>{var g,u;return!d||d.tx_id===t.tx_id||(((u=(g=d.expand)==null?void 0:g.tx_id)==null?void 0:u.status)||"")==="voided"?!1:String(d.cross_doc_ref||"").trim()===p});f.length&&o.downstreamTx.push(...f.map(d=>{var g,u,y,v,b,h;return{ref:p,txNumber:((u=(g=d.expand)==null?void 0:g.tx_id)==null?void 0:u.number)||d.tx_id,txDate:((v=(y=d.expand)==null?void 0:y.tx_id)==null?void 0:v.date)||"",account:((h=(b=d.expand)==null?void 0:b.account_id)==null?void 0:h.code)||d.account_id,amount:Number(d.debit||0)||Number(d.credit||0)||0}}))}if(o.downstreamTx.length){const p=o.downstreamTx.slice(0,3).map(m=>`${m.txNumber}${m.txDate?` (${m.txDate})`:""}`).join(", ");a.push(`La compra ya tiene pagos o cruces posteriores sobre el documento ${o.crossRefs.join(", ")}. Transacciones detectadas: ${p}${o.downstreamTx.length>3?"…":""}.`)}}if(t.inv_movement_id){const c=await O.get("inventory_movements",t.inv_movement_id).catch(()=>null),r=(c==null?void 0:c.warehouse_id)||t.warehouse_id||"",l=await this.getInventoryMovementLines(t.inv_movement_id).catch(()=>[]);for(const p of l){const m=r?await this.getInventoryStock({warehouseId:r,productId:p.product_id}).catch(()=>[]):[],f=Number(((s=m[0])==null?void 0:s.qty_on_hand)||0),d=Number(p.qty||0);f+1e-4<d&&o.stockShortages.push({product:((i=(n=p.expand)==null?void 0:n.product_id)==null?void 0:i.name)||p.product_id,requiredQty:d,qtyOnHand:f})}if(o.stockShortages.length){const p=o.stockShortages.slice(0,3).map(m=>`${m.product} (disp. ${fmtN(m.qtyOnHand)} / compra ${fmtN(m.requiredQty)})`).join(", ");a.push(`La entrada de inventario ya tuvo efectos posteriores y no se puede revertir sin descuadrar stock. Productos afectados: ${p}${o.stockShortages.length>3?"…":""}.`)}}return{inv:t,blocks:a,details:o}},async rollbackPurchasePosting(e,t="anular",a=""){const o=await O.get("purchase_invoices",e);if(o.status!=="posted")return{inv:o,txVoided:!1,movementVoided:!1};if(typeof isPeriodClosed=="function"&&await isPeriodClosed(o.date))throw new Error(`El período ${(o.date||"").slice(0,7)} está cerrado. No se puede ${t} la compra.`);const s=await this.getPurchaseMutationBlocks(e);if(s.blocks.length)throw new Error(s.blocks[0]);if(o.tx_id){const n=await O.get("transactions",o.tx_id).catch(()=>null);n&&n.status!=="voided"&&await this.voidTransaction(o.tx_id,`${t} compra ${o.number}${a?` | Motivo: ${a}`:""}`)}if(o.inv_movement_id){const n=await O.get("inventory_movements",o.inv_movement_id).catch(()=>null);n&&n.status==="applied"?await this.voidInventoryMovement(o.inv_movement_id,a):n&&n.status!=="voided"&&(await O.update("inventory_movements",o.inv_movement_id,{status:"voided"}),await this.logAudit("VOID","InventoryMovement",o.inv_movement_id,`Anulación ${n.mov_type||"MOV"} — ${n.number||""}${a?` | Motivo: ${a}`:""}`.trim()))}return{inv:o,txVoided:!!o.tx_id,movementVoided:!!o.inv_movement_id}},async reopenPurchaseInvoice(e,t=""){const a=String(t||"").trim();if(!a)throw new Error("Debes indicar el motivo de reapertura.");const s=(await this.rollbackPurchasePosting(e,"reabrir",a)).inv;if(s.status==="voided")throw new Error("La factura está anulada y no se puede reabrir.");if(s.status==="draft")throw new Error("La factura ya está en borrador.");return await O.update("purchase_invoices",e,{status:"draft",tx_id:null,inv_movement_id:null}),await this.logAudit("REOPEN","PurchaseInvoice",e,`Reabierta ${s.number} para corrección | Motivo: ${a}`),O.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id,tx_type_id"})},async voidPurchaseInvoice(e,t=""){const a=String(t||"").trim();if(!a)throw new Error("Debes indicar el motivo de anulación.");const o=await O.get("purchase_invoices",e);if(o.status==="voided")throw new Error("La factura ya está anulada.");o.status==="posted"&&await this.rollbackPurchasePosting(e,"anular",a),await O.update("purchase_invoices",e,{status:"voided"}),await this.logAudit("VOID","PurchaseInvoice",e,`Anulada ${o.number} | Motivo: ${a}`)},async getPhProperties(e=!0){const t=e?"active=true":"";return O.listAll("ph_properties",{filter:t,sort:"code",expand:"owner_id,occupant_id"})},async getPhCommonAreas(e=!0){const t=e?"active=true":"";return O.listAll("ph_common_areas",{filter:t,sort:"code"})},async getPhBillingConcepts(e=!0){const t=e?"active=true":"";return O.listAll("ph_billing_concepts",{filter:t,sort:"code",expand:"account_id"})},async getPhInvoices(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return O.list("ph_invoices",{page:t,perPage:a,filter:o,sort:s,expand:"property_id,property_id.owner_id"})},async getPhInvoiceLines(e){const t=O.escapeFilterValue(e);return O.listAll("ph_invoice_lines",{filter:`invoice_id="${t}"`,sort:"line_order",expand:"concept_id,concept_id.account_id"})},async generatePhInvoices(e,t=""){const a=O.escapeFilterValue(e),[o,s,n]=await Promise.all([this.getPhProperties(!0),this.getPhBillingConcepts(!0),this.getSetting("ph_config_v1")]);if(!o.length)throw new Error("No hay unidades activas registradas.");if(!s.length)throw new Error("No hay conceptos de facturación activos.");let i={};try{i=n?JSON.parse(n):{}}catch{i={}}const c=Number((i==null?void 0:i.late_fee_rate)||0),r=Array.isArray(i==null?void 0:i.late_fee_concepts)?i.late_fee_concepts.map(h=>String(h||"")).filter(Boolean):[],l=new Set(r),p=h=>String(h||"").trim().toLowerCase(),m=new Set((s||[]).filter(h=>l.has(String(h.id||""))).map(h=>p(h.name)).filter(Boolean)),f=`period="${a}"`,d=await O.listAll("ph_invoices",{filter:f,perPage:200}),g=new Set(d.map(h=>h.property_id)),u=o.filter(h=>!g.has(h.id));if(!u.length)throw new Error(`Todas las unidades ya tienen factura para el período ${e}.`);const y=e+"-01",v=t||e+"-10";let b=0;for(const h of u){const _=`${e}-01`,A=new Date(`${_}T00:00:00`),C=[];let I=0,N=1;for(const E of s){let L=Number(E.amount||0);E.applies_coef&&h.coef_participacion>0&&(L=L*(h.coef_participacion/100)),!(L<=0)&&(I+=L,C.push({concept_id:E.id,description:E.name,amount:Math.round(L),line_order:N++}))}if(c>0&&l.size){const E=O.escapeFilterValue(h.id),L=await O.listAll("ph_invoices",{filter:`property_id="${E}" && period!="${a}" && status!="paid" && status!="voided"`,perPage:200});let R=0;for(const B of L){if(!(B!=null&&B.due_date))continue;const M=new Date(`${B.due_date}T00:00:00`);if(Number.isNaN(M.getTime())||M.getTime()>=A.getTime())continue;const k=O.escapeFilterValue(B.id),j=await O.listAll("ph_invoice_lines",{filter:`invoice_id="${k}"`,perPage:200});for(const Y of j){const W=String((Y==null?void 0:Y.concept_id)||""),K=p(Y==null?void 0:Y.description),H=W&&l.has(W),x=!W&&m.has(K);if(!H&&!x)continue;const P=Number(Y.amount||0);P<=0||(R+=P*(c/100))}}if(R>0){const B=Math.round(R);I+=B,C.push({concept_id:null,description:`Interés de mora a ${_}`,amount:B,line_order:N++})}}if(!C.length)continue;const T=String(b+1).padStart(6,"0"),S=`CF-${e.replace("-","")}-${T}`,w=await O.create("ph_invoices",{number:S,period:e,property_id:h.id,date:y,due_date:v,subtotal:Math.round(I),total:Math.round(I),status:"draft",notes:""});for(const E of C)await O.create("ph_invoice_lines",{invoice_id:w.id,...E});b++}return await this.logAudit("GENERATE","PhInvoices",e,`Generadas ${b} facturas PH para ${e}`),b},async getPhPortfolioByConcept(e=""){var n,i;const t=String(e||new Date().toISOString().slice(0,10)).trim(),a=O.escapeFilterValue(t),o=await O.listAll("ph_invoices",{filter:`status!="paid" && status!="voided" && date<="${a}"`,perPage:200,expand:"property_id"}),s=new Map;for(const c of o){const r=O.escapeFilterValue(c.id),l=await O.listAll("ph_invoice_lines",{filter:`invoice_id="${r}"`,perPage:200,expand:"concept_id"}),p=!!c.due_date&&String(c.due_date)<t;for(const m of l){const f=String(m.concept_id||"SIN_CONCEPTO"),d=((i=(n=m.expand)==null?void 0:n.concept_id)==null?void 0:i.name)||m.description||"Sin concepto",g=`${f}`;s.has(g)||s.set(g,{concept_id:f==="SIN_CONCEPTO"?null:f,concept_name:d,total:0,overdue:0,lines:0});const u=s.get(g),y=Number(m.amount||0);u.total+=y,u.lines+=1,p&&(u.overdue+=y)}}return Array.from(s.values()).sort((c,r)=>String(c.concept_name||"").localeCompare(String(r.concept_name||"")))},async postPhInvoicesByPeriod(e){const t=O.escapeFilterValue(e),a=await O.listAll("ph_invoices",{filter:`period="${t}"`,perPage:200});if(!a.length)throw new Error(`No hay facturas para el período ${e}.`);let o=0,s=0,n=0;const i=[];for(const c of a){if(c.status!=="draft"){s++;continue}try{await this.postPhInvoice(c.id),o++}catch(r){n++,i.push(`${c.number||c.id}: ${(r==null?void 0:r.message)||"Error"}`)}}return await this.logAudit("POST_PERIOD","PhInvoices",e,`Período ${e}: contabilizadas ${o}, omitidas ${s}, fallidas ${n}`),{period:e,total:a.length,posted:o,skipped:s,failed:n,failures:i}},async unpostPhInvoice(e){const t=await O.get("ph_invoices",e);if(t.status==="draft")throw new Error("La factura ya está en borrador.");if(t.status==="voided")throw new Error("La factura está anulada y no se puede descontabilizar.");let a="none";if(t.tx_id)try{await O.update("transactions",t.tx_id,{status:"draft"}),a="draft"}catch{await O.update("transactions",t.tx_id,{status:"voided"}),a="voided"}return await O.update("ph_invoices",e,{status:"draft",tx_id:null}),await this.logAudit("UNPOST","PhInvoice",e,`Descontabilizada ${t.number||e} | TX->${a}`),{invoiceId:e,txAction:a}},async unpostPhInvoicesByPeriod(e){const t=O.escapeFilterValue(e),a=await O.listAll("ph_invoices",{filter:`period="${t}"`,perPage:200});if(!a.length)throw new Error(`No hay facturas para el período ${e}.`);let o=0,s=0,n=0,i=0;for(const c of a){if(c.status==="draft"){s++;continue}if(c.status==="voided"){s++;continue}if(c.tx_id)try{await O.update("transactions",c.tx_id,{status:"draft"}),n++}catch{await O.update("transactions",c.tx_id,{status:"voided"}),i++}await O.update("ph_invoices",c.id,{status:"draft",tx_id:null}),o++}return await this.logAudit("UNPOST_PERIOD","PhInvoices",e,`Período ${e}: descontabilizadas ${o}, omitidas ${s}, TX->draft ${n}, TX->voided ${i}`),{period:e,total:a.length,reverted:o,skipped:s,txDraft:n,txVoided:i}},async deletePhInvoicesByPeriod(e){const t=O.escapeFilterValue(e),a=await O.listAll("ph_invoices",{filter:`period="${t}"`,perPage:200});if(!a.length)throw new Error(`No hay facturas para el período ${e}.`);let o=0,s=0,n=0;for(const i of a){if(i.tx_id)try{await O.delete("transactions",i.tx_id),s++}catch{await O.update("transactions",i.tx_id,{status:"voided"}),n++}await O.delete("ph_invoices",i.id),o++}return await this.logAudit("DELETE_PERIOD","PhInvoices",e,`Período ${e}: facturas eliminadas ${o}, TX eliminadas ${s}, TX anuladas ${n}`),{period:e,total:a.length,deleted:o,txDeleted:s,txVoided:n}},async postPhInvoice(e){var I,N,T;const t=await O.get("ph_invoices",e,{expand:"property_id,property_id.owner_id"});if(t.status==="posted")throw new Error("La factura ya fue contabilizada.");if(t.status==="voided")throw new Error("La factura está anulada.");const a=await this.getPhInvoiceLines(e);if(!a.length)throw new Error("La factura no tiene líneas.");let o={};try{const S=await this.getSetting("ph_config_v1");o=S?JSON.parse(S):{}}catch{o={}}const s=String(o.cxc_code||"130505").trim(),n=String(o.income_code||"413505").trim(),i=String(o.late_fee_income_code||n).trim(),c=String(t.number||"").trim(),r=await O.list("transaction_types",{filter:'code="CF" && active=true',perPage:1});if(!r.items.length)throw new Error("Tipo de transacción CF no encontrado. Reinicia PocketBase para aplicar la migración.");const l=r.items[0],p=(I=t.expand)==null?void 0:I.property_id,m=(p==null?void 0:p.owner_id)||null,f={},d={},g=async S=>{const w=String(S||"").trim();if(!w)throw new Error("Cuenta contable inválida.");return f[w]||(f[w]=await O.get("accounts",w)),f[w]},u=async S=>{const w=String(S||"").trim();if(!w)throw new Error("Código de cuenta inválido.");if(d[w])return d[w];const E=O.escapeFilterValue(w),L=await O.list("accounts",{filter:`code="${E}"`,perPage:1});if(!L.items.length)throw new Error(`Cuenta "${w}" no encontrada.`);const R=L.items[0];return d[w]=R,f[R.id]=R,R},y=await u(s),v=await u(n),b=async({accountId:S,debit:w=0,credit:E=0,description:L="",thirdPartyId:R=null,crossDocRef:B=""})=>{const M=await g(S),k={account_id:M.id,debit:Number(w||0),credit:Number(E||0),description:String(L||""),line_order:0};if(M.requires_third_party){const j=R||m||null;if(!j)throw new Error(`La cuenta ${M.code} - ${M.name} requiere tercero y la unidad no tiene propietario.`);k.third_party_id=j}else k.third_party_id=R||null;if(M.maneja_cruce){const j=String(B||c||"").trim();if(!j)throw new Error(`La cuenta ${M.code} - ${M.name} requiere documento de cruce.`);k.cross_doc_ref=j}return k},h=[];for(const S of a){const w=(N=S.expand)==null?void 0:N.concept_id;let E=v.id;S.account_code?E=(await u(S.account_code)).id:w!=null&&w.account_id?E=w.account_id:!S.concept_id&&/inter[eé]s de mora/i.test(String(S.description||""))&&(E=(await u(i)).id),h.push(await b({accountId:E,debit:0,credit:Number(S.amount||0),description:S.description,thirdPartyId:m||null,crossDocRef:c}))}const _=a.reduce((S,w)=>S+Number(w.amount||0),0);h.unshift(await b({accountId:y.id,debit:_,credit:0,description:`Cuota ${t.period} — ${(p==null?void 0:p.name)||(p==null?void 0:p.code)||t.property_id}`,thirdPartyId:m||null,crossDocRef:c})),h.forEach((S,w)=>{S.line_order=w+1});const A=((T=O.currentUser)==null?void 0:T.id)||"",C=await O.create("transactions",{tx_type_id:l.id,number:"AUTO",date:t.date,description:`Factura PH ${t.number} — ${(p==null?void 0:p.name)||t.property_id} — ${t.period}`,third_party_id:m||null,cross_enabled:h.some(S=>!!S.cross_doc_ref),status:"active",user_id:A||void 0});for(const S of h)await O.create("tx_lines",{tx_id:C.id,...S});return await O.update("ph_invoices",e,{status:"posted",tx_id:C.id}),await this.logAudit("POST","PhInvoice",e,`Contabilizada ${t.number} → TX ${C.number}`),O.get("ph_invoices",e,{expand:"property_id"})},async voidPhInvoice(e,t=""){const a=String(t||"").trim();if(!a)throw new Error("Debes indicar el motivo de anulación.");const o=await O.get("ph_invoices",e);if(o.status==="voided")throw new Error("La factura ya está anulada.");o.status==="posted"&&o.tx_id&&await O.update("transactions",o.tx_id,{status:"voided"}),await O.update("ph_invoices",e,{status:"voided",tx_id:null}),await this.logAudit("VOID","PhInvoice",e,`Anulada ${o.number} | Motivo: ${a}`)},async markPhInvoicePaid(e){const t=await O.get("ph_invoices",e);if(t.status!=="posted")throw new Error("Solo se pueden marcar como pagadas las facturas contabilizadas.");await O.update("ph_invoices",e,{status:"paid"}),await this.logAudit("PAID","PhInvoice",e,`Marcada como pagada ${t.number}`)},async getPhReservations(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return O.list("ph_reservations",{page:t,perPage:a,filter:o,sort:s,expand:"area_id,property_id"})},async getPhPqrs(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-created"}=e;try{return await O.list("ph_pqrs",{page:t,perPage:a,filter:o,sort:s,expand:"property_id"})}catch{try{return await O.list("ph_pqrs",{page:t,perPage:a,filter:o,expand:"property_id"})}catch{return{items:[],totalItems:0,page:t,perPage:a}}}},async nextPhPqrNumber(){const e=new Date().toISOString().slice(0,10).replace(/-/g,""),a=((await O.list("ph_pqrs",{perPage:1})).totalItems||0)+1;return`PQR-${e}-${String(a).padStart(4,"0")}`},async addPhIndividualLinesToInvoice(e,t){if((await O.get("ph_invoices",e)).status!=="draft")throw new Error("Solo se pueden modificar facturas en estado Borrador.");const o=await this.getPhInvoiceLines(e);let s=Math.max(0,...o.map(c=>Number(c.line_order||0)))+1;for(const c of t)await O.create("ph_invoice_lines",{invoice_id:e,concept_id:null,description:String(c.description||""),amount:Math.round(Number(c.amount||0)),account_code:String(c.account_code||""),line_order:s++});const i=(await this.getPhInvoiceLines(e)).reduce((c,r)=>c+Number(r.amount||0),0);return await O.update("ph_invoices",e,{subtotal:i,total:i}),i},async updatePhDraftInvoiceLine(e,{description:t="",amount:a=0,account_code:o=""}={}){const s=await O.get("ph_invoice_lines",e),n=await O.get("ph_invoices",s.invoice_id);if(n.status!=="draft")throw new Error("Solo se pueden editar líneas de facturas en borrador.");await O.update("ph_invoice_lines",e,{description:String(t||"").trim(),amount:Math.round(Number(a||0)),account_code:String(o||"").trim()||null});const c=(await this.getPhInvoiceLines(n.id)).reduce((r,l)=>r+Number(l.amount||0),0);return await O.update("ph_invoices",n.id,{subtotal:c,total:c}),{invoiceId:n.id,total:c}},async deletePhDraftInvoiceLine(e){const t=await O.get("ph_invoice_lines",e),a=await O.get("ph_invoices",t.invoice_id);if(a.status!=="draft")throw new Error("Solo se pueden eliminar líneas de facturas en borrador.");await O.delete("ph_invoice_lines",e);const s=(await this.getPhInvoiceLines(a.id)).reduce((n,i)=>n+Number(i.amount||0),0);return await O.update("ph_invoices",a.id,{subtotal:s,total:s}),{invoiceId:a.id,total:s}},async getPhIndividualCharges(e={}){const{page:t=1,perPage:a=100,filter:o="",sort:s=""}=e,n={page:t,perPage:a,filter:o};s&&(n.sort=s);try{return await O.list("ph_individual_charges",n)}catch{try{return await O.list("ph_individual_charges",{page:t,perPage:a,filter:o})}catch{try{return await O.list("ph_individual_charges",{page:t,perPage:a})}catch{return{items:[],totalItems:0,page:t,perPage:a}}}}},calculateDaysOverdue(e,t=null){if(!e)return 0;const a=new Date(`${e}T00:00:00Z`);let o=null;t?o=new Date(`${t}T23:59:59Z`):o=new Date;const s=o.getTime()-a.getTime();return Math.floor(s/(1e3*60*60*24))},normalizePhCarteraConceptLabel(e){const t=String(e||"").trim();return t?/^inter[eé]s\s+de\s+mora\s+a\s+\d{4}-\d{2}-\d{2}$/i.test(t)?"Interés de mora":t:"Concepto"},async _getPhCarteraDataset(e,t="",a=""){const o=O.escapeFilterValue(e),s=O.escapeFilterValue(t),n=O.escapeFilterValue(a);let i='status!="voided"';e&&(i+=` && property_id="${o}"`),t&&(i+=` && period>="${s}"`),a&&(i+=` && period<="${n}"`);let c=[];try{c=(await O.list("ph_invoices",{filter:i,perPage:500,sort:"-date"})).items||[]}catch{try{c=(await O.list("ph_invoices",{filter:i,perPage:500})).items||[]}catch{c=[]}}let r=[];try{r=await this.getPhProperties(!1)}catch{r=[]}const l=new Map((r||[]).map(f=>[String(f.id),f]));let p=null;if(a){if(/^\d{4}-\d{2}-\d{2}$/.test(a))p=a;else if(/^\d{4}-\d{2}$/.test(a)){const[f,d]=a.split("-").map(Number),g=new Date(f,d,0).getDate();p=`${f}-${String(d).padStart(2,"0")}-${String(g).padStart(2,"0")}`}}const m=[];for(const f of c){const d=l.get(String(f.property_id))||null;let g=[];try{g=await this.getPhInvoiceLines(f.id)}catch{g=[]}for(const u of g){const y=Number(u.amount||0),v=this.calculateDaysOverdue(f.due_date,p),b=String(f.date||f.created||"").slice(0,10),h=String(f.due_date||"").slice(0,10),_=b?new Date(`${b}T00:00:00Z`):null,A=h?new Date(`${h}T00:00:00Z`):null,C=_&&A?Math.max(0,Math.floor((A.getTime()-_.getTime())/(1e3*60*60*24))):0;let I="por_vencer";f.status==="paid"?I="cancelado":f.status==="draft"?I="borrador":v>=0&&(I="vencido");const N=Math.max(0,v),T=u.description||u.account_code||"Concepto",S=this.normalizePhCarteraConceptLabel(T),w=u.concept_id?String(u.concept_id):String(S||u.account_code||"OTROS").toUpperCase();m.push({invoice:f,line:u,amount:y,diasMora:N,diasMoraRaw:v,plazoDias:C,fechaDoc:b,dueDate:h,estado:I,propertyId:String(f.property_id||""),propertyCode:String((d==null?void 0:d.code)||""),propertyName:String((d==null?void 0:d.name)||""),conceptoId:w,concepto:S})}}return{invoices:c,rows:m}},async getPhCarteraByUnit(e,t="",a=""){const{rows:o}=await this._getPhCarteraDataset(e,t,a),s={};for(const n of o)s[n.conceptoId]||(s[n.conceptoId]={conceptoId:n.conceptoId,concepto:n.concepto,totalVencido:0,totalPorVencer:0,totalCancelado:0,totalPendiente:0,diasMoraMax:0}),n.estado==="cancelado"?s[n.conceptoId].totalCancelado+=n.amount:n.estado==="vencido"?(s[n.conceptoId].totalVencido+=n.amount,s[n.conceptoId].totalPendiente+=n.amount,s[n.conceptoId].diasMoraMax=Math.max(s[n.conceptoId].diasMoraMax,n.diasMora)):(s[n.conceptoId].totalPorVencer+=n.amount,s[n.conceptoId].totalPendiente+=n.amount);return Object.values(s).sort((n,i)=>String(n.concepto).localeCompare(String(i.concepto),"es"))},async getPhCarteraOpenParties(e,t="",a="",o={}){const{rows:s}=await this._getPhCarteraDataset(e,t,a),n=String(o.conceptoId||"").trim(),i=String(o.estado||"all").trim();return s.filter(r=>!n||String(r.conceptoId)===n).filter(r=>i==="all"||r.estado===i).map(r=>({invoiceId:r.invoice.id,invoiceNumber:r.invoice.number,periodo:r.invoice.period,propertyId:r.propertyId,propertyCode:r.propertyCode,propertyName:r.propertyName,concepto:r.concepto,conceptoId:r.conceptoId,amount:r.amount,fechaDoc:r.fechaDoc,plazoDias:r.plazoDias,dueDate:r.dueDate,diasMora:r.diasMora,estado:r.estado})).sort((r,l)=>{const p=String(r.propertyCode||"").localeCompare(String(l.propertyCode||""));if(p!==0)return p;const m=String(r.periodo||"").localeCompare(String(l.periodo||""));return m!==0?m:String(r.invoiceNumber||"").localeCompare(String(l.invoiceNumber||""))})},async getPhCarteraIntegrity(e,t="",a=""){const{invoices:o,rows:s}=await this._getPhCarteraDataset(e,t,a),n={invoices:o.length,lines:s.length,totalFacturas:0,totalLineas:0,totalPendiente:0,totalCancelado:0,diferenciaGlobal:0};for(const r of o)n.totalFacturas+=Number(r.total||0);for(const r of s)n.totalLineas+=Number(r.amount||0),r.estado==="cancelado"?n.totalCancelado+=Number(r.amount||0):n.totalPendiente+=Number(r.amount||0);n.diferenciaGlobal=Math.round((n.totalFacturas-n.totalLineas)*100)/100;const i={};for(const r of s){const l=r.invoice.id;i[l]||(i[l]={invoiceId:l,number:r.invoice.number,period:r.invoice.period,status:r.invoice.status,totalFactura:Number(r.invoice.total||0),totalLineas:0,diferencia:0}),i[l].totalLineas+=Number(r.amount||0)}const c=Object.values(i).map(r=>(r.diferencia=Math.round((r.totalFactura-r.totalLineas)*100)/100,r)).filter(r=>Math.abs(r.diferencia)>1).sort((r,l)=>Math.abs(l.diferencia)-Math.abs(r.diferencia));return{totals:n,mismatches:c,isBalanced:Math.abs(n.diferenciaGlobal)<=1&&c.length===0}}};window.pb=O;window.API=Yc;window.PB_URL=ke;const Ls={admin:{canWrite:!0,canDelete:!0,canManageUsers:!0,canViewAudit:!0,canExport:!0,canApprove:!0},contador:{canWrite:!0,canDelete:!1,canManageUsers:!1,canViewAudit:!1,canExport:!0,canApprove:!0},auxiliar:{canWrite:!0,canDelete:!1,canManageUsers:!1,canViewAudit:!1,canExport:!1,canApprove:!1},auditor:{canWrite:!1,canDelete:!1,canManageUsers:!1,canViewAudit:!0,canExport:!0,canApprove:!1},viewer:{canWrite:!1,canDelete:!1,canManageUsers:!1,canViewAudit:!1,canExport:!1,canApprove:!1}};function Ka(e){var a,o;const t=((a=pb.currentUser)==null?void 0:a.role)??"viewer";return!!((o=Ls[t])!=null&&o[e])}function Jc(...e){var a;const t=((a=pb.currentUser)==null?void 0:a.role)??"viewer";return e.includes(t)}async function Kc(){var s;const e=getInputVal("login-email");getInputVal("login-pass");const t=((s=$("#login-pass"))==null?void 0:s.value)??"",a=$("#login-error");if(a.classList.add("hidden"),!e||!t){a.textContent="Ingresa correo y contraseña",a.classList.remove("hidden");return}const o=$("#btn-login");o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Ingresando...';try{if(await pb.authWithPassword(e,t),!pb.currentUser.active){pb.logout(),a.textContent="Usuario inactivo. Contacta al administrador.",a.classList.remove("hidden");return}Ps()}catch(n){a.textContent=n.status===400?"Correo o contraseña incorrectos.":`Error: ${n.message}`,a.classList.remove("hidden")}finally{o.disabled=!1,o.innerHTML='<i class="fas fa-arrow-right-to-bracket"></i> Ingresar'}}async function Qc(){pb.logout(),To()}function To(){var t;$$(".screen").forEach(a=>a.classList.remove("active"));const e=$("#screen-login");e.style.display="",e.classList.add("active"),setInputVal("login-email",""),setInputVal("login-pass",""),$("#login-pass")&&($("#login-pass").value=""),(t=$("#login-error"))==null||t.classList.add("hidden"),$("#login-server-url").textContent=window.location.host}async function Ps(){const e=pb.currentUser;if(!e){To();return}$("#sidebar-username").textContent=e.full_name||e.email,$("#sidebar-role").textContent=roleLabel(e.role??"viewer"),$("#sidebar-avatar").textContent=(e.full_name||e.email).charAt(0).toUpperCase(),$("#nav-auditoria")&&($("#nav-auditoria").style.display=Ka("canViewAudit")?"":"none"),$("#nav-usuarios")&&($("#nav-usuarios").style.display=Ka("canManageUsers")?"":"none");const t=await API.getSetting("company_name");$("#topbar-company").textContent=t,$("#topbar-date").textContent=new Date().toLocaleDateString("es-CO",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),$$(".screen").forEach(a=>{a.classList.remove("active"),a.style.display=""}),$("#screen-app").style.display="flex",$("#screen-app").classList.add("active"),navigate("dashboard")}function Zc(){var a;const e=$("#login-pass"),t=(a=$("#btn-toggle-pass"))==null?void 0:a.querySelector("i");e&&(e.type==="password"?(e.type="text",t&&(t.className="fas fa-eye-slash")):(e.type="password",t&&(t.className="fas fa-eye")))}let ba=null;function Xc(){ba&&clearInterval(ba),ba=setInterval(async()=>{const e=await pb.ping(),t=$("#conn-indicator");if(!t)return;const a=t.querySelector("div"),o=t.querySelector("span");e?(a.className="w-2 h-2 rounded-full bg-green-400",o.textContent="En linea"):(a.className="w-2 h-2 rounded-full bg-red-400",o.textContent="Sin conexion")},15e3)}window.can=Ka;window.PERMISSIONS=Ls;window.showLogin=To;window.requireRole=Jc;window.doLogout=Qc;window.startConnCheck=Xc;window.doLogin=Kc;window.showApp=Ps;window.togglePassVisibility=Zc;window._connCheckInterval=ba;const Fs={dashboard:"Dashboard","plan-cuentas":"Plan de Cuentas",terceros:"Terceros","tipos-tx":"Tipos de Transacción","nueva-tx":"Transacciones","consulta-tx":"Consulta de Transacciones",reportes:"Reportes",auditoria:"Auditoría",usuarios:"Usuarios",configuracion:"Configuración",utilidades:"Utilidades",conciliacion:"Conciliación Bancaria",copropiedades:"Copropiedades",nomina:"Nómina","facturacion-dian":"Facturación Electrónica DIAN",cierre:"Cierre Contable",productos:"Productos y Servicios",inventario:"Inventarios",compras:"Compras de Bienes y Servicios",tesoreria:"Tesorería"},Qa={dashboard:()=>typeof renderDashboard=="function"&&renderDashboard($("#page-content")),"plan-cuentas":()=>typeof renderPlanCuentas=="function"&&renderPlanCuentas($("#page-content")),terceros:()=>typeof renderTerceros=="function"&&renderTerceros($("#page-content")),"tipos-tx":()=>typeof renderTiposTx=="function"&&renderTiposTx($("#page-content")),"nueva-tx":()=>Rs("consulta-tx"),"consulta-tx":()=>typeof renderConsultaTx=="function"&&renderConsultaTx($("#page-content")),reportes:()=>typeof renderReportes=="function"&&renderReportes($("#page-content")),auditoria:()=>typeof renderAuditoria=="function"&&renderAuditoria($("#page-content")),usuarios:()=>typeof renderUsuarios=="function"&&renderUsuarios($("#page-content")),configuracion:()=>typeof renderConfiguracion=="function"&&renderConfiguracion($("#page-content")),utilidades:()=>typeof renderUtilidades=="function"&&renderUtilidades($("#page-content")),conciliacion:()=>typeof renderConciliacion=="function"&&renderConciliacion($("#page-content")),nomina:()=>typeof renderNomina=="function"&&renderNomina($("#page-content")),"facturacion-dian":()=>typeof renderFacturacionDIAN=="function"&&renderFacturacionDIAN($("#page-content")),cierre:()=>typeof renderCierre=="function"&&renderCierre($("#page-content")),productos:()=>typeof renderProductos=="function"&&renderProductos($("#page-content")),inventario:()=>typeof renderInventario=="function"&&renderInventario($("#page-content")),compras:()=>typeof renderCompras=="function"&&renderCompras($("#page-content")),copropiedades:()=>typeof renderCopropiedades=="function"&&renderCopropiedades($("#page-content")),tesoreria:()=>typeof showTesoreriaScreen=="function"&&showTesoreriaScreen($("#page-content"))};let Ds="dashboard";function Rs(e){var a;if(Qa[e]||(e="dashboard"),e==="usuarios"&&!can("canManageUsers")){showToast("No tienes permiso para acceder a esta sección","error");return}if(e==="auditoria"&&!can("canViewAudit")){showToast("No tienes permiso para acceder a esta sección","error");return}Ds=e,$$("#nav-menu .nav-item").forEach(o=>o.classList.toggle("active",o.dataset.page===e)),$("#page-title").textContent=Fs[e]??e,(a=$("#sidebar"))==null||a.classList.remove("open");const t=$("#page-content");t&&(t.scrollTop=0);try{Qa[e]()}catch(o){console.error(`[Router] Error renderizando ${e}:`,o),t&&(t.innerHTML=`
        <div class="flex flex-col items-center justify-center" style="height:60vh;gap:16px">
          <i class="fas fa-circle-exclamation text-4xl" style="color:#EF4444"></i>
          <p class="font-semibold" style="color:#374151">Error al cargar el módulo</p>
          <p class="text-sm" style="color:#9CA3AF">${esc(o.message)}</p>
          <button class="btn btn-outline" onclick="navigate('${e}')"><i class="fas fa-rotate-right"></i> Reintentar</button>
        </div>`)}}window.PAGE_RENDERERS=Qa;window.currentPage=Ds;window.PAGE_TITLES=Fs;window.navigate=Rs;async function er(e){e.innerHTML=`
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      ${["#EEF4FF","#FFF8F0","#ECFDF5","#FEF2F2"].map(t=>`
        <div class="rounded-2xl p-4 anim-slide-up" style="background:${t}">
          <div class="h-3 w-20 rounded mb-3" style="background:#E5E7EB;animation:pulse 1.5s ease infinite"></div>
          <div class="h-7 w-28 rounded" style="background:#E5E7EB;animation:pulse 1.5s ease infinite"></div>
        </div>`).join("")}
    </div>`;try{const[t,a]=await Promise.all([API.getDashboardKpis(),API.getAccountSaldos()]),o=await API.getAccounts();let s=0,n=0,i=0,c=0;for(const l of o){const p=a[l.id]??0,m=l.code.charAt(0);m==="1"?s+=p:m==="2"?n+=Math.abs(p):m==="4"?i+=Math.abs(p):(m==="5"||m==="6"||m==="7")&&(c+=p)}const r=await API.getTransactions({page:1,perPage:8});e.innerHTML=`
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
            <tbody>${r.items.length?r.items.map(l=>{var p,m,f,d;return`
              <tr class="cursor-pointer" onclick="viewTransaction('${esc(l.id)}')">
                <td><span class="font-semibold" style="color:#E87D1E">${esc(((m=(p=l.expand)==null?void 0:p.tx_type_id)==null?void 0:m.prefix)??"")}-${esc(l.number)}</span></td>
                <td>${esc(l.date)}</td>
                <td class="max-w-xs truncate">${esc(l.description??"—")}</td>
                <td>${esc(((d=(f=l.expand)==null?void 0:f.third_party_id)==null?void 0:d.name)??"—")}</td>
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
    </div>`}catch(t){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(t.message)}</div>`}}async function tr(e){navigate("consulta-tx"),setTimeout(()=>{typeof seeTxDetail=="function"&&seeTxDetail(e)},120)}window.renderDashboard=er;window.viewTransaction=tr;async function Io(e){var t,a,o,s;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando plan de cuentas...</div>';try{const[n,i]=await Promise.all([API.getAccounts(!1),pb.listAll("account_types",{sort:"code"})]),c=n.map(l=>{var f;const p=(f=l.expand)==null?void 0:f.account_type_id,m=l.active?'<span class="badge badge-green">Activa</span>':'<span class="badge badge-gray">Inactiva</span>';return`
      <tr data-code="${esc(l.code)}" data-name="${esc(l.name.toLowerCase())}">
        <td><span class="font-semibold" style="color:#1A4B8C">${esc(l.code)}</span></td>
        <td>${esc(l.name)}</td>
        <td>${esc((p==null?void 0:p.name)??"?")}</td>
        <td>${esc(l.parent_code||"?")}</td>
        <td>${l.requires_third_party?'<span class="badge badge-orange">Sí</span>':"No"}</td>
        <td>${m}</td>
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
      </div>`;const r=()=>{const l=getInputVal("acct-q").toLowerCase(),p=getSelectVal("acct-type"),m=getSelectVal("acct-status");$$("#accounts-table tbody tr").forEach(f=>{var _,A,C,I,N,T,S,w;const d=((A=(_=f.children[0])==null?void 0:_.textContent)==null?void 0:A.toLowerCase())||"",g=((I=(C=f.children[1])==null?void 0:C.textContent)==null?void 0:I.toLowerCase())||"",u=((N=f.children[2])==null?void 0:N.textContent)||"",y=(((T=f.children[5])==null?void 0:T.textContent)||"").includes("Activa"),v=!l||d.includes(l)||g.includes(l),b=!p||u.includes(((w=(S=$(`#acct-type option[value="${p}"]`))==null?void 0:S.textContent)==null?void 0:w.split(" - ")[0])||""),h=!m||(m==="active"?y:!y);f.style.display=v&&b&&h?"":"none"})};(t=$("#acct-q"))==null||t.addEventListener("input",debounce(r,200)),(a=$("#acct-type"))==null||a.addEventListener("change",r),(o=$("#acct-status"))==null||o.addEventListener("change",r),(s=$("#btn-new-account"))==null||s.addEventListener("click",()=>So(i))}catch(n){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(n.message)}</div>`}}async function So(e,t=null){var a,o;if(!can("canWrite"))return showToast("No tienes permisos para crear/editar cuentas","error");e||(e=await pb.listAll("account_types",{sort:"code"})),openModal(t?"Editar Cuenta":"Nueva Cuenta",`
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
     <button class="btn btn-primary" id="btn-save-account"><i class="fas fa-floppy-disk"></i> Guardar</button>`),window.toggleRetTypes=()=>{var i,c;const s=(i=document.getElementById("ac-ret"))==null?void 0:i.checked,n=document.getElementById("ret-types-wrap");n&&n.classList.toggle("hidden",!s),(c=window.toggleRetRateInputs)==null||c.call(window)},window.toggleRetRateInputs=()=>{var i;const s=[["ac-reterenta","ac-rate-reterenta"],["ac-reteiva","ac-rate-reteiva"],["ac-reteica","ac-rate-reteica"]],n=!!((i=document.getElementById("ac-ret"))!=null&&i.checked);s.forEach(([c,r])=>{const l=document.getElementById(c),p=document.getElementById(r);if(!l||!p)return;const m=n&&l.checked;p.disabled=!m,m||(p.value="")})},(a=window.toggleRetRateInputs)==null||a.call(window),(o=$("#btn-save-account"))==null||o.addEventListener("click",async()=>{var p,m,f,d,g;const s=!!((p=document.getElementById("ac-ret"))!=null&&p.checked),n=[];s&&((m=document.getElementById("ac-reterenta"))!=null&&m.checked&&n.push("reterenta"),(f=document.getElementById("ac-reteiva"))!=null&&f.checked&&n.push("reteiva"),(d=document.getElementById("ac-reteica"))!=null&&d.checked&&n.push("reteica"));const i=parseFloat(getInputVal("ac-rate-reterenta")),c=parseFloat(getInputVal("ac-rate-reteiva")),r=parseFloat(getInputVal("ac-rate-reteica")),l={code:getInputVal("ac-code"),name:getInputVal("ac-name"),account_type_id:getSelectVal("ac-type"),nature:getSelectVal("ac-nature"),level:Number(getInputVal("ac-level")||1),parent_code:getInputVal("ac-parent"),requires_third_party:getSelectVal("ac-third")==="1",active:getSelectVal("ac-active")==="1",maneja_cruce:!!((g=document.getElementById("ac-cruce"))!=null&&g.checked),maneja_retenciones:s,tipos_retencion:n.join(","),ret_rate_reterenta:Number.isFinite(i)?i:0,ret_rate_reteiva:Number.isFinite(c)?c:0,ret_rate_reteica:Number.isFinite(r)?r:0};if(!l.code||!l.name||!l.account_type_id)return showToast("Completa código, nombre y tipo de cuenta","warning");if(!/^\d+$/.test(l.code))return showToast("El código de cuenta debe ser numérico","warning");if(l.parent_code&&!/^\d+$/.test(l.parent_code))return showToast("El código padre debe ser numérico","warning");if(l.parent_code&&l.parent_code===l.code)return showToast("Una cuenta no puede ser su propia cuenta padre","warning");if(s&&!n.length)return showToast("Selecciona al menos un tipo de retención","warning");if(s){if(n.includes("reterenta")&&l.ret_rate_reterenta<=0)return showToast("Ingresa un porcentaje válido para Reterenta","warning");if(n.includes("reteiva")&&l.ret_rate_reteiva<=0)return showToast("Ingresa un porcentaje válido para Reteiva","warning");if(n.includes("reteica")&&l.ret_rate_reteica<=0)return showToast("Ingresa un porcentaje válido para Reteica","warning")}try{if(l.parent_code){const u=await pb.list("accounts",{filter:`code="${l.parent_code}"`,perPage:1});if(!u.items.length)return showToast("El código padre no existe","error");const y=u.items[0];if(Number(y.level||1)>=Number(l.level||1))return showToast("El nivel de la cuenta hija debe ser mayor al nivel de la cuenta padre","warning")}if(t!=null&&t.id)await pb.update("accounts",t.id,l),await API.logAudit("UPDATE","Cuenta",t.id,`${l.code} - ${l.name}`);else{const u=await pb.create("accounts",l);await API.logAudit("CREATE","Cuenta",u.id,`${l.code} - ${l.name}`)}closeModal(),showToast("Cuenta guardada correctamente","success"),Io($("#page-content"))}catch(u){showToast(u.message,"error")}})}async function ar(e){try{const[t,a]=await Promise.all([pb.get("accounts",e),pb.listAll("account_types",{sort:"code"})]);So(a,t)}catch(t){showToast(t.message,"error")}}function or(e,t){if(!can("canDelete"))return showToast("No tienes permisos para cambiar estado","error");confirmDialog(t?"Reactivar cuenta":"Inactivar cuenta",t?"¿Deseas reactivar esta cuenta?":"¿Deseas inactivar esta cuenta?",async()=>{try{if(!t){const o=await pb.get("accounts",e);if((await pb.list("accounts",{filter:`parent_code="${o.code}" && active=true`,perPage:1})).totalItems>0)return showToast("No puedes inactivar una cuenta que tiene subcuentas activas","error");if((await pb.list("tx_lines",{filter:`account_id="${e}"`,perPage:1})).totalItems>0)return showToast("No puedes inactivar una cuenta con movimientos contables asociados","error")}await pb.update("accounts",e,{active:t});const a=await pb.get("accounts",e);await API.logAudit("STATUS","Cuenta",e,`${a.code} - ${a.name} => ${t?"Activa":"Inactiva"}`),showToast("Estado actualizado","success"),Io($("#page-content"))}catch(a){showToast(a.message,"error")}})}window.openAccountForm=So;window.editAccount=ar;window.renderPlanCuentas=Io;window.toggleAccountActive=or;async function No(e){var t,a,o,s,n;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando terceros...</div>';try{const i=await pb.listAll("third_parties",{sort:"name"}),c=p=>p==="JURIDICA"?'<span class="badge badge-blue"><i class="fas fa-building mr-1"></i>Jurídica</span>':p==="GRAN_CONTRIBUYENTE"?'<span class="badge badge-orange"><i class="fas fa-landmark mr-1"></i>Gran Contr.</span>':'<span class="badge badge-gray"><i class="fas fa-user mr-1"></i>Natural</span>',r=p=>{var d;const m={CLIENTE:"badge-green",PROVEEDOR:"badge-blue",EMPLEADO:"badge-orange",ACREEDOR:"badge-gray",TRANSPORTISTA:"badge-blue",OTRO:"badge-gray"},f=((d=TP_TYPES.find(g=>g.code===p))==null?void 0:d.name)??p;return`<span class="badge ${m[p]??"badge-gray"}">${esc(f)}</span>`};e.innerHTML=`
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
    </div>`;const l=()=>{var g,u,y,v;const p=(((g=$("#tp-q"))==null?void 0:g.value)??"").toLowerCase(),m=((u=$("#tp-person"))==null?void 0:u.value)??"",f=((y=$("#tp-type"))==null?void 0:y.value)??"",d=((v=$("#tp-status"))==null?void 0:v.value)??"";$$("#tp-table tbody tr").forEach(b=>{var _;const h=(_=b.children[6])==null?void 0:_.textContent.includes("Activo");b.style.display=(!p||b.textContent.toLowerCase().includes(p))&&(!m||(b.dataset.person||"")===m)&&(!f||(b.dataset.type||"")===f)&&(!d||(d==="active"?h:!h))?"":"none"})};(t=$("#tp-q"))==null||t.addEventListener("input",debounce(l,200)),(a=$("#tp-person"))==null||a.addEventListener("change",l),(o=$("#tp-type"))==null||o.addEventListener("change",l),(s=$("#tp-status"))==null||s.addEventListener("change",l),(n=$("#btn-new-tp"))==null||n.addEventListener("click",()=>Fo())}catch(i){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(i.message)}</div>`}}function Os(e){const t=(e==null?void 0:e.person_type)||"NATURAL",a=t==="NATURAL",o=(e==null?void 0:e.country)||"CO",s=o==="CO",n=(e==null?void 0:e.dept_code)||"",i=(e==null?void 0:e.department)||"",c=COL_DEPTS.find(l=>l.code===n||l.name===i),r=[{code:"NATURAL",label:"Persona Natural",icon:"fa-user"},{code:"JURIDICA",label:"Persona Jurídica",icon:"fa-building"},{code:"GRAN_CONTRIBUYENTE",label:"Gran Contribuyente",icon:"fa-landmark"}];return`
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
  `}function ht(e){for(let t=0;t<4;t++){const a=$(`#tpf-panel-${t}`),o=$(`#tpf-tab-${t}`);if(!a||!o)continue;const s=t===e;a.style.display=s?"":"none",o.style.borderBottomColor=s?"#E87D1E":"transparent",o.style.color=s?"#E87D1E":"#6B7280",o.style.fontWeight=s?"600":"400"}}function Lo(){var e;return((e=document.querySelector('input[name="tpf-person-type-r"]:checked'))==null?void 0:e.value)||"NATURAL"}function Po(){const e=Lo(),t=e==="NATURAL",a=!t,o=$("#tpf-section-natural"),s=$("#tpf-section-juridica");if(o&&(o.style.display=t?"":"none"),s&&(s.style.display=a?"":"none"),$$('input[name="tpf-person-type-r"]').forEach(n=>{const i=n.value===e,c=n.closest("label");if(!c)return;c.style.borderColor=i?"#E87D1E":"#E5E7EB",c.style.background=i?"#FFF7F0":"#FAFAFA";const r=c.querySelector("i"),l=c.querySelector("span");r&&(r.style.color=i?"#E87D1E":"#9CA3AF"),l&&(l.style.color=i?"#E87D1E":"#374151",l.style.fontWeight=i?"600":"400")}),a){const n=$("#tpf-doc-type");n&&n.value!=="NIT"&&(n.value="NIT",Qt())}}function Qt(){const e=getSelectVal("tpf-doc-type"),t=$("#tpf-dv-wrap"),a=$("#tpf-dv");a&&(e==="NIT"?(t&&(t.style.display=""),a.value=calcDV(getInputVal("tpf-doc-number"))):(t&&(t.style.display="none"),a.value=""))}function ks(){const t=getSelectVal("tpf-country")==="CO",a=$("#tpf-section-colombia");if(a&&(a.style.display=t?"":"none"),!t){setInputVal("tpf-dept-code",""),setInputVal("tpf-department","");const o=$("#tpf-city-select");o&&(o.innerHTML='<option value="">—</option>'),setInputVal("tpf-city-code",""),setInputVal("tpf-city","")}}function Bs(){const e=getSelectVal("tpf-dept-select"),t=geoDept(e);setInputVal("tpf-dept-code",e),setInputVal("tpf-department",(t==null?void 0:t.name)||"");const a=$("#tpf-city-select");if(!a)return;const o=e?geoMunisByDept(e):[];a.innerHTML='<option value="">Seleccionar municipio...</option>'+o.map(s=>`<option value="${esc(s.code)}">${esc(s.name)}</option>`).join(""),setInputVal("tpf-city-code",""),setInputVal("tpf-city","")}function Ms(){const e=getSelectVal("tpf-city-select"),t=geoMuni(e);setInputVal("tpf-city-code",e),setInputVal("tpf-city",(t==null?void 0:t.name)||"")}function Us(){var e,t,a,o,s;$$('input[name="tpf-person-type-r"]').forEach(n=>n.addEventListener("change",Po)),(e=$("#tpf-doc-type"))==null||e.addEventListener("change",Qt),(t=$("#tpf-doc-number"))==null||t.addEventListener("input",Qt),(a=$("#tpf-country"))==null||a.addEventListener("change",ks),(o=$("#tpf-dept-select"))==null||o.addEventListener("change",Bs),["tpf-first-name","tpf-last-name","tpf-business-name","tpf-commercial-name","tpf-address"].forEach(n=>{const i=$(`#${n}`);i&&i.addEventListener("input",()=>{const c=i.selectionStart;i.value=i.value.toUpperCase(),i.setSelectionRange(c,c)})}),(s=$("#tpf-city-select"))==null||s.addEventListener("change",Ms)}function Vs(){const e=Lo(),t=e==="NATURAL",a=getInputVal("tpf-first-name").toUpperCase(),o=getInputVal("tpf-last-name").toUpperCase(),s=getInputVal("tpf-business-name").toUpperCase(),n=getInputVal("tpf-commercial-name").toUpperCase(),i=t?[a,o].filter(Boolean).join(" "):s||n,c=getSelectVal("tpf-country")||"CO",r=c==="CO";return{person_type:e,type:getSelectVal("tpf-type"),doc_type:getSelectVal("tpf-doc-type"),doc_number:getInputVal("tpf-doc-number"),dv:getInputVal("tpf-dv"),first_name:a,last_name:o,business_name:s,commercial_name:n,name:i,contact_name:getInputVal("tpf-contact-name"),advisor:getInputVal("tpf-advisor"),phone:getInputVal("tpf-phone"),phone2:getInputVal("tpf-phone2"),email:getInputVal("tpf-email"),email2:getInputVal("tpf-email2"),country:c,department:r?getInputVal("tpf-department"):"",dept_code:r?getInputVal("tpf-dept-code"):"",city:r?getInputVal("tpf-city"):"",city_code:r?getInputVal("tpf-city-code"):"",address:getInputVal("tpf-address").toUpperCase(),tax_regime:getSelectVal("tpf-tax"),credit_limit:parseFloat(getInputVal("tpf-credit-limit"))||0,max_invoices:parseInt(getInputVal("tpf-max-invoices"),10)||1,payment_days:parseInt(getInputVal("tpf-payment-days"),10)||0,active:getSelectVal("tpf-active")==="1"}}function js(e){if(!e.doc_type||!e.doc_number)return ht(0),showToast("Tipo y número de documento son obligatorios","warning"),!1;const t=e.person_type==="NATURAL";return t&&(!e.first_name||!e.last_name)?(ht(1),showToast("Nombres y Apellidos son obligatorios para persona natural","warning"),!1):!t&&!e.business_name?(ht(1),showToast("La Razón Social es obligatoria","warning"),!1):e.name?e.country==="CO"&&(!e.city||!e.department)?(ht(2),showToast("Departamento y Ciudad son obligatorios para Colombia","warning"),!1):!0:(ht(1),showToast("El nombre no puede quedar vacío","warning"),!1)}function Fo(e=null){var t;if(!can("canWrite"))return showToast("No tienes permisos para gestionar terceros","error");openModal(e?"Editar Tercero":"Nuevo Tercero",Os(e),`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-tp"><i class="fas fa-floppy-disk"></i> Guardar</button>`,!0),setTimeout(()=>{var a;if(Us(),Qt(),Po(),e!=null&&e.dept_code){const o=$("#tpf-city-select");if(o){const s=geoMunisByDept(e.dept_code),n=e.city_code||"";o.innerHTML='<option value="">Seleccionar municipio...</option>'+s.map(i=>`<option value="${esc(i.code)}" ${i.code===n?"selected":""}>${esc(i.name)}</option>`).join(""),setInputVal("tpf-city-code",n),setInputVal("tpf-city",((a=s.find(i=>i.code===n))==null?void 0:a.name)||e.city||"")}}},30),(t=$("#btn-save-tp"))==null||t.addEventListener("click",async()=>{const a=Vs();if(!js(a))return;const o=$("#btn-save-tp");o&&(o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{if(e!=null&&e.id)await pb.update("third_parties",e.id,a),await API.logAudit("UPDATE","Tercero",e.id,`${a.doc_type} ${a.doc_number} - ${a.name}`);else{const s=await pb.create("third_parties",a);await API.logAudit("CREATE","Tercero",s.id,`${a.doc_type} ${a.doc_number} - ${a.name}`)}closeModal(),showToast("Tercero guardado correctamente","success"),No($("#page-content"))}catch(s){o&&(o.disabled=!1,o.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar'),showToast(s.message,"error")}})}async function sr(e){try{const t=await pb.get("third_parties",e);if(!t.first_name&&!t.business_name&&t.name)if((t.person_type||"NATURAL")==="NATURAL"){const o=t.name.trim().split(/\s+/),s=Math.ceil(o.length/2);t.first_name=o.slice(0,s).join(" "),t.last_name=o.slice(s).join(" ")}else t.business_name=t.name;if(!t.country||t.country.length>3){const a=(t.country||"COLOMBIA").toUpperCase(),o=GEO_PAISES.find(s=>s.name===a);t.country=o?o.code:"CO"}if(!t.dept_code&&t.department){const a=t.department.trim().toUpperCase(),o=GEO_DEPTS.find(s=>s.name===a);o&&(t.dept_code=o.code)}if(!t.city_code&&t.city&&t.dept_code){const a=t.city.trim().toUpperCase(),o=geoMunisByDept(t.dept_code).find(s=>s.name===a);o&&(t.city_code=o.code)}Fo(t)}catch(t){showToast(t.message,"error")}}function nr(e,t){if(!can("canDelete"))return showToast("No tienes permisos para cambiar estado","error");confirmDialog(t?"Reactivar tercero":"Inactivar tercero",t?"¿Deseas reactivar este tercero?":"¿Deseas inactivar este tercero?",async()=>{try{await pb.update("third_parties",e,{active:t});const a=await pb.get("third_parties",e);await API.logAudit("STATUS","Tercero",e,`${a.doc_type} ${a.doc_number} - ${a.name} => ${t?"Activo":"Inactivo"}`),showToast("Estado actualizado","success"),No($("#page-content"))}catch(a){showToast(a.message,"error")}})}window._tpfSwitchTab=ht;window.renderTerceros=No;window._tpfBindEvents=Us;window.openTerceroForm=Fo;window._tpfUpdatePersonType=Po;window.terceroPayload=Vs;window._tpfUpdateCountry=ks;window.editTercero=sr;window._tpfUpdateDept=Bs;window._tpfValidate=js;window.toggleTercero=nr;window._tpfUpdateCity=Ms;window._tpfUpdateDV=Qt;window.terceroFormHtml=Os;window._tpfCurrentPersonType=Lo;async function Do(e){var t;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando tipos de transacción...</div>';try{const a=await pb.listAll("transaction_types",{sort:"code,prefix"}),o=new Map;for(const n of a)o.has(n.code)||o.set(n.code,[]),o.get(n.code).push(n);let s="";for(const[n,i]of o){const c=i.length>1;i.forEach((r,l)=>{s+=`
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
      </div>`,(t=$("#btn-new-tx-type"))==null||t.addEventListener("click",()=>Ro())}catch(a){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(a.message)}</div>`}}function Ro(e=null,t=""){var n;if(!can("canWrite"))return showToast("No tienes permisos para gestionar tipos","error");const a=!!(e!=null&&e.id),o=(e==null?void 0:e.code)??t??"",s=!a&&!!t;openModal(a?"Editar Serie de Transacción":"Nueva Serie de Transacción",`
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
     <button class="btn btn-primary" id="btn-save-tt"><i class="fas fa-floppy-disk"></i> Guardar</button>`),(n=$("#btn-save-tt"))==null||n.addEventListener("click",async()=>{var c;const i={code:(getInputVal("tt-code")||"").trim().toUpperCase(),prefix:(getInputVal("tt-prefix")||"").trim().toUpperCase(),name:getInputVal("tt-name"),description:getInputVal("tt-desc"),consecutive:Number(getInputVal("tt-consec")||0),active:getSelectVal("tt-active")==="1"};if(!i.code||!i.prefix||!i.name)return showToast("Código, prefijo y nombre son obligatorios","warning");try{a?await pb.update("transaction_types",e.id,i):await pb.create("transaction_types",i),closeModal(),showToast("Serie guardada correctamente","success"),Do($("#page-content"))}catch(r){(c=r.message)!=null&&c.toLowerCase().includes("unique")||r.status===400?showToast(`Ya existe una serie con código "${i.code}" y prefijo "${i.prefix}"`,"error"):showToast(r.message,"error")}})}async function ir(e){try{Ro(await pb.get("transaction_types",e))}catch(t){showToast(t.message,"error")}}function cr(e,t){if(!can("canDelete"))return showToast("No tienes permisos para cambiar estado","error");const a=t===!0||t==="true";confirmDialog(a?"Reactivar serie":"Inactivar serie",a?"¿Deseas reactivar esta serie de transacción?":"¿Deseas inactivar esta serie de transacción?",async()=>{try{await pb.update("transaction_types",e,{active:a}),showToast("Estado actualizado","success"),Do($("#page-content"))}catch(o){showToast(o.message,"error")}})}window.editTxType=ir;window.openTxTypeForm=Ro;window.toggleTxType=cr;window.renderTiposTx=Do;const Ht={reterenta:3.5,reteiva:15,reteica:.414},Oo={reterenta:"ret_rate_reterenta",reteiva:"ret_rate_reteiva",reteica:"ret_rate_reteica"};function pt(e,t=null){for(const a of e){const o=a.trim(),s=Oo[o],n=t&&s?Number(t[s]||0):0;if(n>0)return n;if(Ht[o])return Ht[o]}return Ht.reterenta}function Hs(e){return{reterenta:"Reterenta",reteiva:"Reteiva",reteica:"Reteica"}[e.trim()]||e}function ko(e,t=null){const a=String(e||"").trim(),o=Oo[a],s=t&&o?Number(t[o]||0):0,n=s>0?s:Ht[a]||0;return`${Hs(a)} ${n}%`}let ce={accounts:[],txTypes:[],terceros:[],lines:[],postableAccountIds:new Set,accountMap:new Map};function Lt(e){return`${(e==null?void 0:e.doc_number)||""} - ${(e==null?void 0:e.name)||""}`.trim()}function Zt(e,t){var a;return!t||!((a=e==null?void 0:e.terceros)!=null&&a.length)?null:e.terceros.find(o=>o.id===t)||null}function Bo(e,t){const a=Array.isArray(e==null?void 0:e.terceros)?e.terceros:[],o=String(t||"").toLowerCase().trim();if(!o)return a.slice(0,30);const s=o.split(/\s+/).filter(Boolean);return a.filter(n=>{const i=`${n.doc_number||""} ${n.name||""}`.toLowerCase();return s.every(c=>i.includes(c))}).slice(0,30)}function Mo({state:e,hiddenId:t,inputId:a,resultsId:o,onSelected:s}){const n=document.getElementById(`${a}-wrap`),i=document.getElementById(t),c=document.getElementById(a),r=document.getElementById(o);if(!n||!i||!c||!r)return;const l=(d="")=>{const g=Bo(e,d);if(!g.length){r.innerHTML='<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';return}r.innerHTML=g.map(u=>`
      <button type="button" data-third-id="${esc(u.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
        <div style="font-weight:600">${esc(u.doc_number||"SIN DOC")}</div>
        <div style="font-size:12px;color:#6B7280">${esc(u.name||"")}</div>
      </button>
    `).join("")},p=()=>{l(c.value),r.style.display="block"},m=()=>{r.style.display="none"};(()=>{const d=Zt(e,i.value);c.value=d?Lt(d):""})(),c.onfocus=()=>p(),c.oninput=()=>{i.value="",typeof s=="function"&&s(""),l(c.value),r.style.display="block"},r.onclick=d=>{const g=d.target.closest("[data-third-id]");if(!g)return;const u=g.getAttribute("data-third-id")||"",y=Zt(e,u);i.value=u,c.value=y?Lt(y):"",m(),typeof s=="function"&&s(u)},c._thirdOutsideHandler&&document.removeEventListener("click",c._thirdOutsideHandler),c._thirdOutsideHandler=d=>{n.contains(d.target)||m()},setTimeout(()=>document.addEventListener("click",c._thirdOutsideHandler),0)}function Gs({state:e,hidden:t,input:a,results:o,onSelected:s}){if(!t||!a||!o)return;const n=(c="")=>{const r=Bo(e,c);o.innerHTML=`
      <button type="button" data-third-id="" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer;border-bottom:1px solid #F1F5F9">
        Usar tercero del encabezado
      </button>
      ${r.map(l=>`
        <button type="button" data-third-id="${esc(l.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
          <div style="font-weight:600">${esc(l.doc_number||"SIN DOC")}</div>
          <div style="font-size:12px;color:#6B7280">${esc(l.name||"")}</div>
        </button>
      `).join("")}
    `};(()=>{const c=Zt(e,t.value);a.value=c?Lt(c):""})(),a.onfocus=()=>{n(a.value),o.style.display="block"},a.oninput=()=>{t.value="",typeof s=="function"&&s(""),n(a.value),o.style.display="block"},a.onblur=()=>setTimeout(()=>{o.style.display="none"},120),o.onmousedown=c=>c.preventDefault(),o.onclick=c=>{const r=c.target.closest("[data-third-id]");if(!r)return;const l=r.getAttribute("data-third-id")||"";t.value=l;const p=Zt(e,l);a.value=p?Lt(p):"",o.style.display="none",typeof s=="function"&&s(l)}}function Uo(e="new"){var o;const t=e==="edit",a=t?ae:ce;(o=a==null?void 0:a.lines)!=null&&o.length&&a.lines.forEach((s,n)=>{const i=t?`edit-tx-line-third-${n}`:`tx-line-third-${n}`,c=document.getElementById(i),r=document.getElementById(`${i}-search`),l=document.getElementById(`${i}-results`);Gs({state:a,hidden:c,input:r,results:l,onSelected:p=>{t?an(n,"third_party_id",p):Ws(n,"third_party_id",p)}})})}async function rr(){if(!can("canWrite"))return showToast("Sin permisos para registrar transacciones","error");openModal("Nueva Transacción",'<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos...</div>',"",!0);try{const[e,t,a]=await Promise.all([API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]),o=new Set(e.map(r=>r.parent_code).filter(Boolean)),s=new Set(e.filter(r=>!o.has(r.code)).map(r=>r.id)),n=new Map(e.map(r=>[r.id,r]));ce={accounts:e,txTypes:t,terceros:a,lines:[],postableAccountIds:s,accountMap:n,inModal:!0};const i=`
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b" style="border-color:#F3F4F6">
        <div class="form-group"><label class="form-label">Tipo / Serie</label><select id="tx-type" class="form-input">${Vo(t)}</select></div>
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
      ${can("canApprove")?'<button class="btn btn-primary" onclick="saveTransaction(true)"><i class="fas fa-check-circle"></i> Guardar y Aprobar</button>':""}`;openModal("Nueva Transacción",i,c,!0),setTimeout(async()=>{La(),await Pa(),ct(),ct()},0)}catch(e){openModal("Error al cargar",`<p class="p-4 text-sm" style="color:#EF4444">${esc(e.message)}</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!1)}}function La(){const e=$("#tx-type"),t=$("#btn-add-line"),a=$("#tx-third"),o=$("#btn-cartera");e&&(e.onchange=Pa),t&&(t.onclick=()=>ct()),Mo({state:ce,hiddenId:"tx-third",inputId:"tx-third-search",resultsId:"tx-third-results",onSelected:s=>{var i;o&&(o.disabled=!s);const n=$("#tx-payment-days");if(n&&s){const c=(i=ce.terceros)==null?void 0:i.find(r=>r.id===s);n.value=Number((c==null?void 0:c.payment_days)||0)}}}),a&&o&&(o.disabled=!a.value),o&&(o.onclick=()=>Da(getSelectVal("tx-third")))}async function qs(e){var t;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando datos...</div>';try{const[a,o,s]=await Promise.all([API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]),n=new Set(a.map(r=>r.parent_code).filter(Boolean)),i=new Set(a.filter(r=>!n.has(r.code)).map(r=>r.id)),c=new Map(a.map(r=>[r.id,r]));ce={accounts:a,txTypes:o,terceros:s,lines:[],postableAccountIds:i,accountMap:c,inModal:!1},e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Nueva Transacción</h3>
          <p class="text-sm" style="color:#6B7280">Registro contable por partida doble.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group"><label class="form-label">Tipo / Serie</label><select id="tx-type" class="form-input">${Vo(o)}</select></div>
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
      </div>`,La(),(t=$("#btn-save-tx"))==null||t.addEventListener("click",Ks),await Pa(),ct(),ct()}catch(a){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(a.message)}</div>`}}function Vo(e){const t=new Map;for(const o of e)t.has(o.code)||t.set(o.code,[]),t.get(o.code).push(o);const a=[];for(const[o,s]of t)if(s.length===1){const n=s[0];a.push(`<option value="${esc(n.id)}">${esc(n.prefix)} — ${esc(n.name)}</option>`)}else{const n=`${esc(o)} — ${esc(s[0].name.replace(/ ?[\-–—].*$/,"").trim())}`;a.push(`<optgroup label="${n}">${s.map(i=>`<option value="${esc(i.id)}">[${esc(i.prefix)}] ${esc(i.name)}</option>`).join("")}</optgroup>`)}return a.join("")}async function Pa(){const e=getSelectVal("tx-type"),t=ce.txTypes.find(a=>a.id===e);t&&setInputVal("tx-number",`${t.prefix}-${String((t.consecutive??0)+1).padStart(8,"0")}`)}function ct(e=null){ce.lines.push(e||{account_id:"",third_party_id:"",debit:0,credit:0,description:"",cross_doc_ref:"",ret_base:"",ret_rate:""}),rt()}function lr(e){ce.lines.splice(e,1),rt()}function zs(e){const t=ce.lines[e];if(!t||!(e===ce.lines.length-1))return;const o=Number(t.debit||0),s=Number(t.credit||0),n=o>0&&s<=0||s>0&&o<=0;!t.account_id||!n||ct()}function dr(e){openLineComment(e,"new")}function Ws(e,t,a){if(ce.lines[e][t]=a,t==="debit"&&Number(a)>0&&(ce.lines[e].credit=0),t==="credit"&&Number(a)>0&&(ce.lines[e].debit=0),t==="account_id"){ce.lines[e].cross_doc_ref="",ce.lines[e].ret_base="";const o=ce.accountMap.get(a);if(o!=null&&o.maneja_retenciones){const s=(o.tipos_retencion||"").split(",").filter(Boolean);ce.lines[e].ret_rate=String(pt(s,o))}else ce.lines[e].ret_rate="";rt(!0)}else if(t==="ret_base"||t==="ret_rate"){const o=Number(ce.lines[e].ret_base||0),s=Number(ce.lines[e].ret_rate||0),n=document.getElementById(`ret-calc-${e}`);n&&(n.textContent=o&&s?fmt(o*s/100):"$0")}else if(t==="debit"||t==="credit"){const o=t==="debit"?"credit":"debit",s=document.getElementById(`tx-line-${o}-${e}`);if(s){const n=Number(a)>0;s.disabled=n,n&&(s.value="")}Ys()}else rt(!1)}function pr(e){const t=ce.lines[e],a=Number(t.ret_base||0),o=ce.accountMap.get(t.account_id),s=((o==null?void 0:o.tipos_retencion)||"").split(",").filter(Boolean),n=Number(t.ret_rate||pt(s,o)||0);if(ce.lines[e].ret_rate=n?String(n):"",!a||!n)return showToast("Ingresa la base gravable para calcular la retención","warning");const i=Math.round(a*n/100);(o==null?void 0:o.nature)==="debit"?(ce.lines[e].debit=i,ce.lines[e].credit=0):(ce.lines[e].credit=i,ce.lines[e].debit=0),rt(!0),zs(e),showToast(`Retención aplicada: ${fmt(i)}`,"success")}function Ys(){const e=ce.lines.reduce((o,s)=>(o.d+=Number(s.debit||0),o.c+=Number(s.credit||0),o),{d:0,c:0}),t=Math.abs(e.d-e.c)<1e-4&&e.d>0,a=$("#tx-balance");a&&(a.className=`balance-indicator ${t?"balance-ok":"balance-err"}`,a.innerHTML=t?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(e.d)} = Crédito ${fmt(e.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(e.d-e.c))}`)}function rt(e=!0){if(e){const s=ce.lines.map((n,i)=>{const c=ce.accountMap.get(n.account_id),r=!!(c!=null&&c.requires_third_party),l=!!(c!=null&&c.maneja_cruce),p=!!(c!=null&&c.maneja_retenciones),m=!!String(n.description||"").trim(),f=((c==null?void 0:c.tipos_retencion)||"").split(",").filter(Boolean),d=Number(n.ret_base||0),g=Number(n.ret_rate!==""?n.ret_rate:f.length?pt(f,c):0),u=d&&g?fmt(d*g/100):"$0",y=Number(n.debit||0),v=Number(n.credit||0);return`
      <div class="tx-line-row" data-i="${i}" style="display:grid;grid-template-columns:minmax(250px,320px) minmax(260px,1fr) minmax(160px,190px) minmax(120px,140px) minmax(120px,140px) auto auto;gap:8px;align-items:center">
        <select class="form-input" style="font-size:13px" onchange="updateTxLine(${i}, 'account_id', this.value)">
          <option value="">Seleccione cuenta...</option>
          ${ce.accounts.map(b=>{const h=ce.postableAccountIds.has(b.id);return`<option value="${esc(b.id)}" ${n.account_id===b.id?"selected":""} ${h?"":"disabled"}>${esc(b.code)} - ${esc(b.name)}${h?"":" [MAYOR]"}</option>`}).join("")}
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

        <button class="btn btn-outline btn-sm" title="Comentario por registro" style="${m?"border-color:#16A34A;color:#16A34A;background:#F0FDF4":"border-color:#64748B;color:#334155"}" onclick="editTxLineComment(${i})"><i class="fas fa-comment-dots"></i></button>
        <button class="btn btn-danger btn-sm" onclick="removeTxLine(${i})"><i class="fas fa-xmark"></i></button>
      </div>
      ${p?`
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:-2px 0 6px 0;padding:7px 10px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:0 6px 6px 0">
        <i class="fas fa-percent" style="color:#D97706;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#92400E;white-space:nowrap">Calculadora de Retención</span>
         ${f.map(b=>`<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:10px">${ko(b,c)}</span>`).join("")}
        <span class="text-xs" style="color:#92400E">Base:</span>
        <input class="form-input" style="max-width:140px;font-size:13px" type="number" min="0" step="1" placeholder="Base gravable"
               value="${esc(n.ret_base||"")}" oninput="updateTxLine(${i}, 'ret_base', this.value)">
        <span class="text-xs" style="color:#92400E">×</span>
         <span class="badge" style="background:#FDE68A;color:#92400E;font-size:11px">${esc(g)}%</span>
        <span class="text-xs" style="color:#92400E">=</span>
        <span id="ret-calc-${i}" class="text-sm font-bold" style="color:#D97706;min-width:70px">${u}</span>
        <button class="btn btn-sm" style="background:#D97706;color:#fff;padding:4px 10px;font-size:12px" onclick="applyRetentionCalc(${i})">
          <i class="fas fa-check"></i> Aplicar al comprobante
        </button>
      </div>`:""}`}).join("");$("#tx-lines").innerHTML=s||'<p style="color:#9CA3AF">Agrega al menos una línea.</p>',Uo("new")}const t=ce.lines.reduce((s,n)=>(s.d+=Number(n.debit||0),s.c+=Number(n.credit||0),s),{d:0,c:0}),a=Math.abs(t.d-t.c)<1e-4&&t.d>0,o=$("#tx-balance");o&&(o.className=`balance-indicator ${a?"balance-ok":"balance-err"}`,o.innerHTML=a?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(t.d)} = Crédito ${fmt(t.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(t.d-t.c))}`)}let wt=null,Fa="new",Et=null;function ga(){if(Et=null,wt){const e=wt;if(wt=null,openModal(e.title,e.body,e.footer,e.wide),e.editForm){const t=$("#edit-tx-date"),a=$("#edit-tx-third"),o=$("#edit-tx-third-search"),s=$("#edit-tx-desc");t&&(t.value=e.editForm.date||""),a&&(a.value=e.editForm.third||""),o&&(o.value=e.editForm.thirdLabel||""),s&&(s.value=e.editForm.desc||""),ae&&(ae.selectedThird=e.editForm.third||"")}if(e.newForm){const t=$("#tx-type"),a=$("#tx-number"),o=$("#tx-date"),s=$("#tx-third"),n=$("#tx-third-search"),i=$("#tx-desc"),c=$("#tx-payment-days");t&&e.newForm.type&&(t.value=e.newForm.type),a&&(a.value=e.newForm.number||""),o&&(o.value=e.newForm.date||""),s&&e.newForm.third&&(s.value=e.newForm.third),n&&(n.value=e.newForm.thirdLabel||""),i&&(i.value=e.newForm.desc||""),c&&(c.value=e.newForm.payDays||"0");const r=$("#btn-cartera");r&&(r.disabled=!e.newForm.third),La()}jo();return}closeModal()}function ur(e,t){var s,n;const o=((s=(t==="edit"?ae:ce).lines[e])==null?void 0:s.third_party_id)||(t==="edit"?((n=$("#edit-tx-third"))==null?void 0:n.value)||(ae==null?void 0:ae.selectedThird):getSelectVal("tx-third"));if(!o){showToast("Selecciona un tercero para esta línea o en el encabezado","warning");return}Et=e,Fa=t,Da(o,{returnToPrevious:!0,skipCtxOverride:!0})}async function Da(e,t={}){var r,l,p,m,f,d,g,u,y,v,b,h,_,A,C,I,N,T,S,w,E,L,R,B,M;const{returnToPrevious:a=!1,skipCtxOverride:o=!1}=t;if(!e)return;const s=!!$("#edit-tx-third")&&!!((r=ae==null?void 0:ae.accountMap)!=null&&r.size);o||(Fa=a||s?"edit":"new");const n=s?ae:ce,i=(n.terceros||[]).find(k=>k.id===e),c=new Set([...((p=(l=n.accountMap)==null?void 0:l.values)==null?void 0:p.call(l))||[]].filter(k=>k.maneja_cruce).map(k=>k.id));a&&((m=$("#modal-overlay"))!=null&&m.classList.contains("show"))?wt={title:((f=$("#modal-title"))==null?void 0:f.innerHTML)||"",body:((d=$("#modal-body"))==null?void 0:d.innerHTML)||"",footer:((g=$("#modal-footer"))==null?void 0:g.innerHTML)||"",wide:((u=$("#modal-box"))==null?void 0:u.classList.contains("wide"))||!1,editForm:{date:((y=$("#edit-tx-date"))==null?void 0:y.value)||"",third:((v=$("#edit-tx-third"))==null?void 0:v.value)||"",thirdLabel:((b=$("#edit-tx-third-search"))==null?void 0:b.value)||"",desc:((h=$("#edit-tx-desc"))==null?void 0:h.value)||""},newForm:{type:((_=$("#tx-type"))==null?void 0:_.value)||"",number:((A=$("#tx-number"))==null?void 0:A.value)||"",date:((C=$("#tx-date"))==null?void 0:C.value)||"",third:((I=$("#tx-third"))==null?void 0:I.value)||"",thirdLabel:((N=$("#tx-third-search"))==null?void 0:N.value)||"",desc:((T=$("#tx-desc"))==null?void 0:T.value)||"",payDays:((S=$("#tx-payment-days"))==null?void 0:S.value)||"0"}}:wt=null,openModal(`<i class="fas fa-file-invoice-dollar mr-2" style="color:#1A4B8C"></i>Cartera: ${esc((i==null?void 0:i.name)||e)}`,'<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando movimientos...</div>','<button class="btn btn-outline" onclick="closeCarteraModal()">Cerrar</button>',!0);try{if(!c.size){document.querySelector('#modal-body, .modal-body, [id*="modal"] .p-6')&&(document.querySelector('#modal-body, .modal-body, [id*="modal"] .p-6').innerHTML='<p class="text-center py-6" style="color:#9CA3AF">No hay cuentas configuradas con documento de cruce.</p>');return}const k=pb.escapeFilterValue(e);let j;try{j=await pb.listAll("tx_lines",{filter:`tx_id.third_party_id="${k}" && account_id.maneja_cruce=true`,expand:"account_id,tx_id",sort:"tx_id.date"})}catch{const z=await pb.listAll("tx_lines",{filter:`tx_id.third_party_id="${k}"`,expand:"account_id,tx_id",sort:"-id"});j={items:(Array.isArray(z)?z:(z==null?void 0:z.items)||[]).filter(J=>c.has(J.account_id))}}const Y=j.items??j,W=new Map;for(const U of Y){const z=(U.cross_doc_ref||"").trim();if(!z)continue;W.has(z)||W.set(z,{ref:z,account:((E=(w=U.expand)==null?void 0:w.account_id)==null?void 0:E.name)||U.account_id,firstDate:((R=(L=U.expand)==null?void 0:L.tx_id)==null?void 0:R.date)||"",debit:0,credit:0,txNumbers:new Set});const J=W.get(z);J.debit+=Number(U.debit||0),J.credit+=Number(U.credit||0),(M=(B=U.expand)==null?void 0:B.tx_id)!=null&&M.number&&J.txNumbers.add(U.expand.tx_id.number)}if(!W.size){va('<p class="text-center py-8" style="color:#9CA3AF"><i class="fas fa-check-circle mr-2" style="color:#22C55E"></i>No hay documentos de cruce pendientes para este tercero.</p>');return}const K=[...W.values()].map(U=>{const z=Number(U.credit||0)-Number(U.debit||0),J=Math.abs(z),te=J<.01;return{...U,saldo:J,esCancelado:te,netOpen:z}}),H=K.filter(U=>!U.esCancelado),x=K.filter(U=>U.esCancelado),P=(U,z)=>`
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
        </tr>`,V=H.reduce((U,z)=>U+z.saldo,0);va(`
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
      `)}catch(k){va(`<p class="text-center py-6" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(k.message)}</p>`)}}function va(e){const t=$("#modal-body");t&&(t.innerHTML=e)}function Js(){const e=getSelectVal("tx-type"),t=ce.txTypes.find(o=>o.id===e);if(!t)return null;const a=`${t.code||""} ${t.prefix||""} ${t.name||""} ${t.description||""}`.toLowerCase();return/(recaudo|recibo|ingreso\s+de\s+caja|recaudo\s+de\s+cartera)/.test(a)?"recaudo":/(egreso|pago\s+a\s+proveedores|pago\s+proveedor|pago\s+proveedores|salida\s+de\s+caja)/.test(a)?"egreso":null}function Za(e,t,a=ce){const o=Js();if(!o)return!1;const s=Number(t||0);if(!Number.isFinite(s)||Math.abs(s)<1e-4)return!1;let n=0,i=0;return o==="recaudo"?s<0?n=Math.abs(s):i=Math.abs(s):s>0?i=Math.abs(s):n=Math.abs(s),a.lines[e].debit=n,a.lines[e].credit=i,!0}function mr(e,t=0){var c;const a=Fa==="edit"||!!$("#edit-tx-lines")&&!!((c=ae==null?void 0:ae.accountMap)!=null&&c.size),o=a?ae:ce,s=a?Je:rt;if(Et!==null){const r=Et;Et=null,o.lines[r].cross_doc_ref=e;const l=Za(r,t,o);ga(),s(!0),l?showToast(`Documento "${e}" aplicado a la línea ${r+1} con valor ${fmt(Math.abs(Number(t||0)))}`,"success"):showToast(`Documento "${e}" aplicado a la línea ${r+1}`,"success");return}const n=o.lines.findIndex(r=>{const l=o.accountMap.get(r.account_id);return(l==null?void 0:l.maneja_cruce)&&!r.cross_doc_ref}),i=r=>{o.lines[r].cross_doc_ref=e;const l=Za(r,t,o);ga(),s(!0),l?showToast(`Documento "${e}" aplicado a la línea ${r+1} con valor ${fmt(Math.abs(Number(t||0)))}`,"success"):showToast(`Documento "${e}" aplicado a la línea ${r+1}`,"success")};if(n===-1){const r=o.lines.findIndex(l=>{var p;return(p=o.accountMap.get(l.account_id))==null?void 0:p.maneja_cruce});if(r===-1){ga(),showToast("Primero selecciona una cuenta con documento de cruce en las líneas del comprobante","warning");return}i(r);return}i(n)}async function Ks(e=!1){var t;if(!can("canWrite"))return showToast("No tienes permisos para registrar transacciones","error");try{const a=getSelectVal("tx-type"),o=getInputVal("tx-date"),s=getInputVal("tx-desc"),n=getSelectVal("tx-third"),i=ce.lines.filter(m=>m.account_id&&(Number(m.debit)>0||Number(m.credit)>0));if(!a||!o)return showToast("Completa tipo y fecha","warning");if(!s)return showToast("La descripción es obligatoria","warning");if(typeof isPeriodClosed=="function"&&await isPeriodClosed(o))return showToast(`El período ${o.slice(0,7)} no está habilitado o está cerrado. Habilítalo en Cierre Contable antes de registrar.`,"error");if(!i.length)return showToast("Debe existir al menos una línea válida","warning");if(i.length<2)return showToast("Se requieren al menos 2 líneas contables","warning");const c=i.find(m=>!ce.postableAccountIds.has(m.account_id));if(c){const m=ce.accounts.find(f=>f.id===c.account_id);return showToast(`La cuenta ${(m==null?void 0:m.code)||""} es de mayor; usa una cuenta auxiliar para registrar movimientos`,"error")}const r=i.find(m=>{const f=ce.accounts.find(d=>d.id===m.account_id);return!!(f!=null&&f.requires_third_party)&&!(m.third_party_id||n)});if(r){const m=ce.lines.indexOf(r);return showToast(`La línea ${m+1} requiere tercero. Selecciónalo en la línea o en el encabezado.`,"error")}const l=i.reduce((m,f)=>({d:m.d+Number(f.debit||0),c:m.c+Number(f.credit||0)}),{d:0,c:0});if(Math.abs(l.d-l.c)>1e-4||l.d<=0)return showToast("La transacción no está cuadrada","error");const p=await API.createTransaction({tx_type_id:a,number:"",date:o,description:s,third_party_id:n||null,user_id:(t=pb.currentUser)==null?void 0:t.id,payment_days:parseInt(getInputVal("tx-payment-days"),10)||0,cross_enabled:i.some(m=>{var f;return(f=ce.accountMap.get(m.account_id))==null?void 0:f.maneja_cruce}),status:"draft"},i.map((m,f)=>({account_id:m.account_id,third_party_id:m.third_party_id||n||null,debit:Number(m.debit||0),credit:Number(m.credit||0),description:m.description||s,line_order:f+1,cross_doc_ref:m.cross_doc_ref||""})));if(e&&can("canApprove")?(await API.approveTx(p.id),showToast(`Transacción ${p.number} guardada y aprobada.`,"success")):showToast(`Transacción ${p.number} guardada como borrador. Pendiente de aprobación.`,"success"),ce.inModal){closeModal();const m=o.slice(0,7);he.typeIdsByPeriod[m]&&delete he.typeIdsByPeriod[m],$("#ctxq-results")&&(await _t(),Re())}else navigate("consulta-tx")}catch(a){showToast(a.message,"error")}}let he={page:1,perPage:50,total:0,txTypes:[],periods:[],typeIdsByPeriod:{}};function Ra(e){const[t,a]=String(e||"").split("-"),o=Number(t),s=Number(a);if(!Number.isFinite(o)||!Number.isFinite(s)||s<1||s>12)return null;const n=`${t}-${String(s).padStart(2,"0")}-01`,i=s===12?`${String(o+1)}-01-01`:`${t}-${String(s+1).padStart(2,"0")}-01`;return{from:n,next:i}}function Qs(e){if(!e)return[];let t;try{t=JSON.parse(e)}catch{return[]}return Array.isArray(t)?t.filter(a=>a&&/^\d{4}-\d{2}$/.test(String(a.key||""))&&a.enabled!==!1).map(a=>({key:String(a.key),closed:!!a.closed})).sort((a,o)=>o.key.localeCompare(a.key)):[]}function Xa(){const e=new Date,t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0");return`${t}-${a}`}async function _t(){const e=$("#txq-type"),t=getSelectVal("txq-period");if(e){if(!t){e.innerHTML='<option value="">Selecciona tipo de transacción</option>',e.value="",e.disabled=!0;return}e.innerHTML='<option value="">Cargando tipos del período...</option>',e.disabled=!0;try{let a=he.typeIdsByPeriod[t];if(!Array.isArray(a)){const s=Ra(t);if(!s){e.innerHTML='<option value="">Período inválido</option>',e.value="",e.disabled=!0;return}const n=await pb.listAll("transactions",{filter:`date>="${s.from}" && date<"${s.next}"`,fields:"tx_type_id"});a=[...new Set(n.map(i=>i.tx_type_id).filter(Boolean))],he.typeIdsByPeriod[t]=a}const o=he.txTypes.filter(s=>a.includes(s.id)).sort((s,n)=>`${s.prefix||""}${s.name||""}`.localeCompare(`${n.prefix||""}${n.name||""}`));if(!o.length){e.innerHTML='<option value="">Sin tipos usados en este período</option>',e.value="",e.disabled=!0;return}e.innerHTML=`<option value="">Selecciona tipo de transacción</option>${o.map(s=>`<option value="${esc(s.id)}">${esc(s.prefix)} - ${esc(s.name)}</option>`).join("")}`,e.value="",e.disabled=!1}catch(a){e.innerHTML='<option value="">Error cargando tipos</option>',e.value="",e.disabled=!0,showToast(a.message||"No se pudieron cargar los tipos del período.","error")}}}async function Zs(e){var t,a,o,s,n,i;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando transacciones...</div>';try{const[c,r]=await Promise.all([API.getTxTypes(),API.getSetting("periodos_cierre")]),l=Qs(r);he={page:1,perPage:50,total:0,txTypes:c,periods:l,typeIdsByPeriod:{}},e.innerHTML=`
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
      </div>`;const p=(d="")=>{const g=getSelectVal("txq-period-state"),u=$("#txq-period"),y=$("#txq-type");if(!u||!y)return;const v=he.periods.filter(b=>g==="open"?!b.closed:g==="closed"?b.closed:!1);if(u.innerHTML=`<option value="">Selecciona un período</option>${v.map(b=>`<option value="${esc(b.key)}">${esc(b.key)} (${b.closed?"Cerrado":"Abierto"})</option>`).join("")}`,u.disabled=!g,!g||!v.length)u.value="";else{const b=d&&v.some(h=>h.key===d)?d:v[0].key;u.value=b}y.value="",y.disabled=!0},m=()=>{if(!getSelectVal("txq-period-state"))return showToast("Selecciona el estado del período (abierto/cerrado).","warning");if(!getSelectVal("txq-period"))return showToast("Selecciona un período para filtrar la consulta.","warning");if(!getSelectVal("txq-type"))return showToast("Selecciona el tipo de transacción a consultar.","warning");he.page=1,Re()};if((t=$("#btn-txq-search"))==null||t.addEventListener("click",m),(a=$("#txq"))==null||a.addEventListener("keydown",d=>{d.key==="Enter"&&m()}),(o=$("#txq-period-state"))==null||o.addEventListener("change",async()=>{p(),await _t()}),(s=$("#txq-period"))==null||s.addEventListener("change",async()=>{await _t()}),(n=$("#btn-txq-clear"))==null||n.addEventListener("click",async()=>{["txq"].forEach(g=>setInputVal(g,"")),["txq-type","txq-status"].forEach(g=>{const u=$(`#${g}`);u&&(u.value="")});const d=$("#txq-period-state");d&&(d.value="open"),p(Xa()),await _t(),$("#ctxq-results").innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-filter mr-2"></i>Selecciona estado de período, período y tipo para consultar.</div>',$("#ctxq-pagination").style.display="none"}),(i=$("#btn-export-tx"))==null||i.addEventListener("click",Xs),l.filter(d=>!d.closed).length){const d=$("#txq-period-state");d&&(d.value="open"),p(Xa()),await _t()}l.length||showToast("No hay períodos configurados. Habilítalos en Cierre Contable para usar esta consulta.","warning")}catch(c){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(c.message)}</div>`}}async function Re(){var a,o;const e=$("#ctxq-results"),t=$("#ctxq-pagination");if(e){e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const s=getInputVal("txq").trim(),n=getSelectVal("txq-period-state"),i=getSelectVal("txq-period"),c=getSelectVal("txq-type"),r=getSelectVal("txq-status");if(!n||!i||!c){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-filter mr-2"></i>Completa los filtros obligatorios para consultar.</div>',t.style.display="none";return}const l=Ra(i);if(!l){e.innerHTML='<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>Período inválido.</div>',t.style.display="none";return}const p=[],m=pb.escapeFilterValue(c);if(p.push(`tx_type_id="${m}"`),p.push(`date>="${l.from}"`),p.push(`date<"${l.next}"`),r){const v=pb.escapeFilterValue(r);p.push(`status="${v}"`)}if(s){const v=pb.escapeFilterValue(s);p.push(`(number~"${v}" || description~"${v}")`)}const f={page:he.page,perPage:he.perPage,sort:"-id",filter:p.join(" && ")||"",expand:"tx_type_id,third_party_id"},d=await pb.list("transactions",f);he.total=d.totalItems;const g=Math.ceil(d.totalItems/he.perPage)||1,u=new Map,y=d.items.map(v=>v.id).filter(Boolean);if(y.length){const v=y.map(h=>`tx_id="${pb.escapeFilterValue(h)}"`).join(" || ");(await pb.listAll("tx_lines",{filter:v})).forEach(h=>{const _=h.tx_id;u.has(_)||u.set(_,{d:0,c:0});const A=u.get(_);A.d+=Number(h.debit||0),A.c+=Number(h.credit||0)})}if(!d.items.length){e.innerHTML='<div class="p-10 text-center" style="color:#9CA3AF">No se encontraron transacciones con los filtros aplicados.</div>',t.style.display="none";return}e.innerHTML=`
      <div class="overflow-x-auto">
        <table class="data-table" id="tx-table">
          <thead><tr><th>Número</th><th>Fecha</th><th>Tercero</th><th>Descripción</th><th>Débito</th><th>Crédito</th><th>Balance</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            ${d.items.map(v=>{var A,C;const b=u.get(v.id)||{d:0,c:0},h=Math.abs(Number(b.d||0)-Number(b.c||0)),_=h<1e-4;return`
              <tr>
                <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(v.number||"")}</span></td>
                <td>${esc(v.date)}</td>
                <td>${esc(((C=(A=v.expand)==null?void 0:A.third_party_id)==null?void 0:C.name)||"—")}</td>
                <td class="max-w-xs truncate" title="${esc(v.description||"")}">${esc(v.description||"—")}</td>
                <td class="font-semibold" style="color:#065F46">${fmt(b.d||0)}</td>
                <td class="font-semibold" style="color:#1E3A8A">${fmt(b.c||0)}</td>
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
        <span class="text-sm font-medium px-2 flex items-center">Pág. ${he.page} / ${g}</span>
        <button class="btn btn-outline btn-sm" id="ctxq-next" ${he.page>=g?"disabled":""}>Sig. <i class="fas fa-chevron-right"></i></button>
      </div>`,(a=$("#ctxq-prev"))==null||a.addEventListener("click",()=>{he.page--,Re()}),(o=$("#ctxq-next"))==null||o.addEventListener("click",()=>{he.page++,Re()})}catch(s){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(s.message)}</div>`}}}async function Xs(){if(!can("canExport"))return showToast("Sin permisos de exportación","error");try{showToast("Generando exportación...","info");const e=getInputVal("txq").trim(),t=getSelectVal("txq-period-state"),a=getSelectVal("txq-period"),o=getSelectVal("txq-type"),s=getSelectVal("txq-status");if(!t||!a||!o)return showToast("Para exportar debes seleccionar estado de período, período y tipo.","warning");const n=Ra(a);if(!n)return showToast("Período inválido para exportación.","error");const i=[],c=pb.escapeFilterValue(o);if(i.push(`tx_type_id="${c}"`),i.push(`date>="${n.from}"`),i.push(`date<"${n.next}"`),s){const l=pb.escapeFilterValue(s);i.push(`status="${l}"`)}if(e){const l=pb.escapeFilterValue(e);i.push(`(number~"${l}" || description~"${l}")`)}const r=await pb.listAll("transactions",{sort:"-id",filter:i.join(" && ")||"",expand:"tx_type_id,third_party_id"});exportToExcel(r.map(l=>{var p,m,f,d;return{Número:l.number||"",Fecha:l.date,Tipo:((m=(p=l.expand)==null?void 0:p.tx_type_id)==null?void 0:m.name)||"",Tercero:((d=(f=l.expand)==null?void 0:f.third_party_id)==null?void 0:d.name)||"",Descripción:l.description||"",Estado:l.status==="voided"?"Anulada":"Activa"}}),`transacciones_${todayStr()}`)}catch(e){showToast(e.message,"error")}}async function fr(e){var t,a;try{const o=await pb.get("transactions",e,{expand:"tx_type_id,third_party_id,user_id"}),s=await API.getTxLines(e);openModal(`Transacción ${esc(o.number||"")}`,`
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
        <div><strong>Fecha:</strong> ${esc(o.date)}</div>
        <div><strong>Tercero:</strong> ${esc(((a=(t=o.expand)==null?void 0:t.third_party_id)==null?void 0:a.name)||"—")}</div>
        <div><strong>Estado:</strong> ${esc(o.status)}</div>
      </div>
      <p class="mb-4" style="color:#6B7280">${esc(o.description||"")}</p>
      <div class="overflow-x-auto">
        <table class="data-table"><thead><tr><th>Cuenta</th><th>Tercero línea</th><th>Doc. Cruce</th><th>Descripción</th><th>Débito</th><th>Crédito</th></tr></thead>
          <tbody>${s.map(n=>{var i,c,r,l,p,m;return`<tr><td>${esc(((c=(i=n.expand)==null?void 0:i.account_id)==null?void 0:c.code)||"")} - ${esc(((l=(r=n.expand)==null?void 0:r.account_id)==null?void 0:l.name)||"")}</td><td>${esc(((m=(p=n.expand)==null?void 0:p.third_party_id)==null?void 0:m.name)||"—")}</td><td>${n.cross_doc_ref?`<span class="badge" style="background:#EFF6FF;color:#1A4B8C"><i class="fas fa-link mr-1"></i>${esc(n.cross_doc_ref)}</span>`:"—"}</td><td>${esc(n.description||"—")}</td><td>${fmt(n.debit||0)}</td><td>${fmt(n.credit||0)}</td></tr>`}).join("")}</tbody>
        </table>
      </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       <button class="btn btn-outline" style="border-color:#334155;color:#334155" onclick="printTxNotaContable('${esc(e)}')"><i class="fas fa-print mr-1"></i>Imprimir nota contable</button>`,!0)}catch(o){showToast(o.message,"error")}}function br(e,t){if(!can("canApprove"))return showToast("No tienes permisos para aprobar transacciones","error");confirmDialog("Aprobar transacción",`¿Confirmas aprobar la transacción <strong>${esc(t)}</strong>? Quedará <strong>Activa</strong> y se reflejará en los reportes contables.`,async()=>{try{await API.approveTx(e),showToast(`Transacción ${t} aprobada exitosamente.`,"success"),typeof Re=="function"&&Re()}catch(a){showToast(a.message,"error")}})}function gr(e,t){if(!requireRole("admin"))return showToast("Solo el administrador puede revertir transacciones a Borrador","error");confirmDialog("Revertir a Borrador",`¿Confirmas revertir la transacción <strong>${esc(t)}</strong> a estado <strong>Borrador</strong>? Dejará de reflejarse en los reportes hasta ser aprobada nuevamente.`,async()=>{try{await API.revertTxToDraft(e),showToast(`Transacción ${t} revertida a Borrador.`,"success"),typeof Re=="function"&&Re()}catch(a){showToast(a.message,"error")}})}function vr(e){if(!can("canDelete"))return showToast("No tienes permisos para anular","error");confirmDialog("Anular transacción","Esta acción cambia el estado a anulada. ¿Deseas continuar?",async()=>{try{if(typeof isPeriodClosed=="function"){const t=await pb.get("transactions",e);if(await isPeriodClosed(t.date))return showToast(`El período ${(t.date||"").slice(0,7)} no está habilitado o está cerrado. No se puede anular.`,"error")}await API.voidTransaction(e,"Anulación desde consulta"),showToast("Transacción anulada","success"),Zs($("#page-content"))}catch(t){showToast(t.message,"error")}})}let ae={txId:null,accounts:[],txTypes:[],terceros:[],selectedThird:"",lines:[],postableAccountIds:new Set,accountMap:new Map};async function hr(e){var t,a;if(!can("canWrite"))return showToast("No tienes permisos para modificar transacciones","error");openModal('<i class="fas fa-spinner fa-spin mr-2"></i>Verificando transacción...','<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos...</div>',"",!0);try{const[o,s,n,i,c]=await Promise.all([pb.get("transactions",e,{expand:"tx_type_id,third_party_id"}),API.getTxLines(e),API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]);if(o.status==="voided")return openModal("No permitido",'<p class="text-sm" style="color:#374151">No se puede modificar una transacción anulada.</p>','<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>');if(typeof isPeriodClosed=="function"&&await isPeriodClosed(o.date))return openModal("Período cerrado",`<p class="text-sm" style="color:#374151">El período <strong>${esc((o.date||"").slice(0,7))}</strong> está cerrado. Habilítalo en Cierre Contable para poder modificar esta transacción.</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>');const r=await API.checkTxDependencies(e);if(r.blocks.length){const d=r.blocks.map(g=>`<li class="text-sm py-1"><i class="fas fa-ban mr-2" style="color:#EF4444"></i>${esc(g)}</li>`).join("");return openModal('<i class="fas fa-lock mr-2" style="color:#EF4444"></i>No se puede modificar',`<p class="text-sm mb-3" style="color:#374151">Esta transacción tiene dependencias que impiden su modificación:</p><ul class="space-y-1">${d}</ul>`,'<button class="btn btn-outline" onclick="closeModal()">Entendido</button>')}const l=new Set(n.map(d=>d.parent_code).filter(Boolean)),p=new Set(n.filter(d=>!l.has(d.code)).map(d=>d.id)),m=new Map(n.map(d=>[d.id,d]));ae={txId:e,accounts:n,txTypes:i,terceros:c,postableAccountIds:p,accountMap:m,selectedThird:o.third_party_id||"",lines:s.map(d=>({account_id:d.account_id,third_party_id:d.third_party_id||o.third_party_id||"",debit:d.debit||0,credit:d.credit||0,description:d.description||"",cross_doc_ref:d.cross_doc_ref||"",ret_base:"",ret_rate:"",line_order:d.line_order||0}))};const f=r.warnings.length?`<div class="mb-4 p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #D97706">${r.warnings.map(d=>`<p class="text-sm" style="color:#92400E"><i class="fas fa-triangle-exclamation mr-2"></i>${esc(d)}</p>`).join("")}</div>`:"";openModal(`<i class="fas fa-pencil mr-2" style="color:#1A4B8C"></i>Modificar — ${esc(o.number||"")}`,`${f}
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
       <button class="btn btn-primary" onclick="saveEditTx('${esc(e)}')"><i class="fas fa-floppy-disk"></i> Guardar cambios</button>`,!0),Je(!0),jo()}catch(o){openModal("Error",`<p class="text-sm" style="color:#EF4444">${esc(o.message)}</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>')}}function jo(){const e=$("#edit-tx-third"),t=$("#edit-tx-third-search"),a=$("#btn-edit-cartera");!e||!a||!t||(ae&&(ae.selectedThird=e.value||ae.selectedThird||""),Mo({state:ae,hiddenId:"edit-tx-third",inputId:"edit-tx-third-search",resultsId:"edit-tx-third-results",onSelected:o=>{a.disabled=!o,ae&&(ae.selectedThird=o||"")}}),a.disabled=!e.value,a.onclick=()=>Da(e.value,{returnToPrevious:!0}))}function en(e=null){ae.lines.push(e||{account_id:"",third_party_id:"",debit:0,credit:0,description:"",cross_doc_ref:"",ret_base:"",ret_rate:""}),Je(!0)}function yr(e){ae.lines.splice(e,1),Je(!0)}function tn(e){const t=ae.lines[e];if(!t||!(e===ae.lines.length-1))return;const o=Number(t.debit||0),s=Number(t.credit||0),n=o>0&&s<=0||s>0&&o<=0;!t.account_id||!n||en()}function _r(e){openLineComment(e,"edit")}function an(e,t,a){if(ae.lines[e][t]=a,t==="debit"&&Number(a)>0&&(ae.lines[e].credit=0),t==="credit"&&Number(a)>0&&(ae.lines[e].debit=0),t==="account_id"){ae.lines[e].cross_doc_ref="",ae.lines[e].ret_base="";const o=ae.accountMap.get(a);if(o!=null&&o.maneja_retenciones){const s=(o.tipos_retencion||"").split(",").filter(Boolean);ae.lines[e].ret_rate=String(pt(s,o))}else ae.lines[e].ret_rate="";Je(!0)}else if(t==="ret_base"||t==="ret_rate"){const o=Number(ae.lines[e].ret_base||0),s=Number(ae.lines[e].ret_rate||0),n=document.getElementById(`edit-ret-calc-${e}`);n&&(n.textContent=o&&s?fmt(o*s/100):"$0")}else if(t==="debit"||t==="credit"){const o=t==="debit"?"credit":"debit",s=document.getElementById(`edit-tx-line-${o}-${e}`);if(s){const n=Number(a)>0;s.disabled=n,n&&(s.value="")}on()}else Je(!1)}function xr(e){const t=ae.lines[e],a=Number(t.ret_base||0),o=ae.accountMap.get(t.account_id),s=((o==null?void 0:o.tipos_retencion)||"").split(",").filter(Boolean),n=Number(t.ret_rate||pt(s,o)||0);if(ae.lines[e].ret_rate=n?String(n):"",!a||!n)return showToast("Ingresa la base gravable para calcular la retención","warning");const i=Math.round(a*n/100);(o==null?void 0:o.nature)==="debit"?(ae.lines[e].debit=i,ae.lines[e].credit=0):(ae.lines[e].credit=i,ae.lines[e].debit=0),Je(!0),tn(e),showToast(`Retención aplicada: ${fmt(i)}`,"success")}function on(){const e=ae.lines.reduce((o,s)=>(o.d+=Number(s.debit||0),o.c+=Number(s.credit||0),o),{d:0,c:0}),t=Math.abs(e.d-e.c)<1e-4&&e.d>0,a=document.getElementById("edit-tx-balance");a&&(a.className=`balance-indicator ${t?"balance-ok":"balance-err"}`,a.innerHTML=t?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(e.d)} = Crédito ${fmt(e.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(e.d-e.c))}`)}function Je(e=!0){if(e){const s=ae.lines.map((i,c)=>{const r=ae.accountMap.get(i.account_id),l=!!(r!=null&&r.requires_third_party),p=!!(r!=null&&r.maneja_cruce),m=!!(r!=null&&r.maneja_retenciones),f=!!String(i.description||"").trim(),d=((r==null?void 0:r.tipos_retencion)||"").split(",").filter(Boolean),g=Number(i.ret_base||0),u=Number(i.ret_rate!==""?i.ret_rate:d.length?pt(d,r):0),y=g&&u?fmt(g*u/100):"$0",v=Number(i.debit||0),b=Number(i.credit||0);return`
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

        <input id="edit-tx-line-debit-${c}" class="form-input text-right" ${b>0?"disabled":""} value="${i.debit?esc(i.debit):""}" placeholder="Débito" oninput="updateEditTxLine(${c}, 'debit', parseNum(this.value))" onblur="autoAppendEditTxLineFrom(${c})">
        <input id="edit-tx-line-credit-${c}" class="form-input text-right" ${v>0?"disabled":""} value="${i.credit?esc(i.credit):""}" placeholder="Crédito" oninput="updateEditTxLine(${c}, 'credit', parseNum(this.value))" onblur="autoAppendEditTxLineFrom(${c})">

        <button class="btn btn-outline btn-sm" title="Comentario por registro" style="${f?"border-color:#16A34A;color:#16A34A;background:#F0FDF4":"border-color:#64748B;color:#334155"}" onclick="editEditTxLineComment(${c})"><i class="fas fa-comment-dots"></i></button>
        <button class="btn btn-danger btn-sm" onclick="removeEditTxLine(${c})"><i class="fas fa-xmark"></i></button>
      </div>
      ${m?`
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:-2px 0 6px 0;padding:7px 10px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:0 6px 6px 0">
        <i class="fas fa-percent" style="color:#D97706;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#92400E;white-space:nowrap">Calculadora de Retención</span>
         ${d.map(h=>`<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:10px">${ko(h,r)}</span>`).join("")}
        <span class="text-xs" style="color:#92400E">Base:</span>
        <input class="form-input" style="max-width:140px;font-size:13px" type="number" min="0" step="1" placeholder="Base gravable"
               value="${esc(i.ret_base||"")}" oninput="updateEditTxLine(${c}, 'ret_base', this.value)">
        <span class="text-xs" style="color:#92400E">×</span>
         <span class="badge" style="background:#FDE68A;color:#92400E;font-size:11px">${esc(u)}%</span>
        <span id="edit-ret-calc-${c}" class="text-sm font-bold" style="color:#D97706;min-width:70px">${y}</span>
        <button class="btn btn-sm" style="background:#D97706;color:#fff;padding:4px 10px;font-size:12px" onclick="applyEditRetentionCalc(${c})">
          <i class="fas fa-check"></i> Aplicar
        </button>
      </div>`:""}`}).join(""),n=document.getElementById("edit-tx-lines");n&&(n.innerHTML=s||'<p style="color:#9CA3AF">Agrega al menos una línea.</p>'),Uo("edit")}const t=ae.lines.reduce((s,n)=>(s.d+=Number(n.debit||0),s.c+=Number(n.credit||0),s),{d:0,c:0}),a=Math.abs(t.d-t.c)<1e-4&&t.d>0,o=document.getElementById("edit-tx-balance");o&&(o.className=`balance-indicator ${a?"balance-ok":"balance-err"}`,o.innerHTML=a?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(t.d)} = Crédito ${fmt(t.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(t.d-t.c))}`)}async function Ar(e){var l,p,m,f;if(!can("canWrite"))return showToast("No tienes permisos para modificar transacciones","error");const t=((l=document.getElementById("edit-tx-date"))==null?void 0:l.value)||"",a=(((p=document.getElementById("edit-tx-desc"))==null?void 0:p.value)||"").trim(),o=((m=document.getElementById("edit-tx-third"))==null?void 0:m.value)||ae.selectedThird||"";if(!t)return showToast("La fecha es obligatoria","warning");if(!a)return showToast("La descripción es obligatoria","warning");const s=ae.lines.filter(d=>d.account_id&&(Number(d.debit)>0||Number(d.credit)>0));if(s.length<2)return showToast("Se requieren al menos 2 líneas contables","warning");const n=s.find(d=>!ae.postableAccountIds.has(d.account_id));if(n){const d=ae.accounts.find(g=>g.id===n.account_id);return showToast(`La cuenta ${(d==null?void 0:d.code)||""} es de mayor; usa una cuenta auxiliar`,"error")}const i=s.find(d=>{const g=ae.accounts.find(u=>u.id===d.account_id);return!!(g!=null&&g.requires_third_party)&&!(d.third_party_id||o)});if(i){const d=ae.lines.indexOf(i);return showToast(`La línea ${d+1} requiere tercero. Selecciónalo en la línea o en el encabezado.`,"error")}const c=s.reduce((d,g)=>({d:d.d+Number(g.debit||0),c:d.c+Number(g.credit||0)}),{d:0,c:0});if(Math.abs(c.d-c.c)>1e-4||c.d<=0)return showToast("La transacción no está cuadrada","error");if(typeof isPeriodClosed=="function"&&await isPeriodClosed(t))return showToast(`El período ${t.slice(0,7)} está cerrado. No se puede modificar.`,"error");const r=document.querySelector("#modal-footer .btn-primary");r&&(r.disabled=!0,r.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{await API.updateTransaction(e,{date:t,description:a,third_party_id:o||null,payment_days:parseInt((f=document.getElementById("edit-tx-payment-days"))==null?void 0:f.value,10)||0},s.map((d,g)=>({account_id:d.account_id,third_party_id:d.third_party_id||o||null,debit:Number(d.debit||0),credit:Number(d.credit||0),description:d.description||a,line_order:g+1,cross_doc_ref:d.cross_doc_ref||""}))),closeModal(),showToast("Transacción modificada exitosamente","success"),Re()}catch(d){r&&(r.disabled=!1,r.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar cambios'),showToast(d.message,"error")}}function $r(e,t){if(!requireRole("admin"))return showToast("Solo el administrador puede eliminar transacciones físicamente","error");openModal('<i class="fas fa-spinner fa-spin mr-2"></i>Verificando dependencias...','<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Analizando...</div>',"",!1),API.checkTxDependencies(e).then(a=>{if(a.blocks.length){const s=a.blocks.map(n=>`<li class="text-sm py-1"><i class="fas fa-ban mr-2" style="color:#EF4444"></i>${esc(n)}</li>`).join("");return openModal('<i class="fas fa-lock mr-2" style="color:#EF4444"></i>No se puede eliminar',`<p class="text-sm mb-3" style="color:#374151">Esta transacción no puede eliminarse por las siguientes razones:</p>
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
       </button>`)}).catch(a=>{openModal("Error",`<p class="text-sm" style="color:#EF4444">${esc(a.message)}</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>')})}async function wr(e,t){var s;if((((s=document.getElementById("delete-tx-confirm-input"))==null?void 0:s.value)||"").trim()!==t)return showToast(`Escribe exactamente: ${t}`,"warning");const o=document.getElementById("btn-confirm-delete-tx");o&&(o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Eliminando...');try{await pb.delete("transactions",e),await API.logAudit("DELETE","transactions",e,`Eliminación física del comprobante ${t}`),closeModal(),showToast(`Comprobante ${t} eliminado permanentemente`,"success"),Re()}catch(n){o&&(o.disabled=!1,o.innerHTML='<i class="fas fa-trash"></i> Eliminar definitivamente'),showToast(n.message,"error")}}async function Er(e){var t,a,o,s,n,i,c,r,l,p,m;try{const[f,d,g,u,y]=await Promise.all([pb.get("transactions",e,{expand:"tx_type_id,third_party_id,user_id"}),API.getTxLines(e),API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>"")]),v=d.reduce((E,L)=>E+Number(L.debit||0),0),b=d.reduce((E,L)=>E+Number(L.credit||0),0),h=((a=(t=f.expand)==null?void 0:t.tx_type_id)==null?void 0:a.name)||((s=(o=f.expand)==null?void 0:o.tx_type_id)==null?void 0:s.prefix)||"",_=((i=(n=f.expand)==null?void 0:n.third_party_id)==null?void 0:i.name)||"",A=((r=(c=f.expand)==null?void 0:c.third_party_id)==null?void 0:r.doc_number)||"",C=((p=(l=f.expand)==null?void 0:l.user_id)==null?void 0:p.name)||"",I=((m=pb.currentUser)==null?void 0:m.name)||"",N=d.map((E,L)=>{var K,H,x,P,V,U;const R=((H=(K=E.expand)==null?void 0:K.account_id)==null?void 0:H.code)||"",B=((P=(x=E.expand)==null?void 0:x.account_id)==null?void 0:P.name)||"",M=((U=(V=E.expand)==null?void 0:V.third_party_id)==null?void 0:U.name)||_||"—",k=E.cross_doc_ref||"",j=Number(E.debit||0),Y=Number(E.credit||0),W=j>0;return`
        <tr class="${L%2===0?"row-even":"row-odd"}">
          <td class="col-num">${L+1}</td>
          <td class="col-code">${esc(R)}</td>
          <td class="col-acct">${esc(B)}</td>
          <td class="col-third">${esc(M)}</td>
          <td class="col-cross">${k?esc(k):""}</td>
          <td class="col-desc">${esc(E.description||f.description||"")}</td>
          <td class="col-money debit">${W?fmt(j):""}</td>
          <td class="col-money credit">${W?"":fmt(Y)}</td>
        </tr>`}).join(""),T=new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"}),S=`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Nota Contable ${esc(f.number||"")}</title>
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
      <div class="company-name">${esc(g||"GRAVY")}</div>
      ${u?`<div class="company-sub">NIT: ${esc(u)}</div>`:""}
      ${y?`<div class="company-sub">${esc(y)}</div>`:""}
    </div>
    <div class="doc-block">
      <div class="doc-type">${esc(h)}</div>
      <div class="doc-number">${esc(f.number||"")}</div>
      <div class="doc-date">${esc(f.date||"")}</div>
      ${f.status==="voided"?'<div style="color:#DC2626;font-weight:bold;font-size:10pt;margin-top:4px">&#x26D4; ANULADO</div>':""}
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-row">
      <span class="meta-label">Tercero:</span>
      <span class="meta-value">${_?esc(_)+(A?" — "+esc(A):""):"—"}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Impreso por:</span>
      <span class="meta-value">${esc(I||"—")}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Concepto:</span>
      <span class="meta-value">${esc(f.description||"—")}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Fecha impresión:</span>
      <span class="meta-value">${T}</span>
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
        <td class="totals-credit">${fmt(b)}</td>
      </tr>
      <tr>
        <td colspan="8" style="text-align:right;border-top:none;padding-top:3px">
          ${Math.abs(v-b)<1e-4?'<span class="balanced-ok">&#x2713; Comprobante cuadrado — Débito = Crédito</span>':`<span class="balanced-err">&#x26A0; Descuadre: ${fmt(Math.abs(v-b))}</span>`}
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
      ${esc(f.number||"")} &mdash; ${esc(f.date||"")}
    </div>
  </div>

  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`,w=window.open("","_blank","width=900,height=700,scrollbars=yes");if(!w)return showToast("El navegador bloqueó la ventana emergente. Permite ventanas emergentes para imprimir.","warning");w.document.open(),w.document.write(S),w.document.close()}catch(f){showToast("Error al generar la nota contable: "+f.message,"error")}}async function Cr(e){return qs(e)}window.TX_EDIT_STATE=ae;window.editEditTxLineComment=_r;window.renderNuevaTx=qs;window.getCrossAutoMode=Js;window.loadConsultaTxPage=Re;window.RET_RATE_FIELD_BY_TYPE=Oo;window.addEditTxLine=en;window.bindNewTxModalEvents=La;window.updateEditTxLine=an;window.editTxLineComment=dr;window._confirmDeleteTx=wr;window.exportConsultaTx=Xs;window.buildTxTypeOptions=Vo;window.closeCarteraModal=ga;window.updateTypeOptionsForPeriod=_t;window.renderThirdSearchResults=Bo;window.CTXQ_STATE=he;window.seeTxDetail=fr;window.editTx=hr;window.useCrossDoc=mr;window.applyCrossAmountByType=Za;window.saveEditTx=Ar;window.bindEditCarteraEvents=jo;window.revertTxToDraft=gr;window.getThirdById=Zt;window.applyRetentionCalc=pr;window._carteraSetContent=va;window.showCarteraForLine=ur;window.calcPeriodRange=Ra;window.approveTx=br;window.currentPeriodKey=Xa;window.RET_DEFAULT_RATES=Ht;window.CARTERA_MODAL_PREV=wt;window.voidTx=vr;window.updateTxBalance=Ys;window.autoAppendTxLineFrom=zs;window.renderTxLines=rt;window.initThirdSearchInput=Mo;window.autoAppendEditTxLineFrom=tn;window.CARTERA_TARGET_LINE=Et;window.renderEditTxLines=Je;window.TX_STATE=ce;window.addTxLine=ct;window.bindTxLineThirdSearches=Uo;window.retRateLabel=ko;window.removeTxLine=lr;window.openNuevaTxModal=rr;window.initLineThirdSearchInput=Gs;window.updateTxLine=Ws;window.CARTERA_CONTEXT=Fa;window.removeEditTxLine=yr;window.updateEditTxBalance=on;window.retLabel=Hs;window.refreshConsecutive=Pa;window.saveTransaction=Ks;window.renderConsultaTx=Zs;window.normalizeConsultaPeriods=Qs;window.showCarteraModal=Da;window.applyEditRetentionCalc=xr;window.defaultRetRate=pt;window.deleteTxPhysical=$r;window.thirdDisplay=Lt;window.printTxNotaContable=Er;window.renderTransacciones=Cr;let $e={accounts:null,saldos:null,transactions:null,txLines:null,thirdParties:null};async function Tr(e){var t,a,o,s,n,i,c,r;e.innerHTML=`
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Reportes Financieros</h3>
        <p class="text-sm" style="color:#6B7280">Selecciona el reporte a generar. Se carga solo bajo demanda.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5" id="report-cards">
      ${Ve("trial","Balance de Prueba","Saldos débitos y créditos por cuenta.")}
      ${Ve("income","Estado de Resultados","Ingresos, gastos y utilidad neta.")}
      ${Ve("position","Estado de Situación Financiera","Activos, pasivos y patrimonio (Balance General).")}
      ${Ve("journal","Libro Diario","Detalle cronológico de movimientos contables.")}
      ${Ve("aux","Libro Auxiliar","Movimientos por Cuenta y Tercero o Tercero y Cuenta.")}
      ${Ve("ar-bal","Saldos Cuentas por Cobrar","Pendientes por tercero y cuenta de cartera.")}
      ${Ve("ap-bal","Saldos Cuentas por Pagar","Pendientes por tercero y cuenta por pagar.")}
      ${Ve("aging","Cartera por Edades","Tramos 0-30-60-90+ para clientes o proveedores.")}
    </div>`,(t=$("#btn-report-trial"))==null||t.addEventListener("click",()=>Ue("Balance de Prueba",()=>dn())),(a=$("#btn-report-income"))==null||a.addEventListener("click",()=>Ue("Estado de Resultados",()=>un())),(o=$("#btn-report-position"))==null||o.addEventListener("click",()=>Ue("Estado de Situación Financiera",()=>mn())),(s=$("#btn-report-journal"))==null||s.addEventListener("click",()=>Ue("Libro Diario",()=>fn())),(n=$("#btn-report-aux"))==null||n.addEventListener("click",()=>Ue("Libro Auxiliar",()=>bn())),(i=$("#btn-report-ar-bal"))==null||i.addEventListener("click",()=>Ue("Saldos Cuentas por Cobrar",()=>eo("cxc"))),(c=$("#btn-report-ap-bal"))==null||c.addEventListener("click",()=>Ue("Saldos Cuentas por Pagar",()=>eo("cxp"))),(r=$("#btn-report-aging"))==null||r.addEventListener("click",()=>Ue("Cartera por Edades",()=>ln()))}function Ze(){return $("#report-view-modal")||$("#report-view")}function Ue(e,t){openModal(`<i class="fas fa-chart-column mr-2" style="color:#1A4B8C"></i>${esc(e)}`,'<div id="report-view-modal" class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando reporte...</div>','<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0),setTimeout(()=>{t()},0)}function Ve(e,t,a){return`
    <div class="bg-white rounded-2xl border p-4" style="border-color:#F0F0F0">
      <h4 class="font-bold mb-1" style="color:#0D2137">${esc(t)}</h4>
      <p class="text-sm mb-3" style="color:#6B7280">${esc(a)}</p>
      <button class="btn btn-primary btn-sm" id="btn-report-${esc(e)}"><i class="fas fa-play"></i> Generar</button>
    </div>`}async function Xe(){if(!$e.accounts||!$e.saldos){const[e,t]=await Promise.all([API.getAccounts(!1),API.getAccountSaldos()]);$e.accounts=e,$e.saldos=t}return{accounts:$e.accounts,saldos:$e.saldos}}async function et(){if(!$e.transactions||!$e.txLines||!$e.thirdParties){const[e,t,a]=await Promise.all([pb.listAll("transactions",{sort:"-id",expand:"tx_type_id,third_party_id",filter:'status="active"'}),pb.listAll("tx_lines",{sort:"id",expand:"account_id,tx_id"}),pb.listAll("third_parties",{sort:"name"})]);$e.transactions=e,$e.txLines=t,$e.thirdParties=a}return{transactions:$e.transactions,txLines:$e.txLines,thirdParties:$e.thirdParties}}function Ir(e,t){const a={1:0,2:0,3:0,4:0,5:0,6:0,7:0};for(const o of e){const s=(o.code||"").charAt(0);a[s]=(a[s]||0)+Number(t[o.id]||0)}return a}async function Ae(e,t=""){for(const a of e)try{const o=await API.getSetting(a);if(o)return o}catch{}return t}function xt(e){const t=Number(e||0);return t<0?{text:`(${fmt(Math.abs(t))})`,isNegative:!0}:{text:fmt(t),isNegative:!1}}function je(e){const t=Number(e||0);return t<0?`-${fmt(Math.abs(t))}`:fmt(t)}function Ne(e){const t=Number(e||0),a=xt(t);return t<0?{text:a.text,color:"#B91C1C"}:t>0?{text:a.text,color:"#166534"}:{text:a.text,color:"#6B7280"}}function ut(){var t;const e=(t=window.jspdf)==null?void 0:t.jsPDF;return typeof e!="function"?(showToast("No se pudo inicializar el generador PDF.","error"),null):e}function fe(e){return Number(e||0).toLocaleString("es-CO",{minimumFractionDigits:2,maximumFractionDigits:2})}function re(e){const t=Number(e||0),a=fe(Math.abs(t));return t<0?`-${a}`:a}async function mt(){const[e,t,a,o,s,n]=await Promise.all([API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>""),API.getSetting("company_city").catch(()=>""),API.getSetting("company_country").catch(()=>""),API.getSetting("software_name").catch(()=>"")]);return{companyName:String(e||"EMPRESA").trim(),companyNit:String(t||"N/A").trim(),companyAddress:[a,o,s].map(i=>String(i||"").trim()).filter(Boolean).join(" / ")||"Direccion no configurada",softwareName:String(n||"GRAVY v2.0").trim(),userName:String(sessionStorage.getItem("user_name")||"Usuario").trim(),generatedAt:new Date().toLocaleString("es-CO")}}function ft(e,t,a){const o=e.internal.pageSize.getWidth(),s=24,n=o-24,i=String((a==null?void 0:a.title)||"").trim(),c=Array.isArray(a==null?void 0:a.subtitles)?a.subtitles:[];return e.setFont("helvetica","bold"),e.setFontSize(10),e.setTextColor(13,33,55),e.text(t.companyName,s,20),e.setFont("helvetica","normal"),e.setFontSize(8),e.setTextColor(100,100,100),e.text(`NIT: ${t.companyNit}`,s,30),e.text(t.companyAddress,s,40),e.setFont("helvetica","bold"),e.setFontSize(11),e.setTextColor(13,33,55),e.text(i,o/2,20,{align:"center"}),e.setFont("helvetica","normal"),e.setFontSize(8),e.setTextColor(80,80,80),c.slice(0,3).forEach((r,l)=>{e.text(String(r||""),o/2,30+l*10,{align:"center"})}),e.setFont("helvetica","normal"),e.setFontSize(8),e.setTextColor(100,100,100),e.text(t.softwareName,n,20,{align:"right"}),e.text(`Usuario: ${t.userName}`,n,30,{align:"right"}),e.text(`Impreso: ${t.generatedAt}`,n,40,{align:"right"}),e.setDrawColor(180,180,180),e.setLineWidth(.5),e.line(s,58,n,58),{marginLeft:s,marginRight:n,startY:66}}function bt(e,t){const a=e.internal.pageSize.getWidth(),o=e.internal.pageSize.getHeight();e.setFont("helvetica","normal"),e.setFontSize(7),e.setTextColor(120,120,120),e.text("Reporte generado por GRAVY",24,o-10),e.text(`Pagina ${t}`,a-24,o-10,{align:"right"})}function sn(e,t){const a=new Date(`${e}T00:00:00`),o=new Date(`${t}T00:00:00`);if(Number.isNaN(a.getTime())||Number.isNaN(o.getTime()))return 0;const s=o.getTime()-a.getTime();return Math.max(0,Math.floor(s/864e5))}function nn(e,t){const a=new Date(`${e}T00:00:00`),o=new Date(`${t}T00:00:00`);return Number.isNaN(a.getTime())||Number.isNaN(o.getTime())?0:Math.floor((o.getTime()-a.getTime())/864e5)}function cn(e,t){const a=new Date(`${e}T00:00:00`);return a.setDate(a.getDate()+Number(t||0)),a.toISOString().slice(0,10)}function rn(e){return e<0?"por_vencer":e<=30?"b0_30":e<=60?"b31_60":e<=90?"b61_90":"b90p"}async function Ho({mode:e="cxc",asOfDate:t=todayStr(),thirdType:a=""}={}){var g,u,y;const[{accounts:o},{transactions:s,txLines:n,thirdParties:i}]=await Promise.all([Xe(),et()]),c=new Map(s.map(v=>[v.id,v])),r=new Map(i.map(v=>[v.id,v])),l=new Map(o.map(v=>[v.id,v])),p=new Map,m=String(a||"").trim().toUpperCase();for(const v of n){const b=c.get(v.tx_id);if(!b||b.status!=="active"||!b.date||String(b.date)>t)continue;const h=((g=v.expand)==null?void 0:g.account_id)||l.get(v.account_id);if(!h||!h.maneja_cruce)continue;const _=String(h.nature||"").toLowerCase();if(e==="cxc"&&_!=="debit"||e==="cxp"&&_!=="credit")continue;const A=v.third_party_id||b.third_party_id||"NO_TERCERO",C=r.get(A),I=String((C==null?void 0:C.type)||"").toUpperCase();if(m&&I!==m)continue;const N=(v.cross_doc_ref||"").trim()||"SIN_DOC",T=`${h.id}|${A}|${N}`;p.has(T)||p.set(T,{account_id:h.id,account_code:h.code||"",account_name:h.name||"",nature:_,third_id:A,third_name:(C==null?void 0:C.name)||((y=(u=b.expand)==null?void 0:u.third_party_id)==null?void 0:y.name)||"Sin tercero",third_doc:(C==null?void 0:C.doc_number)||"",third_type:I||"OTRO",doc_ref:N,doc_date:b.date,payment_days:Number(b.payment_days||0),debit:0,credit:0});const S=p.get(T);String(b.date)<String(S.doc_date)&&(S.doc_date=b.date,S.payment_days=Number(b.payment_days||0)),S.debit+=Number(v.debit||0),S.credit+=Number(v.credit||0)}const f=1e-4,d=[];return p.forEach(v=>{const b=v.nature==="debit"?Number(v.debit||0)-Number(v.credit||0):Number(v.credit||0)-Number(v.debit||0);if(b<=f)return;const h=sn(v.doc_date,t),_=cn(v.doc_date,v.payment_days||0),A=nn(_,t);d.push({...v,open:b,days:h,due_date:_,expired_days:A,bucket:rn(A)})}),d.sort((v,b)=>{const h=`${v.third_name}|${v.account_code}|${v.doc_date}|${v.doc_ref}`,_=`${b.third_name}|${b.account_code}|${b.doc_date}|${b.doc_ref}`;return h.localeCompare(_)}),d}async function eo(e){var l,p,m;const t=Ze();if(!t)return;const a=e==="cxc",o=a?"Saldos de Cuentas por Cobrar":"Saldos de Cuentas por Pagar",s=a?"CLIENTE":"PROVEEDOR",n=a?"clientes":"proveedores";t.innerHTML=`
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
    </div>`;let i=[],c=[];const r=async()=>{const f=$("#bal-results");if(!f)return;const d=getInputVal("bal-cutoff"),g=getSelectVal("bal-third-type");if(!d)return showToast("Selecciona la fecha de corte.","warning");f.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando reporte...</div>';try{const u=await Ho({mode:e,asOfDate:d,thirdType:g});if(!u.length){f.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">No hay saldos abiertos para los filtros seleccionados.</div>',i=[],c=[],$("#btn-exp-bal")&&($("#btn-exp-bal").disabled=!0),$("#btn-pdf-bal")&&($("#btn-pdf-bal").disabled=!0);return}const y=new Map;for(const _ of u){const A=`${_.third_id}|${_.account_id}`;y.has(A)||y.set(A,{third_name:_.third_name,third_doc:_.third_doc,third_type:_.third_type,account_code:_.account_code,account_name:_.account_name,docs_count:0,open_total:0,max_days:0});const C=y.get(A);C.docs_count+=1,C.open_total+=Number(_.open||0),C.max_days=Math.max(C.max_days,Number(_.days||0))}const v=[...y.values()].sort((_,A)=>{const C=`${_.third_name}|${_.account_code}`,I=`${A.third_name}|${A.account_code}`;return C.localeCompare(I)}),b=v.reduce((_,A)=>_+Number(A.open_total||0),0),h=v.reduce((_,A)=>_+Number(A.docs_count||0),0);f.innerHTML=`
        <div class="p-4 border-b flex flex-wrap items-center justify-between gap-3" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Terceros/cuentas: <strong>${fmtN(v.length)}</strong> · Documentos: <strong>${fmtN(h)}</strong> · Saldo abierto: <strong>${fmt(b)}</strong></p>
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
            <tfoot><tr><td colspan="4" class="font-bold">Total saldo abierto</td><td class="font-bold">${fmt(b)}</td></tr></tfoot>
          </table>
        </div>`,i=v.map(_=>({tercero:_.third_name,documento:_.third_doc,tipo_tercero:_.third_type,cuenta_codigo:_.account_code,cuenta_nombre:_.account_name,documentos:_.docs_count,antiguedad_max_dias:_.max_days,saldo_abierto:_.open_total})),c=v.map(_=>({..._})),$("#btn-exp-bal")&&($("#btn-exp-bal").disabled=!i.length),$("#btn-pdf-bal")&&($("#btn-pdf-bal").disabled=!c.length)}catch(u){f.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(u.message)}</div>`,i=[],c=[],$("#btn-exp-bal")&&($("#btn-exp-bal").disabled=!0),$("#btn-pdf-bal")&&($("#btn-pdf-bal").disabled=!0)}};(l=$("#btn-gen-bal"))==null||l.addEventListener("click",r),(p=$("#btn-exp-bal"))==null||p.addEventListener("click",()=>{i.length&&exportToExcel(i,[{key:"tercero",label:"Tercero"},{key:"documento",label:"Documento"},{key:"cuenta_codigo",label:"Código cuenta"},{key:"cuenta_nombre",label:"Nombre cuenta"},{key:"documentos",label:"# Documentos"},{key:"antiguedad_max_dias",label:"Antigüedad máx. (días)"},{key:"saldo_abierto",label:"Saldo abierto"}],e==="cxc"?"saldos_cuentas_por_cobrar":"saldos_cuentas_por_pagar")}),(m=$("#btn-pdf-bal"))==null||m.addEventListener("click",async()=>{if(c.length)try{const f=ut();if(!f)return;const d=getInputVal("bal-cutoff")||todayStr(),g=getSelectVal("bal-third-type")||"TODOS",u=await mt(),y=new f({orientation:"portrait",unit:"pt",format:"letter"}),v=ft(y,u,{title:o,subtitles:[`Corte: ${d}`,`Tipo de tercero: ${g}`]}),b=c.reduce((A,C)=>A+Number(C.open_total||0),0),h=c.reduce((A,C)=>A+Number(C.docs_count||0),0),_=c.map(A=>[A.third_doc?`${A.third_doc} - ${A.third_name}`:A.third_name,`${A.account_code} - ${A.account_name}`.trim(),fmtN(A.docs_count),fmtN(A.max_days),fe(A.open_total||0)]);_.push(["TOTAL","",fmtN(h),"",fe(b)]),y.autoTable({startY:v.startY,head:[["Tercero","Cuenta","# Docs","Antiguedad max. (dias)","Saldo abierto"]],body:_,theme:"plain",margin:{top:v.startY,left:v.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.2,textColor:[55,55,55],cellPadding:2.4,lineWidth:0,overflow:"linebreak"},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:7.3,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:170},1:{cellWidth:195},2:{cellWidth:56,halign:"right"},3:{cellWidth:63,halign:"right"},4:{cellWidth:80,halign:"right"}},didParseCell:A=>{if(A.section!=="body")return;A.row.index===_.length-1&&(A.cell.styles.fontStyle="bold",A.cell.styles.fillColor=[236,236,236],A.cell.styles.textColor=[13,33,55],A.cell.styles.lineWidth={top:.2},A.cell.styles.lineColor=[13,33,55])},didDrawPage:A=>bt(y,A.pageNumber)}),y.save(`${e==="cxc"?"saldos_cuentas_por_cobrar":"saldos_cuentas_por_pagar"}_${d}.pdf`)}catch(f){showToast(`Error al generar PDF: ${f.message}`,"error")}})}async function ln(){var l,p,m,f;const e=Ze();if(!e)return;const{accounts:t}=await Xe(),a=t.filter(d=>d.maneja_cruce).sort((d,g)=>(d.code||"").localeCompare(g.code||"")),o=a.map(d=>`<option value="${esc(d.id)}">${esc(d.code)} - ${esc(d.name)}</option>`).join("");e.innerHTML=`
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
    </div>`;const s=()=>{const d=getSelectVal("age-mode"),g=$("#age-third-type");g&&(!g.value||g.value==="CLIENTE"||g.value==="PROVEEDOR")&&(g.value=d==="cxc"?"CLIENTE":"PROVEEDOR")};(l=$("#age-mode"))==null||l.addEventListener("change",s);let n=[],i=[],c={};const r=async()=>{const d=$("#aging-results");if(!d)return;const g=getInputVal("age-cutoff"),u=getSelectVal("age-mode")||"cxc",y=getSelectVal("age-third-type"),v=getSelectVal("age-account");if(!g)return showToast("Selecciona la fecha de corte.","warning");d.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Calculando cartera por edades...</div>';try{const b=await Ho({mode:u,asOfDate:g,thirdType:y}),h=v?b.filter(w=>w.account_id===v):b;if(!h.length){d.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">No hay cartera abierta para los filtros seleccionados.</div>',n=[],i=[],$("#btn-exp-aging")&&($("#btn-exp-aging").disabled=!0),$("#btn-pdf-aging")&&($("#btn-pdf-aging").disabled=!0);return}const _=v?a.find(w=>w.id===v):null,A=_?`${_.code} - ${_.name}`:"Todas las cuentas",C=h.map(w=>({tercero:w.third_name,documento_tercero:w.third_doc,cuenta_id:w.account_id,cuenta:`${w.account_code} - ${w.account_name}`.trim(),cuenta_code:w.account_code,documento_cruce:w.doc_ref,fecha_documento:w.doc_date,plazo_dias:Number(w.payment_days||0),vencimiento:w.due_date,expired_days:Number(w.expired_days||0),por_vencer:w.bucket==="por_vencer"?Number(w.open||0):0,de_0_a_30:w.bucket==="b0_30"?Number(w.open||0):0,de_31_a_60:w.bucket==="b31_60"?Number(w.open||0):0,de_61_a_90:w.bucket==="b61_90"?Number(w.open||0):0,mayor_a_90:w.bucket==="b90p"?Number(w.open||0):0,total:Number(w.open||0)})).sort((w,E)=>{const L=`${w.cuenta_code}|${w.tercero}|${w.fecha_documento}|${w.documento_cruce}`,R=`${E.cuenta_code}|${E.tercero}|${E.fecha_documento}|${E.documento_cruce}`;return L.localeCompare(R)}),I=C.reduce((w,E)=>(w.por_vencer+=E.por_vencer,w.de_0_a_30+=E.de_0_a_30,w.de_31_a_60+=E.de_31_a_60,w.de_61_a_90+=E.de_61_a_90,w.mayor_a_90+=E.mayor_a_90,w.total+=E.total,w),{por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0}),N=u==="cxc"?"Clientes (CxC)":"Proveedores (CxP)",T=new Map;for(const w of C)T.has(w.cuenta)||T.set(w.cuenta,[]),T.get(w.cuenta).push(w);const S=[];for(const[w,E]of T){v||S.push(`<tr style="background:#F0F4F8">
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
          <p class="text-sm" style="color:#6B7280">Cartera: <strong>${esc(N)}</strong> · Cuenta: <strong>${esc(A)}</strong> · Documentos: <strong>${fmtN(C.length)}</strong> · Total: <strong>${fmt(I.total)}</strong></p>
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
                <td class="font-bold" style="color:#059669">${fmt(I.por_vencer)}</td>
                <td class="font-bold">${fmt(I.de_0_a_30)}</td>
                <td class="font-bold">${fmt(I.de_31_a_60)}</td>
                <td class="font-bold">${fmt(I.de_61_a_90)}</td>
                <td class="font-bold">${fmt(I.mayor_a_90)}</td>
                <td class="font-bold">${fmt(I.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`,n=C.map(w=>({...w})),i=C.map(w=>({...w})),c={asOfDate:g,mode:u,thirdType:y,accountLabel:A,carteraLabel:N},$("#btn-exp-aging")&&($("#btn-exp-aging").disabled=!n.length),$("#btn-pdf-aging")&&($("#btn-pdf-aging").disabled=!i.length)}catch(b){d.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(b.message)}</div>`,n=[],i=[],$("#btn-exp-aging")&&($("#btn-exp-aging").disabled=!0),$("#btn-pdf-aging")&&($("#btn-pdf-aging").disabled=!0)}};(p=$("#btn-gen-aging"))==null||p.addEventListener("click",r),(m=$("#btn-exp-aging"))==null||m.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"tercero",label:"Tercero"},{key:"documento_tercero",label:"Documento tercero"},{key:"cuenta",label:"Cuenta"},{key:"documento_cruce",label:"Doc. Cruce"},{key:"fecha_documento",label:"Fecha documento"},{key:"plazo_dias",label:"Plazo (días)"},{key:"vencimiento",label:"Vencimiento"},{key:"por_vencer",label:"Por Vencer"},{key:"de_0_a_30",label:"0-30 días"},{key:"de_31_a_60",label:"31-60 días"},{key:"de_61_a_90",label:"61-90 días"},{key:"mayor_a_90",label:"Más de 90 días"},{key:"total",label:"Total"}],`cartera_por_edades_${c.mode||"cxc"}`)}),(f=$("#btn-pdf-aging"))==null||f.addEventListener("click",async()=>{if(i.length)try{const d=ut();if(!d)return;const{asOfDate:g,thirdType:u,accountLabel:y,carteraLabel:v}=c,b=i.reduce((E,L)=>(E.por_vencer+=Number(L.por_vencer||0),E.de_0_a_30+=Number(L.de_0_a_30||0),E.de_31_a_60+=Number(L.de_31_a_60||0),E.de_61_a_90+=Number(L.de_61_a_90||0),E.mayor_a_90+=Number(L.mayor_a_90||0),E.total+=Number(L.total||0),E),{por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0}),h=await mt(),_=new d({orientation:"portrait",unit:"pt",format:"letter"}),A=ft(_,h,{title:"Cartera por Edades",subtitles:[`Corte: ${g}`,`Cartera: ${v}`,`Cuenta: ${y}`,`Tipo de tercero: ${u||"Todos"}`]}),C=[],I=new Map;for(const E of i)I.has(E.cuenta)||I.set(E.cuenta,[]),I.get(E.cuenta).push(E);const N=new Set;let T=0;const S=I.size>1;for(const[E,L]of I){S&&(C.push([{content:E,colSpan:11,styles:{fontStyle:"bold",fillColor:[235,240,248],textColor:[13,33,55]}}]),N.add(T++));for(const R of L)C.push([R.documento_tercero?`${R.documento_tercero} - ${R.tercero}`:R.tercero,R.documento_cruce,R.fecha_documento,String(R.plazo_dias||0),R.vencimiento,fe(R.por_vencer),fe(R.de_0_a_30),fe(R.de_31_a_60),fe(R.de_61_a_90),fe(R.mayor_a_90),fe(R.total)]),T++}C.push(["TOTAL","","","","",fe(b.por_vencer),fe(b.de_0_a_30),fe(b.de_31_a_60),fe(b.de_61_a_90),fe(b.mayor_a_90),fe(b.total)]);const w=T;_.autoTable({startY:A.startY,head:[["Tercero","Cruce","Fecha","Plazo","Vencimiento","Por Vencer","0-30","31-60","61-90",">90","Total"]],body:C,theme:"plain",margin:{top:A.startY,left:A.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:6.5,textColor:[55,55,55],cellPadding:2,lineWidth:0,overflow:"linebreak"},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:6.7,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:116},1:{cellWidth:48},2:{cellWidth:46},3:{cellWidth:28,halign:"right"},4:{cellWidth:50},5:{cellWidth:48,halign:"right"},6:{cellWidth:42,halign:"right"},7:{cellWidth:42,halign:"right"},8:{cellWidth:42,halign:"right"},9:{cellWidth:42,halign:"right"},10:{cellWidth:50,halign:"right"}},didParseCell:E=>{E.section==="body"&&E.row.index===w&&(E.cell.styles.fontStyle="bold",E.cell.styles.fillColor=[236,236,236],E.cell.styles.textColor=[13,33,55],E.cell.styles.lineWidth={top:.2},E.cell.styles.lineColor=[13,33,55])},didDrawPage:E=>bt(_,E.pageNumber)}),_.save(`cartera_por_edades_${c.mode||"cxc"}_${g}.pdf`)}catch(d){showToast(`Error al generar PDF: ${d.message}`,"error")}})}async function dn(){var r,l,p;const e=Ze();if(!e)return;const t=todayStr(),a=`${t.slice(0,7)}-01`,o=await Ae(["trial_show_signatures_default","show_signatures_default"],"0"),s=String(o).trim()==="1"||String(o).toLowerCase()==="true";e.innerHTML=`
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
    </div>`;let n=[],i=null;const c=async()=>{var b,h;const m=$("#trial-results");if(!m)return;const f=getInputVal("trial-from"),d=getInputVal("trial-to"),g=getSelectVal("trial-level"),u=g==="all"?Number.POSITIVE_INFINITY:Number(g||3),y=getCheckVal("trial-show-third"),v=getCheckVal("trial-show-signatures");if(!f||!d)return showToast("Selecciona el lapso (desde y hasta).","warning");if(f>d)return showToast("La fecha Desde no puede ser mayor que Hasta.","warning");m.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Balance de Prueba...</div>';try{const{accounts:_}=await Xe(),{transactions:A,txLines:C}=await et(),I=Object.fromEntries(A.map(x=>[x.id,x])),N=new Map(_.map(x=>[x.id,{id:x.id,code:String(x.code||""),name:String(x.name||""),level:Number(x.level||1),parent_code:String(x.parent_code||""),ownPrev:0,ownDebit:0,ownCredit:0,prev:0,debit:0,credit:0,current:0,third:new Map,children:[]}])),T=new Map;N.forEach(x=>{x.code&&T.set(x.code,x)});for(const x of C){const P=I[x.tx_id];if(!P||P.status!=="active"||!P.date)continue;const V=N.get(x.account_id);if(!V)continue;const U=String(P.date),z=Number(x.debit||0),J=Number(x.credit||0);if(U<f?V.ownPrev+=z-J:U>=f&&U<=d&&(V.ownDebit+=z,V.ownCredit+=J),y){const te=String(P.third_party_id||"NO_TERCERO"),F=((h=(b=P.expand)==null?void 0:b.third_party_id)==null?void 0:h.name)||"Sin tercero";V.third.has(te)||V.third.set(te,{id:te,name:F,prev:0,debit:0,credit:0,current:0});const D=V.third.get(te);U<f?D.prev+=z-J:U>=f&&U<=d&&(D.debit+=z,D.credit+=J),D.current=D.prev+D.debit-D.credit}}const S=[];N.forEach(x=>{const P=x.parent_code?T.get(x.parent_code):null;P?P.children.push(x):S.push(x)});const w=(x,P)=>x.code.localeCompare(P.code);S.sort(w),N.forEach(x=>x.children.sort(w));const E=[],L=1e-4,R=x=>{let P=x.ownPrev,V=x.ownDebit,U=x.ownCredit;for(const J of x.children){const te=R(J);P+=te.prev,V+=te.debit,U+=te.credit}const z=P+V-U;return x.prev=P,x.debit=V,x.credit=U,x.current=z,{prev:P,debit:V,credit:U,current:z}};S.forEach(x=>R(x));const B=(x,P)=>{const V=[];for(const F of x.children)V.push(...B(F,P+1));if(!(Math.abs(x.prev)>L||Math.abs(x.debit)>L||Math.abs(x.credit)>L||Math.abs(x.current)>L||V.length>0))return[];const J=Number(x.level||P+1),te={code:x.code,account:x.name,level:J,depth:P,isGroup:x.children.length>0,prev:x.prev,debit:x.debit,credit:x.credit,current:x.current,node:x};return J<=u?[te,...V]:V};E.length=0,S.forEach(x=>E.push(...B(x,0)));const M=S.reduce((x,P)=>(x.prev+=P.prev,x.debit+=P.debit,x.credit+=P.credit,x.current+=P.current,x),{prev:0,debit:0,credit:0,current:0}),k=xt(M.prev),j=xt(M.debit),Y=xt(M.credit),W=xt(M.current),K=[];for(const x of E)if(K.push({...x,thirdName:""}),y&&x.node&&x.node.third&&x.node.third.size){const P=[...x.node.third.values()].filter(V=>Math.abs(V.prev)>L||Math.abs(V.debit)>L||Math.abs(V.credit)>L||Math.abs(V.current)>L).sort((V,U)=>V.name.localeCompare(U.name));for(const V of P)K.push({code:"",account:"Detalle por tercero",level:x.level,depth:x.depth+1,isGroup:!1,prev:V.prev,debit:V.debit,credit:V.credit,current:V.current,thirdName:V.name,isThirdDetail:!0})}n=K.map(x=>({codigo:x.code,descripcion:`${"  ".repeat(x.depth)}${x.account}`,tercero:x.thirdName||"",nivel:x.level,saldo_anterior:x.prev,mov_debito:x.debit,mov_credito:x.credit,saldo_actual:x.current})),$("#btn-exp-trial")&&($("#btn-exp-trial").disabled=!K.length),$("#btn-pdf-trial")&&($("#btn-pdf-trial").disabled=!K.length),i={fromDate:f,toDate:d,includeThird:y,includeSignatures:v,displayRows:K.map(x=>({...x})),totals:{...M}};let H="";if(v){const[x,P,V,U,z,J,te,F]=await Promise.all([Ae(["representante_legal_name","legal_representative_name","rep_legal_name"]),Ae(["representante_legal_title","legal_representative_title","rep_legal_title"],"Representante Legal"),Ae(["contador_name","accountant_name"]),Ae(["contador_title","accountant_title"],"Contador"),Ae(["contador_license","accountant_license"]),Ae(["revisor_fiscal_name","fiscal_reviewer_name"]),Ae(["revisor_fiscal_title","fiscal_reviewer_title"],"Revisor Fiscal"),Ae(["revisor_fiscal_license","fiscal_reviewer_license"])]);H=`
          <div class="p-4 pt-2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              ${ha(x,P,"")}
              ${ha(V,U,z)}
              ${ha(J,te,F)}
            </div>
          </div>`}m.innerHTML=`
        <div class="px-4 pt-4 text-center">
          <p class="text-xl font-bold" style="color:#0D2137">Balance de Comprobación Detallado</p>
          <p class="text-sm mt-1" style="color:#6B7280">DEL ${esc(f)} AL ${esc(d)}</p>
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
                <td class="font-bold" style="color:${Ne(M.prev).color}">${k.text}</td>
                <td class="font-bold" style="color:${Ne(M.debit).color}">${j.text}</td>
                <td class="font-bold" style="color:${Ne(M.credit).color}">${Y.text}</td>
                <td class="font-bold" style="color:${Ne(M.current).color}">${W.text}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ${H}`}catch(_){m.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(_.message)}</div>`,i=null,$("#btn-pdf-trial")&&($("#btn-pdf-trial").disabled=!0)}};(r=$("#btn-gen-trial"))==null||r.addEventListener("click",c),(l=$("#btn-exp-trial"))==null||l.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"codigo",label:"CUENTA"},{key:"descripcion",label:"DESCRIPCIÓN"},{key:"nivel",label:"NIVEL"},{key:"tercero",label:"TERCERO"},{key:"saldo_anterior",label:"BALANCE ANTERIOR"},{key:"mov_debito",label:"DÉBITOS"},{key:"mov_credito",label:"CRÉDITOS"},{key:"saldo_actual",label:"BALANCE ACTUAL"}],`balance_prueba_n${getSelectVal("trial-level")}_${getInputVal("trial-from")}_${getInputVal("trial-to")}`)}),(p=$("#btn-pdf-trial"))==null||p.addEventListener("click",async()=>{var m;if(!(!i||!i.displayRows.length))try{const f=ut();if(!f)return;const d=await mt(),g=new f({orientation:"landscape",unit:"pt",format:"letter"}),u=ft(g,d,{title:"Balance de Prueba (Detallado)",subtitles:[`Desde: ${i.fromDate}`,`Hasta: ${i.toDate}`,`Detalle por tercero: ${i.includeThird?"Si":"No"}`]}),y=i.includeThird?["Cuenta","Descripcion","Tercero","Saldo Anterior","Mov. Debito","Mov. Credito","Saldo Actual"]:["Cuenta","Descripcion","Saldo Anterior","Mov. Debito","Mov. Credito","Saldo Actual"],v=i.displayRows.map(b=>{const h=`${"  ".repeat(Number(b.depth||0))}${b.account||""}`;return i.includeThird?[b.code||"",h,b.thirdName||"",re(b.prev||0),fe(b.debit||0),fe(b.credit||0),re(b.current||0),b.isGroup?"group":b.isThirdDetail?"third":"detail"]:[b.code||"",h,re(b.prev||0),fe(b.debit||0),fe(b.credit||0),re(b.current||0),b.isGroup?"group":"detail"]});if(i.includeThird?v.push(["TOTAL","","",re(i.totals.prev||0),fe(i.totals.debit||0),fe(i.totals.credit||0),re(i.totals.current||0),"total"]):v.push(["TOTAL","",re(i.totals.prev||0),fe(i.totals.debit||0),fe(i.totals.credit||0),re(i.totals.current||0),"total"]),g.autoTable({startY:u.startY,head:[y],body:v.map(b=>b.slice(0,y.length)),theme:"plain",margin:{top:u.startY,left:u.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.5,textColor:[55,55,55],cellPadding:2.7,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineWidth:{bottom:.25}},columnStyles:i.includeThird?{0:{cellWidth:62},1:{cellWidth:242},2:{cellWidth:140},3:{cellWidth:80,halign:"right"},4:{cellWidth:80,halign:"right"},5:{cellWidth:80,halign:"right"},6:{cellWidth:80,halign:"right"}}:{0:{cellWidth:70},1:{cellWidth:346},2:{cellWidth:88,halign:"right"},3:{cellWidth:88,halign:"right"},4:{cellWidth:88,halign:"right"},5:{cellWidth:88,halign:"right"}},didParseCell:b=>{var _;if(b.section!=="body")return;const h=(_=v[b.row.index])==null?void 0:_[y.length];h==="group"?(b.cell.styles.fontStyle="bold",b.cell.styles.textColor=[13,33,55]):h==="third"?b.cell.styles.fillColor=[248,250,252]:h==="total"&&(b.cell.styles.fontStyle="bold",b.cell.styles.fillColor=[236,236,236],b.cell.styles.textColor=[13,33,55],b.cell.styles.lineWidth={top:.2},b.cell.styles.lineColor=[13,33,55])},didDrawPage:b=>bt(g,b.pageNumber)}),i.includeSignatures){const[b,h,_,A,C,I,N,T]=await Promise.all([Ae(["representante_legal_name","legal_representative_name","rep_legal_name"]),Ae(["representante_legal_title","legal_representative_title","rep_legal_title"],"Representante Legal"),Ae(["contador_name","accountant_name"]),Ae(["contador_title","accountant_title"],"Contador"),Ae(["contador_license","accountant_license"]),Ae(["revisor_fiscal_name","fiscal_reviewer_name"]),Ae(["revisor_fiscal_title","fiscal_reviewer_title"],"Revisor Fiscal"),Ae(["revisor_fiscal_license","fiscal_reviewer_license"])]),S=(((m=g.lastAutoTable)==null?void 0:m.finalY)||u.startY)+34,w=g.internal.pageSize.getWidth(),E=g.internal.pageSize.getHeight();let L=S;L>E-90&&(g.addPage(),L=80);const R=[w*.18,w*.5,w*.82],B=[{name:b||"",title:h||"",extra:""},{name:_||"",title:A||"",extra:C||""},{name:I||"",title:N||"",extra:T||""}];g.setDrawColor(70,70,70),g.setTextColor(60,60,60),B.forEach((M,k)=>{const j=R[k];g.line(j-75,L,j+75,L),g.setFont("helvetica","bold"),g.setFontSize(8),g.text(String(M.name||"________________________"),j,L+12,{align:"center"}),g.setFont("helvetica","normal"),g.setFontSize(7),g.text(String(M.title||""),j,L+22,{align:"center"}),M.extra&&g.text(String(M.extra),j,L+31,{align:"center"})})}g.save(`balance_prueba_${i.fromDate}_${i.toDate}.pdf`)}catch(f){showToast(`Error al generar PDF: ${f.message}`,"error")}})}function ha(e,t,a=""){return`
    <div class="pt-6">
      <div style="border-top:1px solid #111827; margin-bottom:6px"></div>
      <p class="text-sm font-semibold" style="color:#0D2137">${esc(e||"________________________")}</p>
      <p class="text-xs" style="color:#6B7280">${esc(t||"")}</p>
      ${a?`<p class="text-xs" style="color:#6B7280">${esc(a)}</p>`:""}
    </div>`}function pn(e,t){const a=(n,i=!1)=>{const c=Number(String(n||"").slice(0,4)),r=Number(String(n||"").slice(5,7));if(!Number.isFinite(c)||!Number.isFinite(r)||r<1||r>12)return"";if(!i)return`${String(c)}-${String(r).padStart(2,"0")}-01`;const l=new Date(c,r,0);return`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`},o=a(e,!1),s=a(t,!0);return!o||!s||String(o)>String(s)?null:{fromDate:o,toDate:s}}async function un(){var f,d,g;const e=Ze();if(!e)return;const t=todayStr().slice(0,7),a=Number(t.slice(0,4)),o=Number(t.slice(5,7)),s=`${String(a-1)}-${String(o).padStart(2,"0")}`;e.innerHTML=`
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
    </div>`;let n=[],i=null;const c=u=>{const y=Number(String(u||"").slice(0,4)),v=Number(String(u||"").slice(5,7));if(!Number.isFinite(y)||!Number.isFinite(v)||v<1||v>12)return"";const b=new Date(y,v,0);return`${b.getFullYear()}-${String(b.getMonth()+1).padStart(2,"0")}-${String(b.getDate()).padStart(2,"0")}`},r=u=>{if(!u)return"—";const y=new Date(`${u}T00:00:00`);return Number.isNaN(y.getTime())?u:y.toLocaleDateString("es-CO",{day:"2-digit",month:"long",year:"numeric"})},l=(u,y,v,b)=>{const h=Object.fromEntries(y.map(A=>[A.id,A])),_=Object.fromEntries(u.map(A=>[A.id,0]));for(const A of v){const C=h[A.tx_id];!C||C.status!=="active"||!C.date||String(C.date)>b||(_[A.account_id]=Number(_[A.account_id]||0)+Number(A.debit||0)-Number(A.credit||0))}return _},p=(u,y,v,b)=>{const h=u.filter(T=>String(T.code||"").startsWith(b)),_=new Map(h.map(T=>{const S=Number(y[T.id]||0),w=Number(v[T.id]||0),E=b==="4"?-S:S,L=b==="4"?-w:w;return[T.id,{id:T.id,code:String(T.code||""),name:String(T.name||""),level:Number(T.level||1),parentCode:String(T.parent_code||""),ownNow:E,ownCmp:L,now:0,cmp:0,children:[]}]})),A=new Map;_.forEach(T=>{T.code&&A.set(T.code,T)});const C=[];_.forEach(T=>{const S=T.parentCode?A.get(T.parentCode):null;S?S.children.push(T):C.push(T)});const I=(T,S)=>T.code.localeCompare(S.code);C.sort(I),_.forEach(T=>T.children.sort(I));const N=T=>{let S=T.ownNow,w=T.ownCmp;for(const E of T.children){const L=N(E);S+=L.now,w+=L.cmp}return T.now=S,T.cmp=w,{now:S,cmp:w}};return C.forEach(T=>N(T)),C},m=async()=>{const u=$("#income-results");if(!u)return;const y=getInputVal("inc-month"),v=getInputVal("inc-compare-month"),b=getCheckVal("inc-show-notes"),h=getSelectVal("inc-level"),_=h==="all"?Number.POSITIVE_INFINITY:Number(h||3);if(!y||!v)return showToast("Selecciona ambos meses para el reporte comparativo.","warning");const A=c(y),C=c(v);if(!A||!C)return showToast("Mes inválido. Revisa los filtros.","warning");u.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Estado de Resultados...</div>';try{const{accounts:I}=await Xe(),{transactions:N,txLines:T}=await et(),S=l(I,N,T,A),w=l(I,N,T,C),E=p(I,S,w,"4"),L=p(I,S,w,"5"),R=p(I,S,w,"6"),B=p(I,S,w,"7");let M=1;const k=D=>{const G=[],ee=Z=>{const Q=[];for(const be of Z.children)Q.push(...ee(be));if(!(Math.abs(Z.now)>1e-4||Math.abs(Z.cmp)>1e-4)&&!Q.length)return[];const ve=[];return Number(Z.level||1)<=_&&ve.push({note:b?String(M++):"",label:Z.name,now:Z.now,cmp:Z.cmp}),ve.push(...Q),ve};D.forEach(Z=>G.push(...ee(Z)));const X=D.reduce((Z,Q)=>Z+Number(Q.now||0),0),ne=D.reduce((Z,Q)=>Z+Number(Q.cmp||0),0);return{detail:G,totalNow:X,totalCmp:ne}},j=k(E),Y=k(L),W=k(R),K=k(B),H=Y.totalNow+W.totalNow+K.totalNow,x=Y.totalCmp+W.totalCmp+K.totalCmp,P=j.totalNow-H,V=j.totalCmp-x,U=b?4:3,z=b?'<th style="width:90px">Nota</th>':"",J=(D,q="")=>{const G=Ne(D);return`<td class="text-right ${q}" style="color:${G.color}">${G.text}</td>`},te=D=>D.detail.map(q=>`
        <tr>
          <td style="padding-left:24px">${esc(q.label)}</td>
          ${b?`<td class="text-center">${esc(q.note)}</td>`:""}
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
                ${b?"<td></td>":""}
                ${J(j.totalNow,"font-bold")}
                ${J(j.totalCmp,"font-bold")}
              </tr>

              <tr><td class="font-bold" colspan="${U}">Costos de venta (Clase 5)</td></tr>
              ${te(Y)}
              <tr>
                <td class="font-bold">Total costos</td>
                ${b?"<td></td>":""}
                ${J(Y.totalNow,"font-bold")}
                ${J(Y.totalCmp,"font-bold")}
              </tr>

              <tr><td class="font-bold" colspan="${U}">Gastos operacionales (Clase 6)</td></tr>
              ${te(W)}
              <tr>
                <td class="font-bold">Total gastos operacionales</td>
                ${b?"<td></td>":""}
                ${J(W.totalNow,"font-bold")}
                ${J(W.totalCmp,"font-bold")}
              </tr>

              <tr><td class="font-bold" colspan="${U}">Otros gastos (Clase 7)</td></tr>
              ${te(K)}
              <tr>
                <td class="font-bold">Total otros gastos</td>
                ${b?"<td></td>":""}
                ${J(K.totalNow,"font-bold")}
                ${J(K.totalCmp,"font-bold")}
              </tr>

              <tr>
                <td class="font-bold">Total gastos y costos</td>
                ${b?"<td></td>":""}
                ${J(H,"font-bold")}
                ${J(x,"font-bold")}
              </tr>
              <tr>
                <td class="font-bold">Resultado neto del periodo</td>
                ${b?"<td></td>":""}
                ${J(P,"font-bold")}
                ${J(V,"font-bold")}
              </tr>
            </tbody>
          </table>
        </div>`,n=[];const F=(D,q,G)=>{n.push({rubro:D,nota:"",actual:"",comparativo:""}),q.detail.forEach(ee=>{n.push({rubro:`  ${ee.label}`,nota:ee.note||"",actual:ee.now,comparativo:ee.cmp})}),n.push({rubro:G,nota:"",actual:q.totalNow,comparativo:q.totalCmp})};F("Ingresos (Clase 4)",j,"Total ingresos"),F("Costos de venta (Clase 5)",Y,"Total costos"),F("Gastos operacionales (Clase 6)",W,"Total gastos operacionales"),F("Otros gastos (Clase 7)",K,"Total otros gastos"),n.push({rubro:"Total gastos y costos",nota:"",actual:H,comparativo:x}),n.push({rubro:"Resultado neto del periodo",nota:"",actual:P,comparativo:V}),i={reportMonth:y,compareMonth:v,reportDate:A,compareDate:C,showNotes:b,sections:{ingresos:j,costos:Y,gastos:W,otrosGastos:K},totals:{totalGastosNow:H,totalGastosCmp:x,utilidadNow:P,utilidadCmp:V}},$("#btn-exp-er")&&($("#btn-exp-er").disabled=!n.length),$("#btn-pdf-er")&&($("#btn-pdf-er").disabled=!n.length)}catch(I){u.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(I.message)}</div>`,n=[],i=null,$("#btn-exp-er")&&($("#btn-exp-er").disabled=!0),$("#btn-pdf-er")&&($("#btn-pdf-er").disabled=!0)}};(f=$("#btn-gen-er"))==null||f.addEventListener("click",m),(d=$("#btn-exp-er"))==null||d.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"rubro",label:"Rubro"},{key:"nota",label:"Nota"},{key:"actual",label:getInputVal("inc-month")},{key:"comparativo",label:getInputVal("inc-compare-month")}],`estado_resultados_${getInputVal("inc-month")}_vs_${getInputVal("inc-compare-month")}`)}),(g=$("#btn-pdf-er"))==null||g.addEventListener("click",async()=>{if(i)try{const u=ut();if(!u)return;const{showNotes:y,sections:v,totals:b,reportDate:h,compareDate:_,reportMonth:A,compareMonth:C}=i,I=new u({orientation:"portrait",unit:"pt",format:"letter"}),N=await mt(),T=ft(I,N,{title:"Estado de Resultados",subtitles:[`Periodo mensual comparativo: ${A} vs ${C}`,`Cortes: ${h} / ${_}`]}),S=[],w=(L,R,B)=>{S.push([{content:L,colSpan:y?4:3,styles:{fontStyle:"bold",textColor:[13,33,55],fillColor:[245,245,245]}}]),R.detail.forEach(M=>{y?S.push([M.label,M.note||"",re(M.now),re(M.cmp)]):S.push([M.label,re(M.now),re(M.cmp)])}),y?S.push([B,"",re(R.totalNow),re(R.totalCmp)]):S.push([B,re(R.totalNow),re(R.totalCmp)])};w("Ingresos (Clase 4)",v.ingresos,"Total ingresos"),w("Costos de venta (Clase 5)",v.costos,"Total costos"),w("Gastos operacionales (Clase 6)",v.gastos,"Total gastos operacionales"),w("Otros gastos (Clase 7)",v.otrosGastos,"Total otros gastos"),y?S.push(["Total gastos y costos","",re(b.totalGastosNow),re(b.totalGastosCmp)]):S.push(["Total gastos y costos",re(b.totalGastosNow),re(b.totalGastosCmp)]),y?S.push(["Resultado neto del periodo","",re(b.utilidadNow),re(b.utilidadCmp)]):S.push(["Resultado neto del periodo",re(b.utilidadNow),re(b.utilidadCmp)]);const E=y?[["Rubro","Nota",String(h),String(_)]]:[["Rubro",String(h),String(_)]];I.autoTable({startY:T.startY,head:E,body:S,theme:"plain",margin:{top:T.startY,left:T.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.3,textColor:[55,55,55],cellPadding:2.5,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineWidth:{bottom:.25}},columnStyles:y?{0:{cellWidth:280},1:{cellWidth:54,halign:"center"},2:{cellWidth:110,halign:"right"},3:{cellWidth:110,halign:"right"}}:{0:{cellWidth:334},1:{cellWidth:110,halign:"right"},2:{cellWidth:110,halign:"right"}},didParseCell:L=>{var M;if(L.section!=="body")return;const R=(M=S[L.row.index])==null?void 0:M[0];if(typeof R=="object"&&(R!=null&&R.colSpan))return;const B=String(R||"").toLowerCase();(B.startsWith("total ")||B.startsWith("resultado "))&&(L.cell.styles.fontStyle="bold",L.cell.styles.fillColor=[236,236,236],L.cell.styles.textColor=[13,33,55])},didDrawPage:L=>bt(I,L.pageNumber)}),I.save(`estado_resultados_${A}_vs_${C}.pdf`)}catch(u){showToast(`Error al generar PDF: ${u.message}`,"error")}})}async function mn(){var d,g,u;const e=Ze();if(!e)return;const t=todayStr().slice(0,7),a=Number(t.slice(0,4)),o=Number(t.slice(5,7)),s=`${String(a-1)}-${String(o).padStart(2,"0")}`;e.innerHTML=`
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
    </div>`;let n=[],i=null;const c=y=>{const v=Number(String(y||"").slice(0,4)),b=Number(String(y||"").slice(5,7));if(!Number.isFinite(v)||!Number.isFinite(b)||b<1||b>12)return"";const h=new Date(v,b,0),_=h.getFullYear(),A=String(h.getMonth()+1).padStart(2,"0"),C=String(h.getDate()).padStart(2,"0");return`${_}-${A}-${C}`},r=y=>{if(!y)return"—";const v=new Date(`${y}T00:00:00`);return Number.isNaN(v.getTime())?y:v.toLocaleDateString("es-CO",{day:"2-digit",month:"long",year:"numeric"})},l=(y,v,b,h)=>{const _=Object.fromEntries(v.map(C=>[C.id,C])),A=Object.fromEntries(y.map(C=>[C.id,0]));for(const C of b){const I=_[C.tx_id];!I||I.status!=="active"||!I.date||String(I.date)>h||(A[C.account_id]=Number(A[C.account_id]||0)+Number(C.debit||0)-Number(C.credit||0))}return A},p=(y,v)=>{const b=Number(y||0);return v==="asset"?b:-b},m=(y,v,b,h,_,A,C,I)=>{const T=y.filter(h),S=new Map(T.map(W=>[W.id,{id:W.id,code:String(W.code||""),name:String(W.name||""),level:Number(W.level||1),parentCode:String(W.parent_code||""),ownNow:p(v[W.id],_),ownCmp:p(b[W.id],_),now:0,cmp:0,children:[]}])),w=new Map;S.forEach(W=>{W.code&&w.set(W.code,W)});const E=[];S.forEach(W=>{const K=W.parentCode?w.get(W.parentCode):null;K?K.children.push(W):E.push(W)});const L=(W,K)=>W.code.localeCompare(K.code);E.sort(L),S.forEach(W=>W.children.sort(L));const R=W=>{let K=W.ownNow,H=W.ownCmp;for(const x of W.children){const P=R(x);K+=P.now,H+=P.cmp}return W.now=K,W.cmp=H,{now:K,cmp:H}};E.forEach(W=>R(W));let B=C;const M=W=>{const K=[];for(const V of W.children)K.push(...M(V));if(!(Math.abs(W.now)>1e-4||Math.abs(W.cmp)>1e-4||K.length>0))return[];const P=[];return Number(W.level||1)<=I&&P.push({note:A?String(B++):"",label:W.name,now:W.now,cmp:W.cmp}),P.push(...K),P},k=E.flatMap(W=>M(W)),j=E.reduce((W,K)=>W+K.now,0),Y=E.reduce((W,K)=>W+K.cmp,0);return{detail:k,totalNow:j,totalCmp:Y,nextNote:B}},f=async()=>{const y=$("#position-results");if(!y)return;const v=getInputVal("pos-month"),b=getInputVal("pos-compare-month"),h=getCheckVal("pos-show-notes"),_=getSelectVal("pos-level"),A=_==="all"?Number.POSITIVE_INFINITY:Number(_||3);if(!v||!b)return showToast("Selecciona ambos meses para el reporte comparativo.","warning");const C=c(v),I=c(b);if(!C||!I)return showToast("Mes inválido. Revisa los filtros.","warning");y.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Estado de Situación Financiera...</div>';try{const{accounts:N}=await Xe(),{transactions:T,txLines:S}=await et(),w=l(N,T,S,C),E=l(N,T,S,I);let L=1;const R=m(N,w,E,F=>String(F.code||"").startsWith("11"),"asset",h,L,A);L=R.nextNote;const B=m(N,w,E,F=>String(F.code||"").startsWith("1")&&!String(F.code||"").startsWith("11"),"asset",h,L,A);L=B.nextNote;const M=m(N,w,E,F=>String(F.code||"").startsWith("21"),"liability",h,L,A);L=M.nextNote;const k=m(N,w,E,F=>String(F.code||"").startsWith("2")&&!String(F.code||"").startsWith("21"),"liability",h,L,A);L=k.nextNote;const j=m(N,w,E,F=>String(F.code||"").startsWith("3"),"equity",h,L,A),Y=R.totalNow+B.totalNow,W=R.totalCmp+B.totalCmp,K=M.totalNow+k.totalNow,H=M.totalCmp+k.totalCmp,x=K+j.totalNow,P=H+j.totalCmp,V=h?4:3,U=h?'<th style="width:90px">Nota</th>':"",z=(F,D="")=>{const q=Ne(F),G=`color:${q.color}`;return`<td class="text-right ${D}" style="${G}">${q.text}</td>`},J=F=>F.detail.map(D=>`
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
                <th class="text-right">${esc(r(I))}</th>
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
              ${J(B)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total activos no corrientes</td>
                ${h?"<td></td>":""}
                ${z(B.totalNow,"font-bold")}
                ${z(B.totalCmp,"font-bold")}
              </tr>
              <tr>
                <td class="font-bold">Total activos</td>
                ${h?"<td></td>":""}
                ${z(Y,"font-bold")}
                ${z(W,"font-bold")}
              </tr>

              <tr><td class="font-bold" colspan="${V}">Pasivos</td></tr>
              <tr><td class="font-semibold" colspan="${V}" style="padding-left:12px">Pasivos corrientes</td></tr>
              ${J(M)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total pasivos corrientes</td>
                ${h?"<td></td>":""}
                ${z(M.totalNow,"font-bold")}
                ${z(M.totalCmp,"font-bold")}
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
        </div>`,n=[];const te=(F,D,q)=>{n.push({rubro:F,nota:"",actual:"",comparativo:""}),D.detail.forEach(G=>{n.push({rubro:`  ${G.label}`,nota:G.note||"",actual:G.now,comparativo:G.cmp})}),n.push({rubro:q,nota:"",actual:D.totalNow,comparativo:D.totalCmp})};te("Activos corrientes",R,"Total activos corrientes"),te("Activos no corrientes",B,"Total activos no corrientes"),n.push({rubro:"Total activos",nota:"",actual:Y,comparativo:W}),te("Pasivos corrientes",M,"Total pasivos corrientes"),te("Pasivos no corrientes",k,"Total pasivos no corrientes"),n.push({rubro:"Total pasivos",nota:"",actual:K,comparativo:H}),te("Patrimonio",j,"Total patrimonio"),n.push({rubro:"Total pasivos más patrimonio",nota:"",actual:x,comparativo:P}),i={reportMonth:v,compareMonth:b,reportDate:C,compareDate:I,showNotes:h,sections:{actCorr:R,actNoCorr:B,pasCorr:M,pasNoCorr:k,patrimonio:j},totals:{totalActivosNow:Y,totalActivosCmp:W,totalPasivosNow:K,totalPasivosCmp:H,totalPyPNow:x,totalPyPCmp:P}},$("#btn-exp-position")&&($("#btn-exp-position").disabled=!n.length),$("#btn-pdf-position")&&($("#btn-pdf-position").disabled=!n.length)}catch(N){y.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(N.message)}</div>`,n=[],i=null,$("#btn-exp-position")&&($("#btn-exp-position").disabled=!0),$("#btn-pdf-position")&&($("#btn-pdf-position").disabled=!0)}};(d=$("#btn-gen-position"))==null||d.addEventListener("click",f),(g=$("#btn-exp-position"))==null||g.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"rubro",label:"Rubro"},{key:"nota",label:"Nota"},{key:"actual",label:getInputVal("pos-month")},{key:"comparativo",label:getInputVal("pos-compare-month")}],`estado_situacion_financiera_${getInputVal("pos-month")}_vs_${getInputVal("pos-compare-month")}`)}),(u=$("#btn-pdf-position"))==null||u.addEventListener("click",async()=>{if(i)try{const y=ut();if(!y)return;const{showNotes:v,sections:b,totals:h,reportDate:_,compareDate:A,reportMonth:C,compareMonth:I}=i,N=new y({orientation:"portrait",unit:"pt",format:"letter"}),T=await mt(),S=ft(N,T,{title:"Estado de Situacion Financiera",subtitles:[`Periodo mensual comparativo: ${C} vs ${I}`,`Cortes: ${_} / ${A}`]}),w=[],E=(R,B,M)=>{w.push([{content:R,colSpan:v?4:3,styles:{fontStyle:"bold",textColor:[13,33,55],fillColor:[245,245,245]}}]),B.detail.forEach(k=>{v?w.push([k.label,k.note||"",re(k.now),re(k.cmp)]):w.push([k.label,re(k.now),re(k.cmp)])}),v?w.push([M,"",re(B.totalNow),re(B.totalCmp)]):w.push([M,re(B.totalNow),re(B.totalCmp)])};E("Activos corrientes",b.actCorr,"Total activos corrientes"),E("Activos no corrientes",b.actNoCorr,"Total activos no corrientes"),v?w.push(["Total activos","",re(h.totalActivosNow),re(h.totalActivosCmp)]):w.push(["Total activos",re(h.totalActivosNow),re(h.totalActivosCmp)]),E("Pasivos corrientes",b.pasCorr,"Total pasivos corrientes"),E("Pasivos no corrientes",b.pasNoCorr,"Total pasivos no corrientes"),v?w.push(["Total pasivos","",re(h.totalPasivosNow),re(h.totalPasivosCmp)]):w.push(["Total pasivos",re(h.totalPasivosNow),re(h.totalPasivosCmp)]),E("Patrimonio",b.patrimonio,"Total patrimonio"),v?w.push(["Total pasivos mas patrimonio","",re(h.totalPyPNow),re(h.totalPyPCmp)]):w.push(["Total pasivos mas patrimonio",re(h.totalPyPNow),re(h.totalPyPCmp)]);const L=v?[["Rubro","Nota",String(_),String(A)]]:[["Rubro",String(_),String(A)]];N.autoTable({startY:S.startY,head:L,body:w,theme:"plain",margin:{top:S.startY,left:S.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.3,textColor:[55,55,55],cellPadding:2.5,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineWidth:{bottom:.25}},columnStyles:v?{0:{cellWidth:280},1:{cellWidth:54,halign:"center"},2:{cellWidth:110,halign:"right"},3:{cellWidth:110,halign:"right"}}:{0:{cellWidth:334},1:{cellWidth:110,halign:"right"},2:{cellWidth:110,halign:"right"}},didParseCell:R=>{var k;if(R.section!=="body")return;const B=(k=w[R.row.index])==null?void 0:k[0];if(typeof B=="object"&&(B!=null&&B.colSpan))return;String(B||"").toLowerCase().startsWith("total ")&&(R.cell.styles.fontStyle="bold",R.cell.styles.fillColor=[236,236,236],R.cell.styles.textColor=[13,33,55])},didDrawPage:R=>bt(N,R.pageNumber)}),N.save(`estado_situacion_financiera_${C}_vs_${I}.pdf`)}catch(y){showToast(`Error al generar PDF: ${y.message}`,"error")}})}async function fn(){var i,c,r;const e=Ze();if(!e)return;const t=todayStr().slice(0,7);let a=[];try{a=await API.getTxTypes()}catch{a=[]}e.innerHTML=`
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
    </div>`;let o=[],s=null;const n=async()=>{const l=$("#journal-results");if(!l)return;const p=getInputVal("journal-month-from"),m=getInputVal("journal-month-to"),f=getSelectVal("journal-tx-type"),d=pn(p,m);if(!d)return showToast("Rango mensual inválido. Verifica Desde/Hasta.","warning");l.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Libro Diario...</div>';try{const{transactions:g,txLines:u}=await et(),y=Object.fromEntries(g.map(_=>[_.id,_])),v=u.map(_=>{var C,I,N,T,S,w;const A=y[_.tx_id];return!A||A.status!=="active"||!A.date||String(A.date)<d.fromDate||String(A.date)>d.toDate||f&&String(A.tx_type_id||"")!==String(f)?null:{fecha:A.date||"",comprobante:A.number||"",descripcion:A.description||"",tercero:((I=(C=A.expand)==null?void 0:C.third_party_id)==null?void 0:I.name)||"—",cuenta:`${((T=(N=_.expand)==null?void 0:N.account_id)==null?void 0:T.code)||""} - ${((w=(S=_.expand)==null?void 0:S.account_id)==null?void 0:w.name)||""}`.trim(),debito:Number(_.debit||0),credito:Number(_.credit||0)}}).filter(Boolean).sort((_,A)=>`${_.fecha}|${_.comprobante}|${_.cuenta}`.localeCompare(`${A.fecha}|${A.comprobante}|${A.cuenta}`)),b=v.reduce((_,A)=>_+Number(A.debito||0),0),h=v.reduce((_,A)=>_+Number(A.credito||0),0);l.innerHTML=`
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Período: <strong>${esc(p)}</strong> a <strong>${esc(m)}</strong> · Registros: <strong>${fmtN(v.length)}</strong> · Débito: <strong>${fmt(b)}</strong> · Crédito: <strong>${fmt(h)}</strong></p>
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
                <td class="font-bold">${fmt(b)}</td>
                <td class="font-bold">${fmt(h)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`,o=v,s={fromMonth:p,toMonth:m,txTypeId:f,totalDeb:b,totalCre:h},$("#btn-exp-journal")&&($("#btn-exp-journal").disabled=!v.length),$("#btn-pdf-journal")&&($("#btn-pdf-journal").disabled=!v.length)}catch(g){l.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(g.message)}</div>`,o=[],s=null,$("#btn-exp-journal")&&($("#btn-exp-journal").disabled=!0),$("#btn-pdf-journal")&&($("#btn-pdf-journal").disabled=!0)}};(i=$("#btn-gen-journal"))==null||i.addEventListener("click",n),(c=$("#btn-exp-journal"))==null||c.addEventListener("click",()=>{o.length&&exportToExcel(o,[{key:"fecha",label:"Fecha"},{key:"comprobante",label:"Comprobante"},{key:"descripcion",label:"Descripcion"},{key:"tercero",label:"Tercero"},{key:"cuenta",label:"Cuenta"},{key:"debito",label:"Debito"},{key:"credito",label:"Credito"}],`libro_diario_${(s==null?void 0:s.fromMonth)||t}_a_${(s==null?void 0:s.toMonth)||t}`)}),(r=$("#btn-pdf-journal"))==null||r.addEventListener("click",async()=>{if(!(!o.length||!s))try{const l=ut();if(!l)return;const p=new l({orientation:"portrait",unit:"pt",format:"letter"}),m=await mt(),f=a.find(u=>String(u.id)===String(s.txTypeId)),d=ft(p,m,{title:"Libro Diario",subtitles:[`Periodo mensual: ${s.fromMonth} a ${s.toMonth}`,`Tipo de transaccion: ${f?`${f.code||""} - ${f.name||""}`:"Todos"}`]}),g=o.map(u=>[u.fecha,u.comprobante,u.descripcion,u.tercero,u.cuenta,fe(u.debito),fe(u.credito)]);g.push(["TOTAL","","","","",fe(s.totalDeb),fe(s.totalCre)]),p.autoTable({startY:d.startY,head:[["Fecha","Comp.","Descripcion","Tercero","Cuenta","Debito","Credito"]],body:g,theme:"plain",margin:{top:d.startY,left:d.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:6.5,textColor:[55,55,55],cellPadding:2,lineWidth:0,overflow:"linebreak"},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:6.7,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:48},1:{cellWidth:58},2:{cellWidth:126},3:{cellWidth:90},4:{cellWidth:124},5:{cellWidth:56,halign:"right"},6:{cellWidth:56,halign:"right"}},didParseCell:u=>{u.section==="body"&&u.row.index===g.length-1&&(u.cell.styles.fontStyle="bold",u.cell.styles.fillColor=[236,236,236],u.cell.styles.textColor=[13,33,55],u.cell.styles.lineWidth={top:.2},u.cell.styles.lineColor=[13,33,55])},didDrawPage:u=>bt(p,u.pageNumber)}),p.save(`libro_diario_${s.fromMonth}_a_${s.toMonth}.pdf`)}catch(l){showToast(`Error al generar PDF: ${l.message}`,"error")}})}async function bn(){var t;const e=Ze();if(e){e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Libro Auxiliar...</div>';try{const[{accounts:a},{thirdParties:o}]=await Promise.all([Xe(),et()]);e.innerHTML=`
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
      <div id="aux-results" class="p-4 text-sm" style="color:#6B7280">Configura filtros y pulsa Generar.</div>`,(t=$("#btn-gen-aux"))==null||t.addEventListener("click",gn)}catch(a){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(a.message)}</div>`}}}function to(){const e=$("#aux-tx-detail-overlay");e&&e.remove()}async function Sr(e){var t,a;try{to();const o=document.createElement("div");o.id="aux-tx-detail-overlay",o.style.cssText="position:fixed;inset:0;z-index:1200;background:rgba(13,33,55,.45);display:flex;align-items:center;justify-content:center;padding:20px",o.innerHTML='<div class="rounded-2xl border bg-white p-6 text-center" style="width:min(1080px,96vw);max-height:92vh;overflow:auto;border-color:#D1D5DB;box-shadow:0 24px 60px rgba(0,0,0,.25);color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando comprobante...</div>',document.body.appendChild(o);const s=await pb.get("transactions",e,{expand:"tx_type_id,third_party_id,user_id"}),n=await API.getTxLines(e);o.innerHTML=`
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
                ${n.map(i=>{var c,r,l,p,m,f;return`<tr>
                  <td>${esc(((r=(c=i.expand)==null?void 0:c.account_id)==null?void 0:r.code)||"")} - ${esc(((p=(l=i.expand)==null?void 0:l.account_id)==null?void 0:p.name)||"")}</td>
                  <td>${esc(((f=(m=i.expand)==null?void 0:m.third_party_id)==null?void 0:f.name)||"—")}</td>
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
      </div>`,o.addEventListener("click",i=>{i.target===o&&to()})}catch(o){const s=$("#aux-tx-detail-overlay");s&&(s.innerHTML=`<div class="rounded-xl border p-4 bg-white" style="width:min(780px,92vw);border-color:#FCA5A5;background:#FEF2F2;color:#991B1B"><div class="flex items-center justify-between gap-2"><div><i class="fas fa-circle-exclamation mr-2"></i>${esc(o.message)}</div><button class="btn btn-outline btn-sm" onclick="closeAuxTxDetailPanel()">Cerrar</button></div></div>`)}}async function gn(){var t,a,o,s;const e=$("#aux-results");if(e){e.innerHTML='<div class="p-4 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando...</div>';try{const[{transactions:n,txLines:i,thirdParties:c},{accounts:r}]=await Promise.all([et(),Xe()]),l=getSelectVal("aux-mode"),p=getSelectVal("aux-account"),m=getSelectVal("aux-third"),f=(((t=$("#aux-date-from"))==null?void 0:t.value)||"").trim(),d=(((a=$("#aux-date-to"))==null?void 0:a.value)||"").trim();let g=null;if(p){const x=r.find(P=>P.id===p);if(x){const P=String(x.code||"");g=new Set(r.filter(V=>{const U=String(V.code||"");return U===P||U.startsWith(P)}).map(V=>V.id))}else g=new Set([p])}const u=Object.fromEntries(r.map(x=>[x.id,x])),y=Object.fromEntries(n.map(x=>[x.id,x])),v=Object.fromEntries((c||[]).map(x=>[x.id,x])),b=new Map;if(f)for(const x of i){const P=y[x.tx_id];if(!P||P.status!=="active"||P.date>=f||g&&!g.has(x.account_id))continue;const V=u[x.account_id];if(!V)continue;const U=x.third_party_id||P.third_party_id||"",z=(x.cross_doc_ref||"").trim()||"SIN_DOC",J=V.maneja_cruce?`doc|${x.account_id}|${U||"NO_TERCERO"}|${z}`:`acc|${x.account_id}|${U||"NO_TERCERO"}`,te=b.get(J)||0,F=Number(x.debit||0),D=Number(x.credit||0),q=F-D;b.set(J,te+q)}const h=i.map(x=>{var G,ee,X,ne,Z;const P=y[x.tx_id];if(!P||P.status!=="active")return null;const V=x.third_party_id||P.third_party_id||"";if(g&&!g.has(x.account_id)||m&&V!==m||f&&P.date<f||d&&P.date>d)return null;const U=u[x.account_id],z=(U==null?void 0:U.code)||((ee=(G=x.expand)==null?void 0:G.account_id)==null?void 0:ee.code)||"",J=(U==null?void 0:U.name)||((ne=(X=x.expand)==null?void 0:X.account_id)==null?void 0:ne.name)||"",te=v[V]||((Z=P.expand)==null?void 0:Z.third_party_id)||null,F=(te==null?void 0:te.name)||"Sin tercero",D=(te==null?void 0:te.doc_number)||"",q=D?`${D} - ${F}`:F;return{fecha:P.date||"",comprobante:P.number||"",txId:P.id||"",cuenta:`${z} - ${J}`.trim(),accountCode:z,accountName:J,tercero:q,thirdName:F,thirdDoc:D,doc_cruce:(x.cross_doc_ref||"").trim(),descripcion:x.description||P.description||"",debito:Number(x.debit||0),credito:Number(x.credit||0),keyCuenta:`${z} - ${J}`.trim(),keyTercero:q,accountId:x.account_id,accountNature:(U==null?void 0:U.nature)||"debit",accountManejaCruce:!!(U!=null&&U.maneja_cruce),thirdId:V||"NO_TERCERO"}}).filter(Boolean),_=[...h].sort((x,P)=>`${x.accountId}|${x.thirdId}|${x.fecha}|${x.doc_cruce||"SIN_DOC"}|${x.comprobante}`.localeCompare(`${P.accountId}|${P.thirdId}|${P.fecha}|${P.doc_cruce||"SIN_DOC"}|${P.comprobante}`)),A=new Map;for(const x of _){const P=x.accountManejaCruce?`doc|${x.accountId}|${x.thirdId}|${x.doc_cruce||"SIN_DOC"}`:`acc|${x.accountId}|${x.thirdId}`;x.balanceKey=P;const V=b.get(P)||0,U=A.get(P)||0,z=x.debito-x.credito;x.saldo_anterior=V,x.saldo_actual=V+U+z,A.set(P,U+z)}const C=l==="tercero-cuenta"?"keyTercero":"keyCuenta",I=l==="tercero-cuenta"?"keyCuenta":"keyTercero",N=l==="tercero-cuenta"?"Tercero":"Cuenta",T=l==="tercero-cuenta"?"Cuenta":"Tercero";if(h.sort((x,P)=>{const V=`${x[C]}|${x[I]}|${x.fecha}|${x.doc_cruce||"SIN_DOC"}|${x.comprobante}`,U=`${P[C]}|${P[I]}|${P.fecha}|${P.doc_cruce||"SIN_DOC"}|${P.comprobante}`;return V.localeCompare(U)}),!h.length){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">No hay movimientos para los filtros seleccionados.</div>';return}const S=x=>{const P=new Set;let V=0;for(const U of x){const z=U.balanceKey||"";!z||P.has(z)||(P.add(z),V+=Number(U.saldo_anterior||0))}return V},w=x=>{const P=new Map;for(const U of x){const z=U.balanceKey||"";z&&P.set(z,Number(U.saldo_actual||0))}let V=0;return P.forEach(U=>{V+=U}),V},E=S(h),L=h.reduce((x,P)=>x+P.debito,0),R=h.reduce((x,P)=>x+P.credito,0),B=w(h),M=new Map;for(const x of h){const P=x[C]||"—",V=x[I]||"—";M.has(P)||M.set(P,new Map);const U=M.get(P);U.has(V)||U.set(V,[]),U.get(V).push(x)}const k=[];M.forEach((x,P)=>{const V=[...x.values()].flat(),U=V[0]||{},z=V.reduce((D,q)=>D+q.debito,0),J=V.reduce((D,q)=>D+q.credito,0),te=S(V),F=w(V);l==="cuenta-tercero"?k.push({kind:"primary",cuenta:U.accountCode||P,detalle:(U.accountName||"").toUpperCase()}):k.push({kind:"primary",nit:U.thirdDoc||"",detalle:(U.thirdName||P).toUpperCase()}),x.forEach((D,q)=>{const G=D[0]||{},ee=S(D),X=D.reduce((Q,oe)=>Q+oe.debito,0),ne=D.reduce((Q,oe)=>Q+oe.credito,0),Z=w(D);l==="cuenta-tercero"?k.push({kind:"secondary",nit:G.thirdDoc||"",detalle:(G.thirdName||q).toUpperCase()}):k.push({kind:"secondary",cuenta:G.accountCode||q,detalle:(G.accountName||"").toUpperCase()}),D.forEach(Q=>{k.push({kind:"detail",fecha:Q.fecha,cruce:Q.doc_cruce,detalle:Q.descripcion,comprobante:Q.comprobante,txId:Q.txId,saldo_anterior:Q.saldo_anterior,debito:Q.debito,credito:Q.credito,saldo_actual:Q.saldo_actual})}),k.push({kind:"subtotal-secondary",detalle:`SubTotal ${l==="cuenta-tercero"?G.thirdName||q:G.accountName||q}`,saldo_anterior:ee,debito:X,credito:ne,saldo_actual:Z})}),k.push({kind:"subtotal-primary",detalle:`SubTotal ${l==="cuenta-tercero"?U.accountName||P:U.thirdName||P}`,saldo_anterior:te,debito:z,credito:J,saldo_actual:F})}),k.push({kind:"grand-total",detalle:"GRAN TOTAL LIBRO AUXILIAR",saldo_anterior:E,debito:L,credito:R,saldo_actual:B});const j=l==="tercero-cuenta"?"nit":"cuenta",Y=l==="tercero-cuenta"?"cuenta":"nit",W=l==="tercero-cuenta"?"NIT":"CUENTA",K=l==="tercero-cuenta"?"CUENTA":"NIT",H=k.map(x=>x.kind==="primary"?`<tr style="border-top:1px solid #E5E7EB"><td style="font-weight:700;color:#0D2137">${esc(x[j]||"")}</td><td style="font-weight:700;color:#0D2137">${esc(x[Y]||"")}</td><td></td><td></td><td style="font-weight:700;color:#0D2137">${esc(x.detalle||"")}</td><td></td><td></td><td></td><td></td><td></td></tr>`:x.kind==="secondary"?`<tr><td style="font-weight:700">${esc(x[j]||"")}</td><td style="font-weight:700">${esc(x[Y]||"")}</td><td></td><td></td><td style="font-weight:700;padding-left:10px">${esc(x.detalle||"")}</td><td></td><td></td><td></td><td></td><td></td></tr>`:x.kind==="subtotal-secondary"?`<tr style="background:#F5F5F5;border-top:1px solid #D0D0D0"><td colspan="5" style="font-weight:700;color:#0D2137">${esc(x.detalle||"")}</td><td></td><td style="text-align:right;font-weight:700">${je(x.saldo_anterior||0)}</td><td style="text-align:right;font-weight:700">${fmt(x.debito||0)}</td><td style="text-align:right;font-weight:700">${fmt(x.credito||0)}</td><td style="text-align:right;font-weight:700">${je(x.saldo_actual||0)}</td></tr>`:x.kind==="subtotal-primary"?`<tr style="background:#ECECEC;border-top:1px solid #B0B0B0;border-bottom:1px solid #B0B0B0"><td colspan="5" style="font-weight:800;color:#0D2137">${esc(x.detalle||"")}</td><td></td><td style="text-align:right;font-weight:800">${je(x.saldo_anterior||0)}</td><td style="text-align:right;font-weight:800">${fmt(x.debito||0)}</td><td style="text-align:right;font-weight:800">${fmt(x.credito||0)}</td><td style="text-align:right;font-weight:800">${je(x.saldo_actual||0)}</td></tr>`:x.kind==="grand-total"?`<tr style="background:#E2E2E2;border-top:2px solid #0D2137;border-bottom:2px solid #0D2137"><td colspan="5" style="font-weight:800;color:#0D2137">${esc(x.detalle||"")}</td><td></td><td style="text-align:right;font-weight:800">${je(x.saldo_anterior||0)}</td><td style="text-align:right;font-weight:800">${fmt(x.debito||0)}</td><td style="text-align:right;font-weight:800">${fmt(x.credito||0)}</td><td style="text-align:right;font-weight:800">${je(x.saldo_actual||0)}</td></tr>`:`<tr>
        <td></td>
        <td></td>
        <td>${esc(x.fecha||"")}</td>
        <td style="font-family:monospace">${esc(x.cruce||"")}</td>
        <td>${esc(x.detalle||"")}</td>
        <td>${x.txId?`<a href="#" onclick="event.preventDefault(); openAuxTxDetailInReport('${esc(x.txId)}');" style="color:#333;font-weight:700;text-decoration:underline">${esc(x.comprobante||"")}</a>`:esc(x.comprobante||"")}</td>
        <td style="text-align:right">${je(x.saldo_anterior||0)}</td>
        <td style="text-align:right">${fmt(x.debito||0)}</td>
        <td style="text-align:right">${fmt(x.credito||0)}</td>
        <td style="text-align:right">${je(x.saldo_actual||0)}</td>
      </tr>`).join("");e.innerHTML=`
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm" style="color:#6B7280">Orden actual: <strong>${esc(N)} → ${esc(T)} → Fecha → Doc. Cruce</strong> · Registros: <strong>${fmtN(h.length)}</strong></p>
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
      </div>`,(o=$("#btn-exp-aux"))==null||o.addEventListener("click",()=>{const x=k.map(P=>({nit:P.nit||"",cuenta:P.cuenta||"",fecha:P.fecha||"",cruce:P.cruce||"",detalle_docto:P.detalle||"",comprobante:P.comprobante||"",saldo_anterior:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.saldo_anterior||0):"",debito:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.debito||0):"",credito:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.credito||0):"",nuevo_saldo:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.saldo_actual||0):""}));exportToExcel(x,[{key:j,label:W},{key:Y,label:K},{key:"fecha",label:"FECHA"},{key:"cruce",label:"CRUCE"},{key:"detalle_docto",label:"DETALLE DOCTO."},{key:"comprobante",label:"COMPROBANTE"},{key:"saldo_anterior",label:"SALDO ANTERIOR"},{key:"debito",label:"DEBITO"},{key:"credito",label:"CREDITO"},{key:"nuevo_saldo",label:"NUEVO SALDO"}],"libro_auxiliar")}),(s=$("#btn-pdf-aux"))==null||s.addEventListener("click",async()=>{var x;try{const P=(x=window.jspdf)==null?void 0:x.jsPDF;if(typeof P!="function"){showToast("No se pudo inicializar el generador PDF.","error");return}const[V,U,z,J,te,F]=await Promise.all([API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>""),API.getSetting("company_city").catch(()=>""),API.getSetting("company_country").catch(()=>""),API.getSetting("software_name").catch(()=>"")]),D=new P({orientation:"portrait",unit:"pt",format:"letter"}),q=D.internal.pageSize.getWidth(),G=new Date().toLocaleString("es-CO"),ee=24,X=q-24,ne=(V||"EMPRESA").trim(),Z=`NIT: ${(U||"N/A").trim()}`,Q=[z,J,te].map(ie=>String(ie||"").trim()).filter(Boolean).join(" / ")||"Direccion no configurada",oe=`${N} -> ${T}`,ve=`Desde: ${f||"Inicio"}  Hasta: ${d||"Hoy"}`,be=p?r.find(ie=>ie.id===p):null,pe=`Cuentas consultadas: ${be?[be.code,be.name].map(ie=>String(ie||"").trim()).filter(Boolean).join(" - ")||"Cuenta seleccionada":"Todas"}`,de=(F||"GRAVY v2.0").trim(),me=(sessionStorage.getItem("user_name")||"Usuario").trim();D.setFont("helvetica","bold"),D.setFontSize(10),D.setTextColor(13,33,55),D.text(ne,ee,20),D.setFont("helvetica","normal"),D.setFontSize(8),D.setTextColor(100,100,100),D.text(Z,ee,30),D.text(Q,ee,40),D.setFont("helvetica","bold"),D.setFontSize(11),D.setTextColor(13,33,55),D.text("LIBRO AUXILIAR",q/2,20,{align:"center"}),D.setFont("helvetica","normal"),D.setFontSize(8),D.setTextColor(80,80,80),D.text(`Tipo: ${oe}`,q/2,30,{align:"center"}),D.text(ve,q/2,40,{align:"center"}),D.text(pe,q/2,50,{align:"center"}),D.setFont("helvetica","normal"),D.setFontSize(8),D.setTextColor(100,100,100),D.text(de,X,20,{align:"right"}),D.text(`Usuario: ${me}`,X,30,{align:"right"}),D.text(`Impreso: ${G}`,X,40,{align:"right"}),D.setDrawColor(180,180,180),D.setLineWidth(.5),D.line(ee,58,X,58);const ue=ie=>Number(ie||0).toLocaleString("es-CO",{minimumFractionDigits:2,maximumFractionDigits:2}),Ie=ie=>{const le=Number(ie||0),Be=ue(Math.abs(le));return le<0?`-${Be}`:Be},Se=k.map(ie=>{const le=[];return ie.kind==="primary"||ie.kind==="secondary"?le.push(ie[j]||"",ie[Y]||"","","",ie.detalle||"","","","","",""):ie.kind==="subtotal-secondary"||ie.kind==="subtotal-primary"||ie.kind==="grand-total"?le.push("","","","",ie.detalle||"","",Ie(ie.saldo_anterior||0),ue(ie.debito||0),ue(ie.credito||0),Ie(ie.saldo_actual||0)):le.push("","",ie.fecha||"",ie.cruce||"",ie.detalle||"",ie.comprobante||"",Ie(ie.saldo_anterior||0),ue(ie.debito||0),ue(ie.credito||0),Ie(ie.saldo_actual||0)),le._rowKind=ie.kind,le});D.autoTable({startY:66,head:[[W,K,"FECHA","CRUCE","DETALLE DOCTO.","COMPROBANTE","SALDO ANTERIOR","DEBITO","CREDITO","NUEVO SALDO"]],body:Se,theme:"plain",margin:{top:66,left:ee,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.5,textColor:[55,55,55],lineColor:[225,225,225],lineWidth:0,cellPadding:2.8},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineColor:[180,180,180],lineWidth:{top:0,right:0,bottom:.25,left:0}},columnStyles:{0:{cellWidth:44},1:{cellWidth:52},2:{cellWidth:44},3:{cellWidth:34},4:{cellWidth:100},5:{cellWidth:58},6:{cellWidth:58,halign:"right"},7:{cellWidth:56,halign:"right"},8:{cellWidth:56,halign:"right"},9:{cellWidth:58,halign:"right"}},didParseCell:ie=>{var Ce;if(ie.section!=="body")return;const{cell:le,row:Be,column:vt}=ie,Me=(Ce=Se[Be.index])==null?void 0:Ce._rowKind;Me==="primary"?(le.styles.fontStyle="bold",le.styles.textColor=[13,33,55],le.styles.fillColor=[255,255,255],le.styles.lineWidth=0):Me==="secondary"?(le.styles.fontStyle="bold",le.styles.textColor=[20,20,20],le.styles.fillColor=[255,255,255],le.styles.lineWidth=0):Me==="subtotal-secondary"?(le.styles.fillColor=[245,245,245],le.styles.fontStyle="bold",le.styles.lineWidth={top:.15,right:0,bottom:0,left:0},le.styles.lineColor=[208,208,208]):Me==="subtotal-primary"?(le.styles.fillColor=[236,236,236],le.styles.fontStyle="bold",le.styles.lineWidth={top:.15,right:0,bottom:.15,left:0},le.styles.lineColor=[176,176,176]):Me==="grand-total"?(le.styles.fillColor=[226,226,226],le.styles.fontStyle="bold",le.styles.lineWidth={top:.2,right:0,bottom:.2,left:0},le.styles.lineColor=[13,33,55],le.styles.textColor=[13,33,55]):Me==="detail"&&(le.styles.fontSize=vt.index>=6?6.1:6.4,le.styles.cellPadding=vt.index>=6?2.1:2.6,le.styles.lineWidth=0)},didDrawPage:ie=>{const le=D.internal.pageSize.getHeight();D.setFont("helvetica","normal"),D.setFontSize(7),D.setTextColor(120,120,120),D.text("Reporte generado por GRAVY - Escala de grises",ee,le-10),D.text(`Página ${ie.pageNumber}`,X,le-10,{align:"right"})}}),D.save(`libro_auxiliar_${todayStr()}.pdf`)}catch(P){showToast(`Error al generar PDF: ${P.message}`,"error")}})}catch(n){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(n.message)}</div>`}}}window.launchReportModal=Ue;window.agingBucket=rn;window.renderAgingPortfolio=ln;window.renderPortfolioBalances=eo;window.buildOpenPortfolioDocs=Ho;window.ensureLedgerData=et;window.generateAuxiliaryRows=gn;window.drawPdfHeader=ft;window.renderTrialBalance=dn;window.getSettingFirst=Ae;window.monthRangeToDates=pn;window.diffDays=sn;window.getReportViewHost=Ze;window.reportCard=Ve;window.openAuxTxDetailInReport=Sr;window.fmtSignedAmount=xt;window.renderFinancialPosition=mn;window.fmtPolarityAmount=Ne;window.fmtSignedPlain=je;window.diffDaysSigned=nn;window.renderJournalBook=fn;window.closeAuxTxDetailPanel=to;window.renderIncomeStatement=un;window.ensureAccountsSaldos=Xe;window.getByClass=Ir;window.fmtPdfSignedNum=re;window.renderAuxiliaryBook=bn;window.getPdfHeaderContext=mt;window.addDays=cn;window.fmtPdfNum=fe;window.getPdfCtorOrWarn=ut;window.REPORT_STATE=$e;window.renderReportes=Tr;window.drawPdfFooter=bt;window.signatureBlock=ha;const ao=[{key:"company_name",label:"Razón social",placeholder:"Nombre de la empresa"},{key:"company_nit",label:"NIT",placeholder:"900.123.456-7"},{key:"company_address",label:"Dirección",placeholder:"Dirección principal"},{key:"company_phone",label:"Teléfono",placeholder:"601-555-0100"},{key:"company_email",label:"Correo",placeholder:"info@empresa.com",type:"email"},{key:"smv_year",label:"SMV del año",placeholder:"2026",type:"number"}],xe={legalName:["representante_legal_name","legal_representative_name","rep_legal_name"],legalTitle:["representante_legal_title","legal_representative_title","rep_legal_title"],accountantName:["contador_name","accountant_name"],accountantTitle:["contador_title","accountant_title"],accountantLicense:["contador_license","accountant_license"],reviewerName:["revisor_fiscal_name","fiscal_reviewer_name"],reviewerTitle:["revisor_fiscal_title","fiscal_reviewer_title"],reviewerLicense:["revisor_fiscal_license","fiscal_reviewer_license"],defaultEnabled:["trial_show_signatures_default","show_signatures_default"]};async function Oe(e,t=""){for(const a of e){const o=await API.getSetting(a);if(o)return o}return t}async function vn(){const[e,t,a,o,s,n,i,c,r]=await Promise.all([Oe(xe.legalName,""),Oe(xe.legalTitle,"Representante Legal"),Oe(xe.accountantName,""),Oe(xe.accountantTitle,"Contador"),Oe(xe.accountantLicense,""),Oe(xe.reviewerName,""),Oe(xe.reviewerTitle,"Revisor Fiscal"),Oe(xe.reviewerLicense,""),Oe(xe.defaultEnabled,"0")]);return{legalName:e,legalTitle:t,accountantName:a,accountantTitle:o,accountantLicense:s,reviewerName:n,reviewerTitle:i,reviewerLicense:c,defaultEnabled:String(r).trim()==="1"||String(r).toLowerCase()==="true"}}async function hn(){if(!can("canWrite"))return showToast("Sin permisos para actualizar firmas","error");try{const e=[[xe.legalName[0],getInputVal("sig-legal-name").trim()],[xe.legalTitle[0],getInputVal("sig-legal-title").trim()||"Representante Legal"],[xe.accountantName[0],getInputVal("sig-acc-name").trim()],[xe.accountantTitle[0],getInputVal("sig-acc-title").trim()||"Contador"],[xe.accountantLicense[0],getInputVal("sig-acc-license").trim()],[xe.reviewerName[0],getInputVal("sig-rev-name").trim()],[xe.reviewerTitle[0],getInputVal("sig-rev-title").trim()||"Revisor Fiscal"],[xe.reviewerLicense[0],getInputVal("sig-rev-license").trim()],[xe.defaultEnabled[0],getCheckVal("sig-default-enabled")?"1":"0"]];await Promise.all(e.map(([t,a])=>API.setSetting(t,a))),showToast("Firmas actualizadas correctamente","success")}catch(e){showToast(e.message||"No se pudieron guardar las firmas","error")}}async function yn(e){var t,a;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando configuración...</div>';try{const[o,s]=await Promise.all([pb.listAll("settings",{sort:"key"}),vn()]),n=Object.fromEntries(o.map(c=>[String(c.key||""),c])),i=can("canWrite");e.innerHTML=`
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
      </div>`,(t=$("#btn-save-config"))==null||t.addEventListener("click",async()=>{try{const c=ao.map(r=>[r.key,getInputVal(`cfg-${r.key}`).trim()]);await Promise.all(c.map(([r,l])=>API.setSetting(r,l))),$("#topbar-company").textContent=getInputVal("cfg-company_name").trim(),showToast("Configuración actualizada correctamente","success"),yn(e)}catch(c){showToast(c.message||"No se pudo guardar la configuración","error")}}),(a=$("#btn-save-signatures"))==null||a.addEventListener("click",hn)}catch(o){e.innerHTML=`<div class="bg-white rounded-2xl border p-8 text-center" style="border-color:#F0F0F0"><i class="fas fa-circle-exclamation text-3xl mb-3" style="color:#EF4444"></i><p class="font-semibold" style="color:#374151">No fue posible cargar la configuración</p><p class="text-sm mt-2" style="color:#6B7280">${esc(o.message)}</p></div>`}}window.loadSignatureSettings=vn;window.SIGNATURE_SETTINGS=xe;window.saveSignatureSettingsFromForm=hn;window.renderConfiguracion=yn;window.CONFIG_FIELDS=ao;window.getSettingFirst=Oe;let _e={page:1,perPage:100,total:0};function Oa(e){if(!e)return"—";const t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleString("es-CO",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1})}function ka(e){return(e==null?void 0:e.event_at)||(e==null?void 0:e.created)||""}async function Nr(e){var t,a,o,s;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando auditoría...</div>';try{const n=await pb.list("audit_log",{page:1,perPage:100,sort:"-event_at"}),i=[...new Set(n.items.map(l=>l.action).filter(Boolean))].sort(),c=[...new Set(n.items.map(l=>l.entity).filter(Boolean))].sort();_e={page:1,perPage:100,total:0},e.innerHTML=`
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
      </div>`;const r=()=>{_e.page=1,_a()};(t=$("#btn-audit-search"))==null||t.addEventListener("click",r),(a=$("#audit-q"))==null||a.addEventListener("keydown",l=>{l.key==="Enter"&&r()}),(o=$("#btn-audit-clear"))==null||o.addEventListener("click",()=>{["audit-q","audit-from","audit-to"].forEach(l=>setInputVal(l,"")),["audit-action","audit-entity","audit-user-filter"].forEach(l=>{const p=$(`#${l}`);p&&(p.value="")}),$("#audit-results").innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-search mr-2"></i>Aplica filtros y pulsa Buscar</div>',$("#audit-pagination").style.display="none"}),(s=$("#btn-export-audit"))==null||s.addEventListener("click",_n),r()}catch(n){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(n.message)}</div>`}}async function _a(){var a,o;const e=$("#audit-results"),t=$("#audit-pagination");if(e){e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const s=getInputVal("audit-q").trim(),n=getSelectVal("audit-action"),i=getSelectVal("audit-entity"),c=getSelectVal("audit-user-filter"),r=getInputVal("audit-from"),l=getInputVal("audit-to"),p=[];if(n){const u=pb.escapeFilterValue(n);p.push(`action="${u}"`)}if(i){const u=pb.escapeFilterValue(i);p.push(`entity="${u}"`)}if(c){const u=pb.escapeFilterValue(c);p.push(`username="${u}"`)}if(r&&p.push(`event_at>="${r} 00:00:00"`),l&&p.push(`event_at<="${l} 23:59:59"`),s){const u=pb.escapeFilterValue(s);p.push(`(username~"${u}" || details~"${u}" || entity_id~"${u}")`)}const m={page:_e.page,perPage:_e.perPage,sort:"-event_at",filter:p.join(" && ")||""};let f;try{f=await pb.list("audit_log",m)}catch{const y=p.filter(v=>!v.startsWith('event_at>="')&&!v.startsWith('event_at<="')).join(" && ");f=await pb.list("audit_log",{page:_e.page,perPage:_e.perPage,sort:"-id",filter:y||""}),(r||l)&&showToast("Se omitió filtro por fecha en Auditoría.","warning")}_e.total=f.totalItems;const d=Math.ceil(f.totalItems/_e.perPage)||1,g=u=>u&&{CREATE:"badge-green",UPDATE:"badge-blue",DELETE:"badge-red",STATUS:"badge-orange",VOID:"badge-red",LOGIN:"badge-blue",LOGOUT:"badge-blue"}[u.toUpperCase()]||"badge-blue";if(!f.items.length){e.innerHTML='<div class="p-10 text-center" style="color:#9CA3AF">No hay registros para los filtros aplicados.</div>',t.style.display="none";return}e.innerHTML=`
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Fecha y Hora</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>ID Entidad</th><th>Detalle</th><th></th></tr></thead>
          <tbody>
            ${f.items.map(u=>{var y;return`
              <tr>
                <td class="whitespace-nowrap text-xs">${esc(Oa(ka(u)))}</td>
                <td class="font-medium text-sm">${esc(u.username||"—")}</td>
                <td><span class="badge ${g(u.action)}">${esc(u.action||"—")}</span></td>
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
      </div>`,(a=$("#audit-prev"))==null||a.addEventListener("click",()=>{_e.page--,_a()}),(o=$("#audit-next"))==null||o.addEventListener("click",()=>{_e.page++,_a()})}catch(s){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(s.message)}</div>`}}}function Lr(e){try{const t=JSON.parse(e);openModal("Detalle de Registro de Auditoría",`<div class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div><span class="form-label">Fecha y Hora</span><p class="font-medium">${esc(Oa(ka(t)))}</p></div>
          <div><span class="form-label">Usuario</span><p class="font-medium">${esc(t.username||"—")}</p></div>
          <div><span class="form-label">Acción</span><p><span class="badge badge-blue">${esc(t.action||"—")}</span></p></div>
          <div><span class="form-label">Entidad</span><p class="font-medium">${esc(t.entity||"—")}</p></div>
          <div class="col-span-2"><span class="form-label">ID de Entidad</span><p class="font-mono text-xs break-all">${esc(t.entity_id||"—")}</p></div>
          <div class="col-span-2"><span class="form-label">Detalle</span><p class="mt-1 p-3 rounded-lg text-sm break-words" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(t.details||"—")}</p></div>
          <div class="col-span-2"><span class="form-label">ID Registro Auditoría</span><p class="font-mono text-xs break-all" style="color:#9CA3AF">${esc(t.id||"—")}</p></div>
        </div>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch{showToast("No se pudo cargar el detalle","error")}}async function _n(){if(!can("canExport"))return showToast("Sin permisos de exportación","error");try{showToast("Generando exportación completa...","info");const e=getInputVal("audit-q").trim(),t=getSelectVal("audit-action"),a=getSelectVal("audit-entity"),o=getSelectVal("audit-user-filter"),s=getInputVal("audit-from"),n=getInputVal("audit-to"),i=[];if(t){const r=pb.escapeFilterValue(t);i.push(`action="${r}"`)}if(a){const r=pb.escapeFilterValue(a);i.push(`entity="${r}"`)}if(o){const r=pb.escapeFilterValue(o);i.push(`username="${r}"`)}if(s&&i.push(`event_at>="${s} 00:00:00"`),n&&i.push(`event_at<="${n} 23:59:59"`),e){const r=pb.escapeFilterValue(e);i.push(`(username~"${r}" || details~"${r}" || entity_id~"${r}")`)}let c;try{c=await pb.listAll("audit_log",{sort:"-event_at",filter:i.join(" && ")||""})}catch{const l=i.filter(p=>!p.startsWith('event_at>="')&&!p.startsWith('event_at<="')).join(" && ");c=await pb.listAll("audit_log",{sort:"-id",filter:l||""}),(s||n)&&showToast("Exportación sin filtro de fecha en Auditoría.","warning")}exportToExcel(c.map(r=>({"Fecha y Hora":Oa(ka(r)),Usuario:r.username||"",Acción:r.action||"",Entidad:r.entity||"","ID Entidad":r.entity_id||"",Detalle:r.details||""})),`auditoria_${todayStr()}`)}catch(e){showToast(e.message,"error")}}window.renderAuditoria=Nr;window.fmtAuditDateTime=Oa;window.AUDIT_STATE=_e;window.getAuditDateValue=ka;window.viewAuditDetail=Lr;window.loadAuditPage=_a;window.exportAuditLog=_n;async function Go(e){var t,a,o;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando usuarios...</div>';try{const s=await pb.listAll("users",{sort:"-created"});e.innerHTML=`
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
      </div>`,(a=$("#users-q"))==null||a.addEventListener("input",debounce(()=>filterTable("users-table",getInputVal("users-q")),150)),(o=$("#btn-new-user"))==null||o.addEventListener("click",()=>qo())}catch(s){e.innerHTML=`
      <div class="bg-white rounded-2xl border p-8 text-center" style="border-color:#F0F0F0">
        <i class="fas fa-circle-exclamation text-3xl mb-3" style="color:#EF4444"></i>
        <p class="font-semibold" style="color:#374151">No fue posible acceder a la coleccion de usuarios</p>
        <p class="text-sm mt-2" style="color:#6B7280">${esc(s.message)}</p>
        <p class="text-xs mt-3" style="color:#9CA3AF">Si el backend bloquea este recurso, puedes administrar usuarios desde el panel de PocketBase.</p>
      </div>`}}function qo(e=null){var t;if(!can("canManageUsers"))return showToast("No tienes permisos para gestionar usuarios","error");openModal(e?"Editar Usuario":"Nuevo Usuario",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Nombre completo</label><input id="uf-name" class="form-input" value="${esc((e==null?void 0:e.full_name)||"")}"></div>
      <div class="form-group"><label class="form-label">Correo</label><input id="uf-email" type="email" class="form-input" value="${esc((e==null?void 0:e.email)||"")}" ${e?"readonly":""}></div>
      <div class="form-group"><label class="form-label">Rol</label><select id="uf-role" class="form-input">${Object.keys(ROLES).map(a=>`<option value="${esc(a)}" ${((e==null?void 0:e.role)||"viewer")===a?"selected":""}>${esc(roleLabel(a))}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Estado</label><select id="uf-active" class="form-input"><option value="1" ${(e==null?void 0:e.active)!==!1?"selected":""}>Activo</option><option value="0" ${(e==null?void 0:e.active)===!1?"selected":""}>Inactivo</option></select></div>
      ${e?"":'<div class="form-group"><label class="form-label">Contraseña</label><input id="uf-pass" type="password" class="form-input"></div><div class="form-group"><label class="form-label">Confirmar Contraseña</label><input id="uf-pass2" type="password" class="form-input"></div>'}
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-user"><i class="fas fa-floppy-disk"></i> Guardar</button>'),(t=$("#btn-save-user"))==null||t.addEventListener("click",async()=>{var s;const a=$("#btn-save-user");a&&(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');const o={full_name:getInputVal("uf-name"),role:getSelectVal("uf-role"),active:getSelectVal("uf-active")==="1"};if(!o.full_name)return a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar'),showToast("El nombre es obligatorio","warning");try{if(e!=null&&e.id)await pb.update("users",e.id,o);else{const n=getInputVal("uf-email").toLowerCase(),i=getInputVal("uf-pass"),c=getInputVal("uf-pass2");if(!n||!i||!c)return showToast("Correo y contraseña son obligatorios","warning");if(i!==c)return showToast("Las contraseñas no coinciden","warning");const r=(n.split("@")[0]||"user").replace(/[^a-zA-Z0-9._-]/g,"").slice(0,30)||`user_${Date.now()}`,l=await pb.create("users",{...o,email:n,emailVisibility:!0,name:r,password:i,passwordConfirm:c})}closeModal(),showToast("Usuario guardado correctamente","success"),Go($("#page-content"))}catch(n){const i=(s=n==null?void 0:n.data)!=null&&s.data?Object.values(n.data.data).map(c=>c==null?void 0:c.message).filter(Boolean).join(" | "):"";showToast(i||n.message||"No se pudo guardar el usuario","error")}finally{a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar')}})}async function Pr(e){try{qo(await pb.get("users",e))}catch(t){showToast(t.message,"error")}}function Fr(e,t){if(!can("canManageUsers"))return showToast("No tienes permisos para cambiar estado","error");confirmDialog(t?"Reactivar usuario":"Inactivar usuario",t?"¿Deseas reactivar este usuario?":"¿Deseas inactivar este usuario?",async()=>{try{await pb.update("users",e,{active:t}),showToast("Estado actualizado","success"),Go($("#page-content"))}catch(a){showToast(a.message,"error")}})}window.editUser=Pr;window.toggleUser=Fr;window.renderUsuarios=Go;window.openUserForm=qo;async function Ke(e){var t,a,o,s,n,i,c,r,l,p,m,f,d;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando conciliaci?n...</div>';try{const[g,u,y]=await Promise.all([pb.listAll("bank_accounts",{sort:"name",expand:"account_id"}),API.getAccounts(!0),pb.listAll("bank_movements",{sort:"-date",expand:"bank_account_id,tx_line_id"})]),v=((t=g[0])==null?void 0:t.id)||"";e.innerHTML=`
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
            ${g.map(T=>`<option value="${esc(T.id)}" ${T.id===v?"selected":""}>${esc(T.bank)} - ${esc(T.number)} (${esc(T.name)})</option>`).join("")}
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
              ${y.length?y.map(T=>{var S,w,E,L;return`
                <tr data-bank-id="${esc(T.bank_account_id)}" data-mov-id="${esc(T.id)}" data-reconciled="${T.reconciled?"1":"0"}" data-date="${esc(T.date)}">
                  ${can("canWrite")?`<td>${T.reconciled?"":`<input type="checkbox" class="mov-check" value="${esc(T.id)}">`}</td>`:""}
                  <td>${esc(T.date)}</td>
                  <td>${esc(((w=(S=T.expand)==null?void 0:S.bank_account_id)==null?void 0:w.bank)||"")} - ${esc(((L=(E=T.expand)==null?void 0:E.bank_account_id)==null?void 0:L.number)||"")}</td>
                  <td>${esc(T.description||"?")}</td>
                  <td>${fmt(T.debit||0)}</td>
                  <td>${fmt(T.credit||0)}</td>
                  <td>${esc(T.ref||"?")}</td>
                  <td>${T.reconciled?'<span class="badge badge-green">S?</span>':'<span class="badge badge-orange">No</span>'}</td>
                  ${can("canWrite")?'<td class="mov-suggest"><span class="badge badge-gray">-</span></td>':""}
                  <td>${can("canWrite")?`<button class="btn btn-outline btn-sm" onclick="toggleRecon('${esc(T.id)}', ${T.reconciled?"false":"true"})"><i class="fas fa-check"></i></button>`:""}</td>
                </tr>`}).join(""):`<tr><td colspan="${can("canWrite")?"10":"8"}" class="text-center py-10" style="color:#9CA3AF">No hay movimientos bancarios.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;const b=new Map,h=()=>{const T=$$("#mov-table tbody .mov-check:checked").length,S=$("#btn-recon-selected");S&&(S.disabled=T===0,S.innerHTML=`<i class="fas fa-list-check"></i> Conciliar Seleccionadas${T?` (${T})`:""}`)},_=()=>{const T=getSelectVal("bank-filter"),S=getInputVal("mov-q").toLowerCase(),w=getInputVal("filter-from"),E=getInputVal("filter-to");$$("#mov-table tbody tr").forEach(L=>{const R=!T||L.dataset.bankId===T,B=!S||L.textContent.toLowerCase().includes(S),M=L.dataset.date||"",k=!w||M>=w,j=!E||M<=E;L.style.display=R&&B&&k&&j?"":"none"}),h()},A=T=>{b.clear(),T.forEach(E=>b.set(E.movementId,E));const S=T.length;$("#suggest-count")&&($("#suggest-count").textContent=String(S));const w=$("#btn-apply-suggested");w&&(w.disabled=S===0),$$("#mov-table tbody tr").forEach(E=>{const L=E.dataset.movId,R=E.querySelector(".mov-suggest");if(!R)return;const B=b.get(L);if(!B){R.innerHTML='<span class="badge badge-gray">-</span>';return}const M=B.confidence==="alta"?"badge-green":B.confidence==="media"?"badge-blue":"badge-orange",k=B.confidence==="alta"?"Alta":B.confidence==="media"?"Media":"Baja";R.innerHTML=`<span class="badge ${M}" title="${esc(B.reason)}">${k}</span>`})},C=async()=>{try{const T=getSelectVal("bank-filter");if(!T)return showToast("Selecciona una cuenta bancaria para sugerir conciliaci?n","warning");const S=g.find(L=>L.id===T);if(!(S!=null&&S.account_id))return showToast("La cuenta bancaria no tiene cuenta contable asociada","warning");const w=$("#btn-suggest-recon");w&&(w.disabled=!0,w.innerHTML='<i class="fas fa-spinner fa-spin"></i> Analizando...');const E=await En(S,y,3);A(E),E.length?showToast(`Se generaron ${E.length} sugerencia(s) de conciliaci?n`,"success"):showToast("No se encontraron sugerencias autom?ticas para esa cuenta","info")}catch(T){showToast(T.message||"Error generando sugerencias","error")}finally{const T=$("#btn-suggest-recon");T&&(T.disabled=!1,T.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> Sugerir Conciliaci?n')}},I=async()=>{const T=[...b.values()];if(!T.length)return showToast("No hay sugerencias para aplicar","warning");const S=$("#btn-apply-suggested");S&&(S.disabled=!0,S.innerHTML='<i class="fas fa-spinner fa-spin"></i> Aplicando...');let w=0;for(const E of T)try{await pb.update("bank_movements",E.movementId,{reconciled:!0,tx_line_id:E.txLineId}),w++}catch{}showToast(`Conciliadas ${w} sugerencia(s)`,w?"success":"warning"),Ke($("#page-content"))},N=async()=>{const T=$$("#mov-table tbody .mov-check:checked").map(E=>E.value);if(!T.length)return showToast("No hay movimientos seleccionados","warning");const S=$("#btn-recon-selected");S&&(S.disabled=!0,S.innerHTML='<i class="fas fa-spinner fa-spin"></i> Conciliando...');let w=0;for(const E of T){const L=b.get(E);try{await pb.update("bank_movements",E,L?{reconciled:!0,tx_line_id:L.txLineId}:{reconciled:!0}),w++}catch{}}showToast(`Conciliadas ${w} seleccionada(s)`,w?"success":"warning"),Ke($("#page-content"))};(a=$("#bank-filter"))==null||a.addEventListener("change",_),(o=$("#filter-from"))==null||o.addEventListener("change",_),(s=$("#filter-to"))==null||s.addEventListener("change",_),(n=$("#btn-clear-movs"))==null||n.addEventListener("click",()=>Cn(g,y)),(i=$("#mov-q"))==null||i.addEventListener("input",debounce(_,150)),(c=$("#btn-new-bank"))==null||c.addEventListener("click",()=>xn(u)),(r=$("#btn-new-mov"))==null||r.addEventListener("click",()=>An(g)),(l=$("#btn-import-ext"))==null||l.addEventListener("click",()=>Tn(g)),(p=$("#btn-suggest-recon"))==null||p.addEventListener("click",C),(m=$("#btn-apply-suggested"))==null||m.addEventListener("click",I),(f=$("#btn-recon-selected"))==null||f.addEventListener("click",N),(d=$("#mov-check-all"))==null||d.addEventListener("change",T=>{const S=!!T.target.checked;$$("#mov-table tbody tr").forEach(w=>{if(w.style.display==="none"||w.dataset.reconciled==="1")return;const E=w.querySelector(".mov-check");E&&(E.checked=S)}),h()}),$$("#mov-table tbody .mov-check").forEach(T=>T.addEventListener("change",h)),_()}catch(g){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(g.message)}</div>`}}function xn(e){var t;openModal("Nueva Cuenta Bancaria",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Nombre</label><input id="ba-name" class="form-input"></div>
      <div class="form-group"><label class="form-label">Banco</label><input id="ba-bank" class="form-input"></div>
      <div class="form-group"><label class="form-label">N?mero</label><input id="ba-number" class="form-input"></div>
      <div class="form-group"><label class="form-label">Cuenta contable asociada</label><select id="ba-account" class="form-input">${e.map(a=>`<option value="${esc(a.id)}">${esc(a.code)} - ${esc(a.name)}</option>`).join("")}</select></div>
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-ba">Guardar</button>'),(t=$("#btn-save-ba"))==null||t.addEventListener("click",async()=>{try{const a={name:getInputVal("ba-name"),bank:getInputVal("ba-bank"),number:getInputVal("ba-number"),account_id:getSelectVal("ba-account"),currency:"COP",active:!0};if(!a.name||!a.bank||!a.number||!a.account_id)return showToast("Completa todos los campos","warning");const o=await pb.create("bank_accounts",a);closeModal(),showToast("Cuenta bancaria creada","success"),Ke($("#page-content"))}catch(a){showToast(a.message,"error")}})}function An(e){var t;openModal("Nuevo Movimiento Bancario",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Cuenta Bancaria</label><select id="bm-acc" class="form-input">${e.map(a=>`<option value="${esc(a.id)}">${esc(a.bank)} - ${esc(a.number)}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Fecha</label><input id="bm-date" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Descripci?n</label><input id="bm-desc" class="form-input"></div>
      <div class="form-group"><label class="form-label">D?bito</label><input id="bm-debit" class="form-input" value="0"></div>
      <div class="form-group"><label class="form-label">Cr?dito</label><input id="bm-credit" class="form-input" value="0"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Referencia</label><input id="bm-ref" class="form-input"></div>
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-bm">Guardar</button>'),(t=$("#btn-save-bm"))==null||t.addEventListener("click",async()=>{try{const a={bank_account_id:getSelectVal("bm-acc"),date:getInputVal("bm-date"),description:getInputVal("bm-desc"),debit:parseNum(getInputVal("bm-debit")),credit:parseNum(getInputVal("bm-credit")),balance:0,ref:getInputVal("bm-ref"),reconciled:!1};if(!a.bank_account_id||!a.date)return showToast("Cuenta y fecha son obligatorias","warning");if(!(a.debit>0||a.credit>0))return showToast("Ingresa d?bito o cr?dito","warning");const o=await pb.create("bank_movements",a);closeModal(),showToast("Movimiento registrado","success"),Ke($("#page-content"))}catch(a){showToast(a.message,"error")}})}async function Dr(e,t){try{await pb.update("bank_movements",e,{reconciled:t}),showToast("Estado de conciliación actualizado","success"),Ke($("#page-content"))}catch(a){showToast(a.message,"error")}}function oo(e){if(!e)return null;const t=new Date(String(e).slice(0,10)+"T00:00:00");return isNaN(t)?null:t}function $n(e,t){const a=oo(e),o=oo(t);return!a||!o?999:Math.round(Math.abs((a-o)/864e5))}function so(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}function wn(e,t){const a=new Set(["de","la","el","los","las","por","para","con","del","y","en","a","un","una"]),o=new Set(so(e).split(" ").filter(i=>i.length>=4&&!a.has(i))),s=new Set(so(t).split(" ").filter(i=>i.length>=4&&!a.has(i)));if(!o.size||!s.size)return 0;let n=0;return o.forEach(i=>{s.has(i)&&n++}),n/Math.max(o.size,s.size)}async function En(e,t,a=3){const o=e==null?void 0:e.account_id;if(!o)return[];const s=pb.escapeFilterValue(o),n=await pb.listAll("tx_lines",{filter:`account_id="${s}"`,expand:"tx_id",sort:"-created"}),i=new Set(t.filter(m=>m.tx_line_id).map(m=>m.tx_line_id)),c=n.filter(m=>!i.has(m.id)),r=t.filter(m=>m.bank_account_id===e.id&&!m.reconciled),l=new Set,p=[];for(const m of r){const f=+(m.debit>0?m.debit:m.credit||0);if(!f)continue;const d=m.debit>0?"credit":"debit",g=c.filter(_=>!l.has(_.id)).filter(_=>Math.abs(+(_[d]||0)-f)<.01).map(_=>{var T,S,w,E;const A=((S=(T=_.expand)==null?void 0:T.tx_id)==null?void 0:S.date)||"",C=$n(m.date,A),I=wn(m.description||m.ref||"",_.description||((E=(w=_.expand)==null?void 0:w.tx_id)==null?void 0:E.description)||""),N=Math.max(0,100-C*12)+I*40;return{line:_,dDiff:C,descScore:I,score:N}}).filter(_=>_.dDiff<=a).sort((_,A)=>A.score-_.score);if(!g.length)continue;const u=g[0],y=g[1],v=!y||u.score-y.score>=20,b=v&&u.dDiff<=1?"alta":v?"media":"baja",h=`Monto exacto ${fmt(f)} · dif fecha ${u.dDiff} día(s)`;p.push({movementId:m.id,txLineId:u.line.id,confidence:b,reason:h}),l.add(u.line.id)}return p}function Cn(e,t){var i,c,r,l;const a=getInputVal("filter-from")||"",o=getInputVal("filter-to")||"",s=getSelectVal("bank-filter")||"";openModal('<i class="fas fa-trash-can mr-2" style="color:#DC2626"></i>Limpiar Per?odo',`<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:12px 14px;font-size:13px;color:#991B1B;margin-bottom:16px">
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
     </button>`);const n=()=>{const p=getSelectVal("clr-bank"),m=getInputVal("clr-from"),f=getInputVal("clr-to");if(!m||!f){$("#clr-preview").innerHTML='<span style="color:#9CA3AF">Selecciona ambas fechas para ver cu?ntos registros se eliminar?n.</span>',$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!0);return}if(m>f){$("#clr-preview").innerHTML='<span style="color:#EF4444"><i class="fas fa-circle-exclamation mr-1"></i>La fecha inicial no puede ser mayor que la final.</span>',$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!0);return}const d=t.filter(u=>(!p||u.bank_account_id===p)&&u.date>=m&&u.date<=f),g=d.filter(u=>u.reconciled).length;if(!d.length){$("#clr-preview").innerHTML='<span style="color:#6B7280">Ning?n movimiento coincide con ese rango.</span>',$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!0);return}$("#clr-preview").innerHTML=`
      <span style="color:#DC2626;font-weight:700"><i class="fas fa-triangle-exclamation mr-1"></i>
      Se eliminar?n <strong>${d.length}</strong> movimiento(s)
      ${g?`<span style="color:#92400E"> — de los cuales <strong>${g}</strong> ya est?n conciliados</span>`:""}
      </span>`,$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!1)};(i=$("#clr-bank"))==null||i.addEventListener("change",n),(c=$("#clr-from"))==null||c.addEventListener("change",n),(r=$("#clr-to"))==null||r.addEventListener("change",n),n(),(l=$("#btn-clr-confirm"))==null||l.addEventListener("click",async()=>{const p=getSelectVal("clr-bank"),m=getInputVal("clr-from"),f=getInputVal("clr-to"),d=t.filter(v=>(!p||v.bank_account_id===p)&&v.date>=m&&v.date<=f);if(!d.length)return;const g=$("#btn-clr-confirm");g&&(g.disabled=!0,g.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i> Eliminando...');let u=0,y=0;for(const v of d)try{await pb.delete("bank_movements",v.id),u++}catch{y++}closeModal(),y?showToast(`Eliminados ${u}. ${y} no pudieron borrarse (pueden tener restricciones).`,"warning"):showToast(`${u} movimiento(s) eliminado(s) correctamente`,"success"),Ke($("#page-content"))})}let We=[],Ct="";function Tn(e){openModal('<i class="fas fa-file-import mr-2"></i>Importar Extracto Bancario','<div id="import-wizard"></div>','<div id="import-footer" style="display:contents"></div>',!0),zo(e)}function zo(e){var a,o;$("#modal-body").querySelector("#import-wizard").innerHTML=`
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
    </div>`,$("#modal-footer").innerHTML='<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>',$$(".imp-tab").forEach(s=>{s.addEventListener("click",()=>{$$(".imp-tab").forEach(n=>{n.style.borderBottom="none",n.style.color="#6B7280"}),s.style.borderBottom="3px solid #2E6CE6",s.style.color="#2E6CE6",$("#imp-tab-excel").style.display=s.dataset.tab==="excel"?"":"none",$("#imp-tab-paste").style.display=s.dataset.tab==="paste"?"":"none"})});const t=$("#imp-drop-zone");t==null||t.addEventListener("click",()=>{var s;return(s=$("#imp-file-input"))==null?void 0:s.click()}),t==null||t.addEventListener("dragover",s=>{s.preventDefault(),t.style.borderColor="#2E6CE6",t.style.background="#EFF6FF"}),t==null||t.addEventListener("dragleave",()=>{t.style.borderColor="#D1D5DB",t.style.background="#F9FAFB"}),t==null||t.addEventListener("drop",s=>{var i,c;s.preventDefault(),t.style.borderColor="#D1D5DB",t.style.background="#F9FAFB";const n=(c=(i=s.dataTransfer)==null?void 0:i.files)==null?void 0:c[0];n&&no(n,e)}),(a=$("#imp-file-input"))==null||a.addEventListener("change",s=>{var n;(n=s.target.files)!=null&&n[0]&&no(s.target.files[0],e)}),(o=$("#btn-imp-analyze"))==null||o.addEventListener("click",()=>{var r,l,p;const s=((l=(r=$("#imp-paste-area"))==null?void 0:r.value)==null?void 0:l.trim())||"";if(!s)return showToast("Pega el texto del extracto primero","warning");const n=((p=document.querySelector('input[name="imp-format"]:checked'))==null?void 0:p.value)||"tres",i=Pn(s,n);if(!i.length)return showToast("No se detectaron movimientos. Verifica que el texto incluya fechas (dd/mm/aaaa) y el formato seleccionado sea correcto.","warning");const c=getSelectVal("imp-bank-acc");Wo(i,e,c)})}function no(e,t){const a=new FileReader;a.onload=o=>{try{const s=XLSX.read(new Uint8Array(o.target.result),{type:"array",cellDates:!0}),n=s.Sheets[s.SheetNames[0]],i=XLSX.utils.sheet_to_json(n,{header:1,defval:""});if(i.length<2)return showToast("El archivo no tiene datos suficientes","warning");const c=In(i);Sn(i,c,e.name,t)}catch(s){showToast("Error al leer el archivo: "+s.message,"error")}},a.readAsArrayBuffer(e)}const at={date:["fecha","date","dia","fec"],desc:["descripcion","descripción","concepto","detalle","movimiento","transaccion","transacción"],debit:["debito","débito","cargo","egreso","salida","retiro","debit","db"],cred:["credito","crédito","abono","ingreso","deposito","depósito","credit","cr","entrada"],ref:["referencia","ref","numero","número","doc","comprobante","nro","cheque"]};function In(e){let t=0;for(let s=0;s<Math.min(e.length,10);s++){const n=e[s].map(c=>String(c).toLowerCase());let i=0;for(const c of Object.values(at))n.some(r=>c.some(l=>r.includes(l)))&&i++;if(i>=2){t=s;break}}const a=e[t].map(s=>String(s).toLowerCase().trim()),o=s=>a.findIndex(n=>s.some(i=>n.includes(i)));return{hRow:t,date:o(at.date),desc:o(at.desc),debit:o(at.debit),cred:o(at.cred),ref:o(at.ref)}}function Sn(e,t,a,o){var l;const s=e[t.hRow],n=e.length-t.hRow-1,i=$("#imp-drop-zone");i&&(i.style.cssText="padding:10px 16px;border:1.5px solid #22C55E;border-radius:12px;background:#F0FDF4;display:flex;align-items:center;gap:10px;cursor:default",i.innerHTML=`<i class="fas fa-file-excel" style="color:#16A34A;font-size:1.3rem"></i>
      <span style="font-size:14px;font-weight:600;color:#15803D">${esc(a)}</span>
      <span style="font-size:12px;color:#6B7280">${n} filas detectadas</span>`,i.onclick=null,["dragover","dragleave","drop"].forEach(p=>i.removeEventListener(p,null)));const c=p=>[-1,...s.keys()].map(m=>`<option value="${m}" ${m===p?"selected":""}>${m<0?"— No usar —":`Col.${m+1}: ${esc(String(s[m]).slice(0,24))}`}</option>`).join(""),r=$("#imp-col-map");r.style.display="",r.innerHTML=`
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
    </button>`,(l=$("#btn-imp-preview"))==null||l.addEventListener("click",()=>{const p={date:+getSelectVal("mc-date"),desc:+getSelectVal("mc-desc"),debit:+getSelectVal("mc-debit"),cred:+getSelectVal("mc-cred"),ref:+getSelectVal("mc-ref"),valor:+getSelectVal("mc-valor")};if(p.date<0||p.desc<0)return showToast("Las columnas Fecha y Descripción son obligatorias","warning");const m=p.valor>=0;if(!m&&p.debit<0&&p.cred<0)return showToast("Selecciona al menos una columna de valor (Débito, Crédito, o Valor único)","warning");const f=[];for(let g=t.hRow+1;g<e.length;g++){const u=e[g],y=Nn(u[p.date]);if(!y)continue;let v=0,b=0;if(m){const h=Ln(u[p.valor]);h<0?v=Math.abs(h):b=h}else v=p.debit>=0?Pt(u[p.debit]):0,b=p.cred>=0?Pt(u[p.cred]):0;!v&&!b||f.push({date:y,description:String(u[p.desc]??"").trim(),debit:v,credit:b,ref:p.ref>=0?String(u[p.ref]??"").trim():""})}if(!f.length)return showToast("No se encontraron filas válidas con el mapeo seleccionado","warning");const d=getSelectVal("imp-bank-acc");Wo(f,o,d)})}function Nn(e){if(e==null||e==="")return null;if(e instanceof Date&&!isNaN(e))return e.toISOString().slice(0,10);if(typeof e=="number"){const s=new Date(Math.round((e-25569)*864e5));return isNaN(s)?null:s.toISOString().slice(0,10)}const t=String(e).trim(),a=t.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);if(a)return`${a[3]}-${a[2].padStart(2,"0")}-${a[1].padStart(2,"0")}`;const o=t.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);return o?`${o[1]}-${o[2].padStart(2,"0")}-${o[3].padStart(2,"0")}`:null}function Pt(e){if(e==null||e==="")return 0;if(typeof e=="number")return Math.abs(e);const t=String(e).replace(/\s/g,"");let a;return/\d\.\d{3},/.test(t)?a=t.replace(/\./g,"").replace(",","."):/\d,\d{3}\./.test(t)?a=t.replace(/,/g,""):a=t.replace(/[^0-9.\-]/g,""),Math.abs(parseFloat(a))||0}function Ln(e){if(e==null||e==="")return 0;if(typeof e=="number")return e;const t=String(e).trim(),a=/^[-−(]/.test(t)||/\)$/.test(t),o=t.replace(/^[-−(]/,"").replace(/\)$/,"");return a?-Pt(o):Pt(o)}function Pn(e,t="tres"){const a=[],o=/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b|\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b/,s="[-−]?\\d{1,3}(?:[.,\\u00A0\\u2009\\u202F ]\\d{3})+(?:[.,]\\d{1,2})?|[-−]?\\d+[.,]\\d{2}",n=()=>new RegExp(s,"g"),i=e.replace(/\u00A0|\u2009|\u202F/g," ").replace(/\u2212/g,"-"),c=[];for(const l of i.split(`
`)){const p=l.trim();if(!p)continue;const m=p.match(o);if(m){let f;if(m[4])f=`${m[4]}-${m[5]}-${m[6]}`;else{let[,d,g,u]=m;u.length===2&&(u="20"+u),f=`${u}-${g.padStart(2,"0")}-${d.padStart(2,"0")}`}c.push({date:f,lines:[p]})}else c.length>0&&c[c.length-1].lines.push(p)}if(!c.length)return a;let r=null;for(const l of c){const p=l.lines.join(" "),m=[...p.matchAll(n())].map(v=>{const b=v[0].replace(/\s/g,""),h=/^[-]/.test(b),_=Pt(b.replace(/^[-]/,""));return{isNeg:h,abs:_,signed:h?-_:_}}).filter(v=>v.abs>0);if(!m.length)continue;const f=p.match(o);let g=(f?p.slice(f.index+f[0].length):p).replace(new RegExp(s,"g")," ").replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ\-\/]/g," ").replace(/\s+/g," ").trim();(!g||g.length<2)&&(g="Movimiento");let u=0,y=0;if(t==="signos"){const v=m[0];v.isNeg?u=v.abs:y=v.abs}else if(t==="dos")m.length>=2&&(u=m[m.length-2].abs),y=m[m.length-1].abs;else if(m.length>=2){const v=m[m.length-1].abs,b=m[m.length-2].abs;if(!b)continue;r!==null?v-r>=-b*.01?y=b:u=b:y=b,r=v}else m.length===1&&(y=m[0].abs);!u&&!y||a.push({date:l.date,description:g,debit:u,credit:y,ref:""})}return a}function Wo(e,t,a){var n,i;We=e.map((c,r)=>({...c,_id:r,_skip:!1})),Ct=a;const o=t.find(c=>c.id===a),s=o?`${o.bank} — ${o.number}`:a;$("#modal-body").querySelector("#import-wizard").innerHTML=`
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
          ${We.map(c=>`
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
    </button>`,(n=$("#btn-imp-back"))==null||n.addEventListener("click",()=>{We=[],Ct="",zo(t)}),(i=$("#btn-imp-confirm"))==null||i.addEventListener("click",()=>Fn())}function Rr(e){var n;const t=We.find(i=>i._id===e);t&&(t._skip=!0),(n=document.getElementById(`imp-row-${e}`))==null||n.remove();const a=We.filter(i=>!i._skip).length,o=$("#imp-count-badge"),s=$("#imp-confirm-count");if(o&&(o.textContent=`${a} movimientos`),s&&(s.textContent=a),!a){const i=$("#btn-imp-confirm");i&&(i.disabled=!0,i.style.opacity="0.5")}}async function Fn(){if(!Ct)return showToast("Cuenta bancaria no definida","error");const e=We.filter(s=>!s._skip);if(!e.length)return showToast("No hay movimientos para importar","warning");const t=$("#btn-imp-confirm");t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i> Importando...');let a=0,o=0;for(const s of e)try{await pb.create("bank_movements",{bank_account_id:Ct,date:s.date,description:s.description,debit:s.debit||0,credit:s.credit||0,balance:0,ref:s.ref||"",reconciled:!1}),a++}catch{o++}closeModal(),We=[],Ct="",o?showToast(`Importados ${a} movimientos. ${o} no pudieron guardarse.`,"warning"):showToast(`${a} movimientos importados correctamente`,"success"),Ke($("#page-content"))}window.renderConciliacion=Ke;window._normText=so;window._renderColMapper=Sn;window._parseExcelDate=Nn;window._parsePdfText=Pn;window.openBankAccountForm=xn;window._autoMapColumns=In;window.openImportModal=Tn;window._handleExcelFile=no;window._parseColNum=Pt;window.buildReconSuggestions=En;window._importRows=We;window._renderImportStep1=zo;window._removeImportRow=Rr;window._COL_KEYS=at;window._renderImportPreview=Wo;window._parseSignedColNum=Ln;window._daysDiff=$n;window.openClearMovementsModal=Cn;window._doImport=Fn;window._importBankAccId=Ct;window._asDateOnly=oo;window.openBankMovementForm=An;window.toggleRecon=Dr;window._textOverlap=wn;const ze="payroll_accounting_config_v1",Te={core:`${ze}_core`,mappings:`${ze}_mappings`,employee_groups:`${ze}_employee_groups`,group_rules:`${ze}_group_rules`,employee_rules:`${ze}_employee_rules`},xa=5e3,Ba=[{key:"salary_base",label:"Salario base",default_side:"debit"},{key:"overtime",label:"Horas extra / recargos",default_side:"debit"},{key:"transport_allowance",label:"Auxilio de transporte",default_side:"debit"},{key:"incapacidades",label:"Incapacidades",default_side:"debit"},{key:"licencias",label:"Licencias",default_side:"debit"},{key:"gastos_representacion",label:"Gastos de representacion",default_side:"debit"},{key:"bonificacion",label:"Bonificacion",default_side:"debit"},{key:"aux_no_salariales",label:"Aux no salariales",default_side:"debit"},{key:"comisiones",label:"Comisiones",default_side:"debit"},{key:"dotaciones",label:"Dotaciones",default_side:"debit"},{key:"compensatorios",label:"Compensatorios",default_side:"debit"},{key:"alimentacion",label:"Alimentacion",default_side:"debit"},{key:"deduction_health",label:"Deduccion salud trabajador",default_side:"credit"},{key:"deduction_pension",label:"Deduccion pension trabajador",default_side:"credit"},{key:"solidarity_fund",label:"Fondo de solidaridad",default_side:"credit"},{key:"withholding_tax",label:"Retencion en la fuente",default_side:"credit"},{key:"deduction_other",label:"Otras deducciones trabajador",default_side:"credit"},{key:"embargo",label:"Embargo",default_side:"credit"},{key:"cxc",label:"CxC",default_side:"credit"},{key:"libranza",label:"Libranza",default_side:"credit"},{key:"prestamos",label:"Prestamos",default_side:"credit"},{key:"net_pay",label:"Neto a pagar",default_side:"credit"},{key:"employer_health",label:"Aporte salud empleador",default_side:"debit"},{key:"employer_pension",label:"Aporte pension empleador",default_side:"debit"},{key:"employer_arl",label:"ARL",default_side:"debit"},{key:"sena",label:"SENA",default_side:"debit"},{key:"icbf",label:"ICBF",default_side:"debit"},{key:"caja_comp",label:"Caja de compensacion",default_side:"debit"},{key:"cesantias",label:"Cesantias causadas",default_side:"debit"},{key:"intereses_ces",label:"Intereses cesantias",default_side:"debit"},{key:"prima",label:"Prima de servicios",default_side:"debit"},{key:"vacaciones",label:"Vacaciones causadas",default_side:"debit"}],De=Ba.reduce((e,t)=>(e[t.key]=t,e),{}),Le=["incapacidades","licencias","gastos_representacion","bonificacion","aux_no_salariales","comisiones","dotaciones","compensatorios","alimentacion"],Pe=["embargo","cxc","libranza","prestamos"],Aa={devengo:"Devengos",descuento:"Descuentos",aportes:"Aportes",provision:"Provisiones"},Dn={salary_base:{category:"devengo",allowed_sides:["debit"]},overtime:{category:"devengo",allowed_sides:["debit"]},transport_allowance:{category:"devengo",allowed_sides:["debit"]},incapacidades:{category:"devengo",allowed_sides:["debit"]},licencias:{category:"devengo",allowed_sides:["debit"]},gastos_representacion:{category:"devengo",allowed_sides:["debit"]},bonificacion:{category:"devengo",allowed_sides:["debit"]},aux_no_salariales:{category:"devengo",allowed_sides:["debit"]},comisiones:{category:"devengo",allowed_sides:["debit"]},dotaciones:{category:"devengo",allowed_sides:["debit"]},compensatorios:{category:"devengo",allowed_sides:["debit"]},alimentacion:{category:"devengo",allowed_sides:["debit"]},net_pay:{category:"devengo",allowed_sides:["credit"]},deduction_health:{category:"descuento",allowed_sides:["credit"]},deduction_pension:{category:"descuento",allowed_sides:["credit"]},solidarity_fund:{category:"descuento",allowed_sides:["credit"]},withholding_tax:{category:"descuento",allowed_sides:["credit"]},deduction_other:{category:"descuento",allowed_sides:["credit"]},embargo:{category:"descuento",allowed_sides:["credit"]},cxc:{category:"descuento",allowed_sides:["credit"]},libranza:{category:"descuento",allowed_sides:["credit"]},prestamos:{category:"descuento",allowed_sides:["credit"]},employer_health:{category:"aportes",allowed_sides:["debit","credit"]},employer_pension:{category:"aportes",allowed_sides:["debit","credit"]},employer_arl:{category:"aportes",allowed_sides:["debit","credit"]},sena:{category:"aportes",allowed_sides:["debit","credit"]},icbf:{category:"aportes",allowed_sides:["debit","credit"]},caja_comp:{category:"aportes",allowed_sides:["debit","credit"]},cesantias:{category:"provision",allowed_sides:["debit","credit"]},intereses_ces:{category:"provision",allowed_sides:["debit","credit"]},prima:{category:"provision",allowed_sides:["debit","credit"]},vacaciones:{category:"provision",allowed_sides:["debit","credit"]}};function Gt(e){var t;return Dn[e]||{category:"devengo",allowed_sides:[(((t=De[e])==null?void 0:t.default_side)||"debit")==="credit"?"credit":"debit"]}}function Rn(e){return Aa[e]||e||"Sin categoría"}function On(e){return Ba.filter(t=>Gt(t.key).category===e)}const qt=[{key:"hed",label:"Extra Diurna (HED)",factor:1.25},{key:"hen",label:"Extra Nocturna (HEN)",factor:1.75},{key:"rno",label:"Recargo Nocturno Ordinario",factor:.35},{key:"heddf",label:"Hora Extra Diurna Dominical/Festiva (HEDDF)",factor:2},{key:"hendf",label:"Hora Extra Nocturna Dominical/Festiva (HENDF)",factor:2.5},{key:"rdfd",label:"Recargo Dominical/Festivo Diurno",factor:.75}],Fe={1:.00522,2:.01044,3:.02436,4:.0435,5:.0696},se=e=>Math.round((Number(e)||0)*100)/100;function $a(e){return`${(e==null?void 0:e.doc_number)||""} - ${(e==null?void 0:e.name)||""}`.trim()}function wa(e,t){return t&&(Array.isArray(e)?e:[]).find(a=>a.id===t)||null}function nt({terceros:e,hiddenId:t,inputId:a,resultsId:o,onSelected:s}){const n=document.getElementById(t),i=document.getElementById(a),c=document.getElementById(o);if(!n||!i||!c)return;const r=(p="")=>{const m=Array.isArray(e)?e:[],f=String(p||"").toLowerCase().trim(),d=f?f.split(/\s+/).filter(Boolean):[],g=(d.length?m.filter(u=>{const y=`${u.doc_number||""} ${u.name||""}`.toLowerCase();return d.every(v=>y.includes(v))}):m).slice(0,30);c.innerHTML=`
      <button type="button" data-third-id="" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer;border-bottom:1px solid #F1F5F9">Sin tercero</button>
      ${g.map(u=>`
        <button type="button" data-third-id="${esc(u.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
          <div style="font-weight:600">${esc(u.doc_number||"SIN DOC")}</div>
          <div style="font-size:12px;color:#6B7280">${esc(u.name||"")}</div>
        </button>
      `).join("")}
    `};(()=>{const p=wa(e,n.value);i.value=p?$a(p):""})(),i.onfocus=()=>{r(i.value),c.style.display="block"},i.oninput=()=>{n.value="",typeof s=="function"&&s(""),r(i.value),c.style.display="block"},i.onblur=()=>setTimeout(()=>{c.style.display="none"},120),c.onmousedown=p=>p.preventDefault(),c.onclick=p=>{const m=p.target.closest("[data-third-id]");if(!m)return;const f=m.getAttribute("data-third-id")||"";n.value=f;const d=wa(e,f);i.value=d?$a(d):"",c.style.display="none",typeof s=="function"&&s(f)}}function Xt(){return{balancing_account_id:"",mappings:[],employee_groups:[],group_rules:[],company_rules:{smmlv:1423500,solidarity_threshold_smmlv:3,solidarity_rate:.01,exempt_sena_icbf:!1,weekly_hours:44,tercero_sena_id:"",tercero_icbf_id:""},employee_rules:[]}}function Ft(e){const t=e&&typeof e=="object"?e:{},a=Array.isArray(t.mappings)?t.mappings:[],o=Array.isArray(t.employee_groups)?t.employee_groups:[],s=Array.isArray(t.group_rules)?t.group_rules:[],n=t.company_rules&&typeof t.company_rules=="object"?t.company_rules:{},i=Array.isArray(t.employee_rules)?t.employee_rules:[];return{balancing_account_id:t.balancing_account_id||"",mappings:a.map((c,r)=>({id:c.id||`m-${Date.now()}-${r}`,concept:c.concept||"",side:c.side==="credit"?"credit":"debit",account_id:c.account_id||"",employee_id:c.employee_id||"",group_id:c.group_id||"",active:c.active!==!1})).filter(c=>c.concept&&c.account_id),employee_groups:o.map((c,r)=>({id:c.id||`g-${Date.now()}-${r}`,name:(c.name||"").trim(),active:c.active!==!1})).filter(c=>c.name),group_rules:s.map(c=>({group_id:c.group_id||"",basic_salary:Number(c.basic_salary)>=0?Number(c.basic_salary):0,arl_risk_level:Math.max(1,Math.min(5,parseInt(c.arl_risk_level||1,10)||1)),is_pensioner:!!c.is_pensioner,apply_solidarity_fund:!!c.apply_solidarity_fund,apply_withholding_tax:!!c.apply_withholding_tax,withholding_rate:Number(c.withholding_rate)>=0?Number(c.withholding_rate):0})).filter(c=>c.group_id),company_rules:{smmlv:Number(n.smmlv)>0?Number(n.smmlv):1423500,solidarity_threshold_smmlv:Number(n.solidarity_threshold_smmlv)>0?Number(n.solidarity_threshold_smmlv):3,solidarity_rate:Number(n.solidarity_rate)>=0?Number(n.solidarity_rate):.01,exempt_sena_icbf:!!n.exempt_sena_icbf,weekly_hours:[42,44,46,47,48].includes(Number(n.weekly_hours))?Number(n.weekly_hours):44,tercero_sena_id:n.tercero_sena_id||"",tercero_icbf_id:n.tercero_icbf_id||""},employee_rules:i.map(c=>({employee_id:c.employee_id||"",group_id:c.group_id||"",basic_salary:c.basic_salary===null||c.basic_salary===void 0||c.basic_salary===""?null:Number(c.basic_salary)>=0?Number(c.basic_salary):null,arl_risk_level:c.arl_risk_level===null||c.arl_risk_level===void 0||c.arl_risk_level===""?null:Math.max(1,Math.min(5,parseInt(c.arl_risk_level,10)||1)),is_pensioner:typeof c.is_pensioner=="boolean"?c.is_pensioner:null,apply_solidarity_fund:typeof c.apply_solidarity_fund=="boolean"?c.apply_solidarity_fund:null,apply_withholding_tax:typeof c.apply_withholding_tax=="boolean"?c.apply_withholding_tax:null,withholding_rate:c.withholding_rate===null||c.withholding_rate===void 0||c.withholding_rate===""?null:Number(c.withholding_rate)>=0?Number(c.withholding_rate):null,tercero_salud_id:c.tercero_salud_id||"",tercero_pension_id:c.tercero_pension_id||"",tercero_arl_id:c.tercero_arl_id||"",tercero_caja_id:c.tercero_caja_id||""})).filter(c=>c.employee_id)}}function kn(e){const t=Ft(e);return{balancing_account_id:t.balancing_account_id||"",mappings:(t.mappings||[]).map(a=>({id:a.id||"",concept:a.concept||"",side:a.side==="credit"?"credit":"debit",account_id:a.account_id||"",employee_id:a.employee_id||"",group_id:a.group_id||"",active:a.active!==!1})),employee_groups:(t.employee_groups||[]).map(a=>({id:a.id||"",name:(a.name||"").trim(),active:a.active!==!1})),group_rules:t.group_rules||[],company_rules:t.company_rules||{},employee_rules:(t.employee_rules||[]).map(a=>{const o={employee_id:a.employee_id||""};return a.group_id&&(o.group_id=a.group_id),a.basic_salary!==null&&a.basic_salary!==void 0&&(o.basic_salary=Number(a.basic_salary||0)),a.arl_risk_level!==null&&a.arl_risk_level!==void 0&&(o.arl_risk_level=Number(a.arl_risk_level||1)),typeof a.is_pensioner=="boolean"&&(o.is_pensioner=a.is_pensioner),typeof a.apply_solidarity_fund=="boolean"&&(o.apply_solidarity_fund=a.apply_solidarity_fund),typeof a.apply_withholding_tax=="boolean"&&(o.apply_withholding_tax=a.apply_withholding_tax),a.withholding_rate!==null&&a.withholding_rate!==void 0&&(o.withholding_rate=Number(a.withholding_rate||0)),a.tercero_salud_id&&(o.tercero_salud_id=a.tercero_salud_id),a.tercero_pension_id&&(o.tercero_pension_id=a.tercero_pension_id),a.tercero_arl_id&&(o.tercero_arl_id=a.tercero_arl_id),a.tercero_caja_id&&(o.tercero_caja_id=a.tercero_caja_id),o})}}async function ia(){var i;const e=await pb.list("settings",{perPage:200,page:1,filter:`key~"${pb.escapeFilterValue(ze+"_")}"`}),t={};if(((e==null?void 0:e.items)||[]).forEach(c=>{t[c.key]=c}),Object.keys(Te).some(c=>!!t[Te[c]])){const c=await yt(Te.core,{}),r={balancing_account_id:(c==null?void 0:c.balancing_account_id)||"",company_rules:c!=null&&c.company_rules&&typeof c.company_rules=="object"?c.company_rules:{},mappings:await yt(Te.mappings,[]),employee_groups:await yt(Te.employee_groups,[]),group_rules:await yt(Te.group_rules,[]),employee_rules:await yt(Te.employee_rules,[])};return{row:t[Te.core]||null,config:Ft(r)}}const o=pb.escapeFilterValue(ze),s=await pb.list("settings",{perPage:1,page:1,filter:`key="${o}"`}),n=((i=s==null?void 0:s.items)==null?void 0:i[0])||null;if(!n)return{row:null,config:Xt()};try{return{row:n,config:Ft(JSON.parse(n.value||"{}"))}}catch{return{row:n,config:Xt()}}}function Bn(e,t=xa){const a=String(e||"");if(!a)return[""];const o=[];for(let s=0;s<a.length;s+=t)o.push(a.slice(s,s+t));return o}function io(e,t){return`${e}_part_${String(t+1).padStart(3,"0")}`}async function Yo(e){const t=pb.escapeFilterValue(e),a=await pb.list("settings",{perPage:200,page:1,filter:`key~"${t}"`});return(Array.isArray(a==null?void 0:a.items)?a.items:[]).filter(s=>String(s.key||"").startsWith(e))}async function co(e){var s;const t=pb.escapeFilterValue(e),a=await pb.list("settings",{perPage:1,page:1,filter:`key="${t}"`}),o=((s=a==null?void 0:a.items)==null?void 0:s[0])||null;o!=null&&o.id&&await pb.delete("settings",o.id)}async function yt(e,t){var c;const a=`${e}_part_`,o=await Yo(a);if(o.length){const l=o.slice().sort((p,m)=>String(p.key||"").localeCompare(String(m.key||""))).map(p=>String(p.value||"")).join("");try{return JSON.parse(l||"null")??t}catch{return t}}const s=pb.escapeFilterValue(e),n=await pb.list("settings",{perPage:1,page:1,filter:`key="${s}"`}),i=((c=n==null?void 0:n.items)==null?void 0:c[0])||null;if(!(i!=null&&i.value))return t;try{return JSON.parse(i.value)}catch{return t}}async function ro(e,t){var n;const a=pb.escapeFilterValue(e),o=await pb.list("settings",{perPage:1,page:1,filter:`key="${a}"`}),s=((n=o==null?void 0:o.items)==null?void 0:n[0])||null;if(s!=null&&s.id)try{return await pb.update("settings",s.id,{value:t})}catch(i){if((i==null?void 0:i.status)!==400)throw i;return await pb.delete("settings",s.id).catch(()=>{}),pb.create("settings",{key:e,value:t})}return pb.create("settings",{key:e,value:t})}async function Mn(e,t){const a=JSON.stringify(t),o=`${e}_part_`,s=await Yo(o);if(a.length<=xa){await ro(e,a);for(const i of s)await pb.delete("settings",i.id).catch(()=>{});return}const n=Bn(a,xa);for(let i=0;i<n.length;i++)await ro(io(e,i),n[i]);for(let i=n.length;i<s.length;i++){const c=io(e,i);await co(c).catch(()=>{})}await co(e).catch(()=>{})}async function Jo(e,t=""){const a=kn(e),o={balancing_account_id:a.balancing_account_id||"",company_rules:a.company_rules||{}},s=[[Te.core,o],[Te.mappings,a.mappings||[]],[Te.employee_groups,a.employee_groups||[]],[Te.group_rules,a.group_rules||[]],[Te.employee_rules,a.employee_rules||[]]];for(const[n,i]of s)try{await Mn(n,i)}catch(c){const r=c!=null&&c.message?`: ${c.message}`:"";throw new Error(`Error guardando configuración de nómina en ${n}${r}`)}}function Ot(e){if(!(e!=null&&e.notes))return{};try{const t=JSON.parse(e.notes);if(t&&typeof t=="object"&&t.payroll_meta&&typeof t.payroll_meta=="object")return t.payroll_meta}catch{}return{}}function He(e,t){const o=(Array.isArray(e==null?void 0:e.employee_rules)?e.employee_rules:[]).find(n=>n.employee_id===t),s={employee_id:t||"",group_id:(o==null?void 0:o.group_id)||"",basic_salary:0,arl_risk_level:1,is_pensioner:!1,apply_solidarity_fund:!1,apply_withholding_tax:!1,withholding_rate:0,tercero_salud_id:"",tercero_pension_id:"",tercero_arl_id:"",tercero_caja_id:""};return o&&(o.group_id&&(s.group_id=o.group_id),o.basic_salary!==null&&o.basic_salary!==void 0&&(s.basic_salary=Number(o.basic_salary||0)),o.arl_risk_level!==null&&o.arl_risk_level!==void 0&&(s.arl_risk_level=Math.max(1,Math.min(5,parseInt(o.arl_risk_level||1,10)||1))),typeof o.is_pensioner=="boolean"&&(s.is_pensioner=o.is_pensioner),typeof o.apply_solidarity_fund=="boolean"&&(s.apply_solidarity_fund=o.apply_solidarity_fund),typeof o.apply_withholding_tax=="boolean"&&(s.apply_withholding_tax=o.apply_withholding_tax),o.withholding_rate!==null&&o.withholding_rate!==void 0&&(s.withholding_rate=Number(o.withholding_rate||0)),o.tercero_salud_id&&(s.tercero_salud_id=o.tercero_salud_id),o.tercero_pension_id&&(s.tercero_pension_id=o.tercero_pension_id),o.tercero_arl_id&&(s.tercero_arl_id=o.tercero_arl_id),o.tercero_caja_id&&(s.tercero_caja_id=o.tercero_caja_id)),s}function lo(e,t){return(Array.isArray(e==null?void 0:e.employee_rules)?e.employee_rules:[]).find(o=>o.employee_id===t)||null}function ea(e){return!!e&&Number(e.basic_salary||0)>0}function Dt(e){const t=Ot(e),a=se(t.solidarity_fund||0),o=se(t.withholding_tax||0);return{solidarity:a,withholding:o,total:se(a+o)}}function Ko(e){const t=Ot(e),a=t&&typeof t.concept_amounts=="object"&&t.concept_amounts?t.concept_amounts:{},o={};return[...Le,...Pe].forEach(s=>{o[s]=se(Number(a[s]||0))}),o}function Ma(e){const t=Ot(e),a=t&&typeof t.overtime_breakdown=="object"&&t.overtime_breakdown?t.overtime_breakdown:{},o=qt.map(i=>{const c=a[i.key]&&typeof a[i.key]=="object"?a[i.key]:{};return{key:i.key,label:i.label,factor:i.factor,hours:se(Number(c.hours||0)),amount:se(Number(c.amount||0))}}),s=se(o.reduce((i,c)=>i+(c.amount||0),0)),n=o.some(i=>i.hours>0||i.amount>0);return{hourly_rate:se(Number(a.hourly_rate||0)),breakdown:o,total_amount:n?s:se(Number((e==null?void 0:e.overtime)||0)),hasBreakdown:n}}function ca(e){const t=Ko(e),a=se(Le.reduce((s,n)=>s+(t[n]||0),0)),o=se(Pe.reduce((s,n)=>s+(t[n]||0),0));return{conceptAmounts:t,earnings:a,deductions:o}}function Qo(e,t){return!e||!t?0:t==="solidarity_fund"?Dt(e).solidarity:t==="withholding_tax"?Dt(e).withholding:t==="overtime"?Ma(e).total_amount:Le.includes(t)||Pe.includes(t)?Ko(e)[t]||0:se(e[t]||0)}function lt(e){const t=ca(e);return se(((e==null?void 0:e.salary_base)||0)+((e==null?void 0:e.transport_allowance)||0)+Qo(e,"overtime")+t.earnings)}function Rt(e){const t=Dt(e),a=ca(e);return se(((e==null?void 0:e.deduction_health)||0)+((e==null?void 0:e.deduction_pension)||0)+((e==null?void 0:e.deduction_other)||0)+t.total+a.deductions)}function Or(e,t,a,o=""){const s=(e||[]).filter(c=>c.active!==!1),n=s.find(c=>c.concept===t&&c.employee_id===a);if(n)return n;const i=o?s.find(c=>c.concept===t&&c.group_id===o&&!c.employee_id):null;return i||s.find(c=>c.concept===t&&!c.employee_id&&!c.group_id)||null}function Un(e,t,a,o=""){const s=(e||[]).filter(i=>i.active!==!1&&i.concept===t),n=[];for(const i of["debit","credit"]){const c=s.filter(m=>m.side===i);if(!c.length)continue;const r=c.find(m=>m.employee_id===a);if(r){n.push(r);continue}const l=o?c.find(m=>m.group_id===o&&!m.employee_id):null;if(l){n.push(l);continue}const p=c.find(m=>!m.employee_id&&!m.group_id);p&&n.push(p)}return n}function Vn(e,t,a,o){const s=t.employee_id||"";switch(e){case"net_pay":case"cesantias":case"intereses_ces":case"prima":case"vacaciones":return s;case"deduction_health":case"employer_health":return a.tercero_salud_id||"";case"deduction_pension":case"employer_pension":return a.tercero_pension_id||"";case"employer_arl":return a.tercero_arl_id||"";case"caja_comp":return a.tercero_caja_id||"";case"sena":return o.tercero_sena_id||"";case"icbf":return o.tercero_icbf_id||"";default:return s}}function jn(e,t,a){var s,n;const o=((n=(s=a.expand)==null?void 0:s.employee_id)==null?void 0:n.doc_number)||a.employee_id||"";return e==="net_pay"?`NOM-${t}-EMP-${o}`:""}async function Hn(e,t,a){var m,f;const o=[],s={},n=a.company_rules||{},i=(e.date_from||e.date_to||"").slice(0,7).replace("-","");for(const d of t){const g=He(a,d.employee_id);for(const u of Ba){const y=Qo(d,u.key);if(y<=0)continue;const v=Un(a.mappings,u.key,d.employee_id,g.group_id||"");if(!v.length){o.push({employee:((f=(m=d.expand)==null?void 0:m.employee_id)==null?void 0:f.name)||"Empleado",concept:u.label});continue}const b=Vn(u.key,d,g,n),h=jn(u.key,i,d);for(const _ of v){const A=_.side==="credit"?"credit":"debit",C=`${_.account_id}__${A}__${b}`;s[C]||(s[C]={account_id:_.account_id,third_party_id:b||void 0,cross_doc_ref:h||void 0,debit:0,credit:0,description:`Nómina ${e.name} - ${u.label}`}),A==="debit"?s[C].debit=se(s[C].debit+y):s[C].credit=se(s[C].credit+y)}}}if(o.length){const d=o.slice(0,3).map(g=>`${g.employee}: ${g.concept}`).join(" | ");throw new Error(`Faltan mapeos contables para algunos conceptos de nómina. ${d}`)}const c=Object.values(s).filter(d=>d.debit>0||d.credit>0),r=se(c.reduce((d,g)=>d+(g.debit||0),0)),l=se(c.reduce((d,g)=>d+(g.credit||0),0)),p=se(r-l);if(Math.abs(p)>.01){if(!a.balancing_account_id)throw new Error(`La nómina no está cuadrada (D ${fmt(r)} / C ${fmt(l)}). Configura una cuenta de ajuste en el engranaje de Nómina.`);c.push({account_id:a.balancing_account_id,debit:p<0?Math.abs(p):0,credit:p>0?Math.abs(p):0,description:`Ajuste de cuadre nómina ${e.name}`})}return c}async function Gn(e){var d;const t=await pb.get("payroll_periods",e);if(t.tx_id)return t.tx_id;const a=await pb.listAll("payroll_lines",{filter:`period_id="${pb.escapeFilterValue(e)}"`,expand:"employee_id"});if(!a.length)throw new Error("El período no tiene liquidaciones para contabilizar.");const o=await API.getTxTypes(),s=o.find(g=>g.code==="NM")||o.find(g=>(g.name||"").toLowerCase().includes("nomina"));if(!s)throw new Error("No existe tipo de transacción activo para Nómina (código NM).");const{config:n}=await ia();if(!n.mappings.length)throw new Error("Primero configura los mapeos contables de nómina (botón de engranaje).");const i=await Hn(t,a,n);if(!i.length)throw new Error("No hay líneas contables para generar en este período.");const c=[...new Set(i.map(g=>g.account_id).filter(Boolean))],r=await pb.listAll("accounts",{filter:c.map(g=>`id="${pb.escapeFilterValue(g)}"`).join("||")}).catch(()=>[]),l={};r.forEach(g=>{l[g.id]=g});const p=[];if(i.forEach(g=>{const u=l[g.account_id];u&&(u.requires_third_party&&!g.third_party_id&&p.push(`Cuenta ${u.code} - ${u.name}: requiere tercero pero no está asignado.`),u.maneja_cruce&&!g.cross_doc_ref&&p.push(`Cuenta ${u.code} - ${u.name}: requiere cruce pero no tiene referencia.`))}),p.length)throw new Error(`Errores de validación contable:
${p.slice(0,5).join(`
`)}`);const m=((d=a.find(g=>!!g.employee_id))==null?void 0:d.employee_id)||"";return(await API.createTransaction({tx_type_id:s.id,date:t.date_to||todayStr(),description:`Nómina ${t.name}`,third_party_id:m||void 0},i)).id}async function qn(e=[]){var t,a,o,s,n,i,c,r;try{const[{row:l,config:p},m,f]=await Promise.all([ia(),pb.listAll("accounts",{filter:"active=true",sort:"code"}),pb.listAll("third_parties",{filter:"active=true",sort:"name"})]);if(!m.length)return showToast("No hay cuentas activas para mapear.","warning");const d={rowId:(l==null?void 0:l.id)||"",config:Ft(p)},g=`<option value="">Selecciona cuenta...</option>${m.map(N=>`<option value="${esc(N.id)}">${esc(N.code)} - ${esc(N.name)}</option>`).join("")}`,u=`<option value="">Selecciona categoría...</option>${Object.keys(Aa).map(N=>`<option value="${esc(N)}">${esc(Aa[N])}</option>`).join("")}`,y=()=>`<option value="">Selecciona grupo...</option>${(d.config.employee_groups||[]).map(N=>`<option value="${esc(N.id)}">${esc(N.name)}</option>`).join("")}`;openModal("Configuración Contable de Nómina",`
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
            <select id="nom-balancing-account" class="form-input">${g}</select>
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
            <select id="nom-map-account-debit" class="form-input">${g}</select>
            <select id="nom-map-account-credit" class="form-input">${g}</select>
            <button class="btn btn-primary" id="btn-add-map"><i class="fas fa-plus"></i> Agregar</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table text-sm">
            <thead><tr><th>Grupo</th><th>Categoría</th><th>Concepto</th><th>Cuenta Débito</th><th>Cuenta Crédito</th><th></th></tr></thead>
            <tbody id="nom-map-body"></tbody>
          </table>
        </div>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" id="btn-save-nom-config">Guardar Configuración</button>',!0);const v={};m.forEach(N=>{v[N.id]=N});const b=()=>{const N={};return(d.config.employee_groups||[]).forEach(T=>{N[T.id]=T}),N};$("#nom-balancing-account")&&($("#nom-balancing-account").value=d.config.balancing_account_id||""),nt({terceros:f,hiddenId:"nom-tercero-sena",inputId:"nom-tercero-sena-search",resultsId:"nom-tercero-sena-results"}),nt({terceros:f,hiddenId:"nom-tercero-icbf",inputId:"nom-tercero-icbf-search",resultsId:"nom-tercero-icbf-results"});const h=()=>{const N=$("#nom-map-group"),T=N?N.value:"";if(N){const S=(d.config.employee_groups||[]).map(w=>`<option value="${esc(w.id)}">${esc(w.name)}</option>`).join("");N.innerHTML=`<option value="">Selecciona grupo...</option>${S}`,T&&(d.config.employee_groups||[]).some(w=>w.id===T)&&(N.value=T)}},_=()=>{const N=getSelectVal("nom-map-category"),T=$("#nom-map-concept");if(!T)return;const S=N?On(N).map(w=>`<option value="${esc(w.key)}">${esc(w.label)}</option>`).join(""):"";T.innerHTML=`<option value="">Selecciona concepto...</option>${S}`},A=()=>{const N=getSelectVal("nom-map-concept"),T=$("#nom-map-account-debit"),S=$("#nom-map-account-credit");if(!N){T&&(T.disabled=!0,T.value=""),S&&(S.disabled=!0,S.value="");return}const w=Gt(N),E=Array.isArray(w.allowed_sides)?w.allowed_sides:["debit"];if(T){const L=E.includes("debit");T.disabled=!L,L||(T.value="")}if(S){const L=E.includes("credit");S.disabled=!L,L||(S.value="")}},C=()=>{const N=$("#nom-groups-body");if(!N)return;const T=d.config.employee_groups||[];N.innerHTML=T.length?T.map(S=>`<tr><td>${esc(S.name)}</td><td class="text-right"><button class="btn btn-outline btn-sm btn-del-group" data-id="${esc(S.id)}"><i class="fas fa-trash"></i></button></td></tr>`).join(""):'<tr><td colspan="2" class="text-center py-6" style="color:#9CA3AF">Sin grupos definidos.</td></tr>',h()},I=()=>{const N=$("#nom-map-body");if(!N)return;const T=b(),S={};(d.config.mappings||[]).forEach(E=>{if(E.employee_id)return;const L=E.group_id||"",R=`${L}__${E.concept}`;S[R]||(S[R]={group_id:L,concept:E.concept,debit_account_id:"",credit_account_id:""}),E.side==="credit"?S[R].credit_account_id=E.account_id||"":S[R].debit_account_id=E.account_id||""});const w=Object.values(S).filter(E=>{const L=getSelectVal("nom-map-group")||"";return L?(E.group_id||"")===L:!0}).sort((E,L)=>{var M,k,j,Y;const R=((M=T[E.group_id])==null?void 0:M.name)||"",B=((k=T[L.group_id])==null?void 0:k.name)||"";return R!==B?R.localeCompare(B):(((j=De[E.concept])==null?void 0:j.label)||E.concept).localeCompare(((Y=De[L.concept])==null?void 0:Y.label)||L.concept)});N.innerHTML=w.length?w.map(E=>{var j,Y;const L=E.group_id?((j=T[E.group_id])==null?void 0:j.name)||"Grupo no encontrado":"Sin grupo",R=((Y=De[E.concept])==null?void 0:Y.label)||E.concept,B=Rn(Gt(E.concept).category),M=v[E.debit_account_id]?`${v[E.debit_account_id].code} - ${v[E.debit_account_id].name}`:"—",k=v[E.credit_account_id]?`${v[E.credit_account_id].code} - ${v[E.credit_account_id].name}`:"—";return`<tr>
            <td>${esc(L)}</td>
            <td>${esc(B)}</td>
            <td>${esc(R)}</td>
            <td>${esc(M)}</td>
            <td>${esc(k)}</td>
            <td class="text-right"><button class="btn btn-outline btn-sm btn-del-map" data-group="${esc(E.group_id||"")}" data-concept="${esc(E.concept)}"><i class="fas fa-trash"></i></button></td>
          </tr>`}).join(""):'<tr><td colspan="6" class="text-center py-6" style="color:#9CA3AF">Sin mapeos configurados para el grupo seleccionado.</td></tr>'};C(),I(),(t=$("#btn-add-group"))==null||t.addEventListener("click",()=>{const N=(getInputVal("nom-group-name")||"").trim();if(!N)return showToast("Ingresa un nombre para el grupo.","warning");if((d.config.employee_groups||[]).some(S=>(S.name||"").toLowerCase()===N.toLowerCase()))return showToast("Ya existe un grupo con ese nombre.","info");d.config.employee_groups.push({id:`g-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:N,active:!0}),setInputVal("nom-group-name",""),C(),I()}),(a=$("#nom-groups-body"))==null||a.addEventListener("click",N=>{var w,E;const T=(E=(w=N.target)==null?void 0:w.closest)==null?void 0:E.call(w,".btn-del-group");if(!T)return;const S=T.getAttribute("data-id")||"";d.config.employee_groups=(d.config.employee_groups||[]).filter(L=>L.id!==S),d.config.mappings=(d.config.mappings||[]).filter(L=>L.group_id!==S),d.config.employee_rules=(d.config.employee_rules||[]).map(L=>L.group_id===S?{...L,group_id:""}:L),C(),I()}),(o=$("#btn-add-map"))==null||o.addEventListener("click",()=>{const N=getSelectVal("nom-map-group"),T=getSelectVal("nom-map-category"),S=getSelectVal("nom-map-concept"),w=getSelectVal("nom-map-account-debit"),E=getSelectVal("nom-map-account-credit");if(!N)return showToast("Selecciona un grupo para el mapeo contable.","warning");if(!T)return showToast("Selecciona una categoría.","warning");if(!S)return showToast("Selecciona un concepto.","warning");const L=Gt(S),R=Array.isArray(L.allowed_sides)?L.allowed_sides:["debit"];if(L.category!==T)return showToast("El concepto no pertenece a la categoría seleccionada.","warning");if(R.includes("debit")&&!w)return showToast("Este concepto requiere cuenta débito.","warning");if(R.includes("credit")&&!E)return showToast("Este concepto requiere cuenta crédito.","warning");const B=(M,k)=>{const j=(d.config.mappings||[]).find(Y=>Y.concept===S&&(Y.group_id||"")===(N||"")&&!Y.employee_id&&Y.side===M);if(j){j.account_id=k,j.active=!0;return}d.config.mappings.push({id:`m-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,employee_id:"",group_id:N||"",concept:S,side:M,account_id:k,active:!0})};d.config.mappings=(d.config.mappings||[]).filter(M=>M.employee_id||M.concept!==S||(M.group_id||"")!==(N||"")?!0:R.includes(M.side==="credit"?"credit":"debit")),R.includes("debit")&&B("debit",w),R.includes("credit")&&B("credit",E),I(),showToast("Mapeo actualizado","success")}),(s=$("#nom-map-group"))==null||s.addEventListener("change",()=>{I()}),(n=$("#nom-map-category"))==null||n.addEventListener("change",()=>{_(),A()}),(i=$("#nom-map-concept"))==null||i.addEventListener("change",A),h(),_(),A(),(c=$("#nom-map-body"))==null||c.addEventListener("click",N=>{var E,L;const T=(L=(E=N.target)==null?void 0:E.closest)==null?void 0:L.call(E,".btn-del-map");if(!T)return;const S=T.getAttribute("data-concept")||"",w=T.getAttribute("data-group")||"";d.config.mappings=(d.config.mappings||[]).filter(R=>R.employee_id||R.concept!==S?!0:(R.group_id||"")!==w),I()}),(r=$("#btn-save-nom-config"))==null||r.addEventListener("click",async()=>{var N;try{d.config.balancing_account_id=getSelectVal("nom-balancing-account")||"",d.config.company_rules={smmlv:Math.max(1,parseNum(getInputVal("nom-smmlv"))||1423500),solidarity_threshold_smmlv:Math.max(0,parseNum(getInputVal("nom-sol-threshold"))||3),solidarity_rate:Math.max(0,(parseNum(getInputVal("nom-sol-rate"))||1)/100),exempt_sena_icbf:!!((N=$("#nom-exempt-sena-icbf"))!=null&&N.checked),weekly_hours:[42,44,46,47,48].includes(Number(getInputVal("nom-weekly-hours")))?Number(getInputVal("nom-weekly-hours")):44,tercero_sena_id:getSelectVal("nom-tercero-sena")||"",tercero_icbf_id:getSelectVal("nom-tercero-icbf")||""},await Jo(d.config,d.rowId),closeModal(),showToast("Configuración de nómina guardada","success")}catch(T){showToast(T.message||"No se pudo guardar la configuración","error")}})}catch(l){showToast(l.message||"No se pudo abrir la configuración de nómina","error")}}async function zn(e=[]){var t,a,o,s,n;try{const[{row:i,config:c},r]=await Promise.all([ia(),pb.listAll("third_parties",{filter:"active=true",sort:"name"})]),l={rowId:(i==null?void 0:i.id)||"",config:Ft(c),editingEmployeeId:""},p=`<option value="">Selecciona empleado...</option>${e.map(b=>`<option value="${esc(b.id)}">${esc(b.doc_number||"")} - ${esc(b.name)}</option>`).join("")}`,m=`<option value="">Sin grupo</option>${(l.config.employee_groups||[]).map(b=>`<option value="${esc(b.id)}">${esc(b.name)}</option>`).join("")}`,f={};(l.config.employee_groups||[]).forEach(b=>{f[b.id]=b.name});const d=b=>`Nivel ${b} (${se((Fe[b]||Fe[1])*100)}%)`;openModal("Parámetros por Empleado — Nómina",`
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
              <select id="nom-emp-rule-group" class="form-input">${m}</select>
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
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" id="btn-save-nom-employee-rules">Guardar Cambios</button>',!0);const g=()=>{l.editingEmployeeId="",setInputVal("nom-emp-rule-employee",""),setInputVal("nom-emp-rule-group",""),setInputVal("nom-emp-rule-salary","0"),setInputVal("nom-emp-rule-arl","1"),$("#nom-emp-rule-pensioner")&&($("#nom-emp-rule-pensioner").checked=!1),$("#nom-emp-rule-solidarity")&&($("#nom-emp-rule-solidarity").checked=!1),$("#nom-emp-rule-withholding")&&($("#nom-emp-rule-withholding").checked=!1),setInputVal("nom-emp-rule-withholding-rate","0"),setInputVal("nom-emp-rule-tercero-salud",""),setInputVal("nom-emp-rule-tercero-pension",""),setInputVal("nom-emp-rule-tercero-arl",""),setInputVal("nom-emp-rule-tercero-caja",""),u()},u=()=>{[["nom-emp-rule-tercero-salud","nom-emp-rule-tercero-salud-search"],["nom-emp-rule-tercero-pension","nom-emp-rule-tercero-pension-search"],["nom-emp-rule-tercero-arl","nom-emp-rule-tercero-arl-search"],["nom-emp-rule-tercero-caja","nom-emp-rule-tercero-caja-search"]].forEach(([h,_])=>{const A=document.getElementById(h),C=document.getElementById(_);if(!A||!C)return;const I=wa(r,A.value||"");C.value=I?$a(I):""})},y=b=>{const h=lo(l.config,b)||{},_=He(l.config,b);l.editingEmployeeId=b,setInputVal("nom-emp-rule-employee",b),setInputVal("nom-emp-rule-group",h.group_id||_.group_id||""),setInputVal("nom-emp-rule-salary",String(se((h.basic_salary??_.basic_salary)||0))),setInputVal("nom-emp-rule-arl",String(h.arl_risk_level??_.arl_risk_level??1)),$("#nom-emp-rule-pensioner")&&($("#nom-emp-rule-pensioner").checked=!!(h.is_pensioner??_.is_pensioner)),$("#nom-emp-rule-solidarity")&&($("#nom-emp-rule-solidarity").checked=!!(h.apply_solidarity_fund??_.apply_solidarity_fund)),$("#nom-emp-rule-withholding")&&($("#nom-emp-rule-withholding").checked=!!(h.apply_withholding_tax??_.apply_withholding_tax)),setInputVal("nom-emp-rule-withholding-rate",String(se((h.withholding_rate??_.withholding_rate??0)*100))),$("#nom-emp-rule-tercero-salud")&&($("#nom-emp-rule-tercero-salud").value=h.tercero_salud_id||""),$("#nom-emp-rule-tercero-pension")&&($("#nom-emp-rule-tercero-pension").value=h.tercero_pension_id||""),$("#nom-emp-rule-tercero-arl")&&($("#nom-emp-rule-tercero-arl").value=h.tercero_arl_id||""),$("#nom-emp-rule-tercero-caja")&&($("#nom-emp-rule-tercero-caja").value=h.tercero_caja_id||""),u()},v=()=>{const b=$("#nom-emp-rules-summary"),h=$("#nom-emp-rules-body");if(!h)return;const _=[...e].sort((C,I)=>(C.name||"").localeCompare(I.name||"")),A=_.filter(C=>!ea(He(l.config,C.id)));b&&(b.innerHTML=A.length?`<div class="rounded-xl p-3 text-sm" style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B">
               <p class="font-semibold"><i class="fas fa-triangle-exclamation mr-1"></i>Parámetros incompletos: ${A.length} empleado(s)</p>
               <p class="mt-1">Pendientes de salario básico efectivo: ${esc(A.slice(0,8).map(C=>C.name).join(", "))}${A.length>8?"...":""}</p>
             </div>`:`<div class="rounded-xl p-3 text-sm" style="background:#F0FFF4;border:1px solid #BBF7D0;color:#166534">
               <p class="font-semibold"><i class="fas fa-circle-check mr-1"></i>Todos los empleados activos tienen parámetros completos para liquidación.</p>
             </div>`),h.innerHTML=_.length?_.map(C=>{const I=He(l.config,C.id),N=lo(l.config,C.id),T=ea(I),S=I.group_id?f[I.group_id]||"Grupo no encontrado":"Sin grupo";return`<tr${T?"":' style="background:#FFF7ED"'}>
            <td>${esc(C.name||"Empleado")}</td>
            <td>${esc(S)}</td>
            <td>${T?'<span class="badge badge-green">Completo</span>':'<span class="badge" style="background:#FEE2E2;color:#991B1B">Pendiente</span>'}</td>
            <td>${fmt(I.basic_salary||0)}</td>
            <td>${esc(d(I.arl_risk_level||1))}</td>
            <td>${I.is_pensioner?"Sí":"No"}</td>
            <td>${I.apply_solidarity_fund?"Sí":"No"}</td>
            <td>${I.apply_withholding_tax?`${se((I.withholding_rate||0)*100)}%`:"No"}</td>
            <td class="text-right">
              <div class="flex gap-1 justify-end">
                <button class="btn btn-outline btn-sm btn-edit-emp-rule" data-emp="${esc(C.id)}" title="Editar"><i class="fas fa-pen"></i></button>
                ${N?`<button class="btn btn-outline btn-sm btn-del-emp-rule" data-emp="${esc(C.id)}" title="Eliminar"><i class="fas fa-trash"></i></button>`:""}
              </div>
            </td>
          </tr>`}).join(""):'<tr><td colspan="9" class="text-center py-6" style="color:#9CA3AF">Sin empleados activos.</td></tr>'};v(),nt({terceros:r,hiddenId:"nom-emp-rule-tercero-salud",inputId:"nom-emp-rule-tercero-salud-search",resultsId:"nom-emp-rule-tercero-salud-results"}),nt({terceros:r,hiddenId:"nom-emp-rule-tercero-pension",inputId:"nom-emp-rule-tercero-pension-search",resultsId:"nom-emp-rule-tercero-pension-results"}),nt({terceros:r,hiddenId:"nom-emp-rule-tercero-arl",inputId:"nom-emp-rule-tercero-arl-search",resultsId:"nom-emp-rule-tercero-arl-results"}),nt({terceros:r,hiddenId:"nom-emp-rule-tercero-caja",inputId:"nom-emp-rule-tercero-caja-search",resultsId:"nom-emp-rule-tercero-caja-results"}),u(),(t=$("#nom-emp-rule-employee"))==null||t.addEventListener("change",()=>{const b=getSelectVal("nom-emp-rule-employee");b&&y(b)}),(a=$("#btn-nom-emp-rule-upsert"))==null||a.addEventListener("click",()=>{var C,I,N;const b=getSelectVal("nom-emp-rule-employee");if(!b)return showToast("Selecciona un empleado.","warning");const h=!!((C=$("#nom-emp-rule-withholding"))!=null&&C.checked),_=parseNum(getInputVal("nom-emp-rule-withholding-rate")),A={employee_id:b,group_id:getSelectVal("nom-emp-rule-group")||"",basic_salary:Math.max(0,parseNum(getInputVal("nom-emp-rule-salary"))||0),arl_risk_level:Math.max(1,Math.min(5,parseInt(getSelectVal("nom-emp-rule-arl")||"1",10)||1)),is_pensioner:!!((I=$("#nom-emp-rule-pensioner"))!=null&&I.checked),apply_solidarity_fund:!!((N=$("#nom-emp-rule-solidarity"))!=null&&N.checked),apply_withholding_tax:h,withholding_rate:h?Math.max(0,_/100):0,tercero_salud_id:getSelectVal("nom-emp-rule-tercero-salud")||"",tercero_pension_id:getSelectVal("nom-emp-rule-tercero-pension")||"",tercero_arl_id:getSelectVal("nom-emp-rule-tercero-arl")||"",tercero_caja_id:getSelectVal("nom-emp-rule-tercero-caja")||""};l.config.employee_rules=(l.config.employee_rules||[]).filter(T=>T.employee_id!==b),l.config.employee_rules.push(A),v(),showToast("Parámetro de empleado agregado/actualizado","success")}),(o=$("#btn-nom-emp-rule-clear"))==null||o.addEventListener("click",()=>{g()}),(s=$("#nom-emp-rules-body"))==null||s.addEventListener("click",b=>{var C,I,N,T;const h=(I=(C=b.target)==null?void 0:C.closest)==null?void 0:I.call(C,".btn-edit-emp-rule");if(h){const S=h.getAttribute("data-emp")||"";S&&y(S);return}const _=(T=(N=b.target)==null?void 0:N.closest)==null?void 0:T.call(N,".btn-del-emp-rule");if(!_)return;const A=_.getAttribute("data-emp")||"";l.config.employee_rules=(l.config.employee_rules||[]).filter(S=>S.employee_id!==A),l.editingEmployeeId===A&&g(),v()}),(n=$("#btn-save-nom-employee-rules"))==null||n.addEventListener("click",async()=>{try{await Jo(l.config,l.rowId),closeModal(),showToast("Parámetros por empleado guardados","success")}catch(b){showToast(b.message||"No se pudieron guardar los parámetros por empleado","error")}})}catch(i){showToast(i.message||"No se pudo abrir el panel de empleados de nómina","error")}}async function kt(e){var t,a,o,s,n,i;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando nómina...</div>';try{const c=[],r=await pb.listAll("payroll_periods",{sort:"-date_from"}).catch(u=>(c.push(`periodos: ${u.message}`),[])),l=await pb.listAll("third_parties",{filter:'type="EMPLEADO" && active=true',sort:"name"}).catch(u=>(c.push(`empleados: ${u.message}`),[])),p=await pb.listAll("payroll_lines",{sort:"-id",expand:"period_id,employee_id"}).catch(async u=>{try{return await pb.listAll("payroll_lines",{expand:"period_id,employee_id"})}catch{return c.push(`liquidaciones: ${u.message}`),[]}}),m=l.length===0,f=r.length===0,d={};p.forEach(u=>{const y=u.period_id;d[y]||(d[y]={devengado:0,deducciones:0,neto:0,parafiscales:0,count:0});const v=lt(u),b=Rt(u),h=(u.employer_health||0)+(u.employer_pension||0)+(u.employer_arl||0)+(u.sena||0)+(u.icbf||0)+(u.caja_comp||0);d[y].devengado+=v,d[y].deducciones+=b,d[y].neto+=u.net_pay||0,d[y].parafiscales+=h,d[y].count++});const g=u=>({draft:'<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>',approved:'<span class="badge badge-blue">Aprobada</span>',paid:'<span class="badge badge-green">Pagada</span>'})[u]||'<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>';e.innerHTML=`
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

      ${m||f?`
        <div class="mb-4 p-4 rounded-2xl border" style="background:#FFF8F0;border-color:#FED7AA">
          <div class="flex flex-wrap items-center gap-3 justify-between">
            <div>
              <p class="font-semibold" style="color:#C46516"><i class="fas fa-triangle-exclamation mr-2"></i>Configuracion inicial requerida</p>
              <p class="text-sm" style="color:#6B7280">
                ${m?"No hay terceros tipo EMPLEADO activos.":""}
                ${m&&f?" ":""}
                ${f?"No hay Periodos de nomina creados.":""}
              </p>
            </div>
            <div class="flex gap-2">
              ${m?'<button class="btn btn-outline btn-sm" id="btn-go-empleados"><i class="fas fa-users"></i> Crear Empleado</button>':""}
              ${f&&can("canWrite")?'<button class="btn btn-primary btn-sm" id="btn-fast-period"><i class="fas fa-calendar-plus"></i> Crear Periodo</button>':""}
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
                  <td>${g(u.status)}</td>
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
              ${p.length?p.slice(0,30).map(u=>{var y,v,b,h,_,A;return`
                <tr>
                  <td>${esc(((v=(y=u.expand)==null?void 0:y.period_id)==null?void 0:v.name)||"?")}</td>
                  <td>${esc(((h=(b=u.expand)==null?void 0:b.employee_id)==null?void 0:h.name)||"?")}</td>
                  <td class="text-center">${esc(String(u.days_worked||30))}</td>
                  <td>${fmt(lt(u))}</td>
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
      </div>`,(t=$("#btn-new-period"))==null||t.addEventListener("click",()=>po()),(a=$("#btn-new-payline"))==null||a.addEventListener("click",()=>Wn(r,l)),(o=$("#btn-nomina-empleado"))==null||o.addEventListener("click",()=>zn(l)),(s=$("#btn-nomina-config"))==null||s.addEventListener("click",()=>qn(l)),(n=$("#btn-go-empleados"))==null||n.addEventListener("click",()=>navigate("terceros")),(i=$("#btn-fast-period"))==null||i.addEventListener("click",()=>po())}catch(c){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(c.message)}</div>`}}async function kr(e,t){const a={approved:"Aprobar",paid:"Marcar como Pagada"};confirmDialog(`${a[t]||"Cambiar estado"}`,"¿Confirmas cambiar el estado del período?",async()=>{try{const o={status:t};if(t==="approved"){const s=await Gn(e);s&&(o.tx_id=s)}await pb.update("payroll_periods",e,o),showToast("Estado actualizado","success"),kt($("#page-content"))}catch(o){showToast(o.message,"error")}})}async function Br(e,t=""){if(!can("canDelete"))return showToast("No tienes permisos para eliminar períodos de nómina","error");try{const a=await pb.get("payroll_periods",e);if((a.status||"draft")!=="draft")return showToast("Solo puedes eliminar períodos en estado borrador.","warning");if(a.tx_id)return showToast("No puedes eliminar un período que ya tiene contabilización asociada.","warning");const o=t||a.name||"este período";confirmDialog("Eliminar período de nómina",`¿Confirmas eliminar el período ${esc(o)}? También se eliminarán sus liquidaciones.`,async()=>{try{await pb.delete("payroll_periods",e),showToast("Período eliminado","success"),kt($("#page-content"))}catch(s){showToast(s.message||"No se pudo eliminar el período","error")}})}catch(a){showToast(a.message||"No se pudo validar el período","error")}}async function Mr(e){var t,a,o,s;if(!can("canWrite"))return showToast("No tienes permisos para eliminar liquidaciones","error");try{const n=await pb.get("payroll_lines",e,{expand:"period_id,employee_id"});if((((a=(t=n.expand)==null?void 0:t.period_id)==null?void 0:a.status)||"draft")!=="draft")return showToast("Solo puedes eliminar liquidaciones de períodos en borrador.","warning");const c=((s=(o=n.expand)==null?void 0:o.employee_id)==null?void 0:s.name)||"este empleado";confirmDialog("Eliminar liquidación",`¿Confirmas eliminar la liquidación de ${esc(c)}?`,async()=>{try{await pb.delete("payroll_lines",e),showToast("Liquidación eliminada","success"),closeModal(),kt($("#page-content"))}catch(r){showToast(r.message||"No se pudo eliminar la liquidación","error")}})}catch(n){showToast(n.message||"No se pudo validar la liquidación","error")}}async function Ur(e,t,a="draft"){try{const o=await pb.listAll("payroll_lines",{filter:`period_id="${e}"`,expand:"employee_id,period_id",sort:"id"});if(!o.length)return showToast("Este período no tiene liquidaciones","info");const s=o.reduce((r,l)=>r+lt(l),0),n=o.reduce((r,l)=>r+(l.net_pay||0),0),i=o.reduce((r,l)=>r+(l.employer_health||0)+(l.employer_pension||0)+(l.employer_arl||0)+(l.sena||0)+(l.icbf||0)+(l.caja_comp||0),0),c=o.reduce((r,l)=>r+(l.cesantias||0)+(l.intereses_ces||0)+(l.prima||0)+(l.vacaciones||0),0);openModal(`Liquidaciones — ${esc(t)}`,`<div class="space-y-4">
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
                <td>${fmt(lt(r))}</td>
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
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch(o){showToast(o.message,"error")}}async function Vr(e){var t,a;try{const o=await pb.get("payroll_lines",e,{expand:"period_id,employee_id"}),s=Ot(o),n=Dt(o),i=se((Number(s.arl_rate||Fe[1])||Fe[1])*100),c=Ma(o),l=ca(o).conceptAmounts,p=lt(o),m=Rt(o),f=(o.employer_health||0)+(o.employer_pension||0)+(o.employer_arl||0)+(o.sena||0)+(o.icbf||0)+(o.caja_comp||0),d=(o.cesantias||0)+(o.intereses_ces||0)+(o.prima||0)+(o.vacaciones||0),g=Number(s.transport_days||o.days_worked||30),u=(h,_,A=!1)=>`<div class="flex justify-between py-1 border-b" style="border-color:#F3F4F6">
        <span style="color:#6B7280">${h}</span>
        <span class="${A?"font-bold":"font-medium"}">${typeof _=="number"?fmt(_):_}</span>
      </div>`,y=c.hasBreakdown?c.breakdown.map(h=>u(`${h.label} (${h.hours} h)`,h.amount||0)).join(""):u("Horas extra / recargos",o.overtime||0),v=Le.filter(h=>(l[h]||0)>0).map(h=>{var _;return u(((_=De[h])==null?void 0:_.label)||h,l[h]||0)}).join(""),b=Pe.filter(h=>(l[h]||0)>0).map(h=>{var _;return u(((_=De[h])==null?void 0:_.label)||h,l[h]||0)}).join("");openModal(`Detalle Liquidación — ${esc(((a=(t=o.expand)==null?void 0:t.employee_id)==null?void 0:a.name)||"")}`,`<div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Devengos</p>
           ${u("Salario base (30 días)",o.salary_base||0)}
           ${u("Días trabajados",String(o.days_worked||30))}
          ${u("Salario proporcional",(o.salary_base||0)/30*(o.days_worked||30))}
          ${y}
          ${u("Días auxilio transporte",String(g))}
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
          ${b}
          ${u("TOTAL DEDUCCIONES",m,!0)}
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
          ${u("TOTAL PARAFISCALES",f,!0)}
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
       <button class="btn btn-primary" onclick="printPayrollSlip('${e}')"><i class="fas fa-print mr-1"></i>Imprimir volante</button>`,!0)}catch(o){showToast(o.message,"error")}}async function jr(e){var t,a,o,s,n,i,c,r,l,p,m,f;try{const d=await pb.get("payroll_lines",e,{expand:"period_id,employee_id"}),g=Ot(d),u=Dt(d),y=se((Number(g.arl_rate||Fe[1])||Fe[1])*100),v=Ma(d),h=ca(d).conceptAmounts,_=lt(d),A=Rt(d),C=Number(g.transport_days||d.days_worked||30),[I,N,T]=await Promise.all([API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>"")]),S=((a=(t=d.expand)==null?void 0:t.employee_id)==null?void 0:a.name)||"",w=((s=(o=d.expand)==null?void 0:o.employee_id)==null?void 0:s.doc_number)||"",E=((i=(n=d.expand)==null?void 0:n.employee_id)==null?void 0:i.notes)||"",L=((r=(c=d.expand)==null?void 0:c.period_id)==null?void 0:r.name)||"",R=((p=(l=d.expand)==null?void 0:l.period_id)==null?void 0:p.date_from)||"",B=((f=(m=d.expand)==null?void 0:m.period_id)==null?void 0:f.date_to)||"",M=x=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}).format(Number(x)||0),k=(x,P,V=!1)=>`<tr>
         <td style="padding:3px 8px;color:#374151;${V?"font-weight:700;":""}">${x}</td>
         <td style="padding:3px 8px;text-align:right;${V?"font-weight:700;":""}">${typeof P=="number"?M(P):P}</td>
       </tr>`,j=v.hasBreakdown?v.breakdown.filter(x=>x.hours>0).map(x=>k(`${x.label} (${x.hours} h)`,x.amount)).join(""):d.overtime?k("Horas extra / recargos",d.overtime||0):"",Y=Le.filter(x=>(h[x]||0)>0).map(x=>{var P;return k(((P=De[x])==null?void 0:P.label)||x,h[x])}).join(""),W=Pe.filter(x=>(h[x]||0)>0).map(x=>{var P;return k(((P=De[x])==null?void 0:P.label)||x,h[x])}).join(""),K=`<!DOCTYPE html>
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
      <div class="company-name">${I||"Empresa"}</div>
      ${N?`<div class="company-sub">NIT: ${N}</div>`:""}
      ${T?`<div class="company-sub">${T}</div>`:""}
    </div>
    <div>
      <div class="slip-title">VOLANTE DE PAGO DE NÓMINA</div>
      <div class="slip-period">${L}${R?" &nbsp;·&nbsp; Del "+R:""}${B?" al "+B:""}</div>
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
    <div class="n-value">${M(d.net_pay||0)}</div>
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
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-period">Guardar</button>'),(e=$("#btn-save-period"))==null||e.addEventListener("click",async()=>{try{const t={name:getInputVal("pp-name"),date_from:getInputVal("pp-from"),date_to:getInputVal("pp-to"),status:getSelectVal("pp-status")};if(!t.name||!t.date_from||!t.date_to)return showToast("Completa los campos obligatorios","warning");const a=await pb.create("payroll_periods",t);closeModal(),showToast("Período creado","success"),kt($("#page-content"))}catch(t){showToast(t.message,"error")}})}async function Wn(e,t){var d,g,u,y,v;if(!e.length)return showToast("Primero crea un período de nómina","warning");if(!t.length)return showToast("No hay terceros tipo EMPLEADO activos","warning");const a=e.filter(b=>b.status==="draft"||!b.status);if(!a.length)return showToast("No hay períodos en estado Borrador para liquidar","warning");const{config:o}=await ia(),s=t.filter(b=>{const h=He(o,b.id);return!ea(h)});if(s.length){const b=s.slice(0,5).map(h=>h.name).join(", ");return showToast(`Debes configurar salario básico en todos los empleados activos antes de liquidar. Pendientes: ${b}${s.length>5?"...":""}`,"warning")}const n=qt.map(b=>`
    <div class="form-group">
      <label class="form-label">${esc(b.label)} (horas)</label>
      <input id="pl-ot-${esc(b.key)}" class="form-input" value="0">
    </div>
  `).join(""),i=Le.map(b=>{var h;return`
    <div class="form-group">
      <label class="form-label">${esc(((h=De[b])==null?void 0:h.label)||b)}</label>
      <input id="pl-cpt-${esc(b)}" class="form-input" value="0">
    </div>
  `}).join(""),c=Pe.map(b=>{var h;return`
    <div class="form-group">
      <label class="form-label">${esc(((h=De[b])==null?void 0:h.label)||b)}</label>
      <input id="pl-cpt-${esc(b)}" class="form-input" value="0">
    </div>
  `}).join("");openModal("Nueva Liquidación de Nómina",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Período</label><select id="pl-period" class="form-input">${a.map(b=>`<option value="${esc(b.id)}">${esc(b.name)}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Empleado</label><select id="pl-emp" class="form-input">${t.map(b=>`<option value="${esc(b.id)}">${esc(b.doc_number)} - ${esc(b.name)}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Salario Base (mensual)</label><input id="pl-salary" class="form-input" value="0"><p class="text-xs mt-1" style="color:#6B7280">Se autocompleta según parámetro del empleado.</p></div>
      <div class="form-group"><label class="form-label">Días salario (max 30)</label><input id="pl-days-salary" class="form-input" value="30"></div>
      <div class="form-group"><label class="form-label">Días auxilio transporte (0 a 30)</label><input id="pl-days-transport" class="form-input" value="30"></div>
      <div class="form-group"><label class="form-label">Auxilio de Transporte mensual</label><input id="pl-aux" class="form-input" value="200000" title="2026: $200.000"><p class="text-xs mt-1" style="color:#6B7280">Se liquida proporcional con los días de auxilio.</p></div>
      <div class="form-group"><label class="form-label">Otras Deducciones</label><input id="pl-ded-other" class="form-input" value="0" placeholder="Deducciones varias no clasificadas"></div>
    </div>

    <div class="rounded-xl p-3 mt-4" style="background:#F8FAFC;border:1px solid #E2E8F0">
      <p class="font-semibold mb-2" style="color:#0D2137">Horas extra y recargos — jornada ${((d=o.company_rules)==null?void 0:d.weekly_hours)||44} h/semana (valor hora = salario / ${(((g=o.company_rules)==null?void 0:g.weekly_hours)||44)*5})</p>
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
     <button class="btn btn-primary" id="btn-save-pl">Guardar</button>`);const r=()=>{const b={};return[...Le,...Pe].forEach(h=>{b[h]=se(parseNum(getInputVal(`pl-cpt-${h}`))||0)}),b},l=b=>{var C;const h=((C=o.company_rules)==null?void 0:C.weekly_hours)||44,_=se((b||0)/(h*5)),A=qt.map(I=>{const N=se(parseNum(getInputVal(`pl-ot-${I.key}`))||0),T=se(_*N*I.factor);return{key:I.key,hours:N,amount:T}});return{hourly_rate:_,total_hours:se(A.reduce((I,N)=>I+(N.hours||0),0)),total_amount:se(A.reduce((I,N)=>I+(N.amount||0),0)),breakdown:A}},p=async()=>{const b=parseNum(getInputVal("pl-salary")),h=parseNum(getInputVal("pl-days-salary"))||30,_=parseNum(getInputVal("pl-days-transport"))||0,A=parseNum(getInputVal("pl-aux")),C=se(A/30*_),I=parseNum(getInputVal("pl-ded-other")),N=getSelectVal("pl-emp");if(b<=0)return;const S=l(b).total_amount,w=r(),E=se(Le.reduce((q,G)=>q+(w[G]||0),0)),L=se(Pe.reduce((q,G)=>q+(w[G]||0),0)),R=He(o,N),B=o.company_rules||Xt().company_rules,M=b/30*h,k=M+S,j=k+C+E,Y=k*.04,W=R.is_pensioner?0:k*.04,K=(B.smmlv||1423500)*(B.solidarity_threshold_smmlv||3),H=R.apply_solidarity_fund&&k>=K?k*(B.solidarity_rate||.01):0,x=R.apply_withholding_tax?k*(R.withholding_rate||0):0,P=Y+W+H+x+I+L,V=j-P,U=Fe[R.arl_risk_level]||Fe[1],z=B.exempt_sena_icbf?0:.02,J=B.exempt_sena_icbf?0:.03,te=k*(.085+.12+U+z+J+.04),F=k*(.0833+.01*.0833+.0833+.0417),D=$("#nomina-preview");D&&(D.style.display="",D.innerHTML=`
      <div class="grid grid-cols-3 gap-3 text-center">
        <div><div class="text-xs" style="color:#6B7280">Devengado</div><div class="font-bold" style="color:#1A4B8C">${fmt(j)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Deducciones</div><div class="font-bold" style="color:#B91C1C">${fmt(P)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Neto a Pagar</div><div class="font-bold" style="color:#15803D">${fmt(V)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Parafiscales</div><div class="font-medium" style="color:#C46516">${fmt(te)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Provisiones</div><div class="font-medium" style="color:#7C3AED">${fmt(F)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Costo Total</div><div class="font-bold" style="color:#0D2137">${fmt(j+te+F)}</div></div>
      </div>
      <div class="mt-3 text-xs" style="color:#64748B">
        Salario (${h} días): ${fmt(M)} | Auxilio (${_} días): ${fmt(C)} | Horas extra/recargos: ${fmt(S)} | Devengos adicionales: ${fmt(E)} | Deducciones por concepto: ${fmt(L)}
      </div>`)};(u=$("#btn-preview-pl"))==null||u.addEventListener("click",p),["pl-salary","pl-days-salary","pl-days-transport","pl-aux","pl-ded-other",...qt.map(b=>`pl-ot-${b.key}`),...Le.map(b=>`pl-cpt-${b}`),...Pe.map(b=>`pl-cpt-${b}`)].forEach(b=>{var h;return(h=$("#"+b))==null?void 0:h.addEventListener("input",debounce(()=>{p()},250))});const f=()=>{const b=getSelectVal("pl-emp"),h=He(o,b);(h.basic_salary||0)>0&&setInputVal("pl-salary",String(se(h.basic_salary)))};(y=$("#pl-emp"))==null||y.addEventListener("change",()=>{f(),p()}),f(),p(),(v=$("#btn-save-pl"))==null||v.addEventListener("click",async()=>{var h;const b=$("#btn-save-pl");b&&(b.disabled=!0,b.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const _=parseNum(getInputVal("pl-salary")),A=parseNum(getInputVal("pl-days-salary"))||30,C=parseNum(getInputVal("pl-days-transport"))||0,I=parseNum(getInputVal("pl-aux")),N=se(I/30*C),T=parseNum(getInputVal("pl-ded-other")),S=getSelectVal("pl-emp");if(_<=0)return showToast("El salario base debe ser mayor a cero","warning");if(A<=0||A>30)return showToast("Días salario debe estar entre 1 y 30","warning");if(C<0||C>30)return showToast("Días auxilio transporte debe estar entre 0 y 30","warning");const w=getSelectVal("pl-period");if(!w)return showToast("Selecciona un Periodo","warning");if(((await pb.get("payroll_periods",w)).status||"draft")!=="draft")return showToast("El Periodo seleccionado no esta en borrador. No se pueden registrar nuevas liquidaciones.","error");const L=l(_),R=L.total_amount,B=r(),M=se(Le.reduce((de,me)=>de+(B[me]||0),0)),k=se(Pe.reduce((de,me)=>de+(B[me]||0),0)),Y=_/30*A+R,W=Y+N+M,K=He(o,S);if(!ea(K))return showToast("El empleado no tiene salario básico configurado en Parámetros por Empleado.","warning");const H=o.company_rules||Xt().company_rules,x=Y*.04,P=K.is_pensioner?0:Y*.04,V=(H.smmlv||1423500)*(H.solidarity_threshold_smmlv||3),U=K.apply_solidarity_fund&&Y>=V?Y*(H.solidarity_rate||.01):0,z=K.apply_withholding_tax?Y*(K.withholding_rate||0):0,J=T,te=Y*.085,F=Y*.12,D=Fe[K.arl_risk_level]||Fe[1],q=Y*D,G=H.exempt_sena_icbf?0:Y*.02,ee=H.exempt_sena_icbf?0:Y*.03,X=Y*.04,ne=Y*.0833,Z=ne*.01,Q=Y*.0833,oe=Y*.0417,ve=W-x-P-U-z-J-k,be={};L.breakdown.forEach(de=>{be[de.key]={hours:se(de.hours||0),amount:se(de.amount||0)}});const ye={payroll_meta:{arl_risk_level:K.arl_risk_level,arl_rate:D,is_pensioner:!!K.is_pensioner,solidarity_fund:se(U),withholding_tax:se(z),company_exempt_sena_icbf:!!H.exempt_sena_icbf,overtime_breakdown:{hourly_rate:se(L.hourly_rate||0),total_hours:se(L.total_hours||0),total_amount:se(R||0),...be},transport_days:C,transport_monthly:se(I||0),concept_amounts:B}},pe={period_id:w,employee_id:S,salary_base:_,days_worked:A,overtime:R,transport_allowance:N,deduction_health:x,deduction_pension:P,deduction_other:J,net_pay:ve,employer_health:te,employer_pension:F,employer_arl:q,sena:G,icbf:ee,caja_comp:X,cesantias:ne,intereses_ces:Z,prima:Q,vacaciones:oe,notes:JSON.stringify(ye)};await pb.create("payroll_lines",pe),closeModal(),showToast("Liquidación registrada","success"),kt($("#page-content"))}catch(_){const A=(h=_==null?void 0:_.data)!=null&&h.data?Object.values(_.data.data).map(C=>C==null?void 0:C.message).filter(Boolean).join(" | "):"";showToast(A||_.message||"No se pudo registrar la Liquidacion","error")}finally{b&&(b.disabled=!1,b.innerHTML="Guardar")}})}window.ARL_RISK_RATES=Fe;window.openNominaEmployeeSettings=zn;window.compactNominaConfigForStorage=kn;window.writeSettingJsonMaybeChunked=Mn;window.upsertSettingByKey=ro;window.isEmployeePayrollRuleComplete=ea;window.viewPeriodLines=Ur;window.listSettingsByPrefix=Yo;window.nominaThirdDisplay=$a;window.getEmployeePayrollRule=He;window.getNominaAdditionalConceptTotals=ca;window.getNominaConfigWithRow=ia;window.deleteSettingByKey=co;window.saveNominaConfig=Jo;window.normalizeNominaConfig=Ft;window.getNominaConceptRule=Gt;window.getNominaDeduccionesTotal=Rt;window.NOMINA_EXTRA_DEDUCTION_KEYS=Pe;window.round2=se;window.nominaFindThirdById=wa;window.renderNomina=kt;window.setPeriodStatus=kr;window.openNominaAccountingSettings=qn;window.initNominaThirdSearchInput=nt;window.getExtraDeductionsFromLine=Dt;window.getNominaConceptAmountsFromLine=Ko;window.postNominaPeriodAccounting=Gn;window.viewPayrollLineDetail=Vr;window.NOMINA_CONCEPTS=Ba;window.NOMINA_CATEGORY_LABELS=Aa;window.findEmployeePayrollRule=lo;window.getNominaOvertimeMetaFromLine=Ma;window.resolveNominaCrossDocRef=jn;window.NOMINA_OVERTIME_TYPES=qt;window.NOMINA_EXTRA_EARNING_KEYS=Le;window.deletePayrollPeriod=Br;window.buildNominaAccountingLines=Hn;window.openPayrollLineForm=Wn;window.defaultNominaConfig=Xt;window.settingChunkKey=io;window.resolveAllNominaMappings=Un;window.NOMINA_CONFIG_VALUE_MAX_CHARS=xa;window.printPayrollSlip=jr;window.resolveNominaTerceroId=Vn;window.readSettingJsonMaybeChunked=yt;window.deletePayrollLine=Mr;window.NOMINA_CONFIG_KEYS=Te;window.NOMINA_CONCEPT_RULES=Dn;window.getNominaConceptAmount=Qo;window.NOMINA_CONFIG_KEY=ze;window.getNominaCategoryConcepts=On;window.splitTextInChunks=Bn;window.getNominaCategoryLabel=Rn;window.resolveNominaMapping=Or;window.getNominaLineMeta=Ot;window.NOMINA_CONCEPT_BY_KEY=De;window.openPeriodForm=po;window.getNominaDevengadoTotal=lt;async function Zo(e){var t,a,o,s,n;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando facturaci?n DIAN...</div>';try{const i=[],c=await pb.listAll("einvoice_docs",{sort:"-created",expand:"tx_id"}).catch(g=>(i.push(`documentos: ${g.message}`),[])),r=await pb.listAll("transactions",{sort:"-date,-created",filter:'status="active"',expand:"tx_type_id,third_party_id"}).catch(g=>(i.push(`transacciones: ${g.message}`),[])),l={pendiente:{cls:"badge-orange",icon:"fa-clock",label:"Pendiente"},enviada:{cls:"badge-blue",icon:"fa-paper-plane",label:"Enviada"},aceptada:{cls:"badge-green",icon:"fa-circle-check",label:"Aceptada"},rechazada:{cls:"badge-red",icon:"fa-circle-xmark",label:"Rechazada"}},p=g=>l[g]||l.pendiente,m={pendiente:0,enviada:0,aceptada:0,rechazada:0};c.forEach(g=>{const u=g.status||"pendiente";m[u]!==void 0&&m[u]++});const f=r.length===0;e.innerHTML=`
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

      ${f?`<div class="mb-4 p-4 rounded-2xl border" style="background:#FFF8F0;border-color:#FED7AA">
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
        ${[["pendiente","#FFF8F0","#C46516"],["enviada","#EFF6FF","#1D4ED8"],["aceptada","#F0FFF4","#15803D"],["rechazada","#FEF2F2","#B91C1C"]].map(([g,u,y])=>`
          <div class="rounded-2xl p-4 cursor-pointer dian-kpi" data-status="${g}" style="background:${u};border:2px solid transparent" onclick="filterDianByStatus('${g}')">
            <div class="text-xs font-medium mb-1" style="color:${y}">${p(g).label}</div>
            <div class="text-2xl font-bold" style="color:${y}">${m[g]}</div>
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
              ${c.length?c.map(g=>{var b,h,_;const u=g.status||"pendiente",y=p(u),v=(b=g.expand)==null?void 0:b.tx_id;return`<tr data-status="${u}">
                  <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc((v==null?void 0:v.number)||"?")}</span></td>
                  <td>${esc(((_=(h=v==null?void 0:v.expand)==null?void 0:h.third_party_id)==null?void 0:_.name)||"?")}</td>
                  <td class="font-mono text-xs max-w-xs truncate" title="${esc(g.cufe||"")}">${g.cufe?esc(g.cufe.slice(0,20))+"?":"?"}</td>
                  <td><span class="badge ${y.cls}"><i class="fas ${y.icon} mr-1"></i>${y.label}</span></td>
                  <td class="text-sm max-w-xs truncate" title="${esc(g.dian_response||"")}">${esc(g.dian_response||"?")}</td>
                  <td>${esc(g.sent_at?fmtDate(g.sent_at):"?")}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewDianDetail('${esc(g.id)}')"><i class="fas fa-eye"></i></button>
                      ${can("canWrite")?`<button class="btn btn-outline btn-sm" title="Editar" onclick="editDianDoc('${esc(g.id)}')"><i class="fas fa-pen"></i></button>`:""}
                      ${can("canWrite")&&u==="pendiente"?`<button class="btn btn-secondary btn-sm" title="Enviar a DIAN" onclick="setDianStatus('${esc(g.id)}','enviada')"><i class="fas fa-paper-plane"></i> Enviar</button>`:""}
                      ${can("canWrite")&&u==="enviada"?`<button class="btn btn-primary btn-sm" title="Aceptar" onclick="setDianStatus('${esc(g.id)}','aceptada')"><i class="fas fa-check"></i></button>`:""}
                      ${can("canWrite")&&u==="enviada"?`<button class="btn btn-danger btn-sm" title="Rechazar" onclick="setDianStatus('${esc(g.id)}','rechazada')"><i class="fas fa-xmark"></i></button>`:""}
                    </div>
                  </td>
                </tr>`}).join(""):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay documentos DIAN registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;const d=()=>{const g=getInputVal("dian-q").toLowerCase(),u=getSelectVal("dian-status-filter");$$("#dian-table tbody tr[data-status]").forEach(y=>{const v=!g||y.textContent.toLowerCase().includes(g),b=!u||y.dataset.status===u;y.style.display=v&&b?"":"none"})};(t=$("#dian-q"))==null||t.addEventListener("input",debounce(d,150)),(a=$("#dian-status-filter"))==null||a.addEventListener("change",d),(o=$("#btn-dian-clear"))==null||o.addEventListener("click",()=>{setInputVal("dian-q","");const g=$("#dian-status-filter");g&&(g.value=""),$$("#dian-table tbody tr[data-status]").forEach(u=>u.style.display=""),$$(".dian-kpi").forEach(u=>u.style.borderColor="transparent")}),(s=$("#btn-new-dian"))==null||s.addEventListener("click",()=>Xo(r)),(n=$("#btn-go-nueva-tx"))==null||n.addEventListener("click",()=>navigate("nueva-tx"))}catch(i){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(i.message)}</div>`}}function Hr(e){const t=$("#dian-status-filter");t&&(t.value=e,t.dispatchEvent(new Event("change"))),$$(".dian-kpi").forEach(a=>a.style.borderColor=a.dataset.status===e?"#E87D1E":"transparent")}async function Gr(e){var t;try{const a=await pb.get("einvoice_docs",e,{expand:"tx_id"}),o=(t=a.expand)==null?void 0:t.tx_id,s={pendiente:{cls:"badge-orange",label:"Pendiente"},enviada:{cls:"badge-blue",label:"Enviada"},aceptada:{cls:"badge-green",label:"Aceptada"},rechazada:{cls:"badge-red",label:"Rechazada"}},n=s[a.status||"pendiente"]||s.pendiente,i=`<?xml version="1.0" encoding="UTF-8"?>
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
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch(a){showToast(a.message,"error")}}function Yn(e,t){const a=`${e}|${t}|${Date.now()}`;try{return btoa(a).replace(/[^A-Za-z0-9]/g,"").slice(0,64).padEnd(64,"0")}catch{return`CUFE${Date.now()}${e}`.slice(0,64)}}async function qr(e,t){const a={enviada:"Enviar a DIAN",aceptada:"Marcar como Aceptada",rechazada:"Marcar como Rechazada"};confirmDialog(a[t]||"Cambiar estado","?Confirmas el cambio de estado del documento?",async()=>{try{const o=await pb.get("einvoice_docs",e),s=o.status||"pendiente";if(!({pendiente:["enviada"],enviada:["aceptada","rechazada"],aceptada:[],rechazada:[]}[s]||[]).includes(t))return showToast(`Transici?n no permitida: ${s} ? ${t}`,"warning");const i={status:t};t==="enviada"&&(i.sent_at=todayStr(),i.cufe=o.cufe||Yn(o.tx_id,i.sent_at),i.dian_response=o.dian_response||"Documento enviado a DIAN (simulaci?n)."),t==="aceptada"&&(i.dian_response="Documento aceptado por DIAN. Procesado correctamente."),t==="rechazada"&&(i.dian_response="Documento rechazado por DIAN. Verifique inconsistencias."),await pb.update("einvoice_docs",e,i),showToast(`Estado actualizado a: ${t}`,"success"),Zo($("#page-content"))}catch(o){showToast(o.message,"error")}})}function Xo(e,t=null){var a;if(!t&&(!e||!e.length))return showToast("No hay transacciones activas disponibles para asociar al documento DIAN","warning");openModal(t?"Editar Documento DIAN":"Nuevo Documento DIAN",`
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
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-dian">Guardar</button>'),(a=$("#btn-save-dian"))==null||a.addEventListener("click",async()=>{var s,n;const o=$("#btn-save-dian");o&&(o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const i={tx_id:(t==null?void 0:t.tx_id)||getSelectVal("df-tx"),cufe:getInputVal("df-cufe"),status:getSelectVal("df-status")||(t==null?void 0:t.status)||"pendiente",dian_response:getInputVal("df-resp"),sent_at:getInputVal("df-sent")||""};if(!i.tx_id)return showToast("Selecciona una transacci?n","warning");if(!(t!=null&&t.id)&&(s=(await pb.list("einvoice_docs",{filter:`tx_id="${i.tx_id}"`,perPage:1})).items)!=null&&s.length)return showToast("Esta transaccion ya tiene documento DIAN asociado. Usa editar.","warning");if(t!=null&&t.id)await pb.update("einvoice_docs",t.id,i);else{const c=await pb.create("einvoice_docs",i)}closeModal(),showToast("Documento DIAN guardado","success"),Zo($("#page-content"))}catch(i){const c=(n=i==null?void 0:i.data)!=null&&n.data?Object.values(i.data.data).map(r=>r==null?void 0:r.message).filter(Boolean).join(" | "):"";showToast(c||i.message||"No se pudo guardar el documento DIAN","error")}finally{o&&(o.disabled=!1,o.innerHTML="Guardar")}})}async function zr(e){try{const[t,a]=await Promise.all([pb.get("einvoice_docs",e),pb.listAll("transactions",{sort:"-date,-created",filter:'status="active"',expand:"tx_type_id,third_party_id"})]);Xo(a,t)}catch(t){showToast(t.message,"error")}}window.setDianStatus=qr;window.filterDianByStatus=Hr;window.generateMockCufe=Yn;window.viewDianDetail=Gr;window.editDianDoc=zr;window.openDianForm=Xo;window.renderFacturacionDIAN=Zo;const Ge="periodos_cierre";async function Ua(e){var t,a,o,s,n;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando asistente de cierre...</div>';try{const[i,c]=await Promise.all([API.getAccounts(!1),API.getAccountSaldos()]),r=await API.getSetting(Ge),l=r?JSON.parse(r):[],p={};for(const C of i){const I=(C.code||"").charAt(0);p[I]||(p[I]=0),p[I]+=Number(c[C.id]||0)}const m=Math.abs(p[4]||0),f=Math.abs(p[5]||0)+Math.abs(p[6]||0)+Math.abs(p[7]||0),d=m-f,g=new Set(l.filter(C=>C.closed).map(C=>C.key)),u=new Date().getFullYear(),y=new Date().getMonth()+1,v=`${u}-${String(y).padStart(2,"0")}`,b=g.has(v),_=!!l.find(C=>C.key===v),A=C=>C.closed?'<span class="badge badge-red"><i class="fas fa-lock mr-1"></i>Cerrado</span>':'<span class="badge badge-green"><i class="fas fa-lock-open mr-1"></i>Habilitado</span>';e.innerHTML=`
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
          <div class="mt-1">${A(b)}</div>
        </div>
        <div class="rounded-2xl p-4 border" style="background:#F0FFF4;border-color:#BBF7D0">
          <div class="text-xs font-medium mb-1" style="color:#15803D">Total Ingresos (Cl.4)</div>
          <div class="text-lg font-bold" style="color:#15803D">${fmt(m)}</div>
        </div>
        <div class="rounded-2xl p-4 border" style="background:#FEF2F2;border-color:#FECACA">
          <div class="text-xs font-medium mb-1" style="color:#B91C1C">Total Gastos (Cl.5/6/7)</div>
          <div class="text-lg font-bold" style="color:#B91C1C">${fmt(f)}</div>
        </div>
        <div class="rounded-2xl p-4 border" style="${d>=0?"background:#F0FFF4;border-color:#BBF7D0":"background:#FEF2F2;border-color:#FECACA"}">
          <div class="text-xs font-medium mb-1" style="color:${d>=0?"#15803D":"#B91C1C"}">${d>=0?"Utilidad":"Perdida"} del Periodo</div>
          <div class="text-lg font-bold" style="color:${d>=0?"#15803D":"#B91C1C"}">${fmt(Math.abs(d))}</div>
        </div>
      </div>

      <!-- Estado del Periodo actual -->
      ${_?b?`<div class="mb-4 p-4 rounded-2xl border flex items-center gap-3" style="background:#FEF2F2;border-color:#FECACA">
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
          ${m>0?`<div class="rounded-xl p-4 border" style="background:#F0FFF4;border-color:#BBF7D0">
                <p class="text-xs font-semibold mb-2" style="color:#15803D">1. Cierre de Ingresos (Cl.4 ? Cl.3)</p>
                <p class="text-sm" style="color:#374151">Debito cuentas de ingreso: <strong>${fmt(m)}</strong></p>
                <p class="text-sm" style="color:#374151">Credito resultado del ejercicio: <strong>${fmt(m)}</strong></p>
              </div>`:""}
          ${f>0?`<div class="rounded-xl p-4 border" style="background:#FEF2F2;border-color:#FECACA">
                <p class="text-xs font-semibold mb-2" style="color:#B91C1C">2. Cierre de Gastos (Cl.3 ? Cl.5/6)</p>
                <p class="text-sm" style="color:#374151">Debito resultado del ejercicio: <strong>${fmt(f)}</strong></p>
                <p class="text-sm" style="color:#374151">Credito cuentas de gasto: <strong>${fmt(f)}</strong></p>
              </div>`:""}
        </div>
        ${can("canWrite")&&!b?'<div class="mt-4"><button class="btn btn-primary" id="btn-gen-cierre-entries"><i class="fas fa-magic"></i> Generar Asiento de Cierre</button></div>':""}
      </div>`,(t=$("#btn-new-cierre"))==null||t.addEventListener("click",()=>es(l,d)),(a=$("#btn-enable-period"))==null||a.addEventListener("click",()=>ya(l)),(o=$("#btn-enable-period-inline"))==null||o.addEventListener("click",()=>ya(l)),(s=$("#btn-enable-period-empty"))==null||s.addEventListener("click",()=>ya(l)),(n=$("#btn-gen-cierre-entries"))==null||n.addEventListener("click",()=>Jn(i,c,d))}catch(i){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(i.message)}</div>`}}function es(e,t){var s;const a=new Date,o=`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}`;openModal("Realizar Cierre Contable",`<div class="space-y-4">
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
     <button class="btn btn-danger" id="btn-confirm-cierre"><i class="fas fa-lock"></i> Confirmar Cierre</button>`),(s=$("#btn-confirm-cierre"))==null||s.addEventListener("click",async()=>{var r,l;const n=getInputVal("cierre-key").trim(),i=getInputVal("cierre-date"),c=getInputVal("cierre-note").trim();if(!n||!/^\d{4}-\d{2}$/.test(n))return showToast("El Periodo debe tener formato YYYY-MM","warning");if(!i)return showToast("Ingresa la fecha de cierre","warning");if(e.find(p=>p.key===n&&p.closed))return showToast(`El Periodo ${n} ya esta cerrado`,"warning");try{const p=e.find(d=>d.key===n),m={key:n,enabled:!0,closed:!0,closedAt:i,closedBy:((r=pb.currentUser)==null?void 0:r.email)||"admin",enabledAt:(p==null?void 0:p.enabledAt)||i,enabledBy:(p==null?void 0:p.enabledBy)||((l=pb.currentUser)==null?void 0:l.email)||"admin",note:c,utilidad:t};let f;p?f=e.map(d=>d.key===n?m:d):f=[...e,m],await API.setSetting(Ge,JSON.stringify(f)),closeModal(),showToast(`Periodo ${n} cerrado correctamente`,"success"),Ua($("#page-content"))}catch(p){showToast(p.message,"error")}})}async function Wr(e){const t=await API.getSetting(Ge),a=t?JSON.parse(t):[],[o,s]=await Promise.all([API.getAccounts(!1),API.getAccountSaldos()]),n={};for(const c of o){const r=(c.code||"").charAt(0);n[r]=(n[r]||0)+Number(s[c.id]||0)}const i=Math.abs(n[4]||0)-(Math.abs(n[5]||0)+Math.abs(n[6]||0)+Math.abs(n[7]||0));es(a,i),setTimeout(()=>{const c=$("#cierre-key");c&&(c.value=e)},100)}async function Yr(e){confirmDialog("Re-abrir Periodo",`Confirmas re-abrir el Periodo ${e}? Las transacciones volveran a ser posibles.`,async()=>{try{const t=await API.getSetting(Ge),o=(t?JSON.parse(t):[]).map(s=>s.key===e?{...s,enabled:!0,closed:!1,closedAt:null}:s);await API.setSetting(Ge,JSON.stringify(o)),showToast(`Periodo ${e} re-abierto`,"success"),Ua($("#page-content"))}catch(t){showToast(t.message,"error")}})}async function Jn(e,t,a){var c;if(!can("canWrite"))return showToast("Sin permisos para generar asientos","error");const o=e.filter(r=>(r.code||"").startsWith("3")),s=o.find(r=>r.code==="360505"||r.code==="36050501")||o.find(r=>r.code.startsWith("360")||r.code.startsWith("36"))||o.find(r=>!r.parent_code);if(!s)return showToast("no se encontro la cuenta de Resultado del Ejercicio (Clase 3). Creala en el Plan de Cuentas.","error");const n=e.filter(r=>(r.code||"").startsWith("4")&&Math.abs(Number(t[r.id]||0))>.001),i=e.filter(r=>["5","6","7"].includes((r.code||"").charAt(0))&&Math.abs(Number(t[r.id]||0))>.001);if(!n.length&&!i.length)return showToast("No hay saldos de ingresos ni gastos para cerrar.","warning");openModal("Asiento de Cierre - Vista Previa",`<div class="space-y-4 text-sm">
      <p style="color:#6B7280">Se generaran los siguientes comprobantes contables de cierre:</p>
      <div class="overflow-x-auto">
        <table class="data-table text-xs">
          <thead><tr><th>Cuenta</th><th>Descripcion</th><th>Debito</th><th>Credito</th></tr></thead>
          <tbody>
            ${n.map(r=>{const l=Math.abs(Number(t[r.id]||0));return`<tr><td class="font-mono">${esc(r.code)}</td><td>${esc(r.name)}</td><td>${fmt(l)}</td><td></td></tr>`}).join("")}
            <tr style="background:#F0FFF4"><td class="font-mono">${esc(s.code)}</td><td>${esc(s.name)} (Ingresos)</td><td></td><td>${fmt(Math.abs(Kn(e,t)))}</td></tr>
            ${i.map(r=>{const l=Math.abs(Number(t[r.id]||0));return`<tr><td class="font-mono">${esc(r.code)}</td><td>${esc(r.name)}</td><td></td><td>${fmt(l)}</td></tr>`}).join("")}
            <tr style="background:#FEF2F2"><td class="font-mono">${esc(s.code)}</td><td>${esc(s.name)} (Gastos)</td><td>${fmt(Qn(e,t))}</td><td></td></tr>
          </tbody>
        </table>
      </div>
      <p class="p-3 rounded-xl font-semibold text-center" style="background:${a>=0?"#F0FFF4":"#FEF2F2"};color:${a>=0?"#15803D":"#B91C1C"}">
        Resultado neto a trasladar: ${fmt(Math.abs(a))} - ${a>=0?"UTILIDAD":"Perdida"}
      </p>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-post-cierre"><i class="fas fa-floppy-disk"></i> Contabilizar Asiento</button>`),(c=$("#btn-post-cierre"))==null||c.addEventListener("click",async()=>{var r;try{const l=await API.getTxTypes(),p=l.find(u=>{var y;return u.prefix==="CM"||((y=u.name)==null?void 0:y.toLowerCase().includes("cierre"))})||l[0];if(!p)return showToast("No hay tipo de transaccion para el asiento de cierre","error");const m=[];n.forEach(u=>{const y=Math.abs(Number(t[u.id]||0));m.push({account_id:u.id,debit:y,credit:0,description:"Cierre de ingresos",line_order:m.length+1})});const f=n.reduce((u,y)=>u+Math.abs(Number(t[y.id]||0)),0);f>0&&m.push({account_id:s.id,debit:0,credit:f,description:"Traslado de ingresos al resultado",line_order:m.length+1}),i.forEach(u=>{const y=Math.abs(Number(t[u.id]||0));m.push({account_id:u.id,debit:0,credit:y,description:"Cierre de gastos",line_order:m.length+1})});const d=i.reduce((u,y)=>u+Math.abs(Number(t[y.id]||0)),0);d>0&&m.push({account_id:s.id,debit:d,credit:0,description:"Traslado de gastos al resultado",line_order:m.length+1});const g=await API.createTransaction({tx_type_id:p.id,number:"",date:todayStr(),description:`Asiento de cierre ${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`,user_id:(r=pb.currentUser)==null?void 0:r.id,status:"active"},m);closeModal(),showToast(`Asiento de cierre ${g.number} contabilizado. Revisalo en Consulta de Transacciones.`,"success")}catch(l){showToast(l.message,"error")}})}function Kn(e,t){return e.filter(a=>(a.code||"").startsWith("4")).reduce((a,o)=>a+Math.abs(Number(t[o.id]||0)),0)}function Qn(e,t){return e.filter(a=>["5","6","7"].includes((a.code||"").charAt(0))).reduce((a,o)=>a+Math.abs(Number(t[o.id]||0)),0)}function ya(e){var o;if(!can("canWrite"))return showToast("No tienes permisos para habilitar períodos","error");const t=new Date,a=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`;openModal('<i class="fas fa-calendar-plus mr-2" style="color:#1A4B8C"></i>Habilitar Período',`<div class="space-y-4">
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
     <button class="btn btn-primary" id="btn-confirm-enable"><i class="fas fa-calendar-check"></i> Habilitar Período</button>`),(o=$("#btn-confirm-enable"))==null||o.addEventListener("click",async()=>{var r;const s=getInputVal("enable-key").trim(),n=getInputVal("enable-date"),i=getInputVal("enable-note").trim();if(!s||!/^\d{4}-\d{2}$/.test(s))return showToast("El período debe tener formato YYYY-MM","warning");if(!n)return showToast("Ingresa la fecha de habilitación","warning");const c=Number(s.split("-")[1]);if(c<1||c>12)return showToast("Mes inválido en el período","warning");if(e.find(l=>l.key===s))return showToast(`El período ${s} ya está registrado en el sistema`,"warning");try{const l={key:s,enabled:!0,closed:!1,enabledAt:n,enabledBy:((r=pb.currentUser)==null?void 0:r.email)||"admin",closedAt:null,closedBy:null,note:i,utilidad:0},p=[...e,l].sort((m,f)=>m.key.localeCompare(f.key));await API.setSetting(Ge,JSON.stringify(p)),closeModal(),showToast(`Período ${s} habilitado correctamente para digitación`,"success"),Ua($("#page-content"))}catch(l){showToast(l.message,"error")}})}async function Jr(e){try{const t=await API.getSetting(Ge);if(!t)return!0;const a=JSON.parse(t),o=(e||"").slice(0,7),s=a.find(n=>n.key===o);return!!(!s||s.closed)}catch{return!1}}async function Kr(e){try{const t=await API.getSetting(Ge);if(!t)return!1;const a=JSON.parse(t),o=(e||"").slice(0,7);return a.some(s=>s.key===o)}catch{return!1}}window.openEnablePeriodForm=ya;window.reOpenPeriod=Yr;window.closePeriod=Wr;window.isPeriodRegistered=Kr;window.CIERRE_SETTING_KEY=Ge;window.generateCierreEntries=Jn;window.isPeriodClosed=Jr;window.openCierreForm=es;window.byClass4=Kn;window.gastoTotal=Qn;window.renderCierre=Ua;const Zn=[{name:"settings",label:"Configuración"},{name:"account_types",label:"Tipos de cuenta"},{name:"accounts",label:"Plan de cuentas"},{name:"third_parties",label:"Terceros"},{name:"transaction_types",label:"Tipos de transacción"},{name:"transactions",label:"Transacciones"},{name:"tx_lines",label:"Líneas de transacción"},{name:"bank_accounts",label:"Cuentas bancarias"},{name:"bank_movements",label:"Movimientos bancarios"},{name:"payroll_periods",label:"Períodos de nómina"},{name:"payroll_employees",label:"Empleados de nómina"},{name:"payroll_items",label:"Ítems de nómina"},{name:"audit_log",label:"Auditoría"}],ts="2.0";let zt=!1,Wt=!1,Yt=!1,At=!1,st=!1,$t=!1;async function Qr(e){var t,a,o,s,n,i,c,r,l,p,m;e.innerHTML=`
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
    </div>`,zt=!1,Wt=!1,Yt=!1,At=!1,st=!1,$t=!1,as(),Bt(),(t=$("#btn-backup-create"))==null||t.addEventListener("click",Xn),(a=$("#btn-backup-restore"))==null||a.addEventListener("click",()=>{var f;return(f=$("#backup-file-input"))==null?void 0:f.click()}),(o=$("#backup-file-input"))==null||o.addEventListener("change",ei),(s=$("#btn-mass-tx-template"))==null||s.addEventListener("click",ai),(n=$("#btn-mass-tx-open"))==null||n.addEventListener("click",oi),(i=$("#btn-mass-tp-template"))==null||i.addEventListener("click",ci),(c=$("#btn-mass-tp-open"))==null||c.addEventListener("click",ri),(r=$("#btn-mass-acc-template"))==null||r.addEventListener("click",os),(l=$("#btn-mass-acc-open"))==null||l.addEventListener("click",mi),(p=$("#btn-mass-ph-units-template"))==null||p.addEventListener("click",ss),(m=$("#btn-mass-ph-units-open"))==null||m.addEventListener("click",bi)}function as(){const e=localStorage.getItem("gravy_last_backup")||localStorage.getItem("contaco_last_backup");if(e)try{const t=JSON.parse(e),a=$("#backup-last-info"),o=$("#backup-last-text");a&&o&&(o.textContent=`Último respaldo: ${t.label} — ${t.records} registros`,a.classList.remove("hidden"))}catch{}}async function Bt(){const e=$("#sysinfo-content");if(!e)return;const t=await Promise.all(["accounts","third_parties","transactions","tx_lines"].map(async o=>{try{const s=await pb.list(o,{perPage:1,page:1});return{col:o,total:s.totalItems}}catch{return{col:o,total:"—"}}})),a={accounts:"Cuentas contables",third_parties:"Terceros",transactions:"Transacciones",tx_lines:"Líneas contables"};e.innerHTML=t.map(o=>`
    <div class="flex items-center justify-between py-2 border-b last:border-0" style="border-color:#F3F4F6">
      <span class="text-sm" style="color:#374151">${a[o.col]}</span>
      <span class="font-bold text-sm" style="color:#E87D1E">${typeof o.total=="number"?o.total.toLocaleString("es-CO"):o.total}</span>
    </div>
  `).join("")+`
    <div class="flex items-center justify-between pt-3 mt-1">
      <span class="text-xs" style="color:#9CA3AF">Versión GRAVY</span>
      <span class="badge badge-orange">v${ts}</span>
    </div>`}async function Xn(){var l;if(zt)return;zt=!0;const e=$("#btn-backup-create");e&&(e.disabled=!0,e.innerHTML='<i class="fas fa-spinner fa-spin"></i> Generando...');const t=$("#backup-progress-wrap"),a=$("#backup-progress-bar"),o=$("#backup-progress-label"),s=$("#backup-progress-pct");t&&t.classList.remove("hidden");const n=(p,m)=>{o&&(o.textContent=p),a&&(a.style.width=`${m}%`),s&&(s.textContent=`${Math.round(m)}%`)},i=Zn.filter(p=>!(p.name==="audit_log"&&!can("canViewAudit"))),c={_meta:{version:ts,created_at:new Date().toISOString(),app:"GRAVY",user:((l=pb.currentUser)==null?void 0:l.email)??"desconocido"},collections:{}};let r=0;try{for(let y=0;y<i.length;y++){const v=i[y],b=y/i.length*95;n(`Exportando: ${v.label}...`,b);try{const h=await pb.listAll(v.name);c.collections[v.name]=h,r+=h.length}catch(h){c.collections[v.name]=[],console.warn(`[Backup] Colección omitida (${v.name}):`,h.message)}}n("Generando archivo...",97);const p=JSON.stringify(c,null,2),m=new Blob([p],{type:"application/json"}),f=URL.createObjectURL(m),d=document.createElement("a"),g=new Date().toISOString().slice(0,16).replace("T","_").replace(":","-");d.href=f,d.download=`GRAVY_backup_${g}.json`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(f),n("Completado",100);const u=JSON.stringify({label:new Date().toLocaleString("es-CO",{dateStyle:"short",timeStyle:"short"}),records:r});localStorage.setItem("gravy_last_backup",u),as(),await API.logAudit("BACKUP_CREATED","sistema",null,`Respaldo manual: ${r} registros exportados`),showToast(`Respaldo creado exitosamente — ${r.toLocaleString("es-CO")} registros`,"success")}catch(p){showToast(`Error al generar respaldo: ${p.message}`,"error"),console.error("[Backup]",p)}finally{zt=!1,e&&(e.disabled=!1,e.innerHTML='<i class="fas fa-download"></i> Crear respaldo'),t&&setTimeout(()=>t==null?void 0:t.classList.add("hidden"),2e3)}}async function ei(e){var i,c;const t=(i=e.target.files)==null?void 0:i[0];if(!t)return;if(e.target.value="",!can("canWrite")||!can("canDelete")){showToast("No tienes permiso para restaurar un respaldo","error");return}let a;try{const r=await t.text();a=JSON.parse(r)}catch{showToast("El archivo no es un respaldo válido (JSON malformado)","error");return}if(!((c=a._meta)!=null&&c.version)||!a.collections){showToast("El archivo no corresponde a un respaldo de GRAVY","error");return}const o=a._meta,s=Object.keys(a.collections).length,n=Object.values(a.collections).reduce((r,l)=>r+((l==null?void 0:l.length)??0),0);Mt("Confirmar restauración",`
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
    </div>`,[{label:"Cancelar",class:"btn-outline",action:()=>closeModal()},{label:"Restaurar",class:"btn-danger",action:()=>ti(a)}])}async function ti(e){if(Wt)return;Wt=!0,closeModal(),showToast("Iniciando restauración...","info");const t=["settings","account_types","accounts","third_parties","transaction_types","transactions","tx_lines","bank_accounts","bank_movements","payroll_periods","payroll_employees","payroll_items"];let a=0,o=0,s=0;for(const i of t){const c=e.collections[i];if(!(!Array.isArray(c)||c.length===0))for(const r of c)try{try{await pb.update(i,r.id,r)}catch(l){if(l.status===404)await pb.create(i,r);else throw l}a++}catch(l){o++,l.status!==400&&s++,console.warn(`[Restore] ${i}/${r.id}:`,l.message)}}await API.logAudit("BACKUP_RESTORED","sistema",null,`Restauración desde respaldo: ${a} restaurados, ${o} omitidos`);const n=`Restauración completada — ${a} registros restaurados, ${o} omitidos`;showToast(n,s>10?"warning":"success"),Wt=!1,Bt()}function ai(){const e=["grupo","fecha","tipo","descripcion","tercero","plazo_dias","cuenta","debito","credito","tercero_linea","descripcion_linea","doc_cruce"].join(","),t=["CMP-001,2026-05-01,RC,Registro recaudo factura FV-1001,900123456,0,111005,1500000,0,900123456,Ingreso por recaudo,FV-1001","CMP-001,2026-05-01,RC,Registro recaudo factura FV-1001,900123456,0,130505,0,1500000,900123456,Cruce cartera cliente,FV-1001","CMP-002,2026-05-02,CE,Pago proveedor factura FC-888,901234567,30,220501,450000,0,901234567,Cruce CxP proveedor,FC-888","CMP-002,2026-05-02,CE,Pago proveedor factura FC-888,901234567,30,111005,0,450000,901234567,Salida de caja,FC-888"].join(`
`),a=new Blob([`${e}
${t}`],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_carga_transacciones.csv",s.click(),URL.revokeObjectURL(o)}async function oi(){if(!can("canWrite"))return showToast("No tienes permisos para importar transacciones","error");Mt('<i class="fas fa-file-import mr-2" style="color:#059669"></i>Carga masiva de transacciones',`
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
     <button class="btn btn-primary hidden" id="btn-mass-tx-run"><i class="fas fa-bolt mr-1"></i>Ejecutar carga</button>`,!0);let e=[];const t=$("#mass-tx-drop-zone"),a=$("#mass-tx-file-input"),o=$("#btn-mass-tx-run"),s=$("#btn-mass-tx-clear"),n=()=>{var p;e=[],(p=$("#mass-tx-preview"))==null||p.classList.add("hidden"),o==null||o.classList.add("hidden");const r=$("#mass-tx-preview-body");r&&(r.innerHTML="");const l=$("#mass-tx-summary");l&&(l.innerHTML=""),a&&(a.value="")},i=()=>{t&&(t.style.borderColor="#D1D5DB",t.style.background="#FAFAFA")};t==null||t.addEventListener("click",()=>a==null?void 0:a.click()),t==null||t.addEventListener("dragover",r=>{r.preventDefault(),t&&(t.style.borderColor="#1A4B8C",t.style.background="#EFF6FF")}),t==null||t.addEventListener("dragleave",()=>i()),t==null||t.addEventListener("drop",r=>{var p,m;r.preventDefault(),i();const l=(m=(p=r.dataTransfer)==null?void 0:p.files)==null?void 0:m[0];l&&c(l)}),a==null||a.addEventListener("change",()=>{var l;const r=(l=a.files)==null?void 0:l[0];r&&c(r)}),s==null||s.addEventListener("click",n),o==null||o.addEventListener("click",()=>ii(e));async function c(r){if(r.size>8*1024*1024)return showToast("El archivo supera el límite de 8 MB","error");const l=String(r.name.split(".").pop()||"").toLowerCase();let p=[];try{if(l==="csv")p=ra(await r.text());else if(l==="xlsx"||l==="xls")p=la(await r.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(m){return showToast(`Error al leer el archivo: ${m.message}`,"error")}if(!p.length)return showToast("El archivo no contiene datos","warning");e=await si(p),ni(e)}}function Va(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"_").trim()}function ra(e){const t=String(e||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).filter(s=>s.trim());if(!t.length)return[];const a=s=>{const n=[];let i="",c=!1;for(let r=0;r<s.length;r++){const l=s[r];if(l==='"'){c&&s[r+1]==='"'?(i+='"',r++):c=!c;continue}if(l===","&&!c){n.push(i.trim()),i="";continue}i+=l}return n.push(i.trim()),n},o=a(t[0]).map(Va);return t.slice(1).map(s=>{const n=a(s),i={};return o.forEach((c,r)=>{i[c]=String(n[r]??"").trim()}),i})}function la(e){const t=XLSX.read(e,{type:"array"}),a=t.Sheets[t.SheetNames[0]];return XLSX.utils.sheet_to_json(a,{defval:""}).map(s=>{const n={};return Object.entries(s).forEach(([i,c])=>{n[Va(i)]=String(c??"").trim()}),n})}function ge(e,t){for(const a of t){const o=e[a];if(o!==void 0&&String(o).trim()!=="")return String(o).trim()}return""}function Tt(e){return String(e||"").replace(/[^0-9a-z]/gi,"").toUpperCase()}function It(e){if(e==null||e==="")return 0;let t=String(e).trim();if(!t)return 0;t.includes(",")&&t.includes(".")?t=t.replace(/,/g,""):t.includes(",")&&!t.includes(".")&&(t=t.replace(/,/g,".")),t=t.replace(/[^0-9.\-]/g,"");const a=Number(t);return Number.isFinite(a)?a:0}async function si(e){var d;const[t,a,o]=await Promise.all([API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]),s=new Set(t.map(g=>g.parent_code).filter(Boolean)),n=new Set(t.filter(g=>!s.has(g.code)).map(g=>g.id)),i=new Map(t.map(g=>[String(g.code||"").trim(),g])),c=new Map;a.forEach(g=>{c.set(String(g.prefix||"").toUpperCase(),g),c.set(String(g.code||"").toUpperCase(),g),c.set(String(g.id||"").toUpperCase(),g)});const r=new Map;o.forEach(g=>{const u=Tt(g.doc_number);u&&r.set(u,g)});const l=new Map,p=(g,u,y,v,b)=>{if(y){if(!g[u]){g[u]=y;return}g[u]!==y&&g.errors.push(`Fila ${b}: valor inconsistente en ${v} ("${g[u]}" vs "${y}")`)}};for(let g=0;g<e.length;g++){const u=e[g]||{},y=g+2,v=ge(u,["grupo","tx_group","comprobante","grupo_tx"]);if(!v)continue;l.has(v)||l.set(v,{group:v,txDate:"",txType:"",txDesc:"",thirdDoc:"",paymentDays:"0",lines:[],errors:[]});const b=l.get(v);p(b,"txDate",ge(u,["fecha","date","tx_date"]),"fecha",y),p(b,"txType",ge(u,["tipo","tx_type","tipo_tx"]),"tipo",y),p(b,"txDesc",ge(u,["descripcion","description","detalle"]),"descripcion",y),p(b,"thirdDoc",ge(u,["tercero","tercero_doc","nit_tercero","doc_tercero"]),"tercero",y),p(b,"paymentDays",ge(u,["plazo_dias","payment_days","dias_pago"]),"plazo_dias",y);const h=ge(u,["cuenta","account","codigo_cuenta","account_code"]),_=It(ge(u,["debito","debit"])),A=It(ge(u,["credito","credit"])),C=ge(u,["tercero_linea","line_third","tercero_line"]),I=ge(u,["descripcion_linea","line_description","detalle_linea"]),N=ge(u,["doc_cruce","cross_doc_ref","documento_cruce"]);b.lines.push({rowNo:y,accountCode:h,debit:_,credit:A,lineThirdDoc:C,lineDesc:I,crossDoc:N})}const m=new Map,f=[];for(const g of l.values()){const u=[...g.errors];g.txDate||u.push("Falta fecha del comprobante"),g.txType||u.push("Falta tipo del comprobante"),g.txDesc||u.push("Falta descripción del comprobante");const y=c.get(String(g.txType||"").toUpperCase());y||u.push(`Tipo de transacción no encontrado: ${g.txType||"(vacío)"}`);let v=null;if(g.thirdDoc&&(v=r.get(Tt(g.thirdDoc)),v||u.push(`Tercero no encontrado (encabezado): ${g.thirdDoc}`)),g.txDate){const _=g.txDate.slice(0,7);if(!m.has(_)){let A=!1;typeof isPeriodClosed=="function"&&(A=await isPeriodClosed(g.txDate)),m.set(_,A)}m.get(_)&&u.push(`El período ${_} no está habilitado o está cerrado`)}const b=[];for(const _ of g.lines){const A=i.get(String(_.accountCode||"").trim());if(!_.accountCode){u.push(`Fila ${_.rowNo}: falta cuenta`);continue}if(!A){u.push(`Fila ${_.rowNo}: cuenta no encontrada (${_.accountCode})`);continue}n.has(A.id)||u.push(`Fila ${_.rowNo}: la cuenta ${A.code} es de mayor; usa una cuenta auxiliar`);const C=Number(_.debit||0)>0,I=Number(_.credit||0)>0;C&&I&&u.push(`Fila ${_.rowNo}: no puede tener débito y crédito al mismo tiempo`),!C&&!I&&u.push(`Fila ${_.rowNo}: debes registrar débito o crédito`);let N=null;_.lineThirdDoc&&(N=r.get(Tt(_.lineThirdDoc)),N||u.push(`Fila ${_.rowNo}: tercero de línea no encontrado (${_.lineThirdDoc})`)),A.requires_third_party&&!(N!=null&&N.id||v!=null&&v.id)&&u.push(`Fila ${_.rowNo}: la cuenta ${A.code} requiere tercero`),b.push({rowNo:_.rowNo,account_id:A.id,debit:Number(_.debit||0),credit:Number(_.credit||0),third_party_id:(N==null?void 0:N.id)||(v==null?void 0:v.id)||null,description:_.lineDesc||g.txDesc,cross_doc_ref:_.crossDoc||""})}const h=b.reduce((_,A)=>(_.debit+=Number(A.debit||0),_.credit+=Number(A.credit||0),_),{debit:0,credit:0});b.length<2&&u.push("Se requieren al menos 2 líneas contables válidas"),(Math.abs(h.debit-h.credit)>1e-4||h.debit<=0)&&u.push("Comprobante descuadrado: débito y crédito no coinciden"),f.push({group:g.group,txDate:g.txDate,txTypeLabel:y?`${y.prefix} - ${y.name}`:g.txType||"—",linesCount:b.length,debit:h.debit,credit:h.credit,ok:u.length===0,errors:u,payload:u.length?null:{txData:{tx_type_id:y.id,number:"",date:g.txDate,description:g.txDesc,third_party_id:(v==null?void 0:v.id)||null,user_id:(d=pb.currentUser)==null?void 0:d.id,payment_days:parseInt(g.paymentDays,10)||0,cross_enabled:b.some(_=>!!_.cross_doc_ref),status:"active"},lines:b.map((_,A)=>({account_id:_.account_id,third_party_id:_.third_party_id,debit:_.debit,credit:_.credit,description:_.description,line_order:A+1,cross_doc_ref:_.cross_doc_ref}))}})}return f.sort((g,u)=>String(g.group).localeCompare(String(u.group)))}function ni(e){const t=$("#mass-tx-preview"),a=$("#mass-tx-preview-body"),o=$("#mass-tx-summary"),s=$("#btn-mass-tx-run");if(!t||!a||!o||!s)return;const n=e.filter(c=>c.ok),i=e.filter(c=>!c.ok);a.innerHTML=e.map(c=>{const r=c.ok?"Validado":c.errors[0]||"Error de validación";return`
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
    </span>`,t.classList.remove("hidden"),n.length?s.classList.remove("hidden"):s.classList.add("hidden")}async function ii(e){if(Yt||!Array.isArray(e)||!e.length)return;const t=e.filter(l=>l.ok&&l.payload);if(!t.length)return showToast("No hay comprobantes válidos para importar","warning");Yt=!0;const a=$("#btn-mass-tx-run"),o=$("#mass-tx-progress-wrap"),s=$("#mass-tx-progress-bar"),n=$("#mass-tx-progress-text");a&&(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'),o==null||o.classList.remove("hidden");let i=0,c=0;const r=[];try{for(let l=0;l<t.length;l++){const p=t[l],m=l/t.length*100;s&&(s.style.width=`${m}%`),n&&(n.textContent=`Procesando ${l+1} de ${t.length}: ${p.group}`);try{await API.createTransaction(p.payload.txData,p.payload.lines),i++}catch(f){c++,r.push(`${p.group}: ${f.message}`)}}s&&(s.style.width="100%"),n&&(n.textContent="Proceso finalizado"),await API.logAudit("IMPORT","transactions","bulk",`Carga masiva: ${i} creadas, ${c} con error de ${t.length} comprobantes válidos`),r.length&&console.warn("[CargaMasivaTx] Errores:",r),showToast(`Carga masiva finalizada: ${i} comprobante(s) creados${c?`, ${c} con error`:""}`,c?"warning":"success",5500),Bt()}finally{Yt=!1,a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar carga')}}function ci(){const e=["doc_type","doc_number","person_type","type","razon_social","nombres","apellidos","email","phone","address","dept_code","city_code","tax_regime","credit_limit","payment_days","active"].join(","),t=["NIT,900123456,JURIDICA,CLIENTE,CERAMICAS CONSTRUHOGAR SAS,,,,3001234567,CR 8 73-25,68,68001,COMUN,5000000,30,Si","CC,1234567890,NATURAL,PROVEEDOR,,JUAN CARLOS,PEREZ GOMEZ,juan@correo.com,3109876543,CL 45 12-30,05,05001,NO_RESP,0,0,Si","NIT,800987654,JURIDICA,EMPLEADO,EMPRESA LOGISTICA SAS,,,,6012345678,AV 68 45-10,11,11001,COMUN,0,0,Si","CC,9876543210,NATURAL,ACREEDOR,,MARIA ELENA,RODRIGUEZ SILVA,,3201112233,KR 15 80-20,76,76001,,0,0,Si"].join(`
`),a=new Blob([`${e}
${t}`],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_carga_terceros.csv",s.click(),URL.revokeObjectURL(o)}async function ri(){if(!can("canWrite"))return showToast("No tienes permisos para importar terceros","error");Mt('<i class="fas fa-users mr-2" style="color:#1D4ED8"></i>Carga masiva de terceros',`
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
     <button class="btn btn-primary hidden" id="btn-mass-tp-run"><i class="fas fa-bolt mr-1"></i>Ejecutar carga</button>`,!0);let e=[];const t=$("#mass-tp-drop-zone"),a=$("#mass-tp-file-input"),o=$("#btn-mass-tp-run"),s=$("#btn-mass-tp-clear"),n=()=>{var p;e=[],(p=$("#mass-tp-preview"))==null||p.classList.add("hidden"),o==null||o.classList.add("hidden");const r=$("#mass-tp-preview-body");r&&(r.innerHTML="");const l=$("#mass-tp-summary");l&&(l.innerHTML=""),a&&(a.value="")},i=()=>{t&&(t.style.borderColor="#D1D5DB",t.style.background="#FAFAFA")};t==null||t.addEventListener("click",()=>a==null?void 0:a.click()),t==null||t.addEventListener("dragover",r=>{r.preventDefault(),t&&(t.style.borderColor="#1D4ED8",t.style.background="#EFF6FF")}),t==null||t.addEventListener("dragleave",()=>i()),t==null||t.addEventListener("drop",r=>{var p,m;r.preventDefault(),i();const l=(m=(p=r.dataTransfer)==null?void 0:p.files)==null?void 0:m[0];l&&c(l)}),a==null||a.addEventListener("change",()=>{var l;const r=(l=a.files)==null?void 0:l[0];r&&c(r)}),s==null||s.addEventListener("click",n),o==null||o.addEventListener("click",()=>pi(e));async function c(r){if(r.size>8*1024*1024)return showToast("El archivo supera el límite de 8 MB","error");const l=String(r.name.split(".").pop()||"").toLowerCase();let p=[];try{if(l==="csv")p=ra(await r.text());else if(l==="xlsx"||l==="xls")p=la(await r.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(m){return showToast(`Error al leer el archivo: ${m.message}`,"error")}if(!p.length)return showToast("El archivo no contiene datos","warning");e=li(p),di(e)}}function li(e){const t=new Set(["NIT","CC","CE","TI","PAS","RC"]),a=new Set(["NATURAL","JURIDICA","GRAN_CONTRIBUYENTE"]),o=new Set(["CLIENTE","PROVEEDOR","EMPLEADO","ACREEDOR","TRANSPORTISTA","OTRO"]);return e.map((s,n)=>{const i=n+2,c=(...B)=>{for(const M of B){const k=s[Va(M)];if(k!==void 0&&String(k).trim()!=="")return String(k).trim()}return""},r=c("doc_type","tipo_doc","tipo_documento").toUpperCase(),l=c("doc_number","numero_doc","nit","documento","doc").replace(/[^0-9a-zA-Z]/g,""),p=c("person_type","tipo_persona","persona").toUpperCase()||"NATURAL",m=c("type","tipo","rol").toUpperCase()||"CLIENTE",f=c("razon_social","business_name","razon").toUpperCase(),d=c("nombres","first_name","nombre").toUpperCase(),g=c("apellidos","last_name","apellido").toUpperCase(),u=p==="NATURAL",y=u?[d,g].filter(Boolean).join(" "):f,v=c("email","correo"),b=c("phone","telefono","tel"),h=c("address","direccion").toUpperCase(),_=c("dept_code","cod_dept","departamento_cod"),A=c("city_code","cod_mun","municipio_cod","ciudad_cod"),C=c("tax_regime","regimen","tax").toUpperCase(),I=parseFloat(c("credit_limit","cupo_credito","cupo").replace(/[^0-9.]/g,""))||0,N=parseInt(c("payment_days","plazo_dias","plazo"),10)||0,T=c("active","activo","estado").toLowerCase(),S=!/^(no|0|false|inactivo|inactiva)$/.test(T),w=r==="NIT"?calcDV(l):"";if(!r)return{ok:!1,rowNo:i,error:`Fila ${i}: falta doc_type`};if(!t.has(r))return{ok:!1,rowNo:i,error:`Fila ${i}: doc_type inválido (${r})`};if(!l)return{ok:!1,rowNo:i,error:`Fila ${i}: falta doc_number`};if(!a.has(p))return{ok:!1,rowNo:i,error:`Fila ${i}: person_type inválido (${p})`};if(!o.has(m))return{ok:!1,rowNo:i,error:`Fila ${i}: type inválido (${m})`};if(u&&!d&&!g)return{ok:!1,rowNo:i,error:`Fila ${i}: persona natural requiere nombres o apellidos`};if(!u&&!f)return{ok:!1,rowNo:i,error:`Fila ${i}: persona jurídica requiere razon_social`};if(!y)return{ok:!1,rowNo:i,error:`Fila ${i}: no se pudo determinar el nombre`};let E="",L="";if(_){const B=(typeof GEO_DEPTS<"u"?GEO_DEPTS:[]).find(M=>M.code===_);if(!B)return{ok:!1,rowNo:i,error:`Fila ${i}: dept_code "${_}" no encontrado`};if(E=B.name,A){const k=(typeof geoMunisByDept=="function"?geoMunisByDept(_):[]).find(j=>j.code===A);if(!k)return{ok:!1,rowNo:i,error:`Fila ${i}: city_code "${A}" no encontrado en dept ${_}`};L=k.name}}return{ok:!0,rowNo:i,docNumber:l,docType:r,name:y,personType:p,tpType:m,email:v,active:S,payload:{doc_type:r,doc_number:l,dv:w,person_type:p,type:m,first_name:d,last_name:g,business_name:f,commercial_name:"",name:y,email:v,email2:"",phone:b,phone2:"",contact_name:"",advisor:"",address:h,country:_?"CO":"",department:E,dept_code:_,city:L,city_code:A,tax_regime:C,credit_limit:I,max_invoices:1,payment_days:N,active:S}}})}function di(e){const t=$("#mass-tp-preview"),a=$("#mass-tp-preview-body"),o=$("#mass-tp-summary"),s=$("#btn-mass-tp-run");if(!t||!a||!o||!s)return;const n=e.filter(c=>c.ok),i=e.filter(c=>!c.ok);a.innerHTML=e.map(c=>c.ok?`<tr>
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
  </span>`,t.classList.remove("hidden"),n.length?s.classList.remove("hidden"):s.classList.add("hidden")}async function pi(e){if(At)return;const t=(e||[]).filter(m=>m.ok&&m.payload);if(!t.length)return showToast("No hay filas válidas para importar","warning");At=!0;const a=$("#btn-mass-tp-run"),o=$("#mass-tp-progress-wrap"),s=$("#mass-tp-progress-bar"),n=$("#mass-tp-progress-text");a&&(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'),o==null||o.classList.remove("hidden");let i=new Map;try{(await pb.listAll("third_parties",{})).forEach(f=>{const d=`${f.doc_type}|${String(f.doc_number||"").replace(/[^0-9a-zA-Z]/g,"")}`;i.set(d,f.id)})}catch(m){showToast(`Error al cargar terceros existentes: ${m.message}`,"error"),At=!1,a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar carga');return}let c=0,r=0,l=0;const p=[];try{for(let m=0;m<t.length;m++){const f=t[m],d=m/t.length*100;s&&(s.style.width=`${d}%`),n&&(n.textContent=`Procesando ${m+1} de ${t.length}: ${f.name}`);const g=`${f.payload.doc_type}|${f.payload.doc_number}`,u=i.get(g);try{if(u)await pb.update("third_parties",u,f.payload),r++;else{const y=await pb.create("third_parties",f.payload);i.set(g,y.id),c++}}catch(y){l++,p.push(`Fila ${f.rowNo} (${f.docNumber}): ${y.message}`)}}s&&(s.style.width="100%"),n&&(n.textContent="Proceso finalizado"),await API.logAudit("IMPORT","third_parties","bulk",`Carga masiva: ${c} creados, ${r} actualizados, ${l} con error`),p.length&&console.warn("[CargaMasivaTp] Errores:",p),showToast(`Carga completada: ${c} creados, ${r} actualizados${l?`, ${l} con error`:""}`,l?"warning":"success",5500),Bt()}finally{At=!1,a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar carga')}}function os(){const e="codigo,nombre,tipo,naturaleza,nivel,codigo_padre,requiere_tercero,activa",t=["1,ACTIVO,1,debit,1,,No,Si","11,DISPONIBLE,1,debit,2,1,,Si","1105,CAJA,1,debit,3,11,,Si","110505,Caja General,1,debit,4,1105,No,Si"].join(`
`),a=new Blob([e+`
`+t],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_plan_cuentas.csv",s.click(),URL.revokeObjectURL(o)}function ui(e,t){const a=(...v)=>{for(const b of v){const h=e[b];if(h!==void 0&&h!=="")return String(h).trim()}return""},o=a("codigo","code","cod","cuenta"),s=a("nombre","name","descripcion","description"),n=a("tipo","type","tipo_cuenta","account_type"),i=a("naturaleza","nature","nat"),c=a("nivel","level"),r=a("codigo_padre","parent_code","padre","parent"),l=a("requiere_tercero","requires_third_party","tercero","req_tercero"),p=a("activa","active","estado");if(!o)return{ok:!1,error:"Falta el código"};if(!/^\d+$/.test(o))return{ok:!1,error:`Código "${o}" no es numérico`};if(!s)return{ok:!1,error:"Falta el nombre"};if(!n)return{ok:!1,error:"Falta el tipo de cuenta"};const m=n.toLowerCase().trim(),f=t.find(v=>String(v.code).toLowerCase()===m||v.name.toLowerCase().includes(m));if(!f)return{ok:!1,error:`Tipo "${n}" no encontrado`};const d=/^(c|cr|credit|credito|crédito)$/i.test(i)?"credit":"debit",g=c?Math.max(1,parseInt(c,10)||1):o.length,u=/^(s[ií]|yes|1|true)$/i.test(l),y=!/^(no|0|false|inactiva|inactivo)$/i.test(p);return{ok:!0,payload:{code:o,name:s,account_type_id:f.id,nature:d,level:g,parent_code:r,requires_third_party:u,active:y,maneja_cruce:!1,maneja_retenciones:!1,tipos_retencion:""}}}async function mi(){var i,c,r;if(!can("canWrite"))return showToast("No tienes permisos para importar cuentas","error");if(st)return showToast("Importación en curso, espera...","warning");const e=await pb.listAll("account_types",{sort:"code"});Mt('<i class="fas fa-list-tree mr-2" style="color:#6D28D9"></i>Importar Plan de Cuentas',`
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
     <button class="btn btn-primary hidden" id="btn-mass-acc-run"><i class="fas fa-bolt mr-1"></i>Ejecutar importación</button>`,!0);let t=[];const a=document.getElementById("mass-acc-drop"),o=document.getElementById("mass-acc-file-input");(i=document.getElementById("btn-mass-acc-dl-tmpl"))==null||i.addEventListener("click",os),a==null||a.addEventListener("click",()=>o==null?void 0:o.click()),a==null||a.addEventListener("dragover",l=>{l.preventDefault(),a.style.borderColor="#6D28D9",a.style.background="#F5F3FF"}),a==null||a.addEventListener("dragleave",()=>{a.style.borderColor="#D1D5DB",a.style.background="#FAFAFA"}),a==null||a.addEventListener("drop",l=>{var m,f;l.preventDefault(),a.style.borderColor="#D1D5DB",a.style.background="#FAFAFA";const p=(f=(m=l.dataTransfer)==null?void 0:m.files)==null?void 0:f[0];p&&s(p)}),o==null||o.addEventListener("change",()=>{var l;(l=o.files)!=null&&l[0]&&s(o.files[0])}),(c=document.getElementById("btn-mass-acc-clear"))==null||c.addEventListener("click",()=>{var l,p;t=[],(l=document.getElementById("mass-acc-preview"))==null||l.classList.add("hidden"),(p=document.getElementById("btn-mass-acc-run"))==null||p.classList.add("hidden"),o&&(o.value="")});async function s(l){if(l.size>5*1024*1024)return showToast("El archivo supera 5 MB","error");const p=l.name.split(".").pop().toLowerCase();let m=[];try{if(p==="csv")m=ra(await l.text());else if(p==="xlsx"||p==="xls")m=la(await l.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(f){return showToast("Error al leer el archivo: "+f.message,"error")}if(!m.length)return showToast("El archivo no contiene filas de datos","warning");t=m.map((f,d)=>({idx:d+1,...ui(f,e)})),n(t)}function n(l){const p=document.getElementById("mass-acc-preview-body"),m=document.getElementById("mass-acc-count"),f=document.getElementById("mass-acc-summary"),d=document.getElementById("btn-mass-acc-run"),g=document.getElementById("mass-acc-preview"),u=l.filter(v=>v.ok),y=l.filter(v=>!v.ok);m.textContent=`${l.length} fila(s) — ${u.length} válidas, ${y.length} con error`,p.innerHTML=l.map((v,b)=>{var h;if(v.ok){const _=v.payload,A=((h=e.find(C=>C.id===_.account_type_id))==null?void 0:h.name)??"?";return`<tr>
          <td>${b+1}</td>
          <td><span class="font-semibold" style="color:#6D28D9">${esc(_.code)}</span></td>
          <td>${esc(_.name)}</td>
          <td class="text-xs">${esc(A)}</td>
          <td>${_.nature==="debit"?"Db":"Cr"}</td>
          <td>${_.level}</td>
          <td>${esc(_.parent_code||"—")}</td>
          <td><span class="badge badge-green">OK</span></td>
        </tr>`}return`<tr style="background:#FFF7F7">
        <td>${b+1}</td>
        <td colspan="6" class="text-xs" style="color:#EF4444">${esc(v.error)}</td>
        <td><span class="badge badge-red">Error</span></td>
      </tr>`}).join(""),f.innerHTML=y.length?`<span style="color:#EF4444"><i class="fas fa-triangle-exclamation mr-1"></i>${y.length} fila(s) con error serán omitidas.</span>`:'<span style="color:#22C55E"><i class="fas fa-circle-check mr-1"></i>Todas las filas son válidas.</span>',g.classList.remove("hidden"),u.length?d==null||d.classList.remove("hidden"):d==null||d.classList.add("hidden")}(r=document.getElementById("btn-mass-acc-run"))==null||r.addEventListener("click",async()=>{const l=t.filter(y=>y.ok);if(!l.length||st)return;st=!0;const p=document.getElementById("btn-mass-acc-run");p&&(p.disabled=!0,p.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...');let m={};try{(await pb.listAll("accounts",{})).forEach(v=>{m[v.code]=v.id})}catch(y){showToast("Error al cargar cuentas: "+y.message,"error"),st=!1,p&&(p.disabled=!1,p.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar importación');return}let f=0,d=0,g=0;for(const y of l)try{if(m[y.payload.code])await pb.update("accounts",m[y.payload.code],y.payload),d++;else{const v=await pb.create("accounts",y.payload);m[y.payload.code]=v.id,f++}}catch{g++}await API.logAudit("IMPORT","Cuenta","bulk",`${f} creadas, ${d} actualizadas, ${g} errores`),Bt(),closeModal();let u=`Importación completada: ${f} creadas, ${d} actualizadas.`;g&&(u+=` ${g} con error.`),showToast(u,g?"warning":"success",5e3),st=!1})}function ss(){const e=["codigo","nombre","tipo","torre","apartamento","coef_participacion","cuota_admin","area_m2","doc_propietario","tipo_doc_propietario","activo","notas"].join(","),t=["101,Apartamento 101,APARTAMENTO,Torre 1,101,2.1500,0,68.50,900123456,CC,Si,Unidad principal","P-12,Parqueadero 12,PARQUEADERO,Torre 1,P-12,0.3200,0,12.00,900123456,CC,Si,Parqueadero cubierto","D-03,Deposito 03,DEPOSITO,Torre 1,D-03,0.1500,0,5.20,900123456,CC,Si,"].join(`
`),a=new Blob([e+`
`+t],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_unidades_copropiedades.csv",s.click(),URL.revokeObjectURL(o)}function fi(e,t,a){var h,_;const o=ge(e,["codigo","code","unidad","unit_code"]),s=ge(e,["nombre","name","descripcion"]),n=ge(e,["tipo","unit_type","tipo_unidad"])||"APARTAMENTO",i=ge(e,["torre","tower"]),c=ge(e,["apartamento","apto","apartment"]),r=It(ge(e,["coef_participacion","coef","coeficiente"])),l=It(ge(e,["cuota_admin","admin_fee","cuota_administracion"])),p=It(ge(e,["area_m2","area"])),m=ge(e,["doc_propietario","owner_doc","documento_propietario"]),f=ge(e,["tipo_doc_propietario","owner_doc_type","doc_type_propietario"]).toUpperCase(),d=ge(e,["activo","active","estado"]),g=ge(e,["notas","nota","notes"]);if(!o)return{ok:!1,error:"Falta el código de la unidad"};if(!s)return{ok:!1,error:`Falta el nombre para la unidad ${o}`};const u=new Set(["APARTAMENTO","PARQUEADERO","DEPOSITO","LOCAL","CASA","OFICINA","OTRO"]),y=String(n).toUpperCase();if(!u.has(y))return{ok:!1,error:`Tipo inválido en ${o}: ${n}`};if(r<0||r>100)return{ok:!1,error:`Coeficiente fuera de rango (0-100) en ${o}`};if(l<0)return{ok:!1,error:`Cuota administración negativa en ${o}`};if(p<0)return{ok:!1,error:`Área negativa en ${o}`};let v=null;if(m){const A=Tt(m);if(f&&(v=((h=a.get(`${f}|${A}`))==null?void 0:h.id)||null),v||(v=((_=t.get(A))==null?void 0:_.id)||null),!v)return{ok:!1,error:`No existe tercero propietario con documento ${m}`}}const b=!/^(no|0|false|inactiva|inactivo)$/i.test(d);return{ok:!0,payload:{code:o,name:s,unit_type:y,tower:i,apartment:c,coef_participacion:r,admin_fee:l,area_m2:p,owner_id:v,notes:g,active:b}}}async function bi(){var p,m,f;if(!can("canWrite"))return showToast("No tienes permisos para importar unidades","error");if($t)return showToast("Importación en curso, espera...","warning");Mt('<i class="fas fa-building-user mr-2" style="color:#0E7490"></i>Importar Unidades Copropiedades',`
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
     <button class="btn btn-primary hidden" id="btn-mass-ph-units-run"><i class="fas fa-bolt mr-1"></i>Ejecutar importación</button>`,!0);let e=[];const[t,a]=await Promise.all([API.getTerceros({}),pb.listAll("ph_properties",{sort:"code"})]),o=new Map,s=new Map;t.forEach(d=>{const g=Tt(d.doc_number);if(!g)return;o.has(g)||o.set(g,d);const u=`${String(d.doc_type||"").toUpperCase()}|${g}`;s.has(u)||s.set(u,d)});const n=new Map(a.map(d=>[String(d.code||"").trim().toUpperCase(),d])),i=document.getElementById("mass-ph-units-drop"),c=document.getElementById("mass-ph-units-file-input");(p=document.getElementById("btn-mass-ph-units-dl-tmpl"))==null||p.addEventListener("click",ss),i==null||i.addEventListener("click",()=>c==null?void 0:c.click()),i==null||i.addEventListener("dragover",d=>{d.preventDefault(),i.style.borderColor="#0E7490",i.style.background="#ECFEFF"}),i==null||i.addEventListener("dragleave",()=>{i.style.borderColor="#D1D5DB",i.style.background="#FAFAFA"}),i==null||i.addEventListener("drop",d=>{var u,y;d.preventDefault(),i.style.borderColor="#D1D5DB",i.style.background="#FAFAFA";const g=(y=(u=d.dataTransfer)==null?void 0:u.files)==null?void 0:y[0];g&&r(g)}),c==null||c.addEventListener("change",()=>{var g;const d=(g=c.files)==null?void 0:g[0];d&&r(d)}),(m=document.getElementById("btn-mass-ph-units-clear"))==null||m.addEventListener("click",()=>{var d,g;e=[],(d=document.getElementById("mass-ph-units-preview"))==null||d.classList.add("hidden"),(g=document.getElementById("btn-mass-ph-units-run"))==null||g.classList.add("hidden"),c&&(c.value="")});async function r(d){if(d.size>5*1024*1024)return showToast("El archivo supera 5 MB","error");const g=d.name.split(".").pop().toLowerCase();let u=[];try{if(g==="csv")u=ra(await d.text());else if(g==="xlsx"||g==="xls")u=la(await d.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(y){return showToast("Error al leer el archivo: "+y.message,"error")}if(!u.length)return showToast("El archivo no contiene filas de datos","warning");e=u.map((y,v)=>{var A;const b=fi(y,o,s);if(!b.ok)return{idx:v+1,...b};const h=String(b.payload.code||"").trim().toUpperCase(),_=n.get(h);return{idx:v+1,ok:!0,mode:_?"update":"create",existingId:(_==null?void 0:_.id)||null,ownerName:b.payload.owner_id&&((A=t.find(C=>C.id===b.payload.owner_id))==null?void 0:A.name)||"—",payload:b.payload}}),l(e)}function l(d){const g=document.getElementById("mass-ph-units-preview-body"),u=document.getElementById("mass-ph-units-count"),y=document.getElementById("mass-ph-units-summary"),v=document.getElementById("btn-mass-ph-units-run"),b=document.getElementById("mass-ph-units-preview"),h=d.filter(A=>A.ok),_=d.filter(A=>!A.ok);u.textContent=`${d.length} fila(s) — ${h.length} válidas, ${_.length} con error`,g.innerHTML=d.map(A=>{if(!A.ok)return`<tr style="background:#FFF7F7">
          <td>${A.idx}</td>
          <td colspan="6" class="text-xs" style="color:#EF4444">${esc(A.error||"Fila inválida")}</td>
          <td><span class="badge badge-red">Error</span></td>
        </tr>`;const C=A.payload,I=A.mode==="update"?'<span class="badge badge-orange">Actualizar</span>':'<span class="badge badge-blue">Crear</span>';return`<tr>
        <td>${A.idx}</td>
        <td><span class="font-semibold" style="color:#0E7490">${esc(C.code)}</span></td>
        <td>${esc(C.name)}</td>
        <td>${esc(C.unit_type||"—")}</td>
        <td>${esc(C.apartment||"—")}</td>
        <td>${esc(A.ownerName||"—")}</td>
        <td>${I}</td>
        <td><span class="badge badge-green">OK</span></td>
      </tr>`}).join(""),y.innerHTML=_.length?`<span style="color:#EF4444"><i class="fas fa-triangle-exclamation mr-1"></i>${_.length} fila(s) con error serán omitidas.</span>`:'<span style="color:#22C55E"><i class="fas fa-circle-check mr-1"></i>Todas las filas son válidas.</span>',b.classList.remove("hidden"),h.length?v==null||v.classList.remove("hidden"):v==null||v.classList.add("hidden")}(f=document.getElementById("btn-mass-ph-units-run"))==null||f.addEventListener("click",async()=>{const d=e.filter(h=>h.ok);if(!d.length||$t)return;$t=!0;const g=document.getElementById("btn-mass-ph-units-run");g&&(g.disabled=!0,g.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...');let u=0,y=0,v=0;const b=[];try{for(const h of d)try{if(h.mode==="update"&&h.existingId)await pb.update("ph_properties",h.existingId,h.payload),y++;else{const _=await pb.create("ph_properties",h.payload);h.existingId=_.id,u++}}catch(_){v++,b.push({code:h.payload.code,error:_.message||"Error desconocido"})}await API.logAudit("IMPORT","PhProperty","bulk",`Carga masiva unidades PH: ${u} creadas, ${y} actualizadas, ${v} con error`),b.length&&console.warn("[CargaMasivaPhUnits] Errores:",b),closeModal(),showToast(`Carga completada: ${u} creadas, ${y} actualizadas${v?`, ${v} con error`:""}`,v?"warning":"success",5500)}finally{$t=!1,g&&(g.disabled=!1,g.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar importación')}})}function Mt(e,t,a=[],o=!1){const s=$("#modal-title"),n=$("#modal-body"),i=$("#modal-footer"),c=$("#modal-box"),r=$("#modal-overlay");s&&(s.innerHTML=e),n&&(n.innerHTML=t),i&&(i.innerHTML="",typeof a=="string"?i.innerHTML=a:(Array.isArray(a)?a:a&&typeof a=="object"?[a]:[]).forEach(({label:p,class:m,action:f})=>{if(typeof f!="function")return;const d=document.createElement("button");d.className=`btn ${m||"btn-outline"}`,d.textContent=p||"Aceptar",d.addEventListener("click",f),i.appendChild(d)})),c==null||c.classList.toggle("wide",!!o),r==null||r.classList.add("show")}window._loadLastBackupInfo=as;window.renderUtilidades=Qr;window._executeMassTxImport=ii;window._handleCreateBackup=Xn;window._massTxNormHeader=Va;window._massTxParseCsv=ra;window._massTxParseExcel=la;window._openMassTxImportModal=oi;window.BACKUP_VERSION=ts;window._massTxImportInProgress=Yt;window._massTxDocKey=Tt;window._openMassAccImportModal=mi;window._massTpBuildDraft=li;window._massPhUnitsImportInProgress=$t;window._downloadMassTpTemplate=ci;window._downloadMassTxTemplate=ai;window._massTpImportInProgress=At;window.BACKUP_COLLECTIONS=Zn;window._massTxNum=It;window._downloadMassPhUnitsTemplate=ss;window._massTxPick=ge;window._openMassTpImportModal=ri;window.openModal=Mt;window._massPhUnitsNormalizeRow=fi;window._massAccImportInProgress=st;window._handleRestoreFileSelected=ei;window._restoreInProgress=Wt;window._massAccNormalizeRow=ui;window._openMassPhUnitsImportModal=bi;window._downloadMassAccTemplate=os;window._doRestore=ti;window._backupInProgress=zt;window._massTpRenderPreview=di;window._massTxRenderPreview=ni;window._massTxBuildDraft=si;window._loadSysInfo=Bt;window._executeMassTpImport=pi;const ja=[{value:"BIEN",label:"Bien (producto físico)"},{value:"SERVICIO",label:"Servicio"}],gi=["UND","KG","GR","LT","ML","MT","CM","M2","M3","CJ","BL","GL","PAR","HORA","DIA","MES","SVC"],Ha=[{value:0,label:"0% — Excluido / Exento"},{value:5,label:"5% — Tarifa diferencial"},{value:19,label:"19% — Tarifa general"}];function it(e){const t=String(e??"").trim();if(!t)return null;const a=Number(t);return Number.isFinite(a)?a:null}function uo(e){const t=[];return e.peso!==null&&t.push(`Peso: ${fmtN(e.peso)}`),e.cajas_en_pallet!==null&&t.push(`Cajas/Pallet: ${fmtN(e.cajas_en_pallet)}`),e.und_empaque!==null&&t.push(`UndEmpaque: ${fmtN(e.und_empaque)}`),e.peso_x_und_empaque!==null&&t.push(`Peso x UndEmpaque: ${fmtN(e.peso_x_und_empaque)}`),t.length?t.join(" | "):"Sin condiciones especiales registradas"}function vi(e,t){var i,c,r;const a="special-conditions-overlay",o=document.getElementById(a);o&&o.remove();const s=document.createElement("div");s.id=a,s.className="modal-overlay show",s.style.zIndex="200",s.innerHTML=`
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
    </div>`;const n=()=>s.remove();document.body.appendChild(s),(i=s.querySelector("#sc-close-btn"))==null||i.addEventListener("click",n),(c=s.querySelector("#sc-cancel-btn"))==null||c.addEventListener("click",n),s.addEventListener("click",l=>{l.target===s&&n()}),(r=s.querySelector("#sc-apply-btn"))==null||r.addEventListener("click",()=>{t({peso:it(getInputVal("sc-peso")),cajas_en_pallet:it(getInputVal("sc-cajas-en-pallet")),und_empaque:it(getInputVal("sc-und-empaque")),peso_x_und_empaque:it(getInputVal("sc-peso-x-und-empaque"))}),n()})}async function ns(){try{const e=await API.getSetting("product_catalog_v1");if(e){const t=JSON.parse(e);return{categories:Array.isArray(t.categories)?t.categories:[],lines:Array.isArray(t.lines)?t.lines:[]}}}catch{}return{categories:[],lines:[]}}async function hi(e){await API.setSetting("product_catalog_v1",JSON.stringify(e))}function is(e,t){var f,d,g,u,y,v,b;const a="catalog-manager-overlay",o=document.getElementById(a);o&&o.remove();const s={categories:[...e.categories||[]],lines:[...e.lines||[]]};function n(h,_){return h.length?h.map((A,C)=>`
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
    </div>`;const c=()=>i.remove();document.body.appendChild(i);function r(){i.querySelector("#cm-cat-list").innerHTML=n(s.categories,"categories"),i.querySelector("#cm-line-list").innerHTML=n(s.lines,"lines"),l()}function l(){i.querySelectorAll(".cm-del").forEach(h=>{h.addEventListener("click",()=>{s[h.dataset.ltype].splice(Number(h.dataset.idx),1),r()})})}l(),(f=i.querySelector("#cm-close-btn"))==null||f.addEventListener("click",c),(d=i.querySelector("#cm-cancel-btn"))==null||d.addEventListener("click",c),i.addEventListener("click",h=>{h.target===i&&c()});const p=()=>{const h=i.querySelector("#cm-new-cat"),_=((h==null?void 0:h.value)||"").trim();if(_){if(s.categories.includes(_)){showToast("Ya existe esa categoría","warning");return}s.categories.push(_),h.value="",r()}};(g=i.querySelector("#cm-add-cat-btn"))==null||g.addEventListener("click",p),(u=i.querySelector("#cm-new-cat"))==null||u.addEventListener("keydown",h=>{h.key==="Enter"&&(h.preventDefault(),p())});const m=()=>{const h=i.querySelector("#cm-new-line"),_=((h==null?void 0:h.value)||"").trim();if(_){if(s.lines.includes(_)){showToast("Ya existe esa línea","warning");return}s.lines.push(_),h.value="",r()}};(y=i.querySelector("#cm-add-line-btn"))==null||y.addEventListener("click",m),(v=i.querySelector("#cm-new-line"))==null||v.addEventListener("keydown",h=>{h.key==="Enter"&&(h.preventDefault(),m())}),(b=i.querySelector("#cm-save-btn"))==null||b.addEventListener("click",async()=>{const h=i.querySelector("#cm-save-btn");h&&(h.disabled=!0,h.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{await hi(s),showToast("Catálogo guardado","success"),t({categories:[...s.categories],lines:[...s.lines]}),c()}catch(_){showToast(_.message||"No se pudo guardar","error")}finally{h&&(h.disabled=!1,h.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar')}})}async function da(e){var t,a,o,s,n,i,c,r;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando productos...</div>';try{const[l,p,m]=await Promise.all([API.getProducts({activeOnly:!1}),API.getAccounts(!1),ns()]),f=l.filter(b=>b.active).length,d=l.filter(b=>b.type==="BIEN").length,g=l.filter(b=>b.type==="SERVICIO").length,u=[...new Set(l.map(b=>b.categoria).filter(Boolean))].sort(),y=[...new Set(l.map(b=>b.linea).filter(Boolean))].sort();e.innerHTML=`
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
        ${Ut("Activos",f,"fas fa-circle-check","#059669","#ECFDF5")}
        ${Ut("Bienes",d,"fas fa-boxes-stacked","#C46516","#FFF8F0")}
        ${Ut("Servicios",g,"fas fa-handshake","#7C3AED","#F5F3FF")}
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap gap-3">
          <input id="prod-q" class="form-input flex-1 min-w-48" placeholder="Buscar por código o nombre...">
          <select id="prod-type" class="form-input" style="max-width:200px">
            <option value="">Todos los tipos</option>
            ${ja.map(b=>`<option value="${b.value}">${b.label}</option>`).join("")}
          </select>
          <select id="prod-iva" class="form-input" style="max-width:180px">
            <option value="">Todas las tarifas IVA</option>
            ${Ha.map(b=>`<option value="${b.value}">${b.value}%</option>`).join("")}
          </select>
          <select id="prod-categoria" class="form-input" style="max-width:180px">
            <option value="">Todas las categorías</option>
            ${u.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join("")}
          </select>
          <select id="prod-linea" class="form-input" style="max-width:160px">
            <option value="">Todas las líneas</option>
            ${y.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join("")}
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
              ${l.length?yi(l):_i(10)}
            </tbody>
          </table>
        </div>
      </div>`;const v=()=>xi();(t=$("#prod-q"))==null||t.addEventListener("input",debounce(v,150)),(a=$("#prod-type"))==null||a.addEventListener("change",v),(o=$("#prod-categoria"))==null||o.addEventListener("change",v),(s=$("#prod-linea"))==null||s.addEventListener("change",v),(n=$("#prod-iva"))==null||n.addEventListener("change",v),(i=$("#prod-status"))==null||i.addEventListener("change",v),(c=$("#btn-new-product"))==null||c.addEventListener("click",()=>cs(null,p,m)),(r=$("#btn-catalog-manager"))==null||r.addEventListener("click",()=>{is(m,b=>{Object.assign(m,b),da($("#page-content"))})})}catch(l){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(l.message)}</div>`}}function Ut(e,t,a,o,s){return`<div class="rounded-2xl p-4" style="background:${s};border:1px solid ${s}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${a} text-sm" style="color:${o}"></i>
      <span class="text-xs font-semibold" style="color:${o}">${e}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${o}">${fmtN(t)}</p>
  </div>`}function yi(e){return e.map(t=>{var s;const a=t.type==="BIEN"?'<span class="badge badge-blue">Bien</span>':'<span class="badge" style="background:#F5F3FF;color:#7C3AED">Servicio</span>',o=t.active?'<span class="badge badge-green">Activo</span>':'<span class="badge badge-gray">Inactivo</span>';return(s=t.expand)==null||s.income_account_id,`<tr data-type="${esc(t.type)}" data-iva="${t.iva_rate??""}" data-active="${t.active}" data-categoria="${esc(t.categoria||"")}" data-linea="${esc(t.linea||"")}">
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
    </tr>`}).join("")}function _i(e){return`<tr><td colspan="${e}" class="text-center py-10" style="color:#9CA3AF">
    <i class="fas fa-box-open mr-2"></i>No hay productos registrados.
  </td></tr>`}function xi(){const e=(getInputVal("prod-q")||"").toLowerCase(),t=getSelectVal("prod-type"),a=getSelectVal("prod-categoria"),o=getSelectVal("prod-linea"),s=getSelectVal("prod-iva"),n=getSelectVal("prod-status");$$("#prod-table tbody tr[data-type]").forEach(i=>{const c=i.textContent.toLowerCase(),r=!e||c.includes(e),l=!t||i.dataset.type===t,p=!a||i.dataset.categoria===a,m=!o||i.dataset.linea===o,f=!s||i.dataset.iva===s,d=!n||i.dataset.active===n;i.style.display=r&&l&&p&&m&&f&&d?"":"none"})}async function Zr(e){var t,a,o,s,n;try{const i=await pb.get("products",e,{expand:"income_account_id,cost_account_id,inventory_account_id"}),c=((t=ja.find(f=>f.value===i.type))==null?void 0:t.label)||i.type,r=((a=Ha.find(f=>f.value===i.iva_rate))==null?void 0:a.label)||`${i.iva_rate}%`,l=(o=i.expand)==null?void 0:o.income_account_id,p=(s=i.expand)==null?void 0:s.cost_account_id,m=(n=i.expand)==null?void 0:n.inventory_account_id;openModal(`Producto — ${esc(i.code)}`,`<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
              <p class="font-mono text-xs">${m?esc(`${m.code} — ${m.name}`):"—"}</p></div>
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
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!1)}catch(i){showToast(i.message,"error")}}async function cs(e=null,t=null,a={}){var n,i,c;t||(t=await API.getAccounts(!1).catch(()=>[]));const o=(r="")=>`<option value="">— Sin asignar —</option>${t.filter(p=>p.active&&Number(p.level)>=3).sort((p,m)=>p.code.localeCompare(m.code)).map(p=>`<option value="${esc(p.id)}" ${p.id===r?"selected":""}>${esc(p.code)} — ${esc(p.name)}</option>`).join("")}`,s={peso:(e==null?void 0:e.peso)??null,cajas_en_pallet:(e==null?void 0:e.cajas_en_pallet)??null,und_empaque:(e==null?void 0:e.und_empaque)??null,peso_x_und_empaque:(e==null?void 0:e.peso_x_und_empaque)??null};openModal(e?`Editar — ${esc(e.code)}`:"Nuevo Producto / Servicio",`<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          ${gi.map(r=>`<option value="${r}" ${(e==null?void 0:e.unit)===r?"selected":""}>${r}</option>`).join("")}
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
     <button class="btn btn-primary" id="btn-save-product"><i class="fas fa-floppy-disk"></i> Guardar</button>`,!0),(n=$("#btn-save-product"))==null||n.addEventListener("click",async()=>{var l;const r=$("#btn-save-product");r&&(r.disabled=!0,r.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const p=getInputVal("pf-code").trim().toUpperCase(),m=getInputVal("pf-name").trim();if(!p)return showToast("El código es obligatorio","warning");if(!m)return showToast("El nombre es obligatorio","warning");if(!(e!=null&&e.id)){const d=pb.escapeFilterValue(p);if((await pb.list("products",{filter:`code="${d}"`,perPage:1})).items.length)return showToast(`Ya existe un producto con el código ${p}`,"warning")}const f={code:p,name:m,description:getInputVal("pf-desc").trim(),type:getSelectVal("pf-type"),unit:getSelectVal("pf-unit"),presentacion:getInputVal("pf-presentacion").trim(),categoria:getInputVal("pf-categoria").trim(),linea:getInputVal("pf-linea").trim(),iva_rate:Number(getSelectVal("pf-iva")||0),base_price:parseFloat(getInputVal("pf-base-price")||"0")||0,precio_venta_2:it(getInputVal("pf-sale-price-2")),precio_venta_3:it(getInputVal("pf-sale-price-3")),cost_price:parseFloat(getInputVal("pf-cost-price")||"0")||0,active:getSelectVal("pf-active")==="true",unspsc_code:getInputVal("pf-unspsc").trim(),ean_code:getInputVal("pf-ean").trim(),peso:s.peso,cajas_en_pallet:s.cajas_en_pallet,und_empaque:s.und_empaque,peso_x_und_empaque:s.peso_x_und_empaque,income_account_id:getSelectVal("pf-income-acct")||null,cost_account_id:getSelectVal("pf-cost-acct")||null,inventory_account_id:getSelectVal("pf-inv-acct")||null};if(e!=null&&e.id)await pb.update("products",e.id,f),await API.logAudit("UPDATE","Producto",e.id,`${f.code} — ${f.name}`),showToast("Producto actualizado","success");else{const d=await pb.create("products",f);await API.logAudit("CREATE","Producto",d.id,`${f.code} — ${f.name}`),showToast("Producto creado","success")}closeModal(),da($("#page-content"))}catch(p){const m=(l=p==null?void 0:p.data)!=null&&l.data?Object.values(p.data.data).map(f=>f==null?void 0:f.message).filter(Boolean).join(" | "):"";showToast(m||p.message||"No se pudo guardar","error")}finally{r&&(r.disabled=!1,r.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar')}}),(i=$("#btn-special-conditions"))==null||i.addEventListener("click",()=>{vi(s,r=>{Object.assign(s,r);const l=$("#pf-special-summary");l&&(l.textContent=uo(s))})}),(c=$("#btn-catalog-form"))==null||c.addEventListener("click",()=>{is(a,r=>{Object.assign(a,r);const l=document.getElementById("dl-categorias"),p=document.getElementById("dl-lineas");l&&(l.innerHTML=a.categories.map(m=>`<option value="${esc(m)}">`).join("")),p&&(p.innerHTML=a.lines.map(m=>`<option value="${esc(m)}">`).join(""))})})}async function Xr(e){try{const[t,a,o]=await Promise.all([pb.get("products",e),API.getAccounts(!1),ns()]);cs(t,a,o)}catch(t){showToast(t.message,"error")}}async function el(e,t){try{const a=await pb.update("products",e,{active:t});await API.logAudit("STATUS","Producto",e,`${a.code} → ${t?"Activo":"Inactivo"}`),showToast(`Producto ${t?"activado":"desactivado"}`,"success"),da($("#page-content"))}catch(a){showToast(a.message,"error")}}function tl(e,t){confirmDialog("Eliminar producto",`¿Confirmas eliminar <strong>${esc(t)}</strong>?<br><small style="color:#6B7280">Esta acción no se puede deshacer. Si el producto está referenciado en documentos, considera desactivarlo en lugar de eliminarlo.</small>`,async()=>{try{await pb.delete("products",e),await API.logAudit("DELETE","Producto",e,`Eliminado: ${t}`),showToast("Producto eliminado","success"),da($("#page-content"))}catch(a){showToast(a.message,"error")}})}window.openProductForm=cs;window.PRODUCT_TYPES=ja;window.toNullableNumber=it;window.toggleProductStatus=el;window.viewProductDetail=Zr;window.saveProductCatalog=hi;window.IVA_RATES=Ha;window.emptyRow=_i;window.deleteProduct=tl;window.openCatalogManagerModal=is;window.renderProductos=da;window.PRODUCT_UNITS=gi;window.editProduct=Xr;window.filterProductTable=xi;window.renderProductRows=yi;window.openSpecialConditionsModal=vi;window.kpiCard=Ut;window.specialConditionsSummary=uo;window.loadProductCatalog=ns;const pa=[{value:"ENTRADA",label:"Entrada",icon:"fa-arrow-down",color:"#059669"},{value:"SALIDA",label:"Salida",icon:"fa-arrow-up",color:"#DC2626"},{value:"TRASLADO",label:"Traslado",icon:"fa-right-left",color:"#1A4B8C"},{value:"AJUSTE_POSITIVO",label:"Ajuste +",icon:"fa-plus-circle",color:"#059669"},{value:"AJUSTE_NEGATIVO",label:"Ajuste −",icon:"fa-minus-circle",color:"#C46516"}],rs={draft:{label:"Borrador",badge:"badge-gray"},applied:{label:"Aplicado",badge:"badge-green"},voided:{label:"Anulado",badge:"badge-orange"}};async function ls(e){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando inventario...</div>';try{const[t,a]=await Promise.all([API.getInventoryStock(),API.getWarehouses(!1)]);Ai(e,"stock",{stock:t,warehouses:a})}catch(t){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(t.message)}</div>`}}function Ai(e,t,a={}){const o=[{id:"stock",label:"Stock actual",icon:"fa-boxes-stacked"},{id:"movimientos",label:"Movimientos",icon:"fa-arrows-rotate"},{id:"bodegas",label:"Bodegas",icon:"fa-warehouse"}];e.innerHTML=`
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
    <div id="inv-tab-content"></div>`;const s=e.querySelector("#inv-tab-content");function n(i){e.querySelectorAll(".tab-btn").forEach(c=>c.classList.toggle("active",c.dataset.tab===i)),i==="stock"&&$i(s,a),i==="movimientos"&&ds(s,a),i==="bodegas"&&Jt(s,a)}e.querySelectorAll(".tab-btn").forEach(i=>i.addEventListener("click",()=>n(i.dataset.tab))),n(t)}async function $i(e,t={}){var a,o,s;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando stock...</div>';try{const[n,i]=await Promise.all([API.getInventoryStock(),API.getWarehouses(!1)]);t.stock=n,t.warehouses=i;const c=new Set(n.map(f=>f.product_id)).size,r=n.reduce((f,d)=>f+(d.qty_on_hand||0),0),l=n.filter(f=>(f.qty_on_hand||0)<=0).length,p=n.reduce((f,d)=>f+(d.qty_on_hand||0)*(d.avg_cost||0),0);e.innerHTML=`
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
          ${i.map(f=>`<option value="${esc(f.id)}">${esc(f.name)}</option>`).join("")}
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
              ${n.length?wi(n):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-boxes-stacked mr-2"></i>No hay stock registrado.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;const m=()=>Ei();(a=$("#st-q"))==null||a.addEventListener("input",debounce(m,150)),(o=$("#st-wh"))==null||o.addEventListener("change",m),(s=$("#st-status"))==null||s.addEventListener("change",m)}catch(n){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(n.message)}</div>`}}function wi(e){return e.map(t=>{var r,l;const a=(r=t.expand)==null?void 0:r.product_id,o=(l=t.expand)==null?void 0:l.warehouse_id,s=t.qty_on_hand??0,n=t.avg_cost??0,i=s*n,c=s<=0;return`<tr data-whid="${esc(t.warehouse_id)}" data-qty="${s}">
      <td class="font-medium">${a?esc(a.name):'<span style="color:#9CA3AF">—</span>'}</td>
      <td><span class="font-mono text-xs" style="color:#1A4B8C">${a?esc(a.code):"—"}</span></td>
      <td>${o?esc(o.name):"—"}</td>
      <td class="text-right font-semibold ${c?"text-red-500":""}">${fmtN(s)}</td>
      <td class="text-right">${n?fmt(n):"—"}</td>
      <td class="text-right">${i?fmt(i):"—"}</td>
      <td class="text-sm" style="color:#6B7280">${esc(t.last_mov_date||"—")}</td>
    </tr>`}).join("")}function Ei(){const e=(getInputVal("st-q")||"").toLowerCase(),t=getSelectVal("st-wh"),a=getSelectVal("st-status");$$("#stock-table tbody tr[data-qty]").forEach(o=>{const s=o.textContent.toLowerCase(),n=parseFloat(o.dataset.qty??"0"),i=!e||s.includes(e),c=!t||o.dataset.whid===t,r=!a||(a==="ok"?n>0:n<=0);o.style.display=i&&c&&r?"":"none"})}async function ds(e,t={}){var a,o,s,n;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando movimientos...</div>';try{const[i,c,r]=await Promise.all([API.getInventoryMovements({perPage:100}),t.warehouses?Promise.resolve(t.warehouses):API.getWarehouses(!1),API.getProducts({activeOnly:!0})]);t.warehouses=c,t.products=r;const l=i.items||[];e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div class="flex flex-wrap gap-3">
          <input id="mov-q" class="form-input" style="min-width:200px" placeholder="Buscar número, tipo...">
          <select id="mov-type-f" class="form-input" style="max-width:180px">
            <option value="">Todos los tipos</option>
            ${pa.map(m=>`<option value="${m.value}">${m.label}</option>`).join("")}
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
              ${l.length?Ci(l):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-arrows-rotate mr-2"></i>No hay movimientos registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;const p=()=>{const m=(getInputVal("mov-q")||"").toLowerCase(),f=getSelectVal("mov-type-f"),d=getSelectVal("mov-status-f");$$("#mov-table tbody tr[data-movid]").forEach(g=>{g.style.display=(!m||g.textContent.toLowerCase().includes(m))&&(!f||g.dataset.movtype===f)&&(!d||g.dataset.movstatus===d)?"":"none"})};(a=$("#mov-q"))==null||a.addEventListener("input",debounce(p,150)),(o=$("#mov-type-f"))==null||o.addEventListener("change",p),(s=$("#mov-status-f"))==null||s.addEventListener("change",p),(n=$("#btn-new-mov"))==null||n.addEventListener("click",()=>Ti(null,t,()=>ds(e,t)))}catch(i){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(i.message)}</div>`}}function Ci(e){return e.map(t=>{var i,c;const a=pa.find(r=>r.value===t.mov_type),o=rs[t.status]||{label:t.status,badge:"badge-gray"},s=(i=t.expand)==null?void 0:i.warehouse_id,n=(c=t.expand)==null?void 0:c.dest_warehouse_id;return`<tr data-movid="${esc(t.id)}" data-movtype="${esc(t.mov_type)}" data-movstatus="${esc(t.status)}">
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
    </tr>`}).join("")}async function al(e){var t,a,o;try{const[s,n]=await Promise.all([pb.get("inventory_movements",e,{expand:"warehouse_id,dest_warehouse_id,third_party_id"}),API.getInventoryMovementLines(e)]),i=pa.find(m=>m.value===s.mov_type),c=rs[s.status]||{label:s.status,badge:"badge-gray"},r=(t=s.expand)==null?void 0:t.warehouse_id,l=(a=s.expand)==null?void 0:a.dest_warehouse_id,p=(o=s.expand)==null?void 0:o.third_party_id;openModal(`Movimiento — ${esc(s.number)}`,`<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
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
            ${n.map(m=>{var d;const f=(d=m.expand)==null?void 0:d.product_id;return`<tr>
                <td>${f?esc(f.name):"—"}</td>
                <td class="font-mono text-xs">${f?esc(f.code):"—"}</td>
                <td class="text-right font-semibold">${fmtN(m.qty)}</td>
                <td class="text-right">${m.unit_cost?fmt(m.unit_cost):"—"}</td>
                <td class="text-right">${m.unit_cost?fmt(m.qty*m.unit_cost):"—"}</td>
              </tr>`}).join("")}
          </tbody>
        </table>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch(s){showToast(s.message,"error")}}async function ol(e){confirmDialog("Aplicar movimiento","¿Confirmas aplicar este movimiento? Se actualizará el stock de las bodegas y no se podrá deshacer salvo anulación.",async()=>{try{await API.applyInventoryMovement(e),showToast("Movimiento aplicado. Stock actualizado.","success"),ls($("#page-content"))}catch(t){showToast(t.message,"error")}})}function sl(e,t){confirmDialog("Anular movimiento",`¿Confirmas anular el movimiento <strong>${esc(t)}</strong>? El stock será revertido.`,async()=>{try{await API.voidInventoryMovement(e),showToast("Movimiento anulado. Stock revertido.","success"),ls($("#page-content"))}catch(a){showToast(a.message,"error")}})}async function Ti(e=null,t={},a=null){var r,l,p;const o=t.warehouses||await API.getWarehouses(!0),s=t.products||await API.getProducts({activeOnly:!0});let n=0;function i(m={}){var u;n++;const f=n,d=document.getElementById("mov-lines-body");if(!d)return;const g=document.createElement("tr");if(g.id=`mov-line-${f}`,g.innerHTML=`
      <td>
        <select class="form-input" id="ml-prod-${f}" style="min-width:180px">
          <option value="">— Producto —</option>
          ${s.filter(y=>y.type==="BIEN").map(y=>`<option value="${esc(y.id)}" data-cost="${y.cost_price||0}">${esc(y.code)} — ${esc(y.name)}</option>`).join("")}
        </select>
      </td>
      <td><input id="ml-qty-${f}" type="number" min="0.0001" step="0.0001" class="form-input text-right" style="min-width:90px" placeholder="0" value="${m.qty??""}"></td>
      <td><input id="ml-cost-${f}" type="number" min="0" step="0.01" class="form-input text-right" style="min-width:100px" placeholder="0.00" value="${m.unit_cost??""}"></td>
      <td><input id="ml-notes-${f}" class="form-input" style="min-width:120px" placeholder="Nota" value="${esc(m.notes||"")}"></td>
      <td><button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('mov-line-${f}').remove()"><i class="fas fa-times"></i></button></td>`,d.appendChild(g),(u=document.getElementById(`ml-prod-${f}`))==null||u.addEventListener("change",function(){const y=this.selectedOptions[0],v=document.getElementById(`ml-cost-${f}`);y&&y.dataset.cost&&v&&!v.value&&(v.value=y.dataset.cost)}),m.product_id){const y=document.getElementById(`ml-prod-${f}`);y&&(y.value=m.product_id)}}const c=()=>getSelectVal("mf-type")==="TRASLADO";openModal("Nuevo Movimiento de Inventario",`<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="form-group">
        <label class="form-label">Tipo <span style="color:#EF4444">*</span></label>
        <select id="mf-type" class="form-input">
          ${pa.map(m=>`<option value="${m.value}">${m.label}</option>`).join("")}
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
          ${o.map(m=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group" id="dest-wh-row" style="display:none">
        <label class="form-label">Bodega destino <span style="color:#EF4444">*</span></label>
        <select id="mf-dest-wh" class="form-input">
          <option value="">— Seleccionar —</option>
          ${o.map(m=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("")}
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
     <button class="btn btn-primary" id="btn-save-mov"><i class="fas fa-floppy-disk"></i> Guardar borrador</button>`,!0),(r=document.getElementById("mf-type"))==null||r.addEventListener("change",()=>{const m=document.getElementById("dest-wh-row");m&&(m.style.display=c()?"":"none")}),(l=document.getElementById("btn-add-line"))==null||l.addEventListener("click",()=>i()),i(),(p=document.getElementById("btn-save-mov"))==null||p.addEventListener("click",async()=>{const m=document.getElementById("btn-save-mov");m&&(m.disabled=!0,m.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const f=getSelectVal("mf-type"),d=getInputVal("mf-date"),g=getSelectVal("mf-wh"),u=getSelectVal("mf-dest-wh"),y=getInputVal("mf-notes");if(!f)return showToast("Selecciona el tipo de movimiento","warning");if(!d)return showToast("La fecha es obligatoria","warning");if(!g)return showToast("Selecciona la bodega origen","warning");if(f==="TRASLADO"&&!u)return showToast("Selecciona la bodega destino","warning");const v=[];let b=1;for(;;){const N=document.getElementById(`ml-prod-${b}`);if(!N){if(b++,b>n+5)break;continue}const T=N.value,S=parseFloat(getInputVal(`ml-qty-${b}`)||"0"),w=parseFloat(getInputVal(`ml-cost-${b}`)||"0"),E=getInputVal(`ml-notes-${b}`)||"";if(T&&S>0&&v.push({product_id:T,qty:S,unit_cost:w||null,notes:E,line_order:v.length+1}),b++,b>n+2)break}if(!v.length)return showToast("Agrega al menos una línea con producto y cantidad","warning");const h=d.replaceAll("-",""),_=String(Date.now()).slice(-4),A=`INV-${h}-${_}`,C={number:A,mov_type:f,date:d,warehouse_id:g,dest_warehouse_id:u||null,notes:y,status:"draft"},I=await pb.create("inventory_movements",C);for(const N of v)await pb.create("inventory_movement_lines",{movement_id:I.id,...N});await API.logAudit("CREATE","InventoryMovement",I.id,`${f} — ${A}`),showToast("Movimiento guardado como borrador. Aplícalo cuando estés listo.","success"),closeModal(),a&&a()}catch(f){showToast(f.message||"No se pudo guardar","error")}finally{m&&(m.disabled=!1,m.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar borrador')}})}async function Jt(e,t={}){var a;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando bodegas...</div>';try{const o=await API.getWarehouses(!1);t.warehouses=o,e.innerHTML=`
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm" style="color:#6B7280">${o.length} bodega(s) registrada(s).</p>
        ${can("canWrite")?'<button class="btn btn-primary" id="btn-new-wh"><i class="fas fa-plus"></i> Nueva Bodega</button>':""}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="wh-cards">
        ${o.length?o.map(s=>Ii(s)).join(""):'<div class="md:col-span-3 text-center py-10" style="color:#9CA3AF"><i class="fas fa-warehouse mr-2"></i>No hay bodegas. Crea la primera.</div>'}
      </div>`,(a=$("#btn-new-wh"))==null||a.addEventListener("click",()=>mo(null,()=>Jt(e,t))),$$(".btn-edit-wh").forEach(s=>s.addEventListener("click",()=>{const n=o.find(i=>i.id===s.dataset.id);n&&mo(n,()=>Jt(e,t))})),$$(".btn-toggle-wh").forEach(s=>s.addEventListener("click",async()=>{try{const n=o.find(i=>i.id===s.dataset.id);await pb.update("warehouses",n.id,{active:!n.active}),await API.logAudit("STATUS","Bodega",n.id,`${n.name} → ${n.active?"Inactiva":"Activa"}`),showToast(`Bodega ${n.active?"desactivada":"activada"}`,"success"),Jt(e,t)}catch(n){showToast(n.message,"error")}}))}catch(o){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(o.message)}</div>`}}function Ii(e){return`<div class="bg-white rounded-2xl border p-4" style="border-color:#F0F0F0">
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
  </div>`}window.renderStockTab=$i;window.filterStockTable=Ei;window.openWarehouseForm=mo;window.renderBodegasTab=Jt;window.renderMovimientosTab=ds;window.applyMovement=ol;window.renderStockRows=wi;window.voidMovement=sl;window.whCard=Ii;window.invKpi=Vt;window.INV_STATUS_META=rs;window.openMovForm=Ti;window.renderInventario=ls;window.renderMovRows=Ci;window.viewMovDetail=al;window._renderInvPage=Ai;window.INV_MOV_TYPES=pa;const ps={draft:{label:"Borrador",badge:"badge-orange"},posted:{label:"Contabilizada",badge:"badge-green"},voided:{label:"Anulada",badge:"badge-red"}},us="purchase_config_v1",Si=[{value:"BIEN",label:"Bien (Inventariable)"},{value:"SERVICIO",label:"Servicio"}],Ni=["UND","KG","L","M","M2","M3","PAQ","CJ","HORA","MES"],ms=[0,5,19];function Li(e){if(!e)return"—";const t=new Date(String(e).replace(" ","T"));return Number.isNaN(t.getTime())?String(e):t.toLocaleString("es-CO",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}function fs(e,t){const{title:a,messageHtml:o,actionLabel:s="Confirmar",actionClass:n="btn-primary",placeholder:i="Describe el motivo..."}=e||{};openModal(a||"Motivo requerido",`<div class="space-y-4 text-sm">
      <div style="color:#374151">${o||""}</div>
      <div>
        <label class="form-label">Motivo obligatorio</label>
        <textarea id="po-action-reason" class="form-input" rows="4" placeholder="${esc(i)}"></textarea>
        <p class="text-xs mt-2" style="color:#6B7280">Este motivo quedará registrado en la auditoría de la compra.</p>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn ${n}" id="po-action-confirm-btn">${s}</button>`),setTimeout(()=>{const c=document.getElementById("po-action-reason"),r=document.getElementById("po-action-confirm-btn");c==null||c.focus(),r==null||r.addEventListener("click",async()=>{const l=String((c==null?void 0:c.value)||"").trim();if(l.length<8){showToast("Indica un motivo claro de al menos 8 caracteres.","warning"),c==null||c.focus();return}r&&(r.disabled=!0,r.textContent="Procesando...");try{await t(l),closeModal()}catch(p){showToast(p.message||"No fue posible completar la acción.","error"),r&&(r.disabled=!1,r.textContent=s)}},{once:!0})},50)}function Ea(){return{operational:{allow_services_without_product:!1,require_warehouse_for_goods:!0,enable_discounts:!0,enable_freight:!0,enable_withholdings:!0,withholdings:{reterenta:!0,reteiva:!1,reteica:!1},default_due_days:30},accounting:{accounts:{payable_code:"220505",expense_fallback_code:"5135",iva_by_rate:{5:"233501",19:"233502"},discount_code:"",freight_code:""},withholding_rules:[{id:"wr-ret-renta-3_5",concept:"RETERENTA",base_type:"SUBTOTAL",min_base:0,rate:3.5,account_code:""}]}}}function bs(e){var l,p,m;const t=Ea(),a=(e==null?void 0:e.operational)||{},o=(e==null?void 0:e.accounting)||{},s=(o==null?void 0:o.accounts)||{},n=s.iva_by_rate&&typeof s.iva_by_rate=="object"?s.iva_by_rate:{},i={};if(Object.keys(n).forEach(f=>{const d=String(f).trim();d&&(i[d]=String(n[f]||"").trim())}),!Object.keys(i).length){const f=String(s.iva_discountable_code||"").trim();f&&(i[19]=f)}const r=(Array.isArray(o.withholding_rules)?o.withholding_rules:[]).map((f,d)=>({id:String((f==null?void 0:f.id)||`wr-${Date.now()}-${d}`).trim(),concept:String((f==null?void 0:f.concept)||"").trim().toUpperCase(),base_type:String((f==null?void 0:f.base_type)||"SUBTOTAL").trim().toUpperCase(),min_base:Math.max(0,Number((f==null?void 0:f.min_base)||0)||0),rate:Math.max(0,Number((f==null?void 0:f.rate)||0)||0),account_code:String((f==null?void 0:f.account_code)||"").trim()})).filter(f=>f.concept&&f.rate>0);if(!r.length){const f=[];[["RETERENTA",s.reterenta_code],["RETEIVA",s.reteiva_code],["RETEICA",s.reteica_code]].forEach(([g,u],y)=>{const v=String(u||"").trim();v&&f.push({id:`wr-legacy-${y}`,concept:g,base_type:"SUBTOTAL",min_base:0,rate:g==="RETEICA"?.414:g==="RETEIVA"?15:3.5,account_code:v})}),f.length&&r.push(...f)}return{operational:{allow_services_without_product:!1,require_warehouse_for_goods:a.require_warehouse_for_goods!==!1,enable_discounts:a.enable_discounts!==!1,enable_freight:a.enable_freight!==!1,enable_withholdings:a.enable_withholdings!==!1,withholdings:{reterenta:((l=a==null?void 0:a.withholdings)==null?void 0:l.reterenta)!==!1,reteiva:!!((p=a==null?void 0:a.withholdings)!=null&&p.reteiva),reteica:!!((m=a==null?void 0:a.withholdings)!=null&&m.reteica)},default_due_days:Math.max(0,Number(a.default_due_days??t.operational.default_due_days)||0)},accounting:{accounts:{payable_code:String(s.payable_code||t.accounting.accounts.payable_code).trim(),expense_fallback_code:String(s.expense_fallback_code||t.accounting.accounts.expense_fallback_code).trim(),iva_by_rate:Object.keys(i).length?i:{...t.accounting.accounts.iva_by_rate},discount_code:String(s.discount_code||"").trim(),freight_code:String(s.freight_code||"").trim()},withholding_rules:r.length?r:[...t.accounting.withholding_rules]}}}async function gs(){try{const e=await API.getSetting(us);return e?bs(JSON.parse(e)):Ea()}catch{return Ea()}}async function Pi(e){const t=bs(e||{});return await API.setSetting(us,JSON.stringify(t)),await API.logAudit("CONFIG","PurchaseConfig",null,"Configuracion de compras actualizada"),t}function fo(e,t){if(!e||!t)return e||"";const a=new Date(`${e}T00:00:00`);if(Number.isNaN(a.getTime()))return e;a.setDate(a.getDate()+Number(t||0));const o=a.getFullYear(),s=String(a.getMonth()+1).padStart(2,"0"),n=String(a.getDate()).padStart(2,"0");return`${o}-${s}-${n}`}async function Fi(e=null){var t,a,o;try{const[s,n]=await Promise.all([gs(),API.getAccounts(!0)]),i=(u="")=>`<option value="">— Sin definir —</option>${n.filter(v=>v.active&&Number(v.level)>=3).sort((v,b)=>v.code.localeCompare(b.code)).map(v=>`<option value="${esc(v.code)}"${v.code===u?" selected":""}>${esc(v.code)} — ${esc(v.name)}</option>`).join("")}`,c=Array.from(new Set([...ms.map(u=>String(u)),...Object.keys(s.accounting.accounts.iva_by_rate||{})])).sort((u,y)=>Number(u)-Number(y));openModal("Configuración de Compras",`<div class="space-y-5">
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
       <button class="btn btn-primary" id="btn-save-po-config"><i class="fas fa-floppy-disk"></i> Guardar configuración</button>`,!0);const r=document.getElementById("po-cfg-iva-rates-wrap"),l=(u="",y="")=>{var b;if(!r)return;const v=document.createElement("div");v.className="grid grid-cols-12 gap-2 items-center",v.innerHTML=`
        <div class="col-span-3">
          <input class="form-input po-cfg-iva-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${esc(String(u||""))}">
        </div>
        <div class="col-span-8">
          <select class="form-input po-cfg-iva-acct">${i(y)}</select>
        </div>
        <div class="col-span-1 text-right">
          <button type="button" class="btn btn-danger btn-sm po-cfg-iva-del"><i class="fas fa-trash"></i></button>
        </div>`,(b=v.querySelector(".po-cfg-iva-del"))==null||b.addEventListener("click",()=>v.remove()),r.appendChild(v)};c.length?c.forEach(u=>{var y;return l(u,((y=s.accounting.accounts.iva_by_rate)==null?void 0:y[u])||"")}):l("19",""),(t=document.getElementById("btn-po-cfg-add-iva-rate"))==null||t.addEventListener("click",()=>l("",""));const p=document.getElementById("po-cfg-ret-rules-wrap"),m=["RETERENTA","RETEIVA","RETEICA","OTRA"],f=["SUBTOTAL","IVA","TOTAL"],d=(u={})=>{var v;if(!p)return;const y=document.createElement("div");y.className="grid grid-cols-12 gap-2 items-center",y.innerHTML=`
        <div class="col-span-2"><select class="form-input po-cfg-ret-concept">${m.map(b=>`<option value="${b}"${String(u.concept||"")===b?" selected":""}>${b}</option>`).join("")}</select></div>
        <div class="col-span-2"><select class="form-input po-cfg-ret-base-type">${f.map(b=>`<option value="${b}"${String(u.base_type||"SUBTOTAL")===b?" selected":""}>${b}</option>`).join("")}</select></div>
        <div class="col-span-2"><input class="form-input po-cfg-ret-min-base" type="number" min="0" step="0.01" placeholder="Base mín." value="${esc(String(u.min_base??0))}"></div>
        <div class="col-span-2"><input class="form-input po-cfg-ret-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${esc(String(u.rate??0))}"></div>
        <div class="col-span-3"><select class="form-input po-cfg-ret-account">${i(u.account_code||"")}</select></div>
        <div class="col-span-1 text-right"><button type="button" class="btn btn-danger btn-sm po-cfg-ret-del"><i class="fas fa-trash"></i></button></div>`,(v=y.querySelector(".po-cfg-ret-del"))==null||v.addEventListener("click",()=>y.remove()),p.appendChild(y)},g=Array.isArray(s.accounting.withholding_rules)?s.accounting.withholding_rules:[];g.length?g.forEach(u=>d(u)):d({concept:"RETERENTA",base_type:"SUBTOTAL",min_base:0,rate:3.5,account_code:""}),(a=document.getElementById("btn-po-cfg-add-ret-rule"))==null||a.addEventListener("click",()=>d({concept:"RETERENTA",base_type:"SUBTOTAL",min_base:0,rate:0,account_code:""})),(o=$("#btn-save-po-config"))==null||o.addEventListener("click",async()=>{try{const u={};(document.querySelectorAll("#po-cfg-iva-rates-wrap .grid")||[]).forEach(b=>{var A,C;const h=String(((A=b.querySelector(".po-cfg-iva-rate"))==null?void 0:A.value)||"").trim(),_=String(((C=b.querySelector(".po-cfg-iva-acct"))==null?void 0:C.value)||"").trim();h&&(u[h]=_)});const y=[];(document.querySelectorAll("#po-cfg-ret-rules-wrap .grid")||[]).forEach((b,h)=>{var T,S,w,E,L;const _=String(((T=b.querySelector(".po-cfg-ret-concept"))==null?void 0:T.value)||"").trim().toUpperCase(),A=String(((S=b.querySelector(".po-cfg-ret-base-type"))==null?void 0:S.value)||"SUBTOTAL").trim().toUpperCase(),C=Math.max(0,Number(((w=b.querySelector(".po-cfg-ret-min-base"))==null?void 0:w.value)||0)||0),I=Math.max(0,Number(((E=b.querySelector(".po-cfg-ret-rate"))==null?void 0:E.value)||0)||0),N=String(((L=b.querySelector(".po-cfg-ret-account"))==null?void 0:L.value)||"").trim();!_||I<=0||y.push({id:`wr-${Date.now()}-${h}`,concept:_,base_type:A,min_base:C,rate:I,account_code:N})});const v={operational:{allow_services_without_product:!1,require_warehouse_for_goods:getCheckVal("po-cfg-req-wh"),enable_discounts:getCheckVal("po-cfg-discount"),enable_freight:getCheckVal("po-cfg-freight"),enable_withholdings:getCheckVal("po-cfg-withholding"),default_due_days:Math.max(0,parseInt(getInputVal("po-cfg-default-due")||"0",10)||0),withholdings:{reterenta:getCheckVal("po-cfg-ret-renta"),reteiva:getCheckVal("po-cfg-ret-iva"),reteica:getCheckVal("po-cfg-ret-ica")}},accounting:{accounts:{payable_code:getSelectVal("po-cfg-payable")||"220505",expense_fallback_code:getSelectVal("po-cfg-exp-fallback")||"5135",iva_by_rate:u,discount_code:getSelectVal("po-cfg-discount-acct")||"",freight_code:getSelectVal("po-cfg-freight-acct")||""},withholding_rules:y}};await Pi(v),showToast("Configuración de compras guardada","success"),closeModal(),typeof e=="function"&&e()}catch(u){showToast(u.message||"No se pudo guardar la configuración","error")}})}catch(s){showToast(s.message||"No se pudo abrir la configuración de compras","error")}}async function ua(e){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando compras...</div>';try{await Ca(e)}catch(t){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(t.message)}</div>`}}async function Ca(e){var r,l,p,m,f,d;const a=(await API.getPurchaseInvoices({perPage:100,sort:"-date"})).items||[],o=a.length,s=a.filter(g=>g.status==="draft").length,n=a.filter(g=>g.status==="posted").length,i=a.filter(g=>g.status!=="voided").reduce((g,u)=>g+(u.total||0),0);e.innerHTML=`
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
            ${a.length?a.map(Di).join(""):'<tr><td colspan="10" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-file-invoice-dollar mr-2"></i>No hay facturas de compra.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`,(r=$("#btn-new-purchase"))==null||r.addEventListener("click",()=>vs(null,()=>Ca(e))),(l=$("#btn-po-config"))==null||l.addEventListener("click",()=>Fi(()=>Ca(e)));const c=()=>Ri();(p=$("#po-q"))==null||p.addEventListener("input",debounce(c,150)),(m=$("#po-status-f"))==null||m.addEventListener("change",c),(f=$("#po-from"))==null||f.addEventListener("change",c),(d=$("#po-to"))==null||d.addEventListener("change",c)}function Di(e){var s,n;const t=ps[e.status]||{label:e.status,badge:"badge-gray"},a=(s=e.expand)==null?void 0:s.supplier_id,o=(n=e.expand)==null?void 0:n.warehouse_id;return`<tr data-poid="${esc(e.id)}" data-postatus="${esc(e.status)}" data-podate="${esc(e.date)}">
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
  </tr>`}function Ri(){const e=(getInputVal("po-q")||"").toLowerCase(),t=getSelectVal("po-status-f"),a=getInputVal("po-from"),o=getInputVal("po-to");$$("#po-table tbody tr[data-poid]").forEach(s=>{const n=s.textContent.toLowerCase(),i=s.dataset.podate;s.style.display=(!e||n.includes(e))&&(!t||s.dataset.postatus===t)&&(!a||i>=a)&&(!o||i<=o)?"":"none"})}async function vs(e=null,t=null){var V,U,z,J,te;let a=null,o=[],[s,n,i,c,r,l]=await Promise.all([gs(),pb.listAll("third_parties",{filter:"active=true",sort:"name"}),API.getWarehouses(!0),API.getProducts({activeOnly:!0}),pb.listAll("accounts",{filter:"active=true && level>=3",sort:"code"}),API.getTxTypes()]);e&&([a,o]=await Promise.all([pb.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id"}),API.getPurchaseInvoiceLines(e)]));let p=0;const m=(a==null?void 0:a.date)||todayStr(),f=(a==null?void 0:a.due_date)||fo(m,s.operational.default_due_days||0),d=l.map(F=>`<option value="${esc(F.id)}"${(a==null?void 0:a.tx_type_id)===F.id?" selected":""}>${esc(F.prefix)} — ${esc(F.name)}</option>`).join("");function g(F){return`${(F==null?void 0:F.doc_number)||(F==null?void 0:F.nit)||""} - ${(F==null?void 0:F.name)||""}`.trim()}const u=()=>c.map(F=>`<option value="${esc(F.id)}" data-type="${esc(F.type)}" data-cost="${F.cost_price||0}" data-iva="${F.iva_rate||0}" data-invacct="${esc(F.inventory_account_id||"")}" data-costacct="${esc(F.cost_account_id||"")}">${esc(F.code)} — ${esc(F.name)}</option>`).join(""),y=(((V=s==null?void 0:s.accounting)==null?void 0:V.withholding_rules)||[]).filter(F=>String(F.account_code||"").trim()&&Number(F.rate||0)>0);window.__poRetRulesCache=y;const v=F=>`${F.concept} ${F.rate}% (${F.base_type}${Number(F.min_base||0)>0?`, base >= ${fmt(F.min_base||0)}`:""})`,b=(F=y,D="")=>`<option value="">— Sin retención —</option>${F.map(q=>`<option value="${esc(q.id)}"${q.id===D?" selected":""}>${esc(v(q))}</option>`).join("")}`,h=F=>String(F||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase(),_=F=>{const D=h(`${(F==null?void 0:F.concept)||""} ${(F==null?void 0:F.name)||""} ${(F==null?void 0:F.account_code)||""}`);return D.includes("ica")?"ica":D.includes("iva")?"iva":D.includes("fuente")||D.includes("renta")||D.includes("rete fuente")?"renta":"other"},A=y.filter(F=>_(F)==="renta"),C=y.filter(F=>_(F)==="ica"),I=y.filter(F=>_(F)==="iva"),N=(F="")=>b(A,F),T=(F="")=>b(C,F),S=(F="")=>b(I,F),w=c.map(F=>({id:F.id,title:`${F.code} — ${F.name}`,sub:F.type}));openModal(e?`Editar Factura — ${esc((a==null?void 0:a.number)||"")}`:"Nueva Factura de Compra",`<!-- Encabezado -->
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
        <input id="po-date" type="date" class="form-input" value="${esc(m)}">
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de vencimiento</label>
        <input id="po-due-date" type="date" class="form-input" value="${esc(f||"")}">
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
                ${T((a==null?void 0:a.ret_rule_ica_id)||"")}
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
     <button class="btn btn-primary" id="btn-save-po"><i class="fas fa-floppy-disk"></i> Guardar borrador</button>`,!0);function E(){const F=document.getElementById("po-supplier-search-wrap"),D=document.getElementById("po-supplier"),q=document.getElementById("po-supplier-search"),G=document.getElementById("po-supplier-results");if(!F||!D||!q||!G)return;const ee=Z=>n.find(Q=>Q.id===Z)||null,X=(Z="")=>{const oe=String(Z||"").toLowerCase().trim().split(/\s+/).filter(Boolean),ve=oe.length?n.filter(be=>{const ye=`${be.doc_number||""} ${be.nit||""} ${be.name||""}`.toLowerCase();return oe.every(pe=>ye.includes(pe))}).slice(0,40):n.slice(0,40);if(!ve.length){G.innerHTML='<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';return}G.innerHTML=ve.map(be=>`<button type="button" data-po-third-id="${esc(be.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer"><div style="font-weight:600">${esc(be.doc_number||be.nit||"SIN DOC")}</div><div style="font-size:12px;color:#6B7280">${esc(be.name||"")}</div></button>`).join("")};(()=>{const Z=ee(D.value);q.value=Z?g(Z):""})(),q.onfocus=()=>{X(q.value),G.style.display="block"},q.oninput=()=>{D.value="",X(q.value),G.style.display="block"},G.onclick=Z=>{const Q=Z.target.closest("[data-po-third-id]");if(!Q)return;const oe=Q.getAttribute("data-po-third-id")||"";D.value=oe;const ve=ee(oe);q.value=ve?g(ve):"",G.style.display="none"},q._poOutsideHandler&&document.removeEventListener("click",q._poOutsideHandler),q._poOutsideHandler=Z=>{F.contains(Z.target)||(G.style.display="none")},setTimeout(()=>document.addEventListener("click",q._poOutsideHandler),0)}function L(){$$('select[id^="pol-prod-"]').forEach(F=>{const D=F.value;F.innerHTML=`<option value="">— Seleccionar —</option>${u()}`,D&&(F.value=D)}),$$('input[id^="pol-prod-search-"]').forEach(F=>{var ee;const D=F.id.replace("pol-prod-search-",""),q=document.getElementById(`pol-prod-${D}`),G=(ee=q==null?void 0:q.selectedOptions)==null?void 0:ee[0];F.value=G&&G.value?G.textContent:""})}function R(F){return y.find(D=>D.id===F)||null}function B(F,D,q,G){if(!G)return{base:0,amount:0};const ee=String(G.base_type||"SUBTOTAL").toUpperCase(),X=ee==="IVA"?D:ee==="TOTAL"?q:F,ne=Number(G.min_base||0)||0;if(X<ne)return{base:X,amount:0};const Z=Number(G.rate||0)||0;return{base:X,amount:X*Z/100}}function M(F,D){const q=F+D,G=R(getSelectVal("po-hdr-ret-rule-renta")),ee=R(getSelectVal("po-hdr-ret-rule-ica")),X=R(getSelectVal("po-hdr-ret-rule-iva")),ne=B(F,D,q,G).amount||0,Z=B(F,D,q,ee).amount||0,Q=X?(()=>{const oe=Number(X.min_base||0)||0;return D<oe?0:D*(Number(X.rate||0)||0)/100})():0;return{reteRenta:ne,reteIca:Z,reteIva:Q,total:ne+Z+Q}}function k({wrapId:F,inputId:D,selectId:q,resultsId:G,dataList:ee,onSelected:X}){const ne=document.getElementById(F),Z=document.getElementById(D),Q=document.getElementById(q),oe=document.getElementById(G);if(!ne||!Z||!Q||!oe)return;const ve=(ye="")=>{const de=String(ye||"").toLowerCase().trim().split(/\s+/).filter(Boolean),me=de.length?ee.filter(ue=>{const Ie=`${ue.title||""} ${ue.sub||""}`.toLowerCase();return de.every(Se=>Ie.includes(Se))}).slice(0,30):ee.slice(0,30);if(!me.length){oe.innerHTML='<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';return}oe.innerHTML=me.map(ue=>`<button type="button" data-lookup-id="${esc(ue.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer"><div style="font-weight:600">${esc(ue.title)}</div><div style="font-size:12px;color:#6B7280">${esc(ue.sub||"")}</div></button>`).join("")};(()=>{var pe;const ye=(pe=Q.selectedOptions)==null?void 0:pe[0];Z.value=ye&&ye.value?ye.textContent:""})(),Z.onfocus=()=>{ve(Z.value),oe.style.display="block"},Z.oninput=()=>{Q.value="",ve(Z.value),oe.style.display="block",typeof X=="function"&&X("")},oe.onclick=ye=>{var ue;const pe=ye.target.closest("[data-lookup-id]");if(!pe)return;const de=pe.getAttribute("data-lookup-id")||"";Q.value=de;const me=(ue=Q.selectedOptions)==null?void 0:ue[0];Z.value=me&&me.value?me.textContent:"",oe.style.display="none",typeof X=="function"&&X(de)},Z._lookupOutsideHandler&&document.removeEventListener("click",Z._lookupOutsideHandler),Z._lookupOutsideHandler=ye=>{ne.contains(ye.target)||(oe.style.display="none")},setTimeout(()=>document.addEventListener("click",Z._lookupOutsideHandler),0)}function j(){var X,ne,Z;if(!can("canWrite"))return showToast("Sin permisos para crear productos","error");const F=()=>`<option value="">— Sin asignar —</option>${r.filter(oe=>oe.active&&Number(oe.level)>=3).sort((oe,ve)=>oe.code.localeCompare(ve.code)).map(oe=>`<option value="${esc(oe.id)}">${esc(oe.code)} — ${esc(oe.name)}</option>`).join("")}`,D="po-quick-product-overlay",q=document.getElementById(D);q&&q.remove();const G=document.createElement("div");G.id=D,G.style.cssText="position:fixed;inset:0;background:rgba(5,8,20,.6);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:12px",G.innerHTML=`
      <div style="background:#fff;border-radius:16px;width:100%;max-width:760px;max-height:92vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.2)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #F0F0F0">
          <h4 style="font-weight:700;color:#0D2137;font-size:15px"><i class="fas fa-box-open mr-2" style="color:#1A4B8C"></i>Crear producto desde compra</h4>
          <button id="po-qp-close" style="background:none;border:none;font-size:18px;color:#9CA3AF;cursor:pointer"><i class="fas fa-xmark"></i></button>
        </div>
        <div style="padding:18px" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group mb-0"><label class="form-label">Codigo *</label><input id="po-qp-code" class="form-input" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" placeholder="P-001"></div>
          <div class="form-group mb-0"><label class="form-label">Nombre *</label><input id="po-qp-name" class="form-input" placeholder="Nombre del producto"></div>
          <div class="form-group mb-0"><label class="form-label">Tipo *</label><select id="po-qp-type" class="form-input">${Si.map(Q=>`<option value="${esc(Q.value)}">${esc(Q.label)}</option>`).join("")}</select></div>
          <div class="form-group mb-0"><label class="form-label">Unidad *</label><select id="po-qp-unit" class="form-input">${Ni.map(Q=>`<option value="${esc(Q)}">${esc(Q)}</option>`).join("")}</select></div>
          <div class="form-group mb-0"><label class="form-label">IVA %</label><select id="po-qp-iva" class="form-input">${ms.map(Q=>`<option value="${Q}">${Q}%</option>`).join("")}</select></div>
          <div class="form-group mb-0"><label class="form-label">Costo estimado</label><input id="po-qp-cost" type="number" min="0" step="0.01" class="form-input" value="0"></div>
          <div class="form-group mb-0"><label class="form-label">Cuenta costo/gasto</label><select id="po-qp-cost-acct" class="form-input">${F()}</select></div>
          <div class="form-group mb-0"><label class="form-label">Cuenta inventario</label><select id="po-qp-inv-acct" class="form-input">${F()}</select></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;padding:12px 20px;border-top:1px solid #F0F0F0">
          <button class="btn btn-outline" id="po-qp-cancel">Cancelar</button>
          <button class="btn btn-primary" id="po-qp-save"><i class="fas fa-floppy-disk"></i> Crear producto</button>
        </div>
      </div>`,document.body.appendChild(G);const ee=()=>{G.remove()};(X=document.getElementById("po-qp-close"))==null||X.addEventListener("click",ee),(ne=document.getElementById("po-qp-cancel"))==null||ne.addEventListener("click",ee),G.addEventListener("click",Q=>{Q.target===G&&ee()}),(Z=document.getElementById("po-qp-save"))==null||Z.addEventListener("click",async()=>{const Q=document.getElementById("po-qp-save");Q&&(Q.disabled=!0,Q.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const oe=getInputVal("po-qp-code").trim().toUpperCase(),ve=getInputVal("po-qp-name").trim();if(!oe)return showToast("El codigo es obligatorio","warning");if(!ve)return showToast("El nombre es obligatorio","warning");const be=pb.escapeFilterValue(oe);if((await pb.list("products",{filter:`code="${be}"`,perPage:1})).items.length)return showToast(`Ya existe un producto con codigo ${oe}`,"warning");const pe={code:oe,name:ve,description:"",type:getSelectVal("po-qp-type")||"BIEN",unit:getSelectVal("po-qp-unit")||"UND",presentacion:"",categoria:"",linea:"",iva_rate:Number(getSelectVal("po-qp-iva")||0),base_price:0,precio_venta_2:null,precio_venta_3:null,cost_price:parseFloat(getInputVal("po-qp-cost")||"0")||0,active:!0,unspsc_code:"",ean_code:"",peso:null,cajas_en_pallet:null,und_empaque:null,peso_x_und_empaque:null,income_account_id:null,cost_account_id:getSelectVal("po-qp-cost-acct")||null,inventory_account_id:getSelectVal("po-qp-inv-acct")||null},de=await pb.create("products",pe);await API.logAudit("CREATE","Producto",de.id,`${de.code} — ${de.name} (desde compras)`),c.unshift(de),L(),ee(),showToast("Producto creado y disponible en la factura","success")}catch(oe){showToast(oe.message||"No se pudo crear el producto","error")}finally{Q&&(Q.disabled=!1,Q.innerHTML='<i class="fas fa-floppy-disk"></i> Crear producto')}})}function Y(){var ne,Z;let F=0,D=0,q=0,G=1;for(;G<=p+5;){const Q=document.getElementById(`pol-price-${G}`);if(!Q){if(G++,G>p+5)break;continue}const oe=parseFloat(((ne=document.getElementById(`pol-qty-${G}`))==null?void 0:ne.value)||"0")||0,ve=parseFloat(Q.value||"0")||0,be=parseFloat(((Z=document.getElementById(`pol-iva-${G}`))==null?void 0:Z.value)||"0")||0,ye=oe*ve,pe=ye*be/100,de=ye+pe;F+=ye,D+=pe;const me=document.getElementById(`pol-rowtot-${G}`);if(me&&(me.textContent=fmt(de)),window.__poRetMode!=="header"){const ue=getSelectVal(`pol-ret-rule-${G}`),Ie=R(ue),Se=B(ye,pe,de,Ie);q+=Se.amount;const ie=document.getElementById(`pol-retamt-${G}`);ie&&(ie.textContent=Se.amount>0?fmt(Se.amount):"—")}G++}if(window.__poRetMode==="header"){const Q=M(F,D);q=Q.total,$("#po-total-ret-renta")&&($("#po-total-ret-renta").textContent=fmt(Q.reteRenta)),$("#po-total-ret-ica")&&($("#po-total-ret-ica").textContent=fmt(Q.reteIca)),$("#po-total-ret-iva")&&($("#po-total-ret-iva").textContent=fmt(Q.reteIva))}else $("#po-total-ret-renta")&&($("#po-total-ret-renta").textContent=fmt(0)),$("#po-total-ret-ica")&&($("#po-total-ret-ica").textContent=fmt(0)),$("#po-total-ret-iva")&&($("#po-total-ret-iva").textContent=fmt(0));const X=F+D-q;$("#po-total-sub")&&($("#po-total-sub").textContent=fmt(F)),$("#po-total-iva")&&($("#po-total-iva").textContent=fmt(D)),$("#po-total-ret")&&($("#po-total-ret").textContent=fmt(q)),$("#po-total-net")&&($("#po-total-net").textContent=fmt(X))}window.__poRecalcTotals=Y;function W(F){const D=document.getElementById(`pol-row-${F}`),q=document.getElementById(`pol-comment-btn-${F}`);if(!D||!q)return;const G=!!String(D.dataset.comment||"").trim();q.style.borderColor=G?"#1A4B8C":"#D1D5DB",q.style.color=G?"#1A4B8C":"#6B7280",q.style.background=G?"#EEF4FF":"#fff",q.title=G?"Editar comentario":"Agregar comentario"}window.poEditLineComment=function(D){const q=document.getElementById(`pol-row-${D}`);if(!q)return;let G=document.getElementById("po-line-comment-overlay");G||(G=document.createElement("div"),G.id="po-line-comment-overlay",G.style.cssText="display:none;position:fixed;inset:0;background:rgba(5,8,20,.6);backdrop-filter:blur(4px);z-index:220;align-items:center;justify-content:center;padding:16px",G.innerHTML=`
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
          ${b()}
        </select>
      </td>
      <td class="po-ret-col text-right font-semibold text-sm" id="pol-retamt-${D}" style="color:#C46516">—</td>
      <td class="text-right font-semibold text-sm" id="pol-rowtot-${D}" style="color:#1A4B8C">—</td>
      <td>
        <div class="flex items-center gap-1">
          <button type="button" class="btn btn-outline btn-sm" id="pol-comment-btn-${D}" onclick="poEditLineComment(${D})"><i class="fas fa-comment"></i></button>
          <button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('pol-row-${D}').remove(); poRecalcLine(0)"><i class="fas fa-times"></i></button>
        </div>
      </td>`,q.appendChild(G),W(D),k({wrapId:`pol-prod-wrap-${D}`,inputId:`pol-prod-search-${D}`,selectId:`pol-prod-${D}`,resultsId:`pol-prod-results-${D}`,dataList:w,onSelected:()=>{var oe;const X=document.getElementById(`pol-prod-${D}`),ne=(oe=X==null?void 0:X.selectedOptions)==null?void 0:oe[0];if(!ne||!ne.value)return;const Z=document.getElementById(`pol-price-${D}`),Q=document.getElementById(`pol-iva-${D}`);Z&&!Z.value&&(Z.value=ne.dataset.cost||""),Q&&(Q.value=ne.dataset.iva||"0"),poRecalcLine(D)}}),F.product_id){const X=document.getElementById(`pol-prod-${D}`);X&&(X.value=F.product_id);const ne=document.getElementById(`pol-prod-search-${D}`),Z=(ee=X==null?void 0:X.selectedOptions)==null?void 0:ee[0];ne&&(Z!=null&&Z.value)&&(ne.value=Z.textContent)}if(F.ret_rule_id){const X=document.getElementById(`pol-ret-rule-${D}`);X&&(X.value=F.ret_rule_id),window.__poRetMode==="header"&&document.querySelectorAll(`#pol-row-${D} .po-ret-col`).forEach(ne=>{ne.style.display="none"})}Y()}if(o.length)for(const F of o)K(F);else K();E(),(U=document.getElementById("btn-add-po-line"))==null||U.addEventListener("click",()=>K()),(z=document.getElementById("btn-new-po-product"))==null||z.addEventListener("click",()=>j()),window.__poRetMode="header",window.poSetRetMode(!1);const H=document.getElementById("po-tx-type"),x=document.getElementById("po-tx-number"),P=()=>{if(!H||!x||e&&x.value)return;const F=l.find(G=>G.id===H.value);if(!F)return;const D=Number(F.consecutive||0)+1,q=F.prefix||F.code||"TX";x.value=`${q}-${String(D).padStart(8,"0")}`};H==null||H.addEventListener("change",P),P(),!e&&(s.operational.default_due_days||0)>0&&((J=document.getElementById("po-date"))==null||J.addEventListener("change",()=>{const F=getInputVal("po-date");$("#po-due-date")&&!getInputVal("po-due-date")&&setInputVal("po-due-date",fo(F,s.operational.default_due_days||0))})),(te=document.getElementById("btn-save-po"))==null||te.addEventListener("click",async()=>{const F=document.getElementById("btn-save-po");F&&(F.disabled=!0,F.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const D=getInputVal("po-supplier"),q=getInputVal("po-date"),G=getSelectVal("po-tx-type"),ee=getInputVal("po-tx-number").trim();if(!D)return showToast("Selecciona el proveedor","warning");if(!q)return showToast("La fecha es obligatoria","warning");if(!G)return showToast("Selecciona el tipo de comprobante contable","warning");if(!ee)return showToast("Define la numeración del comprobante contable","warning");const X=[];let ne=0;for(let pe=1;pe<=p+2;pe++){const de=document.getElementById(`pol-row-${pe}`);if(!de)continue;const me=getSelectVal(`pol-prod-${pe}`),ue=String(de.dataset.comment||"").trim(),Ie=parseFloat(getInputVal(`pol-qty-${pe}`)||"0")||0,Se=parseFloat(getInputVal(`pol-price-${pe}`)||"0")||0,ie=parseFloat(getInputVal(`pol-iva-${pe}`)||"0")||0,le=window.__poRetMode==="header"?"":getSelectVal(`pol-ret-rule-${pe}`)||"";if(!Ie||!Se)continue;if(!me)return showToast(`Línea ${X.length+1}: selecciona un producto`,"warning");const Be=Ie*Se,vt=Be*ie/100,Me=Be+vt,Ce=R(le),Wa=B(Be,vt,Me,Ce);ne+=Wa.amount||0,X.push({product_id:me||null,account_id:null,description:ue,qty:Ie,unit_price:Se,iva_rate:ie,subtotal:Be,iva_amount:vt,total:Me,ret_rule_id:Ce?Ce.id:"",ret_concept:Ce?Ce.concept:"",ret_base_type:Ce?Ce.base_type:"",ret_base:Wa.base||0,ret_rate:Ce?Number(Ce.rate||0):0,ret_amount:Wa.amount||0,ret_account_code:Ce?String(Ce.account_code||""):""})}if(!X.length)return showToast("Agrega al menos una línea válida","warning");if(window.__poRetMode==="header"){const pe=X.reduce((me,ue)=>me+(ue.subtotal||0),0),de=X.reduce((me,ue)=>me+(ue.iva_amount||0),0);ne=M(pe,de).total}if(s.operational.require_warehouse_for_goods&&X.some(de=>{if(!de.product_id)return!1;const me=c.find(ue=>ue.id===de.product_id);return(me==null?void 0:me.type)==="BIEN"})&&!getSelectVal("po-warehouse"))return showToast("Selecciona bodega destino para líneas de bienes","warning");const Z=q.replaceAll("-",""),Q=String(Date.now()).slice(-4),oe=(a==null?void 0:a.number)||`FC-${Z}-${Q}`,be=X.reduce((pe,de)=>pe+(de.total||0),0)-ne,ye={number:oe,date:q,due_date:getInputVal("po-due-date")||null,supplier_id:D,supplier_ref:getInputVal("po-supplier-ref").trim(),tx_type_id:G,tx_number:ee,warehouse_id:getSelectVal("po-warehouse")||null,notes:getInputVal("po-notes").trim(),ret_total:ne,payable_total:be,ret_rule_renta_id:window.__poRetMode==="header"&&getSelectVal("po-hdr-ret-rule-renta")||"",ret_rule_ica_id:window.__poRetMode==="header"&&getSelectVal("po-hdr-ret-rule-ica")||"",ret_rule_iva_id:window.__poRetMode==="header"&&getSelectVal("po-hdr-ret-rule-iva")||""};if(e){let pe=0,de=0;for(const ue of X)pe+=ue.subtotal,de+=ue.iva_amount;await pb.update("purchase_invoices",e,{...ye,subtotal:pe,iva_total:de,total:be});const me=await pb.listAll("purchase_invoice_lines",{filter:`invoice_id="${pb.escapeFilterValue(e)}"`});for(const ue of me)await pb.delete("purchase_invoice_lines",ue.id);for(let ue=0;ue<X.length;ue++)await pb.create("purchase_invoice_lines",{invoice_id:e,line_order:ue+1,...X[ue]});await API.logAudit("UPDATE","PurchaseInvoice",e,`Editada ${oe}`),showToast("Factura actualizada","success")}else await API.createPurchaseInvoice(ye,X),showToast("Factura guardada como borrador","success");closeModal(),t&&t()}catch(D){showToast(D.message||"Error al guardar","error")}finally{F&&(F.disabled=!1,F.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar borrador')}})}window.poRecalcLine=function(){var n,i,c;if(typeof window.__poRecalcTotals=="function"){window.__poRecalcTotals();return}let e=0,t=0,a=0;for(let r=1;r<=100;r++){if(!document.getElementById(`pol-row-${r}`))continue;const p=parseFloat(((n=document.getElementById(`pol-qty-${r}`))==null?void 0:n.value)||"0")||0,m=parseFloat(((i=document.getElementById(`pol-price-${r}`))==null?void 0:i.value)||"0")||0,f=parseFloat(((c=document.getElementById(`pol-iva-${r}`))==null?void 0:c.value)||"0")||0,d=p*m,g=d*f/100;e+=d,t+=g}const s=e+t-a;$("#po-total-sub")&&($("#po-total-sub").textContent=fmt(e)),$("#po-total-iva")&&($("#po-total-iva").textContent=fmt(t)),$("#po-total-ret")&&($("#po-total-ret").textContent=fmt(a)),$("#po-total-net")&&($("#po-total-net").textContent=fmt(s))};window.poSetRetMode=function(e){window.__poRetMode=e?"line":"header",document.querySelectorAll(".po-ret-col").forEach(i=>{i.style.display=e?"":"none"});const t=document.getElementById("po-hdr-ret-wrap");t&&(t.style.display=e?"none":"");const a=document.getElementById("po-ret-mode-knob");a&&(a.style.transform=e?"translateX(18px)":"");const o=document.getElementById("po-ret-mode-track");o&&(o.style.background=e?"#6B7280":"#1A4B8C");const s=document.getElementById("po-ret-mode-lbl-hdr");s&&(s.style.color=e?"#9CA3AF":"#1A4B8C");const n=document.getElementById("po-ret-mode-lbl-line");n&&(n.style.color=e?"#1A4B8C":"#9CA3AF"),window.poRecalcLine(0)};async function nl(e){var t,a;try{const[o,s,n]=await Promise.all([pb.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id"}),API.getPurchaseInvoiceLines(e),can("canViewAudit")?API.getAuditLogs({entity:"PurchaseInvoice",entityId:e,actions:["REOPEN","VOID"],limit:20}).catch(()=>[]):Promise.resolve([])]),i=o.status==="posted"?await API.getPurchaseMutationBlocks(e).catch(()=>({blocks:[],details:{}})):{blocks:[],details:{}},c=ps[o.status]||{label:o.status,badge:"badge-gray"},r=(t=o.expand)==null?void 0:t.supplier_id,l=(a=o.expand)==null?void 0:a.warehouse_id,p=can("canViewAudit")?`
      <div class="mt-5 rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-bold" style="color:#0D2137"><i class="fas fa-clock-rotate-left mr-2"></i>Historial de reaperturas y anulaciones</h4>
          <span class="text-xs" style="color:#6B7280">Auditoría del documento</span>
        </div>
        ${n.length?`<div class="space-y-2">
              ${n.map(f=>`
                <div class="rounded-lg border px-3 py-2" style="border-color:#E5E7EB;background:#fff">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-semibold" style="color:#1A4B8C">${esc(f.action||"EVENTO")}</span>
                    <span class="text-xs" style="color:#6B7280">${esc(Li(f.created||f.createdAt||f.date||""))}</span>
                  </div>
                  <p class="text-sm mt-1" style="color:#374151">${esc(f.description||f.notes||"Sin detalle")}</p>
                </div>`).join("")}
             </div>`:'<p class="text-sm" style="color:#6B7280">No hay reaperturas ni anulaciones registradas para esta compra.</p>'}
      </div>`:"",m=o.status==="posted"&&i.blocks.length?`
      <div class="mt-4 p-4 rounded-xl text-sm" style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B">
        <div class="font-semibold mb-2"><i class="fas fa-shield-halved mr-2"></i>Bloqueo de reapertura/anulación</div>
        ${i.blocks.map(f=>`<p class="mb-1">• ${esc(f)}</p>`).join("")}
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
            ${s.map(f=>{var u,y;const d=(u=f.expand)==null?void 0:u.product_id,g=(y=f.expand)==null?void 0:y.account_id;return`<tr>
                <td>${d?`<span class="font-mono text-xs mr-1" style="color:#1A4B8C">${esc(d.code)}</span>${esc(d.name)}`:g?`${esc(g.code)} ${esc(g.name)}`:"—"}</td>
                <td class="text-sm" style="color:#6B7280">${esc(f.description||"—")}</td>
                <td class="text-right">${fmtN(f.qty)}</td>
                <td class="text-right">${fmt(f.unit_price)}</td>
                <td class="text-right">${f.iva_rate?f.iva_rate+"%":"—"}</td>
                <td class="text-right font-semibold">${fmt(f.total)}</td>
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
      ${m}
      ${p}`,`<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       ${o.status==="draft"&&can("canApprove")?`<button class="btn btn-primary" onclick="closeModal(); contabilizarCompra('${esc(o.id)}', '${esc(o.number)}')"><i class="fas fa-check"></i> Contabilizar</button>`:""}
       ${o.status==="posted"&&requireRole("admin")?`<button class="btn btn-outline" style="border-color:#D97706;color:#D97706" onclick="closeModal(); reopenPurchase('${esc(o.id)}', '${esc(o.number)}')"><i class="fas fa-rotate-left"></i> Reabrir</button>`:""}
       ${o.status==="posted"&&can("canDelete")?`<button class="btn btn-danger" onclick="closeModal(); voidPurchase('${esc(o.id)}', '${esc(o.number)}', 'posted')"><i class="fas fa-ban"></i> Anular</button>`:""}`,!0)}catch(o){showToast(o.message,"error")}}function il(e){vs(e,()=>ua($("#page-content")))}function cl(e,t){if(!can("canApprove"))return showToast("Solo el contador o admin pueden contabilizar","error");confirmDialog("Contabilizar Factura de Compra",`¿Confirmas contabilizar la factura <strong>${esc(t)}</strong>?<br><br>
     Se generará automáticamente:<br>
     • Un asiento contable (FC) en estado <em>Borrador</em> para su aprobación<br>
     • Un movimiento de inventario <em>ENTRADA</em> para los bienes comprados`,async()=>{try{const{inv:a,tx:o}=await API.postPurchaseInvoice(e);showToast(`Factura ${a.number} contabilizada. Asiento ${o.number} generado (pendiente aprobación).`,"success"),ua($("#page-content"))}catch(a){showToast(a.message,"error")}})}function rl(e,t){if(!requireRole("admin"))return showToast("Solo el administrador puede reabrir compras contabilizadas","error");fs({title:"Reabrir Compra para Corrección",messageHtml:`
        <p>Se reabrirá la factura <strong>${esc(t)}</strong> y el sistema hará lo siguiente:</p>
        <p class="mt-2">• Anulará el asiento contable vinculado</p>
        <p>• Revertirá el movimiento de inventario asociado</p>
        <p>• Dejará la compra en <em>Borrador</em> para corrección y nueva contabilización</p>`,actionLabel:"Reabrir compra",actionClass:"btn-outline",placeholder:"Explica el motivo de la reapertura aprobada por el administrador"},async a=>{await API.reopenPurchaseInvoice(e,a),showToast(`Factura ${t} reabierta en borrador. Se revirtieron contabilidad e inventario.`,"success"),ua($("#page-content"))})}function ll(e,t,a="draft"){if(!can("canDelete"))return showToast("No tienes permisos para anular","error");fs({title:"Anular Factura de Compra",messageHtml:a==="posted"?`
          <p>Se anulará la factura <strong>${esc(t)}</strong>.</p>
          <p class="mt-2">Para conservar trazabilidad el sistema también anulará el asiento contable y revertirá el movimiento de inventario asociado.</p>`:`<p>Vas a anular la factura <strong>${esc(t)}</strong>. Esta acción dejará el documento inválido para operación.</p>`,actionLabel:"Anular compra",actionClass:"btn-danger",placeholder:"Explica el motivo de la anulación"},async o=>{await API.voidPurchaseInvoice(e,o),showToast(a==="posted"?"Factura anulada. Se revirtieron contabilidad e inventario.":"Factura anulada","success"),ua($("#page-content"))})}function jt(e,t,a,o,s){return`<div class="rounded-2xl p-4" style="background:${s}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${a} text-sm" style="color:${o}"></i>
      <span class="text-xs font-semibold" style="color:${o}">${e}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${o}">${t}</p>
  </div>`}window.savePurchaseConfig=Pi;window.defaultPurchaseConfig=Ea;window.contabilizarCompra=cl;window.openPurchaseForm=vs;window.voidPurchase=ll;window.reopenPurchase=rl;window._loadComprasPage=Ca;window.viewPurchaseDetail=nl;window.getPurchaseConfig=gs;window.PURCHASE_CONFIG_KEY=us;window.renderCompras=ua;window.PO_IVA_RATES=ms;window.openPurchaseReasonDialog=fs;window.poKpi=jt;window.addDaysToDateStr=fo;window.editPurchase=il;window.normalizePurchaseConfig=bs;window.renderPoRow=Di;window.openPurchaseSettingsModal=Fi;window.PO_PRODUCT_UNITS=Ni;window.PO_STATUS=ps;window.PO_PRODUCT_TYPES=Si;window.fmtPurchaseAuditDate=Li;window.filterPoTable=Ri;const dt={draft:{label:"Borrador",badge:"badge-orange"},posted:{label:"Contabilizada",badge:"badge-green"},paid:{label:"Pagada",badge:"badge-blue"},voided:{label:"Anulada",badge:"badge-red"}},bo={pending:{label:"Pendiente",badge:"badge-orange"},confirmed:{label:"Confirmada",badge:"badge-green"},cancelled:{label:"Cancelada",badge:"badge-red"}},ta={open:{label:"Abierta",badge:"badge-orange"},in_process:{label:"En proceso",badge:"badge-blue"},resolved:{label:"Resuelta",badge:"badge-green"},closed:{label:"Cerrada",badge:"badge-gray"}},aa={baja:{label:"Baja",badge:"badge-gray"},media:{label:"Media",badge:"badge-orange"},alta:{label:"Alta",badge:"badge-red"}},oa=[{value:"PETICION",label:"Petición"},{value:"QUEJA",label:"Queja"},{value:"RECLAMO",label:"Reclamo"},{value:"SUGERENCIA",label:"Sugerencia"},{value:"FELICITACION",label:"Felicitación"}],Oi=["APARTAMENTO","PARQUEADERO","DEPOSITO","LOCAL","CASA","OFICINA","OTRO"];function Ee(e,t,a,o,s){return`<div class="rounded-2xl p-4" style="background:${s}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${a} text-sm" style="color:${o}"></i>
      <span class="text-xs font-semibold" style="color:${o}">${e}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${o}">${t}</p>
  </div>`}function gt(){const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}`}function qe(e){if(!e)return"—";const[t,a]=String(e).split("-");return`${["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][(parseInt(a,10)||1)-1]} ${t}`}async function dl(e){e.innerHTML=`<div class="p-8 text-center" style="color:#9CA3AF">
    <i class="fas fa-spinner fa-spin mr-2"></i>Cargando módulo Copropiedades...</div>`,ki(e,"facturacion")}function ki(e,t){const a=[{id:"facturacion",label:"Facturación",icon:"fa-file-invoice-dollar"},{id:"cartera",label:"Cartera",icon:"fa-chart-line"},{id:"unidades",label:"Unidades",icon:"fa-building"},{id:"reservas",label:"Reservas",icon:"fa-calendar-check"},{id:"pqrs",label:"PQRs",icon:"fa-comments"},{id:"config",label:"Configuración",icon:"fa-sliders"}];e.innerHTML=`
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
    <div id="ph-tab-content"></div>`;const o=e.querySelector("#ph-tab-content");function s(n){e.querySelectorAll(".tab-btn").forEach(i=>i.classList.toggle("active",i.dataset.tab===n)),n==="facturacion"&&ma(o),n==="cartera"&&Yi(o),n==="unidades"&&qa(o),n==="reservas"&&sa(o),n==="pqrs"&&hs(o),n==="config"&&Ye(o)}e.querySelectorAll(".tab-btn").forEach(n=>n.addEventListener("click",()=>s(n.dataset.tab))),s(t)}async function ma(e){var t,a,o,s,n,i;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const c=gt(),r=pb.escapeFilterValue(c),[l,p]=await Promise.all([API.getPhInvoices({filter:`period="${r}"`,perPage:200}),API.getPhInvoices({filter:"",perPage:1})]),m=l.items||[],f=p.totalItems||0,d=m.filter(v=>v.status==="posted").length,g=m.filter(v=>v.status==="paid").length,u=m.filter(v=>v.status==="draft").length,y=m.reduce((v,b)=>v+(b.total||0),0);e.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        ${Ee("Facturas del mes",m.length,"fas fa-file-invoice","#7F7CFF","#F5F3FF")}
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
            Facturas — <span id="ph-period-label">${qe(c)}</span>
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
              ${Ta(m)}
            </tbody>
          </table>
        </div>
        ${m.length===0?`
          <div class="py-12 text-center" style="color:#9CA3AF">
            <i class="fas fa-file-invoice text-3xl mb-3 block"></i>
            No hay facturas para este período. Usa <strong>Generar facturas</strong> para crearlas.
          </div>`:""}
      </div>`,(t=document.getElementById("ph-period-filter"))==null||t.addEventListener("change",async v=>{const b=v.target.value;if(!b)return;document.getElementById("ph-period-label").textContent=qe(b);const h=pb.escapeFilterValue(b),_=await API.getPhInvoices({filter:`period="${h}"`,perPage:200});document.getElementById("ph-inv-tbody").innerHTML=Ta(_.items||[]),Qe()}),(a=document.getElementById("ph-inv-search"))==null||a.addEventListener("input",debounce(()=>{var b;const v=(((b=document.getElementById("ph-inv-search"))==null?void 0:b.value)||"").toLowerCase();document.querySelectorAll("#ph-inv-table tbody tr").forEach(h=>{h.style.display=v&&!h.textContent.toLowerCase().includes(v)?"none":""})},150)),(o=document.getElementById("ph-gen-btn"))==null||o.addEventListener("click",()=>Vi()),(s=document.getElementById("ph-post-period-btn"))==null||s.addEventListener("click",()=>Bi(e)),(n=document.getElementById("ph-unpost-period-btn"))==null||n.addEventListener("click",()=>Mi(e)),(i=document.getElementById("ph-delete-period-btn"))==null||i.addEventListener("click",()=>Ui(e)),Qe()}catch(c){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(c.message)}</div>`}}function Ta(e){return e.length?e.map(t=>{var i,c,r;const a=(i=t.expand)==null?void 0:i.property_id,o=((c=a==null?void 0:a.expand)==null?void 0:c.owner_id)||((r=t.expand)==null?void 0:r["property_id.owner_id"]),s=dt[t.status]||dt.draft,n=t.status==="voided";return`<tr data-id="${esc(t.id)}" style="${n?"opacity:.55":""}">
      <td class="font-mono text-xs">${esc(t.number)}</td>
      <td>
        <span class="font-semibold" style="color:#0D2137">${esc((a==null?void 0:a.name)||(a==null?void 0:a.code)||t.property_id)}</span>
        <br><span class="text-xs" style="color:#9CA3AF">${esc((a==null?void 0:a.unit_type)||"")}</span>
      </td>
      <td class="text-sm">${esc((o==null?void 0:o.name)||"—")}</td>
      <td>${qe(t.period)}</td>
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
    </tr>`}).join(""):'<tr><td colspan="8" class="text-center py-8" style="color:#9CA3AF">Sin registros</td></tr>'}function Qe(){document.querySelectorAll(".ph-inv-view").forEach(e=>{e.addEventListener("click",()=>Ga(e.dataset.id))}),document.querySelectorAll(".ph-inv-add-individual").forEach(e=>{e.addEventListener("click",()=>ac(e.dataset.id))}),document.querySelectorAll(".ph-inv-post").forEach(e=>{e.addEventListener("click",()=>Gi(e.dataset.id,e))}),document.querySelectorAll(".ph-inv-paid").forEach(e=>{e.addEventListener("click",()=>qi(e.dataset.id,e))}),document.querySelectorAll(".ph-inv-unpost").forEach(e=>{e.addEventListener("click",()=>zi(e.dataset.id,e))}),document.querySelectorAll(".ph-inv-void").forEach(e=>{e.addEventListener("click",()=>Wi(e.dataset.id))})}function Bi(e){var a;const t=((a=document.getElementById("ph-period-filter"))==null?void 0:a.value)||gt();openModal("Contabilizar Liquidación del Período",`<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción contabilizará en lote todas las facturas en estado <strong>Borrador</strong> del período <strong>${qe(t)}</strong>.
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
     <button class="btn btn-primary" id="ph-post-period-confirm-btn"><i class="fas fa-layer-group mr-1"></i>Contabilizar</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-post-period-confirm-btn"))==null||o.addEventListener("click",async()=>{var i;if((((i=document.getElementById("ph-post-period-confirm"))==null?void 0:i.value)||"").trim()!==t){showToast(`Debes escribir exactamente ${t}.`,"warning");return}const n=document.getElementById("ph-post-period-confirm-btn");n&&(n.disabled=!0,n.textContent="Procesando...");try{const c=await API.postPhInvoicesByPeriod(t);showToast(`Período ${t}: ${c.posted} contabilizadas, ${c.skipped} omitidas, ${c.failed} fallidas.`,c.failed?"warning":"success"),closeModal(),ma(e)}catch(c){showToast(c.message||"Error al contabilizar período.","error"),n&&(n.disabled=!1,n.innerHTML='<i class="fas fa-layer-group mr-1"></i>Contabilizar')}},{once:!0})},50)}function Mi(e){var a;const t=((a=document.getElementById("ph-period-filter"))==null?void 0:a.value)||gt();openModal("Descontabilizar Liquidación del Período",`<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción quitará la contabilización de todas las facturas del período <strong>${qe(t)}</strong>.
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
     <button class="btn btn-primary" id="ph-unpost-period-confirm-btn"><i class="fas fa-rotate-left mr-1"></i>Descontabilizar</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-unpost-period-confirm-btn"))==null||o.addEventListener("click",async()=>{var i;if((((i=document.getElementById("ph-unpost-period-confirm"))==null?void 0:i.value)||"").trim()!==t){showToast(`Debes escribir exactamente ${t}.`,"warning");return}const n=document.getElementById("ph-unpost-period-confirm-btn");n&&(n.disabled=!0,n.textContent="Procesando...");try{const c=await API.unpostPhInvoicesByPeriod(t);showToast(`Período ${t}: ${c.reverted} facturas descontabilizadas.`,"success"),closeModal(),ma(e)}catch(c){showToast(c.message||"Error al descontabilizar período.","error"),n&&(n.disabled=!1,n.innerHTML='<i class="fas fa-rotate-left mr-1"></i>Descontabilizar')}},{once:!0})},50)}function Ui(e){var a;const t=((a=document.getElementById("ph-period-filter"))==null?void 0:a.value)||gt();openModal("Eliminar Liquidación del Período",`<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción eliminará todas las facturas del período <strong>${qe(t)}</strong>.
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
     <button class="btn btn-danger" id="ph-delete-period-confirm-btn"><i class="fas fa-trash mr-1"></i>Eliminar Todo</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-delete-period-confirm-btn"))==null||o.addEventListener("click",async()=>{var c;const s=(((c=document.getElementById("ph-delete-period-confirm"))==null?void 0:c.value)||"").trim().toUpperCase(),n=`ELIMINAR ${t}`.toUpperCase();if(s!==n){showToast(`Debes escribir exactamente: ${n}`,"warning");return}const i=document.getElementById("ph-delete-period-confirm-btn");i&&(i.disabled=!0,i.textContent="Eliminando...");try{const r=await API.deletePhInvoicesByPeriod(t);showToast(`Período ${t}: ${r.deleted} facturas eliminadas.`,"success"),closeModal(),ma(e)}catch(r){showToast(r.message||"Error al eliminar período.","error"),i&&(i.disabled=!1,i.innerHTML='<i class="fas fa-trash mr-1"></i>Eliminar Todo')}},{once:!0})},50)}function Vi(){var o;const e=((o=document.getElementById("ph-period-filter"))==null?void 0:o.value)||gt(),[t,a]=e.split("-").map(Number);a===12?t+1:`${t}${String(a+1).padStart(2,"0")}`,openModal("Generar Facturas del Período",`<div class="space-y-4">
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
     </button>`),setTimeout(()=>{var s;(s=document.getElementById("ph-gen-confirm-btn"))==null||s.addEventListener("click",async()=>{var r,l;const n=(r=document.getElementById("ph-gen-period"))==null?void 0:r.value,i=(l=document.getElementById("ph-gen-due"))==null?void 0:l.value,c=document.getElementById("ph-gen-confirm-btn");if(!n){showToast("Selecciona un período.","warning");return}c.disabled=!0,c.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Generando...';try{const p=await API.generatePhInvoices(n,i);showToast(`${p} facturas generadas para ${qe(n)}.`,"success"),closeModal();const m=document.getElementById("ph-period-filter");m&&(m.value=n);const f=document.getElementById("ph-inv-tbody");if(f){const d=pb.escapeFilterValue(n),g=await API.getPhInvoices({filter:`period="${d}"`,perPage:200});f.innerHTML=Ta(g.items||[]),Qe()}}catch(p){showToast(p.message||"Error al generar facturas.","error"),c.disabled=!1,c.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> Generar'}},{once:!0})},50)}async function Ga(e){var t,a,o,s;try{const[n,i]=await Promise.all([pb.get("ph_invoices",e,{expand:"property_id,property_id.owner_id,tx_id"}),API.getPhInvoiceLines(e)]),c=(t=n.expand)==null?void 0:t.property_id,r=(a=c==null?void 0:c.expand)==null?void 0:a.owner_id,l=dt[n.status]||dt.draft,p=n.status==="draft",m=d=>/inter[eé]s de mora/i.test(String((d==null?void 0:d.description)||"")),f=d=>p&&!(d!=null&&d.concept_id)&&!m(d);openModal(`Factura ${n.number}`,`<div class="space-y-4">
        <div class="grid grid-cols-2 gap-3 p-3 rounded-xl" style="background:#F8FAFF">
          <div><p class="text-xs" style="color:#6B7280">Unidad</p><p class="font-bold" style="color:#0D2137">${esc((c==null?void 0:c.name)||(c==null?void 0:c.code)||n.property_id)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Tipo</p><p class="font-semibold" style="color:#374151">${esc((c==null?void 0:c.unit_type)||"—")}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Propietario</p><p class="font-semibold" style="color:#374151">${esc((r==null?void 0:r.name)||"—")}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Período</p><p class="font-semibold" style="color:#374151">${qe(n.period)}</p></div>
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
                ${f(d)?`<div class="flex gap-1">
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
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>'),p&&setTimeout(()=>{document.querySelectorAll(".ph-line-edit").forEach(d=>{d.addEventListener("click",()=>ji(d.dataset.lineId,d.dataset.invId))}),document.querySelectorAll(".ph-line-del").forEach(d=>{d.addEventListener("click",()=>Hi(d.dataset.lineId,d.dataset.invId))})},30)}catch(n){showToast(n.message||"Error al cargar la factura.","error")}}async function ji(e,t){let a;try{a=await pb.get("ph_invoice_lines",e)}catch{showToast("No se pudo cargar la línea.","error");return}openModal("Editar Concepto Manual",`<div class="space-y-4">
      <div class="form-group mb-0">
        <label class="form-label">Descripción <span class="text-red-500">*</span></label>
        <input id="ph-line-edit-desc" class="form-input" value="${esc(a.description||"")}">
      </div>
      <div class="form-group mb-0">
        <label class="form-label">Valor <span class="text-red-500">*</span></label>
        <input id="ph-line-edit-amount" type="number" min="0" step="1" class="form-input" value="${esc(a.amount||0)}">
      </div>
    </div>`,`<button class="btn btn-outline" onclick="openPhInvoiceDetail('${esc(t)}')">Cancelar</button>
     <button class="btn btn-primary" id="ph-line-edit-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-line-edit-save-btn"))==null||o.addEventListener("click",async()=>{var c,r;const s=(((c=document.getElementById("ph-line-edit-desc"))==null?void 0:c.value)||"").trim(),n=parseFloat(((r=document.getElementById("ph-line-edit-amount"))==null?void 0:r.value)||0)||0;if(!s||n<=0){showToast("Descripción y valor son obligatorios.","warning");return}const i=document.getElementById("ph-line-edit-save-btn");i&&(i.disabled=!0,i.textContent="Guardando...");try{await API.updatePhDraftInvoiceLine(e,{description:s,amount:n,account_code:a.account_code||""}),showToast("Línea actualizada.","success"),Ga(t)}catch(l){showToast(l.message||"Error al actualizar línea.","error"),i&&(i.disabled=!1,i.innerHTML='<i class="fas fa-save mr-1"></i>Guardar')}},{once:!0})},40)}async function Hi(e,t){if(confirm("¿Eliminar este concepto manual de la factura?"))try{await API.deletePhDraftInvoiceLine(e),showToast("Línea eliminada.","success"),Ga(t)}catch(a){showToast(a.message||"Error al eliminar línea.","error")}}async function Gi(e,t){if(confirm("¿Contabilizar esta factura? Se generará el asiento contable correspondiente.")){t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i>');try{await API.postPhInvoice(e),showToast("Factura contabilizada correctamente.","success");const a=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);if(a){const o=await pb.get("ph_invoices",e,{expand:"property_id,property_id.owner_id"}),s=dt[o.status];a.querySelector("td:nth-child(7)").innerHTML=`<span class="badge ${s.badge}">${s.label}</span>`,a.querySelector("td:nth-child(8)").innerHTML=`
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(o.id)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          <button class="btn btn-sm ph-inv-paid" data-id="${esc(o.id)}" title="Marcar pagada"
            style="background:#EEF4FF;color:#2446B8;border:1.5px solid #93C5FD"><i class="fas fa-coins"></i></button>
          ${can("canApprove")?`<button class="btn btn-outline btn-sm ph-inv-unpost" data-id="${esc(o.id)}" title="Descontabilizar factura"
            style="color:#1A4B8C;border-color:#93C5FD"><i class="fas fa-rotate-left"></i></button>`:""}
          <button class="btn btn-outline btn-sm ph-inv-void" data-id="${esc(o.id)}" title="Anular"
            style="color:#DC2626;border-color:#FECACA"><i class="fas fa-ban"></i></button>
        </div>`,Qe()}}catch(a){showToast(a.message||"Error al contabilizar.","error"),t&&(t.disabled=!1,t.innerHTML='<i class="fas fa-check"></i>')}}}async function qi(e,t){if(confirm("¿Marcar esta factura como pagada?")){t&&(t.disabled=!0);try{await API.markPhInvoicePaid(e),showToast("Factura marcada como pagada.","success");const a=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);a&&(a.querySelector("td:nth-child(7)").innerHTML='<span class="badge badge-blue">Pagada</span>',a.querySelector("td:nth-child(8)").innerHTML=`
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(e)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          ${can("canApprove")?`<button class="btn btn-outline btn-sm ph-inv-unpost" data-id="${esc(e)}" title="Descontabilizar factura"
            style="color:#1A4B8C;border-color:#93C5FD"><i class="fas fa-rotate-left"></i></button>`:""}
        </div>`,Qe())}catch(a){showToast(a.message||"Error.","error"),t&&(t.disabled=!1)}}}async function zi(e,t){if(confirm("¿Descontabilizar esta factura? Volverá a estado Borrador y se desligará del asiento.")){t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i>');try{await API.unpostPhInvoice(e),showToast("Factura descontabilizada correctamente.","success");const a=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);if(a){const o=dt.draft||{badge:"badge-orange",label:"Borrador"};a.style.opacity="",a.querySelector("td:nth-child(7)").innerHTML=`<span class="badge ${o.badge}">${o.label}</span>`,a.querySelector("td:nth-child(8)").innerHTML=`
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(e)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm ph-inv-add-individual" data-id="${esc(e)}" title="Añadir concepto individual"
            style="color:#7F7CFF;border-color:#C4B5FD"><i class="fas fa-plus-circle"></i></button>
          <button class="btn btn-sm ph-inv-post" data-id="${esc(e)}" title="Contabilizar"
            style="background:#ECFDF5;color:#059669;border:1.5px solid #6EE7B7"><i class="fas fa-check"></i></button>
          <button class="btn btn-outline btn-sm ph-inv-void" data-id="${esc(e)}" title="Anular"
            style="color:#DC2626;border-color:#FECACA"><i class="fas fa-ban"></i></button>
        </div>`,Qe()}}catch(a){showToast(a.message||"Error al descontabilizar factura.","error"),t&&(t.disabled=!1,t.innerHTML='<i class="fas fa-rotate-left"></i>')}}}function Wi(e){openModal("Anular Factura PH",`<div class="space-y-4">
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
            <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(e)}" title="Ver detalle"><i class="fas fa-eye"></i></button>`,Qe())}catch(n){showToast(n.message||"Error al anular.","error"),o&&(o.disabled=!1,o.textContent="Anular")}},{once:!0})},50)}async function Yi(e){var t,a,o;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando cartera...</div>';try{let s=function(){const f=new Date,d=f.getFullYear(),g=String(f.getMonth()+1).padStart(2,"0"),u=String(f.getDate()).padStart(2,"0");return`${d}${g}${u}`},n=function(f){const d=document.getElementById("ph-cartera-integrity");if(!d)return;if(!f){d.innerHTML="";return}const g=f.isBalanced?{bg:"#ECFDF5",border:"#6EE7B7",color:"#065F46",icon:"fa-circle-check",title:"Integridad OK"}:{bg:"#FFF7ED",border:"#FDBA74",color:"#9A3412",icon:"fa-triangle-exclamation",title:"Descuadres detectados"};d.innerHTML=`
        <div class="rounded-2xl border p-4" style="background:${g.bg};border-color:${g.border}">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div class="font-bold" style="color:${g.color}">
              <i class="fas ${g.icon} mr-2"></i>${g.title}
            </div>
            <div class="text-sm" style="color:${g.color}">
              Facturas: <strong>${f.totals.invoices}</strong> | Líneas: <strong>${f.totals.lines}</strong>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm" style="color:${g.color}">
            <div>Total facturas: <strong>${fmt(f.totals.totalFacturas)}</strong></div>
            <div>Total líneas: <strong>${fmt(f.totals.totalLineas)}</strong></div>
            <div>Pendiente: <strong>${fmt(f.totals.totalPendiente)}</strong></div>
            <div>Cancelado: <strong>${fmt(f.totals.totalCancelado)}</strong></div>
            <div>Diferencia global: <strong>${fmt(f.totals.diferenciaGlobal)}</strong></div>
          </div>
          ${f.mismatches.length?`
            <div class="mt-3 text-sm" style="color:${g.color}">
              <div class="font-semibold mb-1">Facturas descuadradas (Top ${Math.min(5,f.mismatches.length)}):</div>
              ${f.mismatches.slice(0,5).map(u=>`<div>#${esc(u.number)} (${esc(u.period)}): Factura ${fmt(u.totalFactura)} vs Líneas ${fmt(u.totalLineas)} (dif ${fmt(u.diferencia)})</div>`).join("")}
            </div>`:""}
        </div>`};const i=await API.getPhProperties(!1);e.innerHTML=`
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <div>
            <label class="form-label mb-1">Unidad</label>
            <select id="ph-cartera-unit-filter" class="form-input">
              <option value="">— Todas las unidades —</option>
              ${i.map(f=>`<option value="${esc(f.id)}">${esc(f.code)} - ${esc(f.name)}</option>`).join("")}
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
      </div>`,e.querySelectorAll(".cartera-tab-btn").forEach(f=>{f.addEventListener("click",()=>{e.querySelectorAll(".cartera-tab-btn").forEach(g=>g.classList.toggle("active",g===f));const d=f.dataset.tab;e.querySelectorAll(".cartera-tab-content").forEach(g=>g.style.display="none"),e.querySelector(`#ph-cartera-${d}`).style.display=""})});let c=null,r=null;async function l(){var d,g,u,y,v,b;if(!((d=c==null?void 0:c.rows)!=null&&d.length)){showToast("No hay datos para exportar en Saldos CxC.","warning");return}const f=typeof getPdfCtorOrWarn=="function"?getPdfCtorOrWarn():null;if(f)try{const h=typeof getPdfHeaderContext=="function"?await getPdfHeaderContext():{companyName:"GRAVY",companyNit:"N/A",companyAddress:"",softwareName:"GRAVY v2.0",userName:String(sessionStorage.getItem("user_name")||"Usuario").trim(),generatedAt:new Date().toLocaleString("es-CO")},_=new f({orientation:"landscape",unit:"pt",format:"letter"}),A=document.getElementById("ph-cartera-unit-filter"),C=((y=(u=(g=A==null?void 0:A.selectedOptions)==null?void 0:g[0])==null?void 0:u.textContent)==null?void 0:y.trim())||"Todas las unidades",I=((v=document.getElementById("ph-cartera-from"))==null?void 0:v.value)||"—",N=((b=document.getElementById("ph-cartera-to"))==null?void 0:b.value)||"—",T=typeof drawPdfHeader=="function"?drawPdfHeader(_,h,{title:"Copropiedades - Saldos CxC por Concepto",subtitles:[`Unidad: ${C}`,`Periodo: ${I} a ${N}`]}):{marginLeft:24,marginRight:_.internal.pageSize.getWidth()-24,startY:50},S=[["Unidad",...c.concepts.map(E=>E.label),"Total general"]],w=c.rows.map(E=>[E.unidad,...c.concepts.map(L=>{const R=Number(E.byConcept[L.id]||0);return R?typeof fmtPdfNum=="function"?fmtPdfNum(R):fmt(R):""}),typeof fmtPdfNum=="function"?fmtPdfNum(E.totalGeneral||0):fmt(E.totalGeneral||0)]);w.push(["TOTAL",...c.concepts.map(E=>{const L=Number(c.totalByConcept[E.id]||0);return L?typeof fmtPdfNum=="function"?fmtPdfNum(L):fmt(L):""}),typeof fmtPdfNum=="function"?fmtPdfNum(c.grandTotal||0):fmt(c.grandTotal||0)]),_.autoTable({startY:T.startY,head:S,body:w,theme:"plain",margin:{top:T.startY,left:T.marginLeft,right:24,bottom:24},styles:{font:"helvetica",fontSize:7,textColor:[55,55,55],cellPadding:2.2,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:7.2,lineWidth:{bottom:.25}},didParseCell:E=>{if(E.section!=="body")return;E.row.index===w.length-1&&(E.cell.styles.fontStyle="bold",E.cell.styles.fillColor=[236,236,236],E.cell.styles.textColor=[13,33,55],E.cell.styles.lineWidth={top:.2},E.cell.styles.lineColor=[13,33,55]),E.column.index>0&&(E.cell.styles.halign="right")},didDrawPage:E=>{typeof drawPdfFooter=="function"&&drawPdfFooter(_,E.pageNumber)}}),_.save(`ph_saldos_cxc_${s()}.pdf`)}catch(h){showToast(`Error al generar PDF: ${h.message}`,"error")}}async function p(){var d,g,u,y,v,b,h;if(!((d=r==null?void 0:r.rows)!=null&&d.length)){showToast("No hay datos para exportar en Cartera por Edades.","warning");return}const f=typeof getPdfCtorOrWarn=="function"?getPdfCtorOrWarn():null;if(f)try{const _=typeof getPdfHeaderContext=="function"?await getPdfHeaderContext():{companyName:"GRAVY",companyNit:"N/A",companyAddress:"",softwareName:"GRAVY v2.0",userName:String(sessionStorage.getItem("user_name")||"Usuario").trim(),generatedAt:new Date().toLocaleString("es-CO")},A=new f({orientation:"landscape",unit:"pt",format:"letter"}),C=document.getElementById("ph-cartera-unit-filter"),I=((y=(u=(g=C==null?void 0:C.selectedOptions)==null?void 0:g[0])==null?void 0:u.textContent)==null?void 0:y.trim())||"Todas las unidades",N=((v=document.getElementById("ph-cartera-from"))==null?void 0:v.value)||"—",T=((b=document.getElementById("ph-cartera-to"))==null?void 0:b.value)||"—",S=typeof drawPdfHeader=="function"?drawPdfHeader(A,_,{title:"Copropiedades - Cartera por Edades",subtitles:[`Unidad: ${I}`,`Periodo: ${N} a ${T}`]}):{marginLeft:24,marginRight:A.internal.pageSize.getWidth()-24,startY:50},w=r.rows,E=[];let L=null,R={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0};for(let B=0;B<w.length;B++){const M=w[B];L!==M.unidad&&(L=M.unidad,R={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0}),E.push([M.unidad,M.concepto,"","","","",typeof fmtPdfNum=="function"?fmtPdfNum(M.por_vencer||0):fmt(M.por_vencer||0),typeof fmtPdfNum=="function"?fmtPdfNum(M.de_0_a_30||0):fmt(M.de_0_a_30||0),typeof fmtPdfNum=="function"?fmtPdfNum(M.de_31_a_60||0):fmt(M.de_31_a_60||0),typeof fmtPdfNum=="function"?fmtPdfNum(M.de_61_a_90||0):fmt(M.de_61_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(M.mayor_a_90||0):fmt(M.mayor_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(M.total||0):fmt(M.total||0)]),R.por_vencer+=M.por_vencer,R.de_0_a_30+=M.de_0_a_30,R.de_31_a_60+=M.de_31_a_60,R.de_61_a_90+=M.de_61_a_90,R.mayor_a_90+=M.mayor_a_90,R.total+=M.total,((h=w[B+1])==null?void 0:h.unidad)!==L&&E.push([`Subtotal ${L}`,"","","","","",typeof fmtPdfNum=="function"?fmtPdfNum(R.por_vencer):fmt(R.por_vencer),typeof fmtPdfNum=="function"?fmtPdfNum(R.de_0_a_30):fmt(R.de_0_a_30),typeof fmtPdfNum=="function"?fmtPdfNum(R.de_31_a_60):fmt(R.de_31_a_60),typeof fmtPdfNum=="function"?fmtPdfNum(R.de_61_a_90):fmt(R.de_61_a_90),typeof fmtPdfNum=="function"?fmtPdfNum(R.mayor_a_90):fmt(R.mayor_a_90),typeof fmtPdfNum=="function"?fmtPdfNum(R.total):fmt(R.total)])}E.push(["TOTAL","","","","","",typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.por_vencer||0):fmt(r.totals.por_vencer||0),typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.de_0_a_30||0):fmt(r.totals.de_0_a_30||0),typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.de_31_a_60||0):fmt(r.totals.de_31_a_60||0),typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.de_61_a_90||0):fmt(r.totals.de_61_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.mayor_a_90||0):fmt(r.totals.mayor_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(r.totals.total||0):fmt(r.totals.total||0)]),A.autoTable({startY:S.startY,head:[["Unidad","Concepto","","","","","Por Vencer","0-30","31-60","61-90","Mas de 90","Total"]],body:E,theme:"plain",margin:{top:S.startY,left:S.marginLeft,right:24,bottom:24},styles:{font:"helvetica",fontSize:6.8,textColor:[55,55,55],cellPadding:2.1,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:7,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:110},1:{cellWidth:95},2:{cellWidth:20},3:{cellWidth:20},4:{cellWidth:20},5:{cellWidth:20},6:{cellWidth:58,halign:"right"},7:{cellWidth:47,halign:"right"},8:{cellWidth:47,halign:"right"},9:{cellWidth:47,halign:"right"},10:{cellWidth:54,halign:"right"},11:{cellWidth:55,halign:"right"}},didParseCell:B=>{var j;if(B.section!=="body")return;const M=B.row.index===E.length-1,k=(j=B.row.raw[0])==null?void 0:j.startsWith("Subtotal ");(M||k)&&(B.cell.styles.fontStyle="bold",B.cell.styles.fillColor=[236,236,236],B.cell.styles.textColor=[13,33,55],B.cell.styles.lineWidth={top:.2},B.cell.styles.lineColor=[13,33,55])},didDrawPage:B=>{typeof drawPdfFooter=="function"&&drawPdfFooter(A,B.pageNumber)}}),A.save(`ph_cartera_edades_${s()}.pdf`)}catch(_){showToast(`Error al generar PDF: ${_.message}`,"error")}}async function m(){var _,A,C;const f=((_=document.getElementById("ph-cartera-unit-filter"))==null?void 0:_.value)||"",d=((A=document.getElementById("ph-cartera-to"))==null?void 0:A.value)||"",g=((C=document.getElementById("ph-cartera-concept-filter"))==null?void 0:C.value)||"",u=document.getElementById("ph-cartera-resumen-thead"),y=document.getElementById("ph-cartera-resumen-colgroup"),v=I=>String(I||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toUpperCase(),h=(await API.getPhCarteraOpenParties(f,"",d,{conceptoId:g,estado:"all"})).filter(I=>I.estado!=="cancelado");try{const[I,N]=await Promise.all([API.getPhCarteraByUnit(f,"",d),API.getPhCarteraIntegrity(f,"",d)]);n(N);const T=document.getElementById("ph-cartera-concept-filter");if(T){const S=T.value;T.innerHTML=`<option value="">— Todos —</option>${I.map(w=>`<option value="${esc(w.conceptoId)}">${esc(w.concepto)}</option>`).join("")}`,T.value=S}if(I.length===0||h.length===0){y&&(y.innerHTML=`
              <col style="width:260px">
              <col style="width:160px">`),u&&(u.innerHTML=`
            <tr>
              <th>Unidad</th>
              <th class="text-right">Total general</th>
            </tr>`),document.getElementById("ph-cartera-resumen-tbody").innerHTML=`
            <tr><td colspan="2" class="text-center py-4" style="color:#9CA3AF">No hay saldos abiertos para los filtros seleccionados.</td></tr>`,document.getElementById("ph-cartera-resumen-tfoot").innerHTML="",document.getElementById("ph-cartera-bal-meta").innerHTML='<i class="fas fa-info-circle mr-1"></i>Sin datos de saldo abierto.',c=null;const S=document.getElementById("ph-cartera-pdf-bal");S&&(S.disabled=!0)}else{const S=new Map;for(const j of h){const Y=String(j.concepto||"Concepto").trim()||"Concepto",W=v(Y);S.has(W)||S.set(W,Y)}const w=[...S.entries()].map(([j,Y])=>({id:j,label:Y})).sort((j,Y)=>j.label.localeCompare(Y.label,"es")),E=new Map;for(const j of h){const Y=[j.propertyCode,j.propertyName].filter(Boolean).join(" - ")||"Unidad",W=`${j.propertyId}|${Y}`;E.has(W)||E.set(W,{unidad:Y,byConcept:{},totalGeneral:0});const K=E.get(W),H=v(j.concepto||"Concepto");K.byConcept[H]=(K.byConcept[H]||0)+Number(j.amount||0),K.totalGeneral+=Number(j.amount||0)}const L=[...E.values()].sort((j,Y)=>j.unidad.localeCompare(Y.unidad,"es")),R={};let B=0;for(const j of L){B+=Number(j.totalGeneral||0);for(const Y of w)R[Y.id]=(R[Y.id]||0)+Number(j.byConcept[Y.id]||0)}const M=new Set(h.map(j=>String(j.invoiceId||""))).size;document.getElementById("ph-cartera-bal-meta").innerHTML=`Unidades: <strong>${fmtN(L.length)}</strong> · Conceptos: <strong>${fmtN(w.length)}</strong> · Documentos: <strong>${fmtN(M)}</strong> · Saldo abierto: <strong>${fmt(B)}</strong>`,y&&(y.innerHTML=`
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
              <td class="font-bold text-right">${fmt(B)}</td>
            </tr>`,c={concepts:w,rows:L,totalByConcept:R,grandTotal:B};const k=document.getElementById("ph-cartera-pdf-bal");k&&(k.disabled=!1)}}catch(I){console.error(I),y&&(y.innerHTML=`
            <col style="width:260px">
            <col style="width:160px">`),u&&(u.innerHTML=`
          <tr>
            <th>Unidad</th>
            <th class="text-right">Total general</th>
          </tr>`),document.getElementById("ph-cartera-resumen-tbody").innerHTML=`
          <tr><td colspan="2" class="text-center py-4" style="color:#EF4444">${esc(I.message)}</td></tr>`,document.getElementById("ph-cartera-resumen-tfoot").innerHTML="",n(null),c=null;const N=document.getElementById("ph-cartera-pdf-bal");N&&(N.disabled=!0)}try{if(h.length===0){document.getElementById("ph-cartera-detalle-tbody").innerHTML=`
            <tr><td colspan="12" class="text-center py-4" style="color:#9CA3AF">No hay cartera abierta para los filtros seleccionados.</td></tr>`,document.getElementById("ph-cartera-detalle-tfoot").innerHTML="",document.getElementById("ph-cartera-aging-meta").innerHTML='<i class="fas fa-info-circle mr-1"></i>Sin datos de cartera por edades.',r=null;const I=document.getElementById("ph-cartera-pdf-aging");I&&(I.disabled=!0)}else{const I=L=>{const R=Number(L||0);return R<0?"por_vencer":R<=30?"b0_30":R<=60?"b31_60":R<=90?"b61_90":"b90p"},N={};for(const L of h){const R=I(L.diasMoraRaw!==void 0?L.diasMoraRaw:L.diasMora),B=Number(L.amount||0),M=[L.propertyCode,L.propertyName].filter(Boolean).join(" - ")||"Unidad",k=L.concepto||"Concepto";N[M]||(N[M]={}),N[M][k]||(N[M][k]={unidad:M,concepto:k,por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0});const j=N[M][k];R==="por_vencer"?j.por_vencer+=B:R==="b0_30"?j.de_0_a_30+=B:R==="b31_60"?j.de_31_a_60+=B:R==="b61_90"?j.de_61_a_90+=B:R==="b90p"&&(j.mayor_a_90+=B),j.total+=B}const T=[],S=[];let w={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0};Object.keys(N).sort((L,R)=>L.localeCompare(R,"es")).forEach(L=>{const R=N[L];let B={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0};S.push(`<tr style="background:#F0F4F8">
              <td colspan="12" style="font-weight:600;padding:5px 10px;font-size:12px;color:#0D2137;border-top:1px solid #D1D5DB">
                <i class="fas fa-building mr-1" style="color:#E87D1E"></i>${esc(L)}
              </td>
            </tr>`),Object.keys(R).sort((M,k)=>M.localeCompare(k,"es")).forEach(M=>{const k=R[M];S.push(`<tr>
                <td>${esc(k.unidad)}</td>
                <td>${esc(k.concepto)}</td>
                <td colspan="4"></td>
                <td class="text-right" style="color:#059669">${fmt(k.por_vencer)}</td>
                <td class="text-right">${fmt(k.de_0_a_30)}</td>
                <td class="text-right">${fmt(k.de_31_a_60)}</td>
                <td class="text-right">${fmt(k.de_61_a_90)}</td>
                <td class="text-right font-semibold">${fmt(k.mayor_a_90)}</td>
                <td class="text-right font-semibold" style="color:#0D2137">${fmt(k.total)}</td>
              </tr>`),T.push({...k}),B.por_vencer+=k.por_vencer,B.de_0_a_30+=k.de_0_a_30,B.de_31_a_60+=k.de_31_a_60,B.de_61_a_90+=k.de_61_a_90,B.mayor_a_90+=k.mayor_a_90,B.total+=k.total}),S.push(`<tr style="background:#FDF6E3">
              <td colspan="6" class="font-bold">Subtotal ${esc(L)}</td>
              <td class="font-bold text-right" style="color:#059669">${fmt(B.por_vencer)}</td>
              <td class="font-bold text-right">${fmt(B.de_0_a_30)}</td>
              <td class="font-bold text-right">${fmt(B.de_31_a_60)}</td>
              <td class="font-bold text-right">${fmt(B.de_61_a_90)}</td>
              <td class="font-bold text-right">${fmt(B.mayor_a_90)}</td>
              <td class="font-bold text-right">${fmt(B.total)}</td>
            </tr>`),w.por_vencer+=B.por_vencer,w.de_0_a_30+=B.de_0_a_30,w.de_31_a_60+=B.de_31_a_60,w.de_61_a_90+=B.de_61_a_90,w.mayor_a_90+=B.mayor_a_90,w.total+=B.total}),document.getElementById("ph-cartera-aging-meta").innerHTML=`Unidades: <strong>${Object.keys(N).length}</strong> · Total: <strong>${fmt(w.total)}</strong>`,document.getElementById("ph-cartera-detalle-tbody").innerHTML=S.join(""),document.getElementById("ph-cartera-detalle-tfoot").innerHTML=`
            <tr>
              <td colspan="6" class="font-bold">Total general</td>
              <td class="font-bold text-right" style="color:#059669">${fmt(w.por_vencer)}</td>
              <td class="font-bold text-right">${fmt(w.de_0_a_30)}</td>
              <td class="font-bold text-right">${fmt(w.de_31_a_60)}</td>
              <td class="font-bold text-right">${fmt(w.de_61_a_90)}</td>
              <td class="font-bold text-right">${fmt(w.mayor_a_90)}</td>
              <td class="font-bold text-right">${fmt(w.total)}</td>
            </tr>`,r={rows:T,totals:w};const E=document.getElementById("ph-cartera-pdf-aging");E&&(E.disabled=!1)}}catch(I){console.error(I),document.getElementById("ph-cartera-detalle-tbody").innerHTML=`
          <tr><td colspan="12" class="text-center py-4" style="color:#EF4444">${esc(I.message)}</td></tr>`,document.getElementById("ph-cartera-detalle-tfoot").innerHTML="",r=null;const N=document.getElementById("ph-cartera-pdf-aging");N&&(N.disabled=!0)}}(t=document.getElementById("ph-cartera-refresh-btn"))==null||t.addEventListener("click",m),(a=document.getElementById("ph-cartera-pdf-bal"))==null||a.addEventListener("click",l),(o=document.getElementById("ph-cartera-pdf-aging"))==null||o.addEventListener("click",p)}catch(s){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(s.message)}</div>`}}async function qa(e){var t,a;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const o=await API.getPhProperties(!1),s=can("canWrite"),n=o.filter(c=>c.active!==!1).length,i=o.length-n;e.innerHTML=`
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
              ${Ji(o,s)}
            </tbody>
          </table>
        </div>
      </div>`,(t=document.getElementById("ph-unit-search"))==null||t.addEventListener("input",debounce(()=>{var r;const c=(((r=document.getElementById("ph-unit-search"))==null?void 0:r.value)||"").toLowerCase();document.querySelectorAll("#ph-units-tbody tr").forEach(l=>{l.style.display=c&&!l.textContent.toLowerCase().includes(c)?"none":""})},150)),(a=document.getElementById("ph-unit-add-btn"))==null||a.addEventListener("click",()=>go(null,e)),s&&(e.querySelectorAll(".ph-unit-edit").forEach(c=>{c.addEventListener("click",()=>go(c.dataset.id,e))}),e.querySelectorAll(".ph-unit-toggle").forEach(c=>{c.addEventListener("click",()=>Ki(c.dataset.id,c.dataset.active==="true",e))}))}catch(o){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(o.message)}</div>`}}function Ji(e,t=can("canWrite")){return e.length?e.map(a=>{var n;const o=(n=a.expand)==null?void 0:n.owner_id,s=a.active!==!1;return`<tr>
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
          ${Oi.map(n=>`<option value="${n}" ${(a==null?void 0:a.unit_type)===n?"selected":""}>${n}</option>`).join("")}
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
     <button class="btn btn-primary" id="pu-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var n;(n=document.getElementById("pu-save-btn"))==null||n.addEventListener("click",async()=>{var m,f,d,g,u,y,v,b,h,_,A;const i=(((m=document.getElementById("pu-code"))==null?void 0:m.value)||"").trim(),c=(((f=document.getElementById("pu-name"))==null?void 0:f.value)||"").trim(),r=((d=document.getElementById("pu-type"))==null?void 0:d.value)||"APARTAMENTO";if(!i||!c){showToast("Código y nombre son obligatorios.","warning");return}const l={code:i,name:c,unit_type:r,tower:(((g=document.getElementById("pu-tower"))==null?void 0:g.value)||"").trim(),apartment:(((u=document.getElementById("pu-apartment"))==null?void 0:u.value)||"").trim(),coef_participacion:parseFloat(((y=document.getElementById("pu-coef"))==null?void 0:y.value)||0)||0,admin_fee:parseFloat(((v=document.getElementById("pu-admin-fee"))==null?void 0:v.value)||0)||0,area_m2:parseFloat(((b=document.getElementById("pu-area"))==null?void 0:b.value)||0)||0,owner_id:((h=document.getElementById("pu-owner"))==null?void 0:h.value)||null,notes:((_=document.getElementById("pu-notes"))==null?void 0:_.value)||"",active:((A=document.getElementById("pu-active"))==null?void 0:A.value)==="true"},p=document.getElementById("pu-save-btn");p&&(p.disabled=!0,p.textContent="Guardando...");try{if(a)await pb.update("ph_properties",a.id,l),await API.logAudit("UPDATE","PhProperty",a.id,`Unidad ${i} actualizada`),showToast("Unidad actualizada.","success");else{l.active=!0;const C=await pb.create("ph_properties",l);await API.logAudit("CREATE","PhProperty",C.id,`Nueva unidad ${i}`),showToast("Unidad creada.","success")}closeModal(),qa(t)}catch(C){showToast(C.message||"Error al guardar.","error"),p&&(p.disabled=!1,p.textContent="Guardar")}},{once:!0})},50)}async function Ki(e,t,a){if(!can("canWrite")){showToast("No tienes permisos para actualizar unidades.","warning");return}const o=t?"desactivar":"activar";if(confirm(`¿${o.charAt(0).toUpperCase()+o.slice(1)} esta unidad?`))try{await pb.update("ph_properties",e,{active:!t}),showToast(`Unidad ${o}da.`,"success"),qa(a)}catch(s){showToast(s.message||"Error.","error")}}async function sa(e){var t,a;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const o=new Date().toISOString().slice(0,10),[s,n]=await Promise.all([API.getPhReservations({filter:`date>="${pb.escapeFilterValue(o)}"`,sort:"date,time_from",perPage:100}),API.getPhCommonAreas(!0)]),i=s.items||[];e.innerHTML=`
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
      </div>`,(t=document.getElementById("ph-res-area-filter"))==null||t.addEventListener("change",async c=>{const r=c.target.value;let l=`date>="${pb.escapeFilterValue(o)}"`;r&&(l+=` && area_id="${pb.escapeFilterValue(r)}"`);const p=await API.getPhReservations({filter:l,sort:"date,time_from",perPage:100});document.getElementById("ph-res-tbody").innerHTML=vo(p.items||[]),ho(e,n)}),(a=document.getElementById("ph-res-add-btn"))==null||a.addEventListener("click",()=>Qi(null,e,n)),ho(e,n)}catch(o){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(o.message)}</div>`}}function vo(e){return e.length?e.map(t=>{var n,i;const a=(n=t.expand)==null?void 0:n.area_id,o=(i=t.expand)==null?void 0:i.property_id,s=bo[t.status]||bo.pending;return`<tr data-res-id="${esc(t.id)}">
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
    </tr>`}).join(""):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay reservas próximas.</td></tr>'}function ho(e,t){e.querySelectorAll(".ph-res-confirm").forEach(a=>{a.addEventListener("click",async()=>{try{await pb.update("ph_reservations",a.dataset.id,{status:"confirmed"}),showToast("Reserva confirmada.","success"),sa(e)}catch(o){showToast(o.message||"Error.","error")}})}),e.querySelectorAll(".ph-res-cancel").forEach(a=>{a.addEventListener("click",async()=>{if(confirm("¿Cancelar esta reserva?"))try{await pb.update("ph_reservations",a.dataset.id,{status:"cancelled"}),showToast("Reserva cancelada.","success"),sa(e)}catch(o){showToast(o.message||"Error.","error")}})})}async function Qi(e,t,a){let o=null,s=a||[],n=[];try{[n]=await Promise.all([API.getPhProperties(!0),e?pb.get("ph_reservations",e,{expand:"area_id,property_id"}).then(c=>{o=c}):Promise.resolve()]),s.length||(s=await API.getPhCommonAreas(!0))}catch{showToast("Error al cargar datos.","error");return}const i=new Date().toISOString().slice(0,10);openModal(o?"Editar Reserva":"Nueva Reserva",`<div class="grid grid-cols-2 gap-4">
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
     <button class="btn btn-primary" id="pr-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var c;(c=document.getElementById("pr-save-btn"))==null||c.addEventListener("click",async()=>{var u,y,v,b,h,_,A;const r=(u=document.getElementById("pr-area"))==null?void 0:u.value,l=(y=document.getElementById("pr-prop"))==null?void 0:y.value,p=(v=document.getElementById("pr-date"))==null?void 0:v.value,m=(b=document.getElementById("pr-from"))==null?void 0:b.value,f=(h=document.getElementById("pr-to"))==null?void 0:h.value;if(!r||!l||!p||!m||!f){showToast("Completa los campos obligatorios.","warning");return}if(f<=m){showToast("La hora fin debe ser posterior a la hora inicio.","warning");return}const d={area_id:r,property_id:l,date:p,time_from:m,time_to:f,attendees:parseInt(((_=document.getElementById("pr-att"))==null?void 0:_.value)||0)||0,notes:((A=document.getElementById("pr-notes"))==null?void 0:A.value)||"",status:"pending"},g=document.getElementById("pr-save-btn");g&&(g.disabled=!0,g.textContent="Guardando...");try{o?(await pb.update("ph_reservations",o.id,d),showToast("Reserva actualizada.","success")):(await pb.create("ph_reservations",d),showToast("Reserva creada.","success")),closeModal(),sa(t)}catch(C){showToast(C.message||"Error.","error"),g&&(g.disabled=!1,g.textContent="Guardar")}},{once:!0})},50)}async function hs(e){var t,a,o;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const[s,n]=await Promise.all([API.getPhPqrs({perPage:100}),API.getPhProperties(!0)]),c=(s.items||[]).filter(f=>(f.status||"open")!=="closed"),r=c.filter(f=>f.status==="open").length,l=c.filter(f=>f.status==="in_process").length,p=c.filter(f=>f.priority==="alta").length;e.innerHTML=`
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
              ${Object.entries(ta).map(([f,d])=>`<option value="${f}">${d.label}</option>`).join("")}
            </select>
            <select id="ph-pqr-type-filter" class="form-input text-sm" style="max-width:160px">
              <option value="">Todos los tipos</option>
              ${oa.map(f=>`<option value="${f.value}">${f.label}</option>`).join("")}
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
      </div>`;async function m(){var y,v;const f=(y=document.getElementById("ph-pqr-status-filter"))==null?void 0:y.value,d=(v=document.getElementById("ph-pqr-type-filter"))==null?void 0:v.value,u=((await API.getPhPqrs({perPage:100})).items||[]).filter(b=>{const h=b.status||"open";return!(!f&&h==="closed"||f&&h!==f||d&&b.pqrs_type!==d)});document.getElementById("ph-pqrs-tbody").innerHTML=yo(u),_o(e,n)}(t=document.getElementById("ph-pqr-status-filter"))==null||t.addEventListener("change",m),(a=document.getElementById("ph-pqr-type-filter"))==null||a.addEventListener("change",m),(o=document.getElementById("ph-pqr-add-btn"))==null||o.addEventListener("click",()=>ys(null,e,n)),_o(e,n)}catch(s){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(s.message)}</div>`}}function yo(e){return e.length?e.map(t=>{var c,r;const a=(c=t.expand)==null?void 0:c.property_id,o=ta[t.status]||ta.open,s=aa[t.priority]||aa.media,n=((r=oa.find(l=>l.value===t.pqrs_type))==null?void 0:r.label)||t.pqrs_type||"—",i=t.created?new Date(t.created).toLocaleDateString("es-CO"):"—";return`<tr>
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
    </tr>`}).join(""):'<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No hay PQRs activas.</td></tr>'}function _o(e,t){e.querySelectorAll(".ph-pqr-view").forEach(a=>{a.addEventListener("click",()=>ys(a.dataset.id,e,t))})}async function ys(e,t,a){var c,r,l;let o=null,s=a||[];try{e&&(o=await pb.get("ph_pqrs",e,{expand:"property_id"})),s.length||(s=await API.getPhProperties(!1))}catch{showToast("Error al cargar datos.","error");return}const n=o?`PQR ${o.number}`:"Nueva PQR",i=Object.entries(ta).map(([p,m])=>`<option value="${p}" ${(o==null?void 0:o.status)===p?"selected":""}>${m.label}</option>`).join("");openModal(n,`<div class="space-y-4">
      ${o?`
        <div class="grid grid-cols-3 gap-3 p-3 rounded-xl text-sm" style="background:#F8FAFF">
          <div><p class="text-xs" style="color:#6B7280">Número</p><p class="font-bold font-mono">${esc(o.number)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Tipo</p><p class="font-semibold">${esc(((c=oa.find(p=>p.value===o.pqrs_type))==null?void 0:c.label)||o.pqrs_type)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Prioridad</p>
            <span class="badge ${((r=aa[o.priority])==null?void 0:r.badge)||"badge-gray"}">${((l=aa[o.priority])==null?void 0:l.label)||o.priority||"—"}</span>
          </div>
        </div>`:""}
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Tipo <span class="text-red-500">*</span></label>
          <select id="pq-type" class="form-input" ${o?"disabled":""}>
            ${oa.map(p=>`<option value="${p.value}" ${(o==null?void 0:o.pqrs_type)===p.value?"selected":""}>${p.label}</option>`).join("")}
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
     </button>`),setTimeout(()=>{var p;(p=document.getElementById("pq-save-btn"))==null||p.addEventListener("click",async()=>{var f,d,g,u,y,v,b,h,_;const m=document.getElementById("pq-save-btn");m&&(m.disabled=!0,m.textContent="Guardando...");try{if(o){const A=(f=document.getElementById("pq-status"))==null?void 0:f.value,C=((d=document.getElementById("pq-response"))==null?void 0:d.value)||"",I=((g=document.getElementById("pq-assigned"))==null?void 0:g.value)||"",N=((u=document.getElementById("pq-priority"))==null?void 0:u.value)||"media",T={status:A,response:C,assigned_to:I,priority:N};(A==="closed"||A==="resolved")&&(T.closed_at=new Date().toISOString().replace("T"," ").slice(0,19)),await pb.update("ph_pqrs",o.id,T),await API.logAudit("UPDATE","PhPqr",o.id,`PQR ${o.number} → ${A}`),showToast("PQR actualizada.","success")}else{const A=(((y=document.getElementById("pq-subject"))==null?void 0:y.value)||"").trim(),C=(((v=document.getElementById("pq-desc"))==null?void 0:v.value)||"").trim(),I=((b=document.getElementById("pq-type"))==null?void 0:b.value)||"PETICION",N=((h=document.getElementById("pq-priority"))==null?void 0:h.value)||"media",T=((_=document.getElementById("pq-prop"))==null?void 0:_.value)||null;if(!A){showToast("El asunto es obligatorio.","warning"),m&&(m.disabled=!1,m.textContent="Crear PQR");return}if(!C){showToast("La descripción es obligatoria.","warning"),m&&(m.disabled=!1,m.textContent="Crear PQR");return}const S=await API.nextPhPqrNumber(),w=await pb.create("ph_pqrs",{number:S,subject:A,description:C,pqrs_type:I,priority:N,property_id:T||null,status:"open",opened_at:new Date().toISOString().replace("T"," ").slice(0,19)});await API.logAudit("CREATE","PhPqr",w.id,`Nueva PQR ${S} — ${A}`),showToast("PQR creada correctamente.","success")}closeModal(),hs(t)}catch(A){showToast(A.message||"Error.","error"),m&&(m.disabled=!1,m.textContent=o?"Actualizar":"Crear PQR")}},{once:!0})},50)}async function Ye(e){var t,a,o,s,n;e.id=e.id||"ph-config-container",e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const[i,c,r,l,p,m]=await Promise.all([API.getPhBillingConcepts(!1),API.getPhCommonAreas(!1),API.getSetting("ph_config_v1"),API.getAccounts(!0),API.getPhProperties(!0),API.getPhIndividualCharges({filter:""}).catch(()=>({items:[]}))]),f=((m==null?void 0:m.items)||[]).slice().sort((I,N)=>{const T=String((I==null?void 0:I.name)||(I==null?void 0:I.description)||"").toLowerCase(),S=String((N==null?void 0:N.name)||(N==null?void 0:N.description)||"").toLowerCase();return T.localeCompare(S)}),d=new Map((p||[]).map(I=>[I.id,I]));let g={};try{g=r?JSON.parse(r):{}}catch{g={}}const u=g.cxc_code||"130505",y=g.income_code||"413505",v=g.late_fee_income_code||y,b=(l||[]).filter(I=>I.active!==!1&&Number(I.level||0)>=3).sort((I,N)=>String(I.code||"").localeCompare(String(N.code||""))),h=new Map(b.map(I=>[String(I.code||""),I])),_=b.filter(I=>String(I.code||"").startsWith("1")),A=b.filter(I=>String(I.code||"").startsWith("4")),C=(I,N="")=>{const T=String(N||""),S=I.some(E=>String(E.code||"")===T);return`${T&&!S?`<option value="${esc(T)}" selected>${esc(T)} — (No encontrada en PUC activo)</option>`:""}<option value="">— Seleccionar cuenta —</option>${I.map(E=>`<option value="${esc(E.code)}"${String(E.code||"")===T?" selected":""}>${esc(E.code)} — ${esc(E.name||"")}</option>`).join("")}`};e.innerHTML=`
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
            ${Zi(c,e)}
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
                ${tc(i,l)}
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
              value="${g.late_fee_rate||2}" placeholder="2">
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
              ${i.filter(I=>I.active!==!1).map(I=>`
                <label class="flex items-center gap-2 p-3 rounded-lg" style="background:#F8FAFF;border:1px solid #E5E7EB;cursor:pointer">
                  <input type="checkbox" class="ph-mora-concept" value="${esc(I.id)}" 
                    ${(g.late_fee_concepts||[]).includes(I.id)?"checked":""}>
                  <span class="text-sm font-medium">${esc(I.code)} — ${esc(I.name)}</span>
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
                ${Xi(f,l)}
              </tbody>
            </table>
          </div>
        </div>
      </div>`,(t=document.getElementById("ph-cfg-save-btn"))==null||t.addEventListener("click",async()=>{var S,w;const I=(((S=document.getElementById("ph-cfg-cxc"))==null?void 0:S.value)||"").trim(),N=(((w=document.getElementById("ph-cfg-income"))==null?void 0:w.value)||"").trim();if(!I||!N){showToast("Completa ambas cuentas.","warning");return}if(!h.has(I)||!h.has(N)){showToast("Selecciona cuentas válidas del PUC activo.","warning");return}if(!I.startsWith("1")){showToast("La cuenta CxC debe ser de clase 1 (Activo).","warning");return}if(!N.startsWith("4")){showToast("La cuenta de ingreso debe ser de clase 4 (Ingreso).","warning");return}const T=document.getElementById("ph-cfg-save-btn");T&&(T.disabled=!0,T.textContent="Guardando...");try{const E={...g,cxc_code:I,income_code:N};await API.setSetting("ph_config_v1",JSON.stringify(E)),showToast("Configuración guardada.","success")}catch(E){showToast(E.message||"Error.","error")}finally{T&&(T.disabled=!1,T.innerHTML='<i class="fas fa-save mr-1"></i>Guardar Configuración')}}),(a=document.getElementById("ph-mora-save-btn"))==null||a.addEventListener("click",async()=>{var w,E;const I=parseFloat(((w=document.getElementById("ph-late-rate"))==null?void 0:w.value)||.5)||.5,N=(((E=document.getElementById("ph-late-income"))==null?void 0:E.value)||"").trim(),T=Array.from(document.querySelectorAll(".ph-mora-concept:checked")).map(L=>L.value);if(!N){showToast("Selecciona la cuenta de ingreso para mora.","warning");return}if(!h.has(N)||!N.startsWith("4")){showToast("La cuenta de mora debe existir en el PUC activo y ser clase 4.","warning");return}const S=document.getElementById("ph-mora-save-btn");S&&(S.disabled=!0,S.textContent="Guardando...");try{const L={...g,late_fee_rate:I,late_fee_concepts:T,late_fee_income_code:N};await API.setSetting("ph_config_v1",JSON.stringify(L)),showToast("Configuración de mora guardada.","success")}catch(L){showToast(L.message||"Error.","error")}finally{S&&(S.disabled=!1,S.innerHTML='<i class="fas fa-save mr-1"></i>Guardar Configuración de Mora')}}),(o=document.getElementById("ph-individual-concept-add-btn"))==null||o.addEventListener("click",()=>$o(null,e,l)),e.querySelectorAll(".ph-ind-concept-edit").forEach(I=>{I.addEventListener("click",()=>$o(I.dataset.id,e,l))}),e.querySelectorAll(".ph-ind-concept-toggle").forEach(I=>{I.addEventListener("click",async()=>{const N=I.dataset.active==="true";await pb.update("ph_individual_charges",I.dataset.id,{active:!N}),showToast(`Concepto ${N?"desactivado":"activado"}.`,"success"),Ye(e)})}),(s=document.getElementById("ph-area-add-btn"))==null||s.addEventListener("click",()=>xo(null,e)),e.querySelectorAll(".ph-area-edit").forEach(I=>{I.addEventListener("click",()=>xo(I.dataset.id,e))}),e.querySelectorAll(".ph-area-toggle").forEach(I=>{I.addEventListener("click",async()=>{const N=I.dataset.active==="true";await pb.update("ph_common_areas",I.dataset.id,{active:!N}),showToast(`Zona ${N?"desactivada":"activada"}.`,"success"),Ye(e)})}),(n=document.getElementById("ph-concept-add-btn"))==null||n.addEventListener("click",()=>Ao(null,e,l)),e.querySelectorAll(".ph-concept-edit").forEach(I=>{I.addEventListener("click",()=>Ao(I.dataset.id,e,l))}),e.querySelectorAll(".ph-concept-toggle").forEach(I=>{I.addEventListener("click",async()=>{const N=I.dataset.active==="true";await pb.update("ph_billing_concepts",I.dataset.id,{active:!N}),showToast(`Concepto ${N?"desactivado":"activado"}.`,"success"),Ye(e)})})}catch(i){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(i.message)}</div>`}}function Zi(e,t){return e.length?`<div class="space-y-2">
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
  </div>`:'<p class="text-sm text-center py-4" style="color:#9CA3AF">No hay zonas comunes registradas.</p>'}function Xi(e,t){if(!e.length)return'<tr><td colspan="6" class="text-center py-8" style="color:#9CA3AF">No hay conceptos individuales. Crea el primero.</td></tr>';const a=new Map((t||[]).map(o=>[String(o.code||""),o]));return e.map(o=>{var c;const s=o.active!==!1,n=za(o),i=n?((c=a.get(n))==null?void 0:c.name)||n:"—";return`<tr>
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
    </tr>`}).join("")}function za(e){const t=String((e==null?void 0:e.account_code)||"").trim();if(t)return t;const o=String((e==null?void 0:e.notes)||"").match(/\[ACC:([^\]]+)\]/i);return o?String(o[1]||"").trim():""}function ec(e,t){const a=String(e||"").replace(/\[ACC:[^\]]+\]\s*/ig,"").trim(),o=String(t||"").trim();return o?`[ACC:${o}]${a?" "+a:""}`:a}function tc(e,t){return e.length?e.map(a=>{var n;const o=(n=a.expand)==null?void 0:n.account_id,s=a.active!==!1;return`<tr>
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
     <button class="btn btn-primary" id="pa-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var o;(o=document.getElementById("pa-save-btn"))==null||o.addEventListener("click",async()=>{var c,r,l,p,m,f;const s=(((c=document.getElementById("pa-code"))==null?void 0:c.value)||"").trim().toUpperCase(),n=(((r=document.getElementById("pa-name"))==null?void 0:r.value)||"").trim();if(!s||!n){showToast("Código y nombre son obligatorios.","warning");return}const i=document.getElementById("pa-save-btn");i&&(i.disabled=!0,i.textContent="Guardando...");try{const d={code:s,name:n,capacity:parseInt(((l=document.getElementById("pa-cap"))==null?void 0:l.value)||0)||0,min_hours:parseFloat(((p=document.getElementById("pa-minhrs"))==null?void 0:p.value)||0)||0,description:((m=document.getElementById("pa-desc"))==null?void 0:m.value)||"",rules:((f=document.getElementById("pa-rules"))==null?void 0:f.value)||"",active:!0};a?(await pb.update("ph_common_areas",a.id,d),showToast("Zona actualizada.","success")):(await pb.create("ph_common_areas",d),showToast("Zona creada.","success")),closeModal(),Ye(t)}catch(d){showToast(d.message||"Error.","error"),i&&(i.disabled=!1,i.textContent="Guardar")}},{once:!0})},50)}async function Ao(e,t,a){let o=null,s=a||[];try{e&&(o=await pb.get("ph_billing_concepts",e,{expand:"account_id"})),s.length||(s=await API.getAccounts(!0))}catch{showToast("Error al cargar datos.","error");return}s.filter(n=>String(n.code||"").startsWith("4")||String(n.code||"").startsWith("41")),openModal(o?"Editar Concepto":"Nuevo Concepto de Facturación",`<div class="grid grid-cols-2 gap-4">
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
     <button class="btn btn-primary" id="pc-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var n;(n=document.getElementById("pc-save-btn"))==null||n.addEventListener("click",async()=>{var p,m,f,d,g,u;const i=(((p=document.getElementById("pc-code"))==null?void 0:p.value)||"").trim().toUpperCase(),c=(((m=document.getElementById("pc-name"))==null?void 0:m.value)||"").trim(),r=parseFloat(((f=document.getElementById("pc-amount"))==null?void 0:f.value)||0)||0;if(!i||!c||!r){showToast("Código, nombre y valor son obligatorios.","warning");return}const l=document.getElementById("pc-save-btn");l&&(l.disabled=!0,l.textContent="Guardando...");try{const y={code:i,name:c,amount:r,applies_coef:((d=document.getElementById("pc-coef"))==null?void 0:d.value)==="true",account_id:((g=document.getElementById("pc-account"))==null?void 0:g.value)||null,description:((u=document.getElementById("pc-desc"))==null?void 0:u.value)||"",active:!0};o?(await pb.update("ph_billing_concepts",o.id,y),showToast("Concepto actualizado.","success")):(await pb.create("ph_billing_concepts",y),showToast("Concepto creado.","success")),closeModal(),Ye(t)}catch(y){showToast(y.message||"Error.","error"),l&&(l.disabled=!1,l.textContent="Guardar")}},{once:!0})},50)}async function ac(e){var i;let t=null,a=[];try{[t,a]=await Promise.all([pb.get("ph_invoices",e,{expand:"property_id"}),API.getPhIndividualCharges({filter:""})]),a=((a==null?void 0:a.items)||[]).filter(c=>(c==null?void 0:c.active)!==!1)}catch{showToast("Error al cargar datos.","error");return}if(!a.length){showToast("No hay conceptos individuales activos. Crea al menos uno en Configuración.","warning");return}const o=(i=t.expand)==null?void 0:i.property_id,s=o?`${esc(o.name||o.code||"")}`:esc(t.property_id),n=a.slice().sort((c,r)=>{const l=String((c==null?void 0:c.name)||(c==null?void 0:c.description)||"").toLowerCase(),p=String((r==null?void 0:r.name)||(r==null?void 0:r.description)||"").toLowerCase();return l.localeCompare(p)});openModal(`Añadir conceptos individuales — ${s}`,`<div class="space-y-3">
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
     </button>`),setTimeout(()=>{var c;(c=document.getElementById("ph-add-ind-confirm-btn"))==null||c.addEventListener("click",async()=>{const r=[];if(document.querySelectorAll(".ph-add-ind-check:checked").forEach(p=>{const m=p.dataset.idx,f=document.querySelector(`.ph-add-ind-amount[data-idx="${m}"]`),d=parseFloat((f==null?void 0:f.value)||0)||0;d<=0||r.push({description:p.dataset.name,amount:d,account_code:p.dataset.account||""})}),!r.length){showToast("Selecciona al menos un concepto con valor mayor a 0.","warning");return}const l=document.getElementById("ph-add-ind-confirm-btn");l&&(l.disabled=!0,l.textContent="Guardando...");try{const p=await API.addPhIndividualLinesToInvoice(e,r);showToast(`${r.length} concepto(s) añadido(s). Nuevo total: ${fmt(p)}`,"success"),closeModal();const m=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);m&&(m.querySelector("td:nth-child(5)").textContent=fmt(p))}catch(p){showToast(p.message||"Error al añadir conceptos.","error"),l&&(l.disabled=!1,l.innerHTML='<i class="fas fa-plus-circle mr-1"></i>Añadir a factura')}},{once:!0})},50)}async function $o(e,t,a){let o=null,s=a||[],n=[];try{e&&(o=await pb.get("ph_individual_charges",e)),s.length||(s=await API.getAccounts(!0)),n=await API.getPhProperties(!0)}catch{showToast("Error al cargar datos.","error");return}const i=za(o);openModal(o?"Editar Concepto Individual":"Nuevo Concepto Individual",`<div class="grid grid-cols-2 gap-4">
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
     <button class="btn btn-primary" id="pic-save-btn"><i class="fas fa-save mr-1"></i>${o?"Actualizar":"Crear"}</button>`),setTimeout(()=>{var c;(c=document.getElementById("pic-save-btn"))==null||c.addEventListener("click",async()=>{var g,u,y,v,b,h;const r=(((g=document.getElementById("pic-name"))==null?void 0:g.value)||"").trim(),l=(((u=document.getElementById("pic-desc"))==null?void 0:u.value)||"").trim(),p=parseFloat(((y=document.getElementById("pic-amount"))==null?void 0:y.value)||0)||0,m=((v=document.getElementById("pic-active"))==null?void 0:v.value)!=="false",f=(((b=document.getElementById("pic-account"))==null?void 0:b.value)||"").trim();if(!r){showToast("El nombre es obligatorio.","warning");return}const d=document.getElementById("pic-save-btn");d&&(d.disabled=!0,d.textContent="Guardando...");try{const _=(o==null?void 0:o.property_id)||((h=n==null?void 0:n[0])==null?void 0:h.id)||null,A={name:r,description:l||r,amount:p||0,active:m,account_code:f||null,period:(o==null?void 0:o.period)||gt(),notes:ec((o==null?void 0:o.notes)||"",f),property_id:_};o?(await pb.update("ph_individual_charges",o.id,A),showToast("Concepto actualizado.","success")):(await pb.create("ph_individual_charges",A),showToast("Concepto creado. Disponible para añadir a facturas en borrador.","success")),closeModal(),Ye(t)}catch(_){showToast(_.message||"Error al guardar. Si persiste, reinicia el servidor para aplicar la migración.","error"),d&&(d.disabled=!1,d.textContent=o?"Actualizar":"Crear")}},{once:!0})},50)}window.postPhInvoiceConfirm=Gi;window.renderPhIndividualConceptRows=Xi;window.PH_UNIT_TYPES=Oi;window.renderPhConfig=Ye;window.attachPhInvActions=Qe;window.PH_PQRS_STATUS=ta;window.phKpi=Ee;window.attachPhPqrActions=_o;window.openPhPostPeriodModal=Bi;window.getIndividualConceptAccountCode=za;window.voidPhInvoiceModal=Wi;window.openPhEditDraftLineModal=ji;window.renderPhFacturacion=ma;window.renderPhUnitRows=Ji;window.removePhDraftLineConfirm=Hi;window.renderPhAreasList=Zi;window.renderCopropiedades=dl;window.openPhAreaModal=xo;window.openPhResModal=Qi;window.openPhIndividualConceptModal=$o;window.openPhUnpostPeriodModal=Mi;window.openPhConceptModal=Ao;window.openPhDeletePeriodModal=Ui;window.upsertIndividualConceptAccInNotes=ec;window.openPhGenerateModal=Vi;window.attachPhResActions=ho;window.openPhPqrModal=ys;window.renderPhPqrs=hs;window.PH_RES_STATUS=bo;window.renderPhCartera=Yi;window.renderPhPqrRows=yo;window.openPhAddIndividualLinesModal=ac;window.PH_STATUS=dt;window.renderPhReservas=sa;window.PH_PQRS_TYPES=oa;window.markPhPaidConfirm=qi;window.openPhUnitModal=go;window.fmtPeriod=qe;window.openPhInvoiceDetail=Ga;window.renderPhInvRows=Ta;window.renderPhUnidades=qa;window.PH_PQRS_PRIORITY=aa;window.renderPhConceptRows=tc;window.renderPhResRows=vo;window.currentPeriod=gt;window.unpostPhInvoiceConfirm=zi;window._renderPhPage=ki;window.togglePhUnit=Ki;const tt=()=>window.pb;let St=null,Ia=[],Nt=null,Sa=[],na=[];function _s(e){return`${e.doc_number||""} — ${e.name||""}`.trim()}function oc(e,t,a,o,s,n){const i=document.getElementById(e),c=document.getElementById(t),r=document.getElementById(a),l=document.getElementById(o);if(!i||!c||!r||!l)return;const p=na.filter(s),m=(g="")=>{const u=g.toLowerCase().split(/\s+/).filter(Boolean),y=u.length?p.filter(v=>{const b=`${v.doc_number||""} ${v.name||""}`.toLowerCase();return u.every(h=>b.includes(h))}).slice(0,50):p.slice(0,50);if(!y.length){l.innerHTML='<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';return}l.innerHTML=y.map(v=>`<button type="button" data-teso-id="${v.id}" class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
        <div style="font-weight:600">${v.doc_number||"SIN DOC"}</div>
        <div style="font-size:12px;color:#6B7280">${v.name||""}</div>
      </button>`).join("")};(()=>{const g=p.find(u=>u.id===r.value);c.value=g?_s(g):""})(),c.onfocus=()=>{m(c.value),l.style.display="block"},c.oninput=()=>{r.value="",m(c.value),l.style.display="block"},l.onclick=g=>{const u=g.target.closest("[data-teso-id]");if(!u)return;const y=u.dataset.tesoId||"",v=p.find(b=>b.id===y)||null;r.value=y,c.value=v?_s(v):"",l.style.display="none",v&&n(v)};const d=g=>{i.contains(g.target)||(l.style.display="none")};setTimeout(()=>document.addEventListener("click",d),0)}async function sc(e){na.length||(na=await tt().listAll("third_parties",{filter:"active=true",sort:"name"})),e.innerHTML=`
    <div class="form-group mb-4">
      <label class="form-label">Tercero (Cliente / Propietario)</label>
      <div id="teso-rec-wrap" class="relative">
        <input id="teso-rec-search" class="form-input" autocomplete="off" placeholder="Buscar por documento o nombre...">
        <input id="teso-rec-hidden" type="hidden" value="">
        <div id="teso-rec-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
      </div>
    </div>
    <div id="teso-open-items"></div>
    <div id="teso-result"></div>
  `,oc("teso-rec-wrap","teso-rec-search","teso-rec-hidden","teso-rec-results",()=>!0,t=>{St=t,nc(t.id)})}async function nc(e){document.getElementById("teso-open-items").innerHTML='<div class="p-4 text-gray-500"><i class="fas fa-circle-notch fa-spin mr-2"></i>Cargando partidas...</div>',Ia=await tt().listAll("tx_lines",{filter:`third_party_id="${e}" && debit > credit`,expand:"tx_id,account_id"}),pl()}async function ic(){const e=document.getElementById("teso-rec-hidden");e!=null&&e.value&&await nc(e.value)}function pl(){const e=document.getElementById("teso-open-items");if(!Ia.length){e.innerHTML='<div class="text-gray-500 p-4 bg-gray-50 rounded">No hay partidas abiertas para este tercero.</div>';return}e.innerHTML=`
    <h3 class="font-semibold text-lg mb-2">Cuentas por Cobrar — ${St==null?void 0:St.name}</h3>
    <div class="overflow-x-auto mb-4 border rounded">
      <table class="data-table w-full text-sm">
        <thead class="bg-gray-100"><tr>
          <th class="p-2">Comprobante</th><th class="p-2">Fecha</th>
          <th class="p-2">Concepto</th><th class="p-2 text-right">Saldo</th>
        </tr></thead>
        <tbody>
          ${Ia.map(t=>{var a,o,s,n,i,c;return`
            <tr class="border-b">
              <td class="p-2 font-medium">${((o=(a=t.expand)==null?void 0:a.tx_id)==null?void 0:o.number)||"N/A"}</td>
              <td class="p-2 text-gray-500">${(((n=(s=t.expand)==null?void 0:s.tx_id)==null?void 0:n.date)||"").slice(0,10)}</td>
              <td class="p-2">${((c=(i=t.expand)==null?void 0:i.account_id)==null?void 0:c.name)||t.description||""}</td>
              <td class="p-2 text-right font-semibold text-red-600">$${(t.debit-t.credit).toLocaleString("es-CO")}</td>
            </tr>`}).join("")}
        </tbody>
      </table>
    </div>
    <div class="bg-gray-50 p-4 rounded border">
      <h4 class="font-semibold mb-3">Aplicar Recaudo</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="form-group">
          <label class="form-label">Monto Total</label>
          <input id="teso-monto" class="form-input text-lg font-bold text-green-700" type="number" min="1" placeholder="$">
        </div>
        <div class="form-group">
          <label class="form-label">Modo de Aplicación</label>
          <select id="teso-modo" class="form-input">
            <option value="auto">Automático (FIFO)</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>
      <div id="teso-manual-form" style="display:none" class="mb-4"></div>
      <button class="btn btn-primary" id="teso-aplicar">
        <i class="fas fa-check-circle mr-2"></i>Registrar Recibo de Caja (RC)
      </button>
    </div>
  `,document.getElementById("teso-aplicar").onclick=rc,document.getElementById("teso-modo").onchange=cc}function cc(){const e=document.getElementById("teso-modo").value,t=document.getElementById("teso-manual-form");e==="manual"?(t.style.display="",t.innerHTML=`<div class="space-y-2">
      ${Ia.map(a=>{var o,s,n,i;return`
        <div class="flex items-center justify-between p-2 bg-white border rounded">
          <label class="text-sm font-medium">${(s=(o=a.expand)==null?void 0:o.tx_id)==null?void 0:s.number} — ${((i=(n=a.expand)==null?void 0:n.account_id)==null?void 0:i.name)||a.description} (Pendiente: $${(a.debit-a.credit).toLocaleString("es-CO")})</label>
          <input type="number" min="0" max="${a.debit-a.credit}" class="form-input w-32 text-right teso-abono-item" data-id="${a.id}" placeholder="0">
        </div>`}).join("")}
    </div>`):(t.style.display="none",t.innerHTML="")}async function rc(){const e=Number(document.getElementById("teso-monto").value),t=document.getElementById("teso-modo").value;if(!e||e<=0)return;const a=tt();let o={third_party_id:St.id,amount:e};if(t==="manual"){const s=[];document.querySelectorAll(".teso-abono-item").forEach(n=>{const i=Number(n.value);i>0&&s.push({tx_line_id:n.dataset.id,monto:i})}),o.distribucion=s}else o.reglas={prioridadConceptos:[],primeroVencido:!0,primeroMora:!0};try{const s=await a.list("transaction_types",{filter:'code="RC"',perPage:1});if(!s.items.length)throw new Error("No existe el tipo de transacción RC.");await a.create("transactions",{tx_type_id:s.items[0].id,number:`RC-${Date.now()}`,date:new Date().toISOString().slice(0,10),third_party_id:St.id,description:"Recaudo desde Tesorería",status:"active",teso_mode:t,teso_params:JSON.stringify(o)}),document.getElementById("teso-result").innerHTML='<div class="mt-4 p-3 bg-green-100 text-green-800 rounded font-semibold"><i class="fas fa-check mr-2"></i>Recibo de Caja generado y abonos aplicados.</div>',ic()}catch(s){document.getElementById("teso-result").innerHTML=`<div class="mt-4 p-3 bg-red-100 text-red-800 rounded font-semibold"><i class="fas fa-times mr-2"></i>Error: ${s.message}</div>`}}async function lc(e){na.length||(na=await tt().listAll("third_parties",{filter:"active=true",sort:"name"})),e.innerHTML=`
    <div class="form-group mb-4">
      <label class="form-label">Proveedor / Acreedor</label>
      <div id="teso-pago-wrap" class="relative">
        <input id="teso-pago-search" class="form-input" autocomplete="off" placeholder="Buscar por documento o nombre...">
        <input id="teso-pago-hidden" type="hidden" value="">
        <div id="teso-pago-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
      </div>
    </div>
    <div id="teso-prov-items"></div>
    <div id="teso-pago-result"></div>
  `,oc("teso-pago-wrap","teso-pago-search","teso-pago-hidden","teso-pago-results",t=>t.type==="PROVEEDOR"||t.type==="ACREEDOR",t=>{Nt=t,dc(t.id)})}async function dc(e){document.getElementById("teso-prov-items").innerHTML='<div class="p-4 text-gray-500"><i class="fas fa-circle-notch fa-spin mr-2"></i>Cargando obligaciones...</div>',Sa=await tt().listAll("tx_lines",{filter:`third_party_id="${e}" && credit > debit`,expand:"tx_id,account_id"}),ul()}async function pc(){const e=document.getElementById("teso-pago-hidden");e!=null&&e.value&&await dc(e.value)}function ul(){const e=document.getElementById("teso-prov-items");if(!Sa.length){e.innerHTML='<div class="text-gray-500 p-4 bg-gray-50 rounded">No hay obligaciones pendientes.</div>';return}e.innerHTML=`
    <h3 class="font-semibold text-lg mb-2">Cuentas por Pagar — ${Nt==null?void 0:Nt.name}</h3>
    <div class="overflow-x-auto mb-4 border rounded">
      <table class="data-table w-full text-sm">
        <thead class="bg-gray-100"><tr>
          <th class="p-2">Comprobante</th><th class="p-2">Fecha</th>
          <th class="p-2">Concepto</th><th class="p-2 text-right">Saldo</th>
        </tr></thead>
        <tbody>
          ${Sa.map(t=>{var a,o,s,n,i,c;return`
            <tr class="border-b">
              <td class="p-2 font-medium">${((o=(a=t.expand)==null?void 0:a.tx_id)==null?void 0:o.number)||"N/A"}</td>
              <td class="p-2 text-gray-500">${(((n=(s=t.expand)==null?void 0:s.tx_id)==null?void 0:n.date)||"").slice(0,10)}</td>
              <td class="p-2">${((c=(i=t.expand)==null?void 0:i.account_id)==null?void 0:c.name)||t.description||""}</td>
              <td class="p-2 text-right font-semibold text-red-600">$${(t.credit-t.debit).toLocaleString("es-CO")}</td>
            </tr>`}).join("")}
        </tbody>
      </table>
    </div>
    <div class="bg-gray-50 p-4 rounded border">
      <h4 class="font-semibold mb-3">Aplicar Pago</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="form-group">
          <label class="form-label">Monto Total</label>
          <input id="teso-pago-monto" class="form-input text-lg font-bold text-red-700" type="number" min="1" placeholder="$">
        </div>
        <div class="form-group">
          <label class="form-label">Modo de Aplicación</label>
          <select id="teso-pago-modo" class="form-input">
            <option value="auto">Automático (FIFO)</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>
      <div id="teso-pago-manual-form" style="display:none" class="mb-4"></div>
      <button class="btn btn-primary" id="teso-aplicar-pago">
        <i class="fas fa-check-circle mr-2"></i>Registrar Comprobante de Egreso (EG)
      </button>
    </div>
  `,document.getElementById("teso-aplicar-pago").onclick=mc,document.getElementById("teso-pago-modo").onchange=uc}function uc(){const e=document.getElementById("teso-pago-modo").value,t=document.getElementById("teso-pago-manual-form");e==="manual"?(t.style.display="",t.innerHTML=`<div class="space-y-2">
      ${Sa.map(a=>{var o,s,n,i;return`
        <div class="flex items-center justify-between p-2 bg-white border rounded">
          <label class="text-sm font-medium">${(s=(o=a.expand)==null?void 0:o.tx_id)==null?void 0:s.number} — ${((i=(n=a.expand)==null?void 0:n.account_id)==null?void 0:i.name)||a.description} (Pendiente: $${(a.credit-a.debit).toLocaleString("es-CO")})</label>
          <input type="number" min="0" max="${a.credit-a.debit}" class="form-input w-32 text-right teso-pago-item" data-id="${a.id}" placeholder="0">
        </div>`}).join("")}
    </div>`):(t.style.display="none",t.innerHTML="")}async function mc(){const e=Number(document.getElementById("teso-pago-monto").value),t=document.getElementById("teso-pago-modo").value;if(!e||e<=0)return;const a=tt();let o={third_party_id:Nt.id,amount:e};if(t==="manual"){const s=[];document.querySelectorAll(".teso-pago-item").forEach(n=>{const i=Number(n.value);i>0&&s.push({tx_line_id:n.dataset.id,monto:i})}),o.distribucion=s}else o.reglas={prioridadConceptos:[],primeroVencido:!0,primeroMora:!0};try{const s=await a.list("transaction_types",{filter:'code="EG"',perPage:1});if(!s.items.length)throw new Error("No existe el tipo de transacción EG.");await a.create("transactions",{tx_type_id:s.items[0].id,number:`EG-${Date.now()}`,date:new Date().toISOString().slice(0,10),third_party_id:Nt.id,description:"Pago desde Tesorería",status:"active",teso_mode:t,teso_params:JSON.stringify(o)}),document.getElementById("teso-pago-result").innerHTML='<div class="mt-4 p-3 bg-green-100 text-green-800 rounded font-semibold"><i class="fas fa-check mr-2"></i>Egreso generado y pagos aplicados.</div>',pc()}catch(s){document.getElementById("teso-pago-result").innerHTML=`<div class="mt-4 p-3 bg-red-100 text-red-800 rounded font-semibold"><i class="fas fa-times mr-2"></i>Error: ${s.message}</div>`}}async function fc(){const e=document.getElementById("teso-content");if(e)try{const t=tt(),[a,o]=await Promise.all([t.listAll("tx_lines",{filter:"debit > credit"}),t.listAll("tx_lines",{filter:"credit > debit"})]),s=a.reduce((i,c)=>i+(c.debit-c.credit),0),n=o.reduce((i,c)=>i+(c.credit-c.debit),0);e.innerHTML=`
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="p-6 bg-green-50 border border-green-100 rounded-xl shadow-sm">
          <div class="text-sm font-semibold text-green-700 mb-1">Total Cuentas por Cobrar</div>
          <div class="text-4xl font-bold text-green-900">$${s.toLocaleString("es-CO")}</div>
          <div class="text-sm text-gray-500 mt-2">${a.length} partidas abiertas</div>
        </div>
        <div class="p-6 bg-red-50 border border-red-100 rounded-xl shadow-sm">
          <div class="text-sm font-semibold text-red-700 mb-1">Total Cuentas por Pagar</div>
          <div class="text-4xl font-bold text-red-900">$${n.toLocaleString("es-CO")}</div>
          <div class="text-sm text-gray-500 mt-2">${o.length} obligaciones pendientes</div>
        </div>
      </div>
      <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex items-start gap-3">
        <i class="fas fa-info-circle mt-1"></i>
        <div>
          <p class="font-semibold mb-1">Motor de Tesorería Automática</p>
          <p>Al registrar un Recaudo (RC) o Pago (EG), el motor en el backend aplica los abonos automáticamente según las reglas configuradas (FIFO), o en modo manual según la distribución que selecciones en el formulario.</p>
        </div>
      </div>`}catch(t){e.innerHTML=`<div class="text-red-500 p-4">Error cargando dashboard: ${t.message}</div>`}}async function bc(e){try{const t=tt(),a=await t.list("treasury_settings",{perPage:1});let o={primeroVencido:!0,primeroMora:!0};if(a.items.length&&a.items[0].auto_rules)try{o=JSON.parse(a.items[0].auto_rules)}catch{}e.innerHTML=`
      <div class="max-w-2xl">
        <h3 class="text-lg font-semibold mb-4">Configuración de Reglas Automáticas</h3>
        <div class="form-group mb-4">
          <label class="form-label flex items-center gap-2">
            <input type="checkbox" id="teso-cfg-mora" ${o.primeroMora?"checked":""} class="w-4 h-4">
            Priorizar facturas en mora
          </label>
        </div>
        <div class="form-group mb-6">
          <label class="form-label flex items-center gap-2">
            <input type="checkbox" id="teso-cfg-vencido" ${o.primeroVencido?"checked":""} class="w-4 h-4">
            Priorizar facturas más antiguas (FIFO)
          </label>
        </div>
        <button class="btn btn-primary" id="teso-cfg-save">Guardar Configuración</button>
        <div id="teso-cfg-result" class="mt-4"></div>
      </div>`,document.getElementById("teso-cfg-save").onclick=async()=>{const s=document.getElementById("teso-cfg-mora").checked,n=document.getElementById("teso-cfg-vencido").checked,i={prioridadConceptos:[],primeroVencido:n,primeroMora:s};try{a.items.length?await t.update("treasury_settings",a.items[0].id,{auto_rules:JSON.stringify(i)}):await t.create("treasury_settings",{auto_rules:JSON.stringify(i)}),document.getElementById("teso-cfg-result").innerHTML='<span class="text-green-600 font-semibold"><i class="fas fa-check mr-2"></i>Guardado correctamente</span>'}catch(c){document.getElementById("teso-cfg-result").innerHTML=`<span class="text-red-600 font-semibold"><i class="fas fa-times mr-2"></i>Error: ${c.message}</span>`}}}catch(t){e.innerHTML=`<div class="text-red-500 p-4">Error cargando configuración: ${t.message}</div>`}}function gc(e){const t=e||document.getElementById("page-content");t&&(t.innerHTML=`
    <div class="page-header flex items-center justify-between mb-6">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Tesorería Automática</h2>
        <p class="text-gray-500 text-sm mt-1">Gestión de cartera, recaudos, pagos y reglas contables.</p>
      </div>
      <button class="btn btn-outline" id="teso-btn-config"><i class="fas fa-cog mr-2"></i>Configuración</button>
    </div>
    <div class="flex gap-2 mb-6 border-b border-gray-200 pb-2">
      <button class="tab-btn" id="teso-tab-dashboard">Dashboard</button>
      <button class="tab-btn" id="teso-tab-recaudos">Recaudos (CxC)</button>
      <button class="tab-btn" id="teso-tab-pagos">Pagos (CxP)</button>
      <button class="tab-btn" id="teso-tab-config">Configuración</button>
    </div>
    <div id="teso-content" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-96"></div>`,document.getElementById("teso-tab-dashboard").onclick=()=>ot("dashboard"),document.getElementById("teso-tab-recaudos").onclick=()=>ot("recaudos"),document.getElementById("teso-tab-pagos").onclick=()=>ot("pagos"),document.getElementById("teso-tab-config").onclick=()=>ot("config"),document.getElementById("teso-btn-config").onclick=()=>ot("config"),ot("dashboard"))}function ot(e){["dashboard","recaudos","pagos","config"].forEach(a=>{const o=document.getElementById("teso-tab-"+a);o&&o.classList.toggle("active",a===e)});const t=document.getElementById("teso-content");t.innerHTML='<div class="flex justify-center p-10"><i class="fas fa-circle-notch fa-spin text-2xl text-gray-400"></i></div>',e==="dashboard"&&fc(),e==="recaudos"&&sc(t),e==="pagos"&&lc(t),e==="config"&&bc(t)}window.registerModule&&window.registerModule("tesoreria",gc);window.showTesoreriaScreen=gc;window.setTesoTab2=ot;window.renderTesoDashboard=fc;window.renderTesoRecaudos=sc;window.renderTesoPagos=lc;window.renderTesoConfig=bc;window.buscarTercero=ic;window.buscarProveedor=pc;window.prepararTesoPago=mc;window.prepararTesoRecaudoAbono=rc;window.toggleTesoPagoManualForm=uc;window.toggleTesoRecaudoManualForm=cc;document.addEventListener("DOMContentLoaded",async()=>{var s,n,i,c,r,l,p,m,f,d,g;"serviceWorker"in navigator&&navigator.serviceWorker.register("/sw.js").catch(u=>console.warn("[SW] No se pudo registrar:",u)),(s=$("#modal-close-btn"))==null||s.addEventListener("click",closeModal);let e=!1;(n=$("#modal-overlay"))==null||n.addEventListener("pointerdown",u=>{e=u.target===$("#modal-overlay")}),(i=$("#modal-box"))==null||i.addEventListener("pointerdown",()=>{e=!1}),(c=$("#modal-overlay"))==null||c.addEventListener("click",u=>{u.target===$("#modal-overlay")&&e&&closeModal(),e=!1}),(r=$("#btn-login"))==null||r.addEventListener("click",doLogin),(l=$("#btn-toggle-pass"))==null||l.addEventListener("click",togglePassVisibility),(p=$("#login-pass"))==null||p.addEventListener("keydown",u=>{u.key==="Enter"&&doLogin()}),(m=$("#login-email"))==null||m.addEventListener("keydown",u=>{var y;u.key==="Enter"&&((y=$("#login-pass"))==null||y.focus())}),(f=$("#btn-logout"))==null||f.addEventListener("click",doLogout),$$("#nav-menu .nav-item").forEach(u=>u.addEventListener("click",()=>navigate(u.dataset.page)));const t=$("#sidebar"),a=$("#screen-app");function o(u,y=!0){!t||!a||(y||(t.style.transition="none",requestAnimationFrame(()=>{t.style.transition=""})),t.classList.toggle("collapsed",u),a.classList.toggle("sidebar-collapsed",u),localStorage.setItem("sidebar-collapsed",u?"1":"0"))}o(localStorage.getItem("sidebar-collapsed")==="1",!1),(d=$("#btn-menu-toggle"))==null||d.addEventListener("click",()=>{window.innerWidth<=768?t==null||t.classList.toggle("open"):o(!(t!=null&&t.classList.contains("collapsed")))}),(g=$("#sidebar-hamburger"))==null||g.addEventListener("click",()=>o(!1)),function(){const u=document.createElement("div");u.style.cssText="position:fixed;z-index:400;padding:5px 13px;border-radius:8px;font-size:12px;font-weight:600;font-family:Plus Jakarta Sans,sans-serif;color:#fff;background:#111E43;border:1px solid rgba(100,225,255,.25);box-shadow:0 4px 20px rgba(5,8,20,.5);pointer-events:none;opacity:0;transition:opacity .15s;white-space:nowrap;",document.body.appendChild(u);const y=$("#nav-menu");y==null||y.addEventListener("mouseover",v=>{const b=v.target.closest(".nav-item");if(!b||!(t!=null&&t.classList.contains("collapsed"))||!b.dataset.label)return;const h=b.getBoundingClientRect();u.textContent=b.dataset.label,u.style.left=h.right+10+"px",u.style.top=h.top+h.height/2+"px",u.style.transform="translateY(-50%)",u.style.opacity="1"}),y==null||y.addEventListener("mouseout",v=>{var b,h;(h=(b=v.relatedTarget)==null?void 0:b.closest)!=null&&h.call(b,".nav-item")||(u.style.opacity="0")}),y==null||y.addEventListener("mouseleave",()=>{u.style.opacity="0"})}(),await vc()});async function vc(){const e=$("#loading-msg"),t=s=>{e&&(e.textContent=s)};if(t("Verificando servidor..."),!await pb.ping()){t("No se puede conectar al servidor. ¿Está ejecutando start.bat?");const s=$("#screen-loading");s&&(s.innerHTML=`
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
        </div>`);return}if(t("Verificando sesión..."),pb.currentUser&&pb.authToken)try{await pb.authRefresh(),wo(),await showApp(),startConnCheck();return}catch{pb.logout()}wo(),showLogin(),startConnCheck()}function wo(){const e=$("#screen-loading");e&&(e.classList.add("fade-out"),setTimeout(()=>{e.style.display="none"},500))}window.initApp=vc;window.hideSplash=wo;
