# QWEN Reference Document for SalesRepAdminDashboard

## Project Context

- **Project Name**: Sales Representative Admin Dashboard
- **Purpose**: Manage sales representatives and doctors with location-based data
- **Framework**: React with Vite, Chakra UI v3, React Router
- **Language**: JavaScript/JSX with TypeScript validation schemas (Zod)
- **State Management**: Jotai for global state, React hooks for local state
- **Authentication**: Context-based authentication with localStorage persistence

## Technology Stack

- **Core**: React v19.2.0, Vite build tool
- **UI Library**: Chakra UI v3.30.0 with custom UI components
- **Routing**: React Router DOM v7.9.6
- **Form Management**: React Hook Form v7.67.0 with Zod resolver
- **Validation**: Zod v4.1.13 schemas
- **State Management**: Jotai v2.15.2, React hooks
- **Styling**: Emotion v11.14.0, Chakra UI components
- **Icons**: React Icons v5.5.0
- **Theme**: Next Themes v0.4.6
- **Animation**: Framer Motion v12.23.25

## Key Components & Files

### Main Application Structure

1. **App.jsx** (`/src/App.jsx`)
   - Main application component with Jotai, Chakra, and Auth providers
   - Defines all routes with protected route wrappers
   - Includes Navbar and Toaster components

2. **main.jsx** (`/src/main.jsx`)
   - Application entry point
   - Renders the main App component

### Pages

1. **Home.jsx** (`/src/pages/Home.jsx`)
   - Main dashboard page with comprehensive functionality
   - Shows tables of sales reps and doctors with edit/delete capabilities
   - Includes refresh data functionality
   - Displays welcome message with user's name
   - Implements breadcrumb navigation
   - Fetches data from API endpoints

2. **Login.jsx** (`/src/pages/Login.jsx`)
   - Login page for authentication
   - Simple login form with credentials

3. **OnboardSalesRep.jsx** (`/src/pages/OnboardSalesRep.jsx`)
   - Form for onboarding new sales representatives
   - Contains fields: First Name*, Last Name, Middle Name, Email, Primary Phone*, Secondary Phone, Address*, Rep ID*
   - Includes district and city selection with dependency
   - Supports both add and edit modes
   - Uses Zod validation and Chakra UI components
   - Implements confirmation dialog for form submission

4. **AddDoctor.jsx** (`/src/pages/AddDoctor.jsx`)
   - Form for adding new doctors
   - Contains fields: First Name*, Last Name, Middle Name, Email, Primary Phone*, Secondary Phone, Address\*
   - Includes district and city selection with dependency
   - Supports both add and edit modes
   - Uses Zod validation and Chakra UI components
   - Implements confirmation dialog for form submission

### Components

1. **Navbar.jsx** (`/src/components/Navbar.jsx`)
   - Responsive navigation bar component
   - Shows application title and authentication status
   - Includes theme toggle and logout button
   - Conditionally renders sidebar when authenticated

2. **Sidebar.jsx** (`/src/components/Sidebar.jsx`)
   - Responsive sidebar with navigation options
   - Drawer component with navigation links
   - Includes logout functionality

3. **ProtectedRoute.jsx** (`/src/components/ProtectedRoute.jsx`)
   - Route protection component
   - Redirects unauthenticated users to login page
   - Conditionally renders children based on authentication status

4. **ConfirmationDialog.jsx** (`/src/components/ConfirmationDialog.jsx`)
   - Reusable confirmation dialog component
   - Used for delete and form submission operations
   - Includes title and description props

### UI Components

