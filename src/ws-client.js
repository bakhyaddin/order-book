const { io } = require('socket.io-client');

const socket = io('http://localhost:8080');

socket.on('connect', () => {
  console.log('Connected to Socket.IO server:', socket.id);

  socket.emit('subscribe', 'BTC-USD');

  socket.on('subscribed', (data) => {
    console.log('Subscribed to:', data.pair);
  });

  socket.on('newOrder', (message) => {
    console.log('New order received:', message);
  });

  socket.on('cancelOrder', (message) => {
    console.log('Cancel order received:', message);
  });

  socket.on('tradeExecuted', (message) => {
    console.log('Trade executed received:', message);
  });

  socket.on('unsubscribed', (data) => {
    console.log('Unsubscribed from:', data.pair);
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from Socket.IO server');
});

socket.on('error', (err) => {
  console.error('Socket.IO Error:', err);
});
