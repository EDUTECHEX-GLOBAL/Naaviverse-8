import React, { useState, useEffect, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './partnercrm.scss';

// ─── AVATAR COLOR PALETTE ───────────────────────────────────
const AVATAR_COLORS = [
  { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
  { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
  { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  { bg: '#ccfbf1', text: '#115e59', border: '#5eead4' },
  { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
];

const getAvatarColor = (str = '', idx = 0) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash + idx) % AVATAR_COLORS.length];
};

// ─── DATE FORMATTER ─────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(dt);
  } catch {
    return '—';
  }
};

// ─── STATUS HELPERS ─────────────────────────────────────────
const getClientStatus = (client) => {
  const paths = client.selectedPaths || [];
  if (paths.length === 0) return 'not_started';
  const p = paths[0];
  const done = p.completedStepsCount || 0;
  const total = p.totalSteps || 0;
  if (total === 0 || done === 0) return 'not_started';
  if (done >= total) return 'completed';
  return 'in_progress';
};

const statusBadgeStyles = {
  paid: { bg: '#dcfce7', color: '#15803d', border: '#86efac', dot: '#16a34a', label: 'Paid' },
  completed: { bg: '#dcfce7', color: '#15803d', border: '#86efac', dot: '#16a34a', label: 'Paid' },
  pending: { bg: '#fef3c7', color: '#b45309', border: '#fde68a', dot: '#f59e0b', label: 'Pending' },
  failed: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', dot: '#ef4444', label: 'Failed' },
};

const getStatusBadge = (s) => {
  const key = String(s || '').toLowerCase().trim();
  return statusBadgeStyles[key] || {
    bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1', dot: '#94a3b8', label: s || '—',
  };
};

// ─── COLUMN CONFIG ──────────────────────────────────────────
const COLUMNS = [
  {
    key: 'not_started',
    label: 'Not Started',
    accent: '#818cf8',
    lightBg: 'linear-gradient(180deg, #f8faff 0%, #f1f5f9 100%)',
    colBorder: '#e0e7ff',
    tagBg: '#ede9fe',
    tagColor: '#5b21b6',
    countBg: '#e0e7ff',
    countColor: '#4338ca',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    accent: '#0ea5e9',
    lightBg: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)',
    colBorder: '#bae6fd',
    tagBg: '#e0f2fe',
    tagColor: '#0369a1',
    countBg: '#bae6fd',
    countColor: '#0369a1',
  },
  {
    key: 'completed',
    label: 'Completed',
    accent: '#10b981',
    lightBg: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
    colBorder: '#bbf7d0',
    tagBg: '#dcfce7',
    tagColor: '#15803d',
    countBg: '#bbf7d0',
    countColor: '#15803d',
  },
];

