import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AuthLayout from "./components/auth/AuthLayout";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import GroupsPage from "./pages/GroupsPage";
import MyGroupsPage from "./pages/ProfileGroups";
// import GroupDetailsPage from "./pages/GroupDetailsPage";
import MembersPage from "./pages/MembersPage";
import ForumsPage from "./pages/ForumsPage";
import ForumDetailsPage from "./pages/ForumDetailsPage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import TestPage from "./pages/TestPage";
import HomePage from '@/pages/HomePage';
import ProfilePage from '@/pages/ProfilePage';
import AccountPage from '@/pages/AccountPage';
import Timeline from '@/pages/Timeline';
import NotificationPage from '@/pages/NotificationPage';
import ConnectionsPage from '@/pages/ConnectionsPage';
import PhotosPage from '@/pages/PhotosPage';
import VideosPage from '@/pages/VideosPage';
import SearchPage from '@/pages/SearchPage';
import GroupDetails from '@/components/groups/GroupDetails';
import Navbar from '@/components/layout/Navbar';
import NotificationList from '@/components/notifications/NotificationList';
import ShopPage from '@/pages/ShopPage';
import ProductDetailsPage from '@/pages/ProductDetailsPage';
import MessagesPage from '@/pages/MessagesPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import CreateBlogPostPage from '@/pages/CreateBlogPostPage';
import AdminProductPage from './pages/AdminProductPage';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
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

function AppRoutes() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      <main>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
          </Route>

          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/:username" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } />
            <Route path="/timeline" element={
              <ProtectedRoute>
                <Timeline />
              </ProtectedRoute>
            } />
            <Route path="/connections" element={
              <ProtectedRoute>
                <ConnectionsPage />
              </ProtectedRoute>
            } />
            <Route path="/groups" element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            } />
            <Route path="/groups/:id" element={
              <ProtectedRoute>
                <GroupDetails />
              </ProtectedRoute>
            } />
            <Route path="/photos" element={
              <ProtectedRoute>
                <PhotosPage />
              </ProtectedRoute>
            } />
            <Route path="/videos" element={
              <ProtectedRoute>
                <VideosPage />
              </ProtectedRoute>
            } />
            <Route path="/forums" element={
              <ProtectedRoute>
                <ForumsPage />
              </ProtectedRoute>
            } />
            <Route path="/forums/:id" element={
              <ProtectedRoute>
                <ForumDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/members" element={
              <ProtectedRoute>
                <MembersPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationList />
              </ProtectedRoute>
            } />
            <Route path="/profilegroups" element={
              <ProtectedRoute>
                <MyGroupsPage />
              </ProtectedRoute>
            } />
            <Route path="/test" element={
              <ProtectedRoute>
                <TestPage />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            } />
            <Route path="/shop" element={
              <ProtectedRoute>
                <ShopPage />
              </ProtectedRoute>
            } />
            <Route path="/booking/:id" element={
              <ProtectedRoute>
                <ProductDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/messages/:conversationId" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/messages/user/:userId" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/blog" element={
              <ProtectedRoute>
                <BlogPage />
              </ProtectedRoute>
            } />
            <Route path="/blog/create" element={
              <ProtectedRoute>
                <CreateBlogPostPage />
              </ProtectedRoute>
            } />
            <Route path="/blog/:id" element={
              <ProtectedRoute>
                <BlogPostPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute>
                <AdminProductPage />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <SidebarProvider>
              <BrowserRouter>
                <AppRoutes />
                <Toaster />
                <Sonner />
              </BrowserRouter>
            </SidebarProvider>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
