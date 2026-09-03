Student Profile Segment Integration — Implementation Guide

1. Purpose

This document defines how to correctly connect the Dashboard and Student Signals so both pages use the same student profile data.

The key requirement is:

The selected segment, sub-segment, current position, future goal, and segment-specific student information must come from one shared student profile.

The system must support these four segments:

1. Academic & Research (Higher education, K-12, college degrees, universities, tests, research)

2. Practical & Skills (Skill learning, project portfolios, certifications, bootcamps, internships)

3. Jobs & Careers (Professional roles, career transitions, workplace readiness)

4. Non-Academic Counselling (Mental health, wellness, guidance, life coaching)

2. Current Problem

Dashboard

The Dashboard already works with multiple segments and related context.

Example:

Jobs & Careers
└── Technical Roles
    ├── Current Position
    └── Future Goal

The user can select a segment and related sub-category.

Student Signals

Student Signals previously behaved like a fixed academic profile form.

It mainly contained:

Academic Background

Personality

Geography

Because of this, when a user selects:

Jobs & Careers → Technical Roles

Student Signals still displayed academic fields.

This created two problems:

Student Signals did not know the currently active segment.

Dashboard and Student Signals could maintain different segment states.

3. Required Architecture

Use one shared student profile as the source of truth.

                    STUDENT PROFILE
                          │
             ┌────────────┴────────────┐
             │                         │
         Dashboard               Student Signals
             │                         │
             └────────────┬────────────┘
                          │
                  Shared Profile State
                          │
                    Backend API

The Dashboard and Student Signals must not independently decide which segment is active.

Both must read from and update the same profile.

4. Supported Segments

Use a consistent enum throughout frontend and backend:

const SEGMENTS = {
  ACADEMICS: "academic",
  PRACTICAL: "practical",
  JOBS_CAREERS: "jobs",
  NON_ACADEMIC_COUNSELLING: "non_academic",
};

Do not use different naming conventions in different components.

For example, avoid mixing:

jobs
job-career
Jobs & Careers
job_career

Internally use the enum value.

Use display labels only in the UI.

5. Recommended Student Profile Schema

One student should have one main profile record.

Example structure:

{
  "studentId": "student-id",

  "activeSegment": "jobs_careers",
  "subSegment": "Technical Roles",

  "personalityGeography": {
    "country": "India",
    "state": "Telangana",
    "city": "Hyderabad",
    "financialSituation": "",
    "personalitySignal": ""
  },

  "academics": {
    "degreeType": "",
    "gradeLevel": "",
    "curriculum": "",
    "academicStream": "",
    "schoolOrCollege": "",
    "currentPerformance": "",
    "currentPosition": "",
    "futureGoal": ""
  },

  "jobsCareers": {
    "currentRole": "",
    "yearsOfExperience": "",
    "industry": "",
    "targetRole": "",
    "employmentType": "",
    "currentPosition": "",
    "futureGoal": ""
  },

  "nonAcademicCounselling": {
    "concernArea": "",
    "currentChallenge": "",
    "supportTypeNeeded": "",
    "currentPosition": "",
    "futureGoal": ""
  },

  "practicalSkills": {
    "targetSkill": "",
    "skillCategory": "",
    "skillLevel": "",
    "learningMode": "",
    "projectType": "",
    "currentPosition": "",
    "futureGoal": ""
  }
}

6. Important Rule: Current Position and Future Goal Are Segment-Specific

Do not store these as one global pair.

Incorrect:

{
  "currentPosition": "Junior Software Developer",
  "futureGoal": "Senior Software Engineer"
}

This would overwrite the information when the student switches segments.

Correct:

{
  "academics": {
    "currentPosition": "B.Tech Student",
    "futureGoal": "Master's in Artificial Intelligence"
  },

  "jobsCareers": {
    "currentPosition": "Junior Software Developer",
    "futureGoal": "Senior Software Engineer"
  },

  "practicalSkills": {
    "currentPosition": "Beginner Python Developer",
    "futureGoal": "Build a full-stack open source portfolio"
  }
}

When the segment changes, the application should automatically display that segment's values.

7. Common Student Signals

Some information is useful regardless of the selected segment.

Keep this information in one shared object.

Personality & Geography
├── Country
├── State
├── City
├── Financial Situation
└── Personality Signal

This section should remain visible for all four segments.

8. Segment-Specific Student Signals

8.1 Academics

Render an academic form.

Suggested fields:

