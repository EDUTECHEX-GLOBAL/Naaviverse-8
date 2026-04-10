import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './partnercrm.scss';

// ─── STATIC DATA ────────────────────────────────────────────────────────────
const STATIC_CLIENTS = [
  {
    id: 1,
    name: 'Arjun Mehta',
    email: 'arjun.mehta@gmail.com',
    phone: '+91 98765 43210',
    country: 'India',
    purchases: 3,
    joinedAt: '2025-11-14',
    avatar: 'AM',
    avatarColor: '#6c63ff',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya.sharma@outlook.com',
    phone: '+91 87654 32109',
    country: 'India',
    purchases: 1,
    joinedAt: '2025-12-02',
    avatar: 'PS',
    avatarColor: '#f0547a',
  },
  {
    id: 3,
    name: 'Rahul Nair',
    email: 'rahul.nair@yahoo.com',
    phone: '+91 76543 21098',
    country: 'India',
    purchases: 2,
    joinedAt: '2026-01-08',
    avatar: 'RN',
    avatarColor: '#2ec4c4',
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    email: 'sneha.reddy@gmail.com',
    phone: '+91 65432 10987',
    country: 'India',
    purchases: 4,
    joinedAt: '2026-01-22',
    avatar: 'SR',
    avatarColor: '#f5a742',
  },
  {
    id: 5,
    name: 'Vikram Patel',
    email: 'vikram.patel@gmail.com',
    phone: '+91 54321 09876',
    country: 'India',
    purchases: 0,
    joinedAt: '2026-02-10',
    avatar: 'VP',
    avatarColor: '#5dbc8e',
  },
  {
    id: 6,
    name: 'Ananya Das',
    email: 'ananya.das@hotmail.com',
    phone: '+91 43210 98765',
    country: 'India',
    purchases: 2,
    joinedAt: '2026-03-01',
    avatar: 'AD',
    avatarColor: '#e86060',
  },
];

