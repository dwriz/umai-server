const express = require("express");
const { UserController } = require("../controllers/userController");
const { RecipeController } = require("../controllers/recipeController");
const { authentication } = require("../middlewares/authentication");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/register", UserController.register);
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

module.exports = router;
