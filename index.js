var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var session = require('express-session')
var db = require('./src/db')
var app = express()

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.use(session({ secret: 'I_AM_5ECRE7', resave: true, saveUninitialized: false, 
	cookie: { path: '/', httpOnly: true, maxAge: null }}))

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
			db.selectAcctIdByEveOrdId([query_table, req.params.id], (results) => {
				if (results) {
					if (results[0].account_id == req.session.myid) {
						next();
					} else {
						res.end('forbidden');
					}
				} else {
					res.end('forbidden');
				}	
			})
		}
	}	
}
var checkIdentity_event = checkIdentity('event');
var checkIdentity_order = checkIdentity('order');

function orderFilter(req, res, next) {
	let filteredReq = {}
	for (var itemId in req.body) {
		if (req.body[itemId] > 0) { 
			filteredReq[itemId] = req.body[itemId]
		}
	}
	req.body = filteredReq
	next()
}

var regular_item = function(data) {
	var list = {};
	data.map((item) => {
		var d = {
			'id': item.id,
			'name': item.name,
			'price': item.price
		}
		if (list[item.type_name]) {
			list[item.type_name].push(d)
		} else {
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

function getUnixTimeNow() {
	return Math.floor(Date.now()/1000)
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
	db.selectAcctByName([req.body.username], (result) => {
		if (result.length !== 0) {
			if (result[0].password == req.body.password) {
				req.session.username = req.body.username
				req.session.myid = result[0].id
				req.session.email = result[0].email
				res.redirect('/')
			}else {
				res.redirect('/login')
			}
		} else {
			res.redirect('/login')
		}	
	})
})

app.get('/order/history', checkLogin, function(req, res) {
	db.selectOrdHisByAcctId([req.session.myid], (result) => {
		res.render('history', {list:result})
	})
})

app.get('/order/history/:id', checkLogin, checkIdentity_order, function(req, res) {
	db.selectOrdByOrdId(req.params.id, (result) => {
		res.render('history_detail', {list:result})
	})
})

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
	let queryByItem, sumByItem = 0;
	
	db.selectEventDtalById([req.params.id, req.session.myid], (results) => {
		for(var i in results) 
		{
	    	results[i].total = results[i].count * results[i].price;
	        sumByItem += results[i].total;
		}   
		queryByItem = results;	
	})

	db.selectEventDtalByUser([req.params.id] , (results) => {
    	let userTotal = 0;
        let nowName = results[0].user;
        
		for(let i in results) 
		{
        	userTotal += results[i].price * results[i].number;
                
            //處理sum
            if(i < results.length-1)
            {
                if (results[i].user == results[i*1+1].user)
                {
	                results[i].sum = "";
                }   
                else
                {
                    results[i].sum = `$ ${userTotal}`;
                    userTotal = 0;
                }               
            }

            if (i == results.length -1)
            {
                results[i].sum = `$ ${userTotal}`;
            }
            //處理sum end
                
            //處理name    
            if (i != 0)
            {
   	        	if (results[i].user == nowName)
                	results[i].user = "";
                else
                    nowName = results[i].user;
            }
			//處理name end 
        }
			      
		res.render('create_history_event', {listByItem:queryByItem, sumByItem:sumByItem, listByUser: results});
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
		db.createEvent([res_id, new Date().getTime()/1000, end_time, ac_id], () => {
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
	db.selectEventById([req.params.event_id], (result) => {
		let event = result[0]
		let event_detail = {
			event_id: req.params.event_id,
			org_name: event.ac_name,
			res_name: event.res_name,
			res_id:   event.res_id,
			end_time: event.end_time
		}
		db.selectMenuByResId([event_detail.res_id], (result) => {
			menu = regular_item(result)
			res.render('order', {event: event_detail, menu: menu})
		})
	})
})
.post(checkLogin, orderFilter, (req, res) => {
	console.log(req.body)
	db.createOrder([req.params.event_id, getUnixTimeNow(), req.session.myid], (result) => {
		for (let itemId in req.body) {
			db.createOrderItem([result.insertId, itemId, req.body[itemId]], () => {
				// do something here
			})
		}
		res.redirect('/order/history')
	})
})


app.get('/create_menu', checkLogin, (req, res) => {
	res.render('create_menu')
})	


app.listen(8888, () => {
	console.log('server up on port 8888')
})

module.exports = app

