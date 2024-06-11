const bcrypt = require("bcryptjs");

const hashPass = (plainPassword) => {
  return bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(8));
};

const comparePass = (plainPass, hashedPass) => {
  return bcrypt.compareSync(plainPass, hashedPass);
};

module.exports = { hashPass, comparePass };