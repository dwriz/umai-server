const request = require("supertest");
const { test, expect, describe, afterAll } = require("@jest/globals");
const { app } = require("../app.js");
const { DB } = require("../config/mongodb");
const { ObjectId } = require("mongodb");
const { RecipeController } = require("../controllers/recipeController");
const { RecipeModel } = require("../models/recipeModel");

describe("User Modifier API", () => {
  afterAll(async () => {
    const userCollection = DB.collection("users");
    await userCollection.deleteOne({ email: "testuser@example.com" });
    await userCollection.deleteOne({ email: "testuser2@example.com" });
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

  test("POST /register : Create another new account", async () => {
    const response = await request(app)
      .post("/register")
      .field("fullname", "Test User 2")
      .field("username", "testuser2")
      .field("email", "testuser2@example.com")
      .field("password", "password")
      .attach("profileImg", "images/test-image.jpeg");
    const { body, status } = response;
    expect(status).toBe(201);
    expect(body).toHaveProperty("message", "user created successfully");
  });

  test("POST /finished-recipe : Increment finish recipe count", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const response = await request(app)
      .post("/finished-recipe")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Successfully Increase Finished Recipe"
    );
  });

  test("GET /ranking : Fetch users ranking", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const response = await request(app)
      .get("/ranking")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`);
    const { body, status } = response;
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    const user = body[0];
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("fullname");
    expect(user).toHaveProperty("username");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("finishedRecipeCount");
    expect(user).toHaveProperty("profileImgUrl");
  });

  test("GET /self : Fetch self profile", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const response = await request(app)
      .get("/self")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`);
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body).toHaveProperty("_id");
    expect(body).toHaveProperty("fullname");
    expect(body).toHaveProperty("username");
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("finishedRecipeCount");
    expect(body).toHaveProperty("profileImgUrl");
  });

  test("GET /user/:id : Fetch user profile by id", async () => {
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
    const userId = user._id.toString();
    const response = await request(app)
      .get(`/user/${userId}`)
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`);
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body).toHaveProperty("_id");
    expect(body).toHaveProperty("fullname");
    expect(body).toHaveProperty("username");
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("finishedRecipeCount");
    expect(body).toHaveProperty("profileImgUrl");
  });

  test("GET /user/:id : Fetch user profile by id - fail (invalid user ID)", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const response = await request(app)
      .get(`/user/666e878449ca88422793e428`)
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`);
    const { body, status } = response;
    expect(status).toBe(404);
    expect(body).toHaveProperty("message", "user not found");
  });

  test("PATCH /topup : Add balance to user account", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const response = await request(app)
      .patch("/topup")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`)
      .send({ amount: 100 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "topup success");
  });

  test("POST /donate : Donate balance to another user", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const userCollection = DB.collection("users");
    const targetUser = await userCollection.findOne({
      email: "testuser2@example.com",
    });
    const response = await request(app)
      .post("/donate")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`)
      .send({ targetUserId: targetUser._id.toString(), amount: 50 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "donation success");
  });

  test("POST /donate : Donate balance to another user - fail (no amount)", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const userCollection = DB.collection("users");
    const targetUser = await userCollection.findOne({
      email: "testuser2@example.com",
    });
    const response = await request(app)
      .post("/donate")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`)
      .send({ targetUserId: targetUser._id.toString() });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "amount is required");
  });

  test("POST /create-payment-intent : Create payment intent", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("access_token");
    expect(loginResponse.body).toHaveProperty("id");
    const response = await request(app)
      .post("/create-payment-intent")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`)
      .send({ amount: 100 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("clientSecret");
  });
});
