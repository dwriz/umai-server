const { DB } = require("../config/mongodb");
const { ObjectId } = require("mongodb");

const recipeCollection = DB.collection("recipes");

class RecipeModel {
  static async findAll() {
    try {
      const result = await recipeCollection
        .aggregate([
          {
            $lookup: {
              from: "users",
              localField: "UserId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: "$user",
          },
          {
            $project: {
              "user.password": 0,
              "user.balance": 0,
            },
          },
        ])
        .toArray();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await recipeCollection
        .aggregate([
          {
            $match: { _id: new ObjectId(id) },
          },
          {
            $lookup: {
              from: "users",
              localField: "UserId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: "$user",
          },
          {
            $project: {
              "user.password": 0,
              "user.balance": 0,
            },
          },
        ])
        .toArray();

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const { insertedId } = await recipeCollection.insertOne(data);

      return await this.findById(insertedId);
    } catch (error) {
      throw error;
    }
  }

  static async addImgUrl(id, cloudinaryImgUrl, instructions) {
    try {
      const result = await recipeCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { imgUrl: cloudinaryImgUrl, instructions } }
      );

      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { RecipeModel };
