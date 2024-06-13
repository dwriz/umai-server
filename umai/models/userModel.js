const { DB } = require("../config/mongodb");
const validator = require("validator");
const { hashPassword } = require("../helpers/bcrypt");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { ObjectId } = require("mongodb");

const collection = DB.collection("users");

class UserModel {
  static async register(newUser) {
    try {
      if (!newUser.fullname) throw new Error("FULLNAME_NOT_FOUND");
      if (!newUser.username) throw new Error("USERNAME_NOT_FOUND");
      if (!newUser.email) throw new Error("EMAIL_NOT_FOUND");
      if (!newUser.password) throw new Error("PASSWORD_NOT_FOUND");
      if (newUser.password.length < 8)
        throw new Error("PASSWORD_LENGTH_INVALID");
      if (!validator.isEmail(newUser.email))
        throw new Error("EMAIL_FORMAT_INVALID");

      const existingUser = await collection.findOne({
        $or: [{ username: newUser.username }, { email: newUser.email }],
      });
      if (existingUser) throw new Error("USER_ALREADY_REGISTERED");

      newUser.password = hashPassword(newUser.password);
      newUser.balance = 0;

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
      const result = await collection.findOne({ email });

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await collection.findOne({ _id: new ObjectId(id) });

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const result = await collection.findOne({ username });

      return result;
    } catch (error) {
      throw error;
    }
  }
  static async login({ email, password }) {
    try {
      if (!email) throw new Error("EMAIL_NOT_FOUND");
      if (!password) throw new Error("PASSWORD_NOT_FOUND");
      if (!validator.isEmail(email)) throw new Error("EMAIL_INVALID");

      const user = await this.findByEmail(email);
      if (!user) throw new Error("EMAIL_NOT_REGISTERED");

      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) throw new Error("PASSWORD_INVALID");

      const access_token = signToken({
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
      });

      return access_token;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { UserModel };