1. **/src/components/ui/** directory
   - Custom Chakra UI components
   - Includes: breadcrumb.jsx, color-mode.jsx, password-input.jsx, provider.jsx, toaster.jsx, tooltip.jsx

### Contexts

1. **AuthContext.jsx** (`/src/contexts/AuthContext.jsx`)
   - Handles authentication state
   - Provides login/logout functionality
   - Stores user data in localStorage

2. **useAuth.js** (`/src/hooks/useAuth.js`)
   - Custom hook for accessing authentication context
   - Provides context creation and access patterns

### Data Files

1. **cities.js** (`/src/data/cities.js`)
   - Organized by districts of Tamil Nadu
   - Maps district names to arrays of cities
   - Used for dynamic city selection based on district

2. **districts.js** (`/src/data/districts.js`)
   - Contains all districts of Tamil Nadu
   - Used for district selection dropdown

### Services

1. **(TBD if needed)** - API service functions

### States

1. **(TBD if any)** - Global state management with Jotai atoms

## API Endpoints Used

- GET `http://0.0.0.0:3000/SalesRep` - Fetch all sales representatives
- POST `http://0.0.0.0:3000/SalesRep` - Add a new sales representative
- PUT `http://0.0.0.0:3000/SalesRep/:id` - Update a sales representative
- DELETE `http://0.0.0.0:3000/SalesRep/:id` - Delete a sales representative
- GET `http://0.0.0.0:3000/doctors` - Fetch all doctors
- POST `http://0.0.0.0:3000/doctors` - Add a new doctor
- PUT `http://0.0.0.0:3000/doctors/:id` - Update a doctor
- DELETE `http://0.0.0.0:3000/doctors/:id` - Delete a doctor

## Validation Schema

- Uses Zod for form validation with react-hook-form integration
- Schema definitions in each form component:
  - onboardSalesRepSchema: Validates sales rep form fields
  - addDoctorSchema: Validates doctor form fields
- Validates required fields, emails, phone numbers (10 digits), addresses, districts, and cities
- Handles optional fields properly with unions and conditional validation

## Styling Approach

- Chakra UI v3 components for consistent and accessible design
- Custom theme using Chakra's provider system
- Responsive design using Chakra's responsive props
- Dark/light mode support through theme provider
- Component-specific styling with Chakra's style props

## Common Patterns & Practices

1. **Form Handling**: Uses react-hook-form with Zod resolver
2. **State Management**: Jotai for global state, React hooks (useState, useEffect, useWatch) for local state
3. **Routing**: React Router DOM with ProtectedRoute wrappers
4. **Data Fetching**: Async/await with fetch API
5. **Component Communication**: Props and callback functions
6. **Validation**: Zod schemas for runtime validation
7. **UI Components**: Chakra UI primitives with custom UI components
8. **User Experience**: Confirmation dialogs, toast notifications, breadcrumbs
9. **Authentication**: Context-based with localStorage persistence

## Recent Features Added

1. Chakra UI v3 implementation with custom UI components
2. Confirmation dialogs for delete and form submission operations
3. Toast notifications for user feedback
4. Breadcrumb navigation for better UX
5. Edit functionality for both sales reps and doctors
6. Dynamic city dropdown that updates based on district selection
7. Responsive sidebar navigation
8. Protected routes for authentication
9. Theme switching (dark/light mode)
10. Refresh data functionality in home page
11. Proper form validation with Zod schemas
12. Responsive design with Chakra UI responsive props

## Key Files for Modification

- When adding new form fields: Update Zod schema and JSX in relevant page file
- When updating validation: Modify Zod schema in the component
- When changing UI: Adjust Chakra UI props/components in the component
- When connecting to new API endpoints: Update fetch calls in relevant components
- When changing district/city data: Modify cities.js or districts.js as needed
- When adding new routes: Update App.jsx routing configuration
- When creating new UI components: Add to src/components/ui/ directory
- When adding global state: Create new atoms in src/states/ directory

## Important Notes

- The application expects API endpoints to be available at 0.0.0.0:3000
- Form validation happens client-side with Zod before API calls
- The application follows a district -> city dependency pattern
- Empty values in tables are displayed as "-"
- Toast notifications provide user feedback for operations
- Confirmation dialogs are used for destructive operations
- Authentication state is persisted in localStorage
- The UI is fully responsive using Chakra UI responsive props
- Theme switching is supported with next-themes
