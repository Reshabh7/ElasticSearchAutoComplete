let express = require('express');
let bodyParser = require('body-parser');
let mongoosastic = require("mongoosastic");
let elasticsearch = require('elasticsearch');

let app = express();
app.use(express.static('static_files'));
app.use(bodyParser.json());
let mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/Restaurant', { useNewUrlParser: true });

let Schema = mongoose.Schema;

let recipeSchema = new Schema({
    name: {
        type: String,
        es_indexed: true,
        es_type: 'text'
    },
    ingredients: {
        type: String,
        es_indexed: true,
        es_type: 'text'
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

const esClient = new elasticsearch.Client({ host: 'localhost:9200' });
recipeSchema.plugin(mongoosastic, { esClient: esClient });

let Recipe = mongoose.model("Recipes", recipeSchema);
let val = 'Ginger';
let list = [];
Recipe.esSearch({}
    , function (err, results) {
        results.hits.hits.map((each) => {
            list.push(each._source.name);
        });
        console.log("Fuzzy hits: " + results.hits.total, list);
        if (err) {
            console.log(err)
        }
    });