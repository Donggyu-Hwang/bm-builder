import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AIGreeting } from './components/onboarding/AIGreeting';
import { SettingsPage } from './pages/SettingsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import DocumentGenerationPage from './pages/DocumentGenerationPage';
import { DocumentEditPage } from './pages/DocumentEditPage';
import NodeCanvasPage from './pages/NodeCanvasPage';
import CanvasPage from './pages/CanvasPage';
import TeamManagementPage from './pages/TeamManagementPage';
import TeamInvitePage from './pages/TeamInvitePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PlansPage from './pages/PlansPage';
import GoogleOAuthCallback from './components/auth/GoogleOAuthCallback';
import { ToastProvider, ErrorBoundary } from './components/ui';
import { useKeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import { DemoModeBanner } from './components/demo/DemoModeBanner';
import { DemoModeIndicator } from './components/demo/DemoModeIndicator';

function AppRoutes() {
  const { ShortcutModal } = useKeyboardShortcutsModal();
  const isDemoMode = useSelector((state: any) => state.demo.isDemoMode);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  return (
    <>
      {/* Show demo banner on login page if not authenticated and not in demo mode */}
      {!isAuthenticated && !isDemoMode && <DemoModeBanner />}

      {/* Show demo mode indicator when in demo mode */}
      {isDemoMode && <DemoModeIndicator />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/demo" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/" element={<AIGreeting />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/create" element={<DocumentGenerationPage />} />
        <Route path="/documents/:id/edit" element={<DocumentEditPage />} />
        <Route path="/documents/:documentId/node-canvas" element={<NodeCanvasPage />} />
        <Route path="/canvas" element={<CanvasPage />} />
        <Route path="/teams" element={<TeamManagementPage />} />
        <Route path="/invite/:token" element={<TeamInvitePage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
      </Routes>
      <ShortcutModal />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="bm-builder-theme">
        <ErrorBoundary>
          <ToastProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ToastProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
