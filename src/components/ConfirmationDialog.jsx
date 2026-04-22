import { Button, CloseButton, Drawer, Portal } from "@chakra-ui/react";

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "solid",
  colorPalette = "red",
}) => {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose} placement="top">
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>{title}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>{description}</Drawer.Body>
            <Drawer.Footer>
              <Drawer.ActionTrigger asChild>
                <Button variant="outline" onClick={onClose}>
                  {cancelText}
                </Button>
              </Drawer.ActionTrigger>
              <Button
                colorPalette={colorPalette}
                variant={variant}
                onClick={onConfirm}
              >
                {confirmText}
              </Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton
                size="lg"
                position="absolute"
                top="3"
                insetEnd="3"
                onClick={onClose}
              />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default ConfirmationDialog;
