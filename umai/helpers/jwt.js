const jwt = require("jsonwebtoken");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

function verifyToken(access_token) {
  try {
    return jwt.verify(access_token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("TOKEN_INVALID");
  }
}

module.exports = { signToken, verifyToken };
