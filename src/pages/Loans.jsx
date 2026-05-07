import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex, Text, Spinner, Grid } from "@chakra-ui/react";
import {
  RiMoneyDollarBoxLine,
  RiSearchLine,
  RiCloseLine,
  RiAddLine,
  RiUserLine,
  RiCalendarLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiTimeLine,
  RiPercentLine,
  RiArrowDownLine,
} from "react-icons/ri";
import { apiFetch } from "../config/api";
import { usePermission } from "../hooks/usePermission";
import { toaster } from "../components/ui/toaster";

const STATUS = {
  ACTIVE: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
    label: "Active",
  },
  CLOSED: {
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.2)",
    label: "Closed",
  },
};

const FILTERS = ["ALL", "ACTIVE", "CLOSED"];

const fmt = amount =>
  amount != null
    ? `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

const fmtDate = d =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

function StatusBadge({ status }) {
  const s = STATUS[status] ?? {};
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

function RepaymentBar({ loan }) {
  const paid = Number(loan.loanAmount) - Number(loan.outstandingAmount);
  const pct =
    loan.loanAmount > 0
      ? Math.min(100, Math.max(0, (paid / Number(loan.loanAmount)) * 100))
      : 0;
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(226,232,240,0.4)" }}>
          Repaid {pct.toFixed(0)}%
        </span>
        <span style={{ fontSize: 11, color: "#10b981" }}>
          Outstanding: {fmt(loan.outstandingAmount)}
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 4,
          background: "rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            height: 4,
            borderRadius: 4,
            width: `${pct}%`,
            background:
              loan.status === "CLOSED"
                ? "linear-gradient(90deg, #94a3b8, #64748b)"
                : "linear-gradient(90deg, #10b981, #34d399)",
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

function LoanRow({ loan, selected, onClick }) {
  const isSelected = selected?.id === loan.id;
  return (
    <div
      onClick={() => onClick(loan)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        cursor: "pointer",
        borderRadius: 12,
        background: isSelected ? "rgba(16,185,129,0.07)" : "transparent",
        border: `1px solid ${isSelected ? "rgba(16,185,129,0.3)" : "transparent"}`,
        transition: "all 0.15s",
        marginBottom: 2,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            loan.status === "CLOSED"
              ? "rgba(148,163,184,0.08)"
              : "rgba(16,185,129,0.1)",
          border: `1px solid ${loan.status === "CLOSED" ? "rgba(148,163,184,0.15)" : "rgba(16,185,129,0.2)"}`,
        }}
      >
        <RiMoneyDollarBoxLine
          size={20}
          color={loan.status === "CLOSED" ? "#94a3b8" : "#10b981"}
        />
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>
            {loan.customerName ?? "—"}
          </span>
          <StatusBadge status={loan.status} />
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(226,232,240,0.45)" }}>
            Loan:{" "}
            <span style={{ color: "rgba(226,232,240,0.75)", fontWeight: 600 }}>
              {fmt(loan.loanAmount)}
            </span>
          </span>
          <span style={{ fontSize: 12, color: "rgba(226,232,240,0.45)" }}>
            Principal:{" "}
            <span style={{ color: "rgba(226,232,240,0.65)" }}>
              {fmt(loan.principalAmount)}
            </span>
          </span>
        </div>
        <RepaymentBar loan={loan} />
      </div>

      {/* Date + arrow */}
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
          {fmtDate(loan.disbursalDate)}
        </span>
        <RiArrowRightLine size={13} color="rgba(16,185,129,0.35)" />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, valueColor }) {
  if (!value && value !== 0) return null;
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
          background: "rgba(16,185,129,0.07)",
        }}
      >
        <Icon size={14} color="#10b981" />
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
        color: "rgba(16,185,129,0.6)",
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
  loan,
  onClose,
  onSettle,
  onApproveSettle,
  onDelete,
  actionLoading,
  canApproveSettle,
  canDelete,
}) {
  const paid = Number(loan.loanAmount) - Number(loan.outstandingAmount);
  const pct =
    loan.loanAmount > 0
      ? Math.min(100, (paid / Number(loan.loanAmount)) * 100)
      : 0;
  const isActive = loan.status === "ACTIVE";

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
        borderLeft: "1px solid rgba(16,185,129,0.12)",
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
              background: isActive
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "rgba(148,163,184,0.15)",
              boxShadow: isActive ? "0 0 20px rgba(16,185,129,0.3)" : "none",
            }}
          >
            <RiMoneyDollarBoxLine
              size={22}
              color={isActive ? "white" : "#94a3b8"}
            />
          </div>
          <div>
            <div
              style={{
                color: "white",
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 5,
              }}
            >
              {loan.customerName}
            </div>
            <StatusBadge status={loan.status} />
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
        {/* Repayment summary */}
        <div
          style={{
            padding: "16px",
            borderRadius: 14,
            marginBottom: 20,
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(226,232,240,0.4)",
                  marginBottom: 3,
                }}
              >
                Loan Amount
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>
                {fmt(loan.loanAmount)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(226,232,240,0.4)",
                  marginBottom: 3,
                }}
              >
                Outstanding
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>
                {fmt(loan.outstandingAmount)}
              </div>
            </div>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 6,
              background: "rgba(255,255,255,0.07)",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                height: 6,
                borderRadius: 6,
                width: `${pct}%`,
                background:
                  loan.status === "CLOSED"
                    ? "linear-gradient(90deg, #94a3b8, #64748b)"
                    : "linear-gradient(90deg, #10b981, #34d399)",
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(226,232,240,0.45)",
              textAlign: "center",
            }}
          >
            {fmt(paid)} repaid · {pct.toFixed(1)}% complete
          </div>
        </div>

        <SectionLabel>Loan Details</SectionLabel>
        <InfoRow icon={RiUserLine} label="Customer" value={loan.customerName} />
        <InfoRow
          icon={RiArrowDownLine}
          label="Principal Amount"
          value={fmt(loan.principalAmount)}
        />
        <InfoRow
          icon={RiMoneyDollarBoxLine}
          label="Loan Amount"
          value={fmt(loan.loanAmount)}
        />
        {Number(loan.discount) > 0 && (
          <InfoRow
            icon={RiPercentLine}
            label="Discount"
            value={fmt(loan.discount)}
            valueColor="#f59e0b"
          />
        )}

        <Divider />
        <SectionLabel>Timeline</SectionLabel>
        <InfoRow
          icon={RiCalendarLine}
          label="Disbursal Date"
          value={fmtDate(loan.disbursalDate)}
        />
        <InfoRow
          icon={RiTimeLine}
          label="Tentative Settlement Date"
          value={fmtDate(loan.tentativeSettlementDate)}
        />
        {loan.actualSettlementDate && (
          <InfoRow
            icon={RiCheckLine}
            label="Settled On"
            value={fmtDate(loan.actualSettlementDate)}
            valueColor="#10b981"
          />
        )}

        <Divider />
        <SectionLabel>Record Info</SectionLabel>
        <InfoRow
          icon={RiCalendarLine}
          label="Created At"
          value={
            loan.createdAt
              ? new Date(loan.createdAt).toLocaleString("en-IN")
              : null
          }
        />
        <InfoRow
          icon={RiCalendarLine}
          label="Updated At"
          value={
            loan.updatedAt
              ? new Date(loan.updatedAt).toLocaleString("en-IN")
              : null
          }
        />
      </div>

      {/* Footer */}
      {isActive && (
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
          {!canApproveSettle && (
            <button
              onClick={() => onSettle(loan.id)}
              disabled={actionLoading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.25)",
                color: "#fbbf24",
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
                  <RiTimeLine size={15} />
                  Request Settlement
                </>
              )}
            </button>
          )}
          {canApproveSettle && (
            <button
              onClick={() => onApproveSettle(loan.id)}
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
                  Settle Loan
                </>
              )}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(loan.id)}
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
                opacity: actionLoading ? 0.7 : 1,
              }}
            >
              {actionLoading ? (
                <Spinner size="xs" />
              ) : (
                <>
                  <RiDeleteBinLine size={14} />
                  Delete Loan
                </>
              )}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// â”€â”€ Create Loan Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const EMPTY_FORM = {
  customerId: "",
  principalAmount: "",
  loanAmount: "",
  disbursalDate: "",
  tentativeSettlementDate: "",
  discount: "",
};

function CreateLoanModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/customers?status=APPROVED")
      .then(data => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]))
      .finally(() => setLoadingCustomers(false));
  }, []);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (
      !form.customerId ||
      !form.principalAmount ||
      !form.loanAmount ||
      !form.disbursalDate
    ) {
      setError(
        "Customer, principal amount, loan amount, and disbursal date are required."
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        customerId: form.customerId,
        principalAmount: Number(form.principalAmount),
        loanAmount: Number(form.loanAmount),
        disbursalDate: form.disbursalDate,
        ...(form.tentativeSettlementDate && {
          tentativeSettlementDate: form.tentativeSettlementDate,
        }),
        ...(form.discount && { discount: Number(form.discount) }),
      };
      const created = await apiFetch("/api/loans", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toaster.create({ title: "Loan created successfully", type: "success" });
      onCreated(created);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    fontSize: 13,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(16,185,129,0.2)",
    color: "#e2e8f0",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 12,
    color: "rgba(226,232,240,0.5)",
    marginBottom: 6,
    display: "block",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "#0d1f35",
          borderRadius: 20,
          width: "100%",
          maxWidth: 480,
          border: "1px solid rgba(16,185,129,0.15)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(16,185,129,0.12)",
              }}
            >
              <RiMoneyDollarBoxLine size={18} color="#10b981" />
            </div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
              New Loan
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(226,232,240,0.5)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RiCloseLine size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 22px" }}>
          {/* Customer */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Customer *</label>
            {loadingCustomers ? (
              <div
                style={{
                  ...inputStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "rgba(226,232,240,0.4)",
                }}
              >
                <Spinner size="xs" /> Loading customersâ€¦
              </div>
            ) : (
              <select
                value={form.customerId}
                onChange={e => set("customerId", e.target.value)}
                style={{ ...inputStyle, appearance: "none" }}
                required
              >
                <option value="" style={{ background: "#0d1f35" }}>
                  Select approved customerâ€¦
                </option>
                {customers.map(c => (
                  <option
                    key={c.id}
                    value={c.id}
                    style={{ background: "#0d1f35" }}
                  >
                    {c.name} · {c.mobile}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amounts */}
          <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
            <div>
              <label style={labelStyle}>Principal Amount (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.principalAmount}
                onChange={e => set("principalAmount", e.target.value)}
                placeholder="0.00"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Loan Amount (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.loanAmount}
                onChange={e => set("loanAmount", e.target.value)}
                placeholder="0.00"
                style={inputStyle}
                required
              />
            </div>
          </Grid>

          {/* Dates */}
          <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
            <div>
              <label style={labelStyle}>Disbursal Date *</label>
              <input
                type="date"
                value={form.disbursalDate}
                onChange={e => set("disbursalDate", e.target.value)}
                style={{ ...inputStyle, colorScheme: "dark" }}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Tentative Settlement</label>
              <input
                type="date"
                value={form.tentativeSettlementDate}
                onChange={e => set("tentativeSettlementDate", e.target.value)}
                style={{ ...inputStyle, colorScheme: "dark" }}
              />
            </div>
          </Grid>

          {/* Discount */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Discount (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.discount}
              onChange={e => set("discount", e.target.value)}
              placeholder="0.00 (optional)"
              style={inputStyle}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 14,
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 12,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(226,232,240,0.55)",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 2,
                padding: "11px",
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
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <Spinner size="xs" />
              ) : (
                <>
                  <RiCheckLine size={15} />
                  Create Loan
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Loans() {
  const { can } = usePermission();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/loans");
      setLoans(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const changeFilter = f => {
    setActiveFilter(f);
    setSelected(null);
    setSearch("");
  };

  const filtered = loans.filter(loan => {
    const matchesFilter =
      activeFilter === "ALL" || loan.status === activeFilter;
    const matchesSearch = loan.customerName
      ?.toLowerCase()
      .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    ALL: loans.length,
    ACTIVE: loans.filter(l => l.status === "ACTIVE").length,
    CLOSED: loans.filter(l => l.status === "CLOSED").length,
  };

  // Summary stats
  const totalOutstanding = loans
    .filter(l => l.status === "ACTIVE")
    .reduce((sum, l) => sum + Number(l.outstandingAmount ?? 0), 0);
  const totalDisbursed = loans
    .filter(l => l.status === "ACTIVE")
    .reduce((sum, l) => sum + Number(l.loanAmount ?? 0), 0);

  const handleSettle = async id => {
    setActionLoading(true);
    try {
      const updated = await apiFetch(`/api/loans/${id}/settle`, {
        method: "PUT",
      });
      setLoans(prev => prev.map(l => (l.id === id ? updated : l)));
      setSelected(updated);
      toaster.create({ title: "Settlement requested", type: "info" });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveSettle = async id => {
    setActionLoading(true);
    try {
      const updated = await apiFetch(`/api/loans/${id}/settle/approve`, {
        method: "PUT",
      });
      setLoans(prev => prev.map(l => (l.id === id ? updated : l)));
      setSelected(updated);
      toaster.create({ title: "Loan settled & closed", type: "success" });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
      // Refresh in case loan state changed on the server (deleted or already closed)
      fetchLoans();
      setSelected(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async id => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/loans/${id}`, { method: "DELETE" });
      setLoans(prev => prev.filter(l => l.id !== id));
      setSelected(null);
      toaster.create({ title: "Loan deleted", type: "info" });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreated = newLoan => {
    setLoans(prev => [newLoan, ...prev]);
    setShowCreate(false);
    setSelected(newLoan);
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
        <Flex align="center" justify="space-between" mb={6}>
          <Flex align="center" gap={3}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <RiMoneyDollarBoxLine size={22} color="#10b981" />
            </div>
            <div>
              <Text
                fontSize="xl"
                fontWeight="800"
                color="white"
                letterSpacing="-0.3px"
              >
                Loans
              </Text>
              <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
                {loading ? "â€¦" : `${loans.length} total`}
              </Text>
            </div>
          </Flex>

          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 18px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "inherit",
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
            }}
          >
            <RiAddLine size={16} />
            New Loan
          </button>
        </Flex>
      </motion.div>

      {/* Summary stat cards */}
      {!loading && loans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2,1fr)" }}
            gap={4}
            mb={5}
          >
            {[
              {
                label: "Total Active Disbursed",
                value: fmt(totalDisbursed),
                color: "#10b981",
              },
              {
                label: "Total Outstanding",
                value: fmt(totalOutstanding),
                color: "#f59e0b",
              },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  padding: "16px 20px",
                  borderRadius: 16,
                  background: "#112240",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(226,232,240,0.4)",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{ fontSize: 22, fontWeight: 800, color: stat.color }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Filter + search row */}
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
                      ? "rgba(16,185,129,0.12)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: active ? "#10b981" : "rgba(226,232,240,0.5)",
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
                        ? "rgba(16,185,129,0.18)"
                        : "rgba(255,255,255,0.06)",
                      color: active ? "#10b981" : "rgba(226,232,240,0.4)",
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
              color="rgba(16,185,129,0.4)"
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
              placeholder="Search by customer nameâ€¦"
              style={{
                padding: "8px 14px 8px 34px",
                borderRadius: 10,
                fontSize: 13,
                width: 230,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(16,185,129,0.18)",
                color: "#e2e8f0",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
        </Flex>
      </motion.div>

      {/* Error */}
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

      {/* Loan list */}
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
              Loan · Customer · Repayment Progress
            </span>
          </div>

          {loading ? (
            <Flex justify="center" align="center" py={16}>
              <Spinner style={{ color: "rgba(16,185,129,0.6)" }} />
            </Flex>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 24px" }}>
              <RiMoneyDollarBoxLine
                size={44}
                color="rgba(16,185,129,0.12)"
                style={{ margin: "0 auto 14px" }}
              />
              <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
                {search
                  ? "No loans match your search"
                  : `No ${activeFilter === "ALL" ? "" : activeFilter.toLowerCase() + " "}loans found`}
              </div>
            </div>
          ) : (
            <div style={{ padding: "6px 6px" }}>
              {filtered.map((loan, i) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <LoanRow
                    loan={loan}
                    selected={selected}
                    onClick={l =>
                      setSelected(prev => (prev?.id === l.id ? null : l))
                    }
                  />
                </motion.div>
              ))}
            </div>
          )}
        </Box>
      </motion.div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <DetailPanel
            key={selected.id}
            loan={selected}
            onClose={() => setSelected(null)}
            onSettle={handleSettle}
            onApproveSettle={handleApproveSettle}
            onDelete={handleDelete}
            actionLoading={actionLoading}
            canApproveSettle={can("loans:approveSettlement")}
            canDelete={can("loans:delete")}
          />
        )}
      </AnimatePresence>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateLoanModal
            onClose={() => setShowCreate(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
