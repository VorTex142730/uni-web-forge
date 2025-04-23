import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AuthLayout from "./components/auth/AuthLayout";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";
import MembersPage from "./pages/MembersPage";
// import ForumsPage from "./pages/ForumsPage";
// import ShopPage from "./pages/ShopPage";
import NotFound from "./pages/NotFound";
// import BlogPage from "./pages/BlogPage";
// import NotificationsPage from "./pages/NotificationsPage";
// import MessagesPage from "./pages/MessagesPage";
// import CartPage from "./pages/CartPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TestPage from "./pages/TestPage";
import HomePage from '@/pages/HomePage';

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
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
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route path="/test" element={<TestPage/>} />
            
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
              {/* <Route path="/forums" element={<ForumsPage />} /> */}
              {/* <Route path="/shop" element={<ShopPage />} /> */}
              {/* <Route path="/blog" element={<BlogPage />} /> */}
              {/* <Route path="/notifications" element={<NotificationsPage />} /> */}
              {/* <Route path="/messages" element={<MessagesPage />} /> */}
              {/* <Route path="/messages/:conversationId" element={<MessagesPage />} /> */}
              {/* <Route path="/cart" element={<CartPage />} /> */}
              <Route path="/profile" element={<div>Profile Page (Coming Soon)</div>} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
