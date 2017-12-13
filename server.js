var express = require('express');
var PORT = process.env.PORT || 55555;
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//node modules
var request = require('request');
var getProxy = require('./getProxy.js')(proxy);
var matchHandler = require('./match.js')();

var proxy = [];
var link = [];
var url = [];
var searchName = [];
var retry = [];

//request callback
function getRG(error, response, body) {
  //setTimeout( function() {
    if(io.sockets.connected[this.id] != undefined) {
      io.sockets.connected[this.id].emit('state', {
        text: 'Retrieving data. One of our trained hedgehogs is working on it. Please wait'
      });
    }
  //}.bind({id: this.id}), 0 );

  if(typeof response === 'undefined') {
    setTimeout( function() {
      getProxy.getNewProxy(request, getProxyCb.bind({id: this.id}));
    }.bind({id: this.id}), 0 );
    console.log("Proxy tunneling timeout");
  } else {
    if(response.statusCode === 429) {
      console.log("Status 429");
      setTimeout( function() {
        getProxy.getNewProxy(request, getProxyCb.bind({id: this.id}));
      }.bind({id: this.id}), 0 );
    } else {
      if(io.sockets.connected[this.id] != undefined) {
        io.sockets.connected[this.id].emit('state', {
          text: 'Processing data'
        });
      }
      link[this.id] = matchHandler.getMatch(body, matchHandler.linkRegEx(), 1);
      if(link[this.id] === 'undefined') {
        if(io.sockets.connected[this.id] != undefined) {
          io.sockets.connected[this.id].emit('state', {
            text: 'Not researcher matched with this name, please try to change it'
          });
        }
        return;
      }
      console.log("Link "+ link[this.id]);
      if(link[this.id] == undefined) {
        if(io.sockets.connected[this.id] != undefined) {
          io.sockets.connected[this.id].emit('state', {
            text: 'Error researcher not found'
          });
        }
        return;
      }
      url[this.id] = 'https://www.researchgate.net/profile/'+link[this.id];
      //console.log(url[this.id]);
      //console.log(link);

      let newOptions = {
        url: url[this.id],
        proxy: proxy[this.id]
      };

      request(newOptions, function(error, response, body) {

        if(typeof response === 'undefined') {
          getProxy.getNewProxy(request, getProxyCb.bind({id: this.id}));
          console.log("Proxy tunneling timeout");
        } else {
          if(response.statusCode === 429) {
            console.log("Status 429");
            getProxy.getNewProxy(request, getProxyCb.bind({id: this.id}));
          } else {

            let results = {
              ResearchExperience: [],
              Skills: [],
              CurrentResearch: [],
              Items: []
            };



            let photo = matchHandler.getMatch(body, matchHandler.photoRegEx(), 1);
            if (typeof photo !== 'undefined') {
              results.link = photo;
            }

            let name = matchHandler.getMatch(body, matchHandler.nameRegEx(), 1);
            if (typeof name !== 'undefined') {
              results.Name = name;
            }

            let type = matchHandler.getMatches(body, matchHandler.typeRegEx(), 1);
            if (typeof type !== 'undefined') {
                for(var i=0; i<type.length; i++) {
                  results.Items[i] = {
                    Type: type[i],
                    Name: ''
                  };
                }
            }

            let contractName = link[this.id].replace(new RegExp('_','g')," ");
            results.contractName = contractName;

            let items = matchHandler.getMatches(body, matchHandler.itemsRegEx(), 1);
            if (typeof items !== 'undefined') {
              let links = [];
              for(let i=0; i<items.length; i++) {
                let splitted = items[i].split("\" itemProp=\"mainEntityOfPage\">");
                results.Items[i].Name = splitted[1];
                links.push(splitted[0]);
              }
              //--//
              for(var i=0; i<links.length; i++) {
                let newUrl = 'https://www.researchgate.net/publication/' + links[i];
                let newOptions = {
                  url: newUrl,
                  proxy: proxy[this.id]
                };


                setTimeout(function() {
                  request(newOptions, function(error, response, body) {

                    if(typeof response === 'undefined') {
                      console.log("Proxy tunneling timeout");
                    } else {
                      //Check for tooManyRequests header & get another proxy
                      if(response.statusCode === 429) {
                        console.log("Status 429");
                      } else {
                        let namePaper = /(?:<h1 class="publication-title" itemProp="headline">)(.{1,250})(?:<\/h1><div class="publication-meta">)/g;
                        let name = matchHandler.getMatch(body, namePaper, 1);
                        console.log("Name: " + name);
                        var rcPaper = /(?:<span class="publication-resource-link-amount">)(\d*)(?:<\/span>)/g;
                        let rc = matchHandler.getMatches(body, rcPaper, 1);
                        console.log("Citations: " + rc[0] + " References: "+ rc[1]);
                        let paper = {
                          name: name,
                          citations: rc[0],
                          references: rc[1]
                        }
                        if(io.sockets.connected[this.id] != undefined) {
                          io.sockets.connected[this.id].emit("paper", paper);
                        }
                      }
                    }

                  }.bind({id: this.id}));
                }.bind({id: this.id}), 50*i);
              }
              //--//
            }

            let insDep = matchHandler.getMatches(body, matchHandler.institutionRegEx(), 1);
            if(typeof insDep[0] !== 'undefined') {
              let splitted = insDep[0].split("\"><b>");
              results.Institution = splitted[1];
              let toGetDepartment = splitted[0];
              let departmentRegEx = new RegExp('(?:<a class="nova-e-link nova-e-link--color-inherit nova-e-link--theme-silent" href="institution\/'+ toGetDepartment+'\/)(.{1,150})(?:<\/a><\/div>)', 'g');

              let department = matchHandler.getMatches(body, departmentRegEx, 1);
              if(typeof department[0] !== 'undefined' && department[0] != undefined) {
                results.Department = department[0].split("\">")[1];
              }
            }

            let rrc = matchHandler.getMatches(body, matchHandler.rrcRegEx(), 1);
            if (typeof rrc !== 'undefined') {
              results.ResearchItemNumber = rrc[0];
              results.ReadsNumber = rrc[1];
              results.CitationsNumber = rrc[2];
            }

            let rg = matchHandler.getMatch(body, matchHandler.rgRegEx(), 1);
            if (typeof rg !== 'undefined') {
              results.ResearchGateScore = rg;
            }

            let curres= matchHandler.getMatches(body, matchHandler.curresRegEx(), 1);
            if (typeof curres !== 'undefined') {
              results.CurrentResearch = curres;
            }

            let skills = matchHandler.getMatches(body, matchHandler.skillsRegEx(), 1);
            if (typeof skills !== 'undefined') {
              let regEx = /(?:"name":")(.{1,25})(?:","link")/g;
              results.Skills = matchHandler.getMatches(skills, regEx, 1);
            }

            let posExp = matchHandler.getMatches(body, matchHandler.posExpRegEx(), 1);
            if (typeof posExp !== 'undefined' && posExp.length > 0) {
              results.CurrentPosition = posExp[0].split("</div>")[0];
              for(let i=1; i<posExp.length; i++) {
                results.ResearchExperience.push(posExp[i]);
              }
            }


            //--//
            let pagesRegEx = new RegExp('(?:href="https:\/\/www.researchgate.net\/profile\/'+ link[this.id] +'\/)(\\d*)(?:">)', 'g');
            let pages = matchHandler.getMatches(body, pagesRegEx, 1);
            if (typeof pages !== 'undefined') {

              var larger = Math.max.apply(Math, pages);

              for(let i=2; i<=larger; i++) {
                let newOptions = {
                  url: url+'/'+i,
                  proxy: proxy
                };
                setTimeout(function() {
                  request(newOptions, function(error, response, body) {
                    let type = matchHandler.getMatches(body, matchHandler.typeRegEx(), 1);
                    if (typeof type !== 'undefined') {
                      //console.log(type);
                    }
                    let items = matchHandler.getMatches(body, matchHandler.itemsRegEx(), 1);
                    if (typeof items !== 'undefined') {

                      let links = [];
                      for(let i=0; i<items.length; i++) {
                        let splitted = items[i].split("\" itemProp=\"mainEntityOfPage\">");
                        //console.log("Page: "+splitted[1]);
                        links.push(splitted[0]);
                      }
                      //--//
                      for(var i=0; i<links.length; i++) {
                        let newUrl = 'https://www.researchgate.net/publication/' + links[i];
                        let newOptions = {
                          url: newUrl,
                          proxy: proxy
                        };

                        let newRegex = /(?:<h1 class="publication-title" itemProp="headline">)(.{1,350})(?:<\/h1><div class="publication-meta">)/g;
                        setTimeout(function() {
                          request(newOptions, function(error, response, body) {

                              if(typeof response !== 'undefined') {
                                  let item = matchHandler.getMatches(body, newRegex, 1);
                                  //console.log("Article: "+item[0]);
                              }

                          });
                        }, 50*i);
                      }
                      //--//
                    }
                  });
                }, 20*i);
                //--//
              }
            }
            if(io.sockets.connected[this.id] != undefined) {
              io.sockets.connected[this.id].emit('state', {
                text: 'Data received'
              });
            }
            console.log(results);
            if(io.sockets.connected[this.id] != undefined) {
              io.sockets.connected[this.id].emit("results", results);
            }
          }
        }
      }.bind({id: this.id}));
    }
  }
}

