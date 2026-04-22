# MCP (Model Context Protocol) Integration

## Overview

This project includes an MCP server configuration for Chakra UI integration. MCP (Model Context Protocol) allows AI tools to access information about your project's dependencies, structure, and configuration to provide more context-aware assistance.

## Configuration

The MCP server for Chakra UI is defined in `.qwen/config.json`:

- Server name: `chakra-ui`
- Command: `npx`
- Args: `["-y", "@chakra-ui/react-mcp"]`

## How to Use

The configuration enables AI tools (like Qwen Code) to provide better assistance when working with Chakra UI components in your project. When using an MCP-aware editor or AI tool, it will automatically:

- Recognize Chakra UI components in your code
- Provide component-specific documentation
- Suggest appropriate props and usage patterns
- Show examples of how components are used in your project

## Prerequisites

- Node.js and npm/yarn must be installed
- The project dependencies should be installed (`yarn install` or `npm install`)

## Note

This configuration is primarily for AI-assisted development and does not affect the runtime behavior of your application. It simply provides better context to AI tools that support the MCP protocol.
