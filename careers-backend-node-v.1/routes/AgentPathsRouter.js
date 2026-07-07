/**
 * ============================================================
 *  🤖 AgentPathsRouter.js
 *  Routes for fetching AI-generated paths from HuggingFace
 * ============================================================
 */

const express = require('express');
const router  = express.Router();
const { getAgentPaths, getAgentPathById } = require('../controllers/AgentPathsController');

// GET /api/agent-paths
// Returns all published paths from the AI Agent
// Optional filters: ?grade=11&stream=MPC&curriculum=CBSE&personality=investigative
router.get('/', getAgentPaths);

// GET /api/agent-paths/:agentPathId
// Returns a single path from the AI Agent by its ID
router.get('/:agentPathId', getAgentPathById);

module.exports = router;
