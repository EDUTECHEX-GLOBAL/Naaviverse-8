//dashboard.jsx::

import { useState, useEffect } from "react";
import './Dashboard.scss';
import {
  IconArrowRight, IconBrain, IconNavigation, IconRoute, IconCheck,
} from "./Icons";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8001" : "");

const LOADING_MSGS = [
  "Analyzing your profile...",
  "Building your roadmap...",
  "Refining milestones and checklists...",
  "Finding learning resources...",
  "Preparing final recommendations...",
  "Your career path is ready!",
];

const WORKFLOW_STEPS = [
  { key: "agent1", title: "Agent 1", message: "Creating pathway alternatives..." },
  { key: "agent2", title: "Agent 2", message: "Validating goals and readiness..." },
  { key: "agent3", title: "Agent 3", message: "Checking milestones and checklists..." },
  { key: "agent4", title: "Agent 4", message: "Checking learning resources..." },
  { key: "ready", title: "Path Ready", message: "Preparing final recommendations..." },
];

const STEP_COLORS = [
  { border: "#2CA852", bg: "#EEF9F1", text: "#1B6932", pill: "pill-teal" },
  { border: "#1D72F2", bg: "#E8F0FE", text: "#1A5DC8", pill: "pill-blue" },
  { border: "#EB4335", bg: "#FDF2F2", text: "#A8201A", pill: "pill-coral" },
  { border: "#F9B000", bg: "#FEF7E0", text: "#8A6000", pill: "pill-amber" },
];

const CONTENT_SEGMENTS = [
  {
    key: "academic",
    label: "Academic & Research",
    prompt: "Academic & Research",
    subSegments: [
      { key: "school", label: "School: K-12" },
      { key: "pre_university", label: "Pre-University: Grade 11-12" },
      { key: "university", label: "University: Bachelor's / Master's / PhD / Transfer" },
    ],
  },
  {
    key: "practical",
    label: "Practical & Skills",
    prompt: "Practical & Skills",
    subSegments: [
      { key: "skills", label: "Skills Track" },
      { key: "internship", label: "Internship Track" },
    ],
  },
  {
    key: "jobs",
    label: "Jobs & Careers",
    prompt: "Jobs & Careers",
    subSegments: [
      { key: "technical", label: "Technical Roles" },
      { key: "non_technical", label: "Non-Technical Roles" },
    ],
  },
  {
    key: "non_academic",
    label: "Non-Academic Counselling",
    prompt: "Non-Academic Counselling",
    subSegments: [
      { key: "mental_health", label: "Mental Health & Wellness" },
      { key: "life", label: "Generic Life Counselling" },
      { key: "immediate", label: "Short-term / Immediate Guidance" },
    ],
  },
];

const CATEGORY_TABS = {
  academic: ["Research & Honors Focus", "Test Prep & Admissions Focus", "Curriculum & GPA Focus"],
  practical: ["Project Portfolio Focus", "Certification & Bootcamp Focus", "Internship & Applied Focus"],
  jobs: ["Technical Role Prep Focus", "Interview & Networking Focus", "Resume & Career Evidence Focus"],
  non_academic: ["Mental Health & Wellness Focus", "Life Skills & Decision Focus", "Immediate Action & Support Focus"]
};

function getProfileValue(profile, key) {
  return profile?.[key]?.trim?.() || profile?.[key] || "Not provided";
}

function analyzeGoalParts(goalText) {
  if (!goalText || !goalText.trim()) {
    return {
      degreeType: "",
      program: "",
      university: "",
      country: "",
      missing: ["degreeType", "program", "university", "country"]
    };
  }

  // Split by dot or middle dot
  const rawParts = goalText.split(/[•.]+/).map(p => p.trim()).filter(Boolean);

  let degreeType = "";
  let program = "";
  let university = "";
  let country = "";

  const degreeKeywords = [
    "bachelor's", "bachelors", "bachelor", "master's", "masters", "master", "phd", "ph.d", "transfer", "associate", "associates", "diploma", "doctorate", "ug", "pg", "undergraduate", "graduate", "postgraduate", "b.s", "b.a", "m.s", "m.a", "btech", "mtech", "b.tech", "m.tech", "mba", "bsc", "msc", "b.sc", "m.sc"
  ];

  const countryKeywords = [
    "usa", "us", "uk", "united states", "united kingdom", "india", "canada",
    "germany", "australia", "singapore", "france", "japan", "switzerland",
    "netherlands", "sweden", "italy", "spain", "china", "hong kong", "ireland", "new zealand"
  ];

  const universityKeywords = [
    "university", "college", "uni", "institute", "school", "tech", "iit",
    "mit", "yale", "stanford", "harvard", "oxford", "cambridge", "princeton",
    "columbia", "cornell", "caltech", "berkeley", "ucla", "nyu", "hec", "bits"
  ];

  const isCountry = (str) => {
    const s = str.toLowerCase();
    return countryKeywords.includes(s) || s.length === 2 || s.length === 3;
  };

  const isUniversity = (str) => {
    const s = str.toLowerCase();
    return universityKeywords.some(keyword => s.includes(keyword));
  };

  const isDegreeType = (str) => {
    const s = str.toLowerCase();
    return degreeKeywords.some(keyword => s.includes(keyword));
  };

  const unassigned = [...rawParts];

  // 1. Identify Country
  const countryIdx = unassigned.findIndex(p => isCountry(p));
  if (countryIdx !== -1) {
    country = unassigned[countryIdx];
    unassigned.splice(countryIdx, 1);
  }

  // 2. Identify University
  const uniIdx = unassigned.findIndex(p => isUniversity(p));
  if (uniIdx !== -1) {
    university = unassigned[uniIdx];
    unassigned.splice(uniIdx, 1);
  }

  // 3. Identify Degree Type
  const degreeIdx = unassigned.findIndex(p => isDegreeType(p));
  if (degreeIdx !== -1) {
    degreeType = unassigned[degreeIdx];
    unassigned.splice(degreeIdx, 1);
  }

  // 4. Remaining goes to program
  if (unassigned.length > 0) {
    program = unassigned.join(" ");
  }

  const missing = [];
  if (!degreeType) missing.push("degreeType");
  if (!program) missing.push("program");
  if (!university) missing.push("university");
  if (!country) missing.push("country");

  return { degreeType, program, university, country, missing };
}

