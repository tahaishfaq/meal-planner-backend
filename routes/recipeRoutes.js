// routes/recipeRoutes.js

const express = require('express');
const { addRecipe, scrapRecipe, getRecipeById, editRecipe, deleteAllRecipes, getAllRecipes } = require('../controllers/recipeController');

const router = express.Router();

router.post('/add', addRecipe);
router.post('/scrap', scrapRecipe);
router.get('/get-recipe/:id', getRecipeById);
router.put('/edit-recipe/:id', editRecipe);
router.delete('/deleteAll', deleteAllRecipes);
router.get('/getAll', getAllRecipes);


module.exports = router;
