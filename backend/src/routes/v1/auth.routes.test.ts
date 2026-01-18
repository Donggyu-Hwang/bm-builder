import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './auth.routes';

describe('Auth Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/v1/auth', authRoutes);
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear cookies and return success', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 when no access token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 401 when no refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_REFRESH_TOKEN');
    });
  });
});
