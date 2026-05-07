import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import {
  RiBankCardLine,
  RiSearchLine,
  RiCloseLine,
  RiUserLine,
  RiCalendarLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiFileTextLine,
  RiWalletLine,
  RiIdCardLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import { apiFetch } from "../config/api";
import { usePermission } from "../hooks/usePermission";
import { toaster } from "../components/ui/toaster";

const FILTERS = ["ALL", "PENDING", "VERIFIED"];

const statusStyle = verified =>
  verified
    ? {
        color: "#10b981",
        bg: "rgba(16,185,129,0.1)",
        border: "rgba(16,185,129,0.25)",
        label: "Verified",
      }
    : {
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.1)",
        border: "rgba(245,158,11,0.25)",
        label: "Pending",
      };

const isVerified = c =>
  c.verified === true || c.isVerified === true || c.status === "VERIFIED";

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

function Checkbox({ checked, indeterminate, onChange }) {
  return (
    <div
      onClick={e => {
        e.stopPropagation();
        onChange(!checked);
      }}
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        flexShrink: 0,
        border: `1.5px solid ${checked || indeterminate ? "#f59e0b" : "rgba(255,255,255,0.2)"}`,
        background:
          checked || indeterminate ? "rgba(245,158,11,0.15)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.12s",
      }}
    >
      {checked && <RiCheckLine size={11} color="#f59e0b" />}
      {!checked && indeterminate && (
        <div
          style={{
            width: 8,
            height: 1.5,
            background: "#f59e0b",
            borderRadius: 1,
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ verified }) {
  const s = statusStyle(verified);
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
          background: "rgba(245,158,11,0.07)",
        }}
      >
        <Icon size={14} color="#f59e0b" />
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
        color: "rgba(245,158,11,0.6)",
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

// -- Individual collection row with checkbox --

function CollectionRow({
  collection,
  checked,
  onCheck,
  onDetailClick,
  isDetailOpen,
}) {
  const verified = isVerified(collection);
  return (
    <div
      onClick={() => onDetailClick(collection)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 12px",
        cursor: "pointer",
        borderRadius: 10,
        background: isDetailOpen ? "rgba(245,158,11,0.07)" : "transparent",
        border: `1px solid ${isDetailOpen ? "rgba(245,158,11,0.3)" : "transparent"}`,
        transition: "all 0.15s",
        marginBottom: 2,
      }}
    >
      <Checkbox checked={checked} onChange={onCheck} />

      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: verified
            ? "rgba(16,185,129,0.1)"
            : "rgba(245,158,11,0.1)",
          border: `1px solid ${verified ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
        }}
      >
        <RiBankCardLine size={17} color={verified ? "#10b981" : "#f59e0b"} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 3,
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>
            {collection.customerName ?? "—"}
          </span>
          <StatusBadge verified={verified} />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>
            {fmt(collection.amount)}
          </span>
          <span style={{ fontSize: 11, color: "rgba(226,232,240,0.3)" }}>
            {fmtDate(collection.collectedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// -- Cashier accordion group --

function CashierGroup({
  group,
  expanded,
  onToggle,
  checkedIds,
  onCheckAll,
  onCheckOne,
  onDetailClick,
  selectedDetail,
  onVerifyCashier,
  actionLoading,
  canVerify,
}) {
  const { cashierName, collections } = group;
  const pendingCollections = collections.filter(c => !isVerified(c));
  const pendingCount = pendingCollections.length;
  const totalCount = collections.length;

  const checkedInGroup = collections.filter(c => checkedIds.has(c.id));
  const allChecked = checkedInGroup.length === totalCount && totalCount > 0;
  const someChecked = checkedInGroup.length > 0 && !allChecked;

  const totalAmount = collections.reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0
  );

  const initials = cashierName
    ? cashierName
        .split(" ")
        .map(w => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div
      style={{
        marginBottom: 8,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#0d1f35",
        overflow: "hidden",
      }}
    >
      {/* Cashier header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "13px 14px",
          background: expanded ? "rgba(245,158,11,0.04)" : "transparent",
          borderBottom: expanded ? "1px solid rgba(255,255,255,0.05)" : "none",
          transition: "background 0.15s",
        }}
      >
        {/* Select-all checkbox */}
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          onChange={checked => onCheckAll(collections, checked)}
        />

        {/* Avatar + name + stats — clicking toggles accordion */}
        <div
          onClick={onToggle}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08))",
              border: "1px solid rgba(245,158,11,0.25)",
              fontSize: 13,
              fontWeight: 700,
              color: "#f59e0b",
            }}
          >
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
              {cashierName ?? "Unknown"}
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 2,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 12, color: "rgba(226,232,240,0.4)" }}>
                {totalCount} collection{totalCount !== 1 ? "s" : ""}
              </span>
              {pendingCount > 0 && (
                <span
                  style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}
                >
                  {pendingCount} pending
                </span>
              )}
              <span style={{ fontSize: 12, color: "rgba(226,232,240,0.3)" }}>
                {fmt(totalAmount)}
              </span>
            </div>
          </div>

          {expanded ? (
            <RiArrowDownSLine size={18} color="rgba(245,158,11,0.5)" />
          ) : (
            <RiArrowRightSLine size={18} color="rgba(226,232,240,0.2)" />
          )}
        </div>

        {/* Verify all pending for this cashier */}
        {canVerify && pendingCount > 0 && (
          <button
            onClick={e => {
              e.stopPropagation();
              onVerifyCashier(pendingCollections.map(c => c.id));
            }}
            disabled={actionLoading}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
              whiteSpace: "nowrap",
              opacity: actionLoading ? 0.6 : 1,
            }}
          >
            <RiShieldCheckLine size={13} />
            Verify All ({pendingCount})
          </button>
        )}
      </div>

      {/* Expanded collection rows */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "6px 8px" }}>
              {collections.map(c => (
                <CollectionRow
                  key={c.id}
                  collection={c}
                  checked={checkedIds.has(c.id)}
                  onCheck={checked => onCheckOne(c.id, checked)}
                  onDetailClick={onDetailClick}
                  isDetailOpen={selectedDetail?.id === c.id}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -- Floating bulk action bar --

function BulkActionBar({ count, onVerify, onClear, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        background: "#1a2f4a",
        border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: 14,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(226,232,240,0.75)",
        }}
      >
        {count} selected
      </span>
      <div
        style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)" }}
      />
      <button
        onClick={onVerify}
        disabled={loading}
        style={{
          padding: "7px 16px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          background: "linear-gradient(135deg, #10b981, #059669)",
          border: "none",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 5,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? <Spinner size="xs" /> : <RiCheckLine size={13} />}
        Verify Selected
      </button>
      <button
        onClick={onClear}
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          cursor: "pointer",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(226,232,240,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
        }}
      >
        <RiCloseLine size={14} />
      </button>
    </motion.div>
  );
}

// -- Detail panel --

function DetailPanel({
  collection,
  onClose,
  onVerify,
  onDelete,
  actionLoading,
  canDelete,
}) {
  const verified = isVerified(collection);
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
        borderLeft: "1px solid rgba(245,158,11,0.12)",
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
              background: verified
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "rgba(245,158,11,0.12)",
              boxShadow: verified ? "0 0 20px rgba(16,185,129,0.3)" : "none",
            }}
          >
            <RiBankCardLine size={22} color={verified ? "white" : "#f59e0b"} />
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
              {collection.customerName ?? "—"}
            </div>
            <StatusBadge verified={verified} />
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
        <div
          style={{
            padding: "20px 16px",
            borderRadius: 14,
            marginBottom: 20,
            textAlign: "center",
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.12)",
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
            Amount Collected
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#f59e0b" }}>
            {fmt(collection.amount)}
          </div>
        </div>

        <SectionLabel>Collection Details</SectionLabel>
        <InfoRow
          icon={RiUserLine}
          label="Customer"
          value={collection.customerName}
        />
        <InfoRow
          icon={RiUserLine}
          label="Cashier"
          value={collection.cashierName}
        />
        <InfoRow
          icon={RiCalendarLine}
          label="Collection Date"
          value={fmtDate(collection.collectedAt)}
        />
        <InfoRow
          icon={RiWalletLine}
          label="Payment Mode"
          value={
            collection.collectionMode
              ? collection.collectionMode.charAt(0) +
                collection.collectionMode.slice(1).toLowerCase()
              : null
          }
        />
        <InfoRow
          icon={RiIdCardLine}
          label="Loan Reference"
          value={
            collection.loanId
              ? collection.loanId.toString().slice(0, 8).toUpperCase()
              : null
          }
        />
        {collection.notes && (
          <InfoRow
            icon={RiFileTextLine}
            label="Notes"
            value={collection.notes}
          />
        )}

        {verified && collection.verifiedByName && (
          <>
            <Divider />
            <SectionLabel>Verification</SectionLabel>
            <InfoRow
              icon={RiUserLine}
              label="Verified By"
              value={collection.verifiedByName}
              valueColor="#10b981"
            />
          </>
        )}
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
        {verified && !canDelete ? (
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgba(16,185,129,0.6)",
              padding: "6px 0",
            }}
          >
            This collection has been verified
          </div>
        ) : (
          <>
            {!verified && (
              <button
                onClick={() => onVerify([collection.id])}
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
                    Verify Collection
                  </>
                )}
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(collection.id)}
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
                    Delete
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// -- Main Page --

export default function Collections() {
  const { can } = usePermission();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [expandedCashiers, setExpandedCashiers] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/collections");
      const list = Array.isArray(data) ? data : [];
      setCollections(list);
      setExpandedCashiers(new Set(list.map(c => c.cashierName ?? "Unknown")));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const changeFilter = f => {
    setActiveFilter(f);
    setSelectedDetail(null);
    setCheckedIds(new Set());
  };

  const filtered = useMemo(() => {
    return collections.filter(c => {
      const status = isVerified(c) ? "VERIFIED" : "PENDING";
      const matchesFilter = activeFilter === "ALL" || status === activeFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.customerName?.toLowerCase().includes(q) ||
        c.cashierName?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [collections, activeFilter, search]);

  const groupedByCashier = useMemo(() => {
    const groups = {};
    filtered.forEach(c => {
      const key = c.cashierName ?? "Unknown";
      if (!groups[key]) groups[key] = { cashierName: key, collections: [] };
      groups[key].collections.push(c);
    });
    return Object.values(groups).sort((a, b) =>
      a.cashierName.localeCompare(b.cashierName)
    );
  }, [filtered]);

  const counts = {
    ALL: collections.length,
    PENDING: collections.filter(c => !isVerified(c)).length,
    VERIFIED: collections.filter(c => isVerified(c)).length,
  };

  const handleVerify = async ids => {
    setActionLoading(true);
    try {
      let updatedList;
      if (ids.length === 1) {
        const updated = await apiFetch(`/api/collections/${ids[0]}/verify`, {
          method: "PUT",
        });
        updatedList = [updated];
      } else {
        updatedList = await apiFetch("/api/collections/verify-bulk", {
          method: "POST",
          body: JSON.stringify({ ids }),
        });
      }
      const updatedMap = new Map(updatedList.map(u => [u.id, u]));
      setCollections(prev =>
        prev.map(c => (updatedMap.has(c.id) ? updatedMap.get(c.id) : c))
      );
      if (selectedDetail && updatedMap.has(selectedDetail.id)) {
        setSelectedDetail(updatedMap.get(selectedDetail.id));
      }
      setCheckedIds(new Set());
      toaster.create({
        title:
          ids.length === 1
            ? "Collection verified"
            : `${ids.length} collections verified`,
        type: "success",
      });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async id => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/collections/${id}`, { method: "DELETE" });
      setCollections(prev => prev.filter(c => c.id !== id));
      setSelectedDetail(null);
      setCheckedIds(prev => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      toaster.create({ title: "Collection deleted", type: "info" });
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCashier = name => {
    setExpandedCashiers(prev => {
      const n = new Set(prev);
      if (n.has(name)) n.delete(name);
      else n.add(name);
      return n;
    });
  };

  const handleCheckOne = (id, checked) => {
    setCheckedIds(prev => {
      const n = new Set(prev);
      if (checked) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  const handleCheckAll = (groupCollections, checked) => {
    setCheckedIds(prev => {
      const n = new Set(prev);
      groupCollections.forEach(c => {
        if (checked) n.add(c.id);
        else n.delete(c.id);
      });
      return n;
    });
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
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <RiBankCardLine size={22} color="#f59e0b" />
          </div>
          <div>
            <Text
              fontSize="xl"
              fontWeight="800"
              color="white"
              letterSpacing="-0.3px"
            >
              Collections
            </Text>
            <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
              {loading
                ? "…"
                : `${collections.length} total · ${counts.PENDING} pending verification`}
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
                      ? "rgba(245,158,11,0.12)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: active ? "#f59e0b" : "rgba(226,232,240,0.5)",
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
                        ? "rgba(245,158,11,0.18)"
                        : "rgba(255,255,255,0.06)",
                      color: active ? "#f59e0b" : "rgba(226,232,240,0.4)",
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
              color="rgba(245,158,11,0.4)"
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
              placeholder="Search customer or cashier…"
              style={{
                padding: "8px 14px 8px 34px",
                borderRadius: 10,
                fontSize: 13,
                width: 230,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(245,158,11,0.18)",
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

      {/* Grouped list */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          marginRight: selectedDetail ? 430 : 0,
          transition: "margin-right 0.3s ease",
        }}
      >
        {loading ? (
          <Flex justify="center" align="center" py={16}>
            <Spinner style={{ color: "rgba(245,158,11,0.6)" }} />
          </Flex>
        ) : groupedByCashier.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 24px" }}>
            <RiBankCardLine
              size={44}
              color="rgba(245,158,11,0.12)"
              style={{ margin: "0 auto 14px" }}
            />
            <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
              {search
                ? "No collections match your search"
                : "No collections found"}
            </div>
          </div>
        ) : (
          groupedByCashier.map((group, i) => (
            <motion.div
              key={group.cashierName}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <CashierGroup
                group={group}
                expanded={expandedCashiers.has(group.cashierName)}
                onToggle={() => toggleCashier(group.cashierName)}
                checkedIds={checkedIds}
                onCheckAll={handleCheckAll}
                onCheckOne={handleCheckOne}
                onDetailClick={col =>
                  setSelectedDetail(prev => (prev?.id === col.id ? null : col))
                }
                selectedDetail={selectedDetail}
                onVerifyCashier={ids => handleVerify(ids)}
                actionLoading={actionLoading}
                canVerify={can("collections:verify")}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Floating bulk action bar */}
      <AnimatePresence>
        {checkedIds.size > 0 && (
          <BulkActionBar
            count={checkedIds.size}
            onVerify={() => handleVerify([...checkedIds])}
            onClear={() => setCheckedIds(new Set())}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedDetail && (
          <DetailPanel
            key={selectedDetail.id}
            collection={selectedDetail}
            onClose={() => setSelectedDetail(null)}
            onVerify={handleVerify}
            onDelete={handleDelete}
            actionLoading={actionLoading}
            canDelete={can("collections:delete")}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
