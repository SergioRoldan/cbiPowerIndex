$("#submitButton").on('click', function(event) {

  event.preventDefault();
  var userName = $("#inputEmail").val();
  var userPassword = $("#inputPassword").val();

  $.post("http://localhost:8080/linkedIn", {
    user: userName,
    password: userPassword
  } ,function(data, status) {
    console.log(data);
    $("#results").append("<p> Result name: " + data.name + "</p><p> Result value: "+ data.password + "<p>" );
  });

});

$("#rgButton").on('click', function(event) {

  event.preventDefault();

  $.get("http://localhost:8080/researchGate", function(data, status) {
    console.log("Status: " + status);
    console.log("Data: " + data);
    dataConverted = data.replace(/<(?:.|\n)*?>/gm, '');


    $("#results").append("<p>" + dataConverted + "</p>" );
  });

});
