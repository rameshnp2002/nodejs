var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	fs = require('fs'),
	mysql = require('mysql'),
	connectionsArray = [],
	connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'calendar4all',
		database: 'piwik',
		port: 3306
	}),
	POLLING_INTERVAL = 3000,
	pollingTimer;

// If there is an error connecting to the database
connection.connect(function(err) {
	// connected! (unless `err` is set)
	if (err) {
		console.log(err);
	}
});

// creating the server ( localhost:3000 )
app.listen(3000);

// on server started we can load our message.html page
function handler(req, res) {
	fs.readFile(__dirname + '/message.html', function(err, data) {
		if (err) {
			console.log(err);
			res.writeHead(500);
			return res.end('Error loading message.html');
		}
		res.writeHead(200);
		res.end(data);
	});
}

/*
 *
 * This function feach message from table and sent to connected sockets 
 *
 */

var pollingLoop = function() {

	var query = connection.query('SELECT type,message FROM notification_message'),
		messages = []; // this array will contain the result of our db query

	// setting the query listeners
	query
		.on('error', function(err) {
			// Handle error, and 'end' event will be emitted after this as well
			console.log(err);
			updateSockets(err);
		})
		.on('result', function(msg) {
			// it fills our array looping on each user row inside the db
			messages.push(msg);
		})
		.on('end', function() {
			// loop on itself only if there are sockets still connected
			if (connectionsArray.length) {
				pollingTimer = setTimeout(pollingLoop, POLLING_INTERVAL);
				updateSockets({
					messages: messages
				});
			} else {
				console.log('The server timer was stopped because there are no more socket connections on the app');
			}
		});
};

// creating a new websocket to keep the content updated without any AJAX request
io.sockets.on('connection', function(socket) {
	console.log('Number of connections:' + connectionsArray.length);
	// starting the loop only if at least there is one user connected
	if (!connectionsArray.length) {
		pollingLoop();
	}
	socket.on('disconnect', function() {
		var socketIndex = connectionsArray.indexOf(socket);
		console.log('socketID = %s got disconnected', socketIndex);
		if (~socketIndex) {
			connectionsArray.splice(socketIndex, 1);
		}
	});
	console.log('A new socket is connected!');
	connectionsArray.push(socket);
});

var updateSockets = function(data) {
	// adding the time of the last update
	data.time = new Date();
	console.log('Pushing new data to the clients connected ( connections amount = %s ) - %s', connectionsArray.length , data.time);
	// sending new data to all the sockets connected
	connectionsArray.forEach(function(tmpSocket) {
		tmpSocket.volatile.emit('notification', data);
	});
};
console.log('Please use your browser to navigate to http://localhost:3000');
