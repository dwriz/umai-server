const { name } = require("ejs");
const { verifyToken } = require("../helpers/jwt");
const { UserModel } = require("../models/userModel");
const { ObjectId } = require("mongodb");

async function authentication(req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw new Error("AUTHENTICATION_INVALID");

    const [type, token] = authorization.split(" ");
    if (type !== "Bearer") throw new Error("AUTHENTICATION_INVALID");

    const { _id } = verifyToken(token);
    if (!_id) throw new Error("AUTHENTICATION_INVALID");

    const user = await UserModel.findById(_id);
    if (!user) throw new Error("AUTHENTICATION_INVALID");

    req.user = {
      _id: user._id,
      email: user.email,
      fullname: user.fullname,
      username: user.username,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authentication };
