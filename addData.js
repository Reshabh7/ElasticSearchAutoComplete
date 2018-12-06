//this file is used to add data to mongodb database from recipes-data.json

let mongoose = require('mongoose');
let fs = require('fs');
let path = require('path');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/Restaurant');

const recipes = JSON.parse(fs.readFileSync(path.join(__dirname + '/recipes-data.json'), 'utf-8'));

let Recipe = mongoose.model('Recipes', {
  name: {
    type: String
  },
  ingredients: {
    type: String
  },
  url: {
    type: String
  },
  image: {
    type: String
  },
  cookTime: {
    type: String
  },
  recipeYield: {
    type: String
  },
  prepTime: {
    type: String
  },
  description: {
    type: String
  }
});

async function loadRecipe() {
  try {
    await Recipe.insertMany(recipes);
    console.log('Done!');
    process.exit();
  } catch(e) {
    console.log(e);
    process.exit();
  }
}

loadRecipe();