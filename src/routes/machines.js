const express = require('express');
const router = express.Router();
const { pool } = require('../config/database'); // 正确写法

// 获取所有洗衣机
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM machines');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: '数据库查询失败', error: err.message });
  }
});

// 获取单个洗衣机信息
router.get('/:id', async (req, res) => {
  try {
    const machineId = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM machines WHERE id = $1', [machineId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: '未找到该洗衣机' });
    }
  } catch (err) {
    res.status(500).json({ message: '数据库查询失败', error: err.message });
  }
});

// ...existing code for availability...

module.exports = router;