// ═════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════
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
  const [clients, setClients] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [viewMode, setViewMode] = useState('board');
  const [selectedClient, setSelectedClient] = useState(null);
  const [purchaseFilter, setPurchaseFilter] = useState('All');

  // ── Normalize Clients ─────────────────────────────────────
  useEffect(() => {
    if (Array.isArray(crmClientData) && crmClientData.length > 0) {
      const normalized = crmClientData.map((c, idx) => {
        const rawName = c.name || c.username || (c.email ? c.email.split('@')[0] : 'Client');
        const email = c.email || '';
        const selectedPaths = c.selectedPaths || [];
        const purchaseList = c.purchaseList || [];
        const purchasesCount = Number(c.purchases ?? purchaseList.length) || 0;
        const totalSpent = Number(c.totalSpent) || purchaseList.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        const avatarColor = getAvatarColor(email || rawName, idx);
        const initials = (rawName || 'CL').trim().split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

        return {
          ...c,
          name: rawName,
          email,
          phone: c.phoneNumber || c.phone || '—',
          country: c.country || 'India',
          avatar: initials,
          avatarColor,
          selectedPaths,
          pathsCount: selectedPaths.length || c.pathsCount || 0,
          purchases: purchasesCount,
          totalSpent,
          purchaseList,
          joinedAt: c.joinedAt || c.createdAt,
        };
      });
      setClients(normalized);
    } else {
      setClients([]);
    }
  }, [crmClientData]);

  // ── Normalize Purchases ───────────────────────────────────
  useEffect(() => {
    if (Array.isArray(crmPurchaseData) && crmPurchaseData.length > 0) {
      const normalized = crmPurchaseData.map((p, idx) => {
        const clientName = p.clientName || p.userEmail?.split('@')[0] || 'Client';
        const clientEmail = p.clientEmail || p.userEmail || '';
        const avatarColor = getAvatarColor(clientEmail || clientName, idx);
        const initials = clientName.trim().split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

        return {
          ...p,
          clientName,
          clientEmail,
          avatar: initials,
          avatarColor,
          product: p.product || p.productName || 'Marketplace Item',
          amount: Number(p.amount) || 0,
          status: String(p.status || 'pending').toLowerCase(),
          date: p.date || p.createdAt,
          orderId: p.orderId || p.razorpayOrderId || '—',
          paymentId: p.paymentId || p.razorpayPaymentId || '—',
          billingFrequency: p.billingFrequency || 'One-Time',
          category: p.category || p.layer || 'vendor',
        };
      });
      setPurchases(normalized);
    } else {
      setPurchases([]);
    }
  }, [crmPurchaseData]);

  // ── Derived Stats ─────────────────────────────────────────
  const paidPurchases = purchases.filter((p) => p.status === 'paid' || p.status === 'completed');
  const totalRevenue = paidPurchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const activeSubsCount = paidPurchases.length;

  // ── Filtered Clients ──────────────────────────────────────
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const pathMatch = (c.selectedPaths || []).some((p) => p.nameOfPath?.toLowerCase().includes(q));
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        pathMatch
      );
    });
  }, [clients, search]);

  // ── Grouped by status ─────────────────────────────────────
  const grouped = useMemo(() => {
    const g = { not_started: [], in_progress: [], completed: [] };
    filteredClients.forEach((c) => {
      const s = getClientStatus(c);
      if (g[s]) g[s].push(c);
    });
    return g;
  }, [filteredClients]);

  // ── Filtered Purchases ────────────────────────────────────
  const purchaseFilterTabs = ['All', 'Paid', 'Pending', 'Failed'];
  const filteredPurchases = purchases
    .filter((p) => {
      if (purchaseFilter === 'All') return true;
      const st = String(p.status || '').toLowerCase();
      const target = purchaseFilter.toLowerCase();
      if (target === 'paid') return st === 'paid' || st === 'completed';
      return st === target;
    })
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.clientName?.toLowerCase().includes(q) ||
        p.clientEmail?.toLowerCase().includes(q) ||
        p.product?.toLowerCase().includes(q)
      );
    });

  // ── Select / deselect client ──────────────────────────────
  const handleSelectClient = (c) => {
    setSelectedClient((prev) => (prev?._id === c._id && prev?.email === c.email ? null : c));
  };

  const isSelected = (c) =>
    selectedClient && selectedClient._id === c._id && selectedClient.email === c.email;

  // ── Get status label for detail panel ─────────────────────
  const getStatusLabel = (client) => {
    const s = getClientStatus(client);
    if (s === 'not_started') return 'Not started';
    if (s === 'in_progress') return 'In progress';
    return 'Completed';
  };

  // ── Progress percentage ───────────────────────────────────
  const getProgress = (client) => {
    const p = (client.selectedPaths || [])[0];
    if (!p) return 0;
    const total = p.totalSteps || 1;
    const done = p.completedStepsCount || 0;
    return Math.min((done / total) * 100, 100);
  };

  // ── Stat cards ────────────────────────────────────────────
  const stats = [
    {
      label: 'Clients',
      value: isClientLoading ? '—' : clients.length,
      sub: `${clients.length} total enrolled`,
      type: 'coral',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Revenue',
      value: isPurchaseLoading ? '—' : `₹${totalRevenue.toLocaleString('en-IN')}`,
      isMoney: true,
      sub: `${paidPurchases.length} paid orders`,
      type: 'blue',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: 'Purchases',
      value: isPurchaseLoading ? '—' : purchases.length,
      sub: `${purchases.length} total items`,
      type: 'green',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: 'Active Subs',
      value: isPurchaseLoading ? '—' : activeSubsCount,
      sub: 'Verified learners',
      type: 'purple',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="pcrm" onClick={() => setShowDrop && setShowDrop(false)}>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="pcrm-header">
        <div className="pcrm-header__left">
          <h2 className="pcrm-header__title">Clients</h2>
          <p className="pcrm-header__sub">
            Everyone on your paths, grouped by where they are in the journey.
          </p>
        </div>
        <div className="pcrm-header__right">
          {crmMenu === 'Purchases' && (
            <div className="pcrm-filter-wrap">
              <select
                className="pcrm-filter-select"
                value={purchaseFilter}
                onChange={(e) => setPurchaseFilter(e.target.value)}
              >
                {purchaseFilterTabs.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
          <div className="pcrm-view-toggle">
            <button
              className={`pcrm-view-btn ${crmMenu === 'Clients' && viewMode === 'board' ? 'pcrm-view-btn--active' : ''}`}
              onClick={() => { setcrmMenu('Clients'); setViewMode('board'); }}
            >
              Board
            </button>
            <button
              className={`pcrm-view-btn ${crmMenu === 'Clients' && viewMode === 'list' ? 'pcrm-view-btn--active' : ''}`}
              onClick={() => { setcrmMenu('Clients'); setViewMode('list'); }}
            >
              List
            </button>
            <button
              className={`pcrm-view-btn ${crmMenu === 'Purchases' ? 'pcrm-view-btn--active' : ''}`}
              onClick={() => setcrmMenu('Purchases')}
            >
              Purchases
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────── */}
      <div className="pcrm-stats">
        {stats.map((s, i) => (
          <div key={i} className={`pcrm-stat-card pcrm-stat-card--${s.type}`}>
            <div className="pcrm-stat-card__bg-circle-1" />
            <div className="pcrm-stat-card__bg-circle-2" />
            <div className="pcrm-stat-card__top">
              <span className="pcrm-stat-card__label">{s.label}</span>
              <div className="pcrm-stat-card__icon">{s.icon}</div>
            </div>
            <span className="pcrm-stat-card__value">
              {s.value}
            </span>
            <span className="pcrm-stat-card__sub">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          CLIENTS — BOARD VIEW
      ══════════════════════════════════════════════════ */}
      {crmMenu === 'Clients' && viewMode === 'board' && (
        <div className="pcrm-layout">
          <div className={`pcrm-board ${selectedClient ? 'pcrm-board--with-panel' : ''}`}>
            {isClientLoading ? (
              <div className="pcrm-board__columns">
                {COLUMNS.map((col) => (
                  <div key={col.key} className="pcrm-col">
                    <div className="pcrm-col__header">
                      <Skeleton width={100} height={14} />
                    </div>
                    {[1, 2].map((n) => (
                      <div key={n} className="pcrm-card pcrm-card--skel">
                        <Skeleton circle width={32} height={32} />
                        <div style={{ flex: 1 }}>
                          <Skeleton width="60%" height={12} />
                          <Skeleton width="40%" height={10} style={{ marginTop: 4 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="pcrm-board__columns">
                {COLUMNS.map((col) => {
                  const items = grouped[col.key] || [];
                  return (
                    <div
                      key={col.key}
                      className={`pcrm-col pcrm-col--${col.key}`}
                      style={{
                        background: col.lightBg,
                        borderColor: col.colBorder,
                      }}
                    >
                      <div className="pcrm-col__header">
                        <span
                          className="pcrm-col__accent"
                          style={{ background: col.accent }}
                        />
                        <span className="pcrm-col__label" style={{ color: col.countColor }}>
                          {col.label}
                        </span>
                        <span
                          className="pcrm-col__count"
                          style={{ background: col.countBg, color: col.countColor }}
                        >
                          {items.length}
                        </span>
                      </div>
                      <div className="pcrm-col__body">
                        {items.length > 0 ? (
                          items.map((c, i) => {
                            const primaryPath = c.selectedPaths?.[0];
                            const hasPurchases = (c.purchases || 0) > 0;

                            return (
                              <div
                                key={c._id || i}
                                className={`pcrm-card ${isSelected(c) ? 'pcrm-card--selected' : ''}`}
                                onClick={() => handleSelectClient(c)}
                              >
                                {/* Avatar + Info */}
                                <div className="pcrm-card__top">
                                  <div
                                    className="pcrm-card__avatar"
                                    style={{
                                      background: c.avatarColor.bg,
                                      color: c.avatarColor.text,
                                      borderColor: c.avatarColor.border,
                                    }}
                                  >
                                    {c.avatar}
                                  </div>
                                  <div className="pcrm-card__info">
                                    <span className="pcrm-card__name">{c.name}</span>
                                    <span className="pcrm-card__email">{c.email}</span>
                                  </div>
                                </div>

                                {/* Path Badge */}
                                {primaryPath && (
                                  <div
                                    className="pcrm-card__path"
                                    style={{
                                      background: col.tagBg,
                                      borderColor: `${col.accent}33`,
                                    }}
                                  >
                                    <span
                                      className="pcrm-card__path-accent"
                                      style={{ background: col.accent }}
                                    />
                                    <span
                                      className="pcrm-card__path-name"
                                      style={{ color: col.tagColor }}
                                      title={primaryPath.nameOfPath}
                                    >
                                      {primaryPath.nameOfPath}
                                    </span>
                                  </div>
                                )}

                                {/* Bottom Row: Steps + Purchases */}
                                <div className="pcrm-card__bottom">
                                  <span className="pcrm-card__steps">
                                    {primaryPath
                                      ? `${primaryPath.completedStepsCount || 0}/${primaryPath.totalSteps || 0} Steps`
                                      : '0 Steps'}
                                  </span>
                                  {hasPurchases ? (
                                    <span className="pcrm-card__purchases pcrm-card__purchases--has">
                                      {c.purchases} {c.purchases === 1 ? 'Purchase' : 'Purchases'} · ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                                    </span>
                                  ) : (
                                    <span className="pcrm-card__purchases">No Purchases</span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="pcrm-col__empty">No Clients Here Yet</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Detail Panel ──────────────────────────────── */}
          {selectedClient && (
            <div className="pcrm-detail">
              <div className="pcrm-detail__top">
                <div
                  className="pcrm-detail__avatar"
                  style={{
                    background: selectedClient.avatarColor.bg,
                    color: selectedClient.avatarColor.text,
                    borderColor: selectedClient.avatarColor.border,
                  }}
                >
                  {selectedClient.avatar}
                </div>
                <div className="pcrm-detail__user">
                  <h3 className="pcrm-detail__name">{selectedClient.name}</h3>
                  <p className="pcrm-detail__email">{selectedClient.email}</p>
                </div>
                <button
                  className="pcrm-detail__close"
                  onClick={() => setSelectedClient(null)}
                >
                  ✕
                </button>
              </div>

              {/* Path Section */}
              {selectedClient.selectedPaths?.length > 0 && (
                <div className="pcrm-detail__section">
                  <span className="pcrm-detail__label">PATH</span>
                  {selectedClient.selectedPaths.map((p, idx) => (
                    <div key={idx} className="pcrm-detail__path-block">
                      <span className="pcrm-detail__path-name">{p.nameOfPath}</span>
                      <div className="pcrm-detail__progress-bar">
                        <div
                          className="pcrm-detail__progress-fill"
                          style={{
                            width: `${Math.min(((p.completedStepsCount || 0) / (p.totalSteps || 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="pcrm-detail__path-meta">
                        {p.completedStepsCount || 0}/{p.totalSteps || 0} steps completed · {getStatusLabel(selectedClient)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact Section */}
              <div className="pcrm-detail__section">
                <span className="pcrm-detail__label">CONTACT</span>
                <div className="pcrm-detail__contact-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{selectedClient.phone || '—'}</span>
                </div>
                <div className="pcrm-detail__contact-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span>{selectedClient.country || 'India'}</span>
                </div>
                <span className="pcrm-detail__joined">
                  Joined {fmtDate(selectedClient.joinedAt)}
                </span>
              </div>

              {/* Purchases Section */}
              <div className="pcrm-detail__section">
                <span className="pcrm-detail__label">PURCHASES</span>
                <div className="pcrm-detail__purchase-box">
                  {(selectedClient.purchases || 0) > 0 ? (
                    <span className="pcrm-detail__purchase-val pcrm-detail__purchase-val--has">
                      {selectedClient.purchases} {selectedClient.purchases === 1 ? 'purchase' : 'purchases'} · ₹{(selectedClient.totalSpent || 0).toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="pcrm-detail__purchase-val">No purchases yet</span>
                  )}
                </div>

                {/* Individual purchase items */}
                {selectedClient.purchaseList?.length > 0 && (
                  <div className="pcrm-detail__pur-list">
                    {selectedClient.purchaseList.map((pur, idx) => {
                      const st = getStatusBadge(pur.status);
                      return (
                        <div key={idx} className="pcrm-detail__pur-item">
                          <div>
                            <span className="pcrm-detail__pur-name">{pur.productName || pur.product}</span>
                            <span className="pcrm-detail__pur-date">{fmtDate(pur.date || pur.createdAt)}</span>
                          </div>
                          <div className="pcrm-detail__pur-right">
                            <span className="pcrm-detail__pur-amt">₹{Number(pur.amount || 0).toLocaleString('en-IN')}</span>
                            <span
                              className="pcrm-detail__pur-status"
                              style={{ background: st.bg, color: st.color, borderColor: st.border }}
                            >
                              {st.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pcrm-detail__actions">
                <a
                  className="pcrm-detail__btn pcrm-detail__btn--primary"
                  href={`mailto:${selectedClient.email}`}
                >
                  Message client
                </a>
                <button className="pcrm-detail__btn pcrm-detail__btn--outline">
                  View path
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          CLIENTS — LIST VIEW
      ══════════════════════════════════════════════════ */}
      {crmMenu === 'Clients' && viewMode === 'list' && (
        <div className="pcrm-layout">
          <div className={`pcrm-list-wrap ${selectedClient ? 'pcrm-list-wrap--with-panel' : ''}`}>
            <div className="pcrm-list-header">
              <span className="pcrm-list-header__avatar" />
              <span>CLIENT</span>
              <span>PATH</span>
              <span>STEPS</span>
              <span>STATUS</span>
              <span>PURCHASES</span>
              <span style={{ textAlign: 'right' }}>JOINED</span>
            </div>
            {isClientLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="pcrm-list-row pcrm-list-row--skel">
                  <Skeleton circle width={30} height={30} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="35%" height={12} />
                    <Skeleton width="20%" height={10} style={{ marginTop: 3 }} />
                  </div>
                  <Skeleton width={120} height={12} />
                  <Skeleton width={60} height={10} />
                </div>
              ))
            ) : filteredClients.length > 0 ? (
              filteredClients.map((c, i) => {
                const primaryPath = c.selectedPaths?.[0];
                const hasPurchases = (c.purchases || 0) > 0;
                const statusLabel = getStatusLabel(c);

                return (
                  <div
                    key={c._id || i}
                    className={`pcrm-list-row ${isSelected(c) ? 'pcrm-list-row--selected' : ''}`}
                    onClick={() => handleSelectClient(c)}
                  >
                    <div
                      className="pcrm-list-row__avatar"
                      style={{
                        background: c.avatarColor.bg,
                        color: c.avatarColor.text,
                        borderColor: c.avatarColor.border,
                      }}
                    >
                      {c.avatar}
                    </div>
                    <div className="pcrm-list-row__info">
                      <span className="pcrm-list-row__name">{c.name}</span>
                      <span className="pcrm-list-row__email">{c.email}</span>
                    </div>
                    <div className="pcrm-list-row__path">
                      {primaryPath ? primaryPath.nameOfPath : '—'}
                    </div>
                    <div className="pcrm-list-row__steps">
                      {primaryPath
                        ? `${primaryPath.completedStepsCount || 0}/${primaryPath.totalSteps || 0}`
                        : '—'}
                    </div>
                    <span className={`pcrm-list-row__status pcrm-list-row__status--${getClientStatus(c)}`}>
                      {statusLabel}
                    </span>
                    <div className="pcrm-list-row__pur">
                      {hasPurchases ? (
                        <span className="pcrm-list-row__pur--has">
                          ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="pcrm-list-row__pur--none">—</span>
                      )}
                    </div>
                    <span className="pcrm-list-row__date">{fmtDate(c.joinedAt)}</span>
                  </div>
                );
              })
            ) : (
              <div className="pcrm-empty">
                <p className="pcrm-empty__title">No clients found</p>
                <p className="pcrm-empty__sub">Users who select your paths will appear here.</p>
              </div>
            )}
          </div>

          {/* Detail Panel (reused) */}
          {selectedClient && (
            <div className="pcrm-detail">
              <div className="pcrm-detail__top">
                <div
                  className="pcrm-detail__avatar"
                  style={{
                    background: selectedClient.avatarColor.bg,
                    color: selectedClient.avatarColor.text,
                    borderColor: selectedClient.avatarColor.border,
                  }}
                >
                  {selectedClient.avatar}
                </div>
                <div className="pcrm-detail__user">
                  <h3 className="pcrm-detail__name">{selectedClient.name}</h3>
                  <p className="pcrm-detail__email">{selectedClient.email}</p>
                </div>
                <button className="pcrm-detail__close" onClick={() => setSelectedClient(null)}>✕</button>
              </div>

              {selectedClient.selectedPaths?.length > 0 && (
                <div className="pcrm-detail__section">
                  <span className="pcrm-detail__label">PATH</span>
                  {selectedClient.selectedPaths.map((p, idx) => (
                    <div key={idx} className="pcrm-detail__path-block">
                      <span className="pcrm-detail__path-name">{p.nameOfPath}</span>
                      <div className="pcrm-detail__progress-bar">
                        <div
                          className="pcrm-detail__progress-fill"
                          style={{
                            width: `${Math.min(((p.completedStepsCount || 0) / (p.totalSteps || 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="pcrm-detail__path-meta">
                        {p.completedStepsCount || 0}/{p.totalSteps || 0} steps completed · {getStatusLabel(selectedClient)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pcrm-detail__section">
                <span className="pcrm-detail__label">CONTACT</span>
                <div className="pcrm-detail__contact-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{selectedClient.phone || '—'}</span>
                </div>
                <div className="pcrm-detail__contact-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span>{selectedClient.country || 'India'}</span>
                </div>
                <span className="pcrm-detail__joined">Joined {fmtDate(selectedClient.joinedAt)}</span>
              </div>

              <div className="pcrm-detail__section">
                <span className="pcrm-detail__label">PURCHASES</span>
                <div className="pcrm-detail__purchase-box">
                  {(selectedClient.purchases || 0) > 0 ? (
                    <span className="pcrm-detail__purchase-val pcrm-detail__purchase-val--has">
                      {selectedClient.purchases} {selectedClient.purchases === 1 ? 'purchase' : 'purchases'} · ₹{(selectedClient.totalSpent || 0).toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="pcrm-detail__purchase-val">No purchases yet</span>
                  )}
                </div>
                {selectedClient.purchaseList?.length > 0 && (
                  <div className="pcrm-detail__pur-list">
                    {selectedClient.purchaseList.map((pur, idx) => {
                      const st = getStatusBadge(pur.status);
                      return (
                        <div key={idx} className="pcrm-detail__pur-item">
                          <div>
                            <span className="pcrm-detail__pur-name">{pur.productName || pur.product}</span>
                            <span className="pcrm-detail__pur-date">{fmtDate(pur.date || pur.createdAt)}</span>
                          </div>
                          <div className="pcrm-detail__pur-right">
                            <span className="pcrm-detail__pur-amt">₹{Number(pur.amount || 0).toLocaleString('en-IN')}</span>
                            <span className="pcrm-detail__pur-status" style={{ background: st.bg, color: st.color, borderColor: st.border }}>{st.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pcrm-detail__actions">
                <a className="pcrm-detail__btn pcrm-detail__btn--primary" href={`mailto:${selectedClient.email}`}>
                  Message client
                </a>
                <button className="pcrm-detail__btn pcrm-detail__btn--outline">View path</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          PURCHASES TAB
      ══════════════════════════════════════════════════ */}
      {crmMenu === 'Purchases' && (
        <div className="pcrm-purchases">
          {isPurchaseLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="pcrm-pur-row pcrm-pur-row--skel">
                <Skeleton circle width={28} height={28} />
                <div style={{ flex: 1 }}>
                  <Skeleton width="35%" height={12} />
                  <Skeleton width="25%" height={10} style={{ marginTop: 3 }} />
                </div>
                <Skeleton width={60} height={12} />
                <Skeleton width={70} height={20} style={{ borderRadius: 10 }} />
              </div>
            ))
          ) : filteredPurchases.length > 0 ? (
            filteredPurchases.map((p, i) => {
              const badge = getStatusBadge(p.status);
              return (
                <div
                  key={p._id || i}
                  className="pcrm-pur-row"
                >
                  <div
                    className="pcrm-pur-row__avatar"
                    style={{
                      background: p.avatarColor.bg,
                      color: p.avatarColor.text,
                      borderColor: p.avatarColor.border,
                    }}
                  >
                    {p.avatar}
                  </div>
                  <div className="pcrm-pur-row__main">
                    <span className="pcrm-pur-row__client">{p.clientName}</span>
                    <span className="pcrm-pur-row__product">
                      {p.product}
                      <span className="pcrm-pur-row__cat">{p.category}</span>
                    </span>
                  </div>
                  <div className="pcrm-pur-row__amount">₹{p.amount.toLocaleString('en-IN')}</div>
                  <div className="pcrm-pur-row__date">{fmtDate(p.date)}</div>
                  <div
                    className="pcrm-pur-row__status"
                    style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}
                  >
                    <span className="pcrm-pur-row__dot" style={{ background: badge.dot }} />
                    {badge.label}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="pcrm-empty">
              <p className="pcrm-empty__title">No purchases found</p>
              <p className="pcrm-empty__sub">Purchase history will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CRMPage;