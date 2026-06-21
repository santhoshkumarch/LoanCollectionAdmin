import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Grid, Text, Flex, Spinner } from "@chakra-ui/react";
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiBellLine,
  RiGroupLine,
  RiUserLine,
  RiMoneyDollarBoxLine,
  RiHandCoinLine,
  RiSafeLine,
  RiCheckboxCircleLine,
  RiBarChart2Line,
} from "react-icons/ri";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../config/api";

const STATS_CONFIG = [
  {
    key: "totalInflow",
    label: "வரவு — Varavu",
    sublabel: "Today's collections",
    icon: RiArrowUpLine,
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    glow: "rgba(16,185,129,0.15)",
    iconBg: "rgba(16,185,129,0.12)",
    iconColor: "#10b981",
    prefix: "₹",
  },
  {
    key: "totalOutflow",
    label: "பற்று — Pattru",
    sublabel: "Today's disbursals",
    icon: RiArrowDownLine,
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    glow: "rgba(245,158,11,0.15)",
    iconBg: "rgba(245,158,11,0.12)",
    iconColor: "#f59e0b",
    prefix: "₹",
  },
  {
    key: "net",
    label: "இருப்பு — Iruppu",
    sublabel: "Net balance (Varavu − Pattru)",
    icon: RiSafeLine,
    gradient: "linear-gradient(135deg, #d4a017, #92700f)",
    glow: "rgba(212,160,23,0.18)",
    iconBg: "rgba(212,160,23,0.12)",
    iconColor: "#d4a017",
    prefix: "₹",
  },
  {
    key: "unread",
    label: "Notifications",
    sublabel: "Unread alerts",
    icon: RiBellLine,
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    glow: "rgba(239,68,68,0.15)",
    iconBg: "rgba(239,68,68,0.12)",
    iconColor: "#ef4444",
    prefix: "",
  },
];

const QUICK_LINKS = [
  { icon: RiGroupLine, label: "Customers", to: "/customers", color: "#d4a017" },
  { icon: RiUserLine, label: "Cashiers", to: "/cashiers", color: "#3b82f6" },
  {
    icon: RiMoneyDollarBoxLine,
    label: "Loans",
    to: "/loans",
    color: "#10b981",
  },
  {
    icon: RiHandCoinLine,
    label: "Collections",
    to: "/collections",
    color: "#f59e0b",
  },
  {
    icon: RiCheckboxCircleLine,
    label: "Approvals",
    to: "/approvals",
    color: "#ef4444",
  },
  { icon: RiBarChart2Line, label: "Reports", to: "/reports", color: "#06b6d4" },
];

