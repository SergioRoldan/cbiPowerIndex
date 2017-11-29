var express = require('express');
var path = require('path');
var _ = require('underscore');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();
var PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use(express.static(__dirname + '/public'));


app.post('/linkedIn', function(req, res){

  var body = _.pick(req.body, "user", "password");

  if(!_.isString(body.user) || !_.isString(body.password) || body.user.trim().length === 0 || body.password.trim().length === 0) {
    return res.status(401);
  }
  res.json({
    name: body.user,
    password: body.password
  });
});

app.get('/researchGate', function(req, res){

  console.log("entro");
  var options = {
    proxy: 'http://mzzjp7wp88yvnb:OVWIdAQYvs3-YmLH7jQa6Z75zQ@us-east-static-04.quotaguard.com:9293',
    url: 'https://www.researchgate.net/profile/Ramon_Bragos',
    headers: {
        'User-Agent': 'node.js'
    }
  };

  request(options, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
  });

  /*var str = '';


  var callback = function(response) {

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      console.log("Succes: "+ str);
      res.send(str);
    });

    response.on("error", function(err) {
      console.log("Error: " + err.message);
      res.status(404).send();
    });
  };

  request(options, callback).end();*/


});




app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!!!');
});
