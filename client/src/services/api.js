import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for silent token refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh on non-401 or already retried requests
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip refresh on auth endpoints to prevent loops
    const requestUrl = originalRequest.url || '';
    if (
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new Event('auth:unauthorized'));
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(`${API.defaults.baseURL}/auth/refresh`, {
        refreshToken
      });

      const newToken = refreshResponse.data?.data?.token;
      if (!newToken) {
        throw new Error('New access token not provided');
      }

      localStorage.setItem('token', newToken);
      API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

      processQueue(null, newToken);
      return API(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new Event('auth:unauthorized'));
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Auth APIs ───────────────────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const refreshAuthToken = (refreshToken) => API.post('/auth/refresh', { refreshToken });
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// ─── Movie APIs ──────────────────────────────────────────────────────────────
export const getMovies = (params) => API.get('/movies', { params });
export const getMovieFilters = (params) => API.get('/movies/filters', { params });
export const getMovieById = (id) => API.get(`/movies/${id}`);
export const addMovie = (data) => API.post('/movies', data);
export const updateMovie = (id, data) => API.put(`/movies/${id}`, data);
export const deleteMovie = (id) => API.delete(`/movies/${id}`);

// ─── Location APIs (V1 — backward compat) ────────────────────────────────────
export const getLocations = () => API.get('/locations');

// ─── City APIs (V2) ──────────────────────────────────────────────────────────
export const getCities = () => API.get('/cities');
export const detectCity = (lat, lng) => API.get('/cities/detect', { params: { lat, lng } });
export const getCityById = (id) => API.get(`/cities/${id}`);
export const addCity = (data) => API.post('/cities', data);
export const updateCity = (id, data) => API.put(`/cities/${id}`, data);
export const deleteCity = (id) => API.delete(`/cities/${id}`);

// ─── Theatre APIs ────────────────────────────────────────────────────────────
export const getTheatres = (params) => API.get('/theatres', { params });
export const getTheatreById = (id) => API.get(`/theatres/${id}`);
export const addTheatre = (data) => API.post('/theatres', data);
export const updateTheatre = (id, data) => API.put(`/theatres/${id}`, data);
export const deleteTheatre = (id) => API.delete(`/theatres/${id}`);

// ─── Screen APIs ─────────────────────────────────────────────────────────────
export const getScreensByTheatre = (theatreId) => API.get('/screens', { params: { theatreId } });
export const getScreenById = (id) => API.get(`/screens/${id}`);
export const addScreen = (data) => API.post('/screens', data);
export const updateScreen = (id, data) => API.put(`/screens/${id}`, data);
export const deleteScreen = (id) => API.delete(`/screens/${id}`);

// ─── Show APIs ───────────────────────────────────────────────────────────────
export const getShowsByMovie = (arg1, arg2 = {}) => {
  if (typeof arg1 === 'string') {
    return API.get('/shows', { params: { movieId: arg1, ...arg2 } });
  }
  return API.get('/shows', { params: arg1 });
};
export const getShowById = (id) => API.get(`/shows/${id}`);
export const getShowSeats = (showId) => API.get(`/shows/${showId}/seats`);  // V2
export const getAllShows = () => API.get('/shows/admin/all');
export const addShow = (data) => API.post('/shows', data);
export const updateShow = (id, data) => API.put(`/shows/${id}`, data);
export const deleteShow = (id) => API.delete(`/shows/${id}`);

// ─── Booking APIs ─────────────────────────────────────────────────────────────
export const createBooking = (data) => API.post('/bookings', data);           // V1 legacy
export const holdSeats = (data) => API.post('/bookings/hold', data);          // V2
export const confirmBooking = (data) => API.post('/bookings/confirm', data);  // V2
export const cancelBooking = (id) => API.post(`/bookings/${id}/cancel`);      // V2
export const getMyBookings = () => API.get('/bookings/my-bookings');
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const getAllBookings = (params) => API.get('/bookings/all', { params });

// ─── Payment APIs ─────────────────────────────────────────────────────────────
export const createPaymentOrder = (data) => API.post('/payments/create-order', data);
export const getPayment = (bookingId) => API.get(`/payments/${bookingId}`);

// ─── Admin APIs ───────────────────────────────────────────────────────────────
export const getAdminStats = () => API.get('/admin/stats');
export const getAllUsers = () => API.get('/users');

export default API;
