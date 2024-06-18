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

  test("Login - success", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "password" });

    const { body, status } = response;

    expect(status).toBe(200);
    expect(body).toHaveProperty("access_token");
    expect(body).toHaveProperty("id");
  });

  test("Login - fail (incorrect password)", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "testuser@example.com", password: "wrongpassword" });

    const { body, status } = response;

    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "password invalid");
  });
});
