/**
 * ============================================================
 *  🤖 AgentPathsController.js
 *  Fetches published paths from the Naaviverse AI Agent
 *  (HuggingFace FastAPI) and transforms/saves them to the
 *  local naavi-mock database so they work seamlessly in the
 *  entire platform user flow.
 * ============================================================
 */

const axios = require('axios');
const mongoose = require('mongoose');
const Path = require('../models/PathModel');
const Step = require('../models/StepsModel');
const MarketplaceItem = require('../models/MarketplaceModel');

// ── Agent URL — set AGENT_API_URL in .env per environment ────────────────────
// Local dev  → AGENT_API_URL=http://localhost:8001
// Production → AGENT_API_URL=https://naaviverse-naaviverse-path.hf.space
const AGENT_API_URL = process.env.AGENT_API_URL || 'http://localhost:8001';
console.log(`[AgentConfig] Agent URL → ${AGENT_API_URL}`);

// ─────────────────────────────────────────────────────────────────────────────
// DATA CLEANERS: Ensure incoming values match strict Mongoose enums
// ─────────────────────────────────────────────────────────────────────────────
function cleanGrade(gradeStr) {
  if (!gradeStr) return null;
  const match = gradeStr.toString().match(/\d+/);
  if (match) {
    const val = match[0];
    if (['9', '10', '11', '12'].includes(val)) {
      return val;
    }
  }
  return null;
}

// Map common curriculum inputs to platform enum ['IB', 'IGCSE', 'CBSE', 'ICSE', 'Nordic']
function cleanCurriculum(currStr) {
  if (!currStr) return null;
  const upper = currStr.toString().toUpperCase().trim();
  if (['IB', 'IGCSE', 'CBSE', 'ICSE', 'NORDIC'].includes(upper)) {
    return upper === 'NORDIC' ? 'Nordic' : upper;
  }
  return null;
}

// Map common stream inputs to platform enum ['MPC', 'BIPC', 'CEC', 'MEC', 'HEC']
function cleanStream(streamStr) {
  if (!streamStr) return null;
  const upper = streamStr.toString().toUpperCase().trim();
  if (['MPC', 'BIPC', 'CEC', 'MEC', 'HEC'].includes(upper)) {
    return upper;
  }
  if (upper.includes('COMMERCE')) return 'CEC';
  if (upper.includes('SCIENCE') || upper.includes('MPC')) return 'MPC';
  if (upper.includes('BIPC') || upper.includes('BIOLOGY')) return 'BIPC';
  if (upper.includes('MEC')) return 'MEC';
  if (upper.includes('HEC') || upper.includes('HUMANITIES') || upper.includes('ARTS')) return 'HEC';
  return null;
}

