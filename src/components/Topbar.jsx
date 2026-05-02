import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Badge } from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../config/api";
import { RiTimeLine, RiBellLine, RiMenuLine } from "react-icons/ri";

const PAGE_TITLES = {
  "/home": "Dashboard",
  "/customers": "Customers",
  "/cashiers": "Cashiers",
  "/loans": "Loans",
  "/collections": "Collections",
  "/cash-box": "Cash Box",
  "/approvals": "Approval Requests",
  "/reports": "Reports",
  "/notifications": "Notifications",
};

const ROLE_LABELS = {
  SUPER_ADMIN: { label: "Super Admin", color: "yellow" },
  ADMIN: { label: "Admin", color: "blue" },
};

export default function Topbar({ onMenuToggle, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await apiFetch("/api/notifications/unread-count");
        setUnreadCount(data?.count ?? 0);
      } catch {
        /* ignore */
      }
    };
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, []);

  const pageTitle = PAGE_TITLES[location.pathname] ?? "Page";
  const roleInfo = user ? ROLE_LABELS[user.role] : null;
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Box
      px={isMobile ? 4 : 8}
      py={4}
      position="sticky"
      top={0}
      zIndex={50}
      style={{
        background: "rgba(11, 25, 41, 0.94)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(212,160,23,0.1)",
      }}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={3}>
          {/* Hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={onMenuToggle}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                flexShrink: 0,
              }}
            >
              <RiMenuLine size={18} color="rgba(226,232,240,0.65)" />
            </button>
          )}

          <Box>
            <Text
              fontSize="xl"
              fontWeight="700"
              color="white"
              letterSpacing="-0.3px"
            >
              {pageTitle}
            </Text>
            {!isMobile && (
              <Flex align="center" gap={1} mt="1px">
                <RiTimeLine size={11} color="rgba(212,160,23,0.45)" />
                <Text
                  fontSize="12px"
                  style={{ color: "rgba(226,232,240,0.35)" }}
                >
                  {today}
                </Text>
              </Flex>
            )}
          </Box>
        </Flex>

        <Flex align="center" gap={isMobile ? 2 : 3}>
          {/* Bell with unread badge */}
          <button
            onClick={() => navigate("/notifications")}
            style={{
              position: "relative",
              width: 36,
              height: 36,
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                unreadCount > 0
                  ? "rgba(6,182,212,0.1)"
                  : "rgba(255,255,255,0.04)",
              border:
                unreadCount > 0
                  ? "1px solid rgba(6,182,212,0.2)"
                  : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <RiBellLine
              size={17}
              color={unreadCount > 0 ? "#06b6d4" : "rgba(226,232,240,0.35)"}
            />
            {unreadCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "2px solid #0b1929",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  fontWeight: 800,
                  color: "white",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </button>

          {!isMobile && roleInfo && (
            <Badge colorPalette={roleInfo.color} variant="subtle" size="sm">
              {roleInfo.label}
            </Badge>
          )}

          {user && (
            <Flex align="center" gap={2}>
              <Box
                w="32px"
                h="32px"
                borderRadius="full"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{
                  background: "linear-gradient(135deg, #d4a017, #92700f)",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0d1f35",
                  boxShadow: "0 0 12px rgba(212,160,23,0.3)",
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Box>
              {!isMobile && (
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  style={{ color: "rgba(226,232,240,0.65)" }}
                >
                  {user.name}
                </Text>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
