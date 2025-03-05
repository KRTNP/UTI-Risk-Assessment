# UTI Risk Assessment Web Application

A comprehensive web application for assessing the risk of Urinary Tract Infections using machine learning models.

## Features

- **AI-Powered Assessment**: Utilizes Random Forest and XGBoost models for UTI prediction
- **User Authentication**: Secure login and registration with Supabase Auth
- **Dashboard**: Visualize assessment history and statistics
- **Data Storage**: Secure PostgreSQL database with Supabase
- **Responsive Design**: Optimized for all screen sizes
- **Data Export**: Export assessment data as CSV

## Technology Stack

### Frontend
- Next.js 13 (App Router)
- Tailwind CSS
- React Hook Form
- Zod for validation
- Shadcn UI components
- Recharts for data visualization
- Zustand for state management

### Backend
- Supabase for database and authentication
- PostgreSQL with Row Level Security
- Next.js API Routes

## Setup Instructions

### Prerequisites

- Node.js 16+
- Supabase account

### Environment Configuration

1. Create a `.env` file in the root directory with the following settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the migration scripts in the `supabase/migrations` folder
   - Update the `.env` file with your Supabase credentials

4. Start the development server:

```bash
npm run dev
```

5. Access the application at http://localhost:3000

## Database Schema

The application uses the following tables:

1. **uti_predictions**: Stores all UTI risk assessments
2. **profiles**: Stores user profile information

Row Level Security (RLS) policies ensure that users can only access their own data.

## Authentication

The application uses Supabase Authentication with:
- Email/password authentication
- User roles (patient, doctor)
- Secure session management

## Deployment

The application can be deployed to Vercel:

1. Connect your GitHub repository to Vercel
2. Set the environment variables
3. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.