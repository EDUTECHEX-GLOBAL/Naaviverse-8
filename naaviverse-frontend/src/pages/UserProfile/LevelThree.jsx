import React, { useEffect, useState } from "react";
import close from "../../images/close.svg";
import axios from "axios";
import styles from "./level3.module.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ─── RIASEC Scoring ───────────────────────────────────────────────────────────
//
// The 48 questions are split into 6 RIASEC personality groups (8 per group).
// Questions 0–7   → Realistic
// Questions 8–15  → Investigative
// Questions 16–23 → Artistic
// Questions 24–31 → Social
// Questions 32–39 → Enterprising
// Questions 40–47 → Conventional
//
// Each answer maps to a score:
//   Dislike = 1, Slightly Dislike = 2, Neutral = 3, Slightly Enjoy = 4, Enjoy = 5
//
// The personality type with the highest total score wins.
// ─────────────────────────────────────────────────────────────────────────────

const RIASEC_TYPES = [
  "realistic",
  "investigative",
  "artistic",
  "social",
  "enterprising",
  "conventional",
];

const ANSWER_SCORE = {
  "Dislike": 1,
  "Slightly Dislike": 2,
  "Neutral": 3,
  "Slightly Enjoy": 4,
  "Enjoy": 5,
};

/**
 * Given the full array of 48 answers (strings or null),
 * calculates a score for each RIASEC type and returns the winning type.
 */
const calculatePersonality = (answers) => {
  const scores = { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 };
  const groupSize = 8; // 48 questions / 6 types

  answers.forEach((answer, index) => {
    if (!answer) return;
    const score = ANSWER_SCORE[answer] || 0;
    const typeIndex = Math.floor(index / groupSize);
    const type = RIASEC_TYPES[typeIndex];
    if (type) scores[type] += score;
  });

  // Return the type with the highest score
  return Object.entries(scores).reduce((best, [type, score]) =>
    score > best[1] ? [type, score] : best, ["realistic", -1]
  )[0];
};

// ─── Component ────────────────────────────────────────────────────────────────

