import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Box, Flex, Heading, Button, Spacer } from "@chakra-ui/react";
import { ColorModeButton } from "./ui/color-mode";
import { RiLogoutBoxRLine } from "react-icons/ri";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth();

  // Map paths to page titles
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Login";
      case "/home":
        return "Dashboard";
      case "/onboard-sales-rep":
        return "Onboard Sales Rep";
      case "/add-doctor":
        return "Add Doctor";
      default:
        return "Page";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box
      as="nav"
      p={4}
      borderBottomWidth="1px"
      position="sticky"
      top="0"
      zIndex="1000"
      backdropFilter="blur(15px)"
    >
      <Flex align="center">
        <Box>
          <Heading size="xl">
            Sales Rep Management
            <Heading as="span" size="xl" ml={3} color="gray.500">
              <Box
                as="span"
                borderLeftWidth={3}
                borderColor="gray.500"
                paddingEnd={2}
              ></Box>
              {getPageTitle()}
            </Heading>
          </Heading>
        </Box>
        <Spacer />
        <Flex gap={4} align="center">
          <ColorModeButton />
          {isAuthenticated && (
            <Button colorPalette="red" onClick={handleLogout}>
              <RiLogoutBoxRLine />
              Logout
            </Button>
          )}
        </Flex>
      </Flex>
      {isAuthenticated && <Sidebar />}
    </Box>
  );
};

export default Navbar;
