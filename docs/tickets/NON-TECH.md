# Non-Technical Contributor Guide — Glocal Packages

How to help build this project **without writing code**. Some of these plans
need nothing but a browser, a document, and your judgment; others show you how
to get real work done through an AI coding assistant (Claude Code, ChatGPT,
Copilot, etc.) even with zero programming knowledge.

---

## 1. The project in plain language

We are building one website with three faces:

1. **A public search page** — like a tiny app store. People open an iOS app,
   which shows this page, and they search for and download "asset packages"
   (language apps) in their own language.
2. **An admin dashboard** — a private page where trusted reviewers look at
   newly submitted packages and click **Approve** or **Reject**. Only approved
   packages appear on the public page.
3. **A mailbox for machines** — a publishing service called *Scriptoria*
   automatically tells our site "a new package was just published." Nobody
   sees this part; it just fills the review queue.

So the pipeline is: **Scriptoria submits → an admin reviews → the public sees
approved packages → the iOS app downloads them.**

Almost everything around that pipeline — the words, the rules, the testing,
the translations, the coordination — is non-technical work, and right now most
of it doesn't exist yet.

---

## 2. Ground rules (read these first)

These keep you safe and keep the project safe:

1. **You cannot break anything by looking.** Browsing the site, reading files,
   and asking an AI questions is always safe.
2. **Never work on the live (production) site.** Do your testing on the local
   or staging version — ask whoever runs the project which address to use.
3. **When an AI changes project files, it must go through review.** The rule
   is: AI works on a *branch* (a draft copy), and a developer approves the
   *pull request* (the proposed change) before it becomes real. You don't need
   to understand branches — you just need to say the magic words (see §6).
4. **Never paste secrets into anything.** If you ever see something called
   `SESSION_SECRET`, `SCRIPTORIA_API_KEY`, or a `.dev.vars` file, don't copy
   it into chats, emails, or documents.
5. **Small and finished beats big and half-done.** One polished FAQ page helps
   more than five abandoned drafts.

---

## 3. Pick a role

Each role below lists **Plan A (no AI needed)** and **Plan B (AI-assisted)**
work. Mix and match. The project's to-do list lives in this `docs/` folder as
52 tickets (BE = backend, FE = frontend, OPS = operations; indexed in
[README.md](README.md)) — several are cited below so your work plugs into the
real plan.

---

### Role 1: The Tester (highest impact, zero setup)

Software teams are always short on people who methodically try to use the
product and write down what happened. This project has a ticket for exactly
this: **FE-016 "Perform accessibility and mobile web-view QA."**

**Plan A — no AI:**

