const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 添加失物招领报告（放在所有 /:id 路由之前，临时使用测试用户id 1）
router.post('/report', async (req, res) => {
  try {
    const { item_name, description, location_found, date_found, contact_info } = req.body;
    const userId = 1; // 临时使用测试用户id
    if (!item_name || !description || !location_found) {
      return res.status(400).json({
        success: false,
        message: 'Item name, description, and location found are required'
      });
    }
    let foundDate = date_found;
    if (foundDate) {
      const dateObj = new Date(foundDate);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
      }
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (dateObj > today) {
        return res.status(400).json({
          success: false,
          message: 'Found date cannot be in the future'
        });
      }
    } else {
      foundDate = new Date().toISOString().split('T')[0];
    }
    const insertQuery = `
      INSERT INTO lost_and_found (reporter_id, item_name, description, location_found, date_found, contact_info, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'active')
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [
      userId, 
      item_name, 
      description, 
      location_found, 
      foundDate, 
      contact_info
    ]);
    const fullQuery = `
      SELECT lf.*, u.name as reporter_name, u.student_id as reporter_student_id
      FROM lost_and_found lf
      JOIN users u ON lf.reporter_id = u.id
      WHERE lf.id = $1
    `;
    const fullResult = await pool.query(fullQuery, [result.rows[0].id]);
    res.status(201).json({
      success: true,
      message: 'Lost and found report created successfully',
      data: {
        item: fullResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Create lost and found report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating lost and found report'
    });
  }
});

// 获取所有失物招领信息
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT lf.*, u.name as reporter_name, u.student_id as reporter_student_id
      FROM lost_and_found lf
      JOIN users u ON lf.reporter_id = u.id
    `;
    const queryParams = [];
    if (status) {
      query += ' WHERE lf.status = $1';
      queryParams.push(status);
    }
    const limitParam = queryParams.length + 1;
    const offsetParam = queryParams.length + 2;
    query += ` ORDER BY lf.created_at DESC LIMIT $${limitParam} OFFSET $${offsetParam}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, queryParams);
    res.json({
      success: true,
      message: 'Lost and found items retrieved successfully',
      data: {
        items: result.rows,
        total: result.rows.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get lost and found items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving lost and found items'
    });
  }
});

// 获取特定失物招领信息
router.get('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const query = `
      SELECT lf.*, u.name as reporter_name, u.student_id as reporter_student_id
      FROM lost_and_found lf
      JOIN users u ON lf.reporter_id = u.id
      WHERE lf.id = $1
    `;
    const result = await pool.query(query, [itemId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lost and found item not found'
      });
    }
    res.json({
      success: true,
      message: 'Lost and found item retrieved successfully',
      data: {
        item: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Get lost and found item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving lost and found item'
    });
  }
});

// 更新失物招领状态（去除token验证，使用测试用户id 1）
router.put('/:id/status', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { status } = req.body;
    const userId = 1; // 临时使用测试用户id
    const validStatuses = ['active', 'claimed', 'expired'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid values: ' + validStatuses.join(', ')
      });
    }
    const checkQuery = `
      SELECT * FROM lost_and_found 
      WHERE id = $1 AND reporter_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [itemId, userId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lost and found item not found or access denied'
      });
    }
    const updateQuery = `
      UPDATE lost_and_found 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(updateQuery, [status, itemId]);
    res.json({
      success: true,
      message: 'Lost and found item status updated successfully',
      data: {
        item: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Update lost and found status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating lost and found status'
    });
  }
});

// 删除失物招领记录（去除token验证，使用测试用户id 1）
router.delete('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = 1; // 临时使用测试用户id
    const checkQuery = `
      SELECT * FROM lost_and_found 
      WHERE id = $1 AND reporter_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [itemId, userId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lost and found item not found or access denied'
      });
    }
    const deleteQuery = 'DELETE FROM lost_and_found WHERE id = $1 RETURNING *';
    const result = await pool.query(deleteQuery, [itemId]);
    res.json({
      success: true,
      message: 'Lost and found item deleted successfully',
      data: {
        deleted_item: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Delete lost and found item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting lost and found item'
    });
  }
});

module.exports = router;