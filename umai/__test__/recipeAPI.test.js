const request = require("supertest");
const { test, expect, describe, afterAll } = require("@jest/globals");
const { app } = require("../app.js");
const { DB } = require("../config/mongodb");
const { ObjectId } = require("mongodb");
const { RecipeController } = require("../controllers/recipeController");
const { RecipeModel } = require("../models/recipeModel");

describe("Recipe API", () => {
  afterAll(async () => {
    const userCollection = DB.collection("users");
    await userCollection.deleteOne({ email: "testuser@example.com" });
    const recipeCollection = DB.collection("recipes");
    await recipeCollection.deleteOne({ name: "Test Recipe" });
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

  test("POST /recipe : Create recipe - success", async () => {
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

  test("GET /recipes : Fetch all recipes - success", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const response = await request(app)
      .get("/recipes")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`);
    const { body, status } = response;
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    const recipe = body[0];
    expect(recipe).toHaveProperty("_id");
    expect(recipe).toHaveProperty("name");
    expect(recipe).toHaveProperty("ingredients");
    expect(recipe).toHaveProperty("instructions");
    expect(recipe).toHaveProperty("imgUrl");
    expect(recipe).toHaveProperty("user");
    const user = recipe.user;
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("fullname");
    expect(user).toHaveProperty("username");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("finishedRecipeCount");
    expect(user).toHaveProperty("profileImgUrl");
  });

  test("GET /recipes : Fetch all recipes - fail", async () => {
    const findAllSpy = jest
      .spyOn(RecipeModel, "findAll")
      .mockImplementation(() => {
        throw new Error("Database error");
      });

    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    const response = await request(app)
      .get("/recipes")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`);
    const { body, status } = response;
    expect(status).toBe(500);
    expect(body).toHaveProperty("message", "internal server error");

    findAllSpy.mockRestore();
  });

  test("GET /recipe/:id - Fetch recipe by id - success", async () => {
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
  });

  test("GET /recipe/:id - Fetch recipe by id - fail", async () => {
    const findByIdSpy = jest
      .spyOn(RecipeModel, "findById")
      .mockImplementation(() => {
        throw new Error("Database error");
      });

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
    expect(status).toBe(500);
    expect(body).toHaveProperty("message", "internal server error");

    findByIdSpy.mockRestore();
  });

  test("POST /recipe - Create recipe - fail due to create error", async () => {
    const createSpy = jest
      .spyOn(RecipeModel, "create")
      .mockImplementation(() => {
        throw new Error("Database error");
      });

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
    const { body, status } = response;
    expect(status).toBe(500);
    expect(body).toHaveProperty("message", "internal server error");

    createSpy.mockRestore();
  });

  test("POST /recipe - Create recipe - fail due to addImgUrl error", async () => {
    const addImgUrlSpy = jest
      .spyOn(RecipeModel, "addImgUrl")
      .mockImplementation(() => {
        throw new Error("Database error");
      });

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
    const { body, status } = response;
    expect(status).toBe(500);
    expect(body).toHaveProperty("message", "internal server error");

    addImgUrlSpy.mockRestore();
  });
});
