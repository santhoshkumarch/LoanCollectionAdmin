import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import {
  RiCheckboxCircleLine,
  RiSearchLine,
  RiCloseLine,
  RiUserLine,
  RiCalendarLine,
  RiArrowRightLine,
  RiCheckLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiInformationLine,
} from "react-icons/ri";
import { apiFetch } from "../config/api";
import { usePermission } from "../hooks/usePermission";
import { toaster } from "../components/ui/toaster";

const ACCENT = "#8b5cf6";

const STATUS = {
  PENDING: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    label: "Pending",
  },
  APPROVED: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
    label: "Approved",
  },
  REJECTED: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
    label: "Rejected",
  },
};

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

const fmtDate = d =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtDateTime = d =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

const fmtType = type => {
  if (!type) return "—";
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
};

function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.PENDING;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.color,
          display: "inline-block",
        }}
      />
      {s.label}
    </span>
  );
}

function TypeBadge({ requestType }) {
  if (!requestType) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 700,
        background: "rgba(139,92,246,0.1)",
        border: "1px solid rgba(139,92,246,0.2)",
        color: "#a78bfa",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        flexShrink: 0,
      }}
    >
      {fmtType(requestType)}
    </span>
  );
}

function ApprovalRow({ approval, selected, onClick }) {
  const isSelected = selected?.id === approval.id;
  const s = STATUS[approval.status] ?? STATUS.PENDING;
  return (
    <div
      onClick={() => onClick(approval)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 16px",
        cursor: "pointer",
        borderRadius: 12,
        background: isSelected ? "rgba(139,92,246,0.07)" : "transparent",
        border: `1px solid ${isSelected ? "rgba(139,92,246,0.3)" : "transparent"}`,
        transition: "all 0.15s",
        marginBottom: 2,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: s.bg,
          border: `1px solid ${s.border}`,
        }}
      >
        <RiCheckboxCircleLine size={20} color={s.color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>
            {fmtType(approval.requestType)}
          </span>
          <StatusBadge status={approval.status} />
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {approval.requestedByName && (
            <span style={{ fontSize: 12, color: "rgba(226,232,240,0.35)" }}>
              by {approval.requestedByName}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          textAlign: "right",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 6,
        }}
      >
        <span style={{ color: "rgba(226,232,240,0.3)", fontSize: 11 }}>
          {fmtDate(approval.createdAt)}
        </span>
        <RiArrowRightLine size={13} color="rgba(139,92,246,0.35)" />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, valueColor }) {
  if (value == null || value === "") return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          flexShrink: 0,
          marginTop: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(139,92,246,0.07)",
        }}
      >
        <Icon size={14} color={ACCENT} />
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(226,232,240,0.35)",
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: valueColor ?? "rgba(226,232,240,0.85)",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: "rgba(139,92,246,0.6)",
        letterSpacing: "1px",
        textTransform: "uppercase",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "rgba(255,255,255,0.05)",
        margin: "16px 0",
      }}
    />
  );
}

