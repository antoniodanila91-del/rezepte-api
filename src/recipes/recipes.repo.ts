import { getPostgresPool } from "../pool.postgres.ts";
import type { Rezept } from "./recipes.service.ts";

const pool = getPostgresPool();

// --- MUSTER (vorgegeben): alle Rezepte lesen (flach, ohne Zutaten) ---
export async function getAllRecipes(): Promise<Rezept[]> {
  const res = await pool.query(
    "SELECT id, titel, minuten, portionen FROM rezepte ORDER BY id"
  );
  return res.rows;              // immer ein Array – auch bei einer Zeile
}

// --- ein Rezept anlegen ---
// $1, $2, $3 sind Platzhalter: Die Werte kommen GETRENNT im Array dahinter.
// pg setzt sie sicher ein → Schutz vor SQL-Injection. Nie `${titel}` ins SQL schreiben!
// RETURNING gibt die neue Zeile direkt zurück – inklusive der id, die SERIAL vergeben hat.
export async function createRecipe(
  titel: string,
  minuten: number,
  portionen: number
): Promise<Rezept> {
  const res = await pool.query(
    `INSERT INTO rezepte (titel, minuten, portionen)
     VALUES ($1, $2, $3)
     RETURNING id, titel, minuten, portionen`,
    [titel, minuten, portionen]
  );
  return res.rows[0];           // [0] = das eine neue Rezept (kein Array!)
}

// --- ein Rezept MIT seinen Zutaten lesen (ZWEI Queries, nicht ein JOIN) ---
export async function getRecipeById(id: number): Promise<Rezept | null> {
  // 1) das Rezept selbst
  const rezeptRes = await pool.query(
    "SELECT id, titel, minuten, portionen FROM rezepte WHERE id = $1",
    [id]
  );
  const rezept = rezeptRes.rows[0];
  if (!rezept) {
    return null;                // nicht gefunden → null (der Service entscheidet, was dann passiert)
  }

  // 2) seine Zutaten per JOIN über die Zwischentabelle (n:m aus aufgabe-2.1)
  //    rezept_zutaten kennt die Menge, zutaten liefert den Namen dazu
  const zutatenRes = await pool.query(
    `SELECT z.name, rz.menge
     FROM rezept_zutaten rz
     JOIN zutaten z ON z.id = rz.zutat_id
     WHERE rz.rezept_id = $1`,
    [id]
  );

  // Rezept und Zutatenliste zu einem Objekt zusammenbauen
  return { ...rezept, zutaten: zutatenRes.rows };
}

// --- ein Rezept löschen ---
// Die Verknüpfungen in rezept_zutaten verschwinden dank ON DELETE CASCADE
// automatisch mit – siehe aufgabe-2.1 Bonus.
export async function deleteRecipe(id: number): Promise<void> {
  await pool.query("DELETE FROM rezepte WHERE id = $1", [id]);
}

// --- BONUS: ein Rezept ändern (Update) ---
// COALESCE($2, titel) heißt: "nimm den neuen Wert – ist er NULL, behalte den alten".
// So kann man auch nur EIN Feld ändern, und das SQL bleibt trotzdem immer gleich.
// Nicht gefunden → keine Zeile in RETURNING → null.
export async function updateRecipe(
  id: number,
  titel: string | null,
  minuten: number | null,
  portionen: number | null
): Promise<Rezept | null> {
  const res = await pool.query(
    `UPDATE rezepte
     SET titel     = COALESCE($2, titel),
         minuten   = COALESCE($3, minuten),
         portionen = COALESCE($4, portionen)
     WHERE id = $1
     RETURNING id, titel, minuten, portionen`,
    [id, titel, minuten, portionen]
  );
  return res.rows[0] ?? null;
}

// --- BONUS: einem Rezept eine Zutat hinzufügen ---
// Schreibt eine Zeile in die Zwischentabelle (n:m) – mit der Menge an der Beziehung.
// Gibt es Rezept oder Zutat nicht, meldet die Datenbank einen Fremdschlüssel-Fehler (23503).
// Ist die Zutat schon im Rezept, meldet sie einen Primärschlüssel-Fehler (23505).
export async function addZutatToRecipe(
  rezeptId: number,
  zutatId: number,
  menge: string
): Promise<void> {
  await pool.query(
    "INSERT INTO rezept_zutaten (rezept_id, zutat_id, menge) VALUES ($1, $2, $3)",
    [rezeptId, zutatId, menge]
  );
}