var socket = io.connect();

socket.on('connect', function(){
  // once socket is connected and we're on the page, we make a get reques to the server to retireve user's username and then emit add user to the server.
  $.get( "/userInfo", function( data ) {
    socket.emit('adduser', data);
  });
});

socket.on('updateRooms', function(rooms, capacity, roomName){
  console.log(capacity)
  if(roomName){
    $('#subtitle').html('');
    $('#subtitle').html(roomName);
  }
  $('#rooms').html('');
  $.each(rooms, function(key, value) {
    $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value +  " " +  '(' + capacity[value] + ')</a></div>');
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
});


