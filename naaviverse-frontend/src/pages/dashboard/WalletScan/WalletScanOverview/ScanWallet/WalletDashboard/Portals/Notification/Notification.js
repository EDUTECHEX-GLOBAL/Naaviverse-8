import React from "react";
import Images from "../../../../../assets/0-exporter";
import "./notification.style.scss";
export default function Notification({
  closeIt,
  enabled,
  title = "Notification Title",
  moreDetails = "This is the content of the notification. This is the content of the notification. This is the content of the notification.",
}) {
  return (
    <div
      onClick={() => closeIt()}
      style={!moreDetails ? { animation: "none" } : {}}
      className={`notification-portal ${enabled ? "" : "closing-it"}`}
    >
      <div
        style={!moreDetails ? { animation: "none" } : {}}
        onClick={(e) => e.stopPropagation(0)}
        className="notification-box"
      >
        <button onClick={() => closeIt()}>
          <img src={Images.cancel} />
        </button>
        <h5>{title}</h5>
        <div>
          <p>{moreDetails}</p>
        </div>
      </div>
    </div>
  );
}
