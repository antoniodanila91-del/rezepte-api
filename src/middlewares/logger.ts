import { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Bonus: sobald die Antwort verschickt ist, Status-Code und Dauer ausgeben
  res.on("finish", () => {
    const dauer = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${dauer} ms)`);
  });

  next();                               // WICHTIG: sonst bleibt die Anfrage hängen
}