const LevelThree = ({
  profileData,
  createLevelThree,
  setCreateLevelThree,
  handleProfileData,
  profileDataId,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingSaveAnswer, setLoadingSaveAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState(Array(48).fill(null));
  const [totalAnswered, setTotalAnswered] = useState(0);

  // Auto-calculated personality — shown live as user answers
  const [calculatedPersonality, setCalculatedPersonality] = useState("");

  const answrOptions = ["Dislike", "Slightly Dislike", "Neutral", "Slightly Enjoy", "Enjoy"];

  // ── Fetch questions ──────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/api/personality/questions`)
      .then(({ data }) => {
        setAllQuestions(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Fetch existing answers if any ────────────────────────────────────────
  useEffect(() => {
    const uid = profileData?._id || profileDataId;
    if (allQuestions.length && uid) {
      axios
        .get(`${BASE_URL}/api/userAnswers/get?userId=${uid}`)
        .then(({ data }) => {
          const answers = Array(48).fill(null);
          (data.data || data).forEach((answer) => {
            const index = allQuestions.findIndex((q) => q.question === answer.question);
            if (index !== -1) answers[index] = answer.answer;
          });
          setSelectedAnswers(answers);
          const answered = answers.filter((a) => a !== null).length;
          setTotalAnswered(answered);
          // Calculate personality from existing answers
          if (answered > 0) {
            setCalculatedPersonality(calculatePersonality(answers));
          }
        })
        .catch((err) => console.error("Error fetching answers:", err));
    }
  }, [allQuestions, profileData?._id, profileDataId]);

  // ── Save answer immediately on click + recalculate personality ───────────
  const saveAnswer = (question, answerIndex) => {
    if (loadingSaveAnswer) return;
    setLoadingSaveAnswer(true);

    const uid = profileData?._id || profileDataId;
    const answerText = answrOptions[answerIndex];
    const qIndex = allQuestions.indexOf(question);

    // Optimistically update UI first
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[qIndex] = answerText;
    setSelectedAnswers(updatedAnswers);

    const answered = updatedAnswers.filter((a) => a !== null).length;
    setTotalAnswered(answered);

    // Recalculate personality automatically from all current answers
    const newPersonality = calculatePersonality(updatedAnswers);
    setCalculatedPersonality(newPersonality);

    // Save to backend
    axios
      .post(`${BASE_URL}/api/userAnswers/add`, {
        userId: uid,
        question: question.question,
        answer: answerText,
      })
      .catch((err) => {
        console.error("saveAnswer error:", err);
        // Rollback on failure
        const rolledBack = [...updatedAnswers];
        rolledBack[qIndex] = null;
        setSelectedAnswers(rolledBack);
        setTotalAnswered(rolledBack.filter((a) => a !== null).length);
        setCalculatedPersonality(calculatePersonality(rolledBack));
      })
      .finally(() => setLoadingSaveAnswer(false));
  };

  // ── Submit — personality is already calculated, just save it ─────────────
  const handleSubmit = () => {
    if (totalAnswered < 48) return;
    setSubmitting(true);

    const uid = profileData?._id || profileDataId;
    const finalPersonality = calculatePersonality(selectedAnswers);

    axios
      .put(`${BASE_URL}/api/users/addPersonality`, {
        userId: uid,
        personality: finalPersonality,
      })
      .then(({ data }) => {
        if (data.status) {
          handleProfileData();
          setCreateLevelThree(false);
        }
      })
      .catch((err) => console.error("addPersonality error:", err))
      .finally(() => setSubmitting(false));
  };

  const allAnswered = totalAnswered === 48;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="popularS1">
      <div className="head-txt">
        <div>Naavi Profile Level Three</div>
        <div onClick={() => setCreateLevelThree(false)} className="close-div">
          <img src={close} alt="" />
        </div>
      </div>

      <div className="overall-div">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#718096" }}>
            Loading questions...
          </div>
        ) : (
          <>
            {/* ── Progress ── */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                marginBottom: "8px", fontSize: "14px",
              }}>
                <span className={styles.progressText}>
                  Progress: {totalAnswered} / 48
                </span>
                {/* Live personality result */}
                {calculatedPersonality && (
                  <span style={{
                    fontSize: "13px", fontWeight: "600",
                    color: "#29449d",
                    background: "#eef2ff",
                    padding: "2px 12px",
                    borderRadius: "20px",
                    border: "1px solid #c7d2fe",
                  }}>
                    {calculatedPersonality.charAt(0).toUpperCase() + calculatedPersonality.slice(1)}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div style={{
                height: "8px", background: "#e9ecef",
                borderRadius: "4px", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${(totalAnswered / 48) * 100}%`,
                  background: "linear-gradient(90deg, #47b4d5, #29449d)",
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>

            {/* ── Instruction note ── */}
            <div style={{
              padding: "10px 14px", marginBottom: "20px",
              background: "#f0f7ff", borderRadius: "10px",
              border: "1px solid #bfdbfe",
              fontSize: "13px", color: "#1e40af",
            }}>
              Rate each activity from 1 (Dislike) to 5 (Enjoy). Your personality type will be determined automatically from your answers.
            </div>

            {/* ── Answer scale legend ── */}
            <div style={{
              display: "flex", justifyContent: "flex-end",
              gap: "12px", marginBottom: "12px",
            }}>
              {answrOptions.map((opt, i) => (
                <span key={i} style={{ fontSize: "11px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: "#e9ecef", display: "inline-flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: "600", color: "#6b7280",
                  }}>{i + 1}</span>
                  {opt}
                </span>
              ))}
            </div>

            {/* ── Questions ── */}
            <div className={styles.level3Section}>
              {allQuestions.map((item, index) => (
                <div key={index} className={styles.singleQuestionWrapper}>
                  <div style={{ fontSize: "14px", color: "#1F304F" }}>
                    {item.question}
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {answrOptions.map((option, answerIndex) => (
                      <div
                        key={answerIndex}
                        className={
                          selectedAnswers[index] === option
                            ? styles.answerCircleSelected
                            : styles.answerCircle
                        }
                        onClick={() => !loadingSaveAnswer && saveAnswer(item, answerIndex)}
                        style={{ cursor: loadingSaveAnswer ? "not-allowed" : "pointer" }}
                      >
                        {answerIndex + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Auto-detected personality result card (shown when all answered) ── */}
            {allAnswered && calculatedPersonality && (
              <div style={{
                margin: "24px 0 16px",
                padding: "20px 24px",
                background: "linear-gradient(135deg, #eef2ff 0%, #e0f2fe 100%)",
                borderRadius: "14px",
                border: "1px solid #c7d2fe",
                display: "flex", alignItems: "center", gap: "16px",
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #47b4d5, #29449d)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", flexShrink: 0,
                }}>
                  {{"realistic": "🔧", "investigative": "🔬", "artistic": "🎨", "social": "🤝", "enterprising": "🚀", "conventional": "📋"}[calculatedPersonality]}
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: "600", marginBottom: "2px" }}>
                    YOUR PERSONALITY TYPE
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "#1e3a8a" }}>
                    {calculatedPersonality.charAt(0).toUpperCase() + calculatedPersonality.slice(1)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    Calculated automatically from your answers
                  </div>
                </div>
              </div>
            )}

            {/* ── Submit button ── */}
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: allAnswered
                  ? "linear-gradient(89deg, #47b4d5, #29449d)"
                  : "#e9ecef",
                color: allAnswered ? "#fff" : "#9ca3af",
                fontWeight: "700",
                fontSize: "15px",
                cursor: allAnswered ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                marginBottom: "8px",
              }}
            >
              {submitting
                ? "Saving..."
                : !allAnswered
                ? `Answer all questions (${totalAnswered}/48 done)`
                : "Complete Level 3"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LevelThree;