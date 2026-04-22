import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import {
  Box,
  Heading,
  Button,
  Flex,
  Table,
  Text,
  Center,
  Tabs,
  Dialog,
  Field,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  BreadcrumbRoot,
  BreadcrumbLink,
  BreadcrumbCurrentLink,
} from "@/components/ui/breadcrumb";
import { LiaAngleRightSolid } from "react-icons/lia";
import {
  RiHome7Line,
  RiRefreshLine,
  RiEdit2Fill,
  RiDeleteBin7Line,
  RiEyeLine,
} from "react-icons/ri";

const AssignmentManagement = () => {
  const navigate = useNavigate();
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const [previousAssignments, setPreviousAssignments] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    assignment: null,
  });
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    assignment: null,
  });

  // Fetch data from APIs
  const fetchData = async () => {
    try {
      const [assignmentsResponse, salesRepsResponse, doctorsResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/assignments`),
          fetch(`${API_BASE_URL}/SalesRep`),
          fetch(`${API_BASE_URL}/doctors`),
        ]);

      if (
        assignmentsResponse.ok &&
        salesRepsResponse.ok &&
        doctorsResponse.ok
      ) {
        const assignmentsData = await assignmentsResponse.json();
        const salesRepsData = await salesRepsResponse.json();
        const doctorsData = await doctorsResponse.json();

        // Set sales reps and doctors
        setSalesReps(salesRepsData);
        setDoctors(doctorsData);

        // Separate current and previous assignments
        const now = new Date();
        const current = assignmentsData.filter(assignment => {
          const deadline = new Date(assignment.deadlineDate);
          return assignment.status !== "completed" && deadline > now;
        });
        const previous = assignmentsData.filter(assignment => {
          const deadline = new Date(assignment.deadlineDate);
          return assignment.status === "completed" || deadline <= now;
        });

        setCurrentAssignments(current);
        setPreviousAssignments(previous);
      } else {
        toaster.create({
          title: "Error",
          description: "Failed to fetch data",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toaster.create({
        title: "Error",
        description: "Failed to fetch data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle delete assignment
  const handleDeleteAssignment = async () => {
    if (!deleteModal.assignment) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/assignments/${deleteModal.assignment.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toaster.create({
          title: "Success",
          description: "Assignment deleted successfully!",
          type: "success",
        });

        // Also create audit log for delete assignment
        await fetch(`${API_BASE_URL}/auditLogs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "deleteAssignment",
            userId: "1", // Assuming the current user ID - would come from auth context in real app
            timestamp: new Date().toISOString(),
            entityId: deleteModal.assignment.id,
            entityType: "assignment",
            oldValue: deleteModal.assignment,
            newValue: null,
            description: "Deleted assignment of doctor to sales rep",
          }),
        });

        fetchData(); // Refresh data
      } else {
        toaster.create({
          title: "Error",
          description: "Failed to delete assignment",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toaster.create({
        title: "Error",
        description: "Failed to delete assignment",
        type: "error",
      });
    }

    setDeleteModal({ isOpen: false, assignment: null });
  };

  // Format timestamp for display
  const formatTimestamp = timestamp => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get sales rep name by ID
  const getSalesRepName = id => {
    const salesRep = salesReps.find(rep => rep.id === id);
    return salesRep
      ? `${salesRep.firstName} ${salesRep.lastName || ""}`.trim()
      : "Unknown";
  };

  // Get doctor name by ID
  const getDoctorName = id => {
    const doctor = doctors.find(doc => doc.id === id);
    return doctor
      ? `${doctor.firstName} ${doctor.lastName || ""}`.trim()
      : "Unknown";
  };

  const handleGoHome = () => navigate("/home");
  const handleAssignDoctor = () => navigate("/assign-doctor");

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
      <Flex mb={4}>
        <BreadcrumbRoot separator={<LiaAngleRightSolid />}>
          <BreadcrumbLink href="/home">
            <RiHome7Line />
            Dashboard
          </BreadcrumbLink>
          <BreadcrumbCurrentLink>Assignment Management</BreadcrumbCurrentLink>
        </BreadcrumbRoot>
      </Flex>
      <Flex mb={4} alignItems="center" justifyContent="space-between">
        <Heading size="2xl">Assignment Management</Heading>
        <Button colorPalette="green" onClick={() => fetchData()}>
          <RiRefreshLine />
          Refresh
        </Button>
      </Flex>

      <Flex gap={4} mb={8}>
        <Button colorPalette="blue" onClick={handleAssignDoctor}>
          Assign Doctor to Sales Rep
        </Button>
        <Button colorPalette="gray" onClick={handleGoHome}>
          Back to Home
        </Button>
      </Flex>

      {loading ? (
        <Center>
          <Text fontSize="xl">Loading...</Text>
        </Center>
      ) : (
        <Tabs.Root variant="enclosed">
          <Tabs.List mb={4}>
            <Tabs.Trigger value="current">Current Assignments</Tabs.Trigger>
            <Tabs.Trigger value="previous">Previous Assignments</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Content value="current">
            {currentAssignments.length === 0 ? (
              <Text>No current assignments found.</Text>
            ) : (
              <Box overflowX="auto">
                <Table.Root variant="outline" size="md" showColumnBorder>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader textAlign="center">
                        Sales Rep
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="center">
                        Doctor
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="center">
                        Assigned Date
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="center">
                        Deadline
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="center">
                        Status
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="center">
                        Actions
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {currentAssignments.map((assignment, index) => (
                      <Table.Row key={index}>
                        <Table.Cell textAlign="center">
                          {getSalesRepName(assignment.salesRepId)}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          {getDoctorName(assignment.doctorId)}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          {formatTimestamp(assignment.assignedDate)}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          {formatTimestamp(assignment.deadlineDate)}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          <Text
                            colorPalette={
                              assignment.status === "pending" ? "blue" : "green"
                            }
                          >
                            {assignment.status}
                          </Text>
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          <Flex gap={2} justifyContent="center">
                            <Button
                              size="sm"
                              colorPalette="blue"
                              onClick={() =>
                                setViewModal({ isOpen: true, assignment })
                              }
                              flex={1}
                            >
                              <RiEyeLine />
                            </Button>
                            <Button
                              size="sm"
                              colorPalette="orange"
                              onClick={() =>
                                navigate(`/assign-doctor`, {
                                  state: { editData: assignment },
                                })
                              }
                              flex={1}
                            >
                              <RiEdit2Fill />
                            </Button>
                            <Button
                              size="sm"
                              colorPalette="red"
                              onClick={() =>
                                setDeleteModal({ isOpen: true, assignment })
                              }
                              flex={1}
                            >
                              <RiDeleteBin7Line />
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </Tabs.Content>
          <Tabs.Content value="previous">
            {previousAssignments.length === 0 ? (
              <Text>No previous assignments found.</Text>
            ) : (
              <Box overflowX="auto">
                <Table.Root variant="outline" size="md" showColumnBorder>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader textAlign="center">
                        Sales Rep
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="center">
                        Doctor
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="center">
                        Assigned Date
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="center">
                        Deadline
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="center">
                        Status
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="center">
                        Actions
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {previousAssignments.map((assignment, index) => (
                      <Table.Row key={index}>
                        <Table.Cell textAlign="center">
                          {getSalesRepName(assignment.salesRepId)}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          {getDoctorName(assignment.doctorId)}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          {formatTimestamp(assignment.assignedDate)}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          {formatTimestamp(assignment.deadlineDate)}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          <Text
                            colorPalette={
                              assignment.status === "completed"
                                ? "green"
                                : "gray"
                            }
                          >
                            {assignment.status}
                          </Text>
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          <Flex gap={2} justifyContent="center">
                            <Button
                              size="sm"
                              colorPalette="blue"
                              onClick={() =>
                                setViewModal({ isOpen: true, assignment })
                              }
                              flex={1}
                            >
                              <RiEyeLine />
                            </Button>
                            <Button
                              size="sm"
                              colorPalette="red"
                              onClick={() =>
                                setDeleteModal({ isOpen: true, assignment })
                              }
                              flex={1}
                            >
                              <RiDeleteBin7Line />
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </Tabs.Content>
        </Tabs.Root>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={deleteModal.isOpen}
        onOpenChange={open =>
          !open && setDeleteModal({ isOpen: false, assignment: null })
        }
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Confirm Deletion</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                Are you sure you want to delete this assignment? This will
                remove the assignment of{" "}
                {deleteModal.assignment
                  ? getDoctorName(deleteModal.assignment.doctorId)
                  : ""}
                to{" "}
                {deleteModal.assignment
                  ? getSalesRepName(deleteModal.assignment.salesRepId)
                  : ""}
                .
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                colorPalette="red"
                mr={3}
                onClick={handleDeleteAssignment}
              >
                Delete
              </Button>
              <Button
                colorPalette="gray"
                onClick={() =>
                  setDeleteModal({ isOpen: false, assignment: null })
                }
              >
                Cancel
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* View Assignment Details Dialog */}
      <Dialog.Root
        open={viewModal.isOpen}
        onOpenChange={open =>
          !open && setViewModal({ isOpen: false, assignment: null })
        }
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Assignment Details</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {viewModal.assignment && (
                <Flex direction="column" gap={3}>
                  <Field>
                    <Field.Label>Sales Rep</Field.Label>
                    <Text>
                      {getSalesRepName(viewModal.assignment.salesRepId)}
                    </Text>
                  </Field>
                  <Field>
                    <Field.Label>Doctor</Field.Label>
                    <Text>{getDoctorName(viewModal.assignment.doctorId)}</Text>
                  </Field>
                  <Field>
                    <Field.Label>Assigned By</Field.Label>
                    <Text>{viewModal.assignment.assignedBy}</Text>
                  </Field>
                  <Field>
                    <Field.Label>Assigned Date</Field.Label>
                    <Text>
                      {formatTimestamp(viewModal.assignment.assignedDate)}
                    </Text>
                  </Field>
                  <Field>
                    <Field.Label>Deadline Date</Field.Label>
                    <Text>
                      {formatTimestamp(viewModal.assignment.deadlineDate)}
                    </Text>
                  </Field>
                  <Field>
                    <Field.Label>Status</Field.Label>
                    <Text>{viewModal.assignment.status}</Text>
                  </Field>
                </Flex>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                colorPalette="blue"
                onClick={() =>
                  setViewModal({ isOpen: false, assignment: null })
                }
              >
                Close
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
};

export default AssignmentManagement;
