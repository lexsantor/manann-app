const PORT_IMAGES: Record<string, string> = {
  ESBCN: "https://source.unsplash.com/featured/640x400/?barcelona,port",
  NLRTM: "https://source.unsplash.com/featured/640x400/?rotterdam,harbor",
  CNSHA: "https://source.unsplash.com/featured/640x400/?shanghai,skyline",
  ESVLC: "https://source.unsplash.com/featured/640x400/?valencia,spain",
  DEHAM: "https://source.unsplash.com/featured/640x400/?hamburg,port",
  USNYC: "https://source.unsplash.com/featured/640x400/?new-york,skyline",
  MXMEX: "https://source.unsplash.com/featured/640x400/?mexico,city",
  ESALG: "https://source.unsplash.com/featured/640x400/?mediterranean,port",
  ESVNG: "https://source.unsplash.com/featured/640x400/?mediterranean,coast",
  SGSIN: "https://source.unsplash.com/featured/640x400/?singapore,skyline",
  CNNGB: "https://source.unsplash.com/featured/640x400/?ningbo,china",
  HKHKG: "https://source.unsplash.com/featured/640x400/?hong-kong,harbor",
  JPOSA: "https://source.unsplash.com/featured/640x400/?osaka,japan",
  USLAX: "https://source.unsplash.com/featured/640x400/?los-angeles,port",
};

const FALLBACK =
  "https://source.unsplash.com/featured/640x400/?cargo,ship,ocean";

export function portImageUrl(locode: string): string {
  return PORT_IMAGES[locode] ?? FALLBACK;
}
