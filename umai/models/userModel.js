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
      newUser.finishedRecipeCount = 0;

      const result = await collection.insertOne({
        ...newUser,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async addProfileImgUrl(id, profileImgUrl) {
    try {
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { profileImgUrl } }
      );

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

  static async incrementFinishedRecipeCount(id) {
    try {
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { finishedRecipeCount: 1 } }
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAllWithPostsAndRecipes() {
    try {
      const result = await collection
        .aggregate([
          {
            $lookup: {
              from: "posts",
              localField: "_id",
              foreignField: "UserId",
              as: "posts",
            },
          },
          {
            $lookup: {
              from: "recipes",
              localField: "_id",
              foreignField: "UserId",
              as: "recipes",
            },
          },
          {
            $unwind: {
              path: "$posts",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "recipes",
              localField: "posts.RecipeId",
              foreignField: "_id",
              as: "postRecipe",
            },
          },
          {
            $unwind: {
              path: "$postRecipe",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: "$_id",
              fullname: { $first: "$fullname" },
              username: { $first: "$username" },
              email: { $first: "$email" },
              finishedRecipeCount: { $first: "$finishedRecipeCount" },
              profileImgUrl: { $first: "$profileImgUrl" },
              posts: {
                $push: {
                  _id: "$posts._id",
                  RecipeId: "$posts.RecipeId",
                  UserId: "$posts.UserId",
                  imgUrl: "$posts.imgUrl",
                  recipeName: "$postRecipe.name",
                },
              },
              recipes: { $first: "$recipes" },
            },
          },
          {
            $project: {
              "recipes.UserId": 0,
              "recipes.ingredients": 0,
              "recipes.instructions": 0,
            },
          },
        ])
        .toArray();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findProfile(id) {
    try {
      const result = await collection
        .aggregate([
          {
            $match: { _id: new ObjectId(id) },
          },
          {
            $lookup: {
              from: "posts",
              localField: "_id",
              foreignField: "UserId",
              as: "posts",
            },
          },
          {
            $lookup: {
              from: "recipes",
              localField: "_id",
              foreignField: "UserId",
              as: "recipes",
            },
          },
          {
            $unwind: {
              path: "$posts",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "recipes",
              localField: "posts.RecipeId",
              foreignField: "_id",
              as: "postRecipe",
            },
          },
          {
            $unwind: {
              path: "$postRecipe",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: "$_id",
              fullname: { $first: "$fullname" },
              username: { $first: "$username" },
              email: { $first: "$email" },
              finishedRecipeCount: { $first: "$finishedRecipeCount" },
              profileImgUrl: { $first: "$profileImgUrl" },
              posts: {
                $push: {
                  _id: "$posts._id",
                  RecipeId: "$posts.RecipeId",
                  UserId: "$posts.UserId",
                  imgUrl: "$posts.imgUrl",
                  recipeName: "$postRecipe.name",
                },
              },
              recipes: { $first: "$recipes" },
            },
          },
          {
            $project: {
              "recipes.UserId": 0,
              "recipes.ingredients": 0,
              "recipes.instructions": 0,
            },
          },
        ])
        .toArray();

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { UserModel };
