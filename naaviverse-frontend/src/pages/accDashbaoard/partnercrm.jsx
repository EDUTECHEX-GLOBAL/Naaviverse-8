import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './partnercrm.scss';

// ─── AVATAR COLOR PALETTE ────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#6c63ff', '#f0547a', '#2ec4c4', '#f5a742',
  '#5dbc8e', '#e86060', '#4a90d9', '#9b59b6',
];

const colorFor = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return { date: '—', time: '—' };
  const d = new Date(dateStr);
  return {
    date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d),
    time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(d),
  };
};

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid':    return 'status-paid';
    case 'pending': return 'status-pending';
    case 'failed':  return 'status-failed';
    default:        return 'status-default';
  }
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────
const CRMPage = ({
  showDrop,
  setShowDrop,
  search = '',
  crmMenu,
  setcrmMenu,
  crmClientData = [],       // ← data from parent
  crmPurchaseData = [],
  isClientLoading = false,  // ← loading from parent
  isPurchaseLoading = false,
}) => {
  const [clients, setClients]               = useState([]);
  const [purchases, setPurchases]           = useState([]);
  // FIXED: Removed duplicate isClientLoading declaration, using the one from props
  const [clientLoading, setClientLoading]   = useState(true);  // ← renamed to avoid conflict
  const [purchaseFilter, setPurchaseFilter] = useState('All');

  // ── Fetch CRM data on mount or when partnerEmail changes ─────────────────
  // Use data passed from parent — no internal fetch needed
  useEffect(() => {
    if (crmClientData?.length) {
      const normalised = crmClientData.map(c => ({
        ...c,
        name:        c.name || c.username || c.email,
        phone:       c.phone || c.phoneNumber || "—",
        avatar:      (c.name || c.username || c.email || "?").slice(0, 2).toUpperCase(),
        avatarColor: colorFor(c.email || ""),
      }));
      setClients(normalised);

      const allPurchases = normalised.flatMap(c =>
        (c.purchaseList || []).map(p => ({
          ...p,
          clientName:  c.name,
          clientEmail: c.email,
          avatar:      c.avatar,
          avatarColor: c.avatarColor,
        }))
      );
      setPurchases(allPurchases);
    } else {
      setClients([]);
      setPurchases([]);
    }
    setClientLoading(false);
  }, [crmClientData]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalRevenue = purchases
    .filter(p => p.status?.toLowerCase() === 'paid')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  // ── Filtered lists ───────────────────────────────────────────────────────
  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const purchaseTabs       = ['All', 'Paid', 'Pending', 'Failed'];
  const filteredPurchases  = purchases
    .filter(p => purchaseFilter === 'All' || p.status?.toLowerCase() === purchaseFilter.toLowerCase())
    .filter(p =>
      p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.clientEmail?.toLowerCase().includes(search.toLowerCase()) ||
      p.product?.toLowerCase().includes(search.toLowerCase())
    );

  // Use either prop loading or local loading state
  const isLoading = isClientLoading || clientLoading;

  return (
    <div className="crm-page" onClick={() => setShowDrop(false)}>

      {/* ── SUMMARY CARDS ── */}
      <div className="crm-summary-strip">
        <div className="crm-summary-card blue">
          <div className="cs-label">Total Clients</div>
          <div className="cs-value">{isLoading ? '—' : clients.length}</div>
          <div className="cs-sub">Registered users</div>
        </div>
        <div className="crm-summary-card orange">
          <div className="cs-label">Total Revenue</div>
          <div className="cs-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="cs-sub">From paid orders</div>
        </div>
        <div className="crm-summary-card emerald">
          <div className="cs-label">Total Purchases</div>
          <div className="cs-value">{purchases.length}</div>
          <div className="cs-sub">All transactions</div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="crm-top-tabs">
        <div 
          className={`crm-top-tab ${crmMenu === 'Clients' ? 'active' : ''}`} 
          onClick={() => setcrmMenu('Clients')}
        >
          Clients ({filteredClients.length})
        </div>
        <div 
          className={`crm-top-tab ${crmMenu === 'Purchases' ? 'active' : ''}`} 
          onClick={() => setcrmMenu('Purchases')}
        >
          Purchases ({purchases.length})
        </div>
      </div>

      {/* ══════════════════════════════════════
          CLIENTS TABLE
      ══════════════════════════════════════ */}
      {crmMenu === 'Clients' && (
        <div className="crm-table-wrap">
          <div className="crm-table-header clients-grid">
            <span>Client</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Country</span>
            <span>Joined</span>
            <span>Purchases</span>
          </div>
          <div className="crm-table-body">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((_, i) => (
                <div className="crm-skeleton-row clients-grid" key={i}>
                  {[1, 2, 3, 4, 5, 6].map((_, j) => (
                    <Skeleton key={j} height={18} borderRadius={6} />
                  ))}
                </div>
              ))
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client, i) => {
                const joined = formatDate(client.joinedAt || client.createdAt);
                return (
                  <div className="crm-data-row clients-grid" key={i}>
                    {/* Client name + avatar */}
                    <div className="client-name-cell">
                      <div
                        className="client-avatar"
                        style={{ background: client.avatarColor }}
                      >
                        {client.avatar}
                      </div>
                      <div>
                        <div className="client-name">{client.name}</div>
                        <div className="client-sub">{client.email}</div>
                      </div>
                    </div>

                    <div className="crm-cell">{client.email}</div>
                    <div className="crm-cell mono">{client.phone || '—'}</div>
                    <div className="crm-cell">{client.country || '—'}</div>
                    <div className="crm-cell">
                      <span className="date-main">{joined.date}</span>
                    </div>
                    <div className="crm-cell">
                      <span className={`purchase-badge ${client.purchases > 0 ? 'has-purchases' : 'no-purchases'}`}>
                        {client.purchases}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="crm-empty">
                <div className="empty-icon">👥</div>
                <div className="empty-title">No clients found</div>
                <div className="empty-sub">Users who select your paths will appear here</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          PURCHASES TABLE
      ══════════════════════════════════════ */}
      {crmMenu === 'Purchases' && (
        <>
          {/* purchase filter tabs */}
          <div className="purchase-filter-tabs">
            {purchaseTabs.map(tab => {
              const count = tab === 'All' 
                ? purchases.length 
                : purchases.filter(p => p.status?.toLowerCase() === tab.toLowerCase()).length;
              return (
                <div
                  key={tab}
                  className={`purchase-filter-tab ${purchaseFilter === tab ? 'active' : ''}`}
                  onClick={() => setPurchaseFilter(tab)}
                >
                  {tab} ({count})
                </div>
              );
            })}
          </div>

          <div className="crm-table-wrap">
            <div className="crm-table-header purchases-grid">
              <span>Client</span>
              <span>Product</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Billing</span>
              <span>Status</span>
            </div>
            <div className="crm-table-body">
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((p, i) => {
                  const { date, time } = formatDate(p.date || p.createdAt);
                  return (
                    <div className="crm-data-row purchases-grid" key={i}>
                      {/* Client */}
                      <div className="client-name-cell">
                        <div
                          className="client-avatar small"
                          style={{ background: p.avatarColor }}
                        >
                          {p.avatar}
                        </div>
                        <div>
                          <div className="client-name">{p.clientName}</div>
                          <div className="client-sub">{p.clientEmail}</div>
                        </div>
                      </div>

                      {/* Product */}
                      <div>
                        <div className="product-name">{p.product || p.productName || '—'}</div>
                        <div className="product-sub">Subscription</div>
                      </div>

                      {/* Date */}
                      <div className="date-cell-wrap">
                        <div className="date-main">{date}</div>
                        <div className="date-time">{time}</div>
                      </div>

                      {/* Amount */}
                      <div className="crm-cell mono amount-cell">
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </div>

                      {/* Billing */}
                      <div>
                        <span className={`billing-pill ${p.billing?.toLowerCase() === 'monthly' ? 'monthly' : ''}`}>
                          {p.billing || p.billingMethod || '—'}
                        </span>
                      </div>

                      {/* Status */}
                      <div>
                        <span className={getStatusClass(p.status)}>
                          {p.status || '—'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="crm-empty">
                  <div className="empty-icon">🛒</div>
                  <div className="empty-title">No purchases found</div>
                  <div className="empty-sub">Purchase history will appear here</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default CRMPage;