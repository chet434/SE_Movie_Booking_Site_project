/**
 * Premiere & Stream Helper Utilities
 * CineBook Movie Ticketing & Premiere Platform
 */

// Title keywords that identify Premiere featured releases
const PREMIERE_KEYWORDS = [
  'odyssey',
  'marrow',
  'other mommy',
  'ha-chan',
  'kadakh',
  'king',
  'dune',
  'ramayana',
  'doomsday',
  'godzilla',
  'gunmaaster',
  'kankana',
  'jailer',
  'drishyam',
  'hunger games'
];

/**
 * Derives the list of Premiere movies from an array of movies
 */
export const getPremiereMovies = (movies = []) => {
  if (!movies || movies.length === 0) return [];

  const comingSoon = movies.filter(
    (m) => m.status === 'coming-soon' || m.status === 'coming_soon'
  );
  const nowShowing = movies.filter(
    (m) => m.status !== 'coming-soon' && m.status !== 'coming_soon'
  );

  const combined = [...comingSoon, ...nowShowing.slice(4), ...nowShowing.slice(0, 4)];
  const seen = new Set();
  const unique = [];

  for (const m of combined) {
    const id = String(m._id || m.id || m.slug);
    if (!seen.has(id)) {
      seen.add(id);
      unique.push(m);
    }
  }

  return unique.length > 0 ? unique : movies;
};

/**
 * Checks whether a single movie is part of the Premieres lineup
 */
export const isPremiereMovie = (movie) => {
  if (!movie) return false;
  if (movie.isPremiere || movie.streamAvailable) return true;
  if (movie.status === 'coming-soon' || movie.status === 'coming_soon') return true;

  const title = (movie.title || '').toLowerCase();
  const slug = (movie.slug || '').toLowerCase();

  return PREMIERE_KEYWORDS.some((kw) => title.includes(kw) || slug.includes(kw));
};

/**
 * LocalStorage keys for user Stream Library
 */
const getStorageKey = (userId) => `cinebook_stream_library_${userId || 'guest'}`;

/**
 * Retrieves the unlocked stream items for a user
 */
export const getStreamLibrary = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse stream library:', err);
    return [];
  }
};

/**
 * Adds or updates a movie in the user's Stream Library
 */
export const saveToStreamLibrary = (userId, item) => {
  if (!userId || !item) return [];
  try {
    const existing = getStreamLibrary(userId);
    const existingIndex = existing.findIndex(
      (entry) => String(entry.movieId || entry.id) === String(item.movieId || item.id)
    );

    let updated;
    if (existingIndex >= 0) {
      updated = [...existing];
      updated[existingIndex] = { ...updated[existingIndex], ...item };
    } else {
      updated = [item, ...existing];
    }

    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    window.dispatchEvent(new Event('cinebook:stream-library-updated'));
    return updated;
  } catch (err) {
    console.error('Failed to save to stream library:', err);
    return [];
  }
};

/**
 * Checks if a movie is currently rented or bought by a user
 */
export const isMovieUnlocked = (userId, movieId) => {
  if (!userId || !movieId) return null;
  const library = getStreamLibrary(userId);
  return (
    library.find(
      (item) => String(item.movieId || item.id) === String(movieId)
    ) || null
  );
};
