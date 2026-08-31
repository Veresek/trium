# Plan review

After round 3 the plan is buildable. Below are accepted risks, not open decisions.

## Locked (rounds 1–3)

- Web, not Expo. React + FastAPI + Postgres. No SMTP or Google in MVP.
- Five panels: Home, Calendar, Tasks, Notes, Account. AI bar visible, disabled.
- Home = block preview (~1 h back, 3 h forward) + today’s tasks + **recent** notes.
- Tasks: title + done + description + day; undated only in Tasks; pin to a block later.
- Block = one id. Repeat = the same row shows on many days; change applies everywhere. No occurrence exceptions.
- Notes **have no date** (Keep). P3 “on a day” overridden by P30.
- Auth: email/password; verify and reset = `INSTANCE_CODE` in env. Mail in v2.
- Open registration. Delete account in MVP.
- Success: ≥ 20 days of September. Cuts: tasks → blocks → notes.

## Risks (not questions)

**1. Instance code vs “open registration”**  
The account stays inactive until you enter the env secret. On a public VPS you either publish the code (weak anti-spam) or keep it to yourself (then strangers cannot verify — that is no longer fully open). A conscious compromise instead of SMTP.

**2. Week 3 still has two pillars**  
Recurrence is now thin (a flag on one row, expand on read). Notes too (a flat list). Both should land; if cutting, recurrence goes first.

**3. Spam**  
Open form + a code that may be public. Rate-limit at deploy.

**4. Bindings that dropped**  
Note–day: no. Task–block and note–task: they do not block MVP readiness.

## Anti-persona

Teams, GTD purists, grocery-list-only people, anyone who only wants Google Calendar.

## Next

No round 4. Week 1: Docker + auth + 5 panels. Colors, exactly how many “recent” notes, JWT vs cookie — at code time, not in a questionnaire.
