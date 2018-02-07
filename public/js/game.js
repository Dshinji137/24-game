function getParams(str) {
  str = str.substring(1);
  var infos = str.split("&");
  var name = infos[0].split("=")[1];
  var room = infos[1].split("=")[1];
  var params = {};
  params['name'] = name;
  params['room'] = room;
  return params;
}

var socket = io();

socket.on('playing',function() {
  alert("The room is not available");
});

socket.on('connect', function() {
  var params = getParams(window.location.search);
  socket.emit('join', params, function(err) {
    if(err) {
      alert(err);
      document.getElementById('ready-button').disabled = true;
      document.getElementById('send-button').disabled = true;
      document.getElementById('leave-button').style.display = 'block';
    } else {
      //console.log('no error');
    }
  })
});

socket.on('welcomeMessage', function(message) {
});

socket.on("updateUserList", function(users) {
  var ol = jQuery('<ol></ol>');
  users.forEach((user) => {
    ol.append(jQuery('<li></li>').text(user.name + " " + user.point+"pts"));
  });
  jQuery('#users').html(ol);
})

socket.on('judgeResult', function(message) {
  document.getElementById("judge-answer").innerHTML = message.result;
});

socket.on('newQuestion',function(nums) {
  var numbers = "";
  for(var i = 0; i < 4; i++) {
    numbers += nums['nums'][i].toString()+",";
  }
  numbers = numbers.substring(0,numbers.length-1);
  document.getElementById("question-area").innerHTML = numbers;
  document.getElementById("judge-answer").innerHTML = "";

  var params = getParams(window.location.search);
  var seconds = 20;
  document.getElementById('send-button').disabled = false;

  var timer = setInterval(function() {
    document.getElementById('timer').innerHTML = seconds;
    seconds--;

    if(document.getElementById("judge-answer").innerHTML === "Congratulations! You are right") {
      clearInterval(timer);
      document.getElementById('send-button').disabled = true;
      socket.emit('newRound',params,function() {});
    }
    if(seconds < 0) {
      clearInterval(timer);
      //document.getElementById('send-button').disabled = true;
      socket.emit('newRound',params,function() {});
    }
  },1000)
});

socket.on("roundFinish",(infos) => {
  var rankedUsers = infos.users;
  var ol = jQuery('<ol></ol>');
  rankedUsers.forEach((user) => {
    ol.append(jQuery('<li></li>').text(user.name + " " + user.point+"pts"));
  });
  document.getElementById("send-button").disabled = true;
  jQuery('#modal-content').html(ol);
  document.getElementById('rank-modal').style.display = 'block';
  document.getElementById('leave-button').style.display = 'block';
})

var form = document.getElementById('expression-form');
form.addEventListener("submit",function(e) {
  e.preventDefault();
  var ele = document.getElementById('expression-input');
  //console.log(ele.value);
  var params = getParams(window.location.search);
  socket.emit('submitAnswer',{
    answer: ele.value,
    name: params.name,
    room: params.room,
  }, function() {
    // empty string
    ele.value = '';
  });
});

var ready = document.getElementById('ready-button');
ready.onclick = function() {
  var params = getParams(window.location.search);
  socket.emit('ready',params, function() {
    ready.disabled = true;
  });
};

var leave = document.getElementById('leave-button');
leave.onclick = function() {
  var home = "http://localhost:4100";
  window.location.replace(home);
}
