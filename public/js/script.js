var socket = io.connect();

socket.on('connect', function(){
  // once socket is connected and we're on the page, we make a get request to the server to retireve user's username and then emit adduser to the server.
  $.get( "/userInfo", function( data ) {
    socket.emit('adduser', data);
  });
});

socket.on('updateRooms', function(rooms, capacity, roomName){
  if(roomName){
    $('#subtitle').html('');
    $('#subtitle').html(roomName);
  }
  $('#rooms').html('');
  $.each(rooms, function(key, value) {
    $('#rooms').append('<div><a style="color: #008080" href="#" onclick="switchRoom(\''+value+'\')">' + value +  " " +  '(' + capacity[value] + ')</a></div>');
  });
});

socket.on('updateChat', function (username, data) {
  $('#chatArea').val($('#chatArea').val() + username + ": " + data + "\n");
});

function switchRoom(room){
  socket.emit('switchRoom', room);
}

$(function(){
  $('#send-text').on('click', function() {
    if($('#inputChat').val()){
      var message = $('#inputChat').val();
      $('#inputChat').val('');
      socket.emit('sendChat', message);
    }
  });

  $('#inputChat').on('keypress', function(button) {
    if(button.which === 13) {
      $(this).blur(); //The inputChat element lose focus via keyboard commands, 'enter'.
      $('#send-text').focus().click(); //triggers the click event on the button send-text.
    }
  });
});


