const mongoose = require('mongoose');

/**
 * Recursively wraps MongoDB operator objects with mongoose.trusted()
 * so queries with $in, $or, $and, etc. work seamlessly with mongoose.set('sanitizeFilter', true).
 * Preserves RegExp and ObjectId instances.
 */
const deepTrust = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof RegExp || obj instanceof mongoose.Types.ObjectId || obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(deepTrust);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = (v && typeof v === 'object' && !(v instanceof RegExp) && !(v instanceof mongoose.Types.ObjectId) && !(v instanceof Date))
      ? mongoose.trusted(deepTrust(v))
      : v;
  }
  return mongoose.trusted(out);
};

module.exports = deepTrust;
module.exports.deepTrust = deepTrust;
