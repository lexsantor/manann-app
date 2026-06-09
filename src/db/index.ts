import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está configurada");
}

// neon-http: ideal para serverless/Vercel sobre la conexión pooled.
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle({ client: sql, schema });
