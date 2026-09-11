# Project Introduction

## Project Title

**Movie Ticket Booking Web Application**

## Overview

The Movie Ticket Booking Web Application is a web-based platform that allows users to search for movies, view theatre and showtime details, select seats, make a simulated payment, and receive a booking confirmation. The project is designed as a simplified version of platforms such as BookMyShow.

The application makes the movie-ticket booking process easier by replacing manual counter booking with an online system. Users can check available movies and shows from their preferred location, choose a theatre and suitable showtime, and reserve seats before visiting the theatre.

The system will also include an admin panel through which the administrator can manage movies, theatres, shows, seat layouts, and customer bookings.

## Problem Statement

Traditional ticket booking at theatre counters can require users to wait in long queues and may not provide clear information about movie timings, available seats, or ticket prices. It is also difficult for theatres to manually manage multiple movies, screens, showtimes, and bookings.

This project solves these problems by providing one centralized online platform where users can view available options and reserve tickets conveniently. It also helps administrators maintain movie and booking data in an organized manner.

## Project Objective

The main objective of this project is to design and develop a simple, user-friendly movie ticket booking system using the MERN stack.

The system should allow users to:

- Create an account and log in securely.
- Browse and search movies.
- Filter movies by location, theatre, genre, and language.
- View detailed information about a movie.
- Select a theatre, date, and showtime.
- Choose available seats from a visual seat layout.
- Complete a mock payment process.
- Receive a booking confirmation.
- View their previous bookings.

The system should also allow an administrator to manage the movies, theatres, shows, seats, and bookings.

## Target Users

### Customer/User

A customer uses the application to find movies, choose a show, select seats, and book tickets. They can also view their booking history.

### Administrator

The administrator manages the content and operations of the system. This includes adding movies, creating theatres and shows, setting seat availability, and viewing all bookings.

## Main Workflow

```text
User Registration/Login
        ↓
Browse or Search Movies
        ↓
View Movie Details
        ↓
Select Location, Theatre, Date, and Showtime
        ↓
Select Available Seats
        ↓
Mock Payment
        ↓
Booking Confirmation
        ↓
View Booking History
```

## Scope of the Project

The project will focus on the main ticket-booking process and administrative management. It will contain sample movie, theatre, and show data for demonstration purposes.

The project includes:

- User authentication
- Movie listing and search
- Movie filters
- Theatre, date, and showtime selection
- Interactive seat selection
- Booking confirmation
- Mock payment
- User booking history
- Admin management panel

The project will not include:

- A real payment gateway
- Live data from cinema chains
- Actual ticket delivery through email or SMS
- Real-time integration with external movie databases
- Multiple theatre-owner accounts

These features can be added later as future enhancements.

## Proposed Technology Stack

The application will be developed using the **MERN stack**:

- **MongoDB:** Stores user, movie, theatre, show, and booking data.
- **Express.js:** Handles backend routes and APIs.
- **React.js:** Builds the interactive user interface.
- **Node.js:** Runs the backend server.

Additional tools may include:

- **Mongoose:** Connects the Node.js backend with MongoDB.
- **JWT:** Handles user and admin authentication.
- **Bootstrap or CSS:** Styles the user interface.
- **GitHub:** Maintains source code and supports team collaboration.

## Expected Outcome

At the end of the project, the team will have a working web application where a user can complete a movie-ticket booking journey from browsing movies to receiving a booking confirmation.

The project will demonstrate important software engineering concepts such as user authentication, database management, CRUD operations, role-based access, frontend-backend integration, validation, and testing.

# Module 1 — User Management

## Purpose

This module handles user accounts, authentication, profile details, and access control.

There are two roles:

- **Customer:** Can browse movies, book tickets, and view their own bookings.
- **Admin:** Can manage movies, theatres, showtimes, seats, and all bookings.

---

## Features

### 1. User Registration

New customers can create an account.

**Registration fields:**

| Field | Type | Rules |
|---|---|---|
| Full name | Text | Required; minimum 2 characters |
| Email | Email | Required; must be unique |
| Mobile number | Text | Required; 10 digits |
| Password | Password | Required; minimum 6 characters |
| Confirm password | Password | Must match password |

**Process:**

1. User opens the registration page.
2. User enters their details.
3. System validates all inputs.
4. System checks whether the email already exists.
5. Password is encrypted using `bcrypt`.
6. User account is created with the default role `customer`.
7. User is redirected to the login page or logged in automatically.

**Error messages:**

