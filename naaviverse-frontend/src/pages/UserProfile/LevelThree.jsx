import React, { useEffect, useState } from "react";
import close from "../../images/close.svg";
import axios from "axios";
import styles from "./level3.module.scss";

const LevelThree = ({
  profileData,
  createLevelThree,
  setCreateLevelThree,
  handleProfileData,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingSaveAnswer, setLoadingSaveAnswer] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const answrOptions = [
    "Dislike",
    "Slightly Dislike",
    "Neutral",
    "Slightly Enjoy",
    "Enjoy",
  ];

  // State to track selected answers for all questions
  const [selectedAnswers, setSelectedAnswers] = useState(Array(48).fill(null));

 useEffect(() => {
  setLoading(true);
  axios.get('/api/personality/questions')
    .then(({ data }) => {
      setAllQuestions(data.data);
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, []);

useEffect(() => {
  if (allQuestions.length && profileData?._id) {
    getAllAnswers();
  }
}, [allQuestions, profileData?._id]);


  const getAllAnswers = () => {
    axios
      .get(`/api/userAnswers/get?userId=${profileData?._id}`)
      .then(({ data }) => {
        const answers = Array(48).fill(null);
        data.forEach((answer) => {
          const index = allQuestions.findIndex((q) => q.question === answer.question);
          if (index !== -1) answers[index] = answer.answer;
        });
        setSelectedAnswers(answers);
        setTotalAnswered(answers.filter((answer) => answer !== null).length);
      })
      .catch((error) => {
        console.error("Error fetching answers:", error);
      });
  };

  const saveAnswer = (question, answerId) => {
    if (loadingSaveAnswer) return; // Prevent multiple clicks
    setLoadingSaveAnswer(true);

    axios
      .post(`/api/userAnswers/add`, {
        userId: profileData?._id,
        question: question.question,
        answer: answrOptions[answerId],
      })
      .then(({ data }) => {
        if (data.status) {
          const updatedAnswers = [...selectedAnswers];
          updatedAnswers[allQuestions.indexOf(question)] = answrOptions[answerId];
          setSelectedAnswers(updatedAnswers);

          setTotalAnswered(updatedAnswers.filter((answer) => answer !== null).length);
        }
      })
      .finally(() => {
        setLoadingSaveAnswer(false); // Reset loading state
      });
  };

 const handleSubmit = async () => {
  for (let i = 0; i < selectedAnswers.length; i++) {
    if (selectedAnswers[i]) {
      await axios.post('/api/userAnswers/add', {
        userId: profileData._id,
        question: allQuestions[i].question,
        answer: selectedAnswers[i],
      });
    }
  }
  addPersonality();
};


  const addPersonality = () => {
    axios.put(`/api/users/addPersonality`, {
      userId: profileData?._id,
      personality: "realistic",
    }).then(({ data }) => {
      if (data.status) {
        handleProfileData();
        setCreateLevelThree(false);
      }
    });
  };

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
          <div>Loading...</div>
        ) : (
          <>
            <div className={styles.progressText}>
              Test Progress: {totalAnswered} / 48
            </div>
            <div className={styles.level3Section}>
              {allQuestions.map((item, index) => (
                <div key={index} className={styles.singleQuestionWrapper}>
                  <div>{item.question}</div>
                  <div style={{ display: "flex", gap: "20px" }}>
                    {answrOptions.map((option, answerIndex) => (
                      <div
                        key={answerIndex}
                        className={
                          selectedAnswers[index] === option
                            ? styles.answerCircleSelected
                            : styles.answerCircle
                        }
                        onClick={() => saveAnswer(item, answerIndex)}
                      >
                        {answerIndex + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={handleSubmit}
                style={{ marginTop: "20px" }}
                disabled={totalAnswered !== 48} // Disable if not all questions are answered
              >
                Submit All Answers
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LevelThree;
