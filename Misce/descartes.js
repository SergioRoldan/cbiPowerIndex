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

  var name = req.query.q;
  //function that returns all the matches following the regular expression myRegEx inside the string myString
  function getMatches(string, regex, index) {
    index || (index = 1); // default to the first capturing group
    var matches = [];
    var match;
    while (match = regex.exec(string)) {
      matches.push(match[index]);
    }
    return matches;
  }

  //vars to get the matches
  var myString;
  var myRegEx = /(?:">)(\d*|\d*,\d*)(?:<\/div><div class="nova-e-text nova-e-text--size-m nova-e-text--family-sans-serif nova-e-text--spacing-none nova-e-text--color-inherit")/g;


  //Get Reads, ResearchItems & Citations callback
  function getRRC(error, response, body) {
    //Check for timeouts during tunneling
    if(typeof response === 'undefined') {
      getProxy.getNewProxy(request, getProxyCb);
      console.log("Proxy tunneling timeout");
    } else {
      //Check for tooManyRequests header & get another proxy
      if(response.statusCode === 429) {
        console.log("Status 429");
        getProxy.getNewProxy(request, getProxyCb);
      } else {
        myString = body;
        var matches = getMatches(myString, myRegEx, 1);
        console.log(matches);
        //Object to store the result
        var json = {
          ResearchItems: matches[0],
          Reads: matches[1],
          Citations: matches[2]
        };
        console.log(+ new Date() + json);
        res.json(json);
      }
    }
  }

  //Check the proxy callback
  function checkProxyCb(error, response, body) {
    //Check for timeouts during tunneling
    if(typeof response === 'undefined') {
      console.log("Proxy tunneling timeout");
      getProxy.getNewProxy(request, callback);
    } else {
      console.log('Got proxy');

      let options = {
        url: 'https://www.researchgate.net/profile/'+name,
        proxy: proxy
      };

      setTimeout(function() {
            console.log("   >Don't make RG angry<");
      }, 200);

      request(options, getRRC);
    }
  };

  //Get a proxy callback
  function getProxyCb(error, response, body){
    //Check if the proxy is http
    if (JSON.parse(body).curl.split("//")[0].includes("http")) {
      proxy = JSON.parse(body).curl;
      console.log("Http proxy: " + proxy);
      getProxy.checkProxy(request, checkProxyCb);
    } else {
      console.log("Not http proxy");
      getProxy.getNewProxy(request, getProxyCb);
    }
  };

  //Get a proxy initial request
  getProxy.getNewProxy(request, getProxyCb);


});



$.get(local+"researchGate?q="+rschr, function(data, status) {
  console.log("Status: " + status);
  console.log(data);
  console.log("Data: " + JSON.stringify(data));

  $("#results").append("<p>" + JSON.stringify(data) + "</p>" );
});
