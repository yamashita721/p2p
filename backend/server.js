const express =require("express");
const http=require("http");
const {Server} = require("socket.io");

const app =express();


app.use(express.static("public"));

const server = http.createServer(app);

const io= new Server(server);  //CONNECTING SOCKET.IO WITH HTTP SERVER


let waitingRoom = [];
io.on("connection", (socket)=>{
    console.log(`User connected: ${socket.id}`);

    //  MATCHMAKING LOGIC 
    if (waitingRoom.length > 0) {
        const partner = waitingRoom.shift(); 

        socket.partnerId= partner.id;
        partner.partnerId= socket.id;

        socket.emit("match_success", "You are now chatting with a stranger!");
        partner.emit("match_success", "You are now chatting with a stranger!");
        
        console.log(`SUCCESS! Matched ${socket.id} with ${partner.id}`);
    } else {
        waitingRoom.push(socket);
        
        socket.emit("waiting", "Looking for a stranger...");
        console.log(`Nobody here. ${socket.id} is waiting for a stranger...`);
    }


    //  CHAT ROUTING LOGIC 
    socket.on("chat_message", (messageText) => {
        if (socket.partnerId) {
            io.to(socket.partnerId).emit("chat_message", messageText);
        }
    });



// MEMORY CLEAN UP LOGIC
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected.`);

        waitingRoom = waitingRoom.filter((waitingUser) => waitingUser.id !== socket.id);
            io.to(socket.partnerId).emit("partner_disconnected", "Stranger has disconnected.");
            const partnerSocket = io.sockets.sockets.get(socket.partnerId);
            if (partnerSocket) {
                partnerSocket.partnerId = null;
            }
    });


});

server.listen(3005, ()=>{
    console.log(`Socket and express are running at 3005...`);
})
