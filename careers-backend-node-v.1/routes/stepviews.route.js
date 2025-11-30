const express = require("express");
const router = express.Router();
const Universities = require("../models/universities.model");
const StepViews = require("../models/stepviews.model");
const axios = require("axios");

/***********************************************************
 *  AUTO-GENERATE MACRO / MICRO / NANO VIEW
 ***********************************************************/
router.get("/", async (req, res) => {
  try {
    const { stepId, universityId } = req.query;

    if (!stepId || !universityId) {
      return res.status(400).json({
        success: false,
        message: "stepId and universityId are required",
      });
    }

    /****************************************************
     * 1️⃣ FIND UNIVERSITY
     ****************************************************/
    const uni = await Universities.findById(universityId);

    if (!uni)
      return res.status(404).json({
        success: false,
        message: "University not found",
      });

    const gp = uni.generatedProgram;

    if (!gp || !gp.steps) {
      return res.status(404).json({
        success: false,
        message: "No generated program found for this university",
      });
    }

    /****************************************************
     * 2️⃣ FIND STEP BY ID (your steps have no _id, so match externally)
     ****************************************************/
    const index = gp.steps.findIndex(
      (_, idx) => `${uni._id}_step_${idx}` === stepId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Step not found",
      });
    }

    const step = gp.steps[index];

    /****************************************************
     * 3️⃣ CHECK IF STEP VIEW ALREADY EXISTS
     ****************************************************/
    let existing = await StepViews.findOne({ stepId });

    if (existing) {
      return res.json({ success: true, data: existing });
    }

    /****************************************************
     * 4️⃣ PREPARE PROMPT FOR PERPLEXITY AI
     ****************************************************/
    const prompt = `
Generate 3 views for the following step:

STEP NAME: ${step.name}
STEP DESCRIPTION: ${step.description}

STUDENT CONTEXT:
Grade: ${gp.grade}
Stream: ${gp.stream}
Curriculum: ${gp.curriculum}
Performance: ${gp.performance}
Financial Position: ${gp.financialSituation}
Personality: ${gp.personality}

Return STRICT JSON:
{
  "macroView": "",
  "microView": {
     "grade": "",
     "stream": "",
     "curriculum": "",
     "gpa": "",
     "financialPosition": "",
     "personality": ""
  },
  "nanoView": ["", "", ""]
}
`;

    /****************************************************
     * 5️⃣ CALL PERPLEXITY AI
     ****************************************************/
    const aiRes = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let raw = aiRes?.data?.choices?.[0]?.message?.content || "";
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    let generated;
    try {
      generated = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON",
        raw,
      });
    }

    /****************************************************
     * 6️⃣ SAVE TO MONGO (MATCHING YOUR MODEL)
     ****************************************************/
    const saved = await StepViews.create({
      universityId,
      stepId,
      macroView: generated.macroView,
      microView: {
        grade: generated.microView.grade,
        stream: generated.microView.stream,
        curriculum: generated.microView.curriculum,
        gpa: generated.microView.gpa,
        financialPosition: generated.microView.financialPosition,
        personality: generated.microView.personality,
      },
      nanoView: generated.nanoView,
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error("❌ Error generating views:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
