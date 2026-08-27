import axios from "axios";

const API = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || "http://localhost:4545";

const STORAGE_KEYS = {
  REPLACEMENTS: "naavi_marketplace_replacements",
  ASSISTANCE: "naavi_marketplace_assistance_requests",
  MESSAGES: "naavi_marketplace_assistance_messages",
};

// ── Local Storage Helpers (used ONLY for replacement state, not assistance) ──
function getStored(key, defaultVal = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// ── One-time cleanup: purge any legacy mock/test data from localStorage ──
try {
  localStorage.removeItem(STORAGE_KEYS.ASSISTANCE);
  localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  localStorage.removeItem(STORAGE_KEYS.REPLACEMENTS);
} catch {
  // Silent — storage may be unavailable
}

export const marketplaceReplacementService = {
  // ── REPLACEMENT STATE (User) ──
  getReplacementState(stepId, userEmail) {
    const all = getStored(STORAGE_KEYS.REPLACEMENTS, {});
    const key = `${userEmail || "guest"}_${stepId || "default"}`;
    return (
      all[key] || {
        count: 0,
        rejectedItemIds: [],
        feedbackHistory: [],
        activeReplacementItem: null,
        whyRecommended: null,
      }
    );
  },

  setActiveReplacement({ stepId, userEmail, replacementItem, whyRecommended = [] }) {
    if (!stepId || !replacementItem) return;
    const key = `${userEmail || "guest"}_${stepId || "default"}`;
    const all = getStored(STORAGE_KEYS.REPLACEMENTS, {});
    const current = all[key] || {
      count: 3,
      rejectedItemIds: [],
      feedbackHistory: [],
      activeReplacementItem: null,
      whyRecommended: null,
    };
    all[key] = {
      ...current,
      activeReplacementItem: replacementItem,
      whyRecommended: whyRecommended.length > 0 ? whyRecommended : ["✓ Super Admin Recommended Selection"],
    };
    setStored(STORAGE_KEYS.REPLACEMENTS, all);
  },

  async submitReplacement({
    userEmail,
    stepId,
    pathId,
    rejectedItem,
    reasons,
    message,
    availableItems = [],
  }) {
    const key = `${userEmail || "guest"}_${stepId || "default"}`;
    const all = getStored(STORAGE_KEYS.REPLACEMENTS, {});
    const current = all[key] || {
      count: 0,
      rejectedItemIds: [],
      feedbackHistory: [],
      activeReplacementItem: null,
      whyRecommended: null,
    };

    const newCount = Math.min(3, current.count + 1);
    const rejectedId = String(rejectedItem._id || rejectedItem.id);
    const updatedRejectedIds = Array.from(new Set([...current.rejectedItemIds.map(String), rejectedId]));

    // Try sending to backend if API is live
    try {
      const response = await axios.post(`${API}/api/marketplace/replacement`, {
        userEmail,
        stepId,
        pathId,
        rejectedItemId: rejectedId,
        reasons,
        message,
        replacementCount: newCount,
        previousRecommendations: updatedRejectedIds,
      });
      if (response.data?.status && response.data?.replacementItem) {
        const updatedState = {
          count: response.data.replacementCount || newCount,
          rejectedItemIds: updatedRejectedIds,
          feedbackHistory: [
            ...current.feedbackHistory,
            {
              replacementNumber: newCount,
              rejectedItemId: rejectedId,
              rejectedItemName: rejectedItem.name,
              reasons,
              message,
              timestamp: new Date().toISOString(),
            },
          ],
          activeReplacementItem: response.data.replacementItem,
          whyRecommended: response.data.whyRecommended || [],
        };
        all[key] = updatedState;
        setStored(STORAGE_KEYS.REPLACEMENTS, all);
        return {
          status: true,
          ...updatedState,
          replacementCount: updatedState.count,
          replacementItem: updatedState.activeReplacementItem,
        };
      }
    } catch (err) {
      // Fall back to client-side smart re-ranking
    }

    // Client-side Ranking & Recommendation Logic
    const pool = availableItems.filter((item) => {
      const iId = String(item._id || item.id);
      return !updatedRejectedIds.includes(iId);
    });

    // Score items based on user preferences
    const scoredPool = pool.map((item) => {
      let score = Number(item.naaviScore || item.marketplace_score || 80);
      const isFree = !item.cost || String(item.cost).toLowerCase() === "0" || String(item.cost).toLowerCase() === "free";
      const cost = parseInt(String(item.cost || 0).replace(/\D/g, ""), 10) || 0;

      // Apply Reason adjustments
      if (reasons.includes("too_expensive")) {
        if (isFree) score += 40;
        else if (cost < 10000) score += 25;
        else score -= 30;
      }

      if (reasons.includes("offline_preferred")) {
        if (item.mode?.toLowerCase() === "offline" || item.role === "INSTITUTE" || item.category === "institution") score += 30;
      }

      if (reasons.includes("online_preferred")) {
        if (item.mode?.toLowerCase() === "online" || item.category === "course" || item.role === "VENDOR") score += 30;
      }

      if (reasons.includes("rating_not_suitable")) {
        const rating = Number(item.average_rating || item.rating || 4.0);
        if (rating >= 4.5) score += 25;
      }

      return { item, score };
    });

    scoredPool.sort((a, b) => b.score - a.score);

    const replacement = scoredPool[0]?.item || pool[0] || null;

    // Generate transparent "Why Recommended" explanation tags
    const whyRecommended = [];
    if (reasons.includes("too_expensive")) {
      const isFree = !replacement?.cost || String(replacement?.cost).toLowerCase() === "0";
      whyRecommended.push(isFree ? "✓ 100% Free resource" : "✓ Significantly lower cost");
    }
    if (reasons.includes("offline_preferred")) {
      whyRecommended.push("✓ Fits offline / in-person format");
    }
    if (reasons.includes("online_preferred")) {
      whyRecommended.push("✓ 100% Online flexible access");
    }
    if (reasons.includes("rating_not_suitable") || reasons.includes("wrong_level")) {
      whyRecommended.push("✓ Top-rated alternative with verified curriculum");
    }
    if (whyRecommended.length === 0) {
      whyRecommended.push("✓ High relevance match for your step preferences");
    }

    const updatedState = {
      count: newCount,
      rejectedItemIds: updatedRejectedIds,
      feedbackHistory: [
        ...current.feedbackHistory,
        {
          replacementNumber: newCount,
          rejectedItemId: rejectedId,
          rejectedItemName: rejectedItem.name,
          reasons,
          message,
          timestamp: new Date().toISOString(),
        },
      ],
      activeReplacementItem: replacement,
      whyRecommended,
    };

    all[key] = updatedState;
    setStored(STORAGE_KEYS.REPLACEMENTS, all);

    return {
      status: true,
      ...updatedState,
      replacementCount: newCount,
      replacementItem: replacement,
      whyRecommended,
    };
  },

  // ── ASSISTANCE REQUESTS ──
  async createAssistanceRequest({
    userEmail,
    userName,
    pathId,
    pathName,
    stepId,
    stepName,
    originalMarketplaceItemId,
    originalItemName,
    reasons = [],
    message = "",
    previousRecommendations = [],
  }) {
    const payload = {
      id: `ast-${Date.now()}`,
      userId: userEmail || "guest_user",
      userEmail: userEmail || "guest@naaviverse.com",
      userName: userName || "Student",
      pathId: pathId || "",
      pathName: pathName || "Current Learning Path",
      stepId: stepId || "",
      stepName: stepName || "Learning Step",
      originalMarketplaceItemId,
      originalItemName,
      replacementCount: 3,
      userRequirement: {
        reasons,
        message,
      },
      previousRecommendations,
      status: "pending",
      assignedAdminId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await axios.post(`${API}/api/marketplace/assistance`, payload);
      if (res.data?.status && res.data?.request) {
        return res.data.request;
      }
      // API responded but didn't return expected shape — return payload as best-effort
      return payload;
    } catch (err) {
      console.error("createAssistanceRequest API error:", err);
      throw err;
    }
  },

  async getUserAssistanceRequests(userEmail) {
    try {
      const res = await axios.get(`${API}/api/marketplace/assistance/user?email=${userEmail}`);
      if (res.data?.status && res.data?.requests) {
        return res.data.requests;
      }
      return [];
    } catch (err) {
      console.error("getUserAssistanceRequests API error:", err);
      return [];
    }
  },

  async getAllAssistanceRequests() {
    try {
      const res = await axios.get(`${API}/api/admin/marketplace/assistance`);
      if (res.data?.status && res.data?.requests) {
        return res.data.requests;
      }
      return [];
    } catch (err) {
      console.error("getAllAssistanceRequests API error:", err);
      return [];
    }
  },

  async updateRequestStatus(requestId, status) {
    try {
      const res = await axios.patch(`${API}/api/admin/marketplace/assistance/${requestId}/status`, { status });
      if (res.data?.status && res.data?.request) {
        return res.data.request;
      }
      return null;
    } catch (err) {
      console.error("updateRequestStatus API error:", err);
      return null;
    }
  },

  // ── MESSAGING ──
  async getMessages(requestId) {
    try {
      const res = await axios.get(`${API}/api/marketplace/assistance/${requestId}/messages`);
      if (res.data?.status && res.data?.messages) {
        return res.data.messages;
      }
      return [];
    } catch (err) {
      console.error("getMessages API error:", err);
      return [];
    }
  },

  async sendMessage({ requestId, senderId, senderRole, senderName, message, attachments = [], recommendedService = null }) {
    const payload = {
      requestId,
      senderId,
      senderRole, // "USER" | "SUPER_ADMIN"
      senderName,
      message,
      attachments,
      recommendedService,
    };

    try {
      const res = await axios.post(`${API}/api/marketplace/assistance/${requestId}/message`, payload);
      if (res.data?.status && res.data?.message) {
        return res.data.message;
      }
      // Return a best-effort local shape so the chat UI can render it immediately
      return { ...payload, id: `msg-${Date.now()}`, createdAt: new Date().toISOString() };
    } catch (err) {
      console.error("sendMessage API error:", err);
      throw err;
    }
  },

  // ── CATALOG SERVICES (For Super Admin Recommendation & Replacement) ──
  async getAllCatalogServices(stepId = null) {
    let items = [];

    // 1. Try step-specific marketplace items first if stepId is provided
    if (stepId) {
      try {
        const stepRes = await axios.get(`${API}/api/marketplace/step/${stepId}`);
        if (stepRes.data?.status && Array.isArray(stepRes.data?.data) && stepRes.data.data.length > 0) {
          items = stepRes.data.data;
        } else if (Array.isArray(stepRes.data) && stepRes.data.length > 0) {
          items = stepRes.data;
        }
      } catch (e) {
        console.warn("Step marketplace lookup failed:", e.message);
      }
    }

    // 2. If step has no items, load all active marketplace catalog items
    if (!items || items.length === 0) {
      try {
        const res = await axios.get(`${API}/api/marketplace/admin/get-all`);
        if (res.data?.status && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          items = res.data.data;
        } else if (Array.isArray(res.data) && res.data.length > 0) {
          items = res.data;
        }
      } catch (err) {
        console.warn("Admin catalog lookup failed:", err.message);
      }
    }

    // 3. Fallback to rankings if still empty
    if (!items || items.length === 0) {
      try {
        const rankRes = await axios.get(`${API}/api/marketplace/rankings`);
        if (rankRes.data?.status && Array.isArray(rankRes.data?.data) && rankRes.data.data.length > 0) {
          items = rankRes.data.data;
        }
      } catch (e) {
        // silent
      }
    }

    // 4. Default high-quality catalog items if backend has no active seed data
    if (!items || items.length === 0) {
      items = [
        {
          _id: "cat_mentor_1",
          id: "cat_mentor_1",
          name: "1-on-1 Economics Research Mentorship",
          category: "Mentorship",
          role: "MENTOR",
          layer: "nano",
          provider: "Edutechex Global",
          cost: "4999",
          mode: "Online",
          duration: "4 Weeks",
          goal: "Personalized 1-on-1 mentorship with senior research scholars, weekly milestone evaluations, and certificate of completion.",
          desc: "Personalized 1-on-1 mentorship with senior research scholars, weekly milestone evaluations, and certificate of completion.",
        },
        {
          _id: "cat_inst_1",
          id: "cat_inst_1",
          name: "University of Toronto Economics Resource Community",
          category: "Summer Programs",
          role: "INSTITUTION",
          layer: "macro",
          provider: "University of Toronto",
          cost: "0",
          mode: "Online",
          duration: "Self-Paced",
          goal: "Comprehensive academic resources, reading lists, and foundational research papers.",
          desc: "Comprehensive academic resources, reading lists, and foundational research papers.",
        },
        {
          _id: "cat_inst_2",
          id: "cat_inst_2",
          name: "McMaster University Economics Department Resources",
          category: "Courses",
          role: "INSTITUTION",
          layer: "macro",
          provider: "McMaster University",
          cost: "0",
          mode: "Online",
          duration: "Self-Paced",
          goal: "Curated departmental problem sets, recorded lectures, and data lab exercises.",
          desc: "Curated departmental problem sets, recorded lectures, and data lab exercises.",
        },
        {
          _id: "cat_inst_3",
          id: "cat_inst_3",
          name: "British Columbia Economics College Learning Materials",
          category: "Courses",
          role: "INSTITUTION",
          layer: "macro",
          provider: "UBC Faculty of Economics",
          cost: "0",
          mode: "Online",
          duration: "6 Weeks",
          goal: "Open access learning modules, microeconomics models, and practice case studies.",
          desc: "Open access learning modules, microeconomics models, and practice case studies.",
        },
        {
          _id: "cat_boot_1",
          id: "cat_boot_1",
          name: "Applied Econometrics & Data Bootcamp",
          category: "Course / Bootcamp",
          role: "VENDOR",
          layer: "micro",
          provider: "Edutechex Partner",
          cost: "12999",
          mode: "Online",
          duration: "8 Weeks",
          goal: "Hands-on data analysis in Python and R for economics research and financial modeling.",
          desc: "Hands-on data analysis in Python and R for economics research and financial modeling.",
        },
        {
          _id: "cat_counsel_1",
          id: "cat_counsel_1",
          name: "Economics Bachelor's Admissions Counseling",
          category: "Admissions Counseling",
          role: "MENTOR",
          layer: "nano",
          provider: "Naavi Premier Advisory",
          cost: "7499",
          mode: "Online",
          duration: "2 Sessions",
          goal: "Comprehensive SOP review, profile enhancement strategies, and interview readiness.",
          desc: "Comprehensive SOP review, profile enhancement strategies, and interview readiness.",
        },
      ];
    }

    return Array.isArray(items) ? items : [];
  },

  async createCustomService(serviceData) {
    try {
      const payload = {
        name: serviceData.name,
        role: serviceData.role || "MENTOR",
        layer: serviceData.layer || "macro",
        step_id: serviceData.step_id || serviceData.stepId,
        path_id: serviceData.path_id || serviceData.pathId,
        category: serviceData.category || "mentorship",
        access: !serviceData.cost || serviceData.cost === "0" ? "free" : "paid",
        cost: String(serviceData.cost || "0"),
        goal: serviceData.goal || serviceData.desc || serviceData.description,
        duration: serviceData.duration || "Self-Paced",
        partner_email: serviceData.partner_email || "superadmin@naaviverse.com",
      };

      if (payload.step_id) {
        const res = await axios.post(`${API}/api/marketplace/add`, payload);
        if (res.data?.status && res.data?.data) {
          return res.data.data;
        }
      }
      return { ...payload, id: `custom-${Date.now()}`, _id: `custom-${Date.now()}` };
    } catch (err) {
      console.warn("createCustomService API fallback:", err.message);
      return { ...serviceData, id: `custom-${Date.now()}`, _id: `custom-${Date.now()}` };
    }
  },

  async recommendServiceToUser({ requestId, adminId, adminName, service, note = "", stepId = null, userEmail = null }) {
    const messageText = note
      ? `Our team reviewed your requirements and recommends: **${service.name}**.\n\n${note}`
      : `Our team reviewed your requirements and recommends: **${service.name}**.`;

    // Automatically replace the marketplace recommendation for this student / step
    if (stepId || service.step_id || service.stepId) {
      this.setActiveReplacement({
        stepId: stepId || service.step_id || service.stepId,
        userEmail: userEmail,
        replacementItem: service,
        whyRecommended: [
          "✓ Super Admin Recommended Solution",
          `✓ Tailored for ${service.category || service.role || "your roadmap milestone"}`,
        ],
      });
    }

    return await this.sendMessage({
      requestId,
      senderId: adminId || "admin_super",
      senderRole: "SUPER_ADMIN",
      senderName: adminName || "Super Admin",
      message: messageText,
      recommendedService: service,
    });
  },
};

export default marketplaceReplacementService;
