const { verifyToken } = require("../helpers/jwt");
const { UserModel } = require("../models/userModel");
const { ObjectId } = require("mongodb");

async function authentication(req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw { name: "Error authentication" };
    const [type, token] = authorization.split(" ");
    if (type !== "Bearer") {
      throw { name: "Error authentication" };
    }
    const { _id } = verifyToken(token);
    if (!_id) {
      throw { name: "Error authentication" };
    }
    const user = await UserModel.findById(_id);
    console.log(user);
    if (!user) throw { name: "Error authentication" };
    req.user = user;
    next();
  } catch (error) {
    throw error;
  }
}

module.exports = { authentication };
