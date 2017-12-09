var express = require('express');
var PORT = process.env.PORT || 8080;
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//node modules
var request = require('request');
const fixieRequest = request.defaults({'proxy': process.env.FIXIE_URL});

var matchHandler = require('./match.js')();

var link = [];
var url = [];
var searchName = [];


//request callback
function getRG(error, response, body) {
  if(typeof response === 'undefined') {
    fixieRequest({url: url[this.id]}, getRG.bind({id: this.id}));
    console.log("Proxy tunneling timeout");
  } else {
    if(response.statusCode === 429) {
      console.log("Status 429");
      fixieRequest({url: url[this.id]}, getRG.bind({id: this.id}));
    } else {

      link[this.id] = matchHandler.getMatch(body, matchHandler.linkRegEx(), 1);
      console.log(link[this.id]);
      url[this.id] = 'https://www.researchgate.net/profile/'+link[this.id];
      //console.log(url[this.id]);
      //console.log(link);

      let newOptions = {
        url: url[this.id]
      };

      fixieRequest(newOptions, function(error, response, body) {

        if(typeof response === 'undefined') {
          fixieRequest({url: url[this.id]}, getRG.bind({id: this.id}));
          console.log("Proxy tunneling timeout");
        } else {
          if(response.statusCode === 429) {
            console.log("Status 429");
            fixieRequest({url: url[this.id]}, getRG.bind({id: this.id}));
          } else {

            let results = {
              ResearchExperience: [],
              Skills: [],
              CurrentResearch: [],
              Items: []
            };

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
                  url: newUrl
                };

                let newRegex = /(?:<h1 class="publication-title" itemProp="headline">)(.{1,250})(?:<\/h1><div class="publication-meta">)/g;
                setTimeout(function() {
                  fixieRequest(newOptions, function(error, response, body) {

                      if(typeof response !== 'undefined') {
                          let item = matchHandler.getMatches(body, newRegex, 1);
                          //console.log(item[0]);
                      }

                  });
                }, 50*i);
              }
              //--//
            }

            let insDep = matchHandler.getMatches(body, matchHandler.institutionRegEx(), 1);
            if(typeof insDep !== 'undefined') {
              let splitted = insDep[0].split("\"><b>");
              results.Institution = splitted[1];
              let toGetDepartment = splitted[0];
              let departmentRegEx = new RegExp('(?:<a class="nova-e-link nova-e-link--color-inherit nova-e-link--theme-silent" href="institution\/'+ toGetDepartment+'\/)(.{1,150})(?:<\/a><\/div>)', 'g');

              let department = matchHandler.getMatches(body, departmentRegEx, 1);
              if(typeof department !== 'undefined') {
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
                  url: url+'/'+i
                };
                setTimeout(function() {
                  fixieRequest(newOptions, function(error, response, body) {
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
                          url: newUrl
                        };

                        let newRegex = /(?:<h1 class="publication-title" itemProp="headline">)(.{1,350})(?:<\/h1><div class="publication-meta">)/g;
                        setTimeout(function() {
                          fixieRequest(newOptions, function(error, response, body) {

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
            console.log(results);
            io.sockets.connected[this.id].emit("results", results);
          }
        }
      }.bind({id: this.id}));
    }
  }
}

var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {

  console.log("User connected: " + socket.id);

  socket.on('command', function (command) {
    if(command.comm === 'Hello') {
      socket.emit('state', {
        text: 'Socket connected'
      });
    } else if(command.comm == 'RG') {

      searchName[socket.id] = command.extra;
      let options = {
        url: 'https://www.researchgate.net/search/authors?q='+searchName[socket.id],
      };
      fixieRequest(options, getRG.bind({id: socket.id}));

    }
  });

  socket.on('disconnect', function() {
    delete link[socket.id];
    delete url[socket.id];
    delete searchName[socket.id];
    console.log('User disconnected');
  });

});


http.listen(PORT, function() {
  console.log('Server started');
});
