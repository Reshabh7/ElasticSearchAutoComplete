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
        type: String,
        es_indexed: true,
        es_type: 'String'
    },
    image: {
        type: String,
        es_indexed: true,
        es_type: 'String'
    },
    cookTime: {
        type: String,
        es_indexed: true,
        es_type: 'String'
    },
    recipeYield: {
        type: String,
        es_indexed: true,
        es_type: 'String'
    },
    prepTime: {
        type: String,
        es_indexed: true,
        es_type: 'String'
    },
    description: {
        type: String,
        es_indexed: true,
        es_type: 'String'
    }
});

const esClient = new elasticsearch.Client({ host: 'localhost:9200' });
recipeSchema.plugin(mongoosastic, { esClient: esClient });

let Recipe = mongoose.model("Recipes", recipeSchema);
let list = [];
Recipe.esSearch({
    "query": {
        "match": {
            "name": "Pasta"
        }
    }
}
    , function (err, results) {
        console.log(results)

        // results.hits.hits.map((each) => {
        //     list.push(each._source.name);
        // });
        // console.log("Fuzzy hits: " + results.hits.total, list);
        if (err) {
            console.log(err)
        }
    });
