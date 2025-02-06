const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store connected users
let users = [];

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Assign a random username
  const username = `User${Math.floor(Math.random() * 1000)}`;
  users.push({ id: socket.id, username });

  // Notify the user
  socket.emit('system', `You are connected as ${username}`);
  socket.broadcast.emit('system', `${username} has joined the chat`);

  // Handle messages
  socket.on('chat message', (msg) => {
    io.emit('chat message', { user: username, text: msg });
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    users = users.filter((user) => user.id !== socket.id);
    io.emit('system', `${username} has left the chat`);
    console.log('A user disconnected');
  });
});

// Use Vercel's port or 3000 locally
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
