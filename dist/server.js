"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
const waitingPlayers = [];
const rooms = {};
const playerCount = 4;
app.prepare().then(() => {
    const httpServer = (0, http_1.createServer)((req, res) => {
        const parsedUrl = (0, url_1.parse)(req.url, true);
        handle(req, res, parsedUrl);
    });
    const io = new socket_io_1.Server(httpServer);
    io.on("connection", (socket) => {
        console.log("A client connected");
        const playerName = socket.handshake.query.name;
        waitingPlayers.push({ socket, playerName });
        console.log(`${playerName}さんが入りました！いま${waitingPlayers.length}人が見ていますよ`);
        io.emit("playerListChanged", waitingPlayers.map((player) => player.playerName));
        if (waitingPlayers.length >= playerCount) {
            const roomId = "room" + Date.now();
            const room = { players: waitingPlayers.splice(0, 4), result: [] };
            io.emit("playerListChanged", waitingPlayers.map((player) => player.playerName));
            rooms[roomId] = room;
            room.players.forEach((player) => {
                player.socket.join(roomId);
                console.log(`${player.playerName}がルームに参加しました: ${roomId}`);
            });
            io.emit("matched", roomId);
            const results = rooms[roomId].players.map((player) => ({
                socketId: player.socket.id,
                playerName: player.playerName,
                dice: player.dice,
            }));
            io.to(roomId).emit("result", results);
        }
        socket.on("roll dice", ({ socketId, dice, roomId }) => {
            const player = rooms[roomId].players.find((player) => player.socket.id === socketId);
            if (!player)
                return;
            player.dice = dice;
            console.log(`${player.playerName}がサイコロを振りました：${dice}`);
            console.log(rooms[roomId].players);
            const result = rooms[roomId].players.map((player) => ({
                socketId: player.socket.id,
                playerName: player.playerName,
                dice: player.dice,
            }));
            io.to(roomId).emit("result", result);
        });
        socket.on("disconnect", () => {
            console.log("A client disconnected");
            const index = waitingPlayers.findIndex((p) => p.socket === socket);
            if (index !== -1)
                waitingPlayers.splice(index, 1);
            console.log(`ぬけました！いま${waitingPlayers.length}人が見ていますよ`);
            io.emit("playerListChanged", waitingPlayers.map((player) => player.playerName));
        });
    });
    httpServer
        .once("error", (err) => {
        console.error(err);
        process.exit(1);
    })
        .listen(port, () => {
        console.log(`> Server listening at http://localhost:${port} as ${dev ? "development" : process.env.NODE_ENV}`);
    });
});
