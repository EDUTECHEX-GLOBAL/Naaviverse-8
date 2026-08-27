import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ANSWER_OPTIONS = ["Dislike", "Slightly Dislike", "Neutral", "Slightly Enjoy", "Enjoy"];

/**
 * RIASEC mapping keyed by EXACT question text (case-insensitive lookup below).
 * This is order-independent — works regardless of how MongoDB returns the docs.
 */
const QUESTION_TYPE_MAP = {
  // Conventional
  "keep shipping and receiving records":                      "Conventional",
  "handle customers bank transactions":                       "Conventional",
  "operate a calculator":                                     "Conventional",
  "compute and record statistical and other numerical data":  "Conventional",
  "maintain employee records":                                "Conventional",
  "use a computer pogram to generate customer bills":         "Conventional", // typo kept to match DB
  "use a computer program to generate customer bills":        "Conventional", // corrected spelling fallback
  "inventory supplies using a hand-held computer":            "Conventional",
  "generate the monthly payroll checks for an office":        "Conventional",

  // Enterprising
  "run a toy store":                                          "Enterprising",
  "sell houses":                                              "Enterprising",
  "manage a clothing store":                                  "Enterprising",
  "manage a department within a large company":               "Enterprising",
  "operate a beauty salon or barber shop":                    "Enterprising",
  "manage the operations of a hotel":                         "Enterprising",
  "sell merchandise at a department store":                   "Enterprising",
  "sell restaurant franchises to individuals":                "Enterprising",

  // Social
  "help elderly people with their daily activities":          "Social",
  "teach children how to read":                               "Social",
  "supervise the activities of children at a camp":           "Social",
  "help people with family-related problems":                 "Social",
  "teach an individual an exercise routine":                  "Social",
  "help people who have problems with drugs or alcohol":      "Social",
  "do volunteer work at a non-profit organization":           "Social",
  "give career guidance to people":                           "Social",

  // Artistic
  "design sets for plays":                                    "Artistic",
  "perform stunts for a movie or television show":            "Artistic",
  "play musical instrument":                                  "Artistic",
  "write books or plays":                                     "Artistic",
  "write a song":                                             "Artistic",
  "design art work for magazines":                            "Artistic",
  "direct a play":                                            "Artistic",
  "conduct a musical choir":                                  "Artistic",

  // Investigative
  "make a map of the bottom of an ocean":                     "Investigative",
  "work in a biology lab":                                    "Investigative",
  "study whales and other types of marine life":              "Investigative",
  "conduct biological research":                              "Investigative",
  "develop a new medical treatment or procedure":             "Investigative",
  "do research on plants or animals":                         "Investigative",
  "study animal behaviour":                                   "Investigative",
  "study the structure of the human body":                    "Investigative",

  // Realistic
  "install flooring in houses":                               "Realistic",
  "assemble products in a factory":                           "Realistic",
  "fix a broken faucet":                                      "Realistic",
  "operate a grinding machine in a factory":                  "Realistic",
  "assemble electronic parts":                                "Realistic",
  "work on an offshore oil-drilling rig":                     "Realistic",
  "lay brick or tile":                                        "Realistic",
  "test the quality of parts before shipment":                "Realistic",
};

const PERSONALITY_TYPES = [
  "Realistic",
  "Investigative",
  "Artistic",
  "Social",
  "Enterprising",
  "Conventional",
];

/**
 * Given the current answers map ({ questionText: answerText })
 * and the ordered questions array from the API,
 * compute a score per personality type and return the winner.
 *
 * Answer scores: Dislike=1, Slightly Dislike=2, Neutral=3,
 *                Slightly Enjoy=4, Enjoy=5
 */
const ANSWER_SCORES = {
  Dislike: 1,
  "Slightly Dislike": 2,
  Neutral: 3,
  "Slightly Enjoy": 4,
  Enjoy: 5,
};

function computePersonality(questions, answers) {
  const totals = {};
  PERSONALITY_TYPES.forEach((t) => (totals[t] = 0));

  questions.forEach((q) => {
    // Lookup by question text — case-insensitive, trimmed
    const type = QUESTION_TYPE_MAP[q.question.trim().toLowerCase()];
    const answerText = answers[q.question];
    if (type && answerText) {
      totals[type] += ANSWER_SCORES[answerText] ?? 3;
    }
  });

  // Return the type with the highest total score
  return Object.entries(totals).reduce(
    (best, [type, score]) => (score > best.score ? { type, score } : best),
    { type: "", score: -1 }
  ).type;
}

