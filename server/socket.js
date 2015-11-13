var usernames = {}; //set object to contain all the users signin on.
var rooms = ['Lobby', 'Chat', 'Hottub', 'Weeb']; //the list of open rooms
var roomCapacity = { //set the count of how many users are in each room
  Lobby: {},
  Chat: {},
  Hottub: {},
  Weeb: {}
};

module.exports = function(io){
  io.sockets.on('connection', function (socket) {

    socket.on('adduser', function(user){
      socket.username = user;
      socket.room = rooms[0];
      usernames[user] = user;
      socket.join(rooms[0]);
      roomCapacity[rooms[0]][user] = user; 
      socket.emit('updateChat', 'SERVER', 'Welcome ' + user + ', you have connected to the ' + rooms[0]);
      socket.broadcast.to(rooms[0]).emit('updateChat', 'SERVER', user + ' has connected to this room');
      socket.emit('updateRooms', rooms, roomCapacity, rooms[0]);
      socket.broadcast.emit('updateRooms', rooms, roomCapacity);
    });

    socket.on('sendChat', function(data){
      io.sockets.in(socket.room).emit('updateChat', socket.username, data);
    });

    socket.on('switchRoom', function(newroom){
      socket.leave(socket.room);
      delete roomCapacity[socket.room][socket.username];
      socket.join(newroom);
      roomCapacity[newroom][socket.username] = socket.username;
      socket.emit('updateChat', 'SERVER', 'you have connected to the '+ newroom);
      socket.broadcast.to(socket.room).emit('updateChat', 'SERVER', socket.username+' has left this room');
      socket.room = newroom;
      socket.broadcast.to(newroom).emit('updateChat', 'SERVER', socket.username+' has joined this room');
      socket.emit('updateRooms', rooms, roomCapacity, newroom);
      socket.broadcast.emit('updateRooms', rooms, roomCapacity);
    });

    socket.on('disconnect', function(){
      delete usernames[socket.username];
      io.sockets.emit('updateUsers', usernames);
      socket.broadcast.emit('updateChat', 'SERVER', socket.username + ' has left the chat');
      socket.leave(socket.room);
      delete roomCapacity[socket.room][socket.username];
      socket.broadcast.emit('updateRooms', rooms, roomCapacity);
    });
  });

}