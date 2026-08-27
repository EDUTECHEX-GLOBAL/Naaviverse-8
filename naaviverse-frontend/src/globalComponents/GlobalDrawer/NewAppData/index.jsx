import React from "react";
import "./appData.scss";

const NewAppData = () => {
  return (
    <>
      <div style={{ padding: "20px 30px" }}>
        <div className="searchStyle">
          <input
            type="text"
            placeholder="Search For New Item To Add.."
            style={{
              width: "100%",
              border: "none",
              height: "30px",
              paddingLeft: "20px",
            }}
          />
        </div>
        <div>
          <div className="appDataCards">Frield Group (Admin)</div>
          <div className="appDataCards">Frield Group (Admin)</div>
        </div>
      </div>
    </>
  );
};

export default NewAppData;
