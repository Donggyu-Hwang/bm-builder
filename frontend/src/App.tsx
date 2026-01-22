import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentGenerationPage } from './pages/DocumentGenerationPage';
import { DocumentEditPage } from './pages/DocumentEditPage';
import NodeCanvasPage from './pages/NodeCanvasPage';
import GoogleOAuthCallback from './components/auth/GoogleOAuthCallback';
import { ToastProvider, ErrorBoundary } from './components/ui';
import { useKeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';

function AppRoutes() {
  const { ShortcutModal } = useKeyboardShortcutsModal();

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/create" element={<DocumentGenerationPage />} />
        <Route path="/documents/:id/edit" element={<DocumentEditPage />} />
        <Route path="/documents/:documentId/node-canvas" element={<NodeCanvasPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
