const express = require('express');
const app = express();
const { createServer } = require('http');
const server = createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');
const port = process.env.PORT || 3001;

// CORS Configuration
app.use(cors({
    origin: 'https://chat-app-frontend-bice-nu.vercel.app', // Allow your frontend domain
    methods: ['GET', 'POST', 'OPTIONS'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers if needed
}));

// Set up socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: 'https://chat-app-frontend-bice-nu.vercel.app', // Allow your frontend domain
        methods: ['GET', 'POST']
    }
});

// Handle socket events
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
        const messageData = { user: user, message: message };
        socket.to(room).emit("receive_msg", messageData); // Emit to room
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
