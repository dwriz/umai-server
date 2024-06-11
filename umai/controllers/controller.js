const { UserModel } = require("../models/userModel");
class Controller {
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
}

module.exports = { Controller };
