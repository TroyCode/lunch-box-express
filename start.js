
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine','pug');
app.use(express.static('public'));

// app.post("/",function(req,res,next){
//     res.send(req.body);
// });


app.listen(8080);
