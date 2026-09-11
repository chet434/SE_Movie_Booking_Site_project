# Movie Ticket Booking Web Application — Software Design Document

**Project type:** Software Engineering Laboratory Project  
**Technology:** MERN — MongoDB, Express.js, React.js, Node.js  
**Version:** 1.0  
**Scope:** Semester-project demonstration application

---

## 1. Purpose and Scope

This document defines the design for a web application through which customers can discover movies, select a location, theatre, date, show and seats, complete a simulated payment, and receive a ticket. Administrators manage the catalogue and operating data.

The system is a simplified BookMyShow-style application. It will use only administrator-entered/sample data and a mock payment result. Real payments, cinema data feeds, email/SMS, refunds, coupons, QR validation, and multiple theatre-owner accounts are outside version 1.

## 2. Objectives

- Provide an easy customer journey from movie discovery to booking confirmation.
- Secure accounts using password hashing and JWT authentication.
- Separate customer and administrator permissions.
- Show accurate seat availability and prevent double booking.
- Preserve a clear, printable booking record.
- Keep the codebase modular enough for a student team to build and test.

## 3. Actors and Permissions

| Actor | Permissions |
|---|---|
| Visitor | Browse active movies, search/filter, view movie details and available shows. |
| Customer | Visitor permissions plus edit profile, select seats, make mock booking, view/print own tickets. |
| Admin | Customer permissions plus manage movies, theatres, screens, shows, users, and all bookings. |

The backend determines the user and role from a verified JWT. The browser must never be allowed to choose its own role or user ID.

## 4. System Architecture

```text
Customer / Admin browser
       │
       │ JSON over HTTPS
       ▼
React + Vite frontend
       │ Axios
       ▼
Express + Node.js REST API
       │ Mongoose
       ▼
MongoDB / MongoDB Atlas
```

### 4.1 Backend layers

```text
Request → Route → Auth/validation middleware → Controller
        → Service/business rules → Mongoose model → MongoDB
```

- **Routes** map HTTP endpoints to controllers.
- **Middleware** validates JWTs, roles, payloads and standardizes errors.
- **Controllers** coordinate one use case and return an HTTP response.
- **Services** hold reusable logic; the booking service owns the transaction.
- **Models** own schemas, relationships, indexes and database constraints.

### 4.2 Frontend layers

```text
Page → reusable component → Axios API service → backend
                  ↑
      AuthContext + booking-selection state
```

Pages load route-level data. Components render reusable controls such as cards, filters, date chips and seats. API services centralize calls and attach the JWT. Context stores the current user and temporary booking selection.

## 5. Modules

| Module | Responsibilities |
|---|---|
| User management | Register, login, logout, profile update, password change and role protection. |
| Movie discovery | Catalogue, title search, location/theatre/genre/language/date filters, movie detail and trailer link. |
| Theatre and show management | Theatre, screen, fixed seat layout and show scheduling. |
| Seat selection | Seat map, availability states, class-wise prices, six-seat limit and live total. |
| Booking and payment | Backend availability recheck, mock payment, atomic booking creation and ticket. |
| Booking history | Upcoming/past tickets, ticket detail and browser print. |
| Admin management | Dashboard and management of operational data. |

## 6. Main Use Cases

### UC-01: Registration and login

1. A visitor enters name, email, mobile number, password and confirmation.
2. The backend validates fields and checks that the email is unique.
3. The password is hashed with `bcryptjs`; a `customer` account is created.
4. On login, the backend compares the supplied password with the hash.
5. It returns a signed JWT and safe user data.
6. The client stores the token and sends it with protected requests.

Errors: duplicate email, invalid fields, inactive user, or generic “Invalid email or password.”

### UC-02: Discover a movie and choose a show

1. Visitor optionally selects city, date, theatre, genre, language or a title search.
2. The system lists active movies having matching active shows.
3. Visitor opens a movie, chooses city/date/theatre/showtime.
4. The app navigates to seat selection using only the selected `showId`.
5. Backend confirms that the show is active, future-dated and belongs to the selected movie.

