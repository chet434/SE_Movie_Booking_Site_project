# FilmTIX Design System

**Product:** Movie Ticket Booking Web Application  
**Visual direction:** Editorial cinema dashboard, soft lilac selection, ink-black actions  
**Implementation foundation:** Bootstrap 5 with CSS custom properties  
**Audience:** Students and everyday cinema-goers  
**Design controls:** Variance 4/10, motion 3/10, density 6/10

---

## 1. Design Intent

FilmTIX should feel like a calm cinema lobby presented as a compact booking dashboard. It must make the movie, showtime, available seats and total cost easy to understand in seconds. The core composition is a softly rounded light workspace set into an ink-black outer frame. Soft lilac communicates selection; ink-black communicates the decisive action.

The application has two modes:

- Customer screens are cinematic, compact, image-led and focused on one booking decision at a time.
- Admin screens are compact, neutral and information-led, while using the same design tokens and controls.

Movie posters are the principal visual asset. Do not use generic purple gradients, glass panels, neon glow, decorative confetti, or multiple accent colours.

## 2. Brand Personality and Content Voice

| Trait | Visual expression |
|---|---|
| Cinematic | Ink-black frame, high-quality posters, soft lilac selection contrast. |
| Reliable | Clear hierarchy, explicit booking status, readable prices. |
| Friendly | Rounded controls, plain language, useful empty/error states. |
| Efficient | One primary action per screen and short booking flow. |
| Contemporary | Clean sans-serif type and restrained elevation. |

Use short, direct, sentence-case copy.

| Prefer | Avoid |
|---|---|
| Book tickets | Reserve your cinematic experience |
| Select a showtime | Unlock your next adventure |
| Seats are filling fast | Hurry, limited opportunity |
| Try another date | Something went wrong |
| Payment successful | Your journey begins now |

## 3. Themes and Colour Tokens

### 3.1 Theme behaviour

Customer screens default to a light workspace on an ink-black presentation canvas, matching the final FilmTIX reference. This is a structural outer-frame and inner-workspace composition, not a random switch between themes. A dark workspace mode may be supported later, but it is not required for the initial implementation.

Use semantic token names in code. Do not use raw hex values inside individual components.

The final reference supplies four lilac swatches. They are used as a controlled selection scale, rather than as four unrelated accent colours.

| Reference swatch | Sampled value | Role in FilmTIX |
|---|---:|---|
| Lilac 100 | #CEC9EA | Selected date/seat surface and secondary action background |
| Lilac 200 | #BEB9DA | Hovered lilac controls |
| Lilac 500 | #948FB0 | Focus ring and pressed lilac controls |
| Lilac 600 | #938DB3 | Optional icon/illustration detail only |

### 3.2 Colour palette

| Token | Light value | Dark value | Use |
|---|---:|---:|---|
| Outer canvas | #0A0A0A | #0A0A0A | App frame and cinematic backdrop |
| Workspace canvas | #F6F6F6 | #181818 | Main booking workspace |
| Surface | #FFFFFF | #232323 | Cards, forms, panels |
| Raised surface | #FFFFFF | #2B2B2B | Modal and elevated content |
| Muted surface | #F1F0F2 | #292929 | Filter zones, disabled surface |
| Border | #E3E0E5 | #383838 | All outlines and separators |
| Primary text | #151515 | #F7F7F7 | Headings and core body text |
| Secondary text | #6A6570 | #C5C1C9 | Metadata and helper text |
| Disabled text | #A4A0A8 | #79757D | Disabled controls |
| Lilac selection | #CEC9EA | #CEC9EA | Selected dates, seats, secondary actions |
| Lilac hover | #BEB9DA | #DED9F0 | Hover state |
| Lilac active | #948FB0 | #BEB9DA | Pressed state |
| Lilac soft | #EEECEF | #332F3A | Selected filter background |
| Ink action | #111111 | #F7F7F7 | Main payment and confirmation actions |
| Success | #237a57 | #54b98a | Confirmed and available seats |
| Success soft | #e0f1e8 | #1f3d31 | Success surface |
| Warning | #9a5a00 | #e3a03d | Premium seats and cautions |
| Warning soft | #fff0d8 | #493515 | Premium seat surface |
| Danger | #B42338 | #EF6C7A | Failure and destructive actions |
| Danger soft | #F9E5E8 | #4A252C | Failure surface |
| Info | #165d8b | #67b7e8 | Informational message |
| Focus ring | #948FB0 | #CEC9EA | Keyboard focus |

