/**
 * Created by jbalsamo on 5/14/16.
 */
// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var config = require('config-json');
var request = require('request');


// Configure API
config.load('config.json');
token = config.get('redcap', 'token');
url = config.get('redcap', 'url');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});

// more routes for our API will happen here
router.get('/booya/:username', function (req, res) {
    res.json({message: 'Booya! ' + req.params.username + ' is awesome!'});
});

router.get('/export/:content', function (req, res) {
    console.log("In Export");
    var options = {
        method: 'POST',
        url: config.get("redcap", "url"),
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form: {
            token: config.get("redcap", "token"),
            content: req.params.content,
            format: 'json',
            returnFormat: 'json'
        }
    };
    console.log("In Export: ready to send request");
    request(options,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("Successfully read data");
                res.json(JSON.parse(body));
            } else {
                console.log(response.statusCode)
            }
        }
    );
});

router.get('/export/:content/:form', function (req, res) {
    console.log("In Export");
    var options = {
        method: 'POST',
        url: config.get("redcap", "url"),
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form: {
            token: config.get("redcap", "token"),
            content: req.params.content,
            format: 'json',
            returnFormat: 'json'
        }
    };
    console.log("In Export: ready to send request");
    request(options,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("Successfully read data");
                res.json(JSON.parse(body));
            } else {
                console.log(response.statusCode)
            }
        }
    );
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
