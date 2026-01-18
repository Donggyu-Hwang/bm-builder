import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

// Google SVG Icon
const GoogleIcon = () => (
  <svg className={styles.googleIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// Feature icons
const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.39 8.26L21 10.5L14.39 12.74L12 19L9.61 12.74L3 10.5L9.61 8.26L12 2Z" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RocketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.5C12 2.5 8 7 8 12C8 14 9 16 10 17L9 22L12 20L15 22L14 17C15 16 16 14 16 12C16 7 12 2.5 12 2.5Z" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          credentials: 'include'
        });

        if (response.ok) {
          navigate('/dashboard');
        }
      } catch (error) {
        // Not authenticated, stay on login page
      }
    };

    checkAuth();
  }, [navigate]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Redirect to Passport.js OAuth endpoint
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    window.location.href = `${API_BASE_URL}/api/v1/auth/google`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.splitLayout}>
        {/* Left Section - Conversational Interface */}
        <div className={styles.leftSection}>
          {/* Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>BM</div>
            <span>bm-builder</span>
          </div>

          {/* Welcome Message */}
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeBadge}>
              <span className={styles.welcomeBadgeDot}></span>
              Your AI Co-Founder
            </div>

            <h1 className={styles.welcomeTitle}>
              Build your business with an{' '}
              <span className={styles.welcomeTitleGradient}>AI partner</span>
            </h1>

            <p className={styles.welcomeDescription}>
              Join thousands of entrepreneurs who use AI to generate business plans,
              pitch decks, and government support applications in minutes, not months.
            </p>

            {/* Feature List */}
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <SparklesIcon />
                </div>
                <div className={styles.featureText}>
                  <div className={styles.featureTitle}>AI-Powered Document Generation</div>
                  <div className={styles.featureDescription}>
                    Claude 4.5 creates tailored business documents from your vision
                  </div>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <RocketIcon />
                </div>
                <div className={styles.featureText}>
                  <div className={styles.featureTitle}>Launch 10x Faster</div>
                  <div className={styles.featureDescription}>
                    Skip the paperwork. Focus on what matters: your product and customers
                  </div>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <DocumentIcon />
                </div>
                <div className={styles.featureText}>
                  <div className={styles.featureTitle}>Government-Ready Templates</div>
                  <div className={styles.featureDescription}>
                    Pre-built templates for R&D, startup support, and IR materials
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Card */}
        <div className={styles.rightSection}>
          <div className={styles.loginCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Welcome back</h2>
              <p className={styles.cardSubtitle}>
                Sign in to continue your startup journey
              </p>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`${styles.googleButton} ${isLoading ? styles.googleButtonLoading : ''}`}
            >
              {isLoading ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  <span className={styles.googleButtonText}>Connecting...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span className={styles.googleButtonText}>Continue with Google</span>
                </>
              )}
            </button>

            <p className={styles.googleButtonSubtext}>
              Secure authentication powered by Google OAuth 2.0
            </p>

            {/* Divider */}
            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <span className={styles.dividerText}>or</span>
              <div className={styles.dividerLine}></div>
            </div>

            {/* Demo Link */}
            <a href="/demo" className={styles.demoLink}>
              <span className={styles.demoLinkIcon}>👀</span>
              Explore demo mode (no account needed)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
