const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 使用 GET 请求 - 通过 query parameters  
router.get('/login', async (req, res) => {
  // 从 query parameters 获取数据，不是 body
  const { student_id, password } = req.query;
  
  console.log('=== LOGIN DEBUG ===');
  console.log('Received student_id:', student_id);
  console.log('Received password:', password);

  if (!student_id || !password) {
    return res.status(400).json({
      success: false,
      message: 'Student ID and password are required'
    });
  }

  try {
    // 从数据库查找用户
    console.log('Querying database for user...');
    const result = await pool.query(
      'SELECT * FROM users WHERE student_id = $1',
      [student_id]
    );
    
    console.log('Database query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid student ID or password' 
      });
    }

    const user = result.rows[0];
    console.log('✅ User found:', {
      id: user.id,
      student_id: user.student_id,
      name: user.name
    });
    
    // 简单的明文密码比较 - 直接检查是否等于 "demo"
    console.log('Comparing passwords...');
    console.log('Input password:', password);
    
    // 直接比较密码是否为 "demo"
    const passwordMatch = (password === 'demo');
    console.log('Password match result (checking if password === "demo"):', passwordMatch);
    
    if (passwordMatch) {
      console.log('✅ Login successful');
      return res.json({ 
        success: true,
        message: 'Login successful', 
        data: {
          token: 'mock-jwt-token',
          user: {
            id: user.id,
            student_id: user.student_id,
            name: user.name
          }
        }
      });
    } else {
      console.log('❌ Password does not match');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid student ID or password' 
      });
    }

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

module.exports = router;