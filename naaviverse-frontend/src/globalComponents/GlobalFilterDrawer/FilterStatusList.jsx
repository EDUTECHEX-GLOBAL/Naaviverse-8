import axios from "axios";
import React, { Fragment, useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";
import { GlobalContex } from "../../globalContext";

function FilterStatusList({ onClose }) {
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
  const [allStatus, setAllStatus] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (selectedAssetFilters.length > 0 && selectedLengthFilter !== "") {
      axios
        .post(
          `https://comms.globalxchange.io/coin/iced/banker/custom/bond/get?email=${bankerEmail}&days=${selectedLengthFilter}`,
          {
            include: {
              coins: [...selectedAssetFilters],
            },
          }
        )
        .then(({ data }) => {
          setAllStatus([
            { name: "Active", count: data.statusData.active },
            { name: "Inactive", count: data.statusData.inactive },
          ]);
          setLoading(false);
        });
    } else if (
      selectedAssetFilters.length === 0 &&
      selectedLengthFilter !== ""
    ) {
      axios
        .post(
          `https://comms.globalxchange.io/coin/iced/banker/custom/bond/get?email=${bankerEmail}&days=${selectedLengthFilter}`
        )
        .then(({ data }) => {
          setAllStatus([
            { name: "Active", count: data.statusData.active },
            { name: "Inactive", count: data.statusData.inactive },
          ]);
          setLoading(false);
        });
    } else if (selectedAssetFilters.length > 0 && selectedLengthFilter === "") {
      axios
        .post(
          `https://comms.globalxchange.io/coin/iced/banker/custom/bond/get?email=${bankerEmail}`,
          {
            include: {
              coins: [...selectedAssetFilters],
            },
          }
        )
        .then(({ data }) => {
          setAllStatus([
            { name: "Active", count: data.statusData.active },
            { name: "Inactive", count: data.statusData.inactive },
          ]);
          setLoading(false);
        });
    } else {
      axios
        .get(
          `https://comms.globalxchange.io/coin/iced/banker/custom/bond/get?email=${bankerEmail}`
        )
        .then(({ data }) => {
          setAllStatus([
            { name: "Active", count: data.statusData.active },
            { name: "Inactive", count: data.statusData.inactive },
          ]);
          setLoading(false);
        });
    }
  }, []);

  // useEffect(() => {
  //   setLoading(true);

  //   axios
  //     .get(
  //       `https://comms.globalxchange.io/coin/iced/banker/custom/bond/get?email=${bankerEmail}`
  //     )
  //     .then(({ data }) => {
  //       console.log(data.statusData.active, "kwjedbwjed");
  //       // setSelectedAssetFilters([...temp]);
  //       setAllStatus([
  //         { name: "Active", count: data.statusData.active },
  //         { name: "Inactive", count: data.statusData.inactive },
  //       ]);
  //       setLoading(false);
  //     });
  // }, []);

  const handleAssetSelection = (item) => {
    if (selectedStatusFilters.find((o) => o === item.name.toLowerCase())) {
      setSelectedStatusFilters(
        selectedStatusFilters.filter((o) => o !== item.name.toLowerCase())
      );
    } else {
      setSelectedStatusFilters([
        ...selectedStatusFilters,
        item.name.toLowerCase(),
      ]);
    }
  };

  return (
    <Fragment>
      <div className="filterTitle">Select The Statuses You Want To See</div>
      <div className="filterSearch">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search Status....|"
        />
      </div>
      <div className="filterCoinCard">
        {loading
          ? Array(6)
              .fill("")
              .map((_, i) => (
                <div className="cardBody">
                  <div className="coinDetail">
                    <div className="userDetail">
                      <Skeleton className="name" width={200} />
                      <Skeleton className="email" width={200} />
                    </div>
                  </div>
                </div>
              ))
          : allStatus
              ?.filter((allStatus) =>
                allStatus.name?.toLowerCase().includes(search.toLowerCase())
              )
              ?.map((item) =>
                item.count > 0 ? (
                  <div
                    className="cardBody"
                    key={item.name}
                    onClick={(e) => handleAssetSelection(item)}
                    style={{
                      background: selectedStatusFilters.find(
                        (o) => o === item.name.toLowerCase()
                      )
                        ? "whitesmoke"
                        : "",
                    }}
                  >
                    <div className="coinDetail">
                      <div className="name">{item.name}</div>
                      <div className="email">
                        {item.count} {item.count > 1 ? "Bonds" : "Bond"}
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )
              )}
        <div className="space"></div>
      </div>
    </Fragment>
  );
}

export default FilterStatusList;
