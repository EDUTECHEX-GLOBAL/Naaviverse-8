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
          <div className="crm-all-box">
           
              <>
                <div className="crm-purchase-tab">
                  <div className="crm-purchase-col2">Date</div>
                  <div className="crm-purchase-col2">Partner</div>
                  <div className="crm-purchase-col2">Service</div>
                  <div className="crm-purchase-col3">Amount</div>
                  <div className="crm-purchase-col3">Billing Frequency</div>
                  <div className="crm-purchase-col4">Status</div>
                </div>
                <div className="purchase-alldata">
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
                          <div className="each-purchase">
                            <div className="crm-purchase-col2">{dateFormat(each?.createdAt)}</div>
                            <div className="crm-purchase-col2">{each?.serviceDetails[0]?.productcreatoremail}</div>
                            <div className="crm-purchase-col2">{each?.serviceDetails[0]?.name}</div>
                            <div className="crm-purchase-col3">{each?.serviceDetails[0]?.billing_cycle?.lifetime?.price || each?.serviceDetails[0]?.billing_cycle?.monthly?.price || each?.serviceDetails[0]?.billing_cycle?.annual?.price} {each?.serviceDetails[0]?.billing_cycle?.lifetime?.coin || each?.serviceDetails[0]?.billing_cycle?.monthly?.coin || each?.serviceDetails[0]?.billing_cycle?.annual?.coin}</div>
                            <div className="crm-purchase-col3">{each?.serviceDetails[0]?.chargingtype}</div>
                            <div className="crm-purchase-col4">{each?.serviceDetails[0]?.purchaseStatus? each?.serviceDetails[0]?.purchaseStatus: "N/A"}</div>
                          </div>
                        ))}
                    </>
                  ) : isTxnLoading ? (
                    <>
                      {[1, 2, 3, 4, 5, 6].map((each) => (
                        <div className="each-purchase">
                          <div className="each-purchase-clients">
                            <Skeleton
                              className="each-purchase-head"
                              style={{ width: "150px" }}
                            />
                            <Skeleton
                              className="each-purchase-text"
                              style={{ width: "150px" }}
                            />
                          </div>
                          <div
                            className="each-purchase-services"
                            style={{ display: "flex" }}
                          >
                            <div className="each-product-iconbox">
                              <Skeleton className="each-product-icon" />
                            </div>
                            <div className="each-purchase-data">
                              <Skeleton
                                className="each-purchase-head"
                                style={{ width: "150px" }}
                              />
                              <Skeleton
                                className="each-purchase-text"
                                style={{ width: "150px" }}
                              />
                            </div>
                          </div>
                          <div className="each-purchase-receipt">
                            <Skeleton
                              className="each-purchase-head"
                              style={{ width: "150px" }}
                            />
                            <Skeleton
                              className="each-purchase-text"
                              style={{ width: "150px" }}
                            />
                          </div>
                          <div className="each-purchase-status">
                            <Skeleton
                              className="each-purchase-statustext"
                              style={{ width: "150px" }}
                            />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </>
          
          </div>
        </div>
      </>
     );
}
 
export default TransactionPage;