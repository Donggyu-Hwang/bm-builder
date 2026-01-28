import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import passport from './config/passport';
import webSocketService from './services/websocket.service';
import authRoutes from './routes/v1/auth.routes';
import onboardingRoutes from './routes/v1/onboarding.routes';
import prioritiesRoutes from './routes/v1/priorities.routes';
import googleDriveRoutes from './routes/v1/googleDrive.routes';
import fileScanRoutes from './routes/v1/fileScan.routes';
import embeddedDocumentsRoutes from './routes/v1/embeddedDocuments.routes';
import documentGenerationRoutes from './routes/v1/documentGeneration.routes';
import figuresRoutes from './routes/v1/figures.routes';
import pitchDeckRoutes from './routes/v1/pitchDeck.routes';
import retryRoutes from './routes/v1/retry.routes';
import generatedDocumentsRoutes from './routes/v1/generatedDocuments.routes';
import nodesRoutes from './routes/v1/nodes.routes';
import userPreferencesRoutes from './routes/v1/userPreferences.routes';
import workflowShareRoutes from './routes/v1/workflowShare.routes';
import teamsRoutes from './routes/v1/teams.routes';
import commentsRoutes from './routes/v1/comments.routes';
import activityRoutes from './routes/v1/activity.routes';
import dashboardRoutes from './routes/v1/dashboard.routes';
import plansRoutes from './routes/v1/plans.routes';
import auditRoutes from './routes/v1/audit.routes';
import healthRoutes from './routes/v1/health.routes';
import webSocketRoutes from './routes/v1/websocket.routes';
import canvasRoutes from './routes/v1/canvas.routes';
import aiRoutes from './routes/v1/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: (
      process.env.CORS_ALLOWED_ORIGINS ||
      process.env.CORS_ORIGIN ||
      'http://localhost:5173'
    ).split(','),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware (required for Passport session support)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'bm-builder-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', authRoutes); // For profile-related endpoints (e.g., welcome-shown)
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/priorities', prioritiesRoutes);
app.use('/api/v1/google-drive', googleDriveRoutes);
app.use('/api/v1/file-scan', fileScanRoutes);
app.use('/api/v1/documents', embeddedDocumentsRoutes);
app.use('/api/v1/document-generation', documentGenerationRoutes);
app.use('/api/v1/figures', figuresRoutes);
app.use('/api/v1/pitch-deck', pitchDeckRoutes);
app.use('/api/v1/retry', retryRoutes);
app.use('/api/v1/generated-documents', generatedDocumentsRoutes);
app.use('/api/v1', nodesRoutes);
app.use('/api/v1/user-preferences', userPreferencesRoutes);
app.use('/api/v1', workflowShareRoutes);
app.use('/api/v1/teams', teamsRoutes);
app.use('/api/v1/comments', commentsRoutes);
app.use('/api/v1/activity', activityRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1', plansRoutes);
app.use('/api/v1', auditRoutes);
app.use('/api/v1', healthRoutes);
app.use('/api/v1/websocket', webSocketRoutes);
app.use('/api/v1/canvas', canvasRoutes);
app.use('/api/v1/ai', aiRoutes);

// Start server only if this file is run directly
if (require.main === module) {
  const server = http.createServer(app);

  // Initialize WebSocket server
  webSocketService.initialize(server);

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 WebSocket server: ws://localhost:${PORT}/ws`);
  });

  // Graceful shutdown handler
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(() => {
      console.log('HTTP server closed');
    });

    // Stop WebSocket heartbeat
    webSocketService.stopHeartbeat();

    // Save all collaborative documents before shutdown
    const collaborativeEditor = await import('./services/collaborative-editor.service');
    await collaborativeEditor.default.saveAll();

    // Force exit after 5 seconds
    setTimeout(() => {
      console.log('Graceful shutdown completed');
      process.exit(0);
    }, 5000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
