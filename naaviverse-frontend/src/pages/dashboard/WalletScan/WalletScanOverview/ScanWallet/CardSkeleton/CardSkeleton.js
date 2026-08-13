import React from "react";
import "./card-skeleton.style.scss";
export default function CardSkeleton() {
  return (
    <div className="card-skeleton">
      <div className="card-user">
        <button></button>
        <h4>XXXXXXXXXXXXXXXXXXX</h4>
        <p>XXXXXXXXXXXXXXXXXXXXXXXXXX</p>
      </div>
      <div className="cards-wrapper">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((obj) => (
          <div className="card-wrapper-single">
            <div className="card-wrapper">
              <div>
                <button />
              </div>
              <p>XXXXXXX</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
