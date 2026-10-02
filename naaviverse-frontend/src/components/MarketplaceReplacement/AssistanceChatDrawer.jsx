import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./AssistanceChatDrawer.scss";
import marketplaceReplacementService from "../../services/marketplaceReplacementService";

export default function AssistanceChatDrawer({
  isOpen,
  onClose,
  activeRequestId,
  userEmail,
  userName,
  stepId,
  stepName,
  pathId,
  pathName,
  onAddToCart,
  onOpenCart,
  cartItems = [],
  purchasedIds = [],
}) {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [detailsService, setDetailsService] = useState(null);
  const [justAddedService, setJustAddedService] = useState(null);

  // Direct Inquiry State
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [newReqMessage, setNewReqMessage] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);

  const messagesEndRef = useRef(null);
  const chatStreamRef = useRef(null);

  // Load all user assistance requests
  const loadRequests = React.useCallback(async () => {
    setLoading(true);
    try {
      const emailToUse =
        userEmail ||
        localStorage.getItem("loginEmail") ||
        localStorage.getItem("userEmail") ||
        "";
      const data = await marketplaceReplacementService.getUserAssistanceRequests(emailToUse);
      setRequests(data);

      if (data.length > 0) {
        if (activeRequestId) {
          const match = data.find((r) => r.id === activeRequestId);
          setSelectedRequest(match || data[0]);
        } else if (stepId) {
          const matchStep = data.find((r) => r.stepId === stepId);
          setSelectedRequest(matchStep || data[0]);
        } else {
          setSelectedRequest(data[0]);
        }
      } else {
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error("Failed to load assistance requests:", err);
    } finally {
      setLoading(false);
    }
  }, [userEmail, activeRequestId, stepId]);

  // Load messages for selected request
  const loadMessages = React.useCallback(async (reqId) => {
    if (!reqId) return;
    try {
      const msgList = await marketplaceReplacementService.getMessages(reqId);
      setMessages(msgList);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen, loadRequests]);

  useEffect(() => {
    if (selectedRequest?.id && !showNewRequestForm) {
      loadMessages(selectedRequest.id);
      const timer = setInterval(() => {
        loadMessages(selectedRequest.id);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [selectedRequest?.id, showNewRequestForm, loadMessages]);

  useEffect(() => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedRequest) return;

    const text = inputMsg.trim();
    setInputMsg("");
    setSending(true);

    try {
      const sent = await marketplaceReplacementService.sendMessage({
        requestId: selectedRequest.id,
        senderId: userEmail || "guest_user",
        senderRole: "USER",
        senderName: userName || "Student",
        message: text,
      });
      setMessages((prev) => [...prev, sent]);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleCreateDirectRequest = async (e) => {
    if (e) e.preventDefault();
    if (!newReqMessage.trim()) return;

    setCreatingNew(true);
    try {
      const emailToUse =
        userEmail ||
        localStorage.getItem("loginEmail") ||
        localStorage.getItem("userEmail") ||
        "guest@naaviverse.com";
      const nameToUse = userName || localStorage.getItem("userName") || "Student";
      const pName = pathName || localStorage.getItem("selectedPathName") || "Learning Path";
      const sName = stepName || localStorage.getItem("selectedStepName") || "Learning Step";
      const pId = pathId || localStorage.getItem("selectedPathId") || "";
      const sId = stepId || localStorage.getItem("selectedStepId") || "";

      const res = await marketplaceReplacementService.createAssistanceRequest({
        userEmail: emailToUse,
        userName: nameToUse,
        pathId: pId,
        pathName: pName,
        stepId: sId,
        stepName: sName,
        originalMarketplaceItemId: "custom_inquiry",
        originalItemName: sName,
        reasons: ["direct_student_inquiry"],
        message: newReqMessage.trim(),
        previousRecommendations: [],
      });

      setNewReqMessage("");
      setShowNewRequestForm(false);

      const updated = await marketplaceReplacementService.getUserAssistanceRequests(emailToUse);
      setRequests(updated);
      const match = updated.find((r) => r.id === (res?.id || res?.ticketId)) || updated[0];
      setSelectedRequest(match);
      if (match?.id) {
        await loadMessages(match.id);
      }
    } catch (err) {
      console.error("Error creating direct assistance request:", err);
    } finally {
      setCreatingNew(false);
    }
  };

  const isItemInCart = (svc) => {
    if (!svc) return false;
    const sId = String(svc._id || svc.id);
    return (cartItems || []).some((c) => String(c._id || c.id) === sId);
  };

  const isItemPurchased = (svc) => {
    if (!svc) return false;
    const sId = String(svc._id || svc.id);
    const purchasedSet = new Set((purchasedIds || []).map(String));
    return purchasedSet.has(sId);
  };

  const handleAddToCartClick = (service) => {
    if (!service) return;
    if (onAddToCart) {
      onAddToCart(service);
      setJustAddedService(service);
      setTimeout(() => setJustAddedService(null), 5000);
    }
  };

  if (!isOpen) return null;

  const statusColors = {
    pending: { label: "Pending Review", bg: "#fef3c7", color: "#b45309" },
    reviewing: { label: "In Review / Chat", bg: "#dbeafe", color: "#1d4ed8" },
    resolved: { label: "Resolved", bg: "#dcfce7", color: "#15803d" },
    closed: { label: "Closed", bg: "#f1f5f9", color: "#64748b" },
  };

  const isFormMode = showNewRequestForm || (!loading && requests.length === 0 && !selectedRequest);

  // Find latest recommended service from messages or selectedRequest
  const latestRecommendedService =
    [...messages].reverse().find((m) => m.recommendedService)?.recommendedService ||
    selectedRequest?.recommendedService;

  return createPortal(
    <>
      <div className="assist-fullpage-overlay">
        <div className="assist-fullpage-container">
          {/* ── 1. Top Header Bar ── */}
          <header className="afp-header">
            <div className="afp-header-left">
              <button className="afp-back-btn" onClick={onClose} title="Back to Marketplace">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Back to Marketplace</span>
              </button>

              <div className="afp-divider-v" />

              <div className="afp-title-wrap">
                <div className="afp-title-row">
                  <h2 className="afp-title">Super Admin Assistance</h2>
                  <span className="afp-badge-live">● Live Support</span>
                </div>
                <p className="afp-sub">Direct Counselor Advisory & Curated Marketplace Recommendations</p>
              </div>
            </div>

            <div className="afp-header-right">
              {onOpenCart && cartItems.length > 0 && (
                <button
                  type="button"
                  className="afp-cart-btn"
                  onClick={() => {
                    onClose();
                    onOpenCart();
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>Cart ({cartItems.length})</span>
                </button>
              )}
              <button className="afp-close-btn" onClick={onClose} title="Close Assistance View">
                ✕
              </button>
            </div>
          </header>

          {/* ── Real-time Toast if Item was Added to Cart ── */}
          {justAddedService && (
            <div className="afp-toast-banner">
              <div className="atb-left">
                <span className="atb-icon">✓</span>
                <span className="atb-msg">
                  Added <strong>{justAddedService.name}</strong> to your cart!
                </span>
              </div>
              {onOpenCart && (
                <button
                  type="button"
                  className="atb-view-btn"
                  onClick={() => {
                    setJustAddedService(null);
                    onClose();
                    onOpenCart();
                  }}
                >
                  View Cart & Checkout →
                </button>
              )}
            </div>
          )}

          {/* ── 2. Full Page Three-Column Layout ── */}
          <div className="afp-body">
            {/* ── Left Sidebar: Inquiries List ── */}
            <aside className="afp-sidebar">
              <div className="afp-sidebar-header">
                <span className="sidebar-title">My Inquiries</span>
                <span className="sidebar-count">{requests.length}</span>
              </div>

              <button
                type="button"
                className={`afp-new-inquiry-btn ${showNewRequestForm ? "active" : ""}`}
                onClick={() => setShowNewRequestForm(true)}
                title="Create a new inquiry for this step"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Inquiry for Current Step</span>
              </button>

              <div className="afp-tickets-list">
                {loading ? (
                  <div className="sidebar-loading">Loading inquiries...</div>
                ) : requests.length === 0 ? (
                  <div className="sidebar-empty">
                    <p>No active inquiries yet.</p>
                    <span>Click above to request assistance for this milestone.</span>
                  </div>
                ) : (
                  requests.map((r) => {
                    const isSel = selectedRequest?.id === r.id && !showNewRequestForm;
                    const dateFormatted = new Date(r.createdAt || r.updatedAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={r.id}
                        className={`afp-ticket-card ${isSel ? "active" : ""}`}
                        onClick={() => {
                          setShowNewRequestForm(false);
                          setSelectedRequest(r);
                        }}
                      >
                        <div className="atc-header">
                          <span className="atc-step" title={r.stepName || "Step"}>
                            {r.stepName || "Step"}
                          </span>
                          <span
                            className="atc-status"
                            style={{
                              background: statusColors[r.status]?.bg,
                              color: statusColors[r.status]?.color,
                            }}
                          >
                            ● {statusColors[r.status]?.label || r.status}
                          </span>
                        </div>
                        <div className="atc-path" title={r.pathName || "Path"}>
                          {r.pathName || "Learning Path"}
                        </div>
                        <div className="atc-preview">
                          "{r.userRequirement?.message || "Replacement assistance requested."}"
                        </div>
                        <div className="atc-footer">
                          <span className="atc-id">Ticket #{r.ticketId || r.id}</span>
                          <span className="atc-date">{dateFormatted}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* ── Center Main Pane: Active Inquiry & Live Chat Stream ── */}
            <main className="afp-main">
              {isFormMode ? (
                /* New Inquiry Creation Form */
                <div className="afp-form-pane">
                  <div className="form-card">
                    <div className="form-badge">Direct Super Admin Support</div>
                    <h3 className="form-title">Need specialized assistance for this milestone?</h3>
                    <p className="form-sub">
                      Our senior Super Admin counseling team can curate custom marketplace recommendations, negotiate special partner access, or tailor options for your target career.
                    </p>

                    <div className="form-path-box">
                      <div className="fpb-row">
                        <span className="fpb-lbl">Current Path:</span>
                        <span className="fpb-val">{pathName || "Career Path"}</span>
                      </div>
                      <div className="fpb-row">
                        <span className="fpb-lbl">Current Step:</span>
                        <span className="fpb-val">{stepName || "Learning Milestone"}</span>
                      </div>
                    </div>

                    <div className="form-input-group">
                      <label>What specific assistance or requirements do you have?</label>
                      <textarea
                        rows="4"
                        placeholder="e.g., I'm looking for a hands-on project with certificate, budget under ₹3,000, offline preferred, or weekend mentorship..."
                        value={newReqMessage}
                        onChange={(e) => setNewReqMessage(e.target.value)}
                        disabled={creatingNew}
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="form-submit-btn"
                        onClick={handleCreateDirectRequest}
                        disabled={creatingNew || !newReqMessage.trim()}
                      >
                        {creatingNew ? "Connecting to Super Admin..." : "🚀 Start Chat with Super Admin"}
                      </button>

                      {requests.length > 0 && (
                        <button
                          type="button"
                          className="form-cancel-btn"
                          onClick={() => {
                            setShowNewRequestForm(false);
                            setSelectedRequest(requests[0]);
                          }}
                        >
                          Cancel & Return to Inquiries
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : selectedRequest ? (
                /* Active Chat Conversation */
                <div className="afp-chat-pane">
                  {/* Top Inquiry Banner */}
                  <div className="afp-inquiry-banner">
                    <div className="aib-left">
                      <div className="aib-step-row">
                        <span className="aib-step">{selectedRequest.stepName || "Learning Step"}</span>
                        <span
                          className="aib-badge"
                          style={{
                            background: statusColors[selectedRequest.status]?.bg,
                            color: statusColors[selectedRequest.status]?.color,
                          }}
                        >
                          ● {statusColors[selectedRequest.status]?.label || selectedRequest.status}
                        </span>
                      </div>
                      <div className="aib-path">
                        Path: <strong>{selectedRequest.pathName || "Learning Path"}</strong> &nbsp;·&nbsp;
                        Ticket: <strong className="mono">{selectedRequest.ticketId || selectedRequest.id}</strong>
                      </div>
                      <div className="aib-req">
                        <strong>Your Requirement:</strong> "{selectedRequest.userRequirement?.message || "Custom recommendation requested for this milestone."}"
                      </div>
                    </div>
                  </div>

                  {/* Chat Stream */}
                  <div className="afp-chat-stream" ref={chatStreamRef}>
                    {/* User's Original Inquiry Message */}
                    {selectedRequest.userRequirement?.message && (
                      <div className="chat-bubble-wrap user-bubble-wrap">
                        <div className="bubble-sender-meta">
                          <span className="sender-name">You</span>
                          <span className="sender-time">
                            {selectedRequest.createdAt
                              ? new Date(selectedRequest.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : "Sent"}
                          </span>
                        </div>
                        <div className="chat-bubble user-bubble">
                          <div className="bubble-text">{selectedRequest.userRequirement.message}</div>
                        </div>
                      </div>
                    )}

                    {/* Waiting notice if no Super Admin reply yet */}
                    {messages.length === 0 ? (
                      <div className="afp-waiting-card">
                        <div className="awc-icon">⏳</div>
                        <div className="awc-content">
                          <h4>Inquiry Submitted to Super Admin</h4>
                          <p>
                            Our counseling team is actively reviewing your requirements. Replies and curated recommendations will appear right here in real time.
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isAdmin = m.senderRole === "SUPER_ADMIN";
                        const svc = m.recommendedService;
                        const inCart = svc ? isItemInCart(svc) : false;
                        const purchased = svc ? isItemPurchased(svc) : false;

                        const costDisplay =
                          !svc || !svc.cost || svc.cost === "0" || String(svc.cost).toLowerCase() === "free"
                            ? "Free"
                            : `₹${Number(String(svc.cost).replace(/[^\d]/g, "")).toLocaleString("en-IN")}`;

                        return (
                          <div
                            key={m.id}
                            className={`chat-bubble-wrap ${isAdmin ? "admin-bubble-wrap" : "user-bubble-wrap"}`}
                          >
                            <div className="bubble-sender-meta">
                              <span className="sender-name">{isAdmin ? "🛡️ Naavi Super Admin" : "You"}</span>
                              <span className="sender-time">
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>

                            <div className={`chat-bubble ${isAdmin ? "admin-bubble" : "user-bubble"}`}>
                              <div className="bubble-text">{m.message}</div>

                              {/* Admin Curated Pick Card Attached */}
                              {svc && (
                                <div className="admin-rec-card">
                                  <div className="arc-top-row">
                                    <span className="arc-badge">★ Super Admin Pick</span>
                                    {svc.category && <span className="arc-cat-tag">{svc.category}</span>}
                                  </div>

                                  <h4 className="arc-title">{svc.name}</h4>
                                  <p className="arc-desc">{svc.goal || svc.desc || svc.description}</p>

                                  <div className="arc-meta-pills">
                                    {svc.provider && <span className="arc-pill">🏢 {svc.provider}</span>}
                                    {svc.mode && <span className="arc-pill">📍 {svc.mode}</span>}
                                    {svc.duration && <span className="arc-pill">⏱ {svc.duration}</span>}
                                  </div>

                                  <div className="arc-footer">
                                    <div className="arc-price-wrap">
                                      <span className="arc-price">{costDisplay}</span>
                                    </div>

                                    <div className="arc-actions-row">
                                      <button
                                        type="button"
                                        className="arc-details-btn"
                                        onClick={() => setDetailsService(svc)}
                                        title="View full program details"
                                      >
                                        <span>Details</span>
                                      </button>

                                      {purchased ? (
                                        <span className="arc-purchased-tag">✓ Purchased</span>
                                      ) : (
                                        <button
                                          type="button"
                                          className={`arc-add-btn ${inCart ? "in-cart" : ""}`}
                                          onClick={() => handleAddToCartClick(svc)}
                                        >
                                          {inCart ? "✓ In Cart" : "+ Add to Cart"}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Form */}
                  {selectedRequest.status !== "closed" && (
                    <form className="afp-chat-input-bar" onSubmit={handleSend}>
                      <input
                        type="text"
                        className="afp-chat-input"
                        placeholder="Reply to Super Admin counselor..."
                        value={inputMsg}
                        onChange={(e) => setInputMsg(e.target.value)}
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        className="afp-send-btn"
                        disabled={!inputMsg.trim() || sending}
                      >
                        {sending ? "..." : "Send"}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="afp-empty-selection">
                  <span style={{ fontSize: 36 }}>💬</span>
                  <h3>Select an inquiry to view conversation</h3>
                  <p>Choose an inquiry from the left sidebar or create a new inquiry for this step.</p>
                  <button
                    type="button"
                    className="form-submit-btn"
                    onClick={() => setShowNewRequestForm(true)}
                  >
                    + Start New Inquiry
                  </button>
                </div>
              )}
            </main>

            {/* ── Right Sidebar: Recommendation & Step Overview ── */}
            <aside className="afp-details-sidebar">
              <div className="ads-section">
                <span className="ads-sec-lbl">Active Learning Step</span>
                <h4 className="ads-step-title">{selectedRequest?.stepName || stepName || "Step"}</h4>
                <div className="ads-path-sub">{selectedRequest?.pathName || pathName || "Path"}</div>
              </div>

              {latestRecommendedService ? (
                <div className="ads-rec-box">
                  <div className="ads-rec-badge">★ Super Admin Recommended</div>
                  <h4 className="ads-rec-name">{latestRecommendedService.name}</h4>
                  <p className="ads-rec-desc">
                    {latestRecommendedService.goal ||
                      latestRecommendedService.desc ||
                      latestRecommendedService.description ||
                      "Curated recommendation specifically tailored to this milestone."}
                  </p>

                  <div className="ads-meta-rows">
                    {latestRecommendedService.provider && (
                      <div className="ads-meta-row">
                        <span>Provider:</span>
                        <strong>{latestRecommendedService.provider}</strong>
                      </div>
                    )}
                    {latestRecommendedService.mode && (
                      <div className="ads-meta-row">
                        <span>Delivery:</span>
                        <strong>{latestRecommendedService.mode}</strong>
                      </div>
                    )}
                    {latestRecommendedService.duration && (
                      <div className="ads-meta-row">
                        <span>Duration:</span>
                        <strong>{latestRecommendedService.duration}</strong>
                      </div>
                    )}
                    <div className="ads-meta-row">
                      <span>Investment:</span>
                      <strong className="price">
                        {!latestRecommendedService.cost ||
                        latestRecommendedService.cost === "0" ||
                        String(latestRecommendedService.cost).toLowerCase() === "free"
                          ? "Free"
                          : `₹${Number(String(latestRecommendedService.cost).replace(/[^\d]/g, "")).toLocaleString("en-IN")}`}
                      </strong>
                    </div>
                  </div>

                  <div className="ads-actions">
                    <button
                      type="button"
                      className="ads-details-btn"
                      onClick={() => setDetailsService(latestRecommendedService)}
                    >
                      View Details
                    </button>

                    {isItemPurchased(latestRecommendedService) ? (
                      <span className="ads-purchased-tag">✓ Purchased & Active</span>
                    ) : (
                      <button
                        type="button"
                        className={`ads-cart-btn ${isItemInCart(latestRecommendedService) ? "in-cart" : ""}`}
                        onClick={() => handleAddToCartClick(latestRecommendedService)}
                      >
                        {isItemInCart(latestRecommendedService) ? "✓ In Cart" : "+ Add to Cart"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="ads-support-box">
                  <h4>Counselor Guarantee</h4>
                  <ul>
                    <li>100% curated for your learning path requirements.</li>
                    <li>Verified instructors and accredited certifications.</li>
                    <li>Direct communication channel with Super Admin.</li>
                  </ul>
                  <p className="ads-note">
                    Once Super Admin recommends an option, its full overview and direct enrollment link will be available here.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* ── Complete Marketplace Service Details Modal ── */}
      {detailsService && (
        <div className="mkt-details-modal-overlay" onClick={() => setDetailsService(null)}>
          <div className="mkt-details-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mdm-header">
              <div className="mdm-header-info">
                <span className="mdm-badge">★ Super Admin Curated Recommendation</span>
                <h3 className="mdm-title">{detailsService.name}</h3>
              </div>
              <button
                type="button"
                className="mdm-close-btn"
                onClick={() => setDetailsService(null)}
              >
                ✕
              </button>
            </div>

            <div className="mdm-body">
              {/* Key Attributes Grid */}
              <div className="mdm-attr-grid">
                <div className="mdm-attr-card">
                  <span className="attr-lbl">Category / Role</span>
                  <span className="attr-val highlight">
                    {detailsService.category || detailsService.role || "Mentorship"}
                  </span>
                </div>
                <div className="mdm-attr-card">
                  <span className="attr-lbl">Provider / Institute</span>
                  <span className="attr-val">
                    {detailsService.provider || detailsService.partner_email || "Accredited Partner"}
                  </span>
                </div>
                <div className="mdm-attr-card">
                  <span className="attr-lbl">Delivery Mode</span>
                  <span className="attr-val">📍 {detailsService.mode || "Online"}</span>
                </div>
                <div className="mdm-attr-card">
                  <span className="attr-lbl">Duration</span>
                  <span className="attr-val">⏱ {detailsService.duration || "Self-Paced"}</span>
                </div>
              </div>

              {/* Description Section */}
              <div className="mdm-section">
                <h4 className="mdm-sec-title">Program Overview & Objectives</h4>
                <p className="mdm-sec-text">
                  {detailsService.goal ||
                    detailsService.desc ||
                    detailsService.description ||
                    "Personalized marketplace option curated specifically to help you fulfill this learning milestone."}
                </p>
              </div>

              {/* Key Highlights */}
              <div className="mdm-section">
                <h4 className="mdm-sec-title">What Makes This A Match</h4>
                <ul className="mdm-highlights-list">
                  <li>Directly aligns with your learning path and target career milestones.</li>
                  <li>Custom-vetted by our senior education counseling team.</li>
                  <li>Structured milestones, continuous feedback, and official certificate of completion upon finishing.</li>
                </ul>
              </div>

              {/* Price & Checkout Section */}
              <div className="mdm-price-box">
                <div>
                  <span className="mdm-price-lbl">Total Investment</span>
                  <div className="mdm-price-val">
                    {!detailsService.cost || detailsService.cost === "0" || String(detailsService.cost).toLowerCase() === "free"
                      ? "Free"
                      : `₹${Number(String(detailsService.cost).replace(/[^\d]/g, "")).toLocaleString("en-IN")}`}
                  </div>
                </div>

                <div className="mdm-actions">
                  {isItemPurchased(detailsService) ? (
                    <div className="mdm-purchased-badge">✓ Purchased & Active</div>
                  ) : (
                    <button
                      type="button"
                      className={`mdm-cart-btn ${isItemInCart(detailsService) ? "in-cart" : ""}`}
                      onClick={() => handleAddToCartClick(detailsService)}
                    >
                      {isItemInCart(detailsService) ? "✓ In Cart (Click to Remove)" : "+ Add to Cart"}
                    </button>
                  )}

                  {onOpenCart && !isItemPurchased(detailsService) && isItemInCart(detailsService) && (
                    <button
                      type="button"
                      className="mdm-checkout-btn"
                      onClick={() => {
                        setDetailsService(null);
                        onClose();
                        onOpenCart();
                      }}
                    >
                      Go to Cart & Checkout →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}

