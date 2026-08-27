# Naaviverse Agent to Platform Integration Guide

> **Date:** July 2026
> **Agent:** https://naaviverse-naaviverse-path.hf.space (HuggingFace FastAPI)
> **Platform Backend:** careers-backend-node-v.1 (Express + MongoDB naavi-mock)
> **Platform Frontend:** naaviverse-frontend (React)

---

## Overview

The Naaviverse AI Agent lives on HuggingFace Spaces as a Python FastAPI service. It allows admins to generate career pathways (roadmaps) using AI, review them, and publish the best one. Once a pathway is **published** by the admin, it automatically appears in the user-facing platform — in the Paths discovery page, Step viewer, and Marketplace.

This document describes exactly how that connection was built, what files were changed, and how the data flows end-to-end.

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│          ADMIN (HuggingFace UI)          │
│  1. Generate 3 AI Paths                  │
│  2. Select and Save the Best Path        │
│  3. Click "Publish"  ──────────────────► HuggingFace FastAPI
│                                          │  naaviagent DB (MongoDB Atlas)
└─────────────────────────────────────────┘
                                           │
                                           │  Published Path JSON
                                           ▼
                   ┌────────────────────────────────────┐
                   │  GET /api/admin/paths?status=published  │
                   │  GET /api/paths/:id (full detail)       │
                   └────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────┐
│           careers-backend-node-v.1 (Express.js)          │
│  AgentPathsController.js  (NEW FILE)                     │
│                                                          │
│   syncAgentPaths()                                       │
│   - Fetches published paths from HuggingFace API         │
│   - Fetches per-path detail to get full step data        │
│   - Saves to MongoDB naavi-mock:                         │
│       paths             (path document)                  │
│       career_steps      (one document per step)          │
│       marketplace_items (resources per step)             │
└─────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────┐
│              naaviverse-frontend (React)                  │
│  Paths Page      → reads naavi-mock paths collection     │
│  My Journey Page → reads naavi-mock career_steps         │
│  Marketplace     → reads naavi-mock marketplace_items    │
└─────────────────────────────────────────────────────────┘
```

---

## New Files Created

### 1. careers-backend-node-v.1/controllers/AgentPathsController.js

The core integration file. It contains:

| Function | Purpose |
|---|---|
| `syncAgentPaths()` | Polls the HuggingFace API for published paths and imports them into the platform MongoDB |
| `getAgentPaths()` | Express route handler — triggers sync then returns paths from naavi-mock DB |
| `getAgentPathById()` | Express route handler — fetches a single path by ID from naavi-mock DB |
| `extractMarketplaceItems()` | Parses AI step JSON and extracts recommended resources into marketplace schema |
| `cleanGrade()` | Normalizes grade string to platform enum values (9, 10, 11, 12) |
| `cleanCurriculum()` | Normalizes curriculum to enum (IB, IGCSE, CBSE, ICSE, Nordic) |
| `cleanStream()` | Normalizes stream to enum (MPC, BIPC, CEC, MEC, HEC) |
| `cleanFinancial()` | Normalizes financial situation to enum (0-25L, 25L-75L, 75L-3CR, 3CR+, Other) |

**Key environment variable required in `.env`:**
```
AGENT_API_URL=https://naaviverse-naaviverse-path.hf.space
```

---

### 2. careers-backend-node-v.1/routes/AgentPathsRouter.js

New Express router mounted under `/api/agent-paths`:

```
GET  /api/agent-paths              → getAgentPaths    (triggers sync + returns paths)
GET  /api/agent-paths/:agentPathId → getAgentPathById (fetch single path from naavi-mock DB)
```

---

## Existing Files Modified

### 3. careers-backend-node-v.1/app.js or index.js (modified)

Added the new AgentPathsRouter registration:

```js
// Added this line to register the new agent paths router
app.use('/api/agent-paths', require('./routes/AgentPathsRouter'));
```

---

### 4. naaviverse-frontend/src/pages/Pathview/Pathview.jsx (modified)

The Paths Discovery page was updated to also fetch from the agent endpoint alongside the existing `/api/paths/active` endpoint.

**Before:** Only showed manually created platform paths.
**After:** Combines locally created paths AND AI agent published paths into one unified list.

Key change added — second fetch call:

```js
// Fetches AI agent published paths (triggers sync automatically)
const agentRes = await axios.get(`${BASE_URL}/api/agent-paths`);
const agentPaths = agentRes?.data?.data || [];

