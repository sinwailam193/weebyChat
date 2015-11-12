var usernames = {};
var rooms = ['Lobby', 'Chat', 'Hottub', 'Coolchat'];

module.exports = function(io){
  //user = user.facebookUser.username || user.user.username;
  io.sockets.on('connection', function (socket) {

    socket.on('adduser', function(user){
      socket.username = user;
      socket.room = rooms[0];
      usernames[user] = user;
      socket.join(rooms[0]);
      socket.emit('updateChat', 'SERVER', 'Welcome ' + user + ', you have connected to the ' + rooms[0]);
      socket.broadcast.to(rooms[0]).emit('updateChat', 'SERVER', user + ' has connected to this room');
      socket.emit('updateRooms', rooms, rooms[0]);
    });

    socket.on('sendChat', function(data){
      io.sockets.in(socket.room).emit('updateChat', socket.username, data);
    });

    socket.on('switchRoom', function(newroom){
      socket.leave(socket.room);
      socket.join(newroom);
      socket.emit('updateChat', 'SERVER', 'you have connected to '+ newroom);
      socket.broadcast.to(socket.room).emit('updateChat', 'SERVER', socket.username+' has left this room');
      socket.room = newroom;
      socket.broadcast.to(newroom).emit('updateChat', 'SERVER', socket.username+' has joined this room');
      socket.emit('updateRooms', rooms, newroom);
    });

    socket.on('disconnect', function(){
      delete usernames[socket.username];
      io.sockets.emit('updateUsers', usernames);
      socket.broadcast.emit('updateChat', 'SERVER', socket.username + ' has disconnected');
      socket.leave(socket.room);
    });
  });

}