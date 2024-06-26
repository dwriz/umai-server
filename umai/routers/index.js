const express = require("express");
const { UserController } = require("../controllers/userController");
const { RecipeController } = require("../controllers/recipeController");
const { PostController } = require("../controllers/postController");
const { authentication } = require("../middlewares/authentication");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/register", upload.single("profileImg"), UserController.register);

router.post("/login", UserController.login);

router.use(authentication);

router.get("/recipes", RecipeController.getAllRecipe);

router.post(
  "/recipe",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "instruction_images" },
  ]),
  RecipeController.createRecipe
);

router.get("/recipe/:id", RecipeController.getRecipeById);

router.post("/post", upload.single("postImg"), PostController.createPost);

router.get("/posts", PostController.getAllPost);

router.post("/finished-recipe", UserController.increaseFinishedRecipeCount);

router.get("/ranking", UserController.getUsersRanking);

router.get("/self", UserController.getSelfProfile);

router.post("/create-payment-intent", UserController.createPaymentIntent);

router.patch("/topup", UserController.addBalance);

router.get("/user/:id", UserController.getProfile);

router.post("/donate", UserController.donateBalance);

module.exports = router;
