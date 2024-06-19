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
      const _id = req.user._id;
      const name = req.body.name;
      const ingredients = req.body.ingredients;
      let instructions = JSON.parse(req.body.instructions);

      let tempInstructions = [];
      instructions.forEach((instruction) => {
        tempInstructions.push({
          description: instruction.description,
        });
      });

      const result = await RecipeModel.create({
        name,
        ingredients: JSON.parse(ingredients),
        UserId: _id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      for (const [
        index,
        instructionImg,
      ] of req.files.instruction_images.entries()) {
        let instructionImgBase64 = instructionImg.buffer.toString("base64");
        let instructionImgBase64DataUrl = `data:${instructionImg.mimetype};base64,${instructionImgBase64}`;

        let cloudinaryInstructionImgUrl = await cloudinary.uploader.upload(
          instructionImgBase64DataUrl,
          {
            folder: "umai-recipe-img",
            public_id: `${result._id.toString()}-instruction-img-${index}`,
          }
        );

        instructions[index].imgUrl = cloudinaryInstructionImgUrl.secure_url;
      }

      const recipeImgBase64 = req.files.image[0].buffer.toString("base64");
      const recipeImgBase65DataUrl = `data:${req.files.image[0].mimetype};base64,${recipeImgBase64}`;
      const cloudinaryImgUrl = await cloudinary.uploader.upload(
        recipeImgBase65DataUrl,
        {
          folder: "umai-recipe-img",
          public_id: `${result._id.toString()}-main-img`,
        }
      );

      const resultWithImg = await RecipeModel.addImgUrl(
        result._id.toString(),
        cloudinaryImgUrl.secure_url,
        instructions
      );

      res.status(201).json({ message: "Successfully created a recipe" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { RecipeController };
