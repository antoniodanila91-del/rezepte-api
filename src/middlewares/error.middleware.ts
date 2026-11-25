import { Request, Response, NextFunction } from "express";

// Error-Middleware: erkennbar an den VIER Parametern (err, req, res, next)
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Name und Nachricht des Fehlers im Terminal loggen
  console.error(`${err.name}: ${err.message}`);

  // Status aus dem Fehler übernehmen — hat er keinen, ist es ein 500
  // (express.json() setzt bei kaputtem JSON selbst status = 400)
  const status = err.status ?? 500;

  // Bei 500 ist es ein unerwarteter Fehler (z. B. aus der Datenbank). Dessen Text
  // kann interne Details verraten ("value too long for type character varying(255)").
  // Deshalb: Details nur oben im Terminal-Log, nach außen eine allgemeine Meldung.
  const nachricht = status === 500 ? "Interner Serverfehler" : err.message;

  // mit diesem Status und { fehler: <Fehlermeldung> } antworten
  res.status(status).json({ fehler: nachricht });
}
