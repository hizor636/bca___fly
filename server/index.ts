import express from 'express';
import cors from 'cors';
import { dbManager } from './db/database.js';
import { seedDatabase } from './db/seeder.js';
import { apiRouter } from './routes/apiRoutes.js';
import { dbStudioRouter } from './routes/dbStudioRoutes.js';

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
app.use('/api', apiRouter);
app.use('/api/db', dbStudioRouter);

// Root / Info
app.get('/', (req, res) => {
  res.json({
    name: 'BCAFly Database & API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      dbStudioStats: '/api/db/stats',
      dbStudioSchema: '/api/db/schema',
      dbStudioQuery: '/api/db/query',
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

// Initialize Database and Start Server
async function startServer() {
  try {
    console.log('🚀 Initializing BCAFly Database Engine...');
    await dbManager.init();
    seedDatabase(false);

    const stats = dbManager.getStats();
    console.log(`✅ Database ready: ${stats.tableCount} tables, ${stats.totalRows} rows.`);

    app.listen(PORT, () => {
      console.log(`📡 BCAFly Database Platform Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
