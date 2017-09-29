
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine','pug');
app.use(express.static('public'));

// app.post("/",function(req,res,next){
//     res.send(req.body);
// });

app.get("/",function(req,res,next){
    //抓取submit的資料 url上會有顯示    
    res.render('index');
    //res.send(result.toString());
    // cookie 最大 4KB
    //send 字串
    
});
app.get("/order",function(req,res,next){
    console.log(req.query.name);
    res.render('pug/order.pug');    
});
app.get("/initiate",function(req,res,next){
    res.render('pug/initiate.pug'); 
});
app.get("/overview",function(req,res,next){
    res.render('pug/overview.pug'); 
});
app.get("/new_menu",function(req,res,next){
    res.render('pug/new_menu.pug'); 
});
app.get("/old_menu",function(req,res,next){
    res.render('pug/old_menu.pug'); 
});
app.get("/choose_shop",function(req,res,next){
    res.render('pug/choose_shop.pug'); 
});
app.get("/menu_details",function(req,res,next){
    res.render('pug/menu_details.pug');
});
app.listen(8080);
