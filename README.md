# CompanyGrow

A smart workforce development platform that enables organizations to nurture employee growth through tailored training, intelligent project allocation, and real-time performance rewards.

## Features

- **Training Course Catalog**: Create and manage courses with filtering and enrollment
- **Employee Profiles**: Track skills, experience, and training progress
- **Skill-Based Project Allocation**: Intelligent matching of employees to projects
- **Badge/Token System**: Performance-based rewards with Stripe integration
- **Performance Analytics**: Comprehensive tracking and reporting
- **Admin Dashboard**: Central management panel

## Tech Stack

- **Frontend**: React.js with Redux Toolkit, Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Payment**: Stripe integration
- **File Storage**: Cloudinary
- **Authentication**: JWT

## Getting Started

1. **Prerequisites**
   - Node.js (v16 or higher)
   - PostgreSQL
   - npm or yarn

2. **Installation**
   ```bash
   # Install all dependencies
   npm run install:all
   
   # Set up environment variables
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database and API credentials
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb companygrow_dev
   
   # Run migrations
   cd backend && npm run db:migrate
   
   # Seed initial data
   npm run db:seed
   ```

4. **Development**
   ```bash
   # Run both frontend and backend
   npm run dev
   
   # Or run separately
   npm run dev:frontend  # Frontend only (port 3000)
   npm run dev:backend   # Backend only (port 5000)
   ```

## Project Structure

```
companygrow/
├── frontend/          # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/     # Redux store and slices
│   │   ├── services/  # API calls
│   │   └── utils/
├── backend/           # Express API server
│   ├── config/        # Database and app configuration
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Custom middleware
│   ├── models/        # Sequelize models
│   ├── routes/        # API routes
│   └── utils/         # Helper functions
└── README.md
```

## Environment Variables

Create `backend/.env` file with:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=companygrow_dev
DB_USER=postgres
DB_PASS=your_password
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/courses` - Get courses
- `GET /api/projects` - Get projects
- `GET /api/analytics` - Get analytics data
- `POST /api/payments` - Process payments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
