# 🔗 LinkHub - Linktree Clone

A full-stack application that lets users create and manage their personal link hub, similar to Linktree. Built with React, Node.js/Express, and MongoDB Atlas.

## 🚀 Quick Start - Run Everything at Once

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed
- MongoDB Atlas account with a cluster created

### Setup (First Time Only)

1. **Configure MongoDB Atlas**
   - Update `config/.env` with your MongoDB connection string:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=database-name
   JWT_SECRET=your_jwt_secret_change_me_in_production
   ```

2. **Start Everything with One Command**
   ```bash
   docker-compose up
   ```

That's it! Your entire application will be running in seconds.

---

## 📱 Access Your Application

| Component | URL |
|-----------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:5000 |
| **Database** | MongoDB Atlas (Cloud) |

---

## 🎮 Common Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend
```

---

## ✨ Features
- User authentication (login/signup)
- Create, edit, and delete links
- Drag and drop to reorder links
- Hide/show link visibility
- Public profile pages
- User bio management
- JWT authentication
- Password encryption with bcrypt
- Cloud data storage with MongoDB Atlas

## 🏗️ Technologies Used
- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT, bcrypt
- **Containerization**: Docker, Docker Compose

## 📋 Project Structure
```
final-project/
├── backend/                 # Node.js/Express server
│   ├── routes/             # API endpoints
│   ├── models/             # Database schemas
│   ├── middleware/         # JWT verification
│   └── Dockerfile
├── frontend/               # React application
│   ├── src/
│   │   ├── pages/         # Login, Dashboard, Profile
│   │   └── App.js
│   └── Dockerfile
├── config/
│   ├── .env               # Environment variables (Git ignored)
│   └── .env.example       # Example configuration
├── docker-compose.yml     # Docker configuration
├── .gitignore             # Git ignore file
└── README.md              # This file
```

## 🔐 Security

- **Credentials Protected**: `config/.env` is in `.gitignore` and won't be exposed on GitHub
- **Password Hashing**: Passwords are hashed with bcrypt
- **JWT Authentication**: Secure token-based authentication (1-hour expiry)
- **User Isolation**: Each user can only access/modify their own data
- **MongoDB**: Credentials stored safely in environment variables

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Links Management
- `GET /api/links` - Get user's links (requires token)
- `POST /api/links` - Create new link (requires token)
- `PUT /api/links/:id` - Update link (requires token)
- `DELETE /api/links/:id` - Delete link (requires token)

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Verify connection
cd backend
npm run verify-db
```

### Ports Already in Use
```bash
docker-compose down
docker-compose up
```

### View Error Logs
```bash
docker-compose logs -f
```

---

## 📝 License
This project is open-source and available under the MIT License.