import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import "./googlemapcomponent.scss";
import RatingComponent from "./RatingComponent";
import PlaceDetails from "./PlaceDetails";
import { useCoinContextData } from "../../context/CoinContext";

const webIcon =
  "https://www.gstatic.com/images/icons/material/system_gm/2x/public_gm_blue_24dp.png";
const loactionLogo =
  "https://www.gstatic.com/images/icons/material/system_gm/2x/place_gm_blue_24dp.png";
const phoneLogo =
  "https://www.gstatic.com/images/icons/material/system_gm/2x/phone_gm_blue_24dp.png";

const GoogleMapComponent = ({
  map,
  setMap,
  searchTerm,
  currentLocation,
  setCurrentLocation,
  placeInfo,
  selectedPlace,
  directions,
  setDirections,
  selectedLocation,
  showDirections,
}) => {
  const {
    // directions,
    // setDirections,
    // selectedLocation,
    setSelectedLocation,
    // showDirections,
    setShowDirections,
  } = useCoinContextData();

  const shortenWebsiteUrl = (url) => {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    return domain;
  };

  const directionsService = new window.google.maps.DirectionsService(); // Create DirectionsService instance

  // Handle directions response 1
  const handleDirectionsResponse = (response, status) => {
    if (status === "OK") {
      setDirections(response);
      const directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setDirections(response);
      directionsRenderer.setMap(map);
    } else {
      console.error("Error fetching directions:", status);
    }
  };

  // Fetch directions when selectedPlace changes
  useEffect(() => {
    if (map && currentLocation !== null && selectedLocation !== null) {
      directionsService.route(
        {
          origin: currentLocation,
          destination: selectedLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        handleDirectionsResponse
      );
    }
  }, [map, currentLocation, selectedLocation]);

  return (
    <div className="gmap-container">
      <div className="map-content">
        <GoogleMap
          center={currentLocation}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          onLoad={(map) => setMap(map)}
        >
          {selectedLocation === null && currentLocation && (
            <Marker position={currentLocation} />
          )}
          {currentLocation !== null &&
            selectedLocation !== null &&
            directions !== null && (
              <DirectionsRenderer directions={directions} />
            )}
        </GoogleMap>
      </div>
      <div
        className="place-details"
        style={{ display: placeInfo ? "flex" : "none" }}
      >
        <PlaceDetails place={placeInfo} />

        <div className="place-name">{placeInfo?.name}</div>

        {placeInfo?.rating && (
          <div className="user-rating-div">
            <div className="ratings">
              {placeInfo?.rating}{" "}
              <span>
                <RatingComponent rating={placeInfo?.rating} />
              </span>
            </div>
            <div>({placeInfo?.user_ratings_total?.toLocaleString()})</div>
          </div>
        )}

        {placeInfo?.formatted_address && (
          <div className="address-div">
            <div>
              <img src={loactionLogo} alt="" />
            </div>
            {placeInfo?.formatted_address}
          </div>
        )}

        {placeInfo?.formatted_phone_number && (
          <div className="phone-no-div">
            <div>
              <img src={phoneLogo} alt="" />
            </div>
            {placeInfo?.formatted_phone_number}
          </div>
        )}

        {placeInfo?.opening_hours?.open_now && (
          <div style={{ fontWeight: "500" }}>
            {placeInfo?.opening_hours?.open_now ? (
              <span style={{ color: "green" }}>Open</span>
            ) : (
              <span style={{ color: "red" }}>Closed</span>
            )}
          </div>
        )}

        {placeInfo?.website && (
          <div className="web-div">
            <div>
              <img src={webIcon} alt="" />
            </div>
            <div>
              <a
                href={placeInfo?.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  color: "#100f0d",
                  textTransform: "lowercase",
                }}
              >
                {shortenWebsiteUrl(placeInfo?.website)}
              </a>
            </div>
          </div>
        )}

        {placeInfo?.reviews?.length > 0 && (
          <div className="reviews-div">
            <div className="reviews-text">Reviews</div>
            {placeInfo?.reviews?.length > 0 &&
              placeInfo?.reviews?.map((e, i) => {
                return (
                  <div className="each-review" key={i}>
                    <div className="author-div">
                      <div>
                        <img src={e?.profile_photo_url} alt="" />
                      </div>
                      <div>{e?.author_name}</div>
                    </div>
                    <div className="author-rating-div">
                      <RatingComponent rating={e?.rating} />
                      <div style={{ fontSize: "0.8rem", fontWeight: "500" }}>
                        {e?.relative_time_description}
                      </div>
                    </div>
                    <div className="author-text">{e?.text}</div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMapComponent;
