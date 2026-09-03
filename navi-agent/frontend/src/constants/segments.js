export const SEGMENTS = {
  ACADEMICS: "academic",
  PRACTICAL: "practical",
  JOBS_CAREERS: "jobs",
  NON_ACADEMIC_COUNSELLING: "non_academic",
};

export const SEGMENT_CONFIGS = [
  {
    key: SEGMENTS.ACADEMICS,
    label: "Academics",
    shortLabel: "Academics",
    description: "Higher education, college degrees, universities, school, and academic research",
    subSegments: [
      { key: "university_ug", label: "Undergraduate (Bachelor's)" },
      { key: "university_pg", label: "Postgraduate (Master's / MBA)" },
      { key: "research_phd", label: "Research & PhD" },
      { key: "transfer_lateral", label: "Transfer / Lateral Entry" },
      { key: "k12_primary_middle", label: "School: Grades 1–8" },
      { key: "k12_high_school", label: "School: Grades 9–10" },
      { key: "k12_senior", label: "Pre-University: Grades 11–12" },
    ],
  },
  {
    key: SEGMENTS.PRACTICAL,
    label: "Practical Skills",
    shortLabel: "Practical Skills",
    description: "Hands-on skills learning, project portfolios, technical proficiency, and practical capabilities",
    subSegments: [
      { key: "tech_skills", label: "Technical Skills" },
      { key: "creative_skills", label: "Creative Skills" },
      { key: "business_skills", label: "Business Skills" },
      { key: "digital_skills", label: "Digital Skills" },
      { key: "vocational_skills", label: "Vocational Skills" },
    ],
  },
  {
    key: SEGMENTS.JOBS_CAREERS,
    label: "Jobs & Careers",
    shortLabel: "Jobs & Careers",
    description: "Industry roles, job search strategies, career transitions, and professional growth",
    subSegments: [
      { key: "tech_roles", label: "Technical Roles" },
      { key: "business_roles", label: "Business Roles" },
      { key: "creative_roles", label: "Creative Roles" },
      { key: "healthcare_roles", label: "Healthcare Roles" },
      { key: "gov_public_roles", label: "Government / Public Sector" },
      { key: "entrepreneurship", label: "Entrepreneurship" },
    ],
  },
  {
    key: SEGMENTS.NON_ACADEMIC_COUNSELLING,
    label: "Non-Academic Counselling",
    shortLabel: "Non-Academic Counselling",
    description: "Mental health, wellness, personal development, guidance, and stress management",
    subSegments: [
      { key: "mental_wellbeing", label: "Mental Wellbeing" },
      { key: "personal_dev", label: "Personal Development" },
      { key: "relationship_guidance", label: "Relationship Guidance" },
      { key: "family_guidance", label: "Family Guidance" },
      { key: "stress_management", label: "Stress Management" },
    ],
  },
];

// Maps segment keys to the profile object key used for storing segment-specific data if needed
export const SEGMENT_TO_PROFILE_KEY = {
  [SEGMENTS.ACADEMICS]: "academics",
  [SEGMENTS.PRACTICAL]: "practicalSkills",
  [SEGMENTS.JOBS_CAREERS]: "jobsCareers",
  [SEGMENTS.NON_ACADEMIC_COUNSELLING]: "nonAcademicCounselling",
};

export function getSegmentConfig(key) {
  if (!key) return null;
  const normalized = key.toLowerCase().trim();
  return SEGMENT_CONFIGS.find(s => s.key === normalized || s.label.toLowerCase() === normalized || s.shortLabel.toLowerCase() === normalized) || null;
}

export function getDefaultSubSegment(segmentKey) {
  const conf = getSegmentConfig(segmentKey);
  return conf?.subSegments?.[0]?.label || "";
}

export function getSubSegmentsForCategory(segmentKey) {
  const conf = getSegmentConfig(segmentKey);
  return conf?.subSegments || [];
}

// Returns the profile data key for a given segment
export function getProfileKeyForSegment(segmentKey) {
  return SEGMENT_TO_PROFILE_KEY[segmentKey] || "academics";
}