Academic Background
├── Degree Type
├── Grade Level
├── Curriculum
├── Academic Stream
├── School / College
├── Current Performance
├── Current Position
└── Future Goal

Data location:

profile.academics

8.2 Practical & Skills

Render a practical skills form.

Suggested fields:

Practical & Skills
├── Target Skill / Domain
├── Skill Level
├── Preferred Learning Mode
├── Project / Portfolio Type
├── Specific Skill / Tech
├── Current Position
└── Future Goal

Data location:

profile.practicalSkills

8.3 Jobs & Careers

Render a career-specific form.

Suggested fields:

Jobs & Careers
├── Current Role
├── Years of Experience
├── Industry
├── Target Role
├── Employment Type
├── Current Position
└── Future Goal

Data location:

profile.jobsCareers

Example:

Segment: Jobs & Careers
Sub-Segment: Technical Roles

Current Position:
Junior Software Developer

Future Goal:
Senior Software Engineer

8.4 Non-Academic Counselling

Render a counselling-specific form.

Suggested fields:

Non-Academic Counselling
├── Concern Area
├── Current Challenge
├── Support Type Needed
├── Current Position
└── Future Goal

Data location:

profile.nonAcademicCounselling

The exact field names can be expanded later based on the counselling categories supported by the product.

9. Segment Selector

Student Signals must have the same segment selector as the Dashboard.

Example:

[ Academic & Research ]
[ Practical & Skills ]
[ Jobs & Careers ]
[ Non-Academic Counselling ]

When the user selects a segment:

Update the shared profile state.

Persist the active segment.

Load/render the matching field set.

Ensure the Dashboard sees the same active segment.

10. Sub-Segment Handling

The selected sub-segment must also be part of the shared profile.

Example:

Segment:
Jobs & Careers

Sub-Segment:
Technical Roles

Recommended storage:

{
  activeSegment: "jobs_careers",
  subSegment: "Technical Roles"
}

If each segment requires separate sub-segments, a future structure can be:

{
  activeSegment: "jobs_careers",

  selectedSubSegments: {
    academics: "Engineering",
    jobsCareers: "Technical Roles",
    nonAcademicCounselling: "Personal Development",
    schoolK12: "Secondary Education"
  }
}

For the current implementation, use the structure that matches the existing Dashboard data model.

11. Single Source of Truth

This is the most important implementation requirement.

Do NOT do this:

Dashboard
└── local selectedSegment state

Student Signals
└── another local selectedSegment state

This can cause mismatched UI.

Instead:

Student Profile
└── activeSegment

Both pages use the same value.

Example:

const activeSegment = profile.activeSegment;

Changing the segment anywhere updates the profile.

12. Recommended API

Use one main student profile endpoint.

Get profile

GET /api/students/:studentId/profile

Response:

{
  "studentId": "...",
  "activeSegment": "jobs_careers",
  "subSegment": "Technical Roles",
  "personalityGeography": {},
  "academics": {},
  "jobsCareers": {},
  "nonAcademicCounselling": {},
  "schoolK12": {}
}

Update profile

PUT /api/students/:studentId/profile

The request should update the relevant fields.

Example:

{
  "activeSegment": "jobs_careers",
  "subSegment": "Technical Roles",
  "jobsCareers": {
    "currentRole": "Junior Software Developer",
    "yearsOfExperience": 2,
    "industry": "Technology",
    "targetRole": "Senior Software Engineer"
  }
}

The backend should preserve unrelated segment data.

For example, updating jobsCareers must not delete academics.

13. PATCH vs PUT

Recommended approach:

Small updates

Use PATCH:

PATCH /api/students/:studentId/profile

Examples:

Changing segment

Changing sub-segment

Updating one Student Signal field

Full form save

Use PUT when the complete profile object is intentionally sent.

If the existing backend already uses PUT successfully, keep it consistent.

The important requirement is that partial updates must not overwrite other segment objects.

14. Frontend Shared State

There are two recommended approaches.

Option A: React Query / SWR

Recommended if the project already uses a data-fetching library.

Concept:

useQuery({
  queryKey: ["studentProfile", studentId],
  queryFn: fetchStudentProfile
});

Both Dashboard and Student Signals use the same query key.

After updating:

invalidateQueries({
  queryKey: ["studentProfile", studentId]
});

This keeps both pages synchronized.

Advantages

Server data caching

Automatic refetching

Easy mutation handling

Less custom synchronization logic

Option B: React Context

Use this if the project does not currently use React Query or SWR.

Example structure:

