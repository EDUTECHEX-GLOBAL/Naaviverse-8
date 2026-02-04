import React, { useState } from "react";
import axios from "axios";
import Div from "../../views/inner-pages/contact/Div";

export default function Newsletter({ title, subtitle, placeholder }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter a valid email.");
      setIsSuccess(false);
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/admin-subscribe`, { email });

      if (res.status === 201) {
        setMessage("Subscription successful!");
        setIsSuccess(true);
        setEmail("");
      }
    } catch (err) {
      setMessage("Error subscribing. Please try again later.");
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
        <Div className="newsletter-subtitle">{subtitle}</Div>
        {message && (
          <div
            className="message"
            style={{ color: isSuccess ? "#00B5F9ff" : "red" }}
          >
            {message}
          </div>
        )}
      </Div>
    </>
  );
}
