import React from "react";
import { getCoinsForApp } from "../../../services/postAPIs"
import "./app-assets.style.scss";
export default function AppAssets({ selectedApp, keyIds, handleClick }) {
  const [coinList, setCoinList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  const setUpCoinList = async () => {
    let res = await getCoinsForApp(selectedApp.app_code);
    if (res.data.status) {
      let temp = res.data.coins_data.map((obj) => {
        return {
          keyId: obj._id,
          name: obj.coinName,
          id: obj.coinSymbol,
          icon: obj.coinImage,
        };
      });
      setCoinList([...temp]);
    } else {
      setCoinList([]);
    }
    setLoading(false);
  };
  React.useEffect(() => {
    setUpCoinList();
  }, []);
  return (
    <div className="app-assets-main">
      <div className="app-assets-above">
        <h3 style={{textAlign:"center"}}>Select An Asset</h3>
        <span style={{textAlign:"center"}}>From {selectedApp.app_name}</span>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Find An Asset"
        />
      </div>
      <div className="app-assets-wrapper">
        {loading
          ? [1, 2, 3, 4, 5, 6, 7, 8, 9].map((obj) => (
              <div className="app-asset-loader-wrapper">
                <div className="app-asset-loader">
                  <div>
                    <button></button>
                  </div>
                  <p>XXXXX</p>
                </div>
              </div>
            ))
          : coinList
              .filter((x) => {
                return (
                  x?.name
                    ?.toLowerCase()
                    ?.startsWith(searchTerm.toLowerCase()) ||
                  x?.id?.toLowerCase()?.startsWith(searchTerm.toLowerCase())
                );
              })
              .map((obj) => (
                <div key={obj.keyId} className="app-asset-single">
                  <div className="app-asset-single-wrapper">
                    <div onClick={() => handleClick(obj)}>
                      <img src={obj.icon} />
                    </div>
                    <p style={{textAlign:"center"}}>{obj.name}</p>
                  </div>
                </div>
              ))}
      </div>
    </div>
  );
}
