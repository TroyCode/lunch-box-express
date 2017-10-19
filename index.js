var mysql      = require('mysql');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var session = require('express-session')
var db = require('./src/db')

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
connection.connect()
db.start()

const TIME_OFFSET = {
	'zh-TW': 28800
}

var checkLogin = function(req, res, next) {
	if (!req.session.username) {
		res.redirect('/login')
	} else {
		next();
	}
}

var checkIdentity = function(category) {
	return function(req, res, next) {
		var query_table = category;
		if (query_table !== '') {
			connection.query('select account_id from `' + query_table + '` WHERE id = ?', req.params.id, function(err, results, fields) {
				if (err) { 
					throw err
				}
				if (results) {
					if (results[0].account_id == req.session.myid) {
						next();
					}else {
						res.end('forbidden');
					}
				}else {
					res.end('forbidden');
				}	
			});
		}
	}	
}
var checkIdentity_event = checkIdentity('event');
var checkIdentity_order = checkIdentity('order');


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

function formatUnixTime(ut) {
	let d = new Date(ut*1000)
	let year   = d.getFullYear(),
			month  = d.getMonth(),
			date   = d.getDate()
			hour   = d.getHours()
			minute = d.getMinutes()
	return `${year}-${month}-${date} ${hour}:${minute}`
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

app.use(function(req, res, next){
  res.locals.session = req.session;
  next();
});

app.get("/", checkLogin, function(req,res,next){
    res.render('index',{
		username:req.session.username,
		useremail:req.session.email
	});
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
				req.session.email = results[0].email
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
	connection.query(`select \`order\`.id, restaurant.name, DATE_FORMAT(FROM_UNIXTIME(timestamp),'%Y/%c/%d %H:%i:%S') timestamp
						from \`order\`, event, restaurant
						where event.restaurant_id = restaurant.id and
							\`order\`.event_id = event.id and
							\`order\`.account_id in 
								(select id from account where account.id = "${req.session.myid}");`,
	function(err, results, fields) {
		if (err) { 
			throw err;
		}

		res.render('history', {list:results});
	})
});

app.get('/order/history/:id', [checkLogin, checkIdentity_order], function(req, res)
{
	connection.query('SELECT it.name, oi.number, it.price, oi.number*it.price sum FROM `order` o \
					  JOIN order_item oi ON o.id = oi.order_id \
					  JOIN item it ON oi.item_id = it.id \
					  WHERE o.id = ?;', req.params.id,
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
	db.selectHisByAccId(req.session.myid, results => {
		results = results.map(result => {
			result.start_time = formatUnixTime(result.start_time)
			result.end_time = formatUnixTime(result.end_time)
			return result
		})
		res.render('create_history', {list: results})
	})
})

app.get('/create/history/:id', checkLogin, checkIdentity_event, function(req, res) {
	connection.query('select event.account_id, item.name, sum(order_item.number) count, item.price \
					  from order_item, item, event \
					  where order_item.item_id = item.id \
					  and order_id in (select id from `order` \
					                   where event_id = ? and \
					                   event.account_id = ? ) \
					  group by item.name, item.price;' , [req.params.id, req.session.myid], 
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

app.get('/create', checkLogin, function(req, res) {
	db.selectAllFromRes(null, result => {
		res.render('restaurant', {res: result})
	})
})

app.get("/create/:id", checkLogin, function(req, res, next){
	db.selectMenuByResId(req.params.id, result => {
		menu = regular_item(result)
		db.selectResNameByResId(req.params.id, resName => {
			if (resName) {
				var shop_name = resName[0].name
			} else {
				var shop_name = ''
			}
			res.render('create', {menu: menu, shop_name: shop_name, shop_id: req.params.id});
		})
	})
})

app.post("/create/:id", checkLogin, function(req, res, next){
	var end_time = new Date(req.body.end_time).getTime()/1000
	var res_id = req.params.id
	var ac_id = req.session.myid
	if (end_time) {
		db.createEvent([res_id, new Date().getTime()/1000, end_time, ac_id], _ => {
			res.redirect('/create/history/')
		})
	} else {
		res.end('error')
	}
})

app.get('/order', checkLogin, (req, res) => {
	db.selectActiveEvents((new Date()).getTime()/1000, results => {
		results = results.map(result => {
			result.end_time = formatUnixTime(result.end_time)
			return result
		})
		res.render('events', {event_list: results})
	})
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
