import React, { useEffect, useState } from "react";
import "./currentstep.scss";
import { useCoinContextData } from "../../context/CoinContext";
import { useStore } from "../../components/store/store.ts";
import axios from "axios";
import Step4 from "../dashboard/MallProduct/Step4.jsx";
import CoinComponent from "../dashboard/MallProduct/CoinComponent.jsx";
import logout from "../../static/images/dashboard/logout.svg";
import profilea from "../../static/images/dashboard/profilea.svg";
import sidearrow from "../../static/images/dashboard/sidearrow.svg";
//images
import dummy from "../JourneyPage/dummy.svg";
import edutech from "./edutech.svg";
import resory from "./resory.svg";
import lek from "./lek.svg";
import logo from "../../static/images/logo.svg";
import { useNavigate, useLocation } from "react-router-dom";
import Dashsidebar from "../../components/dashsidebar/dashsidebar.jsx";
import searchIcon from "../../static/images/icons/search.svg";
import profile from '../../static/images/dashboard/profile.svg';
import downarrow from '../../static/images/dashboard/downarrow.svg';
import AccDashsidebar from "../../components/accDashsidebar/accDashsidebar.jsx";
import AdminAccDashsidebar from "../../components/AdminAccDashsidebar/index.jsx";
import MenuNav from "../../components/MenuNav/index.jsx";

/** ===================== FALLBACK SERVICES ====================== **/
const getFallbackServices = () => {
  return [
    {
      _id: "fallback-1",
      name: "Academic Counseling Service",
      description: "Get personalized guidance for your academic journey and subject selection",
      ServiceDetails: [{
        first_purchase: { price: 0, coin: "Free" },
        billing_cycle: {
          monthly: { price: 0, coin: "Free" },
          annual: { price: 0, coin: "Free" }
        },
        product_name: "Academic Counseling"
      }]
    },
    {
      _id: "fallback-2",
      name: "Portfolio Review",
      description: "Expert feedback on your creative portfolio for architecture applications",
      ServiceDetails: [{
        first_purchase: { price: 50, coin: "USD" },
        billing_cycle: {
          monthly: { price: 0, coin: "One-time" },
          annual: { price: 0, coin: "One-time" }
        },
        product_name: "Portfolio Review"
      }]
    },
    {
      _id: "fallback-3",
      name: "Test Preparation Guidance",
      description: "Strategies and resources for standardized test preparation",
      ServiceDetails: [{
        first_purchase: { price: 0, coin: "Free" },
        billing_cycle: {
          monthly: { price: 0, coin: "Free" },
          annual: { price: 0, coin: "Free" }
        },
        product_name: "Test Prep Resources"
      }]
    }
  ];
};


