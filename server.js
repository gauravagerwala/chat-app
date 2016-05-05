var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var multer = require("multer");


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    var finalName = file.originalname.split('.')[0]+'-'+Date.now()+'.'+file.originalname.split('.')[1];
    cb(null, finalName);
  }
})

var upload = multer({ storage: storage })
app.use(express.static(__dirname + '/public'));

//Sends current users to provided socket

function sendCurrentUsers (socket) {
	var info = clientInfo[socket.id];
	var users = [];

	if(typeof info === undefined){
		return;
	}

	Object.keys(clientInfo).forEach( function(socketId){
		var userInfo = clientInfo[socketId];
		if(info.room === userInfo.room){
			users.push(userInfo.name);
		}
	});
	socket.emit('message', {
			name: 'System',
			text: 'Current Users: ' + users.join(', '),
			timestamp: moment().valueOf()
		});
}

var clientInfo = {

};

io.on('connection', function(socket){
	console.log('User connected via socket.io');

	socket.on('disconnect', function () {
		var userData = clientInfo[socket.id];

		if(typeof userData !== 'undefined'){
			socket.leave(userData.room);
			io.to(userData.room).emit('message', {
				name: 'System',
				text: userData.name + ' left the room',
				timestamp: moment().valueOf()
			});
			delete clientInfo[socket.id];
		}
	});

	socket.on('joinRoom', function(req){
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', {
			name: 'System',
			text: req.name + ' joined room!',
			timestamp: moment().valueOf()
		});
	});

	socket.on('message', function(message){
		console.log('Message received: ' + message.text);

		if(message.text === '@currentUsers'){
			sendCurrentUsers(socket);
		}else{
			message.timestamp = moment.valueOf();
			io.to(clientInfo[socket.id].room).emit('message', message);
		}


	});

	socket.emit('message', {
		name: 'System',
		text: 'Welcome to the chat application',
		timestamp: moment().valueOf()
	});
});

app.post('/uploadFile',upload.single('uploadFile'),function(req,res,next){
		console.log("file uploaded -- "+req.file.originalname);
    io.to(req.body.room).emit('link',{
      name : req.body.name,
      fname : req.file.filename ,
      timestamp : moment.valueOf(),
      link : '/uploads/'+req.file.filename
    });
});

http.listen(PORT, function(){
	console.log('Server started');
});
