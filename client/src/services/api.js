import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api'
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// Movie APIs
export const getMovies = (params) => API.get('/movies', { params });
export const getMovieById = (id) => API.get(`/movies/${id}`);

// Theatre APIs
export const getTheatres = (params) => API.get('/theatres', { params });
export const getLocations = () => API.get('/theatres/locations/list');

// Show APIs
export const getShowsByMovie = (params) => API.get('/shows', { params });
export const getShowById = (id) => API.get(`/shows/${id}`);

// Booking APIs
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my-bookings');
export const getBookingById = (id) => API.get(`/bookings/${id}`);

// Admin APIs
export const getAdminStats = () => API.get('/admin/stats');
export const getAllUsers = () => API.get('/users');
export const getAllBookings = (params) => API.get('/bookings/all', { params });
export const getAllShows = () => API.get('/shows/admin/all');

// Admin Movie CRUD
export const addMovie = (data) => API.post('/movies', data);
export const updateMovie = (id, data) => API.put(`/movies/${id}`, data);
export const deleteMovie = (id) => API.delete(`/movies/${id}`);

// Admin Theatre CRUD
export const addTheatre = (data) => API.post('/theatres', data);
export const updateTheatre = (id, data) => API.put(`/theatres/${id}`, data);
export const deleteTheatre = (id) => API.delete(`/theatres/${id}`);

// Admin Show CRUD
export const addShow = (data) => API.post('/shows', data);
export const updateShow = (id, data) => API.put(`/shows/${id}`, data);
export const deleteShow = (id) => API.delete(`/shows/${id}`);

export default API;
