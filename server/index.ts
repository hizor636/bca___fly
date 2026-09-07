import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { dbManager } from './store.js';
import { apiRouter } from './routes/apiRoutes.js';
import { userRoutes } from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const duration = (performance.now() - start).toFixed(1);
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api', apiRouter);

// Root / Info
app.get('/', (req, res) => {
  res.json({
    name: 'BCAFly API Server',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      courses: '/api/courses',
      students: '/api/students',
      faculty: '/api/faculty'
    }
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  try {
    await dbManager.init();
    app.listen(PORT, () => {
      console.log(`📡 BCAFly Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
