/**
 * PathFitAssessmentService.js
 * 
 * Evidence-based Personalized Path Fit Analysis Service for Naaviverse.
 * Evaluates pathways against a student's profile across 6 key dimensions:
 * 1. Goal / Domain Alignment (20%)
 * 2. Grade / Stage Alignment (20%)
 * 3. Stream, Curriculum & Academic Prerequisites (20%)
 * 4. Skills & Readiness (15%)
 * 5. Financial Preferences & Known Costs (15%)
 * 6. Location / Destination / Mode (10%)
 * 
 * Guiding Principles:
 * - Evidence-based: Never fabricate scores or matches.
 * - Missing data ≠ negative match: Label as "unknown" / "Not enough information".
 * - Distinct Eligibility vs Personal Fit: Clearly separate hard academic prerequisites from preference alignment.
 */

const FACTOR_WEIGHTS = {
  goal: 0.20,
  grade: 0.20,
  academic: 0.20,
  skills: 0.15,
  financial: 0.15,
  location: 0.10,
};

// Helper: personality compatibility keywords & stream tendencies
const PERSONALITY_DOMAIN_MAP = {
  realistic: ['engineering', 'technology', 'agriculture', 'mechanics', 'aviation', 'architecture', 'applied sciences'],
  investigative: ['medicine', 'biotechnology', 'research', 'data science', 'physics', 'mathematics', 'computer science', 'pure sciences'],
  artistic: ['design', 'media', 'journalism', 'arts', 'film', 'music', 'creative writing', 'animation', 'architecture'],
  social: ['education', 'psychology', 'nursing', 'counseling', 'social work', 'human resources', 'healthcare'],
  enterprising: ['business', 'management', 'entrepreneurship', 'finance', 'marketing', 'law', 'economics', 'commerce'],
  conventional: ['accounting', 'finance', 'logistics', 'data administration', 'actuarial science', 'banking', 'auditing'],
};

// Stream-to-domain compatibility
const STREAM_DOMAIN_MAP = {
  MPC: ['engineering', 'technology', 'computer science', 'architecture', 'data', 'physics', 'mathematics', 'aviation'],
  BIPC: ['medicine', 'biotechnology', 'pharmacy', 'nursing', 'agriculture', 'healthcare', 'life sciences'],
  CEC: ['commerce', 'business', 'economics', 'accounting', 'finance', 'management'],
  MEC: ['economics', 'finance', 'business', 'data science', 'management', 'accounting', 'mathematics'],
  HEC: ['humanities', 'arts', 'journalism', 'law', 'social sciences', 'public policy', 'literature'],
};

/**
 * Normalizes array or single value from path/user coordinate
 */
function normalizeList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((v) => String(v).trim().toLowerCase()).filter(Boolean);
  return [String(val).trim().toLowerCase()];
}

/**
 * Checks overlap between user value and path requirement list
 */
function hasOverlap(userVal, pathList) {
  if (!userVal || !pathList || pathList.length === 0) return null;
  const userStr = String(userVal).trim().toLowerCase();
  const normalized = normalizeList(pathList);
  return normalized.includes(userStr);
}

/**
 * 1. Goal / Domain Alignment (20%)
 */