### UC-03: Select seats and book

1. Customer opens the selected show’s seat map.
2. The client displays fixed screen layout, prices and currently reserved seat IDs.
3. Customer selects one to six available seats.
4. Customer reviews calculated amount, contact details and mock payment method.
5. Backend validates selected seats again, computes price itself and processes the mock outcome.
6. On success it atomically creates booking and reservations, then returns a ticket.
7. On conflict it returns unavailable seat IDs; the client reloads the map.

### UC-04: Admin schedules a show

1. Admin creates/activates movie, theatre and screen.
2. Admin creates a show with a valid screen, future start/end time, format and prices.
3. Backend rejects overlapping shows for the same screen.
4. Only an active show for a now-showing movie is visible to customers.

## 7. Data Design

### 7.1 Entity relationship view

```text
User 1 ─── * Booking * ─── 1 Show ─── 1 Movie
                 │              │
                 │              └── 1 Screen ─── 1 Theatre
                 │
                 └── * SeatReservation

Theatre 1 ─── * Screen 1 ─── * SeatDefinition
```

A screen’s fixed seat definitions are embedded in its theatre document. Confirmed seats are separate `seatReservations` documents, which allows a unique database rule for each show-seat pair. A booking also stores ticket snapshots, so later catalogue edits never alter historical tickets.

### 7.2 Collections

| Collection | Purpose | Important relationship |
|---|---|---|
| `users` | Customer/admin account | Referenced by bookings. |
| `movies` | Catalogue details | Referenced by shows. |
| `theatres` | Theatre details, screens and seat layouts | Referenced by shows. |
| `shows` | Scheduled movie in a screen | References movie, theatre and screen. |
| `seatReservations` | One confirmed seat per show | References show and booking. |
| `bookings` | Payment/ticket record | References user/show and stores snapshots. |

### 7.3 User

```js
{
  _id: ObjectId,
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, required: true, lowercase: true, unique: true },
  phone: { type: String, required: true, match: /^\d{10}$/ },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```

Required index: unique `{ email: 1 }`.

### 7.4 Movie

