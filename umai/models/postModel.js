const { DB } = require("../config/mongodb");
const { ObjectId } = require("mongodb");

const postCollection = DB.collection("posts");

class PostModel {
  static async create(data) {
    try {
      const { RecipeId, UserId } = data;

      const { insertedId } = await postCollection.insertOne({
        RecipeId: new ObjectId(RecipeId),
        UserId: new ObjectId(UserId),
        likes: [],
        comments: [],
      });

      return await this.findById(insertedId);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await postCollection.findOne({ _id: new ObjectId(id) });

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async addImgUrl(id, imgUrl) {
    try {
      const result = await postCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { imgUrl } }
      );

      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { PostModel };
