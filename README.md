# Sales Representative Admin Dashboard

## Project Overview

The Sales Representative Admin Dashboard is a comprehensive web application designed to manage sales representatives and associated healthcare professionals (doctors). The application provides an intuitive interface for onboarding new representatives, managing doctor information, and tracking activities across different districts and cities in Tamil Nadu.

## Features

- **User Authentication**: Secure login and logout functionality with local storage persistence
- **Sales Rep Management**: Onboard, edit, and view sales representatives with comprehensive information
- **Doctor Management**: Add, edit, and view doctors with complete details
- **District and City Selection**: Two-tier location selection with dynamic dropdowns that update based on district selection
- **Responsive Design**: Fully responsive interface that works across different device sizes
- **Form Validation**: Comprehensive validation using Zod schemas with real-time error feedback
- **Data Management**: Complete CRUD operations (Create, Read, Update, Delete) with API integration
- **Navigation**: Breadcrumb navigation for improved user experience
- **User Experience**: Confirmation dialogs for critical operations, toast notifications for feedback
- **State Management**: Jotai for global state and React hooks for local state management
- **UI Components**: Modern UI built with Chakra UI v3, including custom components
- **Protected Routes**: Authentication-based routing to secure sensitive pages

## Technology Stack

### Frontend

- **React**: v19.2.0 - JavaScript library for building user interfaces
- **Vite**: Next-generation frontend tooling for faster development
- **Chakra UI**: v3.30.0 - Modern component library with accessible design
- **React Router DOM**: v7.9.6 - Declarative routing for React applications
- **React Hook Form**: v7.67.0 - Performant, flexible forms with easy validation
- **Zod**: v4.1.13 - TypeScript-first schema declaration and validation library
- **Emotion**: v11.14.0 - CSS-in-JS library for styling
- **Framer Motion**: v12.23.25 - Animation library
- **Jotai**: v2.15.2 - Atomic state management library
- **Next Themes**: v0.4.6 - Theme management for light/dark modes
- **React Icons**: v5.5.0 - Icon library
- **@hookform/resolvers**: v5.2.2 - Integration between react-hook-form and validation libraries

### Backend Integration

- **REST API**: Connects to a backend service running on port 3000
- **JSON Data Format**: Exchanges structured data with the server
- **Full CRUD Support**: Create, Read, Update, and Delete operations

## File Structure

```
src/
├── assets/               # Static assets (images, fonts, etc.)
├── components/           # Reusable UI components
│   ├── ui/               # Custom Chakra UI components
│   │   ├── breadcrumb.jsx
│   │   ├── color-mode.jsx
│   │   ├── password-input.jsx
│   │   ├── provider.jsx
│   │   ├── toaster.jsx
│   │   └── tooltip.jsx
│   ├── ConfirmationDialog.jsx # Confirmation dialog component
│   ├── LoginRedirect.jsx
│   ├── Navbar.jsx        # Navigation bar component with authentication status
│   ├── ProtectedRoute.jsx # Route protection component
│   └── Sidebar.jsx       # Responsive sidebar component
├── contexts/             # React Context providers
│   └── AuthContext.jsx   # Authentication context
├── data/                 # Static data files
│   ├── cities.js         # List of cities by district in Tamil Nadu
│   └── districts.js      # List of districts in Tamil Nadu
├── hooks/                # Custom React hooks
│   └── useAuth.js        # Authentication hook
├── pages/                # Application pages/views
│   ├── Home.jsx          # Main dashboard page with sales reps and doctors tables
│   ├── Login.jsx         # Login page
│   ├── OnboardSalesRep.jsx # Sales rep onboarding with edit mode support
│   └── AddDoctor.jsx     # Doctor addition with edit mode support
├── services/             # API service functions
├── states/               # Global state management (Jotai atoms)
├── App.jsx               # Main application component
├── index.css             # Global CSS styles
└── main.jsx              # Entry point of the application
```

## Key Components

### ConfirmationDialog

A reusable confirmation dialog component used for delete and form submission operations that require user confirmation.

### Navbar

A responsive navigation bar component that displays the application title and shows login/logout buttons based on authentication status. Includes theme toggle for dark/light mode.

### Sidebar

A responsive sidebar component that appears when logged in, providing navigation options for different sections of the application.

### Form Components

- **OnboardSalesRep**: Handles sales representative onboarding and editing with comprehensive validation
- **AddDoctor**: Handles doctor information addition and editing with validation
- Both components use react-hook-form and Zod for form management and validation

### ProtectedRoute

A component that ensures only authenticated users can access specific routes, redirecting unauthenticated users to the login page.

### Data Management

The application makes extensive use of React hooks (useState, useEffect, useWatch) and React Router DOM for navigation between pages. All API calls are handled with async/await for proper data fetching. The application includes full CRUD operations with error handling and user notifications.

