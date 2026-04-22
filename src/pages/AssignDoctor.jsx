import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Button,
  Flex,
  Fieldset,
  Field,
  Select,
  createListCollection,
  Input,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { API_BASE_URL } from "../config/api";
import {
  BreadcrumbRoot,
  BreadcrumbLink,
  BreadcrumbCurrentLink,
} from "@/components/ui/breadcrumb";
import { LiaAngleRightSolid } from "react-icons/lia";
import { RiHome7Line } from "react-icons/ri";
import ConfirmationDialog from "../components/ConfirmationDialog";

const AssignDoctor = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesRepCollection, setSalesRepCollection] = useState(null);
  const [doctorCollection, setDoctorCollection] = useState(null);
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: null,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      salesRepId: "",
      doctorId: "",
      deadlineDate: "",
    },
  });

  // Fetch sales reps, doctors and existing assignments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRepResponse, doctorResponse, assignmentResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/SalesRep`),
            fetch(`${API_BASE_URL}/doctors`),
            fetch(`${API_BASE_URL}/assignments`),
          ]);

        if (salesRepResponse.ok) {
          const salesRepsData = await salesRepResponse.json();

          // Create collection for sales reps dropdown
          const salesRepItems = [
            { label: "Select Sales Rep", value: "" },
            ...salesRepsData.map(rep => ({
              label: `${rep.firstName} ${rep.lastName || ""}`.trim(),
              value: rep.id,
            })),
          ];
          setSalesRepCollection(createListCollection({ items: salesRepItems }));
        }

        if (doctorResponse.ok) {
          const doctorsData = await doctorResponse.json();

          // Create collection for doctors dropdown
          const doctorItems = [
            { label: "Select Doctor", value: "" },
            ...doctorsData.map(doctor => ({
              label: `${doctor.firstName} ${doctor.lastName || ""}`.trim(),
              value: doctor.id,
            })),
          ];
          setDoctorCollection(createListCollection({ items: doctorItems }));
        }

        if (assignmentResponse.ok) {
          const assignmentsData = await assignmentResponse.json();
          setAssignments(assignmentsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toaster.create({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async data => {
    // Check if assignment already exists
    const existingAssignment = assignments.find(
      assignment =>
        assignment.salesRepId === data.salesRepId &&
        assignment.doctorId === data.doctorId
    );

    if (existingAssignment) {
      setError("root", {
        message: "This doctor is already assigned to this sales rep",
      });
      toaster.create({
        title: "Error",
        description: "This doctor is already assigned to this sales rep",
        type: "error",
      });
      return;
    }

    // Check if deadline is in the past
    const deadlineDateTime = new Date(data.deadlineDate);
    if (deadlineDateTime < new Date()) {
      setError("deadlineDate", {
        message: "Deadline must be in the future",
      });
      toaster.create({
        title: "Error",
        description: "Deadline must be in the future",
        type: "error",
      });
      return;
    }

    // Show confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      title: "Confirm Assignment",
      description: `Are you sure you want to assign this doctor to the selected sales rep with the deadline ${data.deadlineDate}?`,
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/assignments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              salesRepId: data.salesRepId,
              doctorId: data.doctorId,
              assignedBy: "1", // Using admin id from the json server example
              assignedDate: new Date().toISOString(),
              deadlineDate: data.deadlineDate,
              status: "pending",
            }),
          });

          if (response.ok) {
            const result = await response.json();
            const assignmentId =
              result.id || response.headers.get("Location")?.split("/").pop();

            // After successful assignment, create audit log
            await fetch(`${API_BASE_URL}/auditLogs`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "assignDoctorToSalesRep",
                userId: "1", // Assuming the current user ID - would come from auth context in real app
                timestamp: new Date().toISOString(),
                entityId: assignmentId,
                entityType: "assignment",
                oldValue: null,
                newValue: {
                  salesRepId: data.salesRepId,
                  doctorId: data.doctorId,
                  assignedBy: "1",
                  assignedDate: new Date().toISOString(),
                  deadlineDate: data.deadlineDate,
                  status: "pending",
                  id: assignmentId,
                },
                description: "Assigned doctor to sales rep",
              }),
            });

            toaster.create({
              title: "Success!",
              description: "Doctor assigned to sales rep successfully!",
              type: "success",
            });
            setTimeout(() => navigate("/home"), 1500);
          } else {
            const errorData = await response.json();
            console.error("Assignment error:", errorData);
            toaster.create({
              title: "Error",
              description: "Failed to assign doctor. Please try again.",
              type: "error",
            });
          }
        } catch (error) {
          console.error("Error during assignment:", error);
          toaster.create({
            title: "Error",
            description:
              "An error occurred during assignment. Please try again.",
            type: "error",
          });
        }
      },
    });
  };

  const handleGoHome = () => navigate("/home");

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Heading size="lg">Loading...</Heading>
      </Flex>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} maxW="800px" mx="auto">
      <Flex mb={4}>
        <BreadcrumbRoot separator={<LiaAngleRightSolid />}>
          <BreadcrumbLink href="/home">
            <RiHome7Line />
            Dashboard
          </BreadcrumbLink>
          <BreadcrumbCurrentLink>Assign Doctor</BreadcrumbCurrentLink>
        </BreadcrumbRoot>
      </Flex>
      <Heading mb={4}>Assign Doctor to Sales Rep</Heading>

      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <Fieldset.Root size="lg" mb={6}>
          <Fieldset.Legend>Assignment Details</Fieldset.Legend>

          {/* Sales Rep Selection */}
          <Field.Root invalid={!!errors.salesRepId}>
            <Field.Label>
              Sales Rep <Field.RequiredIndicator />
            </Field.Label>
            {salesRepCollection && (
              <Controller
                control={control}
                name="salesRepId"
                rules={{ required: "Sales Rep is required" }}
                render={({ field }) => {
                  const chakraValue = field.value ? [field.value] : []; // string -> array

                  return (
                    <Select.Root
                      name={field.name}
                      value={chakraValue}
                      onValueChange={({ value }) => {
                        field.onChange(value[0]); // array -> string
                      }}
                      collection={salesRepCollection}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Select sales rep" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {salesRepCollection.items.map(item => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  );
                }}
              />
            )}
            <Field.ErrorText>{errors.salesRepId?.message}</Field.ErrorText>
          </Field.Root>

          {/* Doctor Selection */}
          <Field.Root invalid={!!errors.doctorId} mt={4}>
            <Field.Label>
              Doctor <Field.RequiredIndicator />
            </Field.Label>
            {doctorCollection && (
              <Controller
                control={control}
                name="doctorId"
                rules={{ required: "Doctor is required" }}
                render={({ field }) => {
                  const chakraValue = field.value ? [field.value] : []; // string -> array

                  return (
                    <Select.Root
                      name={field.name}
                      value={chakraValue}
                      onValueChange={({ value }) => {
                        field.onChange(value[0]); // array -> string
                      }}
                      collection={doctorCollection}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Select doctor" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {doctorCollection.items.map(item => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  );
                }}
              />
            )}
            <Field.ErrorText>{errors.doctorId?.message}</Field.ErrorText>
          </Field.Root>

          {/* Deadline Date and Time */}
          <Field.Root invalid={!!errors.deadlineDate} mt={4}>
            <Field.Label>
              Deadline Date & Time <Field.RequiredIndicator />
            </Field.Label>
            <Controller
              control={control}
              name="deadlineDate"
              rules={{ required: "Deadline date and time are required" }}
              render={({ field }) => (
                <Input
                  type="datetime-local"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Field.ErrorText>{errors.deadlineDate?.message}</Field.ErrorText>
          </Field.Root>
        </Fieldset.Root>

        <Flex
          gap={{ base: 4, md: 4 }}
          mt={4}
          direction={{ base: "column", md: "row" }}
        >
          <Button
            size="lg"
            type="submit"
            colorPalette="green"
            flex={{ base: 1, md: 1 }}
            minH="40px"
          >
            Assign Doctor
          </Button>
          <Button
            type="button"
            size="lg"
            colorPalette="gray"
            onClick={handleGoHome}
            flex={{ base: 1, md: 1 }}
            minH="40px"
          >
            Back to Home
          </Button>
        </Flex>
      </Box>

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

export default AssignDoctor;
