import React, { useState, useContext, useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import moment from "moment";
import { YesterdayToday } from "../Transactions/VaultComponent/FunctionTools";
import { useCoinContextData } from "../../context/CoinContext";
import { useStore } from "../../components/store/store.ts";
import { useNavigate } from "react-router-dom";
import "./transactionpage.scss";

// images
import edit from "./edit.svg";
import arrows from "./arrow.svg";
import c from "./c.svg";
import downArrow from "./downArrow.svg";
import upArrow from "./upArrow.svg";
import axios from "axios";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const VaultTransactions = () => {
  //   let navigate = useNavigate();
  //   const { coinType } = useStore();
 const userDetails = JSON.parse(localStorage.getItem("partner"));
  const { selectedCoin, transactionData, setTransactionData } =
    useCoinContextData();
  const date = useRef();

  const [loading, setLoading] = useState(false);

useEffect(() => {
  if (!userDetails?.email || !selectedCoin?.coinSymbol) return;

  setLoading(true);

  axios
    .get(`${BASE_URL}/api/vault/txns`, {
      params: {
        app_code: "naavi",
        email: userDetails.email,
        coin: selectedCoin.coinSymbol,
      },
    })
    .then((res) => {
      setTransactionData(res.data.txns);
    })
    .finally(() => setLoading(false));
}, [userDetails?.email, selectedCoin?.coinSymbol]);


  function formatTimestamp(timestamp) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const date = new Date(timestamp);

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = ("0" + date.getMinutes()).slice(-2);

    const daySuffix = getDaySuffix(day);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedDate = `${month} ${day}${daySuffix} ${year} at ${format12HourTime(
      hours
    )}:${minutes} ${period} IST`;

    return formattedDate;
  }

  function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
      return "th";
    }
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  function format12HourTime(hours) {
    if (hours === 0) {
      return 12;
    } else if (hours > 12) {
      return hours - 12;
    } else {
      return hours;
    }
  }

  return (
    <div className="transaction-page">
      <div className="transaction-top-area">
        <div className="coinvalues">
          <span className="coin-balance">
            {loading ? (
              <Skeleton width={200} height={30} />
            ) : selectedCoin?.coinValue ? (
              selectedCoin?.coinValue?.toFixed(4)
            ) : (
              "0.0000"
            )}
          </span>
          <span className="coin-value">
            {loading ? (
              <Skeleton width={100} height={20} />
            ) : selectedCoin?.coinValue_DC ? (
              "$" + selectedCoin?.coinValue_DC?.toFixed(2)
            ) : (
              "$0.00"
            )}
          </span>
        </div>
        <div className="vault-name">
          {loading ? (
            <Skeleton width={150} height={20} />
          ) : (
            selectedCoin?.coinName + " Vault"
          )}
        </div>
      </div>
      <div className="transaction-content">
        {loading ? (
          Array(5)
            .fill("")
            .map((e, i) => {
              return (
                <div
                  className="each-transaction"
                  key={i}
                  style={{ gap: "2rem" }}
                >
                  <div>
                    <Skeleton width={100} height={25} />
                  </div>
                  <div>
                    <Skeleton width={200} height={25} />
                  </div>
                  <div>
                    <Skeleton width={300} height={25} />
                  </div>
                  <div>
                    <Skeleton width={400} height={25} />
                  </div>
                </div>
              );
            })
        ) : transactionData?.length > 0 ? (
          transactionData?.map((e, i) => {
            function sameDay() {
              if (moment(e?.timestamp).format("MMDDYYYY") === date.current) {
                return <></>;
              } else {
                date.current = moment(e?.timestamp).format("MMDDYYYY");
                return (
                  <div className="date-div">
                    <div>{YesterdayToday(e?.timestamp)}</div>
                  </div>
                );
              }
            }
            return (
              <>
                {sameDay()}
                <div className="each-transaction" key={e?._id}>
                  <div className="arr-div">
                    <img src={e?.withdraw ? downArrow : upArrow} alt="" />
                  </div>
                  <div className="txn-details">
                    <div className="txn-txt1">
                      {e?.txn_metadata?.transfer_for}
                    </div>
                    <div className="txn-txt2">
                      {formatTimestamp(e?.timestamp)}
                    </div>
                  </div>
                  <div className="txn-btns">
                    <div className="notes">Notes</div>
                    <div>
                      <img src={edit} alt="" />
                    </div>
                    <div>
                      <img src={arrows} alt="" />
                    </div>
                    <div>
                      <img src={c} alt="" />
                    </div>
                  </div>
                  <div className="amnt1">
                    {e?.amount ? e?.amount?.toFixed(2) : "0.0000000"}
                  </div>
                  <div className="amnt2">
                    {e?.amount ? e?.amount?.toFixed(2) : "0.0000000"}
                  </div>
                  <div className="amnt3">
                    {e?.updated_balance
                      ? e?.updated_balance?.toFixed(2)
                      : "0.0000000"}
                  </div>
                </div>
              </>
            );
          })
        ) : (
          <div className="no-data">
            <div>No Transaction found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultTransactions;
