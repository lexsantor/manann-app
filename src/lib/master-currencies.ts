// Divisas ISO 4217 — tabla de referencia estática.
// Los tipos de cambio reales se gestionan en la tabla `exchange_rate` (base EUR).
// Simulación: ECB/Fixer integración lista para producción.
export interface MasterCurrency {
  code: string; // ISO 4217 alpha
  numeric: string;
  name: string;
  symbol: string;
  decimals: number;
}

export const MASTER_CURRENCIES: MasterCurrency[] = [
  { code: "EUR", numeric: "978", name: "Euro", symbol: "€", decimals: 2 },
  { code: "USD", numeric: "840", name: "Dólar estadounidense", symbol: "$", decimals: 2 },
  { code: "GBP", numeric: "826", name: "Libra esterlina", symbol: "£", decimals: 2 },
  { code: "JPY", numeric: "392", name: "Yen japonés", symbol: "¥", decimals: 0 },
  { code: "CNY", numeric: "156", name: "Renminbi chino", symbol: "¥", decimals: 2 },
  { code: "CHF", numeric: "756", name: "Franco suizo", symbol: "Fr", decimals: 2 },
  { code: "HKD", numeric: "344", name: "Dólar de Hong Kong", symbol: "HK$", decimals: 2 },
  { code: "SGD", numeric: "702", name: "Dólar de Singapur", symbol: "S$", decimals: 2 },
  { code: "KRW", numeric: "410", name: "Won surcoreano", symbol: "₩", decimals: 0 },
  { code: "INR", numeric: "356", name: "Rupia india", symbol: "₹", decimals: 2 },
  { code: "AED", numeric: "784", name: "Dírham emiratí", symbol: "د.إ", decimals: 2 },
  { code: "SAR", numeric: "682", name: "Riyal saudí", symbol: "ر.س", decimals: 2 },
  { code: "QAR", numeric: "634", name: "Riyal catarí", symbol: "ر.ق", decimals: 2 },
  { code: "MYR", numeric: "458", name: "Ringgit malayo", symbol: "RM", decimals: 2 },
  { code: "THB", numeric: "764", name: "Baht tailandés", symbol: "฿", decimals: 2 },
  { code: "VND", numeric: "704", name: "Dong vietnamita", symbol: "₫", decimals: 0 },
  { code: "IDR", numeric: "360", name: "Rupia indonesia", symbol: "Rp", decimals: 2 },
  { code: "PHP", numeric: "608", name: "Peso filipino", symbol: "₱", decimals: 2 },
  { code: "TWD", numeric: "901", name: "Nuevo dólar taiwanés", symbol: "NT$", decimals: 2 },
  { code: "TRY", numeric: "949", name: "Lira turca", symbol: "₺", decimals: 2 },
  { code: "PLN", numeric: "985", name: "Esloti polaco", symbol: "zł", decimals: 2 },
  { code: "SEK", numeric: "752", name: "Corona sueca", symbol: "kr", decimals: 2 },
  { code: "NOK", numeric: "578", name: "Corona noruega", symbol: "kr", decimals: 2 },
  { code: "DKK", numeric: "208", name: "Corona danesa", symbol: "kr", decimals: 2 },
  { code: "CZK", numeric: "203", name: "Corona checa", symbol: "Kč", decimals: 2 },
  { code: "HUF", numeric: "348", name: "Forinto húngaro", symbol: "Ft", decimals: 2 },
  { code: "RON", numeric: "946", name: "Leu rumano", symbol: "lei", decimals: 2 },
  { code: "BRL", numeric: "986", name: "Real brasileño", symbol: "R$", decimals: 2 },
  { code: "MXN", numeric: "484", name: "Peso mexicano", symbol: "$", decimals: 2 },
  { code: "CAD", numeric: "124", name: "Dólar canadiense", symbol: "CA$", decimals: 2 },
  { code: "AUD", numeric: "036", name: "Dólar australiano", symbol: "A$", decimals: 2 },
  { code: "NZD", numeric: "554", name: "Dólar neozelandés", symbol: "NZ$", decimals: 2 },
  { code: "ZAR", numeric: "710", name: "Rand sudafricano", symbol: "R", decimals: 2 },
  { code: "EGP", numeric: "818", name: "Libra egipcia", symbol: "£", decimals: 2 },
  { code: "MAD", numeric: "504", name: "Dírham marroquí", symbol: "د.م.", decimals: 2 },
  { code: "NGN", numeric: "566", name: "Naira nigeriana", symbol: "₦", decimals: 2 },
  { code: "KES", numeric: "404", name: "Chelín keniano", symbol: "KSh", decimals: 2 },
  { code: "COP", numeric: "170", name: "Peso colombiano", symbol: "$", decimals: 2 },
  { code: "CLP", numeric: "152", name: "Peso chileno", symbol: "$", decimals: 0 },
  { code: "PEN", numeric: "604", name: "Sol peruano", symbol: "S/.", decimals: 2 },
  { code: "ARS", numeric: "032", name: "Peso argentino", symbol: "$", decimals: 2 },
];

// Tipos de cambio de referencia (base EUR) — mock manual.
// En producción: integrar ECB Data Portal o Fixer.io con NEXT_PUBLIC_FIXER_KEY.
export const REFERENCE_RATES: Record<string, number> = {
  EUR: 1.000000,
  USD: 1.081200,
  GBP: 0.855400,
  JPY: 164.320000,
  CNY: 7.820000,
  CHF: 0.966300,
  HKD: 8.444000,
  SGD: 1.455000,
  KRW: 1485.200000,
  INR: 90.150000,
  AED: 3.971000,
  SAR: 4.055000,
  MYR: 5.040000,
  THB: 38.420000,
  BRL: 6.120000,
  MXN: 19.870000,
  CAD: 1.494000,
  AUD: 1.645000,
  PLN: 4.262000,
  TRY: 36.450000,
};
