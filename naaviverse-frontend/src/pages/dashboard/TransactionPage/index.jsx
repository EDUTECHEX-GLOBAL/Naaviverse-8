import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import MenuNav from '../../../components/MenuNav';

const TransactionPage = ({
    showDrop,
    setShowDrop,
    search,
    setSearch,
    searchic,
    profile,
    downarrow
}) => {

    const [isTxnLoading, setIsTxnLoading] = useState(false)
    const [txnData, setTxnData] = useState([])
    const [crmMenu, setcrmMenu] = useState('All')

    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
        };

        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
        return formattedDate
    }

    useEffect(() => {
        const userDetails = JSON.parse(localStorage.getItem("user"));
        axios.get(`https://careers.marketsverse.com/userpurchase/get?userId=${userDetails?.user?._id}`).then(({data})=> {
            if(data?.status){
                console.log(data, "ljefhkjwefkwef")
                setTxnData(data?.data)
            }
        })
    }, [])


    return ( 
        <>
         <MenuNav 
            showDrop={showDrop}
            setShowDrop={setShowDrop}
            searchTerm={search}
            setSearchterm={setSearch}
            searchPlaceholder={crmMenu === "Followers"
            ? "Search Followers.."
            : crmMenu === "Purchases"
            ? "Search Purchases.."
            : crmMenu === "Users"
            ? "Search Users.."
            : "Search Clients..."}
          />
        <div className="crm-main" onClick={() => setShowDrop(false)}>
          <div
            className="crm-all-menu"
            style={{ padding: "12px 35px" }}
          >
            <div
              className="crm-each-menu"
              style={{
                display: crmMenu === "All" ? "" : "none",
                background:
                  crmMenu === "All"
                    ? "rgba(241, 241, 241, 0.5)"
                    : "",
                fontWeight: crmMenu === "All" ? "700" : "",
                marginLeft:"0px"
              }}
              onClick={() => {
                setcrmMenu("All");
                setSearch("");
              }}
            >
              All ({txnData?.length})
            </div>

            <div
              className="crm-each-menu"
              style={{
                display: crmMenu !== "All" ? "" : "none",
                marginLeft:"0px"
              }}
              onClick={() => {
                setcrmMenu("All");
                setSearch("");
              }}
            >
              All
            </div>
          </div>

          {/* CARD LAYOUT SECTION */}
          <div style={{
            padding: "15px 35px",
          }}>
            
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}>
              {!isTxnLoading && txnData.length > 0 ? (
                <>
                  {txnData
                    ?.filter(
                      (item) =>
                        item?.serviceDetails[0]?.name
                          .toLowerCase()
                          .startsWith(search?.toLowerCase()) ||
                        item.purchaseStatus
                          .toLowerCase()
                          .startsWith(search?.toLowerCase())
                    )
                    ?.map((each, i) => (
                      <div key={i} style={{
                        width: "100%",
                        borderRadius: "12px",
                        backgroundColor: "white",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        overflow: "hidden",
                        border: "1px solid #eee",
                      }}>
                        {/* Card Header */}
                        <div style={{
                          padding: "15px",
                          borderBottom: "1px solid #f0f0f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: "#f9f9f9"
                        }}>
                          <div style={{
                            fontWeight: "500",
                            fontSize: "14px"
                          }}>
                            {dateFormat(each?.createdAt)}
                          </div>
                          <div style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: each?.serviceDetails[0]?.purchaseStatus === "completed" ? "#e6f7e6" : "#fff3e0",
                            color: each?.serviceDetails[0]?.purchaseStatus === "completed" ? "#2e7d32" : "#e65100"
                          }}>
                            {each?.serviceDetails[0]?.purchaseStatus || "N/A"}
                          </div>
                        </div>
                        
                        {/* Card Body */}
                        <div style={{
                          padding: "15px",
                        }}>
                          {/* Service row */}
                          <div style={{
                            marginBottom: "12px",
                          }}>
                            <div style={{
                              fontSize: "13px",
                              color: "#666",
                              marginBottom: "4px"
                            }}>
                              Service
                            </div>
                            <div style={{
                              fontSize: "16px",
                              fontWeight: "500"
                            }}>
                              {each?.serviceDetails[0]?.name}
                            </div>
                          </div>
                          
                          {/* Partner row */}
                          <div style={{
                            marginBottom: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                          }}>
                            <div>
                              <div style={{
                                fontSize: "13px",
                                color: "#666",
                                marginBottom: "4px"
                              }}>
                                Partner
                              </div>
                              <div style={{
                                fontSize: "14px",
                              }}>
                                {each?.serviceDetails[0]?.productcreatoremail}
                              </div>
                            </div>
                            <div>
                              <div style={{
                                fontSize: "13px",
                                color: "#666",
                                marginBottom: "4px"
                              }}>
                                Billing
                              </div>
                              <div style={{
                                fontSize: "14px",
                              }}>
                                {each?.serviceDetails[0]?.chargingtype}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Footer */}
                        <div style={{
                          padding: "15px",
                          borderTop: "1px solid #f0f0f0",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          backgroundColor: "#fafafa"
                        }}>
                          <div style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#1976d2"
                          }}>
                            {each?.serviceDetails[0]?.billing_cycle?.lifetime?.price || 
                            each?.serviceDetails[0]?.billing_cycle?.monthly?.price || 
                            each?.serviceDetails[0]?.billing_cycle?.annual?.price} 
                            {" "}
                            {each?.serviceDetails[0]?.billing_cycle?.lifetime?.coin || 
                            each?.serviceDetails[0]?.billing_cycle?.monthly?.coin || 
                            each?.serviceDetails[0]?.billing_cycle?.annual?.coin}
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              ) : isTxnLoading ? (
                <>
                  {[1, 2, 3, 4, 5, 6].map((each, i) => (
                    <div key={i} style={{
                      width: "100%",
                      borderRadius: "12px",
                      backgroundColor: "white",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      overflow: "hidden",
                      padding: "15px",
                    }}>
                      <Skeleton height={24} width="60%" style={{ marginBottom: "15px" }} />
                      <Skeleton height={18} style={{ marginBottom: "8px" }} />
                      <Skeleton height={18} style={{ marginBottom: "8px" }} />
                      <Skeleton height={18} style={{ marginBottom: "15px" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Skeleton height={18} width="40%" />
                        <Skeleton height={18} width="30%" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{
                  padding: "30px 30px",
                  textAlign: "center",
                  gridColumn: "1 / -1",
                  paddingright:"30px"
                }}>
                  No transactions found
                </div>
              )}
            </div>
          </div>
        </div>
      </>
     );
}
 
export default TransactionPage;
