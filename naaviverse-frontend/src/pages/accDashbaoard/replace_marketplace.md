Naavi Marketplace Replacement & Super Admin Assistance

1. Feature Overview

Add a feature in the Naavi User Flow that allows a user to request a better marketplace recommendation when they are not satisfied with the current marketplace item.

The flow should be:

Marketplace Recommendation → User Rejects → Find a Better Match → User Feedback → Replacement → Maximum 3 Replacements → Super Admin Assistance

The purpose is to give users control over marketplace recommendations while keeping the replacement process limited and manageable.

2. User Flow

Step 1: User views Marketplace

The user sees the marketplace items recommended for their selected path/step.

Each marketplace card can contain:

Service/Marketplace name

Partner name

Price

Rating

Location

Delivery mode

Existing marketplace actions

Add a secondary action:

Not what you're looking for? Find a Better Match

Step 2: User selects "Find a Better Match"

Open a feedback/refinement dialog.

Ask:

What is not suitable about this recommendation?

Allow the user to select one or more reasons:

Too expensive

Wrong location

Wrong level

Wrong duration

Online instead of offline

Offline instead of online

Rating is not suitable

Service type is not suitable

Not relevant to my goal

Other

Also provide:

Tell us what you want

Example:

I want an affordable offline course near Hyderabad with weekend classes.

The user submits the request.

3. Replacement Logic

The replacement feature should use the existing Marketplace Ranking Engine.

Do not simply select the next marketplace item.

Instead:

Read the user's feedback.

Convert selected reasons/message into preferences or constraints.

Exclude the rejected marketplace item.

Consider previously rejected marketplace items.

Re-rank the remaining marketplace items.

Return the highest matching marketplace item.

Example:

Original Recommendation
        ↓
User says: Too expensive + Wants offline
        ↓
Extract preferences
        ↓
Marketplace Ranking Engine
        ↓
Exclude rejected item
        ↓
Apply price + offline preferences
        ↓
Return best matching marketplace

4. Replacement Limit

Each marketplace recommendation should have a maximum of 3 replacements.

Example:

Original Marketplace
       ↓
Replacement 1
       ↓
Replacement 2
       ↓
Replacement 3
       ↓
Super Admin Assistance

The user must not be allowed to continuously regenerate replacements.

Show the current count in the UI:

Replacement 1 of 3

After the third unsuccessful replacement, disable the normal replacement action.

5. Important Preference Handling

Do not immediately change the user's permanent profile based on one rejection.

For example, if the user says:

Too expensive

Do not permanently set:

userBudget = low

Instead store the preference against the current marketplace/path/step request.

Example:

Marketplace Request Preferences
- Budget: Lower
- Mode: Offline
- Location: Hyderabad
- Duration: Short

Repeated feedback can later be used as a stronger personalization signal.

6. Marketplace Replacement Data

Create a collection/model such as:

marketplace_replacement_requests

Suggested structure:

{
  userId,
  pathId,
  stepId,
  originalMarketplaceItemId,

  replacementCount: 1,

  feedback: {
    reasons: [
      "too_expensive",
      "offline_preferred"
    ],
    message: "I want an affordable offline option."
  },

  previousRecommendations: [
    {
      marketplaceItemId,
      replacementNumber: 1
    }
  ],

  status: "replacement_active",

  createdAt,
  updatedAt
}

Possible statuses:

replacement_active
max_replacements_reached
admin_requested
admin_reviewing
resolved
closed

7. Store Replacement History

Every replacement should be recorded.

Example:

previousRecommendations: [
  {
    marketplaceItemId: "service001",
    replacementNumber: 1
  },
  {
    marketplaceItemId: "service002",
    replacementNumber: 2
  },
  {
    marketplaceItemId: "service003",
    replacementNumber: 3
  }
]

This prevents the ranking engine from recommending the same rejected marketplace again.

8. Super Admin Assistance

After the user reaches the maximum of 3 replacements, show:

Still haven't found the right match?

You've used your 3 recommendation changes. Our team can review your requirement and help you find a better option.

Button:

Request Super Admin Assistance

9. Assistance Request

When the user submits the request, create:

marketplace_assistance_requests

Suggested structure:

