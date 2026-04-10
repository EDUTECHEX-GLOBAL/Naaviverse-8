import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import MenuNav from '../../../components/MenuNav';
import '../../../pages/VaultTransactions/transactionpage.scss';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TransactionPage = ({
  showDrop,
  setShowDrop,
  search,
  setSearch,
}) => {

  const [isTxnLoading, setIsTxnLoading] = useState(false);
  const [txnData, setTxnData] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  const dateFormat = (dateString) => {
    const date = new Date(dateString);
    const datePart = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
    return { datePart, timePart };
  };

  useEffect(() => {
    setIsTxnLoading(true);
    const userDetails = JSON.parse(localStorage.getItem("user"));
    const email = userDetails?.user?.email || userDetails?.email;

    axios.get(`${BASE_URL}/api/payment/transactions`, {
      params: { email }
    })
      .then(({ data }) => {
        if (data?.success) {
          setTxnData(data.data);
        }
      })
      .catch((err) => {
        console.error("❌ Transaction fetch error:", err);
      })
      .finally(() => setIsTxnLoading(false));
  }, []);

  const tabs = ['All', 'Paid', 'Pending', 'Failed'];

  const filteredData = activeTab === 'All'
    ? txnData
    : txnData.filter(t => t.status?.toLowerCase() === activeTab.toLowerCase());

  const totalSpent = txnData
    .filter(t => t.status?.toLowerCase() === 'paid')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const activePlans = txnData.filter(t => t.status?.toLowerCase() === 'paid').length;

  const lastPayment = txnData.length > 0
    ? dateFormat(txnData[0].createdAt).datePart
    : '—';

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return 'status-default';
    }
  };

  const getBillingClass = (billing) => {
    return billing?.toLowerCase() === 'monthly' ? 'billing-pill monthly' : 'billing-pill';
  };

  return (
    <div style={{ height: '100%', background: '#f0f3fa' }}> 
      <MenuNav
        showDrop={showDrop}
        setShowDrop={setShowDrop}
        searchTerm={search}
        setSearchterm={setSearch}
        searchPlaceholder="Search transactions..."
      />

      <div className="txn-page" onClick={() => setShowDrop(false)}>

        {/* SUMMARY CARDS */}
        <div className="txn-summary-strip">
          <div className="summary-card blue">
            <div className="s-label">Total Spent</div>
            <div className="s-value">₹{totalSpent.toLocaleString('en-IN')}</div>
            <div className="s-sub">Lifetime value</div>
          </div>
          <div className="summary-card green">
            <div className="s-label">Active Plans</div>
            <div className="s-value">{activePlans}</div>
            <div className="s-sub">{activePlans === 1 ? 'Subscription' : 'Subscriptions'}</div>
          </div>
          <div className="summary-card amber">
            <div className="s-label">Last Payment</div>
            <div className="s-value">{lastPayment}</div>
            <div className="s-sub">Most recent</div>
          </div>
        </div>

        {/* TABS */}
        <div className="txn-tabs">
          {tabs.map(tab => {
            const count = tab === 'All'
              ? txnData.length
              : txnData.filter(t => t.status?.toLowerCase() === tab.toLowerCase()).length;
            return (
              <div
                key={tab}
                className={`txn-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab} ({count})
              </div>
            );
          })}
        </div>

        {/* TABLE */}
        <div className="txn-table-wrap">

          {/* HEADER */}
          <div className="txn-header-row">
            <span>Date</span>
            <span>Partner</span>
            <span>Service</span>
            <span>Amount</span>
            <span>Billing</span>
            <span>Status</span>
          </div>

          {/* ROWS */}
          <div className="txn-body">
            {isTxnLoading ? (
              [1, 2, 3, 4, 5].map((_, i) => (
                <div className="txn-skeleton-row" key={i}>
                  <Skeleton height={20} borderRadius={8} />
                  <Skeleton height={20} borderRadius={8} />
                  <Skeleton height={20} borderRadius={8} />
                  <Skeleton height={20} borderRadius={8} />
                  <Skeleton height={20} borderRadius={8} />
                  <Skeleton height={20} borderRadius={8} />
                </div>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((each, i) => {
                const { datePart, timePart } = dateFormat(each.createdAt);
                return (
                  <div className="txn-row" key={i}>

                    <div className="date-cell">
                      <div className="date-main">{datePart}</div>
                      <div className="date-time">{timePart}</div>
                    </div>

                    <div>
                      <div className="partner-badge">
                        <div className="partner-dot" />
                        <span>Naavi</span>
                      </div>
                    </div>

                    <div>
                      <div className="service-name">{each.productName}</div>
                      <div className="service-sub">Subscription</div>
                    </div>

                    <div className="amount-cell">
                      ₹{Number(each.amount).toLocaleString('en-IN')}
                    </div>

                    <div>
                      <span className={getBillingClass(each.billingMethod)}>
                        {each.billingMethod}
                      </span>
                    </div>

                    <div>
                      <span className={getStatusClass(each.status)}>
                        {each.status}
                      </span>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="txn-empty">
                <div className="empty-icon">💳</div>
                <div className="empty-title">No transactions found</div>
                <div className="empty-sub">Your payment history will appear here</div>
              </div>
            )}
          </div>

        </div>
      </div>
   </div> 
  );
};

export default TransactionPage;