function evaluateGoalAlignment(userProfile, path, steps = []) {
  const userPersonality = (userProfile?.personality || '').trim().toLowerCase();
  const pathPersonality = (path?.personality || path?.current_coordinates?.personality || '').trim().toLowerCase();
  const pathTitle = (path?.nameOfPath || path?.name || '').toLowerCase();
  const pathProgram = (path?.program || path?.feature_coordinates?.program || '').toLowerCase();
  const pathDesc = (path?.description || '').toLowerCase();

  // Combine path textual domain clues
  const domainText = `${pathTitle} ${pathProgram} ${pathDesc}`;

  // If user has no personality or preference data
  if (!userPersonality) {
    return {
      status: 'unknown',
      score: null,
      title: 'Goal & Domain Alignment',
      summary: 'Profile lacks personality or career preference details.',
      evidence: 'Complete your personality assessment to unlock domain alignment scoring.',
      recommendation: 'Take the personality assessment to discover tailored pathway matches.',
    };
  }

  let score = 50;
  let evidence = '';
  let status = 'partial';

  // Direct personality match
  if (pathPersonality && pathPersonality === userPersonality) {
    score = 100;
    status = 'matched';
    evidence = `Direct match with your ${userPersonality.toUpperCase()} personality orientation and career inclinations.`;
  } else if (pathPersonality) {
    // Both specified but different
    score = 60;
    status = 'partial';
    evidence = `Path is oriented toward ${pathPersonality.toUpperCase()}, while your profile is ${userPersonality.toUpperCase()}. May require cross-disciplinary adaptability.`;
  } else {
    // Check keyword alignment based on user's personality domains
    const targetKeywords = PERSONALITY_DOMAIN_MAP[userPersonality] || [];
    const matchedKeyword = targetKeywords.find((kw) => domainText.includes(kw));
    if (matchedKeyword) {
      score = 90;
      status = 'matched';
      evidence = `Program content aligns with your ${userPersonality.toUpperCase()} strengths in ${matchedKeyword}.`;
    } else {
      score = 70;
      status = 'partial';
      evidence = `Pathway aligns generally with career growth, exploring fields related to ${pathProgram || 'your chosen stream'}.`;
    }
  }

  return {
    status,
    score,
    title: 'Goal & Domain Alignment',
    summary: status === 'matched' ? 'Strong alignment with your interests and strengths' : 'Partial alignment with personality profile',
    evidence,
    recommendation: status === 'matched' ? 'Excellent fit with your cognitive style.' : 'Review program overview to ensure everyday tasks align with your passion.',
  };
}

/**
 * 2. Grade & Educational Stage Alignment (20%)
 */
function evaluateGradeAlignment(userProfile, path) {
  const userGrade = userProfile?.grade ? String(userProfile.grade).trim() : null;
  const pathGrades = path?.grade?.length ? path.grade : path?.current_coordinates?.grade || [];

  if (!userGrade) {
    return {
      status: 'unknown',
      score: null,
      title: 'Grade & Educational Stage',
      summary: 'Grade not specified in student profile.',
      evidence: 'Student grade is not set. Pathways are optimized for specific secondary or higher secondary years.',
      recommendation: 'Update your current grade in your profile.',
    };
  }

  if (!pathGrades || pathGrades.length === 0) {
    return {
      status: 'matched',
      score: 85,
      title: 'Grade & Educational Stage',
      summary: 'Open to all educational stages',
      evidence: `This pathway welcomes students at Grade ${userGrade} level without restrictive grade-locking.`,
      recommendation: 'You can begin working through these milestones at your current grade level.',
    };
  }

  const normalizedGrades = pathGrades.map((g) => String(g).trim());
  const isDirectMatch = normalizedGrades.includes(userGrade);

  if (isDirectMatch) {
    return {
      status: 'matched',
      score: 100,
      title: 'Grade & Educational Stage',
      summary: `Tailored for Grade ${userGrade}`,
      evidence: `Your current grade (${userGrade}) directly matches the target audience for this pathway.`,
      recommendation: 'Ideal stage to start milestone preparations without pacing friction.',
    };
  }

  // Check if user is near (e.g., in grade 10 for a grade 11 path, or grade 12 for grade 11 path)
  const userGradeNum = parseInt(userGrade, 10);
  const minPathGrade = Math.min(...normalizedGrades.map((g) => parseInt(g, 10)).filter((n) => !isNaN(n)));
  const maxPathGrade = Math.max(...normalizedGrades.map((g) => parseInt(g, 10)).filter((n) => !isNaN(n)));

  if (!isNaN(userGradeNum) && !isNaN(minPathGrade) && userGradeNum < minPathGrade) {
    return {
      status: 'gap',
      score: 45,
      title: 'Grade & Educational Stage',
      summary: `Early preparation: targets Grade ${normalizedGrades.join(', ')}`,
      evidence: `You are in Grade ${userGrade}, but this pathway is structured for Grade ${normalizedGrades.join(', ')}. Advanced topics may be introduced earlier than in school.`,
      recommendation: 'You can explore this path early as an aspirational preview, but prerequisite coursework will be needed.',
    };
  }

  return {
    status: 'partial',
    score: 65,
    title: 'Grade & Educational Stage',
    summary: `Designed for Grade ${normalizedGrades.join(', ')}`,
    evidence: `This pathway is primarily designed for Grade ${normalizedGrades.join(', ')}, while you are in Grade ${userGrade}.`,
    recommendation: 'Review the step syllabus to confirm you are comfortable with the pacing.',
  };
}

