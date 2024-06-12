const { UserModel } = require("../models/userModel");

class UserController {
  static async register(req, res, next) {
    try {
      const newUser = req.body;

      await UserModel.register(newUser);

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
}

module.exports = { UserController };
