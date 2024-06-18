const { UserModel } = require("../models/userModel");
const { cloudinary } = require("../helpers/cloudinary");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
      const result = await UserModel.login(req.body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async increaseFinishedRecipeCount(req, res, next) {
    try {
      const { _id } = req.user;

      const result = await UserModel.incrementFinishedRecipeCount(_id);

      res
        .status(200)
        .json({ message: "Successfully Increase Finished Recipe" });
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

  static async getSelfProfile(req, res, next) {
    try {
      const { _id } = req.user;

      const result = await UserModel.findProfile(_id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const { id } = req.params;

      const result = await UserModel.findProfile(id);

      if (!result) throw new Error("USER_NOT_FOUND");

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createPaymentIntent(req, res, next) {
    try {
      const { amount } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
      });

      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      next(error);
    }
  }

  static async addBalance(req, res, next) {
    try {
      const { _id } = req.user;
      const { amount } = req.body;

      const result = await UserModel.incrementBalance(_id, parseInt(amount));

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async donateBalance(req, res, next) {
    try {
      const { _id } = req.user;
      const { amount, targetUserId } = req.body;
      if (!amount) throw new Error("AMOUNT_NOT_FOUND");
      if (!targetUserId) throw new Error("USER_NOT_FOUND");

      await UserModel.decrementBalance(_id, parseInt(amount));
      await UserModel.incrementBalance(targetUserId, parseInt(amount));

      res.status(200).json({ message: "donation success" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { UserController };
