import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Provider as JotaiProvider } from "jotai";
import { Provider as ChakraProvider } from "@/components/ui/provider";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Cashiers from "./pages/Cashiers";
import Loans from "./pages/Loans";
import Collections from "./pages/Collections";
import Approvals from "./pages/Approvals";
import Reports from "./pages/Reports";
import CashBox from "./pages/CashBox";
import Notifications from "./pages/Notifications";
import CollectionSheet from "./pages/CollectionSheet";
import Managers from "./pages/Managers";
import Shops from "./pages/Shops";

const guarded = element => (
  <ProtectedRoute>
    <Layout>{element}</Layout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <JotaiProvider>
      <ChakraProvider defaultTheme="dark">
        <AuthProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={guarded(<Dashboard />)} />
            <Route path="/customers" element={guarded(<Customers />)} />
            <Route path="/cashiers" element={guarded(<Cashiers />)} />
            <Route path="/loans" element={guarded(<Loans />)} />
            <Route path="/collections" element={guarded(<Collections />)} />
            <Route path="/cash-box" element={guarded(<CashBox />)} />
            <Route path="/approvals" element={guarded(<Approvals />)} />
            <Route path="/reports" element={guarded(<Reports />)} />
            <Route path="/notifications" element={guarded(<Notifications />)} />
            <Route
              path="/collection-sheet"
              element={guarded(<CollectionSheet />)}
            />
            <Route path="/managers" element={guarded(<Managers />)} />
            <Route path="/shops" element={guarded(<Shops />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ChakraProvider>
    </JotaiProvider>
  );
}
