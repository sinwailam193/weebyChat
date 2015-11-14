var socket = io.connect(); //connects the client side with the server

socket.on('connect', function(){
  // once socket is connected and we're on the page, we make a get request to the server to retireve user's username and then emit adduser to the server.
  $.get( "/userInfo", function( data ) {
    socket.emit('adduser', data);
  });
});

socket.on('updateRooms', function(rooms, capacity, roomName){

  if(roomName){ //this checks if the server sends a roomname to the client, if it does, it usually means the user joined a new room
    $('#subtitle').html(roomName); //this updates the current room that the user is in
    //this portion of the code updates the user who is in the room
    $('#users').html('');
    $.each(capacity[roomName], function(key, value){
      $('#users').append('<div>' + value + '</div>');
    });
  }

  if($('#subtitle').html()){ //when other users joined another room, this reupdate the current user of the status of the room
    var currentRoom = $('#subtitle').html();
    $('#users').html('');
    $.each(capacity[currentRoom], function(key, value){
      $('#users').append('<div>' + value + '</div>');
    });
  }

  //when other users changed rooms, this reupdates the capacities of each open chat rooms
  $('#rooms').html('');
  $.each(rooms, function(key, value) {
    $('#rooms').append('<div><a style="color: #008080" href="#" onclick="switchRoom(\''+value+'\')">' + value +  " " +  '(' + Object.keys(capacity[value]).length + ')</a></div>');
  });
});

socket.on('updateChat', function (username, data) {
  $('#chatArea').val($('#chatArea').val() + username + ": " + data + "\n");//this updates the text area of the chat whenever a user sends a message
});

function switchRoom(room){ //this function will trigger whenever a user wants to join a new room
  socket.emit('switchRoom', room);
}

$(function(){

  //this event triggers when the user clicks the send button and it will send the message that the user typed to the server
  $('#send-text').on('click', function() {
    if($('#inputChat').val()){
      var message = $('#inputChat').val();
      $('#inputChat').val('');
      socket.emit('sendChat', message);
    }
  });

  //this event triggers when the user hits the enter key and it will trigger the click event on send-text
  $('#inputChat').on('keypress', function(button) {
    if(button.which === 13) {
      $(this).blur(); //The inputChat element lose focus via keyboard commands, 'enter'.
      $('#send-text').focus().click(); //triggers the click event on the button send-text.
    }
  });
});


