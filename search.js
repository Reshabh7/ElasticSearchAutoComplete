let express = require('express');
let bodyParser = require('body-parser');
let mongoosastic = require("mongoosastic");
let elasticsearch = require('elasticsearch');

let app = express();
app.use(express.static('static_files'));
app.use(bodyParser.json());

let mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/Restaurant', {useNewUrlParser: true});

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

const esClient = new elasticsearch.Client({
  host: 'localhost:9200'
});
recipeSchema.plugin(mongoosastic, {
  esClient: esClient
});

let Recipe = mongoose.model("Recipes", recipeSchema),
  stream = Recipe.synchronize()
  , count = 0;

stream.on('data', function (err, doc) {
  count++;
});
stream.on('close', function () {
  console.log('indexed ' + count + ' documents!');
});
stream.on('error', function (err) {
  console.log(err);
});

app.get("/syncData", function (req, res) {
  let stream = Recipe.synchronize()
    , count = 0;

  stream.on('data', function (err, doc) {
    count++;
  });
  stream.on('close', function () {
    console.log('indexed ' + count + ' documents!');
  });
  stream.on('error', function (err) {
    console.log(err);
  });
  res.send({result: "successfully indexed Mongo Data to ElasticSearch."});
});

function queryObject(val,partialQueryString,fuzzyQueryString, filter = []){
  // console.log(partialQueryString);
  // console.log(fuzzyQueryString);
  let queryString = (partialQueryString) ? partialQueryString : fuzzyQueryString;
  // console.log("queryString", queryString);
  return {
    "query": {
      "bool":
        {
          "must": {
            "query_string": {
              "query": `${queryString}`,
              "default_field": "name",
              "fuzziness": 1
            }
          },
          "should": [
            {
              "span_first": {
                "match": {
                  "span_term": {
                    "name": {"value": `${val}`}
                  }
                },
                "end": 1
              }
            },
            {
              "span_first": {
                "match": {
                  "span_term": {
                    "name": {"value": `${val}`}
                  }
                },
                "end": 2
              }
            },
            {
              "span_first": {
                "match": {
                  "span_term": {
                    "name": {"value": `${val}`}
                  }
                },
                "end": 3
              }
            }
          ],
          filter: filter
        }
    },
    "size": 100
  }
}

app.get("/search/:term", function (req, res) {
  let val = req.params.term;
  let list = [];
  Recipe.esSearch(
    queryObject(val,`*${val}*`), {hydrate: false}, function (err, results) {
      results.hits.hits.map((each) => {
        list.push(each._source.name);
      });
      console.log(results.hits.total);
      Recipe.esSearch(
        queryObject(val,undefined,`${val}~`), {hydrate: false}, function (err, results) {
          results.hits.hits.map((each) => {
            list.push(each._source.name);
          });
          console.log("Fuzzy hits: " + results.hits.total);
          res.send(list);
        });
    });
});

app.get("/filter/:term", function (req, res) {
  let terms = req.params.term.split("&");
  let val = terms[0];
  let options = terms.slice(1);
  let filter = [];
  options.map((each) => {
    filter.push({
      term: {
        ingredients: each
      }
    })
  });
  let list = [];
  Recipe.esSearch(
    queryObject(val,`*${val}*`,undefined,[
      {terms: {ingredients : options}},
    ]),
    {hydrate: false},
    function (err, results) {
      results.hits.hits.map((each) => {
        list.push(each._source.name);
      });
      console.log(results.hits.total);
      Recipe.esSearch(
        queryObject(val,undefined,`${val}~`,[
          {terms: {ingredients : options}},
        ]), {hydrate: false}, function (err, results) {
          results.hits.hits.map((each) => {
            list.push(each._source.name);
          });
          console.log("Fuzzy hits: " + results.hits.total);
          res.send(list);
        });
    });
});

app.listen(3000, () => {
  console.log(`Started on port 3000`);
});