/**
 * userStorage.js — user-scoped localStorage helpers
 *
 * Provides a consistent key format: `{prefix}_{userId}`
 * so event bookings (or any user data) are never shared across accounts.
 */

/** Returns the canonical user ID string from a user object (handles both _id and id). */
export const getActiveUserId = (user) => user?._id || user?.id || null;

/**
 * Returns a namespaced localStorage key for a given prefix and user.
 * Returns null if there is no authenticated user, so callers can skip the write.
 */
export const getUserStorageKey = (prefix, user) => {
  const uid = getActiveUserId(user);
  return uid ? `${prefix}_${uid}` : null;
};

/** Read a JSON array from a user-scoped key. Returns [] on missing/corrupt data. */
export const readUserArray = (prefix, user) => {
  const key = getUserStorageKey(prefix, user);
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

/** Prepend an item to a user-scoped JSON array in localStorage. */
export const prependToUserArray = (prefix, user, item) => {
  const key = getUserStorageKey(prefix, user);
  if (!key) return;
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([item, ...existing]));
  } catch {
    // ignore storage errors (private/full)
  }
};

/** Remove a set of localStorage keys (purge legacy / polluted keys). */
export const purgeStorageKeys = (...keys) => {
  keys.forEach((k) => {
    if (k) localStorage.removeItem(k);
  });
};
