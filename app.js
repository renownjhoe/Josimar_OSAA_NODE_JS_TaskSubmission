import express from 'express';
import { readFileSync } from 'fs';
import { load } from 'js-yaml'; // Correct import from js-yaml
import swaggerUI from 'swagger-ui-express';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import logger from './utils/logger.js';
import 'dotenv/config';
import mongoose from 'mongoose'; // Add missing mongoose import

// Create Express application
const app = express();

// Load Swagger documentation
const loadSwaggerSpec = () => {
  try {
    const fileContents = readFileSync('./swagger/swagger.yaml', 'utf8');
    return load(fileContents); // Use js-yaml's load method
  } catch (error) {
    logger.error('Failed to load Swagger documentation:', error);
    process.exit(1);
  }
};

const swaggerSpec = loadSwaggerSpec();

// Database Connection
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', 
  swaggerUI.serve, 
  swaggerUI.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  })
);

// Routes
app.use('/api/auth', authRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Server Configuration
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;