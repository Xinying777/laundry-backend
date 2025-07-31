# Laundry Reservation System - Backend

A comprehensive backend solution for managing laundry machine reservations and lost & found items in dormitory settings.

##  Features

- **User Authentication**: Student login system with secure authentication
- **Machine Management**: Track washing machine availability and status
- **Reservation System**: Book and manage laundry machine reservations
- **Lost & Found**: Report and manage lost items in laundry facilities
- **RESTful APIs**: Complete REST API for frontend integration
- **Database Integration**: PostgreSQL database with proper schema design

##  Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (Mock implementation for testing)
- **Testing**: Jest, Supertest
- **Development**: Nodemon

##  Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd laundry-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_USER=your_username
   DB_HOST=localhost
   DB_NAME=laundry_system
   DB_PASSWORD=your_password
   DB_PORT=5432
   
   # Server Configuration
   PORT=3000
   
   # JWT Configuration (for future implementation)
   JWT_SECRET=your_jwt_secret
   ```

4. **Database Setup**
   
   Create the database and tables using the following SQL scripts:
   
   ```sql
   -- Create database
   CREATE DATABASE laundry_db;
   
   -- Connect to the database and create tables
   \c laundry_db;
   
   -- Users table
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     student_id VARCHAR(50) UNIQUE NOT NULL,
     name VARCHAR(100) NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Machines table
   CREATE TABLE machines (
     id SERIAL PRIMARY KEY,
     machine_number VARCHAR(20) UNIQUE NOT NULL,
     type VARCHAR(20) NOT NULL CHECK (type IN ('washer', 'dryer')),
     status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
     location VARCHAR(100),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Reservations table
   CREATE TABLE reservations (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     machine_id INTEGER REFERENCES machines(id) ON DELETE CASCADE,
     start_time TIMESTAMP NOT NULL,
     end_time TIMESTAMP NOT NULL,
     status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Lost and found table
   CREATE TABLE lost_and_found (
     id SERIAL PRIMARY KEY,
     reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     item_name VARCHAR(100) NOT NULL,
     description TEXT,
     location_found VARCHAR(100),
     date_found DATE,
     contact_info VARCHAR(255),
     status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'expired')),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Insert Sample Data**
   ```sql
   -- Sample user (password is 'demo')
   INSERT INTO users (student_id, name, password_hash) VALUES 
   ('12345', 'Test User', 'demo');
   
   -- Sample machines
   INSERT INTO machines (machine_number, type, status, location) VALUES 
   ('WM001', 'washer', 'available', 'Floor 1'),
   ('WM002', 'washer', 'occupied', 'Floor 1'),
   ('DR001', 'dryer', 'available', 'Floor 1');
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```
GET /health
```

### API Endpoints Overview
```
GET /api - View all available endpoints
```

### Quick Test Endpoints

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Login Test**
   ```bash
   curl "http://localhost:3000/api/auth/login?student_id=12345&password=demo"
   ```

3. **Get Machines**
   ```bash
   curl http://localhost:3000/api/machines
   ```

4. **Create Reservation**
   ```bash
   curl -X POST http://localhost:3000/api/reservations \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": 1,
       "machine_id": 1,
       "start_time": "2025-08-01T10:00:00Z",
       "end_time": "2025-08-01T11:00:00Z"
     }'
   ```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

### Manual Testing
You can test the APIs using:
- **Postman**: Import the API collection
- **curl**: Use the examples provided above
- **Browser**: For GET endpoints

## 📁 Project Structure

```
laundry-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── machines.js          # Machine management routes
│   │   ├── reservations.js      # Reservation routes
│   │   └── lostandfound.js      # Lost & found routes
│   └── app.js                   # Express app configuration
├── server.js                    # Server entry point
├── package.json                 # Dependencies and scripts
├── .env                         # Environment variables (create this)
└── README.md                    # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `DB_USER` | Database username | - |
| `DB_HOST` | Database host | localhost |
| `DB_NAME` | Database name | - |
| `DB_PASSWORD` | Database password | - |
| `DB_PORT` | Database port | 5433 |

### Database Schema

The application uses PostgreSQL with the following main tables:
- `users`: Student information and authentication
- `machines`: Washing machine inventory and status
- `reservations`: Booking records and schedules  
- `lost_and_found`: Lost item reports and management

## Current Limitations & Future Improvements

### Current State
- **Authentication**: Mock implementation for testing (password hardcoded as "demo")
- **Authorization**: Basic user identification without proper JWT implementation
- **Input Validation**: Basic validation, needs enhancement
- **Error Handling**: Basic error responses

### Planned Improvements
- [ ] Implement proper JWT authentication
- [ ] Add input validation middleware
- [ ] Add rate limiting
- [ ] Implement machine availability checking
- [ ] Add reservation conflict detection
- [ ] Implement automated tests
- [ ] Add API documentation with Swagger
- [ ] Add logging system
- [ ] Implement proper error handling middleware

## Known Issues

1. **Password Security**: Passwords stored in plain text for testing
2. **Token Management**: Mock JWT tokens without proper validation
3. **Concurrent Reservations**: No conflict detection for overlapping bookings

## Development Notes

### Database Connection
The application connects to PostgreSQL using the `pg` library. Connection status is logged on startup.

### Route Structure
- `/api/auth/*` - Authentication endpoints
- `/api/machines/*` - Machine management
- `/api/reservations/*` - Reservation system
- `/api/lostandfound/*` - Lost & found management

### Testing Strategy
- Unit tests for individual route handlers
- Integration tests for database operations
- API endpoint testing with Supertest


## License

This project is part of a capstone project assignment.

