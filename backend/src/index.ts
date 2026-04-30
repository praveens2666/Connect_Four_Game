/**
 * index.ts — Express Server Entry Point
 * 
 * Starts the Connect Four AI backend server.
 * Configures CORS for frontend communication and mounts API routes.
 */

import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/game';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'https://yourusername.github.io',
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// --- Routes ---
app.use('/api', gameRoutes);

// --- Health check ---
app.get('/', (_req, res) => {
  res.json({
    name: 'Connect Four AI Backend',
    version: '1.0.0',
    endpoints: [
      'POST /api/move',
      'POST /api/reset',
      'GET  /api/state',
    ],
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`\n🎮 Connect Four AI Server running on http://localhost:${PORT}`);
  console.log(`   POST /api/move   — Make a move`);
  console.log(`   POST /api/reset  — Reset the game`);
  console.log(`   GET  /api/state  — Get current state\n`);
});
