var mysql      = require('mysql');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var session = require('express-session')

var app = express()
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.use(session({ secret: 'I_AM_5ECRE7', resave: true, saveUninitialized: false, cookie: { path: '/', httpOnly: true, maxAge: null }}))

var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : '12345678',
		database : 'lunch'
	});
connection.connect();

function checkLogin(req, res, next) {
  if (!req.session.username) {
    res.redirect('/login')
  } else {
    next();
  }
}

var regular_item = function(data) {
	var list = {};
	data.map((item)=>{
		var d = {
			'id': item.id,
			'name': item.name,
			'price': item.price,
		}
		if (list[item.type_name]) {
			list[item.type_name].push(d)
		}else {
			list[item.type_name] = [];
			list[item.type_name].push(d)
		}
	})
	return list
}

var get_menu = function(res_id){
	return new Promise((resolve, reject)=> {
		connection.query('select item.*, item_type.name type_name from item INNER JOIN item_type ON item.type_id=item_type.id WHERE restaurant_id = ?', res_id, function(err, results, fields) {
			if (err) { 
				reject(err)
			}
			if (results) {
				resolve(regular_item(results))
			}else {
				reject(err)
			}	
		});
	})
}


var restaurant_list = function () {
	return new Promise((resolve, reject) => { 
		connection.query('SELECT * FROM restaurant', function(err, results, fields) {
			if (err) { 
				reject(err)
				throw err
			}
			if (results) {
				resolve(results)
			}else {
				reject()
			}	
		});
	});	
}

var item_list = function (res_id) {
	
}

var get_event = event_id => {
	let sql = 'SELECT ac.name ac_name, r.name res_name, r.id res_id, e.end_time \
	           FROM event e \
 						 JOIN restaurant r ON r.id = e.restaurant_id \
 						 JOIN account ac ON ac.id = e.account_id \
 						 WHERE e.id = ?;'

	return new Promise((resolve, reject) => {
		connection.query(sql, event_id, (err, results) => {
			if (err) throw err
			resolve(results[0])
		})
	})
}


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
	if (!req.session.username) {
		res.render('login', {})
	}else {
		res.redirect('/')
	}
})

app.get('/logout', function(req, res){
	delete req.session.username;
  res.redirect('/login');
})

app.post('/login', function(req, res){

	connection.query('SELECT * FROM account WHERE name = ?', req.body.username, function(err, results, fields) {
		if (err) { 
			throw err
		}
		if (results.length !== 0) {
			if (results[0].password == req.body.password) {
				req.session.username = req.body.username
				res.redirect('/')
				//res.end('success');
			}else {
				res.redirect('/login')
			}
		}else {
			res.redirect('/login')
		}	
	});
	// connection.end();
})

app.get('/create', checkLogin, function(req, res){
	res.end('/create')
})

app.get('/order', (req, res) => {
	let sql = 'SELECT a.name organizer, r.name, e.end_time FROM event e \
					   JOIN account a ON e.account_id = a.id \
					   JOIN restaurant r ON e.restaurant_id = r.id \
					   WHERE end_time > NOW();' 

	connection.query(sql, (err, results) => {
		if (err) throw err
		res.render('order', {event_list: results})
	});
})

app.get('/order/:event_id', (req, res) => {
	get_event(req.params.event_id).then(event => {
		console.log(event)
		let event_detail = {
			org_name: event.ac_name,
			res_name: event.res_name,
			res_id:   event.res_id,
			end_time: event.end_time
		}
		get_menu(event_detail.res_id).then(menu => {
			res.render('order_detail', {event: event_detail, menu: menu})
		})
	})
})







app.get("/", checkLogin, function(req,res,next){
    //抓取submit的資料 url上會有顯示    
    res.render('index');
    //res.send(result.toString());
    // cookie 最大 4KB
    //send 字串
    
});
app.get("/order", checkLogin, function(req,res,next){
    console.log(req.query.name);
    res.render('order.pug');    
});
app.get("/initiate", checkLogin, function(req,res,next){
    res.render('initiate.pug'); 
});
app.get("/overview", checkLogin, function(req,res,next){
    res.render('overview.pug'); 
});
app.get("/new_menu", checkLogin, function(req,res,next){
    res.render('new_menu.pug'); 
});
app.get("/old_menu", checkLogin, function(req,res,next){
    res.render('old_menu.pug'); 
});
app.get("/choose_shop", checkLogin, function(req,res,next){
	restaurant_list().then(function(result) {
		res.render('choose_shop', { res: result })
	})
});
app.get("/menu_details", checkLogin, function(req,res,next){
    res.render('menu_details.pug');
});

app.get("/choose_shop/:id", function(req, res, next){
	
	get_menu(req.params.id).then(x=>{
		console.log(x)
		res.render('menu_details.pug', {menu: x, shop_name: req.query.shop});
	})
});


app.listen(8888, () => {
	console.log('server up on port 8888')
})
