import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import "./mapcomponent.scss";
import PlaceDetails from "../../pages/MapsPage/PlaceDetails";
import RatingComponent from "../../pages/MapsPage/RatingComponent";

const webIcon =
  "https://www.gstatic.com/images/icons/material/system_gm/2x/public_gm_blue_24dp.png";
const loactionLogo =
  "https://www.gstatic.com/images/icons/material/system_gm/2x/place_gm_blue_24dp.png";
const phoneLogo =
  "https://www.gstatic.com/images/icons/material/system_gm/2x/phone_gm_blue_24dp.png";

const MapComponent = ({
  pathMap,
  setPathMap,
  pathSearchTerm,
  pathCurrentLocation,
  setPathCurrentLocation,
  pathPlaceInfo,
  pathSelectedPlace,
  pathDirections,
  setPathDirections,
  pathSelectedLocation,
  pathShowDirections,
}) => {

  const shortenWebsiteUrl = (url) => {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    return domain;
  };

  const directionsService = new window.google.maps.DirectionsService(); // Create DirectionsService instance

  // Handle directions response 1
  const handleDirectionsResponse = (response, status) => {
    if (status === "OK") {
      setPathDirections(response);
      const directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setDirections(response);
      directionsRenderer.setMap(pathMap);
    } else {
      console.error("Error fetching directions:", status);
    }
  };

  // Fetch directions when selectedPlace changes
  useEffect(() => {
    if (
      pathMap &&
      pathCurrentLocation !== null &&
      pathSelectedLocation !== null
    ) {
      directionsService.route(
        {
          origin: pathCurrentLocation,
          destination: pathSelectedLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        handleDirectionsResponse
      );
    }
  }, [pathMap, pathCurrentLocation, pathSelectedLocation]);

  return (
    <div className="map-component1">
      <div className="map-content1">
        <GoogleMap
          center={pathCurrentLocation}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          onLoad={(pathMap) => setPathMap(pathMap)}
        >
          {pathSelectedLocation === null && pathCurrentLocation && <Marker position={pathCurrentLocation} />}
          {pathCurrentLocation !== null &&
            pathSelectedLocation !== null &&
            pathDirections && (
              <DirectionsRenderer directions={pathDirections} />
            )}
        </GoogleMap>
      </div>
      <div
        className="place-details1"
        style={{ display: pathPlaceInfo ? "flex" : "none" }}
      >
        <PlaceDetails place={pathPlaceInfo} />

        <div className="place-name1">{pathPlaceInfo?.name}</div>

        {pathPlaceInfo?.rating && (
          <div className="user-rating-div1">
            <div className="ratings1">
              {pathPlaceInfo?.rating}{" "}
              <span>
                <RatingComponent rating={pathPlaceInfo?.rating} />
              </span>
            </div>
            <div>({pathPlaceInfo?.user_ratings_total?.toLocaleString()})</div>
          </div>
        )}

        {pathPlaceInfo?.formatted_address && (
          <div className="address-div1">
            <div>
              <img src={loactionLogo} alt="" />
            </div>
            {pathPlaceInfo?.formatted_address}
          </div>
        )}

        {pathPlaceInfo?.formatted_phone_number && (
          <div className="phone-no-div1">
            <div>
              <img src={phoneLogo} alt="" />
            </div>
            {pathPlaceInfo?.formatted_phone_number}
          </div>
        )}

        {pathPlaceInfo?.opening_hours?.open_now && (
          <div style={{ fontWeight: "500" }}>
            {pathPlaceInfo?.opening_hours?.open_now ? (
              <span style={{ color: "green" }}>Open</span>
            ) : (
              <span style={{ color: "red" }}>Closed</span>
            )}
          </div>
        )}

        {pathPlaceInfo?.website && (
          <div className="web-div1">
            <div>
              <img src={webIcon} alt="" />
            </div>
            <div>
              <a
                href={pathPlaceInfo?.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  color: "#100f0d",
                  textTransform: "lowercase",
                }}
              >
                {shortenWebsiteUrl(pathPlaceInfo?.website)}
              </a>
            </div>
          </div>
        )}

        {pathPlaceInfo?.reviews?.length > 0 && (
          <div className="reviews-div1">
            <div className="reviews-text1">Reviews</div>
            {pathPlaceInfo?.reviews?.length > 0 &&
              pathPlaceInfo?.reviews?.map((e, i) => {
                return (
                  <div className="each-review1" key={i}>
                    <div className="author-div1">
                      <div>
                        <img src={e?.profile_photo_url} alt="" />
                      </div>
                      <div>{e?.author_name}</div>
                    </div>
                    <div className="author-rating-div1">
                      <RatingComponent rating={e?.rating} />
                      <div style={{ fontSize: "0.8rem", fontWeight: "500" }}>
                        {e?.relative_time_description}
                      </div>
                    </div>
                    <div className="author-text1">{e?.text}</div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
