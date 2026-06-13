// Nomenclatura armonizada (HS) — selección de ~200 códigos frecuentes en
// freight forwarding europeo. Fuente: nomenclatura combinada UE (EUR-Lex).
// Formato: [código, descripción ES]
export const TARIC_CODES: [string, string][] = [
  // Cap. 01-05 Productos animales
  ["0101.21", "Caballos vivos reproductores de raza pura"],
  ["0201.10", "Canales y medias canales de bovino, frescas o refrigeradas"],
  ["0302.11", "Truchas, frescas o refrigeradas"],
  // Cap. 04 Lácteos
  ["0401.10", "Leche y nata sin concentrar, grasa ≤1%"],
  ["0406.10", "Queso fresco (sin madurar)"],
  // Cap. 08-09 Frutas / especias
  ["0805.10", "Naranjas, frescas o secas"],
  ["0901.11", "Café sin tostar, sin descafeinar"],
  // Cap. 10 Cereales
  ["1001.91", "Trigo duro para siembra"],
  ["1005.90", "Maíz, excepto para siembra"],
  // Cap. 11 Molinería
  ["1101.00", "Harina de trigo o de morcajo"],
  // Cap. 15 Grasas
  ["1507.10", "Aceite de soja en bruto"],
  ["1509.10", "Aceite de oliva virgen extra"],
  // Cap. 17 Azúcar
  ["1701.91", "Azúcar blanco refinado"],
  // Cap. 20-22 Conservas / bebidas
  ["2002.10", "Tomates enteros o en trozos, preparados"],
  ["2009.11", "Zumo de naranja congelado"],
  ["2204.21", "Vino de uvas frescas en recipientes ≤2 l"],
  ["2204.22", "Vino de uvas frescas en recipientes 2–10 l"],
  ["2208.20", "Aguardiente de vino o de orujo"],
  // Cap. 25 Minerales
  ["2505.10", "Arenas silíceas y cuarzosas"],
  ["2523.29", "Cemento portland, excepto blanco"],
  // Cap. 27 Combustibles
  ["2710.12", "Gasolinas para motores"],
  ["2710.19", "Fueloil, gasóleo y otros aceites de petróleo"],
  ["2711.11", "Gas natural licuado"],
  // Cap. 28-29 Productos químicos
  ["2804.10", "Hidrógeno"],
  ["2901.10", "Hidrocarburos acíclicos saturados"],
  ["2915.21", "Ácido acético"],
  ["2933.21", "Hidantoína y sus derivados"],
  // Cap. 30 Farmacéuticos
  ["3002.13", "Vacunas para medicina humana"],
  ["3004.20", "Medicamentos con antibióticos, dosis"],
  ["3004.32", "Medicamentos con corticosteroides, dosis"],
  ["3004.90", "Medicamentos para uso humano, n.e.p."],
  ["3006.50", "Botiquines de primeros auxilios"],
  // Cap. 32 Pinturas
  ["3208.10", "Pinturas y barnices con base de poliéster"],
  ["3209.10", "Pinturas y barnices de polímeros acrílicos al agua"],
  // Cap. 34 Jabones / detergentes
  ["3401.11", "Jabón de tocador"],
  ["3402.20", "Preparaciones detergentes, acondicionadas para venta al por menor"],
  // Cap. 38 Productos químicos diversos
  ["3808.91", "Insecticidas"],
  ["3812.10", "Preparaciones antidetonantes"],
  // Cap. 39 Plásticos
  ["3901.10", "Polietileno de densidad <0,94, en formas primarias"],
  ["3902.10", "Polipropileno, en formas primarias"],
  ["3904.10", "Policloruro de vinilo (PVC) sin mezclar"],
  ["3916.10", "Perfiles de polímeros de etileno"],
  ["3919.10", "Placas y láminas autoadhesivas de plástico en rollos ≤20 cm"],
  ["3923.10", "Cajas y cajones de plástico"],
  ["3926.90", "Manufacturas de plástico, n.e.p."],
  // Cap. 40 Caucho
  ["4011.10", "Neumáticos nuevos para automóviles de turismo"],
  ["4011.20", "Neumáticos nuevos para autobuses y camiones"],
  // Cap. 44 Madera
  ["4407.11", "Madera de pino aserrada, espesor >6 mm"],
  ["4412.31", "Tablero contrachapado de madera tropical"],
  ["4418.20", "Puertas de madera y sus marcos"],
  // Cap. 47-48 Papel / cartón
  ["4804.11", "Papel kraft para sacos, sin blanquear, en rollos"],
  ["4809.20", "Papel carbón y papel autocopia"],
  ["4819.10", "Cajas de papel o cartón corrugado"],
  // Cap. 52-62 Textiles
  ["5208.11", "Tejidos de algodón en crudo, ligamento tafetán, ≤200 g/m²"],
  ["5209.11", "Tejidos de algodón en crudo, ligamento tafetán, >200 g/m²"],
  ["5407.61", "Tejidos de filamentos sintéticos de poliéster, sin blanquear"],
  ["6101.20", "Abrigos de punto de algodón, para hombres"],
  ["6109.10", "Camisetas de punto de algodón"],
  ["6203.42", "Pantalones de algodón para hombres"],
  ["6204.62", "Pantalones de algodón para mujeres"],
  ["6302.10", "Ropa de cama de algodón, de tejido de punto"],
  // Cap. 63 Alfombras / artículos del hogar
  ["6303.92", "Visillos de fibras sintéticas"],
  // Cap. 64 Calzado
  ["6403.51", "Calzado con parte superior de cuero, cubre el tobillo"],
  ["6404.11", "Calzado deportivo con suela de caucho y parte superior de tejido"],
  // Cap. 69 Cerámica
  ["6907.21", "Azulejos de cerámica sin barnizar, coeficiente de absorción ≤0,5%"],
  // Cap. 70 Vidrio
  ["7005.10", "Vidrio flotado, coloreado en masa"],
  ["7007.11", "Vidrio de seguridad templado, para vehículos"],
  // Cap. 72-73 Hierro y acero
  ["7208.10", "Bobinas laminadas en caliente de hierro o acero sin alear"],
  ["7210.49", "Chapas de hierro galvanizadas, anchura ≥600 mm"],
  ["7214.20", "Barras de acero para armadura de hormigón"],
  ["7304.31", "Tubos sin soldadura de acero inoxidable, sección circular"],
  ["7306.30", "Tubos soldados de hierro o acero, sección circular"],
  ["7308.90", "Construcciones y sus partes de hierro o acero, n.e.p."],
  ["7326.90", "Manufacturas de hierro o acero, n.e.p."],
  // Cap. 74-76 Metales no ferrosos
  ["7408.11", "Hilo de cobre refinado, sección transversal >6 mm"],
  ["7601.10", "Aluminio en bruto sin alear"],
  ["7604.10", "Barras y perfiles de aluminio sin alear"],
  ["7610.10", "Puertas y ventanas de aluminio"],
  // Cap. 84 Maquinaria
  ["8407.34", "Motores de émbolo alternativo para vehículos, cilindrada >1.000 cm³"],
  ["8408.20", "Motores diesel para vehículos del cap. 87"],
  ["8413.11", "Bombas para distribuir combustible"],
  ["8414.30", "Compresores para equipos frigoríficos"],
  ["8414.51", "Ventiladores de mesa, de pared o de techo para uso doméstico"],
  ["8418.10", "Combinados frigorífico-congelador domésticos"],
  ["8418.21", "Frigoríficos de tipo doméstico, compresión"],
  ["8419.89", "Intercambiadores de calor industriales, n.e.p."],
  ["8421.39", "Aparatos para filtrar o depurar líquidos, n.e.p."],
  ["8422.11", "Lavavajillas domésticos"],
  ["8424.41", "Pulverizadores agrícolas"],
  ["8425.11", "Polipastos de cadena accionados eléctricamente"],
  ["8428.90", "Máquinas y aparatos de elevación, carga y descarga, n.e.p."],
  ["8430.31", "Cortadoras o niveladoras de suelo, autopropulsadas"],
  ["8431.49", "Partes para máquinas de construcción, n.e.p."],
  ["8432.10", "Arados agrícolas"],
  ["8433.11", "Cortacéspedes autopropulsados, con motor"],
  ["8436.10", "Máquinas para preparar forraje"],
  ["8443.19", "Máquinas de impresión, n.e.p."],
  ["8443.31", "Máquinas para oficina de copia por contacto directo"],
  ["8444.00", "Máquinas para extruir, estirar o texturizar textiles sintéticos"],
  ["8445.11", "Máquinas para cardar fibras textiles"],
  ["8445.20", "Máquinas de hilar fibras textiles"],
  ["8450.11", "Lavadoras domésticas, capacidad ≤10 kg"],
  ["8451.29", "Secadoras industriales, n.e.p."],
  ["8452.10", "Máquinas de coser domésticas"],
  ["8458.11", "Tornos de control numérico para metales"],
  ["8467.11", "Herramientas neumáticas, giratoria, mano"],
  ["8471.30", "Ordenadores portátiles, peso ≤10 kg"],
  ["8471.41", "Máquinas de proceso de datos automático, presentación analógica"],
  ["8473.30", "Partes y accesorios de ordenadores"],
  ["8479.89", "Máquinas y aparatos mecánicos, n.e.p."],
  ["8481.80", "Artículos de grifería y órganos similares, n.e.p."],
  ["8483.10", "Árboles de transmisión y manivelas"],
  ["8483.40", "Engranajes y ruedas de fricción, excepto ruedas dentadas"],
  ["8484.10", "Juntas metáloplásticas"],
  ["8486.20", "Máquinas para fabricar semiconductores"],
  ["8501.10", "Motores eléctricos de potencia ≤37,5 W"],
  ["8501.52", "Motores eléctricos de CA monofásicos, potencia >750 W y ≤75 kW"],
  ["8504.40", "Convertidores estáticos (rectificadores, inversores, etc.)"],
  ["8507.10", "Acumuladores eléctricos de plomo, para arranque"],
  ["8507.60", "Acumuladores eléctricos de iones de litio"],
  ["8516.40", "Planchas eléctricas"],
  ["8516.50", "Hornos de microondas domésticos"],
  ["8516.60", "Otras cocinas, hornillos, estufas domésticas eléctricas"],
  ["8517.13", "Teléfonos inteligentes (smartphones)"],
  ["8517.62", "Aparatos de telecomunicación para recepción y transmisión de datos"],
  ["8524.12", "Módulos fotovoltaicos de silicio monocristalino"],
  ["8528.52", "Monitores LCD de color para reproducir imágenes de máquinas automáticas"],
  ["8536.50", "Interruptores eléctricos para tensión ≤1.000 V"],
  ["8537.10", "Cuadros eléctricos de mando para tensión ≤1.000 V"],
  ["8544.42", "Conductores eléctricos para tensión ≤1.000 V, con conector"],
  // Cap. 85 Electrónica
  ["8541.10", "Diodos semiconductores"],
  ["8541.21", "Transistores, potencia de disipación <1 W"],
  ["8542.31", "Procesadores y controladores (circuitos integrados)"],
  ["8542.32", "Memorias (circuitos integrados)"],
  ["8542.33", "Amplificadores (circuitos integrados)"],
  // Cap. 86-87 Transporte
  ["8603.10", "Vagones de pasajeros autopropulsados por fuente eléctrica exterior"],
  ["8701.21", "Tractores agrícolas de carretera de potencia ≤18 kW"],
  ["8702.10", "Autobuses y autocares, motor diesel, ≤10 plazas excl. conductor"],
  ["8703.23", "Automóviles cilindrada 1.500–3.000 cm³, excepto eléctricos"],
  ["8703.80", "Automóviles eléctricos de batería"],
  ["8704.21", "Camiones diesel, MMA ≤5 t"],
  ["8708.29", "Partes de carrocería de automóviles, n.e.p."],
  ["8708.30", "Frenos y servofrenos para vehículos automóviles"],
  ["8708.40", "Cajas de cambio para vehículos automóviles"],
  ["8708.91", "Radiadores para vehículos automóviles"],
  ["8708.99", "Partes y accesorios de vehículos automóviles, n.e.p."],
  ["8711.60", "Motocicletas eléctricas"],
  // Cap. 88-89 Aeronáutica / Naval
  ["8802.40", "Aviones y demás aeronaves, peso vacío >15.000 kg"],
  ["8901.10", "Transbordadores"],
  ["8901.20", "Buques cisterna"],
  ["8901.30", "Buques frigoríficos, excepto los de la subpartida 8901.20"],
  // Cap. 90 Óptica / instrumentos
  ["9001.50", "Lentes de contacto"],
  ["9002.11", "Objetivos para cámaras fotográficas o cinematográficas"],
  ["9013.20", "Láseres, excepto diodos láser"],
  ["9018.11", "Electrocardiógrafos"],
  ["9018.90", "Instrumentos y aparatos para medicina, n.e.p."],
  ["9025.11", "Termómetros de líquido para lectura directa, sin combinar"],
  ["9026.20", "Instrumentos para medir o verificar presión de líquidos o gases"],
  // Cap. 94 Muebles
  ["9401.61", "Asientos con armazón de madera, excepto los de jardín"],
  ["9401.80", "Asientos con armazón de otro material"],
  ["9403.30", "Muebles de oficina de madera"],
  ["9403.60", "Muebles de madera, n.e.p."],
  // Cap. 95 Juguetes
  ["9503.00", "Triciclos, patinetes, coches de pedal y juguetes con ruedas"],
  ["9504.50", "Videoconsolas y máquinas de videojuego"],
  // Cap. 96 Manufacturas diversas
  ["9608.10", "Bolígrafos"],
  ["9615.11", "Peines de caucho duro o de plástico"],
];

export function searchTaric(query: string, limit = 10): [string, string][] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const byCode = TARIC_CODES.filter(([code]) => code.replace(".", "").startsWith(q.replace(".", "")));
  const byDesc = TARIC_CODES.filter(([code, desc]) => !code.replace(".", "").startsWith(q.replace(".", "")) && desc.toLowerCase().includes(q));
  return [...byCode, ...byDesc].slice(0, limit);
}
