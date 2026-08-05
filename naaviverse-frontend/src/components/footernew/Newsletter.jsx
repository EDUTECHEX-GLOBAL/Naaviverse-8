import React, { useState } from "react";
import axios from "axios";
import Div from "../../views/inner-pages/contact/Div";

export default function Newsletter({ title, subtitle, placeholder }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://naaviverse-render.onrender.com";
  const cleanBaseUrl = BASE_URL.replace(/\/+$/, '');

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter a valid email.");
      setIsSuccess(false);
      return;
    }

    try {
      const res = await axios.post(`${cleanBaseUrl}/api/admin-subscribe`, { email });

      if (res.status === 201) {
        setMessage("Thanks for subscribing!");
        setIsSuccess(true);
        setEmail("");
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (
        err.response?.status === 400 ||
        err.response?.status === 409 ||
        (serverMsg && (serverMsg.toLowerCase().includes("already") || serverMsg.toLowerCase().includes("exist")))
      ) {
        setMessage("You have already used this email, please use a different email.");
      } else {
        setMessage(serverMsg || "You have already used this email, please use a different email.");
      }
      setIsSuccess(false);
      console.error(err);
    }
  };

  return (
    <>
      {title && <h2 className="widget-title">{title}</h2>}
      <Div className="newsletter newsletter-style">
        <form onSubmit={handleSubscribe} className="newsletter-form">
          <input
            type="email"
            className="newsletter-input"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="newsletter-btn">
            <span>Send</span>
          </button>
        </form>
        
        {/* Toggle Success/Error Message directly below send box */}
        {message && (
          <div
            className="newsletter-msg"
            style={{
              color: isSuccess ? "#198754" : "#e53e3e",
              fontSize: "13.5px",
              fontWeight: "600",
              marginTop: "8px",
              marginBottom: "8px",
              textAlign: "left"
            }}
          >
            {message}
          </div>
        )}

        <Div className="newsletter-subtitle">{subtitle}</Div>
      </Div>
    </>
  );
}