StudentProfileProvider
├── profile
├── loading
├── updateProfile()
├── updateActiveSegment()
└── refreshProfile()

Application structure:

<StudentProfileProvider>
  <Dashboard />
  <StudentSignals />
</StudentProfileProvider>

Both pages consume:

const {
  profile,
  updateProfile,
  updateActiveSegment
} = useStudentProfile();

15. Recommended Frontend Structure

src/
├── context/
│   └── StudentProfileContext.jsx
│
├── services/
│   └── studentProfileService.js
│
├── components/
│   └── studentSignals/
│       ├── SegmentSelector.jsx
│       ├── PersonalityGeography.jsx
│       ├── AcademicFields.jsx
│       ├── JobsCareersFields.jsx
│       ├── NonAcademicCounsellingFields.jsx
│       └── SchoolK12Fields.jsx
│
├── pages/
│   ├── Dashboard.jsx
│   └── StudentSignals.jsx

16. Student Signals Rendering Logic

Recommended component structure:

<StudentSignals>
  <SegmentSelector />

  <PersonalityGeography />

  <SegmentSpecificFields />
</StudentSignals>

Conditional rendering:

switch (profile.activeSegment) {
  case "academics":
    return <AcademicFields />;

  case "jobs_careers":
    return <JobsCareersFields />;

  case "non_academic_counselling":
    return <NonAcademicCounsellingFields />;

  case "school_k12":
    return <SchoolK12Fields />;

  default:
    return null;
}

17. Dashboard Changes

The Dashboard segment selector must do more than change the visible UI.

Current possible behavior:

User clicks Jobs & Careers
        ↓
Dashboard UI changes only

Required behavior:

User clicks Jobs & Careers
        ↓
Update shared profile.activeSegment
        ↓
Save to backend
        ↓
Dashboard UI updates
        ↓
Student Signals uses same segment

Example function:

const handleSegmentChange = async (segment) => {
  updateLocalProfile({
    activeSegment: segment
  });

  await updateProfile({
    activeSegment: segment
  });
};

The exact implementation can differ based on the current project structure.

18. Student Signals Changes

When Student Signals opens:

Fetch the shared student profile.

Read activeSegment.

Highlight the correct segment.

Show common Personality & Geography.

Show the matching segment fields.

Prefill fields from the profile.

Save changes back to the same profile.

Example:

Student opens Student Signals
        ↓
Fetch Student Profile
        ↓
activeSegment = jobs_careers
        ↓
Show Jobs & Careers tab
        ↓
Render Personality & Geography
        +
Render Jobs & Careers fields

19. Data Flow

Dashboard to Student Signals

User selects:
Jobs & Careers
        ↓
Dashboard updates:
activeSegment
        ↓
API saves profile
        ↓
User navigates to Student Signals
        ↓
Student Signals fetches same profile
        ↓
Jobs & Careers is selected automatically

Student Signals to Dashboard

User selects:
Academics
        ↓
Student Signals updates:
activeSegment
        ↓
API saves profile
        ↓
User navigates to Dashboard
        ↓
Dashboard reads same profile
        ↓
Academics is selected automatically

20. Important: Do Not Lose Existing Segment Data

Suppose a student has:

Academics:
Current Position: B.Tech Student
Future Goal: Master's Degree

Then switches to:

Jobs & Careers:
Current Position: Junior Developer
Future Goal: Senior Developer

The academic data must remain stored.

Do NOT replace the entire profile with only:

{
  "jobsCareers": {}
}

The final profile should retain both:

{
  "academics": {
    "currentPosition": "B.Tech Student",
    "futureGoal": "Master's Degree"
  },

  "jobsCareers": {
    "currentPosition": "Junior Developer",
    "futureGoal": "Senior Developer"
  }
}

21. Backend Update Logic

When receiving an update:

{
  "jobsCareers": {
    "targetRole": "Senior Software Engineer"
  }
}

The backend should merge the update.

Conceptually:

profile.jobsCareers = {
  ...profile.jobsCareers,
  ...req.body.jobsCareers
};

Do the same carefully for nested objects.

Do not replace the full document unless the request intentionally contains the complete document.

22. Migration / Existing Data

Before changing the schema, check where the existing data currently lives.

Possible existing sources:

Dashboard state

Student Signals API

Student model

Separate profile model

Path generation request

Local storage

Session storage

Create a mapping before removing anything.

Example:

Existing Academic Background
        ↓
profile.academics

Existing Personality fields
        ↓
profile.personalityGeography

