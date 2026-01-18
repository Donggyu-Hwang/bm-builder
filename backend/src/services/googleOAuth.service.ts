import pool from '../utils/db';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

// OAuth token interfaces
export interface OAuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface StoredToken {
  access_token: string;
  refresh_token: string;
  token_expires_at: Date;
}

export class GoogleOAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    // Initialize OAuth2 client
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_DRIVE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generate authorization URL for OAuth consent screen
   */
  getAuthUrl(state: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.readonly'],
      state,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OAuthToken> {
    const { tokens } = await this.oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Invalid token response from Google OAuth');
    }

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expiry_date
        ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
        : 3600
    };
  }

  /**
   * Save encrypted tokens to database
   */
  async saveTokens(userId: string, tokens: OAuthToken): Promise<void> {
    const encryptedAccess = this.encrypt(tokens.access_token);
    const encryptedRefresh = this.encrypt(tokens.refresh_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await pool.query(
      `INSERT INTO google_tokens (user_id, access_token, refresh_token, token_expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         access_token = $2,
         refresh_token = $3,
         token_expires_at = $4,
         updated_at = NOW()`,
      [userId, encryptedAccess, encryptedRefresh, expiresAt]
    );

    // Update profile
    await pool.query(
      'UPDATE profiles SET google_drive_connected = true WHERE id = $1',
      [userId]
    );
  }

  /**
   * Retrieve and decrypt tokens for a user
   */
  async getTokens(userId: string): Promise<StoredToken | null> {
    const { rows } = await pool.query(
      'SELECT access_token, refresh_token, token_expires_at FROM google_tokens WHERE user_id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      access_token: this.decrypt(rows[0].access_token),
      refresh_token: this.decrypt(rows[0].refresh_token),
      token_expires_at: new Date(rows[0].token_expires_at)
    };
  }

  /**
   * Delete tokens for a user (disconnect)
   * This will CASCADE delete all related data:
   * - embedded_documents (via ON DELETE CASCADE)
   * - scan_progress (via ON DELETE CASCADE)
   */
  async deleteTokens(userId: string): Promise<void> {
    // Delete Google tokens (this CASCADE deletes embedded_documents and scan_progress)
    await pool.query(
      'DELETE FROM google_tokens WHERE user_id = $1',
      [userId]
    );

    // Update profile
    await pool.query(
      'UPDATE profiles SET google_drive_connected = false WHERE id = $1',
      [userId]
    );
  }

  /**
   * Refresh access token using refresh token
   * @throws Error if refresh fails
   */
  async refreshAccessToken(userId: string): Promise<string> {
    const tokens = await this.getTokens(userId);

    if (!tokens) {
      throw new Error('No tokens found for user');
    }

    try {
      // Set credentials for refresh
      this.oauth2Client.setCredentials({
        refresh_token: tokens.refresh_token
      });

      // Refresh the token
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error('No access token in refresh response');
      }

      // Calculate new expiration
      const expiresIn = credentials.expiry_date
        ? Math.floor((credentials.expiry_date - Date.now()) / 1000)
        : 3600;

      // Save new tokens
      await this.saveTokens(userId, {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || tokens.refresh_token,
        expires_in: expiresIn
      });

      return credentials.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh access token. Please reconnect Google Drive.');
    }
  }

  /**
   * Get valid access token (auto-refresh if expired)
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const tokens = await this.getTokens(userId);

    if (!tokens) {
      throw new Error('Google Drive not connected');
    }

    // Check if token is expired (with 5 minute buffer)
    if (this.isTokenExpired(tokens.token_expires_at)) {
      return await this.refreshAccessToken(userId);
    }

    return tokens.access_token;
  }

  /**
   * Encrypt text using AES-256-CBC
   */
  encrypt(text: string): string {
    const encryptionKey = this.getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt text using AES-256-CBC
   */
  decrypt(encryptedText: string): string {
    const encryptionKey = this.getEncryptionKey();
    const parts = encryptedText.split(':');

    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0] as string, 'hex');
    const encrypted = parts[1] as string;
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted as string;
  }

  /**
   * Check if token is expired (with buffer time)
   */
  isTokenExpired(expiresAt: Date, bufferMs: number = 300000): boolean {
    // Default 5 minute buffer
    const now = Date.now();
    const expiryTime = new Date(expiresAt).getTime();
    return now >= (expiryTime - bufferMs);
  }

  /**
   * Get encryption key from environment
   * @private
   */
  private getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    // Ensure key is 32 bytes (256 bits) for AES-256
    if (key.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be 64 characters (32 bytes in hex)');
    }

    return Buffer.from(key, 'hex');
  }
}

// Export singleton instance
export const googleOAuthService = new GoogleOAuthService();
