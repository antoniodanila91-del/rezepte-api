// Fachlicher Fehler: ein Rezept mit dieser ID gibt es nicht → 404
export class RecipeNotFoundError extends Error {
  status = 404;
  constructor(id: number) {
    super(`Rezept mit ID ${id} nicht gefunden`);
    this.name = new.target.name;    // Name = "RecipeNotFoundError" statt nur "Error"
  }
}

// Fachlicher Fehler: die Eingabe ist ungültig → 400
export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = new.target.name;    // Name = "ValidationError" statt nur "Error"
  }
}
