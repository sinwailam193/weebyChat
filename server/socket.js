var usernames = {}; //set object to contain all the users signing on.
var rooms = ['Lobby', 'Chat', 'Hottub', 'Weeb']; //the list of open rooms
var roomCapacity = { //this will contain which rooms the users are in
  Lobby: {},
  Chat: {},
  Hottub: {},
  Weeb: {}
};

module.exports = function(io){
  io.sockets.on('connection', function (socket) {

    socket.on('adduser', function(user){ //once user is in the chat page, the client will emit an 'adduser' event
      socket.username = user; //this will set who the user is in this socket connection
      socket.room = rooms[0]; //this set will set the lobby as the default room when user first log in
      usernames[user] = user; //this places the user into the object that contains all the users
      socket.join(rooms[0]); //the user will enter the lobby chat room
      roomCapacity[rooms[0]][user] = user; //this places the user into the lobby room
      socket.emit('updateChat', 'SERVER', 'Welcome ' + user + ', you have connected to the ' + rooms[0]); //this welcomes the user in this socket to the chat room
      socket.broadcast.to(rooms[0]).emit('updateChat', 'SERVER', user + ' has connected to this room'); //this broadcast to other users oustide this socket connection that the user joined this chat room
      socket.emit('updateRooms', rooms, roomCapacity, rooms[0]); //this tells client side to update the room the user is in and what is the current room capacity in each chat rooms
      socket.broadcast.emit('updateRooms', rooms, roomCapacity); //this tell other users' client to update their room capacities with the new user
    });

    socket.on('sendChat', function(data){ //this recieves the message that the user typed in and it will emit it to everyone that is in the same chat room
      io.sockets.in(socket.room).emit('updateChat', socket.username, data); 
    });

    socket.on('switchRoom', function(newroom){ //this listens for when users switches room
      socket.leave(socket.room); //this triggers when users leave the room
      delete roomCapacity[socket.room][socket.username]; //we delete the key/value inside the corresponded room
      socket.join(newroom); //user enters a new room
      roomCapacity[newroom][socket.username] = socket.username; //we add the new key/value to the newroom that the enter joined
      socket.emit('updateChat', 'SERVER', 'you have connected to the '+ newroom); //this tells the user in the socket connection that he has joined a new room
      socket.broadcast.to(socket.room).emit('updateChat', 'SERVER', socket.username+' has left this room'); //this tells other users in the previous room that this user has left the room
      socket.room = newroom; //set the room that the user is in to the new room
      socket.broadcast.to(newroom).emit('updateChat', 'SERVER', socket.username+' has joined this room'); //this emits to all the users in the room that this user has joined
      socket.emit('updateRooms', rooms, roomCapacity, newroom); //this tells the client side of this user to update the room capacity and who is in the room
      socket.broadcast.emit('updateRooms', rooms, roomCapacity); //this broadcast to all the users of what the new room capacties are for each room
    });

    socket.on('disconnect', function(){ //this event triggers when the user leaves the website
      delete usernames[socket.username]; //this delete the user from the object that holds all the users
      socket.broadcast.emit('updateChat', 'SERVER', socket.username + ' has left the chat'); //this tells all the users that this user has left the website/chat
      socket.leave(socket.room); 
      delete roomCapacity[socket.room][socket.username];
      socket.broadcast.emit('updateRooms', rooms, roomCapacity); //this reupdates the current capacities of all the users in each room
    });
  });

}