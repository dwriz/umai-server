const request = require("supertest");
const { test, expect, describe, afterAll } = require("@jest/globals");
const { app } = require("../app.js");
const { DB } = require("../config/mongodb");

describe("User Authentication", () => {
  afterAll(async () => {
    const collection = DB.collection("users");
    await collection.deleteOne({ email: "testuser@example.com" });
  });

  test("Register - success", async () => {
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

  test("Register - fail (user already registered)", async () => {
    const response = await request(app)
      .post("/register")
      .field("fullname", "Test User")
      .field("username", "testuser")
      .field("email", "testuser@example.com")
      .field("password", "password")
      .attach("profileImg", "images/test-image.jpeg");
    const { body, status } = response;
    expect(status).toBe(409);
    expect(body).toHaveProperty("message", "user already registered");
  });

  test("Register - fail (missing fullname)", async () => {
    const response = await request(app)
      .post("/register")
      .field("username", "testuser")
      .field("email", "testuser@example.com")
      .field("password", "password")
      .attach("profileImg", "images/test-image.jpeg");
    const { body, status } = response;
    expect(status).toBe(400);
    expect(body).toHaveProperty("message", "fullname is required");
  });

  test("Register - fail (missing username)", async () => {
    const response = await request(app)
      .post("/register")
      .field("fullname", "Test User")
      .field("email", "testuser@example.com")
      .field("password", "password")
      .attach("profileImg", "images/test-image.jpeg");
    const { body, status } = response;
    expect(status).toBe(400);
    expect(body).toHaveProperty("message", "username is required");
  });

  test("Register - fail (missing email)", async () => {
    const response = await request(app)
      .post("/register")
      .field("fullname", "Test User")
      .field("username", "testuser")
      .field("password", "password")
      .attach("profileImg", "images/test-image.jpeg");
    const { body, status } = response;
    expect(status).toBe(400);
    expect(body).toHaveProperty("message", "email is required");
  });

  test("Register - fail (missing password)", async () => {
    const response = await request(app)
      .post("/register")
      .field("fullname", "Test User")
      .field("username", "testuser")
      .field("email", "testuser@example.com")
      .attach("profileImg", "images/test-image.jpeg");
    const { body, status } = response;
    expect(status).toBe(400);
    expect(body).toHaveProperty("message", "password is required");
  });

  test("Register - fail (invalid password length)", async () => {
    const response = await request(app)
      .post("/register")
      .field("fullname", "Test User")
      .field("username", "testuser")
      .field("email", "testuser@example.com")
      .field("password", "pass")
      .attach("profileImg", "images/test-image.jpeg");
    const { body, status } = response;
    expect(status).toBe(400);
    expect(body).toHaveProperty("message", "password length is invalid");
  });

  test("Register - fail (invalid email format)", async () => {
    const response = await request(app)
      .post("/register")
      .field("fullname", "Test User")
      .field("username", "testuser")
      .field("email", "invalidemail")
      .field("password", "password")
      .attach("profileImg", "images/test-image.jpeg");
    const { body, status } = response;
    expect(status).toBe(400);
    expect(body).toHaveProperty("message", "email format is invalid");
  });

  test("Login - success", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body).toHaveProperty("access_token");
    expect(body).toHaveProperty("id");
  });

  test("Login - fail (invalid password)", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "wrongpassword" });
    const { body, status } = response;
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "password invalid");
  });

  test("Login - fail (email not registered)", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "nonexistent@example.com", password: "password" });
    const { body, status } = response;
    expect(status).toBe(404);
    expect(body).toHaveProperty("message", "email not registered");
  });
});

describe("Recipe API", () => {
  afterAll(async () => {
    const userCollection = DB.collection("users");
    await userCollection.deleteOne({ email: "testuser@example.com" });
    const recipeCollection = DB.collection("recipes");
    await recipeCollection.deleteOne({ name: "Test Recipe" });
  });

  test("Create new account", async () => {
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

  test("Create recipe - success", async () => {
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

  test("Fetch all recipes - success", async () => {
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
});
