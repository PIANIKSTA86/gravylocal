(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function a(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(s){if(s.ep)return;s.ep=!0;const n=a(s);fetch(s.href,n)}})();const Ns=[{code:"CO",name:"COLOMBIA"},{code:"AF",name:"AFGANISTAN"},{code:"AX",name:"ALAND"},{code:"AL",name:"ALBANIA"},{code:"DE",name:"ALEMANIA"},{code:"AD",name:"ANDORRA"},{code:"AO",name:"ANGOLA"},{code:"AI",name:"ANGUILA"},{code:"AQ",name:"ANTARTIDA"},{code:"AG",name:"ANTIGUA Y BARBUDA"},{code:"SA",name:"ARABIA SAUDITA"},{code:"DZ",name:"ARGELIA"},{code:"AR",name:"ARGENTINA"},{code:"AM",name:"ARMENIA"},{code:"AW",name:"ARUBA"},{code:"AU",name:"AUSTRALIA"},{code:"AT",name:"AUSTRIA"},{code:"AZ",name:"AZERBAIYAN"},{code:"BS",name:"BAHAMAS"},{code:"BD",name:"BANGLADES"},{code:"BB",name:"BARBADOS"},{code:"BH",name:"BAREIN"},{code:"BE",name:"BELGICA"},{code:"BZ",name:"BELICE"},{code:"BJ",name:"BENIN"},{code:"BM",name:"BERMUDAS"},{code:"BY",name:"BIELORRUSIA"},{code:"BO",name:"BOLIVIA"},{code:"BQ",name:"BONAIRE, SAN EUSTAQUIO Y SABA"},{code:"BA",name:"BOSNIA Y HERZEGOVINA"},{code:"BW",name:"BOTSUANA"},{code:"BR",name:"BRASIL"},{code:"BN",name:"BRUNEI"},{code:"BG",name:"BULGARIA"},{code:"BF",name:"BURKINA FASO"},{code:"BI",name:"BURUNDI"},{code:"BT",name:"BUTAN"},{code:"CV",name:"CABO VERDE"},{code:"KH",name:"CAMBOYA"},{code:"CM",name:"CAMERUN"},{code:"CA",name:"CANADA"},{code:"QA",name:"CATAR"},{code:"TD",name:"CHAD"},{code:"CL",name:"CHILE"},{code:"CN",name:"CHINA"},{code:"CY",name:"CHIPRE"},{code:"KM",name:"COMORAS"},{code:"KP",name:"COREA DEL NORTE"},{code:"KR",name:"COREA DEL SUR"},{code:"CI",name:"COSTA DE MARFIL"},{code:"CR",name:"COSTA RICA"},{code:"HR",name:"CROACIA"},{code:"CU",name:"CUBA"},{code:"CW",name:"CURAZAO"},{code:"DK",name:"DINAMARCA"},{code:"DM",name:"DOMINICA"},{code:"EC",name:"ECUADOR"},{code:"EG",name:"EGIPTO"},{code:"SV",name:"EL SALVADOR"},{code:"AE",name:"EMIRATOS ARABES UNIDOS"},{code:"ER",name:"ERITREA"},{code:"SK",name:"ESLOVAQUIA"},{code:"SI",name:"ESLOVENIA"},{code:"ES",name:"ESPAÑA"},{code:"US",name:"ESTADOS UNIDOS"},{code:"EE",name:"ESTONIA"},{code:"ET",name:"ETIOPIA"},{code:"PH",name:"FILIPINAS"},{code:"FI",name:"FINLANDIA"},{code:"FJ",name:"FIYI"},{code:"FR",name:"FRANCIA"},{code:"GA",name:"GABON"},{code:"GM",name:"GAMBIA"},{code:"GE",name:"GEORGIA"},{code:"GH",name:"GHANA"},{code:"GI",name:"GIBRALTAR"},{code:"GD",name:"GRANADA"},{code:"GR",name:"GRECIA"},{code:"GL",name:"GROENLANDIA"},{code:"GP",name:"GUADALUPE"},{code:"GU",name:"GUAM"},{code:"GT",name:"GUATEMALA"},{code:"GF",name:"GUAYANA FRANCESA"},{code:"GG",name:"GUERNSEY"},{code:"GN",name:"GUINEA"},{code:"GQ",name:"GUINEA ECUATORIAL"},{code:"GW",name:"GUINEA-BISAU"},{code:"GY",name:"GUYANA"},{code:"HT",name:"HAITI"},{code:"HN",name:"HONDURAS"},{code:"HK",name:"HONG KONG"},{code:"HU",name:"HUNGRIA"},{code:"IN",name:"INDIA"},{code:"ID",name:"INDONESIA"},{code:"IQ",name:"IRAK"},{code:"IR",name:"IRAN"},{code:"IE",name:"IRLANDA"},{code:"BV",name:"ISLA BOUVET"},{code:"IM",name:"ISLA DE MAN"},{code:"CX",name:"ISLA DE NAVIDAD"},{code:"IS",name:"ISLANDIA"},{code:"KY",name:"ISLAS CAIMAN"},{code:"CC",name:"ISLAS COCOS"},{code:"CK",name:"ISLAS COOK"},{code:"FO",name:"ISLAS FEROE"},{code:"GS",name:"ISLAS GEORGIAS DEL SUR Y SANDWICH DEL SUR"},{code:"HM",name:"ISLAS HEARD Y MCDONALD"},{code:"FK",name:"ISLAS MALVINAS"},{code:"MP",name:"ISLAS MARIANAS DEL NORTE"},{code:"MH",name:"ISLAS MARSHALL"},{code:"PN",name:"ISLAS PITCAIRN"},{code:"SB",name:"ISLAS SALOMON"},{code:"TC",name:"ISLAS TURCAS Y CAICOS"},{code:"UM",name:"ISLAS ULTRAMARINAS DE ESTADOS UNIDOS"},{code:"VG",name:"ISLAS VIRGENES BRITANICAS"},{code:"VI",name:"ISLAS VIRGENES DE LOS ESTADOS UNIDOS"},{code:"IL",name:"ISRAEL"},{code:"IT",name:"ITALIA"},{code:"JM",name:"JAMAICA"},{code:"JP",name:"JAPON"},{code:"JE",name:"JERSEY"},{code:"JO",name:"JORDANIA"},{code:"KZ",name:"KAZAJISTAN"},{code:"KE",name:"KENIA"},{code:"KG",name:"KIRGUISTAN"},{code:"KI",name:"KIRIBATI"},{code:"KW",name:"KUWAIT"},{code:"LA",name:"LAOS"},{code:"LS",name:"LESOTO"},{code:"LV",name:"LETONIA"},{code:"LB",name:"LIBANO"},{code:"LR",name:"LIBERIA"},{code:"LY",name:"LIBIA"},{code:"LI",name:"LIECHTENSTEIN"},{code:"LT",name:"LITUANIA"},{code:"LU",name:"LUXEMBURGO"},{code:"MO",name:"MACAO"},{code:"MK",name:"MACEDONIA"},{code:"MG",name:"MADAGASCAR"},{code:"MY",name:"MALASIA"},{code:"MW",name:"MALAUI"},{code:"MV",name:"MALDIVAS"},{code:"ML",name:"MALI"},{code:"MT",name:"MALTA"},{code:"MA",name:"MARRUECOS"},{code:"MQ",name:"MARTINICA"},{code:"MU",name:"MAURICIO"},{code:"MR",name:"MAURITANIA"},{code:"YT",name:"MAYOTTE"},{code:"MX",name:"MEXICO"},{code:"FM",name:"MICRONESIA"},{code:"MD",name:"MOLDAVIA"},{code:"MC",name:"MONACO"},{code:"MN",name:"MONGOLIA"},{code:"ME",name:"MONTENEGRO"},{code:"MS",name:"MONTSERRAT"},{code:"MZ",name:"MOZAMBIQUE"},{code:"MM",name:"MYANMAR"},{code:"NA",name:"NAMIBIA"},{code:"NR",name:"NAURU"},{code:"NP",name:"NEPAL"},{code:"NI",name:"NICARAGUA"},{code:"NE",name:"NIGER"},{code:"NG",name:"NIGERIA"},{code:"UN",name:"NIUE"},{code:"NF",name:"NORFOLK"},{code:"NO",name:"NORUEGA"},{code:"NC",name:"NUEVA CALEDONIA"},{code:"NZ",name:"NUEVA ZELANDA"},{code:"OM",name:"OMAN"},{code:"NL",name:"PAISES BAJOS"},{code:"PK",name:"PAKISTAN"},{code:"PW",name:"PALAOS"},{code:"PS",name:"PALESTINA"},{code:"PA",name:"PANAMA"},{code:"PG",name:"PAPUA NUEVA GUINEA"},{code:"PY",name:"PARAGUAY"},{code:"PE",name:"PERU"},{code:"PF",name:"POLINESIA FRANCESA"},{code:"PL",name:"POLONIA"},{code:"PT",name:"PORTUGAL"},{code:"PR",name:"PUERTO RICO"},{code:"GB",name:"REINO UNIDO"},{code:"EH",name:"REPUBLICA ARABE SAHARAUI DEMOCRATICA"},{code:"CF",name:"REPUBLICA CENTROAFRICANA"},{code:"CZ",name:"REPUBLICA CHECA"},{code:"CG",name:"REPUBLICA DEL CONGO"},{code:"CD",name:"REPUBLICA DEMOCRATICA DEL CONGO"},{code:"DO",name:"REPUBLICA DOMINICANA"},{code:"RE",name:"REUNION"},{code:"RW",name:"RUANDA"},{code:"RO",name:"RUMANIA"},{code:"RU",name:"RUSIA"},{code:"WS",name:"SAMOA"},{code:"AS",name:"SAMOA AMERICANA"},{code:"BL",name:"SAN BARTOLOME"},{code:"KN",name:"SAN CRISTOBAL Y NIEVES"},{code:"SM",name:"SAN MARINO"},{code:"MF",name:"SAN MARTIN"},{code:"PM",name:"SAN PEDRO Y MIQUELON"},{code:"VC",name:"SAN VICENTE Y LAS GRANADINAS"},{code:"SH",name:"SANTA ELENA, ASCENSION Y TRISTAN DE ACUÑA"},{code:"LC",name:"SANTA LUCIA"},{code:"ST",name:"SANTO TOME Y PRINCIPE"},{code:"SN",name:"SENEGAL"},{code:"RS",name:"SERBIA"},{code:"SC",name:"SEYCHELLES"},{code:"SL",name:"SIERRA LEONA"},{code:"SG",name:"SINGAPUR"},{code:"SX",name:"SINT MAARTEN"},{code:"SY",name:"SIRIA"},{code:"SO",name:"SOMALIA"},{code:"LK",name:"SRI LANKA"},{code:"SZ",name:"SUAZILANDIA"},{code:"ZA",name:"SUDAFRICA"},{code:"SD",name:"SUDAN"},{code:"SS",name:"SUDAN DEL SUR"},{code:"SE",name:"SUECIA"},{code:"CH",name:"SUIZA"},{code:"SR",name:"SURINAM"},{code:"SJ",name:"SVALBARD Y JAN MAYEN"},{code:"TH",name:"TAILANDIA"},{code:"TW",name:"TAIWAN (REPUBLICA DE CHINA)"},{code:"TZ",name:"TANZANIA"},{code:"TJ",name:"TAYIKISTAN"},{code:"IO",name:"TERRITORIO BRITANICO DEL OCEANO INDICO"},{code:"TF",name:"TIERRAS AUSTRALES Y ANTARTICAS FRANCESAS"},{code:"TL",name:"TIMOR ORIENTAL"},{code:"TG",name:"TOGO"},{code:"TK",name:"TOKELAU"},{code:"TO",name:"TONGA"},{code:"TT",name:"TRINIDAD Y TOBAGO"},{code:"TN",name:"TUNEZ"},{code:"TM",name:"TURKMENISTAN"},{code:"TR",name:"TURQUIA"},{code:"TV",name:"TUVALU"},{code:"UA",name:"UCRANIA"},{code:"UG",name:"UGANDA"},{code:"UY",name:"URUGUAY"},{code:"UZ",name:"UZBEKISTAN"},{code:"VU",name:"VANUATU"},{code:"VA",name:"VATICANO, CIUDAD DEL"},{code:"VE",name:"VENEZUELA"},{code:"VN",name:"VIETNAM"},{code:"WF",name:"WALLIS Y FUTUNA"},{code:"YE",name:"YEMEN"},{code:"DJ",name:"YIBUTI"},{code:"ZM",name:"ZAMBIA"},{code:"ZW",name:"ZIMBABUE"}],Ls=[{code:"05",name:"ANTIOQUIA"},{code:"08",name:"ATLANTICO"},{code:"11",name:"BOGOTA"},{code:"13",name:"BOLIVAR"},{code:"15",name:"BOYACA"},{code:"17",name:"CALDAS"},{code:"18",name:"CAQUETA"},{code:"19",name:"CAUCA"},{code:"20",name:"CESAR"},{code:"23",name:"CORDOBA"},{code:"25",name:"CUNDINAMARCA"},{code:"27",name:"CHOCO"},{code:"41",name:"HUILA"},{code:"44",name:"LA GUAJIRA"},{code:"47",name:"MAGDALENA"},{code:"50",name:"META"},{code:"52",name:"NARINO"},{code:"54",name:"NORTE DE SANTANDER"},{code:"63",name:"QUINDIO"},{code:"66",name:"RISARALDA"},{code:"68",name:"SANTANDER"},{code:"70",name:"SUCRE"},{code:"73",name:"TOLIMA"},{code:"76",name:"VALLE DEL CAUCA"},{code:"81",name:"ARAUCA"},{code:"85",name:"CASANARE"},{code:"86",name:"PUTUMAYO"},{code:"88",name:"SAN ANDRES"},{code:"91",name:"AMAZONAS"},{code:"94",name:"GUAINIA"},{code:"95",name:"GUAVIARE"},{code:"97",name:"VAUPES"},{code:"99",name:"VICHADA"}],No=[{dept_code:"91",code:"91001",name:"LETICIA",postal:"910001"},{dept_code:"91",code:"91263",name:"EL ENCANTO",postal:"913010"},{dept_code:"91",code:"91405",name:"LA CHORRERA",postal:"914057"},{dept_code:"91",code:"91407",name:"LA PEDRERA",postal:"917010"},{dept_code:"91",code:"91430",name:"LA VICTORIA",postal:"916017"},{dept_code:"91",code:"91460",name:"MIRITI _ PARANA",postal:"916057"},{dept_code:"91",code:"91530",name:"PUERTO ALEGRIA",postal:"913050"},{dept_code:"91",code:"91536",name:"PUERTO ARICA",postal:"912010"},{dept_code:"91",code:"91540",name:"PUERTO NARINO",postal:"911017"},{dept_code:"91",code:"91669",name:"PUERTO SANTANDER",postal:"915010"},{dept_code:"91",code:"91798",name:"TARAPACA",postal:"911030"},{dept_code:"05",code:"05001",name:"MEDELLIN",postal:"050013"},{dept_code:"05",code:"05002",name:"ABEJORRAL",postal:"055030"},{dept_code:"05",code:"05004",name:"ABRIAQUI",postal:"057460"},{dept_code:"05",code:"05021",name:"ALEJANDRIA",postal:"053820"},{dept_code:"05",code:"05030",name:"AMAGA",postal:"055840"},{dept_code:"05",code:"05031",name:"AMALFI",postal:"052840"},{dept_code:"05",code:"05034",name:"ANDES",postal:"056068"},{dept_code:"05",code:"05036",name:"ANGELOPOLIS",postal:"055830"},{dept_code:"05",code:"05038",name:"ANGOSTURA",postal:"051810"},{dept_code:"05",code:"05040",name:"ANORI",postal:"052857"},{dept_code:"05",code:"05042",name:"SANTAFE DE ANTIOQUIA",postal:"057050"},{dept_code:"05",code:"05044",name:"ANZA",postal:"056850"},{dept_code:"05",code:"05045",name:"APARTADO",postal:"057841"},{dept_code:"05",code:"05051",name:"ARBOLETES",postal:"057820"},{dept_code:"05",code:"05055",name:"ARGELIA",postal:"054838"},{dept_code:"05",code:"05059",name:"ARMENIA",postal:"055860"},{dept_code:"05",code:"05079",name:"BARBOSA",postal:"051028"},{dept_code:"05",code:"05086",name:"BELMIRA",postal:"051420"},{dept_code:"05",code:"05088",name:"BELLO",postal:"051050"},{dept_code:"05",code:"05091",name:"BETANIA",postal:"056070"},{dept_code:"05",code:"05093",name:"BETULIA",postal:"056860"},{dept_code:"05",code:"05101",name:"CIUDAD BOLIVAR",postal:"056460"},{dept_code:"05",code:"05107",name:"BRICENO",postal:"052060"},{dept_code:"05",code:"05113",name:"BURITICA",postal:"057030"},{dept_code:"05",code:"05120",name:"CACERES",postal:"052450"},{dept_code:"05",code:"05125",name:"CAICEDO",postal:"056840"},{dept_code:"05",code:"05129",name:"CALDAS",postal:"055440"},{dept_code:"05",code:"05134",name:"CAMPAMENTO",postal:"052020"},{dept_code:"05",code:"05138",name:"CANASGORDAS",postal:"057067"},{dept_code:"05",code:"05142",name:"CARACOLI",postal:"053450"},{dept_code:"05",code:"05145",name:"CARAMANTA",postal:"056040"},{dept_code:"05",code:"05147",name:"CAREPA",postal:"057850"},{dept_code:"05",code:"05148",name:"EL CARMEN DE VIBORAL",postal:"054037"},{dept_code:"05",code:"05150",name:"CAROLINA",postal:"051840"},{dept_code:"05",code:"05154",name:"CAUCASIA",postal:"052410"},{dept_code:"05",code:"05172",name:"CHIGORODO",postal:"057410"},{dept_code:"05",code:"05190",name:"CISNEROS",postal:"053050"},{dept_code:"05",code:"05197",name:"COCORNA",postal:"054440"},{dept_code:"05",code:"05206",name:"CONCEPCION",postal:"053810"},{dept_code:"05",code:"05209",name:"CONCORDIA",postal:"056410"},{dept_code:"05",code:"05212",name:"COPACABANA",postal:"051047"},{dept_code:"05",code:"05234",name:"DABEIBA",postal:"057430"},{dept_code:"05",code:"05237",name:"DONMATIAS",postal:"051850"},{dept_code:"05",code:"05240",name:"EBEJICO",postal:"055810"},{dept_code:"05",code:"05250",name:"EL BAGRE",postal:"052437"},{dept_code:"05",code:"05264",name:"ENTRERRIOS",postal:"051430"},{dept_code:"05",code:"05266",name:"ENVIGADO",postal:"055428"},{dept_code:"05",code:"05282",name:"FREDONIA",postal:"055070"},{dept_code:"05",code:"05284",name:"FRONTINO",postal:"057450"},{dept_code:"05",code:"05306",name:"GIRALDO",postal:"057040"},{dept_code:"05",code:"05308",name:"GIRARDOTA",postal:"051038"},{dept_code:"05",code:"05310",name:"GOMEZ PLATA",postal:"051830"},{dept_code:"05",code:"05313",name:"GRANADA",postal:"054410"},{dept_code:"05",code:"05315",name:"GUADALUPE",postal:"051820"},{dept_code:"05",code:"05318",name:"GUARNE",postal:"054050"},{dept_code:"05",code:"05321",name:"GUATAPE",postal:"053840"},{dept_code:"05",code:"05347",name:"HELICONIA",postal:"055820"},{dept_code:"05",code:"05353",name:"HISPANIA",postal:"056450"},{dept_code:"05",code:"05360",name:"ITAGUI",postal:"055411"},{dept_code:"05",code:"05361",name:"ITUANGO",postal:"052070"},{dept_code:"05",code:"05364",name:"JARDIN",postal:"056050"},{dept_code:"05",code:"05368",name:"JERICO",postal:"056010"},{dept_code:"05",code:"05376",name:"LA CEJA",postal:"055017"},{dept_code:"05",code:"05380",name:"LA ESTRELLA",postal:"055467"},{dept_code:"05",code:"05390",name:"LA PINTADA",postal:"055060"},{dept_code:"05",code:"05400",name:"LA UNION",postal:"055020"},{dept_code:"05",code:"05411",name:"LIBORINA",postal:"051460"},{dept_code:"05",code:"05425",name:"MACEO",postal:"053460"},{dept_code:"05",code:"05440",name:"MARINILLA",postal:"054020"},{dept_code:"05",code:"05467",name:"MONTEBELLO",postal:"055040"},{dept_code:"05",code:"05475",name:"MURINDO",postal:"056810"},{dept_code:"05",code:"05480",name:"MUTATA",postal:"057427"},{dept_code:"05",code:"05483",name:"NARINO",postal:"054840"},{dept_code:"05",code:"05490",name:"NECOCLI",postal:"057870"},{dept_code:"05",code:"05495",name:"NECHI",postal:"052420"},{dept_code:"05",code:"05501",name:"OLAYA",postal:"051450"},{dept_code:"05",code:"05541",name:"PENOL",postal:"053850"},{dept_code:"05",code:"05543",name:"PEQUE",postal:"057010"},{dept_code:"05",code:"05576",name:"PUEBLORRICO",postal:"056440"},{dept_code:"05",code:"05579",name:"PUERTO BERRIO",postal:"053420"},{dept_code:"05",code:"05585",name:"PUERTO NARE",postal:"053430"},{dept_code:"05",code:"05591",name:"PUERTO TRIUNFO",postal:"053440"},{dept_code:"05",code:"05604",name:"REMEDIOS",postal:"052820"},{dept_code:"05",code:"05607",name:"RETIRO",postal:"055438"},{dept_code:"05",code:"05615",name:"RIONEGRO",postal:"054040"},{dept_code:"05",code:"05628",name:"SABANALARGA",postal:"057020"},{dept_code:"05",code:"05631",name:"SABANETA",postal:"055450"},{dept_code:"05",code:"05642",name:"SALGAR",postal:"056478"},{dept_code:"05",code:"05647",name:"SAN ANDRES DE CUERQUIA",postal:"052040"},{dept_code:"05",code:"05649",name:"SAN CARLOS",postal:"054420"},{dept_code:"05",code:"05652",name:"SAN FRANCISCO",postal:"054810"},{dept_code:"05",code:"05656",name:"SAN JERONIMO",postal:"051070"},{dept_code:"05",code:"05658",name:"SAN JOSE DE LA MONTANA",postal:"051410"},{dept_code:"05",code:"05659",name:"SAN JUAN DE URABA",postal:"057810"},{dept_code:"05",code:"05660",name:"SAN LUIS",postal:"054430"},{dept_code:"05",code:"05664",name:"SAN PEDRO DE LOS MILAGROS",postal:"051010"},{dept_code:"05",code:"05665",name:"SAN PEDRO DE URABA",postal:"057830"},{dept_code:"05",code:"05667",name:"SAN RAFAEL",postal:"053838"},{dept_code:"05",code:"05670",name:"SAN ROQUE",postal:"053030"},{dept_code:"05",code:"05674",name:"SAN VICENTE",postal:"054010"},{dept_code:"05",code:"05679",name:"SANTA BARBARA",postal:"055050"},{dept_code:"05",code:"05686",name:"SANTA ROSA DE OSOS",postal:"051860"},{dept_code:"05",code:"05690",name:"SANTO DOMINGO",postal:"053040"},{dept_code:"05",code:"05697",name:"EL SANTUARIO",postal:"054450"},{dept_code:"05",code:"05736",name:"SEGOVIA",postal:"052810"},{dept_code:"05",code:"05756",name:"SONSON",postal:"054820"},{dept_code:"05",code:"05761",name:"SOPETRAN",postal:"051440"},{dept_code:"05",code:"05789",name:"TAMESIS",postal:"056020"},{dept_code:"05",code:"05790",name:"TARAZA",postal:"052460"},{dept_code:"05",code:"05792",name:"TARSO",postal:"056430"},{dept_code:"05",code:"05809",name:"TITIRIBI",postal:"055858"},{dept_code:"05",code:"05819",name:"TOLEDO",postal:"052050"},{dept_code:"05",code:"05837",name:"TURBO",postal:"057860"},{dept_code:"05",code:"05842",name:"URAMITA",postal:"057440"},{dept_code:"05",code:"05847",name:"URRAO",postal:"056830"},{dept_code:"05",code:"05854",name:"VALDIVIA",postal:"052010"},{dept_code:"05",code:"05856",name:"VALPARAISO",postal:"056030"},{dept_code:"05",code:"05858",name:"VEGACHI",postal:"052830"},{dept_code:"05",code:"05861",name:"VENECIA",postal:"056420"},{dept_code:"05",code:"05873",name:"VIGIA DEL FUERTE",postal:"056820"},{dept_code:"05",code:"05885",name:"YALI",postal:"053010"},{dept_code:"05",code:"05887",name:"YARUMAL",postal:"052030"},{dept_code:"05",code:"05890",name:"YOLOMBO",postal:"053020"},{dept_code:"05",code:"05893",name:"YONDO",postal:"053410"},{dept_code:"05",code:"05895",name:"ZARAGOZA",postal:"052440"},{dept_code:"81",code:"81001",name:"ARAUCA",postal:"810001"},{dept_code:"81",code:"81065",name:"ARAUQUITA",postal:"816010"},{dept_code:"81",code:"81220",name:"CRAVO NORTE",postal:"812010"},{dept_code:"81",code:"81300",name:"FORTUL",postal:"814050"},{dept_code:"81",code:"81591",name:"PUERTO RONDON",postal:"813010"},{dept_code:"81",code:"81736",name:"SARAVENA",postal:"815010"},{dept_code:"81",code:"81794",name:"TAME",postal:"814018"},{dept_code:"08",code:"08001",name:"BARRANQUILLA",postal:"080010"},{dept_code:"08",code:"08078",name:"BARANOA",postal:"082027"},{dept_code:"08",code:"08137",name:"CAMPO DE LA CRUZ",postal:"084040"},{dept_code:"08",code:"08141",name:"CANDELARIA",postal:"084020"},{dept_code:"08",code:"08296",name:"GALAPA",postal:"082001"},{dept_code:"08",code:"08372",name:"JUAN DE ACOSTA",postal:"081048"},{dept_code:"08",code:"08421",name:"LURUACO",postal:"085060"},{dept_code:"08",code:"08433",name:"MALAMBO",postal:"083027"},{dept_code:"08",code:"08436",name:"MANATI",postal:"085020"},{dept_code:"08",code:"08520",name:"PALMAR DE VARELA",postal:"083087"},{dept_code:"08",code:"08549",name:"PIOJO",postal:"081060"},{dept_code:"08",code:"08558",name:"POLONUEVO",postal:"082040"},{dept_code:"08",code:"08560",name:"PONEDERA",postal:"084001"},{dept_code:"08",code:"08573",name:"PUERTO COLOMBIA",postal:"081008"},{dept_code:"08",code:"08606",name:"REPELON",postal:"085040"},{dept_code:"08",code:"08634",name:"SABANAGRANDE",postal:"083040"},{dept_code:"08",code:"08638",name:"SABANALARGA",postal:"085001"},{dept_code:"08",code:"08675",name:"SANTA LUCIA",postal:"084080"},{dept_code:"08",code:"08685",name:"SANTO TOMAS",postal:"083067"},{dept_code:"08",code:"08758",name:"SOLEDAD",postal:"083007"},{dept_code:"08",code:"08770",name:"SUAN",postal:"084060"},{dept_code:"08",code:"08832",name:"TUBARA",postal:"081027"},{dept_code:"08",code:"08849",name:"USIACURI",postal:"082067"},{dept_code:"11",code:"11001",name:"BOGOTA D.C.",postal:"111511"},{dept_code:"13",code:"13001",name:"CARTAGENA",postal:"130019"},{dept_code:"13",code:"13006",name:"ACHI",postal:"134020"},{dept_code:"13",code:"13030",name:"ALTOS DEL ROSARIO",postal:"133508"},{dept_code:"13",code:"13042",name:"ARENAL",postal:"134520"},{dept_code:"13",code:"13052",name:"ARJONA",postal:"131028"},{dept_code:"13",code:"13062",name:"ARROYOHONDO",postal:"131560"},{dept_code:"13",code:"13074",name:"BARRANCO DE LOBA",postal:"133517"},{dept_code:"13",code:"13140",name:"CALAMAR",postal:"131547"},{dept_code:"13",code:"13160",name:"CANTAGALLO",postal:"135060"},{dept_code:"13",code:"13188",name:"CICUCO",postal:"132550"},{dept_code:"13",code:"13212",name:"CORDOBA",postal:"132507"},{dept_code:"13",code:"13222",name:"CLEMENCIA",postal:"130510"},{dept_code:"13",code:"13244",name:"EL CARMEN DE BOLIVAR",postal:"132058"},{dept_code:"13",code:"13248",name:"EL GUAMO",postal:"132007"},{dept_code:"13",code:"13268",name:"EL PENON",postal:"133550"},{dept_code:"13",code:"13300",name:"HATILLO DE LOBA",postal:"133040"},{dept_code:"13",code:"13430",name:"MAGANGUE",postal:"132518"},{dept_code:"13",code:"13433",name:"MAHATES",postal:"131048"},{dept_code:"13",code:"13440",name:"MARGARITA",postal:"133020"},{dept_code:"13",code:"13442",name:"MARIA LA BAJA",postal:"131060"},{dept_code:"13",code:"13458",name:"MONTECRISTO",postal:"134070"},{dept_code:"13",code:"13468",name:"MOMPOS",postal:"132560"},{dept_code:"13",code:"13473",name:"MORALES",postal:"134540"},{dept_code:"13",code:"13490",name:"NOROSI",postal:"134510"},{dept_code:"13",code:"13549",name:"PINILLOS",postal:"134001"},{dept_code:"13",code:"13580",name:"REGIDOR",postal:"133560"},{dept_code:"13",code:"13600",name:"RIO VIEJO",postal:"134501"},{dept_code:"13",code:"13620",name:"SAN CRISTOBAL",postal:"131520"},{dept_code:"13",code:"13647",name:"SAN ESTANISLAO",postal:"130540"},{dept_code:"13",code:"13650",name:"SAN FERNANDO",postal:"133007"},{dept_code:"13",code:"13654",name:"SAN JACINTO",postal:"132030"},{dept_code:"13",code:"13655",name:"SAN JACINTO DEL CAUCA",postal:"134060"},{dept_code:"13",code:"13657",name:"SAN JUAN NEPOMUCENO",postal:"132010"},{dept_code:"13",code:"13667",name:"SAN MARTIN DE LOBA",postal:"133530"},{dept_code:"13",code:"13670",name:"SAN PABLO",postal:"135040"},{dept_code:"13",code:"13673",name:"SANTA CATALINA",postal:"130501"},{dept_code:"13",code:"13683",name:"SANTA ROSA",postal:"130527"},{dept_code:"13",code:"13688",name:"SANTA ROSA DEL SUR",postal:"135001"},{dept_code:"13",code:"13744",name:"SIMITI",postal:"135020"},{dept_code:"13",code:"13760",name:"SOPLAVIENTO",postal:"131501"},{dept_code:"13",code:"13780",name:"TALAIGUA NUEVO",postal:"132540"},{dept_code:"13",code:"13810",name:"TIQUISIO",postal:"134040"},{dept_code:"13",code:"13836",name:"TURBACO",postal:"131007"},{dept_code:"13",code:"13838",name:"TURBANA",postal:"131010"},{dept_code:"13",code:"13873",name:"VILLANUEVA",postal:"130530"},{dept_code:"13",code:"13894",name:"ZAMBRANO",postal:"132047"},{dept_code:"15",code:"15001",name:"TUNJA",postal:"150003"},{dept_code:"15",code:"15022",name:"ALMEIDA",postal:"153020"},{dept_code:"15",code:"15047",name:"AQUITANIA",postal:"152420"},{dept_code:"15",code:"15051",name:"ARCABUCO",postal:"154201"},{dept_code:"15",code:"15087",name:"BELEN",postal:"150640"},{dept_code:"15",code:"15090",name:"BERBEO",postal:"152617"},{dept_code:"15",code:"15092",name:"BETEITIVA",postal:"150610"},{dept_code:"15",code:"15097",name:"BOAVITA",postal:"151060"},{dept_code:"15",code:"15104",name:"BOYACA",postal:"153610"},{dept_code:"15",code:"15106",name:"BRICENO",postal:"154670"},{dept_code:"15",code:"15109",name:"BUENAVISTA",postal:"154840"},{dept_code:"15",code:"15114",name:"BUSBANZA",postal:"152087"},{dept_code:"15",code:"15131",name:"CALDAS",postal:"154660"},{dept_code:"15",code:"15135",name:"CAMPOHERMOSO",postal:"152640"},{dept_code:"15",code:"15162",name:"CERINZA",postal:"150627"},{dept_code:"15",code:"15172",name:"CHINAVITA",postal:"153287"},{dept_code:"15",code:"15176",name:"CHIQUINQUIRA",postal:"154640"},{dept_code:"15",code:"15180",name:"CHISCAS",postal:"151401"},{dept_code:"15",code:"15183",name:"CHITA",postal:"151601"},{dept_code:"15",code:"15185",name:"CHITARAQUE",postal:"154420"},{dept_code:"15",code:"15187",name:"CHIVATA",postal:"150240"},{dept_code:"15",code:"15189",name:"CIENEGA",postal:"153440"},{dept_code:"15",code:"15204",name:"COMBITA",postal:"150201"},{dept_code:"15",code:"15212",name:"COPER",postal:"154860"},{dept_code:"15",code:"15215",name:"CORRALES",postal:"152060"},{dept_code:"15",code:"15218",name:"COVARACHIA",postal:"151040"},{dept_code:"15",code:"15223",name:"CUBARA",postal:"151420"},{dept_code:"15",code:"15224",name:"CUCAITA",postal:"154060"},{dept_code:"15",code:"15226",name:"CUITIVA",postal:"152230"},{dept_code:"15",code:"15232",name:"CHIQUIZA",postal:"154020"},{dept_code:"15",code:"15236",name:"CHIVOR",postal:"153001"},{dept_code:"15",code:"15238",name:"DUITAMA",postal:"150467"},{dept_code:"15",code:"15244",name:"EL COCUY",postal:"151280"},{dept_code:"15",code:"15248",name:"EL ESPINO",postal:"151240"},{dept_code:"15",code:"15272",name:"FIRAVITOBA",postal:"152250"},{dept_code:"15",code:"15276",name:"FLORESTA",postal:"150601"},{dept_code:"15",code:"15293",name:"GACHANTIVA",postal:"154220"},{dept_code:"15",code:"15296",name:"GAMEZA",postal:"152020"},{dept_code:"15",code:"15299",name:"GARAGOA",postal:"152860"},{dept_code:"15",code:"15317",name:"GUACAMAYAS",postal:"151220"},{dept_code:"15",code:"15322",name:"GUATEQUE",postal:"153050"},{dept_code:"15",code:"15325",name:"GUAYATA",postal:"153040"},{dept_code:"15",code:"15332",name:"GÜICAN",postal:"151440"},{dept_code:"15",code:"15362",name:"IZA",postal:"152240"},{dept_code:"15",code:"15367",name:"JENESANO",postal:"153601"},{dept_code:"15",code:"15368",name:"JERICO",postal:"150840"},{dept_code:"15",code:"15377",name:"LABRANZAGRANDE",postal:"151840"},{dept_code:"15",code:"15380",name:"LA CAPILLA",postal:"153220"},{dept_code:"15",code:"15401",name:"LA VICTORIA",postal:"155001"},{dept_code:"15",code:"15403",name:"LA UVITA",postal:"150860"},{dept_code:"15",code:"15407",name:"VILLA DE LEYVA",postal:"154001"},{dept_code:"15",code:"15425",name:"MACANAL",postal:"152840"},{dept_code:"15",code:"15442",name:"MARIPI",postal:"154820"},{dept_code:"15",code:"15455",name:"MIRAFLORES",postal:"152667"},{dept_code:"15",code:"15464",name:"MONGUA",postal:"152001"},{dept_code:"15",code:"15466",name:"MONGUI",postal:"152201"},{dept_code:"15",code:"15469",name:"MONIQUIRA",postal:"154260"},{dept_code:"15",code:"15476",name:"MOTAVITA",postal:"154080"},{dept_code:"15",code:"15480",name:"MUZO",postal:"154880"},{dept_code:"15",code:"15491",name:"NOBSA",postal:"152280"},{dept_code:"15",code:"15494",name:"NUEVO COLON",postal:"153620"},{dept_code:"15",code:"15500",name:"OICATA",postal:"150220"},{dept_code:"15",code:"15507",name:"OTANCHE",postal:"155060"},{dept_code:"15",code:"15511",name:"PACHAVITA",postal:"153210"},{dept_code:"15",code:"15514",name:"PAEZ",postal:"152620"},{dept_code:"15",code:"15516",name:"PAIPA",postal:"150447"},{dept_code:"15",code:"15518",name:"PAJARITO",postal:"152407"},{dept_code:"15",code:"15522",name:"PANQUEBA",postal:"151260"},{dept_code:"15",code:"15531",name:"PAUNA",postal:"154801"},{dept_code:"15",code:"15533",name:"PAYA",postal:"151827"},{dept_code:"15",code:"15537",name:"PAZ DE RIO",postal:"150680"},{dept_code:"15",code:"15542",name:"PESCA",postal:"152460"},{dept_code:"15",code:"15550",name:"PISBA",postal:"151801"},{dept_code:"15",code:"15572",name:"PUERTO BOYACA",postal:"155208"},{dept_code:"15",code:"15580",name:"QUIPAMA",postal:"155027"},{dept_code:"15",code:"15599",name:"RAMIRIQUI",postal:"153407"},{dept_code:"15",code:"15600",name:"RAQUIRA",postal:"153801"},{dept_code:"15",code:"15621",name:"RONDON",postal:"153420"},{dept_code:"15",code:"15632",name:"SABOYA",postal:"154601"},{dept_code:"15",code:"15638",name:"SACHICA",postal:"153887"},{dept_code:"15",code:"15646",name:"SAMACA",postal:"153660"},{dept_code:"15",code:"15660",name:"SAN EDUARDO",postal:"152601"},{dept_code:"15",code:"15664",name:"SAN JOSE DE PARE",postal:"154460"},{dept_code:"15",code:"15667",name:"SAN LUIS DE GACENO",postal:"152801"},{dept_code:"15",code:"15673",name:"SAN MATEO",postal:"151207"},{dept_code:"15",code:"15676",name:"SAN MIGUEL DE SEMA",postal:"153820"},{dept_code:"15",code:"15681",name:"SAN PABLO DE BORBUR",postal:"155040"},{dept_code:"15",code:"15686",name:"SANTANA",postal:"154440"},{dept_code:"15",code:"15690",name:"SANTA MARIA",postal:"152820"},{dept_code:"15",code:"15693",name:"SANTA ROSA DE VITERBO",postal:"150480"},{dept_code:"15",code:"15696",name:"SANTA SOFIA",postal:"154247"},{dept_code:"15",code:"15720",name:"SATIVANORTE",postal:"150820"},{dept_code:"15",code:"15723",name:"SATIVASUR",postal:"150801"},{dept_code:"15",code:"15740",name:"SIACHOQUE",postal:"153460"},{dept_code:"15",code:"15753",name:"SOATA",postal:"151001"},{dept_code:"15",code:"15755",name:"SOCOTA",postal:"151620"},{dept_code:"15",code:"15757",name:"SOCHA",postal:"151640"},{dept_code:"15",code:"15759",name:"SOGAMOSO",postal:"152217"},{dept_code:"15",code:"15761",name:"SOMONDOCO",postal:"153030"},{dept_code:"15",code:"15762",name:"SORA",postal:"154040"},{dept_code:"15",code:"15763",name:"SOTAQUIRA",postal:"150420"},{dept_code:"15",code:"15764",name:"SORACA",postal:"153480"},{dept_code:"15",code:"15774",name:"SUSACON",postal:"150880"},{dept_code:"15",code:"15776",name:"SUTAMARCHAN",postal:"153867"},{dept_code:"15",code:"15778",name:"SUTATENZA",postal:"153067"},{dept_code:"15",code:"15790",name:"TASCO",postal:"151660"},{dept_code:"15",code:"15798",name:"TENZA",postal:"153207"},{dept_code:"15",code:"15804",name:"TIBANA",postal:"153260"},{dept_code:"15",code:"15806",name:"TIBASOSA",postal:"152260"},{dept_code:"15",code:"15808",name:"TINJACA",postal:"153840"},{dept_code:"15",code:"15810",name:"TIPACOQUE",postal:"151020"},{dept_code:"15",code:"15814",name:"TOCA",postal:"150260"},{dept_code:"15",code:"15816",name:"TOGÜI",postal:"154401"},{dept_code:"15",code:"15820",name:"TOPAGA",postal:"152047"},{dept_code:"15",code:"15822",name:"TOTA",postal:"152440"},{dept_code:"15",code:"15832",name:"TUNUNGUA",postal:"154687"},{dept_code:"15",code:"15835",name:"TURMEQUE",postal:"153630"},{dept_code:"15",code:"15837",name:"TUTA",postal:"150401"},{dept_code:"15",code:"15839",name:"TUTAZA",postal:"150660"},{dept_code:"15",code:"15842",name:"UMBITA",postal:"153240"},{dept_code:"15",code:"15861",name:"VENTAQUEMADA",postal:"153640"},{dept_code:"15",code:"15879",name:"VIRACACHA",postal:"153450"},{dept_code:"15",code:"15897",name:"ZETAQUIRA",postal:"152680"},{dept_code:"17",code:"17001",name:"MANIZALES",postal:"170007"},{dept_code:"17",code:"17013",name:"AGUADAS",postal:"172020"},{dept_code:"17",code:"17042",name:"ANSERMA",postal:"177080"},{dept_code:"17",code:"17050",name:"ARANZAZU",postal:"171040"},{dept_code:"17",code:"17088",name:"BELALCAZAR",postal:"177001"},{dept_code:"17",code:"17174",name:"CHINCHINA",postal:"176020"},{dept_code:"17",code:"17272",name:"FILADELFIA",postal:"171020"},{dept_code:"17",code:"17380",name:"LA DORADA",postal:"175038"},{dept_code:"17",code:"17388",name:"LA MERCED",postal:"172067"},{dept_code:"17",code:"17433",name:"MANZANARES",postal:"173020"},{dept_code:"17",code:"17442",name:"MARMATO",postal:"178007"},{dept_code:"17",code:"17444",name:"MARQUETALIA",postal:"173040"},{dept_code:"17",code:"17446",name:"MARULANDA",postal:"173007"},{dept_code:"17",code:"17486",name:"NEIRA",postal:"171001"},{dept_code:"17",code:"17495",name:"NORCASIA",postal:"175001"},{dept_code:"17",code:"17513",name:"PACORA",postal:"172040"},{dept_code:"17",code:"17524",name:"PALESTINA",postal:"176040"},{dept_code:"17",code:"17541",name:"PENSILVANIA",postal:"173060"},{dept_code:"17",code:"17614",name:"RIOSUCIO",postal:"178057"},{dept_code:"17",code:"17616",name:"RISARALDA",postal:"177060"},{dept_code:"17",code:"17653",name:"SALAMINA",postal:"172001"},{dept_code:"17",code:"17662",name:"SAMANA",postal:"174001"},{dept_code:"17",code:"17665",name:"SAN JOSE",postal:"177040"},{dept_code:"17",code:"17777",name:"SUPIA",postal:"178020"},{dept_code:"17",code:"17867",name:"VICTORIA",postal:"174030"},{dept_code:"17",code:"17873",name:"VILLAMARIA",postal:"176001"},{dept_code:"17",code:"17877",name:"VITERBO",postal:"177020"},{dept_code:"18",code:"18001",name:"FLORENCIA",postal:"180009"},{dept_code:"18",code:"18029",name:"ALBANIA",postal:"186030"},{dept_code:"18",code:"18094",name:"BELEN DE LOS ANDAQUIES",postal:"186010"},{dept_code:"18",code:"18150",name:"CARTAGENA DEL CHAIRA",postal:"183010"},{dept_code:"18",code:"18205",name:"CURILLO",postal:"186050"},{dept_code:"18",code:"18247",name:"EL DONCELLO",postal:"181010"},{dept_code:"18",code:"18256",name:"EL PAUJIL",postal:"181030"},{dept_code:"18",code:"18410",name:"LA MONTANITA",postal:"181059"},{dept_code:"18",code:"18460",name:"MILAN",postal:"185030"},{dept_code:"18",code:"18479",name:"MORELIA",postal:"185010"},{dept_code:"18",code:"18592",name:"PUERTO RICO",postal:"182050"},{dept_code:"18",code:"18610",name:"SAN JOSE DEL FRAGUA",postal:"186070"},{dept_code:"18",code:"18753",name:"SAN VICENTE DEL CAGUAN",postal:"182010"},{dept_code:"18",code:"18756",name:"SOLANO",postal:"184010"},{dept_code:"18",code:"18785",name:"SOLITA",postal:"185070"},{dept_code:"18",code:"18860",name:"VALPARAISO",postal:"185050"},{dept_code:"85",code:"85001",name:"YOPAL",postal:"850009"},{dept_code:"85",code:"85010",name:"AGUAZUL",postal:"856010"},{dept_code:"85",code:"85015",name:"CHAMEZA",postal:"856030"},{dept_code:"85",code:"85125",name:"HATO COROZAL",postal:"852010"},{dept_code:"85",code:"85136",name:"LA SALINA",postal:"851010"},{dept_code:"85",code:"85139",name:"MANI",postal:"854018"},{dept_code:"85",code:"85162",name:"MONTERREY",postal:"855010"},{dept_code:"85",code:"85225",name:"NUNCHIA",postal:"851070"},{dept_code:"85",code:"85230",name:"OROCUE",postal:"853050"},{dept_code:"85",code:"85250",name:"PAZ DE ARIPORO",postal:"852030"},{dept_code:"85",code:"85263",name:"PORE",postal:"852057"},{dept_code:"85",code:"85279",name:"RECETOR",postal:"856050"},{dept_code:"85",code:"85300",name:"SABANALARGA",postal:"855050"},{dept_code:"85",code:"85315",name:"SACAMA",postal:"851038"},{dept_code:"85",code:"85325",name:"SAN LUIS DE PALENQUE",postal:"853030"},{dept_code:"85",code:"85400",name:"TAMARA",postal:"851050"},{dept_code:"85",code:"85410",name:"TAURAMENA",postal:"854030"},{dept_code:"85",code:"85430",name:"TRINIDAD",postal:"853019"},{dept_code:"85",code:"85440",name:"VILLANUEVA",postal:"855039"},{dept_code:"19",code:"19001",name:"POPAYAN",postal:"190001"},{dept_code:"19",code:"19022",name:"ALMAGUER",postal:"194080"},{dept_code:"19",code:"19050",name:"ARGELIA",postal:"195560"},{dept_code:"19",code:"19075",name:"BALBOA",postal:"195530"},{dept_code:"19",code:"19100",name:"BOLIVAR",postal:"195001"},{dept_code:"19",code:"19110",name:"BUENOS AIRES",postal:"191001"},{dept_code:"19",code:"19130",name:"CAJIBIO",postal:"190501"},{dept_code:"19",code:"19137",name:"CALDONO",postal:"192040"},{dept_code:"19",code:"19142",name:"CALOTO",postal:"191070"},{dept_code:"19",code:"19212",name:"CORINTO",postal:"191560"},{dept_code:"19",code:"19256",name:"EL TAMBO",postal:"193570"},{dept_code:"19",code:"19290",name:"FLORENCIA",postal:"195040"},{dept_code:"19",code:"19300",name:"GUACHENE",postal:"191087"},{dept_code:"19",code:"19318",name:"GUAPI",postal:"196001"},{dept_code:"19",code:"19355",name:"INZA",postal:"192548"},{dept_code:"19",code:"19364",name:"JAMBALO",postal:"192029"},{dept_code:"19",code:"19392",name:"LA SIERRA",postal:"194001"},{dept_code:"19",code:"19397",name:"LA VEGA",postal:"194020"},{dept_code:"19",code:"19418",name:"LOPEZ",postal:"196060"},{dept_code:"19",code:"19450",name:"MERCADERES",postal:"195060"},{dept_code:"19",code:"19455",name:"MIRANDA",postal:"191520"},{dept_code:"19",code:"19473",name:"MORALES",postal:"190567"},{dept_code:"19",code:"19513",name:"PADILLA",postal:"191540"},{dept_code:"19",code:"19517",name:"PAEZ",postal:"192501"},{dept_code:"19",code:"19532",name:"PATIA",postal:"195501"},{dept_code:"19",code:"19533",name:"PIAMONTE",postal:"194550"},{dept_code:"19",code:"19548",name:"PIENDAMO",postal:"190530"},{dept_code:"19",code:"19573",name:"PUERTO TEJADA",postal:"191501"},{dept_code:"19",code:"19585",name:"PURACE",postal:"193001"},{dept_code:"19",code:"19622",name:"ROSAS",postal:"193550"},{dept_code:"19",code:"19693",name:"SAN SEBASTIAN",postal:"194501"},{dept_code:"19",code:"19698",name:"SANTANDER DE QUILICHAO",postal:"191030"},{dept_code:"19",code:"19701",name:"SANTA ROSA",postal:"194520"},{dept_code:"19",code:"19743",name:"SILVIA",postal:"192070"},{dept_code:"19",code:"19760",name:"SOTARA",postal:"193501"},{dept_code:"19",code:"19780",name:"SUAREZ",postal:"190580"},{dept_code:"19",code:"19785",name:"SUCRE",postal:"194060"},{dept_code:"19",code:"19807",name:"TIMBIO",postal:"193520"},{dept_code:"19",code:"19809",name:"TIMBIQUI",postal:"196030"},{dept_code:"19",code:"19821",name:"TORIBIO",postal:"192001"},{dept_code:"19",code:"19824",name:"TOTORO",postal:"192570"},{dept_code:"19",code:"19845",name:"VILLA RICA",postal:"191060"},{dept_code:"20",code:"20001",name:"VALLEDUPAR",postal:"200018"},{dept_code:"20",code:"20011",name:"AGUACHICA",postal:"205010"},{dept_code:"20",code:"20013",name:"AGUSTIN CODAZZI",postal:"202050"},{dept_code:"20",code:"20032",name:"ASTREA",postal:"201040"},{dept_code:"20",code:"20045",name:"BECERRIL",postal:"203001"},{dept_code:"20",code:"20060",name:"BOSCONIA",postal:"201027"},{dept_code:"20",code:"20175",name:"CHIMICHAGUA",postal:"201050"},{dept_code:"20",code:"20178",name:"CHIRIGUANA",postal:"203040"},{dept_code:"20",code:"20228",name:"CURUMANI",postal:"203060"},{dept_code:"20",code:"20238",name:"EL COPEY",postal:"201010"},{dept_code:"20",code:"20250",name:"EL PASO",postal:"201030"},{dept_code:"20",code:"20295",name:"GAMARRA",postal:"205001"},{dept_code:"20",code:"20310",name:"GONZALEZ",postal:"205030"},{dept_code:"20",code:"20383",name:"LA GLORIA",postal:"204060"},{dept_code:"20",code:"20400",name:"LA JAGUA DE IBIRICO",postal:"203020"},{dept_code:"20",code:"20443",name:"MANAURE",postal:"202001"},{dept_code:"20",code:"20517",name:"PAILITAS",postal:"204001"},{dept_code:"20",code:"20550",name:"PELAYA",postal:"204047"},{dept_code:"20",code:"20570",name:"PUEBLO BELLO",postal:"201001"},{dept_code:"20",code:"20614",name:"RIO DE ORO",postal:"205040"},{dept_code:"20",code:"20621",name:"LA PAZ",postal:"202010"},{dept_code:"20",code:"20710",name:"SAN ALBERTO",postal:"205070"},{dept_code:"20",code:"20750",name:"SAN DIEGO",postal:"202030"},{dept_code:"20",code:"20770",name:"SAN MARTIN",postal:"205050"},{dept_code:"20",code:"20787",name:"TAMALAMEQUE",postal:"204020"},{dept_code:"27",code:"27001",name:"QUIBDO",postal:"270002"},{dept_code:"27",code:"27006",name:"ACANDI",postal:"278010"},{dept_code:"27",code:"27025",name:"ALTO BAUDO",postal:"276070"},{dept_code:"27",code:"27050",name:"ATRATO",postal:"272010"},{dept_code:"27",code:"27073",name:"BAGADO",postal:"271050"},{dept_code:"27",code:"27075",name:"BAHIA SOLANO",postal:"276030"},{dept_code:"27",code:"27077",name:"BAJO BAUDO",postal:"275030"},{dept_code:"27",code:"27099",name:"BOJAYA",postal:"277050"},{dept_code:"27",code:"27135",name:"EL CANTON DEL SAN PABLO",postal:"272040"},{dept_code:"27",code:"27150",name:"CARMEN DEL DARIEN",postal:"277030"},{dept_code:"27",code:"27160",name:"CERTEGUI",postal:"272020"},{dept_code:"27",code:"27205",name:"CONDOTO",postal:"273030"},{dept_code:"27",code:"27245",name:"EL CARMEN DE ATRATO",postal:"271010"},{dept_code:"27",code:"27250",name:"EL LITORAL DEL SAN JUAN",postal:"275050"},{dept_code:"27",code:"27361",name:"ISTMINA",postal:"274010"},{dept_code:"27",code:"27372",name:"JURADO",postal:"276010"},{dept_code:"27",code:"27413",name:"LLORO",postal:"271030"},{dept_code:"27",code:"27425",name:"MEDIO ATRATO",postal:"270070"},{dept_code:"27",code:"27430",name:"MEDIO BAUDO",postal:"275010"},{dept_code:"27",code:"27450",name:"MEDIO SAN JUAN",postal:"274030"},{dept_code:"27",code:"27491",name:"NOVITA",postal:"273050"},{dept_code:"27",code:"27495",name:"NUQUI",postal:"276050"},{dept_code:"27",code:"27580",name:"RIO IRO",postal:"273010"},{dept_code:"27",code:"27600",name:"RIO QUITO",postal:"272050"},{dept_code:"27",code:"27615",name:"RIOSUCIO",postal:"278050"},{dept_code:"27",code:"27660",name:"SAN JOSE DEL PALMAR",postal:"273070"},{dept_code:"27",code:"27745",name:"SIPI",postal:"274050"},{dept_code:"27",code:"27787",name:"TADO",postal:"271070"},{dept_code:"27",code:"27800",name:"UNGUIA",postal:"278030"},{dept_code:"27",code:"27810",name:"UNION PANAMERICANA",postal:"272030"},{dept_code:"23",code:"23001",name:"MONTERIA",postal:"230017"},{dept_code:"23",code:"23068",name:"AYAPEL",postal:"233530"},{dept_code:"23",code:"23079",name:"BUENAVISTA",postal:"233028"},{dept_code:"23",code:"23090",name:"CANALETE",postal:"235040"},{dept_code:"23",code:"23162",name:"CERETE",postal:"230550"},{dept_code:"23",code:"23168",name:"CHIMA",postal:"232010"},{dept_code:"23",code:"23182",name:"CHINU",postal:"232050"},{dept_code:"23",code:"23189",name:"CIENAGA DE ORO",postal:"232520"},{dept_code:"23",code:"23300",name:"COTORRA",postal:"230501"},{dept_code:"23",code:"23350",name:"LA APARTADA",postal:"233507"},{dept_code:"23",code:"23417",name:"LORICA",postal:"231029"},{dept_code:"23",code:"23419",name:"LOS CORDOBAS",postal:"235020"},{dept_code:"23",code:"23464",name:"MOMIL",postal:"232008"},{dept_code:"23",code:"23466",name:"MONTELIBANO",postal:"234007"},{dept_code:"23",code:"23500",name:"MONITOS",postal:"231007"},{dept_code:"23",code:"23555",name:"PLANETA RICA",postal:"233040"},{dept_code:"23",code:"23570",name:"PUEBLO NUEVO",postal:"233001"},{dept_code:"23",code:"23574",name:"PUERTO ESCONDIDO",postal:"235001"},{dept_code:"23",code:"23580",name:"PUERTO LIBERTADOR",postal:"234038"},{dept_code:"23",code:"23586",name:"PURISIMA",postal:"231540"},{dept_code:"23",code:"23660",name:"SAHAGUN",postal:"232549"},{dept_code:"23",code:"23670",name:"SAN ANDRES SOTAVENTO",postal:"232030"},{dept_code:"23",code:"23672",name:"SAN ANTERO",postal:"231520"},{dept_code:"23",code:"23675",name:"SAN BERNARDO DEL VIENTO",postal:"231501"},{dept_code:"23",code:"23678",name:"SAN CARLOS",postal:"232501"},{dept_code:"23",code:"23682",name:"SAN JOSE DE URE",postal:"234010"},{dept_code:"23",code:"23686",name:"SAN PELAYO",postal:"230538"},{dept_code:"23",code:"23807",name:"TIERRALTA",postal:"234517"},{dept_code:"23",code:"23815",name:"TUCHIN",postal:"232027"},{dept_code:"23",code:"23855",name:"VALENCIA",postal:"234539"},{dept_code:"25",code:"25001",name:"AGUA DE DIOS",postal:"252850"},{dept_code:"25",code:"25019",name:"ALBAN",postal:"253207"},{dept_code:"25",code:"25035",name:"ANAPOIMA",postal:"252647"},{dept_code:"25",code:"25040",name:"ANOLAIMA",postal:"253048"},{dept_code:"25",code:"25053",name:"ARBELAEZ",postal:"252001"},{dept_code:"25",code:"25086",name:"BELTRAN",postal:"253260"},{dept_code:"25",code:"25095",name:"BITUIMA",postal:"253220"},{dept_code:"25",code:"25099",name:"BOJACA",postal:"253001"},{dept_code:"25",code:"25120",name:"CABRERA",postal:"252040"},{dept_code:"25",code:"25123",name:"CACHIPAY",postal:"253020"},{dept_code:"25",code:"25126",name:"CAJICA",postal:"250240"},{dept_code:"25",code:"25148",name:"CAPARRAPI",postal:"253460"},{dept_code:"25",code:"25151",name:"CAQUEZA",postal:"251827"},{dept_code:"25",code:"25154",name:"CARMEN DE CARUPA",postal:"250420"},{dept_code:"25",code:"25168",name:"CHAGUANI",postal:"253240"},{dept_code:"25",code:"25175",name:"CHIA",postal:"250001"},{dept_code:"25",code:"25178",name:"CHIPAQUE",postal:"251801"},{dept_code:"25",code:"25181",name:"CHOACHI",postal:"251620"},{dept_code:"25",code:"25183",name:"CHOCONTA",postal:"250801"},{dept_code:"25",code:"25200",name:"COGUA",postal:"250408"},{dept_code:"25",code:"25214",name:"COTA",postal:"250010"},{dept_code:"25",code:"25224",name:"CUCUNUBA",postal:"250450"},{dept_code:"25",code:"25245",name:"EL COLEGIO",postal:"252630"},{dept_code:"25",code:"25258",name:"EL PENON",postal:"254027"},{dept_code:"25",code:"25260",name:"EL ROSAL",postal:"250210"},{dept_code:"25",code:"25269",name:"FACATATIVA",postal:"253058"},{dept_code:"25",code:"25279",name:"FOMEQUE",postal:"251640"},{dept_code:"25",code:"25281",name:"FOSCA",postal:"251830"},{dept_code:"25",code:"25286",name:"FUNZA",postal:"250020"},{dept_code:"25",code:"25288",name:"FUQUENE",postal:"250620"},{dept_code:"25",code:"25290",name:"FUSAGASUGA",postal:"252219"},{dept_code:"25",code:"25293",name:"GACHALA",postal:"251250"},{dept_code:"25",code:"25295",name:"GACHANCIPA",postal:"251020"},{dept_code:"25",code:"25297",name:"GACHETA",postal:"251230"},{dept_code:"25",code:"25299",name:"GAMA",postal:"251240"},{dept_code:"25",code:"25307",name:"GIRARDOT",postal:"252431"},{dept_code:"25",code:"25312",name:"GRANADA",postal:"252257"},{dept_code:"25",code:"25317",name:"GUACHETA",postal:"250610"},{dept_code:"25",code:"25320",name:"GUADUAS",postal:"253448"},{dept_code:"25",code:"25322",name:"GUASCA",postal:"251210"},{dept_code:"25",code:"25324",name:"GUATAQUI",postal:"252820"},{dept_code:"25",code:"25326",name:"GUATAVITA",postal:"251060"},{dept_code:"25",code:"25328",name:"GUAYABAL DE SIQUIMA",postal:"253210"},{dept_code:"25",code:"25335",name:"GUAYABETAL",postal:"251850"},{dept_code:"25",code:"25339",name:"GUTIERREZ",postal:"251860"},{dept_code:"25",code:"25368",name:"JERUSALEN",postal:"252810"},{dept_code:"25",code:"25372",name:"JUNIN",postal:"251220"},{dept_code:"25",code:"25377",name:"LA CALERA",postal:"251201"},{dept_code:"25",code:"25386",name:"LA MESA",postal:"252601"},{dept_code:"25",code:"25394",name:"LA PALMA",postal:"253808"},{dept_code:"25",code:"25398",name:"LA PENA",postal:"253640"},{dept_code:"25",code:"25402",name:"LA VEGA",postal:"253610"},{dept_code:"25",code:"25407",name:"LENGUAZAQUE",postal:"250601"},{dept_code:"25",code:"25426",name:"MACHETA",postal:"250840"},{dept_code:"25",code:"25430",name:"MADRID",postal:"250038"},{dept_code:"25",code:"25436",name:"MANTA",postal:"250830"},{dept_code:"25",code:"25438",name:"MEDINA",postal:"251420"},{dept_code:"25",code:"25473",name:"MOSQUERA",postal:"250040"},{dept_code:"25",code:"25483",name:"NARINO",postal:"252837"},{dept_code:"25",code:"25486",name:"NEMOCON",postal:"251030"},{dept_code:"25",code:"25488",name:"NILO",postal:"252401"},{dept_code:"25",code:"25489",name:"NIMAIMA",postal:"253630"},{dept_code:"25",code:"25491",name:"NOCAIMA",postal:"253620"},{dept_code:"25",code:"25506",name:"VENECIA",postal:"252037"},{dept_code:"25",code:"25513",name:"PACHO",postal:"254001"},{dept_code:"25",code:"25518",name:"PAIME",postal:"254040"},{dept_code:"25",code:"25524",name:"PANDI",postal:"252010"},{dept_code:"25",code:"25530",name:"PARATEBUENO",postal:"251401"},{dept_code:"25",code:"25535",name:"PASCA",postal:"252201"},{dept_code:"25",code:"25572",name:"PUERTO SALGAR",postal:"253480"},{dept_code:"25",code:"25580",name:"PULI",postal:"252801"},{dept_code:"25",code:"25592",name:"QUEBRADANEGRA",postal:"253427"},{dept_code:"25",code:"25594",name:"QUETAME",postal:"251840"},{dept_code:"25",code:"25596",name:"QUIPILE",postal:"253030"},{dept_code:"25",code:"25599",name:"APULO",postal:"252650"},{dept_code:"25",code:"25612",name:"RICAURTE",postal:"252417"},{dept_code:"25",code:"25645",name:"SAN ANTONIO DEL TEQUENDAMA",postal:"252620"},{dept_code:"25",code:"25649",name:"SAN BERNARDO",postal:"252020"},{dept_code:"25",code:"25653",name:"SAN CAYETANO",postal:"254050"},{dept_code:"25",code:"25658",name:"SAN FRANCISCO",postal:"253601"},{dept_code:"25",code:"25662",name:"SAN JUAN DE RIO SECO",postal:"253250"},{dept_code:"25",code:"25718",name:"SASAIMA",postal:"253401"},{dept_code:"25",code:"25736",name:"SESQUILE",postal:"251050"},{dept_code:"25",code:"25740",name:"SIBATE",postal:"250077"},{dept_code:"25",code:"25743",name:"SILVANIA",postal:"252240"},{dept_code:"25",code:"25745",name:"SIMIJACA",postal:"250647"},{dept_code:"25",code:"25754",name:"SOACHA",postal:"250051"},{dept_code:"25",code:"25758",name:"SOPO",postal:"251001"},{dept_code:"25",code:"25769",name:"SUBACHOQUE",postal:"250228"},{dept_code:"25",code:"25772",name:"SUESCA",postal:"251040"},{dept_code:"25",code:"25777",name:"SUPATA",postal:"253660"},{dept_code:"25",code:"25779",name:"SUSA",postal:"250630"},{dept_code:"25",code:"25781",name:"SUTATAUSA",postal:"250440"},{dept_code:"25",code:"25785",name:"TABIO",postal:"250237"},{dept_code:"25",code:"25793",name:"TAUSA",postal:"250410"},{dept_code:"25",code:"25797",name:"TENA",postal:"252610"},{dept_code:"25",code:"25799",name:"TENJO",postal:"250201"},{dept_code:"25",code:"25805",name:"TIBACUY",postal:"252230"},{dept_code:"25",code:"25807",name:"TIBIRITA",postal:"250820"},{dept_code:"25",code:"25815",name:"TOCAIMA",postal:"252840"},{dept_code:"25",code:"25817",name:"TOCANCIPA",postal:"251010"},{dept_code:"25",code:"25823",name:"TOPAIPI",postal:"253820"},{dept_code:"25",code:"25839",name:"UBALA",postal:"251260"},{dept_code:"25",code:"25841",name:"UBAQUE",postal:"251601"},{dept_code:"25",code:"25843",name:"VILLA DE SAN DIEGO DE UBATE",postal:"250430"},{dept_code:"25",code:"25845",name:"UNE",postal:"251810"},{dept_code:"25",code:"25851",name:"UTICA",postal:"253430"},{dept_code:"25",code:"25862",name:"VERGARA",postal:"253650"},{dept_code:"25",code:"25867",name:"VIANI",postal:"253230"},{dept_code:"25",code:"25871",name:"VILLAGOMEZ",postal:"254030"},{dept_code:"25",code:"25873",name:"VILLAPINZON",postal:"250810"},{dept_code:"25",code:"25875",name:"VILLETA",postal:"253418"},{dept_code:"25",code:"25878",name:"VIOTA",postal:"252660"},{dept_code:"25",code:"25885",name:"YACOPI",postal:"253840"},{dept_code:"25",code:"25898",name:"ZIPACON",postal:"253010"},{dept_code:"25",code:"25899",name:"ZIPAQUIRA",postal:"250251"},{dept_code:"94",code:"94001",name:"INIRIDA",postal:"940017"},{dept_code:"94",code:"94343",name:"BARRANCO MINAS",postal:"944010"},{dept_code:"94",code:"94663",name:"MAPIRIPANA",postal:"944058"},{dept_code:"94",code:"94883",name:"SAN FELIPE",postal:"942010"},{dept_code:"94",code:"94884",name:"PUERTO COLOMBIA",postal:"941039"},{dept_code:"94",code:"94885",name:"LA GUADALUPE",postal:"942057"},{dept_code:"94",code:"94886",name:"CACAHUAL",postal:"941010"},{dept_code:"94",code:"94887",name:"PANA PANA",postal:"943018"},{dept_code:"94",code:"94888",name:"MORICHAL",postal:"943059"},{dept_code:"95",code:"95001",name:"SAN JOSE DEL GUAVIARE",postal:"950001"},{dept_code:"95",code:"95015",name:"CALAMAR",postal:"953001"},{dept_code:"95",code:"95025",name:"EL RETORNO",postal:"951001"},{dept_code:"95",code:"95200",name:"MIRAFLORES",postal:"952001"},{dept_code:"41",code:"41001",name:"NEIVA",postal:"410010"},{dept_code:"41",code:"41006",name:"ACEVEDO",postal:"417079"},{dept_code:"41",code:"41013",name:"AGRADO",postal:"414040"},{dept_code:"41",code:"41016",name:"AIPE",postal:"411001"},{dept_code:"41",code:"41020",name:"ALGECIRAS",postal:"413040"},{dept_code:"41",code:"41026",name:"ALTAMIRA",postal:"416020"},{dept_code:"41",code:"41078",name:"BARAYA",postal:"411060"},{dept_code:"41",code:"41132",name:"CAMPOALEGRE",postal:"413020"},{dept_code:"41",code:"41206",name:"COLOMBIA",postal:"411080"},{dept_code:"41",code:"41244",name:"ELIAS",postal:"417001"},{dept_code:"41",code:"41298",name:"GARZON",postal:"414027"},{dept_code:"41",code:"41306",name:"GIGANTE",postal:"414001"},{dept_code:"41",code:"41319",name:"GUADALUPE",postal:"416040"},{dept_code:"41",code:"41349",name:"HOBO",postal:"413060"},{dept_code:"41",code:"41357",name:"IQUIRA",postal:"412060"},{dept_code:"41",code:"41359",name:"ISNOS",postal:"418048"},{dept_code:"41",code:"41378",name:"LA ARGENTINA",postal:"415080"},{dept_code:"41",code:"41396",name:"LA PLATA",postal:"415078"},{dept_code:"41",code:"41483",name:"NATAGA",postal:"415020"},{dept_code:"41",code:"41503",name:"OPORAPA",postal:"418001"},{dept_code:"41",code:"41518",name:"PAICOL",postal:"415040"},{dept_code:"41",code:"41524",name:"PALERMO",postal:"412001"},{dept_code:"41",code:"41530",name:"PALESTINA",postal:"417067"},{dept_code:"41",code:"41548",name:"PITAL",postal:"414060"},{dept_code:"41",code:"41551",name:"PITALITO",postal:"417038"},{dept_code:"41",code:"41615",name:"RIVERA",postal:"413001"},{dept_code:"41",code:"41660",name:"SALADOBLANCO",postal:"418020"},{dept_code:"41",code:"41668",name:"SAN AGUSTIN",postal:"418060"},{dept_code:"41",code:"41676",name:"SANTA MARIA",postal:"412020"},{dept_code:"41",code:"41770",name:"SUAZA",postal:"416080"},{dept_code:"41",code:"41791",name:"TARQUI",postal:"416001"},{dept_code:"41",code:"41797",name:"TESALIA",postal:"415001"},{dept_code:"41",code:"41799",name:"TELLO",postal:"411040"},{dept_code:"41",code:"41801",name:"TERUEL",postal:"412040"},{dept_code:"41",code:"41807",name:"TIMANA",postal:"417010"},{dept_code:"41",code:"41872",name:"VILLAVIEJA",postal:"411020"},{dept_code:"41",code:"41885",name:"YAGUARA",postal:"412087"},{dept_code:"44",code:"44001",name:"RIOHACHA",postal:"440001"},{dept_code:"44",code:"44035",name:"ALBANIA",postal:"443001"},{dept_code:"44",code:"44078",name:"BARRANCAS",postal:"443040"},{dept_code:"44",code:"44090",name:"DIBULLA",postal:"446001"},{dept_code:"44",code:"44098",name:"DISTRACCION",postal:"444001"},{dept_code:"44",code:"44110",name:"EL MOLINO",postal:"444050"},{dept_code:"44",code:"44279",name:"FONSECA",postal:"444010"},{dept_code:"44",code:"44378",name:"HATONUEVO",postal:"443020"},{dept_code:"44",code:"44420",name:"LA JAGUA DEL PILAR",postal:"445040"},{dept_code:"44",code:"44430",name:"MAICAO",postal:"442001"},{dept_code:"44",code:"44560",name:"MANAURE",postal:"441001"},{dept_code:"44",code:"44650",name:"SAN JUAN DEL CESAR",postal:"444037"},{dept_code:"44",code:"44847",name:"URIBIA",postal:"441020"},{dept_code:"44",code:"44855",name:"URUMITA",postal:"445020"},{dept_code:"44",code:"44874",name:"VILLANUEVA",postal:"445008"},{dept_code:"47",code:"47001",name:"SANTA MARTA",postal:"470009"},{dept_code:"47",code:"47030",name:"ALGARROBO",postal:"472040"},{dept_code:"47",code:"47053",name:"ARACATACA",postal:"472007"},{dept_code:"47",code:"47058",name:"ARIGUANI",postal:"475010"},{dept_code:"47",code:"47161",name:"CERRO SAN ANTONIO",postal:"476020"},{dept_code:"47",code:"47170",name:"CHIVOLO",postal:"476060"},{dept_code:"47",code:"47189",name:"CIENAGA",postal:"478002"},{dept_code:"47",code:"47205",name:"CONCORDIA",postal:"476030"},{dept_code:"47",code:"47245",name:"EL BANCO",postal:"473040"},{dept_code:"47",code:"47258",name:"EL PINON",postal:"476007"},{dept_code:"47",code:"47268",name:"EL RETEN",postal:"478060"},{dept_code:"47",code:"47288",name:"FUNDACION",postal:"472020"},{dept_code:"47",code:"47318",name:"GUAMAL",postal:"473020"},{dept_code:"47",code:"47460",name:"NUEVA GRANADA",postal:"475020"},{dept_code:"47",code:"47541",name:"PEDRAZA",postal:"476040"},{dept_code:"47",code:"47545",name:"PIJINO DEL CARMEN",postal:"474047"},{dept_code:"47",code:"47551",name:"PIVIJAY",postal:"477050"},{dept_code:"47",code:"47555",name:"PLATO",postal:"475030"},{dept_code:"47",code:"47570",name:"PUEBLOVIEJO",postal:"478048"},{dept_code:"47",code:"47605",name:"REMOLINO",postal:"477020"},{dept_code:"47",code:"47660",name:"SABANAS DE SAN ANGEL",postal:"475001"},{dept_code:"47",code:"47675",name:"SALAMINA",postal:"477040"},{dept_code:"47",code:"47692",name:"SAN SEBASTIAN DE BUENAVISTA",postal:"473007"},{dept_code:"47",code:"47703",name:"SAN ZENON",postal:"474060"},{dept_code:"47",code:"47707",name:"SANTA ANA",postal:"474020"},{dept_code:"47",code:"47720",name:"SANTA BARBARA DE PINTO",postal:"474001"},{dept_code:"47",code:"47745",name:"SITIONUEVO",postal:"477001"},{dept_code:"47",code:"47798",name:"TENERIFE",postal:"475057"},{dept_code:"47",code:"47960",name:"ZAPAYAN",postal:"476050"},{dept_code:"47",code:"47980",name:"ZONA BANANERA",postal:"478020"},{dept_code:"50",code:"50001",name:"VILLAVICENCIO",postal:"500004"},{dept_code:"50",code:"50006",name:"ACACIAS",postal:"507008"},{dept_code:"50",code:"50110",name:"BARRANCA DE UPIA",postal:"501007"},{dept_code:"50",code:"50124",name:"CABUYARO",postal:"501011"},{dept_code:"50",code:"50150",name:"CASTILLA LA NUEVA",postal:"507041"},{dept_code:"50",code:"50223",name:"CUBARRAL",postal:"506001"},{dept_code:"50",code:"50226",name:"CUMARAL",postal:"501021"},{dept_code:"50",code:"50245",name:"EL CALVARIO",postal:"501041"},{dept_code:"50",code:"50251",name:"EL CASTILLO",postal:"506047"},{dept_code:"50",code:"50270",name:"EL DORADO",postal:"506021"},{dept_code:"50",code:"50287",name:"FUENTE DE ORO",postal:"504021"},{dept_code:"50",code:"50313",name:"GRANADA",postal:"504001"},{dept_code:"50",code:"50318",name:"GUAMAL",postal:"507051"},{dept_code:"50",code:"50325",name:"MAPIRIPAN",postal:"503021"},{dept_code:"50",code:"50330",name:"MESETAS",postal:"505001"},{dept_code:"50",code:"50350",name:"LA MACARENA",postal:"505021"},{dept_code:"50",code:"50370",name:"URIBE",postal:"505041"},{dept_code:"50",code:"50400",name:"LEJANIAS",postal:"506067"},{dept_code:"50",code:"50450",name:"PUERTO CONCORDIA",postal:"503041"},{dept_code:"50",code:"50568",name:"PUERTO GAITAN",postal:"502058"},{dept_code:"50",code:"50573",name:"PUERTO LOPEZ",postal:"502001"},{dept_code:"50",code:"50577",name:"PUERTO LLERAS",postal:"503001"},{dept_code:"50",code:"50590",name:"PUERTO RICO",postal:"503061"},{dept_code:"50",code:"50606",name:"RESTREPO",postal:"501031"},{dept_code:"50",code:"50680",name:"SAN CARLOS DE GUAROA",postal:"507011"},{dept_code:"50",code:"50683",name:"SAN JUAN DE ARAMA",postal:"504047"},{dept_code:"50",code:"50686",name:"SAN JUANITO",postal:"501051"},{dept_code:"50",code:"50689",name:"SAN MARTIN",postal:"507037"},{dept_code:"50",code:"50711",name:"VISTAHERMOSA",postal:"504061"},{dept_code:"52",code:"52001",name:"PASTO",postal:"520038"},{dept_code:"52",code:"52019",name:"ALBAN",postal:"521050"},{dept_code:"52",code:"52022",name:"ALDANA",postal:"524540"},{dept_code:"52",code:"52036",name:"ANCUYA",postal:"526007"},{dept_code:"52",code:"52051",name:"ARBOLEDA",postal:"520578"},{dept_code:"52",code:"52079",name:"BARBACOAS",postal:"528069"},{dept_code:"52",code:"52083",name:"BELEN",postal:"521087"},{dept_code:"52",code:"52110",name:"BUESACO",postal:"520501"},{dept_code:"52",code:"52203",name:"COLON",postal:"521067"},{dept_code:"52",code:"52207",name:"CONSACA",postal:"522548"},{dept_code:"52",code:"52210",name:"CONTADERO",postal:"523087"},{dept_code:"52",code:"52215",name:"CORDOBA",postal:"524009"},{dept_code:"52",code:"52224",name:"CUASPUD",postal:"524560"},{dept_code:"52",code:"52227",name:"CUMBAL",postal:"525007"},{dept_code:"52",code:"52233",name:"CUMBITARA",postal:"526567"},{dept_code:"52",code:"52240",name:"CHACHAGÜI",postal:"522001"},{dept_code:"52",code:"52250",name:"EL CHARCO",postal:"527537"},{dept_code:"52",code:"52254",name:"EL PENOL",postal:"522088"},{dept_code:"52",code:"52256",name:"EL ROSARIO",postal:"527037"},{dept_code:"52",code:"52258",name:"EL TABLON DE GOMEZ",postal:"520539"},{dept_code:"52",code:"52260",name:"EL TAMBO",postal:"522060"},{dept_code:"52",code:"52287",name:"FUNES",postal:"523520"},{dept_code:"52",code:"52317",name:"GUACHUCAL",postal:"524588"},{dept_code:"52",code:"52320",name:"GUAITARILLA",postal:"525508"},{dept_code:"52",code:"52323",name:"GUALMATAN",postal:"524501"},{dept_code:"52",code:"52352",name:"ILES",postal:"523060"},{dept_code:"52",code:"52354",name:"IMUES",postal:"523028"},{dept_code:"52",code:"52356",name:"IPIALES",postal:"524060"},{dept_code:"52",code:"52378",name:"LA CRUZ",postal:"521028"},{dept_code:"52",code:"52381",name:"LA FLORIDA",postal:"522048"},{dept_code:"52",code:"52385",name:"LA LLANADA",postal:"526507"},{dept_code:"52",code:"52390",name:"LA TOLA",postal:"527547"},{dept_code:"52",code:"52399",name:"LA UNION",postal:"521528"},{dept_code:"52",code:"52405",name:"LEIVA",postal:"527067"},{dept_code:"52",code:"52411",name:"LINARES",postal:"522508"},{dept_code:"52",code:"52418",name:"LOS ANDES",postal:"526527"},{dept_code:"52",code:"52427",name:"MAGÜI",postal:"528001"},{dept_code:"52",code:"52435",name:"MALLAMA",postal:"525068"},{dept_code:"52",code:"52473",name:"MOSQUERA",postal:"527580"},{dept_code:"52",code:"52480",name:"NARINO",postal:"522027"},{dept_code:"52",code:"52490",name:"OLAYA HERRERA",postal:"527569"},{dept_code:"52",code:"52506",name:"OSPINA",postal:"523047"},{dept_code:"52",code:"52520",name:"FRANCISCO PIZARRO",postal:"528560"},{dept_code:"52",code:"52540",name:"POLICARPA",postal:"527001"},{dept_code:"52",code:"52560",name:"POTOSI",postal:"524039"},{dept_code:"52",code:"52565",name:"PROVIDENCIA",postal:"526020"},{dept_code:"52",code:"52573",name:"PUERRES",postal:"523548"},{dept_code:"52",code:"52585",name:"PUPIALES",postal:"524527"},{dept_code:"52",code:"52612",name:"RICAURTE",postal:"525039"},{dept_code:"52",code:"52621",name:"ROBERTO PAYAN",postal:"528037"},{dept_code:"52",code:"52678",name:"SAMANIEGO",postal:"526049"},{dept_code:"52",code:"52683",name:"SANDONA",postal:"522527"},{dept_code:"52",code:"52685",name:"SAN BERNARDO",postal:"521007"},{dept_code:"52",code:"52687",name:"SAN LORENZO",postal:"521548"},{dept_code:"52",code:"52693",name:"SAN PABLO",postal:"521047"},{dept_code:"52",code:"52694",name:"SAN PEDRO DE CARTAGO",postal:"521508"},{dept_code:"52",code:"52696",name:"SANTA BARBARA",postal:"527507"},{dept_code:"52",code:"52699",name:"SANTACRUZ",postal:"525579"},{dept_code:"52",code:"52720",name:"SAPUYES",postal:"525558"},{dept_code:"52",code:"52786",name:"TAMINANGO",postal:"521567"},{dept_code:"52",code:"52788",name:"TANGUA",postal:"523507"},{dept_code:"52",code:"52835",name:"SAN ANDRES DE TUMACO",postal:"528528"},{dept_code:"52",code:"52838",name:"TUQUERRES",postal:"525537"},{dept_code:"52",code:"52885",name:"YACUANQUER",postal:"523008"},{dept_code:"54",code:"54001",name:"CUCUTA",postal:"540019"},{dept_code:"54",code:"54003",name:"ABREGO",postal:"546070"},{dept_code:"54",code:"54051",name:"ARBOLEDAS",postal:"544550"},{dept_code:"54",code:"54099",name:"BOCHALEMA",postal:"543010"},{dept_code:"54",code:"54109",name:"BUCARASICA",postal:"545557"},{dept_code:"54",code:"54125",name:"CACOTA",postal:"544010"},{dept_code:"54",code:"54128",name:"CACHIRA",postal:"546030"},{dept_code:"54",code:"54172",name:"CHINACOTA",postal:"541070"},{dept_code:"54",code:"54174",name:"CHITAGA",postal:"544030"},{dept_code:"54",code:"54206",name:"CONVENCION",postal:"547050"},{dept_code:"54",code:"54223",name:"CUCUTILLA",postal:"544520"},{dept_code:"54",code:"54239",name:"DURANIA",postal:"544517"},{dept_code:"54",code:"54245",name:"EL CARMEN",postal:"547070"},{dept_code:"54",code:"54250",name:"EL TARRA",postal:"548050"},{dept_code:"54",code:"54261",name:"EL ZULIA",postal:"545510"},{dept_code:"54",code:"54313",name:"GRAMALOTE",postal:"545050"},{dept_code:"54",code:"54344",name:"HACARI",postal:"546510"},{dept_code:"54",code:"54347",name:"HERRAN",postal:"542017"},{dept_code:"54",code:"54377",name:"LABATECA",postal:"542050"},{dept_code:"54",code:"54385",name:"LA ESPERANZA",postal:"546050"},{dept_code:"54",code:"54398",name:"LA PLAYA",postal:"546530"},{dept_code:"54",code:"54405",name:"LOS PATIOS",postal:"541010"},{dept_code:"54",code:"54418",name:"LOURDES",postal:"545070"},{dept_code:"54",code:"54480",name:"MUTISCUA",postal:"544070"},{dept_code:"54",code:"54498",name:"OCANA",postal:"546552"},{dept_code:"54",code:"54518",name:"PAMPLONA",postal:"543050"},{dept_code:"54",code:"54520",name:"PAMPLONITA",postal:"543030"},{dept_code:"54",code:"54553",name:"PUERTO SANTANDER",postal:"548030"},{dept_code:"54",code:"54599",name:"RAGONVALIA",postal:"541050"},{dept_code:"54",code:"54660",name:"SALAZAR",postal:"544570"},{dept_code:"54",code:"54670",name:"SAN CALIXTO",postal:"547010"},{dept_code:"54",code:"54673",name:"SAN CAYETANO",postal:"545010"},{dept_code:"54",code:"54680",name:"SANTIAGO",postal:"545030"},{dept_code:"54",code:"54720",name:"SARDINATA",postal:"545530"},{dept_code:"54",code:"54743",name:"SILOS",postal:"544050"},{dept_code:"54",code:"54800",name:"TEORAMA",postal:"547030"},{dept_code:"54",code:"54810",name:"TIBU",postal:"548010"},{dept_code:"54",code:"54820",name:"TOLEDO",postal:"542030"},{dept_code:"54",code:"54871",name:"VILLA CARO",postal:"546010"},{dept_code:"54",code:"54874",name:"VILLA DEL ROSARIO",postal:"541030"},{dept_code:"86",code:"86001",name:"MOCOA",postal:"860001"},{dept_code:"86",code:"86219",name:"COLON",postal:"861040"},{dept_code:"86",code:"86320",name:"ORITO",postal:"862001"},{dept_code:"86",code:"86568",name:"PUERTO ASIS",postal:"862060"},{dept_code:"86",code:"86569",name:"PUERTO CAICEDO",postal:"862080"},{dept_code:"86",code:"86571",name:"PUERTO GUZMAN",postal:"863001"},{dept_code:"86",code:"86573",name:"PUERTO LEGUIZAMO",postal:"864001"},{dept_code:"86",code:"86749",name:"SIBUNDOY",postal:"861020"},{dept_code:"86",code:"86755",name:"SAN FRANCISCO",postal:"861001"},{dept_code:"86",code:"86757",name:"SAN MIGUEL",postal:"862040"},{dept_code:"86",code:"86760",name:"SANTIAGO",postal:"861060"},{dept_code:"86",code:"86865",name:"VALLE DEL GUAMUEZ",postal:"862020"},{dept_code:"86",code:"86885",name:"VILLAGARZON",postal:"861080"},{dept_code:"63",code:"63001",name:"ARMENIA",postal:"630007"},{dept_code:"63",code:"63111",name:"BUENAVISTA",postal:"632040"},{dept_code:"63",code:"63130",name:"CALARCA",postal:"632001"},{dept_code:"63",code:"63190",name:"CIRCASIA",postal:"631001"},{dept_code:"63",code:"63212",name:"CORDOBA",postal:"632020"},{dept_code:"63",code:"63272",name:"FILANDIA",postal:"634001"},{dept_code:"63",code:"63302",name:"GENOVA",postal:"632080"},{dept_code:"63",code:"63401",name:"LA TEBAIDA",postal:"633020"},{dept_code:"63",code:"63470",name:"MONTENEGRO",postal:"633007"},{dept_code:"63",code:"63548",name:"PIJAO",postal:"632060"},{dept_code:"63",code:"63594",name:"QUIMBAYA",postal:"634027"},{dept_code:"63",code:"63690",name:"SALENTO",postal:"631020"},{dept_code:"66",code:"66001",name:"PEREIRA",postal:"660001"},{dept_code:"66",code:"66045",name:"APIA",postal:"663030"},{dept_code:"66",code:"66075",name:"BALBOA",postal:"662010"},{dept_code:"66",code:"66088",name:"BELEN DE UMBRIA",postal:"664047"},{dept_code:"66",code:"66170",name:"DOSQUEBRADAS",postal:"661002"},{dept_code:"66",code:"66318",name:"GUATICA",postal:"664010"},{dept_code:"66",code:"66383",name:"LA CELIA",postal:"662030"},{dept_code:"66",code:"66400",name:"LA VIRGINIA",postal:"662001"},{dept_code:"66",code:"66440",name:"MARSELLA",postal:"661040"},{dept_code:"66",code:"66456",name:"MISTRATO",postal:"664020"},{dept_code:"66",code:"66572",name:"PUEBLO RICO",postal:"663011"},{dept_code:"66",code:"66594",name:"QUINCHIA",postal:"664008"},{dept_code:"66",code:"66682",name:"SANTA ROSA DE CABAL",postal:"661027"},{dept_code:"66",code:"66687",name:"SANTUARIO",postal:"663001"},{dept_code:"88",code:"88001",name:"SAN ANDRES",postal:"880008"},{dept_code:"88",code:"88564",name:"PROVIDENCIA",postal:"880027"},{dept_code:"68",code:"68001",name:"BUCARAMANGA",postal:"680008"},{dept_code:"68",code:"68013",name:"AGUADA",postal:"685521"},{dept_code:"68",code:"68020",name:"ALBANIA",postal:"684531"},{dept_code:"68",code:"68051",name:"ARATOCA",postal:"682051"},{dept_code:"68",code:"68077",name:"BARBOSA",postal:"684517"},{dept_code:"68",code:"68079",name:"BARICHARA",postal:"684041"},{dept_code:"68",code:"68081",name:"BARRANCABERMEJA",postal:"687032"},{dept_code:"68",code:"68092",name:"BETULIA",postal:"686501"},{dept_code:"68",code:"68101",name:"BOLIVAR",postal:"685001"},{dept_code:"68",code:"68121",name:"CABRERA",postal:"683501"},{dept_code:"68",code:"68132",name:"CALIFORNIA",postal:"680511"},{dept_code:"68",code:"68147",name:"CAPITANEJO",postal:"681541"},{dept_code:"68",code:"68152",name:"CARCASI",postal:"681521"},{dept_code:"68",code:"68160",name:"CEPITA",postal:"682061"},{dept_code:"68",code:"68162",name:"CERRITO",postal:"681501"},{dept_code:"68",code:"68167",name:"CHARALA",postal:"682551"},{dept_code:"68",code:"68169",name:"CHARTA",postal:"680551"},{dept_code:"68",code:"68176",name:"CHIMA",postal:"683001"},{dept_code:"68",code:"68179",name:"CHIPATA",postal:"685557"},{dept_code:"68",code:"68190",name:"CIMITARRA",postal:"686041"},{dept_code:"68",code:"68207",name:"CONCEPCION",postal:"681511"},{dept_code:"68",code:"68209",name:"CONFINES",postal:"683531"},{dept_code:"68",code:"68211",name:"CONTRATACION",postal:"683071"},{dept_code:"68",code:"68217",name:"COROMORO",postal:"682531"},{dept_code:"68",code:"68229",name:"CURITI",postal:"682041"},{dept_code:"68",code:"68235",name:"EL CARMEN DE CHUCURI",postal:"686561"},{dept_code:"68",code:"68245",name:"EL GUACAMAYO",postal:"683061"},{dept_code:"68",code:"68250",name:"EL PENON",postal:"685027"},{dept_code:"68",code:"68255",name:"EL PLAYON",postal:"687501"},{dept_code:"68",code:"68264",name:"ENCINO",postal:"682541"},{dept_code:"68",code:"68266",name:"ENCISO",postal:"681561"},{dept_code:"68",code:"68271",name:"FLORIAN",postal:"684541"},{dept_code:"68",code:"68276",name:"FLORIDABLANCA",postal:"681007"},{dept_code:"68",code:"68296",name:"GALAN",postal:"684051"},{dept_code:"68",code:"68298",name:"GAMBITA",postal:"683031"},{dept_code:"68",code:"68307",name:"GIRON",postal:"687558"},{dept_code:"68",code:"68318",name:"GUACA",postal:"681031"},{dept_code:"68",code:"68320",name:"GUADALUPE",postal:"683051"},{dept_code:"68",code:"68322",name:"GUAPOTA",postal:"683017"},{dept_code:"68",code:"68324",name:"GUAVATA",postal:"684501"},{dept_code:"68",code:"68327",name:"GÜEPSA",postal:"685547"},{dept_code:"68",code:"68344",name:"HATO",postal:"683571"},{dept_code:"68",code:"68368",name:"JESUS MARIA",postal:"684551"},{dept_code:"68",code:"68370",name:"JORDAN",postal:"684011"},{dept_code:"68",code:"68377",name:"LA BELLEZA",postal:"685061"},{dept_code:"68",code:"68385",name:"LANDAZURI",postal:"686021"},{dept_code:"68",code:"68397",name:"LA PAZ",postal:"685511"},{dept_code:"68",code:"68406",name:"LEBRIJA",postal:"687571"},{dept_code:"68",code:"68418",name:"LOS SANTOS",postal:"684001"},{dept_code:"68",code:"68425",name:"MACARAVITA",postal:"681531"},{dept_code:"68",code:"68432",name:"MALAGA",postal:"682011"},{dept_code:"68",code:"68444",name:"MATANZA",postal:"680561"},{dept_code:"68",code:"68464",name:"MOGOTES",postal:"682501"},{dept_code:"68",code:"68468",name:"MOLAGAVITA",postal:"682031"},{dept_code:"68",code:"68498",name:"OCAMONTE",postal:"682567"},{dept_code:"68",code:"68500",name:"OIBA",postal:"683021"},{dept_code:"68",code:"68502",name:"ONZAGA",postal:"682521"},{dept_code:"68",code:"68522",name:"PALMAR",postal:"683581"},{dept_code:"68",code:"68524",name:"PALMAS DEL SOCORRO",postal:"683541"},{dept_code:"68",code:"68533",name:"PARAMO",postal:"683527"},{dept_code:"68",code:"68547",name:"PIEDECUESTA",postal:"681012"},{dept_code:"68",code:"68549",name:"PINCHOTE",postal:"683511"},{dept_code:"68",code:"68572",name:"PUENTE NACIONAL",postal:"684521"},{dept_code:"68",code:"68573",name:"PUERTO PARRA",postal:"686001"},{dept_code:"68",code:"68575",name:"PUERTO WILCHES",postal:"687061"},{dept_code:"68",code:"68615",name:"RIONEGRO",postal:"687511"},{dept_code:"68",code:"68655",name:"SABANA DE TORRES",postal:"687007"},{dept_code:"68",code:"68669",name:"SAN ANDRES",postal:"682001"},{dept_code:"68",code:"68673",name:"SAN BENITO",postal:"685531"},{dept_code:"68",code:"68679",name:"SAN GIL",postal:"684031"},{dept_code:"68",code:"68682",name:"SAN JOAQUIN",postal:"682511"},{dept_code:"68",code:"68684",name:"SAN JOSE DE MIRANDA",postal:"682021"},{dept_code:"68",code:"68686",name:"SAN MIGUEL",postal:"681551"},{dept_code:"68",code:"68689",name:"SAN VICENTE DE CHUCURI",postal:"686531"},{dept_code:"68",code:"68705",name:"SANTA BARBARA",postal:"681021"},{dept_code:"68",code:"68720",name:"SANTA HELENA DEL OPON",postal:"685501"},{dept_code:"68",code:"68745",name:"SIMACOTA",postal:"683561"},{dept_code:"68",code:"68755",name:"SOCORRO",postal:"683557"},{dept_code:"68",code:"68770",name:"SUAITA",postal:"683041"},{dept_code:"68",code:"68773",name:"SUCRE",postal:"685041"},{dept_code:"68",code:"68780",name:"SURATA",postal:"680501"},{dept_code:"68",code:"68820",name:"TONA",postal:"680541"},{dept_code:"68",code:"68855",name:"VALLE DE SAN JOSE",postal:"682571"},{dept_code:"68",code:"68861",name:"VELEZ",postal:"685561"},{dept_code:"68",code:"68867",name:"VETAS",postal:"680531"},{dept_code:"68",code:"68872",name:"VILLANUEVA",postal:"684021"},{dept_code:"68",code:"68895",name:"ZAPATOCA",postal:"684069"},{dept_code:"70",code:"70001",name:"SINCELEJO",postal:"700007"},{dept_code:"70",code:"70110",name:"BUENAVISTA",postal:"702030"},{dept_code:"70",code:"70124",name:"CAIMITO",postal:"704010"},{dept_code:"70",code:"70204",name:"COLOSO",postal:"707030"},{dept_code:"70",code:"70215",name:"COROZAL",postal:"705039"},{dept_code:"70",code:"70221",name:"COVENAS",postal:"706057"},{dept_code:"70",code:"70230",name:"CHALAN",postal:"701017"},{dept_code:"70",code:"70233",name:"EL ROBLE",postal:"705058"},{dept_code:"70",code:"70235",name:"GALERAS",postal:"702050"},{dept_code:"70",code:"70265",name:"GUARANDA",postal:"703070"},{dept_code:"70",code:"70400",name:"LA UNION",postal:"704057"},{dept_code:"70",code:"70418",name:"LOS PALMITOS",postal:"701050"},{dept_code:"70",code:"70429",name:"MAJAGUAL",postal:"703050"},{dept_code:"70",code:"70473",name:"MORROA",postal:"701078"},{dept_code:"70",code:"70508",name:"OVEJAS",postal:"701030"},{dept_code:"70",code:"70523",name:"PALMITO",postal:"706030"},{dept_code:"70",code:"70670",name:"SAMPUES",postal:"705079"},{dept_code:"70",code:"70678",name:"SAN BENITO ABAD",postal:"703010"},{dept_code:"70",code:"70702",name:"SAN JUAN DE BETULIA",postal:"705010"},{dept_code:"70",code:"70708",name:"SAN MARCOS",postal:"704037"},{dept_code:"70",code:"70713",name:"SAN ONOFRE",postal:"707018"},{dept_code:"70",code:"70717",name:"SAN PEDRO",postal:"702010"},{dept_code:"70",code:"70742",name:"SAN LUIS DE SINCE",postal:"702070"},{dept_code:"70",code:"70771",name:"SUCRE",postal:"703030"},{dept_code:"70",code:"70820",name:"SANTIAGO DE TOLU",postal:"706018"},{dept_code:"70",code:"70823",name:"TOLU VIEJO",postal:"707050"},{dept_code:"73",code:"73001",name:"IBAGUE",postal:"730010"},{dept_code:"73",code:"73024",name:"ALPUJARRA",postal:"734560"},{dept_code:"73",code:"73026",name:"ALVARADO",postal:"730527"},{dept_code:"73",code:"73030",name:"AMBALEMA",postal:"731001"},{dept_code:"73",code:"73043",name:"ANZOATEGUI",postal:"730540"},{dept_code:"73",code:"73055",name:"ARMERO",postal:"732060"},{dept_code:"73",code:"73067",name:"ATACO",postal:"735050"},{dept_code:"73",code:"73124",name:"CAJAMARCA",postal:"732507"},{dept_code:"73",code:"73148",name:"CARMEN DE APICALA",postal:"733590"},{dept_code:"73",code:"73152",name:"CASABIANCA",postal:"731520"},{dept_code:"73",code:"73168",name:"CHAPARRAL",postal:"735569"},{dept_code:"73",code:"73200",name:"COELLO",postal:"733501"},{dept_code:"73",code:"73217",name:"COYAIMA",postal:"735020"},{dept_code:"73",code:"73226",name:"CUNDAY",postal:"734040"},{dept_code:"73",code:"73236",name:"DOLORES",postal:"734540"},{dept_code:"73",code:"73268",name:"ESPINAL",postal:"733529"},{dept_code:"73",code:"73270",name:"FALAN",postal:"732001"},{dept_code:"73",code:"73275",name:"FLANDES",postal:"733510"},{dept_code:"73",code:"73283",name:"FRESNO",postal:"731560"},{dept_code:"73",code:"73319",name:"GUAMO",postal:"733549"},{dept_code:"73",code:"73347",name:"HERVEO",postal:"731540"},{dept_code:"73",code:"73349",name:"HONDA",postal:"732040"},{dept_code:"73",code:"73352",name:"ICONONZO",postal:"734028"},{dept_code:"73",code:"73408",name:"LERIDA",postal:"731020"},{dept_code:"73",code:"73411",name:"LIBANO",postal:"731048"},{dept_code:"73",code:"73443",name:"SAN SEBASTIAN DE MARIQUITA",postal:"732020"},{dept_code:"73",code:"73449",name:"MELGAR",postal:"734001"},{dept_code:"73",code:"73461",name:"MURILLO",postal:"731060"},{dept_code:"73",code:"73483",name:"NATAGAIMA",postal:"735001"},{dept_code:"73",code:"73504",name:"ORTEGA",postal:"735501"},{dept_code:"73",code:"73520",name:"PALOCABILDO",postal:"731580"},{dept_code:"73",code:"73547",name:"PIEDRAS",postal:"730501"},{dept_code:"73",code:"73555",name:"PLANADAS",postal:"735070"},{dept_code:"73",code:"73563",name:"PRADO",postal:"734520"},{dept_code:"73",code:"73585",name:"PURIFICACION",postal:"734501"},{dept_code:"73",code:"73616",name:"RIOBLANCO",postal:"735580"},{dept_code:"73",code:"73622",name:"RONCESVALLES",postal:"735550"},{dept_code:"73",code:"73624",name:"ROVIRA",postal:"733040"},{dept_code:"73",code:"73671",name:"SALDANA",postal:"733578"},{dept_code:"73",code:"73675",name:"SAN ANTONIO",postal:"735530"},{dept_code:"73",code:"73678",name:"SAN LUIS",postal:"733001"},{dept_code:"73",code:"73686",name:"SANTA ISABEL",postal:"730560"},{dept_code:"73",code:"73770",name:"SUAREZ",postal:"733580"},{dept_code:"73",code:"73854",name:"VALLE DE SAN JUAN",postal:"733020"},{dept_code:"73",code:"73861",name:"VENADILLO",postal:"730580"},{dept_code:"73",code:"73870",name:"VILLAHERMOSA",postal:"731501"},{dept_code:"73",code:"73873",name:"VILLARRICA",postal:"734060"},{dept_code:"76",code:"76001",name:"CALI",postal:"760044"},{dept_code:"76",code:"76020",name:"ALCALA",postal:"762040"},{dept_code:"76",code:"76036",name:"ANDALUCIA",postal:"763010"},{dept_code:"76",code:"76041",name:"ANSERMANUEVO",postal:"762018"},{dept_code:"76",code:"76054",name:"ARGELIA",postal:"761510"},{dept_code:"76",code:"76100",name:"BOLIVAR",postal:"761001"},{dept_code:"76",code:"76109",name:"BUENAVENTURA",postal:"764501"},{dept_code:"76",code:"76111",name:"GUADALAJARA DE BUGA",postal:"763047"},{dept_code:"76",code:"76113",name:"BUGALAGRANDE",postal:"763008"},{dept_code:"76",code:"76122",name:"CAICEDONIA",postal:"762547"},{dept_code:"76",code:"76126",name:"CALIMA",postal:"760537"},{dept_code:"76",code:"76130",name:"CANDELARIA",postal:"763570"},{dept_code:"76",code:"76147",name:"CARTAGO",postal:"762021"},{dept_code:"76",code:"76233",name:"DAGUA",postal:"760520"},{dept_code:"76",code:"76243",name:"EL AGUILA",postal:"762001"},{dept_code:"76",code:"76246",name:"EL CAIRO",postal:"761501"},{dept_code:"76",code:"76248",name:"EL CERRITO",postal:"763520"},{dept_code:"76",code:"76250",name:"EL DOVIO",postal:"761560"},{dept_code:"76",code:"76275",name:"FLORIDA",postal:"763568"},{dept_code:"76",code:"76306",name:"GINEBRA",postal:"763517"},{dept_code:"76",code:"76318",name:"GUACARI",postal:"763501"},{dept_code:"76",code:"76364",name:"JAMUNDI",postal:"764001"},{dept_code:"76",code:"76377",name:"LA CUMBRE",postal:"760510"},{dept_code:"76",code:"76400",name:"LA UNION",postal:"761548"},{dept_code:"76",code:"76403",name:"LA VICTORIA",postal:"762510"},{dept_code:"76",code:"76497",name:"OBANDO",postal:"762501"},{dept_code:"76",code:"76520",name:"PALMIRA",postal:"763537"},{dept_code:"76",code:"76563",name:"PRADERA",postal:"763558"},{dept_code:"76",code:"76606",name:"RESTREPO",postal:"760540"},{dept_code:"76",code:"76616",name:"RIOFRIO",postal:"761030"},{dept_code:"76",code:"76622",name:"ROLDANILLO",postal:"761558"},{dept_code:"76",code:"76670",name:"SAN PEDRO",postal:"763030"},{dept_code:"76",code:"76736",name:"SEVILLA",postal:"762538"},{dept_code:"76",code:"76823",name:"TORO",postal:"761520"},{dept_code:"76",code:"76828",name:"TRUJILLO",postal:"761020"},{dept_code:"76",code:"76834",name:"TULUA",postal:"763029"},{dept_code:"76",code:"76845",name:"ULLOA",postal:"762030"},{dept_code:"76",code:"76863",name:"VERSALLES",postal:"761537"},{dept_code:"76",code:"76869",name:"VIJES",postal:"760550"},{dept_code:"76",code:"76890",name:"YOTOCO",postal:"761040"},{dept_code:"76",code:"76892",name:"YUMBO",postal:"760507"},{dept_code:"76",code:"76895",name:"ZARZAL",postal:"762527"},{dept_code:"97",code:"97001",name:"MITU",postal:"970001"},{dept_code:"97",code:"97161",name:"CARURU",postal:"973001"},{dept_code:"97",code:"97511",name:"PACOA",postal:"972007"},{dept_code:"97",code:"97666",name:"TARAIRA",postal:"972040"},{dept_code:"97",code:"97777",name:"PAPUNAUA",postal:"973047"},{dept_code:"97",code:"97889",name:"YAVARATE",postal:"971007"},{dept_code:"99",code:"99001",name:"PUERTO CARRENO",postal:"990001"},{dept_code:"99",code:"99524",name:"LA PRIMAVERA",postal:"992001"},{dept_code:"99",code:"99624",name:"SANTA ROSALIA",postal:"992050"},{dept_code:"99",code:"99773",name:"CUMARIBO",postal:"991001"}];function gr(e){return No.filter(t=>t.dept_code===e)}function vr(e){return Ls.find(t=>t.code===e)}function hr(e){return Ns.find(t=>t.code===e)}function yr(e){return No.find(t=>t.code===e)}window.geoMunisByDept=gr;window.geoDept=vr;window.GEO_PAISES=Ns;window.GEO_MUNIS=No;window.GEO_DEPTS=Ls;window.geoMuni=yr;window.geoPais=hr;const Ce=e=>document.querySelector(e),Fs=e=>[...document.querySelectorAll(e)],Qa=document.createElement("div");function Pa(e){return Qa.textContent=String(e??""),Qa.innerHTML}const Ps=new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}),Rs=new Intl.NumberFormat("es-CO");function _r(e){return Ps.format(e??0)}function xr(e){return Rs.format(e??0)}function Ar(e){return parseFloat(String(e??"").replace(/[^0-9.\-]/g,""))||0}function Ds(){return new Date().toISOString().slice(0,10)}function $r(){return new Date().toISOString().slice(0,19).replace("T"," ")}function wr(e){return e?new Date(e).toLocaleDateString("es-CO",{day:"2-digit",month:"2-digit",year:"numeric"}):"—"}const Za={success:"fa-check-circle",error:"fa-times-circle",warning:"fa-exclamation-triangle",info:"fa-info-circle"};function Er(e,t="success",a=3500){const o=Ce("#toast-container");if(!o)return;const s=document.createElement("div");s.className=`toast toast-${t} toast-enter`,s.innerHTML=`<i class="fas ${Za[t]??Za.info}"></i><span>${Pa(e)}</span>`,o.appendChild(s),setTimeout(()=>{s.style.cssText="opacity:0;transform:translateX(100%);transition:all .3s",setTimeout(()=>s.remove(),300)},a)}function ks(e,t,a="",o=!1){Ce("#modal-title").innerHTML=e,Ce("#modal-body").innerHTML=t,Ce("#modal-footer").innerHTML=a,Ce("#modal-box").classList.toggle("wide",o),Ce("#modal-overlay").classList.add("show")}function Os(){Ce("#modal-overlay").classList.remove("show"),Ce("#modal-body").innerHTML="",Ce("#modal-footer").innerHTML=""}let Xt=null;function Cr(e,t){var i;const a=t==="edit"?typeof TX_EDIT_STATE<"u"?TX_EDIT_STATE:null:typeof TX_STATE<"u"?TX_STATE:null;if(!a)return;const o=((i=a.lines[e])==null?void 0:i.description)||"";Xt={lineIdx:e,ctx:t};const s=document.getElementById("line-comment-textarea");s&&(s.value=o);const n=document.getElementById("line-comment-overlay");n&&(n.style.display="flex",setTimeout(()=>s==null?void 0:s.focus(),50))}function va(){Xt=null;const e=document.getElementById("line-comment-overlay");e&&(e.style.display="none")}function Tr(){var s;if(!Xt)return va();const{lineIdx:e,ctx:t}=Xt,a=(((s=document.getElementById("line-comment-textarea"))==null?void 0:s.value)||"").trim(),o=t==="edit"?typeof TX_EDIT_STATE<"u"?TX_EDIT_STATE:null:typeof TX_STATE<"u"?TX_STATE:null;o&&o.lines[e]!==void 0?(o.lines[e].description=a,va(),t==="edit"&&typeof renderEditTxLines=="function"?renderEditTxLines(!1):typeof renderTxLines=="function"&&renderTxLines(!1)):va()}function Ir(e,t,a,o=!0){ks(e,`<p class="text-sm" style="color:#374151">${Pa(t)}</p>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn ${o?"btn-danger":"btn-primary"}" id="modal-confirm-btn">Confirmar</button>`),setTimeout(()=>{const s=Ce("#modal-confirm-btn");s&&s.addEventListener("click",()=>{Os(),a()})},50)}function Sr(e,t,a=null,o=""){const s=t.toLowerCase();Fs(`#${e} tbody tr`).forEach(n=>{const i=!s||n.textContent.toLowerCase().includes(s),r=!o||(n.dataset[a]??"")===o;n.style.display=i&&r?"":"none"})}function Nr(e,t,a,o){const s=Ce(`#${e}`);if(!s||t<=1){s&&(s.innerHTML="");return}let n='<div class="pagination justify-end mt-4">';n+=`<button class="page-btn" onclick="(${o.toString()})(${a-1})" ${a<=1?"disabled":""}><i class="fas fa-chevron-left text-xs"></i></button>`;const i=[];for(let r=1;r<=t;r++)r===1||r===t||Math.abs(r-a)<=2?i.push(r):i[i.length-1]!=="…"&&i.push("…");i.forEach(r=>{r==="…"?n+='<span class="page-btn" style="cursor:default">…</span>':n+=`<button class="page-btn ${r===a?"active":""}" onclick="(${o.toString()})(${r})">${r}</button>`}),n+=`<button class="page-btn" onclick="(${o.toString()})(${a+1})" ${a>=t?"disabled":""}><i class="fas fa-chevron-right text-xs"></i></button>`,n+="</div>",s.innerHTML=n}function Lr(e,t=300){let a;return(...o)=>{clearTimeout(a),a=setTimeout(()=>e(...o),t)}}const Fr=[{code:"NIT",name:"NIT"},{code:"CC",name:"Cédula de Ciudadanía"},{code:"CE",name:"Cédula de Extranjería"},{code:"TI",name:"Tarjeta de Identidad"},{code:"PAS",name:"Pasaporte"},{code:"RC",name:"Registro Civil"}],Pr=[{code:"COMUN",name:"Régimen Común"},{code:"SIMPLIFICADO",name:"Régimen Simplificado"},{code:"NO_RESP",name:"No Responsable IVA"},{code:"GRAN_CONTR",name:"Gran Contribuyente"}],Rr=[{code:"NATURAL",name:"Persona Natural"},{code:"JURIDICA",name:"Persona Jurídica"},{code:"GRAN_CONTRIBUYENTE",name:"Gran Contribuyente"}],Dr=[{code:"CLIENTE",name:"Cliente"},{code:"PROVEEDOR",name:"Proveedor"},{code:"EMPLEADO",name:"Empleado"},{code:"PROPIETARIO",name:"Propietario"},{code:"ACREEDOR",name:"Acreedor"},{code:"TRANSPORTISTA",name:"Transportista"},{code:"OTRO",name:"Otro"}],kr=typeof GEO_DEPTS<"u"?GEO_DEPTS:[],Bs=[3,7,13,17,19,23,29,37,41,43,47,53,59,67,71];function Or(e){const t=String(e).replace(/\D/g,"");if(!t)return"";let a=0;for(let s=0;s<t.length;s++)a+=+t[t.length-1-s]*Bs[s];const o=a%11;return String(o<2?o:11-o)}const Br=["Factura de Venta","Factura de Compra","Recibo de Caja","Comprobante de Egreso","Nota Crédito","Nota Débito","Orden de Compra","Contrato","Otro"],Mr=["Causar","Recaudar","Reportar Cartera"],Lo={admin:{label:"Administrador",badge:"badge-orange"},contador:{label:"Contador",badge:"badge-blue"},auxiliar:{label:"Auxiliar",badge:"badge-green"},auditor:{label:"Auditor",badge:"badge-gray"},viewer:{label:"Visualizador",badge:"badge-gray"}};function Ms(e){var t;return((t=Lo[e])==null?void 0:t.label)??e}function Ur(e){var t;return`<span class="badge ${((t=Lo[e])==null?void 0:t.badge)??"badge-gray"}">${Pa(Ms(e))}</span>`}function Vr(e,t,a){const o=XLSX.utils.json_to_sheet(e.map(n=>Object.fromEntries(t.map((i,r)=>[i.label,n[i.key]])))),s=XLSX.utils.book_new();XLSX.utils.book_append_sheet(s,o,"Datos"),XLSX.writeFile(s,`${a}_${Ds()}.xlsx`)}function jr(e){var t;return(((t=Ce(`#${e}`))==null?void 0:t.value)??"").trim()}function Hr(e){var t;return!!((t=Ce(`#${e}`))!=null&&t.checked)}function Gr(e){var t;return((t=Ce(`#${e}`))==null?void 0:t.value)??""}function zr(e,t){const a=Ce(`#${e}`);a&&(a.value=t??"")}window.getCheckVal=Hr;window._lineCommentState=Xt;window.fmt=_r;window.exportToExcel=Vr;window.getSelectVal=Gr;window._fmtCOP=Ps;window.esc=Pa;window.$=Ce;window.fmtDate=wr;window.calcDV=Or;window.nowStr=$r;window.closeModal=Os;window.renderPagination=Nr;window.debounce=Lr;window.CROSS_PURPOSES=Mr;window.confirmDialog=Ir;window.DOC_TYPES=Fr;window.$$=Fs;window.CROSS_DOC_TYPES=Br;window.COL_DEPTS=kr;window.getInputVal=jr;window.openModal=ks;window.TOAST_ICONS=Za;window.TAX_REGIMES=Pr;window.filterTable=Sr;window.openLineComment=Cr;window.PERSON_TYPES=Rr;window._NIT_FACTORS=Bs;window.roleLabel=Ms;window.saveLineComment=Tr;window.fmtN=xr;window.closeLineComment=va;window.TP_TYPES=Dr;window.showToast=Er;window.setInputVal=zr;window.ROLES=Lo;window.todayStr=Ds;window.roleBadge=Ur;window.parseNum=Ar;window._escDiv=Qa;window._fmtNum=Rs;const je=window.location.origin,k={_token:null,_user:null,get authToken(){return this._token??localStorage.getItem("pb_token")},set authToken(e){this._token=e,e?localStorage.setItem("pb_token",e):localStorage.removeItem("pb_token")},get currentUser(){if(this._user)return this._user;try{return JSON.parse(localStorage.getItem("pb_user")??"null")}catch{return localStorage.removeItem("pb_user"),null}},set currentUser(e){this._user=e,e?localStorage.setItem("pb_user",JSON.stringify(e)):localStorage.removeItem("pb_user")},escapeFilterValue(e){return String(e??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," ").trim()},headers(){const e={"Content-Type":"application/json"};return this.authToken&&(e.Authorization=`Bearer ${this.authToken}`),e},async list(e,{filter:t="",sort:a="",page:o=1,perPage:s=200,expand:n=""}={}){const i=new URLSearchParams({page:o,perPage:s});t&&i.set("filter",t),a&&i.set("sort",a),n&&i.set("expand",n);const r=await fetch(`${je}/api/collections/${e}/records?${i}`,{headers:this.headers()});if(!r.ok)throw await this._err(r);return r.json()},async listAll(e,t={}){let a=1;const o=[];for(;;){const s=await this.list(e,{...t,page:a,perPage:200});if(o.push(...s.items),a>=s.totalPages)break;a++}return o},async get(e,t,{expand:a=""}={}){const o=a?`?expand=${encodeURIComponent(a)}`:"",s=await fetch(`${je}/api/collections/${e}/records/${t}${o}`,{headers:this.headers()});if(!s.ok)throw await this._err(s);return s.json()},async create(e,t){const a=await fetch(`${je}/api/collections/${e}/records`,{method:"POST",headers:this.headers(),body:JSON.stringify(t)});if(!a.ok)throw await this._err(a);return a.json()},async update(e,t,a){const o=await fetch(`${je}/api/collections/${e}/records/${t}`,{method:"PATCH",headers:this.headers(),body:JSON.stringify(a)});if(!o.ok)throw await this._err(o);return o.json()},async delete(e,t){const a=await fetch(`${je}/api/collections/${e}/records/${t}`,{method:"DELETE",headers:this.headers()});if(!a.ok&&a.status!==204)throw await this._err(a);return!0},async authWithPassword(e,t){const a=await fetch(`${je}/api/collections/users/auth-with-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identity:e,password:t})});if(!a.ok)throw await this._err(a);const o=await a.json();return this.authToken=o.token,this.currentUser=o.record,o},async authRefresh(){if(!this.authToken)return null;const e=await fetch(`${je}/api/collections/users/auth-refresh`,{method:"POST",headers:this.headers()});if(!e.ok)return this.authToken=null,this.currentUser=null,null;const t=await e.json();return this.authToken=t.token,this.currentUser=t.record,t},logout(){this.authToken=null,this.currentUser=null},async ping(){try{return(await fetch(`${je}/api/health`,{signal:AbortSignal.timeout(3e3)})).ok}catch{return!1}},async _err(e){var n,i;let t={};try{t=await e.json()}catch{t={message:e.statusText}}const a=t!=null&&t.data&&typeof t.data=="object"?Object.values(t.data).map(r=>r==null?void 0:r.message).filter(Boolean):[],o=(t==null?void 0:t.message)??((i=(n=t==null?void 0:t.data)==null?void 0:n.identity)==null?void 0:i.message)??a[0]??"Error desconocido",s=new Error(o);return s.status=e.status,s.data=t,s}},qr={async getSetting(e){var t;try{const a=k.escapeFilterValue(e);return((t=(await k.list("settings",{filter:`key="${a}"`,perPage:1})).items[0])==null?void 0:t.value)??""}catch{return""}},async setSetting(e,t){try{const a=k.escapeFilterValue(e),o=await k.list("settings",{filter:`key="${a}"`,perPage:1});return o.items.length?await k.update("settings",o.items[0].id,{value:t}):await k.create("settings",{key:e,value:t})}catch(a){const o=String((a==null?void 0:a.message)||"").toLowerCase();throw(a==null?void 0:a.status)===400||(a==null?void 0:a.status)===403||o.includes("allowed")||o.includes("permission")?new Error("No tienes permisos para modificar configuración global."):a}},async logAudit(e,t,a=null,o=""){try{if(!k.authToken)return;await fetch(`${je}/api/audit-event`,{method:"POST",headers:k.headers(),body:JSON.stringify({action:String(e||""),entity:String(t||""),entity_id:a?String(a):"",details:String(o||"")})})}catch{}},async getAuditLogs(e={}){const{entity:t="",entityId:a="",actions:o=[],sort:s="-event_at",limit:n=100}=e,i=[];if(t&&i.push(`entity="${k.escapeFilterValue(t)}"`),a&&i.push(`entity_id="${k.escapeFilterValue(a)}"`),Array.isArray(o)&&o.length){const r=o.map(c=>`action="${k.escapeFilterValue(c)}"`).join(" || ");i.push(`(${r})`)}return k.listAll("audit_log",{filter:i.join(" && ")||"",sort:s,perPage:Math.max(1,Math.min(200,Number(n)||100))})},async getAccounts(e=!0){const t=e?"active=true":"";return k.listAll("accounts",{filter:t,sort:"code",expand:"account_type_id"})},async getAccountSaldos(){const e=await k.listAll("tx_lines",{expand:"tx_id",filter:'tx_id.status="active"'}),t={};for(const a of e)t[a.account_id]||(t[a.account_id]=0),t[a.account_id]+=(a.debit??0)-(a.credit??0);return t},async getTerceros(e={}){const{type:t="",query:a=""}=e;let o="active=true";if(t){const s=k.escapeFilterValue(t);o+=` && type="${s}"`}if(a){const s=k.escapeFilterValue(a);o+=` && (name~"${s}" || doc_number~"${s}")`}return k.listAll("third_parties",{filter:o,sort:"name"})},async getTxTypes(){return k.listAll("transaction_types",{filter:"active=true",sort:"code"})},async nextConsecutive(e){const a=((await k.get("transaction_types",e)).consecutive??0)+1;return await k.update("transaction_types",e,{consecutive:a}),String(a).padStart(8,"0")},async createTransaction(e,t){const a=await k.create("transactions",{...e,number:e.number||"AUTO",status:e.status||"active"});try{for(const o of t)await k.create("tx_lines",{tx_id:a.id,...o})}catch(o){try{await k.delete("transactions",a.id)}catch{}throw o}return a},async getTransactions(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-id"}=e;try{return await k.list("transactions",{page:t,perPage:a,filter:o,sort:s,expand:"tx_type_id,third_party_id,user_id"})}catch(n){if(s!=="-id")return k.list("transactions",{page:t,perPage:a,filter:o,sort:"-id",expand:"tx_type_id,third_party_id,user_id"});throw n}},async getTxLines(e){return k.listAll("tx_lines",{filter:`tx_id="${e}"`,sort:"line_order",expand:"account_id,third_party_id"})},async voidTransaction(e,t=""){const a=await k.get("transactions",e);return a.status==="voided"||(await k.update("transactions",e,{status:"voided"}),await this.logAudit("VOID","transactions",e,t||`Transacción ${a.number} anulada`)),a},async approveTx(e){const t=await k.get("transactions",e);if(t.status!=="draft")throw new Error("Solo se pueden aprobar transacciones en estado Borrador.");return await k.update("transactions",e,{status:"active"}),await this.logAudit("APPROVE","transactions",e,`Transacción ${t.number} aprobada`),t},async revertTxToDraft(e){const t=await k.get("transactions",e);if(t.status!=="active")throw new Error("Solo se pueden revertir transacciones Activas a Borrador.");return await k.update("transactions",e,{status:"draft"}),await this.logAudit("REVERT_DRAFT","transactions",e,`Transacción ${t.number} revertida a Borrador`),t},async updateTransaction(e,t,a){await k.update("transactions",e,t);const o=k.escapeFilterValue(e),s=await k.listAll("tx_lines",{filter:`tx_id="${o}"`});for(const n of s)await k.delete("tx_lines",n.id);for(const n of a)await k.create("tx_lines",{tx_id:e,...n});await this.logAudit("UPDATE","transactions",e,"Modificación desde consulta de transacciones")},async checkTxDependencies(e){const t=k.escapeFilterValue(e),a=[],o=[],s=await k.list("einvoice_docs",{filter:`tx_id="${t}" && (status="enviada" || status="aceptada")`,perPage:1});if(s.totalItems>0){const l=s.items[0].status==="aceptada"?"Aceptada por DIAN":"Enviada a DIAN";a.push(`Este comprobante tiene un documento electrónico DIAN con estado "${l}". Los documentos fiscales ya transmitidos son inalterables por normativa tributaria.`)}const n=await k.list("payroll_periods",{filter:`tx_id="${t}"`,perPage:1});if(n.totalItems>0){const c=n.items[0],l={draft:"Borrador",approved:"Aprobado",paid:"Pagado"}[c.status]||c.status;o.push(`Este comprobante es el asiento de nómina del período "${c.name}" (${l}). Si lo modificas, el asiento contable de nómina quedará desincronizado con las liquidaciones.`)}const i=await k.listAll("tx_lines",{filter:`tx_id="${t}"`});let r=0;if(i.length>0){const c=i.map(u=>`tx_line_id="${k.escapeFilterValue(u.id)}"`).join(" || ");r=(await k.list("bank_movements",{filter:`(${c}) && reconciled=true`,perPage:1})).totalItems}return r>0&&o.push(`Tiene ${r} movimiento(s) bancario(s) conciliado(s). Revisa la conciliación bancaria después de modificar.`),{blocks:a,warnings:o}},async getProducts(e={}){const{activeOnly:t=!0,query:a="",type:o=""}=e;let s=t?"active=true":"";if(o){const n=k.escapeFilterValue(o);s+=(s?" && ":"")+`type="${n}"`}if(a){const n=k.escapeFilterValue(a);s+=(s?" && ":"")+`(name~"${n}" || code~"${n}")`}return k.listAll("products",{filter:s,sort:"code",expand:"income_account_id,cost_account_id,inventory_account_id"})},async getDashboardKpis(){const[e,t,a]=await Promise.all([k.list("transactions",{perPage:1}),k.list("third_parties",{filter:"active=true",perPage:1}),k.list("accounts",{filter:"active=true",perPage:1})]);return{totalTx:e.totalItems,totalTp:t.totalItems,totalAc:a.totalItems}},async getWarehouses(e=!0){const t=e?"active=true":"";return k.listAll("warehouses",{filter:t,sort:"code"})},async getInventoryStock(e={}){const{warehouseId:t="",productId:a=""}=e;let o="";return t&&(o+=`warehouse_id="${k.escapeFilterValue(t)}"`),a&&(o+=(o?" && ":"")+`product_id="${k.escapeFilterValue(a)}"`),k.listAll("inventory_stock",{filter:o,sort:"product_id",expand:"product_id,warehouse_id"})},async upsertStock(e,t,a,o=null,s=""){const n=k.escapeFilterValue(e),i=k.escapeFilterValue(t),r=await k.list("inventory_stock",{filter:`product_id="${n}" && warehouse_id="${i}"`,perPage:1}),c=s||new Date().toISOString().slice(0,10);if(r.items.length){const l=r.items[0],u=Math.max(0,(l.qty_on_hand??0)+a),b=o!==null?o:l.avg_cost??0;await k.update("inventory_stock",l.id,{qty_on_hand:u,avg_cost:b,last_mov_date:c})}else await k.create("inventory_stock",{product_id:e,warehouse_id:t,qty_on_hand:Math.max(0,a),avg_cost:o??0,last_mov_date:c});o!==null&&o>0&&await k.update("products",e,{cost_price:o})},async getInventoryMovements(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return k.list("inventory_movements",{page:t,perPage:a,filter:o,sort:s,expand:"warehouse_id,dest_warehouse_id,third_party_id"})},async getInventoryMovementLines(e){const t=k.escapeFilterValue(e);return k.listAll("inventory_movement_lines",{filter:`movement_id="${t}"`,sort:"line_order",expand:"product_id"})},async applyInventoryMovement(e){const t=await k.get("inventory_movements",e,{expand:"warehouse_id,dest_warehouse_id"});if(t.status==="applied")throw new Error("El movimiento ya fue aplicado.");if(t.status==="voided")throw new Error("El movimiento está anulado.");const a=await this.getInventoryMovementLines(e);if(!a.length)throw new Error("El movimiento no tiene líneas.");const o=t.date||new Date().toISOString().slice(0,10),s=t.mov_type==="ENTRADA"||t.mov_type==="AJUSTE_POSITIVO",n=t.mov_type==="SALIDA"||t.mov_type==="AJUSTE_NEGATIVO",i=t.mov_type==="TRASLADO";for(const r of a){const c=s?r.qty:n?-r.qty:0;i?(await this.upsertStock(r.product_id,t.warehouse_id,-r.qty,null,o),await this.upsertStock(r.product_id,t.dest_warehouse_id,r.qty,null,o)):await this.upsertStock(r.product_id,t.warehouse_id,c,r.unit_cost??null,o)}return await k.update("inventory_movements",e,{status:"applied"}),await this.logAudit("APPLY","InventoryMovement",e,`${t.mov_type} — ${t.number}`),t},async voidInventoryMovement(e,t=""){const a=await k.get("inventory_movements",e);if(a.status!=="applied")throw new Error("Solo se pueden anular movimientos ya aplicados.");const o=await this.getInventoryMovementLines(e),s=new Date().toISOString().slice(0,10),n=a.mov_type==="ENTRADA"||a.mov_type==="AJUSTE_POSITIVO",i=a.mov_type==="SALIDA"||a.mov_type==="AJUSTE_NEGATIVO",r=a.mov_type==="TRASLADO";for(const c of o){const l=n?-c.qty:i?c.qty:0;r?(await this.upsertStock(c.product_id,a.warehouse_id,c.qty,null,s),await this.upsertStock(c.product_id,a.dest_warehouse_id,-c.qty,null,s)):await this.upsertStock(c.product_id,a.warehouse_id,l,null,s)}await k.update("inventory_movements",e,{status:"voided"}),await this.logAudit("VOID","InventoryMovement",e,`Anulación ${a.mov_type} — ${a.number}${t?` | Motivo: ${t}`:""}`)},async getPurchaseInvoices(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return k.list("purchase_invoices",{page:t,perPage:a,filter:o,sort:s,expand:"supplier_id,warehouse_id,tx_type_id"})},async getPurchaseInvoiceLines(e){const t=k.escapeFilterValue(e);return k.listAll("purchase_invoice_lines",{filter:`invoice_id="${t}"`,sort:"line_order",expand:"product_id,account_id"})},async createPurchaseInvoice(e,t){const a=String((e==null?void 0:e.tx_type_id)||"").trim(),o=String((e==null?void 0:e.tx_number)||"").trim();if(!a)throw new Error("Debes seleccionar el tipo de comprobante contable en la compra.");if(!o)throw new Error("Debes definir la numeración del comprobante contable en la compra.");let s=0,n=0,i=0;for(const u of t)s+=u.subtotal||0,n+=u.iva_amount||0,i+=u.ret_amount||0;const r=s+n-i,c=await k.create("purchase_invoices",{...e,subtotal:s,iva_total:n,total:r,ret_total:i,payable_total:r,status:"draft"});(!c.tx_type_id||!c.tx_number)&&await k.update("purchase_invoices",c.id,{tx_type_id:a,tx_number:o});const l=await k.get("purchase_invoices",c.id);if(!l.tx_type_id||!l.tx_number)throw new Error("No se pudo persistir el comprobante contable de la compra. Reinicia PocketBase para aplicar migraciones y vuelve a intentar.");for(let u=0;u<t.length;u++)await k.create("purchase_invoice_lines",{invoice_id:c.id,line_order:u+1,...t[u]});return await this.logAudit("CREATE","PurchaseInvoice",c.id,`Factura compra ${c.number}`),l},async postPurchaseInvoice(e){var O,M,B,j,Y,W,K;const t=await k.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id,tx_type_id"});if(t.status==="posted")throw new Error("La factura ya fue contabilizada.");if(t.status==="voided")throw new Error("La factura está anulada.");const a=await this.getPurchaseInvoiceLines(e);if(!a.length)throw new Error("La factura no tiene líneas.");let o={};try{const H=await this.getSetting("purchase_config_v1");o=H?JSON.parse(H):{}}catch{o={}}const s=(o==null?void 0:o.accounting)||{},n=(s==null?void 0:s.accounts)||{},i=Array.isArray(s==null?void 0:s.withholding_rules)?s.withholding_rules:[],r=String(n.payable_code||"220505").trim(),c=String(n.expense_fallback_code||"5135").trim(),l=n.iva_by_rate&&typeof n.iva_by_rate=="object"?n.iva_by_rate:{},u={},b={},m=async H=>{const w=String(H||"").trim();if(!w)throw new Error("Cuenta contable inválida en la compra.");return u[w]||(u[w]=await k.get("accounts",w)),u[w]},p=async H=>{if(!String(H||"").trim())throw new Error("Hay una cuenta sin código en la configuración de compras.");const w=String(H).trim();if(b[w])return b[w];const P=k.escapeFilterValue(w),V=await k.list("accounts",{filter:`code="${P}"`,perPage:1});if(!V.items.length)throw new Error(`Cuenta ${w} no encontrada en el plan de cuentas.`);return b[w]=V.items[0],u[V.items[0].id]=V.items[0],V.items[0]},f=async({accountId:H,thirdPartyId:w=null,debit:P=0,credit:V=0,description:U="",crossDocRef:q=""})=>{const J=await m(H),te={account_id:J.id,third_party_id:w,debit:P,credit:V,description:U,line_order:g.length+1};return J.maneja_cruce&&String(q||"").trim()&&(te.cross_doc_ref=String(q||"").trim()),te},d=await p(r),y=await p(c),v={},g=[],h=[],_={},A={};for(const H of a){const w=(O=H.expand)==null?void 0:O.product_id;let P;if(w){if(P=w.type==="BIEN"?w.inventory_account_id:w.cost_account_id||y.id,w.type==="BIEN"&&!P)throw new Error(`El producto ${w.code||""} ${w.name||""} no tiene cuenta de inventario asignada.`.trim())}else{if(!H.account_id)throw new Error(`Línea sin cuenta contable: "${H.description||"?"}"`);P=H.account_id}g.push(await f({accountId:P,thirdPartyId:t.supplier_id,debit:H.subtotal||0,credit:0,description:H.description||((B=(M=t.expand)==null?void 0:M.supplier_id)==null?void 0:B.name)||"",crossDocRef:t.supplier_ref||""})),(w==null?void 0:w.type)==="BIEN"&&h.push({product_id:H.product_id,qty:H.qty,unit_cost:H.unit_price,notes:H.description});const V=String(Number(H.iva_rate||0)),U=Number(H.iva_amount||0);U>0&&(_[V]=(_[V]||0)+U);let q=Number(H.ret_amount||0),J=String(H.ret_account_code||"").trim();if(q<=0&&H.ret_rule_id){const te=i.find(R=>String(R.id||"")===String(H.ret_rule_id||""));if(te){const R=String(H.ret_base_type||te.base_type||"SUBTOTAL").toUpperCase(),D=Number(te.min_base||0)||0,z=Number(H.subtotal||0),G=Number(H.iva_amount||0),ee=Number(H.total||z+G),X=R==="IVA"?G:R==="TOTAL"?ee:z,ie=Number(H.ret_rate||te.rate||0)||0;X>=D&&ie>0&&(q=X*ie/100,J||(J=String(te.account_code||"").trim()))}}if(q>0){if(!J)throw new Error(`La línea "${H.description||"?"}" tiene retención sin cuenta contable configurada.`);A[J]=(A[J]||0)+q}}{const H=a.reduce((U,q)=>U+Number(q.subtotal||0),0),w=a.reduce((U,q)=>U+Number(q.iva_amount||0),0),P=H+w,V=[{id:String(t.ret_rule_renta_id||"").trim(),kind:"renta"},{id:String(t.ret_rule_ica_id||"").trim(),kind:"ica"},{id:String(t.ret_rule_iva_id||"").trim(),kind:"iva"}];for(const{id:U,kind:q}of V){if(!U)continue;const J=i.find(ee=>String(ee.id||"")===U);if(!J)continue;const te=Number(J.min_base||0)||0;let R;if(q==="iva")R=w;else{const ee=String(J.base_type||"SUBTOTAL").toUpperCase();R=ee==="IVA"?w:ee==="TOTAL"?P:H}if(R<=0||R<te)continue;const D=Number(J.rate||0)||0;if(D<=0)continue;const z=R*D/100,G=String(J.account_code||"").trim();if(!G)throw new Error(`La regla de retención "${J.concept}" no tiene cuenta contable configurada.`);A[G]=(A[G]||0)+z}}for(const H of Object.keys(_)){const w=Number(_[H]||0);if(w<=0)continue;let P=String(l[H]||"").trim();if(!P&&Number(H)===19&&(P="233502"),!P)throw new Error(`No hay cuenta IVA configurada para la tarifa ${H}%. Ajusta el engranaje de Compras.`);v[P]||(v[P]=await p(P)),g.push(await f({accountId:v[P].id,thirdPartyId:null,debit:w,credit:0,description:`IVA ${H}% compra ${t.number}`,crossDocRef:t.supplier_ref||""}))}let I=0;for(const H of Object.keys(A)){const w=Number(A[H]||0);w<=0||(I+=w,v[H]||(v[H]=await p(H)),g.push(await f({accountId:v[H].id,thirdPartyId:t.supplier_id,debit:0,credit:w,description:`Retenciones compra ${t.number}`,crossDocRef:t.supplier_ref||""})))}const F=Number(t.subtotal||0)+Number(t.iva_total||0),S=Number(t.payable_total||0),x=Number(t.total||0),T=S>0?S:x>0&&Math.abs(x-F)>.01?x:F-I;g.push(await f({accountId:d.id,thirdPartyId:t.supplier_id,debit:0,credit:T,description:`${t.supplier_ref?`Ref: ${t.supplier_ref} — `:""}${((Y=(j=t.expand)==null?void 0:j.supplier_id)==null?void 0:Y.name)||""}`,crossDocRef:t.supplier_ref||""}));let E=String(t.tx_type_id||"").trim(),C=String(t.tx_number||"").trim();if(!E){const H=[],w=C.split("-")[0]||"",P=String(t.number||"").split("-")[0]||"";w&&H.push(w),P&&P!==w&&H.push(P);for(const V of H){const U=k.escapeFilterValue(V),q=await k.list("transaction_types",{filter:`active=true && (prefix="${U}" || code="${U}")`,perPage:1});if(q.items.length){E=q.items[0].id;break}}}if(!E)throw new Error("La factura no tiene tipo de comprobante contable. Edítala y selecciónalo.");C||(C="AUTO"),(!t.tx_type_id||!t.tx_number)&&await k.update("purchase_invoices",e,{tx_type_id:E,tx_number:C});const N=await this.createTransaction({tx_type_id:E,number:C,date:t.date,description:`Compra ${t.number} — ${((K=(W=t.expand)==null?void 0:W.supplier_id)==null?void 0:K.name)||""}`,third_party_id:t.supplier_id,payment_days:0,cross_enabled:!1,status:"draft"},g);let L=null;if(h.length&&t.warehouse_id){const H=t.date||new Date().toISOString().slice(0,10),w=String(Date.now()).slice(-4),P=`ENT-${H.replaceAll("-","")}-${w}`,V=await k.create("inventory_movements",{number:P,mov_type:"ENTRADA",date:t.date,warehouse_id:t.warehouse_id,third_party_id:t.supplier_id,notes:`Compra ${t.number}`,status:"draft",tx_id:N.id});for(let U=0;U<h.length;U++)await k.create("inventory_movement_lines",{movement_id:V.id,line_order:U+1,...h[U]});await this.applyInventoryMovement(V.id),L=V.id}return await k.update("purchase_invoices",e,{status:"posted",tx_id:N.id,inv_movement_id:L,ret_total:I,payable_total:T}),await this.logAudit("POST","PurchaseInvoice",e,`Contabilizada ${t.number} → TX ${N.number}`),{inv:t,tx:N}},async getPurchaseMutationBlocks(e){var s,n,i;const t=await k.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id"}),a=[],o={crossRefs:[],downstreamTx:[],stockShortages:[]};if(t.tx_id){const r=await this.checkTxDependencies(t.tx_id);a.push(...r.blocks);const c=await this.getTxLines(t.tx_id).catch(()=>[]),l=new Set;if(String(t.supplier_ref||"").trim()&&l.add(String(t.supplier_ref||"").trim()),c.forEach(u=>{const b=String(u.cross_doc_ref||"").trim();b&&l.add(b)}),o.crossRefs=[...l],t.supplier_id&&l.size)for(const u of l){const m=(await k.listAll("tx_lines",{filter:`third_party_id="${k.escapeFilterValue(t.supplier_id)}" && cross_doc_ref="${k.escapeFilterValue(u)}"`,expand:"account_id,tx_id",sort:"-id"})).filter(p=>{var f,d;return!p||p.tx_id===t.tx_id||(((d=(f=p.expand)==null?void 0:f.tx_id)==null?void 0:d.status)||"")==="voided"?!1:String(p.cross_doc_ref||"").trim()===u});m.length&&o.downstreamTx.push(...m.map(p=>{var f,d,y,v,g,h;return{ref:u,txNumber:((d=(f=p.expand)==null?void 0:f.tx_id)==null?void 0:d.number)||p.tx_id,txDate:((v=(y=p.expand)==null?void 0:y.tx_id)==null?void 0:v.date)||"",account:((h=(g=p.expand)==null?void 0:g.account_id)==null?void 0:h.code)||p.account_id,amount:Number(p.debit||0)||Number(p.credit||0)||0}}))}if(o.downstreamTx.length){const u=o.downstreamTx.slice(0,3).map(b=>`${b.txNumber}${b.txDate?` (${b.txDate})`:""}`).join(", ");a.push(`La compra ya tiene pagos o cruces posteriores sobre el documento ${o.crossRefs.join(", ")}. Transacciones detectadas: ${u}${o.downstreamTx.length>3?"…":""}.`)}}if(t.inv_movement_id){const r=await k.get("inventory_movements",t.inv_movement_id).catch(()=>null),c=(r==null?void 0:r.warehouse_id)||t.warehouse_id||"",l=await this.getInventoryMovementLines(t.inv_movement_id).catch(()=>[]);for(const u of l){const b=c?await this.getInventoryStock({warehouseId:c,productId:u.product_id}).catch(()=>[]):[],m=Number(((s=b[0])==null?void 0:s.qty_on_hand)||0),p=Number(u.qty||0);m+1e-4<p&&o.stockShortages.push({product:((i=(n=u.expand)==null?void 0:n.product_id)==null?void 0:i.name)||u.product_id,requiredQty:p,qtyOnHand:m})}if(o.stockShortages.length){const u=o.stockShortages.slice(0,3).map(b=>`${b.product} (disp. ${fmtN(b.qtyOnHand)} / compra ${fmtN(b.requiredQty)})`).join(", ");a.push(`La entrada de inventario ya tuvo efectos posteriores y no se puede revertir sin descuadrar stock. Productos afectados: ${u}${o.stockShortages.length>3?"…":""}.`)}}return{inv:t,blocks:a,details:o}},async rollbackPurchasePosting(e,t="anular",a=""){const o=await k.get("purchase_invoices",e);if(o.status!=="posted")return{inv:o,txVoided:!1,movementVoided:!1};if(typeof isPeriodClosed=="function"&&await isPeriodClosed(o.date))throw new Error(`El período ${(o.date||"").slice(0,7)} está cerrado. No se puede ${t} la compra.`);const s=await this.getPurchaseMutationBlocks(e);if(s.blocks.length)throw new Error(s.blocks[0]);if(o.tx_id){const n=await k.get("transactions",o.tx_id).catch(()=>null);n&&n.status!=="voided"&&await this.voidTransaction(o.tx_id,`${t} compra ${o.number}${a?` | Motivo: ${a}`:""}`)}if(o.inv_movement_id){const n=await k.get("inventory_movements",o.inv_movement_id).catch(()=>null);n&&n.status==="applied"?await this.voidInventoryMovement(o.inv_movement_id,a):n&&n.status!=="voided"&&(await k.update("inventory_movements",o.inv_movement_id,{status:"voided"}),await this.logAudit("VOID","InventoryMovement",o.inv_movement_id,`Anulación ${n.mov_type||"MOV"} — ${n.number||""}${a?` | Motivo: ${a}`:""}`.trim()))}return{inv:o,txVoided:!!o.tx_id,movementVoided:!!o.inv_movement_id}},async reopenPurchaseInvoice(e,t=""){const a=String(t||"").trim();if(!a)throw new Error("Debes indicar el motivo de reapertura.");const s=(await this.rollbackPurchasePosting(e,"reabrir",a)).inv;if(s.status==="voided")throw new Error("La factura está anulada y no se puede reabrir.");if(s.status==="draft")throw new Error("La factura ya está en borrador.");return await k.update("purchase_invoices",e,{status:"draft",tx_id:null,inv_movement_id:null}),await this.logAudit("REOPEN","PurchaseInvoice",e,`Reabierta ${s.number} para corrección | Motivo: ${a}`),k.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id,tx_type_id"})},async voidPurchaseInvoice(e,t=""){const a=String(t||"").trim();if(!a)throw new Error("Debes indicar el motivo de anulación.");const o=await k.get("purchase_invoices",e);if(o.status==="voided")throw new Error("La factura ya está anulada.");o.status==="posted"&&await this.rollbackPurchasePosting(e,"anular",a),await k.update("purchase_invoices",e,{status:"voided"}),await this.logAudit("VOID","PurchaseInvoice",e,`Anulada ${o.number} | Motivo: ${a}`)},async getPhProperties(e=!0){const t=e?"active=true":"";return k.listAll("ph_properties",{filter:t,sort:"code",expand:"owner_id,occupant_id"})},async getPhCommonAreas(e=!0){const t=e?"active=true":"";return k.listAll("ph_common_areas",{filter:t,sort:"code"})},async getPhBillingConcepts(e=!0){const t=e?"active=true":"";return k.listAll("ph_billing_concepts",{filter:t,sort:"code",expand:"account_id"})},async getPhInvoices(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return k.list("ph_invoices",{page:t,perPage:a,filter:o,sort:s,expand:"property_id,property_id.owner_id"})},async getPhInvoiceLines(e){const t=k.escapeFilterValue(e);return k.listAll("ph_invoice_lines",{filter:`invoice_id="${t}"`,sort:"line_order",expand:"concept_id,concept_id.account_id"})},async generatePhInvoices(e,t=""){const a=k.escapeFilterValue(e),[o,s,n]=await Promise.all([this.getPhProperties(!0),this.getPhBillingConcepts(!0),this.getSetting("ph_config_v1")]);if(!o.length)throw new Error("No hay unidades activas registradas.");if(!s.length)throw new Error("No hay conceptos de facturación activos.");let i={};try{i=n?JSON.parse(n):{}}catch{i={}}const r=Number((i==null?void 0:i.late_fee_rate)||0),c=Array.isArray(i==null?void 0:i.late_fee_concepts)?i.late_fee_concepts.map(h=>String(h||"")).filter(Boolean):[],l=new Set(c),u=h=>String(h||"").trim().toLowerCase(),b=new Set((s||[]).filter(h=>l.has(String(h.id||""))).map(h=>u(h.name)).filter(Boolean)),m=`period="${a}"`,p=await k.listAll("ph_invoices",{filter:m,perPage:200}),f=new Set(p.map(h=>h.property_id)),d=o.filter(h=>!f.has(h.id));if(!d.length)throw new Error(`Todas las unidades ya tienen factura para el período ${e}.`);const y=e+"-01",v=t||e+"-10";let g=0;for(const h of d){const _=`${e}-01`,A=new Date(`${_}T00:00:00`),I=[];let F=0,S=1;for(const C of s){let N=Number(C.amount||0);C.applies_coef&&h.coef_participacion>0&&(N=N*(h.coef_participacion/100)),!(N<=0)&&(F+=N,I.push({concept_id:C.id,description:C.name,amount:Math.round(N),line_order:S++}))}if(r>0&&l.size){const C=k.escapeFilterValue(h.id),N=await k.listAll("ph_invoices",{filter:`property_id="${C}" && period!="${a}" && status!="paid" && status!="voided"`,perPage:200});let L=0;for(const O of N){if(!(O!=null&&O.due_date))continue;const M=new Date(`${O.due_date}T00:00:00`);if(Number.isNaN(M.getTime())||M.getTime()>=A.getTime())continue;const B=k.escapeFilterValue(O.id),j=await k.listAll("ph_invoice_lines",{filter:`invoice_id="${B}"`,perPage:200});for(const Y of j){const W=String((Y==null?void 0:Y.concept_id)||""),K=u(Y==null?void 0:Y.description),H=W&&l.has(W),w=!W&&b.has(K);if(!H&&!w)continue;const P=Number(Y.amount||0);P<=0||(L+=P*(r/100))}}if(L>0){const O=Math.round(L);F+=O,I.push({concept_id:null,description:`Interés de mora a ${_}`,amount:O,line_order:S++})}}if(!I.length)continue;const x=String(g+1).padStart(6,"0"),T=`CF-${e.replace("-","")}-${x}`,E=await k.create("ph_invoices",{number:T,period:e,property_id:h.id,date:y,due_date:v,subtotal:Math.round(F),total:Math.round(F),status:"draft",notes:""});for(const C of I)await k.create("ph_invoice_lines",{invoice_id:E.id,...C});g++}return await this.logAudit("GENERATE","PhInvoices",e,`Generadas ${g} facturas PH para ${e}`),g},async getPhPortfolioByConcept(e=""){var n,i;const t=String(e||new Date().toISOString().slice(0,10)).trim(),a=k.escapeFilterValue(t),o=await k.listAll("ph_invoices",{filter:`status!="paid" && status!="voided" && date<="${a}"`,perPage:200,expand:"property_id"}),s=new Map;for(const r of o){const c=k.escapeFilterValue(r.id),l=await k.listAll("ph_invoice_lines",{filter:`invoice_id="${c}"`,perPage:200,expand:"concept_id"}),u=!!r.due_date&&String(r.due_date)<t;for(const b of l){const m=String(b.concept_id||"SIN_CONCEPTO"),p=((i=(n=b.expand)==null?void 0:n.concept_id)==null?void 0:i.name)||b.description||"Sin concepto",f=`${m}`;s.has(f)||s.set(f,{concept_id:m==="SIN_CONCEPTO"?null:m,concept_name:p,total:0,overdue:0,lines:0});const d=s.get(f),y=Number(b.amount||0);d.total+=y,d.lines+=1,u&&(d.overdue+=y)}}return Array.from(s.values()).sort((r,c)=>String(r.concept_name||"").localeCompare(String(c.concept_name||"")))},async postPhInvoicesByPeriod(e){const t=k.escapeFilterValue(e),a=await k.listAll("ph_invoices",{filter:`period="${t}"`,perPage:200});if(!a.length)throw new Error(`No hay facturas para el período ${e}.`);let o=0,s=0,n=0;const i=[];for(const r of a){if(r.status!=="draft"){s++;continue}try{await this.postPhInvoice(r.id),o++}catch(c){n++,i.push(`${r.number||r.id}: ${(c==null?void 0:c.message)||"Error"}`)}}return await this.logAudit("POST_PERIOD","PhInvoices",e,`Período ${e}: contabilizadas ${o}, omitidas ${s}, fallidas ${n}`),{period:e,total:a.length,posted:o,skipped:s,failed:n,failures:i}},async unpostPhInvoice(e){const t=await k.get("ph_invoices",e);if(t.status==="draft")throw new Error("La factura ya está en borrador.");if(t.status==="voided")throw new Error("La factura está anulada y no se puede descontabilizar.");let a="none";if(t.tx_id)try{await k.update("transactions",t.tx_id,{status:"draft"}),a="draft"}catch{await k.update("transactions",t.tx_id,{status:"voided"}),a="voided"}return await k.update("ph_invoices",e,{status:"draft",tx_id:null}),await this.logAudit("UNPOST","PhInvoice",e,`Descontabilizada ${t.number||e} | TX->${a}`),{invoiceId:e,txAction:a}},async unpostPhInvoicesByPeriod(e){const t=k.escapeFilterValue(e),a=await k.listAll("ph_invoices",{filter:`period="${t}"`,perPage:200});if(!a.length)throw new Error(`No hay facturas para el período ${e}.`);let o=0,s=0,n=0,i=0;for(const r of a){if(r.status==="draft"){s++;continue}if(r.status==="voided"){s++;continue}if(r.tx_id)try{await k.update("transactions",r.tx_id,{status:"draft"}),n++}catch{await k.update("transactions",r.tx_id,{status:"voided"}),i++}await k.update("ph_invoices",r.id,{status:"draft",tx_id:null}),o++}return await this.logAudit("UNPOST_PERIOD","PhInvoices",e,`Período ${e}: descontabilizadas ${o}, omitidas ${s}, TX->draft ${n}, TX->voided ${i}`),{period:e,total:a.length,reverted:o,skipped:s,txDraft:n,txVoided:i}},async deletePhInvoicesByPeriod(e){const t=k.escapeFilterValue(e),a=await k.listAll("ph_invoices",{filter:`period="${t}"`,perPage:200});if(!a.length)throw new Error(`No hay facturas para el período ${e}.`);let o=0,s=0,n=0;for(const i of a){if(i.tx_id)try{await k.delete("transactions",i.tx_id),s++}catch{await k.update("transactions",i.tx_id,{status:"voided"}),n++}await k.delete("ph_invoices",i.id),o++}return await this.logAudit("DELETE_PERIOD","PhInvoices",e,`Período ${e}: facturas eliminadas ${o}, TX eliminadas ${s}, TX anuladas ${n}`),{period:e,total:a.length,deleted:o,txDeleted:s,txVoided:n}},async postPhInvoice(e){var I,F,S,x;const t=await k.get("ph_invoices",e,{expand:"property_id,property_id.owner_id"});if(t.status==="posted")throw new Error("La factura ya fue contabilizada.");if(t.status==="voided")throw new Error("La factura está anulada.");const a=await this.getPhInvoiceLines(e);if(!a.length)throw new Error("La factura no tiene líneas.");let o={};try{const T=await this.getSetting("ph_config_v1");o=T?JSON.parse(T):{}}catch{o={}}const s=String(o.cxc_code||"130505").trim(),n=String(o.income_code||"413505").trim(),i=String(o.late_fee_income_code||n).trim(),r=String(t.number||"").trim(),c=await k.list("transaction_types",{filter:'code="CF" && active=true',perPage:1});if(!c.items.length)throw new Error("Tipo de transacción CF no encontrado. Reinicia PocketBase para aplicar la migración.");const l=c.items[0],u=(I=t.expand)==null?void 0:I.property_id,b=(u==null?void 0:u.owner_id)||null,m={},p={},f=async T=>{const E=String(T||"").trim();if(!E)throw new Error("Cuenta contable inválida.");return m[E]||(m[E]=await k.get("accounts",E)),m[E]},d=async T=>{const E=String(T||"").trim();if(!E)throw new Error("Código de cuenta inválido.");if(p[E])return p[E];const C=k.escapeFilterValue(E),N=await k.list("accounts",{filter:`code="${C}"`,perPage:1});if(!N.items.length)throw new Error(`Cuenta "${E}" no encontrada.`);const L=N.items[0];return p[E]=L,m[L.id]=L,L},y=await d(s),v=await d(n),g=async({accountId:T,debit:E=0,credit:C=0,description:N="",thirdPartyId:L=null,crossDocRef:O=""})=>{const M=await f(T),B={account_id:M.id,debit:Number(E||0),credit:Number(C||0),description:String(N||""),line_order:0};if(M.requires_third_party){const j=L||b||null;if(!j)throw new Error(`La cuenta ${M.code} - ${M.name} requiere tercero y la unidad no tiene propietario.`);B.third_party_id=j}else B.third_party_id=L||null;if(M.maneja_cruce){const j=String(O||r||"").trim();if(!j)throw new Error(`La cuenta ${M.code} - ${M.name} requiere documento de cruce.`);B.cross_doc_ref=j}return B},h=[];for(const T of a){const E=(F=T.expand)==null?void 0:F.concept_id;let C=(E==null?void 0:E.code)||"GEN";if(!E)if(/inter[eé]s de mora/i.test(String(T.description||"")))C="MORA";else{const O=String(T.description||"").match(/^\[([A-Z0-9]+)\]/);O&&(C=O[1])}const N=`${r}-${C}`;let L=v.id;T.account_code?L=(await d(T.account_code)).id:E!=null&&E.account_id?L=E.account_id:C==="MORA"&&(L=(await d(i)).id),h.push(await g({accountId:L,debit:0,credit:Number(T.amount||0),description:T.description,thirdPartyId:b||null,crossDocRef:N}))}for(const T of a){const E=(S=T.expand)==null?void 0:S.concept_id;let C=(E==null?void 0:E.code)||"GEN";if(!E)if(/inter[eé]s de mora/i.test(String(T.description||"")))C="MORA";else{const L=String(T.description||"").match(/^\[([A-Z0-9]+)\]/);L&&(C=L[1])}const N=`${r}-${C}`;h.unshift(await g({accountId:y.id,debit:Number(T.amount||0),credit:0,description:T.description,thirdPartyId:b||null,crossDocRef:N}))}h.forEach((T,E)=>{T.line_order=E+1});const _=((x=k.currentUser)==null?void 0:x.id)||"",A=await k.create("transactions",{tx_type_id:l.id,number:"AUTO",date:t.date,description:`Factura PH ${t.number} — ${(u==null?void 0:u.name)||t.property_id} — ${t.period}`,third_party_id:b||null,cross_enabled:h.some(T=>!!T.cross_doc_ref),status:"active",user_id:_||void 0});for(const T of h)await k.create("tx_lines",{tx_id:A.id,...T});return await k.update("ph_invoices",e,{status:"posted",tx_id:A.id}),await this.logAudit("POST","PhInvoice",e,`Contabilizada ${t.number} → TX ${A.number}`),k.get("ph_invoices",e,{expand:"property_id"})},async voidPhInvoice(e,t=""){const a=String(t||"").trim();if(!a)throw new Error("Debes indicar el motivo de anulación.");const o=await k.get("ph_invoices",e);if(o.status==="voided")throw new Error("La factura ya está anulada.");o.status==="posted"&&o.tx_id&&await k.update("transactions",o.tx_id,{status:"voided"}),await k.update("ph_invoices",e,{status:"voided",tx_id:null}),await this.logAudit("VOID","PhInvoice",e,`Anulada ${o.number} | Motivo: ${a}`)},async markPhInvoicePaid(e){const t=await k.get("ph_invoices",e);if(t.status!=="posted")throw new Error("Solo se pueden marcar como pagadas las facturas contabilizadas.");await k.update("ph_invoices",e,{status:"paid"}),await this.logAudit("PAID","PhInvoice",e,`Marcada como pagada ${t.number}`)},async getPhReservations(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-date"}=e;return k.list("ph_reservations",{page:t,perPage:a,filter:o,sort:s,expand:"area_id,property_id"})},async getPhPqrs(e={}){const{page:t=1,perPage:a=50,filter:o="",sort:s="-created"}=e;try{return await k.list("ph_pqrs",{page:t,perPage:a,filter:o,sort:s,expand:"property_id"})}catch{try{return await k.list("ph_pqrs",{page:t,perPage:a,filter:o,expand:"property_id"})}catch{return{items:[],totalItems:0,page:t,perPage:a}}}},async nextPhPqrNumber(){const e=new Date().toISOString().slice(0,10).replace(/-/g,""),a=((await k.list("ph_pqrs",{perPage:1})).totalItems||0)+1;return`PQR-${e}-${String(a).padStart(4,"0")}`},async addPhIndividualLinesToInvoice(e,t){if((await k.get("ph_invoices",e)).status!=="draft")throw new Error("Solo se pueden modificar facturas en estado Borrador.");const o=await this.getPhInvoiceLines(e);let s=Math.max(0,...o.map(r=>Number(r.line_order||0)))+1;for(const r of t)await k.create("ph_invoice_lines",{invoice_id:e,concept_id:null,description:String(r.description||""),amount:Math.round(Number(r.amount||0)),account_code:String(r.account_code||""),line_order:s++});const i=(await this.getPhInvoiceLines(e)).reduce((r,c)=>r+Number(c.amount||0),0);return await k.update("ph_invoices",e,{subtotal:i,total:i}),i},async updatePhDraftInvoiceLine(e,{description:t="",amount:a=0,account_code:o=""}={}){const s=await k.get("ph_invoice_lines",e),n=await k.get("ph_invoices",s.invoice_id);if(n.status!=="draft")throw new Error("Solo se pueden editar líneas de facturas en borrador.");await k.update("ph_invoice_lines",e,{description:String(t||"").trim(),amount:Math.round(Number(a||0)),account_code:String(o||"").trim()||null});const r=(await this.getPhInvoiceLines(n.id)).reduce((c,l)=>c+Number(l.amount||0),0);return await k.update("ph_invoices",n.id,{subtotal:r,total:r}),{invoiceId:n.id,total:r}},async deletePhDraftInvoiceLine(e){const t=await k.get("ph_invoice_lines",e),a=await k.get("ph_invoices",t.invoice_id);if(a.status!=="draft")throw new Error("Solo se pueden eliminar líneas de facturas en borrador.");await k.delete("ph_invoice_lines",e);const s=(await this.getPhInvoiceLines(a.id)).reduce((n,i)=>n+Number(i.amount||0),0);return await k.update("ph_invoices",a.id,{subtotal:s,total:s}),{invoiceId:a.id,total:s}},async getPhIndividualCharges(e={}){const{page:t=1,perPage:a=100,filter:o="",sort:s=""}=e,n={page:t,perPage:a,filter:o};s&&(n.sort=s);try{return await k.list("ph_individual_charges",n)}catch{try{return await k.list("ph_individual_charges",{page:t,perPage:a,filter:o})}catch{try{return await k.list("ph_individual_charges",{page:t,perPage:a})}catch{return{items:[],totalItems:0,page:t,perPage:a}}}}},calculateDaysOverdue(e,t=null){if(!e)return 0;const a=new Date(`${e}T00:00:00Z`);let o=null;t?o=new Date(`${t}T23:59:59Z`):o=new Date;const s=o.getTime()-a.getTime();return Math.floor(s/(1e3*60*60*24))},normalizePhCarteraConceptLabel(e){const t=String(e||"").trim();return t?/^inter[eé]s\s+de\s+mora\s+a\s+\d{4}-\d{2}-\d{2}$/i.test(t)?"Interés de mora":t:"Concepto"},async _getPhCarteraDataset(e,t="",a=""){const o=k.escapeFilterValue(e),s=k.escapeFilterValue(t),n=k.escapeFilterValue(a);let i='status!="voided"';e&&(i+=` && property_id="${o}"`),t&&(i+=` && period>="${s}"`),a&&(i+=` && period<="${n}"`);let r=[];try{r=(await k.list("ph_invoices",{filter:i,perPage:500,sort:"-date"})).items||[]}catch{try{r=(await k.list("ph_invoices",{filter:i,perPage:500})).items||[]}catch{r=[]}}let c=[];try{c=await this.getPhProperties(!1)}catch{c=[]}const l=new Map((c||[]).map(m=>[String(m.id),m]));let u=null;if(a){if(/^\d{4}-\d{2}-\d{2}$/.test(a))u=a;else if(/^\d{4}-\d{2}$/.test(a)){const[m,p]=a.split("-").map(Number),f=new Date(m,p,0).getDate();u=`${m}-${String(p).padStart(2,"0")}-${String(f).padStart(2,"0")}`}}const b=[];for(const m of r){const p=l.get(String(m.property_id))||null;let f=[];try{f=await this.getPhInvoiceLines(m.id)}catch{f=[]}for(const d of f){const y=Number(d.amount||0),v=this.calculateDaysOverdue(m.due_date,u),g=String(m.date||m.created||"").slice(0,10),h=String(m.due_date||"").slice(0,10),_=g?new Date(`${g}T00:00:00Z`):null,A=h?new Date(`${h}T00:00:00Z`):null,I=_&&A?Math.max(0,Math.floor((A.getTime()-_.getTime())/(1e3*60*60*24))):0;let F="por_vencer";m.status==="paid"?F="cancelado":m.status==="draft"?F="borrador":v>=0&&(F="vencido");const S=Math.max(0,v),x=d.description||d.account_code||"Concepto",T=this.normalizePhCarteraConceptLabel(x),E=d.concept_id?String(d.concept_id):String(T||d.account_code||"OTROS").toUpperCase();b.push({invoice:m,line:d,amount:y,diasMora:S,diasMoraRaw:v,plazoDias:I,fechaDoc:g,dueDate:h,estado:F,propertyId:String(m.property_id||""),propertyCode:String((p==null?void 0:p.code)||""),propertyName:String((p==null?void 0:p.name)||""),conceptoId:E,concepto:T})}}return{invoices:r,rows:b}},async getPhCarteraByUnit(e,t="",a=""){const{rows:o}=await this._getPhCarteraDataset(e,t,a),s={};for(const n of o)s[n.conceptoId]||(s[n.conceptoId]={conceptoId:n.conceptoId,concepto:n.concepto,totalVencido:0,totalPorVencer:0,totalCancelado:0,totalPendiente:0,diasMoraMax:0}),n.estado==="cancelado"?s[n.conceptoId].totalCancelado+=n.amount:n.estado==="vencido"?(s[n.conceptoId].totalVencido+=n.amount,s[n.conceptoId].totalPendiente+=n.amount,s[n.conceptoId].diasMoraMax=Math.max(s[n.conceptoId].diasMoraMax,n.diasMora)):(s[n.conceptoId].totalPorVencer+=n.amount,s[n.conceptoId].totalPendiente+=n.amount);return Object.values(s).sort((n,i)=>String(n.concepto).localeCompare(String(i.concepto),"es"))},async getPhCarteraOpenParties(e,t="",a="",o={}){const{rows:s}=await this._getPhCarteraDataset(e,t,a),n=String(o.conceptoId||"").trim(),i=String(o.estado||"all").trim();return s.filter(c=>!n||String(c.conceptoId)===n).filter(c=>i==="all"||c.estado===i).map(c=>({invoiceId:c.invoice.id,invoiceNumber:c.invoice.number,periodo:c.invoice.period,propertyId:c.propertyId,propertyCode:c.propertyCode,propertyName:c.propertyName,concepto:c.concepto,conceptoId:c.conceptoId,amount:c.amount,fechaDoc:c.fechaDoc,plazoDias:c.plazoDias,dueDate:c.dueDate,diasMora:c.diasMora,estado:c.estado})).sort((c,l)=>{const u=String(c.propertyCode||"").localeCompare(String(l.propertyCode||""));if(u!==0)return u;const b=String(c.periodo||"").localeCompare(String(l.periodo||""));return b!==0?b:String(c.invoiceNumber||"").localeCompare(String(l.invoiceNumber||""))})},async getPhCarteraIntegrity(e,t="",a=""){const{invoices:o,rows:s}=await this._getPhCarteraDataset(e,t,a),n={invoices:o.length,lines:s.length,totalFacturas:0,totalLineas:0,totalPendiente:0,totalCancelado:0,diferenciaGlobal:0};for(const c of o)n.totalFacturas+=Number(c.total||0);for(const c of s)n.totalLineas+=Number(c.amount||0),c.estado==="cancelado"?n.totalCancelado+=Number(c.amount||0):n.totalPendiente+=Number(c.amount||0);n.diferenciaGlobal=Math.round((n.totalFacturas-n.totalLineas)*100)/100;const i={};for(const c of s){const l=c.invoice.id;i[l]||(i[l]={invoiceId:l,number:c.invoice.number,period:c.invoice.period,status:c.invoice.status,totalFactura:Number(c.invoice.total||0),totalLineas:0,diferencia:0}),i[l].totalLineas+=Number(c.amount||0)}const r=Object.values(i).map(c=>(c.diferencia=Math.round((c.totalFactura-c.totalLineas)*100)/100,c)).filter(c=>Math.abs(c.diferencia)>1).sort((c,l)=>Math.abs(l.diferencia)-Math.abs(c.diferencia));return{totals:n,mismatches:r,isBalanced:Math.abs(n.diferenciaGlobal)<=1&&r.length===0}}};window.pb=k;window.API=qr;window.PB_URL=je;const Us={admin:{canWrite:!0,canDelete:!0,canManageUsers:!0,canViewAudit:!0,canExport:!0,canApprove:!0},contador:{canWrite:!0,canDelete:!1,canManageUsers:!1,canViewAudit:!1,canExport:!0,canApprove:!0},auxiliar:{canWrite:!0,canDelete:!1,canManageUsers:!1,canViewAudit:!1,canExport:!1,canApprove:!1},auditor:{canWrite:!1,canDelete:!1,canManageUsers:!1,canViewAudit:!0,canExport:!0,canApprove:!1},viewer:{canWrite:!1,canDelete:!1,canManageUsers:!1,canViewAudit:!1,canExport:!1,canApprove:!1}};function Xa(e){var a,o;const t=((a=pb.currentUser)==null?void 0:a.role)??"viewer";return!!((o=Us[t])!=null&&o[e])}function Wr(...e){var a;const t=((a=pb.currentUser)==null?void 0:a.role)??"viewer";return e.includes(t)}async function Yr(){var s;const e=getInputVal("login-email");getInputVal("login-pass");const t=((s=$("#login-pass"))==null?void 0:s.value)??"",a=$("#login-error");if(a.classList.add("hidden"),!e||!t){a.textContent="Ingresa correo y contraseña",a.classList.remove("hidden");return}const o=$("#btn-login");o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Ingresando...';try{if(await pb.authWithPassword(e,t),!pb.currentUser.active){pb.logout(),a.textContent="Usuario inactivo. Contacta al administrador.",a.classList.remove("hidden");return}Vs()}catch(n){a.textContent=n.status===400?"Correo o contraseña incorrectos.":`Error: ${n.message}`,a.classList.remove("hidden")}finally{o.disabled=!1,o.innerHTML='<i class="fas fa-arrow-right-to-bracket"></i> Ingresar'}}async function Jr(){pb.logout(),Fo()}function Fo(){var t;$$(".screen").forEach(a=>a.classList.remove("active"));const e=$("#screen-login");e.style.display="",e.classList.add("active"),setInputVal("login-email",""),setInputVal("login-pass",""),$("#login-pass")&&($("#login-pass").value=""),(t=$("#login-error"))==null||t.classList.add("hidden"),$("#login-server-url").textContent=window.location.host}async function Vs(){const e=pb.currentUser;if(!e){Fo();return}$("#sidebar-username").textContent=e.full_name||e.email,$("#sidebar-role").textContent=roleLabel(e.role??"viewer"),$("#sidebar-avatar").textContent=(e.full_name||e.email).charAt(0).toUpperCase(),$("#nav-auditoria")&&($("#nav-auditoria").style.display=Xa("canViewAudit")?"":"none"),$("#nav-usuarios")&&($("#nav-usuarios").style.display=Xa("canManageUsers")?"":"none");const t=await API.getSetting("company_name");$("#topbar-company").textContent=t,$("#topbar-date").textContent=new Date().toLocaleDateString("es-CO",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),$$(".screen").forEach(a=>{a.classList.remove("active"),a.style.display=""}),$("#screen-app").style.display="flex",$("#screen-app").classList.add("active"),navigate("dashboard")}function Kr(){var a;const e=$("#login-pass"),t=(a=$("#btn-toggle-pass"))==null?void 0:a.querySelector("i");e&&(e.type==="password"?(e.type="text",t&&(t.className="fas fa-eye-slash")):(e.type="password",t&&(t.className="fas fa-eye")))}let ha=null;function Qr(){ha&&clearInterval(ha),ha=setInterval(async()=>{const e=await pb.ping(),t=$("#conn-indicator");if(!t)return;const a=t.querySelector("div"),o=t.querySelector("span");e?(a.className="w-2 h-2 rounded-full bg-green-400",o.textContent="En linea"):(a.className="w-2 h-2 rounded-full bg-red-400",o.textContent="Sin conexion")},15e3)}window.can=Xa;window.PERMISSIONS=Us;window.showLogin=Fo;window.requireRole=Wr;window.doLogout=Jr;window.startConnCheck=Qr;window.doLogin=Yr;window.showApp=Vs;window.togglePassVisibility=Kr;window._connCheckInterval=ha;const js={dashboard:"Dashboard","plan-cuentas":"Plan de Cuentas",terceros:"Terceros","tipos-tx":"Tipos de Transacción","nueva-tx":"Transacciones","consulta-tx":"Consulta de Transacciones",reportes:"Reportes",auditoria:"Auditoría",usuarios:"Usuarios",configuracion:"Configuración",utilidades:"Utilidades",conciliacion:"Conciliación Bancaria",copropiedades:"Copropiedades",nomina:"Nómina","facturacion-dian":"Facturación Electrónica DIAN",cierre:"Cierre Contable",productos:"Productos y Servicios",inventario:"Inventarios",compras:"Compras de Bienes y Servicios",tesoreria:"Tesorería"},eo={dashboard:()=>typeof renderDashboard=="function"&&renderDashboard($("#page-content")),"plan-cuentas":()=>typeof renderPlanCuentas=="function"&&renderPlanCuentas($("#page-content")),terceros:()=>typeof renderTerceros=="function"&&renderTerceros($("#page-content")),"tipos-tx":()=>typeof renderTiposTx=="function"&&renderTiposTx($("#page-content")),"nueva-tx":()=>Gs("consulta-tx"),"consulta-tx":()=>typeof renderConsultaTx=="function"&&renderConsultaTx($("#page-content")),reportes:()=>typeof renderReportes=="function"&&renderReportes($("#page-content")),auditoria:()=>typeof renderAuditoria=="function"&&renderAuditoria($("#page-content")),usuarios:()=>typeof renderUsuarios=="function"&&renderUsuarios($("#page-content")),configuracion:()=>typeof renderConfiguracion=="function"&&renderConfiguracion($("#page-content")),utilidades:()=>typeof renderUtilidades=="function"&&renderUtilidades($("#page-content")),conciliacion:()=>typeof renderConciliacion=="function"&&renderConciliacion($("#page-content")),nomina:()=>typeof renderNomina=="function"&&renderNomina($("#page-content")),"facturacion-dian":()=>typeof renderFacturacionDIAN=="function"&&renderFacturacionDIAN($("#page-content")),cierre:()=>typeof renderCierre=="function"&&renderCierre($("#page-content")),productos:()=>typeof renderProductos=="function"&&renderProductos($("#page-content")),inventario:()=>typeof renderInventario=="function"&&renderInventario($("#page-content")),compras:()=>typeof renderCompras=="function"&&renderCompras($("#page-content")),copropiedades:()=>typeof renderCopropiedades=="function"&&renderCopropiedades($("#page-content")),tesoreria:()=>typeof showTesoreriaScreen=="function"&&showTesoreriaScreen($("#page-content"))};let Hs="dashboard";function Gs(e){var a;if(eo[e]||(e="dashboard"),e==="usuarios"&&!can("canManageUsers")){showToast("No tienes permiso para acceder a esta sección","error");return}if(e==="auditoria"&&!can("canViewAudit")){showToast("No tienes permiso para acceder a esta sección","error");return}Hs=e,$$("#nav-menu .nav-item").forEach(o=>o.classList.toggle("active",o.dataset.page===e)),$("#page-title").textContent=js[e]??e,(a=$("#sidebar"))==null||a.classList.remove("open");const t=$("#page-content");t&&(t.scrollTop=0);try{eo[e]()}catch(o){console.error(`[Router] Error renderizando ${e}:`,o),t&&(t.innerHTML=`
        <div class="flex flex-col items-center justify-center" style="height:60vh;gap:16px">
          <i class="fas fa-circle-exclamation text-4xl" style="color:#EF4444"></i>
          <p class="font-semibold" style="color:#374151">Error al cargar el módulo</p>
          <p class="text-sm" style="color:#9CA3AF">${esc(o.message)}</p>
          <button class="btn btn-outline" onclick="navigate('${e}')"><i class="fas fa-rotate-right"></i> Reintentar</button>
        </div>`)}}window.PAGE_RENDERERS=eo;window.currentPage=Hs;window.PAGE_TITLES=js;window.navigate=Gs;async function Zr(e){e.innerHTML=`
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      ${["#EEF4FF","#FFF8F0","#ECFDF5","#FEF2F2"].map(t=>`
        <div class="rounded-2xl p-4 anim-slide-up" style="background:${t}">
          <div class="h-3 w-20 rounded mb-3" style="background:#E5E7EB;animation:pulse 1.5s ease infinite"></div>
          <div class="h-7 w-28 rounded" style="background:#E5E7EB;animation:pulse 1.5s ease infinite"></div>
        </div>`).join("")}
    </div>`;try{const[t,a]=await Promise.all([API.getDashboardKpis(),API.getAccountSaldos()]),o=await API.getAccounts();let s=0,n=0,i=0,r=0;for(const l of o){const u=a[l.id]??0,b=l.code.charAt(0);b==="1"?s+=u:b==="2"?n+=Math.abs(u):b==="4"?i+=Math.abs(u):(b==="5"||b==="6"||b==="7")&&(r+=u)}const c=await API.getTransactions({page:1,perPage:8});e.innerHTML=`
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
        <p class="text-xs mt-1" style="color:#059669;opacity:.7">Gastos: ${fmt(r)}</p>
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
            <tbody>${c.items.length?c.items.map(l=>{var u,b,m,p;return`
              <tr class="cursor-pointer" onclick="viewTransaction('${esc(l.id)}')">
                <td><span class="font-semibold" style="color:#E87D1E">${esc(((b=(u=l.expand)==null?void 0:u.tx_type_id)==null?void 0:b.prefix)??"")}-${esc(l.number)}</span></td>
                <td>${esc(l.date)}</td>
                <td class="max-w-xs truncate">${esc(l.description??"—")}</td>
                <td>${esc(((p=(m=l.expand)==null?void 0:m.third_party_id)==null?void 0:p.name)??"—")}</td>
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
          <p class="text-xl font-extrabold text-white">${fmt(i-r)}</p>
          <p class="text-xs mt-1" style="color:rgba(255,255,255,.5)">Ingresos − Gastos − Costos</p>
        </div>
      </div>
    </div>`}catch(t){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(t.message)}</div>`}}async function Xr(e){navigate("consulta-tx"),setTimeout(()=>{typeof seeTxDetail=="function"&&seeTxDetail(e)},120)}window.renderDashboard=Zr;window.viewTransaction=Xr;async function Po(e){var t,a,o,s;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando plan de cuentas...</div>';try{const[n,i]=await Promise.all([API.getAccounts(!1),pb.listAll("account_types",{sort:"code"})]),r=n.map(l=>{var m;const u=(m=l.expand)==null?void 0:m.account_type_id,b=l.active?'<span class="badge badge-green">Activa</span>':'<span class="badge badge-gray">Inactiva</span>';return`
      <tr data-code="${esc(l.code)}" data-name="${esc(l.name.toLowerCase())}">
        <td><span class="font-semibold" style="color:#1A4B8C">${esc(l.code)}</span></td>
        <td>${esc(l.name)}</td>
        <td>${esc((u==null?void 0:u.name)??"?")}</td>
        <td>${esc(l.parent_code||"?")}</td>
        <td>${l.requires_third_party?'<span class="badge badge-orange">Sí</span>':"No"}</td>
        <td>${b}</td>
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
            <tbody>${r||'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay cuentas registradas.</td></tr>'}</tbody>
          </table>
        </div>
      </div>`;const c=()=>{const l=getInputVal("acct-q").toLowerCase(),u=getSelectVal("acct-type"),b=getSelectVal("acct-status");$$("#accounts-table tbody tr").forEach(m=>{var _,A,I,F,S,x,T,E;const p=((A=(_=m.children[0])==null?void 0:_.textContent)==null?void 0:A.toLowerCase())||"",f=((F=(I=m.children[1])==null?void 0:I.textContent)==null?void 0:F.toLowerCase())||"",d=((S=m.children[2])==null?void 0:S.textContent)||"",y=(((x=m.children[5])==null?void 0:x.textContent)||"").includes("Activa"),v=!l||p.includes(l)||f.includes(l),g=!u||d.includes(((E=(T=$(`#acct-type option[value="${u}"]`))==null?void 0:T.textContent)==null?void 0:E.split(" - ")[0])||""),h=!b||(b==="active"?y:!y);m.style.display=v&&g&&h?"":"none"})};(t=$("#acct-q"))==null||t.addEventListener("input",debounce(c,200)),(a=$("#acct-type"))==null||a.addEventListener("change",c),(o=$("#acct-status"))==null||o.addEventListener("change",c),(s=$("#btn-new-account"))==null||s.addEventListener("click",()=>Ro(i))}catch(n){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(n.message)}</div>`}}async function Ro(e,t=null){var a,o;if(!can("canWrite"))return showToast("No tienes permisos para crear/editar cuentas","error");e||(e=await pb.listAll("account_types",{sort:"code"})),openModal(t?"Editar Cuenta":"Nueva Cuenta",`
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
     <button class="btn btn-primary" id="btn-save-account"><i class="fas fa-floppy-disk"></i> Guardar</button>`),window.toggleRetTypes=()=>{var i,r;const s=(i=document.getElementById("ac-ret"))==null?void 0:i.checked,n=document.getElementById("ret-types-wrap");n&&n.classList.toggle("hidden",!s),(r=window.toggleRetRateInputs)==null||r.call(window)},window.toggleRetRateInputs=()=>{var i;const s=[["ac-reterenta","ac-rate-reterenta"],["ac-reteiva","ac-rate-reteiva"],["ac-reteica","ac-rate-reteica"]],n=!!((i=document.getElementById("ac-ret"))!=null&&i.checked);s.forEach(([r,c])=>{const l=document.getElementById(r),u=document.getElementById(c);if(!l||!u)return;const b=n&&l.checked;u.disabled=!b,b||(u.value="")})},(a=window.toggleRetRateInputs)==null||a.call(window),(o=$("#btn-save-account"))==null||o.addEventListener("click",async()=>{var u,b,m,p,f;const s=!!((u=document.getElementById("ac-ret"))!=null&&u.checked),n=[];s&&((b=document.getElementById("ac-reterenta"))!=null&&b.checked&&n.push("reterenta"),(m=document.getElementById("ac-reteiva"))!=null&&m.checked&&n.push("reteiva"),(p=document.getElementById("ac-reteica"))!=null&&p.checked&&n.push("reteica"));const i=parseFloat(getInputVal("ac-rate-reterenta")),r=parseFloat(getInputVal("ac-rate-reteiva")),c=parseFloat(getInputVal("ac-rate-reteica")),l={code:getInputVal("ac-code"),name:getInputVal("ac-name"),account_type_id:getSelectVal("ac-type"),nature:getSelectVal("ac-nature"),level:Number(getInputVal("ac-level")||1),parent_code:getInputVal("ac-parent"),requires_third_party:getSelectVal("ac-third")==="1",active:getSelectVal("ac-active")==="1",maneja_cruce:!!((f=document.getElementById("ac-cruce"))!=null&&f.checked),maneja_retenciones:s,tipos_retencion:n.join(","),ret_rate_reterenta:Number.isFinite(i)?i:0,ret_rate_reteiva:Number.isFinite(r)?r:0,ret_rate_reteica:Number.isFinite(c)?c:0};if(!l.code||!l.name||!l.account_type_id)return showToast("Completa código, nombre y tipo de cuenta","warning");if(!/^\d+$/.test(l.code))return showToast("El código de cuenta debe ser numérico","warning");if(l.parent_code&&!/^\d+$/.test(l.parent_code))return showToast("El código padre debe ser numérico","warning");if(l.parent_code&&l.parent_code===l.code)return showToast("Una cuenta no puede ser su propia cuenta padre","warning");if(s&&!n.length)return showToast("Selecciona al menos un tipo de retención","warning");if(s){if(n.includes("reterenta")&&l.ret_rate_reterenta<=0)return showToast("Ingresa un porcentaje válido para Reterenta","warning");if(n.includes("reteiva")&&l.ret_rate_reteiva<=0)return showToast("Ingresa un porcentaje válido para Reteiva","warning");if(n.includes("reteica")&&l.ret_rate_reteica<=0)return showToast("Ingresa un porcentaje válido para Reteica","warning")}try{if(l.parent_code){const d=await pb.list("accounts",{filter:`code="${l.parent_code}"`,perPage:1});if(!d.items.length)return showToast("El código padre no existe","error");const y=d.items[0];if(Number(y.level||1)>=Number(l.level||1))return showToast("El nivel de la cuenta hija debe ser mayor al nivel de la cuenta padre","warning")}if(t!=null&&t.id)await pb.update("accounts",t.id,l),await API.logAudit("UPDATE","Cuenta",t.id,`${l.code} - ${l.name}`);else{const d=await pb.create("accounts",l);await API.logAudit("CREATE","Cuenta",d.id,`${l.code} - ${l.name}`)}closeModal(),showToast("Cuenta guardada correctamente","success"),Po($("#page-content"))}catch(d){showToast(d.message,"error")}})}async function ec(e){try{const[t,a]=await Promise.all([pb.get("accounts",e),pb.listAll("account_types",{sort:"code"})]);Ro(a,t)}catch(t){showToast(t.message,"error")}}function tc(e,t){if(!can("canDelete"))return showToast("No tienes permisos para cambiar estado","error");confirmDialog(t?"Reactivar cuenta":"Inactivar cuenta",t?"¿Deseas reactivar esta cuenta?":"¿Deseas inactivar esta cuenta?",async()=>{try{if(!t){const o=await pb.get("accounts",e);if((await pb.list("accounts",{filter:`parent_code="${o.code}" && active=true`,perPage:1})).totalItems>0)return showToast("No puedes inactivar una cuenta que tiene subcuentas activas","error");if((await pb.list("tx_lines",{filter:`account_id="${e}"`,perPage:1})).totalItems>0)return showToast("No puedes inactivar una cuenta con movimientos contables asociados","error")}await pb.update("accounts",e,{active:t});const a=await pb.get("accounts",e);await API.logAudit("STATUS","Cuenta",e,`${a.code} - ${a.name} => ${t?"Activa":"Inactiva"}`),showToast("Estado actualizado","success"),Po($("#page-content"))}catch(a){showToast(a.message,"error")}})}window.openAccountForm=Ro;window.editAccount=ec;window.renderPlanCuentas=Po;window.toggleAccountActive=tc;async function Do(e){var t,a,o,s,n;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando terceros...</div>';try{const i=await pb.listAll("third_parties",{sort:"name"}),r=u=>u==="JURIDICA"?'<span class="badge badge-blue"><i class="fas fa-building mr-1"></i>Jurídica</span>':u==="GRAN_CONTRIBUYENTE"?'<span class="badge badge-orange"><i class="fas fa-landmark mr-1"></i>Gran Contr.</span>':'<span class="badge badge-gray"><i class="fas fa-user mr-1"></i>Natural</span>',c=u=>{var p;const b={CLIENTE:"badge-green",PROVEEDOR:"badge-blue",EMPLEADO:"badge-orange",ACREEDOR:"badge-gray",TRANSPORTISTA:"badge-blue",OTRO:"badge-gray"},m=((p=TP_TYPES.find(f=>f.code===u))==null?void 0:p.name)??u;return`<span class="badge ${b[u]??"badge-gray"}">${esc(m)}</span>`};e.innerHTML=`
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
          ${PERSON_TYPES.map(u=>`<option value="${esc(u.code)}">${esc(u.name)}</option>`).join("")}
        </select>
        <select id="tp-type" class="form-input">
          <option value="">Todos los roles</option>
          ${TP_TYPES.map(u=>`<option value="${esc(u.code)}">${esc(u.name)}</option>`).join("")}
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
            ${i.length?i.map(u=>`
              <tr data-type="${esc(u.type)}" data-person="${esc(u.person_type||"NATURAL")}">
                <td>${r(u.person_type)}</td>
                <td><span class="font-semibold">${esc(u.doc_type)} ${esc(u.doc_number)}${u.dv?`-${esc(u.dv)}`:""}</span></td>
                <td>${esc(u.name)}</td>
                <td>${esc(u.email||"—")}</td>
                <td>${esc(u.city||"—")}</td>
                <td>${c(u.type)}</td>
                <td>${u.active?'<span class="badge badge-green">Activo</span>':'<span class="badge badge-gray">Inactivo</span>'}</td>
                <td>
                  <div class="flex gap-2">
                    ${can("canWrite")?`<button class="btn btn-outline btn-sm" onclick="editTercero('${esc(u.id)}')"><i class="fas fa-pen"></i></button>`:""}
                    ${can("canDelete")?`<button class="btn btn-danger btn-sm" onclick="toggleTercero('${esc(u.id)}', ${u.active?"false":"true"})"><i class="fas ${u.active?"fa-ban":"fa-rotate-left"}"></i></button>`:""}
                  </div>
                </td>
              </tr>`).join(""):'<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No hay terceros registrados.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;const l=()=>{var f,d,y,v;const u=(((f=$("#tp-q"))==null?void 0:f.value)??"").toLowerCase(),b=((d=$("#tp-person"))==null?void 0:d.value)??"",m=((y=$("#tp-type"))==null?void 0:y.value)??"",p=((v=$("#tp-status"))==null?void 0:v.value)??"";$$("#tp-table tbody tr").forEach(g=>{var _;const h=(_=g.children[6])==null?void 0:_.textContent.includes("Activo");g.style.display=(!u||g.textContent.toLowerCase().includes(u))&&(!b||(g.dataset.person||"")===b)&&(!m||(g.dataset.type||"")===m)&&(!p||(p==="active"?h:!h))?"":"none"})};(t=$("#tp-q"))==null||t.addEventListener("input",debounce(l,200)),(a=$("#tp-person"))==null||a.addEventListener("change",l),(o=$("#tp-type"))==null||o.addEventListener("change",l),(s=$("#tp-status"))==null||s.addEventListener("change",l),(n=$("#btn-new-tp"))==null||n.addEventListener("click",()=>Bo())}catch(i){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(i.message)}</div>`}}function zs(e){const t=(e==null?void 0:e.person_type)||"NATURAL",a=t==="NATURAL",o=(e==null?void 0:e.country)||"CO",s=o==="CO",n=(e==null?void 0:e.dept_code)||"",i=(e==null?void 0:e.department)||"",r=COL_DEPTS.find(l=>l.code===n||l.name===i),c=[{code:"NATURAL",label:"Persona Natural",icon:"fa-user"},{code:"JURIDICA",label:"Persona Jurídica",icon:"fa-building"},{code:"GRAN_CONTRIBUYENTE",label:"Gran Contribuyente",icon:"fa-landmark"}];return`
  <!-- ── Tabs nav ─────────────────────────────────────────────── -->
  <div id="tpf-tab-nav"
    style="display:flex;border-bottom:2px solid #E5E7EB;margin:-4px -4px 16px;overflow-x:auto">
    ${["Identificación","Nombre y Contacto","Ubicación","Crédito"].map((l,u)=>`
      <button type="button" id="tpf-tab-${u}" onclick="_tpfSwitchTab(${u})"
        style="padding:10px 14px;border:none;background:none;cursor:pointer;font-size:13px;
               white-space:nowrap;margin-bottom:-2px;
               border-bottom:2px solid ${u===0?"#E87D1E":"transparent"};
               color:${u===0?"#E87D1E":"#6B7280"};font-weight:${u===0?"600":"400"}">
        ${l}
      </button>`).join("")}
  </div>

  <!-- ══ TAB 0 — Identificación ══════════════════════════════════ -->
  <div id="tpf-panel-0">
    <p class="form-label mb-2">Tipo de Persona <span style="color:#EF4444">*</span></p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${c.map(l=>`
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
              ${GEO_DEPTS.map(l=>`<option value="${esc(l.code)}" ${(r==null?void 0:r.code)===l.code?"selected":""}>${esc(l.name)}</option>`).join("")}
            </select>
          </div>
          <!-- Cód DANE Departamento (readonly, auto) -->
          <div class="form-group">
            <label class="form-label">Cód. DANE Departamento</label>
            <input id="tpf-dept-code" class="form-input" value="${esc((r==null?void 0:r.code)||n)}"
              readonly style="background:#F9FAFB;color:#6B7280;font-weight:600" placeholder="Auto">
          </div>
          <input type="hidden" id="tpf-department" value="${esc((r==null?void 0:r.name)||i)}">

          <!-- Ciudad / Municipio (cascada desde departamento) -->
          <div class="form-group">
            <label class="form-label">Ciudad / Municipio <span style="color:#EF4444">*</span></label>
            <select id="tpf-city-select" class="form-input">
              <option value="">— seleccione departamento primero —</option>
              ${r?geoMunisByDept(r.code).map(l=>`<option value="${esc(l.code)}" ${(e==null?void 0:e.city_code)===l.code?"selected":""}>${esc(l.name)}</option>`).join(""):""}
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
  `}function At(e){for(let t=0;t<4;t++){const a=$(`#tpf-panel-${t}`),o=$(`#tpf-tab-${t}`);if(!a||!o)continue;const s=t===e;a.style.display=s?"":"none",o.style.borderBottomColor=s?"#E87D1E":"transparent",o.style.color=s?"#E87D1E":"#6B7280",o.style.fontWeight=s?"600":"400"}}function ko(){var e;return((e=document.querySelector('input[name="tpf-person-type-r"]:checked'))==null?void 0:e.value)||"NATURAL"}function Oo(){const e=ko(),t=e==="NATURAL",a=!t,o=$("#tpf-section-natural"),s=$("#tpf-section-juridica");if(o&&(o.style.display=t?"":"none"),s&&(s.style.display=a?"":"none"),$$('input[name="tpf-person-type-r"]').forEach(n=>{const i=n.value===e,r=n.closest("label");if(!r)return;r.style.borderColor=i?"#E87D1E":"#E5E7EB",r.style.background=i?"#FFF7F0":"#FAFAFA";const c=r.querySelector("i"),l=r.querySelector("span");c&&(c.style.color=i?"#E87D1E":"#9CA3AF"),l&&(l.style.color=i?"#E87D1E":"#374151",l.style.fontWeight=i?"600":"400")}),a){const n=$("#tpf-doc-type");n&&n.value!=="NIT"&&(n.value="NIT",ea())}}function ea(){const e=getSelectVal("tpf-doc-type"),t=$("#tpf-dv-wrap"),a=$("#tpf-dv");a&&(e==="NIT"?(t&&(t.style.display=""),a.value=calcDV(getInputVal("tpf-doc-number"))):(t&&(t.style.display="none"),a.value=""))}function qs(){const t=getSelectVal("tpf-country")==="CO",a=$("#tpf-section-colombia");if(a&&(a.style.display=t?"":"none"),!t){setInputVal("tpf-dept-code",""),setInputVal("tpf-department","");const o=$("#tpf-city-select");o&&(o.innerHTML='<option value="">—</option>'),setInputVal("tpf-city-code",""),setInputVal("tpf-city","")}}function Ws(){const e=getSelectVal("tpf-dept-select"),t=geoDept(e);setInputVal("tpf-dept-code",e),setInputVal("tpf-department",(t==null?void 0:t.name)||"");const a=$("#tpf-city-select");if(!a)return;const o=e?geoMunisByDept(e):[];a.innerHTML='<option value="">Seleccionar municipio...</option>'+o.map(s=>`<option value="${esc(s.code)}">${esc(s.name)}</option>`).join(""),setInputVal("tpf-city-code",""),setInputVal("tpf-city","")}function Ys(){const e=getSelectVal("tpf-city-select"),t=geoMuni(e);setInputVal("tpf-city-code",e),setInputVal("tpf-city",(t==null?void 0:t.name)||"")}function Js(){var e,t,a,o,s;$$('input[name="tpf-person-type-r"]').forEach(n=>n.addEventListener("change",Oo)),(e=$("#tpf-doc-type"))==null||e.addEventListener("change",ea),(t=$("#tpf-doc-number"))==null||t.addEventListener("input",ea),(a=$("#tpf-country"))==null||a.addEventListener("change",qs),(o=$("#tpf-dept-select"))==null||o.addEventListener("change",Ws),["tpf-first-name","tpf-last-name","tpf-business-name","tpf-commercial-name","tpf-address"].forEach(n=>{const i=$(`#${n}`);i&&i.addEventListener("input",()=>{const r=i.selectionStart;i.value=i.value.toUpperCase(),i.setSelectionRange(r,r)})}),(s=$("#tpf-city-select"))==null||s.addEventListener("change",Ys)}function Ks(){const e=ko(),t=e==="NATURAL",a=getInputVal("tpf-first-name").toUpperCase(),o=getInputVal("tpf-last-name").toUpperCase(),s=getInputVal("tpf-business-name").toUpperCase(),n=getInputVal("tpf-commercial-name").toUpperCase(),i=t?[a,o].filter(Boolean).join(" "):s||n,r=getSelectVal("tpf-country")||"CO",c=r==="CO";return{person_type:e,type:getSelectVal("tpf-type"),doc_type:getSelectVal("tpf-doc-type"),doc_number:getInputVal("tpf-doc-number"),dv:getInputVal("tpf-dv"),first_name:a,last_name:o,business_name:s,commercial_name:n,name:i,contact_name:getInputVal("tpf-contact-name"),advisor:getInputVal("tpf-advisor"),phone:getInputVal("tpf-phone"),phone2:getInputVal("tpf-phone2"),email:getInputVal("tpf-email"),email2:getInputVal("tpf-email2"),country:r,department:c?getInputVal("tpf-department"):"",dept_code:c?getInputVal("tpf-dept-code"):"",city:c?getInputVal("tpf-city"):"",city_code:c?getInputVal("tpf-city-code"):"",address:getInputVal("tpf-address").toUpperCase(),tax_regime:getSelectVal("tpf-tax"),credit_limit:parseFloat(getInputVal("tpf-credit-limit"))||0,max_invoices:parseInt(getInputVal("tpf-max-invoices"),10)||1,payment_days:parseInt(getInputVal("tpf-payment-days"),10)||0,active:getSelectVal("tpf-active")==="1"}}function Qs(e){if(!e.doc_type||!e.doc_number)return At(0),showToast("Tipo y número de documento son obligatorios","warning"),!1;const t=e.person_type==="NATURAL";return t&&(!e.first_name||!e.last_name)?(At(1),showToast("Nombres y Apellidos son obligatorios para persona natural","warning"),!1):!t&&!e.business_name?(At(1),showToast("La Razón Social es obligatoria","warning"),!1):e.name?e.country==="CO"&&(!e.city||!e.department)?(At(2),showToast("Departamento y Ciudad son obligatorios para Colombia","warning"),!1):!0:(At(1),showToast("El nombre no puede quedar vacío","warning"),!1)}function Bo(e=null){var t;if(!can("canWrite"))return showToast("No tienes permisos para gestionar terceros","error");openModal(e?"Editar Tercero":"Nuevo Tercero",zs(e),`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-tp"><i class="fas fa-floppy-disk"></i> Guardar</button>`,!0),setTimeout(()=>{var a;if(Js(),ea(),Oo(),e!=null&&e.dept_code){const o=$("#tpf-city-select");if(o){const s=geoMunisByDept(e.dept_code),n=e.city_code||"";o.innerHTML='<option value="">Seleccionar municipio...</option>'+s.map(i=>`<option value="${esc(i.code)}" ${i.code===n?"selected":""}>${esc(i.name)}</option>`).join(""),setInputVal("tpf-city-code",n),setInputVal("tpf-city",((a=s.find(i=>i.code===n))==null?void 0:a.name)||e.city||"")}}},30),(t=$("#btn-save-tp"))==null||t.addEventListener("click",async()=>{const a=Ks();if(!Qs(a))return;const o=$("#btn-save-tp");o&&(o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{if(e!=null&&e.id)await pb.update("third_parties",e.id,a),await API.logAudit("UPDATE","Tercero",e.id,`${a.doc_type} ${a.doc_number} - ${a.name}`);else{const s=await pb.create("third_parties",a);await API.logAudit("CREATE","Tercero",s.id,`${a.doc_type} ${a.doc_number} - ${a.name}`)}closeModal(),showToast("Tercero guardado correctamente","success"),Do($("#page-content"))}catch(s){o&&(o.disabled=!1,o.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar'),showToast(s.message,"error")}})}async function ac(e){try{const t=await pb.get("third_parties",e);if(!t.first_name&&!t.business_name&&t.name)if((t.person_type||"NATURAL")==="NATURAL"){const o=t.name.trim().split(/\s+/),s=Math.ceil(o.length/2);t.first_name=o.slice(0,s).join(" "),t.last_name=o.slice(s).join(" ")}else t.business_name=t.name;if(!t.country||t.country.length>3){const a=(t.country||"COLOMBIA").toUpperCase(),o=GEO_PAISES.find(s=>s.name===a);t.country=o?o.code:"CO"}if(!t.dept_code&&t.department){const a=t.department.trim().toUpperCase(),o=GEO_DEPTS.find(s=>s.name===a);o&&(t.dept_code=o.code)}if(!t.city_code&&t.city&&t.dept_code){const a=t.city.trim().toUpperCase(),o=geoMunisByDept(t.dept_code).find(s=>s.name===a);o&&(t.city_code=o.code)}Bo(t)}catch(t){showToast(t.message,"error")}}function oc(e,t){if(!can("canDelete"))return showToast("No tienes permisos para cambiar estado","error");confirmDialog(t?"Reactivar tercero":"Inactivar tercero",t?"¿Deseas reactivar este tercero?":"¿Deseas inactivar este tercero?",async()=>{try{await pb.update("third_parties",e,{active:t});const a=await pb.get("third_parties",e);await API.logAudit("STATUS","Tercero",e,`${a.doc_type} ${a.doc_number} - ${a.name} => ${t?"Activo":"Inactivo"}`),showToast("Estado actualizado","success"),Do($("#page-content"))}catch(a){showToast(a.message,"error")}})}window._tpfSwitchTab=At;window.renderTerceros=Do;window._tpfBindEvents=Js;window.openTerceroForm=Bo;window._tpfUpdatePersonType=Oo;window.terceroPayload=Ks;window._tpfUpdateCountry=qs;window.editTercero=ac;window._tpfUpdateDept=Ws;window._tpfValidate=Qs;window.toggleTercero=oc;window._tpfUpdateCity=Ys;window._tpfUpdateDV=ea;window.terceroFormHtml=zs;window._tpfCurrentPersonType=ko;async function Mo(e){var t;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando tipos de transacción...</div>';try{const a=await pb.listAll("transaction_types",{sort:"code,prefix"}),o=new Map;for(const n of a)o.has(n.code)||o.set(n.code,[]),o.get(n.code).push(n);let s="";for(const[n,i]of o){const r=i.length>1;i.forEach((c,l)=>{s+=`
          <tr>
            ${l===0?`<td rowspan="${i.length}" style="vertical-align:middle;background:#F8FAFC">
                   <span class="font-bold" style="color:#1A4B8C">${esc(n)}</span>
                   ${r?`<span class="badge ml-1" style="background:#EFF6FF;color:#1A4B8C;font-size:10px">${i.length} series</span>`:""}
                 </td>`:""}
            <td>
              <span class="font-mono text-sm font-semibold" style="color:#0D2137">${esc(c.prefix)}</span>
            </td>
            <td>${esc(c.name)}</td>
            <td class="text-right">${fmtN(c.consecutive||0)}</td>
            <td>${c.active?'<span class="badge badge-green">Activo</span>':'<span class="badge badge-gray">Inactivo</span>'}</td>
            <td>
              <div class="flex gap-2">
                ${can("canWrite")?`<button class="btn btn-outline btn-sm" title="Editar serie" onclick="editTxType('${esc(c.id)}')"><i class="fas fa-pen"></i></button>`:""}
                ${can("canWrite")?`<button class="btn btn-outline btn-sm" title="Nueva serie con mismo código" style="border-color:#1A4B8C;color:#1A4B8C" onclick="openTxTypeForm(null,'${esc(n)}')"><i class="fas fa-code-branch"></i></button>`:""}
                ${can("canDelete")?`<button class="btn btn-danger btn-sm" title="${c.active?"Inactivar":"Reactivar"}" onclick="toggleTxType('${esc(c.id)}', ${c.active?"false":"true"})"><i class="fas ${c.active?"fa-ban":"fa-rotate-left"}"></i></button>`:""}
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
      </div>`,(t=$("#btn-new-tx-type"))==null||t.addEventListener("click",()=>Uo())}catch(a){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(a.message)}</div>`}}function Uo(e=null,t=""){var n;if(!can("canWrite"))return showToast("No tienes permisos para gestionar tipos","error");const a=!!(e!=null&&e.id),o=(e==null?void 0:e.code)??t??"",s=!a&&!!t;openModal(a?"Editar Serie de Transacción":"Nueva Serie de Transacción",`
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
     <button class="btn btn-primary" id="btn-save-tt"><i class="fas fa-floppy-disk"></i> Guardar</button>`),(n=$("#btn-save-tt"))==null||n.addEventListener("click",async()=>{var r;const i={code:(getInputVal("tt-code")||"").trim().toUpperCase(),prefix:(getInputVal("tt-prefix")||"").trim().toUpperCase(),name:getInputVal("tt-name"),description:getInputVal("tt-desc"),consecutive:Number(getInputVal("tt-consec")||0),active:getSelectVal("tt-active")==="1"};if(!i.code||!i.prefix||!i.name)return showToast("Código, prefijo y nombre son obligatorios","warning");try{a?await pb.update("transaction_types",e.id,i):await pb.create("transaction_types",i),closeModal(),showToast("Serie guardada correctamente","success"),Mo($("#page-content"))}catch(c){(r=c.message)!=null&&r.toLowerCase().includes("unique")||c.status===400?showToast(`Ya existe una serie con código "${i.code}" y prefijo "${i.prefix}"`,"error"):showToast(c.message,"error")}})}async function sc(e){try{Uo(await pb.get("transaction_types",e))}catch(t){showToast(t.message,"error")}}function nc(e,t){if(!can("canDelete"))return showToast("No tienes permisos para cambiar estado","error");const a=t===!0||t==="true";confirmDialog(a?"Reactivar serie":"Inactivar serie",a?"¿Deseas reactivar esta serie de transacción?":"¿Deseas inactivar esta serie de transacción?",async()=>{try{await pb.update("transaction_types",e,{active:a}),showToast("Estado actualizado","success"),Mo($("#page-content"))}catch(o){showToast(o.message,"error")}})}window.editTxType=sc;window.openTxTypeForm=Uo;window.toggleTxType=nc;window.renderTiposTx=Mo;const qt={reterenta:3.5,reteiva:15,reteica:.414},Vo={reterenta:"ret_rate_reterenta",reteiva:"ret_rate_reteiva",reteica:"ret_rate_reteica"};function bt(e,t=null){for(const a of e){const o=a.trim(),s=Vo[o],n=t&&s?Number(t[s]||0):0;if(n>0)return n;if(qt[o])return qt[o]}return qt.reterenta}function Zs(e){return{reterenta:"Reterenta",reteiva:"Reteiva",reteica:"Reteica"}[e.trim()]||e}function jo(e,t=null){const a=String(e||"").trim(),o=Vo[a],s=t&&o?Number(t[o]||0):0,n=s>0?s:qt[a]||0;return`${Zs(a)} ${n}%`}let ce={accounts:[],txTypes:[],terceros:[],lines:[],postableAccountIds:new Set,accountMap:new Map};function Rt(e){return`${(e==null?void 0:e.doc_number)||""} - ${(e==null?void 0:e.name)||""}`.trim()}function ta(e,t){var a;return!t||!((a=e==null?void 0:e.terceros)!=null&&a.length)?null:e.terceros.find(o=>o.id===t)||null}function Ho(e,t){const a=Array.isArray(e==null?void 0:e.terceros)?e.terceros:[],o=String(t||"").toLowerCase().trim();if(!o)return a.slice(0,30);const s=o.split(/\s+/).filter(Boolean);return a.filter(n=>{const i=`${n.doc_number||""} ${n.name||""}`.toLowerCase();return s.every(r=>i.includes(r))}).slice(0,30)}function Go({state:e,hiddenId:t,inputId:a,resultsId:o,onSelected:s}){const n=document.getElementById(`${a}-wrap`),i=document.getElementById(t),r=document.getElementById(a),c=document.getElementById(o);if(!n||!i||!r||!c)return;const l=(p="")=>{const f=Ho(e,p);if(!f.length){c.innerHTML='<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';return}c.innerHTML=f.map(d=>`
      <button type="button" data-third-id="${esc(d.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
        <div style="font-weight:600">${esc(d.doc_number||"SIN DOC")}</div>
        <div style="font-size:12px;color:#6B7280">${esc(d.name||"")}</div>
      </button>
    `).join("")},u=()=>{l(r.value),c.style.display="block"},b=()=>{c.style.display="none"};(()=>{const p=ta(e,i.value);r.value=p?Rt(p):""})(),r.onfocus=()=>u(),r.oninput=()=>{i.value="",typeof s=="function"&&s(""),l(r.value),c.style.display="block"},c.onclick=p=>{const f=p.target.closest("[data-third-id]");if(!f)return;const d=f.getAttribute("data-third-id")||"",y=ta(e,d);i.value=d,r.value=y?Rt(y):"",b(),typeof s=="function"&&s(d)},r._thirdOutsideHandler&&document.removeEventListener("click",r._thirdOutsideHandler),r._thirdOutsideHandler=p=>{n.contains(p.target)||b()},setTimeout(()=>document.addEventListener("click",r._thirdOutsideHandler),0)}function Xs({state:e,hidden:t,input:a,results:o,onSelected:s}){if(!t||!a||!o)return;const n=(r="")=>{const c=Ho(e,r);o.innerHTML=`
      <button type="button" data-third-id="" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer;border-bottom:1px solid #F1F5F9">
        Usar tercero del encabezado
      </button>
      ${c.map(l=>`
        <button type="button" data-third-id="${esc(l.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
          <div style="font-weight:600">${esc(l.doc_number||"SIN DOC")}</div>
          <div style="font-size:12px;color:#6B7280">${esc(l.name||"")}</div>
        </button>
      `).join("")}
    `};(()=>{const r=ta(e,t.value);a.value=r?Rt(r):""})(),a.onfocus=()=>{n(a.value),o.style.display="block"},a.oninput=()=>{t.value="",typeof s=="function"&&s(""),n(a.value),o.style.display="block"},a.onblur=()=>setTimeout(()=>{o.style.display="none"},120),o.onmousedown=r=>r.preventDefault(),o.onclick=r=>{const c=r.target.closest("[data-third-id]");if(!c)return;const l=c.getAttribute("data-third-id")||"";t.value=l;const u=ta(e,l);a.value=u?Rt(u):"",o.style.display="none",typeof s=="function"&&s(l)}}function zo(e="new"){var o;const t=e==="edit",a=t?ae:ce;(o=a==null?void 0:a.lines)!=null&&o.length&&a.lines.forEach((s,n)=>{const i=t?`edit-tx-line-third-${n}`:`tx-line-third-${n}`,r=document.getElementById(i),c=document.getElementById(`${i}-search`),l=document.getElementById(`${i}-results`);Xs({state:a,hidden:r,input:c,results:l,onSelected:u=>{t?un(n,"third_party_id",u):an(n,"third_party_id",u)}})})}async function ic(){if(!can("canWrite"))return showToast("Sin permisos para registrar transacciones","error");openModal("Nueva Transacción",'<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos...</div>',"",!0);try{const[e,t,a]=await Promise.all([API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]),o=new Set(e.map(c=>c.parent_code).filter(Boolean)),s=new Set(e.filter(c=>!o.has(c.code)).map(c=>c.id)),n=new Map(e.map(c=>[c.id,c]));ce={accounts:e,txTypes:t,terceros:a,lines:[],postableAccountIds:s,accountMap:n,inModal:!0};const i=`
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b" style="border-color:#F3F4F6">
        <div class="form-group"><label class="form-label">Tipo / Serie</label><select id="tx-type" class="form-input">${qo(t)}</select></div>
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
      </div>`,r=`
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-outline" onclick="saveTransaction(false)" style="border-color:#D97706;color:#D97706"><i class="fas fa-file-pen"></i> Guardar Borrador</button>
      ${can("canApprove")?'<button class="btn btn-primary" onclick="saveTransaction(true)"><i class="fas fa-check-circle"></i> Guardar y Aprobar</button>':""}`;openModal("Nueva Transacción",i,r,!0),setTimeout(async()=>{Ra(),await Da(),pt(),pt()},0)}catch(e){openModal("Error al cargar",`<p class="p-4 text-sm" style="color:#EF4444">${esc(e.message)}</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!1)}}function Ra(){const e=$("#tx-type"),t=$("#btn-add-line"),a=$("#tx-third"),o=$("#btn-cartera");e&&(e.onchange=Da),t&&(t.onclick=()=>pt()),Go({state:ce,hiddenId:"tx-third",inputId:"tx-third-search",resultsId:"tx-third-results",onSelected:s=>{var i;o&&(o.disabled=!s);const n=$("#tx-payment-days");if(n&&s){const r=(i=ce.terceros)==null?void 0:i.find(c=>c.id===s);n.value=Number((r==null?void 0:r.payment_days)||0)}}}),a&&o&&(o.disabled=!a.value),o&&(o.onclick=()=>Oa(getSelectVal("tx-third")))}async function en(e){var t;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando datos...</div>';try{const[a,o,s]=await Promise.all([API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]),n=new Set(a.map(c=>c.parent_code).filter(Boolean)),i=new Set(a.filter(c=>!n.has(c.code)).map(c=>c.id)),r=new Map(a.map(c=>[c.id,c]));ce={accounts:a,txTypes:o,terceros:s,lines:[],postableAccountIds:i,accountMap:r,inModal:!1},e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Nueva Transacción</h3>
          <p class="text-sm" style="color:#6B7280">Registro contable por partida doble.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group"><label class="form-label">Tipo / Serie</label><select id="tx-type" class="form-input">${qo(o)}</select></div>
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
      </div>`,Ra(),(t=$("#btn-save-tx"))==null||t.addEventListener("click",nn),await Da(),pt(),pt()}catch(a){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(a.message)}</div>`}}function qo(e){const t=new Map;for(const o of e)t.has(o.code)||t.set(o.code,[]),t.get(o.code).push(o);const a=[];for(const[o,s]of t)if(s.length===1){const n=s[0];a.push(`<option value="${esc(n.id)}">${esc(n.prefix)} — ${esc(n.name)}</option>`)}else{const n=`${esc(o)} — ${esc(s[0].name.replace(/ ?[\-–—].*$/,"").trim())}`;a.push(`<optgroup label="${n}">${s.map(i=>`<option value="${esc(i.id)}">[${esc(i.prefix)}] ${esc(i.name)}</option>`).join("")}</optgroup>`)}return a.join("")}async function Da(){const e=getSelectVal("tx-type"),t=ce.txTypes.find(a=>a.id===e);t&&setInputVal("tx-number",`${t.prefix}-${String((t.consecutive??0)+1).padStart(8,"0")}`)}function pt(e=null){ce.lines.push(e||{account_id:"",third_party_id:"",debit:0,credit:0,description:"",cross_doc_ref:"",ret_base:"",ret_rate:""}),ut()}function rc(e){ce.lines.splice(e,1),ut()}function tn(e){const t=ce.lines[e];if(!t||!(e===ce.lines.length-1))return;const o=Number(t.debit||0),s=Number(t.credit||0),n=o>0&&s<=0||s>0&&o<=0;!t.account_id||!n||pt()}function cc(e){openLineComment(e,"new")}function an(e,t,a){if(ce.lines[e][t]=a,t==="debit"&&Number(a)>0&&(ce.lines[e].credit=0),t==="credit"&&Number(a)>0&&(ce.lines[e].debit=0),t==="account_id"){ce.lines[e].cross_doc_ref="",ce.lines[e].ret_base="";const o=ce.accountMap.get(a);if(o!=null&&o.maneja_retenciones){const s=(o.tipos_retencion||"").split(",").filter(Boolean);ce.lines[e].ret_rate=String(bt(s,o))}else ce.lines[e].ret_rate="";ut(!0)}else if(t==="ret_base"||t==="ret_rate"){const o=Number(ce.lines[e].ret_base||0),s=Number(ce.lines[e].ret_rate||0),n=document.getElementById(`ret-calc-${e}`);n&&(n.textContent=o&&s?fmt(o*s/100):"$0")}else if(t==="debit"||t==="credit"){const o=t==="debit"?"credit":"debit",s=document.getElementById(`tx-line-${o}-${e}`);if(s){const n=Number(a)>0;s.disabled=n,n&&(s.value="")}on()}else ut(!1)}function lc(e){const t=ce.lines[e],a=Number(t.ret_base||0),o=ce.accountMap.get(t.account_id),s=((o==null?void 0:o.tipos_retencion)||"").split(",").filter(Boolean),n=Number(t.ret_rate||bt(s,o)||0);if(ce.lines[e].ret_rate=n?String(n):"",!a||!n)return showToast("Ingresa la base gravable para calcular la retención","warning");const i=Math.round(a*n/100);(o==null?void 0:o.nature)==="debit"?(ce.lines[e].debit=i,ce.lines[e].credit=0):(ce.lines[e].credit=i,ce.lines[e].debit=0),ut(!0),tn(e),showToast(`Retención aplicada: ${fmt(i)}`,"success")}function on(){const e=ce.lines.reduce((o,s)=>(o.d+=Number(s.debit||0),o.c+=Number(s.credit||0),o),{d:0,c:0}),t=Math.abs(e.d-e.c)<1e-4&&e.d>0,a=$("#tx-balance");a&&(a.className=`balance-indicator ${t?"balance-ok":"balance-err"}`,a.innerHTML=t?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(e.d)} = Crédito ${fmt(e.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(e.d-e.c))}`)}function ut(e=!0){if(e){const s=ce.lines.map((n,i)=>{const r=ce.accountMap.get(n.account_id),c=!!(r!=null&&r.requires_third_party),l=!!(r!=null&&r.maneja_cruce),u=!!(r!=null&&r.maneja_retenciones),b=!!String(n.description||"").trim(),m=((r==null?void 0:r.tipos_retencion)||"").split(",").filter(Boolean),p=Number(n.ret_base||0),f=Number(n.ret_rate!==""?n.ret_rate:m.length?bt(m,r):0),d=p&&f?fmt(p*f/100):"$0",y=Number(n.debit||0),v=Number(n.credit||0);return`
      <div class="tx-line-row" data-i="${i}" style="display:grid;grid-template-columns:minmax(250px,320px) minmax(260px,1fr) minmax(160px,190px) minmax(120px,140px) minmax(120px,140px) auto auto;gap:8px;align-items:center">
        <select class="form-input" style="font-size:13px" onchange="updateTxLine(${i}, 'account_id', this.value)">
          <option value="">Seleccione cuenta...</option>
          ${ce.accounts.map(g=>{const h=ce.postableAccountIds.has(g.id);return`<option value="${esc(g.id)}" ${n.account_id===g.id?"selected":""} ${h?"":"disabled"}>${esc(g.code)} - ${esc(g.name)}${h?"":" [MAYOR]"}</option>`}).join("")}
        </select>

        <div style="display:flex;flex-direction:column;gap:3px;min-width:0">
          <div style="display:flex;align-items:center;gap:6px">
            <i class="fas fa-user-tag" style="color:#334155;font-size:11px"></i>
            <span class="text-xs font-semibold" style="color:#334155;white-space:nowrap">Tercero línea</span>
            ${c?'<span class="text-xs" style="color:#B91C1C">Obligatorio</span>':'<span class="text-xs" style="color:#94A3B8">Opcional</span>'}
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

        <button class="btn btn-outline btn-sm" title="Comentario por registro" style="${b?"border-color:#16A34A;color:#16A34A;background:#F0FDF4":"border-color:#64748B;color:#334155"}" onclick="editTxLineComment(${i})"><i class="fas fa-comment-dots"></i></button>
        <button class="btn btn-danger btn-sm" onclick="removeTxLine(${i})"><i class="fas fa-xmark"></i></button>
      </div>
      ${u?`
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:-2px 0 6px 0;padding:7px 10px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:0 6px 6px 0">
        <i class="fas fa-percent" style="color:#D97706;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#92400E;white-space:nowrap">Calculadora de Retención</span>
         ${m.map(g=>`<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:10px">${jo(g,r)}</span>`).join("")}
        <span class="text-xs" style="color:#92400E">Base:</span>
        <input class="form-input" style="max-width:140px;font-size:13px" type="number" min="0" step="1" placeholder="Base gravable"
               value="${esc(n.ret_base||"")}" oninput="updateTxLine(${i}, 'ret_base', this.value)">
        <span class="text-xs" style="color:#92400E">×</span>
         <span class="badge" style="background:#FDE68A;color:#92400E;font-size:11px">${esc(f)}%</span>
        <span class="text-xs" style="color:#92400E">=</span>
        <span id="ret-calc-${i}" class="text-sm font-bold" style="color:#D97706;min-width:70px">${d}</span>
        <button class="btn btn-sm" style="background:#D97706;color:#fff;padding:4px 10px;font-size:12px" onclick="applyRetentionCalc(${i})">
          <i class="fas fa-check"></i> Aplicar al comprobante
        </button>
      </div>`:""}`}).join("");$("#tx-lines").innerHTML=s||'<p style="color:#9CA3AF">Agrega al menos una línea.</p>',zo("new")}const t=ce.lines.reduce((s,n)=>(s.d+=Number(n.debit||0),s.c+=Number(n.credit||0),s),{d:0,c:0}),a=Math.abs(t.d-t.c)<1e-4&&t.d>0,o=$("#tx-balance");o&&(o.className=`balance-indicator ${a?"balance-ok":"balance-err"}`,o.innerHTML=a?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(t.d)} = Crédito ${fmt(t.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(t.d-t.c))}`)}let St=null,ka="new",Nt=null;function ya(){if(Nt=null,St){const e=St;if(St=null,openModal(e.title,e.body,e.footer,e.wide),e.editForm){const t=$("#edit-tx-date"),a=$("#edit-tx-third"),o=$("#edit-tx-third-search"),s=$("#edit-tx-desc");t&&(t.value=e.editForm.date||""),a&&(a.value=e.editForm.third||""),o&&(o.value=e.editForm.thirdLabel||""),s&&(s.value=e.editForm.desc||""),ae&&(ae.selectedThird=e.editForm.third||"")}if(e.newForm){const t=$("#tx-type"),a=$("#tx-number"),o=$("#tx-date"),s=$("#tx-third"),n=$("#tx-third-search"),i=$("#tx-desc"),r=$("#tx-payment-days");t&&e.newForm.type&&(t.value=e.newForm.type),a&&(a.value=e.newForm.number||""),o&&(o.value=e.newForm.date||""),s&&e.newForm.third&&(s.value=e.newForm.third),n&&(n.value=e.newForm.thirdLabel||""),i&&(i.value=e.newForm.desc||""),r&&(r.value=e.newForm.payDays||"0");const c=$("#btn-cartera");c&&(c.disabled=!e.newForm.third),Ra()}Wo();return}closeModal()}function dc(e,t){var s,n;const o=((s=(t==="edit"?ae:ce).lines[e])==null?void 0:s.third_party_id)||(t==="edit"?((n=$("#edit-tx-third"))==null?void 0:n.value)||(ae==null?void 0:ae.selectedThird):getSelectVal("tx-third"));if(!o){showToast("Selecciona un tercero para esta línea o en el encabezado","warning");return}Nt=e,ka=t,Oa(o,{returnToPrevious:!0,skipCtxOverride:!0})}async function Oa(e,t={}){var c,l,u,b,m,p,f,d,y,v,g,h,_,A,I,F,S,x,T,E,C,N,L,O,M;const{returnToPrevious:a=!1,skipCtxOverride:o=!1}=t;if(!e)return;const s=!!$("#edit-tx-third")&&!!((c=ae==null?void 0:ae.accountMap)!=null&&c.size);o||(ka=a||s?"edit":"new");const n=s?ae:ce,i=(n.terceros||[]).find(B=>B.id===e),r=new Set([...((u=(l=n.accountMap)==null?void 0:l.values)==null?void 0:u.call(l))||[]].filter(B=>B.maneja_cruce).map(B=>B.id));a&&((b=$("#modal-overlay"))!=null&&b.classList.contains("show"))?St={title:((m=$("#modal-title"))==null?void 0:m.innerHTML)||"",body:((p=$("#modal-body"))==null?void 0:p.innerHTML)||"",footer:((f=$("#modal-footer"))==null?void 0:f.innerHTML)||"",wide:((d=$("#modal-box"))==null?void 0:d.classList.contains("wide"))||!1,editForm:{date:((y=$("#edit-tx-date"))==null?void 0:y.value)||"",third:((v=$("#edit-tx-third"))==null?void 0:v.value)||"",thirdLabel:((g=$("#edit-tx-third-search"))==null?void 0:g.value)||"",desc:((h=$("#edit-tx-desc"))==null?void 0:h.value)||""},newForm:{type:((_=$("#tx-type"))==null?void 0:_.value)||"",number:((A=$("#tx-number"))==null?void 0:A.value)||"",date:((I=$("#tx-date"))==null?void 0:I.value)||"",third:((F=$("#tx-third"))==null?void 0:F.value)||"",thirdLabel:((S=$("#tx-third-search"))==null?void 0:S.value)||"",desc:((x=$("#tx-desc"))==null?void 0:x.value)||"",payDays:((T=$("#tx-payment-days"))==null?void 0:T.value)||"0"}}:St=null,openModal(`<i class="fas fa-file-invoice-dollar mr-2" style="color:#1A4B8C"></i>Cartera: ${esc((i==null?void 0:i.name)||e)}`,'<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando movimientos...</div>','<button class="btn btn-outline" onclick="closeCarteraModal()">Cerrar</button>',!0);try{if(!r.size){document.querySelector('#modal-body, .modal-body, [id*="modal"] .p-6')&&(document.querySelector('#modal-body, .modal-body, [id*="modal"] .p-6').innerHTML='<p class="text-center py-6" style="color:#9CA3AF">No hay cuentas configuradas con documento de cruce.</p>');return}const B=pb.escapeFilterValue(e);let j;try{j=await pb.listAll("tx_lines",{filter:`tx_id.third_party_id="${B}" && account_id.maneja_cruce=true`,expand:"account_id,tx_id",sort:"tx_id.date"})}catch{const q=await pb.listAll("tx_lines",{filter:`tx_id.third_party_id="${B}"`,expand:"account_id,tx_id",sort:"-id"});j={items:(Array.isArray(q)?q:(q==null?void 0:q.items)||[]).filter(J=>r.has(J.account_id))}}const Y=j.items??j,W=new Map;for(const U of Y){const q=(U.cross_doc_ref||"").trim();if(!q)continue;W.has(q)||W.set(q,{ref:q,account:((C=(E=U.expand)==null?void 0:E.account_id)==null?void 0:C.name)||U.account_id,firstDate:((L=(N=U.expand)==null?void 0:N.tx_id)==null?void 0:L.date)||"",debit:0,credit:0,txNumbers:new Set});const J=W.get(q);J.debit+=Number(U.debit||0),J.credit+=Number(U.credit||0),(M=(O=U.expand)==null?void 0:O.tx_id)!=null&&M.number&&J.txNumbers.add(U.expand.tx_id.number)}if(!W.size){_a('<p class="text-center py-8" style="color:#9CA3AF"><i class="fas fa-check-circle mr-2" style="color:#22C55E"></i>No hay documentos de cruce pendientes para este tercero.</p>');return}const K=[...W.values()].map(U=>{const q=Number(U.credit||0)-Number(U.debit||0),J=Math.abs(q),te=J<.01;return{...U,saldo:J,esCancelado:te,netOpen:q}}),H=K.filter(U=>!U.esCancelado),w=K.filter(U=>U.esCancelado),P=(U,q)=>`
        <tr style="${q?"opacity:0.45":""}">
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
        </tr>`,V=H.reduce((U,q)=>U+q.saldo,0);_a(`
        <div class="mb-3 flex items-center gap-3 flex-wrap">
          <span class="text-sm font-semibold" style="color:#0D2137">Documentos pendientes: <span style="color:#EF4444">${H.length}</span></span>
          <span class="text-sm font-semibold" style="color:#0D2137">Saldo total abierto: <span style="color:#EF4444">${fmt(V)}</span></span>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Doc. Cruce</th><th>Fecha</th><th>Cuenta</th><th>Débito Acum.</th><th>Crédito Acum.</th><th>Saldo</th><th></th></tr></thead>
            <tbody>
              ${H.map(U=>P(U,!1)).join("")}
              ${w.map(U=>P(U,!0)).join("")}
            </tbody>
          </table>
        </div>
        <p class="text-xs mt-3" style="color:#9CA3AF"><i class="fas fa-info-circle mr-1"></i>Haz clic en <strong>Usar</strong> para aplicar el documento de cruce a la línea correspondiente del comprobante actual.</p>
      `)}catch(B){_a(`<p class="text-center py-6" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(B.message)}</p>`)}}function _a(e){const t=$("#modal-body");t&&(t.innerHTML=e)}function sn(){const e=getSelectVal("tx-type"),t=ce.txTypes.find(o=>o.id===e);if(!t)return null;const a=`${t.code||""} ${t.prefix||""} ${t.name||""} ${t.description||""}`.toLowerCase();return/(recaudo|recibo|ingreso\s+de\s+caja|recaudo\s+de\s+cartera)/.test(a)?"recaudo":/(egreso|pago\s+a\s+proveedores|pago\s+proveedor|pago\s+proveedores|salida\s+de\s+caja)/.test(a)?"egreso":null}function to(e,t,a=ce){const o=sn();if(!o)return!1;const s=Number(t||0);if(!Number.isFinite(s)||Math.abs(s)<1e-4)return!1;let n=0,i=0;return o==="recaudo"?s<0?n=Math.abs(s):i=Math.abs(s):s>0?i=Math.abs(s):n=Math.abs(s),a.lines[e].debit=n,a.lines[e].credit=i,!0}function pc(e,t=0){var r;const a=ka==="edit"||!!$("#edit-tx-lines")&&!!((r=ae==null?void 0:ae.accountMap)!=null&&r.size),o=a?ae:ce,s=a?tt:ut;if(Nt!==null){const c=Nt;Nt=null,o.lines[c].cross_doc_ref=e;const l=to(c,t,o);ya(),s(!0),l?showToast(`Documento "${e}" aplicado a la línea ${c+1} con valor ${fmt(Math.abs(Number(t||0)))}`,"success"):showToast(`Documento "${e}" aplicado a la línea ${c+1}`,"success");return}const n=o.lines.findIndex(c=>{const l=o.accountMap.get(c.account_id);return(l==null?void 0:l.maneja_cruce)&&!c.cross_doc_ref}),i=c=>{o.lines[c].cross_doc_ref=e;const l=to(c,t,o);ya(),s(!0),l?showToast(`Documento "${e}" aplicado a la línea ${c+1} con valor ${fmt(Math.abs(Number(t||0)))}`,"success"):showToast(`Documento "${e}" aplicado a la línea ${c+1}`,"success")};if(n===-1){const c=o.lines.findIndex(l=>{var u;return(u=o.accountMap.get(l.account_id))==null?void 0:u.maneja_cruce});if(c===-1){ya(),showToast("Primero selecciona una cuenta con documento de cruce en las líneas del comprobante","warning");return}i(c);return}i(n)}async function nn(e=!1){var t;if(!can("canWrite"))return showToast("No tienes permisos para registrar transacciones","error");try{const a=getSelectVal("tx-type"),o=getInputVal("tx-date"),s=getInputVal("tx-desc"),n=getSelectVal("tx-third"),i=ce.lines.filter(b=>b.account_id&&(Number(b.debit)>0||Number(b.credit)>0));if(!a||!o)return showToast("Completa tipo y fecha","warning");if(!s)return showToast("La descripción es obligatoria","warning");if(typeof isPeriodClosed=="function"&&await isPeriodClosed(o))return showToast(`El período ${o.slice(0,7)} no está habilitado o está cerrado. Habilítalo en Cierre Contable antes de registrar.`,"error");if(!i.length)return showToast("Debe existir al menos una línea válida","warning");if(i.length<2)return showToast("Se requieren al menos 2 líneas contables","warning");const r=i.find(b=>!ce.postableAccountIds.has(b.account_id));if(r){const b=ce.accounts.find(m=>m.id===r.account_id);return showToast(`La cuenta ${(b==null?void 0:b.code)||""} es de mayor; usa una cuenta auxiliar para registrar movimientos`,"error")}const c=i.find(b=>{const m=ce.accounts.find(p=>p.id===b.account_id);return!!(m!=null&&m.requires_third_party)&&!(b.third_party_id||n)});if(c){const b=ce.lines.indexOf(c);return showToast(`La línea ${b+1} requiere tercero. Selecciónalo en la línea o en el encabezado.`,"error")}const l=i.reduce((b,m)=>({d:b.d+Number(m.debit||0),c:b.c+Number(m.credit||0)}),{d:0,c:0});if(Math.abs(l.d-l.c)>1e-4||l.d<=0)return showToast("La transacción no está cuadrada","error");const u=await API.createTransaction({tx_type_id:a,number:"",date:o,description:s,third_party_id:n||null,user_id:(t=pb.currentUser)==null?void 0:t.id,payment_days:parseInt(getInputVal("tx-payment-days"),10)||0,cross_enabled:i.some(b=>{var m;return(m=ce.accountMap.get(b.account_id))==null?void 0:m.maneja_cruce}),status:"draft"},i.map((b,m)=>({account_id:b.account_id,third_party_id:b.third_party_id||n||null,debit:Number(b.debit||0),credit:Number(b.credit||0),description:b.description||s,line_order:m+1,cross_doc_ref:b.cross_doc_ref||""})));if(e&&can("canApprove")?(await API.approveTx(u.id),showToast(`Transacción ${u.number} guardada y aprobada.`,"success")):showToast(`Transacción ${u.number} guardada como borrador. Pendiente de aprobación.`,"success"),ce.inModal){closeModal();const b=o.slice(0,7);ye.typeIdsByPeriod[b]&&delete ye.typeIdsByPeriod[b],$("#ctxq-results")&&(await wt(),Ue())}else navigate("consulta-tx")}catch(a){showToast(a.message,"error")}}let ye={page:1,perPage:50,total:0,txTypes:[],periods:[],typeIdsByPeriod:{}};function Ba(e){const[t,a]=String(e||"").split("-"),o=Number(t),s=Number(a);if(!Number.isFinite(o)||!Number.isFinite(s)||s<1||s>12)return null;const n=`${t}-${String(s).padStart(2,"0")}-01`,i=s===12?`${String(o+1)}-01-01`:`${t}-${String(s+1).padStart(2,"0")}-01`;return{from:n,next:i}}function rn(e){if(!e)return[];let t;try{t=JSON.parse(e)}catch{return[]}return Array.isArray(t)?t.filter(a=>a&&/^\d{4}-\d{2}$/.test(String(a.key||""))&&a.enabled!==!1).map(a=>({key:String(a.key),closed:!!a.closed})).sort((a,o)=>o.key.localeCompare(a.key)):[]}function ao(){const e=new Date,t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0");return`${t}-${a}`}async function wt(){const e=$("#txq-type"),t=getSelectVal("txq-period");if(e){if(!t){e.innerHTML='<option value="">Selecciona tipo de transacción</option>',e.value="",e.disabled=!0;return}e.innerHTML='<option value="">Cargando tipos del período...</option>',e.disabled=!0;try{let a=ye.typeIdsByPeriod[t];if(!Array.isArray(a)){const s=Ba(t);if(!s){e.innerHTML='<option value="">Período inválido</option>',e.value="",e.disabled=!0;return}const n=await pb.listAll("transactions",{filter:`date>="${s.from}" && date<"${s.next}"`,fields:"tx_type_id"});a=[...new Set(n.map(i=>i.tx_type_id).filter(Boolean))],ye.typeIdsByPeriod[t]=a}const o=ye.txTypes.filter(s=>a.includes(s.id)).sort((s,n)=>`${s.prefix||""}${s.name||""}`.localeCompare(`${n.prefix||""}${n.name||""}`));if(!o.length){e.innerHTML='<option value="">Sin tipos usados en este período</option>',e.value="",e.disabled=!0;return}e.innerHTML=`<option value="">Selecciona tipo de transacción</option>${o.map(s=>`<option value="${esc(s.id)}">${esc(s.prefix)} - ${esc(s.name)}</option>`).join("")}`,e.value="",e.disabled=!1}catch(a){e.innerHTML='<option value="">Error cargando tipos</option>',e.value="",e.disabled=!0,showToast(a.message||"No se pudieron cargar los tipos del período.","error")}}}async function cn(e){var t,a,o,s,n,i;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando transacciones...</div>';try{const[r,c]=await Promise.all([API.getTxTypes(),API.getSetting("periodos_cierre")]),l=rn(c);ye={page:1,perPage:50,total:0,txTypes:r,periods:l,typeIdsByPeriod:{}},e.innerHTML=`
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
            ${r.map(p=>`<option value="${esc(p.id)}">${esc(p.prefix)} - ${esc(p.name)}</option>`).join("")}
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
      </div>`;const u=(p="")=>{const f=getSelectVal("txq-period-state"),d=$("#txq-period"),y=$("#txq-type");if(!d||!y)return;const v=ye.periods.filter(g=>f==="open"?!g.closed:f==="closed"?g.closed:!1);if(d.innerHTML=`<option value="">Selecciona un período</option>${v.map(g=>`<option value="${esc(g.key)}">${esc(g.key)} (${g.closed?"Cerrado":"Abierto"})</option>`).join("")}`,d.disabled=!f,!f||!v.length)d.value="";else{const g=p&&v.some(h=>h.key===p)?p:v[0].key;d.value=g}y.value="",y.disabled=!0},b=()=>{if(!getSelectVal("txq-period-state"))return showToast("Selecciona el estado del período (abierto/cerrado).","warning");if(!getSelectVal("txq-period"))return showToast("Selecciona un período para filtrar la consulta.","warning");if(!getSelectVal("txq-type"))return showToast("Selecciona el tipo de transacción a consultar.","warning");ye.page=1,Ue()};if((t=$("#btn-txq-search"))==null||t.addEventListener("click",b),(a=$("#txq"))==null||a.addEventListener("keydown",p=>{p.key==="Enter"&&b()}),(o=$("#txq-period-state"))==null||o.addEventListener("change",async()=>{u(),await wt()}),(s=$("#txq-period"))==null||s.addEventListener("change",async()=>{await wt()}),(n=$("#btn-txq-clear"))==null||n.addEventListener("click",async()=>{["txq"].forEach(f=>setInputVal(f,"")),["txq-type","txq-status"].forEach(f=>{const d=$(`#${f}`);d&&(d.value="")});const p=$("#txq-period-state");p&&(p.value="open"),u(ao()),await wt(),$("#ctxq-results").innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-filter mr-2"></i>Selecciona estado de período, período y tipo para consultar.</div>',$("#ctxq-pagination").style.display="none"}),(i=$("#btn-export-tx"))==null||i.addEventListener("click",ln),l.filter(p=>!p.closed).length){const p=$("#txq-period-state");p&&(p.value="open"),u(ao()),await wt()}l.length||showToast("No hay períodos configurados. Habilítalos en Cierre Contable para usar esta consulta.","warning")}catch(r){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(r.message)}</div>`}}async function Ue(){var a,o;const e=$("#ctxq-results"),t=$("#ctxq-pagination");if(e){e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const s=getInputVal("txq").trim(),n=getSelectVal("txq-period-state"),i=getSelectVal("txq-period"),r=getSelectVal("txq-type"),c=getSelectVal("txq-status");if(!n||!i||!r){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-filter mr-2"></i>Completa los filtros obligatorios para consultar.</div>',t.style.display="none";return}const l=Ba(i);if(!l){e.innerHTML='<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>Período inválido.</div>',t.style.display="none";return}const u=[],b=pb.escapeFilterValue(r);if(u.push(`tx_type_id="${b}"`),u.push(`date>="${l.from}"`),u.push(`date<"${l.next}"`),c){const v=pb.escapeFilterValue(c);u.push(`status="${v}"`)}if(s){const v=pb.escapeFilterValue(s);u.push(`(number~"${v}" || description~"${v}")`)}const m={page:ye.page,perPage:ye.perPage,sort:"-id",filter:u.join(" && ")||"",expand:"tx_type_id,third_party_id"},p=await pb.list("transactions",m);ye.total=p.totalItems;const f=Math.ceil(p.totalItems/ye.perPage)||1,d=new Map,y=p.items.map(v=>v.id).filter(Boolean);if(y.length){const v=y.map(h=>`tx_id="${pb.escapeFilterValue(h)}"`).join(" || ");(await pb.listAll("tx_lines",{filter:v})).forEach(h=>{const _=h.tx_id;d.has(_)||d.set(_,{d:0,c:0});const A=d.get(_);A.d+=Number(h.debit||0),A.c+=Number(h.credit||0)})}if(!p.items.length){e.innerHTML='<div class="p-10 text-center" style="color:#9CA3AF">No se encontraron transacciones con los filtros aplicados.</div>',t.style.display="none";return}e.innerHTML=`
      <div class="overflow-x-auto">
        <table class="data-table" id="tx-table">
          <thead><tr><th>Número</th><th>Fecha</th><th>Tercero</th><th>Descripción</th><th>Débito</th><th>Crédito</th><th>Balance</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            ${p.items.map(v=>{var A,I;const g=d.get(v.id)||{d:0,c:0},h=Math.abs(Number(g.d||0)-Number(g.c||0)),_=h<1e-4;return`
              <tr>
                <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(v.number||"")}</span></td>
                <td>${esc(v.date)}</td>
                <td>${esc(((I=(A=v.expand)==null?void 0:A.third_party_id)==null?void 0:I.name)||"—")}</td>
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
        Mostrando ${(ye.page-1)*ye.perPage+1}–${Math.min(ye.page*ye.perPage,ye.total)} de ${ye.total} registros
      </span>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" id="ctxq-prev" ${ye.page<=1?"disabled":""}><i class="fas fa-chevron-left"></i> Ant.</button>
        <span class="text-sm font-medium px-2 flex items-center">Pág. ${ye.page} / ${f}</span>
        <button class="btn btn-outline btn-sm" id="ctxq-next" ${ye.page>=f?"disabled":""}>Sig. <i class="fas fa-chevron-right"></i></button>
      </div>`,(a=$("#ctxq-prev"))==null||a.addEventListener("click",()=>{ye.page--,Ue()}),(o=$("#ctxq-next"))==null||o.addEventListener("click",()=>{ye.page++,Ue()})}catch(s){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(s.message)}</div>`}}}async function ln(){if(!can("canExport"))return showToast("Sin permisos de exportación","error");try{showToast("Generando exportación...","info");const e=getInputVal("txq").trim(),t=getSelectVal("txq-period-state"),a=getSelectVal("txq-period"),o=getSelectVal("txq-type"),s=getSelectVal("txq-status");if(!t||!a||!o)return showToast("Para exportar debes seleccionar estado de período, período y tipo.","warning");const n=Ba(a);if(!n)return showToast("Período inválido para exportación.","error");const i=[],r=pb.escapeFilterValue(o);if(i.push(`tx_type_id="${r}"`),i.push(`date>="${n.from}"`),i.push(`date<"${n.next}"`),s){const l=pb.escapeFilterValue(s);i.push(`status="${l}"`)}if(e){const l=pb.escapeFilterValue(e);i.push(`(number~"${l}" || description~"${l}")`)}const c=await pb.listAll("transactions",{sort:"-id",filter:i.join(" && ")||"",expand:"tx_type_id,third_party_id"});exportToExcel(c.map(l=>{var u,b,m,p;return{Número:l.number||"",Fecha:l.date,Tipo:((b=(u=l.expand)==null?void 0:u.tx_type_id)==null?void 0:b.name)||"",Tercero:((p=(m=l.expand)==null?void 0:m.third_party_id)==null?void 0:p.name)||"",Descripción:l.description||"",Estado:l.status==="voided"?"Anulada":"Activa"}}),`transacciones_${todayStr()}`)}catch(e){showToast(e.message,"error")}}async function uc(e){var t,a;try{const o=await pb.get("transactions",e,{expand:"tx_type_id,third_party_id,user_id"}),s=await API.getTxLines(e);openModal(`Transacción ${esc(o.number||"")}`,`
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
        <div><strong>Fecha:</strong> ${esc(o.date)}</div>
        <div><strong>Tercero:</strong> ${esc(((a=(t=o.expand)==null?void 0:t.third_party_id)==null?void 0:a.name)||"—")}</div>
        <div><strong>Estado:</strong> ${esc(o.status)}</div>
      </div>
      <p class="mb-4" style="color:#6B7280">${esc(o.description||"")}</p>
      <div class="overflow-x-auto">
        <table class="data-table"><thead><tr><th>Cuenta</th><th>Tercero línea</th><th>Doc. Cruce</th><th>Descripción</th><th>Débito</th><th>Crédito</th></tr></thead>
          <tbody>${s.map(n=>{var i,r,c,l,u,b;return`<tr><td>${esc(((r=(i=n.expand)==null?void 0:i.account_id)==null?void 0:r.code)||"")} - ${esc(((l=(c=n.expand)==null?void 0:c.account_id)==null?void 0:l.name)||"")}</td><td>${esc(((b=(u=n.expand)==null?void 0:u.third_party_id)==null?void 0:b.name)||"—")}</td><td>${n.cross_doc_ref?`<span class="badge" style="background:#EFF6FF;color:#1A4B8C"><i class="fas fa-link mr-1"></i>${esc(n.cross_doc_ref)}</span>`:"—"}</td><td>${esc(n.description||"—")}</td><td>${fmt(n.debit||0)}</td><td>${fmt(n.credit||0)}</td></tr>`}).join("")}</tbody>
        </table>
      </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       <button class="btn btn-outline" style="border-color:#334155;color:#334155" onclick="printTxNotaContable('${esc(e)}')"><i class="fas fa-print mr-1"></i>Imprimir nota contable</button>`,!0)}catch(o){showToast(o.message,"error")}}function mc(e,t){if(!can("canApprove"))return showToast("No tienes permisos para aprobar transacciones","error");confirmDialog("Aprobar transacción",`¿Confirmas aprobar la transacción <strong>${esc(t)}</strong>? Quedará <strong>Activa</strong> y se reflejará en los reportes contables.`,async()=>{try{await API.approveTx(e),showToast(`Transacción ${t} aprobada exitosamente.`,"success"),typeof Ue=="function"&&Ue()}catch(a){showToast(a.message,"error")}})}function fc(e,t){if(!requireRole("admin"))return showToast("Solo el administrador puede revertir transacciones a Borrador","error");confirmDialog("Revertir a Borrador",`¿Confirmas revertir la transacción <strong>${esc(t)}</strong> a estado <strong>Borrador</strong>? Dejará de reflejarse en los reportes hasta ser aprobada nuevamente.`,async()=>{try{await API.revertTxToDraft(e),showToast(`Transacción ${t} revertida a Borrador.`,"success"),typeof Ue=="function"&&Ue()}catch(a){showToast(a.message,"error")}})}function bc(e){if(!can("canDelete"))return showToast("No tienes permisos para anular","error");confirmDialog("Anular transacción","Esta acción cambia el estado a anulada. ¿Deseas continuar?",async()=>{try{if(typeof isPeriodClosed=="function"){const t=await pb.get("transactions",e);if(await isPeriodClosed(t.date))return showToast(`El período ${(t.date||"").slice(0,7)} no está habilitado o está cerrado. No se puede anular.`,"error")}await API.voidTransaction(e,"Anulación desde consulta"),showToast("Transacción anulada","success"),cn($("#page-content"))}catch(t){showToast(t.message,"error")}})}let ae={txId:null,accounts:[],txTypes:[],terceros:[],selectedThird:"",lines:[],postableAccountIds:new Set,accountMap:new Map};async function gc(e){var t,a;if(!can("canWrite"))return showToast("No tienes permisos para modificar transacciones","error");openModal('<i class="fas fa-spinner fa-spin mr-2"></i>Verificando transacción...','<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos...</div>',"",!0);try{const[o,s,n,i,r]=await Promise.all([pb.get("transactions",e,{expand:"tx_type_id,third_party_id"}),API.getTxLines(e),API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]);if(o.status==="voided")return openModal("No permitido",'<p class="text-sm" style="color:#374151">No se puede modificar una transacción anulada.</p>','<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>');if(typeof isPeriodClosed=="function"&&await isPeriodClosed(o.date))return openModal("Período cerrado",`<p class="text-sm" style="color:#374151">El período <strong>${esc((o.date||"").slice(0,7))}</strong> está cerrado. Habilítalo en Cierre Contable para poder modificar esta transacción.</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>');const c=await API.checkTxDependencies(e);if(c.blocks.length){const p=c.blocks.map(f=>`<li class="text-sm py-1"><i class="fas fa-ban mr-2" style="color:#EF4444"></i>${esc(f)}</li>`).join("");return openModal('<i class="fas fa-lock mr-2" style="color:#EF4444"></i>No se puede modificar',`<p class="text-sm mb-3" style="color:#374151">Esta transacción tiene dependencias que impiden su modificación:</p><ul class="space-y-1">${p}</ul>`,'<button class="btn btn-outline" onclick="closeModal()">Entendido</button>')}const l=new Set(n.map(p=>p.parent_code).filter(Boolean)),u=new Set(n.filter(p=>!l.has(p.code)).map(p=>p.id)),b=new Map(n.map(p=>[p.id,p]));ae={txId:e,accounts:n,txTypes:i,terceros:r,postableAccountIds:u,accountMap:b,selectedThird:o.third_party_id||"",lines:s.map(p=>({account_id:p.account_id,third_party_id:p.third_party_id||o.third_party_id||"",debit:p.debit||0,credit:p.credit||0,description:p.description||"",cross_doc_ref:p.cross_doc_ref||"",ret_base:"",ret_rate:"",line_order:p.line_order||0}))};const m=c.warnings.length?`<div class="mb-4 p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #D97706">${c.warnings.map(p=>`<p class="text-sm" style="color:#92400E"><i class="fas fa-triangle-exclamation mr-2"></i>${esc(p)}</p>`).join("")}</div>`:"";openModal(`<i class="fas fa-pencil mr-2" style="color:#1A4B8C"></i>Modificar — ${esc(o.number||"")}`,`${m}
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
              <input id="edit-tx-third-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre" value="${esc(Rt(r.find(p=>p.id===o.third_party_id)||null))}">
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
       <button class="btn btn-primary" onclick="saveEditTx('${esc(e)}')"><i class="fas fa-floppy-disk"></i> Guardar cambios</button>`,!0),tt(!0),Wo()}catch(o){openModal("Error",`<p class="text-sm" style="color:#EF4444">${esc(o.message)}</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>')}}function Wo(){const e=$("#edit-tx-third"),t=$("#edit-tx-third-search"),a=$("#btn-edit-cartera");!e||!a||!t||(ae&&(ae.selectedThird=e.value||ae.selectedThird||""),Go({state:ae,hiddenId:"edit-tx-third",inputId:"edit-tx-third-search",resultsId:"edit-tx-third-results",onSelected:o=>{a.disabled=!o,ae&&(ae.selectedThird=o||"")}}),a.disabled=!e.value,a.onclick=()=>Oa(e.value,{returnToPrevious:!0}))}function dn(e=null){ae.lines.push(e||{account_id:"",third_party_id:"",debit:0,credit:0,description:"",cross_doc_ref:"",ret_base:"",ret_rate:""}),tt(!0)}function vc(e){ae.lines.splice(e,1),tt(!0)}function pn(e){const t=ae.lines[e];if(!t||!(e===ae.lines.length-1))return;const o=Number(t.debit||0),s=Number(t.credit||0),n=o>0&&s<=0||s>0&&o<=0;!t.account_id||!n||dn()}function hc(e){openLineComment(e,"edit")}function un(e,t,a){if(ae.lines[e][t]=a,t==="debit"&&Number(a)>0&&(ae.lines[e].credit=0),t==="credit"&&Number(a)>0&&(ae.lines[e].debit=0),t==="account_id"){ae.lines[e].cross_doc_ref="",ae.lines[e].ret_base="";const o=ae.accountMap.get(a);if(o!=null&&o.maneja_retenciones){const s=(o.tipos_retencion||"").split(",").filter(Boolean);ae.lines[e].ret_rate=String(bt(s,o))}else ae.lines[e].ret_rate="";tt(!0)}else if(t==="ret_base"||t==="ret_rate"){const o=Number(ae.lines[e].ret_base||0),s=Number(ae.lines[e].ret_rate||0),n=document.getElementById(`edit-ret-calc-${e}`);n&&(n.textContent=o&&s?fmt(o*s/100):"$0")}else if(t==="debit"||t==="credit"){const o=t==="debit"?"credit":"debit",s=document.getElementById(`edit-tx-line-${o}-${e}`);if(s){const n=Number(a)>0;s.disabled=n,n&&(s.value="")}mn()}else tt(!1)}function yc(e){const t=ae.lines[e],a=Number(t.ret_base||0),o=ae.accountMap.get(t.account_id),s=((o==null?void 0:o.tipos_retencion)||"").split(",").filter(Boolean),n=Number(t.ret_rate||bt(s,o)||0);if(ae.lines[e].ret_rate=n?String(n):"",!a||!n)return showToast("Ingresa la base gravable para calcular la retención","warning");const i=Math.round(a*n/100);(o==null?void 0:o.nature)==="debit"?(ae.lines[e].debit=i,ae.lines[e].credit=0):(ae.lines[e].credit=i,ae.lines[e].debit=0),tt(!0),pn(e),showToast(`Retención aplicada: ${fmt(i)}`,"success")}function mn(){const e=ae.lines.reduce((o,s)=>(o.d+=Number(s.debit||0),o.c+=Number(s.credit||0),o),{d:0,c:0}),t=Math.abs(e.d-e.c)<1e-4&&e.d>0,a=document.getElementById("edit-tx-balance");a&&(a.className=`balance-indicator ${t?"balance-ok":"balance-err"}`,a.innerHTML=t?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(e.d)} = Crédito ${fmt(e.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(e.d-e.c))}`)}function tt(e=!0){if(e){const s=ae.lines.map((i,r)=>{const c=ae.accountMap.get(i.account_id),l=!!(c!=null&&c.requires_third_party),u=!!(c!=null&&c.maneja_cruce),b=!!(c!=null&&c.maneja_retenciones),m=!!String(i.description||"").trim(),p=((c==null?void 0:c.tipos_retencion)||"").split(",").filter(Boolean),f=Number(i.ret_base||0),d=Number(i.ret_rate!==""?i.ret_rate:p.length?bt(p,c):0),y=f&&d?fmt(f*d/100):"$0",v=Number(i.debit||0),g=Number(i.credit||0);return`
      <div class="tx-line-row" data-i="${r}" style="display:grid;grid-template-columns:minmax(250px,320px) minmax(260px,1fr) minmax(160px,190px) minmax(120px,140px) minmax(120px,140px) auto auto;gap:8px;align-items:center">
        <select class="form-input" style="font-size:13px" onchange="updateEditTxLine(${r}, 'account_id', this.value)">
          <option value="">Seleccione cuenta...</option>
          ${ae.accounts.map(h=>{const _=ae.postableAccountIds.has(h.id);return`<option value="${esc(h.id)}" ${i.account_id===h.id?"selected":""} ${_?"":"disabled"}>${esc(h.code)} - ${esc(h.name)}${_?"":" [MAYOR]"}</option>`}).join("")}
        </select>
        <div style="display:flex;flex-direction:column;gap:3px;min-width:0">
          <div style="display:flex;align-items:center;gap:6px">
            <i class="fas fa-user-tag" style="color:#334155;font-size:11px"></i>
            <span class="text-xs font-semibold" style="color:#334155;white-space:nowrap">Tercero línea</span>
            ${l?'<span class="text-xs" style="color:#B91C1C">Obligatorio</span>':'<span class="text-xs" style="color:#94A3B8">Opcional</span>'}
          </div>
          <div id="edit-tx-line-third-${r}-wrap" class="relative">
            <input id="edit-tx-line-third-${r}-search" class="form-input" style="font-size:13px" autocomplete="off" placeholder="Buscar tercero de la línea">
            <input id="edit-tx-line-third-${r}" type="hidden" value="${esc(i.third_party_id||"")}">
            <div id="edit-tx-line-third-${r}-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:20"></div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:3px">
          <div style="display:flex;align-items:center;gap:6px">
            <i class="fas fa-link" style="color:#1A4B8C;font-size:11px"></i>
            <span class="text-xs font-semibold" style="color:#1A4B8C;white-space:nowrap">Doc. de Cruce</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <input class="form-input" style="font-size:13px" ${u?"":"disabled"} placeholder="N° factura / documento" value="${esc(i.cross_doc_ref||"")}" oninput="updateEditTxLine(${r}, 'cross_doc_ref', this.value)">
            ${u?`<button class="btn btn-outline btn-sm" style="padding:3px 8px;font-size:11px;border-color:#1A4B8C;color:#1A4B8C;flex-shrink:0" title="Consultar cartera de este tercero" onclick="showCarteraForLine(${r}, 'edit')"><i class="fas fa-search"></i></button>`:""}
          </div>
        </div>

        <input id="edit-tx-line-debit-${r}" class="form-input text-right" ${g>0?"disabled":""} value="${i.debit?esc(i.debit):""}" placeholder="Débito" oninput="updateEditTxLine(${r}, 'debit', parseNum(this.value))" onblur="autoAppendEditTxLineFrom(${r})">
        <input id="edit-tx-line-credit-${r}" class="form-input text-right" ${v>0?"disabled":""} value="${i.credit?esc(i.credit):""}" placeholder="Crédito" oninput="updateEditTxLine(${r}, 'credit', parseNum(this.value))" onblur="autoAppendEditTxLineFrom(${r})">

        <button class="btn btn-outline btn-sm" title="Comentario por registro" style="${m?"border-color:#16A34A;color:#16A34A;background:#F0FDF4":"border-color:#64748B;color:#334155"}" onclick="editEditTxLineComment(${r})"><i class="fas fa-comment-dots"></i></button>
        <button class="btn btn-danger btn-sm" onclick="removeEditTxLine(${r})"><i class="fas fa-xmark"></i></button>
      </div>
      ${b?`
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:-2px 0 6px 0;padding:7px 10px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:0 6px 6px 0">
        <i class="fas fa-percent" style="color:#D97706;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#92400E;white-space:nowrap">Calculadora de Retención</span>
         ${p.map(h=>`<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:10px">${jo(h,c)}</span>`).join("")}
        <span class="text-xs" style="color:#92400E">Base:</span>
        <input class="form-input" style="max-width:140px;font-size:13px" type="number" min="0" step="1" placeholder="Base gravable"
               value="${esc(i.ret_base||"")}" oninput="updateEditTxLine(${r}, 'ret_base', this.value)">
        <span class="text-xs" style="color:#92400E">×</span>
         <span class="badge" style="background:#FDE68A;color:#92400E;font-size:11px">${esc(d)}%</span>
        <span id="edit-ret-calc-${r}" class="text-sm font-bold" style="color:#D97706;min-width:70px">${y}</span>
        <button class="btn btn-sm" style="background:#D97706;color:#fff;padding:4px 10px;font-size:12px" onclick="applyEditRetentionCalc(${r})">
          <i class="fas fa-check"></i> Aplicar
        </button>
      </div>`:""}`}).join(""),n=document.getElementById("edit-tx-lines");n&&(n.innerHTML=s||'<p style="color:#9CA3AF">Agrega al menos una línea.</p>'),zo("edit")}const t=ae.lines.reduce((s,n)=>(s.d+=Number(n.debit||0),s.c+=Number(n.credit||0),s),{d:0,c:0}),a=Math.abs(t.d-t.c)<1e-4&&t.d>0,o=document.getElementById("edit-tx-balance");o&&(o.className=`balance-indicator ${a?"balance-ok":"balance-err"}`,o.innerHTML=a?`<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(t.d)} = Crédito ${fmt(t.c)}`:`<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(t.d-t.c))}`)}async function _c(e){var l,u,b,m;if(!can("canWrite"))return showToast("No tienes permisos para modificar transacciones","error");const t=((l=document.getElementById("edit-tx-date"))==null?void 0:l.value)||"",a=(((u=document.getElementById("edit-tx-desc"))==null?void 0:u.value)||"").trim(),o=((b=document.getElementById("edit-tx-third"))==null?void 0:b.value)||ae.selectedThird||"";if(!t)return showToast("La fecha es obligatoria","warning");if(!a)return showToast("La descripción es obligatoria","warning");const s=ae.lines.filter(p=>p.account_id&&(Number(p.debit)>0||Number(p.credit)>0));if(s.length<2)return showToast("Se requieren al menos 2 líneas contables","warning");const n=s.find(p=>!ae.postableAccountIds.has(p.account_id));if(n){const p=ae.accounts.find(f=>f.id===n.account_id);return showToast(`La cuenta ${(p==null?void 0:p.code)||""} es de mayor; usa una cuenta auxiliar`,"error")}const i=s.find(p=>{const f=ae.accounts.find(d=>d.id===p.account_id);return!!(f!=null&&f.requires_third_party)&&!(p.third_party_id||o)});if(i){const p=ae.lines.indexOf(i);return showToast(`La línea ${p+1} requiere tercero. Selecciónalo en la línea o en el encabezado.`,"error")}const r=s.reduce((p,f)=>({d:p.d+Number(f.debit||0),c:p.c+Number(f.credit||0)}),{d:0,c:0});if(Math.abs(r.d-r.c)>1e-4||r.d<=0)return showToast("La transacción no está cuadrada","error");if(typeof isPeriodClosed=="function"&&await isPeriodClosed(t))return showToast(`El período ${t.slice(0,7)} está cerrado. No se puede modificar.`,"error");const c=document.querySelector("#modal-footer .btn-primary");c&&(c.disabled=!0,c.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{await API.updateTransaction(e,{date:t,description:a,third_party_id:o||null,payment_days:parseInt((m=document.getElementById("edit-tx-payment-days"))==null?void 0:m.value,10)||0},s.map((p,f)=>({account_id:p.account_id,third_party_id:p.third_party_id||o||null,debit:Number(p.debit||0),credit:Number(p.credit||0),description:p.description||a,line_order:f+1,cross_doc_ref:p.cross_doc_ref||""}))),closeModal(),showToast("Transacción modificada exitosamente","success"),Ue()}catch(p){c&&(c.disabled=!1,c.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar cambios'),showToast(p.message,"error")}}function xc(e,t){if(!requireRole("admin"))return showToast("Solo el administrador puede eliminar transacciones físicamente","error");openModal('<i class="fas fa-spinner fa-spin mr-2"></i>Verificando dependencias...','<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Analizando...</div>',"",!1),API.checkTxDependencies(e).then(a=>{if(a.blocks.length){const s=a.blocks.map(n=>`<li class="text-sm py-1"><i class="fas fa-ban mr-2" style="color:#EF4444"></i>${esc(n)}</li>`).join("");return openModal('<i class="fas fa-lock mr-2" style="color:#EF4444"></i>No se puede eliminar',`<p class="text-sm mb-3" style="color:#374151">Esta transacción no puede eliminarse por las siguientes razones:</p>
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
       </button>`)}).catch(a=>{openModal("Error",`<p class="text-sm" style="color:#EF4444">${esc(a.message)}</p>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>')})}async function Ac(e,t){var s;if((((s=document.getElementById("delete-tx-confirm-input"))==null?void 0:s.value)||"").trim()!==t)return showToast(`Escribe exactamente: ${t}`,"warning");const o=document.getElementById("btn-confirm-delete-tx");o&&(o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Eliminando...');try{await pb.delete("transactions",e),await API.logAudit("DELETE","transactions",e,`Eliminación física del comprobante ${t}`),closeModal(),showToast(`Comprobante ${t} eliminado permanentemente`,"success"),Ue()}catch(n){o&&(o.disabled=!1,o.innerHTML='<i class="fas fa-trash"></i> Eliminar definitivamente'),showToast(n.message,"error")}}async function $c(e){var t,a,o,s,n,i,r,c,l,u,b;try{const[m,p,f,d,y]=await Promise.all([pb.get("transactions",e,{expand:"tx_type_id,third_party_id,user_id"}),API.getTxLines(e),API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>"")]),v=p.reduce((C,N)=>C+Number(N.debit||0),0),g=p.reduce((C,N)=>C+Number(N.credit||0),0),h=((a=(t=m.expand)==null?void 0:t.tx_type_id)==null?void 0:a.name)||((s=(o=m.expand)==null?void 0:o.tx_type_id)==null?void 0:s.prefix)||"",_=((i=(n=m.expand)==null?void 0:n.third_party_id)==null?void 0:i.name)||"",A=((c=(r=m.expand)==null?void 0:r.third_party_id)==null?void 0:c.doc_number)||"",I=((u=(l=m.expand)==null?void 0:l.user_id)==null?void 0:u.name)||"",F=((b=pb.currentUser)==null?void 0:b.name)||"",S=p.map((C,N)=>{var K,H,w,P,V,U;const L=((H=(K=C.expand)==null?void 0:K.account_id)==null?void 0:H.code)||"",O=((P=(w=C.expand)==null?void 0:w.account_id)==null?void 0:P.name)||"",M=((U=(V=C.expand)==null?void 0:V.third_party_id)==null?void 0:U.name)||_||"—",B=C.cross_doc_ref||"",j=Number(C.debit||0),Y=Number(C.credit||0),W=j>0;return`
        <tr class="${N%2===0?"row-even":"row-odd"}">
          <td class="col-num">${N+1}</td>
          <td class="col-code">${esc(L)}</td>
          <td class="col-acct">${esc(O)}</td>
          <td class="col-third">${esc(M)}</td>
          <td class="col-cross">${B?esc(B):""}</td>
          <td class="col-desc">${esc(C.description||m.description||"")}</td>
          <td class="col-money debit">${W?fmt(j):""}</td>
          <td class="col-money credit">${W?"":fmt(Y)}</td>
        </tr>`}).join(""),x=new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"}),T=`<!DOCTYPE html>
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
      <div class="company-name">${esc(f||"GRAVY")}</div>
      ${d?`<div class="company-sub">NIT: ${esc(d)}</div>`:""}
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
      <span class="meta-value">${esc(F||"—")}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Concepto:</span>
      <span class="meta-value">${esc(m.description||"—")}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Fecha impresión:</span>
      <span class="meta-value">${x}</span>
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
    <tbody>${S}</tbody>
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
      <div style="margin-bottom:32px;font-weight:500;color:#111">${esc(I)}</div>
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
</html>`,E=window.open("","_blank","width=900,height=700,scrollbars=yes");if(!E)return showToast("El navegador bloqueó la ventana emergente. Permite ventanas emergentes para imprimir.","warning");E.document.open(),E.document.write(T),E.document.close()}catch(m){showToast("Error al generar la nota contable: "+m.message,"error")}}async function wc(e){return en(e)}window.TX_EDIT_STATE=ae;window.editEditTxLineComment=hc;window.renderNuevaTx=en;window.getCrossAutoMode=sn;window.loadConsultaTxPage=Ue;window.RET_RATE_FIELD_BY_TYPE=Vo;window.addEditTxLine=dn;window.bindNewTxModalEvents=Ra;window.updateEditTxLine=un;window.editTxLineComment=cc;window._confirmDeleteTx=Ac;window.exportConsultaTx=ln;window.buildTxTypeOptions=qo;window.closeCarteraModal=ya;window.updateTypeOptionsForPeriod=wt;window.renderThirdSearchResults=Ho;window.CTXQ_STATE=ye;window.seeTxDetail=uc;window.editTx=gc;window.useCrossDoc=pc;window.applyCrossAmountByType=to;window.saveEditTx=_c;window.bindEditCarteraEvents=Wo;window.revertTxToDraft=fc;window.getThirdById=ta;window.applyRetentionCalc=lc;window._carteraSetContent=_a;window.showCarteraForLine=dc;window.calcPeriodRange=Ba;window.approveTx=mc;window.currentPeriodKey=ao;window.RET_DEFAULT_RATES=qt;window.CARTERA_MODAL_PREV=St;window.voidTx=bc;window.updateTxBalance=on;window.autoAppendTxLineFrom=tn;window.renderTxLines=ut;window.initThirdSearchInput=Go;window.autoAppendEditTxLineFrom=pn;window.CARTERA_TARGET_LINE=Nt;window.renderEditTxLines=tt;window.TX_STATE=ce;window.addTxLine=pt;window.bindTxLineThirdSearches=zo;window.retRateLabel=jo;window.removeTxLine=rc;window.openNuevaTxModal=ic;window.initLineThirdSearchInput=Xs;window.updateTxLine=an;window.CARTERA_CONTEXT=ka;window.removeEditTxLine=vc;window.updateEditTxBalance=mn;window.retLabel=Zs;window.refreshConsecutive=Da;window.saveTransaction=nn;window.renderConsultaTx=cn;window.normalizeConsultaPeriods=rn;window.showCarteraModal=Oa;window.applyEditRetentionCalc=yc;window.defaultRetRate=bt;window.deleteTxPhysical=xc;window.thirdDisplay=Rt;window.printTxNotaContable=$c;window.renderTransacciones=wc;let Ee={accounts:null,saldos:null,transactions:null,txLines:null,thirdParties:null};async function Ec(e){var t,a,o,s,n,i,r,c;e.innerHTML=`
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Reportes Financieros</h3>
        <p class="text-sm" style="color:#6B7280">Selecciona el reporte a generar. Se carga solo bajo demanda.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5" id="report-cards">
      ${We("trial","Balance de Prueba","Saldos débitos y créditos por cuenta.")}
      ${We("income","Estado de Resultados","Ingresos, gastos y utilidad neta.")}
      ${We("position","Estado de Situación Financiera","Activos, pasivos y patrimonio (Balance General).")}
      ${We("journal","Libro Diario","Detalle cronológico de movimientos contables.")}
      ${We("aux","Libro Auxiliar","Movimientos por Cuenta y Tercero o Tercero y Cuenta.")}
      ${We("ar-bal","Saldos Cuentas por Cobrar","Pendientes por tercero y cuenta de cartera.")}
      ${We("ap-bal","Saldos Cuentas por Pagar","Pendientes por tercero y cuenta por pagar.")}
      ${We("aging","Cartera por Edades","Tramos 0-30-60-90+ para clientes o proveedores.")}
    </div>`,(t=$("#btn-report-trial"))==null||t.addEventListener("click",()=>qe("Balance de Prueba",()=>yn())),(a=$("#btn-report-income"))==null||a.addEventListener("click",()=>qe("Estado de Resultados",()=>xn())),(o=$("#btn-report-position"))==null||o.addEventListener("click",()=>qe("Estado de Situación Financiera",()=>An())),(s=$("#btn-report-journal"))==null||s.addEventListener("click",()=>qe("Libro Diario",()=>$n())),(n=$("#btn-report-aux"))==null||n.addEventListener("click",()=>qe("Libro Auxiliar",()=>wn())),(i=$("#btn-report-ar-bal"))==null||i.addEventListener("click",()=>qe("Saldos Cuentas por Cobrar",()=>oo("cxc"))),(r=$("#btn-report-ap-bal"))==null||r.addEventListener("click",()=>qe("Saldos Cuentas por Pagar",()=>oo("cxp"))),(c=$("#btn-report-aging"))==null||c.addEventListener("click",()=>qe("Cartera por Edades",()=>hn()))}function st(){return $("#report-view-modal")||$("#report-view")}function qe(e,t){openModal(`<i class="fas fa-chart-column mr-2" style="color:#1A4B8C"></i>${esc(e)}`,'<div id="report-view-modal" class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando reporte...</div>','<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0),setTimeout(()=>{t()},0)}function We(e,t,a){return`
    <div class="bg-white rounded-2xl border p-4" style="border-color:#F0F0F0">
      <h4 class="font-bold mb-1" style="color:#0D2137">${esc(t)}</h4>
      <p class="text-sm mb-3" style="color:#6B7280">${esc(a)}</p>
      <button class="btn btn-primary btn-sm" id="btn-report-${esc(e)}"><i class="fas fa-play"></i> Generar</button>
    </div>`}async function nt(){if(!Ee.accounts||!Ee.saldos){const[e,t]=await Promise.all([API.getAccounts(!1),API.getAccountSaldos()]);Ee.accounts=e,Ee.saldos=t}return{accounts:Ee.accounts,saldos:Ee.saldos}}async function it(){if(!Ee.transactions||!Ee.txLines||!Ee.thirdParties){const[e,t,a]=await Promise.all([pb.listAll("transactions",{sort:"-id",expand:"tx_type_id,third_party_id",filter:'status="active"'}),pb.listAll("tx_lines",{sort:"id",expand:"account_id,tx_id"}),pb.listAll("third_parties",{sort:"name"})]);Ee.transactions=e,Ee.txLines=t,Ee.thirdParties=a}return{transactions:Ee.transactions,txLines:Ee.txLines,thirdParties:Ee.thirdParties}}function Cc(e,t){const a={1:0,2:0,3:0,4:0,5:0,6:0,7:0};for(const o of e){const s=(o.code||"").charAt(0);a[s]=(a[s]||0)+Number(t[o.id]||0)}return a}async function $e(e,t=""){for(const a of e)try{const o=await API.getSetting(a);if(o)return o}catch{}return t}function Et(e){const t=Number(e||0);return t<0?{text:`(${fmt(Math.abs(t))})`,isNegative:!0}:{text:fmt(t),isNegative:!1}}function Ye(e){const t=Number(e||0);return t<0?`-${fmt(Math.abs(t))}`:fmt(t)}function De(e){const t=Number(e||0),a=Et(t);return t<0?{text:a.text,color:"#B91C1C"}:t>0?{text:a.text,color:"#166534"}:{text:a.text,color:"#6B7280"}}function gt(){var t;const e=(t=window.jspdf)==null?void 0:t.jsPDF;return typeof e!="function"?(showToast("No se pudo inicializar el generador PDF.","error"),null):e}function be(e){return Number(e||0).toLocaleString("es-CO",{minimumFractionDigits:2,maximumFractionDigits:2})}function le(e){const t=Number(e||0),a=be(Math.abs(t));return t<0?`-${a}`:a}async function vt(){const[e,t,a,o,s,n]=await Promise.all([API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>""),API.getSetting("company_city").catch(()=>""),API.getSetting("company_country").catch(()=>""),API.getSetting("software_name").catch(()=>"")]);return{companyName:String(e||"EMPRESA").trim(),companyNit:String(t||"N/A").trim(),companyAddress:[a,o,s].map(i=>String(i||"").trim()).filter(Boolean).join(" / ")||"Direccion no configurada",softwareName:String(n||"GRAVY v2.0").trim(),userName:String(sessionStorage.getItem("user_name")||"Usuario").trim(),generatedAt:new Date().toLocaleString("es-CO")}}function ht(e,t,a){const o=e.internal.pageSize.getWidth(),s=24,n=o-24,i=String((a==null?void 0:a.title)||"").trim(),r=Array.isArray(a==null?void 0:a.subtitles)?a.subtitles:[];return e.setFont("helvetica","bold"),e.setFontSize(10),e.setTextColor(13,33,55),e.text(t.companyName,s,20),e.setFont("helvetica","normal"),e.setFontSize(8),e.setTextColor(100,100,100),e.text(`NIT: ${t.companyNit}`,s,30),e.text(t.companyAddress,s,40),e.setFont("helvetica","bold"),e.setFontSize(11),e.setTextColor(13,33,55),e.text(i,o/2,20,{align:"center"}),e.setFont("helvetica","normal"),e.setFontSize(8),e.setTextColor(80,80,80),r.slice(0,3).forEach((c,l)=>{e.text(String(c||""),o/2,30+l*10,{align:"center"})}),e.setFont("helvetica","normal"),e.setFontSize(8),e.setTextColor(100,100,100),e.text(t.softwareName,n,20,{align:"right"}),e.text(`Usuario: ${t.userName}`,n,30,{align:"right"}),e.text(`Impreso: ${t.generatedAt}`,n,40,{align:"right"}),e.setDrawColor(180,180,180),e.setLineWidth(.5),e.line(s,58,n,58),{marginLeft:s,marginRight:n,startY:66}}function yt(e,t){const a=e.internal.pageSize.getWidth(),o=e.internal.pageSize.getHeight();e.setFont("helvetica","normal"),e.setFontSize(7),e.setTextColor(120,120,120),e.text("Reporte generado por GRAVY",24,o-10),e.text(`Pagina ${t}`,a-24,o-10,{align:"right"})}function fn(e,t){const a=new Date(`${e}T00:00:00`),o=new Date(`${t}T00:00:00`);if(Number.isNaN(a.getTime())||Number.isNaN(o.getTime()))return 0;const s=o.getTime()-a.getTime();return Math.max(0,Math.floor(s/864e5))}function bn(e,t){const a=new Date(`${e}T00:00:00`),o=new Date(`${t}T00:00:00`);return Number.isNaN(a.getTime())||Number.isNaN(o.getTime())?0:Math.floor((o.getTime()-a.getTime())/864e5)}function gn(e,t){const a=new Date(`${e}T00:00:00`);return a.setDate(a.getDate()+Number(t||0)),a.toISOString().slice(0,10)}function vn(e){return e<0?"por_vencer":e<=30?"b0_30":e<=60?"b31_60":e<=90?"b61_90":"b90p"}async function Yo({mode:e="cxc",asOfDate:t=todayStr(),thirdType:a=""}={}){var f,d,y;const[{accounts:o},{transactions:s,txLines:n,thirdParties:i}]=await Promise.all([nt(),it()]),r=new Map(s.map(v=>[v.id,v])),c=new Map(i.map(v=>[v.id,v])),l=new Map(o.map(v=>[v.id,v])),u=new Map,b=String(a||"").trim().toUpperCase();for(const v of n){const g=r.get(v.tx_id);if(!g||g.status!=="active"||!g.date||String(g.date)>t)continue;const h=((f=v.expand)==null?void 0:f.account_id)||l.get(v.account_id);if(!h||!h.maneja_cruce)continue;const _=String(h.nature||"").toLowerCase();if(e==="cxc"&&_!=="debit"||e==="cxp"&&_!=="credit")continue;const A=v.third_party_id||g.third_party_id||"NO_TERCERO",I=c.get(A),F=String((I==null?void 0:I.type)||"").toUpperCase();if(b&&F!==b)continue;const S=(v.cross_doc_ref||"").trim()||"SIN_DOC",x=`${h.id}|${A}|${S}`;u.has(x)||u.set(x,{account_id:h.id,account_code:h.code||"",account_name:h.name||"",nature:_,third_id:A,third_name:(I==null?void 0:I.name)||((y=(d=g.expand)==null?void 0:d.third_party_id)==null?void 0:y.name)||"Sin tercero",third_doc:(I==null?void 0:I.doc_number)||"",third_type:F||"OTRO",doc_ref:S,doc_date:g.date,payment_days:Number(g.payment_days||0),debit:0,credit:0});const T=u.get(x);String(g.date)<String(T.doc_date)&&(T.doc_date=g.date,T.payment_days=Number(g.payment_days||0)),T.debit+=Number(v.debit||0),T.credit+=Number(v.credit||0)}const m=1e-4,p=[];return u.forEach(v=>{const g=v.nature==="debit"?Number(v.debit||0)-Number(v.credit||0):Number(v.credit||0)-Number(v.debit||0);if(g<=m)return;const h=fn(v.doc_date,t),_=gn(v.doc_date,v.payment_days||0),A=bn(_,t);p.push({...v,open:g,days:h,due_date:_,expired_days:A,bucket:vn(A)})}),p.sort((v,g)=>{const h=`${v.third_name}|${v.account_code}|${v.doc_date}|${v.doc_ref}`,_=`${g.third_name}|${g.account_code}|${g.doc_date}|${g.doc_ref}`;return h.localeCompare(_)}),p}async function oo(e){var l,u,b;const t=st();if(!t)return;const a=e==="cxc",o=a?"Saldos de Cuentas por Cobrar":"Saldos de Cuentas por Pagar",s=a?"CLIENTE":"PROVEEDOR",n=a?"clientes":"proveedores";t.innerHTML=`
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
    </div>`;let i=[],r=[];const c=async()=>{const m=$("#bal-results");if(!m)return;const p=getInputVal("bal-cutoff"),f=getSelectVal("bal-third-type");if(!p)return showToast("Selecciona la fecha de corte.","warning");m.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando reporte...</div>';try{const d=await Yo({mode:e,asOfDate:p,thirdType:f});if(!d.length){m.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">No hay saldos abiertos para los filtros seleccionados.</div>',i=[],r=[],$("#btn-exp-bal")&&($("#btn-exp-bal").disabled=!0),$("#btn-pdf-bal")&&($("#btn-pdf-bal").disabled=!0);return}const y=new Map;for(const _ of d){const A=`${_.third_id}|${_.account_id}`;y.has(A)||y.set(A,{third_name:_.third_name,third_doc:_.third_doc,third_type:_.third_type,account_code:_.account_code,account_name:_.account_name,docs_count:0,open_total:0,max_days:0});const I=y.get(A);I.docs_count+=1,I.open_total+=Number(_.open||0),I.max_days=Math.max(I.max_days,Number(_.days||0))}const v=[...y.values()].sort((_,A)=>{const I=`${_.third_name}|${_.account_code}`,F=`${A.third_name}|${A.account_code}`;return I.localeCompare(F)}),g=v.reduce((_,A)=>_+Number(A.open_total||0),0),h=v.reduce((_,A)=>_+Number(A.docs_count||0),0);m.innerHTML=`
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
        </div>`,i=v.map(_=>({tercero:_.third_name,documento:_.third_doc,tipo_tercero:_.third_type,cuenta_codigo:_.account_code,cuenta_nombre:_.account_name,documentos:_.docs_count,antiguedad_max_dias:_.max_days,saldo_abierto:_.open_total})),r=v.map(_=>({..._})),$("#btn-exp-bal")&&($("#btn-exp-bal").disabled=!i.length),$("#btn-pdf-bal")&&($("#btn-pdf-bal").disabled=!r.length)}catch(d){m.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(d.message)}</div>`,i=[],r=[],$("#btn-exp-bal")&&($("#btn-exp-bal").disabled=!0),$("#btn-pdf-bal")&&($("#btn-pdf-bal").disabled=!0)}};(l=$("#btn-gen-bal"))==null||l.addEventListener("click",c),(u=$("#btn-exp-bal"))==null||u.addEventListener("click",()=>{i.length&&exportToExcel(i,[{key:"tercero",label:"Tercero"},{key:"documento",label:"Documento"},{key:"cuenta_codigo",label:"Código cuenta"},{key:"cuenta_nombre",label:"Nombre cuenta"},{key:"documentos",label:"# Documentos"},{key:"antiguedad_max_dias",label:"Antigüedad máx. (días)"},{key:"saldo_abierto",label:"Saldo abierto"}],e==="cxc"?"saldos_cuentas_por_cobrar":"saldos_cuentas_por_pagar")}),(b=$("#btn-pdf-bal"))==null||b.addEventListener("click",async()=>{if(r.length)try{const m=gt();if(!m)return;const p=getInputVal("bal-cutoff")||todayStr(),f=getSelectVal("bal-third-type")||"TODOS",d=await vt(),y=new m({orientation:"portrait",unit:"pt",format:"letter"}),v=ht(y,d,{title:o,subtitles:[`Corte: ${p}`,`Tipo de tercero: ${f}`]}),g=r.reduce((A,I)=>A+Number(I.open_total||0),0),h=r.reduce((A,I)=>A+Number(I.docs_count||0),0),_=r.map(A=>[A.third_doc?`${A.third_doc} - ${A.third_name}`:A.third_name,`${A.account_code} - ${A.account_name}`.trim(),fmtN(A.docs_count),fmtN(A.max_days),be(A.open_total||0)]);_.push(["TOTAL","",fmtN(h),"",be(g)]),y.autoTable({startY:v.startY,head:[["Tercero","Cuenta","# Docs","Antiguedad max. (dias)","Saldo abierto"]],body:_,theme:"plain",margin:{top:v.startY,left:v.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.2,textColor:[55,55,55],cellPadding:2.4,lineWidth:0,overflow:"linebreak"},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:7.3,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:170},1:{cellWidth:195},2:{cellWidth:56,halign:"right"},3:{cellWidth:63,halign:"right"},4:{cellWidth:80,halign:"right"}},didParseCell:A=>{if(A.section!=="body")return;A.row.index===_.length-1&&(A.cell.styles.fontStyle="bold",A.cell.styles.fillColor=[236,236,236],A.cell.styles.textColor=[13,33,55],A.cell.styles.lineWidth={top:.2},A.cell.styles.lineColor=[13,33,55])},didDrawPage:A=>yt(y,A.pageNumber)}),y.save(`${e==="cxc"?"saldos_cuentas_por_cobrar":"saldos_cuentas_por_pagar"}_${p}.pdf`)}catch(m){showToast(`Error al generar PDF: ${m.message}`,"error")}})}async function hn(){var l,u,b,m;const e=st();if(!e)return;const{accounts:t}=await nt(),a=t.filter(p=>p.maneja_cruce).sort((p,f)=>(p.code||"").localeCompare(f.code||"")),o=a.map(p=>`<option value="${esc(p.id)}">${esc(p.code)} - ${esc(p.name)}</option>`).join("");e.innerHTML=`
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
    </div>`;const s=()=>{const p=getSelectVal("age-mode"),f=$("#age-third-type");f&&(!f.value||f.value==="CLIENTE"||f.value==="PROVEEDOR")&&(f.value=p==="cxc"?"CLIENTE":"PROVEEDOR")};(l=$("#age-mode"))==null||l.addEventListener("change",s);let n=[],i=[],r={};const c=async()=>{const p=$("#aging-results");if(!p)return;const f=getInputVal("age-cutoff"),d=getSelectVal("age-mode")||"cxc",y=getSelectVal("age-third-type"),v=getSelectVal("age-account");if(!f)return showToast("Selecciona la fecha de corte.","warning");p.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Calculando cartera por edades...</div>';try{const g=await Yo({mode:d,asOfDate:f,thirdType:y}),h=v?g.filter(E=>E.account_id===v):g;if(!h.length){p.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">No hay cartera abierta para los filtros seleccionados.</div>',n=[],i=[],$("#btn-exp-aging")&&($("#btn-exp-aging").disabled=!0),$("#btn-pdf-aging")&&($("#btn-pdf-aging").disabled=!0);return}const _=v?a.find(E=>E.id===v):null,A=_?`${_.code} - ${_.name}`:"Todas las cuentas",I=h.map(E=>({tercero:E.third_name,documento_tercero:E.third_doc,cuenta_id:E.account_id,cuenta:`${E.account_code} - ${E.account_name}`.trim(),cuenta_code:E.account_code,documento_cruce:E.doc_ref,fecha_documento:E.doc_date,plazo_dias:Number(E.payment_days||0),vencimiento:E.due_date,expired_days:Number(E.expired_days||0),por_vencer:E.bucket==="por_vencer"?Number(E.open||0):0,de_0_a_30:E.bucket==="b0_30"?Number(E.open||0):0,de_31_a_60:E.bucket==="b31_60"?Number(E.open||0):0,de_61_a_90:E.bucket==="b61_90"?Number(E.open||0):0,mayor_a_90:E.bucket==="b90p"?Number(E.open||0):0,total:Number(E.open||0)})).sort((E,C)=>{const N=`${E.cuenta_code}|${E.tercero}|${E.fecha_documento}|${E.documento_cruce}`,L=`${C.cuenta_code}|${C.tercero}|${C.fecha_documento}|${C.documento_cruce}`;return N.localeCompare(L)}),F=I.reduce((E,C)=>(E.por_vencer+=C.por_vencer,E.de_0_a_30+=C.de_0_a_30,E.de_31_a_60+=C.de_31_a_60,E.de_61_a_90+=C.de_61_a_90,E.mayor_a_90+=C.mayor_a_90,E.total+=C.total,E),{por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0}),S=d==="cxc"?"Clientes (CxC)":"Proveedores (CxP)",x=new Map;for(const E of I)x.has(E.cuenta)||x.set(E.cuenta,[]),x.get(E.cuenta).push(E);const T=[];for(const[E,C]of x){v||T.push(`<tr style="background:#F0F4F8">
            <td colspan="11" style="font-weight:600;padding:5px 10px;font-size:12px;color:#0D2137;border-top:1px solid #D1D5DB">
              <i class="fas fa-bookmark mr-1" style="color:#E87D1E"></i>${esc(E)}
            </td>
          </tr>`);for(const N of C){const L=N.expired_days<0?"#059669":N.expired_days<=30?"#D97706":"#EF4444";T.push(`<tr>
            <td>${esc(N.documento_tercero?`${N.documento_tercero} - ${N.tercero}`:N.tercero)}</td>
            <td><span class="font-mono">${esc(N.documento_cruce)}</span></td>
            <td>${esc(N.fecha_documento)}</td>
            <td style="text-align:right">${fmtN(N.plazo_dias)}</td>
            <td>${esc(N.vencimiento)}</td>
            <td style="color:${L};font-weight:${N.por_vencer>0?"600":"400"}">${fmt(N.por_vencer)}</td>
            <td>${fmt(N.de_0_a_30)}</td>
            <td>${fmt(N.de_31_a_60)}</td>
            <td>${fmt(N.de_61_a_90)}</td>
            <td>${fmt(N.mayor_a_90)}</td>
            <td class="font-semibold" style="color:#0D2137">${fmt(N.total)}</td>
          </tr>`)}}p.innerHTML=`
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Cartera: <strong>${esc(S)}</strong> · Cuenta: <strong>${esc(A)}</strong> · Documentos: <strong>${fmtN(I.length)}</strong> · Total: <strong>${fmt(F.total)}</strong></p>
        </div>
        <div class="overflow-x-auto" style="max-height:480px">
          <table class="data-table">
            <thead><tr>
              <th>Tercero</th><th>Doc. Cruce</th><th>Fecha Doc.</th>
              <th style="text-align:right">Plazo</th><th>Vencimiento</th>
              <th>Por Vencer</th><th>0-30 días</th><th>31-60 días</th><th>61-90 días</th><th>Más de 90</th><th>Total</th>
            </tr></thead>
            <tbody>${T.join("")}</tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="font-bold">Total general</td>
                <td class="font-bold" style="color:#059669">${fmt(F.por_vencer)}</td>
                <td class="font-bold">${fmt(F.de_0_a_30)}</td>
                <td class="font-bold">${fmt(F.de_31_a_60)}</td>
                <td class="font-bold">${fmt(F.de_61_a_90)}</td>
                <td class="font-bold">${fmt(F.mayor_a_90)}</td>
                <td class="font-bold">${fmt(F.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`,n=I.map(E=>({...E})),i=I.map(E=>({...E})),r={asOfDate:f,mode:d,thirdType:y,accountLabel:A,carteraLabel:S},$("#btn-exp-aging")&&($("#btn-exp-aging").disabled=!n.length),$("#btn-pdf-aging")&&($("#btn-pdf-aging").disabled=!i.length)}catch(g){p.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(g.message)}</div>`,n=[],i=[],$("#btn-exp-aging")&&($("#btn-exp-aging").disabled=!0),$("#btn-pdf-aging")&&($("#btn-pdf-aging").disabled=!0)}};(u=$("#btn-gen-aging"))==null||u.addEventListener("click",c),(b=$("#btn-exp-aging"))==null||b.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"tercero",label:"Tercero"},{key:"documento_tercero",label:"Documento tercero"},{key:"cuenta",label:"Cuenta"},{key:"documento_cruce",label:"Doc. Cruce"},{key:"fecha_documento",label:"Fecha documento"},{key:"plazo_dias",label:"Plazo (días)"},{key:"vencimiento",label:"Vencimiento"},{key:"por_vencer",label:"Por Vencer"},{key:"de_0_a_30",label:"0-30 días"},{key:"de_31_a_60",label:"31-60 días"},{key:"de_61_a_90",label:"61-90 días"},{key:"mayor_a_90",label:"Más de 90 días"},{key:"total",label:"Total"}],`cartera_por_edades_${r.mode||"cxc"}`)}),(m=$("#btn-pdf-aging"))==null||m.addEventListener("click",async()=>{if(i.length)try{const p=gt();if(!p)return;const{asOfDate:f,thirdType:d,accountLabel:y,carteraLabel:v}=r,g=i.reduce((C,N)=>(C.por_vencer+=Number(N.por_vencer||0),C.de_0_a_30+=Number(N.de_0_a_30||0),C.de_31_a_60+=Number(N.de_31_a_60||0),C.de_61_a_90+=Number(N.de_61_a_90||0),C.mayor_a_90+=Number(N.mayor_a_90||0),C.total+=Number(N.total||0),C),{por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0}),h=await vt(),_=new p({orientation:"portrait",unit:"pt",format:"letter"}),A=ht(_,h,{title:"Cartera por Edades",subtitles:[`Corte: ${f}`,`Cartera: ${v}`,`Cuenta: ${y}`,`Tipo de tercero: ${d||"Todos"}`]}),I=[],F=new Map;for(const C of i)F.has(C.cuenta)||F.set(C.cuenta,[]),F.get(C.cuenta).push(C);const S=new Set;let x=0;const T=F.size>1;for(const[C,N]of F){T&&(I.push([{content:C,colSpan:11,styles:{fontStyle:"bold",fillColor:[235,240,248],textColor:[13,33,55]}}]),S.add(x++));for(const L of N)I.push([L.documento_tercero?`${L.documento_tercero} - ${L.tercero}`:L.tercero,L.documento_cruce,L.fecha_documento,String(L.plazo_dias||0),L.vencimiento,be(L.por_vencer),be(L.de_0_a_30),be(L.de_31_a_60),be(L.de_61_a_90),be(L.mayor_a_90),be(L.total)]),x++}I.push(["TOTAL","","","","",be(g.por_vencer),be(g.de_0_a_30),be(g.de_31_a_60),be(g.de_61_a_90),be(g.mayor_a_90),be(g.total)]);const E=x;_.autoTable({startY:A.startY,head:[["Tercero","Cruce","Fecha","Plazo","Vencimiento","Por Vencer","0-30","31-60","61-90",">90","Total"]],body:I,theme:"plain",margin:{top:A.startY,left:A.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:6.5,textColor:[55,55,55],cellPadding:2,lineWidth:0,overflow:"linebreak"},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:6.7,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:116},1:{cellWidth:48},2:{cellWidth:46},3:{cellWidth:28,halign:"right"},4:{cellWidth:50},5:{cellWidth:48,halign:"right"},6:{cellWidth:42,halign:"right"},7:{cellWidth:42,halign:"right"},8:{cellWidth:42,halign:"right"},9:{cellWidth:42,halign:"right"},10:{cellWidth:50,halign:"right"}},didParseCell:C=>{C.section==="body"&&C.row.index===E&&(C.cell.styles.fontStyle="bold",C.cell.styles.fillColor=[236,236,236],C.cell.styles.textColor=[13,33,55],C.cell.styles.lineWidth={top:.2},C.cell.styles.lineColor=[13,33,55])},didDrawPage:C=>yt(_,C.pageNumber)}),_.save(`cartera_por_edades_${r.mode||"cxc"}_${f}.pdf`)}catch(p){showToast(`Error al generar PDF: ${p.message}`,"error")}})}async function yn(){var c,l,u;const e=st();if(!e)return;const t=todayStr(),a=`${t.slice(0,7)}-01`,o=await $e(["trial_show_signatures_default","show_signatures_default"],"0"),s=String(o).trim()==="1"||String(o).toLowerCase()==="true";e.innerHTML=`
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
    </div>`;let n=[],i=null;const r=async()=>{var g,h;const b=$("#trial-results");if(!b)return;const m=getInputVal("trial-from"),p=getInputVal("trial-to"),f=getSelectVal("trial-level"),d=f==="all"?Number.POSITIVE_INFINITY:Number(f||3),y=getCheckVal("trial-show-third"),v=getCheckVal("trial-show-signatures");if(!m||!p)return showToast("Selecciona el lapso (desde y hasta).","warning");if(m>p)return showToast("La fecha Desde no puede ser mayor que Hasta.","warning");b.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Balance de Prueba...</div>';try{const{accounts:_}=await nt(),{transactions:A,txLines:I}=await it(),F=Object.fromEntries(A.map(w=>[w.id,w])),S=new Map(_.map(w=>[w.id,{id:w.id,code:String(w.code||""),name:String(w.name||""),level:Number(w.level||1),parent_code:String(w.parent_code||""),ownPrev:0,ownDebit:0,ownCredit:0,prev:0,debit:0,credit:0,current:0,third:new Map,children:[]}])),x=new Map;S.forEach(w=>{w.code&&x.set(w.code,w)});for(const w of I){const P=F[w.tx_id];if(!P||P.status!=="active"||!P.date)continue;const V=S.get(w.account_id);if(!V)continue;const U=String(P.date),q=Number(w.debit||0),J=Number(w.credit||0);if(U<m?V.ownPrev+=q-J:U>=m&&U<=p&&(V.ownDebit+=q,V.ownCredit+=J),y){const te=String(P.third_party_id||"NO_TERCERO"),R=((h=(g=P.expand)==null?void 0:g.third_party_id)==null?void 0:h.name)||"Sin tercero";V.third.has(te)||V.third.set(te,{id:te,name:R,prev:0,debit:0,credit:0,current:0});const D=V.third.get(te);U<m?D.prev+=q-J:U>=m&&U<=p&&(D.debit+=q,D.credit+=J),D.current=D.prev+D.debit-D.credit}}const T=[];S.forEach(w=>{const P=w.parent_code?x.get(w.parent_code):null;P?P.children.push(w):T.push(w)});const E=(w,P)=>w.code.localeCompare(P.code);T.sort(E),S.forEach(w=>w.children.sort(E));const C=[],N=1e-4,L=w=>{let P=w.ownPrev,V=w.ownDebit,U=w.ownCredit;for(const J of w.children){const te=L(J);P+=te.prev,V+=te.debit,U+=te.credit}const q=P+V-U;return w.prev=P,w.debit=V,w.credit=U,w.current=q,{prev:P,debit:V,credit:U,current:q}};T.forEach(w=>L(w));const O=(w,P)=>{const V=[];for(const R of w.children)V.push(...O(R,P+1));if(!(Math.abs(w.prev)>N||Math.abs(w.debit)>N||Math.abs(w.credit)>N||Math.abs(w.current)>N||V.length>0))return[];const J=Number(w.level||P+1),te={code:w.code,account:w.name,level:J,depth:P,isGroup:w.children.length>0,prev:w.prev,debit:w.debit,credit:w.credit,current:w.current,node:w};return J<=d?[te,...V]:V};C.length=0,T.forEach(w=>C.push(...O(w,0)));const M=T.reduce((w,P)=>(w.prev+=P.prev,w.debit+=P.debit,w.credit+=P.credit,w.current+=P.current,w),{prev:0,debit:0,credit:0,current:0}),B=Et(M.prev),j=Et(M.debit),Y=Et(M.credit),W=Et(M.current),K=[];for(const w of C)if(K.push({...w,thirdName:""}),y&&w.node&&w.node.third&&w.node.third.size){const P=[...w.node.third.values()].filter(V=>Math.abs(V.prev)>N||Math.abs(V.debit)>N||Math.abs(V.credit)>N||Math.abs(V.current)>N).sort((V,U)=>V.name.localeCompare(U.name));for(const V of P)K.push({code:"",account:"Detalle por tercero",level:w.level,depth:w.depth+1,isGroup:!1,prev:V.prev,debit:V.debit,credit:V.credit,current:V.current,thirdName:V.name,isThirdDetail:!0})}n=K.map(w=>({codigo:w.code,descripcion:`${"  ".repeat(w.depth)}${w.account}`,tercero:w.thirdName||"",nivel:w.level,saldo_anterior:w.prev,mov_debito:w.debit,mov_credito:w.credit,saldo_actual:w.current})),$("#btn-exp-trial")&&($("#btn-exp-trial").disabled=!K.length),$("#btn-pdf-trial")&&($("#btn-pdf-trial").disabled=!K.length),i={fromDate:m,toDate:p,includeThird:y,includeSignatures:v,displayRows:K.map(w=>({...w})),totals:{...M}};let H="";if(v){const[w,P,V,U,q,J,te,R]=await Promise.all([$e(["representante_legal_name","legal_representative_name","rep_legal_name"]),$e(["representante_legal_title","legal_representative_title","rep_legal_title"],"Representante Legal"),$e(["contador_name","accountant_name"]),$e(["contador_title","accountant_title"],"Contador"),$e(["contador_license","accountant_license"]),$e(["revisor_fiscal_name","fiscal_reviewer_name"]),$e(["revisor_fiscal_title","fiscal_reviewer_title"],"Revisor Fiscal"),$e(["revisor_fiscal_license","fiscal_reviewer_license"])]);H=`
          <div class="p-4 pt-2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              ${xa(w,P,"")}
              ${xa(V,U,q)}
              ${xa(J,te,R)}
            </div>
          </div>`}b.innerHTML=`
        <div class="px-4 pt-4 text-center">
          <p class="text-xl font-bold" style="color:#0D2137">Balance de Comprobación Detallado</p>
          <p class="text-sm mt-1" style="color:#6B7280">DEL ${esc(m)} AL ${esc(p)}</p>
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
              ${K.length?K.map(w=>{const P=De(w.prev),V=De(w.debit),U=De(w.credit),q=De(w.current);return`
                <tr>
                  <td class="font-mono text-xs ${w.isGroup?"font-bold":""}">${esc(w.code)}</td>
                  <td class="${w.isGroup?"font-bold":""}" style="padding-left:${8+w.depth*18}px">${esc(w.account)}</td>
                  ${y?`<td class="${w.isThirdDetail?"font-medium":""}">${esc(w.thirdName||"—")}</td>`:""}
                  <td class="${w.isGroup?"font-bold":""}" style="color:${P.color}">${P.text}</td>
                  <td class="${w.isGroup?"font-bold":""}" style="color:${V.color}">${V.text}</td>
                  <td class="${w.isGroup?"font-bold":""}" style="color:${U.color}">${U.text}</td>
                  <td class="${w.isGroup?"font-bold":""}" style="color:${q.color}">${q.text}</td>
                </tr>`}).join(""):`<tr><td colspan="${y?"7":"6"}" class="text-center py-10" style="color:#9CA3AF">No hay datos para el lapso seleccionado.</td></tr>`}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="${y?"3":"2"}" class="font-bold">Total</td>
                <td class="font-bold" style="color:${De(M.prev).color}">${B.text}</td>
                <td class="font-bold" style="color:${De(M.debit).color}">${j.text}</td>
                <td class="font-bold" style="color:${De(M.credit).color}">${Y.text}</td>
                <td class="font-bold" style="color:${De(M.current).color}">${W.text}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ${H}`}catch(_){b.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(_.message)}</div>`,i=null,$("#btn-pdf-trial")&&($("#btn-pdf-trial").disabled=!0)}};(c=$("#btn-gen-trial"))==null||c.addEventListener("click",r),(l=$("#btn-exp-trial"))==null||l.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"codigo",label:"CUENTA"},{key:"descripcion",label:"DESCRIPCIÓN"},{key:"nivel",label:"NIVEL"},{key:"tercero",label:"TERCERO"},{key:"saldo_anterior",label:"BALANCE ANTERIOR"},{key:"mov_debito",label:"DÉBITOS"},{key:"mov_credito",label:"CRÉDITOS"},{key:"saldo_actual",label:"BALANCE ACTUAL"}],`balance_prueba_n${getSelectVal("trial-level")}_${getInputVal("trial-from")}_${getInputVal("trial-to")}`)}),(u=$("#btn-pdf-trial"))==null||u.addEventListener("click",async()=>{var b;if(!(!i||!i.displayRows.length))try{const m=gt();if(!m)return;const p=await vt(),f=new m({orientation:"landscape",unit:"pt",format:"letter"}),d=ht(f,p,{title:"Balance de Prueba (Detallado)",subtitles:[`Desde: ${i.fromDate}`,`Hasta: ${i.toDate}`,`Detalle por tercero: ${i.includeThird?"Si":"No"}`]}),y=i.includeThird?["Cuenta","Descripcion","Tercero","Saldo Anterior","Mov. Debito","Mov. Credito","Saldo Actual"]:["Cuenta","Descripcion","Saldo Anterior","Mov. Debito","Mov. Credito","Saldo Actual"],v=i.displayRows.map(g=>{const h=`${"  ".repeat(Number(g.depth||0))}${g.account||""}`;return i.includeThird?[g.code||"",h,g.thirdName||"",le(g.prev||0),be(g.debit||0),be(g.credit||0),le(g.current||0),g.isGroup?"group":g.isThirdDetail?"third":"detail"]:[g.code||"",h,le(g.prev||0),be(g.debit||0),be(g.credit||0),le(g.current||0),g.isGroup?"group":"detail"]});if(i.includeThird?v.push(["TOTAL","","",le(i.totals.prev||0),be(i.totals.debit||0),be(i.totals.credit||0),le(i.totals.current||0),"total"]):v.push(["TOTAL","",le(i.totals.prev||0),be(i.totals.debit||0),be(i.totals.credit||0),le(i.totals.current||0),"total"]),f.autoTable({startY:d.startY,head:[y],body:v.map(g=>g.slice(0,y.length)),theme:"plain",margin:{top:d.startY,left:d.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.5,textColor:[55,55,55],cellPadding:2.7,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineWidth:{bottom:.25}},columnStyles:i.includeThird?{0:{cellWidth:62},1:{cellWidth:242},2:{cellWidth:140},3:{cellWidth:80,halign:"right"},4:{cellWidth:80,halign:"right"},5:{cellWidth:80,halign:"right"},6:{cellWidth:80,halign:"right"}}:{0:{cellWidth:70},1:{cellWidth:346},2:{cellWidth:88,halign:"right"},3:{cellWidth:88,halign:"right"},4:{cellWidth:88,halign:"right"},5:{cellWidth:88,halign:"right"}},didParseCell:g=>{var _;if(g.section!=="body")return;const h=(_=v[g.row.index])==null?void 0:_[y.length];h==="group"?(g.cell.styles.fontStyle="bold",g.cell.styles.textColor=[13,33,55]):h==="third"?g.cell.styles.fillColor=[248,250,252]:h==="total"&&(g.cell.styles.fontStyle="bold",g.cell.styles.fillColor=[236,236,236],g.cell.styles.textColor=[13,33,55],g.cell.styles.lineWidth={top:.2},g.cell.styles.lineColor=[13,33,55])},didDrawPage:g=>yt(f,g.pageNumber)}),i.includeSignatures){const[g,h,_,A,I,F,S,x]=await Promise.all([$e(["representante_legal_name","legal_representative_name","rep_legal_name"]),$e(["representante_legal_title","legal_representative_title","rep_legal_title"],"Representante Legal"),$e(["contador_name","accountant_name"]),$e(["contador_title","accountant_title"],"Contador"),$e(["contador_license","accountant_license"]),$e(["revisor_fiscal_name","fiscal_reviewer_name"]),$e(["revisor_fiscal_title","fiscal_reviewer_title"],"Revisor Fiscal"),$e(["revisor_fiscal_license","fiscal_reviewer_license"])]),T=(((b=f.lastAutoTable)==null?void 0:b.finalY)||d.startY)+34,E=f.internal.pageSize.getWidth(),C=f.internal.pageSize.getHeight();let N=T;N>C-90&&(f.addPage(),N=80);const L=[E*.18,E*.5,E*.82],O=[{name:g||"",title:h||"",extra:""},{name:_||"",title:A||"",extra:I||""},{name:F||"",title:S||"",extra:x||""}];f.setDrawColor(70,70,70),f.setTextColor(60,60,60),O.forEach((M,B)=>{const j=L[B];f.line(j-75,N,j+75,N),f.setFont("helvetica","bold"),f.setFontSize(8),f.text(String(M.name||"________________________"),j,N+12,{align:"center"}),f.setFont("helvetica","normal"),f.setFontSize(7),f.text(String(M.title||""),j,N+22,{align:"center"}),M.extra&&f.text(String(M.extra),j,N+31,{align:"center"})})}f.save(`balance_prueba_${i.fromDate}_${i.toDate}.pdf`)}catch(m){showToast(`Error al generar PDF: ${m.message}`,"error")}})}function xa(e,t,a=""){return`
    <div class="pt-6">
      <div style="border-top:1px solid #111827; margin-bottom:6px"></div>
      <p class="text-sm font-semibold" style="color:#0D2137">${esc(e||"________________________")}</p>
      <p class="text-xs" style="color:#6B7280">${esc(t||"")}</p>
      ${a?`<p class="text-xs" style="color:#6B7280">${esc(a)}</p>`:""}
    </div>`}function _n(e,t){const a=(n,i=!1)=>{const r=Number(String(n||"").slice(0,4)),c=Number(String(n||"").slice(5,7));if(!Number.isFinite(r)||!Number.isFinite(c)||c<1||c>12)return"";if(!i)return`${String(r)}-${String(c).padStart(2,"0")}-01`;const l=new Date(r,c,0);return`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`},o=a(e,!1),s=a(t,!0);return!o||!s||String(o)>String(s)?null:{fromDate:o,toDate:s}}async function xn(){var m,p,f;const e=st();if(!e)return;const t=todayStr().slice(0,7),a=Number(t.slice(0,4)),o=Number(t.slice(5,7)),s=`${String(a-1)}-${String(o).padStart(2,"0")}`;e.innerHTML=`
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
    </div>`;let n=[],i=null;const r=d=>{const y=Number(String(d||"").slice(0,4)),v=Number(String(d||"").slice(5,7));if(!Number.isFinite(y)||!Number.isFinite(v)||v<1||v>12)return"";const g=new Date(y,v,0);return`${g.getFullYear()}-${String(g.getMonth()+1).padStart(2,"0")}-${String(g.getDate()).padStart(2,"0")}`},c=d=>{if(!d)return"—";const y=new Date(`${d}T00:00:00`);return Number.isNaN(y.getTime())?d:y.toLocaleDateString("es-CO",{day:"2-digit",month:"long",year:"numeric"})},l=(d,y,v,g)=>{const h=Object.fromEntries(y.map(A=>[A.id,A])),_=Object.fromEntries(d.map(A=>[A.id,0]));for(const A of v){const I=h[A.tx_id];!I||I.status!=="active"||!I.date||String(I.date)>g||(_[A.account_id]=Number(_[A.account_id]||0)+Number(A.debit||0)-Number(A.credit||0))}return _},u=(d,y,v,g)=>{const h=d.filter(x=>String(x.code||"").startsWith(g)),_=new Map(h.map(x=>{const T=Number(y[x.id]||0),E=Number(v[x.id]||0),C=g==="4"?-T:T,N=g==="4"?-E:E;return[x.id,{id:x.id,code:String(x.code||""),name:String(x.name||""),level:Number(x.level||1),parentCode:String(x.parent_code||""),ownNow:C,ownCmp:N,now:0,cmp:0,children:[]}]})),A=new Map;_.forEach(x=>{x.code&&A.set(x.code,x)});const I=[];_.forEach(x=>{const T=x.parentCode?A.get(x.parentCode):null;T?T.children.push(x):I.push(x)});const F=(x,T)=>x.code.localeCompare(T.code);I.sort(F),_.forEach(x=>x.children.sort(F));const S=x=>{let T=x.ownNow,E=x.ownCmp;for(const C of x.children){const N=S(C);T+=N.now,E+=N.cmp}return x.now=T,x.cmp=E,{now:T,cmp:E}};return I.forEach(x=>S(x)),I},b=async()=>{const d=$("#income-results");if(!d)return;const y=getInputVal("inc-month"),v=getInputVal("inc-compare-month"),g=getCheckVal("inc-show-notes"),h=getSelectVal("inc-level"),_=h==="all"?Number.POSITIVE_INFINITY:Number(h||3);if(!y||!v)return showToast("Selecciona ambos meses para el reporte comparativo.","warning");const A=r(y),I=r(v);if(!A||!I)return showToast("Mes inválido. Revisa los filtros.","warning");d.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Estado de Resultados...</div>';try{const{accounts:F}=await nt(),{transactions:S,txLines:x}=await it(),T=l(F,S,x,A),E=l(F,S,x,I),C=u(F,T,E,"4"),N=u(F,T,E,"5"),L=u(F,T,E,"6"),O=u(F,T,E,"7");let M=1;const B=D=>{const G=[],ee=Z=>{const Q=[];for(const ge of Z.children)Q.push(...ee(ge));if(!(Math.abs(Z.now)>1e-4||Math.abs(Z.cmp)>1e-4)&&!Q.length)return[];const he=[];return Number(Z.level||1)<=_&&he.push({note:g?String(M++):"",label:Z.name,now:Z.now,cmp:Z.cmp}),he.push(...Q),he};D.forEach(Z=>G.push(...ee(Z)));const X=D.reduce((Z,Q)=>Z+Number(Q.now||0),0),ie=D.reduce((Z,Q)=>Z+Number(Q.cmp||0),0);return{detail:G,totalNow:X,totalCmp:ie}},j=B(C),Y=B(N),W=B(L),K=B(O),H=Y.totalNow+W.totalNow+K.totalNow,w=Y.totalCmp+W.totalCmp+K.totalCmp,P=j.totalNow-H,V=j.totalCmp-w,U=g?4:3,q=g?'<th style="width:90px">Nota</th>':"",J=(D,z="")=>{const G=De(D);return`<td class="text-right ${z}" style="color:${G.color}">${G.text}</td>`},te=D=>D.detail.map(z=>`
        <tr>
          <td style="padding-left:24px">${esc(z.label)}</td>
          ${g?`<td class="text-center">${esc(z.note)}</td>`:""}
          ${J(z.now)}
          ${J(z.cmp)}
        </tr>`).join("");d.innerHTML=`
        <div class="px-4 pt-4 text-center">
          <p class="text-xl font-bold" style="color:#0D2137">Estado de Resultados</p>
          <p class="text-sm" style="color:#6B7280">(Expresado en pesos colombianos)</p>
        </div>
        <div class="overflow-x-auto p-4" style="max-height:560px">
          <table class="data-table">
            <thead>
              <tr>
                <th>Rubro</th>
                ${q}
                <th class="text-right">${esc(c(A))}</th>
                <th class="text-right">${esc(c(I))}</th>
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
                ${J(w,"font-bold")}
              </tr>
              <tr>
                <td class="font-bold">Resultado neto del periodo</td>
                ${g?"<td></td>":""}
                ${J(P,"font-bold")}
                ${J(V,"font-bold")}
              </tr>
            </tbody>
          </table>
        </div>`,n=[];const R=(D,z,G)=>{n.push({rubro:D,nota:"",actual:"",comparativo:""}),z.detail.forEach(ee=>{n.push({rubro:`  ${ee.label}`,nota:ee.note||"",actual:ee.now,comparativo:ee.cmp})}),n.push({rubro:G,nota:"",actual:z.totalNow,comparativo:z.totalCmp})};R("Ingresos (Clase 4)",j,"Total ingresos"),R("Costos de venta (Clase 5)",Y,"Total costos"),R("Gastos operacionales (Clase 6)",W,"Total gastos operacionales"),R("Otros gastos (Clase 7)",K,"Total otros gastos"),n.push({rubro:"Total gastos y costos",nota:"",actual:H,comparativo:w}),n.push({rubro:"Resultado neto del periodo",nota:"",actual:P,comparativo:V}),i={reportMonth:y,compareMonth:v,reportDate:A,compareDate:I,showNotes:g,sections:{ingresos:j,costos:Y,gastos:W,otrosGastos:K},totals:{totalGastosNow:H,totalGastosCmp:w,utilidadNow:P,utilidadCmp:V}},$("#btn-exp-er")&&($("#btn-exp-er").disabled=!n.length),$("#btn-pdf-er")&&($("#btn-pdf-er").disabled=!n.length)}catch(F){d.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(F.message)}</div>`,n=[],i=null,$("#btn-exp-er")&&($("#btn-exp-er").disabled=!0),$("#btn-pdf-er")&&($("#btn-pdf-er").disabled=!0)}};(m=$("#btn-gen-er"))==null||m.addEventListener("click",b),(p=$("#btn-exp-er"))==null||p.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"rubro",label:"Rubro"},{key:"nota",label:"Nota"},{key:"actual",label:getInputVal("inc-month")},{key:"comparativo",label:getInputVal("inc-compare-month")}],`estado_resultados_${getInputVal("inc-month")}_vs_${getInputVal("inc-compare-month")}`)}),(f=$("#btn-pdf-er"))==null||f.addEventListener("click",async()=>{if(i)try{const d=gt();if(!d)return;const{showNotes:y,sections:v,totals:g,reportDate:h,compareDate:_,reportMonth:A,compareMonth:I}=i,F=new d({orientation:"portrait",unit:"pt",format:"letter"}),S=await vt(),x=ht(F,S,{title:"Estado de Resultados",subtitles:[`Periodo mensual comparativo: ${A} vs ${I}`,`Cortes: ${h} / ${_}`]}),T=[],E=(N,L,O)=>{T.push([{content:N,colSpan:y?4:3,styles:{fontStyle:"bold",textColor:[13,33,55],fillColor:[245,245,245]}}]),L.detail.forEach(M=>{y?T.push([M.label,M.note||"",le(M.now),le(M.cmp)]):T.push([M.label,le(M.now),le(M.cmp)])}),y?T.push([O,"",le(L.totalNow),le(L.totalCmp)]):T.push([O,le(L.totalNow),le(L.totalCmp)])};E("Ingresos (Clase 4)",v.ingresos,"Total ingresos"),E("Costos de venta (Clase 5)",v.costos,"Total costos"),E("Gastos operacionales (Clase 6)",v.gastos,"Total gastos operacionales"),E("Otros gastos (Clase 7)",v.otrosGastos,"Total otros gastos"),y?T.push(["Total gastos y costos","",le(g.totalGastosNow),le(g.totalGastosCmp)]):T.push(["Total gastos y costos",le(g.totalGastosNow),le(g.totalGastosCmp)]),y?T.push(["Resultado neto del periodo","",le(g.utilidadNow),le(g.utilidadCmp)]):T.push(["Resultado neto del periodo",le(g.utilidadNow),le(g.utilidadCmp)]);const C=y?[["Rubro","Nota",String(h),String(_)]]:[["Rubro",String(h),String(_)]];F.autoTable({startY:x.startY,head:C,body:T,theme:"plain",margin:{top:x.startY,left:x.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.3,textColor:[55,55,55],cellPadding:2.5,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineWidth:{bottom:.25}},columnStyles:y?{0:{cellWidth:280},1:{cellWidth:54,halign:"center"},2:{cellWidth:110,halign:"right"},3:{cellWidth:110,halign:"right"}}:{0:{cellWidth:334},1:{cellWidth:110,halign:"right"},2:{cellWidth:110,halign:"right"}},didParseCell:N=>{var M;if(N.section!=="body")return;const L=(M=T[N.row.index])==null?void 0:M[0];if(typeof L=="object"&&(L!=null&&L.colSpan))return;const O=String(L||"").toLowerCase();(O.startsWith("total ")||O.startsWith("resultado "))&&(N.cell.styles.fontStyle="bold",N.cell.styles.fillColor=[236,236,236],N.cell.styles.textColor=[13,33,55])},didDrawPage:N=>yt(F,N.pageNumber)}),F.save(`estado_resultados_${A}_vs_${I}.pdf`)}catch(d){showToast(`Error al generar PDF: ${d.message}`,"error")}})}async function An(){var p,f,d;const e=st();if(!e)return;const t=todayStr().slice(0,7),a=Number(t.slice(0,4)),o=Number(t.slice(5,7)),s=`${String(a-1)}-${String(o).padStart(2,"0")}`;e.innerHTML=`
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
    </div>`;let n=[],i=null;const r=y=>{const v=Number(String(y||"").slice(0,4)),g=Number(String(y||"").slice(5,7));if(!Number.isFinite(v)||!Number.isFinite(g)||g<1||g>12)return"";const h=new Date(v,g,0),_=h.getFullYear(),A=String(h.getMonth()+1).padStart(2,"0"),I=String(h.getDate()).padStart(2,"0");return`${_}-${A}-${I}`},c=y=>{if(!y)return"—";const v=new Date(`${y}T00:00:00`);return Number.isNaN(v.getTime())?y:v.toLocaleDateString("es-CO",{day:"2-digit",month:"long",year:"numeric"})},l=(y,v,g,h)=>{const _=Object.fromEntries(v.map(I=>[I.id,I])),A=Object.fromEntries(y.map(I=>[I.id,0]));for(const I of g){const F=_[I.tx_id];!F||F.status!=="active"||!F.date||String(F.date)>h||(A[I.account_id]=Number(A[I.account_id]||0)+Number(I.debit||0)-Number(I.credit||0))}return A},u=(y,v)=>{const g=Number(y||0);return v==="asset"?g:-g},b=(y,v,g,h,_,A,I,F)=>{const x=y.filter(h),T=new Map(x.map(W=>[W.id,{id:W.id,code:String(W.code||""),name:String(W.name||""),level:Number(W.level||1),parentCode:String(W.parent_code||""),ownNow:u(v[W.id],_),ownCmp:u(g[W.id],_),now:0,cmp:0,children:[]}])),E=new Map;T.forEach(W=>{W.code&&E.set(W.code,W)});const C=[];T.forEach(W=>{const K=W.parentCode?E.get(W.parentCode):null;K?K.children.push(W):C.push(W)});const N=(W,K)=>W.code.localeCompare(K.code);C.sort(N),T.forEach(W=>W.children.sort(N));const L=W=>{let K=W.ownNow,H=W.ownCmp;for(const w of W.children){const P=L(w);K+=P.now,H+=P.cmp}return W.now=K,W.cmp=H,{now:K,cmp:H}};C.forEach(W=>L(W));let O=I;const M=W=>{const K=[];for(const V of W.children)K.push(...M(V));if(!(Math.abs(W.now)>1e-4||Math.abs(W.cmp)>1e-4||K.length>0))return[];const P=[];return Number(W.level||1)<=F&&P.push({note:A?String(O++):"",label:W.name,now:W.now,cmp:W.cmp}),P.push(...K),P},B=C.flatMap(W=>M(W)),j=C.reduce((W,K)=>W+K.now,0),Y=C.reduce((W,K)=>W+K.cmp,0);return{detail:B,totalNow:j,totalCmp:Y,nextNote:O}},m=async()=>{const y=$("#position-results");if(!y)return;const v=getInputVal("pos-month"),g=getInputVal("pos-compare-month"),h=getCheckVal("pos-show-notes"),_=getSelectVal("pos-level"),A=_==="all"?Number.POSITIVE_INFINITY:Number(_||3);if(!v||!g)return showToast("Selecciona ambos meses para el reporte comparativo.","warning");const I=r(v),F=r(g);if(!I||!F)return showToast("Mes inválido. Revisa los filtros.","warning");y.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Estado de Situación Financiera...</div>';try{const{accounts:S}=await nt(),{transactions:x,txLines:T}=await it(),E=l(S,x,T,I),C=l(S,x,T,F);let N=1;const L=b(S,E,C,R=>String(R.code||"").startsWith("11"),"asset",h,N,A);N=L.nextNote;const O=b(S,E,C,R=>String(R.code||"").startsWith("1")&&!String(R.code||"").startsWith("11"),"asset",h,N,A);N=O.nextNote;const M=b(S,E,C,R=>String(R.code||"").startsWith("21"),"liability",h,N,A);N=M.nextNote;const B=b(S,E,C,R=>String(R.code||"").startsWith("2")&&!String(R.code||"").startsWith("21"),"liability",h,N,A);N=B.nextNote;const j=b(S,E,C,R=>String(R.code||"").startsWith("3"),"equity",h,N,A),Y=L.totalNow+O.totalNow,W=L.totalCmp+O.totalCmp,K=M.totalNow+B.totalNow,H=M.totalCmp+B.totalCmp,w=K+j.totalNow,P=H+j.totalCmp,V=h?4:3,U=h?'<th style="width:90px">Nota</th>':"",q=(R,D="")=>{const z=De(R),G=`color:${z.color}`;return`<td class="text-right ${D}" style="${G}">${z.text}</td>`},J=R=>R.detail.map(D=>`
        <tr>
          <td style="padding-left:24px">${esc(D.label)}</td>
          ${h?`<td class="text-center">${esc(D.note)}</td>`:""}
          ${q(D.now)}
          ${q(D.cmp)}
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
                <th class="text-right">${esc(c(I))}</th>
                <th class="text-right">${esc(c(F))}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="font-bold" colspan="${V}">Activos</td></tr>
              <tr><td class="font-semibold" colspan="${V}" style="padding-left:12px">Activos corrientes</td></tr>
              ${J(L)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total activos corrientes</td>
                ${h?"<td></td>":""}
                ${q(L.totalNow,"font-bold")}
                ${q(L.totalCmp,"font-bold")}
              </tr>
              <tr><td class="font-semibold" colspan="${V}" style="padding-left:12px">Activos no corrientes</td></tr>
              ${J(O)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total activos no corrientes</td>
                ${h?"<td></td>":""}
                ${q(O.totalNow,"font-bold")}
                ${q(O.totalCmp,"font-bold")}
              </tr>
              <tr>
                <td class="font-bold">Total activos</td>
                ${h?"<td></td>":""}
                ${q(Y,"font-bold")}
                ${q(W,"font-bold")}
              </tr>

              <tr><td class="font-bold" colspan="${V}">Pasivos</td></tr>
              <tr><td class="font-semibold" colspan="${V}" style="padding-left:12px">Pasivos corrientes</td></tr>
              ${J(M)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total pasivos corrientes</td>
                ${h?"<td></td>":""}
                ${q(M.totalNow,"font-bold")}
                ${q(M.totalCmp,"font-bold")}
              </tr>
              <tr><td class="font-semibold" colspan="${V}" style="padding-left:12px">Pasivos no corrientes</td></tr>
              ${J(B)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total pasivos no corrientes</td>
                ${h?"<td></td>":""}
                ${q(B.totalNow,"font-bold")}
                ${q(B.totalCmp,"font-bold")}
              </tr>
              <tr>
                <td class="font-bold">Total pasivos</td>
                ${h?"<td></td>":""}
                ${q(K,"font-bold")}
                ${q(H,"font-bold")}
              </tr>

              <tr><td class="font-bold" colspan="${V}">Patrimonio</td></tr>
              ${J(j)}
              <tr>
                <td class="font-bold">Total patrimonio</td>
                ${h?"<td></td>":""}
                ${q(j.totalNow,"font-bold")}
                ${q(j.totalCmp,"font-bold")}
              </tr>

              <tr>
                <td class="font-bold">Total pasivos más patrimonio</td>
                ${h?"<td></td>":""}
                ${q(w,"font-bold")}
                ${q(P,"font-bold")}
              </tr>
            </tbody>
          </table>
        </div>`,n=[];const te=(R,D,z)=>{n.push({rubro:R,nota:"",actual:"",comparativo:""}),D.detail.forEach(G=>{n.push({rubro:`  ${G.label}`,nota:G.note||"",actual:G.now,comparativo:G.cmp})}),n.push({rubro:z,nota:"",actual:D.totalNow,comparativo:D.totalCmp})};te("Activos corrientes",L,"Total activos corrientes"),te("Activos no corrientes",O,"Total activos no corrientes"),n.push({rubro:"Total activos",nota:"",actual:Y,comparativo:W}),te("Pasivos corrientes",M,"Total pasivos corrientes"),te("Pasivos no corrientes",B,"Total pasivos no corrientes"),n.push({rubro:"Total pasivos",nota:"",actual:K,comparativo:H}),te("Patrimonio",j,"Total patrimonio"),n.push({rubro:"Total pasivos más patrimonio",nota:"",actual:w,comparativo:P}),i={reportMonth:v,compareMonth:g,reportDate:I,compareDate:F,showNotes:h,sections:{actCorr:L,actNoCorr:O,pasCorr:M,pasNoCorr:B,patrimonio:j},totals:{totalActivosNow:Y,totalActivosCmp:W,totalPasivosNow:K,totalPasivosCmp:H,totalPyPNow:w,totalPyPCmp:P}},$("#btn-exp-position")&&($("#btn-exp-position").disabled=!n.length),$("#btn-pdf-position")&&($("#btn-pdf-position").disabled=!n.length)}catch(S){y.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(S.message)}</div>`,n=[],i=null,$("#btn-exp-position")&&($("#btn-exp-position").disabled=!0),$("#btn-pdf-position")&&($("#btn-pdf-position").disabled=!0)}};(p=$("#btn-gen-position"))==null||p.addEventListener("click",m),(f=$("#btn-exp-position"))==null||f.addEventListener("click",()=>{n.length&&exportToExcel(n,[{key:"rubro",label:"Rubro"},{key:"nota",label:"Nota"},{key:"actual",label:getInputVal("pos-month")},{key:"comparativo",label:getInputVal("pos-compare-month")}],`estado_situacion_financiera_${getInputVal("pos-month")}_vs_${getInputVal("pos-compare-month")}`)}),(d=$("#btn-pdf-position"))==null||d.addEventListener("click",async()=>{if(i)try{const y=gt();if(!y)return;const{showNotes:v,sections:g,totals:h,reportDate:_,compareDate:A,reportMonth:I,compareMonth:F}=i,S=new y({orientation:"portrait",unit:"pt",format:"letter"}),x=await vt(),T=ht(S,x,{title:"Estado de Situacion Financiera",subtitles:[`Periodo mensual comparativo: ${I} vs ${F}`,`Cortes: ${_} / ${A}`]}),E=[],C=(L,O,M)=>{E.push([{content:L,colSpan:v?4:3,styles:{fontStyle:"bold",textColor:[13,33,55],fillColor:[245,245,245]}}]),O.detail.forEach(B=>{v?E.push([B.label,B.note||"",le(B.now),le(B.cmp)]):E.push([B.label,le(B.now),le(B.cmp)])}),v?E.push([M,"",le(O.totalNow),le(O.totalCmp)]):E.push([M,le(O.totalNow),le(O.totalCmp)])};C("Activos corrientes",g.actCorr,"Total activos corrientes"),C("Activos no corrientes",g.actNoCorr,"Total activos no corrientes"),v?E.push(["Total activos","",le(h.totalActivosNow),le(h.totalActivosCmp)]):E.push(["Total activos",le(h.totalActivosNow),le(h.totalActivosCmp)]),C("Pasivos corrientes",g.pasCorr,"Total pasivos corrientes"),C("Pasivos no corrientes",g.pasNoCorr,"Total pasivos no corrientes"),v?E.push(["Total pasivos","",le(h.totalPasivosNow),le(h.totalPasivosCmp)]):E.push(["Total pasivos",le(h.totalPasivosNow),le(h.totalPasivosCmp)]),C("Patrimonio",g.patrimonio,"Total patrimonio"),v?E.push(["Total pasivos mas patrimonio","",le(h.totalPyPNow),le(h.totalPyPCmp)]):E.push(["Total pasivos mas patrimonio",le(h.totalPyPNow),le(h.totalPyPCmp)]);const N=v?[["Rubro","Nota",String(_),String(A)]]:[["Rubro",String(_),String(A)]];S.autoTable({startY:T.startY,head:N,body:E,theme:"plain",margin:{top:T.startY,left:T.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.3,textColor:[55,55,55],cellPadding:2.5,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineWidth:{bottom:.25}},columnStyles:v?{0:{cellWidth:280},1:{cellWidth:54,halign:"center"},2:{cellWidth:110,halign:"right"},3:{cellWidth:110,halign:"right"}}:{0:{cellWidth:334},1:{cellWidth:110,halign:"right"},2:{cellWidth:110,halign:"right"}},didParseCell:L=>{var B;if(L.section!=="body")return;const O=(B=E[L.row.index])==null?void 0:B[0];if(typeof O=="object"&&(O!=null&&O.colSpan))return;String(O||"").toLowerCase().startsWith("total ")&&(L.cell.styles.fontStyle="bold",L.cell.styles.fillColor=[236,236,236],L.cell.styles.textColor=[13,33,55])},didDrawPage:L=>yt(S,L.pageNumber)}),S.save(`estado_situacion_financiera_${I}_vs_${F}.pdf`)}catch(y){showToast(`Error al generar PDF: ${y.message}`,"error")}})}async function $n(){var i,r,c;const e=st();if(!e)return;const t=todayStr().slice(0,7);let a=[];try{a=await API.getTxTypes()}catch{a=[]}e.innerHTML=`
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
    </div>`;let o=[],s=null;const n=async()=>{const l=$("#journal-results");if(!l)return;const u=getInputVal("journal-month-from"),b=getInputVal("journal-month-to"),m=getSelectVal("journal-tx-type"),p=_n(u,b);if(!p)return showToast("Rango mensual inválido. Verifica Desde/Hasta.","warning");l.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Libro Diario...</div>';try{const{transactions:f,txLines:d}=await it(),y=Object.fromEntries(f.map(_=>[_.id,_])),v=d.map(_=>{var I,F,S,x,T,E;const A=y[_.tx_id];return!A||A.status!=="active"||!A.date||String(A.date)<p.fromDate||String(A.date)>p.toDate||m&&String(A.tx_type_id||"")!==String(m)?null:{fecha:A.date||"",comprobante:A.number||"",descripcion:A.description||"",tercero:((F=(I=A.expand)==null?void 0:I.third_party_id)==null?void 0:F.name)||"—",cuenta:`${((x=(S=_.expand)==null?void 0:S.account_id)==null?void 0:x.code)||""} - ${((E=(T=_.expand)==null?void 0:T.account_id)==null?void 0:E.name)||""}`.trim(),debito:Number(_.debit||0),credito:Number(_.credit||0)}}).filter(Boolean).sort((_,A)=>`${_.fecha}|${_.comprobante}|${_.cuenta}`.localeCompare(`${A.fecha}|${A.comprobante}|${A.cuenta}`)),g=v.reduce((_,A)=>_+Number(A.debito||0),0),h=v.reduce((_,A)=>_+Number(A.credito||0),0);l.innerHTML=`
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Período: <strong>${esc(u)}</strong> a <strong>${esc(b)}</strong> · Registros: <strong>${fmtN(v.length)}</strong> · Débito: <strong>${fmt(g)}</strong> · Crédito: <strong>${fmt(h)}</strong></p>
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
        </div>`,o=v,s={fromMonth:u,toMonth:b,txTypeId:m,totalDeb:g,totalCre:h},$("#btn-exp-journal")&&($("#btn-exp-journal").disabled=!v.length),$("#btn-pdf-journal")&&($("#btn-pdf-journal").disabled=!v.length)}catch(f){l.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(f.message)}</div>`,o=[],s=null,$("#btn-exp-journal")&&($("#btn-exp-journal").disabled=!0),$("#btn-pdf-journal")&&($("#btn-pdf-journal").disabled=!0)}};(i=$("#btn-gen-journal"))==null||i.addEventListener("click",n),(r=$("#btn-exp-journal"))==null||r.addEventListener("click",()=>{o.length&&exportToExcel(o,[{key:"fecha",label:"Fecha"},{key:"comprobante",label:"Comprobante"},{key:"descripcion",label:"Descripcion"},{key:"tercero",label:"Tercero"},{key:"cuenta",label:"Cuenta"},{key:"debito",label:"Debito"},{key:"credito",label:"Credito"}],`libro_diario_${(s==null?void 0:s.fromMonth)||t}_a_${(s==null?void 0:s.toMonth)||t}`)}),(c=$("#btn-pdf-journal"))==null||c.addEventListener("click",async()=>{if(!(!o.length||!s))try{const l=gt();if(!l)return;const u=new l({orientation:"portrait",unit:"pt",format:"letter"}),b=await vt(),m=a.find(d=>String(d.id)===String(s.txTypeId)),p=ht(u,b,{title:"Libro Diario",subtitles:[`Periodo mensual: ${s.fromMonth} a ${s.toMonth}`,`Tipo de transaccion: ${m?`${m.code||""} - ${m.name||""}`:"Todos"}`]}),f=o.map(d=>[d.fecha,d.comprobante,d.descripcion,d.tercero,d.cuenta,be(d.debito),be(d.credito)]);f.push(["TOTAL","","","","",be(s.totalDeb),be(s.totalCre)]),u.autoTable({startY:p.startY,head:[["Fecha","Comp.","Descripcion","Tercero","Cuenta","Debito","Credito"]],body:f,theme:"plain",margin:{top:p.startY,left:p.marginLeft,right:24,bottom:26},styles:{font:"helvetica",fontSize:6.5,textColor:[55,55,55],cellPadding:2,lineWidth:0,overflow:"linebreak"},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:6.7,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:48},1:{cellWidth:58},2:{cellWidth:126},3:{cellWidth:90},4:{cellWidth:124},5:{cellWidth:56,halign:"right"},6:{cellWidth:56,halign:"right"}},didParseCell:d=>{d.section==="body"&&d.row.index===f.length-1&&(d.cell.styles.fontStyle="bold",d.cell.styles.fillColor=[236,236,236],d.cell.styles.textColor=[13,33,55],d.cell.styles.lineWidth={top:.2},d.cell.styles.lineColor=[13,33,55])},didDrawPage:d=>yt(u,d.pageNumber)}),u.save(`libro_diario_${s.fromMonth}_a_${s.toMonth}.pdf`)}catch(l){showToast(`Error al generar PDF: ${l.message}`,"error")}})}async function wn(){var t;const e=st();if(e){e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Libro Auxiliar...</div>';try{const[{accounts:a},{thirdParties:o}]=await Promise.all([nt(),it()]);e.innerHTML=`
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
      <div id="aux-results" class="p-4 text-sm" style="color:#6B7280">Configura filtros y pulsa Generar.</div>`,(t=$("#btn-gen-aux"))==null||t.addEventListener("click",En)}catch(a){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(a.message)}</div>`}}}function so(){const e=$("#aux-tx-detail-overlay");e&&e.remove()}async function Tc(e){var t,a;try{so();const o=document.createElement("div");o.id="aux-tx-detail-overlay",o.style.cssText="position:fixed;inset:0;z-index:1200;background:rgba(13,33,55,.45);display:flex;align-items:center;justify-content:center;padding:20px",o.innerHTML='<div class="rounded-2xl border bg-white p-6 text-center" style="width:min(1080px,96vw);max-height:92vh;overflow:auto;border-color:#D1D5DB;box-shadow:0 24px 60px rgba(0,0,0,.25);color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando comprobante...</div>',document.body.appendChild(o);const s=await pb.get("transactions",e,{expand:"tx_type_id,third_party_id,user_id"}),n=await API.getTxLines(e);o.innerHTML=`
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
                ${n.map(i=>{var r,c,l,u,b,m;return`<tr>
                  <td>${esc(((c=(r=i.expand)==null?void 0:r.account_id)==null?void 0:c.code)||"")} - ${esc(((u=(l=i.expand)==null?void 0:l.account_id)==null?void 0:u.name)||"")}</td>
                  <td>${esc(((m=(b=i.expand)==null?void 0:b.third_party_id)==null?void 0:m.name)||"—")}</td>
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
      </div>`,o.addEventListener("click",i=>{i.target===o&&so()})}catch(o){const s=$("#aux-tx-detail-overlay");s&&(s.innerHTML=`<div class="rounded-xl border p-4 bg-white" style="width:min(780px,92vw);border-color:#FCA5A5;background:#FEF2F2;color:#991B1B"><div class="flex items-center justify-between gap-2"><div><i class="fas fa-circle-exclamation mr-2"></i>${esc(o.message)}</div><button class="btn btn-outline btn-sm" onclick="closeAuxTxDetailPanel()">Cerrar</button></div></div>`)}}async function En(){var t,a,o,s;const e=$("#aux-results");if(e){e.innerHTML='<div class="p-4 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando...</div>';try{const[{transactions:n,txLines:i,thirdParties:r},{accounts:c}]=await Promise.all([it(),nt()]),l=getSelectVal("aux-mode"),u=getSelectVal("aux-account"),b=getSelectVal("aux-third"),m=(((t=$("#aux-date-from"))==null?void 0:t.value)||"").trim(),p=(((a=$("#aux-date-to"))==null?void 0:a.value)||"").trim();let f=null;if(u){const w=c.find(P=>P.id===u);if(w){const P=String(w.code||"");f=new Set(c.filter(V=>{const U=String(V.code||"");return U===P||U.startsWith(P)}).map(V=>V.id))}else f=new Set([u])}const d=Object.fromEntries(c.map(w=>[w.id,w])),y=Object.fromEntries(n.map(w=>[w.id,w])),v=Object.fromEntries((r||[]).map(w=>[w.id,w])),g=new Map;if(m)for(const w of i){const P=y[w.tx_id];if(!P||P.status!=="active"||P.date>=m||f&&!f.has(w.account_id))continue;const V=d[w.account_id];if(!V)continue;const U=w.third_party_id||P.third_party_id||"",q=(w.cross_doc_ref||"").trim()||"SIN_DOC",J=V.maneja_cruce?`doc|${w.account_id}|${U||"NO_TERCERO"}|${q}`:`acc|${w.account_id}|${U||"NO_TERCERO"}`,te=g.get(J)||0,R=Number(w.debit||0),D=Number(w.credit||0),z=R-D;g.set(J,te+z)}const h=i.map(w=>{var G,ee,X,ie,Z;const P=y[w.tx_id];if(!P||P.status!=="active")return null;const V=w.third_party_id||P.third_party_id||"";if(f&&!f.has(w.account_id)||b&&V!==b||m&&P.date<m||p&&P.date>p)return null;const U=d[w.account_id],q=(U==null?void 0:U.code)||((ee=(G=w.expand)==null?void 0:G.account_id)==null?void 0:ee.code)||"",J=(U==null?void 0:U.name)||((ie=(X=w.expand)==null?void 0:X.account_id)==null?void 0:ie.name)||"",te=v[V]||((Z=P.expand)==null?void 0:Z.third_party_id)||null,R=(te==null?void 0:te.name)||"Sin tercero",D=(te==null?void 0:te.doc_number)||"",z=D?`${D} - ${R}`:R;return{fecha:P.date||"",comprobante:P.number||"",txId:P.id||"",cuenta:`${q} - ${J}`.trim(),accountCode:q,accountName:J,tercero:z,thirdName:R,thirdDoc:D,doc_cruce:(w.cross_doc_ref||"").trim(),descripcion:w.description||P.description||"",debito:Number(w.debit||0),credito:Number(w.credit||0),keyCuenta:`${q} - ${J}`.trim(),keyTercero:z,accountId:w.account_id,accountNature:(U==null?void 0:U.nature)||"debit",accountManejaCruce:!!(U!=null&&U.maneja_cruce),thirdId:V||"NO_TERCERO"}}).filter(Boolean),_=[...h].sort((w,P)=>`${w.accountId}|${w.thirdId}|${w.fecha}|${w.doc_cruce||"SIN_DOC"}|${w.comprobante}`.localeCompare(`${P.accountId}|${P.thirdId}|${P.fecha}|${P.doc_cruce||"SIN_DOC"}|${P.comprobante}`)),A=new Map;for(const w of _){const P=w.accountManejaCruce?`doc|${w.accountId}|${w.thirdId}|${w.doc_cruce||"SIN_DOC"}`:`acc|${w.accountId}|${w.thirdId}`;w.balanceKey=P;const V=g.get(P)||0,U=A.get(P)||0,q=w.debito-w.credito;w.saldo_anterior=V,w.saldo_actual=V+U+q,A.set(P,U+q)}const I=l==="tercero-cuenta"?"keyTercero":"keyCuenta",F=l==="tercero-cuenta"?"keyCuenta":"keyTercero",S=l==="tercero-cuenta"?"Tercero":"Cuenta",x=l==="tercero-cuenta"?"Cuenta":"Tercero";if(h.sort((w,P)=>{const V=`${w[I]}|${w[F]}|${w.fecha}|${w.doc_cruce||"SIN_DOC"}|${w.comprobante}`,U=`${P[I]}|${P[F]}|${P.fecha}|${P.doc_cruce||"SIN_DOC"}|${P.comprobante}`;return V.localeCompare(U)}),!h.length){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">No hay movimientos para los filtros seleccionados.</div>';return}const T=w=>{const P=new Set;let V=0;for(const U of w){const q=U.balanceKey||"";!q||P.has(q)||(P.add(q),V+=Number(U.saldo_anterior||0))}return V},E=w=>{const P=new Map;for(const U of w){const q=U.balanceKey||"";q&&P.set(q,Number(U.saldo_actual||0))}let V=0;return P.forEach(U=>{V+=U}),V},C=T(h),N=h.reduce((w,P)=>w+P.debito,0),L=h.reduce((w,P)=>w+P.credito,0),O=E(h),M=new Map;for(const w of h){const P=w[I]||"—",V=w[F]||"—";M.has(P)||M.set(P,new Map);const U=M.get(P);U.has(V)||U.set(V,[]),U.get(V).push(w)}const B=[];M.forEach((w,P)=>{const V=[...w.values()].flat(),U=V[0]||{},q=V.reduce((D,z)=>D+z.debito,0),J=V.reduce((D,z)=>D+z.credito,0),te=T(V),R=E(V);l==="cuenta-tercero"?B.push({kind:"primary",cuenta:U.accountCode||P,detalle:(U.accountName||"").toUpperCase()}):B.push({kind:"primary",nit:U.thirdDoc||"",detalle:(U.thirdName||P).toUpperCase()}),w.forEach((D,z)=>{const G=D[0]||{},ee=T(D),X=D.reduce((Q,se)=>Q+se.debito,0),ie=D.reduce((Q,se)=>Q+se.credito,0),Z=E(D);l==="cuenta-tercero"?B.push({kind:"secondary",nit:G.thirdDoc||"",detalle:(G.thirdName||z).toUpperCase()}):B.push({kind:"secondary",cuenta:G.accountCode||z,detalle:(G.accountName||"").toUpperCase()}),D.forEach(Q=>{B.push({kind:"detail",fecha:Q.fecha,cruce:Q.doc_cruce,detalle:Q.descripcion,comprobante:Q.comprobante,txId:Q.txId,saldo_anterior:Q.saldo_anterior,debito:Q.debito,credito:Q.credito,saldo_actual:Q.saldo_actual})}),B.push({kind:"subtotal-secondary",detalle:`SubTotal ${l==="cuenta-tercero"?G.thirdName||z:G.accountName||z}`,saldo_anterior:ee,debito:X,credito:ie,saldo_actual:Z})}),B.push({kind:"subtotal-primary",detalle:`SubTotal ${l==="cuenta-tercero"?U.accountName||P:U.thirdName||P}`,saldo_anterior:te,debito:q,credito:J,saldo_actual:R})}),B.push({kind:"grand-total",detalle:"GRAN TOTAL LIBRO AUXILIAR",saldo_anterior:C,debito:N,credito:L,saldo_actual:O});const j=l==="tercero-cuenta"?"nit":"cuenta",Y=l==="tercero-cuenta"?"cuenta":"nit",W=l==="tercero-cuenta"?"NIT":"CUENTA",K=l==="tercero-cuenta"?"CUENTA":"NIT",H=B.map(w=>w.kind==="primary"?`<tr style="border-top:1px solid #E5E7EB"><td style="font-weight:700;color:#0D2137">${esc(w[j]||"")}</td><td style="font-weight:700;color:#0D2137">${esc(w[Y]||"")}</td><td></td><td></td><td style="font-weight:700;color:#0D2137">${esc(w.detalle||"")}</td><td></td><td></td><td></td><td></td><td></td></tr>`:w.kind==="secondary"?`<tr><td style="font-weight:700">${esc(w[j]||"")}</td><td style="font-weight:700">${esc(w[Y]||"")}</td><td></td><td></td><td style="font-weight:700;padding-left:10px">${esc(w.detalle||"")}</td><td></td><td></td><td></td><td></td><td></td></tr>`:w.kind==="subtotal-secondary"?`<tr style="background:#F5F5F5;border-top:1px solid #D0D0D0"><td colspan="5" style="font-weight:700;color:#0D2137">${esc(w.detalle||"")}</td><td></td><td style="text-align:right;font-weight:700">${Ye(w.saldo_anterior||0)}</td><td style="text-align:right;font-weight:700">${fmt(w.debito||0)}</td><td style="text-align:right;font-weight:700">${fmt(w.credito||0)}</td><td style="text-align:right;font-weight:700">${Ye(w.saldo_actual||0)}</td></tr>`:w.kind==="subtotal-primary"?`<tr style="background:#ECECEC;border-top:1px solid #B0B0B0;border-bottom:1px solid #B0B0B0"><td colspan="5" style="font-weight:800;color:#0D2137">${esc(w.detalle||"")}</td><td></td><td style="text-align:right;font-weight:800">${Ye(w.saldo_anterior||0)}</td><td style="text-align:right;font-weight:800">${fmt(w.debito||0)}</td><td style="text-align:right;font-weight:800">${fmt(w.credito||0)}</td><td style="text-align:right;font-weight:800">${Ye(w.saldo_actual||0)}</td></tr>`:w.kind==="grand-total"?`<tr style="background:#E2E2E2;border-top:2px solid #0D2137;border-bottom:2px solid #0D2137"><td colspan="5" style="font-weight:800;color:#0D2137">${esc(w.detalle||"")}</td><td></td><td style="text-align:right;font-weight:800">${Ye(w.saldo_anterior||0)}</td><td style="text-align:right;font-weight:800">${fmt(w.debito||0)}</td><td style="text-align:right;font-weight:800">${fmt(w.credito||0)}</td><td style="text-align:right;font-weight:800">${Ye(w.saldo_actual||0)}</td></tr>`:`<tr>
        <td></td>
        <td></td>
        <td>${esc(w.fecha||"")}</td>
        <td style="font-family:monospace">${esc(w.cruce||"")}</td>
        <td>${esc(w.detalle||"")}</td>
        <td>${w.txId?`<a href="#" onclick="event.preventDefault(); openAuxTxDetailInReport('${esc(w.txId)}');" style="color:#333;font-weight:700;text-decoration:underline">${esc(w.comprobante||"")}</a>`:esc(w.comprobante||"")}</td>
        <td style="text-align:right">${Ye(w.saldo_anterior||0)}</td>
        <td style="text-align:right">${fmt(w.debito||0)}</td>
        <td style="text-align:right">${fmt(w.credito||0)}</td>
        <td style="text-align:right">${Ye(w.saldo_actual||0)}</td>
      </tr>`).join("");e.innerHTML=`
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm" style="color:#6B7280">Orden actual: <strong>${esc(S)} → ${esc(x)} → Fecha → Doc. Cruce</strong> · Registros: <strong>${fmtN(h.length)}</strong></p>
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
      </div>`,(o=$("#btn-exp-aux"))==null||o.addEventListener("click",()=>{const w=B.map(P=>({nit:P.nit||"",cuenta:P.cuenta||"",fecha:P.fecha||"",cruce:P.cruce||"",detalle_docto:P.detalle||"",comprobante:P.comprobante||"",saldo_anterior:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.saldo_anterior||0):"",debito:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.debito||0):"",credito:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.credito||0):"",nuevo_saldo:P.kind==="detail"||P.kind==="subtotal-secondary"||P.kind==="subtotal-primary"||P.kind==="grand-total"?Number(P.saldo_actual||0):""}));exportToExcel(w,[{key:j,label:W},{key:Y,label:K},{key:"fecha",label:"FECHA"},{key:"cruce",label:"CRUCE"},{key:"detalle_docto",label:"DETALLE DOCTO."},{key:"comprobante",label:"COMPROBANTE"},{key:"saldo_anterior",label:"SALDO ANTERIOR"},{key:"debito",label:"DEBITO"},{key:"credito",label:"CREDITO"},{key:"nuevo_saldo",label:"NUEVO SALDO"}],"libro_auxiliar")}),(s=$("#btn-pdf-aux"))==null||s.addEventListener("click",async()=>{var w;try{const P=(w=window.jspdf)==null?void 0:w.jsPDF;if(typeof P!="function"){showToast("No se pudo inicializar el generador PDF.","error");return}const[V,U,q,J,te,R]=await Promise.all([API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>""),API.getSetting("company_city").catch(()=>""),API.getSetting("company_country").catch(()=>""),API.getSetting("software_name").catch(()=>"")]),D=new P({orientation:"portrait",unit:"pt",format:"letter"}),z=D.internal.pageSize.getWidth(),G=new Date().toLocaleString("es-CO"),ee=24,X=z-24,ie=(V||"EMPRESA").trim(),Z=`NIT: ${(U||"N/A").trim()}`,Q=[q,J,te].map(re=>String(re||"").trim()).filter(Boolean).join(" / ")||"Direccion no configurada",se=`${S} -> ${x}`,he=`Desde: ${m||"Inicio"}  Hasta: ${p||"Hoy"}`,ge=u?c.find(re=>re.id===u):null,ue=`Cuentas consultadas: ${ge?[ge.code,ge.name].map(re=>String(re||"").trim()).filter(Boolean).join(" - ")||"Cuenta seleccionada":"Todas"}`,pe=(R||"GRAVY v2.0").trim(),fe=(sessionStorage.getItem("user_name")||"Usuario").trim();D.setFont("helvetica","bold"),D.setFontSize(10),D.setTextColor(13,33,55),D.text(ie,ee,20),D.setFont("helvetica","normal"),D.setFontSize(8),D.setTextColor(100,100,100),D.text(Z,ee,30),D.text(Q,ee,40),D.setFont("helvetica","bold"),D.setFontSize(11),D.setTextColor(13,33,55),D.text("LIBRO AUXILIAR",z/2,20,{align:"center"}),D.setFont("helvetica","normal"),D.setFontSize(8),D.setTextColor(80,80,80),D.text(`Tipo: ${se}`,z/2,30,{align:"center"}),D.text(he,z/2,40,{align:"center"}),D.text(ue,z/2,50,{align:"center"}),D.setFont("helvetica","normal"),D.setFontSize(8),D.setTextColor(100,100,100),D.text(pe,X,20,{align:"right"}),D.text(`Usuario: ${fe}`,X,30,{align:"right"}),D.text(`Impreso: ${G}`,X,40,{align:"right"}),D.setDrawColor(180,180,180),D.setLineWidth(.5),D.line(ee,58,X,58);const me=re=>Number(re||0).toLocaleString("es-CO",{minimumFractionDigits:2,maximumFractionDigits:2}),Pe=re=>{const de=Number(re||0),Ge=me(Math.abs(de));return de<0?`-${Ge}`:Ge},Re=B.map(re=>{const de=[];return re.kind==="primary"||re.kind==="secondary"?de.push(re[j]||"",re[Y]||"","","",re.detalle||"","","","","",""):re.kind==="subtotal-secondary"||re.kind==="subtotal-primary"||re.kind==="grand-total"?de.push("","","","",re.detalle||"","",Pe(re.saldo_anterior||0),me(re.debito||0),me(re.credito||0),Pe(re.saldo_actual||0)):de.push("","",re.fecha||"",re.cruce||"",re.detalle||"",re.comprobante||"",Pe(re.saldo_anterior||0),me(re.debito||0),me(re.credito||0),Pe(re.saldo_actual||0)),de._rowKind=re.kind,de});D.autoTable({startY:66,head:[[W,K,"FECHA","CRUCE","DETALLE DOCTO.","COMPROBANTE","SALDO ANTERIOR","DEBITO","CREDITO","NUEVO SALDO"]],body:Re,theme:"plain",margin:{top:66,left:ee,right:24,bottom:26},styles:{font:"helvetica",fontSize:7.5,textColor:[55,55,55],lineColor:[225,225,225],lineWidth:0,cellPadding:2.8},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",lineColor:[180,180,180],lineWidth:{top:0,right:0,bottom:.25,left:0}},columnStyles:{0:{cellWidth:44},1:{cellWidth:52},2:{cellWidth:44},3:{cellWidth:34},4:{cellWidth:100},5:{cellWidth:58},6:{cellWidth:58,halign:"right"},7:{cellWidth:56,halign:"right"},8:{cellWidth:56,halign:"right"},9:{cellWidth:58,halign:"right"}},didParseCell:re=>{var Se;if(re.section!=="body")return;const{cell:de,row:Ge,column:xt}=re,ze=(Se=Re[Ge.index])==null?void 0:Se._rowKind;ze==="primary"?(de.styles.fontStyle="bold",de.styles.textColor=[13,33,55],de.styles.fillColor=[255,255,255],de.styles.lineWidth=0):ze==="secondary"?(de.styles.fontStyle="bold",de.styles.textColor=[20,20,20],de.styles.fillColor=[255,255,255],de.styles.lineWidth=0):ze==="subtotal-secondary"?(de.styles.fillColor=[245,245,245],de.styles.fontStyle="bold",de.styles.lineWidth={top:.15,right:0,bottom:0,left:0},de.styles.lineColor=[208,208,208]):ze==="subtotal-primary"?(de.styles.fillColor=[236,236,236],de.styles.fontStyle="bold",de.styles.lineWidth={top:.15,right:0,bottom:.15,left:0},de.styles.lineColor=[176,176,176]):ze==="grand-total"?(de.styles.fillColor=[226,226,226],de.styles.fontStyle="bold",de.styles.lineWidth={top:.2,right:0,bottom:.2,left:0},de.styles.lineColor=[13,33,55],de.styles.textColor=[13,33,55]):ze==="detail"&&(de.styles.fontSize=xt.index>=6?6.1:6.4,de.styles.cellPadding=xt.index>=6?2.1:2.6,de.styles.lineWidth=0)},didDrawPage:re=>{const de=D.internal.pageSize.getHeight();D.setFont("helvetica","normal"),D.setFontSize(7),D.setTextColor(120,120,120),D.text("Reporte generado por GRAVY - Escala de grises",ee,de-10),D.text(`Página ${re.pageNumber}`,X,de-10,{align:"right"})}}),D.save(`libro_auxiliar_${todayStr()}.pdf`)}catch(P){showToast(`Error al generar PDF: ${P.message}`,"error")}})}catch(n){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(n.message)}</div>`}}}window.launchReportModal=qe;window.agingBucket=vn;window.renderAgingPortfolio=hn;window.renderPortfolioBalances=oo;window.buildOpenPortfolioDocs=Yo;window.ensureLedgerData=it;window.generateAuxiliaryRows=En;window.drawPdfHeader=ht;window.renderTrialBalance=yn;window.getSettingFirst=$e;window.monthRangeToDates=_n;window.diffDays=fn;window.getReportViewHost=st;window.reportCard=We;window.openAuxTxDetailInReport=Tc;window.fmtSignedAmount=Et;window.renderFinancialPosition=An;window.fmtPolarityAmount=De;window.fmtSignedPlain=Ye;window.diffDaysSigned=bn;window.renderJournalBook=$n;window.closeAuxTxDetailPanel=so;window.renderIncomeStatement=xn;window.ensureAccountsSaldos=nt;window.getByClass=Cc;window.fmtPdfSignedNum=le;window.renderAuxiliaryBook=wn;window.getPdfHeaderContext=vt;window.addDays=gn;window.fmtPdfNum=be;window.getPdfCtorOrWarn=gt;window.REPORT_STATE=Ee;window.renderReportes=Ec;window.drawPdfFooter=yt;window.signatureBlock=xa;const no=[{key:"company_name",label:"Razón social",placeholder:"Nombre de la empresa"},{key:"company_nit",label:"NIT",placeholder:"900.123.456-7"},{key:"company_address",label:"Dirección",placeholder:"Dirección principal"},{key:"company_phone",label:"Teléfono",placeholder:"601-555-0100"},{key:"company_email",label:"Correo",placeholder:"info@empresa.com",type:"email"},{key:"smv_year",label:"SMV del año",placeholder:"2026",type:"number"}],Ae={legalName:["representante_legal_name","legal_representative_name","rep_legal_name"],legalTitle:["representante_legal_title","legal_representative_title","rep_legal_title"],accountantName:["contador_name","accountant_name"],accountantTitle:["contador_title","accountant_title"],accountantLicense:["contador_license","accountant_license"],reviewerName:["revisor_fiscal_name","fiscal_reviewer_name"],reviewerTitle:["revisor_fiscal_title","fiscal_reviewer_title"],reviewerLicense:["revisor_fiscal_license","fiscal_reviewer_license"],defaultEnabled:["trial_show_signatures_default","show_signatures_default"]};async function Ve(e,t=""){for(const a of e){const o=await API.getSetting(a);if(o)return o}return t}async function Cn(){const[e,t,a,o,s,n,i,r,c]=await Promise.all([Ve(Ae.legalName,""),Ve(Ae.legalTitle,"Representante Legal"),Ve(Ae.accountantName,""),Ve(Ae.accountantTitle,"Contador"),Ve(Ae.accountantLicense,""),Ve(Ae.reviewerName,""),Ve(Ae.reviewerTitle,"Revisor Fiscal"),Ve(Ae.reviewerLicense,""),Ve(Ae.defaultEnabled,"0")]);return{legalName:e,legalTitle:t,accountantName:a,accountantTitle:o,accountantLicense:s,reviewerName:n,reviewerTitle:i,reviewerLicense:r,defaultEnabled:String(c).trim()==="1"||String(c).toLowerCase()==="true"}}async function Tn(){if(!can("canWrite"))return showToast("Sin permisos para actualizar firmas","error");try{const e=[[Ae.legalName[0],getInputVal("sig-legal-name").trim()],[Ae.legalTitle[0],getInputVal("sig-legal-title").trim()||"Representante Legal"],[Ae.accountantName[0],getInputVal("sig-acc-name").trim()],[Ae.accountantTitle[0],getInputVal("sig-acc-title").trim()||"Contador"],[Ae.accountantLicense[0],getInputVal("sig-acc-license").trim()],[Ae.reviewerName[0],getInputVal("sig-rev-name").trim()],[Ae.reviewerTitle[0],getInputVal("sig-rev-title").trim()||"Revisor Fiscal"],[Ae.reviewerLicense[0],getInputVal("sig-rev-license").trim()],[Ae.defaultEnabled[0],getCheckVal("sig-default-enabled")?"1":"0"]];await Promise.all(e.map(([t,a])=>API.setSetting(t,a))),showToast("Firmas actualizadas correctamente","success")}catch(e){showToast(e.message||"No se pudieron guardar las firmas","error")}}async function In(e){var t,a;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando configuración...</div>';try{const[o,s]=await Promise.all([pb.listAll("settings",{sort:"key"}),Cn()]),n=Object.fromEntries(o.map(r=>[String(r.key||""),r])),i=can("canWrite");e.innerHTML=`
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
            ${no.map(r=>{var c;return`
              <div class="form-group ${r.key==="company_address"?"md:col-span-2":""}">
                <label class="form-label">${esc(r.label)}</label>
                <input
                  id="cfg-${esc(r.key)}"
                  type="${esc(r.type||"text")}"
                  class="form-input"
                  placeholder="${esc(r.placeholder)}"
                  value="${esc(((c=n[r.key])==null?void 0:c.value)||"")}"
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
              ${o.length?o.map(r=>`
                <tr>
                  <td class="font-mono text-xs">${esc(r.key||"")}</td>
                  <td>${esc(String(r.value||""))}</td>
                </tr>`).join(""):'<tr><td colspan="2" class="text-center py-10" style="color:#9CA3AF">No hay settings registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`,(t=$("#btn-save-config"))==null||t.addEventListener("click",async()=>{try{const r=no.map(c=>[c.key,getInputVal(`cfg-${c.key}`).trim()]);await Promise.all(r.map(([c,l])=>API.setSetting(c,l))),$("#topbar-company").textContent=getInputVal("cfg-company_name").trim(),showToast("Configuración actualizada correctamente","success"),In(e)}catch(r){showToast(r.message||"No se pudo guardar la configuración","error")}}),(a=$("#btn-save-signatures"))==null||a.addEventListener("click",Tn)}catch(o){e.innerHTML=`<div class="bg-white rounded-2xl border p-8 text-center" style="border-color:#F0F0F0"><i class="fas fa-circle-exclamation text-3xl mb-3" style="color:#EF4444"></i><p class="font-semibold" style="color:#374151">No fue posible cargar la configuración</p><p class="text-sm mt-2" style="color:#6B7280">${esc(o.message)}</p></div>`}}window.loadSignatureSettings=Cn;window.SIGNATURE_SETTINGS=Ae;window.saveSignatureSettingsFromForm=Tn;window.renderConfiguracion=In;window.CONFIG_FIELDS=no;window.getSettingFirst=Ve;let xe={page:1,perPage:100,total:0};function Ma(e){if(!e)return"—";const t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleString("es-CO",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1})}function Ua(e){return(e==null?void 0:e.event_at)||(e==null?void 0:e.created)||""}async function Ic(e){var t,a,o,s;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando auditoría...</div>';try{const n=await pb.list("audit_log",{page:1,perPage:100,sort:"-event_at"}),i=[...new Set(n.items.map(l=>l.action).filter(Boolean))].sort(),r=[...new Set(n.items.map(l=>l.entity).filter(Boolean))].sort();xe={page:1,perPage:100,total:0},e.innerHTML=`
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
            ${r.map(l=>`<option value="${esc(l)}">${esc(l)}</option>`).join("")}
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
      </div>`;const c=()=>{xe.page=1,wa()};(t=$("#btn-audit-search"))==null||t.addEventListener("click",c),(a=$("#audit-q"))==null||a.addEventListener("keydown",l=>{l.key==="Enter"&&c()}),(o=$("#btn-audit-clear"))==null||o.addEventListener("click",()=>{["audit-q","audit-from","audit-to"].forEach(l=>setInputVal(l,"")),["audit-action","audit-entity","audit-user-filter"].forEach(l=>{const u=$(`#${l}`);u&&(u.value="")}),$("#audit-results").innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-search mr-2"></i>Aplica filtros y pulsa Buscar</div>',$("#audit-pagination").style.display="none"}),(s=$("#btn-export-audit"))==null||s.addEventListener("click",Sn),c()}catch(n){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(n.message)}</div>`}}async function wa(){var a,o;const e=$("#audit-results"),t=$("#audit-pagination");if(e){e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const s=getInputVal("audit-q").trim(),n=getSelectVal("audit-action"),i=getSelectVal("audit-entity"),r=getSelectVal("audit-user-filter"),c=getInputVal("audit-from"),l=getInputVal("audit-to"),u=[];if(n){const d=pb.escapeFilterValue(n);u.push(`action="${d}"`)}if(i){const d=pb.escapeFilterValue(i);u.push(`entity="${d}"`)}if(r){const d=pb.escapeFilterValue(r);u.push(`username="${d}"`)}if(c&&u.push(`event_at>="${c} 00:00:00"`),l&&u.push(`event_at<="${l} 23:59:59"`),s){const d=pb.escapeFilterValue(s);u.push(`(username~"${d}" || details~"${d}" || entity_id~"${d}")`)}const b={page:xe.page,perPage:xe.perPage,sort:"-event_at",filter:u.join(" && ")||""};let m;try{m=await pb.list("audit_log",b)}catch{const y=u.filter(v=>!v.startsWith('event_at>="')&&!v.startsWith('event_at<="')).join(" && ");m=await pb.list("audit_log",{page:xe.page,perPage:xe.perPage,sort:"-id",filter:y||""}),(c||l)&&showToast("Se omitió filtro por fecha en Auditoría.","warning")}xe.total=m.totalItems;const p=Math.ceil(m.totalItems/xe.perPage)||1,f=d=>d&&{CREATE:"badge-green",UPDATE:"badge-blue",DELETE:"badge-red",STATUS:"badge-orange",VOID:"badge-red",LOGIN:"badge-blue",LOGOUT:"badge-blue"}[d.toUpperCase()]||"badge-blue";if(!m.items.length){e.innerHTML='<div class="p-10 text-center" style="color:#9CA3AF">No hay registros para los filtros aplicados.</div>',t.style.display="none";return}e.innerHTML=`
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Fecha y Hora</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>ID Entidad</th><th>Detalle</th><th></th></tr></thead>
          <tbody>
            ${m.items.map(d=>{var y;return`
              <tr>
                <td class="whitespace-nowrap text-xs">${esc(Ma(Ua(d)))}</td>
                <td class="font-medium text-sm">${esc(d.username||"—")}</td>
                <td><span class="badge ${f(d.action)}">${esc(d.action||"—")}</span></td>
                <td class="text-sm">${esc(d.entity||"—")}</td>
                <td class="font-mono text-xs max-w-xs truncate" title="${esc(d.entity_id||"")}">${esc((d.entity_id||"—").slice(0,12))}${((y=d.entity_id)==null?void 0:y.length)>12?"…":""}</td>
                <td class="text-sm max-w-xs truncate" title="${esc(d.details||"")}">${esc(d.details||"—")}</td>
                <td><button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewAuditDetail(${JSON.stringify(JSON.stringify(d))})"><i class="fas fa-eye"></i></button></td>
              </tr>`}).join("")}
          </tbody>
        </table>
      </div>`,t.style.display="flex",t.innerHTML=`
      <span class="text-sm" style="color:#6B7280">
        Mostrando ${(xe.page-1)*xe.perPage+1}–${Math.min(xe.page*xe.perPage,xe.total)} de ${xe.total} registros
      </span>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" id="audit-prev" ${xe.page<=1?"disabled":""}><i class="fas fa-chevron-left"></i> Ant.</button>
        <span class="text-sm font-medium px-2 flex items-center">Pág. ${xe.page} / ${p}</span>
        <button class="btn btn-outline btn-sm" id="audit-next" ${xe.page>=p?"disabled":""}>Sig. <i class="fas fa-chevron-right"></i></button>
      </div>`,(a=$("#audit-prev"))==null||a.addEventListener("click",()=>{xe.page--,wa()}),(o=$("#audit-next"))==null||o.addEventListener("click",()=>{xe.page++,wa()})}catch(s){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(s.message)}</div>`}}}function Sc(e){try{const t=JSON.parse(e);openModal("Detalle de Registro de Auditoría",`<div class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div><span class="form-label">Fecha y Hora</span><p class="font-medium">${esc(Ma(Ua(t)))}</p></div>
          <div><span class="form-label">Usuario</span><p class="font-medium">${esc(t.username||"—")}</p></div>
          <div><span class="form-label">Acción</span><p><span class="badge badge-blue">${esc(t.action||"—")}</span></p></div>
          <div><span class="form-label">Entidad</span><p class="font-medium">${esc(t.entity||"—")}</p></div>
          <div class="col-span-2"><span class="form-label">ID de Entidad</span><p class="font-mono text-xs break-all">${esc(t.entity_id||"—")}</p></div>
          <div class="col-span-2"><span class="form-label">Detalle</span><p class="mt-1 p-3 rounded-lg text-sm break-words" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(t.details||"—")}</p></div>
          <div class="col-span-2"><span class="form-label">ID Registro Auditoría</span><p class="font-mono text-xs break-all" style="color:#9CA3AF">${esc(t.id||"—")}</p></div>
        </div>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch{showToast("No se pudo cargar el detalle","error")}}async function Sn(){if(!can("canExport"))return showToast("Sin permisos de exportación","error");try{showToast("Generando exportación completa...","info");const e=getInputVal("audit-q").trim(),t=getSelectVal("audit-action"),a=getSelectVal("audit-entity"),o=getSelectVal("audit-user-filter"),s=getInputVal("audit-from"),n=getInputVal("audit-to"),i=[];if(t){const c=pb.escapeFilterValue(t);i.push(`action="${c}"`)}if(a){const c=pb.escapeFilterValue(a);i.push(`entity="${c}"`)}if(o){const c=pb.escapeFilterValue(o);i.push(`username="${c}"`)}if(s&&i.push(`event_at>="${s} 00:00:00"`),n&&i.push(`event_at<="${n} 23:59:59"`),e){const c=pb.escapeFilterValue(e);i.push(`(username~"${c}" || details~"${c}" || entity_id~"${c}")`)}let r;try{r=await pb.listAll("audit_log",{sort:"-event_at",filter:i.join(" && ")||""})}catch{const l=i.filter(u=>!u.startsWith('event_at>="')&&!u.startsWith('event_at<="')).join(" && ");r=await pb.listAll("audit_log",{sort:"-id",filter:l||""}),(s||n)&&showToast("Exportación sin filtro de fecha en Auditoría.","warning")}exportToExcel(r.map(c=>({"Fecha y Hora":Ma(Ua(c)),Usuario:c.username||"",Acción:c.action||"",Entidad:c.entity||"","ID Entidad":c.entity_id||"",Detalle:c.details||""})),`auditoria_${todayStr()}`)}catch(e){showToast(e.message,"error")}}window.renderAuditoria=Ic;window.fmtAuditDateTime=Ma;window.AUDIT_STATE=xe;window.getAuditDateValue=Ua;window.viewAuditDetail=Sc;window.loadAuditPage=wa;window.exportAuditLog=Sn;async function Jo(e){var t,a,o;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando usuarios...</div>';try{const s=await pb.listAll("users",{sort:"-created"});e.innerHTML=`
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
      </div>`,(a=$("#users-q"))==null||a.addEventListener("input",debounce(()=>filterTable("users-table",getInputVal("users-q")),150)),(o=$("#btn-new-user"))==null||o.addEventListener("click",()=>Ko())}catch(s){e.innerHTML=`
      <div class="bg-white rounded-2xl border p-8 text-center" style="border-color:#F0F0F0">
        <i class="fas fa-circle-exclamation text-3xl mb-3" style="color:#EF4444"></i>
        <p class="font-semibold" style="color:#374151">No fue posible acceder a la coleccion de usuarios</p>
        <p class="text-sm mt-2" style="color:#6B7280">${esc(s.message)}</p>
        <p class="text-xs mt-3" style="color:#9CA3AF">Si el backend bloquea este recurso, puedes administrar usuarios desde el panel de PocketBase.</p>
      </div>`}}function Ko(e=null){var t;if(!can("canManageUsers"))return showToast("No tienes permisos para gestionar usuarios","error");openModal(e?"Editar Usuario":"Nuevo Usuario",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Nombre completo</label><input id="uf-name" class="form-input" value="${esc((e==null?void 0:e.full_name)||"")}"></div>
      <div class="form-group"><label class="form-label">Correo</label><input id="uf-email" type="email" class="form-input" value="${esc((e==null?void 0:e.email)||"")}" ${e?"readonly":""}></div>
      <div class="form-group"><label class="form-label">Rol</label><select id="uf-role" class="form-input">${Object.keys(ROLES).map(a=>`<option value="${esc(a)}" ${((e==null?void 0:e.role)||"viewer")===a?"selected":""}>${esc(roleLabel(a))}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Estado</label><select id="uf-active" class="form-input"><option value="1" ${(e==null?void 0:e.active)!==!1?"selected":""}>Activo</option><option value="0" ${(e==null?void 0:e.active)===!1?"selected":""}>Inactivo</option></select></div>
      ${e?"":'<div class="form-group"><label class="form-label">Contraseña</label><input id="uf-pass" type="password" class="form-input"></div><div class="form-group"><label class="form-label">Confirmar Contraseña</label><input id="uf-pass2" type="password" class="form-input"></div>'}
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-user"><i class="fas fa-floppy-disk"></i> Guardar</button>'),(t=$("#btn-save-user"))==null||t.addEventListener("click",async()=>{var s;const a=$("#btn-save-user");a&&(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');const o={full_name:getInputVal("uf-name"),role:getSelectVal("uf-role"),active:getSelectVal("uf-active")==="1"};if(!o.full_name)return a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar'),showToast("El nombre es obligatorio","warning");try{if(e!=null&&e.id)await pb.update("users",e.id,o);else{const n=getInputVal("uf-email").toLowerCase(),i=getInputVal("uf-pass"),r=getInputVal("uf-pass2");if(!n||!i||!r)return showToast("Correo y contraseña son obligatorios","warning");if(i!==r)return showToast("Las contraseñas no coinciden","warning");const c=(n.split("@")[0]||"user").replace(/[^a-zA-Z0-9._-]/g,"").slice(0,30)||`user_${Date.now()}`,l=await pb.create("users",{...o,email:n,emailVisibility:!0,name:c,password:i,passwordConfirm:r})}closeModal(),showToast("Usuario guardado correctamente","success"),Jo($("#page-content"))}catch(n){const i=(s=n==null?void 0:n.data)!=null&&s.data?Object.values(n.data.data).map(r=>r==null?void 0:r.message).filter(Boolean).join(" | "):"";showToast(i||n.message||"No se pudo guardar el usuario","error")}finally{a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar')}})}async function Nc(e){try{Ko(await pb.get("users",e))}catch(t){showToast(t.message,"error")}}function Lc(e,t){if(!can("canManageUsers"))return showToast("No tienes permisos para cambiar estado","error");confirmDialog(t?"Reactivar usuario":"Inactivar usuario",t?"¿Deseas reactivar este usuario?":"¿Deseas inactivar este usuario?",async()=>{try{await pb.update("users",e,{active:t}),showToast("Estado actualizado","success"),Jo($("#page-content"))}catch(a){showToast(a.message,"error")}})}window.editUser=Nc;window.toggleUser=Lc;window.renderUsuarios=Jo;window.openUserForm=Ko;async function at(e){var t,a,o,s,n,i,r,c,l,u,b,m,p;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando conciliaci?n...</div>';try{const[f,d,y]=await Promise.all([pb.listAll("bank_accounts",{sort:"name",expand:"account_id"}),API.getAccounts(!0),pb.listAll("bank_movements",{sort:"-date",expand:"bank_account_id,tx_line_id"})]),v=((t=f[0])==null?void 0:t.id)||"";e.innerHTML=`
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
            ${f.map(x=>`<option value="${esc(x.id)}" ${x.id===v?"selected":""}>${esc(x.bank)} - ${esc(x.number)} (${esc(x.name)})</option>`).join("")}
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
              ${y.length?y.map(x=>{var T,E,C,N;return`
                <tr data-bank-id="${esc(x.bank_account_id)}" data-mov-id="${esc(x.id)}" data-reconciled="${x.reconciled?"1":"0"}" data-date="${esc(x.date)}">
                  ${can("canWrite")?`<td>${x.reconciled?"":`<input type="checkbox" class="mov-check" value="${esc(x.id)}">`}</td>`:""}
                  <td>${esc(x.date)}</td>
                  <td>${esc(((E=(T=x.expand)==null?void 0:T.bank_account_id)==null?void 0:E.bank)||"")} - ${esc(((N=(C=x.expand)==null?void 0:C.bank_account_id)==null?void 0:N.number)||"")}</td>
                  <td>${esc(x.description||"?")}</td>
                  <td>${fmt(x.debit||0)}</td>
                  <td>${fmt(x.credit||0)}</td>
                  <td>${esc(x.ref||"?")}</td>
                  <td>${x.reconciled?'<span class="badge badge-green">S?</span>':'<span class="badge badge-orange">No</span>'}</td>
                  ${can("canWrite")?'<td class="mov-suggest"><span class="badge badge-gray">-</span></td>':""}
                  <td>${can("canWrite")?`<button class="btn btn-outline btn-sm" onclick="toggleRecon('${esc(x.id)}', ${x.reconciled?"false":"true"})"><i class="fas fa-check"></i></button>`:""}</td>
                </tr>`}).join(""):`<tr><td colspan="${can("canWrite")?"10":"8"}" class="text-center py-10" style="color:#9CA3AF">No hay movimientos bancarios.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;const g=new Map,h=()=>{const x=$$("#mov-table tbody .mov-check:checked").length,T=$("#btn-recon-selected");T&&(T.disabled=x===0,T.innerHTML=`<i class="fas fa-list-check"></i> Conciliar Seleccionadas${x?` (${x})`:""}`)},_=()=>{const x=getSelectVal("bank-filter"),T=getInputVal("mov-q").toLowerCase(),E=getInputVal("filter-from"),C=getInputVal("filter-to");$$("#mov-table tbody tr").forEach(N=>{const L=!x||N.dataset.bankId===x,O=!T||N.textContent.toLowerCase().includes(T),M=N.dataset.date||"",B=!E||M>=E,j=!C||M<=C;N.style.display=L&&O&&B&&j?"":"none"}),h()},A=x=>{g.clear(),x.forEach(C=>g.set(C.movementId,C));const T=x.length;$("#suggest-count")&&($("#suggest-count").textContent=String(T));const E=$("#btn-apply-suggested");E&&(E.disabled=T===0),$$("#mov-table tbody tr").forEach(C=>{const N=C.dataset.movId,L=C.querySelector(".mov-suggest");if(!L)return;const O=g.get(N);if(!O){L.innerHTML='<span class="badge badge-gray">-</span>';return}const M=O.confidence==="alta"?"badge-green":O.confidence==="media"?"badge-blue":"badge-orange",B=O.confidence==="alta"?"Alta":O.confidence==="media"?"Media":"Baja";L.innerHTML=`<span class="badge ${M}" title="${esc(O.reason)}">${B}</span>`})},I=async()=>{try{const x=getSelectVal("bank-filter");if(!x)return showToast("Selecciona una cuenta bancaria para sugerir conciliaci?n","warning");const T=f.find(N=>N.id===x);if(!(T!=null&&T.account_id))return showToast("La cuenta bancaria no tiene cuenta contable asociada","warning");const E=$("#btn-suggest-recon");E&&(E.disabled=!0,E.innerHTML='<i class="fas fa-spinner fa-spin"></i> Analizando...');const C=await Rn(T,y,3);A(C),C.length?showToast(`Se generaron ${C.length} sugerencia(s) de conciliaci?n`,"success"):showToast("No se encontraron sugerencias autom?ticas para esa cuenta","info")}catch(x){showToast(x.message||"Error generando sugerencias","error")}finally{const x=$("#btn-suggest-recon");x&&(x.disabled=!1,x.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> Sugerir Conciliaci?n')}},F=async()=>{const x=[...g.values()];if(!x.length)return showToast("No hay sugerencias para aplicar","warning");const T=$("#btn-apply-suggested");T&&(T.disabled=!0,T.innerHTML='<i class="fas fa-spinner fa-spin"></i> Aplicando...');let E=0;for(const C of x)try{await pb.update("bank_movements",C.movementId,{reconciled:!0,tx_line_id:C.txLineId}),E++}catch{}showToast(`Conciliadas ${E} sugerencia(s)`,E?"success":"warning"),at($("#page-content"))},S=async()=>{const x=$$("#mov-table tbody .mov-check:checked").map(C=>C.value);if(!x.length)return showToast("No hay movimientos seleccionados","warning");const T=$("#btn-recon-selected");T&&(T.disabled=!0,T.innerHTML='<i class="fas fa-spinner fa-spin"></i> Conciliando...');let E=0;for(const C of x){const N=g.get(C);try{await pb.update("bank_movements",C,N?{reconciled:!0,tx_line_id:N.txLineId}:{reconciled:!0}),E++}catch{}}showToast(`Conciliadas ${E} seleccionada(s)`,E?"success":"warning"),at($("#page-content"))};(a=$("#bank-filter"))==null||a.addEventListener("change",_),(o=$("#filter-from"))==null||o.addEventListener("change",_),(s=$("#filter-to"))==null||s.addEventListener("change",_),(n=$("#btn-clear-movs"))==null||n.addEventListener("click",()=>Dn(f,y)),(i=$("#mov-q"))==null||i.addEventListener("input",debounce(_,150)),(r=$("#btn-new-bank"))==null||r.addEventListener("click",()=>Nn(d)),(c=$("#btn-new-mov"))==null||c.addEventListener("click",()=>Ln(f)),(l=$("#btn-import-ext"))==null||l.addEventListener("click",()=>kn(f)),(u=$("#btn-suggest-recon"))==null||u.addEventListener("click",I),(b=$("#btn-apply-suggested"))==null||b.addEventListener("click",F),(m=$("#btn-recon-selected"))==null||m.addEventListener("click",S),(p=$("#mov-check-all"))==null||p.addEventListener("change",x=>{const T=!!x.target.checked;$$("#mov-table tbody tr").forEach(E=>{if(E.style.display==="none"||E.dataset.reconciled==="1")return;const C=E.querySelector(".mov-check");C&&(C.checked=T)}),h()}),$$("#mov-table tbody .mov-check").forEach(x=>x.addEventListener("change",h)),_()}catch(f){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(f.message)}</div>`}}function Nn(e){var t;openModal("Nueva Cuenta Bancaria",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Nombre</label><input id="ba-name" class="form-input"></div>
      <div class="form-group"><label class="form-label">Banco</label><input id="ba-bank" class="form-input"></div>
      <div class="form-group"><label class="form-label">N?mero</label><input id="ba-number" class="form-input"></div>
      <div class="form-group"><label class="form-label">Cuenta contable asociada</label><select id="ba-account" class="form-input">${e.map(a=>`<option value="${esc(a.id)}">${esc(a.code)} - ${esc(a.name)}</option>`).join("")}</select></div>
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-ba">Guardar</button>'),(t=$("#btn-save-ba"))==null||t.addEventListener("click",async()=>{try{const a={name:getInputVal("ba-name"),bank:getInputVal("ba-bank"),number:getInputVal("ba-number"),account_id:getSelectVal("ba-account"),currency:"COP",active:!0};if(!a.name||!a.bank||!a.number||!a.account_id)return showToast("Completa todos los campos","warning");const o=await pb.create("bank_accounts",a);closeModal(),showToast("Cuenta bancaria creada","success"),at($("#page-content"))}catch(a){showToast(a.message,"error")}})}function Ln(e){var t;openModal("Nuevo Movimiento Bancario",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Cuenta Bancaria</label><select id="bm-acc" class="form-input">${e.map(a=>`<option value="${esc(a.id)}">${esc(a.bank)} - ${esc(a.number)}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Fecha</label><input id="bm-date" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Descripci?n</label><input id="bm-desc" class="form-input"></div>
      <div class="form-group"><label class="form-label">D?bito</label><input id="bm-debit" class="form-input" value="0"></div>
      <div class="form-group"><label class="form-label">Cr?dito</label><input id="bm-credit" class="form-input" value="0"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Referencia</label><input id="bm-ref" class="form-input"></div>
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-bm">Guardar</button>'),(t=$("#btn-save-bm"))==null||t.addEventListener("click",async()=>{try{const a={bank_account_id:getSelectVal("bm-acc"),date:getInputVal("bm-date"),description:getInputVal("bm-desc"),debit:parseNum(getInputVal("bm-debit")),credit:parseNum(getInputVal("bm-credit")),balance:0,ref:getInputVal("bm-ref"),reconciled:!1};if(!a.bank_account_id||!a.date)return showToast("Cuenta y fecha son obligatorias","warning");if(!(a.debit>0||a.credit>0))return showToast("Ingresa d?bito o cr?dito","warning");const o=await pb.create("bank_movements",a);closeModal(),showToast("Movimiento registrado","success"),at($("#page-content"))}catch(a){showToast(a.message,"error")}})}async function Fc(e,t){try{await pb.update("bank_movements",e,{reconciled:t}),showToast("Estado de conciliación actualizado","success"),at($("#page-content"))}catch(a){showToast(a.message,"error")}}function io(e){if(!e)return null;const t=new Date(String(e).slice(0,10)+"T00:00:00");return isNaN(t)?null:t}function Fn(e,t){const a=io(e),o=io(t);return!a||!o?999:Math.round(Math.abs((a-o)/864e5))}function ro(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}function Pn(e,t){const a=new Set(["de","la","el","los","las","por","para","con","del","y","en","a","un","una"]),o=new Set(ro(e).split(" ").filter(i=>i.length>=4&&!a.has(i))),s=new Set(ro(t).split(" ").filter(i=>i.length>=4&&!a.has(i)));if(!o.size||!s.size)return 0;let n=0;return o.forEach(i=>{s.has(i)&&n++}),n/Math.max(o.size,s.size)}async function Rn(e,t,a=3){const o=e==null?void 0:e.account_id;if(!o)return[];const s=pb.escapeFilterValue(o),n=await pb.listAll("tx_lines",{filter:`account_id="${s}"`,expand:"tx_id",sort:"-created"}),i=new Set(t.filter(b=>b.tx_line_id).map(b=>b.tx_line_id)),r=n.filter(b=>!i.has(b.id)),c=t.filter(b=>b.bank_account_id===e.id&&!b.reconciled),l=new Set,u=[];for(const b of c){const m=+(b.debit>0?b.debit:b.credit||0);if(!m)continue;const p=b.debit>0?"credit":"debit",f=r.filter(_=>!l.has(_.id)).filter(_=>Math.abs(+(_[p]||0)-m)<.01).map(_=>{var x,T,E,C;const A=((T=(x=_.expand)==null?void 0:x.tx_id)==null?void 0:T.date)||"",I=Fn(b.date,A),F=Pn(b.description||b.ref||"",_.description||((C=(E=_.expand)==null?void 0:E.tx_id)==null?void 0:C.description)||""),S=Math.max(0,100-I*12)+F*40;return{line:_,dDiff:I,descScore:F,score:S}}).filter(_=>_.dDiff<=a).sort((_,A)=>A.score-_.score);if(!f.length)continue;const d=f[0],y=f[1],v=!y||d.score-y.score>=20,g=v&&d.dDiff<=1?"alta":v?"media":"baja",h=`Monto exacto ${fmt(m)} · dif fecha ${d.dDiff} día(s)`;u.push({movementId:b.id,txLineId:d.line.id,confidence:g,reason:h}),l.add(d.line.id)}return u}function Dn(e,t){var i,r,c,l;const a=getInputVal("filter-from")||"",o=getInputVal("filter-to")||"",s=getSelectVal("bank-filter")||"";openModal('<i class="fas fa-trash-can mr-2" style="color:#DC2626"></i>Limpiar Per?odo',`<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:12px 14px;font-size:13px;color:#991B1B;margin-bottom:16px">
       <i class="fas fa-triangle-exclamation mr-1"></i>
       Esta acci?n <strong>elimina permanentemente</strong> los movimientos del rango seleccionado.
       Los movimientos ya conciliados se eliminar?n tambi?n y perder?n su v?nculo contable.
     </div>
     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div class="form-group mb-0">
         <label class="form-label">Cuenta bancaria</label>
         <select id="clr-bank" class="form-input">
           <option value="">Todas las cuentas</option>
           ${e.map(u=>`<option value="${esc(u.id)}" ${u.id===s?"selected":""}>${esc(u.bank)} - ${esc(u.number)} (${esc(u.name)})</option>`).join("")}
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
     </button>`);const n=()=>{const u=getSelectVal("clr-bank"),b=getInputVal("clr-from"),m=getInputVal("clr-to");if(!b||!m){$("#clr-preview").innerHTML='<span style="color:#9CA3AF">Selecciona ambas fechas para ver cu?ntos registros se eliminar?n.</span>',$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!0);return}if(b>m){$("#clr-preview").innerHTML='<span style="color:#EF4444"><i class="fas fa-circle-exclamation mr-1"></i>La fecha inicial no puede ser mayor que la final.</span>',$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!0);return}const p=t.filter(d=>(!u||d.bank_account_id===u)&&d.date>=b&&d.date<=m),f=p.filter(d=>d.reconciled).length;if(!p.length){$("#clr-preview").innerHTML='<span style="color:#6B7280">Ning?n movimiento coincide con ese rango.</span>',$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!0);return}$("#clr-preview").innerHTML=`
      <span style="color:#DC2626;font-weight:700"><i class="fas fa-triangle-exclamation mr-1"></i>
      Se eliminar?n <strong>${p.length}</strong> movimiento(s)
      ${f?`<span style="color:#92400E"> — de los cuales <strong>${f}</strong> ya est?n conciliados</span>`:""}
      </span>`,$("#btn-clr-confirm")&&($("#btn-clr-confirm").disabled=!1)};(i=$("#clr-bank"))==null||i.addEventListener("change",n),(r=$("#clr-from"))==null||r.addEventListener("change",n),(c=$("#clr-to"))==null||c.addEventListener("change",n),n(),(l=$("#btn-clr-confirm"))==null||l.addEventListener("click",async()=>{const u=getSelectVal("clr-bank"),b=getInputVal("clr-from"),m=getInputVal("clr-to"),p=t.filter(v=>(!u||v.bank_account_id===u)&&v.date>=b&&v.date<=m);if(!p.length)return;const f=$("#btn-clr-confirm");f&&(f.disabled=!0,f.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i> Eliminando...');let d=0,y=0;for(const v of p)try{await pb.delete("bank_movements",v.id),d++}catch{y++}closeModal(),y?showToast(`Eliminados ${d}. ${y} no pudieron borrarse (pueden tener restricciones).`,"warning"):showToast(`${d} movimiento(s) eliminado(s) correctamente`,"success"),at($("#page-content"))})}let Xe=[],Lt="";function kn(e){openModal('<i class="fas fa-file-import mr-2"></i>Importar Extracto Bancario','<div id="import-wizard"></div>','<div id="import-footer" style="display:contents"></div>',!0),Qo(e)}function Qo(e){var a,o;$("#modal-body").querySelector("#import-wizard").innerHTML=`
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
    </div>`,$("#modal-footer").innerHTML='<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>',$$(".imp-tab").forEach(s=>{s.addEventListener("click",()=>{$$(".imp-tab").forEach(n=>{n.style.borderBottom="none",n.style.color="#6B7280"}),s.style.borderBottom="3px solid #2E6CE6",s.style.color="#2E6CE6",$("#imp-tab-excel").style.display=s.dataset.tab==="excel"?"":"none",$("#imp-tab-paste").style.display=s.dataset.tab==="paste"?"":"none"})});const t=$("#imp-drop-zone");t==null||t.addEventListener("click",()=>{var s;return(s=$("#imp-file-input"))==null?void 0:s.click()}),t==null||t.addEventListener("dragover",s=>{s.preventDefault(),t.style.borderColor="#2E6CE6",t.style.background="#EFF6FF"}),t==null||t.addEventListener("dragleave",()=>{t.style.borderColor="#D1D5DB",t.style.background="#F9FAFB"}),t==null||t.addEventListener("drop",s=>{var i,r;s.preventDefault(),t.style.borderColor="#D1D5DB",t.style.background="#F9FAFB";const n=(r=(i=s.dataTransfer)==null?void 0:i.files)==null?void 0:r[0];n&&co(n,e)}),(a=$("#imp-file-input"))==null||a.addEventListener("change",s=>{var n;(n=s.target.files)!=null&&n[0]&&co(s.target.files[0],e)}),(o=$("#btn-imp-analyze"))==null||o.addEventListener("click",()=>{var c,l,u;const s=((l=(c=$("#imp-paste-area"))==null?void 0:c.value)==null?void 0:l.trim())||"";if(!s)return showToast("Pega el texto del extracto primero","warning");const n=((u=document.querySelector('input[name="imp-format"]:checked'))==null?void 0:u.value)||"tres",i=Vn(s,n);if(!i.length)return showToast("No se detectaron movimientos. Verifica que el texto incluya fechas (dd/mm/aaaa) y el formato seleccionado sea correcto.","warning");const r=getSelectVal("imp-bank-acc");Zo(i,e,r)})}function co(e,t){const a=new FileReader;a.onload=o=>{try{const s=XLSX.read(new Uint8Array(o.target.result),{type:"array",cellDates:!0}),n=s.Sheets[s.SheetNames[0]],i=XLSX.utils.sheet_to_json(n,{header:1,defval:""});if(i.length<2)return showToast("El archivo no tiene datos suficientes","warning");const r=On(i);Bn(i,r,e.name,t)}catch(s){showToast("Error al leer el archivo: "+s.message,"error")}},a.readAsArrayBuffer(e)}const rt={date:["fecha","date","dia","fec"],desc:["descripcion","descripción","concepto","detalle","movimiento","transaccion","transacción"],debit:["debito","débito","cargo","egreso","salida","retiro","debit","db"],cred:["credito","crédito","abono","ingreso","deposito","depósito","credit","cr","entrada"],ref:["referencia","ref","numero","número","doc","comprobante","nro","cheque"]};function On(e){let t=0;for(let s=0;s<Math.min(e.length,10);s++){const n=e[s].map(r=>String(r).toLowerCase());let i=0;for(const r of Object.values(rt))n.some(c=>r.some(l=>c.includes(l)))&&i++;if(i>=2){t=s;break}}const a=e[t].map(s=>String(s).toLowerCase().trim()),o=s=>a.findIndex(n=>s.some(i=>n.includes(i)));return{hRow:t,date:o(rt.date),desc:o(rt.desc),debit:o(rt.debit),cred:o(rt.cred),ref:o(rt.ref)}}function Bn(e,t,a,o){var l;const s=e[t.hRow],n=e.length-t.hRow-1,i=$("#imp-drop-zone");i&&(i.style.cssText="padding:10px 16px;border:1.5px solid #22C55E;border-radius:12px;background:#F0FDF4;display:flex;align-items:center;gap:10px;cursor:default",i.innerHTML=`<i class="fas fa-file-excel" style="color:#16A34A;font-size:1.3rem"></i>
      <span style="font-size:14px;font-weight:600;color:#15803D">${esc(a)}</span>
      <span style="font-size:12px;color:#6B7280">${n} filas detectadas</span>`,i.onclick=null,["dragover","dragleave","drop"].forEach(u=>i.removeEventListener(u,null)));const r=u=>[-1,...s.keys()].map(b=>`<option value="${b}" ${b===u?"selected":""}>${b<0?"— No usar —":`Col.${b+1}: ${esc(String(s[b]).slice(0,24))}`}</option>`).join(""),c=$("#imp-col-map");c.style.display="",c.innerHTML=`
    <p style="font-size:13px;font-weight:700;color:#374151;margin-bottom:10px">
      Mapeo de columnas <span style="font-weight:400;color:#9CA3AF">(ajusta si es necesario)</span>
    </p>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      <div><label class="form-label">Fecha <span style="color:#EF4444">*</span></label>
           <select id="mc-date"  class="form-input" style="font-size:13px">${r(t.date)}</select></div>
      <div><label class="form-label">Descripción <span style="color:#EF4444">*</span></label>
           <select id="mc-desc"  class="form-input" style="font-size:13px">${r(t.desc)}</select></div>
      <div><label class="form-label">Débito</label>
           <select id="mc-debit" class="form-input" style="font-size:13px">${r(t.debit)}</select></div>
      <div><label class="form-label">Crédito</label>
           <select id="mc-cred"  class="form-input" style="font-size:13px">${r(t.cred)}</select></div>
      <div><label class="form-label">Referencia</label>
           <select id="mc-ref"   class="form-input" style="font-size:13px">${r(t.ref)}</select></div>
    </div>

    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:12px 14px;margin-bottom:12px">
      <p style="font-size:12px;font-weight:700;color:#1D4ED8;margin:0 0 6px">
        <i class="fas fa-info-circle mr-1"></i> ¿El extracto usa una sola columna de valor con positivo/negativo?
      </p>
      <div style="display:flex;align-items:center;gap:10px">
        <select id="mc-valor" class="form-input" style="font-size:13px;max-width:280px">${r(-1)}</select>
        <span style="font-size:12px;color:#6B7280">Selecciona la columna. Positivo → Crédito · Negativo → Débito. <em>Ignora los campos Débito/Crédito de arriba.</em></span>
      </div>
    </div>

    <button class="btn btn-primary" id="btn-imp-preview">
      <i class="fas fa-eye mr-1"></i> Ver vista previa
    </button>`,(l=$("#btn-imp-preview"))==null||l.addEventListener("click",()=>{const u={date:+getSelectVal("mc-date"),desc:+getSelectVal("mc-desc"),debit:+getSelectVal("mc-debit"),cred:+getSelectVal("mc-cred"),ref:+getSelectVal("mc-ref"),valor:+getSelectVal("mc-valor")};if(u.date<0||u.desc<0)return showToast("Las columnas Fecha y Descripción son obligatorias","warning");const b=u.valor>=0;if(!b&&u.debit<0&&u.cred<0)return showToast("Selecciona al menos una columna de valor (Débito, Crédito, o Valor único)","warning");const m=[];for(let f=t.hRow+1;f<e.length;f++){const d=e[f],y=Mn(d[u.date]);if(!y)continue;let v=0,g=0;if(b){const h=Un(d[u.valor]);h<0?v=Math.abs(h):g=h}else v=u.debit>=0?Dt(d[u.debit]):0,g=u.cred>=0?Dt(d[u.cred]):0;!v&&!g||m.push({date:y,description:String(d[u.desc]??"").trim(),debit:v,credit:g,ref:u.ref>=0?String(d[u.ref]??"").trim():""})}if(!m.length)return showToast("No se encontraron filas válidas con el mapeo seleccionado","warning");const p=getSelectVal("imp-bank-acc");Zo(m,o,p)})}function Mn(e){if(e==null||e==="")return null;if(e instanceof Date&&!isNaN(e))return e.toISOString().slice(0,10);if(typeof e=="number"){const s=new Date(Math.round((e-25569)*864e5));return isNaN(s)?null:s.toISOString().slice(0,10)}const t=String(e).trim(),a=t.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);if(a)return`${a[3]}-${a[2].padStart(2,"0")}-${a[1].padStart(2,"0")}`;const o=t.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);return o?`${o[1]}-${o[2].padStart(2,"0")}-${o[3].padStart(2,"0")}`:null}function Dt(e){if(e==null||e==="")return 0;if(typeof e=="number")return Math.abs(e);const t=String(e).replace(/\s/g,"");let a;return/\d\.\d{3},/.test(t)?a=t.replace(/\./g,"").replace(",","."):/\d,\d{3}\./.test(t)?a=t.replace(/,/g,""):a=t.replace(/[^0-9.\-]/g,""),Math.abs(parseFloat(a))||0}function Un(e){if(e==null||e==="")return 0;if(typeof e=="number")return e;const t=String(e).trim(),a=/^[-−(]/.test(t)||/\)$/.test(t),o=t.replace(/^[-−(]/,"").replace(/\)$/,"");return a?-Dt(o):Dt(o)}function Vn(e,t="tres"){const a=[],o=/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b|\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b/,s="[-−]?\\d{1,3}(?:[.,\\u00A0\\u2009\\u202F ]\\d{3})+(?:[.,]\\d{1,2})?|[-−]?\\d+[.,]\\d{2}",n=()=>new RegExp(s,"g"),i=e.replace(/\u00A0|\u2009|\u202F/g," ").replace(/\u2212/g,"-"),r=[];for(const l of i.split(`
`)){const u=l.trim();if(!u)continue;const b=u.match(o);if(b){let m;if(b[4])m=`${b[4]}-${b[5]}-${b[6]}`;else{let[,p,f,d]=b;d.length===2&&(d="20"+d),m=`${d}-${f.padStart(2,"0")}-${p.padStart(2,"0")}`}r.push({date:m,lines:[u]})}else r.length>0&&r[r.length-1].lines.push(u)}if(!r.length)return a;let c=null;for(const l of r){const u=l.lines.join(" "),b=[...u.matchAll(n())].map(v=>{const g=v[0].replace(/\s/g,""),h=/^[-]/.test(g),_=Dt(g.replace(/^[-]/,""));return{isNeg:h,abs:_,signed:h?-_:_}}).filter(v=>v.abs>0);if(!b.length)continue;const m=u.match(o);let f=(m?u.slice(m.index+m[0].length):u).replace(new RegExp(s,"g")," ").replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ\-\/]/g," ").replace(/\s+/g," ").trim();(!f||f.length<2)&&(f="Movimiento");let d=0,y=0;if(t==="signos"){const v=b[0];v.isNeg?d=v.abs:y=v.abs}else if(t==="dos")b.length>=2&&(d=b[b.length-2].abs),y=b[b.length-1].abs;else if(b.length>=2){const v=b[b.length-1].abs,g=b[b.length-2].abs;if(!g)continue;c!==null?v-c>=-g*.01?y=g:d=g:y=g,c=v}else b.length===1&&(y=b[0].abs);!d&&!y||a.push({date:l.date,description:f,debit:d,credit:y,ref:""})}return a}function Zo(e,t,a){var n,i;Xe=e.map((r,c)=>({...r,_id:c,_skip:!1})),Lt=a;const o=t.find(r=>r.id===a),s=o?`${o.bank} — ${o.number}`:a;$("#modal-body").querySelector("#import-wizard").innerHTML=`
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
          ${Xe.map(r=>`
            <tr id="imp-row-${r._id}">
              <td>${esc(r.date)}</td>
              <td>${esc(r.description)}</td>
              <td style="text-align:right">${r.debit?fmt(r.debit):'<span style="color:#D1D5DB">—</span>'}</td>
              <td style="text-align:right">${r.credit?fmt(r.credit):'<span style="color:#D1D5DB">—</span>'}</td>
              <td>${esc(r.ref||"—")}</td>
              <td>
                <button class="btn btn-outline btn-sm"
                  style="color:#EF4444;border-color:#FECACA;padding:2px 8px"
                  onclick="_removeImportRow(${r._id})" title="Eliminar fila">
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
    </button>`,(n=$("#btn-imp-back"))==null||n.addEventListener("click",()=>{Xe=[],Lt="",Qo(t)}),(i=$("#btn-imp-confirm"))==null||i.addEventListener("click",()=>jn())}function Pc(e){var n;const t=Xe.find(i=>i._id===e);t&&(t._skip=!0),(n=document.getElementById(`imp-row-${e}`))==null||n.remove();const a=Xe.filter(i=>!i._skip).length,o=$("#imp-count-badge"),s=$("#imp-confirm-count");if(o&&(o.textContent=`${a} movimientos`),s&&(s.textContent=a),!a){const i=$("#btn-imp-confirm");i&&(i.disabled=!0,i.style.opacity="0.5")}}async function jn(){if(!Lt)return showToast("Cuenta bancaria no definida","error");const e=Xe.filter(s=>!s._skip);if(!e.length)return showToast("No hay movimientos para importar","warning");const t=$("#btn-imp-confirm");t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i> Importando...');let a=0,o=0;for(const s of e)try{await pb.create("bank_movements",{bank_account_id:Lt,date:s.date,description:s.description,debit:s.debit||0,credit:s.credit||0,balance:0,ref:s.ref||"",reconciled:!1}),a++}catch{o++}closeModal(),Xe=[],Lt="",o?showToast(`Importados ${a} movimientos. ${o} no pudieron guardarse.`,"warning"):showToast(`${a} movimientos importados correctamente`,"success"),at($("#page-content"))}window.renderConciliacion=at;window._normText=ro;window._renderColMapper=Bn;window._parseExcelDate=Mn;window._parsePdfText=Vn;window.openBankAccountForm=Nn;window._autoMapColumns=On;window.openImportModal=kn;window._handleExcelFile=co;window._parseColNum=Dt;window.buildReconSuggestions=Rn;window._importRows=Xe;window._renderImportStep1=Qo;window._removeImportRow=Pc;window._COL_KEYS=rt;window._renderImportPreview=Zo;window._parseSignedColNum=Un;window._daysDiff=Fn;window.openClearMovementsModal=Dn;window._doImport=jn;window._importBankAccId=Lt;window._asDateOnly=io;window.openBankMovementForm=Ln;window.toggleRecon=Fc;window._textOverlap=Pn;const Ze="payroll_accounting_config_v1",Ne={core:`${Ze}_core`,mappings:`${Ze}_mappings`,employee_groups:`${Ze}_employee_groups`,group_rules:`${Ze}_group_rules`,employee_rules:`${Ze}_employee_rules`},Ea=5e3,Va=[{key:"salary_base",label:"Salario base",default_side:"debit"},{key:"overtime",label:"Horas extra / recargos",default_side:"debit"},{key:"transport_allowance",label:"Auxilio de transporte",default_side:"debit"},{key:"incapacidades",label:"Incapacidades",default_side:"debit"},{key:"licencias",label:"Licencias",default_side:"debit"},{key:"gastos_representacion",label:"Gastos de representacion",default_side:"debit"},{key:"bonificacion",label:"Bonificacion",default_side:"debit"},{key:"aux_no_salariales",label:"Aux no salariales",default_side:"debit"},{key:"comisiones",label:"Comisiones",default_side:"debit"},{key:"dotaciones",label:"Dotaciones",default_side:"debit"},{key:"compensatorios",label:"Compensatorios",default_side:"debit"},{key:"alimentacion",label:"Alimentacion",default_side:"debit"},{key:"deduction_health",label:"Deduccion salud trabajador",default_side:"credit"},{key:"deduction_pension",label:"Deduccion pension trabajador",default_side:"credit"},{key:"solidarity_fund",label:"Fondo de solidaridad",default_side:"credit"},{key:"withholding_tax",label:"Retencion en la fuente",default_side:"credit"},{key:"deduction_other",label:"Otras deducciones trabajador",default_side:"credit"},{key:"embargo",label:"Embargo",default_side:"credit"},{key:"cxc",label:"CxC",default_side:"credit"},{key:"libranza",label:"Libranza",default_side:"credit"},{key:"prestamos",label:"Prestamos",default_side:"credit"},{key:"net_pay",label:"Neto a pagar",default_side:"credit"},{key:"employer_health",label:"Aporte salud empleador",default_side:"debit"},{key:"employer_pension",label:"Aporte pension empleador",default_side:"debit"},{key:"employer_arl",label:"ARL",default_side:"debit"},{key:"sena",label:"SENA",default_side:"debit"},{key:"icbf",label:"ICBF",default_side:"debit"},{key:"caja_comp",label:"Caja de compensacion",default_side:"debit"},{key:"cesantias",label:"Cesantias causadas",default_side:"debit"},{key:"intereses_ces",label:"Intereses cesantias",default_side:"debit"},{key:"prima",label:"Prima de servicios",default_side:"debit"},{key:"vacaciones",label:"Vacaciones causadas",default_side:"debit"}],Me=Va.reduce((e,t)=>(e[t.key]=t,e),{}),ke=["incapacidades","licencias","gastos_representacion","bonificacion","aux_no_salariales","comisiones","dotaciones","compensatorios","alimentacion"],Oe=["embargo","cxc","libranza","prestamos"],Ca={devengo:"Devengos",descuento:"Descuentos",aportes:"Aportes",provision:"Provisiones"},Hn={salary_base:{category:"devengo",allowed_sides:["debit"]},overtime:{category:"devengo",allowed_sides:["debit"]},transport_allowance:{category:"devengo",allowed_sides:["debit"]},incapacidades:{category:"devengo",allowed_sides:["debit"]},licencias:{category:"devengo",allowed_sides:["debit"]},gastos_representacion:{category:"devengo",allowed_sides:["debit"]},bonificacion:{category:"devengo",allowed_sides:["debit"]},aux_no_salariales:{category:"devengo",allowed_sides:["debit"]},comisiones:{category:"devengo",allowed_sides:["debit"]},dotaciones:{category:"devengo",allowed_sides:["debit"]},compensatorios:{category:"devengo",allowed_sides:["debit"]},alimentacion:{category:"devengo",allowed_sides:["debit"]},net_pay:{category:"devengo",allowed_sides:["credit"]},deduction_health:{category:"descuento",allowed_sides:["credit"]},deduction_pension:{category:"descuento",allowed_sides:["credit"]},solidarity_fund:{category:"descuento",allowed_sides:["credit"]},withholding_tax:{category:"descuento",allowed_sides:["credit"]},deduction_other:{category:"descuento",allowed_sides:["credit"]},embargo:{category:"descuento",allowed_sides:["credit"]},cxc:{category:"descuento",allowed_sides:["credit"]},libranza:{category:"descuento",allowed_sides:["credit"]},prestamos:{category:"descuento",allowed_sides:["credit"]},employer_health:{category:"aportes",allowed_sides:["debit","credit"]},employer_pension:{category:"aportes",allowed_sides:["debit","credit"]},employer_arl:{category:"aportes",allowed_sides:["debit","credit"]},sena:{category:"aportes",allowed_sides:["debit","credit"]},icbf:{category:"aportes",allowed_sides:["debit","credit"]},caja_comp:{category:"aportes",allowed_sides:["debit","credit"]},cesantias:{category:"provision",allowed_sides:["debit","credit"]},intereses_ces:{category:"provision",allowed_sides:["debit","credit"]},prima:{category:"provision",allowed_sides:["debit","credit"]},vacaciones:{category:"provision",allowed_sides:["debit","credit"]}};function Wt(e){var t;return Hn[e]||{category:"devengo",allowed_sides:[(((t=Me[e])==null?void 0:t.default_side)||"debit")==="credit"?"credit":"debit"]}}function Gn(e){return Ca[e]||e||"Sin categoría"}function zn(e){return Va.filter(t=>Wt(t.key).category===e)}const Yt=[{key:"hed",label:"Extra Diurna (HED)",factor:1.25},{key:"hen",label:"Extra Nocturna (HEN)",factor:1.75},{key:"rno",label:"Recargo Nocturno Ordinario",factor:.35},{key:"heddf",label:"Hora Extra Diurna Dominical/Festiva (HEDDF)",factor:2},{key:"hendf",label:"Hora Extra Nocturna Dominical/Festiva (HENDF)",factor:2.5},{key:"rdfd",label:"Recargo Dominical/Festivo Diurno",factor:.75}],Be={1:.00522,2:.01044,3:.02436,4:.0435,5:.0696},ne=e=>Math.round((Number(e)||0)*100)/100;function Ta(e){return`${(e==null?void 0:e.doc_number)||""} - ${(e==null?void 0:e.name)||""}`.trim()}function Ia(e,t){return t&&(Array.isArray(e)?e:[]).find(a=>a.id===t)||null}function lt({terceros:e,hiddenId:t,inputId:a,resultsId:o,onSelected:s}){const n=document.getElementById(t),i=document.getElementById(a),r=document.getElementById(o);if(!n||!i||!r)return;const c=(u="")=>{const b=Array.isArray(e)?e:[],m=String(u||"").toLowerCase().trim(),p=m?m.split(/\s+/).filter(Boolean):[],f=(p.length?b.filter(d=>{const y=`${d.doc_number||""} ${d.name||""}`.toLowerCase();return p.every(v=>y.includes(v))}):b).slice(0,30);r.innerHTML=`
      <button type="button" data-third-id="" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer;border-bottom:1px solid #F1F5F9">Sin tercero</button>
      ${f.map(d=>`
        <button type="button" data-third-id="${esc(d.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
          <div style="font-weight:600">${esc(d.doc_number||"SIN DOC")}</div>
          <div style="font-size:12px;color:#6B7280">${esc(d.name||"")}</div>
        </button>
      `).join("")}
    `};(()=>{const u=Ia(e,n.value);i.value=u?Ta(u):""})(),i.onfocus=()=>{c(i.value),r.style.display="block"},i.oninput=()=>{n.value="",typeof s=="function"&&s(""),c(i.value),r.style.display="block"},i.onblur=()=>setTimeout(()=>{r.style.display="none"},120),r.onmousedown=u=>u.preventDefault(),r.onclick=u=>{const b=u.target.closest("[data-third-id]");if(!b)return;const m=b.getAttribute("data-third-id")||"";n.value=m;const p=Ia(e,m);i.value=p?Ta(p):"",r.style.display="none",typeof s=="function"&&s(m)}}function aa(){return{balancing_account_id:"",mappings:[],employee_groups:[],group_rules:[],company_rules:{smmlv:1423500,solidarity_threshold_smmlv:3,solidarity_rate:.01,exempt_sena_icbf:!1,weekly_hours:44,tercero_sena_id:"",tercero_icbf_id:""},employee_rules:[]}}function kt(e){const t=e&&typeof e=="object"?e:{},a=Array.isArray(t.mappings)?t.mappings:[],o=Array.isArray(t.employee_groups)?t.employee_groups:[],s=Array.isArray(t.group_rules)?t.group_rules:[],n=t.company_rules&&typeof t.company_rules=="object"?t.company_rules:{},i=Array.isArray(t.employee_rules)?t.employee_rules:[];return{balancing_account_id:t.balancing_account_id||"",mappings:a.map((r,c)=>({id:r.id||`m-${Date.now()}-${c}`,concept:r.concept||"",side:r.side==="credit"?"credit":"debit",account_id:r.account_id||"",employee_id:r.employee_id||"",group_id:r.group_id||"",active:r.active!==!1})).filter(r=>r.concept&&r.account_id),employee_groups:o.map((r,c)=>({id:r.id||`g-${Date.now()}-${c}`,name:(r.name||"").trim(),active:r.active!==!1})).filter(r=>r.name),group_rules:s.map(r=>({group_id:r.group_id||"",basic_salary:Number(r.basic_salary)>=0?Number(r.basic_salary):0,arl_risk_level:Math.max(1,Math.min(5,parseInt(r.arl_risk_level||1,10)||1)),is_pensioner:!!r.is_pensioner,apply_solidarity_fund:!!r.apply_solidarity_fund,apply_withholding_tax:!!r.apply_withholding_tax,withholding_rate:Number(r.withholding_rate)>=0?Number(r.withholding_rate):0})).filter(r=>r.group_id),company_rules:{smmlv:Number(n.smmlv)>0?Number(n.smmlv):1423500,solidarity_threshold_smmlv:Number(n.solidarity_threshold_smmlv)>0?Number(n.solidarity_threshold_smmlv):3,solidarity_rate:Number(n.solidarity_rate)>=0?Number(n.solidarity_rate):.01,exempt_sena_icbf:!!n.exempt_sena_icbf,weekly_hours:[42,44,46,47,48].includes(Number(n.weekly_hours))?Number(n.weekly_hours):44,tercero_sena_id:n.tercero_sena_id||"",tercero_icbf_id:n.tercero_icbf_id||""},employee_rules:i.map(r=>({employee_id:r.employee_id||"",group_id:r.group_id||"",basic_salary:r.basic_salary===null||r.basic_salary===void 0||r.basic_salary===""?null:Number(r.basic_salary)>=0?Number(r.basic_salary):null,arl_risk_level:r.arl_risk_level===null||r.arl_risk_level===void 0||r.arl_risk_level===""?null:Math.max(1,Math.min(5,parseInt(r.arl_risk_level,10)||1)),is_pensioner:typeof r.is_pensioner=="boolean"?r.is_pensioner:null,apply_solidarity_fund:typeof r.apply_solidarity_fund=="boolean"?r.apply_solidarity_fund:null,apply_withholding_tax:typeof r.apply_withholding_tax=="boolean"?r.apply_withholding_tax:null,withholding_rate:r.withholding_rate===null||r.withholding_rate===void 0||r.withholding_rate===""?null:Number(r.withholding_rate)>=0?Number(r.withholding_rate):null,tercero_salud_id:r.tercero_salud_id||"",tercero_pension_id:r.tercero_pension_id||"",tercero_arl_id:r.tercero_arl_id||"",tercero_caja_id:r.tercero_caja_id||""})).filter(r=>r.employee_id)}}function qn(e){const t=kt(e);return{balancing_account_id:t.balancing_account_id||"",mappings:(t.mappings||[]).map(a=>({id:a.id||"",concept:a.concept||"",side:a.side==="credit"?"credit":"debit",account_id:a.account_id||"",employee_id:a.employee_id||"",group_id:a.group_id||"",active:a.active!==!1})),employee_groups:(t.employee_groups||[]).map(a=>({id:a.id||"",name:(a.name||"").trim(),active:a.active!==!1})),group_rules:t.group_rules||[],company_rules:t.company_rules||{},employee_rules:(t.employee_rules||[]).map(a=>{const o={employee_id:a.employee_id||""};return a.group_id&&(o.group_id=a.group_id),a.basic_salary!==null&&a.basic_salary!==void 0&&(o.basic_salary=Number(a.basic_salary||0)),a.arl_risk_level!==null&&a.arl_risk_level!==void 0&&(o.arl_risk_level=Number(a.arl_risk_level||1)),typeof a.is_pensioner=="boolean"&&(o.is_pensioner=a.is_pensioner),typeof a.apply_solidarity_fund=="boolean"&&(o.apply_solidarity_fund=a.apply_solidarity_fund),typeof a.apply_withholding_tax=="boolean"&&(o.apply_withholding_tax=a.apply_withholding_tax),a.withholding_rate!==null&&a.withholding_rate!==void 0&&(o.withholding_rate=Number(a.withholding_rate||0)),a.tercero_salud_id&&(o.tercero_salud_id=a.tercero_salud_id),a.tercero_pension_id&&(o.tercero_pension_id=a.tercero_pension_id),a.tercero_arl_id&&(o.tercero_arl_id=a.tercero_arl_id),a.tercero_caja_id&&(o.tercero_caja_id=a.tercero_caja_id),o})}}async function la(){var i;const e=await pb.list("settings",{perPage:200,page:1,filter:`key~"${pb.escapeFilterValue(Ze+"_")}"`}),t={};if(((e==null?void 0:e.items)||[]).forEach(r=>{t[r.key]=r}),Object.keys(Ne).some(r=>!!t[Ne[r]])){const r=await $t(Ne.core,{}),c={balancing_account_id:(r==null?void 0:r.balancing_account_id)||"",company_rules:r!=null&&r.company_rules&&typeof r.company_rules=="object"?r.company_rules:{},mappings:await $t(Ne.mappings,[]),employee_groups:await $t(Ne.employee_groups,[]),group_rules:await $t(Ne.group_rules,[]),employee_rules:await $t(Ne.employee_rules,[])};return{row:t[Ne.core]||null,config:kt(c)}}const o=pb.escapeFilterValue(Ze),s=await pb.list("settings",{perPage:1,page:1,filter:`key="${o}"`}),n=((i=s==null?void 0:s.items)==null?void 0:i[0])||null;if(!n)return{row:null,config:aa()};try{return{row:n,config:kt(JSON.parse(n.value||"{}"))}}catch{return{row:n,config:aa()}}}function Wn(e,t=Ea){const a=String(e||"");if(!a)return[""];const o=[];for(let s=0;s<a.length;s+=t)o.push(a.slice(s,s+t));return o}function lo(e,t){return`${e}_part_${String(t+1).padStart(3,"0")}`}async function Xo(e){const t=pb.escapeFilterValue(e),a=await pb.list("settings",{perPage:200,page:1,filter:`key~"${t}"`});return(Array.isArray(a==null?void 0:a.items)?a.items:[]).filter(s=>String(s.key||"").startsWith(e))}async function po(e){var s;const t=pb.escapeFilterValue(e),a=await pb.list("settings",{perPage:1,page:1,filter:`key="${t}"`}),o=((s=a==null?void 0:a.items)==null?void 0:s[0])||null;o!=null&&o.id&&await pb.delete("settings",o.id)}async function $t(e,t){var r;const a=`${e}_part_`,o=await Xo(a);if(o.length){const l=o.slice().sort((u,b)=>String(u.key||"").localeCompare(String(b.key||""))).map(u=>String(u.value||"")).join("");try{return JSON.parse(l||"null")??t}catch{return t}}const s=pb.escapeFilterValue(e),n=await pb.list("settings",{perPage:1,page:1,filter:`key="${s}"`}),i=((r=n==null?void 0:n.items)==null?void 0:r[0])||null;if(!(i!=null&&i.value))return t;try{return JSON.parse(i.value)}catch{return t}}async function uo(e,t){var n;const a=pb.escapeFilterValue(e),o=await pb.list("settings",{perPage:1,page:1,filter:`key="${a}"`}),s=((n=o==null?void 0:o.items)==null?void 0:n[0])||null;if(s!=null&&s.id)try{return await pb.update("settings",s.id,{value:t})}catch(i){if((i==null?void 0:i.status)!==400)throw i;return await pb.delete("settings",s.id).catch(()=>{}),pb.create("settings",{key:e,value:t})}return pb.create("settings",{key:e,value:t})}async function Yn(e,t){const a=JSON.stringify(t),o=`${e}_part_`,s=await Xo(o);if(a.length<=Ea){await uo(e,a);for(const i of s)await pb.delete("settings",i.id).catch(()=>{});return}const n=Wn(a,Ea);for(let i=0;i<n.length;i++)await uo(lo(e,i),n[i]);for(let i=n.length;i<s.length;i++){const r=lo(e,i);await po(r).catch(()=>{})}await po(e).catch(()=>{})}async function es(e,t=""){const a=qn(e),o={balancing_account_id:a.balancing_account_id||"",company_rules:a.company_rules||{}},s=[[Ne.core,o],[Ne.mappings,a.mappings||[]],[Ne.employee_groups,a.employee_groups||[]],[Ne.group_rules,a.group_rules||[]],[Ne.employee_rules,a.employee_rules||[]]];for(const[n,i]of s)try{await Yn(n,i)}catch(r){const c=r!=null&&r.message?`: ${r.message}`:"";throw new Error(`Error guardando configuración de nómina en ${n}${c}`)}}function Mt(e){if(!(e!=null&&e.notes))return{};try{const t=JSON.parse(e.notes);if(t&&typeof t=="object"&&t.payroll_meta&&typeof t.payroll_meta=="object")return t.payroll_meta}catch{}return{}}function Je(e,t){const o=(Array.isArray(e==null?void 0:e.employee_rules)?e.employee_rules:[]).find(n=>n.employee_id===t),s={employee_id:t||"",group_id:(o==null?void 0:o.group_id)||"",basic_salary:0,arl_risk_level:1,is_pensioner:!1,apply_solidarity_fund:!1,apply_withholding_tax:!1,withholding_rate:0,tercero_salud_id:"",tercero_pension_id:"",tercero_arl_id:"",tercero_caja_id:""};return o&&(o.group_id&&(s.group_id=o.group_id),o.basic_salary!==null&&o.basic_salary!==void 0&&(s.basic_salary=Number(o.basic_salary||0)),o.arl_risk_level!==null&&o.arl_risk_level!==void 0&&(s.arl_risk_level=Math.max(1,Math.min(5,parseInt(o.arl_risk_level||1,10)||1))),typeof o.is_pensioner=="boolean"&&(s.is_pensioner=o.is_pensioner),typeof o.apply_solidarity_fund=="boolean"&&(s.apply_solidarity_fund=o.apply_solidarity_fund),typeof o.apply_withholding_tax=="boolean"&&(s.apply_withholding_tax=o.apply_withholding_tax),o.withholding_rate!==null&&o.withholding_rate!==void 0&&(s.withholding_rate=Number(o.withholding_rate||0)),o.tercero_salud_id&&(s.tercero_salud_id=o.tercero_salud_id),o.tercero_pension_id&&(s.tercero_pension_id=o.tercero_pension_id),o.tercero_arl_id&&(s.tercero_arl_id=o.tercero_arl_id),o.tercero_caja_id&&(s.tercero_caja_id=o.tercero_caja_id)),s}function mo(e,t){return(Array.isArray(e==null?void 0:e.employee_rules)?e.employee_rules:[]).find(o=>o.employee_id===t)||null}function oa(e){return!!e&&Number(e.basic_salary||0)>0}function Ot(e){const t=Mt(e),a=ne(t.solidarity_fund||0),o=ne(t.withholding_tax||0);return{solidarity:a,withholding:o,total:ne(a+o)}}function ts(e){const t=Mt(e),a=t&&typeof t.concept_amounts=="object"&&t.concept_amounts?t.concept_amounts:{},o={};return[...ke,...Oe].forEach(s=>{o[s]=ne(Number(a[s]||0))}),o}function ja(e){const t=Mt(e),a=t&&typeof t.overtime_breakdown=="object"&&t.overtime_breakdown?t.overtime_breakdown:{},o=Yt.map(i=>{const r=a[i.key]&&typeof a[i.key]=="object"?a[i.key]:{};return{key:i.key,label:i.label,factor:i.factor,hours:ne(Number(r.hours||0)),amount:ne(Number(r.amount||0))}}),s=ne(o.reduce((i,r)=>i+(r.amount||0),0)),n=o.some(i=>i.hours>0||i.amount>0);return{hourly_rate:ne(Number(a.hourly_rate||0)),breakdown:o,total_amount:n?s:ne(Number((e==null?void 0:e.overtime)||0)),hasBreakdown:n}}function da(e){const t=ts(e),a=ne(ke.reduce((s,n)=>s+(t[n]||0),0)),o=ne(Oe.reduce((s,n)=>s+(t[n]||0),0));return{conceptAmounts:t,earnings:a,deductions:o}}function as(e,t){return!e||!t?0:t==="solidarity_fund"?Ot(e).solidarity:t==="withholding_tax"?Ot(e).withholding:t==="overtime"?ja(e).total_amount:ke.includes(t)||Oe.includes(t)?ts(e)[t]||0:ne(e[t]||0)}function mt(e){const t=da(e);return ne(((e==null?void 0:e.salary_base)||0)+((e==null?void 0:e.transport_allowance)||0)+as(e,"overtime")+t.earnings)}function Bt(e){const t=Ot(e),a=da(e);return ne(((e==null?void 0:e.deduction_health)||0)+((e==null?void 0:e.deduction_pension)||0)+((e==null?void 0:e.deduction_other)||0)+t.total+a.deductions)}function Rc(e,t,a,o=""){const s=(e||[]).filter(r=>r.active!==!1),n=s.find(r=>r.concept===t&&r.employee_id===a);if(n)return n;const i=o?s.find(r=>r.concept===t&&r.group_id===o&&!r.employee_id):null;return i||s.find(r=>r.concept===t&&!r.employee_id&&!r.group_id)||null}function Jn(e,t,a,o=""){const s=(e||[]).filter(i=>i.active!==!1&&i.concept===t),n=[];for(const i of["debit","credit"]){const r=s.filter(b=>b.side===i);if(!r.length)continue;const c=r.find(b=>b.employee_id===a);if(c){n.push(c);continue}const l=o?r.find(b=>b.group_id===o&&!b.employee_id):null;if(l){n.push(l);continue}const u=r.find(b=>!b.employee_id&&!b.group_id);u&&n.push(u)}return n}function Kn(e,t,a,o){const s=t.employee_id||"";switch(e){case"net_pay":case"cesantias":case"intereses_ces":case"prima":case"vacaciones":return s;case"deduction_health":case"employer_health":return a.tercero_salud_id||"";case"deduction_pension":case"employer_pension":return a.tercero_pension_id||"";case"employer_arl":return a.tercero_arl_id||"";case"caja_comp":return a.tercero_caja_id||"";case"sena":return o.tercero_sena_id||"";case"icbf":return o.tercero_icbf_id||"";default:return s}}function Qn(e,t,a){var s,n;const o=((n=(s=a.expand)==null?void 0:s.employee_id)==null?void 0:n.doc_number)||a.employee_id||"";return e==="net_pay"?`NOM-${t}-EMP-${o}`:""}async function Zn(e,t,a){var b,m;const o=[],s={},n=a.company_rules||{},i=(e.date_from||e.date_to||"").slice(0,7).replace("-","");for(const p of t){const f=Je(a,p.employee_id);for(const d of Va){const y=as(p,d.key);if(y<=0)continue;const v=Jn(a.mappings,d.key,p.employee_id,f.group_id||"");if(!v.length){o.push({employee:((m=(b=p.expand)==null?void 0:b.employee_id)==null?void 0:m.name)||"Empleado",concept:d.label});continue}const g=Kn(d.key,p,f,n),h=Qn(d.key,i,p);for(const _ of v){const A=_.side==="credit"?"credit":"debit",I=`${_.account_id}__${A}__${g}`;s[I]||(s[I]={account_id:_.account_id,third_party_id:g||void 0,cross_doc_ref:h||void 0,debit:0,credit:0,description:`Nómina ${e.name} - ${d.label}`}),A==="debit"?s[I].debit=ne(s[I].debit+y):s[I].credit=ne(s[I].credit+y)}}}if(o.length){const p=o.slice(0,3).map(f=>`${f.employee}: ${f.concept}`).join(" | ");throw new Error(`Faltan mapeos contables para algunos conceptos de nómina. ${p}`)}const r=Object.values(s).filter(p=>p.debit>0||p.credit>0),c=ne(r.reduce((p,f)=>p+(f.debit||0),0)),l=ne(r.reduce((p,f)=>p+(f.credit||0),0)),u=ne(c-l);if(Math.abs(u)>.01){if(!a.balancing_account_id)throw new Error(`La nómina no está cuadrada (D ${fmt(c)} / C ${fmt(l)}). Configura una cuenta de ajuste en el engranaje de Nómina.`);r.push({account_id:a.balancing_account_id,debit:u<0?Math.abs(u):0,credit:u>0?Math.abs(u):0,description:`Ajuste de cuadre nómina ${e.name}`})}return r}async function Xn(e){var p;const t=await pb.get("payroll_periods",e);if(t.tx_id)return t.tx_id;const a=await pb.listAll("payroll_lines",{filter:`period_id="${pb.escapeFilterValue(e)}"`,expand:"employee_id"});if(!a.length)throw new Error("El período no tiene liquidaciones para contabilizar.");const o=await API.getTxTypes(),s=o.find(f=>f.code==="NM")||o.find(f=>(f.name||"").toLowerCase().includes("nomina"));if(!s)throw new Error("No existe tipo de transacción activo para Nómina (código NM).");const{config:n}=await la();if(!n.mappings.length)throw new Error("Primero configura los mapeos contables de nómina (botón de engranaje).");const i=await Zn(t,a,n);if(!i.length)throw new Error("No hay líneas contables para generar en este período.");const r=[...new Set(i.map(f=>f.account_id).filter(Boolean))],c=await pb.listAll("accounts",{filter:r.map(f=>`id="${pb.escapeFilterValue(f)}"`).join("||")}).catch(()=>[]),l={};c.forEach(f=>{l[f.id]=f});const u=[];if(i.forEach(f=>{const d=l[f.account_id];d&&(d.requires_third_party&&!f.third_party_id&&u.push(`Cuenta ${d.code} - ${d.name}: requiere tercero pero no está asignado.`),d.maneja_cruce&&!f.cross_doc_ref&&u.push(`Cuenta ${d.code} - ${d.name}: requiere cruce pero no tiene referencia.`))}),u.length)throw new Error(`Errores de validación contable:
${u.slice(0,5).join(`
`)}`);const b=((p=a.find(f=>!!f.employee_id))==null?void 0:p.employee_id)||"";return(await API.createTransaction({tx_type_id:s.id,date:t.date_to||todayStr(),description:`Nómina ${t.name}`,third_party_id:b||void 0},i)).id}async function ei(e=[]){var t,a,o,s,n,i,r,c;try{const[{row:l,config:u},b,m]=await Promise.all([la(),pb.listAll("accounts",{filter:"active=true",sort:"code"}),pb.listAll("third_parties",{filter:"active=true",sort:"name"})]);if(!b.length)return showToast("No hay cuentas activas para mapear.","warning");const p={rowId:(l==null?void 0:l.id)||"",config:kt(u)},f=`<option value="">Selecciona cuenta...</option>${b.map(S=>`<option value="${esc(S.id)}">${esc(S.code)} - ${esc(S.name)}</option>`).join("")}`,d=`<option value="">Selecciona categoría...</option>${Object.keys(Ca).map(S=>`<option value="${esc(S)}">${esc(Ca[S])}</option>`).join("")}`,y=()=>`<option value="">Selecciona grupo...</option>${(p.config.employee_groups||[]).map(S=>`<option value="${esc(S.id)}">${esc(S.name)}</option>`).join("")}`;openModal("Configuración Contable de Nómina",`
      <div class="space-y-4">
        <div class="rounded-xl p-3 text-sm" style="background:#F8FAFC;border:1px solid #E2E8F0;color:#334155">
          Configura mapeos contables por grupo para reutilizar reglas contables en grandes volúmenes de empleados.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group">
            <label class="form-label">Jornada laboral semanal (Ley 2101/2021)</label>
            <select id="nom-weekly-hours" class="form-input">
              <option value="48" ${(p.config.company_rules.weekly_hours||44)===48?"selected":""}>48 h/sem (antes Jul 2023)</option>
              <option value="47" ${(p.config.company_rules.weekly_hours||44)===47?"selected":""}>47 h/sem (Jul 2023 – Jun 2024)</option>
              <option value="46" ${(p.config.company_rules.weekly_hours||44)===46?"selected":""}>46 h/sem (Jul 2024 – Jun 2025)</option>
              <option value="44" ${(p.config.company_rules.weekly_hours||44)===44?"selected":""}>44 h/sem (Jul 2025 – Jun 2026)</option>
              <option value="42" ${(p.config.company_rules.weekly_hours||44)===42?"selected":""}>42 h/sem (desde Jul 2026)</option>
            </select>
            <p class="text-xs mt-1" style="color:#6B7280">Define el valor hora base para liquidar horas extra y recargos.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Cuenta de Ajuste (opcional)</label>
            <select id="nom-balancing-account" class="form-input">${f}</select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group">
            <label class="form-label">Tercero SENA</label>
            <div class="relative">
              <input id="nom-tercero-sena-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre">
              <input id="nom-tercero-sena" type="hidden" value="${esc(p.config.company_rules.tercero_sena_id||"")}">
              <div id="nom-tercero-sena-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tercero ICBF</label>
            <div class="relative">
              <input id="nom-tercero-icbf-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre">
              <input id="nom-tercero-icbf" type="hidden" value="${esc(p.config.company_rules.tercero_icbf_id||"")}">
              <div id="nom-tercero-icbf-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="form-group">
            <label class="form-label">SMMLV vigente</label>
            <input id="nom-smmlv" class="form-input" type="number" min="1" step="1" value="${esc(String(p.config.company_rules.smmlv||1423500))}">
          </div>
          <div class="form-group">
            <label class="form-label">Umbral fondo solidaridad (SMMLV)</label>
            <input id="nom-sol-threshold" class="form-input" type="number" min="0" step="0.01" value="${esc(String(p.config.company_rules.solidarity_threshold_smmlv||3))}">
          </div>
          <div class="form-group">
            <label class="form-label">Tarifa fondo solidaridad (%)</label>
            <input id="nom-sol-rate" class="form-input" type="number" min="0" step="0.01" value="${esc(String((p.config.company_rules.solidarity_rate||.01)*100))}">
          </div>
          <div class="form-group flex items-end pb-1">
            <label class="inline-flex items-center gap-2 text-sm" style="color:#334155">
              <input id="nom-exempt-sena-icbf" type="checkbox" ${p.config.company_rules.exempt_sena_icbf?"checked":""}>
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
            <select id="nom-map-category" class="form-input">${d}</select>
            <select id="nom-map-concept" class="form-input"><option value="">Selecciona concepto...</option></select>
            <select id="nom-map-account-debit" class="form-input">${f}</select>
            <select id="nom-map-account-credit" class="form-input">${f}</select>
            <button class="btn btn-primary" id="btn-add-map"><i class="fas fa-plus"></i> Agregar</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table text-sm">
            <thead><tr><th>Grupo</th><th>Categoría</th><th>Concepto</th><th>Cuenta Débito</th><th>Cuenta Crédito</th><th></th></tr></thead>
            <tbody id="nom-map-body"></tbody>
          </table>
        </div>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" id="btn-save-nom-config">Guardar Configuración</button>',!0);const v={};b.forEach(S=>{v[S.id]=S});const g=()=>{const S={};return(p.config.employee_groups||[]).forEach(x=>{S[x.id]=x}),S};$("#nom-balancing-account")&&($("#nom-balancing-account").value=p.config.balancing_account_id||""),lt({terceros:m,hiddenId:"nom-tercero-sena",inputId:"nom-tercero-sena-search",resultsId:"nom-tercero-sena-results"}),lt({terceros:m,hiddenId:"nom-tercero-icbf",inputId:"nom-tercero-icbf-search",resultsId:"nom-tercero-icbf-results"});const h=()=>{const S=$("#nom-map-group"),x=S?S.value:"";if(S){const T=(p.config.employee_groups||[]).map(E=>`<option value="${esc(E.id)}">${esc(E.name)}</option>`).join("");S.innerHTML=`<option value="">Selecciona grupo...</option>${T}`,x&&(p.config.employee_groups||[]).some(E=>E.id===x)&&(S.value=x)}},_=()=>{const S=getSelectVal("nom-map-category"),x=$("#nom-map-concept");if(!x)return;const T=S?zn(S).map(E=>`<option value="${esc(E.key)}">${esc(E.label)}</option>`).join(""):"";x.innerHTML=`<option value="">Selecciona concepto...</option>${T}`},A=()=>{const S=getSelectVal("nom-map-concept"),x=$("#nom-map-account-debit"),T=$("#nom-map-account-credit");if(!S){x&&(x.disabled=!0,x.value=""),T&&(T.disabled=!0,T.value="");return}const E=Wt(S),C=Array.isArray(E.allowed_sides)?E.allowed_sides:["debit"];if(x){const N=C.includes("debit");x.disabled=!N,N||(x.value="")}if(T){const N=C.includes("credit");T.disabled=!N,N||(T.value="")}},I=()=>{const S=$("#nom-groups-body");if(!S)return;const x=p.config.employee_groups||[];S.innerHTML=x.length?x.map(T=>`<tr><td>${esc(T.name)}</td><td class="text-right"><button class="btn btn-outline btn-sm btn-del-group" data-id="${esc(T.id)}"><i class="fas fa-trash"></i></button></td></tr>`).join(""):'<tr><td colspan="2" class="text-center py-6" style="color:#9CA3AF">Sin grupos definidos.</td></tr>',h()},F=()=>{const S=$("#nom-map-body");if(!S)return;const x=g(),T={};(p.config.mappings||[]).forEach(C=>{if(C.employee_id)return;const N=C.group_id||"",L=`${N}__${C.concept}`;T[L]||(T[L]={group_id:N,concept:C.concept,debit_account_id:"",credit_account_id:""}),C.side==="credit"?T[L].credit_account_id=C.account_id||"":T[L].debit_account_id=C.account_id||""});const E=Object.values(T).filter(C=>{const N=getSelectVal("nom-map-group")||"";return N?(C.group_id||"")===N:!0}).sort((C,N)=>{var M,B,j,Y;const L=((M=x[C.group_id])==null?void 0:M.name)||"",O=((B=x[N.group_id])==null?void 0:B.name)||"";return L!==O?L.localeCompare(O):(((j=Me[C.concept])==null?void 0:j.label)||C.concept).localeCompare(((Y=Me[N.concept])==null?void 0:Y.label)||N.concept)});S.innerHTML=E.length?E.map(C=>{var j,Y;const N=C.group_id?((j=x[C.group_id])==null?void 0:j.name)||"Grupo no encontrado":"Sin grupo",L=((Y=Me[C.concept])==null?void 0:Y.label)||C.concept,O=Gn(Wt(C.concept).category),M=v[C.debit_account_id]?`${v[C.debit_account_id].code} - ${v[C.debit_account_id].name}`:"—",B=v[C.credit_account_id]?`${v[C.credit_account_id].code} - ${v[C.credit_account_id].name}`:"—";return`<tr>
            <td>${esc(N)}</td>
            <td>${esc(O)}</td>
            <td>${esc(L)}</td>
            <td>${esc(M)}</td>
            <td>${esc(B)}</td>
            <td class="text-right"><button class="btn btn-outline btn-sm btn-del-map" data-group="${esc(C.group_id||"")}" data-concept="${esc(C.concept)}"><i class="fas fa-trash"></i></button></td>
          </tr>`}).join(""):'<tr><td colspan="6" class="text-center py-6" style="color:#9CA3AF">Sin mapeos configurados para el grupo seleccionado.</td></tr>'};I(),F(),(t=$("#btn-add-group"))==null||t.addEventListener("click",()=>{const S=(getInputVal("nom-group-name")||"").trim();if(!S)return showToast("Ingresa un nombre para el grupo.","warning");if((p.config.employee_groups||[]).some(T=>(T.name||"").toLowerCase()===S.toLowerCase()))return showToast("Ya existe un grupo con ese nombre.","info");p.config.employee_groups.push({id:`g-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:S,active:!0}),setInputVal("nom-group-name",""),I(),F()}),(a=$("#nom-groups-body"))==null||a.addEventListener("click",S=>{var E,C;const x=(C=(E=S.target)==null?void 0:E.closest)==null?void 0:C.call(E,".btn-del-group");if(!x)return;const T=x.getAttribute("data-id")||"";p.config.employee_groups=(p.config.employee_groups||[]).filter(N=>N.id!==T),p.config.mappings=(p.config.mappings||[]).filter(N=>N.group_id!==T),p.config.employee_rules=(p.config.employee_rules||[]).map(N=>N.group_id===T?{...N,group_id:""}:N),I(),F()}),(o=$("#btn-add-map"))==null||o.addEventListener("click",()=>{const S=getSelectVal("nom-map-group"),x=getSelectVal("nom-map-category"),T=getSelectVal("nom-map-concept"),E=getSelectVal("nom-map-account-debit"),C=getSelectVal("nom-map-account-credit");if(!S)return showToast("Selecciona un grupo para el mapeo contable.","warning");if(!x)return showToast("Selecciona una categoría.","warning");if(!T)return showToast("Selecciona un concepto.","warning");const N=Wt(T),L=Array.isArray(N.allowed_sides)?N.allowed_sides:["debit"];if(N.category!==x)return showToast("El concepto no pertenece a la categoría seleccionada.","warning");if(L.includes("debit")&&!E)return showToast("Este concepto requiere cuenta débito.","warning");if(L.includes("credit")&&!C)return showToast("Este concepto requiere cuenta crédito.","warning");const O=(M,B)=>{const j=(p.config.mappings||[]).find(Y=>Y.concept===T&&(Y.group_id||"")===(S||"")&&!Y.employee_id&&Y.side===M);if(j){j.account_id=B,j.active=!0;return}p.config.mappings.push({id:`m-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,employee_id:"",group_id:S||"",concept:T,side:M,account_id:B,active:!0})};p.config.mappings=(p.config.mappings||[]).filter(M=>M.employee_id||M.concept!==T||(M.group_id||"")!==(S||"")?!0:L.includes(M.side==="credit"?"credit":"debit")),L.includes("debit")&&O("debit",E),L.includes("credit")&&O("credit",C),F(),showToast("Mapeo actualizado","success")}),(s=$("#nom-map-group"))==null||s.addEventListener("change",()=>{F()}),(n=$("#nom-map-category"))==null||n.addEventListener("change",()=>{_(),A()}),(i=$("#nom-map-concept"))==null||i.addEventListener("change",A),h(),_(),A(),(r=$("#nom-map-body"))==null||r.addEventListener("click",S=>{var C,N;const x=(N=(C=S.target)==null?void 0:C.closest)==null?void 0:N.call(C,".btn-del-map");if(!x)return;const T=x.getAttribute("data-concept")||"",E=x.getAttribute("data-group")||"";p.config.mappings=(p.config.mappings||[]).filter(L=>L.employee_id||L.concept!==T?!0:(L.group_id||"")!==E),F()}),(c=$("#btn-save-nom-config"))==null||c.addEventListener("click",async()=>{var S;try{p.config.balancing_account_id=getSelectVal("nom-balancing-account")||"",p.config.company_rules={smmlv:Math.max(1,parseNum(getInputVal("nom-smmlv"))||1423500),solidarity_threshold_smmlv:Math.max(0,parseNum(getInputVal("nom-sol-threshold"))||3),solidarity_rate:Math.max(0,(parseNum(getInputVal("nom-sol-rate"))||1)/100),exempt_sena_icbf:!!((S=$("#nom-exempt-sena-icbf"))!=null&&S.checked),weekly_hours:[42,44,46,47,48].includes(Number(getInputVal("nom-weekly-hours")))?Number(getInputVal("nom-weekly-hours")):44,tercero_sena_id:getSelectVal("nom-tercero-sena")||"",tercero_icbf_id:getSelectVal("nom-tercero-icbf")||""},await es(p.config,p.rowId),closeModal(),showToast("Configuración de nómina guardada","success")}catch(x){showToast(x.message||"No se pudo guardar la configuración","error")}})}catch(l){showToast(l.message||"No se pudo abrir la configuración de nómina","error")}}async function ti(e=[]){var t,a,o,s,n;try{const[{row:i,config:r},c]=await Promise.all([la(),pb.listAll("third_parties",{filter:"active=true",sort:"name"})]),l={rowId:(i==null?void 0:i.id)||"",config:kt(r),editingEmployeeId:""},u=`<option value="">Selecciona empleado...</option>${e.map(g=>`<option value="${esc(g.id)}">${esc(g.doc_number||"")} - ${esc(g.name)}</option>`).join("")}`,b=`<option value="">Sin grupo</option>${(l.config.employee_groups||[]).map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join("")}`,m={};(l.config.employee_groups||[]).forEach(g=>{m[g.id]=g.name});const p=g=>`Nivel ${g} (${ne((Be[g]||Be[1])*100)}%)`;openModal("Parámetros por Empleado — Nómina",`
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
              <select id="nom-emp-rule-employee" class="form-input">${u}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Tipo / Grupo</label>
              <select id="nom-emp-rule-group" class="form-input">${b}</select>
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
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" id="btn-save-nom-employee-rules">Guardar Cambios</button>',!0);const f=()=>{l.editingEmployeeId="",setInputVal("nom-emp-rule-employee",""),setInputVal("nom-emp-rule-group",""),setInputVal("nom-emp-rule-salary","0"),setInputVal("nom-emp-rule-arl","1"),$("#nom-emp-rule-pensioner")&&($("#nom-emp-rule-pensioner").checked=!1),$("#nom-emp-rule-solidarity")&&($("#nom-emp-rule-solidarity").checked=!1),$("#nom-emp-rule-withholding")&&($("#nom-emp-rule-withholding").checked=!1),setInputVal("nom-emp-rule-withholding-rate","0"),setInputVal("nom-emp-rule-tercero-salud",""),setInputVal("nom-emp-rule-tercero-pension",""),setInputVal("nom-emp-rule-tercero-arl",""),setInputVal("nom-emp-rule-tercero-caja",""),d()},d=()=>{[["nom-emp-rule-tercero-salud","nom-emp-rule-tercero-salud-search"],["nom-emp-rule-tercero-pension","nom-emp-rule-tercero-pension-search"],["nom-emp-rule-tercero-arl","nom-emp-rule-tercero-arl-search"],["nom-emp-rule-tercero-caja","nom-emp-rule-tercero-caja-search"]].forEach(([h,_])=>{const A=document.getElementById(h),I=document.getElementById(_);if(!A||!I)return;const F=Ia(c,A.value||"");I.value=F?Ta(F):""})},y=g=>{const h=mo(l.config,g)||{},_=Je(l.config,g);l.editingEmployeeId=g,setInputVal("nom-emp-rule-employee",g),setInputVal("nom-emp-rule-group",h.group_id||_.group_id||""),setInputVal("nom-emp-rule-salary",String(ne((h.basic_salary??_.basic_salary)||0))),setInputVal("nom-emp-rule-arl",String(h.arl_risk_level??_.arl_risk_level??1)),$("#nom-emp-rule-pensioner")&&($("#nom-emp-rule-pensioner").checked=!!(h.is_pensioner??_.is_pensioner)),$("#nom-emp-rule-solidarity")&&($("#nom-emp-rule-solidarity").checked=!!(h.apply_solidarity_fund??_.apply_solidarity_fund)),$("#nom-emp-rule-withholding")&&($("#nom-emp-rule-withholding").checked=!!(h.apply_withholding_tax??_.apply_withholding_tax)),setInputVal("nom-emp-rule-withholding-rate",String(ne((h.withholding_rate??_.withholding_rate??0)*100))),$("#nom-emp-rule-tercero-salud")&&($("#nom-emp-rule-tercero-salud").value=h.tercero_salud_id||""),$("#nom-emp-rule-tercero-pension")&&($("#nom-emp-rule-tercero-pension").value=h.tercero_pension_id||""),$("#nom-emp-rule-tercero-arl")&&($("#nom-emp-rule-tercero-arl").value=h.tercero_arl_id||""),$("#nom-emp-rule-tercero-caja")&&($("#nom-emp-rule-tercero-caja").value=h.tercero_caja_id||""),d()},v=()=>{const g=$("#nom-emp-rules-summary"),h=$("#nom-emp-rules-body");if(!h)return;const _=[...e].sort((I,F)=>(I.name||"").localeCompare(F.name||"")),A=_.filter(I=>!oa(Je(l.config,I.id)));g&&(g.innerHTML=A.length?`<div class="rounded-xl p-3 text-sm" style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B">
               <p class="font-semibold"><i class="fas fa-triangle-exclamation mr-1"></i>Parámetros incompletos: ${A.length} empleado(s)</p>
               <p class="mt-1">Pendientes de salario básico efectivo: ${esc(A.slice(0,8).map(I=>I.name).join(", "))}${A.length>8?"...":""}</p>
             </div>`:`<div class="rounded-xl p-3 text-sm" style="background:#F0FFF4;border:1px solid #BBF7D0;color:#166534">
               <p class="font-semibold"><i class="fas fa-circle-check mr-1"></i>Todos los empleados activos tienen parámetros completos para liquidación.</p>
             </div>`),h.innerHTML=_.length?_.map(I=>{const F=Je(l.config,I.id),S=mo(l.config,I.id),x=oa(F),T=F.group_id?m[F.group_id]||"Grupo no encontrado":"Sin grupo";return`<tr${x?"":' style="background:#FFF7ED"'}>
            <td>${esc(I.name||"Empleado")}</td>
            <td>${esc(T)}</td>
            <td>${x?'<span class="badge badge-green">Completo</span>':'<span class="badge" style="background:#FEE2E2;color:#991B1B">Pendiente</span>'}</td>
            <td>${fmt(F.basic_salary||0)}</td>
            <td>${esc(p(F.arl_risk_level||1))}</td>
            <td>${F.is_pensioner?"Sí":"No"}</td>
            <td>${F.apply_solidarity_fund?"Sí":"No"}</td>
            <td>${F.apply_withholding_tax?`${ne((F.withholding_rate||0)*100)}%`:"No"}</td>
            <td class="text-right">
              <div class="flex gap-1 justify-end">
                <button class="btn btn-outline btn-sm btn-edit-emp-rule" data-emp="${esc(I.id)}" title="Editar"><i class="fas fa-pen"></i></button>
                ${S?`<button class="btn btn-outline btn-sm btn-del-emp-rule" data-emp="${esc(I.id)}" title="Eliminar"><i class="fas fa-trash"></i></button>`:""}
              </div>
            </td>
          </tr>`}).join(""):'<tr><td colspan="9" class="text-center py-6" style="color:#9CA3AF">Sin empleados activos.</td></tr>'};v(),lt({terceros:c,hiddenId:"nom-emp-rule-tercero-salud",inputId:"nom-emp-rule-tercero-salud-search",resultsId:"nom-emp-rule-tercero-salud-results"}),lt({terceros:c,hiddenId:"nom-emp-rule-tercero-pension",inputId:"nom-emp-rule-tercero-pension-search",resultsId:"nom-emp-rule-tercero-pension-results"}),lt({terceros:c,hiddenId:"nom-emp-rule-tercero-arl",inputId:"nom-emp-rule-tercero-arl-search",resultsId:"nom-emp-rule-tercero-arl-results"}),lt({terceros:c,hiddenId:"nom-emp-rule-tercero-caja",inputId:"nom-emp-rule-tercero-caja-search",resultsId:"nom-emp-rule-tercero-caja-results"}),d(),(t=$("#nom-emp-rule-employee"))==null||t.addEventListener("change",()=>{const g=getSelectVal("nom-emp-rule-employee");g&&y(g)}),(a=$("#btn-nom-emp-rule-upsert"))==null||a.addEventListener("click",()=>{var I,F,S;const g=getSelectVal("nom-emp-rule-employee");if(!g)return showToast("Selecciona un empleado.","warning");const h=!!((I=$("#nom-emp-rule-withholding"))!=null&&I.checked),_=parseNum(getInputVal("nom-emp-rule-withholding-rate")),A={employee_id:g,group_id:getSelectVal("nom-emp-rule-group")||"",basic_salary:Math.max(0,parseNum(getInputVal("nom-emp-rule-salary"))||0),arl_risk_level:Math.max(1,Math.min(5,parseInt(getSelectVal("nom-emp-rule-arl")||"1",10)||1)),is_pensioner:!!((F=$("#nom-emp-rule-pensioner"))!=null&&F.checked),apply_solidarity_fund:!!((S=$("#nom-emp-rule-solidarity"))!=null&&S.checked),apply_withholding_tax:h,withholding_rate:h?Math.max(0,_/100):0,tercero_salud_id:getSelectVal("nom-emp-rule-tercero-salud")||"",tercero_pension_id:getSelectVal("nom-emp-rule-tercero-pension")||"",tercero_arl_id:getSelectVal("nom-emp-rule-tercero-arl")||"",tercero_caja_id:getSelectVal("nom-emp-rule-tercero-caja")||""};l.config.employee_rules=(l.config.employee_rules||[]).filter(x=>x.employee_id!==g),l.config.employee_rules.push(A),v(),showToast("Parámetro de empleado agregado/actualizado","success")}),(o=$("#btn-nom-emp-rule-clear"))==null||o.addEventListener("click",()=>{f()}),(s=$("#nom-emp-rules-body"))==null||s.addEventListener("click",g=>{var I,F,S,x;const h=(F=(I=g.target)==null?void 0:I.closest)==null?void 0:F.call(I,".btn-edit-emp-rule");if(h){const T=h.getAttribute("data-emp")||"";T&&y(T);return}const _=(x=(S=g.target)==null?void 0:S.closest)==null?void 0:x.call(S,".btn-del-emp-rule");if(!_)return;const A=_.getAttribute("data-emp")||"";l.config.employee_rules=(l.config.employee_rules||[]).filter(T=>T.employee_id!==A),l.editingEmployeeId===A&&f(),v()}),(n=$("#btn-save-nom-employee-rules"))==null||n.addEventListener("click",async()=>{try{await es(l.config,l.rowId),closeModal(),showToast("Parámetros por empleado guardados","success")}catch(g){showToast(g.message||"No se pudieron guardar los parámetros por empleado","error")}})}catch(i){showToast(i.message||"No se pudo abrir el panel de empleados de nómina","error")}}async function Ut(e){var t,a,o,s,n,i;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando nómina...</div>';try{const r=[],c=await pb.listAll("payroll_periods",{sort:"-date_from"}).catch(d=>(r.push(`periodos: ${d.message}`),[])),l=await pb.listAll("third_parties",{filter:'type="EMPLEADO" && active=true',sort:"name"}).catch(d=>(r.push(`empleados: ${d.message}`),[])),u=await pb.listAll("payroll_lines",{sort:"-id",expand:"period_id,employee_id"}).catch(async d=>{try{return await pb.listAll("payroll_lines",{expand:"period_id,employee_id"})}catch{return r.push(`liquidaciones: ${d.message}`),[]}}),b=l.length===0,m=c.length===0,p={};u.forEach(d=>{const y=d.period_id;p[y]||(p[y]={devengado:0,deducciones:0,neto:0,parafiscales:0,count:0});const v=mt(d),g=Bt(d),h=(d.employer_health||0)+(d.employer_pension||0)+(d.employer_arl||0)+(d.sena||0)+(d.icbf||0)+(d.caja_comp||0);p[y].devengado+=v,p[y].deducciones+=g,p[y].neto+=d.net_pay||0,p[y].parafiscales+=h,p[y].count++});const f=d=>({draft:'<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>',approved:'<span class="badge badge-blue">Aprobada</span>',paid:'<span class="badge badge-green">Pagada</span>'})[d]||'<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>';e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Nómina</h3>
           <p class="text-sm" style="color:#6B7280">Liquidación de períodos, prestaciones y aportes parafiscales.</p>
        </div>
        ${can("canWrite")?`<div class="flex gap-2">${requireRole("admin")?'<button class="btn btn-outline" id="btn-nomina-empleado" title="Parámetros por empleado"><i class="fas fa-user-gear"></i> Empleado</button><button class="btn btn-outline" id="btn-nomina-config" title="Configurar contabilización"><i class="fas fa-gear"></i></button>':""}<button class="btn btn-secondary" id="btn-new-period"><i class="fas fa-calendar-plus"></i> Nuevo Período</button><button class="btn btn-primary" id="btn-new-payline"><i class="fas fa-plus"></i> Nueva Liquidación</button></div>`:""}
      </div>

      ${r.length?`
        <div class="mb-4 p-4 rounded-2xl border" style="background:#FEF2F2;border-color:#FECACA">
          <p class="font-semibold" style="color:#B91C1C"><i class="fas fa-triangle-exclamation mr-2"></i>Se detectaron errores de carga</p>
          <p class="text-sm" style="color:#6B7280">${esc(r.join(" | "))}</p>
        </div>`:""}

      ${b||m?`
        <div class="mb-4 p-4 rounded-2xl border" style="background:#FFF8F0;border-color:#FED7AA">
          <div class="flex flex-wrap items-center gap-3 justify-between">
            <div>
              <p class="font-semibold" style="color:#C46516"><i class="fas fa-triangle-exclamation mr-2"></i>Configuracion inicial requerida</p>
              <p class="text-sm" style="color:#6B7280">
                ${b?"No hay terceros tipo EMPLEADO activos.":""}
                ${b&&m?" ":""}
                ${m?"No hay Periodos de nomina creados.":""}
              </p>
            </div>
            <div class="flex gap-2">
              ${b?'<button class="btn btn-outline btn-sm" id="btn-go-empleados"><i class="fas fa-users"></i> Crear Empleado</button>':""}
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
              ${c.length?c.map(d=>{const y=p[d.id]||{devengado:0,deducciones:0,neto:0,parafiscales:0,count:0};return`<tr>
                  <td class="font-semibold">${esc(d.name)}</td>
                  <td>${esc(d.date_from)}</td><td>${esc(d.date_to)}</td>
                  <td class="text-center">${y.count}</td>
                  <td>${fmt(y.devengado)}</td>
                  <td>${fmt(y.parafiscales)}</td>
                  <td class="font-semibold">${fmt(y.neto)}</td>
                  <td>${f(d.status)}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-outline btn-sm" title="Ver liquidaciones" onclick="viewPeriodLines('${esc(d.id)}','${esc(d.name)}','${esc(d.status||"draft")}')"><i class="fas fa-list-ul"></i></button>
                       ${can("canWrite")&&d.status==="draft"?`<button class="btn btn-primary btn-sm" title="Aprobar período" onclick="setPeriodStatus('${esc(d.id)}','approved')"><i class="fas fa-check"></i></button>`:""}
                      ${can("canWrite")&&d.status==="approved"?`<button class="btn btn-secondary btn-sm" title="Marcar pagada" onclick="setPeriodStatus('${esc(d.id)}','paid')"><i class="fas fa-money-bill-wave"></i></button>`:""}
                      ${can("canDelete")&&d.status==="draft"?`<button class="btn btn-outline btn-sm" title="Eliminar período" onclick="deletePayrollPeriod('${esc(d.id)}','${esc(d.name)}')"><i class="fas fa-trash"></i></button>`:""}
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
              ${u.length?u.slice(0,30).map(d=>{var y,v,g,h,_,A;return`
                <tr>
                  <td>${esc(((v=(y=d.expand)==null?void 0:y.period_id)==null?void 0:v.name)||"?")}</td>
                  <td>${esc(((h=(g=d.expand)==null?void 0:g.employee_id)==null?void 0:h.name)||"?")}</td>
                  <td class="text-center">${esc(String(d.days_worked||30))}</td>
                  <td>${fmt(mt(d))}</td>
                  <td>${fmt(Bt(d))}</td>
                  <td class="font-semibold">${fmt(d.net_pay||0)}</td>
                  <td>
                    <div class="flex gap-1 justify-end">
                      <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewPayrollLineDetail('${esc(d.id)}')"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-outline btn-sm" title="Imprimir volante" onclick="printPayrollSlip('${esc(d.id)}')"><i class="fas fa-print"></i></button>
                      ${can("canWrite")&&(((A=(_=d.expand)==null?void 0:_.period_id)==null?void 0:A.status)||"draft")==="draft"?`<button class="btn btn-outline btn-sm" title="Eliminar liquidación" onclick="deletePayrollLine('${esc(d.id)}')"><i class="fas fa-trash"></i></button>`:""}
                    </div>
                  </td>
                </tr>`}).join(""):'<tr><td colspan="7" class="text-center py-8" style="color:#9CA3AF">Sin liquidaciones.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`,(t=$("#btn-new-period"))==null||t.addEventListener("click",()=>fo()),(a=$("#btn-new-payline"))==null||a.addEventListener("click",()=>ai(c,l)),(o=$("#btn-nomina-empleado"))==null||o.addEventListener("click",()=>ti(l)),(s=$("#btn-nomina-config"))==null||s.addEventListener("click",()=>ei(l)),(n=$("#btn-go-empleados"))==null||n.addEventListener("click",()=>navigate("terceros")),(i=$("#btn-fast-period"))==null||i.addEventListener("click",()=>fo())}catch(r){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(r.message)}</div>`}}async function Dc(e,t){const a={approved:"Aprobar",paid:"Marcar como Pagada"};confirmDialog(`${a[t]||"Cambiar estado"}`,"¿Confirmas cambiar el estado del período?",async()=>{try{const o={status:t};if(t==="approved"){const s=await Xn(e);s&&(o.tx_id=s)}await pb.update("payroll_periods",e,o),showToast("Estado actualizado","success"),Ut($("#page-content"))}catch(o){showToast(o.message,"error")}})}async function kc(e,t=""){if(!can("canDelete"))return showToast("No tienes permisos para eliminar períodos de nómina","error");try{const a=await pb.get("payroll_periods",e);if((a.status||"draft")!=="draft")return showToast("Solo puedes eliminar períodos en estado borrador.","warning");if(a.tx_id)return showToast("No puedes eliminar un período que ya tiene contabilización asociada.","warning");const o=t||a.name||"este período";confirmDialog("Eliminar período de nómina",`¿Confirmas eliminar el período ${esc(o)}? También se eliminarán sus liquidaciones.`,async()=>{try{await pb.delete("payroll_periods",e),showToast("Período eliminado","success"),Ut($("#page-content"))}catch(s){showToast(s.message||"No se pudo eliminar el período","error")}})}catch(a){showToast(a.message||"No se pudo validar el período","error")}}async function Oc(e){var t,a,o,s;if(!can("canWrite"))return showToast("No tienes permisos para eliminar liquidaciones","error");try{const n=await pb.get("payroll_lines",e,{expand:"period_id,employee_id"});if((((a=(t=n.expand)==null?void 0:t.period_id)==null?void 0:a.status)||"draft")!=="draft")return showToast("Solo puedes eliminar liquidaciones de períodos en borrador.","warning");const r=((s=(o=n.expand)==null?void 0:o.employee_id)==null?void 0:s.name)||"este empleado";confirmDialog("Eliminar liquidación",`¿Confirmas eliminar la liquidación de ${esc(r)}?`,async()=>{try{await pb.delete("payroll_lines",e),showToast("Liquidación eliminada","success"),closeModal(),Ut($("#page-content"))}catch(c){showToast(c.message||"No se pudo eliminar la liquidación","error")}})}catch(n){showToast(n.message||"No se pudo validar la liquidación","error")}}async function Bc(e,t,a="draft"){try{const o=await pb.listAll("payroll_lines",{filter:`period_id="${e}"`,expand:"employee_id,period_id",sort:"id"});if(!o.length)return showToast("Este período no tiene liquidaciones","info");const s=o.reduce((c,l)=>c+mt(l),0),n=o.reduce((c,l)=>c+(l.net_pay||0),0),i=o.reduce((c,l)=>c+(l.employer_health||0)+(l.employer_pension||0)+(l.employer_arl||0)+(l.sena||0)+(l.icbf||0)+(l.caja_comp||0),0),r=o.reduce((c,l)=>c+(l.cesantias||0)+(l.intereses_ces||0)+(l.prima||0)+(l.vacaciones||0),0);openModal(`Liquidaciones — ${esc(t)}`,`<div class="space-y-4">
        <div class="grid grid-cols-4 gap-3">
          <div class="rounded-xl p-3 text-center" style="background:#F0F7FF"><div class="text-xs" style="color:#6B7280">Total Devengado</div><div class="font-bold text-sm" style="color:#1A4B8C">${fmt(s)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#F0FFF4"><div class="text-xs" style="color:#6B7280">Total Neto</div><div class="font-bold text-sm" style="color:#15803D">${fmt(n)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#FFF8F0"><div class="text-xs" style="color:#6B7280">Parafiscales</div><div class="font-bold text-sm" style="color:#C46516">${fmt(i)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#FEF2F2"><div class="text-xs" style="color:#6B7280">Provisiones</div><div class="font-bold text-sm" style="color:#B91C1C">${fmt(r)}</div></div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table text-xs">
             <thead><tr><th>Empleado</th><th>Días</th><th>Salario</th><th>Devengado</th><th>Deduc.</th><th>Neto</th><th></th></tr></thead>
            <tbody>
              ${o.map(c=>{var l,u;return`<tr>
                <td>${esc(((u=(l=c.expand)==null?void 0:l.employee_id)==null?void 0:u.name)||"?")}</td>
                <td class="text-center">${c.days_worked||30}</td>
                <td>${fmt(c.salary_base||0)}</td>
                <td>${fmt(mt(c))}</td>
                <td>${fmt(Bt(c))}</td>
                <td class="font-semibold">${fmt(c.net_pay||0)}</td>
                <td>
                  <div class="flex gap-1 justify-end">
                    <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewPayrollLineDetail('${esc(c.id)}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-outline btn-sm" title="Imprimir volante" onclick="printPayrollSlip('${esc(c.id)}')"><i class="fas fa-print"></i></button>
                    ${can("canWrite")&&a==="draft"?`<button class="btn btn-outline btn-sm" title="Eliminar liquidación" onclick="deletePayrollLine('${esc(c.id)}')"><i class="fas fa-trash"></i></button>`:""}
                  </div>
                </td>
              </tr>`}).join("")}
            </tbody>
          </table>
        </div>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch(o){showToast(o.message,"error")}}async function Mc(e){var t,a;try{const o=await pb.get("payroll_lines",e,{expand:"period_id,employee_id"}),s=Mt(o),n=Ot(o),i=ne((Number(s.arl_rate||Be[1])||Be[1])*100),r=ja(o),l=da(o).conceptAmounts,u=mt(o),b=Bt(o),m=(o.employer_health||0)+(o.employer_pension||0)+(o.employer_arl||0)+(o.sena||0)+(o.icbf||0)+(o.caja_comp||0),p=(o.cesantias||0)+(o.intereses_ces||0)+(o.prima||0)+(o.vacaciones||0),f=Number(s.transport_days||o.days_worked||30),d=(h,_,A=!1)=>`<div class="flex justify-between py-1 border-b" style="border-color:#F3F4F6">
        <span style="color:#6B7280">${h}</span>
        <span class="${A?"font-bold":"font-medium"}">${typeof _=="number"?fmt(_):_}</span>
      </div>`,y=r.hasBreakdown?r.breakdown.map(h=>d(`${h.label} (${h.hours} h)`,h.amount||0)).join(""):d("Horas extra / recargos",o.overtime||0),v=ke.filter(h=>(l[h]||0)>0).map(h=>{var _;return d(((_=Me[h])==null?void 0:_.label)||h,l[h]||0)}).join(""),g=Oe.filter(h=>(l[h]||0)>0).map(h=>{var _;return d(((_=Me[h])==null?void 0:_.label)||h,l[h]||0)}).join("");openModal(`Detalle Liquidación — ${esc(((a=(t=o.expand)==null?void 0:t.employee_id)==null?void 0:a.name)||"")}`,`<div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Devengos</p>
           ${d("Salario base (30 días)",o.salary_base||0)}
           ${d("Días trabajados",String(o.days_worked||30))}
          ${d("Salario proporcional",(o.salary_base||0)/30*(o.days_worked||30))}
          ${y}
          ${d("Días auxilio transporte",String(f))}
          ${d("Aux. transporte",o.transport_allowance||0)}
          ${v}
          ${d("TOTAL DEVENGADO",u,!0)}
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Deducciones Trabajador</p>
          ${d("Salud (4%)",o.deduction_health||0)}
           ${d("Pensión (4%)",o.deduction_pension||0)}
          ${d("Fondo solidaridad",n.solidarity||0)}
          ${d("Retención en la fuente",n.withholding||0)}
          ${d("Otras deducciones",o.deduction_other||0)}
          ${g}
          ${d("TOTAL DEDUCCIONES",b,!0)}
          <p class="font-bold mt-3 py-2 px-3 rounded-lg text-base" style="background:#F0FFF4;color:#15803D">Neto a pagar: ${fmt(o.net_pay||0)}</p>
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Aportes Empleador</p>
          ${d("Salud (8.5%)",o.employer_health||0)}
           ${d("Pensión (12%)",o.employer_pension||0)}
          ${d(`ARL (${i}%)`,o.employer_arl||0)}
          ${d("SENA (2%)",o.sena||0)}
          ${d("ICBF (3%)",o.icbf||0)}
           ${d("Caja de Compensación (4%)",o.caja_comp||0)}
          ${d("TOTAL PARAFISCALES",m,!0)}
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Provisiones (Causadas)</p>
           ${d("Cesantías (8.33%)",o.cesantias||0)}
           ${d("Intereses cesantías (1%)",o.intereses_ces||0)}
          ${d("Prima de servicios (8.33%)",o.prima||0)}
          ${d("Vacaciones (4.17%)",o.vacaciones||0)}
          ${d("TOTAL PROVISIONES",p,!0)}
        </div>
      </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       <button class="btn btn-primary" onclick="printPayrollSlip('${e}')"><i class="fas fa-print mr-1"></i>Imprimir volante</button>`,!0)}catch(o){showToast(o.message,"error")}}async function Uc(e){var t,a,o,s,n,i,r,c,l,u,b,m;try{const p=await pb.get("payroll_lines",e,{expand:"period_id,employee_id"}),f=Mt(p),d=Ot(p),y=ne((Number(f.arl_rate||Be[1])||Be[1])*100),v=ja(p),h=da(p).conceptAmounts,_=mt(p),A=Bt(p),I=Number(f.transport_days||p.days_worked||30),[F,S,x]=await Promise.all([API.getSetting("company_name").catch(()=>""),API.getSetting("company_nit").catch(()=>""),API.getSetting("company_address").catch(()=>"")]),T=((a=(t=p.expand)==null?void 0:t.employee_id)==null?void 0:a.name)||"",E=((s=(o=p.expand)==null?void 0:o.employee_id)==null?void 0:s.doc_number)||"",C=((i=(n=p.expand)==null?void 0:n.employee_id)==null?void 0:i.notes)||"",N=((c=(r=p.expand)==null?void 0:r.period_id)==null?void 0:c.name)||"",L=((u=(l=p.expand)==null?void 0:l.period_id)==null?void 0:u.date_from)||"",O=((m=(b=p.expand)==null?void 0:b.period_id)==null?void 0:m.date_to)||"",M=w=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}).format(Number(w)||0),B=(w,P,V=!1)=>`<tr>
         <td style="padding:3px 8px;color:#374151;${V?"font-weight:700;":""}">${w}</td>
         <td style="padding:3px 8px;text-align:right;${V?"font-weight:700;":""}">${typeof P=="number"?M(P):P}</td>
       </tr>`,j=v.hasBreakdown?v.breakdown.filter(w=>w.hours>0).map(w=>B(`${w.label} (${w.hours} h)`,w.amount)).join(""):p.overtime?B("Horas extra / recargos",p.overtime||0):"",Y=ke.filter(w=>(h[w]||0)>0).map(w=>{var P;return B(((P=Me[w])==null?void 0:P.label)||w,h[w])}).join(""),W=Oe.filter(w=>(h[w]||0)>0).map(w=>{var P;return B(((P=Me[w])==null?void 0:P.label)||w,h[w])}).join(""),K=`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Volante de Nómina — ${T}</title>
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
      <div class="company-name">${F||"Empresa"}</div>
      ${S?`<div class="company-sub">NIT: ${S}</div>`:""}
      ${x?`<div class="company-sub">${x}</div>`:""}
    </div>
    <div>
      <div class="slip-title">VOLANTE DE PAGO DE NÓMINA</div>
      <div class="slip-period">${N}${L?" &nbsp;·&nbsp; Del "+L:""}${O?" al "+O:""}</div>
    </div>
  </div>

  <div class="emp-card">
    <div class="emp-field"><label>Empleado</label><span>${T}</span></div>
    <div class="emp-field"><label>Documento</label><span>${E||"—"}</span></div>
    ${C?`<div class="emp-field"><label>Cargo / Notas</label><span>${C}</span></div>`:""}
    <div class="emp-field"><label>Días salario</label><span>${p.days_worked||30}</span></div>
    <div class="emp-field"><label>Días aux. transporte</label><span>${I}</span></div>
  </div>

  <div class="cols">
    <div class="section">
      <div class="section-title">Devengado</div>
      <table>
        ${B("Salario base (mensual)",p.salary_base||0)}
        ${B("Salario proporcional",(p.salary_base||0)/30*(p.days_worked||30))}
        ${j}
        ${B("Auxilio de transporte",p.transport_allowance||0)}
        ${Y}
        ${B("TOTAL DEVENGADO",_,!0)}
      </table>
    </div>
    <div class="section">
      <div class="section-title">Deducciones trabajador</div>
      <table>
        ${B("Salud trabajador (4%)",p.deduction_health||0)}
        ${B("Pensión trabajador (4%)",p.deduction_pension||0)}
        ${d.solidarity>0?B("Fondo de solidaridad",d.solidarity):""}
        ${d.withholding>0?B("Retención en la fuente",d.withholding):""}
        ${(p.deduction_other||0)>0?B("Otras deducciones",p.deduction_other):""}
        ${W}
        ${B("TOTAL DEDUCCIONES",A,!0)}
      </table>
    </div>
  </div>

  <div class="neto-bar">
    <div class="n-label">NETO A PAGAR</div>
    <div class="n-value">${M(p.net_pay||0)}</div>
  </div>

  <div class="section" style="margin-bottom:14px">
    <div class="section-title">Aportes empleador y provisiones (referencia — no afectan el neto)</div>
    <div class="employer-grid">
      <table>
        ${B("Salud empleador (8.5%)",p.employer_health||0)}
        ${B("Pensión empleador (12%)",p.employer_pension||0)}
        ${B("ARL ("+y+"%)",p.employer_arl||0)}
        ${B("Caja de Compensación (4%)",p.caja_comp||0)}
        ${B("SENA (2%)",p.sena||0)}
        ${B("ICBF (3%)",p.icbf||0)}
      </table>
      <table>
        ${B("Cesantías (8.33%)",p.cesantias||0)}
        ${B("Intereses cesantías (1%)",p.intereses_ces||0)}
        ${B("Prima de servicios (8.33%)",p.prima||0)}
        ${B("Vacaciones causadas (4.17%)",p.vacaciones||0)}
      </table>
    </div>
  </div>

  <div class="signatures">
    <div><div class="sig-line">Firma empleador / Representante legal</div></div>
    <div><div class="sig-line">Firma empleado — ${T}</div></div>
  </div>
</div>
<script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`,H=window.open("","_blank","width=900,height=720");if(!H){showToast("El navegador bloqueó la ventana emergente. Permite popups para esta página.","warning");return}H.document.write(K),H.document.close()}catch(p){showToast(p.message||"No se pudo generar el volante","error")}}function fo(){var e;openModal("Nuevo Período de Nómina",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group md:col-span-2"><label class="form-label">Nombre del Período</label><input id="pp-name" class="form-input" placeholder="Ej: Nómina Mayo 2026"></div>
      <div class="form-group"><label class="form-label">Fecha Desde</label><input id="pp-from" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group"><label class="form-label">Fecha Hasta</label><input id="pp-to" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group"><label class="form-label">Estado Inicial</label><select id="pp-status" class="form-input"><option value="draft">Borrador</option><option value="approved">Aprobada</option></select></div>
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-period">Guardar</button>'),(e=$("#btn-save-period"))==null||e.addEventListener("click",async()=>{try{const t={name:getInputVal("pp-name"),date_from:getInputVal("pp-from"),date_to:getInputVal("pp-to"),status:getSelectVal("pp-status")};if(!t.name||!t.date_from||!t.date_to)return showToast("Completa los campos obligatorios","warning");const a=await pb.create("payroll_periods",t);closeModal(),showToast("Período creado","success"),Ut($("#page-content"))}catch(t){showToast(t.message,"error")}})}async function ai(e,t){var p,f,d,y,v;if(!e.length)return showToast("Primero crea un período de nómina","warning");if(!t.length)return showToast("No hay terceros tipo EMPLEADO activos","warning");const a=e.filter(g=>g.status==="draft"||!g.status);if(!a.length)return showToast("No hay períodos en estado Borrador para liquidar","warning");const{config:o}=await la(),s=t.filter(g=>{const h=Je(o,g.id);return!oa(h)});if(s.length){const g=s.slice(0,5).map(h=>h.name).join(", ");return showToast(`Debes configurar salario básico en todos los empleados activos antes de liquidar. Pendientes: ${g}${s.length>5?"...":""}`,"warning")}const n=Yt.map(g=>`
    <div class="form-group">
      <label class="form-label">${esc(g.label)} (horas)</label>
      <input id="pl-ot-${esc(g.key)}" class="form-input" value="0">
    </div>
  `).join(""),i=ke.map(g=>{var h;return`
    <div class="form-group">
      <label class="form-label">${esc(((h=Me[g])==null?void 0:h.label)||g)}</label>
      <input id="pl-cpt-${esc(g)}" class="form-input" value="0">
    </div>
  `}).join(""),r=Oe.map(g=>{var h;return`
    <div class="form-group">
      <label class="form-label">${esc(((h=Me[g])==null?void 0:h.label)||g)}</label>
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
      <p class="font-semibold mb-2" style="color:#0D2137">Horas extra y recargos — jornada ${((p=o.company_rules)==null?void 0:p.weekly_hours)||44} h/semana (valor hora = salario / ${(((f=o.company_rules)==null?void 0:f.weekly_hours)||44)*5})</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">${n}</div>
    </div>

    <div class="rounded-xl p-3 mt-4" style="background:#F8FAFC;border:1px solid #E2E8F0">
      <p class="font-semibold mb-2" style="color:#0D2137">Devengos adicionales (débito)</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">${i}</div>
    </div>

    <div class="rounded-xl p-3 mt-4" style="background:#F8FAFC;border:1px solid #E2E8F0">
      <p class="font-semibold mb-2" style="color:#0D2137">Deducciones por concepto (crédito)</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${r}</div>
    </div>

    <div id="nomina-preview" class="mt-4 p-3 rounded-xl text-sm" style="background:#F9FAFB;border:1px solid #E5E7EB;display:none"></div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-secondary btn-sm" id="btn-preview-pl"><i class="fas fa-calculator"></i> Calcular</button>
     <button class="btn btn-primary" id="btn-save-pl">Guardar</button>`);const c=()=>{const g={};return[...ke,...Oe].forEach(h=>{g[h]=ne(parseNum(getInputVal(`pl-cpt-${h}`))||0)}),g},l=g=>{var I;const h=((I=o.company_rules)==null?void 0:I.weekly_hours)||44,_=ne((g||0)/(h*5)),A=Yt.map(F=>{const S=ne(parseNum(getInputVal(`pl-ot-${F.key}`))||0),x=ne(_*S*F.factor);return{key:F.key,hours:S,amount:x}});return{hourly_rate:_,total_hours:ne(A.reduce((F,S)=>F+(S.hours||0),0)),total_amount:ne(A.reduce((F,S)=>F+(S.amount||0),0)),breakdown:A}},u=async()=>{const g=parseNum(getInputVal("pl-salary")),h=parseNum(getInputVal("pl-days-salary"))||30,_=parseNum(getInputVal("pl-days-transport"))||0,A=parseNum(getInputVal("pl-aux")),I=ne(A/30*_),F=parseNum(getInputVal("pl-ded-other")),S=getSelectVal("pl-emp");if(g<=0)return;const T=l(g).total_amount,E=c(),C=ne(ke.reduce((z,G)=>z+(E[G]||0),0)),N=ne(Oe.reduce((z,G)=>z+(E[G]||0),0)),L=Je(o,S),O=o.company_rules||aa().company_rules,M=g/30*h,B=M+T,j=B+I+C,Y=B*.04,W=L.is_pensioner?0:B*.04,K=(O.smmlv||1423500)*(O.solidarity_threshold_smmlv||3),H=L.apply_solidarity_fund&&B>=K?B*(O.solidarity_rate||.01):0,w=L.apply_withholding_tax?B*(L.withholding_rate||0):0,P=Y+W+H+w+F+N,V=j-P,U=Be[L.arl_risk_level]||Be[1],q=O.exempt_sena_icbf?0:.02,J=O.exempt_sena_icbf?0:.03,te=B*(.085+.12+U+q+J+.04),R=B*(.0833+.01*.0833+.0833+.0417),D=$("#nomina-preview");D&&(D.style.display="",D.innerHTML=`
      <div class="grid grid-cols-3 gap-3 text-center">
        <div><div class="text-xs" style="color:#6B7280">Devengado</div><div class="font-bold" style="color:#1A4B8C">${fmt(j)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Deducciones</div><div class="font-bold" style="color:#B91C1C">${fmt(P)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Neto a Pagar</div><div class="font-bold" style="color:#15803D">${fmt(V)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Parafiscales</div><div class="font-medium" style="color:#C46516">${fmt(te)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Provisiones</div><div class="font-medium" style="color:#7C3AED">${fmt(R)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Costo Total</div><div class="font-bold" style="color:#0D2137">${fmt(j+te+R)}</div></div>
      </div>
      <div class="mt-3 text-xs" style="color:#64748B">
        Salario (${h} días): ${fmt(M)} | Auxilio (${_} días): ${fmt(I)} | Horas extra/recargos: ${fmt(T)} | Devengos adicionales: ${fmt(C)} | Deducciones por concepto: ${fmt(N)}
      </div>`)};(d=$("#btn-preview-pl"))==null||d.addEventListener("click",u),["pl-salary","pl-days-salary","pl-days-transport","pl-aux","pl-ded-other",...Yt.map(g=>`pl-ot-${g.key}`),...ke.map(g=>`pl-cpt-${g}`),...Oe.map(g=>`pl-cpt-${g}`)].forEach(g=>{var h;return(h=$("#"+g))==null?void 0:h.addEventListener("input",debounce(()=>{u()},250))});const m=()=>{const g=getSelectVal("pl-emp"),h=Je(o,g);(h.basic_salary||0)>0&&setInputVal("pl-salary",String(ne(h.basic_salary)))};(y=$("#pl-emp"))==null||y.addEventListener("change",()=>{m(),u()}),m(),u(),(v=$("#btn-save-pl"))==null||v.addEventListener("click",async()=>{var h;const g=$("#btn-save-pl");g&&(g.disabled=!0,g.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const _=parseNum(getInputVal("pl-salary")),A=parseNum(getInputVal("pl-days-salary"))||30,I=parseNum(getInputVal("pl-days-transport"))||0,F=parseNum(getInputVal("pl-aux")),S=ne(F/30*I),x=parseNum(getInputVal("pl-ded-other")),T=getSelectVal("pl-emp");if(_<=0)return showToast("El salario base debe ser mayor a cero","warning");if(A<=0||A>30)return showToast("Días salario debe estar entre 1 y 30","warning");if(I<0||I>30)return showToast("Días auxilio transporte debe estar entre 0 y 30","warning");const E=getSelectVal("pl-period");if(!E)return showToast("Selecciona un Periodo","warning");if(((await pb.get("payroll_periods",E)).status||"draft")!=="draft")return showToast("El Periodo seleccionado no esta en borrador. No se pueden registrar nuevas liquidaciones.","error");const N=l(_),L=N.total_amount,O=c(),M=ne(ke.reduce((pe,fe)=>pe+(O[fe]||0),0)),B=ne(Oe.reduce((pe,fe)=>pe+(O[fe]||0),0)),Y=_/30*A+L,W=Y+S+M,K=Je(o,T);if(!oa(K))return showToast("El empleado no tiene salario básico configurado en Parámetros por Empleado.","warning");const H=o.company_rules||aa().company_rules,w=Y*.04,P=K.is_pensioner?0:Y*.04,V=(H.smmlv||1423500)*(H.solidarity_threshold_smmlv||3),U=K.apply_solidarity_fund&&Y>=V?Y*(H.solidarity_rate||.01):0,q=K.apply_withholding_tax?Y*(K.withholding_rate||0):0,J=x,te=Y*.085,R=Y*.12,D=Be[K.arl_risk_level]||Be[1],z=Y*D,G=H.exempt_sena_icbf?0:Y*.02,ee=H.exempt_sena_icbf?0:Y*.03,X=Y*.04,ie=Y*.0833,Z=ie*.01,Q=Y*.0833,se=Y*.0417,he=W-w-P-U-q-J-B,ge={};N.breakdown.forEach(pe=>{ge[pe.key]={hours:ne(pe.hours||0),amount:ne(pe.amount||0)}});const _e={payroll_meta:{arl_risk_level:K.arl_risk_level,arl_rate:D,is_pensioner:!!K.is_pensioner,solidarity_fund:ne(U),withholding_tax:ne(q),company_exempt_sena_icbf:!!H.exempt_sena_icbf,overtime_breakdown:{hourly_rate:ne(N.hourly_rate||0),total_hours:ne(N.total_hours||0),total_amount:ne(L||0),...ge},transport_days:I,transport_monthly:ne(F||0),concept_amounts:O}},ue={period_id:E,employee_id:T,salary_base:_,days_worked:A,overtime:L,transport_allowance:S,deduction_health:w,deduction_pension:P,deduction_other:J,net_pay:he,employer_health:te,employer_pension:R,employer_arl:z,sena:G,icbf:ee,caja_comp:X,cesantias:ie,intereses_ces:Z,prima:Q,vacaciones:se,notes:JSON.stringify(_e)};await pb.create("payroll_lines",ue),closeModal(),showToast("Liquidación registrada","success"),Ut($("#page-content"))}catch(_){const A=(h=_==null?void 0:_.data)!=null&&h.data?Object.values(_.data.data).map(I=>I==null?void 0:I.message).filter(Boolean).join(" | "):"";showToast(A||_.message||"No se pudo registrar la Liquidacion","error")}finally{g&&(g.disabled=!1,g.innerHTML="Guardar")}})}window.ARL_RISK_RATES=Be;window.openNominaEmployeeSettings=ti;window.compactNominaConfigForStorage=qn;window.writeSettingJsonMaybeChunked=Yn;window.upsertSettingByKey=uo;window.isEmployeePayrollRuleComplete=oa;window.viewPeriodLines=Bc;window.listSettingsByPrefix=Xo;window.nominaThirdDisplay=Ta;window.getEmployeePayrollRule=Je;window.getNominaAdditionalConceptTotals=da;window.getNominaConfigWithRow=la;window.deleteSettingByKey=po;window.saveNominaConfig=es;window.normalizeNominaConfig=kt;window.getNominaConceptRule=Wt;window.getNominaDeduccionesTotal=Bt;window.NOMINA_EXTRA_DEDUCTION_KEYS=Oe;window.round2=ne;window.nominaFindThirdById=Ia;window.renderNomina=Ut;window.setPeriodStatus=Dc;window.openNominaAccountingSettings=ei;window.initNominaThirdSearchInput=lt;window.getExtraDeductionsFromLine=Ot;window.getNominaConceptAmountsFromLine=ts;window.postNominaPeriodAccounting=Xn;window.viewPayrollLineDetail=Mc;window.NOMINA_CONCEPTS=Va;window.NOMINA_CATEGORY_LABELS=Ca;window.findEmployeePayrollRule=mo;window.getNominaOvertimeMetaFromLine=ja;window.resolveNominaCrossDocRef=Qn;window.NOMINA_OVERTIME_TYPES=Yt;window.NOMINA_EXTRA_EARNING_KEYS=ke;window.deletePayrollPeriod=kc;window.buildNominaAccountingLines=Zn;window.openPayrollLineForm=ai;window.defaultNominaConfig=aa;window.settingChunkKey=lo;window.resolveAllNominaMappings=Jn;window.NOMINA_CONFIG_VALUE_MAX_CHARS=Ea;window.printPayrollSlip=Uc;window.resolveNominaTerceroId=Kn;window.readSettingJsonMaybeChunked=$t;window.deletePayrollLine=Oc;window.NOMINA_CONFIG_KEYS=Ne;window.NOMINA_CONCEPT_RULES=Hn;window.getNominaConceptAmount=as;window.NOMINA_CONFIG_KEY=Ze;window.getNominaCategoryConcepts=zn;window.splitTextInChunks=Wn;window.getNominaCategoryLabel=Gn;window.resolveNominaMapping=Rc;window.getNominaLineMeta=Mt;window.NOMINA_CONCEPT_BY_KEY=Me;window.openPeriodForm=fo;window.getNominaDevengadoTotal=mt;async function os(e){var t,a,o,s,n;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF">Cargando facturaci?n DIAN...</div>';try{const i=[],r=await pb.listAll("einvoice_docs",{sort:"-created",expand:"tx_id"}).catch(f=>(i.push(`documentos: ${f.message}`),[])),c=await pb.listAll("transactions",{sort:"-date,-created",filter:'status="active"',expand:"tx_type_id,third_party_id"}).catch(f=>(i.push(`transacciones: ${f.message}`),[])),l={pendiente:{cls:"badge-orange",icon:"fa-clock",label:"Pendiente"},enviada:{cls:"badge-blue",icon:"fa-paper-plane",label:"Enviada"},aceptada:{cls:"badge-green",icon:"fa-circle-check",label:"Aceptada"},rechazada:{cls:"badge-red",icon:"fa-circle-xmark",label:"Rechazada"}},u=f=>l[f]||l.pendiente,b={pendiente:0,enviada:0,aceptada:0,rechazada:0};r.forEach(f=>{const d=f.status||"pendiente";b[d]!==void 0&&b[d]++});const m=c.length===0;e.innerHTML=`
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
        ${[["pendiente","#FFF8F0","#C46516"],["enviada","#EFF6FF","#1D4ED8"],["aceptada","#F0FFF4","#15803D"],["rechazada","#FEF2F2","#B91C1C"]].map(([f,d,y])=>`
          <div class="rounded-2xl p-4 cursor-pointer dian-kpi" data-status="${f}" style="background:${d};border:2px solid transparent" onclick="filterDianByStatus('${f}')">
            <div class="text-xs font-medium mb-1" style="color:${y}">${u(f).label}</div>
            <div class="text-2xl font-bold" style="color:${y}">${b[f]}</div>
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
              ${r.length?r.map(f=>{var g,h,_;const d=f.status||"pendiente",y=u(d),v=(g=f.expand)==null?void 0:g.tx_id;return`<tr data-status="${d}">
                  <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc((v==null?void 0:v.number)||"?")}</span></td>
                  <td>${esc(((_=(h=v==null?void 0:v.expand)==null?void 0:h.third_party_id)==null?void 0:_.name)||"?")}</td>
                  <td class="font-mono text-xs max-w-xs truncate" title="${esc(f.cufe||"")}">${f.cufe?esc(f.cufe.slice(0,20))+"?":"?"}</td>
                  <td><span class="badge ${y.cls}"><i class="fas ${y.icon} mr-1"></i>${y.label}</span></td>
                  <td class="text-sm max-w-xs truncate" title="${esc(f.dian_response||"")}">${esc(f.dian_response||"?")}</td>
                  <td>${esc(f.sent_at?fmtDate(f.sent_at):"?")}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewDianDetail('${esc(f.id)}')"><i class="fas fa-eye"></i></button>
                      ${can("canWrite")?`<button class="btn btn-outline btn-sm" title="Editar" onclick="editDianDoc('${esc(f.id)}')"><i class="fas fa-pen"></i></button>`:""}
                      ${can("canWrite")&&d==="pendiente"?`<button class="btn btn-secondary btn-sm" title="Enviar a DIAN" onclick="setDianStatus('${esc(f.id)}','enviada')"><i class="fas fa-paper-plane"></i> Enviar</button>`:""}
                      ${can("canWrite")&&d==="enviada"?`<button class="btn btn-primary btn-sm" title="Aceptar" onclick="setDianStatus('${esc(f.id)}','aceptada')"><i class="fas fa-check"></i></button>`:""}
                      ${can("canWrite")&&d==="enviada"?`<button class="btn btn-danger btn-sm" title="Rechazar" onclick="setDianStatus('${esc(f.id)}','rechazada')"><i class="fas fa-xmark"></i></button>`:""}
                    </div>
                  </td>
                </tr>`}).join(""):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay documentos DIAN registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;const p=()=>{const f=getInputVal("dian-q").toLowerCase(),d=getSelectVal("dian-status-filter");$$("#dian-table tbody tr[data-status]").forEach(y=>{const v=!f||y.textContent.toLowerCase().includes(f),g=!d||y.dataset.status===d;y.style.display=v&&g?"":"none"})};(t=$("#dian-q"))==null||t.addEventListener("input",debounce(p,150)),(a=$("#dian-status-filter"))==null||a.addEventListener("change",p),(o=$("#btn-dian-clear"))==null||o.addEventListener("click",()=>{setInputVal("dian-q","");const f=$("#dian-status-filter");f&&(f.value=""),$$("#dian-table tbody tr[data-status]").forEach(d=>d.style.display=""),$$(".dian-kpi").forEach(d=>d.style.borderColor="transparent")}),(s=$("#btn-new-dian"))==null||s.addEventListener("click",()=>ss(c)),(n=$("#btn-go-nueva-tx"))==null||n.addEventListener("click",()=>navigate("nueva-tx"))}catch(i){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(i.message)}</div>`}}function Vc(e){const t=$("#dian-status-filter");t&&(t.value=e,t.dispatchEvent(new Event("change"))),$$(".dian-kpi").forEach(a=>a.style.borderColor=a.dataset.status===e?"#E87D1E":"transparent")}async function jc(e){var t;try{const a=await pb.get("einvoice_docs",e,{expand:"tx_id"}),o=(t=a.expand)==null?void 0:t.tx_id,s={pendiente:{cls:"badge-orange",label:"Pendiente"},enviada:{cls:"badge-blue",label:"Enviada"},aceptada:{cls:"badge-green",label:"Aceptada"},rechazada:{cls:"badge-red",label:"Rechazada"}},n=s[a.status||"pendiente"]||s.pendiente,i=`<?xml version="1.0" encoding="UTF-8"?>
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
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch(a){showToast(a.message,"error")}}function oi(e,t){const a=`${e}|${t}|${Date.now()}`;try{return btoa(a).replace(/[^A-Za-z0-9]/g,"").slice(0,64).padEnd(64,"0")}catch{return`CUFE${Date.now()}${e}`.slice(0,64)}}async function Hc(e,t){const a={enviada:"Enviar a DIAN",aceptada:"Marcar como Aceptada",rechazada:"Marcar como Rechazada"};confirmDialog(a[t]||"Cambiar estado","?Confirmas el cambio de estado del documento?",async()=>{try{const o=await pb.get("einvoice_docs",e),s=o.status||"pendiente";if(!({pendiente:["enviada"],enviada:["aceptada","rechazada"],aceptada:[],rechazada:[]}[s]||[]).includes(t))return showToast(`Transici?n no permitida: ${s} ? ${t}`,"warning");const i={status:t};t==="enviada"&&(i.sent_at=todayStr(),i.cufe=o.cufe||oi(o.tx_id,i.sent_at),i.dian_response=o.dian_response||"Documento enviado a DIAN (simulaci?n)."),t==="aceptada"&&(i.dian_response="Documento aceptado por DIAN. Procesado correctamente."),t==="rechazada"&&(i.dian_response="Documento rechazado por DIAN. Verifique inconsistencias."),await pb.update("einvoice_docs",e,i),showToast(`Estado actualizado a: ${t}`,"success"),os($("#page-content"))}catch(o){showToast(o.message,"error")}})}function ss(e,t=null){var a;if(!t&&(!e||!e.length))return showToast("No hay transacciones activas disponibles para asociar al documento DIAN","warning");openModal(t?"Editar Documento DIAN":"Nuevo Documento DIAN",`
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group md:col-span-2"><label class="form-label">Transacci?n Contable</label>
        <select id="df-tx" class="form-input" ${t?"disabled":""}>
          <option value="">Seleccione transacci?n...</option>
          ${e.map(o=>{var s,n,i,r;return`<option value="${esc(o.id)}" ${(t==null?void 0:t.tx_id)===o.id?"selected":""}>${esc(o.number)} ? ${esc(((n=(s=o.expand)==null?void 0:s.tx_type_id)==null?void 0:n.name)||"")} | ${esc(((r=(i=o.expand)==null?void 0:i.third_party_id)==null?void 0:r.name)||"Sin tercero")}</option>`}).join("")}
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
    </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-dian">Guardar</button>'),(a=$("#btn-save-dian"))==null||a.addEventListener("click",async()=>{var s,n;const o=$("#btn-save-dian");o&&(o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const i={tx_id:(t==null?void 0:t.tx_id)||getSelectVal("df-tx"),cufe:getInputVal("df-cufe"),status:getSelectVal("df-status")||(t==null?void 0:t.status)||"pendiente",dian_response:getInputVal("df-resp"),sent_at:getInputVal("df-sent")||""};if(!i.tx_id)return showToast("Selecciona una transacci?n","warning");if(!(t!=null&&t.id)&&(s=(await pb.list("einvoice_docs",{filter:`tx_id="${i.tx_id}"`,perPage:1})).items)!=null&&s.length)return showToast("Esta transaccion ya tiene documento DIAN asociado. Usa editar.","warning");if(t!=null&&t.id)await pb.update("einvoice_docs",t.id,i);else{const r=await pb.create("einvoice_docs",i)}closeModal(),showToast("Documento DIAN guardado","success"),os($("#page-content"))}catch(i){const r=(n=i==null?void 0:i.data)!=null&&n.data?Object.values(i.data.data).map(c=>c==null?void 0:c.message).filter(Boolean).join(" | "):"";showToast(r||i.message||"No se pudo guardar el documento DIAN","error")}finally{o&&(o.disabled=!1,o.innerHTML="Guardar")}})}async function Gc(e){try{const[t,a]=await Promise.all([pb.get("einvoice_docs",e),pb.listAll("transactions",{sort:"-date,-created",filter:'status="active"',expand:"tx_type_id,third_party_id"})]);ss(a,t)}catch(t){showToast(t.message,"error")}}window.setDianStatus=Hc;window.filterDianByStatus=Vc;window.generateMockCufe=oi;window.viewDianDetail=jc;window.editDianDoc=Gc;window.openDianForm=ss;window.renderFacturacionDIAN=os;const Ke="periodos_cierre";async function Ha(e){var t,a,o,s,n;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando asistente de cierre...</div>';try{const[i,r]=await Promise.all([API.getAccounts(!1),API.getAccountSaldos()]),c=await API.getSetting(Ke),l=c?JSON.parse(c):[],u={};for(const I of i){const F=(I.code||"").charAt(0);u[F]||(u[F]=0),u[F]+=Number(r[I.id]||0)}const b=Math.abs(u[4]||0),m=Math.abs(u[5]||0)+Math.abs(u[6]||0)+Math.abs(u[7]||0),p=b-m,f=new Set(l.filter(I=>I.closed).map(I=>I.key)),d=new Date().getFullYear(),y=new Date().getMonth()+1,v=`${d}-${String(y).padStart(2,"0")}`,g=f.has(v),_=!!l.find(I=>I.key===v),A=I=>I.closed?'<span class="badge badge-red"><i class="fas fa-lock mr-1"></i>Cerrado</span>':'<span class="badge badge-green"><i class="fas fa-lock-open mr-1"></i>Habilitado</span>';e.innerHTML=`
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
          <div class="text-lg font-bold" style="color:#15803D">${fmt(b)}</div>
        </div>
        <div class="rounded-2xl p-4 border" style="background:#FEF2F2;border-color:#FECACA">
          <div class="text-xs font-medium mb-1" style="color:#B91C1C">Total Gastos (Cl.5/6/7)</div>
          <div class="text-lg font-bold" style="color:#B91C1C">${fmt(m)}</div>
        </div>
        <div class="rounded-2xl p-4 border" style="${p>=0?"background:#F0FFF4;border-color:#BBF7D0":"background:#FEF2F2;border-color:#FECACA"}">
          <div class="text-xs font-medium mb-1" style="color:${p>=0?"#15803D":"#B91C1C"}">${p>=0?"Utilidad":"Perdida"} del Periodo</div>
          <div class="text-lg font-bold" style="color:${p>=0?"#15803D":"#B91C1C"}">${fmt(Math.abs(p))}</div>
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
              ${[...l].reverse().map(I=>`
                <tr>
                  <td class="font-mono font-semibold">${esc(I.key)}</td>
                  <td>${A(I)}</td>
                  <td class="text-sm" style="color:#6B7280">${esc(I.enabledBy||I.closedBy||"—")}</td>
                  <td class="text-sm" style="color:#6B7280">${esc(I.enabledAt||"—")}</td>
                  <td>${esc(I.closedAt||"—")}</td>
                  <td class="font-semibold" style="color:${(I.utilidad||0)>=0?"#15803D":"#B91C1C"}">${fmt(I.utilidad||0)}</td>
                  <td class="text-sm" style="color:#6B7280">${esc(I.note||"—")}</td>
                  <td>
                    <div class="flex gap-1">
                      ${I.closed&&can("canWrite")?`<button class="btn btn-outline btn-sm" title="Re-abrir período" onclick="reOpenPeriod('${esc(I.key)}')"><i class="fas fa-lock-open"></i></button>`:""}
                      ${!I.closed&&can("canWrite")?`<button class="btn btn-danger btn-sm" title="Cerrar período" onclick="closePeriod('${esc(I.key)}')"><i class="fas fa-lock"></i></button>`:""}
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
          ${b>0?`<div class="rounded-xl p-4 border" style="background:#F0FFF4;border-color:#BBF7D0">
                <p class="text-xs font-semibold mb-2" style="color:#15803D">1. Cierre de Ingresos (Cl.4 ? Cl.3)</p>
                <p class="text-sm" style="color:#374151">Debito cuentas de ingreso: <strong>${fmt(b)}</strong></p>
                <p class="text-sm" style="color:#374151">Credito resultado del ejercicio: <strong>${fmt(b)}</strong></p>
              </div>`:""}
          ${m>0?`<div class="rounded-xl p-4 border" style="background:#FEF2F2;border-color:#FECACA">
                <p class="text-xs font-semibold mb-2" style="color:#B91C1C">2. Cierre de Gastos (Cl.3 ? Cl.5/6)</p>
                <p class="text-sm" style="color:#374151">Debito resultado del ejercicio: <strong>${fmt(m)}</strong></p>
                <p class="text-sm" style="color:#374151">Credito cuentas de gasto: <strong>${fmt(m)}</strong></p>
              </div>`:""}
        </div>
        ${can("canWrite")&&!g?'<div class="mt-4"><button class="btn btn-primary" id="btn-gen-cierre-entries"><i class="fas fa-magic"></i> Generar Asiento de Cierre</button></div>':""}
      </div>`,(t=$("#btn-new-cierre"))==null||t.addEventListener("click",()=>ns(l,p)),(a=$("#btn-enable-period"))==null||a.addEventListener("click",()=>Aa(l)),(o=$("#btn-enable-period-inline"))==null||o.addEventListener("click",()=>Aa(l)),(s=$("#btn-enable-period-empty"))==null||s.addEventListener("click",()=>Aa(l)),(n=$("#btn-gen-cierre-entries"))==null||n.addEventListener("click",()=>si(i,r,p))}catch(i){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(i.message)}</div>`}}function ns(e,t){var s;const a=new Date,o=`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}`;openModal("Realizar Cierre Contable",`<div class="space-y-4">
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
     <button class="btn btn-danger" id="btn-confirm-cierre"><i class="fas fa-lock"></i> Confirmar Cierre</button>`),(s=$("#btn-confirm-cierre"))==null||s.addEventListener("click",async()=>{var c,l;const n=getInputVal("cierre-key").trim(),i=getInputVal("cierre-date"),r=getInputVal("cierre-note").trim();if(!n||!/^\d{4}-\d{2}$/.test(n))return showToast("El Periodo debe tener formato YYYY-MM","warning");if(!i)return showToast("Ingresa la fecha de cierre","warning");if(e.find(u=>u.key===n&&u.closed))return showToast(`El Periodo ${n} ya esta cerrado`,"warning");try{const u=e.find(p=>p.key===n),b={key:n,enabled:!0,closed:!0,closedAt:i,closedBy:((c=pb.currentUser)==null?void 0:c.email)||"admin",enabledAt:(u==null?void 0:u.enabledAt)||i,enabledBy:(u==null?void 0:u.enabledBy)||((l=pb.currentUser)==null?void 0:l.email)||"admin",note:r,utilidad:t};let m;u?m=e.map(p=>p.key===n?b:p):m=[...e,b],await API.setSetting(Ke,JSON.stringify(m)),closeModal(),showToast(`Periodo ${n} cerrado correctamente`,"success"),Ha($("#page-content"))}catch(u){showToast(u.message,"error")}})}async function zc(e){const t=await API.getSetting(Ke),a=t?JSON.parse(t):[],[o,s]=await Promise.all([API.getAccounts(!1),API.getAccountSaldos()]),n={};for(const r of o){const c=(r.code||"").charAt(0);n[c]=(n[c]||0)+Number(s[r.id]||0)}const i=Math.abs(n[4]||0)-(Math.abs(n[5]||0)+Math.abs(n[6]||0)+Math.abs(n[7]||0));ns(a,i),setTimeout(()=>{const r=$("#cierre-key");r&&(r.value=e)},100)}async function qc(e){confirmDialog("Re-abrir Periodo",`Confirmas re-abrir el Periodo ${e}? Las transacciones volveran a ser posibles.`,async()=>{try{const t=await API.getSetting(Ke),o=(t?JSON.parse(t):[]).map(s=>s.key===e?{...s,enabled:!0,closed:!1,closedAt:null}:s);await API.setSetting(Ke,JSON.stringify(o)),showToast(`Periodo ${e} re-abierto`,"success"),Ha($("#page-content"))}catch(t){showToast(t.message,"error")}})}async function si(e,t,a){var r;if(!can("canWrite"))return showToast("Sin permisos para generar asientos","error");const o=e.filter(c=>(c.code||"").startsWith("3")),s=o.find(c=>c.code==="360505"||c.code==="36050501")||o.find(c=>c.code.startsWith("360")||c.code.startsWith("36"))||o.find(c=>!c.parent_code);if(!s)return showToast("no se encontro la cuenta de Resultado del Ejercicio (Clase 3). Creala en el Plan de Cuentas.","error");const n=e.filter(c=>(c.code||"").startsWith("4")&&Math.abs(Number(t[c.id]||0))>.001),i=e.filter(c=>["5","6","7"].includes((c.code||"").charAt(0))&&Math.abs(Number(t[c.id]||0))>.001);if(!n.length&&!i.length)return showToast("No hay saldos de ingresos ni gastos para cerrar.","warning");openModal("Asiento de Cierre - Vista Previa",`<div class="space-y-4 text-sm">
      <p style="color:#6B7280">Se generaran los siguientes comprobantes contables de cierre:</p>
      <div class="overflow-x-auto">
        <table class="data-table text-xs">
          <thead><tr><th>Cuenta</th><th>Descripcion</th><th>Debito</th><th>Credito</th></tr></thead>
          <tbody>
            ${n.map(c=>{const l=Math.abs(Number(t[c.id]||0));return`<tr><td class="font-mono">${esc(c.code)}</td><td>${esc(c.name)}</td><td>${fmt(l)}</td><td></td></tr>`}).join("")}
            <tr style="background:#F0FFF4"><td class="font-mono">${esc(s.code)}</td><td>${esc(s.name)} (Ingresos)</td><td></td><td>${fmt(Math.abs(ni(e,t)))}</td></tr>
            ${i.map(c=>{const l=Math.abs(Number(t[c.id]||0));return`<tr><td class="font-mono">${esc(c.code)}</td><td>${esc(c.name)}</td><td></td><td>${fmt(l)}</td></tr>`}).join("")}
            <tr style="background:#FEF2F2"><td class="font-mono">${esc(s.code)}</td><td>${esc(s.name)} (Gastos)</td><td>${fmt(ii(e,t))}</td><td></td></tr>
          </tbody>
        </table>
      </div>
      <p class="p-3 rounded-xl font-semibold text-center" style="background:${a>=0?"#F0FFF4":"#FEF2F2"};color:${a>=0?"#15803D":"#B91C1C"}">
        Resultado neto a trasladar: ${fmt(Math.abs(a))} - ${a>=0?"UTILIDAD":"Perdida"}
      </p>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-post-cierre"><i class="fas fa-floppy-disk"></i> Contabilizar Asiento</button>`),(r=$("#btn-post-cierre"))==null||r.addEventListener("click",async()=>{var c;try{const l=await API.getTxTypes(),u=l.find(d=>{var y;return d.prefix==="CM"||((y=d.name)==null?void 0:y.toLowerCase().includes("cierre"))})||l[0];if(!u)return showToast("No hay tipo de transaccion para el asiento de cierre","error");const b=[];n.forEach(d=>{const y=Math.abs(Number(t[d.id]||0));b.push({account_id:d.id,debit:y,credit:0,description:"Cierre de ingresos",line_order:b.length+1})});const m=n.reduce((d,y)=>d+Math.abs(Number(t[y.id]||0)),0);m>0&&b.push({account_id:s.id,debit:0,credit:m,description:"Traslado de ingresos al resultado",line_order:b.length+1}),i.forEach(d=>{const y=Math.abs(Number(t[d.id]||0));b.push({account_id:d.id,debit:0,credit:y,description:"Cierre de gastos",line_order:b.length+1})});const p=i.reduce((d,y)=>d+Math.abs(Number(t[y.id]||0)),0);p>0&&b.push({account_id:s.id,debit:p,credit:0,description:"Traslado de gastos al resultado",line_order:b.length+1});const f=await API.createTransaction({tx_type_id:u.id,number:"",date:todayStr(),description:`Asiento de cierre ${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`,user_id:(c=pb.currentUser)==null?void 0:c.id,status:"active"},b);closeModal(),showToast(`Asiento de cierre ${f.number} contabilizado. Revisalo en Consulta de Transacciones.`,"success")}catch(l){showToast(l.message,"error")}})}function ni(e,t){return e.filter(a=>(a.code||"").startsWith("4")).reduce((a,o)=>a+Math.abs(Number(t[o.id]||0)),0)}function ii(e,t){return e.filter(a=>["5","6","7"].includes((a.code||"").charAt(0))).reduce((a,o)=>a+Math.abs(Number(t[o.id]||0)),0)}function Aa(e){var o;if(!can("canWrite"))return showToast("No tienes permisos para habilitar períodos","error");const t=new Date,a=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`;openModal('<i class="fas fa-calendar-plus mr-2" style="color:#1A4B8C"></i>Habilitar Período',`<div class="space-y-4">
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
     <button class="btn btn-primary" id="btn-confirm-enable"><i class="fas fa-calendar-check"></i> Habilitar Período</button>`),(o=$("#btn-confirm-enable"))==null||o.addEventListener("click",async()=>{var c;const s=getInputVal("enable-key").trim(),n=getInputVal("enable-date"),i=getInputVal("enable-note").trim();if(!s||!/^\d{4}-\d{2}$/.test(s))return showToast("El período debe tener formato YYYY-MM","warning");if(!n)return showToast("Ingresa la fecha de habilitación","warning");const r=Number(s.split("-")[1]);if(r<1||r>12)return showToast("Mes inválido en el período","warning");if(e.find(l=>l.key===s))return showToast(`El período ${s} ya está registrado en el sistema`,"warning");try{const l={key:s,enabled:!0,closed:!1,enabledAt:n,enabledBy:((c=pb.currentUser)==null?void 0:c.email)||"admin",closedAt:null,closedBy:null,note:i,utilidad:0},u=[...e,l].sort((b,m)=>b.key.localeCompare(m.key));await API.setSetting(Ke,JSON.stringify(u)),closeModal(),showToast(`Período ${s} habilitado correctamente para digitación`,"success"),Ha($("#page-content"))}catch(l){showToast(l.message,"error")}})}async function Wc(e){try{const t=await API.getSetting(Ke);if(!t)return!0;const a=JSON.parse(t),o=(e||"").slice(0,7),s=a.find(n=>n.key===o);return!!(!s||s.closed)}catch{return!1}}async function Yc(e){try{const t=await API.getSetting(Ke);if(!t)return!1;const a=JSON.parse(t),o=(e||"").slice(0,7);return a.some(s=>s.key===o)}catch{return!1}}window.openEnablePeriodForm=Aa;window.reOpenPeriod=qc;window.closePeriod=zc;window.isPeriodRegistered=Yc;window.CIERRE_SETTING_KEY=Ke;window.generateCierreEntries=si;window.isPeriodClosed=Wc;window.openCierreForm=ns;window.byClass4=ni;window.gastoTotal=ii;window.renderCierre=Ha;const ri=[{name:"settings",label:"Configuración"},{name:"account_types",label:"Tipos de cuenta"},{name:"accounts",label:"Plan de cuentas"},{name:"third_parties",label:"Terceros"},{name:"transaction_types",label:"Tipos de transacción"},{name:"transactions",label:"Transacciones"},{name:"tx_lines",label:"Líneas de transacción"},{name:"bank_accounts",label:"Cuentas bancarias"},{name:"bank_movements",label:"Movimientos bancarios"},{name:"payroll_periods",label:"Períodos de nómina"},{name:"payroll_employees",label:"Empleados de nómina"},{name:"payroll_items",label:"Ítems de nómina"},{name:"audit_log",label:"Auditoría"}],is="2.0";let Jt=!1,Kt=!1,Qt=!1,Ct=!1,ct=!1,Tt=!1;async function Jc(e){var t,a,o,s,n,i,r,c,l,u,b;e.innerHTML=`
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
    </div>`,Jt=!1,Kt=!1,Qt=!1,Ct=!1,ct=!1,Tt=!1,rs(),Vt(),(t=$("#btn-backup-create"))==null||t.addEventListener("click",ci),(a=$("#btn-backup-restore"))==null||a.addEventListener("click",()=>{var m;return(m=$("#backup-file-input"))==null?void 0:m.click()}),(o=$("#backup-file-input"))==null||o.addEventListener("change",li),(s=$("#btn-mass-tx-template"))==null||s.addEventListener("click",pi),(n=$("#btn-mass-tx-open"))==null||n.addEventListener("click",ui),(i=$("#btn-mass-tp-template"))==null||i.addEventListener("click",gi),(r=$("#btn-mass-tp-open"))==null||r.addEventListener("click",vi),(c=$("#btn-mass-acc-template"))==null||c.addEventListener("click",cs),(l=$("#btn-mass-acc-open"))==null||l.addEventListener("click",Ai),(u=$("#btn-mass-ph-units-template"))==null||u.addEventListener("click",ls),(b=$("#btn-mass-ph-units-open"))==null||b.addEventListener("click",wi)}function rs(){const e=localStorage.getItem("gravy_last_backup")||localStorage.getItem("contaco_last_backup");if(e)try{const t=JSON.parse(e),a=$("#backup-last-info"),o=$("#backup-last-text");a&&o&&(o.textContent=`Último respaldo: ${t.label} — ${t.records} registros`,a.classList.remove("hidden"))}catch{}}async function Vt(){const e=$("#sysinfo-content");if(!e)return;const t=await Promise.all(["accounts","third_parties","transactions","tx_lines"].map(async o=>{try{const s=await pb.list(o,{perPage:1,page:1});return{col:o,total:s.totalItems}}catch{return{col:o,total:"—"}}})),a={accounts:"Cuentas contables",third_parties:"Terceros",transactions:"Transacciones",tx_lines:"Líneas contables"};e.innerHTML=t.map(o=>`
    <div class="flex items-center justify-between py-2 border-b last:border-0" style="border-color:#F3F4F6">
      <span class="text-sm" style="color:#374151">${a[o.col]}</span>
      <span class="font-bold text-sm" style="color:#E87D1E">${typeof o.total=="number"?o.total.toLocaleString("es-CO"):o.total}</span>
    </div>
  `).join("")+`
    <div class="flex items-center justify-between pt-3 mt-1">
      <span class="text-xs" style="color:#9CA3AF">Versión GRAVY</span>
      <span class="badge badge-orange">v${is}</span>
    </div>`}async function ci(){var l;if(Jt)return;Jt=!0;const e=$("#btn-backup-create");e&&(e.disabled=!0,e.innerHTML='<i class="fas fa-spinner fa-spin"></i> Generando...');const t=$("#backup-progress-wrap"),a=$("#backup-progress-bar"),o=$("#backup-progress-label"),s=$("#backup-progress-pct");t&&t.classList.remove("hidden");const n=(u,b)=>{o&&(o.textContent=u),a&&(a.style.width=`${b}%`),s&&(s.textContent=`${Math.round(b)}%`)},i=ri.filter(u=>!(u.name==="audit_log"&&!can("canViewAudit"))),r={_meta:{version:is,created_at:new Date().toISOString(),app:"GRAVY",user:((l=pb.currentUser)==null?void 0:l.email)??"desconocido"},collections:{}};let c=0;try{for(let y=0;y<i.length;y++){const v=i[y],g=y/i.length*95;n(`Exportando: ${v.label}...`,g);try{const h=await pb.listAll(v.name);r.collections[v.name]=h,c+=h.length}catch(h){r.collections[v.name]=[],console.warn(`[Backup] Colección omitida (${v.name}):`,h.message)}}n("Generando archivo...",97);const u=JSON.stringify(r,null,2),b=new Blob([u],{type:"application/json"}),m=URL.createObjectURL(b),p=document.createElement("a"),f=new Date().toISOString().slice(0,16).replace("T","_").replace(":","-");p.href=m,p.download=`GRAVY_backup_${f}.json`,document.body.appendChild(p),p.click(),document.body.removeChild(p),URL.revokeObjectURL(m),n("Completado",100);const d=JSON.stringify({label:new Date().toLocaleString("es-CO",{dateStyle:"short",timeStyle:"short"}),records:c});localStorage.setItem("gravy_last_backup",d),rs(),await API.logAudit("BACKUP_CREATED","sistema",null,`Respaldo manual: ${c} registros exportados`),showToast(`Respaldo creado exitosamente — ${c.toLocaleString("es-CO")} registros`,"success")}catch(u){showToast(`Error al generar respaldo: ${u.message}`,"error"),console.error("[Backup]",u)}finally{Jt=!1,e&&(e.disabled=!1,e.innerHTML='<i class="fas fa-download"></i> Crear respaldo'),t&&setTimeout(()=>t==null?void 0:t.classList.add("hidden"),2e3)}}async function li(e){var i,r;const t=(i=e.target.files)==null?void 0:i[0];if(!t)return;if(e.target.value="",!can("canWrite")||!can("canDelete")){showToast("No tienes permiso para restaurar un respaldo","error");return}let a;try{const c=await t.text();a=JSON.parse(c)}catch{showToast("El archivo no es un respaldo válido (JSON malformado)","error");return}if(!((r=a._meta)!=null&&r.version)||!a.collections){showToast("El archivo no corresponde a un respaldo de GRAVY","error");return}const o=a._meta,s=Object.keys(a.collections).length,n=Object.values(a.collections).reduce((c,l)=>c+((l==null?void 0:l.length)??0),0);jt("Confirmar restauración",`
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
    </div>`,[{label:"Cancelar",class:"btn-outline",action:()=>closeModal()},{label:"Restaurar",class:"btn-danger",action:()=>di(a)}])}async function di(e){if(Kt)return;Kt=!0,closeModal(),showToast("Iniciando restauración...","info");const t=["settings","account_types","accounts","third_parties","transaction_types","transactions","tx_lines","bank_accounts","bank_movements","payroll_periods","payroll_employees","payroll_items"];let a=0,o=0,s=0;for(const i of t){const r=e.collections[i];if(!(!Array.isArray(r)||r.length===0))for(const c of r)try{try{await pb.update(i,c.id,c)}catch(l){if(l.status===404)await pb.create(i,c);else throw l}a++}catch(l){o++,l.status!==400&&s++,console.warn(`[Restore] ${i}/${c.id}:`,l.message)}}await API.logAudit("BACKUP_RESTORED","sistema",null,`Restauración desde respaldo: ${a} restaurados, ${o} omitidos`);const n=`Restauración completada — ${a} registros restaurados, ${o} omitidos`;showToast(n,s>10?"warning":"success"),Kt=!1,Vt()}function pi(){const e=["grupo","fecha","tipo","descripcion","tercero","plazo_dias","cuenta","debito","credito","tercero_linea","descripcion_linea","doc_cruce"].join(","),t=["CMP-001,2026-05-01,RC,Registro recaudo factura FV-1001,900123456,0,111005,1500000,0,900123456,Ingreso por recaudo,FV-1001","CMP-001,2026-05-01,RC,Registro recaudo factura FV-1001,900123456,0,130505,0,1500000,900123456,Cruce cartera cliente,FV-1001","CMP-002,2026-05-02,CE,Pago proveedor factura FC-888,901234567,30,220501,450000,0,901234567,Cruce CxP proveedor,FC-888","CMP-002,2026-05-02,CE,Pago proveedor factura FC-888,901234567,30,111005,0,450000,901234567,Salida de caja,FC-888"].join(`
`),a=new Blob([`${e}
${t}`],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_carga_transacciones.csv",s.click(),URL.revokeObjectURL(o)}async function ui(){if(!can("canWrite"))return showToast("No tienes permisos para importar transacciones","error");jt('<i class="fas fa-file-import mr-2" style="color:#059669"></i>Carga masiva de transacciones',`
    <div class="mb-2">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx/.xls)</strong> con líneas contables agrupadas por comprobante.
        Cada <strong>grupo</strong> representa un comprobante y debe quedar cuadrado (débito = crédito).
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#ECFDF5;border:1px solid #A7F3D0">
        <p class="text-xs font-semibold mb-1" style="color:#047857;text-transform:uppercase;letter-spacing:.05em">Columnas requeridas</p>
        <div class="flex flex-wrap gap-2 mb-2">
          ${["grupo","fecha","tipo","descripcion","cuenta"].map(c=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#D1FAE5;color:#065F46">${c}</code>`).join("")}
          ${["debito","credito","tercero","plazo_dias","tercero_linea","descripcion_linea","doc_cruce"].map(c=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${c} <span style="font-size:.65rem">(opcional)</span></code>`).join("")}
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
     <button class="btn btn-primary hidden" id="btn-mass-tx-run"><i class="fas fa-bolt mr-1"></i>Ejecutar carga</button>`,!0);let e=[];const t=$("#mass-tx-drop-zone"),a=$("#mass-tx-file-input"),o=$("#btn-mass-tx-run"),s=$("#btn-mass-tx-clear"),n=()=>{var u;e=[],(u=$("#mass-tx-preview"))==null||u.classList.add("hidden"),o==null||o.classList.add("hidden");const c=$("#mass-tx-preview-body");c&&(c.innerHTML="");const l=$("#mass-tx-summary");l&&(l.innerHTML=""),a&&(a.value="")},i=()=>{t&&(t.style.borderColor="#D1D5DB",t.style.background="#FAFAFA")};t==null||t.addEventListener("click",()=>a==null?void 0:a.click()),t==null||t.addEventListener("dragover",c=>{c.preventDefault(),t&&(t.style.borderColor="#1A4B8C",t.style.background="#EFF6FF")}),t==null||t.addEventListener("dragleave",()=>i()),t==null||t.addEventListener("drop",c=>{var u,b;c.preventDefault(),i();const l=(b=(u=c.dataTransfer)==null?void 0:u.files)==null?void 0:b[0];l&&r(l)}),a==null||a.addEventListener("change",()=>{var l;const c=(l=a.files)==null?void 0:l[0];c&&r(c)}),s==null||s.addEventListener("click",n),o==null||o.addEventListener("click",()=>bi(e));async function r(c){if(c.size>8*1024*1024)return showToast("El archivo supera el límite de 8 MB","error");const l=String(c.name.split(".").pop()||"").toLowerCase();let u=[];try{if(l==="csv")u=pa(await c.text());else if(l==="xlsx"||l==="xls")u=ua(await c.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(b){return showToast(`Error al leer el archivo: ${b.message}`,"error")}if(!u.length)return showToast("El archivo no contiene datos","warning");e=await mi(u),fi(e)}}function Ga(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"_").trim()}function pa(e){const t=String(e||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).filter(s=>s.trim());if(!t.length)return[];const a=s=>{const n=[];let i="",r=!1;for(let c=0;c<s.length;c++){const l=s[c];if(l==='"'){r&&s[c+1]==='"'?(i+='"',c++):r=!r;continue}if(l===","&&!r){n.push(i.trim()),i="";continue}i+=l}return n.push(i.trim()),n},o=a(t[0]).map(Ga);return t.slice(1).map(s=>{const n=a(s),i={};return o.forEach((r,c)=>{i[r]=String(n[c]??"").trim()}),i})}function ua(e){const t=XLSX.read(e,{type:"array"}),a=t.Sheets[t.SheetNames[0]];return XLSX.utils.sheet_to_json(a,{defval:""}).map(s=>{const n={};return Object.entries(s).forEach(([i,r])=>{n[Ga(i)]=String(r??"").trim()}),n})}function ve(e,t){for(const a of t){const o=e[a];if(o!==void 0&&String(o).trim()!=="")return String(o).trim()}return""}function Ft(e){return String(e||"").replace(/[^0-9a-z]/gi,"").toUpperCase()}function Pt(e){if(e==null||e==="")return 0;let t=String(e).trim();if(!t)return 0;t.includes(",")&&t.includes(".")?t=t.replace(/,/g,""):t.includes(",")&&!t.includes(".")&&(t=t.replace(/,/g,".")),t=t.replace(/[^0-9.\-]/g,"");const a=Number(t);return Number.isFinite(a)?a:0}async function mi(e){var p;const[t,a,o]=await Promise.all([API.getAccounts(!0),API.getTxTypes(),API.getTerceros({})]),s=new Set(t.map(f=>f.parent_code).filter(Boolean)),n=new Set(t.filter(f=>!s.has(f.code)).map(f=>f.id)),i=new Map(t.map(f=>[String(f.code||"").trim(),f])),r=new Map;a.forEach(f=>{r.set(String(f.prefix||"").toUpperCase(),f),r.set(String(f.code||"").toUpperCase(),f),r.set(String(f.id||"").toUpperCase(),f)});const c=new Map;o.forEach(f=>{const d=Ft(f.doc_number);d&&c.set(d,f)});const l=new Map,u=(f,d,y,v,g)=>{if(y){if(!f[d]){f[d]=y;return}f[d]!==y&&f.errors.push(`Fila ${g}: valor inconsistente en ${v} ("${f[d]}" vs "${y}")`)}};for(let f=0;f<e.length;f++){const d=e[f]||{},y=f+2,v=ve(d,["grupo","tx_group","comprobante","grupo_tx"]);if(!v)continue;l.has(v)||l.set(v,{group:v,txDate:"",txType:"",txDesc:"",thirdDoc:"",paymentDays:"0",lines:[],errors:[]});const g=l.get(v);u(g,"txDate",ve(d,["fecha","date","tx_date"]),"fecha",y),u(g,"txType",ve(d,["tipo","tx_type","tipo_tx"]),"tipo",y),u(g,"txDesc",ve(d,["descripcion","description","detalle"]),"descripcion",y),u(g,"thirdDoc",ve(d,["tercero","tercero_doc","nit_tercero","doc_tercero"]),"tercero",y),u(g,"paymentDays",ve(d,["plazo_dias","payment_days","dias_pago"]),"plazo_dias",y);const h=ve(d,["cuenta","account","codigo_cuenta","account_code"]),_=Pt(ve(d,["debito","debit"])),A=Pt(ve(d,["credito","credit"])),I=ve(d,["tercero_linea","line_third","tercero_line"]),F=ve(d,["descripcion_linea","line_description","detalle_linea"]),S=ve(d,["doc_cruce","cross_doc_ref","documento_cruce"]);g.lines.push({rowNo:y,accountCode:h,debit:_,credit:A,lineThirdDoc:I,lineDesc:F,crossDoc:S})}const b=new Map,m=[];for(const f of l.values()){const d=[...f.errors];f.txDate||d.push("Falta fecha del comprobante"),f.txType||d.push("Falta tipo del comprobante"),f.txDesc||d.push("Falta descripción del comprobante");const y=r.get(String(f.txType||"").toUpperCase());y||d.push(`Tipo de transacción no encontrado: ${f.txType||"(vacío)"}`);let v=null;if(f.thirdDoc&&(v=c.get(Ft(f.thirdDoc)),v||d.push(`Tercero no encontrado (encabezado): ${f.thirdDoc}`)),f.txDate){const _=f.txDate.slice(0,7);if(!b.has(_)){let A=!1;typeof isPeriodClosed=="function"&&(A=await isPeriodClosed(f.txDate)),b.set(_,A)}b.get(_)&&d.push(`El período ${_} no está habilitado o está cerrado`)}const g=[];for(const _ of f.lines){const A=i.get(String(_.accountCode||"").trim());if(!_.accountCode){d.push(`Fila ${_.rowNo}: falta cuenta`);continue}if(!A){d.push(`Fila ${_.rowNo}: cuenta no encontrada (${_.accountCode})`);continue}n.has(A.id)||d.push(`Fila ${_.rowNo}: la cuenta ${A.code} es de mayor; usa una cuenta auxiliar`);const I=Number(_.debit||0)>0,F=Number(_.credit||0)>0;I&&F&&d.push(`Fila ${_.rowNo}: no puede tener débito y crédito al mismo tiempo`),!I&&!F&&d.push(`Fila ${_.rowNo}: debes registrar débito o crédito`);let S=null;_.lineThirdDoc&&(S=c.get(Ft(_.lineThirdDoc)),S||d.push(`Fila ${_.rowNo}: tercero de línea no encontrado (${_.lineThirdDoc})`)),A.requires_third_party&&!(S!=null&&S.id||v!=null&&v.id)&&d.push(`Fila ${_.rowNo}: la cuenta ${A.code} requiere tercero`),g.push({rowNo:_.rowNo,account_id:A.id,debit:Number(_.debit||0),credit:Number(_.credit||0),third_party_id:(S==null?void 0:S.id)||(v==null?void 0:v.id)||null,description:_.lineDesc||f.txDesc,cross_doc_ref:_.crossDoc||""})}const h=g.reduce((_,A)=>(_.debit+=Number(A.debit||0),_.credit+=Number(A.credit||0),_),{debit:0,credit:0});g.length<2&&d.push("Se requieren al menos 2 líneas contables válidas"),(Math.abs(h.debit-h.credit)>1e-4||h.debit<=0)&&d.push("Comprobante descuadrado: débito y crédito no coinciden"),m.push({group:f.group,txDate:f.txDate,txTypeLabel:y?`${y.prefix} - ${y.name}`:f.txType||"—",linesCount:g.length,debit:h.debit,credit:h.credit,ok:d.length===0,errors:d,payload:d.length?null:{txData:{tx_type_id:y.id,number:"",date:f.txDate,description:f.txDesc,third_party_id:(v==null?void 0:v.id)||null,user_id:(p=pb.currentUser)==null?void 0:p.id,payment_days:parseInt(f.paymentDays,10)||0,cross_enabled:g.some(_=>!!_.cross_doc_ref),status:"active"},lines:g.map((_,A)=>({account_id:_.account_id,third_party_id:_.third_party_id,debit:_.debit,credit:_.credit,description:_.description,line_order:A+1,cross_doc_ref:_.cross_doc_ref}))}})}return m.sort((f,d)=>String(f.group).localeCompare(String(d.group)))}function fi(e){const t=$("#mass-tx-preview"),a=$("#mass-tx-preview-body"),o=$("#mass-tx-summary"),s=$("#btn-mass-tx-run");if(!t||!a||!o||!s)return;const n=e.filter(r=>r.ok),i=e.filter(r=>!r.ok);a.innerHTML=e.map(r=>{const c=r.ok?"Validado":r.errors[0]||"Error de validación";return`
      <tr ${r.ok?"":'style="background:#FFF7F7"'}>
        <td>${esc(r.group)}</td>
        <td>${esc(r.txDate||"—")}</td>
        <td>${esc(r.txTypeLabel||"—")}</td>
        <td>${r.linesCount}</td>
        <td>${fmt(r.debit)}</td>
        <td>${fmt(r.credit)}</td>
        <td>${r.ok?'<span class="badge badge-green">OK</span>':'<span class="badge badge-red">Error</span>'}</td>
        <td class="text-xs" style="max-width:360px;white-space:normal">${esc(c)}</td>
      </tr>`}).join(""),o.innerHTML=`
    <span style="color:${i.length?"#B91C1C":"#166534"}">
      ${e.length} comprobante(s): ${n.length} válido(s), ${i.length} con error.
      ${i.length?"Solo se procesarán los válidos.":"Listo para ejecutar."}
    </span>`,t.classList.remove("hidden"),n.length?s.classList.remove("hidden"):s.classList.add("hidden")}async function bi(e){if(Qt||!Array.isArray(e)||!e.length)return;const t=e.filter(l=>l.ok&&l.payload);if(!t.length)return showToast("No hay comprobantes válidos para importar","warning");Qt=!0;const a=$("#btn-mass-tx-run"),o=$("#mass-tx-progress-wrap"),s=$("#mass-tx-progress-bar"),n=$("#mass-tx-progress-text");a&&(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'),o==null||o.classList.remove("hidden");let i=0,r=0;const c=[];try{for(let l=0;l<t.length;l++){const u=t[l],b=l/t.length*100;s&&(s.style.width=`${b}%`),n&&(n.textContent=`Procesando ${l+1} de ${t.length}: ${u.group}`);try{await API.createTransaction(u.payload.txData,u.payload.lines),i++}catch(m){r++,c.push(`${u.group}: ${m.message}`)}}s&&(s.style.width="100%"),n&&(n.textContent="Proceso finalizado"),await API.logAudit("IMPORT","transactions","bulk",`Carga masiva: ${i} creadas, ${r} con error de ${t.length} comprobantes válidos`),c.length&&console.warn("[CargaMasivaTx] Errores:",c),showToast(`Carga masiva finalizada: ${i} comprobante(s) creados${r?`, ${r} con error`:""}`,r?"warning":"success",5500),Vt()}finally{Qt=!1,a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar carga')}}function gi(){const e=["doc_type","doc_number","person_type","type","razon_social","nombres","apellidos","email","phone","address","dept_code","city_code","tax_regime","credit_limit","payment_days","active"].join(","),t=["NIT,900123456,JURIDICA,CLIENTE,CERAMICAS CONSTRUHOGAR SAS,,,,3001234567,CR 8 73-25,68,68001,COMUN,5000000,30,Si","CC,1234567890,NATURAL,PROVEEDOR,,JUAN CARLOS,PEREZ GOMEZ,juan@correo.com,3109876543,CL 45 12-30,05,05001,NO_RESP,0,0,Si","NIT,800987654,JURIDICA,EMPLEADO,EMPRESA LOGISTICA SAS,,,,6012345678,AV 68 45-10,11,11001,COMUN,0,0,Si","CC,9876543210,NATURAL,ACREEDOR,,MARIA ELENA,RODRIGUEZ SILVA,,3201112233,KR 15 80-20,76,76001,,0,0,Si"].join(`
`),a=new Blob([`${e}
${t}`],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_carga_terceros.csv",s.click(),URL.revokeObjectURL(o)}async function vi(){if(!can("canWrite"))return showToast("No tienes permisos para importar terceros","error");jt('<i class="fas fa-users mr-2" style="color:#1D4ED8"></i>Carga masiva de terceros',`
    <div class="mb-2">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx/.xls)</strong> con los terceros a registrar.
        Si el documento ya existe, el tercero será <strong>actualizado</strong>; si no existe, será <strong>creado</strong>.
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#EFF6FF;border:1px solid #BFDBFE">
        <p class="text-xs font-semibold mb-1" style="color:#1D4ED8;text-transform:uppercase;letter-spacing:.05em">Columnas requeridas</p>
        <div class="flex flex-wrap gap-2 mb-2">
          ${["doc_type","doc_number","person_type","type"].map(c=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#DBEAFE;color:#1E40AF">${c}</code>`).join("")}
          ${["razon_social","nombres","apellidos","email","phone","address","dept_code","city_code","tax_regime","credit_limit","payment_days","active"].map(c=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${c} <span style="font-size:.65rem">(opcional)</span></code>`).join("")}
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
     <button class="btn btn-primary hidden" id="btn-mass-tp-run"><i class="fas fa-bolt mr-1"></i>Ejecutar carga</button>`,!0);let e=[];const t=$("#mass-tp-drop-zone"),a=$("#mass-tp-file-input"),o=$("#btn-mass-tp-run"),s=$("#btn-mass-tp-clear"),n=()=>{var u;e=[],(u=$("#mass-tp-preview"))==null||u.classList.add("hidden"),o==null||o.classList.add("hidden");const c=$("#mass-tp-preview-body");c&&(c.innerHTML="");const l=$("#mass-tp-summary");l&&(l.innerHTML=""),a&&(a.value="")},i=()=>{t&&(t.style.borderColor="#D1D5DB",t.style.background="#FAFAFA")};t==null||t.addEventListener("click",()=>a==null?void 0:a.click()),t==null||t.addEventListener("dragover",c=>{c.preventDefault(),t&&(t.style.borderColor="#1D4ED8",t.style.background="#EFF6FF")}),t==null||t.addEventListener("dragleave",()=>i()),t==null||t.addEventListener("drop",c=>{var u,b;c.preventDefault(),i();const l=(b=(u=c.dataTransfer)==null?void 0:u.files)==null?void 0:b[0];l&&r(l)}),a==null||a.addEventListener("change",()=>{var l;const c=(l=a.files)==null?void 0:l[0];c&&r(c)}),s==null||s.addEventListener("click",n),o==null||o.addEventListener("click",()=>_i(e));async function r(c){if(c.size>8*1024*1024)return showToast("El archivo supera el límite de 8 MB","error");const l=String(c.name.split(".").pop()||"").toLowerCase();let u=[];try{if(l==="csv")u=pa(await c.text());else if(l==="xlsx"||l==="xls")u=ua(await c.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(b){return showToast(`Error al leer el archivo: ${b.message}`,"error")}if(!u.length)return showToast("El archivo no contiene datos","warning");e=hi(u),yi(e)}}function hi(e){const t=new Set(["NIT","CC","CE","TI","PAS","RC"]),a=new Set(["NATURAL","JURIDICA","GRAN_CONTRIBUYENTE"]),o=new Set(["CLIENTE","PROVEEDOR","EMPLEADO","ACREEDOR","TRANSPORTISTA","OTRO"]);return e.map((s,n)=>{const i=n+2,r=(...O)=>{for(const M of O){const B=s[Ga(M)];if(B!==void 0&&String(B).trim()!=="")return String(B).trim()}return""},c=r("doc_type","tipo_doc","tipo_documento").toUpperCase(),l=r("doc_number","numero_doc","nit","documento","doc").replace(/[^0-9a-zA-Z]/g,""),u=r("person_type","tipo_persona","persona").toUpperCase()||"NATURAL",b=r("type","tipo","rol").toUpperCase()||"CLIENTE",m=r("razon_social","business_name","razon").toUpperCase(),p=r("nombres","first_name","nombre").toUpperCase(),f=r("apellidos","last_name","apellido").toUpperCase(),d=u==="NATURAL",y=d?[p,f].filter(Boolean).join(" "):m,v=r("email","correo"),g=r("phone","telefono","tel"),h=r("address","direccion").toUpperCase(),_=r("dept_code","cod_dept","departamento_cod"),A=r("city_code","cod_mun","municipio_cod","ciudad_cod"),I=r("tax_regime","regimen","tax").toUpperCase(),F=parseFloat(r("credit_limit","cupo_credito","cupo").replace(/[^0-9.]/g,""))||0,S=parseInt(r("payment_days","plazo_dias","plazo"),10)||0,x=r("active","activo","estado").toLowerCase(),T=!/^(no|0|false|inactivo|inactiva)$/.test(x),E=c==="NIT"?calcDV(l):"";if(!c)return{ok:!1,rowNo:i,error:`Fila ${i}: falta doc_type`};if(!t.has(c))return{ok:!1,rowNo:i,error:`Fila ${i}: doc_type inválido (${c})`};if(!l)return{ok:!1,rowNo:i,error:`Fila ${i}: falta doc_number`};if(!a.has(u))return{ok:!1,rowNo:i,error:`Fila ${i}: person_type inválido (${u})`};if(!o.has(b))return{ok:!1,rowNo:i,error:`Fila ${i}: type inválido (${b})`};if(d&&!p&&!f)return{ok:!1,rowNo:i,error:`Fila ${i}: persona natural requiere nombres o apellidos`};if(!d&&!m)return{ok:!1,rowNo:i,error:`Fila ${i}: persona jurídica requiere razon_social`};if(!y)return{ok:!1,rowNo:i,error:`Fila ${i}: no se pudo determinar el nombre`};let C="",N="";if(_){const O=(typeof GEO_DEPTS<"u"?GEO_DEPTS:[]).find(M=>M.code===_);if(!O)return{ok:!1,rowNo:i,error:`Fila ${i}: dept_code "${_}" no encontrado`};if(C=O.name,A){const B=(typeof geoMunisByDept=="function"?geoMunisByDept(_):[]).find(j=>j.code===A);if(!B)return{ok:!1,rowNo:i,error:`Fila ${i}: city_code "${A}" no encontrado en dept ${_}`};N=B.name}}return{ok:!0,rowNo:i,docNumber:l,docType:c,name:y,personType:u,tpType:b,email:v,active:T,payload:{doc_type:c,doc_number:l,dv:E,person_type:u,type:b,first_name:p,last_name:f,business_name:m,commercial_name:"",name:y,email:v,email2:"",phone:g,phone2:"",contact_name:"",advisor:"",address:h,country:_?"CO":"",department:C,dept_code:_,city:N,city_code:A,tax_regime:I,credit_limit:F,max_invoices:1,payment_days:S,active:T}}})}function yi(e){const t=$("#mass-tp-preview"),a=$("#mass-tp-preview-body"),o=$("#mass-tp-summary"),s=$("#btn-mass-tp-run");if(!t||!a||!o||!s)return;const n=e.filter(r=>r.ok),i=e.filter(r=>!r.ok);a.innerHTML=e.map(r=>r.ok?`<tr>
        <td>${r.rowNo}</td>
        <td><span class="font-semibold" style="color:#1D4ED8">${esc(r.docType)} ${esc(r.docNumber)}</span></td>
        <td>${esc(r.name)}</td>
        <td>${esc(r.personType)}</td>
        <td>${esc(r.tpType)}</td>
        <td>${esc(r.email||"—")}</td>
        <td><span class="badge ${r.active?"badge-green":"badge-gray"}">${r.active?"Activo":"Inactivo"}</span></td>
        <td><span class="badge badge-green">OK</span></td>
      </tr>`:`<tr style="background:#FFF7F7">
      <td>${r.rowNo}</td>
      <td colspan="6" class="text-xs" style="color:#EF4444">${esc(r.error||"Error")}</td>
      <td><span class="badge badge-red">Error</span></td>
    </tr>`).join(""),o.innerHTML=`<span style="color:${i.length?"#B91C1C":"#166534"}">
    ${e.length} fila(s): ${n.length} válida(s), ${i.length} con error.
    ${i.length?"Las filas con error serán omitidas.":"Listo para ejecutar."}
  </span>`,t.classList.remove("hidden"),n.length?s.classList.remove("hidden"):s.classList.add("hidden")}async function _i(e){if(Ct)return;const t=(e||[]).filter(b=>b.ok&&b.payload);if(!t.length)return showToast("No hay filas válidas para importar","warning");Ct=!0;const a=$("#btn-mass-tp-run"),o=$("#mass-tp-progress-wrap"),s=$("#mass-tp-progress-bar"),n=$("#mass-tp-progress-text");a&&(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'),o==null||o.classList.remove("hidden");let i=new Map;try{(await pb.listAll("third_parties",{})).forEach(m=>{const p=`${m.doc_type}|${String(m.doc_number||"").replace(/[^0-9a-zA-Z]/g,"")}`;i.set(p,m.id)})}catch(b){showToast(`Error al cargar terceros existentes: ${b.message}`,"error"),Ct=!1,a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar carga');return}let r=0,c=0,l=0;const u=[];try{for(let b=0;b<t.length;b++){const m=t[b],p=b/t.length*100;s&&(s.style.width=`${p}%`),n&&(n.textContent=`Procesando ${b+1} de ${t.length}: ${m.name}`);const f=`${m.payload.doc_type}|${m.payload.doc_number}`,d=i.get(f);try{if(d)await pb.update("third_parties",d,m.payload),c++;else{const y=await pb.create("third_parties",m.payload);i.set(f,y.id),r++}}catch(y){l++,u.push(`Fila ${m.rowNo} (${m.docNumber}): ${y.message}`)}}s&&(s.style.width="100%"),n&&(n.textContent="Proceso finalizado"),await API.logAudit("IMPORT","third_parties","bulk",`Carga masiva: ${r} creados, ${c} actualizados, ${l} con error`),u.length&&console.warn("[CargaMasivaTp] Errores:",u),showToast(`Carga completada: ${r} creados, ${c} actualizados${l?`, ${l} con error`:""}`,l?"warning":"success",5500),Vt()}finally{Ct=!1,a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar carga')}}function cs(){const e="codigo,nombre,tipo,naturaleza,nivel,codigo_padre,requiere_tercero,activa",t=["1,ACTIVO,1,debit,1,,No,Si","11,DISPONIBLE,1,debit,2,1,,Si","1105,CAJA,1,debit,3,11,,Si","110505,Caja General,1,debit,4,1105,No,Si"].join(`
`),a=new Blob([e+`
`+t],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_plan_cuentas.csv",s.click(),URL.revokeObjectURL(o)}function xi(e,t){const a=(...v)=>{for(const g of v){const h=e[g];if(h!==void 0&&h!=="")return String(h).trim()}return""},o=a("codigo","code","cod","cuenta"),s=a("nombre","name","descripcion","description"),n=a("tipo","type","tipo_cuenta","account_type"),i=a("naturaleza","nature","nat"),r=a("nivel","level"),c=a("codigo_padre","parent_code","padre","parent"),l=a("requiere_tercero","requires_third_party","tercero","req_tercero"),u=a("activa","active","estado");if(!o)return{ok:!1,error:"Falta el código"};if(!/^\d+$/.test(o))return{ok:!1,error:`Código "${o}" no es numérico`};if(!s)return{ok:!1,error:"Falta el nombre"};if(!n)return{ok:!1,error:"Falta el tipo de cuenta"};const b=n.toLowerCase().trim(),m=t.find(v=>String(v.code).toLowerCase()===b||v.name.toLowerCase().includes(b));if(!m)return{ok:!1,error:`Tipo "${n}" no encontrado`};const p=/^(c|cr|credit|credito|crédito)$/i.test(i)?"credit":"debit",f=r?Math.max(1,parseInt(r,10)||1):o.length,d=/^(s[ií]|yes|1|true)$/i.test(l),y=!/^(no|0|false|inactiva|inactivo)$/i.test(u);return{ok:!0,payload:{code:o,name:s,account_type_id:m.id,nature:p,level:f,parent_code:c,requires_third_party:d,active:y,maneja_cruce:!1,maneja_retenciones:!1,tipos_retencion:""}}}async function Ai(){var i,r,c;if(!can("canWrite"))return showToast("No tienes permisos para importar cuentas","error");if(ct)return showToast("Importación en curso, espera...","warning");const e=await pb.listAll("account_types",{sort:"code"});jt('<i class="fas fa-list-tree mr-2" style="color:#6D28D9"></i>Importar Plan de Cuentas',`
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
     <button class="btn btn-primary hidden" id="btn-mass-acc-run"><i class="fas fa-bolt mr-1"></i>Ejecutar importación</button>`,!0);let t=[];const a=document.getElementById("mass-acc-drop"),o=document.getElementById("mass-acc-file-input");(i=document.getElementById("btn-mass-acc-dl-tmpl"))==null||i.addEventListener("click",cs),a==null||a.addEventListener("click",()=>o==null?void 0:o.click()),a==null||a.addEventListener("dragover",l=>{l.preventDefault(),a.style.borderColor="#6D28D9",a.style.background="#F5F3FF"}),a==null||a.addEventListener("dragleave",()=>{a.style.borderColor="#D1D5DB",a.style.background="#FAFAFA"}),a==null||a.addEventListener("drop",l=>{var b,m;l.preventDefault(),a.style.borderColor="#D1D5DB",a.style.background="#FAFAFA";const u=(m=(b=l.dataTransfer)==null?void 0:b.files)==null?void 0:m[0];u&&s(u)}),o==null||o.addEventListener("change",()=>{var l;(l=o.files)!=null&&l[0]&&s(o.files[0])}),(r=document.getElementById("btn-mass-acc-clear"))==null||r.addEventListener("click",()=>{var l,u;t=[],(l=document.getElementById("mass-acc-preview"))==null||l.classList.add("hidden"),(u=document.getElementById("btn-mass-acc-run"))==null||u.classList.add("hidden"),o&&(o.value="")});async function s(l){if(l.size>5*1024*1024)return showToast("El archivo supera 5 MB","error");const u=l.name.split(".").pop().toLowerCase();let b=[];try{if(u==="csv")b=pa(await l.text());else if(u==="xlsx"||u==="xls")b=ua(await l.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(m){return showToast("Error al leer el archivo: "+m.message,"error")}if(!b.length)return showToast("El archivo no contiene filas de datos","warning");t=b.map((m,p)=>({idx:p+1,...xi(m,e)})),n(t)}function n(l){const u=document.getElementById("mass-acc-preview-body"),b=document.getElementById("mass-acc-count"),m=document.getElementById("mass-acc-summary"),p=document.getElementById("btn-mass-acc-run"),f=document.getElementById("mass-acc-preview"),d=l.filter(v=>v.ok),y=l.filter(v=>!v.ok);b.textContent=`${l.length} fila(s) — ${d.length} válidas, ${y.length} con error`,u.innerHTML=l.map((v,g)=>{var h;if(v.ok){const _=v.payload,A=((h=e.find(I=>I.id===_.account_type_id))==null?void 0:h.name)??"?";return`<tr>
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
      </tr>`}).join(""),m.innerHTML=y.length?`<span style="color:#EF4444"><i class="fas fa-triangle-exclamation mr-1"></i>${y.length} fila(s) con error serán omitidas.</span>`:'<span style="color:#22C55E"><i class="fas fa-circle-check mr-1"></i>Todas las filas son válidas.</span>',f.classList.remove("hidden"),d.length?p==null||p.classList.remove("hidden"):p==null||p.classList.add("hidden")}(c=document.getElementById("btn-mass-acc-run"))==null||c.addEventListener("click",async()=>{const l=t.filter(y=>y.ok);if(!l.length||ct)return;ct=!0;const u=document.getElementById("btn-mass-acc-run");u&&(u.disabled=!0,u.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...');let b={};try{(await pb.listAll("accounts",{})).forEach(v=>{b[v.code]=v.id})}catch(y){showToast("Error al cargar cuentas: "+y.message,"error"),ct=!1,u&&(u.disabled=!1,u.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar importación');return}let m=0,p=0,f=0;for(const y of l)try{if(b[y.payload.code])await pb.update("accounts",b[y.payload.code],y.payload),p++;else{const v=await pb.create("accounts",y.payload);b[y.payload.code]=v.id,m++}}catch{f++}await API.logAudit("IMPORT","Cuenta","bulk",`${m} creadas, ${p} actualizadas, ${f} errores`),Vt(),closeModal();let d=`Importación completada: ${m} creadas, ${p} actualizadas.`;f&&(d+=` ${f} con error.`),showToast(d,f?"warning":"success",5e3),ct=!1})}function ls(){const e=["codigo","nombre","tipo","torre","apartamento","coef_participacion","cuota_admin","area_m2","doc_propietario","tipo_doc_propietario","activo","notas"].join(","),t=["101,Apartamento 101,APARTAMENTO,Torre 1,101,2.1500,0,68.50,900123456,CC,Si,Unidad principal","P-12,Parqueadero 12,PARQUEADERO,Torre 1,P-12,0.3200,0,12.00,900123456,CC,Si,Parqueadero cubierto","D-03,Deposito 03,DEPOSITO,Torre 1,D-03,0.1500,0,5.20,900123456,CC,Si,"].join(`
`),a=new Blob([e+`
`+t],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download="plantilla_unidades_copropiedades.csv",s.click(),URL.revokeObjectURL(o)}function $i(e,t,a){var h,_;const o=ve(e,["codigo","code","unidad","unit_code"]),s=ve(e,["nombre","name","descripcion"]),n=ve(e,["tipo","unit_type","tipo_unidad"])||"APARTAMENTO",i=ve(e,["torre","tower"]),r=ve(e,["apartamento","apto","apartment"]),c=Pt(ve(e,["coef_participacion","coef","coeficiente"])),l=Pt(ve(e,["cuota_admin","admin_fee","cuota_administracion"])),u=Pt(ve(e,["area_m2","area"])),b=ve(e,["doc_propietario","owner_doc","documento_propietario"]),m=ve(e,["tipo_doc_propietario","owner_doc_type","doc_type_propietario"]).toUpperCase(),p=ve(e,["activo","active","estado"]),f=ve(e,["notas","nota","notes"]);if(!o)return{ok:!1,error:"Falta el código de la unidad"};if(!s)return{ok:!1,error:`Falta el nombre para la unidad ${o}`};const d=new Set(["APARTAMENTO","PARQUEADERO","DEPOSITO","LOCAL","CASA","OFICINA","OTRO"]),y=String(n).toUpperCase();if(!d.has(y))return{ok:!1,error:`Tipo inválido en ${o}: ${n}`};if(c<0||c>100)return{ok:!1,error:`Coeficiente fuera de rango (0-100) en ${o}`};if(l<0)return{ok:!1,error:`Cuota administración negativa en ${o}`};if(u<0)return{ok:!1,error:`Área negativa en ${o}`};let v=null;if(b){const A=Ft(b);if(m&&(v=((h=a.get(`${m}|${A}`))==null?void 0:h.id)||null),v||(v=((_=t.get(A))==null?void 0:_.id)||null),!v)return{ok:!1,error:`No existe tercero propietario con documento ${b}`}}const g=!/^(no|0|false|inactiva|inactivo)$/i.test(p);return{ok:!0,payload:{code:o,name:s,unit_type:y,tower:i,apartment:r,coef_participacion:c,admin_fee:l,area_m2:u,owner_id:v,notes:f,active:g}}}async function wi(){var u,b,m;if(!can("canWrite"))return showToast("No tienes permisos para importar unidades","error");if(Tt)return showToast("Importación en curso, espera...","warning");jt('<i class="fas fa-building-user mr-2" style="color:#0E7490"></i>Importar Unidades Copropiedades',`
    <div class="mb-4">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx)</strong> con unidades habitacionales.
        Si el código ya existe se <strong>actualiza</strong>; si no existe se <strong>crea</strong>.
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#F0FDFA;border:1px solid #99F6E4">
        <p class="text-xs font-semibold mb-1" style="color:#0F766E;text-transform:uppercase;letter-spacing:.05em">Columnas</p>
        <div class="flex flex-wrap gap-2">
          ${["codigo","nombre","tipo"].map(p=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#CCFBF1;color:#0F766E">${p}</code>`).join("")}
          ${["torre","apartamento","coef_participacion","cuota_admin","area_m2","doc_propietario","tipo_doc_propietario","activo","notas"].map(p=>`<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${p} <span style="font-size:.65rem">(opcional)</span></code>`).join("")}
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
     <button class="btn btn-primary hidden" id="btn-mass-ph-units-run"><i class="fas fa-bolt mr-1"></i>Ejecutar importación</button>`,!0);let e=[];const[t,a]=await Promise.all([API.getTerceros({}),pb.listAll("ph_properties",{sort:"code"})]),o=new Map,s=new Map;t.forEach(p=>{const f=Ft(p.doc_number);if(!f)return;o.has(f)||o.set(f,p);const d=`${String(p.doc_type||"").toUpperCase()}|${f}`;s.has(d)||s.set(d,p)});const n=new Map(a.map(p=>[String(p.code||"").trim().toUpperCase(),p])),i=document.getElementById("mass-ph-units-drop"),r=document.getElementById("mass-ph-units-file-input");(u=document.getElementById("btn-mass-ph-units-dl-tmpl"))==null||u.addEventListener("click",ls),i==null||i.addEventListener("click",()=>r==null?void 0:r.click()),i==null||i.addEventListener("dragover",p=>{p.preventDefault(),i.style.borderColor="#0E7490",i.style.background="#ECFEFF"}),i==null||i.addEventListener("dragleave",()=>{i.style.borderColor="#D1D5DB",i.style.background="#FAFAFA"}),i==null||i.addEventListener("drop",p=>{var d,y;p.preventDefault(),i.style.borderColor="#D1D5DB",i.style.background="#FAFAFA";const f=(y=(d=p.dataTransfer)==null?void 0:d.files)==null?void 0:y[0];f&&c(f)}),r==null||r.addEventListener("change",()=>{var f;const p=(f=r.files)==null?void 0:f[0];p&&c(p)}),(b=document.getElementById("btn-mass-ph-units-clear"))==null||b.addEventListener("click",()=>{var p,f;e=[],(p=document.getElementById("mass-ph-units-preview"))==null||p.classList.add("hidden"),(f=document.getElementById("btn-mass-ph-units-run"))==null||f.classList.add("hidden"),r&&(r.value="")});async function c(p){if(p.size>5*1024*1024)return showToast("El archivo supera 5 MB","error");const f=p.name.split(".").pop().toLowerCase();let d=[];try{if(f==="csv")d=pa(await p.text());else if(f==="xlsx"||f==="xls")d=ua(await p.arrayBuffer());else return showToast("Formato no soportado. Usa CSV, XLSX o XLS.","error")}catch(y){return showToast("Error al leer el archivo: "+y.message,"error")}if(!d.length)return showToast("El archivo no contiene filas de datos","warning");e=d.map((y,v)=>{var A;const g=$i(y,o,s);if(!g.ok)return{idx:v+1,...g};const h=String(g.payload.code||"").trim().toUpperCase(),_=n.get(h);return{idx:v+1,ok:!0,mode:_?"update":"create",existingId:(_==null?void 0:_.id)||null,ownerName:g.payload.owner_id&&((A=t.find(I=>I.id===g.payload.owner_id))==null?void 0:A.name)||"—",payload:g.payload}}),l(e)}function l(p){const f=document.getElementById("mass-ph-units-preview-body"),d=document.getElementById("mass-ph-units-count"),y=document.getElementById("mass-ph-units-summary"),v=document.getElementById("btn-mass-ph-units-run"),g=document.getElementById("mass-ph-units-preview"),h=p.filter(A=>A.ok),_=p.filter(A=>!A.ok);d.textContent=`${p.length} fila(s) — ${h.length} válidas, ${_.length} con error`,f.innerHTML=p.map(A=>{if(!A.ok)return`<tr style="background:#FFF7F7">
          <td>${A.idx}</td>
          <td colspan="6" class="text-xs" style="color:#EF4444">${esc(A.error||"Fila inválida")}</td>
          <td><span class="badge badge-red">Error</span></td>
        </tr>`;const I=A.payload,F=A.mode==="update"?'<span class="badge badge-orange">Actualizar</span>':'<span class="badge badge-blue">Crear</span>';return`<tr>
        <td>${A.idx}</td>
        <td><span class="font-semibold" style="color:#0E7490">${esc(I.code)}</span></td>
        <td>${esc(I.name)}</td>
        <td>${esc(I.unit_type||"—")}</td>
        <td>${esc(I.apartment||"—")}</td>
        <td>${esc(A.ownerName||"—")}</td>
        <td>${F}</td>
        <td><span class="badge badge-green">OK</span></td>
      </tr>`}).join(""),y.innerHTML=_.length?`<span style="color:#EF4444"><i class="fas fa-triangle-exclamation mr-1"></i>${_.length} fila(s) con error serán omitidas.</span>`:'<span style="color:#22C55E"><i class="fas fa-circle-check mr-1"></i>Todas las filas son válidas.</span>',g.classList.remove("hidden"),h.length?v==null||v.classList.remove("hidden"):v==null||v.classList.add("hidden")}(m=document.getElementById("btn-mass-ph-units-run"))==null||m.addEventListener("click",async()=>{const p=e.filter(h=>h.ok);if(!p.length||Tt)return;Tt=!0;const f=document.getElementById("btn-mass-ph-units-run");f&&(f.disabled=!0,f.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>Importando...');let d=0,y=0,v=0;const g=[];try{for(const h of p)try{if(h.mode==="update"&&h.existingId)await pb.update("ph_properties",h.existingId,h.payload),y++;else{const _=await pb.create("ph_properties",h.payload);h.existingId=_.id,d++}}catch(_){v++,g.push({code:h.payload.code,error:_.message||"Error desconocido"})}await API.logAudit("IMPORT","PhProperty","bulk",`Carga masiva unidades PH: ${d} creadas, ${y} actualizadas, ${v} con error`),g.length&&console.warn("[CargaMasivaPhUnits] Errores:",g),closeModal(),showToast(`Carga completada: ${d} creadas, ${y} actualizadas${v?`, ${v} con error`:""}`,v?"warning":"success",5500)}finally{Tt=!1,f&&(f.disabled=!1,f.innerHTML='<i class="fas fa-bolt mr-1"></i>Ejecutar importación')}})}function jt(e,t,a=[],o=!1){const s=$("#modal-title"),n=$("#modal-body"),i=$("#modal-footer"),r=$("#modal-box"),c=$("#modal-overlay");s&&(s.innerHTML=e),n&&(n.innerHTML=t),i&&(i.innerHTML="",typeof a=="string"?i.innerHTML=a:(Array.isArray(a)?a:a&&typeof a=="object"?[a]:[]).forEach(({label:u,class:b,action:m})=>{if(typeof m!="function")return;const p=document.createElement("button");p.className=`btn ${b||"btn-outline"}`,p.textContent=u||"Aceptar",p.addEventListener("click",m),i.appendChild(p)})),r==null||r.classList.toggle("wide",!!o),c==null||c.classList.add("show")}window._loadLastBackupInfo=rs;window.renderUtilidades=Jc;window._executeMassTxImport=bi;window._handleCreateBackup=ci;window._massTxNormHeader=Ga;window._massTxParseCsv=pa;window._massTxParseExcel=ua;window._openMassTxImportModal=ui;window.BACKUP_VERSION=is;window._massTxImportInProgress=Qt;window._massTxDocKey=Ft;window._openMassAccImportModal=Ai;window._massTpBuildDraft=hi;window._massPhUnitsImportInProgress=Tt;window._downloadMassTpTemplate=gi;window._downloadMassTxTemplate=pi;window._massTpImportInProgress=Ct;window.BACKUP_COLLECTIONS=ri;window._massTxNum=Pt;window._downloadMassPhUnitsTemplate=ls;window._massTxPick=ve;window._openMassTpImportModal=vi;window.openModal=jt;window._massPhUnitsNormalizeRow=$i;window._massAccImportInProgress=ct;window._handleRestoreFileSelected=li;window._restoreInProgress=Kt;window._massAccNormalizeRow=xi;window._openMassPhUnitsImportModal=wi;window._downloadMassAccTemplate=cs;window._doRestore=di;window._backupInProgress=Jt;window._massTpRenderPreview=yi;window._massTxRenderPreview=fi;window._massTxBuildDraft=mi;window._loadSysInfo=Vt;window._executeMassTpImport=_i;const za=[{value:"BIEN",label:"Bien (producto físico)"},{value:"SERVICIO",label:"Servicio"}],Ei=["UND","KG","GR","LT","ML","MT","CM","M2","M3","CJ","BL","GL","PAR","HORA","DIA","MES","SVC"],qa=[{value:0,label:"0% — Excluido / Exento"},{value:5,label:"5% — Tarifa diferencial"},{value:19,label:"19% — Tarifa general"}];function dt(e){const t=String(e??"").trim();if(!t)return null;const a=Number(t);return Number.isFinite(a)?a:null}function bo(e){const t=[];return e.peso!==null&&t.push(`Peso: ${fmtN(e.peso)}`),e.cajas_en_pallet!==null&&t.push(`Cajas/Pallet: ${fmtN(e.cajas_en_pallet)}`),e.und_empaque!==null&&t.push(`UndEmpaque: ${fmtN(e.und_empaque)}`),e.peso_x_und_empaque!==null&&t.push(`Peso x UndEmpaque: ${fmtN(e.peso_x_und_empaque)}`),t.length?t.join(" | "):"Sin condiciones especiales registradas"}function Ci(e,t){var i,r,c;const a="special-conditions-overlay",o=document.getElementById(a);o&&o.remove();const s=document.createElement("div");s.id=a,s.className="modal-overlay show",s.style.zIndex="200",s.innerHTML=`
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
    </div>`;const n=()=>s.remove();document.body.appendChild(s),(i=s.querySelector("#sc-close-btn"))==null||i.addEventListener("click",n),(r=s.querySelector("#sc-cancel-btn"))==null||r.addEventListener("click",n),s.addEventListener("click",l=>{l.target===s&&n()}),(c=s.querySelector("#sc-apply-btn"))==null||c.addEventListener("click",()=>{t({peso:dt(getInputVal("sc-peso")),cajas_en_pallet:dt(getInputVal("sc-cajas-en-pallet")),und_empaque:dt(getInputVal("sc-und-empaque")),peso_x_und_empaque:dt(getInputVal("sc-peso-x-und-empaque"))}),n()})}async function ds(){try{const e=await API.getSetting("product_catalog_v1");if(e){const t=JSON.parse(e);return{categories:Array.isArray(t.categories)?t.categories:[],lines:Array.isArray(t.lines)?t.lines:[]}}}catch{}return{categories:[],lines:[]}}async function Ti(e){await API.setSetting("product_catalog_v1",JSON.stringify(e))}function ps(e,t){var m,p,f,d,y,v,g;const a="catalog-manager-overlay",o=document.getElementById(a);o&&o.remove();const s={categories:[...e.categories||[]],lines:[...e.lines||[]]};function n(h,_){return h.length?h.map((A,I)=>`
      <div class="flex items-center justify-between gap-2 py-1 border-b" style="border-color:#F5F5F5">
        <span class="text-sm">${esc(A)}</span>
        <button type="button" class="btn btn-danger btn-sm cm-del" data-idx="${I}" data-ltype="${_}"><i class="fas fa-times"></i></button>
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
    </div>`;const r=()=>i.remove();document.body.appendChild(i);function c(){i.querySelector("#cm-cat-list").innerHTML=n(s.categories,"categories"),i.querySelector("#cm-line-list").innerHTML=n(s.lines,"lines"),l()}function l(){i.querySelectorAll(".cm-del").forEach(h=>{h.addEventListener("click",()=>{s[h.dataset.ltype].splice(Number(h.dataset.idx),1),c()})})}l(),(m=i.querySelector("#cm-close-btn"))==null||m.addEventListener("click",r),(p=i.querySelector("#cm-cancel-btn"))==null||p.addEventListener("click",r),i.addEventListener("click",h=>{h.target===i&&r()});const u=()=>{const h=i.querySelector("#cm-new-cat"),_=((h==null?void 0:h.value)||"").trim();if(_){if(s.categories.includes(_)){showToast("Ya existe esa categoría","warning");return}s.categories.push(_),h.value="",c()}};(f=i.querySelector("#cm-add-cat-btn"))==null||f.addEventListener("click",u),(d=i.querySelector("#cm-new-cat"))==null||d.addEventListener("keydown",h=>{h.key==="Enter"&&(h.preventDefault(),u())});const b=()=>{const h=i.querySelector("#cm-new-line"),_=((h==null?void 0:h.value)||"").trim();if(_){if(s.lines.includes(_)){showToast("Ya existe esa línea","warning");return}s.lines.push(_),h.value="",c()}};(y=i.querySelector("#cm-add-line-btn"))==null||y.addEventListener("click",b),(v=i.querySelector("#cm-new-line"))==null||v.addEventListener("keydown",h=>{h.key==="Enter"&&(h.preventDefault(),b())}),(g=i.querySelector("#cm-save-btn"))==null||g.addEventListener("click",async()=>{const h=i.querySelector("#cm-save-btn");h&&(h.disabled=!0,h.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{await Ti(s),showToast("Catálogo guardado","success"),t({categories:[...s.categories],lines:[...s.lines]}),r()}catch(_){showToast(_.message||"No se pudo guardar","error")}finally{h&&(h.disabled=!1,h.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar')}})}async function ma(e){var t,a,o,s,n,i,r,c;e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando productos...</div>';try{const[l,u,b]=await Promise.all([API.getProducts({activeOnly:!1}),API.getAccounts(!1),ds()]),m=l.filter(g=>g.active).length,p=l.filter(g=>g.type==="BIEN").length,f=l.filter(g=>g.type==="SERVICIO").length,d=[...new Set(l.map(g=>g.categoria).filter(Boolean))].sort(),y=[...new Set(l.map(g=>g.linea).filter(Boolean))].sort();e.innerHTML=`
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
        ${Ht("Total catálogo",l.length,"fas fa-box-open","#1A4B8C","#EEF4FF")}
        ${Ht("Activos",m,"fas fa-circle-check","#059669","#ECFDF5")}
        ${Ht("Bienes",p,"fas fa-boxes-stacked","#C46516","#FFF8F0")}
        ${Ht("Servicios",f,"fas fa-handshake","#7C3AED","#F5F3FF")}
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap gap-3">
          <input id="prod-q" class="form-input flex-1 min-w-48" placeholder="Buscar por código o nombre...">
          <select id="prod-type" class="form-input" style="max-width:200px">
            <option value="">Todos los tipos</option>
            ${za.map(g=>`<option value="${g.value}">${g.label}</option>`).join("")}
          </select>
          <select id="prod-iva" class="form-input" style="max-width:180px">
            <option value="">Todas las tarifas IVA</option>
            ${qa.map(g=>`<option value="${g.value}">${g.value}%</option>`).join("")}
          </select>
          <select id="prod-categoria" class="form-input" style="max-width:180px">
            <option value="">Todas las categorías</option>
            ${d.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join("")}
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
              ${l.length?Ii(l):Si(10)}
            </tbody>
          </table>
        </div>
      </div>`;const v=()=>Ni();(t=$("#prod-q"))==null||t.addEventListener("input",debounce(v,150)),(a=$("#prod-type"))==null||a.addEventListener("change",v),(o=$("#prod-categoria"))==null||o.addEventListener("change",v),(s=$("#prod-linea"))==null||s.addEventListener("change",v),(n=$("#prod-iva"))==null||n.addEventListener("change",v),(i=$("#prod-status"))==null||i.addEventListener("change",v),(r=$("#btn-new-product"))==null||r.addEventListener("click",()=>us(null,u,b)),(c=$("#btn-catalog-manager"))==null||c.addEventListener("click",()=>{ps(b,g=>{Object.assign(b,g),ma($("#page-content"))})})}catch(l){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(l.message)}</div>`}}function Ht(e,t,a,o,s){return`<div class="rounded-2xl p-4" style="background:${s};border:1px solid ${s}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${a} text-sm" style="color:${o}"></i>
      <span class="text-xs font-semibold" style="color:${o}">${e}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${o}">${fmtN(t)}</p>
  </div>`}function Ii(e){return e.map(t=>{var s;const a=t.type==="BIEN"?'<span class="badge badge-blue">Bien</span>':'<span class="badge" style="background:#F5F3FF;color:#7C3AED">Servicio</span>',o=t.active?'<span class="badge badge-green">Activo</span>':'<span class="badge badge-gray">Inactivo</span>';return(s=t.expand)==null||s.income_account_id,`<tr data-type="${esc(t.type)}" data-iva="${t.iva_rate??""}" data-active="${t.active}" data-categoria="${esc(t.categoria||"")}" data-linea="${esc(t.linea||"")}">
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
    </tr>`}).join("")}function Si(e){return`<tr><td colspan="${e}" class="text-center py-10" style="color:#9CA3AF">
    <i class="fas fa-box-open mr-2"></i>No hay productos registrados.
  </td></tr>`}function Ni(){const e=(getInputVal("prod-q")||"").toLowerCase(),t=getSelectVal("prod-type"),a=getSelectVal("prod-categoria"),o=getSelectVal("prod-linea"),s=getSelectVal("prod-iva"),n=getSelectVal("prod-status");$$("#prod-table tbody tr[data-type]").forEach(i=>{const r=i.textContent.toLowerCase(),c=!e||r.includes(e),l=!t||i.dataset.type===t,u=!a||i.dataset.categoria===a,b=!o||i.dataset.linea===o,m=!s||i.dataset.iva===s,p=!n||i.dataset.active===n;i.style.display=c&&l&&u&&b&&m&&p?"":"none"})}async function Kc(e){var t,a,o,s,n;try{const i=await pb.get("products",e,{expand:"income_account_id,cost_account_id,inventory_account_id"}),r=((t=za.find(m=>m.value===i.type))==null?void 0:t.label)||i.type,c=((a=qa.find(m=>m.value===i.iva_rate))==null?void 0:a.label)||`${i.iva_rate}%`,l=(o=i.expand)==null?void 0:o.income_account_id,u=(s=i.expand)==null?void 0:s.cost_account_id,b=(n=i.expand)==null?void 0:n.inventory_account_id;openModal(`Producto — ${esc(i.code)}`,`<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div><span class="form-label">Código</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(i.code)}</p></div>
        <div class="md:col-span-2"><span class="form-label">Nombre</span><p class="font-semibold">${esc(i.name)}</p></div>
        <div><span class="form-label">Tipo</span><p>${esc(r)}</p></div>
        <div><span class="form-label">Unidad de medida</span><p class="font-mono">${esc(i.unit||"—")}</p></div>
        <div><span class="form-label">Presentacion</span><p>${esc(i.presentacion||"—")}</p></div>
        <div><span class="form-label">Categoria</span><p>${esc(i.categoria||"—")}</p></div>
        <div><span class="form-label">Linea</span><p>${esc(i.linea||"—")}</p></div>
        <div><span class="form-label">Tarifa IVA</span><p>${esc(c)}</p></div>
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
              <p class="font-mono text-xs">${u?esc(`${u.code} — ${u.name}`):"—"}</p></div>
            <div><p class="text-xs text-gray-500 mb-1">Inventario</p>
              <p class="font-mono text-xs">${b?esc(`${b.code} — ${b.name}`):"—"}</p></div>
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
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!1)}catch(i){showToast(i.message,"error")}}async function us(e=null,t=null,a={}){var n,i,r;t||(t=await API.getAccounts(!1).catch(()=>[]));const o=(c="")=>`<option value="">— Sin asignar —</option>${t.filter(u=>u.active&&Number(u.level)>=3).sort((u,b)=>u.code.localeCompare(b.code)).map(u=>`<option value="${esc(u.id)}" ${u.id===c?"selected":""}>${esc(u.code)} — ${esc(u.name)}</option>`).join("")}`,s={peso:(e==null?void 0:e.peso)??null,cajas_en_pallet:(e==null?void 0:e.cajas_en_pallet)??null,und_empaque:(e==null?void 0:e.und_empaque)??null,peso_x_und_empaque:(e==null?void 0:e.peso_x_und_empaque)??null};openModal(e?`Editar — ${esc(e.code)}`:"Nuevo Producto / Servicio",`<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          ${za.map(c=>`<option value="${c.value}" ${(e==null?void 0:e.type)===c.value?"selected":""}>${c.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Unidad de medida <span style="color:#EF4444">*</span></label>
        <select id="pf-unit" class="form-input">
          ${Ei.map(c=>`<option value="${c}" ${(e==null?void 0:e.unit)===c?"selected":""}>${c}</option>`).join("")}
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
        <datalist id="dl-categorias">${(a.categories||[]).map(c=>`<option value="${esc(c)}">`).join("")}</datalist>
      </div>
      <div class="form-group">
        <label class="form-label">Línea</label>
        <input id="pf-linea" class="form-input" list="dl-lineas" value="${esc((e==null?void 0:e.linea)||"")}" placeholder="Hogar, Industrial, Premium...">
        <datalist id="dl-lineas">${(a.lines||[]).map(c=>`<option value="${esc(c)}">`).join("")}</datalist>
      </div>
      <div class="form-group flex items-end">
        ${can("canWrite")?'<button type="button" class="btn btn-outline btn-sm w-full" id="btn-catalog-form"><i class="fas fa-tags"></i> Gestionar Cat./Líneas</button>':"<span></span>"}
      </div>
      <div class="form-group">
        <label class="form-label">Tarifa IVA <span style="color:#EF4444">*</span></label>
        <select id="pf-iva" class="form-input">
          ${qa.map(c=>`<option value="${c.value}" ${Number(e==null?void 0:e.iva_rate)===c.value?"selected":""}>${c.label}</option>`).join("")}
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
          <span id="pf-special-summary" class="text-xs" style="color:#6B7280">${esc(bo(s))}</span>
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
     <button class="btn btn-primary" id="btn-save-product"><i class="fas fa-floppy-disk"></i> Guardar</button>`,!0),(n=$("#btn-save-product"))==null||n.addEventListener("click",async()=>{var l;const c=$("#btn-save-product");c&&(c.disabled=!0,c.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const u=getInputVal("pf-code").trim().toUpperCase(),b=getInputVal("pf-name").trim();if(!u)return showToast("El código es obligatorio","warning");if(!b)return showToast("El nombre es obligatorio","warning");if(!(e!=null&&e.id)){const p=pb.escapeFilterValue(u);if((await pb.list("products",{filter:`code="${p}"`,perPage:1})).items.length)return showToast(`Ya existe un producto con el código ${u}`,"warning")}const m={code:u,name:b,description:getInputVal("pf-desc").trim(),type:getSelectVal("pf-type"),unit:getSelectVal("pf-unit"),presentacion:getInputVal("pf-presentacion").trim(),categoria:getInputVal("pf-categoria").trim(),linea:getInputVal("pf-linea").trim(),iva_rate:Number(getSelectVal("pf-iva")||0),base_price:parseFloat(getInputVal("pf-base-price")||"0")||0,precio_venta_2:dt(getInputVal("pf-sale-price-2")),precio_venta_3:dt(getInputVal("pf-sale-price-3")),cost_price:parseFloat(getInputVal("pf-cost-price")||"0")||0,active:getSelectVal("pf-active")==="true",unspsc_code:getInputVal("pf-unspsc").trim(),ean_code:getInputVal("pf-ean").trim(),peso:s.peso,cajas_en_pallet:s.cajas_en_pallet,und_empaque:s.und_empaque,peso_x_und_empaque:s.peso_x_und_empaque,income_account_id:getSelectVal("pf-income-acct")||null,cost_account_id:getSelectVal("pf-cost-acct")||null,inventory_account_id:getSelectVal("pf-inv-acct")||null};if(e!=null&&e.id)await pb.update("products",e.id,m),await API.logAudit("UPDATE","Producto",e.id,`${m.code} — ${m.name}`),showToast("Producto actualizado","success");else{const p=await pb.create("products",m);await API.logAudit("CREATE","Producto",p.id,`${m.code} — ${m.name}`),showToast("Producto creado","success")}closeModal(),ma($("#page-content"))}catch(u){const b=(l=u==null?void 0:u.data)!=null&&l.data?Object.values(u.data.data).map(m=>m==null?void 0:m.message).filter(Boolean).join(" | "):"";showToast(b||u.message||"No se pudo guardar","error")}finally{c&&(c.disabled=!1,c.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar')}}),(i=$("#btn-special-conditions"))==null||i.addEventListener("click",()=>{Ci(s,c=>{Object.assign(s,c);const l=$("#pf-special-summary");l&&(l.textContent=bo(s))})}),(r=$("#btn-catalog-form"))==null||r.addEventListener("click",()=>{ps(a,c=>{Object.assign(a,c);const l=document.getElementById("dl-categorias"),u=document.getElementById("dl-lineas");l&&(l.innerHTML=a.categories.map(b=>`<option value="${esc(b)}">`).join("")),u&&(u.innerHTML=a.lines.map(b=>`<option value="${esc(b)}">`).join(""))})})}async function Qc(e){try{const[t,a,o]=await Promise.all([pb.get("products",e),API.getAccounts(!1),ds()]);us(t,a,o)}catch(t){showToast(t.message,"error")}}async function Zc(e,t){try{const a=await pb.update("products",e,{active:t});await API.logAudit("STATUS","Producto",e,`${a.code} → ${t?"Activo":"Inactivo"}`),showToast(`Producto ${t?"activado":"desactivado"}`,"success"),ma($("#page-content"))}catch(a){showToast(a.message,"error")}}function Xc(e,t){confirmDialog("Eliminar producto",`¿Confirmas eliminar <strong>${esc(t)}</strong>?<br><small style="color:#6B7280">Esta acción no se puede deshacer. Si el producto está referenciado en documentos, considera desactivarlo en lugar de eliminarlo.</small>`,async()=>{try{await pb.delete("products",e),await API.logAudit("DELETE","Producto",e,`Eliminado: ${t}`),showToast("Producto eliminado","success"),ma($("#page-content"))}catch(a){showToast(a.message,"error")}})}window.openProductForm=us;window.PRODUCT_TYPES=za;window.toNullableNumber=dt;window.toggleProductStatus=Zc;window.viewProductDetail=Kc;window.saveProductCatalog=Ti;window.IVA_RATES=qa;window.emptyRow=Si;window.deleteProduct=Xc;window.openCatalogManagerModal=ps;window.renderProductos=ma;window.PRODUCT_UNITS=Ei;window.editProduct=Qc;window.filterProductTable=Ni;window.renderProductRows=Ii;window.openSpecialConditionsModal=Ci;window.kpiCard=Ht;window.specialConditionsSummary=bo;window.loadProductCatalog=ds;const fa=[{value:"ENTRADA",label:"Entrada",icon:"fa-arrow-down",color:"#059669"},{value:"SALIDA",label:"Salida",icon:"fa-arrow-up",color:"#DC2626"},{value:"TRASLADO",label:"Traslado",icon:"fa-right-left",color:"#1A4B8C"},{value:"AJUSTE_POSITIVO",label:"Ajuste +",icon:"fa-plus-circle",color:"#059669"},{value:"AJUSTE_NEGATIVO",label:"Ajuste −",icon:"fa-minus-circle",color:"#C46516"}],ms={draft:{label:"Borrador",badge:"badge-gray"},applied:{label:"Aplicado",badge:"badge-green"},voided:{label:"Anulado",badge:"badge-orange"}};async function fs(e){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando inventario...</div>';try{const[t,a]=await Promise.all([API.getInventoryStock(),API.getWarehouses(!1)]);Li(e,"stock",{stock:t,warehouses:a})}catch(t){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(t.message)}</div>`}}function Li(e,t,a={}){const o=[{id:"stock",label:"Stock actual",icon:"fa-boxes-stacked"},{id:"movimientos",label:"Movimientos",icon:"fa-arrows-rotate"},{id:"bodegas",label:"Bodegas",icon:"fa-warehouse"}];e.innerHTML=`
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
    <div id="inv-tab-content"></div>`;const s=e.querySelector("#inv-tab-content");function n(i){e.querySelectorAll(".tab-btn").forEach(r=>r.classList.toggle("active",r.dataset.tab===i)),i==="stock"&&Fi(s,a),i==="movimientos"&&bs(s,a),i==="bodegas"&&Zt(s,a)}e.querySelectorAll(".tab-btn").forEach(i=>i.addEventListener("click",()=>n(i.dataset.tab))),n(t)}async function Fi(e,t={}){var a,o,s;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando stock...</div>';try{const[n,i]=await Promise.all([API.getInventoryStock(),API.getWarehouses(!1)]);t.stock=n,t.warehouses=i;const r=new Set(n.map(m=>m.product_id)).size,c=n.reduce((m,p)=>m+(p.qty_on_hand||0),0),l=n.filter(m=>(m.qty_on_hand||0)<=0).length,u=n.reduce((m,p)=>m+(p.qty_on_hand||0)*(p.avg_cost||0),0);e.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        ${Gt("SKUs en inventario",r,"fas fa-box","#1A4B8C","#EEF4FF")}
        ${Gt("Unidades totales",fmtN(c),"fas fa-cubes","#059669","#ECFDF5")}
        ${Gt("Sin stock",l,"fas fa-triangle-exclamation","#C46516","#FFF8F0")}
        ${Gt("Valor estimado",fmt(u),"fas fa-coins","#7C3AED","#F5F3FF")}
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
              ${n.length?Pi(n):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-boxes-stacked mr-2"></i>No hay stock registrado.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;const b=()=>Ri();(a=$("#st-q"))==null||a.addEventListener("input",debounce(b,150)),(o=$("#st-wh"))==null||o.addEventListener("change",b),(s=$("#st-status"))==null||s.addEventListener("change",b)}catch(n){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(n.message)}</div>`}}function Pi(e){return e.map(t=>{var c,l;const a=(c=t.expand)==null?void 0:c.product_id,o=(l=t.expand)==null?void 0:l.warehouse_id,s=t.qty_on_hand??0,n=t.avg_cost??0,i=s*n,r=s<=0;return`<tr data-whid="${esc(t.warehouse_id)}" data-qty="${s}">
      <td class="font-medium">${a?esc(a.name):'<span style="color:#9CA3AF">—</span>'}</td>
      <td><span class="font-mono text-xs" style="color:#1A4B8C">${a?esc(a.code):"—"}</span></td>
      <td>${o?esc(o.name):"—"}</td>
      <td class="text-right font-semibold ${r?"text-red-500":""}">${fmtN(s)}</td>
      <td class="text-right">${n?fmt(n):"—"}</td>
      <td class="text-right">${i?fmt(i):"—"}</td>
      <td class="text-sm" style="color:#6B7280">${esc(t.last_mov_date||"—")}</td>
    </tr>`}).join("")}function Ri(){const e=(getInputVal("st-q")||"").toLowerCase(),t=getSelectVal("st-wh"),a=getSelectVal("st-status");$$("#stock-table tbody tr[data-qty]").forEach(o=>{const s=o.textContent.toLowerCase(),n=parseFloat(o.dataset.qty??"0"),i=!e||s.includes(e),r=!t||o.dataset.whid===t,c=!a||(a==="ok"?n>0:n<=0);o.style.display=i&&r&&c?"":"none"})}async function bs(e,t={}){var a,o,s,n;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando movimientos...</div>';try{const[i,r,c]=await Promise.all([API.getInventoryMovements({perPage:100}),t.warehouses?Promise.resolve(t.warehouses):API.getWarehouses(!1),API.getProducts({activeOnly:!0})]);t.warehouses=r,t.products=c;const l=i.items||[];e.innerHTML=`
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div class="flex flex-wrap gap-3">
          <input id="mov-q" class="form-input" style="min-width:200px" placeholder="Buscar número, tipo...">
          <select id="mov-type-f" class="form-input" style="max-width:180px">
            <option value="">Todos los tipos</option>
            ${fa.map(b=>`<option value="${b.value}">${b.label}</option>`).join("")}
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
              ${l.length?Di(l):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-arrows-rotate mr-2"></i>No hay movimientos registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;const u=()=>{const b=(getInputVal("mov-q")||"").toLowerCase(),m=getSelectVal("mov-type-f"),p=getSelectVal("mov-status-f");$$("#mov-table tbody tr[data-movid]").forEach(f=>{f.style.display=(!b||f.textContent.toLowerCase().includes(b))&&(!m||f.dataset.movtype===m)&&(!p||f.dataset.movstatus===p)?"":"none"})};(a=$("#mov-q"))==null||a.addEventListener("input",debounce(u,150)),(o=$("#mov-type-f"))==null||o.addEventListener("change",u),(s=$("#mov-status-f"))==null||s.addEventListener("change",u),(n=$("#btn-new-mov"))==null||n.addEventListener("click",()=>ki(null,t,()=>bs(e,t)))}catch(i){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(i.message)}</div>`}}function Di(e){return e.map(t=>{var i,r;const a=fa.find(c=>c.value===t.mov_type),o=ms[t.status]||{label:t.status,badge:"badge-gray"},s=(i=t.expand)==null?void 0:i.warehouse_id,n=(r=t.expand)==null?void 0:r.dest_warehouse_id;return`<tr data-movid="${esc(t.id)}" data-movtype="${esc(t.mov_type)}" data-movstatus="${esc(t.status)}">
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
    </tr>`}).join("")}async function el(e){var t,a,o;try{const[s,n]=await Promise.all([pb.get("inventory_movements",e,{expand:"warehouse_id,dest_warehouse_id,third_party_id"}),API.getInventoryMovementLines(e)]),i=fa.find(b=>b.value===s.mov_type),r=ms[s.status]||{label:s.status,badge:"badge-gray"},c=(t=s.expand)==null?void 0:t.warehouse_id,l=(a=s.expand)==null?void 0:a.dest_warehouse_id,u=(o=s.expand)==null?void 0:o.third_party_id;openModal(`Movimiento — ${esc(s.number)}`,`<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
        <div><span class="form-label">Número</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(s.number)}</p></div>
        <div><span class="form-label">Tipo</span><p style="color:${i==null?void 0:i.color}">${esc((i==null?void 0:i.label)||s.mov_type)}</p></div>
        <div><span class="form-label">Fecha</span><p>${esc(s.date)}</p></div>
        <div><span class="form-label">Bodega origen</span><p>${c?esc(c.name):"—"}</p></div>
        <div><span class="form-label">Bodega destino</span><p>${l?esc(l.name):"—"}</p></div>
        <div><span class="form-label">Estado</span><p><span class="badge ${r.badge}">${r.label}</span></p></div>
        ${u?`<div class="md:col-span-3"><span class="form-label">Tercero</span><p>${esc(u.name)}</p></div>`:""}
        ${s.notes?`<div class="md:col-span-3"><span class="form-label">Notas</span><p>${esc(s.notes)}</p></div>`:""}
      </div>
      <div class="border rounded-xl overflow-hidden" style="border-color:#F0F0F0">
        <table class="data-table">
          <thead><tr><th>Producto</th><th>Código</th><th class="text-right">Cantidad</th><th class="text-right">Costo unit.</th><th class="text-right">Total</th></tr></thead>
          <tbody>
            ${n.map(b=>{var p;const m=(p=b.expand)==null?void 0:p.product_id;return`<tr>
                <td>${m?esc(m.name):"—"}</td>
                <td class="font-mono text-xs">${m?esc(m.code):"—"}</td>
                <td class="text-right font-semibold">${fmtN(b.qty)}</td>
                <td class="text-right">${b.unit_cost?fmt(b.unit_cost):"—"}</td>
                <td class="text-right">${b.unit_cost?fmt(b.qty*b.unit_cost):"—"}</td>
              </tr>`}).join("")}
          </tbody>
        </table>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',!0)}catch(s){showToast(s.message,"error")}}async function tl(e){confirmDialog("Aplicar movimiento","¿Confirmas aplicar este movimiento? Se actualizará el stock de las bodegas y no se podrá deshacer salvo anulación.",async()=>{try{await API.applyInventoryMovement(e),showToast("Movimiento aplicado. Stock actualizado.","success"),fs($("#page-content"))}catch(t){showToast(t.message,"error")}})}function al(e,t){confirmDialog("Anular movimiento",`¿Confirmas anular el movimiento <strong>${esc(t)}</strong>? El stock será revertido.`,async()=>{try{await API.voidInventoryMovement(e),showToast("Movimiento anulado. Stock revertido.","success"),fs($("#page-content"))}catch(a){showToast(a.message,"error")}})}async function ki(e=null,t={},a=null){var c,l,u;const o=t.warehouses||await API.getWarehouses(!0),s=t.products||await API.getProducts({activeOnly:!0});let n=0;function i(b={}){var d;n++;const m=n,p=document.getElementById("mov-lines-body");if(!p)return;const f=document.createElement("tr");if(f.id=`mov-line-${m}`,f.innerHTML=`
      <td>
        <select class="form-input" id="ml-prod-${m}" style="min-width:180px">
          <option value="">— Producto —</option>
          ${s.filter(y=>y.type==="BIEN").map(y=>`<option value="${esc(y.id)}" data-cost="${y.cost_price||0}">${esc(y.code)} — ${esc(y.name)}</option>`).join("")}
        </select>
      </td>
      <td><input id="ml-qty-${m}" type="number" min="0.0001" step="0.0001" class="form-input text-right" style="min-width:90px" placeholder="0" value="${b.qty??""}"></td>
      <td><input id="ml-cost-${m}" type="number" min="0" step="0.01" class="form-input text-right" style="min-width:100px" placeholder="0.00" value="${b.unit_cost??""}"></td>
      <td><input id="ml-notes-${m}" class="form-input" style="min-width:120px" placeholder="Nota" value="${esc(b.notes||"")}"></td>
      <td><button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('mov-line-${m}').remove()"><i class="fas fa-times"></i></button></td>`,p.appendChild(f),(d=document.getElementById(`ml-prod-${m}`))==null||d.addEventListener("change",function(){const y=this.selectedOptions[0],v=document.getElementById(`ml-cost-${m}`);y&&y.dataset.cost&&v&&!v.value&&(v.value=y.dataset.cost)}),b.product_id){const y=document.getElementById(`ml-prod-${m}`);y&&(y.value=b.product_id)}}const r=()=>getSelectVal("mf-type")==="TRASLADO";openModal("Nuevo Movimiento de Inventario",`<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="form-group">
        <label class="form-label">Tipo <span style="color:#EF4444">*</span></label>
        <select id="mf-type" class="form-input">
          ${fa.map(b=>`<option value="${b.value}">${b.label}</option>`).join("")}
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
          ${o.map(b=>`<option value="${esc(b.id)}">${esc(b.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group" id="dest-wh-row" style="display:none">
        <label class="form-label">Bodega destino <span style="color:#EF4444">*</span></label>
        <select id="mf-dest-wh" class="form-input">
          <option value="">— Seleccionar —</option>
          ${o.map(b=>`<option value="${esc(b.id)}">${esc(b.name)}</option>`).join("")}
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
     <button class="btn btn-primary" id="btn-save-mov"><i class="fas fa-floppy-disk"></i> Guardar borrador</button>`,!0),(c=document.getElementById("mf-type"))==null||c.addEventListener("change",()=>{const b=document.getElementById("dest-wh-row");b&&(b.style.display=r()?"":"none")}),(l=document.getElementById("btn-add-line"))==null||l.addEventListener("click",()=>i()),i(),(u=document.getElementById("btn-save-mov"))==null||u.addEventListener("click",async()=>{const b=document.getElementById("btn-save-mov");b&&(b.disabled=!0,b.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const m=getSelectVal("mf-type"),p=getInputVal("mf-date"),f=getSelectVal("mf-wh"),d=getSelectVal("mf-dest-wh"),y=getInputVal("mf-notes");if(!m)return showToast("Selecciona el tipo de movimiento","warning");if(!p)return showToast("La fecha es obligatoria","warning");if(!f)return showToast("Selecciona la bodega origen","warning");if(m==="TRASLADO"&&!d)return showToast("Selecciona la bodega destino","warning");const v=[];let g=1;for(;;){const S=document.getElementById(`ml-prod-${g}`);if(!S){if(g++,g>n+5)break;continue}const x=S.value,T=parseFloat(getInputVal(`ml-qty-${g}`)||"0"),E=parseFloat(getInputVal(`ml-cost-${g}`)||"0"),C=getInputVal(`ml-notes-${g}`)||"";if(x&&T>0&&v.push({product_id:x,qty:T,unit_cost:E||null,notes:C,line_order:v.length+1}),g++,g>n+2)break}if(!v.length)return showToast("Agrega al menos una línea con producto y cantidad","warning");const h=p.replaceAll("-",""),_=String(Date.now()).slice(-4),A=`INV-${h}-${_}`,I={number:A,mov_type:m,date:p,warehouse_id:f,dest_warehouse_id:d||null,notes:y,status:"draft"},F=await pb.create("inventory_movements",I);for(const S of v)await pb.create("inventory_movement_lines",{movement_id:F.id,...S});await API.logAudit("CREATE","InventoryMovement",F.id,`${m} — ${A}`),showToast("Movimiento guardado como borrador. Aplícalo cuando estés listo.","success"),closeModal(),a&&a()}catch(m){showToast(m.message||"No se pudo guardar","error")}finally{b&&(b.disabled=!1,b.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar borrador')}})}async function Zt(e,t={}){var a;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando bodegas...</div>';try{const o=await API.getWarehouses(!1);t.warehouses=o,e.innerHTML=`
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm" style="color:#6B7280">${o.length} bodega(s) registrada(s).</p>
        ${can("canWrite")?'<button class="btn btn-primary" id="btn-new-wh"><i class="fas fa-plus"></i> Nueva Bodega</button>':""}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="wh-cards">
        ${o.length?o.map(s=>Oi(s)).join(""):'<div class="md:col-span-3 text-center py-10" style="color:#9CA3AF"><i class="fas fa-warehouse mr-2"></i>No hay bodegas. Crea la primera.</div>'}
      </div>`,(a=$("#btn-new-wh"))==null||a.addEventListener("click",()=>go(null,()=>Zt(e,t))),$$(".btn-edit-wh").forEach(s=>s.addEventListener("click",()=>{const n=o.find(i=>i.id===s.dataset.id);n&&go(n,()=>Zt(e,t))})),$$(".btn-toggle-wh").forEach(s=>s.addEventListener("click",async()=>{try{const n=o.find(i=>i.id===s.dataset.id);await pb.update("warehouses",n.id,{active:!n.active}),await API.logAudit("STATUS","Bodega",n.id,`${n.name} → ${n.active?"Inactiva":"Activa"}`),showToast(`Bodega ${n.active?"desactivada":"activada"}`,"success"),Zt(e,t)}catch(n){showToast(n.message,"error")}}))}catch(o){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(o.message)}</div>`}}function Oi(e){return`<div class="bg-white rounded-2xl border p-4" style="border-color:#F0F0F0">
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
  </div>`}function go(e=null,t=null){var a;openModal(e?`Editar bodega — ${esc(e.code)}`:"Nueva Bodega",`<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
     <button class="btn btn-primary" id="btn-save-wh"><i class="fas fa-floppy-disk"></i> Guardar</button>`,!1),(a=document.getElementById("btn-save-wh"))==null||a.addEventListener("click",async()=>{const o=document.getElementById("btn-save-wh");o&&(o.disabled=!0,o.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const s=getInputVal("wf-code").trim().toUpperCase(),n=getInputVal("wf-name").trim();if(!s)return showToast("El código es obligatorio","warning");if(!n)return showToast("El nombre es obligatorio","warning");if(!(e!=null&&e.id)&&(await pb.list("warehouses",{filter:`code="${pb.escapeFilterValue(s)}"`,perPage:1})).items.length)return showToast(`Ya existe una bodega con el código ${s}`,"warning");const i={code:s,name:n,address:getInputVal("wf-address").trim(),notes:getInputVal("wf-notes").trim(),active:getSelectVal("wf-active")==="true"};if(e!=null&&e.id)await pb.update("warehouses",e.id,i),await API.logAudit("UPDATE","Bodega",e.id,`${s} — ${n}`);else{const r=await pb.create("warehouses",i);await API.logAudit("CREATE","Bodega",r.id,`${s} — ${n}`)}showToast("Bodega guardada","success"),closeModal(),t&&t()}catch(s){showToast(s.message||"No se pudo guardar","error")}finally{o&&(o.disabled=!1,o.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar')}})}function Gt(e,t,a,o,s){return`<div class="rounded-2xl p-4" style="background:${s}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${a} text-sm" style="color:${o}"></i>
      <span class="text-xs font-semibold" style="color:${o}">${e}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${o}">${t}</p>
  </div>`}window.renderStockTab=Fi;window.filterStockTable=Ri;window.openWarehouseForm=go;window.renderBodegasTab=Zt;window.renderMovimientosTab=bs;window.applyMovement=tl;window.renderStockRows=Pi;window.voidMovement=al;window.whCard=Oi;window.invKpi=Gt;window.INV_STATUS_META=ms;window.openMovForm=ki;window.renderInventario=fs;window.renderMovRows=Di;window.viewMovDetail=el;window._renderInvPage=Li;window.INV_MOV_TYPES=fa;const gs={draft:{label:"Borrador",badge:"badge-orange"},posted:{label:"Contabilizada",badge:"badge-green"},voided:{label:"Anulada",badge:"badge-red"}},vs="purchase_config_v1",Bi=[{value:"BIEN",label:"Bien (Inventariable)"},{value:"SERVICIO",label:"Servicio"}],Mi=["UND","KG","L","M","M2","M3","PAQ","CJ","HORA","MES"],hs=[0,5,19];function Ui(e){if(!e)return"—";const t=new Date(String(e).replace(" ","T"));return Number.isNaN(t.getTime())?String(e):t.toLocaleString("es-CO",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}function ys(e,t){const{title:a,messageHtml:o,actionLabel:s="Confirmar",actionClass:n="btn-primary",placeholder:i="Describe el motivo..."}=e||{};openModal(a||"Motivo requerido",`<div class="space-y-4 text-sm">
      <div style="color:#374151">${o||""}</div>
      <div>
        <label class="form-label">Motivo obligatorio</label>
        <textarea id="po-action-reason" class="form-input" rows="4" placeholder="${esc(i)}"></textarea>
        <p class="text-xs mt-2" style="color:#6B7280">Este motivo quedará registrado en la auditoría de la compra.</p>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn ${n}" id="po-action-confirm-btn">${s}</button>`),setTimeout(()=>{const r=document.getElementById("po-action-reason"),c=document.getElementById("po-action-confirm-btn");r==null||r.focus(),c==null||c.addEventListener("click",async()=>{const l=String((r==null?void 0:r.value)||"").trim();if(l.length<8){showToast("Indica un motivo claro de al menos 8 caracteres.","warning"),r==null||r.focus();return}c&&(c.disabled=!0,c.textContent="Procesando...");try{await t(l),closeModal()}catch(u){showToast(u.message||"No fue posible completar la acción.","error"),c&&(c.disabled=!1,c.textContent=s)}},{once:!0})},50)}function Sa(){return{operational:{allow_services_without_product:!1,require_warehouse_for_goods:!0,enable_discounts:!0,enable_freight:!0,enable_withholdings:!0,withholdings:{reterenta:!0,reteiva:!1,reteica:!1},default_due_days:30},accounting:{accounts:{payable_code:"220505",expense_fallback_code:"5135",iva_by_rate:{5:"233501",19:"233502"},discount_code:"",freight_code:""},withholding_rules:[{id:"wr-ret-renta-3_5",concept:"RETERENTA",base_type:"SUBTOTAL",min_base:0,rate:3.5,account_code:""}]}}}function _s(e){var l,u,b;const t=Sa(),a=(e==null?void 0:e.operational)||{},o=(e==null?void 0:e.accounting)||{},s=(o==null?void 0:o.accounts)||{},n=s.iva_by_rate&&typeof s.iva_by_rate=="object"?s.iva_by_rate:{},i={};if(Object.keys(n).forEach(m=>{const p=String(m).trim();p&&(i[p]=String(n[m]||"").trim())}),!Object.keys(i).length){const m=String(s.iva_discountable_code||"").trim();m&&(i[19]=m)}const c=(Array.isArray(o.withholding_rules)?o.withholding_rules:[]).map((m,p)=>({id:String((m==null?void 0:m.id)||`wr-${Date.now()}-${p}`).trim(),concept:String((m==null?void 0:m.concept)||"").trim().toUpperCase(),base_type:String((m==null?void 0:m.base_type)||"SUBTOTAL").trim().toUpperCase(),min_base:Math.max(0,Number((m==null?void 0:m.min_base)||0)||0),rate:Math.max(0,Number((m==null?void 0:m.rate)||0)||0),account_code:String((m==null?void 0:m.account_code)||"").trim()})).filter(m=>m.concept&&m.rate>0);if(!c.length){const m=[];[["RETERENTA",s.reterenta_code],["RETEIVA",s.reteiva_code],["RETEICA",s.reteica_code]].forEach(([f,d],y)=>{const v=String(d||"").trim();v&&m.push({id:`wr-legacy-${y}`,concept:f,base_type:"SUBTOTAL",min_base:0,rate:f==="RETEICA"?.414:f==="RETEIVA"?15:3.5,account_code:v})}),m.length&&c.push(...m)}return{operational:{allow_services_without_product:!1,require_warehouse_for_goods:a.require_warehouse_for_goods!==!1,enable_discounts:a.enable_discounts!==!1,enable_freight:a.enable_freight!==!1,enable_withholdings:a.enable_withholdings!==!1,withholdings:{reterenta:((l=a==null?void 0:a.withholdings)==null?void 0:l.reterenta)!==!1,reteiva:!!((u=a==null?void 0:a.withholdings)!=null&&u.reteiva),reteica:!!((b=a==null?void 0:a.withholdings)!=null&&b.reteica)},default_due_days:Math.max(0,Number(a.default_due_days??t.operational.default_due_days)||0)},accounting:{accounts:{payable_code:String(s.payable_code||t.accounting.accounts.payable_code).trim(),expense_fallback_code:String(s.expense_fallback_code||t.accounting.accounts.expense_fallback_code).trim(),iva_by_rate:Object.keys(i).length?i:{...t.accounting.accounts.iva_by_rate},discount_code:String(s.discount_code||"").trim(),freight_code:String(s.freight_code||"").trim()},withholding_rules:c.length?c:[...t.accounting.withholding_rules]}}}async function xs(){try{const e=await API.getSetting(vs);return e?_s(JSON.parse(e)):Sa()}catch{return Sa()}}async function Vi(e){const t=_s(e||{});return await API.setSetting(vs,JSON.stringify(t)),await API.logAudit("CONFIG","PurchaseConfig",null,"Configuracion de compras actualizada"),t}function vo(e,t){if(!e||!t)return e||"";const a=new Date(`${e}T00:00:00`);if(Number.isNaN(a.getTime()))return e;a.setDate(a.getDate()+Number(t||0));const o=a.getFullYear(),s=String(a.getMonth()+1).padStart(2,"0"),n=String(a.getDate()).padStart(2,"0");return`${o}-${s}-${n}`}async function ji(e=null){var t,a,o;try{const[s,n]=await Promise.all([xs(),API.getAccounts(!0)]),i=(d="")=>`<option value="">— Sin definir —</option>${n.filter(v=>v.active&&Number(v.level)>=3).sort((v,g)=>v.code.localeCompare(g.code)).map(v=>`<option value="${esc(v.code)}"${v.code===d?" selected":""}>${esc(v.code)} — ${esc(v.name)}</option>`).join("")}`,r=Array.from(new Set([...hs.map(d=>String(d)),...Object.keys(s.accounting.accounts.iva_by_rate||{})])).sort((d,y)=>Number(d)-Number(y));openModal("Configuración de Compras",`<div class="space-y-5">
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
       <button class="btn btn-primary" id="btn-save-po-config"><i class="fas fa-floppy-disk"></i> Guardar configuración</button>`,!0);const c=document.getElementById("po-cfg-iva-rates-wrap"),l=(d="",y="")=>{var g;if(!c)return;const v=document.createElement("div");v.className="grid grid-cols-12 gap-2 items-center",v.innerHTML=`
        <div class="col-span-3">
          <input class="form-input po-cfg-iva-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${esc(String(d||""))}">
        </div>
        <div class="col-span-8">
          <select class="form-input po-cfg-iva-acct">${i(y)}</select>
        </div>
        <div class="col-span-1 text-right">
          <button type="button" class="btn btn-danger btn-sm po-cfg-iva-del"><i class="fas fa-trash"></i></button>
        </div>`,(g=v.querySelector(".po-cfg-iva-del"))==null||g.addEventListener("click",()=>v.remove()),c.appendChild(v)};r.length?r.forEach(d=>{var y;return l(d,((y=s.accounting.accounts.iva_by_rate)==null?void 0:y[d])||"")}):l("19",""),(t=document.getElementById("btn-po-cfg-add-iva-rate"))==null||t.addEventListener("click",()=>l("",""));const u=document.getElementById("po-cfg-ret-rules-wrap"),b=["RETERENTA","RETEIVA","RETEICA","OTRA"],m=["SUBTOTAL","IVA","TOTAL"],p=(d={})=>{var v;if(!u)return;const y=document.createElement("div");y.className="grid grid-cols-12 gap-2 items-center",y.innerHTML=`
        <div class="col-span-2"><select class="form-input po-cfg-ret-concept">${b.map(g=>`<option value="${g}"${String(d.concept||"")===g?" selected":""}>${g}</option>`).join("")}</select></div>
        <div class="col-span-2"><select class="form-input po-cfg-ret-base-type">${m.map(g=>`<option value="${g}"${String(d.base_type||"SUBTOTAL")===g?" selected":""}>${g}</option>`).join("")}</select></div>
        <div class="col-span-2"><input class="form-input po-cfg-ret-min-base" type="number" min="0" step="0.01" placeholder="Base mín." value="${esc(String(d.min_base??0))}"></div>
        <div class="col-span-2"><input class="form-input po-cfg-ret-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${esc(String(d.rate??0))}"></div>
        <div class="col-span-3"><select class="form-input po-cfg-ret-account">${i(d.account_code||"")}</select></div>
        <div class="col-span-1 text-right"><button type="button" class="btn btn-danger btn-sm po-cfg-ret-del"><i class="fas fa-trash"></i></button></div>`,(v=y.querySelector(".po-cfg-ret-del"))==null||v.addEventListener("click",()=>y.remove()),u.appendChild(y)},f=Array.isArray(s.accounting.withholding_rules)?s.accounting.withholding_rules:[];f.length?f.forEach(d=>p(d)):p({concept:"RETERENTA",base_type:"SUBTOTAL",min_base:0,rate:3.5,account_code:""}),(a=document.getElementById("btn-po-cfg-add-ret-rule"))==null||a.addEventListener("click",()=>p({concept:"RETERENTA",base_type:"SUBTOTAL",min_base:0,rate:0,account_code:""})),(o=$("#btn-save-po-config"))==null||o.addEventListener("click",async()=>{try{const d={};(document.querySelectorAll("#po-cfg-iva-rates-wrap .grid")||[]).forEach(g=>{var A,I;const h=String(((A=g.querySelector(".po-cfg-iva-rate"))==null?void 0:A.value)||"").trim(),_=String(((I=g.querySelector(".po-cfg-iva-acct"))==null?void 0:I.value)||"").trim();h&&(d[h]=_)});const y=[];(document.querySelectorAll("#po-cfg-ret-rules-wrap .grid")||[]).forEach((g,h)=>{var x,T,E,C,N;const _=String(((x=g.querySelector(".po-cfg-ret-concept"))==null?void 0:x.value)||"").trim().toUpperCase(),A=String(((T=g.querySelector(".po-cfg-ret-base-type"))==null?void 0:T.value)||"SUBTOTAL").trim().toUpperCase(),I=Math.max(0,Number(((E=g.querySelector(".po-cfg-ret-min-base"))==null?void 0:E.value)||0)||0),F=Math.max(0,Number(((C=g.querySelector(".po-cfg-ret-rate"))==null?void 0:C.value)||0)||0),S=String(((N=g.querySelector(".po-cfg-ret-account"))==null?void 0:N.value)||"").trim();!_||F<=0||y.push({id:`wr-${Date.now()}-${h}`,concept:_,base_type:A,min_base:I,rate:F,account_code:S})});const v={operational:{allow_services_without_product:!1,require_warehouse_for_goods:getCheckVal("po-cfg-req-wh"),enable_discounts:getCheckVal("po-cfg-discount"),enable_freight:getCheckVal("po-cfg-freight"),enable_withholdings:getCheckVal("po-cfg-withholding"),default_due_days:Math.max(0,parseInt(getInputVal("po-cfg-default-due")||"0",10)||0),withholdings:{reterenta:getCheckVal("po-cfg-ret-renta"),reteiva:getCheckVal("po-cfg-ret-iva"),reteica:getCheckVal("po-cfg-ret-ica")}},accounting:{accounts:{payable_code:getSelectVal("po-cfg-payable")||"220505",expense_fallback_code:getSelectVal("po-cfg-exp-fallback")||"5135",iva_by_rate:d,discount_code:getSelectVal("po-cfg-discount-acct")||"",freight_code:getSelectVal("po-cfg-freight-acct")||""},withholding_rules:y}};await Vi(v),showToast("Configuración de compras guardada","success"),closeModal(),typeof e=="function"&&e()}catch(d){showToast(d.message||"No se pudo guardar la configuración","error")}})}catch(s){showToast(s.message||"No se pudo abrir la configuración de compras","error")}}async function ba(e){e.innerHTML='<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando compras...</div>';try{await Na(e)}catch(t){e.innerHTML=`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(t.message)}</div>`}}async function Na(e){var c,l,u,b,m,p;const a=(await API.getPurchaseInvoices({perPage:100,sort:"-date"})).items||[],o=a.length,s=a.filter(f=>f.status==="draft").length,n=a.filter(f=>f.status==="posted").length,i=a.filter(f=>f.status!=="voided").reduce((f,d)=>f+(d.total||0),0);e.innerHTML=`
    <!-- KPIs -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Compras de Bienes y Servicios</h3>
        <p class="text-sm" style="color:#6B7280">Facturas de compra con contabilización automática e integración de inventario.</p>
      </div>
      ${can("canWrite")?'<div class="flex gap-2"><button class="btn btn-outline" id="btn-po-config" title="Configuración de compras"><i class="fas fa-gear"></i></button><button class="btn btn-primary" id="btn-new-purchase"><i class="fas fa-plus"></i> Nueva Factura de Compra</button></div>':""}
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      ${zt("Total facturas",o,"fas fa-file-invoice-dollar","#1A4B8C","#EEF4FF")}
      ${zt("Borradores",s,"fas fa-pencil","#C46516","#FFF8F0")}
      ${zt("Contabilizadas",n,"fas fa-check-circle","#059669","#ECFDF5")}
      ${zt("Valor total compras",fmt(i),"fas fa-coins","#7C3AED","#F5F3FF")}
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
            ${a.length?a.map(Hi).join(""):'<tr><td colspan="10" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-file-invoice-dollar mr-2"></i>No hay facturas de compra.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`,(c=$("#btn-new-purchase"))==null||c.addEventListener("click",()=>As(null,()=>Na(e))),(l=$("#btn-po-config"))==null||l.addEventListener("click",()=>ji(()=>Na(e)));const r=()=>Gi();(u=$("#po-q"))==null||u.addEventListener("input",debounce(r,150)),(b=$("#po-status-f"))==null||b.addEventListener("change",r),(m=$("#po-from"))==null||m.addEventListener("change",r),(p=$("#po-to"))==null||p.addEventListener("change",r)}function Hi(e){var s,n;const t=gs[e.status]||{label:e.status,badge:"badge-gray"},a=(s=e.expand)==null?void 0:s.supplier_id,o=(n=e.expand)==null?void 0:n.warehouse_id;return`<tr data-poid="${esc(e.id)}" data-postatus="${esc(e.status)}" data-podate="${esc(e.date)}">
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
  </tr>`}function Gi(){const e=(getInputVal("po-q")||"").toLowerCase(),t=getSelectVal("po-status-f"),a=getInputVal("po-from"),o=getInputVal("po-to");$$("#po-table tbody tr[data-poid]").forEach(s=>{const n=s.textContent.toLowerCase(),i=s.dataset.podate;s.style.display=(!e||n.includes(e))&&(!t||s.dataset.postatus===t)&&(!a||i>=a)&&(!o||i<=o)?"":"none"})}async function As(e=null,t=null){var V,U,q,J,te;let a=null,o=[],[s,n,i,r,c,l]=await Promise.all([xs(),pb.listAll("third_parties",{filter:"active=true",sort:"name"}),API.getWarehouses(!0),API.getProducts({activeOnly:!0}),pb.listAll("accounts",{filter:"active=true && level>=3",sort:"code"}),API.getTxTypes()]);e&&([a,o]=await Promise.all([pb.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id"}),API.getPurchaseInvoiceLines(e)]));let u=0;const b=(a==null?void 0:a.date)||todayStr(),m=(a==null?void 0:a.due_date)||vo(b,s.operational.default_due_days||0),p=l.map(R=>`<option value="${esc(R.id)}"${(a==null?void 0:a.tx_type_id)===R.id?" selected":""}>${esc(R.prefix)} — ${esc(R.name)}</option>`).join("");function f(R){return`${(R==null?void 0:R.doc_number)||(R==null?void 0:R.nit)||""} - ${(R==null?void 0:R.name)||""}`.trim()}const d=()=>r.map(R=>`<option value="${esc(R.id)}" data-type="${esc(R.type)}" data-cost="${R.cost_price||0}" data-iva="${R.iva_rate||0}" data-invacct="${esc(R.inventory_account_id||"")}" data-costacct="${esc(R.cost_account_id||"")}">${esc(R.code)} — ${esc(R.name)}</option>`).join(""),y=(((V=s==null?void 0:s.accounting)==null?void 0:V.withholding_rules)||[]).filter(R=>String(R.account_code||"").trim()&&Number(R.rate||0)>0);window.__poRetRulesCache=y;const v=R=>`${R.concept} ${R.rate}% (${R.base_type}${Number(R.min_base||0)>0?`, base >= ${fmt(R.min_base||0)}`:""})`,g=(R=y,D="")=>`<option value="">— Sin retención —</option>${R.map(z=>`<option value="${esc(z.id)}"${z.id===D?" selected":""}>${esc(v(z))}</option>`).join("")}`,h=R=>String(R||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase(),_=R=>{const D=h(`${(R==null?void 0:R.concept)||""} ${(R==null?void 0:R.name)||""} ${(R==null?void 0:R.account_code)||""}`);return D.includes("ica")?"ica":D.includes("iva")?"iva":D.includes("fuente")||D.includes("renta")||D.includes("rete fuente")?"renta":"other"},A=y.filter(R=>_(R)==="renta"),I=y.filter(R=>_(R)==="ica"),F=y.filter(R=>_(R)==="iva"),S=(R="")=>g(A,R),x=(R="")=>g(I,R),T=(R="")=>g(F,R),E=r.map(R=>({id:R.id,title:`${R.code} — ${R.name}`,sub:R.type}));openModal(e?`Editar Factura — ${esc((a==null?void 0:a.number)||"")}`:"Nueva Factura de Compra",`<!-- Encabezado -->
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
        <input id="po-date" type="date" class="form-input" value="${esc(b)}">
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
          ${p}
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
          ${i.map(R=>`<option value="${esc(R.id)}"${(a==null?void 0:a.warehouse_id)===R.id?" selected":""}>${esc(R.name)}</option>`).join("")}
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
                ${S((a==null?void 0:a.ret_rule_renta_id)||"")}
              </select>
              <span id="po-total-ret-renta" class="font-semibold" style="min-width:90px;text-align:right;color:#C46516">$ 0</span>
            </div>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span style="color:#6B7280;white-space:nowrap">ReteICA:</span>
            <div class="flex items-center gap-2">
              <select id="po-hdr-ret-rule-ica" class="form-input" style="font-size:12px;padding:4px 8px;min-width:170px" onchange="window.poRecalcLine(0)">
                ${x((a==null?void 0:a.ret_rule_ica_id)||"")}
              </select>
              <span id="po-total-ret-ica" class="font-semibold" style="min-width:90px;text-align:right;color:#C46516">$ 0</span>
            </div>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span style="color:#6B7280;white-space:nowrap">ReteIVA:</span>
            <div class="flex items-center gap-2">
              <select id="po-hdr-ret-rule-iva" class="form-input" style="font-size:12px;padding:4px 8px;min-width:170px" onchange="window.poRecalcLine(0)">
                ${T((a==null?void 0:a.ret_rule_iva_id)||"")}
              </select>
              <span id="po-total-ret-iva" class="font-semibold" style="min-width:90px;text-align:right;color:#C46516">$ 0</span>
            </div>
          </div>
        </div>
        <div class="flex justify-between gap-8"><span style="color:#6B7280">Total Retenciones:</span> <span id="po-total-ret" class="font-semibold">$ 0</span></div>
        <div class="flex justify-between gap-8 text-base border-t pt-2" style="border-color:#E5E7EB"><span class="font-bold" style="color:#0D2137">TOTAL CxP:</span> <span id="po-total-net" class="font-bold" style="color:#1A4B8C">$ 0</span></div>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-po"><i class="fas fa-floppy-disk"></i> Guardar borrador</button>`,!0);function C(){const R=document.getElementById("po-supplier-search-wrap"),D=document.getElementById("po-supplier"),z=document.getElementById("po-supplier-search"),G=document.getElementById("po-supplier-results");if(!R||!D||!z||!G)return;const ee=Z=>n.find(Q=>Q.id===Z)||null,X=(Z="")=>{const se=String(Z||"").toLowerCase().trim().split(/\s+/).filter(Boolean),he=se.length?n.filter(ge=>{const _e=`${ge.doc_number||""} ${ge.nit||""} ${ge.name||""}`.toLowerCase();return se.every(ue=>_e.includes(ue))}).slice(0,40):n.slice(0,40);if(!he.length){G.innerHTML='<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';return}G.innerHTML=he.map(ge=>`<button type="button" data-po-third-id="${esc(ge.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer"><div style="font-weight:600">${esc(ge.doc_number||ge.nit||"SIN DOC")}</div><div style="font-size:12px;color:#6B7280">${esc(ge.name||"")}</div></button>`).join("")};(()=>{const Z=ee(D.value);z.value=Z?f(Z):""})(),z.onfocus=()=>{X(z.value),G.style.display="block"},z.oninput=()=>{D.value="",X(z.value),G.style.display="block"},G.onclick=Z=>{const Q=Z.target.closest("[data-po-third-id]");if(!Q)return;const se=Q.getAttribute("data-po-third-id")||"";D.value=se;const he=ee(se);z.value=he?f(he):"",G.style.display="none"},z._poOutsideHandler&&document.removeEventListener("click",z._poOutsideHandler),z._poOutsideHandler=Z=>{R.contains(Z.target)||(G.style.display="none")},setTimeout(()=>document.addEventListener("click",z._poOutsideHandler),0)}function N(){$$('select[id^="pol-prod-"]').forEach(R=>{const D=R.value;R.innerHTML=`<option value="">— Seleccionar —</option>${d()}`,D&&(R.value=D)}),$$('input[id^="pol-prod-search-"]').forEach(R=>{var ee;const D=R.id.replace("pol-prod-search-",""),z=document.getElementById(`pol-prod-${D}`),G=(ee=z==null?void 0:z.selectedOptions)==null?void 0:ee[0];R.value=G&&G.value?G.textContent:""})}function L(R){return y.find(D=>D.id===R)||null}function O(R,D,z,G){if(!G)return{base:0,amount:0};const ee=String(G.base_type||"SUBTOTAL").toUpperCase(),X=ee==="IVA"?D:ee==="TOTAL"?z:R,ie=Number(G.min_base||0)||0;if(X<ie)return{base:X,amount:0};const Z=Number(G.rate||0)||0;return{base:X,amount:X*Z/100}}function M(R,D){const z=R+D,G=L(getSelectVal("po-hdr-ret-rule-renta")),ee=L(getSelectVal("po-hdr-ret-rule-ica")),X=L(getSelectVal("po-hdr-ret-rule-iva")),ie=O(R,D,z,G).amount||0,Z=O(R,D,z,ee).amount||0,Q=X?(()=>{const se=Number(X.min_base||0)||0;return D<se?0:D*(Number(X.rate||0)||0)/100})():0;return{reteRenta:ie,reteIca:Z,reteIva:Q,total:ie+Z+Q}}function B({wrapId:R,inputId:D,selectId:z,resultsId:G,dataList:ee,onSelected:X}){const ie=document.getElementById(R),Z=document.getElementById(D),Q=document.getElementById(z),se=document.getElementById(G);if(!ie||!Z||!Q||!se)return;const he=(_e="")=>{const pe=String(_e||"").toLowerCase().trim().split(/\s+/).filter(Boolean),fe=pe.length?ee.filter(me=>{const Pe=`${me.title||""} ${me.sub||""}`.toLowerCase();return pe.every(Re=>Pe.includes(Re))}).slice(0,30):ee.slice(0,30);if(!fe.length){se.innerHTML='<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';return}se.innerHTML=fe.map(me=>`<button type="button" data-lookup-id="${esc(me.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer"><div style="font-weight:600">${esc(me.title)}</div><div style="font-size:12px;color:#6B7280">${esc(me.sub||"")}</div></button>`).join("")};(()=>{var ue;const _e=(ue=Q.selectedOptions)==null?void 0:ue[0];Z.value=_e&&_e.value?_e.textContent:""})(),Z.onfocus=()=>{he(Z.value),se.style.display="block"},Z.oninput=()=>{Q.value="",he(Z.value),se.style.display="block",typeof X=="function"&&X("")},se.onclick=_e=>{var me;const ue=_e.target.closest("[data-lookup-id]");if(!ue)return;const pe=ue.getAttribute("data-lookup-id")||"";Q.value=pe;const fe=(me=Q.selectedOptions)==null?void 0:me[0];Z.value=fe&&fe.value?fe.textContent:"",se.style.display="none",typeof X=="function"&&X(pe)},Z._lookupOutsideHandler&&document.removeEventListener("click",Z._lookupOutsideHandler),Z._lookupOutsideHandler=_e=>{ie.contains(_e.target)||(se.style.display="none")},setTimeout(()=>document.addEventListener("click",Z._lookupOutsideHandler),0)}function j(){var X,ie,Z;if(!can("canWrite"))return showToast("Sin permisos para crear productos","error");const R=()=>`<option value="">— Sin asignar —</option>${c.filter(se=>se.active&&Number(se.level)>=3).sort((se,he)=>se.code.localeCompare(he.code)).map(se=>`<option value="${esc(se.id)}">${esc(se.code)} — ${esc(se.name)}</option>`).join("")}`,D="po-quick-product-overlay",z=document.getElementById(D);z&&z.remove();const G=document.createElement("div");G.id=D,G.style.cssText="position:fixed;inset:0;background:rgba(5,8,20,.6);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:12px",G.innerHTML=`
      <div style="background:#fff;border-radius:16px;width:100%;max-width:760px;max-height:92vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.2)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #F0F0F0">
          <h4 style="font-weight:700;color:#0D2137;font-size:15px"><i class="fas fa-box-open mr-2" style="color:#1A4B8C"></i>Crear producto desde compra</h4>
          <button id="po-qp-close" style="background:none;border:none;font-size:18px;color:#9CA3AF;cursor:pointer"><i class="fas fa-xmark"></i></button>
        </div>
        <div style="padding:18px" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group mb-0"><label class="form-label">Codigo *</label><input id="po-qp-code" class="form-input" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" placeholder="P-001"></div>
          <div class="form-group mb-0"><label class="form-label">Nombre *</label><input id="po-qp-name" class="form-input" placeholder="Nombre del producto"></div>
          <div class="form-group mb-0"><label class="form-label">Tipo *</label><select id="po-qp-type" class="form-input">${Bi.map(Q=>`<option value="${esc(Q.value)}">${esc(Q.label)}</option>`).join("")}</select></div>
          <div class="form-group mb-0"><label class="form-label">Unidad *</label><select id="po-qp-unit" class="form-input">${Mi.map(Q=>`<option value="${esc(Q)}">${esc(Q)}</option>`).join("")}</select></div>
          <div class="form-group mb-0"><label class="form-label">IVA %</label><select id="po-qp-iva" class="form-input">${hs.map(Q=>`<option value="${Q}">${Q}%</option>`).join("")}</select></div>
          <div class="form-group mb-0"><label class="form-label">Costo estimado</label><input id="po-qp-cost" type="number" min="0" step="0.01" class="form-input" value="0"></div>
          <div class="form-group mb-0"><label class="form-label">Cuenta costo/gasto</label><select id="po-qp-cost-acct" class="form-input">${R()}</select></div>
          <div class="form-group mb-0"><label class="form-label">Cuenta inventario</label><select id="po-qp-inv-acct" class="form-input">${R()}</select></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;padding:12px 20px;border-top:1px solid #F0F0F0">
          <button class="btn btn-outline" id="po-qp-cancel">Cancelar</button>
          <button class="btn btn-primary" id="po-qp-save"><i class="fas fa-floppy-disk"></i> Crear producto</button>
        </div>
      </div>`,document.body.appendChild(G);const ee=()=>{G.remove()};(X=document.getElementById("po-qp-close"))==null||X.addEventListener("click",ee),(ie=document.getElementById("po-qp-cancel"))==null||ie.addEventListener("click",ee),G.addEventListener("click",Q=>{Q.target===G&&ee()}),(Z=document.getElementById("po-qp-save"))==null||Z.addEventListener("click",async()=>{const Q=document.getElementById("po-qp-save");Q&&(Q.disabled=!0,Q.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const se=getInputVal("po-qp-code").trim().toUpperCase(),he=getInputVal("po-qp-name").trim();if(!se)return showToast("El codigo es obligatorio","warning");if(!he)return showToast("El nombre es obligatorio","warning");const ge=pb.escapeFilterValue(se);if((await pb.list("products",{filter:`code="${ge}"`,perPage:1})).items.length)return showToast(`Ya existe un producto con codigo ${se}`,"warning");const ue={code:se,name:he,description:"",type:getSelectVal("po-qp-type")||"BIEN",unit:getSelectVal("po-qp-unit")||"UND",presentacion:"",categoria:"",linea:"",iva_rate:Number(getSelectVal("po-qp-iva")||0),base_price:0,precio_venta_2:null,precio_venta_3:null,cost_price:parseFloat(getInputVal("po-qp-cost")||"0")||0,active:!0,unspsc_code:"",ean_code:"",peso:null,cajas_en_pallet:null,und_empaque:null,peso_x_und_empaque:null,income_account_id:null,cost_account_id:getSelectVal("po-qp-cost-acct")||null,inventory_account_id:getSelectVal("po-qp-inv-acct")||null},pe=await pb.create("products",ue);await API.logAudit("CREATE","Producto",pe.id,`${pe.code} — ${pe.name} (desde compras)`),r.unshift(pe),N(),ee(),showToast("Producto creado y disponible en la factura","success")}catch(se){showToast(se.message||"No se pudo crear el producto","error")}finally{Q&&(Q.disabled=!1,Q.innerHTML='<i class="fas fa-floppy-disk"></i> Crear producto')}})}function Y(){var ie,Z;let R=0,D=0,z=0,G=1;for(;G<=u+5;){const Q=document.getElementById(`pol-price-${G}`);if(!Q){if(G++,G>u+5)break;continue}const se=parseFloat(((ie=document.getElementById(`pol-qty-${G}`))==null?void 0:ie.value)||"0")||0,he=parseFloat(Q.value||"0")||0,ge=parseFloat(((Z=document.getElementById(`pol-iva-${G}`))==null?void 0:Z.value)||"0")||0,_e=se*he,ue=_e*ge/100,pe=_e+ue;R+=_e,D+=ue;const fe=document.getElementById(`pol-rowtot-${G}`);if(fe&&(fe.textContent=fmt(pe)),window.__poRetMode!=="header"){const me=getSelectVal(`pol-ret-rule-${G}`),Pe=L(me),Re=O(_e,ue,pe,Pe);z+=Re.amount;const re=document.getElementById(`pol-retamt-${G}`);re&&(re.textContent=Re.amount>0?fmt(Re.amount):"—")}G++}if(window.__poRetMode==="header"){const Q=M(R,D);z=Q.total,$("#po-total-ret-renta")&&($("#po-total-ret-renta").textContent=fmt(Q.reteRenta)),$("#po-total-ret-ica")&&($("#po-total-ret-ica").textContent=fmt(Q.reteIca)),$("#po-total-ret-iva")&&($("#po-total-ret-iva").textContent=fmt(Q.reteIva))}else $("#po-total-ret-renta")&&($("#po-total-ret-renta").textContent=fmt(0)),$("#po-total-ret-ica")&&($("#po-total-ret-ica").textContent=fmt(0)),$("#po-total-ret-iva")&&($("#po-total-ret-iva").textContent=fmt(0));const X=R+D-z;$("#po-total-sub")&&($("#po-total-sub").textContent=fmt(R)),$("#po-total-iva")&&($("#po-total-iva").textContent=fmt(D)),$("#po-total-ret")&&($("#po-total-ret").textContent=fmt(z)),$("#po-total-net")&&($("#po-total-net").textContent=fmt(X))}window.__poRecalcTotals=Y;function W(R){const D=document.getElementById(`pol-row-${R}`),z=document.getElementById(`pol-comment-btn-${R}`);if(!D||!z)return;const G=!!String(D.dataset.comment||"").trim();z.style.borderColor=G?"#1A4B8C":"#D1D5DB",z.style.color=G?"#1A4B8C":"#6B7280",z.style.background=G?"#EEF4FF":"#fff",z.title=G?"Editar comentario":"Agregar comentario"}window.poEditLineComment=function(D){const z=document.getElementById(`pol-row-${D}`);if(!z)return;let G=document.getElementById("po-line-comment-overlay");G||(G=document.createElement("div"),G.id="po-line-comment-overlay",G.style.cssText="display:none;position:fixed;inset:0;background:rgba(5,8,20,.6);backdrop-filter:blur(4px);z-index:220;align-items:center;justify-content:center;padding:16px",G.innerHTML=`
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
        </div>`,document.body.appendChild(G));const ee=document.getElementById("po-line-comment-text"),X=()=>{G.style.display="none"},ie=()=>{const Z=String((ee==null?void 0:ee.value)||"").trim();z.dataset.comment=Z,W(D),X()};ee&&(ee.value=String(z.dataset.comment||"")),G.style.display="flex",setTimeout(()=>ee==null?void 0:ee.focus(),40),document.getElementById("po-line-comment-close").onclick=X,document.getElementById("po-line-comment-cancel").onclick=X,document.getElementById("po-line-comment-save").onclick=ie};function K(R={}){var ee;u++;const D=u,z=document.getElementById("po-lines-body");if(!z)return;const G=document.createElement("tr");if(G.id=`pol-row-${D}`,G.dataset.comment=String(R.description||"").trim(),G.innerHTML=`
      <td>
        <div id="pol-prod-wrap-${D}" class="relative">
          <input id="pol-prod-search-${D}" class="form-input" style="min-width:200px" autocomplete="off" placeholder="Buscar producto...">
          <select class="form-input" id="pol-prod-${D}" style="display:none">
            <option value="">— Seleccionar —</option>
            ${d()}
          </select>
          <div id="pol-prod-results-${D}" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:45"></div>
        </div>
      </td>
      <td><input id="pol-qty-${D}" type="number" min="0.0001" step="0.0001" class="form-input text-right" style="min-width:70px" value="${R.qty||"1"}" oninput="poRecalcLine(${D})"></td>
      <td><input id="pol-price-${D}" type="number" min="0" step="0.01" class="form-input text-right" style="min-width:100px" value="${R.unit_price||""}" oninput="poRecalcLine(${D})"></td>
      <td><input id="pol-iva-${D}" type="number" min="0" max="100" step="1" class="form-input text-right" style="min-width:60px" value="${R.iva_rate||"0"}" oninput="poRecalcLine(${D})"></td>
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
      </td>`,z.appendChild(G),W(D),B({wrapId:`pol-prod-wrap-${D}`,inputId:`pol-prod-search-${D}`,selectId:`pol-prod-${D}`,resultsId:`pol-prod-results-${D}`,dataList:E,onSelected:()=>{var se;const X=document.getElementById(`pol-prod-${D}`),ie=(se=X==null?void 0:X.selectedOptions)==null?void 0:se[0];if(!ie||!ie.value)return;const Z=document.getElementById(`pol-price-${D}`),Q=document.getElementById(`pol-iva-${D}`);Z&&!Z.value&&(Z.value=ie.dataset.cost||""),Q&&(Q.value=ie.dataset.iva||"0"),poRecalcLine(D)}}),R.product_id){const X=document.getElementById(`pol-prod-${D}`);X&&(X.value=R.product_id);const ie=document.getElementById(`pol-prod-search-${D}`),Z=(ee=X==null?void 0:X.selectedOptions)==null?void 0:ee[0];ie&&(Z!=null&&Z.value)&&(ie.value=Z.textContent)}if(R.ret_rule_id){const X=document.getElementById(`pol-ret-rule-${D}`);X&&(X.value=R.ret_rule_id),window.__poRetMode==="header"&&document.querySelectorAll(`#pol-row-${D} .po-ret-col`).forEach(ie=>{ie.style.display="none"})}Y()}if(o.length)for(const R of o)K(R);else K();C(),(U=document.getElementById("btn-add-po-line"))==null||U.addEventListener("click",()=>K()),(q=document.getElementById("btn-new-po-product"))==null||q.addEventListener("click",()=>j()),window.__poRetMode="header",window.poSetRetMode(!1);const H=document.getElementById("po-tx-type"),w=document.getElementById("po-tx-number"),P=()=>{if(!H||!w||e&&w.value)return;const R=l.find(G=>G.id===H.value);if(!R)return;const D=Number(R.consecutive||0)+1,z=R.prefix||R.code||"TX";w.value=`${z}-${String(D).padStart(8,"0")}`};H==null||H.addEventListener("change",P),P(),!e&&(s.operational.default_due_days||0)>0&&((J=document.getElementById("po-date"))==null||J.addEventListener("change",()=>{const R=getInputVal("po-date");$("#po-due-date")&&!getInputVal("po-due-date")&&setInputVal("po-due-date",vo(R,s.operational.default_due_days||0))})),(te=document.getElementById("btn-save-po"))==null||te.addEventListener("click",async()=>{const R=document.getElementById("btn-save-po");R&&(R.disabled=!0,R.innerHTML='<i class="fas fa-spinner fa-spin"></i> Guardando...');try{const D=getInputVal("po-supplier"),z=getInputVal("po-date"),G=getSelectVal("po-tx-type"),ee=getInputVal("po-tx-number").trim();if(!D)return showToast("Selecciona el proveedor","warning");if(!z)return showToast("La fecha es obligatoria","warning");if(!G)return showToast("Selecciona el tipo de comprobante contable","warning");if(!ee)return showToast("Define la numeración del comprobante contable","warning");const X=[];let ie=0;for(let ue=1;ue<=u+2;ue++){const pe=document.getElementById(`pol-row-${ue}`);if(!pe)continue;const fe=getSelectVal(`pol-prod-${ue}`),me=String(pe.dataset.comment||"").trim(),Pe=parseFloat(getInputVal(`pol-qty-${ue}`)||"0")||0,Re=parseFloat(getInputVal(`pol-price-${ue}`)||"0")||0,re=parseFloat(getInputVal(`pol-iva-${ue}`)||"0")||0,de=window.__poRetMode==="header"?"":getSelectVal(`pol-ret-rule-${ue}`)||"";if(!Pe||!Re)continue;if(!fe)return showToast(`Línea ${X.length+1}: selecciona un producto`,"warning");const Ge=Pe*Re,xt=Ge*re/100,ze=Ge+xt,Se=L(de),Ka=O(Ge,xt,ze,Se);ie+=Ka.amount||0,X.push({product_id:fe||null,account_id:null,description:me,qty:Pe,unit_price:Re,iva_rate:re,subtotal:Ge,iva_amount:xt,total:ze,ret_rule_id:Se?Se.id:"",ret_concept:Se?Se.concept:"",ret_base_type:Se?Se.base_type:"",ret_base:Ka.base||0,ret_rate:Se?Number(Se.rate||0):0,ret_amount:Ka.amount||0,ret_account_code:Se?String(Se.account_code||""):""})}if(!X.length)return showToast("Agrega al menos una línea válida","warning");if(window.__poRetMode==="header"){const ue=X.reduce((fe,me)=>fe+(me.subtotal||0),0),pe=X.reduce((fe,me)=>fe+(me.iva_amount||0),0);ie=M(ue,pe).total}if(s.operational.require_warehouse_for_goods&&X.some(pe=>{if(!pe.product_id)return!1;const fe=r.find(me=>me.id===pe.product_id);return(fe==null?void 0:fe.type)==="BIEN"})&&!getSelectVal("po-warehouse"))return showToast("Selecciona bodega destino para líneas de bienes","warning");const Z=z.replaceAll("-",""),Q=String(Date.now()).slice(-4),se=(a==null?void 0:a.number)||`FC-${Z}-${Q}`,ge=X.reduce((ue,pe)=>ue+(pe.total||0),0)-ie,_e={number:se,date:z,due_date:getInputVal("po-due-date")||null,supplier_id:D,supplier_ref:getInputVal("po-supplier-ref").trim(),tx_type_id:G,tx_number:ee,warehouse_id:getSelectVal("po-warehouse")||null,notes:getInputVal("po-notes").trim(),ret_total:ie,payable_total:ge,ret_rule_renta_id:window.__poRetMode==="header"&&getSelectVal("po-hdr-ret-rule-renta")||"",ret_rule_ica_id:window.__poRetMode==="header"&&getSelectVal("po-hdr-ret-rule-ica")||"",ret_rule_iva_id:window.__poRetMode==="header"&&getSelectVal("po-hdr-ret-rule-iva")||""};if(e){let ue=0,pe=0;for(const me of X)ue+=me.subtotal,pe+=me.iva_amount;await pb.update("purchase_invoices",e,{..._e,subtotal:ue,iva_total:pe,total:ge});const fe=await pb.listAll("purchase_invoice_lines",{filter:`invoice_id="${pb.escapeFilterValue(e)}"`});for(const me of fe)await pb.delete("purchase_invoice_lines",me.id);for(let me=0;me<X.length;me++)await pb.create("purchase_invoice_lines",{invoice_id:e,line_order:me+1,...X[me]});await API.logAudit("UPDATE","PurchaseInvoice",e,`Editada ${se}`),showToast("Factura actualizada","success")}else await API.createPurchaseInvoice(_e,X),showToast("Factura guardada como borrador","success");closeModal(),t&&t()}catch(D){showToast(D.message||"Error al guardar","error")}finally{R&&(R.disabled=!1,R.innerHTML='<i class="fas fa-floppy-disk"></i> Guardar borrador')}})}window.poRecalcLine=function(){var n,i,r;if(typeof window.__poRecalcTotals=="function"){window.__poRecalcTotals();return}let e=0,t=0,a=0;for(let c=1;c<=100;c++){if(!document.getElementById(`pol-row-${c}`))continue;const u=parseFloat(((n=document.getElementById(`pol-qty-${c}`))==null?void 0:n.value)||"0")||0,b=parseFloat(((i=document.getElementById(`pol-price-${c}`))==null?void 0:i.value)||"0")||0,m=parseFloat(((r=document.getElementById(`pol-iva-${c}`))==null?void 0:r.value)||"0")||0,p=u*b,f=p*m/100;e+=p,t+=f}const s=e+t-a;$("#po-total-sub")&&($("#po-total-sub").textContent=fmt(e)),$("#po-total-iva")&&($("#po-total-iva").textContent=fmt(t)),$("#po-total-ret")&&($("#po-total-ret").textContent=fmt(a)),$("#po-total-net")&&($("#po-total-net").textContent=fmt(s))};window.poSetRetMode=function(e){window.__poRetMode=e?"line":"header",document.querySelectorAll(".po-ret-col").forEach(i=>{i.style.display=e?"":"none"});const t=document.getElementById("po-hdr-ret-wrap");t&&(t.style.display=e?"none":"");const a=document.getElementById("po-ret-mode-knob");a&&(a.style.transform=e?"translateX(18px)":"");const o=document.getElementById("po-ret-mode-track");o&&(o.style.background=e?"#6B7280":"#1A4B8C");const s=document.getElementById("po-ret-mode-lbl-hdr");s&&(s.style.color=e?"#9CA3AF":"#1A4B8C");const n=document.getElementById("po-ret-mode-lbl-line");n&&(n.style.color=e?"#1A4B8C":"#9CA3AF"),window.poRecalcLine(0)};async function ol(e){var t,a;try{const[o,s,n]=await Promise.all([pb.get("purchase_invoices",e,{expand:"supplier_id,warehouse_id"}),API.getPurchaseInvoiceLines(e),can("canViewAudit")?API.getAuditLogs({entity:"PurchaseInvoice",entityId:e,actions:["REOPEN","VOID"],limit:20}).catch(()=>[]):Promise.resolve([])]),i=o.status==="posted"?await API.getPurchaseMutationBlocks(e).catch(()=>({blocks:[],details:{}})):{blocks:[],details:{}},r=gs[o.status]||{label:o.status,badge:"badge-gray"},c=(t=o.expand)==null?void 0:t.supplier_id,l=(a=o.expand)==null?void 0:a.warehouse_id,u=can("canViewAudit")?`
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
                    <span class="text-xs" style="color:#6B7280">${esc(Ui(m.created||m.createdAt||m.date||""))}</span>
                  </div>
                  <p class="text-sm mt-1" style="color:#374151">${esc(m.description||m.notes||"Sin detalle")}</p>
                </div>`).join("")}
             </div>`:'<p class="text-sm" style="color:#6B7280">No hay reaperturas ni anulaciones registradas para esta compra.</p>'}
      </div>`:"",b=o.status==="posted"&&i.blocks.length?`
      <div class="mt-4 p-4 rounded-xl text-sm" style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B">
        <div class="font-semibold mb-2"><i class="fas fa-shield-halved mr-2"></i>Bloqueo de reapertura/anulación</div>
        ${i.blocks.map(m=>`<p class="mb-1">• ${esc(m)}</p>`).join("")}
      </div>`:"";openModal(`Factura de Compra — ${esc(o.number)}`,`<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-5">
        <div><span class="form-label">Número</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(o.number)}</p></div>
        <div><span class="form-label">Estado</span><p><span class="badge ${r.badge}">${r.label}</span></p></div>
        <div><span class="form-label">Fecha</span><p>${esc(o.date)}</p></div>
        <div><span class="form-label">Proveedor</span><p>${c?esc(c.name):"—"}</p></div>
        <div><span class="form-label">Ref. proveedor</span><p>${esc(o.supplier_ref||"—")}</p></div>
        <div><span class="form-label">Bodega destino</span><p>${l?esc(l.name):"—"}</p></div>
        ${o.due_date?`<div><span class="form-label">Vencimiento</span><p>${esc(o.due_date)}</p></div>`:""}
        ${o.notes?`<div class="md:col-span-3"><span class="form-label">Notas</span><p>${esc(o.notes)}</p></div>`:""}
      </div>

      <div class="border rounded-xl overflow-hidden mb-4" style="border-color:#F0F0F0">
        <table class="data-table">
          <thead><tr><th>Producto / Servicio</th><th>Descripción</th><th class="text-right">Cant.</th><th class="text-right">P. Unit.</th><th class="text-right">IVA %</th><th class="text-right">Total</th></tr></thead>
          <tbody>
            ${s.map(m=>{var d,y;const p=(d=m.expand)==null?void 0:d.product_id,f=(y=m.expand)==null?void 0:y.account_id;return`<tr>
                <td>${p?`<span class="font-mono text-xs mr-1" style="color:#1A4B8C">${esc(p.code)}</span>${esc(p.name)}`:f?`${esc(f.code)} ${esc(f.name)}`:"—"}</td>
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
      ${b}
      ${u}`,`<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       ${o.status==="draft"&&can("canApprove")?`<button class="btn btn-primary" onclick="closeModal(); contabilizarCompra('${esc(o.id)}', '${esc(o.number)}')"><i class="fas fa-check"></i> Contabilizar</button>`:""}
       ${o.status==="posted"&&requireRole("admin")?`<button class="btn btn-outline" style="border-color:#D97706;color:#D97706" onclick="closeModal(); reopenPurchase('${esc(o.id)}', '${esc(o.number)}')"><i class="fas fa-rotate-left"></i> Reabrir</button>`:""}
       ${o.status==="posted"&&can("canDelete")?`<button class="btn btn-danger" onclick="closeModal(); voidPurchase('${esc(o.id)}', '${esc(o.number)}', 'posted')"><i class="fas fa-ban"></i> Anular</button>`:""}`,!0)}catch(o){showToast(o.message,"error")}}function sl(e){As(e,()=>ba($("#page-content")))}function nl(e,t){if(!can("canApprove"))return showToast("Solo el contador o admin pueden contabilizar","error");confirmDialog("Contabilizar Factura de Compra",`¿Confirmas contabilizar la factura <strong>${esc(t)}</strong>?<br><br>
     Se generará automáticamente:<br>
     • Un asiento contable (FC) en estado <em>Borrador</em> para su aprobación<br>
     • Un movimiento de inventario <em>ENTRADA</em> para los bienes comprados`,async()=>{try{const{inv:a,tx:o}=await API.postPurchaseInvoice(e);showToast(`Factura ${a.number} contabilizada. Asiento ${o.number} generado (pendiente aprobación).`,"success"),ba($("#page-content"))}catch(a){showToast(a.message,"error")}})}function il(e,t){if(!requireRole("admin"))return showToast("Solo el administrador puede reabrir compras contabilizadas","error");ys({title:"Reabrir Compra para Corrección",messageHtml:`
        <p>Se reabrirá la factura <strong>${esc(t)}</strong> y el sistema hará lo siguiente:</p>
        <p class="mt-2">• Anulará el asiento contable vinculado</p>
        <p>• Revertirá el movimiento de inventario asociado</p>
        <p>• Dejará la compra en <em>Borrador</em> para corrección y nueva contabilización</p>`,actionLabel:"Reabrir compra",actionClass:"btn-outline",placeholder:"Explica el motivo de la reapertura aprobada por el administrador"},async a=>{await API.reopenPurchaseInvoice(e,a),showToast(`Factura ${t} reabierta en borrador. Se revirtieron contabilidad e inventario.`,"success"),ba($("#page-content"))})}function rl(e,t,a="draft"){if(!can("canDelete"))return showToast("No tienes permisos para anular","error");ys({title:"Anular Factura de Compra",messageHtml:a==="posted"?`
          <p>Se anulará la factura <strong>${esc(t)}</strong>.</p>
          <p class="mt-2">Para conservar trazabilidad el sistema también anulará el asiento contable y revertirá el movimiento de inventario asociado.</p>`:`<p>Vas a anular la factura <strong>${esc(t)}</strong>. Esta acción dejará el documento inválido para operación.</p>`,actionLabel:"Anular compra",actionClass:"btn-danger",placeholder:"Explica el motivo de la anulación"},async o=>{await API.voidPurchaseInvoice(e,o),showToast(a==="posted"?"Factura anulada. Se revirtieron contabilidad e inventario.":"Factura anulada","success"),ba($("#page-content"))})}function zt(e,t,a,o,s){return`<div class="rounded-2xl p-4" style="background:${s}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${a} text-sm" style="color:${o}"></i>
      <span class="text-xs font-semibold" style="color:${o}">${e}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${o}">${t}</p>
  </div>`}window.savePurchaseConfig=Vi;window.defaultPurchaseConfig=Sa;window.contabilizarCompra=nl;window.openPurchaseForm=As;window.voidPurchase=rl;window.reopenPurchase=il;window._loadComprasPage=Na;window.viewPurchaseDetail=ol;window.getPurchaseConfig=xs;window.PURCHASE_CONFIG_KEY=vs;window.renderCompras=ba;window.PO_IVA_RATES=hs;window.openPurchaseReasonDialog=ys;window.poKpi=zt;window.addDaysToDateStr=vo;window.editPurchase=sl;window.normalizePurchaseConfig=_s;window.renderPoRow=Hi;window.openPurchaseSettingsModal=ji;window.PO_PRODUCT_UNITS=Mi;window.PO_STATUS=gs;window.PO_PRODUCT_TYPES=Bi;window.fmtPurchaseAuditDate=Ui;window.filterPoTable=Gi;const ft={draft:{label:"Borrador",badge:"badge-orange"},posted:{label:"Contabilizada",badge:"badge-green"},paid:{label:"Pagada",badge:"badge-blue"},voided:{label:"Anulada",badge:"badge-red"}},ho={pending:{label:"Pendiente",badge:"badge-orange"},confirmed:{label:"Confirmada",badge:"badge-green"},cancelled:{label:"Cancelada",badge:"badge-red"}},sa={open:{label:"Abierta",badge:"badge-orange"},in_process:{label:"En proceso",badge:"badge-blue"},resolved:{label:"Resuelta",badge:"badge-green"},closed:{label:"Cerrada",badge:"badge-gray"}},na={baja:{label:"Baja",badge:"badge-gray"},media:{label:"Media",badge:"badge-orange"},alta:{label:"Alta",badge:"badge-red"}},ia=[{value:"PETICION",label:"Petición"},{value:"QUEJA",label:"Queja"},{value:"RECLAMO",label:"Reclamo"},{value:"SUGERENCIA",label:"Sugerencia"},{value:"FELICITACION",label:"Felicitación"}],zi=["APARTAMENTO","PARQUEADERO","DEPOSITO","LOCAL","CASA","OFICINA","OTRO"];function Ie(e,t,a,o,s){return`<div class="rounded-2xl p-4" style="background:${s}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${a} text-sm" style="color:${o}"></i>
      <span class="text-xs font-semibold" style="color:${o}">${e}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${o}">${t}</p>
  </div>`}function _t(){const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}`}function Qe(e){if(!e)return"—";const[t,a]=String(e).split("-");return`${["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][(parseInt(a,10)||1)-1]} ${t}`}async function cl(e){e.innerHTML=`<div class="p-8 text-center" style="color:#9CA3AF">
    <i class="fas fa-spinner fa-spin mr-2"></i>Cargando módulo Copropiedades...</div>`,qi(e,"facturacion")}function qi(e,t){const a=[{id:"facturacion",label:"Facturación",icon:"fa-file-invoice-dollar"},{id:"cartera",label:"Cartera",icon:"fa-chart-line"},{id:"unidades",label:"Unidades",icon:"fa-building"},{id:"reservas",label:"Reservas",icon:"fa-calendar-check"},{id:"pqrs",label:"PQRs",icon:"fa-comments"},{id:"config",label:"Configuración",icon:"fa-sliders"}];e.innerHTML=`
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
    <div id="ph-tab-content"></div>`;const o=e.querySelector("#ph-tab-content");function s(n){e.querySelectorAll(".tab-btn").forEach(i=>i.classList.toggle("active",i.dataset.tab===n)),n==="facturacion"&&ga(o),n==="cartera"&&or(o),n==="unidades"&&Ya(o),n==="reservas"&&ra(o),n==="pqrs"&&$s(o),n==="config"&&et(o)}e.querySelectorAll(".tab-btn").forEach(n=>n.addEventListener("click",()=>s(n.dataset.tab))),s(t)}async function ga(e){var t,a,o,s,n,i;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const r=_t(),c=pb.escapeFilterValue(r),[l,u]=await Promise.all([API.getPhInvoices({filter:`period="${c}"`,perPage:200}),API.getPhInvoices({filter:"",perPage:1})]),b=l.items||[],m=u.totalItems||0,p=b.filter(v=>v.status==="posted").length,f=b.filter(v=>v.status==="paid").length,d=b.filter(v=>v.status==="draft").length,y=b.reduce((v,g)=>v+(g.total||0),0);e.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        ${Ie("Facturas del mes",b.length,"fas fa-file-invoice","#7F7CFF","#F5F3FF")}
        ${Ie("Borradores",d,"fas fa-pen-to-square","#C46516","#FFF8F0")}
        ${Ie("Contabilizadas",p,"fas fa-check-circle","#059669","#ECFDF5")}
        ${Ie("Valor del mes",fmt(y),"fas fa-coins","#1A4B8C","#EEF4FF")}
      </div>

      <!-- Barra de acciones -->
      <div class="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3" style="border-color:#F0F0F0">
        <div>
          <label class="form-label mb-1">Período</label>
          <input id="ph-period-filter" type="month" class="form-input" style="max-width:180px" value="${esc(r)}">
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
            Facturas — <span id="ph-period-label">${Qe(r)}</span>
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
              ${La(b)}
            </tbody>
          </table>
        </div>
        ${b.length===0?`
          <div class="py-12 text-center" style="color:#9CA3AF">
            <i class="fas fa-file-invoice text-3xl mb-3 block"></i>
            No hay facturas para este período. Usa <strong>Generar facturas</strong> para crearlas.
          </div>`:""}
      </div>`,(t=document.getElementById("ph-period-filter"))==null||t.addEventListener("change",async v=>{const g=v.target.value;if(!g)return;document.getElementById("ph-period-label").textContent=Qe(g);const h=pb.escapeFilterValue(g),_=await API.getPhInvoices({filter:`period="${h}"`,perPage:200});document.getElementById("ph-inv-tbody").innerHTML=La(_.items||[]),ot()}),(a=document.getElementById("ph-inv-search"))==null||a.addEventListener("input",debounce(()=>{var g;const v=(((g=document.getElementById("ph-inv-search"))==null?void 0:g.value)||"").toLowerCase();document.querySelectorAll("#ph-inv-table tbody tr").forEach(h=>{h.style.display=v&&!h.textContent.toLowerCase().includes(v)?"none":""})},150)),(o=document.getElementById("ph-gen-btn"))==null||o.addEventListener("click",()=>Ki()),(s=document.getElementById("ph-post-period-btn"))==null||s.addEventListener("click",()=>Wi(e)),(n=document.getElementById("ph-unpost-period-btn"))==null||n.addEventListener("click",()=>Yi(e)),(i=document.getElementById("ph-delete-period-btn"))==null||i.addEventListener("click",()=>Ji(e)),ot()}catch(r){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(r.message)}</div>`}}function La(e){return e.length?e.map(t=>{var i,r,c;const a=(i=t.expand)==null?void 0:i.property_id,o=((r=a==null?void 0:a.expand)==null?void 0:r.owner_id)||((c=t.expand)==null?void 0:c["property_id.owner_id"]),s=ft[t.status]||ft.draft,n=t.status==="voided";return`<tr data-id="${esc(t.id)}" style="${n?"opacity:.55":""}">
      <td class="font-mono text-xs">${esc(t.number)}</td>
      <td>
        <span class="font-semibold" style="color:#0D2137">${esc((a==null?void 0:a.name)||(a==null?void 0:a.code)||t.property_id)}</span>
        <br><span class="text-xs" style="color:#9CA3AF">${esc((a==null?void 0:a.unit_type)||"")}</span>
      </td>
      <td class="text-sm">${esc((o==null?void 0:o.name)||"—")}</td>
      <td>${Qe(t.period)}</td>
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
    </tr>`}).join(""):'<tr><td colspan="8" class="text-center py-8" style="color:#9CA3AF">Sin registros</td></tr>'}function ot(){document.querySelectorAll(".ph-inv-view").forEach(e=>{e.addEventListener("click",()=>Wa(e.dataset.id))}),document.querySelectorAll(".ph-inv-add-individual").forEach(e=>{e.addEventListener("click",()=>pr(e.dataset.id))}),document.querySelectorAll(".ph-inv-post").forEach(e=>{e.addEventListener("click",()=>Xi(e.dataset.id,e))}),document.querySelectorAll(".ph-inv-paid").forEach(e=>{e.addEventListener("click",()=>er(e.dataset.id,e))}),document.querySelectorAll(".ph-inv-unpost").forEach(e=>{e.addEventListener("click",()=>tr(e.dataset.id,e))}),document.querySelectorAll(".ph-inv-void").forEach(e=>{e.addEventListener("click",()=>ar(e.dataset.id))})}function Wi(e){var a;const t=((a=document.getElementById("ph-period-filter"))==null?void 0:a.value)||_t();openModal("Contabilizar Liquidación del Período",`<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción contabilizará en lote todas las facturas en estado <strong>Borrador</strong> del período <strong>${Qe(t)}</strong>.
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
     <button class="btn btn-primary" id="ph-post-period-confirm-btn"><i class="fas fa-layer-group mr-1"></i>Contabilizar</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-post-period-confirm-btn"))==null||o.addEventListener("click",async()=>{var i;if((((i=document.getElementById("ph-post-period-confirm"))==null?void 0:i.value)||"").trim()!==t){showToast(`Debes escribir exactamente ${t}.`,"warning");return}const n=document.getElementById("ph-post-period-confirm-btn");n&&(n.disabled=!0,n.textContent="Procesando...");try{const r=await API.postPhInvoicesByPeriod(t);showToast(`Período ${t}: ${r.posted} contabilizadas, ${r.skipped} omitidas, ${r.failed} fallidas.`,r.failed?"warning":"success"),closeModal(),ga(e)}catch(r){showToast(r.message||"Error al contabilizar período.","error"),n&&(n.disabled=!1,n.innerHTML='<i class="fas fa-layer-group mr-1"></i>Contabilizar')}},{once:!0})},50)}function Yi(e){var a;const t=((a=document.getElementById("ph-period-filter"))==null?void 0:a.value)||_t();openModal("Descontabilizar Liquidación del Período",`<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción quitará la contabilización de todas las facturas del período <strong>${Qe(t)}</strong>.
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
     <button class="btn btn-primary" id="ph-unpost-period-confirm-btn"><i class="fas fa-rotate-left mr-1"></i>Descontabilizar</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-unpost-period-confirm-btn"))==null||o.addEventListener("click",async()=>{var i;if((((i=document.getElementById("ph-unpost-period-confirm"))==null?void 0:i.value)||"").trim()!==t){showToast(`Debes escribir exactamente ${t}.`,"warning");return}const n=document.getElementById("ph-unpost-period-confirm-btn");n&&(n.disabled=!0,n.textContent="Procesando...");try{const r=await API.unpostPhInvoicesByPeriod(t);showToast(`Período ${t}: ${r.reverted} facturas descontabilizadas.`,"success"),closeModal(),ga(e)}catch(r){showToast(r.message||"Error al descontabilizar período.","error"),n&&(n.disabled=!1,n.innerHTML='<i class="fas fa-rotate-left mr-1"></i>Descontabilizar')}},{once:!0})},50)}function Ji(e){var a;const t=((a=document.getElementById("ph-period-filter"))==null?void 0:a.value)||_t();openModal("Eliminar Liquidación del Período",`<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción eliminará todas las facturas del período <strong>${Qe(t)}</strong>.
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
     <button class="btn btn-danger" id="ph-delete-period-confirm-btn"><i class="fas fa-trash mr-1"></i>Eliminar Todo</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-delete-period-confirm-btn"))==null||o.addEventListener("click",async()=>{var r;const s=(((r=document.getElementById("ph-delete-period-confirm"))==null?void 0:r.value)||"").trim().toUpperCase(),n=`ELIMINAR ${t}`.toUpperCase();if(s!==n){showToast(`Debes escribir exactamente: ${n}`,"warning");return}const i=document.getElementById("ph-delete-period-confirm-btn");i&&(i.disabled=!0,i.textContent="Eliminando...");try{const c=await API.deletePhInvoicesByPeriod(t);showToast(`Período ${t}: ${c.deleted} facturas eliminadas.`,"success"),closeModal(),ga(e)}catch(c){showToast(c.message||"Error al eliminar período.","error"),i&&(i.disabled=!1,i.innerHTML='<i class="fas fa-trash mr-1"></i>Eliminar Todo')}},{once:!0})},50)}function Ki(){var o;const e=((o=document.getElementById("ph-period-filter"))==null?void 0:o.value)||_t(),[t,a]=e.split("-").map(Number);a===12?t+1:`${t}${String(a+1).padStart(2,"0")}`,openModal("Generar Facturas del Período",`<div class="space-y-4">
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
     </button>`),setTimeout(()=>{var s;(s=document.getElementById("ph-gen-confirm-btn"))==null||s.addEventListener("click",async()=>{var c,l;const n=(c=document.getElementById("ph-gen-period"))==null?void 0:c.value,i=(l=document.getElementById("ph-gen-due"))==null?void 0:l.value,r=document.getElementById("ph-gen-confirm-btn");if(!n){showToast("Selecciona un período.","warning");return}r.disabled=!0,r.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Generando...';try{const u=await API.generatePhInvoices(n,i);showToast(`${u} facturas generadas para ${Qe(n)}.`,"success"),closeModal();const b=document.getElementById("ph-period-filter");b&&(b.value=n);const m=document.getElementById("ph-inv-tbody");if(m){const p=pb.escapeFilterValue(n),f=await API.getPhInvoices({filter:`period="${p}"`,perPage:200});m.innerHTML=La(f.items||[]),ot()}}catch(u){showToast(u.message||"Error al generar facturas.","error"),r.disabled=!1,r.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> Generar'}},{once:!0})},50)}async function Wa(e){var t,a,o,s;try{const[n,i]=await Promise.all([pb.get("ph_invoices",e,{expand:"property_id,property_id.owner_id,tx_id"}),API.getPhInvoiceLines(e)]),r=(t=n.expand)==null?void 0:t.property_id,c=(a=r==null?void 0:r.expand)==null?void 0:a.owner_id,l=ft[n.status]||ft.draft,u=n.status==="draft",b=p=>/inter[eé]s de mora/i.test(String((p==null?void 0:p.description)||"")),m=p=>u&&!(p!=null&&p.concept_id)&&!b(p);openModal(`Factura ${n.number}`,`<div class="space-y-4">
        <div class="grid grid-cols-2 gap-3 p-3 rounded-xl" style="background:#F8FAFF">
          <div><p class="text-xs" style="color:#6B7280">Unidad</p><p class="font-bold" style="color:#0D2137">${esc((r==null?void 0:r.name)||(r==null?void 0:r.code)||n.property_id)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Tipo</p><p class="font-semibold" style="color:#374151">${esc((r==null?void 0:r.unit_type)||"—")}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Propietario</p><p class="font-semibold" style="color:#374151">${esc((c==null?void 0:c.name)||"—")}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Período</p><p class="font-semibold" style="color:#374151">${Qe(n.period)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Fecha</p><p class="font-semibold" style="color:#374151">${esc(n.date)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Vence</p><p class="font-semibold" style="color:#374151">${esc(n.due_date||"—")}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Estado</p><span class="badge ${l.badge}">${l.label}</span></div>
          ${n.tx_id?`<div><p class="text-xs" style="color:#6B7280">Asiento</p><p class="font-mono text-xs" style="color:#374151">${esc(((s=(o=n.expand)==null?void 0:o.tx_id)==null?void 0:s.number)||n.tx_id)}</p></div>`:""}
        </div>
        <table class="data-table text-sm">
          <thead><tr><th>Concepto</th><th class="text-right">Valor</th>${u?"<th>Acciones</th>":""}</tr></thead>
          <tbody>
            ${i.map(p=>`<tr>
              <td>${esc(p.description)}</td>
              <td class="text-right font-semibold">${fmt(p.amount||0)}</td>
              ${u?`<td>
                ${m(p)?`<div class="flex gap-1">
                  <button class="btn btn-outline btn-sm ph-line-edit" data-line-id="${esc(p.id)}" data-inv-id="${esc(n.id)}" title="Editar línea"><i class="fas fa-pen"></i></button>
                  <button class="btn btn-outline btn-sm ph-line-del" data-line-id="${esc(p.id)}" data-inv-id="${esc(n.id)}" title="Eliminar línea" style="color:#DC2626;border-color:#FECACA"><i class="fas fa-trash"></i></button>
                </div>`:'<span class="text-xs" style="color:#9CA3AF">No editable</span>'}
              </td>`:""}
            </tr>`).join("")}
            <tr style="border-top:2px solid #E5E7EB">
              <td class="font-bold" style="color:#0D2137">TOTAL</td>
              <td class="text-right font-bold text-lg" style="color:#0D2137">${fmt(n.total||0)}</td>
              ${u?"<td></td>":""}
            </tr>
          </tbody>
        </table>
      </div>`,'<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>'),u&&setTimeout(()=>{document.querySelectorAll(".ph-line-edit").forEach(p=>{p.addEventListener("click",()=>Qi(p.dataset.lineId,p.dataset.invId))}),document.querySelectorAll(".ph-line-del").forEach(p=>{p.addEventListener("click",()=>Zi(p.dataset.lineId,p.dataset.invId))})},30)}catch(n){showToast(n.message||"Error al cargar la factura.","error")}}async function Qi(e,t){let a;try{a=await pb.get("ph_invoice_lines",e)}catch{showToast("No se pudo cargar la línea.","error");return}openModal("Editar Concepto Manual",`<div class="space-y-4">
      <div class="form-group mb-0">
        <label class="form-label">Descripción <span class="text-red-500">*</span></label>
        <input id="ph-line-edit-desc" class="form-input" value="${esc(a.description||"")}">
      </div>
      <div class="form-group mb-0">
        <label class="form-label">Valor <span class="text-red-500">*</span></label>
        <input id="ph-line-edit-amount" type="number" min="0" step="1" class="form-input" value="${esc(a.amount||0)}">
      </div>
    </div>`,`<button class="btn btn-outline" onclick="openPhInvoiceDetail('${esc(t)}')">Cancelar</button>
     <button class="btn btn-primary" id="ph-line-edit-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var o;(o=document.getElementById("ph-line-edit-save-btn"))==null||o.addEventListener("click",async()=>{var r,c;const s=(((r=document.getElementById("ph-line-edit-desc"))==null?void 0:r.value)||"").trim(),n=parseFloat(((c=document.getElementById("ph-line-edit-amount"))==null?void 0:c.value)||0)||0;if(!s||n<=0){showToast("Descripción y valor son obligatorios.","warning");return}const i=document.getElementById("ph-line-edit-save-btn");i&&(i.disabled=!0,i.textContent="Guardando...");try{await API.updatePhDraftInvoiceLine(e,{description:s,amount:n,account_code:a.account_code||""}),showToast("Línea actualizada.","success"),Wa(t)}catch(l){showToast(l.message||"Error al actualizar línea.","error"),i&&(i.disabled=!1,i.innerHTML='<i class="fas fa-save mr-1"></i>Guardar')}},{once:!0})},40)}async function Zi(e,t){if(confirm("¿Eliminar este concepto manual de la factura?"))try{await API.deletePhDraftInvoiceLine(e),showToast("Línea eliminada.","success"),Wa(t)}catch(a){showToast(a.message||"Error al eliminar línea.","error")}}async function Xi(e,t){if(confirm("¿Contabilizar esta factura? Se generará el asiento contable correspondiente.")){t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i>');try{await API.postPhInvoice(e),showToast("Factura contabilizada correctamente.","success");const a=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);if(a){const o=await pb.get("ph_invoices",e,{expand:"property_id,property_id.owner_id"}),s=ft[o.status];a.querySelector("td:nth-child(7)").innerHTML=`<span class="badge ${s.badge}">${s.label}</span>`,a.querySelector("td:nth-child(8)").innerHTML=`
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(o.id)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          <button class="btn btn-sm ph-inv-paid" data-id="${esc(o.id)}" title="Marcar pagada"
            style="background:#EEF4FF;color:#2446B8;border:1.5px solid #93C5FD"><i class="fas fa-coins"></i></button>
          ${can("canApprove")?`<button class="btn btn-outline btn-sm ph-inv-unpost" data-id="${esc(o.id)}" title="Descontabilizar factura"
            style="color:#1A4B8C;border-color:#93C5FD"><i class="fas fa-rotate-left"></i></button>`:""}
          <button class="btn btn-outline btn-sm ph-inv-void" data-id="${esc(o.id)}" title="Anular"
            style="color:#DC2626;border-color:#FECACA"><i class="fas fa-ban"></i></button>
        </div>`,ot()}}catch(a){showToast(a.message||"Error al contabilizar.","error"),t&&(t.disabled=!1,t.innerHTML='<i class="fas fa-check"></i>')}}}async function er(e,t){if(confirm("¿Marcar esta factura como pagada?")){t&&(t.disabled=!0);try{await API.markPhInvoicePaid(e),showToast("Factura marcada como pagada.","success");const a=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);a&&(a.querySelector("td:nth-child(7)").innerHTML='<span class="badge badge-blue">Pagada</span>',a.querySelector("td:nth-child(8)").innerHTML=`
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(e)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          ${can("canApprove")?`<button class="btn btn-outline btn-sm ph-inv-unpost" data-id="${esc(e)}" title="Descontabilizar factura"
            style="color:#1A4B8C;border-color:#93C5FD"><i class="fas fa-rotate-left"></i></button>`:""}
        </div>`,ot())}catch(a){showToast(a.message||"Error.","error"),t&&(t.disabled=!1)}}}async function tr(e,t){if(confirm("¿Descontabilizar esta factura? Volverá a estado Borrador y se desligará del asiento.")){t&&(t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i>');try{await API.unpostPhInvoice(e),showToast("Factura descontabilizada correctamente.","success");const a=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);if(a){const o=ft.draft||{badge:"badge-orange",label:"Borrador"};a.style.opacity="",a.querySelector("td:nth-child(7)").innerHTML=`<span class="badge ${o.badge}">${o.label}</span>`,a.querySelector("td:nth-child(8)").innerHTML=`
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(e)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm ph-inv-add-individual" data-id="${esc(e)}" title="Añadir concepto individual"
            style="color:#7F7CFF;border-color:#C4B5FD"><i class="fas fa-plus-circle"></i></button>
          <button class="btn btn-sm ph-inv-post" data-id="${esc(e)}" title="Contabilizar"
            style="background:#ECFDF5;color:#059669;border:1.5px solid #6EE7B7"><i class="fas fa-check"></i></button>
          <button class="btn btn-outline btn-sm ph-inv-void" data-id="${esc(e)}" title="Anular"
            style="color:#DC2626;border-color:#FECACA"><i class="fas fa-ban"></i></button>
        </div>`,ot()}}catch(a){showToast(a.message||"Error al descontabilizar factura.","error"),t&&(t.disabled=!1,t.innerHTML='<i class="fas fa-rotate-left"></i>')}}}function ar(e){openModal("Anular Factura PH",`<div class="space-y-4">
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
            <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(e)}" title="Ver detalle"><i class="fas fa-eye"></i></button>`,ot())}catch(n){showToast(n.message||"Error al anular.","error"),o&&(o.disabled=!1,o.textContent="Anular")}},{once:!0})},50)}async function or(e){var t,a,o;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando cartera...</div>';try{let s=function(){const m=new Date,p=m.getFullYear(),f=String(m.getMonth()+1).padStart(2,"0"),d=String(m.getDate()).padStart(2,"0");return`${p}${f}${d}`},n=function(m){const p=document.getElementById("ph-cartera-integrity");if(!p)return;if(!m){p.innerHTML="";return}const f=m.isBalanced?{bg:"#ECFDF5",border:"#6EE7B7",color:"#065F46",icon:"fa-circle-check",title:"Integridad OK"}:{bg:"#FFF7ED",border:"#FDBA74",color:"#9A3412",icon:"fa-triangle-exclamation",title:"Descuadres detectados"};p.innerHTML=`
        <div class="rounded-2xl border p-4" style="background:${f.bg};border-color:${f.border}">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div class="font-bold" style="color:${f.color}">
              <i class="fas ${f.icon} mr-2"></i>${f.title}
            </div>
            <div class="text-sm" style="color:${f.color}">
              Facturas: <strong>${m.totals.invoices}</strong> | Líneas: <strong>${m.totals.lines}</strong>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm" style="color:${f.color}">
            <div>Total facturas: <strong>${fmt(m.totals.totalFacturas)}</strong></div>
            <div>Total líneas: <strong>${fmt(m.totals.totalLineas)}</strong></div>
            <div>Pendiente: <strong>${fmt(m.totals.totalPendiente)}</strong></div>
            <div>Cancelado: <strong>${fmt(m.totals.totalCancelado)}</strong></div>
            <div>Diferencia global: <strong>${fmt(m.totals.diferenciaGlobal)}</strong></div>
          </div>
          ${m.mismatches.length?`
            <div class="mt-3 text-sm" style="color:${f.color}">
              <div class="font-semibold mb-1">Facturas descuadradas (Top ${Math.min(5,m.mismatches.length)}):</div>
              ${m.mismatches.slice(0,5).map(d=>`<div>#${esc(d.number)} (${esc(d.period)}): Factura ${fmt(d.totalFactura)} vs Líneas ${fmt(d.totalLineas)} (dif ${fmt(d.diferencia)})</div>`).join("")}
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
      </div>`,e.querySelectorAll(".cartera-tab-btn").forEach(m=>{m.addEventListener("click",()=>{e.querySelectorAll(".cartera-tab-btn").forEach(f=>f.classList.toggle("active",f===m));const p=m.dataset.tab;e.querySelectorAll(".cartera-tab-content").forEach(f=>f.style.display="none"),e.querySelector(`#ph-cartera-${p}`).style.display=""})});let r=null,c=null;async function l(){var p,f,d,y,v,g;if(!((p=r==null?void 0:r.rows)!=null&&p.length)){showToast("No hay datos para exportar en Saldos CxC.","warning");return}const m=typeof getPdfCtorOrWarn=="function"?getPdfCtorOrWarn():null;if(m)try{const h=typeof getPdfHeaderContext=="function"?await getPdfHeaderContext():{companyName:"GRAVY",companyNit:"N/A",companyAddress:"",softwareName:"GRAVY v2.0",userName:String(sessionStorage.getItem("user_name")||"Usuario").trim(),generatedAt:new Date().toLocaleString("es-CO")},_=new m({orientation:"landscape",unit:"pt",format:"letter"}),A=document.getElementById("ph-cartera-unit-filter"),I=((y=(d=(f=A==null?void 0:A.selectedOptions)==null?void 0:f[0])==null?void 0:d.textContent)==null?void 0:y.trim())||"Todas las unidades",F=((v=document.getElementById("ph-cartera-from"))==null?void 0:v.value)||"—",S=((g=document.getElementById("ph-cartera-to"))==null?void 0:g.value)||"—",x=typeof drawPdfHeader=="function"?drawPdfHeader(_,h,{title:"Copropiedades - Saldos CxC por Concepto",subtitles:[`Unidad: ${I}`,`Periodo: ${F} a ${S}`]}):{marginLeft:24,marginRight:_.internal.pageSize.getWidth()-24,startY:50},T=[["Unidad",...r.concepts.map(C=>C.label),"Total general"]],E=r.rows.map(C=>[C.unidad,...r.concepts.map(N=>{const L=Number(C.byConcept[N.id]||0);return L?typeof fmtPdfNum=="function"?fmtPdfNum(L):fmt(L):""}),typeof fmtPdfNum=="function"?fmtPdfNum(C.totalGeneral||0):fmt(C.totalGeneral||0)]);E.push(["TOTAL",...r.concepts.map(C=>{const N=Number(r.totalByConcept[C.id]||0);return N?typeof fmtPdfNum=="function"?fmtPdfNum(N):fmt(N):""}),typeof fmtPdfNum=="function"?fmtPdfNum(r.grandTotal||0):fmt(r.grandTotal||0)]),_.autoTable({startY:x.startY,head:T,body:E,theme:"plain",margin:{top:x.startY,left:x.marginLeft,right:24,bottom:24},styles:{font:"helvetica",fontSize:7,textColor:[55,55,55],cellPadding:2.2,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:7.2,lineWidth:{bottom:.25}},didParseCell:C=>{if(C.section!=="body")return;C.row.index===E.length-1&&(C.cell.styles.fontStyle="bold",C.cell.styles.fillColor=[236,236,236],C.cell.styles.textColor=[13,33,55],C.cell.styles.lineWidth={top:.2},C.cell.styles.lineColor=[13,33,55]),C.column.index>0&&(C.cell.styles.halign="right")},didDrawPage:C=>{typeof drawPdfFooter=="function"&&drawPdfFooter(_,C.pageNumber)}}),_.save(`ph_saldos_cxc_${s()}.pdf`)}catch(h){showToast(`Error al generar PDF: ${h.message}`,"error")}}async function u(){var p,f,d,y,v,g,h;if(!((p=c==null?void 0:c.rows)!=null&&p.length)){showToast("No hay datos para exportar en Cartera por Edades.","warning");return}const m=typeof getPdfCtorOrWarn=="function"?getPdfCtorOrWarn():null;if(m)try{const _=typeof getPdfHeaderContext=="function"?await getPdfHeaderContext():{companyName:"GRAVY",companyNit:"N/A",companyAddress:"",softwareName:"GRAVY v2.0",userName:String(sessionStorage.getItem("user_name")||"Usuario").trim(),generatedAt:new Date().toLocaleString("es-CO")},A=new m({orientation:"landscape",unit:"pt",format:"letter"}),I=document.getElementById("ph-cartera-unit-filter"),F=((y=(d=(f=I==null?void 0:I.selectedOptions)==null?void 0:f[0])==null?void 0:d.textContent)==null?void 0:y.trim())||"Todas las unidades",S=((v=document.getElementById("ph-cartera-from"))==null?void 0:v.value)||"—",x=((g=document.getElementById("ph-cartera-to"))==null?void 0:g.value)||"—",T=typeof drawPdfHeader=="function"?drawPdfHeader(A,_,{title:"Copropiedades - Cartera por Edades",subtitles:[`Unidad: ${F}`,`Periodo: ${S} a ${x}`]}):{marginLeft:24,marginRight:A.internal.pageSize.getWidth()-24,startY:50},E=c.rows,C=[];let N=null,L={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0};for(let O=0;O<E.length;O++){const M=E[O];N!==M.unidad&&(N=M.unidad,L={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0}),C.push([M.unidad,M.concepto,"","","","",typeof fmtPdfNum=="function"?fmtPdfNum(M.por_vencer||0):fmt(M.por_vencer||0),typeof fmtPdfNum=="function"?fmtPdfNum(M.de_0_a_30||0):fmt(M.de_0_a_30||0),typeof fmtPdfNum=="function"?fmtPdfNum(M.de_31_a_60||0):fmt(M.de_31_a_60||0),typeof fmtPdfNum=="function"?fmtPdfNum(M.de_61_a_90||0):fmt(M.de_61_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(M.mayor_a_90||0):fmt(M.mayor_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(M.total||0):fmt(M.total||0)]),L.por_vencer+=M.por_vencer,L.de_0_a_30+=M.de_0_a_30,L.de_31_a_60+=M.de_31_a_60,L.de_61_a_90+=M.de_61_a_90,L.mayor_a_90+=M.mayor_a_90,L.total+=M.total,((h=E[O+1])==null?void 0:h.unidad)!==N&&C.push([`Subtotal ${N}`,"","","","","",typeof fmtPdfNum=="function"?fmtPdfNum(L.por_vencer):fmt(L.por_vencer),typeof fmtPdfNum=="function"?fmtPdfNum(L.de_0_a_30):fmt(L.de_0_a_30),typeof fmtPdfNum=="function"?fmtPdfNum(L.de_31_a_60):fmt(L.de_31_a_60),typeof fmtPdfNum=="function"?fmtPdfNum(L.de_61_a_90):fmt(L.de_61_a_90),typeof fmtPdfNum=="function"?fmtPdfNum(L.mayor_a_90):fmt(L.mayor_a_90),typeof fmtPdfNum=="function"?fmtPdfNum(L.total):fmt(L.total)])}C.push(["TOTAL","","","","","",typeof fmtPdfNum=="function"?fmtPdfNum(c.totals.por_vencer||0):fmt(c.totals.por_vencer||0),typeof fmtPdfNum=="function"?fmtPdfNum(c.totals.de_0_a_30||0):fmt(c.totals.de_0_a_30||0),typeof fmtPdfNum=="function"?fmtPdfNum(c.totals.de_31_a_60||0):fmt(c.totals.de_31_a_60||0),typeof fmtPdfNum=="function"?fmtPdfNum(c.totals.de_61_a_90||0):fmt(c.totals.de_61_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(c.totals.mayor_a_90||0):fmt(c.totals.mayor_a_90||0),typeof fmtPdfNum=="function"?fmtPdfNum(c.totals.total||0):fmt(c.totals.total||0)]),A.autoTable({startY:T.startY,head:[["Unidad","Concepto","","","","","Por Vencer","0-30","31-60","61-90","Mas de 90","Total"]],body:C,theme:"plain",margin:{top:T.startY,left:T.marginLeft,right:24,bottom:24},styles:{font:"helvetica",fontSize:6.8,textColor:[55,55,55],cellPadding:2.1,lineWidth:0},headStyles:{fillColor:[230,230,230],textColor:[13,33,55],fontStyle:"bold",fontSize:7,lineWidth:{bottom:.25}},columnStyles:{0:{cellWidth:110},1:{cellWidth:95},2:{cellWidth:20},3:{cellWidth:20},4:{cellWidth:20},5:{cellWidth:20},6:{cellWidth:58,halign:"right"},7:{cellWidth:47,halign:"right"},8:{cellWidth:47,halign:"right"},9:{cellWidth:47,halign:"right"},10:{cellWidth:54,halign:"right"},11:{cellWidth:55,halign:"right"}},didParseCell:O=>{var j;if(O.section!=="body")return;const M=O.row.index===C.length-1,B=(j=O.row.raw[0])==null?void 0:j.startsWith("Subtotal ");(M||B)&&(O.cell.styles.fontStyle="bold",O.cell.styles.fillColor=[236,236,236],O.cell.styles.textColor=[13,33,55],O.cell.styles.lineWidth={top:.2},O.cell.styles.lineColor=[13,33,55])},didDrawPage:O=>{typeof drawPdfFooter=="function"&&drawPdfFooter(A,O.pageNumber)}}),A.save(`ph_cartera_edades_${s()}.pdf`)}catch(_){showToast(`Error al generar PDF: ${_.message}`,"error")}}async function b(){var _,A,I;const m=((_=document.getElementById("ph-cartera-unit-filter"))==null?void 0:_.value)||"",p=((A=document.getElementById("ph-cartera-to"))==null?void 0:A.value)||"",f=((I=document.getElementById("ph-cartera-concept-filter"))==null?void 0:I.value)||"",d=document.getElementById("ph-cartera-resumen-thead"),y=document.getElementById("ph-cartera-resumen-colgroup"),v=F=>String(F||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toUpperCase(),h=(await API.getPhCarteraOpenParties(m,"",p,{conceptoId:f,estado:"all"})).filter(F=>F.estado!=="cancelado");try{const[F,S]=await Promise.all([API.getPhCarteraByUnit(m,"",p),API.getPhCarteraIntegrity(m,"",p)]);n(S);const x=document.getElementById("ph-cartera-concept-filter");if(x){const T=x.value;x.innerHTML=`<option value="">— Todos —</option>${F.map(E=>`<option value="${esc(E.conceptoId)}">${esc(E.concepto)}</option>`).join("")}`,x.value=T}if(F.length===0||h.length===0){y&&(y.innerHTML=`
              <col style="width:260px">
              <col style="width:160px">`),d&&(d.innerHTML=`
            <tr>
              <th>Unidad</th>
              <th class="text-right">Total general</th>
            </tr>`),document.getElementById("ph-cartera-resumen-tbody").innerHTML=`
            <tr><td colspan="2" class="text-center py-4" style="color:#9CA3AF">No hay saldos abiertos para los filtros seleccionados.</td></tr>`,document.getElementById("ph-cartera-resumen-tfoot").innerHTML="",document.getElementById("ph-cartera-bal-meta").innerHTML='<i class="fas fa-info-circle mr-1"></i>Sin datos de saldo abierto.',r=null;const T=document.getElementById("ph-cartera-pdf-bal");T&&(T.disabled=!0)}else{const T=new Map;for(const j of h){const Y=String(j.concepto||"Concepto").trim()||"Concepto",W=v(Y);T.has(W)||T.set(W,Y)}const E=[...T.entries()].map(([j,Y])=>({id:j,label:Y})).sort((j,Y)=>j.label.localeCompare(Y.label,"es")),C=new Map;for(const j of h){const Y=[j.propertyCode,j.propertyName].filter(Boolean).join(" - ")||"Unidad",W=`${j.propertyId}|${Y}`;C.has(W)||C.set(W,{unidad:Y,byConcept:{},totalGeneral:0});const K=C.get(W),H=v(j.concepto||"Concepto");K.byConcept[H]=(K.byConcept[H]||0)+Number(j.amount||0),K.totalGeneral+=Number(j.amount||0)}const N=[...C.values()].sort((j,Y)=>j.unidad.localeCompare(Y.unidad,"es")),L={};let O=0;for(const j of N){O+=Number(j.totalGeneral||0);for(const Y of E)L[Y.id]=(L[Y.id]||0)+Number(j.byConcept[Y.id]||0)}const M=new Set(h.map(j=>String(j.invoiceId||""))).size;document.getElementById("ph-cartera-bal-meta").innerHTML=`Unidades: <strong>${fmtN(N.length)}</strong> · Conceptos: <strong>${fmtN(E.length)}</strong> · Documentos: <strong>${fmtN(M)}</strong> · Saldo abierto: <strong>${fmt(O)}</strong>`,y&&(y.innerHTML=`
              <col style="width:260px">
              ${E.map(()=>'<col style="width:150px">').join("")}
              <col style="width:170px">`),d&&(d.innerHTML=`
            <tr>
              <th>Unidad</th>
              ${E.map(j=>`<th class="text-right">${esc(j.label)}</th>`).join("")}
              <th class="text-right">Total general</th>
            </tr>`),document.getElementById("ph-cartera-resumen-tbody").innerHTML=N.map(j=>`
            <tr>
              <td>${esc(j.unidad)}</td>
              ${E.map(Y=>{const W=Number(j.byConcept[Y.id]||0);return`<td class="text-right">${W?fmt(W):""}</td>`}).join("")}
              <td class="text-right font-semibold" style="color:#065F46">${fmt(j.totalGeneral)}</td>
            </tr>`).join(""),document.getElementById("ph-cartera-resumen-tfoot").innerHTML=`
            <tr>
              <td class="font-bold">Total general</td>
              ${E.map(j=>`<td class="font-bold text-right">${L[j.id]?fmt(L[j.id]):""}</td>`).join("")}
              <td class="font-bold text-right">${fmt(O)}</td>
            </tr>`,r={concepts:E,rows:N,totalByConcept:L,grandTotal:O};const B=document.getElementById("ph-cartera-pdf-bal");B&&(B.disabled=!1)}}catch(F){console.error(F),y&&(y.innerHTML=`
            <col style="width:260px">
            <col style="width:160px">`),d&&(d.innerHTML=`
          <tr>
            <th>Unidad</th>
            <th class="text-right">Total general</th>
          </tr>`),document.getElementById("ph-cartera-resumen-tbody").innerHTML=`
          <tr><td colspan="2" class="text-center py-4" style="color:#EF4444">${esc(F.message)}</td></tr>`,document.getElementById("ph-cartera-resumen-tfoot").innerHTML="",n(null),r=null;const S=document.getElementById("ph-cartera-pdf-bal");S&&(S.disabled=!0)}try{if(h.length===0){document.getElementById("ph-cartera-detalle-tbody").innerHTML=`
            <tr><td colspan="12" class="text-center py-4" style="color:#9CA3AF">No hay cartera abierta para los filtros seleccionados.</td></tr>`,document.getElementById("ph-cartera-detalle-tfoot").innerHTML="",document.getElementById("ph-cartera-aging-meta").innerHTML='<i class="fas fa-info-circle mr-1"></i>Sin datos de cartera por edades.',c=null;const F=document.getElementById("ph-cartera-pdf-aging");F&&(F.disabled=!0)}else{const F=N=>{const L=Number(N||0);return L<0?"por_vencer":L<=30?"b0_30":L<=60?"b31_60":L<=90?"b61_90":"b90p"},S={};for(const N of h){const L=F(N.diasMoraRaw!==void 0?N.diasMoraRaw:N.diasMora),O=Number(N.amount||0),M=[N.propertyCode,N.propertyName].filter(Boolean).join(" - ")||"Unidad",B=N.concepto||"Concepto";S[M]||(S[M]={}),S[M][B]||(S[M][B]={unidad:M,concepto:B,por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0});const j=S[M][B];L==="por_vencer"?j.por_vencer+=O:L==="b0_30"?j.de_0_a_30+=O:L==="b31_60"?j.de_31_a_60+=O:L==="b61_90"?j.de_61_a_90+=O:L==="b90p"&&(j.mayor_a_90+=O),j.total+=O}const x=[],T=[];let E={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0};Object.keys(S).sort((N,L)=>N.localeCompare(L,"es")).forEach(N=>{const L=S[N];let O={por_vencer:0,de_0_a_30:0,de_31_a_60:0,de_61_a_90:0,mayor_a_90:0,total:0};T.push(`<tr style="background:#F0F4F8">
              <td colspan="12" style="font-weight:600;padding:5px 10px;font-size:12px;color:#0D2137;border-top:1px solid #D1D5DB">
                <i class="fas fa-building mr-1" style="color:#E87D1E"></i>${esc(N)}
              </td>
            </tr>`),Object.keys(L).sort((M,B)=>M.localeCompare(B,"es")).forEach(M=>{const B=L[M];T.push(`<tr>
                <td>${esc(B.unidad)}</td>
                <td>${esc(B.concepto)}</td>
                <td colspan="4"></td>
                <td class="text-right" style="color:#059669">${fmt(B.por_vencer)}</td>
                <td class="text-right">${fmt(B.de_0_a_30)}</td>
                <td class="text-right">${fmt(B.de_31_a_60)}</td>
                <td class="text-right">${fmt(B.de_61_a_90)}</td>
                <td class="text-right font-semibold">${fmt(B.mayor_a_90)}</td>
                <td class="text-right font-semibold" style="color:#0D2137">${fmt(B.total)}</td>
              </tr>`),x.push({...B}),O.por_vencer+=B.por_vencer,O.de_0_a_30+=B.de_0_a_30,O.de_31_a_60+=B.de_31_a_60,O.de_61_a_90+=B.de_61_a_90,O.mayor_a_90+=B.mayor_a_90,O.total+=B.total}),T.push(`<tr style="background:#FDF6E3">
              <td colspan="6" class="font-bold">Subtotal ${esc(N)}</td>
              <td class="font-bold text-right" style="color:#059669">${fmt(O.por_vencer)}</td>
              <td class="font-bold text-right">${fmt(O.de_0_a_30)}</td>
              <td class="font-bold text-right">${fmt(O.de_31_a_60)}</td>
              <td class="font-bold text-right">${fmt(O.de_61_a_90)}</td>
              <td class="font-bold text-right">${fmt(O.mayor_a_90)}</td>
              <td class="font-bold text-right">${fmt(O.total)}</td>
            </tr>`),E.por_vencer+=O.por_vencer,E.de_0_a_30+=O.de_0_a_30,E.de_31_a_60+=O.de_31_a_60,E.de_61_a_90+=O.de_61_a_90,E.mayor_a_90+=O.mayor_a_90,E.total+=O.total}),document.getElementById("ph-cartera-aging-meta").innerHTML=`Unidades: <strong>${Object.keys(S).length}</strong> · Total: <strong>${fmt(E.total)}</strong>`,document.getElementById("ph-cartera-detalle-tbody").innerHTML=T.join(""),document.getElementById("ph-cartera-detalle-tfoot").innerHTML=`
            <tr>
              <td colspan="6" class="font-bold">Total general</td>
              <td class="font-bold text-right" style="color:#059669">${fmt(E.por_vencer)}</td>
              <td class="font-bold text-right">${fmt(E.de_0_a_30)}</td>
              <td class="font-bold text-right">${fmt(E.de_31_a_60)}</td>
              <td class="font-bold text-right">${fmt(E.de_61_a_90)}</td>
              <td class="font-bold text-right">${fmt(E.mayor_a_90)}</td>
              <td class="font-bold text-right">${fmt(E.total)}</td>
            </tr>`,c={rows:x,totals:E};const C=document.getElementById("ph-cartera-pdf-aging");C&&(C.disabled=!1)}}catch(F){console.error(F),document.getElementById("ph-cartera-detalle-tbody").innerHTML=`
          <tr><td colspan="12" class="text-center py-4" style="color:#EF4444">${esc(F.message)}</td></tr>`,document.getElementById("ph-cartera-detalle-tfoot").innerHTML="",c=null;const S=document.getElementById("ph-cartera-pdf-aging");S&&(S.disabled=!0)}}(t=document.getElementById("ph-cartera-refresh-btn"))==null||t.addEventListener("click",b),(a=document.getElementById("ph-cartera-pdf-bal"))==null||a.addEventListener("click",l),(o=document.getElementById("ph-cartera-pdf-aging"))==null||o.addEventListener("click",u)}catch(s){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(s.message)}</div>`}}async function Ya(e){var t,a;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const o=await API.getPhProperties(!1),s=can("canWrite"),n=o.filter(r=>r.active!==!1).length,i=o.length-n;e.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        ${Ie("Total unidades",o.length,"fas fa-building","#7F7CFF","#F5F3FF")}
        ${Ie("Activas",n,"fas fa-check-circle","#059669","#ECFDF5")}
        ${Ie("Inactivas",i,"fas fa-pause-circle","#C46516","#FFF8F0")}
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
              ${sr(o,s)}
            </tbody>
          </table>
        </div>
      </div>`,(t=document.getElementById("ph-unit-search"))==null||t.addEventListener("input",debounce(()=>{var c;const r=(((c=document.getElementById("ph-unit-search"))==null?void 0:c.value)||"").toLowerCase();document.querySelectorAll("#ph-units-tbody tr").forEach(l=>{l.style.display=r&&!l.textContent.toLowerCase().includes(r)?"none":""})},150)),(a=document.getElementById("ph-unit-add-btn"))==null||a.addEventListener("click",()=>yo(null,e)),s&&(e.querySelectorAll(".ph-unit-edit").forEach(r=>{r.addEventListener("click",()=>yo(r.dataset.id,e))}),e.querySelectorAll(".ph-unit-toggle").forEach(r=>{r.addEventListener("click",()=>nr(r.dataset.id,r.dataset.active==="true",e))}))}catch(o){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(o.message)}</div>`}}function sr(e,t=can("canWrite")){return e.length?e.map(a=>{var n;const o=(n=a.expand)==null?void 0:n.owner_id,s=a.active!==!1;return`<tr>
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
    </tr>`}).join(""):'<tr><td colspan="9" class="text-center py-10" style="color:#9CA3AF">No hay unidades registradas.</td></tr>'}async function yo(e,t){if(!can("canWrite")){showToast("No tienes permisos para guardar unidades.","warning");return}let a=null,o=[];try{[o]=await Promise.all([API.getTerceros(),e?pb.get("ph_properties",e).then(n=>{a=n}):Promise.resolve()]),o=o.filter(n=>n.role?String(n.role).toLowerCase()==="propietario":n.type?String(n.type).toLowerCase()==="propietario":!1)}catch{showToast("Error al cargar datos.","error");return}const s=a?"Editar Unidad":"Nueva Unidad";openModal(s,`<div class="grid grid-cols-2 gap-4">
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
          ${zi.map(n=>`<option value="${n}" ${(a==null?void 0:a.unit_type)===n?"selected":""}>${n}</option>`).join("")}
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
     <button class="btn btn-primary" id="pu-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var n;(n=document.getElementById("pu-save-btn"))==null||n.addEventListener("click",async()=>{var b,m,p,f,d,y,v,g,h,_,A;const i=(((b=document.getElementById("pu-code"))==null?void 0:b.value)||"").trim(),r=(((m=document.getElementById("pu-name"))==null?void 0:m.value)||"").trim(),c=((p=document.getElementById("pu-type"))==null?void 0:p.value)||"APARTAMENTO";if(!i||!r){showToast("Código y nombre son obligatorios.","warning");return}const l={code:i,name:r,unit_type:c,tower:(((f=document.getElementById("pu-tower"))==null?void 0:f.value)||"").trim(),apartment:(((d=document.getElementById("pu-apartment"))==null?void 0:d.value)||"").trim(),coef_participacion:parseFloat(((y=document.getElementById("pu-coef"))==null?void 0:y.value)||0)||0,admin_fee:parseFloat(((v=document.getElementById("pu-admin-fee"))==null?void 0:v.value)||0)||0,area_m2:parseFloat(((g=document.getElementById("pu-area"))==null?void 0:g.value)||0)||0,owner_id:((h=document.getElementById("pu-owner"))==null?void 0:h.value)||null,notes:((_=document.getElementById("pu-notes"))==null?void 0:_.value)||"",active:((A=document.getElementById("pu-active"))==null?void 0:A.value)==="true"},u=document.getElementById("pu-save-btn");u&&(u.disabled=!0,u.textContent="Guardando...");try{if(a)await pb.update("ph_properties",a.id,l),await API.logAudit("UPDATE","PhProperty",a.id,`Unidad ${i} actualizada`),showToast("Unidad actualizada.","success");else{l.active=!0;const I=await pb.create("ph_properties",l);await API.logAudit("CREATE","PhProperty",I.id,`Nueva unidad ${i}`),showToast("Unidad creada.","success")}closeModal(),Ya(t)}catch(I){showToast(I.message||"Error al guardar.","error"),u&&(u.disabled=!1,u.textContent="Guardar")}},{once:!0})},50)}async function nr(e,t,a){if(!can("canWrite")){showToast("No tienes permisos para actualizar unidades.","warning");return}const o=t?"desactivar":"activar";if(confirm(`¿${o.charAt(0).toUpperCase()+o.slice(1)} esta unidad?`))try{await pb.update("ph_properties",e,{active:!t}),showToast(`Unidad ${o}da.`,"success"),Ya(a)}catch(s){showToast(s.message||"Error.","error")}}async function ra(e){var t,a;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const o=new Date().toISOString().slice(0,10),[s,n]=await Promise.all([API.getPhReservations({filter:`date>="${pb.escapeFilterValue(o)}"`,sort:"date,time_from",perPage:100}),API.getPhCommonAreas(!0)]),i=s.items||[];e.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        ${Ie("Zonas comunes",n.length,"fas fa-map-marked-alt","#1A4B8C","#EEF4FF")}
        ${Ie("Próximas reservas",i.length,"fas fa-calendar-check","#059669","#ECFDF5")}
        ${Ie("Confirmadas",i.filter(r=>r.status==="confirmed").length,"fas fa-circle-check","#7F7CFF","#F5F3FF")}
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="px-5 py-3 border-b flex items-center justify-between" style="border-color:#F0F0F0">
          <span class="font-bold text-sm" style="color:#0D2137">Reservas Próximas (desde hoy)</span>
          <div class="flex gap-2">
            <select id="ph-res-area-filter" class="form-input text-sm" style="max-width:200px">
              <option value="">Todas las zonas</option>
              ${n.map(r=>`<option value="${esc(r.id)}">${esc(r.name)}</option>`).join("")}
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
              ${_o(i)}
            </tbody>
          </table>
        </div>
      </div>`,(t=document.getElementById("ph-res-area-filter"))==null||t.addEventListener("change",async r=>{const c=r.target.value;let l=`date>="${pb.escapeFilterValue(o)}"`;c&&(l+=` && area_id="${pb.escapeFilterValue(c)}"`);const u=await API.getPhReservations({filter:l,sort:"date,time_from",perPage:100});document.getElementById("ph-res-tbody").innerHTML=_o(u.items||[]),xo(e,n)}),(a=document.getElementById("ph-res-add-btn"))==null||a.addEventListener("click",()=>ir(null,e,n)),xo(e,n)}catch(o){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(o.message)}</div>`}}function _o(e){return e.length?e.map(t=>{var n,i;const a=(n=t.expand)==null?void 0:n.area_id,o=(i=t.expand)==null?void 0:i.property_id,s=ho[t.status]||ho.pending;return`<tr data-res-id="${esc(t.id)}">
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
    </tr>`}).join(""):'<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay reservas próximas.</td></tr>'}function xo(e,t){e.querySelectorAll(".ph-res-confirm").forEach(a=>{a.addEventListener("click",async()=>{try{await pb.update("ph_reservations",a.dataset.id,{status:"confirmed"}),showToast("Reserva confirmada.","success"),ra(e)}catch(o){showToast(o.message||"Error.","error")}})}),e.querySelectorAll(".ph-res-cancel").forEach(a=>{a.addEventListener("click",async()=>{if(confirm("¿Cancelar esta reserva?"))try{await pb.update("ph_reservations",a.dataset.id,{status:"cancelled"}),showToast("Reserva cancelada.","success"),ra(e)}catch(o){showToast(o.message||"Error.","error")}})})}async function ir(e,t,a){let o=null,s=a||[],n=[];try{[n]=await Promise.all([API.getPhProperties(!0),e?pb.get("ph_reservations",e,{expand:"area_id,property_id"}).then(r=>{o=r}):Promise.resolve()]),s.length||(s=await API.getPhCommonAreas(!0))}catch{showToast("Error al cargar datos.","error");return}const i=new Date().toISOString().slice(0,10);openModal(o?"Editar Reserva":"Nueva Reserva",`<div class="grid grid-cols-2 gap-4">
      <div class="form-group col-span-2">
        <label class="form-label">Zona Común <span class="text-red-500">*</span></label>
        <select id="pr-area" class="form-input">
          <option value="">Seleccionar zona...</option>
          ${s.map(r=>`<option value="${esc(r.id)}" ${(o==null?void 0:o.area_id)===r.id?"selected":""}>
            ${esc(r.name)}${r.capacity?` (cap: ${r.capacity})`:""}
          </option>`).join("")}
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Unidad <span class="text-red-500">*</span></label>
        <select id="pr-prop" class="form-input">
          <option value="">Seleccionar unidad...</option>
          ${n.map(r=>`<option value="${esc(r.id)}" ${(o==null?void 0:o.property_id)===r.id?"selected":""}>${esc(r.name)} (${esc(r.code)})</option>`).join("")}
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
     <button class="btn btn-primary" id="pr-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var r;(r=document.getElementById("pr-save-btn"))==null||r.addEventListener("click",async()=>{var d,y,v,g,h,_,A;const c=(d=document.getElementById("pr-area"))==null?void 0:d.value,l=(y=document.getElementById("pr-prop"))==null?void 0:y.value,u=(v=document.getElementById("pr-date"))==null?void 0:v.value,b=(g=document.getElementById("pr-from"))==null?void 0:g.value,m=(h=document.getElementById("pr-to"))==null?void 0:h.value;if(!c||!l||!u||!b||!m){showToast("Completa los campos obligatorios.","warning");return}if(m<=b){showToast("La hora fin debe ser posterior a la hora inicio.","warning");return}const p={area_id:c,property_id:l,date:u,time_from:b,time_to:m,attendees:parseInt(((_=document.getElementById("pr-att"))==null?void 0:_.value)||0)||0,notes:((A=document.getElementById("pr-notes"))==null?void 0:A.value)||"",status:"pending"},f=document.getElementById("pr-save-btn");f&&(f.disabled=!0,f.textContent="Guardando...");try{o?(await pb.update("ph_reservations",o.id,p),showToast("Reserva actualizada.","success")):(await pb.create("ph_reservations",p),showToast("Reserva creada.","success")),closeModal(),ra(t)}catch(I){showToast(I.message||"Error.","error"),f&&(f.disabled=!1,f.textContent="Guardar")}},{once:!0})},50)}async function $s(e){var t,a,o;e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const[s,n]=await Promise.all([API.getPhPqrs({perPage:100}),API.getPhProperties(!0)]),r=(s.items||[]).filter(m=>(m.status||"open")!=="closed"),c=r.filter(m=>m.status==="open").length,l=r.filter(m=>m.status==="in_process").length,u=r.filter(m=>m.priority==="alta").length;e.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        ${Ie("Abiertas",c,"fas fa-inbox","#C46516","#FFF8F0")}
        ${Ie("En proceso",l,"fas fa-arrows-spin","#1A4B8C","#EEF4FF")}
        ${Ie("Prioridad Alta",u,"fas fa-triangle-exclamation","#DC2626","#FEF2F2")}
        ${Ie("Total activas",r.length,"fas fa-comments","#7F7CFF","#F5F3FF")}
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="px-5 py-3 border-b flex items-center justify-between flex-wrap gap-2" style="border-color:#F0F0F0">
          <span class="font-bold text-sm" style="color:#0D2137">PQRs Activas</span>
          <div class="flex gap-2 flex-wrap">
            <select id="ph-pqr-status-filter" class="form-input text-sm" style="max-width:160px">
              <option value="">Todos los estados</option>
              ${Object.entries(sa).map(([m,p])=>`<option value="${m}">${p.label}</option>`).join("")}
            </select>
            <select id="ph-pqr-type-filter" class="form-input text-sm" style="max-width:160px">
              <option value="">Todos los tipos</option>
              ${ia.map(m=>`<option value="${m.value}">${m.label}</option>`).join("")}
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
              ${Ao(r)}
            </tbody>
          </table>
        </div>
      </div>`;async function b(){var y,v;const m=(y=document.getElementById("ph-pqr-status-filter"))==null?void 0:y.value,p=(v=document.getElementById("ph-pqr-type-filter"))==null?void 0:v.value,d=((await API.getPhPqrs({perPage:100})).items||[]).filter(g=>{const h=g.status||"open";return!(!m&&h==="closed"||m&&h!==m||p&&g.pqrs_type!==p)});document.getElementById("ph-pqrs-tbody").innerHTML=Ao(d),$o(e,n)}(t=document.getElementById("ph-pqr-status-filter"))==null||t.addEventListener("change",b),(a=document.getElementById("ph-pqr-type-filter"))==null||a.addEventListener("change",b),(o=document.getElementById("ph-pqr-add-btn"))==null||o.addEventListener("click",()=>ws(null,e,n)),$o(e,n)}catch(s){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(s.message)}</div>`}}function Ao(e){return e.length?e.map(t=>{var r,c;const a=(r=t.expand)==null?void 0:r.property_id,o=sa[t.status]||sa.open,s=na[t.priority]||na.media,n=((c=ia.find(l=>l.value===t.pqrs_type))==null?void 0:c.label)||t.pqrs_type||"—",i=t.created?new Date(t.created).toLocaleDateString("es-CO"):"—";return`<tr>
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
    </tr>`}).join(""):'<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No hay PQRs activas.</td></tr>'}function $o(e,t){e.querySelectorAll(".ph-pqr-view").forEach(a=>{a.addEventListener("click",()=>ws(a.dataset.id,e,t))})}async function ws(e,t,a){var r,c,l;let o=null,s=a||[];try{e&&(o=await pb.get("ph_pqrs",e,{expand:"property_id"})),s.length||(s=await API.getPhProperties(!1))}catch{showToast("Error al cargar datos.","error");return}const n=o?`PQR ${o.number}`:"Nueva PQR",i=Object.entries(sa).map(([u,b])=>`<option value="${u}" ${(o==null?void 0:o.status)===u?"selected":""}>${b.label}</option>`).join("");openModal(n,`<div class="space-y-4">
      ${o?`
        <div class="grid grid-cols-3 gap-3 p-3 rounded-xl text-sm" style="background:#F8FAFF">
          <div><p class="text-xs" style="color:#6B7280">Número</p><p class="font-bold font-mono">${esc(o.number)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Tipo</p><p class="font-semibold">${esc(((r=ia.find(u=>u.value===o.pqrs_type))==null?void 0:r.label)||o.pqrs_type)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Prioridad</p>
            <span class="badge ${((c=na[o.priority])==null?void 0:c.badge)||"badge-gray"}">${((l=na[o.priority])==null?void 0:l.label)||o.priority||"—"}</span>
          </div>
        </div>`:""}
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Tipo <span class="text-red-500">*</span></label>
          <select id="pq-type" class="form-input" ${o?"disabled":""}>
            ${ia.map(u=>`<option value="${u.value}" ${(o==null?void 0:o.pqrs_type)===u.value?"selected":""}>${u.label}</option>`).join("")}
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
            ${s.map(u=>`<option value="${esc(u.id)}" ${(o==null?void 0:o.property_id)===u.id?"selected":""}>${esc(u.name)} (${esc(u.code)})</option>`).join("")}
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
     </button>`),setTimeout(()=>{var u;(u=document.getElementById("pq-save-btn"))==null||u.addEventListener("click",async()=>{var m,p,f,d,y,v,g,h,_;const b=document.getElementById("pq-save-btn");b&&(b.disabled=!0,b.textContent="Guardando...");try{if(o){const A=(m=document.getElementById("pq-status"))==null?void 0:m.value,I=((p=document.getElementById("pq-response"))==null?void 0:p.value)||"",F=((f=document.getElementById("pq-assigned"))==null?void 0:f.value)||"",S=((d=document.getElementById("pq-priority"))==null?void 0:d.value)||"media",x={status:A,response:I,assigned_to:F,priority:S};(A==="closed"||A==="resolved")&&(x.closed_at=new Date().toISOString().replace("T"," ").slice(0,19)),await pb.update("ph_pqrs",o.id,x),await API.logAudit("UPDATE","PhPqr",o.id,`PQR ${o.number} → ${A}`),showToast("PQR actualizada.","success")}else{const A=(((y=document.getElementById("pq-subject"))==null?void 0:y.value)||"").trim(),I=(((v=document.getElementById("pq-desc"))==null?void 0:v.value)||"").trim(),F=((g=document.getElementById("pq-type"))==null?void 0:g.value)||"PETICION",S=((h=document.getElementById("pq-priority"))==null?void 0:h.value)||"media",x=((_=document.getElementById("pq-prop"))==null?void 0:_.value)||null;if(!A){showToast("El asunto es obligatorio.","warning"),b&&(b.disabled=!1,b.textContent="Crear PQR");return}if(!I){showToast("La descripción es obligatoria.","warning"),b&&(b.disabled=!1,b.textContent="Crear PQR");return}const T=await API.nextPhPqrNumber(),E=await pb.create("ph_pqrs",{number:T,subject:A,description:I,pqrs_type:F,priority:S,property_id:x||null,status:"open",opened_at:new Date().toISOString().replace("T"," ").slice(0,19)});await API.logAudit("CREATE","PhPqr",E.id,`Nueva PQR ${T} — ${A}`),showToast("PQR creada correctamente.","success")}closeModal(),$s(t)}catch(A){showToast(A.message||"Error.","error"),b&&(b.disabled=!1,b.textContent=o?"Actualizar":"Crear PQR")}},{once:!0})},50)}async function et(e){var t,a,o,s,n;e.id=e.id||"ph-config-container",e.innerHTML='<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';try{const[i,r,c,l,u,b]=await Promise.all([API.getPhBillingConcepts(!1),API.getPhCommonAreas(!1),API.getSetting("ph_config_v1"),API.getAccounts(!0),API.getPhProperties(!0),API.getPhIndividualCharges({filter:""}).catch(()=>({items:[]}))]),m=((b==null?void 0:b.items)||[]).slice().sort((x,T)=>{const E=String((x==null?void 0:x.name)||(x==null?void 0:x.description)||"").toLowerCase(),C=String((T==null?void 0:T.name)||(T==null?void 0:T.description)||"").toLowerCase();return E.localeCompare(C)}),p=new Map((u||[]).map(x=>[x.id,x]));let f={};try{f=c?JSON.parse(c):{}}catch{f={}}const d=f.cxc_code||"130505",y=f.income_code||"413505",v=f.late_fee_income_code||y,g=f.anticipo_account_code||"",h=(l||[]).filter(x=>x.active!==!1&&Number(x.level||0)>=3).sort((x,T)=>String(x.code||"").localeCompare(String(T.code||""))),_=new Map(h.map(x=>[String(x.code||""),x])),A=h.filter(x=>String(x.code||"").startsWith("1")),I=h.filter(x=>String(x.code||"").startsWith("4")),F=h.filter(x=>String(x.code||"").startsWith("2")),S=(x,T="")=>{const E=String(T||""),C=x.some(L=>String(L.code||"")===E);return`${E&&!C?`<option value="${esc(E)}" selected>${esc(E)} — (No encontrada en PUC activo)</option>`:""}<option value="">— Seleccionar cuenta —</option>${x.map(L=>`<option value="${esc(L.code)}"${String(L.code||"")===E?" selected":""}>${esc(L.code)} — ${esc(L.name||"")}</option>`).join("")}`};e.innerHTML=`
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
            <select id="ph-cfg-cxc" class="form-input font-mono">${S(A,d)}</select>
            <p class="text-xs mt-1" style="color:#9CA3AF">Cuenta a debitar al generar la factura (cartera de propietarios).</p>
          </div>
          <div class="form-group">
            <label class="form-label">Cuenta de Ingreso por Defecto (Crédito)</label>
            <select id="ph-cfg-income" class="form-input font-mono">${S(I,y)}</select>
            <p class="text-xs mt-1" style="color:#9CA3AF">Usada cuando el concepto no tiene cuenta propia asignada.</p>
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fas fa-piggy-bank mr-1" style="color:#059669"></i>Cuenta de Anticipos de Propietarios (Pasivo)</label>
            <select id="ph-cfg-anticipo" class="form-input font-mono">${S(F,g)}</select>
            <p class="text-xs mt-1" style="color:#9CA3AF">Cuenta clase 2 donde se registran los saldos a favor de propietarios (ej: 280505 Anticipos de Clientes).</p>
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
            ${rr(r,e)}
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
                ${dr(i,l)}
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
              value="${f.late_fee_rate||2}" placeholder="2">
            <p class="text-xs mt-1" style="color:#6B7280">Ingresa el valor entero. Ej: <strong>2</strong> para aplicar el 2% mensual sobre el saldo vencido.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Cuenta de Ingreso para Intereses de Mora</label>
            <select id="ph-late-income" class="form-input font-mono">${S(I,v)}</select>
            <p class="text-xs mt-1" style="color:#6B7280">Cuenta clase 4 donde se contabilizarán los intereses de mora.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Conceptos que generan mora</label>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:8px;margin-top:8px">
              ${i.filter(x=>x.active!==!1).map(x=>`
                <label class="flex items-center gap-2 p-3 rounded-lg" style="background:#F8FAFF;border:1px solid #E5E7EB;cursor:pointer">
                  <input type="checkbox" class="ph-mora-concept" value="${esc(x.id)}" 
                    ${(f.late_fee_concepts||[]).includes(x.id)?"checked":""}>
                  <span class="text-sm font-medium">${esc(x.code)} — ${esc(x.name)}</span>
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
                  <th>Código</th><th>Nombre</th><th>Descripción</th><th class="text-right">Valor ref.</th>
                  <th>Cuenta ingreso</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody id="ph-ind-concepts-tbody">
                ${cr(m,l)}
              </tbody>
            </table>
          </div>
        </div>
      </div>`,(t=document.getElementById("ph-cfg-save-btn"))==null||t.addEventListener("click",async()=>{var N,L,O;const x=(((N=document.getElementById("ph-cfg-cxc"))==null?void 0:N.value)||"").trim(),T=(((L=document.getElementById("ph-cfg-income"))==null?void 0:L.value)||"").trim(),E=(((O=document.getElementById("ph-cfg-anticipo"))==null?void 0:O.value)||"").trim();if(!x||!T){showToast("Completa la cuenta CxC y la cuenta de ingreso.","warning");return}if(!_.has(x)||!_.has(T)){showToast("Selecciona cuentas válidas del PUC activo.","warning");return}if(!x.startsWith("1")){showToast("La cuenta CxC debe ser de clase 1 (Activo).","warning");return}if(!T.startsWith("4")){showToast("La cuenta de ingreso debe ser de clase 4 (Ingreso).","warning");return}const C=document.getElementById("ph-cfg-save-btn");C&&(C.disabled=!0,C.textContent="Guardando...");try{let M=null;if(E)try{const j=await pb.listAll("accounts",{filter:`code="${E}"`,perPage:1});j.length&&(M=j[0].id)}catch{}const B={...f,cxc_code:x,income_code:T,anticipo_account_code:E||null,anticipo_account_id:M};await API.setSetting("ph_config_v1",JSON.stringify(B)),showToast("Configuración guardada.","success")}catch(M){showToast(M.message||"Error.","error")}finally{C&&(C.disabled=!1,C.innerHTML='<i class="fas fa-save mr-1"></i>Guardar Configuración')}}),(a=document.getElementById("ph-mora-save-btn"))==null||a.addEventListener("click",async()=>{var N,L;const x=parseFloat(((N=document.getElementById("ph-late-rate"))==null?void 0:N.value)||.5)||.5,T=(((L=document.getElementById("ph-late-income"))==null?void 0:L.value)||"").trim(),E=Array.from(document.querySelectorAll(".ph-mora-concept:checked")).map(O=>O.value);if(!T){showToast("Selecciona la cuenta de ingreso para mora.","warning");return}if(!_.has(T)||!T.startsWith("4")){showToast("La cuenta de mora debe existir en el PUC activo y ser clase 4.","warning");return}const C=document.getElementById("ph-mora-save-btn");C&&(C.disabled=!0,C.textContent="Guardando...");try{const O={...f,late_fee_rate:x,late_fee_concepts:E,late_fee_income_code:T};await API.setSetting("ph_config_v1",JSON.stringify(O)),showToast("Configuración de mora guardada.","success")}catch(O){showToast(O.message||"Error.","error")}finally{C&&(C.disabled=!1,C.innerHTML='<i class="fas fa-save mr-1"></i>Guardar Configuración de Mora')}}),(o=document.getElementById("ph-individual-concept-add-btn"))==null||o.addEventListener("click",()=>Co(null,e,l)),e.querySelectorAll(".ph-ind-concept-edit").forEach(x=>{x.addEventListener("click",()=>Co(x.dataset.id,e,l))}),e.querySelectorAll(".ph-ind-concept-toggle").forEach(x=>{x.addEventListener("click",async()=>{const T=x.dataset.active==="true";await pb.update("ph_individual_charges",x.dataset.id,{active:!T}),showToast(`Concepto ${T?"desactivado":"activado"}.`,"success"),et(e)})}),(s=document.getElementById("ph-area-add-btn"))==null||s.addEventListener("click",()=>wo(null,e)),e.querySelectorAll(".ph-area-edit").forEach(x=>{x.addEventListener("click",()=>wo(x.dataset.id,e))}),e.querySelectorAll(".ph-area-toggle").forEach(x=>{x.addEventListener("click",async()=>{const T=x.dataset.active==="true";await pb.update("ph_common_areas",x.dataset.id,{active:!T}),showToast(`Zona ${T?"desactivada":"activada"}.`,"success"),et(e)})}),(n=document.getElementById("ph-concept-add-btn"))==null||n.addEventListener("click",()=>Eo(null,e,l)),e.querySelectorAll(".ph-concept-edit").forEach(x=>{x.addEventListener("click",()=>Eo(x.dataset.id,e,l))}),e.querySelectorAll(".ph-concept-toggle").forEach(x=>{x.addEventListener("click",async()=>{const T=x.dataset.active==="true";await pb.update("ph_billing_concepts",x.dataset.id,{active:!T}),showToast(`Concepto ${T?"desactivado":"activado"}.`,"success"),et(e)})})}catch(i){e.innerHTML=`<div class="p-6 text-center" style="color:#EF4444">${esc(i.message)}</div>`}}function rr(e,t){return e.length?`<div class="space-y-2">
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
  </div>`:'<p class="text-sm text-center py-4" style="color:#9CA3AF">No hay zonas comunes registradas.</p>'}function cr(e,t){if(!e.length)return'<tr><td colspan="6" class="text-center py-8" style="color:#9CA3AF">No hay conceptos individuales. Crea el primero.</td></tr>';const a=new Map((t||[]).map(o=>[String(o.code||""),o]));return e.map(o=>{var r;const s=o.active!==!1,n=Ja(o),i=n?((r=a.get(n))==null?void 0:r.name)||n:"—";return`<tr>
      <td class="font-mono text-xs font-bold">${esc(o.code||"GEN")}</td>
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
    </tr>`}).join("")}function Ja(e){const t=String((e==null?void 0:e.account_code)||"").trim();if(t)return t;const o=String((e==null?void 0:e.notes)||"").match(/\[ACC:([^\]]+)\]/i);return o?String(o[1]||"").trim():""}function lr(e,t){const a=String(e||"").replace(/\[ACC:[^\]]+\]\s*/ig,"").trim(),o=String(t||"").trim();return o?`[ACC:${o}]${a?" "+a:""}`:a}function dr(e,t){return e.length?e.map(a=>{var n;const o=(n=a.expand)==null?void 0:n.account_id,s=a.active!==!1;return`<tr>
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
    </tr>`}).join(""):'<tr><td colspan="7" class="text-center py-8" style="color:#9CA3AF">No hay conceptos de facturación. Crea el primero.</td></tr>'}async function wo(e,t){let a=null;try{e&&(a=await pb.get("ph_common_areas",e))}catch{showToast("Error al cargar zona.","error");return}openModal(a?"Editar Zona Común":"Nueva Zona Común",`<div class="grid grid-cols-2 gap-4">
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
     <button class="btn btn-primary" id="pa-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var o;(o=document.getElementById("pa-save-btn"))==null||o.addEventListener("click",async()=>{var r,c,l,u,b,m;const s=(((r=document.getElementById("pa-code"))==null?void 0:r.value)||"").trim().toUpperCase(),n=(((c=document.getElementById("pa-name"))==null?void 0:c.value)||"").trim();if(!s||!n){showToast("Código y nombre son obligatorios.","warning");return}const i=document.getElementById("pa-save-btn");i&&(i.disabled=!0,i.textContent="Guardando...");try{const p={code:s,name:n,capacity:parseInt(((l=document.getElementById("pa-cap"))==null?void 0:l.value)||0)||0,min_hours:parseFloat(((u=document.getElementById("pa-minhrs"))==null?void 0:u.value)||0)||0,description:((b=document.getElementById("pa-desc"))==null?void 0:b.value)||"",rules:((m=document.getElementById("pa-rules"))==null?void 0:m.value)||"",active:!0};a?(await pb.update("ph_common_areas",a.id,p),showToast("Zona actualizada.","success")):(await pb.create("ph_common_areas",p),showToast("Zona creada.","success")),closeModal(),et(t)}catch(p){showToast(p.message||"Error.","error"),i&&(i.disabled=!1,i.textContent="Guardar")}},{once:!0})},50)}async function Eo(e,t,a){let o=null,s=a||[];try{e&&(o=await pb.get("ph_billing_concepts",e,{expand:"account_id"})),s.length||(s=await API.getAccounts(!0))}catch{showToast("Error al cargar datos.","error");return}s.filter(n=>String(n.code||"").startsWith("4")||String(n.code||"").startsWith("41")),openModal(o?"Editar Concepto":"Nuevo Concepto de Facturación",`<div class="grid grid-cols-2 gap-4">
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
     <button class="btn btn-primary" id="pc-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`),setTimeout(()=>{var n;(n=document.getElementById("pc-save-btn"))==null||n.addEventListener("click",async()=>{var u,b,m,p,f,d;const i=(((u=document.getElementById("pc-code"))==null?void 0:u.value)||"").trim().toUpperCase(),r=(((b=document.getElementById("pc-name"))==null?void 0:b.value)||"").trim(),c=parseFloat(((m=document.getElementById("pc-amount"))==null?void 0:m.value)||0)||0;if(!i||!r||!c){showToast("Código, nombre y valor son obligatorios.","warning");return}const l=document.getElementById("pc-save-btn");l&&(l.disabled=!0,l.textContent="Guardando...");try{const y={code:i,name:r,amount:c,applies_coef:((p=document.getElementById("pc-coef"))==null?void 0:p.value)==="true",account_id:((f=document.getElementById("pc-account"))==null?void 0:f.value)||null,description:((d=document.getElementById("pc-desc"))==null?void 0:d.value)||"",active:!0};o?(await pb.update("ph_billing_concepts",o.id,y),showToast("Concepto actualizado.","success")):(await pb.create("ph_billing_concepts",y),showToast("Concepto creado.","success")),closeModal(),et(t)}catch(y){showToast(y.message||"Error.","error"),l&&(l.disabled=!1,l.textContent="Guardar")}},{once:!0})},50)}async function pr(e){var i;let t=null,a=[];try{[t,a]=await Promise.all([pb.get("ph_invoices",e,{expand:"property_id"}),API.getPhIndividualCharges({filter:""})]),a=((a==null?void 0:a.items)||[]).filter(r=>(r==null?void 0:r.active)!==!1)}catch{showToast("Error al cargar datos.","error");return}if(!a.length){showToast("No hay conceptos individuales activos. Crea al menos uno en Configuración.","warning");return}const o=(i=t.expand)==null?void 0:i.property_id,s=o?`${esc(o.name||o.code||"")}`:esc(t.property_id),n=a.slice().sort((r,c)=>{const l=String((r==null?void 0:r.name)||(r==null?void 0:r.description)||"").toLowerCase(),u=String((c==null?void 0:c.name)||(c==null?void 0:c.description)||"").toLowerCase();return l.localeCompare(u)});openModal(`Añadir conceptos individuales — ${s}`,`<div class="space-y-3">
      <p class="text-sm" style="color:#6B7280">
        Selecciona los conceptos a añadir y ajusta el valor si es necesario.
        Solo se puede modificar facturas en estado <strong>Borrador</strong>.
      </p>
      <div class="space-y-2" id="ph-add-ind-list">
        ${n.map((r,c)=>{const l=Ja(r);return`
          <div class="flex items-center gap-3 p-3 rounded-lg" style="background:#F8FAFF;border:1px solid #E5E7EB">
            <input type="checkbox" class="ph-add-ind-check" id="pic-chk-${c}"
              data-idx="${c}" data-name="${esc(r.name||r.description||"")}"
              data-code="${esc(r.code||"GEN")}"
              data-account="${esc(l||"")}" style="width:18px;height:18px;cursor:pointer">
            <label for="pic-chk-${c}" class="flex-1 cursor-pointer">
              <p class="font-medium text-sm" style="color:#0D2137"><span class="badge badge-gray mr-2">${esc(r.code||"GEN")}</span>${esc(r.name||r.description||"—")}</p>
              ${r.description?`<p class="text-xs" style="color:#9CA3AF">${esc(r.description)}</p>`:""}
            </label>
            <input type="number" class="form-input ph-add-ind-amount" data-idx="${c}"
              min="0" step="1" style="max-width:130px;text-align:right"
              value="${esc(r.amount||"")}" placeholder="Valor">
          </div>`}).join("")}
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="ph-add-ind-confirm-btn">
       <i class="fas fa-plus-circle mr-1"></i>Añadir a factura
     </button>`),setTimeout(()=>{var r;(r=document.getElementById("ph-add-ind-confirm-btn"))==null||r.addEventListener("click",async()=>{const c=[];if(document.querySelectorAll(".ph-add-ind-check:checked").forEach(u=>{const b=u.dataset.idx,m=document.querySelector(`.ph-add-ind-amount[data-idx="${b}"]`),p=parseFloat((m==null?void 0:m.value)||0)||0;p<=0||c.push({description:`[${u.dataset.code||"GEN"}] ${u.dataset.name}`,amount:p,account_code:u.dataset.account||""})}),!c.length){showToast("Selecciona al menos un concepto con valor mayor a 0.","warning");return}const l=document.getElementById("ph-add-ind-confirm-btn");l&&(l.disabled=!0,l.textContent="Guardando...");try{const u=await API.addPhIndividualLinesToInvoice(e,c);showToast(`${c.length} concepto(s) añadido(s). Nuevo total: ${fmt(u)}`,"success"),closeModal();const b=document.querySelector(`tr[data-id="${CSS.escape(e)}"]`);b&&(b.querySelector("td:nth-child(5)").textContent=fmt(u))}catch(u){showToast(u.message||"Error al añadir conceptos.","error"),l&&(l.disabled=!1,l.innerHTML='<i class="fas fa-plus-circle mr-1"></i>Añadir a factura')}},{once:!0})},50)}async function Co(e,t,a){let o=null,s=a||[],n=[];try{e&&(o=await pb.get("ph_individual_charges",e)),s.length||(s=await API.getAccounts(!0)),n=await API.getPhProperties(!0)}catch{showToast("Error al cargar datos.","error");return}const i=Ja(o);openModal(o?"Editar Concepto Individual":"Nuevo Concepto Individual",`<div class="grid grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código <span class="text-red-500">*</span></label>
        <input id="pic-code" class="form-input" value="${esc((o==null?void 0:o.code)||"")}"
          placeholder="Ej: MUL, PAR">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span class="text-red-500">*</span></label>
        <input id="pic-name" class="form-input" value="${esc((o==null?void 0:o.name)||(o==null?void 0:o.description)||"")}"
          placeholder="Ej: Sanción de convivencia, Parqueadero extra">
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
          ${s.filter(r=>String(r.code||"").startsWith("4")).map(r=>`<option value="${esc(r.code)}" ${i===r.code?"selected":""}>
              ${esc(r.code)} — ${esc(r.name)}
            </option>`).join("")}
        </select>
        <p class="text-xs mt-1" style="color:#6B7280">Cuenta clase 4. Si no seleccionas, se usa la cuenta de ingreso por defecto al contabilizar.</p>
      </div>
    </div>`,`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pic-save-btn"><i class="fas fa-save mr-1"></i>${o?"Actualizar":"Crear"}</button>`),setTimeout(()=>{var r;(r=document.getElementById("pic-save-btn"))==null||r.addEventListener("click",async()=>{var d,y,v,g,h,_,A;const c=(((d=document.getElementById("pic-code"))==null?void 0:d.value)||"").trim().toUpperCase(),l=(((y=document.getElementById("pic-name"))==null?void 0:y.value)||"").trim(),u=(((v=document.getElementById("pic-desc"))==null?void 0:v.value)||"").trim(),b=parseFloat(((g=document.getElementById("pic-amount"))==null?void 0:g.value)||0)||0,m=((h=document.getElementById("pic-active"))==null?void 0:h.value)!=="false",p=(((_=document.getElementById("pic-account"))==null?void 0:_.value)||"").trim();if(!l||!c){showToast("El código y el nombre son obligatorios.","warning");return}const f=document.getElementById("pic-save-btn");f&&(f.disabled=!0,f.textContent="Guardando...");try{const I=(o==null?void 0:o.property_id)||((A=n==null?void 0:n[0])==null?void 0:A.id)||null,F={code:c||"GEN",name:l,description:u||l,amount:b||0,active:m,account_code:p||null,period:(o==null?void 0:o.period)||_t(),notes:lr((o==null?void 0:o.notes)||"",p),property_id:I};o?(await pb.update("ph_individual_charges",o.id,F),showToast("Concepto actualizado.","success")):(await pb.create("ph_individual_charges",F),showToast("Concepto creado. Disponible para añadir a facturas en borrador.","success")),closeModal(),et(t)}catch(I){showToast(I.message||"Error al guardar. Si persiste, reinicia el servidor para aplicar la migración.","error"),f&&(f.disabled=!1,f.textContent=o?"Actualizar":"Crear")}},{once:!0})},50)}window.postPhInvoiceConfirm=Xi;window.renderPhIndividualConceptRows=cr;window.PH_UNIT_TYPES=zi;window.renderPhConfig=et;window.attachPhInvActions=ot;window.PH_PQRS_STATUS=sa;window.phKpi=Ie;window.attachPhPqrActions=$o;window.openPhPostPeriodModal=Wi;window.getIndividualConceptAccountCode=Ja;window.voidPhInvoiceModal=ar;window.openPhEditDraftLineModal=Qi;window.renderPhFacturacion=ga;window.renderPhUnitRows=sr;window.removePhDraftLineConfirm=Zi;window.renderPhAreasList=rr;window.renderCopropiedades=cl;window.openPhAreaModal=wo;window.openPhResModal=ir;window.openPhIndividualConceptModal=Co;window.openPhUnpostPeriodModal=Yi;window.openPhConceptModal=Eo;window.openPhDeletePeriodModal=Ji;window.upsertIndividualConceptAccInNotes=lr;window.openPhGenerateModal=Ki;window.attachPhResActions=xo;window.openPhPqrModal=ws;window.renderPhPqrs=$s;window.PH_RES_STATUS=ho;window.renderPhCartera=or;window.renderPhPqrRows=Ao;window.openPhAddIndividualLinesModal=pr;window.PH_STATUS=ft;window.renderPhReservas=ra;window.PH_PQRS_TYPES=ia;window.markPhPaidConfirm=er;window.openPhUnitModal=yo;window.fmtPeriod=Qe;window.openPhInvoiceDetail=Wa;window.renderPhInvRows=La;window.renderPhUnidades=Ya;window.PH_PQRS_PRIORITY=na;window.renderPhConceptRows=dr;window.renderPhResRows=_o;window.currentPeriod=_t;window.unpostPhInvoiceConfirm=tr;window._renderPhPage=qi;window.togglePhUnit=nr;const Fe=()=>window.pb,we=e=>window.fmt?window.fmt(e):`$${Number(e).toLocaleString("es-CO")}`,oe=e=>window.esc?window.esc(e):String(e||"").replace(/</g,"&lt;").replace(/>/g,"&gt;"),Es=(e,t,a,o)=>window.openModal(e,t,a,o),ur=()=>window.closeModal(),He=(e,t)=>window.showToast(e,t);let ca=[];function Ts(e){return`${e.doc_number||""} — ${e.name||""}`.trim()}function mr(e,t,a,o,s,n){const i=document.getElementById(e),r=document.getElementById(t),c=document.getElementById(a),l=document.getElementById(o);if(!i||!r||!c||!l)return;const u=ca.filter(s),b=(f="")=>{const d=f.toLowerCase().split(/\s+/).filter(Boolean),y=d.length?u.filter(v=>{const g=`${v.doc_number||""} ${v.name||""}`.toLowerCase();return d.every(h=>g.includes(h))}).slice(0,50):u.slice(0,50);if(!y.length){l.innerHTML='<div class="px-3 py-2 text-xs text-gray-500">Sin resultados</div>';return}l.innerHTML=y.map(v=>`<button type="button" data-teso-id="${v.id}" class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 bg-white border-none cursor-pointer text-gray-800">
        <div class="font-semibold">${v.doc_number||"SIN DOC"}</div>
        <div class="text-xs text-gray-500">${v.name||""}</div>
      </button>`).join("")};(()=>{const f=u.find(d=>d.id===c.value);r.value=f?Ts(f):""})(),r.onfocus=()=>{b(r.value),l.style.display="block"},r.oninput=()=>{c.value="",b(r.value),l.style.display="block"},l.onclick=f=>{const d=f.target.closest("[data-teso-id]");if(!d)return;const y=d.dataset.tesoId||"",v=u.find(g=>g.id===y)||null;c.value=y,r.value=v?Ts(v):"",l.style.display="none",v&&n(v)};const p=f=>{i.contains(f.target)||(l.style.display="none")};setTimeout(()=>document.addEventListener("click",p),0)}let It=[],Cs="comercial",Fa=null;function ll(e,t,a,o,s){const n=document.getElementById(e),i=document.getElementById(t),r=document.getElementById(a),c=document.getElementById(o);if(!n||!i||!r||!c)return;const l=(m="")=>{const p=m.toLowerCase().split(/\s+/).filter(Boolean),f=p.length?It.filter(d=>{var v,g;const y=`${d.code||""} ${d.name||""} ${((g=(v=d.expand)==null?void 0:v.owner_id)==null?void 0:g.name)||""}`.toLowerCase();return p.every(h=>y.includes(h))}).slice(0,50):It.slice(0,50);if(!f.length){c.innerHTML='<div class="px-3 py-2 text-xs text-gray-500">Sin resultados</div>';return}c.innerHTML=f.map(d=>{var y,v;return`<button type="button" data-teso-id="${d.id}" class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 bg-white border-none cursor-pointer text-gray-800">
        <div class="font-semibold">${oe(d.code)} - ${oe(d.name)}</div>
        <div class="text-xs text-gray-500"><i class="fas fa-user mr-1"></i>${oe(((v=(y=d.expand)==null?void 0:y.owner_id)==null?void 0:v.name)||"Sin propietario asignado")}</div>
      </button>`}).join("")};(()=>{const m=It.find(p=>p.id===r.value);i.value=m?`${m.code} - ${m.name}`:""})(),i.onfocus=()=>{l(i.value),c.style.display="block"},i.oninput=()=>{r.value="",l(i.value),c.style.display="block"},c.onclick=m=>{const p=m.target.closest("[data-teso-id]");if(!p)return;const f=p.dataset.tesoId||"",d=It.find(y=>y.id===f)||null;r.value=f,i.value=d?`${d.code} - ${d.name}`:"",c.style.display="none",d&&s(d)};const b=m=>{n.contains(m.target)||(c.style.display="none")};setTimeout(()=>document.addEventListener("click",b),0)}window._changeTesoOrigen=async e=>{Cs=e,Fa=null,Le=null,Te=[];const t=document.getElementById("teso-lbl-tercero"),a=document.getElementById("modal-rc-search"),o=document.getElementById("modal-rc-hidden"),s=document.getElementById("modal-rc-results"),n=document.getElementById("teso-modal-items-container");a&&(a.value="",a.oninput=null,a.onfocus=null),o&&(o.value=""),s&&(s.style.display="none",s.onclick=null),n&&(n.innerHTML=`
    <div class="text-center w-full">
      <div class="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
        <i class="fas fa-search text-2xl text-gray-400"></i>
      </div>
      <p class="font-medium text-gray-500">Busca un ${e==="comercial"?"tercero":"inmueble"} para visualizar su cartera abierta</p>
    </div>
  `),e==="comercial"?(t&&(t.textContent="Proveedor / Acreedor"),a&&(a.placeholder="Buscar..."),mr("modal-rc-wrap","modal-rc-search","modal-rc-hidden","modal-rc-results",()=>!0,i=>{Le=i,Io(i.id,!0).then(()=>{const r=Te.reduce((c,l)=>c+l.saldo,0);if(r>0){const c=document.getElementById("teso-modal-monto");c&&!c.value&&(c.value=String(Math.round(r)))}})})):(t&&(t.textContent="Unidad PH (Apartamento / Casa)"),a&&(a.placeholder="Buscar por código (Ej: A101)..."),It.length||(It=await Fe().listAll("ph_properties",{filter:"active=true",expand:"owner_id",sort:"code"})),ll("modal-rc-wrap","modal-rc-search","modal-rc-hidden","modal-rc-results",i=>{var r;Fa=i.id,(r=i.expand)!=null&&r.owner_id?(Le=i.expand.owner_id,Io(i.expand.owner_id.id,!0,i.id).then(()=>{const c=Te.reduce((l,u)=>l+u.saldo,0);if(c>0){const l=document.getElementById("teso-modal-monto");l&&!l.value&&(l.value=String(Math.round(c)))}})):He("Esta unidad no tiene un propietario asignado","warning")}))};async function To(e,t){var a,o,s;e.innerHTML='<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando transacciones...</div>';try{const n=Fe(),i=await n.listAll("transaction_types",{filter:`code="${t}"`});if(!i.length)throw new Error(`No existe el tipo de transacción ${t}`);const r=i[0].id,c=await n.listAll("transactions",{filter:`tx_type_id="${r}"`,sort:"-date",expand:"third_party_id"}),l=t==="RC",u=l?"Recibos de Caja (Recaudos)":"Comprobantes de Egreso (Pagos)",b=l?"Nuevo Recibo":"Nuevo Egreso",m=l?"openRecaudoModal()":"openPagoModal()";e.innerHTML=`
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-gray-800">${u}</h3>
          <p class="text-sm text-gray-500">Historial de ${l?"recaudos aplicados":"pagos emitidos"}.</p>
        </div>
        <button class="btn btn-primary" onclick="${m}"><i class="fas fa-plus mr-2"></i>${b}</button>
      </div>

      <div class="bg-gray-50/50 backdrop-blur-sm rounded-xl border border-gray-200 p-2 mb-4 flex flex-col md:flex-row gap-3 items-center shadow-sm">
        <div class="relative flex-1 w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <i class="fas fa-search"></i>
          </div>
          <input id="teso-filter-q" class="form-input w-full pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all" placeholder="Buscar por número o tercero...">
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto">
          <div class="relative flex-1 md:w-40">
            <input id="teso-filter-from" type="date" class="form-input w-full bg-white text-sm rounded-lg border-gray-200" title="Fecha Desde">
          </div>
          <span class="text-gray-400 text-xs"><i class="fas fa-arrow-right"></i></span>
          <div class="relative flex-1 md:w-40">
            <input id="teso-filter-to" type="date" class="form-input w-full bg-white text-sm rounded-lg border-gray-200" title="Fecha Hasta">
          </div>
        </div>
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
              <th class="p-3 text-center" style="width:90px">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${c.length===0?'<tr><td colspan="6" class="text-center p-6 text-gray-500">No hay registros.</td></tr>':c.map(f=>{var d,y,v,g;return`
              <tr class="hover:bg-blue-50/50 transition-colors duration-150 border-b border-gray-50 last:border-none" data-q="${oe(f.number)} ${oe(((y=(d=f.expand)==null?void 0:d.third_party_id)==null?void 0:y.name)||"")}" data-date="${oe(f.date)}" data-id="${oe(f.id)}">
                <td class="p-3 font-mono font-medium text-blue-800">${oe(f.number)}</td>
                <td class="p-3 text-gray-600">${oe(f.date).slice(0,10)}</td>
                <td class="p-3 font-medium">${oe(((g=(v=f.expand)==null?void 0:v.third_party_id)==null?void 0:g.name)||"N/A")}</td>
                <td class="p-3 text-gray-500 text-sm">${oe(f.description)}</td>
                <td class="p-3 text-center"><span class="badge ${f.status==="active"?"badge-green":"badge-gray"}">${f.status==="active"?"Activo":oe(f.status)}</span></td>
                <td class="p-3 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button title="Ver detalle" data-tx-id="${oe(f.id)}" data-tx-tipo="${t}"
                      class="teso-btn-ver inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                      <i class="fas fa-eye text-xs"></i>
                    </button>
                    <button title="Imprimir" data-tx-id="${oe(f.id)}" data-tx-tipo="${t}"
                      class="teso-btn-print inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors">
                      <i class="fas fa-print text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `}).join("")}
          </tbody>
        </table>
      </div>
    `;const p=()=>{const f=(document.getElementById("teso-filter-q").value||"").toLowerCase(),d=document.getElementById("teso-filter-from").value,y=document.getElementById("teso-filter-to").value;document.querySelectorAll("#teso-tx-table tbody tr[data-q]").forEach(v=>{var S;const g=v,h=((S=g.dataset.q)==null?void 0:S.toLowerCase())||"",_=(g.dataset.date||"").slice(0,10),A=!f||h.includes(f),I=!d||_>=d,F=!y||_<=y;g.style.display=A&&I&&F?"":"none"})};(a=document.getElementById("teso-filter-q"))==null||a.addEventListener("input",p),(o=document.getElementById("teso-filter-from"))==null||o.addEventListener("change",p),(s=document.getElementById("teso-filter-to"))==null||s.addEventListener("change",p),e.querySelectorAll(".teso-btn-ver").forEach(f=>{f.addEventListener("click",async()=>{const d=f,y=d.dataset.txId||"",v=d.dataset.txTipo||"RC";await Is(y,v)})}),e.querySelectorAll(".teso-btn-print").forEach(f=>{f.addEventListener("click",async()=>{const d=f,y=d.dataset.txId||"",v=d.dataset.txTipo||"RC";await Is(y,v,!0)})})}catch(n){e.innerHTML=`<div class="p-4 text-red-600">Error: ${n.message}</div>`}}async function Is(e,t,a=!1){var s,n;const o=Fe();try{const i=await o.get("transactions",e,{expand:"third_party_id,tx_type_id"}),r=await o.listAll("tx_lines",{filter:`tx_id="${e}"`,expand:"account_id"}),c=t==="RC",l=c?"#059669":"#DC2626",u=c?"fa-hand-holding-dollar":"fa-paper-plane",b=c?"RECIBO DE CAJA":"COMPROBANTE DE EGRESO",m=r.reduce((d,y)=>d+Number(c?y.debit||0:y.credit||0),0),p=r.map(d=>{var y,v,g,h;return`
      <tr style="border-bottom:1px solid #F3F4F6">
        <td style="padding:5px 8px;font-size:12px;font-family:monospace">${oe(((v=(y=d.expand)==null?void 0:y.account_id)==null?void 0:v.code)||"")} — ${oe(((h=(g=d.expand)==null?void 0:g.account_id)==null?void 0:h.name)||"")}</td>
        <td style="padding:5px 8px;text-align:right;font-size:12px">${Number(d.debit)>0?we(d.debit):""}</td>
        <td style="padding:5px 8px;text-align:right;font-size:12px">${Number(d.credit)>0?we(d.credit):""}</td>
        <td style="padding:5px 8px;font-size:11px;color:#9CA3AF">${oe(d.cross_doc_ref||"")}</td>
      </tr>`}).join(""),f=`
      <div style="max-width:540px;margin:0 auto;font-family:'Segoe UI',sans-serif">
        <div style="background:${l};color:#fff;padding:18px 22px;border-radius:12px 12px 0 0;display:flex;align-items:center;gap:12px">
          <i class="fas ${u}" style="font-size:22px"></i>
          <div>
            <div style="font-size:17px;font-weight:700">${b}</div>
            <div style="font-size:12px;opacity:0.85">Núm. ${oe(i.number)} &nbsp;&bull;&nbsp; ${String(i.date||"").slice(0,10)}</div>
          </div>
        </div>
        <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:18px 22px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
            <div>
              <div style="font-size:10px;text-transform:uppercase;color:#9CA3AF;font-weight:700">Tercero</div>
              <div style="font-weight:600;color:#111;font-size:14px">${oe(((n=(s=i.expand)==null?void 0:s.third_party_id)==null?void 0:n.name)||i.third_party_id||"—")}</div>
            </div>
            <div>
              <div style="font-size:10px;text-transform:uppercase;color:#9CA3AF;font-weight:700">Estado</div>
              <div style="font-weight:600;color:${i.status==="active"?"#059669":"#6B7280"};font-size:14px">${oe(i.status||"")}</div>
            </div>
          </div>
          <div style="background:${c?"#ECFDF5":"#FEF2F2"};border-radius:10px;padding:14px;margin-bottom:14px;text-align:center">
            <div style="font-size:11px;text-transform:uppercase;color:${l};font-weight:700">VALOR ${c?"RECIBIDO":"PAGADO"}</div>
            <div style="font-size:30px;font-weight:800;color:${l}">${we(m)}</div>
          </div>
          ${i.description?`<div style="margin-bottom:12px;padding:8px;background:#F9FAFB;border-radius:8px;font-size:12px;color:#6B7280">${oe(i.description)}</div>`:""}
          <div style="font-size:11px;text-transform:uppercase;color:#9CA3AF;font-weight:700;margin-bottom:6px">Asiento Contable</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="background:#F3F4F6">
                <th style="padding:5px 8px;text-align:left;border-bottom:1px solid #E5E7EB">Cuenta</th>
                <th style="padding:5px 8px;text-align:right;border-bottom:1px solid #E5E7EB">Débito</th>
                <th style="padding:5px 8px;text-align:right;border-bottom:1px solid #E5E7EB">Crédito</th>
                <th style="padding:5px 8px;text-align:left;border-bottom:1px solid #E5E7EB">Doc. Cruce</th>
              </tr>
            </thead>
            <tbody>${p}</tbody>
          </table>
          <div style="margin-top:18px;padding-top:14px;border-top:1px dashed #E5E7EB;text-align:center;font-size:11px;color:#9CA3AF">
            GRAVY v2.0 &mdash; ${new Date().toLocaleString("es-CO")}
          </div>
        </div>
      </div>`;window.openModal(`${b} — ${i.number}`,f,`<button class="btn btn-outline" onclick="closeModal()"><i class="fas fa-times mr-1"></i>Cerrar</button>
       <button class="btn btn-primary" onclick="window._printRecibo()"><i class="fas fa-print mr-1"></i>Imprimir</button>`,!1),a&&setTimeout(()=>window._printRecibo(),400)}catch(i){He("Error al cargar el detalle: "+i.message,"error")}}let Te=[],Le=null;async function Io(e,t,a){var s,n,i,r,c,l,u,b;const o=document.getElementById("teso-modal-items-container");if(o){o.innerHTML='<div class="p-4 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Buscando partidas abiertas...</div>';try{const m=Fe();let p=new Set,f=new Set;const d=a?`ANT-${a}`:`ANT-${e}`;let y=null;try{const S=await m.listAll("settings",{filter:'key="ph_config_v1"'});S.length&&(y=JSON.parse(S[0].value||"{}").anticipo_account_id||null)}catch{}if(a){if((await m.listAll("ph_invoices",{filter:`property_id="${a}" && status!="voided"`})).forEach(x=>p.add(x.number)),p.add(d),p.size<=1&&!p.has(d)){o.innerHTML='<div class="p-4 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">El inmueble no presenta saldos pendientes para esta operación.</div>';return}}else(await m.listAll("ph_invoices",{filter:`property_id.owner_id="${e}" && status!="voided"`})).forEach(x=>f.add(x.number));const v=await m.listAll("tx_lines",{filter:`third_party_id="${e}"`,expand:"tx_id,account_id"}),g=new Map;for(const S of v){if(((n=(s=S.expand)==null?void 0:s.tx_id)==null?void 0:n.status)==="voided")continue;const x=(S.cross_doc_ref||"").trim();if(!x||!(x===d&&y&&S.account_id===y)&&!((r=(i=S.expand)==null?void 0:i.account_id)!=null&&r.maneja_cruce))continue;const E=x.lastIndexOf("-")>0?x.substring(0,x.lastIndexOf("-")):x;if(a){if(!(p.has(x)||p.has(E)))continue}else if(f.has(x)||f.has(E))continue;const C=`${x}|${S.account_id}`;g.has(C)||g.set(C,{key:C,ref:x,accountId:S.account_id,accountName:((l=(c=S.expand)==null?void 0:c.account_id)==null?void 0:l.name)||"",firstDate:((b=(u=S.expand)==null?void 0:u.tx_id)==null?void 0:b.date)||"",description:S.description||"",debit:0,credit:0});const N=g.get(C);N.debit+=Number(S.debit||0),N.credit+=Number(S.credit||0)}const h=[...g.values()].map(S=>{const x=S.debit-S.credit,T=S.ref===d;let E;return T?E=Math.abs(x):E=t?x:-x,{...S,saldo:E,netOpen:x,isAnticipo:T}}),_=h.filter(S=>S.isAnticipo&&S.saldo>.01);Te=h.filter(S=>!S.isAnticipo&&S.saldo>.01).sort((S,x)=>S.firstDate.localeCompare(x.firstDate));const A=_.reduce((S,x)=>S+x.saldo,0);if(Te.length===0&&A<=.01){o.innerHTML='<div class="p-4 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">El tercero no presenta saldos pendientes para esta operación.</div>';return}const I=A>.01?`
      <div class="flex items-center gap-3 p-3 rounded-xl mb-3" style="background:#ECFDF5;border:1.5px solid #6EE7B7">
        <div class="bg-green-500 text-white rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-piggy-bank text-sm"></i>
        </div>
        <div class="flex-1">
          <p class="font-bold text-green-800 text-sm">Saldo a favor disponible</p>
          <p class="text-xs text-green-700">Este cliente tiene un anticipo de <strong>${we(A)}</strong> que se aplicará automáticamente antes de consumir el efectivo.</p>
        </div>
        <div class="font-bold text-green-700 text-lg">${we(A)}</div>
      </div>
    `:"",F=Te.length===0?`
      <div class="p-3 text-center text-gray-500 text-sm">
        <i class="fas fa-check-circle text-green-500 mr-2"></i>Cartera al día. El pago se registrará como anticipo.
      </div>
    `:"";o.innerHTML=`
      ${I}
      ${F}
      ${Te.length>0?`
      <div class="overflow-x-auto border border-gray-200 rounded-lg mb-2">
        <table class="w-full text-sm data-table">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-2 text-left">Documento / Concepto</th>
              <th class="p-2 text-left">Cuenta</th>
              <th class="p-2 text-right">Saldo Pendiente</th>
              <th class="p-2 text-right" style="width: 140px">Abono a Aplicar</th>
            </tr>
          </thead>
          <tbody>
            ${Te.map(S=>`
              <tr class="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                <td class="p-2 font-medium">
                  ${Cs==="ph"&&S.description?`<span class="block text-xs font-bold text-blue-700">${oe(S.description)}</span><span class="block text-xs text-gray-400">${oe(S.ref)} &middot; ${oe(S.firstDate.slice(0,10))}</span>`:`<span class="font-mono text-xs">${oe(S.ref)}</span><div class="text-xs text-gray-400">${oe(S.firstDate.slice(0,10))}</div>`}
                </td>
                <td class="p-2 text-gray-500 text-xs">${oe(S.accountName)}</td>
                <td class="p-2 text-right font-bold ${t?"text-red-600":"text-blue-600"}">${we(S.saldo)}</td>
                <td class="p-2 text-right">
                  <input type="number" min="0" max="${S.saldo}" class="form-input text-right w-full teso-abono-input"
                    data-key="${S.key}" data-ref="${S.ref}" data-account="${S.accountId}" data-max="${S.saldo}"
                    placeholder="0" disabled>
                </td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot class="bg-gray-50 border-t border-gray-200">
            <tr>
              <td colspan="2" class="p-2 text-right font-bold text-gray-700">Total cartera:</td>
              <td class="p-2 text-right font-bold text-red-700">${we(Te.reduce((S,x)=>S+x.saldo,0))}</td>
              <td class="p-2 text-right font-bold" id="teso-modal-total-abonos">$0</td>
            </tr>
          </tfoot>
        </table>
      </div>
      `:""}
    `,document.querySelectorAll(".teso-abono-input").forEach(S=>{S.addEventListener("input",()=>{let x=0;document.querySelectorAll(".teso-abono-input").forEach(T=>x+=Number(T.value||0)),document.getElementById("teso-modal-total-abonos").textContent=we(x)})})}catch(m){o.innerHTML=`<div class="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200"><i class="fas fa-exclamation-triangle mr-2"></i> Error: ${m.message}</div>`}}}function dl(){const e=document.getElementById("teso-modal-modo").value==="manual";if(document.querySelectorAll(".teso-abono-input").forEach(t=>{const a=t;a.disabled=!e,e||(a.value="")}),!e){const t=document.getElementById("teso-modal-total-abonos");t&&(t.textContent="$0")}}function pl(){const e=document.getElementById("teso-modal-monto"),t=document.getElementById("teso-monto-indicator");if(!e||!t)return;const a=Number(e.value||0),o=Te.reduce((i,r)=>i+r.saldo,0);if(a<=0||o<=0){t.innerHTML="";return}const s=a-o,n=Math.abs(s);Math.abs(s)<1?t.innerHTML=`
      <span class="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        <i class="fas fa-check-circle"></i> Cubre exactamente la cartera
      </span>`:s<0?t.innerHTML=`
      <span class="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
        <i class="fas fa-exclamation-triangle"></i> Pago parcial &mdash; queda ${we(n)} por cobrar
      </span>`:t.innerHTML=`
      <span class="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
        <i class="fas fa-piggy-bank"></i> Excedente ${we(n)} &rarr; se registrará como anticipo
      </span>`}async function ul(e){var y,v,g;const t=document.getElementById("teso-modal-monto"),a=document.getElementById("teso-modal-modo"),o=document.getElementById("teso-modal-cuenta"),s=document.getElementById("teso-modal-referencia"),n=document.getElementById("teso-modal-obs"),i=Number((t==null?void 0:t.value)||0),r=(a==null?void 0:a.value)||"auto",c=(o==null?void 0:o.value)||"",l=o==null?void 0:o.options[o.selectedIndex],u=((y=l==null?void 0:l.dataset)==null?void 0:y.account)||"",b=((v=s==null?void 0:s.value)==null?void 0:v.trim())||"",m=((g=n==null?void 0:n.value)==null?void 0:g.trim())||"";if(!Le){He("Debes seleccionar un tercero o unidad","warning");return}if(!u||!c){He("Debes seleccionar un método de pago válido","warning");return}let p=[];if(r==="manual"){let h=0;if(document.querySelectorAll(".teso-abono-input").forEach(_=>{const A=_,I=Number(A.value);I>0&&(p.push({key:A.dataset.key,cross_doc_ref:A.dataset.ref,account_id:A.dataset.account,monto:I}),h+=I)}),h<=0){He("Debes indicar al menos un abono manual mayor a 0","warning");return}}else{if(i<=0){He("El monto debe ser mayor a $0 para poder registrar el recaudo","warning"),t==null||t.focus();return}if(Te.reduce((_,A)=>_+A.saldo,0)<=0&&i>0&&!window.confirm(`Este tercero no tiene cartera abierta.
Se registrará un anticipo de ${we(i)} a su favor.

¿Continuar?`))return}const f=document.getElementById("btn-save-teso-tx");f&&(f.disabled=!0,f.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...');const d=e?"RC":"CE";try{const h=Fe(),_=await h.listAll("transaction_types",{filter:`code="${d}"`});if(!_.length)throw new Error(`Falta tipo de transacción ${d}`);const A={third_party_id:Le.id,amount:r==="manual"?p.reduce((E,C)=>E+C.monto,0):i,contrapartida_account_id:u};if(Cs==="ph"&&Fa&&(A.ph_property_id=Fa),r==="manual")A.distribucion=p;else{const E=await h.listAll("settings",{filter:'key="treasury_rules"'});let C={primeroVencido:!0,primeroMora:!0};if(E.length&&E[0].value)try{C=JSON.parse(E[0].value)}catch{}A.reglas=C}const I=A.amount,F=new Date().toISOString().slice(0,10),S=`${d}-${Date.now()}`,x=Le.name||Le.doc_number||"",T=(l==null?void 0:l.text)||"";await h.create("transactions",{tx_type_id:_[0].id,number:S,date:F,third_party_id:Le.id,description:m||`${e?"Recaudo":"Pago"} vía Módulo Tesorería${b?" Ref: "+b:""}`,status:"active",teso_mode:r,teso_params:JSON.stringify(A)}),ur(),fl({tipo:e?"RECIBO DE CAJA":"COMPROBANTE DE EGRESO",numero:S,fecha:F,tercero:x,monto:I,cuenta:T,referencia:b,observaciones:m,partidas:Te.slice(),modo:r}),To(document.getElementById("teso-content"),d)}catch(h){console.error(h);const _=h.data?JSON.stringify(h.data):"";He(`Error: ${h.message} ${_}`,"error"),f&&(f.disabled=!1,f.innerHTML=`<i class="fas fa-paper-plane mr-2"></i>Registrar ${d}`)}}function $a(e){const t=["","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez","once","doce","trece","catorce","quince","dieciseis","diecisiete","dieciocho","diecinueve","veinte","veintiuno","veintidos","veintitres","veinticuatro","veinticinco","veintiseis","veintisiete","veintiocho","veintinueve"],a=["","","veinte","treinta","cuarenta","cincuenta","sesenta","setenta","ochenta","noventa"],o=["","ciento","doscientos","trescientos","cuatrocientos","quinientos","seiscientos","setecientos","ochocientos","novecientos"];if(e===0)return"cero";if(e<0)return"menos "+$a(-e);const s=Math.floor(e),n=Math.round((e-s)*100);let i="";if(s>=1e6){const u=Math.floor(s/1e6);i+=u===1?"un millon ":$a(u)+" millones "}if(s>=1e3){const u=Math.floor(s%1e6/1e3);i+=u===1?"mil ":$a(u)+" mil "}const r=s%1e3;r>=100&&(i+=r===100?"cien ":o[Math.floor(r/100)]+" ");const c=r%100;c>0&&c<30?i+=t[c]+" ":c>=30&&(i+=a[Math.floor(c/10)]+(c%10>0?" y "+t[c%10]+" ":" "));const l=i.trim();return l.charAt(0).toUpperCase()+l.slice(1)+" pesos"+(n>0?" con "+n+"/100":" con 00/100")+" M/Cte."}async function ml(e,t=[]){const a=(e.tipo||"").includes("CAJA"),o=a?"#1D6F42":"#B91C1C",s=a?"#F0FDF4":"#FFF1F2",n=a?"#D1FAE5":"#FECDD3",i=a?"RECIBO DE CAJA":"COMPROBANTE DE EGRESO",r=Fe();let c={name:"",nit:"",address:"",phone:"",email:""},l="";try{const h=await r.listAll("settings",{}),_=Object.fromEntries(h.map(A=>[A.key,A.value||""]));c={name:_.company_name||"",nit:_.company_nit||"",address:_.company_address||"",phone:_.company_phone||"",email:_.company_email||""},l=_.representante_legal_name||_.legal_representative_name||""}catch{}const u=e.terceroObj||{},b=u.name||e.tercero||"",m=u.doc_number||"",p=u.email||"",f=u.phone||"",d=u.address||"",y=$a(Number(e.monto||0)),v=(e.partidas||[]).map(h=>`<tr style="border-bottom:1px solid #E5E7EB">
      <td style="padding:5px 10px;font-size:12px">${oe(h.ref||"")}${h.description?" - "+oe(h.description):""}</td>
      <td style="padding:5px 10px;font-size:12px;text-align:right">${we(h.saldo)}</td>
    </tr>`).join(""),g=t.map(h=>{var _,A,I,F;return`<tr style="border-bottom:1px solid #E5E7EB">
      <td style="padding:4px 10px;font-size:11px;font-family:monospace">${oe(((A=(_=h.expand)==null?void 0:_.account_id)==null?void 0:A.code)||"")} - ${oe(((F=(I=h.expand)==null?void 0:I.account_id)==null?void 0:F.name)||"")}</td>
      <td style="padding:4px 10px;font-size:11px;text-align:right">${Number(h.debit)>0?we(h.debit):""}</td>
      <td style="padding:4px 10px;font-size:11px;text-align:right">${Number(h.credit)>0?we(h.credit):""}</td>
      <td style="padding:4px 10px;font-size:11px;color:#9CA3AF">${oe(h.cross_doc_ref||"")}</td>
    </tr>`}).join("");return`<!DOCTYPE html><html lang="es"><head>
  <meta charset="UTF-8">
  <title>${i} ${e.numero||""}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#111;background:#fff}
    .page{width:216mm;min-height:279mm;margin:0 auto;padding:14mm 16mm;background:#fff}
    .no-print{text-align:center;padding:12px;background:#F3F4F6;border-top:1px solid #E5E7EB}
    table{border-collapse:collapse;width:100%}
    @media print{.no-print{display:none}@page{size:letter;margin:12mm 14mm}}
  </style>
</head><body>
<div class="page">

  <table style="margin-bottom:14px">
    <tr>
      <td style="width:65%;vertical-align:top">
        <div style="font-size:18px;font-weight:800;color:#0D2137">${oe(c.name)||"Razon Social"}</div>
        ${c.nit?`<div style="font-size:11px;color:#6B7280">NIT: ${oe(c.nit)}</div>`:""}
        ${c.address?`<div style="font-size:11px;color:#6B7280">${oe(c.address)}</div>`:""}
        ${c.phone?`<div style="font-size:11px;color:#6B7280">Tel: ${oe(c.phone)}${c.email?" | "+oe(c.email):""}</div>`:""}
      </td>
      <td style="width:35%;vertical-align:top;text-align:right">
        <div style="display:inline-block;background:${o};color:#fff;padding:8px 16px;border-radius:8px;text-align:center">
          <div style="font-size:11px;font-weight:800;letter-spacing:1px">${i}</div>
          <div style="font-size:22px;font-weight:900;letter-spacing:2px">No. ${oe(e.numero||"")}</div>
        </div>
      </td>
    </tr>
  </table>

  <hr style="border:none;border-top:2px solid ${o};margin-bottom:12px">

  <table style="margin-bottom:12px;font-size:12px">
    <tr>
      <td style="width:50%;vertical-align:top;padding-right:12px">
        <div style="background:${s};border:1px solid ${n};border-radius:8px;padding:10px 12px">
          <div style="font-size:9px;text-transform:uppercase;font-weight:700;color:${o};margin-bottom:6px">DATOS DEL ${a?"CLIENTE":"PROVEEDOR"}</div>
          <div style="font-weight:700;font-size:13px;color:#111">${oe(b)||"---"}</div>
          ${m?`<div style="color:#374151">C.C./NIT: <strong>${oe(m)}</strong></div>`:""}
          ${d?`<div style="color:#6B7280;font-size:11px">${oe(d)}</div>`:""}
          ${f?`<div style="color:#6B7280;font-size:11px">Tel: ${oe(f)}</div>`:""}
          ${p?`<div style="color:#6B7280;font-size:11px">${oe(p)}</div>`:""}
        </div>
      </td>
      <td style="width:50%;vertical-align:top">
        <table style="font-size:12px;width:100%">
          <tr><td style="color:#6B7280;padding:3px 0">Fecha:</td><td style="font-weight:700;text-align:right">${oe(String(e.fecha||"").slice(0,10))}</td></tr>
          <tr><td style="color:#6B7280;padding:3px 0">Metodo ${a?"recaudo":"pago"}:</td><td style="text-align:right;font-size:11px">${oe(e.cuenta||"")}</td></tr>
          ${e.referencia?`<tr><td style="color:#6B7280;padding:3px 0">Referencia:</td><td style="font-weight:700;text-align:right">${oe(e.referencia)}</td></tr>`:""}
        </table>
      </td>
    </tr>
  </table>

  <div style="background:${s};border:1.5px solid ${n};border-radius:10px;padding:12px 16px;margin-bottom:12px">
    <div style="font-size:9px;text-transform:uppercase;font-weight:700;color:${o}">VALOR ${a?"RECIBIDO":"PAGADO"}</div>
    <div style="font-size:28px;font-weight:900;color:${o}">${we(e.monto||0)}</div>
    <div style="font-size:10px;color:#374151;margin-top:2px;font-style:italic">${y}</div>
  </div>

  ${(e.partidas||[]).length>0?`
  <div style="margin-bottom:12px">
    <div style="font-size:9px;text-transform:uppercase;font-weight:700;color:#374151;margin-bottom:4px">DETALLE DE APLICACION</div>
    <table style="border:1px solid #E5E7EB">
      <thead><tr style="background:#F3F4F6">
        <th style="padding:5px 10px;text-align:left;font-size:11px">Documento / Concepto</th>
        <th style="padding:5px 10px;text-align:right;font-size:11px">Valor</th>
      </tr></thead>
      <tbody>${v}</tbody>
    </table>
  </div>`:'<div style="font-size:11px;color:#6B7280;margin-bottom:12px;font-style:italic">Registrado como anticipo - sin cartera abierta a la fecha.</div>'}

  ${g?`
  <div style="margin-bottom:12px">
    <div style="font-size:9px;text-transform:uppercase;font-weight:700;color:#374151;margin-bottom:4px">ASIENTO CONTABLE</div>
    <table style="border:1px solid #E5E7EB">
      <thead><tr style="background:#F3F4F6">
        <th style="padding:4px 10px;text-align:left;font-size:11px">Cuenta</th>
        <th style="padding:4px 10px;text-align:right;font-size:11px">Debito</th>
        <th style="padding:4px 10px;text-align:right;font-size:11px">Credito</th>
        <th style="padding:4px 10px;text-align:left;font-size:11px">Doc. Cruce</th>
      </tr></thead>
      <tbody>${g}</tbody>
    </table>
  </div>`:""}

  ${e.observaciones?`
  <div style="border:1px solid #E5E7EB;border-radius:6px;padding:8px 12px;margin-bottom:12px;font-size:12px">
    <span style="font-size:9px;text-transform:uppercase;font-weight:700;color:#6B7280">Observaciones: </span>
    <span style="color:#374151">${oe(e.observaciones)}</span>
  </div>`:""}

  <div style="display:flex;gap:40px;justify-content:space-around;margin-top:36px">
    <div style="text-align:center;flex:1">
      <div style="border-top:1px solid #374151;padding-top:6px;margin-top:40px">
        <div style="font-size:11px;font-weight:700;color:#111">${l||"&nbsp;"}</div>
        <div style="font-size:10px;color:#6B7280">Elaborado por</div>
      </div>
    </div>
    <div style="text-align:center;flex:1">
      <div style="border-top:1px solid #374151;padding-top:6px;margin-top:40px">
        <div style="font-size:11px;font-weight:700;color:#111">&nbsp;</div>
        <div style="font-size:10px;color:#6B7280">Firma Recibido</div>
        ${m?`<div style="font-size:9px;color:#9CA3AF">C.C./NIT: ${oe(m)}</div>`:""}
      </div>
    </div>
  </div>

  <div style="margin-top:16px;padding-top:8px;border-top:1px dashed #D1D5DB;text-align:center;font-size:9px;color:#9CA3AF">
    GRAVY v2.0 - Generado el ${new Date().toLocaleString("es-CO")} - Documento de control interno
  </div>

</div>
<div class="no-print">
  <button onclick="window.print()" style="padding:9px 24px;background:#1E40AF;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600">
    Imprimir
  </button>
  <button onclick="window.close()" style="margin-left:10px;padding:9px 20px;background:#E5E7EB;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:14px">
    Cerrar
  </button>
</div>
</body></html>`}async function fl(e){const t=(e.tipo||"").includes("CAJA");Le&&(e.terceroObj=Le);const a=await ml(e),o=`
    <div style="font-size:12px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;text-align:center">
      <i class="fas fa-check-circle" style="font-size:24px;color:${t?"#059669":"#DC2626"}"></i>
      <p style="font-weight:700;margin-top:8px;font-size:14px">${oe(e.tipo)} registrado</p>
      <p style="color:#6B7280;font-size:11px;margin-top:4px">No. <strong>${oe(e.numero)}</strong> &bull; Valor: <strong>${we(e.monto)}</strong></p>
      <p style="color:#6B7280;font-size:11px;margin-top:4px">Haz clic en <strong>Imprimir Recibo</strong> para abrir el formato carta.</p>
    </div>`;window.openModal(`${e.tipo} registrado`,o,`<button class="btn btn-outline" onclick="closeModal()"><i class="fas fa-times mr-1"></i>Cerrar</button>
     <button class="btn btn-primary" id="btn-print-recibo"><i class="fas fa-print mr-1"></i>Imprimir Recibo</button>`,!1),setTimeout(()=>{var s;(s=document.getElementById("btn-print-recibo"))==null||s.addEventListener("click",()=>{const n=window.open("","_blank","width=900,height=750");n&&(n.document.write(a),n.document.close())})},100)}window._printRecibo=async e=>{if(e){const o=window.open("","_blank","width=900,height=750");o&&(o.document.write(e),o.document.close());return}const t=document.getElementById("modal-body")||document.querySelector("[id*=modal] > div");if(!t)return;const a=window.open("","_blank","width=900,height=750");a&&(a.document.write(t.innerHTML),a.document.close())};async function bl(){Te=[],Le=null,ca.length||(ca=await Fe().listAll("third_parties",{filter:"active=true",sort:"name"}));const t=`
    <div class="flex flex-col h-full gap-3">
      <!-- DASHBOARD PANORÁMICO DE 4 COLUMNAS -->
      <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        <!-- Tercero -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" id="teso-lbl-tercero">Tercero (Cliente)</label>
          <div id="modal-rc-wrap" class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-search"></i></div>
            <input id="modal-rc-search" class="form-input pl-8 py-2 text-sm bg-gray-50 focus:bg-white transition-colors" autocomplete="off" placeholder="Buscar...">
            <input id="modal-rc-hidden" type="hidden" value="">
            <div id="modal-rc-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:50"></div>
          </div>
        </div>

        <!-- Monto -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Monto a Recibir</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-green-600 font-bold">$</div>
            <input id="teso-modal-monto" type="number" min="1"
              class="form-input pl-7 py-2 font-bold text-green-700 bg-green-50/30 border-green-200 focus:border-green-500 focus:ring-green-100 placeholder-green-300"
              placeholder="0.00" oninput="window._updateMontoIndicator()">
          </div>
          <div id="teso-monto-indicator" class="mt-1 min-h-[20px]"></div>
        </div>

        <!-- Método de Pago -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Método / Banco</label>
          <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-university"></i></div>
             <select id="teso-modal-cuenta" class="form-input pl-8 py-2 text-sm bg-gray-50">
               <option value="">— Seleccionar —</option>
               ${(await Fe().listAll("bank_accounts",{expand:"account_id",filter:"active=true",sort:"name"})).map(o=>`<option value="${o.id}" data-account="${o.account_id}">${oe(o.name)} (${oe(o.bank)})</option>`).join("")}
             </select>
          </div>
        </div>

        <!-- Modo Aplicación -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Aplicación</label>
          <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-blue-500"><i class="fas fa-magic"></i></div>
             <select id="teso-modal-modo" class="form-input pl-8 py-2 text-sm font-medium text-blue-700 bg-blue-50 border-blue-200 focus:border-blue-500" onchange="window._toggleModalManualMode()">
               <option value="auto">Automática</option>
               <option value="manual">Manual (Grilla)</option>
             </select>
          </div>
        </div>
      </div>
      
      <!-- CONTENEDOR DE CARTERA (GRILLA) -->
      <div id="teso-modal-items-container" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center text-gray-400 min-h-[300px] shadow-inner overflow-hidden">
        <div class="text-center">
          <div class="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-search-dollar text-2xl text-gray-400"></i>
          </div>
          <p class="font-medium text-gray-500">Busca un tercero para visualizar su cartera</p>
        </div>
      </div>

      <!-- FILA INFERIOR: Referencia + Observaciones -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><i class="fas fa-hashtag mr-1"></i>Número de Referencia</label>
          <input id="teso-modal-referencia" type="text" class="form-input py-2 text-sm" placeholder="No. recibo, transferencia, etc.">
        </div>
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><i class="fas fa-comment-alt mr-1"></i>Observaciones</label>
          <input id="teso-modal-obs" type="text" class="form-input py-2 text-sm" placeholder="Nota interna opcional...">
        </div>
      </div>
    </div>
  `;Es("Nuevo Recibo de Caja",t,`
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-teso-tx" onclick="window._saveTransaccionTeso(true)">
      <i class="fas fa-paper-plane mr-2"></i>Registrar RC
    </button>
  `,!0),setTimeout(async()=>{try{const o=await Fe().listAll("settings",{filter:'key="treasury_rules"'});let s={modoOperacion:"comercial"};if(o.length&&o[0].value)try{s={...s,...JSON.parse(o[0].value)}}catch{}window._changeTesoOrigen(s.modoOperacion==="ph"?"ph":"comercial")}catch{window._changeTesoOrigen("comercial")}},50)}async function gl(){Te=[],Le=null,ca.length||(ca=await Fe().listAll("third_parties",{filter:"active=true",sort:"name"}));const t=`
    <div class="flex flex-col h-full gap-3">
      <!-- DASHBOARD PANORÁMICO DE 4 COLUMNAS -->
      <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        <!-- Tercero -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Proveedor / Acreedor</label>
          <div id="modal-eg-wrap" class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-search"></i></div>
            <input id="modal-eg-search" class="form-input pl-8 py-2 text-sm bg-gray-50 focus:bg-white transition-colors" autocomplete="off" placeholder="Buscar...">
            <input id="modal-eg-hidden" type="hidden" value="">
            <div id="modal-eg-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:50"></div>
          </div>
        </div>

        <!-- Monto -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Monto a Pagar</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-red-600 font-bold">$</div>
            <input id="teso-modal-monto" type="number" min="1" class="form-input pl-7 py-2 font-bold text-red-700 bg-red-50/30 border-red-200 focus:border-red-500 focus:ring-red-100 placeholder-red-300" placeholder="0.00">
          </div>
        </div>

        <!-- Método de Pago -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cuenta de Origen</label>
          <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-university"></i></div>
             <select id="teso-modal-cuenta" class="form-input pl-8 py-2 text-sm bg-gray-50">
               <option value="">— Seleccionar —</option>
               ${(await Fe().listAll("bank_accounts",{expand:"account_id",filter:"active=true",sort:"name"})).map(o=>`<option value="${o.id}" data-account="${o.account_id}">${oe(o.name)} (${oe(o.bank)})</option>`).join("")}
             </select>
          </div>
        </div>

        <!-- Modo Aplicación -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Aplicación</label>
          <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-blue-500"><i class="fas fa-magic"></i></div>
             <select id="teso-modal-modo" class="form-input pl-8 py-2 text-sm font-medium text-blue-700 bg-blue-50 border-blue-200 focus:border-blue-500" onchange="window._toggleModalManualMode()">
               <option value="auto">Automática</option>
               <option value="manual">Manual (Grilla)</option>
             </select>
          </div>
        </div>
      </div>
      
      <!-- CONTENEDOR DE CARTERA (GRILLA) -->
      <div id="teso-modal-items-container" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center text-gray-400 min-h-[300px] shadow-inner overflow-hidden">
        <div class="text-center">
          <div class="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-file-invoice-dollar text-2xl text-gray-400"></i>
          </div>
          <p class="font-medium text-gray-500">Busca un proveedor para visualizar sus obligaciones</p>
        </div>
      </div>

      <!-- FILA INFERIOR: Referencia + Observaciones -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><i class="fas fa-hashtag mr-1"></i>Número de Referencia</label>
          <input id="teso-modal-referencia" type="text" class="form-input py-2 text-sm" placeholder="No. cheque, transferencia, etc.">
        </div>
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><i class="fas fa-comment-alt mr-1"></i>Observaciones</label>
          <input id="teso-modal-obs" type="text" class="form-input py-2 text-sm" placeholder="Nota interna opcional...">
        </div>
      </div>
    </div>
  `;Es("Nuevo Comprobante de Egreso",t,`
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-danger" id="btn-save-teso-tx" onclick="window._saveTransaccionTeso(false)">
      <i class="fas fa-paper-plane mr-2"></i>Registrar Pago
    </button>
  `,!0),setTimeout(()=>{mr("modal-eg-wrap","modal-eg-search","modal-eg-hidden","modal-eg-results",o=>o.type==="PROVEEDOR"||o.type==="ACREEDOR",o=>{Le=o,Io(o.id,!1).then(()=>{const s=Te.reduce((n,i)=>n+i.saldo,0);if(s>0){const n=document.getElementById("teso-modal-monto");n&&!n.value&&(n.value=String(Math.round(s)))}})})},50)}async function vl(){const e=document.getElementById("teso-content");if(e)try{const t=Fe(),[a,o]=await Promise.all([t.listAll("tx_lines",{filter:"debit > credit"}),t.listAll("tx_lines",{filter:"credit > debit"})]),s=a.reduce((i,r)=>i+(r.debit-r.credit),0),n=o.reduce((i,r)=>i+(r.credit-r.debit),0);e.innerHTML=`
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-sm">
          <div class="text-sm font-semibold text-green-800 mb-1 flex items-center"><i class="fas fa-hand-holding-dollar mr-2"></i> Total Cuentas por Cobrar</div>
          <div class="text-4xl font-bold text-green-900 my-2">${we(s)}</div>
          <div class="text-sm text-green-700">${a.length} partidas abiertas a favor</div>
        </div>
        <div class="p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-sm">
          <div class="text-sm font-semibold text-red-800 mb-1 flex items-center"><i class="fas fa-file-invoice-dollar mr-2"></i> Total Cuentas por Pagar</div>
          <div class="text-4xl font-bold text-red-900 my-2">${we(n)}</div>
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
      </div>`}catch(t){e.innerHTML=`<div class="text-red-500 p-4">Error cargando dashboard: ${t.message}</div>`}}async function hl(){try{const e=Fe(),t=await e.listAll("settings",{filter:'key="treasury_rules"'}),a=await e.listAll("accounts",{filter:"level>=3",sort:"code"});let o={primeroVencido:!0,primeroMora:!0,interesPrioridad:!0,cuentasInteres:[]},s="";if(t.length>0&&(s=t[0].id,t[0].value))try{o={...o,...JSON.parse(t[0].value)}}catch{}const n=a.map(c=>`<option value="${c.code}">${c.code} - ${c.name}</option>`).join(""),i=`
      <div class="space-y-6">
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
          <h4 class="font-bold text-gray-800 mb-3"><i class="fas fa-building mr-2 text-blue-600"></i>Modo de Operación de Recaudos</h4>
          <p class="text-xs text-gray-500 mb-4">Define el comportamiento predeterminado para buscar la cartera al hacer un Recibo de Caja.</p>
          <div class="space-y-3">
            <label class="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
              <input type="radio" name="teso-cfg-modo-operacion" value="comercial" class="mt-1 w-4 h-4 text-blue-600" ${o.modoOperacion!=="ph"?"checked":""}>
              <div>
                <span class="block font-semibold text-sm text-gray-800">Comercial (Búsqueda por Tercero)</span>
                <span class="block text-xs text-gray-500 mt-1">Busca clientes de forma global por nombre o documento.</span>
              </div>
            </label>
            <label class="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
              <input type="radio" name="teso-cfg-modo-operacion" value="ph" class="mt-1 w-4 h-4 text-blue-600" ${o.modoOperacion==="ph"?"checked":""}>
              <div>
                <span class="block font-semibold text-sm text-gray-800">Propiedad Horizontal (Búsqueda por Unidad)</span>
                <span class="block text-xs text-gray-500 mt-1">Busca inmuebles (Ej: APTO A101) para filtrar y pagar solo la cartera de esa unidad.</span>
              </div>
            </label>
          </div>
        </div>

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
    `;Es("Configuración de Tesorería Automática",i,`
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-cfg">
        <i class="fas fa-save mr-2"></i>Guardar Reglas
      </button>
    `,!1),document.getElementById("btn-save-cfg").onclick=async()=>{var y;const c=document.getElementById("btn-save-cfg");c.disabled=!0,c.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';const l=document.getElementById("teso-cfg-fifo").checked,u=document.getElementById("teso-cfg-mora").checked,b=document.getElementById("teso-cfg-interes").checked,p=document.getElementById("teso-cfg-cuentas-interes").value.split(",").map(v=>v.trim()).filter(v=>v.length>0),f=((y=document.querySelector('input[name="teso-cfg-modo-operacion"]:checked'))==null?void 0:y.value)||"comercial",d={key:"treasury_rules",value:JSON.stringify({modoOperacion:f,primeroVencido:l,primeroMora:u,interesPrioridad:b,cuentasInteres:p})};try{s?await e.update("settings",s,d):await e.create("settings",d),He("Reglas guardadas correctamente","success"),ur()}catch(v){He(`Error: ${v.message}`,"error"),c.disabled=!1,c.innerHTML='<i class="fas fa-save mr-2"></i>Guardar Reglas'}}}catch(e){He(`Error al abrir configuración: ${e.message}`,"error")}}function fr(e){const t=e||document.getElementById("page-content");t&&(t.innerHTML=`
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
  `,document.querySelectorAll(".teso-tab").forEach(a=>{a.addEventListener("click",o=>{const s=o.target.dataset.target;Ss(s)})}),Ss("dashboard"))}function Ss(e){document.querySelectorAll(".teso-tab").forEach(a=>{a.dataset.target===e?(a.classList.add("text-blue-600","border-blue-600"),a.classList.remove("text-gray-500","border-transparent")):(a.classList.remove("text-blue-600","border-blue-600"),a.classList.add("text-gray-500","border-transparent"))});const t=document.getElementById("teso-content");e==="dashboard"&&vl(),e==="recaudos"&&To(t,"RC"),e==="pagos"&&To(t,"CE")}window.registerModule&&window.registerModule("tesoreria",fr);window.showTesoreriaScreen=fr;window.openRecaudoModal=bl;window.openPagoModal=gl;window.openTesoreriaConfigModal=hl;window._toggleModalManualMode=dl;window._saveTransaccionTeso=ul;window._updateMontoIndicator=pl;window._changeTesoOrigen=_changeTesoOrigen;document.addEventListener("DOMContentLoaded",async()=>{var s,n,i,r,c,l,u,b,m,p,f;"serviceWorker"in navigator&&navigator.serviceWorker.register("/sw.js").catch(d=>console.warn("[SW] No se pudo registrar:",d)),(s=$("#modal-close-btn"))==null||s.addEventListener("click",closeModal);let e=!1;(n=$("#modal-overlay"))==null||n.addEventListener("pointerdown",d=>{e=d.target===$("#modal-overlay")}),(i=$("#modal-box"))==null||i.addEventListener("pointerdown",()=>{e=!1}),(r=$("#modal-overlay"))==null||r.addEventListener("click",d=>{d.target===$("#modal-overlay")&&e&&closeModal(),e=!1}),(c=$("#btn-login"))==null||c.addEventListener("click",doLogin),(l=$("#btn-toggle-pass"))==null||l.addEventListener("click",togglePassVisibility),(u=$("#login-pass"))==null||u.addEventListener("keydown",d=>{d.key==="Enter"&&doLogin()}),(b=$("#login-email"))==null||b.addEventListener("keydown",d=>{var y;d.key==="Enter"&&((y=$("#login-pass"))==null||y.focus())}),(m=$("#btn-logout"))==null||m.addEventListener("click",doLogout),$$("#nav-menu .nav-item").forEach(d=>d.addEventListener("click",()=>navigate(d.dataset.page)));const t=$("#sidebar"),a=$("#screen-app");function o(d,y=!0){!t||!a||(y||(t.style.transition="none",requestAnimationFrame(()=>{t.style.transition=""})),t.classList.toggle("collapsed",d),a.classList.toggle("sidebar-collapsed",d),localStorage.setItem("sidebar-collapsed",d?"1":"0"))}o(localStorage.getItem("sidebar-collapsed")==="1",!1),(p=$("#btn-menu-toggle"))==null||p.addEventListener("click",()=>{window.innerWidth<=768?t==null||t.classList.toggle("open"):o(!(t!=null&&t.classList.contains("collapsed")))}),(f=$("#sidebar-hamburger"))==null||f.addEventListener("click",()=>o(!1)),function(){const d=document.createElement("div");d.style.cssText="position:fixed;z-index:400;padding:5px 13px;border-radius:8px;font-size:12px;font-weight:600;font-family:Plus Jakarta Sans,sans-serif;color:#fff;background:#111E43;border:1px solid rgba(100,225,255,.25);box-shadow:0 4px 20px rgba(5,8,20,.5);pointer-events:none;opacity:0;transition:opacity .15s;white-space:nowrap;",document.body.appendChild(d);const y=$("#nav-menu");y==null||y.addEventListener("mouseover",v=>{const g=v.target.closest(".nav-item");if(!g||!(t!=null&&t.classList.contains("collapsed"))||!g.dataset.label)return;const h=g.getBoundingClientRect();d.textContent=g.dataset.label,d.style.left=h.right+10+"px",d.style.top=h.top+h.height/2+"px",d.style.transform="translateY(-50%)",d.style.opacity="1"}),y==null||y.addEventListener("mouseout",v=>{var g,h;(h=(g=v.relatedTarget)==null?void 0:g.closest)!=null&&h.call(g,".nav-item")||(d.style.opacity="0")}),y==null||y.addEventListener("mouseleave",()=>{d.style.opacity="0"})}(),await br()});async function br(){const e=$("#loading-msg"),t=s=>{e&&(e.textContent=s)};if(t("Verificando servidor..."),!await pb.ping()){t("No se puede conectar al servidor. ¿Está ejecutando start.bat?");const s=$("#screen-loading");s&&(s.innerHTML=`
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
        </div>`);return}if(t("Verificando sesión..."),pb.currentUser&&pb.authToken)try{await pb.authRefresh(),So(),await showApp(),startConnCheck();return}catch{pb.logout()}So(),showLogin(),startConnCheck()}function So(){const e=$("#screen-loading");e&&(e.classList.add("fade-out"),setTimeout(()=>{e.style.display="none"},500))}window.initApp=br;window.hideSplash=So;
