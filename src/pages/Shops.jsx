import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import {
  RiStoreLine,
  RiSearchLine,
  RiCloseLine,
  RiMapPinLine,
  RiCalendarLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiAddLine,
  RiUserLine,
  RiUserStarLine,
} from "react-icons/ri";
import { apiFetch } from "../config/api";
import { usePermission } from "../hooks/usePermission";
import { toaster } from "../components/ui/toaster";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 13,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,160,23,0.2)",
  color: "#e2e8f0",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

function FormField({ label, icon: Icon, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 700,
          color: "rgba(226,232,240,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          marginBottom: 6,
        }}
      >
        {Icon && <Icon size={11} />}
        {label}
      </label>
      {children}
      {error && (
        <div style={{ color: "#fca5a5", fontSize: 11, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 13,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,160,23,0.2)",
  color: "#e2e8f0",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  cursor: "pointer",
};

function CreateShopModal({ onClose, onCreate, role }) {
  const [form, setForm] = useState({ name: "", address: "", managerId: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);

  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) return;
    apiFetch("/api/users/role/MANAGER")
      .then(data => setManagers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [isAdmin]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Shop name is required";
    if (isAdmin && !form.managerId) e.managerId = "Manager is required";
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await onCreate({
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        ...(isAdmin && { managerId: form.managerId }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "#0d1f35",
          border: "1px solid rgba(212,160,23,0.2)",
          borderRadius: 20,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          margin: "0 16px",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px",
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
                background: "rgba(212,160,23,0.1)",
                border: "1px solid rgba(212,160,23,0.2)",
              }}
            >
              <RiStoreLine size={17} color="#d4a017" />
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                Add Shop
              </div>
              <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 12 }}>
                {isAdmin
                  ? "Create a new shop and assign a manager"
                  : "Create a new shop under your account"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
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
            <RiCloseLine size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px 24px" }}>
          {isAdmin && (
            <FormField
              label="Manager"
              icon={RiUserStarLine}
              error={errors.managerId}
            >
              <select
                style={selectStyle}
                value={form.managerId}
                onChange={e =>
                  setForm(p => ({ ...p, managerId: e.target.value }))
                }
              >
                <option value="" style={{ background: "#0d1f35" }}>
                  Select a manager…
                </option>
                {managers.map(m => (
                  <option
                    key={m.id}
                    value={m.id}
                    style={{ background: "#0d1f35" }}
                  >
                    {m.name} ({m.mobile})
                  </option>
                ))}
              </select>
            </FormField>
          )}
          <FormField label="Shop Name" icon={RiStoreLine} error={errors.name}>
            <input
              style={inputStyle}
              placeholder="e.g. Ravi Provision Store"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </FormField>
          <FormField
            label="Address (optional)"
            icon={RiMapPinLine}
            error={errors.address}
          >
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
              placeholder="Shop address"
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              rows={3}
            />
          </FormField>

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
                color: "rgba(226,232,240,0.6)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: "11px",
                borderRadius: 10,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                background: "linear-gradient(135deg, #d4a017, #92700f)",
                border: "none",
                color: "#0d1f35",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 16px rgba(212,160,23,0.3)",
              }}
            >
              {loading ? (
                <Spinner size="xs" />
              ) : (
                <>
                  <RiAddLine size={14} /> Create Shop
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ShopRow({ shop, selected, onClick }) {
  const isSelected = selected?.id === shop.id;
  const date = shop.createdAt
    ? new Date(shop.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div
      onClick={() => onClick(shop)}
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
        }}
      >
        <RiStoreLine size={18} color="#d4a017" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: "white",
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 4,
          }}
        >
          {shop.name}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {shop.managerName && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                color: "rgba(226,232,240,0.5)",
                fontSize: 12,
              }}
            >
              <RiUserStarLine size={11} color="rgba(139,92,246,0.6)" />{" "}
              {shop.managerName}
            </span>
          )}
          <span style={{ fontSize: 11, color: "rgba(226,232,240,0.35)" }}>
            {shop.cashierCount} cashier{shop.cashierCount !== 1 ? "s" : ""}
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