// Merge local + agent paths into one array
setAllPaths([...localPaths, ...agentPaths]);
```

The AI badge ("AI Generated") was also removed so agent paths and local platform paths look identical to the user.

---

### 5. naaviverse-frontend/src/pages/Pathview/pathview.scss (fixed)

Fixed a SCSS syntax error (unmatched `}` at line 242) that was preventing Webpack from compiling the frontend. The error appeared after SCSS edits and caused the entire app to fail to build.

---

## How the Sync Works (Step-by-Step)

When a user visits the Paths page, or any call hits `/api/agent-paths`:

**Step 1 — Fetch published paths from HuggingFace:**
```
GET https://naaviverse-naaviverse-path.hf.space/api/admin/paths?status=published
```
Returns a list of all admin-approved published pathways.

**Step 2 — Deduplicate check:**
For each returned path, the sync checks if that `_id` already exists in the local `paths` collection. If yes → skip (no duplicates ever created).

**Step 3 — Fetch full path details:**
The bulk list endpoint does not include step details. For each new path, the sync fetches the full document:
```
GET https://naaviverse-naaviverse-path.hf.space/api/paths/:id
```

**Step 4 — Resolve steps array:**
The agent stores steps under different keys depending on the pathway version:
```js
const steps = roadmap.steps          // older format
           || original_roadmap_data.steps  // some paths
           || roadmap.macro_path     // newer format used by most
           || [];
