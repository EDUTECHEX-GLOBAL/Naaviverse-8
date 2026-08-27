Dynamic Path Generation Based on Content Segment

1. Purpose

The four Content Segment categories shown in the path-generation UI are:

Academic & Research

Practical & Skills

Jobs & Careers

Non-Academic Counselling

These four categories must act as different generation modes.

The system must NOT use one common roadmap structure and simply change the title based on the selected category.

When a user selects a category, the AI must first understand:

What this category means

What the selected sub-segment means

What the user's current position is

What the user's future goal is

What profile information is available

What outcome the user actually wants

Then it must dynamically create the complete pathway.

2. Core Rule

Category → Meaning → Logic → Roadmap

The category must determine the type of pathway, not just the label.

The system should work like:

User selects category
        ↓
Identify category meaning
        ↓
Identify selected sub-segment / focus
        ↓
Understand Current Position
        ↓
Understand Future Goal
        ↓
Analyze User Profile
        ↓
Determine what is actually required
        ↓
Generate unique pathway

There must be NO fixed list of steps that is reused across all four categories.

There must also be:

No fixed readiness score

No fixed readiness label

No fixed number of steps

No fixed timeline

No fixed descriptions

No fixed learning objectives

No fixed Macro/Micro/Nano content

No fixed marketplace resources

No fixed fallback roadmap

No artificial duplication of steps

3. Category 1 — Academic & Research

Definition

Academic & Research is for goals where the primary objective is formal education, academic progression, university admission, academic specialization, or research development.

The pathway should help the user progress academically from their current educational position toward a specific academic destination.

Typical examples

Grade 10 → Bachelor's in Computer Science at Yale

Grade 11 CBSE → Engineering university admission

Bachelor's → Master's degree

Master's → PhD

Student → Research-oriented academic profile

Student → Competitive university application

What the AI should consider

Depending on the actual goal:

Current grade / education level

Curriculum such as CBSE, IB, Cambridge, etc.

Subjects

Academic performance

Required prerequisites

Target degree

Target university

Country

Standardized tests where actually required

English proficiency where actually required

Research interests

Academic projects

Competitions

Extracurricular profile

Application requirements

Financial constraints

Timeline

Possible pathway areas

These are examples of areas the AI may identify when relevant. They are NOT fixed steps.

Academic foundation

Subject selection

Prerequisite preparation

Academic performance improvement

Research development

Test preparation

Profile development

University research

Application preparation

Final admissions preparation

The AI must decide which areas are actually necessary.

Important

If the user wants:

Bachelor's • Chemical Engineering • MIT • USA

the pathway should be different from:

Bachelor's • Psychology • University of Toronto • Canada

The system must not reuse the same roadmap and only change the university/program name.

4. Category 2 — Practical & Skills

Definition

Practical & Skills is for goals where the primary objective is learning, developing, applying, and demonstrating a practical skill.

The user is not necessarily trying to obtain a degree or immediately get a job.

The focus is on skill acquisition and proof of ability.

Typical examples

Beginner → Python proficiency

Beginner → Web development

Student → Data analysis skills

Student → CAD skills

Beginner → Digital marketing

Learner → UI/UX design

Learner → Machine learning fundamentals

What the AI should consider

Depending on the goal:

Current skill level

Target skill

Existing knowledge

Prerequisite skills

Learning resources

Practice requirements

Projects

Portfolio requirements

Certifications where useful

Real-world application

Available time

Learning style

Budget

Goal complexity

Possible pathway areas

Examples only:

Foundation

Core concepts

Guided practice

Intermediate skills

Project development

Advanced application

Portfolio

Real-world practice

Skill validation

The AI must determine the appropriate progression.

Important

Do NOT automatically generate:

School selection

GPA targets

SAT/ACT

University applications

Job interviews

unless the user's actual goal requires them.

For example:

Current: Beginner Python
Goal: Build a Python portfolio

should generate a skill-development pathway, not a university admission pathway.

5. Category 3 — Jobs & Careers

Definition

Jobs & Careers is for goals where the primary objective is entering, changing, progressing, or becoming stronger in a profession or job role.

The pathway should focus on career readiness and employability.

Typical examples

Student → Software Developer

Junior Developer → Senior Software Engineer

Graduate → Data Analyst

Career switcher → Cloud Engineer

Student → Product Manager

Professional → Engineering Manager

What the AI should consider

Depending on the goal:

Current role

Current experience

Target role

Required competencies

Technical skills

Soft skills

Experience gaps

Portfolio / proof of work

Resume

LinkedIn / professional profile

Networking

Interviews

Certifications where useful

Job-market expectations

Target industry

Target location

Salary/role expectations where provided

Possible pathway areas

Examples only:

Career assessment

Role-gap analysis

Skill-gap development

Experience building

Portfolio / proof of work

Resume development

Professional branding

Networking

Interview preparation

Job search

Career transition

The AI must determine what is relevant.

