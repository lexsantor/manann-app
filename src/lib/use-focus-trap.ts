import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Focus-trap accesible para modales hand-rolled (WCAG 2.4.3 / 2.1.2):
 *  - al abrir, mueve el foco al primer elemento enfocable del diálogo
 *  - cicla Tab / Shift+Tab dentro del diálogo (no se escapa al fondo)
 *  - Escape llama a `onClose`
 *  - al cerrar/desmontar, devuelve el foco al elemento que lo tenía
 *
 * El contenedor del diálogo debería llevar `role="dialog" aria-modal="true"` y
 * (para el fallback de foco) `tabIndex={-1}`.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose?: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    if (!node) return;

    const prevActive = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    // Foco inicial dentro del diálogo.
    (focusables()[0] ?? node).focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !node!.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !node!.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      prevActive?.focus?.();
    };
  }, [open, ref, onClose]);
}
