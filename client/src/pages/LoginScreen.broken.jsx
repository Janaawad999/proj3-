import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { User, Lock, ArrowRight, Mail, UserPlus } from 'lucide-react';

const LoginScreen = () => {
const [isSignUp, setIsSignUp] = useState(false);


const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const navigate = useNavigate();

const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
};

const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
        if (isSignUp) {
            // Validate passwords
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Register new user
            await authService.register(name, email, password);

            // Get registered user
            const user = authService.getCurrentUser();

            if (!user) {
                throw new Error('Registration failed');
            }

            // Redirect based on role
            if (user.role === 'MANAGER') {
                navigate('/');
            } else {
                navigate('/collector/tasks');
            }
        } else {
            // Login
            await authService.login(email, password);

            const user = authService.getCurrentUser();

            if (!user) {
                throw new Error('User data not found');
            }

            if (user.role === 'MANAGER') {
                navigate('/');
            } else {
                navigate('/collector/tasks');
            }
        }
    } catch (error) {
        console.error('Authentication error:', error);

        if (error.message === 'Passwords do not match') {
            setError('Passwords do not match.');
        } else if (error.message === 'Password must be at least 6 characters') {
            setError('Password must be at least 6 characters.');
        } else if (isSignUp) {
            setError(
                error.response?.data?.message ||
                'Unable to create account. Please try again.'
            );
        } else {
            setError('Invalid email or password. Please try again.');
        }
    } finally {
        setLoading(false);
    }
};

return (
    <div
        style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-page)',
            padding: '2rem'
        }}
    >
        <div
            style={{
                width: '100%',
                maxWidth: '440px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: '2.5rem 2rem 2rem',
                    textAlign: 'center',
                    borderBottom: '1px solid var(--border)'
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        width: '64px',
                        height: '64px',
                        margin: '0 auto 1.5rem',
                        background:
                            'linear-gradient(135deg, #E0AA3E 0%, #F5C451 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#000000',
                        letterSpacing: '1px'
                    }}
                >
                    <img
                      src="/assets/logo.png"
                      alt="MONTERA"
                      style={{
                         width: '180px',
                         height: 'auto',
                         objectFit: 'contain',
                          marginBottom: '1rem'
                    }}
            />
            </div>

            {/* Form */}
            <div style={{ padding: '2rem' }}>
                <h2
                    style={{
                        margin: '0 0 1.5rem',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                    }}
                >
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>

                <form onSubmit={handleSubmit}>

                    {/* Name - Sign Up only */}
                    {isSignUp && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                Full Name
                            </label>

                            <div style={{ position: 'relative' }}>
                                <User
                                    size={18}
                                    color="var(--text-muted)"
                                    style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none'
                                    }}
                                />

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px 12px 44px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--bg-input)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: 'var(--text-muted)'
                            }}
                        >
                            Email
                        </label>

                        <div style={{ position: 'relative' }}>
                            <Mail
                                size={18}
                                color="var(--text-muted)"
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }}
                            />

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 14px 12px 44px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-input)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: 'var(--text-muted)'
                            }}
                        >
                            Password
                        </label>

                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={18}
                                color="var(--text-muted)"
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }}
                            />

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 14px 12px 44px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-input)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {/* Confirm Password - Sign Up only */}
                    {isSignUp && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                Confirm Password
                            </label>

                            <div style={{ position: 'relative' }}>
                                <Lock
                                    size={18}
                                    color="var(--text-muted)"
                                    style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none'
                                    }}
                                />

                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm your password"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px 12px 44px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--bg-input)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Forgot Password */}
                    {!isSignUp && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                style={{
                                    color: '#E0AA3E',
                                    fontSize: '0.85rem',
                                    textDecoration: 'none',
                                    fontWeight: '500'
                                }}
                            >
                                Forgot username or password?
                            </a>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                border: '1px solid rgba(220, 38, 38, 0.3)',
                                color: '#fca5a5',
                                padding: '12px 14px',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Main Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: loading
                                ? '#ccaa44'
                                : '#E0AA3E',
                            color: '#000000',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading
                                ? 'not-allowed'
                                : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? (
                            'Please wait...'
                        ) : isSignUp ? (
                            <>
                                Create Account
                                <UserPlus size={20} />
                            </>
                        ) : (
                            <>
                                Log In
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Switch Login / Sign Up */}
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid var(--border)',
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)'
                    }}
                >
                    {isSignUp
                        ? 'Already have an account? '
                        : "Don't have an account? "}

                    <button
                        type="button"
                        onClick={switchMode}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: '#E0AA3E',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {isSignUp ? 'Log In' : 'Sign Up'}
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div
                style={{
                    padding: '1.5rem 2rem',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    borderTop: '1px solid var(--border)'
                }}
            >
                <p style={{ margin: '0 0 0.25rem' }}>
                    Version 1.0.0
                </p>

                <p style={{ margin: 0 }}>
                    Contact IT Support for access issues.
                </p>
            </div>
        </div>
    </div>
);


};

export default LoginScreen;
