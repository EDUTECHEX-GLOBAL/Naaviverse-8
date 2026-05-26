import React from "react";
import nextId from "react-id-generator";
import "./liquid-asset.style.scss";
import { useHistory, useParams } from "react-router";
import { Context } from "../../../../globalComponents/Context/Context";
import { liquidAssetList } from "../../../../services/postAPIs";
import ChangeCurrency from "../Portals/ChangeCurrency/ChangeCurrency";
import Images from "../../../../assets/0-exporter";
export default function LiquidAsset({ split, handlePDFDownload, downloadRef }) {
  // const { app, type } = useParams();
  // let email = localStorage.getItem("bankerEmailNew");
  let app = localStorage.getItem("app");
  let type = localStorage.getItem("type");
  // let subType = localStorage.getItem("subType");
  const liquidListRef = React.useRef();
  const [shadow, setShadow] = React.useState(false);
  const context = React.useContext(Context);
  const {
    selectedTab,
    valueFormatter,
    currencyImageList,
    userDetails,
    dateFormatter,
    nameImageList,
    refreshTable,
    updateState,
    miniTabSelected,
  } = context;

  const [transactionList, setTransactionList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [changeCurrency, setChangeCurrency] = React.useState("");
  const [selectedTransaction, setSelectedTransaction] = React.useState({
    num: 0,
    data: null,
  });

  const setUpTransactionList = async () => {
    let res = await liquidAssetList({
      app_code: app,
      profile_id: selectedTab.app.profile_id,
      coin: type,
    });
    if (res.data.status) {
      let temp = res.data.txns.map((obj) => {
        return {
          ...obj,
          displayCurrency: type,
          displayValue: obj.amount,
        };
      });
      localStorage.setItem(miniTabSelected.keyId, JSON.stringify(temp));
      setTransactionList([...temp]);
      setLoading(false);
    } else {
      setTransactionList([]);
      setLoading(false);
    }
  };

  const handleCoinClick = (obj, transaction) => {
    transactionList[transaction.num] = {
      ...transactionList[transaction.num],
      displayCurrency: obj.coin,
      displayValue: obj.value * transaction.data.displayValue,
    };
    localStorage.setItem(
      miniTabSelected.keyId,
      JSON.stringify([...transactionList])
    );
    setTransactionList([...transactionList]);
    setChangeCurrency("");
  };
  const handleScroll = () => {
    if (liquidListRef.current.scrollTop > 70) {
      setShadow(true);
    } else {
      setShadow(false);
    }
  };
  React.useEffect(() => {
    if (!selectedTab) return;
    setLoading(true);
    let data = localStorage.getItem(miniTabSelected?.keyId);
    console.log("FIRSTTTTTTTTTTTTTTTTT", data);
    if (!data) {
      setUpTransactionList();
    } else {
      setTransactionList(JSON.parse(data));
      setLoading(false);
    }
  }, [app, type]);

  React.useEffect(() => {
    if (refreshTable === null) return;
    setLoading(true);
    setUpTransactionList();
  }, [refreshTable]);

  return (
    <div
      ref={downloadRef}
      className={`liquid-asset-main ${split ? "split-affected" : ""}`}
    >
      {!changeCurrency ? (
        ""
      ) : (
        <ChangeCurrency
          critical="amount"
          handleCoinClick={handleCoinClick}
          currencyImageList={currencyImageList}
          valueFormatter={valueFormatter}
          closeIt={() => {
            setChangeCurrency("");
            setSelectedTransaction({ num: 0, data: null });
          }}
          transaction={selectedTransaction}
          currency={changeCurrency}
        />
      )}
      <div className={`liquid-asset-header ${shadow ? "show-shadow" : ""}`}>
        {headerList.slice(0, split ? 4 : 8).map((obj) => (
          <h6 key={obj.keyId}>{obj.name}</h6>
        ))}
      </div>
      <div
        onScroll={handleScroll}
        ref={liquidListRef}
        className="liquid-asset-body"
        style={{ height: "calc(100% - 90px)" }}
      >
        {loading || !currencyImageList ? (
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((x) => (
            <div className="liquid-asset-loading">
              <h6>
                <button />
              </h6>
              <h6>
                <button />
              </h6>
              <h6>
                <button />
              </h6>
              <h6>
                <button />
              </h6>
              <h6>
                <button />
              </h6>
              <h6>
                <button />
              </h6>
              <h6>
                <button />
              </h6>
              <h6>
                <button />
              </h6>
            </div>
          ))
        ) : !transactionList.length ? (
          <div className="empty-list">
            <h4>No Transaction Found for {type}.</h4>
          </div>
        ) : (
          transactionList.map((obj, num) => (
            <div className="single-transaction">
              <h6>{dateFormatter(obj.date.split(",")[0])}</h6>
              {split ? (
                ""
              ) : (
                <h6>
                  {obj.date.split(",")[1]}
                  <button>EST</button>
                </h6>
              )}
              <h6>{obj.deposit ? "Deposit" : "Withdraw"}</h6>
              {split ? "" : <h6>Transfer</h6>}
              <h6>Connect</h6>
              {split ? (
                ""
              ) : (
                <h6>
                  <img src={userDetails?.profile_img} />
                  {userDetails?.username}
                </h6>
              )}
              <h6>{valueFormatter(obj.displayValue, obj.displayCurrency)}</h6>
              {split ? (
                ""
              ) : (
                <h6>
                  <button
                    onClick={() => {
                      setSelectedTransaction({ num: num, data: obj });
                      setChangeCurrency(obj.coin);
                    }}
                  >
                    <img src={currencyImageList[obj.displayCurrency]} />
                    {nameImageList[obj.displayCurrency].coinName}
                  </button>
                </h6>
              )}
            </div>
          ))
        )}
      </div>
      <div className="liquid-asset-footer">
        <h6>
          {!transactionList || loading ? 0 : transactionList.length}{" "}
          Transactions
        </h6>
        <h6>
          <button>
            <img src={Images.share} alt="share" />
          </button>
          <button onClick={() => updateState("openDownloadTab", true)}>
            <img src={Images.download} alt="download" />
          </button>
        </h6>
      </div>
    </div>
  );
}
const headerList = [
  { keyId: nextId(), name: "Date", id: "date" },
  { keyId: nextId(), name: "Time", id: "time" },
  { keyId: nextId(), name: "Direction", id: "direction" },
  { keyId: nextId(), name: "Type", id: "type" },
  { keyId: nextId(), name: "Sub-Type", id: "subType" },
  { keyId: nextId(), name: "Counter-party", id: "counterParty" },
  { keyId: nextId(), name: "Amount", id: "amount" },
  { keyId: nextId(), name: "Currency", id: "current" },
];
