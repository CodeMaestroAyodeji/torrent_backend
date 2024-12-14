// server.js  

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const { initializeWebSocket } = require('./websocket/websocketServer');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const torrentRoutes = require('./routes/torrent');
const adminRoutes = require('./routes/admin');
const userProfileRoutes = require('./routes/userProfile');
const subscriptionRoutes = require('./routes/subscription');
const paypalRoutes = require('./routes/paypal');
const paystackRoutes = require('./routes/paystack');
const flutterwaveRoutes = require('./routes/flutterwave');

// Load environment variables
dotenv.config();

// Check if NODE_ENV is defined
if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV not defined');
}

// Connect to the database
connectDB()
  .then(() => {
    const app = express();
    const server = http.createServer(app); // Create an HTTP server for both Express and WebSocket

    // Middlewares
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(logger);

    // Test route
    app.get('/', (req, res) => {
      res.json({ message: 'API is running...' });
    });

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/torrents', torrentRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/subscriptions', subscriptionRoutes);
    app.use('/api/paypal', paypalRoutes);
    app.use('/api/paystack', paystackRoutes);
    app.use('/api/flutterwave', flutterwaveRoutes);
    app.use('/api/users/', userProfileRoutes);

    // Error handling middleware (put this last)
    app.use(errorHandler);

    // Initialize WebSocket server
    initializeWebSocket(server);

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  });
