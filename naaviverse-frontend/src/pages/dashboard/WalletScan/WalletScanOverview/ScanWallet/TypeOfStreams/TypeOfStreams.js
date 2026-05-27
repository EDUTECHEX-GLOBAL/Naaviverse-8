import React from "react";
import "./type-of-streams.style.scss";
import nextId from "react-id-generator";
import Images from "../../../assets/0-exporter";
export default function TypeOfStreams({ userDetails,handleClick }) {
  return (
    <div className="type-of-streams">
      <div className="streams-about-user">
        <img src={userDetails?.profile_img} />
        <h4>Almost There</h4>
        <p style={{textAlign:"center"}}>How Would You Like To Stream Your InstaCrypto Accounts</p>
      </div>
      <div className="streams-list">
        {streams.map((obj) => (
          <div key={obj.keyId} className={`single-app-wrapper ${obj.disable?"disable-it":""}`}>
            <div className="single-app">
              <div onClick={()=>handleClick(obj)}>
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
const streams = [
  {
    keyId: nextId(),
    name: "Overall",
    icon: Images.manWithTelescope,
    id: "overall",
    disable: true,
  },
  {
    keyId: nextId(),
    name: "Asset Class",
    icon: Images.moneyAndCoins,
    id: "assetClass",
    disable: true,
  },
  {
    keyId: nextId(),
    name: "Asset",
    icon: Images.web,
    id: "asset",
    disable: false,
  },
  {
    keyId: nextId(),
    name: "Transaction Type",
    icon: Images.phone,
    id: "transaction",
    disable: true,
  },
  {
    keyId: nextId(),
    name: "Counter party",
    icon: Images.connecting,
    id: "counterPparty",
    disable: true,
  },
  {
    keyId: nextId(),
    name: "Banker",
    icon: Images.banker,
    id: "banker",
    disable: true,
  },
];
