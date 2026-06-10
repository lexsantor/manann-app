// Imágenes locales (public/images/) por LOCODE de destino.
const PORT_IMAGES: Record<string, string> = {
  ESBCN: "/images/Barcelona.webp",
  NLRTM: "/images/Rotterdam.webp",
  CNSHA: "/images/Shanghai.webp",
  ESVLC: "/images/Valencia.webp",
  MXMEX: "/images/Ciudad%20Mexico.webp",
};

const FALLBACK = "/images/Barcelona.webp";

export function portImageUrl(locode: string): string {
  return PORT_IMAGES[locode] ?? FALLBACK;
}
