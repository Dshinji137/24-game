const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const port = process.env.PORT || 4100;
const publicPath = path.join(__dirname,'../public');
const { Users } = require('./utils/users');
const { judgeValid, calculate, generate4, canGet24, generateQuestionList } = require('./utils/util');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection',(socket) => {
  //console.log('io connection');

  socket.on('newUser',(params,callback) => {
    var room = params.room;
    if(users.playing[room]) {
      callback('This room is not available');
    } else {
      callback();
    }
  });

  socket.on('getAvailableRoom',(callback) => {
    var rooms = [];
    for(var key in users.playing) {
      if(!users.playing[key]) {
        rooms.push(key);
      }
    }

    socket.emit('availableRoom',{rooms:rooms});
    callback();
  });

  socket.on('join',(params,callback) => {
    var name = params.name;
    var room = params.room;
    if(users.playing[room]) {
      callback("You cannot join this room")
    } else {
      users.playing[room] = false;

      socket.join(room);
      users.removeUser(socket.id);
      users.addUser(socket.id,name,room);
      io.to(room).emit('updateUserList',users.getUserList(room));
      socket.emit('welcomeMessage',{from:'Admin',text:'Welcome to 24 Game'});
      callback();
      //socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin',`${params.name} has joined`));
    }

  });

  socket.on('ready',(params,callback) => {
    var name = params.name;
    var room = params.room;
    users.setUser(socket.id,'ready',true);
    callback();
    //console.log(users.getUserList(room));
    if(users.allReady(room)) {
      users.count[room] = 0;
      users.numbersList[room] = generateQuestionList();
      users.index[room] = 0;
      users.currentNumbers[room] = users.numbersList[room][users.index[room]];
      users.rank[room] = 1;
      users.playing[room] = true;

      io.to(room).emit("newQuestion",{nums:users.currentNumbers[room]});
      var ind = users.index[room];
      users.index[room] = ind+1;
    }
  });

  socket.on('submitAnswer',(params,callback) => {
    var name = params.name;
    var room = params.room;
    var answer = params.answer;

    var judgeResult = judgeValid(answer,users.currentNumbers[room]);
    switch(judgeResult) {
      case "invalid operations":
        socket.emit('judgeResult',{
          result:"Your expression contains some invalid operations"
        });
        break;
      case "invalid characters":
        socket.emit('judgeResult',{
          result:"Your expression contains some invalid characters"
        });
        break;
      case "number inconsistent":
        socket.emit('judgeResult',{
          result:"You did not properly use all provided numbers"
        });
        break;
      case "parenthesis problem":
        socket.emit('judgeResult',{
          result:"Your use of parenthesis has some problem"
        });
        break;
      default:
        var result = calculate(answer);
        if(result == 24) {
          var bonus = 0;
          switch(users.rank[room]) {
            case 1:
              bonus = 3;
              break;
            case 2:
              bonus = 2;
              break;
            default:
              bonus = 1;
              break;
          }
          var val = users.rank[room];
          users.rank[room] = val+1;
          users.setUser(socket.id,'point',bonus)
          socket.emit('judgeResult',{
            result:"Congratulations! You are right"
          });
          io.to(room).emit('updateUserList',users.getUserList(room));
        } else {
          socket.emit('judgeResult',{
            result:`Your answer is wrong, ${answer} = ${result}`
          });
        }
        callback();
        break;
    }
  });

  socket.on('newRound',(params,callback) => {
    var name = params.name;
    var room = params.room;

    var cnt = users.count[room];
    users.count[room] = cnt+1;

    var userNumbers = users.getUserList(room).length
    if(users.count[room] >= userNumbers) {
      users.count[room] = 0;
      users.rank[room] = 1;
      if(users.index[room] < 1) {
        var nums = users.numbersList[room][users.index[room]];
        var ind = users.index[room];
        users.index[room] = ind+1;
        users.currentNumbers[room] = [nums[0],nums[1],nums[2],nums[3]];
        io.to(room).emit('newQuestion',{nums:users.currentNumbers[room]});
        //callback();
      } else {
        var rankedUsers = users.sortUsers(room);
        users.gameover(room);
        io.to(room).emit('roundFinish',{users: rankedUsers});
      }
    }
  });

  socket.on('disconnect',(params) => {
    var user = users.removeUser(socket.id);
    if(user.length > 0) {
      io.to(user[0].room).emit('updateUserList',users.getUserList(user[0].room));
      if(users.getUserList(user[0].room).length == 0) {
        var room = user[0].room;
        users.gameover(room);
      }
    }

  });
})

server.listen(port, () => {
  console.log(`Started up at port ${port}`);
});
