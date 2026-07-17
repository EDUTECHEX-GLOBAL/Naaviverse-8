# Marketplace Ranking Engine
## Implementation Plan

---

# Objective

Implement an intelligent Marketplace Ranking Engine that automatically ranks marketplace services based on real user interactions, service quality, partner performance, and historical analytics.

Instead of displaying marketplace services randomly or by creation date, the system should continuously calculate a Marketplace Score and display the highest-quality services first.

This ranking engine should improve over time as more users interact with the platform.

---

# Current Problem

Currently, marketplace services are displayed without considering their quality or performance.

As the number of partners grows, users may not discover the best services.

The platform also has no way to identify:

- Which services are most useful
- Which services students actually purchase
- Which services students complete
- Which services receive positive feedback
- Which partners consistently provide better outcomes

---

# Goal

Build an automated Marketplace Ranking Engine that:

- Collects user interaction data.
- Calculates a Marketplace Score.
- Ranks marketplace services automatically.
- Continuously updates rankings as new data arrives.
- Uses historical analytics to improve recommendations.
- Supports future AI personalization.

---

# Data Sources

The Marketplace Score should not depend on only ratings.

It should use multiple signals collected across the platform.

## User Behaviour

- Marketplace Views
- Service Clicks
- Add to Cart
- Purchases
- Wishlist / Saved Items

---

## User Feedback

- Star Ratings
- Helpful Feedback
- Not Relevant Feedback
- Comments
- Replacement Requests

---

## Service Performance

- Purchase Count
- Completion Rate
- Repeat Purchases
- Refund Rate
- Complaint Count

---

## Partner Performance

- Response Time
- Cancellation Rate
- Success Rate
- Overall Partner Rating

---

## User History

- Previously Purchased Services
- Completed Services
- User Feedback History
- User Rating History
- Preferred Categories
- Frequently Selected Partners

---

# Marketplace Ranking Flow

```text
User Actions
      │
      ▼
Marketplace Analytics
      │
      ▼
Feedback Analytics
      │
      ▼
Purchase Analytics
      │
      ▼
Partner Performance
      │
      ▼
Marketplace Ranking Engine
      │
      ▼
Marketplace Score
      │
      ▼
Marketplace Sorted Automatically
```

---

# Marketplace Analytics

Every marketplace service should maintain analytics.

Example

```json
{
    "service_id":"",

    "partner_id":"",

    "views":0,

    "clicks":0,

    "cart_additions":0,

    "wishlist_count":0,

    "purchase_count":0,

    "completion_count":0,

    "average_rating":0,

    "rating_count":0,

    "helpful_feedback":0,

    "not_relevant_feedback":0,

    "comments":0,

    "replacement_requests":0,

    "refund_count":0,

    "complaint_count":0,

    "marketplace_score":0,

    "last_updated":""
}
```

---

# Marketplace Score

Example scoring model

```
30% User Ratings

20% Completion Rate

15% Purchase Success

10% Helpful Feedback

10% Repeat Purchases

10% Partner Reliability

5% Complaint / Refund History
```

The scoring formula should remain configurable so weights can be adjusted without changing the frontend.

---

# Backend Flow

Every important user action should update marketplace analytics.

Examples

## User opens service

```
Views +1
```

---

## User clicks service

```
Clicks +1
```

---

## User adds to cart

```
Cart +1
```

---

## User purchases

```
Purchase Count +1
```

---

## User completes service

```
Completion Count +1
```

---

## User gives rating

```
Average Rating Updated
```

---

## User clicks Helpful

```
Helpful Feedback +1
```

---

## User clicks Not Relevant

```
Negative Feedback +1
```

---

## User submits feedback

```
Store Comment

Update Analytics
```

---

## User requests another provider

```
Replacement Request +1
```

This indicates that the user was not satisfied with the current provider.

---

# Marketplace Ranking Engine

Whenever analytics change:

```
Update Analytics

↓

Recalculate Marketplace Score

↓

Update Marketplace Rankings

↓

Sort Marketplace Automatically
```

---

# Database Changes

## Existing Collections

No existing collections should be modified heavily.

---

## New Collection

```
marketplace_analytics
```

Stores analytics for every marketplace service.

---

Example

```json
{
    "service_id":"",

    "partner_id":"",

    "marketplace_score":91,

    "average_rating":4.8,

    "views":1200,

    "clicks":540,

    "purchases":220,

    "completion_rate":94,

    "helpful_feedback":180,

    "negative_feedback":10,

    "complaints":2,

    "refunds":1
}
```

---

# Backend Components

## Analytics Service

Responsibilities

- Update views
- Update clicks
- Update purchases
- Update feedback
- Update ratings

---

## Ranking Engine

Responsibilities

- Calculate Marketplace Score
- Rank Services
- Store Rankings

---

## Recommendation Service

Responsibilities

- Return services ordered by Marketplace Score
- Support future personalization

---

# APIs

## Analytics

```
POST

/api/marketplace/analytics
```

Updates analytics whenever a user performs an action.

---

## Rankings

```
GET

/api/marketplace/rankings
```

Returns services sorted by Marketplace Score.

