var local = "http://localhost:8080/";
var socket = io();


$("#rgButton").on('click', function(event) {

  event.preventDefault();

  let rschr = $("#inputRschrName").val();

  if(rschr === "") {
    $("#results").append("<p> Write a name pls</p>" );
  } else {

    socket.emit('command', {
      comm: 'RG',
      extra: rschr
    });
  }

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
  /*for (var key in results) {
    if ($.isArray(results[key])) {
      $("#results").append('<div class="alert alert-light clean" role="alert">'+key+': </div>');
      for(let i=0; i<results[key].length; i++) {
          $("#results").append('<div class="alert alert-light clean" role="alert">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'+results[key][i]+'</div>');
      }
    } else {
        $("#results").append('<div class="alert alert-light clean" role="alert">'+key +": " +results[key]+'</div>');
    }
  }*/
  $("#results").append('<div class="alert alert-light clean" role="alert">Name: '+results.Name+'</div>');
  delete results.Name;
  $("#results").append('<div class="alert alert-light clean" role="alert">Institution: '+results.Institution+' @ '+results.Department+'</div>');
  delete results.Institution;
  delete results.Department;
  $("#results").append('<div class="alert alert-light clean" role="alert">CurrentPosition: '+results.CurrentPosition+'</div>');
  delete results.CurrentPosition;
  $("#results").append('<div class="alert alert-light clean" role="alert">ResearchGateScore: '+results.ResearchGateScore+'</div>');
  delete results.ResearchGateScore;
  $("#results").append('<div class="alert alert-light clean" role="alert"># of reads: '+results.ReadsNumber+'</div>');
  delete results.ReadsNumber;
  $("#results").append('<div class="alert alert-light clean" role="alert"># of citations: '+results.CitationsNumber+'</div>');
  delete results.CitationsNumber;
  $("#results").append('<div class="alert alert-light clean" role="alert"># of research items: '+results.ResearchItemNumber+'</div>');
  delete results.ResearchItemNumber;

  for (var key in results) {
    if ($.isArray(results[key])) {
      $("#results").append('<div class="alert alert-light clean" role="alert">'+key+': </div>');
      for(let i=0; i<results[key].length; i++) {
          if(typeof results[key][i] == 'object') {
            $("#results").append('<div class="alert alert-light clean" role="alert" style="margin-left:20px;">'+results[key][i].Type+': '+results[key][i].Name+'</div>');
          } else {
            $("#results").append('<div class="alert alert-light clean" role="alert" style="margin-left:20px;">'+results[key][i]+'</div>');
          }
      }
    } else {
        $("#results").append('<div class="alert alert-light clean" role="alert">'+key +": " +results[key]+'</div>');
    }
  }


});

socket.on('state', function(state) {
  $('#state').html('<div class="alert alert-info clean" role="alert">' +state.text +'</div>');
});
