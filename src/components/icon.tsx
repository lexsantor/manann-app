import type { LucideIcon, LucideProps } from "lucide-react";

interface IconProps extends Omit<LucideProps, "ref"> {
  icon: LucideIcon;
}

/**
 * Wrapper único de Lucide (regla del sistema de diseño): fija size 20 y
 * strokeWidth 1.5; los linecaps round ya los aplica `.lucide` en globals.css.
 * Los call-sites solo pasan el glyph y, si acaso, un size puntual
 * (16 en tablas densas, 24 en estados vacíos/cabeceras).
 */
export function Icon({ icon: Glyph, size = 20, strokeWidth = 1.5, ...props }: IconProps) {
  return <Glyph size={size} strokeWidth={strokeWidth} {...props} />;
}
