import React from "react";
import nextId from "react-id-generator";
import Images from "../../../../../assets/0-exporter";

export default function FormatList({ setWhich, config, setConfig }) {
  return (
    <div className="format-list-main">
      {options.map((obj) => (
        <div className="option-wrapper" key={obj.keyId}>
          <div
            onClick={() => {
              setWhich("");
              setConfig({ ...config, selectedFormat: obj });
            }}
            className={obj.enable ? "" : "disable-it"}
          >
            <img src={obj.icon} />
          </div>
          <p>{obj.name}</p>
        </div>
      ))}
    </div>
  );
}
const options = [
  { keyId: nextId(), name: "CSV", id: "csv", icon: Images.csv, enable: true },
  {
    keyId: nextId(),
    name: "Excel",
    id: "excel",
    icon: Images.excel,
    enable: false,
  },
  { keyId: nextId(), name: "PDF", id: "  ", icon: Images.pdf, enable: true },
  { keyId: nextId(), name: "PNG", id: "png", icon: Images.png, enable: false },
];
