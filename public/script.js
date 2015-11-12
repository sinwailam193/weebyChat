var socket = io.connect();

socket.on('updateRooms', function(rooms, roomName){
  $('#subtitle').html('');
  $('#rooms').html('');
  $('#subtitle').html(roomName);
  $.each(rooms, function(key, value) {
    $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
  });
});

socket.on('updateChat', function (username, data) {
  $('#chatArea').val(username + ": " + data + "\n");
});

socket.on('addMessage', function(username, data){
  console.log(username, data);
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


