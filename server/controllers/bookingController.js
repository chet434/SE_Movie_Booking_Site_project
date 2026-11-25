const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const BookingSeat = require('../models/BookingSeat');
const Show = require('../models/Show');
const ShowSeat = require('../models/ShowSeat');
const Payment = require('../models/Payment');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const User = require('../models/User');
const Screen = require('../models/Screen');
const { deepTrust } = require('../utils/deepTrust');
const { resolveShowCancellability, evaluateCancellation } = require('../utils/cancellationPolicy');

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateBookingNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(Math.random() * 900000) + 100000);
  return `BMS${rand}`;
};

const generateMockOrderId = () =>
  `MOCK-ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const releaseExpiredHolds = async (showId) => {
  try {
    const filter = showId
      ? { show: showId, status: 'held', 'hold.expiresAt': { $lt: new Date() } }
      : { status: 'held', 'hold.expiresAt': { $lt: new Date() } };
    await ShowSeat.updateMany(
      deepTrust(filter),
      { $set: { status: 'available' }, $unset: { hold: '' } }
    );
  } catch (err) {
    console.warn('[BookingController] releaseExpiredHolds error:', err.message);
  }
};

let isReplicaSet = null;

const checkReplicaSetSupport = async () => {
  if (isReplicaSet !== null) return isReplicaSet;
  try {
    if (!mongoose.connection.db) return false;
    const adminDb = mongoose.connection.db.admin();
    const status = await adminDb.command({ hello: 1 });
    isReplicaSet = !!(status.setName || status.msg === 'isdbgrid');
  } catch (e) {
    try {
      const isMaster = await mongoose.connection.db.admin().command({ isMaster: 1 });
      isReplicaSet = !!(isMaster.setName || isMaster.msg === 'isdbgrid');
    } catch {
      isReplicaSet = false;
    }
  }
  return isReplicaSet;
};

/**
 * Transaction runner helper with graceful fallback for standalone local MongoDB.
 * When running on a replica set, operations run within a transaction session.
 * If transactions are not supported, operations execute cleanly without session.
 */
const runInTransaction = async (callback) => {
  const supportsTx = await checkReplicaSetSupport();
  if (!supportsTx) {
    return callback(null);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // Ignore abort errors
      }
    }
    // If runtime failed due to standalone mongo lack of replica set, fallback & cache
    if (err?.code === 20 || String(err?.message).includes('replica set member')) {
      isReplicaSet = false;
      return callback(null);
    }
    throw err;
  } finally {
    session.endSession();
  }
};

const stringifyAddress = (addr, location, fallback = 'Bhubaneswar') => {
  if (typeof addr === 'string' && addr.trim()) return addr.trim();
  if (addr && typeof addr === 'object') {
    const parts = [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  if (typeof location === 'string' && location.trim()) return location.trim();
  return fallback;
};

// ─── V2: Hold Seats ──────────────────────────────────────────────────────────

// @desc    Hold seats atomically (V2 flow — Step 1 of 2)
// @route   POST /api/bookings/hold
// @access  Private
const holdSeats = async (req, res) => {
  try {
    const { showId, showSeatIds } = req.body;

    if (!showId || !showSeatIds || !showSeatIds.length) {
      return res.status(400).json({ success: false, message: 'Show ID and seat IDs are required.' });
    }
    if (showSeatIds.length > 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 seats can be booked at a time.' });
    }

    const show = await Show.findById(showId)
      .populate('movie', 'title poster language')
      .populate('theatre', 'name location city address cancellationAllowed cancellationFeePercent cancellationCutoffMinutes')
      .populate('screen', 'name');

    if (!show || !show.isActive) {
      return res.status(404).json({ success: false, message: 'Show not found or no longer active.' });
    }

    const cancellability = resolveShowCancellability(show);

    // Only reject past shows in strict production mode
    const showTime = show.startsAt || show.date;
    if (process.env.NODE_ENV === 'production' && showTime && new Date(showTime) < new Date()) {
      return res.status(400).json({ success: false, message: 'This show has already started.' });
    }

    // Release expired holds before locking
    await releaseExpiredHolds(showId);

    const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes TTL
    const pendingBookingId = new mongoose.Types.ObjectId();
    const bNumber = generateBookingNumber();

    const heldSeats = [];

    // Filter valid MongoDB ObjectIds
    const validSeatIds = showSeatIds.filter(id =>
      mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)
    );

    await runInTransaction(async (session) => {
      const txOpts = session ? { session } : {};

      if (validSeatIds.length > 0) {
        for (const seatId of validSeatIds) {
          const result = await ShowSeat.findOneAndUpdate(
            { _id: seatId, show: showId, status: 'available' },
            {
              $set: {
                status: 'held',
                'hold.bookingId': pendingBookingId,
                'hold.expiresAt': holdExpiresAt
              }
            },
            { new: true, ...txOpts }
          );

          if (result) {
            heldSeats.push(result);
          }
        }
      }

      // Calculate pricing
      const seatPricePerTicket = show.seatPrices?.regular || show.seatPrices?.premium || 299;
      let subtotal = 0;
      if (heldSeats.length > 0) {
        subtotal = heldSeats.reduce((sum, s) => sum + (s.price || seatPricePerTicket), 0);
      } else {
        subtotal = showSeatIds.length * seatPricePerTicket;
      }

      const convenienceFee = 20;
      const totalAmount = subtotal + convenienceFee;

      const seatLabels = heldSeats.length > 0
        ? heldSeats.map(s => s.label)
        : showSeatIds.map((id, idx) => `Seat ${idx + 1}`);

      // Complete snapshot
      const snapshot = {
        movieTitle: show.movie?.title || 'Movie',
        moviePoster: show.movie?.poster || '',
        posterUrl: show.movie?.poster || '',
        theatreName: show.theatre?.name || 'CineBook Cinema',
        theatreAddress: stringifyAddress(show.theatre?.address, show.theatre?.location || show.theatre?.city, 'Bhubaneswar'),
        screenName: show.screenName || show.screen?.name || 'Audi 01',
        cityName: show.theatre?.city?.name || show.theatre?.location || 'Bhubaneswar',
        startsAt: show.startsAt || show.date || new Date(),
        startTime: show.startTime || '07:30 PM',
        format: show.format || '3D',
        language: show.language || show.movie?.language || 'English',
        isCancellable: cancellability.isCancellable
      };

      // Create pending booking
      const [booking] = await Booking.create([{
        _id: pendingBookingId,
        bookingNumber: bNumber,
        bookingId: bNumber,
        user: req.user._id,
        show: showId,
        movie: show.movie?._id || show.movie,
        theatre: show.theatre?._id || show.theatre,
        screen: show.screen?._id,
        screenName: snapshot.screenName,
        seatNumbers: seatLabels,
        seatsCount: showSeatIds.length,
        subtotal,
        convenienceFee,
        totalAmount,
        status: 'pending',
        bookingStatus: 'pending',
        paymentStatus: 'pending',
        isCancellable: cancellability.isCancellable,
        cancellationFeePercent: cancellability.feePercent,
        cancellationCutoffMinutes: cancellability.cutoffMinutes,
        snapshot
      }], txOpts);

      // Create BookingSeat docs if held
      if (heldSeats.length > 0) {
        const bookingSeatDocs = heldSeats.map(ss => ({
          booking: booking._id,
          showSeat: ss._id,
          seatLabel: ss.label,
          seatType: ss.seatType || 'regular',
          price: ss.price || seatPricePerTicket
        }));
        await BookingSeat.insertMany(bookingSeatDocs, txOpts);
      }
    });

    const populated = await Booking.findById(pendingBookingId)
      .populate('movie', 'title poster')
      .populate('theatre', 'name location address');

    res.status(201).json({
      success: true,
      message: 'Seats held. Complete payment within 10 minutes.',
      data: {
        bookingId: pendingBookingId,
        bookingNumber: bNumber,
        holdExpiresAt,
        totalAmount: populated?.totalAmount || 0,
        subtotal: populated?.subtotal || 0,
        convenienceFee: 20,
        isCancellable: cancellability.isCancellable,
        cancellationFeePercent: cancellability.feePercent,
        cancellationCutoffMinutes: cancellability.cutoffMinutes,
        seats: populated?.seatNumbers?.map(label => ({ label })) || []
      }
    });
  } catch (error) {
    console.error('[BookingController] holdSeats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── V2: Confirm Booking ─────────────────────────────────────────────────────

// @desc    Confirm a booking (V2 flow — Step 2 of 2)
// @route   POST /api/bookings/confirm
// @access  Private
const confirmBooking = async (req, res) => {
  try {
    const { bookingId, paymentMethod, seatNumbers, showId, totalAmount } = req.body;

    let booking = null;

    // 1. Try finding by MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(bookingId) && String(new mongoose.Types.ObjectId(bookingId)) === String(bookingId)) {
      booking = await Booking.findById(bookingId);
    }

    // 2. Try finding by bookingNumber or legacy bookingId
    if (!booking) {
      booking = await Booking.findOne(deepTrust({
        $or: [{ bookingNumber: bookingId }, { bookingId: bookingId }]
      }));
    }

    const orderId = generateMockOrderId();

    // Case A: Existing booking found in database
    if (booking) {
      if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      if (booking.status === 'confirmed') {
        const alreadyConfirmed = await Booking.findById(booking._id)
          .populate('movie', 'title poster genre language duration')
          .populate('theatre', 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes')
          .populate('show', 'date startTime startsAt format screenName isCancellable');

        const alreadyObj = alreadyConfirmed.toObject();
        const cancellability = resolveShowCancellability(alreadyConfirmed.show || { theatre: alreadyConfirmed.theatre });
        alreadyObj.isCancellable = alreadyConfirmed.isCancellable ?? cancellability.isCancellable;
        alreadyObj.cancellationFeePercent = alreadyConfirmed.cancellationFeePercent ?? cancellability.feePercent;
        alreadyObj.cancellationCutoffMinutes = alreadyConfirmed.cancellationCutoffMinutes ?? cancellability.cutoffMinutes;

        return res.json({
          success: true,
          message: 'Booking already confirmed.',
          data: alreadyObj
        });
      }

      const show = await Show.findById(booking.show)
        .populate('movie', 'title poster language')
        .populate('theatre', 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes');

      const cancellability = resolveShowCancellability(show);

      // Resolve seat labels
      let resolvedSeatLabels = (booking.seatNumbers && booking.seatNumbers.length > 0)
        ? [...booking.seatNumbers]
        : (seatNumbers && seatNumbers.length > 0)
        ? [...seatNumbers]
        : [];

      // Find held seats in ShowSeat
      const heldSeats = await ShowSeat.find(deepTrust({
        show: booking.show,
        'hold.bookingId': booking._id
      }));

      if (heldSeats.length > 0 && resolvedSeatLabels.length === 0) {
        resolvedSeatLabels = heldSeats.map(s => s.label);
      }

      if (resolvedSeatLabels.length === 0) {
        resolvedSeatLabels = ['A1', 'A2'];
      }

      // Snapshot ensuring zero undefined fields
      const snapshot = {
        movieTitle: show?.movie?.title || booking.snapshot?.movieTitle || 'Movie',
        moviePoster: show?.movie?.poster || booking.snapshot?.moviePoster || booking.snapshot?.posterUrl || '',
        posterUrl: show?.movie?.poster || booking.snapshot?.posterUrl || booking.snapshot?.moviePoster || '',
        theatreName: show?.theatre?.name || booking.snapshot?.theatreName || 'CineBook Cinema',
        theatreAddress: stringifyAddress(show?.theatre?.address, show?.theatre?.location, booking.snapshot?.theatreAddress || 'Bhubaneswar'),
        screenName: booking.screenName || show?.screenName || 'Audi 01',
        cityName: show?.theatre?.city?.name || show?.theatre?.location || booking.snapshot?.cityName || 'Bhubaneswar',
        startsAt: show?.startsAt || show?.date || booking.snapshot?.startsAt || new Date(),
        startTime: show?.startTime || booking.snapshot?.startTime || '07:30 PM',
        format: show?.format || booking.snapshot?.format || '3D',
        language: show?.language || show?.movie?.language || booking.snapshot?.language || 'English',
        isCancellable: booking.isCancellable !== undefined && booking.isCancellable !== null
          ? booking.isCancellable
          : cancellability.isCancellable
      };

      await runInTransaction(async (session) => {
        const txOpts = session ? { session } : {};

        // Mark ShowSeats as booked if held
        if (heldSeats.length > 0) {
          await ShowSeat.updateMany(
            deepTrust({ _id: { $in: heldSeats.map(s => s._id) } }),
            { $set: { status: 'booked', bookedAt: new Date() }, $unset: { hold: '' } },
            txOpts
          );
        }

        // Add to show.bookedSeats
        if (resolvedSeatLabels.length > 0 && show) {
          await Show.findByIdAndUpdate(
            show._id,
            { $addToSet: { bookedSeats: { $each: resolvedSeatLabels } } },
            txOpts
          );
        }

        // Update booking to confirmed
        await Booking.findByIdAndUpdate(
          booking._id,
          {
            status: 'confirmed',
            bookingStatus: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: paymentMethod || 'UPI',
            transactionId: orderId,
            confirmedAt: new Date(),
            seatNumbers: resolvedSeatLabels,
            seatsCount: resolvedSeatLabels.length,
            totalAmount: totalAmount || booking.totalAmount,
            subtotal: totalAmount ? totalAmount - (booking.convenienceFee || 20) : booking.subtotal,
            isCancellable: booking.isCancellable !== undefined && booking.isCancellable !== null
              ? booking.isCancellable
              : cancellability.isCancellable,
            cancellationFeePercent: booking.cancellationFeePercent ?? cancellability.feePercent,
            cancellationCutoffMinutes: booking.cancellationCutoffMinutes ?? cancellability.cutoffMinutes,
            snapshot
          },
          txOpts
        );

        // Record payment
        await Payment.create([{
          booking: booking._id,
          user: req.user._id,
          provider: 'mock',
          orderId,
          paymentId: orderId,
          amount: totalAmount || booking.totalAmount || 520,
          status: 'paid',
          method: (paymentMethod || 'upi').toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_'),
          paidAt: new Date()
        }], txOpts);
      });

      const confirmedBooking = await Booking.findById(booking._id)
        .populate('movie', 'title poster genre language duration')
        .populate('theatre', 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes')
        .populate('show', 'date startTime startsAt format screenName isCancellable');

      const confObj = confirmedBooking.toObject();
      confObj.isCancellable = confirmedBooking.isCancellable ?? cancellability.isCancellable;
      confObj.cancellationFeePercent = confirmedBooking.cancellationFeePercent ?? cancellability.feePercent;
      confObj.cancellationCutoffMinutes = confirmedBooking.cancellationCutoffMinutes ?? cancellability.cutoffMinutes;

      return res.json({
        success: true,
        message: 'Booking confirmed!',
        data: confObj
      });
    }

    // Case B: Booking ID was synthetic/local, create the real booking now in MongoDB
    const targetShowId = showId || req.body.showId;
    const resolvedSeats = (seatNumbers && seatNumbers.length > 0)
      ? seatNumbers
      : ['A1', 'A2'];

    let show = null;
    if (targetShowId && mongoose.Types.ObjectId.isValid(targetShowId)) {
      show = await Show.findById(targetShowId)
        .populate('movie')
        .populate('theatre', 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes');
    }
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found or inactive.' });
    }
    const cancellability = resolveShowCancellability(show);
    const finalAmount = totalAmount || (resolvedSeats.length * 299 + 20);
    const bNum = (bookingId && bookingId.startsWith('BMS')) ? bookingId : generateBookingNumber();

    const snapshot = {
      movieTitle: show?.movie?.title || 'Movie',
      moviePoster: show?.movie?.poster || '',
      posterUrl: show?.movie?.poster || '',
      theatreName: show?.theatre?.name || 'CineBook Cinema',
      theatreAddress: stringifyAddress(show?.theatre?.address, show?.theatre?.location, 'Bhubaneswar'),
      screenName: show?.screenName || 'Audi 01',
      cityName: show?.theatre?.location || 'Bhubaneswar',
      startsAt: show?.startsAt || show?.date || new Date(),
      startTime: show?.startTime || '07:30 PM',
      format: show?.format || '3D',
      language: show?.language || show?.movie?.language || 'English',
      isCancellable: cancellability.isCancellable
    };

    let newBooking;
    await runInTransaction(async (session) => {
      const txOpts = session ? { session } : {};

      const [created] = await Booking.create([{
        bookingNumber: bNum,
        bookingId: bNum,
        user: req.user._id,
        show: show ? show._id : new mongoose.Types.ObjectId(),
        movie: show?.movie?._id || show?.movie || new mongoose.Types.ObjectId(),
        theatre: show?.theatre?._id || show?.theatre || new mongoose.Types.ObjectId(),
        screenName: snapshot.screenName,
        seatNumbers: resolvedSeats,
        seatsCount: resolvedSeats.length,
        subtotal: finalAmount - 20,
        convenienceFee: 20,
        totalAmount: finalAmount,
        status: 'confirmed',
        bookingStatus: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: paymentMethod || 'UPI',
        transactionId: orderId,
        confirmedAt: new Date(),
        isCancellable: cancellability.isCancellable,
        cancellationFeePercent: cancellability.feePercent,
        cancellationCutoffMinutes: cancellability.cutoffMinutes,
        snapshot
      }], txOpts);

      newBooking = created;

      if (show) {
        await Show.findByIdAndUpdate(
          show._id,
          { $addToSet: { bookedSeats: { $each: resolvedSeats } } },
          txOpts
        );
      }

      await Payment.create([{
        booking: created._id,
        user: req.user._id,
        provider: 'mock',
        orderId,
        paymentId: orderId,
        amount: finalAmount,
        status: 'paid',
        method: (paymentMethod || 'upi').toLowerCase().replace(/\//g, '_'),
        paidAt: new Date()
      }], txOpts);
    });

    const populatedNew = await Booking.findById(newBooking._id)
      .populate('movie', 'title poster genre language duration')
      .populate('theatre', 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes')
      .populate('show', 'date startTime startsAt format screenName isCancellable');

    const newObj = populatedNew.toObject();
    newObj.isCancellable = populatedNew.isCancellable ?? cancellability.isCancellable;
    newObj.cancellationFeePercent = populatedNew.cancellationFeePercent ?? cancellability.feePercent;
    newObj.cancellationCutoffMinutes = populatedNew.cancellationCutoffMinutes ?? cancellability.cutoffMinutes;

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      data: newObj
    });
  } catch (error) {
    console.error('[BookingController] confirmBooking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── V1: Create Booking (Single-Step Flow) ───────────────────────────────────

// @desc    Create and confirm booking in one step (legacy & direct checkout)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { showId, seatNumbers, seats, paymentMethod, totalAmount } = req.body;
    const finalSeats = seatNumbers || seats || [];

    if (!showId || !finalSeats.length) {
      return res.status(400).json({ success: false, message: 'Show and seats are required.' });
    }
    if (finalSeats.length > 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 seats can be booked at a time.' });
    }

    let show = null;
    if (showId && mongoose.Types.ObjectId.isValid(showId)) {
      show = await Show.findById(showId)
        .populate('movie', 'title poster language')
        .populate('theatre', 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes');
    }
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found or inactive.' });
    }

    if (!show || !show.isActive) {
      return res.status(404).json({ success: false, message: 'Show not found or inactive.' });
    }

    const cancellability = resolveShowCancellability(show);

    // Release expired holds
    if (show._id) {
      await releaseExpiredHolds(show._id);
    }

    const bNum = generateBookingNumber();
    const orderId = generateMockOrderId();
    const seatPrice = show.seatPrices?.regular || show.seatPrices?.premium || 299;
    const calculatedSubtotal = finalSeats.length * seatPrice;
    const finalTotal = totalAmount || (calculatedSubtotal + 20);

    const snapshot = {
      movieTitle: show.movie?.title || 'Movie',
      moviePoster: show.movie?.poster || '',
      posterUrl: show.movie?.poster || '',
      theatreName: show.theatre?.name || 'CineBook Cinema',
      theatreAddress: stringifyAddress(show.theatre?.address, show.theatre?.location, 'Bhubaneswar'),
      screenName: show.screenName || 'Audi 01',
      cityName: show.theatre?.location || 'Bhubaneswar',
      startsAt: show.startsAt || show.date || new Date(),
      startTime: show.startTime || '07:30 PM',
      format: show.format || '3D',
      language: show.language || show.movie?.language || 'English',
      isCancellable: cancellability.isCancellable
    };

    let newBooking;
    await runInTransaction(async (session) => {
      const txOpts = session ? { session } : {};

      const [created] = await Booking.create([{
        bookingNumber: bNum,
        bookingId: bNum,
        user: req.user._id,
        show: show._id,
        movie: show.movie?._id || show.movie,
        theatre: show.theatre?._id || show.theatre,
        screenName: snapshot.screenName,
        seatNumbers: finalSeats,
        seatsCount: finalSeats.length,
        subtotal: finalTotal - 20,
        convenienceFee: 20,
        totalAmount: finalTotal,
        status: 'confirmed',
        bookingStatus: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: paymentMethod || 'UPI',
        transactionId: orderId,
        confirmedAt: new Date(),
        isCancellable: cancellability.isCancellable,
        cancellationFeePercent: cancellability.feePercent,
        cancellationCutoffMinutes: cancellability.cutoffMinutes,
        snapshot
      }], txOpts);

      newBooking = created;

      // Add to show.bookedSeats
      await Show.findByIdAndUpdate(
        show._id,
        { $addToSet: { bookedSeats: { $each: finalSeats } } },
        txOpts
      );

      // Also update matching ShowSeat docs
      await ShowSeat.updateMany(
        deepTrust({ show: show._id, label: { $in: finalSeats } }),
        { $set: { status: 'booked', bookedAt: new Date() }, $unset: { hold: '' } },
        txOpts
      );

      // Create Payment
      await Payment.create([{
        booking: created._id,
        user: req.user._id,
        provider: 'mock',
        orderId,
        paymentId: orderId,
        amount: finalTotal,
        status: 'paid',
        method: (paymentMethod || 'upi').toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_'),
        paidAt: new Date()
      }], txOpts);
    });

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('movie', 'title poster genre language duration')
      .populate('theatre', 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes')
      .populate('show', 'date startTime startsAt format screenName isCancellable');

    const popObj = populatedBooking.toObject();
    popObj.isCancellable = populatedBooking.isCancellable ?? cancellability.isCancellable;
    popObj.cancellationFeePercent = populatedBooking.cancellationFeePercent ?? cancellability.feePercent;
    popObj.cancellationCutoffMinutes = populatedBooking.cancellationCutoffMinutes ?? cancellability.cutoffMinutes;

    res.status(201).json({
      success: true,
      message: 'Booking confirmed!',
      data: popObj
    });
  } catch (error) {
    console.error('[BookingController] createBooking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Cancel Booking ──────────────────────────────────────────────────────────

// @desc    Cancel a confirmed booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    let booking = null;

    if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
      booking = await Booking.findById(id).populate('show theatre');
    }
    if (!booking) {
      booking = await Booking.findOne(deepTrust({
        $or: [{ bookingNumber: id }, { bookingId: id }]
      })).populate('show theatre');
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (!['confirmed', 'pending'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a booking that is ${booking.status}.` });
    }

    // For confirmed bookings, enforce cancellation policy rules
    let refundSummary = null;
    if (booking.status === 'confirmed') {
      const evaluation = evaluateCancellation(booking);
      if (!evaluation.eligible) {
        return res.status(400).json({
          success: false,
          error: evaluation.reason,
          message: evaluation.reason
        });
      }
      refundSummary = {
        totalAmount: evaluation.totalAmount,
        feePercent: evaluation.feePercent,
        cancellationFee: evaluation.cancellationFee,
        refundAmount: evaluation.refundAmount,
        refundStatus: 'processed'
      };
    }

    let updatedBooking = null;
    await runInTransaction(async (session) => {
      const txOpts = session ? { session } : {};

      // Release ShowSeats held by this booking
      await ShowSeat.updateMany(
        { show: booking.show?._id || booking.show, 'hold.bookingId': booking._id },
        { $set: { status: 'available' }, $unset: { hold: '' } },
        txOpts
      );

      const seatLabels = booking.seatNumbers || [];
      if (seatLabels.length > 0) {
        await ShowSeat.updateMany(
          deepTrust({ show: booking.show?._id || booking.show, label: { $in: seatLabels } }),
          { $set: { status: 'available' }, $unset: { hold: '' } },
          txOpts
        );

        await Show.findByIdAndUpdate(
          booking.show?._id || booking.show,
          { $pull: { bookedSeats: { $in: seatLabels } } },
          txOpts
        );
      }

      // Clean up BookingSeat claims so seats can be re-held/re-booked
      await BookingSeat.deleteMany({ booking: booking._id }, txOpts);

      const bookingUpdates = {
        status: 'cancelled',
        bookingStatus: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: req.body?.reason || 'Cancelled by user'
      };

      if (refundSummary) {
        bookingUpdates.paymentStatus = 'partially_refunded';
        bookingUpdates.cancellationFee = refundSummary.cancellationFee;
        bookingUpdates.refundAmount = refundSummary.refundAmount;
        bookingUpdates.refundStatus = 'processed';
      }

      updatedBooking = await Booking.findOneAndUpdate(
        { _id: booking._id, status: { $in: ['confirmed', 'pending'] } },
        bookingUpdates,
        { new: true, ...txOpts }
      );

      if (!updatedBooking) {
        throw new Error('Booking has already been cancelled or updated.');
      }

      if (refundSummary) {
        await Payment.updateMany(
          { booking: booking._id, status: 'paid' },
          {
            $set: {
              status: 'partially_refunded',
              cancellationFee: refundSummary.cancellationFee,
              refundAmount: refundSummary.refundAmount,
              refundedAt: new Date()
            }
          },
          txOpts
        );
      } else {
        await Payment.updateMany(
          { booking: booking._id, status: 'paid' },
          { $set: { status: 'refunded' } },
          txOpts
        );
      }
    });

    return res.json({
      success: true,
      message: refundSummary
        ? 'Booking cancelled. 80% refund processed after 20% cancellation fee.'
        : 'Booking cancelled and seats released.',
      data: {
        booking: updatedBooking,
        ...(refundSummary ? { refundSummary } : {})
      }
    });
  } catch (error) {
    console.error('[BookingController] cancelBooking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Bookings ────────────────────────────────────────────────────────────

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find(deepTrust({
      user: req.user._id,
      status: { $ne: 'pending' }
    }))
      .populate('movie', 'title poster genre language duration')
      .populate('theatre', 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes')
      .populate({
        path: 'show',
        select: 'date startTime startsAt format screenName isCancellable theatre',
        populate: {
          path: 'theatre',
          select: 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes'
        }
      })
      .sort({ createdAt: -1 });

    const now = new Date();
    const upcoming = [];
    const past = [];

    for (const booking of bookings) {
      const bObj = booking.toObject();

      // Ensure seatNumbers is populated
      if (!bObj.seatNumbers || bObj.seatNumbers.length === 0) {
        const bookingSeats = await BookingSeat.find(deepTrust({ booking: bObj._id }));
        if (bookingSeats.length > 0) {
          bObj.seatNumbers = bookingSeats.map(bs => bs.seatLabel);
        }
      }

      // Check date (shows remain upcoming until the show ends, with a 3-hour runtime window)
      let showEndOrStart = bObj.snapshot?.endsAt || (bObj.show && bObj.show.endsAt);
      if (!showEndOrStart) {
        showEndOrStart = bObj.snapshot?.startsAt || (bObj.show && (bObj.show.startsAt || bObj.show.date));
      }
      let isFuture = false;
      if (showEndOrStart) {
        let dt = new Date(showEndOrStart);
        const timeStr = bObj.snapshot?.startTime || bObj.show?.startTime;
        if (timeStr && dt.getUTCHours() === 0 && dt.getUTCMinutes() === 0) {
          const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (match) {
            let hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const meridiem = match[3]?.toUpperCase();
            if (meridiem === 'PM' && hours < 12) hours += 12;
            if (meridiem === 'AM' && hours === 12) hours = 0;
            dt.setHours(hours + 3, minutes, 0, 0); // 3-hour show buffer
          }
        } else if (!bObj.snapshot?.endsAt && (!bObj.show || !bObj.show.endsAt)) {
          // If startsAt was used without endsAt, add a 3-hour buffer so active movie stays in upcoming
          dt = new Date(dt.getTime() + 3 * 60 * 60 * 1000);
        }
        isFuture = dt >= now;
      }
      const cancellability = resolveShowCancellability(booking.show || { theatre: booking.theatre });
      if (typeof bObj.isCancellable !== 'boolean') {
        bObj.isCancellable = typeof bObj.snapshot?.isCancellable === 'boolean'
          ? bObj.snapshot.isCancellable
          : cancellability.isCancellable;
      }
      bObj.cancellationFeePercent = bObj.cancellationFeePercent ?? cancellability.feePercent;
      bObj.cancellationCutoffMinutes = bObj.cancellationCutoffMinutes ?? cancellability.cutoffMinutes;
      bObj.cancellationSummary = evaluateCancellation(booking);

      if (isFuture) {
        upcoming.push(bObj);
      } else {
        past.push(bObj);
      }
    }

    res.json({
      success: true,
      data: { upcoming, past }
    });
  } catch (error) {
    console.error('[BookingController] getUserBookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking (supports ObjectId, bookingId, and bookingNumber)
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    let query;

    if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
      query = { _id: id };
    } else {
      query = { $or: [{ bookingId: id }, { bookingNumber: id }] };
    }

    const booking = await Booking.findOne(deepTrust(query))
      .populate('movie', 'title poster genre language duration')
      .populate('theatre', 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes')
      .populate({
        path: 'show',
        select: 'date startTime startsAt endsAt format screenName seatPrices language isCancellable theatre',
        populate: {
          path: 'theatre',
          select: 'name location address city cancellationAllowed cancellationFeePercent cancellationCutoffMinutes'
        }
      })
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const bookingUserId = booking.user?._id ? booking.user._id.toString() : booking.user?.toString();
    if (req.user && req.user.role !== 'admin' && bookingUserId && bookingUserId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Attach booking seats (V2)
    const bookingSeats = await BookingSeat.find(deepTrust({ booking: booking._id }));
    const seatNumbers = (booking.seatNumbers && booking.seatNumbers.length > 0)
      ? booking.seatNumbers
      : bookingSeats.map(bs => bs.seatLabel);

    const cancellability = resolveShowCancellability(booking.show || { theatre: booking.theatre });
    const isCancellable = typeof booking.isCancellable === 'boolean'
      ? booking.isCancellable
      : (typeof booking.snapshot?.isCancellable === 'boolean'
        ? booking.snapshot.isCancellable
        : cancellability.isCancellable);
    const cancellationFeePercent = booking.cancellationFeePercent ?? cancellability.feePercent;
    const cancellationCutoffMinutes = booking.cancellationCutoffMinutes ?? cancellability.cutoffMinutes;

    const cancellationSummary = evaluateCancellation(booking);

    const bObj = booking.toObject();
    bObj.isCancellable = isCancellable;
    bObj.cancellationFeePercent = cancellationFeePercent;
    bObj.cancellationCutoffMinutes = cancellationCutoffMinutes;

    res.json({
      success: true,
      data: {
        ...bObj,
        seatNumbers,
        bookingSeats,
        isCancellable,
        cancellationFeePercent,
        cancellationCutoffMinutes,
        cancellationSummary
      }
    });
  } catch (error) {
    console.error('[BookingController] getBookingById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings/all
// @access  Admin
const getAllBookings = async (req, res) => {
  try {
    const { movieId, theatreId, status } = req.query;
    let filter = {};

    if (movieId) filter.movie = movieId;
    if (theatreId) filter.theatre = theatreId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('movie', 'title poster')
      .populate('theatre', 'name location')
      .populate('show', 'date startTime startsAt screenName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('[BookingController] getAllBookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  holdSeats,
  confirmBooking,
  cancelBooking,
  createBooking,
  getUserBookings,
  getBookingById,
  getAllBookings
};
