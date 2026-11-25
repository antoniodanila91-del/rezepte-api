import { Router } from "express";
import {
  getRecipesHandler,
  getRecipeHandler,
  createRecipeHandler,
  deleteRecipeHandler,
  updateRecipeHandler,
  addZutatHandler,
} from "./recipes.controller.ts";
import { checkApiKey } from "../middlewares/checkApiKey.ts";

const router = Router();
router.get("/", getRecipesHandler);
router.get("/:id", getRecipeHandler);
router.post("/", createRecipeHandler);
router.delete("/:id", checkApiKey, deleteRecipeHandler);   // erst API-Key prüfen, dann löschen

// Bonus aus aufgabe-2.3
router.patch("/:id", checkApiKey, updateRecipeHandler);    // ändern ist wie löschen geschützt
router.post("/:id/zutaten", addZutatHandler);              // Zutat zu einem Rezept hinzufügen

export default router;
