import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

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

// ─── Start Server ────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🔬 Vijnana Lab API Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
  });
};

startServer();
