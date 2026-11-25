import { RecipeNotFoundError, ValidationError, ConflictError } from "../errors.ts";
import {
  getAllRecipes as getAllFromDb,
  getRecipeById as getByIdFromDb,
  createRecipe as createInDb,
  deleteRecipe as deleteInDb,
  updateRecipe as updateInDb,
  addZutatToRecipe as addZutatInDb,
} from "./recipes.repo.ts";

// Eine Zutat in einem Rezept: Name aus "zutaten", Menge aus "rezept_zutaten"
export type Zutat = { name: string; menge: string };

export type Rezept = {
  id: number;
  titel: string;
  minuten: number;
  portionen: number;
  zutaten?: Zutat[];        // nur bei getRecipeById gefüllt (Detail-Ansicht)
};

// Das Array ist weg – die Daten kommen jetzt über das Repository aus PostgreSQL.
// Der Service kennt kein SQL. Er enthält nur noch die Business-Regeln
// (Was ist erlaubt? Was passiert, wenn etwas fehlt?) und ruft das Repository auf.

// ---------------------------------------------------------------------------
// Prüf-Funktionen (Business-Regeln) – einmal geschrieben, überall benutzt.
// Sie prüfen VOR der Datenbank, damit der Nutzer eine verständliche 400
// bekommt statt eines 500ers aus der Datenbank.
// ---------------------------------------------------------------------------

// Größte Zahl, die in eine PostgreSQL-Spalte vom Typ INTEGER passt
const MAX_INTEGER = 2_147_483_647;

// Grenzen aus schema.sql: titel VARCHAR(255), menge VARCHAR(100)
const MAX_TITEL_LAENGE = 255;
const MAX_MENGE_LAENGE = 100;

// Eine ganze Zahl zwischen 1 und MAX_INTEGER (für IDs, Minuten, Portionen)
function pruefePositiveZahl(wert: unknown, feld: string): asserts wert is number {
  if (!Number.isInteger(wert) || (wert as number) < 1 || (wert as number) > MAX_INTEGER) {
    throw new ValidationError(`${feld} muss eine ganze Zahl ab 1 sein`);
  }
}

// Ein nicht-leerer Text mit Höchstlänge (für Titel und Menge)
function pruefeText(wert: unknown, feld: string, maxLaenge: number): asserts wert is string {
  if (typeof wert !== "string" || wert.trim() === "") {
    throw new ValidationError(`${feld} darf nicht leer sein`);
  }
  if (wert.trim().length > maxLaenge) {
    throw new ValidationError(`${feld} darf höchstens ${maxLaenge} Zeichen lang sein`);
  }
}

// ---------------------------------------------------------------------------

// Alle Rezepte – optional nur die mit höchstens `maxMinuten` Minuten (Bonus aus Woche 1)
export async function getAllRecipes(maxMinuten?: number): Promise<Rezept[]> {
  const rezepte = await getAllFromDb();
  if (maxMinuten === undefined) {
    return rezepte;
  }
  // Rezepte ohne Zeitangabe (NULL) gehören nicht dazu – in JavaScript wäre null <= 10 sonst true
  return rezepte.filter((r) => r.minuten !== null && r.minuten <= maxMinuten);
}

export async function getRecipeById(id: number): Promise<Rezept> {
  pruefePositiveZahl(id, "Die ID");
  const rezept = await getByIdFromDb(id);   // null, wenn es das Rezept nicht gibt
  if (!rezept) {
    throw new RecipeNotFoundError(id);      // Regel: nicht gefunden → 404
  }
  return rezept;
}

export async function createRecipe(daten: Omit<Rezept, "id">): Promise<Rezept> {
  pruefeText(daten?.titel, "Der Titel", MAX_TITEL_LAENGE);
  pruefePositiveZahl(daten.minuten, "minuten");
  pruefePositiveZahl(daten.portionen, "portionen");

  // Eine id aus dem Body wird ignoriert – die vergibt die Datenbank (SERIAL)
  return createInDb(daten.titel.trim(), daten.minuten, daten.portionen);
}

// Gibt true zurück, wenn gelöscht wurde, und false, wenn es das Rezept nicht gab.
// Der Controller braucht das, um mit 404 zu antworten.
export async function deleteRecipe(id: number): Promise<boolean> {
  pruefePositiveZahl(id, "Die ID");
  const vorhanden = await getByIdFromDb(id);
  if (!vorhanden) {
    return false;
  }
  await deleteInDb(id);
  return true;
}

// --- BONUS: Rezept ändern ---
// Es dürfen einzelne Felder geschickt werden, z. B. nur { "portionen": 6 }.
export async function updateRecipe(
  id: number,
  daten: Partial<Omit<Rezept, "id" | "zutaten">>
): Promise<Rezept> {
  pruefePositiveZahl(id, "Die ID");

  // Regel: Ohne JSON-Body gibt es nichts zu ändern
  if (typeof daten !== "object" || daten === null) {
    throw new ValidationError("Bitte die zu ändernden Felder als JSON schicken");
  }
  const { titel, minuten, portionen } = daten;

  // Regel: mindestens ein Feld muss dabei sein
  if (titel === undefined && minuten === undefined && portionen === undefined) {
    throw new ValidationError("Mindestens eins ändern: titel, minuten oder portionen");
  }
  // Regel: Was mitgeschickt wird, muss gültig sein
  if (titel !== undefined) pruefeText(titel, "Der Titel", MAX_TITEL_LAENGE);
  if (minuten !== undefined) pruefePositiveZahl(minuten, "minuten");
  if (portionen !== undefined) pruefePositiveZahl(portionen, "portionen");

  // Was nicht mitgeschickt wurde, wird zu null → das Repository behält dann den alten Wert
  const geaendert = await updateInDb(id, titel?.trim() ?? null, minuten ?? null, portionen ?? null);
  if (!geaendert) {
    throw new RecipeNotFoundError(id);
  }
  return geaendert;
}

// --- BONUS: Zutat zu einem Rezept hinzufügen ---
// Erwartet im Body z. B. { "zutatId": 18, "menge": "500 g" }
export async function addZutatToRecipe(
  rezeptId: number,
  daten: { zutatId?: unknown; menge?: unknown }
): Promise<Rezept> {
  pruefePositiveZahl(rezeptId, "Die ID");
  const zutatId = daten?.zutatId;
  const menge = daten?.menge;
  pruefePositiveZahl(zutatId, "zutatId");
  pruefeText(menge, "menge", MAX_MENGE_LAENGE);

  // Regel: das Rezept muss existieren → sonst 404
  if (!(await getByIdFromDb(rezeptId))) {
    throw new RecipeNotFoundError(rezeptId);
  }

  try {
    await addZutatInDb(rezeptId, zutatId, menge.trim());
  } catch (err: any) {
    // Die Datenbank meldet Regelverstöße mit festen Fehlercodes – wir übersetzen sie
    if (err.code === "23503") {   // Fremdschlüssel: diese Zutat gibt es nicht
      throw new ValidationError(`Zutat mit ID ${zutatId} gibt es nicht`);
    }
    if (err.code === "23505") {   // Primärschlüssel: Zutat ist schon im Rezept
      throw new ConflictError(`Zutat ${zutatId} ist schon in Rezept ${rezeptId}`);
    }
    throw err;                    // alles andere → 500 über die Error-Middleware
  }

  // Das komplette Rezept inklusive der neuen Zutat zurückgeben
  return (await getByIdFromDb(rezeptId))!;
}
