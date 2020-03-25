const users = [];

//addUsers,removeUser,getUser,getUserInRoom
const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //VALIDATE
  if (!username || !room) {
    return {
      error: "Username and room are required"
    };
  }

  //buscarmos si hay un usuario igual en el mismo room
  const existingUser = users.find(
    user => user.room === room && user.username === username
  );

  if (existingUser) {
    return {
      error: "Username is in use!"
    };
  }

  //
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  //conseguimos el index si existe
  const index = users.findIndex(user => user.id === id);
  //si existe lo quitamos posicion y numero de que vamos a quitar
  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUsersInRoom = room => {
  return users.filter(user => user.room === room);
};

addUser({
  id: 22,
  username: "    Josue",
  room: "     america"
});

addUser({
  id: 23,
  username: " Juan",
  room: "     america"
});
addUser({
  id: 24,
  username: "Mike",
  room: "africa"
});

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
