import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AuthLayout from "./components/auth/AuthLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";
import MembersPage from "./pages/MembersPage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TestPage from "./pages/TestPage";
import HomePage from '@/pages/HomePage';
import DevLogin from '@/components/DevLogin';
import ProfilePage from '@/pages/ProfilePage';
import Timeline from '@/pages/Timeline';
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // You could add a loading spinner here
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <DevLogin />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<AuthLayout />}>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                } 
              />
            </Route>

            <Route path="/test" element={<TestPage />} />
            
            {/* Protected routes */}
            <Route 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/forums" element={<div>Forums Page (Coming Soon)</div>} />
              <Route path="/shop" element={<div>Shop Page (Coming Soon)</div>} />
              <Route path="/blog" element={<div>Blog Page (Coming Soon)</div>} />
              <Route path="/notifications" element={<div>Notifications Page (Coming Soon)</div>} />
              <Route path="/messages" element={<div>Messages Page (Coming Soon)</div>} />
              <Route path="/cart" element={<div>Cart Page (Coming Soon)</div>} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Public route component to prevent authenticated users from accessing login/register
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default App;
