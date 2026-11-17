import { Request, Response, NextFunction } from "express";

const API_KEY = "geheim123";

export function checkApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-api-key");  // undefined, wenn der Header fehlt

  if (key !== API_KEY) {
    return res.status(401).json({ fehler: "Nicht autorisiert" });   // Abbruch, kein next()
  }

  next();                               // Schlüssel stimmt -> weiter zum Controller
}
