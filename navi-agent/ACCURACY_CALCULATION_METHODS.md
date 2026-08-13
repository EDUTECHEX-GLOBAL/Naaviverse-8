# 🛠️ 5 Ways to Calculate AI Pathway Accuracy

> **Simple Guide for Team & Management Meetings**  
> *How can we measure if an AI-generated roadmap is accurate, high-quality, and reliable?*

---

## 1. Rule-Based Mathematical Model (Current Method) 🧮

### How it works:
Think of this like a **weighted grading formula** in school out of 100 points:
* **30 Points (Structure):** Checks if the AI gave the right number of steps for the student's grade level.
* **40 Points (Detail Depth):** Checks if all step views (Macro, Micro, Nano) and learning objectives are complete.
* **30 Points (Marketplace Match):** Checks if course titles and vendor names contain keywords from the step.

### Formula:
$$\text{Accuracy} = (30\% \times \text{Structure}) + (40\% \times \text{Detail Depth}) + (30\% \times \text{Marketplace Match})$$

* **Pros:** ⚡ Super fast, zero API cost, 100% predictable math.
* **Cons:** Measures text presence and length rather than deep human meaning.

---

## 2. Smart Meaning Match (Vector Cosine Similarity) 🧠

### How it works:
Instead of just matching exact words, an AI embedding model converts text into **concept vectors (numbers)** to measure how close two meanings are.

### Example:
* **Step Topic:** *"English Language Proficiency Exam"*
* **Course Title:** *"IELTS Academic Masterclass"*
* **Result:** Even though the exact words don't match ("IELTS" vs "English Language Exam"), the AI knows they mean the **same thing** and scores it **95% Accurate**.

* **Pros:** 🎯 Extremely accurate—understands synonyms, intent, and true context.
* **Cons:** Needs a small AI embedding API call.

---

## 3. AI Evaluator (LLM-as-a-Judge) 👩‍⚖️

### How it works:
A second, independent AI (like GPT-4 or Llama 3.3) acts as a **teacher or auditor**. It reads the roadmap and grades it from 1 to 5 on 4 simple criteria:

1. **Logical Order:** Are steps in the correct chronological sequence?
2. **Goal Match:** Does this roadmap actually help reach the student's target goal?
3. **Actionability:** Are the micro-steps realistic and clear?
4. **Resource Quality:** Are the recommended courses relevant?

* **Pros:** 🤖 High-quality, human-like review of the roadmap.
* **Cons:** Takes 2-3 extra seconds and increases API costs per request.

---

## 4. Key Term Frequency Matching (TF-IDF Model) 🔍

### How it works:
This is how **Google Search** works. It ignores common filler words (*"the"*, *"course"*, *"learn"*, *"step"*) and focuses **only on rare, important technical keywords** (*"Python"*, *"IELTS"*, *"SAT Math"*, *"Organic Chemistry"*).

### Example:
* If Step 3 is about **"IELTS Preparation"**, a course named *"IELTS Speaking Course"* gets **100% Match**, but a course named *"Python Programming"* gets **0% Match**.

* **Pros:** 🎯 Highly accurate keyword matching without needing full vector AI embeddings.
* **Cons:** Requires extracting a keyword dictionary.

---

## 5. Sequence & Order Check (Topological Graph Model) 🔗

### How it works:
Treats the roadmap like a **prerequisite ladder**. It verifies that step 1 comes before step 2, step 2 before step 3, with **zero out-of-order steps**.

### Example:
* ✅ **Correct Order:** *Learn Fundamentals (Step 1) $\rightarrow$ Build Projects (Step 2) $\rightarrow$ Apply to University (Step 3)*
* ❌ **Wrong Order:** *Apply to University (Step 1) $\rightarrow$ Learn Fundamentals (Step 3)*

* **Pros:** ⛓️ Guarantees that students build prerequisites in logical chronological order.
* **Cons:** Only checks step sequence, not course quality.

---

## 📊 Summary Comparison for Management

| Method | Speed | Accuracy Level | Cost | Recommended Use Case |
| :--- | :---: | :---: | :---: | :--- |
| **1. Rule-Based Math** | ⚡ Instant | Moderate | $0 | **Currently Active (Core Engine)** |
| **2. Vector Similarity** | 🚀 Fast | High | Very Low | **Best for Course Matching** |
| **3. AI Evaluator** | 🐢 2-3s | Very High | Medium | **Best for Periodic Quality Audits** |
| **4. TF-IDF Keywords** | ⚡ Instant | High | $0 | **Best for Step-to-Course Keyword Match** |
| **5. Order Check** | ⚡ Instant | High | $0 | **Best for Prerequisite Validation** |

---

*Document prepared for Naaviverse-8 / Navi-Agent Development Reference* 📝
