const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const moment = require("moment");

app.use(express.static(path.join(__dirname, "public")));

const io = socketio(server);
io.on("connection", (socket) => {
  // When user will join the room this event will get fired
  socket.on("joinRoom", ({ username, room }) => {
    // here we need to store the users data in our data structure
    const user = userJoined({ userId: socket.id, username, room });
    socket.join(user.room);

    socket.emit(
      "message",
      formatMessage("Chat Bot", `${user.username} welcome to ${user.room}`)
    );

    // Broadcasts to everyone apart from current user
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("Chat Bot", `${user.username} has joined the channel!`)
      );

    // when user sends a message broadcast it to users room
    socket.on("chatMessage", (chatMessage) => {
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit(
        "message",
        formatMessage(user.username, chatMessage)
      );
    });

    // Send room info to client
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("disconnect", () => {
    const user = leaveUser(socket.id);
    if (user) {
      // tell everyone that this user has left the channel
      io.to(user.room).emit(
        "message",
        formatMessage("Chat Bot", `${user.username} has left the channel!`)
      );
      // Send room info to client
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

function formatMessage(username, message) {
  return {
    username,
    message,
    time: moment().format("h:mm:a"),
  };
}

const users = [];

function userJoined(data) {
  users.push(data);
  return data;
}

function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}
function getCurrentUser(userId) {
  return users.find((user) => user.userId === userId);
}

function leaveUser(userId) {
  const userIndex = users.findIndex((user) => user.userId === userId);

  return users.splice(userIndex, 1)[0];
}
const port = process.env.PORT || 9000;
server.listen(port, console.log(`server running on port ${port}`));
