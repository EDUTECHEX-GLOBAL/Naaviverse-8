import React, { useState, useEffect } from "react";
import axios from "axios";
import close from "../../images/close.svg";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LevelThreeModal = ({ onClose, onComplete, profileDataId, existingData }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [personality, setPersonality] = useState(existingData?.personality || "");

  useEffect(() => {
    fetchQuestions();
    if (profileDataId) {
      fetchExistingAnswers();
    }
  }, [profileDataId]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/personality/questions');
      setQuestions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchExistingAnswers = async () => {
    try {
      const response = await axios.get(`/api/userAnswers/get?userId=${profileDataId}`);
      const answerMap = {};
      response.data.forEach(item => {
        answerMap[item.question] = item.answer;
      });
      setAnswers(answerMap);
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };

  const handleAnswerSelect = (question, answerIndex) => {
    const answerOptions = ["Dislike", "Slightly Dislike", "Neutral", "Slightly Enjoy", "Enjoy"];
    setAnswers(prev => ({
      ...prev,
      [question]: answerOptions[answerIndex]
    }));
  };

  const handlePersonalitySelect = (value) => {
    setPersonality(value);
  };

  const handleSubmit = async () => {
    // Check if all questions answered
    if (questions.length > 0 && Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions");
      return;
    }

    if (!personality) {
      toast.error("Please select your personality type");
      return;
    }

    setLoading(true);

    try {
      // Save all answers
      for (const question of questions) {
        if (answers[question.question]) {
          await axios.post('/api/userAnswers/add', {
            userId: profileDataId,
            question: question.question,
            answer: answers[question.question]
          });
        }
      }

      // Save personality
      const response = await axios.put(`${BASE_URL}/api/users/addPersonality`, {
        userId: profileDataId,
        personality: personality
      });

      if (response.data?.status) {
        toast.success("Level 3 completed successfully!");
        onComplete();
      } else {
        toast.error("Failed to save personality");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const personalityTypes = ["realistic", "investigative", "artistic", "social", "enterprising", "conventional"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Level 3 - Personality & Interests</h2>
          <div className="close-btn" onClick={onClose}>
            <img src={close} alt="close" />
          </div>
        </div>
        
        <div className="modal-body">
          {loadingQuestions ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading questions...</div>
          ) : (
            <>
              {/* Personality Assessment Progress */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Personality Assessment</span>
                  <span>{answeredCount} / {totalQuestions} answered</span>
                </div>
                <div style={{ height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, #4361ee, #4cc9f0)',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Questions */}
              <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '24px' }}>
                {questions.map((q, index) => (
                  <div key={index} style={{ 
                    marginBottom: '16px', 
                    padding: '16px', 
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef'
                  }}>
                    <p style={{ marginBottom: '12px', fontWeight: 500 }}>{q.question}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[1, 2, 3, 4, 5].map(num => {
                        const answerText = ["Dislike", "Slightly Dislike", "Neutral", "Slightly Enjoy", "Enjoy"][num-1];
                        const isSelected = answers[q.question] === answerText;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleAnswerSelect(q.question, num-1)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              border: isSelected ? '2px solid #4361ee' : '2px solid #e9ecef',
                              background: isSelected ? '#4361ee' : 'white',
                              color: isSelected ? 'white' : '#6c757d',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Personality Type Selection */}
              <div className="form-group">
                <label>Select Your Personality Type *</label>
                <div className="options-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  {personalityTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`option-btn ${personality === type ? 'selected' : ''}`}
                      onClick={() => handlePersonalitySelect(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={loading || answeredCount < totalQuestions || !personality}
          >
            {loading ? "Saving..." : "Complete Level 3"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelThreeModal;