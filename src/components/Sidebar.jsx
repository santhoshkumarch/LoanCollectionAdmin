import { useNavigate, useLocation } from "react-router-dom";
import { Box, Text, Flex } from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import {
  RiDashboard3Line,
  RiGroupLine,
  RiUserLine,
  RiMoneyDollarBoxLine,
  RiHandCoinLine,
  RiSafeLine,
  RiCheckboxCircleLine,
  RiBarChart2Line,
  RiBellLine,
  RiLogoutBoxLine,
  RiBankLine,
} from "react-icons/ri";

const NAV_ITEMS = [
  { icon: RiDashboard3Line, label: "Dashboard", to: "/home" },
  { icon: RiGroupLine, label: "Customers", to: "/customers" },
  { icon: RiUserLine, label: "Cashiers", to: "/cashiers" },
  { icon: RiMoneyDollarBoxLine, label: "Loans", to: "/loans" },
  { icon: RiHandCoinLine, label: "Collections", to: "/collections" },
  { icon: RiSafeLine, label: "Cash Box", to: "/cash-box" },
  { icon: RiCheckboxCircleLine, label: "Approvals", to: "/approvals" },
  { icon: RiBarChart2Line, label: "Reports", to: "/reports" },
  { icon: RiBellLine, label: "Notifications", to: "/notifications" },
];

function NavItem({ icon: Icon, label, to, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <button
      className={`sidebar-nav-item${isActive ? " active" : ""}`}
      onClick={() => {
        navigate(to);
        onClose?.();
      }}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

export default function Sidebar({ isOpen, isMobile, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w="260px"
      display="flex"
      flexDirection="column"
      zIndex={100}
      style={{
        background: "#0d1f35",
        borderRight: "1px solid rgba(212,160,23,0.12)",
        transform: isMobile && !isOpen ? "translateX(-260px)" : "translateX(0)",
        transition: "transform 0.25s ease",
      }}
    >
      {/* Brand */}
      <Box
        px={5}
        py={5}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Flex align="center" gap={3}>
          <Box
            w="38px"
            h="38px"
            borderRadius="11px"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{
              background: "linear-gradient(135deg, #d4a017, #92700f)",
              boxShadow: "0 0 16px rgba(212,160,23,0.3)",
            }}
          >
            <RiBankLine size={19} color="#0d1f35" />
          </Box>
          <Box>
            <Text
              fontWeight="700"
              fontSize="md"
              color="white"
              letterSpacing="-0.2px"
            >
              LoanMgmt
            </Text>
            <Text
              fontSize="11px"
              color="rgba(212,160,23,0.6)"
              letterSpacing="0.8px"
              textTransform="uppercase"
            >
              {user?.role?.replace("_", " ")}
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Nav items */}
      <Box
        flex={1}
        py={3}
        px={3}
        overflowY="auto"
        display="flex"
        flexDirection="column"
        gap="2px"
      >
        <Text
          fontSize="10px"
          fontWeight="700"
          letterSpacing="1px"
          textTransform="uppercase"
          px={3}
          pt={1}
          pb={2}
          style={{ color: "rgba(226,232,240,0.25)" }}
        >
          Menu
        </Text>
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} {...item} onClose={onClose} />
        ))}
      </Box>

      {/* User + Logout */}
      <Box
        px={3}
        py={3}
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Box
          px={3}
          py={3}
          mb={1}
          borderRadius="10px"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Text fontSize="sm" fontWeight="600" color="white" noOfLines={1}>
            {user?.name}
          </Text>
          <Text
            fontSize="12px"
            noOfLines={1}
            style={{ color: "rgba(226,232,240,0.4)" }}
          >
            {user?.email || user?.mobile}
          </Text>
        </Box>
        <button
          className="sidebar-nav-item"
          onClick={() => {
            logout();
            navigate("/");
            onClose?.();
          }}
          style={{ color: "rgba(248,113,113,0.75)" }}
        >
          <RiLogoutBoxLine size={17} />
          Logout
        </button>
      </Box>
    </Box>
  );
}
