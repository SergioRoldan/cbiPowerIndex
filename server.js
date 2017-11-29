var express = require('express');
var path = require('path');
var _ = require('underscore');
var bodyParser = require('body-parser');
var request = require('request');
var fixieRequest = request.defaults({'proxy': process.env.FIXIE_URL});

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


  fixieRequest('https://www.researchgate.net/profile/Ramon_Bragos', (err, res, body) => {
    console.log(res.headers);
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
