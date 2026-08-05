import React from "react";
import nextId from "react-id-generator";
import Images from "../../../../../assets/0-exporter";

export default function SelectedOption({
  setDownloadableData,
  setWhich,
  type,
  nameImageList,
  config,
}) {
  return (
    <div className="selected-option">
      <div>
        <h6>Selected App: </h6>
        <h6
          onClick={() => {
            setWhich("app");
            setDownloadableData(null);
          }}
        >
          <img src={config.app.app_icon} />
          {config.app.app_name}
        </h6>
      </div>
      <div>
        <h6>Selected Tab: </h6>
        <h6
          onClick={() => {
            setWhich("type");
            setDownloadableData(null);
          }}
        >
          <img src={nameImageList[type].coinImage} />
          {nameImageList[type].coinName}({config.subType})
        </h6>
      </div>
      <div>
        <h6>Selected Format: </h6>
        <h6
          onClick={() => {
            setWhich("format");
            setDownloadableData(null);
          }}
        >
          <img src={config.selectedFormat.icon} /> {config.selectedFormat.name}
        </h6>
      </div>
    </div>
  );
}

const list = {
  csv: Images.csv,
  pdf: Images.pdf,
  png: Images.png,
  excel: Images.excel,
};
