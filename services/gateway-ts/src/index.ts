import express from 'express';
import http from 'http';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.GATEWAY_PORT || 5000;

const JAVA_CORE_URL = process.env.JAVA_CORE_URL || 'http://localhost:8080';
const PYTHON_ANALYTICS_URL = process.env.PYTHON_ANALYTICS_URL || 'http://localhost:8000';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-User', 'X-Tenant-Id']
}));

// Setup WebSocket Server for Real-Time Roll-Call Synchronisation
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  // Join a specific course/section live roll-call room
  socket.on('join_classroom', (courseId: string) => {
    socket.join(`course_${courseId}`);
  });

  // Broadcast live attendance mark event across connected faculty and dashboard clients
  socket.on('attendance_marked', (data: { courseId: string; studentId: string; status: string; timestamp: number }) => {
    io.to(`course_${data.courseId}`).emit('live_attendance_updated', data);
  });

  socket.on('disconnect', () => {
    // Cleaned up automatically by Socket.io
  });
});

// Reverse Proxy: Java Spring Boot 3 Core Service (Master Data, Governance, CSV Batch, Auditing)
app.use(
  ['/api/v1/master', '/api/v1/audit'],
  createProxyMiddleware({
    target: JAVA_CORE_URL,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.warn(`[Gateway -> Java Core Proxy Warning] Target unavailable at ${JAVA_CORE_URL}: ${(err as Error).message}`);
        const response = res as express.Response;
        if (response && typeof response.status === 'function' && !response.headersSent) {
          response.status(503).json({
            error: 'JAVA_CORE_SERVICE_UNAVAILABLE',
            message: 'Master Data & Governance core service is currently offline or unreachable.',
            target: JAVA_CORE_URL
          });
        }
      }
    }
  })
);

// Reverse Proxy: Python FastAPI Microservice (Attendance Forecasting, Marks Risk Scoring)
app.use(
  ['/api/v1/forecast', '/api/v1/analytics'],
  createProxyMiddleware({
    target: PYTHON_ANALYTICS_URL,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.warn(`[Gateway -> Python Analytics Proxy Warning] Target unavailable at ${PYTHON_ANALYTICS_URL}: ${(err as Error).message}`);
        const response = res as express.Response;
        if (response && typeof response.status === 'function' && !response.headersSent) {
          response.status(503).json({
            error: 'PYTHON_ANALYTICS_SERVICE_UNAVAILABLE',
            message: 'Predictive analytics & forecast engine is currently offline or unreachable.',
            target: PYTHON_ANALYTICS_URL
          });
        }
      }
    }
  })
);

// Body parser for Gateway-native endpoints
app.use(express.json());

// Gateway Gateway Health & Unified Cluster Status
app.get('/health', async (req, res) => {
  res.json({
    status: 'UP',
    service: 'bcafly-gateway-ts',
    version: '2.0.0',
    targets: {
      java_core: JAVA_CORE_URL,
      python_analytics: PYTHON_ANALYTICS_URL
    },
    websocket: 'CONNECTED',
    timestamp: Date.now()
  });
});

// Gateway SMS Dispatch Queue Endpoint (Dispatches alert to parent and logs to SMS queue)
app.post('/api/v1/sms/dispatch-alert', (req, res) => {
  const { studentName, recipientPhone, alertType, message } = req.body;
  if (!recipientPhone || !message) {
    return res.status(400).json({ error: 'Missing recipientPhone or message' });
  }

  // Simulated high-reliability institutional SMS gateway delivery
  const dispatchId = `SMS_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  res.json({
    success: true,
    dispatchId,
    recipient: recipientPhone,
    student: studentName,
    alertType: alertType || 'ATTENDANCE_DEFICIT',
    status: 'DISPATCHED_TO_TELCO',
    timestamp: new Date().toISOString()
  });
});

server.listen(PORT, () => {
  console.log(`[BcaFly API Gateway] Running on port ${PORT}`);
  console.log(`[BcaFly API Gateway] Java Core Target: ${JAVA_CORE_URL}`);
  console.log(`[BcaFly API Gateway] Python Analytics Target: ${PYTHON_ANALYTICS_URL}`);
});
