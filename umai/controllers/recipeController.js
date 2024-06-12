const { RecipeModel } = require("../models/recipeModel");
const { ObjectId } = require("mongodb");

class RecipeController {
  static async getAllRecipe(req, res, next) {
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

      const result = await RecipeModel.findById({ _id: new ObjectId(id) });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createRecipe(req, res, next) {
    try {
      const { name, ingredients, instructions, imgUrl } = req.body;
      const { _id } = req.user;

      const result = await RecipeModel.create({
        name,
        ingredients,
        instructions,
        imgUrl,
        userId: _id,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { RecipeController };
