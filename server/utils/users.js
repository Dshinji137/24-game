class Users {
  constructor() {
    this.userList = [];
  }

  addUser(id, name, room) {
    var user = {
      id:id,
      name:name,
      room:room,
      ready: false,
      point:0,
      rounds: 0
    };
    this.userList.push(user);
    //console.log(this.userList);
    return user;
  }

  removeUser(id) {
    var removeUsers = this.userList.filter((user) => {
      return user.id === id;
    });

    this.userList = this.userList.filter((user) => {
      return user.id != id;
    });

    return removeUsers;
  }

  getUser(id) {
    var users = this.userList.filter((user) => {
      return user.id === id;
    });

    return users;
  }

  setUser(id,type,value) {
    this.userList = this.userList.map((item) => {
      if(item.id == id) {
        if(type == 'point') {
          var point = item[type];
          point += value;
          item[type] = point;
        } else {
          item[type] = value;
        }
      }
      return item;
    });

    //console.log(this.userList);
  }

  allReady(room) {
    var users = this.getUserList(room);
    for(var i = 0; i < users.length; i++) {
      if(!users[i].ready) {
        return false;
      }
    }
    return true;
  }

  nextRound(room,value) {
    var users = this.getUserList(room);
    for(var i = 0; i < users.length; i++) {
      if(users[i].rounds != value) {
        return false;
      }
    }

    return true;
  }

  getUserList(room) {
    //console.log(this.userList);
    var users = this.userList.filter((user) => {
      return user.room === room;
    });

    return users;
  }

  sortUsers(room) {
    var users = this.getUserList(room);
    users.sort(function(a,b) {return b.points-a.points;});
    return users;
  }

}

module.exports = {Users};