function DetailPanel({ shop, onClose, onDelete, actionLoading, canDelete }) {
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
        width: 380,
        background: "#0d1f35",
        borderLeft: "1px solid rgba(212,160,23,0.12)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
              boxShadow: "0 0 20px rgba(212,160,23,0.3)",
            }}
          >
            <RiStoreLine size={22} color="#0d1f35" />
          </div>
          <div>
            <div
              style={{
                color: "white",
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 2,
              }}
            >
              {shop.name}
            </div>
            {shop.managerName && (
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(139,92,246,0.7)",
                  fontWeight: 600,
                }}
              >
                Manager: {shop.managerName}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
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
          <RiCloseLine size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
        {shop.address && (
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
              }}
            >
              <RiMapPinLine size={14} color="#d4a017" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(226,232,240,0.35)",
                  marginBottom: 2,
                }}
              >
                Address
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(226,232,240,0.85)",
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                {shop.address}
              </div>
            </div>
          </div>
        )}
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
              background: "rgba(59,130,246,0.07)",
            }}
          >
            <RiUserLine size={14} color="#3b82f6" />
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(226,232,240,0.35)",
                marginBottom: 2,
              }}
            >
              Cashiers
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(226,232,240,0.85)",
                fontWeight: 500,
              }}
            >
              {shop.cashierCount} cashier{shop.cashierCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        {shop.createdAt && (
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
              }}
            >
              <RiCalendarLine size={14} color="#d4a017" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(226,232,240,0.35)",
                  marginBottom: 2,
                }}
              >
                Created At
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(226,232,240,0.85)",
                  fontWeight: 500,
                }}
              >
                {new Date(shop.createdAt).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        )}
      </div>

      {canDelete && (
        <div
          style={{
            padding: "14px 22px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => onDelete(shop.id)}
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
                <RiDeleteBinLine size={15} /> Delete Shop
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function Shops() {
  const { can, role } = usePermission();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/shops");
      setShops(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filtered = shops.filter(
    s =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.managerName?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async payload => {
    try {
      await apiFetch("/api/shops", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toaster.create({ title: "Shop created", type: "success" });
      setShowCreate(false);
      fetchShops();
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
      throw e;
    }
  };

  const handleDelete = async id => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/shops/${id}`, { method: "DELETE" });
      setShops(prev => prev.filter(s => s.id !== id));
      setSelected(null);
      toaster.create({ title: "Shop deleted", type: "info" });
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Flex align="center" mb={6} gap={3} justify="space-between">
          <Flex align="center" gap={3}>
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
              <RiStoreLine size={22} color="#d4a017" />
            </div>
            <div>
              <Text
                fontSize="xl"
                fontWeight="800"
                color="white"
                letterSpacing="-0.3px"
              >
                Shops
              </Text>
              <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
                {loading ? "…" : `${shops.length} total`}
              </Text>
            </div>
          </Flex>
          {can("shops:create") && (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                background: "linear-gradient(135deg, #d4a017, #92700f)",
                border: "none",
                color: "#0d1f35",
                fontSize: 13,
                fontWeight: 700,
                boxShadow: "0 4px 16px rgba(212,160,23,0.25)",
                flexShrink: 0,
              }}
            >
              <RiAddLine size={15} /> Add Shop
            </button>
          )}
        </Flex>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Flex mb={5} justify="flex-end">
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
              placeholder="Search shops or manager…"
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
            marginRight: selected ? 390 : 0,
            transition: "margin-right 0.3s ease",
          }}
        >
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
              Shop
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
              Created
            </span>
          </div>

          {loading ? (
            <Flex justify="center" align="center" py={16}>
              <Spinner style={{ color: "rgba(212,160,23,0.6)" }} />
            </Flex>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 24px" }}>
              <RiStoreLine
                size={44}
                color="rgba(212,160,23,0.12)"
                style={{ margin: "0 auto 14px" }}
              />
              <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
                {search ? "No shops match your search" : "No shops yet"}
              </div>
            </div>
          ) : (
            <div style={{ padding: "6px 6px" }}>
              {filtered.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <ShopRow
                    shop={s}
                    selected={selected}
                    onClick={shop =>
                      setSelected(prev => (prev?.id === shop.id ? null : shop))
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
            shop={selected}
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
            actionLoading={actionLoading}
            canDelete={can("shops:delete")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreate && (
          <CreateShopModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
            role={role}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
