// App.jsx (Updated)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Login from "./pages/Login/Login";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { useAuth } from "./hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";
import Dashboard from "./pages/Dashboard/Dashboard";
import Transactions from "./pages/Transactions/Transactions";
import SyncQueue from "./pages/SyncQueue/SyncQueue";
import { Toaster } from "react-hot-toast";

const App = () => {
  useNetworkStatus();
  const { isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div style={{ textAlign: "center", marginTop: "20vh" }}>
        Verifying Session...
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            style: { background: "#059669" }, // Emerald Green
          },
          error: {
            style: { background: "#e11d48" }, // Rose Red
          },
        }}
      />
      <ErrorBoundary>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/sync-queue" element={<SyncQueue />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </>
  );
};

export default App;
