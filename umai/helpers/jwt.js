const jwt = require("jsonwebtoken");

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const verifyToken = (access_token) => {
  try {
    return jwt.verify(access_token, process.env.JWT_SECRET);
  } catch (error) {
    throw error
  }
};

module.exports = { signToken, verifyToken };
