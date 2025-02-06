const socket = io();

// DOM Elements
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

// Helper function to append messages
function appendMessage(message, className = '') {
  const messageElem = document.createElement('div');
  messageElem.className = `message ${className}`;
  messageElem.textContent = message;
  chatWindow.appendChild(messageElem);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Listen for incoming chat messages
socket.on('chat message', (data) => {
  appendMessage(`${data.user}: ${data.text}`, 'user-message');
});

// Listen for system messages
socket.on('system', (msg) => {
  appendMessage(`* ${msg}`, 'system-message');
});

// Handle form submission
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if (msg) {
    appendMessage(`Me: ${msg}`, 'my-message');
    socket.emit('chat message', msg);
    chatInput.value = '';
  }
});
