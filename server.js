const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
var db = require('./config/db');
var cors = require('cors');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({origin: '*'}));

const port = 8080;

MongoClient.connect(db.url, (err, database) => {
	if (err) return console.log(err);

	db = database.db("tutormatcher");
	require('./App/Routes')(app, db);

	app.listen(port, () => {
		console.log('We are on port ' + port);
	});
})
