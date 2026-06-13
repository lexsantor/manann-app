// Coordenadas [longitud, latitud] por UN/LOCODE.
// Formato react-simple-maps: [lon, lat].
export const PORT_COORDS: Record<string, [number, number]> = {
  // Europa
  ESBCN: [2.18, 41.38],
  ESVLC: [-0.32, 39.47],
  ESALG: [-5.45, 36.13],
  ESVGO: [-8.72, 42.24],
  NLRTM: [4.48, 51.90],
  DEHAM: [9.97, 53.55],
  GBFXT: [1.35, 51.96],
  BEANR: [4.41, 51.22],
  FRFOS: [4.86, 43.32],
  ITGOA: [8.93, 44.41],
  PTSINE: [-8.69, 38.68],
  // Asia
  CNSHA: [121.47, 31.23],
  CNNGB: [121.55, 29.87],
  CNQIN: [120.38, 36.07],
  HKHKG: [114.17, 22.32],
  SGSIN: [103.82, 1.26],
  JPYOK: [139.68, 35.44],
  AEDXB: [55.27, 25.20],
  INKTP: [88.33, 22.55],
  // Américas
  USNYC: [-74.01, 40.71],
  USLOS: [-118.27, 33.74],
  MXMEX: [-99.13, 19.43],
  BRSAN: [-46.30, -23.97],
  CLVAP: [-71.63, -33.03],
  COBAQ: [-74.77, 10.96],
  // África / Oriente Medio
  ZACPT: [18.42, -33.92],
  EGPSD: [32.55, 29.93],
  MAPTM: [-9.23, 33.60],
};

export function portCoords(locode: string): [number, number] | undefined {
  return PORT_COORDS[locode];
}
