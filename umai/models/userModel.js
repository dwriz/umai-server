const { DB } = require("../config/mongoConfig");
const validator = require("validator");
const { hashPass } = require("../helpers/bcrypt");
const { comparePass } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

const collection = DB.collection("users");
class UserModel {
  static async register(newUser) {
    try {
      if (!newUser.fullname) {
        throw new Error("name is required");
      }
      if (!newUser.username) {
        throw new Error("username is required");
      }
      if (!newUser.email) {
        throw new Error("email is required");
      }
      if (!newUser.password) {
        throw new Error("password is required");
      }
      if (!validator.isEmail(newUser.email)) {
        throw new Error("Invalid email format");
      }
      if (newUser.password.length < 8) {
        throw new Error("Password must be at least 5 characters long");
      }
      const existingUser = await collection.findOne({
        $or: [{ username: newUser.username }, { email: newUser.email }],
      });
      if (existingUser) {
        throw new Error("Username or Email already exists");
      }
      newUser.password = hashPass(newUser.password);
      const result = await collection.insertOne({
        ...newUser,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findByEmail(email) {
    try {
      const result = await collection.findOne({ email: email });
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async login(userLogin) {
    if (!userLogin.email || !userLogin.password) {
      throw new Error("Email and Password are required");
    }
    if (!validator.isEmail(userLogin.email)) {
      throw new Error("Invalid email format");
    }
    const user = await this.findByEmail(userLogin.email);
    if (!user) {
      throw new Error("User not found");
    }
    const isValidPassword = comparePass(userLogin.password, user.password);
    if (!isValidPassword) {
      throw new Error("Incorrect password");
    }
    const access_token = signToken({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
    });
    return access_token;
  }
}

module.exports = { UserModel };