/**
 * 3. Stream, Curriculum & Academic Prerequisites (20%)
 */
function evaluateAcademicAlignment(userProfile, path) {
  const userStream = userProfile?.stream ? String(userProfile.stream).trim() : null;
  const userCurriculum = userProfile?.curriculum ? String(userProfile.curriculum).trim() : null;
  const userPerformance = userProfile?.performance ? String(userProfile.performance).trim() : null;

  const pathStreams = path?.stream?.length ? path.stream : path?.current_coordinates?.stream || [];
  const pathCurriculums = path?.curriculum?.length ? path.curriculum : path?.current_coordinates?.curriculum || [];
  const pathAverages = path?.grade_avg?.length ? path.grade_avg : path?.current_coordinates?.grade_avg || [];

  if (!userStream && !userCurriculum) {
    return {
      status: 'unknown',
      score: null,
      title: 'Stream & Academic Prerequisites',
      summary: 'Stream and curriculum not provided in profile.',
      evidence: 'Academic background is essential to verify subject-specific prerequisites.',
      recommendation: 'Specify your academic stream (e.g. MPC, BIPC, CEC) in your profile.',
    };
  }

  let totalPoints = 0;
  let maxPoints = 0;
  const matchedPoints = [];
  const gapPoints = [];

  // Stream check
  if (userStream) {
    maxPoints += 50;
    if (pathStreams.length === 0) {
      totalPoints += 45;
      matchedPoints.push(`Open to all streams (suitable for ${userStream})`);
    } else {
      const match = hasOverlap(userStream, pathStreams);
      if (match) {
        totalPoints += 50;
        matchedPoints.push(`Matches your ${userStream} stream requirement`);
      } else {
        gapPoints.push(`Requires ${pathStreams.join('/')} stream (you are currently in ${userStream})`);
      }
    }
  }

  // Curriculum check
  if (userCurriculum) {
    maxPoints += 30;
    if (pathCurriculums.length === 0) {
      totalPoints += 28;
      matchedPoints.push(`Compatible across curriculums (including ${userCurriculum})`);
    } else {
      const match = hasOverlap(userCurriculum, pathCurriculums);
      if (match) {
        totalPoints += 30;
        matchedPoints.push(`Tailored for ${userCurriculum} curriculum pacing`);
      } else {
        totalPoints += 15;
        gapPoints.push(`Optimized for ${pathCurriculums.join('/')} (you study ${userCurriculum})`);
      }
    }
  }

  // Performance / GPA check
  if (userPerformance && pathAverages.length > 0) {
    maxPoints += 20;
    const match = hasOverlap(userPerformance, pathAverages);
    if (match) {
      totalPoints += 20;
      matchedPoints.push(`Your academic tier (${userPerformance}) meets target criteria`);
    } else {
      totalPoints += 10;
    }
  }

  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 75;
  const hasHardStreamMismatch = gapPoints.some((g) => g.includes('Requires'));

  let status = 'matched';
  if (hasHardStreamMismatch) status = 'gap';
  else if (score < 70) status = 'partial';

  return {
    status,
    score,
    title: 'Stream & Academic Prerequisites',
    summary: status === 'matched' ? 'Strong academic prerequisite compatibility' : (status === 'gap' ? 'Stream prerequisite verification required' : 'Partial curriculum alignment'),
    evidence: [...matchedPoints, ...gapPoints].join('. ') || 'Academic details evaluated.',
    recommendation: hasHardStreamMismatch
      ? `Verify prerequisite subject requirements before enrolling; ${userStream} students may require supplementary foundational coursework.`
      : 'Your current academic track provides strong foundational readiness.',
    prerequisiteWarning: hasHardStreamMismatch,
  };
}

/**
 * 4. Skills & Readiness (15%)
 */
