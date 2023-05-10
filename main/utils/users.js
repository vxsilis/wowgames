const users = [];

// Join user to chat
function userJoin(id, username, type, game, room) {
  
  type = (typeof b !== 'undefined') ?  type : null;
  game = (typeof b !== 'undefined') ?  game : null;
  // room = (typeof b !== 'undefined') ?  room : null;


  //id, username, type, game, room
  const user = { id, username, type, game, room };

  users.push(user);

  return user;
}


//update user with his preferences (what to play, how many people, where is he)
function updateUser(id, what, value){
  user[id].what = value; // ?????
  return user;
}



// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room).length;
}


module.exports = {
  userJoin,
  updateUser,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
