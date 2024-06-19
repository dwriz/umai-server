const bcrypt = require("bcryptjs");

function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(8));
}

function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

module.exports = { hashPassword, comparePassword };
