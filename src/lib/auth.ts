// Configuración de Better Auth (servidor).
// Solo magic-link (sin email/password): la IA propone, el humano confirma;
// el acceso es por enlace, sin contraseñas que gestionar.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { user, session, account, verification } from "@/db/schema";
import { sendMagicLinkEmail, sendWelcomeEmail } from "@/lib/email";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET no está configurada");
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  // En local fijamos baseURL; en Vercel, si falta, Better Auth lo infiere del
  // request (robusto frente a URLs de preview cambiantes). En prod se setea
  // BETTER_AUTH_URL al dominio público.
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  // Habilitado SOLO para la cuenta demo de acceso directo (ver lib/demo-login.ts).
  // El acceso principal sigue siendo magic-link; no hay formulario de contraseña en la UI.
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // refresca la sesión cada 24 h de uso
  },
  // Throttle de emisión de magic links. Nota: el store por defecto es en
  // memoria (por instancia) — en serverless da protección parcial; suficiente
  // para la demo, endurecer con store externo si se expone a tráfico real.
  rateLimit: {
    enabled: true,
    window: 60, // segundos
    max: 5, // peticiones por ventana e IP
  },
  databaseHooks: {
    user: {
      create: {
        after: async (newUser) => {
          // Enviar bienvenida solo al crear el usuario por primera vez.
          // Fire-and-forget: un fallo de email no debe romper el login.
          sendWelcomeEmail(newUser.email, newUser.name ?? "").catch((err) => {
            console.error("[email] sendWelcomeEmail falló:", err);
          });
        },
      },
    },
  },
  plugins: [
    magicLink({
      expiresIn: 60 * 5, // el enlace caduca en 5 min
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
    nextCookies(), // debe ir el ÚLTIMO de la lista de plugins
  ],
});