- “All fields are required.”
- “Email is already registered.”
- “Enter a valid mobile number.”
- “Password must be at least 6 characters.”
- “Passwords do not match.”

---

### 2. User Login

Registered users can securely log in.

**Login fields:**

| Field | Type |
|---|---|
| Email | Email |
| Password | Password |

**Process:**

1. User enters email and password.
2. System finds the user by email.
3. System compares entered password with the encrypted password.
4. If correct, the backend creates a JWT token.
5. User is redirected to the home page.
6. The navbar displays the user name and logout option.

**Error message:**

```text
Invalid email or password.
```

---

### 3. Logout

Users can log out of their account.

**Process:**

1. User clicks **Logout**.
2. JWT token is removed from browser storage.
3. User is redirected to the home page.
4. Protected pages can no longer be accessed.

---

### 4. User Profile

A logged-in customer can view and edit basic profile information.

**Profile page shows:**

- Full name
- Email address
- Mobile number
- Account creation date
- Role
- Total bookings count

**Editable fields:**

- Full name
- Mobile number

Email should remain non-editable in the first version to keep the project simple.

---

### 5. Change Password

Users can change their password after logging in.

**Fields:**

| Field | Rule |
|---|---|
| Current password | Must match existing password |
| New password | Minimum 6 characters |
| Confirm new password | Must match new password |

After a successful change, display:

```text
Password updated successfully.
```

---

### 6. Role-Based Access Control

The system should restrict pages based on user role.

| Feature/Page | Customer | Admin |
|---|---:|---:|
| Browse movies | Yes | Yes |
| Book tickets | Yes | Yes |
| View own bookings | Yes | Yes |
| Manage movies | No | Yes |
| Manage theatres and shows | No | Yes |
| Manage seats | No | Yes |
| View all user bookings | No | Yes |

If a normal customer tries to open an admin page, show:

```text
Access denied. Admin permission is required.
```

---

## User Database Model

### `users` Collection

```js
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  password: String,        // encrypted using bcrypt
  role: String,            // "customer" or "admin"
  createdAt: Date,
  updatedAt: Date
}
```

### Example User Document

```js
{
  name: "Rahul Sharma",
  email: "rahul@gmail.com",
  phone: "9876543210",
  password: "$2b$10$encryptedPasswordValue",
  role: "customer",
  createdAt: "2026-08-21T10:00:00.000Z"
}
```

---

## Backend API Endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `GET` | `/api/auth/profile` | Get logged-in user profile | User/Admin |
| `PUT` | `/api/auth/profile` | Update name and phone number | User/Admin |
| `PUT` | `/api/auth/change-password` | Change password | User/Admin |
| `GET` | `/api/users` | View all users | Admin only |

---

## Frontend Pages/Components

```text
Register Page
Login Page
Profile Page
Change Password Page
Navbar with Login / Logout controls
Protected Route component
Admin Route component
```

---

## Required Packages

### Backend

```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv cors
```

### Frontend

```bash
npm install react-router-dom axios
```

---

## Security Rules

- Never store plain-text passwords.
- Encrypt passwords using `bcryptjs`.
- Use JWT tokens for protected APIs.
- Validate all fields on both frontend and backend.
- Do not allow customers to access admin APIs.
- Keep the JWT secret in the `.env` file, not inside source code.

Example `.env` variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_url
JWT_SECRET=your_secret_key
```

---

## Completion Checklist

- [ ] Customer can register.
- [ ] Duplicate email registration is blocked.
- [ ] Customer can log in and log out.
- [ ] Password is encrypted in MongoDB.
- [ ] Logged-in user can view and update profile.
- [ ] User can change password.
- [ ] Customer cannot access admin pages.
- [ ] Admin can access the admin dashboard.

# Module 2 — Movie Discovery

## Purpose

This module helps users find a movie, view its details, and choose a suitable theatre and showtime.

It includes:

- Browse movies
- Search movies
- Filter movies
- View movie details
- Select location, theatre, date, and showtime

---

## 1. Browse Movies

The home page displays all currently available movies as cards.

Each movie card should show:

- Movie poster
- Movie title
- Genre
- Language
- Duration
- Rating
- “Book Now” button

### Example Movie Card

```text
[ Movie Poster ]

Avengers: Endgame
Action • English
3h 1m • ⭐ 8.4/10

