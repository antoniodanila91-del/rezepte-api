import app from "./app.ts";
import { getPostgresPool } from "./pool.postgres.ts";

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

// Bonus: Pool sauber schließen, wenn der Server beendet wird.
// SIGINT = Ctrl + C im Terminal, SIGTERM = "bitte beenden" von außen (z. B. tsx watch beim Neustart).
// Sonst bleiben offene Verbindungen zur Datenbank hängen, bis Postgres sie selbst aufräumt.
let faehrtHerunter = false;             // schützt vor doppeltem Ctrl + C

async function herunterfahren(signal: string) {
  if (faehrtHerunter) return;           // läuft schon – den Pool nicht zweimal schließen
  faehrtHerunter = true;
  console.log(`${signal} empfangen – Server wird beendet …`);
  server.close();                       // keine neuen Anfragen mehr annehmen
  await getPostgresPool().end();        // alle Verbindungen im Pool schließen
  console.log("Datenbank-Verbindungen geschlossen. Tschüss! 👋");
  process.exit(0);
}

process.on("SIGINT", () => herunterfahren("SIGINT"));
process.on("SIGTERM", () => herunterfahren("SIGTERM"));