function analyzeRefinement(text) {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      message: "Please describe the changes you want to make to this pathway."
    };
  }

  const val = text.toLowerCase().trim();

  // Noise / irrelevant keywords/prompts check
  const noiseKeywords = [
    "tell me a story", "tell a story", "write a story", "write a poem", "write a song",
    "tell me a joke", "tell a joke", "joke", "weather", "capital of", "who is",
    "what is the meaning of life", "hi", "hello", "hey", "how are you", "what's up",
    "sing a song", "write code", "help me chat", "how are you doing"
  ];

  if (noiseKeywords.some(noise => val.includes(noise)) || val.length < 4) {
    return {
      isValid: false,
      message: "Information is not accurate or irrelevant. Please provide path-related refinement instructions."
    };
  }

  // Keywords that must be present to count as relevant refinement
  const validKeywords = [
    "step", "milestone", "path", "road", "course", "market", "description", "objective",
    "duration", "add", "change", "remove", "delete", "update", "make", "give", "focus",
    "study", "prep", "sat", "ielts", "act", "toefl", "exam", "career", "university",
    "college", "school", "curriculum", "grade", "subject", "class", "detail", "more",
    "resource", "mentor", "timeline", "month", "year", "academics", "score", "placement",
    "portfolio", "admission", "ielts", "gpa", "internship", "project"
  ];

  const hasValidKeyword = validKeywords.some(kw => val.includes(kw));

  if (!hasValidKeyword) {
    return {
      isValid: false,
      message: "Information is not accurate or irrelevant. E.g. try: 'change step 1 description' or 'add more steps'."
    };
  }

  return {
    isValid: true,
    message: "Instruction looks good! Click Refine Pathway to apply changes."
  };
}

function parseSurgicalRefinement(prompt, steps) {
  if (!prompt || !steps || steps.length === 0) return null;

  const text = prompt.toLowerCase();

  // Look for step/milestone/phase and number
  const stepMatch = text.match(/(?:step|milestone|phase)\s*(\d+)/i);
  if (!stepMatch) return null;

  const stepId = parseInt(stepMatch[1], 10);
  const targetStep = steps.find(s => s.id === stepId);
  if (!targetStep) return null;

  let field = null;
  let marketplaceSection = null;
  let marketplaceCategory = null;

  // ── PRIORITY 1: Marketplace / vendor keywords (must come before "macro" check
  //    because users often say "marketplace for the macro section" and the word
  //    "macro" appears as context, NOT as the target field).
  if (
    text.includes("marketplace") ||
    text.includes("vendor") ||
    text.includes("vendors") ||
    text.includes("market") ||
    text.includes("resource") ||
    text.includes("provider") ||
    text.includes("platform") ||
    text.includes("mentor") ||
    text.includes("bootcamp") ||
    text.includes("certification")
  ) {
    field = "marketplace";

    // Marketplace scope is explicit and deterministic. Category words describe
    // WHAT changes; macro/micro/nano words describe WHERE it changes.
    if (text.includes("mentor") || text.includes("coach") || text.includes("coaching")) {
      marketplaceCategory = "mentors";
    } else if (text.includes("institution") || text.includes("university") || text.includes("college") || text.includes("school")) {
      marketplaceCategory = "institutions";
    } else if (text.includes("distributor") || text.includes("youtube") || text.includes("book") || text.includes("docs") || text.includes("community")) {
      marketplaceCategory = "distributors";
    } else {
      marketplaceCategory = "vendors";
    }

    if (text.includes("nano") || text.includes("expert session")) {
      marketplaceSection = "nano_expert";
    } else if (text.includes("micro") || text.includes("paid") || text.includes("structured")) {
      marketplaceSection = "micro_structured";
    } else {
      marketplaceSection = "macro_free";
    }

    // ── PRIORITY 2: micro_steps (before generic "micro" check)
  } else if (
    text.includes("micro_steps") ||
    text.includes("micro steps") ||
    text.includes("micro-steps") ||
    text.includes("microstep") ||
    text.includes("checklist") ||
    text.includes("todo")
  ) {
    field = "micro_steps";

    // ── PRIORITY 3: micro_view (generic micro, but NOT marketplace context)
  } else if (
    text.includes("micro_view") ||
    text.includes("micro view") ||
    text.includes("micro-view") ||
    text.includes("microview") ||
    text.includes("micro")
  ) {
    field = "micro_view";

    // ── PRIORITY 4: macro_view — only when "macro" is clearly the target
  } else if (
    text.includes("macro_view") ||
    text.includes("macro view") ||
    text.includes("macro-view") ||
    text.includes("macro")
  ) {
    field = "macro_view";

  } else if (text.includes("nano")) {
    field = "nano_view";

  } else if (text.includes("description") || text.includes("desc")) {
    field = "description";

    // ── PRIORITY 5: remaining marketplace synonyms (course, link)
  } else if (
    text.includes("course") ||
    text.includes("link")
  ) {
    field = "marketplace";
  }

  if (!field) return null;

  return {
    stepId,
    field,
    targetStep,
    instruction: prompt,
    marketplaceSection,
    marketplaceCategory,
  };
}

function RotateCwIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

