var socket = io();
var abi;
var address;
var web3;
var contract;
var write;
var coinbase;

var contractAddress = '0x8c7966a9c9642b498d5e204b2c98650b1d09a642';

$.ajax({'async': false,'global': false,'url': "/../json/PowerIndexFactory.json",'dataType': "json", 'success': function (data) {
  abi = data;
}});

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
  $('#ropsten').html('<div class="alert alert-info clean" role="alert"> Web3 provided by Metamask or Mist</div>');
  write = true;
  coinbase = web3.eth.coinbase;
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/prmuQKDV2kPa0tUGKCsc"));
  $('#ropsten').html('<div class="alert alert-warning clean" role="alert"> Web3 provided by Infura. Write functions not available</div>');
  write = false;
  coinbase = '0x858222978bd02C462AB5323357BE2A6307b4848c';
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

contract = web3.eth.contract(abi).at(contractAddress);

$("#rgButton").on('click', function(event) {

  event.preventDefault();

  $("#pilar1").html('');
  $("#pilar2").html('');
  $("#image").hide();
  $("#pilar3").html('');
  $('#image-holder').html('');
  $("#results").html('');

  let rschr = toTitleCase($("#inputRschrName").val());

  contract.findResearcherByName.call(rschr,  {from: coinbase},function(error, results) {

    if(web3.toAscii(results[0]) === '') {

      $('#ropsten').html('<div class="alert alert-danger" role="alert">Researcher not found in the Blockchain</div>');
      $("#rgButton").prop('disabled', true);
      $(".loader").show();
      $("#state").css('width', "calc(99%)");

      if(rschr === "") {
        $("#results").html('');
        $("#results").append("<p> Write a name pls</p>" );
      } else {
        socket.emit('command', {comm: 'RG', extra: rschr});
      }



    } else {

      $('#ropsten').html('<div class="alert alert-success" role="alert">Researcher found in the Blockchain</div>');
      var str = [];

      for(let i=0; i<results.length; i++) {
        str.push(web3.toAscii(results[i]));
      }

      $("#results").append('<div class="alert alert-info clean" role="alert">Name: '+str[0]+'</div>');
      $("#results").append('<div class="alert alert-info clean" role="alert">Institution: '+str[1]+' @ '+str[2]+'</div>');
      $("#results").append('<div class="alert alert-info clean" role="alert">CurrentPosition: '+str[3]+'</div>');
      $("#results").append('<div class="alert alert-info clean" role="alert">ResearchGateScore: '+str[4].charCodeAt(0)+'</div>');



      let char = str[5].substr(str[5].length-1);
      Read = str[5].replace(new RegExp(char, 'g'), "");
      console.log(Read);
      let Cit = str[6].replace(new RegExp(char, 'g'), "");
      console.log(Cit);
      let It = str[7].replace(new RegExp(char, 'g'), "");
      console.log(It);


      let nRead = '';
      for(let i=0; i<Read.length; i++) {
        nRead += Read.charCodeAt(i);
      }
      let nCit = '';
      for(let i=0; i<Cit.length; i++) {
        nCit += Cit.charCodeAt(i);
      }
      let nIt = '';
      for(let i=0; i<It.length; i++) {
        nIt += It.charCodeAt(i);
      }
      $("#results").append('<div class="alert alert-info clean" role="alert"># of reads: '+nRead+'</div>');
      $("#results").append('<div class="alert alert-info clean" role="alert"># of citations: '+nCit+'</div>');
      $("#results").append('<div class="alert alert-info clean" role="alert"># of research items: '+nIt+'</div>');

      random1 = str[8].charCodeAt(0);
      random2 = str[9].charCodeAt(0);
      random3 = str[10].charCodeAt(0);

      char = str[11].substr(str[11].length-1);
      let link = str[11].replace(new RegExp(char, 'g'), "");

      if(link === 'undefined') {
        $("#image").attr("src","/../images/placeholder.png");
        $("#image").show();
      } else {
        $("#image").attr("src",'https://i1.rgstatic.net/ii/profile.image/'+str[11]);
        $("#image").show();
      }

      $("#pilar1").circliful({
                    animationStep: 5,
                    foregroundBorderWidth: 5,
                    backgroundBorderWidth: 15,
                    percent: random1,
                    fontColor: "#3498db",
                    backgroundColor: '#ffffff'
               });

     	$("#pilar2").circliful({
                     animationStep: 5,
                     foregroundBorderWidth: 5,
                     backgroundBorderWidth: 15,
                     percent: random2,
                     fontColor: "#3498db",
                     backgroundColor: '#ffffff'
                });

      $("#pilar3").circliful({
                     animationStep: 5,
                     foregroundBorderWidth: 5,
                     backgroundBorderWidth: 15,
                     percent: random3,
                     fontColor: "#3498db",
                     backgroundColor: '#ffffff'
                 });
    }

  });

});



