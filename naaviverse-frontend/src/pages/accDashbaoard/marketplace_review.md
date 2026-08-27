# Naavi Marketplace Ranking — Simple Guide

## 1. The Problem

Right now, marketplace items could be shown by rating, price, or newest first. That's not good enough.

**Example:** A 4.9★ service with 10 reviews should NOT always beat a 4.5★ service with 1,500 reviews if the second one is far more useful to *this* user right now.

---

## 2. The Big Idea (borrowed from Google Hotels)

Google doesn't sort hotels by "cheapest" or "highest rated." It sorts by **relevance** — how well a result matches what *this* user needs, right now, in their context.

Google's 3 core ideas:
1. **Relevance** — does it match the search?
2. **Distance** — is it in the right place?
3. **Prominence** — is it trusted/popular (reviews, reputation)?

Naavi should copy the **principle**, not the exact formula (Google never publishes their real weights).

**Naavi's version of this idea:**
> "How useful is this marketplace item for THIS user, on THIS Path, at THIS Step, right now?"

---

## 3. The 10 Ranking Factors

| # | Factor | Weight | What it means |
|---|--------|-------:|----------------|
| 1 | **User Intent Match** | 25% | Does the service match what the user actually needs? |
| 2 | **Path & Step Match** | 20% | Does it match their current career Path and Step? |
| 3 | **Personalization** | 12% | Does it match what they've clicked/saved/bought before? |
| 4 | **Partner Quality/Rating** | 10% | Rating + number of reviews (not rating alone) |
| 5 | **Popularity/Engagement** | 8% | Views, clicks, saves, purchases |
| 6 | **Price / Value** | 8% | Is the price fair compared to similar services? |
| 7 | **Partner Trust** | 7% | Verified partner, good track record |
| 8 | **Availability** | 4% | Is it currently available? |
| 9 | **Freshness** | 3% | Recently updated gets a small boost |
| 10 | **Exploration** | 3% | Small boost to new/quality partners so they get a chance |

**Total = 100%**

These are Naavi's own starting weights — not copied from Google. We can adjust them later once we have real usage data.

---

## 4. The Formula

```
Naavi Score =
   Intent Match      × 25%
 + Path/Step Match    × 20%
 + Personalization    × 12%
 + Partner Quality     × 10%
 + Popularity          × 8%
 + Value                × 8%
 + Partner Trust        × 7%
 + Availability          × 4%
 + Freshness              × 3%
 + Exploration            × 3%
```

Every factor is scored from **0 to 1** (or 0–100), then combined using the weights above. Higher score = higher position in the marketplace.

---

## 5. Quick Rules to Remember

1. Relevance always comes first — not rating, not price.
2. Rating alone should never decide ranking (use rating + review count together).
3. Cheapest ≠ best — compare price to similar services instead.
4. Popularity should never beat relevance (a popular MBA course shouldn't outrank a relevant AI course).
5. New/good partners deserve a small visibility boost, or nothing new is ever discovered.
6. Unavailable services shouldn't rank high — filter them out early.
7. Keep every individual score stored (not just the final number) so Admin can see *why* something ranked where it did.
8. Don't show 6 identical-looking cards in a row — mix up the types (course, mentor, university, certification, etc.) — this is the **Diversity Rule**.

---

## 6. How It Actually Runs (Step-by-Step Flow)

```
User opens Marketplace
        ↓
Get their Profile, Path, Step, View
        ↓
Understand what they need (Intent)
        ↓
FILTER OUT irrelevant items first
   (wrong Path/Step/View, inactive, unavailable)
        ↓
Calculate the 10 factor scores for what's left
        ↓
Combine into one Naavi Score (0–100)
        ↓
Sort — highest score first
        ↓
Apply Diversity Rule (no repeated card types in a row)
        ↓
Show Final Marketplace Results
```

**Important:** Filter first, then score. Don't waste time scoring thousands of irrelevant items.

---

## 7. Data We Need to Start Tracking

For every marketplace item, track:
- Impressions, Clicks, Views
- Saves, Add to Cart, Purchases, Bookings
- Completed services, Reviews, Ratings
- Complaints, Refunds
- Last Updated date, Availability status

This data feeds Factors 3, 4, 5, 7, and 9 above.

---

## 8. Database Fields to Add (per marketplace item)

```javascript
{
  intentScore,
  pathMatchScore,
  stepMatchScore,
  personalizationScore,

  ratingScore,
  reviewConfidenceScore,   // rating adjusted for review count

  popularityScore,
  valueScore,
  partnerTrustScore,

  availabilityScore,
  freshnessScore,
  explorationScore,

  impressions,
  clicks,
  saves,
  addToCart,
  purchases,
  completions,

  naaviScore,       // final combined score
  lastUpdated
}
```

Keep each score separate — this makes it possible to debug ("why did this rank #1?") and improve later.

---

## 9. How to Build It — 3 Phases

**Phase 1 — Rule-Based (build this first)**
Implement the weighted formula above directly. No AI/ML needed yet.

**Phase 2 — Start Collecting Behavior Data**
Track clicks, views, saves, purchases, completions. Use this to make Popularity, Personalization, and Partner Quality scores more accurate over time.

**Phase 3 — Smart Ranking (later)**
Once there's enough real usage data, move to a learning-based ranking system that automatically figures out the best weights — instead of us guessing them manually. Don't attempt this until Phase 1 & 2 have enough data.

---

## 10. Admin View (so Ram Sir / Jyo Sir can see "why")

Example of what Admin should be able to see for any marketplace item:

```
Marketplace: Machine Learning Bootcamp

Intent Match       94/100
Path Match         91/100
Step Match         96/100
Personalization    82/100
Partner Quality     88/100
Popularity          76/100
Value               70/100
Partner Trust       92/100
Availability       100/100
--------------------------------
Naavi Score         89.2/100
--------------------------------
```

---

## 11. One-Line Summary

> Don't ask "Which has the best rating?" — ask "**Which is most useful for THIS user right now?**" That's the entire Naavi ranking philosophy.
