
| Action | Style | Visibility |
|---|---|---|
| Print ticket | Secondary with Printer | Desktop and mobile menu |
| Copy booking code | Ghost icon/text | Beside booking code |
| View booking details | Secondary | Ticket page below card or history list |
| Share ticket | Ghost icon in mobile menu | Optional |
| Cancel booking | Not in version 1 | Excluded unless future policy exists |

The only high-emphasis button near the ticket is Print ticket if printing is a core lab feature. Never use a primary ink-black button for an action that does not change booking state.

### 5.8 Ticket states

| State | UI response |
|---|---|
| Loading | Ticket-shaped skeleton with reserved poster, content rows and barcode region |
| Confirmed | Success indicator, complete details, barcode and print action |
| Past booking | Keep ticket visible; show Past show label in secondary status |
| Failed payment | Do not render a valid ticket/barcode; show failure summary and Try again action |
| Not authorized | Show access-denied state; do not reveal ticket data |
| Missing booking | Plain not-found message with My Bookings action |

## 6. Accessibility and Print Requirements

### Seat selection

- Seat map is keyboard navigable in reading order.
- Use aria-pressed on selected seat buttons and aria-disabled on booked seats.
- Announce selected-seat count and total in an aria-live polite region.
- Use visible focus outlines that remain visible on white, lilac and black surfaces.
- Seat classes have text legend and accessible labels, not colour alone.
- Do not rely on curved screen marker to communicate important information.

### Ticket

- Use a real heading for movie title and labelled data groups.
- Barcode has an accessible label containing the booking code.
- Copy and print controls have clear accessible names.
- Ticket must remain readable at browser zoom 200%.
- Print stylesheet uses white paper, black text and barcode, removes page frame/navigation/actions, and avoids splitting a ticket across pages.
- Print sheet should include booking code even if barcode is not supported by the printer.

## 7. Implementation Component Tree

    features/
    ├── seat-selection/
    │   ├── SeatSelectionPage.jsx
    │   ├── BookingStepper.jsx
    │   ├── MovieContext.jsx
    │   ├── ScreenMarker.jsx
    │   ├── SeatMap.jsx
    │   ├── SeatButton.jsx
    │   ├── SeatLegend.jsx
    │   ├── BookingCostSummary.jsx
    │   └── MobileBookingBar.jsx
    └── ticket/
        ├── TicketPage.jsx
        ├── BookingTicket.jsx
        ├── TicketDetailGrid.jsx
        ├── TicketSeparator.jsx
        ├── BookingBarcode.jsx
        └── TicketActions.jsx

### Required props

| Component | Required props |
|---|---|
| SeatMap | layout, bookedSeatIds, selectedSeatIds, onToggleSeat, maxSeats |
| SeatButton | seat, state, price, onClick |
| BookingCostSummary | selectedSeats, subtotal, fee, total, onProceed, isSubmitting |
| BookingTicket | booking, posterUrl, printable |
| TicketDetailGrid | screen, seats, price, showAt |
| BookingBarcode | bookingCode |

The backend remains the source of truth for price, booked-seat state and ticket details. Never create ticket content only from client route state.

## 8. Final QA Checklist

### Seat selection

- [ ] Header has Back, visible current step and profile/menu control.
- [ ] Movie context contains theatre, date and showtime.
- [ ] Screen marker is lilac, subtle and non-interactive.
- [ ] Seat map uses real buttons and preserves 40px mobile targets.
- [ ] Available, premium, selected, booked and held states are distinct.
- [ ] Selected-seat total and max-six rule are visible.
- [ ] Sidebar has poster, seats, fee, total and one main action.
- [ ] Mobile bottom action bar does not cover map content.
- [ ] Seat conflict error identifies unavailable seat IDs.

### Ticket

- [ ] Ticket uses FilmTIX colours and Manrope, not the source reference colours/type.
- [ ] Ticket is a single readable card with poster, detail grid, barcode and booking code.
- [ ] Side notches occur only at the barcode separator.
- [ ] Booking barcode is generated from actual booking code.
- [ ] Multiple seats are fully represented.
- [ ] Print output is clean and does not split ticket pages.
- [ ] Failed payment never displays a valid ticket.
- [ ] All icons are from the shared Tabler icon set.

---

This document copies the requested layout and icon logic from the supplied references while keeping FilmTIX colour, typography and interaction standards consistent across the app.