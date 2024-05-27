const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

const PORT = 3000 || process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botname = "Gigachat Bot";

// set static folders
app.use(express.static(path.join(__dirname, "public")));

//run when a client connects
io.on("connection", (socket) => {

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room)
    socket.join(user.room)

    //this is a welcome message
    socket.emit("message", formatMessage(botname, "welcome to chat cord")); // this is for a single client

    //broadcast when a user connects (when a client accept the client that is connecting)
    socket.broadcast.to(user.room).emit(
      "message",
      formatMessage(botname, `${user.username} has joined the chat`)
    );

    //send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  });

  //listen for chat message
  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id)

    io.to(user.room).emit("message", formatMessage(user.username, message));
  });

  //this runs when a client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id)

    if(user) {
      io.to(user.room).emit("message", formatMessage(botname, `${user.username} has left the chat`)); //this is to all the clients in general

      //send user and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }

  });
});

server.listen(PORT, () => {
  console.log("listening on port 3000");
});
