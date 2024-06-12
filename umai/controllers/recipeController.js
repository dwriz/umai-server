const { RecipeModel } = require("../models/recipesModel");

class RecipeController {
  static async getAllRecipes(req, res, next) {
    try {
      const result = await RecipeModel.findAll();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  static async getRecipeById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await RecipeModel.findById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { RecipeController };
