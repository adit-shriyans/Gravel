'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (response.ok) {
        router.push('/');
      } else {
        try {
          const data = await response.json();
          setError(data.message || 'Something went wrong');
        } catch (parseError) {
          setError('Registration failed');
        }
      }
    } catch (err) {
      setError('An error occurred during registration');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      await handleRegister(e);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        router.push('/');
      } else {
        try {
          const data = await response.json();
          setError(data.message || 'Something went wrong');
        } catch (parseError) {
          setError('Invalid credentials');
        }
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  const handleGoogleLogin = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      setError('Google login is not configured');
      return;
    }
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/google/callback')}&response_type=code&scope=profile email`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="login-form-container">
      <div className="login-form-card">
        <div>
          <h2>
            {isSignUp ? 'Create an account' : 'Sign in to your account'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="input-group">
            {isSignUp && (
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="remember-me">
            <div>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
              />
              <label htmlFor="remember-me">
                Remember me
              </label>
            </div>

            {!isSignUp && (
              <div>
                <a href="#">
                  Forgot your password?
                </a>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
            >
              {isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </div>

          <div className="or-divider">
            <div className="line">
              <div />
            </div>
            <div className="text">
              <span>
                  Or continue with
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={handleGoogleLogin}
              className="google-login-button"
            >
              <span className="sr-only">Sign in with Google</span>
              <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.252z" />
              </svg>
            </button>
          </div>

          <div className="toggle-signup">
            <div className="line">
              <div />
            </div>
            <div className="text">
              <span>
                {isSignUp ? 'Already have an account?' : 'New to Gravel?'}
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign in' : 'Create an account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
