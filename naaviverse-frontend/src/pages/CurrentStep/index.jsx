import React, { useEffect, useState } from "react";
import "./currentstep.scss";
import { useCoinContextData } from "../../context/CoinContext";
import { useStore } from "../../components/store/store.ts";
import axios from "axios";
import Step4 from "../dashboard/MallProduct/Step4.jsx";
import CoinComponent from "../dashboard/MallProduct/CoinComponent.jsx";

//images
import dummy from "../JourneyPage/dummy.svg";
import edutech from "./edutech.svg";
import resory from "./resory.svg";
import lek from "./lek.svg";
import logo from "../../static/images/logo.svg";

const CurrentStep = ({ productDataArray, selectedPathId, showSelectedPath, selectedPath }) => {
  console.log(productDataArray, "lkwehflkwheflwef")
  const userDetails = JSON.parse(localStorage.getItem("user"));
  const {
    currentStepData,
    setCurrentStepData,
    currentStepDataLength,
    setCurrentStepDataLength,
    currentStepdataPathId,
    setCurrentStepDataPathId,stepServices, setStepServices
  } = useCoinContextData();
  const {
    sideNav,
    setsideNav,
    buy,
    setBuy,
    mallCoindata,
    setfilteredcoins,
    index,
    setIndex,
  } = useStore();
  const [showNewDiv, setShowNewDiv] = useState(null);
  const [position1, setPosition1] = useState();
  const [position2, setPosition2] = useState();
  const [position3, setPosition3] = useState();
  const [currentStepPageData, setCurrentStepPageData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("default");
  const [popupDetails, setPopupDetails] = useState("");
  const [currentStepPagePathId, setCurrentStepPagePathId] = useState("");
  const [selectedCard, setSelectedCard] = useState(1);

  
  const handleRejectClick = () => {
    if (position1 === 1) {
      setPosition1(3);
    } else if (position1 === 2) {
      setPosition1(1);
    } else {
      setPosition1(2);
    }

    if (position2 === 2) {
      setPosition2(1);
    } else if (position2 === 3) {
      setPosition2(2);
    } else {
      setPosition2(3);
    }

    if (position3 === 3) {
      setPosition3(2);
    } else if (position3 === 2) {
      setPosition3(1);
    } else {
      setPosition3(3);
    }
  };

  const [cards, setCards] = useState(productDataArray);
  const [centerIndex, setCenterIndex] = useState(0);
  const [acceptOffer, setAcceptOffer] = useState(false);
  const [userData, setUserData] = useState([]);
  const [showGradeDesc, setShowGradeDesc] = useState(false);
  const [showStreamDesc, setShowStreamDesc] = useState(false);
  const [showCurriculumDesc, setShowCurriculumDesc] = useState(false);
  const [showGradePointDesc, setShowGradePointDesc] = useState(false);
  const [showFinancialDesc, setShowFinancialDesc] = useState(false);
  const [showPersonalityDesc, setShowPersonalityDesc] = useState(false);
  const [gradeDescription, setGradeDescription] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [curriculumDescription, setCurriculumDescription] = useState("");
  const [gradePointDescription, setGradePointDescription] = useState("");
  const [financialDescription, setFinancialDescription] = useState("");
  const [personalityDescription, setPersonalityDescription] = useState("");

  const handleCardClick = (index) => {
    // Set the clicked card as the center card
    setCenterIndex(index);
    // Rotate the array to make the clicked card the center
    setCards((prevCards) => {
      const leftIndex = (index - 1 + prevCards.length) % prevCards.length; // Calculate the left index
      const rightIndex = (index + 1) % prevCards.length; // Calculate the right index

      // If the clicked card is the final card, update the left and right indices accordingly
      const finalIndex = prevCards.length - 1;
      const finalLeftIndex =
        index === finalIndex
          ? (index - 1 + prevCards.length) % prevCards.length
          : leftIndex;
      const finalRightIndex = index === finalIndex ? 0 : rightIndex;

      return [
        prevCards[index],
        prevCards[finalRightIndex],
        prevCards[finalLeftIndex],
        ...prevCards.slice(index + 2), // Slice the array to exclude the moved cards
        ...prevCards.slice(0, finalLeftIndex), // Add the remaining cards
      ];
    });
  };

  useEffect(() => {
    let userEmail = userDetails?.email;
    axios
      .get(`/api/users/get/${userEmail}`)
      .then((response) => {
        let result = response?.data?.data;
        // console.log(result, "userdetails result");
        setUserData(result);
      })
      .catch((error) => {
        console.log(error, "error in fetching userdetails");
      });
  }, []);

  useEffect(() => {
    const storedStepId = localStorage.getItem("selectedStepId"); // Retrieve the Step ID from localStorage
    if (storedStepId) {
      axios
        .get(`/api/fetch/steps/get?step_id=${storedStepId}`)
        .then(({ data }) => {
          if (data.status) {
            console.log(data, "lkwehfkjewhfkejrf");
            setCurrentStepData(data?.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching step data:", error);
        });
    }
  }, []); // Run the effect only once when the component mounts
  

  

  useEffect(() => {
    if (userData?.length > 0 && currentStepPageData?.length > 0) {
      
      const userGrade = userData[0]?.grade;

      const matchingGradeData = currentStepPageData?.gradeData?.find(
        (gradeData) => gradeData?.grade === userGrade
      );

      if (matchingGradeData) {
        setGradeDescription(matchingGradeData?.description);
      } else {
        setGradeDescription("");
      }

      const userStream = userData[0]?.stream;

      const matchingStreamData = currentStepPageData?.streamData?.find(
        (streamData) => streamData?.stream === userStream
      );

      if (matchingStreamData) {
        setStreamDescription(matchingStreamData.description);
      } else {
        setStreamDescription("");
      }

      const userCurriculum = userData[0]?.curriculum;

      const matchingCurriculumData = currentStepPageData?.curriculumData?.find(
        (curriculumData) => curriculumData?.curriculum === userCurriculum
      );

      if (matchingCurriculumData) {
        setCurriculumDescription(matchingCurriculumData.description);
      } else {
        setCurriculumDescription("");
      }

      const userGradePoint = userData[0]?.performance;

      const isPartialMatch = (str1, str2) => {
        const cleanedStr1 = str1?.replace(/\s/g, "");
        const cleanedStr2 = str2?.replace(/\s/g, "");
        // console.log(cleanedStr1?.includes(cleanedStr2) || cleanedStr2?.includes(cleanedStr1), 'isPartialMatch')
        return (
          cleanedStr1?.includes(cleanedStr2) || cleanedStr2?.includes(cleanedStr1)
        );
      };

      const matchingGradePointData =
        currentStepPageData?.gradePointAverageData?.find(
          (gradePointAverageData) =>
            isPartialMatch(
              gradePointAverageData?.gradePointAverage,
              userGradePoint
            )
        );

      if (matchingGradePointData) {
        setGradePointDescription(matchingGradePointData.description);
      } else {
        setGradePointDescription("");
      }

      const userFinancial = userData[0]?.financialSituation;

      const matchingFinancialData = currentStepPageData?.financialData?.find(
        (financialData) => financialData?.financialSituation === userFinancial
      );

      if (matchingFinancialData) {
        setFinancialDescription(matchingFinancialData.description);
      } else {
        setFinancialDescription("");
      }

      const userPersonality = userData[0]?.personality;

      const matchingPersonalityData =
        currentStepPageData?.personalityData?.find(
          (personalityData) => personalityData?.personality === userPersonality
        );

      if (matchingPersonalityData) {
        setPersonalityDescription(matchingPersonalityData.description);
      } else {
        setPersonalityDescription("");
      }
    }
  }, [userData, currentStepPageData]);

  // console.log(currentStepData?._id, "through journeypage");
  // console.log(currentStepPageData?._id, "direct id");

  const completeStep = (stepid, pathid) => {
    // console.log(stepid, "stepid", pathid, 'pathid');
    let obj = {
      email: userDetails?.user?.email,
      pathId: pathid,
      step_id: stepid,
    };

    axios
      .put(`https://careers.marketsverse.com/userpaths/completeStep`, obj)
      .then((response) => {
        let result = response?.data;
        // console.log(result, "completeStep result");
        if (result?.status) {
          setPopupContent("success");
        }
      })
      .catch((error) => {
        console.log(error, "completeStep error");
      });
  };

  const failStep = (stepid, pathid) => {
    // console.log(stepid, "stepid", pathid, 'pathid');
    let obj = {
      email: userDetails?.email,
      pathId: pathid,
      step_id: stepid,
    };
    axios
      .put(`https://careers.marketsverse.com/userpaths/failedStep`, obj)
      .then((response) => {
        let result = response?.data;
        // console.log(result, "failStep result");
        if (result?.success) {
          setPopupContent("success");
        }
      })
      .catch((error) => {
        console.log(error, "failStep error");
      });
  };

  function filterItem(text) {
    let filterItem = mallCoindata?.filter((eachitem) => {
      return eachitem?.coinSymbol?.toLowerCase()?.includes(text?.toLowerCase());
    });
    setfilteredcoins(filterItem);
  }

  return (
    <div className="currentstep" style={{height:"91vh", overflow:"hidden"}}>
      <div className="cs-top-area" style={{height:'10rem'}}>
        <div className="cs-text1">
          <div>Your Current Step</div>
          <div
            className="back-Btn"
            onClick={() => {
              setCurrentStepData("");
              setCurrentStepDataLength("");
              setCurrentStepDataPathId("");
              setsideNav("My Journey");
            }}
            style={{
              display: currentStepData ? "flex" : "none",
            }}
          >
            Back 
          </div>
        </div>
        <div className="bold-text">
          <div>
            {currentStepData?.name
              ? currentStepData?.name
              : currentStepPageData?.name}
          </div>
          <div class="cs-text2" >
            Apx Takes 3 Days
          </div>
        </div>
        <div style={{fontSize:'12px', fontWeight:400, lineHeight:'20px'}}>
          {currentStepData?.description}
        </div>
      </div>
      <div className="cs-content" style={{height:'60vh'}}>
        <div className="overall-cs-content" style={{ display: 'flex', flexDirection: 'column !important', gap: '30px' }}>
          <div className="macro-view-box">
            <div className="macro-text" >Macro View:</div>
            <div className="macro-content">
              <div className="step-text">
                {currentStepData?.name
                  ? currentStepData?.name
                  : currentStepPageData?.name}
              </div>
              <div className="macro-text-div">
                {currentStepData?.description
                  ? currentStepData?.description
                  : currentStepPageData?.description}
              </div>
            </div>
          </div>
          <div className="micro-view-box">
            <div className="micro-text">Micro View:</div>
            <div className="micro-content">
              <div className="step-text">
                <span>
                  {currentStepData?.name
                    ? currentStepData?.name
                    : currentStepPageData?.name}
                </span>{" "}
                For You
              </div>
              <div className="micro-text-div-container">
                <div className="micro-text-div">
                  <div className="bold-text-div">
                    <div className="bold-text">Based On You’re Grade</div>
                    <div
                      className="unlock-Btn"
                      onClick={() => {
                        setShowGradeDesc(!showGradeDesc);
                      }}
                    >
                      {showGradeDesc ? "Close" : "Open"}
                    </div>
                  </div>
                  <div
                    className="sub-text"
                    style={{ display: showGradeDesc ? "flex" : "none" }}
                  >
                    {currentStepData?.description}
                  </div>
                </div>
                <div className="micro-text-div">
                  <div className="bold-text-div">
                    <div className="bold-text">Based On You’re Stream</div>
                    <div
                      className="unlock-Btn"
                      onClick={() => {
                        setShowStreamDesc(!showStreamDesc);
                      }}
                    >
                      {showStreamDesc ? "Close" : "Open"}
                    </div>
                  </div>
                  <div
                    className="sub-text"
                    style={{ display: showStreamDesc ? "flex" : "none" }}
                  >
                    {currentStepData?.description}
                  </div>
                </div>
                <div className="micro-text-div">
                  <div className="bold-text-div">
                    <div className="bold-text">Based On You’re Curriculum</div>
                    <div
                      className="unlock-Btn"
                      onClick={() => {
                        setShowCurriculumDesc(!showCurriculumDesc);
                      }}
                    >
                      {showCurriculumDesc ? "Close" : "Open"}
                    </div>
                  </div>
                  <div
                    className="sub-text"
                    style={{ display: showCurriculumDesc ? "flex" : "none" }}
                  >
                    {currentStepData?.description}
                  </div>
                </div>
                <div className="micro-text-div">
                  <div className="bold-text-div">
                    <div className="bold-text">
                      Based On You’re Grade Point Avg
                    </div>
                    <div
                      className="unlock-Btn"
                      onClick={() => {
                        setShowGradePointDesc(!showGradePointDesc);
                      }}
                    >
                      {showGradePointDesc ? "Close" : "Open"}
                    </div>
                  </div>
                  <div
                    className="sub-text"
                    style={{ display: showGradePointDesc ? "flex" : "none" }}
                  >
                    {currentStepData?.description}
                  </div>
                </div>
                <div className="micro-text-div">
                  <div className="bold-text-div">
                    <div className="bold-text">
                      Based On You’re Financial Position
                    </div>
                    <div
                      className="unlock-Btn"
                      onClick={() => {
                        setShowFinancialDesc(!showFinancialDesc);
                      }}
                    >
                      {showFinancialDesc ? "Close" : "Open"}
                    </div>
                  </div>
                  <div
                    className="sub-text"
                    style={{ display: showFinancialDesc ? "flex" : "none" }}
                  >
                    {currentStepData?.description}
                  </div>
                </div>
                <div className="micro-text-div">
                  <div className="bold-text-div">
                    <div className="bold-text">Based On You’re Personality</div>
                    <div
                      className="unlock-Btn"
                      onClick={() => {
                        setShowPersonalityDesc(!showPersonalityDesc);
                      }}
                    >
                      {showPersonalityDesc ? "Close" : "Open"}
                    </div>
                  </div>
                  <div
                    className="sub-text"
                    style={{ display: showPersonalityDesc ? "flex" : "none" }}
                  >
                    {currentStepData?.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="nano-view-box">
            <div className="nano-text">Nano View:</div>
            <div className="nano-content">
              <div className="step-text">
                Get A Naavi Certified Vendor To Assist You In Choosing{" "}
                <span>
                  {currentStepData?.name
                    ? currentStepData?.name
                    : currentStepPageData?.name}
                </span>
                <div className="step-description">
      {currentStepData?.description || currentStepPageData?.description}
    </div>
              </div>
              <div className="nano-overall-div">
                {stepServices?.length > 0
                  ? stepServices
                      .slice(0, 3)
                      .map((item, index) => (
                        <Carousel1
                          item={item}
                          showNewDiv={showNewDiv}
                          handleRejectClick={handleRejectClick}
                          position={index}
                          // image={item?.product_icon}
                          selectedCard={selectedCard}
                          setSelectedCard={setSelectedCard}
                          setIndex={setIndex}
                          setAcceptOffer={setAcceptOffer}
                          userDetails={userDetails}
                        />
                      ))
                  : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="cs-footer">
        <div className="completed-div">Are You Completed This Step:</div>
        <div
          className="yes-no"
          onClick={() => {
            setPopup(true);
            setPopupDetails("yes");
          }}
        >
          <p>Yes</p>
        </div>
        <div
          className="yes-no"
          onClick={() => {
            setPopup(true);
            setPopupDetails("no");
          }}
        >
          <p>Failed</p>
        </div>
      </div> */}
      {/* <center>
        <div className="cs-footer1">
          <div onClick={() => {
            setPopup(true);
            setPopupDetails("no");
          }}>Failed</div>
          <div>Did you complete this step?</div>
          <div onClick={() => {
            setPopup(true);
            setPopupDetails("yes");
          }}>Yes</div>
        </div>
      </center> */}
      {acceptOffer && (
        <div
          className="accept-offer-overlay"
          onClick={() => {
            setAcceptOffer(false);
            setBuy("step1");
            setIndex([]);
          }}
        >
          <div
            style={{ right: acceptOffer ? "0" : "-100%" }}
            className="right-divv-cs"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {buy === "step1" ? (
              <>
                <div className="amount-details-cs">
                  <div
                    className="left-amnt-cs"
                    style={{ borderRight: "1px solid #E7E7E7" }}
                  >
                    <p className="amnt-font-cs">
                      {index?.first_purchase && index?.first_purchase?.price
                        ? index?.first_purchase?.price?.toFixed(2)
                        : "0.00"}
                      &nbsp;
                      {index?.first_purchase && index?.first_purchase?.coin
                        ? index?.first_purchase?.coin
                        : ""}
                    </p>
                    <p className="text-font-cs">
                      {index?.first_purchase && index?.first_purchase?.coin
                        ? "First Purchase"
                        : "Monthly"}
                    </p>
                  </div>
                  <div className="left-amnt1-cs">
                    <p className="amnt-font-cs">
                      {index?.monthly && index?.billing_cycle?.monthly?.price
                        ? index?.billing_cycle?.monthly?.price?.toFixed(2)
                        : "0.00"}
                      &nbsp;
                      {index?.monthly && index?.billing_cycle?.monthly?.coin
                        ? index?.billing_cycle?.monthly?.coin
                        : ""}
                    </p>
                    <p className="text-font-cs">
                      {index?.monthly && index?.billing_cycle?.monthly?.coin
                        ? "Monthly"
                        : "Monthly"}
                    </p>
                  </div>
                </div>
                <div className="buttonss-cs">
                  <button
                    className="buy-btn-cs"
                    onClick={() => {
                      setBuy("step2");
                    }}
                  >
                    Buy Now
                  </button>
                  {/* <button className="share-btn-cs">Share</button> */}
                </div>
              </>
            ) : buy === "step2" ? (
              <div className="buy-step1-cs">
                <div
                  style={{
                    width: "100%",
                    height: "20%",
                    height: "17%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "500",
                      color: "#1F304F",
                    }}
                  >
                    Select Currency To Pay With?
                  </div>
                  <div className="searchh-cs">
                    <input
                      type="text"
                      placeholder="Search Vaults.."
                      onChange={(event) => filterItem(event.target.value)}
                    />
                  </div>
                </div>
                <div className="coin-options-cs">
                  <CoinComponent />
                </div>
                <div className="buttonss-cs">
                  <div
                    className="share-btn-cs"
                    onClick={() => {
                      setBuy("step1");
                    }}
                  >
                    Close
                  </div>
                </div>
              </div>
            ) : buy === "step3" ? (
              <div className="buy-step1-cs">
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "500",
                    color: "#1F304F",
                  }}
                >
                  Are You Sure You Want To Subscribe To {index?.product_name}?
                </div>
                <div className="boxx-cs" onClick={() => setBuy("step4")}>
                  Confirm Purchase
                </div>
                <div
                  className="boxx-cs"
                  style={{
                    marginTop: "1.5rem",
                  }}
                  onClick={() => {
                    setBuy("step1");
                  }}
                >
                  Go Back
                </div>
                <div
                  className="boxx-cs"
                  style={{
                    marginTop: "1.5rem",
                  }}
                  onClick={() => {
                    setBuy("step1");
                    setAcceptOffer(false);
                    setIndex([]);
                  }}
                >
                  Cancel Order
                </div>
              </div>
            ) : buy === "step4" ? (
              <div className="buy-step1-cs">
                <Step4 setAcceptOffer={setAcceptOffer} />
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      )}

      {popup && (
        <div
          className="popup-overlay"
          onClick={() => {
            setPopup(false);
            setPopupContent("default");
            setPopupDetails("");
          }}
        >
          <div
            className="modal-container"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div>
              <img src={logo} alt="" />
            </div>
            {popupContent === "default" && popupDetails === "yes" ? (
              <>
                <div className="popup-text">
                  Are you sure you have completed this step?
                </div>
                <div className="popup-btns">
                  <div
                    className="yes-Btn"
                    onClick={() => {
                      if (currentStepData?._id !== undefined) {
                        completeStep(
                          currentStepData?._id,
                          currentStepdataPathId
                        );
                      } else {
                        completeStep(
                          currentStepPageData?._id,
                          currentStepPagePathId
                        );
                      }
                    }}
                  >
                    Yes, go to next step
                  </div>
                  <div
                    className="no-btn"
                    onClick={() => {
                      setPopup(false);
                      setPopupDetails("");
                      setPopupContent("default");
                    }}
                  >
                    Never mind
                  </div>
                </div>
              </>
            ) : popupContent === "default" && popupDetails === "no" ? (
              <>
                <div className="popup-text">
                  Are you sure you have failed this step?
                </div>
                <div className="popup-btns">
                  <div
                    style={{ background: "#100F0D" }}
                    className="yes-Btn"
                    onClick={() => {
                      if (currentStepData?._id !== undefined) {
                        failStep(currentStepData?._id, currentStepdataPathId);
                      } else {
                        failStep(
                          currentStepPageData?._id,
                          currentStepPagePathId
                        );
                      }
                    }}
                  >
                    Yes, move me to another path
                  </div>
                  <div
                    className="no-btn"
                    onClick={() => {
                      setPopup(false);
                      setPopupDetails("");
                      setPopupContent("default");
                    }}
                  >
                    Never mind
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="popup-text">
                  {popupDetails === "yes" ? "Completed" : "Failed"} step
                  updated!
                </div>
                <div className="popup-btns">
                  <div
                    className="yes-Btn"
                    onClick={() => {
                      setPopup(false);
                      setPopupContent("default");
                      setPopupDetails("");
                      setsideNav("My Journey");
                    }}
                  >
                    OK
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentStep;

const Carousel1 = ({
  item,
  showNewDiv,
  handleRejectClick,
  position,
  position1,
  position2,
  position3,
  image,
  setSelectedCard,
  selectedCard,
  setIndex,
  setAcceptOffer,userDetails
}) => {

  const initiatePurchase = (sService) => {
  //   console.log({
  //     userId: userDetails?.user?._id,
  //     service_id: sService?._id,
  //     purchaseStatus: "pending"
  // },sService,userDetails,  "lwelkfjweflwjekhflew")
    axios.post(`https://careers.marketsverse.com/userpurchase/add`, {
      userId: userDetails?.user?._id,
      service_id: sService?._id,
      purchaseStatus: "pending"
  }).then(({data}) => {
    if(data.status){
      console.log(data, "lwedlwehlwe")
    }
  })
  }

  // Razorpay starts
  const [razorpayOptions, setRazorpayOptions,] = useState(null)

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async (amount, sService) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay failed to load!!');
      return;
    }

    

    const response = await fetch('https://careers.marketsverse.com/api/paymentGateway/razorpay/initialize-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_mobile_number: '9599677424',
            amount:amount,
            user_email:userDetails?.user?.email,
          }),
        });

        const data = await response.json();

        console.log(data, "kjgkf3k4jf3l4")

        if (data && data.status) {
          const {
            order_id,
            amount,
            currency,
            name,
            email,
            contact,
            callbackUrl,
            cancelUrl,
          } = data.data[1];

          const options = {
            key: 'rzp_test_pIO7ySTH850hhP', // Replace with your Razorpay key
            amount: amount.toString(),
            currency,
            name,
            description: 'Test Transaction',
            order_id,
            callback_url: callbackUrl,
            prefill: {
              name,
              email,
              contact,
            },
            theme: {
              color: '#3399cc',
            },
          };

          setRazorpayOptions(options);
        }
  };

  useEffect(() => {
    if(razorpayOptions){
      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    }
  }, [razorpayOptions])
// Razorpay Ends


  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectedCard(position);
      }}
      className={`nano-div2 ${
        showNewDiv === true
          ? "slide-in"
          : showNewDiv === false
          ? "fade-out"
          : ""
      }`}
      style={{
        left: position === 0 ? "0" : position === 1 ? "25%" : "50%",
        zIndex: position === selectedCard ? "3" : "2",
        height: position === selectedCard ? "100%" : "85%",
        opacity: position === selectedCard ? "1" : "0.5",
      }}
    >
      {/* <div className="nano-img">
        <img
          // src={item?.banker_metadata?.profilePicURL}
          src={require("./naaviLogo.png")}
          alt=""
          style={{
            borderRadius: "50%",
            width: "73px",
            height: "73px",
            background: "#e7e7e7",
          }}
        />
      </div> */}
      <div style={{ textAlign: "center", fontSize: "12px", fontWeight: 600 }}>
        {item?.ServiceDetails[0]?.name}
      </div>
      <div className="nano-speed-container">
        <div className="speed-div">
          <span>Offered By: </span>
            <div style={{ marginLeft: "10px" }}>
              {item?.ServiceDetails[0]?.productcreatoremail?.substring(0, 10) || "Edutechex"}
            </div>
        </div>
        <div className="speed-div">
          <span>Billing Type:</span>
          <span>{item?.ServiceDetails[0]?.chargingtype || "Onetime"}</span>
        </div>
        <div className="speed-div">
            <span>Cost:</span>
            <span>
            {item?.ServiceDetails[0]?.billing_cycle?.lifetime?.price || item?.ServiceDetails[0]?.billing_cycle?.monthly?.price || item?.ServiceDetails[0]?.billing_cycle?.annual?.price} {item?.ServiceDetails[0]?.billing_cycle?.lifetime?.coin || item?.ServiceDetails[0]?.billing_cycle?.monthly?.coin || item?.ServiceDetails[0]?.billing_cycle?.annual?.coin || "500 USD"}
            </span>
          </div>
        {/* {Object.entries(item?.ServiceDetails[0]?.billing_cycle).map(([key, value]) => (
          <div className="speed-div" key={key}>
            <span>Cost:</span>
            <span>
              {value.price}&nbsp;{value.coin}
            </span>
          </div>
        ))} */}
        <div style={{ textAlign: "center", fontSize: "12px", fontWeight: 300 }}>
          {item?.ServiceDetails[0]?.description}
        </div>
      </div>
      <div className="nano-btns">
        <div
          className="accept-btn"
          onClick={() => {
            // console.log(item, "item");
            // setIndex(item);
            // setAcceptOffer(true);
            initiatePurchase(item?.ServiceDetails[0])
            displayRazorpay(Number(item?.ServiceDetails[0]?.billing_cycle?.lifetime?.price || item?.ServiceDetails[0]?.billing_cycle?.monthly?.price || item?.ServiceDetails[0]?.billing_cycle?.annual?.price,item?.ServiceDetails[0] ))
          }}
        >
         Buy Now
        </div>
        
      </div>
    </div>
  );
};

const Carousel2 = ({
  showNewDiv,
  handleRejectClick,
  // position1,
  position2,
  // position3,
  image,
  originalprice,
  discountprice,
}) => {
  return (
    <div
      className={`nano-div2 ${
        showNewDiv === true
          ? "slide-in"
          : showNewDiv === false
          ? "fade-out"
          : ""
      }`}
      style={{
        left: position2 === 1 ? "0" : position2 === 2 ? "25%" : "50%",
        zIndex: position2 === 2 ? "3" : "2",
        height: position2 === 2 ? "100%" : "75%",
      }}
    >
      <div className="nano-img">
        <img src={image} alt="" />
      </div>
      <div className="nano-price">
        <div className="disount-price">₹{discountprice}</div>
        <div className="original-price">₹{originalprice}</div>
      </div>
      <div className="nano-speed-container">
        <div className="speed-div">
          <span>Speed: </span>
          <span>14 Days</span>
        </div>
        <div className="speed-div">
          <span>Success Rate:</span>
          <span>525/622</span>
        </div>
      </div>
      <div className="nano-btns">
        <div className="accept-btn">Accept Offer</div>
        <div
          className="reject-btn"
          onClick={() => {
            handleRejectClick();
          }}
        >
          Reject Offer
        </div>
      </div>
    </div>
  );
};

const Carousel3 = ({
  showNewDiv,
  handleRejectClick,
  // position1,
  // position2,
  position3,
  image,
  originalprice,
  discountprice,
}) => {
  return (
    <div
      className={`nano-div2 ${
        showNewDiv === true
          ? "slide-in"
          : showNewDiv === false
          ? "fade-out"
          : ""
      }`}
      style={{
        left:
          // position1 === 1
          //   ? "0"
          //   : position1 === 2
          //   ? "25%"
          //   : position1 === 3
          //   ? "50%"
          //   : position2 === 1
          //   ? "0"
          //   : position2 === 2
          //   ? "25%"
          //   : position2 === 3
          //   ? "50%"
          //   :
          position3 === 1 ? "0" : position3 === 2 ? "25%" : "50%",
        zIndex: position3 === 2 ? "3" : "2",
        height: position3 === 2 ? "100%" : "75%",
      }}
    >
      <div className="nano-img">
        <img src={image} alt="" />
      </div>
      <div className="nano-price">
        <div className="disount-price">₹{discountprice}</div>
        <div className="original-price">₹{originalprice}</div>
      </div>
      <div className="nano-speed-container">
        <div className="speed-div">
          <span>Speed: </span>
          <span>14 Days</span>
        </div>
        <div className="speed-div">
          <span>Success Rate:</span>
          <span>525/622</span>
        </div>
      </div>
      <div className="nano-btns">
        <div className="accept-btn">Accept Offer</div>
        <div
          className="reject-btn"
          onClick={() => {
            handleRejectClick();
          }}
        >
          Reject Offer
        </div>
      </div>
    </div>
  );
};