Important

Do NOT automatically generate:

Grade 10 board preparation

Curriculum selection

SAT preparation

School selection

University applications

unless the actual goal requires an academic transition.

For example:

Current: Junior Software Developer
Goal: Senior Software Engineer

should produce a career progression pathway, not a student admissions roadmap.

6. Category 4 — Non-Academic Counselling

Definition

Non-Academic Counselling is for goals where the primary objective is support, guidance, wellbeing, decision-making, life skills, or short-term personal guidance rather than formal academic or career progression.

This category must be handled carefully and must remain focused on the selected counselling area.

Main sub-segments

The system currently supports concepts such as:

Mental Health & Wellness

Life Skills & Decision Support

Immediate Guidance & Support

The selected sub-segment must influence the entire generated pathway.

6.1 Mental Health & Wellness

Focus

The pathway may address:

Stress management

Emotional wellbeing

Healthy routines

Sleep and wellbeing

Coping strategies

Mindfulness

Support networks

Counselling resources

Progress check-ins

Appropriate professional support

Example

Current:

Exam stress

Goal:

Manage exam stress

Possible dynamically generated progression:

Understand current stress patterns

Identify triggers

Establish a sustainable routine

Practice suitable coping strategies

Build an exam-period support plan

Review progress

These are examples, NOT hardcoded steps.

Must NOT automatically include

Curriculum selection

School selection

GPA targets

SAT/ACT

University selection

University applications

Internships

Job placement

unless the user's actual goal explicitly requires those areas.

6.2 Life Skills & Decision Support

Focus

The pathway may address:

Time management

Decision-making

Prioritization

Routine building

Personal planning

Goal clarification

Execution habits

Reflection

Follow-up

The pathway must be based on the user's actual situation.

For example:

Current: Struggling with time management
Goal: Build a consistent daily routine

should not receive a university admissions roadmap.

6.3 Immediate Guidance & Support

Focus

This should be action-oriented and based on the immediate need.

It may include:

Understanding the immediate issue

Identifying practical next actions

Resource navigation

Support options

Short-term planning

Follow-up

Appropriate escalation to qualified support where needed

Do not turn an immediate-support request into a long academic or career roadmap.

7. The Same Current Position and Goal Can Still Produce Different Paths

The category must matter.

Example:

Current:

Student with exam stress

Goal:

Manage exam stress

Academic & Research

Could focus on academic planning only if the selected academic goal requires it.

Practical & Skills

Could focus on study skills or learning techniques if that is the actual selected skill goal.

Jobs & Careers

Could focus on career readiness if the goal is a job/career outcome.

Non-Academic Counselling → Mental Health & Wellness

Should focus on wellbeing, stress management, support, and appropriate counselling resources.

The category changes the meaning and purpose of the pathway.

8. No Fixed Readiness

Readiness must be calculated dynamically.

Do NOT use values such as:

30
35
40
45

simply because the category is selected.

The system should determine readiness from the actual context.

Academic

Consider academic preparation versus academic destination.

Practical

Consider current skill level versus target skill level.

Jobs

Consider current experience/competencies versus target-role requirements.

Non-Academic

Use a category-appropriate support/readiness interpretation based on the user's stated situation.

Do not pretend that a mental-health support request has the same readiness model as university admission.

9. No Fixed Step Count

The number of steps must be dynamically determined.

The AI should ask:

"What are the genuinely necessary stages to move this user from their current state toward their goal?"

It should NOT ask:

"How many predefined steps do I need to fill?"

A pathway can contain any reasonable number of meaningful steps based on complexity.

Important

Never create:

Step 1 - Phase 1
Step 2 - Phase 2
Step 3 - Phase 3

by copying the same content merely to increase the count.

Every step must have a distinct purpose.

10. No Fixed Readiness Labels

Do not always use:

Early Starter

Intermediate Starter

Career Starter

Support Plan Starter

These should not be hardcoded outputs.

The AI should generate a meaningful interpretation from the user's actual situation.

If the product requires a standardized label for UI consistency, the label should be selected from a category-appropriate dynamic evaluation rather than being permanently tied to a category.

11. No Fixed Timeline

The timeline must be based on:

Current state

Target

Complexity

Required stages

Dependencies

User availability

Category

Goal

A 12-month academic path and a 12-month career path should not automatically have the same structure.

A short-term counselling goal should not automatically be converted into a multi-year academic timeline.

12. Marketplace Must Be Category + Step Specific

Marketplace recommendations must be generated based on:

Category
+
Sub-segment
+
Current Position
+
Future Goal
+
Specific Step
+
User Profile
+
Location
+
Budget

Academic

Recommend academically relevant resources.

Practical

Recommend learning and practical skill resources.

Jobs

Recommend career and employment resources.

Non-Academic

Recommend appropriate support, counselling, wellbeing, or guidance resources.

Do NOT use one common marketplace list for every category.

