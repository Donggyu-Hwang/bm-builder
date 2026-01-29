import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectionsRouter from './routes/v1/connections.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'BM Builder API is running' });
});

// API v1 routes
app.use('/api/v1/connections', connectionsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
