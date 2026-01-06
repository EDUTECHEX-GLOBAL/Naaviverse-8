import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

const PurchasePage = ({ purchaseData = [], search = "" }) => {
  const [txnData, setTxnData] = useState([]);

  useEffect(() => {
    setTxnData(purchaseData);
  }, [purchaseData]);

  const dateFormat = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const filteredTxns = txnData.filter((item) => {
    const term = search.toLowerCase();
    return (
      item?.clientName?.toLowerCase().includes(term) ||
      item?.clientEmail?.toLowerCase().includes(term) ||
      item?.productName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="crm-all-box">
      {/* Table Header */}
      <div className="crm-purchase-tab">
        <div className="crm-purchase-col2">Date</div>
        <div className="crm-purchase-col2">Customer</div>
        <div className="crm-purchase-col2">Service</div>
        <div className="crm-purchase-col3">Amount</div>
        <div className="crm-purchase-col3">Billing Frequency</div>
        <div className="crm-purchase-col4">Status</div>
      </div>

      {/* Table Data */}
      <div className="purchase-alldata">
        {filteredTxns.length > 0 ? (
          filteredTxns.map((each, i) => (
            <div className="each-purchase" key={i}>
              {/* Date */}
              <div className="crm-purchase-col2">
                {dateFormat(each?.createdAt)}
              </div>

              {/* Customer Name */}
              <div className="crm-purchase-col2">
                {each?.clientName || "Unknown"}
              </div>

              {/* Service Name */}
              <div className="crm-purchase-col2">
                {each?.productName || "N/A"}
              </div>

              {/* Amount */}
              <div className="crm-purchase-col3">
                {each?.amount ? `${each.amount} INR` : "--"}
              </div>

              {/* Billing Frequency */}
              <div className="crm-purchase-col3">
                {each?.billingType || "One-Time"}
              </div>

{/* Status */}
<div className="crm-purchase-col4">
  {each?.status || "N/A"}
</div>

            </div>
          ))
        ) : (
          <div className="no-data">No Purchases Found</div>
        )}
      </div>
    </div>
  );
};

export default PurchasePage;
