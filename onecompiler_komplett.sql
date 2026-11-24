-- Komplettes OneCompiler-Skript: Schema, Beispieldaten und Abfragen.
-- Fuer den ersten Lauf gedacht; UPDATE und DELETE am Ende veraendern die Daten.

CREATE TABLE IF NOT EXISTS kategorien (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS rezepte (
    id SERIAL PRIMARY KEY,
    titel VARCHAR(255) NOT NULL,
    minuten INTEGER,
    portionen INTEGER,
    anleitung TEXT,
    bewertung INTEGER CHECK (bewertung BETWEEN 1 AND 5),
    erstellt_am TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    kategorie_id INTEGER REFERENCES kategorien(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS zutaten (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS rezept_zutaten (
    rezept_id INTEGER NOT NULL REFERENCES rezepte(id) ON DELETE CASCADE,
    zutat_id INTEGER NOT NULL REFERENCES zutaten(id),
    menge VARCHAR(100),
    PRIMARY KEY (rezept_id, zutat_id)
);

INSERT INTO kategorien (name) VALUES
    ('Hauptgericht'),
    ('Salat'),
    ('Süßspeise')
ON CONFLICT (name) DO NOTHING;

INSERT INTO rezepte (titel, minuten, portionen, anleitung, bewertung, kategorie_id)
SELECT v.titel, v.minuten, v.portionen, v.anleitung, v.bewertung, k.id
FROM (VALUES
    (1, 'Spaghetti Carbonara', 20, 2,
     'Nudeln kochen, Speck anbraten, Eier mit Käse verrühren und alles abseits der Hitze vermengen.',
     5, 'Hauptgericht'),
    (2, 'Linsen-Curry', 35, 4,
     'Zwiebel anschwitzen, Currypaste kurz mitrösten, Linsen, Tomaten und Kokosmilch dazugeben und 20 Minuten köcheln lassen.',
     4, 'Hauptgericht'),
    (3, 'Griechischer Salat', 10, 2,
     'Gemüse würfeln, mit Oliven und Feta mischen, mit Olivenöl beträufeln.',
     4, 'Salat'),
    (4, 'Ofengemüse mit Hähnchen', 45, 3,
     'Gemüse schneiden, mit Hähnchen und Gewürzen aufs Blech legen und bei 200 °C ca. 40 Minuten backen.',
     5, 'Hauptgericht'),
    (5, 'Pfannkuchen', 25, 3,
     'Mehl, Eier, Milch und Zucker zu einem glatten Teig verrühren, 10 Minuten quellen lassen und portionsweise in der Pfanne ausbacken.',
     4, 'Süßspeise')
) AS v(sort_order, titel, minuten, portionen, anleitung, bewertung, kategorie)
JOIN kategorien k ON k.name = v.kategorie
WHERE NOT EXISTS (
    SELECT 1 FROM rezepte r WHERE r.titel = v.titel
)
ORDER BY v.sort_order;

INSERT INTO zutaten (name) VALUES
    ('Spaghetti'),
    ('Speck'),
    ('Ei'),
    ('Pecorino'),
    ('Pfeffer'),
    ('Linsen'),
    ('Kokosmilch'),
    ('Zwiebel'),
    ('Currypaste'),
    ('Tomaten'),
    ('Gurke'),
    ('Feta'),
    ('Oliven'),
    ('Olivenöl'),
    ('Hähnchenschenkel'),
    ('Paprika'),
    ('Zucchini'),
    ('Kartoffeln'),
    ('Rosmarin'),
    ('Mehl'),
    ('Milch'),
    ('Zucker')
ON CONFLICT (name) DO NOTHING;

INSERT INTO rezept_zutaten (rezept_id, zutat_id, menge)
SELECT r.id, z.id, v.menge
FROM (VALUES
    ('Spaghetti Carbonara', 'Spaghetti', '200 g'),
    ('Spaghetti Carbonara', 'Speck', '100 g'),
    ('Spaghetti Carbonara', 'Ei', '2 Stück'),
    ('Spaghetti Carbonara', 'Pecorino', '50 g'),
    ('Spaghetti Carbonara', 'Pfeffer', 'nach Geschmack'),
    ('Linsen-Curry', 'Linsen', '250 g'),
    ('Linsen-Curry', 'Kokosmilch', '1 Dose'),
    ('Linsen-Curry', 'Zwiebel', '1 Stück'),
    ('Linsen-Curry', 'Currypaste', '2 EL'),
    ('Linsen-Curry', 'Tomaten', '1 Dose'),
    ('Griechischer Salat', 'Tomaten', '2 Stück'),
    ('Griechischer Salat', 'Gurke', '1 Stück'),
    ('Griechischer Salat', 'Zwiebel', '1 Stück (rot)'),
    ('Griechischer Salat', 'Feta', '200 g'),
    ('Griechischer Salat', 'Oliven', 'nach Geschmack'),
    ('Griechischer Salat', 'Olivenöl', 'nach Geschmack'),
    ('Ofengemüse mit Hähnchen', 'Hähnchenschenkel', '3 Stück'),
    ('Ofengemüse mit Hähnchen', 'Paprika', '2 Stück'),
    ('Ofengemüse mit Hähnchen', 'Zucchini', '1 Stück'),
    ('Ofengemüse mit Hähnchen', 'Kartoffeln', '4 Stück'),
    ('Ofengemüse mit Hähnchen', 'Rosmarin', 'nach Geschmack'),
    ('Pfannkuchen', 'Mehl', '250 g'),
    ('Pfannkuchen', 'Ei', '3 Stück'),
    ('Pfannkuchen', 'Milch', '500 ml'),
    ('Pfannkuchen', 'Zucker', '1 EL')
) AS v(rezept_titel, zutat_name, menge)
JOIN rezepte r ON r.titel = v.rezept_titel
JOIN zutaten z ON z.name = v.zutat_name
WHERE TRUE
ON CONFLICT (rezept_id, zutat_id) DO NOTHING;

-- Aufgabe 4.1: Alle Rezepte, alle Spalten
SELECT * FROM rezepte;

-- Aufgabe 4.2: Nur Titel und Minuten
SELECT titel, minuten FROM rezepte;

-- Aufgabe 4.3: Hoechstens 30 Minuten
SELECT * FROM rezepte WHERE minuten <= 30;

-- Aufgabe 4.4: Schnellste zuerst
SELECT titel, minuten FROM rezepte ORDER BY minuten ASC;

-- Aufgabe 4.5: Anzahl Rezepte
SELECT COUNT(*) AS anzahl_rezepte FROM rezepte;

-- Aufgabe 4.6: Zutaten eines Rezepts
SELECT r.titel, z.name, rz.menge
FROM rezepte r
JOIN rezept_zutaten rz ON rz.rezept_id = r.id
JOIN zutaten z ON z.id = rz.zutat_id
WHERE r.id = 1;

-- Bonus 1: Rezepte mit Zwiebel
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

-- Bonus 4: Rezepte mit Kategorie
SELECT r.titel, k.name AS kategorie
FROM rezepte r
LEFT JOIN kategorien k ON k.id = r.kategorie_id
ORDER BY k.name, r.titel;

-- Aufgabe 5: Linsen-Curry aendern; vorher und nachher kontrollieren.
SELECT * FROM rezepte WHERE titel = 'Linsen-Curry';
UPDATE rezepte SET portionen = 6 WHERE titel = 'Linsen-Curry';
SELECT * FROM rezepte WHERE titel = 'Linsen-Curry';

-- Aufgabe 5 / Bonus 3: Carbonara loeschen und CASCADE kontrollieren.
SELECT * FROM rezepte WHERE id = 1;
SELECT COUNT(*) AS verknuepfungen_vorher
FROM rezept_zutaten WHERE rezept_id = 1;
DELETE FROM rezepte WHERE id = 1;
SELECT COUNT(*) AS verknuepfungen_nachher
FROM rezept_zutaten WHERE rezept_id = 1;
SELECT
    (SELECT COUNT(*) FROM rezept_zutaten WHERE rezept_id = 1) AS carbonara_verknuepfungen,
    (SELECT COUNT(*) FROM zutaten) AS verbleibende_zutaten;
