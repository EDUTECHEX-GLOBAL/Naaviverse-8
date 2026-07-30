import React from "react";
import nextId from "react-id-generator";
import LoadingAnimation from "../../../../globalComponents/lotties/LoadingAnimation";
import { liquidAssetList } from "../../../../services/postAPIs";
import "./split-table.style.scss";
import { Context } from "../../../../globalComponents/Context/Context";
import { useParams } from "react-router";
import { bondEarningList, moneyMarketList } from "../../../../services/getAPIs";
export default function SplitTable({ config }) {
  // const { email, type, app } = useParams();
  let email = localStorage.getItem("bankerEmailNew");
  let app = localStorage.getItem("app");
  let type = localStorage.getItem("type");
  // let subType = localStorage.getItem("subType");
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
  } = context;

  const [transactionList, setTransactionList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [header, setHeader] = React.useState([]);
  const setUpTransactionList = async () => {
    let res = await liquidAssetList({
      app_code: config.app.app_code,
      profile_id: config.app.profile_id,
      coin: config.coin.id,
    });
    if (res.data.status) {
      let temp = res.data.txns.map((obj) => {
        return {
          ...obj,
        };
      });
      setTransactionList([...temp]);
      setLoading(false);
    } else {
      setTransactionList([]);
      setLoading(false);
    }
  };
  const setUpTransactionListBonds = async () => {
    let res = await bondEarningList(email, type);
    if (res.data.status) {
      let temp = res.data.interestLogs.map((obj) => {
        return {
          ...obj,
          displayCurrency: type,
          displayValue: obj.credited_interest,
        };
      });
      setTransactionList([...temp]);
      setLoading(false);
    } else {
      setTransactionList([]);
      setLoading(false);
    }
  };
  const setUpTransactionListMoney = async () => {
    let res = await moneyMarketList(email, app, type);
    if (res.data.status) {
      let temp = res.data.logs[0].logs.map((obj) => {
        return {
          ...obj,
          displayCurrency: type,
          displayValue: obj.credited_interest,
        };
      });
      setTransactionList([...temp]);
      setLoading(false);
    } else {
      setTransactionList([]);
      setLoading(false);
    }
  };
  const renderFields = (obj, num) => {
    switch (config.type) {
      case "L":
        return (
          <div className="single-transaction">
            <h6>{dateFormatter(obj.date.split(",")[0])}</h6>
            <h6>{obj.deposit ? "Deposit" : "Withdraw"}</h6>
            <h6>Connect</h6>
            <h6>{valueFormatter(obj.amount, obj.coin)}</h6>
          </div>
        );
      case "BE":
        return (
          <div className="single-transaction">
            <h6>{dateFormatter(obj.date.split(",")[0])}</h6>
            <h6>{obj.contract_id}</h6>
            <h6>Connect</h6>
            <h6>{valueFormatter(obj.credited_interest, obj.coin)}</h6>
          </div>
        );
      case "MM":
        return (
          <div className="single-transaction">
            <h6>{dateFormatter(obj.date.split(",")[0])}</h6>
            <h6>{obj.interest_type}</h6>
            <h6>Connect</h6>
            <h6>{valueFormatter(obj.credited_interest, obj.coin)}</h6>
          </div>
        );

      default:
        break;
    }
  };

  React.useEffect(() => {
    if (!config) return;
    setLoading(true);
    switch (config.type) {
      case "L":
        setUpTransactionList();
        setHeader([...headerList]);
        break;
      case "BE":
        setUpTransactionListBonds();
        setHeader([...headerListBond]);
      case "MM":
        setUpTransactionListMoney();
        setHeader([...headerListMoney]);
      default:
        break;
    }
  }, [config]);

  return loading ? (
    <LoadingAnimation />
  ) : (
    <div className="split-table-main">
      <div className="split-asset-header">
        {header.map((obj) => (
          <h6 key={obj.keyId}>{obj.name}</h6>
        ))}
      </div>
      <div className="split-asset-body">
        {loading || !currencyImageList ? (
          <LoadingAnimation />
        ) : !transactionList.length ? (
          <div className="empty-list">
            <h4>No Transaction Found for {config.coin.id}.</h4>
          </div>
        ) : (
          transactionList.map((obj, num) => renderFields(obj, num))
        )}
      </div>
      <div className="split-asset-footer">
        <h6>
          {!transactionList || loading ? 0 : transactionList.length}{" "}
          Transactions
        </h6>
        <h6></h6>
      </div>
    </div>
  );
}

const headerList = [
  { keyId: nextId(), name: "Date", id: "date" },
  { keyId: nextId(), name: "Direction", id: "direction" },
  { keyId: nextId(), name: "Sub-Type", id: "subType" },
  { keyId: nextId(), name: "Amount", id: "amount" },
];

const headerListBond = [
  { keyId: nextId(), name: "Date", id: "date" },
  { keyId: nextId(), name: "BondHash", id: "bondHash" },
  { keyId: nextId(), name: "Type", id: "type" },
  { keyId: nextId(), name: "Amount", id: "amount" },
];

const headerListMoney = [
  { keyId: nextId(), name: "Date", id: "date" },
  { keyId: nextId(), name: "Interest Type", id: "interestType" },
  { keyId: nextId(), name: "Type", id: "type" },
  { keyId: nextId(), name: "Amount", id: "amount" },
];