[ Book Now ]
```

Only movies with available shows should appear on the home page.

---

## 2. Search Movies

Users can search by movie title.

### Search Input

```text
Search movies by name...
```

### Search Behaviour

- Search starts when the user types a title.
- Matching movie cards are displayed.
- Search should be case-insensitive.
- If no results are found, show:

```text
No movies found.
```

### Examples

| User search | Expected result |
|---|---|
| `avenger` | Avengers: Endgame, Avengers: Infinity War |
| `pushpa` | Pushpa 2 |
| `action` | Not required for initial version; genre filter handles this |

---

## 3. Filter Movies

Users can narrow the movie list using filters.

### Required Filters

| Filter | Example values |
|---|---|
| Location | Mumbai, Delhi, Pune |
| Theatre | PVR Cinemas, INOX, Cinepolis |
| Genre | Action, Comedy, Drama, Horror, Romance |
| Language | English, Hindi, Telugu, Tamil |
| Date | Today, Tomorrow, Selected date |

### Filter Flow

```text
Select Location
      ↓
Show theatres available in that location
      ↓
Select theatre / genre / language / date
      ↓
Display matching movies and shows
```

### Important Rules

- Theatre choices should change based on the selected location.
- Movie results should change according to the selected filters.
- Users should be able to clear all filters.
- If no movie matches, display:

```text
No movies are available for the selected filters.
```

---

## 4. Movie Details Page

When a user clicks a movie card or **Book Now**, they are taken to the Movie Details page.

### Information to Display

| Field | Example |
|---|---|
| Poster | Movie image |
| Title | Avengers: Endgame |
| Genre | Action, Adventure, Sci-Fi |
| Language | English |
| Duration | 3h 1m |
| Rating | 8.4/10 |
| Release date | 26 April 2019 |
| Description | Short story summary |
| Trailer link | YouTube trailer |
| Available formats | 2D / 3D, if needed |

### Actions

- **Watch Trailer:** Opens the trailer in a new tab or modal.
- **Book Tickets:** Opens theatre and showtime selection.
- **Back to Movies:** Returns to the movie listing page.

### Keep It Simple

Use a manually entered YouTube trailer URL. Do not integrate a live trailer or movie-data API in the first version.

---

## 5. Location Selection

The user must choose a city/location before selecting a theatre.

### Suggested Locations for Demo

```text
Mumbai
Delhi
Pune
Bengaluru
Hyderabad
```

For the project demo, even 2–3 locations are enough.

### Behaviour

- Location can be selected from the home-page filter or Movie Details page.
- If a location is already selected, retain it while the user browses other movies.
- The system shows only theatres and shows in that selected location.

---

## 6. Theatre Selection

After selecting a movie and location, users see theatres where that movie is playing.

### Theatre Information

Each theatre option should show:

- Theatre name
- Location/city
- Available screen formats, such as 2D or 3D
- Available showtimes

### Example

```text
PVR Cinemas — Phoenix Mall, Mumbai

2D: 10:00 AM | 2:30 PM | 6:00 PM
3D: 12:00 PM | 8:30 PM
```

A user selects one showtime to continue to the seat-selection page.

---

## 7. Date and Showtime Selection

The user selects a date and available showtime.

### Date Selection

Display a simple horizontal date picker:

```text
Today | Tomorrow | 23 Aug | 24 Aug | 25 Aug
```

For the first version, show the next 5–7 days only.

### Showtime Details

Each showtime should include:

- Start time
- Format: 2D/3D
- Screen number
- Ticket price, if the same for all seats

### Rules

- Expired showtimes should not be shown.
- A showtime must belong to the selected movie and theatre.
- Selecting a showtime takes the user to the **Seat Selection** module.

---

## Database Design

### `movies` Collection

```js
{
  _id: ObjectId,
  title: String,
  poster: String,
  description: String,
  genre: [String],
  language: String,
  duration: String,
  rating: Number,
  releaseDate: Date,
  trailerUrl: String,
  isActive: Boolean
}
```

### `theatres` Collection

```js
{
  _id: ObjectId,
  name: String,
  location: String,
  address: String,
  screens: [
    {
      screenNumber: Number,
      format: String
    }
  ]
}
```

### `shows` Collection

```js
{
  _id: ObjectId,
  movie: ObjectId,
  theatre: ObjectId,
  screenNumber: Number,
  date: Date,
  startTime: String,
  format: String,
  ticketPrice: Number,
  bookedSeats: [String],
  isActive: Boolean
}
```

`movie` and `theatre` should store the related MongoDB IDs.

---

## Backend API Endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| `GET` | `/api/movies` | Get all active movies | Public |
| `GET` | `/api/movies/:id` | Get one movie’s details | Public |
| `GET` | `/api/movies/search?query=` | Search movies by title | Public |
| `GET` | `/api/movies/filter` | Filter by location, theatre, genre, language, or date | Public |
| `GET` | `/api/shows?movieId=&location=&date=` | Get available theatres and shows for a movie | Public |
| `GET` | `/api/shows/:id` | Get selected show details | Public |

### Example Filter Request

```text
GET /api/movies/filter?location=Mumbai&genre=Action&language=English
```

---

## Frontend Pages and Components

```text
Home Page
Movie List
Movie Card
Search Bar
Filter Panel
Movie Details Page
Location Selector
Theatre List
Date Picker
Showtime Selector
```

### Suggested React Component Structure

```text
pages/
  Home.jsx
  MovieDetails.jsx

