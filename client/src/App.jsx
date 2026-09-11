import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';

// Protected pages
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import SeatSelectionPage from './features/seat-selection/SeatSelectionPage';
import BookingSummary from './pages/BookingSummary';
import TicketPage from './features/ticket/TicketPage';
import MyBookings from './pages/MyBookings';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageTheatres from './pages/admin/ManageTheatres';
import ManageShows from './pages/admin/ManageShows';
import ManageBookings from './pages/admin/ManageBookings';
import ManageUsers from './pages/admin/ManageUsers';

function App() {
  return (
    <AuthProvider>
      <div className="cs-workspace-wrapper">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movies/:id" element={<MovieDetails />} />

          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/seat-selection/:showId" element={<SeatSelectionPage />} />
          <Route path="/payment" element={<ProtectedRoute><BookingSummary /></ProtectedRoute>} />
          <Route path="/booking-confirmation/:id" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="movies" element={<ManageMovies />} />
            <Route path="theatres" element={<ManageTheatres />} />
            <Route path="shows" element={<ManageShows />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