### 3.3 Colour rules

- Lilac is the only brand selection colour. Ink-black is the primary action colour.
- Green, amber and danger colours communicate status. Each must include a text label or icon.
- Secondary text may be used for metadata only after passing contrast checks.
- Never use colour as the only indication of seat, payment or booking state.
- Disabled controls must have both muted colour and no interactive behaviour.

### 3.4 CSS token starter

    :root {
      --cs-outer-canvas: #0A0A0A;
      --cs-canvas: #F6F6F6;
      --cs-surface: #ffffff;
      --cs-surface-raised: #FFFFFF;
      --cs-surface-muted: #F1F0F2;
      --cs-border: #E3E0E5;
      --cs-text-primary: #151515;
      --cs-text-secondary: #6A6570;
      --cs-text-disabled: #A4A0A8;
      --cs-text-on-accent: #111111;
      --cs-accent: #CEC9EA;
      --cs-accent-hover: #BEB9DA;
      --cs-accent-active: #948FB0;
      --cs-accent-soft: #EEECEF;
      --cs-action-primary: #111111;
      --cs-action-hover: #292929;
      --cs-action-active: #000000;
      --cs-text-on-action: #FFFFFF;
      --cs-success: #237a57;
      --cs-success-soft: #e0f1e8;
      --cs-warning: #9a5a00;
      --cs-warning-soft: #fff0d8;
      --cs-danger: #B42338;
      --cs-danger-soft: #F9E5E8;
      --cs-info: #165d8b;
      --cs-focus-ring: #948FB0;
      --cs-shadow: 0 10px 28px rgba(28, 27, 26, 0.10);
    }

    [data-theme="dark"] {
      --cs-outer-canvas: #0A0A0A;
      --cs-canvas: #181818;
      --cs-surface: #232323;
      --cs-surface-raised: #2B2B2B;
      --cs-surface-muted: #292929;
      --cs-border: #383838;
      --cs-text-primary: #F7F7F7;
      --cs-text-secondary: #C5C1C9;
      --cs-text-disabled: #79757D;
      --cs-text-on-accent: #111111;
      --cs-accent: #CEC9EA;
      --cs-accent-hover: #DED9F0;
      --cs-accent-active: #BEB9DA;
      --cs-accent-soft: #332F3A;
      --cs-action-primary: #F7F7F7;
      --cs-action-hover: #FFFFFF;
      --cs-action-active: #E7E7E7;
      --cs-text-on-action: #111111;
      --cs-success: #54b98a;
      --cs-success-soft: #1f3d31;
      --cs-warning: #e3a03d;
      --cs-warning-soft: #493515;
      --cs-danger: #ef6c7a;
      --cs-danger-soft: #4a252c;
      --cs-info: #67b7e8;
      --cs-focus-ring: #CEC9EA;
      --cs-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
    }

### 3.5 Bootstrap mapping

Configure Bootstrap once globally so custom components and Bootstrap controls share the same system.

    :root {
      --bs-body-bg: var(--cs-canvas);
      --bs-body-color: var(--cs-text-primary);
      --bs-primary: var(--cs-action-primary);
      --bs-success: var(--cs-success);
      --bs-warning: var(--cs-warning);
      --bs-danger: var(--cs-danger);
      --bs-border-color: var(--cs-border);
      --bs-link-color: var(--cs-accent);
      --bs-link-hover-color: var(--cs-accent-hover);
    }

Do not use default Bootstrap blue or other unthemed utility colours.

## 4. Typography

### 4.1 Font family

