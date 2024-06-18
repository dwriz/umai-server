const request = require("supertest");
const { test, expect, describe, afterAll } = require("@jest/globals");
const { app } = require("../app.js");
const { DB } = require("../config/mongodb");
const { ObjectId } = require("mongodb");

describe("User Authentication API", () => {
  afterAll(async () => {
    const collection = DB.collection("users");
    await collection.deleteOne({ email: "testuser@example.com" });
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
  });

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
});

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
    await recipeCollection.deleteOne({ name: "Test Recipe" });
    await userCollection.deleteOne({ email: "testuser@example.com" });
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
});

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