components/
  SearchBar.jsx
  FilterPanel.jsx
  MovieCard.jsx
  LocationSelector.jsx
  TheatreShows.jsx
  DateSelector.jsx
  ShowtimeButton.jsx
```

---

## Validation Rules

- A selected location must exist in the system.
- A selected theatre must belong to the selected location.
- A selected show must match the selected movie, theatre, and date.
- Do not show inactive movies or inactive shows.
- Do not allow a user to continue to seat selection without choosing a showtime.

---

## Completion Checklist

- [ ] Home page displays active movies.
- [ ] Each movie card shows required information.
- [ ] Search works by movie title.
- [ ] Location, theatre, genre, language, and date filters work.
- [ ] Movie Details page displays full information.
- [ ] Trailer link opens correctly.
- [ ] Theatres are shown based on selected location.
- [ ] Available dates and showtimes are displayed.
- [ ] User can move from a selected showtime to seat selection.

# Module 3: Show & Seat Management

## Purpose

This module allows users to select a theatre, date, showtime, and available seats for a selected movie.

## Actors

- **Customer:** Selects a show and seats.
- **Admin:** Creates and manages theatres, screens, shows, and seat layouts.

## Features

### 1. Theatre Selection

After opening a movie, the user can view theatres where that movie is available.

Each theatre card should show:

- Theatre name
- Location
- Available showtimes
- Available seating classes, such as Regular and Premium

Example:

```text
Movie: Avengers
Location: Pune

INOX Phoenix Mall
10:00 AM | 1:30 PM | 5:00 PM | 9:00 PM
```

### 2. Date Selection

The user can choose a date for the movie show.

For the simple project version:

- Show only the next 5–7 days.
- Do not allow past dates.
- Default to today’s date.

Example:

```text
Today | Tomorrow | 23 Aug | 24 Aug | 25 Aug
```

### 3. Showtime Selection

After selecting a theatre and date, the user selects one available showtime.

Each showtime belongs to:

- One movie
- One theatre
- One screen
- One date
- One start time
- One ticket price

Example:

```text
INOX, Screen 2
Movie: Avengers
Date: 24 August 2026
Showtime: 5:00 PM
```

### 4. Seat Layout Display

After choosing a showtime, display the screen and seat layout.

Seat status:

| Status | Display |
|---|---|
| Available | White/green seat |
| Selected | Blue seat |
| Booked | Grey/red seat and disabled |
| Premium | Different colour or label |

Example layout:

```text
                 SCREEN

A1  A2  A3  A4  A5  A6  A7  A8
B1  B2  B3  B4  B5  B6  B7  B8
C1  C2  C3  C4  C5  C6  C7  C8

Regular: ₹150
Premium: ₹250
```

### 5. Seat Selection

The user can click available seats to select or deselect them.

Rules:

- Booked seats cannot be selected.
- Limit booking to a maximum of 6 seats per booking.
- Show selected seat numbers and total price immediately.
- Allow seats from different classes, but calculate the correct price for each.

Example:

```text
Selected seats: B3, B4, C3
Total amount: ₹550
```

### 6. Booking Validation

Before moving to payment, the system must verify:

- User is logged in.
- A theatre, date, and showtime are selected.
- At least one seat is selected.
- Selected seats are still available.
- Number of seats does not exceed the limit.

Important: check seat availability again on the backend when the booking is confirmed. This prevents two users from booking the same seat.

### 7. Admin Show Management

The admin can:

- Add a theatre
- Add screens to a theatre
- Define the seat layout for each screen
- Add a movie show
- Set show date and time
- Set ticket prices by seat class
- Edit or delete a show

## Suggested User Flow

```text
Movie Details
      ↓
Choose Location
      ↓
Choose Theatre
      ↓
Choose Date
      ↓
Choose Showtime
      ↓
Select Seats
      ↓
Review Selected Seats and Amount
      ↓