Use Manrope as the primary user-interface font. It is friendly, legible and handles movie metadata and transactional information well.

    --cs-font-sans: "Manrope", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --cs-font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;

If Manrope cannot be bundled, use the fallback stack. Do not add a decorative display serif. Posters provide the required visual character.

### 4.2 Type scale

| Style | Desktop | Mobile | Weight | Use |
|---|---:|---:|---:|---|
| Display | 40px / 48px | 32px / 40px | 750 | Welcome and confirmation headline |
| H1 | 32px / 40px | 28px / 36px | 700 | Movie or page title |
| H2 | 24px / 32px | 24px / 32px | 700 | Major page section |
| H3 | 18px / 26px | 18px / 26px | 700 | Theatre, card, panel title |
| Body | 16px / 24px | 16px / 24px | 500 | Main readable content |
| Small body | 14px / 20px | 14px / 20px | 500 | Supporting content |
| Label | 14px / 20px | 14px / 20px | 700 | Input labels and controls |
| Caption | 12px / 16px | 12px / 16px | 600 | Compact metadata |
| Numeric | 14px / 20px | 14px / 20px | 700 | Price, seat, time, booking code |

Typography rules:

- Use only one H1 per route.
- Left align customer-page headings. Center alignment is only for focused success, error and empty states.
- Use tabular numerals for money, dates, showtimes, seat IDs and booking codes.
- A metadata line may use one middle dot, for example Action · English · 2h 15m.
- Limit paragraph measure to approximately 65 characters.

## 5. Spacing, Grid and Shape

### 5.1 Spacing scale

| Token | Value | Typical use |
|---|---:|---|
| 1 | 4px | Icon-to-text and tight internal gap |
| 2 | 8px | Label/helper-text gap |
| 3 | 12px | Compact content padding |
| 4 | 16px | Default component padding |
| 5 | 20px | Form groups and mobile sections |
| 6 | 24px | Card padding and content groups |
| 8 | 32px | Major card/page grouping |
| 10 | 40px | Desktop section gap |
| 12 | 48px | Page block separation |
| 16 | 64px | Large page separation |

### 5.2 Layout rules

| Context | Rule |
|---|---|
| Customer desktop page | Maximum content width 1200px, 24px horizontal padding |
| Admin desktop page | Maximum content width 1440px, 24px horizontal padding |
| Mobile below 768px | Full width with 16px horizontal padding |
| Movie catalogue | 2 columns at 576px, 3 columns at 768px, 4 columns at 1200px |
| Forms | Single column by default; two columns only for related short fields |
| Seat map | Allow horizontal scroll on small screens. Never reduce tap targets below 40px |

### 5.3 Shape and elevation

| Element | Radius | Elevation |
|---|---:|---|
| Buttons, inputs and chips | 10px | No shadow by default |
| Movie cards, panels and tickets | 16px | Border first, subtle shadow when raised |
| Modal | 20px | Stronger tinted shadow |
| Seat buttons | 8px | No shadow |
| Avatar | 999px | No shadow |

Use a one-pixel border before adding shadow. Shadows must be subtle and theme-tinted, never pure black.

## 6. Images and Iconography

### 6.1 Icons

Use one icon library across the project, preferably Tabler Icons. Use 1.8px stroke, 20px for normal controls and 24px for prominent actions.

| Purpose | Icon |
|---|---|
| Location | Map pin |
| Date | Calendar days |
| Time | Clock |
| Search | Search |
| Ticket | Ticket |
| Seat | Armchair |
| Profile | User circle |
| Booking history | Receipt |
| Success | Circle check |
| Error | Circle alert |
| Close | X |

Never hand-draw SVG icons. Never use emoji as interface icons.

### 6.2 Poster rules

- Poster aspect ratio is 2:3.
- The image container uses fixed 2:3 ratio and cover fit, avoiding layout shift.
- Use poster alt text in the format Poster for Movie Title.
- Missing posters use a neutral image fallback and retain title as accessible text.
- Do not overlay chips, labels or booking CTAs on poster imagery.
- Keep poster metadata below the image.

