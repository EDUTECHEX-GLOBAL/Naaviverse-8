import Axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";

const CountryList = ({ setCountry, onClose }) => {
  const [allCountry, setAllCountry] = useState([]);
  const [assetLoading, setAssetLoading] = useState(true);
  useEffect(() => {
    Axios.get("https://comms.globalxchange.io/coin/vault/countries/data/get")
      .then((res) => {
        if (res.data.status) setAllCountry(res.data.countries);
      })
      .finally(() => setAssetLoading(false));
  }, []);
  const [search, setSearch] = useState("");
  return (
    <Fragment>
      <div className="titleOp">Select Issuance Country</div>
      <div className="searchWrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search Assets....|"
        />
      </div>
      <Scrollbars className="searchList">
        {assetLoading
          ? Array(6)
              .fill("")
              .map((_, i) => (
                <div className="user" key={i}>
                  <Skeleton className="dp" circle />
                  <div className="userDetail">
                    <Skeleton className="name" width={200} />
                    <Skeleton className="email" width={200} />
                  </div>
                </div>
              ))
          : allCountry
              .filter(
                (item) =>
                  item.name?.toLowerCase().includes(search.toLowerCase()) ||
                  item.code?.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <div
                  className="user"
                  key={item._id}
                  onClick={() => {
                    setCountry(item);
                    onClose();
                  }}
                >
                  <img className="dp" src={item.image} alt="" />
                  <div className="userDetail">
                    <div className="name">{item.name}</div>
                    {/* <div className="email">{banker.email}</div> */}
                  </div>
                </div>
              ))}
        <div className="space"></div>
      </Scrollbars>
    </Fragment>
  );
};

export default CountryList;
