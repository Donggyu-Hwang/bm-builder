import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { GoogleOAuthService } from './googleOAuth.service';
import pool from '../utils/db';
import crypto from 'crypto';

describe('GoogleOAuthService', () => {
  let service: GoogleOAuthService;
  let testUserId: string;

  beforeAll(async () => {
    service = new GoogleOAuthService();

    // Create a test user
    const { rows } = await pool.query(
      `INSERT INTO profiles (email, full_name, google_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ['test-goauth@example.com', 'Test User', 'google_test_123']
    );
    testUserId = rows[0].id;

    // Set up test encryption key
    process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM google_tokens WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM profiles WHERE id = $1', [testUserId]);
    await pool.end();
  });

  describe('getAuthUrl', () => {
    it('should generate OAuth authorization URL with state', () => {
      const state = 'test-state-123';
      const authUrl = service.getAuthUrl(state);

      expect(authUrl).toContain('accounts.google.com/o/oauth2/v2/auth');
      expect(authUrl).toContain('state=' + state);
      expect(authUrl).toContain('scope=');
      expect(authUrl).toContain('access_type=offline');
      expect(authUrl).toContain('prompt=consent');
    });

    it('should include readonly drive scope', () => {
      const authUrl = service.getAuthUrl('state');
      expect(authUrl).toContain('https://www.googleapis.com/auth/drive.readonly');
    });
  });

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt token correctly', () => {
      const originalToken = 'test-access-token-12345';
      const encrypted = service.encrypt(originalToken);
      const decrypted = service.decrypt(encrypted);

      expect(encrypted).not.toBe(originalToken);
      expect(decrypted).toBe(originalToken);
    });

    it('should produce different encrypted values for same input (due to IV)', () => {
      const token = 'same-token';
      const encrypted1 = service.encrypt(token);
      const encrypted2 = service.encrypt(token);

      expect(encrypted1).not.toBe(encrypted2);
      expect(service.decrypt(encrypted1)).toBe(token);
      expect(service.decrypt(encrypted2)).toBe(token);
    });

    it('should handle empty strings', () => {
      const encrypted = service.encrypt('');
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe('');
    });
  });

  describe('saveTokens', () => {
    it('should save tokens to database with encryption', async () => {
      const tokens = {
        access_token: 'test-access-token-' + Date.now(),
        refresh_token: 'test-refresh-token-' + Date.now(),
        expires_in: 3600
      };

      await service.saveTokens(testUserId, tokens);

      // Verify tokens were saved
      const { rows } = await pool.query(
        'SELECT * FROM google_tokens WHERE user_id = $1',
        [testUserId]
      );

      expect(rows.length).toBe(1);
      expect(rows[0].access_token).not.toBe(tokens.access_token); // Should be encrypted
      expect(rows[0].refresh_token).not.toBe(tokens.refresh_token); // Should be encrypted
      expect(rows[0].token_expires_at).toBeInstanceOf(Date);
    });

    it('should update profile google_drive_connected flag', async () => {
      const tokens = {
        access_token: 'another-access-token',
        refresh_token: 'another-refresh-token',
        expires_in: 3600
      };

      await service.saveTokens(testUserId, tokens);

      const { rows } = await pool.query(
        'SELECT google_drive_connected FROM profiles WHERE id = $1',
        [testUserId]
      );

      expect(rows[0].google_drive_connected).toBe(true);
    });

    it('should update existing tokens (upsert)', async () => {
      const tokens1 = {
        access_token: 'first-token',
        refresh_token: 'first-refresh',
        expires_in: 3600
      };

      const tokens2 = {
        access_token: 'second-token',
        refresh_token: 'second-refresh',
        expires_in: 7200
      };

      await service.saveTokens(testUserId, tokens1);
      await service.saveTokens(testUserId, tokens2);

      // Should only have one record
      const { rows } = await pool.query(
        'SELECT * FROM google_tokens WHERE user_id = $1',
        [testUserId]
      );

      expect(rows.length).toBe(1);

      // Decrypt and verify it's the second set of tokens
      const decryptedAccess = service.decrypt(rows[0].access_token);
      const decryptedRefresh = service.decrypt(rows[0].refresh_token);

      expect(decryptedAccess).toBe(tokens2.access_token);
      expect(decryptedRefresh).toBe(tokens2.refresh_token);
    });
  });

  describe('getTokens', () => {
    it('should retrieve and decrypt tokens for user', async () => {
      const tokens = {
        access_token: 'retrieve-test-token',
        refresh_token: 'retrieve-test-refresh',
        expires_in: 3600
      };

      await service.saveTokens(testUserId, tokens);

      const retrieved = await service.getTokens(testUserId);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.access_token).toBe(tokens.access_token);
      expect(retrieved!.refresh_token).toBe(tokens.refresh_token);
    });

    it('should return null for non-existent user', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      const retrieved = await service.getTokens(fakeUserId);
      expect(retrieved).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired tokens', () => {
      const expiredDate = new Date(Date.now() - 10000); // 10 seconds ago
      expect(service.isTokenExpired(expiredDate)).toBe(true);
    });

    it('should return false for valid tokens', () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
      expect(service.isTokenExpired(futureDate)).toBe(false);
    });

    it('should return true for tokens expiring within buffer time (5 minutes)', () => {
      const nearExpiry = new Date(Date.now() + 240000); // 4 minutes from now
      expect(service.isTokenExpired(nearExpiry, 300000)).toBe(true); // 5 min buffer
    });
  });

  describe('deleteTokens', () => {
    it('should delete tokens for user', async () => {
      const tokens = {
        access_token: 'delete-test-token',
        refresh_token: 'delete-test-refresh',
        expires_in: 3600
      };

      await service.saveTokens(testUserId, tokens);
      await service.deleteTokens(testUserId);

      const { rows } = await pool.query(
        'SELECT * FROM google_tokens WHERE user_id = $1',
        [testUserId]
      );

      expect(rows.length).toBe(0);
    });

    it('should update profile google_drive_connected flag to false', async () => {
      const tokens = {
        access_token: 'flag-test-token',
        refresh_token: 'flag-test-refresh',
        expires_in: 3600
      };

      await service.saveTokens(testUserId, tokens);
      await service.deleteTokens(testUserId);

      const { rows } = await pool.query(
        'SELECT google_drive_connected FROM profiles WHERE id = $1',
        [testUserId]
      );

      expect(rows[0].google_drive_connected).toBe(false);
    });
  });
});
