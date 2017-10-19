const mysql = require('mysql')

const connection = mysql.createConnection({
	host     : process.env.db_host,
	user     : process.env.db_user,
	password : process.env.db_password,
	database : process.env.db_name
})

function start() {
	connection.connect()
}

function end() {
	connection.end()
}

function query(sql, params,callback) {
	connection.query(sql, params, function(err, result) {
		if (err) {
			throw err
		}
		else {
			callback(result)
		}
	})
}

function selectAllFromRes(params, callback) {
	let sql = 'SELECT * FROM restaurant;'
	query(sql, params, callback)
}

function selectMenuByResId(params, callback) {
	let sql = 'SELECT item.*, item_type.name type_name FROM item \
						 INNER JOIN item_type ON item.type_id = item_type.id \
						 WHERE restaurant_id = ?;'
	query(sql, params, callback)
}

function selectResNameByResId(params, callback) {
	let sql = 'SELECT restaurant.name FROM restaurant WHERE id = ?'
	query(sql, params, callback)
}

function selectHisByAccId(params, callback) {
	let sql = 'SELECT e.id, r.name, e.start_time, e.end_time \
	           FROM event e, restaurant r \
	           WHERE e.account_id = ?;'
	query(sql, params, callback)
}

function createEvent(params, callback) {
	let sql = 'INSERT INTO event (restaurant_id, start_time, end_time, account_id) \
						 VALUES (?, ?, ?, ?);'
	query(sql, params, callback)
}

function selectActiveEvents(params, callback) {
	let sql = 'SELECT a.name organizer, r.name, e.end_time, e.id FROM event e \
					   JOIN account a ON e.account_id = a.id \
					   JOIN restaurant r ON e.restaurant_id = r.id \
					   WHERE end_time > ?;' 
	query(sql, params, callback)
}

module.exports = {
	start,
	end,
	selectAllFromRes,
	selectMenuByResId,
	selectResNameByResId,
	selectHisByAccId,
	selectActiveEvents,
	createEvent
}