/**
 * LevelThreeModal
 *
 * Props:
 *  inline        — render without outer overlay
 *  creation      — true when creating for first time
 *  profileDataId — MongoDB _id of the user document
 *  existingData  — existing profile object
 *  onClose       — cancel handler
 *  onComplete    — success callback
 */
const LevelThreeModal = ({
  inline = false,
  creation = false,
  profileDataId,
  existingData,
  onClose,
  onComplete,
}) => {
  const [loading,          setLoading]          = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questions,        setQuestions]        = useState([]);
  const [answers,          setAnswers]          = useState({}); // { question_text: answer_text }

  // Derived — auto-computed from answers; never manually set by user
  const detectedPersonality = computePersonality(questions, answers);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && profileDataId) {
      fetchExistingAnswers();
    }
  }, [questions, profileDataId]);

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/personality/questions`);
      setQuestions(res.data?.data || []);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchExistingAnswers = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/userAnswers/get?userId=${profileDataId}`
      );
      const map = {};
      (res.data || []).forEach((item) => {
        map[item.question] = item.answer;
      });
      setAnswers(map);
    } catch {
      // silently ignore — user just hasn't answered yet
    }
  };

  const handleAnswer = (questionText, answerIndex) => {
    setAnswers((prev) => ({ ...prev, [questionText]: ANSWER_OPTIONS[answerIndex] }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount    = questions.length;
  const progressPct   = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  const allAnswered   = answeredCount >= totalCount && totalCount > 0;

  const isFormValid = () => allAnswered && detectedPersonality !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please answer all questions");
      return;
    }

    setLoading(true);
    try {
      // Save all answers
      for (const q of questions) {
        const ans = answers[q.question];
        if (ans) {
          await axios.post(`${BASE_URL}/api/userAnswers/add`, {
            userId:   profileDataId,
            question: q.question,
            answer:   ans,
          });
        }
      }

      // Save the AUTO-DETECTED personality (not user-selected)
      const res = await axios.put(`${BASE_URL}/api/users/addPersonality`, {
        userId:      profileDataId,
        personality: detectedPersonality.toLowerCase(),
      });

      if (res.data?.status) {
        if (typeof onComplete === "function") onComplete();
      } else {
        toast.error(res.data?.message || "Failed to save");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="up-form-wrap">
        <div className="up-form-title">
          {creation ? "Step 3 — Personality & Interests" : "Edit Personality & Interests"}
        </div>
        <div className="up-form-desc">
          {creation
            ? "Rate each activity below. Your personality type will be detected automatically."
            : "Update your interest answers. Your personality type updates automatically."}
        </div>

        {questionsLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
            Loading questions…
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="up-progress-bar-wrap">
              <div className="up-progress-label">
                Progress — {answeredCount} / {totalCount} Answered ({progressPct}%)
              </div>
              <div className="up-progress-track">
                <div
                  className="up-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
              {ANSWER_OPTIONS.map((opt, i) => (
                <span key={i} style={{ fontSize: "11px", color: "#64748b" }}>
                  <strong style={{ color: "#0d9488" }}>{i + 1}</strong> = {opt}
                </span>
              ))}
            </div>

            {/* Questions */}
            <div className="up-questions-list">
              {questions.map((q, idx) => {
                const selectedAnswer = answers[q.question];
                return (
                  <div key={idx} className="up-question-row">
                    <span className="up-question-text">{q.question}</span>
                    <div className="up-answer-dots">
                      {ANSWER_OPTIONS.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          title={opt}
                          className={`up-answer-dot ${
                            selectedAnswer === opt ? "up-answer-dot--selected" : ""
                          }`}
                          onClick={() => handleAnswer(q.question, i)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Auto-detected personality result — shown only after all questions answered */}
            {allAnswered && detectedPersonality && (
              <div style={{
                marginTop: "24px",
                padding: "16px 20px",
                background: "#f0fdf9",
                border: "1.5px solid #0d9488",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#0d9488",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#0f766e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Detected personality type
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 600, color: "#0d9488", marginTop: "2px" }}>
                    {detectedPersonality}
                  </div>
                </div>
              </div>
            )}

            {/* Hint while in progress */}
            {!allAnswered && (
              <div style={{ marginTop: "16px", fontSize: "13px", color: "#94a3b8", textAlign: "center" }}>
                Answer all {totalCount} questions to reveal your personality type
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="up-form-footer">
          {onClose && !creation && (
            <button type="button" className="up-btn-cancel" onClick={onClose}>
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="up-btn-primary"
            disabled={!isFormValid() || loading || questionsLoading}
          >
            {loading
              ? "Saving…"
              : creation
              ? "Complete Profile ✓"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LevelThreeModal;