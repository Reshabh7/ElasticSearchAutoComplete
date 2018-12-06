# ElasticSearchAutoComplete
This is a Simple autocomplete feature implementation of elasticsearch with mongodb as main database. I have used mongoostatic to index mongodb data to elasticsearch.
## Initial Setup
1. Make sure mongodb is running at "localhost:27017".
2. Make sure elasticsearch is running at "localhost:9200"
3. Populate dummy data in mongodb by running "node addData.js" command. This will add 1045 recipes to the database.
## Running
start the server by running "node search.js" command.
Go to "localhost:3000/index.html" in the browser to test.
