import React from "react";
import nextId from "react-id-generator";
import Images from "../../../assets/0-exporter";
import LoadingAnimation from "../../../globalComponents/lotties/LoadingAnimation";
import "./type-of-asset.style.scss";
export default function TypeOfAsset({ details, handleClick, coins }) {
  const [list, setList] = React.useState(null);
  const setUpList = () => {
    let temp = [];
    for (const [key, value] of Object.entries(coins)) {
      if (details.streamType === null) {
        setList([]);
        return;
      }
      if (key === details.streamType.id) {
        temp = [...coins[key]];
      }
    }
    setList([...temp]);
  };
  React.useEffect(() => {
    setUpList();
  }, [coins]);
  return !list ? (
    <LoadingAnimation />
  ) : (
    <div className="type-of-asset">
      <div className="t-o-a-title">
        <h3 style={{textAlign:"center"}}>Select An Account Type</h3>
        <p style={{textAlign:"center"}}>
          {details?.streamType?.name} Vaults in {details?.app?.app_name}
        </p>
      </div>
      <div className="t-o-a-input">
        <input placeholder="Find An Account Type.." />
      </div>
      <div className="t-o-a-list">
        {theList.map((obj) => (
          <div
            className={`type-wrapper ${
              list.includes(obj.id) ? "disable-it" : ""
            }`}
          >
            <div onClick={() => handleClick(obj)}>
              <img src={obj.icon} />
            </div>
            <p style={{textAlign:"center"}}>{obj.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const theList = [
  {
    keyId: nextId(),
    enable: true,
    name: "Liquid",
    id: "L",
    icon: Images.vault,
  },
  {
    keyId: nextId(),
    name: "MoneyMarkets",
    id: "MM",
    enable: false,
    icon: Images.moneyMarket,
  },
  {
    keyId: nextId(),
    enable: false,
    name: "Bonds",
    id: "BE",
    icon: Images.bonds,
  },
];
