import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Landing   from "./pages/Landing";
import Login     from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile   from "./pages/Profile";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("mb_token");
  return token ? children : <Navigate to="/login" replace />;
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ minHeight: "100vh" }}
      >
        <Routes location={location}>
          <Route path="/"          element={<Landing />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return <BrowserRouter><AnimatedRoutes /></BrowserRouter>;
}