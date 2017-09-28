var mysql      = require('mysql');
var express = require('express');
var path = require('path');

// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : '12345678',
//   databasen: 'lunch'
// });

// connection.connect();

var app = express()
app.use(express.static(path.join(__dirname, 'public')))
// var ac = {
// 	name: 'dragon',
// 	password: '12345678',
// 	email: 'dragon.chen@104.com.tw'
// }
// connection.query('INSERT INTO account SET ?', ac, function(err, results, fields) {
//   if (err) throw err;
//   console.log('rows: ', results);
//   console.log('fields: ', fields);
// });
// connection.query('SELECT * FROM account WHERE id = ?', '1', function(err, results, fields) {
//   if (err) throw err;
//   console.log('rows: ', results);
//   console.log('fields: ', fields);
// });
// connection.query('INSERT INTO account SET ?', ac, function(err, rows, fields) {
//   if (err) throw err;
//   console.log('rows: ', rows);
//   console.log('fields: ', fields);
// // });
// connection.end();
app.get('/login', function(req, res){
  res.send('123')
})


app.listen(8888, () => {
  console.log('server up on port 8888')
})
