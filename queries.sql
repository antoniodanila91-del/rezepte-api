-- Abfragen fuer schema.sql; auf einer frisch befuellten Datenbank ausfuehren.

-- Aufgabe 4.1: Alle Rezepte, alle Spalten
SELECT * FROM rezepte;

-- Aufgabe 4.2: Nur Titel und Zubereitungszeit
SELECT titel, minuten FROM rezepte;

-- Aufgabe 4.3: Hoechstens 30 Minuten
SELECT * FROM rezepte
WHERE minuten <= 30;

-- Aufgabe 4.4: Schnellste Rezepte zuerst
SELECT titel, minuten FROM rezepte
ORDER BY minuten ASC;

-- Aufgabe 4.5: Anzahl aller Rezepte
SELECT COUNT(*) AS anzahl_rezepte FROM rezepte;

-- Aufgabe 4.6: Zutaten eines Rezepts (JOIN ueber drei Tabellen)
SELECT r.titel, z.name, rz.menge
FROM rezepte r
JOIN rezept_zutaten rz ON rz.rezept_id = r.id
JOIN zutaten z ON z.id = rz.zutat_id
WHERE r.id = 1;

-- Bonus 1: In welchen Rezepten kommt Zwiebel vor?
SELECT r.titel, rz.menge
FROM zutaten z
JOIN rezept_zutaten rz ON rz.zutat_id = z.id
JOIN rezepte r ON r.id = rz.rezept_id
WHERE z.name = 'Zwiebel';

-- Bonus 2: Zutaten pro Rezept
SELECT r.titel, COUNT(rz.zutat_id) AS anzahl_zutaten
FROM rezepte r
LEFT JOIN rezept_zutaten rz ON rz.rezept_id = r.id
GROUP BY r.id, r.titel
ORDER BY anzahl_zutaten DESC;

-- Bonus 4: Kategorie eines Rezepts
SELECT r.titel, k.name AS kategorie
FROM rezepte r
LEFT JOIN kategorien k ON k.id = r.kategorie_id
ORDER BY k.name, r.titel;

-- Aufgabe 5: Aendern; vorher und nachher dieselbe Zeile pruefen.
SELECT * FROM rezepte WHERE titel = 'Linsen-Curry';
UPDATE rezepte SET portionen = 6 WHERE titel = 'Linsen-Curry';
SELECT * FROM rezepte WHERE titel = 'Linsen-Curry';

-- Aufgabe 5 / Bonus 3: Loeschen und ON DELETE CASCADE pruefen.
SELECT * FROM rezepte WHERE id = 1;
SELECT COUNT(*) AS verknuepfungen_vorher
FROM rezept_zutaten WHERE rezept_id = 1;
DELETE FROM rezepte WHERE id = 1;
SELECT COUNT(*) AS verknuepfungen_nachher
FROM rezept_zutaten WHERE rezept_id = 1;
SELECT * FROM zutaten;