## 7. Navigation and Global Shell

### 7.1 Desktop navbar

- Fixed height: 72px.
- Left side: FilmTIX wordmark.
- Main navigation: Movies and My Bookings when signed in.
- Right side: location selector, theme switch, profile menu or Login.
- Surface uses canvas background and a bottom border.
- Active navigation item uses an ink underline, not a filled pill.
- Navbar may be sticky, but must not obscure focused elements.

Below 768px, navigation becomes an accessible off-canvas menu. Preserve locations, login/profile and all core routes.

### 7.2 Footer

Use a compact footer surface with project contact/help text, copyright and simple links. Do not add fake version numbers, decorative slogan strips, weather, time-zone or stock counters.

## 8. Component Standards

### 8.1 Buttons

| Variant | Visual treatment | Use |
|---|---|---|
| Primary | Ink-action background with on-action text | Book tickets, proceed, confirm |
| Secondary | Lilac background with on-accent text | View details, Back, Pay by QR |
| Ghost | Transparent, primary text | Clear filters, cancel |
| Danger | Danger surface with white text | Admin destructive action |
| Icon-only | Transparent or secondary surface | Search, close, theme |

Rules:

- Default height is 44px. Compact height is 40px. Checkout primary action is 48px.
- Default horizontal padding is 16px.
- Labels never wrap on desktop.
- Add an icon only when it improves understanding.
- Hover may use a 150ms colour transition. Press uses translateY(1px).
- Disabled buttons use muted surface/text and cannot receive a click action.
- Focus ring must be 3px and visually distinct.

### 8.2 Inputs and forms

Every field has a visible label above it. Placeholder content may offer an example but never replaces a label.

| Property | Requirement |
|---|---|
| Input height | 44px |
| Background | Surface |
| Border | 1px border token |
| Radius | 10px |
| Label gap | 8px above field |
| Helper/error gap | 8px below field |
| Focus | Lilac border plus visible focus ring |
| Error | Danger border and plain error copy |
| Disabled | Muted surface and disabled text |

Required fields show Required helper text or a documented asterisk legend. Password fields have a labelled show/hide button.

### 8.3 Filters, tabs and badges

| Component | Use | Selected state |
|---|---|---|
| Filter chip | City, genre, language, theatre | Lilac-soft surface, lilac border/text |
| Date chip | Day and date selection | Lilac selection background and on-accent text |
| Tab | Upcoming/Past booking, admin sections | Underline indicator |
| Status badge | Booking, payment, movie status | Semantic status colour and label |

Do not make every navigation control into a rounded filled pill.

### 8.4 Alerts and feedback

| Situation | Required pattern |
|---|---|
| Form error | Inline error below relevant field |
| Seat conflict | Persistent alert above map plus reload action |
| Network problem | Contextual alert with retry action |
| Payment success | Confirmation page plus success alert |
| Small completed action | Dismissible toast |
| Loading | Skeleton matching final layout |
| Empty result | Icon, short explanation and clear next action |

Approved copy examples:

- No movies match these filters. Try another date or clear filters.
- B3 was just booked by someone else. Choose another seat to continue.
- You do not have any upcoming bookings yet. Browse movies to plan your next show.
- Mock payment was not completed. Your seats are still available.

## 9. Booking-Specific Components

### 9.1 Movie card

    ┌──────────────────────┐
    │                      │
    │       Poster         │
    │                      │
    ├──────────────────────┤
    │ Movie title          │
    │ Action · English     │
    │ 2h 15m   Star 8.2    │
    │                      │
    │ [ View shows ]       │
    └──────────────────────┘

- Image remains the visual focus.
- Use 16px radius, hidden image overflow and 16px text padding.
- Whole card may be clickable, but View shows remains visible.
- Movie title clamps at two lines.
- Card hover only lifts by 2px. Disable motion for reduced-motion preference.

### 9.2 Movie detail

Desktop uses two columns. Mobile stacks content.

| Left column | Right column |
|---|---|
| 2:3 poster, maximum width 280px | Title, metadata, rating, release date, description, trailer, Book tickets |

