import React, { useState } from 'react';
import {Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { saveUserData } from '../../utilities/auth';
import { API_BASE_URL } from '../../services/apiBase';
import { Mail, Lock, Eye, EyeOff } from 'react-feather';

// Simple login page styles
const loginStyles = `
  .login-wrapper {
    min-height: 100vh;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .login-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    max-width: 400px;
    width: 100%;
  }

  .login-header {
    background: #f8f9fa;
    padding: 30px;
    text-align: center;
    border-bottom: 1px solid #e9ecef;
  }

  .login-header h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    color: #333;
  }

  .login-body {
    padding: 30px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    font-weight: 500;
    color: #495057;
    font-size: 13px;
    margin-bottom: 6px;
    display: block;
  }

  .form-control-wrapper {
    position: relative;
  }

  .form-control-wrapper .form-control {
    height: 40px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 10px 12px;
    font-size: 14px;
    transition: border-color 0.2s;
    background: white;
  }

  .form-control-wrapper .form-control:focus {
    background: white;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .form-control-wrapper .input-icon {
    display: none;
  }

  .password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .password-toggle:hover {
    color: #495057;
  }

  .remember-forgot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 13px;
  }

  .form-check-input {
    width: 16px;
    height: 16px;
    border-color: #dee2e6;
    cursor: pointer;
    margin-top: 2px;
  }

  .form-check-input:checked {
    background-color: #007bff;
    border-color: #007bff;
  }

  .login-btn {
    height: 40px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    width: 100%;
    transition: background 0.2s;
    margin-bottom: 0;
  }

  .login-btn:hover:not(:disabled) {
    background: #0056b3;
  }

  .login-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .alert {
    border-radius: 4px;
    border: 1px solid #f5c6cb;
    background: #f8d7da;
    color: #721c24;
    margin-bottom: 15px;
    font-size: 13px;
  }
`;

const AuthLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check for remembered credentials on component mount
  React.useEffect(() => {
    const rememberedEmailOrPhone = localStorage.getItem('rememberedEmailOrPhone');
    if (rememberedEmailOrPhone) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmailOrPhone,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
      email: formData.email,
      password: formData.password
    });

    console.log('Login response:', response.data); // Debug log

    // Extract data from StandardResponseMixin format: { success, message, data: {...} }
    const responseData = response.data?.data || response.data;

    // Extract tokens and user from response
    const accessToken = responseData?.access;
    const refreshToken = responseData?.refresh;
    const userData = responseData?.user;

    // Store tokens with correct keys that match courseApi.js
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('authToken', accessToken); // Keep for backward compatibility
    } else {
      throw new Error('No access token received from server');
    }

    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('refreshToken', refreshToken); // Keep for backward compatibility
    }

    // Store user data with correct key that matches auth.js utilities
    if (userData) {
      saveUserData(userData); // Uses 'user' key
      localStorage.setItem('userData', JSON.stringify(userData)); // Keep for backward compatibility
      console.log('User data saved:', userData); // Debug log
    } else {
      throw new Error('No user data received from server');
    }

    // Remember me
    if (formData.rememberMe) {
      localStorage.setItem('rememberedEmailOrPhone', formData.email);
    } else {
      localStorage.removeItem('rememberedEmailOrPhone');
    }

    console.log('Login successful, redirecting to dashboard...'); // Debug log

    // Redirect to dashboard
    navigate('/dashboard', { replace: true });

  } catch (err) {
    console.error('Login error:', err); // Debug log
    if (err.response) {
      const errorMessage =
        err.response.data?.error ||
        err.response.data?.message ||
        err.response.data?.detail ||
        'Login failed. Please try again.';
      setError(errorMessage);
    } else if (err.message) {
      setError(err.message);
    } else {
      setError('Network error. Please check your connection.');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <style>{loginStyles}</style>
      <div className="login-wrapper">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <h1>Admin Login</h1>
          </div>

          {/* Body */}
          <div className="login-body">
            {error && (
              <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="form-control-wrapper">
                  <Form.Control
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="form-control-wrapper">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="remember-forgot">
                <Form.Check
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  label="Remember me"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="login-btn"
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLoginPage;