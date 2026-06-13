const PORT_IMAGES: Record<string, string> = {
  ESBCN: "/images/barcelona.webp",
  NLRTM: "/images/rotterdam.webp",
  CNSHA: "/images/Shanghai.webp",
  ESVLC: "/images/valencia.webp",
  MXMEX: "/images/ciudad-mexico.webp",
  USNYC: "/images/new-york.webp",
  DEHAM: "/images/hamburgo.webp",
  ESALG: "/images/algeciras.webp",
  HKHKG: "/images/hong-kong.webp",
  CNNGB: "/images/ningbo-zhoushan.webp",
  ESVGO: "/images/vigo.webp",
};

export function portImageUrl(locode: string): string | null {
  return PORT_IMAGES[locode] ?? null;
}