{
  userId,
  pathId,
  stepId,

  originalMarketplaceItemId,

  replacementCount: 3,

  userRequirement: {
    reasons: [
      "too_expensive",
      "wrong_location"
    ],
    message: "I need an affordable offline option near Hyderabad."
  },

  previousRecommendations: [
    "service001",
    "service002",
    "service003"
  ],

  status: "pending",

  assignedAdminId: null,

  createdAt,
  updatedAt
}

10. Super Admin Dashboard

Add a new section:

Marketplace Assistance Requests

Admin should see:

Field

Description

User

Requesting user

Path

Related path

Step

Related step

Marketplace

Original marketplace

Replacements

Number used

Status

Pending / Reviewing / Resolved

Created Date

Request date

Admin can filter by:

Pending

Reviewing

Resolved

Closed

11. Admin Request Details

When Super Admin opens a request, show:

User Requirement

Example:

I want an affordable offline course near Hyderabad with weekend classes.

Rejection Reasons

Too expensive

Wrong mode

Previous Recommendations

Service A

Service B

Service C

Replacement Count

3 / 3

User Message History

Show the complete conversation between the user and Super Admin.

12. User ↔ Super Admin Communication

Create a separate message collection:

marketplace_assistance_messages

Example:

{
  requestId,

  senderId,

  senderRole: "USER",

  message: "I still need something cheaper.",

  attachments: [],

  createdAt
}

Admin message:

{
  requestId,

  senderId,

  senderRole: "SUPER_ADMIN",

  message: "We found another option that matches your budget.",

  attachments: [],

  createdAt
}

This creates a proper conversation history.

13. Admin Actions

Super Admin should have these actions:

1. Recommend Existing Marketplace

Admin searches existing marketplace services and selects one.

Action:

Recommend to User

2. Ask User for More Information

Admin sends a message asking for clarification.

Example:

What is your preferred budget range?

3. Resolve Request

After the user's requirement is handled:

Mark as Resolved

4. Close Request

If the request cannot be fulfilled or is not valid:

Close Request

14. API Design

Suggested APIs:

Replacement

POST /api/marketplace/replacement

Purpose:

Submit marketplace rejection

Save feedback

Generate replacement

Replacement History

GET /api/marketplace/replacement/:requestId

Purpose:

Get replacement count

Get previous recommendations

Get feedback history

Create Assistance Request

POST /api/marketplace/assistance

Purpose:

Create Super Admin assistance request

User Assistance Requests

GET /api/marketplace/assistance/user

Purpose:

Show user's assistance requests

User/Admin Messages

POST /api/marketplace/assistance/:requestId/message

Purpose:

Send a message in the assistance conversation

Admin Requests

GET /api/admin/marketplace/assistance

Purpose:

Get all marketplace assistance requests

Admin Request Details

GET /api/admin/marketplace/assistance/:requestId

Admin Status Update

PATCH /api/admin/marketplace/assistance/:requestId/status

Admin Recommendation

POST /api/admin/marketplace/assistance/:requestId/recommend

Purpose:

Recommend an existing marketplace item to the user

15. Frontend Components

Suggested components:

Marketplace.jsx
MarketplaceCard.jsx
FindBetterMatchDialog.jsx
MarketplaceFeedbackForm.jsx
ReplacementCounter.jsx
AssistanceRequestDialog.jsx
AssistanceRequests.jsx
AssistanceConversation.jsx

Admin:

MarketplaceAssistance.jsx
AssistanceRequestDetails.jsx
AssistanceConversation.jsx
AdminMarketplaceRecommendation.jsx

16. UI Flow

Marketplace Card

┌─────────────────────────────┐
│ Marketplace Service         │
│ ⭐ 4.5                       │
│ ₹5,000                      │
│ Hyderabad                   │
│                             │
│ [View Details] [Add Cart]   │
│                             │
│ Not suitable?               │
│ [Find a Better Match]       │
└─────────────────────────────┘

Feedback Dialog

Why isn't this suitable?

☐ Too expensive
☐ Wrong location
☐ Wrong level
☐ Wrong duration
☐ Online/Offline mismatch
☐ Not relevant
☐ Other

What would you prefer?

[____________________________]

             [Find Better Match]

