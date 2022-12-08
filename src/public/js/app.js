const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form#message");
const nicknameForm = document.querySelector("form#nickname");
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

function makeMessage(type, payload) {
  if (!type || !payload) return "";
  return JSON.stringify({
    type,payload
  })
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("message",input.value) );
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  socket.send(makeMessage("nickname",input.value) );
  input.value = "";
}

messageForm.addEventListener("submit", handleMessageSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);
