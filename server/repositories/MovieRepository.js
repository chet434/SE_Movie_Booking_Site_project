const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const City = require('../models/City');
const { escapeRegex } = require('../utils/escapeRegex');
const { deepTrust } = require('../utils/deepTrust');

class MovieRepository {
  async getAvailableFilters({ location, cityId } = {}) {
    let theatreIds = [];
    if (cityId || location) {
      let resolvedCityId = cityId;
      if (!resolvedCityId && location) {
        const city = await City.findOne({ name: new RegExp(`^${escapeRegex(location)}$`, 'i') });
        resolvedCityId = city?._id;
      }

      if (resolvedCityId) {
        const theatres = await Theatre.find({ city: resolvedCityId, isActive: true }).select('_id');
        theatreIds = theatres.map(t => t._id);
      } else if (location) {
        const theatres = await Theatre.find({
          location: new RegExp(`^${escapeRegex(location)}$`, 'i')
        }).select('_id');
        theatreIds = theatres.map(t => t._id);
      }
    }

    let movieFilter = { status: { $in: ['now-showing', 'coming-soon', 'now_showing', 'coming_soon'] } };
    if (theatreIds.length > 0) {
      const shows = await Show.find(deepTrust({ theatre: { $in: theatreIds }, isActive: true })).select('movie');
      const movieIds = [...new Set(shows.map(s => s.movie.toString()))];
      movieFilter._id = { $in: movieIds };
    }

    const movies = await Movie.find(deepTrust(movieFilter)).select('languages language genres genre formats');

    const langSet = new Set();
    const genreSet = new Set();
    const formatSet = new Set();

    movies.forEach(m => {
      (m.languages || []).forEach(l => langSet.add(l));
      if (m.language) langSet.add(m.language);
      (m.genres || []).forEach(g => genreSet.add(g));
      (m.genre || []).forEach(g => genreSet.add(g));
      (m.formats || []).forEach(f => formatSet.add(f));
    });

    // Also query active shows for formats
    const showQuery = { isActive: true };
    if (theatreIds.length > 0) showQuery.theatre = { $in: theatreIds };
    const distinctShowFormats = await Show.distinct('format', deepTrust(showQuery));
    distinctShowFormats.forEach(f => {
      if (f) formatSet.add(f);
    });

    // Default fallbacks if empty in DB
    const languages = Array.from(langSet).filter(Boolean).sort();
    const genres = Array.from(genreSet).filter(Boolean).sort();
    const formats = Array.from(formatSet).filter(Boolean).sort();

    return {
      languages: languages.length ? languages : ['Hindi', 'English', 'Telugu', 'Tamil', 'Odia', 'Kannada', 'Malayalam', 'Japanese'],
      genres: genres.length ? genres : ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Romantic', 'Sci-Fi', 'Thriller'],
      formats: formats.length ? formats : ['2D', '3D', 'IMAX', 'IMAX_3D', '4DX']
    };
  }