const StepPage = ({ productDataArray, selectedPathId, showSelectedPath, selectedPath }) => {
const [userType, setUserType] = useState(null);

useEffect(() => {
  setUserType(localStorage.getItem("userType"));
}, []);

  // const [role, setRole] = useState(localStorage.getItem("userType"));
  // const userType = role;

  const navigate = useNavigate();
  const loc = useLocation();

  console.log(productDataArray, "lkwehflkwheflwef")
 const userDetails = JSON.parse(localStorage.getItem("adminuser"));

  const {
    currentStepData,
    setCurrentStepData,
    currentStepDataLength,
    setCurrentStepDataLength,
    currentStepdataPathId,
    setCurrentStepDataPathId, stepServices, setStepServices
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


useEffect(() => {
  let storedStepId = localStorage.getItem("selectedStepId");

  console.log("🔍 Raw storedStepId:", storedStepId);

  try {
    const parsed = JSON.parse(storedStepId);
    if (parsed?.$oid) storedStepId = parsed.$oid;
  } catch (err) {}

  console.log("✅ Final stepId used:", storedStepId);

  if (!storedStepId) {
    console.warn("❌ No step ID found");
    setStepServices(getFallbackServices()); // ⭐ ADD FALLBACK HERE
    return;
  }

  axios
    .get(`http://localhost:4545/api/services/by-step?step_id=${storedStepId}`)
    .then(({ data }) => {
      let list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      // ⭐ Use fallback if API returned 0 services
      if (list.length === 0) {
        console.log("⚠ No services found. Using fallback services.");
        list = getFallbackServices();
      }

      setStepServices(list);
      console.log("✅ Final Services Loaded:", list);
    })
    .catch((e) => {
      console.error("🔥 Error fetching services, using fallback:", e);
      setStepServices(getFallbackServices()); // ⭐ USE FALLBACK ON ERROR
    });
}, []);



  // Run the effect only once when the component mounts



  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };


  // useEffect(() => {

  //   axios.get(`https://careers.marketsverse.com/attachservice/get?step_id=${currentStepPageData?._id}`).then(({data}) => {
  //       if(data.status){
  //         setCurrentStepData(data?.data[0])
  //         console.log(data, "lwehkjlwehfkwe")
  //       }
  //   })

  //   // console.log(currentStepData?._id, "=>", currentStepPageData?._id, "kjwefkjwefkwjef")
  // }, [currentStepPageData])

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
  const [showDrop, setShowDrop] = useState(false)


  function filterItem(text) {
    let filterItem = mallCoindata?.filter((eachitem) => {
      return eachitem?.coinSymbol?.toLowerCase()?.includes(text?.toLowerCase());
    });
    setfilteredcoins(filterItem);
  }

const reloadServices = async () => {
  const stepId = localStorage.getItem("selectedStepId");
  if (!stepId) return;

  try {
    const { data } = await axios.get(`http://localhost:4545/api/services/by-step?step_id=${stepId}`);

    console.log("🔄 SERVICES RELOADED:", data.data);
    setStepServices(data.data || []);
  } catch (err) {
    console.error("❌ Error reloading services:", err.message);
    setStepServices([]);
  }
};




  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-body">
 <div>
  {userType === "partner" ? (
    <AccDashsidebar />
  ) : userType === "user" ? (
    <Dashsidebar />
  ) : userType === "accountant" || userType === "admin" ? (
    <AdminAccDashsidebar admin={true} />
  ) : (
    <AdminAccDashsidebar admin={true} />
  )}
</div>

          <div className="dashboard-screens">
            <MenuNav
              showDrop={showDrop}
              setShowDrop={setShowDrop}
              // searchTerm={search}
              // setSearchterm={setSearch}
              searchPlaceholder="Search..."
            />
            <div className="currentstep" style={{ height: "90vh", overflow: "hidden" }}>

              {/* <h1>Hello</h1> */}

              <div className="cs-top-area" style={{ height: '13rem' }}>
                <div className="cs-text1">
                  <div>Your Current Step</div>
                  <div
                    className="back-Btn"
                    onClick={() => {
                      // setCurrentStepData("");
                      // setCurrentStepDataLength("");
                      // setCurrentStepDataPathId("");
                      // setsideNav("My Journey");
                      navigate(-1)
                    }}
                    style={{
                      display: currentStepData ? "flex" : "none",
                    }}
                  >
                    Back To Path
                  </div>
                </div>
                <div className="bold-text">
                  <div>
                    {currentStepData?.name}
                  </div>
                  <div className="macro-text-div">
                    {currentStepData?.description}

                  </div>

                  <div>
                    Apx Takes {currentStepPageData?.length > 0 ? currentStepPageData.length : 3} Days
                  </div>

                </div>

              </div>
              <div className="cs-content" style={{ height: '67vh' }}>
                <div className="overall-cs-content">
                  <div className="macro-view-box">
                    <div className="macro-text">Macro View:</div>
                    <div className="macro-content">
                      <div className="step-text">

                        {currentStepData?.name
                          ? currentStepData?.name
                          : currentStepPageData?.name}
                      </div>
                      <div className="macro-text-div">
                        {console.log(
                          'Macro View Description:',
                          currentStepData?.description
                            ? currentStepData?.description
                            : currentStepPageData?.description
                        )}
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
                            {currentStepData?.description
                              ? currentStepData?.description
                              : currentStepPageData?.description}
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
                            {streamDescription}
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
                            {gradePointDescription}
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
                            {financialDescription}
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
                            {personalityDescription}
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
                      </div>
                      <div className="nano-overall-div">
                        {stepServices?.length > 0 ? (
                          stepServices.slice(0, 3).map((item, index) => (
                           <Carousel1
  key={index}
  item={item}
  showNewDiv={showNewDiv}
  handleRejectClick={handleRejectClick}
  position={index}
  selectedCard={selectedCard}
  setSelectedCard={setSelectedCard}
  setIndex={setIndex}
  setAcceptOffer={setAcceptOffer}
  setBuy={setBuy}               // <-- added
  userDetails={userDetails}
/>

                          ))
                        ) : (
                          <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "14px", color: "#666" }}>
                            No services available for this step.
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                </div>
              </div>

<center>
  <div className="cs-footer1">
    <div
      onClick={() => {
        setPopup(true);
        setPopupDetails("no");
      }}
    >
      Failed
    </div>

    <div>Did you complete this step?</div>

    <div
      onClick={() => {
        setPopup(true);
        setPopupDetails("yes");
      }}
    >
      Yes
    </div>
  </div>
</center>

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
  {/* LIFETIME PRICE */}
  <div className="left-amnt-cs" style={{ borderRight: "1px solid #E7E7E7" }}>
    <p className="amnt-font-cs">
      {(index?.billing_cycle?.lifetime?.price ?? 0).toFixed(2)}
      &nbsp;
      {index?.billing_cycle?.lifetime?.coin ?? "USD"}
    </p>
    <p className="text-font-cs">Lifetime</p>
  </div>

  {/* MONTHLY PRICE */}
  <div className="left-amnt1-cs">
    <p className="amnt-font-cs">
      {(index?.billing_cycle?.monthly?.price ?? 0).toFixed(2)}
      &nbsp;
      {index?.billing_cycle?.monthly?.coin ?? "USD"}
    </p>
    <p className="text-font-cs">Monthly</p>
  </div>

  {/* YEARLY PRICE */}
  <div className="left-amnt1-cs">
    <p className="amnt-font-cs">
      {(index?.billing_cycle?.annual?.price ?? 0).toFixed(2)}
      &nbsp;
      {index?.billing_cycle?.annual?.coin ?? "USD"}
    </p>
    <p className="text-font-cs">Yearly</p>
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


            </div>
          </div>
        </div>
      </div>


    </>

  );
};

