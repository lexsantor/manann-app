// Seed de usuarios demo para PR-3.
// El magic-link reconoce el email y firma la sesión sobre estas filas.
// Idempotente: onConflictDoNothing por email.
import { randomUUID } from "node:crypto";

import { db } from "./index";
import { user } from "./schema";

const DEMO_USERS = [
  { name: "Alex Santoro", email: "lexsantor@gmail.com" },
  { name: "Marina Coll", email: "marina@demo.manann.app" },
];

async function seed() {
  for (const u of DEMO_USERS) {
    await db
      .insert(user)
      .values({
        id: randomUUID(),
        name: u.name,
        email: u.email,
        emailVerified: true,
      })
      .onConflictDoNothing({ target: user.email });
    // eslint-disable-next-line no-console
    console.log(`✓ usuario asegurado: ${u.email}`);
  }
}

seed()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Seed completado.");
    process.exit(0);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Seed falló:", err);
    process.exit(1);
  });