Proceed to Payment
```

## Required Data

### Theatre

```text
name
location
address
screens
```

### Screen

```text
screenName
theatreId
seatLayout
```

### Show

```text
movieId
theatreId
screenId
date
startTime
seatPrices
bookedSeats
```

### Seat

```text
seatNumber        // Example: A1
seatClass         // Regular or Premium
price
status            // Available or Booked
```

## Main Pages

1. **Show Selection Page**  
   Displays theatres, dates, and showtimes for a movie.

2. **Seat Selection Page**  
   Displays the screen, seat layout, selected seats, and total price.

3. **Admin Show Management Page**  
   Allows the admin to create and manage shows and seat layouts.

   # Module 4: Booking & Payment

## Purpose

This module converts the user’s selected show and seats into a confirmed booking. It calculates the amount, provides a mock payment process, saves the booking, and generates a ticket.

> Real payment integration is **not required**. The project will use a mock payment success/failure flow.

## Actors

- **Customer:** Reviews the booking, makes mock payment, and receives a ticket.
- **Admin:** Views bookings and payment status.

## Features

### 1. Booking Summary

Before payment, show a final summary of the selected booking.

Display:

- Movie name and poster
- Theatre and screen name
- Selected date and showtime
- Selected seat numbers
- Seat type and individual prices
- Convenience fee, if included
- Total payable amount

Example:

```text
Movie: Avengers
Theatre: INOX Phoenix Mall, Screen 2
Date: 24 August 2026
Showtime: 5:00 PM
Seats: B3, B4, C3

B3 - Regular   ₹150
B4 - Regular   ₹150
C3 - Premium   ₹250

Total Amount: ₹550
```

### 2. Price Calculation

The system calculates the total amount based on selected seat classes.

```text
Total Amount =
Sum of selected seat prices + convenience fee
```

For the basic version:

- Regular seat: ₹150
- Premium seat: ₹250
- Convenience fee: optional, for example ₹20
- No taxes, coupons, refunds, or discounts in the first version

Example:

```text
2 Regular seats = ₹300
1 Premium seat = ₹250
Convenience fee = ₹20

Final Total = ₹570
```

### 3. Customer Details

Collect minimal customer details before payment.

Required fields:

- Full name
- Email address
- Mobile number

Validation:

- Name cannot be empty.
- Email must be valid.
- Mobile number must contain 10 digits.
- Logged-in user details can be auto-filled.

### 4. Mock Payment Options

Show payment methods without connecting to any real payment service.

Payment options:

- UPI
- Credit/Debit Card
- Net Banking
- Cash at Counter

For every method, the user clicks **Pay Now** and the system displays a mock result.

```text
Payment Successful
Transaction ID: MOCK-20260824-001
```

Optional for demonstration:

- Add a **Payment Failed** button to demonstrate unsuccessful payment handling.
- On failed payment, do not create a confirmed booking.

### 5. Seat Availability Recheck

This is the most important backend feature.

When the user clicks **Pay Now**, the backend must check whether the selected seats are still available.

Rules:

- If seats are available, mark them as booked and create the booking.
- If even one seat was booked by another user, stop the booking and show an error.
- Do not mark seats as booked until mock payment is successful.

Example error:

```text
Sorry, seat B3 has just been booked by another user.
Please select seats again.
```

### 6. Booking Creation

After successful mock payment, create a booking record.

Each booking should contain:

```text
bookingId
userId
movieId
theatreId
screenId
showId
seatNumbers
totalAmount
paymentMethod
paymentStatus
bookingStatus
bookingDate
```

Example:

```text
Booking ID: BK-20260824-001
Payment Status: Paid
Booking Status: Confirmed
```

### 7. Ticket Confirmation

After creating the booking, redirect the user to a confirmation page.

The confirmation page should show:

- Booking ID
- Movie name
- Theatre and screen
- Date and showtime
- Seat numbers
- Total paid amount
- Payment method
- Booking status: Confirmed

Example:

```text
Booking Confirmed!

Booking ID: BK-20260824-001
Movie: Avengers
Theatre: INOX Phoenix Mall, Screen 2
Showtime: 24 August 2026, 5:00 PM
Seats: B3, B4, C3
Amount Paid: ₹570
```

### 8. Download or Print Ticket

For the simple version, provide:

- **Print Ticket** button using the browser print feature.
- Optional: **Download Ticket as PDF**.

A ticket can include a simple QR-code image later, but it is not required for the first version.

### 9. Booking Status

Each booking must have one of these statuses:

| Status | Meaning |
|---|---|
| `Pending` | Payment has not yet been completed. |
| `Confirmed` | Payment was successful and seats are booked. |
| `Failed` | Mock payment failed; seats remain available. |
| `Cancelled` | Optional future feature; booking is cancelled. |

For the first version, focus on `Confirmed` and `Failed`.

## User Flow

```text
Selected Seats
      ↓
