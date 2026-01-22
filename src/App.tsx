import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import ChangePassword from "./pages/ChangePassword";
import SetupProfile from "./pages/SetupProfile";
import SelectInterests from "./pages/SelectInterests";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Chats from "./pages/Chats";
import ChatRoom from "./pages/ChatRoom";
import Clubs from "./pages/Clubs";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Notifications from "./pages/Notifications";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import TempPasswordGuard from "./components/TempPasswordGuard";
import FacultyCreateAnnouncement from "./pages/faculty/CreateAnnouncement";
import FacultyCreateEvent from "./pages/faculty/CreateEvent";
import ClubCreateAnnouncement from "./pages/club/CreateAnnouncement";
import ClubCreateEvent from "./pages/club/CreateEvent";
import ClubEditProfile from "./pages/club/EditProfile";
import ClubFollowers from "./pages/club/Followers";
import CreateChat from "./pages/CreateChat";
import DemoAdmin from "./pages/DemoAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setup-profile"
            element={
              <ProtectedRoute>
                <SetupProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-interests"
            element={
              <ProtectedRoute>
                <SelectInterests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <TempPasswordGuard>
                  <Home />
                </TempPasswordGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <TempPasswordGuard>
                  <Events />
                </TempPasswordGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <TempPasswordGuard>
                  <Chats />
                </TempPasswordGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clubs"
            element={
              <ProtectedRoute>
                <TempPasswordGuard>
                  <Clubs />
                </TempPasswordGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <TempPasswordGuard>
                  <Profile />
                </TempPasswordGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <TempPasswordGuard>
                  <EditProfile />
                </TempPasswordGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <TempPasswordGuard>
                  <Notifications />
                </TempPasswordGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <TempPasswordGuard>
                  <Search />
                </TempPasswordGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats/:chatId"
            element={
              <ProtectedRoute>
                <TempPasswordGuard>
                  <ChatRoom />
                </TempPasswordGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats/:chatId"
            element={
              <ProtectedRoute>
                <ChatRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-chat"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['faculty', 'club']}>
                  <CreateChat />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route
            path="/demo-admin"
            element={
              <DemoAdmin />
            }
          />
          {/* Faculty Routes */}
          <Route
            path="/faculty/create-announcement"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['faculty']}>
                  <FacultyCreateAnnouncement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/create-event"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['faculty']}>
                  <FacultyCreateEvent />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          {/* Club Routes */}
          <Route
            path="/club/create-announcement"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['club']}>
                  <ClubCreateAnnouncement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/create-event"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['club']}>
                  <ClubCreateEvent />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/edit-profile"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['club']}>
                  <ClubEditProfile />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/followers"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['club']}>
                  <ClubFollowers />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
