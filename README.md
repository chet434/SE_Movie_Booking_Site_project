# Movie Ticket Booking Site

A modern MERN stack web application for browsing movies, selecting seats, and booking tickets.

## Features

* **User Authentication**: Register, Login, and Profile Management (JWT-based).
* **Movie Discovery**: Browse currently showing and coming-soon movies. Filter by Location, Genre, and Language. Search by movie name.
* **Seat Selection**: Interactive 6x8 grid with visual representation of Available, Selected, Booked, Regular, and Premium seats. Enforces a maximum of 6 seats per booking.
* **Booking Flow**: View a detailed summary of selected seats and total amount (including convenience fees), then confirm the booking. (Includes a simulate payment failure option).
* **My Bookings**: Customers can view their upcoming and past bookings, including a printable ticket.
* **Admin Dashboard**: Comprehensive admin panel to manage Movies, Theatres, Shows, Bookings, and Users. View key metrics like Total Revenue, Total Bookings, etc.

## Technology Stack

* **Frontend**: React (Vite), React Router, React Context API, Bootstrap 5, Axios, React Icons, Custom CSS.
* **Backend**: Node.js, Express.js, MongoDB (Mongoose), JSON Web Tokens (JWT), bcryptjs.

## Getting Started

### Prerequisites

* Node.js (v18+)
* MongoDB (running locally or a MongoDB URI)

### Installation

1. Clone the repository.
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

### Configuration

Create a `.env` file in the `server` directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movie-ticket-booking
JWT_SECRET=your_jwt_secret_key_here
```

### Seeding the Database

To populate the database with a test admin, test customer, movies, theatres, and shows:
```bash
cd server
node seed.js
```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```
2. Start the frontend client (in a separate terminal):
   ```bash
   cd client
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

### Demo Accounts
- **Admin**: `admin@moviebook.com` / `admin123`
- **Customer**: `rahul@gmail.com` / `password123`
