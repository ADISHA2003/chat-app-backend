const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const server = createServer(app);

// CORS Setup
const allowedOrigin = "https://chat-app-frontend-bice-nu.vercel.app";

app.use(cors({
    origin: allowedOrigin, // Allow frontend URL
    methods: ['GET', 'POST'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type'], // Allow Content-Type header
    credentials: true // Allow credentials (cookies or authorization headers)
}));

// Handle CORS preflight requests explicitly
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200); // Send successful preflight response
});

// Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigin, // Allow frontend URL
        methods: ['GET', 'POST'], // Allow HTTP methods
        credentials: true // Allow credentials (cookies or authorization headers)
    }
});

// Handle socket connection
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
const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
