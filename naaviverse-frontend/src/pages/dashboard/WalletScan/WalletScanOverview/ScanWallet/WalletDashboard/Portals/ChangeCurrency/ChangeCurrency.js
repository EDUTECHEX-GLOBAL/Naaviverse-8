import React from "react";
import { allCoinsConversion } from "../../../../../services/getAPIs";
import "./change-currency.style.scss";
export default function ChangeCurrency({
  transaction,
  currencyImageList,
  closeIt,
  valueFormatter,
  handleCoinClick,
  critical
}) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [coinList, setCoinList] = React.useState([]);
  const setUpCoins = async () => {
    let res = await allCoinsConversion(transaction.data.coin);
    if (res.data.status) {
      let tempArray = [];
      for (const [key, value] of Object.entries(res.data)) {
        if (["message", "status"].includes(key) || key.includes("price")) {
        } else {
          tempArray = [...tempArray, { coin: key, value: 1 / value }];
        }
      }
      setCoinList([...tempArray]);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    if (!transaction) return;
    setUpCoins();
  }, [transaction]);
  return (
    <div onClick={() => closeIt()} className="change-currency-main">
      <div
        onClick={(e) => e.stopPropagation()}
        className="change-currency-modal"
      >
        <div className="c-c-m-body">
          <div className="c-c-m-above">
            <h3>Transaction Currency</h3>
            <p>Currently Showing Value In {transaction.data.coin}</p>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find An Asset"
            />
          </div>
          <div
            style={{ justifyContent: "space-between" }}
            className="c-c-m-below"
          >
            {loading
              ? [1, 2, 3, 4, 5, 6, 7, 8, 9].map((obj) => (
                  <div className="coin-list-loader">
                    <div>
                      <button></button>
                    </div>
                    <p>XXXXXXX</p>
                    <p>XXXXXXXXXX</p>
                  </div>
                ))
              : 
              coinList
                  .filter((x) => {
                    return x.coin
                      .toLowerCase()
                      .startsWith(searchTerm.toLowerCase());
                  }).length === 0?
                  <h5>No results found</h5>
                  :
              coinList
                  .filter((x) => {
                    return x.coin
                      .toLowerCase()
                      .startsWith(searchTerm.toLowerCase());
                  })
                  .map((obj) => (
                    <div className="single-coin">
                      <div className="single-coin-wrapper">
                        <div onClick={() => handleCoinClick(obj, transaction)}>
                          <img src={currencyImageList[obj.coin]} />
                        </div>
                        <p>{obj.coin}</p>
                        <h6>
                          {valueFormatter(
                            obj.value * transaction.data[critical],
                            obj.coin
                          )}
                        </h6>
                      </div>
                    </div>
                  ))}
          </div>
        </div>
        <div className="c-c-m-footer">
          <div>
            <h6>Volume:</h6>
            <h6>
              {valueFormatter(transaction.data[critical], transaction.data.coin)} {transaction.data.coin}
            </h6>
          </div>
        </div>
      </div>
    </div>
  );
}
