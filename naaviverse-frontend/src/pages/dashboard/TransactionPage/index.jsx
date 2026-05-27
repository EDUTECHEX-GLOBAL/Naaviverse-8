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

  const [isTxnLoading, setIsTxnLoading]   = useState(false);
  const [txnData, setTxnData]             = useState([]);
  const [activeTab, setActiveTab]         = useState('All');
  const [downloadingId, setDownloadingId] = useState(null); // ← tracks which row is downloading

  const dateFormat = (dateString) => {
    const date = new Date(dateString);
    const datePart = new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }).format(date);
    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: 'numeric', hour12: true,
    }).format(date);
    return { datePart, timePart };
  };

  useEffect(() => {
    setIsTxnLoading(true);
    const userDetails = JSON.parse(localStorage.getItem("user"));
    const email = userDetails?.user?.email || userDetails?.email;

    axios.get(`${BASE_URL}/api/payment/transactions`, { params: { email } })
      .then(({ data }) => { if (data?.success) setTxnData(data.data); })
      .catch(err => console.error("❌ Transaction fetch error:", err))
      .finally(() => setIsTxnLoading(false));
  }, []);

  // ── Download invoice PDF ──────────────────────────────────────
  const handleDownloadInvoice = async (razorpayPaymentId) => {
    if (!razorpayPaymentId) return;
    setDownloadingId(razorpayPaymentId);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/payment/invoice/${razorpayPaymentId}`,
        { responseType: 'blob' }
      );
      const url      = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link     = document.createElement('a');
      link.href      = url;
      link.setAttribute('download', `Naavi_Invoice_${razorpayPaymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Invoice download error:", err);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const tabs = ['All', 'Paid', 'Pending', 'Failed'];

  const filteredData = activeTab === 'All'
    ? txnData
    : txnData.filter(t => t.status?.toLowerCase() === activeTab.toLowerCase());

  const totalSpent = txnData
    .filter(t => t.status?.toLowerCase() === 'paid')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const activePlans  = txnData.filter(t => t.status?.toLowerCase() === 'paid').length;
  const lastPayment  = txnData.length > 0 ? dateFormat(txnData[0].createdAt).datePart : '—';

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':    return 'status-paid';
      case 'pending': return 'status-pending';
      case 'failed':  return 'status-failed';
      default:        return 'status-default';
    }
  };

  const getBillingClass = (billing) =>
    billing?.toLowerCase() === 'monthly' ? 'billing-pill monthly' : 'billing-pill';

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

        {/* ── SUMMARY CARDS ───────────────────────────────────── */}
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

        {/* ── TABS ────────────────────────────────────────────── */}
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

        {/* ── TABLE ───────────────────────────────────────────── */}
        <div className="txn-table-wrap">

          {/* Header — 7 columns now (added Invoice) */}
          <div className="txn-header-row">
            <span>Date</span>
            <span>Partner</span>
            <span>Service</span>
            <span>Amount</span>
            <span>Billing</span>
            <span>Status</span>
            <span>Invoice</span>
          </div>

          <div className="txn-body">
            {isTxnLoading ? (
              [1, 2, 3, 4, 5].map((_, i) => (
                <div className="txn-skeleton-row" key={i}>
                  {[...Array(7)].map((__, j) => (
                    <Skeleton key={j} height={20} borderRadius={8} />
                  ))}
                </div>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((each, i) => {
                const { datePart, timePart } = dateFormat(each.createdAt);
                const isPaid       = each.status?.toLowerCase() === 'paid';
                const isDownloading = downloadingId === each.razorpayPaymentId;

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

                    {/* ── Download button ── */}
                    <div>
                      {isPaid ? (
                        <button
                          className={`invoice-btn ${isDownloading ? 'invoice-btn--loading' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadInvoice(each.razorpayPaymentId);
                          }}
                          disabled={isDownloading}
                          title="Download PDF invoice"
                        >
                          {isDownloading ? (
                            <span className="invoice-btn__spinner" />
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.2"
                              strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          )}
                          <span>{isDownloading ? 'Preparing…' : 'PDF'}</span>
                        </button>
                      ) : (
                        <span className="invoice-na">—</span>
                      )}
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="txn-empty">
               <div className="empty-icon">
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l3-2 2 2 2-2 2 2 2-2 3 2V2l-3 2-2-2-2 2-2-2-2 2-3-2z"/>
    <line x1="8" y1="10" x2="16" y2="10"/>
    <line x1="8" y1="14" x2="14" y2="14"/>
  </svg>
</div>
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