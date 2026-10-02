import React, { useState } from "react";
import axios from "axios";
import Div from "../../views/inner-pages/contact/Div";
import { validateEmail } from "../../utils/emailValidator";

export default function Newsletter({ title, subtitle, placeholder }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://naaviverse-render.onrender.com";
  const cleanBaseUrl = BASE_URL.replace(/\/+$/, '');

  const handleSubscribe = async (e) => {
    e.preventDefault();

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setMessage(validation.message);
      setIsSuccess(false);
      return;
    }

    const cleanEmail = validation.cleanEmail;

    try {
      const res = await axios.post(`${cleanBaseUrl}/api/admin-subscribe`, { email: cleanEmail });

      if (res.status === 201) {
        setMessage("Thanks for subscribing!");
        setIsSuccess(true);
        setEmail("");
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        setMessage(serverMsg);
      } else if (
        err.response?.status === 400 ||
        err.response?.status === 409
      ) {
        setMessage("You have already used this email, please use a different email.");
      } else {
        setMessage("Unable to subscribe. Please try again later.");
      }
      setIsSuccess(false);
      console.error(err);
    }
  };

  return (
    <>
      {title && <h2 className="widget-title">{title}</h2>}
      <Div className="newsletter newsletter-style">
        <form onSubmit={handleSubscribe} className="newsletter-form" noValidate>
          <input
            type="email"
            className="newsletter-input"
            placeholder={placeholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (message) setMessage("");
            }}
            required
            pattern="[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}"
            title="Please enter a valid email address (e.g. name@gmail.com, .in, .net, .org, .edu)"
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
