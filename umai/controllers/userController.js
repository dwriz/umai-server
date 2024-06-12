const { RecipeModel } = require("../models/recipesModel");
const { UserModel } = require("../models/userModel");

class UserController {
  static async register(req, res, next) {
    try {
      const newUser = req.body;
      await UserModel.register(newUser);
      res.status(201).json({
        email: newUser.email,
        username: newUser.username,
        fullname: newUser.fullname,
      });
    } catch (error) {
      res.send(error);
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
