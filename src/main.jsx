import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import ErrorBoundary from "./ErrorBoundary";
import AuthProvider from "./context/AuthContext";
import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import SearchResults from "./pages/SearchResults.jsx";

import AdminProtectedRoute from "./admin/AdminProtectedRoute.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminRegister from "./admin/pages/AdminRegister.jsx";
import AdminHome from "./admin/pages/AdminHome.jsx";
import AdminHotelForm from "./admin/pages/AdminHotelForm.jsx";
import AdminHotelAnalytics from "./admin/pages/AdminHotelAnalytics.jsx";

import HostProtectedRoute from "./host/HostProtectedRoute.jsx";
import HostLayout from "./host/HostLayout.jsx";
import HostLogin from "./host/pages/HostLogin.jsx";
import HostRegister from "./host/pages/HostRegister.jsx";
import HostHome from "./host/pages/HostHome.jsx";
import HostHotelForm from "./host/pages/HostHotelForm.jsx";

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
              <Route path="/recherche" element={<SearchResults />} />
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

            {/* Host auth */}
            <Route path="/host/login" element={<HostLogin />} />
            <Route path="/host/register" element={<HostRegister />} />

            {/* Optional redirects from legacy */}
            <Route path="/pro/login" element={<Navigate to="/host/login" replace />} />
            <Route path="/pro/register" element={<Navigate to="/host/register" replace />} />

            {/* Host protected */}
            <Route element={<HostProtectedRoute />}>
              <Route element={<HostLayout />}>
                <Route path="/host" element={<HostHome />} />
                <Route path="/host/hotels/new" element={<HostHotelForm />} />
                <Route path="/host/hotels/:id/analytics" element={<AdminHotelAnalytics />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
