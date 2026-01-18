import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Profile } from 'passport';
import pool from '../utils/db';

// Only configure Google Strategy if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/v1/auth/google/callback',
    scope: ['profile', 'email']
  }, async (_accessToken: string, _refreshToken: string, profile: Profile, done: any) => {
  try {
    // Check if user exists
    const { rows: [existingUser] } = await pool.query(
      'SELECT * FROM profiles WHERE google_id = $1',
      [profile.id]
    );

    if (existingUser) {
      // Update last_login
      await pool.query(
        'UPDATE profiles SET last_login = NOW() WHERE google_id = $1',
        [profile.id]
      );
      return done(null, existingUser);
    }

    // Create new user
    const { rows: [newUser] } = await pool.query(
      `INSERT INTO profiles (google_id, email, full_name, avatar_url, onboarding_completed, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING *`,
      [
        profile.id,
        profile.emails?.[0]?.value || '',
        profile.displayName || '',
        profile.photos?.[0]?.value || null
      ]
    );

    return done(null, newUser);
  } catch (error) {
    return done(error, undefined);
  }
  }));
}

// Serialize/Deserialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const { rows: [user] } = await pool.query(
      'SELECT id, email, full_name, avatar_url, onboarding_completed FROM profiles WHERE id = $1',
      [id]
    );
    done(null, user);
  } catch (error) {
    done(error, undefined);
  }
});

export default passport;