function getProxyCb(error, response, body){
  retry[this.id] += 1;
  if(retry[this.id] >= 2 && retry[this.id] < 15) {
    if(io.sockets.connected[this.id] != undefined) {
      io.sockets.connected[this.id].emit('state', {
        text: 'Please wait, this will take less than the construction of the LHC'
      });
    }
  } else if(retry[this.id] >= 15) {
    if(io.sockets.connected[this.id] != undefined) {
      io.sockets.connected[this.id].emit('state', {
        text: 'Ups, we\'re sorry something gone wrong. Try again in a few seconds'
      });
    }
    console.log("Time out");
    return;
  } else {
    if(io.sockets.connected[this.id] != undefined) {
      io.sockets.connected[this.id].emit('state', {
        text: 'Connecting'
      });
    }
  }
  if (JSON.parse(body).protocol === 'http') {
    proxy[this.id] = JSON.parse(body).curl;
    console.log("http proxy: " + proxy[this.id]);

    let options = {
      url: 'https://www.researchgate.net/search/authors?q='+searchName[this.id],
      proxy: proxy[this.id]
    };

    request(options, getRG.bind({id: this.id}));
  } else {
    //console.log("Not http");
    getProxy.getNewProxy(request, getProxyCb.bind({id: this.id}));
  }
};

var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {

  console.log("User connected");

  socket.on('command', function (command) {
    if(command.comm === 'Hello') {
      socket.emit('state', {
        text: 'Socket connected'
      });
    } else if(command.comm == 'RG') {
      //console.log(command.extra);
      if(io.sockets.connected[this.id] != undefined) {
        io.sockets.connected[this.id].emit('state', {
          text: 'Socket connected'
        });
      }
      console.log("Command RG: " + socket.id);
      retry[socket.id] = 0;
      searchName[socket.id] = command.extra;
      let id = socket.id;
      getProxy.getNewProxy(request, getProxyCb.bind({id: id}));

    }
  });

  socket.on('disconnect', function() {
    delete proxy[socket.id];
    delete link[socket.id];
    delete url[socket.id];
    delete searchName[socket.id];
    console.log('User disconnected');
  });

});


http.listen(PORT, function() {
  console.log('Server started');
});
