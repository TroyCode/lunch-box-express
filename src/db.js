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

function query(sql, params, callback) {
	connection.query(sql, params, function(err, result) {
		if (err) {
			throw err
		}
		else {
			if (callback === null)
				return;
			//console.log(result);
			callback(result)
		}
	})
}

function selectAcctByName(params, callback) {
	let sql = 'SELECT * FROM account WHERE name = ?'
	query(sql, params, callback)
}

function selectAcctIdByEveOrdId(params, callback) {
	let sql = 'SELECT account_id FROM `' + params[0] + '` WHERE id = ?'
	query(sql, [params[1]], callback)
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
	           WHERE e.account_id = ? and e.restaurant_id = r.id;'
	query(sql, params, callback)
}

function selectOrdHisByAcctId(params, callback) {
	let sql = `SELECT \`order\`.id, restaurant.name, DATE_FORMAT(FROM_UNIXTIME(timestamp+${params[1]}),'%Y/%c/%d %H:%i:%S') timestamp
						 FROM \`order\`, event, restaurant
						 WHERE event.restaurant_id = restaurant.id AND
						 \`order\`.event_id = event.id AND
						 \`order\`.account_id IN (
							 SELECT id FROM account 
							 WHERE account.id = ?
						 );`
	query(sql, params, callback)
}

function selectOrdByOrdId(params, callback) {
	let sql = `SELECT it.name, oi.number, it.price, oi.number*it.price sum FROM \`order\` o 
					   JOIN order_item oi ON o.id = oi.order_id 
					   JOIN item it ON oi.item_id = it.id 
					   WHERE o.id = ?;`
	query(sql, params, callback)
}

function selectActiveEvents(params, callback) {
	let sql = 'SELECT a.name organizer, r.name, e.end_time, e.id FROM event e \
					   JOIN account a ON e.account_id = a.id \
					   JOIN restaurant r ON e.restaurant_id = r.id \
					   WHERE end_time > ?;' 
	query(sql, params, callback)
}

function selectEventById(params, callback) {
	let sql = 'SELECT ac.name ac_name, r.name res_name, r.id res_id, e.end_time \
	           FROM event e \
 						 JOIN restaurant r ON r.id = e.restaurant_id \
 						 JOIN account ac ON ac.id = e.account_id \
 						 WHERE e.id = ?;'
	query(sql, params, callback)
}

function selectEventDtalById(params, callback) {
	let sql = `SELECT event.account_id, item.name, SUM(order_item.number) count, item.price \
					   FROM order_item, item, event 
					   WHERE ( 
					     order_item.item_id = item.id AND 
					     order_id IN (
					       SELECT id FROM \`order\` 
					       where event_id = ? AND 
					       event.account_id = ? 
					     ) 
					   )
					   GROUP BY item.name, item.price;`;
	query(sql, params, callback)		   
} 

function selectEventDtalByUser(params, callback) {
	
	let sql = `select a.name user, i.name, i.price, oi.number, oi.order_id 
	from order_item oi, \`order\` o, account a, item i 
	where a.id = o.account_id and
		i.id = oi.item_id and
		oi.order_id = o.id and
		oi.order_id in (select id from \`order\` where event_id = ?)`;

	query(sql, params, callback)		   
} 

function createEvent(params, callback) {
	let sql = 'INSERT INTO event (restaurant_id, start_time, end_time, account_id) \
						 VALUES (?, ?, ?, ?);'
	query(sql, params, callback)
}

function createOrder(params, callback) {
	let sql = 'INSERT INTO `order` (event_id, timestamp, account_id) \
						 VALUES (?, ?, ?);'
	query(sql, params, callback)
}

function createOrderItem(params, callback) {
	let sql = 'INSERT INTO `order_item` (order_id, item_id, number) \
						 VALUES (?, ?, ?);'
	query(sql, params, callback)
}

function createRestaurant(params, callback){
	let sql = 'INSERT INTO restaurant (name, address, phone) VALUES(?, ?, ?)';
	query(sql, params, callback);
}

function createItemType(params, callback){
	let sql = 'INSERT INTO item_type (name) values(?)'
	query(sql, params, callback);
}

function createItem(params, callback){
	let sql = 'insert into item (name, price, type_id, restaurant_id) values (?, ?, ?, ?)';
	console.log(params);
	query(sql, params, callback);
}

function selectMaxRestaurantId(params, callback){
	let sql = 'select MAX(id) restaurantID from restaurant';

	query(sql, null, callback);
}

function selectMaxItemTypeId(params, callback){
	let sql = 'select MAX(id) itemTypeID from item_type';

	query(sql, null, callback);
}

module.exports = {
	start,
	end,
	selectAcctByName,
	selectAcctIdByEveOrdId,
	selectAllFromRes,
	selectMenuByResId,
	selectResNameByResId,
	selectHisByAccId,
	selectOrdHisByAcctId,
	selectOrdByOrdId,
	selectActiveEvents,
	selectEventById,
	selectEventDtalById,
	selectEventDtalByUser,
	createEvent,
	createOrder,
	createOrderItem,
	createRestaurant,
	createItemType,
	selectMaxItemTypeId,
	selectMaxRestaurantId,
	createItem
}
