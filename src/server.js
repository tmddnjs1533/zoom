import express from "express";
import WebSocket from "ws";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// app.listen(3000, handleListen)

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

function bufferToString(value) {
  return value.toString("utf8")
}

function parseMessage(str) {
  return JSON.parse(str);
}

const sockets = [];

wss.on("connection", (socket) => {
  console.log("Connected to Browser ");
  socket["nickname"] = "Anonymous";
  sockets.push(socket);
  socket.on("close", () => {
    console.log("DisConnected from the Browser x");
  });
  socket.on("message", (req) => {
    const message = parseMessage(bufferToString(req));
    switch (message.type) {
      case "message":
      sockets.forEach((aSocket) => {
        aSocket.send(`[${socket.nickname}] :${message.payload}`)
      });
        break;
      case "nickname":
        console.log("set nickname",message.payload)
        socket.nickname = message.payload
        break;
    }
  });
});

server.listen(3000, handleListen);
