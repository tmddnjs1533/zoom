import express from "express";
import http from "http";
import {Server} from "socket.io"
const { instrument } = require("@socket.io/admin-ui");
// import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// app.listen(3000, handleListen)

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer,{
	 cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
})

function publicRooms() {
	const {sockets : {
		adapter:{sids,rooms}
	}} = wsServer
	const publicRooms = [];
	rooms.forEach((_,key) => {
		if (sids.get(key) === undefined) publicRooms.push(key)
	})
	return publicRooms;
}

function countRoom(roomName) {
	return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket => {
	console.log("Browser connection");
	socket["nickname"] = "anonymous"
	socket.onAny((event) => {
		console.log(`socket event:${event}`)
	})
	socket.on("enter_room", ({nickname,roomName},done) => {
		socket["nickname"] = nickname || "anonymous"
		socket.join(roomName)
		done();
		socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName))
		wsServer.sockets.emit("room_change", publicRooms())
	})
	socket.on("leave_room",(roomName,done) => {
		socket.leave(roomName);
		done();
		socket.to(roomName).emit("bye", socket.nickname, countRoom(roomName));
	})
	socket.on("disconnecting", () => {
		socket.rooms.forEach((room) => {
			socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
		})
	});
	socket.on("disconnect", () => {
		wsServer.sockets.emit("room_change", publicRooms())
	})
	socket.on("new_message", (msg,room,done) => {
		console.log('msg',msg)
		socket.to(room).emit("new_message",`${socket.nickname}: ${msg}`);
		done()
	})
	socket.on("nickname", nickname => socket["nickname"] = nickname)
})

// const wss = new WebSocket.Server({ server });
//
// function bufferToString(value) {
//   return value.toString("utf8")
// }
//
// function parseMessage(str) {
//   return JSON.parse(str);
// }
//
// const sockets = [];
//
// wss.on("connection", (socket) => {
//   console.log("Connected to Browser ");
//   socket["nickname"] = "Anonymous";
//   sockets.push(socket);
//   socket.on("close", () => {
//     console.log("DisConnected from the Browser x");
//   });
//   socket.on("message", (req) => {
//     const message = parseMessage(bufferToString(req));
//     switch (message.type) {
//       case "message":
//       sockets.forEach((aSocket) => {
//         aSocket.send(`[${socket.nickname}] :${message.payload}`)
//       });
//         break;
//       case "nickname":
//         console.log("set nickname",message.payload)
//         socket.nickname = message.payload
//         break;
//     }
//   });
// });

instrument(wsServer, {
  auth: false,
  mode: "development",
});


httpServer.listen(3000, handleListen);
