const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = e.target.elements.username.value;
  const room = e.target.elements.room.value;
  localStorage.setItem("userInfo", JSON.stringify({ username, room }));
  window.location.href = "chat.html";
});
