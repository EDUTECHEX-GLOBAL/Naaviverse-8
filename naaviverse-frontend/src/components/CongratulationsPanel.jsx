import React from "react";

const CongratulationsPanel = ({ selectedName }) => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      minHeight: "100vh", // fallback if parent has no height
    }}>
      <div style={{
        padding: "32px 28px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
        maxWidth: "320px",
        width: "100%",
      }}>
        <h2 style={{ color: "#1b3a8f", marginBottom: "12px" }}>
          🎉 Congratulations!
        </h2>
        <p style={{ color: "#555", marginBottom: "8px" }}>You Have Selected:</p>

        <h3 style={{ color: "#1b3a8f", fontWeight: "700", marginBottom: "16px" }}>
          {selectedName}
        </h3>

        <p style={{ color: "#aaa", fontSize: "14px" }}>
          Redirecting To My Journey...
        </p>
      </div>
    </div>
  );
};

export default CongratulationsPanel;