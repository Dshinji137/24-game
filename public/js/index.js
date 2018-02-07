var socket = io();

var form = document.getElementById("user-login");
form.addEventListener("submit",function(e) {
  e.preventDefault();
  var name = document.getElementById("user-name").value;
  var room = document.getElementById("user-room").value;
  if(typeof(name) == 'string' && name.trim().length > 0 && typeof(room) == 'string' && room.trim().length > 0) {
      socket.emit('newUser',{room:room},function(e) {
        if(e) {
          alert(e);
        } else {
          window.location.href = "http://localhost:4100/game.html?"+"name="+name+"&"+"room="+room;
        }
      });
  } else {
    alert("invalid name or room");
  }
});
