import React, { useEffect, useState } from "react";
import axios from "axios";
import { useStore } from "../../../components/store/store.ts";
import { LoadingAnimation1 } from "../../../components/LoadingAnimation1";
import lg1 from "../../../static/images/login/lg1.svg";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const Step4 = ({ setAcceptOffer }) => {
  const userDetails = JSON.parse(localStorage.getItem("user"));
  const { index, setIndex, setBuy } = useStore();

  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [finalStep, setFinalStep] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // -------------------------------------------------
  // 1️⃣ GET PROFILE ID FROM YOUR BACKEND
  // -------------------------------------------------
  useEffect(() => {
    const email = userDetails?.user?.email;

    if (!email) return;

    axios
      .get(`${BASE_URL}/api/users/get?email=${email}`)
      .then((res) => {
        console.log("PROFILE RESPONSE (LOCAL API):", res.data);

        if (res.data?.status && res.data?.data) {
          setProfileId(res.data.data.profileDataId);
        } else {
          setErrorMsg("Unable to fetch user profile");
        }
      })
      .catch((err) => {
        console.log("PROFILE API ERROR:", err);
        setErrorMsg("Something went wrong while fetching profile");
      });
  }, []);

  // -------------------------------------------------
  // 2️⃣ START PAYMENT
  // -------------------------------------------------
  const startPayment = async () => {
    try {
      setLoading(true);

      const body = {
        userEmail: userDetails?.user?.email,
        productId: index?.product_id,
        productName: index?.product_name,
        billingMethod:
          index?.lifetime ? "lifetime" :
          index?.monthly ? "monthly" : "annual",
        profileId: profileId,
        amount: index?.amount || 1,
        currency: "INR",
      };

      console.log("📌 ORDER PAYLOAD:", body);

      // Create order
      const createOrder = await axios.post(
        `${BASE_URL}/api/payment/create-order`,
        body
      );

      console.log("📌 ORDER RESPONSE:", createOrder.data);

      if (!createOrder.data.success) {
        setLoading(false);
        return setErrorMsg("Order creation failed");
      }

      const order = createOrder.data.order;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Naavi",
        description: index.product_name,
        order_id: order.id,

        handler: async function (response) {
          console.log("📌 PAYMENT CALLBACK:", response);

          const verify = await axios.post(
            `${BASE_URL}/api/payment/verify`,
            response
          );

          if (verify.data.success) {
            setFinalStep(true);
            setLoading(false);
          } else {
            setLoading(false);
            setErrorMsg("Payment verification failed");
          }
        },

        prefill: {
          name: userDetails?.user?.name,
          email: userDetails?.user?.email,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.log("PAYMENT ERROR:", error);
      setLoading(false);
      setErrorMsg("Something went wrong during payment");
    }
  };

  // -------------------------------------------------
  // Auto-start payment when ready
  // -------------------------------------------------
  useEffect(() => {
    if (profileId && index) {
      console.log("🚀 Starting Payment Now…");
      startPayment();
    }
  }, [profileId, index]);

  // -------------------------------------------------
  // UI
  // -------------------------------------------------
  return (
    <>
      {loading ? (
        <div style={{
          width: "100%",
          display: "flex",
          height: "100%",
          alignItems: "center",
          flexDirection: "column",
        }}>
          <LoadingAnimation1 icon={lg1} width={200} />
          <div className="bottom-textt">Processing {index?.product_name}</div>
        </div>
      ) : finalStep ? (
        <>
          <div className="success-text-cs">
            You Have Successfully Subscribed To {index?.product_name}
          </div>
          <div className="buttonss-cs">
            <div
              className="share-btn-cs"
              onClick={() => {
                setBuy("step1");
                setAcceptOffer(false);
                setIndex([]);
              }}
            >
              Close
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="success-text-cs">{errorMsg}</div>
          <div className="buttonss-cs">
            <div
              className="share-btn-cs"
              onClick={() => {
                setBuy("step1");
                setAcceptOffer(false);
                setIndex([]);
              }}
            >
              Close
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Step4;
