const express = require("express");
const { UserController } = require("../controllers/userController");
const { RecipeController } = require("../controllers/recipeController");
const { authentication } = require("../middlewares/authentication");
const router = express.Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.use(authentication);
router.get("/recipe", RecipeController.getAllRecipes);
router.get("/recipe/:id", RecipeController.getRecipeById);

module.exports = router;
