const { UserModel } = require("../models/userModel");
const { cloudinary } = require("../helpers/cloudinary");

class UserController {
  static async register(req, res, next) {
    try {
      if (!req.file) throw new Error("PROFILE_IMAGE_NOT_FOUND");
      const newUser = req.body;

      const result = await UserModel.register(newUser);

      const profileImgBase64 = req.file.buffer.toString("base64");
      const profileImgBase64DataUrl = `data:${req.file.mimetype};base64,${profileImgBase64}`;
      const cloudinaryProfileImgUrl = await cloudinary.uploader.upload(
        profileImgBase64DataUrl,
        {
          folder: "umai-profile-img",
          public_id: result.insertedId,
        }
      );

      await UserModel.addProfileImgUrl(
        result.insertedId.toString(),
        cloudinaryProfileImgUrl.secure_url
      );

      res.status(201).json({
        message: "User created successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const access_token = await UserModel.login(req.body);

      res.status(200).json({ access_token });
    } catch (error) {
      next(error);
    }
  }

  static async increaseFinishedRecipeCount(req, res, next) {
    try {
      const { _id } = req.user;

      const result = await UserModel.incrementFinishedRecipeCount(_id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUsersRanking(req, res, next) {
    try {
      const result = await UserModel.findAllWithPostsAndRecipes();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { UserController };
