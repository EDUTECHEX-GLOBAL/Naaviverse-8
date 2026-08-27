import React from "react";
import nextId from "react-id-generator";
import Images from "../../../../assets/0-exporter";
import { bondEarningList } from "../../../../services/getAPIs";
import { Context } from "../../../../globalComponents/Context/Context";
import ChangeCurrency from "../Portals/ChangeCurrency/ChangeCurrency";
import Notification from "../Portals/Notification/Notification";
import "./bond-earnings-table.style.scss";
export default function BondEarningsTable({
  downloadRef,
  email,
  coin,
  split,
  app,
}) {
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
    allAppsData,
    miniTabSelected,
  } = context;
  const [transactionList, setTransactionList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [changeCurrency, setChangeCurrency] = React.useState("");
  const [show, setShow] = React.useState("");
  const [selectedTransaction, setSelectedTransaction] = React.useState({
    num: 0,
    data: null,
  });
  const setUpTransactionList = async () => {
    console.log("email", email);
    console.log("coin", coin);
    let res = await bondEarningList(email, coin);
    if (res.data.status) {
      let temp = res.data.interestLogs.map((obj) => {
        return {
          ...obj,
          displayCurrency: coin,
          displayValue: obj.credited_interest,
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
  React.useEffect(() => {
    console.log("local be", miniTabSelected);
    if (!selectedTab) return;
    setLoading(true);
    let data = localStorage.getItem(miniTabSelected?.keyId);
    if (!data) {
      setUpTransactionList();
    } else {
      setTransactionList(JSON.parse(data));
      setLoading(false);
    }
  }, [app, coin]);

  React.useEffect(() => {
    if (refreshTable === null) return;
    setLoading(true);
    setUpTransactionList();
  }, [refreshTable]);
  return (
    <div
      ref={downloadRef}
      className={`bond-asset-table ${split ? "split-affected" : ""}`}
    >
      {!changeCurrency ? (
        ""
      ) : (
        <ChangeCurrency
          critical="credited_interest"
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
      <Notification
        closeIt={() => setShow(false)}
        enabled={!show ? false : true}
        title="Bond Hash"
        moreDetails={show}
      />
      <div className="bond-asset-header">
        {headerList.slice(0, split ? 4 : 8).map((obj) => (
          <h6 key={obj.keyId}>{obj.name}</h6>
        ))}
      </div>
      <div className="bond-asset-body" style={{ height: "calc(100% - 90px)" }}>
        {loading || !currencyImageList ? (
          
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((x) => (
            <div className="bond-earning-loading">
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
            <h4>No Transaction Found for {coin}.</h4>
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
              <h6>
                <button onClick={() => setShow(obj.contract_id)}>Show</button>
              </h6>
              {split ? "" : <h6>Transfer</h6>}
              <h6>Connect</h6>
              {split ? (
                ""
              ) : (
                <h6>
                  <img src={allAppsData?.[obj?.origin_app_code]?.app_icon} />
                  {allAppsData?.[obj?.origin_app_code]?.app_name}
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
      <div className="bond-asset-footer">
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
  { keyId: nextId(), name: "BondHash", id: "bondHash" },
  { keyId: nextId(), name: "Type", id: "type" },
  { keyId: nextId(), name: "Sub-Type", id: "subType" },
  { keyId: nextId(), name: "Purchased In", id: "purchasedIn" },
  { keyId: nextId(), name: "Amount", id: "amount" },
  { keyId: nextId(), name: "Currency", id: "current" },
];
