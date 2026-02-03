import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
  ZoomableGroup,
} from "react-simple-maps";
import "./mapcomponent.scss";
import worldCountriesData from "./message.json";
import axios from "axios";

const MapComponent = () => {
  const [center, setCenter] = useState([0, 0]);
  const [zoom, setZoom] = useState(1);
  const [data, setData] = useState([]);

  const handleGeographyClick = (geo) => {
    const newZoom = zoom === 1 ? 2 : 1;
    const newCenter = geo?.properties?.centroid;
    setZoom(newZoom);
    setCenter(newCenter);
  };

  useEffect(() => {
    axios
      .get("https://careers.marketsverse.com/paths/get")
      .then((response) => {
        let result = response?.data?.data;
        // console.log(result, "maps page result");
        setData(result);
      })
      .catch((error) => {
        console.log(error, "error in maps page");
      });
  }, []);

  function getBoundingBox(coordinates) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    coordinates.forEach((ring) => {
      ring.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      });
    });

    return [minX, minY, maxX, maxY];
  }

  return (
    <div className="map-component">
      <div className="abs-div">
        <div className="path-count">{data?.length} Paths Found</div>
      </div>
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
        }}
      >
        <ZoomableGroup center={center} zoom={zoom}>
          <Geographies geography={worldCountriesData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryData = data?.find(
                  (item) =>
                    item?.country?.toLowerCase() ===
                    geo.properties.name.toLowerCase()
                );
                // console.log(countryData, "countryData");
                // Calculate the approximate center using the coordinates
                const coordinates = geo.geometry.coordinates;
                const [minX, minY, maxX, maxY] = getBoundingBox(coordinates);

                const centerX = (maxX + minX) / 2;
                const centerY = (maxY + minY) / 2;
                return (
                  <React.Fragment key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      onClick={() => handleGeographyClick(geo)}
                      style={{
                        default: {
                          fill: "#e5e5e5",
                        },
                        hover: {
                          fill: "#59a2dd",
                        },
                      }}
                    />
                    {countryData && (
                      <g transform={`translate(${centerX}, ${centerY})`}>
                        <circle
                          cx={0}
                          cy={0}
                          r={3} // Adjust the radius as needed
                          fill="#59a2dd" // Color of the round mark
                          stroke="#59a2dd"
                          strokeWidth={2}
                        />
                        <text
                          x={10} // Adjust the text position
                          textAnchor="start"
                          alignmentBaseline="middle"
                          // fill="red"
                        >
                          {countryData.country}
                        </text>
                      </g>
                    )}
                  </React.Fragment>
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MapComponent;
