import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from './config/passport';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport initialization
app.use(passport.initialize());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
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

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/health`);
  });
}

export default app;
