var socket = io();

var create = document.getElementById("create-room");
create.addEventListener("submit",function(e) {
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

var join = document.getElementById('join-room');
join.addEventListener("submit",function(e) {
  e.preventDefault();
  var name = document.getElementById("user-name").value;
  var select = document.getElementById("available-room");
  var room = select.options[select.selectedIndex].value;

  if(typeof(name) == 'string' && name.trim().length > 0) {
      socket.emit('newUser',{room:room},function(e) {
        if(e) {
          alert(e);
        } else {
          //window.location.href = "http://localhost:4100/game.html?"+"name="+name+"&"+"room="+room;
          var toUrl = window.location.href+"?name="+name+"&room="+room;
          document.location.href = toUrl;
        }
      });
  } else {
    alert("invalid name");
  }
});

socket.on('connect',() => {
  socket.emit('getAvailableRoom',function() {});
});

socket.on('availableRoom',(infos) => {
  var rooms = infos['rooms'];
  //console.log(infos);
  var select = document.getElementById("available-room");
  rooms.forEach((room) => {
    select.options[select.options.length] = new Option(room,room);
  });

  if(rooms.length > 0) {
    //console.log(1);
    document.getElementById('join-button').disabled = false;
  } else {
    document.getElementById('join-button').disabled = true;
  }
});
