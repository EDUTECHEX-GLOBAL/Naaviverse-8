import React, { useEffect, useState } from "react";
import "./malls.scss";
import { getOfficialCurrencies } from "./apidata";  
import Skeleton from "react-loading-skeleton";
import { useStore } from "../../../components/store/store.ts";

const CoinComponent = () => {
  const { 
    setMallCoinData, 
    setBuy, 
    setMallSeclectedCoin,
    filteredcoins,
    setfilteredcoins
  } = useStore();

  const [isloading, setisloading] = useState(true);

  useEffect(() => {
    getOfficialCurrencies().then((response) => {
      const result = response?.data?.currencies || [];

      // Convert official currencies to the same format your UI expects
      const formatted = result.map((item) => ({
        coinSymbol: item.code,
        coinValue: item.currency,
        coinImage: "https://flagsapi.com/" + item.code.slice(0,2) + "/flat/64.png"
      }));

      setMallCoinData(formatted);
      setfilteredcoins(formatted);
      setisloading(false);
    });
  }, []);

  return (
    <>
      {isloading
        ? Array(10)
            .fill(0)
            .map((_, index) => (
              <div className="coin-comp" key={index}>
                <Skeleton width={40} height={40} borderRadius={50} />
                <div className="coinnamee">
                  <Skeleton width={75} height={25} />
                </div>
                <div className="coinvaluee">
                  <Skeleton width={75} height={25} />
                </div>
              </div>
            ))
        : filteredcoins?.map((e, i) => (
            <div
              className="coin-comp"
              key={i}
              onClick={() => {
                setBuy("step3");
                setMallSeclectedCoin(e);
              }}
            >
              <img src={e?.coinImage} alt="coin" style={{ width: "12%" }} />
              <div className="coinnamee">{e?.coinSymbol}</div>
              <div className="coinvaluee">{e?.coinValue}</div>
            </div>
          ))}
    </>
  );
};

export default CoinComponent;