Existing Dashboard current position
        ↓
Active segment object.currentPosition

Existing Dashboard future goal
        ↓
Active segment object.futureGoal

Do not remove old fields until existing data has been migrated or mapped.

23. Recommended Implementation Order

Phase 1 — Understand Existing Code

Identify:

Dashboard component

Student Signals component

Existing student/profile API

Existing database model

Current segment state

Current sub-segment state

Current Position storage

Future Goal storage

Do not start by rewriting everything.

Phase 2 — Create/Update Shared Profile Schema

Add:

activeSegment
subSegment
personalityGeography
academics
jobsCareers
nonAcademicCounselling
schoolK12

Make sure existing data is preserved.

Phase 3 — Create Shared API

Implement:

GET student profile
UPDATE student profile

Test the API before changing the UI.

Phase 4 — Connect Dashboard

Update Dashboard so:

Segment Selection
        ↓
Shared Profile
        ↓
Backend

Confirm the segment persists after page refresh.

Phase 5 — Add Shared Segment Selector to Student Signals

Reuse the same component if possible.

Avoid creating two completely different segment selectors with separate logic.

Phase 6 — Create Dynamic Field Components

Create:

AcademicFields
JobsCareersFields
NonAcademicCounsellingFields
SchoolK12Fields

Render the correct component based on activeSegment.

Phase 7 — Connect Saving

Each field component should update only its relevant profile section.

Example:

Jobs & Careers form
        ↓
profile.jobsCareers

It should not modify:

profile.academics
profile.schoolK12
profile.nonAcademicCounselling

Phase 8 — Test Cross-Page Synchronization

Test:

Test 1

Dashboard → Jobs & Careers
Student Signals → Jobs & Careers

Test 2

Student Signals → Academics
Dashboard → Academics

Test 3

Refresh page

The selected segment must remain correct.

Test 4

Enter data in Academics.

Switch to Jobs & Careers.

Enter data.

Switch back to Academics.

Academic data must still exist.

24. Required Test Cases

Segment Synchronization

Dashboard segment updates Student Signals

Student Signals segment updates Dashboard

Segment persists after refresh

Segment persists after logout/login if required

Sub-Segment

Sub-segment displays correctly

Sub-segment is saved correctly

Existing sub-segment does not disappear unexpectedly

Segment Fields

Academics shows academic fields

Jobs & Careers shows career fields

Non-Academic Counselling shows counselling fields

School K-12 shows school fields

Common Fields

Personality & Geography displays for every segment

Common data remains available after switching segments

Position and Goal

Each segment has separate Current Position

Each segment has separate Future Goal

Switching segments displays the correct pair

Data Safety

Updating Jobs & Careers does not erase Academics

Updating Academics does not erase Counselling data

Partial API updates merge correctly

25. Final Expected User Flow

1. Student opens Dashboard

2. Student selects:
   Jobs & Careers

3. Student selects:
   Technical Roles

4. Shared profile is updated:
   activeSegment = jobs_careers
   subSegment = Technical Roles

5. Student enters:
   Current Position
   Future Goal

6. Data is saved inside:
   profile.jobsCareers

7. Student opens Student Signals

8. Student Signals reads the same profile

9. Jobs & Careers is automatically selected

10. Student sees:
    - Personality & Geography
    - Jobs & Careers fields

11. Student edits career signals

12. Changes are saved to:
    profile.jobsCareers

13. Dashboard and Student Signals continue using the same student profile.

26. Final Architecture Summary

The final structure should be:

                    ONE STUDENT PROFILE
                           │
                           ▼
                 ┌─────────────────┐
                 │ activeSegment   │
                 │ subSegment      │
                 │ common signals  │
                 │ academics       │
                 │ jobs & careers  │
                 │ counselling     │
                 │ school K-12     │
                 └─────────────────┘
                           │
               ┌───────────┴───────────┐
               ▼                       ▼
         DASHBOARD              STUDENT SIGNALS
               │                       │
               └───────────┬───────────┘
                           ▼
                     SAME API
                           ▼
                       DATABASE

27. Core Rule

Do not maintain separate segment states for Dashboard and Student Signals.

Instead:

The student profile is the single source of truth.

Both pages must:

Read the same active segment.

Read the same sub-segment.

Read the same segment-specific Current Position.

Read the same segment-specific Future Goal.

Update the same backend profile record.

Once this architecture is implemented, Student Signals becomes dynamic and automatically supports all four segments without creating separate synchronization logic between pages.