Booking Summary
      ↓
Enter Customer Details
      ↓
Select Mock Payment Method
      ↓
Backend Rechecks Seat Availability
      ↓
Mock Payment Successful
      ↓
Create Booking + Mark Seats as Booked
      ↓
Show Ticket Confirmation
```

## Main Pages

1. **Booking Summary Page**  
   Shows movie, showtime, selected seats, customer details, and total amount.

2. **Mock Payment Page**  
   Lets the user select a payment method and complete mock payment.

3. **Booking Confirmation Page**  
   Displays the final ticket and booking ID.

## Important Validations

- User must select at least one seat.
- User must be logged in before payment.
- Customer details must be valid.
- Payment method must be selected.
- Selected seats must be available at confirmation time.
- The same seat cannot be booked twice for the same show.
- A failed payment must not create a confirmed booking.


# Module 5: Booking History & Admin Management

## Purpose

This module lets customers view their past bookings and gives the admin control over movies, theatres, shows, seats, and bookings.

## Actors

- **Customer:** Views their own booking history and ticket details.
- **Admin:** Manages the complete movie-ticket booking system.

---

## Part A: Booking History

### 1. My Bookings Page

After login, customers can open a **My Bookings** page.

For each booking, show:

- Booking ID
- Movie name and poster
- Theatre and screen
- Date and showtime
- Seat numbers
- Total amount
- Booking status
- Payment status

Example:

```text
Booking ID: BK-20260824-001
Movie: Avengers
Theatre: INOX Phoenix Mall, Screen 2
Show: 24 August 2026, 5:00 PM
Seats: B3, B4, C3
Amount: ₹570
Status: Confirmed
Payment: Paid
```

### 2. Booking Categories

Divide bookings into simple tabs or filters:

| Category | Meaning |
|---|---|
| Upcoming | Shows that have not happened yet. |
| Past | Shows whose date and time have passed. |
| Cancelled | Optional future feature. |

For the first version, implement **Upcoming** and **Past** bookings only.

### 3. Booking Details

When the user clicks a booking, show the complete ticket.

Include:

- Booking ID
- Customer name
- Movie name
- Theatre name, address, and screen
- Date and showtime
- Selected seats
- Number of tickets
- Amount paid
- Payment method
- Booking and payment status

### 4. Print Ticket

Provide a **Print Ticket** button.

For the basic project, this can use the browser print functionality. PDF download can be added later if needed.

### 5. Security Rule

A customer must only be able to view their own bookings.

```text
Customer A cannot access Customer B's booking using its booking ID.
```

---

## Part B: Admin Management

## 1. Admin Dashboard

After an admin logs in, display a dashboard with summary cards.

Example:

```text
Total Movies: 12
Total Theatres: 5
Total Shows: 30
Total Bookings: 120
Today's Revenue: ₹18,500
```

For a simple version, these values can be calculated directly from the database.

## 2. Movie Management

Admin can add, edit, view, and delete movies.

Movie fields:

```text
title
poster
description
genre
language
duration
rating
trailerLink
releaseDate
status
```

Movie status:

| Status | Meaning |
|---|---|
| Now Showing | Available for booking. |
| Coming Soon | Visible to users but cannot be booked. |
| Inactive | Hidden from users. |

## 3. Theatre Management

Admin can manage theatres and their basic details.

Theatre fields:

```text
name
location
address
city
numberOfScreens
```

Admin actions:

- Add theatre
- Edit theatre details
- Delete theatre
- View all theatres

## 4. Screen and Seat Layout Management

Each theatre can contain one or more screens.

Admin can:

- Add a screen to a theatre
- Set screen name, such as Screen 1
- Create a seat layout
- Define seat categories and prices

Example:

```text
Screen 1