function StatCard({ config, value, loading, index }) {
  const {
    label,
    sublabel,
    icon: Icon,
    gradient,
    glow,
    iconBg,
    iconColor,
    prefix,
  } = config;

  const formatted =
    typeof value === "number"
      ? prefix === "₹"
        ? `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : value.toString()
      : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="stat-card"
    >
      <Box
        borderRadius="20px"
        overflow="hidden"
        position="relative"
        style={{
          background: "#112240",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: loading ? "none" : `0 4px 24px ${glow}`,
          transition: "box-shadow 0.3s",
        }}
      >
        <Box h="3px" style={{ background: gradient }} />
        <Box p={6}>
          <Flex justify="space-between" align="flex-start" mb={5}>
            <Box
              w="48px"
              h="48px"
              borderRadius="14px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              style={{ background: iconBg }}
            >
              <Icon size={22} color={iconColor} />
            </Box>
            {loading && (
              <Spinner size="sm" style={{ color: "rgba(212,160,23,0.5)" }} />
            )}
          </Flex>

          {loading ? (
            <Box
              h="32px"
              w="120px"
              borderRadius="8px"
              style={{
                background: "rgba(255,255,255,0.07)",
                animation: "pulse 1.5s infinite",
              }}
            />
          ) : (
            <Text
              fontSize="2xl"
              fontWeight="800"
              color="white"
              mb={1}
              letterSpacing="-0.5px"
            >
              {formatted}
            </Text>
          )}

          <Text
            fontSize="sm"
            fontWeight="700"
            mt={1}
            style={{ color: "rgba(226,232,240,0.75)" }}
          >
            {label}
          </Text>
          {sublabel && (
            <Text
              fontSize="xs"
              mt="2px"
              style={{ color: "rgba(226,232,240,0.35)" }}
            >
              {sublabel}
            </Text>
          )}
        </Box>
      </Box>
    </motion.div>
  );
}

function QuickLink({ icon: Icon, label, to, color, index }) {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.06, duration: 0.4 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(to)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "24px 16px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.03)",
        cursor: "pointer",
        color: "rgba(226,232,240,0.65)",
        fontSize: "13px",
        fontWeight: 500,
        fontFamily: "inherit",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${color}18`,
        }}
      >
        <Icon size={20} color={color} />
      </div>
      {label}
    </motion.button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [unreadCount, setUnreadCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dailyReport, notifCount] = await Promise.all([
          apiFetch("/api/reports/daily"),
          apiFetch("/api/notifications/unread-count"),
        ]);
        setReport(dailyReport);
        setUnreadCount(notifCount?.count ?? 0);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statValues = {
    totalInflow: report?.totalInflow,
    totalOutflow: report?.totalOutflow,
    net: report?.net,
    unread: unreadCount,
  };

  const roleLabel = user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <Box minH="100%" p={{ base: 4, md: 8 }} style={{ background: "#0b1929" }}>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box mb={8}>
          <Text
            fontSize="xl"
            fontWeight="400"
            mb={1}
            style={{ color: "rgba(226,232,240,0.45)" }}
          >
            {greeting},
          </Text>
          <Flex align="baseline" gap={3} flexWrap="wrap">
            <Text
              fontSize="3xl"
              fontWeight="800"
              color="white"
              letterSpacing="-0.5px"
            >
              {user?.name}
            </Text>
            <Box
              px={3}
              py={1}
              borderRadius="full"
              fontSize="12px"
              fontWeight="700"
              letterSpacing="1px"
              textTransform="uppercase"
              style={{
                background: "rgba(212,160,23,0.12)",
                color: "#d4a017",
                border: "1px solid rgba(212,160,23,0.25)",
              }}
            >
              {roleLabel}
            </Box>
          </Flex>
        </Box>
      </motion.div>

      {/* Error banner */}
      {error && (
        <Box
          mb={6}
          p={4}
          borderRadius="12px"
          fontSize="sm"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5",
          }}
        >
          Could not load stats: {error}. Make sure the backend is running.
        </Box>
      )}

      {/* Stats grid */}
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2,1fr)",
          xl: "repeat(4,1fr)",
        }}
        gap={5}
        mb={8}
      >
        {STATS_CONFIG.map((cfg, i) => (
          <StatCard
            key={cfg.key}
            config={cfg}
            value={loading ? null : statValues[cfg.key]}
            loading={loading}
            index={i}
          />
        ))}
      </Grid>

      {/* Bottom section */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Per-cashier performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Box
            borderRadius="20px"
            overflow="hidden"
            style={{
              background: "#112240",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Box
              px={6}
              py={4}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Text fontWeight="700" color="white" fontSize="md">
                Cashier Performance Today
              </Text>
              <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
                Collections by agent
              </Text>
            </Box>
            <Box p={4}>
              {loading ? (
                <Flex justify="center" py={8}>
                  <Spinner style={{ color: "rgba(212,160,23,0.6)" }} />
                </Flex>
              ) : !report?.perCashier?.length ? (
                <Text
                  textAlign="center"
                  py={8}
                  fontSize="sm"
                  style={{ color: "rgba(226,232,240,0.35)" }}
                >
                  No collections recorded today
                </Text>
              ) : (
                <Box display="flex" flexDirection="column" gap={3}>
                  {report.perCashier.map(c => (
                    <Box key={c.cashierId}>
                      <Flex justify="space-between" mb={1}>
                        <Text
                          fontSize="sm"
                          fontWeight="500"
                          style={{ color: "rgba(226,232,240,0.8)" }}
                        >
                          {c.cashierName}
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          style={{ color: "#d4a017" }}
                        >
                          ₹{Number(c.inflow).toLocaleString("en-IN")}
                        </Text>
                      </Flex>
                      <Box
                        h="4px"
                        borderRadius="full"
                        style={{ background: "rgba(255,255,255,0.07)" }}
                      >
                        <Box
                          h="4px"
                          borderRadius="full"
                          style={{
                            width: `${Math.min(100, (c.inflow / (report.totalInflow || 1)) * 100)}%`,
                            background:
                              "linear-gradient(90deg, #d4a017, #f0c040)",
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <Box
            borderRadius="20px"
            overflow="hidden"
            style={{
              background: "#112240",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Box
              px={6}
              py={4}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Text fontWeight="700" color="white" fontSize="md">
                Quick Access
              </Text>
              <Text fontSize="sm" style={{ color: "rgba(226,232,240,0.4)" }}>
                Jump to any section
              </Text>
            </Box>
            <Box p={4}>
              <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                {QUICK_LINKS.map((link, i) => (
                  <QuickLink key={link.to} {...link} index={i} />
                ))}
              </Grid>
            </Box>
          </Box>
        </motion.div>
      </Grid>
    </Box>
  );
}
