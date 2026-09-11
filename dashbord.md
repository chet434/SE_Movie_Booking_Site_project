- Offer banner is 148px high and stacks image/copy/action.
- Sidebar is a modal drawer; do not show a 76px rail on small screens.
- Respect 16px page padding and 44px interaction target minimum.

## 18. Interactions and Data States

| Component | Loading | Empty | Error |
|---|---|---|---|
| Search | Input remains usable | Search suggestion state | Inline retry on result area |
| Hero | Fixed-size hero skeleton | Hide carousel when no promotion | Fallback latest movie banner |
| Now Showing | Five skeleton cards | No shows in this city message | Retry movies button |
| Next Booking | Booking-panel skeleton | No upcoming booking CTA | Retry booking load |
| Quick Actions | Static, no loading | Not applicable | Not applicable |
| Theatre list | Three skeleton rows | No theatres in selected city | Retry theatre list |
| Offer | Fixed image/content skeleton | Hide if no campaign | Hide silently, do not break layout |
| Upcoming shelf | Poster skeletons | No upcoming movies message | Retry shelf |

### 18.1 Keyboard and focus order

1. Skip to main content link.
2. Sidebar navigation.
3. Search.
4. Location selector.
5. Notification button.
6. Profile menu.
7. Hero carousel controls and CTA.
8. Genre filters.
9. Now Showing cards and buttons.
10. Offer code button.
11. Upcoming shelf.
12. Right-rail booking, quick actions, theatre rows.

Every focus state uses a 3px Lilac 500 ring with 3px offset. Ensure it is visible on white and near-black surfaces.

### 18.2 Motion

- Sidebar/menu: 180ms transform/opacity.
- Hero slide: 250ms opacity/transform, disabled for reduced motion.
- Movie card hover: 180ms translateY(-2px).
- Buttons: 150ms background transition, translateY(1px) on press.
- No scroll hijacking, magnetic buttons, auto-looping visual noise or decorative animation.

## 19. Asset Requirements

| Asset | Size / ratio | Notes |
|---|---|---|
| Hero promotion image | 1600 × 430px, approximately 3.7:1 | Keep a text-safe region on left/middle |
| Poster: now showing | 2:3 | Minimum 400px tall |
| Poster: upcoming | 2:3 | Minimum 500px tall |
| Booking poster | 2:3 | Minimum 300px tall |
| Theatre thumbnail | 1:1 | Minimum 160px square |
| Sidebar artwork | 300 × 400px | Dark cinema texture or approved image |
| Offer banner art | 650 × 220px | Transparent or left-weighted composition |
| Profile avatar | 1:1 | Minimum 96px square |

Always reserve image aspect ratio in CSS. Use descriptive alt text for meaningful poster/theatre images; background promotion art uses empty alt only when adjacent visible text communicates the offer.

## 20. React Component Tree

    pages/
    └── DashboardPage.jsx
        ├── DashboardSidebar.jsx
        │   ├── BrandLockup.jsx
        │   ├── SidebarNav.jsx
        │   ├── SidebarPromo.jsx
        │   └── LogoutButton.jsx
        ├── DashboardUtilityBar.jsx
        │   ├── GlobalSearch.jsx
        │   ├── LocationMenu.jsx
        │   ├── NotificationButton.jsx
        │   └── ProfileMenu.jsx
        ├── DashboardMainColumn.jsx
        │   ├── HeroCarousel.jsx
        │   ├── GenreFilterRow.jsx
        │   ├── SectionHeader.jsx
        │   ├── NowShowingGrid.jsx
        │   │   └── MovieCard.jsx
        │   ├── WeekendOfferBanner.jsx
        │   └── UpcomingMovieShelf.jsx
        └── DashboardRightRail.jsx
            ├── NextBookingCard.jsx
            ├── QuickActionsGrid.jsx
            └── PopularTheatresCard.jsx

## 21. Verification Checklist

### Layout

- [ ] Desktop viewport reproduces a 242px sidebar and two-column dashboard body.
- [ ] Hero is 238px high at canonical viewport and aligns with right rail top.
- [ ] Right rail is 358px wide with 16px vertical gaps.
- [ ] Now Showing displays five equal cards at 1536px width.
- [ ] Offer banner spans only the left column.
- [ ] Upcoming shelf appears after offer banner.
- [ ] Sidebar marketing panel remains above Logout.

### Styling

- [ ] Manrope is used throughout.
- [ ] FilmTIX wordmark uses white Film plus Lilac TIX.
- [ ] Active sidebar item and selected genre use Lilac 100.
- [ ] Main calls to action use ink action colour.
- [ ] All surfaces, borders and focus rings use FilmTIX tokens.
- [ ] Icons are Tabler icons only and have consistent stroke width.
- [ ] Movie/theatre assets reserve their intended aspect ratio.

### Function and accessibility

- [ ] Search, city selector, carousel, genre chips, movie cards, booking card and theatre rows have working destinations.
- [ ] Carousel pauses on hover/focus and honors reduced motion.
- [ ] Loading, empty and error states do not collapse layout.
- [ ] Every icon-only button has an accessible label.
- [ ] All pointer targets are at least 44px on touch layouts.
- [ ] Keyboard focus follows the documented order.
- [ ] Responsive breakpoints avoid squeezed five-card grids or unreadable right rail.

---

This specification is the source of truth for recreating the supplied FilmTIX dashboard layout while keeping it consistent with the established FilmTIX colours, typography, icon system and interaction standards.