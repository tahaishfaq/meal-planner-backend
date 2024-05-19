const ingredientString = "salt and freshly ground black pepper";

// Define a regular expression pattern to match quantity, unit, and name
const pattern = /([\d.\/]+)?\s*([a-zA-Z]+)?\s*(.+)/;

// Extracting quantity, unit, and name using regex
const [name, quantityString, unit ] = ingredientString.match(pattern);

// Setting default quantity to 1 tsp if none specified
const quantity = quantityString ? parseFloat(quantityString) : 1;
const chosenUnit = unit ? unit.trim() : 'tsp';

// Forming the result object
const result = {
    name: name.trim(),
    quantity: quantity,
    unit: chosenUnit
};

console.log(result);
