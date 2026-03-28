---
name: planning-with-files
description: "Use automatically for any complex multi-step task requiring more than 5 tool calls. Creates persistent planning files (task_plan.md, findings.md, progress.md) to serve as working memory on disk — preventing context loss during long sessions."
risk: low
source: community
date_added: "2026-03-28"
---

# Planning with Files (Manus-style)

## Core Insight

Claude's context window is volatile RAM. The filesystem is persistent disk. For any complex task, important state must be written to disk — so work can resume without losing goals, findings, or progress.

## When to Activate

**Automatically activate when the task requires:**
- More than 5 tool calls to complete
- Multiple phases (research → implement → test → deploy)
- Refactoring across multiple files
- Building new features end-to-end
- Any task where losing track would cause rework

**Do NOT activate for:**
- Simple one-file edits
- Quick lookups or explanations
- Tasks completable in 2–3 tool calls

---

## The Three Planning Files

Create these in the project root (or `.tmp/` if root is noisy):

### `task_plan.md` — The Goal Anchor
Structured plan with phases and acceptance criteria. Re-read before every major decision.

### `findings.md` — The Evidence Log
Key facts discovered during research. Append after every 2 search/read operations.

### `progress.md` — The Progress Tracker
Current phase, completed steps, errors encountered, next actions.

---

## Five Critical Rules

### Rule 1: Create Plan First
NEVER start a complex task without writing `task_plan.md` first.
Write the plan, then execute it. No exceptions.

### Rule 2: The 2-Action Rule
After every **two** search, read, or browse operations → save key findings to `findings.md` immediately.
Do not wait until "the research phase is done." Write incrementally.

### Rule 3: Read Before Decide
Before any major decision or phase transition → re-read `task_plan.md`.
This keeps the original goal in the attention window.

### Rule 4: Update After Act
After completing each phase or step:
- Mark it complete in `progress.md`
- Log any errors or surprises
- Note files created or modified

### Rule 5: Never Repeat Failures
Track what was tried in `progress.md`. If an approach failed, do not retry it. Mutate the approach.

---

## Workflow

### Step 1: Create Task Plan

```markdown
# task_plan.md

## Goal
<1-2 sentences: what success looks like>

## Phases
- [ ] Phase 1: <name> — <description>
- [ ] Phase 2: <name> — <description>
- [ ] Phase 3: <name> — <description>

## Acceptance Criteria
- <criterion 1>
- <criterion 2>

## Out of Scope
- <exclusion 1>

## Open Questions
- <blocking question if any>
```

### Step 2: Initialize Progress File

```markdown
# progress.md

## Status: IN PROGRESS
**Current Phase:** Phase 1 — <name>
**Started:** <timestamp>

## Completed Steps
(none yet)

## Errors / Blockers
(none yet)

## Failed Approaches (do not retry)
(none yet)

## Next Action
<specific next step>
```

### Step 3: Initialize Findings File

```markdown
# findings.md

## Research Log

### Finding 1 — <topic>
<key fact>
Source: <file:line or URL>

```

### Step 4: Execute and Update

For each phase:
1. Re-read `task_plan.md` (Rule 3)
2. Do the work
3. After every 2 reads/searches → append to `findings.md` (Rule 2)
4. After completing phase → update `progress.md` (Rule 4)
5. If blocked → apply 3-strike error protocol (see below)

### Step 5: Complete

When all phases done:
- Mark `progress.md` status as `COMPLETE`
- You may delete the planning files or leave them — ask user preference

---

## 3-Strike Error Protocol

When something fails:

**Strike 1:** Diagnose root cause. Read error carefully. Check assumptions. Try the most targeted fix.

**Strike 2:** Try an alternative approach. Log the failed approach in `progress.md` under "Failed Approaches."

**Strike 3:** Rethink the strategy. Is the architecture wrong? Is there a simpler path?

**After 3 strikes:** STOP. Escalate to the user with:
- What you tried (3 approaches)
- What you learned
- Your best hypothesis for why it's failing
- A concrete question or decision needed

Do NOT attempt a 4th fix without user input.

---

## Session Recovery

If the session was cleared (`/clear`) or a new session starts mid-task:

1. Check for `.tmp/task_plan.md`, `.tmp/progress.md`, `.tmp/findings.md`
2. If they exist → read all three before doing anything else
3. Resume from "Next Action" in `progress.md`
4. Inform the user: "Resuming from previous session — currently on Phase X."

---

## Template: Complex Refactor

```markdown
# task_plan.md

## Goal
Refactor authentication module into separate services (auth, session, permissions).

## Phases
- [ ] Phase 1: Audit — map all current auth code and its dependencies
- [ ] Phase 2: Design — define new service boundaries and interfaces
- [ ] Phase 3: Implement — create new services, migrate code
- [ ] Phase 4: Test — verify all auth flows still work
- [ ] Phase 5: Cleanup — remove old code, update imports

## Acceptance Criteria
- All existing auth tests pass
- No direct imports of old auth module remain
- New services have their own test files

## Out of Scope
- Changing auth provider (Clerk stays)
- Adding new auth features
```

---

## Quick Reference

| Rule | Trigger | Action |
|------|---------|--------|
| Create plan first | Task start | Write `task_plan.md` |
| 2-action rule | After 2 reads/searches | Append to `findings.md` |
| Read before decide | Before phase transition | Re-read `task_plan.md` |
| Update after act | After completing phase | Update `progress.md` |
| Never repeat failures | Approach failed | Log it, try different |
| 3-strike escalate | 3 failed attempts | Stop, ask user |
| Session recovery | New session mid-task | Read all 3 files first |
