# Contributing to SalesRepAdminDashboard

## Development Setup

This project uses Yarn as the package manager. Please make sure you have Yarn installed before proceeding.

### Prerequisites

- Node.js (version 24+)
- Yarn (version 1.22+)

### Getting Started

1. Clone the repository
2. Run `yarn install` to install dependencies
3. Run `yarn dev` to start the development server

## Package Manager Enforcement

This project enforces the use of Yarn instead of npm. If you try to use npm, the installation will fail with an error message. This ensures consistency across all development environments.

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build the project for production
- `yarn lint:check` - Check for linting errors in src directory
- `yarn lint:fix` - Fix linting errors in src directory
- `yarn format:check` - Check code formatting
- `yarn format:fix` - Fix code formatting
- `yarn preview` - Preview the production build

## Code Quality

Before committing your changes, please ensure:

1. All linting checks pass: `yarn lint:check`
2. All formatting checks pass: `yarn format:check`

These checks are also enforced automatically in the CI/CD pipeline.
