const { PostModel } = require("../models/postModel");
const { cloudinary } = require("../helpers/cloudinary");

class PostController {
  static async createPost(req, res, next) {
    try {
      if (!req.file) throw new Error("POST_IMAGE_NOT_FOUND");
      const { RecipeId } = req.body;
      if (!RecipeId) throw new Error("RECIPE_NOT_FOUND");
      const { _id } = req.user;

      const data = {
        RecipeId: RecipeId,
        UserId: _id.toString(),
      };

      const result = await PostModel.create(data);

      const postImgBase64 = req.file.buffer.toString("base64");
      const postImgBase64DataUrl = `data:${req.file.mimetype};base64,${postImgBase64}`;

      const cloudinaryPostImgUrl = await cloudinary.uploader.upload(
        postImgBase64DataUrl,
        {
          folder: "umai-post-img",
          public_id: `${result._id}`,
        }
      );

      await PostModel.addImgUrl(
        result._id.toString(),
        cloudinaryPostImgUrl.secure_url
      );

      res.status(201).json({ message: "Successfully created a post" });
    } catch (error) {
      next(error);
    }
  }

  static async getAllPost(req, res, next) {
    try {
      const result = await PostModel.findAll();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { PostController };
