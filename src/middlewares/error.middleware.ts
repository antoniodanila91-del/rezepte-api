import { Request, Response, NextFunction } from "express";

// Error-Middleware: erkennbar an den VIER Parametern (err, req, res, next)
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Name und Nachricht des Fehlers im Terminal loggen
  console.error(`${err.name}: ${err.message}`);

  // Status aus dem Fehler übernehmen — hat er keinen, ist es ein 500
  const status = err.status ?? 500;

  // mit diesem Status und { fehler: <Fehlermeldung> } antworten
  res.status(status).json({ fehler: err.message });
}
