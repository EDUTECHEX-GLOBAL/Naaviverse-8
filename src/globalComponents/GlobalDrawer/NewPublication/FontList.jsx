import Axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";

const FontList = ({ textFont, setTextFont, onClose }) => {
  const [allCountry, setAllCountry] = useState([]);
  const [allFonts, setAllFonts] = useState(["Montserrat","Helvetica","Calibri","Times"]);
  const [assetLoading, setAssetLoading] = useState(false);
  // useEffect(() => {
  //   Axios.get("https://comms.globalxchange.io/coin/vault/countries/data/get")
  //     .then((res) => {
  //       if (res.data.status) setAllCountry(res.data.countries);
  //     })
  //     .finally(() => setAssetLoading(false));
  // }, []);
  const [search, setSearch] = useState("");
  return (
    <Fragment>
      {/* <div className="titleOp">Select Issuance Country</div> */}
      <div className="searchWrap" style={{borderRadius:"35px", marginBottom:"25px",height:"69px"}}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search Font"
        />
      </div>
      <Scrollbars className="searchList" style={{border:"none"}}>
        {assetLoading
          ? Array(6)
              .fill("")
              .map((_, i) => (
                <div className="countryuser" key={i}>
                  <Skeleton className="dp" circle />
                  <div className="userDetail">
                    <Skeleton className="name" width={200} />
                    <Skeleton className="email" width={200} />
                  </div>
                </div>
              ))
          : allFonts
              .filter(
                (item) =>
                  item.toLowerCase().includes(search.toLowerCase())
              )
              .map((item, index) => (
                <div
                  className="countryuser"
                  key={index}
                  onClick={() => {
                    setTextFont(item);
                    onClose();
                  }}
                >
                  {/* <img className="dp" src={item.image} alt="" /> */}
                  <div className="userDetail" style={{marginLeft:"0px"}}>
                    <div className="name">{item}</div>
                    {/* <div className="email">{banker.email}</div> */}
                  </div>
                </div>
              ))}
        <div className="space"></div>
      </Scrollbars>
    </Fragment>
  );
};

export default FontList;