  async findAll({ search, genre, genres, language, languages, format, formats, status, location, city, cityId, skip = 0, limit = 100, sort = { createdAt: -1 } } = {}) {
    let filter = {};

    if (!status) {
      filter.status = { $in: ['now-showing', 'coming-soon', 'now_showing', 'coming_soon'] };
    } else {
      const normalizedStatus = status.replace(/-/g, '_');
      filter.status = { $in: [status, normalizedStatus] };
    }

    const andConditions = [];

    if (search && search.trim()) {
      andConditions.push({ title: new RegExp(escapeRegex(search.trim()), 'i') });
    }

    const genreParam = genres || genre;
    if (genreParam) {
      const genreList = (Array.isArray(genreParam) ? genreParam : String(genreParam).split(',')).map(g => g.trim()).filter(Boolean);
      if (genreList.length > 0) {
        andConditions.push({
          $or: [
            { genre: { $in: genreList } },
            { genres: { $in: genreList } }
          ]
        });
      }
    }

    const langParam = languages || language;
    if (langParam) {
      const langList = (Array.isArray(langParam) ? langParam : String(langParam).split(',')).map(l => l.trim()).filter(Boolean);
      if (langList.length > 0) {
        andConditions.push({
          $or: [
            { language: { $in: langList } },
            { languages: { $in: langList } }
          ]
        });
      }
    }

    const locParam = location || city;
    let theatreIds = [];
    if (cityId || locParam) {
      let resolvedCityId = cityId;
      if (!resolvedCityId && locParam) {
        const foundCity = await City.findOne({ name: new RegExp(`^${escapeRegex(locParam)}$`, 'i') });
        resolvedCityId = foundCity?._id;
      }

      if (resolvedCityId) {
        const theatres = await Theatre.find({ city: resolvedCityId, isActive: true }).select('_id');
        theatreIds = theatres.map(t => t._id);
      } else if (locParam) {
        const theatres = await Theatre.find({
          location: new RegExp(`^${escapeRegex(locParam)}$`, 'i')
        }).select('_id');
        theatreIds = theatres.map(t => t._id);
      }

      if (theatreIds.length > 0) {
        const isComingSoonOnly = filter.status?.$in?.every(s => ['coming-soon', 'coming_soon'].includes(s));
        if (!isComingSoonOnly) {
          const shows = await Show.find(deepTrust({ theatre: { $in: theatreIds }, isActive: true })).select('movie');
          const movieIds = [...new Set(shows.map(s => s.movie.toString()))];
          andConditions.push({
            $or: [
              { _id: { $in: movieIds } },
              { status: { $in: ['coming-soon', 'coming_soon'] } }
            ]
          });
        }
      }
    }

    const formatParam = formats || format;
    if (formatParam) {
      const rawFormats = (Array.isArray(formatParam) ? formatParam : String(formatParam).split(',')).map(f => f.trim()).filter(Boolean);
      if (rawFormats.length > 0) {
        // Expand aliases (e.g. IMAX, IMAX_3D, IMAX 3D, IMAX 2D)
        const showFormatAliases = [];
        rawFormats.forEach(f => {
          showFormatAliases.push(f);
          if (f === 'IMAX') showFormatAliases.push('IMAX_3D', 'IMAX 3D', 'IMAX 2D');
          if (f === 'IMAX_3D' || f === 'IMAX 3D') showFormatAliases.push('IMAX', 'IMAX_3D', 'IMAX 3D');
        });

        const showQuery = { format: { $in: showFormatAliases }, isActive: true };
        if (theatreIds.length > 0) {
          showQuery.theatre = { $in: theatreIds };
        }
        const formatShows = await Show.find(deepTrust(showQuery)).select('movie');
        const formatMovieIds = [...new Set(formatShows.map(s => s.movie.toString()))];

        andConditions.push({
          $or: [
            { _id: { $in: formatMovieIds } },
            { formats: { $in: rawFormats } }
          ]
        });
      }
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const trustedFilter = deepTrust(filter);

    const [total, movies, availableFilters] = await Promise.all([
      Movie.countDocuments(trustedFilter),
      Movie.find(trustedFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.getAvailableFilters({ location: locParam, cityId })
    ]);

    return {
      total,
      movies,
      meta: {
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
        pages: Math.ceil(total / limit) || 1,
        availableFilters
      }
    };
  }

  async findById(id) {
    const query = id.match(/^[a-f\d]{24}$/i)
      ? { _id: id }
      : { slug: id };

    return Movie.findOne(query);
  }

  async create(data) {
    return Movie.create(data);
  }

  async update(id, data) {
    return Movie.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async softDelete(id) {
    return Movie.findByIdAndUpdate(
      id,
      { status: 'ended', isActive: false },
      { new: true }
    );
  }
}

module.exports = new MovieRepository();
