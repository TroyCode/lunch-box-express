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
app.use(session({ secret: 'I_AM_5ECRE7', resave: true, saveUninitialized: false, 
	cookie: { path: '/', httpOnly: true, maxAge: null }}))

var connection = mysql.createConnection({
	host     : process.env.db_host,
	user     : process.env.db_user,
	password : process.env.db_password,
	database : process.env.db_name
});
connection.connect();

var checkLogin = function(req, res, next) {
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
			'price': item.price
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
		connection.query('select item.*, item_type.name type_name \
										  from item INNER JOIN item_type \
										  ON item.type_id=item_type.id \
										  WHERE restaurant_id = ?', res_id, 
										  function(err, results, fields) {
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

var get_rest_name = function(res_id){
	return new Promise((resolve, reject)=> {
		connection.query('select restaurant.name from restaurant WHERE id = ?', res_id, function(err, results, fields) {
			if (err) { 
				reject(err)
			}
			if (results) {
				resolve(results)
			}else {
				reject(err)
			}	
		});
	})
}

var create_event = function(res_id, start_time, end_time, ac_id) {
	return new Promise((resolve, reject) => { 
		connection.query('insert into event (id, restaurant_id, start_time, end_time, account_id) VALUES(null, ?, ?, ?, ?)', [res_id, start_time, end_time, ac_id], function(err, results, fields) {
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

var event_list = function () {
	return new Promise((resolve, reject) => { 
		connection.query('select * from event WHERE start_time<=now() AND end_time>=now();', function(err, results, fields) {
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

var insert_order = (event_id, user_id) => {
	let sql = 'INSERT INTO `order` (event_id, timestamp, account_id) \
						 VALUES (?, NOW(), ?);'
	return new Promise((resolve, reject) => {
		connection.query(sql, [event_id, user_id], (err, results) => {
			if (err) throw err
			resolve(results.insertId)
		})
	})
}

var insert_order_item = (order_id, order_set) => {
	let sql = 'INSERT INTO `order_item` \
						 VALUES '
	for (var item_id in order_set) {
		if (order_set[item_id] > 0) { 
			sql += `(${order_id}, ${item_id}, ${order_set[item_id]}), `
		}
	}
	sql = sql.slice(0, -2) + ';'
	return new Promise((resolve, reject) => {
		connection.query(sql, (err, results) => {
			if (err) throw err
		})
	})
}


app.get("/", checkLogin, function(req,res,next){
    res.render('index');
});

app.get('/login', function(req, res) {
	if (!req.session.username) {
		res.render('login', {})
	}else {
		res.redirect('/')
	}
})

app.get('/logout', function(req, res) {
	delete req.session.username;
  	res.redirect('/login');
})

app.post('/login', function(req, res) {
	connection.query('SELECT * FROM account WHERE name = ?', 
		req.body.username, function(err, results, fields) {
		if (err) { 
			throw err
		}
		if (results.length !== 0) {
			if (results[0].password == req.body.password) {
				req.session.username = req.body.username
				req.session.myid = results[0].id
				res.redirect('/')
			}else {
				res.redirect('/login')
			}
		}else {
			res.redirect('/login')
		}	
	});
})

app.get('/order/history', checkLogin, function(req, res)
{
		connection.query('select `order`.id, restaurant.name, timestamp, total ' + 
						 'from `order`, event, restaurant ' +
						 'where event.restaurant_id = restaurant.id and ' +
						 	'`order`.event_id = event.id and '+
							'`order`.account_id in (select id from account where account.id = "' + req.session.myid +'");',
			function(err, results, fields) {
				if (err) { 
					throw err;
				}
				res.render('history', {list:results});
			})
});

app.get('/order/history/:orderID', checkLogin, function(req, res)
{
	connection.query('SELECT it.name, oi.number, it.price, oi.number*it.price sum FROM `order` o \
					  JOIN order_item oi ON o.id = oi.order_id \
					  JOIN item it ON oi.item_id = it.id \
					  WHERE o.id = ?;', req.params.orderID,
		function(err, results, fields) 
		{
			if (err) 
			{ 
				throw err;
			}
			res.render('history_detail', {list:results});
		})
});

app.get('/create/history', checkLogin, function(req, res)
{
	connection.query('select event.id, restaurant.name, start_time, end_time '+
					 'from event,restaurant where account_id in ' +
					 '(select id from account where account.name = "' + req.session.username +'") and event.restaurant_id = restaurant.id;' ,
		function(err, results, fields) 
		{
			if (err) 
			{ 
				throw err;
			}
		res.render('create_history', {list:results});
		})
});





app.get('/create/history/:eventID', checkLogin, function(req, res)
{
	connection.query('select event.account_id, item.name, sum(order_item.number) count, item.price \
					  from order_item, item, event \
					  where order_item.item_id = item.id \
					  and order_id in (select id from `order` \
					                   where event_id = ? and \
					                   event.account_id = ? ) \
					  group by item.name, item.price;' , [req.params.eventID, req.session.myid], 
		function(err, results, fields) {
			if (err)  { 
				throw err;
			}
				let sum = 0;
				for(var i in results) {
					results[i].total = results[i].count * results[i].price;
					sum += results[i].total;
				}	
				res.render('create_history_event', {list:results, sum});
			
		})
});

app.get('/create', checkLogin, function(req, res){
	restaurant_list().then(function(result) {
		res.render('restaurant', { res: result })
	})
})

app.get("/create/:id", checkLogin, function(req, res, next){
	get_menu(req.params.id).then(menu=>{
		get_rest_name(req.params.id).then(rest=>{
			if (rest) {
				var shop_name = rest[0].name
			}else {
				var shop_name = ''
			}
			res.render('create', {menu: menu, shop_name: shop_name, shop_id: req.params.id});
		})
	})
});

app.post("/create/:id", checkLogin, function(req, res, next){
	var end_time = req.body.end_time;
	var res_id = req.params.id;
	var ac_id = req.session.myid;
	if (end_time) {
		create_event(res_id, new Date(), end_time, ac_id).then(result=>{
			res.redirect('/create/history/');
		});
	}else {
		res.end('error');
	}
});

app.get('/order', checkLogin, (req, res) => {
	let sql = 'SELECT a.name organizer, r.name, e.end_time, e.id FROM event e \
					   JOIN account a ON e.account_id = a.id \
					   JOIN restaurant r ON e.restaurant_id = r.id \
					   WHERE end_time > NOW();' 
	connection.query(sql, (err, results) => {
		if (err) throw err
		res.render('events', {event_list: results})
	});
})

app.route('/order/:event_id')
.get(checkLogin, (req, res) => {
	get_event(req.params.event_id).then(event => {
		let event_detail = {
			event_id: req.params.event_id,
			org_name: event.ac_name,
			res_name: event.res_name,
			res_id:   event.res_id,
			end_time: event.end_time
		}
		get_menu(event_detail.res_id).then(menu => {
			res.render('order', {event: event_detail, menu: menu})
		})
	})
})
.post(checkLogin, (req, res) => {
	insert_order(req.params.event_id, req.session.myid).then(order_id => {
		insert_order_item(order_id, req.body).then(
			res.redirect('/order/history')
		)
	})
})


app.listen(8888, () => {
	console.log('server up on port 8888')
})
