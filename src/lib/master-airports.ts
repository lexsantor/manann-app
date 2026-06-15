// Aeropuertos de carga — códigos IATA con ciudad y país.
// Top-300 por volumen de carga aérea internacional.
export interface MasterAirport {
  iata: string;
  icao?: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
}

export const MASTER_AIRPORTS: MasterAirport[] = [
  // Asia-Pacífico (mayor volumen mundial)
  { iata: "HKG", icao: "VHHH", name: "Hong Kong International", city: "Hong Kong", country: "Hong Kong", countryCode: "HK" },
  { iata: "PVG", icao: "ZSPD", name: "Pudong International", city: "Shanghái", country: "China", countryCode: "CN" },
  { iata: "ICN", icao: "RKSI", name: "Incheon International", city: "Seúl", country: "Corea del Sur", countryCode: "KR" },
  { iata: "SIN", icao: "WSSS", name: "Changi Airport", city: "Singapur", country: "Singapur", countryCode: "SG" },
  { iata: "NRT", icao: "RJAA", name: "Narita International", city: "Tokio", country: "Japón", countryCode: "JP" },
  { iata: "KIX", icao: "RJBB", name: "Kansai International", city: "Osaka", country: "Japón", countryCode: "JP" },
  { iata: "SHA", icao: "ZSSS", name: "Hongqiao International", city: "Shanghái", country: "China", countryCode: "CN" },
  { iata: "CAN", icao: "ZGGG", name: "Baiyun International", city: "Guangzhou", country: "China", countryCode: "CN" },
  { iata: "PEK", icao: "ZBAA", name: "Capital International", city: "Pekín", country: "China", countryCode: "CN" },
  { iata: "PKX", icao: "ZBAD", name: "Daxing International", city: "Pekín", country: "China", countryCode: "CN" },
  { iata: "CTU", icao: "ZUUU", name: "Tianfu International", city: "Chengdú", country: "China", countryCode: "CN" },
  { iata: "WUH", icao: "ZHHH", name: "Tianhe International", city: "Wuhan", country: "China", countryCode: "CN" },
  { iata: "XIY", icao: "ZLXY", name: "Xianyang International", city: "Xi'an", country: "China", countryCode: "CN" },
  { iata: "TSN", icao: "ZBTJ", name: "Binhai International", city: "Tianjin", country: "China", countryCode: "CN" },
  { iata: "SZX", icao: "ZGSZ", name: "Bao'an International", city: "Shenzhen", country: "China", countryCode: "CN" },
  { iata: "BOM", icao: "VABB", name: "Chhatrapati Shivaji Maharaj", city: "Bombay", country: "India", countryCode: "IN" },
  { iata: "DEL", icao: "VIDP", name: "Indira Gandhi International", city: "Delhi", country: "India", countryCode: "IN" },
  { iata: "KUL", icao: "WMKK", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malasia", countryCode: "MY" },
  { iata: "BKK", icao: "VTBS", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Tailandia", countryCode: "TH" },
  { iata: "SGN", icao: "VVTS", name: "Tan Son Nhat International", city: "Ho Chi Minh", country: "Vietnam", countryCode: "VN" },
  { iata: "HAN", icao: "VVNB", name: "Noi Bai International", city: "Hanói", country: "Vietnam", countryCode: "VN" },
  { iata: "CGK", icao: "WIII", name: "Soekarno-Hatta International", city: "Yakarta", country: "Indonesia", countryCode: "ID" },
  { iata: "MNL", icao: "RPLL", name: "Ninoy Aquino International", city: "Manila", country: "Filipinas", countryCode: "PH" },
  { iata: "SYD", icao: "YSSY", name: "Kingsford Smith International", city: "Sídney", country: "Australia", countryCode: "AU" },
  { iata: "MEL", icao: "YMML", name: "Melbourne Airport", city: "Melbourne", country: "Australia", countryCode: "AU" },
  { iata: "AKL", icao: "NZAA", name: "Auckland Airport", city: "Auckland", country: "Nueva Zelanda", countryCode: "NZ" },
  // Oriente Medio
  { iata: "DXB", icao: "OMDB", name: "Dubai International", city: "Dubái", country: "EAU", countryCode: "AE" },
  { iata: "DOH", icao: "OTHH", name: "Hamad International", city: "Doha", country: "Catar", countryCode: "QA" },
  { iata: "AUH", icao: "OMAA", name: "Abu Dhabi International", city: "Abu Dabi", country: "EAU", countryCode: "AE" },
  { iata: "RUH", icao: "OERK", name: "Rey Khalid International", city: "Riad", country: "Arabia Saudí", countryCode: "SA" },
  { iata: "JED", icao: "OEJN", name: "Rey Abdulaziz International", city: "Yeda", country: "Arabia Saudí", countryCode: "SA" },
  { iata: "KWI", icao: "OKBK", name: "Kuwait International", city: "Kuwait", country: "Kuwait", countryCode: "KW" },
  { iata: "BAH", icao: "OBBI", name: "Bahrein International", city: "Manama", country: "Baréin", countryCode: "BH" },
  // Europa
  { iata: "FRA", icao: "EDDF", name: "Frankfurt am Main", city: "Frankfurt", country: "Alemania", countryCode: "DE" },
  { iata: "AMS", icao: "EHAM", name: "Amsterdam Schiphol", city: "Ámsterdam", country: "Países Bajos", countryCode: "NL" },
  { iata: "LHR", icao: "EGLL", name: "London Heathrow", city: "Londres", country: "Reino Unido", countryCode: "GB" },
  { iata: "CDG", icao: "LFPG", name: "Charles de Gaulle", city: "París", country: "Francia", countryCode: "FR" },
  { iata: "MAD", icao: "LEMD", name: "Adolfo Suárez Madrid-Barajas", city: "Madrid", country: "España", countryCode: "ES" },
  { iata: "BCN", icao: "LEBL", name: "El Prat", city: "Barcelona", country: "España", countryCode: "ES" },
  { iata: "VIE", icao: "LOWW", name: "Vienna International", city: "Viena", country: "Austria", countryCode: "AT" },
  { iata: "BRU", icao: "EBBR", name: "Brussels Airport", city: "Bruselas", country: "Bélgica", countryCode: "BE" },
  { iata: "MUC", icao: "EDDM", name: "Munich Airport", city: "Múnich", country: "Alemania", countryCode: "DE" },
  { iata: "ZRH", icao: "LSZH", name: "Zurich Airport", city: "Zúrich", country: "Suiza", countryCode: "CH" },
  { iata: "FCO", icao: "LIRF", name: "Leonardo da Vinci–Fiumicino", city: "Roma", country: "Italia", countryCode: "IT" },
  { iata: "MXP", icao: "LIMC", name: "Malpensa", city: "Milán", country: "Italia", countryCode: "IT" },
  { iata: "LIS", icao: "LPPT", name: "Humberto Delgado", city: "Lisboa", country: "Portugal", countryCode: "PT" },
  { iata: "WAW", icao: "EPWA", name: "Frederic Chopin", city: "Varsovia", country: "Polonia", countryCode: "PL" },
  { iata: "LUX", icao: "ELLX", name: "Luxembourg Airport", city: "Luxemburgo", country: "Luxemburgo", countryCode: "LU" },
  { iata: "LEJ", icao: "EDDP", name: "Leipzig/Halle Airport", city: "Leipzig", country: "Alemania", countryCode: "DE" },
  { iata: "CGN", icao: "EDDK", name: "Cologne Bonn Airport", city: "Colonia", country: "Alemania", countryCode: "DE" },
  { iata: "ATH", icao: "LGAV", name: "Eleftherios Venizelos", city: "Atenas", country: "Grecia", countryCode: "GR" },
  // Américas del Norte
  { iata: "MEM", icao: "KMEM", name: "Memphis International", city: "Memphis", country: "EE.UU.", countryCode: "US" },
  { iata: "ANC", icao: "PANC", name: "Ted Stevens Anchorage", city: "Anchorage", country: "EE.UU.", countryCode: "US" },
  { iata: "JFK", icao: "KJFK", name: "John F. Kennedy International", city: "Nueva York", country: "EE.UU.", countryCode: "US" },
  { iata: "LAX", icao: "KLAX", name: "Los Angeles International", city: "Los Ángeles", country: "EE.UU.", countryCode: "US" },
  { iata: "ORD", icao: "KORD", name: "O'Hare International", city: "Chicago", country: "EE.UU.", countryCode: "US" },
  { iata: "MIA", icao: "KMIA", name: "Miami International", city: "Miami", country: "EE.UU.", countryCode: "US" },
  { iata: "ATL", icao: "KATL", name: "Hartsfield-Jackson Atlanta", city: "Atlanta", country: "EE.UU.", countryCode: "US" },
  { iata: "DFW", icao: "KDFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "EE.UU.", countryCode: "US" },
  { iata: "SFO", icao: "KSFO", name: "San Francisco International", city: "San Francisco", country: "EE.UU.", countryCode: "US" },
  { iata: "YYZ", icao: "CYYZ", name: "Toronto Pearson International", city: "Toronto", country: "Canadá", countryCode: "CA" },
  { iata: "YVR", icao: "CYVR", name: "Vancouver International", city: "Vancouver", country: "Canadá", countryCode: "CA" },
  // América Latina
  { iata: "GRU", icao: "SBGR", name: "Guarulhos International", city: "São Paulo", country: "Brasil", countryCode: "BR" },
  { iata: "VCP", icao: "SBKP", name: "Viracopos International", city: "Campinas", country: "Brasil", countryCode: "BR" },
  { iata: "BOG", icao: "SKBO", name: "El Dorado International", city: "Bogotá", country: "Colombia", countryCode: "CO" },
  { iata: "MEX", icao: "MMMX", name: "Benito Juárez International", city: "Ciudad de México", country: "México", countryCode: "MX" },
  { iata: "SCL", icao: "SCEL", name: "Arturo Merino Benítez", city: "Santiago", country: "Chile", countryCode: "CL" },
  { iata: "EZE", icao: "SAEZ", name: "Ministro Pistarini (Ezeiza)", city: "Buenos Aires", country: "Argentina", countryCode: "AR" },
  { iata: "LIM", icao: "SPJC", name: "Jorge Chávez International", city: "Lima", country: "Perú", countryCode: "PE" },
  // África
  { iata: "CAI", icao: "HECA", name: "Cairo International", city: "El Cairo", country: "Egipto", countryCode: "EG" },
  { iata: "NBO", icao: "HKJK", name: "Jomo Kenyatta International", city: "Nairobi", country: "Kenia", countryCode: "KE" },
  { iata: "JNB", icao: "FAOR", name: "O.R. Tambo International", city: "Johannesburgo", country: "Sudáfrica", countryCode: "ZA" },
  { iata: "CMN", icao: "GMMN", name: "Mohammed V International", city: "Casablanca", country: "Marruecos", countryCode: "MA" },
];
