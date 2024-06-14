const { RecipeModel } = require("../models/recipeModel");
const { cloudinary } = require("../helpers/cloudinary");

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

      const result = await RecipeModel.findById(id);

      if (!result) {
        throw new Error("RECIPE_NOT_FOUND");
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createRecipe(req, res, next) {
    try {
      const { name, ingredients, instructions } = req.body;
      const { _id } = req.user;

      const result = await RecipeModel.create({
        name,
        ingredients: JSON.parse(ingredients),
        instructions: JSON.parse(instructions),
        UserId: _id,
      });

      const base64 = req.file.buffer.toString("base64");
      const base64DataUrl = `data:${req.file.mimetype};base64,${base64}`;

      const cloudinaryImgUrl = await cloudinary.uploader.upload(base64DataUrl, {
        folder: "umai-recipe-img",
        public_id: result._id.toString(),
      });

      const resultWithImg = await RecipeModel.addImgUrl(result._id.toString(), cloudinaryImgUrl.secure_url);

      res.status(201).json(resultWithImg);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { RecipeController };