Trailer is a secondary link/button that opens a new tab. Book tickets is the only primary action.

### 9.3 Theatre and showtime list

A theatre is a bordered group rather than a heavy card stack.

    Theatre name
    Address and format

    Morning        Afternoon        Evening
    [ 10:00 AM ]   [ 2:30 PM ]      [ 6:00 PM ] [ 9:15 PM ]

- Theatre title uses H3.
- Showtime controls are 44px high with tabular numbers.
- Available time uses secondary style. Selected time uses lilac selection.
- Past/unavailable times are visibly disabled.
- Group by time period only when enough shows exist.

### 9.4 Date selector

- Render the next 5-7 days in a horizontally scrollable row.
- A date chip displays weekday plus date.
- Selected date uses lilac selection with on-accent text.
- Today may have a small helper label but always displays real date.
- Past dates are not selectable.

### 9.5 Seat map

                        SCREEN
            ─────────────────────────────────
    A       [A1] [A2] [A3]   [A4] [A5] [A6]
    B       [B1] [B2] [B3]   [B4] [B5] [B6]
    C       [C1] [C2] [C3]   [C4] [C5] [C6]

    Available  Selected  Booked  Premium

Seat-map rules:

- Show SCREEN label above a subtle horizontal screen bar.
- Arrange seats in a grid grouped by row with clear aisle space.
- Minimum seat target: 36px desktop, 40px on touch devices.
- Row letter appears at row start and, where space allows, row end.
- On mobile, scroll the seat-map area horizontally. Do not shrink seats.
- Show legend before the grid and selection summary beside/below it depending on viewport.
- Every seat is a real button with accessible wording such as B3, regular seat, Rs 150, available.

| Seat state | Surface | Text/border | Behaviour |
|---|---|---|---|
| Available regular | Success soft | Success | Select/deselect |
| Available premium | Warning soft | Warning | Select/deselect |
| Selected | Lilac selection | On-accent | Deselect |
| Booked | Muted surface | Disabled text | Disabled |
| Layout gap | Transparent | None | Not interactive |

### 9.6 Selection summary

Always display:

- Selected seats in reading order.
- Class-wise subtotal.
- Convenience fee.
- Total amount.
- Selected count out of 6.
- Proceed to payment button, disabled until one seat is selected.

### 9.7 Checkout and mock payment

Desktop layout:

| Left: customer/payment | Right: sticky booking summary |
|---|---|
| Name, email and phone | Movie, theatre, screen, date/time |
| Payment-method radio choices | Seats and individual price |
| Confirm payment action | Fee and total |

On mobile, summary appears before the final action, with an expandable detail panel where useful. Payment methods are radio controls in selectable rows. Include this message: This project uses simulated payment only.

### 9.8 Confirmation ticket

Use a normal ticket surface, not a fake perforated-paper graphic.

Required content:

- Success icon and Booking confirmed heading.
- Booking code in monospace/tabular type with copy button.
- Movie title and poster thumbnail.
- Theatre, screen, date/time and format.
- Seats, quantity and amount paid.
- Payment method and status badge.
- Print ticket button.

The print stylesheet hides navigation, buttons and non-ticket content. QR code and PDF are future enhancements unless actually implemented.

### 9.9 Booking history

- Show Upcoming and Past tabs.
- Each item has poster thumbnail, title, theatre, show date/time, seats, amount and status.
- Upcoming item has View ticket as primary action.
- Past item has View details as secondary action.
- Mobile uses vertical cards. Desktop may use a responsive table or structured list.
- Never show another customer contact detail or booking.

### 9.10 Final booking-dashboard layout

The final FilmTIX reference establishes the default desktop booking workspace. Use it for the seat-selection route and as the visual basis for the homepage booking experience.

    ┌──────────────────────────────────────────────────────────────┐
    │ Menu / filters         FilmTIX          Profile               │
    ├──────────────────────────────────────────────────────────────┤
    │ Horizontal date strip                                           │
    ├──────────────┬───────────────────────────┬───────────────────┤
    │ Film gallery │ Seat selection workspace  │ Show and price    │
    │ 2x3 posters  │ Screen, legend, seat map  │ Movie, time, fees │
    │ View all     │ Selected-seat count        │ Two payment CTAs  │
    └──────────────┴───────────────────────────┴───────────────────┘

