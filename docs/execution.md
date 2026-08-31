# Execution

As of 29 August 2026. MVP: **end of September 2026**, after hours, solo, budget 0 PLN, OVH VPS.

**4 weeks.** Order: auth + panel shell → tasks → blocks (grid, then repeat with the same id) → notes (dateless collection). Google, Expo, AI, SMTP — not in MVP.

## MVP — must work

| # | Capability | Why |
|---|------------|-----|
| 1 | Register and log in with email + password; open registration; one account = one user | independence; others on your VPS |
| 2 | Verify and reset password with an **instance code** (env), zero SMTP | lockout and spam without mail |
| 3 | Shell: 5 panels + AI bar disabled | the app’s shape is visible immediately |
| 4 | Tasks: title, done, description, optional day; CRUD | first pillar |
| 5 | Home: **today’s** tasks + empty state (dashed + plus) | morning review |
| 6 | Tasks panel: all of them, including undated | inbox without cluttering Home |
| 7 | Blocks: one row = one id; event (title, description, start–end); times typed in; 24 h grid | second pillar |
| 8 | Home: nearby-block preview around now (~1 h back, 3 h forward) | not the full grid on Home |
| 9 | Repeat: the same block shows on many days; edit/delete changes it everywhere | no materialized occurrences |
| 10 | Notes: markdown cards **with no date**; panel = collection; Home = recent | third pillar, Keep-style |
| 11 | Delete account (Account panel) | privacy |
| 12 | Responsive web; Docker + HTTPS on the VPS | N03, N07 |

Pin a task to a block — **later in MVP**, not in the task week. An MVP block does not contain a task list inside. A note on a task — only if there is time; it does not block “done”.

**Ready to put on the VPS** when you can: create an account, verify / reset the password with the instance code, walk through Home in the morning (today’s tasks + block preview + recent notes), lay out the day in Calendar, open all tasks and the notes collection.

Product success (separate from deploy): ≥ 20 days of September with a plan in Trium.

## Later (v2)

| Idea | Condition |
|------|-----------|
| SMTP: real verify and reset by email | after the instance code |
| Draw / queue of activities in a block (habits) | optional; stable blocks |
| AI assistant — live bar | day data |
| Suggest times from title/description | same |
| Google login | after own email/password |
| Expo / native app | after web |
| Notifications | maybe never |
| Data export | unsure; does not block MVP |
| Tasks from GitHub | does not block the day |
| Task inside a block / note on a task, if they miss MVP | after events and the collection |
| Edit a single occurrence in a series | deliberately not this model |

## Out of MVP scope

- Project planner
- Polish UI
- Google OAuth, Expo, AI (bar stays dead), SMTP
- Draw inside a block
- Notifications, analytics
- Admin vs user roles
- Drag-and-drop hours onto the grid
- Separate occurrences of a repeating block (calendar exceptions)
- Note pinned to a day

## Assumptions

- Instance timezone: **Europe/Warsaw** (until there is a setting on Account).
- Block times are typed in by hand.
- Repeating block: `date` is the anchor (first day / weekday for “weekly”). No series end in MVP (it runs forward).
- `INSTANCE_CODE` in env: the same secret for account verify and password reset. On a public instance the user must know the code (e.g. README) — otherwise strangers cannot verify; that is also a spam brake. Empty in env = skip verify (convenient for a local “just me” setup).
- After register the account is **inactive** until you enter the instance code; then it works. Reset (logged out): email + instance code + new password.
- Empty: task / note CTA; empty hour window — no dummy data.
- Network / bad data: a message + retry.
- Sync = account + database.
- Home notes: a few latest by `updated_at` (e.g. 4).

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | React, responsive web (phone in the browser) |
| Backend | FastAPI |
| Database | PostgreSQL |
| Auth | email + password (hash) + `INSTANCE_CODE`; Google and SMTP not in MVP |
| Hosting | VPS, `docker compose up` everywhere |
| AI | OpenRouter, not in MVP |

## Data (sketch)

```
User        id, email, password_hash, verified_at?, created_at
Task        id, user_id, title, description, done,
            date?          — null = Tasks panel only
            time_block_id? — later in MVP; null = not pinned
            order, created_at
TimeBlock   id, user_id, title, description,
            date           — one-off day OR series anchor
            start, end     — times of day
            recurrence     — none | daily | weekly | weekdays
Note        id, user_id, title, markdown, updated_at
            (no date)
            task_id?       — optional, not required for MVP
```

Calendar for day D: blocks with `recurrence = none` and `date = D`, plus blocks whose rule hits D (the same `id` rendered on many days).

Home: `Task` with `date = today`; `TimeBlock` in the window around now (including expanded recurrence); `Note` ORDER BY `updated_at` DESC LIMIT ~4.

## Non-functional

| ID | Topic | Requirement | Priority |
|----|-------|-------------|----------|
| N01 | Performance | list < 500 ms | P0 |
| N02 | Security | hashed passwords, HTTPS, instance code not in the repo | P0 |
| N03 | Phone | responsive web | P0 |
| N04 | Privacy | no tracking; content only the owner’s; delete account | P0 |
| N05 | Sync | across devices (with login: yes) | de facto P0 |
| N06 | Language | EN | P0 |
| N07 | Cost | own OVH VPS | P0 |

Open registration: rate-limit `/register` at deploy. No captcha until it hurts.

## Integrations

| Service | What for | MVP |
|---------|----------|-----|
| Google | convenient account | no |
| OpenRouter | AI | no |
| GitHub | tasks from issues | no |
| SMTP | reset / verify by email | no (v2) |

## 4 weeks (after hours)

| Week | Goal |
|------|------|
| 1 | Docker: React + FastAPI + Postgres; email+password; `INSTANCE_CODE`; 5 panels; empty Home + AI disabled |
| 2 | Tasks: Home (today) + Tasks panel (all); title, done, description, day |
| 3 | 24 h Calendar + preview on Home; event title+description; repeat with the same id; notes as a collection + recent on Home |
| 4 | HTTPS, deploy, delete account, empty states, cut |

If week 2 does not end with today’s task list, September is spent on pipes, not the product. Cuts from week 3: recurrence first (leave one-off blocks), keep notes as a flat collection (no `task_id`).
