import { Router } from 'express';
import swaggerUI from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const router = Router();

// Load Swagger documentation
const loadSwaggerSpec = () => {
  try {
    return load(readFileSync('./swagger/swagger.yaml', 'utf8'));
  } catch (error) {
    logger.error('Failed to load Swagger documentation:', error);
    process.exit(1);
  }
};

// API Documentation
router.use(
  '/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(loadSwaggerSpec(), {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  })
);

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

export default router;