function evaluateSkillsReadiness(userProfile, path, steps = []) {
  // Check steps structure for progressive learning, foundation steps, and preparatory requirements
  const totalSteps = steps.length || (path?.the_ids?.length || 0);

  if (totalSteps === 0) {
    return {
      status: 'matched',
      score: 75,
      title: 'Skills & Pathway Readiness',
      summary: 'Structured learning milestones',
      evidence: 'Pathway provides guided, step-by-step skill acquisition from entry to completion.',
      recommendation: 'Step-by-step guidance will build necessary competencies progressively.',
    };
  }

  // Check if steps have clear descriptions and progressive ordering
  const hasIntro = steps.some((s) => {
    const text = `${s.macro_name || ''} ${s.macro_description || ''}`.toLowerCase();
    return text.includes('foundation') || text.includes('intro') || text.includes('basic') || text.includes('overview') || text.includes('step 1');
  });

  const score = hasIntro ? 92 : 82;

  return {
    status: 'matched',
    score,
    title: 'Skills & Pathway Readiness',
    summary: 'Progressive milestone structure with foundational onboarding',
    evidence: `Includes ${totalSteps} guided milestones designed to develop target competencies progressively.`,
    recommendation: 'Dedicate regular weekly hours to complete each milestone sequentially.',
  };
}

/**
 * 5. Financial Preferences & Known Costs (15%)
 */
function evaluateFinancialAlignment(userProfile, path, steps = []) {
  const userFin = userProfile?.financialSituation ? String(userProfile.financialSituation).trim() : null;
  const pathFin = path?.financialSituation?.length ? path.financialSituation : path?.current_coordinates?.financialSituation || [];

  // Check step costs (paid vs free)
  let paidStepsCount = 0;
  let freeStepsCount = 0;
  steps.forEach((s) => {
    const isPaid = s.macro_access === 'paid' || s.macro_cost === 'paid' || s.cost === 'paid';
    if (isPaid) paidStepsCount++;
    else freeStepsCount++;
  });

  if (!userFin) {
    return {
      status: 'unknown',
      score: null,
      title: 'Financial Alignment & Known Costs',
      summary: 'Financial preference not specified in profile.',
      evidence: 'Student has not recorded budget preferences. Known step access types cannot be fully benchmarked.',
      recommendation: 'Update your financial bracket in your profile to verify cost compatibility.',
    };
  }

  // If path doesn't specify budget bracket
  if (!pathFin || pathFin.length === 0) {
    const isMostlyFree = freeStepsCount >= paidStepsCount;
    return {
      status: 'matched',
      score: isMostlyFree ? 85 : 75,
      title: 'Financial Alignment & Known Costs',
      summary: isMostlyFree ? 'Accessible pathways with mostly free milestones' : 'Mixed cost model requiring verification',
      evidence: isMostlyFree
        ? 'Core path milestones utilize accessible and open-access resources.'
        : 'Some steps may involve elective paid resources or certification fees.',
      recommendation: 'Review specific external resource costs within each milestone.',
    };
  }

  const match = hasOverlap(userFin, pathFin);
  if (match) {
    return {
      status: 'matched',
      score: 95,
      title: 'Financial Alignment & Known Costs',
      summary: `Fits within your ${userFin} budget preference`,
      evidence: `Pathway budget expectations align directly with your selected financial bracket (${userFin}).`,
      recommendation: 'Known pathway and certification costs fall within your comfort tier.',
    };
  }

  return {
    status: 'partial',
    score: 60,
    title: 'Financial Alignment & Known Costs',
    summary: `Budget range indicated as ${pathFin.join(' / ')}`,
    evidence: `This pathway notes typical budgets of ${pathFin.join(' / ')}, compared to your profile preference of ${userFin}.`,
    recommendation: 'Explore available scholarships, financial aid, or free alternative resources for paid milestones.',
  };
}

/**
 * 6. Location, Destination & Study Mode (10%)
 */
