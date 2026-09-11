import { useState, useEffect } from 'react';
import { getAllBookings } from '../../services/api';
import { FaCalendar, FaChair } from 'react-icons/fa';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await getAllBookings({});
      setBookings(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="text-center py-4"><div className="spinner-border text-warning"></div></div>;
  }

  return (
    <div>
      <h3 className="fw-bold mb-4">Manage Bookings</h3>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Movie</th>
              <th>Theatre</th>
              <th>Date & Time</th>
              <th>Seats</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id}>
                <td className="fw-semibold small">{b.bookingId}</td>
                <td>
                  <div>{b.user?.name}</div>
                  <small className="text-muted">{b.user?.email}</small>
                </td>
                <td>{b.movie?.title}</td>
                <td>{b.theatre?.name}</td>
                <td>
                  <small>
                    <FaCalendar size={10} className="me-1" />
                    {b.show?.date && new Date(b.show.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {' '}{b.show?.startTime}
                  </small>
                </td>
                <td>
                  <small><FaChair size={10} className="me-1" />{b.seatNumbers?.join(', ')}</small>
                </td>
                <td className="fw-bold text-success">₹{b.totalAmount}</td>
                <td>
                  <span className={`badge ${b.paymentStatus === 'paid' ? 'bg-success' : 'bg-danger'}`}>
                    {b.paymentStatus}
                  </span>
                </td>
                <td>
                  <span className={`badge ${b.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                    {b.bookingStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bookings.length === 0 && (
        <div className="text-center py-4 text-muted">No bookings found.</div>
      )}
    </div>
  );
};

export default ManageBookings;
