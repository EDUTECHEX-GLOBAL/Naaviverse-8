 # 📐 Bayesian Ranking Model Architecture — Naaviverse Marketplace

## 🌟 Executive Summary

This document outlines the design, mathematical formulation, database integration, and implementation plan for the **Bayesian Ranking Engine** in the Naaviverse Marketplace. 

By replacing rigid hardcoded mappings (`{ helpful: 5, comment: 4, skip: 3, notRelevant: 2 }`) with a **Statistical Bayesian Average Formula**, the platform ensures:
- **Zero Fake Inflation**: Skipped reviews (`skip`) are excluded rather than awarded fake 3-star ratings.
- **Anti-Manipulation**: Prevents new vendors from posting 1 fake 5-star review to steal the #1 ranking spot.
- **Dynamic Platform Adaptation**: Global parameters ($C$ and $m$) adjust automatically based on real-time database aggregations.

---

## 🧮 1. The Core Formula

The rating of any marketplace item, mentor, or step is governed by the **Bayesian Weighted Average Formula**:

$$\text{Bayesian Average} = \frac{v \cdot R + m \cdot C}{v + m}$$

### Variable Definitions

| Symbol | Mathematical Parameter | Description in Naaviverse System |
| :---: | :--- | :--- |
| **$v$** | **Sample Size / Volume** | Total number of valid ratings/reviews received by this item. |
| **$R$** | **Item Sample Mean** | Arithmetic average of raw feedback ratings received by this item so far. |
| **$C$** | **Platform Global Mean** | **Dynamically calculated** average rating across *all* items in MongoDB. |
| **$m$** | **Confidence Threshold** | **Dynamically calculated** average review count per item across the platform. |

---

## 🏛️ 2. Industry Case Study: The Three Pillars Ranking Mechanism

Modern discovery systems (such as Google Local Search & Google Maps) rank listings organically by balancing **Three Core Pillars**:

$$\text{Total Rank Score} = w_1 \cdot \text{Proximity} + w_2 \cdot \text{Relevance} + w_3 \cdot \text{Prominence}$$

### Pillar 1: Proximity (Distance & User Alignment)
* **What it is**: How close the listing is to the user's viewport center, current GPS location, or targeted career goal stage.
* **Why it matters**: A small local service with only 2 reviews can rank #1 on the map if it sits directly at the user's targeted location or exact skill level.

### Pillar 2: Relevance (Search Match & Category Tagging)
* **What it is**: How closely the business category, tags, and keywords match the user's active search query (e.g. `"Restaurants"` or `"Python Mentorship"`).
* **Why it matters**: The ranking algorithm verifies category metadata, offering tags, and query intent alignment before scoring.

### Pillar 3: Prominence (Review Quality & Bayesian Popularity)
* **What it is**: How famous, authoritative, and well-reviewed the business or mentor is.
* **Why it matters**: Evaluates total review volume, average star rating using **Bayesian Averaging**, student completion rates, and provider reliability signals.

---

## 📊 3. Dynamic Database Parameter Calculation

In production, **$C$** and **$m$** are **never hardcoded**. They are computed dynamically from MongoDB aggregations:

### 3.1 Calculating $C$ (Platform Global Mean)

$$C = \frac{\sum_{i=1}^{N} \left(\text{item}_i.\text{average\_rating} \times \text{item}_i.\text{rating\_count}\right)}{\sum_{i=1}^{N} \text{item}_i.\text{rating\_count}}$$

* **Purpose**: Serves as the Bayesian prior expectation. A new item begins with a prior assumption equal to the overall platform quality ($C$).

### 3.2 Calculating $m$ (Confidence Threshold Parameter)

$$m = \max\left(1, \operatorname{round}\left(\frac{\text{Total Ratings Across Platform}}{\text{Total Active Items}}\right)\right)$$

* **Purpose**: Represents the "virtual review count" required before an item's own score ($R$) overrides the global baseline ($C$).

---

## 🎯 4. Student Action Input Mapping

Raw ratings ($r_i$) are derived from student feedback interactions without arbitrary inflation:

| Student Feedback Action | Internal Action Key | Assigned Raw Rating ($r_i$) | Inclusion Rule |
| :--- | :---: | :---: | :--- |
| **Helpful (Thumbs Up)** | `helpful` | **$5.0$ Stars** | Included in sample mean $R$ |
| **Comment (Review Text)** | `comment` | **$4.0$ Stars** *(or Sentiment $1.0 - 5.0$)* | Included in sample mean $R$ |
| **Not Relevant (Thumbs Down)**| `notRelevant` | **$1.0$ Star** | Included in sample mean $R$ |
| **Skip** | `skip` | **Excluded** | **$0$ Weight (Ignored to prevent fake inflation)** |

