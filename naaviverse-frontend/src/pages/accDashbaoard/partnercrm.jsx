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
  crmClientData = [],
  crmPurchaseData = [],
  isClientLoading = false,
  isPurchaseLoading = false,
}) => {
  const [clients, setClients]             = useState([]);
  const [purchases, setPurchases]         = useState([]);
  const [clientLoading, setClientLoading] = useState(true);
  const [purchaseFilter, setPurchaseFilter] = useState('All');

  useEffect(() => {
    if (crmClientData?.length) {
      const normalised = crmClientData.map(c => ({
        ...c,
        name:        c.name || c.username || c.email,
        phone:       c.phone || c.phoneNumber || '—',
        avatar:      (c.name || c.username || c.email || '?').slice(0, 2).toUpperCase(),
        avatarColor: colorFor(c.email || ''),
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
// add this with the other derived stats
   const activeSubsCount = purchases.filter(p => p.status?.toLowerCase() === 'paid').length;


  // ── Filtered lists ───────────────────────────────────────────────────────
  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const purchaseTabs      = ['All', 'Paid', 'Pending', 'Failed'];
  const filteredPurchases = purchases
    .filter(p => purchaseFilter === 'All' || p.status?.toLowerCase() === purchaseFilter.toLowerCase())
    .filter(p =>
      p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.clientEmail?.toLowerCase().includes(search.toLowerCase()) ||
      p.product?.toLowerCase().includes(search.toLowerCase())
    );

  const isLoading = isClientLoading || clientLoading;

  return (
    <div className="crm-page" onClick={() => setShowDrop(false)}>

      {/* ── SUMMARY CARDS ── */}
      <div className="crm-summary-strip">

        <div className="crm-summary-card blue">
          <div className="cs-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <div className="cs-label">Total Clients</div>
            <div className="cs-value">{isLoading ? '—' : clients.length}</div>
            <div className="cs-sub">Registered users</div>
          </div>
        </div>

        <div className="crm-summary-card orange">
          <div className="cs-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <div className="cs-label">Total Revenue</div>
            <div className="cs-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="cs-sub">From paid orders</div>
          </div>
        </div>

        <div className="crm-summary-card emerald">
          <div className="cs-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <div>
            <div className="cs-label">Total Purchases</div>
            <div className="cs-value">{purchases.length}</div>
            <div className="cs-sub">All transactions</div>
          </div>
        </div>


<div className="crm-summary-card violet">
  <div className="cs-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  </div>
  <div>
    <div className="cs-label">Active Subs</div>
    <div className="cs-value">{activeSubsCount}</div>
    <div className="cs-sub">Live subscriptions</div>
  </div>
</div>

      </div>{/* ── END SUMMARY STRIP ── */}

      {/* ── TABS ── */}
      <div className="crm-top-tabs">
        <div
          className={`crm-top-tab ${crmMenu === 'Clients' ? 'active' : ''}`}
          onClick={() => setcrmMenu('Clients')}
        >
          Clients 
        </div>
        <div
          className={`crm-top-tab ${crmMenu === 'Purchases' ? 'active' : ''}`}
          onClick={() => setcrmMenu('Purchases')}
        >
          Purchases 
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
                    <div className="client-name-cell">
                      <div className="client-avatar" style={{ background: client.avatarColor }}>
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
                      <div className="client-name-cell">
                        <div className="client-avatar small" style={{ background: p.avatarColor }}>
                          {p.avatar}
                        </div>
                        <div>
                          <div className="client-name">{p.clientName}</div>
                          <div className="client-sub">{p.clientEmail}</div>
                        </div>
                      </div>
                      <div>
                        <div className="product-name">{p.product || p.productName || '—'}</div>
                        <div className="product-sub">Subscription</div>
                      </div>
                      <div className="date-cell-wrap">
                        <div className="date-main">{date}</div>
                        <div className="date-time">{time}</div>
                      </div>
                      <div className="crm-cell mono amount-cell">
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </div>
                      <div>
                        <span className={`billing-pill ${p.billing?.toLowerCase() === 'monthly' ? 'monthly' : ''}`}>
                          {p.billing || p.billingMethod || '—'}
                        </span>
                      </div>
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