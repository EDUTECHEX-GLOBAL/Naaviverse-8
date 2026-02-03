import React from "react";

const CongratulationsPanel = ({ selectedName }) => {
  return (
    <div style={{
      padding: "20px",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    }}>
      <h2>🎉 Congratulations!</h2>
      <p>You have selected:</p>

      <h3 style={{ color: "#1b3a8f", marginTop: "10px" }}>
        {selectedName}
      </h3>

      <p style={{ marginTop: "10px" }}>
        You can visit <b>My Journey</b> to continue with your next steps.
      </p>
    </div>
  );
};

export default CongratulationsPanel;