```js
{
  _id: ObjectId,
  title: String,
  posterUrl: String,
  description: String,
  genres: [String],
  language: String,
  durationMinutes: Number,
  rating: { type: Number, min: 0, max: 10 },
  releaseDate: Date,
  trailerUrl: String,
  formats: ['2D', '3D'],
  status: 'now_showing' | 'coming_soon' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

Recommended indexes: text index on `title`; filter index on `status, language, genres`.

### 7.5 Theatre and screen

```js
{
  _id: ObjectId,
  name: String,
  city: String,
  address: String,
  isActive: Boolean,
  screens: [{
    _id: ObjectId,
    name: String,                  // Screen 1
    formats: ['2D', '3D'],
    seatLayout: [{
      seatId: String,              // A1, A2, ...
      row: String,
      number: Number,
      seatClass: 'regular' | 'premium',
      isEnabled: Boolean
    }]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

For the lab project, creating a screen generates a fixed 6 × 8 layout. Admin selects regular or premium class rather than manually drawing a seating plan.

### 7.6 Show

```js
{
  _id: ObjectId,
  movieId: { type: ObjectId, ref: 'Movie', required: true },
  theatreId: { type: ObjectId, ref: 'Theatre', required: true },
  screenId: { type: ObjectId, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  format: '2D' | '3D',
  seatPrices: { regular: Number, premium: Number },
  status: 'active' | 'inactive' | 'cancelled',
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: `{ movieId, startAt, status }`, `{ theatreId, startAt }`, and `{ screenId, startAt }`.

Before create/update, reject an overlap when:

```text
existing.startAt < requested.endAt AND existing.endAt > requested.startAt
```

### 7.7 Seat reservation

```js
{
  _id: ObjectId,
  showId: { type: ObjectId, ref: 'Show', required: true },
  seatId: { type: String, required: true },
  bookingId: { type: ObjectId, ref: 'Booking', required: true },
  status: { type: String, enum: ['confirmed'], default: 'confirmed' },
  createdAt: Date
}
```

**Critical index:** unique compound index `{ showId: 1, seatId: 1 }`. It is the database-level protection that prevents a seat from being confirmed twice.

### 7.8 Booking

```js
{
  _id: ObjectId,
  bookingCode: { type: String, unique: true }, // BK-20260911-8F3A
  userId: { type: ObjectId, ref: 'User', required: true },
  showId: { type: ObjectId, ref: 'Show', required: true },
  seats: [{ seatId: String, seatClass: String, unitPrice: Number }],
  price: { subtotal: Number, convenienceFee: Number, total: Number },
  customer: { name: String, email: String, phone: String },
  payment: {
    method: 'upi' | 'card' | 'net_banking' | 'cash_counter',
    status: 'paid' | 'failed',
    transactionId: String,
    paidAt: Date
  },
  bookingStatus: 'confirmed' | 'failed' | 'cancelled',
  ticketSnapshot: {
    movieTitle: String,
    posterUrl: String,
    theatreName: String,
    theatreAddress: String,
    screenName: String,
    startAt: Date,
    format: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: unique `bookingCode`, `{ userId, createdAt: -1 }`, `{ showId }`, and `{ bookingStatus, createdAt: -1 }`.

### 7.9 Integrity rules

- A show must reference an existing active theatre screen and valid movie.
- Requested seats must exist and be enabled in that screen layout.
- Server calculates price from `show.seatPrices`; it never accepts client totals.
- A confirmed booking contains 1–6 unique seats and paid mock payment.
- Failed payment creates no confirmed reservation.
- Referenced movie/theatre/show data is marked inactive rather than deleted.

## 8. Safe Concurrent Booking Design

A client-side seat map can become stale, so it is not authoritative. Booking confirmation runs as one MongoDB transaction:

```text
1. Authenticate customer and validate request.
2. Read the active future show, movie, theatre and screen.
3. Check seat IDs are distinct, enabled and count is 1–6.
4. Recalculate subtotal, fee and total on the server.
5. Simulate payment result.
6. If failed, return failure without seat reservations.
7. Create confirmed booking and one reservation per seat.
8. Unique-index collision means another customer won the seat.
9. Abort the entire transaction and return HTTP 409 on collision.
10. Commit and return complete ticket on success.
```

The unique `showId + seatId` index means that in two simultaneous attempts for the same seat, exactly one can commit. The other receives `SEAT_UNAVAILABLE`; its UI reloads availability.

Example seat-map response:

```json
{
  "showId": "66f...",
  "screen": { "name": "Screen 1", "seatLayout": [] },
  "seatPrices": { "regular": 150, "premium": 250 },
  "bookedSeatIds": ["A1", "A2"],
  "maxSeatsPerBooking": 6
}
```

## 9. REST API

### 9.1 Conventions

- Base URL: `/api`; all bodies are JSON.
- Protected requests send `Authorization: Bearer <JWT>`.
- Store/transmit timestamps as ISO 8601 UTC; render demo dates in IST.
- Lists support `page` and `limit` where useful.
- Status codes: `201` creation, `400` validation, `401` unauthenticated, `403` forbidden, `404` missing, `409` conflict.

### 9.2 Auth/profile

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create customer. |
| POST | `/auth/login` | Public | Authenticate and return JWT. |
| GET | `/auth/me` | Authenticated | Get safe profile. |
| PUT | `/auth/me` | Authenticated | Update name and phone. |
| PUT | `/auth/me/password` | Authenticated | Change password with current-password check. |

### 9.3 Movies and shows

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/movies` | Active catalogue; accepts `q, city, theatreId, genre, language, date, page, limit`. |
| GET | `/movies/:movieId` | Movie detail. |
| GET | `/movies/:movieId/shows` | Shows grouped by theatre; accepts city/date. |
| GET | `/locations` | Active demo cities. |
| GET | `/theatres?city=` | Active theatres in a city. |
| GET | `/shows/:showId` | Selected-show summary. |
| GET | `/shows/:showId/seats` | Layout, prices and booked seat IDs. |

### 9.4 Bookings

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/bookings/confirm` | Authenticated | Mock payment + atomic confirmed booking. |
| GET | `/bookings/me` | Authenticated | Own bookings; `category=upcoming|past`. |
| GET | `/bookings/:bookingCode` | Owner/Admin | Ticket detail with ownership check. |

Example confirm request:

```json
{
  "showId": "66f...",
  "seatIds": ["B3", "B4", "C3"],
  "paymentMethod": "upi",
  "customer": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "9876543210"
  },
  "mockOutcome": "success"
}
```

`mockOutcome` is only a demonstration control. The app normally submits success; an optional demo control can show failure behaviour.

### 9.5 Admin

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/admin/movies` | List/create movies. |
| GET/PUT | `/admin/movies/:movieId` | Read/update; use inactive status instead of unsafe delete. |
| GET/POST | `/admin/theatres` | List/create theatres. |
| PUT | `/admin/theatres/:theatreId` | Update theatre details. |
| POST | `/admin/theatres/:theatreId/screens` | Add screen and generated layout. |
| PUT | `/admin/theatres/:theatreId/screens/:screenId` | Safely update screen. |
| GET/POST | `/admin/shows` | List/create shows. |
| PUT | `/admin/shows/:showId` | Update a safe future/unbooked show. |
| PATCH | `/admin/shows/:showId/status` | Activate/inactivate/cancel. |
| GET | `/admin/bookings` | Filtered booking view. |
| GET | `/admin/users` | Users with booking counts. |
| GET | `/admin/dashboard` | Summary counts/revenue. |

Example error:

```json
{
  "error": {
    "code": "SEAT_UNAVAILABLE",
    "message": "One or more selected seats are no longer available.",
    "details": { "seatIds": ["B3"] }
  }
}
```

## 10. Frontend Design

### 10.1 Route map

| Route | Page | Access |
|---|---|---|
| `/` | Home/movie catalogue | Public |
| `/login`, `/register` | Authentication | Public |
| `/movies/:movieId` | Movie details | Public |
| `/movies/:movieId/shows` | Theatre/date/show selection | Public |
| `/shows/:showId/seats` | Seat selection | Login required before checkout |
| `/checkout` | Summary and mock payment | Authenticated |
| `/bookings/:bookingCode/confirmation` | Ticket | Owner/Admin |
| `/my-bookings` | Booking history | Authenticated |
| `/profile` | Profile/password | Authenticated |
| `/admin/*` | Management screens | Admin |

### 10.2 Customer pages

| Page | Core UI | Rules |
|---|---|---|
| Home | Search, filters, movie cards | Debounce search; clear filters; empty state. |
| Movie detail | Poster, metadata, story, trailer, Book Tickets | Inactive/coming-soon movies cannot proceed. |
| Show selection | Date chips, theatre cards, time buttons | Only active future shows shown. |
| Seat selection | Screen, legend, seat grid, selection list, total | Booked disabled; maximum six. |
| Checkout | Ticket summary, contact form, payment options | Required valid customer details/method. |
| Confirmation | Printable ticket | Fetch ticket from server by booking code. |
| My Bookings | Upcoming/past tabs | API only returns owned bookings. |

### 10.3 Seat states

| State | Display | Behaviour |
|---|---|---|
| Available regular | Green/standard | Select/deselect. |
| Available premium | Gold/purple with class label | Select/deselect. |
| Selected | Blue | Deselect. |
| Booked | Grey/red and disabled | Cannot select. |
| Disabled layout seat | Gap/disabled outline | Cannot select. |

Seat color must not be the only signal. Each button needs an accessible label such as “B3, regular, ₹150, available.”

### 10.4 React structure

```text
client/src/
├── api/                 # Axios instance and feature API files
├── components/
│   ├── common/
│   ├── movies/
│   ├── shows/
│   ├── bookings/
│   └── layout/
├── context/             # AuthContext, BookingSelectionContext
├── pages/customer/
├── pages/admin/
├── styles/
├── utils/
├── App.jsx
└── main.jsx
```

## 11. Backend Structure

```text
server/
├── config/db.js
├── controllers/
├── services/            # booking, pricing, ticket snapshot
├── middleware/          # auth, admin, validation, errors
├── models/
├── routes/
├── validators/
├── scripts/seed.js
├── app.js
└── server.js
```

Middleware order:

```text
dotenv → express.json → cors → development logger
→ routes → 404 handler → central error handler
```

Authorization rules:

| Action | Backend rule |
|---|---|
| My bookings | Query is always limited to `req.user.id`. |
| Ticket by code | Ticket owner must equal `req.user.id`, unless admin. |
| Admin endpoints | `requireAuth` followed by `requireAdmin`. |
| Profile/password | Target is authenticated user only. |
| Booking confirmation | User ID is taken from JWT, never request body. |

## 12. Validation and Business Rules

| Area | Rules |
|---|---|
| Registration | Name ≥2; valid unique email; 10-digit phone; password ≥6; client cannot set role. |
| Login | Email/password required; generic invalid-credentials response. |
| Movie | Title, description, language, duration/status required; rating 0–10. |
| Theatre/screen | Unique screen name per theatre; unique seat IDs per screen. |
| Show | Valid active entities; future start/end; end after start; no screen overlap. |
| Booking | 1–6 distinct enabled seats; method selected; server price; final availability recheck. |
| Admin changes | Do not edit a confirmed ticket snapshot; do not delete referenced data. |

Default demo values: regular ₹150, premium ₹250 and convenience fee ₹20. Amount = sum of server-derived seat prices + fee.

## 13. Security Design

- Hash passwords using `bcryptjs` (cost factor 10–12).
- JWT payload holds only user ID and role; expiry may be 8 hours.
- Keep `JWT_SECRET` and database URI in `.env`, excluded by `.gitignore`.
- Validate all input on backend and use explicit allowed fields to prevent mass assignment.
- Never expose password hash, JWT, stack trace, or another user’s ticket in responses.
- Configure CORS for known client origin, body size limit, Helmet and login/register rate limiting where possible.
- Use normal JSX text rendering, never untrusted `dangerouslySetInnerHTML`.
- For this lab build, localStorage JWT is acceptable; document that httpOnly secure-cookie refresh tokens are preferable in production.

Suggested environment:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=long_random_secret
JWT_EXPIRES_IN=8h
CLIENT_ORIGIN=http://localhost:5173
CONVENIENCE_FEE=20
```

## 14. Status Rules

| Entity | Values | Meaning |
|---|---|---|
| User | active/inactive | Inactive user cannot log in or book. |
| Movie | now_showing/coming_soon/inactive | Only now-showing can be scheduled/booked. |
| Show | active/inactive/cancelled | Only active future shows can be booked. |
| Payment | paid/failed | Confirmed booking must be paid. |
| Booking | confirmed/failed/cancelled | Version 1 creates confirmed tickets; cancellation is future scope. |

## 15. Admin Design

Dashboard cards: total active movies, theatres, shows, bookings, registered users and today’s paid revenue.

Safe-management rules:

- Mark referenced movies/theatres inactive rather than deleting them.
- A show with confirmed reservations cannot change movie, theatre, screen, start time or price.
- Admin can deactivate/cancel a show according to project policy.
- User management is view-only in the initial version.

## 16. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Responsive design | Works on mobile, tablet and desktop; seat map may scroll horizontally on small screens. |
| Accessibility | Labels, keyboard operation, visible focus, color-independent seat status. |
| Performance | Paginated/filterable lists; fetch seat map only for selected show. |
| Reliability | Transactional confirmation plus unique reservation index. |
| Error handling | Field-level form errors and actionable API alerts. |
| Logging | Log server errors without passwords, tokens or unnecessary customer data. |

## 17. Testing Strategy

### Unit tests

- Password hashing/comparison and JWT creation.
- Email, phone and seat-ID validation.
- Class-wise pricing and convenience-fee calculation.
- Show-overlap validation.
- Booking-code and ticket-snapshot generation.

### API/integration tests

| Test | Expected result |
|---|---|
| Duplicate registration | Reject; no second user. |
| Customer calls admin route | HTTP 403. |
| User A requests user B’s ticket | HTTP 403/404; no data exposed. |
| Past or overlapping show | HTTP 400/409. |
| Valid booking | HTTP 201; booking plus reservations created. |
| Seven selected seats | HTTP 400. |
| Already booked seat | HTTP 409; no partial booking. |
| Mock failure | No confirmed booking/reservations. |

### End-to-end/demo tests

- Search/filter, empty results and show selection.
- Login redirect from protected screens.
- Seat selection/deselection, price total and six-seat limit.
- Print-ticket preview.
- Admin management forms and customer-access denial.
- Two browser sessions attempting the same seat: one succeeds and the other gets `SEAT_UNAVAILABLE`.

## 18. Deployment and Operations

Development endpoints:

```text
Vite frontend:  http://localhost:5173
Express API:    http://localhost:5000
Database:       MongoDB local or Atlas development cluster
```

For deployment, build React static assets, deploy Express with environment variables, use a restricted MongoDB Atlas account and set the exact frontend URL in `CLIENT_ORIGIN`. HTTPS is required outside local development. Do not commit secrets or real user data.

## 19. Suggested Plan and Team Distribution

| Phase | Deliverable |
|---|---|
| 1 | Repository, client/server scaffold, database connection, common styling. |
| 2 | Authentication, profile, JWT/role middleware. |
| 3 | Movie/theatre/screen/show models, sample data, discovery UI. |
| 4 | Seat map, pricing, show selection. |
| 5 | Transactional booking, mock payment, ticket/history. |
| 6 | Admin views, responsive polish, tests, documentation and demonstration. |

| Team member focus | Suggested ownership |
|---|---|
| Member 1 | Auth, profile, role protection. |
| Member 2 | Movies, theatres, screens and shows. |
| Member 3 | Catalogue/show-selection/seat UI. |
| Member 4 | Booking/payment/history, integration and testing. |

## 20. Folder Structure

```text
movie-ticket-booking/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/customer/
│   │   ├── pages/admin/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── scripts/seed.js
│   ├── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── design.md
│   ├── api.md
│   └── test-cases.md
├── .gitignore
└── README.md
```

## 21. Acceptance Checklist

- [ ] Customer can register, login/logout, edit profile and change password.
- [ ] Passwords are hashed; customers cannot enter admin pages/APIs.
- [ ] Active catalogue supports title search and required filters.
- [ ] Location, date, theatre and valid showtime selection work.
- [ ] Seat map distinguishes available, selected, booked and premium seats.
- [ ] Customer can select 1–6 seats and see correct server-consistent pricing.
- [ ] Mock success creates one paid/confirmed ticket and reserves its seats.
- [ ] Concurrent duplicate seat booking is safely rejected.
- [ ] Mock failure does not reserve seats or create a confirmed ticket.
- [ ] Customer can view only own upcoming/past bookings and printable details.
- [ ] Admin can safely manage movies, theatres/screens, shows, bookings and users.
- [ ] Validation, authorization and core concurrency test cases are demonstrated.

---

This design maintains an achievable semester-project scope while making the important engineering decisions explicit: data ownership, role protection, pricing authority, historical ticket snapshots and concurrent seat-booking safety.
