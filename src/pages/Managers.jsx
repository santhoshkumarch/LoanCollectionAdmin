import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import {
  RiBriefcaseLine,
  RiSearchLine,
  RiCloseLine,
  RiPhoneLine,
  RiMailLine,
  RiCalendarLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiUserAddLine,
  RiLockPasswordLine,
  RiUserLine,
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
  border: "1px solid rgba(139,92,246,0.2)",
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

function CreateManagerModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(form.mobile))
      e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters";
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
        mobile: form.mobile.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
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
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 20,
          width: "100%",
          maxWidth: 440,
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
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <RiUserAddLine size={17} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                Add Manager
              </div>
              <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 12 }}>
                Create a new manager account
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
          <FormField label="Full Name" icon={RiUserLine} error={errors.name}>
            <input
              style={inputStyle}
              placeholder="e.g. Suresh Kumar"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </FormField>
          <FormField
            label="Mobile Number"
            icon={RiPhoneLine}
            error={errors.mobile}
          >
            <input
              style={inputStyle}
              placeholder="10-digit mobile number"
              value={form.mobile}
              maxLength={10}
              onChange={e =>
                setForm(p => ({
                  ...p,
                  mobile: e.target.value.replace(/\D/g, ""),
                }))
              }
            />
          </FormField>
          <FormField
            label="Email (optional)"
            icon={RiMailLine}
            error={errors.email}
          >
            <input
              style={inputStyle}
              type="email"
              placeholder="e.g. suresh@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </FormField>
          <FormField
            label="Password"
            icon={RiLockPasswordLine}
            error={errors.password}
          >
            <input
              style={inputStyle}
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
          </FormField>

          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 12,
              background: "rgba(139,92,246,0.07)",
              border: "1px solid rgba(139,92,246,0.15)",
              color: "rgba(139,92,246,0.8)",
              marginBottom: 20,
            }}
          >
            Manager can log in immediately and create shops and cashiers. If no
            password is set, the mobile number is used as the default password.
          </div>

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
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 16px rgba(139,92,246,0.3)",
              }}
            >
              {loading ? (
                <Spinner size="xs" />
              ) : (
                <>
                  <RiUserAddLine size={14} /> Create Manager
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ManagerRow({ manager, selected, onClick }) {
  const isSelected = selected?.id === manager.id;
  const initials =
    manager.name
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";
  const date = manager.createdAt
    ? new Date(manager.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div
      onClick={() => onClick(manager)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        cursor: "pointer",
        borderRadius: 12,
        background: isSelected ? "rgba(139,92,246,0.08)" : "transparent",
        border: `1px solid ${isSelected ? "rgba(139,92,246,0.3)" : "transparent"}`,
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
          background: "rgba(139,92,246,0.1)",
          border: "1px solid rgba(139,92,246,0.2)",
          fontSize: 13,
          fontWeight: 700,
          color: "#8b5cf6",
        }}
      >
        {initials}
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
          {manager.name ?? "—"}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "rgba(226,232,240,0.45)", fontSize: 12 }}>
            {manager.mobile ?? "—"}
          </span>
          {manager.email && (
            <span style={{ color: "rgba(226,232,240,0.3)", fontSize: 12 }}>
              · {manager.email}
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
        <RiArrowRightLine size={13} color="rgba(139,92,246,0.4)" />
      </div>
    </div>
  );
}

function DetailPanel({ manager, onClose, onDelete, actionLoading }) {
  const initials =
    manager.name
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

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
        borderLeft: "1px solid rgba(139,92,246,0.12)",
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
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              fontSize: 16,
              fontWeight: 700,
              color: "white",
              boxShadow: "0 0 20px rgba(139,92,246,0.3)",
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
                marginBottom: 3,
              }}
            >
              {manager.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(139,92,246,0.7)",
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Manager
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

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
        {manager.mobile && (
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
                background: "rgba(139,92,246,0.07)",
              }}
            >
              <RiPhoneLine size={14} color="#8b5cf6" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(226,232,240,0.35)",
                  marginBottom: 2,
                }}
              >
                Mobile
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(226,232,240,0.85)",
                  fontWeight: 500,
                }}
              >
                {manager.mobile}
              </div>
            </div>
          </div>
        )}
        {manager.email && (
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
                background: "rgba(139,92,246,0.07)",
              }}
            >
              <RiMailLine size={14} color="#8b5cf6" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(226,232,240,0.35)",
                  marginBottom: 2,
                }}
              >
                Email
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(226,232,240,0.85)",
                  fontWeight: 500,
                }}
              >
                {manager.email}
              </div>
            </div>
          </div>
        )}
        {manager.createdAt && (
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
                background: "rgba(139,92,246,0.07)",
              }}
            >
              <RiCalendarLine size={14} color="#8b5cf6" />
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
                {new Date(manager.createdAt).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          padding: "14px 22px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => onDelete(manager.id)}
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
              <RiDeleteBinLine size={15} /> Remove Manager
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default function Managers() {
  const { can } = usePermission();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchManagers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/users/role/MANAGER");
      setManagers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const filtered = managers.filter(
    m =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.mobile?.includes(search) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async payload => {
    try {
      await apiFetch("/api/users/managers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toaster.create({ title: "Manager created", type: "success" });
      setShowCreate(false);
      fetchManagers();
    } catch (e) {
      toaster.create({ title: e.message, type: "error" });
      throw e;
    }
  };

  const handleDelete = async id => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/users/${id}`, { method: "DELETE" });
      setManagers(prev => prev.filter(m => m.id !== id));
      setSelected(null);
      toaster.create({ title: "Manager removed", type: "info" });
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
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <RiBriefcaseLine size={22} color="#8b5cf6" />
            </div>
            <div>
              <Text
                fontSize="xl"
                fontWeight="800"
                color="white"
                letterSpacing="-0.3px"
              >
                Managers
              </Text>
              <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
                {loading ? "…" : `${managers.length} total`}
              </Text>
            </div>
          </Flex>
          {can("managers:create") && (
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
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "0 4px 16px rgba(139,92,246,0.25)",
                flexShrink: 0,
              }}
            >
              <RiUserAddLine size={15} /> Add Manager
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
              placeholder="Search name, mobile or email…"
              style={{
                padding: "8px 14px 8px 34px",
                borderRadius: 10,
                fontSize: 13,
                width: 240,
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
              Manager
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
              <Spinner style={{ color: "rgba(139,92,246,0.6)" }} />
            </Flex>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 24px" }}>
              <RiBriefcaseLine
                size={44}
                color="rgba(139,92,246,0.12)"
                style={{ margin: "0 auto 14px" }}
              />
              <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
                {search ? "No managers match your search" : "No managers yet"}
              </div>
            </div>
          ) : (
            <div style={{ padding: "6px 6px" }}>
              {filtered.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <ManagerRow
                    manager={m}
                    selected={selected}
                    onClick={mgr =>
                      setSelected(prev => (prev?.id === mgr.id ? null : mgr))
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
            manager={selected}
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
            actionLoading={actionLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreate && (
          <CreateManagerModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
