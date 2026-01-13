import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/v1/auth.routes';
import onboardingRoutes from './routes/v1/onboarding.routes';
import prioritiesRoutes from './routes/v1/priorities.routes';
import preferencesRoutes from './routes/v1/preferences.routes';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/priorities', prioritiesRoutes);
app.use('/api/v1/preferences', preferencesRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export supabase for type augmentation
declare global {
  var supabase: unknown;
}