- Get the address of the running site from the team. Then work through a
  checklist like this, on your **phone** as well as a computer (the public
  page will live inside an iOS app, so phone behavior matters most):
  - Search for a language that exists. Search for one that doesn't. Search
    for nonsense (`;;;`, emoji, a 500-character string). What happens?
  - Try the admin login with a wrong password. Is the error message clear?
    Does it accidentally reveal whether the email exists? (It shouldn't.)
  - As an admin: approve a package, reject one *without* giving a reason
    (it should refuse), reject one *with* a reason. Does the history look right?
  - Turn your phone sideways. Zoom to 200%. Use it in bright sunlight.
  - If you know a right-to-left language (Arabic, Hebrew…), check that
    nothing looks mirrored or broken.
- **Write bug reports** in a shared doc or spreadsheet. A good bug report has
  four lines: *What I did. What I expected. What actually happened. Screenshot.*
  That format alone makes you more useful than most testers.
- **Recruit 3–5 outsiders** (family, colleagues) to try finding and
  "downloading" a package with no instructions. Watch silently. Write down
  where they hesitate. This is called usability testing, and it needs no
  qualifications except patience.

**Plan B — with an AI assistant:**

- Ask the AI to **run the project on your computer** so you can test the
  newest version: *"Open the project at [folder]. Read docs/RUNNING.md and
  start the app locally for me, including demo data. Tell me the address to
  open and warn me about anything that didn't work."*
- Ask it to **generate test data**: *"Create 20 realistic fake package
  notifications covering edge cases — very long names, right-to-left
  languages, missing images — and submit them to my local app so the admin
  queue has variety for testing."*
- Ask it to **turn your notes into tickets**: paste your messy testing notes
  and say *"Turn each problem into a separate bug report with steps to
  reproduce, expected vs. actual behavior, and a severity guess."*
- Ask for an **accessibility audit**: *"Check the public search page against
  WCAG basics — color contrast, screen-reader labels, keyboard-only use — and
  give me a plain-English list of problems, worst first."*

---

### Role 2: The Word Person (copy, docs, FAQ)

Every screen needs words, and right now they're placeholder-level. Error
messages, empty states ("No packages found — try…"), button labels, the admin
help text: all unwritten. Ticket **FE-015** (loading/empty/error states) and
**OPS-016** (operations documentation) both need this.

**Plan A — no AI:**

- Write the **Administrator's Handbook**: a step-by-step guide with
  screenshots — how to log in, what PENDING/ACTIVE/REJECTED/INACTIVE mean,
  how to approve, when to reject, what to write in a rejection reason. When
  new admins join, this document *is* their training.
- Write the **public-facing microcopy** in a simple table: every situation
  (searching, no results, package details, download button, error) and the
  exact words you propose. Remember the audience may not speak English well —
  aim for a 10-year-old's reading level.
- Draft a **rejection-reason library**: 8–10 pre-written, kind, clear reasons
  admins can pick from ("The description contains broken text", "Images are
  missing"…). Consistent rejections make the whole system feel fair.
- Write the **FAQ** for both audiences: end users ("Why can't I find my
  language?") and package publishers ("Why is my package still pending?").

**Plan B — with an AI assistant:**

- Have the AI **inventory every piece of text in the app** first: *"List
  every user-visible message, label, and error in this project's pages, with
  the file it lives in, as a table I can edit."* Now you have a copy
  spreadsheet to work through.
- After the team agrees on your wording, ask the AI to **apply it**: *"On a
  new branch, replace the texts in this table with my new versions. Change
  nothing else. Open a pull request for the developers to review."* This is a
  genuinely safe first "coding" contribution — text-only changes.
- Ask it to **draft the Admin Handbook with real screenshots**: *"Run the app
  locally, walk through the admin flows, take screenshots of each step, and
  assemble a draft handbook in Markdown. I'll rewrite the prose."*

---

### Role 3: The Language & Culture Expert

This product exists *for* minority-language communities — cultural and
linguistic review is core work, not a nice-to-have. Tickets **FE-007** and
**FE-008** cover localization and right-to-left support.

**Plan A — no AI:**

- **Review language data for correctness.** The catalogue stores language
  names, local names ("localname" — the language's name *in that language*),
  region names, and ISO codes. Spot-check them: is "español" capitalized
  correctly? Is the region name what locals actually call it?
- **Decide the interface languages.** Which languages must the *interface*
  (buttons, search box) support at launch? Rank them. That decision gates
  FE-007 and only needs community knowledge.
- **Translate the interface strings** once the copy table (Role 2) exists —
  or recruit and coordinate volunteer translators from the communities.
- **Culture-check the review policy** (see Role 4): what counts as
  appropriate imagery or wording differs by community; write those notes.

**Plan B — with an AI assistant:**

- Use the AI for **first-draft translations you then correct**: *"Translate
  this table of interface strings into [language]. Keep them short enough for
  buttons. Flag any string that is culturally awkward to translate."* Never
  ship AI translation unreviewed — you are the reviewer.
- Ask the AI to **check the data at scale**: *"List every language name,
  ISO 639-3 code, and region in the demo database. Flag any code that doesn't
  match the official ISO registry, and any name whose spelling differs from
  the Ethnologue/CLDR standard."*
- Have it **test right-to-left display**: *"Add a fake Arabic-language
  package to my local database and screenshot how the search page renders it."*

---

### Role 4: The Policy & Governance Person

Someone must decide the *rules* the software merely enforces. This is pure
judgment work.

**Plan A — no AI:**

- Write the **Moderation Policy**: what gets approved? What gets rejected?
  Who reviews packages, within how many days? Can a rejected publisher appeal?
  What makes an ACTIVE package get retired to INACTIVE? The app already has
  these statuses built in — but no written rules for using them.
- Define **admin account rules**: who is allowed to be an administrator, who
  approves new admins, what happens when someone leaves (the system can
  disable accounts — decide *when* it must happen).
- Draft the **privacy and terms pages**: what data the catalogue holds
  (spoiler: no end-user accounts at all — a genuinely nice privacy story to
  tell), who to contact, takedown process.
- Write the **incident playbook** in plain English: "If a harmful package
  goes live, who does what, in what order, within what timeframe?"

**Plan B — with an AI assistant:**

- Ask the AI to **explain what the system can and can't enforce** before you
  write policy: *"Read this project's docs/SOURCE-CODE-BREAKDOWN.md and tell
  me, in plain English: what package statuses exist, what transitions are allowed, and
  what gets recorded when an admin acts?"* (Answer: every status change is
  permanently logged with who did it — great for accountability policy.)
- Have it **red-team your policy**: *"Here is our draft moderation policy.
  Play a bad actor trying to get a harmful package approved. Where are the
  gaps?"*
- Ask it to **draft privacy/terms boilerplate** for you to edit and send to
  a real reviewer/lawyer.

---

### Role 5: The Designer (no design software required)

Tickets **FE-002** (information architecture), **FE-003** (app shell),
**FE-005** (result cards) all start with decisions a non-coder can make.

**Plan A — no AI:**

- **Sketch on paper.** What does a search result card show — flag? language
  name in which script? size? region? Draw three versions, photograph them,
  let the team vote. Remember it renders inside a phone app: small screen,
  thumb-driven.
- **Choose the look**: pick 2–3 example sites whose feel is right, pick a
  color direction (the app uses a theme system, so colors are genuinely
  changeable), propose a name/logo direction.
- **Card-sort the information.** Write every piece of package info (name,
  local name, region, size, description, images…) on sticky notes and have
  2–3 people independently rank what matters most. That ranking *is* the
  design spec for the result card.

**Plan B — with an AI assistant:**

- Turn sketches into reality: *"Here's a photo of my sketch for the search
  result card. On a new branch, restyle the card to match, using the
  project's existing component library (DaisyUI). Screenshot the result for
  me."* Iterate by conversation: "bigger title, move the size to the
  corner…"
- Ask for **theme mockups**: *"Show me the catalogue page in three DaisyUI
  themes side by side as screenshots."*
- Ask it to **check your design against accessibility rules** before the team
  invests in it.

---

### Role 6: The Coordinator / Project Manager

52 tickets, 4 notional owners, dependencies between them — this project needs
someone tracking it more than it needs another coder.

**Plan A — no AI:**

- Build the **status board**: a spreadsheet or Trello with every ticket from
  this `docs/` folder, its owner, status, and what it's waiting on. Update it
  by asking humans, weekly.
- Run a **weekly 15-minute check-in**: what shipped, what's stuck, what's
  next. Publish three-bullet notes.
- Own the **launch checklist**: collect what "done" means from each person
  (policy written? translations in? staging tested? secrets set?) into one
  page everyone can see.
- Be the **Scriptoria liaison**: someone must talk to the publishing service
  team about testing the connection (ticket **OPS-014**) — that's a
  scheduling-and-email job, not a coding job.

**Plan B — with an AI assistant:**

- *"Read every ticket in the docs/ folder and give me a spreadsheet: id,
  title, owner, priority, estimated hours, dependencies, status. Then tell me
  which P0 tickets are blocked and by what."* Instant project board.
- *"Compare the tickets marked done against the actual code. Which acceptance
  criteria look unmet?"* — an honesty check no human has time to do.
- Paste meeting notes → *"Turn these into action items with owners, and
  update the status column of my board file."*

---

## 4. If you do only three things

1. **Test the app on a phone and file bug reports** (Role 1) — nothing else
   finds problems as cheaply.
2. **Write the Moderation Policy and Admin Handbook** (Roles 4 + 2) — the
   admin dashboard is useless until humans know the rules for using it.
3. **Build the ticket status board** (Role 6) — 52 tickets with no tracker is
   how hackathon projects die.

---

## 5. Getting set up with an AI coding assistant

You need three things, and a developer (or the AI itself, guided step by
step) can help with all of them in under an hour:

1. **The project on your computer** — the team shares a GitHub link; the
   assistant can walk you through "cloning" it (downloading a linked copy).
2. **The assistant itself** — e.g. Claude Code (a chat that can read and
   change the project's files, and run the app), or the chat inside an editor
   like VS Code.
3. **Your first conversation** — literally start with:
   > "I'm not a programmer. Read docs/SOURCE-CODE-BREAKDOWN.md and
   > docs/RUNNING.md in this project and explain what this app does in plain
   > English. Then help me run it locally so I can look at it. Warn me before
   > you change any file."

That last sentence — *"warn me before you change any file"* — is your
seatbelt. Use it in every session until you're comfortable.

---

## 6. Working safely with an AI: the phrasebook

Copy these phrases; they encode the safety rules so you don't have to
understand them:

| When | Say |
|---|---|
| Starting any session | "Don't change any files unless I explicitly ask." |
| Before a change | "Do this **on a new branch**, and when done, **open a pull request** — do not merge it." |
| After a change | "Show me before-and-after screenshots of what changed." |
| If it mentions deploying | "Never deploy. A developer handles staging and production." |
| If it asks for a secret/key/password | "Stop — I'll ask a developer to handle that part." |
| When unsure | "Explain what you're about to do and what could go wrong, in plain English, before doing it." |
| To wrap up | "Summarize what changed in this session as a note I can send to the developers." |

And three habits:

- **Read the AI's summary, not its code.** Your job is judging *what* was
  done, not *how*.
- **One task per session.** "Update the button text" is a task. "Improve the
  app" is not.
- **When the AI says something failed — believe it and stop.** Copy the
  message to a developer. Don't let it (or yourself) improvise around errors.

---

## 7. What NOT to touch

A few areas where even AI-assisted changes need a developer driving, because
mistakes are costly or invisible:

- Anything involving **secrets** (`.dev.vars`, `wrangler secret`, API keys).
- **`wrangler.jsonc`** and deployment — this configures the live servers.
- The **database schema and migrations** (`prisma/`, `migrations/`) — errors
  here can lose data.
- **Authentication code** (`src/lib/server/auth.ts`) — it's security-critical
  and deliberately subtle.
- Anything under **`src/lib/server/generated/`** — machine-generated; humans
  and their AIs should never edit it.

Everything else — texts, pages, styles, documents, translations, test data —
is fair game for the branch-and-pull-request routine.
