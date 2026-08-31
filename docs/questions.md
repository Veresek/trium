# Questions

Answer directly under the question. If unsure, write “I don’t know” and your first intuition.

---

## Round 1 — done

This produced the current `product.md`, `execution.md`, and `review.md`.

### Product

**P1.** In September, is Trium only for you, or should someone else be able to create an account from day 1?

> You can create an account for someone else but the app should be primarily for me, I should like it, and it should have features I like.

**P2.** You open Trium in the morning. What is the **one** main screen: hour grid (calendar), today’s task list, or a daily note?

> Desktop: Switch panels on the left, AI conversation bar at the top, in the main section a small calendar view on the right and today’s task list on the left, notes below them. Mobile: Switch panels at the bottom, AI bar at the top, below it a few next calendar blocks, then today’s task list, then notes further down.

**P3.** How do the three pillars connect?
- can a task hang on a day with no time?
- can a task go into a time block?
- is a note on the day, on the task, or a separate collection like Keep?

> You can assign a task to a time block and a task can hang on a day with no time. It can also be completely disconnected from the calendar. Notes can also go on a task, on a day, or a separate collection like Keep.

**P4.** Goal: more hours of work, or protecting time for “what matters”? What should the app **favor** when the day is full?

> The goal of the app is to let me plan the day conveniently and add new habits and tasks, a kind of command center. For me more hours of work means more time for what matters. Because personal development is the primary goal.

**P5.** Habits in MVP: a separate feature, a repeating task/block, or v2? (September success still mentioned habits.)

> Habits only after MVP. The idea is you can e.g. add a time block with 3 different activities and each day draw one of them. E.g. from a 30 minute block one of three random things is drawn: learning world countries, chemical elements, Greek alphabet. There is also an option for a block focused on one type of work and then you simply add nothing to the draw. Or an option that walks through the tasks in the block in order.

**P6.** Drawing from a pool and AI in the morning — is that the soul of the product (even a thin slice in MVP), or a reward after tasks+blocks+notes actually work?

> Tasks, blocks, and notes have to work. It should help me organize the day and support learning and work. I don’t care if nobody else uses it. All of this will be open source and every other feature only after MVP, such as AI which needs something to base good answers on.

**P7.** Notes: one note per day, many loose cards, or a tree of pages like mini-Notion?

> many loose cards with markdown formatting.

### Scope and September

**P8.** Of the three pillars: if by 30 September **only one** plus login shipped, which do you keep? (That does not mean we build only one — it tests what the core is.)

> Task list, then time blocks, then notes.

**P9.** “I plan every day” — how many days of September with a plan in Trium count as success if 30/30 does not happen?

> 20 days. Because life obviously has a lot of unpredictable events and changes.

**P10.** Is it allowed to cut custom email/password registration and leave Google only, or the other way: one user, no Google, to reach the day view faster?

> In MVP I would rather have custom email and password login first and Google only later. That gives independence and freedom from external services. One account per user.

### Day UX

**P11.** Time blocks: a rigid 24 h grid like Calendar, or a list of ranges (“9:00–11:00 deep work”) without drawing the whole day?

> I don’t know. I would lean toward a 24 h grid like Calendar but, like in Calendar, the user does not have to fill the whole day.

**P12.** Do you drag a task onto an hour, or type hours in by hand?

> You type hours in by hand. Eventually after MVP the app, like Todoist, suggests hours from the description or title.

**P13.** What do you see at **zero** data (first login)? One button / one placeholder — describe it.

> I already described what you see. At zero data, instead of tasks there is a button in the app colors to add the first task with a dashed border and a plus in the center, and in place of the calendar there is an empty hour grid.

**P14.** Notifications (mail, push, reminder about a block): MVP or not?

> After MVP. I don’t know if they will exist at all.

### Tech

**P15.** Instance: only you on your VPS, or multi-tenant (many strangers on one server) from the start?

> I host it on my VPS and if someone wants they can create an account and use the app on my server, and if someone wants they can host it themselves. Though the option to set it up so only I can use it is also tempting, I probably won’t go that way.

**P16.** Passwords: if Google is in MVP, do we do email+password at all? (N02 about hashing passwords could then drop.)

> Custom email and password login first, Google only later.

**P17.** Do React and FastAPI stay, or would you allow one stack (e.g. FastAPI + templates only, or React with a thinner backend) if week 1 is eaten by glue?

> React and FastAPI stay. Though I am considering React Native and Expo on the frontend to have a mobile app immediately.

**P18.** Data: delete account / export — needed in MVP (open source + privacy), or later?

> Delete account yes. Export I don’t know if it is needed in MVP.

---

## Round 2 — done

**P19.** Frontend in MVP: **responsive React (web)** and the phone in the browser, or **Expo** (one app: phone + maybe Expo web)? You cannot do both solidly in 4 weeks.

> Phone in the browser after all. The native app can come after MVP.

**P20.** The AI bar is in the layout, the assistant is not until v2. In MVP: **hide the bar**, or leave it dead (disabled / “later”)?

> Disabled. So from the start you can see how the app will look.

**P21.** What are the switch panels (sidebar / bottom tabs)? List them, e.g. Day · Calendar · Notes · Inbox · Settings. You already described Home — this is the rest of the navigation.

> In the sidebar / bottom tabs: Home, Calendar, Tasks, Notes, Account.

**P22.** On desktop Home there is a “small calendar view”, on mobile “a few next blocks”, and blocks are a 24 h grid. Is the full day grid a **separate panel**, and Home only a preview (nearby blocks)?

> Yes, the full day grid is a separate panel, and Home is only a preview of nearby blocks, e.g. 1 h back and 3 h forward or something like that.

**P23.** Tasks with no date (outside the calendar): visible in a **separate inbox** (panel), under the “today” list on Home, or only when you open all tasks?

> You only see them when we go into all tasks.

**P24.** In MVP is a time block an **event with a title** (like Calendar), with tasks sitting beside it / optionally pinned — or does the block **contain a task list inside** from the start (a seed for v2 drawing)?

> Drawing is an option, not a requirement. In MVP a time block is an event with a title and a description.

**P25.** On your VPS in September, is registration **open to anyone**, **off** (only you, accounts by hand), or an **invite code**?

> Open to anyone. Anyone can create an account and use the app on my server.

**P26.** Repeating “every Monday the same block/task”: MVP or v2 with habits?

> Every block can be repeated in a custom way, daily, weekly, or on specific days of the week.

**P27.** Task in MVP: is **title + done + day/block** enough, or description, priority, or subtasks from the start?

> It should be title + done + description and day, and the block only later in MVP.

---

## Round 3 — done

**P28.** Repeating a block: do edit and delete **always apply to the whole series**, or do you need to change / delete **one occurrence** (like Google Calendar)? One occurrence is a lot more code.

> Every block has its own id and that block with a given id can be set as repeating e.g. daily, and then a change on any of the days changes it everywhere because it is the same block with the same id.

**P29.** Open registration: do **any emails go out** in MVP (account verify, password reset)? If not — the account works immediately, reset in v2.

> After MVP. In MVP a hardcoded code for account verification and password reset.

**P30.** Notes on Home: only cards pinned to **today**, or also a slice of the Keep collection (e.g. recent)?

> I did not expect notes to have a specific date, so just something like recent.
