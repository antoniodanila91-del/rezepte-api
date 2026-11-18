import express from "express";
import recipesRouter from "./recipes/recipes.router";
import { logger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
app.use(express.json());              // JSON im Request-Body lesen
app.use(logger);                      // vor den Routen -> sieht jede Anfrage

app.get("/", (req, res) => {
  res.send("Willkommen bei der Rezepte-API 👋");
});
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Bonus: absichtlich kaputte Route – die Error-Middleware fängt den Absturz ab
app.get("/crash", (req, res) => {
  throw new Error("Absichtlicher Absturz zum Testen");
});

app.use("/recipes", recipesRouter);    // alle Rezept-Routen hängen unter /recipes

// 404-Fallback: Middleware ohne Pfad – greift nur, wenn keine Route oben gepasst hat
app.use((req, res) => {
  res.status(404).json({ fehler: `Route ${req.method} ${req.originalUrl} existiert nicht` });
});

app.use(errorHandler);                // muss NACH den Routen stehen (ganz unten)

export default app;                   // die fertige App exportieren (NICHT starten)
