const { ObjectId } = require("mongodb");
const { DB } = require("../config/mongoConfig");

const collection = DB.collection("recipes");
class RecipeModel {
  static async findAll() {
    try {
      const result = await collection.find().toArray();
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
}

module.exports = { RecipeModel };
