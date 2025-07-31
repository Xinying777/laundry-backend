-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 洗衣机表
CREATE TABLE machines (
    id SERIAL PRIMARY KEY,
    machine_number VARCHAR(10) UNIQUE NOT NULL, -- 'machine1', 'machine2'
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'occupied', 'maintenance'
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 预约表
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    machine_id INTEGER REFERENCES machines(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 失物招领表
CREATE TABLE lost_and_found (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id),
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    location_found VARCHAR(100),
    date_found DATE,
    status VARCHAR(20) DEFAULT 'active',
    contact_info VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认洗衣机数据
INSERT INTO machines (machine_number, location, status) VALUES 
('Machine 1', 'Laundry Room A', 'available'),
('Machine 2', 'Laundry Room A', 'available')
ON CONFLICT DO NOTHING;

-- 插入测试用户 (学号和密码都为 'demo')
INSERT INTO users (student_id, password, name, email) VALUES 
('demo', 'demo', 'Test User', 'test@university.edu')
ON CONFLICT (student_id) DO NOTHING;