export default StepPage;

const Carousel1 = ({
  item,
  showNewDiv,
  handleRejectClick,
  position,
  setSelectedCard,
  selectedCard,
  setIndex,
  setAcceptOffer,
  setBuy,            // <-- added here
  userDetails,
}) => {
  const initiatePurchase = (service) => {
    axios
      .post(`https://careers.marketsverse.com/userpurchase/add`, {
        userId: userDetails?.user?._id,
        service_id: service?._id,
        purchaseStatus: "pending",
      })
      .then(({ data }) => {
        if (data.status) {
          console.log("Purchase initiated:", data);
        }
      });
  };

  // Razorpay starts
  const [razorpayOptions, setRazorpayOptions] = useState(null);

  const loadScript = (src) =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const displayRazorpay = async (amount) => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay failed to load!!");
      return;
    }

    const response = await fetch(
      "https://careers.marketsverse.com/api/paymentGateway/razorpay/initialize-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_mobile_number: "9599677424",
          amount,
          user_email: userDetails?.user?.email,
        }),
      }
    );

    const data = await response.json();
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

      setRazorpayOptions({
        key: "rzp_test_pIO7ySTH850hhP",
        amount: amount.toString(),
        currency,
        name,
        description: "Test Transaction",
        order_id,
        callback_url: callbackUrl,
        prefill: { name, email, contact },
        theme: { color: "#3399cc" },
      });
    }
  };

  useEffect(() => {
    if (razorpayOptions) {
      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    }
  }, [razorpayOptions]);
  // Razorpay Ends

  // ---- Use the current service shape directly ----
const service = item || {};

// Fix first_purchase for drawer pricing
service.first_purchase = {
  price:
    service.billing_cycle?.monthly?.price ||
    service.billing_cycle?.annual?.price ||
    service.billing_cycle?.lifetime?.price ||
    0,
  coin:
    service.billing_cycle?.monthly?.coin ||
    service.billing_cycle?.annual?.coin ||
    service.billing_cycle?.lifetime?.coin ||
    "",
};

const title = service.name || "Untitled Service";
const creator = service.productcreatoremail || "-";
const billingType = service.chargingtype || "-";

// Correct price selection
const cost =
  service.billing_cycle?.monthly?.price ||
  service.billing_cycle?.annual?.price ||
  service.billing_cycle?.lifetime?.price ||
  0;

const coin =
  service.billing_cycle?.monthly?.coin ||
  service.billing_cycle?.annual?.coin ||
  service.billing_cycle?.lifetime?.coin ||
  "";

const description = service.description || "";


  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectedCard(position);
      }}
      className={`nano-div2 ${
        showNewDiv === true ? "slide-in" : showNewDiv === false ? "fade-out" : ""
      }`}
      style={{
        left: position === 0 ? "0" : position === 1 ? "25%" : "50%",
        zIndex: position === selectedCard ? "3" : "2",
        height: position === selectedCard ? "100%" : "85%",
        opacity: position === selectedCard ? "1" : "0.5",
      }}
    >
      <div style={{ textAlign: "center", fontSize: "12px", fontWeight: 600 }}>
        {title}
      </div>

      <div className="nano-speed-container">
        <div className="speed-div">
          <span>Offered By: </span>
          <div style={{ marginLeft: "10px" }}>
            {creator ? creator.substring(0, 10) : "-"}
          </div>
        </div>
        <div className="speed-div">
          <span>Billing Type:</span>
          <span>{billingType}</span>
        </div>
        <div className="speed-div">
          <span>Cost:</span>
          <span>
            {Number(cost)} {coin}
          </span>
        </div>

        <div style={{ textAlign: "center", fontSize: "12px", fontWeight: 300 }}>
          {description}
        </div>
      </div>

      <div className="nano-btns">
    <div
  className="accept-btn"
  onClick={(e) => {
    e.stopPropagation();

    // Inject first_purchase dynamically
    const selectedService = {
      ...service,
      first_purchase: {
        price:
          service?.billing_cycle?.monthly?.price ||
          service?.billing_cycle?.annual?.price ||
          service?.billing_cycle?.lifetime?.price ||
          0,
        coin:
          service?.billing_cycle?.monthly?.coin ||
          service?.billing_cycle?.annual?.coin ||
          service?.billing_cycle?.lifetime?.coin ||
          "",
      },
    };

    setIndex(selectedService);   // now this contains first_purchase
    setAcceptOffer(true);        // open drawer
    setBuy("step1");             // start Step 1 inside drawer
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
      className={`nano-div2 ${showNewDiv === true
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
      className={`nano-div2 ${showNewDiv === true
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
