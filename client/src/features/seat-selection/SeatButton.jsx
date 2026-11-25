const SeatButton = ({ seat, state, onClick, price }) => {
  const isBooked = state === 'booked' || state === 'sold';
  const isSelected = state === 'selected';

  // BookMyShow seat classes (Screenshot 23: clean white with green border, solid green when selected, light grey when booked)
  let seatClass = 'bms-seat available';
  if (isBooked) {
    seatClass = 'bms-seat booked';
  } else if (isSelected) {
    seatClass = 'bms-seat selected';
  }

  return (
    <button
      type="button"
      className={seatClass}
      onClick={() => !isBooked && onClick(seat)}
      disabled={isBooked}
      aria-pressed={isSelected}
      aria-disabled={isBooked}
      aria-label={`Seat ${seat}, ${state}, ₹${price}`}
      title={`Seat ${seat} — ₹${price} (${state.toUpperCase()})`}
    >
      {seat.replace(/[A-Z]/, '')}
    </button>
  );
};

export default SeatButton;
