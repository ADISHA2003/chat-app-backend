const express = require('express');
const app = express();
const { createServer } = require('http');
const server = createServer(app);
const cors = require('cors');
app.use(cors());

const { Server } = require('socket.io');
const port = 3001;

const io = new Server(server, {
    cors: {
        origin: ["http://192.168.29.247:3000"],
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // User joins a room
    socket.on("join_room", ({ user, room }) => {
        console.log(`${user} joined room: ${room}`);
        socket.join(room);

        // Notify others in the room
        socket.to(room).emit("user_joined", { user, room });
    });

    // User sends a message to the room
    socket.on("send_msg", ({ room, user, message }) => {
        // console.log(`Message from ${user} in room ${room}: ${message}`);
        const messageData = { user: user, message: message };
        socket.to(room).emit("receive_msg", messageData); // Emit to room
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);
    });
});


server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
