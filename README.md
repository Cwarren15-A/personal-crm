# Personal CRM

A modern personal CRM application with Microsoft 365 integration, built with React and Node.js.

## Features

- **Contact Management**: Store and organize personal and professional contacts
- **Microsoft 365 Integration**: Sync with Outlook contacts, emails, and calendar
- **Interaction Tracking**: Log calls, meetings, emails, and other interactions
- **Notes & Tasks**: Keep track of important information and follow-ups
- **Dashboard**: Daily overview of recent activities and upcoming tasks
- **Modern UI**: Clean, responsive design built with React and Tailwind CSS

## Tech Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **TypeScript** - Type-safe development
- **Prisma** - Modern database ORM
- **PostgreSQL** - Primary database
- **Microsoft Graph API** - Microsoft 365 integration
- **JWT** - Authentication

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **MSAL** - Microsoft Authentication Library

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Microsoft 365 developer account (for integration)

## Quick Start

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd personal-crm
npm run install:all
```

2. **Set up environment variables**:
```bash
# Backend
cp packages/backend/env.example packages/backend/.env
# Edit packages/backend/.env with your configuration

# Frontend
cp packages/frontend/.env.example packages/frontend/.env
# Edit packages/frontend/.env with your configuration
```

3. **Set up database**:
```bash
cd packages/backend
npm run db:push
```

4. **Start development servers**:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Environment Configuration

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/personal_crm"

# Server
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here

# Microsoft 365 / Azure AD
MS_CLIENT_ID=your-microsoft-app-client-id
MS_CLIENT_SECRET=your-microsoft-app-client-secret
MS_TENANT_ID=your-microsoft-tenant-id
MS_REDIRECT_URI=http://localhost:3001/auth/microsoft/callback

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_MS_CLIENT_ID=your-microsoft-app-client-id
VITE_MS_TENANT_ID=your-microsoft-tenant-id
VITE_MS_REDIRECT_URI=http://localhost:5173
```

## Microsoft 365 Setup

1. **Register an application** in Azure Active Directory:
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to "Azure Active Directory" > "App registrations"
   - Click "New registration"
   - Set redirect URIs for both frontend and backend

2. **Configure API permissions**:
   - Microsoft Graph API permissions needed:
     - `User.Read` - Read user profile
     - `Contacts.Read` - Read contacts
     - `Contacts.ReadWrite` - Read and write contacts
     - `Calendars.Read` - Read calendars
     - `Mail.Read` - Read emails

3. **Get credentials**:
   - Copy Client ID, Client Secret, and Tenant ID
   - Update your environment variables

## Database Schema

The application uses the following main entities:

- **Users**: Application users
- **Contacts**: Personal and professional contacts
- **Interactions**: Logged communications (calls, emails, meetings)
- **Notes**: Additional information and observations
- **Tasks**: Follow-up items and reminders
- **Tags**: Categorization system for contacts

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Contacts
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `GET /api/contacts/:id` - Get contact details
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Interactions
- `GET /api/interactions` - List interactions
- `POST /api/interactions` - Log interaction
- `PUT /api/interactions/:id` - Update interaction
- `DELETE /api/interactions/:id` - Delete interaction

### Microsoft Integration
- `GET /api/microsoft/contacts` - Sync Microsoft contacts
- `GET /api/microsoft/calendar` - Get calendar events
- `GET /api/microsoft/emails` - Get recent emails

## Development

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Run both frontend and backend in development
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Build for production
npm run build

# Database operations
cd packages/backend
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

### Project Structure

```
personal-crm/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── routes/       # API routes
│   │   │   ├── controllers/  # Business logic
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── services/     # External services
│   │   │   ├── utils/        # Utility functions
│   │   │   └── index.ts      # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── pages/        # Page components
│       │   ├── hooks/        # Custom hooks
│       │   ├── services/     # API services
│       │   ├── stores/       # State management
│       │   ├── types/        # TypeScript types
│       │   └── utils/        # Utility functions
│       └── package.json
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or create an issue in the GitHub repository. 