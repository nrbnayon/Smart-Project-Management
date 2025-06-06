# Smart Project Management System

A comprehensive project management application built with Next.js and PostgreSQL that enables teams to track multiple projects, manage clients, monitor delivery phases, and maintain detailed contribution records with automatic calculations.

## Features

### Core Functionality
- **Multi-Project Tracking**: Manage multiple projects simultaneously with detailed project information
- **Client Management**: Comprehensive client database with contact information and project history
- **Delivery Phase Monitoring**: Track project phases from initiation to completion
- **Contribution Records**: Detailed logging of team member contributions with automatic calculations
- **Monthly Reporting**: Generate and export monthly project sheets to Excel and CSV formats

### Security & Authentication
- **Secure Authentication**: JWT-based authentication system with encrypted password storage
- **Role-Based Access**: Admin and user roles with different permission levels
- **Session Management**: Secure session handling with HTTP-only cookies

### Team Collaboration
- **Multi-User Support**: Allow teams to collaborate effectively on project tracking
- **User Management**: Admin controls for user creation and role assignment
- **Activity Tracking**: Monitor team member activities and contributions

## Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **PostgreSQL**: Robust relational database
- **Jose**: JWT token handling
- **bcryptjs**: Password hashing and validation

### Additional Libraries
- **SheetJS**: Excel file generation and export
- **Papa Parse**: CSV parsing and generation
- **SQL Template Literals**: Safe database queries

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- PostgreSQL 12.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-project-management.git
   cd smart-project-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/project_management
   
   # JWT Secret (generate a secure random string)
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   
   # Environment
   NODE_ENV=development
   ```

4. **Database Setup**
   
   Create the PostgreSQL database and tables:
   ```sql
   -- Create database
   CREATE DATABASE project_management;
   
   -- Connect to the database and create tables
   \c project_management;
   
   -- Users table
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     role VARCHAR(50) DEFAULT 'user',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Clients table
   CREATE TABLE clients (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255),
     phone VARCHAR(50),
     company VARCHAR(255),
     address TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Projects table
   CREATE TABLE projects (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     description TEXT,
     client_id INTEGER REFERENCES clients(id),
     status VARCHAR(50) DEFAULT 'active',
     start_date DATE,
     end_date DATE,
     budget DECIMAL(12,2),
     created_by INTEGER REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Project phases table
   CREATE TABLE project_phases (
     id SERIAL PRIMARY KEY,
     project_id INTEGER REFERENCES projects(id),
     name VARCHAR(255) NOT NULL,
     description TEXT,
     status VARCHAR(50) DEFAULT 'pending',
     start_date DATE,
     end_date DATE,
     completion_percentage INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Contributions table
   CREATE TABLE contributions (
     id SERIAL PRIMARY KEY,
     project_id INTEGER REFERENCES projects(id),
     user_id INTEGER REFERENCES users(id),
     phase_id INTEGER REFERENCES project_phases(id),
     description TEXT NOT NULL,
     hours_worked DECIMAL(5,2),
     contribution_date DATE DEFAULT CURRENT_DATE,
     amount DECIMAL(10,2),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Monthly sheets table
   CREATE TABLE monthly_sheets (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id),
     month INTEGER NOT NULL,
     year INTEGER NOT NULL,
     total_hours DECIMAL(8,2) DEFAULT 0,
     total_amount DECIMAL(12,2) DEFAULT 0,
     status VARCHAR(50) DEFAULT 'draft',
     generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     exported_at TIMESTAMP
   );
   ```

5. **Create Initial Admin User**
   ```sql
   -- Insert admin user (password should be hashed in production)
   INSERT INTO users (name, email, password, role) 
   VALUES ('Admin User', 'admin@example.com', '$2a$10$hashed_password_here', 'admin');
   ```

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Authentication
- Navigate to `/login` to access the login page
- Use your credentials to sign in
- Admin users have additional privileges for user management

### Project Management
- **Create Projects**: Add new projects with client information and details
- **Track Phases**: Break down projects into manageable phases
- **Log Contributions**: Record team member contributions with hours and descriptions
- **Monitor Progress**: View project status and completion percentages

### Monthly Reporting
- Generate monthly sheets showing contribution summaries
- Export reports in Excel or CSV format
- Track team productivity and project costs

### Admin Features
- User management and role assignment
- System-wide project oversight
- Advanced reporting and analytics

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Contributions
- `GET /api/contributions` - List contributions
- `POST /api/contributions` - Add contribution
- `PUT /api/contributions/[id]` - Update contribution
- `DELETE /api/contributions/[id]` - Delete contribution

### Export
- `GET /api/export/monthly-sheet` - Export monthly sheet
- `GET /api/export/project-report/[id]` - Export project report

## Database Schema

The application uses a PostgreSQL database with the following main tables:
- `users` - User accounts and authentication
- `clients` - Client information and contacts
- `projects` - Project details and metadata
- `project_phases` - Project phase breakdown
- `contributions` - Team member contribution records
- `monthly_sheets` - Generated monthly reports

## Security Features

- **Password Encryption**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **HTTP-Only Cookies**: Secure session management
- **Role-Based Access**: Different permission levels for admin and users
- **SQL Injection Protection**: Parameterized queries and input validation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write unit tests for new features
- Follow the existing code structure and naming conventions
- Update documentation for new features

## Deployment

### Production Environment Variables
```env
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

### Build and Deploy
```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

**Database Connection Issues**
- Verify PostgreSQL is running
- Check database credentials in `.env.local`
- Ensure database and tables are created

**Authentication Problems**
- Verify JWT_SECRET is set correctly
- Check cookie settings for HTTPS in production
- Ensure user exists in database

**Export Functionality**
- Verify file permissions for export directory
- Check browser settings for file downloads

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation for common solutions

## Changelog

### Version 1.0.0
- Initial release with core project management features
- User authentication and role management
- Project and client tracking
- Contribution logging and calculations
- Monthly report generation and export functionality
