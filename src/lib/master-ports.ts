// Puertos marítimos — UN/LOCODE con nombre y país.
// Extiende port-coords.ts (coordenadas) con datos de presentación.
export interface MasterPort {
  locode: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
}

export const MASTER_PORTS: MasterPort[] = [
  // Europa
  { locode: "ESBCN", name: "Barcelona", country: "España", countryCode: "ES", lat: 41.38, lon: 2.18 },
  { locode: "ESVLC", name: "Valencia", country: "España", countryCode: "ES", lat: 39.47, lon: -0.32 },
  { locode: "ESALG", name: "Algeciras", country: "España", countryCode: "ES", lat: 36.13, lon: -5.45 },
  { locode: "ESVGO", name: "Vigo", country: "España", countryCode: "ES", lat: 42.24, lon: -8.72 },
  { locode: "ESBIO", name: "Bilbao", country: "España", countryCode: "ES", lat: 43.35, lon: -3.05 },
  { locode: "ESLPA", name: "Las Palmas", country: "España", countryCode: "ES", lat: 28.13, lon: -15.43 },
  { locode: "NLRTM", name: "Rotterdam", country: "Países Bajos", countryCode: "NL", lat: 51.90, lon: 4.48 },
  { locode: "DEHAM", name: "Hamburgo", country: "Alemania", countryCode: "DE", lat: 53.55, lon: 9.97 },
  { locode: "DEBRE", name: "Bremen", country: "Alemania", countryCode: "DE", lat: 53.08, lon: 8.80 },
  { locode: "GBFXT", name: "Felixstowe", country: "Reino Unido", countryCode: "GB", lat: 51.96, lon: 1.35 },
  { locode: "GBSOU", name: "Southampton", country: "Reino Unido", countryCode: "GB", lat: 50.90, lon: -1.40 },
  { locode: "BEANR", name: "Amberes", country: "Bélgica", countryCode: "BE", lat: 51.22, lon: 4.41 },
  { locode: "FRFOS", name: "Marsella-Fos", country: "Francia", countryCode: "FR", lat: 43.32, lon: 4.86 },
  { locode: "FRLEH", name: "Le Havre", country: "Francia", countryCode: "FR", lat: 49.49, lon: 0.11 },
  { locode: "ITGOA", name: "Génova", country: "Italia", countryCode: "IT", lat: 44.41, lon: 8.93 },
  { locode: "ITGIT", name: "Gioia Tauro", country: "Italia", countryCode: "IT", lat: 38.42, lon: 15.90 },
  { locode: "PTSINE", name: "Setúbal", country: "Portugal", countryCode: "PT", lat: 38.68, lon: -8.69 },
  { locode: "PTLEI", name: "Lisboa", country: "Portugal", countryCode: "PT", lat: 38.71, lon: -9.12 },
  { locode: "GRPIR", name: "El Pireo", country: "Grecia", countryCode: "GR", lat: 37.94, lon: 23.63 },
  { locode: "TRMER", name: "Mersin", country: "Türkiye", countryCode: "TR", lat: 36.80, lon: 34.63 },
  { locode: "PLGDY", name: "Gdynia", country: "Polonia", countryCode: "PL", lat: 54.53, lon: 18.54 },
  { locode: "MABMQ", name: "Tanger Med", country: "Marruecos", countryCode: "MA", lat: 35.88, lon: -5.50 },
  // Asia
  { locode: "CNSHA", name: "Shanghái", country: "China", countryCode: "CN", lat: 31.23, lon: 121.47 },
  { locode: "CNNGB", name: "Ningbo-Zhoushan", country: "China", countryCode: "CN", lat: 29.87, lon: 121.55 },
  { locode: "CNQIN", name: "Qingdao", country: "China", countryCode: "CN", lat: 36.07, lon: 120.38 },
  { locode: "CNTXG", name: "Tianjin", country: "China", countryCode: "CN", lat: 39.00, lon: 117.72 },
  { locode: "CNGZU", name: "Guangzhou Nansha", country: "China", countryCode: "CN", lat: 22.73, lon: 113.55 },
  { locode: "CNSZX", name: "Shenzhen Yantian", country: "China", countryCode: "CN", lat: 22.56, lon: 114.26 },
  { locode: "HKHKG", name: "Hong Kong", country: "Hong Kong", countryCode: "HK", lat: 22.32, lon: 114.17 },
  { locode: "SGSIN", name: "Singapur", country: "Singapur", countryCode: "SG", lat: 1.26, lon: 103.82 },
  { locode: "JPYOK", name: "Yokohama", country: "Japón", countryCode: "JP", lat: 35.44, lon: 139.68 },
  { locode: "JPOSA", name: "Osaka", country: "Japón", countryCode: "JP", lat: 34.65, lon: 135.43 },
  { locode: "KRPUS", name: "Busan", country: "Corea del Sur", countryCode: "KR", lat: 35.10, lon: 129.04 },
  { locode: "AEDXB", name: "Dubái", country: "EAU", countryCode: "AE", lat: 25.20, lon: 55.27 },
  { locode: "INKTP", name: "Calcuta", country: "India", countryCode: "IN", lat: 22.55, lon: 88.33 },
  { locode: "INNSM", name: "Nhava Sheva (Bombay)", country: "India", countryCode: "IN", lat: 18.95, lon: 72.93 },
  { locode: "MYPKG", name: "Port Klang", country: "Malasia", countryCode: "MY", lat: 3.00, lon: 101.40 },
  { locode: "THLCH", name: "Laem Chabang", country: "Tailandia", countryCode: "TH", lat: 13.08, lon: 100.88 },
  { locode: "VNHPH", name: "Hai Phong", country: "Vietnam", countryCode: "VN", lat: 20.86, lon: 106.68 },
  // Américas
  { locode: "USNYC", name: "Nueva York / Nueva Jersey", country: "EE.UU.", countryCode: "US", lat: 40.71, lon: -74.01 },
  { locode: "USLAX", name: "Los Ángeles", country: "EE.UU.", countryCode: "US", lat: 33.74, lon: -118.27 },
  { locode: "USSAV", name: "Savannah", country: "EE.UU.", countryCode: "US", lat: 32.08, lon: -81.10 },
  { locode: "MXLZC", name: "Lázaro Cárdenas", country: "México", countryCode: "MX", lat: 17.90, lon: -102.20 },
  { locode: "MXVSA", name: "Veracruz", country: "México", countryCode: "MX", lat: 19.20, lon: -96.13 },
  { locode: "BRSAN", name: "Santos", country: "Brasil", countryCode: "BR", lat: -23.97, lon: -46.30 },
  { locode: "CLVAP", name: "Valparaíso", country: "Chile", countryCode: "CL", lat: -33.05, lon: -71.63 },
  { locode: "PECLL", name: "El Callao", country: "Perú", countryCode: "PE", lat: -12.05, lon: -77.15 },
  // África / Oriente Medio
  { locode: "EGPSD", name: "Puerto Said", country: "Egipto", countryCode: "EG", lat: 31.27, lon: 32.32 },
  { locode: "ZACPT", name: "Ciudad del Cabo", country: "Sudáfrica", countryCode: "ZA", lat: -33.90, lon: 18.43 },
];
