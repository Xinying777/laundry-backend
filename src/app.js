const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Laundry Backend is running!' });
});

// 路由
const authRoutes = require('./routes/auth');
const machineRoutes = require('./routes/machines');
const reservationRoutes = require('./routes/reservations');
const lostAndFoundRoutes = require('./routes/lostandfound');

app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/lostandfound', lostAndFoundRoutes);

// API信息端点
app.get('/api', (req, res) => {
  res.json({
    message: 'Laundry Reservation System API',
    version: '1.0.0',
    status: 'All routes active',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register'
      },
      machines: {
        getAllMachines: 'GET /api/machines',
        getMachine: 'GET /api/machines/:id',
        getAllAvailability: 'GET /api/machines/availability/all',
        getMachineAvailability: 'GET /api/machines/:id/availability'
      },
      reservations: {
        getAllReservations: 'GET /api/reservations',
        getUserReservations: 'GET /api/reservations/my',
        createReservation: 'POST /api/reservations',
        confirmReservation: 'POST /api/reservations/confirm',
        cancelReservation: 'DELETE /api/reservations/:id'
      },
      lostAndFound: {
        getAllItems: 'GET /api/lostandfound',
        getItem: 'GET /api/lostandfound/:id',
        reportItem: 'POST /api/lostandfound/report',
        updateStatus: 'PUT /api/lostandfound/:id/status',
        deleteItem: 'DELETE /api/lostandfound/:id'
      }
    }
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requested_url: req.originalUrl
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = app;