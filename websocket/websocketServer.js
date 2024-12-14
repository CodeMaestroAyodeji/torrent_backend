const WebSocket = require('ws');
const url = require('url');
const Torrent = require('../models/Torrent');

// Store active WebSocket clients
const clients = new Map();

const initializeWebSocket = (server) => {
  const wss = new WebSocket.Server({ noServer: true }); // Use `noServer` for manual HTTP upgrade handling

  // Upgrade HTTP requests to WebSocket connections
  server.on('upgrade', (req, socket, head) => {
    const parsedUrl = url.parse(req.url, true);
    const userId = parsedUrl.query.userId;

    if (!userId) {
      console.error('WebSocket upgrade attempted without userId');
      socket.destroy(); // Reject the connection if userId is missing
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', (ws, req) => {
    const parsedUrl = url.parse(req.url, true);
    const userId = parsedUrl.query.userId;
  
    if (userId) {
      console.log(`New WebSocket connection for userId: ${userId}`);
      clients.set(userId, ws);
  
      ws.on('close', () => {
        console.log(`Client disconnected: ${userId}`);
        clients.delete(userId);
      });
  
      ws.on('error', (error) => {
        console.error(`WebSocket error for userId ${userId}:`, error);
        clients.delete(userId);
      });
    }
  });
  
  console.log('WebSocket server initialized');
};

// Broadcast torrent progress updates to specific user
const broadcastTorrentProgress = async (userId, torrentId) => {
    const ws = clients.get(userId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log(`No active WebSocket connection for userId: ${userId}`);
      return;
    }
  
    // Fetch updated torrent data
    const torrent = await Torrent.findById(torrentId);
    if (torrent) {
      const progressData = {
        torrentId,
        progress: torrent.progress,
        status: torrent.status,
      };
      console.log(`Broadcasting to userId: ${userId}`, progressData);
      ws.send(JSON.stringify(progressData));  // Send progress update to the client
    } else {
      console.log(`No torrent found with id: ${torrentId}`);
    }
  };
  

module.exports = { initializeWebSocket, broadcastTorrentProgress };
