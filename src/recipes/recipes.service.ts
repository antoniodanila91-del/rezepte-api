import { RecipeNotFoundError, ValidationError } from "../errors.ts";

export type Rezept = {
  id: number;
  titel: string;
  minuten: number;
  portionen: number;
  zutaten?: string[];
  anleitung?: string;
  bewertung?: number; // 1–5 Sterne
};

let rezepte: Rezept[] = [
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

let naechsteId = 5;

// Alle Rezepte – optional nur die mit höchstens `maxMinuten` Minuten
export async function getAllRecipes(maxMinuten?: number): Promise<Rezept[]> {
  if (maxMinuten === undefined) {
    return rezepte;
  }
  return rezepte.filter((r) => r.minuten <= maxMinuten);
}

export async function getRecipeById(id: number): Promise<Rezept> {
  const rezept = rezepte.find((r) => r.id === id);
  if (!rezept) {
    throw new RecipeNotFoundError(id);   // kein Rezept gefunden → Fehler werfen
  }
  return rezept;
}

export async function createRecipe(daten: Omit<Rezept, "id">): Promise<Rezept> {
  // Titel fehlt oder besteht nur aus Leerzeichen → 400
  if (typeof daten?.titel !== "string" || daten.titel.trim() === "") {
    throw new ValidationError("Ein Rezept braucht einen Titel");
  }

  // id zuletzt, damit eine mitgeschickte id aus dem Body sie nicht überschreibt
  const neues: Rezept = { ...daten, id: naechsteId++ };
  rezepte.push(neues);
  return neues;
}

export async function deleteRecipe(id: number): Promise<boolean> {
  const vorher = rezepte.length;
  rezepte = rezepte.filter((r) => r.id !== id);
  return rezepte.length < vorher;
}
