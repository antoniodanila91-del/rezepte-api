import express from "express";
import recipesRouter from "./recipes/recipes.router";
import { logger } from "./middlewares/logger";

const app = express();
app.use(express.json());              // JSON im Request-Body lesen
app.use(logger);                      // vor den Routen -> sieht jede Anfrage

app.get("/", (req, res) => {
  res.send("Willkommen bei der Rezepte-API 👋");
});
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/recipes", recipesRouter);    // alle Rezept-Routen hängen unter /recipes

export default app;                   // die fertige App exportieren (NICHT starten)
