import React from "react";
import "./money-market.style.scss";
import { Context } from "../../../../globalComponents/Context/Context";
import nextId from "react-id-generator";
import { moneyMarketList } from "../../../../services/getAPIs";
import Images from "../../../../assets/0-exporter";
import ChangeCurrency from "../Portals/ChangeCurrency/ChangeCurrency";
export default function MoneyMarketTable({
  email,
  downloadRef,
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
    let res = await moneyMarketList(email, app, coin);
    if (res.data.status) {
      let temp = res.data.logs[0].logs.map((obj) => {
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
    console.log("local mm", miniTabSelected);
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
      className={`money-asset-table ${split ? "split-affected" : ""}`}
      style={{height: '100%'}}
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
      <div className="money-asset-header">
        {headerList.slice(0, split ? 4 : 8).map((obj) => (
          <h6 key={obj.keyId}>{obj.name}</h6>
        ))}
      </div>
      <div className="money-asset-body" style={{ height: "calc(100% - 90px)" }}>
        {loading || !currencyImageList ? (
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((x) => (
            <div className="money-market-loading">
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
                <button>{obj.interest_type}</button>
              </h6>
              {split ? "" : <h6>Transfer</h6>}
              <h6>Connect</h6>
              {split ? (
                ""
              ) : (
                <h6>
                  <img src={allAppsData?.[obj?.app_code]?.app_icon} />
                  {allAppsData?.[obj?.app_code]?.app_name}
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
      <div className="money-asset-footer">
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
  { keyId: nextId(), name: "Interest Type", id: "interestType" },
  { keyId: nextId(), name: "Type", id: "type" },
  { keyId: nextId(), name: "Sub-Type", id: "subType" },
  { keyId: nextId(), name: "Purchased In", id: "purchasedIn" },
  { keyId: nextId(), name: "Amount", id: "amount" },
  { keyId: nextId(), name: "Currency", id: "currency" },
];
