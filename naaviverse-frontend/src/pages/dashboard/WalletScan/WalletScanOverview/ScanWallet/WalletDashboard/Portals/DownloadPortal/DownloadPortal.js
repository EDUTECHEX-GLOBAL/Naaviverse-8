import React from "react";
import { liquidAssetList } from "../../../../../services/postAPIs";
import "./download-portal.style.scss";
import DownloadAppList from "./DownloadAppList";
import DownloadLoading from "./DownloadLoading";
import FormatList from "./FormatList";
import SelectedOption from "./SelectedOption";
import TypeOfAsset from "./TypeOfAsset";
import { CSVLink, CSVDownload } from "react-csv";
import { bondEarningList , moneyMarketList } from "../../../../../services/getAPIs";
import nextId from "react-id-generator";
import Images from "../../../../../assets/0-exporter";
export default function DownloadPortal({
  userDetails,
  type,
  email,
  subType,
  nameImageList,
  selectedTab,
  registeredApps,
  valueFormatter,
  closeIt,
  handlePDFDownload,
}) {
  const [title, setTitle] = React.useState(`Hye ${userDetails.username}`);
  const [para, setPara] = React.useState("One Download Coming Right Up!");
  const [downloadableData, setDownloadableData] = React.useState(null);
  const [which, setWhich] = React.useState("");
  const [config, setConfig] = React.useState({
    app: selectedTab.app,
    selectedTab: type,
    subType: subType,
    selectedFormat: {
      keyId: nextId(),
      name: "CSV",
      id: "csv",
      icon: Images.csv,
      enable: true,
    },
  });
  const renderComponent = () => {
    switch (which) {
      case "format":
        return (
          <FormatList
            setConfig={setConfig}
            config={config}
            setWhich={setWhich}
          />
        );
      case "loading":
        return <DownloadLoading />;

      case "app":
        return (
          <DownloadAppList
            setConfig={setConfig}
            config={config}
            registeredApps={registeredApps}
            setWhich={setWhich}
          />
        );
      case "type":
        return (
          <TypeOfAsset
            setConfig={setConfig}
            config={config}
            type={type}
            setWhich={setWhich}
            nameImageList={nameImageList}
          />
        );
      default:
        return (
          <SelectedOption
            setWhich={setWhich}
            config={config}
            nameImageList={nameImageList}
            selectedTab={selectedTab}
            type={type}
            setDownloadableData={setDownloadableData}
          />
        );
    }
  };
  const whichDownload = () => {
    switch (config.selectedFormat.id) {
      case "csv":
        handleDownload();

        break;
      case "pdf":
        handlePDFDownload();

        break;

      default:
        break;
    }
  };
  const handleDownload = async () => {
    setWhich("loading");
    switch (config.subType) {
      case "L":
        let res = await liquidAssetList({
          app_code: config.app.app_code,
          profile_id: config.app.profile_id,
          coin: type,
        });
        if (res.data.status) {
          let temp = res.data.txns.map((obj) => {
            return {
              direction: obj.withdraw ? "Withdraw" : "Deposit",
              app_code: obj.app_code,
              name: obj.name,
              coin: obj.coin,
              from: obj.from,
              to: obj.to,
              amount: valueFormatter(obj.amount, obj.coin),
              updatedBalance: valueFormatter(obj.updated_balance, obj.coin),
              date: obj.date,
              purchase_id: obj.purchase_id,
            };
          });
          setDownloadableData([...temp]);
          setWhich("");
        } else {
          setWhich("");
        }

        break;
      case "BE":
        let resTwo = await bondEarningList(email, type);
        if (resTwo.data.status) {
          let temp = resTwo.data.interestLogs.map((obj) => {
            return {
              name: obj.name,
              app_code: obj.app_code,
              toApp: obj.toAppcode,
              type: obj.withdraw ? "Withdraw" : "Deposit",
              credited_interest: valueFormatter(
                obj.credited_interest,
                obj.coin
              ),
              current_interest: valueFormatter(obj.current_interest, obj.coin),
              updated_interest: valueFormatter(obj.updated_interest, obj.coin),
              current_vault_balance: valueFormatter(
                obj.current_vault_balance,
                obj.coin
              ),
              updated_vault_balance: valueFormatter(
                obj.updated_vault_balance,
                obj.coin
              ),
              interest_type: obj.interest_type,
              status: obj.status,
              date: obj.date,
            };
          });
          setDownloadableData([...temp]);
          setWhich("");
        } else {
          setWhich("");
        }
        break;

      case "MM":
        let resThree = await moneyMarketList(
          email,
          selectedTab.app.app_code,
          type
        );
        if (resThree.data.status) {
          let temp = resThree.data.logs[0].logs.map((obj) => {
            return {
              coin: obj.coin,
              type: obj.withdraw ? "Withdraw" : "Deposit",
              interest_rate: parseFloat(obj.interest_rate).toFixed(2) + "%",
              interest_rate_annual:
                parseFloat(obj.interest_rate_annual).toFixed(2) + "%",
              origin_interest_rate:
                parseFloat(obj.origin_interest_rate).toFixed(2) + "%",
              original_interest_rate_annual:
                parseFloat(obj.original_interest_rate_annual).toFixed(2) + "%",
              total_interest: valueFormatter(obj.total_interest, obj.coin),
              total_interest_usd: valueFormatter(obj.total_interest, "USD"),
              earned_interest: valueFormatter(obj.earned_interest, obj.coin),
              credited_interest: valueFormatter(
                obj.credited_interest,
                obj.coin
              ),
              commissions_value: valueFormatter(
                obj.commissions_value,
                obj.coin
              ),
              current_interest: valueFormatter(obj.current_interest, obj.coin),
              updated_interest: valueFormatter(obj.updated_interest, obj.coin),
              interest_type: obj.interest_type,
              date: obj.date,
            };
          });
          setDownloadableData([...temp]);
          setWhich("");
        }

      default:
        break;
    }
  };
  React.useEffect(() => {
    switch (which) {
      case "format":
        setTitle("Change Format");
        setPara("Select One Of The Following File Formats");
        break;
      case "app":
        setTitle("Change App");
        setPara("Select One Of Your Open App Tabs");
        break;

      case "type":
        setTitle("Change Tab");
        setPara(`Select One Of The Tabs Open Under ${config.app.app_name}`);
        break;

      default:
        setTitle(`Hey ${userDetails.username}`);
        setPara("One Download Coming Right Up!");
        break;
    }
  }, [which]);
  return (
    <div onClick={() => closeIt()} className="download-portal-main">
      <div
        onClick={(e) => e.stopPropagation()}
        className="download-portal-modal"
      >
        <div className="d-p-m-body">
          <div className="d-p-m-title">
            <img src={userDetails.profile_img} />
            <h4>{title}</h4>
            <p>{para}</p>
          </div>
          <div className="d-p-m-list">{renderComponent()}</div>
        </div>
        <div className="d-p-m-footer">
          <button disabled={!which} onClick={() => (which ? setWhich("") : "")}>
            {!which ? "Export" : "Back"}
          </button>
          {!downloadableData ? (
            <button
              onClick={() =>
                !which
                  ? whichDownload()
                  : which === "loading"
                  ? console.log()
                  : setWhich("")
              }
            >
              {!which
                ? "Download"
                : which === "loading"
                ? "Preparing Data..."
                : "Save"}
            </button>
          ) : (
            <CSVLink
              filename={`${config.app.app_name}-${type}-${config.subType} Ledger.csv`}
              onClick={() => setDownloadableData(null)}
              data={downloadableData}
            >
              Download Now
            </CSVLink>
          )}
        </div>
      </div>
    </div>
  );
}