| Area | Desktop specification |
|---|---|
| Outer frame | Ink-black canvas, 24px padding, large 28px rounded corners around the light workspace. |
| Top utility bar | 56px high. Menu, location/filter controls, FilmTIX wordmark centered, profile at the right. |
| Date strip | 64px high, horizontal row below utility bar. Selected day uses Lilac 100. |
| Left film gallery | 220px wide. Two-column poster grid with a full-width View all button. |
| Centre seat workspace | Flexible width, minimum 420px. Largest visual area, with Select seat title, screen and map. |
| Right summary panel | 280px wide. Stacked movie summary, showtime selector, price breakdown and two actions. |
| Main action | Ink-black button, such as Pay cash or Confirm booking. |
| Secondary action | Lilac 100 button with dark label, such as Pay by QR or Back. |

On screens below 1200px, hide the film gallery behind a Browse films trigger and retain the seat map plus summary. Below 768px, stack show details, seat map and price summary vertically. The main action can use a fixed bottom bar after the full amount is shown.

## 10. Admin Design

Admin routes use the same tokens, fewer poster images and denser information.

| Screen | Pattern |
|---|---|
| Dashboard | 2-column metrics on mobile, 4-column metrics on desktop |
| Movies, theatres, shows | Title, filters, responsive table, Add button |
| Create/edit | Single-column form within a 720px maximum-width panel |
| Bookings/users | Filterable table with semantic status badges and pagination |
| Destructive action | Confirmation modal that names the exact resource |

Tables need a mobile strategy. Use labelled cards or a horizontally scrollable table with a clear visual cue. Never silently cut off fields.

## 11. Page Composition

### Home

1. Navbar.
2. Left-aligned welcome/title and compact search/filter controls.
3. Active-filter summary with Clear filters action.
4. Responsive movie grid.
5. Loading, error or empty state where appropriate.
6. Footer.

### Movie detail and show selection

1. Navbar.
2. Movie detail header.
3. Location and date controls.
4. Theatre/showtime list.
5. Footer.

### Seat selection

1. Compact show context: movie, theatre, date/time.
2. Seat legend and seat map.
3. Selection summary.
4. Continue action.

### Checkout

1. Back navigation and title.
2. Customer/payment form and booking summary.
3. Confirm action.
4. Simulated-payment note.

### Confirmation

1. Success state.
2. Ticket.
3. Print and My bookings actions.

## 12. Responsive Behaviour

| Breakpoint | Layout behaviour |
|---|---|
| Below 576px | One column, 16px page padding, full-width actions when useful |
| 576-767px | Two-column movie grid, filter chips wrap |
| 768-1199px | Two-column movie detail/checkout, summary can become sticky |
| 1200px and above | Four-column movie grid, expanded theatre/showtime groups, desktop navigation |

No screen may hide necessary theatre, date, seat, price or confirmation information on mobile. Reflow it instead.

## 13. Motion Rules

Motion must communicate feedback, hierarchy or state change.

| Interaction | Motion |
|---|---|
| Button hover | 150ms background/border transition |
| Button press | 100ms translate down 1px |
| Movie card hover | 180ms lift by 2px and subtle shadow |
| Seat selection | 150ms background/border transition |
| Loading skeleton | Low-contrast shimmer only where motion is allowed |
| Modal | 160ms opacity and scale |

Under reduced-motion preference, animation becomes instant or static. Do not add scroll hijacking, cursor effects, autoplaying video or infinite decorative animation.

## 14. Accessibility Standard

