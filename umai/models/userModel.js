const { DB } = require("../config/mongoConfig");
const validator = require("validator");
const { hashPass } = require("../helpers/bcrypt");

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
}

module.exports = { UserModel };
