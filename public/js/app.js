$("#submitButton").on('click', function(event) {

  event.preventDefault();
  var userName = $("#inputEmail").val();
  var userPassword = $("#inputPassword").val();

  $.post("https://cbi-test.herokuapp.com/linkedIn", {
    user: userName,
    password: userPassword
  } ,function(data, status) {
    console.log(data);
    $("#results").append("<p> Result name: " + data.name + "</p><p> Result value: "+ data.password + "<p>" );
  });

});

$("#rgButton").on('click', function(event) {

  event.preventDefault();

  $.get("https://cbi-test.herokuapp.com/researchGate", function(data, status) {
    console.log("Status: " + status);
    console.log("Data: " + data);
    dataConverted = data.replace(/<(?:.|\n)*?>/gm, '');


    $("#results").append("<p>" + dataConverted + "</p>" );
  });

});