## Setup Instructions

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd SalesRepAdminDashboard
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Environment Configuration

The application connects to a backend service at `http://0.0.0.0:3000`. Ensure that your backend service is running on this address for the application to function properly.

## API Endpoints

The application communicates with the backend API at the following endpoints:

- `GET http://0.0.0.0:3000/SalesRep` - Fetch all sales representatives
- `POST http://0.0.0.0:3000/SalesRep` - Add a new sales representative
- `PUT http://0.0.0.0:3000/SalesRep/:id` - Update a sales representative
- `DELETE http://0.0.0.0:3000/SalesRep/:id` - Delete a sales representative
- `GET http://0.0.0.0:3000/doctors` - Fetch all doctors
- `POST http://0.0.0.0:3000/doctors` - Add a new doctor
- `PUT http://0.0.0.0:3000/doctors/:id` - Update a doctor
- `DELETE http://0.0.0.0:3000/doctors/:id` - Delete a doctor

## Form Validation

All forms in the application use Zod schemas for validation, which provides:

- Runtime validation
- Clear error messaging
- Client-side validation before API calls
- Support for optional and required fields
- Complex validation rules (e.g., phone number format)

## Styling Approach

The application uses Chakra UI v3 components for styling, which provides:

- Pre-built accessible components
- Theme customization capabilities
- Responsive design utilities
- Dark/light mode support
- Consistent design system

## Development Workflow

1. Create new components in the `src/components/` directory
2. Add new pages in the `src/pages/` directory
3. Add static data in the `src/data/` directory
4. Update routing in `App.jsx` if adding new routes
5. Use the existing patterns for form validation and API integration
6. Create new atoms in the `src/states/` directory for global state management
7. Add new hooks in the `src/hooks/` directory for reusable logic

## Common Tasks

### Adding a New Page

1. Create a new component in the `src/pages/` directory
2. Add routing in `App.jsx`
3. Follow the existing patterns for data fetching and form management
4. Wrap the page in a ProtectedRoute if authentication is required

### Updating Data Schema

1. Modify the Zod validation schemas in the respective components
2. Update the API request/response handling to match the new schema
3. Update form fields if necessary

### Customizing Dropdown Options

1. Modify the JSON files in the `src/data/` directory
2. Ensure the component using the data is properly connected
3. Update the UI components that use this data if needed

### Adding New UI Components

1. Create new components in the `src/components/ui/` directory
2. Follow Chakra UI patterns for consistency

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## Troubleshooting

### Forms not validating properly

Check that your Zod schema matches the field names in your form and that you're properly handling the validation errors in the UI.

### API calls failing

Verify that the backend service is running at `http://0.0.0.0:3000` and that CORS is properly configured.

### Dynamic dropdowns not updating

Ensure that the city dropdown is properly connected to the district selection using useWatch hook.

### Authentication issues

Check that localStorage is properly handling the user data and that the AuthContext is correctly implemented.

## Future Enhancements

- Add pagination for large datasets
- Implement advanced search filters
- Add data export functionality (CSV, PDF)
- Implement role-based access controls
- Add dashboard analytics and reporting
- Implement data visualization with charts
- Add offline data synchronization
- Implement real-time notifications
- Add advanced form field types (e.g., file upload)

## Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [React Router Documentation](https://reactrouter.com)
- [Chakra UI Documentation](https://chakra-ui.com)

## MCP (Model Context Protocol) Integration

This project includes MCP server configuration for enhanced AI-assisted development:

- **Chakra UI Integration**: Configured in `.qwen/config.json`
- **Purpose**: Provides AI tools with context about Chakra UI components used in the project
- **Functionality**: Enables better code suggestions, documentation, and usage examples for Chakra UI components

For more details, see the `MCP.md` file in the project root.

## Deployment with Docker

### Building the Docker Image

The project includes a GitHub Actions workflow to automatically build and push the Docker image to GitHub Container Registry. The workflow is triggered on pushes to the main branch.

To build the Docker image locally, run:

```bash
docker build -t sales-rep-admin-dashboard .
```

### Running with Docker

To run the application using Docker:

```bash
docker run -p 5173:5173 sales-rep-admin-dashboard
```

### GitHub Actions Workflow

The GitHub Actions workflow is defined in `.github/workflows/build-and-push-docker.yml` and includes:

- Automatic build and push to GitHub Container Registry
- Multi-architecture support using QEMU
- Image tagging based on branch and commit SHA
- Build caching for faster builds

## Acknowledgments

- The project is built using industry-standard practices for React application development
- Uses modern JavaScript features and ES6+ syntax
- Implements proper separation of concerns and component-based architecture
- Leverages Chakra UI for accessible and responsive design
- Utilizes Jotai for efficient state management
