import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public pages
import DashboardPage from './features/dashboard/DashboardPage';
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

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Dashboard handles its own layout, so we don't wrap it in cs-workspace-wrapper
  if (location.pathname === '/' || location.pathname === '/movies') {
    return <DashboardPage />;
  }

  // Other routes use the standard layout
  return (
    <div className="cs-workspace-wrapper d-flex flex-column">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/seat-selection/:showId" element={<ProtectedRoute><SeatSelectionPage /></ProtectedRoute>} />
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
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
