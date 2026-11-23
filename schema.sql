-- Rezepte-API: Schema und Beispieldaten für PostgreSQL.
-- Die drei Pflicht-Tabellen werden zuerst angelegt. kategorien ist der Bonus
-- zur 1:n-Beziehung. Tabellen und Beispieldaten koennen erneut ausgeführt werden.

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

-- Kategorien (Bonus)
INSERT INTO kategorien (name) VALUES
    ('Hauptgericht'),
    ('Salat'),
    ('Süßspeise')
ON CONFLICT (name) DO NOTHING;

-- Die Bewertung ist eine eigene Rezeptspalte und wird bei jedem Rezept gesetzt.
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

-- Jede Zutat wird nur einmal gespeichert.
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

-- Mengen gehoeren zur Rezept-Zutat-Beziehung, nicht zur Zutat selbst.
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
