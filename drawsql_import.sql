-- PostgreSQL-DDL fuer den Import in drawSQL.
-- Entspricht schema.sql; die vierte Tabelle kategorien ist der optionale Bonus.

CREATE TABLE kategorien (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE rezepte (
    id SERIAL PRIMARY KEY,
    titel VARCHAR(255) NOT NULL,
    minuten INTEGER,
    portionen INTEGER,
    anleitung TEXT,
    bewertung INTEGER CHECK (bewertung BETWEEN 1 AND 5),
    erstellt_am TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    kategorie_id INTEGER REFERENCES kategorien(id) ON DELETE SET NULL
);

CREATE TABLE zutaten (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE rezept_zutaten (
    rezept_id INTEGER NOT NULL REFERENCES rezepte(id) ON DELETE CASCADE,
    zutat_id INTEGER NOT NULL REFERENCES zutaten(id),
    menge VARCHAR(100),
    PRIMARY KEY (rezept_id, zutat_id)
);