Rows A–C: Regular seats, ₹150
Rows D–F: Premium seats, ₹250
```

For simplicity, use a fixed layout such as 6 rows × 8 seats. The admin only needs to set the seat class and price.

## 5. Show Management

Admin creates movie shows by connecting a movie with a theatre and screen.

Show fields:

```text
movie
theatre
screen
date
startTime
endTime
seatPrices
```

Admin actions:

- Add a new show
- Edit showtime or prices
- Delete a show
- View shows by date, movie, or theatre

Validation rules:

- A screen cannot have two shows at the same time.
- A show date cannot be in the past.
- Only “Now Showing” movies can be assigned to a show.

## 6. Booking Management

Admin can view all customer bookings.

Display:

- Booking ID
- Customer name
- Movie
- Theatre
- Showtime
- Seats
- Amount
- Payment status
- Booking status
- Booking date

Useful filters:

- By date
- By movie
- By theatre
- By booking status

For the first version, admin should mainly **view** bookings. Cancelling or refunding bookings can be added later.

## 7. User Management

Keep this feature minimal.

Admin can:

- View registered users
- View name, email, mobile number, and registration date
- View the number of bookings made by each user

Do not implement editing passwords or deleting users in the first version.

---

## Admin User Flow

```text
Admin Login
      ↓
Dashboard
      ↓
Manage Movies / Theatres / Screens / Shows
      ↓
View Bookings and Users
```

## Customer Booking-History Flow

```text
Customer Login
      ↓
My Bookings
      ↓
Upcoming or Past Booking
      ↓
View Ticket Details
      ↓
Print Ticket
```

## Important Validations

- Only admin users can access admin routes and pages.
- Customers can only see their own booking history.
- Deleting a movie or theatre with existing bookings should be avoided; mark it as inactive instead.
- Do not allow a show to be edited after tickets have been booked, except for safe details if required.
- Show deletion should be blocked if confirmed bookings exist.
# Technology Stack — Movie Ticket Booking System

## 1. Selected Stack

The project will use the **MERN stack**.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | Builds the customer and admin interfaces. |
| Frontend tooling | Vite | Creates and runs the React project quickly. |
| Styling | Bootstrap 5 + CSS | Creates responsive forms, cards, navigation bars, tables, and seat layouts. |
| Backend | Node.js | Runs the server-side JavaScript code. |
| Backend framework | Express.js | Creates REST APIs for users, movies, shows, bookings, and admin actions. |
| Database | MongoDB | Stores users, movies, theatres, shows, seats, and bookings. |
| Database ODM | Mongoose | Defines MongoDB schemas and communicates with the database. |
| Authentication | JSON Web Token (JWT) | Keeps users logged in and protects private pages. |
| Password security | bcryptjs | Hashes passwords before saving them in the database. |
| API communication | Axios | Sends requests from React to the Express backend. |
| Routing | React Router DOM | Navigates between pages without reloading the site. |
| Configuration | dotenv | Stores private values, such as database URL and JWT secret, in environment variables. |
| Version control | Git and GitHub | Stores source code and supports team collaboration. |

---

## 2. Frontend Stack

### React.js

React will be used to create all customer and admin pages.

Main customer pages:

```text
Home
Login
Register
Movie List
Movie Details
Show Selection
Seat Selection
Booking Summary
Mock Payment
Booking Confirmation
My Bookings
```

Main admin pages:

```text
Admin Dashboard
Manage Movies
Manage Theatres
Manage Shows
Manage Bookings
Manage Users
```

### React Router DOM

Used for page navigation.

Example routes:

```text
/
 /login
 /register
 /movies
 /movies/:movieId
 /shows/:movieId
 /seat-selection/:showId
 /payment
 /booking-confirmation/:bookingId
 /my-bookings
 /admin
 /admin/movies
 /admin/theatres
 /admin/shows
 /admin/bookings
