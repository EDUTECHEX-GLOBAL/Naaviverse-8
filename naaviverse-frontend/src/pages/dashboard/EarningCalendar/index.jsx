import React from "react";
import "./calendar.scss";
import Skeleton from "react-loading-skeleton";

import leftArrow from "../../../static/images/dashboard/arrowLeft.svg";
import rightArrow from "../../../static/images/dashboard/arrowRight.svg";
import { useContext } from "react";
// import { GlobalContex } from "../../../../globalContex";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

import arrowDown from "../../../static/images/dashboard/darrow.svg";

const EarningCalendar = () => {
  // const { collapse, allCoins, bankerEmail } = useContext(GlobalContex);

  const [allCoins, setAllCoins] = useState([])

  const [allMonths, setAllMonths] = useState([
    "January",
    "February",
    "March",
    "April",
    "May",
    "Jun",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);
  const [allDays, setAllDays] = useState([
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ]);
  const [thirtyDays, setThirtyDays] = useState([1, 3, 5, 8, 10]);

  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [firstDay, setFirstDay] = useState(0);

  const [calendarData, setCalendarData] = useState([]);
  const [previousCalandarData, setPreviousCalandarData] = useState([]);
  const [nextCalandarData, setNextCalandarData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [openFilter, setOpenFilter] = useState(false);
  const [filterType, setFilterType] = useState("Net Spread");

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [showOneDayView, setShowOneDayView] = useState(false);

  useEffect(() => {
    setOpenFilter(false);
  }, [filterType]);

  const monthForward = () => {
    if (monthIndex !== 11) {
      setMonthIndex(monthIndex + 1);
    } else {
      setYear(year + 1);
      setMonthIndex(0);
    }
  };

  const monthBackword = () => {
    if (monthIndex !== 0) {
      setMonthIndex(monthIndex - 1);
    } else {
      setYear(year - 1);
      setMonthIndex(11);
    }
  };

  const dateForward = () => {
    // setShowOneDayView(true);
    const splitDate = selectedDay.dateNumber.split("/");

    setSelectedDay({
      dateNumber: `${
        splitDate[0] !== 12
          ? splitDate[1] < getMonthDuration(splitDate[0] - 1)
            ? splitDate[0]
            : Number(splitDate[0]) + 1 > 12
            ? 1
            : Number(splitDate[0]) + 1
          : splitDate[0]
      }/${
        splitDate[1] < getMonthDuration(splitDate[0] - 1)
          ? Number(splitDate[1]) + 1
          : 1
      }/${
        splitDate[0] !== 12
          ? splitDate[1] < getMonthDuration(splitDate[0] - 1)
            ? splitDate[2]
            : Number(splitDate[0]) + 1 > 12
            ? Number(splitDate[2]) + 1
            : splitDate[2]
          : splitDate[2]
      }`,
    });
  };
  const datebackword = () => {
    const splitDate = selectedDay.dateNumber.split("/");

    setSelectedDay({
      dateNumber: `${
        splitDate[0] !== 1
          ? splitDate[1] > 1
            ? splitDate[0]
            : Number(splitDate[0]) - 1 > 0
            ? Number(splitDate[0]) - 1
            : 12
          : 1
      }/${
        splitDate[1] > 1
          ? Number(splitDate[1]) - 1
          : getMonthDuration(splitDate[0])
      }/${
        splitDate[0] !== 1
          ? splitDate[1] > 1
            ? splitDate[2]
            : Number(splitDate[0]) - 1 < 1
            ? Number(splitDate[2]) - 1
            : splitDate[2]
          : splitDate[2]
      }`,
    });
  };

  useEffect(() => {
    if (new Date(`${allMonths[monthIndex]} 1, ${year}`).getUTCDay() !== 6) {
      setFirstDay(new Date(`${allMonths[monthIndex]} 1, ${year}`).getUTCDay());
    } else {
      setFirstDay(-1);
    }
    getMonthDuration(monthIndex);
  }, [monthIndex]);

  const getMonthDuration = (selectedMonthIndex) => {
    // console.log(selectedMonthIndex, ":kjwbkwe");
    if (thirtyDays.find((o) => o === selectedMonthIndex)) {
      if (selectedMonthIndex !== 1) {
        return 30;
      } else {
        if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
          return 29;
        } else {
          return 28;
        }
      }
    } else {
      return 31;
    }
  };

  // useEffect(() => {
  //   setLoading(true);
  //   setCalendarData([]);

  //   let endpoints = [
  //     `https://comms.globalxchange.io/coin/iced/banker/per/day/bond/stats?email="shorupan@gmail.com"&min_date=${monthIndex}/20/${
  //       monthIndex === 0 ? year - 1 : year
  //     }&max_date=${monthIndex + 1}/1/${monthIndex === 0 ? year - 1 : year}`,
  //     `https://comms.globalxchange.io/coin/iced/banker/per/day/bond/stats?email="shorupan@gmail.com"&min_date=${
  //       monthIndex + 1
  //     }/1/${year}&max_date=${monthIndex + 2}/1/${year}`,
  //     `https://comms.globalxchange.io/coin/iced/banker/per/day/bond/stats?email="shorupan@gmail.com"&min_date=${
  //       monthIndex + 2
  //     }/1/${monthIndex === 11 ? year + 1 : year}&max_date=${
  //       monthIndex + 2
  //     }/10/${monthIndex === 11 ? year + 1 : year}`,
  //   ];

  //   axios.all(endpoints.map((endpoint) => axios.get(endpoint))).then((res) => {
  //     setPreviousCalandarData(res[0].data.dates);
  //     setCalendarData(res[1].data.dates);
  //     setNextCalandarData(res[2].data.dates);
  //     setLoading(false);
  //   });
  // }, [monthIndex]);

  const getPreviousData = (date) => {
    return previousCalandarData?.map((item) => {
      if (
        Number(item.date.split("/")[0]) === monthIndex &&
        Number(item.date.split("/")[1]) === Number(date) &&
        Number(item.date.split("/")[2]) ===
          Number(monthIndex === 0 ? year - 1 : year)
      ) {
        return item.coinsData.map((item1) => {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                border: "0.5px solid #E7E7E7",
                marginBottom: "10px",
                height: "40px",
                borderRadius: "5px",
              }}
            >
              <div
                style={{
                  width: "45%",
                  borderRight: "0.5px solid #E7E7E7",
                  display: "flex",
                  padding: "0px 8px",
                  alignItems: "center",
                  fontSize: "1.3vh",
                  fontWeight: 700,
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={
                      allCoins.find((o) => o.coinSymbol === item1.coin)
                        .coinImage
                    }
                    alt=""
                    style={{ width: "12px", height: "12px" }}
                  />
                  <div style={{ paddingLeft: "4px" }}>{item1.coin}</div>
                </div>
              </div>
              <div
                style={{
                  width: "55%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "1.4vh",
                  fontWeight: 700,
                }}
              >
                {conditionalData(item1)}
              </div>
            </div>
          );
        });
      }
    });
  };

  const getData = (date) => {
    return calendarData?.map((item) => {
      if (
        Number(item.date.split("/")[0]) === monthIndex + 1 &&
        Number(item.date.split("/")[1]) === Number(date) &&
        Number(item.date.split("/")[2]) === Number(year)
      ) {
        return item.coinsData.map((item1) => {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                border: "0.5px solid #E7E7E7",
                marginBottom: "10px",
                height: "40px",
                borderRadius: "5px",
              }}
            >
              <div
                style={{
                  width: "45%",
                  borderRight: "0.5px solid #E7E7E7",
                  display: "flex",
                  padding: "0px 8px",
                  alignItems: "center",
                  fontSize: "1.2vh",
                  fontWeight: 700,
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={
                      allCoins.find((o) => o.coinSymbol === item1.coin)
                        .coinImage
                    }
                    alt=""
                    style={{ width: "12px", height: "12px" }}
                  />
                  <div style={{ paddingLeft: "4px" }}>{item1.coin}</div>
                </div>
              </div>
              <div
                style={{
                  width: "55%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "1.4vh",
                  fontWeight: 700,
                }}
              >
                {conditionalData(item1)}
                {/* {item1.spreadEarned.toFixed(4)} */}
              </div>
            </div>
          );
        });
      }
    });
  };

  const getNextData = (date) => {
    return nextCalandarData?.map((item) => {
      if (
        Number(item.date.split("/")[0]) === monthIndex + 2 &&
        Number(item.date.split("/")[1]) === Number(date) &&
        Number(item.date.split("/")[2]) ===
          Number(monthIndex === 11 ? year + 1 : year)
      ) {
        return item.coinsData.map((item1) => {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                border: "0.5px solid #E7E7E7",
                marginBottom: "10px",
                height: "40px",
                borderRadius: "5px",
              }}
            >
              <div
                style={{
                  width: "45%",
                  borderRight: "0.5px solid #E7E7E7",
                  display: "flex",
                  padding: "0px 8px",
                  alignItems: "center",
                  fontSize: "1.3vh",
                  fontWeight: 700,
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={
                      allCoins.find((o) => o.coinSymbol === item1.coin)
                        .coinImage
                    }
                    alt=""
                    style={{ width: "12px", height: "12px" }}
                  />
                  <div style={{ paddingLeft: "4px" }}>{item1.coin}</div>
                </div>
              </div>
              <div
                style={{
                  width: "55%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "1.4vh",
                  fontWeight: 700,
                }}
              >
                {conditionalData(item1)}
                {/* {item1.spreadEarned.toFixed(4)} */}
              </div>
            </div>
          );
        });
      }
    });
  };

  const conditionalData = (data) => {
    switch (filterType) {
      case "Net Spread":
        return data.coin === "USDT"
          ? data.spreadEarned.toFixed(2)
          : data.spreadEarned.toFixed(4);
      case "Bond Holders":
        return data.customersCount;
      case "Capital Raised":
        return data.coin === "USDT"
          ? data.investment_amount.toFixed(2)
          : data.investment_amount.toFixed(4);
      case "Interest Earned":
        return data.coin === "USDT"
          ? data.interestEarned_amount.toFixed(2)
          : data.interestEarned_amount.toFixed(4);
      case "Interest Paid":
        return data.coin === "USDT"
          ? data.interestPaid_amount.toFixed(2)
          : data.interestPaid_amount.toFixed(4);
      case "Custom Comp":
        return data.coin === "USDT"
          ? data.customCom_amount.toFixed(2)
          : data.customCom_amount.toFixed(4);
      case "Bonds Sold":
        return data.bondPurchases;
      default:
        break;
    }
  };

  //Get Selected Day

  const handleDaySelection = (index) => {
    const prevDate =
      getMonthDuration(monthIndex - 1) - firstDay + index <= 31
        ? getMonthDuration(monthIndex - 1) - firstDay + index
        : 0;
    const currentDate =
      getMonthDuration(monthIndex) + firstDay >= index ? index - firstDay : 0;
    const nextDate =
      index > getMonthDuration(monthIndex) + firstDay
        ? index - getMonthDuration(monthIndex) - firstDay
        : 0;

    if (prevDate !== 0) {
      setSelectedDay({
        dateNumber: `${monthIndex === 0 ? 12 : monthIndex}/${prevDate}/${
          monthIndex === 0 ? year - 1 : year
        }`,
        day: ``,
        date: prevDate,
      });
    } else if (currentDate !== 0) {
      setSelectedDay({
        dateNumber: `${monthIndex + 1}/${currentDate}/${year}`,
        day: ``,
        date: currentDate,
      });
    } else if (nextDate !== 0) {
      setSelectedDay({
        dateNumber: `${monthIndex === 11 ? 1 : monthIndex + 2}/${nextDate}/${
          monthIndex === 11 ? year + 1 : year
        }`,
        day: ``,
        date: nextDate,
      });
    }
  };

  //Get One Day Data

  useEffect(() => {
    if (selectedDay) {
      setLoading(true);
      setSelectedDayData(null);
      setShowOneDayView(true);
      const splitDate = selectedDay.dateNumber.split("/");
      console.log(
        splitDate[1],
        getMonthDuration(Number(splitDate[0])),
        "kjhkcfwe"
      );
      let nextDay = `${
        Number(splitDate[1]) === getMonthDuration(Number(splitDate[0]) - 1)
          ? Number(splitDate[0]) + 1
          : splitDate[0]
      }/${
        Number(splitDate[1]) === getMonthDuration(Number(splitDate[0]))
          ? 1
          : Number(splitDate[1]) + 1
      }/${
        Number(splitDate[0]) === 12 ? Number(splitDate[2]) + 1 : splitDate[2]
      }`;

      axios
        .get(
          `https://comms.globalxchange.io/coin/iced/banker/per/day/bond/stats?email="shorupan@gmail.com"&min_date=${selectedDay.dateNumber}&max_date=${nextDay}`
        )
        .then(({ data }) => {
          if (data.status) {
            setSelectedDayData(data.dates[0]);
            setLoading(false);
          }
        });
    }

    // console.log(selectedDay?.dateNumber, "jkwfkejcefrcf");
    // if (selectedDay) {
    //   const foundData = calendarData?.find(
    //     (o) => o.date === selectedDay.dateNumber
    //   );
    //   const foundLastData = previousCalandarData?.find(
    //     (o) => o.date === selectedDay.dateNumber
    //   );
    //   const foundNextData = nextCalandarData?.find(
    //     (o) => o.date === selectedDay.dateNumber
    //   );
    //   console.log(
    //     foundData,
    //     foundLastData,
    //     foundNextData,
    //     selectedDay,
    //     "jhwkecwecf"
    //   );
    //   if (foundData !== undefined) {
    //     setSelectedDayData(foundData);
    //     setShowOneDayView(true);
    //   } else if (foundLastData !== undefined) {
    //     setSelectedDayData(foundLastData);
    //     setShowOneDayView(true);
    //   } else if (foundNextData !== undefined) {
    //     setSelectedDayData(foundNextData);
    //     setShowOneDayView(true);
    //   } else {
    //     setShowOneDayView(false);
    //   }
    // }
  }, [selectedDay]);

  return (
    <>
      <div style={{ height: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "60px",
            padding: "0px 27px",
            background: "whitesmoke",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {showOneDayView ? (
              <div
                className="dayName"
                onClick={(e) => {
                  setShowOneDayView(false);
                  setSelectedDay(null);
                }}
              >
                {new Date(selectedDay.dateNumber).toDateString()}
              </div>
            ) : (
              <div className="monthName">
                {allMonths[monthIndex]} {year}
              </div>
            )}

            <div>
              <img
                className="arrowButtons"
                onClick={showOneDayView ? datebackword : monthBackword}
                src={leftArrow}
                alt=""
              />
              <img
                className="arrowButtons"
                onClick={showOneDayView ? dateForward : monthForward}
                src={rightArrow}
                alt=""
                style={{ marginLeft: "6px" }}
              />
            </div>
          </div>

          {/* {openFilter ? (
            <div className="filterOpen">
              <div
                onClick={(e) => setFilterType("Net Spread")}
                style={{
                  fontWeight: filterType === "Net Spread" ? 700 : "",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>Net Spread</div>
                <img src={arrowDown} alt="" />
              </div>
              <div
                style={{ fontWeight: filterType === "Bond Holders" ? 700 : "" }}
                onClick={(e) => setFilterType("Bond Holders")}
              >
                Bond Holders
              </div>
              <div
                style={{
                  fontWeight: filterType === "Capital Raised" ? 700 : "",
                }}
                onClick={(e) => setFilterType("Capital Raised")}
              >
                Capital Raised
              </div>
              <div
                style={{
                  fontWeight: filterType === "Interest Earned" ? 700 : "",
                }}
                onClick={(e) => setFilterType("Interest Earned")}
              >
                Interest Earned
              </div>
              <div
                style={{
                  fontWeight: filterType === "Interest Paid" ? 700 : "",
                }}
                onClick={(e) => setFilterType("Interest Paid")}
              >
                Interest Paid
              </div>
              <div
                style={{ fontWeight: filterType === "Custom Comp" ? 700 : "" }}
                onClick={(e) => setFilterType("Custom Comp")}
              >
                Custom Comp
              </div>
              <div
                style={{ fontWeight: filterType === "Bonds Sold" ? 700 : "" }}
                onClick={(e) => setFilterType("Bonds Sold")}
              >
                Bonds Sold
              </div>
            </div>
          ) : (
            <div
              style={{ opacity: showOneDayView ? 0.5 : 1 }}
              className="filterClosed"
              onClick={(e) => {
                setOpenFilter(showOneDayView ? false : true);
              }}
            >
              <div>{filterType}</div>
              <img src={arrowDown} alt="" />
            </div>
          )} */}
        </div>
        {!showOneDayView ? (
          <div className="calendarBody">
            {Array(35)
              .fill("")
              .map((item, index) => {
                return (
                  <div
                    style={{ textAlign: "center" }}
                    onClick={(e) => handleDaySelection(index)}
                  >
                    <div
                      style={{
                        height: (window.innerHeight - 183) / 5,
                        border: "0.5px solid #E7E7E7",
                        borderWidth: "0px 0.5px 0.5px 0px",
                      }}
                    >
                      {/* days */}
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 400,
                          paddingTop: "10px",
                        }}
                      >
                        {index < 7 ? <div>{allDays[index]}</div> : ""}
                      </div>
                      {/* Previous Month Dates */}
                      {index <= firstDay ? (
                        <>
                          <div
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                            }}
                          >
                            {getMonthDuration(monthIndex - 1) -
                              firstDay +
                              index}
                          </div>
                          <div
                            style={{
                              padding: "15px 18px",
                              overflowY: "scroll",
                              height:
                                index < 7
                                  ? (window.innerHeight - 140) / 8
                                  : (window.innerHeight - 140) / 9,
                            }}
                          >
                            {loading ? (
                              <>
                                <Skeleton className="name" width="100%" />
                                <Skeleton className="email" width="100%" />
                              </>
                            ) : (
                              getPreviousData(
                                getMonthDuration(monthIndex - 1) -
                                  firstDay +
                                  index
                              )
                            )}
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                      {/* Current Month Dates */}
                      {index > firstDay &&
                      getMonthDuration(monthIndex) + firstDay >= index ? (
                        <>
                          <div
                            style={{
                              // paddingTop: "5px",
                              fontSize: "10px",
                              fontWeight: 700,
                            }}
                          >
                            {index - firstDay}
                          </div>
                          <div
                            style={{
                              padding: "15px 18px",
                              overflowY: "scroll",
                              height:
                                index < 7
                                  ? (window.innerHeight - 140) / 8
                                  : (window.innerHeight - 140) / 7,
                            }}
                          >
                            {loading ? (
                              <>
                                <Skeleton className="name" width="100%" />
                                <Skeleton className="email" width="100%" />
                              </>
                            ) : (
                              getData(index - firstDay)
                            )}
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                      {/* Next Month Dates */}
                      {index > getMonthDuration(monthIndex) + firstDay ? (
                        <>
                          <div
                            style={{
                              paddingTop: "5px",
                              fontSize: "10px",
                              fontWeight: 700,
                            }}
                          >
                            {index - getMonthDuration(monthIndex) - firstDay}
                          </div>
                          <div
                            style={{
                              padding: "15px 18px",
                              overflowY: "scroll",
                              height: (window.innerHeight - 140) / 7,
                            }}
                          >
                            {loading ? (
                              <>
                                <Skeleton className="name" width="100%" />
                                <Skeleton className="email" width="100%" />
                              </>
                            ) : (
                              getNextData(
                                index - getMonthDuration(monthIndex) - firstDay
                              )
                            )}
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div
            className="singeDayBody"
            style={{
              width: window.innerWidth - 365,
              height: window.innerHeight - 182,
            }}
          >
            {!loading ? (
              <div className="singleDayCard">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={allCoins.find((o) => o.coinSymbol === "USD").coinImage}
                    alt=""
                    style={{
                      height: "22px",
                      width: "22px",
                      // background: "gray",
                      borderRadius: "100%",
                    }}
                  />
                  <div className="titleHead" style={{ paddingLeft: "5px" }}>
                    All Assets
                  </div>
                </div>
                <div
                  style={{
                    padding: "45px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div className="title">{selectedDayData?.coinsCount}</div>
                    <div className="subTitle">Assets</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="title">
                      {selectedDayData?.bondPurchases}
                    </div>
                    <div className="subTitle">Bond Contracts</div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "45px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "0.5px solid #E7E7E7",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div className="title">
                      ${selectedDayData?.investment_amount_usd?.toFixed(2)}
                    </div>
                    <div className="subTitle">Capital Raised</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="title">
                      ${selectedDayData?.interestEarned_amount_usd?.toFixed(2)}
                    </div>
                    <div className="subTitle">Interest Earned</div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "45px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "0.5px solid #E7E7E7",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div className="title">
                      ${selectedDayData?.interestPaid_amount_usd?.toFixed(2)}
                    </div>
                    <div className="subTitle">Interest Paid</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="title">
                      $
                      {(
                        selectedDayData?.interestEarned_amount_usd -
                        selectedDayData?.interestPaid_amount_usd
                      )?.toFixed(2)}
                    </div>
                    <div className="subTitle">Gross Spread</div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "45px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "0.5px solid #E7E7E7",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div className="title">
                      ${selectedDayData?.customCom_amount_usd?.toFixed(2)}
                    </div>
                    <div className="subTitle">Custom Comp</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="title">
                      ${selectedDayData?.spreadEarnedUSD?.toFixed(2)}
                    </div>
                    <div className="subTitle">Net Spread</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="singleDayCard">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Skeleton className="dp coinImage" circle />
                  <div className="titleHead" style={{ paddingLeft: "5px" }}>
                    All Assets
                  </div>
                </div>
                <div
                  style={{
                    padding: "45px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div className="title">
                      <Skeleton className="email" width="100%" />
                    </div>
                    <div className="subTitle">Assets</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="title">
                      <Skeleton className="email" width="100%" />
                    </div>
                    <div className="subTitle">Bond Contracts</div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "45px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "0.5px solid #E7E7E7",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div className="title">
                      <Skeleton className="email" width="100%" />
                    </div>
                    <div className="subTitle">Capital Raised</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="title">
                      <Skeleton className="email" width="100%" />
                    </div>
                    <div className="subTitle">Interest Earned</div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "45px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "0.5px solid #E7E7E7",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div className="title">
                      <Skeleton className="email" width="100%" />
                    </div>
                    <div className="subTitle">Interest Paid</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="title">
                      <Skeleton className="email" width="100%" />
                    </div>
                    <div className="subTitle">Gross Spread</div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "45px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "0.5px solid #E7E7E7",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div className="title">
                      <Skeleton className="email" width="100%" />
                    </div>
                    <div className="subTitle">Custom Comp</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="title">
                      <Skeleton className="email" width="100%" />
                    </div>
                    <div className="subTitle">Net Spread</div>
                  </div>
                </div>
              </div>
            )}
            {!loading
              ? selectedDayData?.coinsData.map((item) => {
                  return (
                    <div className="singleDayCard">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={
                            allCoins.find((o) => o.coinSymbol === item.coin)
                              .coinImage
                          }
                          alt=""
                          style={{
                            height: "22px",
                            width: "22px",
                            // background: "gray",
                            borderRadius: "100%",
                          }}
                        />

                        <div
                          className="titleHead"
                          style={{ paddingLeft: "5px" }}
                        >
                          {
                            allCoins.find((o) => o.coinSymbol === item.coin)
                              .coinName
                          }
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "45px 0px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <div className="title">{item?.customersCount}</div>
                          <div className="subTitle">Bond Holders</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="title">{item?.bondPurchases}</div>
                          <div className="subTitle">Bond Contracts</div>
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "45px 0px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderTop: "0.5px solid #E7E7E7",
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <div className="title">
                            {item?.investment_amount.toFixed(4)}
                          </div>
                          <div className="subTitle">Capital Raised</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="title">
                            ${item?.investment_amount_usd.toFixed(2)}
                          </div>
                          <div className="subTitle">Capital Raised (USD)</div>
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "45px 0px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderTop: "0.5px solid #E7E7E7",
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <div className="title">
                            {item?.interestEarned_amount.toFixed(4)}
                          </div>
                          <div className="subTitle">Interest Earned</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="title">
                            ${item?.interestEarned_amount_usd.toFixed(2)}
                          </div>
                          <div className="subTitle">Interest Earned (USD)</div>
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "45px 0px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderTop: "0.5px solid #E7E7E7",
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <div className="title">
                            {item?.interestPaid_amount.toFixed(4)}
                          </div>
                          <div className="subTitle">Interest Paid</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="title">
                            ${item?.interestPaid_amount_usd.toFixed(2)}
                          </div>
                          <div className="subTitle">Interest Paid (USD)</div>
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "45px 0px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderTop: "0.5px solid #E7E7E7",
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <div className="title">
                            {(
                              item?.interestEarned_amount -
                              item?.interestPaid_amount
                            ).toFixed(4)}
                          </div>
                          <div className="subTitle">Gross Spread</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="title">
                            $
                            {(
                              item?.interestEarned_amount_usd -
                              item?.interestPaid_amount_usd
                            ).toFixed(2)}
                          </div>
                          <div className="subTitle">Gross Spread (USD)</div>
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "45px 0px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderTop: "0.5px solid #E7E7E7",
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <div className="title">
                            {item?.customCom_amount.toFixed(4)}
                          </div>
                          <div className="subTitle">Custom Comp</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="title">
                            ${item?.customCom_amount_usd.toFixed(2)}
                          </div>
                          <div className="subTitle">Custom Comp (USD)</div>
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "45px 0px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderTop: "0.5px solid #E7E7E7",
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <div className="title">
                            {item?.spreadEarned.toFixed(4)}
                          </div>
                          <div className="subTitle">Net Spread</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="title">
                            ${item?.spreadEarnedUSD.toFixed(2)}
                          </div>
                          <div className="subTitle">Net Spread (USD)</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              : Array(3)
                  .fill("")
                  .map((item) => {
                    return (
                      <div className="singleDayCard">
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Skeleton className="dp" />

                          <div
                            className="titleHead"
                            style={{ paddingLeft: "5px" }}
                          >
                            <Skeleton className="email" width="100%" />
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "45px 0px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ textAlign: "left" }}>
                            <Skeleton className="email" width="100%" />
                            <div className="subTitle">Bond Holders</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <Skeleton className="email" width="100%" />
                            <div className="subTitle">Bond Contracts</div>
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "45px 0px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderTop: "0.5px solid #E7E7E7",
                          }}
                        >
                          <div style={{ textAlign: "left" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">Capital Raised</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">Capital Raised (USD)</div>
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "45px 0px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderTop: "0.5px solid #E7E7E7",
                          }}
                        >
                          <div style={{ textAlign: "left" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">Interest Earned</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">
                              Interest Earned (USD)
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "45px 0px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderTop: "0.5px solid #E7E7E7",
                          }}
                        >
                          <div style={{ textAlign: "left" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">Interest Paid</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">Interest Paid (USD)</div>
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "45px 0px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderTop: "0.5px solid #E7E7E7",
                          }}
                        >
                          <div style={{ textAlign: "left" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">Gross Spread</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">Gross Spread (USD)</div>
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "45px 0px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderTop: "0.5px solid #E7E7E7",
                          }}
                        >
                          <div style={{ textAlign: "left" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">Custom Comp</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">Custom Comp (USD)</div>
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "45px 0px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderTop: "0.5px solid #E7E7E7",
                          }}
                        >
                          <div style={{ textAlign: "left" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">Net Spread</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="title">
                              <Skeleton className="email" width="100%" />
                            </div>
                            <div className="subTitle">Net Spread (USD)</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
          </div>
        )}
      </div>
    </>
  );
};

export default EarningCalendar;
