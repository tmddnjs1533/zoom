const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");
const socket = new WebSocket(`ws://${window.location.host}`); // "ws://localhost:3000"

socket.addEventListener("open", () => {
  console.log("Connected to Server v");
});

socket.addEventListener("message", (message) => {
  console.log("Just got this: ", message.data, " from the server");
  const li = document.createElement("li");
  li.textContent = message.data;
  messageList.appendChild(li);
});

socket.addEventListener("close", () => {
  console.log("DisConnected from Server x");
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(input.value);
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
