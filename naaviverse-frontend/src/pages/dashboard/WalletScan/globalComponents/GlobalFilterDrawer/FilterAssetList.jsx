import axios from "axios";
import React, { Fragment, useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";
import { GlobalContex } from "../../globalContext";

function FilterAssetList({ onClose }) {
  const {
    bankerEmail,
    selectedAssetFilters,
    setSelectedAssetFilters,
    selectedStatusFilters,
    setSelectedStatusFilters,
    selectedLengthFilter,
    setSelectedLengthFilter,
  } = useContext(GlobalContex);
  const [search, setSearch] = useState("");
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (selectedStatusFilters.length > 0 && selectedLengthFilter !== "") {
      axios
        .post(
          `https://comms.globalxchange.com/coin/iced/banker/custom/bond/get?email=${bankerEmail}&days=${selectedLengthFilter}`,
          {
            include: {
              status: [...selectedStatusFilters],
            },
          }
        )
        .then(({ data }) => {
          const temp = [];
          Object.keys(data.currenciesData).map(function (key, index) {
            temp.push(data.currenciesData[key]);
          });
          // setSelectedAssetFilters([...temp]);
          setAllAssets([...temp]);
          setLoading(false);
        });
    } else if (
      selectedStatusFilters.length === 0 &&
      selectedLengthFilter !== ""
    ) {
      axios
        .post(
          `https://comms.globalxchange.com/coin/iced/banker/custom/bond/get?email=${bankerEmail}&days=${selectedLengthFilter}`
        )
        .then(({ data }) => {
          const temp = [];
          Object.keys(data.currenciesData).map(function (key, index) {
            temp.push(data.currenciesData[key]);
          });
          // setSelectedAssetFilters([...temp]);
          setAllAssets([...temp]);
          setLoading(false);
        });
    } else if (
      selectedStatusFilters.length > 0 &&
      selectedLengthFilter === ""
    ) {
      axios
        .post(
          `https://comms.globalxchange.com/coin/iced/banker/custom/bond/get?email=${bankerEmail}`,
          {
            include: {
              status: [...selectedStatusFilters],
            },
          }
        )
        .then(({ data }) => {
          const temp = [];
          Object.keys(data.currenciesData).map(function (key, index) {
            temp.push(data.currenciesData[key]);
          });
          // setSelectedAssetFilters([...temp]);
          setAllAssets([...temp]);
          setLoading(false);
        });
    } else {
      axios
        .get(
          `https://comms.globalxchange.com/coin/iced/banker/custom/bond/get?email=${bankerEmail}`
        )
        .then(({ data }) => {
          const temp = [];
          Object.keys(data.currenciesData).map(function (key, index) {
            temp.push(data.currenciesData[key]);
          });
          // setSelectedAssetFilters([...temp]);
          setAllAssets([...temp]);
          setLoading(false);
        });
    }
  }, []);

  const handleAssetSelection = (item) => {
    if (selectedAssetFilters.find((o) => o === item.coin)) {
      setSelectedAssetFilters(
        selectedAssetFilters.filter((o) => o !== item.coin)
      );
    } else {
      setSelectedAssetFilters([...selectedAssetFilters, item.coin]);
    }
  };

  return (
    <Fragment>
      <div className="filterTitle">Select The Assets You Want To See</div>
      <div className="filterSearch">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search Assets....|"
        />
      </div>
      <div className="filterCoinCard">
        {loading
          ? Array(6)
              .fill("")
              .map((_, i) => (
                <div className="cardBody" key={i}>
                  <Skeleton className="dp coinImage" circle />
                  {/* <img className="coinImage" src={item.icon} alt="" /> */}
                  <div className="coinDetail">
                    <Skeleton className="name" width={200} />
                    <Skeleton className="email" width={200} />
                  </div>
                </div>
              ))
          : allAssets
              ?.filter(
                (allAssets) =>
                  allAssets.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                  allAssets.coin?.toLowerCase().includes(search.toLowerCase())
              )
              ?.map((item) => (
                <div
                  className="cardBody"
                  key={item.coin}
                  onClick={(e) => handleAssetSelection(item)}
                  style={{
                    background: selectedAssetFilters.find(
                      (o) => o === item.coin
                    )
                      ? "whitesmoke"
                      : "",
                  }}
                >
                  <img className="coinImage" src={item.icon} alt="" />
                  <div className="coinDetail">
                    <div className="name">{item.name}</div>
                    <div className="email">
                      {item.count} {item.count > 1 ? "Bonds" : "Bond"}
                    </div>
                  </div>
                </div>
              ))}
        <div className="space"></div>
      </div>
    </Fragment>
  );
}

export default FilterAssetList;
