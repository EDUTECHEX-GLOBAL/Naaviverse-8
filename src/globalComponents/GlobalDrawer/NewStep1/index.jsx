import React, { useContext, useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useStore } from "../../../components/store/store.ts";
import { useCoinContextData } from "../../../context/CoinContext";
import arrow from "../../../pages/accDashbaoard/arrow.svg";
import trash from "../../../pages/accDashbaoard/trash.svg";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const NewStep1 = ({ pathId, onSuccess }) => {
  const userDetails = JSON.parse(localStorage.getItem("partner"));
//  useEffect(() => {
//   if (!pathId) {
//     toast.error("Please open a Path before creating a Step");
//   }
// }, [pathId]);


  const { setaccsideNav, setispopular } = useStore();
  const {
    setMypathsMenu,
    servicesToggle,
    setServicesToggle,
    allServices,
    setAllServices,
  } = useCoinContextData();

  const [loading, setLoading] = useState(false);
 const [step, setStep] = useState("step1");
  const [stepForm, setStepForm] = useState({
    email: userDetails?.email,
    name: "",
    description: "",
    microDescription: "",
    nanoDescription: "",
    cost: "",
    gradeData: [
      {
        grade: "9",
        description: "",
      },
      {
        grade: "10",
        description: "",
      },
      {
        grade: "11",
        description: "",
      },
      {
        grade: "12",
        description: "",
      },
    ],
    curriculumData: [
      {
        curriculum: "IB",
        description: "",
      },
      {
        curriculum: "IGCSE",
        description: "",
      },
      {
        curriculum: "CBSE",
        description: "",
      },
      {
        curriculum: "ICSE",
        description: "",
      },
      {
        curriculum: "Nordic",
        description: "",
      },
    ],
    financialData: [
      {
        financialSituation: "0-25L",
        description: "",
      },
      {
        financialSituation: "25L-75L",
        description: "",
      },
      {
        financialSituation: "75L-3CR",
        description: "",
      },
      {
        financialSituation: "3CR+",
        description: "",
      },
      {
        financialSituation: "other",
        description: "",
      },
    ],
    streamData: [
      {
        stream: "MPC",
        description: "",
      },
      {
        stream: "BIPC",
        description: "",
      },
      {
        stream: "CEC",
        description: "",
      },
      {
        stream: "MEC",
        description: "",
      },
      {
        stream: "HEC",
        description: "",
      },
    ],
    gradePointAverageData: [
      {
        gradePointAverage: "0% - 35%",
        description: "",
      },
      {
        gradePointAverage: "36% - 60%",
        description: "",
      },
      {
        gradePointAverage: "61% - 75%",
        description: "",
      },
      {
        gradePointAverage: "76% - 85%",
        description: "",
      },
      {
        gradePointAverage: "86% - 95%",
        description: "",
      },
      {
        gradePointAverage: "96% - 100%",
        description: "",
      },
    ],
    personalityData: [
      {
        personality: "realistic",
        description: "",
      },
      {
        personality: "investigative",
        description: "",
      },
      {
        personality: "artistic",
        description: "",
      },
      {
        personality: "social",
        description: "",
      },
      {
        personality: "enterprising",
        description: "",
      },
      {
        personality: "conventional",
        description: "",
      },
    ],
    other_data: {},
    length: "",
  });

  useEffect(() => {
    if (userDetails) {
      setStepForm((prev) => {
        return {
          ...prev,
          email: userDetails?.email,
        };
      });
    }
  }, []);

  const myTimeout = () => {
    setTimeout(reload, 3000);
  };

  function reload() {
    setispopular(false);
    
    setStepForm({
      email: userDetails?.email,
      name: "",
      description: "",
      cost: "",
      gradeData: [
        {
          grade: "9",
          description: "",
        },
        {
          grade: "10",
          description: "",
        },
        {
          grade: "11",
          description: "",
        },
        {
          grade: "12",
          description: "",
        },
      ],
      curriculumData: [
        {
          curriculum: "IB",
          description: "",
        },
        {
          curriculum: "IGCSE",
          description: "",
        },
        {
          curriculum: "CBSE",
          description: "",
        },
        {
          curriculum: "ICSE",
          description: "",
        },
        {
          curriculum: "Nordic",
          description: "",
        },
      ],
      financialData: [
        {
          financialSituation: "0-25L",
          description: "",
        },
        {
          financialSituation: "25L-75L",
          description: "",
        },
        {
          financialSituation: "75L-3CR",
          description: "",
        },
        {
          financialSituation: "3CR+",
          description: "",
        },
        {
          financialSituation: "other",
          description: "",
        },
      ],
      streamData: [
        {
          stream: "MPC",
          description: "",
        },
        {
          stream: "BIPC",
          description: "",
        },
        {
          stream: "CEC",
          description: "",
        },
        {
          stream: "MEC",
          description: "",
        },
        {
          stream: "HEC",
          description: "",
        },
      ],
      gradePointAverageData: [
        {
          gradePointAverage: "0% - 35%",
          description: "",
        },
        {
          gradePointAverage: "36% - 60%",
          description: "",
        },
        {
          gradePointAverage: "61% - 75%",
          description: "",
        },
        {
          gradePointAverage: "76% - 85%",
          description: "",
        },
        {
          gradePointAverage: "86% - 95%",
          description: "",
        },
        {
          gradePointAverage: "96% - 100%",
          description: "",
        },
      ],
      personalityData: [
        {
          personality: "realistic",
          description: "",
        },
        {
          personality: "investigative",
          description: "",
        },
        {
          personality: "artistic",
          description: "",
        },
        {
          personality: "social",
          description: "",
        },
        {
          personality: "enterprising",
          description: "",
        },
        {
          personality: "conventional",
          description: "",
        },
      ],
      other_data: {},
      length: "",
    });
    setaccsideNav("Paths");
    setMypathsMenu("Steps");
    setStep("");
  }

const createNewStep = () => {
  if (!pathId) {
    toast.error("Please open a Path before creating a Step");
    return;
  }

  const localUser = JSON.parse(localStorage.getItem("partner"));
  if (!localUser?.email) {
    toast.error("User not found");
    return;
  }

  setLoading(true);

  const payload = {
    ...stepForm,
    email: localUser.email,
    path_id: pathId,

    macro_description: stepForm.description,
    micro_description: stepForm.microDescription,
    nano_description: stepForm.nanoDescription,
  };

  delete payload.microDescription;
  delete payload.nanoDescription;

  console.log("🚀 STEP CREATE PAYLOAD:", payload);

  axios
    .post(`${BASE_URL}/api/steps/add`, payload)
    .then((res) => {
      if (res?.data?.status) {
        setStep("success");
        onSuccess?.(); // refresh PathPage
      } else {
        toast.error(res?.data?.message || "Failed to create step");
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error("Error creating step");
    })
    .finally(() => setLoading(false));
};





useEffect(() => {
  if (!userDetails?.email) return;

  // OPTIONAL: only fetch when services UI is enabled
  if (!servicesToggle) return;

  axios
    .get(`${BASE_URL}/api/services/get?productcreatoremail=${userDetails.email}`)
    .then((res) => {
      setAllServices(res?.data?.data || []);
    })
    .catch(() => {
      console.log("Services API not available – skipping");
    });
}, [servicesToggle]);


  const removeStep = (stepId) => {
    // Find the key corresponding to the value stepId
    const keyToRemove = Object.keys(stepForm?.other_data).find(
      (key) => stepForm?.other_data[key] === stepId
    );

    if (!keyToRemove) {
      // If the key is not found, do nothing
      return;
    }

    // Remove the key from other_data
    const { [keyToRemove]: removedKey, ...restOtherData } =
      stepForm?.other_data;

    // Reorder the remaining keys
    const reorderedOtherData = Object.keys(restOtherData).reduce(
      (acc, key, index) => ({
        ...acc,
        [`productid${index + 1}`]: restOtherData[key],
      }),
      {}
    );

    // Update the state with the modified other_data
    setStepForm({
      ...stepForm,
      other_data: reorderedOtherData,
    });
  };

  const handleDescriptionChangeGrade = (grade, value) => {
    setStepForm((prevStepForm) => {
      const updatedGradeData = prevStepForm.gradeData.map((item) =>
        item.grade === grade ? { ...item, description: value } : item
      );
      return { ...prevStepForm, gradeData: updatedGradeData };
    });
  };

  const handleDescriptionChangeGradePoint = (gradePointAverage, value) => {
    setStepForm((prevStepForm) => {
      const updatedGradePointData = prevStepForm.gradePointAverageData.map(
        (item) =>
          item.gradePointAverage === gradePointAverage
            ? { ...item, description: value }
            : item
      );
      return { ...prevStepForm, gradePointAverageData: updatedGradePointData };
    });
  };

  const handleDescriptionChangeCurriculum = (curriculum, value) => {
    setStepForm((prevStepForm) => {
      const updatedCurriculumData = prevStepForm.curriculumData.map((item) =>
        item.curriculum === curriculum ? { ...item, description: value } : item
      );
      return { ...prevStepForm, curriculumData: updatedCurriculumData };
    });
  };

  const handleDescriptionStream = (stream, value) => {
    setStepForm((prevStepForm) => {
      const updatedStreamData = prevStepForm.streamData.map((item) =>
        item.stream === stream ? { ...item, description: value } : item
      );
      return { ...prevStepForm, streamData: updatedStreamData };
    });
  };

  const handleDescriptionFinancial = (financialSituation, value) => {
    setStepForm((prevStepForm) => {
      const updatedFinancialData = prevStepForm.financialData.map((item) =>
        item.financialSituation === financialSituation
          ? { ...item, description: value }
          : item
      );
      return { ...prevStepForm, financialData: updatedFinancialData };
    });
  };

  const handleDescriptionPersonality = (personality, value) => {
    setStepForm((prevStepForm) => {
      const updatedPersonalityData = prevStepForm.personalityData.map((item) =>
        item.personality === personality
          ? { ...item, description: value }
          : item
      );
      return { ...prevStepForm, personalityData: updatedPersonalityData };
    });
  };

  const getContent = () => {
    switch (step) {
      case "success":
        return (
          <div
            className="newConglomerate"
            style={{
              height: "calc(100% - 4rem)",
              padding: "0",
            }}
          >
            <div className="succesView">
              <div className="labelItm" style={{ textAlign: "center" }}>
                You Have Successfully Created A New Step.
              </div>
            </div>
          </div>
        );

      case "step2":
        return (
          <>
            <div
              className="newConglomerate"
              style={{ height: "calc(100% - 2rem)", padding: "0" }}
            >
              <Scrollbars
                className="scrollForm"
                renderTrackHorizontal={() => <div />}
                renderThumbHorizontal={() => <div />}
                renderTrackVertical={() => <div />}
                renderThumbVertical={() => <div />}
              >
                {stepForm?.gradeData.map((item) => (
                  <div key={item?.grade}>
                    <div className="name">
                      Description for grade: {item?.grade}
                    </div>
<textarea
  type="text"
  className="text-textarea"
  placeholder="Enter instructions..."
  rows="5"
  cols="40"
  spellCheck={false}
  value={item.description}
  onChange={(e) =>
    handleDescriptionChangeGrade(item.grade, e.target.value)
  }
/>


                  </div>
                ))}
                <div className="space"></div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    opacity: stepForm.gradeData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "1"
                      : "0.5",
                    cursor: stepForm.gradeData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "pointer"
                      : "not-allowed",
                    marginBottom: "0",
                    minHeight: "50px",
                  }}
                  onClick={() => {
                    // Check if all textarea values are not empty
                    const allDescriptionsFilled = stepForm.gradeData.every(
                      (item) => item.description.trim() !== ""
                    );

                    if (allDescriptionsFilled) {
                      setStep("step3");
                      // console.log(stepForm?.gradeData, "stepForm?.gradeData");
                    }
                  }}
                >
                  Next Step
                </div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    background: "white",
                    color: "#1f304f",
                    border: "1px solid #e5e5e5",
                    minHeight: "50px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setStep("step1");
                    setStepForm((prev) => {
                      return {
                        ...prev,
                        gradeData: [
                          {
                            grade: "9",
                            description: "",
                          },
                          {
                            grade: "10",
                            description: "",
                          },
                          {
                            grade: "11",
                            description: "",
                          },
                          {
                            grade: "12",
                            description: "",
                          },
                        ],
                      };
                    });
                  }}
                >
                  Go Back
                </div>
              </Scrollbars>
            </div>
          </>
        );

      case "step3":
        return (
          <>
            <div
              className="newConglomerate"
              style={{
                height: "calc(100% - 2rem)",
                padding: "0",
              }}
            >
              <Scrollbars
                className="scrollForm"
                renderTrackHorizontal={() => <div />}
                renderThumbHorizontal={() => <div />}
                renderTrackVertical={() => <div />}
                renderThumbVertical={() => <div />}
              >
                {stepForm?.gradePointAverageData.map((item) => (
                  <div key={item.gradePointAverage}>
                    <div className="name">
                      Description for grade point avg: {item.gradePointAverage}
                    </div>
                    <textarea
                      type="text"
                      className="text-textarea"
                      placeholder="Enter instructions..."
                      rows="5"
                      cols="40"
                      spellCheck="false"
                      value={item.description}
                      onChange={(e) =>
                        handleDescriptionChangeGradePoint(
                          item.gradePointAverage,
                          e.target.value
                        )
                      }
                    ></textarea>
                  </div>
                ))}

                <div className="space"></div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    opacity: stepForm.gradePointAverageData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "1"
                      : "0.5",
                    cursor: stepForm.gradePointAverageData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "pointer"
                      : "not-allowed",
                    marginBottom: "0",
                    minHeight: "50px",
                  }}
                  onClick={() => {
                    // Check if all textarea values are not empty
                    const allDescriptionsFilled =
                      stepForm.gradePointAverageData.every(
                        (item) => item.description.trim() !== ""
                      );

                    if (allDescriptionsFilled) {
                      setStep("step4");
                      // console.log(
                      //   stepForm?.gradePointAverageData,
                      //   "stepForm?.gradePointAverageData"
                      // );
                    }
                  }}
                >
                  Next Step
                </div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    background: "white",
                    color: "#1f304f",
                    border: "1px solid #e5e5e5",
                    minHeight: "50px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setStep("step2");
                    setStepForm((prev) => {
                      return {
                        ...prev,
                        gradePointAverageData: [
                          {
                            gradePointAverage: "0% - 35%",
                            description: "",
                          },
                          {
                            gradePointAverage: "36% - 60%",
                            description: "",
                          },
                          {
                            gradePointAverage: "61% - 75%",
                            description: "",
                          },
                          {
                            gradePointAverage: "76% - 85%",
                            description: "",
                          },
                          {
                            gradePointAverage: "86% - 95%",
                            description: "",
                          },
                          {
                            gradePointAverage: "96% - 100%",
                            description: "",
                          },
                        ],
                      };
                    });
                  }}
                >
                  Go Back
                </div>
              </Scrollbars>
            </div>
          </>
        );

      case "step4":
        return (
          <>
            <div
              className="newConglomerate"
              style={{
                height: "calc(100% - 2rem)",
                padding: "0",
              }}
            >
              <Scrollbars
                className="scrollForm"
                renderTrackHorizontal={() => <div />}
                renderThumbHorizontal={() => <div />}
                renderTrackVertical={() => <div />}
                renderThumbVertical={() => <div />}
              >
                {stepForm?.curriculumData.map((item) => (
                  <div key={item.curriculum}>
                    <div className="name">
                      Description for curriculum: {item.curriculum}
                    </div>
                    <textarea
                      type="text"
                      className="text-textarea"
                      placeholder="Enter instructions..."
                      rows="5"
                      cols="40"
                      spellCheck="false"
                      value={item.description}
                      onChange={(e) =>
                        handleDescriptionChangeCurriculum(
                          item.curriculum,
                          e.target.value
                        )
                      }
                    ></textarea>
                  </div>
                ))}

                <div className="space"></div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    opacity: stepForm.curriculumData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "1"
                      : "0.5",
                    cursor: stepForm.curriculumData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "pointer"
                      : "not-allowed",
                    marginBottom: "0",
                    minHeight: "50px",
                  }}
                  onClick={() => {
                    // Check if all textarea values are not empty
                    const allDescriptionsFilled = stepForm.curriculumData.every(
                      (item) => item.description.trim() !== ""
                    );

                    if (allDescriptionsFilled) {
                      setStep("step5");
                      // console.log(
                      //   stepForm?.curriculumData,
                      //   "stepForm?.curriculumData"
                      // );
                    }
                  }}
                >
                  Next Step
                </div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    background: "white",
                    color: "#1f304f",
                    border: "1px solid #e5e5e5",
                    minHeight: "50px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setStep("step3");
                    setStepForm((prev) => {
                      return {
                        ...prev,
                        curriculumData: [
                          {
                            curriculum: "IB",
                            description: "",
                          },
                          {
                            curriculum: "IGCSE",
                            description: "",
                          },
                          {
                            curriculum: "CBSE",
                            description: "",
                          },
                          {
                            curriculum: "ICSE",
                            description: "",
                          },
                          {
                            curriculum: "Nordic",
                            description: "",
                          },
                        ],
                      };
                    });
                  }}
                >
                  Go Back
                </div>
              </Scrollbars>
            </div>
          </>
        );

      case "step5":
        return (
          <>
            <div
              className="newConglomerate"
              style={{
                height: "calc(100% - 2rem)",
                padding: "0",
              }}
            >
              <Scrollbars
                className="scrollForm"
                renderTrackHorizontal={() => <div />}
                renderThumbHorizontal={() => <div />}
                renderTrackVertical={() => <div />}
                renderThumbVertical={() => <div />}
              >
                {stepForm?.streamData.map((item) => (
                  <div key={item.stream}>
                    <div className="name">
                      Description for stream: {item.stream}
                    </div>
                    <textarea
                      type="text"
                      className="text-textarea"
                      placeholder="Enter instructions..."
                      rows="5"
                      cols="40"
                      spellCheck="false"
                      value={item.description}
                      onChange={(e) =>
                        handleDescriptionStream(item.stream, e.target.value)
                      }
                    ></textarea>
                  </div>
                ))}

                <div className="space"></div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    opacity: stepForm.streamData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "1"
                      : "0.5",
                    cursor: stepForm.streamData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "pointer"
                      : "not-allowed",
                    marginBottom: "0",
                    minHeight: "50px",
                  }}
                  onClick={() => {
                    // Check if all textarea values are not empty
                    const allDescriptionsFilled = stepForm.streamData.every(
                      (item) => item.description.trim() !== ""
                    );

                    if (allDescriptionsFilled) {
                      setStep("step6");
                      // console.log(stepForm?.streamData, "stepForm?.streamData");
                    }
                  }}
                >
                  Next Step
                </div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    background: "white",
                    color: "#1f304f",
                    border: "1px solid #e5e5e5",
                    minHeight: "50px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setStep("step4");
                    setStepForm((prev) => {
                      return {
                        ...prev,
                        streamData: [
                          {
                            stream: "MPC",
                            description: "",
                          },
                          {
                            stream: "BIPC",
                            description: "",
                          },
                          {
                            stream: "CEC",
                            description: "",
                          },
                          {
                            stream: "MEC",
                            description: "",
                          },
                          {
                            stream: "HEC",
                            description: "",
                          },
                        ],
                      };
                    });
                  }}
                >
                  Go Back
                </div>
              </Scrollbars>
            </div>
          </>
        );

      case "step6":
        return (
          <>
            <div
              className="newConglomerate"
              style={{
                height: "calc(100% - 2rem)",
                padding: "0",
              }}
            >
              <Scrollbars
                className="scrollForm"
                renderTrackHorizontal={() => <div />}
                renderThumbHorizontal={() => <div />}
                renderTrackVertical={() => <div />}
                renderThumbVertical={() => <div />}
              >
                {stepForm?.financialData.map((item) => (
                  <div key={item.financialSituation}>
                    <div className="name">
                      Description for financial situation:{" "}
                      {item.financialSituation === "0-25L"
                        ? "0-25 Lakhs"
                        : item.financialSituation === "25L-75L"
                        ? "25 Lakhs - 75 Lakhs"
                        : item.financialSituation === "75L-3CR"
                        ? "75 Lakhs - 3 CR"
                        : item.financialSituation === "3CR+"
                        ? "3 CR+"
                        : "Other"}
                    </div>
                    <textarea
                      type="text"
                      className="text-textarea"
                      placeholder="Enter instructions..."
                      rows="5"
                      cols="40"
                      spellCheck="false"
                      value={item.description}
                      onChange={(e) =>
                        handleDescriptionFinancial(
                          item.financialSituation,
                          e.target.value
                        )
                      }
                    ></textarea>
                  </div>
                ))}

                <div className="space"></div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    opacity: stepForm.financialData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "1"
                      : "0.5",
                    cursor: stepForm.financialData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "pointer"
                      : "not-allowed",
                    marginBottom: "0",
                    minHeight: "50px",
                  }}
                  onClick={() => {
                    // Check if all textarea values are not empty
                    const allDescriptionsFilled = stepForm.financialData.every(
                      (item) => item.description.trim() !== ""
                    );

                    if (allDescriptionsFilled) {
                      setStep("step7");
                      // console.log(
                      //   stepForm?.financialData,
                      //   "stepForm?.financialData"
                      // );
                    }
                  }}
                >
                  Next Step
                </div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    background: "white",
                    color: "#1f304f",
                    border: "1px solid #e5e5e5",
                    minHeight: "50px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setStep("step5");
                    setStepForm((prev) => {
                      return {
                        ...prev,
                        financialData: [
                          {
                            financialSituation: "0-25L",
                            description: "",
                          },
                          {
                            financialSituation: "25L-75L",
                            description: "",
                          },
                          {
                            financialSituation: "75L-3CR",
                            description: "",
                          },
                          {
                            financialSituation: "3CR+",
                            description: "",
                          },
                          {
                            financialSituation: "other",
                            description: "",
                          },
                        ],
                      };
                    });
                  }}
                >
                  Go Back
                </div>
              </Scrollbars>
            </div>
          </>
        );

      case "step7":
        return (
          <>
            <div
              className="newConglomerate"
              style={{
                height: "calc(100% - 2rem)",
                padding: "0",
              }}
            >
              <Scrollbars
                className="scrollForm"
                renderTrackHorizontal={() => <div />}
                renderThumbHorizontal={() => <div />}
                renderTrackVertical={() => <div />}
                renderThumbVertical={() => <div />}
              >
                {stepForm?.personalityData.map((item) => (
                  <div key={item.personality}>
                    <div className="name">
                      Description for personality:{" "}
                      <span
                        style={{
                          textTransform: "capitalize",
                          paddingLeft: "5px",
                        }}
                      >
                        {item.personality}
                      </span>
                    </div>
                    <textarea
                      type="text"
                      className="text-textarea"
                      placeholder="Enter instructions..."
                      rows="5"
                      cols="40"
                      spellCheck="false"
                      value={item.description}
                      onChange={(e) =>
                        handleDescriptionPersonality(
                          item.personality,
                          e.target.value
                        )
                      }
                    ></textarea>
                  </div>
                ))}

                <div className="space"></div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    opacity: stepForm.personalityData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "1"
                      : "0.5",
                    cursor: stepForm.personalityData.every(
                      (item) => item.description.trim() !== ""
                    )
                      ? "pointer"
                      : "not-allowed",
                    marginBottom: "0",
                    minHeight: "50px",
                  }}
                  onClick={() => {
                    // Check if all textarea values are not empty
                    const allDescriptionsFilled =
                      stepForm.personalityData.every(
                        (item) => item.description.trim() !== ""
                      );

                    if (allDescriptionsFilled) {
                      createNewStep();
                      // console.log(
                      //   stepForm?.personalityData,
                      //   "stepForm?.personalityData"
                      // );
                    }
                  }}
                >
                  Submit Step
                </div>
                <div
                  className="NextBtn"
                  style={{
                    width: "100%",
                    background: "white",
                    color: "#1f304f",
                    border: "1px solid #e5e5e5",
                    minHeight: "50px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setStep("step6");
                    setStepForm((prev) => {
                      return {
                        ...prev,
                        personalityData: [
                          {
                            personality: "realistic",
                            description: "",
                          },
                          {
                            personality: "investigative",
                            description: "",
                          },
                          {
                            personality: "artistic",
                            description: "",
                          },
                          {
                            personality: "social",
                            description: "",
                          },
                          {
                            personality: "enterprising",
                            description: "",
                          },
                          {
                            personality: "conventional",
                            description: "",
                          },
                        ],
                      };
                    });
                  }}
                >
                  Go Back
                </div>
              </Scrollbars>
            </div>
          </>
        );

      default:
        return (
          <>
            <div
              className="newConglomerate"
              style={{
                height: "calc(100% - 8rem)",
                padding: "0",
              }}
            >
              <Scrollbars
                className="scrollForm"
                renderTrackHorizontal={() => <div />}
                renderThumbHorizontal={() => <div />}
                renderTrackVertical={() => <div />}
                renderThumbVertical={() => <div />}
              >
                <div className="name">What is the name of this step?</div>
                <div className="inputWrap" style={{ maxHeight: "3.5rem" }}>
                  <input
                    type="text"
                    className="text"
                    placeholder="Name..."
                    onChange={(e) => {
                      setStepForm((prev) => {
                        return {
                          ...prev,
                          name: e.target.value,
                        };
                      });
                    }}
                    value={stepForm?.name}
                  />
                </div>

                <div className="name">How long does this step take?</div>
                <div className="inputWrap" style={{ maxHeight: "3.5rem" }}>
                  <input
                    type="number"
                    className="text"
                    placeholder="Days..."
                    onChange={(e) => {
                      setStepForm((prev) => {
                        return {
                          ...prev,
                          length: e.target.value,
                        };
                      });
                    }}
                    value={stepForm?.length}
                  />
                </div>

<div className="name">What is the instructions for the macro view?</div>

<textarea
  type="text"
  className="text-textarea"
  placeholder="Enter macro instructions..."
  rows="5"
  cols="40"
  spellCheck={false}
  onChange={(e) =>
    setStepForm((prev) => ({ ...prev, description: e.target.value }))
  }
  value={stepForm?.description}
/>

<div className="name">What is the instructions for the micro view?</div>

<textarea
  type="text"
  className="text-textarea"
  placeholder="Enter micro instructions..."
  rows="5"
  cols="40"
  spellCheck={false}
  onChange={(e) =>
    setStepForm((prev) => ({ ...prev, microDescription: e.target.value }))
  }
  value={stepForm?.microDescription}
/>

<div className="name">What is the instructions for the nano view?</div>

<textarea
  type="text"
  className="text-textarea"
  placeholder="Enter nano instructions..."
  rows="5"
  cols="40"
  spellCheck={false}
  onChange={(e) =>
    setStepForm((prev) => ({ ...prev, nanoDescription: e.target.value }))
  }
  value={stepForm?.nanoDescription}
/>
                <div className="name">What type of step is it?</div>
                <div
                  className="inputWrap"
                  style={{
                    maxHeight: "3.5rem",
                    margin: "20px 0 5px 0",
                    display: "flex",
                    paddingLeft: "2rem",
                    alignItems: "center",
                    cursor: "pointer",
                    fontWeight: stepForm?.cost === "paid" ? "500" : "300",
                    background:
                      stepForm?.cost === "paid"
                        ? "linear-gradient(90deg, #47b4d5 0.02%, #29449d 119.26%)"
                        : "",
                    color: stepForm?.cost === "paid" ? "white" : "",
                  }}
                  onClick={() => {
                    setStepForm((prev) => {
                      return {
                        ...prev,
                        cost: "paid",
                      };
                    });
                  }}
                >
                  Paid
                </div>
                <div
                  className="inputWrap"
                  style={{
                    maxHeight: "3.5rem",
                    margin: "5px 0 40px 0",
                    display: "flex",
                    paddingLeft: "2rem",
                    alignItems: "center",
                    cursor: "pointer",
                    fontWeight: stepForm?.cost === "free" ? "500" : "300",
                    background:
                      stepForm?.cost === "free"
                        ? "linear-gradient(90deg, #47b4d5 0.02%, #29449d 119.26%)"
                        : "",
                    color: stepForm?.cost === "free" ? "white" : "",
                  }}
                  onClick={() => {
                    setStepForm((prev) => {
                      return {
                        ...prev,
                        cost: "free",
                      };
                    });
                  }}
                >
                  Free
                </div>

                {/* <div className="name">Add services</div>
                <div
                  className="each-acc-addpath-field-input-addstep"
                  style={{ flexDirection: "column" }}
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setServicesToggle(!servicesToggle);
                    }}
                  >
                    <div
                      style={{
                        width: "85%",
                        cursor: "pointer",
                        paddingLeft: "1.5rem",
                        borderRadius: "35px",
                        opacity: "0.25",
                        fontSize: "1rem",
                        fontWeight: "500",
                        display: "flex",
                        height: "56px",
                        alignItems: "center",
                      }}
                    >
                      Click To Select
                    </div>
                    <div className="arrow-box-addstep">
                      <img
                        src={arrow}
                        alt=""
                        style={{
                          transform: servicesToggle ? "rotate(180deg)" : "",
                        }}
                      />
                    </div>
                  </div>
                  {/* <div
                    className="hidden-steps-addstep"
                    style={{ display: servicesToggle ? "flex" : "none" }}
                  >
                    {allServices?.map((e, i) => {
                      return (
                        <div
                          className="each-hidden-step-addstep"
                          key={i}
                          onClick={() => {
                            setStepForm((prev) => {
                              const productId = `productid${
                                Object.keys(prev?.other_data).length + 1
                              }`;
                              return {
                                ...prev,
                                other_data: {
                                  ...prev?.other_data,
                                  [productId]: e?.product_id,
                                },
                              };
                            });
                            setServicesToggle(false);
                          }}
                        >
                          <div className="stepp-textt-addstep">
                            <div>{e?.name}</div>
                              {/* <div>
                                <img src={e?.product_icon} alt="" />
                              </div>
                          </div>
                          <div className="stepp-textt1-addstep">
                            {e?.description}
                          </div>
                          {/* <div className="stepp-text-amountt-addstep">
                            <span style={{ fontSize: "1.2rem" }}>
                              {e?.billing_cycle && e?.billing_cycle?.monthly
                                ? e?.billing_cycle?.monthly?.coin
                                : e?.billing_cycle && e?.billing_cycle?.lifetime
                                ? e?.billing_cycle?.lifetime?.coin
                                : ""}
                            </span>
                            <span style={{ fontSize: "1.2rem" }}>
                              {e?.billing_cycle && e?.billing_cycle?.monthly
                                ? Number(
                                    e?.billing_cycle?.monthly?.price
                                  )?.toFixed(2)
                                : e?.billing_cycle && e?.billing_cycle?.lifetime
                                ? Number(
                                    e?.billing_cycle?.lifetime?.price
                                  )?.toFixed(2)
                                : ""}
                            </span>
                            <span
                              style={{
                                fontSize: "0.9rem",
                              }}
                            >
                              {e?.monthly ? "/Month" : "/Lifetime"}
                            </span>
                          </div> 
                        </div>
                      );
                    })}
                  </div> 
                </div> */}
                {/* <div className="selected-steps-addstep">
                  {allServices?.map((e, i) => {
                    if (
                      Object.values(stepForm?.other_data).includes(
                        e?.product_id
                      )
                    ) {
                      return (
                        <div
                          className="each-selected-addstep"
                          key={e?.product_id}
                        >
                          <div className="stepp-textt-addstep">
                            <div>{e?.name}</div>
                            <div>
                              <img src={e?.product_icon} alt="" />
                            </div> 
                          </div>
                          <div className="stepp-textt1-addstep">
                            {e?.description}
                          </div>
                          <div className="stepp-text-amountt-addstep">
                            <span style={{ fontSize: "1.2rem" }}>
                              {e?.billing_cycle && e?.billing_cycle?.monthly
                                ? e?.billing_cycle?.monthly?.coin
                                : e?.billing_cycle && e?.billing_cycle?.lifetime
                                ? e?.billing_cycle?.lifetime?.coin
                                : ""}
                            </span>
                            <span style={{ fontSize: "1.2rem" }}>
                              {e?.billing_cycle && e?.billing_cycle?.monthly
                                ? Number(
                                    e?.billing_cycle?.monthly?.price
                                  )?.toFixed(2)
                                : e?.billing_cycle && e?.billing_cycle?.lifetime
                                ? Number(
                                    e?.billing_cycle?.lifetime?.price
                                  )?.toFixed(2)
                                : ""}
                            </span>
                            <span
                              style={{
                                fontSize: "0.9rem",
                              }}
                            >
                              {e?.monthly ? "/Month" : "/Lifetime"}
                            </span>
                          </div>
                          <div
                            className="trash-icon-div-addstep"
                            onClick={() => removeStep(e?.product_id)}
                          >
                            <img src={trash} alt="" />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div> */}
                <div className="space"></div>
              </Scrollbars>
            </div>

<div
  className="NextBtn"
  style={{
    width: "100%",
    opacity:
      stepForm?.name &&
      stepForm?.description &&         // Macro View
      stepForm?.microDescription &&    // Micro View
      stepForm?.nanoDescription &&     // Nano View
      stepForm?.length &&
      stepForm?.cost
        ? "1"
        : "0.5",
    cursor:
      stepForm?.name &&
      stepForm?.description &&
      stepForm?.microDescription &&
      stepForm?.nanoDescription &&
      stepForm?.length &&
      stepForm?.cost
        ? "pointer"
        : "not-allowed",
  }}
  onClick={() => {
    if (
      stepForm?.name &&
      stepForm?.description &&         // Macro View
      stepForm?.microDescription &&    // Micro View
      stepForm?.nanoDescription &&     // Nano View
      stepForm?.length &&
      stepForm?.cost
    ) {
      setStep("step2");
    }
  }}
>
  Next Step
</div>

          </>
        );
    }
  };

  return (
    <>
      {getContent()}
      <ToastContainer />
    </>
  );
};

export default NewStep1;