Replacement Result

Better Match Found

Replacement 1 of 3

[New Marketplace Card]

After third replacement:

Still haven't found the right match?

[Request Super Admin Assistance]

17. Ranking Engine Integration

The replacement system should reuse the existing marketplace ranking engine.

The ranking process should consider:

Existing Ranking Factors

Marketplace relevance

Partner quality

Rating

Reviews

Price

Location

Service type

Availability

Partner type

User/path relevance

New Feedback Signals

Rejected item

Rejection reason

User preference

Previous replacements

User's custom message

Conceptually:

Final Score =
Existing Ranking Score
+ Preference Match Score
+ Feedback Match Score
- Rejection Penalty
- Previously Shown Penalty

Do not hard-code exact weights initially. Test and tune them using real user data.

18. "Why Recommended?" Feature

For every replacement, optionally show:

Why we recommended this

✓ Matches your selected path
✓ Fits your preferred location
✓ Matches your preferred mode
✓ Fits your requested budget
✓ Strong partner rating

This makes the recommendation transparent and builds user trust.

19. Notifications

Add notifications for important events.

User

When:

Replacement is generated

Admin responds

Admin recommends a marketplace

Request is resolved

Example:

Your marketplace assistance request has received a response.

Super Admin

When:

New assistance request is created

User sends a new message

Example:

New marketplace assistance request from a user.

20. Analytics

Track the following metrics:

Marketplace Recommendation Acceptance Rate
Marketplace Replacement Rate
Average Replacements per User
Most Common Rejection Reasons
Replacement Success Rate
Super Admin Assistance Rate
Admin Resolution Rate
Average Resolution Time
Marketplace Conversion After Replacement

These metrics can identify weak marketplace recommendations and improve the ranking engine.

21. Recommended Implementation Phases

Phase 1 — User Replacement

Implement:

Find a Better Match button

Feedback dialog

Reason selection

Custom message

Replacement generation

Replacement counter

Maximum 3 replacements

Replacement history

Phase 2 — Super Admin Assistance

Implement:

Request Admin Assistance

Assistance request model

Admin dashboard

Request details

Request status

Phase 3 — Communication

Implement:

User/Admin messages

Conversation history

Notifications

Admin responses

Phase 4 — Admin Recommendation

Implement:

Admin marketplace search

Recommend existing marketplace

User receives recommendation

Resolve request

Phase 5 — Intelligence

Implement:

Feedback integration with ranking engine

Preference extraction

Better ranking

Recommendation explanation

Analytics

22. Final Architecture

USER
 │
 ▼
MARKETPLACE
 │
 ├── Likes Recommendation
 │       └── Continue
 │
 └── Doesn't Like
         │
         ▼
   FIND A BETTER MATCH
         │
         ▼
   User Feedback
   + Preferences
         │
         ▼
 Marketplace Ranking Engine
         │
         ▼
   Replacement #1
         │
      Reject?
         ▼
   Replacement #2
         │
      Reject?
         ▼
   Replacement #3
         │
      Reject?
         ▼
 SUPER ADMIN ASSISTANCE
         │
         ▼
   Admin Review
      /            /         Recommend    Communicate
Existing      With User
Service          │
     \           /
      \         /
       ▼       ▼
        RESOLVED

23. Important Rules

Maximum 3 automatic replacements per marketplace recommendation.

Never recommend the same rejected marketplace item again within the request.

User feedback must influence the replacement ranking.

Do not permanently modify user preferences from a single rejection.

Keep complete replacement history.

After 3 replacements, provide Super Admin assistance.

Super Admin should see the user's complete requirement and previous recommendations.

User and Super Admin should be able to communicate through the assistance request.

Admin should be able to recommend an existing marketplace item.

Track analytics so the ranking engine can improve over time.

24. MVP Recommendation

For the first implementation, build only:

User → Feedback → 3 Replacements → Super Admin Request → Admin Conversation → Admin Recommendation → Resolve

Do not start with advanced AI personalization. 


Once this flow works reliably, connect the collected feedback to the existing Marketplace Ranking Engine and gradually introduce smarter personalization.

This keeps the feature simple, controlled, and easy to test while leaving room for future AI-powered improvements.