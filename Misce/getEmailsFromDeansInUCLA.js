var request = require('request');
var matchHandler = require('./match.js')();
// Require library
var excel = require('excel4node');
// Create a new instance of a Workbook class
var workbook = new excel.Workbook();
// Add Worksheets to the workbook
var worksheet = workbook.addWorksheet('Sheet 1');
// Create a reusable style
var style = workbook.createStyle({
  font: {
    color: '#FF0800',
    size: 12
  },
  numberFormat: '$#,##0.00; ($#,##0.00); -'
});
worksheet.cell(1,1).string('Name').style(style);
worksheet.cell(1,2).string('Title').style(style);
worksheet.cell(1,3).string('Department').style(style);
worksheet.cell(1,4).string('email').style(style);

request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     'http://directory.ucla.edu/search.php',
  body:    "querytype=person&searchtype=advanced&&title=dean"
}, function(error, response, body){
  var regEx = /(?:<tr><td><span class="name">)(.{1,500})(?:<\/tr>)/g;
  var matches = matchHandler.getMatches(body, regEx, 1);
  //console.log(matches);
  var emailRegEx = /(?:" alt=")(.{1,60})(?:" ><\/a>)/g;
  var nameRegEx = /(?:">)(.{1,40})(?:<\/a>)/g;
  var titleRegEx = /(?:<\/span><br>)(.{1,40})(?:<\/td><td>)/g;
  var departmentRegEx = /(?:<td>)(.{1,40})(?:<\/td><td>)/g;

  var results = [];

  for(let i=0; i<matches.length; i++) {
        let name = matchHandler.getMatches(matches[i], nameRegEx, 1);
        let title = matchHandler.getMatches(matches[i], titleRegEx, 1);
        let department = matchHandler.getMatches(matches[i], departmentRegEx, 1);
        let email = matchHandler.getMatches(matches[i], emailRegEx, 1);

        results.push({
          name: name,
          title: title,
          department: department,
          email: email
        });
        //numero lletra / columna fila
        // Set value of cell A2 to 'string' styled with paramaters of style
        if(typeof name === 'undefined') {
          name = 'Undefined';
        }
        if(typeof title === 'undefined') {
          title = 'Undefined';
        }
        if(typeof department === 'undefined') {
          deparment = 'Undefined';
        }
        if(typeof email === 'undefined') {
          email = 'Undefined';
        }

        worksheet.cell(i+2, 1).string(name).style(style);
        worksheet.cell(i+2, 2).string(title).style(style);
        worksheet.cell(i+2, 3).string(department).style(style);
        worksheet.cell(i+2, 4).string(email).style(style);
        workbook.write('emails_Dean.xlsx');
  }

  console.log(results);
});