// Map common financialSituation inputs to platform enum ['0-25L', '25L-75L', '75L-3CR', '3CR+', 'Other']
function cleanFinancial(finStr) {
  if (!finStr) return null;
  const s = finStr.toString().trim();
  if (['0-25L', '25L-75L', '75L-3CR', '3CR+', 'Other'].includes(s)) {
    return s;
  }
  if (s.includes('0-25') || s.includes('0% - 25%') || s.includes('0%-25%')) return '0-25L';
  if (s.includes('25-75') || s.includes('50-75') || s.includes('25L-75L')) return '25L-75L';
  if (s.includes('75-3') || s.includes('75L-3CR')) return '75L-3CR';
  if (s.includes('3CR') || s.includes('3CR+')) return '3CR+';
  return 'Other';
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKETPLACE PARSER: Normalize AI recommended items into main schema
// ─────────────────────────────────────────────────────────────────────────────
function extractMarketplaceItems(step, stepObjectId, pathObjectId, partnerEmail) {
  const items = [];

  const normalizeAndPush = (raw, layer, category) => {
    if (!raw || !raw.name) return;

    // Normalize cost/price string
    let costVal = raw.cost || raw.price || 'free';
    if (costVal.toString().trim() === '') {
      costVal = 'free';
    }

    const isFree = costVal.toString().toLowerCase() === 'free';

    // ── AUTO-CORRECT LAYER BASED ON ACCESS ─────────────────────────────────
    // Rule: Macro = Free items only | Micro & Nano = Paid items only
    // If the AI agent places a free item in micro/nano, move it to macro.
    let correctedLayer = layer;
    if (isFree && (layer === 'micro' || layer === 'nano')) {
      correctedLayer = 'macro';
    }

    items.push({
      partner_email: partnerEmail,
      path_id: pathObjectId,
      step_id: stepObjectId,
      layer: correctedLayer, // corrected: free items always go to macro
      role: raw.type || raw.role || (correctedLayer === 'nano' ? 'Mentor' : 'Resource'),
      category: category || 'vendor',
      name: raw.name,
      access: isFree ? 'free' : 'paid',
      cost: costVal,
      goal: raw.why || raw.value || raw.goal || '',
      outcomes: raw.expected_outcomes || raw.value || raw.outcomes || '',
      duration: raw.duration || '',
      iterations: raw.session_details || raw.iterations || '',
      discount: raw.discount || '',
      features: raw.next_step || raw.features || '',
      status: 'active'
    });
  };

  // Format 1: Inside macro_view.marketplace, micro_view.marketplace, nano_view.marketplace
  const layers = ['macro', 'micro', 'nano'];
  layers.forEach(layer => {
    const view = step[`${layer}_view`];
    if (view && view.marketplace) {
      const cats = ['mentors', 'vendors', 'institutions', 'distributors'];
      cats.forEach(cat => {
        const arr = view.marketplace[cat];
        if (Array.isArray(arr)) {
          arr.forEach(item => {
            let mappedCat = 'vendor';
            if (cat === 'mentors') mappedCat = 'mentor';
            if (cat === 'vendors') mappedCat = 'vendor';
            if (cat === 'institutions') mappedCat = 'institution';
            if (cat === 'distributors') mappedCat = 'distributor';
            normalizeAndPush(item, layer, mappedCat);
          });
        }
      });
    }
  });

  // Format 2: Direct step.marketplace.macro_free / micro_structured / nano_expert
  if (step.marketplace) {
    const mappings = {
      macro_free: 'macro',
      micro_structured: 'micro',
      nano_expert: 'nano'
    };
    Object.keys(mappings).forEach(key => {
      const arr = step.marketplace[key];
      const layer = mappings[key];
      if (Array.isArray(arr)) {
        arr.forEach(item => {
          let mappedCat = 'vendor';

          // 1. Trust explicit category from agent data
          const explicitCat = (item.category || '').toLowerCase().trim();
          if (['mentor', 'vendor', 'distributor', 'institution', 'resource'].includes(explicitCat)) {
            mappedCat = explicitCat === 'resource' ? 'vendor' : explicitCat;
          } else {
            // 2. Fallback: keyword match on type and role
            const typeLower = `${item.type || ""} ${item.role || ""}`.toLowerCase();
            if (typeLower.includes('mentor') || typeLower.includes('tutor') || typeLower.includes('advisor') || typeLower.includes('coach')) {
              mappedCat = 'mentor';
            } else if (typeLower.includes('university') || typeLower.includes('school') || typeLower.includes('college') || typeLower.includes('institute') || typeLower.includes('institution')) {
              mappedCat = 'institution';
            } else if (typeLower.includes('distributor')) {
              mappedCat = 'distributor';
            }
            // items with type 'Expert', 'Course', 'Subscription', 'Tool' etc. stay as 'vendor'
          }
          normalizeAndPush(item, layer, mappedCat);
        });
      }
    });
  }

  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNC: Pull published paths from agent and save to local DB on-the-fly
// ─────────────────────────────────────────────────────────────────────────────
async function syncAgentPaths() {
  try {
    console.log(`[AgentSync] Fetching published paths from agent API: ${AGENT_API_URL}`);
    const agentRes = await axios.get(
      `${AGENT_API_URL}/api/admin/paths?status=published`,
      { timeout: 10000 }
    );

    const rawPaths = Array.isArray(agentRes.data) ? agentRes.data : [];
    console.log(`[AgentSync] Found ${rawPaths.length} published paths on agent`);

    for (const agentPath of rawPaths) {
      const agentIdStr = agentPath.id || agentPath._id;
      if (!agentIdStr || !mongoose.Types.ObjectId.isValid(agentIdStr)) {
        continue;
      }

      const pathObjectId = new mongoose.Types.ObjectId(agentIdStr);

      // 1. Check if this path already exists in naavi-mock DB
      const existingPath = await Path.findById(pathObjectId);
      if (existingPath) {
        continue;
      }

      // 2. Fetch the detailed path document from HuggingFace to get the steps (excluded from bulk list by projection)
      console.log(`[AgentSync] Fetching details for agent path ID: ${agentIdStr}`);
      const detailsRes = await axios.get(
        `${AGENT_API_URL}/api/paths/${agentIdStr}`,
        { timeout: 10000 }
      );

      const fullAgentPath = detailsRes.data;
      const roadmap = fullAgentPath.roadmap_data || {};
      const original = fullAgentPath.original_roadmap_data || {};
      const profile = fullAgentPath.profile || {};

      // Look in roadmap.steps, original_roadmap_data.steps, or roadmap.macro_path from full detail JSON
      const steps = roadmap.steps || original.steps || roadmap.macro_path || [];

      console.log(`[AgentSync] Importing path "${roadmap.path_title}" with ${steps.length} steps`);

      // 3. Parse personality to match PathModel enum
      let parsedPersonality = undefined;
      if (profile.personality) {
        const pLower = profile.personality.toString().toLowerCase();
        if (pLower.includes('realistic')) parsedPersonality = 'realistic';
        else if (pLower.includes('investigative')) parsedPersonality = 'investigative';
        else if (pLower.includes('artistic')) parsedPersonality = 'artistic';
        else if (pLower.includes('social')) parsedPersonality = 'social';
        else if (pLower.includes('enterprising')) parsedPersonality = 'enterprising';
        else if (pLower.includes('conventional')) parsedPersonality = 'conventional';
      }

      // 4. Clean and map arrays to match enums
      const gradeVal = cleanGrade(profile.grade);
      const curriculumVal = cleanCurriculum(profile.curriculum);
      const streamVal = cleanStream(profile.stream);
      const financialVal = cleanFinancial(profile.financialSituation);

      const cleanedGrades = gradeVal ? [gradeVal] : [];
      const cleanedCurriculums = curriculumVal ? [curriculumVal] : [];
      const cleanedStreams = streamVal ? [streamVal] : [];
      const cleanedFinancials = financialVal ? [financialVal] : [];

      const creatorEmail = profile.email || fullAgentPath.createdBy || fullAgentPath.created_by || 'agent@naaviverse.com';

      // 5. Create Step documents first
      const stepIdsForPath = [];
      const stepDocsToCreate = [];
      let marketplaceDocsToCreate = [];

      for (let idx = 0; idx < steps.length; idx++) {
        const step = steps[idx];
        const stepObjectId = new mongoose.Types.ObjectId();
        const stepOrder = step.id || step.step_order || (idx + 1);

        // Normalize view descriptions
        const macroDesc = typeof step.macro_view === 'object' ? step.macro_view?.description || '' : step.macro_view || '';
        const microDesc = typeof step.micro_view === 'object' ? step.micro_view?.description || '' : step.micro_view || '';
        const nanoDesc = typeof step.nano_view === 'object' ? step.nano_view?.description || '' : step.nano_view || '';

        stepDocsToCreate.push({
          _id: stepObjectId,
          email: creatorEmail,
          name: step.title || `Step ${stepOrder}`,
          description: step.description || '',
          step_order: stepOrder,
          path_id: pathObjectId,
          status: 'active',

          macro_name: step.title || `Step ${stepOrder}`,
          macro_description: macroDesc || step.description || '',
          macro_length: step.duration || '',

          micro_name: step.title || `Step ${stepOrder}`,
          micro_description: microDesc || step.description || '',
          micro_length: step.duration || '',

          nano_name: step.title || `Step ${stepOrder}`,
          nano_description: nanoDesc || step.description || '',
          nano_length: step.duration || '',
        });

        stepIdsForPath.push({
          step_id: stepObjectId,
          stepName: step.title || `Step ${stepOrder}`,
          stepDescription: step.description || '',
        });

        // Parse and push any marketplace items for this step
        const stepMarketplaceItems = extractMarketplaceItems(step, stepObjectId, pathObjectId, creatorEmail);
        marketplaceDocsToCreate = marketplaceDocsToCreate.concat(stepMarketplaceItems);
      }

      if (stepDocsToCreate.length > 0) {
        await Step.insertMany(stepDocsToCreate);
      }

      if (marketplaceDocsToCreate.length > 0) {
        await MarketplaceItem.insertMany(marketplaceDocsToCreate);
        console.log(`[AgentSync] Created ${marketplaceDocsToCreate.length} marketplace items for path`);
      }

      // 6. Create and save the Path document
      const pathDoc = {
        _id: pathObjectId,
        email: creatorEmail,
        nameOfPath: roadmap.path_title || fullAgentPath.target_goal || 'AI Generated Path',
        name: roadmap.path_title || fullAgentPath.target_goal || 'AI Generated Path',
        description: roadmap.path_description || '',
        program: roadmap.path_title || fullAgentPath.target_goal || 'AI Generated Path',
        status: 'active',
        length: roadmap.total_duration ? parseInt(roadmap.total_duration) || 36 : 36,
        total_steps: steps.length || 5,
        grade: cleanedGrades,
        curriculum: cleanedCurriculums,
        stream: cleanedStreams,
        financialSituation: cleanedFinancials,
        personality: parsedPersonality,
        city: profile.city || '',
        country: profile.country || '',
        the_ids: stepIdsForPath
      };

      await Path.create(pathDoc);
      console.log(`[AgentSync] Successfully imported path "${pathDoc.nameOfPath}" into naavi-mock DB`);
    }

  } catch (error) {
    console.error('[AgentSync] Error syncing paths from agent:', error.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFORM: Convert Agent path JSON → Platform path shape (UI fallback)
// ─────────────────────────────────────────────────────────────────────────────
function transformAgentPath(agentPath) {
  const roadmap = agentPath.roadmap_data || {};
  const original = agentPath.original_roadmap_data || {};
  const profile = agentPath.profile || {};
  const steps = roadmap.steps || original.steps || roadmap.macro_path || [];

  return {
    _id: agentPath.id || agentPath._id,
    source: 'agent',
    nameOfPath: roadmap.path_title || agentPath.target_goal || 'AI Generated Path',
    description: roadmap.path_description || '',
    target_goal: agentPath.target_goal || '',
    current_position: agentPath.current_position || '',
    grade: profile.grade ? [profile.grade] : [],
    curriculum: profile.curriculum ? [profile.curriculum] : [],
    stream: profile.stream ? [profile.stream] : [],
    financialSituation: profile.financialSituation ? [profile.financialSituation] : [],
    personality: profile.personality || '',
    country: profile.country || '',
    city: profile.city || '',
    readiness_score: roadmap.readiness_score || 0,
    readiness_label: roadmap.readiness_label || '',
    total_duration: roadmap.total_duration || '',
    blind_spots: roadmap.blind_spots || [],
    the_ids: steps.map((step, idx) => ({
      step_id: null,
      stepName: step.title || `Step ${idx + 1}`,
      stepDescription: step.description || '',
      duration: step.duration || '',
      macro_view: typeof step.macro_view === 'object' ? step.macro_view?.description || '' : step.macro_view || '',
      micro_view: typeof step.micro_view === 'object' ? step.micro_view?.description || '' : step.micro_view || '',
      nano_view: typeof step.nano_view === 'object' ? step.nano_view?.description || '' : step.nano_view || '',
      marketplace: step.marketplace || {},
      micro_steps: step.micro_steps || [],
      learning_objectives: step.learning_objectives || [],
    })),
    status: 'active',
    published_at: agentPath.published_at || agentPath.created_at,
    createdAt: agentPath.created_at,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agent-paths
// ─────────────────────────────────────────────────────────────────────────────
const getAgentPaths = async (req, res) => {
  try {
    // Run synchronization check first
    await syncAgentPaths();

    // Now query them from our local database so we are 100% consistent
    const query = { status: "active" };
    const { grade, curriculum, stream, personality, financialSituation } = req.query;

    if (grade) query.grade = { $in: [grade] };
    if (curriculum) query.curriculum = { $in: [curriculum] };
    if (stream) query.stream = { $in: [stream] };
    if (financialSituation) query.financialSituation = { $in: [financialSituation] };
    if (personality) query.personality = personality;

    const matchedPaths = await Path.find(query).lean();

    return res.status(200).json({
      status: true,
      total: matchedPaths.length,
      message: 'Agent paths retrieved successfully',
      data: matchedPaths,
    });

  } catch (error) {
    console.error('[AgentPaths] Error:', error.message);
    return res.status(200).json({
      status: true,
      total: 0,
      message: 'Error fetching agent paths.',
      data: [],
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agent-paths/:agentPathId
// ─────────────────────────────────────────────────────────────────────────────
const getAgentPathById = async (req, res) => {
  try {
    const { agentPathId } = req.params;
    const path = await Path.findById(agentPathId).lean();
    if (!path) {
      return res.status(404).json({
        status: false,
        message: 'Path not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Path fetched successfully',
      data: path,
    });

  } catch (error) {
    console.error('[AgentPaths] Error:', error.message);
    return res.status(404).json({
      status: false,
      message: 'Path not found',
    });
  }
};

module.exports = {
  getAgentPaths,
  getAgentPathById,
  syncAgentPaths,
};
//just created to connect the backend
