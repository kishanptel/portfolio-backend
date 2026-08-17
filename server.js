import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// CORS Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  })
);

// Body Parser Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Kishan Patel Portfolio & Admin API is running.',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact',
      login: '/api/auth/login'
    }
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Kishan Patel Portfolio & Admin API',
    database: process.env.DATABASE_NAME || 'portfolio'
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.'
  });
});

// Start Server (when not running as a Vercel Serverless Function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Portfolio API Running]: http://localhost:${PORT}`);
    console.log(`[CORS Enabled]: All origins allowed`);
    console.log(`[Admin Endpoint]: http://localhost:${PORT}/api/auth/login`);
  });
}

export default app;