---

## Recalculate Rankings

```
POST

/api/marketplace/recalculate
```

Recalculates scores after analytics are updated.

---

# Frontend Changes

## Marketplace Page

Instead of displaying services directly,

retrieve services ordered by Marketplace Score.

Current

```
Service A

Service B

Service C
```

Future

```
⭐ Recommended

Service B

Marketplace Score

96

★★★★★

----------------

⭐ Popular

Service A

Marketplace Score

91

★★★★☆

----------------

Service C

Marketplace Score

82
```

---

## Admin Dashboard

Create a new module

```
Marketplace Rankings
```

Display

- Service Name
- Marketplace Score
- Average Rating
- Purchases
- Completion Rate
- Feedback Summary
- Ranking Position

---

## Ranking Details

Admin should be able to view why a service received its score.

Example

```
Python Bootcamp

Marketplace Score

96

Reason

★★★★★ 4.9 Rating

95% Completion

520 Purchases

98 Helpful Feedback

2 Complaints
```

---

# Code Changes

## Backend

### New Files

- marketplace_analytics.py
- ranking_engine.py
- analytics_service.py

---

### Existing Files

Update

- main.py
- marketplace APIs
- purchase APIs
- feedback APIs
- rating APIs

Whenever a user performs an action, update Marketplace Analytics.

---

## Database

New Collection

```
marketplace_analytics
```

---

## Frontend

Update

- Marketplace.jsx
- Marketplace Cards
- Marketplace Filters
- Marketplace Sorting

Add

- Marketplace Rankings (Admin)
- Ranking Details Page
- Marketplace Score Badge (Optional)

---

# Future Enhancements

- Personalized Marketplace Rankings
- AI-based Recommendations
- Trending Services
- Best Value Services
- Best Rated Services
- Similar Students Also Purchased
- Weekly Ranking Reports
- Monthly Performance Reports

---

# Expected Result

After implementation:

- Marketplace services will automatically rank based on quality and user interactions.
- Rankings will continuously improve as more users use the platform.
- Admins can monitor why services are ranked the way they are.
- Users will see the highest-quality and most relevant services first.
- The architecture will support future AI-powered personalized marketplace recommendations without major redesign.

---

# Current Implementation: How Ratings Are Calculated

This project now uses two related values:

- **Marketplace Score**: backend score from `0` to `100`.
- **Star Rating**: frontend display rating from `1.0` to `5.0`, shown as stars like `★★★★★ 4.2`.

The backend still sorts marketplace items by **Marketplace Score**.
The frontend shows the result as a user-friendly star rating.

---

## Files Used

Backend:

- `careers-backend-node-v.1/models/MarketplaceAnalyticsModel.js`
- `careers-backend-node-v.1/services/MarketplaceRankingService.js`
- `careers-backend-node-v.1/controllers/MarketPlaceController.js`
- `careers-backend-node-v.1/routes/MarketplaceRouter.js`
- `careers-backend-node-v.1/controllers/FeedbackController.js`
- `careers-backend-node-v.1/routes/PaymentRouter.js`

Frontend:

- `naaviverse-frontend/src/pages/UserMarketplace.jsx`
- `naaviverse-frontend/src/pages/UserMarketplace.scss`
- `naaviverse-frontend/src/pages/AdminAccDashbaoard/AdminMarketplace.jsx`
- `naaviverse-frontend/src/pages/AdminAccDashbaoard/AdminMarketplace.scss`

---

# What Data Is Considered

Every marketplace item can collect analytics in the `marketplace_analytics` collection.

The system considers:

- Views
- Clicks
- Cart additions
- Purchases
- Completed services
- Repeat purchases
- Helpful feedback
- Not relevant feedback
- Comments
- Replacement requests
- Refunds
- Complaints
- Partner response time
- Partner success rate
- Partner rating

Not every value has to exist from day one.
If some values are missing, the system still calculates a score using available data.

---

# User Actions That Update Analytics

## When User Sees Marketplace Items

When marketplace services appear in the user marketplace page:

```text
views + 1
```

This means the item was displayed to the user.

---

## When User Clicks A Marketplace Card

When a user clicks or opens a service card:

```text
clicks + 1
```

This shows interest in the item.

---

## When User Adds Item To Cart

When a user adds a service to cart:

```text
cart_additions + 1
```

This is stronger than a click because the user is considering purchase.

---

## When User Completes Checkout / Mock Purchase

When marketplace checkout succeeds:

```text
purchase_count + 1
```

Purchases are one of the strongest ranking signals.

---

## When User Gives Feedback

Feedback updates analytics like this:

```text
Helpful       -> helpful_feedback + 1
Not Relevant  -> not_relevant_feedback + 1
Comment       -> comments + 1
```

Helpful feedback improves the service score.
Not relevant feedback reduces confidence in the service.

---

# Marketplace Score Formula

The backend calculates a score from `0` to `100`.

Current scoring weights:

```text
30% Ratings
20% Completion Rate
15% Purchase Success
10% Helpful Feedback
10% Repeat Purchases
10% Partner Reliability
5% Complaint / Refund History
```

---

## 1. Ratings Score

