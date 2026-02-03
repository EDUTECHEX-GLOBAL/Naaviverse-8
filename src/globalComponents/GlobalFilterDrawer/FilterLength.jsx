import axios from "axios";
import React, { Fragment, useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";
import { GlobalContex } from "../../globalContext";

function FilterLength({ onClose }) {
  const { bankerEmail, selectedLengthFilter, setSelectedLengthFilter } =
    useContext(GlobalContex);
  const [search, setSearch] = useState("");
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(
        `https://comms.globalxchange.io/coin/iced/banker/custom/bond/get?email=${bankerEmail}`
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
  }, []);

  const handleAssetSelection = (item) => {
    if (selectedLengthFilter.find((o) => o === item.coin)) {
      setSelectedLengthFilter(
        selectedLengthFilter.filter((o) => o !== item.coin)
      );
    } else {
      setSelectedLengthFilter([...selectedLengthFilter, item.coin]);
    }
  };

  return (
    <Fragment>
      <div className="filterTitle">Enter The Bond Length You Want To See</div>
      <div
        // className="inputWrap"
        //   onClick={() => setStep("bondAsset")}
        style={{
          display: "flex",
          height: "64px",
          border: "0.5px solid #E7E7E7",
        }}
      >
        <input
          value={selectedLengthFilter}
          onChange={(e) => setSelectedLengthFilter(e.target.value)}
          style={{ width: "100%", border: "none", paddingLeft: "20px" }}
          type="number"
          //   className="text"
          placeholder="0"
        />
        <div
          //   className="btnCheck"
          style={{
            width: "119px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderLeft: "0.5px solid #E7E7E7",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          Days
        </div>
      </div>
    </Fragment>
  );
}

export default FilterLength;
