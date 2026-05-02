import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import {
  RiGroupLine,
  RiSearchLine,
  RiCheckLine,
  RiCloseLine,
  RiPhoneLine,
  RiMapPinLine,
  RiShieldUserLine,
  RiUserLine,
  RiCalendarLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiIdCardLine,
} from "react-icons/ri";
import { apiFetch } from "../config/api";
import { toaster } from "../components/ui/toaster";

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

function CustomerRow({ customer, selected, onClick }) {
  const initials =
    customer.name
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";
  const isSelected = selected?.id === customer.id;
  const date = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div
      onClick={() => onClick(customer)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        cursor: "pointer",
        borderRadius: 12,
        background: isSelected ? "rgba(212,160,23,0.08)" : "transparent",
        border: `1px solid ${isSelected ? "rgba(212,160,23,0.3)" : "transparent"}`,
        transition: "all 0.15s",
        marginBottom: 2,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(212,160,23,0.1)",
          border: "1px solid rgba(212,160,23,0.2)",
          fontSize: 13,
          fontWeight: 700,
          color: "#d4a017",
        }}
      >
        {initials}
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
            {customer.name}
          </span>
          <StatusBadge status={customer.status} />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "rgba(226,232,240,0.45)", fontSize: 12 }}>
            {customer.mobile ?? "—"}
          </span>
          {customer.createdByName && (
            <span style={{ color: "rgba(226,232,240,0.3)", fontSize: 12 }}>
              · by {customer.createdByName}
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
          gap: 4,
        }}
      >
        <span style={{ color: "rgba(226,232,240,0.3)", fontSize: 11 }}>
          {date}
        </span>
        <RiArrowRightLine size={13} color="rgba(212,160,23,0.35)" />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 12,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(212,160,23,0.07)",
          marginTop: 1,
        }}
      >
        <Icon size={14} color="#d4a017" />
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
            color: "rgba(226,232,240,0.85)",
            fontWeight: 500,
            lineHeight: 1.5,
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
        color: "rgba(212,160,23,0.6)",
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
  customer,
  onClose,
  onApprove,
  onReject,
  onDelete,
  actionLoading,
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const initials =
    customer.name
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";
  const isPending = customer.status === "PENDING";

  const handleClose = () => {
    setShowRejectForm(false);
    setRejectReason("");
    onClose();
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
        borderLeft: "1px solid rgba(212,160,23,0.12)",
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
              background: "linear-gradient(135deg, #d4a017, #92700f)",
              fontSize: 16,
              fontWeight: 700,
              color: "#0d1f35",
              boxShadow: "0 0 20px rgba(212,160,23,0.3)",
            }}
          >
            {initials}
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
              {customer.name}
            </div>
            <StatusBadge status={customer.status} />
          </div>
        </div>
        <button
          onClick={handleClose}
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

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
        <SectionLabel>Customer Info</SectionLabel>
        <InfoRow icon={RiPhoneLine} label="Mobile" value={customer.mobile} />
        <InfoRow icon={RiMapPinLine} label="Address" value={customer.address} />
        <InfoRow
          icon={RiIdCardLine}
          label="Aadhaar Number"
          value={customer.aadhaarNumber}
        />
        {customer.latitude && (
          <InfoRow
            icon={RiMapPinLine}
            label="GPS Location"
            value={`${customer.latitude}, ${customer.longitude}`}
          />
        )}

        {customer.guarantorName && (
          <>
            <Divider />
            <SectionLabel>Guarantor Info</SectionLabel>
            <InfoRow
              icon={RiShieldUserLine}
              label="Name"
              value={customer.guarantorName}
            />
            <InfoRow
              icon={RiPhoneLine}
              label="Mobile"
              value={customer.guarantorMobile}
            />
            <InfoRow
              icon={RiMapPinLine}
              label="Address"
              value={customer.guarantorAddress}
            />
            <InfoRow
              icon={RiIdCardLine}
              label="Aadhaar Number"
              value={customer.guarantorAadhaarNumber}
            />
          </>
        )}

        <Divider />
        <SectionLabel>Record Info</SectionLabel>
        <InfoRow
          icon={RiUserLine}
          label="Added By"
          value={customer.createdByName}
        />
        <InfoRow
          icon={RiCalendarLine}
          label="Created At"
          value={
            customer.createdAt
              ? new Date(customer.createdAt).toLocaleString("en-IN")
              : null
          }
        />
        <InfoRow
          icon={RiCalendarLine}
          label="Updated At"
          value={
            customer.updatedAt
              ? new Date(customer.updatedAt).toLocaleString("en-IN")
              : null
          }
        />

        {customer.aadhaarPhoto && (
          <>
            <Divider />
            <SectionLabel>Aadhaar Photo</SectionLabel>
            <img
              src={
                customer.aadhaarPhoto.startsWith("data:")
                  ? customer.aadhaarPhoto
                  : `data:image/jpeg;base64,${customer.aadhaarPhoto}`
              }
              alt="Aadhaar"
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </>
        )}

        {showRejectForm && (
          <div style={{ marginTop: 16 }}>
            <Divider />
            <div
              style={{
                fontSize: 12,
                color: "rgba(226,232,240,0.5)",
                marginBottom: 8,
              }}
            >
              Reason for rejection
            </div>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Describe why this customer is being rejected..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#e2e8f0",
                fontSize: 13,
                resize: "vertical",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason("");
                }}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: 8,
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
                onClick={() => onReject(customer.id, rejectReason)}
                disabled={actionLoading || !rejectReason.trim()}
                style={{
                  flex: 2,
                  padding: "9px",
                  borderRadius: 8,
                  cursor: rejectReason.trim() ? "pointer" : "not-allowed",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  opacity: !rejectReason.trim() ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                {actionLoading ? <Spinner size="xs" /> : "Confirm Reject"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      {isPending && !showRejectForm && (
        <div
          style={{
            padding: "14px 22px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setShowRejectForm(true)}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "inherit",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#fca5a5",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <RiCloseLine size={15} />
            Reject
          </button>
          <button
            onClick={() => onApprove(customer.id)}
            disabled={actionLoading}
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
        </div>
      )}

      {!isPending && (
        <div
          style={{
            padding: "14px 22px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => onDelete(customer.id)}
            disabled={actionLoading}
            style={{
              width: "100%",
              padding: "11px",
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
                <RiDeleteBinLine size={15} />
                Delete Customer
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async filter => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "ALL" ? `?status=${filter}` : "";
      const data = await apiFetch(`/api/customers${params}`);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(activeFilter);
  }, [activeFilter]);

  const changeFilter = f => {
    setActiveFilter(f);
    setSelected(null);
    setSearch("");
  };

  const filtered = customers.filter(
    c =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile?.includes(search)
  );

  const counts = {
    ALL: customers.length,
    PENDING: customers.filter(c => c.status === "PENDING").length,
    APPROVED: customers.filter(c => c.status === "APPROVED").length,
    REJECTED: customers.filter(c => c.status === "REJECTED").length,
  };

  const handleApprove = async id => {
    setActionLoading(true);
    try {
      const updated = await apiFetch(`/api/customers/${id}/approve`, {
        method: "PUT",
      });
      setCustomers(prev => prev.map(c => (c.id === id ? updated : c)));
      setSelected(updated);
      toaster.create({ title: "Customer approved", type: "success" });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id, reason) => {
    setActionLoading(true);
    try {
      const updated = await apiFetch(`/api/customers/${id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });
      setCustomers(prev => prev.map(c => (c.id === id ? updated : c)));
      setSelected(updated);
      toaster.create({ title: "Customer rejected", type: "info" });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async id => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/customers/${id}`, { method: "DELETE" });
      setCustomers(prev => prev.filter(c => c.id !== id));
      setSelected(null);
      toaster.create({ title: "Customer deleted", type: "info" });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRowClick = customer => {
    setSelected(prev => (prev?.id === customer.id ? null : customer));
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
        <Flex align="center" mb={6} gap={3}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(212,160,23,0.1)",
              border: "1px solid rgba(212,160,23,0.2)",
            }}
          >
            <RiGroupLine size={22} color="#d4a017" />
          </div>
          <div>
            <Text
              fontSize="xl"
              fontWeight="800"
              color="white"
              letterSpacing="-0.3px"
            >
              Customers
            </Text>
            <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
              {loading ? "â€¦" : `${customers.length} total`}
            </Text>
          </div>
        </Flex>
      </motion.div>

      {/* Filter row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
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
                      ? "rgba(212,160,23,0.13)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? "rgba(212,160,23,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: active ? "#d4a017" : "rgba(226,232,240,0.5)",
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
                        ? "rgba(212,160,23,0.18)"
                        : "rgba(255,255,255,0.06)",
                      color: active ? "#d4a017" : "rgba(226,232,240,0.4)",
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
              color="rgba(212,160,23,0.4)"
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
              placeholder="Search name or mobileâ€¦"
              style={{
                padding: "8px 14px 8px 34px",
                borderRadius: 10,
                fontSize: 13,
                width: 220,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,160,23,0.18)",
                color: "#e2e8f0",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
        </Flex>
      </motion.div>

      {/* Error banner */}
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

      {/* Customer list card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
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
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
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
              Customer
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(226,232,240,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Added
            </span>
          </div>

          {loading ? (
            <Flex justify="center" align="center" py={16}>
              <Spinner style={{ color: "rgba(212,160,23,0.6)" }} />
            </Flex>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 24px" }}>
              <RiGroupLine
                size={44}
                color="rgba(212,160,23,0.12)"
                style={{ margin: "0 auto 14px" }}
              />
              <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
                {search
                  ? "No customers match your search"
                  : `No ${activeFilter === "ALL" ? "" : activeFilter.toLowerCase() + " "}customers found`}
              </div>
            </div>
          ) : (
            <div style={{ padding: "6px 6px" }}>
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <CustomerRow
                    customer={c}
                    selected={selected}
                    onClick={handleRowClick}
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
            customer={selected}
            onClose={() => setSelected(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            actionLoading={actionLoading}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
