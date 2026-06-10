import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

// Sesión actual cacheada por request (React cache): layout y page comparten un
// único round-trip a la DB en vez de consultarla por separado.
export const getCurrentSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