```

### Axios

Axios connects the frontend to backend APIs.

Example requests:

```text
GET    /api/movies
GET    /api/movies/:id
GET    /api/shows/:movieId
POST   /api/auth/login
POST   /api/bookings
GET    /api/bookings/my-bookings
```

### Bootstrap 5 and CSS

Bootstrap will be used for:

- Navigation bars
- Movie cards
- Forms
- Buttons
- Tables
- Admin dashboard cards
- Mobile-responsive layouts
- Alerts and error messages

Custom CSS will be used for:

- Movie poster design
- Seat layout
- Seat colours
- Booking ticket design

Seat colours:

```text
Available seat  → Green or white
Selected seat   → Blue
Booked seat     → Grey or red
Premium seat    → Gold or purple
```

---

## 3. Backend Stack

### Node.js

Node.js runs the backend application and allows the whole project to use JavaScript.

### Express.js

Express will provide REST APIs for the project.

Backend responsibilities:

- Register and authenticate users
- Validate login credentials
- Manage movies, theatres, screens, and shows
- Return available seats for a show
- Create bookings
- Prevent double booking of seats
- Calculate booking amount
- Save mock payment status
- Restrict admin-only actions

### Important Backend Packages

```text
express        → Create server and API routes
mongoose       → Connect Node.js with MongoDB
bcryptjs       → Hash user passwords
jsonwebtoken   → Create and verify JWT tokens
dotenv         → Read environment variables
cors           → Allow frontend to access backend APIs
nodemon        → Restart backend automatically during development
```

---

## 4. Database Stack

### MongoDB

MongoDB stores project data as collections and documents.

Recommended option:

```text
MongoDB Atlas for cloud database
```

MongoDB Atlas has a free tier and avoids database installation on every team member’s computer. For offline development, MongoDB Community Server can also be used locally.

### Mongoose

Mongoose will define schemas, validations, and relationships between data.

Main collections:

| Collection | Purpose |
|---|---|
| `users` | Stores customer and admin accounts. |
| `movies` | Stores movie information. |
| `theatres` | Stores theatre location, address, and screens. |
| `shows` | Stores movie showtimes, screens, seats, prices, and booked seats. |
| `bookings` | Stores confirmed tickets and payment details. |

### User Schema

```text
name
email
mobile
password
role              // customer or admin
createdAt
```

### Movie Schema

```text
title
poster
description
genre
language
duration
rating
trailerLink
releaseDate
status            // now-showing, coming-soon, inactive
```

### Theatre Schema

```text
name
location
address
screens
```

### Show Schema

```text
movieId
theatreId
screenName
date
startTime
seatLayout
bookedSeats
seatPrices
```

### Booking Schema

```text
bookingId
userId
movieId
theatreId
showId
seatNumbers
totalAmount
paymentMethod
paymentStatus
bookingStatus
createdAt
```

---

## 5. Authentication and Authorization

### JWT Authentication

The project will use JWT for login sessions.

Login process:

```text
User enters email and password
        ↓
Backend verifies credentials
        ↓
Backend creates JWT token
        ↓
Frontend stores token
        ↓
Token is sent with protected API requests
```

### User Roles

| Role | Access |
|---|---|
| Customer | Browse movies, select seats, make bookings, view own booking history. |
| Admin | Manage movies, theatres, shows, seats, users, and all bookings. |

### Password Security

Passwords must never be stored as plain text.

```text
User password
      ↓
bcryptjs hash
      ↓
Save hashed password in MongoDB
```

---

## 6. Mock Payment Implementation

No real payment gateway will be used.

Payment methods shown to the user:

```text
UPI
Credit/Debit Card
Net Banking
Cash at Counter
```

Mock payment flow:

```text
User selects payment method
        ↓
Clicks Pay Now
        ↓
Backend verifies selected seats are still available
        ↓
Mock payment is marked successful
        ↓
Booking is created
        ↓
Seats are marked as booked
        ↓
Booking confirmation page is shown
```

Example mock transaction ID:

```text
MOCK-20260824-001
```

---

## 7. Project Folder Structure

```text
movie-ticket-booking/
│
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Customer and admin pages
│   │   ├── services/           # Axios API calls
│   │   ├── context/            # Login/user state
│   │   ├── styles/             # CSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                     # Express backend
│   ├── controllers/            # Business logic
│   ├── middleware/             # JWT and admin protection
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API routes
│   ├── config/                 # Database connection
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 8. Required Software

Each team member should install:

```text
Node.js
Visual Studio Code
Git
MongoDB Compass
Postman
```

| Software | Purpose |
|---|---|
| Node.js | Runs React and Express projects. |
| VS Code | Code editor. |
| Git | Tracks code changes. |
| MongoDB Compass | Lets the team view database collections visually. |
| Postman | Tests backend APIs before connecting them to React. |

---

## 9. Environment Variables

Store private configuration in the backend `.env` file.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Do not upload the `.env` file to GitHub.

---

## 10. Features Deliberately Excluded

To keep the project simple, the first version will not include:

- Real payment gateway integration
- OTP/email verification
- Refund processing
- Coupon and discount engine
- Live movie data API
- QR-code ticket verification
- Redux
- TypeScript
- Docker
- Microservices

---

## Final Technology Summary

```text
Frontend:
React.js + Vite + React Router DOM + Axios + Bootstrap 5 + CSS

Backend:
Node.js + Express.js

Database:
MongoDB Atlas + Mongoose

Security:
JWT + bcryptjs + dotenv

Development Tools:
VS Code + GitHub + Postman + MongoDB Compass
```

This stack is modern enough for the project, but still manageable for an SE lab team.
