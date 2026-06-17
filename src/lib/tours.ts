export type TourStep = { title: string; body: string };

export const TOURS: Record<string, TourStep[]> = {
  "/dashboard": [
    { title: "Tu panel del día", body: "De un vistazo: expedientes en curso, sus estados y las métricas operativas. Es tu punto de partida cada mañana." },
    { title: "Abre cualquier expediente", body: "Haz clic en una tarjeta para entrar al detalle. O pulsa ⌘K en cualquier momento para buscar y saltar a donde quieras." },
    { title: "Crea sin fricción", body: "El botón «Crear» abre expedientes, cotizaciones, facturas o contactos. Y con ⌘J le preguntas a la IA sobre tus datos." },
  ],
  "/expedientes": [
    { title: "Todos tus envíos", body: "El listado completo de expedientes. Filtra por estado con las pestañas de arriba." },
    { title: "Tres vistas", body: "Cambia entre tarjetas para ojear, tabla para comparar venta y margen, y kanban por estado, con los iconos de vista." },
    { title: "Empieza un expediente", body: "Créalo vacío y arrastra el BL —la IA lo rellena— o impórtalo desde un CSV. Tú confirmas." },
  ],
  "/contabilidad": [
    { title: "Contabilidad de verdad", body: "Plan contable PGC, diario de asientos y tesorería. Las facturas que emites generan su asiento automáticamente." },
    { title: "El diario", body: "Cada movimiento es un asiento con debe y haber que cuadran. Crea asientos manuales con «Crear asiento»." },
    { title: "Cierres e impuestos", body: "Desde las tarjetas de arriba: sumas y saldos, modelo 303 de IVA y conciliación de extracto contra diario." },
  ],
};

export function tourForPath(pathname: string): TourStep[] | null {
  // El detalle de expediente tiene su propia guía (DemoTour).
  if (/^\/expedientes\/[^/]+/.test(pathname)) return null;
  let best: string | null = null;
  for (const key of Object.keys(TOURS)) {
    if (pathname === key || pathname.startsWith(`${key}/`)) {
      if (!best || key.length > best.length) best = key;
    }
  }
  return best ? TOURS[best] : null;
}
