// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" directory.
app.use(express.static('public'));

// Waiting queue for pairing sockets
let waitingSocket = null;

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  // Generate a random username for the session.
  socket.username = 'User' + Math.floor(Math.random() * 10000);

  // Pairing logic: If no one is waiting, put this user in the waiting slot.
  if (waitingSocket === null) {
    waitingSocket = socket;
    socket.partner = null;
    socket.emit('system', 'Waiting for a partner to join...');
  } else {
    // If there is a waiting user, pair them together.
    socket.partner = waitingSocket;
    waitingSocket.partner = socket;

    // Notify both users.
    socket.emit('system', `Connected with ${waitingSocket.username}`);
    waitingSocket.emit('system', `Connected with ${socket.username}`);

    // Clear waiting slot.
    waitingSocket = null;
  }

  // Relay chat messages to the partner.
  socket.on('chat message', (msg) => {
    if (socket.partner) {
      socket.partner.emit('chat message', { user: socket.username, text: msg });
    }
  });

  // Handle disconnects.
  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
    if (socket.partner) {
      socket.partner.emit('system', 'Your partner has disconnected. Refresh to find a new partner.');
      socket.partner.partner = null;
    }
    if (waitingSocket === socket) {
      waitingSocket = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
