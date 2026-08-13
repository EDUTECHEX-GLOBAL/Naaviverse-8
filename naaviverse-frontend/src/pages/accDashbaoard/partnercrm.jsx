import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './partnercrm.scss';

// ─── AVATAR ────────────────────────────────────────────────
const COLORS = ['#3E7BFA','#E11D48','#059669','#D97706','#7C3AED','#0EA5E9','#EC4899','#F97316'];
const colorFor = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
};

// ─── HELPERS ───────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));
};

const statusMap = {
  paid:    { bg: '#ecfdf5', color: '#059669', dot: '#059669' },
  pending: { bg: '#fffbeb', color: '#d97706', dot: '#fbbf24' },
  failed:  { bg: '#fef2f2', color: '#e11d48', dot: '#fb7185' },
};
const getStatus = (s) => statusMap[s?.toLowerCase()] || { bg: '#f1f5f9', color: '#94a3b8', dot: '#cbd5e1' };

// ─── COMPONENT ─────────────────────────────────────────────
const CRMPage = ({
  showDrop, setShowDrop, search = '',
  crmMenu, setcrmMenu,
  crmClientData = [], crmPurchaseData = [],
  isClientLoading = false, isPurchaseLoading = false,
}) => {
  const [clients, setClients] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [clientLoading, setClientLoading] = useState(true);
  const [purchaseFilter, setPurchaseFilter] = useState('All');

  useEffect(() => {
    if (crmClientData?.length) {
      const norm = crmClientData.map(c => ({
        ...c,
        name: c.name || c.username || c.email,
        phone: c.phone || c.phoneNumber || '—',
        avatar: (c.name || c.username || c.email || '?').slice(0, 2).toUpperCase(),
        avatarColor: colorFor(c.email || ''),
      }));
      setClients(norm);
      const allP = norm.flatMap(c =>
        (c.purchaseList || []).map(p => ({
          ...p,
          clientName: c.name, clientEmail: c.email,
          avatar: c.avatar, avatarColor: c.avatarColor,
        }))
      );
      setPurchases(allP);
    } else {
      setClients([]);
      setPurchases([]);
    }
    setClientLoading(false);
  }, [crmClientData]);

  const totalRevenue = purchases.filter(p => p.status?.toLowerCase() === 'paid').reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const activeSubsCount = purchases.filter(p => p.status?.toLowerCase() === 'paid').length;

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const purchaseTabs = ['All', 'Paid', 'Pending', 'Failed'];
  const filteredPurchases = purchases
    .filter(p => purchaseFilter === 'All' || p.status?.toLowerCase() === purchaseFilter.toLowerCase())
    .filter(p =>
      p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.clientEmail?.toLowerCase().includes(search.toLowerCase()) ||
      p.product?.toLowerCase().includes(search.toLowerCase())
    );

  const isLoading = isClientLoading || clientLoading;

  // ── Stats data ─────────────────────────────────────────
  const stats = [
    { label: 'Clients', value: isLoading ? '—' : clients.length, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )},
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    )},
    { label: 'Purchases', value: purchases.length, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    )},
    { label: 'Active Subs', value: activeSubsCount, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    )},
  ];

  return (
    <div className="crm-root" onClick={() => setShowDrop(false)}>

      {/* ── Inline Stats Row ─────────────────────────────── */}
      <div className="crm-stats-row">
        {stats.map(s => (
          <div key={s.label} className="crm-stat">
            <span className="crm-stat__icon">{s.icon}</span>
            <span className="crm-stat__val">{s.value}</span>
            <span className="crm-stat__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Section Header Row: Rounded Pill Tabs + Right Filter Dropdown ── */}
      <div className="crm-nav-bar">
        <div className="crm-section-tabs">
          {['Clients', 'Purchases'].map(tab => (
            <button
              key={tab}
              className={`crm-section-tab ${crmMenu === tab ? 'crm-section-tab--active' : ''}`}
              onClick={() => setcrmMenu(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {crmMenu === 'Purchases' && (
          <div className="crm-filter-select-wrap">
            <label className="crm-filter-label">Filter:</label>
            <select
              className="crm-filter-select"
              value={purchaseFilter}
              onChange={(e) => setPurchaseFilter(e.target.value)}
            >
              {purchaseTabs.map(tab => (
                <option key={tab} value={tab}>
                  {tab}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          CLIENTS — Card List View
      ══════════════════════════════════════════════════ */}
      {crmMenu === 'Clients' && (
        <div className="crm-client-list">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="crm-client-card crm-client-card--skel">
                <Skeleton circle width={32} height={32} />
                <div style={{ flex: 1 }}>
                  <Skeleton height={12} width="60%" />
                  <Skeleton height={10} width="40%" style={{ marginTop: 4 }} />
                </div>
              </div>
            ))
          ) : filteredClients.length > 0 ? (
            filteredClients.map((c, i) => {
              const joined = fmtDate(c.joinedAt || c.createdAt);
              return (
                <div key={i} className="crm-client-card">
                  <div className="crm-client-card__avatar" style={{ background: c.avatarColor }}>
                    {c.avatar}
                  </div>
                  <div className="crm-client-card__info">
                    <span className="crm-client-card__name">{c.name}</span>
                    <span className="crm-client-card__email">{c.email}</span>
                  </div>
                  <div className="crm-client-card__meta">
                    {c.phone && c.phone !== '—' && (
                      <span className="crm-client-card__detail">{c.phone}</span>
                    )}
                    {c.country && (
                      <span className="crm-client-card__detail">{c.country}</span>
                    )}
                  </div>
                  <div className="crm-client-card__right">
                    <span className="crm-client-card__date">{joined}</span>
                    <span className={`crm-client-card__purchases ${c.purchases > 0 ? 'has' : ''}`}>
                      {c.purchases || 0} purchases
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="crm-empty-state">
              <p className="crm-empty-state__title">No clients found</p>
              <p className="crm-empty-state__sub">Users who select your paths will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          PURCHASES — Transaction List View
      ══════════════════════════════════════════════════ */}
      {crmMenu === 'Purchases' && (
        <div className="crm-purchase-list">
          {filteredPurchases.length > 0 ? (
            filteredPurchases.map((p, i) => {
              const st = getStatus(p.status);
              return (
                <div key={i} className="crm-purchase-row">
                  <div className="crm-purchase-row__avatar" style={{ background: p.avatarColor }}>
                    {p.avatar}
                  </div>
                  <div className="crm-purchase-row__main">
                    <span className="crm-purchase-row__client">{p.clientName}</span>
                    <span className="crm-purchase-row__product">{p.product || p.productName || '—'}</span>
                  </div>
                  <div className="crm-purchase-row__amount">
                    ₹{Number(p.amount).toLocaleString('en-IN')}
                  </div>
                  <div className="crm-purchase-row__date">
                    {fmtDate(p.date || p.createdAt)}
                  </div>
                  <div
                    className="crm-purchase-row__status"
                    style={{ background: st.bg, color: st.color }}
                  >
                    <span className="crm-purchase-row__dot" style={{ background: st.dot }} />
                    {p.status || '—'}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="crm-empty-state">
              <p className="crm-empty-state__title">No purchases found</p>
              <p className="crm-empty-state__sub">Purchase history will appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CRMPage;