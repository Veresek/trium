# Product

**Trium** is a **command center for the day**: tasks, time blocks, and notes in one place. Not a project planner.

The name is indeclinable, like Notion / Todoist. UI in English. Open source (GPL-3.0).

You are the first and primary user. The app should look and feel right to you, and ship features you actually want. Other people may sign up on your VPS (open registration) or run their own instance.

## Problem

The tools exist, but each covers only a slice:

| Tool | You take | You leave |
|------|----------|-----------|
| Todoist | fast task capture, clean UI | no notes, no day plan |
| Notion | markdown notes, look | too many features, hard to start clean |
| Google Keep | simple notes | no day plan |
| Google Calendar | time blocks | clunky and slow for daily use |

Today: several apps at once → no coherence. Trium should be **one place** for the day.

## Who it is for

- **Yes:** you (and someone with a similar profile) who wants to plan the day on purpose and keep tasks + calendar + notes together.
- **No:** people who do not want to plan the day; teams and project management.

## What should change

Primary goal: **personal development**. More hours of work = more time for what matters. The app should make it easy to lay out the day, capture tasks, and (later) habits — not maximize a packed calendar for its own sake.

- **After a week:** you sort the day faster, less friction while planning.
- **After a month:** you use Trium as the center of the day instead of bouncing between tools.

## Navigation

Five panels (sidebar on desktop, bottom tabs on mobile):

| Panel | What is there |
|-------|----------------|
| **Home** | Morning review: today's tasks, nearby-block preview, recent notes |
| **Calendar** | Full 24 h grid |
| **Tasks** | All tasks, including undated |
| **Notes** | Loose cards (Keep-style) |
| **Account** | Account, verify / reset via instance code, delete |

An AI bar sits at the top of every screen — **visible, disabled** — so the shape of the app is obvious from day one. The assistant itself is v2.

## Home (morning review)

**Desktop:** panels on the left; AI bar at the top (disabled); in the middle, today's task list (left) and calendar preview (right); recent notes below.

**Mobile:** panels at the bottom; AI bar at the top (disabled); block preview under it; today's tasks below that; recent notes further down.

The calendar preview is a **window around now** (about 1 h back and 3 h forward), not the full grid. The full grid lives in Calendar.

Empty state: where tasks would be, a button in the app colors (dashed border, plus in the center) to add the first task; on the preview / grid — empty hours, no fake events; notes get a similar CTA or sit empty.

Undated tasks do not appear on Home — they live in Tasks. Notes on Home are the **most recently edited** from the collection, not a “daily note”.

## How the three pillars connect

**Task** (title, done, description, optional day):

- hang on a day with no time,
- sit fully outside the calendar (visible in Tasks, not on Home),
- pin to a block only after blocks land in MVP, not in the first task slice.

**Note** is a loose markdown card **with no date** (Keep-style). The Notes panel is the full collection. Home shows a few recent ones. Optionally attach a note to a task if week 3 has time; there is no note pinned to a day.

**Time block** is **one row, one id**. Event: title, description, start–end. It can repeat (daily / weekly / chosen weekdays) — then the same block shows on many days. Edit or delete applies **everywhere**, because it is the same object. There is no “this occurrence”. The day does not have to be filled. Times are typed in by hand.

Drawing activities from a pool inside a block is a **v2 option**, not the MVP model — in MVP a block is not a list of tasks inside an event.

## Scenarios

1. **New stage of life** — too little time; Trium should stay light to plan with. Habits and *randomness in a block* are v2.
2. **Own / small project** — notes for yourself only. This is not a shared planner with a friend.
3. **Morning review** — you wake up, Home shows the day, you leave with the day laid out. AI is v2 (the bar is already there).

## v2 (do not promise this for September)

- **Habits / pool in a block:** e.g. a 30 min block with 3 activities; each day **one is drawn** (world countries / chemical elements / Greek alphabet). Variant: a block focused on one kind of work, no draw. Variant: a queue — in order, not random.
- **AI** (OpenRouter) — turn the top bar on; suggest times from title/description like Todoist.
- Email (verify, reset), Google login, notifications, native app (Expo), GitHub, export.
- Pinning tasks to blocks if it does not make the end of MVP.
- Separate occurrences in a series (like Calendar) — deliberately out.

## Success and failure

**Success for September 2026:** ≥ **20 days** of September have a plan in Trium (life has unpredictable days — not 30/30).

If something must be cut: **task list → time blocks → notes**. Email/password login ships with the first pillar. Block recurrence (one id, many days) sits with blocks — if week 3 blows up, ship one-off events first, then the repeat flag.

**Failure when:** using it feels forced; the day is incoherent again; you need several apps again.

## Deliberate limits

- UI language at start: **English**.
- MVP: **web** (phone in the browser). Expo / native app after MVP.
- You are **not** building a project planner.
- Open source, **GPL-3.0**, no analytics / tracking. Accounts and content live in the instance database.
- Registration on your VPS: **open**. Self-host for anyone who wants it.
- Verify and password reset in MVP: **instance code** from config (env), not email. Real mail after MVP.
- Notifications: not in MVP (maybe never).
- Auth in MVP: **own email + password**, not Google. One account = one user.
