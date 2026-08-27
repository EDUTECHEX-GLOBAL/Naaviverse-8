import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useState } from "react";
import { useContext } from "react";
import Scrollbars from "react-custom-scrollbars";
import { GlobalContex } from "../../../globalContext";
import "./withdraw.scss";
import SelectApp from "./AppsList";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingAnimation from "../../LoadingAnimation";
import arrowDown from "../../../static/images/arrowDown.svg"
import { useEffect } from "react";

const NewWithdrawal = ({ step, setStep, setMainMenu, loading, setLoading }) => {
  const {
    loginData,
    bankerEmail,
    setGlobalMenuAdd,
    refetchBrandData,
    setRefetchBrandData,
    setSlider
  } = useContext(GlobalContex);

  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedRecipient, setSlectedRecipient] = useState("Myself");

  const [recipientEmail, setRecipientEmail] = useState("");
  const [response, setResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (step === "") {
      setRecipientEmail("");
      setResponse(null);
      setErrorMessage("");
    }
  }, [step]);

  useEffect(() => {
    if (selectedRecipient === "Myself") {
      setRecipientEmail("");
    }
  }, [selectedRecipient]);

  const validate = () => {
    if (selectedApp && selectedRecipient === "Myself") {
      withdrawFromAll();
    } else if (selectedApp && selectedRecipient === "Other" && recipientEmail) {
      withdrawFromAll();
    }
  };

  const withdrawFromAll = () => {
    setResponse(null);
    setErrorMessage("");
    setLoading(true);

    axios
      .post(
        `https://comms.globalxchange.io/coin/app/dividend/vault/earnings/full/withdraw`,
        {
          email: bankerEmail,
          token: loginData?.idToken,
          app_code: selectedApp?.app_code,
          to_user_email: recipientEmail !== "" ? recipientEmail : bankerEmail,
        }
      )
      .then(({ data }) => {
        if (data.status === false) {
          if (data.message === "jwt expired") {
            setStep("Token Expired");
          } else if (data.message === "To User Vault not Found!") {
            setStep("Error");
            setErrorMessage(data.message);
          }

          toast.success(data.message || "API Error");
        } else {
          setStep("success");
          setResponse(data);
        }
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      })
      .finally(() => {
        setLoading(false);
        // setSelectedApp(null);
        // setRecipientEmail("");
      });
  };

  const getContent = () => {
    switch (step) {
      case "success":
        // setTimeout(() => {
        //   // // navigate("/ventures/Brands");
        //   // window.location.reload();
        //   // setSlider(false);
        // }, 1000);
        // setRefetchBrandData(!refetchBrandData);
        return (
          <>
            <div className="newConglomerate">
              <div className="successHeader">Congratulations</div>
              <div className="successMessage">
                You Have Successfully Transferred The Following Amounts From The
                {selectedApp?.app_name} Revenue Vaults To{" "}
                {recipientEmail !== "" ? recipientEmail : bankerEmail}’s Liquid
                Vaults Inside The {selectedApp.app_name}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>Value Of Withdrawal: </div>
                <div style={{ fontWeight: 700 }}>
                  ${response?.totalWithdrawAmountUSD?.toFixed(2)} USD
                </div>
              </div>
              <div
                style={{
                  paddingTop: "35px",
                  overflowY: "scroll",
                  height: window.innerHeight - 370,
                }}
              >
                {Object.entries(response?.totalWithdrawData).map(
                  (item, index) => {
                    return (
                      <div className="vaultCard">
                        <div>{item[0]}</div>
                        <div>{item[1].toFixed(5)}</div>
                        <div>
                          <div className="vaultButton">Vault</div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
            <div className="footerBtns">
              <div onClick={(e) => setSlider(false)}>Close</div>
              <div
                style={{ background: "#182542", color: "white" }}
                onClick={(e) => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Go To Vaults
              </div>
            </div>
          </>
        );
      case "Error":
        return (
          <>
            <div className="newConglomerate">
              <div className="succesView">
                <div className="labelItm" style={{ textAlign: "center" }}>
                  {errorMessage}
                </div>
              </div>
            </div>

            <div className="footerBtns">
              <div onClick={(e) => setStep("")}>Go Back</div>
              <div
                onClick={(e) => {
                  setStep("");
                }}
              >
                Restart
              </div>
            </div>
          </>
        );

      case "Token Expired":
        return (
          <>
            <div className="newConglomerate">
              <div className="succesView">
                <div className="labelItm" style={{ textAlign: "center" }}>
                  Token Expired. Login Again.
                </div>
              </div>
            </div>

            <div className="footerBtns">
              <div onClick={(e) => setStep("")}>Go Back</div>
              <div
                onClick={(e) => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Logout
              </div>
            </div>
          </>
        );

      case "All Revenue Vaults":
        return (
          <>
            <div className="newConglomerate">
              <Scrollbars
                className="scrollForm"
                renderTrackHorizontal={() => <div />}
                renderThumbHorizontal={() => <div />}
                renderTrackVertical={() => <div />}
                renderThumbVertical={() => <div />}
              >
                {/* Select App */}
                <div className="name">Select App</div>
                {selectedApp?.app_name ? (
                  <div className="user" onClick={() => setStep("Select App")}>
                    <img className="dp" src={selectedApp?.app_icon} alt="" />
                    <div className="userDetail" style={{ padding: "0px" }}>
                      <div className="name">{selectedApp?.app_name}</div>
                      <div className="email">{selectedApp?.app_code}</div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="inputWrap"
                    onClick={() => setStep("Select App")}
                  >
                    <input
                      type="text"
                      className="text"
                      placeholder="Click To Select"
                      readOnly
                    />
                    <div
                      className="btnCheck"
                      style={{
                        border: "none",
                      }}
                    >
                      <img src={arrowDown} width="30px" alt="down" />
                    </div>
                  </div>
                )}

                {/* Recipient Of The Withdrawal */}
                <div className="name">Recipient Of The Withdrawal</div>
                <div style={{ display: "flex", paddingTop: "26px" }}>
                  <div
                    onClick={(e) => setSlectedRecipient("Myself")}
                    className={
                      selectedRecipient === "Myself"
                        ? "selectedButton"
                        : "withdrawButton"
                    }
                  >
                    Myself
                  </div>
                  <div
                    style={{ marginLeft: "15px" }}
                    onClick={(e) => setSlectedRecipient("Other")}
                    className={
                      selectedRecipient === "Other"
                        ? "selectedButton"
                        : "withdrawButton"
                    }
                  >
                    Other
                  </div>
                </div>
                {selectedRecipient === "Other" ? (
                  <>
                    {/* Enter Recipient Email */}
                    <div className="name" style={{ paddingTop: "26px" }}>
                      Enter Recipient Email
                    </div>
                    <div className="inputWrap">
                      <input
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        type="text"
                        className="text"
                        placeholder="Enter Recipient Email..."
                      />
                    </div>
                  </>
                ) : (
                  ""
                )}
              </Scrollbars>
            </div>
            <div
              className="ftBtns"
              style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
            >
              <div className="newField" onClick={() => setStep("")}>
                Go Back
              </div>
              <div className="btnSubmit" onClick={validate}>
                Submit
              </div>
            </div>
          </>
        );

      case "Select App":
        return (
          <div className="newConglomerate">
            <SelectApp
              setSelectedApp={setSelectedApp}
              setStep={setStep}
            // onClose={() => setStep("")}
            />
            <div
              className="ftBtns"
              style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
            >
              <div className="newField" onClick={() => setStep("")}>
                Go Back
              </div>
              <div className="btnSubmit" onClick={() => setStep("")}>
                Submit
              </div>
            </div>
          </div>
        );
      // case "country":
      //   return (
      //     <div className="newConglomerate">
      //       <CountryList setCountry={setCountry} onClose={() => setStep("")} />
      //     </div>
      //   );

      default:
        return (
          <>
            <div style={{ padding: "20px 30px" }}>
              <div className="searchStyle">
                <input
                  type="text"
                  placeholder="Search For New Item To Add.."
                  style={{
                    width: "100%",
                    border: "none",
                    height: "30px",
                    paddingLeft: "20px",
                  }}
                />
              </div>
              <div>
                <div className="appDataCards">From One Revenue Vault</div>
                <div
                  className="appDataCards"
                  onClick={(e) => {
                    setStep("All Revenue Vaults");
                  }}
                >
                  From All Revenue Vaults
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      {loading ? (
        <div
          style={{
            height: "100vh",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoadingAnimation logoAnim sideDraw={true} />
          <div
            style={{
              position: "absolute",
              bottom: 50,
              textAlign: "center",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            Withdrawing From All Revenue Vaults...
          </div>
        </div>
      ) : (
        // <div
        //   style={{
        //     display: "flex",
        //     flexDirection: "column",
        //     justifyContent: "center",
        //     alignItems: "center",
        //     height: "70vh",
        //   }}
        // >
        //   <div className="loader"></div>
        //   <div style={{ padding: "20px", fontWeight: 600, color: "#18191D" }}>
        //     Creating New Brand ...
        //   </div>
        // </div>
        getContent()
      )}
    </>
  );
};

export default NewWithdrawal;