- Meet WCAG 2.1 AA contrast in both themes.
- Support keyboard navigation for filters, seats, forms, modal and skip-to-content link.
- Use semantic header, nav, main and footer regions.
- Use headings in correct sequence.
- All interactive controls have visible focus state.
- Seat buttons, theme toggle and all icon-only controls need accessible names.
- Announce seat-total updates and booking feedback with a polite live region.
- Use an alert region for submission errors.
- Do not rely on colour alone for status.
- General touch targets are minimum 44px by 44px.
- Image alt text is meaningful. Decorative imagery has empty alt text.
- Modals trap focus, close with Escape and return focus to the invoking control.

## 15. Component States

| Component | Required states |
|---|---|
| Button | Default, hover, active, focus, disabled, loading |
| Input | Default, hover, focus, filled, error, disabled |
| Movie card | Default, hover, skeleton, missing-poster fallback |
| Showtime | Available, hover, selected, past/disabled |
| Seat | Regular, premium, selected, booked, disabled |
| Alert | Info, success, warning, danger |
| List/table | Loading, populated, empty, API error, paginated |
| Modal | Open, close, focus, confirmation loading |

## 16. CSS Component Starter

    :root {
      --cs-radius-control: 10px;
      --cs-radius-card: 16px;
      --cs-radius-modal: 20px;
      --cs-space-1: 4px;
      --cs-space-2: 8px;
      --cs-space-3: 12px;
      --cs-space-4: 16px;
      --cs-space-6: 24px;
      --cs-space-8: 32px;
      --cs-transition-fast: 150ms ease;
    }

    .cs-focusable:focus-visible {
      outline: 3px solid var(--cs-focus-ring);
      outline-offset: 3px;
    }

    .cs-button-primary {
      min-height: 44px;
      border: 1px solid var(--cs-action-primary);
      border-radius: var(--cs-radius-control);
      background: var(--cs-action-primary);
      color: var(--cs-text-on-action);
      font: 700 14px/20px var(--cs-font-sans);
      padding: 12px 16px;
      transition: transform var(--cs-transition-fast), background var(--cs-transition-fast);
    }

    .cs-button-primary:hover {
      background: var(--cs-action-hover);
    }

    .cs-button-primary:active {
      background: var(--cs-action-active);
      transform: translateY(1px);
    }

    .cs-button-primary:disabled {
      background: var(--cs-surface-muted);
      border-color: var(--cs-border);
      color: var(--cs-text-disabled);
      cursor: not-allowed;
    }

    .cs-panel {
      background: var(--cs-surface);
      border: 1px solid var(--cs-border);
      border-radius: var(--cs-radius-card);
    }

## 17. Design QA Checklist

- [ ] All component colours use semantic tokens.
- [ ] Lilac selection and ink actions are used consistently.
- [ ] Text, forms, helpers and buttons pass contrast checks.
- [ ] Data-loading routes have loading, empty and error states.
- [ ] Every form has visible labels and inline errors.
- [ ] Interactive controls have focus and disabled states.
- [ ] Seat state is understandable without colour alone.
- [ ] Seat map is usable at 320px width.
- [ ] Primary action is visible and unambiguous.
- [ ] Poster containers prevent cumulative layout shift.
- [ ] Page does not mix dark and light themes.
- [ ] Desktop navigation remains one line.
- [ ] Mobile admin tables have a clear fallback.
- [ ] Success, conflict and failed-payment messages are actionable.
- [ ] Print stylesheet produces a clean ticket.

## 18. Do and Do Not

| Do | Do not |
|---|---|
| Use posters and clear theatre data as visual focus | Add decorative gradients or generic cinema illustrations |
| Use one main booking action at each step | Show competing primary buttons |
| Keep total, seats and showtime visible in checkout | Make users navigate back to verify details |
| Pair status text with colour | Use only red/green to show state |
| Scroll seat map on small screens | Shrink seat buttons until untappable |
| Preserve ticket snapshot after booking | Let later edits change past ticket display |
| State that payment is simulated | Make mock payment look like real banking |

---

This document is the visual and interaction source of truth for FilmTIX. New pages and components must use these tokens, component states, accessibility requirements and responsive rules before custom styling is introduced.
