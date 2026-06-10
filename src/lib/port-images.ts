// picsum.photos — imágenes consistentes por seed (sin API key, sin redirects problemáticos).
// El seed determina siempre la misma imagen para la misma ciudad.
const PORT_IMAGES: Record<string, string> = {
  ESBCN: "https://picsum.photos/seed/bcn-coast/640/380",
  NLRTM: "https://picsum.photos/seed/rtm-harbor/640/380",
  CNSHA: "https://picsum.photos/seed/sha-skyline/640/380",
  ESVLC: "https://picsum.photos/seed/vlc-spain/640/380",
  DEHAM: "https://picsum.photos/seed/ham-port/640/380",
  USNYC: "https://picsum.photos/seed/nyc-skyline/640/380",
  MXMEX: "https://picsum.photos/seed/mex-city/640/380",
  ESALG: "https://picsum.photos/seed/alg-strait/640/380",
  ESVNG: "https://picsum.photos/seed/vng-med/640/380",
  SGSIN: "https://picsum.photos/seed/sin-port/640/380",
  CNNGB: "https://picsum.photos/seed/ngb-china/640/380",
  HKHKG: "https://picsum.photos/seed/hkg-harbor/640/380",
  JPOSA: "https://picsum.photos/seed/osa-japan/640/380",
  USLAX: "https://picsum.photos/seed/lax-port/640/380",
};

const FALLBACK = "https://picsum.photos/seed/cargo-ocean/640/380";

export function portImageUrl(locode: string): string {
  return PORT_IMAGES[locode] ?? FALLBACK;
}
