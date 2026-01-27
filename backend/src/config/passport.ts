import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Profile } from 'passport';
import pool from '../utils/db';

/**
 * Passport done callback type
 * Using proper types instead of 'any'
 */
type DoneCallback = (err: Error | null, user?: Express.User | false) => void;

// Only configure Google Strategy if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/v1/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done: DoneCallback) => {
        try {
          // CRITICAL FIX: Validate email from OAuth provider
          const email = profile.emails?.[0]?.value;

          if (!email || email.trim().length === 0) {
            return done(new Error('Email is required from OAuth provider'), undefined);
          }

          // Check if user exists
          const {
            rows: [existingUser],
          } = await pool.query('SELECT * FROM profiles WHERE google_id = $1', [profile.id]);

          if (existingUser) {
            // Update last_login
            await pool.query('UPDATE profiles SET last_login = NOW() WHERE google_id = $1', [
              profile.id,
            ]);
            return done(null, existingUser);
          }

          // Create new user with validated email
          const {
            rows: [newUser],
          } = await pool.query(
            `INSERT INTO profiles (google_id, email, full_name, avatar_url, onboarding_completed, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING *`,
            [
              profile.id,
              email.trim(),
              profile.displayName || '',
              profile.photos?.[0]?.value || null,
            ]
          );

          return done(null, newUser);
        } catch (error) {
          return done(error instanceof Error ? error : new Error(String(error)), undefined);
        }
      }
    )
  );
}

// Serialize/Deserialize user
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as any).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const {
      rows: [user],
    } = await pool.query(
      'SELECT id, email, full_name, avatar_url, onboarding_completed FROM profiles WHERE id = $1',
      [id]
    );
    done(null, user);
  } catch (error) {
    done(error instanceof Error ? error : new Error(String(error)), undefined);
  }
});

export default passport;
