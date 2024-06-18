const request = require("supertest");
const { test, expect, describe, afterAll } = require("@jest/globals");
const { app } = require("../app.js");
const { DB } = require("../config/mongodb");
const { ObjectId } = require("mongodb");
const { RecipeController } = require("../controllers/recipeController");
const { RecipeModel } = require("../models/recipeModel");

describe("Post API", () => {
  afterAll(async () => {
    const userCollection = DB.collection("users");
    const user = await userCollection.findOne({
      email: "testuser@example.com",
    });
    userId = new ObjectId(user._id);
    const postCollection = DB.collection("posts");
    await postCollection.deleteMany({ UserId: userId });
    const recipeCollection = DB.collection("recipes");
    await recipeCollection.deleteMany({ name: "Test Recipe" });
    await userCollection.deleteMany({ email: "testuser@example.com" });
  });

  test("POST /register : Create new account", async () => {
    const response = await request(app)
      .post("/register")
      .field("fullname", "Test User")
      .field("username", "testuser")
      .field("email", "testuser@example.com")
      .field("password", "password")
      .attach("profileImg", "images/test-image.jpeg");
    const { body, status } = response;
    expect(status).toBe(201);
    expect(body).toHaveProperty("message", "user created successfully");
  });

  test("POST /recipe : Create new recipe", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const response = await request(app)
      .post("/recipe")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`)
      .field("name", "Test Recipe")
      .field("ingredients", JSON.stringify(["ingredient 1", "ingredient 2"]))
      .field("instructions", JSON.stringify([{ description: "instruction 1" }]))
      .attach("image", "images/test-image.jpeg")
      .attach("instruction_images", "images/test-image.jpeg");
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Successfully created a recipe"
    );
  }, 10000);

  test("POST /post : Create new post - success", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const recipeCollection = DB.collection("recipes");
    const recipe = await recipeCollection.findOne({ name: "Test Recipe" });
    const recipeId = recipe._id.toString();
    const response = await request(app)
      .get(`/recipe/${recipeId}`)
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`);
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body._id).toBe(recipeId);
    expect(body.name).toBe(recipe.name);
    expect(body.ingredients).toEqual(recipe.ingredients);
    expect(body.imgUrl).toBe(recipe.imgUrl);
    expect(body.instructions).toEqual(recipe.instructions);
    const userCollection = DB.collection("users");
    const user = await userCollection.findOne({ _id: recipe.UserId });
    expect(body.user._id).toBe(user._id.toString());
    expect(body.user.fullname).toBe(user.fullname);
    expect(body.user.username).toBe(user.username);
    expect(body.user.email).toBe(user.email);
    expect(body.user.finishedRecipeCount).toBe(user.finishedRecipeCount);
    expect(body.user.profileImgUrl).toBe(user.profileImgUrl);
    const postResponse = await request(app)
      .post("/post")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`)
      .field("RecipeId", recipeId)
      .attach("postImg", "images/test-image.jpeg");
    expect(postResponse.status).toBe(201);
    expect(postResponse.body).toHaveProperty(
      "message",
      "Successfully created a post"
    );
  });

  test("POST /post : Create new post - fail (no post image)", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const recipeCollection = DB.collection("recipes");
    const recipe = await recipeCollection.findOne({ name: "Test Recipe" });
    const recipeId = recipe._id.toString();
    const response = await request(app)
      .get(`/recipe/${recipeId}`)
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`);
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body._id).toBe(recipeId);
    expect(body.name).toBe(recipe.name);
    expect(body.ingredients).toEqual(recipe.ingredients);
    expect(body.imgUrl).toBe(recipe.imgUrl);
    expect(body.instructions).toEqual(recipe.instructions);
    const userCollection = DB.collection("users");
    const user = await userCollection.findOne({ _id: recipe.UserId });
    expect(body.user._id).toBe(user._id.toString());
    expect(body.user.fullname).toBe(user.fullname);
    expect(body.user.username).toBe(user.username);
    expect(body.user.email).toBe(user.email);
    expect(body.user.finishedRecipeCount).toBe(user.finishedRecipeCount);
    expect(body.user.profileImgUrl).toBe(user.profileImgUrl);
    const postResponse = await request(app)
      .post("/post")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`)
      .send({ RecipeId: recipeId });
    expect(postResponse.status).toBe(400);
    expect(postResponse.body).toHaveProperty(
      "message",
      "post image is required"
    );
  });

  test("POST /post : Create new post - fail (no recipe id)", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const recipeCollection = DB.collection("recipes");
    const recipe = await recipeCollection.findOne({ name: "Test Recipe" });
    const recipeId = recipe._id.toString();
    const response = await request(app)
      .get(`/recipe/${recipeId}`)
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`);
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body._id).toBe(recipeId);
    expect(body.name).toBe(recipe.name);
    expect(body.ingredients).toEqual(recipe.ingredients);
    expect(body.imgUrl).toBe(recipe.imgUrl);
    expect(body.instructions).toEqual(recipe.instructions);
    const userCollection = DB.collection("users");
    const user = await userCollection.findOne({ _id: recipe.UserId });
    expect(body.user._id).toBe(user._id.toString());
    expect(body.user.fullname).toBe(user.fullname);
    expect(body.user.username).toBe(user.username);
    expect(body.user.email).toBe(user.email);
    expect(body.user.finishedRecipeCount).toBe(user.finishedRecipeCount);
    expect(body.user.profileImgUrl).toBe(user.profileImgUrl);
    const postResponse = await request(app)
      .post("/post")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`)
      .attach("postImg", "images/test-image.jpeg");
    expect(postResponse.status).toBe(404);
    expect(postResponse.body).toHaveProperty("message", "recipe not found");
  });

  test("GET /posts : Fetch all posts - success", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const response = await request(app)
      .get("/posts")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`);
    const { body, status } = response;
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    const post = body[0];
    expect(post).toHaveProperty("_id");
    expect(post).toHaveProperty("RecipeId");
    expect(post).toHaveProperty("UserId");
    expect(post).toHaveProperty("imgUrl");
  });

  test("GET /posts : Fetch all posts - fail (invalid token)", async () => {
    const wrongToken = "wrongtoken";
    const response = await request(app)
      .get("/posts")
      .set("Authorization", `Bearer ${wrongToken}`);
    const { body, status } = response;
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "token invalid");
  });

  test("GET /posts : Fetch all posts - fail (missing token)", async () => {
    const response = await request(app).get("/posts");
    const { body, status } = response;
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "authentication invalid");
  });

  test("GET /posts : Fetch all posts - fail (invalid token - no signed ID)", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const userCollection = DB.collection("users");
    const user = await userCollection.findOne({
      email: "testuser@example.com",
    });
    const { signToken } = require("../helpers/jwt");
    const invalidToken = signToken({ email: user.email });
    const response = await request(app)
      .get("/posts")
      .set("Authorization", `Bearer ${invalidToken}`);
    const { body, status } = response;
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "authentication invalid");
  });
});
