import React from "react";

const fullstarImg =
  "https://maps.gstatic.com/consumer/images/icons/2x/ic_star_rate_14.png";
const halfstarImg =
  "https://maps.gstatic.com/consumer/images/icons/2x/ic_star_rate_half_14.png";

const RatingComponent = ({ rating }) => {
  const renderRatingImages = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const images = [];

    for (let i = 0; i < fullStars; i++) {
      images.push(<img key={i} src={fullstarImg} alt={`Full Star ${i + 1}`} />);
    }

    if (hasHalfStar) {
      images.push(<img key="half" src={halfstarImg} alt="Half Star" />);
    }

    return images;
  };

  return <div style={{ display: "flex" }}>{renderRatingImages()}</div>;
};

export default RatingComponent;
