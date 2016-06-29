/**
 * name: RedCapAPI
 * Created by jbalsamo on 5/14/16.
 */

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var config = require('config-json');
var request = require('request');
var debug = false;

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
    console.log('REDCap API Loaded.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: 'No request made.'});
});

// more routes for our API will happen here
router.get('/booya/:username', function (req, res) {
    res.json({message: 'Test route! ' + req.params.username + ' is awesome!'});
});

router.get('/:content/:forms', function (req, res) {
    var rdata ={};

    if (debug) {
        console.log("In Export");
    }

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
    if (typeof req.params.forms !== 'undefined') {
        options.form.forms = req.params.forms;
    }
    if(req.params.content == "records") {
        options.form.type = "flat";
        options.form.rawOrLabel =  "raw";
        options.form.rawOrLabelHeaders =  "raw";
        options.form.exportCheckboxLabel =  "false";
        options.form.exportSurveyFields =  "false";
        options.form.exportDataAccessGroups =  "false";
    }
    if(debug) {
        console.log(options);
    }
    request(options,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if(debug) {
                    console.log("Successfully read data");
                }
                res.json(JSON.parse(body));
            } else {
                console.log(response.statusCode)
            }
        }
    );
});

router.get('/:content', function (req, res) {
    if (debug) {
        console.log("In Export");
    }
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
    if(req.params.content == "records") {
        options.form.type = "flat";
        options.form.rawOrLabel =  "raw";
        options.form.rawOrLabelHeaders =  "raw";
        options.form.exportCheckboxLabel =  "false";
        options.form.exportSurveyFields =  "false";
        options.form.exportDataAccessGroups =  "false";
    }
    if (debug) {
        console.log("Content only request");
    }
    request(options,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (debug) {
                    console.log("Successfully read data");
                }
                res.json(JSON.parse(body));
            } else {
                console.log(response.statusCode)
            }
        }
    );
});

router.post('/:content', function (req,res) {
    data = [];
    data.push(req.body.data);
    var options = {
        method: 'POST',
        url: config.get("redcap", "url"),
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form: {
            token: config.get("redcap", "token"),
            content: req.params.content,
            format: 'json',
            returnFormat: 'json',
            overwriteBehavior: 'normal',
            returnContent: 'count',
            data: JSON.stringify(data)
        }
    };
    if (req.body.action == "insert") {
        request(options,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (debug) {
                        console.log("Successfully read data");
                    }
                    console.log(body);
                    res.json(JSON.parse(body));
                } else {
                    res.json({ error: response.statusCode, body: body});
                    console.log(body)
                }
            }
        );
    }
})


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

