const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express(); // Initialize the app first
connectDB();

// Apply CORS middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Allow frontend access

// Middleware
app.use(express.json());

// Import routes
const clientRoutes = require('./routes/clientRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const transactionDetailsRoutes = require('./routes/transactionDetailsRoutes');
const choiceRoutes = require('./routes/choiceRoutes');

// Use routes
app.use('/clients', clientRoutes);
app.use('/transactions', transactionRoutes);
app.use('/transactionDetails', transactionDetailsRoutes);
app.use('/choices', choiceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
