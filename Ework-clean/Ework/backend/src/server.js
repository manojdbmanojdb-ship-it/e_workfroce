import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';
import { initDatabase } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize persistent SQLite Database (users table, sign_in column)
initDatabase();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});

app.use(cors());
app.use(express.json());

// Serve static APK downloads directly from the backend as well
const downloadsDist = path.resolve(__dirname, '../../admin_dashboard/dist/downloads');
const downloadsPublic = path.resolve(__dirname, '../../admin_dashboard/public/downloads');
app.use('/downloads', express.static(downloadsDist));
app.use('/downloads', express.static(downloadsPublic));

// Inject io into every request
app.set('io', io);

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Ework / TaskRoom Backend API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      attendance: '/api/attendance',
      tasks: '/api/tasks',
      shifts: '/api/shifts',
      expenses: '/api/expenses',
      assets: '/api/assets',
      chat: '/api/chat/messages',
      sos: '/api/sos'
    },
    web_dashboard: 'http://localhost:5173'
  });
});

// Mount API routes
app.use('/api', apiRouter);

// WebSocket: Real-time GPS tracking & chat rooms
io.on('connection', (socket) => {
  console.log(`[Socket.io] Connected: ${socket.id}`);

  // Employee live GPS update
  socket.on('update_location', (payload) => {
    // { userId, latitude, longitude, speed, battery }
    io.emit('employee_moved', payload);
  });

  // Join task-specific chat room
  socket.on('join_task_room', (taskId) => {
    socket.join(`task_${taskId}`);
    console.log(`[Socket.io] ${socket.id} joined task room: task_${taskId}`);
  });

  socket.on('send_task_message', (msg) => {
    io.emit('new_message', msg);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Ework Backend API running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server active on ws://localhost:${PORT}`);
});
