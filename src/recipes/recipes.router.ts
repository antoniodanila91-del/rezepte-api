import { Router } from "express";
import { getRecipesHandler, getRecipeHandler, createRecipeHandler, deleteRecipeHandler } from "./recipes.controller.ts";
import { checkApiKey } from "../middlewares/checkApiKey.ts";

const router = Router();
router.get("/", getRecipesHandler);
router.get("/:id", getRecipeHandler);
router.post("/", createRecipeHandler);
router.delete("/:id", checkApiKey, deleteRecipeHandler);   // erst API-Key prüfen, dann löschen

export default router;
