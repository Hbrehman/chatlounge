const socket = io();

const chatFrom = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomUsersEl = document.getElementById("users");
const roomNameEl = document.getElementById("room-name");
const leaveRoom = document.getElementById("leave-room");

const { username, room } = JSON.parse(localStorage.getItem("userInfo"));

// send users info to server
socket.emit("joinRoom", { username, room });
socket.on("message", (message) => {
  const markup = `<div class="message">
    <p class="meta">${message.username}<span> ${message.time}</span></p>
    <p class="text">
        ${message.message}
    </p>
  </div>`;
  chatMessages.insertAdjacentHTML("beforeend", markup);

  //   const div = document.createElement("div");
  //   div.classList.add('')
  console.log(message);
});

socket.on("roomUsers", (data) => {
  roomNameEl.textContent = data.room;
  let markup = "";
  roomUsersEl.innerHTML = "";
  data.users.forEach((user) => {
    markup += `<li>${user.username}</li>`;
  });
  roomUsersEl.insertAdjacentHTML("afterbegin", markup);

  console.log(data);
});

chatFrom.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.elements.msg.value;
  socket.emit("chatMessage", message);
  e.target.elements.msg.value = " ";
  e.target.elements.msg.focus();
});
