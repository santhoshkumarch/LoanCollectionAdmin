import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../config/api";
import {
  Box,
  Heading,
  Button,
  Flex,
  Table,
  Text,
  Center,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { BreadcrumbRoot, BreadcrumbLink } from "@/components/ui/breadcrumb";
import {
  RiEdit2Fill,
  RiDeleteBin7Line,
  RiUserAddLine,
  RiHeartPulseLine,
  RiRefreshLine,
  RiHome7Line,
} from "react-icons/ri";
import { LiaAngleRightSolid } from "react-icons/lia";
import ConfirmationDialog from "../components/ConfirmationDialog";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salesReps, setSalesReps] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: null,
    item: null,
    type: "",
  });

  // Fetch sales reps from API
  const fetchSalesReps = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/SalesRep`);
      if (response.ok) {
        const data = await response.json();
        setSalesReps(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch sales reps:", response.statusText);
        setSalesReps([]);
        toaster.create({
          title: "Error",
          description: "Failed to fetch sales reps",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching sales reps:", error);
      setSalesReps([]);
      toaster.create({
        title: "Error",
        description: "Failed to fetch sales reps",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors`);
      if (response.ok) {
        const data = await response.json();
        setDoctors(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch doctors:", response.statusText);
        setDoctors([]);
        toaster.create({
          title: "Error",
          description: "Failed to fetch doctors",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
      toaster.create({
        title: "Error",
        description: "Failed to fetch doctors",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSalesReps(), fetchDoctors()]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    refreshData();
  }, [refreshData]);

  const handleOnboardSalesRep = () => {
    navigate("/onboard-sales-rep");
  };

  const handleAddDoctor = () => {
    navigate("/add-doctor");
  };

  const handleEdit = (title, item) => {
    if (title === "Sales Reps") {
      // Navigate to sales rep onboarding page in edit mode with the item data
      console.log("Editing sales rep:", item);
      // In a real app, you would navigate to the edit page with the specific id:
      // navigate(`/edit-sales-rep/${item.id}`, { state: { itemData: item } });
      // For now, going back to the onboarding with edit mode
      navigate("/onboard-sales-rep", { state: { editData: item } });
    } else {
      // Navigate to doctor addition page in edit mode with the item data
      console.log("Editing doctor:", item);
      // In a real app, you would navigate to the edit page with the specific id:
      // navigate(`/edit-doctor/${item.id}`, { state: { itemData: item } });
      // For now, going back to the add doctor page with edit mode
      navigate("/add-doctor", { state: { editData: item } });
    }
  };

  const handleDelete = async (title, item) => {
    const endpoint =
      title === "Sales Reps"
        ? `${API_BASE_URL}/SalesRep/${item.id}`
        : `${API_BASE_URL}/doctors/${item.id}`;

    const entityType = title === "Sales Reps" ? "salesRep" : "doctor";
    const action = `delete${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`;
    const description = `Deleted ${title === "Sales Reps" ? "sales rep" : "doctor"} record`;

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (response.ok) {
        // After successful deletion, create audit log
        await fetch(`${API_BASE_URL}/auditLogs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: action,
            userId: "1", // Assuming the current user ID - would come from auth context in real app
            timestamp: new Date().toISOString(),
            entityId: item.id,
            entityType: entityType,
            oldValue: item,
            newValue: null,
            description: description,
          }),
        });

        toaster.create({
          title: "Deleted!",
          description: `${title === "Sales Reps" ? "Sales Rep" : "Doctor"} deleted successfully!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Refresh data after successful deletion
        refreshData();
      } else {
        toaster.create({
          title: "Error",
          description: `Failed to delete ${title === "Sales Reps" ? "sales rep" : "doctor"}. Please try again.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toaster.create({
        title: "Error",
        description: "An error occurred while deleting. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openDeleteConfirmation = (title, item) => {
    setConfirmationDialog({
      isOpen: true,
      title: "Confirm Deletion",
      description: `Are you sure you want to delete this ${title === "Sales Reps" ? "sales rep" : "doctor"}? This action cannot be undone.`,
      onConfirm: () => handleDelete(title, item),
      item,
      type: "delete",
    });
  };

  const renderTable = (title, caption, data, columns) => {
    if (!data || data.length === 0) {
      return (
        <Box mb={8}>
          <Heading size="md" mb={4}>
            {title}
          </Heading>
          <Text>No records found.</Text>
        </Box>
      );
    }

    return (
      <Box mb={8}>
        <Heading size="md" mb={4}>
          {title}
        </Heading>
        <Box overflowX="auto" p={1}>
          <Table.Root variant="outline" size="md" showColumnBorder>
            <Table.Caption>{caption}</Table.Caption>
            <Table.Header>
              <Table.Row>
                {columns.map((col, index) => (
                  <Table.ColumnHeader key={index} textAlign="center">
                    {col.header}
                  </Table.ColumnHeader>
                ))}
                <Table.ColumnHeader textAlign="center">
                  Actions
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.map((item, index) => (
                <Table.Row key={index}>
                  {columns.map((col, colIndex) => (
                    <Table.Cell key={colIndex} textAlign="center">
                      {item[col.key] && String(item[col.key]).trim() !== ""
                        ? item[col.key]
                        : "-"}
                    </Table.Cell>
                  ))}
                  <Table.Cell textAlign="center">
                    <Flex gap={2}>
                      <Button
                        colorPalette="orange"
                        size="sm"
                        onClick={() => handleEdit(title, item)}
                        flex={1}
                      >
                        <RiEdit2Fill />
                        Edit
                      </Button>
                      <Button
                        colorPalette="red"
                        size="sm"
                        onClick={() => openDeleteConfirmation(title, item)}
                        flex={1}
                      >
                        <RiDeleteBin7Line />
                        Delete
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    );
  };

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <Flex mb={4}>
        <BreadcrumbRoot separator={<LiaAngleRightSolid />}>
          <BreadcrumbLink href="/home">
            <RiHome7Line />
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbRoot>
      </Flex>
      <Flex mb={4} alignItems="center">
        <Heading size="2xl">
          Welcome back {user ? user.firstName || user.name || "User" : "User"}
        </Heading>
      </Flex>

      <Flex gap={4} mb={8}>
        <Button colorPalette="blue" onClick={handleOnboardSalesRep}>
          <RiUserAddLine />
          Onboard Sales Rep
        </Button>

        <Button colorPalette="blue" onClick={handleAddDoctor}>
          <RiHeartPulseLine />
          Add Doctor
        </Button>

        <Button colorPalette="green" onClick={refreshData}>
          <RiRefreshLine />
          Refresh Data
        </Button>
      </Flex>

      {loading ? (
        <Center>
          <Text fontSize="xl">Loading...</Text>
        </Center>
      ) : (
        <>
          {renderTable("Sales Reps", "Sales rep details", salesReps, [
            { header: "First Name", key: "firstName" },
            { header: "Middle Name", key: "middleName" },
            { header: "Last Name", key: "lastName" },
            { header: "Email", key: "email" },
            { header: "Mobile Number", key: "primaryPhone" },
            { header: "City", key: "city" },
            { header: "District", key: "district" },
          ])}

          {renderTable("Doctors", "Doctor details", doctors, [
            { header: "First Name", key: "firstName" },
            { header: "Middle Name", key: "middleName" },
            { header: "Last Name", key: "lastName" },
            { header: "Email", key: "email" },
            { header: "Mobile Number", key: "primaryPhone" },
            { header: "City", key: "city" },
            { header: "District", key: "district" },
          ])}
        </>
      )}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() =>
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }))
        }
        onConfirm={() => {
          confirmationDialog.onConfirm();
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
      />
    </Box>
  );
};

export default Home;
