# Cowboy Wire 2.0

**Classroom display and teacher management system for Riverdale High School**

Built by Mr. Joe · CTE/ROP · Room 27 · Riverdale High School

---

## What It Is

Cowboy Wire is a real-time classroom display system. It runs on a TV at the front of the room and shows students the bell schedule, upcoming events, weather, honor roll, birthdays, pass status, and teacher announcements — all automatically, all day.

Version 2.0 is a ground-up rebuild of the original [Cowboy Wire 1.0](https://ejoe-ui.github.io/rhs-flipboard/display.html), designed from the start to support multiple classrooms, multiple teachers, and a proper management interface.

---

## Architecture

| Layer | Technology | URL |
|---|---|---|
| Display (TV-facing) | Vanilla JS | `cowboy-wire.vercel.app/display?room=27` |
| The Switchboard (teacher UI) | Next.js | `cowboy-wire.vercel.app/switchboard` |
| Database | Supabase (shared with PassAble) | `lgsfrhibzxjwcudjvfzx` |
| Auth | Google OAuth (`@rjusd.org`) | via Supabase |
| Hosting | Vercel | free tier |

Cowboy Wire 1.0 remains live at `ejoe-ui.github.io/rhs-flipboard` until 2.0 is stable.

---

## Two-Tier Content Model

### School-Wide (managed by admin, shown in all rooms)
- Bell schedule
- Calendar events and countdowns
- Weather
- Honor Roll ticker
- Quick messages / announcements

### Per-Room (managed by each teacher via The Switchboard)
- PassAble live pass status
- Birthdays (from that room's roster only)
- Period objectives
- Room-specific announcements
- Custom countdowns
- Noise meter thresholds
- Which school-wide slides to show or hide

---

## Database Tables (Supabase, `cw2_` prefix)

| Table | Purpose |
|---|---|
| `cw2_classrooms` | Room registry — room number, teacher, config |
| `cw2_teachers` | Teacher accounts linked to Supabase auth |
| `cw2_screens` | Slide content per room |
| `cw2_settings` | Per-room toggle states and preferences |
| `cw2_messages` | Quick messages — pending, approved, expired |
| `cw2_events` | School-wide calendar events and countdowns |
| `cw2_honor_roll` | Honor roll student list |
| `cw2_birthdays` | Student birthdays per room |
| `cw2_objectives` | Period objectives per room |
| `cw2_privacy` | FERPA opt-out list — students excluded from all displays |

### Privacy (`cw2_privacy`)
Parents may request their student not appear on any public display. This table stores opted-out student IDs. Affects: birthdays, honor roll, PassAble pass status on display, any student-facing content. Managed per-room via The Switchboard. Can be imported from a list or added manually.

---

## The Display

Vanilla JS single-page app. Loads via `?room=27` URL parameter.

**Features:**
- Flip board tile animation (carried over from 1.0)
- Real-time Supabase data — no Google Sheets dependency
- Per-room content scoping
- Bell schedule auto-detection (regular, block, minimum, foggy, finals)
- Period timer and pass status pill in header
- Noise meter (mic-based, 8-bar VU display)
- Honor Roll ticker
- Classroom timer with Westminster / Close Encounters chime

**Themes (one new per semester):**
- Retro Dark / Retro Light (carried from 1.0)
- Modern Dark / Modern Light (carried from 1.0)
- WALL-E Mode — warm, dusty, CRT amber, analog
- EVE Mode — clean, white, holographic blue
- More added each semester

---

## The Switchboard

Next.js teacher management interface.

**Features:**
- Google OAuth login (`@rjusd.org` accounts only)
- Screen toggle states persist to Supabase (and sync to display)
- Post direct messages to the board
- Manage period objectives
- Add/remove birthdays
- Upload honor roll (CSV)
- Add custom countdowns
- Manage FERPA privacy list (add/remove students by ID)
- Slide editor with drag-to-reorder
- View pending and live posts

---

## Auth

Google OAuth via Supabase. Teachers sign in with their `@rjusd.org` Google Workspace account. No magic links, no email rate limits, no temp passwords.

RLS (Row Level Security) baked in from day one — teachers can only read and write their own room's data.

---

## Privacy and FERPA

Student names appear on the display for: birthdays, honor roll, and PassAble pass status.

Any student can be added to `cw2_privacy` to suppress their name from all displays campus-wide. The Switchboard allows teachers to manage their room's opt-out list. Import from a CSV or add individually by student ID.

---

## Deployment

- Push to `main` branch → Vercel auto-deploys
- Display: static HTML/JS, no build step
- Switchboard: Next.js, builds on Vercel automatically
- Environment variables managed in Vercel dashboard

---

## Related Projects

| Project | Repo | URL |
|---|---|---|
| PassAble (hall pass) | `ejoe-ui/hall-pass` | `hall-pass-lime.vercel.app` |
| Cowboy Wire 1.0 | `ejoe-ui/rhs-flipboard` | `ejoe-ui.github.io/rhs-flipboard` |
| (Amp If I) | TBD | TBD |

---

## Build Roadmap

**Summer 2026**
- [ ] Supabase schema — all `cw2_` tables with RLS
- [ ] Google OAuth setup
- [ ] Display: vanilla JS shell with `?room=` param loading
- [ ] Display: flip board tile system (port from 1.0)
- [ ] Display: bell schedule auto-detection (port from 1.0)
- [ ] Display: Supabase data slots (calendar, weather, countdowns, etc.)
- [ ] Display: WALL-E and EVE themes
- [ ] The Switchboard: Next.js app scaffold
- [ ] The Switchboard: teacher login and room scoping
- [ ] The Switchboard: screen toggles that persist
- [ ] The Switchboard: period objectives
- [ ] The Switchboard: message posting and approval queue
- [ ] The Switchboard: birthday manager with FERPA privacy filter
- [ ] The Switchboard: honor roll upload
- [ ] The Switchboard: teacher onboarding flow
- [ ] Multi-room deployment and testing (Room 26 beta)
- [ ] Cut Room 27 over from 1.0 to 2.0

**Fall 2026**
- [ ] Sports feed integration (BigTeams / Schedule Star)
- [ ] Photo and video tiles
- [ ] iframe embed support
- [ ] Digital anchor chart tile
- [ ] New semester theme
- [ ] Expand to additional classrooms

---

*Cowboy Wire 2.0 · Riverdale High School · Built with Supabase, Next.js, and Vercel*
