# My Portfolio Page

A modern, full-stack portfolio website built with Next.js and FastAPI, designed to showcase your projects, skills, learning journey, and professional activities. This application features a beautiful, animated frontend with a powerful admin panel for content management.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations using Framer Motion
- 📝 **Content Management**: Full-featured admin panel to manage your portfolio content
- 🔒 **Secure Backend**: FastAPI-powered REST API with authentication
- 💾 **Database-Backed**: PostgreSQL database with Alembic migrations
- 🚀 **Easy Deployment**: Ready for deployment on Vercel (frontend) and other platforms (backend)
- 📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop viewing
- 🎯 **Dynamic Content**: Projects, skills, learning resources, and activities sections

## 🏗️ Architecture

This project follows a monorepo structure with separate frontend and backend applications:

```
my-profile-page/
├── frontend/          # Next.js 15 application
│   ├── app/          # App router pages and components
│   ├── public/       # Static assets
│   └── package.json
├── backend/          # FastAPI application
│   ├── app/         # API routes and business logic
│   ├── alembic/     # Database migrations
│   └── requirements.txt
└── README.md        # This file
```

### Tech Stack

**Frontend:**
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - SQL toolkit and ORM
- [Alembic](https://alembic.sqlalchemy.org/) - Database migration tool
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [Pydantic](https://docs.pydantic.dev/) - Data validation
- [Python-JOSE](https://github.com/mpdavis/python-jose) - JWT authentication

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) and npm
- **Python** (v3.9 or higher)
- **PostgreSQL** (v12 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/namerror/my-profile-page.git
   cd my-profile-page
   ```

2. **Set up the Backend**

   ```bash
   cd backend
   
   # Create a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create a .env file (see Backend Configuration below)
   cp .env.example .env  # Edit this file with your settings
   
   # Run database migrations
   alembic upgrade head
   ```

3. **Set up the Frontend**

   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Create a .env.local file (see Frontend Configuration below)
   cp .env.example .env.local  # Edit this file with your settings
   ```

### Configuration

#### Backend Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db

# CORS (comma-separated list of allowed origins)
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# JWT Authentication
SECRET_KEY=your-secret-key-here  # Generate with: openssl rand -hex 32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# [PLACEHOLDER: Add any other backend environment variables]
```

#### Frontend Configuration

Create a `.env.local` file in the `frontend/` directory:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# [PLACEHOLDER: Add any other frontend environment variables]
```

### Running Locally

1. **Start the Backend Server**

   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend API will be available at `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`

2. **Start the Frontend Development Server**

   In a new terminal:
   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 📖 Usage Guide

### For New Users (Creating Your Own Portfolio)

This repository is designed to be easily customizable for your own portfolio. Follow these steps:

1. **Fork and Clone**: Fork this repository and clone it to your local machine

2. **Update Personal Information**: 
   - Edit `frontend/app/page.tsx` to update the name, social links, and welcome message
   - Replace profile images in `frontend/public/`

3. **Configure the Database**: Set up your PostgreSQL database and update the `DATABASE_URL` in backend `.env`

4. **Run Migrations**: Initialize the database schema
   ```bash
   cd backend
   alembic upgrade head
   ```

5. **Add Your Content**: Use the admin panel to add:
   - Skills and skill categories
   - Projects (ongoing and completed)
   - Learning resources
   - Professional activities

6. **Customize Styling**: 
   - Edit `frontend/app/globals.css` for global styles
   - Modify Tailwind configuration in `frontend/tailwind.config.js` (if it exists)
   - Adjust component styles in individual component files

7. **Deploy**: Follow the deployment guide below

### Admin Panel

[PLACEHOLDER: Add details about accessing and using the admin panel, including:
- Default admin credentials or how to create an admin user
- Admin panel URL
- Features available in the admin panel
- How to manage different content types]

### Content Management

The platform supports the following content types:

- **Projects**: Showcase your completed and ongoing projects
- **Skills**: Organize your technical and soft skills by categories
- **Learning**: Track courses, tutorials, and learning resources
- **Activities**: Document professional activities, volunteer work, etc.
- **Contact**: Manage contact form submissions

## 🔧 Development

### Frontend Development

```bash
cd frontend

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run linter
npm run lint
```

### Backend Development

```bash
cd backend

# Run development server with auto-reload
uvicorn app.main:app --reload

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Database Migrations

When you make changes to database models in `backend/app/models_db.py`:

1. Generate a migration:
   ```bash
   alembic revision --autogenerate -m "Your migration message"
   ```

2. Review the generated migration in `backend/alembic/versions/`

3. Apply the migration:
   ```bash
   alembic upgrade head
   ```

## 🌐 Deployment

### Frontend Deployment (Vercel)

The frontend is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
4. Deploy!

Alternatively, you can deploy using the Vercel CLI:
```bash
cd frontend
vercel
```

### Backend Deployment

The backend can be deployed to various platforms. Here are some options:

#### Option 1: [PLACEHOLDER - Add specific deployment platform, e.g., Railway, Render, AWS, etc.]

[PLACEHOLDER: Add step-by-step deployment instructions for the backend]

#### Option 2: Docker

[PLACEHOLDER: Add Docker deployment instructions if Docker files are available]

#### Database Setup

[PLACEHOLDER: Add instructions for:
- Setting up production PostgreSQL database
- Running migrations in production
- Database backup recommendations]

## 🧪 Testing

[PLACEHOLDER: Add testing instructions when tests are available, including:
- How to run frontend tests
- How to run backend tests
- Test coverage information]

## 📁 Project Structure

### Frontend Structure

```
frontend/
├── app/
│   ├── about/              # About page
│   ├── activities/         # Activities page
│   ├── admin/              # Admin panel pages
│   ├── components/         # Reusable React components
│   ├── contact/            # Contact page
│   ├── projects/           # Projects page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── public/                 # Static assets
└── [config files]          # TypeScript, ESLint, Next.js configs
```

### Backend Structure

```
backend/
├── app/
│   ├── api/                # API route handlers
│   ├── db/                 # Database configuration
│   ├── crud.py             # Database operations
│   ├── main.py             # FastAPI application entry
│   ├── models.py           # Pydantic models
│   ├── models_db.py        # SQLAlchemy models
│   └── schemas.py          # API schemas
├── alembic/                # Database migrations
└── requirements.txt        # Python dependencies
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

[PLACEHOLDER: Add any specific contribution guidelines, code style requirements, or review process]

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Leon Long

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- FastAPI team for the excellent Python framework
- All contributors and users of this project

## 📞 Contact & Support

- **Author**: Leon Long
- **LinkedIn**: [Leon Long](https://www.linkedin.com/in/leon-long-89a595317/)
- **GitHub**: [@namerror](https://github.com/namerror/)

[PLACEHOLDER: Add information about:
- How to get support
- Where to report bugs
- Community channels (Discord, Slack, etc.)
- FAQ section if needed]

## 🗺️ Roadmap

[PLACEHOLDER: Add future features and improvements planned for this project, such as:
- Blog functionality
- Dark mode support
- Multi-language support
- Analytics integration
- Additional admin features
- etc.]

---

**Happy Coding!** 🚀 If you find this project useful, please consider giving it a ⭐ on GitHub!