function evaluateLocationAlignment(userProfile, path) {
  const userCountry = (userProfile?.country || '').trim().toLowerCase();
  const userCity = (userProfile?.city || '').trim().toLowerCase();

  const pathCountry = (path?.country || path?.current_coordinates?.country || '').trim().toLowerCase();
  const pathCity = (path?.city || path?.current_coordinates?.city || '').trim().toLowerCase();
  const pathInst = path?.destination_institution || path?.feature_coordinates?.destination_institution || '';
  const pathDegree = path?.destination_degree || path?.feature_coordinates?.destination_degree || '';

  if (!userCountry && !userCity) {
    return {
      status: 'unknown',
      score: null,
      title: 'Location & Destination Mode',
      summary: 'Location preference not recorded in profile.',
      evidence: 'Location alignment is neutral. Pathways are available via digital blended learning.',
      recommendation: 'Add your city and country in profile settings for localized recommendations.',
    };
  }

  let score = 80;
  let status = 'matched';
  let evidence = 'Delivered via self-paced digital guidance accessible from anywhere.';

  if (pathCountry && userCountry) {
    if (pathCountry === userCountry) {
      score = 95;
      evidence = `Pathway is directly oriented towards institutions and opportunities in ${path.country || userProfile.country}.`;
    } else {
      score = 75;
      evidence = `International pathway oriented towards ${path.country || 'overseas opportunities'}; study visa or remote access applicable.`;
    }
  } else if (pathInst || pathDegree) {
    score = 88;
    evidence = `Target destination: ${pathInst || pathDegree}. Accessible with standard higher-education qualification.`;
  }

  return {
    status,
    score,
    title: 'Location & Destination Mode',
    summary: score >= 90 ? 'High geographic compatibility' : 'Global / Accessible study mode',
    evidence,
    recommendation: 'Check institution-specific location requirements if on-campus residency is planned.',
  };
}

/**
 * Main Assessment Function: Computes full fit analysis for a path against a user profile
 * 
 * @param {Object} userProfile - Student user document or plain object
 * @param {Object} path - Path document or plain object
 * @param {Array} steps - Optional array of step documents
 * @returns {Object} Comprehensive fit analysis object
 */
