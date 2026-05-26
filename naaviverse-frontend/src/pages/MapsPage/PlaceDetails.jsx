import React from "react";

const PlaceDetails = ({ place }) => {
  const renderPhotos = () => {
    if (place?.photos && place?.photos?.length > 0) {
      const firstPhoto = place.photos[0];
      const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${firstPhoto?.photo_reference}&key=AIzaSyB5MJ2jMHzl_ghkbxOsyPmeBmYw_sUsIRQ`;
      return <img src={imageUrl} alt="First Photo" />;
      //   return place?.photos?.map((photo, index) => {
      //     const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo?.photo_reference}&key=AIzaSyB5MJ2jMHzl_ghkbxOsyPmeBmYw_sUsIRQ`;
      //     return <img key={index} src={imageUrl} alt={`Photo ${index + 1}`} />;
      //   });
    } else {
      return <p>No photos available.</p>;
    }
  };

  return (
    <>
      <div className="place-photo">{renderPhotos()}</div>
    </>
  );
};

export default PlaceDetails;
