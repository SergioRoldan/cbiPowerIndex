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
  for (var key in results) {
    if ($.isArray(results[key])) {
      $("#results").append('<div class="alert alert-light clean" role="alert">'+key+': </div>');
      for(let i=0; i<results[key].length; i++) {
          $("#results").append('<div class="alert alert-light clean" role="alert">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'+results[key][i]+'</div>');
      }
    } else {
        $("#results").append('<div class="alert alert-light clean" role="alert">'+key +": " +results[key]+'</div>');
    }
  }
});

socket.on('state', function(state) {
  $('#state').html('<div class="alert alert-info clean" role="alert">' +state.text +'</div>');
});
