import express from "express";

type Rezept = {
  id: number;
  titel: string;
  minuten: number;
  portionen: number;
  zutaten: string[];
  anleitung: string;
  bewertung: number; // 1–5 Sterne
};

const rezepte: Rezept[] = [
  {
    id: 1,
    titel: "Spaghetti Carbonara",
    minuten: 20,
    portionen: 2,
    zutaten: ["200 g Spaghetti", "100 g Guanciale", "2 Eier", "50 g Pecorino", "Pfeffer"],
    anleitung: "Nudeln kochen, Guanciale anbraten, Eier mit Käse verrühren und alles abseits der Hitze vermengen.",
    bewertung: 5,
  },
  {
    id: 2,
    titel: "Linsen-Curry",
    minuten: 35,
    portionen: 4,
    zutaten: ["250 g rote Linsen", "1 Dose Kokosmilch", "1 Zwiebel", "2 EL Currypaste", "1 Dose Tomaten"],
    anleitung: "Zwiebel anschwitzen, Currypaste kurz mitrösten, Linsen, Tomaten und Kokosmilch dazugeben und 20 Minuten köcheln lassen.",
    bewertung: 4,
  },
  {
    id: 3,
    titel: "Griechischer Salat",
    minuten: 10,
    portionen: 2,
    zutaten: ["2 Tomaten", "1 Gurke", "1 rote Zwiebel", "200 g Feta", "Oliven", "Olivenöl"],
    anleitung: "Gemüse würfeln, mit Oliven und Feta mischen, mit Olivenöl beträufeln.",
    bewertung: 4,
  },
  {
    id: 4,
    titel: "Ofengemüse mit Hähnchen",
    minuten: 45,
    portionen: 3,
    zutaten: ["3 Hähnchenschenkel", "2 Paprika", "1 Zucchini", "4 Kartoffeln", "Rosmarin"],
    anleitung: "Gemüse schneiden, mit Hähnchen und Gewürzen aufs Blech legen und bei 200 °C ca. 40 Minuten backen.",
    bewertung: 5,
  },
];

const app = express();
app.use(express.json());        // erlaubt dem Server, JSON im Request-Body zu lesen

// Begrüßung auf der Startseite
app.get("/", (req, res) => {
  res.send("Willkommen bei der Rezepte-API 👋");
});

// Health-Check: läuft der Server?
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Alle Rezepte – optional gefiltert mit ?maxMinuten=20 (Bonus)
app.get("/recipes", (req, res) => {
  const { maxMinuten } = req.query;

  if (maxMinuten === undefined) {
    return res.json(rezepte);
  }

  const max = Number(maxMinuten);
  if (typeof maxMinuten !== "string" || Number.isNaN(max)) {
    return res.status(400).json({ fehler: "maxMinuten muss eine Zahl sein" });
  }

  res.json(rezepte.filter((r) => r.minuten <= max));
});

// Ein Rezept über die ID
app.get("/recipes/:id", (req, res) => {
  const id = Number(req.params.id);                  // req.params.id ist ein String → Zahl
  const rezept = rezepte.find((r) => r.id === id);

  if (!rezept) {
    return res.status(404).json({ fehler: "Rezept nicht gefunden" });
  }

  res.json(rezept);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
