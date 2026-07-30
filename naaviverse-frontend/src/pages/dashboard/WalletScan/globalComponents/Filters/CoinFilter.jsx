import React, { useContext, useEffect, useMemo, useState } from "react";
import OtpInput from "react-otp-input";
import classNames from "./settingsModal.module.scss";

import { toast } from "react-toastify";
import { GlobalContex } from "../../globalContext";

function CoinFilter({
  onClose = () => {},
  onSuccess = () => {},
  logoParam,
  allCoins,
  selectedCoin,
  setSelectedCoin,
  openCoinFilter,
  setOpenCoinFilter,
  allBankers,
}) {
  const { selectedApp, loginData, setBankerEmail } = useContext(GlobalContex);

  const [step, setStep] = useState("");
  const [pin, setPin] = useState("");
  const [query, setQuery] = useState("");

  let filteredCoins = allCoins
    ? allCoins.filter((item) => {
        const lowquery = query.toLowerCase();
        return (
          (item.coinName + item.coinSymbol).toLowerCase().indexOf(lowquery) >= 0
        );
      })
    : "";

  useEffect(() => {
    if (pin === "9605") {
      setStep("AdminBankers");
    } else if (pin.length === 4) {
      toast.error("Invalid Pin");
      setPin("");
    }
  }, [pin]);

  return (
    <>
      <div className={classNames.settingsModal}>
        <div
          className={classNames.overlayClose}
          onClick={() => {
            try {
              onClose();
            } catch (error) {}
          }}
        />
        <div className={classNames.settingsCard}>
          <div className={classNames.inCard}>
            <img
              src={logoParam || selectedApp.appFullLogo}
              alt=""
              className={classNames.logo}
            />
            <div style={{ padding: "15px 40px" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#18191D",
                  paddingBottom: "25px",
                }}
              >
                Select Display Currency
              </div>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search Currencies..."
                style={{
                  border: "0.5px solid #E5E5E5",
                  borderRadius: "15px",
                  height: "60px",
                  width: "100%",
                  padding: "0px 30px",
                }}
              />
            </div>

            <div
              style={{
                padding: "0px 40px",
                overflowY: "scroll",
                height: "200px",
              }}
            >
              {filteredCoins.map((item) => {
                return (
                  <div
                    className="coin-card"
                    onClick={(e) => {
                      setSelectedCoin(item);
                      setOpenCoinFilter(false);
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <img src={item.coinImage} alt="" width={30} />
                      &nbsp;&nbsp;&nbsp;{item.coinName}
                    </div>
                    <div>${item.usd_price}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={classNames.footerBtns}>
            <div
              style={{ background: selectedApp.appColor }}
              className={classNames.btnSettings}
              onClick={() => {
                setSelectedCoin({
                  coinImage:
                    "https://apimachine-s3.s3.us-east-2.amazonaws.com/coinImages/dollar.png",
                  coinName: "US Dollar",
                  coinSymbol: "USD",
                  market_cap: 0,
                  symbol: "$",
                  type: "fiat",
                  usd_price: 1,
                  volume_24hr: 0,
                  _24hrchange: 0,
                  _id: "5f21042d0562332558c93180",
                });
                setOpenCoinFilter(false);
              }}
            >
              <span>Reset To USD</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CoinFilter;
