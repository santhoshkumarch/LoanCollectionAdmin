import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Provider as JotaiProvider } from "jotai";
import { Provider as ChakraProvider } from "@/components/ui/provider";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import OnboardSalesRep from "./pages/OnboardSalesRep";
import AddDoctor from "./pages/AddDoctor";
import AssignDoctor from "./pages/AssignDoctor";
import Audit from "./pages/Audit";
import AssignmentManagement from "./pages/AssignmentManagement";

export default function App() {
  return (
    <JotaiProvider>
      <ChakraProvider>
        <AuthProvider>
          <Navbar />
          <Toaster />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboard-sales-rep"
              element={
                <ProtectedRoute>
                  <OnboardSalesRep />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-doctor"
              element={
                <ProtectedRoute>
                  <AddDoctor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assign-doctor"
              element={
                <ProtectedRoute>
                  <AssignDoctor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute>
                  <Audit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments"
              element={
                <ProtectedRoute>
                  <AssignmentManagement />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ChakraProvider>
    </JotaiProvider>
  );
}
