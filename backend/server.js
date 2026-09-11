const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.get("/", (req, res) => {
    res.send("Server is running");
});
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

let waitingRoom = [];

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 1. EXTRACTED LOGIC: A reusable function to find a partner
    const matchmake = () => {
        if (waitingRoom.length > 0) {
            const partner = waitingRoom.shift(); 
            socket.partnerId = partner.id;
            partner.partnerId = socket.id;

            socket.emit("match_success", "You are now chatting with a stranger!");
            partner.emit("match_success", "You are now chatting with a stranger!");
            console.log(`SUCCESS! Matched ${socket.id} with ${partner.id}`);
        } else {
            waitingRoom.push(socket);
            socket.emit("waiting", "Looking for a stranger...");
            console.log(`Nobody here. ${socket.id} is waiting...`);
        }
    };

    // Run matchmaking the moment they connect
    matchmake();

    // 2. THE SKIP EVENT: Handle the "Next" button
    socket.on("skip", () => {
        // If they were actively chatting, break up the chat
        if (socket.partnerId) {
            // Tell the old partner
            io.to(socket.partnerId).emit("partner_disconnected", "Stranger has disconnected.");
            
            // Wipe the old partner's memory
            const partnerSocket = io.sockets.sockets.get(socket.partnerId);
            if (partnerSocket) {
                partnerSocket.partnerId = null;
            }
            
            // Wipe our own memory
            socket.partnerId = null;
        } else {
            // If they were already waiting and just spammed "Next", pull them out so they don't duplicate
            waitingRoom = waitingRoom.filter((user) => user.id !== socket.id);
        }

        // Put them back into the matchmaking machine!
        matchmake();
    });

    socket.on("chat_message", (messageText) => {
        if (socket.partnerId) {
            io.to(socket.partnerId).emit("chat_message", messageText);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected.`);
        waitingRoom = waitingRoom.filter((waitingUser) => waitingUser.id !== socket.id);
        
        if (socket.partnerId) {
            io.to(socket.partnerId).emit("partner_disconnected", "Stranger has disconnected.");
            const partnerSocket = io.sockets.sockets.get(socket.partnerId);
            if (partnerSocket) {
                partnerSocket.partnerId = null;
            }
        }
    });
});

const PORT = process.env.PORT || 3006;

server.listen(PORT, () => {
    console.log(`Socket and express are running on port ${PORT}...`);
});