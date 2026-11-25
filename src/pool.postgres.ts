import "dotenv/config";
import { Pool } from "pg";

let pool: Pool | null = null;             // Singleton

export function getPostgresPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 10,
    });

    // WICHTIG: Bricht die Datenbank eine ungenutzte Verbindung ab (z. B. bei einem
    // Neustart des Containers), meldet der Pool ein "error"-Ereignis. Hört niemand
    // darauf, stürzt der ganze Server ab. So loggen wir es nur – der Pool baut
    // bei der nächsten Anfrage einfach eine neue Verbindung auf.
    pool.on("error", (err) => {
      console.error("Datenbank-Verbindung unterbrochen:", err.message);
    });
  }
  return pool;
}