# Event Flow

This is an Event hall and room reservation app for a local community organization in Buffalo that needed a modern solution to their current processes of reserving their event hall. I am still actively adding new features to this web app, including email/text message notifications and agent automations, better mobile experience, internal chat, and ability to scale for other event halls and organizations.

The following info is still being updated and does not reflect all features of the app so far.

## Features
- **User Authentication**: I used nextauth as well as a 'Continue with Google' option for easier login experience.
- **Room Management**: The 'Owner' and adjustable 'admin' users can approve and reject (with comments) user room requests
- **Booking System**: Users can submit requests for specific rooms available at the property
- **Admin Panel**: Admins can review incoming requests on a dashboard
- **Calendar Integration**: FullCalendar integration showing approved and pending - only admins and the user who requested can see the details of their respective event
- **Real-time Updates**: The calendar updates when a submission is approved, and the event gets updated on the user's dashboard

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with Credentials provider
- **Calendar**: FullCalendar
- **Validation**: Zod
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or use Docker Compose)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd room-booking-app
```

2. Install dependencies:
```bash
npm install
```

3. Create the env files:
```bash
cp .env.example .env
```

Add the following to your .env file:
```
DATABASE_URL=postgresql://room:room@localhost:5432/roombooker?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=changeme
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=admin123
GOOGLE_CLIENT_ID=googleclientid
GOOGLE_CLIENT_SECRET=googleclientsecret
```

4. Start PostgreSQL (using Docker Compose):
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npx prisma migrate dev --name init
```

6. Generate Prisma client:
```bash
npm run prisma:generate
```

7. Seed the database:
```bash
npm run seed
```

8. Start the development server:
```bash
npm run dev
```
Go to `http://localhost:3000` 

## Usage

### Default Users

After seeding, you'll have:
- **Admin**: admin@example.com / admin123 (or your custom credentials from .env)
- **Regular User**: user@example.com / user123

### User Flow

1. **Register/Login**: Create an account or sign in
2. **Browse Rooms**: View available rooms from the dashboard
3. **Book a Room**: Select a room, choose date/time, and submit a booking request
4. **Track Status**: View your booking status (Pending/Approved/Rejected)

### Admin Flow

1. **Login as Admin**: Use admin credentials
2. **Review Requests**: Access the Admin panel to see pending requests
3. **Approve/Reject**: Approve requests or reject with comments
4. **Monitor Calendar**: View all bookings across rooms

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create room (admin only)
- `GET /api/rooms/[id]/availability` - Get room availability

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create booking request

### Admin
- `GET /api/admin/requests` - Get pending requests
- `POST /api/admin/requests/[id]/approve` - Approve request
- `POST /api/admin/requests/[id]/reject` - Reject request with comment

## Database Schema

### User
- Authentication and profile information
- Admin flag for permissions

### Room
- Room details and metadata

### Booking
- Booking requests with approval workflow
- Links users to rooms with time slots
- Status tracking (PENDING/APPROVED/REJECTED)

## Business Rules

- Only APPROVED bookings block time slots
- PENDING bookings appear on calendar but don't prevent conflicts
- Same-day bookings only (MVP limitation)
- Rejection requires a comment
- Overlap detection prevents double-booking

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Project Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (protected)/       # Protected user pages
│   ├── (admin)/           # Admin-only pages
│   └── api/               # API routes
├── src/
│   ├── components/        # React components
│   └── lib/               # Utility libraries
├── prisma/                # Database schema and migrations
├── styles/                # Global styles
└── types/                 # TypeScript type definitions
```

## License

This project is licensed under the MIT License.
