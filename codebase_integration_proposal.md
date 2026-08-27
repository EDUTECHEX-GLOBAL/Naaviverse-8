# Naaviverse Architecture Proposal: Codebase Integration

This proposal explores the feasibility, advantages, and drawbacks of combining the separate codebases for the **Naavi Agent** (AI planning engine) and the **Main Naaviverse Platform** (MERN-stack application).

---

## Current Architecture Overview
Currently, the system runs on a **Distributed Services Architecture**:
* **Naaviverse Platform**: Built with React (Frontend) and Node.js/Express (Backend). Handles authorization, database persistence (MongoDB), payment processing (Razorpay), and dashboard rendering.
* **Naavi Agent**: An independent AI planning service running on Hugging Face Spaces. It parses data, makes planning decisions, and exposes REST endpoints.
* **Communication**: The Node.js backend calls the Hugging Face Spaces REST API over HTTP to sync paths and marketplace steps.

---

## Comparison of Integration Strategies

### Option 1: The Monorepo Approach (Recommended)
Keep both services decoupled (running on separate environments) but consolidate them into a single Git repository.

```text
naaviverse-workspace/
  ├── naaviverse-frontend/      # React client app
  ├── careers-backend-node/     # Main Node.js API
  └── naavi-agent/              # Python / HF Agent service
```

#### Pros
* **Unified Version Control**: A single commit or pull request can coordinate a database schema update in the backend, a new property in the Agent parser, and its corresponding view on the Frontend.
* **Easier Development Setup**: Developers can open a single workspace folder. A root task runner (e.g., `concurrently` or `npm workspaces`) allows starting all systems locally with a single command.
* **Separation of Concerns**: The platform API remains lightweight and highly available, while the resource-intensive AI logic runs in its own environment.

#### Cons
* The build/deployment pipelines need to target separate deployment hosts (e.g., Vercel/Render for Node/React, Hugging Face for the Python Agent).

---

### Option 2: Code-Level Merge (Single Express App)
Merging the Python Naavi Agent code directly inside the Express controller files.

#### Pros
* **Zero Network Latency**: No REST API calls or timeouts between the backend and the agent.
* **Unified Database Operations**: The agent code can read and write directly to MongoDB without passing through REST proxies.

#### Cons / Critical Risks
* **Language & Library Mismatch**: AI Engines are heavily dependent on Python ecosystems (e.g., LangChain, crewAI, PyTorch, NumPy). Rewriting this code into Node.js Javascript is time-consuming, and running Python shell child-processes inside Node is brittle.
* **CPU Thread Blocking**: AI generation is compute-heavy. Since Node.js is single-threaded, running long-running agent loops inside the Express API will freeze Express, causing other users' requests (like logging in or clicking pay) to time out.
* **Scalability Bottlenecks**: You cannot scale the API server independently from the AI execution nodes.

---

## Summary Recommendation
The best path forward is **Option 1: The Monorepo Approach**.

It keeps the execution runtime isolated (saving the Express server from CPU resource blocks) while giving the development team the extreme ease of working in a single unified codebase.