If actual user star ratings exist:

```text
ratings_score = (average_rating / 5) * 100
```

Example:

```text
average_rating = 4.5
ratings_score = (4.5 / 5) * 100 = 90
```

If no real ratings exist yet, this part stays `0` in the backend score.

---

## 2. Completion Rate

This checks how many purchased services were completed.

```text
completion_rate = (completion_count / purchase_count) * 100
```

Example:

```text
purchase_count = 50
completion_count = 40
completion_rate = 80
```

Higher completion means users are actually finishing the service.

---

## 3. Purchase Success

This checks how many views or clicks turn into purchases.

```text
purchase_success = purchase_count / max(views, clicks, 1) * 100
```

Example:

```text
views = 100
purchases = 15
purchase_success = 15
```

This helps identify services that convert well.

---

## 4. Helpful Feedback Score

This compares positive feedback against negative feedback.

```text
feedback_score = helpful_feedback / (helpful_feedback + not_relevant_feedback) * 100
```

Example:

```text
helpful_feedback = 80
not_relevant_feedback = 20
feedback_score = 80
```

More helpful feedback improves the rank.

---

## 5. Repeat Purchase Score

This checks whether users buy again.

```text
repeat_purchase_score = repeat_purchases / purchase_count * 100
```

Example:

```text
purchase_count = 100
repeat_purchases = 25
repeat_purchase_score = 25
```

Repeat purchases mean users trust the service.

---

## 6. Partner Reliability

Partner reliability considers:

- Partner success rate
- Partner rating
- Response time
- Complaints
- Cancellations

Simple idea:

```text
partner_reliability = partner_quality - complaint_penalty - response_delay_penalty
```

If partner data is missing, the system starts from a default reliability value so the item is not unfairly punished.

---

## 7. Complaint / Refund Score

This penalizes services with refunds, complaints, or replacement requests.

```text
negative_rate = (refunds + complaints + replacement_requests) / max(purchase_count, views, 1)
complaint_refund_score = 100 - negative_rate_penalty
```

More refunds or complaints reduce the score.

---

# Final Marketplace Score

The final backend score is calculated like this:

```text
marketplace_score =
  ratings_score * 0.30 +
  completion_rate * 0.20 +
  purchase_success * 0.15 +
  feedback_score * 0.10 +
  repeat_purchase_score * 0.10 +
  partner_reliability * 0.10 +
  complaint_refund_score * 0.05
```

Example:

```text
ratings_score = 90
completion_rate = 80
purchase_success = 25
feedback_score = 85
repeat_purchase_score = 20
partner_reliability = 75
complaint_refund_score = 95

marketplace_score =
  90 * 0.30 +
  80 * 0.20 +
  25 * 0.15 +
  85 * 0.10 +
  20 * 0.10 +
  75 * 0.10 +
  95 * 0.05

marketplace_score = 69.5
```

The service with the highest `marketplace_score` appears first.

---

# Frontend Star Rating Formula

The frontend shows users and admins a star rating like:

```text
★★★★★ 4.2
```

The frontend rating is calculated in this order:

## Case 1: Real Average Rating Exists

If backend has a real `average_rating`, frontend uses it directly.

```text
frontend_rating = average_rating
```

Example:

```text
average_rating = 4.7
shown rating = ★★★★★ 4.7
```

---

## Case 2: No Real Rating, But Marketplace Score Exists

If no real rating exists yet, frontend converts `marketplace_score` into a rating between `3.5` and `5.0`.

Formula:

```text
frontend_rating = 3.5 + (marketplace_score / 100) * 1.5
```

Then it is capped between `3.5` and `5.0`.

Example:

```text
marketplace_score = 80
frontend_rating = 3.5 + (80 / 100) * 1.5
frontend_rating = 4.7
shown rating = ★★★★★ 4.7
```

Another example:

```text
marketplace_score = 40
frontend_rating = 3.5 + (40 / 100) * 1.5
frontend_rating = 4.1
shown rating = ★★★★★ 4.1
```

---

## Case 3: No Analytics Yet

If the item has no score and no rating yet:

```text
frontend_rating = 4.0
```

This is only a starting display value.
As users view, click, add to cart, purchase, and give feedback, the backend score changes and the frontend rating updates.

---

# Where Ratings Are Visible

## User Marketplace

On the user marketplace page:

```text
/dashboard/users/Marketplace
```

Each service card shows:

```text
★★★★★ 4.2
```

The item order is still based on backend ranking.

---

## Super Admin Marketplace

On super admin marketplace:

```text
/admin/dashboard/marketplace
```

Admin can see ratings in:

- Marketplace table rating column
- Marketplace item detail modal

This allows admin to compare every marketplace service quickly.

---

# Simple Explanation

The ranking is not random.

The system checks:

- Are users seeing the item?
- Are users clicking it?
- Are users adding it to cart?
- Are users buying it?
- Are users completing it?
- Are users giving helpful feedback?
- Are users complaining or asking for replacement?
- Is the partner reliable?

Then the backend creates a `marketplace_score`.
The frontend converts that score into a simple star rating so users and admins can understand it easily.
