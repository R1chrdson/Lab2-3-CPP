const express = require('express');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const MongoClient = mongodb.MongoClient;
//const ObjectId = mongodb.ObjectId;

const app = express();
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/db';

let mongo;
let map = L.map('map');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname ));
app.set('view engine', 'ejs');

MongoClient
    .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(function(client) {
        mongo = client.db();
        console.log('MongoDB started')
    });


app.get('/', function(_req, res) {
    map.setView([51.505, -0.09], 13);
    res.render('index', {
        title: "Tourist helper"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log(`App started on http://localhost:${PORT}`);
});

app.listen();