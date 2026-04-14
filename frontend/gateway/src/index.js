const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Basic Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:8001';
const EVENT_SERVICE = process.env.EVENT_SERVICE || 'http://localhost:8002';

// Register Proxy - Yahan hum path rewrite kar rahe hain taaki '/api/auth' hat jaye
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '', 
  },
  onError: (err, req, res) => {
    console.error('Proxy Error (Auth):', err);
    res.status(500).send('Proxy Error');
  }
}));

app.use('/api/events', createProxyMiddleware({
  target: EVENT_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/events': '',
  }
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', gateway: 'running' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway strictly listening on port ${PORT}`);
});
