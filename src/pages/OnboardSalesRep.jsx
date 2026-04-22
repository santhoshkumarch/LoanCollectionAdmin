import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import allCities from "../data/cities";
import districts from "../data/districts";
import {
  Box,
  Heading,
  Button,
  Flex,
  Input,
  Textarea,
  Fieldset,
  Field,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  BreadcrumbRoot,
  BreadcrumbLink,
  BreadcrumbCurrentLink,
} from "@/components/ui/breadcrumb";
import { LiaAngleRightSolid } from "react-icons/lia";
import { RiHome7Line } from "react-icons/ri";
import ConfirmationDialog from "../components/ConfirmationDialog";

const onboardSalesRepSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  email: z
    .union([z.email("Invalid email address"), z.literal(""), z.undefined()])
    .optional(),
  primaryPhone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
    .min(1, "Primary phone is required"),
  secondaryPhone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
    .optional()
    .or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  repId: z.string().min(1, "Rep ID is required"),
  district: z.string().min(1, "District is required"),
  primaryCity: z.string().min(1, "City is required"),
});

const OnboardSalesRep = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const editData = location.state?.editData;

  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: null,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(onboardSalesRepSchema),
    defaultValues: editData || {},
  });

  useEffect(() => {
    if (editData) {
      Object.keys(editData).forEach(key => {
        if (key !== "name") setValue(key, editData[key]);
      });
    }
  }, [editData, setValue]);

  const selectedDistrict = useWatch({ control, name: "district" });

  const citiesForSelectedDistrict = useMemo(
    () =>
      selectedDistrict && allCities[selectedDistrict]
        ? allCities[selectedDistrict]
        : [],
    [selectedDistrict]
  );

  // Create collections for the Select components
  const districtsCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "Select district", value: "" },
          ...districts.map(d => ({ label: d, value: d })),
        ],
      }),
    []
  );

  const citiesCollection = useMemo(
    () =>
      createListCollection({
        items: selectedDistrict
          ? citiesForSelectedDistrict.map(city => ({
              label: city,
              value: city,
            }))
          : [{ label: "Select district first", value: "" }],
      }),
    [selectedDistrict, citiesForSelectedDistrict]
  );

  const handleGoHome = () => navigate("/home");

  const onSubmit = async data => {
    // Show confirmation dialog for both create and update operations
    setConfirmationDialog({
      isOpen: true,
      title: editData ? "Confirm Update" : "Confirm Add",
      description: editData
        ? "Are you sure you want to update this sales representative's information?"
        : "Are you sure you want to add this sales representative?",
      onConfirm: async () => {
        try {
          const method = editData ? "PUT" : "POST";
          const url = editData
            ? `${API_BASE_URL}/SalesRep/${editData.id}`
            : `${API_BASE_URL}/SalesRep`;

          const action = editData ? "updateSalesRep" : "createSalesRep";
          const description = editData
            ? "Updated sales rep information"
            : "Created new sales rep entry";

          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              name: `${data.firstName}${data.lastName ? " " + data.lastName : ""}${
                data.middleName ? " " + data.middleName : ""
              }`,
              primaryPhone: data.primaryPhone,
              secondaryPhone: data.secondaryPhone,
              city: data.primaryCity,
            }),
          });

          if (response.ok) {
            // After successful sales rep operation, create audit log
            const result = await response.json();
            const salesRepId = editData
              ? editData.id
              : result.id || response.headers.get("Location")?.split("/").pop();

            // Create audit log entry
            await fetch(`${API_BASE_URL}/auditLogs`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: action,
                userId: "1", // Assuming the current user ID - would come from auth context in real app
                timestamp: new Date().toISOString(),
                entityId: salesRepId,
                entityType: "salesRep",
                oldValue: editData || null,
                newValue: { ...data, id: salesRepId },
                description: description,
              }),
            });

            toaster.create({
              title: editData ? "Updated!" : "Onboarded!",
              description: editData
                ? "Sales Rep updated successfully!"
                : "Sales Rep onboarded successfully!",
              type: "success",
            });
            setTimeout(() => navigate("/home"), 1500);
          } else {
            const errorData = await response.json();
            console.error("Error processing sales rep:", errorData);
            toaster.create({
              title: "Error",
              description: "Failed to process sales rep. Please try again.",
              type: "error",
            });
          }
        } catch (error) {
          console.error("Error submitting form:", error);
          toaster.create({
            title: "Error",
            description:
              "An error occurred while processing the sales rep. Please try again.",
            type: "error",
          });
        }
      },
    });
  };

  return (
    <Box p={{ base: 4, md: 8 }} maxW="800px" mx="auto">
      <Flex mb={4}>
        <BreadcrumbRoot separator={<LiaAngleRightSolid />}>
          <BreadcrumbLink href="/home">
            <RiHome7Line />
            Dashboard
          </BreadcrumbLink>
          <BreadcrumbCurrentLink>Onboard Sales Rep</BreadcrumbCurrentLink>
        </BreadcrumbRoot>
      </Flex>
      <Heading mb={4}>
        {editData ? "Edit Sales Rep" : "Onboard Sales Rep"}
      </Heading>

      <Box as="form" onSubmit={handleSubmit(onSubmit)} mt={4}>
        <Fieldset.Root size="lg" mb={6}>
          <Fieldset.Legend>Names</Fieldset.Legend>
          <Flex
            gap={{ base: 4, md: 6 }}
            direction={{ base: "column", md: "row" }}
          >
            <Field.Root
              invalid={!!errors.firstName}
              flex={{ base: "1", md: 1 }}
              required
            >
              <Field.Label>
                First Name <Field.RequiredIndicator />
              </Field.Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                {...register("firstName")}
              />
              <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.lastName} flex={{ base: "1", md: 1 }}>
              <Field.Label>Last Name</Field.Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                {...register("lastName")}
              />
              <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root
              invalid={!!errors.middleName}
              flex={{ base: "1", md: 1 }}
            >
              <Field.Label>Middle Name</Field.Label>
              <Input
                id="middleName"
                placeholder="Enter middle name"
                {...register("middleName")}
              />
              <Field.ErrorText>{errors.middleName?.message}</Field.ErrorText>
            </Field.Root>
          </Flex>
        </Fieldset.Root>

        <Fieldset.Root size="lg" mb={6}>
          <Fieldset.Legend>Contact</Fieldset.Legend>
          <Flex
            gap={{ base: 4, md: 6 }}
            direction={{ base: "column", md: "row" }}
          >
            <Field.Root invalid={!!errors.email} flex={{ base: "1", md: 1 }}>
              <Field.Label>Email</Field.Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register("email")}
              />
              <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root
              invalid={!!errors.primaryPhone}
              flex={{ base: "1", md: 1 }}
              required
            >
              <Field.Label>
                Primary Phone <Field.RequiredIndicator />
              </Field.Label>
              <Input
                id="primaryPhone"
                type="tel"
                placeholder="Enter primary phone number"
                {...register("primaryPhone")}
              />
              <Field.ErrorText>{errors.primaryPhone?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root
              invalid={!!errors.secondaryPhone}
              flex={{ base: "1", md: 1 }}
            >
              <Field.Label>Secondary Phone</Field.Label>
              <Input
                id="secondaryPhone"
                type="tel"
                placeholder="Enter secondary phone number"
                {...register("secondaryPhone")}
              />
              <Field.ErrorText>
                {errors.secondaryPhone?.message}
              </Field.ErrorText>
            </Field.Root>
          </Flex>
        </Fieldset.Root>

        <Fieldset.Root size="lg" mb={6}>
          <Fieldset.Legend>Address</Fieldset.Legend>
          <Field.Root invalid={!!errors.address} mb={4} required>
            <Field.Label>
              Address <Field.RequiredIndicator />
            </Field.Label>
            <Textarea
              id="address"
              placeholder="Enter full address"
              rows={3}
              {...register("address")}
            />
            <Field.ErrorText>{errors.address?.message}</Field.ErrorText>
          </Field.Root>
        </Fieldset.Root>

        <Fieldset.Root size="lg" mb={6}>
          <Fieldset.Legend>Details</Fieldset.Legend>

          <Field.Root invalid={!!errors.repId} mb={4} required>
            <Field.Label>
              Rep ID <Field.RequiredIndicator />
            </Field.Label>
            <Input
              id="repId"
              placeholder="Enter rep ID"
              {...register("repId")}
            />
            <Field.ErrorText>{errors.repId?.message}</Field.ErrorText>
          </Field.Root>

          <Flex
            gap={{ base: 4, md: 6 }}
            direction={{ base: "column", md: "row" }}
          >
            <Field.Root
              invalid={!!errors.district}
              flex={{ base: "1", md: 1 }}
              required
            >
              <Field.Label>
                District <Field.RequiredIndicator />
              </Field.Label>
              <Controller
                control={control}
                name="district"
                render={({ field }) => {
                  const chakraValue = field.value ? [field.value] : []; // string -> array

                  return (
                    <Select.Root
                      name={field.name}
                      value={chakraValue}
                      onValueChange={({ value }) => {
                        field.onChange(value[0]); // array -> string
                      }}
                      onInteractOutside={field.onBlur}
                      collection={districtsCollection}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Select district" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {districtsCollection.items.map(district => (
                            <Select.Item item={district} key={district.value}>
                              {district.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  );
                }}
              />

              <Field.ErrorText>{errors.district?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root
              invalid={!!errors.primaryCity}
              flex={{ base: "1", md: 1 }}
              required
            >
              <Field.Label>
                Primary City <Field.RequiredIndicator />
              </Field.Label>
              <Controller
                control={control}
                name="primaryCity"
                render={({ field }) => {
                  const chakraValue = field.value ? [field.value] : [];

                  return (
                    <Select.Root
                      name={field.name}
                      value={chakraValue}
                      onValueChange={({ value }) => {
                        field.onChange(value[0]);
                      }}
                      onInteractOutside={field.onBlur}
                      collection={citiesCollection}
                      disabled={!selectedDistrict}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText
                            placeholder={
                              selectedDistrict
                                ? "Select city"
                                : "Select district first"
                            }
                          />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {citiesCollection.items.map(city => (
                            <Select.Item item={city} key={city.value}>
                              {city.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  );
                }}
              />

              <Field.ErrorText>{errors.primaryCity?.message}</Field.ErrorText>
            </Field.Root>
          </Flex>
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
            {editData ? "Update Sales Rep" : "Submit"}
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

export default OnboardSalesRep;
