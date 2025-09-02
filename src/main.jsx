import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import ErrorBoundary from "./ErrorBoundary";
import AuthProvider from "./context/AuthContext";
import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

import AdminProtectedRoute from "./admin/AdminProtectedRoute.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminRegister from "./admin/pages/AdminRegister.jsx";
import AdminHome from "./admin/pages/AdminHome.jsx";
import AdminHotelForm from "./admin/pages/AdminHotelForm.jsx";
import AdminHotelAnalytics from "./admin/pages/AdminHotelAnalytics.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public site */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* (optionnel) redirections anciennes URLs */}
            <Route path="/connexion" element={<Navigate to="/admin/login" replace />} />
            <Route path="/inscription" element={<Navigate to="/admin/register" replace />} />

            {/* Admin auth */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />

            {/* Admin protected */}
            <Route element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminHome />} />
                <Route path="/admin/hotels/new" element={<AdminHotelForm />} />
                <Route path="/admin/hotels/:id/analytics" element={<AdminHotelAnalytics />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
