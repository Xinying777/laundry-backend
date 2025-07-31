const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 创建新的预约
router.post('/', async (req, res) => {
  console.log('Received body:', req.body);
  const { user_id, machine_id, start_time, end_time } = req.body;
  
  if (!user_id || !machine_id || !start_time || !end_time) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields: user_id, machine_id, start_time, end_time' 
    });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO reservations (user_id, machine_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [user_id, machine_id, start_time, end_time]
    );
    
    res.status(201).json({ 
      success: true,
      message: '预约创建成功', 
      data: { reservation: result.rows[0] }
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false,
      message: '数据库错误', 
      error: err.message 
    });
  }
});

// 获取所有预约
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservations ORDER BY created_at DESC');
    res.json({
      success: true,
      data: { reservations: result.rows }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: '数据库错误', 
      error: err.message 
    });
  }
});

// 确认预约
router.post('/confirm', async (req, res) => {
  const { reservation_id } = req.body;
  
  if (!reservation_id) {
    return res.status(400).json({
      success: false,
      message: 'Reservation ID is required'
    });
  }
  
  try {
    const result = await pool.query(
      `UPDATE reservations 
       SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [reservation_id]
    );
    
    if (result.rows.length > 0) {
      res.json({ 
        success: true,
        message: '预约已确认', 
        data: { reservation: result.rows[0] }
      });
    } else {
      res.status(404).json({
        success: false,
        message: '未找到该预约'
      });
    }
  } catch (err) {
    console.error('Confirm reservation error:', err);
    res.status(500).json({ 
      success: false,
      message: '确认预约时发生错误', 
      error: err.message 
    });
  }
});

module.exports = router;