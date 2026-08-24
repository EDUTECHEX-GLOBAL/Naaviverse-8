import React, { useState, useEffect, useRef } from "react";
import "./MarketplaceAssistance.scss";
import marketplaceReplacementService from "../../services/marketplaceReplacementService";
import AdminMarketplaceRecommendationModal from "./AdminMarketplaceRecommendationModal";

const REASON_LABELS = {
  too_expensive: "Too expensive",
  wrong_location: "Wrong location",
  wrong_level: "Wrong level",
  wrong_duration: "Wrong duration",
  offline_preferred: "Offline preferred",
  online_preferred: "Online preferred",
  rating_not_suitable: "Rating not suitable",
  service_type_mismatch: "Service type mismatch",
  not_relevant: "Not relevant to goal",
  other: "Other",
};

export default function AssistanceRequestDetailsModal({
  isOpen,
  onClose,
  request,
  onStatusChange,
  availableServices = [],
}) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [showRecModal, setShowRecModal] = useState(false);
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);

  const loadMessages = async () => {
    if (!request?.id) return;
    try {
      const data = await marketplaceReplacementService.getMessages(request.id);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  useEffect(() => {
    if (isOpen && request?.id) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, request?.id]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen || !request) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const text = inputMsg.trim();
    setInputMsg("");
    setSending(true);

    try {
      const sent = await marketplaceReplacementService.sendMessage({
        requestId: request.id,
        senderId: "super_admin_lead",
        senderRole: "SUPER_ADMIN",
        senderName: "Naavi Support Lead",
        message: text,
      });
      setMessages((prev) => [...prev, sent]);
    } catch (err) {
      console.error("Error sending admin message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleRecommendService = async (service, note) => {
    try {
      const sent = await marketplaceReplacementService.recommendServiceToUser({
        requestId: request.id,
        adminId: "super_admin_lead",
        adminName: "Naavi Support Lead",
        service,
        note,
        stepId: request.stepId || request.step_id,
        userEmail: request.userEmail || request.userId,
      });
      setMessages((prev) => [...prev, sent]);
      if (request.status === "pending") {
        onStatusChange(request.id, "reviewing");
      }
    } catch (err) {
      console.error("Error recommending service:", err);
    }
  };

  const reasonsList = request.userRequirement?.reasons || [];

  return (
    <div className="admin-assist-details-overlay" onClick={onClose}>
      <div className="admin-assist-details-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="aadd-header">
          <div>
            <div className="aadd-meta-top">
              <span className="aadd-id">Ticket #{request.id}</span>
              <span className={`aadd-status-badge status-${request.status}`}>
                {request.status.toUpperCase()}
              </span>
            </div>
            <h2 className="aadd-title">{request.userName} ({request.userEmail})</h2>
            <div className="aadd-path-step">
              Path: <strong>{request.pathName}</strong> › Step: <strong>{request.stepName}</strong>
            </div>
          </div>
          <button className="aadd-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Action Toolbar */}
        <div className="aadd-toolbar">
          <div className="aadd-status-select-wrap">
            <span className="status-lbl">Update Status:</span>
            <select
              className="status-dropdown"
              value={request.status}
              onChange={(e) => onStatusChange(request.id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="reviewing">In Review / Chatting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <button
            className="aadd-rec-btn"
            onClick={() => setShowRecModal(true)}
          >
            ★ Recommend Marketplace Item
          </button>
        </div>

        {/* Content Container (Two Column / Split) */}
        <div className="aadd-content-grid">
          {/* Left Column: Requirements & History */}
          <div className="aadd-info-pane">
            <div className="aadd-card">
              <h4 className="card-title">User Requirement Statement</h4>
              <p className="req-quote">
                "{request.userRequirement?.message || "User requested customized options after 3 replacement rounds."}"
              </p>
              {reasonsList.length > 0 && (
                <div className="reasons-wrap">
                  <div className="reasons-title">Rejection Reasons Tagged:</div>
                  <div className="reasons-chips">
                    {reasonsList.map((r, i) => (
                      <span key={i} className="r-chip">
                        {REASON_LABELS[r] || r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Previous Recommendations */}
            <div className="aadd-card">
              <h4 className="card-title">
                Previous Recommendations ({request.previousRecommendations?.length || 0} / 3)
              </h4>
              <div className="prev-items-list">
                {request.previousRecommendations?.map((item, idx) => (
                  <div key={item.id || item._id || idx} className="prev-item-row">
                    <div className="pir-left">
                      <span className="pir-num">#{idx + 1}</span>
                      <div>
                        <div className="pir-name">{item.name || `Service ${item}`}</div>
                        {item.cost !== undefined && (
                          <div className="pir-cost">
                            Cost: {item.cost === 0 || item.cost === "0" ? "Free" : `₹${item.cost}`}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="pir-badge">Rejected</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Chat History */}
          <div className="aadd-chat-pane">
            <div className="chat-pane-header">
              <h4>Conversation with {request.userName}</h4>
              <span className="chat-count">{messages.length} messages</span>
            </div>

            <div className="admin-chat-messages" ref={chatMessagesRef}>
              {messages.length === 0 ? (
                <div className="chat-empty">No messages yet. Send the first message to the user below.</div>
              ) : (
                messages.map((m) => {
                  const isAdmin = m.senderRole === "SUPER_ADMIN";
                  return (
                    <div key={m.id} className={`adm-msg-wrap ${isAdmin ? "from-admin" : "from-user"}`}>
                      <div className="adm-msg-header">
                        <span className="adm-msg-name">{isAdmin ? "🛡️ You (Super Admin)" : m.senderName}</span>
                        <span className="adm-msg-time">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className={`adm-msg-bubble ${isAdmin ? "adm-bubble" : "usr-bubble"}`}>
                        <div className="adm-msg-text">{m.message}</div>
                        {m.recommendedService && (
                          <div className="admin-rec-attached">
                            <div className="ara-tag">★ Recommended to User</div>
                            <div className="ara-title">{m.recommendedService.name}</div>
                            <div className="ara-price">
                              Price: {!m.recommendedService.cost || m.recommendedService.cost === "0"
                                ? "Free"
                                : `₹${Number(m.recommendedService.cost).toLocaleString("en-IN")}`}
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

            <form onSubmit={handleSendMessage} className="admin-chat-input-row">
              <input
                type="text"
                placeholder="Type response to user..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                disabled={sending}
              />
              <button type="submit" disabled={!inputMsg.trim() || sending}>
                {sending ? "..." : "Send"}
              </button>
            </form>
          </div>
        </div>

        {/* Recommend Modal */}
        <AdminMarketplaceRecommendationModal
          isOpen={showRecModal}
          onClose={() => setShowRecModal(false)}
          onRecommend={handleRecommendService}
          availableServices={availableServices}
          request={request}
          studentName={request?.userName}
        />
      </div>
    </div>
  );
}