function DetailPanel({
  approval,
  onClose,
  onApprove,
  onReject,
  actionLoading,
  canAction,
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const isPending = approval.status === "PENDING";
  const s = STATUS[approval.status] ?? STATUS.PENDING;

  const handleRejectConfirm = () => {
    if (!reason.trim()) return;
    onReject(approval.id, reason.trim());
    setRejecting(false);
    setReason("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: 72,
        right: 0,
        bottom: 0,
        width: 420,
        background: "#0d1f35",
        borderLeft: "1px solid rgba(139,92,246,0.12)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.45)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0d1f35",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                approval.status === "APPROVED"
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : approval.status === "REJECTED"
                    ? "rgba(239,68,68,0.12)"
                    : "rgba(139,92,246,0.12)",
              boxShadow:
                approval.status === "APPROVED"
                  ? "0 0 20px rgba(16,185,129,0.3)"
                  : "none",
            }}
          >
            <RiCheckboxCircleLine size={22} color={s.color} />
          </div>
          <div>
            <div
              style={{
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 5,
              }}
            >
              {fmtType(approval.requestType)}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <StatusBadge status={approval.status} />
              <TypeBadge requestType={approval.requestType} />
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(226,232,240,0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RiCloseLine size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
        {approval.status === "REJECTED" && approval.rejectionReason && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              marginBottom: 20,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.18)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(239,68,68,0.6)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: 6,
              }}
            >
              Rejection Reason
            </div>
            <div style={{ fontSize: 13, color: "#fca5a5" }}>
              {approval.rejectionReason}
            </div>
          </div>
        )}

        <SectionLabel>Request Details</SectionLabel>
        <InfoRow
          icon={RiTimeLine}
          label="Type"
          value={fmtType(approval.requestType)}
        />
        <InfoRow
          icon={RiUserLine}
          label="Requested By"
          value={approval.requestedByName}
        />
        {approval.approvedByName && (
          <InfoRow
            icon={RiUserLine}
            label="Resolved By"
            value={approval.approvedByName}
            valueColor="#10b981"
          />
        )}

        <Divider />
        <SectionLabel>Timeline</SectionLabel>
        <InfoRow
          icon={RiCalendarLine}
          label="Requested At"
          value={fmtDateTime(approval.createdAt)}
        />
        <InfoRow
          icon={RiCalendarLine}
          label="Updated At"
          value={fmtDateTime(approval.updatedAt)}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "14px 22px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {isPending && canAction && !rejecting && (
          <>
            <button
              onClick={() => onApprove(approval.id)}
              disabled={actionLoading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: "0 4px 16px rgba(16,185,129,0.25)",
                opacity: actionLoading ? 0.7 : 1,
              }}
            >
              {actionLoading ? (
                <Spinner size="xs" />
              ) : (
                <>
                  <RiCheckLine size={15} />
                  Approve
                </>
              )}
            </button>
            <button
              onClick={() => setRejecting(true)}
              disabled={actionLoading}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.18)",
                color: "#fca5a5",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <RiCloseCircleLine size={15} />
              Reject
            </button>
          </>
        )}

        {isPending && canAction && rejecting && (
          <>
            <textarea
              autoFocus
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason for rejectionâ€¦"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 13,
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#e2e8f0",
                outline: "none",
                fontFamily: "inherit",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
            <Flex gap={2}>
              <button
                onClick={() => {
                  setRejecting(false);
                  setReason("");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(226,232,240,0.5)",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!reason.trim() || actionLoading}
                style={{
                  flex: 2,
                  padding: "10px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: reason.trim()
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(239,68,68,0.05)",
                  border: `1px solid ${reason.trim() ? "rgba(239,68,68,0.35)" : "rgba(239,68,68,0.1)"}`,
                  color: reason.trim() ? "#fca5a5" : "rgba(252,165,165,0.35)",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: actionLoading ? 0.7 : 1,
                }}
              >
                {actionLoading ? (
                  <Spinner size="xs" />
                ) : (
                  <>
                    <RiCloseCircleLine size={14} />
                    Confirm Reject
                  </>
                )}
              </button>
            </Flex>
          </>
        )}

        {isPending && !canAction && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(139,92,246,0.06)",
              border: "1px solid rgba(139,92,246,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <RiInformationLine
              size={15}
              color={ACCENT}
              style={{ flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: "rgba(226,232,240,0.5)" }}>
              You do not have permission to approve or reject requests
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Approvals() {
  const { can } = usePermission();
  const canAction = can("approvals:approve");

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/approval-requests?all=true");
      setApprovals(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const changeFilter = f => {
    setActiveFilter(f);
    setSelected(null);
    setSearch("");
  };

  const filtered = approvals.filter(a => {
    const matchesFilter = activeFilter === "ALL" || a.status === activeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      fmtType(a.requestType).toLowerCase().includes(q) ||
      a.requestedByName?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    ALL: approvals.length,
    PENDING: approvals.filter(a => a.status === "PENDING").length,
    APPROVED: approvals.filter(a => a.status === "APPROVED").length,
    REJECTED: approvals.filter(a => a.status === "REJECTED").length,
  };

  const handleApprove = async id => {
    setActionLoading(true);
    try {
      const updated = await apiFetch(`/api/approval-requests/${id}/approve`, {
        method: "PUT",
      });
      setApprovals(prev => prev.map(a => (a.id === id ? updated : a)));
      setSelected(updated);
      toaster.create({ title: "Request approved", type: "success" });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id, reason) => {
    setActionLoading(true);
    try {
      const updated = await apiFetch(`/api/approval-requests/${id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });
      setApprovals(prev => prev.map(a => (a.id === id ? updated : a)));
      setSelected(updated);
      toaster.create({ title: "Request rejected", type: "info" });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box
      p={{ base: 4, md: 6 }}
      style={{ background: "#0b1929", minHeight: "100%" }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Flex align="center" gap={3} mb={6}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <RiCheckboxCircleLine size={22} color={ACCENT} />
          </div>
          <div>
            <Text
              fontSize="xl"
              fontWeight="800"
              color="white"
              letterSpacing="-0.3px"
            >
              Approval Requests
            </Text>
            <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
              {loading
                ? "â€¦"
                : `${approvals.length} total · ${counts.PENDING} pending`}
            </Text>
          </div>
        </Flex>
      </motion.div>

      {/* Filter + search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Flex
          gap={3}
          mb={5}
          align="center"
          justify="space-between"
          flexWrap="wrap"
        >
          <Flex gap={2} flexWrap="wrap">
            {FILTERS.map(f => {
              const active = activeFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => changeFilter(f)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                    background: active
                      ? "rgba(139,92,246,0.12)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: active ? ACCENT : "rgba(226,232,240,0.5)",
                  }}
                >
                  {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 10,
                      background: active
                        ? "rgba(139,92,246,0.18)"
                        : "rgba(255,255,255,0.06)",
                      color: active ? ACCENT : "rgba(226,232,240,0.4)",
                    }}
                  >
                    {counts[f]}
                  </span>
                </button>
              );
            })}
          </Flex>

          <div style={{ position: "relative" }}>
            <RiSearchLine
              size={14}
              color="rgba(139,92,246,0.4)"
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search requestsâ€¦"
              style={{
                padding: "8px 14px 8px 34px",
                borderRadius: 10,
                fontSize: 13,
                width: 220,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(139,92,246,0.18)",
                color: "#e2e8f0",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
        </Flex>
      </motion.div>

      {error && (
        <Box
          mb={4}
          p={3}
          borderRadius="10px"
          fontSize="sm"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5",
          }}
        >
          {error}
        </Box>
      )}

      {/* List */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Box
          borderRadius="20px"
          style={{
            background: "#112240",
            border: "1px solid rgba(255,255,255,0.07)",
            marginRight: selected ? 430 : 0,
            transition: "margin-right 0.3s ease",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(226,232,240,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Request · Type · Requested By
            </span>
          </div>

          {loading ? (
            <Flex justify="center" align="center" py={16}>
              <Spinner style={{ color: "rgba(139,92,246,0.6)" }} />
            </Flex>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 24px" }}>
              <RiCheckboxCircleLine
                size={44}
                color="rgba(139,92,246,0.12)"
                style={{ margin: "0 auto 14px" }}
              />
              <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
                {search
                  ? "No requests match your search"
                  : `No ${activeFilter === "ALL" ? "" : activeFilter.toLowerCase() + " "}requests found`}
              </div>
            </div>
          ) : (
            <div style={{ padding: "6px 6px" }}>
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <ApprovalRow
                    approval={a}
                    selected={selected}
                    onClick={item =>
                      setSelected(prev => (prev?.id === item.id ? null : item))
                    }
                  />
                </motion.div>
              ))}
            </div>
          )}
        </Box>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <DetailPanel
            key={selected.id}
            approval={selected}
            onClose={() => setSelected(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            actionLoading={actionLoading}
            canAction={canAction}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