const STATIC_PURCHASES = [
  {
    id: 1,
    clientName: 'Arjun Mehta',
    clientEmail: 'arjun.mehta@gmail.com',
    product: 'Naavi Micro Plan',
    amount: 4188,
    billing: 'Annual',
    status: 'Paid',
    date: '2026-04-06T16:55:00',
    avatar: 'AM',
    avatarColor: '#6c63ff',
  },
  {
    id: 2,
    clientName: 'Priya Sharma',
    clientEmail: 'priya.sharma@outlook.com',
    product: 'Career Guidance Session',
    amount: 999,
    billing: 'One Time',
    status: 'Paid',
    date: '2026-03-18T11:20:00',
    avatar: 'PS',
    avatarColor: '#f0547a',
  },
  {
    id: 3,
    clientName: 'Rahul Nair',
    clientEmail: 'rahul.nair@yahoo.com',
    product: 'Naavi Pro Add-on',
    amount: 799,
    billing: 'Monthly',
    status: 'Pending',
    date: '2026-03-12T09:45:00',
    avatar: 'RN',
    avatarColor: '#2ec4c4',
  },
  {
    id: 4,
    clientName: 'Sneha Reddy',
    clientEmail: 'sneha.reddy@gmail.com',
    product: 'IB Counselling Pack',
    amount: 2499,
    billing: 'One Time',
    status: 'Paid',
    date: '2026-02-28T14:10:00',
    avatar: 'SR',
    avatarColor: '#f5a742',
  },
  {
    id: 5,
    clientName: 'Sneha Reddy',
    clientEmail: 'sneha.reddy@gmail.com',
    product: 'Naavi Micro Plan',
    amount: 4188,
    billing: 'Annual',
    status: 'Paid',
    date: '2026-01-15T10:00:00',
    avatar: 'SR',
    avatarColor: '#f5a742',
  },
  {
    id: 6,
    clientName: 'Arjun Mehta',
    clientEmail: 'arjun.mehta@gmail.com',
    product: 'CBSE Path Bundle',
    amount: 1299,
    billing: 'One Time',
    status: 'Failed',
    date: '2026-01-10T08:30:00',
    avatar: 'AM',
    avatarColor: '#6c63ff',
  },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return {
    date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d),
    time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(d),
  };
};

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid': return 'status-paid';
    case 'pending': return 'status-pending';
    case 'failed': return 'status-failed';
    default: return 'status-default';
  }
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────
const CRMPage = ({
  showDrop,
  setShowDrop,
  search = '',
  crmMenu,
  setcrmMenu,
  // real data props (optional — falls back to static)
  crmClientData,
  crmPurchaseData,
  isClientLoading = false,
  isPurchaseLoading = false,
}) => {
  const [purchaseFilter, setPurchaseFilter] = useState('All');

  const clients = (crmClientData && crmClientData.length > 0) ? crmClientData : STATIC_CLIENTS;
  const purchases = (crmPurchaseData && crmPurchaseData.length > 0) ? crmPurchaseData : STATIC_PURCHASES;

  // ── summary stats ──
  const totalClients = clients.length;
  const totalRevenue = purchases
    .filter(p => p.status?.toLowerCase() === 'paid')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalPurchases = purchases.length;

  // ── filters ──
  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const purchaseTabs = ['All', 'Paid', 'Pending', 'Failed'];
  const filteredPurchases = purchases
    .filter(p =>
      purchaseFilter === 'All' || p.status?.toLowerCase() === purchaseFilter.toLowerCase()
    )
    .filter(p =>
      p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.clientEmail?.toLowerCase().includes(search.toLowerCase()) ||
      p.product?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="crm-page" onClick={() => setShowDrop(false)}>

     {/* ── SUMMARY CARDS ── */}
<div className="crm-summary-strip">
  <div className="crm-summary-card blue">  {/* Changed from purple to blue */}
    <div className="cs-label">Total Clients</div>
    <div className="cs-value">{totalClients}</div>
    <div className="cs-sub">Registered users</div>
  </div>
  <div className="crm-summary-card orange">  {/* Changed from pink to orange */}
    <div className="cs-label">Total Revenue</div>
    <div className="cs-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
    <div className="cs-sub">From paid orders</div>
  </div>
  <div className="crm-summary-card emerald">  {/* Changed from teal to emerald */}
    <div className="cs-label">Total Purchases</div>
    <div className="cs-value">{totalPurchases}</div>
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
            {isClientLoading ? (
              [1, 2, 3, 4, 5].map((_, i) => (
                <div className="crm-skeleton-row clients-grid" key={i}>
                  {[1, 2, 3, 4, 5, 6].map((_, j) => (
                    <Skeleton key={j} height={18} borderRadius={6} />
                  ))}
                </div>
              ))
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client, i) => {
                const joined = formatDate(client.joinedAt || client.createdAt || new Date());
                return (
                  <div className="crm-data-row clients-grid" key={i}>

                    {/* Client name + avatar */}
                    <div className="client-name-cell">
                      <div
                        className="client-avatar"
                        style={{ background: client.avatarColor || '#6c63ff' }}
                      >
                        {client.avatar || (client.name?.slice(0, 2).toUpperCase())}
                      </div>
                      <div>
                        <div className="client-name">{client.name}</div>
                        <div className="client-sub">{client.email}</div>
                      </div>
                    </div>

                    <div className="crm-cell">{client.email}</div>
                    <div className="crm-cell mono">{client.phone || client.phoneNumber || '—'}</div>
                    <div className="crm-cell">{client.country || '—'}</div>
                    <div className="crm-cell">
                      <span className="date-main">{joined.date}</span>
                    </div>
                    <div className="crm-cell">
                      <span className={`purchase-badge ${(client.purchases || client.purchaseDetails?.length || 0) > 0 ? 'has-purchases' : 'no-purchases'}`}>
                        {client.purchases ?? client.purchaseDetails?.length ?? 0}
                      </span>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="crm-empty">
                <div className="empty-icon">👥</div>
                <div className="empty-title">No clients found</div>
                <div className="empty-sub">Your client list will appear here</div>
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
              {isPurchaseLoading ? (
                [1, 2, 3, 4, 5].map((_, i) => (
                  <div className="crm-skeleton-row purchases-grid" key={i}>
                    {[1, 2, 3, 4, 5, 6].map((_, j) => (
                      <Skeleton key={j} height={18} borderRadius={6} />
                    ))}
                  </div>
                ))
              ) : filteredPurchases.length > 0 ? (
                filteredPurchases.map((p, i) => {
                  const { date, time } = formatDate(p.date || p.createdAt || new Date());
                  return (
                    <div className="crm-data-row purchases-grid" key={i}>

                      {/* Client */}
                      <div className="client-name-cell">
                        <div
                          className="client-avatar small"
                          style={{ background: p.avatarColor || '#6c63ff' }}
                        >
                          {p.avatar || (p.clientName?.slice(0, 2).toUpperCase())}
                        </div>
                        <div>
                          <div className="client-name">{p.clientName || p.clientemail}</div>
                          <div className="client-sub">{p.clientEmail}</div>
                        </div>
                      </div>

                      {/* Product */}
                      <div>
                        <div className="product-name">{p.product || p.productName}</div>
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
                          {p.billing || p.billingMethod}
                        </span>
                      </div>

                      {/* Status */}
                      <div>
                        <span className={getStatusClass(p.status)}>
                          {p.status}
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