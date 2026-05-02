import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import {
  RiBankCardLine,
  RiSearchLine,
  RiCloseLine,
  RiUserLine,
  RiCalendarLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiFileTextLine,
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

const isVerified = c => c.verified === true || c.status === "VERIFIED";

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

function CollectionRow({ collection, selected, onClick }) {
  const isSelected = selected?.id === collection.id;
  const verified = isVerified(collection);
  return (
    <div
      onClick={() => onClick(collection)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 16px",
        cursor: "pointer",
        borderRadius: 12,
        background: isSelected ? "rgba(245,158,11,0.07)" : "transparent",
        border: `1px solid ${isSelected ? "rgba(245,158,11,0.3)" : "transparent"}`,
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
          background: verified
            ? "rgba(16,185,129,0.1)"
            : "rgba(245,158,11,0.1)",
          border: `1px solid ${verified ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
        }}
      >
        <RiBankCardLine size={20} color={verified ? "#10b981" : "#f59e0b"} />
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
            {collection.customerName ?? "—"}
          </span>
          <StatusBadge verified={verified} />
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>
            {fmt(collection.amount)}
          </span>
          <span style={{ fontSize: 12, color: "rgba(226,232,240,0.35)" }}>
            by {collection.cashierName ?? "—"}
          </span>
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
          {fmtDate(collection.collectionDate)}
        </span>
        <RiArrowRightLine size={13} color="rgba(245,158,11,0.35)" />
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
        {/* Amount highlight */}
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
          value={fmtDate(collection.collectionDate)}
        />
        {collection.notes && (
          <InfoRow
            icon={RiFileTextLine}
            label="Notes"
            value={collection.notes}
          />
        )}

        <Divider />
        <SectionLabel>Record Info</SectionLabel>
        <InfoRow
          icon={RiCalendarLine}
          label="Created At"
          value={
            collection.createdAt
              ? new Date(collection.createdAt).toLocaleString("en-IN")
              : null
          }
        />
      </div>

      {/* Footer */}
      {(!verified || canDelete) && (
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
          {!verified && (
            <button
              onClick={() => onVerify(collection.id)}
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
        </div>
      )}
    </motion.div>
  );
}

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Collections() {
  const { can } = usePermission();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/collections");
      setCollections(Array.isArray(data) ? data : []);
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
    setSelected(null);
    setSearch("");
  };

  const filtered = collections.filter(c => {
    const status = isVerified(c) ? "VERIFIED" : "PENDING";
    const matchesFilter = activeFilter === "ALL" || status === activeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.customerName?.toLowerCase().includes(q) ||
      c.cashierName?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    ALL: collections.length,
    PENDING: collections.filter(c => !isVerified(c)).length,
    VERIFIED: collections.filter(c => isVerified(c)).length,
  };

  const handleVerify = async id => {
    setActionLoading(true);
    try {
      const updated = await apiFetch(`/api/collections/${id}/verify`, {
        method: "PUT",
      });
      setCollections(prev => prev.map(c => (c.id === id ? updated : c)));
      setSelected(updated);
      toaster.create({ title: "Collection verified", type: "success" });
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
      setSelected(null);
      toaster.create({ title: "Collection deleted", type: "info" });
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
                ? "â€¦"
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
              placeholder="Search customer or cashierâ€¦"
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
              Collection · Customer · Cashier
            </span>
          </div>

          {loading ? (
            <Flex justify="center" align="center" py={16}>
              <Spinner style={{ color: "rgba(245,158,11,0.6)" }} />
            </Flex>
          ) : filtered.length === 0 ? (
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
            <div style={{ padding: "6px 6px" }}>
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <CollectionRow
                    collection={c}
                    selected={selected}
                    onClick={col =>
                      setSelected(prev => (prev?.id === col.id ? null : col))
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
            collection={selected}
            onClose={() => setSelected(null)}
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
