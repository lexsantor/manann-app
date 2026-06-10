const PORT_IMAGES: Record<string, string> = {
  ESBCN: "/images/Barcelona.webp",
  NLRTM: "/images/Rotterdam.webp",
  CNSHA: "/images/Shanghai.webp",
  ESVLC: "/images/Valencia.webp",
  MXMEX: "/images/ciudad-mexico.webp",
};

const FALLBACK = "/images/Barcelona.webp";

export function portImageUrl(locode: string): string {
  return PORT_IMAGES[locode] ?? FALLBACK;
}
