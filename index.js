const express = require('express');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const app = express();
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/db';

const Google_API = 'AIzaSyAh6Ff1ROcneLDTtNCcEkAeI3gaCxYoXiQ';
let mongo;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('.'));
app.set('view engine', 'ejs');

MongoClient
    .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(function(client) {
        mongo = client.db();
        console.log('MongoDB started')
    });

app.get('/', function(_req, res) {
    mongo
        .collection('places').find().toArray()
        .then(function (places) {
            res.render('index', {
                title: "Tourist helper",
                places
            });
        })
});

app.post('/add', async function (_req, res) {
        latlng = [_req.body.lat, _req.body.lng];
        place_name = [];
        try {
            place = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng[0]},${latlng[1]}&sensor=true&key=${Google_API}`)
                .then(response => {return response.json()})
                .then(data => {
                    console.log('STATUS:', data.status);
                    if(!(data.status === 'ZERO_RESULTS' || data.status === 'INVALID_REQUEST')) {
                        const components = data.results[0].address_components;
                        components.forEach(component => {
                            if (!['street_number', 'route', 'postal_code'].some(el => component.types.includes(el)))
                                place_name.push(component.short_name);
                        });
                    }
                    else {
                        console.log(data);
                        throw 'invalid';
                    }
                });
        } catch (error){
            res.send(null);
            console.log(`There is no address name: ${latlng}`);
            console.error(error);
        }
        if(place_name != '') {
            console.log('Addition:', place_name);
            mongo
                .collection('places')
                .insertOne({place: place_name.join(' '), latlng})
                .then(function (place) {
                    res.send(place.ops[0]);
                });
        }
});

app.post('/delete', function (req, res) {
    console.log('Deletion:', req.body.id);
    mongo
        .collection('places')
        .deleteOne({ _id: ObjectId(req.body.id)});
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log(`App started on http://localhost:${PORT}`);
});

app.listen();
