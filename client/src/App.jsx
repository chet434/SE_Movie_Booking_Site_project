import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Lazy-loaded components for code splitting
const Home = lazy(() => import('./pages/Home'));
const ExploreMovies = lazy(() => import('./pages/ExploreMovies'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const PremiereDetails = lazy(() => import('./pages/PremiereDetails'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const EventTicketSelection = lazy(() => import('./pages/EventTicketSelection'));
const SeatSelectionPage = lazy(() => import('./features/seat-selection/SeatSelectionPage'));
const BookingSummary = lazy(() => import('./pages/BookingSummary'));
const TicketPage = lazy(() => import('./features/ticket/TicketPage'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageMovies = lazy(() => import('./pages/admin/ManageMovies'));
const ManageTheatres = lazy(() => import('./pages/admin/ManageTheatres'));
const ManageShows = lazy(() => import('./pages/admin/ManageShows'));
const ManageBookings = lazy(() => import('./pages/admin/ManageBookings'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));

// Dashboard feature layout
import DashboardPage from './features/dashboard/DashboardPage';

const Loading = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
    <div className="spinner-border text-warning" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const isSeatSelectionPage = location.pathname.includes('/seat-layout/') || location.pathname.startsWith('/seat-selection');
  const isBookingSummaryPage = location.pathname.startsWith('/booking-summary') || location.pathname === '/payment';
  const isTicketPage = location.pathname.startsWith('/ticket') || location.pathname.startsWith('/booking-confirmation');
  const isEventTicketsPage = location.pathname.includes('/events/') && location.pathname.endsWith('/tickets');

  const shouldHideFooter =
    isAuthPage ||
    isAdminPage ||
    isSeatSelectionPage ||
    isBookingSummaryPage ||
    isTicketPage ||
    isEventTicketsPage;

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: isSeatSelectionPage ? '#F8F9FA' : 'var(--cb-canvas-void)', color: isSeatSelectionPage ? '#333333' : 'var(--cb-text-primary)' }}>
      <ScrollToTop />
      <AuthModal />
      {!isAuthPage && !isAdminPage && !isSeatSelectionPage && <Navbar />}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<Loading />}>
              <Home />
            </Suspense>
          } />
          <Route path="/movies" element={
            <Suspense fallback={<Loading />}>
              <ExploreMovies />
            </Suspense>
          } />
          <Route path="/explore/movies/:city" element={
            <Suspense fallback={<Loading />}>
              <ExploreMovies />
            </Suspense>
          } />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={
            <Suspense fallback={<Loading />}>
              <Login />
            </Suspense>
          } />
          <Route path="/register" element={
            <Suspense fallback={<Loading />}>
              <Register />
            </Suspense>
          } />
          <Route path="/movies/:id" element={
            <Suspense fallback={<Loading />}>
              <MovieDetails />
            </Suspense>
          } />
          <Route path="/movie/:id" element={
            <Suspense fallback={<Loading />}>
              <MovieDetails />
            </Suspense>
          } />
          <Route path="/movie-details/:id" element={
            <Suspense fallback={<Loading />}>
              <MovieDetails />
            </Suspense>
          } />
          <Route path="/premiere/:id" element={
            <Suspense fallback={<Loading />}>
              <PremiereDetails />
            </Suspense>
          } />
          <Route path="/events/:eventId" element={
            <Suspense fallback={<Loading />}>
              <EventDetails />
            </Suspense>
          } />
          <Route path="/events/:eventId/tickets" element={
            <Suspense fallback={<Loading />}>
              <EventTicketSelection />
            </Suspense>
          } />

          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<Loading />}><Profile /></Suspense></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><Suspense fallback={<Loading />}><ChangePassword /></Suspense></ProtectedRoute>} />
          <Route path="/movies/:movieId/seat-layout/:showId" element={<ProtectedRoute><Suspense fallback={<Loading />}><SeatSelectionPage /></Suspense></ProtectedRoute>} />
          <Route path="/seat-selection/:showId" element={<ProtectedRoute><Suspense fallback={<Loading />}><SeatSelectionPage /></Suspense></ProtectedRoute>} />
          <Route path="/booking-summary/:bookingId" element={<ProtectedRoute><Suspense fallback={<Loading />}><BookingSummary /></Suspense></ProtectedRoute>} />
          <Route path="/booking-summary" element={<ProtectedRoute><Suspense fallback={<Loading />}><BookingSummary /></Suspense></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Suspense fallback={<Loading />}><BookingSummary /></Suspense></ProtectedRoute>} />
          <Route path="/booking-confirmation/:id" element={<ProtectedRoute><Suspense fallback={<Loading />}><TicketPage /></Suspense></ProtectedRoute>} />
          <Route path="/ticket/:id" element={<ProtectedRoute><Suspense fallback={<Loading />}><TicketPage /></Suspense></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><Suspense fallback={<Loading />}><MyBookings /></Suspense></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><Suspense fallback={<Loading />}><AdminLayout /></Suspense></AdminRoute>}>
            <Route index element={<Suspense fallback={<Loading />}><AdminDashboard /></Suspense>} />
            <Route path="movies" element={<Suspense fallback={<Loading />}><ManageMovies /></Suspense>} />
            <Route path="theatres" element={<Suspense fallback={<Loading />}><ManageTheatres /></Suspense>} />
            <Route path="shows" element={<Suspense fallback={<Loading />}><ManageShows /></Suspense>} />
            <Route path="bookings" element={<Suspense fallback={<Loading />}><ManageBookings /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<Loading />}><ManageUsers /></Suspense>} />
          </Route>
        </Routes>
      </main>
      {!shouldHideFooter && <Footer />}
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