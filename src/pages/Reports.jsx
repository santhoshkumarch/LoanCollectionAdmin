import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Box, Flex, Text, Spinner, Grid } from "@chakra-ui/react";
import {
  RiBarChart2Line,
  RiCalendarLine,
  RiRefreshLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiUserLine,
  RiExchangeLine,
  RiGroupLine,
} from "react-icons/ri";
import { apiFetch } from "../config/api";
import { toaster } from "../components/ui/toaster";

const ACCENT = "#06b6d4";

const fmt = amount =>
  amount != null
    ? `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₹0.00";

const today = () => new Date().toISOString().split("T")[0];

function StatCard({ label, value, color, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div
        style={{
          padding: "20px 24px",
          borderRadius: 18,
          background: "#112240",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${color}18`,
            border: `1px solid ${color}30`,
          }}
        >
          <Icon size={22} color={color} />
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(226,232,240,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
        </div>
      </div>
    </motion.div>
  );
}

function CashierTable({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <RiUserLine
          size={36}
          color="rgba(6,182,212,0.12)"
          style={{ margin: "0 auto 12px" }}
        />
        <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
          No cashier data for this date
        </div>
      </div>
    );
  }

  const totals = {
    inflow: rows.reduce((s, r) => s + Number(r.inflow ?? 0), 0),
    outflow: rows.reduce((s, r) => s + Number(r.outflow ?? 0), 0),
  };
  totals.net = totals.inflow - totals.outflow;

  const colStyle = (align = "left") => ({
    padding: "11px 16px",
    fontSize: 13,
    color: "rgba(226,232,240,0.75)",
    textAlign: align,
  });

  const headerStyle = (align = "left") => ({
    padding: "10px 16px",
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(226,232,240,0.3)",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    textAlign: align,
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <th style={headerStyle("left")}>Cashier</th>
            <th style={headerStyle("right")}>Inflow</th>
            <th style={headerStyle("right")}>Outflow</th>
            <th style={headerStyle("right")}>Net</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const rowNet = Number(row.inflow ?? 0) - Number(row.outflow ?? 0);
            return (
              <motion.tr
                key={row.cashierId ?? i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background:
                    i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                }}
              >
                <td
                  style={{
                    ...colStyle(),
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(6,182,212,0.1)",
                      border: "1px solid rgba(6,182,212,0.18)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: ACCENT,
                      flexShrink: 0,
                    }}
                  >
                    {(row.cashierName ?? "?").slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ color: "white", fontWeight: 600 }}>
                    {row.cashierName ?? "—"}
                  </span>
                </td>
                <td
                  style={{
                    ...colStyle("right"),
                    color: "#10b981",
                    fontWeight: 700,
                  }}
                >
                  {fmt(row.inflow)}
                </td>
                <td
                  style={{
                    ...colStyle("right"),
                    color: "#ef4444",
                    fontWeight: 600,
                  }}
                >
                  {Number(row.outflow ?? 0) > 0 ? fmt(row.outflow) : "—"}
                </td>
                <td
                  style={{
                    ...colStyle("right"),
                    color: rowNet >= 0 ? "#10b981" : "#ef4444",
                    fontWeight: 700,
                  }}
                >
                  {fmt(Math.abs(rowNet))}
                </td>
              </motion.tr>
            );
          })}
          <tr
            style={{
              borderTop: "2px solid rgba(255,255,255,0.08)",
              background: "rgba(6,182,212,0.04)",
            }}
          >
            <td style={{ ...colStyle(), color: "white", fontWeight: 700 }}>
              Total
            </td>
            <td
              style={{
                ...colStyle("right"),
                color: "#10b981",
                fontWeight: 800,
              }}
            >
              {fmt(totals.inflow)}
            </td>
            <td
              style={{
                ...colStyle("right"),
                color: "#ef4444",
                fontWeight: 800,
              }}
            >
              {totals.outflow > 0 ? fmt(totals.outflow) : "—"}
            </td>
            <td
              style={{
                ...colStyle("right"),
                color: totals.net >= 0 ? "#10b981" : "#ef4444",
                fontWeight: 800,
              }}
            >
              {fmt(Math.abs(totals.net))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CustomerTable({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <RiGroupLine
          size={36}
          color="rgba(6,182,212,0.12)"
          style={{ margin: "0 auto 12px" }}
        />
        <div style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
          No customer data for this date
        </div>
      </div>
    );
  }

  const totalInflow = rows.reduce((s, r) => s + Number(r.inflow ?? 0), 0);
  const totalCollections = rows.reduce(
    (s, r) => s + Number(r.collectionCount ?? 0),
    0
  );

  const colStyle = (align = "left") => ({
    padding: "11px 16px",
    fontSize: 13,
    color: "rgba(226,232,240,0.75)",
    textAlign: align,
  });

  const headerStyle = (align = "left") => ({
    padding: "10px 16px",
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(226,232,240,0.3)",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    textAlign: align,
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <th style={headerStyle("left")}>Customer</th>
            <th style={headerStyle("right")}>Collections</th>
            <th style={headerStyle("right")}>Total Inflow</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={row.customerId ?? i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background:
                  i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
              }}
            >
              <td
                style={{
                  ...colStyle(),
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.18)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#f59e0b",
                    flexShrink: 0,
                  }}
                >
                  {(row.customerName ?? "?").slice(0, 2).toUpperCase()}
                </div>
                <span style={{ color: "white", fontWeight: 600 }}>
                  {row.customerName ?? "—"}
                </span>
              </td>
              <td
                style={{ ...colStyle("right"), color: ACCENT, fontWeight: 700 }}
              >
                {row.collectionCount ?? 0}
              </td>
              <td
                style={{
                  ...colStyle("right"),
                  color: "#10b981",
                  fontWeight: 700,
                }}
              >
                {fmt(row.inflow)}
              </td>
            </motion.tr>
          ))}
          <tr
            style={{
              borderTop: "2px solid rgba(255,255,255,0.08)",
              background: "rgba(6,182,212,0.04)",
            }}
          >
            <td style={{ ...colStyle(), color: "white", fontWeight: 700 }}>
              Total
            </td>
            <td
              style={{ ...colStyle("right"), color: ACCENT, fontWeight: 800 }}
            >
              {totalCollections}
            </td>
            <td
              style={{
                ...colStyle("right"),
                color: "#10b981",
                fontWeight: 800,
              }}
            >
              {fmt(totalInflow)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  { key: "cashier", label: "By Cashier", icon: RiUserLine },
  { key: "customer", label: "By Customer", icon: RiGroupLine },
];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Reports() {
  const [date, setDate] = useState(today());
  const [activeTab, setActiveTab] = useState("cashier");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async selectedDate => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const data = await apiFetch(`/api/reports/daily?date=${selectedDate}`);
      setReport(data);
    } catch (e) {
      setError(e.message);
      toaster.create({ title: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(date);
  }, [date, fetchReport]);

  const net = report
    ? Number(report.totalInflow ?? 0) - Number(report.totalOutflow ?? 0)
    : 0;
  const netColor = net >= 0 ? "#10b981" : "#ef4444";

  const fmtDisplayDate = d =>
    new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

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
        <Flex
          align="center"
          justify="space-between"
          mb={6}
          flexWrap="wrap"
          gap={3}
        >
          <Flex align="center" gap={3}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.2)",
              }}
            >
              <RiBarChart2Line size={22} color={ACCENT} />
            </div>
            <div>
              <Text
                fontSize="xl"
                fontWeight="800"
                color="white"
                letterSpacing="-0.3px"
              >
                Daily Report
              </Text>
              <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
                {fmtDisplayDate(date)}
              </Text>
            </div>
          </Flex>

          <Flex align="center" gap={3}>
            {/* Date picker */}
            <div style={{ position: "relative" }}>
              <RiCalendarLine
                size={14}
                color="rgba(6,182,212,0.5)"
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="date"
                value={date}
                max={today()}
                onChange={e => e.target.value && setDate(e.target.value)}
                style={{
                  padding: "9px 14px 9px 34px",
                  borderRadius: 10,
                  fontSize: 13,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(6,182,212,0.25)",
                  color: "#e2e8f0",
                  outline: "none",
                  fontFamily: "inherit",
                  colorScheme: "dark",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchReport(date)}
              disabled={loading}
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                background: "rgba(6,182,212,0.08)",
                border: "1px solid rgba(6,182,212,0.2)",
                color: ACCENT,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: loading ? 0.5 : 1,
              }}
            >
              <RiRefreshLine
                size={15}
                style={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />
              Refresh
            </button>
          </Flex>
        </Flex>
      </motion.div>

      {/* Error */}
      {error && !loading && (
        <Box
          mb={5}
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

      {loading ? (
        <Flex justify="center" align="center" py={24}>
          <Flex direction="column" align="center" gap={3}>
            <Spinner
              style={{ color: "rgba(6,182,212,0.6)", width: 36, height: 36 }}
            />
            <Text style={{ color: "rgba(226,232,240,0.35)", fontSize: 13 }}>
              Loading report…
            </Text>
          </Flex>
        </Flex>
      ) : report ? (
        <>
          {/* Stat cards */}
          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(3,1fr)" }}
            gap={4}
            mb={6}
          >
            <StatCard
              label="Total Inflow"
              value={fmt(report.totalInflow)}
              color="#10b981"
              icon={RiArrowUpLine}
              delay={0}
            />
            <StatCard
              label="Total Outflow"
              value={fmt(report.totalOutflow)}
              color="#ef4444"
              icon={RiArrowDownLine}
              delay={0.06}
            />
            <StatCard
              label="Net"
              value={fmt(Math.abs(net))}
              color={netColor}
              icon={RiExchangeLine}
              delay={0.12}
            />
          </Grid>

          {/* Net indicator */}
          {net !== 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
            >
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  marginBottom: 24,
                  background:
                    net >= 0 ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                  border: `1px solid ${net >= 0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {net >= 0 ? (
                  <RiArrowUpLine size={15} color="#10b981" />
                ) : (
                  <RiArrowDownLine size={15} color="#ef4444" />
                )}
                <span
                  style={{
                    fontSize: 13,
                    color: net >= 0 ? "#10b981" : "#ef4444",
                    fontWeight: 600,
                  }}
                >
                  Net {net >= 0 ? "surplus" : "deficit"} of {fmt(Math.abs(net))}{" "}
                  on {fmtDisplayDate(date)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Tabbed breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Box
              borderRadius="20px"
              style={{
                background: "#112240",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Tab header */}
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {TABS.map(tab => {
                  const active = activeTab === tab.key;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.15s",
                        background: active
                          ? "rgba(6,182,212,0.12)"
                          : "transparent",
                        border: `1px solid ${active ? "rgba(6,182,212,0.3)" : "transparent"}`,
                        color: active ? ACCENT : "rgba(226,232,240,0.35)",
                      }}
                    >
                      <Icon size={13} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              {activeTab === "cashier" ? (
                <CashierTable rows={report.perCashier} />
              ) : (
                <CustomerTable rows={report.perCustomer} />
              )}
            </Box>
          </motion.div>
        </>
      ) : !error ? (
        <Flex justify="center" align="center" py={24}>
          <Flex direction="column" align="center" gap={3}>
            <RiBarChart2Line size={48} color="rgba(6,182,212,0.12)" />
            <Text style={{ color: "rgba(226,232,240,0.35)", fontSize: 14 }}>
              No data for this date
            </Text>
          </Flex>
        </Flex>
      ) : null}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Box>
  );
}
