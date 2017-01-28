var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var messages = [];

var storeMessages = function(name, data) {
  messages.push({name: name, data: data});
  if(messages.length > 100){
    messages.shift();
  }
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  socket.on('join', function(name) {
    messages.forEach(function(message) {
      socket.emit('chat message', message.name + ": " + message.data);
    });

    socket.nickName = name;
    socket.broadcast.emit('users', name);
    Object.keys(io.sockets.sockets).forEach(function(savedSocket) {
      socket.emit('users', io.sockets.connected[savedSocket].nickName);
    });

    socket.broadcast.emit('chat message', name + " has connected.");
    socket.emit('chat message', name + " has connected.");
  });

  socket.on('chat message', function(msg) {
    socket.broadcast.emit('chat message', socket.nickName + ": " + msg);
    socket.emit('chat message', socket.nickName + ": " + msg);
    storeMessages(socket.nickName, msg);
  });

  socket.on('disconnect', function() {
    io.emit('remove user', socket.nickName);
    io.emit('chat message', socket.nickName + " has disconnected");
  });

});

http.listen(3010, function(){
  console.log('listening on *:3010');
});