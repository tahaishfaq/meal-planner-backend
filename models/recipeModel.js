

const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    
  },
  unit: {
    type: String,
    
  },
  pricePerUnit: {
    type: Number,
    
  },
});

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  shortDescription: String,
  cookingTime: String,
  ingredients: [ingredientSchema],
  methodSteps: [{
    type: String,
    required: true,
  }],
  calories: Number,
  carbohydrates: Number,
  fats: Number,
  proteins: Number,
  fibers: Number,
  totalPrice: Number,
  tags: [String],
  image: String,
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
