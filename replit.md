# Overview

LifePlan is an AI-powered personal planning web application that helps users organize their daily and monthly schedules with personalized recommendations. The app creates customized plans based on user profiles (work, hobbies, physical stats, location) and provides progress tracking across different timeframes. Built as a full-stack TypeScript application with React frontend and Express backend, it features user authentication, profile management, AI-generated daily/monthly plans, and comprehensive progress visualization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library, following "New York" design style
- **State Management**: React Context for authentication and language management, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling, supporting both light/dark themes
- **Internationalization**: Built-in support for English and Persian (RTL) languages
- **Design System**: Inspired by Notion and Linear with clean productivity-focused interfaces

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: JWT-based with access/refresh token pattern, bcrypt for password hashing
- **API Design**: RESTful endpoints organized by feature (auth, profile, plan, ai, contact)
- **Middleware**: Request logging, error handling, and token authentication middleware
- **File Structure**: Modular route handlers with separate service layers for AI integration

## Data Storage
- **Database**: SQLite with Drizzle ORM for type-safe database operations
- **Schema Design**: 
  - Users table for authentication
  - Profiles table for user preferences and physical stats
  - Daily plans table storing JSON-serialized schedule data
  - Messages table for contact form submissions
- **Data Relationships**: Foreign key constraints linking profiles and plans to users

## Authentication & Authorization
- **Strategy**: JWT access tokens (15min expiry) with refresh tokens (7 day expiry)
- **Security**: Token blacklisting for logout, password hashing with bcrypt
- **Session Management**: Client-side token storage with automatic refresh handling
- **Protected Routes**: Middleware-based route protection for authenticated endpoints

## AI Integration Architecture
- **Primary Provider**: DeepSeek API for plan generation with fallback to deterministic plans
- **Context Building**: User profile data transformed into structured prompts for AI
- **Plan Generation**: JSON-structured daily schedules with time blocks, task types, and descriptions
- **Fallback Strategy**: Sample plan generation when AI service unavailable

# External Dependencies

## Core Framework Dependencies
- **React**: UI framework with hooks and context
- **Express.js**: Backend web framework
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Frontend build tool and development server

## Database & ORM
- **SQLite**: Embedded database via better-sqlite3
- **Drizzle ORM**: Type-safe database operations and migrations
- **Drizzle Kit**: Database schema management and migrations

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component system
- **Lucide React**: Icon library
- **Recharts**: Data visualization for progress tracking

## Authentication & Security
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing
- **Zod**: Runtime type validation for API inputs

## State Management & Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Wouter**: Lightweight client-side routing

## AI & External APIs
- **DeepSeek API**: AI-powered plan generation (optional)
- **Axios**: HTTP client for external API calls

## Development & Build Tools
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **tsx**: TypeScript execution for development
- **cross-env**: Cross-platform environment variables

## Potential Future Integrations
- **Neon Database**: Could replace SQLite for production scaling
- **Hugging Face**: Alternative AI provider for plan generation
- **Additional AI Services**: OpenAI, Anthropic for enhanced personalization