import React from "react";

export default function DownloadAppList({
  setConfig,
  setWhich,
  config,
  registeredApps,
}) {
  const [searchTerm, setSearchTerm] = React.useState("");
  return (
    <div className="download-app-list">
      <div className="d-a-l-search-wrapper">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Apps"
        />
      </div>
      {registeredApps
        .filter((x) => {
          return x.app_name.toLowerCase().startsWith(searchTerm.toLowerCase());
        })
        .map((obj) => (
          <div className="r-app-wrapper">
            <div className="r-app-container">
              <div
                onClick={() => {
                  setWhich("");
                  setConfig({ ...config, app: obj });
                }}
              >
                <img src={obj.app_icon} />
              </div>
              <p>{obj.app_name}</p>
            </div>
          </div>
        ))}
    </div>
  );
}
