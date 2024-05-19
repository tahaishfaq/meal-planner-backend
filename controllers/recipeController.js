// controllers/recipeController.js

const axios = require("axios");
const Recipe = require("../models/recipeModel");
const cheerio = require("cheerio");
const { extractRecipeFromUrl } = require("../utils/scrapper");

// Helper function to calculate nutritional information for the entire recipe using Edamam API
const calculateNutrition = async (ingredients) => {
  try {
    const apiEndpoint = "https://api.edamam.com/api/nutrition-details";
    const appId = process.env.EDAMAM_APP_ID;
    const appKey = process.env.EDAMAM_APP_KEY;

    const requestBody = {
      ingr: ingredients.map(
        (ingredient) =>
          `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
      ),
    };

    const response = await axios.post(
      `${apiEndpoint}?app_id=${appId}&app_key=${appKey}`,
      requestBody
    );
    const data = response.data;

    const { calories, totalNutrients } = data;
    const proteins = totalNutrients.PROCNT ? totalNutrients.PROCNT.quantity : 0;
    const carbohydrates = totalNutrients.CHOCDF
      ? totalNutrients.CHOCDF.quantity
      : 0;
    const fats = totalNutrients.FAT ? totalNutrients.FAT.quantity : 0;
    const fibers = totalNutrients.FIBTG ? totalNutrients.FIBTG.quantity : 0;

    return {
      calories: calories || 0,
      proteins,
      carbohydrates,
      fats,
      fibers,
    };
  } catch (error) {
    console.error("Error calculating nutrition with Edamam API:", error);
    return {
      calories: 0,
      proteins: 0,
      carbohydrates: 0,
      fats: 0,
      fibers: 0,
    };
  }
};

// Helper function to calculate the total price of the recipe
const calculatePrice = (ingredients) => {
  let totalPrice = 0;
  ingredients.forEach((ingredient) => {
    totalPrice += ingredient.quantity * ingredient.pricePerUnit;
  });
  return totalPrice || 0;
};

const calculatePricePerUnit = (nutritionalInfo) => {
  console.log(nutritionalInfo);
  const calories = nutritionalInfo?.calories;
  const protein = nutritionalInfo?.proteins;
  const fat = nutritionalInfo.fats;
  const carbohydrates = nutritionalInfo?.carbohydrates;
  const fibers = nutritionalInfo?.fibers;

  const pricePerCalorie = 0.001; // $ per calorie
  const pricePerGramProtein = 0.02; // $ per gram of protein
  const pricePerGramFat = 0.01;
  const pricePerCarbohydrates = 0.01;
  const pricePerFiber = 0.01;
  // $ per gram of fat

  const price =
    calories * pricePerCalorie +
    protein * pricePerGramProtein +
    fat * pricePerGramFat +
    fibers * pricePerFiber +
    carbohydrates * pricePerCarbohydrates;
  return price;
};

// Helper function to add tags based on nutritional information
const addNutritionalTags = (nutrition) => {
  const tags = [];
  if (nutrition.proteins > 20) tags.push("high protein");
  if (nutrition.carbohydrates > 50) tags.push("high carbohydrates");
  if (nutrition.fats > 30) tags.push("high fats");
  if (nutrition.fibers > 15) tags.push("high fiber");
  return tags;
};

const addRecipe = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      cookingTime,
      ingredients,
      methodSteps,
      tags,
    } = req.body;

    // Calculate nutritional information for the entire recipe
    const nutrition = await calculateNutrition(ingredients);
    const { calories, carbohydrates, fats, proteins, fibers } = nutrition;

    // Calculate total price for the entire recipe
    const totalPrice = calculatePricePerUnit(nutrition);

    const nutritionalTags = addNutritionalTags(nutrition);
    const allTags = [...nutritionalTags];

    // Save recipe to database
    const recipe = new Recipe({
      title,
      shortDescription,
      cookingTime,
      ingredients,
      methodSteps,
      calories,
      carbohydrates,
      fats,
      proteins,
      fibers,
      totalPrice,
      tags: allTags,
    });
    await recipe.save();

    res.json({ message: "Recipe added successfully", recipe });
  } catch (error) {
    console.error("Error adding recipe:", error);
    res.status(500).json({ error: "Failed to add recipe" });
  }
};

const scrapRecipe = async (req, res) => {
  try {
    const { url } = req.body;
    const { title, shortDescription, cookingTime, ingredients, methodSteps, image } =
      await extractRecipeFromUrl(url);

    const nutrition = await calculateNutrition(ingredients);
    const { calories, carbohydrates, fats, proteins, fibers } = nutrition;

    const totalPrice = calculatePricePerUnit(nutrition);

    const nutritionalTags = addNutritionalTags(nutrition);
    const allTags = [...nutritionalTags];

    const recipe = new Recipe({
      title,
      shortDescription,
      cookingTime,
      ingredients,
      methodSteps,
        calories,
        carbohydrates,
        fats,
        proteins,
        fibers,
        totalPrice,
        tags: allTags,
        image
    });
    await recipe.save();

    res.json({ message: "Recipe added successfully", recipe });
  } catch (error) {
    console.error("Error scraping recipe:", error);
    res.status(500).json({ error: "Failed to scrap recipe" });
  }
};


const getRecipeById = async (req, res) => {
    const { id } = req.params;
    try {
      const recipe = await Recipe.findById(id);
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      res.status(200).json(recipe);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching recipe' });
    }
  };

  const editRecipe = async (req, res) => {
    const { id } = req.params;
    const { title, shortDescription, cookingTime, ingredients, methodSteps, tags } = req.body;
  
    try {
    //   // Calculate nutritional information for the entire recipe
    //   const nutrition = await calculateNutrition(ingredients);
    //   const { calories, carbohydrates, fats, proteins, fibers } = nutrition;
  
    //   // Calculate total price for the entire recipe
    //   const totalPrice = calculatePricePerUnit(nutrition);
  
    //   const nutritionalTags = addNutritionalTags(nutrition);
    //   const allTags = [...tags, ...nutritionalTags];
  
      // Update recipe in the database
      const recipe = await Recipe.findByIdAndUpdate(
        id,
        {
          title,
          shortDescription,
          cookingTime,
          ingredients,
          methodSteps,
        //   calories,
        //   carbohydrates,
        //   fats,
        //   proteins,
        //   fibers,
        //   totalPrice,
          tags,
        },
        { new: true }
      );
  
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
  
      res.json({ message: 'Recipe updated successfully', recipe });
    } catch (error) {
      console.error('Error updating recipe:', error);
      res.status(500).json({ error: 'Failed to update recipe' });
    }
  };

  const deleteAllRecipes = async (req, res) => {
    try {
      await Recipe.deleteMany({});
      res.json({ message: "All recipes deleted successfully" });
    } catch (error) {
      console.error("Error deleting all recipes:", error);
      res.status(500).json({ error: "Failed to delete all recipes" });
    }
  };

  const getAllRecipes = async (req, res) => {
    try {
      const recipes = await Recipe.find({});
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching all recipes:", error);
      res.status(500).json({ error: "Failed to fetch all recipes" });
    }
  };
  

  
  
  

module.exports = {
  addRecipe,
  scrapRecipe,
  getRecipeById,
  editRecipe,
  deleteAllRecipes,
  getAllRecipes
};
