import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import MenuNav from '../../../components/MenuNav';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TransactionPage = ({
  showDrop,
  setShowDrop,
  search,
  setSearch,
}) => {

  const [isTxnLoading, setIsTxnLoading] = useState(false);
  const [txnData, setTxnData] = useState([]);
  const [crmMenu, setcrmMenu] = useState('All');

  const dateFormat = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // ✅ FETCH TRANSACTIONS FROM YOUR BACKEND
  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("user"));

    const email = userDetails?.user?.email || userDetails?.email;

    console.log("✅ Using email:", email);

    axios.get(`${BASE_URL}/api/payment/transactions`, {
      params: { email }
    })
      .then(({ data }) => {
        console.log("API RESPONSE:", data);

        if (data?.success) {
          setTxnData(data.data);
        }
      })
      .catch((err) => {
        console.error("❌ Transaction fetch error:", err);
      });

  }, []);

  return (
    <>
      <MenuNav
        showDrop={showDrop}
        setShowDrop={setShowDrop}
        searchTerm={search}
        setSearchterm={setSearch}
        searchPlaceholder="Search transactions..."
      />

      <div className="crm-main" onClick={() => setShowDrop(false)}>

        {/* TOP TAB */}
        <div className="crm-all-menu" style={{ padding: "12px 35px" }}>
          <div
            className="crm-each-menu"
            style={{
              background: "rgba(241, 241, 241, 0.5)",
              fontWeight: "700",
              marginLeft: "0px"
            }}
          >
            All ({txnData?.length})
          </div>
        </div>

        {/* TABLE */}
        <div className="crm-all-box">

          {/* HEADER */}
          <div className="crm-purchase-tab">
            <div className="crm-purchase-col2">Date</div>
            <div className="crm-purchase-col2">Partner</div>
            <div className="crm-purchase-col2">Service</div>
            <div className="crm-purchase-col3">Amount</div>
            <div className="crm-purchase-col3">Billing</div>
            <div className="crm-purchase-col4">Status</div>
          </div>

          {/* DATA */}
          <div className="purchase-alldata">

            {isTxnLoading ? (
              [1, 2, 3, 4, 5].map((_, i) => (
                <div className="each-purchase" key={i}>
                  <Skeleton height={40} />
                </div>
              ))
            ) : txnData.length > 0 ? (

              txnData.map((each, i) => (
                <div className="each-purchase" key={i}>

                  <div className="crm-purchase-col2">
                    {dateFormat(each.createdAt)}
                  </div>

                  <div className="crm-purchase-col2">
                    Naavi
                  </div>

                  <div className="crm-purchase-col2">
                    {each.productName}
                  </div>

                  <div className="crm-purchase-col3">
                    ₹{each.amount}
                  </div>

                  <div className="crm-purchase-col3">
                    {each.billingMethod}
                  </div>

                  <div className="crm-purchase-col4">
                    {each.status}
                  </div>

                </div>
              ))

            ) : (
              <div style={{ padding: "20px", textAlign: "center" }}>
                No transactions found
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
};

export default TransactionPage;