socket.on('connect', function() {
  console.log('Connected to socket.io server!');

  socket.emit('command', {
    comm: 'Hello',
    addInfo: ''
  });

});

socket.on('results', function(results) {
  $("#results").html('');

  $("#rgButton").prop('disabled', false);
  $(".loader").hide();
  $("#state").css('width', "calc(95%)");

  let rschr = [];


  rschr.push(toTitleCase(results.contractName));

  if(results.Institution.replace(/[^\x00-\x7F]/g, "").length > 32) {
    rschr.push(results.Institution.replace(/[^\x00-\x7F]/g, "").substr(0,31));
    console.log(results.Institution.replace(/[^\x00-\x7F]/g, "").substr(0,31));
  } else {
    rschr.push(results.Institution.replace(/[^\x00-\x7F]/g, ""));
  }

  if(results.Department == undefined) {
    rschr.push("undefined");
  } else if (results.Department.replace(/[^\x00-\x7F]/g, "").length > 32) {
    rschr.push(results.Department.replace(/[^\x00-\x7F]/g, "").substr(0,31));
  } else {
    rschr.push(results.Department.replace(/[^\x00-\x7F]/g, ""));
  }

  if(results.CurrentPosition == undefined) {
    rschr.push("undefined");
  } else if (results.CurrentPosition.replace(/[^\x00-\x7F]/g, "").length > 32) {
    rschr.push(results.CurrentPosition.replace(/[^\x00-\x7F]/g, "").substr(0,31));
  } else {
    rschr.push(results.CurrentPosition.replace(/[^\x00-\x7F]/g, ""));
  }

  if(results.ResearchGateScore != undefined) {
    if(results.ResearchGateScore.toString().indexOf(".") > 0) {
      rschr.push(results.ResearchGateScore.toString().substr(".")[0]);
    } else {
      rschr.push(results.ResearchGateScore.toString());
    }
  } else {
    rschr.push('undefined');
  }

  rschr.push(results.ReadsNumber.toString().replace(",",""));
  rschr.push(results.CitationsNumber.toString().replace(",",""));
  rschr.push(results.ResearchItemNumber.toString().replace(",",""));

  let random1 = 100*(0.8*parseInt(results.CitationsNumber.replace(",",""))+0.2*parseInt(results.ReadsNumber.replace(",",""))) / (0.8*parseInt(results.CitationsNumber.replace(",",""))+0.2*parseInt(results.ReadsNumber.replace(",",""))+Math.random()*0.065*parseInt(results.ReadsNumber.replace(",","")));
  let random2 = 100*(0.8*parseInt(results.CitationsNumber.replace(",",""))+0.2*parseInt(results.ReadsNumber.replace(",",""))) / (0.8*parseInt(results.CitationsNumber.replace(",",""))+0.2*parseInt(results.ReadsNumber.replace(",",""))+Math.random()*0.075*parseInt(results.ReadsNumber.replace(",","")));
  let random3 = 100*(0.8*parseInt(results.CitationsNumber.replace(",",""))+0.2*parseInt(results.ReadsNumber.replace(",",""))) / (0.8*parseInt(results.CitationsNumber.replace(",",""))+0.2*parseInt(results.ReadsNumber.replace(",",""))+Math.random()*0.085*parseInt(results.ReadsNumber.replace(",","")));

  rschr.push(random1.toFixed(0).toString());
  rschr.push(random2.toFixed(0).toString());
  rschr.push(random3.toFixed(0).toString());

  if(results.link !== 'undefined' && results.link != undefined) {
    $("#image").attr("src",'https://i1.rgstatic.net/ii/profile.image/'+results.link);
    $("#image").show();
  } else {
    $("#image").attr("src","/../images/placeholder.png");
    $("#image").show();
  }

  rschr.push("undefined");

  $("#results").append('<div class="alert alert-info clean" role="alert" style="margin:3px;">Name: '+results.Name+' - ContractName: '+results.contractName+'</div>');
  delete results.Name;
  delete results.contractName;
  $("#results").append('<div class="alert alert-info clean" role="alert" style="margin:3px;">Institution: '+results.Institution+' @ '+results.Department+'</div>');
  delete results.Institution;
  delete results.Department;
  $("#results").append('<div class="alert alert-info clean" role="alert" style="margin:3px;">CurrentPosition: '+results.CurrentPosition+'</div>');
  delete results.CurrentPosition;
  $("#results").append('<div class="alert alert-info clean" role="alert" style="margin:3px;">ResearchGateScore: '+results.ResearchGateScore+'</div>');
  delete results.ResearchGateScore;
  $("#results").append('<div class="alert alert-info clean" role="alert" style="margin:3px;"># of reads: '+results.ReadsNumber+'</div>');
  delete results.ReadsNumber;
  $("#results").append('<div class="alert alert-info clean" role="alert" style="margin:3px;"># of citations: '+results.CitationsNumber+'</div>');
  delete results.CitationsNumber;
  $("#results").append('<div class="alert alert-info clean" role="alert" style="margin:3px;"># of research items: '+results.ResearchItemNumber+'</div>');
  delete results.ResearchItemNumber;

  $("#pilar1").circliful({
                animationStep: 5,
                foregroundBorderWidth: 5,
                backgroundBorderWidth: 15,
                percent: random1,
                fontColor: "#3498db",
                backgroundColor: '#ffffff'
           });

  $("#pilar2").circliful({
                 animationStep: 5,
                 foregroundBorderWidth: 5,
                 backgroundBorderWidth: 15,
                 percent: random2,
                 fontColor: "#3498db",
                 backgroundColor: '#ffffff'
            });

  $("#pilar3").circliful({
                 animationStep: 5,
                 foregroundBorderWidth: 5,
                 backgroundBorderWidth: 15,
                 percent: random3,
                 fontColor: "#3498db",
                 backgroundColor: '#ffffff'
             });

  for (var key in results) {
    if ($.isArray(results[key])) {
      $("#results").append('<div class="alert alert-info clean" role="alert" style="margin:3px;">'+key+': </div>');
      for(let i=0; i<results[key].length; i++) {
          if(typeof results[key][i] == 'object') {
            $("#results").append('<div class="alert alert-info clean" role="alert" style="padding-left:20px; margin:3px;">'+results[key][i].Type+': '+results[key][i].Name+'</div>');
          } else {
            $("#results").append('<div class="alert alert-info clean" role="alert" style="padding-left:20px; margin:3px;"> - '+results[key][i]+'</div>');
          }
      }
    } else {
        $("#results").append('<div class="alert alert-info clean" role="alert" style="margin:3px;">'+key +": " +results[key]+'</div>');
    }
  }



  if(write) {
    console.log(rschr);
    contract.findResearcherByName.call(rschr[0], {from: coinbase},function(error, results) {
      if(web3.toAscii(results[0]) === '') {
        console.log("Inside find");
        $('#ropsten').html('<div class="alert alert-info" role="alert">Uploading researcher to the Blockchain. Please confirm transactions</div>');
        contract.createResearcher(rschr[0],  {from: coinbase, gasPrice: 10000000000},function(error, results) {
          console.log("Creating");
          if(error !== 'undefined') {
            contract.updateResearcher(rschr,  {from: coinbase, gasPrice: 10000000000},function(error, results) {
              console.log("Updating");
              if(error !== 'undefined') {
                $('#ropsten').html('<div class="alert alert-success" role="alert">SmartContract created and updated</div>');
              } else {
                $('#ropsten').html('<div class="alert alert-danger" role="alert">Error creating the SmartContract</div>');
              }
            });
          } else {
            $('#ropsten').html('<div class="alert alert-danger" role="alert">Error creating the SmartContract</div>');
          }
        });
      } else {
        $('#ropsten').html('<div class="alert alert-info" role="alert">Researcher already included in the Blockchain</div>');
      }
    });
  }

});

socket.on('paper', function(paper) {
  $(".clean").each(function() {
    let str = $(this).text();
    if (str.indexOf(paper.name) >= 0) {
      let citations;
      let references;
      if(paper.citations == undefined) {
        citations=0;
      } else {
        citations = paper.citations;
      }
      if(paper.references == undefined) {
        references=0;
      } else {
        references = paper.references;
      }
      $(this).html('');
      let print = "Citations: " + citations + " References: "+ references;
      let html = '<div class="alert alert-info clean col-sm-9" role="alert" style="margin-right:3px; border: none">'
        +str+'</div><div class="alert alert-info clean col-sm-3" role="alert" style="margin-right:3px; border: none">'+print+'</div>';
      $(this).html(html);
    }
  });
});

socket.on('state', function(state) {
  if(state.text === 'Ups, we\'re sorry something gone wrong. Try again in a few seconds' || state.text ==='Error researcher not found') {
    $("#rgButton").prop('disabled', false);
    $(".loader").hide();
    $("#state").css('width', "calc(99%)");
  }
  $('#state').html('<div class="alert alert-info clean" role="alert">' +state.text +'</div>');
});
