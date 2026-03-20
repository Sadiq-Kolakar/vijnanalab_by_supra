import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import fs from 'fs';
import path from 'path';

// Route imports
import userRoutes from './routes/userRoutes';
import labRoutes from './routes/labRoutes';
import brainstormRoutes from './routes/brainstormRoutes';
import feedbackRoutes from './routes/feedbackRoutes';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// ─── Serve Auth Page with Injected Config ────────────────────
app.get('/auth', (req, res) => {
  const htmlPath = path.resolve('auth.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');

  const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };

  // Inject config before the closing </head> tag
  html = html.replace(
    '</head>',
    `<script>window.__FIREBASE_CONFIG__ = ${JSON.stringify(config)};</script>\n</head>`
  );

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/brainstorm', brainstormRoutes);
app.use('/api/feedback', feedbackRoutes);

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Vijnana Lab API is running 🔬',
    timestamp: new Date().toISOString()
  });
});

// ─── Default Route ───────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ 
    status: 'Running',
    version: '1.0.0',
    endpoints: [
      '/api/users',
      '/api/labs',
      '/api/brainstorm',
      '/api/feedback',
      '/api/health'
    ]
  });
});

// ─── Start Server ────────────────────────────────────────────
const startServer = async () => {
  // await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🔬 Vijnana Lab API Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
  });
};

startServer();