```

**Step 5 — Create step documents:**
For each step in the array, one `career_steps` document is created in MongoDB with all three view descriptions (macro, micro, nano) and linked to the path via `path_id`.

**Step 6 — Parse and create marketplace items:**
For each step, the sync reads the recommended resources from the AI-generated JSON and creates `marketplace_items` documents linked to the step via `step_id`.

**Step 7 — Save the path document:**
Finally, the `paths` document is saved with `the_ids` array (containing step references) embedded inside it.

---

## Data Mapping: Agent JSON to Platform Schema

### Path Document (paths collection)

| Agent JSON Field | Platform DB Field | Notes |
|---|---|---|
| `roadmap_data.path_title` | `nameOfPath`, `name`, `program` | Used as display title |
| `roadmap_data.path_description` | `description` | Card description |
| `roadmap_data.total_duration` | `length` | Parsed as integer (months) |
| `profile.grade` | `grade[]` | Enum: 9, 10, 11, 12 |
| `profile.curriculum` | `curriculum[]` | Enum: IB, IGCSE, CBSE, ICSE, Nordic |
| `profile.stream` | `stream[]` | Enum: MPC, BIPC, CEC, MEC, HEC |
| `profile.financialSituation` | `financialSituation[]` | Enum: 0-25L, 25L-75L, 75L-3CR, 3CR+, Other |
| `profile.personality` | `personality` | Enum: realistic, investigative, artistic, social, enterprising, conventional |
| `steps.length` | `total_steps` | Count of step documents |
| `id` or `_id` | `_id` | Same ID reused to link both DBs |

### Step Documents (career_steps collection)

| Agent JSON Field | Platform DB Field | Notes |
|---|---|---|
| `step.title` | `name`, `macro_name`, `micro_name`, `nano_name` | Reused across all three views |
| `step.description` | `description`, `macro_description` | Primary description |
| `step.macro_view` (string or object) | `macro_description` | Normalized from both string and object formats |
| `step.micro_view` (string or object) | `micro_description` | Normalized from both string and object formats |
| `step.nano_view` (string or object) | `nano_description` | Normalized from both string and object formats |
| `step.duration` | `macro_length`, `micro_length`, `nano_length` | Duration label (e.g. "Months 1-3") |
| `step.id` or index | `step_order` | Step sequence number |

### Marketplace Items (marketplace_items collection)

The agent stores recommended resources in two different JSON formats. Both are fully supported:

**Format A — Top-level step marketplace keys:**
```json
{
  "marketplace": {
    "macro_free": [
      { "name": "Khan Academy", "type": "Website", "why": "Free STEM resources" }
    ],
    "micro_structured": [
      { "name": "Coursera", "cost": "5000", "duration": "8 weeks" }
    ],
    "nano_expert": [
      { "name": "Career Mentor", "price": "2000 per hour", "session_details": "..." }
    ]
  }
}
```

**Format B — View-level marketplace (inside macro_view, micro_view, nano_view):**
```json
{
  "macro_view": {
    "marketplace": {
      "mentors": [...],
      "vendors": [...],
      "institutions": [...],
      "distributors": [...]
    }
  }
}
```

Both formats are normalized into the same platform `marketplace_items` schema:

| Normalized Field | Source |
|---|---|
| `layer` | Determined by which section (macro_free → macro, nano_expert → nano, etc.) |
| `name` | `raw.name` |
| `role` | `raw.type` or `raw.role`, defaults to "Resource" or "Mentor" |
| `cost` | `raw.cost` or `raw.price`, defaults to "free" |
| `goal` | `raw.why` or `raw.value` |
| `outcomes` | `raw.expected_outcomes` or `raw.value` |
| `duration` | `raw.duration` |
| `iterations` | `raw.session_details` |
| `features` | `raw.next_step` |
| `step_id` | MongoDB ObjectId of the created step document |
| `path_id` | MongoDB ObjectId of the created path document |

---

## Final Verification Results

After full integration and testing:

| Path Name | Steps Synced | Marketplace Items Synced |
|---|---|---|
| Academic and Research Pathway to Bachelor — Artificial Intelligence — Carnegie Mellon University — USA | 11 steps | 264 items |
| Hyderabad University Readiness Pathway | 4 steps | 36 items |

---

## Testing the Full Flow

1. Admin logs into HuggingFace: https://naaviverse-naaviverse-path.hf.space
2. Generates 3 AI paths, selects the best one, clicks Save then Publish.
3. User opens the Paths page on the platform (e.g., `/dashboard/users/paths`).
4. The new AI-generated path automatically appears in the list — no manual data entry needed.
5. User clicks Explore Path → all steps load correctly.
6. User clicks a step → Macro View, Micro View, and Nano View all display descriptions.
7. User clicks Discover Resources or Browse Resources → Marketplace opens with AI-recommended resources (Khan Academy, Coursera, mentors, etc.) for that specific step.

---

## Important Notes

- **Sync is lazy (on-demand):** The sync runs only when the Paths page or `/api/agent-paths` endpoint is called. There is no background polling or cron job.
- **No duplicates:** The sync checks for an existing `_id` before importing. Re-visiting the page will not create duplicate entries.
- **Data normalization:** Agent profile fields (grade, stream, curriculum, financial situation) are normalized to platform-valid enum values at import time. Invalid or unrecognized values are gracefully skipped.
- **Platform paths are untouched:** All pre-existing manually-created paths continue to work exactly as before. This is a purely additive integration.
- **Agent paths look identical to platform paths:** The "AI Generated" badge was removed from the UI so users see a consistent experience.
- **MongoDB collections used:** `paths`, `career_steps`, `marketplace_items` — all in the `naavi-mock` database on MongoDB Atlas.
- **The agent's own database (`naaviagent`) is never written to** by the platform. The integration is read-only from the agent side.