Do NOT create marketplace entries simply to satisfy a required count.

Every marketplace recommendation should answer:

"Why is this resource useful for this exact step for this exact user?"

13. Macro / Micro / Nano Must Be Dynamic

These fields must not be generic templates copied across all steps.

Macro

Explain the strategic reason this specific step matters.

Micro

Explain the specific actions the user needs to perform.

Nano

Explain the specific expert, mentor, counsellor, or support guidance relevant to that step.

The wording, objectives, tasks, and support must change according to the category and step.

14. Learning Objectives Must Be Dynamic

Do NOT use generic objectives such as:

Understand the requirements.
Execute the tasks.
Get mentor feedback.

for every step.

Objectives must describe what the user should actually achieve in that particular stage.

15. Fallback Must NOT Contain Fixed Roadmap Data

This is critical.

There must not be a fallback such as:

if AI fails:
    return academic roadmap

because this causes:

Mental Health → Academic steps

or:

Jobs → Academic steps

or:

Practical Skills → University admission steps

Correct behavior

AI generation
      ↓
Validation
      ↓
If invalid
      ↓
Regenerate using SAME:
- category
- sub-segment
- current position
- future goal
- profile
      ↓
Validate again
      ↓
Return valid dynamic result

If generation still fails, show a clear generation error.

Do NOT silently return unrelated fixed data.

16. Validation Must Check Category Relevance

Validation must check both:

Structural validity

Valid JSON

Required fields

Valid step objects

Valid marketplace objects

Semantic validity

Does the content actually belong to the selected category?

Example

If:

Category = Non-Academic Counselling
Focus = Mental Health & Wellness

and output contains:

SAT Preparation
University Selection
GPA Target
School Selection

the result should be rejected and regenerated.

If:

Category = Jobs & Careers

and output contains:

Grade 10 Board Exams
CBSE Selection
IB Selection

the result should be rejected.

If:

Category = Practical & Skills

and output contains a complete university application roadmap without the goal requiring it, reject it.

17. Category Must Be Passed Explicitly Into AI Generation

The backend should provide the AI with explicit structured context.

Conceptually:

{
  "category": "Jobs & Careers",
  "sub_segment": "Technical Roles",
  "current_position": "...",
  "future_goal": "...",
  "profile": {}
}

The AI should not have to guess the category from the user's goal.

The category must be treated as a primary generation constraint.

18. Generation Prompt Structure

The generation prompt should clearly separate:

1. CATEGORY
2. SUB-SEGMENT / FOCUS
3. CURRENT POSITION
4. FUTURE GOAL
5. USER PROFILE
6. CATEGORY-SPECIFIC RULES
7. OUTPUT REQUIREMENTS

The category-specific rules should be activated only for the selected category.

Do not put academic progression rules into a global section that is applied to every category.

19. Example Expected Behavior

Example A — Academic

Category:
Academic & Research

Current:
Grade 11 CBSE

Goal:
Bachelor's • Computer Science • Yale University • USA

Expected direction:

Academic preparation → profile development → testing where relevant → university research → application preparation → admission

Example B — Practical

Category:
Practical & Skills

Current:
Beginner Python

Goal:
Build a Python portfolio

Expected direction:

Fundamentals → practice → projects → advanced application → portfolio → validation

Example C — Jobs

Category:
Jobs & Careers

Sub-segment:
Technical Roles

Current:
Junior Software Developer

Goal:
Senior Software Engineer

Expected direction:

Role analysis → skill gap → advanced engineering skills → system design → leadership/ownership → interview/career progression

Example D — Mental Health

Category:
Non-Academic Counselling

Sub-segment:
Mental Health & Wellness

Current:
Exam stress

Goal:
Manage exam stress

Expected direction:

Current situation → stress triggers → routines → coping strategies → support → progress review

It should NOT become:

Curriculum Assessment
School Selection
Grade Achievement
SAT Preparation
University Application

20. Final Implementation Rule

The system must follow this principle:

The four categories are four different pathway-generation engines, not four labels on the same roadmap.

Every generated pathway must be:

Category-specific

Focus-specific

Goal-specific

Profile-specific

Context-specific

Dynamically structured

Dynamically timed

Dynamically scored

Dynamically populated with resources

Semantically validated

The AI must determine the pathway.

Do not hardcode the pathway and ask the AI to fill in the blanks.

The correct approach is:

Category
   ↓
What does this category mean?
   ↓
What does this specific focus mean?
   ↓
Where is the user now?
   ↓
Where does the user want to reach?
   ↓
What is missing?
   ↓
What stages are genuinely required?
   ↓
Generate the unique pathway
   ↓
Generate relevant marketplace
   ↓
Validate category relevance
   ↓
Return

No fixed roadmap.
No fixed step count.
No fixed readiness.
No fixed timeline.
No fixed marketplace.
No unrelated fallback.
No duplicated phases.

Only dynamically generated, category-appropriate pathways.