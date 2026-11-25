const Theatre = require('../models/Theatre');
const City = require('../models/City');
const Screen = require('../models/Screen');
const { escapeRegex } = require('../utils/escapeRegex');

class TheatreRepository {
  async findAll({ cityId, location, isActive = true } = {}) {
    let filter = { isActive };

    if (cityId) {
      filter.city = cityId;
    } else if (location) {
      const city = await City.findOne({ name: new RegExp(`^${escapeRegex(location)}$`, 'i') });
      if (city) filter.city = city._id;
      else return [];
    }

    return Theatre.find(filter)
      .populate('city', 'name slug')
      .sort({ name: 1 });
  }

  async findById(id, { includeScreens = false } = {}) {
    let query = Theatre.findById(id).populate('city', 'name slug');

    if (includeScreens) {
      query = query.where('isActive', true);
    }

    const theatre = await query.sole();

    if (includeScreens && theatre) {
      const screens = await Screen.find({ theatre: theatre._id, isActive: true }).sort({ screenNumber: 1 });
      return { ...theatre.toObject(), screensV2: screens };
    }

    return theatre;
  }

  async create(data) {
    return Theatre.create(data);
  }

  async update(id, data) {
    return Theatre.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }).populate('city', 'name slug');
  }

  async deactivate(id) {
    const theatre = await Theatre.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (theatre) {
      await Screen.updateMany({ theatre: theatre._id }, { isActive: false });
    }

    return theatre;
  }

  async findCities({ isActive = true } = {}) {
    return City.find({ isActive }).sort({ name: 1 });
  }
}

module.exports = new TheatreRepository();