import {
  Button,
  CloseButton,
  Drawer,
  Portal,
  IconButton,
  VStack,
  Flex,
  Separator,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  RiHome7Line,
  RiUserAddLine,
  RiHeartPulseLine,
  RiLogoutBoxLine,
  RiMenuLine,
  RiUserShared2Line,
  RiFileListLine,
  RiAdminFill,
} from "react-icons/ri";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose} placement="start">
      <Drawer.Trigger asChild>
        <IconButton
          variant="surface"
          position="fixed"
          left="1rem"
          top="6rem"
          zIndex="999"
          aria-label="Open menu"
          colorPalette="gray"
          size="2xl"
        >
          <RiMenuLine />
        </IconButton>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content width="250px">
            <Drawer.Header>
              <Drawer.Title>Sales Rep Admin</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton position="absolute" top="4" right="4" />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body py={4}>
              <VStack spacing={1} align="stretch">
                <Button
                  variant="ghost"
                  colorScheme="gray"
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate("/home");
                    onClose();
                  }}
                  size="lg"
                >
                  <RiHome7Line />
                  Dashboard
                </Button>
                <Separator />

                <Button
                  variant="ghost"
                  colorScheme="gray"
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate("/onboard-sales-rep");
                    onClose();
                  }}
                  size="lg"
                >
                  <RiUserAddLine />
                  Onboard Sales Rep
                </Button>
                <Separator />

                <Button
                  variant="ghost"
                  colorScheme="gray"
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate("/add-doctor");
                    onClose();
                  }}
                  size="lg"
                >
                  <RiHeartPulseLine />
                  Add Doctor
                </Button>
                <Separator />

                <Button
                  variant="ghost"
                  colorScheme="gray"
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate("/assign-doctor");
                    onClose();
                  }}
                  size="lg"
                >
                  <RiUserShared2Line />
                  Assign Doctor
                </Button>
                <Separator />

                <Button
                  variant="ghost"
                  colorScheme="gray"
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate("/audit");
                    onClose();
                  }}
                  size="lg"
                >
                  <RiFileListLine />
                  Audit Logs
                </Button>
                <Separator />

                <Button
                  variant="ghost"
                  colorScheme="gray"
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate("/assignments");
                    onClose();
                  }}
                  size="lg"
                >
                  <RiAdminFill />
                  Assignment Management
                </Button>
                <Separator />

                <Flex mt="auto" pt="4">
                  <Button
                    colorPalette="red"
                    justifyContent="flex-start"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    flex={1}
                    size="lg"
                  >
                    <RiLogoutBoxLine />
                    Logout
                  </Button>
                </Flex>
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default Sidebar;
