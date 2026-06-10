import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Chequeo optimista en el edge: solo mira si existe la cookie de sesión y
// redirige pronto. La validación real (sesión viva en DB) la hace el layout
// server-side de (app). No consultamos la DB aquí.
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Cubre todas las rutas del grupo (app). El guardia real sigue en su layout;
// esto es el corte optimista en el edge (defensa en profundidad).
export const config = {
  matcher: ["/dashboard/:path*", "/expedientes/:path*"],
};
