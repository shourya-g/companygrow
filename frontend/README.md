# 🚀 CompanyGrow - Smart Workforce Development Platform

A comprehensive workforce development platform with gamification, skill tracking, and project management. Built with React and Node.js.

## ✨ Features

- **Multi-role System**: Employee, Manager, Admin with role-based permissions
- **Learning Management**: Course creation, enrollment, and progress tracking
- **Gamification**: Badges, tokens, leaderboards, and achievements
- **Project Management**: Skill-based project assignments and tracking
- **Analytics**: Performance reviews and skills gap analysis
- **Payment Integration**: Stripe-powered course payments
- **Modern Auth**: Beautiful animated login/register interface

## 🛠️ Tech Stack

**Frontend**: React 19, Redux Toolkit, Tailwind CSS, Chart.js  
**Backend**: Node.js, Express, PostgreSQL, Sequelize  
**Additional**: JWT auth, Stripe payments, Cloudinary storage, WebSocket

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Stripe account (for payments)
- Cloudinary account (for file storage)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/companygrow.git
cd companygrow
npm run install:all
```

### 2. Environment Setup
Copy the environment templates and fill in your values:

```bash
# Copy environment templates
cp .env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the files with your actual values
# backend/.env - Add your database, JWT, Stripe, and Cloudinary credentials
# frontend/.env - Add your API URL and public keys
```

### 3. Database Setup
```bash
cd backend

# Create database
createdb companygrow_dev

# Run migrations and seed data
npm run db:reset
```

### 4. Start Development Servers
```bash
# From project root - starts both frontend and backend
npm run dev
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- **New Animated Auth**: http://localhost:3000/auth

## 🔑 Demo Credentials

After seeding, use these test accounts:

| Role | Email | Password |
|------|--------|----------|
| Admin | admin@companygrow.com | admin123 |
| Employee | john.doe@companygrow.com | password123 |

## 🎨 Authentication

The app now features a beautiful animated authentication interface at `/auth` with:
- Sliding panel animations
- Responsive design for mobile/desktop
- Social media login buttons (placeholder)
- Integrated demo account buttons
- Modern gradient overlays and smooth transitions

Regular login/register pages are still available at `/login` and `/register`.

## 🚨 Troubleshooting

**Database connection issues:**
```bash
# Make sure PostgreSQL is running
sudo service postgresql start  # Linux
brew services start postgresql  # macOS
```

**Port conflicts:**
- Change `PORT` in backend/.env
- Change port in frontend/.env `REACT_APP_API_URL`

**Migration errors:**
```bash
# Reset database
dropdb companygrow_dev
createdb companygrow_dev
npm run db:migrate
```

## 📁 Project Structure

```
companygrow/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/
│   │   │   └── AnimatedAuth.js    # New animated auth component
│   │   ├── pages/
│   │   │   └── AnimatedAuthPage.js # New auth page
│   │   ├── store/     # Redux
│   │   └── services/  # API calls
│   └── .env.example
├── backend/           # Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── .env.example
└── package.json       # Root workspace config
```

## 🔧 Available Scripts

```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend
npm run install:all      # Install all dependencies
npm run build           # Build frontend for production
```

## 📚 API Documentation

Key endpoints:
- `POST /api/auth/login` - Authentication
- `GET /api/courses` - List courses
- `POST /api/courseEnrollments` - Enroll in course
- `GET /api/projects` - List projects
- `GET /api/users/profile` - User profile

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---
