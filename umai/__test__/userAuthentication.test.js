const request = require("supertest");
const { test, expect, describe, afterAll } = require("@jest/globals");
const { app } = require("../app.js");
const { DB } = require("../config/mongodb");
const { ObjectId } = require("mongodb");
const { RecipeController } = require("../controllers/recipeController");
const { RecipeModel } = require("../models/recipeModel");

describe("User Authentication API", () => {
  afterAll(async () => {
    const collection = DB.collection("users");
    await collection.deleteMany({ email: "testuser@example.com" });
  });

  test("POST /register : Register - success", async () => {
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
  }, 10000);

  test("POST /register : Register - fail (user already registered)", async () => {
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

  test("POST /register : Register - fail (missing fullname)", async () => {
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

  test("POST /register : Register - fail (missing username)", async () => {
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

  test("POST /register : Register - fail (missing email)", async () => {
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

  test("POST /register : Register - fail (missing password)", async () => {
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

  test("POST /register : Register - fail (invalid password length)", async () => {
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

  test("POST /register : Register - fail (invalid email format)", async () => {
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

  test("POST /login : Login - success", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });
    const { body, status } = response;
    expect(status).toBe(200);
    expect(body).toHaveProperty("access_token");
    expect(body).toHaveProperty("id");
  });

  test("POST /login : Login - fail (invalid password)", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "wrongpassword" });
    const { body, status } = response;
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "password invalid");
  });

  test("POST /login : Login - fail (email not registered)", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "nonexistent@example.com", password: "password" });
    const { body, status } = response;
    expect(status).toBe(404);
    expect(body).toHaveProperty("message", "email not registered");
  });
});
