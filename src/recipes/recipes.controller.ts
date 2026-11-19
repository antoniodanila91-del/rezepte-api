import { Request, Response, NextFunction } from "express";
import { getAllRecipes, getRecipeById, createRecipe, deleteRecipe } from "./recipes.service.ts";

export async function getRecipesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // Bonus von Tag 1: optionaler Filter ?maxMinuten=20
    const { maxMinuten } = req.query;
    let max: number | undefined;

    if (maxMinuten !== undefined) {
      max = Number(maxMinuten);
      if (typeof maxMinuten !== "string" || Number.isNaN(max)) {
        return res.status(400).json({ fehler: "maxMinuten muss eine Zahl sein" });
      }
    }

    const rezepte = await getAllRecipes(max);
    res.json(rezepte);
  } catch (err) {
    next(err);                          // Fehler weiterreichen (-> Error-Middleware in 1.3)
  }
}

export async function getRecipeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const rezept = await getRecipeById(id);   // wirft RecipeNotFoundError, wenn es keins gibt
    res.json(rezept);
  } catch (err) {
    next(err);                                // -> Error-Middleware
  }
}

export async function createRecipeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const neues = await createRecipe(req.body);
    res.status(201).json(neues);        // 201 = Created
  } catch (err) {
    next(err);
  }
}

export async function deleteRecipeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const geloescht = await deleteRecipe(id);

    if (!geloescht) {
      return res.status(404).json({ fehler: "Rezept nicht gefunden" });
    }

    res.status(204).send();             // 204 = No Content, kein Body
  } catch (err) {
    next(err);
  }
}
