const socket = io();

const welcome = document.getElementById("welcome")
const room = document.getElementById("room")
const leaveBtn = document.getElementById("leaveBtn")

const welcomeForm = welcome.querySelector("#welcomeForm");
room.hidden = true;

let roomName;
let nickname;


function handleMessageSubmit(event) {
	event.preventDefault();
	const input = room.querySelector("#msg input");
	const value = input.value
	socket.emit("new_message",input.value,roomName,() => {
		addMessage(`You: ${value}`)
	});
	input.value = ""
}

function handleNicknameSubmit(event) {
	event.preventDefault();
	const input = room.querySelector("#name input");
	socket.emit("nickname",input.value);
}

function showRoom( ) {
	const h2 = document.querySelector("h2");
	h2.innerText = `Room#${roomName}`;
	room.hidden = false;
	welcome.hidden = true;

	const msgForm = room.querySelector("#msg");
	const nameForm = room.querySelector("#name");
	const nicknameSave = nameForm.querySelector("input");
	nicknameSave.value = nickname;
	msgForm.addEventListener("submit", handleMessageSubmit)
	nameForm.addEventListener("submit", handleNicknameSubmit)
}

function hiddenRoom() {
	room.hidden = true;
	welcome.hidden = false;
}

function addMessage(message) {
	const ul = room.querySelector("ul");
	const li = document.createElement("li");
	li.innerText = message;
	ul.appendChild(li)
}

function handleRoomSubmit(event) {
	event.preventDefault();
	const inputs = welcomeForm.elements;
	roomName = inputs["roomName"].value;
	nickname = inputs["nickname"].value;
	socket.emit("enter_room",{nickname:inputs["nickname"].value,roomName},showRoom);
	inputs["roomName"].value = ""
}

function handleLeaveBtnClick() {
	socket.emit("leave_room",roomName,hiddenRoom);
	roomName = "";
}

welcomeForm.addEventListener("submit", handleRoomSubmit)
leaveBtn.addEventListener("click",handleLeaveBtnClick)


socket.on("welcome",(user, newCount) => {
	addMessage(`${user} joined!`)
	const h2 = document.querySelector("h2");
	h2.innerText = `Room#${roomName} (${newCount})`;
});
socket.on("bye",(left, newCount) => {
	addMessage(`${left} left ㅠㅠ!`)
		const h2 = document.querySelector("h2");
	h2.innerText = `Room#${roomName} (${newCount})`;

})
socket.on("new_message",addMessage)
socket.on("room_change",(rooms) => {
	const roomList = welcome.querySelector("ul");
	roomList.innerHTML = "";
	if (rooms.length === 0) {
		return;
	}
	rooms.forEach((room) => {
		const li = document.createElement("li")
		li.innerText = room;
		roomList.append(li)
	})
})