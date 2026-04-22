import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import {
  Box,
  Heading,
  Button,
  Flex,
  Text,
  Center,
  Input,
  Select,
  Table,
  createListCollection,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  BreadcrumbRoot,
  BreadcrumbLink,
  BreadcrumbCurrentLink,
} from "@/components/ui/breadcrumb";
import { LiaAngleRightSolid } from "react-icons/lia";
import { RiHome7Line, RiRefreshLine } from "react-icons/ri";

const Audit = () => {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    searchTerm: "",
  });

  // Fetch audit logs from API
  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auditLogs`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch audit logs:", response.statusText);
        setAuditLogs([]);
        toaster.create({
          title: "Error",
          description: "Failed to fetch audit logs",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setAuditLogs([]);
      toaster.create({
        title: "Error",
        description: "Failed to fetch audit logs",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit logs on component mount
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Apply filters
  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = !filters.action || log.action === filters.action;
    const matchesEntityType =
      !filters.entityType || log.entityType === filters.entityType;
    const matchesSearchTerm =
      !filters.searchTerm ||
      log.description
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      (log.userId &&
        log.userId.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (log.entityId &&
        log.entityId.toLowerCase().includes(filters.searchTerm.toLowerCase()));

    return matchesAction && matchesEntityType && matchesSearchTerm;
  });

  // Get unique values for filter dropdowns
  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];
  const uniqueEntityTypes = [...new Set(auditLogs.map(log => log.entityType))];

  const handleGoHome = () => navigate("/home");

  // Format timestamp for display
  const formatTimestamp = timestamp => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Create collections for the Select components
  const actionCollection = createListCollection({
    items: [
      { label: "Filter by action", value: "" },
      ...uniqueActions.map(action => ({ label: action, value: action })),
    ],
  });

  const entityTypeCollection = createListCollection({
    items: [
      { label: "Filter by entity type", value: "" },
      ...uniqueEntityTypes.map(type => ({ label: type, value: type })),
    ],
  });

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
      <Flex mb={4}>
        <BreadcrumbRoot separator={<LiaAngleRightSolid />}>
          <BreadcrumbLink href="/home">
            <RiHome7Line />
            Dashboard
          </BreadcrumbLink>
          <BreadcrumbCurrentLink>Audit Logs</BreadcrumbCurrentLink>
        </BreadcrumbRoot>
      </Flex>
      <Flex mb={4} alignItems="center" justifyContent="space-between">
        <Heading size="2xl">Audit Logs</Heading>
        <Button colorPalette="green" onClick={() => fetchAuditLogs()}>
          <RiRefreshLine />
          Refresh
        </Button>
      </Flex>

      <Flex gap={4} mb={8} direction={{ base: "column", md: "row" }}>
        <Input
          placeholder="Search logs..."
          value={filters.searchTerm}
          onChange={e => handleFilterChange("searchTerm", e.target.value)}
          flex={{ base: 1, md: 1 }}
        />

        <Select.Root
          value={filters.action ? [filters.action] : []}
          onValueChange={({ value }) => {
            handleFilterChange("action", value[0] || "");
          }}
          collection={actionCollection}
          flex={{ base: 1, md: 0.3 }}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Filter by action" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {actionCollection.items.map(item => (
                <Select.Item item={item} key={item.value}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>

        <Select.Root
          value={filters.entityType ? [filters.entityType] : []}
          onValueChange={({ value }) => {
            handleFilterChange("entityType", value[0] || "");
          }}
          collection={entityTypeCollection}
          flex={{ base: 1, md: 0.3 }}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Filter by entity type" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {entityTypeCollection.items.map(item => (
                <Select.Item item={item} key={item.value}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Flex>

      <Flex gap={4} mb={8}>
        <Button colorPalette="gray" onClick={handleGoHome}>
          Back to Home
        </Button>
      </Flex>

      {loading ? (
        <Center>
          <Text fontSize="xl">Loading...</Text>
        </Center>
      ) : filteredLogs.length === 0 ? (
        <Text>No audit logs found.</Text>
      ) : (
        <Box overflowX="auto">
          <Table.Root variant="outline" size="md" showColumnBorder>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader textAlign="center">ID</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">
                  Action
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">
                  User ID
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">
                  Timestamp
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">
                  Entity Type
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">
                  Entity ID
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">
                  Description
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredLogs.map((log, index) => (
                <Table.Row key={index}>
                  <Table.Cell textAlign="center">{log.id || "N/A"}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {log.action || "N/A"}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {log.userId || "N/A"}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {formatTimestamp(log.timestamp)}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {log.entityType || "N/A"}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {log.entityId || "N/A"}
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {log.description || "N/A"}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  );
};

export default Audit;