---

## 🔬 5. Proof of Concept: Comparing Scenarios

Assume platform aggregates compute $C = 4.0$ and $m = 10$:

### Scenario A: New Item with 1 Five-Star Review ($v = 1, R = 5.0$)
* **Old Hardcoded Model**: Ranked at **$5.00$** *(Unfairly #1)*
* **Bayesian Model**: 

$$\text{Score} = \frac{1(5.0) + 10(4.0)}{1 + 10} = \frac{45.0}{11} = \mathbf{4.09\text{ Stars}}$$

### Scenario B: Established Provider with 200 Reviews ($v = 200, R = 4.7$)
* **Old Hardcoded Model**: Ranked at **$4.70$**
* **Bayesian Model**:

$$\text{Score} = \frac{200(4.7) + 10(4.0)}{200 + 10} = \frac{940 + 40}{210} = \mathbf{4.67\text{ Stars}}$$

> **Verdict**: The established provider rightfully ranks **#1 ($4.67$)** over the new unproven item **($4.09$)**.

---

## 🏆 6. Total Marketplace Composite Score ($0 - 100$)

The Bayesian Average is combined with behavioral conversion signals into a master **Marketplace Score ($0 - 100$)**:

$$\text{Marketplace Score} = \left(40\% \times \frac{R_{\text{Bayesian}}}{5} \times 100\right) + \left(30\% \times \text{CompletionRate}\right) + \left(20\% \times \text{ConversionRate}\right) + \left(10\% \times \text{RepeatPurchases}\right) - \text{RefundPenalty}$$

Where:
* $\text{CompletionRate} = \frac{\text{Completed Steps}}{\text{Purchases}} \times 100$
* $\text{ConversionRate} = \frac{\text{Purchases}}{\max(\text{Views}, 1)} \times 100$
* $\text{RefundPenalty} = 10 \times (\text{Refund Count} + \text{Complaints})$

---

## 💻 7. Backend JavaScript Implementation

```javascript
/**
 * Computes dynamic Bayesian Average Rating from MongoDB data
 * Formula: Bayesian Average = (v * R + m * C) / (v + m)
 */
async function calculateDynamicBayesianRating(itemVolume, itemAverage) {
  const MarketplaceAnalytics = require("../models/MarketplaceAnalyticsModel");

  // Fetch all items with at least 1 rating
  const allItems = await MarketplaceAnalytics.find({ rating_count: { $gt: 0 } })
    .select("average_rating rating_count")
    .lean();

  let C = 4.0; // Fallback prior mean
  let m = 5;   // Fallback confidence threshold

  if (allItems.length > 0) {
    const totalCount = allItems.reduce((sum, item) => sum + (item.rating_count || 0), 0);
    const totalSum   = allItems.reduce((sum, item) => sum + ((item.average_rating || 0) * (item.rating_count || 0)), 0);

    if (totalCount > 0) {
      C = totalSum / totalCount;
      m = Math.max(1, Math.round(totalCount / allItems.length));
    }
  }

  const v = Number(itemVolume) || 0;
  const R = Number(itemAverage) || C;

  if (v <= 0) return Math.round(C * 100) / 100;

  const bayesianScore = (v * R + m * C) / (v + m);
  return Math.round(bayesianScore * 100) / 100;
}
```

---

## 🖥️ 8. Dynamic Frontend Star Rendering

In React, stars render dynamically from the calculated decimal rating:

```javascript
// Render gold stars (★) and empty stars (☆) dynamically
const displayRating = Math.round(item.bayesian_rating || item.average_rating || 0);
const starString = "★".repeat(displayRating) + "☆".repeat(5 - displayRating);
```

---

## 🛠️ 9. Implementation Checklist

- [ ] Add `calculateDynamicBayesianRating()` utility to `MarketplaceRankingService.js`.
- [ ] Remove `actionRatingMap` hardcoded dictionary from `PartnerDashboardController.js`.
- [ ] Exclude `action: "skip"` from modifying `rating_count` or adding fake ratings in `FeedbackController.js`.
- [ ] Update `PartnerExclusiveDashboard.jsx` and `PartnerFeedback.jsx` to consume `bayesian_rating`.
