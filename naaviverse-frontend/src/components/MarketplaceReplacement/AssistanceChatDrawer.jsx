import React, { useState, useEffect, useRef } from "react";
import "./AssistanceChatDrawer.scss";
import marketplaceReplacementService from "../../services/marketplaceReplacementService";

export default function AssistanceChatDrawer({
  isOpen,
  onClose,
  activeRequestId,
  userEmail,
  userName,
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

  const messagesEndRef = useRef(null);
  const chatStreamRef = useRef(null);

  // Load all user assistance requests
  const loadRequests = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await marketplaceReplacementService.getUserAssistanceRequests(userEmail);
      setRequests(data);
      if (data.length > 0) {
        if (activeRequestId) {
          const match = data.find((r) => r.id === activeRequestId);
          setSelectedRequest(match || data[0]);
        } else if (!selectedRequest) {
          setSelectedRequest(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load assistance requests:", err);
    } finally {
      setLoading(false);
    }
  }, [userEmail, activeRequestId, selectedRequest]);

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
    if (selectedRequest?.id) {
      loadMessages(selectedRequest.id);
      const timer = setInterval(() => {
        loadMessages(selectedRequest.id);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [selectedRequest?.id, loadMessages]);

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

  return (
    <>
      <div className="assist-drawer-overlay" onClick={onClose}>
        <div className="assist-drawer-panel" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="assist-drawer-header">
            <div className="adh-left">
              <div className="adh-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="adh-title">Super Admin Assistance</h3>
                <p className="adh-sub">Direct support & curated marketplace recommendations</p>
              </div>
            </div>
            <button className="adh-close-btn" onClick={onClose} type="button">✕</button>
          </div>

          {/* Multi-request selector if user has more than 1 ticket */}
          {requests.length > 1 && (
            <div className="adh-tickets-bar">
              {requests.map((r) => {
                const isSel = selectedRequest?.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`ticket-tab-btn ${isSel ? "active" : ""}`}
                    onClick={() => setSelectedRequest(r)}
                  >
                    <span className="tt-step">{r.stepName || "Assistance Request"}</span>
                    <span className="tt-status" style={{ color: statusColors[r.status]?.color }}>
                      ● {statusColors[r.status]?.label || r.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Request Banner */}
          {selectedRequest && (
            <div className="assist-ticket-info-card">
              <div className="atic-top">
                <div className="atic-path">
                  <strong>{selectedRequest.pathName || "Learning Path"}</strong> › {selectedRequest.stepName || "Step"}
                </div>
                <span
                  className="atic-badge"
                  style={{
                    background: statusColors[selectedRequest.status]?.bg,
                    color: statusColors[selectedRequest.status]?.color,
                  }}
                >
                  <span className="atic-dot">●</span>
                  <span>{statusColors[selectedRequest.status]?.label || selectedRequest.status}</span>
                </span>
              </div>
              <p className="atic-req">
                <strong>Requirement:</strong> {selectedRequest.userRequirement?.message || "Custom recommendation requested after 3 replacements."}
              </p>
            </div>
          )}

          {/* Real-time Added to Cart Banner */}
          {justAddedService && (
            <div className="assist-cart-toast">
              <div className="act-left">
                <span className="act-icon">✓</span>
                <span className="act-msg">
                  Added <strong>{justAddedService.name}</strong> to cart!
                </span>
              </div>
              {onOpenCart && (
                <button
                  type="button"
                  className="act-btn-view"
                  onClick={() => {
                    setJustAddedService(null);
                    onOpenCart();
                  }}
                >
                  View Cart →
                </button>
              )}
            </div>
          )}

          {/* Conversation Stream */}
          <div className="assist-chat-stream" ref={chatStreamRef}>
            {loading ? (
              <div className="chat-empty-state">Loading assistance ticket...</div>
            ) : !selectedRequest ? (
              <div className="chat-empty-state">
                <span style={{ fontSize: 32 }}>💬</span>
                <p>No active assistance requests found.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="chat-empty-state">
                <span style={{ fontSize: 32 }}>⏳</span>
                <p>Your request has been submitted to the Super Admin team. We will review your requirement and reply here shortly.</p>
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
                  <div key={m.id} className={`chat-bubble-wrap ${isAdmin ? "admin-bubble-wrap" : "user-bubble-wrap"}`}>
                    <div className="bubble-sender-meta">
                      <span className="sender-name">{isAdmin ? "🛡️ Naavi Super Admin" : "You"}</span>
                      <span className="sender-time">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className={`chat-bubble ${isAdmin ? "admin-bubble" : "user-bubble"}`}>
                      <div className="bubble-text">{m.message}</div>

                      {/* Admin Recommendation Card Attached */}
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

          {/* Chat Input Bar */}
          {selectedRequest && selectedRequest.status !== "closed" && (
            <form className="assist-input-bar" onSubmit={handleSend}>
              <input
                type="text"
                className="assist-text-input"
                placeholder="Reply to Super Admin..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="assist-send-btn"
                disabled={!inputMsg.trim() || sending}
              >
                {sending ? "..." : "Send"}
              </button>
            </form>
          )}
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
                  <span className="attr-val highlight">{detailsService.category || detailsService.role || "Mentorship"}</span>
                </div>
                <div className="mdm-attr-card">
                  <span className="attr-lbl">Provider / Institute</span>
                  <span className="attr-val">{detailsService.provider || detailsService.partner_email || "Accredited Partner"}</span>
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
                  {detailsService.goal || detailsService.desc || detailsService.description || "Personalized marketplace option curated specifically to help you fulfill this learning milestone."}
                </p>
              </div>

              {/* Key Highlights / Why Recommended */}
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
    </>
  );
}
