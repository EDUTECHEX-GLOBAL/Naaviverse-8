import React from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { LoadScript } from "@react-google-maps/api";
import GoogleMapComponent from "./GoogleMapComponent";

const libraries = ["places"];

const GoogleMaps = ({
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
  return (
    <div style={{ width: "50%", height: "100%" }}>
      <LoadScript
        googleMapsApiKey="AIzaSyB5MJ2jMHzl_ghkbxOsyPmeBmYw_sUsIRQ"
        libraries={libraries}
      >
        <GoogleMapComponent
          map={map}
          setMap={setMap}
          searchTerm={searchTerm}
          currentLocation={currentLocation}
          setCurrentLocation={setCurrentLocation}
          placeInfo={placeInfo}
          selectedPlace={selectedPlace}
          directions={directions}
          setDirections={setDirections}
          selectedLocation={selectedLocation}
          showDirections={showDirections}
        />
      </LoadScript>
    </div>
  );
};

export default GoogleMaps;
