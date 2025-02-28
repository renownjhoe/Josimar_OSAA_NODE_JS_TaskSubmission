import express from 'express';
import 'dotenv/config';

// Local imports
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import telegramRoutes from './routes/telegramRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import { errorHandler } from './utils/errorHandler.js';

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Database connection
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Application routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/telegram', telegramRoutes);
app.use('/api/auth/admin', adminRoutes);
app.use('/api/auth/user', userRoutes);

// System routes
app.use(systemRoutes);

// Error handling (must be last middleware)
app.use(errorHandler);

// Server configuration
const server = app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

export default app;