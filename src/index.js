const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
//bad-words
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUsersInRoom,
  getUser
} = require("./utils/users");
const app = express();
//creamos el servidor
const server = http.createServer(app);
//creamos el servidor
const io = socketio(server);
const port = process.env.PORT || 4000;
//para usar las plantillas
const publicDirectoryPath = path.join(__dirname, "../public");
//lo unimos
app.use(express.static(publicDirectoryPath));
app.use(express.json());

//io
io.on("connection", socket => {
  console.log("New  Web Socket connection");

  //join
  socket.on("join", ({ username, room }, callback) => {
    //socket da id para cada conexion
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    } //si hay error lo enviamos

    //join unirse
    //socket.emit enviar io.emit a todos socket.broadcast.emit a todos menos el que lo mando
    //io.to.emit manda a especifico room socket.broadcast.to.emit
    socket.join(user.room);
    //bienvenida
    //lo enviamos
    socket.emit("message", generateMessage("Admin", "Welcome!!"));
    //asi podemos mandar un mensaje a todos menos el que ingreso
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!!`)
      );
    //mostramos los usuarios en el room
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(room)
    });

    callback();
  });

  //
  //recibimos el mensaje
  socket.on("sendMessage", (msg, callback) => {
    const user = getUser(socket.id);
    //usaremos la libreria
    const filter = new Filter();
    //asi lo cancelamos
    if (filter.isProfane(msg)) {
      return callback("Profanity is not allowed");
    }
    //io es para enviarselo a todos los conectados
    io.to(user.room).emit("message", generateMessage(user.username, msg));
    //podemos usar un callback para enviarle datos de donde los recibimos
    callback();
  });
  //get location
  socket.on("sendLocation", (data, callback) => {
    const { lat, long } = data;
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${lat},longitude:${long}`
      )
    );
    callback("Location shared!!!!!");
  });

  //si se desconecta
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    //en este caso podemos usar io ya que como se desconecto no va recibir el mensahe
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left`)
      );
      //actualizamos los datos
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

//asi escucha el servidor que creamos
server.listen(port, () => {
  console.log(`running at port ${port}`);
});