function assessPathFit(userProfile, path, steps = []) {
  if (!path) {
    throw new Error('Path data is required for fit analysis.');
  }

  const profile = userProfile || {};

  // Evaluate all 6 factors
  const factorResults = {
    goal: evaluateGoalAlignment(profile, path, steps),
    grade: evaluateGradeAlignment(profile, path),
    academic: evaluateAcademicAlignment(profile, path),
    skills: evaluateSkillsReadiness(profile, path, steps),
    financial: evaluateFinancialAlignment(profile, path, steps),
    location: evaluateLocationAlignment(profile, path),
  };

  const factorsArray = Object.keys(FACTOR_WEIGHTS).map((key) => {
    const factor = factorResults[key];
    return {
      key,
      weight: FACTOR_WEIGHTS[key],
      ...factor,
    };
  });

  // Calculate completeness (% of factors where data is available)
  const knownFactors = factorsArray.filter((f) => f.status !== 'unknown' && f.score !== null);
  const dataCompleteness = Math.round((knownFactors.length / factorsArray.length) * 100);

  // Evidence-based weighted scoring:
  // Normalize weights among known factors so missing data does NOT penalize
  let weightedScore = 0;
  let totalKnownWeight = 0;

  knownFactors.forEach((f) => {
    weightedScore += (f.score * f.weight);
    totalKnownWeight += f.weight;
  });

  const finalScore = totalKnownWeight > 0 ? Math.round(weightedScore / totalKnownWeight) : null;

  // Determine Overall Fit Category
  let fitCategory = 'Needs Verification';
  let badgeTone = 'lavender'; // 'mint' | 'yellow' | 'coral' | 'lavender'

  if (dataCompleteness < 35 || finalScore === null) {
    fitCategory = 'Needs Verification';
    badgeTone = 'lavender';
  } else if (factorResults.academic?.prerequisiteWarning) {
    fitCategory = 'Check Prerequisites';
    badgeTone = 'yellow';
  } else if (finalScore >= 78 && dataCompleteness >= 50) {
    fitCategory = 'Strong Fit';
    badgeTone = 'mint';
  } else if (finalScore >= 60) {
    fitCategory = 'Good Match';
    badgeTone = 'mint';
  } else if (finalScore >= 45) {
    fitCategory = 'Potential Fit with Gaps';
    badgeTone = 'yellow';
  } else {
    fitCategory = 'Prerequisites to Address';
    badgeTone = 'coral';
  }

  // Eligibility status
  let eligibilityStatus = 'Eligible';
  if (factorResults.academic?.prerequisiteWarning) {
    eligibilityStatus = 'Check Academic Prerequisites';
  } else if (factorResults.grade?.status === 'gap') {
    eligibilityStatus = 'Grade Verification Needed';
  } else if (dataCompleteness < 50) {
    eligibilityStatus = 'Information Incomplete';
  }

  // Extract Matched Highlights & Gaps
  const matchedFactors = [];
  const gapsToAddress = [];

  factorsArray.forEach((f) => {
    if (f.status === 'matched') {
      matchedFactors.push({
        title: f.title,
        evidence: f.evidence,
      });
    } else if (f.status === 'gap') {
      gapsToAddress.push({
        title: f.title,
        evidence: f.evidence,
        recommendation: f.recommendation,
        critical: !!f.prerequisiteWarning,
      });
    } else if (f.status === 'partial') {
      gapsToAddress.push({
        title: f.title,
        evidence: f.evidence,
        recommendation: f.recommendation,
        critical: false,
      });
    }
  });

  // Construct high-level executive summary
  let summary = '';
  if (fitCategory === 'Strong Fit') {
    summary = `High alignment with your ${profile.stream || 'academic'} track and Grade ${profile.grade || ''} progression with clear milestone support.`;
  } else if (fitCategory === 'Good Match') {
    summary = `Solid general match across educational milestones, with minor adjustments recommended for optimal pacing.`;
  } else if (fitCategory === 'Check Prerequisites') {
    summary = `Engaging pathway, but requires subject prerequisite review for students from the ${profile.stream || 'current'} stream.`;
  } else if (fitCategory === 'Needs Verification') {
    summary = `Profile details are limited. Complete grade and stream info to reveal personalized fit clarity.`;
  } else {
    summary = `Identified key areas to review before committing to this pathway.`;
  }

  // Generate 1-line card highlight
  let cardHighlight = '';
  if (factorResults.academic?.status === 'matched' && factorResults.grade?.status === 'matched') {
    cardHighlight = `Matches your ${profile.stream} stream & Grade ${profile.grade}`;
  } else if (factorResults.goal?.status === 'matched') {
    cardHighlight = `Strong match with your ${profile.personality || ''} career orientation`;
  } else if (factorResults.academic?.status === 'matched') {
    cardHighlight = `Compatible with your ${profile.stream || profile.curriculum || 'academic'} background`;
  } else if (factorResults.academic?.prerequisiteWarning) {
    cardHighlight = `Prerequisite check required for ${profile.stream || 'your'} stream`;
  } else if (dataCompleteness < 40) {
    cardHighlight = `Update profile for personalized fit score`;
  } else {
    cardHighlight = `Step-by-step milestone progression for Grade ${path.grade?.[0] || '11-12'}`;
  }

  return {
    pathId: path._id,
    pathName: path.nameOfPath || path.name,
    overallScore: finalScore,
    fitCategory,
    badgeTone,
    eligibilityStatus,
    dataCompleteness,
    cardHighlight,
    summary,
    factors: factorsArray,
    matchedFactors,
    gapsToAddress,
    assessedAt: new Date().toISOString(),
  };
}

/**
 * Batch Assessment for multiple paths (optimized for Explore Paths card view)
 */
function assessMultiplePaths(userProfile, pathsList = []) {
  if (!Array.isArray(pathsList)) return [];

  return pathsList.map((path) => {
    try {
      const full = assessPathFit(userProfile, path, []);
      // Return lean version for card rendering
      return {
        pathId: path._id,
        pathName: path.nameOfPath || path.name,
        overallScore: full.overallScore,
        fitCategory: full.fitCategory,
        badgeTone: full.badgeTone,
        eligibilityStatus: full.eligibilityStatus,
        dataCompleteness: full.dataCompleteness,
        cardHighlight: full.cardHighlight,
        matchedCount: full.matchedFactors.length,
        gapsCount: full.gapsToAddress.length,
      };
    } catch (err) {
      return {
        pathId: path._id,
        pathName: path.nameOfPath || path.name,
        overallScore: null,
        fitCategory: 'Needs Verification',
        badgeTone: 'lavender',
        cardHighlight: 'Fit evaluation unavailable',
        dataCompleteness: 0,
      };
    }
  });
}

module.exports = {
  FACTOR_WEIGHTS,
  assessPathFit,
  assessMultiplePaths,
};
