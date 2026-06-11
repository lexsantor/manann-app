const PORT_IMAGES: Record<string, string> = {
  ESBCN: "/images/barcelona.png",
  NLRTM: "/images/rotterdam.png",
  CNSHA: "/images/Shanghai.png",
  ESVLC: "/images/valencia.png",
  MXMEX: "/images/ciudad-mexico.png",
  USNYC: "/images/new_york.png",
  DEHAM: "/images/hamburgo.png",
};

const FALLBACK = "/images/barcelona.png";

export function portImageUrl(locode: string): string {
  return PORT_IMAGES[locode] ?? FALLBACK;
}
