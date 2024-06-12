const { verifyToken } = require("../helpers/jwt");
const { UserModel } = require("../models/userModel");

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

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authentication };