export default function Dashboard({ profile, pathData, userInput, initialCurrent = "", onPathGenerated, onStepClick, onGenerationStart, onProfileUpdated, selectedAltIdx, setSelectedAltIdx, onStepPatched }) {
  const [current, setCurrent] = useState(userInput?.current || initialCurrent);
  const [goal, setGoal] = useState(userInput?.goal || "");
  const [selectedSegmentKey, setSelectedSegmentKey] = useState("academic");
  const [selectedSubSegmentKey, setSelectedSubSegmentKey] = useState("school");
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(null);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [refineResult, setRefineResult] = useState(null);
  const [savingPath, setSavingPath] = useState(false);
  const [regeneratingAltIdx, setRegeneratingAltIdx] = useState(null);
  const [regeneratingStepId, setRegeneratingStepId] = useState(null);
  const [stepRegenError, setStepRegenError] = useState("");

  // Regenerate a single step's description + all views (macro/micro/nano)
  const handleRegenerateStep = async (e, step) => {
    e.stopPropagation();
    if (regeneratingStepId !== null) return;
    setRegeneratingStepId(step.id);
    setStepRegenError("");
    try {
      // 1) Patch main step description first
      const descCtrl = new AbortController();
      const descTimeout = setTimeout(() => descCtrl.abort(), 25000);

      const res = await fetch(`${API}/api/path/patch-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: descCtrl.signal,
        body: JSON.stringify({
          step_id: step.id,
          field: "description",
          instruction: `Regenerate a fresh, detailed, accurate description for this step. Keep it relevant to the student's current position and target goal.`,
          current_step: step,
          current_position: userInput?.current || "",
          target_goal: userInput?.goal || "",
          profile: profile || {},
        }),
      });
      clearTimeout(descTimeout);

      if (!res.ok) throw new Error("Failed to regenerate step description");
      const result = await res.json();
      let updatedStep = { ...step };

      if (result?.updated_step) {
        updatedStep = { ...updatedStep, ...result.updated_step };
        if (onStepPatched) onStepPatched(step.id, "__step__", { ...updatedStep });
      }

      // Reset button spinner immediately so user sees instant completion
      setRegeneratingStepId(null);

      // 2) Patch views (macro_view, micro_view, nano_view) in background
      const viewFields = ["macro_view", "micro_view", "nano_view"];
      const viewPromises = viewFields.map(async (field) => {
        try {
          const viewCtrl = new AbortController();
          const viewTimeout = setTimeout(() => viewCtrl.abort(), 18000);

          const viewRes = await fetch(`${API}/api/path/patch-step`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: viewCtrl.signal,
            body: JSON.stringify({
              step_id: step.id,
              field,
              instruction: `Regenerate a fresh, rich ${field.replace("_view", "")} view description for this step. Make it specific and actionable.`,
              current_step: updatedStep,
              current_position: userInput?.current || "",
              target_goal: userInput?.goal || "",
              profile: profile || {},
            }),
          });
          clearTimeout(viewTimeout);

          if (viewRes.ok) {
            const viewResult = await viewRes.json();
            return viewResult?.updated_step || null;
          }
        } catch (vErr) {
          console.warn(`[Step Patch] ${field} view patch skipped or timed out:`, vErr.message);
        }
        return null;
      });

      const viewResults = await Promise.allSettled(viewPromises);
      viewResults.forEach((r) => {
        if (r.status === "fulfilled" && r.value) {
          updatedStep = { ...updatedStep, ...r.value };
        }
      });

      if (onStepPatched) onStepPatched(step.id, "__step__", { ...updatedStep });

    } catch (err) {
      console.error("[Regenerate Step Error]:", err);
      setStepRegenError(`Step ${step.id}: ${err.message || "Regeneration failed"}`);
    } finally {
      setRegeneratingStepId(null);
    }
  };


  const activePath = pathData?.alternatives ? pathData.alternatives[selectedAltIdx] : pathData;
 const steps = activePath?.steps || [];
  const selectedSegment = CONTENT_SEGMENTS.find(segment => segment.key === selectedSegmentKey) || CONTENT_SEGMENTS[0];
  const selectedSubSegment = selectedSegment.subSegments.find(sub => sub.key === selectedSubSegmentKey) || selectedSegment.subSegments[0];
  const selectedFocus = `${selectedSegment.prompt} - ${selectedSubSegment.label}`;

  const handleSavePath = async () => {
    if (!activePath) {
      console.warn("[Naavi Dashboard] Save Path called but no active path exists.");
      return;
    }
    console.log("[Naavi Dashboard] Saving path to review. ActivePath details:", {
      title: activePath.path_title,
      duration: activePath.total_duration,
      readiness: activePath.readiness_score,
      stepsCount: activePath.steps?.length
    });
    setSavingPath(true);
    try {
      const res = await fetch(`${API}/api/paths/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_position: userInput.current,
          target_goal: userInput.goal,
          profile: generationProfile,
          roadmap_data: activePath,
          generation_id: activePath.generation_id || null,
          alternative_name: activePath.option_name || null
        })
      });
      if (!res.ok) throw new Error("Failed to save path");
      const data = await res.json();
      console.log("[Naavi Dashboard] Save Path API success response:", data);

      // Update the pathData with the new db_id and status
      const updatedActivePath = {
        ...activePath,
        db_id: data.db_id,
        status: "under_admin_review"
      };

      let mergedData;
      if (pathData?.alternatives) {
        const newAlternatives = [...pathData.alternatives];
        newAlternatives[selectedAltIdx] = updatedActivePath;
        mergedData = {
          ...pathData,
          alternatives: newAlternatives
        };
      } else {
        mergedData = updatedActivePath;
      }

      console.log("[Naavi Dashboard] Updating path state with saved database reference.");
      onPathGenerated(mergedData, userInput);
    } catch (err) {
      console.error("[Naavi Dashboard] Save Path error:", err);
      alert(err.message || "Failed to save pathway");
    } finally {
      setSavingPath(false);
    }
  };

  const handleDeletePath = () => {
    console.log("[Naavi Dashboard] Delete Path triggered. Target path option:", activePath?.option_name, "Index:", selectedAltIdx);
    const confirmDelete = window.confirm(`Are you sure you want to delete the "${activePath?.option_name || 'this'}" pathway option?`);
    if (!confirmDelete) {
      console.log("[Naavi Dashboard] Delete canceled by user.");
      return;
    }

    if (pathData?.alternatives) {
      const remainingAlts = pathData.alternatives.filter((_, idx) => idx !== selectedAltIdx);
      console.log(`[Naavi Dashboard] Alternatives deleted. Remaining alternative options:`, remainingAlts.map(a => a.option_name));
      if (remainingAlts.length > 0) {
        setSelectedAltIdx(0);
        setActiveStep(null);
        onPathGenerated({
          ...pathData,
          alternatives: remainingAlts
        }, userInput);
      } else {
        console.log("[Naavi Dashboard] No remaining alternatives. Clearing path completely.");
        onPathGenerated(null, null);
      }
    } else {
      console.log("[Naavi Dashboard] No alternatives wrapper. Clearing path completely.");
      onPathGenerated(null, null);
    }
  };

  useEffect(() => {
    if (userInput?.current) {
      setCurrent(userInput.current);
    } else {
      setCurrent(initialCurrent);
    }
  }, [userInput?.current, initialCurrent]);

  useEffect(() => {
    if (userInput?.goal) {
      setGoal(userInput.goal);
    } else {
      setGoal("");
    }
  }, [userInput?.goal]);

  const goalAnalysis = analyzeGoalParts(goal);
  const profileDegreeType = profile?.degreeType || profile?.degree_type || "";
  const selectedDegreeType = goalAnalysis.degreeType || profileDegreeType;
  const effectiveMissing = goalAnalysis.missing.filter(m => !(m === "degreeType" && selectedDegreeType));
  const generationProfile = {
    ...(profile || {}),
    degreeType: selectedDegreeType,
    targetProgram: goalAnalysis.program || "",
    targetUniversity: goalAnalysis.university || "",
    targetCountry: goalAnalysis.country || profile?.country || "",
  };
  const refineAnalysis = analyzeRefinement(refinePrompt);
  const isAcademicSegment = selectedSegmentKey === "academic";
  const isGoalValid = goal.trim() !== "" && (!isAcademicSegment || effectiveMissing.length === 0);
  const formattedMissing = effectiveMissing.map(m => m === "degreeType" ? "degree type" : m);
  const missingFieldsText = formattedMissing.join(", ").replace(/, ([^,]*)$/, ' and $1');
  const goalPlaceholder = isAcademicSegment
    ? "Degree Type • Program • University • Country"
    : selectedSegmentKey === "practical"
      ? "e.g. Learn Python for data analysis, or complete a UX internship"
      : selectedSegmentKey === "jobs"
        ? "e.g. Become a Data Scientist, Product Manager, or Marketing Analyst"
        : "e.g. Manage exam stress, decide next steps, or get immediate guidance";

  // Progress follows backend stages plus bounded heartbeats during long model calls.
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [workflowStatus, setWorkflowStatus] = useState({
    agent1: "pending",
    agent2: "pending",
    agent3: "pending",
    agent4: "pending",
    ready: "pending",
  });

  function applyStatusEvent(data) {
    console.log("[Naavi Dashboard] Status Event - Msg:", data.message, "Progress:", data.progress, "Statuses:", data.statuses);
    if (data.statuses) setWorkflowStatus(data.statuses);
    if (typeof data.progress === "number") setLoaderProgress(data.progress);
    if (data.message) setLoadMsg(data.message);
  }

  function handleStreamEvent(eventType, eventData, resultRef) {
    console.log(`[Naavi Dashboard] Stream Event - Type: "${eventType}"`);
    if (eventType === "status") {
      applyStatusEvent(eventData);
      return;
    }
    if (eventType === "result") {
      console.log("[Naavi Dashboard] Stream Event Result Payload received:", eventData);
      resultRef.current = eventData;
      return;
    }
    if (eventType === "error") {
      console.error("[Naavi Dashboard] Stream Event error received:", eventData);
      throw new Error(eventData.message || "Path generation failed");
    }
  }

  async function readPathStream(response) {
    if (!response.body) throw new Error("Backend did not return a progress stream");
    console.log("[Naavi Dashboard] Reading event-stream response stream...");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const resultRef = { current: null };
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        console.log("[Naavi Dashboard] Event stream reader complete.");
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      // SSE may use LF or CRLF depending on the server/proxy.
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || "";

      for (const rawEvent of events) {
        const lines = rawEvent.split(/\r?\n/);
        const eventType = lines.find(line => line.startsWith("event:"))?.replace("event:", "").trim() || "message";
        const dataLines = lines.filter(line => line.startsWith("data:"));
        if (!dataLines.length) continue;

        const eventData = JSON.parse(dataLines.map(line => line.slice(5).trimStart()).join("\n"));
        handleStreamEvent(eventType, eventData, resultRef);
      }
    }

    if (buffer.trim()) {
      const lines = buffer.split(/\r?\n/);
      const eventType = lines.find(line => line.startsWith("event:"))?.replace("event:", "").trim() || "message";
      const dataLines = lines.filter(line => line.startsWith("data:"));
      if (dataLines.length) {
        const eventData = JSON.parse(dataLines.map(line => line.slice(5).trimStart()).join("\n"));
        handleStreamEvent(eventType, eventData, resultRef);
      }
    }

    if (!resultRef.current) {
      console.error("[Naavi Dashboard] Stream ended, but no result payload was extracted from stream.");
      throw new Error("Path generation finished without returning a roadmap");
    }
    return resultRef.current;
  }

  async function generate(customPrompt = "", isTabRegen = false) {
    const promptText = typeof customPrompt === "string" ? customPrompt : "";
    if (!current.trim() || !isGoalValid) {
      console.warn("[Naavi Dashboard] Cannot generate pathway. Inputs invalid or empty:", { current, goal, isGoalValid });
      return;
    }

    const isRegen = isTabRegen && pathData !== null && pathData !== undefined;
    console.log("[Naavi Dashboard] generate() invoked:", {
      current,
      goal,
      isRegen,
      isTabRegen,
      refinePrompt: promptText || "(none)"
    });

    // SMART ROUTING: Check if prompt is targeting a specific step
    const surgicalInfo = parseSurgicalRefinement(promptText, steps);
    if (surgicalInfo) {
      console.log("[Naavi Dashboard] Smart Router: Detected surgical step update request:", surgicalInfo);
      setLoading(true);
      setError("");
      setRefineResult(null);
      setLoadMsg(`Updating Step ${surgicalInfo.stepId} ${surgicalInfo.field} with AI...`);

      try {
        const payload = {
          step_id: surgicalInfo.stepId,
          field: surgicalInfo.field,
          instruction: surgicalInfo.instruction,
          current_step: surgicalInfo.targetStep,
          current_position: current,
          target_goal: goal,
          profile: generationProfile
        };
        if (surgicalInfo.field === "marketplace") {
          payload.marketplace_section = surgicalInfo.marketplaceSection;
          payload.marketplace_category = surgicalInfo.marketplaceCategory;
        }

        console.log("[Naavi Dashboard] Routing to surgical Step Patch Agent:", `${API}/api/path/patch-step`, payload);
        const patchRes = await fetch(`${API}/api/path/patch-step`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!patchRes.ok) {
          const errData = await patchRes.json().catch(() => ({}));
          throw new Error(errData.detail || "Step patch refinement failed");
        }

        const patchResult = await patchRes.json();
        console.log("[Naavi Dashboard] Surgical Step Patch success:", patchResult);

        // Merge the surgically updated step back into local steps
        const updatedSteps = steps.map(s =>
          s.id === surgicalInfo.stepId
            ? (patchResult.updated_step || { ...s, [surgicalInfo.field]: patchResult.updated_value })
            : s
        );

        let newPathData;
        if (pathData?.alternatives) {
          const newAlternatives = [...pathData.alternatives];
          newAlternatives[selectedAltIdx] = {
            ...activePath,
            steps: updatedSteps
          };
          newPathData = {
            ...pathData,
            alternatives: newAlternatives
          };
        } else {
          newPathData = {
            ...pathData,
            steps: updatedSteps
          };
        }

        onPathGenerated(newPathData, userInput);
        const sectionLabels = {
          macro_free: "Macro Marketplace",
          micro_structured: "Micro Marketplace",
          nano_expert: "Nano Marketplace",
        };
        const categoryLabel = (patchResult.marketplace_category || surgicalInfo.marketplaceCategory || "marketplace")
          .replace(/^./, character => character.toUpperCase());
        const sectionLabel = sectionLabels[patchResult.marketplace_section || surgicalInfo.marketplaceSection];
        setRefineResult({
          type: "success",
          title: `Step ${surgicalInfo.stepId} updated successfully`,
          message: surgicalInfo.field === "marketplace"
            ? `${sectionLabel} → ${categoryLabel} was updated. All other Marketplace categories, views, and pathway steps were preserved.`
            : `Only the ${surgicalInfo.field.replaceAll("_", " ")} field was updated. All other pathway content was preserved.`,
        });
        setRefinePrompt("");
        setLoading(false);
        return;
      } catch (err) {
        console.error("[Naavi Dashboard] Surgical Step Patch error:", err);
        setError(err.message || "Surgical step refinement failed. Please try again.");
        setRefineResult({
          type: "error",
          title: "Refinement was not applied",
          message: err.message || "The requested update failed. Please try again.",
        });
        setLoading(false);
        return;
      }
    }

    if (onGenerationStart) {
      onGenerationStart({ current, goal }, isRegen);
    }
    setLoading(true);
    setError("");

    if (isRegen) {
      setRegeneratingAltIdx(selectedAltIdx);
    } else {
      setRegeneratingAltIdx(null);
    }

    applyStatusEvent({
      statuses: {
        agent1: "active",
        agent2: "pending",
        agent3: "pending",
        agent4: "pending",
        ready: "pending",
      },
      progress: 20,
      message: promptText ? "Refining pathway..." : LOADING_MSGS[0],
    });

    try {
      const payload = {
        current_position: current,
        target_goal: goal,
        profile: generationProfile,
        degree_type: selectedDegreeType,
        refine_prompt: promptText || null,
        existing_roadmap: isRegen && promptText ? activePath : null,
        focus: isRegen && activePath ? activePath.option_name : selectedFocus,
        content_category: selectedSegmentKey,
        sub_segment: selectedSubSegmentKey
      };
      console.log("[Naavi Dashboard] Calling Stream API endpoint:", `${API}/api/path/stream`, "Payload:", payload);

      const streamRes = await fetch(`${API}/api/path/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!streamRes.ok) {
        const errorData = await streamRes.json().catch(() => ({}));
        console.error("[Naavi Dashboard] Stream API responded with error:", errorData);
        throw new Error(errorData.detail || "Path generation failed");
      }

      const finalData = await readPathStream(streamRes);
      console.log("[Naavi Dashboard] Successfully parsed final roadmap data from stream:", finalData);
      setLoading(false);
      setRegeneratingAltIdx(null);

      let mergedData = finalData;
      if (finalData.alternatives && finalData.alternatives.length === 1) {
        if (pathData?.alternatives) {
          console.log("[Naavi Dashboard] Merging single alternative replacement back into alternatives array at index:", selectedAltIdx);
          const newAlternatives = [...pathData.alternatives];
          newAlternatives[selectedAltIdx] = {
            ...finalData.alternatives[0],
            option_name: activePath?.option_name || finalData.alternatives[0].option_name
          };
          mergedData = {
            ...pathData,
            alternatives: newAlternatives
          };
        } else {
          mergedData = finalData.alternatives[0];
        }
      } else {
        if (finalData.alternatives && finalData.alternatives.length > 1) {
          console.log("[Naavi Dashboard] Sorting alternatives by accuracy score descending...");
          finalData.alternatives.sort((a, b) => (b.accuracy_score || 0) - (a.accuracy_score || 0));
        }
        console.log("[Naavi Dashboard] Full set of alternatives generated. Resetting selected index to 0.");
        setSelectedAltIdx(0);
      }

      onPathGenerated(mergedData, { current, goal });
      if (promptText) {
        setRefinePrompt("");
      }

    } catch (e) {
      console.error("[Naavi Dashboard] Generation Exception:", e);
      setLoading(false);
      setRegeneratingAltIdx(null);
      setError(e.message.includes("fetch")
        ? "Cannot connect to backend. Run: uvicorn main:app --reload --port 8001"
        : e.message);
    }
  }

  return (
    <div className={`db-root ${pathData ? "has-path" : ""}`}>

      {/* ── LEFT PANEL ── */}
      <div className="db-left">
        <div className="db-left-scroll">

          {/* Route input card */}
          <div className="db-input-card">
            <div className="db-input-label-row">
              <div className="db-input-label-icon blue-dot" />
              <span className="db-input-kicker">Content segment</span>
            </div>
            <div className="db-segment-grid" role="tablist" aria-label="Content segment">
              {CONTENT_SEGMENTS.map(segment => (
                <button
                  key={segment.key}
                  type="button"
                  className={`db-segment-btn ${selectedSegmentKey === segment.key ? "active" : ""}`}
                  onClick={() => {
                    setSelectedSegmentKey(segment.key);
                    setSelectedSubSegmentKey(segment.subSegments[0].key);
                  }}
                  disabled={loading}
                >
                  {segment.label}
                </button>
              ))}
            </div>
            <select
              className="db-segment-select"
              value={selectedSubSegmentKey}
              onChange={event => setSelectedSubSegmentKey(event.target.value)}
              disabled={loading}
              aria-label="Content sub-segment"
            >
              {selectedSegment.subSegments.map(sub => (
                <option key={sub.key} value={sub.key}>{sub.label}</option>
              ))}
            </select>

            <div className="db-input-label-row">
              <div className="db-input-label-icon green-dot" />
              <span className="db-input-kicker">Current position</span>
            </div>
            <textarea
              className="db-textarea"
              rows={3}
              placeholder="e.g. Grade 12, IGCSE Science, Hyderabad"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              disabled={loading}
            />

            <div className="db-route-dots">
              <span /><span /><span />
            </div>

            <div className="db-input-label-row">
              <div className="db-input-label-icon red-dot" />
              <span className="db-input-kicker">Future goal</span>
            </div>
            <textarea
              className="db-textarea"
              rows={3}
              placeholder={goalPlaceholder}
              value={goal}
              onChange={e => {
                let val = e.target.value;
                // Replace dot with middle dot, avoiding decimals
                let formatted = val.replace(/(?<!\d)\.(?!\d)/g, ' • ');
                // Avoid double middle dots
                formatted = formatted.replace(/\s*•\s*•\s*/g, ' • ');
                setGoal(formatted);
              }}
              disabled={loading}
              onKeyDown={e => e.key === "Enter" && e.ctrlKey && isGoalValid && generate()}
            />

            {/* Naavi Goal Validation Widget */}
            <div className={`db-agent-validation ${isGoalValid ? 'valid' : goal.trim() ? 'invalid' : 'empty'}`}>
              <div className="db-agent-avatar">
                <div className="db-agent-pulse-ring" />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M18 8a3 3 0 0 0-3-3h-1.5M6 8a3 3 0 0 1 3-3h1.5" />
                  <rect x="4" y="8" width="16" height="12" rx="2" />
                  <circle cx="9" cy="13" r="1.2" fill="currentColor" />
                  <circle cx="15" cy="13" r="1.2" fill="currentColor" />
                  <path d="M9 17h6" />
                </svg>
              </div>
              <div className="db-agent-body">
                <span className="db-agent-title">Naavi Agent</span>
                <p className="db-agent-text">
                  {goal.trim() === "" ? (
                    isAcademicSegment
                      ? <>Please enter your goal using the format: <strong>Degree Type • Program • University • Country</strong></>
                      : <>Please enter the specific outcome you want for <strong>{selectedSubSegment.label}</strong>.</>
                  ) : isAcademicSegment && effectiveMissing.length > 0 ? (
                    <>You missed the <strong>{missingFieldsText}</strong>. Please include {effectiveMissing.length === 1 ? 'it' : 'them'} (e.g. {
                      effectiveMissing.includes("degreeType") ? "Bachelor's" : ""
                    }{
                        effectiveMissing.includes("degreeType") && effectiveMissing.includes("program") ? " • " : ""
                      }{
                        effectiveMissing.includes("program") ? "Computer Science" : ""
                      }{
                        (effectiveMissing.includes("degreeType") || effectiveMissing.includes("program")) && effectiveMissing.includes("university") ? " • " : ""
                      }{
                        effectiveMissing.includes("university") ? "Yale University" : ""
                      }{
                        (effectiveMissing.includes("degreeType") || effectiveMissing.includes("program") || effectiveMissing.includes("university")) && effectiveMissing.includes("country") ? " • " : ""
                      }{
                        effectiveMissing.includes("country") ? "USA" : ""
                      }).</>
                  ) : (
                    <>Segment is set to <strong>{selectedSegment.label}</strong>. Click <strong>Find My Path</strong> to continue.</>
                  )}
                </p>
              </div>
            </div>

            {error && <div className="db-error">{error}</div>}

            <button
              className="db-generate-btn"
              onClick={() => generate("", false)}
              disabled={loading || !current.trim() || !isGoalValid}
            >
              {loading ? (
                <span className="db-loading-inner">
                  <span className="dot-pulse"><span /><span /><span /></span>
                  {loadMsg}
                </span>
              ) : (
                <><IconNavigation size={16} /> Find My Path</>
              )}
            </button>
          </div>

          {/* Refine with AI Agent Card */}
          {pathData && (
            <div className="db-refine-card card">
              <div className="db-refine-head">
                <div className="db-refine-head-left">
                  <div className="db-agent-avatar small active" style={{ animation: "none", width: 22, height: 22 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                      <rect x="4" y="8" width="16" height="12" rx="2" />
                      <path d="M9 17h6" />
                    </svg>
                  </div>
                  <span className="db-refine-title">Refine with Naavi Agent</span>
                </div>
              </div>
              <textarea
                className="db-textarea"
                rows={3}
                placeholder="Describe required changes..."
                value={refinePrompt}
                onChange={e => {
                  setRefinePrompt(e.target.value);
                  if (refineResult) setRefineResult(null);
                }}
                disabled={loading}
              />
              {refinePrompt.trim() !== "" && (
                <div className={`db-agent-validation ${refineAnalysis.isValid ? 'valid' : 'invalid'}`} style={{ marginTop: 12, marginBottom: 4 }}>
                  <div className="db-agent-avatar">
                    <div className="db-agent-pulse-ring" />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                      <rect x="4" y="8" width="16" height="12" rx="2" />
                      <path d="M9 17h6" />
                    </svg>
                  </div>
                  <div className="db-agent-body">
                    <span className="db-agent-title">Naavi Agent</span>
                    <p className="db-agent-text">
                      {refineAnalysis.message}
                    </p>
                  </div>
                </div>
              )}
              <button
                className="db-refine-btn"
                onClick={() => generate(refinePrompt, true)}
                disabled={loading || !refineAnalysis.isValid}
              >
                <IconNavigation size={14} /> {loading ? "Applying update..." : "Refine Pathway"}
              </button>
              {refineResult && (
                <div className={`db-refine-result ${refineResult.type}`} role="status" aria-live="polite">
                  <span className="db-refine-result-icon">
                    {refineResult.type === "success" ? <IconCheck size={15} /> : "!"}
                  </span>
                  <div>
                    <strong>{refineResult.title}</strong>
                    <p>{refineResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}



        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="db-right">
        {!pathData && !loading ? (
          <div className="db-empty-state">
            <img
              src="/career_route.png"
              alt="Career Route Navigation Map"
              className="db-empty-illustration"
            />
            <h3 className="db-empty-title">Your path will appear here</h3>
            <p className="db-empty-sub">Enter your current situation and future goal on the left, then click Find My Path</p>
          </div>
        ) : (
          <div className="db-path-view">
            {/* Alternatives selector tabs */}
            <div className="db-alt-tabs">
              {(pathData?.alternatives || CATEGORY_TABS[selectedSegmentKey] || CONTENT_SEGMENTS.map(segment => segment.label)).map((alt, idx) => {
                const name = typeof alt === "string" ? alt : (alt.option_name || `Option ${idx + 1}`);
                return (
                  <button
                    key={idx}
                    className={`db-alt-tab-btn ${selectedAltIdx === idx ? 'active' : ''}`}
                    onClick={() => { setSelectedAltIdx(idx); setActiveStep(null); }}
                  >
                    <span className="tab-indicator" />
                    {name}
                  </button>
                );
              })}
            </div>

            {/* Route header */}
            <div className="db-route-header">
              <div className="db-route-header-left">
                <div className="db-route-from-to">
                  <div className="db-rt-row">
                    <span className="db-rt-dot green" />
                    <div>
                      <div className="db-rt-label">From</div>
                      <div className="db-rt-val">{userInput?.current || current}</div>
                    </div>
                  </div>
                  <div className="db-rt-vline" />
                  <div className="db-rt-row">
                    <span className="db-rt-dot red" />
                    <div>
                      <div className="db-rt-label">To</div>
                      <div className="db-rt-val">{userInput?.goal || goal}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="db-route-header-right">
                <div className="db-route-stat">
                  <span className="db-route-stat-val green-text">{activePath?.readiness_score || "--"}</span>
                  <span className="db-route-stat-lbl">Readiness</span>
                </div>
                <div className="db-route-stat">
                  <span className="db-route-stat-val">{activePath?.total_duration || "--"}</span>
                  <span className="db-route-stat-lbl">Duration</span>
                </div>
                <div className="db-route-stat">
                  <span className="db-route-stat-val">{steps?.length || 0}</span>
                  <span className="db-route-stat-lbl">Steps</span>
                </div>
              </div>
            </div>

            {/* Content Space */}
            {((loading && !pathData) || (loading && regeneratingAltIdx === selectedAltIdx)) ? (
              <div className="db-loading-state" style={{ padding: 0, background: 'transparent', boxShadow: 'none', minHeight: 'auto', height: 'auto' }}>
                <div className="loader-container">
                  <div className="loader-header">
                    <div className="loader-radar-wrapper">
                      <div className="loader-radar" />
                      <span className="loader-brain-icon"><IconBrain size={28} /></span>
                    </div>
                    <h3>Generating Your Career Path</h3>
                    <p>{loadMsg}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="loader-progress-bar-wrapper">
                    <div className="loader-progress-bar" style={{ width: `${loaderProgress}%` }} />
                    <span className="loader-progress-text">{loaderProgress}%</span>
                  </div>

                  {/* Agent workflow */}
                  <div className="loader-pipeline">
                    {WORKFLOW_STEPS.map((step, index) => {
                      const status = workflowStatus[step.key];
                      return (
                        <div key={step.key} className={`loader-pipeline-step ${status}`}>
                          <div className="step-indicator">
                            {status === "completed" ? <IconCheck size={14} /> : status === "active" ? <div className="spinner-inner" /> : index + 1}
                          </div>
                          <div className="step-content">
                            <span className="step-title">{step.title}</span>
                            <span className="step-desc">{step.message}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {loaderProgress === 100 && (
                    <div className="loader-success">
                      <div className="loader-success-icon"><IconCheck size={18} /></div>
                      <div>
                        <strong>Path Generated Successfully</strong>
                        <span>Your personalized roadmap is ready to explore.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              activePath && (
                <>
                  {/* Pathway Overall Name & Description Card */}
                  {(activePath.path_title || activePath.path_description) && (
                    <div className="db-path-intro-card">
                      <div className="db-path-intro-header">
                        <span className="db-path-intro-icon-wrapper">
                          <IconRoute size={20} />
                        </span>
                        <h2 className="db-path-title">{activePath.path_title || `Pathway to ${userInput?.goal || goal}`}</h2>
                      </div>
                      {activePath.path_description && (
                        <p className="db-path-desc">{activePath.path_description}</p>
                      )}
                    </div>
                  )}

                  {/* ── PATH ACCURACY SCORE CARD ── */}
                  {(() => {
                    const hasAccuracy = activePath.accuracy_score !== undefined;
                    const score = hasAccuracy ? activePath.accuracy_score : activePath.readiness_score;
                    const label = activePath.accuracy_label || activePath.readiness_label || "Needs Verification";
                    const breakdown = activePath.accuracy_breakdown || {
                      structural_score: Math.round(score * 0.30),
                      content_score: Math.round(score * 0.40),
                      market_score: Math.round(score * 0.30)
                    };

                    return (
                      <div className="db-accuracy-card">
                        <div className="db-accuracy-card-header">
                          <span className="db-accuracy-card-title">Path Accuracy Model</span>
                          <span className={`db-accuracy-badge ${label.toLowerCase().replace(/\s+/g, '-')}`}>
                            {label} ({score}/100)
                          </span>
                        </div>
                        <div className="db-accuracy-meter">
                          <div className="db-accuracy-meter-fill" style={{ width: `${score}%` }} />
                        </div>

                        <div className="db-accuracy-breakdown">
                          <div className="db-breakdown-item">
                            <span className="db-breakdown-name">No. of Steps (30%)</span>
                            <div className="db-breakdown-bar-bg">
                              <div className="db-breakdown-bar-fill structural" style={{ width: `${breakdown.structural_score}%` }} />
                            </div>
                            <span className="db-breakdown-val">{breakdown.structural_score}/100</span>
                          </div>

                          <div className="db-breakdown-item">
                            <span className="db-breakdown-name">Info Inside Steps (40%)</span>
                            <div className="db-breakdown-bar-bg">
                              <div className="db-breakdown-bar-fill content" style={{ width: `${breakdown.content_score}%` }} />
                            </div>
                            <span className="db-breakdown-val">{breakdown.content_score}/100</span>
                          </div>

                          <div className="db-breakdown-item">
                            <span className="db-breakdown-name">Marketplace Inside Steps (30%)</span>
                            <div className="db-breakdown-bar-bg">
                              <div className="db-breakdown-bar-fill profile" style={{ width: `${breakdown.market_score}%` }} />
                            </div>
                            <span className="db-breakdown-val">{breakdown.market_score}/100</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Steps — Google Maps direction style */}
                  <div className="db-steps-label">
                    {steps.length} steps · click any step to explore
                  </div>

                  <div className="db-steps-list">
                    {steps.map((step, i) => {
                      const c = STEP_COLORS[i % STEP_COLORS.length];
                      const isActive = activeStep?.id === step.id;
                      return (
                        <div key={step.id} className="db-step-row">
                          {/* Connector line */}
                          <div className="db-step-spine">
                            <div className="db-step-node" style={{ background: c.border, boxShadow: isActive ? `0 0 0 5px ${c.bg}` : "none" }}>
                              {isActive ? <IconCheck size={13} /> : <span>{step.id}</span>}
                            </div>
                            {i < steps.length - 1 && (
                              <div className="db-step-spine-line" style={{ borderColor: c.border + "40" }} />
                            )}
                          </div>

                          {/* Step card */}
                          <div
                            className={`db-step-card ${isActive ? "db-step-card--active" : ""}`}
                            style={isActive ? { borderColor: c.border, background: c.bg + "60" } : {}}
                            onClick={() => setActiveStep(isActive ? null : step)}
                          >
                            <div className="db-step-card-top">
                              <span className="db-step-title">{step.title}</span>
                              <span className="db-step-dur" style={{ color: c.text, background: c.bg }}>{step.duration}</span>
                            </div>
                            <p className="db-step-desc">{step.description}</p>

                            {isActive && (
                              <div className="db-step-expanded">
                                {stepRegenError && step.id === Number(stepRegenError.split(":")[0]?.replace("Step ","")) && (
                                  <div style={{ fontSize: 12, color: "#C05A3A", marginBottom: 8 }}>{stepRegenError}</div>
                                )}
                                <div className="db-step-actions">
                                  <button className="db-step-explore-btn"
                                    style={{ background: c.border }}
                                    onClick={e => { e.stopPropagation(); onStepClick(step); }}>
                                    Explore step <IconArrowRight size={14} />
                                  </button>
                                  <button
                                    className="db-step-regen-btn"
                                    onClick={e => handleRegenerateStep(e, step)}
                                    disabled={regeneratingStepId !== null}
                                    title="Regenerate this step's content"
                                  >
                                    <RotateCwIcon size={13} />
                                    {String(regeneratingStepId) === String(step.id) ? "Regenerating…" : "Regenerate"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Save/Delete pathway button at the bottom right */}
                  <div className="db-path-actions">
                    {!activePath.db_id && (
                      <button
                        className="db-regenerate-btn"
                        onClick={() => generate("", true)}
                        disabled={loading}
                      >
                        <RotateCwIcon size={14} /> Regenerate
                      </button>
                    )}

                    <button
                      className="db-delete-path-btn"
                      onClick={handleDeletePath}
                      disabled={loading || savingPath}
                    >
                      Delete Pathway
                    </button>

                    {activePath.db_id ? (
                      <button className="db-save-path-btn saved" disabled>
                        <IconCheck size={14} /> Saved to Review
                      </button>
                    ) : (
                      <button
                        className="db-save-path-btn"
                        onClick={handleSavePath}
                        disabled={savingPath}
                      >
                        {savingPath ? "Saving..." : "Save Pathway"}
                      </button>
                    )}
                  </div>
                </>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

//worked 
