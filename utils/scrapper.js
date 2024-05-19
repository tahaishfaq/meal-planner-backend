const axios = require('axios');
const cheerio = require('cheerio');

const keywordFilter = (text) => {
  const keywords = ['recipe', 'ingredients', 'method', 'preparation', 'steps'];
  return keywords.some(keyword => text.toLowerCase().includes(keyword));
};

const convertFractionToFloat = (fraction) => {
  const [numerator, denominator] = fraction.split('/');
  return parseFloat(numerator) / parseFloat(denominator);
};

const extractRecipeFromUrl = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extracting recipe title, description, and cooking time
    const title = $('h1').text();
    const shortDescription = $('meta[name="description"]').attr('content');
    const cookingTime = $('.cooking-time').text();
    const image = $('meta[property="og:image"]').attr('content') || $('img').first().attr('src');

    // Filtering out non-recipe related text using keyword filter
    const ingredients = [];
    const methodSteps = [];
    $('h2').each((index, element) => {
      const text = $(element).text();
      if (keywordFilter(text)) {
        if (text.toLowerCase().includes('ingredients')) {
          $(element).nextAll('ul').first().find('li').each((index, li) => {
            let ingredientText = $(li).text();
            // Convert fractional values to float
            ingredientText = ingredientText.replace(/½/g, convertFractionToFloat('1/2'))
              .replace(/⅓/g, convertFractionToFloat('1/3'))
              .replace(/⅔/g, convertFractionToFloat('2/3'))
              .replace(/¼/g, convertFractionToFloat('1/4'))
              .replace(/¾/g, convertFractionToFloat('3/4'))
              .replace(/⅕/g, convertFractionToFloat('1/5'))
              .replace(/⅖/g, convertFractionToFloat('2/5'))
              .replace(/⅗/g, convertFractionToFloat('3/5'))
              .replace(/⅘/g, convertFractionToFloat('4/5'))
              .replace(/⅙/g, convertFractionToFloat('1/6'))
              .replace(/⅚/g, convertFractionToFloat('5/6'))
              .replace(/⅐/g, convertFractionToFloat('1/7'))
              .replace(/⅛/g, convertFractionToFloat('1/8'))
              .replace(/⅜/g, convertFractionToFloat('3/8'))
              .replace(/⅝/g, convertFractionToFloat('5/8'))
              .replace(/⅞/g, convertFractionToFloat('7/8'))
              .replace(/⅑/g, convertFractionToFloat('1/9'))
              .replace(/⅒/g, convertFractionToFloat('1/10'));

            ingredients.push({ name: ingredientText });
          });
        } else if (text.toLowerCase().includes('method') || text.toLowerCase().includes('preparation') || text.toLowerCase().includes('steps')) {
          $(element).nextAll('ol, ul').first().find('li').each((index, li) => {
            methodSteps.push($(li).text());
          });
        }
      }
    });

    return { title, shortDescription, cookingTime, ingredients, methodSteps, image };
  } catch (error) {
    console.error('Error extracting recipe from URL:', error);
    throw error;
  }
};

module.exports = { extractRecipeFromUrl };
